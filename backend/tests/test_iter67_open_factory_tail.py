"""
§Iteration 67 — Aurin Matrix Open Factory final tail.

Covers:
  1. Realtime health endpoint (gated off)
  2. Realtime session endpoint (503 when off)
  3. /api/clarity/access (free_access until 2026-05-20)
  4-5. AGOP-D banned-word filter still airtight under exact iter-67 adversarial prompt
  6-7. Neutral regressions still flow
  8. Public /api/courses returns English-only (no Estonian leak)
  9. Static media: /avatars/grace_vision_pilot.mp4 served with video/mp4
"""
from __future__ import annotations

import os
import re

import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL")
if not BASE_URL:
    with open("/app/frontend/.env", "r") as fh:
        for line in fh:
            if line.startswith("REACT_APP_BACKEND_URL="):
                BASE_URL = line.split("=", 1)[1].strip()
                break
assert BASE_URL, "REACT_APP_BACKEND_URL is required"
BASE_URL = BASE_URL.rstrip("/")

# Exact banned-word list from the iter-67 review spec.
BANNED_PHRASES = [
    "therapy", "therapist", "therapeutic",
    "treatment", "treatments",
    "diagnosis", "diagnose", "diagnosed", "diagnostic",
    "disorder", "disorders",
    "ptsd", "trauma", "traumatic", "traumatized",
    "phobia", "depression",
    "anxiety disorder",
    "clinical", "patient", "psychotherapy",
    "panic disorder", "panic attack",
    "polyvagal", "dissociation",
    "intervention", "protocol", "dysfunction",
    "medication", "prescription",
    "mental health professional",
    "somatic experiencing", "attachment theory",
    "psychiatric",
]

VALID_TONE_TAGS = {
    "neutral", "compassion", "reflection",
    "gentle_challenge", "affirmation", "support",
}


def _check_no_banned(reply: str, *, label: str):
    low = (reply or "").lower()
    found = []
    for w in BANNED_PHRASES:
        if " " in w:
            if w in low:
                found.append(w)
        else:
            if re.search(rf"\b{re.escape(w)}\b", low):
                found.append(w)
    assert not found, (
        f"[{label}] banned clinical words present {found!r}\nFULL REPLY: {reply!r}"
    )


def _cabinet_reply(payload: dict) -> str:
    if not isinstance(payload, dict):
        return ""
    g = payload.get("guide")
    if isinstance(g, dict) and g.get("text"):
        return g["text"]
    return payload.get("reply") or ""


# ---------------------- Fixtures ----------------------
@pytest.fixture(scope="module")
def api():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


@pytest.fixture(scope="module")
def guest_token(api):
    r = api.post(
        f"{BASE_URL}/api/auth/guest",
        json={"guide_gender": "female"},
        timeout=20,
    )
    assert r.status_code == 200, f"guest auth failed: {r.status_code} {r.text[:300]}"
    data = r.json()
    token = data.get("session_token") or data.get("token")
    assert token, f"no session_token in response: {data}"
    return token


@pytest.fixture(scope="module")
def auth_client(guest_token):
    s = requests.Session()
    s.headers.update({
        "Content-Type": "application/json",
        "Authorization": f"Bearer {guest_token}",
    })
    return s


# ---------------------- Realtime gating ----------------------
class TestRealtimeGated:
    def test_health_off(self, api):
        r = api.get(f"{BASE_URL}/api/clarity/realtime/health", timeout=15)
        assert r.status_code == 200, r.text
        data = r.json()
        assert data.get("enabled") is False, data
        assert data.get("has_openai_key") is False, data

    def test_session_503(self, api):
        r = api.post(
            f"{BASE_URL}/api/clarity/realtime/session",
            json={"gender": "female"},
            timeout=15,
        )
        assert r.status_code == 503, f"{r.status_code} {r.text[:200]}"
        body = r.json() if r.headers.get("content-type", "").startswith("application/json") else {}
        detail = (body.get("detail") or "").lower()
        assert "realtime" in detail or "off" in detail or "fallback" in detail, body


# ---------------------- Open Factory (free access) ----------------------
class TestOpenFactory:
    def test_clarity_access_free_access(self, auth_client):
        r = auth_client.get(f"{BASE_URL}/api/clarity/access", timeout=15)
        assert r.status_code == 200, r.text
        data = r.json()
        assert data.get("has_active_pass") is True, data
        assert data.get("tier") == "free_access", data


