"""§PAYMENT-ABSTRACTION 2026-02-11 — Provider-agnostic payment kiht.

Anna's directive (Faas 1B quality lock + Commerce Cleanup 2026-02):
- Polar lives BEHIND this abstraction
- LemonSqueezy stays UNTOUCHED as live provider (legacy direct path)
- All NEW providers (Polar, future Creem/Paddle/Stripe) implement
  `PaymentProvider` interface
- No direct dependency injection into runtime core

Architecture:

    Frontend checkout button
            ↓
    /api/billing/checkout (router)
            ↓
    payment_providers.get_provider() → PaymentProvider instance
            ↓
    PaymentProvider.create_checkout()  ← abstract
            ↓                  ↓
    Polar.sh (live)        Creem (future)
            ↓                  ↓
    Vendor webhook → unified entitlement engine
            ↓
    user.presence_seconds_left grant (UNCHANGED)

Only the LAST step touches the runtime core. Everything above
this line is provider-specific and isolated.
"""

from __future__ import annotations

import os
import logging
from typing import Optional

from payment_providers.base import (
    PaymentProvider,
    CheckoutSession,
    WebhookEvent,
    PaymentProviderError,
    WebhookVerificationError,
)

logger = logging.getLogger("aurin.payment.factory")


def _selected_provider_name() -> str:
    """Which provider is active. Defaults to 'polar' for backward
    compatibility with the existing live deployment."""
    return (os.environ.get("PAYMENT_PROVIDER") or "polar").strip().lower()


def get_provider() -> PaymentProvider:
    """Factory. Returns the provider selected by PAYMENT_PROVIDER env.

    Supported values today: 'polar' (live).
    Reserved for future: 'creem'. When 'creem' is chosen but not yet
    implemented, we raise a clear PaymentProviderError so the caller
    can 503-fallback.
    """
    name = _selected_provider_name()

    if name == "polar":
        from payment_providers.polar import PolarProvider
        return PolarProvider()

    if name == "creem":
        from payment_providers.creem import CreemProvider
        return CreemProvider()

    raise PaymentProviderError(
        f"Unknown PAYMENT_PROVIDER='{name}'. "
        f"Supported: 'polar' (live), 'creem' (reserved)."
    )


__all__ = [
    "PaymentProvider",
    "CheckoutSession",
    "WebhookEvent",
    "PaymentProviderError",
    "WebhookVerificationError",
    "get_provider",
]

