#!/usr/bin/env python3
"""
send_audio_announcement.py
==========================

One-off Resend mailing to existing Polarstar Bedtime Stories PDF
buyers, letting them know the FREE Little Star audio companion is now
available at https://prulesoul.site/listen/little-star.

This is a retention-marketing email — early customers learn we
released something extra for them, without paying again, before any
new customer ever sees it.

Usage
-----
Dry-run (default, NEVER sends):
    python3 scripts/send_audio_announcement.py

Dry-run a specific email:
    python3 scripts/send_audio_announcement.py --filter you@example.com

LIVE send (irreversible):
    python3 scripts/send_audio_announcement.py --live

Idempotency
-----------
Each send is logged in MongoDB `polarstar_audio_announcement_sent`
with `{email, sent_at, resend_id}`. Re-running the script (live or
dry) skips any email already in that collection — so you can re-run
safely if the script crashes midway.

Conservative defaults
---------------------
• Default mode is DRY-RUN. Live send requires --live flag.
• Sends only to addresses in `polarstar_purchases` with valid `@`.
• Skips `test=True` Gumroad rows by default (use --include-test to
  include them).
• Rate-limits to 1 send per 1.2 seconds (Resend free tier ceiling).
• Prints a clean summary at the end.

Author: Matrix Aurin agent · iter 86h+ · 2026-02-29
"""
from __future__ import annotations

import argparse
import asyncio
import os
import sys
import time
from datetime import datetime, timezone
from pathlib import Path

# Make `backend` imports available.
HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE.parent / "backend"))

# Load backend .env
from dotenv import load_dotenv  # noqa: E402

load_dotenv(HERE.parent / "backend" / ".env")

from motor.motor_asyncio import AsyncIOMotorClient  # noqa: E402

try:
    import resend  # noqa: E402
except ImportError:
    print("ERROR: `resend` package not installed.")
    sys.exit(1)


# ── Config ───────────────────────────────────────────────────
MONGO_URL = os.environ.get("MONGO_URL")
DB_NAME = os.environ.get("DB_NAME")
RESEND_API_KEY = os.environ.get("RESEND_API_KEY")
FROM_INFO = os.environ.get("RESEND_FROM_INFO", "Polarstar Kids <info@prulesoul.site>")
LISTEN_URL = "https://prulesoul.site/listen/little-star"
PDF_URL = os.environ.get(
    "GUMROAD_PDF_URL",
    "https://prulesoul.site/assets/pdfs/polarstar-bedtime-stories.pdf",
)
RATE_LIMIT_SECONDS = 1.2  # gentle on Resend free tier

# ── Email content ────────────────────────────────────────────
SUBJECT = "We polished one line. And here's a small free gift."

def _build_html(first_name: str | None) -> str:
    greeting = f"Hello {first_name}," if first_name else "Hello,"
    return f"""<!doctype html>
<html><body style="font-family: Georgia, 'Times New Roman', serif; color: #3a2a18; max-width: 560px; margin: 0 auto; padding: 32px 24px; background: #fffbf1; line-height: 1.6;">
  <div style="text-align:center; color:#b97a3a; font-size:11px; letter-spacing:0.32em; text-transform:uppercase; margin-bottom:24px;">
    Polarstar Kids · A small thank-you for early readers
  </div>

  <p style="font-size:17px;">{greeting}</p>

  <p style="font-size:16px;">
    Some weeks ago you bought the <em>Bedtime Stories</em> PDF. Thank
    you. You were one of the first families to read these stories
    aloud, and that means more than I am good at saying.
  </p>

  <p style="font-size:16px;">
    Two small updates for you, both free.
  </p>

  <p style="font-size:16px;">
    <strong>1. A line we polished.</strong> In <em>Little Star</em>,
    the original closing thought sounded a touch like a small lesson
    being explained. The new line trusts the reader more. A fresh
    copy of the PDF is attached to this email. Same five stories,
    one cleaner closing breath.
  </p>

  <p style="font-size:16px;">
    <strong>2. An audio gift.</strong> I read <em>Little Star</em>
    aloud, in my own voice. No music. No app. No account. Just the
    story, the way it would sound at your kitchen table.
  </p>

  <div style="text-align:center; margin: 32px 0;">
    <a href="{LISTEN_URL}"
       style="display:inline-block; padding: 14px 28px; background:#b97a3a; color:#fffbf1; text-decoration:none; border-radius:999px; font-weight:600; font-size:15px; letter-spacing:0.02em;">
      Listen to Little Star
    </a>
  </div>

  <p style="font-size:14px; color:#5b4a32; font-style:italic; text-align:center;">
    No account required. No email signup beyond what you already have.
    Audio plays in the browser.
  </p>

  <hr style="border:none; border-top:1px solid rgba(185,122,58,0.25); margin: 36px 0;" />

  <p style="font-size:14px; color:#5b4a32;">
    If the other four stories would also be welcome in audio one day,
    write back and let me know. The reception of this first one decides
    whether the next four get recorded.
  </p>

  <p style="font-size:14px; color:#5b4a32;">
    With warmth,<br/>
    <em>— Polarstar Kids</em>
  </p>

  <p style="font-size:11px; color:#8a7a5a; margin-top:32px; text-align:center;">
    You are receiving this because you bought the Bedtime Stories PDF
    at <a href="{PDF_URL}" style="color:#8a7a5a;">prulesoul.site/polarstar</a>.
    No further mailings unless you write back and say you would like to hear from us.
  </p>
</body></html>"""


