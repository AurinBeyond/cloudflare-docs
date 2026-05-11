"""Iteration 23 — Clarity Release.

Coverage:
  1. AES-256-GCM encrypt/decrypt roundtrip and tamper detection.
  2. /api/clarity/passes  — public, returns 3 tiers + Beta note.
  3. /api/clarity/health  — public, encryption_configured = True.
  4. /api/clarity/access  — 401 unauth · 200 default for fresh user.
  5. /api/cabinet/message stores user text encrypted (not plaintext) —
     verify the raw Mongo doc has no plaintext fragment.
  6. /api/cabinet/me decrypts user messages back into the `text` field.
  7. A granted 30-min pass binds to the next /clarity/start session AND
     suppresses show_continuation for paid users.
  8. Admin-only dispute unlock returns decrypted messages and writes an
     audit row to db.clarity_dispute_unlocks.

Same synthetic-Mongo session pattern as test_iteration14.py.
"""
import os
import sys
import uuid
import base64
from datetime import datetime, timezone, timedelta

import pytest
import requests
from pymongo import MongoClient

# Allow importing the crypto helper directly for the unit roundtrip.
sys.path.insert(0, "/app/backend")
# Load backend .env so CLARITY_ENCRYPTION_KEY is available to the
# imported helper (the live FastAPI process loads it via load_dotenv).
try:
    with open("/app/backend/.env") as _envf:
        for _ln in _envf:
            if _ln.startswith("CLARITY_ENCRYPTION_KEY=") and "CLARITY_ENCRYPTION_KEY" not in os.environ:
                os.environ["CLARITY_ENCRYPTION_KEY"] = _ln.split("=", 1)[1].strip().strip('"')
except FileNotFoundError:
    pass
from clarity_crypto import encrypt_text, decrypt_text, is_configured  # noqa: E402

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "").rstrip("/")
if not BASE_URL:
    with open("/app/frontend/.env") as f:
        for line in f:
            if line.startswith("REACT_APP_BACKEND_URL="):
                BASE_URL = line.split("=", 1)[1].strip().rstrip("/")
                break

MONGO_URL = os.environ.get("MONGO_URL", "mongodb://localhost:27017")
DB_NAME = os.environ.get("DB_NAME", "test_database")
if "MONGO_URL" not in os.environ or "DB_NAME" not in os.environ:
    try:
        with open("/app/backend/.env") as f:
            for line in f:
                if line.startswith("MONGO_URL=") and "MONGO_URL" not in os.environ:
                    MONGO_URL = line.split("=", 1)[1].strip().strip('"')
                if line.startswith("DB_NAME=") and "DB_NAME" not in os.environ:
                    DB_NAME = line.split("=", 1)[1].strip().strip('"')
    except FileNotFoundError:
        pass


@pytest.fixture(scope="module")
def mongo_db():
    client = MongoClient(MONGO_URL)
    db = client[DB_NAME]
    yield db
    client.close()


def _make_user(mongo_db, role: str = "member"):
    user_id = f"test-it23-{uuid.uuid4().hex[:8]}"
    token = f"test_session_it23_{uuid.uuid4().hex}"
    mongo_db.users.insert_one({
        "user_id": user_id,
        "email": f"{user_id}@example.com",
        "name": "Iter23 User",
        "picture": "https://via.placeholder.com/150",
        "role": role,
        "created_at": datetime.now(timezone.utc),
    })
    mongo_db.user_sessions.insert_one({
        "user_id": user_id,
        "session_token": token,
        "expires_at": datetime.now(timezone.utc) + timedelta(days=7),
        "created_at": datetime.now(timezone.utc),
    })
    return token, user_id


def _cleanup_user(mongo_db, user_id, token):
    mongo_db.users.delete_many({"user_id": user_id})
    mongo_db.user_sessions.delete_many({"session_token": token})
    mongo_db.cabinet_sessions.delete_many({"user_id": user_id})
    mongo_db.clarity_passes.delete_many({"user_id": user_id})


@pytest.fixture
def member(mongo_db):
    token, user_id = _make_user(mongo_db, role="member")
    yield (token, user_id)
    _cleanup_user(mongo_db, user_id, token)


