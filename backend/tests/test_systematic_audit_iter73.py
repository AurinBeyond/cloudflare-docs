"""ITER 73 — SYSTEMATIC AUDIT
Comprehensive end-to-end backend audit covering:
- Health, auth gate, magic-link
- Telemetry whitelist + crash beacon
- Admin audit endpoints (crashes, ledger-diff)
- Presence hard-lock (zero balance, text mode, unlimited, with balance)
- Content endpoints (books, six-nights, membership tiers, clarity passes)
- Clarity convai signed-url 402 hard-lock
"""
import os, asyncio, uuid, sys, json
from datetime import datetime, timezone, timedelta
import httpx
import pytest

sys.path.insert(0, "/app/backend")
from motor.motor_asyncio import AsyncIOMotorClient

MONGO_URL = os.environ.get("MONGO_URL", "mongodb://localhost:27017")
DB_NAME = os.environ.get("DB_NAME", "test_database")
ADMIN_TOKEN = os.environ.get("ADMIN_TOKEN", "5NebFHBpdy-PxqpbHyUhSvQFYjxp5d06xS1aSQGu9Kc")

# Use INTERNAL backend (kubernetes ingress strips /api on external; localhost is reliable)
BASE_INTERNAL = "http://localhost:8001"

# Public URL for verifying the ingress path also responds (the user-facing surface)
with open("/app/frontend/.env") as f:
    for line in f:
        if line.startswith("REACT_APP_BACKEND_URL"):
            BASE_PUBLIC = line.split("=", 1)[1].strip()
            break

print(f"BASE_INTERNAL={BASE_INTERNAL}")
print(f"BASE_PUBLIC={BASE_PUBLIC}")


# ─── DB helpers ─────────────────────────────────────────────────────
async def mk_user(presence_seconds_left=0, unlimited_voice=False):
    client = AsyncIOMotorClient(MONGO_URL)
    db = client[DB_NAME]
    uid = f"audit73_{uuid.uuid4().hex[:8]}"
    email = f"{uid}@audit.test"
    token = uuid.uuid4().hex
    await db.users.insert_one({
        "user_id": uid, "email": email, "role": "member",
        "presence_seconds_left": presence_seconds_left,
        "unlimited_voice": unlimited_voice,
        "created_at": datetime.now(timezone.utc).isoformat(),
    })
    await db.user_sessions.insert_one({
        "id": str(uuid.uuid4()),
        "session_token": token,
        "user_id": uid,
        "expires_at": (datetime.now(timezone.utc) + timedelta(hours=1)).isoformat(),
        "created_at": datetime.now(timezone.utc).isoformat(),
    })
    return uid, email, token, client, db

async def cleanup(client, db, uid):
    await db.users.delete_one({"user_id": uid})
    await db.user_sessions.delete_many({"user_id": uid})
    await db.voice_sessions.delete_many({"user_id": uid})
    await db.funnel_events.delete_many({"user_id": uid})
    await db.credit_ledger.delete_many({"user_id": uid})
    client.close()


# ─── 1. Health ──────────────────────────────────────────────────────
def test_health():
    r = httpx.get(f"{BASE_INTERNAL}/api/health", timeout=10)
    assert r.status_code == 200, f"got {r.status_code}: {r.text[:200]}"
    body = r.json()
    assert body.get("status") in ("ok", "healthy") or body.get("ok") is True, body

def test_health_public_ingress():
    """Verify public ingress path responds (browser surface)."""
    r = httpx.get(f"{BASE_PUBLIC}/api/health", timeout=15, follow_redirects=True)
    assert r.status_code == 200, f"public ingress broken: {r.status_code} {r.text[:200]}"


# ─── 2. Auth gate ───────────────────────────────────────────────────
def test_auth_me_unauth_returns_401():
    r = httpx.get(f"{BASE_INTERNAL}/api/auth/me", timeout=10)
    assert r.status_code == 401, f"expected 401, got {r.status_code}: {r.text[:200]}"


# ─── 3. Magic-link request ──────────────────────────────────────────
def test_magic_link_request_returns_200():
    r = httpx.post(
        f"{BASE_INTERNAL}/api/auth/magic-link/request",
        json={"email": "test_audit73@audit.test"},
        timeout=15,
    )
    assert r.status_code == 200, f"magic-link req failed: {r.status_code} {r.text[:300]}"
    body = r.json()
    assert body.get("delivered_via") in ("resend", "skipped", "console", "log", "email"), f"unexpected: {body}"


