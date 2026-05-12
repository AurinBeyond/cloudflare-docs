"""Tests for credit_ledger.py — the Stripe-ready bookkeeping layer.

Validates:
  - balance starts at zero
  - top-ups add EUR × CREDITS_PER_EUR credits and append a ledger row
  - spend deducts; balance never goes negative
  - spend with insufficient balance returns {ok: False}
  - daily_usage_increment counts replies per (user, UTC date)
  - indexes can be created without error
  - the EUR→credit ratio matches the founder's locked 1€ = 10 contract

Uses a real mongomock-style in-memory database via motor's pseudo-fake
(actually we just use motor with a non-existent local DB and skip if
it's not reachable — the tests are unit-grade, no integration).
"""
from __future__ import annotations

import asyncio
import os
import sys
import pytest

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))


pytest_plugins = ()


class FakeCollection:
    """In-memory async stub good enough for credit_ledger unit tests."""
    def __init__(self):
        self.docs = []
        self.indexes = []

    async def find_one(self, query, projection=None):
        for d in self.docs:
            if all(d.get(k) == v for k, v in query.items()):
                return {k: v for k, v in d.items() if not (projection and projection.get(k) == 0)}
        return None

    async def update_one(self, query, update, upsert=False):
        for d in self.docs:
            if all(d.get(k) == v for k, v in query.items()):
                for k, v in (update.get("$set") or {}).items():
                    d[k] = v
                for k, v in (update.get("$inc") or {}).items():
                    d[k] = (d.get(k) or 0) + v
                return
        if upsert:
            new = dict(query)
            for k, v in (update.get("$set") or {}).items():
                new[k] = v
            for k, v in (update.get("$setOnInsert") or {}).items():
                new.setdefault(k, v)
            for k, v in (update.get("$inc") or {}).items():
                new[k] = (new.get(k) or 0) + v
            self.docs.append(new)

    async def find_one_and_update(self, query, update, upsert=False, return_document=False, projection=None):
        await self.update_one(query, update, upsert=upsert)
        return await self.find_one(query, projection)

    async def insert_one(self, doc):
        self.docs.append(dict(doc))

    async def create_index(self, keys, unique=False):
        self.indexes.append((keys, unique))


class FakeDB:
    def __init__(self):
        self.credit_balances = FakeCollection()
        self.credit_ledger = FakeCollection()
        self.daily_usage = FakeCollection()


def _run(coro):
    return asyncio.run(coro)


def test_credits_per_eur_locked_at_ten():
    from credit_ledger import CREDITS_PER_EUR
    assert CREDITS_PER_EUR == 10, (
        "Founder directive 2026-02-12: 1€ = 10 replies. "
        "Do not change this without explicit founder approval."
    )


def test_initial_balance_is_zero():
    db = FakeDB()
    from credit_ledger import get_balance
    assert _run(get_balance(db, "u1")) == 0


def test_topup_adds_correct_credits_and_ledger_entry():
    db = FakeDB()
    from credit_ledger import credit_topup, get_balance
    res = _run(credit_topup(db, "u1", 1.0, source="stripe:evt_test_001"))
    assert res["delta"] == 10
    assert res["balance"] == 10
    assert res["ledger_id"]
    # Ledger row was appended
    assert len(db.credit_ledger.docs) == 1
    assert db.credit_ledger.docs[0]["kind"] == "topup"
    assert db.credit_ledger.docs[0]["delta"] == 10
    # Balance helper agrees
    assert _run(get_balance(db, "u1")) == 10


def test_multiple_topups_accumulate():
    db = FakeDB()
    from credit_ledger import credit_topup, get_balance
    _run(credit_topup(db, "u1", 0.5, source="stripe:a"))
    _run(credit_topup(db, "u1", 2.0, source="stripe:b"))
    assert _run(get_balance(db, "u1")) == 25  # 5 + 20


def test_spend_decrements_balance():
    db = FakeDB()
    from credit_ledger import credit_topup, credit_spend, get_balance
    _run(credit_topup(db, "u1", 1.0, source="stripe:a"))
    res = _run(credit_spend(db, "u1", count=3))
    assert res["ok"] is True
    assert res["balance"] == 7
    assert _run(get_balance(db, "u1")) == 7


def test_spend_with_zero_balance_fails_gracefully():
    db = FakeDB()
    from credit_ledger import credit_spend
    res = _run(credit_spend(db, "u1", count=1))
    assert res["ok"] is False
    assert res["balance"] == 0
    assert res["ledger_id"] is None


def test_topup_with_zero_or_negative_raises():
    db = FakeDB()
    from credit_ledger import credit_topup
    with pytest.raises(ValueError):
        _run(credit_topup(db, "u1", 0.0, source="stripe:zero"))
    with pytest.raises(ValueError):
        _run(credit_topup(db, "u1", -1.0, source="stripe:neg"))


def test_daily_usage_increments_per_user_per_date():
    db = FakeDB()
    from credit_ledger import daily_usage_increment, get_daily_usage
    _run(daily_usage_increment(db, "u1", ceiling=60))
    _run(daily_usage_increment(db, "u1", ceiling=60))
    state = _run(get_daily_usage(db, "u1"))
    assert state["replies_used"] == 2
    assert state["ceiling_at_time"] == 60


def test_ledger_kind_is_topup_or_spend():
    """All ledger rows must carry a known kind so the audit trail
    remains queryable."""
    db = FakeDB()
    from credit_ledger import credit_topup, credit_spend
    _run(credit_topup(db, "u1", 1.0, source="stripe:a"))
    _run(credit_spend(db, "u1", count=2))
    kinds = {row["kind"] for row in db.credit_ledger.docs}
    assert kinds.issubset({"topup", "spend", "daily_reset", "promo", "refund"})
    assert "topup" in kinds and "spend" in kinds


def test_ensure_indexes_runs_without_error():
    db = FakeDB()
    from credit_ledger import ensure_indexes
    _run(ensure_indexes(db))
    assert len(db.credit_balances.indexes) == 1
    assert len(db.credit_ledger.indexes) == 2
    assert len(db.daily_usage.indexes) == 1
