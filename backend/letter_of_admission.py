"""
letter_of_admission.py — Body Temple 28 onboarding email.

Sent ONCE per user when they receive the `body_temple_unlock` perk
(currently via guest-key redemption; future Polar webhook path will
reuse the same `send_letter_of_admission` helper). Idempotent —
the `letters_of_admission` collection records each send so the same
user never gets two letters even if their key is re-redeemed or
the webhook fires twice.

Tone: high-luxury house, NOT a standard receipt. The point is
to mark the threshold of admission to Body Temple 28 — a quiet,
deliberate, screen-down course of inner work.

100% English copy. No Estonian.
"""
from __future__ import annotations

import logging
from datetime import datetime, timezone
from typing import Optional

from email_service import is_configured as resend_is_configured
from email_service import send_email

logger = logging.getLogger(__name__)


_SUBJECT = "A quiet letter of admission · Body Temple 28"


def _build_html(recipient_name: Optional[str], cabinet_url: str) -> str:
    """Render the luxurious HTML letter. Inline CSS only (Resend
    strips <style> in many clients)."""
    greeting = "Welcome" if not recipient_name else f"Welcome, {recipient_name}"
    return f"""<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#0b0a08;font-family:'Cormorant Garamond',Georgia,serif;color:#e8e1d5;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#0b0a08;padding:48px 16px;">
    <tr><td align="center">
      <table role="presentation" width="560" cellspacing="0" cellpadding="0" style="max-width:560px;width:100%;background:rgba(18,16,13,0.62);border:1px solid rgba(196,164,107,0.18);border-radius:18px;padding:56px 44px;">
        <tr><td align="center" style="padding-bottom:32px;">
          <p style="margin:0;font-size:11px;letter-spacing:0.42em;text-transform:uppercase;color:#c4a46b;font-family:Georgia,serif;">✦ A quiet letter of admission</p>
        </td></tr>
        <tr><td style="font-family:'Cormorant Garamond',Georgia,serif;font-size:32px;line-height:1.25;font-weight:300;font-style:italic;color:#e8e1d5;text-align:center;padding-bottom:32px;">
          {greeting}.<br/>The doors of Body Temple have opened.
        </td></tr>
        <tr><td style="font-family:'Cormorant Garamond',Georgia,serif;font-size:17px;line-height:1.85;color:#bcb4a3;font-weight:300;padding-bottom:24px;">
          This is not a receipt. It is a threshold.
        </td></tr>
        <tr><td style="font-family:'Cormorant Garamond',Georgia,serif;font-size:16px;line-height:1.85;color:#bcb4a3;font-weight:300;padding-bottom:20px;">
          Body Temple 28 is a four-week, screen-down course of inner work — quiet
          mornings, slow movements, and a deliberate return to your own body.
          You will receive one day at a time, never more than your nervous
          system can hold.
        </td></tr>
        <tr><td style="font-family:'Cormorant Garamond',Georgia,serif;font-size:16px;line-height:1.85;color:#bcb4a3;font-weight:300;padding-bottom:36px;">
          There is no streak to keep. No notifications. No urgency. If you miss
          a day, the day waits. The temple is patient.
        </td></tr>
        <tr><td align="center" style="padding-bottom:40px;">
          <a href="{cabinet_url}" style="display:inline-block;font-family:'Cormorant Garamond',Georgia,serif;font-size:14px;letter-spacing:0.18em;text-transform:uppercase;color:#0b0a08;background:#c4a46b;text-decoration:none;padding:14px 32px;border-radius:999px;font-weight:500;">
            Enter the Temple →
          </a>
        </td></tr>
        <tr><td style="font-family:'Cormorant Garamond',Georgia,serif;font-size:14px;line-height:1.85;color:#7a7468;font-weight:300;font-style:italic;text-align:center;padding-bottom:32px;">
          "None of this is urgent.<br/>
          The rooms do not keep score.<br/>
          You arrive as you are,<br/>
          and you leave when quiet has returned."
        </td></tr>
        <tr><td style="border-top:1px solid rgba(196,164,107,0.10);padding-top:24px;text-align:center;">
          <p style="margin:0;font-size:10.5px;letter-spacing:0.32em;text-transform:uppercase;color:#5a554c;font-family:Georgia,serif;">
            Matrix Aurin · Pure Soul Life<br/>
            A house, not a service.
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>"""


