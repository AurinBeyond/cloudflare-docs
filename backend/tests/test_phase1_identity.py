"""§Phase 1 — Identity / Entry regression (additive, low-risk).

Verifies:
- /api/me anonymous: returns {authenticated: false}
- /api/auth/magic-link/request: idempotent on email, returns 200
- /api/auth/magic-link/verify:
    * sets a session_token cookie
    * is single-use (second call returns 410)
    * rejects unknown tokens (404)
- /api/me authenticated (via Bearer): returns identity + rooms map
"""
import os
import pytest
from fastapi.testclient import TestClient

os.environ.setdefault("DB_NAME", "matrix_aurin_test")

from server import app  # noqa: E402


@pytest.fixture(scope="module")
def client():
    with TestClient(app) as c:
        yield c


def test_me_anonymous(client):
    r = client.get("/api/me")
    assert r.status_code == 200
    j = r.json()
    assert j["authenticated"] is False


def test_magic_link_request_idempotent(client, monkeypatch):
    import email_service
    monkeypatch.setattr(email_service, "is_configured", lambda: False)
    r = client.post(
        "/api/auth/magic-link/request",
        json={"email": "phase1-pytest@example.com"},
    )
    assert r.status_code == 200
    assert r.json()["status"] == "ok"
    # Second call replaces the token (idempotent on email).
    r2 = client.post(
        "/api/auth/magic-link/request",
        json={"email": "phase1-pytest@example.com"},
    )
    assert r2.status_code == 200


def test_magic_link_verify_sets_cookie_and_is_single_use(client, monkeypatch):
    import email_service
    monkeypatch.setattr(email_service, "is_configured", lambda: False)
    # Request a fresh token
    client.post(
        "/api/auth/magic-link/request",
        json={"email": "phase1-pytest-verify@example.com"},
    )
    # Read the token directly out of the magic_link_tokens collection
    from pymongo import MongoClient
    from dotenv import load_dotenv
    load_dotenv("/app/backend/.env")
    sync = MongoClient(os.environ["MONGO_URL"])[os.environ["DB_NAME"]]
    row = sync.magic_link_tokens.find_one(
        {"email": "phase1-pytest-verify@example.com"}
    )
    assert row is not None, "magic_link_tokens row missing"
    token = row["token"]

    r = client.post(f"/api/auth/magic-link/verify?token={token}")
    assert r.status_code == 200
    assert "session_token" in r.cookies
    body = r.json()
    assert body["user"]["email"] == "phase1-pytest-verify@example.com"
    assert body["session_token"]

    # Second call → 410 (single-use)
    r2 = client.post(f"/api/auth/magic-link/verify?token={token}")
    assert r2.status_code == 410


def test_magic_link_verify_unknown_token(client):
    r = client.post(
        "/api/auth/magic-link/verify?token=" + "0" * 64
    )
    assert r.status_code == 404


def test_me_authenticated_via_bearer(client, monkeypatch):
    import email_service
    monkeypatch.setattr(email_service, "is_configured", lambda: False)
    client.post(
        "/api/auth/magic-link/request",
        json={"email": "phase1-pytest-me@example.com"},
    )
    from pymongo import MongoClient
    from dotenv import load_dotenv
    load_dotenv("/app/backend/.env")
    sync = MongoClient(os.environ["MONGO_URL"])[os.environ["DB_NAME"]]
    row = sync.magic_link_tokens.find_one({"email": "phase1-pytest-me@example.com"})
    token = row["token"]
    r = client.post(f"/api/auth/magic-link/verify?token={token}")
    session_token = r.json()["session_token"]

    me = client.get(
        "/api/me",
        headers={"Authorization": f"Bearer {session_token}"},
    )
    assert me.status_code == 200
    j = me.json()
    assert j["authenticated"] is True
    assert j["user"]["email"] == "phase1-pytest-me@example.com"
    assert "rooms" in j
    for room_key in ["clarity_release", "body_room", "course_room",
                     "library", "cabinet_booking"]:
        assert room_key in j["rooms"]
    assert j["session"]["auth_method"] == "magic_link"
    assert j["tier"] == "transient"


def test_phase1_cleanup(client):
    """Best-effort cleanup so reruns are deterministic."""
    from pymongo import MongoClient
    from dotenv import load_dotenv
    load_dotenv("/app/backend/.env")
    sync = MongoClient(os.environ["MONGO_URL"])[os.environ["DB_NAME"]]
    emails = [
        "phase1-pytest@example.com",
        "phase1-pytest-verify@example.com",
        "phase1-pytest-me@example.com",
    ]
    user_ids = [u["user_id"] for u in sync.users.find({"email": {"$in": emails}})]
    sync.user_sessions.delete_many({"user_id": {"$in": user_ids}})
    sync.users.delete_many({"email": {"$in": emails}})
    sync.magic_link_tokens.delete_many({"email": {"$in": emails}})
    assert True
