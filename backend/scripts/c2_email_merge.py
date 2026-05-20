"""
§AUDIT-C2 2026-05-20 — Case-insensitive email duplicate merge.

Run modes:
  python -m scripts.c2_email_merge          → DRY-RUN (no writes)
  python -m scripts.c2_email_merge --apply  → REAL migration

Strategy (case-erinevus, SAMA email — only):
  1. Group all users by lowercased email
  2. For groups with >1 row → these are case-only duplicates
  3. Pick the OLDEST `created_at` as the "main" user_id (preserve seniority)
  4. For every duplicate row:
     - Re-bind any voice_sessions to the main user_id
     - Re-bind any presence_grants to the main user_id
     - Re-bind any purchases / clarity_passes to the main user_id
     - Re-bind any user_sessions (login tokens) to the main user_id
     - Sum `presence_seconds_left` into main
     - Promote `unlimited_voice` to True if ANY row had it
     - Append migration audit row to `credit_ledger`
     - Archive the duplicate doc into `users_archive_2026_05_20_c2_migration`
     - Delete the duplicate from `users`
  5. After all groups processed, create case-insensitive unique index
     on email (collation strength=2)

Idempotent: subsequent runs find no duplicates → no-op.
"""
import argparse
import asyncio
import os
import uuid
from datetime import datetime, timezone
from pathlib import Path

from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient

BACKEND_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BACKEND_DIR / ".env")

MONGO_URL = os.environ["MONGO_URL"]
DB_NAME = os.environ["DB_NAME"]
ARCHIVE_COL = "users_archive_2026_05_20_c2_migration"


def _parse_dt(value):
    if isinstance(value, datetime):
        return value.replace(tzinfo=timezone.utc) if value.tzinfo is None else value
    if isinstance(value, str):
        try:
            d = datetime.fromisoformat(value.replace("Z", "+00:00"))
            return d.replace(tzinfo=timezone.utc) if d.tzinfo is None else d
        except ValueError:
            return datetime.max.replace(tzinfo=timezone.utc)
    return datetime.max.replace(tzinfo=timezone.utc)


async def discover_duplicates(db):
    """Group users by lowercased email; return list of duplicate-groups."""
    cursor = db.users.find({}, {"_id": 0, "user_id": 1, "email": 1, "created_at": 1,
                                  "presence_seconds_left": 1, "unlimited_voice": 1})
    by_email = {}
    async for u in cursor:
        em = (u.get("email") or "").strip()
        if not em:
            continue
        key = em.lower()
        by_email.setdefault(key, []).append(u)
    return [(k, v) for k, v in by_email.items() if len(v) > 1]


async def process_group(db, email_lower, rows, apply: bool):
    rows_sorted = sorted(rows, key=lambda r: _parse_dt(r.get("created_at")))
    main = rows_sorted[0]
    dupes = rows_sorted[1:]
    main_id = main["user_id"]
    print(f"\n=== {email_lower} :: keep main={main_id} ({main.get('created_at')}) ===")
    for d in dupes:
        d_id = d["user_id"]
        d_balance = int(d.get("presence_seconds_left") or 0)
        d_unlim = bool(d.get("unlimited_voice"))
        print(f"   merging {d_id}  email={d.get('email')!r}  balance={d_balance}  unlimited={d_unlim}")
        if not apply:
            continue
        now_iso = datetime.now(timezone.utc).isoformat()
        # Re-bind dependent rows.
        for col in ("voice_sessions", "presence_grants", "purchases",
                    "clarity_passes", "user_sessions", "agreement_acceptances",
                    "funnel_events", "magic_link_tokens"):
            res = await db[col].update_many(
                {"user_id": d_id}, {"$set": {"user_id": main_id}},
            )
            if res.modified_count:
                print(f"     rebound {res.modified_count} rows in {col}")
        # Sum balance + unlimited promotion (atomic update_one on main).
        main_doc = await db.users.find_one({"user_id": main_id}, {"_id": 0})
        new_balance = int(main_doc.get("presence_seconds_left") or 0) + d_balance
        new_unlimited = bool(main_doc.get("unlimited_voice")) or d_unlim
        await db.users.update_one(
            {"user_id": main_id},
            {"$set": {"presence_seconds_left": new_balance,
                      "unlimited_voice": new_unlimited}},
        )
        # Ledger audit row.
        await db.credit_ledger.insert_one({
            "id": str(uuid.uuid4()),
            "user_id": main_id,
            "delta": d_balance,
            "before": int(main_doc.get("presence_seconds_left") or 0),
            "after": new_balance,
            "reason": f"c2_merge_from:{d_id}",
            "occurred_at": now_iso,
        })
        # Archive then delete the dupe row.
        await db[ARCHIVE_COL].insert_one({
            **{k: v for k, v in d.items() if k != "_id"},
            "_archived_at": now_iso,
            "_merged_into": main_id,
        })
        await db.users.delete_one({"user_id": d_id})
        print(f"     archived + deleted {d_id} — main balance now {new_balance}")


async def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--apply", action="store_true", help="Execute the migration (default: dry-run)")
    args = ap.parse_args()
    cli = AsyncIOMotorClient(MONGO_URL)
    db = cli[DB_NAME]
    groups = await discover_duplicates(db)
    print(f"Found {len(groups)} email duplicate groups (case-only)")
    for email_lower, rows in groups:
        await process_group(db, email_lower, rows, apply=args.apply)
    if args.apply and groups:
        # Case-insensitive unique index — locks in the invariant.
        try:
            await db.users.create_index(
                [("email", 1)], unique=True,
                collation={"locale": "en", "strength": 2},
                name="uniq_user_email_ci", background=True,
            )
            print("\nCreated case-insensitive unique index on users.email")
        except Exception as exc:
            print(f"\nIndex creation skipped: {exc}")
    elif args.apply and not groups:
        # No duplicates → safe to create the unique index immediately.
        try:
            await db.users.create_index(
                [("email", 1)], unique=True,
                collation={"locale": "en", "strength": 2},
                name="uniq_user_email_ci", background=True,
            )
            print("No duplicates — created case-insensitive unique index.")
        except Exception as exc:
            print(f"Index creation skipped: {exc}")
    print(f"\nDONE. Mode: {'APPLY' if args.apply else 'DRY-RUN'}")


if __name__ == "__main__":
    asyncio.run(main())
