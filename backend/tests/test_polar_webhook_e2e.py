"""§PAYMENT-ABSTRACTION 2026-02-11 — Live webhook end-to-end test.

Simulates a complete Polar.sh webhook delivery against the LIVE
backend with synthetic but cryptographically VALID signature.
Verifies the full chain:
  1. signature verification
  2. idempotency (duplicate webhook → 200 duplicate:true)
  3. persistence in polar_webhook_log
  4. admin event listing
  5. malformed signature → 400
  6. old timestamp → 400

Run AFTER setting env keys with test values. Restart backend.

  POLAR_MODE=sandbox
  POLAR_SANDBOX_OAT=polar_oat_test
  POLAR_SANDBOX_WEBHOOK_SECRET=whsec_<base64_of_test_key>
  POLAR_ORG_ID=test_org_123
"""

import base64
import hashlib
import hmac
import json
import os
import sys
import time
import urllib.request
import urllib.error

ROOT = os.path.dirname(os.path.dirname(__file__))
sys.path.insert(0, ROOT)


def _read_env(key):
    with open(os.path.join(ROOT, ".env")) as f:
        for line in f:
            line = line.strip()
            if line.startswith(f"{key}="):
                return line.split("=", 1)[1].strip().strip('"')
    return None


def _backend_url():
    fe_env = os.path.join(os.path.dirname(ROOT), "frontend", ".env")
    with open(fe_env) as f:
        for line in f:
            if line.startswith("REACT_APP_BACKEND_URL="):
                return line.split("=", 1)[1].strip().strip('"')
    raise RuntimeError("REACT_APP_BACKEND_URL not found")


def _sign(secret_raw, msg_id, msg_ts, body):
    s = secret_raw[len("whsec_"):] if secret_raw.startswith("whsec_") else secret_raw
    key = base64.b64decode(s)
    to_sign = f"{msg_id}.{msg_ts}.".encode() + body
    return "v1," + base64.b64encode(
        hmac.new(key, to_sign, hashlib.sha256).digest()
    ).decode()


def _post_webhook(url, headers, body):
    req = urllib.request.Request(
        url, data=body, method="POST",
        headers={
            "Content-Type": "application/json",
            "User-Agent": "Polar-Webhook/1.0 (aurin-e2e-test)",
            **headers,
        },
    )
    try:
        resp = urllib.request.urlopen(req, timeout=10)
        return resp.status, resp.read().decode()
    except urllib.error.HTTPError as e:
        return e.code, e.read().decode()


def main():
    backend = _backend_url()
    admin_token = _read_env("ADMIN_TOKEN")
    secret = _read_env("POLAR_SANDBOX_WEBHOOK_SECRET")
    if not secret or not _read_env("POLAR_SANDBOX_OAT") or not _read_env("POLAR_ORG_ID"):
        print("SKIP: Polar env not configured — run /app/backend/.env setup first")
        print("  Required: POLAR_SANDBOX_OAT, POLAR_SANDBOX_WEBHOOK_SECRET, POLAR_ORG_ID")
        return

    url = f"{backend}/api/webhooks/polar"
    admin_url = f"{backend}/api/admin/payment/polar-events?token={admin_token}&limit=5"

    msg_id = f"evt_e2e_{int(time.time())}"
    msg_ts = str(int(time.time()))
    body = json.dumps({
        "type": "order.created",
        "data": {
            "product_id": "test_product_xyz",
            "amount": 3900,
            "currency": "USD",
            "customer_email": "e2e-test@aurin.local",
            "metadata": {"user_id": "e2e_test_user"},
        },
    }).encode()

    print(f"=== Test 1: valid signature → 200 accepted ===")
    sig = _sign(secret, msg_id, msg_ts, body)
    status, resp = _post_webhook(url, {
        "webhook-id": msg_id,
        "webhook-timestamp": msg_ts,
        "webhook-signature": sig,
    }, body)
    print(f"  status={status} response={resp}")
    assert status == 200, f"Expected 200, got {status}"
    assert json.loads(resp).get("accepted") is True

    print(f"=== Test 2: SAME webhook again → 200 duplicate:true ===")
    status, resp = _post_webhook(url, {
        "webhook-id": msg_id,
        "webhook-timestamp": msg_ts,
        "webhook-signature": sig,
    }, body)
    print(f"  status={status} response={resp}")
    assert status == 200
    assert json.loads(resp).get("duplicate") is True

    print(f"=== Test 3: invalid signature → 400 rejected ===")
    status, resp = _post_webhook(url, {
        "webhook-id": "evt_bad_sig",
        "webhook-timestamp": msg_ts,
        "webhook-signature": "v1,invalidsignature",
    }, body)
    print(f"  status={status} response={resp[:100]}")
    assert status == 400

    print(f"=== Test 4: old timestamp → 400 rejected ===")
    old_ts = str(int(time.time()) - 3600)
    old_sig = _sign(secret, "evt_old_ts", old_ts, body)
    status, resp = _post_webhook(url, {
        "webhook-id": "evt_old_ts",
        "webhook-timestamp": old_ts,
        "webhook-signature": old_sig,
    }, body)
    print(f"  status={status} response={resp[:100]}")
    assert status == 400

    print(f"=== Test 5: admin event log shows persisted event ===")
    req = urllib.request.Request(
        admin_url,
        method="GET",
        headers={"User-Agent": "aurin-e2e-test/1.0"},
    )
    resp = urllib.request.urlopen(req, timeout=10).read().decode()
    data = json.loads(resp)
    print(f"  count={data['count']} latest_event_id={data['events'][0]['webhook_id'] if data['events'] else None}")
    assert data["count"] >= 1
    found = any(e["webhook_id"] == msg_id for e in data["events"])
    assert found, f"Expected {msg_id} in events log"

    print()
    print("ALL E2E WEBHOOK TESTS PASS ✓")


if __name__ == "__main__":
    main()
