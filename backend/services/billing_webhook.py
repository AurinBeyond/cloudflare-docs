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

try:
    from standardwebhooks import Webhook
    from standardwebhooks.webhooks import WebhookVerificationError
except ImportError:  # pragma: no cover
    Webhook = None  # type: ignore
    WebhookVerificationError = Exception  # type: ignore

logger = logging.getLogger(__name__)


# Validity / minutes mapping by sku_code.
# Recurring bundles: minutes refresh each billing cycle via order.paid.
# One-shot SKUs: minutes granted once with their own expiry.
SKU_RULES: Dict[str, Dict[str, Any]] = {
    # ── Recurring bundles ───────────────────────────────────
    "quiet.entry.month":           {"adult": 15,  "kids": 0,  "days": 35},
    "quiet.entry.quarter":         {"adult": 45,  "kids": 0,  "days": 100},
    "quiet.entry.year":            {"adult": 180, "kids": 0,  "days": 370},
    "aurin.storyteller.month":     {"adult": 0,   "kids": 60, "days": 35},
    "aurin.storyteller.quarter":   {"adult": 0,   "kids": 180,"days": 100},
    "aurin.storyteller.year":      {"adult": 0,   "kids": 720,"days": 370},
    "inner.compass.month":         {"adult": 60,  "kids": 0,  "days": 35},
    "inner.compass.quarter":       {"adult": 180, "kids": 0,  "days": 100},
    "inner.compass.year":          {"adult": 720, "kids": 0,  "days": 370},
    "sanctuary.compass.month":     {"adult": 90,  "kids": 60, "days": 35},
    "sanctuary.compass.quarter":   {"adult": 270, "kids": 180,"days": 100},
    "sanctuary.compass.year":      {"adult": 1080,"kids": 720,"days": 370},
    # ── Sovereign (cohort-aware) ────────────────────────────
    "sovereign.standard.quarter":  {"adult": 450, "kids": 300,"days": 100, "cohort": True},
    "sovereign.standard.year":     {"adult": 1800,"kids": 1200,"days": 370,"cohort": True},
    "sovereign.bespoke.quarter":   {"adult": 600, "kids": 400,"days": 100, "cohort": True},
    "sovereign.bespoke.year":      {"adult": 2400,"kids": 1600,"days": 370,"cohort": True},
    # ── Day passes (24h) ────────────────────────────────────
    "access.day.kids":             {"adult": 0,   "kids": 10, "days": 1, "one_shot": True},
    "access.day.quiet":            {"adult": 30,  "kids": 0,  "days": 1, "one_shot": True},
    "access.day.deep":             {"adult": 60,  "kids": 0,  "days": 1, "one_shot": True},
    # ── Top-ups (one-shot, custom validity) ─────────────────
    "topup.compass.30":            {"adult": 30,  "kids": 0,  "days": 30, "one_shot": True},
    "topup.compass.120":           {"adult": 120, "kids": 0,  "days": 60, "one_shot": True},
    "topup.compass.300":           {"adult": 300, "kids": 0,  "days": 90, "one_shot": True},
    "topup.aurin.20":              {"adult": 0,   "kids": 20, "days": 30, "one_shot": True},
    "topup.aurin.60":              {"adult": 0,   "kids": 60, "days": 60, "one_shot": True},
    "topup.aurin.150":             {"adult": 0,   "kids": 150,"days": 90, "one_shot": True},
    "topup.daypass.30":            {"adult": 30,  "kids": 0,  "days": 1, "one_shot": True},

    # ── NEW ACCESS LADDER (2026-02-26) — see PRICING_LOCKED_2026-06-25_v2.md
    # Day Pass: 24h, unlimited adult voice window (1440 = 24h)
    "access.day.pass":             {"adult": 1440, "kids": 0,    "days": 1,   "one_shot": True},
    # Recurring monthly bundles
    "journey.month":               {"adult": 30,   "kids": 0,    "days": 35},
    "companion.month":             {"adult": 60,   "kids": 60,   "days": 35},
    "lantern.month":               {"adult": 60,   "kids": 60,   "days": 35, "lantern": True},
    # Voice top-ups (one-shot, custom validity)
    "voice.return.30":             {"adult": 30,   "kids": 0,    "days": 30,  "one_shot": True},
    "voice.full.90":               {"adult": 90,   "kids": 0,    "days": 60,  "one_shot": True},
    "voice.season.200":            {"adult": 200,  "kids": 0,    "days": 90,  "one_shot": True},
    "voice.habit.500":             {"adult": 500,  "kids": 0,    "days": 180, "one_shot": True},
}


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
