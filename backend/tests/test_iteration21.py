"""Iteration 21 — LemonSqueezy webhook + gated PDF downloads.

Tests:
  1. /api/lemonsqueezy/health — reports all 3 secrets set, counts events.
  2. /api/lemonsqueezy/webhook — forged signature returns 401.
  3. /api/lemonsqueezy/webhook — invalid JSON with valid sig returns 400.
  4. /api/lemonsqueezy/webhook — order_created with valid sig + custom_data
     creates a purchase row. Replay returns "already_granted".
  5. /api/lemonsqueezy/webhook — order_refunded removes the row.
  6. /api/lemonsqueezy/webhook — missing custom_data returns "ignored".
  7. /api/cabinet/library/{slug}/download — 401 unauth, 403 signed-in
     non-owner, 404 unknown slug, 200 + PDF for a granted user.
"""
import os, uuid, json, hmac, hashlib
from datetime import datetime, timezone, timedelta

import pytest
import requests
from pymongo import MongoClient

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "").rstrip("/")
if not BASE_URL:
    with open("/app/frontend/.env") as f:
        for line in f:
            if line.startswith("REACT_APP_BACKEND_URL="):
                BASE_URL = line.split("=", 1)[1].strip().rstrip("/")
                break

MONGO_URL = os.environ.get("MONGO_URL", "mongodb://localhost:27017")
DB_NAME = os.environ.get("DB_NAME", "test_database")
SECRET = "Emake!123Hea"


@pytest.fixture(scope="module")
def db():
    c = MongoClient(MONGO_URL); yield c[DB_NAME]; c.close()


@pytest.fixture
def auth_session(db):
    uid = f"test-it21-{uuid.uuid4().hex[:8]}"
    tok = f"test_tok_it21_{uuid.uuid4().hex}"
    db.users.insert_one({"user_id": uid, "email": f"{uid}@t", "name":"X","picture":"","role":"member","created_at": datetime.now(timezone.utc)})
    db.user_sessions.insert_one({"user_id": uid, "session_token": tok, "expires_at": datetime.now(timezone.utc)+timedelta(days=1), "created_at": datetime.now(timezone.utc)})
    yield (tok, uid)
    db.users.delete_many({"user_id": uid})
    db.user_sessions.delete_many({"user_id": uid})
    db.purchases.delete_many({"user_id": uid})
    db.lemonsqueezy_events.delete_many({"user_id": uid})


def _sign(body: bytes) -> str:
    return hmac.new(SECRET.encode(), body, hashlib.sha256).hexdigest()


# ---------- Health ----------

def test_health():
    r = requests.get(f"{BASE_URL}/api/lemonsqueezy/health", timeout=10)
    assert r.status_code == 200
    d = r.json()
    assert d["store_id_set"] is True
    assert d["webhook_secret_set"] is True
    assert d["api_key_set"] is True


# ---------- Webhook ----------

def test_forged_signature_rejected():
    r = requests.post(f"{BASE_URL}/api/lemonsqueezy/webhook",
                      data=b'{"meta":{"event_name":"order_created"}}',
                      headers={"Content-Type":"application/json","X-Signature":"deadbeef"},
                      timeout=10)
    assert r.status_code == 401


def test_invalid_json_with_valid_sig():
    body = b"this is not json"
    r = requests.post(f"{BASE_URL}/api/lemonsqueezy/webhook",
                      data=body, headers={"Content-Type":"application/json","X-Signature":_sign(body)}, timeout=10)
    assert r.status_code == 400


def test_missing_custom_data_ignored():
    body = json.dumps({"meta":{"event_name":"order_created"},"data":{"id":"x"}}).encode()
    r = requests.post(f"{BASE_URL}/api/lemonsqueezy/webhook",
                      data=body, headers={"Content-Type":"application/json","X-Signature":_sign(body)}, timeout=10)
    assert r.status_code == 200
    assert r.json()["status"] == "ignored"


def test_order_created_grants_and_idempotent(auth_session, db):
    tok, uid = auth_session
    body = json.dumps({"meta":{"event_name":"order_created","custom_data":{"user_id":uid,"book_slug":"the-language-of-angels"}},"data":{"id":f"ORD_{uid}","type":"orders"}}).encode()
    sig = _sign(body)
    r1 = requests.post(f"{BASE_URL}/api/lemonsqueezy/webhook", data=body, headers={"Content-Type":"application/json","X-Signature":sig}, timeout=10)
    assert r1.json()["status"] == "granted"
    r2 = requests.post(f"{BASE_URL}/api/lemonsqueezy/webhook", data=body, headers={"Content-Type":"application/json","X-Signature":sig}, timeout=10)
    assert r2.json()["status"] == "already_granted"
    assert db.purchases.count_documents({"user_id": uid}) == 1


def test_order_refunded_revokes(auth_session, db):
    tok, uid = auth_session
    # First grant
    grant_body = json.dumps({"meta":{"event_name":"order_created","custom_data":{"user_id":uid,"book_slug":"beyond-the-matrix-i"}},"data":{"id":f"ORD_R_{uid}"}}).encode()
    requests.post(f"{BASE_URL}/api/lemonsqueezy/webhook", data=grant_body, headers={"Content-Type":"application/json","X-Signature":_sign(grant_body)}, timeout=10)
    # Refund
    refund_body = json.dumps({"meta":{"event_name":"order_refunded","custom_data":{"user_id":uid,"book_slug":"beyond-the-matrix-i"}},"data":{"id":f"ORD_R_{uid}"}}).encode()
    r = requests.post(f"{BASE_URL}/api/lemonsqueezy/webhook", data=refund_body, headers={"Content-Type":"application/json","X-Signature":_sign(refund_body)}, timeout=10)
    assert r.json()["status"] == "revoked"
    assert db.purchases.count_documents({"user_id": uid, "book_slug": "beyond-the-matrix-i"}) == 0


# ---------- Gated download ----------

def test_download_unauth():
    r = requests.get(f"{BASE_URL}/api/cabinet/library/the-language-of-angels/download", timeout=10)
    assert r.status_code == 401


def test_download_unknown_slug(auth_session):
    tok, _ = auth_session
    r = requests.get(f"{BASE_URL}/api/cabinet/library/non-existent-slug/download",
                     headers={"Authorization":f"Bearer {tok}"}, timeout=10)
    assert r.status_code == 404


def test_download_signed_in_non_owner(auth_session):
    tok, _ = auth_session
    r = requests.get(f"{BASE_URL}/api/cabinet/library/the-language-of-angels/download",
                     headers={"Authorization":f"Bearer {tok}"}, timeout=10)
    assert r.status_code == 403


def test_download_after_grant(auth_session, db):
    tok, uid = auth_session
    body = json.dumps({"meta":{"event_name":"order_created","custom_data":{"user_id":uid,"book_slug":"the-language-of-angels"}},"data":{"id":f"ORD_DL_{uid}"}}).encode()
    requests.post(f"{BASE_URL}/api/lemonsqueezy/webhook", data=body, headers={"Content-Type":"application/json","X-Signature":_sign(body)}, timeout=10)
    r = requests.get(f"{BASE_URL}/api/cabinet/library/the-language-of-angels/download",
                     headers={"Authorization":f"Bearer {tok}"}, timeout=15, stream=True)
    assert r.status_code == 200
    assert r.headers.get("content-type") == "application/pdf"
    chunk = next(r.iter_content(chunk_size=4))
    assert chunk == b"%PDF"
