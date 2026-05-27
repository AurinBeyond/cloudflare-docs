"""§GOVERNANCE 2026-02-11 — Runtime Governance Layer.

Anna's directive: "$0 cash risk" architecture. Prepaid wallet model
already exists in `users.presence_seconds_left`. This module adds the
MISSING three guards that protect the vendor side (ElevenLabs / OpenAI)
from runaway costs, abuse, infinite loops, and webhook storms.

Three independent guards, any of which can trip the circuit, PLUS a
manual Emergency Freeze switch:

  0. EMERGENCY FREEZE       — manual kill switch via env GOVERNANCE_FROZEN
                              or `/api/admin/governance/freeze` endpoint.
                              When ON, blocks ALL new voice sessions
                              (including unlimited_voice users — only
                              the env-only `GOVERNANCE_ENABLED=false`
                              fully disables the layer).

  1. VENDOR BALANCE GUARD   — polls ElevenLabs /v1/user/subscription
                              every 60s. If character_count >= 95% of
                              character_limit, NEW voice sessions are
                              blocked. Running sessions continue.

  2. SPEND VELOCITY BREAKER — COUNTS the number of NEW voice_sessions
                              ROWS inserted in the last 15 minutes
                              (database row count, NOT chars, NOT cost,
                              NOT credits). If > threshold (default 40
                              for beta), NEW sessions blocked for 5 min
                              cooldown. The unit is "session opens per
                              15 minutes" — equivalent to "average new
                              connections to ElevenLabs per quarter
                              hour". Each session ≈ 5-15 min long, so
                              40/15min represents heavy but legitimate
                              traffic; > 40 strongly implies an attack
                              loop, websocket reconnect storm, or bot.

  3. CONCURRENCY GUARD      — counts currently-open voice_sessions
                              (closed != True). If > threshold (default
                              10 for beta), NEW sessions blocked.

This module is READ-ONLY against vendor APIs and DB (except setting
its own env var via the freeze endpoint, which writes to process
memory only — does not persist across restarts; persistence requires
manual /app/backend/.env edit). It NEVER writes to user state.

Mount-point: `/api/clarity/convai/signed-url`.

ENV switches (all optional, sane defaults):
  GOVERNANCE_ENABLED                 = "true" / "false"  (default: true)
  GOVERNANCE_FROZEN                  = "true" / "false"  (default: false)
  GOVERNANCE_MAX_CONCURRENT_VOICE    = int (default: 10 — beta)
  GOVERNANCE_MAX_SESSIONS_PER_15MIN  = int (default: 40 — beta)
  GOVERNANCE_ELEVENLABS_USAGE_FLOOR  = float 0-1 (default: 0.95)
  GOVERNANCE_VENDOR_POLL_TTL_SEC     = int (default: 60)
"""

from __future__ import annotations

import os
import time
import logging
from datetime import datetime, timedelta, timezone
from typing import Any, Optional, TypedDict

import httpx

logger = logging.getLogger("aurin.governance")


class GovernanceVerdict(TypedDict):
    allowed: bool
    reason: str
    blocked_by: Optional[str]  # "vendor_balance" | "spend_velocity" | "concurrency" | None
    details: dict


# In-process cache for ElevenLabs subscription poll. Short-lived
# (60 s) so we don't hammer the vendor API on every signed-url call,
# but fresh enough that hard-stop kicks in within one minute of the
# real balance running out.
_VENDOR_CACHE: dict[str, Any] = {"checked_at": 0.0, "data": None}

# In-process velocity tripwire — when crossed, blocks for 5 min cooldown.
_VELOCITY_COOLDOWN_UNTIL: float = 0.0
_VELOCITY_COOLDOWN_SECONDS = 300


def is_governance_enabled() -> bool:
    raw = (os.environ.get("GOVERNANCE_ENABLED") or "true").strip().lower()
    return raw in {"1", "true", "yes", "on"}


def is_frozen() -> bool:
    """Emergency freeze — when ON, ALL new voice sessions are blocked.
    
    Toggle via env GOVERNANCE_FROZEN or admin endpoint
    `/api/admin/governance/freeze` (in-memory toggle).
    """
    raw = (os.environ.get("GOVERNANCE_FROZEN") or "false").strip().lower()
    return raw in {"1", "true", "yes", "on"}


def set_frozen(frozen: bool) -> None:
    """Write the freeze flag to process env (does NOT persist).
    Restart resets to GOVERNANCE_FROZEN value in /app/backend/.env.
    """
    os.environ["GOVERNANCE_FROZEN"] = "true" if frozen else "false"


def _max_concurrent() -> int:
    try:
        return int(os.environ.get("GOVERNANCE_MAX_CONCURRENT_VOICE") or 10)
    except (TypeError, ValueError):
        return 10


def _max_sessions_15min() -> int:
    try:
        return int(os.environ.get("GOVERNANCE_MAX_SESSIONS_PER_15MIN") or 40)
    except (TypeError, ValueError):
        return 40


