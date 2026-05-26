"""
email_suppression.py — Matrix Aurin email health & suppression list.

§EMAIL-HEALTH 2026-02-11 (Anna's directive):
    Centralised "do not send" list driven by Resend webhooks.

Three reasons an email gets suppressed:
    • "bounced"      — Resend tried to deliver, mailbox rejected (hard bounce).
    • "complained"   — Recipient marked us as spam in their inbox.
    • "unsubscribed" — Recipient asked to be removed (one-click or webhook).

Hard bounces & complaints must NEVER be retried. Sending again hurts
domain reputation and risks Resend / Gmail / Outlook blocking us
entirely. Soft bounces (mailbox full, temp issue) are NOT suppressed
here — Resend retries those on its own.

Collection schema (`email_suppression`):
    {
        "email":      "<lowercase@example.com>",   # primary key
        "reason":     "bounced" | "complained" | "unsubscribed" | "manual",
        "source":     "resend-webhook" | "user-unsubscribe-link" | "admin",
        "first_seen": <iso datetime>,
        "last_event": <iso datetime>,
        "event_count": <int>,
        "notes":      "<optional string>"
    }

API:
    await is_suppressed(db, email)         -> bool
    await suppress(db, email, reason, source, notes=None)
    await unsuppress(db, email, by_admin)  -> bool
    await suppression_health(db)           -> dict (counts by reason)
"""
from __future__ import annotations

from datetime import datetime, timezone
from typing import Optional


async def _ensure_indexes(db) -> None:
    """Idempotent index creation. Safe to call on every send."""
    try:
        await db.email_suppression.create_index("email", unique=True)
        await db.email_suppression.create_index("reason")
    except Exception:
        # Index already exists — fine.
        pass


def _normalise(email: str) -> str:
    return (email or "").strip().lower()


async def is_suppressed(db, email: str) -> bool:
    """Returns True if this email must NOT receive any more mail."""
    e = _normalise(email)
    if not e:
        return False
    doc = await db.email_suppression.find_one(
        {"email": e}, {"_id": 0, "reason": 1}
    )
    return doc is not None


async def suppress(
    db,
    email: str,
    reason: str,
    source: str,
    notes: Optional[str] = None,
) -> None:
    """Add an email to the suppression list. Upserts; safe to call
    multiple times — last_event and event_count update each time.
    """
    e = _normalise(email)
    if not e:
        return
    valid_reasons = {"bounced", "complained", "unsubscribed", "manual"}
    if reason not in valid_reasons:
        reason = "manual"
    await _ensure_indexes(db)
    now = datetime.now(timezone.utc).isoformat()
    await db.email_suppression.update_one(
        {"email": e},
        {
            "$set": {
                "reason": reason,
                "source": source,
                "last_event": now,
                "notes": notes,
            },
            "$setOnInsert": {"first_seen": now},
            "$inc": {"event_count": 1},
        },
        upsert=True,
    )


async def unsuppress(db, email: str, by_admin: str = "admin") -> bool:
    """Remove an email from the suppression list. Use sparingly — e.g.,
    when the user contacts support saying "you wrongly blocked me".
    Returns True if it was removed, False if it wasn't on the list.
    """
    e = _normalise(email)
    if not e:
        return False
    result = await db.email_suppression.delete_one({"email": e})
    return (result.deleted_count or 0) > 0


async def suppression_health(db) -> dict:
    """Snapshot for Anna's admin dashboard. Returns counts per reason
    plus the total."""
    pipeline = [
        {"$group": {"_id": "$reason", "count": {"$sum": 1}}},
    ]
    rows = await db.email_suppression.aggregate(pipeline).to_list(length=20)
    by_reason = {r["_id"]: r["count"] for r in rows}
    total = sum(by_reason.values())
    return {
        "total_suppressed": total,
        "by_reason": by_reason,
        "bounced": by_reason.get("bounced", 0),
        "complained": by_reason.get("complained", 0),
        "unsubscribed": by_reason.get("unsubscribed", 0),
        "manual": by_reason.get("manual", 0),
    }
