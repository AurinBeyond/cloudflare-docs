"""
iteration 91 — GDPR endpoints + Polar checkout + Polar webhook smoke tests.
Scope:
  - POST /api/billing/checkout/session (401 unauth, 200 with auth)
  - POST /api/billing/polar/webhook (401 missing/invalid signature)
  - GET  /api/account/data-export (401 unauth, 200 attachment with auth)
  - POST /api/account/delete (401 unauth, 400 wrong confirm, 200 with valid confirm)
"""
import os
import json
import uuid
import requests
import pytest

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://aurin-hub.preview.emergentagent.com").rstrip("/")

# ------------------------------------------------------------------ fixtures
@pytest.fixture(scope="module")
def guest_session():
    """Create a fresh guest user session for auth-needed tests."""
    r = requests.post(
        f"{BASE_URL}/api/auth/guest",
        json={"guide_gender": "female"},
        timeout=20,
    )
    if r.status_code != 200:
        pytest.skip(f"/api/auth/guest unavailable: {r.status_code} {r.text[:200]}")
    data = r.json()
    return {
        "session_token": data["session_token"],
        "user_id": data["user_id"],
        "cookies": r.cookies,
    }


def _auth_headers(sess):
    return {"Authorization": f"Bearer {sess['session_token']}"}


# ============================================================
# Polar checkout endpoint
# ============================================================
class TestPolarCheckout:
    def test_checkout_session_requires_auth(self):
        r = requests.post(
            f"{BASE_URL}/api/billing/checkout/session",
            json={"sku_code": "access.day.pass"},
            timeout=15,
        )
        assert r.status_code == 401, f"expected 401, got {r.status_code}: {r.text[:200]}"

    def test_checkout_session_missing_sku(self, guest_session):
        r = requests.post(
            f"{BASE_URL}/api/billing/checkout/session",
            headers=_auth_headers(guest_session),
            json={},
            timeout=15,
        )
        assert r.status_code in (400, 422), f"expected 400/422, got {r.status_code}: {r.text[:200]}"

    @pytest.mark.parametrize("sku", [
        "access.day.pass",
        "journey.month",
        "companion.month",
        "lantern.month",
        "voice.return.30",
        "voice.full.90",
        "voice.season.200",
        "voice.habit.500",
    ])
    def test_checkout_session_returns_polar_url(self, guest_session, sku):
        r = requests.post(
            f"{BASE_URL}/api/billing/checkout/session",
            headers=_auth_headers(guest_session),
            json={"sku_code": sku},
            timeout=30,
        )
        # Accept 200 with hosted URL OR 502 if Polar API is unreachable in preview.
        if r.status_code == 502:
            pytest.skip(f"Polar API unreachable: {r.text[:200]}")
        assert r.status_code == 200, f"sku={sku} got {r.status_code}: {r.text[:300]}"
        body = r.json()
        assert "url" in body and body["url"], f"missing url for {sku}: {body}"
        assert "id" in body, body
        assert body.get("sku_code") == sku
        assert isinstance(body["url"], str) and body["url"].startswith("http"), body


# ============================================================
# Polar webhook
# ============================================================
class TestPolarWebhook:
    def test_webhook_rejects_missing_signature(self):
        r = requests.post(
            f"{BASE_URL}/api/billing/polar/webhook",
            data=b'{"type":"order.paid","id":"evt_test","data":{}}',
            headers={"Content-Type": "application/json"},
            timeout=15,
        )
        assert r.status_code == 401, f"expected 401, got {r.status_code}: {r.text[:200]}"

    def test_webhook_rejects_invalid_signature(self):
        r = requests.post(
            f"{BASE_URL}/api/billing/polar/webhook",
            data=b'{"type":"order.paid","id":"evt_test_bogus","data":{}}',
            headers={
                "Content-Type": "application/json",
                "webhook-id": "msg_bogus",
                "webhook-timestamp": "1700000000",
                "webhook-signature": "v1,bogussigvalueZZZ",
            },
            timeout=15,
        )
        assert r.status_code == 401, f"expected 401, got {r.status_code}: {r.text[:200]}"


