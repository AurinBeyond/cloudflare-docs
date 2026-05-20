import os, asyncio, json
from datetime import datetime, timezone, timedelta
from motor.motor_asyncio import AsyncIOMotorClient

MONGO_URL = os.environ.get("MONGO_URL", "mongodb://localhost:27017")
DB_NAME = os.environ.get("DB_NAME", "test_database")

async def main():
    client = AsyncIOMotorClient(MONGO_URL)
    db = client[DB_NAME]

    print("=" * 80)
    print(f"DB: {DB_NAME}   @  {MONGO_URL}")
    print(f"NOW(UTC): {datetime.now(timezone.utc).isoformat()}")
    print("=" * 80)

    # ---- 1. Kogu nimekiri kollektsioonidest ----
    cols = await db.list_collection_names()
    print(f"\n[COLLECTIONS] {sorted(cols)}\n")

    # ---- 2. credit_ledger eksistents + count ----
    if "credit_ledger" in cols:
        total = await db.credit_ledger.count_documents({})
        print(f"[credit_ledger.count_documents({{}})] = {total}")
        since = datetime.now(timezone.utc) - timedelta(hours=24)
        # arvestame nii naive kui aware
        q24 = {"$or": [{"occurred_at": {"$gte": since}}, {"occurred_at": {"$gte": since.replace(tzinfo=None)}}]}
        c24 = await db.credit_ledger.count_documents(q24)
        print(f"[credit_ledger.count(last 24h)] = {c24}")

        # Summa delta < 0 (kulutatud krediidid 24h)
        agg = [
            {"$match": q24},
            {"$group": {
                "_id": None,
                "sum_neg": {"$sum": {"$cond": [{"$lt": ["$delta", 0]}, "$delta", 0]}},
                "sum_pos": {"$sum": {"$cond": [{"$gt": ["$delta", 0]}, "$delta", 0]}},
                "n": {"$sum": 1},
            }},
        ]
        async for d in db.credit_ledger.aggregate(agg):
            d.pop("_id", None)
            print(f"[credit_ledger.aggregate(24h totals)] = {d}")

        # Põhjuste jaotus 24h
        agg2 = [
            {"$match": q24},
            {"$group": {"_id": "$reason", "n": {"$sum": 1}, "delta_sum": {"$sum": "$delta"}}},
            {"$sort": {"n": -1}},
        ]
        print("\n[credit_ledger.aggregate(reasons, 24h)]")
        async for d in db.credit_ledger.aggregate(agg2):
            print(f"   reason={d['_id']!r:30}  n={d['n']:<5}  delta_sum={d['delta_sum']}")

        # Viimased 5 transaktsiooni
        print("\n[credit_ledger.find().sort(occurred_at:-1).limit(5)]")
        async for d in db.credit_ledger.find({}, {"_id": 0}).sort("occurred_at", -1).limit(5):
            print("   ", json.dumps(d, default=str))
    else:
        print("[credit_ledger] COLLECTION DOES NOT EXIST IN THIS DB")

    # ---- 3. voice_sessions: aktiivsed kummitused ----
    if "voice_sessions" in cols:
        total_vs = await db.voice_sessions.count_documents({})
        open_vs = await db.voice_sessions.count_documents({"closed": {"$ne": True}})
        print(f"\n[voice_sessions.count({{}})] = {total_vs}")
        print(f"[voice_sessions.count(closed != true)] = {open_vs}")

        # Need, mis on avatud kauem kui 5 min — potentsiaalsed kummitussessioonid
        cutoff = datetime.now(timezone.utc) - timedelta(minutes=5)
        ghost_q = {"closed": {"$ne": True}, "$or": [
            {"started_at": {"$lt": cutoff}},
            {"started_at": {"$lt": cutoff.replace(tzinfo=None)}},
        ]}
        ghosts = await db.voice_sessions.count_documents(ghost_q)
        print(f"[voice_sessions.count(open & started_at < now-5min)] = {ghosts}  (kummitussessioonid)")

        print("\n[voice_sessions.find(open).sort(started_at:-1).limit(5)]")
        async for d in db.voice_sessions.find({"closed": {"$ne": True}}, {"_id": 0}).sort("started_at", -1).limit(5):
            print("   ", json.dumps(d, default=str))
    else:
        print("[voice_sessions] COLLECTION DOES NOT EXIST IN THIS DB")

    # ---- 4. Users balance snapshot ----
    if "users" in cols:
        total_users = await db.users.count_documents({})
        with_credits = await db.users.count_documents({"presence_seconds_left": {"$gt": 0}})
        unlim = await db.users.count_documents({"unlimited_voice": True})
        agg_credits = [
            {"$group": {"_id": None, "total_seconds": {"$sum": "$presence_seconds_left"}}}
        ]
        async for d in db.users.aggregate(agg_credits):
            print(f"\n[users.count({{}})] = {total_users}")
            print(f"[users.count(presence_seconds_left > 0)] = {with_credits}")
            print(f"[users.count(unlimited_voice=True)] = {unlim}")
            print(f"[users.aggregate(sum presence_seconds_left)] = {d.get('total_seconds')}")

    client.close()

asyncio.run(main())
