"""
chrono_lock.py — Server-side enforcement of the Matrix Aurin temporal
locks. Pure functions + Mongo helpers, no FastAPI imports so they are
trivially unit-testable from pytest.

Two locks live here today:

1) Body Architecture (Body Temple) — linear 7-day weekly unlock across
   28 days. Week N opens (N-1) * 7 days after course enrollment. Week 1
   is immediate. Skipping is programmatically blocked.

2) Clarity Release — 48-hour Integration Lock after consuming any
   foundational audio module / mode. Selecting a *different* mode
   during the window is blocked. Repeating the same mode is allowed
   (the nervous system has already begun integrating that material).

Both locks store data in dedicated, idempotent Mongo collections so
nothing in the rest of the codebase needs to know about them.
"""
from __future__ import annotations

from datetime import datetime, timedelta, timezone
from typing import Any, Dict, Optional


BODY_WEEK_LOCK_DAYS = 7
CLARITY_INTEGRATION_LOCK_HOURS = 48


# ── pure helpers ──────────────────────────────────────────────────


def _now() -> datetime:
    return datetime.now(timezone.utc)


def body_week_unlock_at(started_at: datetime, week_number: int) -> datetime:
    """Week N unlocks (N-1) * 7 days after enrollment. Week 1 = start."""
    if week_number <= 1:
        return started_at
    return started_at + timedelta(days=(week_number - 1) * BODY_WEEK_LOCK_DAYS)


def body_week_status(
    started_at: datetime,
    week_number: int,
    now: Optional[datetime] = None,
) -> Dict[str, Any]:
    now = now or _now()
    unlock = body_week_unlock_at(started_at, week_number)
    remaining = max(0, int((unlock - now).total_seconds()))
    return {
        "week_number": week_number,
        "unlock_at": unlock.isoformat(),
        "chrono_locked": remaining > 0,
        "seconds_remaining": remaining,
    }


def clarity_integration_unlock_at(last_consumed_at: datetime) -> datetime:
    return last_consumed_at + timedelta(hours=CLARITY_INTEGRATION_LOCK_HOURS)


def clarity_integration_status(
    last_consumed_at: Optional[datetime],
    now: Optional[datetime] = None,
) -> Dict[str, Any]:
    if not last_consumed_at:
        return {
            "chrono_locked": False,
            "unlock_at": None,
            "seconds_remaining": 0,
        }
    now = now or _now()
    unlock = clarity_integration_unlock_at(last_consumed_at)
    remaining = max(0, int((unlock - now).total_seconds()))
    return {
        "chrono_locked": remaining > 0,
        "unlock_at": unlock.isoformat(),
        "seconds_remaining": remaining,
    }


# ── Mongo helpers (Body Architecture enrollment) ─────────────────


async def ensure_body_enrollment(db, user_id: str) -> Dict[str, Any]:
    """Idempotently mark the user as enrolled in the 28-day cycle.
    Returns the enrollment record with `started_at` as a datetime."""
    now = _now()
    await db.body_temple_enrollments.update_one(
        {"user_id": user_id},
        {"$setOnInsert": {
            "user_id": user_id,
            "started_at": now.isoformat(),
        }},
        upsert=True,
    )
    doc = await db.body_temple_enrollments.find_one(
        {"user_id": user_id}, {"_id": 0}
    )
    # Normalize started_at back to datetime for caller convenience.
    try:
        doc["started_at_dt"] = datetime.fromisoformat(doc["started_at"])
    except Exception:  # noqa: BLE001
        doc["started_at_dt"] = now
    return doc


async def get_body_enrollment(db, user_id: str) -> Optional[Dict[str, Any]]:
    doc = await db.body_temple_enrollments.find_one(
        {"user_id": user_id}, {"_id": 0}
    )
    if not doc:
        return None
    try:
        doc["started_at_dt"] = datetime.fromisoformat(doc["started_at"])
    except Exception:  # noqa: BLE001
        doc["started_at_dt"] = _now()
    return doc


async def body_week_status_for_user(
    db, user_id: str, week_number: int, auto_enroll: bool = False
) -> Dict[str, Any]:
    """Look up (or lazily create) the user's enrollment and compute
    the unlock state for the given week. When `auto_enroll=False` and
    the user has no enrollment, week 1 reports as open (so the
    pre-enrollment preview never lies)."""
    enr = await get_body_enrollment(db, user_id)
    if not enr:
        if auto_enroll:
            enr = await ensure_body_enrollment(db, user_id)
        else:
            # Use "now" as the hypothetical start so week 1 is open.
            return body_week_status(_now(), week_number)
    return body_week_status(enr["started_at_dt"], week_number)


# ── Mongo helpers (Clarity integration lock) ─────────────────────


async def record_clarity_module_consumption(
    db, user_id: str, mode_key: str
) -> Dict[str, Any]:
    """Mark that the user has just completed a foundational module.
    Subsequent attempts to start a *different* mode within
    CLARITY_INTEGRATION_LOCK_HOURS will be blocked by the caller."""
    now = _now()
    await db.clarity_integration_locks.update_one(
        {"user_id": user_id},
        {"$set": {
            "user_id": user_id,
            "last_mode": mode_key,
            "last_consumed_at": now.isoformat(),
        }},
        upsert=True,
    )
    return clarity_integration_status(now)


async def get_clarity_integration_state(
    db, user_id: str
) -> Dict[str, Any]:
    doc = await db.clarity_integration_locks.find_one(
        {"user_id": user_id}, {"_id": 0}
    )
    if not doc:
        return {
            "last_mode": None,
            "last_consumed_at": None,
            "chrono_locked": False,
            "unlock_at": None,
            "seconds_remaining": 0,
        }
    last_consumed = None
    if doc.get("last_consumed_at"):
        try:
            last_consumed = datetime.fromisoformat(doc["last_consumed_at"])
        except Exception:  # noqa: BLE001
            last_consumed = None
    status = clarity_integration_status(last_consumed)
    return {
        "last_mode": doc.get("last_mode"),
        "last_consumed_at": doc.get("last_consumed_at"),
        **status,
    }


async def assert_clarity_mode_switch_allowed(
    db, user_id: str, target_mode: str
) -> None:
    """Raises ValueError("chrono_locked", status_dict) when the
    requested target mode would violate the 48-hour Integration Lock.
    Selecting the same mode the user just consumed is permitted —
    integration continues."""
    state = await get_clarity_integration_state(db, user_id)
    if not state.get("chrono_locked"):
        return
    if (state.get("last_mode") or "") == (target_mode or ""):
        return
    raise ChronoLocked(state)


class ChronoLocked(Exception):
    """Raised by assert_* helpers. Carries the status dict so the
    web layer can surface unlock_at + seconds_remaining cleanly."""

    def __init__(self, status: Dict[str, Any]):
        super().__init__("chrono_locked")
        self.status = status
