"""
gumroad_service.py — minimal Gumroad REST API client for setup,
reconciliation, and admin views.

Auth: Bearer access token from Gumroad → Settings → Advanced → Applications.
Token is read from env var GUMROAD_ACCESS_TOKEN.

Used by:
  - scripts/gumroad_setup.py            (one-time setup helper)
  - server.py admin endpoints           (reconciliation + sales view)

Designed for low call volume (max a few requests per day) — no
caching, no retry storms, just a thin wrapper.
"""
from __future__ import annotations

import asyncio
import logging
import os
from typing import Any, Dict, List, Optional

import httpx

logger = logging.getLogger(__name__)

BASE = "https://api.gumroad.com/v2"
TIMEOUT = 20.0


def _token() -> Optional[str]:
    t = (os.environ.get("GUMROAD_ACCESS_TOKEN") or "").strip()
    return t or None


def is_configured() -> bool:
    return _token() is not None


async def _get(path: str, params: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    """Low-level GET. Returns parsed JSON or raises."""
    token = _token()
    if not token:
        raise RuntimeError("GUMROAD_ACCESS_TOKEN not set")
    p = dict(params or {})
    p["access_token"] = token
    async with httpx.AsyncClient(timeout=TIMEOUT) as client:
        r = await client.get(f"{BASE}{path}", params=p)
        r.raise_for_status()
        data = r.json()
        if not data.get("success"):
            raise RuntimeError(f"Gumroad API error on {path}: {data}")
        return data


# ─── Public API ─────────────────────────────────────────────────────

async def fetch_user() -> Dict[str, Any]:
    """GET /user — returns the seller object containing `user.id` (== seller_id)."""
    data = await _get("/user")
    return data.get("user") or {}


async def fetch_products() -> List[Dict[str, Any]]:
    """GET /products — returns the seller's products. Each has
    `short_url`, `name`, `id`, `permalink` (the short slug we need)."""
    data = await _get("/products")
    return data.get("products") or []


async def fetch_sales(
    *,
    after: Optional[str] = None,
    before: Optional[str] = None,
    page_key: Optional[str] = None,
) -> Dict[str, Any]:
    """GET /sales — paginated. `after` and `before` accept YYYY-MM-DD.
    Returns dict with `sales` list and optional `next_page_key`."""
    params: Dict[str, Any] = {}
    if after:
        params["after"] = after
    if before:
        params["before"] = before
    if page_key:
        params["page_key"] = page_key
    return await _get("/sales", params=params)


async def fetch_all_sales_since(after: str) -> List[Dict[str, Any]]:
    """Fetch every sale since `after` (YYYY-MM-DD), walking pages."""
    out: List[Dict[str, Any]] = []
    page_key: Optional[str] = None
    while True:
        chunk = await fetch_sales(after=after, page_key=page_key)
        sales = chunk.get("sales") or []
        out.extend(sales)
        page_key = chunk.get("next_page_key")
        if not page_key or not sales:
            break
        # tiny politeness sleep — Gumroad doesn't rate-limit hard but
        # we keep things calm
        await asyncio.sleep(0.2)
    return out
