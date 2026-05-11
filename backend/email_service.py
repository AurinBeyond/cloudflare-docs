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
) -> dict:
    """Send one transactional email. Returns Resend's response dict with
    `id`. If the configured @prulesoul.site sender is rejected because
    the domain is not yet DNS-verified, we transparently retry once
    from the verified sandbox sender so the email still lands.

    `attachments` (optional, iter 64c) — list of dicts in Resend's shape:
      {"filename": "...", "content": <base64 str>, "content_type": "..."}
    """
    if not is_configured():
        raise RuntimeError("Resend is not configured (RESEND_API_KEY missing).")

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
    """Return (subject, html, text) for a magic-link login email."""
    subject = "Your quiet door into Matrix Aurin"
    text = (
        "A quiet door has opened.\n\n"
        f"Tap this link to enter — it will stay open for {expires_minutes} minutes:\n"
        f"{link}\n\n"
        "If you did not ask for this, nothing happens. The link simply fades.\n\n"
        "— Matrix Aurin"
    )
    html = f"""
<div style="font-family: Georgia, 'Times New Roman', serif; background:#0b0f0d; color:#d6d8d4; padding:40px 20px; line-height:1.75;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:520px;margin:0 auto;">
    <tr><td style="padding:24px 0; border-bottom:1px solid #1f2a25;">
      <div style="font-size:11px; letter-spacing:0.28em; text-transform:uppercase; color:#8aa291;">Matrix Aurin</div>
      <div style="font-size:22px; color:#e6ead9; margin-top:8px;"><i>A quiet door has opened.</i></div>
    </td></tr>
    <tr><td style="padding:28px 0;">
      <p style="margin:0 0 18px 0; font-size:15px;">Tap the button below to step in. The door will wait quietly for {expires_minutes} minutes.</p>
      <p style="text-align:center; margin:28px 0;">
        <a href="{link}" style="display:inline-block; padding:14px 28px; background:#8aa291; color:#0b0f0d; text-decoration:none; font-weight:600; letter-spacing:0.04em; border-radius:999px;">Enter the sanctuary</a>
      </p>
      <p style="margin:18px 0 0 0; font-size:12.5px; color:#8aa291;">If the button does not open, paste this into your browser:<br>
      <span style="color:#d6d8d4; word-break:break-all;">{link}</span></p>
    </td></tr>
    <tr><td style="padding:24px 0; border-top:1px solid #1f2a25; font-size:12px; color:#8aa291; font-style:italic;">
      If you did not ask for this, nothing happens. The link simply fades. — Matrix Aurin
    </td></tr>
  </table>
</div>
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
