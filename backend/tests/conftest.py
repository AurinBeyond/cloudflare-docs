"""Shared pytest fixtures for Matrix Aurin backend tests.

Creates ephemeral `member` and `admin` users directly in MongoDB for
tests that need authenticated requests, and cleans them up after the
test completes. Does NOT touch existing real users.
"""
import os
import uuid
from datetime import datetime, timedelta, timezone

import pytest
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv("/app/backend/.env")
MONGO_URL = os.environ["MONGO_URL"]
DB_NAME = os.environ["DB_NAME"]


@pytest.fixture(scope="session")
def mongo_db():
    client = MongoClient(MONGO_URL)
    db = client[DB_NAME]
    yield db
    client.close()


def _make_user(mongo_db, role: str = "member"):
    user_id = f"test-conftest-{uuid.uuid4().hex[:8]}"
    token = f"test_session_conftest_{uuid.uuid4().hex}"
    mongo_db.users.insert_one({
        "user_id": user_id,
        "email": f"{user_id}@example.com",
        "name": "Conftest User",
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


def _cleanup_user(mongo_db, user_id, token):
    mongo_db.users.delete_many({"user_id": user_id})
    mongo_db.user_sessions.delete_many({"session_token": token})
    mongo_db.cabinet_sessions.delete_many({"user_id": user_id})
    mongo_db.clarity_passes.delete_many({"user_id": user_id})
    mongo_db.body_insights.delete_many({"user_id": user_id})


@pytest.fixture
def member(mongo_db):
    token, user_id = _make_user(mongo_db, role="member")
    yield (token, user_id)
    _cleanup_user(mongo_db, user_id, token)


@pytest.fixture
def admin(mongo_db):
    token, user_id = _make_user(mongo_db, role="admin")
    yield (token, user_id)
    _cleanup_user(mongo_db, user_id, token)
