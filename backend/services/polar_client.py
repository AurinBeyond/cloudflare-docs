"""
polar_client.py — Polar.sh REST API wrapper

Sandbox vs production switched via POLAR_MODE env var.
Used by:
  - scripts/create_polar_products.py (one-shot catalogue build)
  - /api/billing/polar/webhook (signature verification helper)
  - /api/billing/checkout/session (checkout creation, future sprint)

Reference: https://polar.sh/docs/api-reference/introduction
"""

from __future__ import annotations

import os
from typing import Any, Dict, List, Optional

import httpx


def _base_url() -> str:
    mode = (os.environ.get("POLAR_MODE") or "sandbox").lower()
    if mode == "production":
        return "https://api.polar.sh/v1"
    return "https://sandbox-api.polar.sh/v1"


def _token() -> str:
    mode = (os.environ.get("POLAR_MODE") or "sandbox").lower()
    key = (
        os.environ.get("POLAR_PRODUCTION_OAT")
        if mode == "production"
        else os.environ.get("POLAR_SANDBOX_OAT")
    )
    if not key:
        raise RuntimeError(
            f"Polar OAT missing for mode={mode}. Set POLAR_{mode.upper()}_OAT in backend/.env"
        )
    return key


def webhook_secret() -> str:
    mode = (os.environ.get("POLAR_MODE") or "sandbox").lower()
    secret = (
        os.environ.get("POLAR_PRODUCTION_WEBHOOK_SECRET")
        if mode == "production"
        else os.environ.get("POLAR_SANDBOX_WEBHOOK_SECRET")
    )
    if not secret:
        raise RuntimeError(
            f"Polar webhook secret missing for mode={mode}."
        )
    return secret


class PolarClient:
    """Synchronous Polar API client. Async wrapper added in next sprint
    when checkout-session creation is wired into FastAPI routes."""

    def __init__(self, timeout: float = 20.0) -> None:
        self.base_url = _base_url()
        self._client = httpx.Client(
            base_url=self.base_url,
            headers={
                "Authorization": f"Bearer {_token()}",
                "Content-Type": "application/json",
                "Accept": "application/json",
            },
            timeout=timeout,
            follow_redirects=True,
        )

    # ----- products -----
    def create_product(self, body: Dict[str, Any]) -> Dict[str, Any]:
        resp = self._client.post("/products", json=body)
        if resp.status_code >= 400:
            raise RuntimeError(
                f"Polar create_product failed: {resp.status_code} {resp.text}"
            )
        return resp.json()

    def list_products(self, organization_id: Optional[str] = None) -> List[Dict[str, Any]]:
        params: Dict[str, Any] = {"limit": 100}
        if organization_id:
            params["organization_id"] = organization_id
        resp = self._client.get("/products", params=params)
        resp.raise_for_status()
        data = resp.json()
        return data.get("items", []) if isinstance(data, dict) else data

    def archive_product(self, product_id: str) -> Dict[str, Any]:
        resp = self._client.patch(
            f"/products/{product_id}",
            json={"is_archived": True},
        )
        resp.raise_for_status()
        return resp.json()

    # ----- organisations -----
    def list_organisations(self) -> List[Dict[str, Any]]:
        resp = self._client.get("/organizations")
        resp.raise_for_status()
        data = resp.json()
        return data.get("items", []) if isinstance(data, dict) else data

    def close(self) -> None:
        self._client.close()
