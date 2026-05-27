"""§PAYMENT-ABSTRACTION 2026-02-11 — Provider interface.

Minimal contract that every payment provider must implement:

  - create_checkout(sku, user)  → hosted checkout URL
  - verify_webhook(headers, body) → validated event or raise
  - is_configured()             → bool

Providers MUST NOT call into user/grant logic directly. They emit
typed WebhookEvent objects, which are dispatched by the central
webhook router to the existing entitlement engine (which lives
elsewhere and is UNCHANGED).
"""

from __future__ import annotations

from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import Optional


class PaymentProviderError(Exception):
    """Base exception for any payment-provider error."""


class WebhookVerificationError(PaymentProviderError):
    """Webhook signature/timestamp verification failed."""


@dataclass
class CheckoutSession:
    """Result of a hosted checkout creation."""
    checkout_url: str
    provider: str
    provider_session_id: str
    sku: str
    metadata: dict = field(default_factory=dict)
    created_at: datetime = field(default_factory=lambda: datetime.now(timezone.utc))


@dataclass
class WebhookEvent:
    """Provider-agnostic webhook event."""
    provider: str                          # "polar" | "lemonsqueezy" | ...
    event_type: str                        # "order.created" | "subscription.*" | "refund.*"
    provider_event_id: str                 # for idempotency
    customer_email: Optional[str] = None
    customer_external_id: Optional[str] = None
    amount_cents: Optional[int] = None
    currency: Optional[str] = None
    sku: Optional[str] = None              # internal mapped SKU
    raw_product_id: Optional[str] = None   # provider's product id
    metadata: dict = field(default_factory=dict)
    raw_payload: dict = field(default_factory=dict)
    received_at: datetime = field(default_factory=lambda: datetime.now(timezone.utc))


class PaymentProvider(ABC):
    """Abstract base. Concrete impls: polar.py, future stripe.py, etc.

    LemonSqueezy intentionally does NOT have an adapter here — it
    runs on its original direct code path inside server.py to honor
    Anna's "do not rewrite LS" constraint.
    """

    name: str = "abstract"

    @abstractmethod
    def is_configured(self) -> bool:
        """Return True if env keys are present and the provider can
        actually do real work. False = sandbox-only or disabled."""

    @abstractmethod
    async def create_checkout(
        self,
        sku: str,
        user_id: str,
        user_email: Optional[str] = None,
        success_url: Optional[str] = None,
        cancel_url: Optional[str] = None,
    ) -> CheckoutSession:
        """Create a hosted checkout. Return URL + session id."""

    @abstractmethod
    def verify_webhook(
        self,
        headers: dict,
        body_bytes: bytes,
    ) -> WebhookEvent:
        """Verify signature/timestamp; raise WebhookVerificationError
        on any failure. Return a typed event on success.

        IMPORTANT: this method MUST NOT touch the database. It only
        validates and parses. Persistence happens in the caller.
        """
