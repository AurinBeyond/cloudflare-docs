"""
weekly_anna_letter_cron.py — Friday 18:00 UTC cron runner.

§ANNAS-LETTER-P3 2026-02-09 — Phase 3 of the weekly letter: cron
that auto-dispatches every Friday so Anna doesn't need to hit the
admin endpoint manually. Idempotent per (user, year-week) via the
`annas_letter_sends` collection.

Run from supervisor / OS cron / Emergent scheduled job:
    python3 /app/backend/scripts/weekly_anna_letter_cron.py

Safe to run multiple times — the underlying _send_annas_letter
function is idempotent. The script is also safe to run on a
non-Friday: it will only dispatch when UTC weekday==4 unless the
FORCE_DISPATCH env var is set.
"""

import asyncio
import os
import sys
from datetime import datetime, timezone

sys.path.insert(0, "/app/backend")
from dotenv import load_dotenv
load_dotenv("/app/backend/.env")

# Lazy imports because server.py is heavy.
from server import _send_annas_letter, db  # noqa: E402


async def main():
    now = datetime.now(timezone.utc)
    weekday = now.weekday()  # Mon=0 ... Fri=4 ... Sun=6
    force = os.environ.get("FORCE_DISPATCH") == "1"
    if weekday != 4 and not force:
        print(f"[anna-letter-cron] {now.isoformat()} — not Friday "
              f"(weekday={weekday}); skipping. Set FORCE_DISPATCH=1 to override.")
        return

    distinct_users = await db.kids_mood_checkins.distinct("user_id")
    print(f"[anna-letter-cron] {now.isoformat()} — {len(distinct_users)} user(s) "
          f"to consider for week's letter.")

    results = {"sent": 0, "skipped": 0, "errors": 0, "reasons": {}}
    for uid in distinct_users:
        try:
            r = await _send_annas_letter(uid)
            if r.get("sent"):
                results["sent"] += 1
                print(f"  ✓ sent to user={uid[:24]} week={r.get('year_week')}")
            else:
                results["skipped"] += 1
                reason = r.get("reason", "unknown")
                results["reasons"][reason] = results["reasons"].get(reason, 0) + 1
        except Exception as exc:  # noqa: BLE001
            results["errors"] += 1
            print(f"  ✗ error user={uid[:24]} err={exc}")

    print(f"[anna-letter-cron] done. sent={results['sent']} "
          f"skipped={results['skipped']} errors={results['errors']} "
          f"reasons={results['reasons']}")


if __name__ == "__main__":
    asyncio.run(main())
