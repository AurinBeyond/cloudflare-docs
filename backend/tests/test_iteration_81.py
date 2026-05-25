"""Iteration 81 — Alistair persona modes + Voice Mood NLP (Claude) + regression smoke."""
import os
import pytest
import requests
import time

BASE_URL = (os.environ.get("REACT_APP_BACKEND_URL") or "https://aurin-hub.preview.emergentagent.com").rstrip("/")
TOKEN = "test_token_6489e6cf1440"  # premium test user
API = f"{BASE_URL}/api"
AUTH = {"Authorization": f"Bearer {TOKEN}"}


# ---------- Alistair persona (new) ----------
class TestAlistair:
    def test_modes_public_3(self):
        r = requests.get(f"{API}/alistair/modes", timeout=10)
        assert r.status_code == 200, r.text
        d = r.json()
        modes = d.get("modes") if isinstance(d, dict) else d
        assert isinstance(modes, list)
        keys = [m.get("key") for m in modes]
        for k in ("focus", "decompression", "decision"):
            assert k in keys, f"missing mode {k}"
        # payload completeness
        sample = next(m for m in modes if m["key"] == "focus")
        for field in ("title", "subtitle", "blurb", "first_message", "icon", "color"):
            assert sample.get(field), f"missing {field}"

    def test_get_mode_unauth(self):
        r = requests.get(f"{API}/alistair/mode", timeout=10)
        assert r.status_code == 200
        d = r.json()
        assert d.get("mode", "") == ""
        assert d.get("frame") is None

    def test_set_get_clear_mode(self):
        r = requests.post(f"{API}/alistair/mode", json={"mode": "focus"}, headers=AUTH, timeout=10)
        assert r.status_code == 200, r.text
        g = requests.get(f"{API}/alistair/mode", headers=AUTH, timeout=10).json()
        assert g["mode"] == "focus"
        assert g["frame"] is not None
        assert g["frame"].get("first_message")

        # clear
        c = requests.post(f"{API}/alistair/mode", json={"mode": ""}, headers=AUTH, timeout=10)
        assert c.status_code == 200
        g2 = requests.get(f"{API}/alistair/mode", headers=AUTH, timeout=10).json()
        assert g2["mode"] == ""
        assert g2.get("frame") is None

    def test_unknown_mode_rejected(self):
        r = requests.post(f"{API}/alistair/mode", json={"mode": "rocketfuel"}, headers=AUTH, timeout=10)
        assert r.status_code == 400


# ---------- Voice Mood NLP (new) ----------
class TestVoiceMood:
    def test_extract_positive_text(self):
        body = {
            "text": "I felt the long exhale soften my chest. Things look a little lighter than this morning.",
            "room": "kaelan",
        }
        r = requests.post(f"{API}/voice-mood/extract", json=body, headers=AUTH, timeout=45)
        assert r.status_code == 200, r.text
        d = r.json()
        assert d.get("stored") is True, f"expected stored=True, got {d}"
        assert d.get("mood") in ("good", "sparkly", "okay"), f"mood={d.get('mood')}"
        assert isinstance(d.get("confidence"), (int, float))
        assert 0.0 <= d["confidence"] <= 1.0
        assert d.get("aurin_line")

    def test_extract_empty_text_no_signal(self):
        r = requests.post(f"{API}/voice-mood/extract", json={"text": ""}, headers=AUTH, timeout=15)
        assert r.status_code == 200
        d = r.json()
        assert d.get("stored") is False
        assert d.get("reason") == "no_signal"

    def test_extract_too_short_text_no_signal(self):
        r = requests.post(f"{API}/voice-mood/extract", json={"text": "ok"}, headers=AUTH, timeout=15)
        assert r.status_code == 200
        d = r.json()
        assert d.get("stored") is False

    def test_recent_signals(self):
        # ensure at least one signal exists from prior test
        time.sleep(1)
        r = requests.get(f"{API}/voice-mood/recent?days=7", headers=AUTH, timeout=10)
        assert r.status_code == 200, r.text
        d = r.json()
        signals = d.get("signals", [])
        assert isinstance(signals, list)
        if signals:
            s0 = signals[0]
            assert s0.get("mood") in ("sad", "worried", "okay", "good", "sparkly")
            assert "confidence" in s0
            assert s0.get("source") == "voice_reflection"
            # PRIVACY: raw text must NEVER be in stored doc
            assert "text" not in s0, f"FOUND raw text in stored signal: {s0}"
            # created_at present, sorted desc
            assert s0.get("created_at")

    def test_recent_sorted_desc(self):
        # post 2 signals back-to-back with distinct text
        requests.post(f"{API}/voice-mood/extract",
                      json={"text": "A heavy quiet sits inside me today, tears close to the surface."},
                      headers=AUTH, timeout=45)
        time.sleep(0.5)
        requests.post(f"{API}/voice-mood/extract",
                      json={"text": "There is a soft brightness in me right now, like sun on water."},
                      headers=AUTH, timeout=45)
        r = requests.get(f"{API}/voice-mood/recent?days=7", headers=AUTH, timeout=10)
        signals = r.json().get("signals", [])
        if len(signals) >= 2:
            assert signals[0]["created_at"] >= signals[1]["created_at"]

    def test_auth_required(self):
        r = requests.post(f"{API}/voice-mood/extract", json={"text": "hello world this is a test"}, timeout=10)
        assert r.status_code in (401, 403)
        r2 = requests.get(f"{API}/voice-mood/recent?days=7", timeout=10)
        assert r2.status_code in (401, 403)


# ---------- Smoke test: regression on prior endpoints ----------
class TestRegression:
    def test_body_temple_overview(self):
        r = requests.get(f"{API}/body-temple/overview", timeout=10)
        assert r.status_code == 200

    def test_body_temple_day_1(self):
        r = requests.get(f"{API}/body-temple/day/1", timeout=10)
        assert r.status_code == 200

    def test_body_temple_complete_auth(self):
        r = requests.post(f"{API}/body-temple/complete", json={"day": 1}, headers=AUTH, timeout=10)
        assert r.status_code == 200

    def test_grace_modes(self):
        r = requests.get(f"{API}/grace/modes", timeout=10)
        assert r.status_code == 200

    def test_kids_curriculum(self):
        r = requests.get(f"{API}/kids-curriculum/modules", timeout=10)
        assert r.status_code == 200

    def test_annas_letter_prefs(self):
        r = requests.get(f"{API}/annas-letter/preferences", headers=AUTH, timeout=10)
        assert r.status_code == 200
