"""
Iteration 76 — Kids Clarity Curriculum + Daily Mood Check-in.
Tests:
  - /api/kids-curriculum/modules
  - /api/kids-curriculum/activities (filters + lock rules)
  - /api/kids-curriculum/activities/{slug} (lock rules)
  - /api/kids-curriculum/complete (premium gate, validation)
  - /api/kids-mood/checkin (idempotent star, aurin reply, recommendations)
  - /api/kids-mood/me (scoped)
  - /api/kids-mood/parent-portal (aggregates)
  - Regression: /api/angel-stars/me still works under rate-limit bypass.
"""
import os
import time
import uuid
from datetime import datetime, timezone, timedelta

import pytest
import requests
from motor.motor_asyncio import AsyncIOMotorClient
import asyncio
from dotenv import load_dotenv

load_dotenv("/app/frontend/.env")
load_dotenv("/app/backend/.env")

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "").rstrip("/")
TOKEN = "test_token_6489e6cf1440"
MONGO_URL = os.environ.get("MONGO_URL")
DB_NAME = os.environ.get("DB_NAME")


# ── helpers ───────────────────────────────────────────────────────
@pytest.fixture(scope="session")
def base_url():
    assert BASE_URL, "REACT_APP_BACKEND_URL must be set"
    return BASE_URL


@pytest.fixture(scope="session")
def auth_headers():
    return {"Authorization": f"Bearer {TOKEN}", "Content-Type": "application/json"}


@pytest.fixture(scope="session")
def public_session():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


def _mongo():
    return AsyncIOMotorClient(MONGO_URL)[DB_NAME]


async def _ensure_user_premium(user_id: str, premium: bool):
    db = _mongo()
    if premium:
        await db.users.update_one(
            {"user_id": user_id},
            {"$set": {"presence_seconds_left": 3600, "unlimited_voice": False}},
            upsert=True,
        )
    else:
        await db.users.update_one(
            {"user_id": user_id},
            {"$set": {"presence_seconds_left": 0, "unlimited_voice": False}},
            upsert=True,
        )


async def _resolve_user_id_from_token(token: str) -> str:
    db = _mongo()
    doc = await db.user_sessions.find_one({"session_token": token}, {"_id": 0, "user_id": 1})
    assert doc, f"session for {token} not found"
    return doc["user_id"]


@pytest.fixture(scope="session")
def test_user_id():
    return asyncio.get_event_loop().run_until_complete(_resolve_user_id_from_token(TOKEN))


# ── premium-user fixture (new throwaway user with presence balance) ─
@pytest.fixture(scope="session")
def premium_token():
    token = f"test_token_prem_{uuid.uuid4().hex[:10]}"
    user_id = f"user_prem_test_{uuid.uuid4().hex[:8]}"
    db = _mongo()

    async def setup():
        now = datetime.now(timezone.utc)
        await db.users.insert_one({
            "user_id": user_id,
            "email": f"{user_id}@test.local",
            "presence_seconds_left": 3600,
            "unlimited_voice": False,
            "created_at": now.isoformat(),
        })
        await db.user_sessions.insert_one({
            "session_token": token,
            "user_id": user_id,
            "expires_at": (now + timedelta(days=1)).isoformat(),
            "created_at": now.isoformat(),
        })

    asyncio.get_event_loop().run_until_complete(setup())
    yield token, user_id

    async def teardown():
        await db.user_sessions.delete_many({"session_token": token})
        await db.users.delete_many({"user_id": user_id})
        await db.angel_stars.delete_many({"user_id": user_id})
        await db.angel_stars_actions.delete_many({"user_id": user_id})
        await db.kids_mood_checkins.delete_many({"user_id": user_id})

    asyncio.get_event_loop().run_until_complete(teardown())


# ── /kids-curriculum/modules ──────────────────────────────────────
class TestModules:
    def test_modules_shape(self, base_url, public_session):
        r = public_session.get(f"{base_url}/api/kids-curriculum/modules")
        assert r.status_code == 200, r.text
        data = r.json()
        slugs = {m["slug"] for m in data["modules"]}
        assert slugs == {"reflect", "kitchen", "quest", "create"}
        for m in data["modules"]:
            assert m["title"] and m["subtitle"] and m["color"]


