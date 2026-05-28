"""§PAYMENT-ABSTRACTION 2026-02-11 — Polar.sh provider.

Implements the PaymentProvider interface for Polar.sh as Merchant
of Record. Supports both sandbox and production via env switches.

Anna's Faas 1B constraints (HONORED):
  - Sandbox only — no production switch until sandbox verified
  - Only 3 SKUs: Body Temple, Top-up 60min, Eternal monthly
  - LemonSqueezy stays untouched as fallback
  - Webhook signature MUST verify (Standard Webhooks spec)
  - Idempotent — handler must tolerate duplicate webhooks
  - Refund + failed-payment + duplicate-webhook simulation supported

ENV:
  POLAR_MODE                    = "sandbox" | "production"  (default: sandbox)
  POLAR_SANDBOX_OAT             = "polar_oat_..." (required for sandbox)
  POLAR_PROD_OAT                = "polar_oat_..." (required for prod)
  POLAR_SANDBOX_WEBHOOK_SECRET  = "whsec_..." (required for sandbox)
  POLAR_PROD_WEBHOOK_SECRET     = "whsec_..." (required for prod)
  POLAR_ORG_ID                  = "<org uuid>" (required)

Webhook signature: Polar uses Standard Webhooks spec — HMAC-SHA256
with svix headers (`webhook-id`, `webhook-timestamp`, `webhook-signature`).

If env is not set (Anna hasn't created Polar account yet), the
client returns is_configured()=False and all operations raise a
helpful PaymentProviderError. Server endpoints return 503.
"""

from __future__ import annotations

import os
import hmac
import json
import base64
import hashlib
import logging
from datetime import datetime, timezone
from typing import Optional

import httpx

from payment_providers.base import (
    PaymentProvider,
    CheckoutSession,
    WebhookEvent,
    PaymentProviderError,
    WebhookVerificationError,
)
from payment_providers.sku_mapping import sku_for_polar_product, polar_product_for_sku

logger = logging.getLogger("aurin.payment.polar")

WEBHOOK_TIMESTAMP_TOLERANCE_SEC = 300  # 5 min — Standard Webhooks recommendation


def _mode() -> str:
    raw = (os.environ.get("POLAR_MODE") or "sandbox").strip().lower()
    return "production" if raw == "production" else "sandbox"


def _api_base() -> str:
    return (
        "https://api.polar.sh"
        if _mode() == "production"
        else "https://sandbox-api.polar.sh"
    )


def _oat() -> Optional[str]:
    key = "POLAR_PROD_OAT" if _mode() == "production" else "POLAR_SANDBOX_OAT"
    return os.environ.get(key)


def _webhook_secret() -> Optional[str]:
    key = (
        "POLAR_PROD_WEBHOOK_SECRET"
        if _mode() == "production"
        else "POLAR_SANDBOX_WEBHOOK_SECRET"
    )
    return os.environ.get(key)


def _org_id() -> Optional[str]:
    return os.environ.get("POLAR_ORG_ID")


