"""
body_temple_launch_email.py — Marketing email for Body Temple 28
sent to existing parents who already trust Aurin.

§BODY-TEMPLE-LAUNCH 2026-02-09 — Founder directive (Anna): the
warmest possible audience for Body Temple 28 is the parents who
have already been touched by Aurin via their child's Angel Stars
journey. They have lived experience of the brand's softness.
This script drafts the launch email and provides a dry-run preview
before any send.

Usage:
    DRY-RUN to a single test address:
        python3 /app/backend/scripts/body_temple_launch_email.py --to anna@prulesoul.site

    REAL SEND to every parent with ≥1 child mood check-in:
        python3 /app/backend/scripts/body_temple_launch_email.py --send

The email is intentionally short, intimate, and personally signed
"Anna". Brand guardrails respected: zero "buy now" pressure, no
medical claims, no diagnostic tone.
"""

import argparse
import asyncio
import os
import sys

sys.path.insert(0, "/app/backend")
from dotenv import load_dotenv
load_dotenv("/app/backend/.env")

from email_service import send_email, is_configured  # noqa: E402
from server import db  # noqa: E402


PUBLIC_BASE = os.environ.get("PUBLIC_BASE_URL", "https://prulesoul.site")
SUBJECT = "A small thing I've been carrying for you · Body Temple 28"


def render_html(parent_name: str | None) -> str:
    greeting = f"Dear {parent_name}," if parent_name else "Dear friend,"
    return f"""
<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f8efde;font-family:'Fraunces',Georgia,serif;color:#3d2e15;">
  <div style="max-width:560px;margin:0 auto;padding:36px 28px;background:linear-gradient(180deg,#fbf3df 0%,#f3e6cb 100%);">
    <p style="font-family:'Caveat',cursive;font-size:34px;line-height:1;color:#6a4b1f;margin:0 0 6px 0;">
      Body Temple 28
    </p>
    <p style="font-size:13px;letter-spacing:0.22em;text-transform:uppercase;color:#7a5a26;margin:0 0 28px 0;">
      Four ancient keys · Twenty-eight quiet days
    </p>

    <p style="font-size:16px;line-height:1.65;margin:0 0 16px 0;">{greeting}</p>

    <p style="font-size:16px;line-height:1.65;margin:0 0 14px 0;">
      Your child has been walking with Aurin for a while now. I have
      seen the way you held space for that — gently, without rushing.
    </p>

    <p style="font-size:16px;line-height:1.65;margin:0 0 14px 0;">
      For the last year I have been quietly carrying something for
      <em>you</em>, too. It is finally ready.
    </p>

    <p style="font-size:16px;line-height:1.65;margin:0 0 14px 0;">
      <strong>Body Temple 28</strong> is a four-week journey through four
      ancient keys — <em>breathing, touch, rest, presence</em>. Twenty-eight
      quiet days, each between three and fifteen minutes, each closed by
      a single Socratic question. Never clinical. Never measuring.
    </p>

    <p style="font-size:16px;line-height:1.65;margin:0 0 14px 0;">
      Day 1 is free — read it before you decide anything. If it sits
      well, one unlock ($39, once, yours forever) opens the remaining
      twenty-seven days at your own pace.
    </p>

    <div style="margin:32px 0;text-align:center;">
      <a href="{PUBLIC_BASE}/body-temple"
         style="display:inline-block;padding:14px 26px;background:#4a3a1c;color:#f8efde;text-decoration:none;border-radius:999px;font-family:'Fraunces',serif;font-size:15px;letter-spacing:0.04em;box-shadow:0 8px 18px -8px rgba(74,58,28,0.6);">
        Read Day 1 first ›
      </a>
    </div>

    <p style="font-size:14.5px;line-height:1.7;color:#5a4a26;margin:0 0 16px 0;font-style:italic;">
      "The first touch is the one you give yourself — and most adults
      skip it for years." — Day 8.
    </p>

    <p style="font-size:15px;line-height:1.65;margin:0 0 6px 0;">
      Walk gently,
    </p>
    <p style="font-family:'Caveat',cursive;font-size:30px;line-height:1;color:#6a4b1f;margin:0 0 28px 0;">
      Anna
    </p>

    <hr style="border:none;border-top:1px solid rgba(120,80,30,0.18);margin:24px 0;">
    <p style="font-size:11.5px;color:#8a7848;line-height:1.6;margin:0;">
      You're receiving this because Aurin has been walking with your
      family. If you'd rather not hear about future quiet things,
      simply reply with "pause" and I will hold them for you.
    </p>
  </div>
</body></html>
""".strip()


