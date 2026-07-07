"""
billing_webhook.py — Polar.sh webhook signature verification + event provisioning.

Verifies HMAC via the standardwebhooks library (Polar publishes the
secret in the dashboard; we read it from POLAR_*_WEBHOOK_SECRET).

Provisioning rules (from MEMBERSHIP_ARCHITECTURE_v2.3.md/.1):

  SKU                           wallet grant                   notes
  ----------------------------  -----------------------------  ---------------------
  quiet.entry.*                 adult 15 min × cycle           bundled "taste"
  aurin.storyteller.*           kids  60 min × cycle           child layer only
  inner.compass.*               adult 60 min × cycle
  sanctuary.compass.*           adult 90 + kids 60             two wallets at once
  sovereign.standard.quarter    adult 450 + kids 300 (1 qtr)   fair-use; "cohort=founding" if seats remain
  sovereign.standard.year       adult 1800 + kids 1200 (1 yr)  fair-use × 4
  sovereign.bespoke.quarter     adult 600 + kids 400 (1 qtr)   fair-use
  sovereign.bespoke.year        adult 2400 + kids 1600 (1 yr)  fair-use × 4
  access.day.kids               kids  10 min × 24h             single-shot
  access.day.quiet              adult 30 min × 24h
  access.day.deep               adult 60 min × 24h
  topup.compass.30/120/300      adult N min × {30,60,90} days
  topup.aurin.20/60/150         kids  N min × {30,60,90} days
  topup.daypass.30              adult 30 min × 24h (extension)

Idempotency: every webhook event's `id` is recorded once in
`polar_processed_events`; replay of the same event is a no-op.
"""
from __future__ import annotations

import logging
import os
from datetime import datetime, timezone
from typing import Any, Dict, Optional

from services import credit_ledger
from services.polar_client import webhook_secret
from commerce import product_catalogue

try:
    from standardwebhooks import Webhook
    from standardwebhooks.webhooks import WebhookVerificationError
except ImportError:  # pragma: no cover
    Webhook = None  # type: ignore
    WebhookVerificationError = Exception  # type: ignore

logger = logging.getLogger(__name__)


# §COMMERCE-CLEANUP 2026-02 — SKU_RULES now derives from the canonical
# product catalogue. Any legacy SKU not in the catalogue is treated as
# unknown (webhook logs it and returns without granting).
# The dict below is auto-populated at import time and kept in the exact
# shape the existing _provision() function expects.
def _build_sku_rules() -> Dict[str, Dict[str, Any]]:
    rules: Dict[str, Dict[str, Any]] = {}
    for sku, spec in product_catalogue.CATALOGUE.items():
        entry: Dict[str, Any] = {
            "adult": spec.adult_voice_minutes,
            "kids": spec.kids_voice_minutes,
            "days": spec.validity_days,
        }
        if spec.product_type == product_catalogue.ONE_SHOT:
            entry["one_shot"] = True
        if spec.lantern_included:
            entry["lantern"] = True
        if spec.cohort_flag:
            entry["cohort"] = True
        rules[sku] = entry
    return rules


SKU_RULES: Dict[str, Dict[str, Any]] = _build_sku_rules()


def verify_signature(raw_body: bytes, headers: Dict[str, str]) -> Dict[str, Any]:
    """Raises WebhookVerificationError on bad signature; returns parsed event."""
    if Webhook is None:
        raise RuntimeError("standardwebhooks library not installed")
    import base64
    secret = webhook_secret()
    # Polar emits a plain secret string starting with "polar_whs_…".
    # standardwebhooks expects base64-encoded secret. Polar's secrets are
    # already in the format standardwebhooks accepts after we base64-encode
    # the raw bytes (this is Polar's documented pattern).
    encoded_secret = base64.b64encode(secret.encode("utf-8")).decode("utf-8")
    wh = Webhook(encoded_secret)
    # Verify raises on mismatch.
    return wh.verify(raw_body, headers)  # type: ignore[return-value]


async def _record_event(db, event: Dict[str, Any]) -> bool:
    """Return True if this event is being processed for the first time.
    False = duplicate replay; caller should short-circuit with 200."""
    event_id = event.get("id") or event.get("event_id") or ""
    if not event_id:
        return True  # cannot dedupe; let it through and rely on grant_credit dedupe
    existing = await db.polar_processed_events.find_one(
        {"event_id": event_id},
        {"_id": 0, "event_id": 1},
    )
    if existing:
        logger.info("Polar event %s already processed; skipping replay.", event_id)
        return False
    await db.polar_processed_events.insert_one(
        {
            "event_id": event_id,
            "type": event.get("type"),
            "processed_at": datetime.now(timezone.utc).isoformat(),
        }
    )
    return True


