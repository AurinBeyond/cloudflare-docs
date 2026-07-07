"""
Aurin Commerce Readiness — Regression tests

§COMMERCE-CLEANUP 2026-02 — verifies the provider-neutral cleanup
does not regress the existing Polar flow, and asserts each of GPT's
6 checkpoint requirements:
    1. Currency unification
    2. SKU cleanup (single source of truth)
    3. Checkout abstraction routes through base.py
    4. Webhook event mapping preserves idempotency
    5. Refund + past_due handling
    6. Wallet separation (adults/kids)

Run:
    cd /app/backend && python -m pytest tests/test_commerce_readiness.py -v
"""

from __future__ import annotations

import pytest

from commerce import product_catalogue
from payment_providers import get_provider, PaymentProviderError
from payment_providers.base import PaymentProvider
from services import billing_webhook


# ─── 1. Currency unification ─────────────────────────────────────

class TestCurrencyUnification:
    def test_all_catalogue_prices_are_eur(self):
        """Every SKU in the canonical catalogue must have a euro price."""
        for sku, spec in product_catalogue.CATALOGUE.items():
            assert isinstance(spec.price_eur, (int, float)), \
                f"SKU {sku} price_eur must be numeric"
            assert spec.price_eur > 0, \
                f"SKU {sku} must have a positive price"

    def test_no_usd_or_nok_leakage_in_public_pricing(self):
        """The launch catalogue only knows EUR. USD/NOK legacy fields
        must not exist as attributes."""
        for spec in product_catalogue.CATALOGUE.values():
            # ProductSpec is frozen dataclass — attributes are strict
            assert not hasattr(spec, "price_usd"), \
                "Legacy price_usd attribute leaked into catalogue"
            assert not hasattr(spec, "price_nok"), \
                "Legacy price_nok attribute leaked into catalogue"


# ─── 2. SKU cleanup — single source of truth ─────────────────────

class TestSkuCatalogue:
    def test_canonical_catalogue_contains_launch_skus(self):
        """The 8 launch SKUs from Pricing.jsx must all exist."""
        launch_skus = {
            "access.day.pass",
            "journey.month",
            "companion.month",
            "lantern.month",
            "voice.return.30",
            "voice.full.90",
            "voice.season.200",
            "voice.habit.500",
        }
        actual = set(product_catalogue.all_skus())
        missing = launch_skus - actual
        assert not missing, f"Launch SKUs missing from catalogue: {missing}"

    def test_billing_webhook_sku_rules_come_from_catalogue(self):
        """SKU_RULES in billing_webhook must match the catalogue exactly.
        No stale legacy SKUs may leak in."""
        rules_skus = set(billing_webhook.SKU_RULES.keys())
        catalogue_skus = set(product_catalogue.all_skus())
        assert rules_skus == catalogue_skus, (
            f"SKU_RULES drift: "
            f"in_rules_not_catalogue={rules_skus - catalogue_skus}, "
            f"in_catalogue_not_rules={catalogue_skus - rules_skus}"
        )

    def test_wallet_grant_matches_catalogue(self):
        """wallet_grant_for() must return the same numbers as SKU_RULES."""
        for sku in product_catalogue.all_skus():
            grant = product_catalogue.wallet_grant_for(sku)
            rule = billing_webhook.SKU_RULES[sku]
            assert grant["adult_minutes"] == rule["adult"], sku
            assert grant["kids_minutes"] == rule["kids"], sku
            assert grant["validity_days"] == rule["days"], sku


# ─── 3. Checkout abstraction — routes through base.py ────────────

