"""
Insights surface tests (Substack soft-launch iteration 89).
Tests POST /api/insights/event, POST /api/insights/intake,
and GET /api/insights/summary.
"""
import os
import time
import uuid
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://aurin-hub.preview.emergentagent.com").rstrip("/")
API = f"{BASE_URL}/api/insights"

VALID_INTAKE_OPTIONS = [
    "i_need_a_quieter_evening",
    "family_life_feels_complicated",
    "i_need_clarity_about_something",
    "i_feel_disconnected_from_myself",
    "looking_for_something_for_my_child",
    "just_curious",
]


@pytest.fixture
def session_id():
    return f"TEST_{uuid.uuid4().hex[:12]}"


# ---- POST /event ----
class TestInsightsEvent:
    def test_pageview_accepted_returns_204(self, session_id):
        payload = {
            "session_id": session_id,
            "event_type": "pageview",
            "path": "/grace/intro",
            "device": "desktop",
        }
        r = requests.post(f"{API}/event", json=payload, timeout=15)
        assert r.status_code == 204, f"Expected 204, got {r.status_code}: {r.text}"

    def test_unknown_event_type_rejected_400(self, session_id):
        payload = {
            "session_id": session_id,
            "event_type": "spam",
            "path": "/grace/intro",
        }
        r = requests.post(f"{API}/event", json=payload, timeout=15)
        assert r.status_code == 400
        body = r.json()
        assert body.get("detail") == "unknown event_type"

    def test_event_persisted_visible_in_summary(self, session_id):
        # Three pageview beacons across paths
        for p in ["/grace/intro", "/pricing", "/library"]:
            r = requests.post(
                f"{API}/event",
                json={"session_id": session_id, "event_type": "pageview", "path": p, "device": "desktop"},
                timeout=15,
            )
            assert r.status_code == 204
        time.sleep(0.5)
        s = requests.get(f"{API}/summary", timeout=15)
        assert s.status_code == 200
        paths = [row["path"] for row in s.json().get("top_paths", [])]
        for p in ["/grace/intro", "/pricing", "/library"]:
            assert p in paths, f"{p} missing from top_paths"


# ---- POST /intake ----
class TestInsightsIntake:
    @pytest.mark.parametrize("answer", VALID_INTAKE_OPTIONS)
    def test_each_valid_option_accepted_204(self, answer, session_id):
        payload = {
            "session_id": session_id,
            "answer": answer,
            "path": "/grace/intro",
            "note": "TEST_iter89 quiet sentence",
        }
        r = requests.post(f"{API}/intake", json=payload, timeout=15)
        assert r.status_code == 204, f"Option {answer} → {r.status_code}: {r.text}"

    def test_unknown_answer_rejected_400(self, session_id):
        payload = {
            "session_id": session_id,
            "answer": "not_a_real_option",
            "path": "/grace/intro",
        }
        r = requests.post(f"{API}/intake", json=payload, timeout=15)
        assert r.status_code == 400
        assert r.json().get("detail") == "unknown answer option"

    def test_intake_with_note_appears_in_recent_notes(self, session_id):
        marker = f"TEST_iter89_marker_{uuid.uuid4().hex[:6]}"
        r = requests.post(
            f"{API}/intake",
            json={
                "session_id": session_id,
                "answer": "just_curious",
                "path": "/grace/intro",
                "note": marker,
            },
            timeout=15,
        )
        assert r.status_code == 204
        time.sleep(0.5)
        s = requests.get(f"{API}/summary", timeout=15).json()
        notes = [n.get("note") for n in s.get("recent_intake_notes", [])]
        assert marker in notes


# ---- GET /summary ----
class TestInsightsSummary:
    def test_summary_schema(self):
        r = requests.get(f"{API}/summary", timeout=15)
        assert r.status_code == 200
        body = r.json()
        for k in [
            "generated_at",
            "unique_sessions",
            "total_intake_responses",
            "top_paths",
            "intro_engagement",
            "intake_distribution",
            "recent_intake_notes",
            "allowed_intake_answers",
        ]:
            assert k in body, f"missing key {k}"

        # allowed_intake_answers must be exactly the 6 options
        assert set(body["allowed_intake_answers"]) == set(VALID_INTAKE_OPTIONS)
        assert len(body["allowed_intake_answers"]) == 6

        # intro_engagement must list the 5 host intros
        intro_paths = {p["path"] for p in body["intro_engagement"]}
        assert intro_paths == {
            "/grace/intro",
            "/sara/intro",
            "/kaelen/intro",
            "/alistair/intro",
            "/polarstar/intro",
        }
        assert len(body["intro_engagement"]) == 5

        assert isinstance(body["unique_sessions"], int)
        assert isinstance(body["total_intake_responses"], int)
        assert isinstance(body["top_paths"], list)
        assert isinstance(body["intake_distribution"], list)
        assert isinstance(body["recent_intake_notes"], list)
