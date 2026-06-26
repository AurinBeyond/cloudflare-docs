"""§PAYMENT-ABSTRACTION 2026-02-11 — SKU mapping.

Anna's Faas 1B scope: ONLY 3 SKUs.
NO 49 SKU bulk import. NO production switchover.

Each SKU maps to two Polar product IDs (sandbox + production)
because Polar.sh treats sandbox and production as fully separate
environments.

When Anna creates her Polar.sh account and the 3 sandbox products,
fill in the IDs below (or set via env POLAR_SKU_MAP_JSON to override).

Until that's done, `polar_product_for_sku()` returns None for prod
or returns sandbox placeholder for sandbox — webhook handler still
processes valid-format payloads for testing.
"""

from __future__ import annotations

import os
import json
import logging
from typing import Optional

logger = logging.getLogger("aurin.payment.sku")


# 3 SKUs Anna approved for Faas 1B sandbox.
SKU_REGISTRY = {
    "body_temple": {
        "name": "Body Temple Lifetime",
        "type": "one_time",
        "price_usd": 39.00,
        "voice_seconds_granted": 0,         # body unlock, not voice
        "body_temple_unlock": True,
    },
    "topup_60min": {
        "name": "Voice Top-up · 60 minutes",
        "type": "one_time",
        "price_usd": 39.00,
        "voice_seconds_granted": 60 * 60,   # 3600s
        "body_temple_unlock": False,
    },
    "eternal_monthly": {
        "name": "Eternal House · Monthly",
        "type": "recurring",
        "price_usd": 89.00,
        "voice_seconds_granted_per_cycle": 300 * 60,  # 300 min/month
        "body_temple_unlock": True,
    },
}


def _load_polar_id_map() -> dict:
    """Load polar product id map from env POLAR_SKU_MAP_JSON OR
    fallback to the file's defaults.

    Format:
        {
          "sandbox": {"body_temple": "uuid", "topup_60min": "uuid", "eternal_monthly": "uuid"},
          "production": {"body_temple": "uuid", ...}
        }
    """
    raw = os.environ.get("POLAR_SKU_MAP_JSON")
    if raw:
        try:
            return json.loads(raw)
        except json.JSONDecodeError as exc:
            logger.warning("POLAR_SKU_MAP_JSON parse failed: %s", exc)

    # Defaults — placeholders until Anna creates Polar products.
    return {
        "sandbox": {
            "body_temple": "",
            "topup_60min": "",
            "eternal_monthly": "",
        },
        "production": {
            "body_temple": "",
            "topup_60min": "",
            "eternal_monthly": "",
        },
    }


def polar_product_for_sku(sku: str, mode: str = "sandbox") -> Optional[str]:
    """Return Polar product UUID for a given internal SKU + mode."""
    if sku not in SKU_REGISTRY:
        return None
    m = _load_polar_id_map()
    return (m.get(mode) or {}).get(sku) or None


def sku_for_polar_product(product_id: str, mode: str = "sandbox") -> Optional[str]:
    """Reverse lookup: Polar product UUID → internal SKU."""
    if not product_id:
        return None
    m = _load_polar_id_map().get(mode) or {}
    for sku, pid in m.items():
        if pid == product_id:
            return sku
    return None


def list_skus() -> list[dict]:
    """For admin/debug visibility — list all configured SKUs."""
    m = _load_polar_id_map()
    out = []
    for sku, spec in SKU_REGISTRY.items():
        out.append({
            "sku": sku,
            **spec,
            "polar_sandbox_id": (m.get("sandbox") or {}).get(sku) or "",
            "polar_production_id": (m.get("production") or {}).get(sku) or "",
        })
    return out
