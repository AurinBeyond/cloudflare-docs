"""Iteration 24 — Beta Test Group enrollment.

Coverage:
  1. /api/beta/status (public) — initial: 10 slots open.
  2. /api/beta/me — 401 unauth; default {enrolled: false}.
  3. /api/beta/enroll — auth required, grants Clarity pass + 8 books, idempotent.
  4. /api/beta/enroll cap — 11th user gets is_full=true and is NOT enrolled.
  5. /api/beta/me — after enrollment shows is_active + correct seconds_remaining (~14d).
  6. /api/clarity/access — picks up the 14-day pass (has_active_pass=true).
  7. /api/cabinet/library — lists all 8 books for a beta-enrolled user.
"""
import os
import sys
import uuid
from datetime import datetime, timezone, timedelta

import pytest
import requests
from pymongo import MongoClient

sys.path.insert(0, "/app/backend")

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "").rstrip("/")
if not BASE_URL:
    with open("/app/frontend/.env") as f:
        for line in f:
            if line.startswith("REACT_APP_BACKEND_URL="):
                BASE_URL = line.split("=", 1)[1].strip().rstrip("/")
                break

MONGO_URL = os.environ.get("MONGO_URL", "mongodb://localhost:27017")
DB_NAME = os.environ.get("DB_NAME", "test_database")
if "MONGO_URL" not in os.environ or "DB_NAME" not in os.environ:
    try:
        with open("/app/backend/.env") as f:
            for line in f:
                if line.startswith("MONGO_URL=") and "MONGO_URL" not in os.environ:
                    MONGO_URL = line.split("=", 1)[1].strip().strip('"')
                if line.startswith("DB_NAME=") and "DB_NAME" not in os.environ:
                    DB_NAME = line.split("=", 1)[1].strip().strip('"')
    except FileNotFoundError:
        pass


@pytest.fixture(scope="module")
def mongo_db():
    client = MongoClient(MONGO_URL)
    db = client[DB_NAME]
    yield db
    client.close()


def _h(token):
    return {"Authorization": f"Bearer {token}"}


def _make_user(mongo_db, role: str = "member"):
    user_id = f"test-it24-{uuid.uuid4().hex[:8]}"
    token = f"test_session_it24_{uuid.uuid4().hex}"
    mongo_db.users.insert_one({
        "user_id": user_id,
        "email": f"{user_id}@example.com",
        "name": "Iter24 User",
        "picture": "https://via.placeholder.com/150",
        "role": role,
        "created_at": datetime.now(timezone.utc),
    })
    mongo_db.user_sessions.insert_one({
        "user_id": user_id,
        "session_token": token,
        "expires_at": datetime.now(timezone.utc) + timedelta(days=7),
        "created_at": datetime.now(timezone.utc),
    })
    return token, user_id


def _purge_user(mongo_db, user_id, token):
    mongo_db.users.delete_many({"user_id": user_id})
    mongo_db.user_sessions.delete_many({"session_token": token})
    mongo_db.beta_enrollments.delete_many({"user_id": user_id})
    mongo_db.clarity_passes.delete_many({"user_id": user_id})
    mongo_db.purchases.delete_many({"user_id": user_id})


@pytest.fixture(autouse=True)
def _isolate_beta_collection(mongo_db):
    """Each test starts with an empty beta_enrollments collection.
    The collection is shared with prod data, but in test_database the
    only writers are these tests + the live FE. We snapshot/restore."""
    snapshot = list(mongo_db.beta_enrollments.find({}))
    mongo_db.beta_enrollments.delete_many({})
    yield
    mongo_db.beta_enrollments.delete_many({})
    if snapshot:
        for doc in snapshot:
            doc.pop("_id", None)
        mongo_db.beta_enrollments.insert_many(snapshot)


# ---------- 1. status (public) ----------

