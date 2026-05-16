"""Session-cap helper layer for ConvAI voice sessions.

§STABILIZATION 2026-05-16 — Founder directive: a THIN, ISOLATED layer
on top of the existing `clarity_passes` infrastructure that gates
the ConvAI voice surface for Grace / Private Room ONLY.

Design rules (warranty / stabilization scope):
  - This module is read-only against the existing pass system. It
    NEVER writes to `clarity_passes`, `cabinet_sessions`, or any
    other collection. Pass activation continues to belong to
    `/api/clarity/start` exactly as before.
  - The realtime audio core (RoomConvaiChat.jsx, WebSocket, SDK
    lifecycle) is NOT touched.
  - A single ENV flag (`SESSION_CAP_ENABLED`) disables the entire
    layer in production at runtime — no redeploy required.
  - A per-user `unlimited_voice` flag on the `users` collection
    overrides the cap for individual accounts (admin / staff).
  - Free-access window (`FREE_ACCESS_UNTIL`) bypasses the cap
    automatically so the soft launch is not interrupted.

This module is consumed by exactly TWO call sites in server.py:
  1. `GET  /api/clarity/convai/voice-window`  (frontend countdown UX)
  2. `POST /api/clarity/convai/signed-url`    (authoritative gate)

Neither call site mutates state here — gating is purely advisory at
the signed-url boundary. The currently-running voice session, if any,
is never killed by this layer; the existing realtime stability fix
(2026-05-16, Layer 5) remains intact.
"""

import os
from datetime import datetime, timezone
from typing import Any, Optional, TypedDict


class VoiceWindow(TypedDict):
    """Shape returned by `compute_voice_window`.

    `allowed`            : may a fresh ConvAI session start right now?
    `seconds_remaining`  : remaining seconds inside the current pass
                           window. 0 when `unlimited` or no pass.
    `tier`               : "unlimited" | "free_access" | "30min" |
                           "60min" | "season_30days" | None
    `reason`             : human-readable cause when allowed=false
                           ("cap_disabled" / "unlimited" / "no_pass"
                            / "pass_expired" / "free_access").
    `cap_enabled`        : current value of SESSION_CAP_ENABLED, so
                           the frontend can render the right UX.
    """

    allowed: bool
    seconds_remaining: int
    tier: Optional[str]
    reason: str
    cap_enabled: bool


def is_cap_enabled() -> bool:
    """Read the runtime kill-switch.

    Default: disabled. The founder must explicitly opt in by setting
    SESSION_CAP_ENABLED=true in production environment variables.
    This protects the existing realtime stability during the first
    deploy of this layer.
    """
    raw = (os.environ.get("SESSION_CAP_ENABLED") or "").strip().lower()
    return raw in {"1", "true", "yes", "on"}


def is_user_unlimited(user_doc: Optional[dict]) -> bool:
    """Admin / staff bypass. Set `users.{user_id}.unlimited_voice = True`
    in MongoDB to grant a single user uncapped voice access without
    touching the global flag.
    """
    if not user_doc:
        return False
    return bool(user_doc.get("unlimited_voice", False))


def _free_access_window_active() -> bool:
    """Mirror of server.py `_free_access_active`. Read-only env-driven
    flag that opens the whole product during the soft-launch window.
    Cap layer NEVER overrides this — free access stays free.
    """
    iso = os.environ.get("FREE_ACCESS_UNTIL")
    if not iso:
        return False
    try:
        target = datetime.fromisoformat(iso)
        if target.tzinfo is None:
            target = target.replace(tzinfo=timezone.utc)
    except (ValueError, KeyError):
        return False
    return datetime.now(timezone.utc) < target


