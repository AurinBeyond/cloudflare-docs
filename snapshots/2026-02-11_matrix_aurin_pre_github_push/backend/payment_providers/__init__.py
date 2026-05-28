"""§PAYMENT-ABSTRACTION 2026-02-11 — Provider-agnostic payment kiht.

Anna's directive (Faas 1B quality lock):
- Polar lives BEHIND this abstraction
- LemonSqueezy stays UNTOUCHED as live provider (legacy direct path)
- All NEW providers (Polar, future Paddle/Stripe) implement
  `PaymentProvider` interface
- No direct dependency injection into runtime core

Architecture:

    Frontend checkout button
            ↓
    /api/billing/checkout (router — picks provider by SKU flag)
            ↓
    PaymentProvider.create_checkout()  ← abstract
            ↓                  ↓
    LemonSqueezy (legacy)   Polar.sh (new)
            ↓                  ↓
    Vendor webhook → unified entitlement engine
            ↓
    user.presence_seconds_left grant (UNCHANGED)

Only the LAST step touches the runtime core. Everything above
this line is provider-specific and isolated.
"""

from payment_providers.base import (
    PaymentProvider,
    CheckoutSession,
    WebhookEvent,
    PaymentProviderError,
)

__all__ = [
    "PaymentProvider",
    "CheckoutSession",
    "WebhookEvent",
    "PaymentProviderError",
]
