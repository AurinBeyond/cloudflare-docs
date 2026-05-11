"""Iteration 23 extras — tests not covered in test_iteration23.py:

  A. LemonSqueezy webhook with valid HMAC signs a season_30days pass row
     into db.clarity_passes (consumed=true, expires_at ~30d).
  B. /api/cabinet/library/the-night-angels-embrace/download returns 404
     (file intentionally missing on disk).
  C. Other 3 kids PDFs (engels-friends-2, angels-tales, angels-story)
     download successfully when a purchase row exists.
"""
import os
import json
import uuid
import hmac
import hashlib
from datetime import datetime, timezone, timedelta

import pytest
import requests
from pymongo import MongoClient


def _load_env(path="/app/backend/.env"):
    out = {}
    try:
        with open(path) as f:
            for ln in f:
                if "=" in ln and not ln.startswith("#"):
                    k, v = ln.split("=", 1)
                    out[k.strip()] = v.strip().strip('"')
    except FileNotFoundError:
        pass
    return out


_BENV = _load_env()
BASE_URL = (
    os.environ.get("REACT_APP_BACKEND_URL", "").rstrip("/")
    or open("/app/frontend/.env").read().split("REACT_APP_BACKEND_URL=", 1)[1].split("\n", 1)[0].strip().rstrip("/")
)
MONGO_URL = os.environ.get("MONGO_URL") or _BENV.get("MONGO_URL", "mongodb://localhost:27017")
DB_NAME = os.environ.get("DB_NAME") or _BENV.get("DB_NAME", "test_database")
WEBHOOK_SECRET = _BENV.get("LEMONSQUEEZY_WEBHOOK_SECRET", "Emake!123Hea")


@pytest.fixture(scope="module")
def mongo_db():
    c = MongoClient(MONGO_URL)
    yield c[DB_NAME]
    c.close()


def _make_user(mongo_db, role="member"):
    user_id = f"test-it23x-{uuid.uuid4().hex[:8]}"
    token = f"test_session_it23x_{uuid.uuid4().hex}"
    mongo_db.users.insert_one({
        "user_id": user_id,
        "email": f"{user_id}@example.com",
        "name": "Iter23x User",
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
    mongo_db.purchases.delete_many({"user_id": user_id})


@pytest.fixture
def member(mongo_db):
    token, uid = _make_user(mongo_db)
    yield (token, uid)
    _cleanup_user(mongo_db, uid, token)


def _h(t):
    return {"Authorization": f"Bearer {t}"}


def _sign(secret: str, body: bytes) -> str:
    return hmac.new(secret.encode(), body, hashlib.sha256).hexdigest()


# ---------- A. LemonSqueezy season_30days webhook ----------

def test_webhook_season_30days_grants_pass(mongo_db, member):
    _, user_id = member
    payload = {
        "meta": {
            "event_name": "order_created",
            "custom_data": {"user_id": user_id, "pass_tier": "season_30days"},
        },
        "data": {
            "id": f"order-{uuid.uuid4().hex[:10]}",
            "type": "orders",
            "attributes": {"status": "paid"},
        },
    }
    body = json.dumps(payload).encode("utf-8")
    sig = _sign(WEBHOOK_SECRET, body)
    r = requests.post(
        f"{BASE_URL}/api/lemonsqueezy/webhook",
        data=body,
        headers={
            "Content-Type": "application/json",
            "X-Signature": sig,
            "X-Event-Name": "order_created",
        },
        timeout=10,
    )
    assert r.status_code == 200, r.text

    row = mongo_db.clarity_passes.find_one({"user_id": user_id, "tier": "season_30days"})
    assert row is not None, "season_30days pass not granted"
    assert row.get("consumed") is True

    expires = row.get("expires_at")
    if isinstance(expires, str):
        # ISO string — parse
        from dateutil import parser as _p
        expires_dt = _p.isoparse(expires)
    else:
        expires_dt = expires
    delta = expires_dt - datetime.now(timezone.utc)
    assert timedelta(days=29) < delta < timedelta(days=31), f"expires_at off: delta={delta}"


# ---------- B. night-angels download stays 404 ----------

def test_night_angels_download_404(member, mongo_db):
    token, user_id = member
    # Even with a purchase row, file is missing → 404 (or 410/501 acceptable).
    mongo_db.purchases.insert_one({
        "id": str(uuid.uuid4()),
        "user_id": user_id,
        "book_slug": "the-night-angels-embrace",
        "source": "manual_grant",
        "created_at": datetime.now(timezone.utc).isoformat(),
    })
    r = requests.get(
        f"{BASE_URL}/api/cabinet/library/the-night-angels-embrace/download",
        headers=_h(token),
        timeout=10,
        allow_redirects=False,
    )
    assert r.status_code in (404, 410), f"expected 404, got {r.status_code} body={r.text[:200]}"


# ---------- C. Other 3 kids PDFs download OK after purchase ----------

@pytest.mark.parametrize("slug", ["engels-friends-2", "angels-tales", "angels-story"])
def test_other_kids_pdfs_download(member, mongo_db, slug):
    token, user_id = member
    mongo_db.purchases.insert_one({
        "id": str(uuid.uuid4()),
        "user_id": user_id,
        "book_slug": slug,
        "source": "manual_grant",
        "created_at": datetime.now(timezone.utc).isoformat(),
    })
    r = requests.get(
        f"{BASE_URL}/api/cabinet/library/{slug}/download",
        headers=_h(token),
        timeout=10,
        allow_redirects=False,
    )
    # Allow 200 (direct stream) OR 302/307 (redirect to signed URL) OR 200 with PDF body
    assert r.status_code in (200, 302, 307), f"{slug} download failed: {r.status_code} {r.text[:200]}"