# ============================================================
# GDPR Article 15 — data export
# ============================================================
class TestDataExport:
    def test_export_requires_auth(self):
        r = requests.get(f"{BASE_URL}/api/account/data-export", timeout=15)
        assert r.status_code == 401, f"expected 401, got {r.status_code}: {r.text[:200]}"

    def test_export_returns_attachment_with_user_data(self, guest_session):
        r = requests.get(
            f"{BASE_URL}/api/account/data-export",
            headers=_auth_headers(guest_session),
            timeout=30,
        )
        assert r.status_code == 200, f"got {r.status_code}: {r.text[:300]}"
        cd = r.headers.get("content-disposition", "")
        assert "attachment" in cd.lower(), f"missing attachment header: {cd}"
        assert "aurin-data-export" in cd, f"missing filename: {cd}"
        assert r.headers.get("content-type", "").startswith("application/json")
        payload = r.json()
        assert payload["user_id"] == guest_session["user_id"]
        assert "generated_at" in payload
        assert "email" in payload
        assert "collections" in payload and isinstance(payload["collections"], dict)
        # Guest user should at minimum exist in `users` collection.
        assert "users" in payload["collections"], (
            f"expected users in collections, got keys: {list(payload['collections'].keys())}"
        )
        # No raw mongo _id should leak
        users_rows = payload["collections"]["users"]
        assert all("_id" not in r for r in users_rows), "raw _id leaked"


# ============================================================
# GDPR Article 17 — account deletion
# ============================================================
class TestAccountDelete:
    def test_delete_requires_auth(self):
        r = requests.post(
            f"{BASE_URL}/api/account/delete",
            json={"confirm": "delete-my-account"},
            timeout=15,
        )
        assert r.status_code == 401, f"expected 401, got {r.status_code}: {r.text[:200]}"

    def test_delete_wrong_confirm_returns_400(self, guest_session):
        # Use a NEW guest so we don't burn the module-scope one
        s = requests.post(f"{BASE_URL}/api/auth/guest", json={"guide_gender": "male"}, timeout=15)
        if s.status_code != 200:
            pytest.skip("guest auth unavailable")
        tok = s.json()["session_token"]
        r = requests.post(
            f"{BASE_URL}/api/account/delete",
            headers={"Authorization": f"Bearer {tok}"},
            json={"confirm": "yes"},
            timeout=15,
        )
        assert r.status_code == 400, f"expected 400, got {r.status_code}: {r.text[:200]}"
        body = r.json()
        assert "confirm" in (body.get("detail") or "").lower()

    def test_delete_with_valid_confirm_deletes_and_invalidates(self):
        # Fresh guest session, then delete
        s = requests.post(f"{BASE_URL}/api/auth/guest", json={"guide_gender": "female"}, timeout=15)
        if s.status_code != 200:
            pytest.skip("guest auth unavailable")
        tok = s.json()["session_token"]
        uid = s.json()["user_id"]
        r = requests.post(
            f"{BASE_URL}/api/account/delete",
            headers={"Authorization": f"Bearer {tok}"},
            json={"confirm": "delete-my-account"},
            timeout=30,
        )
        assert r.status_code == 200, f"got {r.status_code}: {r.text[:300]}"
        summary = r.json()
        assert summary["user_id"] == uid
        assert "deleted_at" in summary
        assert "rows_removed" in summary
        # The users collection at least should have been removed
        rows_removed = summary["rows_removed"]
        assert rows_removed.get("users", 0) >= 1, f"expected user row removed: {rows_removed}"
        # Subsequent export with same token should 401 (session deleted)
        r2 = requests.get(
            f"{BASE_URL}/api/account/data-export",
            headers={"Authorization": f"Bearer {tok}"},
            timeout=15,
        )
        assert r2.status_code == 401, f"session not invalidated: {r2.status_code}"
