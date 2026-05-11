"""Iteration 27 — Phase B3 testing:
- Claude Sonnet 4.5 real LLM guide replies (non-curated)
- OpenAI TTS endpoint (coral/echo, etag caching, auth gating)
- Courses endpoints (list, detail, enrollment, audio companion)
- State Bridge integration with Claude AI path
- Crisis response must still win
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


# Curated prompts from server.py (CABINET_PATHS) used to verify AI replies
# are NOT falling back to the rotation.
CURATED_PROMPTS = {
    "Where in your body do you feel this most? Try not to think — just notice.",
    "If this had a single word, what would it be?",
    "Has this feeling been with you long, or did it arrive recently?",
    "What part of you is still holding it?",
    "If something inside you were a little softer right now, what would it say?",
    "What part of this still feels unfinished?",
    "When you think of this person, what returns first — the memory, or the feeling?",
    "Do you want to leave it behind, or are you simply tired of carrying it?",
    "If you separated them from the feeling for a moment, what would be left?",
    "What did you give them that you have not yet given back to yourself?",
    "Slow down for a breath. Where do you feel it in your body right now?",
    "Is the fear about something happening, or about something you might not handle?",
    "What is one small thing that is true and steady in this moment?",
    "If you spoke to this fear gently, what would it want you to know?",
    "What is the smallest piece of this you could put down for a moment?",
    "Whose voice does this judgement actually sound like?",
    "If a friend said the same thing about themselves, what would you tell them?",
    "What were you trying to do — even if it didn't go the way you hoped?",
    "Is there something you could forgive yourself for, just a little?",
    "What would be different if you stopped carrying this against yourself?",
    "Not what feels right — what feels true, right now?",
    "What part of your life still belongs to a version of you that has already changed?",
    "If nobody were watching, what would you stop doing first?",
    "Is it that you don't know what you want, or that you haven't let yourself want it yet?",
    "What is one quiet thing that has been with you for a long time, regardless of the season?",
    "It sounds like this isn't just one situation. It's something that returns. Do you notice what shifts just before that moment?",
    "Where does your body feel this most? Sometimes the body knows before the thought.",
    "Some answers arrive before thought. Is anything quietly already known?",
}

COURSE_SLUGS = [
    "letting-the-old-stories-rest",
    "the-language-you-forgot",
    "seven-quiet-evenings-with-children",
    "the-body-knows-first",
]

AUDIO_SLUGS = [
    "borrowed-beliefs",
    "as-yourself",
    "blueprint-inside-you",
    "between-each-breath",
    "what-has-changed",
]


@pytest.fixture(scope="module")
def mongo_db():
    client = MongoClient(MONGO_URL)
    yield client[DB_NAME]
    client.close()


def _h(token):
    return {"Authorization": f"Bearer {token}"}


def _make_user(mongo_db):
    user_id = f"test-it27-{uuid.uuid4().hex[:8]}"
    token = f"test_session_it27_{uuid.uuid4().hex}"
    mongo_db.users.insert_one({
        "user_id": user_id,
        "email": f"{user_id}@example.com",
        "name": "Iter27",
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
    mongo_db.course_enrollments.delete_many({"user_id": user_id})
    mongo_db.clarity_user_prefs.delete_many({"user_id": user_id})


@pytest.fixture
def member(mongo_db):
    token, user_id = _make_user(mongo_db)
    yield (token, user_id)
    _purge_user(mongo_db, user_id, token)


# ---------- /api/clarity/health ----------

def test_health_ai_and_tts_enabled():
    r = requests.get(f"{BASE_URL}/api/clarity/health", timeout=10)
    assert r.status_code == 200
    body = r.json()
    assert body["ai_guide_enabled"] is True, f"ai_guide_enabled not true: {body}"
    assert body["tts_configured"] is True, f"tts_configured not true: {body}"


# ---------- Claude guide reply ----------

def _extract_guide_text(body):
    g = body.get("guide")
    if isinstance(g, dict):
        return (g.get("text") or "").strip()
    if isinstance(g, str):
        return g.strip()
    return (body.get("guide_text") or "").strip()


def test_cabinet_message_returns_real_claude_reply(member):
    token, _ = member
    # Start session
    r = requests.post(f"{BASE_URL}/api/cabinet/start", headers=_h(token), timeout=60)
    assert r.status_code == 200, r.text
    # Send an emotionally rich message
    r = requests.post(
        f"{BASE_URL}/api/cabinet/message",
        headers=_h(token),
        json={"text": "My father passed six months ago and I still wake with this heavy weight on my chest every morning."},
        timeout=90,
    )
    assert r.status_code == 200, r.text
    body = r.json()
    guide_text = _extract_guide_text(body)
    assert guide_text, f"No guide text returned: {body}"
    # Must NOT match any curated prompt verbatim
    assert guide_text not in CURATED_PROMPTS, (
        f"Guide fell back to curated rotation instead of Claude: {guide_text!r}"
    )
    # Sanity length
    assert len(guide_text) > 15, f"Guide reply too short: {guide_text!r}"


def test_cabinet_multi_turn_context(member):
    token, _ = member
    requests.post(f"{BASE_URL}/api/cabinet/start", headers=_h(token), timeout=60)
    msgs_to_send = [
        "I've been having trouble sleeping lately. My thoughts race at 3am.",
        "Mostly about work — feeling like I'm failing everyone who depends on me.",
        "It started when my manager gave me critical feedback last week.",
    ]
    replies = []
    for text in msgs_to_send:
        r = requests.post(
            f"{BASE_URL}/api/cabinet/message",
            headers=_h(token),
            json={"text": text},
            timeout=90,
        )
        assert r.status_code == 200, r.text
        replies.append(r.json())
    # All replies must be non-empty and at least one not in curated set
    non_curated = 0
    for body in replies:
        guide_text = _extract_guide_text(body)
        if guide_text and guide_text not in CURATED_PROMPTS:
            non_curated += 1
    assert non_curated >= 2, f"Too many curated fallbacks across 3 turns: {replies}"


def test_cabinet_crisis_wins(member):
    token, _ = member
    requests.post(f"{BASE_URL}/api/cabinet/start", headers=_h(token), timeout=60)
    r = requests.post(
        f"{BASE_URL}/api/cabinet/message",
        headers=_h(token),
        json={"text": "I want to kill myself."},
        timeout=90,
    )
    assert r.status_code == 200, r.text
    body = r.json()
    guide_text = _extract_guide_text(body)
    assert "This room isn't built to carry a crisis alone" in guide_text, (
        f"Crisis response missing. Got: {guide_text!r}"
    )


# ---------- /api/clarity/tts ----------

def test_tts_requires_auth():
    r = requests.post(
        f"{BASE_URL}/api/clarity/tts",
        json={"text": "Hello", "gender": "female"},
        timeout=10,
    )
    assert r.status_code == 401


def test_tts_female_returns_audio(member):
    token, _ = member
    r = requests.post(
        f"{BASE_URL}/api/clarity/tts",
        headers=_h(token),
        json={"text": "Hello quiet wanderer.", "gender": "female"},
        timeout=60,
    )
    assert r.status_code == 200, r.text[:300]
    assert r.headers.get("content-type", "").startswith("audio/mpeg"), r.headers
    assert len(r.content) > 5000, f"Audio too small: {len(r.content)} bytes"


def test_tts_male_returns_audio(member):
    token, _ = member
    r = requests.post(
        f"{BASE_URL}/api/clarity/tts",
        headers=_h(token),
        json={"text": "Hello quiet wanderer.", "gender": "male"},
        timeout=60,
    )
    assert r.status_code == 200
    assert r.headers.get("content-type", "").startswith("audio/mpeg")
    assert len(r.content) > 5000


def test_tts_etag_304(member):
    token, _ = member
    r1 = requests.post(
        f"{BASE_URL}/api/clarity/tts",
        headers=_h(token),
        json={"text": "Same text for ETag test.", "gender": "female"},
        timeout=60,
    )
    assert r1.status_code == 200
    etag = r1.headers.get("etag") or r1.headers.get("ETag")
    assert etag, "No ETag returned"
    r2 = requests.post(
        f"{BASE_URL}/api/clarity/tts",
        headers={**_h(token), "If-None-Match": etag},
        json={"text": "Same text for ETag test.", "gender": "female"},
        timeout=30,
    )
    assert r2.status_code == 304, f"Expected 304, got {r2.status_code}"


# ---------- /api/courses ----------

def test_courses_list_has_four():
    r = requests.get(f"{BASE_URL}/api/courses", timeout=10)
    assert r.status_code == 200
    body = r.json()
    courses = body.get("courses", body) if isinstance(body, dict) else body
    assert len(courses) == 4, f"Expected 4 courses, got {len(courses)}"
    slugs = sorted(c["slug"] for c in courses)
    assert slugs == sorted(COURSE_SLUGS)
    for c in courses:
        assert c.get("audio_companion"), f"{c['slug']} missing audio_companion"
        assert c.get("audio_title"), f"{c['slug']} missing audio_title"


def test_course_detail_signed_out_only_letter_one_unlocked():
    r = requests.get(
        f"{BASE_URL}/api/courses/letting-the-old-stories-rest", timeout=10
    )
    assert r.status_code == 200
    body = r.json()
    letters = body["letters"]
    assert len(letters) == 7
    assert letters[0]["unlocked"] is True
    assert letters[0]["body"] is not None
    assert letters[0]["prompt"] is not None
    for letter in letters[1:]:
        assert letter["unlocked"] is False, f"letter {letter['day']} unexpectedly unlocked"
        assert letter["body"] is None


def test_course_enroll_idempotent(member):
    token, _ = member
    slug = "letting-the-old-stories-rest"
    r1 = requests.post(
        f"{BASE_URL}/api/courses/{slug}/enroll", headers=_h(token), timeout=10
    )
    assert r1.status_code == 200, r1.text
    assert r1.json()["status"] == "enrolled"
    r2 = requests.post(
        f"{BASE_URL}/api/courses/{slug}/enroll", headers=_h(token), timeout=10
    )
    assert r2.status_code == 200
    assert r2.json()["status"] == "already_enrolled"


def test_course_detail_enrolled_shows_day1_unlock_at_for_rest(member):
    token, _ = member
    slug = "letting-the-old-stories-rest"
    requests.post(
        f"{BASE_URL}/api/courses/{slug}/enroll", headers=_h(token), timeout=10
    )
    r = requests.get(
        f"{BASE_URL}/api/courses/{slug}", headers=_h(token), timeout=10
    )
    assert r.status_code == 200
    body = r.json()
    assert body["enrolled"] is True
    letters = body["letters"]
    # Letter 1 always unlocked
    assert letters[0]["unlocked"] is True
    # Letter 2 just enrolled — unlock_at is 1 day out, so locked
    assert letters[1]["unlocked"] is False
    assert letters[1]["unlock_at"] is not None
    # Parse to verify it's a valid ISO timestamp in the future
    unlock_dt = datetime.fromisoformat(letters[1]["unlock_at"].replace("Z", "+00:00"))
    assert unlock_dt > datetime.now(timezone.utc) - timedelta(minutes=5)


def test_course_enroll_unknown_slug_404(member):
    token, _ = member
    r = requests.post(
        f"{BASE_URL}/api/courses/does-not-exist/enroll",
        headers=_h(token),
        timeout=10,
    )
    assert r.status_code == 404


def test_course_enroll_requires_auth():
    r = requests.post(
        f"{BASE_URL}/api/courses/letting-the-old-stories-rest/enroll",
        timeout=10,
    )
    assert r.status_code == 401


# ---------- Audio files served ----------

def test_course_audio_files_served():
    # These assets are served by the React build/frontend at /assets/audio/...
    # Root of REACT_APP_BACKEND_URL routes / to frontend, /api/* to backend.
    for slug in AUDIO_SLUGS:
        url = f"{BASE_URL}/assets/audio/courses/{slug}.mp3"
        r = requests.get(url, timeout=15, stream=True)
        assert r.status_code == 200, f"{slug}: {r.status_code}"
        ctype = r.headers.get("content-type", "")
        assert "audio" in ctype or "mpeg" in ctype or "octet-stream" in ctype, (
            f"{slug} content-type: {ctype}"
        )
        # Read ~1KB to ensure body is actually streaming; check content-length if present
        clen = r.headers.get("content-length")
        if clen:
            assert int(clen) > 500_000, f"{slug} size: {clen}"


# ---------- State Bridge with Claude integration ----------

def test_state_bridge_populates_body_context(member, mongo_db):
    token, user_id = member
    # Create an unacknowledged body insight
    requests.post(
        f"{BASE_URL}/api/body-room/insight",
        headers=_h(token),
        json={"region": "crown"},
        timeout=10,
    )
    r = requests.post(f"{BASE_URL}/api/clarity/start", headers=_h(token), timeout=15)
    assert r.status_code == 200
    assert r.json().get("bridge_acknowledged") is True
    sess = mongo_db.cabinet_sessions.find_one({"user_id": user_id})
    # body_context field should exist on the session
    assert sess.get("body_context") is not None, "body_context not persisted on session"
    assert sess["body_context"].get("region") == "crown"
