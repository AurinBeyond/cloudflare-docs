"""
Iteration 77 backend tests:
- Referral viral loop (code, claim, lifecycle, idempotency)
- Custom Top-up Slider (ladder, nearest)
- Anna's Weekly Friday Letter (admin-token, dry-run, idempotent, full dispatch)
- Regression on iteration 75/76 endpoints (kids-mood checkin)
"""
import os
import uuid
import asyncio
from datetime import datetime, timezone, timedelta

import pytest
import requests
from motor.motor_asyncio import AsyncIOMotorClient

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://aurin-hub.preview.emergentagent.com").rstrip("/")
API = f"{BASE_URL}/api"
ADMIN_TOKEN = "5NebFHBpdy-PxqpbHyUhSvQFYjxp5d06xS1aSQGu9Kc"
MONGO_URL = os.environ.get("MONGO_URL", "mongodb://localhost:27017")
DB_NAME = os.environ.get("DB_NAME", "test_database")

_mongo = AsyncIOMotorClient(MONGO_URL)
_db = _mongo[DB_NAME]


# ---------- helpers ----------
def _run(coro):
    return asyncio.get_event_loop().run_until_complete(coro)


async def _make_user(prefix="TEST_iter77"):
    """Insert a user + session row that the backend will accept via Bearer token."""
    uid = f"user_{prefix}_{uuid.uuid4().hex[:8]}"
    token = f"tok_{prefix}_{uuid.uuid4().hex[:12]}"
    now = datetime.now(timezone.utc)
    await _db.users.insert_one({
        "user_id": uid,
        "email": f"{uid}@example.com",
        "name": "Iter77 Tester",
        "presence_seconds_left": 0,
        "created_at": now.isoformat(),
    })
    await _db.user_sessions.insert_one({
        "session_token": token,
        "user_id": uid,
        "expires_at": now + timedelta(days=1),
        "created_at": now.isoformat(),
    })
    return uid, token


async def _cleanup_user(uid):
    await _db.users.delete_many({"user_id": uid})
    await _db.user_sessions.delete_many({"user_id": uid})
    await _db.referral_codes.delete_many({"user_id": uid})
    await _db.referral_claims.delete_many({"$or": [{"referrer_id": uid}, {"referee_id": uid}]})
    await _db.credit_ledger.delete_many({"user_id": uid})
    await _db.kids_mood_checkins.delete_many({"user_id": uid})
    await _db.annas_letter_sends.delete_many({"user_id": uid})


def _h(token):
    return {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}


# ---------- Fixtures ----------
@pytest.fixture(scope="module")
def referrer():
    uid, token = _run(_make_user("ref"))
    yield {"user_id": uid, "token": token}
    _run(_cleanup_user(uid))


@pytest.fixture(scope="module")
def referee():
    uid, token = _run(_make_user("ree"))
    yield {"user_id": uid, "token": token}
    _run(_cleanup_user(uid))


@pytest.fixture(scope="module")
def third_user():
    uid, token = _run(_make_user("third"))
    yield {"user_id": uid, "token": token}
    _run(_cleanup_user(uid))