def _user_id_from_event(event: Dict[str, Any]) -> Optional[str]:
    """Polar attaches the customer's external_id (we will set this on
    checkout creation in the next phase). Fallback: customer.email."""
    data = event.get("data") or {}
    customer = data.get("customer") or {}
    external = (
        data.get("customer_external_id")
        or customer.get("external_id")
        or (data.get("metadata") or {}).get("user_id")
    )
    if external:
        return str(external)
    email = customer.get("email") or data.get("customer_email")
    return f"email::{email}" if email else None


def _sku_from_event(event: Dict[str, Any]) -> Optional[str]:
    """Extract sku_code from product metadata. Polar emits the product
    object inside `data.product` for order.paid; the metadata.sku_code
    is what our `create_polar_products.py` script wrote."""
    data = event.get("data") or {}
    product = data.get("product") or {}
    md = product.get("metadata") or {}
    sku = md.get("sku_code")
    if sku:
        return sku
    # Fallback: top-level data.metadata.sku_code (subscription events)
    md2 = data.get("metadata") or {}
    return md2.get("sku_code")


async def _provision(db, *, user_id: str, sku: str, payment_id: str, event_id: str) -> Dict[str, Any]:
    rules = SKU_RULES.get(sku)
    if not rules:
        logger.warning("No SKU_RULES entry for %s; ignoring.", sku)
        return {"ok": False, "reason": "unknown_sku", "sku": sku}

    # Sovereign cohort flag: only set if seats remain.
    cohort_value: Optional[str] = None
    if rules.get("cohort"):
        # atomic decrement
        result = await db.polar_cohort_seats.find_one_and_update(
            {"sku": sku, "seats_remaining": {"$gt": 0}},
            {"$inc": {"seats_remaining": -1}},
            return_document=False,
        )
        if result:
            cohort_value = "founding"

    granted: list[Dict[str, Any]] = []
    if rules["adult"] > 0:
        g = await credit_ledger.grant_credit(
            db,
            user_id=user_id,
            wallet="adult",
            source_sku=sku,
            source_payment_id=payment_id,
            minutes=int(rules["adult"]),
            validity_days=int(rules["days"]),
            cohort=cohort_value,
        )
        granted.append({"wallet": "adult", "grant_id": g.get("grant_id")})
    if rules["kids"] > 0:
        g = await credit_ledger.grant_credit(
            db,
            user_id=user_id,
            wallet="kids",
            source_sku=sku,
            source_payment_id=payment_id,
            minutes=int(rules["kids"]),
            validity_days=int(rules["days"]),
            cohort=cohort_value,
        )
        granted.append({"wallet": "kids", "grant_id": g.get("grant_id")})

    return {"ok": True, "sku": sku, "granted": granted, "cohort": cohort_value}


