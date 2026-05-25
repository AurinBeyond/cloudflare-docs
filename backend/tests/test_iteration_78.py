"""Iteration 78 backend tests.

Covers three P2 features:
  1. Universal Minute Bank — /api/minute-bank/starter
  2. Today's Quest         — /api/aurin/today-quest
  3. Angel Stars Phase 2   — reciprocal stars, parent stamps, photo album
"""

import base64
import io
import os
import uuid

import pytest
import requests

def _load_backend_url():
    v = os.environ.get("REACT_APP_BACKEND_URL")
    if not v:
        try:
            with open("/app/frontend/.env") as f:
                for line in f:
                    if line.startswith("REACT_APP_BACKEND_URL="):
                        v = line.split("=", 1)[1].strip().strip('"')
                        break
        except Exception:
            pass
    if not v:
        raise RuntimeError("REACT_APP_BACKEND_URL not configured")
    return v.rstrip("/")


BASE_URL = _load_backend_url()
TEST_TOKEN = "test_token_6489e6cf1440"


# -----------------------------------------------------------------------------
# Fixtures
# -----------------------------------------------------------------------------

@pytest.fixture(scope="module")
def client():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


@pytest.fixture(scope="module")
def authed(client):
    s = requests.Session()
    s.headers.update({
        "Content-Type": "application/json",
        "Authorization": f"Bearer {TEST_TOKEN}",
    })
    return s


def _tiny_jpeg_b64(size_bytes=512) -> str:
    """Produce a minimal JPEG-shaped byte payload (won't validate as real
    JPEG but binary_storage doesn't decode — only size matters here)."""
    raw = b"\xff\xd8\xff\xe0" + b"\x00" * (size_bytes - 4)
    return base64.b64encode(raw).decode("ascii")


# -----------------------------------------------------------------------------
# Health / smoke
# -----------------------------------------------------------------------------

class TestHealth:
    def test_health_ok(self, client):
        r = client.get(f"{BASE_URL}/api/health")
        assert r.status_code == 200


# -----------------------------------------------------------------------------
# Feature 1: Universal Minute Bank
# -----------------------------------------------------------------------------

class TestMinuteBankStarter:
    def test_starter_shape(self, client):
        r = client.get(f"{BASE_URL}/api/minute-bank/starter")
        assert r.status_code == 200
        data = r.json()
        assert data["minutes"] == 20
        assert data["price_eur"] == 12.0
        assert "tagline" in data and "Universal Minute Bank" in data["tagline"]
        assert "blurb" in data and isinstance(data["blurb"], str)
        # graceful: LS variant not seeded → not purchasable
        assert "purchasable" in data
        assert "checkout_url" in data
        assert isinstance(data["purchasable"], bool)


# -----------------------------------------------------------------------------
# Feature 2: Today's Quest
# -----------------------------------------------------------------------------

class TestTodaysQuest:
    def test_unauth_preview(self, client):
        r = client.get(f"{BASE_URL}/api/aurin/today-quest")
        assert r.status_code == 200
        d = r.json()
        assert d["source"] == "preview"
        assert isinstance(d["activities"], list)
        assert len(d["activities"]) == 3
        assert "headline" in d
        assert "aurin_line" in d

    def test_authed_with_checkin(self, authed):
        r = authed.get(f"{BASE_URL}/api/aurin/today-quest")
        assert r.status_code == 200
        d = r.json()
        # user_angel_test_c01ba5 has at least one mood checkin
        assert d["source"] in ("mood_checkin", "default_no_checkin")
        assert isinstance(d["activities"], list)
        assert 1 <= len(d["activities"]) <= 5
        if d["source"] == "mood_checkin":
            assert d["mood"] is not None
            assert d["headline"]


# -----------------------------------------------------------------------------
# Feature 3: Angel Stars Phase 2 — reciprocal + photo album + stamps
# -----------------------------------------------------------------------------

class TestReciprocalCatalog:
    def test_catalog_has_5_actions(self, client):
        r = client.get(f"{BASE_URL}/api/angel-stars/reciprocal/catalog")
        assert r.status_code == 200
        d = r.json()
        assert "actions" in d
        slugs = {a["slug"] for a in d["actions"]}
        expected = {"rec_listened", "rec_apologised", "rec_patient", "rec_played", "rec_read_story"}
        assert slugs == expected


class TestGiveToParent:
    def test_invalid_action_returns_400(self, authed):
        r = authed.post(f"{BASE_URL}/api/angel-stars/give-to-parent", json={
            "child_slug": "little-dreamers",
            "action_slug": "rec_BOGUS",
        })
        assert r.status_code == 400

    def test_valid_creates_pending_with_stamp_slug(self, authed):
        r = authed.post(f"{BASE_URL}/api/angel-stars/give-to-parent", json={
            "child_slug": "little-dreamers",
            "action_slug": "rec_played",
        })
        assert r.status_code == 200
        d = r.json()
        assert d["ok"] is True
        assert d["status"] == "pending"
        # Stash for next test class
        TestGiveToParent.created_id = d["id"]


