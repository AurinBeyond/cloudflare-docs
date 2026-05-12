"""
test_stage3_3_live_integration.py — Live HTTP tests against the running
backend on REACT_APP_BACKEND_URL. Verifies the new /api/parents-room/chat
endpoint and the Cross-Room "quiet teadmine" memory bridge end-to-end.

Cleans up created test users/sessions/shared_memory_tags at teardown.
"""
from __future__ import annotations

import os
import time
import asyncio
import pytest
import requests
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

# Backend .env -> MONGO_URL / DB_NAME
load_dotenv("/app/backend/.env")

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://aurin-hub.preview.emergentagent.com").rstrip("/")
MONGO_URL = os.environ["MONGO_URL"]
DB_NAME = os.environ["DB_NAME"]


# ------------------------------ fixtures --------------------------------

@pytest.fixture(scope="module")
def guest_session():
    """Create a fresh guest user; yield (token, user_id); cleanup after."""
    r = requests.post(f"{BASE_URL}/api/auth/guest",
                      json={"guide_gender": "female"}, timeout=20)
    assert r.status_code == 200, f"auth/guest failed: {r.status_code} {r.text}"
    body = r.json()
    token = body["session_token"]
    user_id = body["user_id"]
    yield token, user_id

    # teardown -> cleanup collections
    async def _cleanup():
        cli = AsyncIOMotorClient(MONGO_URL)
        db = cli[DB_NAME]
        for coll in ("users", "user_sessions", "shared_memory_tags",
                     "clarity_user_prefs", "agreement_acceptances",
                     "cabinet_sessions", "chat_usage_daily"):
            try:
                await db[coll].delete_many({"user_id": user_id})
            except Exception:
                pass
        cli.close()
    try:
        asyncio.run(_cleanup())
    except Exception:
        pass


def _auth_headers(token: str):
    return {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}


# ------------------------------ Lenses (public) -------------------------

def test_parents_room_lenses_returns_4():
    r = requests.get(f"{BASE_URL}/api/parents-room/lenses", timeout=15)
    assert r.status_code == 200
    data = r.json()
    keys = {l.get("key") or l.get("slug") or l.get("id") or l.get("name", "").lower()
            for l in data.get("lenses", [])}
    expected = {"intuitive", "shitsuke", "montessori", "positive_coding"}
    assert expected.issubset(keys), f"Lens keys mismatch. Got: {keys}"


# ------------------------------ Auth gating -----------------------------

def test_parents_chat_requires_auth():
    r = requests.post(f"{BASE_URL}/api/parents-room/chat",
                      json={"message": "Hello"}, timeout=15)
    assert r.status_code == 401, f"Expected 401 unauth; got {r.status_code}"


# ------------------------------ Validation ------------------------------

def test_parents_chat_empty_message_returns_400(guest_session):
    token, _ = guest_session
    r = requests.post(f"{BASE_URL}/api/parents-room/chat",
                      json={"message": "  "},
                      headers=_auth_headers(token), timeout=30)
    assert r.status_code == 400


# ------------------------------ Happy path ------------------------------

def test_parents_chat_happy_path(guest_session):
    token, _ = guest_session
    r = requests.post(f"{BASE_URL}/api/parents-room/chat",
                      json={"message": "My toddler won't go to bed and I'm exhausted.",
                            "lens": "intuitive",
                            "situation": "bedtime"},
                      headers=_auth_headers(token), timeout=60)
    assert r.status_code == 200, r.text
    body = r.json()
    assert body.get("reply"), "reply text missing"
    assert isinstance(body["reply"], str) and len(body["reply"]) > 0
    assert "tone_tag" in body
    assert "user_state" in body


def test_parents_chat_invalid_lens_does_not_crash(guest_session):
    token, _ = guest_session
    r = requests.post(f"{BASE_URL}/api/parents-room/chat",
                      json={"message": "Bedtime is hard tonight.",
                            "lens": "not_a_real_lens"},
                      headers=_auth_headers(token), timeout=60)
    assert r.status_code == 200, r.text
    assert r.json().get("reply")


# ------------------------------ Crisis ---------------------------------

