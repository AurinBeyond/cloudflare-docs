"""
test_phase1_calmer_feedback.py — §Phase 1 calm-meter regression
(2026-02-14). Sync httpx; no pytest-asyncio dependency.
"""
from __future__ import annotations

import os

import httpx
import pytest
from dotenv import load_dotenv

load_dotenv("/app/backend/.env")


def _backend_url() -> str:
    with open("/app/frontend/.env", encoding="utf-8") as f:
        for line in f:
            if line.startswith("REACT_APP_BACKEND_URL="):
                return line.split("=", 1)[1].strip()
    raise RuntimeError("REACT_APP_BACKEND_URL not found")


BACKEND = _backend_url()


def test_feedback_accepts_yes():
    r = httpx.post(
        f"{BACKEND}/api/clarity/session-feedback",
        json={"calmer": True, "room": "clarity"},
        timeout=15,
    )
    assert r.status_code == 200, r.text
    assert r.json() == {"ok": True}


def test_feedback_accepts_no():
    r = httpx.post(
        f"{BACKEND}/api/clarity/session-feedback",
        json={"calmer": False, "room": "clarity"},
        timeout=15,
    )
    assert r.status_code == 200


def test_feedback_accepts_null_skip():
    r = httpx.post(
        f"{BACKEND}/api/clarity/session-feedback",
        json={"calmer": None, "room": "clarity"},
        timeout=15,
    )
    assert r.status_code == 200


def test_feedback_rejects_invalid_calmer():
    r = httpx.post(
        f"{BACKEND}/api/clarity/session-feedback",
        json={"calmer": "maybe"},
        timeout=15,
    )
    assert r.status_code == 400


def test_feedback_normalises_unknown_room():
    r = httpx.post(
        f"{BACKEND}/api/clarity/session-feedback",
        json={"calmer": True, "room": "rooftop"},
        timeout=15,
    )
    assert r.status_code == 200  # room silently coerced to "clarity"


def test_admin_stats_requires_token():
    r = httpx.get(f"{BACKEND}/api/admin/clarity/calmer-stats", timeout=15)
    assert r.status_code == 401


def test_admin_stats_returns_aggregate():
    admin_token = os.environ.get("ADMIN_TOKEN")
    if not admin_token:
        pytest.skip("ADMIN_TOKEN not set in environment")
    # Seed one of each before reading aggregate.
    for v in (True, False, None):
        r = httpx.post(
            f"{BACKEND}/api/clarity/session-feedback",
            json={"calmer": v, "room": "clarity"},
            timeout=15,
        )
        assert r.status_code == 200
    r = httpx.get(
        f"{BACKEND}/api/admin/clarity/calmer-stats",
        headers={"X-Admin-Token": admin_token},
        timeout=15,
    )
    assert r.status_code == 200
    data = r.json()
    assert "by_room" in data
    assert "last_30_days" in data
    room_stats = data["by_room"].get("clarity", {})
    assert room_stats.get("yes", 0) >= 1
    assert room_stats.get("no", 0) >= 1
    assert room_stats.get("not_now", 0) >= 1
