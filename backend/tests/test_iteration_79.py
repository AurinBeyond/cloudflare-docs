"""Iteration 79 — Body Temple 28 + Grace Boundaries Mode + Parent opt-out toggle regression."""
import os
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://aurin-hub.preview.emergentagent.com").rstrip("/")
TOKEN = "test_token_6489e6cf1440"  # premium test user

API = f"{BASE_URL}/api"
AUTH = {"Authorization": f"Bearer {TOKEN}"}


# ---------- Parent opt-out (P0 regression) ----------
class TestParentOptOut:
    def test_get_preferences_authed(self):
        r = requests.get(f"{API}/annas-letter/preferences", headers=AUTH, timeout=10)
        assert r.status_code == 200, r.text
        data = r.json()
        assert "opt_out" in data
        assert "email" in data
        assert isinstance(data["opt_out"], bool)

    def test_post_opt_out_true_then_false(self):
        r = requests.post(f"{API}/annas-letter/preferences", json={"opt_out": True}, headers=AUTH, timeout=10)
        assert r.status_code == 200, r.text
        assert r.json().get("opt_out") is True

        # idempotency
        r2 = requests.post(f"{API}/annas-letter/preferences", json={"opt_out": True}, headers=AUTH, timeout=10)
        assert r2.status_code == 200
        assert r2.json().get("opt_out") is True

        # toggle back off
        r3 = requests.post(f"{API}/annas-letter/preferences", json={"opt_out": False}, headers=AUTH, timeout=10)
        assert r3.status_code == 200
        assert r3.json().get("opt_out") is False

        # GET reflects new state
        g = requests.get(f"{API}/annas-letter/preferences", headers=AUTH, timeout=10).json()
        assert g["opt_out"] is False


# ---------- Body Temple 28 (P1) ----------
class TestBodyTemple:
    def test_overview_public(self):
        r = requests.get(f"{API}/body-temple/overview", timeout=10)
        assert r.status_code == 200, r.text
        d = r.json()
        assert d.get("title")
        assert d.get("price_usd") == 39
        assert d.get("total_days") == 28
        weeks = d.get("weeks") or []
        assert len(weeks) == 4
        days = d.get("days_preview") or []
        assert len(days) == 28
        assert d.get("unlocked") is False
        assert d.get("completed_count") == 0

    def test_overview_authed_unlocked(self):
        r = requests.get(f"{API}/body-temple/overview", headers=AUTH, timeout=10)
        assert r.status_code == 200
        d = r.json()
        assert d.get("unlocked") is True
        assert isinstance(d.get("completed_count"), int)

    def test_day_1_public_unlocked(self):
        # Day 1 is free (is_premium=False) per curriculum.
        r = requests.get(f"{API}/body-temple/day/1", timeout=10)
        assert r.status_code == 200, r.text
        d = r.json()
        assert d.get("unlocked") is False  # user has no premium (public)
        day_obj = d.get("day") or {}
        assert day_obj.get("is_premium") is False
        # Day 1 free: should have practice steps
        practice = day_obj.get("practice")
        assert practice not in (None, "", [], {})

    def test_day_5_public_locked(self):
        # Day 5 is premium → public should see masked practice
        r = requests.get(f"{API}/body-temple/day/5", timeout=10)
        assert r.status_code == 200, r.text
        d = r.json()
        assert d.get("unlocked") is False
        day_obj = d.get("day") or {}
        assert day_obj.get("is_premium") is True
        # Premium content should be hidden for unauth users
        practice = day_obj.get("practice")
        assert practice in (None, "", [], {}) or (isinstance(practice, list) and len(practice) == 0)

    def test_day_5_authed_unlocked(self):
        r = requests.get(f"{API}/body-temple/day/5", headers=AUTH, timeout=10)
        assert r.status_code == 200, r.text
        d = r.json()
        assert d.get("unlocked") is True
        day_obj = d.get("day") or {}
        practice = day_obj.get("practice")
        assert practice not in (None, "", [], {})

    def test_complete_day_idempotent(self):
        r1 = requests.post(f"{API}/body-temple/complete", json={"day": 2}, headers=AUTH, timeout=10)
        assert r1.status_code == 200, r1.text
        body1 = r1.json()
        assert body1.get("completed") is True or body1.get("ok") is True or "completed_count" in body1

        r2 = requests.post(f"{API}/body-temple/complete", json={"day": 2}, headers=AUTH, timeout=10)
        assert r2.status_code == 200, r2.text

        # verify persisted in overview
        ov = requests.get(f"{API}/body-temple/overview", headers=AUTH, timeout=10).json()
        assert ov.get("completed_count", 0) >= 1

    def test_day_99_not_found(self):
        r = requests.get(f"{API}/body-temple/day/99", timeout=10)
        assert r.status_code == 404

    def test_complete_requires_auth(self):
        r = requests.post(f"{API}/body-temple/complete", json={"day": 3}, timeout=10)
        assert r.status_code in (401, 403)


