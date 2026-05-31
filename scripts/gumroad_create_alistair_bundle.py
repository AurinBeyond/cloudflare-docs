#!/usr/bin/env python3
"""
Gumroad — create/update description for The Alistair Bundle (€39).

SCOPE & SAFETY:
    Gumroad public API does NOT support POST /v2/products (product
    creation). The bundle SKU must therefore be created ONCE in the
    Gumroad UI by the founder. After creation, run this script to
    push the locked description + custom receipt to it.

ONE-TIME FOUNDER STEPS (manual):
    1. Gumroad → Products → New Product
       - Name: The Alistair Bundle
       - Price: €39
       - Type: Digital product
       - URL slug: alistair-bundle  (matches /alistair-bundle landing CTA)
       - Currency: EUR
    2. Upload the three course PDFs (or `.zip` of them) under "Content".
    3. Copy the product ID from the Gumroad URL bar (the long base64-
       looking string after /products/) and export it:
         export GUMROAD_ALISTAIR_PRODUCT_ID="<id>"
    4. Run:
         python3 /app/scripts/gumroad_create_alistair_bundle.py

The script then locks the description and custom_receipt to match the
landing page `/alistair-bundle`. Idempotent — re-run after any copy
refresh.

Per Four Worlds Rule: this SKU lives in World 2 (Matrix Aurin · Course
Room · W cardinal · Alistair). It must never be cross-listed with
Polarstar (World 1) or Clarity Release (World 3).
"""
import os
import sys
import httpx

TOKEN = os.environ.get(
    "GUMROAD_ACCESS_TOKEN"
) or "5dGfYg3fPPh0D0a19cifZWkZHASYNnXcGFTSdAL3Sss"

PRODUCT_ID = os.environ.get("GUMROAD_ALISTAIR_PRODUCT_ID")
BASE = "https://api.gumroad.com/v2"

DESCRIPTION_HTML = (
    "<p><strong>Three transmission sequences. Twenty-one letters. One quiet shelf.</strong></p>"
    "<p>For the operator who has been thinking too hard for too long. Not "
    "a course shelf. Not therapy. A protocol library — each sequence "
    "released one short letter at a time, on a 24-hour cadence-lock. You "
    "do not binge a re-architecture.</p>"
    "<p><strong>Inside the bundle:</strong></p>"
    "<p>• <strong>Letting the old stories rest</strong> — 7 slow letters about the "
    "patterns we did not choose, and the quiet permission to put them down. "
    "Audio companion: <em>Borrowed beliefs</em>.</p>"
    "<p>• <strong>The language you forgot</strong> — 7 letters returning the "
    "soft inner voice, the one that always whispered before the world taught "
    "us to shout. Audio companion: <em>As yourself</em>.</p>"
    "<p>• <strong>The body knows first</strong> — 7 letters of slow daily "
    "attention to where emotions live in the hardware, and how they leave. "
    "Audio companion: <em>The architecture of breath</em>.</p>"
    "<p><strong>How the cadence-lock works:</strong></p>"
    "<p>• You receive Letter 1 of each sequence immediately.</p>"
    "<p>• Each subsequent letter is gated behind a 24-hour pause. This is "
    "by design — cognitive integration is slower than dopamine, and this "
    "shelf refuses to pretend otherwise.</p>"
    "<p>• No streaks. No notifications. No app to open. The letter arrives "
    "in your inbox; you read it when the day allows.</p>"
    "<p><strong>What you get:</strong></p>"
    "<p>• 21 letters (3 sequences × 7 days), delivered on a 24-hour rhythm.</p>"
    "<p>• 3 audio companions — short looping pieces designed to play "
    "softly underneath while you read or sit.</p>"
    "<p>• Lifetime access. Re-enroll any sequence any time the noise rises again.</p>"
    "<p><strong>Pricing:</strong> €39 for the whole shelf "
    "(individually the three sequences are €25 each — €75 total).</p>"
    "<p><strong>Delivery:</strong> instant access after checkout. Letters arrive "
    "by email on the cadence-lock.</p>"
    "<p><strong>Refund:</strong> 14-day no-questions refund.</p>"
    "<p>Part of Matrix Aurin · Course Room (W · 270° · Alistair). Adjacent "
    "compass headings: N · Body Room (somatic-load discharge) and "
    "S · Clarity Release (cognitive-load extraction).</p>"
    "<p><em>Not therapy. Not medical care. A quiet protocol library for "
    "high-bandwidth operators.</em></p>"
)

CUSTOM_RECEIPT = (
    "Thank you for taking the whole shelf. Letter 1 of each sequence is "
    "already on its way to this email address. The next letters will arrive "
    "on a 24-hour cadence-lock — no app to open, no streak to maintain. Read "
    "one. Sit with it. The next will not arrive before its hour. "
    "Quiet hours."
)


def main():
    if not PRODUCT_ID:
        print("FATAL: GUMROAD_ALISTAIR_PRODUCT_ID is not set.")
        print()
        print("One-time founder workflow:")
        print("  1. Create the bundle SKU in Gumroad UI (€39, slug 'alistair-bundle').")
        print("  2. Copy its product ID from the Gumroad URL.")
        print("  3. export GUMROAD_ALISTAIR_PRODUCT_ID=<id>")
        print("  4. Re-run this script.")
        sys.exit(1)

    print(f"→ Updating Gumroad bundle product: {PRODUCT_ID}")
    payload = {
        "access_token": TOKEN,
        "description": DESCRIPTION_HTML,
        "custom_receipt": CUSTOM_RECEIPT,
    }
    with httpx.Client(timeout=30) as c:
        r = c.put(f"{BASE}/products/{PRODUCT_ID}", data=payload)
    print("HTTP", r.status_code)
    try:
        data = r.json()
    except Exception:
        print(r.text[:1000])
        sys.exit(2)
    if not data.get("success"):
        print("FAIL:", data.get("message"))
        print(data)
        sys.exit(3)
    p = data.get("product", {})
    print("OK   name              =", p.get("name"))
    print("OK   formatted_price   =", p.get("formatted_price"))
    print("OK   short_url         =", p.get("short_url"))
    print("OK   published         =", p.get("published"))
    print("OK   custom_receipt    =", (p.get("custom_receipt") or "")[:80], "…")
    print("OK   description head  =", (p.get("description") or "")[:120], "…")
    print()
    print("Next step: verify /alistair-bundle CTA points to:", p.get("short_url"))
    print("If different, edit GUMROAD_BUNDLE_URL in /app/frontend/src/pages/AlistairBundle.jsx")


if __name__ == "__main__":
    main()