# ── /kids-curriculum/activities ───────────────────────────────────
class TestActivitiesList:
    def test_little_dreamers_min8(self, base_url, public_session):
        r = public_session.get(f"{base_url}/api/kids-curriculum/activities?age_slug=little-dreamers")
        assert r.status_code == 200, r.text
        data = r.json()
        assert data["age_slug"] == "little-dreamers"
        assert len(data["activities"]) >= 8

    def test_explorers_min8(self, base_url, public_session):
        r = public_session.get(f"{base_url}/api/kids-curriculum/activities?age_slug=explorers")
        assert r.status_code == 200
        assert len(r.json()["activities"]) >= 8

    def test_dreamweavers_min8(self, base_url, public_session):
        r = public_session.get(f"{base_url}/api/kids-curriculum/activities?age_slug=dreamweavers")
        assert r.status_code == 200
        assert len(r.json()["activities"]) >= 8

    def test_legacy_slug_3_5(self, base_url, public_session):
        r = public_session.get(f"{base_url}/api/kids-curriculum/activities?age_slug=3-5")
        assert r.status_code == 200
        assert r.json()["age_slug"] == "little-dreamers"

    def test_legacy_slug_6_8(self, base_url, public_session):
        r = public_session.get(f"{base_url}/api/kids-curriculum/activities?age_slug=6-8")
        assert r.status_code == 200
        assert r.json()["age_slug"] == "explorers"

    def test_legacy_slug_9_12(self, base_url, public_session):
        r = public_session.get(f"{base_url}/api/kids-curriculum/activities?age_slug=9-12")
        assert r.status_code == 200
        assert r.json()["age_slug"] == "dreamweavers"

    def test_module_filter_kitchen(self, base_url, public_session):
        r = public_session.get(
            f"{base_url}/api/kids-curriculum/activities?age_slug=explorers&module=kitchen"
        )
        assert r.status_code == 200
        acts = r.json()["activities"]
        assert len(acts) >= 1
        # All returned activities must be in kitchen module (we infer via title-known slugs)
        slugs = {a["slug"] for a in acts}
        # kitchen-module slugs from catalog
        assert slugs.issubset({"yogurt_smoothie", "happy_sandwich", "fruit_kebab",
                               "energy_balls", "tea_for_someone", "no_bake_cookies"})

    def test_free_only_excludes_premium(self, base_url, public_session):
        r = public_session.get(
            f"{base_url}/api/kids-curriculum/activities?age_slug=explorers&free_only=true"
        )
        assert r.status_code == 200
        for a in r.json()["activities"]:
            assert a["is_premium"] is False


# ── Lock rules ────────────────────────────────────────────────────
class TestLockRules:
    def test_unauthenticated_premium_locked(self, base_url, public_session):
        r = public_session.get(f"{base_url}/api/kids-curriculum/activities?age_slug=explorers")
        assert r.status_code == 200
        for a in r.json()["activities"]:
            if a["is_premium"]:
                assert a["locked"] is True, f"{a['slug']} should be locked unauth"
                assert a["instructions"] == []
            else:
                assert a["locked"] is False
                assert isinstance(a["instructions"], list) and len(a["instructions"]) > 0

    def test_non_premium_user_locked(self, base_url, auth_headers, test_user_id):
        # ensure user is non-premium
        asyncio.get_event_loop().run_until_complete(_ensure_user_premium(test_user_id, False))
        r = requests.get(
            f"{base_url}/api/kids-curriculum/activities?age_slug=explorers",
            headers=auth_headers,
        )
        assert r.status_code == 200
        data = r.json()
        assert data["is_premium_user"] is False
        for a in data["activities"]:
            if a["is_premium"]:
                assert a["locked"] is True
                assert a["instructions"] == []

    def test_premium_user_unlocked(self, base_url, premium_token):
        token, _uid = premium_token
        h = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
        r = requests.get(f"{base_url}/api/kids-curriculum/activities?age_slug=explorers", headers=h)
        assert r.status_code == 200, r.text
        data = r.json()
        assert data["is_premium_user"] is True
        for a in data["activities"]:
            assert a["locked"] is False
            assert len(a["instructions"]) > 0