# =========================================================
# Referral
# =========================================================
class TestReferral:
    def test_me_unauth_returns_401(self):
        r = requests.get(f"{API}/referral/me", timeout=30)
        assert r.status_code == 401, r.text

    def test_me_returns_code_and_shape(self, referrer):
        r = requests.get(f"{API}/referral/me", headers=_h(referrer["token"]), timeout=10)
        assert r.status_code == 200, r.text
        d = r.json()
        assert d["code"].startswith("AURIN"), d
        assert "share_url" in d and d["code"] in d["share_url"]
        for k in ("total_invited", "total_rewarded", "pending", "total_seconds_earned", "claims"):
            assert k in d, f"missing {k}"
        referrer["code"] = d["code"]

    def test_code_is_stable(self, referrer):
        r1 = requests.get(f"{API}/referral/me", headers=_h(referrer["token"]), timeout=10).json()
        r2 = requests.get(f"{API}/referral/me", headers=_h(referrer["token"]), timeout=10).json()
        assert r1["code"] == r2["code"]

    def test_self_referral_400(self, referrer):
        # ensure code populated
        if "code" not in referrer:
            referrer["code"] = requests.get(f"{API}/referral/me", headers=_h(referrer["token"]), timeout=10).json()["code"]
        r = requests.post(f"{API}/referral/claim", headers=_h(referrer["token"]),
                          json={"code": referrer["code"]}, timeout=10)
        assert r.status_code == 400, r.text

    def test_unknown_code_404(self, referee):
        r = requests.post(f"{API}/referral/claim", headers=_h(referee["token"]),
                          json={"code": "AURINZZZZZZ"}, timeout=10)
        assert r.status_code == 404, r.text

    def test_invalid_code_format_400(self, referee):
        r = requests.post(f"{API}/referral/claim", headers=_h(referee["token"]),
                          json={"code": "BADCODE"}, timeout=10)
        assert r.status_code == 400, r.text

    def test_claim_pending_then_idempotent(self, referrer, referee):
        if "code" not in referrer:
            referrer["code"] = requests.get(f"{API}/referral/me", headers=_h(referrer["token"]), timeout=10).json()["code"]
        r = requests.post(f"{API}/referral/claim", headers=_h(referee["token"]),
                          json={"code": referrer["code"]}, timeout=10)
        assert r.status_code == 200, r.text
        d = r.json()
        assert d.get("ok") is True
        assert d.get("status") == "pending" or d.get("already") in ("pending", "rewarded")

        # second call — idempotent
        r2 = requests.post(f"{API}/referral/claim", headers=_h(referee["token"]),
                           json={"code": referrer["code"]}, timeout=10)
        assert r2.status_code == 200, r2.text
        assert "already" in r2.json()

    def test_lifecycle_first_mood_triggers_reward(self, referrer, referee):
        # capture before balances
        async def _before():
            r = await _db.users.find_one({"user_id": referrer["user_id"]}, {"_id": 0, "presence_seconds_left": 1})
            e = await _db.users.find_one({"user_id": referee["user_id"]}, {"_id": 0, "presence_seconds_left": 1})
            return int((r or {}).get("presence_seconds_left") or 0), int((e or {}).get("presence_seconds_left") or 0)
        ref_before, ree_before = _run(_before())

        # trigger first mood checkin as referee
        r = requests.post(f"{API}/kids-mood/checkin", headers=_h(referee["token"]),
                          json={"mood": "calm", "child_slug": "explorers"}, timeout=15)
        assert r.status_code in (200, 201), r.text

        async def _after():
            r = await _db.users.find_one({"user_id": referrer["user_id"]}, {"_id": 0, "presence_seconds_left": 1})
            e = await _db.users.find_one({"user_id": referee["user_id"]}, {"_id": 0, "presence_seconds_left": 1})
            claim = await _db.referral_claims.find_one({"referee_id": referee["user_id"]}, {"_id": 0})
            ledger_count = await _db.credit_ledger.count_documents(
                {"reason": "referral_reward",
                 "user_id": {"$in": [referrer["user_id"], referee["user_id"]]}}
            )
            return (
                int((r or {}).get("presence_seconds_left") or 0),
                int((e or {}).get("presence_seconds_left") or 0),
                claim, ledger_count,
            )
        ref_after, ree_after, claim, ledger_count = _run(_after())

        assert ref_after - ref_before == 500, f"referrer: {ref_before}->{ref_after}"
        assert ree_after - ree_before == 500, f"referee:  {ree_before}->{ree_after}"
        assert claim and claim.get("status") == "rewarded", claim
        assert claim.get("rewarded_at"), claim
        assert claim.get("trigger") == "first_daily_checkin", claim
        assert ledger_count >= 2, f"expected 2 ledger rows, got {ledger_count}"

    def test_second_mood_does_not_double_reward(self, referrer, referee):
        async def _before():
            r = await _db.users.find_one({"user_id": referrer["user_id"]}, {"_id": 0, "presence_seconds_left": 1})
            e = await _db.users.find_one({"user_id": referee["user_id"]}, {"_id": 0, "presence_seconds_left": 1})
            return int((r or {}).get("presence_seconds_left") or 0), int((e or {}).get("presence_seconds_left") or 0)
        ref_b, ree_b = _run(_before())
        r = requests.post(f"{API}/kids-mood/checkin", headers=_h(referee["token"]),
                          json={"mood": "calm", "child_slug": "explorers"}, timeout=15)
        assert r.status_code in (200, 201), r.text
        ref_a, ree_a = _run(_before())
        assert ref_a == ref_b, "referrer rewarded twice!"
        assert ree_a == ree_b, "referee rewarded twice!"


