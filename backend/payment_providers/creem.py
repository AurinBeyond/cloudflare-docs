"""§CREEM-ADAPTER 2026-02-07 — Creem.io Merchant of Record provider.

Implements the PaymentProvider interface for Creem.io. Written using
their public API documentation. Uses SAME product-ID map that
scripts/creem_seed_products.py already populated at
`commerce/creem_product_ids.json`.

Design notes:
- Creem follows Standard Webhooks spec (like Polar). Header names may
  differ; we try both `webhook-*` and `creem-*` variants for safety.
- Webhook secret comes from Creem dashboard → Webhooks → Signing key.
- Access to Creem via `x-api-key` header (verified working during
  `creem_seed_products.py` product creation).

ENV:
  CREEM_API_KEY            = "creem_..." (required, LIVE key)
  CREEM_WEBHOOK_SECRET     = "whsec_..." (set after webhook endpoint
                             is registered in Creem dashboard)
"""

from __future__ import annotations

import base64
import hashlib
import hmac
import json
import logging
import os
from datetime import datetime, timezone
from pathlib import Path
from typing import Optional

import httpx

from payment_providers.base import (
    CheckoutSession,
    PaymentProvider,
    PaymentProviderError,
    WebhookEvent,
    WebhookVerificationError,
)

logger = logging.getLogger("aurin.payment.creem")

CREEM_API_BASE = "https://api.creem.io/v1"
WEBHOOK_TIMESTAMP_TOLERANCE_SEC = 300  # 5 minutes

# ── product id map (populated by scripts/creem_seed_products.py) ────
_PRODUCT_MAP_PATH = (
    Path(__file__).resolve().parent.parent / "commerce" / "creem_product_ids.json"
)


def _api_key() -> Optional[str]:
    return os.environ.get("CREEM_API_KEY")


def _webhook_secret() -> Optional[str]:
    return os.environ.get("CREEM_WEBHOOK_SECRET")


def _load_product_map() -> dict:
    try:
        return json.loads(_PRODUCT_MAP_PATH.read_text())
    except Exception:  # noqa: BLE001
        return {"catalogue": {}, "books": {}}


def _creem_product_for_sku(sku: str) -> Optional[str]:
    """Look up Creem product_id for a canonical Aurin SKU.
    Handles both catalogue SKUs and book slugs (prefixed `book/`)."""
    m = _load_product_map()
    if sku.startswith("book/"):
        slug = sku[5:]
        entry = m.get("books", {}).get(slug)
    else:
        entry = m.get("catalogue", {}).get(sku)
    return (entry or {}).get("creem_id")


def _sku_for_creem_product(product_id: str) -> Optional[str]:
    """Reverse lookup — used by webhook to resolve event → internal SKU."""
    m = _load_product_map()
    for sku, entry in (m.get("catalogue") or {}).items():
        if entry.get("creem_id") == product_id:
            return sku
    for slug, entry in (m.get("books") or {}).items():
        if entry.get("creem_id") == product_id:
            return f"book/{slug}"
    return None


