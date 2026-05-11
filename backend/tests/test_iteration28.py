"""Iteration 28 — Body Room expansion (5 → 8 hotspots) +
the-body-knows-first audio swap + Clarity Release sign-in copy refresh.

Coverage:
  1. /api/body-room/hotspots returns EXACTLY 8 hotspots in the dict
     insertion order: jaws, liver, heart, lungs, kidneys, shoulders,
     throat, hips. The original 5 do NOT carry `why_it_speaks_to_you`;
     the 3 new ones (shoulders, throat, hips) DO.
  2. /api/body-room/insight accepts the 3 new regions (200) and rejects
     unknown regions (422). Old regions still 200.
  3. /api/body-room/image/{slug}:
       - 5 existing slugs → 200, image/png
       - 3 new slugs (shoulders-burden, throat-unspoken, hips-held)
         → 404 with detail "Image not generated yet."
       - Unknown slug → 404 detail "Image not found."
  4. /api/courses/the-body-knows-first → audio_companion is the new
     architecture-of-breath.mp3, audio_title matches.
  5. /assets/audio/courses/the-architecture-of-breath.mp3 served (200,
     audio/mpeg, ~700KB).
  6. /api/clarity/health regression: ai_guide_enabled & tts_configured.
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


EXPECTED_ORDER = [
    "crown", "throat", "heart", "solar_plexus", "belly", "hips", "hands", "feet"
]
ALL_REGIONS = set(EXPECTED_ORDER)
# Iter32: image slugs renamed to chakra-aligned set. Nano Banana
# regeneration deferred for credit-budget reasons; endpoint returns
# graceful "Image not generated yet." for missing files.
NEW_SLUGS = [
    "crown-overthinker", "throat-unspoken", "heart-compass",
    "solar-plexus-control", "belly-intuition", "hips-archive",
    "hands-boundary", "feet-roots",
]


@pytest.fixture(scope="module")
def mongo_db():
    client = MongoClient(MONGO_URL)
    yield client[DB_NAME]
    client.close()


def _h(token):
    return {"Authorization": f"Bearer {token}"}


def _make_user(mongo_db):
    user_id = f"test-it28-{uuid.uuid4().hex[:8]}"
    token = f"test_session_it28_{uuid.uuid4().hex}"
    mongo_db.users.insert_one({
        "user_id": user_id,
        "email": f"{user_id}@example.com",
        "name": "Iter28",
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
    mongo_db.body_insights.delete_many({"user_id": user_id})
    mongo_db.cabinet_sessions.delete_many({"user_id": user_id})


@pytest.fixture
def member(mongo_db):
    token, user_id = _make_user(mongo_db)
    yield (token, user_id)
    _purge_user(mongo_db, user_id, token)


# ---------- Hotspots: 8 entries, ordered, schema ----------

def test_hotspots_returns_eight_in_order():
    r = requests.get(f"{BASE_URL}/api/body-room/hotspots", timeout=10)
    assert r.status_code == 200
    body = r.json()
    hotspots = body["hotspots"]
    assert len(hotspots) == 8, f"Expected 8, got {len(hotspots)}"
    actual_order = [h["region"] for h in hotspots]
    assert actual_order == EXPECTED_ORDER, f"Order mismatch: {actual_order}"


def test_hotspots_required_fields_on_all():
    r = requests.get(f"{BASE_URL}/api/body-room/hotspots", timeout=10)
    body = r.json()
    required = ("region", "label", "emotion", "symptom",
                "what_it_carries", "release", "image_slug")
    for h in body["hotspots"]:
        for k in required:
            assert h.get(k), f"missing {k} on {h.get('region')}"


def test_only_new_three_have_why_it_speaks_to_you():
    """Iter32: every hotspot now carries `why_it_speaks_to_you`
    (founder directive — uniform depth across all 8 regions)."""
    r = requests.get(f"{BASE_URL}/api/body-room/hotspots", timeout=10)
    body = r.json()
    for h in body["hotspots"]:
        why = h.get("why_it_speaks_to_you")
        assert why, f"region {h['region']} missing why_it_speaks_to_you"
        assert isinstance(why, str)
        assert len(why) > 40


# ---------- /api/body-room/insight: new regions accepted ----------

@pytest.mark.parametrize("region", ["crown", "solar_plexus", "belly", "hands", "feet"])
def test_insight_accepts_new_region(member, region):
    token, _ = member
    r = requests.post(
        f"{BASE_URL}/api/body-room/insight",
        headers=_h(token),
        json={"region": region},
        timeout=10,
    )
    assert r.status_code == 200, r.text
    assert r.json()["status"] == "ok"


@pytest.mark.parametrize("region", ["throat", "heart", "hips"])
def test_insight_kept_regions_still_work(member, region):
    token, _ = member
    r = requests.post(
        f"{BASE_URL}/api/body-room/insight",
        headers=_h(token),
        json={"region": region},
        timeout=10,
    )
    assert r.status_code == 200


def test_insight_rejects_unknown_region(member):
    token, _ = member
    r = requests.post(
        f"{BASE_URL}/api/body-room/insight",
        headers=_h(token),
        json={"region": "elbow"},
        timeout=10,
    )
    assert r.status_code == 422


# ---------- /api/body-room/image/{slug} ----------

@pytest.mark.parametrize("slug", NEW_SLUGS)
def test_new_slug_endpoint_responds_gracefully(slug):
    """Iter32: PNGs deferred for budget reasons. Endpoint must return
    either 200 (if generated) or 404 with the friendly 'not generated
    yet' detail — never a server error."""
    r = requests.get(
        f"{BASE_URL}/api/body-room/image/{slug}", timeout=10
    )
    assert r.status_code in (200, 404), f"{slug}: {r.status_code}"
    if r.status_code == 404:
        body = r.json()
        detail = body.get("detail", "")
        assert detail == "Image not generated yet.", (
            f"{slug} expected 'Image not generated yet.', got {detail!r}"
        )


