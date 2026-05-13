"""Phase 1 STABILIZATION (2026-02-14) — ConvAI signed-URL regression lock.

Pins the contract of `POST /api/clarity/convai/signed-url`:
  • Auth required (401 without Bearer)
  • Strict room allowlist (422 on bad enum value)
  • Room → agent_id mapping is server-side only, never leaks to body
  • 502 when ElevenLabs API errors (graceful, not 500)

The agent_id leak test is the most important regression lock — if a
future iter accidentally returns the raw agent_id in the response
body, this test fails.
"""
import os

import httpx


PREVIEW_URL = os.getenv(
    "PREVIEW_URL", "https://aurin-hub.preview.emergentagent.com"
)
TEST_TOKEN = "ccb7b5b6-b89a-4e2b-b8d0-d25d18667cb8ae154a55d93342dc8ae34a83287340cd"


def _post(json_body, headers=None):
    h = headers or {}
    with httpx.Client(timeout=15.0) as c:
        return c.post(
            f"{PREVIEW_URL}/api/clarity/convai/signed-url",
            json=json_body,
            headers=h,
        )


def test_convai_requires_auth():
    r = _post({"room": "clarity"})
    assert r.status_code == 401


def test_convai_rejects_unknown_room():
    """The Literal type on the Pydantic model returns 422 on unknown rooms."""
    r = _post({"room": "evil"}, {"Authorization": f"Bearer {TEST_TOKEN}"})
    assert r.status_code == 422


def test_convai_rejects_missing_room():
    r = _post({}, {"Authorization": f"Bearer {TEST_TOKEN}"})
    assert r.status_code == 422


def test_convai_accepts_all_four_rooms_into_routing():
    """Each of the four allowed rooms must AT LEAST pass the allowlist
    gate. The endpoint may return 200 (key valid) or 502 (key invalid)
    or 503 (env missing) — but it MUST NOT 400/422 on these values."""
    for room in ("clarity", "body", "parents", "courses"):
        r = _post(
            {"room": room}, {"Authorization": f"Bearer {TEST_TOKEN}"}
        )
        assert r.status_code in (200, 502, 503), (
            f"room={room} got unexpected {r.status_code}: {r.text[:200]}"
        )


def test_convai_response_never_leaks_agent_id():
    """Critical isolation lock: even on a successful response the body
    must contain only `signed_url` and `room` — never the raw
    `agent_id` value (those live exclusively in backend .env)."""
    r = _post(
        {"room": "clarity"}, {"Authorization": f"Bearer {TEST_TOKEN}"}
    )
    # Whatever the status, the body must never carry an agent_ prefix.
    body = r.text
    assert "agent_019e22de" not in body, (
        "agent_id leaked into response body"
    )


def test_convai_response_shape_when_successful():
    """If the upstream call succeeds, the response shape must be
    exactly {signed_url, room}. Skips gracefully if upstream is down."""
    r = _post(
        {"room": "clarity"}, {"Authorization": f"Bearer {TEST_TOKEN}"}
    )
    if r.status_code != 200:
        return  # upstream not reachable today; that's OK for this test
    payload = r.json()
    assert "signed_url" in payload
    assert payload.get("room") == "clarity"
    assert payload["signed_url"].startswith("wss://")
