"""
§FASTSPRING-BULK 2026-02-11 — One-shot script to bulk-create the
Matrix Aurin product catalogue in FastSpring via REST API.

USAGE:
    1. Anna creates API credentials in FastSpring (Developer Tools → APIs)
    2. Add to /app/backend/.env:
         FASTSPRING_API_USERNAME=...
         FASTSPRING_API_PASSWORD=...
         FASTSPRING_STOREFRONT=puresoul.onfastspring.com   (or .test.onfastspring.com)
    3. Run:  cd /app/backend && python tools/fastspring_bulk_import.py
    4. Check the printed report; verify in FastSpring App → Catalog.
    5. Anna deletes the API credential — agent access is revoked.

SAFETY:
    - Idempotent: re-running won't duplicate; FastSpring upserts by product path.
    - Dry-run mode by default (DRY_RUN=False to actually post).
    - Bundles are NOT created here (FastSpring requires dashboard for bundles).
      The bundle copy-paste forms are in /app/memory/FASTSPRING_FINAL_2026-02-11.md.
"""

from __future__ import annotations

import base64
import json
import os
import sys
from pathlib import Path
from typing import Any

import httpx
from dotenv import load_dotenv

# ─────────────────────────────────────────────────────────────────────────────
# Load env
# ─────────────────────────────────────────────────────────────────────────────
ENV_PATH = Path(__file__).resolve().parents[1] / ".env"
load_dotenv(ENV_PATH)

USERNAME = os.environ.get("FASTSPRING_API_USERNAME")
PASSWORD = os.environ.get("FASTSPRING_API_PASSWORD")
STOREFRONT = os.environ.get("FASTSPRING_STOREFRONT", "puresoul.onfastspring.com")
DRY_RUN = os.environ.get("FASTSPRING_DRY_RUN", "true").lower() == "true"

BASE_URL = "https://api.fastspring.com"

# ─────────────────────────────────────────────────────────────────────────────
# PRODUCT CATALOGUE — single source of truth, mirrors
# /app/memory/FASTSPRING_FINAL_2026-02-11.md
# ─────────────────────────────────────────────────────────────────────────────

