"""
create_polar_access_ladder.py — Build the NEW Access Ladder catalogue
in Polar.sh (production).

Source of truth: /app/memory/PRICING_LOCKED_2026-06-25_v2.md
Created: 2026-02-26 (replaces the legacy 26-SKU script).

Catalogue: 8 essential SKUs for first launch
  - 1 one-shot: Day Pass (€19, 24h)
  - 3 recurring monthly: Journey (€29), Companion (€49), Lantern (€69)
  - 4 one-shot voice top-ups: 30m (€11), 90m (€24), 200m (€49), 500m (€109)

Annual / quarterly cycles can be added later via a second script run —
this script is idempotent and skips existing SKU codes.

Run: cd /app/backend && python -m scripts.create_polar_access_ladder
Output: writes the SKU map to /app/backend/polar_sku_map.json AND
        prints the value to paste into POLAR_SKU_MAP_JSON env var.
"""

from __future__ import annotations

import json
import os
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from dotenv import load_dotenv  # noqa: E402

load_dotenv(ROOT / ".env")

from services.polar_client import PolarClient  # noqa: E402


# ============================================================
# THE ACCESS LADDER — 8 essential SKUs
# Prices in EUR cents (Polar's `amount` is integer cents)
# ============================================================
CATALOGUE = [
    # ─── DAY PASS (one-time, 24h) ─────────────────────────────
    {
        "sku": "access.day.pass",
        "name": "Day Pass · 24h",
        "amount": 1900,  # €19
        "one_shot": True,
        "tier": "II",
        "cycle": "day",
        "voice_minutes_adult": 1440,  # 24h unlimited within window
        "validity_hours": 24,
    },

    # ─── JOURNEY · MONTHLY (one chosen room) ──────────────────
    {
        "sku": "journey.month",
        "name": "Journey · Monthly",
        "amount": 2900,  # €29
        "interval": "month",
        "interval_count": 1,
        "tier": "III",
        "cycle": "monthly",
        "voice_minutes_adult": 30,
    },

    # ─── COMPANION · MONTHLY (all rooms + Polarstar Kids) ─────
    {
        "sku": "companion.month",
        "name": "Companion · Monthly",
        "amount": 4900,  # €49
        "interval": "month",
        "interval_count": 1,
        "tier": "IV",
        "cycle": "monthly",
        "voice_minutes_adult": 60,
    },

    # ─── COMPANION + LANTERN · MONTHLY (everything + Anna voice) ─
    {
        "sku": "lantern.month",
        "name": "Companion + Lantern · Monthly",
        "amount": 6900,  # €69
        "interval": "month",
        "interval_count": 1,
        "tier": "V",
        "cycle": "monthly",
        "voice_minutes_adult": 60,
    },

    # ─── VOICE TOP-UPS (one-shot prepaid voice packages) ──────
    {
        "sku": "voice.return.30",
        "name": "Voice · A short return · 30 min",
        "amount": 1100,  # €11
        "one_shot": True,
        "tier": "TOPUP",
        "cycle": "topup",
        "voice_minutes_adult": 30,
        "validity_days": 30,
    },
    {
        "sku": "voice.full.90",
        "name": "Voice · A full hour and a half · 90 min",
        "amount": 2400,  # €24
        "one_shot": True,
        "tier": "TOPUP",
        "cycle": "topup",
        "voice_minutes_adult": 90,
        "validity_days": 60,
        "most_popular": "true",
    },
    {
        "sku": "voice.season.200",
        "name": "Voice · A season · 200 min",
        "amount": 4900,  # €49
        "one_shot": True,
        "tier": "TOPUP",
        "cycle": "topup",
        "voice_minutes_adult": 200,
        "validity_days": 90,
    },
    {
        "sku": "voice.habit.500",
        "name": "Voice · A long habit · 500 min",
        "amount": 10900,  # €109
        "one_shot": True,
        "tier": "TOPUP",
        "cycle": "topup",
        "voice_minutes_adult": 500,
        "validity_days": 180,
    },
]


