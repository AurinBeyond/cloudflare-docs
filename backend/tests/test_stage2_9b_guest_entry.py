"""§Stage 2.9b — Guest entry flow.

Verifies via API only (no DB pokes, so we sidestep async-loop mismatch
between TestClient and motor):
- POST /api/auth/guest creates a usable session (female + male).
- /api/auth/me with the session token returns role=guest.
- Re-using the token reaches /api/clarity/access cleanly.
- Coming-Soon overlay blocks paid course enroll with a calm 409.
- /api/catalogue/availability lists all 4 paid courses as coming soon.
"""
import os
from fastapi.testclient import TestClient

os.environ.setdefault("DB_NAME", "matrix_aurin_test")

import pytest
from server import app


@pytest.fixture(scope="module")
def client():
    with TestClient(app) as c:
        yield c


def test_guest_entry_female_creates_full_session(client):
    r = client.post("/api/auth/guest", json={"guide_gender": "female"})
    assert r.status_code == 200, r.text
    body = r.json()
    assert body["redirect_to"] == "/clarity-release"
    assert body["guide_gender"] == "female"
    token = body["session_token"]
    me = client.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert me.status_code == 200
    me_body = me.json()
    assert me_body["role"] == "guest"
    assert me_body["email"].startswith("guest-")
    assert me_body["email"].endswith("@guest.aurin.local")
    prefs = client.get("/api/clarity/prefs", headers={"Authorization": f"Bearer {token}"})
    assert prefs.status_code == 200
    p = prefs.json()
    assert p["guide_gender"] == "female"
    assert p.get("has_consented") is True or p.get("consent_v2") is True


def test_guest_entry_male_creates_male_voice_session(client):
    r = client.post("/api/auth/guest", json={"guide_gender": "male"})
    assert r.status_code == 200, r.text
    body = r.json()
    assert body["guide_gender"] == "male"
    token = body["session_token"]
    prefs = client.get("/api/clarity/prefs", headers={"Authorization": f"Bearer {token}"})
    assert prefs.status_code == 200
    assert prefs.json()["guide_gender"] == "male"


def test_guest_token_reaches_clarity_access(client):
    r = client.post("/api/auth/guest", json={"guide_gender": "female"})
    token = r.json()["session_token"]
    acc = client.get(
        "/api/clarity/access",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert acc.status_code in (200, 403), acc.text


def test_coming_soon_lock_blocks_paid_course_enroll(client):
    r = client.post("/api/auth/guest", json={"guide_gender": "female"})
    token = r.json()["session_token"]
    en = client.post(
        "/api/courses/letting-the-old-stories-rest/enroll",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert en.status_code == 409, en.text
    detail = en.json()["detail"]
    assert "few days" in detail or "quiet list" in detail
    assert "Error" not in detail
    assert "Exception" not in detail


def test_coming_soon_overlay_listed_in_catalogue_availability(client):
    r = client.get("/api/catalogue/availability")
    assert r.status_code == 200
    cs = r.json().get("coming_soon", {})
    for slug in (
        "course-letting-the-old-stories-rest",
        "course-the-language-you-forgot",
        "course-seven-quiet-evenings-with-children",
        "course-the-body-knows-first",
    ):
        assert slug in cs, f"{slug} missing from coming_soon overlay"
        assert cs[slug]["kind"] == "course"
