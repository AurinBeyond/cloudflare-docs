"""§GOVERNANCE-ALERTS 2026-02-11 — Email alerting for runtime ratio.

Anna's directive: "I should not need to watch the dashboard manually."

This module sends email alerts via Resend when the governance ratio
(vendor headroom vs customer debt) drops below thresholds:

  - WARN     at < 1.5x  — calm reminder, "consider topping up soon"
  - CRITICAL at < 1.2x  — urgent, "top up immediately or block customers"

Idempotency: each level can only send ONCE per 4-hour window. The
state is stored in MongoDB collection `governance_alert_state` with
key `{level: "warn"|"critical", last_sent_at: ISO}`. Recovery to
green automatically clears the state so the next dip re-fires.

Recipient: env GOVERNANCE_ALERT_EMAIL (defaults to FOUNDER_EMAIL
if set, else hard-coded fallback).

Send mechanism: existing Resend integration (email_service.send_email).
If Resend is down, alert is logged to backend.err.log with prefix
`[GOVERNANCE-ALERT]` so Anna can grep for them.

Entrypoint: `check_and_send_alerts(db)` — called by the existing
admin governance status endpoint every time it's polled, so the
60-second auto-refresh in /admin/finance triggers the check too.
That means alerts fire WITHOUT needing a separate cron — the
dashboard's heartbeat is the trigger.
"""

from __future__ import annotations

import os
import logging
from datetime import datetime, timezone, timedelta
from typing import Optional, Any

logger = logging.getLogger("aurin.governance.alerts")

ALERT_WINDOW_HOURS = 4


def _alert_recipient() -> str:
    return (
        os.environ.get("GOVERNANCE_ALERT_EMAIL")
        or os.environ.get("FOUNDER_EMAIL")
        or "info@prulesoul.site"
    )


def _level_from_ratio(ratio: float) -> Optional[str]:
    """Map ratio → alert level. Returns None if all clear.

    Thresholds are env-configurable for testing:
      GOVERNANCE_ALERT_WARN_RATIO     (default 1.5)
      GOVERNANCE_ALERT_CRITICAL_RATIO (default 1.2)
    """
    try:
        crit = float(os.environ.get("GOVERNANCE_ALERT_CRITICAL_RATIO") or 1.2)
    except (TypeError, ValueError):
        crit = 1.2
    try:
        warn = float(os.environ.get("GOVERNANCE_ALERT_WARN_RATIO") or 1.5)
    except (TypeError, ValueError):
        warn = 1.5
    if ratio < crit:
        return "critical"
    if ratio < warn:
        return "warn"
    return None


async def _should_send(db: Any, level: str) -> bool:
    """Idempotency check — has this level been alerted in the last
    ALERT_WINDOW_HOURS hours?"""
    try:
        doc = await db.governance_alert_state.find_one(
            {"level": level}, {"_id": 0}
        )
    except Exception as exc:  # noqa: BLE001
        logger.warning("alert state read failed: %s", exc)
        return True  # fail-open: send the alert
    if not doc:
        return True
    last_iso = doc.get("last_sent_at")
    if not last_iso:
        return True
    try:
        last = datetime.fromisoformat(last_iso)
    except (ValueError, TypeError):
        return True
    if last.tzinfo is None:
        last = last.replace(tzinfo=timezone.utc)
    age = datetime.now(timezone.utc) - last
    return age >= timedelta(hours=ALERT_WINDOW_HOURS)


async def _mark_sent(db: Any, level: str) -> None:
    try:
        await db.governance_alert_state.update_one(
            {"level": level},
            {"$set": {
                "level": level,
                "last_sent_at": datetime.now(timezone.utc).isoformat(),
            }},
            upsert=True,
        )
    except Exception as exc:  # noqa: BLE001
        logger.warning("alert state write failed: %s", exc)


async def _clear_level(db: Any, level: str) -> None:
    """When ratio recovers above threshold, clear so next dip re-alerts."""
    try:
        await db.governance_alert_state.delete_one({"level": level})
    except Exception as exc:  # noqa: BLE001
        logger.warning("alert state clear failed: %s", exc)


