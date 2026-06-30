"""
§OPS-HEALTH 2026-06-29 — House Operations System, Phase A
=========================================================

Read-only health probes for every external service Aurin depends on.

DESIGN PRINCIPLES (from Anna's instruction 2026-06-29):
  • Swiss-clockwork precision: each probe has a fixed timeout, a
    deterministic interpretation, and never blocks the event loop.
  • Zero side effects: every probe is a GET or a status-check call;
    never writes, patches, or modifies any external resource.
  • Zero voice minutes burned: ConvAI is probed via the get-signed-url
    endpoint (which is metadata-only — does not start a session).
  • Vendor-agnostic labels: external surfaces report as "Voice Service"
    / "Payment System" / "Database" / "Email Service" — never the
    vendor name. If the vendor changes, this file changes; the
    dashboard stays.
  • Graceful timeout: 5 seconds per probe. A slow probe ≠ a dead
    service; it reports as "degraded".
"""
from __future__ import annotations

import asyncio
import os
import time
from typing import Any

import httpx

# Soft import — db handle is injected by server.py to avoid a cycle.
_db = None


def set_db_handle(db) -> None:
    """server.py calls this once at import time."""
    global _db
    _db = db


# -------------------------------------------------------------- shared --

PROBE_TIMEOUT = 5.0


def _ok(component: str, label: str, detail: str = "") -> dict[str, Any]:
    return {"component": component, "label": label, "status": "ok", "detail": detail}


def _degraded(component: str, label: str, detail: str) -> dict[str, Any]:
    return {"component": component, "label": label, "status": "degraded", "detail": detail}


def _down(component: str, label: str, detail: str) -> dict[str, Any]:
    return {"component": component, "label": label, "status": "down", "detail": detail}


# -------------------------------------------------------------- probes --

async def probe_database() -> dict[str, Any]:
    if _db is None:
        return _down("database", "Database", "db handle not initialised")
    try:
        t0 = time.monotonic()
        await asyncio.wait_for(_db.command("ping"), timeout=PROBE_TIMEOUT)
        ms = int((time.monotonic() - t0) * 1000)
        return _ok("database", "Database", f"ping {ms}ms")
    except asyncio.TimeoutError:
        return _down("database", "Database", "ping timed out")
    except Exception as e:  # noqa: BLE001
        return _down("database", "Database", str(e)[:140])


async def probe_voice_service() -> dict[str, Any]:
    """
    Probes the Voice Service (currently ElevenLabs) without consuming any
    minutes. We hit the lightweight get-signed-url endpoint with Grace's
    agent id — that endpoint only mints a token, it does NOT start a
    conversation. Result is interpreted as follows:

      • HTTP 200                                  → ok        (ConvAI fully usable)
      • HTTP 401 missing_permissions: convai_*    → degraded  (TTS-only key)
      • HTTP 401 invalid_api_key                  → down      (key dead)
      • HTTP 5xx / network                        → down
    """
    api_key = os.getenv("ELEVENLABS_API_KEY", "").strip()
    grace_agent = os.getenv("ELEVENLABS_CONVAI_AGENT_GRACE", "").strip()
    if not api_key:
        return _down("voice", "Voice Service", "no api key configured")
    if not grace_agent:
        return _degraded("voice", "Voice Service", "no primary agent configured")

    url = (
        "https://api.elevenlabs.io/v1/convai/conversation/get-signed-url"
        f"?agent_id={grace_agent}"
    )
    try:
        async with httpx.AsyncClient(timeout=PROBE_TIMEOUT) as client:
            r = await client.get(url, headers={"xi-api-key": api_key})
        if r.status_code == 200:
            return _ok("voice", "Voice Service", "signed-url ok")
        if r.status_code == 401:
            body = r.text[:200]
            if "missing_permissions" in body:
                return _degraded(
                    "voice", "Voice Service",
                    "TTS works; ConvAI scope missing on api key",
                )
            return _down("voice", "Voice Service", f"401 {body}")
        return _down("voice", "Voice Service", f"http {r.status_code}")
    except asyncio.TimeoutError:
        return _down("voice", "Voice Service", "probe timed out")
    except Exception as e:  # noqa: BLE001
        return _down("voice", "Voice Service", str(e)[:140])


