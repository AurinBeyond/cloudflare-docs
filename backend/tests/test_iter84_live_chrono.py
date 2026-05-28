"""Live HTTP regression for iter 84 chrono-lock + truth sequence work.

Targets the public REACT_APP_BACKEND_URL — exercises guest paths plus the
authenticated body-temple + clarity/integration paths.
"""
from __future__ import annotations

import os
import uuid
from pathlib import Path

import pytest
import requests

ENV_FILE = Path("/app/frontend/.env")
for line in ENV_FILE.read_text().splitlines():
    if line.startswith("REACT_APP_BACKEND_URL="):
        BASE_URL = line.split("=", 1)[1].strip().rstrip("/")
        break
else:  # pragma: no cover
    raise RuntimeError("REACT_APP_BACKEND_URL missing")


@pytest.fixture(scope="module")
def session():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


@pytest.fixture(scope="module")
def auth_token(session):
    """Create a fresh test user via /api/auth/anonymous (preferred) or
    /api/auth/google fallback. Tries a few common endpoints."""
    # Most apps in this codebase have /api/auth/anonymous or /api/auth/guest.
    # Try a few in order. If none work we'll just use the well-known dev
    # session token from test_credentials.md.
    candidates = [
        ("/api/auth/anonymous", {}),
        ("/api/auth/guest", {}),
        ("/api/auth/dev-login", {"email": f"TEST_{uuid.uuid4().hex[:8]}@aurin.dev"}),
    ]
    for path, body in candidates:
        try:
            r = session.post(f"{BASE_URL}{path}", json=body, timeout=10)
            if r.status_code == 200:
                data = r.json()
                tok = data.get("session_token") or data.get("token") or data.get("access_token")
                if tok:
                    return tok
        except Exception:
            continue
    # Fall back to well-known dev token.
    return "ccb7b5b6-b89a-4e2b-b8d0-d25d18667cb8ae154a55d93342dc8ae34a83287340cd"


# ── Guest paths ─────────────────────────────────────────────────


def test_body_temple_overview_has_chrono_fields(session):
    r = session.get(f"{BASE_URL}/api/body-temple/overview", timeout=15)
    assert r.status_code == 200, r.text
    data = r.json()
    assert data.get("chrono_lock_days") == 7, data
    assert "week_unlocks" in data
    assert isinstance(data["week_unlocks"], dict)
    assert "enrollment_started_at" in data
    # Guest -> no enrollment yet
    assert data["enrollment_started_at"] is None
    assert data["week_unlocks"] == {} or len(data["week_unlocks"]) == 0


def test_body_temple_day_1_open_for_guest(session):
    r = session.get(f"{BASE_URL}/api/body-temple/day/1", timeout=15)
    assert r.status_code == 200, r.text
    data = r.json()
    assert data.get("chrono_locked") is False, data
    body_text = (data.get("body") or data.get("content") or data.get("preview") or "")
    # Must NOT be the locked placeholder text
    assert "locked" not in str(body_text).lower() or len(str(body_text)) > 40


def test_body_temple_day_8_locked_for_guest(session):
    r = session.get(f"{BASE_URL}/api/body-temple/day/8", timeout=15)
    assert r.status_code == 200, r.text
    data = r.json()
    assert data.get("chrono_locked") is True, data
    assert data.get("chrono_unlocks_at") is not None
    remaining = data.get("chrono_seconds_remaining", 0)
    # ~604800s with small drift tolerance
    assert 604000 <= remaining <= 605000, remaining


def test_clarity_integration_lock_guest(session):
    r = session.get(f"{BASE_URL}/api/clarity/integration-lock", timeout=15)
    assert r.status_code == 200, r.text
    data = r.json()
    assert data.get("chrono_locked") is False
    assert data.get("lock_hours") == 48
    assert data.get("last_mode") is None


def test_clarity_integration_consume_requires_auth(session):
    r = session.post(
        f"{BASE_URL}/api/clarity/integration-lock/consume",
        json={"mode": "boundaries"},
        timeout=15,
    )
    assert r.status_code in (401, 403), (r.status_code, r.text)