def _elevenlabs_usage_floor() -> float:
    try:
        v = float(os.environ.get("GOVERNANCE_ELEVENLABS_USAGE_FLOOR") or 0.95)
        return max(0.5, min(0.99, v))
    except (TypeError, ValueError):
        return 0.95


def _vendor_poll_ttl() -> int:
    try:
        return int(os.environ.get("GOVERNANCE_VENDOR_POLL_TTL_SEC") or 60)
    except (TypeError, ValueError):
        return 60


async def fetch_elevenlabs_subscription(force: bool = False) -> Optional[dict]:
    """Fetch ElevenLabs /v1/user/subscription with TTL cache.

    Returns dict with keys: character_count, character_limit, status,
    next_character_count_reset_unix, etc. Returns None on any error
    (we fail OPEN — don't block sessions if ElevenLabs API is down,
    other guards still protect us).
    """
    now = time.time()
    if not force and _VENDOR_CACHE["data"] is not None:
        if (now - _VENDOR_CACHE["checked_at"]) < _vendor_poll_ttl():
            return _VENDOR_CACHE["data"]

    api_key = os.environ.get("ELEVENLABS_API_KEY")
    if not api_key:
        return None

    try:
        async with httpx.AsyncClient(timeout=8.0) as client:
            resp = await client.get(
                "https://api.elevenlabs.io/v1/user/subscription",
                headers={"xi-api-key": api_key},
            )
            if resp.status_code != 200:
                logger.warning(
                    "elevenlabs subscription poll failed status=%s body=%s",
                    resp.status_code, resp.text[:200],
                )
                return _VENDOR_CACHE["data"]  # serve stale on error
            data = resp.json()
            _VENDOR_CACHE["data"] = data
            _VENDOR_CACHE["checked_at"] = now
            return data
    except Exception as exc:  # noqa: BLE001
        logger.warning("elevenlabs subscription poll exception: %s", exc)
        return _VENDOR_CACHE["data"]


async def check_vendor_balance() -> tuple[bool, dict]:
    """Returns (ok, details). ok=False means vendor balance too low."""
    sub = await fetch_elevenlabs_subscription()
    if not sub:
        # Fail OPEN — don't block sessions when we can't read vendor.
        return True, {"reason": "vendor_api_unreachable"}

    used = int(sub.get("character_count") or 0)
    limit = int(sub.get("character_limit") or 0)
    if limit <= 0:
        return True, {"reason": "no_limit_reported"}

    usage_ratio = used / limit
    floor = _elevenlabs_usage_floor()
    details = {
        "character_count": used,
        "character_limit": limit,
        "usage_ratio": round(usage_ratio, 4),
        "floor": floor,
        "remaining_chars": max(0, limit - used),
        "tier": sub.get("tier"),
        "status": sub.get("status"),
        "next_reset_unix": sub.get("next_character_count_reset_unix"),
    }
    if usage_ratio >= floor:
        return False, details
    return True, details


async def check_spend_velocity(db: Any) -> tuple[bool, dict]:
    """Count voice_sessions opened in last 15 min. Block if > threshold."""
    global _VELOCITY_COOLDOWN_UNTIL
    now_ts = time.time()

    # Still inside cooldown window?
    if now_ts < _VELOCITY_COOLDOWN_UNTIL:
        remaining = int(_VELOCITY_COOLDOWN_UNTIL - now_ts)
        return False, {"cooldown_remaining_sec": remaining, "reason": "cooldown_active"}

    threshold = _max_sessions_15min()
    cutoff = datetime.now(timezone.utc) - timedelta(minutes=15)

    try:
        count = await db.voice_sessions.count_documents({
            "started_at": {"$gte": cutoff.isoformat()},
        })
    except Exception as exc:  # noqa: BLE001
        logger.warning("velocity check failed: %s", exc)
        return True, {"reason": "db_error_fail_open"}

    details = {
        "sessions_last_15min": count,
        "threshold": threshold,
        "cooldown_window_sec": _VELOCITY_COOLDOWN_SECONDS,
    }
    if count > threshold:
        _VELOCITY_COOLDOWN_UNTIL = now_ts + _VELOCITY_COOLDOWN_SECONDS
        logger.error(
            "GOVERNANCE: spend velocity breaker TRIPPED count=%s threshold=%s",
            count, threshold,
        )
        details["tripped"] = True
        return False, details
    return True, details


async def check_concurrency(db: Any) -> tuple[bool, dict]:
    """Count currently-open voice sessions. Block if > threshold."""
    threshold = _max_concurrent()
    try:
        count = await db.voice_sessions.count_documents({"closed": {"$ne": True}})
    except Exception as exc:  # noqa: BLE001
        logger.warning("concurrency check failed: %s", exc)
        return True, {"reason": "db_error_fail_open"}

    details = {"open_sessions": count, "threshold": threshold}
    if count > threshold:
        return False, details
    return True, details


