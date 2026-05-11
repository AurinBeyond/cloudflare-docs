"""Iter 64c — Email the PSL copy replacement table to the LP maintainer.

Sends a clean HTML email containing:
  • The terminology audit table (allowed vs forbidden phrasing)
  • The PSL replacement-copy table (drop-in safe alternatives)
  • A link to the source SYNC_REPORT_ITER64.md for the full context
  • The two P0 launch blockers the LP side owns

Usage:  python /app/backend/scripts/email_psl_copy_pack.py [recipient]

If no recipient argument, falls back to FOUNDER_EMAIL or
support@prulesoul.site.
"""
from __future__ import annotations

import asyncio
import os
import sys
from pathlib import Path

from dotenv import load_dotenv

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / "backend"))
load_dotenv(ROOT / "backend" / ".env")

from email_service import send_email, is_configured  # noqa: E402


HTML = """\
<div style="font-family:Helvetica,Arial,sans-serif;color:#1f2a24;
            line-height:1.55;font-size:14px;max-width:680px;
            background:#fafbf9;padding:24px;border-radius:8px;
            border:1px solid #e5e9e6">

  <p style="font-size:11px;letter-spacing:0.15em;text-transform:uppercase;
            color:#6e7c75;margin:0 0 4px 0">Matrix Aurin · Iter 64c</p>
  <h2 style="font-size:20px;line-height:1.3;margin:0 0 14px 0;
             color:#0e1814;font-weight:600">
    PSL ↔ AH copy alignment — drop-in replacements
  </h2>

  <p>Hello,</p>
  <p>This is the terminology and copy alignment pack for prulesoul.site.
     The hub side (the deployed app at the same domain) is now grounded
     and free of overpromise language. Whatever the landing page says
     about memory, mentor, support, or visuals must match — or fall
     <em>under</em> — what the app actually delivers. Anything more
     dramatic on the LP than what the app delivers is a trust risk.</p>

  <h3 style="font-size:15px;margin:22px 0 6px 0;color:#163026">
    1 · Forbidden phrasing → calm replacements
  </h3>
  <p style="font-size:13px;color:#444;margin:0 0 10px 0">
    Search-and-replace the LP for any of the left column. Replace with
    the right column.</p>

  <table cellspacing="0" cellpadding="0"
         style="border-collapse:collapse;width:100%;font-size:12.5px;
                background:#fff;border:1px solid #d8ddd9;
                border-radius:6px;overflow:hidden">
    <thead>
      <tr style="background:#eef3ef">
        <th style="text-align:left;padding:8px 10px;border-bottom:1px solid #d8ddd9;
                   color:#163026">Old / risky LP language</th>
        <th style="text-align:left;padding:8px 10px;border-bottom:1px solid #d8ddd9;
                   color:#163026">Replace with</th>
      </tr>
    </thead>
    <tbody>
      <tr><td style="padding:8px 10px;border-bottom:1px solid #eef0ee">
        "24/7 AI support" / "always-on AI helper"
      </td><td style="padding:8px 10px;border-bottom:1px solid #eef0ee">
        Read the FAQ for fast answers, or write to us through Reach Out
        — a real person replies within a few days.
      </td></tr>
      <tr><td style="padding:8px 10px;border-bottom:1px solid #eef0ee">
        "The mentor remembers everything"
      </td><td style="padding:8px 10px;border-bottom:1px solid #eef0ee">
        The mentor is continuity-aware. Eternal Thread keeps a short
        private note between visits, encrypted, opt-in.
      </td></tr>
      <tr><td style="padding:8px 10px;border-bottom:1px solid #eef0ee">
        "Real hologram" / "live AI hologram"
      </td><td style="padding:8px 10px;border-bottom:1px solid #eef0ee">
        Guide Presence — a calm portrait inside the room (Clarity or Grace).
      </td></tr>
      <tr><td style="padding:8px 10px;border-bottom:1px solid #eef0ee">
        "Permanent memory" / "never forgets"
      </td><td style="padding:8px 10px;border-bottom:1px solid #eef0ee">
        Recent reflection continuity. The thread between your hours.
      </td></tr>
      <tr><td style="padding:8px 10px;border-bottom:1px solid #eef0ee">
        "Human-like consciousness" / "sentient AI"
      </td><td style="padding:8px 10px;border-bottom:1px solid #eef0ee">
        A reflective companion.
      </td></tr>
      <tr><td style="padding:8px 10px;border-bottom:1px solid #eef0ee">
        "Always understands you"
      </td><td style="padding:8px 10px;border-bottom:1px solid #eef0ee">
        A quiet space to hear yourself more clearly.
      </td></tr>
      <tr><td style="padding:8px 10px">"AI therapist" / "psychosomatic AI" /
        "healing AI"
      </td><td style="padding:8px 10px">
        Reflective Guidance · Grounding methods · Calm guidance system.
      </td></tr>
    </tbody>
  </table>

  <h3 style="font-size:15px;margin:22px 0 6px 0;color:#163026">
    2 · Approved terminology lock
  </h3>
  <p style="font-size:13px;color:#444;margin:0 0 8px 0">
    These are the only memory- and mentor-related phrases the hub uses
    today. Please mirror them on the LP without inflation.</p>
  <ul style="font-size:13px;color:#222;margin:0 0 6px 18px;padding:0">
    <li>Guide Presence · Clarity (M) / Grace (F)</li>
    <li>Neural Portrait (the visual layer — static, not animated)</li>
    <li>Reflective Guidance · Structured Reflection · Awareness Practices</li>
    <li>Continuity-aware support · Eternal Thread (opt-in, encrypted, removable)</li>
    <li>Transient Echo (browser-only memory, no server storage)</li>
    <li>Reach Out (the human-reply channel — explicitly NOT 24/7)</li>
  </ul>

  <h3 style="font-size:15px;margin:22px 0 6px 0;color:#163026">
    3 · Two P0 launch blockers — LP / founder side
  </h3>
  <ol style="font-size:13px;color:#222;margin:0 0 8px 18px;padding:0">
    <li><strong>LP copy scan</strong> — sweep for any of the forbidden
        phrasing above. Replace with the right column. This audit cannot
        be done from inside the hub repo; it lives on the LP side.</li>
    <li><strong>LP heartbeat env</strong> —
        <code style="font-family:Menlo,monospace;background:#eef3ef;
                     padding:1px 4px;border-radius:3px">LP_HEARTBEAT_URL</code>
        is currently empty. The symbiosis loop between LP and AH is
        dormant until the LP exposes a heartbeat endpoint and the URL
        is set on the AH side.</li>
  </ol>

  <h3 style="font-size:15px;margin:22px 0 6px 0;color:#163026">
    4 · Catalogue + FAQ are now live
  </h3>
  <p style="font-size:13px;color:#222;margin:0">
    The hub now has a public
    <a href="https://prulesoul.site/catalogue"
       style="color:#2c5645;text-decoration:underline">/catalogue</a>
    and a public
    <a href="https://prulesoul.site/faq"
       style="color:#2c5645;text-decoration:underline">/faq</a>.
    Please link to these from the LP wherever the LP currently uses
    "24/7 AI support" or "browse all products" copy. The FAQ explicitly
    says "We do not run a 24/7 AI helper, and we do not claim to."
    That single line removes the largest trust risk we have right now.
  </p>

  <p style="font-size:12.5px;color:#586b62;font-style:italic;
            margin-top:26px;border-top:1px solid #e5e9e6;padding-top:14px">
    Source of truth: SYNC_REPORT_ITER64.md inside the hub repo.
    If you'd like the full markdown, reply to this email and we'll send it.
  </p>
  <p style="font-size:12.5px;color:#586b62;font-style:italic;margin:6px 0 0 0">
    — Matrix Aurin (E1 stabilization fork)
  </p>
</div>
"""