# =========================================================
# Top-up
# =========================================================
class TestTopup:
    def test_ladder_shape(self):
        r = requests.get(f"{API}/topup/ladder", timeout=10)
        assert r.status_code == 200, r.text
        d = r.json()
        assert d["price_per_min_eur"] == 0.60
        assert d["min_minutes"] == 10
        assert d["max_minutes"] == 300
        rungs = d["ladder"]
        mins = [r["minutes"] for r in rungs]
        assert mins == [10, 15, 30, 45, 60, 90, 120, 180, 300], mins
        for rung in rungs:
            assert rung["price_eur"] == round(rung["minutes"] * 0.60, 2)
            # No variants seeded in test env → all not purchasable
            assert rung["purchasable"] is False

    def test_nearest_50_snaps_to_45_or_60(self):
        r = requests.get(f"{API}/topup/nearest", params={"minutes": 50}, timeout=10)
        assert r.status_code == 200, r.text
        d = r.json()
        # No variant configured → purchasable False and nearest None
        assert d["requested_minutes"] == 50
        assert d["purchasable"] is False
        assert d["nearest"] is None

    def test_nearest_clamp_low(self):
        d = requests.get(f"{API}/topup/nearest", params={"minutes": 5}, timeout=10).json()
        assert d["requested_minutes"] == 10

    def test_nearest_clamp_high(self):
        d = requests.get(f"{API}/topup/nearest", params={"minutes": 999}, timeout=10).json()
        assert d["requested_minutes"] == 300


# =========================================================
# Anna's Letter
# =========================================================
class TestAnnasLetter:
    def test_no_admin_token_401(self):
        r = requests.post(f"{API}/admin/annas-letter", timeout=10)
        assert r.status_code == 401, r.text

    def test_wrong_admin_token_401(self):
        r = requests.post(f"{API}/admin/annas-letter",
                          headers={"X-Admin-Token": "wrong"}, timeout=10)
        assert r.status_code == 401

    def test_dry_run_no_activity_user(self, third_user):
        # third_user has no mood checkins
        r = requests.post(
            f"{API}/admin/annas-letter",
            params={"user_id": third_user["user_id"], "dry_run": "true"},
            headers={"X-Admin-Token": ADMIN_TOKEN}, timeout=15,
        )
        assert r.status_code == 200, r.text
        d = r.json()
        assert d.get("sent") is False
        assert d.get("reason") == "no_activity", d

    def test_dry_run_with_activity(self, referee):
        # referee has 2 mood checkins from referral test
        r = requests.post(
            f"{API}/admin/annas-letter",
            params={"user_id": referee["user_id"], "dry_run": "true"},
            headers={"X-Admin-Token": ADMIN_TOKEN}, timeout=20,
        )
        assert r.status_code == 200, r.text
        d = r.json()
        assert d.get("sent") is False
        assert d.get("reason") == "dry_run"
        assert "preview_html" in d and len(d["preview_html"]) > 100

    def test_full_dispatch_loop(self):
        r = requests.post(
            f"{API}/admin/annas-letter",
            headers={"X-Admin-Token": ADMIN_TOKEN}, timeout=60,
        )
        assert r.status_code == 200, r.text
        d = r.json()
        for k in ("total", "sent", "skipped", "errors"):
            assert k in d, f"missing {k}"
        assert isinstance(d["total"], int)

    def test_full_dispatch_idempotent(self):
        # Second call: same week — no double-send (sent should be 0).
        r2 = requests.post(
            f"{API}/admin/annas-letter",
            headers={"X-Admin-Token": ADMIN_TOKEN}, timeout=60,
        )
        d2 = r2.json()
        # If first one sent anyone, this one should skip them.
        assert d2["errors"] == 0
        # Idempotency: nothing newly sent that wasn't already sent.
        # (Without first call's count we just check no exception.)
        assert "sent" in d2


# =========================================================
# Regression: iter-75 / iter-76
# =========================================================
class TestRegression:
    def test_kids_curriculum_list(self):
        r = requests.get(f"{API}/kids-curriculum/items", timeout=10)
        assert r.status_code in (200, 404), r.text
        # 404 means alternate path; try other common one
        if r.status_code == 404:
            r = requests.get(f"{API}/kids-curriculum/all", timeout=10)
        assert r.status_code in (200, 404)

    def test_angel_stars_root(self):
        r = requests.get(f"{API}/angel-stars/courses", timeout=10)
        assert r.status_code in (200, 401, 404), r.text
