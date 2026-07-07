"""
credit_ledger.py — SKU-namespaced atomic voice-credit ledger.

Two firewalled wallets per user (Strategy v2.3.1 §8 rule 2):
  - "adult"  wallet  → spent by ConvAI dialogue endpoints
  - "kids"   wallet  → spent by Aurin storyteller endpoints

A wallet is a list of credit grants. Each grant has:
  grant_id          str   (uuid4)
  user_id           str
  wallet            "adult" | "kids"
  source_sku        str   (e.g. "topup.compass.30", "inner.compass.month")
  source_payment_id str   (Polar order_id or subscription_id)
  minutes_granted   int
  minutes_remaining int
  granted_at        ISO datetime
  expires_at        ISO datetime
  cohort            "founding" | None  (Sovereign reservation)

Spending uses MongoDB findOneAndUpdate with atomic $inc to avoid races.

A daily-cap document tracks per-user-per-wallet generation in the last
24 h, enforced separately (Strategy v2.3.1 §8 rule 1):
  adult wallet: 30 min/day, kids wallet: 20 min/day.

Audit log is append-only; never updated, never deleted.
"""
from __future__ import annotations

import uuid
from datetime import datetime, timezone, timedelta
from typing import Any, Dict, List, Optional, Literal

Wallet = Literal["adult", "kids"]

DAILY_CAP_MINUTES = {"adult": 30, "kids": 20}


def _now() -> datetime:
    return datetime.now(timezone.utc)


def _iso(dt: datetime) -> str:
    return dt.astimezone(timezone.utc).isoformat()


async def grant_credit(
    db,
    *,
    user_id: str,
    wallet: Wallet,
    source_sku: str,
    source_payment_id: str,
    minutes: int,
    validity_days: int,
    cohort: Optional[str] = None,
) -> Dict[str, Any]:
    """Issue a new credit grant. Idempotent on source_payment_id+sku:
    re-running with the same (source_payment_id, source_sku, wallet)
    is a no-op."""
    existing = await db.user_credits.find_one(
        {
            "user_id": user_id,
            "source_payment_id": source_payment_id,
            "source_sku": source_sku,
            "wallet": wallet,
        },
        {"_id": 0},
    )
    if existing:
        return existing

    now = _now()
    grant = {
        "grant_id": str(uuid.uuid4()),
        "user_id": user_id,
        "wallet": wallet,
        "source_sku": source_sku,
        "source_payment_id": source_payment_id,
        "minutes_granted": int(minutes),
        "minutes_remaining": int(minutes),
        "granted_at": _iso(now),
        "expires_at": _iso(now + timedelta(days=int(validity_days))),
        "cohort": cohort,
    }
    await db.user_credits.insert_one(grant.copy())

    await db.audit_log.insert_one(
        {
            "kind": "credit_granted",
            "user_id": user_id,
            "wallet": wallet,
            "source_sku": source_sku,
            "source_payment_id": source_payment_id,
            "minutes": int(minutes),
            "at": _iso(now),
            "ref": grant["grant_id"],
        }
    )
    return grant


async def get_wallet_balance(db, user_id: str, wallet: Wallet) -> Dict[str, Any]:
    """Sum of unexpired minutes_remaining in the given wallet,
    sorted by expires_at ASC (so the soonest-to-expire grant is spent first)."""
    cursor = db.user_credits.find(
        {
            "user_id": user_id,
            "wallet": wallet,
            "minutes_remaining": {"$gt": 0},
            "expires_at": {"$gt": _iso(_now())},
        },
        {"_id": 0},
    ).sort("expires_at", 1)
    grants = await cursor.to_list(length=200)
    total = sum(int(g.get("minutes_remaining", 0)) for g in grants)
    return {"wallet": wallet, "minutes_remaining": total, "grants": grants}


async def _daily_used_minutes(db, user_id: str, wallet: Wallet) -> int:
    cutoff = _iso(_now() - timedelta(hours=24))
    cursor = db.audit_log.find(
        {
            "kind": "credit_spent",
            "user_id": user_id,
            "wallet": wallet,
            "at": {"$gt": cutoff},
        },
        {"_id": 0, "minutes": 1},
    )
    rows = await cursor.to_list(length=1000)
    return sum(int(r.get("minutes", 0)) for r in rows)


async def can_spend(db, user_id: str, wallet: Wallet, minutes: int) -> Dict[str, Any]:
    """Pre-flight check before invoking ElevenLabs.

    Returns:
      { "ok": True, ... }                          → safe to spend
      { "ok": False, "reason": "insufficient_balance" | "daily_cap" | "no_grants",
        "wallet_balance": int, "daily_used": int }
    """
    balance = await get_wallet_balance(db, user_id, wallet)
    daily_used = await _daily_used_minutes(db, user_id, wallet)
    cap = DAILY_CAP_MINUTES[wallet]

    if balance["minutes_remaining"] < minutes:
        return {
            "ok": False,
            "reason": "insufficient_balance",
            "wallet_balance": balance["minutes_remaining"],
            "daily_used": daily_used,
            "daily_cap": cap,
        }
    if daily_used + minutes > cap:
        return {
            "ok": False,
            "reason": "daily_cap",
            "wallet_balance": balance["minutes_remaining"],
            "daily_used": daily_used,
            "daily_cap": cap,
        }
    return {
        "ok": True,
        "wallet_balance": balance["minutes_remaining"],
        "daily_used": daily_used,
        "daily_cap": cap,
    }