def _seconds_remaining_iso(expires_at: Optional[str]) -> int:
    """Local copy of server.py `_seconds_remaining` so this module
    has zero import-coupling on the FastAPI app instance. The math is
    identical: never returns negative numbers, never raises.
    """
    if not expires_at:
        return 0
    try:
        exp = datetime.fromisoformat(expires_at)
    except (ValueError, TypeError):
        return 0
    if exp.tzinfo is None:
        exp = exp.replace(tzinfo=timezone.utc)
    delta = (exp - datetime.now(timezone.utc)).total_seconds()
    return max(0, int(delta))


async def compute_voice_window(
    user_id: str,
    user_doc: Optional[dict],
    db: Any,
) -> VoiceWindow:
    """Single source of truth for voice-cap decisions.

    Called by both the read-only `/voice-window` endpoint (for the
    frontend countdown banner) and the authoritative
    `/signed-url` endpoint (which mints the WebSocket URL).

    Resolution order — each step short-circuits the rest:
      1. Cap globally disabled  → allowed, tier=unlimited
      2. User marked unlimited  → allowed, tier=unlimited
      3. Free-access window     → allowed, tier=free_access
      4. Active *consumed* pass → allowed, seconds_remaining computed
      5. Unconsumed one-time pass → allowed (countdown not started yet
         — frontend shows full duration as available; actual countdown
         begins when /clarity/start activates it)
      6. Nothing matches        → NOT allowed, reason=no_pass
    """
    cap_on = is_cap_enabled()

    # 1. Kill switch — when disabled the layer is invisible.
    if not cap_on:
        return VoiceWindow(
            allowed=True,
            seconds_remaining=0,
            tier="unlimited",
            reason="cap_disabled",
            cap_enabled=False,
        )

    # 2. Admin / staff bypass.
    if is_user_unlimited(user_doc):
        return VoiceWindow(
            allowed=True,
            seconds_remaining=0,
            tier="unlimited",
            reason="unlimited",
            cap_enabled=True,
        )

    # 3. Soft-launch free-access window.
    if _free_access_window_active():
        return VoiceWindow(
            allowed=True,
            seconds_remaining=0,
            tier="free_access",
            reason="free_access",
            cap_enabled=True,
        )

    # 4 + 5. Existing pass system (read-only). Mirror the lookup logic
    # used by /api/clarity/access without importing the FastAPI app.
    now_iso = datetime.now(timezone.utc).isoformat()

    # Prefer a live, consumed pass (countdown already running).
    live = await db.clarity_passes.find_one(
        {"user_id": user_id, "expires_at": {"$gt": now_iso}, "consumed": True},
        {"_id": 0},
        sort=[("expires_at", -1)],
    )
    if live:
        return VoiceWindow(
            allowed=True,
            seconds_remaining=_seconds_remaining_iso(live.get("expires_at")),
            tier=live.get("tier"),
            reason="active_pass",
            cap_enabled=True,
        )

    # Season pass (consumed at grant time).
    season = await db.clarity_passes.find_one(
        {
            "user_id": user_id,
            "tier": "season_30days",
            "expires_at": {"$gt": now_iso},
        },
        {"_id": 0},
        sort=[("expires_at", -1)],
    )
    if season:
        return VoiceWindow(
            allowed=True,
            seconds_remaining=_seconds_remaining_iso(season.get("expires_at")),
            tier="season_30days",
            reason="active_pass",
            cap_enabled=True,
        )

    # Unconsumed one-time pass — let the wanderer in; /clarity/start
    # will activate it on the chat side. Voice opens immediately.
    pending = await db.clarity_passes.find_one(
        {
            "user_id": user_id,
            "consumed": False,
            "tier": {"$in": ["30min", "60min"]},
        },
        {"_id": 0},
        sort=[("granted_at", 1)],
    )
    if pending:
        return VoiceWindow(
            allowed=True,
            seconds_remaining=0,  # not yet counting — banner shows "ready"
            tier=pending.get("tier"),
            reason="pending_pass",
            cap_enabled=True,
        )

    # 6. No pass — block.
    return VoiceWindow(
        allowed=False,
        seconds_remaining=0,
        tier=None,
        reason="no_pass",
        cap_enabled=True,
    )
