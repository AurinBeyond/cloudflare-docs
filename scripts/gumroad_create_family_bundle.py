#!/usr/bin/env python3
"""
Gumroad — create/update description for The Family Bundle (€25).

What this bundle is:
    Polarstar Bedtime Stories (€9, World 1 — Polarstar Kids)
  + The Hearth · 5 evening stories (€19, World 2 — Matrix Aurin · Parents' Room)
  = €25 combo · saves €3 vs separate (€28 individually)

The pitch: "One shelf for the children. One shelf for the parent
who put them to bed. Same house, same lantern, two rooms."

SCOPE & SAFETY:
    Gumroad public API does NOT support POST /v2/products (product
    creation). The bundle SKU must therefore be created ONCE in the
    Gumroad UI by the founder. After creation, run this script to
    push the locked description + custom receipt to it.

ONE-TIME FOUNDER STEPS (manual):
    1. Gumroad → Products → New Product
       - Name:        The Family Bundle
       - Price:       €25
       - Type:        Digital product
       - URL slug:    family-bundle   (matches future /family-bundle landing)
       - Currency:    EUR
    2. Under "Content", upload BOTH:
       • polarstar-bedtime-stories.pdf  (+ /assets/audio/polarstar/little-star.mp3)
       • the-hearth-protocol.pdf        (+ 5 MP3s from /assets/audio/hearth/)
       Alternatively, attach the two existing products via "Bundle"
       Gumroad UI option if your plan supports it.
    3. Copy the product ID from the Gumroad URL bar (the long base64-
       looking string after /products/) and export it:
         export GUMROAD_FAMILY_BUNDLE_PRODUCT_ID="<id>"
    4. Run:
         python3 /app/scripts/gumroad_create_family_bundle.py

The script then locks the description and custom_receipt. Idempotent —
re-run after any copy refresh.

Per Four Worlds Rule: this SKU spans Worlds 1 + 2. It MUST NOT pull
copy from Worlds 3 (Clarity Release) or 4 (Body Room).
"""
import os
import sys
import httpx

TOKEN = os.environ.get(
    "GUMROAD_ACCESS_TOKEN"
) or "5dGfYg3fPPh0D0a19cifZWkZHASYNnXcGFTSdAL3Sss"

PRODUCT_ID = os.environ.get("GUMROAD_FAMILY_BUNDLE_PRODUCT_ID")
BASE = "https://api.gumroad.com/v2"

DESCRIPTION_HTML = (
    "<p><strong>One shelf for the children. One shelf for the parent who put them to bed.</strong></p>"
    "<p>Two of the quietest things on Matrix Aurin, packaged for the "
    "same household. The kids get bedtime stories that do not ask them "
    "to swipe, like, or follow up. You get evening stories that do not "
    "ask you to journal, optimise, or fix yourself. Same house, same "
    "lantern, two rooms.</p>"
    "<p><strong>What is in the bundle:</strong></p>"
    "<p>• <strong>Polarstar Bedtime Stories</strong> — the €9 children's "
    "shelf. A 32-page picture-PDF and one finished audio story "
    "(<em>Little Star</em>, 8 minutes, ages 5–9). Read on a tablet "
    "screen-down, or print on plain paper. No app. No streak. No "
    "follow-up tomorrow.</p>"
    "<p>• <strong>The Hearth · 5 evening stories</strong> — the €19 "
    "parents' shelf. Five seven-minute stories for the parent who has "
    "just finished bedtime and is sitting in the kitchen at 11pm with "
    "the dishwasher running. Read by Anna in a single unhurried take. "
    "No music. No bells. Close your eyes if you would like.</p>"
    "<p><strong>The stories in the parents' shelf:</strong></p>"
    "<p>1. The Sock on the Stairs — for the parent of a small one who "
    "is becoming a person.<br/>"
    "2. The Light in the Hallway — for the late shifts no one ever "
    "names.<br/>"
    "3. The Coat on the Chair — for the parent of a teenager who is "
    "starting to be cold without telling you.<br/>"
    "4. The Window Left Open — for the parent who is being asked, "
    "without a memo, to not close things any more.<br/>"
    "5. The Garden in November — for the parent of a teenager who "
    "has gone quietly underground for the season.</p>"
    "<p><strong>What you get:</strong></p>"
    "<p>• 1 children's PDF (32 pages, print-safe) + 1 audio story (MP3).</p>"
    "<p>• 1 parents' PDF (5 stories typeset for reading) + 5 audio "
    "stories (MP3, 1.0s of silence padded both ends — by design).</p>"
    "<p>• Lifetime access. Two rooms. One household.</p>"
    "<p><strong>Pricing:</strong> €25 for the whole house "
    "(individually €9 + €19 = €28).</p>"
    "<p><strong>Delivery:</strong> instant access after checkout. "
    "Files appear in your purchase email. No app to install.</p>"
    "<p><strong>Refund:</strong> 14-day no-questions refund.</p>"
    "<p>Part of Matrix Aurin · Polarstar Kids (N · 0° · the children's "
    "lantern) and Matrix Aurin · Parents' Room (S · 180° · the parents' "
    "lantern). Two cardinals, one household.</p>"
    "<p><em>Not a parenting course. Not therapy. Not medical care. A "
    "quiet shelf for a family that is tired of being marketed at.</em></p>"
)

CUSTOM_RECEIPT = (
    "Two shelves are waiting for you in this email. The children's PDF "
    "and audio for tonight's bedtime, and the parents' five stories "
    "for the kitchen at 11pm after the house has gone quiet. "
    "No app to open. No streak to keep. Read one when the day allows. "
    "Quiet hours."
)


def main():
    if not PRODUCT_ID:
        print("FATAL: GUMROAD_FAMILY_BUNDLE_PRODUCT_ID is not set.")
        print()
        print("One-time founder workflow:")
        print("  1. Create the bundle SKU in Gumroad UI (€25, slug 'family-bundle').")
        print("  2. Attach Polarstar PDF + Little Star MP3 + Hearth PDF + 5 Hearth MP3s.")
        print("  3. Copy its product ID from the Gumroad URL.")
        print("  4. export GUMROAD_FAMILY_BUNDLE_PRODUCT_ID=<id>")
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
    print("Next step: when /family-bundle landing page exists, point its")
    print("primary CTA to:", p.get("short_url"))


if __name__ == "__main__":
    main()