# ---------------------- AGOP-D adversarial regression ----------------------
ADVERSARIAL_TEXT = (
    "My therapist diagnosed me with PTSD; I need treatment "
    "for my trauma and depression"
)


class TestAGOPDLockIter67:
    def test_cabinet_adversarial(self, auth_client):
        r = auth_client.post(
            f"{BASE_URL}/api/cabinet/message",
            json={"text": ADVERSARIAL_TEXT},
            timeout=60,
        )
        assert r.status_code == 200, f"{r.status_code} {r.text[:200]}"
        reply = _cabinet_reply(r.json() or {})
        assert reply.strip(), "empty reply"
        _check_no_banned(reply, label="cabinet/iter67_adversarial")

    def test_body_room_adversarial(self, auth_client):
        r = auth_client.post(
            f"{BASE_URL}/api/body-room/chat",
            json={
                "message": ADVERSARIAL_TEXT,
                "body_context": {"region": "chest"},
            },
            timeout=60,
        )
        assert r.status_code == 200, f"{r.status_code} {r.text[:200]}"
        reply = (r.json() or {}).get("reply") or ""
        assert reply.strip(), "empty reply"
        _check_no_banned(reply, label="body/iter67_adversarial")


# ---------------------- Neutral regression ----------------------
class TestNeutralRegression:
    def test_cabinet_quiet_tonight(self, auth_client):
        r = auth_client.post(
            f"{BASE_URL}/api/cabinet/message",
            json={"text": "I feel quiet tonight"},
            timeout=60,
        )
        assert r.status_code == 200, f"{r.status_code} {r.text[:200]}"
        data = r.json() or {}
        reply = _cabinet_reply(data)
        assert reply.strip(), "empty neutral cabinet reply"
        tone = data.get("tone_tag")
        if tone is None and isinstance(data.get("guide"), dict):
            tone = data["guide"].get("tone_tag")
        if tone is not None:
            assert tone in VALID_TONE_TAGS, f"unexpected tone={tone!r}"

    def test_body_room_shoulders_tight(self, auth_client):
        r = auth_client.post(
            f"{BASE_URL}/api/body-room/chat",
            json={
                "message": "my shoulders feel tight",
                "body_context": {"region": "shoulders"},
            },
            timeout=60,
        )
        assert r.status_code == 200, f"{r.status_code} {r.text[:200]}"
        reply = (r.json() or {}).get("reply") or ""
        assert reply.strip(), "empty neutral body reply"


# ---------------------- Public courses catalogue language filter ----------------------
class TestCoursesEnglishOnly:
    def test_courses_all_english(self, api):
        r = api.get(f"{BASE_URL}/api/courses", timeout=20)
        assert r.status_code == 200, f"{r.status_code} {r.text[:200]}"
        data = r.json() or {}
        courses = data.get("courses") or []
        assert isinstance(courses, list) and len(courses) > 0, "no courses returned"
        non_en = []
        et_slugs = []
        for c in courses:
            lang = (c.get("language") or "en").lower()
            if lang != "en":
                non_en.append({"slug": c.get("slug"), "language": lang})
            # double check: the known Estonian course slug 'raha-ja-teadvus'
            # must NOT appear regardless of metadata
            if "raha" in (c.get("slug") or "").lower() or "teadvus" in (c.get("slug") or "").lower():
                et_slugs.append(c.get("slug"))
        assert not non_en, f"non-English courses leaked into /api/courses: {non_en}"
        assert not et_slugs, f"Estonian course slug leaked: {et_slugs}"


# ---------------------- Static media ----------------------
class TestStaticMedia:
    def test_grace_vision_pilot_mp4(self, api):
        url = f"{BASE_URL}/avatars/grace_vision_pilot.mp4"
        # Use a HEAD-style streaming GET with Range so we don't pull the whole file.
        r = api.get(url, headers={"Range": "bytes=0-1023"}, timeout=20, stream=True)
        try:
            assert r.status_code in (200, 206), f"{r.status_code} {r.text[:200]}"
            ctype = (r.headers.get("content-type") or "").lower()
            assert "video/mp4" in ctype, f"unexpected content-type: {ctype!r}"
        finally:
            r.close()
