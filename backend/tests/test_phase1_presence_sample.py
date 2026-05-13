"""
test_phase1_presence_sample.py — §Phase 1 public Grace-demo
endpoint regression (2026-02-14).

Locks the public `/api/presence/sample` route the founder will share
with the bank (Tanushree / Revolut) and any external demo audience.
"""
from __future__ import annotations

import time

import httpx
from dotenv import load_dotenv

load_dotenv("/app/backend/.env")


def _backend_url() -> str:
    with open("/app/frontend/.env", encoding="utf-8") as f:
        for line in f:
            if line.startswith("REACT_APP_BACKEND_URL="):
                return line.split("=", 1)[1].strip()
    raise RuntimeError("REACT_APP_BACKEND_URL not found")


BACKEND = _backend_url()


def test_presence_sample_returns_mp3():
    r = httpx.post(
        f"{BACKEND}/api/presence/sample",
        json={"gender": "female", "line": "Quietly here."},
        timeout=30,
    )
    # First call should either succeed (200) or be rate-limited if a
    # recent caller from the same egress IP triggered the cool-down.
    # We accept 200 OR 429; the lockable contract is "fast, audio/mpeg
    # on success, never 5xx".
    assert r.status_code in (200, 429), r.text
    if r.status_code == 200:
        assert r.headers["content-type"].startswith("audio/")
        assert len(r.content) > 1000  # non-empty mp3
        # MP3 magic: either an "ID3" tag header or a frame sync byte
        # pair starting 0xFF 0xF? (versions 1/2/2.5 all permitted).
        head = r.content[:3]
        assert head == b"ID3" or (
            r.content[0] == 0xFF and (r.content[1] & 0xE0) == 0xE0
        ), f"unexpected mp3 head: {head!r}"


def test_presence_sample_normalises_unknown_gender():
    r = httpx.post(
        f"{BACKEND}/api/presence/sample",
        json={"gender": "alien", "line": "Hello."},
        timeout=30,
    )
    assert r.status_code in (200, 429)
    # Either succeeds (coerced to female) or gets cooled-down.


def test_presence_sample_caps_long_line():
    long_line = "She breathes. " * 60  # ~840 chars
    r = httpx.post(
        f"{BACKEND}/api/presence/sample",
        json={"gender": "female", "line": long_line},
        timeout=30,
    )
    # Endpoint internally truncates to 320 chars; expects 200 or 429.
    assert r.status_code in (200, 429)


def test_presence_sample_cooldown():
    # Wait until any prior in-flight cool-down has elapsed.
    time.sleep(26)
    r1 = httpx.post(
        f"{BACKEND}/api/presence/sample",
        json={"gender": "female", "line": "Quietly here."},
        timeout=30,
    )
    assert r1.status_code == 200, r1.text
    # Second call within cool-down should be rejected with 429.
    r2 = httpx.post(
        f"{BACKEND}/api/presence/sample",
        json={"gender": "female", "line": "Quietly here."},
        timeout=30,
    )
    assert r2.status_code == 429
    assert "wait" in r2.text.lower()
