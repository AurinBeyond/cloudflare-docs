"""§PAYMENT-ABSTRACTION 2026-02-11 — Polar provider unit tests.

Tests the signature verification machinery + SKU mapping WITHOUT
hitting real Polar API. Uses synthetic Standard Webhooks payloads.
"""

import asyncio
import base64
import hashlib
import hmac
import json
import os
import sys
import time

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))


def _sign(secret_b64: str, msg_id: str, msg_ts: str, body: bytes) -> str:
    """Helper: produce a valid Standard Webhooks v1 signature."""
    key = base64.b64decode(secret_b64)
    to_sign = f"{msg_id}.{msg_ts}.".encode() + body
    digest = hmac.new(key, to_sign, hashlib.sha256).digest()
    return "v1," + base64.b64encode(digest).decode()


def _setup_env():
    # Random base64 key.
    secret_b64 = base64.b64encode(b"test_secret_32bytes_for_hmac_aaaa").decode()
    os.environ["POLAR_MODE"] = "sandbox"
    os.environ["POLAR_SANDBOX_OAT"] = "polar_oat_test"
    os.environ["POLAR_SANDBOX_WEBHOOK_SECRET"] = f"whsec_{secret_b64}"
    os.environ["POLAR_ORG_ID"] = "test_org_123"
    return secret_b64


def _teardown_env():
    for k in [
        "POLAR_MODE", "POLAR_SANDBOX_OAT", "POLAR_SANDBOX_WEBHOOK_SECRET",
        "POLAR_ORG_ID", "POLAR_SKU_MAP_JSON",
    ]:
        os.environ.pop(k, None)


def test_polar_not_configured_when_env_missing():
    _teardown_env()
    from payment_providers.polar import PolarProvider
    polar = PolarProvider()
    assert polar.is_configured() is False


def test_polar_configured_when_env_set():
    _setup_env()
    try:
        from payment_providers.polar import PolarProvider
        polar = PolarProvider()
        assert polar.is_configured() is True
    finally:
        _teardown_env()


def test_webhook_signature_valid():
    secret_b64 = _setup_env()
    try:
        from payment_providers.polar import PolarProvider
        polar = PolarProvider()
        body = json.dumps({
            "type": "order.created",
            "data": {
                "product_id": "prod_test_xyz",
                "amount": 3900,
                "currency": "USD",
                "customer_email": "test@example.com",
                "metadata": {"user_id": "user_42"},
            },
        }).encode()
        msg_id = "evt_001"
        msg_ts = str(int(time.time()))
        sig = _sign(secret_b64, msg_id, msg_ts, body)
        event = polar.verify_webhook(
            headers={
                "webhook-id": msg_id,
                "webhook-timestamp": msg_ts,
                "webhook-signature": sig,
            },
            body_bytes=body,
        )
        assert event.provider == "polar"
        assert event.event_type == "order.created"
        assert event.provider_event_id == msg_id
        assert event.customer_email == "test@example.com"
        assert event.customer_external_id == "user_42"
        assert event.amount_cents == 3900
        assert event.currency == "USD"
        assert event.raw_product_id == "prod_test_xyz"
    finally:
        _teardown_env()


def test_webhook_signature_invalid_rejected():
    _setup_env()
    try:
        from payment_providers.polar import PolarProvider
        from payment_providers.base import WebhookVerificationError
        polar = PolarProvider()
        body = b'{"type":"order.created","data":{}}'
        msg_ts = str(int(time.time()))
        try:
            polar.verify_webhook(
                headers={
                    "webhook-id": "evt_002",
                    "webhook-timestamp": msg_ts,
                    "webhook-signature": "v1,deadbeefnotvalidsignature",
                },
                body_bytes=body,
            )
            assert False, "Expected WebhookVerificationError"
        except WebhookVerificationError:
            pass
    finally:
        _teardown_env()


def test_webhook_old_timestamp_rejected():
    secret_b64 = _setup_env()
    try:
        from payment_providers.polar import PolarProvider
        from payment_providers.base import WebhookVerificationError
        polar = PolarProvider()
        body = b'{"type":"order.created","data":{}}'
        msg_id = "evt_003"
        # 1 hour old
        msg_ts = str(int(time.time()) - 3600)
        sig = _sign(secret_b64, msg_id, msg_ts, body)
        try:
            polar.verify_webhook(
                headers={
                    "webhook-id": msg_id,
                    "webhook-timestamp": msg_ts,
                    "webhook-signature": sig,
                },
                body_bytes=body,
            )
            assert False, "Expected WebhookVerificationError for old timestamp"
        except WebhookVerificationError as exc:
            assert "timestamp" in str(exc).lower()
    finally:
        _teardown_env()


def test_sku_mapping_with_env_override():
    _setup_env()
    os.environ["POLAR_SKU_MAP_JSON"] = json.dumps({
        "sandbox": {
            "body_temple": "polar_prod_bt_sand",
            "topup_60min": "polar_prod_tu_sand",
            "eternal_monthly": "polar_prod_em_sand",
        },
        "production": {
            "body_temple": "polar_prod_bt_real",
            "topup_60min": "polar_prod_tu_real",
            "eternal_monthly": "polar_prod_em_real",
        },
    })
    try:
        from payment_providers.sku_mapping import (
            polar_product_for_sku, sku_for_polar_product, list_skus
        )
        assert polar_product_for_sku("body_temple", mode="sandbox") == "polar_prod_bt_sand"
        assert polar_product_for_sku("body_temple", mode="production") == "polar_prod_bt_real"
        assert polar_product_for_sku("nonexistent", mode="sandbox") is None
        assert sku_for_polar_product("polar_prod_em_sand", mode="sandbox") == "eternal_monthly"
        assert sku_for_polar_product("unknown_id", mode="sandbox") is None
        skus = list_skus()
        assert len(skus) == 3
        assert {s["sku"] for s in skus} == {"body_temple", "topup_60min", "eternal_monthly"}
    finally:
        _teardown_env()


def test_create_checkout_blocks_when_not_configured():
    _teardown_env()  # ensure no env
    from payment_providers.polar import PolarProvider
    from payment_providers.base import PaymentProviderError
    polar = PolarProvider()
    try:
        asyncio.run(polar.create_checkout(
            sku="body_temple",
            user_id="user_test",
        ))
        assert False, "Expected PaymentProviderError"
    except PaymentProviderError as exc:
        assert "not configured" in str(exc).lower()


def test_webhook_missing_headers_rejected():
    _setup_env()
    try:
        from payment_providers.polar import PolarProvider
        from payment_providers.base import WebhookVerificationError
        polar = PolarProvider()
        try:
            polar.verify_webhook(headers={}, body_bytes=b"{}")
            assert False, "Expected WebhookVerificationError"
        except WebhookVerificationError as exc:
            assert "missing" in str(exc).lower()
    finally:
        _teardown_env()


if __name__ == "__main__":
    tests = [
        test_polar_not_configured_when_env_missing,
        test_polar_configured_when_env_set,
        test_webhook_signature_valid,
        test_webhook_signature_invalid_rejected,
        test_webhook_old_timestamp_rejected,
        test_sku_mapping_with_env_override,
        test_create_checkout_blocks_when_not_configured,
        test_webhook_missing_headers_rejected,
    ]
    for t in tests:
        try:
            t()
            print(f"PASS {t.__name__}")
        except AssertionError as e:
            print(f"FAIL {t.__name__}: {e}")
            raise