CATALOGUE: list[dict[str, Any]] = [
    # ── Single one-time ──────────────────────────────────────────────────────
    {"product": "body-temple-28",
     "display": {"en": "Body Temple 28 — Reading Practice"},
     "description": {"summary": {"en": "A 28-day reading practice for adults. Two minutes a day, four weeks: breath, touch, rest, presence. Not therapy. Not medical advice."}},
     "pricing": {"price": {"USD": 39.00, "EUR": 36.00}},
     "format": "digital"},

    {"product": "first-step",
     "display": {"en": "First Step — Your First Hour"},
     "description": {"summary": {"en": "One hour of voice or hybrid conversation across four rooms. A soft place to begin. Not therapy."}},
     "pricing": {"price": {"USD": 49.00, "EUR": 45.00}},
     "format": "digital"},

    # ── Books (7 paid) ───────────────────────────────────────────────────────
    {"product": "book-beyond-matrix-1",
     "display": {"en": "Beyond the Matrix I"},
     "description": {"summary": {"en": "Digital book — adult readers. PDF + EPUB delivery."}},
     "pricing": {"price": {"USD": 13.00, "EUR": 12.00}},
     "format": "digital"},
    {"product": "book-beyond-matrix-2",
     "display": {"en": "Beyond the Matrix II"},
     "description": {"summary": {"en": "Digital book — adult readers. PDF + EPUB delivery."}},
     "pricing": {"price": {"USD": 13.00, "EUR": 12.00}},
     "format": "digital"},
    {"product": "book-language-of-angels",
     "display": {"en": "The Language of Angels"},
     "description": {"summary": {"en": "Digital book. PDF + EPUB delivery."}},
     "pricing": {"price": {"USD": 10.00, "EUR": 9.00}},
     "format": "digital"},
    {"product": "book-dont-dance",
     "display": {"en": "You Don't Have to Dance to Another's Tune"},
     "description": {"summary": {"en": "Digital book. PDF + EPUB delivery."}},
     "pricing": {"price": {"USD": 7.00, "EUR": 6.50}},
     "format": "digital"},
    {"product": "book-angels-story",
     "display": {"en": "Angels' Story"},
     "description": {"summary": {"en": "Children's digital book."}},
     "pricing": {"price": {"USD": 5.00, "EUR": 4.50}},
     "format": "digital"},
    {"product": "book-angels-tales",
     "display": {"en": "Angels' Tales"},
     "description": {"summary": {"en": "Children's digital book."}},
     "pricing": {"price": {"USD": 5.00, "EUR": 4.50}},
     "format": "digital"},
    {"product": "book-engels-friends-2",
     "display": {"en": "Engels' Friends 2"},
     "description": {"summary": {"en": "Children's digital book."}},
     "pricing": {"price": {"USD": 5.00, "EUR": 4.50}},
     "format": "digital"},

    # ── Courses (4) ──────────────────────────────────────────────────────────
    {"product": "course-old-stories",
     "display": {"en": "Letting the Old Stories Rest"},
     "description": {"summary": {"en": "Audio + written course. Self-paced. Not therapy."}},
     "pricing": {"price": {"USD": 25.00, "EUR": 23.00}},
     "format": "digital"},
    {"product": "course-language-forgot",
     "display": {"en": "The Language You Forgot"},
     "description": {"summary": {"en": "Audio + written course. Self-paced."}},
     "pricing": {"price": {"USD": 25.00, "EUR": 23.00}},
     "format": "digital"},
    {"product": "course-seven-evenings",
     "display": {"en": "Seven Quiet Evenings with Children"},
     "description": {"summary": {"en": "Audio + written course for parents. Self-paced."}},
     "pricing": {"price": {"USD": 20.00, "EUR": 18.50}},
     "format": "digital"},
    {"product": "course-body-knows",
     "display": {"en": "The Body Knows First"},
     "description": {"summary": {"en": "Audio + written course. Self-paced."}},
     "pricing": {"price": {"USD": 25.00, "EUR": 23.00}},
     "format": "digital"},

    # ── Voice top-ups: standard tier ─────────────────────────────────────────
    {"product": "voice-topup-30",
     "display": {"en": "Voice Companion · 30 minutes"},
     "description": {"summary": {"en": "30 minutes of voice-companion time across any of the five rooms. Unused minutes refundable within 14 days."}},
     "pricing": {"price": {"USD": 22.00, "EUR": 20.00}},
     "format": "digital"},
    {"product": "voice-topup-60",
     "display": {"en": "Voice Companion · 60 minutes"},
     "description": {"summary": {"en": "60 minutes of voice-companion time across any room."}},
     "pricing": {"price": {"USD": 46.00, "EUR": 42.00}},
     "format": "digital"},
    {"product": "voice-topup-180",
     "display": {"en": "Voice Companion · 3 hours"},
     "description": {"summary": {"en": "180 minutes of voice-companion time across any room."}},
     "pricing": {"price": {"USD": 140.00, "EUR": 129.00}},
     "format": "digital"},

    # ── Voice top-ups: premium tier (hybrid TTS, priority) ───────────────────
    {"product": "voice-topup-premium-30",
     "display": {"en": "Voice Companion Premium · 30 minutes"},
     "description": {"summary": {"en": "Premium tier: hybrid TTS + priority access. 30 minutes voice time."}},
     "pricing": {"price": {"USD": 31.00, "EUR": 29.00}},
     "format": "digital"},
    {"product": "voice-topup-premium-60",
     "display": {"en": "Voice Companion Premium · 60 minutes"},
     "description": {"summary": {"en": "Premium tier: hybrid TTS + priority access. 60 minutes voice time."}},
     "pricing": {"price": {"USD": 64.00, "EUR": 59.00}},
     "format": "digital"},
    {"product": "voice-topup-premium-180",
     "display": {"en": "Voice Companion Premium · 3 hours"},
     "description": {"summary": {"en": "Premium tier: hybrid TTS + priority access. 180 minutes voice time."}},
     "pricing": {"price": {"USD": 195.00, "EUR": 179.00}},
     "format": "digital"},

    # ── Family Bundle (cheap cross-sell, OK as one-time non-bundle SKU) ──────
    {"product": "bundle-family",
     "display": {"en": "Family Bundle — Adult + Child + Voice"},
     "description": {"summary": {"en": "Body Temple 28 + 60 minutes of voice + Kids Universe Premium. One purchase, three doors open. Not therapy."}},
     "pricing": {"price": {"USD": 59.00, "EUR": 54.00}},
     "format": "digital"},

    # ── Clarity Release Passes (existing live products, re-priced) ───────────
    {"product": "clarity-30min",
     "display": {"en": "Clarity Release · 30 minutes"},
     "description": {"summary": {"en": "30-minute voice + text Clarity Release session."}},
     "pricing": {"price": {"USD": 15.00, "EUR": 14.00}},
     "format": "digital"},
    {"product": "clarity-60min",
     "display": {"en": "Clarity Release · 60 minutes"},
     "description": {"summary": {"en": "60-minute voice + text Clarity Release session."}},
     "pricing": {"price": {"USD": 30.00, "EUR": 28.00}},
     "format": "digital"},

    # ── Subscriptions (FastSpring distinguishes recurring at product-type
    #     level; we set this via the product format/type fields.
    #     If the API requires creating subscription via a separate flow,
    #     these will be flagged in the report. Manual subscription
    #     setup may be needed in the dashboard for these. ─────────────────
    {"product": "sub-text-basic",
     "display": {"en": "Text Basic — Unlimited Reflection (Monthly)"},
     "description": {"summary": {"en": "Unlimited text mode, fair use ~200 conversations/month. Cancel anytime. Recurring monthly."}},
     "pricing": {"price": {"USD": 42.00, "EUR": 39.00}, "interval": "month"},
     "format": "digital",
     "_kind": "subscription"},
    {"product": "sub-text-voice-15",
     "display": {"en": "Text + 15 min Voice (Monthly)"},
     "description": {"summary": {"en": "Unlimited text (fair use ~200/mo) + 15 voice minutes. Monthly. Cancel anytime."}},
     "pricing": {"price": {"USD": 75.00, "EUR": 69.00}, "interval": "month"},
     "format": "digital",
     "_kind": "subscription"},
    {"product": "sub-text-premium",
     "display": {"en": "Text Premium (Monthly)"},
     "description": {"summary": {"en": "Unlimited text (fair use ~250/mo) + 30 voice minutes. Monthly."}},
     "pricing": {"price": {"USD": 108.00, "EUR": 99.00}, "interval": "month"},
     "format": "digital",
     "_kind": "subscription"},
    {"product": "sub-steady-monthly",
     "display": {"en": "Steady Monthly"},
     "description": {"summary": {"en": "60 min voice/mo + weekly letter + library access. Monthly recurring."}},
     "pricing": {"price": {"USD": 130.00, "EUR": 120.00}, "interval": "month"},
     "format": "digital",
     "_kind": "subscription"},
    {"product": "sub-own-room-monthly",
     "display": {"en": "Own Room Monthly"},
     "description": {"summary": {"en": "4 h voice/mo + premium room access (Grace/Kaelan/Sara/Alistair) + unlimited Aurin. Monthly recurring."}},
     "pricing": {"price": {"USD": 410.00, "EUR": 380.00}, "interval": "month"},
     "format": "digital",
     "_kind": "subscription"},

    # ── Memberships (subscription) ───────────────────────────────────────────
    {"product": "tier-voyager",
     "display": {"en": "Voyager Membership"},
     "description": {"summary": {"en": "7-day memory + Course-room first chapter preview. Monthly."}},
     "pricing": {"price": {"USD": 9.00, "EUR": 8.50}, "interval": "month"},
     "format": "digital",
     "_kind": "subscription"},
    {"product": "tier-eternal",
     "display": {"en": "Eternal Membership"},
     "description": {"summary": {"en": "Full hybrid memory + insights export + priority access. Monthly."}},
     "pricing": {"price": {"USD": 19.00, "EUR": 17.50}, "interval": "month"},
     "format": "digital",
     "_kind": "subscription"},
]

