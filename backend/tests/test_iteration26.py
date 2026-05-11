"""Iteration 26 — Body Room + State Bridge into Clarity Release.

Coverage:
  1. /api/body-room/hotspots (public) returns 3 hand-written hotspots.
  2. /api/body-room/insight requires auth.
  3. POST insight stores a row, GET insights returns it newest-first.
  4. Validation rejects unknown region (only jaws/heart/belly v1).
  5. State Bridge: /api/clarity/start appends a guide line referencing
     the latest unacknowledged body insight, AND marks it acknowledged.
  6. State Bridge does NOT fire when there is no insight, nor when the
     insight is already acknowledged.
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


@pytest.fixture(scope="module")
def mongo_db():
    client = MongoClient(MONGO_URL)
    db = client[DB_NAME]
    yield db
    client.close()


def _h(token):
    return {"Authorization": f"Bearer {token}"}


def _make_user(mongo_db):
    user_id = f"test-it26-{uuid.uuid4().hex[:8]}"
    token = f"test_session_it26_{uuid.uuid4().hex}"
    mongo_db.users.insert_one({
        "user_id": user_id,
        "email": f"{user_id}@example.com",
        "name": "Iter26",
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
    mongo_db.body_insights.delete_many({"user_id": user_id})
    mongo_db.clarity_user_prefs.delete_many({"user_id": user_id})


@pytest.fixture
def member(mongo_db):
    token, user_id = _make_user(mongo_db)
    yield (token, user_id)
    _purge_user(mongo_db, user_id, token)


# ---------- Hotspots (public) ----------

def test_hotspots_public():
    r = requests.get(f"{BASE_URL}/api/body-room/hotspots", timeout=10)
    assert r.status_code == 200
    body = r.json()
    regions = sorted(h["region"] for h in body["hotspots"])
    # Iter32 redesign: TCM organ model -> chakra-aligned vertical map.
    assert regions == [
        "belly", "crown", "feet", "hands",
        "heart", "hips", "solar_plexus", "throat",
    ]
    # Each entry has the curated content fields + image_slug.
    for h in body["hotspots"]:
        for k in ("label", "emotion", "symptom", "what_it_carries", "release", "image_slug"):
            assert h.get(k), f"missing {k} on {h.get('region')}"


# ---------- Auth gates ----------

def test_insight_post_unauth_401():
    r = requests.post(
        f"{BASE_URL}/api/body-room/insight",
        json={"region": "crown"},
        timeout=10,
    )
    assert r.status_code == 401


def test_insights_get_unauth_401():
    r = requests.get(f"{BASE_URL}/api/body-room/insights", timeout=10)
    assert r.status_code == 401


# ---------- Record + retrieve ----------

def test_record_and_retrieve(member):
    token, _ = member
    for region in ("heart", "crown"):
        r = requests.post(
            f"{BASE_URL}/api/body-room/insight",
            headers=_h(token),
            json={"region": region},
            timeout=10,
        )
        assert r.status_code == 200, r.text
        assert r.json()["status"] == "ok"
    r = requests.get(
        f"{BASE_URL}/api/body-room/insights",
        headers=_h(token),
        timeout=10,
    )
    assert r.status_code == 200
    body = r.json()
    assert body["total"] == 2
    # newest first → crown should be the top
    assert body["insights"][0]["region"] == "crown"
    assert body["insights"][1]["region"] == "heart"


def test_body_image_endpoint():
    # Iter32: image slugs renamed to chakra-aligned set. PNGs may not be
    # generated yet for all 8 — endpoint returns 404 for missing files.
    r_known = requests.get(
        f"{BASE_URL}/api/body-room/image/heart-compass", timeout=10, stream=True
    )
    # Either 200 (if image generated) or 404 with "not generated yet"
    assert r_known.status_code in (200, 404)
    # Path traversal / unknown slug = 404
    r_bad = requests.get(
        f"{BASE_URL}/api/body-room/image/../../etc/passwd", timeout=10
    )
    assert r_bad.status_code in (404, 400)
    r_unknown = requests.get(
        f"{BASE_URL}/api/body-room/image/i-do-not-exist", timeout=10
    )
    assert r_unknown.status_code == 404


def test_unknown_region_rejected(member):
    token, _ = member
    r = requests.post(
        f"{BASE_URL}/api/body-room/insight",
        headers=_h(token),
        json={"region": "elbow"},
        timeout=10,
    )
    assert r.status_code == 422


# ---------- State Bridge ----------

def test_state_bridge_acknowledges_latest_insight(member, mongo_db):
    token, user_id = member
    requests.post(
        f"{BASE_URL}/api/body-room/insight",
        headers=_h(token),
        json={"region": "belly"},
        timeout=10,
    )
    r = requests.post(f"{BASE_URL}/api/clarity/start", headers=_h(token), timeout=10)
    assert r.status_code == 200
    body = r.json()
    assert body.get("bridge_acknowledged") is True
    # The session itself contains the bridge greeting line.
    sess = mongo_db.cabinet_sessions.find_one({"user_id": user_id})
    guide_msgs = [m for m in sess.get("messages", []) if m.get("role") == "guide"]
    assert any("belly" in (m.get("text") or "").lower() for m in guide_msgs), (
        "bridge greeting missing from session"
    )
    insight = mongo_db.body_insights.find_one({"user_id": user_id, "region": "belly"})
    assert insight["acknowledged_at"] is not None


def test_state_bridge_silent_without_insight(member, mongo_db):
    token, user_id = member
    r = requests.post(f"{BASE_URL}/api/clarity/start", headers=_h(token), timeout=10)
    assert r.status_code == 200
    assert r.json().get("bridge_acknowledged") is False
    sess = mongo_db.cabinet_sessions.find_one({"user_id": user_id})
    guide_msgs = [m for m in sess.get("messages", []) if m.get("role") == "guide"]
    # Only the canonical opening greeting exists.
    assert len(guide_msgs) == 1


def test_state_bridge_does_not_replay_acknowledged(member, mongo_db):
    token, user_id = member
    # Insert one ALREADY acknowledged insight.
    mongo_db.body_insights.insert_one({
        "id": str(uuid.uuid4()),
        "user_id": user_id,
        "region": "heart",
        "self_report": None,
        "intensity": None,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "acknowledged_at": datetime.now(timezone.utc).isoformat(),
    })
    r = requests.post(f"{BASE_URL}/api/clarity/start", headers=_h(token), timeout=10)
    assert r.status_code == 200
    assert r.json().get("bridge_acknowledged") is False
