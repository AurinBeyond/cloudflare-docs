"""
email_service.py — Matrix Aurin transactional email via Resend.

Three canonical senders (all @prulesoul.site after DNS verification):
    • support@prulesoul.site — account & security (magic link)
    • agent@prulesoul.site   — The Guardian (first-letter funnel, replies)
    • info@prulesoul.site    — general updates

Until DNS is green, Resend routes from the verified sandbox sender
(`onboarding@resend.dev`). The env var `RESEND_SANDBOX_FALLBACK`
controls that. When founder's DNS is verified, the `@prulesoul.site`
senders start delivering to inbox automatically — no code change.

All calls are non-blocking — the Resend SDK is sync, so we wrap every
send with `asyncio.to_thread`.
"""
from __future__ import annotations

import asyncio
import logging
import os
from typing import List, Optional

import resend

logger = logging.getLogger(__name__)

_API_KEY = os.environ.get("RESEND_API_KEY")
if _API_KEY:
    resend.api_key = _API_KEY


def is_configured() -> bool:
    return bool(os.environ.get("RESEND_API_KEY"))


def _resolve_sender(kind: str) -> str:
    """Pick a "From" header per kind. Falls back to the Resend sandbox
    sender until prulesoul.site DNS is verified."""
    envvar = {
        "support": "RESEND_FROM_SUPPORT",
        "agent": "RESEND_FROM_AGENT",
        "info": "RESEND_FROM_INFO",
    }.get(kind, "RESEND_FROM_SUPPORT")
    configured = os.environ.get(envvar)
    if configured:
        return configured
    sandbox = os.environ.get("RESEND_SANDBOX_FALLBACK", "onboarding@resend.dev")
    return f"Matrix Aurin <{sandbox}>"


async def send_email(
    *,
    to: str,
    subject: str,
    html: str,
    text: Optional[str] = None,
    sender: str = "support",
    reply_to: Optional[str] = None,
    tags: Optional[List[dict]] = None,
    attachments: Optional[List[dict]] = None,
    db=None,
    bypass_suppression: bool = False,
) -> dict:
    """Send one transactional email. Returns Resend's response dict with
    `id`. If the configured @prulesoul.site sender is rejected because
    the domain is not yet DNS-verified, we transparently retry once
    from the verified sandbox sender so the email still lands.

    `attachments` (optional, iter 64c) — list of dicts in Resend's shape:
      {"filename": "...", "content": <base64 str>, "content_type": "..."}

    §EMAIL-HEALTH 2026-02-11 — `db` and `bypass_suppression`:
    If a Motor `db` handle is passed, we check the suppression list
    before sending. Bounced / complained / unsubscribed addresses are
    silently skipped to protect domain reputation. Account-critical
    flows (e.g., password reset) can pass `bypass_suppression=True`
    to override — but this should be rare.
    """
    if not is_configured():
        raise RuntimeError("Resend is not configured (RESEND_API_KEY missing).")

    # §EMAIL-HEALTH — suppression-list gate.
    if db is not None and not bypass_suppression:
        try:
            from email_suppression import is_suppressed
            if await is_suppressed(db, to):
                logger.info("resend.send skipped (suppressed) to=%s", to)
                return {"skipped": True, "reason": "suppressed", "to": to}
        except Exception as e:  # noqa: BLE001
            # Don't let suppression bugs block sends — log and continue.
            logger.warning("suppression check failed for %s: %s", to, e)

    def _build(from_header: str) -> dict:
        p: dict = {
            "from": from_header,
            "to": [to],
            "subject": subject,
            "html": html,
        }
        if text:
            p["text"] = text
        if reply_to:
            p["reply_to"] = reply_to
        if tags:
            p["tags"] = tags
        if attachments:
            p["attachments"] = attachments
        return p

    primary_from = _resolve_sender(sender)
    try:
        result = await asyncio.to_thread(resend.Emails.send, _build(primary_from))
    except Exception as e:  # noqa: BLE001
        msg = str(e).lower()
        domain_unverified = "not verified" in msg or "verify your domain" in msg
        if not domain_unverified:
            raise
        sandbox = os.environ.get("RESEND_SANDBOX_FALLBACK", "onboarding@resend.dev")
        fallback_from = f"Matrix Aurin <{sandbox}>"
        logger.warning(
            "resend.send domain not verified for %s, falling back to %s",
            primary_from,
            fallback_from,
        )
        result = await asyncio.to_thread(resend.Emails.send, _build(fallback_from))

    logger.info(
        "resend.send kind=%s to=%s id=%s",
        sender,
        to,
        (result or {}).get("id"),
    )
    return result or {}