# ─── 4. Telemetry whitelist ─────────────────────────────────────────
WHITELISTED_EVENTS = [
    "cabinet_paywall_view",
    "cabinet_paywall_cta",
    "tier_cta_click",
    "tier_support_click",
    "waitlist_join_submit",
    "portal_magic_link_request",
    "voice_session_blocked_no_balance",
]

@pytest.mark.parametrize("evt", WHITELISTED_EVENTS)
def test_telemetry_whitelisted_event(evt):
    r = httpx.post(
        f"{BASE_INTERNAL}/api/telemetry/event",
        json={"event_type": evt, "meta": {"source": "iter73_audit"}},
        timeout=10,
    )
    assert r.status_code == 200, f"event {evt}: HTTP {r.status_code} body={r.text[:300]}"

def test_telemetry_unknown_event_rejected():
    r = httpx.post(
        f"{BASE_INTERNAL}/api/telemetry/event",
        json={"event_type": "definitely_not_whitelisted_xyz", "meta": {}},
        timeout=10,
    )
    # Per spec, expected 400.
    assert r.status_code in (400, 422), f"got {r.status_code}: {r.text[:200]}"


# ─── 5. Crash telemetry ─────────────────────────────────────────────
def test_telemetry_crash_beacon():
    r = httpx.post(
        f"{BASE_INTERNAL}/api/telemetry/crash",
        json={
            "component": "TestComponent",
            "message": "Test crash from iter73 audit",
            "stack": "fake stack trace",
            "url": "/test",
        },
        timeout=10,
    )
    assert r.status_code == 200, f"crash beacon failed: {r.status_code} {r.text[:300]}"


# ─── 6. Admin: crashes endpoint ─────────────────────────────────────
def test_admin_crashes_with_token():
    r = httpx.get(
        f"{BASE_INTERNAL}/api/admin/audit/crashes",
        headers={"X-Admin-Token": ADMIN_TOKEN},
        timeout=10,
    )
    assert r.status_code == 200, f"crashes admin failed: {r.status_code} {r.text[:300]}"
    body = r.json()
    assert "rows" in body, f"missing rows[]: {body}"
    assert isinstance(body["rows"], list)

def test_admin_crashes_without_token_returns_401():
    r = httpx.get(f"{BASE_INTERNAL}/api/admin/audit/crashes", timeout=10)
    assert r.status_code in (401, 403), f"expected 401/403, got {r.status_code}"


# ─── 7. Admin: ledger-diff endpoint ─────────────────────────────────
def test_admin_ledger_diff():
    r = httpx.get(
        f"{BASE_INTERNAL}/api/admin/audit/ledger-diff",
        params={"email": "test_audit73@audit.test", "hours": 24},
        headers={"X-Admin-Token": ADMIN_TOKEN},
        timeout=15,
    )
    assert r.status_code in (200, 404), f"ledger-diff: {r.status_code} {r.text[:300]}"
    if r.status_code == 200:
        body = r.json()
        # Either drift_vs_ledger present, or user-not-found returned cleanly
        if "drift_vs_ledger" not in body and "error" not in body and "ok" not in body:
            print(f"⚠️  ledger-diff response missing drift_vs_ledger: {body}")


# ─── 8. Presence hard-lock ──────────────────────────────────────────
def test_presence_zero_balance_voice_returns_402():
    async def run():
        uid, email, token, client, db = await mk_user(presence_seconds_left=0, unlimited_voice=False)
        try:
            r = httpx.post(
                f"{BASE_INTERNAL}/api/presence/start",
                headers={"Authorization": f"Bearer {token}"},
                json={"room": "clarity", "mode": "voice"},
                timeout=10,
            )
            assert r.status_code == 402, f"hard-lock missing: {r.status_code} {r.text[:300]}"
            body = r.json()
            assert body["detail"]["code"] == "no_presence_balance", body
        finally:
            await cleanup(client, db, uid)
    asyncio.run(run())