async def handle_event(db, event: Dict[str, Any]) -> Dict[str, Any]:
    """Top-level dispatcher. Idempotent.
    Supported types: order.paid, subscription.created, subscription.updated, subscription.canceled.
    """
    is_new = await _record_event(db, event)
    if not is_new:
        return {"ok": True, "duplicate": True}

    etype = event.get("type") or ""

    # order.paid is the primary trigger for both one-shot and first-cycle recurring
    if etype in {"order.paid", "order.created", "order.updated"}:
        data = event.get("data") or {}
        user_id = _user_id_from_event(event)
        sku = _sku_from_event(event)
        payment_id = data.get("id") or event.get("id") or ""
        if not (user_id and sku and payment_id):
            logger.warning("order.paid missing fields: user_id=%s sku=%s payment=%s",
                           user_id, sku, payment_id)
            return {"ok": False, "reason": "missing_fields", "user_id": user_id, "sku": sku}
        return await _provision(
            db, user_id=user_id, sku=sku, payment_id=payment_id, event_id=event.get("id", "")
        )

    if etype == "subscription.created":
        # First-cycle grant — same provisioning as order.paid
        data = event.get("data") or {}
        user_id = _user_id_from_event(event)
        sku = _sku_from_event(event)
        sub_id = data.get("id") or ""
        if not (user_id and sku and sub_id):
            return {"ok": False, "reason": "missing_fields"}
        return await _provision(
            db, user_id=user_id, sku=sku, payment_id=f"sub::{sub_id}::cycle1",
            event_id=event.get("id", ""),
        )

    if etype == "subscription.updated":
        # Renewal cycle: Polar emits this on each billing tick.
        data = event.get("data") or {}
        user_id = _user_id_from_event(event)
        sku = _sku_from_event(event)
        sub_id = data.get("id") or ""
        # Use current_period_start as the cycle discriminator → makes each
        # renewal idempotent independently.
        cycle_key = data.get("current_period_start") or data.get("started_at") or ""
        if not (user_id and sku and sub_id):
            return {"ok": False, "reason": "missing_fields"}
        return await _provision(
            db, user_id=user_id, sku=sku,
            payment_id=f"sub::{sub_id}::cycle::{cycle_key}",
            event_id=event.get("id", ""),
        )

    if etype == "subscription.canceled":
        # Honour current period to its natural end. No revoke.
        return {"ok": True, "action": "noop_until_period_end"}

    # §COMMERCE-CLEANUP 2026-02 — refund handler.
    # Reverse the wallet grant when a refund is processed. We look up
    # the original payment_id and expire (rather than delete) the
    # associated grants so the audit trail is preserved.
    if etype in {"refund.created", "refund.processed"}:
        data = event.get("data") or {}
        # Polar/Creem both expose the original order/payment id inside
        # the refund payload — key varies by provider so try both.
        payment_id = (
            data.get("order_id")
            or data.get("payment_id")
            or (data.get("order") or {}).get("id")
            or ""
        )
        if not payment_id:
            logger.warning("refund event missing payment_id: %s", event.get("id"))
            return {"ok": False, "reason": "missing_payment_id"}

        # Reverse (expire) wallet grants tied to that payment.
        # credit_ledger.expire_grants_by_payment records its own audit
        # entries and returns the number of grants revoked.
        revoked = await credit_ledger.expire_grants_by_payment(
            db, source_payment_id=payment_id, reason="refunded"
        )
        if revoked == 0:
            logger.info(
                "refund for %s processed but no active grants remained "
                "to revoke (already-spent or never-granted).",
                payment_id,
            )

        # Record the refund event for admin visibility.
        try:
            await db.commerce_refunds.insert_one({
                "event_id": event.get("id"),
                "payment_id": payment_id,
                "processed_at": datetime.now(timezone.utc).isoformat(),
                "grants_revoked": revoked,
                "raw": data,
            })
        except Exception as exc:  # pragma: no cover
            logger.warning("commerce_refunds insert failed: %s", exc)

        return {"ok": True, "action": "refund_processed",
                "payment_id": payment_id, "grants_revoked": revoked}

    # §COMMERCE-CLEANUP 2026-02 — past_due / expired-card handler.
    # A subscription entered dunning. We record it and let the provider
    # retry per its own dunning schedule. Access continues until the
    # already-granted period naturally expires — no immediate revoke.
    if etype in {"subscription.past_due", "subscription.payment_failed"}:
        data = event.get("data") or {}
        user_id = _user_id_from_event(event)
        sub_id = data.get("id") or ""
        try:
            await db.commerce_dunning.insert_one({
                "event_id": event.get("id"),
                "subscription_id": sub_id,
                "user_id": user_id,
                "type": etype,
                "recorded_at": datetime.now(timezone.utc).isoformat(),
                "raw": data,
            })
        except Exception as exc:  # pragma: no cover
            logger.warning("commerce_dunning insert failed: %s", exc)

        # Grace-period email dispatch happens in a separate scheduled
        # job that reads commerce_dunning. Not sent here to keep the
        # webhook synchronous and side-effect-minimal.
        return {"ok": True, "action": "dunning_recorded", "type": etype}

    if etype in {"dispute.created", "dispute.opened"}:
        # Chargebacks — record only. No automated grant revoke; Anna
        # decides case-by-case since disputes are often mistakes.
        data = event.get("data") or {}
        try:
            await db.commerce_disputes.insert_one({
                "event_id": event.get("id"),
                "recorded_at": datetime.now(timezone.utc).isoformat(),
                "raw": data,
            })
        except Exception as exc:  # pragma: no cover
            logger.warning("commerce_disputes insert failed: %s", exc)
        return {"ok": True, "action": "dispute_recorded"}

    return {"ok": True, "ignored_type": etype}


async def seed_cohort_seats(db) -> None:
    """One-shot bootstrap: ensure cohort seat counters exist for Sovereign SKUs."""
    initial_seats = 10
    skus = [
        "sovereign.standard.quarter",
        "sovereign.standard.year",
        "sovereign.bespoke.quarter",
        "sovereign.bespoke.year",
    ]
    for sku in skus:
        await db.polar_cohort_seats.update_one(
            {"sku": sku},
            {"$setOnInsert": {"sku": sku, "seats_remaining": initial_seats,
                              "initial_seats": initial_seats,
                              "created_at": datetime.now(timezone.utc).isoformat()}},
            upsert=True,
        )