async def probe_payment_system() -> dict[str, Any]:
    """
    Probes the Payment System (currently Polar). We call a read-only
    products list endpoint — never a checkout endpoint. Polar's products
    list never charges, never creates sessions, never modifies state.
    """
    mode = os.getenv("POLAR_MODE", "sandbox").strip().lower()
    if mode == "production":
        token = os.getenv("POLAR_PRODUCTION_OAT", "").strip()
        base = "https://api.polar.sh"
    else:
        token = os.getenv("POLAR_SANDBOX_OAT", "").strip()
        base = "https://sandbox-api.polar.sh"
    if not token:
        return _down("payment", "Payment System", f"no {mode} token")

    try:
        async with httpx.AsyncClient(timeout=PROBE_TIMEOUT) as client:
            r = await client.get(
                f"{base}/v1/products/",
                headers={"Authorization": f"Bearer {token}"},
                params={"limit": 1},
            )
        if r.status_code in (200, 201):
            return _ok("payment", "Payment System", f"{mode} mode ok")
        if r.status_code in (401, 403):
            return _down("payment", "Payment System", f"auth {r.status_code}")
        return _degraded("payment", "Payment System", f"http {r.status_code}")
    except asyncio.TimeoutError:
        return _down("payment", "Payment System", "probe timed out")
    except Exception as e:  # noqa: BLE001
        return _down("payment", "Payment System", str(e)[:140])


async def probe_email_service() -> dict[str, Any]:
    """
    Probes the Email Service (currently Resend). Read-only check on
    /domains endpoint. Never sends a real email.
    """
    key = os.getenv("RESEND_API_KEY", "").strip()
    if not key:
        return _degraded("email", "Email Service", "not configured")
    try:
        async with httpx.AsyncClient(timeout=PROBE_TIMEOUT) as client:
            r = await client.get(
                "https://api.resend.com/domains",
                headers={"Authorization": f"Bearer {key}"},
            )
        if r.status_code == 200:
            return _ok("email", "Email Service", "domains api ok")
        return _down("email", "Email Service", f"http {r.status_code}")
    except asyncio.TimeoutError:
        return _down("email", "Email Service", "probe timed out")
    except Exception as e:  # noqa: BLE001
        return _down("email", "Email Service", str(e)[:140])


async def probe_backend_self() -> dict[str, Any]:
    """Backend liveness — always ok if this code runs."""
    return _ok("backend", "Backend API", "uvicorn alive")


async def probe_story_library() -> dict[str, Any]:
    """
    Story Library — read the configured collections to confirm they
    exist and are reachable.
    """
    if _db is None:
        return _down("story_library", "Story Library", "db handle not initialised")
    try:
        for col in ("clarity_sessions", "users"):
            await asyncio.wait_for(_db[col].count_documents({}, limit=1), timeout=PROBE_TIMEOUT)
        return _ok("story_library", "Story Library", "collections reachable")
    except asyncio.TimeoutError:
        return _down("story_library", "Story Library", "count timed out")
    except Exception as e:  # noqa: BLE001
        return _down("story_library", "Story Library", str(e)[:140])


# -------------------------------------------------------------- aggregator --

async def collect_status() -> dict[str, Any]:
    """
    Runs all probes in parallel. Returns a single dashboard payload.

    The dashboard payload contains:
      • generated_at       — server time
      • overall            — 'ok' | 'degraded' | 'down'
      • components[]       — one row per service
      • metrics{}          — simple counters (visitors today, etc.)
    """
    t0 = time.monotonic()
    results = await asyncio.gather(
        probe_backend_self(),
        probe_database(),
        probe_voice_service(),
        probe_payment_system(),
        probe_email_service(),
        probe_story_library(),
        return_exceptions=False,
    )
    elapsed_ms = int((time.monotonic() - t0) * 1000)

    statuses = {row["status"] for row in results}
    if "down" in statuses:
        overall = "down"
    elif "degraded" in statuses:
        overall = "degraded"
    else:
        overall = "ok"

    # Lightweight metrics — never blocks if a counter is unavailable.
    metrics: dict[str, Any] = {}
    if _db is not None:
        try:
            from datetime import datetime, timezone, timedelta
            day_ago = datetime.now(timezone.utc) - timedelta(hours=24)
            metrics["pageviews_24h"] = await _db.pageviews.count_documents(
                {"ts": {"$gte": day_ago}}
            )
        except Exception:  # noqa: BLE001
            metrics["pageviews_24h"] = None

    return {
        "generated_at": time.time(),
        "elapsed_ms": elapsed_ms,
        "overall": overall,
        "components": results,
        "metrics": metrics,
    }
