"""§KIDS-UNIVERSE-PHASE-2-4 — 2026-02-27 e2e tests for new
/api/kids-journey/* (Mode B state-swap rooms) + admin letter of admission.

Tests created by testing agent for iteration 83.
"""
import base64
import os
import time

import pytest
import requests

# Public URL (what user sees)
BASE_URL = "https://aurin-hub.preview.emergentagent.com"
API = f"{BASE_URL}/api"

# Premium-eligible test user (presence_seconds_left>0 from referrer reward)
SESSION_TOKEN = "test_token_6489e6cf1440"
USER_ID = "user_angel_test_c01ba5"

# Read ADMIN_TOKEN from backend env
ADMIN_TOKEN = None
try:
    with open("/app/backend/.env") as f:
        for line in f:
            if line.startswith("ADMIN_TOKEN="):
                ADMIN_TOKEN = line.strip().split("=", 1)[1].strip().strip('"')
                break
except Exception:
    pass


AUTH = {"Authorization": f"Bearer {SESSION_TOKEN}"}

# Tiny valid 1x1 transparent PNG
TINY_PNG = (
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8"
    "/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg=="
)


# ── Progress endpoint ────────────────────────────────────────────────

def test_progress_discovery_anonymous():
    r = requests.get(f"{API}/kids-journey/progress/discovery", timeout=10)
    assert r.status_code == 200, r.text
    body = r.json()
    assert body["zone"] == "discovery"
    assert body["unlocked_nodes"] == ["node-1"]
    assert body["premium"] is False


def test_progress_exploration_anonymous():
    r = requests.get(f"{API}/kids-journey/progress/exploration", timeout=10)
    assert r.status_code == 200, r.text
    body = r.json()
    assert body["zone"] == "exploration"
    assert body["unlocked_nodes"] == ["node-1"]
    assert body["premium"] is False


def test_progress_invalid_zone_returns_400():
    r = requests.get(f"{API}/kids-journey/progress/invalid", timeout=10)
    assert r.status_code == 400, r.text


# ── Unlock stone ─────────────────────────────────────────────────────

def test_unlock_stone_no_auth_returns_401():
    r = requests.post(f"{API}/kids-journey/unlock-stone",
                      json={"zone": "discovery", "node_id": "node-2"},
                      timeout=10)
    assert r.status_code in (401, 403), r.text


def test_unlock_stone_with_premium_user():
    # Premium user test_token_6489e6cf1440 — try node-2 of discovery
    r = requests.post(f"{API}/kids-journey/unlock-stone",
                      headers=AUTH,
                      json={"zone": "discovery", "node_id": "node-2"},
                      timeout=10)
    # Either 200 (newly unlocked) or 200 already_unlocked, or 429 if 24h gate hits.
    # Spec: must succeed for first time. We accept all three states because
    # this user state may persist across test runs.
    if r.status_code == 429:
        pytest.skip(f"24h gate active: {r.json()}")
    assert r.status_code == 200, r.text
    body = r.json()
    assert body.get("ok") is True
    assert "node-2" in body["unlocked_nodes"]


def test_unlock_same_stone_twice_returns_already_unlocked():
    # Ensure unlocked first
    requests.post(f"{API}/kids-journey/unlock-stone",
                  headers=AUTH,
                  json={"zone": "discovery", "node_id": "node-2"},
                  timeout=10)
    r2 = requests.post(f"{API}/kids-journey/unlock-stone",
                       headers=AUTH,
                       json={"zone": "discovery", "node_id": "node-2"},
                       timeout=10)
    assert r2.status_code == 200, r2.text
    body = r2.json()
    assert body.get("already_unlocked") is True


# ── Star commit / fulfill ────────────────────────────────────────────

_commitment_id = {"id": None}


def test_star_commit_with_promise():
    r = requests.post(f"{API}/kids-journey/star/commit",
                      headers=AUTH,
                      json={"zone": "discovery", "node_id": "node-3",
                            "promise": "hike"},
                      timeout=10)
    assert r.status_code == 200, r.text
    body = r.json()
    assert body.get("ok") is True
    # If already committed from prior runs, that's fine — pick up its id
    assert body.get("promise") == "hike"
    assert "reminder_at" in body
    assert body["reminder_at"]  # 48h from promised_at
    assert body.get("fulfilled_at") in (None, "")
    _commitment_id["id"] = body["id"]


def test_star_commitments_list_contains_it():
    r = requests.get(f"{API}/kids-journey/star/commitments",
                     headers=AUTH, timeout=10)
    assert r.status_code == 200, r.text
    items = r.json()["commitments"]
    assert any(c["id"] == _commitment_id["id"] for c in items)