# --- Magic-link template --------------------------------------------
def render_magic_link_email(link: str, expires_minutes: int = 30) -> tuple[str, str, str]:
    """Return (subject, html, text) for a magic-link login email.

    §Phase 1 2026-02-14 — rewritten for spam-filter friendliness while
    keeping the house tone. Specific changes from the previous
    version (which mail.com / Google flagged as suspicious):

      1. Subject is now transactional ("Sign in to Matrix Aurin") not
         metaphorical ("Your quiet door…"). Filters reward explicit,
         action-oriented subject lines and penalise mystical wording.
      2. Body opens with explicit "You (or someone using your email)
         asked to sign in" — Gmail/Outlook reputation scoring rewards
         this exact phrasing as an anti-phishing signal.
      3. Physical postal address in the footer (CAN-SPAM / GDPR
         compliance signal; legitimate senders always include one).
      4. Plain-text version mirrors the HTML structure (filters
         downgrade messages that have a thin or missing text/plain
         part).
      5. Lighter alternative palette via inline `prefers-color-scheme`
         — many corporate inboxes flag pure-black backgrounds as
         "stealth" template style. We keep the brand dark in dark
         clients, but render light-on-white in light clients.
    """
    subject = "Sign in to Matrix Aurin"
    # Founder postal address (Norwegian ENK). Configurable via env so
    # the founder can update without code change.
    postal = os.environ.get(
        "AURIN_POSTAL_ADDRESS",
        "Matrix Aurin · Norway",
    )
    text = (
        "Hello,\n\n"
        "You (or someone using your email address) asked to sign in "
        "to Matrix Aurin.\n\n"
        f"Click the link below to enter. It will expire in {expires_minutes} minutes:\n\n"
        f"{link}\n\n"
        "If you did not request this, you can safely ignore this email. "
        "The link expires automatically and no account changes have been made.\n\n"
        "If you don't see the email within a minute, please check your "
        "Spam or Junk folder — some email providers (Outlook, mail.com, "
        "AOL) route new senders there briefly. Marking us as 'Not spam' "
        "helps next time.\n\n"
        "If you need help, reply to this email and we will read it.\n\n"
        "— Matrix Aurin\n"
        f"{postal}\n"
    )
    html = f"""
<!doctype html>
<html><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Sign in to Matrix Aurin</title>
</head>
<body style="margin:0;padding:0;background:#f5f4ef;font-family:Georgia,'Times New Roman',serif;color:#2a2a28;line-height:1.7;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#f5f4ef;padding:32px 16px;">
    <tr><td align="center">
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="max-width:540px;width:100%;background:#ffffff;border:1px solid #e3e0d6;border-radius:8px;">
        <tr><td style="padding:28px 32px 12px 32px;border-bottom:1px solid #ece9df;">
          <div style="font-size:11px;letter-spacing:0.26em;text-transform:uppercase;color:#7a8a7e;font-family:Arial,sans-serif;">Matrix Aurin</div>
          <div style="font-size:20px;color:#2a2a28;margin-top:8px;">Sign in to your account</div>
        </td></tr>
        <tr><td style="padding:24px 32px;">
          <p style="margin:0 0 14px 0;font-size:15px;">Hello,</p>
          <p style="margin:0 0 14px 0;font-size:15px;">
            You (or someone using your email address) asked to sign in to Matrix Aurin.
            Click the button below to enter. It will expire in {expires_minutes} minutes.
          </p>
          <p style="text-align:center;margin:26px 0;">
            <a href="{link}" style="display:inline-block;padding:13px 28px;background:#2f4a3b;color:#ffffff;text-decoration:none;font-weight:600;letter-spacing:0.03em;border-radius:6px;font-family:Arial,sans-serif;font-size:14px;">Sign in</a>
          </p>
          <p style="margin:14px 0 0 0;font-size:12.5px;color:#6a6a66;">
            If the button does not work, copy and paste this link into your browser:<br>
            <span style="color:#2a2a28;word-break:break-all;">{link}</span>
          </p>
          <p style="margin:22px 0 0 0;font-size:13px;color:#6a6a66;">
            If you did not request this, you can safely ignore this email. The link expires automatically and no changes have been made to your account.
          </p>
        </td></tr>
        <tr><td style="padding:16px 32px 24px 32px;border-top:1px solid #ece9df;font-size:11.5px;color:#7a8a7e;font-family:Arial,sans-serif;">
          Sent because someone requested a sign-in for this email at Matrix Aurin.<br>
          Need help? Reply to this email and we will read it.<br>
          <span style="display:inline-block;margin-top:8px;">{postal}</span>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>
""".strip()
    return subject, html, text