class PolarProvider(PaymentProvider):
    """Polar.sh Merchant-of-Record integration."""

    name = "polar"

    def is_configured(self) -> bool:
        return bool(_oat() and _webhook_secret() and _org_id())

    async def create_checkout(
        self,
        sku: str,
        user_id: str,
        user_email: Optional[str] = None,
        success_url: Optional[str] = None,
        cancel_url: Optional[str] = None,
    ) -> CheckoutSession:
        if not self.is_configured():
            raise PaymentProviderError(
                "Polar provider not configured. Set POLAR_*_OAT, "
                "POLAR_*_WEBHOOK_SECRET, POLAR_ORG_ID in /app/backend/.env"
            )
        product_id = polar_product_for_sku(sku, mode=_mode())
        if not product_id:
            raise PaymentProviderError(
                f"No Polar product mapping for SKU '{sku}' in mode={_mode()}"
            )

        payload = {
            "product_id": product_id,
            "metadata": {
                "internal_sku": sku,
                "user_id": user_id,
            },
        }
        if user_email:
            payload["customer_email"] = user_email
        if success_url:
            payload["success_url"] = success_url

        try:
            async with httpx.AsyncClient(timeout=15.0) as client:
                resp = await client.post(
                    f"{_api_base()}/v1/checkouts/",
                    json=payload,
                    headers={
                        "Authorization": f"Bearer {_oat()}",
                        "Content-Type": "application/json",
                    },
                )
        except Exception as exc:  # noqa: BLE001
            raise PaymentProviderError(
                f"Polar checkout request failed: {exc}"
            ) from exc

        if resp.status_code not in (200, 201):
            raise PaymentProviderError(
                f"Polar checkout HTTP {resp.status_code}: {resp.text[:300]}"
            )
        data = resp.json()
        return CheckoutSession(
            checkout_url=data.get("url") or data.get("checkout_url"),
            provider="polar",
            provider_session_id=data.get("id") or "",
            sku=sku,
            metadata={"mode": _mode(), "polar_product_id": product_id},
        )

    def verify_webhook(self, headers: dict, body_bytes: bytes) -> WebhookEvent:
        """Verify Standard Webhooks signature.

        Polar follows the spec: https://www.standardwebhooks.com/
        Headers:
          webhook-id          — unique per delivery
          webhook-timestamp   — unix seconds
          webhook-signature   — space-separated list of "v1,base64sig"

        Signature input:  "{id}.{timestamp}.{body}".
        Validation:       HMAC-SHA256 with the SECRET (base64-decoded
                           after stripping the "whsec_" prefix).
        """
        secret_raw = _webhook_secret()
        if not secret_raw:
            raise WebhookVerificationError(
                "Polar webhook secret not configured."
            )

        msg_id = headers.get("webhook-id") or headers.get("Webhook-Id")
        msg_ts = headers.get("webhook-timestamp") or headers.get("Webhook-Timestamp")
        msg_sig = headers.get("webhook-signature") or headers.get("Webhook-Signature")

        if not (msg_id and msg_ts and msg_sig):
            raise WebhookVerificationError(
                "Missing webhook-id / webhook-timestamp / webhook-signature headers."
            )

        # Timestamp tolerance — reject replays older than 5 min.
        try:
            ts_int = int(msg_ts)
        except (TypeError, ValueError) as exc:
            raise WebhookVerificationError(
                f"Invalid webhook-timestamp: {msg_ts}"
            ) from exc
        age = abs(datetime.now(timezone.utc).timestamp() - ts_int)
        if age > WEBHOOK_TIMESTAMP_TOLERANCE_SEC:
            raise WebhookVerificationError(
                f"Webhook timestamp too old: {age:.0f}s"
            )

        # Strip "whsec_" prefix; the remainder is base64-encoded HMAC key.
        secret = secret_raw
        if secret.startswith("whsec_"):
            secret = secret[len("whsec_"):]
        try:
            key = base64.b64decode(secret)
        except Exception as exc:  # noqa: BLE001
            raise WebhookVerificationError(
                f"Invalid webhook secret encoding: {exc}"
            ) from exc

        to_sign = f"{msg_id}.{msg_ts}.".encode() + body_bytes
        expected = hmac.new(key, to_sign, hashlib.sha256).digest()
        expected_b64 = base64.b64encode(expected).decode()

        # webhook-signature is space-separated list of "v1,sig" entries.
        # ANY matching entry is sufficient.
        candidates = [
            entry.split(",", 1)[1]
            for entry in msg_sig.split()
            if "," in entry and entry.startswith("v1,")
        ]
        if not any(hmac.compare_digest(c, expected_b64) for c in candidates):
            raise WebhookVerificationError(
                "Signature mismatch — webhook rejected."
            )

        # Parse payload.
        try:
            payload = json.loads(body_bytes.decode())
        except json.JSONDecodeError as exc:
            raise WebhookVerificationError(
                f"Invalid JSON body: {exc}"
            ) from exc

        event_type = payload.get("type") or "unknown"
        data = payload.get("data") or {}

        # Map Polar product id → internal SKU.
        product_id = (
            data.get("product_id")
            or (data.get("product") or {}).get("id")
            or (data.get("subscription") or {}).get("product_id")
        )
        sku = sku_for_polar_product(product_id, mode=_mode()) if product_id else None

        amount_cents = data.get("amount") or data.get("total_amount")
        if isinstance(amount_cents, dict):
            amount_cents = amount_cents.get("amount")

        return WebhookEvent(
            provider="polar",
            event_type=event_type,
            provider_event_id=msg_id,
            customer_email=(data.get("customer") or {}).get("email")
                or data.get("customer_email"),
            customer_external_id=(data.get("metadata") or {}).get("user_id"),
            amount_cents=amount_cents if isinstance(amount_cents, int) else None,
            currency=data.get("currency"),
            sku=sku,
            raw_product_id=product_id,
            metadata=data.get("metadata") or {},
            raw_payload=payload,
        )