TEXT = """\
Matrix Aurin · PSL ↔ AH copy alignment

The hub side is grounded. The LP side must match.

FORBIDDEN → REPLACEMENT
- "24/7 AI support" → "Read the FAQ or write through Reach Out — a real person replies within a few days."
- "Remembers everything" → "Continuity-aware. Eternal Thread keeps a short private note between visits, encrypted, opt-in."
- "Real hologram" / "live AI hologram" → "Guide Presence — a calm portrait inside the room."
- "Permanent memory" / "never forgets" → "Recent reflection continuity. The thread between your hours."
- "Human-like consciousness" / "sentient AI" → "A reflective companion."
- "Always understands you" → "A quiet space to hear yourself more clearly."
- "AI therapist" → "Reflective Guidance · Grounding methods · Calm guidance system."

APPROVED LANGUAGE
- Guide Presence · Clarity (M) / Grace (F)
- Neural Portrait
- Reflective Guidance · Structured Reflection · Awareness Practices
- Continuity-aware support · Eternal Thread (opt-in, encrypted, removable)
- Transient Echo
- Reach Out (NOT 24/7)

P0 BLOCKERS — LP SIDE
1. LP copy scan against the table above.
2. LP_HEARTBEAT_URL env value (heartbeat loop is dormant until set).

NEW LIVE ROUTES
- https://prulesoul.site/catalogue
- https://prulesoul.site/faq

— Matrix Aurin
"""


async def main():
    if not is_configured():
        print("ERROR: RESEND_API_KEY not set.")
        sys.exit(1)

    recipient = (sys.argv[1] if len(sys.argv) > 1 else "").strip() or \
        os.environ.get("FOUNDER_EMAIL", "").strip() or \
        os.environ.get("ADMIN_EMAIL", "").strip() or \
        "support@prulesoul.site"

    print(f"Sending PSL copy-alignment pack to {recipient} ...")
    result = await send_email(
        to=recipient,
        subject="Matrix Aurin · PSL ↔ AH copy alignment (drop-in replacements)",
        html=HTML,
        text=TEXT,
        sender="info",
        tags=[{"name": "iter", "value": "64c"}, {"name": "kind", "value": "psl_copy_pack"}],
    )
    print(f"OK · resend id = {result.get('id')}")


if __name__ == "__main__":
    asyncio.run(main())
