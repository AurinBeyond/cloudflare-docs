"""Iteration 17 — pre-sales activation pass.

Tests the two NEW endpoints introduced in iteration 17:
  • GET /api/experience/the-beginning/step/{n}
  • GET /api/cabinet/library

Same auth pattern as iter11/14 — synthetic Mongo user_session.
"""
import os
import uuid
from datetime import datetime, timezone, timedelta

import pytest
import requests
from pymongo import MongoClient

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


@pytest.fixture
def auth_session(mongo_db):
    user_id = f"test-it17-{uuid.uuid4().hex[:8]}"
    session_token = f"test_session_it17_{uuid.uuid4().hex}"
    mongo_db.users.insert_one({
        "user_id": user_id,
        "email": f"test.it17.{user_id}@example.com",
        "name": "Iter17 Test User",
        "picture": "https://via.placeholder.com/150",
        "role": "member",
        "created_at": datetime.now(timezone.utc),
    })
    mongo_db.user_sessions.insert_one({
        "user_id": user_id,
        "session_token": session_token,
        "expires_at": datetime.now(timezone.utc) + timedelta(days=7),
        "created_at": datetime.now(timezone.utc),
    })
    yield (session_token, user_id)
    mongo_db.users.delete_many({"user_id": user_id})
    mongo_db.user_sessions.delete_many({"session_token": session_token})
    mongo_db.experience_progress.delete_many({"user_id": user_id})
    mongo_db.purchases.delete_many({"user_id": user_id})


def _h(token):
    return {"Authorization": f"Bearer {token}"}


# ============================================================================
# GET /api/experience/the-beginning/step/{n}
# ============================================================================

def test_step_view_requires_auth():
    r = requests.get(f"{BASE_URL}/api/experience/the-beginning/step/1")
    assert r.status_code == 401, r.text


def test_step_view_404_when_n_out_of_range(auth_session):
    token, _ = auth_session
    r = requests.get(f"{BASE_URL}/api/experience/the-beginning/step/0", headers=_h(token))
    assert r.status_code == 404
    r = requests.get(f"{BASE_URL}/api/experience/the-beginning/step/8", headers=_h(token))
    assert r.status_code == 404


def test_step_view_403_when_step_not_completed(auth_session):
    token, _ = auth_session
    # Fresh user — no progress => step 1 not completed yet
    r = requests.get(f"{BASE_URL}/api/experience/the-beginning/step/1", headers=_h(token))
    assert r.status_code == 403


def test_step_view_200_when_completed(auth_session, mongo_db):
    token, user_id = auth_session
    # Seed completed step 1 with a reflection
    mongo_db.experience_progress.insert_one({
        "id": str(uuid.uuid4()),
        "user_id": user_id,
        "experience_slug": "the-beginning",
        "completed_steps": [1, 2, 3],
        "reflections": [
            {"n": 1, "text": "TEST_reflect_step1", "saved_at": datetime.now(timezone.utc).isoformat()},
            {"n": 2, "text": "TEST_reflect_step2", "saved_at": datetime.now(timezone.utc).isoformat()},
            {"n": 3, "text": "TEST_reflect_step3", "saved_at": datetime.now(timezone.utc).isoformat()},
        ],
        "started_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat(),
    })
    r = requests.get(f"{BASE_URL}/api/experience/the-beginning/step/1", headers=_h(token))
    assert r.status_code == 200, r.text
    d = r.json()
    assert d["n"] == 1
    assert d["total_steps"] == 7
    assert d["is_last"] is False
    # Step shape matches the existing public schema (intro/guidance/prompt) — same as /me
    assert "step" in d
    assert d["step"].get("prompt")
    assert d["step"].get("intro")
    assert d["step"].get("guidance")
    assert d["step"]["n"] == 1
    assert d["reflection"] is not None
    assert d["reflection"]["text"] == "TEST_reflect_step1"

    # last step (when seeded)
    mongo_db.experience_progress.update_one(
        {"user_id": user_id, "experience_slug": "the-beginning"},
        {"$set": {"completed_steps": list(range(1, 8))}}
    )
    r7 = requests.get(f"{BASE_URL}/api/experience/the-beginning/step/7", headers=_h(token))
    assert r7.status_code == 200
    assert r7.json()["is_last"] is True


# ============================================================================
# GET /api/cabinet/library
# ============================================================================

def test_cabinet_library_requires_auth():
    r = requests.get(f"{BASE_URL}/api/cabinet/library")
    assert r.status_code == 401


def test_cabinet_library_empty_for_fresh_user(auth_session):
    token, _ = auth_session
    r = requests.get(f"{BASE_URL}/api/cabinet/library", headers=_h(token))
    assert r.status_code == 200
    assert r.json() == []


def test_cabinet_library_returns_purchased_book(auth_session, mongo_db):
    token, user_id = auth_session
    # Pick any seeded book that exists
    book = mongo_db.books.find_one({}, {"_id": 0})
    assert book is not None, "Seed books missing in db"
    slug = book["slug"]
    mongo_db.purchases.insert_one({
        "id": str(uuid.uuid4()),
        "user_id": user_id,
        "book_slug": slug,
        "source": "manual_grant",
        "granted_at": datetime.now(timezone.utc).isoformat(),
    })
    r = requests.get(f"{BASE_URL}/api/cabinet/library", headers=_h(token))
    assert r.status_code == 200
    d = r.json()
    assert isinstance(d, list) and len(d) == 1
    row = d[0]
    assert row["book_slug"] == slug
    assert row["title"] == book.get("title")
    assert row["source"] == "manual_grant"
    assert "granted_at" in row
    assert "cover_image_url" in row
    assert "pdf_url" in row
    assert "external_read_url" in row
