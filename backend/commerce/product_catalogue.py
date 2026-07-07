"""
Aurin Commerce — Provider-neutral Product Catalogue

§COMMERCE-CLEANUP 2026-02 — single source of truth for every live SKU.
Replaces the fragmented state that existed before:
    - payment_providers/sku_mapping.py  (3 stale SKUs, old names)
    - services/billing_webhook.py::SKU_RULES  (30+ SKUs, mostly dead)
    - backend/polar_sku_map.json  (8 SKUs, matches this file — provider IDs live there)

Every other module (billing_webhook, checkout, admin) MUST read from
this catalogue. No SKU may be defined outside this file.

Currency policy: EUR. Norway ENK bills EUR; primary market is EU;
Creem MoR supports EUR. Non-EUR pricing anywhere is a bug.

Fee/tax policy: prices below are what the visitor sees at checkout.
MoR (Polar today; Creem tomorrow) computes VAT/MVA on top per
customer location and remits it. This module does not do tax math.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Dict, Optional


# ─── Product type constants ────────────────────────────────────────────

ONE_SHOT = "one_shot"          # single purchase, single grant
RECURRING = "recurring"        # subscription with periodic re-grant


# ─── Access category ─────────────────────────────────────────────────
#   ACCESS  = time in the house (Day, Journey, Companion, Lantern)
#   VOICE   = metered voice-conversation wallet top-ups
#   BOOK    = one-off digital-book purchases (Bookstore)
#
# NOTE: Anna's HOUSE_COMMERCE_LOGIC.md rule — Access and Voice live in
# different units and never collapse. Voice minutes bundled into an
# Access tier are still tracked in the voice wallet, never as an
# Access feature.

CATEGORY_ACCESS = "access"
CATEGORY_VOICE = "voice"
CATEGORY_BOOK = "book"


@dataclass(frozen=True)
class ProductSpec:
    """Single canonical definition of a purchasable product."""
    sku: str                              # canonical, provider-neutral
    display_name: str                     # human label
    category: str                         # access | voice | book
    product_type: str                     # one_shot | recurring
    price_eur: float                      # net price, VAT added by MoR
    # ── entitlements ────
    adult_voice_minutes: int = 0          # per grant (per period for recurring)
    kids_voice_minutes: int = 0
    validity_days: int = 0                # 0 = forever (subscriptions use billing_period)
    # ── flags ───────────
    lantern_included: bool = False        # Anna's intimate content layer
    body_temple_unlock: bool = False      # legacy Body Temple lifetime flag
    kids_content_included: bool = False   # Companion / Lantern give kids-content access
    cohort_flag: Optional[str] = None     # "founding" etc. — set only if seats remain
    launch_price_eur: Optional[float] = None    # soft-launch price (Substack, etc.)
    notes: str = ""


# ─── LIVE CATALOGUE ─────────────────────────────────────────────────
#
# 8 launch SKUs (4 access tiers + 4 voice top-ups) + Bookstore SKUs.
# When a new product ships, add it HERE first. Then map it to the
# provider (Polar/Creem) in the provider-specific ID map JSON.
#
# The list order below is the order the visitor sees on Pricing.jsx.

CATALOGUE: Dict[str, ProductSpec] = {
    # ── Access tiers ──────────────────────────────────────────────
    "access.day.pass": ProductSpec(
        sku="access.day.pass",
        display_name="Day Access",
        category=CATEGORY_ACCESS,
        product_type=ONE_SHOT,
        price_eur=25.00,
        launch_price_eur=19.00,
        adult_voice_minutes=1440,     # 24 h continuous window
        kids_voice_minutes=0,
        validity_days=1,
        notes="24 hours in the house. One-shot.",
    ),
    "journey.month": ProductSpec(
        sku="journey.month",
        display_name="Journey · Monthly",
        category=CATEGORY_ACCESS,
        product_type=RECURRING,
        price_eur=35.00,
        launch_price_eur=29.00,
        adult_voice_minutes=30,       # per cycle
        kids_voice_minutes=0,
        validity_days=35,             # grace period on renewal
        notes="One-room-at-a-time monthly.",
    ),
    "companion.month": ProductSpec(
        sku="companion.month",
        display_name="Companion · Monthly",
        category=CATEGORY_ACCESS,
        product_type=RECURRING,
        price_eur=59.00,
        launch_price_eur=49.00,
        adult_voice_minutes=60,
        kids_voice_minutes=60,
        kids_content_included=True,
        validity_days=35,
        notes="All five rooms · Companion tier.",
    ),
    "lantern.month": ProductSpec(
        sku="lantern.month",
        display_name="Lantern · Monthly",
        category=CATEGORY_ACCESS,
        product_type=RECURRING,
        price_eur=69.00,
        adult_voice_minutes=60,
        kids_voice_minutes=60,
        kids_content_included=True,
        lantern_included=True,
        validity_days=35,
        notes="Companion + Anna's Lantern layer.",
    ),

    # ── Voice top-ups ─────────────────────────────────────────────
    "voice.return.30": ProductSpec(
        sku="voice.return.30",
        display_name="Voice · 30 minutes",
        category=CATEGORY_VOICE,
        product_type=ONE_SHOT,
        price_eur=11.00,
        adult_voice_minutes=30,
        validity_days=30,
        notes="A short return.",
    ),
    "voice.full.90": ProductSpec(
        sku="voice.full.90",
        display_name="Voice · 90 minutes",
        category=CATEGORY_VOICE,
        product_type=ONE_SHOT,
        price_eur=24.00,
        adult_voice_minutes=90,
        validity_days=60,
        notes="A full hour and a half.",
    ),
    "voice.season.200": ProductSpec(
        sku="voice.season.200",
        display_name="Voice · 200 minutes",
        category=CATEGORY_VOICE,
        product_type=ONE_SHOT,
        price_eur=49.00,
        adult_voice_minutes=200,
        validity_days=90,
        notes="A season.",
    ),
    "voice.habit.500": ProductSpec(
        sku="voice.habit.500",
        display_name="Voice · 500 minutes",
        category=CATEGORY_VOICE,
        product_type=ONE_SHOT,
        price_eur=109.00,
        adult_voice_minutes=500,
        validity_days=180,
        notes="A long habit.",
    ),
}


# ─── Helper functions ─────────────────────────────────────────────

def get(sku: str) -> Optional[ProductSpec]:
    """Look up a canonical SKU spec. Returns None if unknown."""
    return CATALOGUE.get(sku)


def is_known(sku: str) -> bool:
    return sku in CATALOGUE


def all_skus() -> list[str]:
    return list(CATALOGUE.keys())


def by_category(category: str) -> Dict[str, ProductSpec]:
    return {k: v for k, v in CATALOGUE.items() if v.category == category}


def wallet_grant_for(sku: str) -> Dict[str, int]:
    """Provider-neutral view of what a grant of this SKU adds.

    Returns:
        {
          "adult_minutes": int,
          "kids_minutes":  int,
          "validity_days": int,
        }
    Empty dict for unknown SKUs.
    """
    p = get(sku)
    if p is None:
        return {}
    return {
        "adult_minutes": p.adult_voice_minutes,
        "kids_minutes": p.kids_voice_minutes,
        "validity_days": p.validity_days,
    }


def is_recurring(sku: str) -> bool:
    p = get(sku)
    return bool(p and p.product_type == RECURRING)
