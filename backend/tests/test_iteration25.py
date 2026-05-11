"""Iteration 25 — Threshold + EmergencyExit + Pruesoul webhook integration.

Coverage:
  1. /api/clarity/prefs GET unauth → 401
  2. /api/clarity/prefs GET fresh user → has_consented=false, defaults
  3. /api/clarity/prefs POST stamps consent_v2_at + guide_gender
  4. /api/clarity/emergency-exit POST closes active session w/ reason
  5. Pruesoul webhook accepts the live shared secret; replay idempotent
  6. Pruesoul webhook rejects bad signature
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

# Live shared secret with the pure-soul-life landing page agent.
PRUESOUL_SECRET = "Z_17var8A-ygzid-6XFp1q6ExUtaQtNS"


@pytest.fixture(scope="module")
def mongo_db():
    client = MongoClient(MONGO_URL)
    db = client[DB_NAME]
    yield db
    client.close()


def _h(token):
    return {"Authorization": f"Bearer {token}"}


def _make_user(mongo_db):
    user_id = f"test-it25-{uuid.uuid4().hex[:8]}"
    token = f"test_session_it25_{uuid.uuid4().hex}"
    mongo_db.users.insert_one({
        "user_id": user_id,
        "email": f"{user_id}@example.com",
        "name": "Iter25",
        "picture": "https://via.placeholder.com/150",
        "role": "member",
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
    mongo_db.cabinet_sessions.delete_many({"user_id": user_id})
    mongo_db.clarity_user_prefs.delete_many({"user_id": user_id})


@pytest.fixture
def member(mongo_db):
    token, user_id = _make_user(mongo_db)
    yield (token, user_id)
    _purge_user(mongo_db, user_id, token)


# ------------- Clarity prefs --------------------------------------

def test_prefs_unauth_401():
    r = requests.get(f"{BASE_URL}/api/clarity/prefs", timeout=10)
    assert r.status_code == 401


def test_prefs_fresh_user(member):
    token, _ = member
    r = requests.get(f"{BASE_URL}/api/clarity/prefs", headers=_h(token), timeout=10)
    assert r.status_code == 200
    body = r.json()
    assert body["has_consented"] is False
    assert body["guide_gender"] is None
    assert body["display_mode"] == "text"
    assert body["consent_version_current"] == "v2"


def test_prefs_stamp_consent(member, mongo_db):
    token, user_id = member
    r = requests.post(
        f"{BASE_URL}/api/clarity/prefs",
        headers=_h(token),
        json={"guide_gender": "female", "consent_v2": True},
        timeout=10,
    )
    assert r.status_code == 200
    body = r.json()
    assert body["has_consented"] is True
    assert body["guide_gender"] == "female"
    assert body["consent_v2_at"] is not None
    # Persisted in DB
    doc = mongo_db.clarity_user_prefs.find_one({"user_id": user_id})
    assert doc is not None
    assert doc["guide_gender"] == "female"
    assert doc["consent_v2_at"] is not None


def test_prefs_validation_rejects_unknown_gender(member):
    token, _ = member
    r = requests.post(
        f"{BASE_URL}/api/clarity/prefs",
        headers=_h(token),
        json={"guide_gender": "neutral", "consent_v2": True},
        timeout=10,
    )
    assert r.status_code == 422


# ------------- Emergency Exit -------------------------------------

def test_emergency_exit_closes_active_session(member, mongo_db):
    token, user_id = member
    # Open a session
    requests.post(f"{BASE_URL}/api/cabinet/start", headers=_h(token), timeout=10)
    sess = mongo_db.cabinet_sessions.find_one({"user_id": user_id, "closed": False})
    assert sess is not None
    # Pull the trigger
    r = requests.post(
        f"{BASE_URL}/api/clarity/emergency-exit", headers=_h(token), timeout=10
    )
    assert r.status_code == 200
    assert r.json()["status"] == "exited"
    # Session should now be closed AND tagged with the reason
    sess2 = mongo_db.cabinet_sessions.find_one({"id": sess["id"]})
    assert sess2["closed"] is True
    assert sess2.get("closed_reason") == "emergency_exit"


def test_emergency_exit_safe_without_active_session(member):
    """Calling emergency exit when there's no open session must still 200."""
    token, _ = member
    r = requests.post(
        f"{BASE_URL}/api/clarity/emergency-exit", headers=_h(token), timeout=10
    )
    assert r.status_code == 200


