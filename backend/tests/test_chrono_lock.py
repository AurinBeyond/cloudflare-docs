"""
Chrono-lock regression tests — Body Architecture 7-day weekly unlock
and Clarity Release 48-hour Integration Lock.

Run: `cd /app/backend && python -m pytest tests/test_chrono_lock.py -v`
"""
from __future__ import annotations

import asyncio
import os
import sys
import uuid
from datetime import datetime, timedelta, timezone
from pathlib import Path

import pytest
import pytest_asyncio
from motor.motor_asyncio import AsyncIOMotorClient

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from services import chrono_lock  # noqa: E402


# ── pure-function tests ───────────────────────────────────────────


def test_body_week_unlock_at_week_1_is_start():
    start = datetime(2026, 2, 13, 9, 0, 0, tzinfo=timezone.utc)
    assert chrono_lock.body_week_unlock_at(start, 1) == start


def test_body_week_unlock_at_week_2_is_seven_days():
    start = datetime(2026, 2, 13, tzinfo=timezone.utc)
    assert chrono_lock.body_week_unlock_at(start, 2) == start + timedelta(days=7)


def test_body_week_unlock_at_week_4_is_twentyone_days():
    start = datetime(2026, 2, 13, tzinfo=timezone.utc)
    assert chrono_lock.body_week_unlock_at(start, 4) == start + timedelta(days=21)


def test_body_week_status_locked_when_too_early():
    start = datetime(2026, 2, 13, tzinfo=timezone.utc)
    now = start + timedelta(days=3)
    s = chrono_lock.body_week_status(start, 2, now=now)
    assert s["chrono_locked"] is True
    assert s["seconds_remaining"] == int(timedelta(days=4).total_seconds())


def test_body_week_status_unlocked_exactly_on_boundary():
    start = datetime(2026, 2, 13, tzinfo=timezone.utc)
    now = start + timedelta(days=7)
    s = chrono_lock.body_week_status(start, 2, now=now)
    assert s["chrono_locked"] is False


def test_clarity_integration_status_no_history():
    s = chrono_lock.clarity_integration_status(None)
    assert s["chrono_locked"] is False
    assert s["seconds_remaining"] == 0
    assert s["unlock_at"] is None


def test_clarity_integration_status_locked_at_24h_in():
    consumed = datetime(2026, 2, 13, 9, 0, 0, tzinfo=timezone.utc)
    now = consumed + timedelta(hours=24)
    s = chrono_lock.clarity_integration_status(consumed, now=now)
    assert s["chrono_locked"] is True
    assert s["seconds_remaining"] == int(timedelta(hours=24).total_seconds())


def test_clarity_integration_status_clear_after_48h():
    consumed = datetime(2026, 2, 13, 9, 0, 0, tzinfo=timezone.utc)
    now = consumed + timedelta(hours=49)
    s = chrono_lock.clarity_integration_status(consumed, now=now)
    assert s["chrono_locked"] is False


# ── Mongo-backed tests ────────────────────────────────────────────


@pytest_asyncio.fixture
async def db():
    client = AsyncIOMotorClient(os.environ["MONGO_URL"])
    test_db = client[f"chrono_test_{uuid.uuid4().hex[:6]}"]
    yield test_db
    await client.drop_database(test_db.name)
    client.close()


@pytest.mark.asyncio
async def test_ensure_body_enrollment_is_idempotent(db):
    a = await chrono_lock.ensure_body_enrollment(db, "u1")
    b = await chrono_lock.ensure_body_enrollment(db, "u1")
    assert a["started_at"] == b["started_at"]


@pytest.mark.asyncio
async def test_body_week_status_for_user_lazy_enrolls(db):
    s = await chrono_lock.body_week_status_for_user(
        db, "u1", 1, auto_enroll=True
    )
    assert s["chrono_locked"] is False
    enr = await chrono_lock.get_body_enrollment(db, "u1")
    assert enr is not None


@pytest.mark.asyncio
async def test_clarity_lock_blocks_different_mode(db):
    await chrono_lock.record_clarity_module_consumption(
        db, "u1", "boundaries"
    )
    with pytest.raises(chrono_lock.ChronoLocked) as exc:
        await chrono_lock.assert_clarity_mode_switch_allowed(
            db, "u1", "energy"
        )
    assert exc.value.status["chrono_locked"] is True


@pytest.mark.asyncio
async def test_clarity_lock_allows_same_mode_continuation(db):
    await chrono_lock.record_clarity_module_consumption(
        db, "u1", "boundaries"
    )
    # Re-selecting the same mode is permitted during the window.
    await chrono_lock.assert_clarity_mode_switch_allowed(
        db, "u1", "boundaries"
    )


@pytest.mark.asyncio
async def test_clarity_lock_no_history_allows_any_mode(db):
    await chrono_lock.assert_clarity_mode_switch_allowed(
        db, "u_never", "grey_rocking"
    )