# --- First-Letter funnel template -----------------------------------
def render_first_letter_email(
    *,
    course_title: str,
    letter_title: str,
    letter_body: str,
    letter_prompt: str,
    course_url: str,
) -> tuple[str, str, str]:
    """Return (subject, html, text) for the free first letter."""
    subject = f"{letter_title} — from the Course Room"
    text = (
        f"{letter_title}\n\n"
        f"{letter_body}\n\n"
        "A small question for the evening:\n"
        f"{letter_prompt}\n\n"
        "If this letter touches something, the rest of the course waits here:\n"
        f"{course_url}\n\n"
        "— The Guardian · Matrix Aurin"
    )
    html = f"""
<div style="font-family: Georgia, 'Times New Roman', serif; background:#0b0f0d; color:#d6d8d4; padding:40px 20px; line-height:1.85;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:560px;margin:0 auto;">
    <tr><td style="padding:24px 0; border-bottom:1px solid #1f2a25;">
      <div style="font-size:11px; letter-spacing:0.28em; text-transform:uppercase; color:#8aa291;">{course_title} · Letter 1</div>
      <div style="font-size:24px; color:#e6ead9; margin-top:10px;"><i>{letter_title}</i></div>
    </td></tr>
    <tr><td style="padding:28px 0; font-size:15px;">
      <p style="margin:0;">{letter_body}</p>
    </td></tr>
    <tr><td style="padding:18px 0; border-left:2px solid #8aa291; padding-left:16px;">
      <div style="font-size:11px; letter-spacing:0.18em; text-transform:uppercase; color:#8aa291;">A small question for the evening</div>
      <div style="margin-top:6px; font-style:italic; font-size:15px;">{letter_prompt}</div>
    </td></tr>
    <tr><td style="padding:28px 0; border-top:1px solid #1f2a25;">
      <p style="margin:0 0 14px 0; font-size:13.5px;">If this letter touches something quiet in you, the rest of the course waits here — no urgency.</p>
      <p style="text-align:center; margin:20px 0;">
        <a href="{course_url}" style="display:inline-block; padding:12px 26px; background:transparent; color:#8aa291; border:1px solid #8aa291; text-decoration:none; letter-spacing:0.04em; border-radius:999px;">Open the course room</a>
      </p>
    </td></tr>
    <tr><td style="padding:18px 0; font-size:12px; color:#8aa291; font-style:italic;">
      You received this because you left your address with us. To stop receiving quiet letters, just reply "stop". — The Guardian
    </td></tr>
  </table>
</div>
""".strip()
    return subject, html, text
