"""§KIDS-JOURNEY 2026-02-10 — smoke tests for the 28-day stone path API."""

import os

import requests

BACKEND = os.environ.get("KIDS_JOURNEY_TEST_BACKEND", "http://localhost:8001")


def test_progress_anonymous_default():
    r = requests.get(f"{BACKEND}/api/kids-journey/progress?child_slug=explorers", timeout=10)
    assert r.status_code == 200
    body = r.json()
    assert body["child_slug"] == "explorers"
    assert body["today_index"] == 1
    assert body["completed_days"] == []
    assert body["total_days"] == 28
    assert len(body["messages"]) == 28
    assert body["anonymous"] is True


def test_progress_legacy_slug_alias():
    r = requests.get(f"{BACKEND}/api/kids-journey/progress?child_slug=3-5", timeout=10)
    assert r.status_code == 200
    body = r.json()
    assert body["child_slug"] == "little-dreamers"
    assert len(body["messages"]) == 28


def test_day_endpoint_clamps():
    r = requests.get(f"{BACKEND}/api/kids-journey/day/15?child_slug=dreamweavers", timeout=10)
    assert r.status_code == 200
    assert r.json()["day"] == 15
    assert isinstance(r.json()["message"], str)

    r2 = requests.get(f"{BACKEND}/api/kids-journey/day/99?child_slug=explorers", timeout=10)
    assert r2.status_code == 200
    assert r2.json()["day"] == 28

    r3 = requests.get(f"{BACKEND}/api/kids-journey/day/0?child_slug=explorers", timeout=10)
    assert r3.status_code == 200
    assert r3.json()["day"] == 1


def test_messages_are_distinct_per_age():
    a = requests.get(f"{BACKEND}/api/kids-journey/progress?child_slug=little-dreamers", timeout=10).json()
    b = requests.get(f"{BACKEND}/api/kids-journey/progress?child_slug=explorers", timeout=10).json()
    c = requests.get(f"{BACKEND}/api/kids-journey/progress?child_slug=dreamweavers", timeout=10).json()
    assert a["messages"][0] != b["messages"][0]
    assert b["messages"][0] != c["messages"][0]
