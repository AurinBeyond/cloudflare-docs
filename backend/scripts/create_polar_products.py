"""
create_polar_products.py — Build the Matrix Aurin membership catalogue
in Polar.sh sandbox (or production once POLAR_MODE is switched).

Source of truth: /app/memory/MEMBERSHIP_ARCHITECTURE_v2.3.md
                /app/memory/MEMBERSHIP_ARCHITECTURE_v2.3.1_PATCH.md

Catalogue size: 24 SKUs
  - 12 recurring bundles (4 bundles × 3 periods: monthly / quarterly / yearly)
  - 4 Sovereign tiers (Standard + Bespoke × quarter + year)
  - 3 day-passes (Kids / Quiet / Deep — single-charge)
  - 7 top-ups (3 adult-voice + 3 child-voice + 1 day-pass extension)

Run: `cd /app/backend && python -m scripts.create_polar_products`

Output:
  /app/backend/polar_sku_map.json  — sku_code → Polar product_id

The script is idempotent: if a SKU with the same sku_code already exists
on the organisation, it is skipped (re-running won't duplicate products).
"""

from __future__ import annotations

import json
import os
import sys
from pathlib import Path

# Make services.polar_client importable when run as `python -m scripts.create_polar_products`
ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from dotenv import load_dotenv  # noqa: E402

load_dotenv(ROOT / ".env")

from services.polar_client import PolarClient  # noqa: E402


# ============================================================
# Catalogue — every number anchored in v2.3.1 §3 (margins audited)
# ============================================================
# Price unit = EUR cents (Polar's `amount` is integer cents)
CATALOGUE = [
    # ─── RECURRING BUNDLES ──────────────────────────────────
    # Quiet Entry
    {"sku": "quiet.entry.month",       "name": "Quiet Entry · Monthly",       "amount":   8900, "interval": "month",   "interval_count": 1,  "bundle": "quiet_entry",       "tier": "I",   "cycle": "monthly"},
    {"sku": "quiet.entry.quarter",     "name": "Quiet Entry · Quarterly",     "amount":  23900, "interval": "month",   "interval_count": 3,  "bundle": "quiet_entry",       "tier": "I",   "cycle": "quarterly"},
    {"sku": "quiet.entry.year",        "name": "Quiet Entry · Annual",        "amount":  89000, "interval": "year",    "interval_count": 1,  "bundle": "quiet_entry",       "tier": "I",   "cycle": "annual"},
    # Aurin Storyteller
    {"sku": "aurin.storyteller.month",    "name": "Aurin Storyteller · Monthly",   "amount":   7900, "interval": "month", "interval_count": 1, "bundle": "aurin_storyteller", "tier": "II",  "cycle": "monthly"},
    {"sku": "aurin.storyteller.quarter",  "name": "Aurin Storyteller · Quarterly", "amount":  20900, "interval": "month", "interval_count": 3, "bundle": "aurin_storyteller", "tier": "II",  "cycle": "quarterly"},
    {"sku": "aurin.storyteller.year",     "name": "Aurin Storyteller · Annual",    "amount":  79000, "interval": "year",  "interval_count": 1, "bundle": "aurin_storyteller", "tier": "II",  "cycle": "annual"},
    # Inner Compass
    {"sku": "inner.compass.month",     "name": "Inner Compass · Monthly",     "amount":  22900, "interval": "month",   "interval_count": 1,  "bundle": "inner_compass",     "tier": "III", "cycle": "monthly"},
    {"sku": "inner.compass.quarter",   "name": "Inner Compass · Quarterly",   "amount":  61900, "interval": "month",   "interval_count": 3,  "bundle": "inner_compass",     "tier": "III", "cycle": "quarterly"},
    {"sku": "inner.compass.year",      "name": "Inner Compass · Annual",      "amount": 229000, "interval": "year",    "interval_count": 1,  "bundle": "inner_compass",     "tier": "III", "cycle": "annual"},
    # House Compass
    {"sku": "sanctuary.compass.month",   "name": "House Compass · Monthly",   "amount":  32900, "interval": "month", "interval_count": 1, "bundle": "house_compass", "tier": "IV",  "cycle": "monthly"},
    {"sku": "sanctuary.compass.quarter", "name": "House Compass · Quarterly", "amount":  88900, "interval": "month", "interval_count": 3, "bundle": "house_compass", "tier": "IV",  "cycle": "quarterly"},
    {"sku": "sanctuary.compass.year",    "name": "House Compass · Annual",    "amount": 329000, "interval": "year",  "interval_count": 1, "bundle": "house_compass", "tier": "IV",  "cycle": "annual"},

    # ─── SOVEREIGN CIRCLE (application-gated) ──────────────
    {"sku": "sovereign.standard.quarter",  "name": "Sovereign Circle · Standard · Quarterly", "amount":  189000, "interval": "month", "interval_count": 3, "bundle": "sovereign_standard", "tier": "V-S", "cycle": "quarterly"},
    {"sku": "sovereign.standard.year",     "name": "Sovereign Circle · Standard · Annual",    "amount":  680000, "interval": "year",  "interval_count": 1, "bundle": "sovereign_standard", "tier": "V-S", "cycle": "annual"},
    {"sku": "sovereign.bespoke.quarter",   "name": "Sovereign Circle · Bespoke · Quarterly",  "amount":  349000, "interval": "month", "interval_count": 3, "bundle": "sovereign_bespoke",  "tier": "V-B", "cycle": "quarterly"},
    {"sku": "sovereign.bespoke.year",      "name": "Sovereign Circle · Bespoke · Annual",     "amount": 1250000, "interval": "year",  "interval_count": 1, "bundle": "sovereign_bespoke",  "tier": "V-B", "cycle": "annual"},

    # ─── DAY PASSES (one-shot, no recurrence) ──────────────
    {"sku": "access.day.kids",    "name": "Kids Day Pass · 24h", "amount":  2500, "one_shot": True, "bundle": "day_kids",   "tier": "DAY", "cycle": "day", "voice_minutes_kids": 10},
    {"sku": "access.day.quiet",   "name": "Quiet Day Pass · 24h", "amount": 4900, "one_shot": True, "bundle": "day_quiet",  "tier": "DAY", "cycle": "day", "voice_minutes_adult": 30},
    {"sku": "access.day.deep",    "name": "Deep Day Pass · 24h",  "amount": 8900, "one_shot": True, "bundle": "day_deep",   "tier": "DAY", "cycle": "day", "voice_minutes_adult": 60},

    # ─── TOP-UPS (one-shot, prepaid voice transmission packages) ──
    {"sku": "topup.compass.30",   "name": "Adult Voice Pack · 30 min",  "amount":  4900, "one_shot": True, "bundle": "topup_adult", "tier": "TOPUP", "cycle": "topup", "voice_minutes_adult": 30,  "validity_days": 30},
    {"sku": "topup.compass.120",  "name": "Adult Voice Pack · 120 min", "amount": 15900, "one_shot": True, "bundle": "topup_adult", "tier": "TOPUP", "cycle": "topup", "voice_minutes_adult": 120, "validity_days": 60},
    {"sku": "topup.compass.300",  "name": "Adult Voice Pack · 300 min", "amount": 39900, "one_shot": True, "bundle": "topup_adult", "tier": "TOPUP", "cycle": "topup", "voice_minutes_adult": 300, "validity_days": 90},
    {"sku": "topup.aurin.20",     "name": "Aurin Voice Pack · 20 min",  "amount":  2900, "one_shot": True, "bundle": "topup_kids",  "tier": "TOPUP", "cycle": "topup", "voice_minutes_kids":  20,  "validity_days": 30},
    {"sku": "topup.aurin.60",     "name": "Aurin Voice Pack · 60 min",  "amount":  7900, "one_shot": True, "bundle": "topup_kids",  "tier": "TOPUP", "cycle": "topup", "voice_minutes_kids":  60,  "validity_days": 60},
    {"sku": "topup.aurin.150",    "name": "Aurin Voice Pack · 150 min", "amount": 16900, "one_shot": True, "bundle": "topup_kids",  "tier": "TOPUP", "cycle": "topup", "voice_minutes_kids":  150, "validity_days": 90},
    {"sku": "topup.daypass.30",   "name": "Day Pass Extension · 30 min",  "amount": 4000, "one_shot": True, "bundle": "topup_daypass", "tier": "TOPUP", "cycle": "topup", "voice_minutes_adult": 30, "validity_hours": 24},
]