# ------------- Pruesoul webhook (live secret) ---------------------

def test_pruesoul_webhook_rejects_bad_signature():
    body = {"event": "waitlist.joined", "email": "bad-sig@example.com"}
    r = requests.post(
        f"{BASE_URL}/api/integrations/pruesoul/webhook",
        headers={
            "Content-Type": "application/json",
            "X-Aurin-Event": "waitlist.joined",
            "X-Aurin-Signature": "totally-wrong",
        },
        json=body,
        timeout=10,
    )
    assert r.status_code == 401


def test_pruesoul_webhook_accepts_live_secret_and_replays(mongo_db):
    body = {
        "event": "waitlist.joined",
        "email": f"it25-{uuid.uuid4().hex[:8]}@example.com",
        "position": 1,
        "cycle_next": "02",
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    r1 = requests.post(
        f"{BASE_URL}/api/integrations/pruesoul/webhook",
        headers={
            "Content-Type": "application/json",
            "X-Aurin-Event": "waitlist.joined",
            "X-Aurin-Signature": PRUESOUL_SECRET,
        },
        json=body,
        timeout=10,
    )
    assert r1.status_code == 200
    assert r1.json()["status"] == "ok"

    # Replay — also 200, no duplicate row.
    r2 = requests.post(
        f"{BASE_URL}/api/integrations/pruesoul/webhook",
        headers={
            "Content-Type": "application/json",
            "X-Aurin-Event": "waitlist.joined",
            "X-Aurin-Signature": PRUESOUL_SECRET,
        },
        json=body,
        timeout=10,
    )
    assert r2.status_code == 200
    n = mongo_db.pruesoul_waitlist.count_documents({"email": body["email"]})
    assert n == 1
    # Cleanup
    mongo_db.pruesoul_waitlist.delete_many({"email": body["email"]})
    mongo_db.pruesoul_events.delete_many({"email": body["email"]})


def test_pruesoul_webhook_enrollment_mirrors_into_beta_counter(mongo_db):
    eid = f"it25-enrol-{uuid.uuid4().hex[:8]}"
    body = {
        "event": "enrollment.created",
        "enrollment_id": eid,
        "email": f"{eid}@example.com",
        "name": "Iter25 Wanderer",
        "spot_number": 1,
        "spots_left": 9,
        "reflection_consent": True,
        "trial_start": datetime.now(timezone.utc).isoformat(),
        "trial_end": (datetime.now(timezone.utc) + timedelta(days=14)).isoformat(),
        "trial_days": 14,
        "access_token": "tok_test",
        "portal_url": "https://pure-soul.life/portal/tok_test",
        "cycle": "01",
        "source": "test-group",
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    pre = mongo_db.beta_enrollments.count_documents({})
    r = requests.post(
        f"{BASE_URL}/api/integrations/pruesoul/webhook",
        headers={
            "Content-Type": "application/json",
            "X-Aurin-Event": "enrollment.created",
            "X-Aurin-Signature": PRUESOUL_SECRET,
        },
        json=body,
        timeout=10,
    )
    assert r.status_code == 200
    post = mongo_db.beta_enrollments.count_documents({})
    assert post == pre + 1
    mirrored = mongo_db.beta_enrollments.find_one({"user_id": f"pruesoul:{eid}"})
    assert mirrored is not None
    assert mirrored.get("source") == "pruesoul"
    # Cleanup
    mongo_db.pruesoul_enrollments.delete_many({"enrollment_id": eid})
    mongo_db.beta_enrollments.delete_many({"user_id": f"pruesoul:{eid}"})
    mongo_db.pruesoul_events.delete_many({"enrollment_id": eid})
