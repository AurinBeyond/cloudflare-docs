"""Integration test for §G2 cross-session memory — /cabinet/threads and
/cabinet/resume endpoints (iter 56).

Synthetic-user pattern (matches test_booking_iter54.py).
Run: python /app/backend/tests/test_cabinet_resume_iter56.py"""
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
    email = f"resume+{user_id[:6]}@aurin.local"
    session_token = uuid.uuid4().hex
    await db.users.insert_one({
        "user_id": user_id,
        "email": email,
        "name": "Resume Test",
        "role": "member",
        "auth_method": "test",
        "created_at": datetime.now(timezone.utc).isoformat(),
        # Bypass the threshold consent gate for cabinet endpoints.
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
    await db.cabinet_sessions.delete_many({"user_id": user_id})
    await db.clarity_passes.delete_many({"user_id": user_id})


async def main() -> None:
    client = AsyncIOMotorClient(MONGO_URL)
    db = client[DB_NAME]
    user_id, token = await _make_user(db)
    headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}

    async with httpx.AsyncClient(base_url=API_BASE, timeout=20) as h:
        # 1. Empty list initially.
        r = await h.get("/api/cabinet/threads", headers=headers)
        assert r.status_code == 200, r.text
        assert r.json()["count"] == 0
        print("OK empty threads list")

        # 2. Auth gate.
        r = await h.get("/api/cabinet/threads")
        assert r.status_code == 401
        r = await h.post("/api/cabinet/resume", json={"thread_key": "x"})
        assert r.status_code == 401
        print("OK auth gates")

        # 3. Open a session, send one message with keep_thread=true so
        #    the backend issues a thread_key.
        r = await h.post("/api/clarity/start", headers=headers)
        assert r.status_code in (200, 201), r.text
        r = await h.post(
            "/api/cabinet/message",
            headers=headers,
            json={"text": "I want to put down a story tonight.", "keep_thread": True},
        )
        assert r.status_code == 200, r.text
        first_data = r.json()
        thread_key = first_data.get("thread_key")
        assert thread_key, f"expected thread_key, got {first_data}"
        print(f"OK session opened with thread_key={thread_key[:8]}…")

        # 4. Close it.
        r = await h.post("/api/cabinet/clear", headers=headers)
        assert r.status_code == 200
        print("OK session closed")

        # 5. Threads list should now show 1 entry with our preview.
        r = await h.get("/api/cabinet/threads", headers=headers)
        assert r.status_code == 200
        body = r.json()
        assert body["count"] == 1, body
        thread = body["threads"][0]
        assert thread["thread_key"] == thread_key
        assert "put down a story" in (thread["preview"] or "")
        assert thread["user_message_count"] == 1
        print(f"OK thread surfaced with preview: {thread['preview'][:40]}…")

        # 6. Resume by thread_key.
        r = await h.post(
            "/api/cabinet/resume",
            headers=headers,
            json={"thread_key": thread_key},
        )
        assert r.status_code == 200, r.text
        sess = r.json()["session"]
        assert sess["thread_key"] == thread_key
        assert sess["closed"] is False
        # Verify the user message text is decrypted on the way out.
        user_msgs = [m for m in sess["messages"] if m["role"] == "user"]
        assert len(user_msgs) == 1
        assert "put down a story" in user_msgs[0]["text"]
        print("OK resume rehydrates encrypted history")

        # 7. /cabinet/me should now reflect the resumed session.
        r = await h.get("/api/cabinet/me", headers=headers)
        assert r.status_code == 200
        me = r.json()
        assert me["session"]["id"] == sess["id"]
        print("OK /cabinet/me reflects resumed session")

        # 8. Idempotent resume.
        r = await h.post(
            "/api/cabinet/resume",
            headers=headers,
            json={"thread_key": thread_key},
        )
        assert r.status_code == 200
        print("OK resume idempotent")

        # 9. Resume by unknown key → 404.
        r = await h.post(
            "/api/cabinet/resume",
            headers=headers,
            json={"thread_key": "nope-not-real"},
        )
        assert r.status_code == 404
        print("OK unknown thread_key 404")

        # 10. Resume requires at least one of {thread_key, session_id}.
        r = await h.post("/api/cabinet/resume", headers=headers, json={})
        assert r.status_code == 400
        print("OK missing-arg 400")

    await _cleanup(db, user_id)
    print("\n=== ALL CABINET RESUME TESTS PASSED ===")


if __name__ == "__main__":
    asyncio.run(main())
