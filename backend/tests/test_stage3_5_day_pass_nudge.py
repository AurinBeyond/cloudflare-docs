"""
Sprint C: day-pass hour-22 nudge regression.

Verifies:
  - Only grants in the [22h, 23h]-from-grant window are scanned.
  - Nudge is idempotent (same grant nudged at most once).
  - Adult and child day-passes are routed to the correct upgrade target.
"""
from __future__ import annotations

import asyncio
import os
import sys
import uuid
from datetime import datetime, timezone, timedelta
from pathlib import Path

import pytest
import pytest_asyncio
from motor.motor_asyncio import AsyncIOMotorClient

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from services import credit_ledger, day_pass_nudge  # noqa: E402


@pytest_asyncio.fixture
async def db():
    client = AsyncIOMotorClient(os.environ["MONGO_URL"])
    test_db = client[f"sprint_c_test_{uuid.uuid4().hex[:6]}"]
    yield test_db
    await client.drop_database(test_db.name)
    client.close()


async def _seed_user(db, user_id, email):
    await db.users.insert_one({"id": user_id, "email": email})


async def _grant_at(db, user_id, sku, hours_ago):
    """Create a credit grant whose `granted_at` is exactly N hours ago."""
    granted_at = datetime.now(timezone.utc) - timedelta(hours=hours_ago)
    await db.user_credits.insert_one(
        {
            "grant_id": str(uuid.uuid4()),
            "user_id": user_id,
            "wallet": "kids" if sku == "access.day.kids" else "adult",
            "source_sku": sku,
            "source_payment_id": f"pay_{uuid.uuid4().hex[:8]}",
            "minutes_granted": 10,
            "minutes_remaining": 10,
            "granted_at": granted_at.isoformat(),
            "expires_at": (granted_at + timedelta(hours=24)).isoformat(),
        }
    )


@pytest.mark.asyncio
async def test_nudge_fires_only_in_22_to_23_hour_window(db):
    sent_log = []

    async def fake_send(to_email, subj, body):
        sent_log.append((to_email, subj))

    await _seed_user(db, "u1", "u1@test.com")
    await _seed_user(db, "u2", "u2@test.com")
    await _seed_user(db, "u3", "u3@test.com")
    await _grant_at(db, "u1", "access.day.quiet", 22.5)  # in window
    await _grant_at(db, "u2", "access.day.quiet", 5)     # too early
    await _grant_at(db, "u3", "access.day.quiet", 30)    # too late (pass expired)

    out = await day_pass_nudge.run_once(db, resend_send_fn=fake_send)
    assert out["sent"] == 1
    assert sent_log[0][0] == "u1@test.com"


@pytest.mark.asyncio
async def test_nudge_is_idempotent(db):
    sent_log = []

    async def fake_send(to_email, subj, body):
        sent_log.append(to_email)

    await _seed_user(db, "u1", "u1@test.com")
    await _grant_at(db, "u1", "access.day.kids", 22.5)

    r1 = await day_pass_nudge.run_once(db, resend_send_fn=fake_send)
    r2 = await day_pass_nudge.run_once(db, resend_send_fn=fake_send)
    assert r1["sent"] == 1
    assert r2["sent"] == 0
    assert len(sent_log) == 1


@pytest.mark.asyncio
async def test_kids_pass_routes_to_aurin_storyteller(db):
    captured = []

    async def fake_send(to_email, subj, body):
        captured.append(body)

    await _seed_user(db, "u_parent", "p@test.com")
    await _grant_at(db, "u_parent", "access.day.kids", 22.5)
    await day_pass_nudge.run_once(db, resend_send_fn=fake_send)
    assert len(captured) == 1
    assert "Aurin Storyteller" in captured[0]
    assert "aurin.storyteller.month" in captured[0]


@pytest.mark.asyncio
async def test_deep_pass_routes_to_inner_compass(db):
    captured = []

    async def fake_send(to_email, subj, body):
        captured.append(body)

    await _seed_user(db, "u_op", "o@test.com")
    await _grant_at(db, "u_op", "access.day.deep", 22.5)
    await day_pass_nudge.run_once(db, resend_send_fn=fake_send)
    assert len(captured) == 1
    assert "Inner Compass" in captured[0]
    assert "inner.compass.month" in captured[0]
