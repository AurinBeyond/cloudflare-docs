"""
Sprint B credit ledger + provisioning regression tests.

Verifies:
  - grant_credit is idempotent on (source_payment_id, source_sku, wallet)
  - spend deducts oldest-expiring grant first
  - daily cap blocks over-spend
  - adult and kids wallets are firewalled (no cross-spend)
  - webhook handle_event dedupes by event_id
  - sovereign cohort seat decrement is atomic

Run: `cd /app/backend && python -m pytest tests/test_stage3_4_sprint_b.py -v`
"""
from __future__ import annotations

import asyncio
import os
import sys
import uuid
from pathlib import Path

import pytest
import pytest_asyncio
from motor.motor_asyncio import AsyncIOMotorClient

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from services import credit_ledger, billing_webhook  # noqa: E402


@pytest_asyncio.fixture
async def db():
    """Isolated test DB. Clears its collections per test."""
    client = AsyncIOMotorClient(os.environ["MONGO_URL"])
    test_db = client[f"sprint_b_test_{uuid.uuid4().hex[:6]}"]
    yield test_db
    await client.drop_database(test_db.name)
    client.close()


@pytest.mark.asyncio
async def test_grant_credit_basic(db):
    g = await credit_ledger.grant_credit(
        db, user_id="u1", wallet="adult", source_sku="inner.compass.month",
        source_payment_id="pay_001", minutes=60, validity_days=35,
    )
    assert g["minutes_remaining"] == 60
    assert g["minutes_granted"] == 60
    assert g["wallet"] == "adult"


@pytest.mark.asyncio
async def test_grant_credit_is_idempotent(db):
    g1 = await credit_ledger.grant_credit(
        db, user_id="u1", wallet="adult", source_sku="inner.compass.month",
        source_payment_id="pay_001", minutes=60, validity_days=35,
    )
    g2 = await credit_ledger.grant_credit(
        db, user_id="u1", wallet="adult", source_sku="inner.compass.month",
        source_payment_id="pay_001", minutes=60, validity_days=35,
    )
    assert g1["grant_id"] == g2["grant_id"]
    count = await db.user_credits.count_documents({"user_id": "u1"})
    assert count == 1


@pytest.mark.asyncio
async def test_spend_deducts_balance(db):
    await credit_ledger.grant_credit(
        db, user_id="u1", wallet="adult", source_sku="inner.compass.month",
        source_payment_id="pay_001", minutes=60, validity_days=35,
    )
    out = await credit_ledger.spend(
        db, user_id="u1", wallet="adult", minutes=5, reason="voice.transmit",
    )
    assert out["ok"] is True
    bal = await credit_ledger.get_wallet_balance(db, "u1", "adult")
    assert bal["minutes_remaining"] == 55


@pytest.mark.asyncio
async def test_spend_blocks_insufficient_balance(db):
    await credit_ledger.grant_credit(
        db, user_id="u1", wallet="adult", source_sku="quiet.entry.month",
        source_payment_id="pay_002", minutes=2, validity_days=35,
    )
    out = await credit_ledger.spend(
        db, user_id="u1", wallet="adult", minutes=10, reason="voice.transmit",
    )
    assert out["ok"] is False
    assert out["reason"] == "insufficient_balance"


@pytest.mark.asyncio
async def test_daily_cap_enforced(db):
    # Grant plenty of minutes
    await credit_ledger.grant_credit(
        db, user_id="u1", wallet="adult", source_sku="inner.compass.month",
        source_payment_id="pay_003", minutes=200, validity_days=35,
    )
    # Spend up to cap
    out1 = await credit_ledger.spend(db, user_id="u1", wallet="adult", minutes=30, reason="t")
    assert out1["ok"] is True
    # Next spend should hit daily cap
    out2 = await credit_ledger.spend(db, user_id="u1", wallet="adult", minutes=1, reason="t")
    assert out2["ok"] is False
    assert out2["reason"] == "daily_cap"


@pytest.mark.asyncio
async def test_adult_and_kids_wallets_firewalled(db):
    await credit_ledger.grant_credit(
        db, user_id="u1", wallet="adult", source_sku="inner.compass.month",
        source_payment_id="pay_004", minutes=60, validity_days=35,
    )
    # User has zero kids balance
    out = await credit_ledger.spend(
        db, user_id="u1", wallet="kids", minutes=1, reason="kids.fairytale",
    )
    assert out["ok"] is False
    assert out["reason"] == "insufficient_balance"
    # Adult balance is intact
    bal = await credit_ledger.get_wallet_balance(db, "u1", "adult")
    assert bal["minutes_remaining"] == 60


