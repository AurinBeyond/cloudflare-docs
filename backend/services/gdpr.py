"""
gdpr.py — §GDPR-COMPLIANCE 2026-02-29

EU GDPR Article 15 (right of access) + Article 17 (right to erasure)
endpoints. Mounted directly on `api_router` in server.py.

Scope:
  GET    /api/account/data-export   — returns a JSON dump of every
                                       collection that holds a row
                                       tied to the caller's user_id
                                       or email.
  DELETE /api/account/delete        — irreversibly removes every
                                       such row and invalidates the
                                       session.

What we touch:
  users, user_sessions, magic_links, intakes, marketing_queue,
  reach_out_messages, polar_processed_events (by metadata.user_id),
  clarity_passes, voice_grants (credit_ledger), beta_enrollments,
  cabinet_user_tier, referral_codes, pageviews (by user_id).

We do NOT touch:
  · Polar's own records — caller must request that from Polar.
  · Resend's own records — caller can request via their inbox.
  · Anything tied to a different account by email.

Anti-foot-gun: deletion requires the caller to send a body
{"confirm": "delete-my-account"} so a stray DELETE never wipes a
session-authed user by accident.
"""
from __future__ import annotations

import asyncio
import logging
from datetime import datetime, timezone
from typing import Any, Dict, List

from fastapi import APIRouter, HTTPException, Request, Response

logger = logging.getLogger(__name__)

# Collections we know touch user data, keyed by the field name on
# which we filter. Order matters for the deletion path: sessions
# come last so the caller can still be authenticated while we walk
# their data.
USER_ID_COLLECTIONS = [
    "users",
    "intakes",
    "marketing_queue",
    "reach_out_messages",
    "clarity_passes",
    "voice_grants",
    "beta_enrollments",
    "cabinet_user_tier",
    "referral_codes",
    "pageviews",
    "voice_minute_grants",
    "polar_processed_events",
    "user_sessions",  # session row LAST in delete path
]

# Some legacy collections key on `email` rather than `user_id`.
EMAIL_COLLECTIONS = [
    "magic_links",
    "marketing_queue",  # newer rows have user_id, older only email
    "intakes",          # same as above
]


def _strip_internal(rows: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """Remove MongoDB internal fields a buyer doesn't need to see."""
    cleaned: List[Dict[str, Any]] = []
    for r in rows:
        if isinstance(r, dict):
            r = {k: v for k, v in r.items() if k != "_id"}
        cleaned.append(r)
    return cleaned


async def export_user_data(db, *, user_id: str, email: str | None) -> Dict[str, Any]:
    """Build a JSON-serialisable dump of every collection that holds
    a row for this user. Best-effort — if a collection is missing
    or empty, the key is simply absent from the dump."""
    out: Dict[str, Any] = {
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "user_id": user_id,
        "email": email,
        "collections": {},
    }
    for coll in USER_ID_COLLECTIONS:
        try:
            cursor = db[coll].find({"user_id": user_id})
            rows = [r async for r in cursor]
            if rows:
                out["collections"][coll] = _strip_internal(rows)
        except Exception as exc:  # noqa: BLE001
            logger.warning("data-export: %s skipped (%s)", coll, exc)

    if email:
        for coll in EMAIL_COLLECTIONS:
            try:
                cursor = db[coll].find({"email": email.lower()})
                rows = [r async for r in cursor]
                if rows:
                    key = f"{coll}_by_email"
                    out["collections"][key] = _strip_internal(rows)
            except Exception as exc:  # noqa: BLE001
                logger.warning("data-export: %s by-email skipped (%s)", coll, exc)
    return out


async def delete_user_data(db, *, user_id: str, email: str | None) -> Dict[str, Any]:
    """Irreversibly delete every row tied to this user. Returns a
    summary of how many rows were removed in each collection."""
    summary: Dict[str, int] = {}
    for coll in USER_ID_COLLECTIONS:
        try:
            res = await db[coll].delete_many({"user_id": user_id})
            if res.deleted_count:
                summary[coll] = res.deleted_count
        except Exception as exc:  # noqa: BLE001
            logger.warning("account-delete: %s skipped (%s)", coll, exc)

    if email:
        for coll in EMAIL_COLLECTIONS:
            try:
                res = await db[coll].delete_many({"email": email.lower()})
                if res.deleted_count:
                    key = f"{coll}_by_email"
                    summary[key] = summary.get(key, 0) + res.deleted_count
            except Exception as exc:  # noqa: BLE001
                logger.warning("account-delete: %s by-email skipped (%s)", coll, exc)

    return {
        "deleted_at": datetime.now(timezone.utc).isoformat(),
        "user_id": user_id,
        "email": email,
        "rows_removed": summary,
    }