# Bundles NOT pushed here (FastSpring requires dashboard for proper bundle
# composition). They're listed for reference / copy-paste manual entry.
BUNDLES_FOR_MANUAL_ENTRY = [
    "bundle-lonely-heart  €129  (60 min Grace + BT28 + 7 letters + 3 stories)",
    "bundle-business-clarity  €199  (90 min Alistair/Kaelan + BT28 + journal + 3 mo letters)",
    "bundle-igapaevane  €149  (all 5 rooms, 90 min, unlimited text)",
    "bundle-perekond-hybrid  €249  (60 min adult EL + 90 min child OAI)",
    "bundle-family-magic  €299  (60+60 min + Kids Premium + BT28 + Anneli story)",
    "bundle-perekond-premium  €349  (90 min adult + 60 min child)",
    "bundle-perekond-full-el  €490  (120 + 60 min, full ElevenLabs)",
    "bundle-vip-unlimited  €590  (300 min + unlimited text + concierge)",
    "bundle-sanctuary-season  €890  (3 months, 180 min + content + 3 stories)",
    "bundle-couples-sanctuary  €1190  (6 months, 2 accounts, 360 min)",
    "lux-annual  €1490/yr  (600 min + 12 stories + 12 letters + concierge)",
    "lux-lifetime  €2990  (lifetime everything + Patron status)",
    "sub-clarity-season  $89/30d  (re-priced from $70)",
]