def render_text(parent_name: str | None) -> str:
    greeting = f"Dear {parent_name}," if parent_name else "Dear friend,"
    return (
        f"{greeting}\n\n"
        "Your child has been walking with Aurin for a while now. I have "
        "seen the way you held space for that — gently, without rushing.\n\n"
        "For the last year I have been quietly carrying something for you, "
        "too. It is finally ready.\n\n"
        "Body Temple 28 is a four-week journey through four ancient keys "
        "— breathing, touch, rest, presence. Twenty-eight quiet days, each "
        "between three and fifteen minutes, each closed by a single "
        "Socratic question. Never clinical. Never measuring.\n\n"
        "Day 1 is free — read it before you decide anything. If it sits "
        "well, one unlock ($39, once, yours forever) opens the remaining "
        "twenty-seven days at your own pace.\n\n"
        f"Read Day 1 first: {PUBLIC_BASE}/body-temple\n\n"
        "Walk gently,\n"
        "Anna\n"
    )


async def send_to(email: str, parent_name: str | None = None, dry_run: bool = False) -> dict:
    html = render_html(parent_name)
    text = render_text(parent_name)
    if dry_run:
        return {"sent": False, "dry_run": True, "to": email, "subject": SUBJECT, "html_len": len(html)}
    if not is_configured():
        return {"sent": False, "error": "Resend not configured (RESEND_API_KEY missing)."}
    r = await send_email(to=email, subject=SUBJECT, html=html, text=text, sender="agent",
                         tags=[{"name": "campaign", "value": "body-temple-launch"}])
    return {"sent": True, "to": email, "resend_id": (r or {}).get("id")}


async def dispatch_to_existing_parents(dry_run: bool = True, limit: int | None = None) -> dict:
    """Find every parent who has at least one child mood check-in and
    send (or dry-run) the launch email. Respects annas_letter_opt_out
    as a proxy for general unsubscribe."""
    distinct_users = await db.kids_mood_checkins.distinct("user_id")
    if limit:
        distinct_users = distinct_users[:limit]
    results = {"total": len(distinct_users), "sent": 0, "skipped": 0, "errors": 0,
               "dry_run": dry_run, "details": []}
    for uid in distinct_users:
        try:
            u = await db.users.find_one({"user_id": uid},
                                        {"_id": 0, "email": 1, "name": 1,
                                         "annas_letter_opt_out": 1,
                                         "body_temple_launch_sent_at": 1})
            if not u or not u.get("email"):
                results["skipped"] += 1
                continue
            if u.get("annas_letter_opt_out"):
                results["skipped"] += 1
                results["details"].append({"user_id": uid, "reason": "opted_out"})
                continue
            if u.get("body_temple_launch_sent_at"):
                results["skipped"] += 1
                results["details"].append({"user_id": uid, "reason": "already_sent"})
                continue
            r = await send_to(u["email"], parent_name=u.get("name"), dry_run=dry_run)
            if r.get("sent"):
                results["sent"] += 1
                await db.users.update_one(
                    {"user_id": uid},
                    {"$set": {"body_temple_launch_sent_at":
                              asyncio.get_event_loop().time()}},
                )
            else:
                results["skipped"] += 1
            results["details"].append({"user_id": uid, **r})
        except Exception as e:
            results["errors"] += 1
            results["details"].append({"user_id": uid, "error": str(e)})
    return results


async def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--to", help="Send to a single email address (testing).")
    parser.add_argument("--name", help="Optional parent name for personalisation.")
    parser.add_argument("--send", action="store_true",
                        help="Real bulk send to every parent with a check-in.")
    parser.add_argument("--limit", type=int, default=None)
    args = parser.parse_args()

    if args.to:
        r = await send_to(args.to, parent_name=args.name, dry_run=not args.send)
        print(r)
        return

    r = await dispatch_to_existing_parents(dry_run=not args.send, limit=args.limit)
    # Truncate details for clean stdout if it gets long.
    if len(r.get("details", [])) > 5:
        r["details"] = r["details"][:5] + [{"more": f"+{len(r['details']) - 5} more (truncated)"}]
    print(r)


if __name__ == "__main__":
    asyncio.run(main())
