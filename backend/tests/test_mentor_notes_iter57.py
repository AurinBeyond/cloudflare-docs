"""Integration test for §G2-extended cross-session memory (iter 57) —
mentor's notes / cabinet_user_summaries pipeline.

Verifies:
- save_threads pref defaults to True for new prefs docs
- POST /api/clarity/prefs accepts save_threads
- /cabinet/clear fires a background summary task
- After session #1 closes (≥2 user turns), a row appears in
  cabinet_user_summaries within ~6s
- Session #2's reply receives the prior_summaries via system prompt
  (we cannot inspect Claude's system prompt directly, but we verify
  the row exists + the API does not regress)

Run:  python /app/backend/tests/test_mentor_notes_iter57.py"""
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
    email = f"notes+{user_id[:6]}@aurin.local"
    session_token = uuid.uuid4().hex
    await db.users.insert_one({
        "user_id": user_id,
        "email": email,
        "name": "Notes Test",
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
    # Default prefs row so /clarity/prefs returns save_threads=True path
    # *and* the threshold gate is bypassed.
    await db.clarity_user_prefs.insert_one({
        "user_id": user_id,
        "consent_v2_at": datetime.now(timezone.utc).isoformat(),
    })
    return user_id, session_token


async def _cleanup(db, user_id: str) -> None:
    await db.users.delete_many({"user_id": user_id})
    await db.user_sessions.delete_many({"user_id": user_id})
    await db.cabinet_sessions.delete_many({"user_id": user_id})
    await db.clarity_passes.delete_many({"user_id": user_id})
    await db.clarity_user_prefs.delete_many({"user_id": user_id})
    await db.cabinet_user_summaries.delete_many({"user_id": user_id})


async def main() -> None:
    client = AsyncIOMotorClient(MONGO_URL)
    db = client[DB_NAME]
    user_id, token = await _make_user(db)
    headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}

    async with httpx.AsyncClient(base_url=API_BASE, timeout=60) as h:
        # 1. /clarity/prefs surfaces save_threads default = True
        r = await h.get("/api/clarity/prefs", headers=headers)
        assert r.status_code == 200, r.text
        assert r.json()["save_threads"] is True, r.json()
        print("OK save_threads default True")

        # 2. POST /clarity/prefs save_threads=false then true
        r = await h.post(
            "/api/clarity/prefs",
            headers=headers,
            json={"save_threads": False},
        )
        assert r.status_code == 200, r.text
        assert r.json()["save_threads"] is False
        r = await h.post(
            "/api/clarity/prefs",
            headers=headers,
            json={"save_threads": True},
        )
        assert r.status_code == 200
        assert r.json()["save_threads"] is True
        print("OK save_threads toggle")

        # 3. Open + 2 user turns + clear → expect summary to appear
        r = await h.post("/api/clarity/start", headers=headers)
        assert r.status_code in (200, 201), r.text
        for msg in [
            "I keep carrying a story that was given to me. I want to set it down.",
            "Tonight my chest feels heavy. Like I've been holding a sentence too long.",
        ]:
            r = await h.post(
                "/api/cabinet/message",
                headers=headers,
                json={"text": msg, "keep_thread": True},
            )
            assert r.status_code == 200, r.text
        # Close → triggers fire-and-forget summary
        r = await h.post("/api/cabinet/clear", headers=headers)
        assert r.status_code == 200
        print("OK 2-turn session closed")

        # 4. Wait for the background summary task. Up to ~30s — Claude
        #    may take several seconds.
        summary_doc = None
        for _ in range(30):
            await asyncio.sleep(1)
            summary_doc = await db.cabinet_user_summaries.find_one(
                {"user_id": user_id},
                {"_id": 0},
            )
            if summary_doc and summary_doc.get("summary_text"):
                break
        assert summary_doc, "Expected a cabinet_user_summaries row within 30s"
        text = summary_doc.get("summary_text") or ""
        assert len(text) >= 80, f"summary too short: {len(text)} chars"
        # Forbidden vocab guard
        forbidden = ["diagnosis", "disorder", "therapy", "manifestation"]
        for word in forbidden:
            assert word.lower() not in text.lower(), f"forbidden vocab '{word}' in summary"
        print(f"OK summary saved · {len(text)} chars · turns={summary_doc.get('user_turn_count')}")

        # 5. Session with <2 user turns must NOT produce a summary
        await db.cabinet_user_summaries.delete_many({"user_id": user_id})
        r = await h.post("/api/clarity/start", headers=headers)
        assert r.status_code in (200, 201)
        r = await h.post(
            "/api/cabinet/message",
            headers=headers,
            json={"text": "Just one short sentence.", "keep_thread": True},
        )
        assert r.status_code == 200
        r = await h.post("/api/cabinet/clear", headers=headers)
        assert r.status_code == 200
        await asyncio.sleep(8)
        check = await db.cabinet_user_summaries.find_one({"user_id": user_id})
        assert check is None, "1-turn session should NOT produce a summary"
        print("OK 1-turn session skipped (no summary)")

        # 6. With save_threads=False, even ≥2 turns must NOT produce a summary
        r = await h.post(
            "/api/clarity/prefs",
            headers=headers,
            json={"save_threads": False},
        )
        assert r.status_code == 200
        r = await h.post("/api/clarity/start", headers=headers)
        assert r.status_code in (200, 201)
        for msg in ["First note tonight.", "Second note tonight."]:
            r = await h.post(
                "/api/cabinet/message",
                headers=headers,
                json={"text": msg, "keep_thread": False},
            )
            assert r.status_code == 200
        r = await h.post("/api/cabinet/clear", headers=headers)
        assert r.status_code == 200
        await asyncio.sleep(8)
        check = await db.cabinet_user_summaries.find_one({"user_id": user_id})
        assert check is None, "save_threads=False should suppress summary"
        print("OK save_threads=False suppresses summary")

    await _cleanup(db, user_id)
    print("\n=== ALL MENTOR-NOTES TESTS PASSED ===")


if __name__ == "__main__":
    asyncio.run(main())