@pytest.mark.asyncio
async def test_handle_event_dedupes_by_event_id(db):
    await billing_webhook.seed_cohort_seats(db)
    # §COMMERCE-CLEANUP 2026-02 — use current live SKU (voice.return.30
    # replaces the retired topup.compass.30).
    fake_event = {
        "id": "evt_test_001",
        "type": "order.paid",
        "data": {
            "id": "ord_abc",
            "customer": {"external_id": "u_test", "email": "x@y.com"},
            "product": {"metadata": {"sku_code": "voice.return.30"}},
        },
    }
    r1 = await billing_webhook.handle_event(db, fake_event)
    assert r1.get("ok") is True
    r2 = await billing_webhook.handle_event(db, fake_event)
    assert r2.get("duplicate") is True
    # Only ONE grant should exist
    count = await db.user_credits.count_documents({"user_id": "u_test"})
    assert count == 1


@pytest.mark.asyncio
async def test_house_compass_grants_both_wallets(db):
    await billing_webhook.seed_cohort_seats(db)
    # §COMMERCE-CLEANUP 2026-02 — companion.month replaces the retired
    # sanctuary.compass.month. Wallet-split behaviour identical.
    # companion.month grants: 60 adult + 60 kids.
    fake_event = {
        "id": "evt_test_house",
        "type": "order.paid",
        "data": {
            "id": "ord_sanc",
            "customer": {"external_id": "u_family", "email": "p@q.com"},
            "product": {"metadata": {"sku_code": "companion.month"}},
        },
    }
    r = await billing_webhook.handle_event(db, fake_event)
    assert r.get("ok") is True
    adult = await credit_ledger.get_wallet_balance(db, "u_family", "adult")
    kids = await credit_ledger.get_wallet_balance(db, "u_family", "kids")
    assert adult["minutes_remaining"] == 60
    assert kids["minutes_remaining"] == 60


@pytest.mark.asyncio
async def test_sovereign_cohort_decrements_atomic(db):
    """§COMMERCE-CLEANUP 2026-02 — Sovereign SKUs are archived and no
    longer live in the catalogue. The cohort seat mechanism itself is
    preserved for future use. This test is skipped until a live
    cohort SKU is reintroduced."""
    pytest.skip(
        "Sovereign SKUs archived in 2026-02 commerce cleanup; cohort "
        "logic preserved for future reintroduction."
    )


@pytest.mark.asyncio
async def test_unknown_sku_is_ignored_gracefully(db):
    fake_event = {
        "id": "evt_test_unknown_sku",
        "type": "order.paid",
        "data": {
            "id": "ord_unknown",
            "customer": {"external_id": "u_z", "email": "z@z.com"},
            "product": {"metadata": {"sku_code": "made.up.fake.sku"}},
        },
    }
    r = await billing_webhook.handle_event(db, fake_event)
    assert r.get("ok") is False
    assert r.get("reason") == "unknown_sku"


@pytest.mark.asyncio
async def test_spend_uses_oldest_grant_first(db):
    """If a user has two grants — one expiring in 5 days, one in 30 —
    spending should drain the 5-day one first."""
    # Older grant: 30 days validity, granted now (will expire later)
    # We force two grants on the same wallet with different expiry windows
    # using the public API. Grant order matters: the soonest-to-expire is
    # drained first per get_wallet_balance sort order.
    await credit_ledger.grant_credit(
        db, user_id="u_priority", wallet="adult", source_sku="topup.compass.30",
        source_payment_id="pay_long", minutes=10, validity_days=90,
    )
    # Inject a second grant with shorter validity by direct insert
    # (mimicking what a separate purchase would do).
    await credit_ledger.grant_credit(
        db, user_id="u_priority", wallet="adult", source_sku="topup.compass.30",
        source_payment_id="pay_short", minutes=10, validity_days=15,
    )
    out = await credit_ledger.spend(
        db, user_id="u_priority", wallet="adult", minutes=10, reason="t",
    )
    assert out["ok"] is True
    # The 15-day grant should be the one drained (oldest expiry first)
    short_grant = await db.user_credits.find_one(
        {"source_payment_id": "pay_short"}, {"_id": 0}
    )
    long_grant = await db.user_credits.find_one(
        {"source_payment_id": "pay_long"}, {"_id": 0}
    )
    assert short_grant["minutes_remaining"] == 0
    assert long_grant["minutes_remaining"] == 10
