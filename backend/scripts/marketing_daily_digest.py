"""
marketing_daily_digest.py — Sends Anna a single email each morning
with the day's social posts (X / LinkedIn / Instagram), ready to
copy and paste into her existing accounts.

§MARKETING-ENGINE 2026-02-09 — Phase 1 of the marketing automation.
Zero new API keys required: uses the already-configured Resend
account to send the digest. Founder copies and pastes; the system
tracks which days have been emailed.

Usage:
    DRY-RUN (preview to stdout, no email send):
        python3 /app/backend/scripts/marketing_daily_digest.py --dry-run

    REAL SEND to the founder's address:
        python3 /app/backend/scripts/marketing_daily_digest.py --send

    SET THE CAMPAIGN START DATE (one-time, stores in db.marketing_state):
        python3 /app/backend/scripts/marketing_daily_digest.py --start-today

    SEE THE 28-DAY CALENDAR with product coverage:
        python3 /app/backend/scripts/marketing_daily_digest.py --calendar

Cron:
    0 6 * * *  /usr/bin/python3 /app/backend/scripts/marketing_daily_digest.py --send
    (08:00 in Anna's local time, depending on server TZ)
"""

import argparse
import asyncio
import os
import sys
from datetime import datetime, timezone

sys.path.insert(0, "/app/backend")
from dotenv import load_dotenv
load_dotenv("/app/backend/.env")

from email_service import send_email, is_configured  # noqa: E402
from marketing_engine import (  # noqa: E402
    CONTENT_CALENDAR,
    get_today_for_cycle,
    list_posts_by_product,
)
from server import db  # noqa: E402


FOUNDER_EMAIL = os.environ.get("FOUNDER_EMAIL", "anna@prulesoul.site")


def render_digest_html(post: dict, cycle_day: int) -> str:
    """One email, three platform blocks. Designed to be copyable
    directly from Apple Mail or Gmail with formatting preserved."""
    return f"""
<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f8efde;font-family:'Fraunces',Georgia,serif;color:#3d2e15;">
  <div style="max-width:640px;margin:0 auto;padding:36px 28px;background:linear-gradient(180deg,#fbf3df 0%,#f3e6cb 100%);">
    <p style="font-family:'Caveat',cursive;font-size:30px;line-height:1;color:#6a4b1f;margin:0 0 4px 0;">
      Day {cycle_day} · {post['theme']}
    </p>
    <p style="font-size:12px;letter-spacing:0.22em;text-transform:uppercase;color:#7a5a26;margin:0 0 24px 0;">
      Marketing digest · ready to paste
    </p>

    <!-- X / Twitter -->
    <div style="border:1px solid rgba(120,80,30,0.22);border-radius:12px;padding:18px;margin-bottom:14px;background:rgba(255,255,255,0.55);">
      <p style="font-size:11px;letter-spacing:0.2em;text-transform:uppercase;color:#7a5a26;margin:0 0 8px 0;">
        X / Twitter · ≤280 chars
      </p>
      <pre style="white-space:pre-wrap;font-family:'Fraunces',Georgia,serif;font-size:14.5px;line-height:1.55;color:#3d2e15;margin:0;background:transparent;border:none;">{post['x']}</pre>
    </div>

    <!-- LinkedIn -->
    <div style="border:1px solid rgba(120,80,30,0.22);border-radius:12px;padding:18px;margin-bottom:14px;background:rgba(255,255,255,0.55);">
      <p style="font-size:11px;letter-spacing:0.2em;text-transform:uppercase;color:#7a5a26;margin:0 0 8px 0;">
        LinkedIn · longer-form
      </p>
      <pre style="white-space:pre-wrap;font-family:'Fraunces',Georgia,serif;font-size:14.5px;line-height:1.55;color:#3d2e15;margin:0;background:transparent;border:none;">{post['linkedin']}</pre>
    </div>

    <!-- Instagram -->
    <div style="border:1px solid rgba(120,80,30,0.22);border-radius:12px;padding:18px;margin-bottom:14px;background:rgba(255,255,255,0.55);">
      <p style="font-size:11px;letter-spacing:0.2em;text-transform:uppercase;color:#7a5a26;margin:0 0 8px 0;">
        Instagram · pair with a calm image
      </p>
      <pre style="white-space:pre-wrap;font-family:'Fraunces',Georgia,serif;font-size:14.5px;line-height:1.55;color:#3d2e15;margin:0;background:transparent;border:none;">{post['instagram']}</pre>
    </div>

    <p style="font-size:14px;line-height:1.65;color:#5a4a26;margin:24px 0 8px 0;">
      Featured product: <strong>{post['product']}</strong> · <a href="{post['link']}" style="color:#6a4b1f;">{post['link']}</a>
    </p>
    <p style="font-size:12.5px;line-height:1.6;color:#8a7848;margin:16px 0 0 0;font-style:italic;">
      No rush. If today doesn't feel right, skip it — tomorrow's
      post is already waiting. Walk gently.
    </p>

    <hr style="border:none;border-top:1px solid rgba(120,80,30,0.18);margin:24px 0;">
    <p style="font-size:11.5px;color:#8a7848;line-height:1.6;margin:0;">
      You are receiving this because you turned on the marketing
      digest. To pause, reply with the word "pause".
    </p>
  </div>
</body></html>
""".strip()


