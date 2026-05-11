"""Integration test for §10 Booking System endpoints.

Uses the synthetic user pattern from test_credentials.md / iter23 tests
(direct mongo insert of users + user_sessions row, then bearer token).

Run via:  python -m pytest /app/backend/tests/test_booking_iter54.py -v
or stand-alone: python /app/backend/tests/test_booking_iter54.py
"""
from __future__ import annotations

import asyncio
import os
import uuid
from datetime import datetime, timedelta, timezone
from pathlib import Path

import httpx
from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient

load_dotenv(Path(__file__).resolve().parents[1] / ".env")

API_BASE = os.environ.get("API_BASE", "http://localhost:8001")
MONGO_URL = os.environ["MONGO_URL"]
DB_NAME = os.environ["DB_NAME"]


async def _make_user(db) -> tuple[str, str]:
    user_id = uuid.uuid4().hex
    email = f"test+{user_id[:6]}@aurin.local"
    session_token = uuid.uuid4().hex
    await db.users.insert_one({
        "user_id": user_id,
        "email": email,
        "name": "Test Wanderer",
        "role": "member",
        "auth_method": "test",
        "created_at": datetime.now(timezone.utc).isoformat(),
    })
    await db.user_sessions.insert_one({
        "user_id": user_id,
        "session_token": session_token,
        "expires_at": (datetime.now(timezone.utc) + timedelta(days=1)).isoformat(),
    })
    return user_id, session_token


async def _cleanup_user(db, user_id: str) -> None:
    await db.users.delete_many({"user_id": user_id})
    await db.user_sessions.delete_many({"user_id": user_id})
    await db.bookings.delete_many({"user_id": user_id})


async def main() -> None:
    client = AsyncIOMotorClient(MONGO_URL)
    db = client[DB_NAME]
    user_id, token = await _make_user(db)
    headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
    failures = []
    async with httpx.AsyncClient(base_url=API_BASE, timeout=15) as h:
        # 1. available-slots without auth — public
        r = await h.get("/api/booking/available-slots", params={"guide": "clarity"})
        assert r.status_code == 200, ("public slots", r.status_code, r.text)
        slots = r.json()["slots"]
        future_slot = next(s for s in slots if not s["is_past"] and not s["is_full"])
        print(f"OK public available-slots ({len(slots)} candidates)")

        # 2. mine — requires auth
        r = await h.get("/api/booking/mine")
        assert r.status_code == 401, ("mine 401", r.status_code)
        r = await h.get("/api/booking/mine", headers=headers)
        assert r.status_code == 200, ("mine auth", r.status_code, r.text)
        assert r.json()["active"] == [], "expected no active"
        print("OK auth gate + empty mine")

        # 3. reserve — happy path
        body = {
            "guide_name": "clarity",
            "session_type": "open",
            "start_at": future_slot["start_at"],
            "duration_minutes": 60,
            "intention": "I want to listen.",
            "tz": "Europe/Tallinn",
        }
        r = await h.post("/api/booking/reserve", headers=headers, json=body)
        assert r.status_code == 200, ("reserve", r.status_code, r.text)
        data = r.json()
        assert data["status"] == "reserved", data
        booking_id = data["booking"]["id"]
        assert data["confirmation"]["calm_message"], "missing calm message"
        print(f"OK reserve booking_id={booking_id}")

        # 4. reserve same slot — idempotent
        r = await h.post("/api/booking/reserve", headers=headers, json=body)
        assert r.status_code == 200, ("idempotent", r.status_code, r.text)
        assert r.json()["status"] == "already_reserved"
        print("OK reserve idempotent")

        # 5. reserve different slot — anti-FOMO 409
        other_future = next(
            s for s in slots
            if not s["is_past"] and not s["is_full"] and s["start_at"] != future_slot["start_at"]
        )
        body2 = {**body, "start_at": other_future["start_at"]}
        r = await h.post("/api/booking/reserve", headers=headers, json=body2)
        assert r.status_code == 409, ("anti-fomo", r.status_code, r.text)
        print("OK anti-FOMO single-active enforced")

        # 6. mine — should now show 1 active
        r = await h.get("/api/booking/mine", headers=headers)
        assert r.status_code == 200
        mine = r.json()
        assert len(mine["active"]) == 1, mine
        print("OK mine returns active booking")

        # 7. capacity reflects upcoming
        r = await h.get("/api/booking/capacity")
        assert r.status_code == 200
        assert r.json()["upcoming_total"] >= 1
        print("OK capacity count")

        # 8. cancel
        r = await h.post(f"/api/booking/{booking_id}/cancel", headers=headers)
        assert r.status_code == 200, ("cancel", r.status_code, r.text)
        assert r.json()["status"] == "cancelled"
        print("OK cancel")

        # 9. cancel idempotent
        r = await h.post(f"/api/booking/{booking_id}/cancel", headers=headers)
        assert r.status_code == 200
        assert r.json()["status"] == "noop"
        print("OK cancel idempotent")

        # 10. invalid duration
        r = await h.post(
            "/api/booking/reserve",
            headers=headers,
            json={**body, "duration_minutes": 45},
        )
        assert r.status_code == 400
        print("OK invalid duration rejected")

        # 11. past datetime rejected
        past_iso = (datetime.now(timezone.utc) - timedelta(hours=2)).replace(minute=0).isoformat()
        r = await h.post(
            "/api/booking/reserve",
            headers=headers,
            json={**body, "start_at": past_iso},
        )
        assert r.status_code == 400
        print("OK past datetime rejected")

        # 12. outside quiet hours rejected
        bad_hour = datetime.now(timezone.utc).replace(hour=3, minute=0, second=0, microsecond=0) + timedelta(days=1)
        r = await h.post(
            "/api/booking/reserve",
            headers=headers,
            json={**body, "start_at": bad_hour.isoformat()},
        )
        assert r.status_code == 400
        print("OK outside quiet-hours rejected")

        # 13. admin scheduler — without token 401
        r = await h.get("/api/admin/booking/schedule")
        assert r.status_code == 401
        print("OK admin requires token")

        admin_token = os.environ.get("ADMIN_TOKEN")
        if admin_token:
            ah = {"X-Admin-Token": admin_token}
            r = await h.get("/api/admin/booking/schedule", headers=ah)
            assert r.status_code == 200, r.text
            r = await h.get("/api/admin/booking/stats", headers=ah)
            assert r.status_code == 200, r.text
            print("OK admin scheduler endpoints with token")

    await _cleanup_user(db, user_id)
    if failures:
        raise SystemExit(f"FAIL: {failures}")
    print("\n=== ALL BOOKING TESTS PASSED ===")


if __name__ == "__main__":
    asyncio.run(main())