@pytest.fixture
def admin(mongo_db):
    token, user_id = _make_user(mongo_db, role="admin")
    yield (token, user_id)
    _cleanup_user(mongo_db, user_id, token)


def _h(token):
    return {"Authorization": f"Bearer {token}"}


# ---------- 1. AES-256-GCM roundtrip + tamper ----------

def test_crypto_roundtrip():
    assert is_configured()
    plaintext = "I have been carrying this for too long."
    ct = encrypt_text(plaintext)
    assert ct and ct != plaintext
    # base64-shaped
    assert base64.b64decode(ct.encode("ascii"))
    assert decrypt_text(ct) == plaintext


def test_crypto_tamper_detected():
    ct = encrypt_text("secret words")
    raw = bytearray(base64.b64decode(ct.encode("ascii")))
    # flip a byte in the ciphertext body
    raw[-1] ^= 0xFF
    bad = base64.b64encode(bytes(raw)).decode("ascii")
    with pytest.raises(Exception):
        decrypt_text(bad)


# ---------- 2. /clarity/passes (public) ----------

def test_passes_endpoint_public():
    r = requests.get(f"{BASE_URL}/api/clarity/passes", timeout=10)
    assert r.status_code == 200
    body = r.json()
    tiers = [p["tier"] for p in body["passes"]]
    assert tiers == ["30min", "60min", "season_30days"]
    assert body["beta"] is True
    assert "Beta" in body["beta_note"]
    # Iter32: Buy buttons activated — all 3 variant IDs populated.
    assert all(p["checkout_ready"] is True for p in body["passes"])
    assert all(p.get("lemonsqueezy_variant_id") for p in body["passes"])


# ---------- 3. /clarity/health ----------

def test_health_encryption_configured():
    r = requests.get(f"{BASE_URL}/api/clarity/health", timeout=10)
    assert r.status_code == 200
    body = r.json()
    assert body["encryption_configured"] is True
    assert "30min" in body["tiers"]


# ---------- 4. /clarity/access ----------

def test_access_unauth_returns_401():
    r = requests.get(f"{BASE_URL}/api/clarity/access", timeout=10)
    assert r.status_code == 401


def test_access_default_no_pass(member):
    token, _ = member
    r = requests.get(f"{BASE_URL}/api/clarity/access", headers=_h(token), timeout=10)
    assert r.status_code == 200
    body = r.json()
    assert body["has_active_pass"] is False
    assert body["seconds_remaining"] == 0
    assert body["free_replies"] == 3


# ---------- 5. /cabinet/message encrypts user text at rest ----------

def test_user_message_encrypted_in_db(member, mongo_db):
    token, user_id = member
    requests.post(f"{BASE_URL}/api/cabinet/start", headers=_h(token), timeout=10)
    secret = "this exact phrase should never appear in the dump"
    r = requests.post(
        f"{BASE_URL}/api/cabinet/message",
        headers=_h(token),
        json={"text": secret},
        timeout=10,
    )
    assert r.status_code == 200, r.text
    sess = mongo_db.cabinet_sessions.find_one({"user_id": user_id})
    assert sess is not None
    user_msgs = [m for m in sess.get("messages", []) if m.get("role") == "user"]
    assert user_msgs, "no user message persisted"
    raw = user_msgs[0]
    # Plaintext must be empty in DB; ciphertext must exist; secret must
    # NOT appear anywhere in the persisted document.
    assert raw.get("text") in ("", None), f"plaintext leaked: {raw.get('text')!r}"
    assert raw.get("text_enc")
    assert secret not in str(sess), "plaintext leaked into Mongo doc"


# ---------- 6. /cabinet/me decrypts user messages back ----------

def test_cabinet_me_decrypts_user_messages(member):
    token, _ = member
    requests.post(f"{BASE_URL}/api/cabinet/start", headers=_h(token), timeout=10)
    plain = "the room must hand this back to me decrypted"
    requests.post(
        f"{BASE_URL}/api/cabinet/message",
        headers=_h(token),
        json={"text": plain},
        timeout=10,
    )
    me = requests.get(f"{BASE_URL}/api/cabinet/me", headers=_h(token), timeout=10)
    assert me.status_code == 200
    msgs = me.json()["session"]["messages"]
    user_texts = [m["text"] for m in msgs if m["role"] == "user"]
    assert plain in user_texts


