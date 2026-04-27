"""Iteration 14 — Private Cabinet topic-routing + opening greeting.

Tests:
  1. /cabinet/start seeds the opening greeting as the first guide message.
  2. /cabinet/me returns it.
  3. /cabinet/message routes the FIRST user message into one of:
       relationship_attachment | fear_anxiety | self_worth |
       confusion_identity | emotion_release | default
     and locks it on the session.
  4. The locked path doesn't change on the second user message.
  5. Greeting does NOT count toward CABINET_FREE_REPLIES (3).
  6. Crisis still wins.

Same auth pattern as test_iteration11.py — synthetic Mongo user_session.
"""
import os
import uuid
from datetime import datetime, timezone, timedelta

import pytest
import requests
from pymongo import MongoClient

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


@pytest.fixture
def auth_session(mongo_db):
    user_id = f"test-it14-{uuid.uuid4().hex[:8]}"
    session_token = f"test_session_it14_{uuid.uuid4().hex}"
    mongo_db.users.insert_one({
        "user_id": user_id,
        "email": f"test.it14.{user_id}@example.com",
        "name": "Iter14 Test User",
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
    mongo_db.users.delete_many({"user_id": user_id})
    mongo_db.user_sessions.delete_many({"session_token": session_token})
    mongo_db.cabinet_sessions.delete_many({"user_id": user_id})


def _h(token):
    return {"Authorization": f"Bearer {token}"}


GREETING_FRAGMENT = "good to meet you here"


# ---------- 1. Greeting seeded on /cabinet/start ----------

def test_start_seeds_greeting(auth_session):
    token, _ = auth_session
    r = requests.post(f"{BASE_URL}/api/cabinet/start", headers=_h(token))
    assert r.status_code == 200, r.text
    me = requests.get(f"{BASE_URL}/api/cabinet/me", headers=_h(token))
    assert me.status_code == 200
    sess = me.json()["session"]
    assert sess and sess.get("messages")
    msgs = sess["messages"]
    assert len(msgs) == 1
    assert msgs[0]["role"] == "guide"
    assert GREETING_FRAGMENT in msgs[0]["text"].lower()
    assert me.json()["guide_replies"] == 0  # greeting must not burn a free reply
    assert me.json()["show_continuation"] is False


# ---------- 2. show_continuation triggers after 3 USER messages, not 3 guide replies ----------

def test_continuation_after_3_user_messages(auth_session):
    token, _ = auth_session
    requests.post(f"{BASE_URL}/api/cabinet/start", headers=_h(token))

    r1 = requests.post(
        f"{BASE_URL}/api/cabinet/message",
        headers=_h(token),
        json={"text": "i feel sad and a bit lost"},
    )
    assert r1.status_code == 200
    assert r1.json()["guide_replies"] == 1
    assert r1.json()["show_continuation"] is False

    r2 = requests.post(
        f"{BASE_URL}/api/cabinet/message",
        headers=_h(token),
        json={"text": "still sitting with this"},
    )
    assert r2.json()["guide_replies"] == 2
    assert r2.json()["show_continuation"] is False

    r3 = requests.post(
        f"{BASE_URL}/api/cabinet/message",
        headers=_h(token),
        json={"text": "and again"},
    )
    assert r3.json()["guide_replies"] == 3
    assert r3.json()["show_continuation"] is True


# ---------- 3. Topic routing on first message ----------

ROUTING_CASES = [
    ("i miss my ex so much, i can't let go", "relationship_attachment"),
    ("i'm so afraid all the time, panic comes from nowhere", "fear_anxiety"),
    ("i hate myself, this is all my fault, i feel worthless", "self_worth"),
    ("i don't know who i am anymore, i lost myself", "confusion_identity"),
    ("everything feels heavy, i'm exhausted and numb", "emotion_release"),
    ("hello, i wanted to try this", "default"),
]


@pytest.mark.parametrize("text,expected_path", ROUTING_CASES)
def test_first_message_routes_correctly(auth_session, text, expected_path):
    token, _ = auth_session
    requests.post(f"{BASE_URL}/api/cabinet/start", headers=_h(token))
    r = requests.post(
        f"{BASE_URL}/api/cabinet/message",
        headers=_h(token),
        json={"text": text},
    )
    assert r.status_code == 200, r.text
    assert r.json().get("path") == expected_path, (
        f"text={text!r} expected={expected_path} got={r.json().get('path')}"
    )


# ---------- 4. Path locks on first message ----------

def test_path_locks_on_first_message(auth_session):
    token, _ = auth_session
    requests.post(f"{BASE_URL}/api/cabinet/start", headers=_h(token))
    r1 = requests.post(
        f"{BASE_URL}/api/cabinet/message",
        headers=_h(token),
        json={"text": "i'm so afraid of everything right now"},
    )
    assert r1.json()["path"] == "fear_anxiety"
    # Second message uses generic emotion words — path stays fear_anxiety.
    r2 = requests.post(
        f"{BASE_URL}/api/cabinet/message",
        headers=_h(token),
        json={"text": "i feel heavy and tired"},
    )
    assert r2.json()["path"] == "fear_anxiety"


# ---------- 5. Crisis still overrides routing ----------

def test_crisis_overrides_routing(auth_session):
    token, _ = auth_session
    requests.post(f"{BASE_URL}/api/cabinet/start", headers=_h(token))
    r = requests.post(
        f"{BASE_URL}/api/cabinet/message",
        headers=_h(token),
        json={"text": "i want to die, i hate myself"},
    )
    d = r.json()
    assert d["is_crisis"] is True
    text_low = d["guide"]["text"].lower()
    assert any(k in text_low for k in ["emergency", "doctor", "crisis"]), d["guide"]["text"]