# ── /kids-curriculum/activities/{slug} ───────────────────────────
class TestActivityDetail:
    def test_detail_free(self, base_url, public_session):
        # feelings_jar is a free activity
        r = public_session.get(f"{base_url}/api/kids-curriculum/activities/feelings_jar")
        assert r.status_code == 200
        a = r.json()
        assert a["slug"] == "feelings_jar"
        assert a["locked"] is False
        assert len(a["instructions"]) > 0

    def test_detail_premium_unauth_locked(self, base_url, public_session):
        r = public_session.get(f"{base_url}/api/kids-curriculum/activities/friendship_workbook")
        assert r.status_code == 200
        a = r.json()
        assert a["is_premium"] is True
        assert a["locked"] is True
        assert a["instructions"] == []

    def test_detail_404(self, base_url, public_session):
        r = public_session.get(f"{base_url}/api/kids-curriculum/activities/does_not_exist")
        assert r.status_code == 404

    def test_detail_premium_user_unlocked(self, base_url, premium_token):
        token, _ = premium_token
        h = {"Authorization": f"Bearer {token}"}
        r = requests.get(f"{base_url}/api/kids-curriculum/activities/friendship_workbook", headers=h)
        assert r.status_code == 200
        a = r.json()
        assert a["locked"] is False
        assert len(a["instructions"]) > 0


# ── /kids-curriculum/complete ────────────────────────────────────
class TestComplete:
    def test_complete_free_activity(self, base_url, auth_headers, test_user_id):
        asyncio.get_event_loop().run_until_complete(_ensure_user_premium(test_user_id, False))
        time.sleep(0.5)
        r = requests.post(
            f"{base_url}/api/kids-curriculum/complete",
            json={"child_slug": "explorers", "activity_slug": "feelings_jar"},
            headers=auth_headers,
        )
        assert r.status_code == 200, r.text
        body = r.json()
        assert body["status"] == "pending"
        assert body["id"].startswith("asreq_")

        # verify persisted row
        async def check():
            db = _mongo()
            return await db.angel_stars_actions.find_one(
                {"id": body["id"]}, {"_id": 0}
            )
        row = asyncio.get_event_loop().run_until_complete(check())
        assert row is not None
        assert row["source"] == "curriculum_activity"
        assert row["module"] == "reflect"

    def test_complete_premium_blocked_for_non_premium(self, base_url, auth_headers, test_user_id):
        asyncio.get_event_loop().run_until_complete(_ensure_user_premium(test_user_id, False))
        time.sleep(0.5)
        r = requests.post(
            f"{base_url}/api/kids-curriculum/complete",
            json={"child_slug": "explorers", "activity_slug": "friendship_workbook"},
            headers=auth_headers,
        )
        assert r.status_code == 402, r.text

    def test_complete_invalid_slug(self, base_url, auth_headers):
        time.sleep(0.5)
        r = requests.post(
            f"{base_url}/api/kids-curriculum/complete",
            json={"child_slug": "explorers", "activity_slug": "not_a_real_slug"},
            headers=auth_headers,
        )
        assert r.status_code == 400

    def test_complete_wrong_age(self, base_url, auth_headers):
        time.sleep(0.5)
        # pencil_lines is little-dreamers only
        r = requests.post(
            f"{base_url}/api/kids-curriculum/complete",
            json={"child_slug": "dreamweavers", "activity_slug": "pencil_lines"},
            headers=auth_headers,
        )
        assert r.status_code == 400