def _build_text(recipient_name: Optional[str], cabinet_url: str) -> str:
    greeting = "Welcome" if not recipient_name else f"Welcome, {recipient_name}"
    return (
        f"{greeting}. The doors of Body Temple have opened.\n\n"
        "This is not a receipt. It is a threshold.\n\n"
        "Body Temple 28 is a four-week, screen-down course of inner work — quiet "
        "mornings, slow movements, and a deliberate return to your own body. "
        "You will receive one day at a time, never more than your nervous "
        "system can hold.\n\n"
        "There is no streak to keep. No notifications. No urgency. If you miss "
        "a day, the day waits. The temple is patient.\n\n"
        f"Enter the temple: {cabinet_url}\n\n"
        "\"None of this is urgent. The rooms do not keep score. You arrive as "
        "you are, and you leave when quiet has returned.\"\n\n"
        "Matrix Aurin · Pure Soul Life\n"
        "A house, not a service."
    )


async def send_letter_of_admission(
    *,
    db,
    user_id: str,
    email: str,
    recipient_name: Optional[str] = None,
    cabinet_url: str = "https://prulesoul.site/body-temple",
    source: str = "body_temple_unlock",
) -> dict:
    """Send Letter of Admission idempotently. Returns dict with status.

    Idempotency: the `letters_of_admission` collection has one row per
    user_id. If a row already exists, we return `{"status": "already_sent"}`
    without contacting Resend.
    """
    if not email:
        return {"status": "skipped", "reason": "no_email"}
    if not resend_is_configured():
        logger.warning("letter_of_admission: Resend not configured, skipping send for %s", user_id)
        return {"status": "skipped", "reason": "resend_not_configured"}

    existing = await db.letters_of_admission.find_one(
        {"user_id": user_id}, {"_id": 0, "id": 1, "sent_at": 1}
    )
    if existing:
        return {"status": "already_sent", **existing}

    html = _build_html(recipient_name, cabinet_url)
    text = _build_text(recipient_name, cabinet_url)

    try:
        resp = await send_email(
            to=email,
            subject=_SUBJECT,
            html=html,
            text=text,
            sender="agent",
            tags=[
                {"name": "kind", "value": "letter_of_admission"},
                {"name": "source", "value": source},
            ],
            db=db,
        )
    except Exception as e:  # noqa: BLE001
        logger.warning("letter_of_admission send failed for %s: %s", user_id, e)
        return {"status": "error", "reason": str(e)}

    if isinstance(resp, dict) and resp.get("skipped"):
        # Suppressed — DO record so we never retry on suppressed users.
        await db.letters_of_admission.insert_one({
            "id": f"loa_{user_id}",
            "user_id": user_id,
            "email": email,
            "sent_at": datetime.now(timezone.utc).isoformat(),
            "source": source,
            "skipped_reason": resp.get("reason"),
        })
        return {"status": "skipped_suppressed"}

    resend_id = (resp or {}).get("id") if isinstance(resp, dict) else None
    await db.letters_of_admission.insert_one({
        "id": f"loa_{user_id}",
        "user_id": user_id,
        "email": email,
        "sent_at": datetime.now(timezone.utc).isoformat(),
        "source": source,
        "resend_id": resend_id,
    })
    logger.info("letter_of_admission sent to %s (user=%s, resend_id=%s)",
                email, user_id, resend_id)
    return {"status": "sent", "resend_id": resend_id}
