"""
day_pass_nudge.py — hour-22 upgrade nudge for day-pass holders.

Strategy v2.3.1: when a visitor buys access.day.kids / quiet / deep,
the 24-h credit grant created by the webhook (validity_days=1) names
the grant via source_sku. At hour 22 of the grant, we send a single
gentle Resend transmission with a one-click upgrade-conversion link
that applies the pass cost as credit toward the first cycle of the
matched bundle.

Mapping:
  access.day.kids  → invite to aurin.storyteller (the children's bundle)
  access.day.quiet → invite to quiet.entry
  access.day.deep  → invite to inner.compass

This module exposes a single coroutine `run_once(db)` that scans for
active day-pass grants in the [22h-after-grant, 23h-after-grant] window
that have not yet been nudged, sends the email, and marks them
nudged. Run from your scheduler (cron / APScheduler) every 10 minutes.
"""
from __future__ import annotations

import logging
import os
from datetime import datetime, timezone, timedelta
from typing import Dict, Optional

logger = logging.getLogger(__name__)


UPGRADE_TARGET: Dict[str, Dict[str, str]] = {
    "access.day.kids":  {"target_sku": "aurin.storyteller.month",   "tier_name": "Aurin Storyteller"},
    "access.day.quiet": {"target_sku": "quiet.entry.month",          "tier_name": "Quiet Entry"},
    "access.day.deep":  {"target_sku": "inner.compass.month",        "tier_name": "Inner Compass"},
}

NUDGE_TEMPLATE_SUBJECT = "Your passage closes soon"

NUDGE_TEMPLATE_BODY = """\
The twenty-four hours quiet you stepped into is folding back into
silence within two hours.

If something here held you — if a curator's voice steadied a moment,
or your child fell asleep more gently than expected — the door does
not have to close.

Within seven days of your passage, the price you paid today applies
in full toward {tier_name}. No further charge to that amount;
the architecture simply opens further.

→ {upgrade_url}

If today was only for today, that is honourable too. The passage
expires on its own; nothing recurs.

— Aurin
"""


def _iso_now() -> str:
    return datetime.now(timezone.utc).isoformat()


async def run_once(db, *, resend_send_fn=None) -> Dict[str, int]:
    """Scan for nudgable grants and send up to N nudges.

    `resend_send_fn(to_email, subject, plaintext)` is injected so this
    module is testable. In production we pass server.py's existing
    Resend helper.
    """
    now = datetime.now(timezone.utc)
    # Window: between 22h and 23h after granting → catches everyone
    # exactly once per 10-min scheduler tick.
    window_start = (now - timedelta(hours=23)).isoformat()
    window_end = (now - timedelta(hours=22)).isoformat()

    sent = 0
    skipped = 0

    cursor = db.user_credits.find(
        {
            "source_sku": {"$in": list(UPGRADE_TARGET.keys())},
            "granted_at": {"$gt": window_start, "$lt": window_end},
            "nudge_sent_at": {"$exists": False},
        },
        {"_id": 0},
    )
    grants = await cursor.to_list(length=200)

    for grant in grants:
        sku = grant.get("source_sku", "")
        target = UPGRADE_TARGET.get(sku)
        if not target:
            skipped += 1
            continue
        user_id = grant.get("user_id", "")
        # Resolve user's email — try users collection, fallback to grant
        user_doc = await db.users.find_one({"id": user_id}, {"_id": 0, "email": 1})
        email: Optional[str] = (user_doc or {}).get("email")
        if not email and user_id.startswith("email::"):
            email = user_id.removeprefix("email::")
        if not email:
            skipped += 1
            continue

        base_url = os.environ.get("PUBLIC_BASE_URL", "https://prulesoul.site")
        upgrade_url = (
            f"{base_url}/membership?upgrade_from={sku}&target={target['target_sku']}"
        )
        body = NUDGE_TEMPLATE_BODY.format(
            tier_name=target["tier_name"],
            upgrade_url=upgrade_url,
        )

        try:
            if resend_send_fn is not None:
                await resend_send_fn(email, NUDGE_TEMPLATE_SUBJECT, body)
            else:
                logger.info("[dry-run] would send day-pass nudge to %s for %s", email, sku)
            await db.user_credits.update_one(
                {"grant_id": grant["grant_id"]},
                {"$set": {"nudge_sent_at": _iso_now()}},
            )
            await db.audit_log.insert_one(
                {
                    "kind": "daypass_nudge_sent",
                    "user_id": user_id,
                    "source_sku": sku,
                    "target_sku": target["target_sku"],
                    "to_email": email,
                    "at": _iso_now(),
                }
            )
            sent += 1
        except Exception as exc:  # noqa: BLE001
            logger.warning("Day-pass nudge send failed for %s: %s", email, exc)
            skipped += 1

    return {"sent": sent, "skipped": skipped, "scanned": len(grants)}