# ── /kids-mood/checkin ───────────────────────────────────────────
class TestMoodCheckin:
    def test_checkin_first_call_awards_star(self, base_url, premium_token):
        token, uid = premium_token
        h = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
        # fetch current balance
        async def balance():
            db = _mongo()
            d = await db.angel_stars.find_one(
                {"user_id": uid, "child_slug": "explorers"}, {"_id": 0, "balance": 1}
            )
            return int((d or {}).get("balance") or 0)
        before = asyncio.get_event_loop().run_until_complete(balance())

        r = requests.post(
            f"{base_url}/api/kids-mood/checkin",
            json={"child_slug": "explorers", "mood": "good", "note": "Sunshine!"},
            headers=h,
        )
        assert r.status_code == 200, r.text
        b = r.json()
        assert b["star_awarded"] is True
        assert b["mood"] == "good"
        assert "aurin_reply" in b and len(b["aurin_reply"]) > 0
        assert "glad" in b["aurin_reply"].lower() or "bright" in b["aurin_reply"].lower()
        assert len(b["recommendations"]) == 3

        after = asyncio.get_event_loop().run_until_complete(balance())
        assert after == before + 1

    def test_checkin_idempotent_same_day(self, base_url, premium_token):
        token, _uid = premium_token
        h = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
        time.sleep(0.5)
        # second call same day
        r = requests.post(
            f"{base_url}/api/kids-mood/checkin",
            json={"child_slug": "explorers", "mood": "good"},
            headers=h,
        )
        assert r.status_code == 200
        assert r.json()["star_awarded"] is False

    def test_checkin_invalid_mood_defaults_okay(self, base_url, premium_token):
        token, _ = premium_token
        h = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
        time.sleep(0.5)
        r = requests.post(
            f"{base_url}/api/kids-mood/checkin",
            json={"child_slug": "little-dreamers", "mood": "purple-banana"},
            headers=h,
        )
        assert r.status_code == 200
        assert r.json()["mood"] == "okay"

    def test_checkin_unauth_401(self, base_url, public_session):
        r = public_session.post(
            f"{base_url}/api/kids-mood/checkin",
            json={"child_slug": "explorers", "mood": "good"},
        )
        assert r.status_code in (401, 403)


# ── /kids-mood/me + parent-portal ────────────────────────────────
class TestMoodMeAndPortal:
    def test_mood_me_scoped(self, base_url, premium_token):
        token, _ = premium_token
        h = {"Authorization": f"Bearer {token}"}
        r = requests.get(f"{base_url}/api/kids-mood/me?child_slug=explorers&days=7", headers=h)
        assert r.status_code == 200
        body = r.json()
        assert body["child_slug"] == "explorers"
        assert body["days"] == 7
        assert isinstance(body["checkins"], list)
        for c in body["checkins"]:
            assert c["child_slug"] == "explorers"

    def test_parent_portal_aggregate(self, base_url, premium_token):
        token, _ = premium_token
        h = {"Authorization": f"Bearer {token}"}
        r = requests.get(f"{base_url}/api/kids-mood/parent-portal", headers=h)
        assert r.status_code == 200, r.text
        body = r.json()
        assert "children" in body
        # at least the explorers child we just checked in
        slugs = {c["child_slug"] for c in body["children"]}
        assert "explorers" in slugs
        for c in body["children"]:
            assert {"sad", "worried", "okay", "good", "sparkly"}.issubset(set(c["counts"].keys()))
            assert "recent_notes" in c
            assert "total" in c


# ── Regression: angel-stars + rate-limit bypass ──────────────────
class TestRegression:
    def test_angel_stars_me_still_works(self, base_url, auth_headers):
        r = requests.get(f"{base_url}/api/angel-stars/me?child_slug=little-dreamers", headers=auth_headers)
        assert r.status_code == 200, r.text
        assert "balance" in r.json()

    def test_curriculum_bypasses_rate_limit(self, base_url, public_session):
        # Hammer modules endpoint > 5 times in a row — should not 429.
        for _ in range(8):
            r = public_session.get(f"{base_url}/api/kids-curriculum/modules")
            assert r.status_code == 200, f"Rate-limit hit: {r.status_code}"

    def test_mood_bypasses_rate_limit(self, base_url, premium_token):
        token, _ = premium_token
        h = {"Authorization": f"Bearer {token}"}
        for _ in range(8):
            r = requests.get(f"{base_url}/api/kids-mood/me?child_slug=explorers", headers=h)
            assert r.status_code == 200, f"Rate-limit hit on mood: {r.status_code}"