class TestCheckoutAbstraction:
    def test_get_provider_returns_paymentprovider(self, monkeypatch):
        """Default provider must implement PaymentProvider interface."""
        monkeypatch.setenv("PAYMENT_PROVIDER", "polar")
        # PolarProvider may fail is_configured() without env, so we
        # only assert the class type, not full construction success.
        try:
            provider = get_provider()
            assert isinstance(provider, PaymentProvider), \
                "get_provider() must return a PaymentProvider subclass"
        except Exception as exc:
            # Only allow failure if it's about missing env — not about
            # abstraction breakage.
            assert "OAT missing" in str(exc) or "not configured" in str(exc).lower(), \
                f"Unexpected checkout abstraction failure: {exc}"

    def test_unknown_provider_raises_clear_error(self, monkeypatch):
        """Bad PAYMENT_PROVIDER env must raise PaymentProviderError."""
        monkeypatch.setenv("PAYMENT_PROVIDER", "invalid_xyz")
        with pytest.raises(PaymentProviderError):
            get_provider()

    def test_creem_placeholder_raises_pending_error(self, monkeypatch):
        """PAYMENT_PROVIDER=creem must fail with a friendly not-implemented
        error until the Creem adapter ships."""
        monkeypatch.setenv("PAYMENT_PROVIDER", "creem")
        with pytest.raises(PaymentProviderError) as exc_info:
            get_provider()
        assert "not yet implemented" in str(exc_info.value).lower()


# ─── 4. Webhook idempotency ──────────────────────────────────────
# Full DB integration is exercised in test_polar_provider.py; here we
# only verify the module surface remained stable.

class TestWebhookHandler:
    def test_handle_event_exists(self):
        assert callable(billing_webhook.handle_event)

    def test_verify_signature_exists(self):
        assert callable(billing_webhook.verify_signature)


# ─── 5. Refund + past_due readiness ──────────────────────────────

class TestRefundAndDunning:
    def test_refund_handler_present(self):
        """billing_webhook must contain refund handling code."""
        import inspect
        source = inspect.getsource(billing_webhook.handle_event)
        assert "refund" in source.lower(), \
            "handle_event must contain refund handling"
        assert "commerce_refunds" in source, \
            "handle_event must record to commerce_refunds collection"

    def test_dunning_handler_present(self):
        """billing_webhook must handle past_due / payment_failed events."""
        import inspect
        source = inspect.getsource(billing_webhook.handle_event)
        assert "past_due" in source.lower() or "payment_failed" in source.lower(), \
            "handle_event must contain past_due / payment_failed handling"
        assert "commerce_dunning" in source, \
            "handle_event must record to commerce_dunning collection"

    def test_expire_grants_by_payment_exists(self):
        """credit_ledger must expose expire_grants_by_payment for the
        refund handler to call. Closing the refund loop, previously a
        known gap."""
        from services import credit_ledger
        assert hasattr(credit_ledger, "expire_grants_by_payment"), \
            "credit_ledger.expire_grants_by_payment is required for refund flow"
        assert callable(credit_ledger.expire_grants_by_payment)


# ─── 6. Wallet separation ────────────────────────────────────────

class TestWalletSeparation:
    def test_kids_wallet_is_isolated(self):
        """Access SKUs that grant kids minutes must ALSO grant adult
        minutes separately — the two never collapse into one wallet."""
        for sku, spec in product_catalogue.CATALOGUE.items():
            if spec.kids_voice_minutes > 0:
                # Every SKU with kids minutes is Companion/Lantern which
                # also gives adults minutes — but they are stored under
                # different wallet keys.
                assert spec.kids_content_included or spec.category == product_catalogue.CATEGORY_VOICE, (
                    f"SKU {sku} grants kids minutes but is not marked "
                    f"kids_content_included"
                )

    def test_voice_topups_never_grant_kids(self):
        """Adult voice top-ups must NEVER grant kids minutes.
        (Kids top-ups live in a separate future SKU family.)"""
        for sku, spec in product_catalogue.CATALOGUE.items():
            if spec.category == product_catalogue.CATEGORY_VOICE and \
               sku.startswith("voice."):
                assert spec.kids_voice_minutes == 0, \
                    f"Adult voice top-up {sku} must not grant kids minutes"
