"""§Stage 2.8 — Booking confirmation guide_label.

Verifies that a successful /api/booking/reserve returns
confirmation.guide_label == 'Clarity' for guide 'clarity' and 'Grace'
for guide 'grace'. Human-facing rename is on hold (founder directive).
"""
import os
from datetime import datetime, timedelta, timezone

import pytest
from fastapi.testclient import TestClient

os.environ.setdefault("DB_NAME", "matrix_aurin_test")
from server import app  # noqa: E402


@pytest.fixture(scope="module")
def client():
    with TestClient(app) as c:
        yield c


def _next_quiet_hour_iso() -> str:
    """Pick a slot >= 24h ahead inside the 18-22 UTC quiet window."""
    base = datetime.now(timezone.utc) + timedelta(days=2)
    base = base.replace(hour=20, minute=0, second=0, microsecond=0)
    return base.isoformat()


def _reserve(client, token, guide):
    return client.post(
        "/api/booking/reserve",
        headers={"Authorization": f"Bearer {token}"},
        json={
            "start_at": _next_quiet_hour_iso(),
            "guide_name": guide,
            "session_type": "open",
            "duration_minutes": 30,
            "tz": "UTC",
            "intention": "TEST_label",
        },
    )


@pytest.mark.parametrize("guide,expected", [("clarity", "Clarity"), ("grace", "Grace")])
def test_booking_guide_label_matches_internal(client, member, mongo_db, guide, expected):
    token, user_id = member
    r = _reserve(client, token, guide)
    assert r.status_code in (200, 409), (r.status_code, r.text)
    if r.status_code == 409:
        pytest.skip(f"Slot at capacity or other 409: {r.text}")
    body = r.json()
    assert body["status"] in ("reserved", "already_reserved"), body
    assert body["booking"]["guide_name"] == guide  # internal slug unchanged
    assert body["confirmation"]["guide_label"] == expected
    mongo_db.bookings.delete_many({"user_id": user_id})