assert len(CATALOGUE) == 26, f"Expected 26 catalogue rows (12 recurring + 4 sovereign + 3 daypass + 7 topup) but we have {len(CATALOGUE)}. Re-check."


# ============================================================
# Description templates — quiet, brand-locked, no SaaS register
# ============================================================
def _build_description(row: dict) -> str:
    bundle = row["bundle"]
    cycle = row.get("cycle", "")
    # NB: descriptions deliberately avoid "AI companion", "AI friend",
    # "children chat with AI", "emotional AI for children" — Polar
    # underwriting flagged those as high-risk classifiers. We rephrase
    # toward parent-guided activities, storytelling, calm audio,
    # creative family experiences, and educational prompts.
    descriptions = {
        "quiet_entry":       "A reading house for adults. All four cardinal rooms in read mode, the daily cadence stream of curator letters, and access to the full archive of essays and audio meditations.",
        "aurin_storyteller": "Parent-guided bedtime storytelling and creative family experiences. Calm audio stories, drawing prompts, and guided imagination exercises for one child profile under a verified parent account. Storytelling and educational prompts only.",
        "inner_compass":     "The platform's heart. Live curator dialogue for adults, memory continuity across sessions, and the full essay and audio archive.",
        "house_compass": "A family operating system. The adult house plus parent-guided bedtime storytelling and creative activities for up to three child profiles. Two separate wallets keep adult dialogue and child storytelling independent.",
        "sovereign_standard": "A privately provisioned tenant. One curator tuned to the member's context. Higher fair-use ceilings, priority routing, earlier access to new rooms. By application.",
        "sovereign_bespoke":  "All four curators tuned. The deepest privilege tier. Up to five child profiles for parent-guided bedtime storytelling within one family. By application.",
        "day_kids":      "A quiet bedtime passage. One calm audio story plus one parent-guided check-in. Twenty-four hours of access. No subscription. Storytelling only.",
        "day_quiet":     "Twenty-four hours of reading-house access for adults. Thirty minutes of curator audio session. No subscription.",
        "day_deep":      "Twenty-four hours of full Compass access for adults. Sixty minutes of curator audio session. No subscription.",
        "topup_adult":   "Prepaid curator audio session package for adults. Extends the current Compass cycle with additional dialogue minutes.",
        "topup_kids":    "Prepaid bedtime storytelling minutes for the parent-guided child layer. Applies to the storytelling wallet only.",
        "topup_daypass": "Extends an active day pass by thirty minutes of curator audio for adults. Same twenty-four-hour window.",
    }
    return descriptions.get(bundle, row["name"])