def test_star_commit_twice_returns_already_committed():
    r = requests.post(f"{API}/kids-journey/star/commit",
                      headers=AUTH,
                      json={"zone": "discovery", "node_id": "node-3",
                            "promise": "hike"},
                      timeout=10)
    assert r.status_code == 200
    body = r.json()
    assert body.get("already_committed") is True


def test_star_fulfill_marks_done_and_signals_next_star():
    cid = _commitment_id["id"]
    assert cid, "commit must have produced an id"
    r = requests.post(f"{API}/kids-journey/star/fulfill",
                      headers=AUTH,
                      json={"commitment_id": cid},
                      timeout=10)
    assert r.status_code == 200, r.text
    body = r.json()
    # Either fresh fulfill OR already_fulfilled (from prior runs)
    if body.get("already_fulfilled"):
        assert body.get("fulfilled_at")
    else:
        assert body.get("fulfilled_at")
        assert body.get("next_star_unlocked") is True


# ── Album upload / list / delete ─────────────────────────────────────

_photo = {"id": None}


def test_album_upload_without_affirmation_returns_400():
    r = requests.post(f"{API}/kids-journey/album/upload",
                      headers=AUTH,
                      json={
                          "zone": "discovery",
                          "node_id": "node-1",
                          "photo_base64": TINY_PNG,
                          "caption": "test",
                          "parental_affirmation": False,
                      }, timeout=10)
    assert r.status_code == 400, r.text


def test_album_upload_with_affirmation_succeeds():
    r = requests.post(f"{API}/kids-journey/album/upload",
                      headers=AUTH,
                      json={
                          "zone": "discovery",
                          "node_id": "node-1",
                          "photo_base64": TINY_PNG,
                          "caption": "TEST_phase24",
                          "parental_affirmation": True,
                      }, timeout=10)
    assert r.status_code == 200, r.text
    body = r.json()
    assert body.get("ok") is True
    assert body.get("id")
    _photo["id"] = body["id"]


def test_album_list_includes_photo_with_payload():
    r = requests.get(f"{API}/kids-journey/album/list",
                     headers=AUTH, timeout=10)
    assert r.status_code == 200, r.text
    photos = r.json()["photos"]
    match = next((p for p in photos if p["id"] == _photo["id"]), None)
    assert match, "uploaded photo missing from list"
    assert match.get("photo_base64")  # payload included


def test_album_delete_removes_photo():
    if not _photo["id"]:
        pytest.skip("upload step didn't produce photo_id")
    r = requests.post(f"{API}/kids-journey/album/delete",
                      headers=AUTH,
                      json={"photo_id": _photo["id"]},
                      timeout=10)
    assert r.status_code == 200, r.text
    body = r.json()
    assert body.get("ok") is True
    assert body.get("deleted") == 1


# ── Emotion check-in ─────────────────────────────────────────────────

def test_emotion_checkin_quiet():
    r = requests.post(f"{API}/kids-journey/emotion-checkin",
                      headers=AUTH,
                      json={"zone": "discovery", "node_id": "node-1",
                            "emotion_word": "quiet"},
                      timeout=10)
    assert r.status_code == 200, r.text
    body = r.json()
    assert body.get("ok") is True
    assert body.get("logged_emotion") == "quiet"


# ── Cron: star reminders ─────────────────────────────────────────────

def test_cron_reminders_with_admin_token():
    assert ADMIN_TOKEN, "ADMIN_TOKEN missing from /app/backend/.env"
    r = requests.post(f"{API}/kids-journey/cron/star-reminders",
                      headers={"X-Admin-Token": ADMIN_TOKEN},
                      timeout=20)
    assert r.status_code == 200, r.text
    body = r.json()
    assert body.get("ok") is True
    assert isinstance(body.get("sent"), list)
    assert isinstance(body.get("skipped"), list)


def test_cron_reminders_without_token_forbidden():
    r = requests.post(f"{API}/kids-journey/cron/star-reminders",
                      timeout=10)
    assert r.status_code == 403, r.text


# ── Admin: letter of admission ───────────────────────────────────────

def test_admin_letter_of_admission_send():
    assert ADMIN_TOKEN, "ADMIN_TOKEN missing"
    r = requests.post(
        f"{API}/admin/letter-of-admission/send",
        headers={"X-Admin-Token": ADMIN_TOKEN,
                 "Content-Type": "application/json"},
        json={"user_id": USER_ID, "force": True},
        timeout=30,
    )
    assert r.status_code == 200, r.text
    body = r.json()
    assert body.get("ok") is True
    # Accept any status string per spec
    assert isinstance(body.get("status"), str), body