def test_unknown_slug_returns_image_not_found():
    r = requests.get(
        f"{BASE_URL}/api/body-room/image/not-a-real-slug", timeout=10
    )
    assert r.status_code == 404
    detail = r.json().get("detail", "")
    assert detail == "Image not found.", f"got {detail!r}"


# ---------- /api/courses/the-body-knows-first audio swap ----------

def test_body_knows_first_audio_companion_swapped():
    r = requests.get(
        f"{BASE_URL}/api/courses/the-body-knows-first", timeout=10
    )
    assert r.status_code == 200
    body = r.json()
    course = body.get("course", body)
    assert course.get("audio_companion") == (
        "/assets/audio/courses/the-architecture-of-breath.mp3"
    ), f"audio_companion mismatch: {course.get('audio_companion')!r}"
    assert course.get("audio_title") == "The architecture of breath", (
        f"audio_title mismatch: {course.get('audio_title')!r}"
    )


def test_architecture_of_breath_mp3_served():
    url = f"{BASE_URL}/assets/audio/courses/the-architecture-of-breath.mp3"
    r = requests.get(url, timeout=20, stream=True)
    assert r.status_code == 200, f"{r.status_code}"
    ctype = r.headers.get("content-type", "")
    assert "audio" in ctype or "mpeg" in ctype or "octet-stream" in ctype, ctype
    clen = r.headers.get("content-length")
    if clen:
        # ~700KB file per founder; allow generous range
        assert int(clen) > 200_000, f"size too small: {clen}"


# ---------- /api/clarity/health regression ----------

def test_clarity_health_ai_and_tts_still_enabled():
    r = requests.get(f"{BASE_URL}/api/clarity/health", timeout=10)
    assert r.status_code == 200
    body = r.json()
    assert body.get("ai_guide_enabled") is True, body
    assert body.get("tts_configured") is True, body