async def evaluate_governance(db: Any, user_doc: Optional[dict]) -> GovernanceVerdict:
    """Run all three guards. Returns first FAIL or success.

    Order:
      0. governance master switch — disabled → ALLOW
      1. emergency freeze — frozen → BLOCK (even unlimited_voice users)
      2. unlimited_voice user — ALLOW
      3. vendor balance → concurrency → velocity
    """
    if not is_governance_enabled():
        return GovernanceVerdict(
            allowed=True,
            reason="governance_disabled",
            blocked_by=None,
            details={},
        )

    # Emergency freeze takes precedence over EVERYTHING (including
    # unlimited_voice). This is the red-button protection — when
    # the founder hits "freeze", nothing voice-related starts until
    # she lifts it.
    if is_frozen():
        return GovernanceVerdict(
            allowed=False,
            reason="emergency_freeze_active",
            blocked_by="emergency_freeze",
            details={"frozen": True},
        )

    if user_doc and user_doc.get("unlimited_voice"):
        return GovernanceVerdict(
            allowed=True,
            reason="unlimited_voice_user",
            blocked_by=None,
            details={},
        )

    # Order: vendor balance (cheapest, cached) → concurrency → velocity (db count).
    ok, vd = await check_vendor_balance()
    if not ok:
        return GovernanceVerdict(
            allowed=False,
            reason="vendor_balance_low",
            blocked_by="vendor_balance",
            details=vd,
        )

    ok, cd = await check_concurrency(db)
    if not ok:
        return GovernanceVerdict(
            allowed=False,
            reason="concurrency_cap",
            blocked_by="concurrency",
            details=cd,
        )

    ok, sv = await check_spend_velocity(db)
    if not ok:
        return GovernanceVerdict(
            allowed=False,
            reason="spend_velocity_tripped",
            blocked_by="spend_velocity",
            details=sv,
        )

    return GovernanceVerdict(
        allowed=True,
        reason="all_guards_pass",
        blocked_by=None,
        details={"vendor": vd, "concurrency": cd, "velocity": sv},
    )


async def governance_status_snapshot(db: Any) -> dict:
    """One-shot snapshot for /admin/finance dashboard."""
    vendor_ok, vd = await check_vendor_balance()
    conc_ok, cd = await check_concurrency(db)
    vel_ok, sv = await check_spend_velocity(db)

    # Aggregate user "credit debt" — sum of all presence_seconds_left.
    # This is what we OWE customers in voice service.
    total_owed_seconds = 0
    active_users = 0
    try:
        pipeline = [
            {"$match": {"presence_seconds_left": {"$gt": 0}}},
            {"$group": {
                "_id": None,
                "total": {"$sum": "$presence_seconds_left"},
                "count": {"$sum": 1},
            }},
        ]
        async for row in db.users.aggregate(pipeline):
            total_owed_seconds = int(row.get("total") or 0)
            active_users = int(row.get("count") or 0)
    except Exception as exc:  # noqa: BLE001
        logger.warning("owed_seconds aggregation failed: %s", exc)

    # Vendor cost per voice minute (ElevenLabs ~$0.10/min, OpenAI ~$0.04/min).
    cost_per_minute_usd = 0.14
    owed_minutes = total_owed_seconds / 60.0
    projected_vendor_cost_usd = round(owed_minutes * cost_per_minute_usd, 2)

    # ElevenLabs remaining char headroom in approximate "voice minutes":
    # rough estimate ~1000 chars per minute of speech (varies by model).
    remaining_chars = int(vd.get("remaining_chars") or 0)
    vendor_remaining_minutes = remaining_chars / 1000.0

    return {
        "checked_at": datetime.now(timezone.utc).isoformat(),
        "governance_enabled": is_governance_enabled(),
        "frozen": is_frozen(),
        "guards": {
            "vendor_balance": {"ok": vendor_ok, **vd},
            "concurrency": {"ok": conc_ok, **cd},
            "spend_velocity": {"ok": vel_ok, **sv},
        },
        "customer_debt": {
            "active_users_with_balance": active_users,
            "total_owed_seconds": total_owed_seconds,
            "total_owed_minutes": round(owed_minutes, 1),
            "projected_vendor_cost_usd": projected_vendor_cost_usd,
        },
        "vendor_headroom": {
            "elevenlabs_remaining_chars": remaining_chars,
            "elevenlabs_remaining_minutes_est": round(vendor_remaining_minutes, 1),
            "headroom_vs_debt_ratio": round(
                vendor_remaining_minutes / max(1.0, owed_minutes), 2,
            ),
        },
        "thresholds": {
            "max_concurrent_voice": _max_concurrent(),
            "max_sessions_per_15min": _max_sessions_15min(),
            "elevenlabs_usage_floor": _elevenlabs_usage_floor(),
            "vendor_poll_ttl_sec": _vendor_poll_ttl(),
        },
    }
