"""Iteration 3 backend tests — Auth (Bearer/cookie), GitHub real sync,
Reach Out persistence, brand/legal surfaces, regressions."""
import os
import uuid
import requests
import pytest

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL").rstrip("/")
API = f"{BASE_URL}/api"


@pytest.fixture(scope="module")
def s():
    return requests.Session()


# ---------- Auth ----------
class TestAuth:
    def test_auth_me_unauth_returns_401(self, s):
        # no cookie, no bearer token → 401
        r = requests.get(f"{API}/auth/me")
        assert r.status_code == 401, r.text
        assert "detail" in r.json()

    def test_auth_me_bad_bearer_returns_401(self, s):
        r = requests.get(
            f"{API}/auth/me",
            headers={"Authorization": "Bearer not-a-real-token-xyz"},
        )
        assert r.status_code == 401

    def test_auth_session_invalid_id_returns_401(self, s):
        r = s.post(
            f"{API}/auth/session",
            json={"session_id": f"invalid-{uuid.uuid4().hex}"},
        )
        # Emergent endpoint returns non-200 → backend should raise 401
        assert r.status_code == 401, r.text


# ---------- GitHub sync (real) ----------
class TestGithubSync:
    def test_sync_no_repo_returns_not_configured(self, s):
        # backend/.env has GITHUB_REPO="" by default
        r = s.post(f"{API}/content/sync/github", json={})
        assert r.status_code == 200, r.text
        d = r.json()
        assert d["status"] == "not_configured"
        assert "message" in d

    def test_sync_with_owner_repo_placeholder_is_not_configured(self, s):
        r = s.post(f"{API}/content/sync/github", json={"repo": "owner/repo"})
        assert r.status_code == 200
        assert r.json()["status"] == "not_configured"

    def test_sync_with_nonexistent_repo_returns_error_gracefully(self, s):
        r = s.post(
            f"{API}/content/sync/github",
            json={"repo": "this-account-should-not-exist-9999/no-repo-here-xyz"},
        )
        # Should not 500 — graceful error
        assert r.status_code == 200, r.text
        d = r.json()
        assert d["status"] == "error"
        assert "http_status" in d


# ---------- Reach Out ----------
class TestReachOut:
    def test_reach_out_valid_payload(self, s):
        payload = {
            "name": "TEST_Reach Out User",
            "email": "test_reachout@example.com",
            "topic": "general",
            "message": "TEST_message_iter3",
        }
        r = s.post(f"{API}/reach-out", json=payload)
        assert r.status_code == 200, r.text
        d = r.json()
        assert d["status"] == "received"
        assert "destination_configured" in d
        assert isinstance(d["destination_configured"], bool)
        # REACH_OUT_EMAIL is empty in .env → False expected
        assert d["destination_configured"] is False
        assert "id" in d and len(d["id"]) > 5

    def test_reach_out_missing_required_field(self, s):
        # missing 'message'
        r = s.post(f"{API}/reach-out", json={"name": "X", "email": "a@b.c"})
        assert r.status_code == 422


# ---------- Brand / Legal surfaces ----------
class TestBrandLegalSurfaces:
    def test_brand_surface_returns_200(self, s):
        r = s.get(f"{API}/content/entries", params={"surface": "brand"})
        assert r.status_code == 200, r.text
        data = r.json()
        assert isinstance(data, list)
        # empty until github configured
        assert data == [] or all(e.get("surface") == "brand" for e in data)

    def test_legal_surface_returns_200(self, s):
        r = s.get(f"{API}/content/entries", params={"surface": "legal"})
        assert r.status_code == 200, r.text
        data = r.json()
        assert isinstance(data, list)


# ---------- Regression — pre-existing endpoints still healthy ----------
class TestRegression:
    def test_health(self, s):
        r = s.get(f"{API}/")
        assert r.status_code == 200
        assert r.json()["status"] == "ok"

    def test_library_surface(self, s):
        r = s.get(f"{API}/content/entries", params={"surface": "library"})
        assert r.status_code == 200
        assert len(r.json()) >= 6

    def test_books_endpoint(self, s):
        r = s.get(f"{API}/books")
        assert r.status_code == 200
        data = r.json()
        assert isinstance(data, list)
        assert len(data) >= 1
        for b in data:
            assert b.get("slug")
            assert b.get("title")

    def test_admin_entries(self, s):
        r = s.get(f"{API}/content/admin/entries")
        assert r.status_code == 200
        assert isinstance(r.json(), list)

    def test_validate_endpoint(self, s):
        r = s.post(
            f"{API}/content/validate",
            json={"markdown": "## A\n\ntext\n\n## B\n\nmore"},
        )
        assert r.status_code == 200
        d = r.json()
        assert "warnings" in d


# ---------- Cleanup ----------
@pytest.fixture(scope="session", autouse=True)
def cleanup_test_data():
    yield
    # delete test reach-out messages
    try:
        from pymongo import MongoClient
        mongo_url = os.environ.get("MONGO_URL")
        db_name = os.environ.get("DB_NAME")
        if mongo_url and db_name:
            client = MongoClient(mongo_url)
            db = client[db_name]
            res = db.reach_out_messages.delete_many({"name": {"$regex": "^TEST_"}})
            print(f"\nCleanup: removed {res.deleted_count} reach-out test docs")
            client.close()
    except Exception as e:
        print(f"Cleanup warning: {e}")