def test_presence_text_mode_always_passes():
    async def run():
        uid, email, token, client, db = await mk_user(presence_seconds_left=0)
        try:
            r = httpx.post(
                f"{BASE_INTERNAL}/api/presence/start",
                headers={"Authorization": f"Bearer {token}"},
                json={"room": "clarity", "mode": "text"},
                timeout=10,
            )
            assert r.status_code == 200, f"text mode failed: {r.status_code} {r.text[:300]}"
        finally:
            await cleanup(client, db, uid)
    asyncio.run(run())

def test_presence_unlimited_user_passes():
    async def run():
        uid, email, token, client, db = await mk_user(presence_seconds_left=0, unlimited_voice=True)
        try:
            r = httpx.post(
                f"{BASE_INTERNAL}/api/presence/start",
                headers={"Authorization": f"Bearer {token}"},
                json={"room": "clarity", "mode": "voice"},
                timeout=10,
            )
            assert r.status_code == 200, f"unlimited failed: {r.status_code} {r.text[:300]}"
        finally:
            await cleanup(client, db, uid)
    asyncio.run(run())

def test_presence_with_balance_passes_returns_session_id():
    async def run():
        uid, email, token, client, db = await mk_user(presence_seconds_left=120)
        try:
            r = httpx.post(
                f"{BASE_INTERNAL}/api/presence/start",
                headers={"Authorization": f"Bearer {token}"},
                json={"room": "clarity", "mode": "voice"},
                timeout=10,
            )
            assert r.status_code == 200, f"voice with balance failed: {r.status_code} {r.text[:300]}"
            body = r.json()
            assert "session_id" in body, body
        finally:
            await cleanup(client, db, uid)
    asyncio.run(run())


# ─── 9. Content endpoints ───────────────────────────────────────────
def test_books_endpoint():
    r = httpx.get(f"{BASE_INTERNAL}/api/books", timeout=10)
    assert r.status_code == 200, f"books: {r.status_code} {r.text[:200]}"
    body = r.json()
    assert isinstance(body, list) or (isinstance(body, dict) and "items" in body), body

def test_six_nights_endpoint():
    # Try both slug variants
    for path in ("/api/six_nights", "/api/six-nights"):
        r = httpx.get(f"{BASE_INTERNAL}{path}", timeout=10)
        if r.status_code == 200:
            return
    pytest.fail(f"neither /api/six_nights nor /api/six-nights returned 200")

def test_membership_tiers_endpoint():
    r = httpx.get(f"{BASE_INTERNAL}/api/membership/tiers", timeout=10)
    assert r.status_code == 200, f"tiers: {r.status_code} {r.text[:200]}"
    body = r.json()
    tiers = body if isinstance(body, list) else body.get("tiers", [])
    assert len(tiers) >= 3, f"expected ≥3 tiers, got {len(tiers)}: {body}"
    names = [str(t.get("key") or t.get("label") or t.get("name") or "").lower() for t in tiers]
    for needle in ("transient", "voyager", "eternal"):
        assert any(needle in n for n in names), f"missing tier '{needle}' in {names}"

def test_clarity_passes_endpoint():
    r = httpx.get(f"{BASE_INTERNAL}/api/clarity/passes", timeout=10)
    assert r.status_code == 200, f"passes: {r.status_code} {r.text[:200]}"
    body = r.json()
    passes = body if isinstance(body, list) else body.get("passes", [])
    assert len(passes) >= 3, f"expected ≥3 passes, got {len(passes)}: {body}"


# ─── 10. Clarity convai signed-url hard-lock ────────────────────────
def test_clarity_signed_url_zero_balance_voice_returns_402():
    async def run():
        uid, email, token, client, db = await mk_user(presence_seconds_left=0, unlimited_voice=False)
        try:
            r = httpx.post(
                f"{BASE_INTERNAL}/api/clarity/convai/signed-url",
                headers={"Authorization": f"Bearer {token}"},
                json={"room": "clarity", "mode": "voice"},
                timeout=10,
            )
            # Should be 402; some impls might return 403/400.
            assert r.status_code == 402, (
                f"expected 402 hard-lock on signed-url for zero balance, got {r.status_code}: {r.text[:300]}"
            )
        finally:
            await cleanup(client, db, uid)
    asyncio.run(run())
