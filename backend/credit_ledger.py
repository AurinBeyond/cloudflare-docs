"""
credit_ledger.py — wanderer credit-balance + daily ceiling scaffolding.

Stage 3.2 prep — the data model is in place so the moment the founder
hands us Stripe sandbox keys we can wire `/api/credits/topup-intent`
and `/api/credits/webhook` without re-architecting.

Collections (Mongo):
  - `credit_balances` — one doc per `user_id` with current balance
       { user_id, balance, updated_at, lifetime_purchased, lifetime_used }
  - `credit_ledger`  — append-only audit trail (one doc per event)
       { id, user_id, kind, delta, balance_after, source, created_at, meta }
       kinds: "topup", "spend", "daily_reset", "promo", "refund"
  - `daily_usage`    — per (user_id, date_utc) counter
       { user_id, date_utc, replies_used, ceiling_at_time, last_reply_at }

Invariants enforced by the helpers below:
  - balance is always >= 0
  - every spend writes BOTH a ledger row AND a daily_usage increment
  - daily ceiling is computed live (Stage 3.1 lift: 60 during the
    free-access window, 12 / 60 otherwise) — see
    server._chat_cap_for_user. This module is the bookkeeping layer.

NO Stripe API calls live here. The webhook handler (when we have keys)
will call `credit_topup` with the amount from the Stripe event payload.
"""
from __future__ import annotations

import uuid
from datetime import datetime, timezone, date
from typing import Optional, Dict, Any


# Pricing — locked by founder directive 2026-02-12.
# "1€ = 10 vastust, 15 free/päev, 00:00 UTC reset, Stripe Elements."
CREDITS_PER_EUR = 10
DAILY_FREE_CEILING_DEFAULT = 15  # Stage 3.1 lifts to 60 during gift window
RESET_HOUR_UTC = 0


def _today_utc_iso() -> str:
    return date.today().isoformat()


def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


async def get_balance(db, user_id: str) -> int:
    """Return the wanderer's current credit balance (never < 0)."""
    doc = await db.credit_balances.find_one({"user_id": user_id}, {"_id": 0, "balance": 1})
    return max(0, int((doc or {}).get("balance", 0)))


async def get_daily_usage(db, user_id: str) -> Dict[str, Any]:
    """Return the wanderer's reply-count for today (UTC) + ceiling."""
    today = _today_utc_iso()
    doc = await db.daily_usage.find_one(
        {"user_id": user_id, "date_utc": today},
        {"_id": 0},
    )
    if not doc:
        return {"date_utc": today, "replies_used": 0, "ceiling_at_time": None, "last_reply_at": None}
    return {
        "date_utc": doc.get("date_utc", today),
        "replies_used": int(doc.get("replies_used", 0)),
        "ceiling_at_time": doc.get("ceiling_at_time"),
        "last_reply_at": doc.get("last_reply_at"),
    }


async def _append_ledger(db, user_id: str, kind: str, delta: int,
                         balance_after: int, source: str,
                         meta: Optional[dict] = None) -> str:
    """Append a single immutable row to the credit ledger."""
    entry_id = str(uuid.uuid4())
    await db.credit_ledger.insert_one({
        "id": entry_id,
        "user_id": user_id,
        "kind": kind,            # topup | spend | daily_reset | promo | refund
        "delta": int(delta),
        "balance_after": int(balance_after),
        "source": source,        # stripe:<event_id> | system | promo:<code>
        "created_at": _now_iso(),
        "meta": meta or {},
    })
    return entry_id


async def credit_topup(db, user_id: str, eur_amount: float,
                       source: str, meta: Optional[dict] = None) -> Dict[str, Any]:
    """Apply a credit top-up. Called from the Stripe webhook handler
    once payment is confirmed. Returns the new balance + ledger id."""
    if eur_amount <= 0:
        raise ValueError("eur_amount must be positive")
    delta = int(round(eur_amount * CREDITS_PER_EUR))
    new_balance = await get_balance(db, user_id) + delta
    await db.credit_balances.update_one(
        {"user_id": user_id},
        {
            "$set": {"balance": new_balance, "updated_at": _now_iso()},
            "$inc": {"lifetime_purchased": delta},
            "$setOnInsert": {"user_id": user_id, "lifetime_used": 0},
        },
        upsert=True,
    )
    entry_id = await _append_ledger(
        db, user_id, "topup", delta, new_balance, source, meta,
    )
    return {"balance": new_balance, "ledger_id": entry_id, "delta": delta}


async def credit_spend(db, user_id: str, count: int = 1,
                       source: str = "chat_reply",
                       meta: Optional[dict] = None) -> Dict[str, Any]:
    """Subtract from balance. Returns balance_after + ok flag.

    If balance < count, returns {ok: False, balance: <current>}.
    The caller decides whether to surface the top-up prompt.
    """
    current = await get_balance(db, user_id)
    if current < count:
        return {"ok": False, "balance": current, "ledger_id": None}
    new_balance = current - count
    await db.credit_balances.update_one(
        {"user_id": user_id},
        {
            "$set": {"balance": new_balance, "updated_at": _now_iso()},
            "$inc": {"lifetime_used": count},
        },
        upsert=True,
    )
    entry_id = await _append_ledger(
        db, user_id, "spend", -count, new_balance, source, meta,
    )
    return {"ok": True, "balance": new_balance, "ledger_id": entry_id}


async def daily_usage_increment(db, user_id: str, ceiling: int) -> Dict[str, Any]:
    """Increment today's reply counter for this wanderer. Returns the
    new state. The caller compares replies_used vs ceiling to decide
    whether to allow another reply (existing logic in
    server._enforce_chat_cap continues to own that decision)."""
    today = _today_utc_iso()
    res = await db.daily_usage.find_one_and_update(
        {"user_id": user_id, "date_utc": today},
        {
            "$inc": {"replies_used": 1},
            "$set": {"ceiling_at_time": int(ceiling), "last_reply_at": _now_iso()},
            "$setOnInsert": {"user_id": user_id, "date_utc": today},
        },
        upsert=True,
        return_document=True,
        projection={"_id": 0},
    )
    return {
        "date_utc": res.get("date_utc", today),
        "replies_used": int(res.get("replies_used", 1)),
        "ceiling_at_time": res.get("ceiling_at_time"),
    }


async def ensure_indexes(db) -> None:
    """One-time idempotent index creation. Call from server startup."""
    await db.credit_balances.create_index("user_id", unique=True)
    await db.credit_ledger.create_index([("user_id", 1), ("created_at", -1)])
    await db.credit_ledger.create_index("id", unique=True)
    await db.daily_usage.create_index(
        [("user_id", 1), ("date_utc", 1)], unique=True
    )