# ── Authenticated paths ─────────────────────────────────────────


def _auth(session, token):
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json",
                      "Authorization": f"Bearer {token}"})
    return s


def test_clarity_consume_then_blocks_other_mode(auth_token):
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json",
                      "Authorization": f"Bearer {auth_token}"})
    # Consume boundaries
    r = s.post(f"{BASE_URL}/api/clarity/integration-lock/consume",
               json={"mode": "boundaries"}, timeout=15)
    assert r.status_code == 200, r.text
    data = r.json()
    assert data.get("chrono_locked") is True
    assert data.get("unlock_at")
    rem = data.get("seconds_remaining", 0)
    assert 47 * 3600 <= rem <= 48 * 3600 + 60, rem

    # Switching to a different mode via /api/grace/mode should 423
    r2 = s.post(f"{BASE_URL}/api/grace/mode",
                json={"mode": "energy"}, timeout=15)
    assert r2.status_code == 423, (r2.status_code, r2.text)
    detail = r2.json().get("detail") or {}
    if isinstance(detail, dict):
        assert detail.get("code") == "chrono_locked", detail

    # Same mode is allowed
    r3 = s.post(f"{BASE_URL}/api/grace/mode",
                json={"mode": "boundaries"}, timeout=15)
    assert r3.status_code == 200, (r3.status_code, r3.text)


def test_body_temple_complete_then_locked_week2():
    """Provision a brand-new test user directly in Mongo, grant the
    body_temple_unlock perk, exercise complete(day=2) -> 200, then
    complete(day=8) -> 423 chrono_locked."""
    import asyncio
    from datetime import datetime, timezone
    from motor.motor_asyncio import AsyncIOMotorClient

    mongo_url = os.environ.get("MONGO_URL", "mongodb://localhost:27017")
    db_name = os.environ.get("DB_NAME", "test_database")

    user_id = f"user_iter84_{uuid.uuid4().hex[:8]}"
    token = f"TEST_iter84_{uuid.uuid4().hex}"

    async def seed():
        client = AsyncIOMotorClient(mongo_url)
        d = client[db_name]
        await d.users.insert_one({
            "user_id": user_id,
            "email": f"{user_id}@aurin.test",
            "created_at": datetime.now(timezone.utc).isoformat(),
        })
        await d.user_sessions.insert_one({
            "session_token": token,
            "user_id": user_id,
            "created_at": datetime.now(timezone.utc).isoformat(),
        })
        # Grant the perk so day 2 (week 1, premium) passes the gate.
        await d.body_temple_unlocks.update_one(
            {"user_id": user_id},
            {"$setOnInsert": {"user_id": user_id,
                              "granted_at": datetime.now(timezone.utc).isoformat()}},
            upsert=True,
        )
        client.close()

    async def cleanup():
        client = AsyncIOMotorClient(mongo_url)
        d = client[db_name]
        await d.users.delete_one({"user_id": user_id})
        await d.user_sessions.delete_one({"session_token": token})
        await d.body_temple_unlocks.delete_one({"user_id": user_id})
        await d.body_temple_enrollments.delete_one({"user_id": user_id})
        await d.body_temple_progress.delete_many({"user_id": user_id})
        client.close()

    asyncio.run(seed())
    try:
        s = requests.Session()
        s.headers.update({"Content-Type": "application/json",
                          "Authorization": f"Bearer {token}"})
        # Complete day 2 (week 1)
        r = s.post(f"{BASE_URL}/api/body-temple/complete",
                   json={"day": 2}, timeout=15)
        assert r.status_code == 200, (r.status_code, r.text)

    # Day 8 should now be chrono_locked for this enrolled user
        r2 = s.post(f"{BASE_URL}/api/body-temple/complete",
                    json={"day": 8}, timeout=15)
        assert r2.status_code == 423, (r2.status_code, r2.text)
        body = r2.json()
        detail = body.get("detail") or body
        if isinstance(detail, dict):
            assert detail.get("code") == "chrono_locked", detail
            assert "unlock_at" in detail
            assert detail.get("seconds_remaining", 0) > 600000
    finally:
        asyncio.run(cleanup())
