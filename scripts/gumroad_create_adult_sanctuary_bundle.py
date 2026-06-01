#!/usr/bin/env python3
"""
Gumroad — create/update description for The Adult Sanctuary Bundle (€50).

What this bundle is:
    The Hearth · 5 evening stories       (€19, Parents' Room)
  + The Alistair Bundle · 21 letters     (€39, Course Room)
  = €50 combo · saves €8 vs separate (€58 individually)

The pitch: "One shelf for the parent in the kitchen at 11pm. One
shelf for the operator who has been thinking too hard for too long.
Same lantern, two rooms — both for you."

This is the adult counterpart to The Family Bundle (Polarstar +
Hearth). Designed for the operator/parent who does not need the
children's shelf but wants the full quiet stack for themselves.

SCOPE & SAFETY:
    Gumroad public API does NOT support POST /v2/products (product
    creation). The bundle SKU must therefore be created ONCE in the
    Gumroad UI by the founder. After creation, run this script to
    push the locked description + custom receipt to it.

ONE-TIME FOUNDER STEPS (manual):
    1. Gumroad → Products → New Product
       - Name:        The Adult Sanctuary Bundle
       - Price:       €50
       - Type:        Digital product
       - URL slug:    sanctuary-bundle   (matches future /sanctuary-bundle landing)
       - Currency:    EUR
    2. Under "Content", attach BOTH:
       • the-hearth-protocol.pdf + the 5 Hearth MP3s
       • the 21 Alistair letters (PDF) + the 3 audio companions
    3. Copy the product ID from the Gumroad URL bar:
         export GUMROAD_SANCTUARY_BUNDLE_PRODUCT_ID="<id>"
    4. Run:
         python3 /app/scripts/gumroad_create_adult_sanctuary_bundle.py

Per Four Worlds Rule: spans Worlds 2 (Parents' Room) + 3 (Course Room).
Must NOT pull copy from World 1 (Polarstar Kids) or World 4 (Body Room).
"""
import os
import sys
import httpx

TOKEN = os.environ.get(
    "GUMROAD_ACCESS_TOKEN"
) or "5dGfYg3fPPh0D0a19cifZWkZHASYNnXcGFTSdAL3Sss"

PRODUCT_ID = os.environ.get("GUMROAD_SANCTUARY_BUNDLE_PRODUCT_ID")
BASE = "https://api.gumroad.com/v2"

DESCRIPTION_HTML = (
    "<p><strong>One shelf for the parent in the kitchen at 11pm. One shelf "
    "for the operator who has been thinking too hard for too long.</strong></p>"
    "<p>The full adult sanctuary. Two of the quietest things on Matrix "
    "Aurin, packaged for the person who runs the household, the "
    "company, or the inner weather of both. No children's content. No "
    "marketing-class wellness language. Just two shelves, one €50 door, "
    "lifetime access.</p>"
    "<p><strong>What is in the bundle:</strong></p>"
    "<p>• <strong>The Hearth · 5 evening stories</strong> — the €19 "
    "Parents' Room shelf. Five seven-minute audio stories for the "
    "tired adult sitting in the kitchen at 11pm after the dishwasher "
    "has started running. Read by Anna in one unhurried take. No "
    "music. No bells. 1.0 second of silence padded at each end so you "
    "can find the volume before the story starts.</p>"
    "<p>• <strong>The Alistair Bundle · 21 letters</strong> — the €39 "
    "Course Room shelf. Three transmission sequences of 7 letters "
    "each, gated behind a 24-hour cadence-lock. Not a binge. Not a "
    "course in the modern sense. A protocol library for the operator "
    "who has been carrying too many scripts that were never theirs.</p>"
    "<p><strong>The three Alistair sequences:</strong></p>"
    "<p>1. <em>Letting the old stories rest</em> — 7 slow letters about "
    "the patterns we did not choose, and the quiet permission to put "
    "them down.<br/>"
    "2. <em>The language you forgot</em> — 7 letters returning the soft "
    "inner voice, the one that always whispered before the world taught "
    "us to shout.<br/>"
    "3. <em>The body knows first</em> — 7 letters of slow daily attention "
    "to where emotions live in the hardware, and how they leave.</p>"
    "<p><strong>How the cadence-lock works:</strong></p>"
    "<p>• Letter 1 of each sequence arrives immediately.</p>"
    "<p>• Each subsequent letter is gated behind a 24-hour pause. "
    "Cognitive integration is slower than dopamine, and this shelf "
    "refuses to pretend otherwise.</p>"
    "<p>• No streaks. No notifications. No app to open. The letter "
    "arrives in your inbox; you read it when the day allows.</p>"
    "<p><strong>What you get:</strong></p>"
    "<p>• 1 Parents' Room PDF (5 stories typeset for reading) + 5 "
    "audio stories (MP3, ~7 minutes each, 1.0s silence padding both "
    "ends).</p>"
    "<p>• 21 Alistair letters (3 sequences × 7 days), delivered by "
    "email on the cadence-lock.</p>"
    "<p>• 3 audio companions — short looping pieces designed to play "
    "softly underneath while you read or sit.</p>"
    "<p>• Lifetime access. Re-enroll any Alistair sequence any time "
    "the noise rises again.</p>"
    "<p><strong>Pricing:</strong> €50 for the whole adult sanctuary "
    "(individually €19 + €39 = €58).</p>"
    "<p><strong>Delivery:</strong> instant access to the Hearth files "
    "after checkout. Alistair Letter 1 of each sequence arrives the "
    "same hour. Each subsequent letter every 24 hours.</p>"
    "<p><strong>Refund:</strong> 14-day no-questions refund.</p>"
    "<p>Spans Matrix Aurin · Parents' Room (S · 180°) and Course Room "
    "(W · 270° · Alistair). Two cardinals, one inner house.</p>"
    "<p><em>Not therapy. Not medical care. Not a parenting course. A "
    "quiet shelf for the adult who has been doing the heavy "
    "interior work alone for too long.</em></p>"
)

CUSTOM_RECEIPT = (
    "Thank you for taking both shelves. Your Hearth files are linked "
    "in this email — five stories for the kitchen at 11pm. Alistair "
    "Letter 1 of each sequence (three of them) is already on its way "
    "to this address; the rest arrive on a 24-hour cadence-lock. No "
    "app to open. No streak to keep. Read one when the day allows. "
    "Quiet hours."
)


def main():
    if not PRODUCT_ID:
        print("FATAL: GUMROAD_SANCTUARY_BUNDLE_PRODUCT_ID is not set.")
        print()
        print("One-time founder workflow:")
        print("  1. Create the bundle SKU in Gumroad UI (€50, slug 'sanctuary-bundle').")
        print("  2. Attach Hearth PDF + 5 Hearth MP3s + 21 Alistair letters + 3 audio companions.")
        print("  3. Copy its product ID from the Gumroad URL.")
        print("  4. export GUMROAD_SANCTUARY_BUNDLE_PRODUCT_ID=<id>")
        print("  5. Re-run this script.")
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
    print("Next step: when /sanctuary-bundle landing page exists, point its")
    print("primary CTA to:", p.get("short_url"))


if __name__ == "__main__":
    main()
