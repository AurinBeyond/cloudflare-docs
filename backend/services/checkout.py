"""
checkout.py — Polar.sh hosted-checkout session creator.

The frontend (gate or top-up shelf) calls our /api/billing/checkout/session
endpoint. We resolve the requested sku_code → polar_product_id (from
polar_sku_map.json), then POST to Polar's /v1/checkouts/ with the
authenticated user attached as `customer_external_id`. Polar replies
with a hosted checkout URL we return to the frontend for redirect.

This module is import-clean (no FastAPI imports) so it can be re-used
by jobs or test fixtures.
"""
from __future__ import annotations

import json
from functools import lru_cache
from pathlib import Path
from typing import Any, Dict, Optional

import httpx

from services.polar_client import PolarClient

ROOT = Path(__file__).resolve().parents[1]
SKU_MAP_PATH = ROOT / "polar_sku_map.json"


@lru_cache(maxsize=1)
def load_sku_map() -> Dict[str, Any]:
    if not SKU_MAP_PATH.exists():
        return {"organization_id": "", "skus": {}}
    return json.loads(SKU_MAP_PATH.read_text())


def sku_to_product_id(sku_code: str) -> Optional[str]:
    return load_sku_map().get("skus", {}).get(sku_code)


def create_checkout(
    *,
    sku_code: str,
    user_id: str,
    customer_email: Optional[str],
    success_url: str,
    metadata: Optional[Dict[str, str]] = None,
) -> Dict[str, Any]:
    """Build a Polar hosted-checkout session and return Polar's reply.

    The hosted URL is at `response["url"]`.

    `customer_external_id` is our user_id so the webhook can route the
    purchase straight back to the right wallet.
    """
    product_id = sku_to_product_id(sku_code)
    if not product_id:
        raise ValueError(f"Unknown sku_code: {sku_code}")

    body: Dict[str, Any] = {
        "products": [product_id],
        "customer_external_id": user_id,
        "success_url": success_url,
        "metadata": {
            "sku_code": sku_code,
            "user_id": user_id,
            **(metadata or {}),
        },
        "embed_origin": None,
    }
    # Only forward an email if it is a real, routable address. Polar's
    # email validator rejects synthetic guest emails (e.g. RFC-6761
    # reserved domains like `*.aurin.local`, `*.guest.local`, etc.),
    # so we let Polar's checkout page collect a fresh one from the
    # buyer in those cases.
    if customer_email and _is_real_routable_email(customer_email):
        body["customer_email"] = customer_email

    client = PolarClient()
    try:
        resp = client._client.post("/checkouts/", json=body)
        if resp.status_code >= 400:
            raise RuntimeError(f"Polar checkout creation failed: {resp.status_code} {resp.text}")
        return resp.json()
    finally:
        client.close()


def _is_real_routable_email(email: str) -> bool:
    """Quiet guard against synthetic / reserved domains that fail at
    Polar's validator. Returns True only for emails whose domain is
    plausibly routable. Conservative — we'd rather drop a real one
    than hand Polar a fake."""
    if not email or "@" not in email:
        return False
    local, _, domain = email.partition("@")
    if not local or not domain:
        return False
    domain = domain.lower()
    # RFC 6761 special-use + common throwaway patterns
    reserved_suffixes = (
        ".local", ".localhost", ".test", ".example", ".invalid", ".internal",
    )
    if any(domain == s.lstrip(".") or domain.endswith(s) for s in reserved_suffixes):
        return False
    # Guest stamps we mint server-side
    if "guest." in domain or domain.startswith("guest."):
        return False
    if "." not in domain:
        return False
    return True