def _build_email(level: str, snapshot: dict) -> tuple[str, str]:
    """Return (subject, html_body)."""
    ratio = snapshot.get("vendor_headroom", {}).get("headroom_vs_debt_ratio", 0)
    debt_min = snapshot.get("customer_debt", {}).get("total_owed_minutes", 0)
    vendor_min = snapshot.get("vendor_headroom", {}).get("elevenlabs_remaining_minutes_est", 0)
    debt_cost = snapshot.get("customer_debt", {}).get("projected_vendor_cost_usd", 0)
    chars_left = snapshot.get("vendor_headroom", {}).get("elevenlabs_remaining_chars", 0)

    if level == "critical":
        subject = f"🔴 Aurin — Runtime CRITICAL · ratio {ratio:.2f}x"
        intro = (
            "Vendor reserves are no longer comfortably covering what you "
            "owe customers. Voice sessions may start failing soon."
        )
        action = (
            "<strong>Action:</strong> Top up ElevenLabs immediately "
            "(~$30 manual recharge), then refresh /admin/finance."
        )
    else:
        subject = f"🟡 Aurin — Runtime watch zone · ratio {ratio:.2f}x"
        intro = (
            "Vendor reserves are tight relative to customer voice credits. "
            "Not urgent, but plan a top-up in the next 24-48h."
        )
        action = (
            "<strong>Action:</strong> Consider topping up ElevenLabs by "
            "~$20-30 to restore green zone (≥3x ratio)."
        )

    html = f"""\
<!doctype html>
<html><body style="font-family:Georgia,serif;color:#3a2c1c;max-width:560px;margin:0 auto;padding:20px;background:#f8efde;">
  <p style="font-size:14px;letter-spacing:0.2em;color:#7a6244;text-transform:uppercase;">Runtime Governance</p>
  <h2 style="font-family:'Caveat',cursive;font-size:32px;margin:8px 0 16px;">{subject}</h2>
  <p>{intro}</p>
  <hr style="border:0;border-top:1px solid rgba(80,60,30,0.18);margin:18px 0;">
  <table style="width:100%;font-size:14px;">
    <tr><td style="padding:4px 0;color:#7a6244;">Headroom/Debt ratio</td><td style="text-align:right;"><strong>{ratio:.2f}x</strong></td></tr>
    <tr><td style="padding:4px 0;color:#7a6244;">Customer debt</td><td style="text-align:right;">{debt_min:.1f} min · ${debt_cost:.2f} projected</td></tr>
    <tr><td style="padding:4px 0;color:#7a6244;">Vendor headroom</td><td style="text-align:right;">~{vendor_min:.0f} min · {chars_left:,} chars</td></tr>
  </table>
  <hr style="border:0;border-top:1px solid rgba(80,60,30,0.18);margin:18px 0;">
  <p>{action}</p>
  <p style="font-size:12px;color:#7a6244;margin-top:24px;">
    Sent automatically by the Aurin governance layer. Next alert
    blocked for {ALERT_WINDOW_HOURS} hours to avoid spam.
  </p>
</body></html>
"""
    return subject, html


async def check_and_send_alerts(db: Any, snapshot: dict) -> dict:
    """Inspect snapshot, fire alerts if needed, return diagnostic info."""
    ratio = float(snapshot.get("vendor_headroom", {}).get("headroom_vs_debt_ratio", 999))
    level = _level_from_ratio(ratio)

    result = {
        "ratio": ratio,
        "level": level,
        "sent": False,
        "reason": "all_clear",
    }

    # If we're healthy, clear any previously-fired alert state so
    # the NEXT dip will re-alert immediately rather than waiting
    # out the 4-hour window.
    if level is None:
        await _clear_level(db, "warn")
        await _clear_level(db, "critical")
        result["reason"] = "ratio_above_thresholds_state_cleared"
        return result

    # Idempotency check
    if not await _should_send(db, level):
        result["reason"] = f"within_{ALERT_WINDOW_HOURS}h_window_skip"
        return result

    # Send via Resend
    subject, html = _build_email(level, snapshot)
    recipient = _alert_recipient()
    try:
        from email_service import send_email
        send_result = await send_email(
            to=recipient,
            subject=subject,
            html=html,
            db=db,
            bypass_suppression=True,  # founder alerts must always send
        )
        ok = bool(send_result and (send_result.get("delivered") or send_result.get("id")))
        logger.warning(
            "[GOVERNANCE-ALERT] level=%s ratio=%.2f to=%s delivered=%s",
            level, ratio, recipient, ok,
        )
        if ok:
            await _mark_sent(db, level)
            result["sent"] = True
            result["reason"] = "sent_via_resend"
        else:
            result["reason"] = f"resend_failed: {send_result}"
    except Exception as exc:  # noqa: BLE001
        # Log loudly so Anna can grep backend.err.log for it.
        logger.error(
            "[GOVERNANCE-ALERT] level=%s ratio=%.2f to=%s "
            "FAILED_TO_SEND exc=%s",
            level, ratio, recipient, exc,
        )
        result["reason"] = f"exception: {exc}"

    return result