def render_digest_text(post: dict, cycle_day: int) -> str:
    return (
        f"Day {cycle_day} · {post['theme']}\n"
        f"==========================================\n\n"
        f"-- X / Twitter (≤280 chars) --\n{post['x']}\n\n"
        f"-- LinkedIn (longer-form) --\n{post['linkedin']}\n\n"
        f"-- Instagram (pair with a calm image) --\n{post['instagram']}\n\n"
        f"Featured product: {post['product']}\n"
        f"Link: {post['link']}\n\n"
        f"Walk gently.\n"
    )


async def get_or_set_campaign_start(start_today: bool = False) -> datetime:
    """Reads (or sets) the campaign-start date from db.marketing_state.
    Single-doc collection — _id='campaign'."""
    coll = db.marketing_state
    if start_today:
        now = datetime.now(timezone.utc)
        await coll.update_one(
            {"_id": "campaign"},
            {"$set": {"start_date": now.isoformat()}},
            upsert=True,
        )
        return now
    doc = await coll.find_one({"_id": "campaign"}, {"_id": 0, "start_date": 1})
    if doc and doc.get("start_date"):
        return datetime.fromisoformat(doc["start_date"])
    # Default: today is day 1.
    now = datetime.now(timezone.utc)
    await coll.update_one(
        {"_id": "campaign"},
        {"$set": {"start_date": now.isoformat()}},
        upsert=True,
    )
    return now


async def record_sent(cycle_day: int, dry_run: bool) -> None:
    if dry_run:
        return
    await db.marketing_state.update_one(
        {"_id": "campaign"},
        {"$push": {"sent_log": {
            "cycle_day": cycle_day,
            "sent_at": datetime.now(timezone.utc).isoformat(),
        }}},
        upsert=True,
    )


async def send_today(dry_run: bool = True) -> dict:
    start = await get_or_set_campaign_start()
    today = datetime.now(timezone.utc)
    delta_days = (today.date() - start.date()).days
    cycle_day = (delta_days % 28) + 1
    post = get_today_for_cycle(start, today=today)
    if not post:
        return {"ok": False, "reason": "no_post_for_today"}

    html = render_digest_html(post, cycle_day)
    text = render_digest_text(post, cycle_day)
    subject = f"Day {cycle_day} · {post['theme']} (marketing digest)"

    if dry_run:
        print("=" * 64)
        print(subject)
        print("=" * 64)
        print(text)
        return {"ok": True, "dry_run": True, "cycle_day": cycle_day, "html_len": len(html)}

    if not is_configured():
        return {"ok": False, "reason": "resend_not_configured"}

    r = await send_email(
        to=FOUNDER_EMAIL,
        subject=subject,
        html=html,
        text=text,
        sender="agent",
        tags=[{"name": "campaign", "value": "marketing-daily-digest"}],
    )
    await record_sent(cycle_day, dry_run=False)
    return {"ok": True, "sent": True, "cycle_day": cycle_day,
            "resend_id": (r or {}).get("id"), "to": FOUNDER_EMAIL}


def print_calendar() -> None:
    print("\n28-day marketing calendar — Prulesoul\n" + "=" * 60)
    for entry in CONTENT_CALENDAR:
        print(f"  Day {entry['day']:>2}  ·  {entry['theme']:<48s}  ·  {entry['product']}")
    print("\nProduct coverage:")
    for product, days in sorted(list_posts_by_product().items(),
                                key=lambda kv: -len(kv[1])):
        print(f"  {product:<32s}  →  {len(days)}x  (days {days})")
    print()


async def main():
    p = argparse.ArgumentParser()
    p.add_argument("--dry-run", action="store_true", default=True)
    p.add_argument("--send", dest="dry_run", action="store_false")
    p.add_argument("--start-today", action="store_true",
                   help="Reset the campaign start date to today.")
    p.add_argument("--calendar", action="store_true",
                   help="Print the full 28-day calendar and exit.")
    args = p.parse_args()

    if args.calendar:
        print_calendar()
        return

    if args.start_today:
        d = await get_or_set_campaign_start(start_today=True)
        print(f"Campaign start date set to {d.isoformat()}")
        return

    r = await send_today(dry_run=args.dry_run)
    if args.dry_run:
        print("\n[dry-run]", {k: v for k, v in r.items() if k != "html_len"})
    else:
        print("[sent]", r)


if __name__ == "__main__":
    asyncio.run(main())
