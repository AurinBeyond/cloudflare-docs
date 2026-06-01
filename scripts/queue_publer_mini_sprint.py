#!/usr/bin/env python3
"""
queue_publer_mini_sprint.py — seed content for the 3 new channels
that joined the Publer workspace after the main 30-day sprint.

Channels covered:
    twitter   — 3 posts (≤ 280 char hard limit, sharper hooks)
    threads   — 3 posts (slightly longer, more conversational than X)

NOT covered:
    pinterest — Pinterest requires a media file (image/video). Cannot
                schedule a text-only Pinterest pin via Publer. To seed
                Pinterest, generate 3 vertical pins (Nano Banana,
                Visual Bible Night Palette) and post them through
                Publer UI directly, or extend publer_dispatcher to
                upload media via POST /media first.

Cadence: spread across days 2-14 so the new channels look active
from week 1 onward (alongside the LinkedIn + Bluesky main sprint).

Dispatch: same /api/marketing/dispatch?all=true endpoint, batched
into ONE Publer bulk call (consumes 1/5 daily Free quota).

USAGE:
    python3 scripts/queue_publer_mini_sprint.py --dry-run
    python3 scripts/queue_publer_mini_sprint.py
"""
from __future__ import annotations

import argparse
import json
import os
import sys
from datetime import datetime, timezone, timedelta
from pathlib import Path

import httpx
from dotenv import load_dotenv

load_dotenv("/app/backend/.env")


def at(day_offset: int, hour: int, minute: int = 0) -> str:
    base = (datetime.now(timezone.utc) + timedelta(days=day_offset + 1)).replace(
        hour=hour, minute=minute, second=0, microsecond=0
    )
    return base.isoformat()


# ─────────────────────────────────────────────────────────────────
# Voice notes per channel:
#   X / Twitter — hard 280-char limit; punchy hook + 1 image only.
#                 No hashtags (we are anti-marketing). One line breaks
#                 ok. No links inside the post body (X de-prioritises);
#                 if a link is needed, put it as a single reply or in
#                 bio.
#   Threads     — softer, more public/conversational. Up to 500 chars
#                 comfortable. Slightly more interior than X.
# ─────────────────────────────────────────────────────────────────

POSTS = [
    # ============== X / Twitter (3 posts) ==============
    {
        "channel": "twitter",
        "tag": "publer_mini_x_d2_kettle",
        "scheduled_at": at(1, 9, 0),
        "body": (
            "The kettle is older than the meditation app by about "
            "3,000 years and has a higher completion rate.\n\n"
            "Put it on."
        ),
    },
    {
        "channel": "twitter",
        "tag": "publer_mini_x_d7_streak",
        "scheduled_at": at(6, 9, 0),
        "body": (
            "The streak counter is not a feature.\n\n"
            "It is the product.\n\n"
            "Sit quietly. Miss Tuesday. Get punished. This is not a "
            "calm relationship with your own attention. It is a slot "
            "machine wearing the costume of self-care."
        ),
    },
    {
        "channel": "twitter",
        "tag": "publer_mini_x_d12_voice",
        "scheduled_at": at(11, 18, 0),
        "body": (
            "The voice you reply with in difficult meetings is a fork "
            "of the version of you that was 14.\n\n"
            "Walk it back."
        ),
    },

    # ============== Threads (3 posts) ==============
    {
        "channel": "threads",
        "tag": "publer_mini_threads_d3_kitchen",
        "scheduled_at": at(2, 19, 0),
        "body": (
            "It is 11pm. Your kid is finally asleep. You sit down in "
            "the kitchen. You realise you haven't eaten lunch.\n\n"
            "This is the hour the wellness industry has been trying "
            "to sell you a candle for, when what you actually need is "
            "a chair, the kettle, and seven minutes of being addressed "
            "as if you are a person, not a problem.\n\n"
            "A small shelf of evening audio for exactly that hour lives "
            "at prulesoul.site."
        ),
    },
    {
        "channel": "threads",
        "tag": "publer_mini_threads_d9_subscriptions",
        "scheduled_at": at(8, 8, 0),
        "body": (
            "Quiet experiment for this month:\n\n"
            "Cancel one €15/month subscription you have been carrying "
            "out of vague guilt. Put the €15 in a glass jar on the "
            "kitchen counter.\n\n"
            "By December the jar will hold roughly the cost of a long "
            "weekend somewhere with no notifications.\n\n"
            "The notebook has been doing this job, quietly, since the "
            "Romans."
        ),
    },
    {
        "channel": "threads",
        "tag": "publer_mini_threads_d14_garden",
        "scheduled_at": at(13, 19, 30),
        "body": (
            "Your teenager has been quieter for about six weeks. Not "
            "unhappy quiet. Something more interior.\n\n"
            "The garden in November looks exactly the same way. Brown "
            "edges. Empty bench. The whole organism appears to be doing "
            "nothing.\n\n"
            "The most loving thing you can do for a garden in November "
            "is notice that it is in November, and let it be in "
            "November.\n\n"
            "Your job is not to dig her up to check on her. Your job "
            "is to be the warm house behind the garden."
        ),
    },
]


def main():
    p = argparse.ArgumentParser()
    p.add_argument("--dry-run", action="store_true")
    p.add_argument("--api-url", default=None)
    args = p.parse_args()

    api_url = (
        args.api_url
        or os.environ.get("AURIN_API_URL")
        or Path("/app/frontend/.env").read_text().split("REACT_APP_BACKEND_URL=")[1].split("\n")[0].strip()
    )
    admin_token = os.environ.get("AURIN_ADMIN_TOKEN") or os.environ.get("ADMIN_TOKEN")
    if not admin_token:
        print("FATAL: ADMIN_TOKEN missing.")
        sys.exit(1)

    by_channel: dict = {}
    over_280 = []
    for q in POSTS:
        by_channel[q["channel"]] = by_channel.get(q["channel"], 0) + 1
        if q["channel"] == "twitter" and len(q["body"]) > 280:
            over_280.append((q["tag"], len(q["body"])))
    if over_280:
        print("FATAL: X posts exceed 280 chars:")
        for tag, n in over_280:
            print(f"  · {tag}  {n} chars")
        sys.exit(2)

    print(f"Total posts: {len(POSTS)}")
    for ch, n in sorted(by_channel.items()):
        print(f"   · {ch:10s} {n}")
    print()
    if args.dry_run:
        for p_ in POSTS:
            print(f"{p_['channel']:10s} {p_['scheduled_at'][:16]}  {p_['tag']}  ({len(p_['body'])} chars)")
        return

    print(f"→ POST {api_url}/api/marketing/queue")
    with httpx.Client(timeout=60) as c:
        r = c.post(
            f"{api_url}/api/marketing/queue",
            json={"posts": POSTS},
            headers={"Authorization": f"Bearer {admin_token}"},
        )
    print("HTTP", r.status_code)
    try:
        print(json.dumps(r.json(), indent=2))
    except Exception:
        print(r.text[:1000])


if __name__ == "__main__":
    main()