# ---------- 7. Granted 30-min pass binds to /clarity/start + suppresses gate ----------

def test_paid_pass_suppresses_continuation(member, mongo_db):
    token, user_id = member
    # Drop a 30-min pass directly so we don't depend on LemonSqueezy.
    mongo_db.clarity_passes.insert_one({
        "id": str(uuid.uuid4()),
        "user_id": user_id,
        "tier": "30min",
        "source": "manual_grant",
        "external_order_id": None,
        "granted_at": datetime.now(timezone.utc).isoformat(),
        # placeholder expiry — /clarity/start should rewrite to now+30min
        "expires_at": (datetime.now(timezone.utc) + timedelta(days=365)).isoformat(),
        "consumed": False,
    })
    # Access reflects the queued pass.
    acc = requests.get(f"{BASE_URL}/api/clarity/access", headers=_h(token), timeout=10).json()
    assert acc["has_active_pass"] is True
    assert acc["tier"] == "30min"

    # Start binds the pass to the session.
    s = requests.post(f"{BASE_URL}/api/clarity/start", headers=_h(token), timeout=10).json()
    assert s["tier"] == "30min"
    # ~30 minutes left, allow drift.
    assert 1700 <= s["seconds_remaining"] <= 1800

    # Send 4 messages — never trigger show_continuation for a paid user.
    for i in range(4):
        r = requests.post(
            f"{BASE_URL}/api/cabinet/message",
            headers=_h(token),
            json={"text": f"reflection number {i}"},
            timeout=10,
        )
        assert r.status_code == 200
        body = r.json()
        assert body["show_continuation"] is False, f"paid user gated at msg {i}"

    # Pass is now consumed.
    p = mongo_db.clarity_passes.find_one({"user_id": user_id, "tier": "30min"})
    assert p["consumed"] is True


# ---------- 8. Dispute unlock requires admin + writes audit row ----------

def test_dispute_unlock_admin_only(member, admin, mongo_db):
    member_token, member_user = member
    admin_token, admin_user = admin

    # Member writes a session.
    requests.post(f"{BASE_URL}/api/cabinet/start", headers=_h(member_token), timeout=10)
    requests.post(
        f"{BASE_URL}/api/cabinet/message",
        headers=_h(member_token),
        json={"text": "encrypted truth at rest"},
        timeout=10,
    )
    sess = mongo_db.cabinet_sessions.find_one({"user_id": member_user})
    sid = sess["id"]

    # A regular member CANNOT unlock — 403.
    r_forbidden = requests.post(
        f"{BASE_URL}/api/clarity/admin/dispute-unlock/{sid}",
        headers=_h(member_token),
        json={"reason": "i want to see"},
        timeout=10,
    )
    assert r_forbidden.status_code == 403

    # Admin can.
    r_ok = requests.post(
        f"{BASE_URL}/api/clarity/admin/dispute-unlock/{sid}",
        headers=_h(admin_token),
        json={"reason": "dispute #42 raised by member"},
        timeout=10,
    )
    assert r_ok.status_code == 200, r_ok.text
    body = r_ok.json()
    assert body["session_id"] == sid
    user_texts = [m["text"] for m in body["messages"] if m["role"] == "user"]
    assert "encrypted truth at rest" in user_texts

    # Audit row written.
    log = mongo_db.clarity_dispute_unlocks.find_one(
        {"session_id": sid, "admin_user_id": admin_user}
    )
    assert log is not None
    assert "dispute #42" in log["reason"]

    # Audit log endpoint sees it.
    r_log = requests.get(
        f"{BASE_URL}/api/clarity/admin/unlock-log",
        headers=_h(admin_token),
        timeout=10,
    )
    assert r_log.status_code == 200
    sids = [u["session_id"] for u in r_log.json()["unlocks"]]
    assert sid in sids

    # Cleanup audit so other runs stay quiet.
    mongo_db.clarity_dispute_unlocks.delete_many({"session_id": sid})