def _basic_auth_header() -> dict[str, str]:
    raw = f"{USERNAME}:{PASSWORD}".encode("utf-8")
    encoded = base64.b64encode(raw).decode("ascii")
    return {
        "Authorization": f"Basic {encoded}",
        "User-Agent": "MatrixAurin-FastSpring-BulkImport/1.0",
        "Content-Type": "application/json",
        "Accept": "application/json",
    }


def main() -> int:
    if not USERNAME or not PASSWORD:
        print("✗ Missing FASTSPRING_API_USERNAME / FASTSPRING_API_PASSWORD in .env")
        print("  Anna: create them in FastSpring App → Developer Tools → APIs → Create.")
        return 1

    print(f"FastSpring storefront: {STOREFRONT}")
    print(f"API username: {USERNAME[:4]}…{USERNAME[-3:]} (masked)")
    print(f"Dry run: {DRY_RUN}")
    print(f"Products to push: {len(CATALOGUE)}")
    print(f"Bundles for MANUAL entry (dashboard): {len(BUNDLES_FOR_MANUAL_ENTRY)}")
    print()

    # Strip our internal _kind marker before sending
    payload_products = []
    for p in CATALOGUE:
        cleaned = {k: v for k, v in p.items() if not k.startswith("_")}
        payload_products.append(cleaned)

    body = {"products": payload_products}

    if DRY_RUN:
        print("─── DRY RUN — printing payload only (set FASTSPRING_DRY_RUN=false to actually post) ───")
        print(json.dumps(body, indent=2)[:2000] + "\n... (truncated)")
        return 0

    print("─── Sending POST /products to FastSpring … ───")
    headers = _basic_auth_header()
    with httpx.Client(base_url="https://api.fastspring.com", timeout=60.0) as client:
        resp = client.post("/products", headers=headers, json=body)

    print(f"HTTP {resp.status_code}")
    try:
        result = resp.json()
        print(json.dumps(result, indent=2)[:3000])
    except Exception:
        print(resp.text[:3000])

    # Persist full response for audit trail
    audit_path = Path(__file__).resolve().parent / f"fastspring_import_response_{resp.status_code}.json"
    audit_path.write_text(resp.text, encoding="utf-8")
    print(f"\nFull response saved to: {audit_path}")

    if resp.status_code >= 400:
        print("\n✗ Errors. Inspect FastSpring App → Developer Tools → APIs → Log.")
        return 1

    print("\n✓ Done.")
    print("\nNEXT: manually create bundles in FastSpring dashboard:")
    for b in BUNDLES_FOR_MANUAL_ENTRY:
        print(f"   - {b}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
