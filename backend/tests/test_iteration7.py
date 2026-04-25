"""
Iteration 7 backend tests: The Beginning guided experience + regression on books/brand.

We bypass Emergent OAuth by inserting synthetic user + user_sessions docs directly
into Mongo and using Authorization: Bearer <session_token>.
"""
import os
import uuid
import time
from datetime import datetime, timedelta, timezone

import pytest
import pymongo
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "").rstrip("/")
assert BASE_URL, "REACT_APP_BACKEND_URL must be set"

# Connect directly to local Mongo (same as backend)
MONGO_URL = os.environ.get("MONGO_URL", "mongodb://localhost:27017")
DB_NAME = os.environ.get("DB_NAME", "test_database")

_mongo = pymongo.MongoClient(MONGO_URL)
_db = _mongo[DB_NAME]


# ---------- Auth session injection ----------

@pytest.fixture(scope="module")
def synth_user():
    user_id = f"TEST_USER_{uuid.uuid4().hex[:8]}"
    email = f"TEST_{uuid.uuid4().hex[:6]}@example.com"
    session_token = f"TEST_TOKEN_{uuid.uuid4().hex}"
    expires_at = (datetime.now(timezone.utc) + timedelta(days=7)).isoformat()

    _db.users.insert_one({
        "user_id": user_id,
        "email": email,
        "name": "Test Beginning",
        "role": "member",
        "created_at": datetime.now(timezone.utc).isoformat(),
    })
    _db.user_sessions.insert_one({
        "session_token": session_token,
        "user_id": user_id,
        "expires_at": expires_at,
        "created_at": datetime.now(timezone.utc).isoformat(),
    })
    yield {"user_id": user_id, "email": email, "token": session_token}
    # Cleanup
    _db.users.delete_one({"user_id": user_id})
    _db.user_sessions.delete_one({"session_token": session_token})
    _db.experience_progress.delete_many({"user_id": user_id})


@pytest.fixture
def auth_headers(synth_user):
    return {"Authorization": f"Bearer {synth_user['token']}"}


# ---------- Unauthenticated 401 checks ----------

class TestExperienceUnauthenticated:
    def test_me_401(self):
        r = requests.get(f"{BASE_URL}/api/experience/the-beginning/me", timeout=10)
        assert r.status_code == 401, r.text

    def test_start_401(self):
        r = requests.post(f"{BASE_URL}/api/experience/the-beginning/start", timeout=10)
        assert r.status_code == 401, r.text

    def test_reflect_401(self):
        r = requests.post(
            f"{BASE_URL}/api/experience/the-beginning/reflect",
            json={"text": "hello there"},
            timeout=10,
        )
        assert r.status_code == 401, r.text

    def test_reset_401(self):
        r = requests.post(f"{BASE_URL}/api/experience/the-beginning/reset", timeout=10)
        assert r.status_code == 401, r.text


# ---------- Authenticated full flow ----------

class TestExperienceFlow:
    def test_initial_me(self, auth_headers, synth_user):
        # Ensure clean slate
        _db.experience_progress.delete_many({"user_id": synth_user["user_id"]})
        r = requests.get(f"{BASE_URL}/api/experience/the-beginning/me",
                         headers=auth_headers, timeout=10)
        assert r.status_code == 200, r.text
        data = r.json()
        assert data["started"] is False
        assert data["current_step"] == 1
        assert data["total_steps"] == 7
        assert data["completed_steps"] == []
        assert data["is_done"] is False
        assert data["step"] is not None
        assert data["step"]["n"] == 1
        assert data["step"]["intro"]
        assert data["step"]["guidance"]
        assert data["step"]["prompt"]

    def test_start_sets_started(self, auth_headers):
        r = requests.post(f"{BASE_URL}/api/experience/the-beginning/start",
                          headers=auth_headers, timeout=10)
        assert r.status_code == 200, r.text
        assert r.json()["status"] in ("started", "already_started")

        r2 = requests.get(f"{BASE_URL}/api/experience/the-beginning/me",
                          headers=auth_headers, timeout=10)
        assert r2.status_code == 200
        assert r2.json()["started"] is True

    def test_reflect_empty_400(self, auth_headers):
        r = requests.post(f"{BASE_URL}/api/experience/the-beginning/reflect",
                          headers=auth_headers, json={"text": ""}, timeout=10)
        assert r.status_code == 400, r.text

    def test_reflect_too_short_400(self, auth_headers):
        r = requests.post(f"{BASE_URL}/api/experience/the-beginning/reflect",
                          headers=auth_headers, json={"text": "hi"}, timeout=10)
        assert r.status_code == 400, r.text

    def test_full_seven_step_flow(self, auth_headers, synth_user):
        # Reset to start clean
        rr = requests.post(f"{BASE_URL}/api/experience/the-beginning/reset",
                           headers=auth_headers, timeout=10)
        assert rr.status_code == 200

        # First reflection should auto-start
        for n in range(1, 8):
            payload = {
                "text": f"Step {n}: I noticed something small today.",
                "presence": (n % 5) + 1,
            }
            r = requests.post(f"{BASE_URL}/api/experience/the-beginning/reflect",
                              headers=auth_headers, json=payload, timeout=10)
            assert r.status_code == 200, f"step {n}: {r.text}"
            data = r.json()
            if n < 7:
                assert data["is_done"] is False, f"step {n}: should not be done"
                assert data["next_step"] == n + 1
                assert data["pause_seconds"] >= 1
            else:
                assert data["is_done"] is True
                assert data["pause_seconds"] == 0

        # Final state
        me = requests.get(f"{BASE_URL}/api/experience/the-beginning/me",
                          headers=auth_headers, timeout=10).json()
        assert me["is_done"] is True
        assert sorted(me["completed_steps"]) == [1, 2, 3, 4, 5, 6, 7]
        assert len(me["reflections"]) == 7
        # Each reflection persisted with text
        for ref in me["reflections"]:
            assert ref["text"]
            assert ref["n"] in range(1, 8)

    def test_reset_clears(self, auth_headers):
        r = requests.post(f"{BASE_URL}/api/experience/the-beginning/reset",
                          headers=auth_headers, timeout=10)
        assert r.status_code == 200
        me = requests.get(f"{BASE_URL}/api/experience/the-beginning/me",
                          headers=auth_headers, timeout=10).json()
        assert me["started"] is False
        assert me["current_step"] == 1
        assert me["completed_steps"] == []
        assert me["reflections"] == []
        assert me["is_done"] is False


# ---------- Regression: books + brand ----------

class TestRegression:
    def test_books_still_six(self):
        r = requests.get(f"{BASE_URL}/api/books", timeout=10)
        assert r.status_code == 200
        books = r.json()
        assert len(books) == 6

    def test_brand_entry_exists(self):
        r = requests.get(f"{BASE_URL}/api/content/entries?surface=brand", timeout=10)
        assert r.status_code == 200
        data = r.json()
        # Should be a list of entries with at least one
        assert isinstance(data, list)
        assert len(data) >= 1