def _build_body(row: dict, organization_id: str | None) -> dict:
    """Compose the Polar product create payload per v2.3.1 catalogue."""
    metadata = {
        "sku_code": row["sku"],
        "bundle": row["bundle"],
        "tier": row["tier"],
        "cycle": row["cycle"],
    }
    for key in ("voice_minutes_adult", "voice_minutes_kids", "validity_days", "validity_hours"):
        if key in row:
            metadata[key] = str(row[key])  # Polar metadata values must be strings

    body: dict = {
        "name": row["name"],
        "description": _build_description(row),
        "metadata": metadata,
    }
    # NB: Polar's OAT already implicitly scopes to the organisation that
    # issued it; sending `organization_id` in the body is rejected with
    # `organization_token` validation error. We keep `organization_id`
    # for the list_products() filter only, not in create payload.

    # Prices: one-shot vs recurring
    # NB: Polar's sandbox org default presentment currency is USD; we must
    # include a USD price even though our primary positioning is EUR.
    # Polar Checkout will show the customer the price in their IP-derived
    # currency automatically. USD amount is computed as EUR × 1.10 (round up
    # to nearest €5/100 for tidy pricing).
    def _usd_amount(eur_cents: int) -> int:
        usd = int(eur_cents * 1.10)
        # round up to nearest 100 (=1 dollar) for tidiness
        return ((usd + 99) // 100) * 100

    eur_price = {
        "amount_type": "fixed",
        "price_amount": row["amount"],
        "price_currency": "eur",
    }
    usd_price = {
        "amount_type": "fixed",
        "price_amount": _usd_amount(row["amount"]),
        "price_currency": "usd",
    }

    if row.get("one_shot"):
        body["recurring_interval"] = None
        body["prices"] = [usd_price, eur_price]
    else:
        interval = row["interval"]
        count = row.get("interval_count", 1)
        body["recurring_interval"] = interval
        body["prices"] = [usd_price, eur_price]
        # Carry interval_count in metadata too so our webhook can interpret cycles.
        metadata["interval"] = interval
        metadata["interval_count"] = str(count)

    return body


def main() -> int:
    client = PolarClient()

    # Resolve organisation id (POLAR_ORG_ID env override, or auto-pick first org)
    org_id = os.environ.get("POLAR_ORG_ID")
    if not org_id:
        orgs = client.list_organisations()
        if not orgs:
            print("ERROR: no Polar organisations visible for this OAT. Aborting.", file=sys.stderr)
            return 1
        org_id = orgs[0]["id"]
        print(f"Using auto-detected organisation: {orgs[0].get('slug', org_id)}  (id={org_id})")

    # Pre-check: list existing products to make this script idempotent
    existing = client.list_products(organization_id=org_id)
    existing_by_sku = {
        (p.get("metadata") or {}).get("sku_code"): p["id"]
        for p in existing
        if (p.get("metadata") or {}).get("sku_code")
    }
    print(f"Found {len(existing_by_sku)} existing SKUs in this organisation.")

    sku_map: dict[str, str] = dict(existing_by_sku)
    created, skipped, failed = 0, 0, 0

    import time

    for row in CATALOGUE:
        sku = row["sku"]
        if sku in existing_by_sku:
            print(f"  ⏭  {sku:40s} already exists ({existing_by_sku[sku]})")
            skipped += 1
            continue
        body = _build_body(row, org_id)
        try:
            product = client.create_product(body)
            sku_map[sku] = product["id"]
            print(f"  ✓  {sku:40s} created ({product['id']})  €{row['amount']/100:.2f}")
            created += 1
        except Exception as exc:
            print(f"  ✗  {sku:40s} FAILED: {exc}", file=sys.stderr)
            failed += 1
        # Sandbox rate limit = 100 req/min. Pause 0.7 s between creates → ~85/min ceiling.
        time.sleep(0.7)

    # Write the sku_map for backend webhook + checkout to consume
    out_path = ROOT / "polar_sku_map.json"
    out_path.write_text(json.dumps({"organization_id": org_id, "skus": sku_map}, indent=2))
    print(f"\nWrote SKU map → {out_path}")
    print(f"\nSummary: created={created} · skipped(existing)={skipped} · failed={failed}")
    client.close()
    return 0 if failed == 0 else 2


if __name__ == "__main__":
    sys.exit(main())