async def spend(
    db,
    *,
    user_id: str,
    wallet: Wallet,
    minutes: int,
    reason: str,
    ref: Optional[str] = None,
) -> Dict[str, Any]:
    """Atomically deduct `minutes` from the wallet, oldest-expiring grant
    first. Returns either {"ok": True, "spent": ..., "grants_used": [...]}
    or {"ok": False, "reason": ...}.

    Caller is expected to have invoked `can_spend` first, but `spend`
    re-checks (race-safe)."""
    pre = await can_spend(db, user_id, wallet, minutes)
    if not pre["ok"]:
        return pre

    remaining_to_spend = int(minutes)
    grants_used: List[Dict[str, Any]] = []
    cursor = db.user_credits.find(
        {
            "user_id": user_id,
            "wallet": wallet,
            "minutes_remaining": {"$gt": 0},
            "expires_at": {"$gt": _iso(_now())},
        },
        {"_id": 0},
    ).sort("expires_at", 1)
    candidate_grants = await cursor.to_list(length=200)

    for grant in candidate_grants:
        if remaining_to_spend <= 0:
            break
        avail = int(grant.get("minutes_remaining", 0))
        take = min(avail, remaining_to_spend)
        upd = await db.user_credits.find_one_and_update(
            {
                "grant_id": grant["grant_id"],
                "minutes_remaining": {"$gte": take},
            },
            {"$inc": {"minutes_remaining": -take}},
            return_document=False,
        )
        if not upd:
            # someone else spent it between read and update; try next grant
            continue
        grants_used.append({"grant_id": grant["grant_id"], "minutes": take})
        remaining_to_spend -= take

    if remaining_to_spend > 0:
        # rollback all grants we already mutated
        for used in grants_used:
            await db.user_credits.update_one(
                {"grant_id": used["grant_id"]},
                {"$inc": {"minutes_remaining": used["minutes"]}},
            )
        return {
            "ok": False,
            "reason": "race_condition_rollback",
            "wallet_balance": pre["wallet_balance"],
        }

    await db.audit_log.insert_one(
        {
            "kind": "credit_spent",
            "user_id": user_id,
            "wallet": wallet,
            "minutes": int(minutes),
            "reason": reason,
            "ref": ref,
            "grants_used": grants_used,
            "at": _iso(_now()),
        }
    )
    return {"ok": True, "spent": int(minutes), "grants_used": grants_used}



async def expire_grants_by_payment(
    db,
    *,
    source_payment_id: str,
    reason: str = "refunded",
) -> int:
    """§COMMERCE-CLEANUP 2026-02 — Reverse (expire, do not delete) all
    grants tied to a given payment.

    Called by the refund webhook. Sets `minutes_remaining = 0` and marks
    the grant with an `expired_by` audit field so history is preserved.
    Any minutes the user has already SPENT before the refund are kept
    intact — we only zero out the *remaining* balance for that payment.

    Args:
        source_payment_id: the Polar/Creem order or subscription ID the
            refund is for.
        reason: audit tag; typically "refunded" but also usable for
            "chargeback" or "manual_admin".

    Returns:
        Number of grants that were expired (0 if none matched).
    """
    if not source_payment_id:
        return 0

    now_iso = _iso(_now())

    # Find grants tied to this payment that still have remaining minutes
    cursor = db.user_credits.find(
        {
            "source_payment_id": source_payment_id,
            "minutes_remaining": {"$gt": 0},
        },
        {"_id": 0},
    )
    grants = await cursor.to_list(length=None)

    revoked = 0
    for g in grants:
        result = await db.user_credits.update_one(
            {
                "grant_id": g["grant_id"],
                "minutes_remaining": {"$gt": 0},  # optimistic — no double-expire
            },
            {
                "$set": {
                    "minutes_remaining": 0,
                    "expired_at": now_iso,
                    "expired_by": reason,
                },
            },
        )
        if result.modified_count == 1:
            revoked += 1
            await db.audit_log.insert_one(
                {
                    "kind": "credit_revoked",
                    "user_id": g.get("user_id"),
                    "wallet": g.get("wallet"),
                    "source_sku": g.get("source_sku"),
                    "source_payment_id": source_payment_id,
                    "minutes_forfeited": int(g.get("minutes_remaining") or 0),
                    "reason": reason,
                    "at": now_iso,
                    "ref": g.get("grant_id"),
                }
            )

    return revoked