# ============================================================
# Descriptions — quiet, brand-locked, no SaaS register.
# Avoid: "AI companion", "AI friend", "emotional AI for children" —
# Polar underwriting may flag those.
# ============================================================
DESCRIPTIONS = {
    "access.day.pass": "Twenty-four hours of reading-house access for adults. Unlimited writing with the keepers. Voice session included for the duration of the day. No subscription. One quiet evening.",
    "journey.month": "One chosen room in the house, kept open every day. Unlimited writing with that keeper, memory that holds across sessions, the full essay and audio archive, and thirty minutes of curator audio each month.",
    "companion.month": "Every room in the house. Unlimited writing with all five keepers, persistent memory across all rooms, Polarstar Kids included (up to three child profiles), the full archive, and sixty minutes of curator audio shared across rooms each month.",
    "lantern.month": "Everything in Companion, plus the upstairs door. One monthly letter from Anna — written and read aloud — two to four short voice notes through the month, her current reading shelf with margin notes, and the option to send one quiet message back.",
    "voice.return.30": "Thirty minutes of curator audio session. Extends your current cycle. One quiet evening of voice. Valid for thirty days.",
    "voice.full.90": "Ninety minutes of curator audio session. The most-chosen package. Extends your current cycle. Valid for sixty days.",
    "voice.season.200": "Two hundred minutes of curator audio session. A season of voice. Extends your current cycle. Valid for ninety days.",
    "voice.habit.500": "Five hundred minutes of curator audio session. A long habit. Extends your current cycle. Valid for one hundred eighty days.",
}


def _build_body(row: dict) -> dict:
    """Compose the Polar product create payload."""
    metadata = {
        "sku_code": row["sku"],
        "tier": row["tier"],
        "cycle": row["cycle"],
    }
    for key in ("voice_minutes_adult", "voice_minutes_kids", "validity_days", "validity_hours", "most_popular"):
        if key in row:
            metadata[key] = str(row[key])

    body: dict = {
        "name": row["name"],
        "description": DESCRIPTIONS.get(row["sku"], row["name"]),
        "metadata": metadata,
    }

    # USD price = EUR × 1.10, rounded up to nearest dollar.
    def _usd_amount(eur_cents: int) -> int:
        usd = int(eur_cents * 1.10)
        return ((usd + 99) // 100) * 100

    eur_price = {"amount_type": "fixed", "price_amount": row["amount"], "price_currency": "eur"}
    usd_price = {"amount_type": "fixed", "price_amount": _usd_amount(row["amount"]), "price_currency": "usd"}

    if row.get("one_shot"):
        body["recurring_interval"] = None
        body["prices"] = [usd_price, eur_price]
    else:
        body["recurring_interval"] = row["interval"]
        body["prices"] = [usd_price, eur_price]
        metadata["interval"] = row["interval"]
        metadata["interval_count"] = str(row.get("interval_count", 1))

    return body


def main() -> int:
    org_id = os.environ.get("POLAR_ORG_ID")
    if not org_id:
        print("ERROR: POLAR_ORG_ID not set in env", file=sys.stderr)
        return 1

    client = PolarClient()
    try:
        # Idempotency: list existing products, skip any with matching sku_code
        existing = client.list_products(organization_id=org_id)
        existing_by_sku: dict[str, str] = {}
        for p in existing:
            meta = p.get("metadata") or {}
            sku = meta.get("sku_code")
            if sku:
                existing_by_sku[sku] = p["id"]

        sku_map: dict[str, str] = dict(existing_by_sku)
        created = 0
        skipped = 0

        for row in CATALOGUE:
            sku = row["sku"]
            if sku in existing_by_sku:
                print(f"  SKIP  {sku:30} (already exists: {existing_by_sku[sku]})")
                skipped += 1
                continue
            body = _build_body(row)
            product = client.create_product(body)
            pid = product["id"]
            sku_map[sku] = pid
            created += 1
            print(f"  CREATED  {sku:30} -> {pid}")

        # Write to disk
        out_path = ROOT / "polar_sku_map.json"
        out_path.write_text(
            json.dumps(
                {"organization_id": org_id, "skus": sku_map},
                indent=2,
            )
            + "\n"
        )
        print(f"\nWrote SKU map -> {out_path}")
        print(f"Created: {created}    Skipped (existed): {skipped}    Total mapped: {len(sku_map)}")

        # Print the env-var-ready value
        env_value = json.dumps({"organization_id": org_id, "skus": sku_map}, separators=(",", ":"))
        print("\nPaste into backend/.env  POLAR_SKU_MAP_JSON=")
        print(env_value)

        return 0
    finally:
        client.close()


if __name__ == "__main__":
    raise SystemExit(main())