def _build_text(first_name: str | None) -> str:
    greeting = f"Hello {first_name}," if first_name else "Hello,"
    return f"""{greeting}

Some weeks ago you bought the Bedtime Stories PDF. Thank you. You were
one of the first families to read these stories aloud, and that means
more than I am good at saying.

Two small updates for you, both free.

1. A line we polished. In Little Star, the original closing thought
sounded a touch like a small lesson being explained. The new line
trusts the reader more. A fresh copy of the PDF is attached to this
email. Same five stories, one cleaner closing breath.

2. An audio gift. I read Little Star aloud, in my own voice. No
music. No app. No account. Just the story, the way it would sound
at your kitchen table.

    {LISTEN_URL}

No account required. No signup. Audio plays in the browser.

If the other four stories would also be welcome in audio one day,
write back and let me know.

With warmth,
— Polarstar Kids

---
You are receiving this because you bought the Bedtime Stories PDF.
No further mailings unless you write back.
"""


# ── Core ─────────────────────────────────────────────────────
async def gather_recipients(
    client,
    filter_email: str | None,
    include_test: bool,
):
    """Pull unique emails from polarstar_purchases, skip already-sent."""
    db = client[DB_NAME]
    query = {}
    if filter_email:
        query["email"] = filter_email.lower()
    if not include_test:
        query["test"] = {"$ne": True}

    purchase_emails: dict[str, str | None] = {}
    async for doc in db.polarstar_purchases.find(
        query, {"_id": 0, "email": 1, "full_name": 1}
    ):
        em = (doc.get("email") or "").lower().strip()
        if "@" in em and em not in purchase_emails:
            purchase_emails[em] = doc.get("full_name")

    # Skip already-sent
    sent_emails = set()
    async for s in db.polarstar_audio_announcement_sent.find({}, {"_id": 0, "email": 1}):
        sent_emails.add(s["email"])

    recipients = [
        (em, full_name)
        for em, full_name in purchase_emails.items()
        if em not in sent_emails
    ]
    return recipients, len(sent_emails)


async def main():
    parser = argparse.ArgumentParser(description="Send the Little Star audio announcement.")
    parser.add_argument("--live", action="store_true",
                        help="Actually send. Without this flag, runs in DRY-RUN mode.")
    parser.add_argument("--filter", type=str, default=None,
                        help="Limit to a single email (useful for one-person test).")
    parser.add_argument("--include-test", action="store_true",
                        help="Include rows marked test=true in polarstar_purchases.")
    args = parser.parse_args()

    if not MONGO_URL or not DB_NAME:
        print("ERROR: MONGO_URL / DB_NAME missing in env.")
        sys.exit(1)
    if not RESEND_API_KEY:
        print("ERROR: RESEND_API_KEY missing in env.")
        sys.exit(1)

    resend.api_key = RESEND_API_KEY
    client = AsyncIOMotorClient(MONGO_URL)

    recipients, already_sent = await gather_recipients(client, args.filter, args.include_test)

    print()
    print("=" * 60)
    print(f"  Polarstar Audio Announcement — {'LIVE SEND' if args.live else 'DRY RUN'}")
    print("=" * 60)
    print(f"  Already sent (in MongoDB log) ........ {already_sent}")
    print(f"  Pending sends ........................ {len(recipients)}")
    print(f"  Subject .............................. {SUBJECT}")
    print(f"  From ................................. {FROM_INFO}")
    print(f"  Link in body ......................... {LISTEN_URL}")
    print(f"  Rate limit ........................... 1 / {RATE_LIMIT_SECONDS}s")
    print("=" * 60)
    if not recipients:
        print("\nNothing to do. All purchasers already received the announcement.\n")
        client.close()
        return

    print("\nRecipients (first 10):")
    for em, name in recipients[:10]:
        print(f"  • {em}  {f'({name})' if name else ''}")
    if len(recipients) > 10:
        print(f"  • … and {len(recipients) - 10} more")
    print()

    if not args.live:
        print("DRY-RUN complete. Add --live to actually send.\n")
        client.close()
        return

    confirm = input(f"Type 'send' to mail {len(recipients)} recipients: ").strip().lower()
    if confirm != "send":
        print("Aborted.\n")
        client.close()
        return

    db = client[DB_NAME]
    sent_ok = 0
    failed = 0
    for em, full_name in recipients:
        first_name = (full_name or "").split(" ")[0] if full_name else None
        try:
            resp = resend.Emails.send({
                "from": FROM_INFO,
                "to": em,
                "subject": SUBJECT,
                "html": _build_html(first_name),
                "text": _build_text(first_name),
            })
            resend_id = (resp or {}).get("id")
            await db.polarstar_audio_announcement_sent.insert_one({
                "email": em,
                "full_name": full_name,
                "sent_at": datetime.now(timezone.utc).isoformat(),
                "resend_id": resend_id,
                "campaign": "little_star_audio_v1",
            })
            sent_ok += 1
            print(f"  ✓ {em}  →  {resend_id}")
        except Exception as exc:
            failed += 1
            print(f"  ✗ {em}  →  {type(exc).__name__}: {exc}")
        time.sleep(RATE_LIMIT_SECONDS)

    print()
    print("=" * 60)
    print(f"  Sent: {sent_ok} · Failed: {failed} · Total processed: {sent_ok + failed}")
    print("=" * 60)
    print()
    client.close()


if __name__ == "__main__":
    asyncio.run(main())
