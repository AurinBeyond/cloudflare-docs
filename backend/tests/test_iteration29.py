"""Iteration 29 — Resend + First Letter funnel + Magic Link delivery.

Coverage:
  • GET /api/email/health
  • POST /api/first-letter (validation, success, rate-limit, idempotent newsletter)
  • POST /api/auth/magic-link/request (Resend delivery path + DB write)
  • POST /api/auth/magic-link/verify (success + already-used 410)
"""

from __future__ import annotations

import os
import time
import uuid

import pytest
import requests
from pymongo import MongoClient

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://aurin-hub.preview.emergentagent.com").rstrip("/")
API = f"{BASE_URL}/api"

MONGO_URL = os.environ.get("MONGO_URL", "mongodb://localhost:27017")
DB_NAME = os.environ.get("DB_NAME", "test_database")


@pytest.fixture(scope="module")
def db():
    client = MongoClient(MONGO_URL)
    yield client[DB_NAME]
    client.close()


@pytest.fixture(scope="module")
def session():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


@pytest.fixture
def throwaway_email():
    e = f"tester+{uuid.uuid4().hex[:10]}@example.com"
    yield e
    # Best-effort cleanup so we don't pollute production rate-limit tables.
    try:
        client = MongoClient(MONGO_URL)
        d = client[DB_NAME]
        d.first_letter_sends.delete_many({"email": e})
        d.newsletter_subscribers.delete_many({"email": e})
        d.magic_link_tokens.delete_many({"email": e})
        d.users.delete_many({"email": e})
        client.close()
    except Exception:
        pass


# --- /api/email/health ----------------------------------------------
class TestEmailHealth:
    def test_health_resend_configured(self, session):
        r = session.get(f"{API}/email/health", timeout=20)
        assert r.status_code == 200, r.text
        data = r.json()
        assert data["resend_configured"] is True
        senders = data["senders"]
        assert senders["support"] == "Matrix Aurin Support <support@prulesoul.site>"
        assert senders["agent"] == "The Guardian <agent@prulesoul.site>"
        assert senders["info"] == "Matrix Aurin <info@prulesoul.site>"
        assert isinstance(data["first_letter_sends_total"], int)


# --- /api/first-letter ----------------------------------------------
class TestFirstLetter:
    SLUG = "letting-the-old-stories-rest"

    def test_consent_false_400(self, session, throwaway_email):
        r = session.post(
            f"{API}/first-letter",
            json={"email": throwaway_email, "course_slug": self.SLUG, "consent": False},
            timeout=20,
        )
        assert r.status_code == 400

    def test_invalid_email_400(self, session):
        r = session.post(
            f"{API}/first-letter",
            json={"email": "not-an-email", "course_slug": self.SLUG, "consent": True},
            timeout=20,
        )
        assert r.status_code == 400

    def test_unknown_course_404(self, session, throwaway_email):
        r = session.post(
            f"{API}/first-letter",
            json={"email": throwaway_email, "course_slug": "no-such-course", "consent": True},
            timeout=20,
        )
        assert r.status_code == 404

    def test_send_then_rate_limited_then_other_slug_ok(self, session, db, throwaway_email):
        # First send — should be sent or queued_delivery_failed (sandbox rejects unknown recipients)
        r1 = session.post(
            f"{API}/first-letter",
            json={"email": throwaway_email, "course_slug": self.SLUG, "consent": True},
            timeout=30,
        )
        assert r1.status_code == 200, r1.text
        d1 = r1.json()
        assert d1["status"] in ("sent", "queued_delivery_failed", "queued_manual"), d1

        # DB rows persisted
        send_row = db.first_letter_sends.find_one({"email": throwaway_email, "course_slug": self.SLUG})
        assert send_row is not None
        sub_row = db.newsletter_subscribers.find_one({"email": throwaway_email})
        assert sub_row is not None
        assert sub_row["source"] == f"first-letter:{self.SLUG}"

        # Second call same email+slug → already_sent (rate-limit hit)
        r2 = session.post(
            f"{API}/first-letter",
            json={"email": throwaway_email, "course_slug": self.SLUG, "consent": True},
            timeout=20,
        )
        assert r2.status_code == 200
        assert r2.json()["status"] == "already_sent"

        # newsletter_subscribers should NOT be duplicated on re-send
        n_subs = db.newsletter_subscribers.count_documents({"email": throwaway_email})
        assert n_subs == 1

        # Different slug should still send (separate rate-limit row).
        # Need a different valid slug — fetch course list.
        clist = session.get(f"{API}/courses", timeout=20).json()
        other = next(
            (c["slug"] for c in clist.get("courses", []) if c["slug"] != self.SLUG),
            None,
        )
        if not other:
            pytest.skip("No alternate course slug available")
        r3 = session.post(
            f"{API}/first-letter",
            json={"email": throwaway_email, "course_slug": other, "consent": True},
            timeout=30,
        )
        assert r3.status_code == 200, r3.text
        assert r3.json()["status"] in ("sent", "queued_delivery_failed", "queued_manual")
        # Two rows should now exist for this email (one per slug)
        rows = list(db.first_letter_sends.find({"email": throwaway_email}))
        assert len(rows) == 2