def test_parents_chat_crisis_phrase_redirects(guest_session):
    token, _ = guest_session
    r = requests.post(f"{BASE_URL}/api/parents-room/chat",
                      json={"message": "I want to hurt my child tonight"},
                      headers=_auth_headers(token), timeout=30)
    assert r.status_code == 200, r.text
    reply = r.json().get("reply", "")
    assert ("Eluliin" in reply) or ("116" in reply), \
        f"Expected crisis hotline in reply, got: {reply}"


def test_parents_chat_kill_myself_redirects(guest_session):
    token, _ = guest_session
    r = requests.post(f"{BASE_URL}/api/parents-room/chat",
                      json={"message": "I want to kill myself"},
                      headers=_auth_headers(token), timeout=30)
    assert r.status_code == 200
    reply = r.json().get("reply", "")
    assert ("Eluliin" in reply) or ("116" in reply)


# ------------------------------ Wellness lock ---------------------------

BANNED_EN = {"therapy", "therapist", "trauma", "diagnosis", "ptsd"}

def test_parents_chat_no_clinical_terms_in_reply(guest_session):
    token, _ = guest_session
    r = requests.post(f"{BASE_URL}/api/parents-room/chat",
                      json={"message": "My therapist said my child has trauma and PTSD; what do I do?"},
                      headers=_auth_headers(token), timeout=60)
    assert r.status_code == 200, r.text
    reply_low = r.json().get("reply", "").lower()
    leaks = [w for w in BANNED_EN if w in reply_low]
    assert not leaks, f"Banned clinical word(s) leaked in reply: {leaks} | reply={reply_low!r}"


def test_parents_chat_no_ravim_in_reply(guest_session):
    token, _ = guest_session
    r = requests.post(f"{BASE_URL}/api/parents-room/chat",
                      json={"message": "Ravim aitab last paremini magada."},
                      headers=_auth_headers(token), timeout=60)
    assert r.status_code == 200
    reply_low = r.json().get("reply", "").lower()
    assert "ravim" not in reply_low, f"'ravim' leaked: {reply_low!r}"


# ------------------------------ Cross-Room bridge -----------------------

def _read_tags_for(user_id: str):
    async def _read():
        cli = AsyncIOMotorClient(MONGO_URL)
        db = cli[DB_NAME]
        docs = []
        async for d in db.shared_memory_tags.find({"user_id": user_id}):
            d.pop("_id", None)
            docs.append(d)
        cli.close()
        return docs
    return asyncio.run(_read())


def test_cross_room_bridge_body_then_parents(guest_session):
    token, user_id = guest_session

    # 1) Post a Body Room message that should extract tiredness + child.
    r1 = requests.post(f"{BASE_URL}/api/body-room/chat",
                       json={"message": "I am exhausted and my child has not slept all week."},
                       headers=_auth_headers(token), timeout=60)
    assert r1.status_code == 200, r1.text

    # 2) Wait for fire-and-forget signal write.
    time.sleep(2.5)
    tags_after_body = _read_tags_for(user_id)
    found_tags = {t.get("tag") for t in tags_after_body}
    body_sources = {t.get("last_source_room") for t in tags_after_body}
    assert "tiredness" in found_tags or "child" in found_tags, \
        f"Body signals not recorded. tags={found_tags}"
    assert "body" in body_sources, f"last_source_room missing 'body': {body_sources}"

    # 3) Same session -> parents room. Endpoint must succeed (quiet
    #    knowledge injected server-side, not echoed to the wanderer).
    r2 = requests.post(f"{BASE_URL}/api/parents-room/chat",
                       json={"message": "Bedtime is rough tonight and I have nothing left."},
                       headers=_auth_headers(token), timeout=60)
    assert r2.status_code == 200, r2.text
    parents_reply = r2.json().get("reply", "")
    assert parents_reply

    # 4) Wait for parents-room signal write.
    time.sleep(2.5)
    tags_after_parents = _read_tags_for(user_id)
    sources = {t.get("last_source_room") for t in tags_after_parents}
    assert "parents" in sources, f"Parents room signal not stored. sources={sources}"


# ------------------------------ Regression ------------------------------

def test_body_room_chat_still_works(guest_session):
    token, _ = guest_session
    r = requests.post(f"{BASE_URL}/api/body-room/chat",
                      json={"message": "My shoulders feel tight."},
                      headers=_auth_headers(token), timeout=60)
    assert r.status_code == 200, r.text
    assert r.json().get("reply")
