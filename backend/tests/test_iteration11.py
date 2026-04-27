"""Iteration 11 — Private Cabinet (Quiet Room) endpoints + Beyond the Matrix Vol I free book + smoke regressions.

Auth model: cookie-based session with Bearer fallback. We mint sessions directly in Mongo
(per /app/auth_testing.md). Cabinet endpoints require an authenticated user.
"""
import os
import time
import uuid
from datetime import datetime, timezone, timedelta

import pytest
import requests
from pymongo import MongoClient

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "").rstrip("/")
if not BASE_URL:
    # fallback — read from frontend/.env if env var not propagated
    with open("/app/frontend/.env") as f:
        for line in f:
            if line.startswith("REACT_APP_BACKEND_URL="):
                BASE_URL = line.split("=", 1)[1].strip().rstrip("/")
                break

MONGO_URL = os.environ.get("MONGO_URL", "mongodb://localhost:27017")
DB_NAME = os.environ.get("DB_NAME", "test_database")
# fall back to backend/.env
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


# ---------- Fixtures ----------
@pytest.fixture(scope="module")
def mongo_db():
    client = MongoClient(MONGO_URL)
    db = client[DB_NAME]
    yield db
    client.close()


@pytest.fixture
def auth_session(mongo_db):
    """Insert a synthetic user + session_token. Yields (token, user_id). Cleans up after."""
    user_id = f"test-cabinet-{uuid.uuid4().hex[:8]}"
    session_token = f"test_session_iter11_{uuid.uuid4().hex}"
    mongo_db.users.insert_one({
        "user_id": user_id,
        "email": f"test.iter11.{user_id}@example.com",
        "name": "Iter11 Test User",
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
    # cleanup
    mongo_db.users.delete_many({"user_id": user_id})
    mongo_db.user_sessions.delete_many({"session_token": session_token})
    mongo_db.cabinet_sessions.delete_many({"user_id": user_id})


def _auth(token):
    return {"Authorization": f"Bearer {token}"}


# ---------- 1. Auth gating (401) ----------
class TestCabinetAuthGate:
    def test_me_unauth_401(self):
        r = requests.get(f"{BASE_URL}/api/cabinet/me", timeout=15)
        assert r.status_code == 401, r.text

    def test_start_unauth_401(self):
        r = requests.post(f"{BASE_URL}/api/cabinet/start", timeout=15)
        assert r.status_code == 401, r.text

    def test_message_unauth_401(self):
        r = requests.post(f"{BASE_URL}/api/cabinet/message", json={"text": "hi"}, timeout=15)
        assert r.status_code == 401, r.text

    def test_clear_unauth_401(self):
        r = requests.post(f"{BASE_URL}/api/cabinet/clear", timeout=15)
        assert r.status_code == 401, r.text


# ---------- 2. Cabinet flow (authenticated) ----------
class TestCabinetFlow:
    def test_me_initial(self, auth_session):
        token, _ = auth_session
        r = requests.get(f"{BASE_URL}/api/cabinet/me", headers=_auth(token), timeout=15)
        assert r.status_code == 200, r.text
        data = r.json()
        assert "session" in data
        assert data.get("free_replies") == 3
        assert data.get("show_continuation") is False
        assert data.get("guide_replies") == 0

    def test_start_returns_session_id(self, auth_session):
        token, _ = auth_session
        r = requests.post(f"{BASE_URL}/api/cabinet/start", headers=_auth(token), timeout=15)
        assert r.status_code == 200, r.text
        sid = r.json().get("session_id")
        assert isinstance(sid, str) and len(sid) > 0

    def test_message_normal_then_continuation_after_3(self, auth_session):
        token, _ = auth_session
        # start
        requests.post(f"{BASE_URL}/api/cabinet/start", headers=_auth(token), timeout=15)
        # 1st message
        r1 = requests.post(f"{BASE_URL}/api/cabinet/message", headers=_auth(token),
                           json={"text": "hi I keep falling back into old patterns"}, timeout=15)
        assert r1.status_code == 200, r1.text
        d1 = r1.json()
        assert d1["is_crisis"] is False
        assert d1["guide"]["role"] == "guide"
        assert isinstance(d1["guide"]["text"], str) and len(d1["guide"]["text"]) > 0
        assert d1["guide_replies"] == 1
        assert d1["show_continuation"] is False

        # 2nd
        r2 = requests.post(f"{BASE_URL}/api/cabinet/message", headers=_auth(token),
                           json={"text": "I notice it more in evenings"}, timeout=15)
        assert r2.status_code == 200
        assert r2.json()["guide_replies"] == 2
        assert r2.json()["show_continuation"] is False

        # 3rd → show_continuation True
        r3 = requests.post(f"{BASE_URL}/api/cabinet/message", headers=_auth(token),
                           json={"text": "and it feels familiar from childhood"}, timeout=15)
        assert r3.status_code == 200
        d3 = r3.json()
        assert d3["guide_replies"] == 3
        assert d3["show_continuation"] is True

        # /me reflects state
        rm = requests.get(f"{BASE_URL}/api/cabinet/me", headers=_auth(token), timeout=15)
        assert rm.status_code == 200
        dm = rm.json()
        assert dm["guide_replies"] >= 3
        assert dm["show_continuation"] is True

    def test_message_crisis_keyword(self, auth_session):
        token, _ = auth_session
        requests.post(f"{BASE_URL}/api/cabinet/start", headers=_auth(token), timeout=15)
        r = requests.post(f"{BASE_URL}/api/cabinet/message", headers=_auth(token),
                          json={"text": "I want to die"}, timeout=15)
        assert r.status_code == 200, r.text
        d = r.json()
        assert d["is_crisis"] is True
        text_low = d["guide"]["text"].lower()
        assert any(kw in text_low for kw in ["emergency", "doctor", "crisis"]), d["guide"]["text"]

    def test_message_empty_400(self, auth_session):
        token, _ = auth_session
        requests.post(f"{BASE_URL}/api/cabinet/start", headers=_auth(token), timeout=15)
        r = requests.post(f"{BASE_URL}/api/cabinet/message", headers=_auth(token),
                          json={"text": "   "}, timeout=15)
        assert r.status_code == 400, r.text

    def test_message_keep_thread_returns_thread_key(self, auth_session):
        token, _ = auth_session
        requests.post(f"{BASE_URL}/api/cabinet/start", headers=_auth(token), timeout=15)
        r = requests.post(f"{BASE_URL}/api/cabinet/message", headers=_auth(token),
                          json={"text": "anchor me", "keep_thread": True}, timeout=15)
        assert r.status_code == 200, r.text
        d = r.json()
        assert d.get("thread_key") is not None
        # 16-char hex
        tk = d["thread_key"]
        assert isinstance(tk, str) and len(tk) == 16
        int(tk, 16)  # raises if not hex

    def test_clear_closes_session(self, auth_session):
        token, _ = auth_session
        requests.post(f"{BASE_URL}/api/cabinet/start", headers=_auth(token), timeout=15)
        requests.post(f"{BASE_URL}/api/cabinet/message", headers=_auth(token),
                      json={"text": "one"}, timeout=15)
        rc = requests.post(f"{BASE_URL}/api/cabinet/clear", headers=_auth(token), timeout=15)
        assert rc.status_code == 200, rc.text
        # /me now should show no active session
        rm = requests.get(f"{BASE_URL}/api/cabinet/me", headers=_auth(token), timeout=15)
        assert rm.status_code == 200
        assert rm.json().get("session") is None


# ---------- 3. Books regression: 7 books incl. beyond-the-matrix-i (free) ----------
class TestBooksRegression:
    def test_books_list_has_seven_with_new_free_book(self):
        r = requests.get(f"{BASE_URL}/api/books", timeout=15)
        assert r.status_code == 200, r.text
        payload = r.json()
        items = payload if isinstance(payload, list) else (payload.get("items") or [])
        slugs = [b.get("slug") for b in items]
        assert len(items) >= 7, f"expected >=7 books, got {len(items)} → {slugs}"
        assert "beyond-the-matrix-i" in slugs, slugs
        b = next(b for b in items if b["slug"] == "beyond-the-matrix-i")
        assert (b.get("price") or 0) == 0
        assert b.get("pdf_url") == "/assets/books/beyond-the-matrix-vol1.pdf"

    def test_pdf_static_asset_200(self):
        r = requests.get(f"{BASE_URL}/assets/books/beyond-the-matrix-vol1.pdf",
                         timeout=20, stream=True)
        # may be served from frontend public — should not 404
        assert r.status_code == 200, f"got {r.status_code}"


# ---------- 4. Untouched endpoints regression ----------
class TestUntouchedRegression:
    def test_blog_list(self):
        r = requests.get(f"{BASE_URL}/api/blog", timeout=15)
        assert r.status_code == 200, r.text

    def test_content_brand(self):
        r = requests.get(f"{BASE_URL}/api/content/entries?surface=brand", timeout=15)
        assert r.status_code == 200, r.text

    def test_experience_me_401(self):
        r = requests.get(f"{BASE_URL}/api/experience/the-beginning/me", timeout=15)
        assert r.status_code == 401, r.text