# --- Magic Link request + verify ------------------------------------
class TestMagicLink:
    def test_request_creates_token_and_attempts_email(self, session, db, throwaway_email):
        r = session.post(
            f"{API}/auth/magic-link/request",
            json={"email": throwaway_email, "redirect_to": "/test-group"},
            timeout=30,
        )
        assert r.status_code == 200, r.text
        data = r.json()
        assert data["status"] == "ok"
        # delivered_via is 'email' on success or 'manual' on Resend error.
        assert data["delivered_via"] in ("email", "manual")
        # If email delivered, link is None; otherwise link is returned for manual delivery.
        if data["delivered_via"] == "email":
            assert data["link"] is None
        else:
            assert data["link"] and data["link"].startswith("http")
        # DB token row exists
        row = db.magic_link_tokens.find_one({"email": throwaway_email})
        assert row is not None
        assert row.get("token") and len(row["token"]) >= 32
        assert row.get("used_at") is None

    def test_request_then_verify_then_replay_410(self, session, db, throwaway_email):
        # Request a token
        r = session.post(
            f"{API}/auth/magic-link/request",
            json={"email": throwaway_email},
            timeout=30,
        )
        assert r.status_code == 200
        # Pull the actual token from DB (we don't want to depend on response)
        row = db.magic_link_tokens.find_one({"email": throwaway_email})
        assert row is not None
        token = row["token"]

        # Verify — first call must succeed
        v1 = session.post(f"{API}/auth/magic-link/verify", params={"token": token}, timeout=20)
        assert v1.status_code == 200, v1.text
        out = v1.json()
        assert "session_token" in out
        assert "user" in out
        assert out["user"]["email"] == throwaway_email
        assert isinstance(out["session_token"], str) and len(out["session_token"]) > 30

        # Session token actually written to user_sessions
        sess = db.user_sessions.find_one({"session_token": out["session_token"]})
        assert sess is not None

        # Second verify call → 410 already used
        v2 = session.post(f"{API}/auth/magic-link/verify", params={"token": token}, timeout=20)
        assert v2.status_code == 410

        # Cleanup user_sessions for this synthetic user
        db.user_sessions.delete_many({"session_token": out["session_token"]})

    def test_verify_unknown_token_404(self, session):
        bogus = "z" * 64
        r = session.post(f"{API}/auth/magic-link/verify", params={"token": bogus}, timeout=20)
        assert r.status_code == 404

    def test_verify_short_token_400(self, session):
        r = session.post(f"{API}/auth/magic-link/verify", params={"token": "abc"}, timeout=20)
        assert r.status_code == 400