# ---------- Grace Boundaries Mode (P1) ----------
class TestGrace:
    def test_modes_public(self):
        r = requests.get(f"{API}/grace/modes", timeout=10)
        assert r.status_code == 200
        d = r.json()
        modes = d.get("modes") if isinstance(d, dict) else d
        assert modes is not None
        # Validate 3 keys present
        keys = []
        if isinstance(modes, list):
            keys = [m.get("key") for m in modes]
        elif isinstance(modes, dict):
            keys = list(modes.keys())
        for k in ["boundaries", "energy", "grey_rocking"]:
            assert k in keys, f"missing mode key {k}; got {keys}"

        # Validate payload completeness for one mode
        sample = None
        if isinstance(modes, list):
            sample = next((m for m in modes if m.get("key") == "boundaries"), None)
        else:
            sample = modes.get("boundaries")
        assert sample is not None
        for field in ("title", "subtitle", "blurb", "first_message"):
            assert sample.get(field), f"missing {field} in boundaries payload"

    def test_get_mode_unauth(self):
        r = requests.get(f"{API}/grace/mode", timeout=10)
        assert r.status_code == 200
        d = r.json()
        assert d.get("mode", "") == ""
        assert d.get("frame") is None

    def test_set_and_clear_mode(self):
        r = requests.post(f"{API}/grace/mode", json={"mode": "boundaries"}, headers=AUTH, timeout=10)
        assert r.status_code == 200, r.text

        g = requests.get(f"{API}/grace/mode", headers=AUTH, timeout=10).json()
        assert g.get("mode") == "boundaries"
        assert g.get("frame") is not None
        assert g["frame"].get("first_message")

        # clear
        c = requests.post(f"{API}/grace/mode", json={"mode": ""}, headers=AUTH, timeout=10)
        assert c.status_code == 200
        g2 = requests.get(f"{API}/grace/mode", headers=AUTH, timeout=10).json()
        assert g2.get("mode") == ""

    def test_unknown_mode_rejected(self):
        r = requests.post(f"{API}/grace/mode", json={"mode": "chaos"}, headers=AUTH, timeout=10)
        assert r.status_code == 400


# ---------- Regression ----------
class TestRegression:
    def test_kids_curriculum_modules(self):
        # Actual route uses hyphen: /api/kids-curriculum/modules
        r = requests.get(f"{API}/kids-curriculum/modules", timeout=10)
        assert r.status_code == 200

    def test_aurin_today_quest_unauth(self):
        r = requests.get(f"{API}/aurin/today-quest", timeout=10)
        assert r.status_code == 200

    def test_aurin_today_quest_auth(self):
        r = requests.get(f"{API}/aurin/today-quest", headers=AUTH, timeout=10)
        assert r.status_code == 200

    def test_referral_me(self):
        r = requests.get(f"{API}/referral/me", headers=AUTH, timeout=10)
        assert r.status_code == 200

    def test_referral_claim_endpoint_reachable(self):
        # The actual endpoint is /referral/claim (not /onboard); confirm reachable.
        r = requests.post(f"{API}/referral/claim", json={"code": "AURIN515556"}, headers=AUTH, timeout=10)
        # Self-claim or already-claimed both surface as 400; just verify route exists
        assert r.status_code in (200, 400, 409)