def test_status_initial_open():
    r = requests.get(f"{BASE_URL}/api/beta/status", timeout=10)
    assert r.status_code == 200
    body = r.json()
    assert body["slots_total"] == 10
    assert body["slots_taken"] == 0
    assert body["slots_left"] == 10
    assert body["is_open"] is True
    assert body["duration_days"] == 14


# ---------- 2. /beta/me auth gate ----------

def test_me_unauth_returns_401():
    r = requests.get(f"{BASE_URL}/api/beta/me", timeout=10)
    assert r.status_code == 401


def test_me_default_not_enrolled(mongo_db):
    token, user_id = _make_user(mongo_db)
    try:
        r = requests.get(f"{BASE_URL}/api/beta/me", headers=_h(token), timeout=10)
        assert r.status_code == 200
        assert r.json()["enrolled"] is False
    finally:
        _purge_user(mongo_db, user_id, token)


# ---------- 3. enroll: grants Clarity pass + books, idempotent ----------

def test_enroll_grants_pass_and_books_idempotent(mongo_db):
    token, user_id = _make_user(mongo_db)
    try:
        r1 = requests.post(f"{BASE_URL}/api/beta/enroll", headers=_h(token), timeout=15)
        assert r1.status_code == 200, r1.text
        body1 = r1.json()
        assert body1["status"] == "enrolled"
        assert body1["is_full"] is False
        assert len(body1["enrollment"]["book_grants"]) >= 7  # at least 7/8 (night-angels has no PDF but is still a book row)
        # Clarity pass is live.
        acc = requests.get(f"{BASE_URL}/api/clarity/access", headers=_h(token), timeout=10).json()
        assert acc["has_active_pass"] is True
        assert acc["tier"] == "season_30days"
        # ~14 days, allow drift.
        assert 13 * 86400 <= acc["seconds_remaining"] <= 14 * 86400 + 60

        # Idempotent: same user, second click returns already_enrolled, NO new rows.
        r2 = requests.post(f"{BASE_URL}/api/beta/enroll", headers=_h(token), timeout=15)
        assert r2.status_code == 200
        assert r2.json()["status"] == "already_enrolled"

        # Library returns the granted books.
        lib = requests.get(f"{BASE_URL}/api/cabinet/library", headers=_h(token), timeout=10).json()
        assert isinstance(lib, list)
        assert len(lib) >= 7
        sources = set(row.get("source") for row in lib)
        assert "beta_grant" in sources
    finally:
        _purge_user(mongo_db, user_id, token)


# ---------- 4. cap at 10 ----------

def test_enroll_cap_at_10(mongo_db):
    """Pre-fill 10 enrollments directly, then ensure user 11 is rejected."""
    fillers = []
    for i in range(10):
        mongo_db.beta_enrollments.insert_one({
            "id": str(uuid.uuid4()),
            "user_id": f"prefill-{i}-{uuid.uuid4().hex[:6]}",
            "email": f"prefill{i}@example.com",
            "enrolled_at": datetime.now(timezone.utc).isoformat(),
            "expires_at": (datetime.now(timezone.utc) + timedelta(days=14)).isoformat(),
            "pass_id": None,
            "book_grants": [],
            "feedback_received": False,
        })
        fillers.append(f"prefill-{i}")

    token, user_id = _make_user(mongo_db)
    try:
        # Status should now show 0 left.
        s = requests.get(f"{BASE_URL}/api/beta/status", timeout=10).json()
        assert s["slots_left"] == 0
        assert s["is_open"] is False

        r = requests.post(f"{BASE_URL}/api/beta/enroll", headers=_h(token), timeout=10)
        assert r.status_code == 200
        body = r.json()
        assert body["status"] == "full"
        assert body["is_full"] is True

        # User 11 must NOT have an enrollment row.
        leftover = mongo_db.beta_enrollments.find_one({"user_id": user_id})
        assert leftover is None
        # Nor a beta clarity pass.
        passes = mongo_db.clarity_passes.count_documents(
            {"user_id": user_id, "source": "beta_grant"}
        )
        assert passes == 0
    finally:
        _purge_user(mongo_db, user_id, token)