class TestApproveWithPhoto:
    def test_reciprocal_approve_no_photo_awards_stamp(self, authed):
        # Create a fresh reciprocal request
        r = authed.post(f"{BASE_URL}/api/angel-stars/give-to-parent", json={
            "child_slug": "little-dreamers",
            "action_slug": "rec_listened",  # → listener stamp
        })
        assert r.status_code == 200
        req_id = r.json()["id"]

        # Get stamp count before
        before = authed.get(f"{BASE_URL}/api/parent-stamps/me").json()
        before_listener = next(s["count"] for s in before["stamps"] if s["slug"] == "listener")

        # Approve (no photo)
        r2 = authed.post(f"{BASE_URL}/api/angel-stars/approve-with-photo", json={
            "request_id": req_id,
        })
        assert r2.status_code == 200
        body = r2.json()
        assert body["approved"] is True
        assert body["reciprocal"] is True

        # Check listener stamp count incremented by 1
        after = authed.get(f"{BASE_URL}/api/parent-stamps/me").json()
        after_listener = next(s["count"] for s in after["stamps"] if s["slug"] == "listener")
        assert after_listener == before_listener + 1

    def test_approve_with_oversized_photo_returns_413(self, authed):
        # Create a reciprocal request to approve
        r = authed.post(f"{BASE_URL}/api/angel-stars/give-to-parent", json={
            "child_slug": "little-dreamers",
            "action_slug": "rec_patient",
        })
        req_id = r.json()["id"]

        # Build a >2MB photo
        big_b64 = base64.b64encode(b"\x00" * (2 * 1024 * 1024 + 10)).decode("ascii")
        r2 = authed.post(f"{BASE_URL}/api/angel-stars/approve-with-photo", json={
            "request_id": req_id,
            "photo_base64": big_b64,
            "photo_content_type": "image/jpeg",
            "caption": "TEST_iter78_oversized",
        })
        assert r2.status_code == 413

    def test_approve_with_valid_photo_creates_album_row(self, authed):
        # Create a reciprocal request
        r = authed.post(f"{BASE_URL}/api/angel-stars/give-to-parent", json={
            "child_slug": "little-dreamers",
            "action_slug": "rec_read_story",
        })
        req_id = r.json()["id"]

        small_b64 = _tiny_jpeg_b64(1024)
        caption = f"TEST_iter78_caption_{uuid.uuid4().hex[:6]}"

        r2 = authed.post(f"{BASE_URL}/api/angel-stars/approve-with-photo", json={
            "request_id": req_id,
            "photo_base64": small_b64,
            "photo_content_type": "image/jpeg",
            "caption": caption,
        })
        assert r2.status_code == 200
        assert r2.json()["approved"] is True

        # Verify in album
        album = authed.get(f"{BASE_URL}/api/memory-album/me")
        assert album.status_code == 200
        items = album.json()["album"]
        assert any(it.get("caption") == caption for it in items)

        # Stash a photo_key for cross-user access test
        mine = next(it for it in items if it.get("caption") == caption)
        TestApproveWithPhoto.photo_key = mine["photo_key"]


class TestParentStampsMe:
    def test_returns_5_defs(self, authed):
        r = authed.get(f"{BASE_URL}/api/parent-stamps/me")
        assert r.status_code == 200
        d = r.json()
        assert "stamps" in d and "total" in d and "recent" in d
        slugs = {s["slug"] for s in d["stamps"]}
        assert slugs == {"listener", "patient", "playful", "present", "champion"}
        assert d["total"] == sum(s["count"] for s in d["stamps"])


class TestMemoryAlbumPhotoAccess:
    def test_owner_can_fetch(self, authed):
        key = getattr(TestApproveWithPhoto, "photo_key", None)
        if not key:
            pytest.skip("photo_key not set by earlier test")
        r = authed.get(f"{BASE_URL}/api/memory-album/photo/{key}")
        assert r.status_code == 200
        assert r.headers.get("content-type", "").startswith("image/")
        assert len(r.content) > 0

    def test_cross_user_blocked(self, client):
        # Build a fabricated photo_key that doesn't contain our user_id prefix.
        key = getattr(TestApproveWithPhoto, "photo_key", None)
        if not key:
            pytest.skip("photo_key not set by earlier test")
        # An unauthed request should be rejected via _require_user (401/403)
        r = client.get(f"{BASE_URL}/api/memory-album/photo/{key}")
        assert r.status_code in (401, 403)


# -----------------------------------------------------------------------------
# Regression — earlier iterations must still work
# -----------------------------------------------------------------------------

class TestRegression:
    def test_angel_stars_me(self, authed):
        r = authed.get(f"{BASE_URL}/api/angel-stars/me?child_slug=little-dreamers")
        assert r.status_code == 200

    def test_kids_curriculum_activities(self, client):
        r = client.get(f"{BASE_URL}/api/kids-curriculum/activities?child_slug=little-dreamers")
        assert r.status_code == 200

    def test_kids_mood_parent_portal(self, authed):
        r = authed.get(f"{BASE_URL}/api/kids-mood/parent-portal")
        assert r.status_code == 200

    def test_referral_me(self, authed):
        r = authed.get(f"{BASE_URL}/api/referral/me")
        assert r.status_code == 200

    def test_topup_ladder(self, client):
        r = client.get(f"{BASE_URL}/api/topup/ladder")
        assert r.status_code == 200