class CreemProvider(PaymentProvider):
    """Creem.io Merchant-of-Record integration."""

    name = "creem"

    def is_configured(self) -> bool:
        # API key alone is enough for checkout creation.
        # Webhook secret only required once webhook endpoint registered.
        return bool(_api_key())

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
                "Creem provider not configured. Set CREEM_API_KEY in /app/backend/.env"
            )
        product_id = _creem_product_for_sku(sku)
        if not product_id:
            raise PaymentProviderError(
                f"No Creem product mapping for SKU '{sku}' — "
                f"run scripts/creem_seed_products.py to create it."
            )

        payload = {
            "product_id": product_id,
            "customer_email": user_email,
            "metadata": {
                "internal_sku": sku,
                "user_id": user_id,
            },
            "request_id": f"aurin-{user_id}-{sku}",  # idempotency key
        }
        if success_url:
            payload["success_url"] = success_url
        # Drop None values (Creem API rejects empty strings on some fields)
        payload = {k: v for k, v in payload.items() if v is not None}

        try:
            async with httpx.AsyncClient(timeout=15.0) as client:
                resp = await client.post(
                    f"{CREEM_API_BASE}/checkouts",
                    json=payload,
                    headers={
                        "x-api-key": _api_key(),
                        "Content-Type": "application/json",
                    },
                )
        except Exception as exc:  # noqa: BLE001
            raise PaymentProviderError(
                f"Creem checkout request failed: {exc}"
            ) from exc

        if resp.status_code not in (200, 201):
            raise PaymentProviderError(
                f"Creem checkout HTTP {resp.status_code}: {resp.text[:400]}"
            )
        data = resp.json()
        return CheckoutSession(
            checkout_url=data.get("checkout_url") or data.get("url"),
            provider="creem",
            provider_session_id=data.get("id") or "",
            sku=sku,
            metadata={"creem_product_id": product_id},
        )

    def verify_webhook(self, headers: dict, body_bytes: bytes) -> WebhookEvent:
        """Verify Creem webhook signature.

        Creem follows Standard Webhooks spec. We accept both `webhook-*`
        (spec-standard) and `creem-*` (branded) header variants.
        """
        secret_raw = _webhook_secret()
        if not secret_raw:
            raise WebhookVerificationError(
                "Creem webhook secret not configured. Set CREEM_WEBHOOK_SECRET."
            )

        # Try spec-standard headers first, then Creem-branded fallbacks
        msg_id = (
            headers.get("webhook-id")
            or headers.get("Webhook-Id")
            or headers.get("creem-webhook-id")
            or headers.get("Creem-Webhook-Id")
        )
        msg_ts = (
            headers.get("webhook-timestamp")
            or headers.get("Webhook-Timestamp")
            or headers.get("creem-webhook-timestamp")
        )
        msg_sig = (
            headers.get("webhook-signature")
            or headers.get("Webhook-Signature")
            or headers.get("creem-webhook-signature")
            or headers.get("creem-signature")
        )

        if not (msg_id and msg_ts and msg_sig):
            raise WebhookVerificationError(
                "Missing webhook-id / timestamp / signature headers."
            )

        try:
            ts_int = int(msg_ts)
        except (TypeError, ValueError) as exc:
            raise WebhookVerificationError(f"Invalid timestamp: {msg_ts}") from exc
        age = abs(datetime.now(timezone.utc).timestamp() - ts_int)
        if age > WEBHOOK_TIMESTAMP_TOLERANCE_SEC:
            raise WebhookVerificationError(
                f"Webhook timestamp too old: {age:.0f}s"
            )

        secret = secret_raw
        if secret.startswith("whsec_"):
            secret = secret[len("whsec_"):]
        try:
            key = base64.b64decode(secret)
        except Exception:  # noqa: BLE001
            # Some providers give the raw key without base64 wrapper.
            key = secret_raw.encode() if isinstance(secret_raw, str) else secret_raw

        to_sign = f"{msg_id}.{msg_ts}.".encode() + body_bytes
        expected = hmac.new(key, to_sign, hashlib.sha256).digest()
        expected_b64 = base64.b64encode(expected).decode()

        # Signature may be space-separated list of "v1,sig" OR a single b64.
        candidates = []
        for entry in msg_sig.split():
            candidates.append(entry.split(",", 1)[1] if "," in entry else entry)
        if not any(hmac.compare_digest(c, expected_b64) for c in candidates):
            raise WebhookVerificationError("Signature mismatch")

        try:
            payload = json.loads(body_bytes.decode())
        except json.JSONDecodeError as exc:
            raise WebhookVerificationError(f"Invalid JSON: {exc}") from exc

        event_type = payload.get("eventType") or payload.get("type") or "unknown"
        data = payload.get("object") or payload.get("data") or {}

        # Normalise Creem event names to internal expected names
        # (Creem uses e.g. `checkout.completed`, `subscription.paid`).
        type_map = {
            "checkout.completed": "order.paid",
            "subscription.paid": "order.paid",
            "subscription.canceled": "subscription.canceled",
            "subscription.past_due": "subscription.past_due",
            "refund.created": "refund.created",
            "refund.processed": "refund.created",
            "dispute.created": "dispute.created",
        }
        normalized_type = type_map.get(event_type, event_type)

        product_id = (
            data.get("product_id")
            or (data.get("product") or {}).get("id")
            or (data.get("subscription") or {}).get("product_id")
        )
        sku = _sku_for_creem_product(product_id) if product_id else None

        amount = (
            data.get("amount")
            or data.get("total_amount")
            or (data.get("order") or {}).get("amount")
        )
        if isinstance(amount, dict):
            amount = amount.get("amount")

        return WebhookEvent(
            provider="creem",
            event_type=normalized_type,
            provider_event_id=msg_id,
            customer_email=(data.get("customer") or {}).get("email")
                or data.get("customer_email"),
            customer_external_id=(data.get("metadata") or {}).get("user_id"),
            amount_cents=amount if isinstance(amount, int) else None,
            currency=data.get("currency") or "EUR",
            sku=sku,
            raw_product_id=product_id,
            metadata=data.get("metadata") or {},
            raw_payload=payload,
        )
