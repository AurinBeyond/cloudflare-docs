#!/usr/bin/env python3
"""
Create Gumroad product: The Hearth Protocol (€19)
THEN create the Gumroad bundle: "Polarstar + Hearth" (€25)

Run ONLY when Anna's manuscript + audios are ready and uploaded to
Gumroad's Content tab. Until then, this script will refuse to run
(safety guard).

Usage:
    # First, manually upload the Hearth PDF + audios via Gumroad UI.
    # Then:
    python3 /app/scripts/create_hearth_product.py --confirm-assets-uploaded

Why no API file upload?
    Gumroad's product file management via API is brittle. The safe
    pattern (already used for the Little Star MP3) is: Anna uploads
    files via the Gumroad UI's Content tab, agent updates everything
    else (description, price, custom_receipt) via API.
"""
import os
import sys
import argparse
import httpx

TOKEN = os.environ.get(
    "GUMROAD_ACCESS_TOKEN"
) or "5dGfYg3fPPh0D0a19cifZWkZHASYNnXcGFTSdAL3Sss"

BASE = "https://api.gumroad.com/v2"

POLARSTAR_PERMALINK = "fwqmha"   # existing live product

HEARTH_NAME = "The Hearth — A Quiet Evening Return To Yourself"
HEARTH_PRICE_CENTS = 1900        # €19.00

HEARTH_DESCRIPTION_HTML = (
    "<p><strong>20 minutes after the house has gone quiet — a quiet "
    "evening return to yourself.</strong></p>"
    "<p>The Hearth is for the parent who has carried more than their "
    "own thoughts today. Not therapy, not advice, not pedagogy. Not a "
    "course or a streak. A short, unhurried evening companion you keep "
    "by the bed.</p>"
    "<p><strong>Inside:</strong></p>"
    "<p>• The Hearth Protocol — a 12-page A5 PDF written for one "
    "sitting (≈ 20 min reading).</p>"
    "<p>• The Inheritance Inventory — a 1-page worksheet that names "
    "what was handed to you, what you've passed on, and what you can "
    "quietly retire.</p>"
    "<p>• Hearth Audio Companion — the protocol read aloud by the "
    "author, ~15 minutes. The same voice as the Polarstar audios.</p>"
    "<p>• One Quiet Evening — a 30-minute ambient soundscape, looping. "
    "Optional underlay or just for the half hour between the last "
    "child asleep and your own.</p>"
    "<p><strong>For whom:</strong></p>"
    "<p>• The parent who is fine until 9pm and unrecognisable by 11.</p>"
    "<p>• The one who is Anchor OS for everyone else, with no anchor of their own.</p>"
    "<p>• The parent decoding what was inherited and what is now being handed forward.</p>"
    "<p><strong>Not for:</strong></p>"
    "<p>• Children. This is for the parent alone, after they sleep.</p>"
    "<p>• Anyone looking for parenting advice — there is none here.</p>"
    "<p>• Anyone wanting a streak, a course schedule, or a coach.</p>"
    "<p><strong>Format:</strong> PDF (A5, 12 pages) + 1-page worksheet + "
    "2 MP3 audios. Instant download after checkout. No app, no login.</p>"
    "<p><strong>Refund:</strong> 14-day no-questions refund.</p>"
    "<p>Part of Matrix Aurin — a calm, parent-managed house. More "
    "rooms are in the slow making.</p>"
    "<p><em>Not therapy. Not medical care. A protocol for the 20 minutes "
    "after the house has gone quiet.</em></p>"
)

HEARTH_CUSTOM_RECEIPT = (
    "Thank you for choosing the slow part of your evening. The Hearth "
    "Protocol PDF, the Inheritance Inventory worksheet, and the two "
    "audios are attached. Print the protocol once, keep it by the bed, "
    "and run it when the house has gone quiet. No app, no login. — Anna"
)


def _client():
    return httpx.Client(timeout=30)


def create_product(client):
    """Create the Hearth Protocol product on Gumroad."""
    print("→ Creating Gumroad product: The Hearth Protocol")
    payload = {
        "access_token": TOKEN,
        "name": HEARTH_NAME,
        "price": HEARTH_PRICE_CENTS,
        "description": HEARTH_DESCRIPTION_HTML,
        "custom_receipt": HEARTH_CUSTOM_RECEIPT,
        # Gumroad v2 expects price in USD by default, but the account
        # is configured for EUR; price field is interpreted in account
        # currency. If account is in EUR, 1900 = €19.00.
    }
    r = client.post(f"{BASE}/products", data=payload)
    print("HTTP", r.status_code)
    try:
        data = r.json()
    except Exception:
        print(r.text[:1200])
        sys.exit(2)
    if not data.get("success"):
        print("FAIL:", data.get("message"))
        print(data)
        sys.exit(3)
    p = data["product"]
    print(f"OK   id={p.get('id')}")
    print(f"OK   permalink={p.get('permalink')}  short_url={p.get('short_url')}")
    return p


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--confirm-assets-uploaded",
        action="store_true",
        help="Confirm Anna has manually uploaded all Hearth assets to "
             "Gumroad UI Content tab (PDF, worksheet, 2 audios).",
    )
    args = parser.parse_args()

    if not args.confirm_assets_uploaded:
        print("ABORTED.")
        print("This script will create the Gumroad product only after Anna")
        print("has manually uploaded the assets in Gumroad's Content tab.")
        print()
        print("Required files (uploaded by founder via Gumroad UI):")
        print("  1. hearth-protocol.pdf       (12-page A5 PDF)")
        print("  2. inheritance-inventory.pdf (1-page worksheet)")
        print("  3. hearth-audio.mp3          (~15 min, ~5 MB)")
        print("  4. one-quiet-evening.mp3     (~30 min, ~25 MB)")
        print()
        print("Once uploaded, re-run with: --confirm-assets-uploaded")
        sys.exit(1)

    with _client() as c:
        product = create_product(c)
        print()
        print("Next manual step in Gumroad UI:")
        print(" 1. Open the new product → Content tab")
        print(" 2. Attach the 4 files Anna uploaded")
        print(" 3. Click Save & Publish")
        print()
        print("Then run /app/scripts/create_family_bundle.py to create")
        print("the Polarstar + Hearth combo bundle (€25).")
        print()
        print("Product permalink:", product.get("short_url"))


if __name__ == "__main__":
    main()
