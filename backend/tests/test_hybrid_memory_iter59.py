"""§HYBRID MEMORY (iter 59) — verify the pref-default reversal +
transient_context flow.

Tests:
1. New users get save_threads=False by default (Eternal Thread off).
2. POST /clarity/prefs save_threads=true persists; saved doc returns
   save_threads=true.
3. /cabinet/start accepts an optional transient_context payload and
   stores it on the session document.
4. Sessions opened without transient_context have an empty list.
5. transient_context capped at 5 entries × 240 chars.

We do NOT assert on Claude reply content (LLM budget may be reached).

Run:  python /app/backend/tests/test_hybrid_memory_iter59.py"""
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
    email = f"hybrid+{user_id[:6]}@aurin.local"
    session_token = uuid.uuid4().hex
    await db.users.insert_one({
        "user_id": user_id,
        "email": email,
        "name": "Hybrid Test",
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
    await db.clarity_user_prefs.delete_many({"user_id": user_id})
    await db.cabinet_sessions.delete_many({"user_id": user_id})
    await db.cabinet_user_summaries.delete_many({"user_id": user_id})


async def main() -> None:
    client = AsyncIOMotorClient(MONGO_URL)
    db = client[DB_NAME]
    user_id, token = await _make_user(db)
    headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}

    async with httpx.AsyncClient(base_url=API_BASE, timeout=30) as h:
        # 1. New user: save_threads default = False
        r = await h.get("/api/clarity/prefs", headers=headers)
        assert r.status_code == 200, r.text
        prefs = r.json()
        assert prefs["save_threads"] is False, prefs
        print("OK new-user save_threads default = False (Eternal Thread off)")

        # 2. POST /clarity/prefs save_threads=true persists
        r = await h.post(
            "/api/clarity/prefs",
            headers=headers,
            json={"save_threads": True, "consent_v2": True},
        )
        assert r.status_code == 200, r.text
        assert r.json()["save_threads"] is True
        # Re-read confirms it stuck.
        r = await h.get("/api/clarity/prefs", headers=headers)
        assert r.json()["save_threads"] is True
        print("OK Eternal Thread opt-in persists")

        # Reset to the default-off state for the next tests.
        await db.clarity_user_prefs.update_one(
            {"user_id": user_id},
            {"$set": {"save_threads": False}},
        )

        # 3. /cabinet/start accepts transient_context and stores it
        fragments = [
            "Last time I noticed my chest carrying a sentence.",
            "I want to put down what was given to me before I could speak.",
        ]
        r = await h.post(
            "/api/cabinet/start",
            headers=headers,
            json={"transient_context": fragments},
        )
        assert r.status_code in (200, 201), r.text
        sid = r.json()["session_id"]
        sess = await db.cabinet_sessions.find_one({"id": sid}, {"_id": 0})
        assert sess and sess.get("transient_context") == fragments, sess
        print("OK transient_context stored on session")

        # 4. /cabinet/start without payload → empty list
        r = await h.post("/api/cabinet/start", headers=headers, json={})
        assert r.status_code in (200, 201)
        sid2 = r.json()["session_id"]
        sess2 = await db.cabinet_sessions.find_one({"id": sid2}, {"_id": 0})
        assert sess2.get("transient_context") == [], sess2.get("transient_context")
        print("OK empty transient_context defaults clean")

        # 5. Cap: 8 entries × 500 chars → server caps at 5 × 240
        long_fragments = [
            ("a" * 500) for _ in range(8)
        ]
        r = await h.post(
            "/api/cabinet/start",
            headers=headers,
            json={"transient_context": long_fragments},
        )
        assert r.status_code in (200, 201)
        sid3 = r.json()["session_id"]
        sess3 = await db.cabinet_sessions.find_one({"id": sid3}, {"_id": 0})
        cleaned = sess3.get("transient_context") or []
        assert len(cleaned) == 5, f"expected 5 capped entries, got {len(cleaned)}"
        for entry in cleaned:
            assert len(entry) <= 241, f"entry too long: {len(entry)}"
        print(f"OK transient_context capped at {len(cleaned)} × ≤240 chars")

        # 6. /cabinet/start back-compat (no body at all → still works)
        r = await h.post("/api/cabinet/start", headers=headers)
        assert r.status_code in (200, 201)
        print("OK /cabinet/start back-compat without JSON body")

    await _cleanup(db, user_id)
    print("\n=== ALL HYBRID-MEMORY TESTS PASSED ===")


if __name__ == "__main__":
    asyncio.run(main())
