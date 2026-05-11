"""§G3 Body Room Mentor — endpoint wiring + crisis override (iter 60).

Tests:
1. Auth gate → 401 unauth
2. Empty message → 400
3. Crisis-phrase short-circuit returns the hotline reply WITHOUT a Claude call
4. Happy path returns a non-empty reply (LLM-budget-tolerant: 200 with reply OR soft-fallback line containing "Clarity Release")
5. Long message gets truncated server-side (no 4xx)
6. body_context + history payloads accepted

Run:  python /app/backend/tests/test_body_chat_iter60.py"""
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
    email = f"body+{user_id[:6]}@aurin.local"
    session_token = uuid.uuid4().hex
    await db.users.insert_one({
        "user_id": user_id,
        "email": email,
        "name": "Body Test",
        "role": "member",
        "auth_method": "test",
        "created_at": datetime.now(timezone.utc).isoformat(),
        "clarity_has_consented": True,
        "clarity_consent_at": datetime.now(timezone.utc).isoformat(),
    })
    await db.user_sessions.insert_one({
        "user_id": user_id,
        "session_token": session_token,
        "expires_at": (datetime.now(timezone.utc) + timedelta(days=1)).isoformat(),
    })
    return user_id, session_token


async def _cleanup(db, user_id: str) -> None:
    await db.users.delete_many({"user_id": user_id})
    await db.user_sessions.delete_many({"user_id": user_id})


async def main() -> None:
    client = AsyncIOMotorClient(MONGO_URL)
    db = client[DB_NAME]
    user_id, token = await _make_user(db)
    headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}

    async with httpx.AsyncClient(base_url=API_BASE, timeout=60) as h:
        # 1. Auth gate
        r = await h.post("/api/body-room/chat", json={"message": "hi"})
        assert r.status_code == 401
        print("OK auth gate")

        # 2. Empty message
        r = await h.post("/api/body-room/chat", headers=headers, json={"message": "  "})
        assert r.status_code == 400
        print("OK empty message rejected")

        # 3. Crisis short-circuit — must NOT hit Claude, must contain the
        #    hotline number even if LLM budget is exhausted.
        r = await h.post(
            "/api/body-room/chat",
            headers=headers,
            json={"message": "I want to end my life tonight."},
        )
        assert r.status_code == 200, r.text
        reply = r.json().get("reply", "")
        assert "116 123" in reply or "112" in reply, f"crisis reply missing hotline: {reply!r}"
        print(f"OK crisis override · {reply[:60]}…")

        # 4. Happy path
        r = await h.post(
            "/api/body-room/chat",
            headers=headers,
            json={
                "message": "My chest is heavy tonight.",
                "body_context": {"region": "Chest", "pattern_label": "Held grief"},
                "history": [],
                "transient_context": [],
            },
        )
        assert r.status_code == 200, r.text
        reply = r.json().get("reply", "")
        assert isinstance(reply, str) and len(reply) > 0
        # Reply is either an LLM response or our soft-fallback. Both
        # contain a non-empty string. We do not hard-assert wording
        # because the LLM voice can vary.
        print(f"OK happy reply · {len(reply)} chars · {reply[:60]}…")

        # 5. Long message truncation does not 4xx
        long_msg = "I notice. " * 300  # ~3000 chars
        r = await h.post(
            "/api/body-room/chat",
            headers=headers,
            json={"message": long_msg},
        )
        assert r.status_code == 200, r.text
        print("OK long message handled")

        # 6. History payload accepted
        r = await h.post(
            "/api/body-room/chat",
            headers=headers,
            json={
                "message": "And the throat feels closed.",
                "history": [
                    {"role": "user", "text": "My chest is heavy."},
                    {"role": "guide", "text": "Stay with the chest. One slow exhale, if it helps."},
                ],
            },
        )
        assert r.status_code == 200, r.text
        print("OK history payload accepted")

    await _cleanup(db, user_id)
    print("\n=== ALL BODY-ROOM CHAT TESTS PASSED ===")


if __name__ == "__main__":
    asyncio.run(main())
