"""§W-3 daily chat cap (iter 62).

Verifies:
1. /api/chat/usage returns ceiling=12 / tier='free' / used=0 for a fresh
   member with no Eternal Thread, no active pass.
2. After 12 body-room messages, usage shows used=12 / remaining=0.
3. The 13th message returns 429 with the calm hotline-of-the-room copy.
4. Cabinet + Body Room share the same counter.
5. Eternal Thread opt-in (save_threads=true) raises ceiling to 60.

Run:  python /app/backend/tests/test_chat_cap_iter62.py
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


async def _make_user(db, premium: bool = False) -> tuple[str, str]:
    user_id = uuid.uuid4().hex
    token = f"capt_{uuid.uuid4().hex}"
    await db.users.insert_one({
        "user_id": user_id,
        "email": f"{user_id[:8]}@cap.test",
        "role": "member",
        "created_at": datetime.now(timezone.utc),
    })
    await db.user_sessions.insert_one({
        "user_id": user_id,
        "session_token": token,
        "expires_at": datetime.now(timezone.utc) + timedelta(days=1),
        "created_at": datetime.now(timezone.utc),
    })
    if premium:
        await db.clarity_user_prefs.insert_one({
            "user_id": user_id,
            "save_threads": True,
        })
    return token, user_id


async def _cleanup(db, user_id: str, token: str):
    await db.users.delete_many({"user_id": user_id})
    await db.user_sessions.delete_many({"session_token": token})
    await db.clarity_user_prefs.delete_many({"user_id": user_id})
    await db.chat_usage_daily.delete_many({"user_id": user_id})
    await db.cabinet_sessions.delete_many({"user_id": user_id})


async def main():
    client = AsyncIOMotorClient(MONGO_URL)
    db = client[DB_NAME]

    # ---- 1. Free user · ceiling 12 -----------------------------------
    tok, uid = await _make_user(db, premium=False)
    H = {"Authorization": f"Bearer {tok}"}
    try:
        async with httpx.AsyncClient(base_url=API_BASE, timeout=60) as h:
            r = await h.get("/api/chat/usage", headers=H)
            assert r.status_code == 200, r.text
            data = r.json()
            assert data["ceiling"] == 12, data
            assert data["used"] == 0, data
            assert data["tier"] == "free", data
            print(f"OK free baseline: {data}")

            # 2. Burn 12 body-room messages.
            codes = []
            for i in range(12):
                rr = await h.post(
                    "/api/body-room/chat",
                    headers=H,
                    json={"message": f"hi {i}", "history": []},
                )
                codes.append(rr.status_code)
            assert all(c == 200 for c in codes), codes
            print("OK 12 body-room messages accepted")

            # 3. The 13th must 429 with calm copy.
            rr = await h.post(
                "/api/body-room/chat",
                headers=H,
                json={"message": "one more", "history": []},
            )
            assert rr.status_code == 429, rr.status_code
            detail = rr.json().get("detail", "")
            assert "quiet limit" in detail.lower(), detail
            assert "eternal thread" in detail.lower(), detail
            print(f"OK 13th capped: {detail[:60]}…")

            # 4. /api/chat/usage now reflects 13 used (count went up
            #    even on the rejected turn — that's the intended ceiling
            #    behaviour: increment first, then test).
            r = await h.get("/api/chat/usage", headers=H)
            data = r.json()
            assert data["used"] >= 12, data
            assert data["remaining"] == 0, data
            print(f"OK usage final: {data}")
    finally:
        await _cleanup(db, uid, tok)

    # ---- 5. Premium (Eternal Thread on) · ceiling 60 -----------------
    tok, uid = await _make_user(db, premium=True)
    H = {"Authorization": f"Bearer {tok}"}
    try:
        async with httpx.AsyncClient(base_url=API_BASE, timeout=60) as h:
            r = await h.get("/api/chat/usage", headers=H)
            data = r.json()
            assert data["ceiling"] == 60, data
            assert data["tier"] == "premium", data
            print(f"OK premium ceiling: {data}")
    finally:
        await _cleanup(db, uid, tok)

    # ---- 6. Cabinet + Body Room share the same counter --------------
    tok, uid = await _make_user(db, premium=False)
    H = {"Authorization": f"Bearer {tok}"}
    try:
        async with httpx.AsyncClient(base_url=API_BASE, timeout=60) as h:
            # 6 body-room turns
            for i in range(6):
                rr = await h.post(
                    "/api/body-room/chat",
                    headers=H,
                    json={"message": f"a{i}", "history": []},
                )
                assert rr.status_code == 200, rr.text
            # 6 cabinet turns — should also count, total = 12
            await h.post("/api/cabinet/start", headers=H, json={})
            for i in range(6):
                rr = await h.post(
                    "/api/cabinet/message",
                    headers=H,
                    json={"text": f"hello {i}"},
                )
                assert rr.status_code == 200, rr.text
            r = await h.get("/api/chat/usage", headers=H)
            data = r.json()
            assert data["used"] == 12, data
            print(f"OK shared counter cabinet+body: used={data['used']}")
            # 13th in either room → 429
            rr = await h.post(
                "/api/cabinet/message", headers=H, json={"text": "again"}
            )
            assert rr.status_code == 429, rr.status_code
            print("OK shared cap enforced across rooms")
    finally:
        await _cleanup(db, uid, tok)

    print()
    print("=== ALL CHAT-CAP TESTS PASSED ===")


if __name__ == "__main__":
    asyncio.run(main())
