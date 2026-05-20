"""Verify ElevenLabs hard-lock: zero-balance user MUST be denied at /presence/start.
Strategy: bypass auth by inserting a user + session token directly, then call the endpoint.
"""
import os, asyncio, json, uuid, sys
from datetime import datetime, timezone, timedelta
import httpx

sys.path.insert(0, "/app/backend")
from motor.motor_asyncio import AsyncIOMotorClient

MONGO_URL = os.environ.get("MONGO_URL", "mongodb://localhost:27017")
DB_NAME = os.environ.get("DB_NAME", "test_database")

async def main():
    client = AsyncIOMotorClient(MONGO_URL)
    db = client[DB_NAME]

    uid = f"lock_test_{uuid.uuid4().hex[:8]}"
    email = f"{uid}@lock.test"
    token = uuid.uuid4().hex

    await db.users.insert_one({
        "user_id": uid, "email": email, "role": "member",
        "presence_seconds_left": 0, "unlimited_voice": False,
        "created_at": datetime.now(timezone.utc).isoformat(),
    })
    await db.user_sessions.insert_one({
        "id": str(uuid.uuid4()),
        "session_token": token,
        "user_id": uid,
        "expires_at": (datetime.now(timezone.utc) + timedelta(hours=1)).isoformat(),
        "created_at": datetime.now(timezone.utc).isoformat(),
    })

    base = "http://localhost:8001"
    headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}

    # ----- TEST 1: text mode → must always succeed (skipped) -----
    r = httpx.post(f"{base}/api/presence/start",
                   headers=headers,
                   json={"room": "clarity", "mode": "text"},
                   timeout=10)
    print(f"[TEST 1: text mode, balance=0] HTTP {r.status_code}  body={r.text[:200]}")
    assert r.status_code == 200, "Text mode must always pass"
    assert r.json().get("skipped") == "text_mode"
    print("  ✅ PASS — text mode bypassed billing")

    # ----- TEST 2: voice mode, balance=0 → must be DENIED 402 -----
    r = httpx.post(f"{base}/api/presence/start",
                   headers=headers,
                   json={"room": "clarity", "mode": "voice"},
                   timeout=10)
    print(f"\n[TEST 2: voice mode, balance=0] HTTP {r.status_code}  body={r.text[:300]}")
    assert r.status_code == 402, f"Hard-lock MUST deny, got {r.status_code}"
    body = r.json()
    assert body["detail"]["code"] == "no_presence_balance"
    print("  ✅ PASS — voice session BLOCKED with 402 no_presence_balance")

    # ----- TEST 3: top up balance → voice must now succeed -----
    await db.users.update_one(
        {"user_id": uid},
        {"$set": {"presence_seconds_left": 60}},
    )
    r = httpx.post(f"{base}/api/presence/start",
                   headers=headers,
                   json={"room": "clarity", "mode": "voice"},
                   timeout=10)
    print(f"\n[TEST 3: voice mode, balance=60s] HTTP {r.status_code}  body={r.text[:300]}")
    assert r.status_code == 200, f"With balance, must allow, got {r.status_code}"
    sid = r.json().get("session_id")
    print(f"  ✅ PASS — voice session opened id={sid}")

    # ----- TEST 4: unlimited_voice + balance=0 → must succeed -----
    await db.users.update_one(
        {"user_id": uid},
        {"$set": {"presence_seconds_left": 0, "unlimited_voice": True}},
    )
    # Close prior session first to avoid orphan reaper
    if sid:
        await db.voice_sessions.update_one({"id": sid}, {"$set": {"closed": True}})
    r = httpx.post(f"{base}/api/presence/start",
                   headers=headers,
                   json={"room": "clarity", "mode": "voice"},
                   timeout=10)
    print(f"\n[TEST 4: unlimited + balance=0] HTTP {r.status_code}  body={r.text[:200]}")
    assert r.status_code == 200, f"Unlimited must always allow, got {r.status_code}"
    print("  ✅ PASS — unlimited user bypassed hard-lock")

    # ----- TEST 5: check funnel_events has the block event -----
    n_blocked = await db.funnel_events.count_documents({
        "event": "voice_session_blocked_no_balance",
        "user_id": uid,
    })
    print(f"\n[TEST 5: funnel_events.voice_session_blocked_no_balance] = {n_blocked}")
    assert n_blocked >= 1, "Block telemetry must be written"
    print("  ✅ PASS — block telemetry written")

    # Cleanup
    await db.users.delete_one({"user_id": uid})
    await db.user_sessions.delete_many({"user_id": uid})
    await db.voice_sessions.delete_many({"user_id": uid})
    await db.funnel_events.delete_many({"user_id": uid})
    await db.credit_ledger.delete_many({"user_id": uid})
    print("\n[cleanup] complete")
    print("\n🎯 ALL 5 HARD-LOCK TESTS PASSED")
    client.close()

asyncio.run(main())
