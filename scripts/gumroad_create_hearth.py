#!/usr/bin/env python3
"""
Gumroad — create/update description for The Hearth (€19).

Same pattern as gumroad_create_alistair_bundle.py. Founder must first
create the SKU in the Gumroad UI (the public API does not allow
product creation), then export GUMROAD_HEARTH_PRODUCT_ID and run this.

Per Four Worlds Rule: this SKU lives in World 2 (Matrix Aurin ·
Parents' Room · E cardinal · Sara/Anna voice). Adult-only audience.
Must never be cross-listed with Polarstar.
"""
import os
import sys
import httpx

TOKEN = os.environ.get(
    "GUMROAD_ACCESS_TOKEN"
) or "5dGfYg3fPPh0D0a19cifZWkZHASYNnXcGFTSdAL3Sss"

PRODUCT_ID = os.environ.get("GUMROAD_HEARTH_PRODUCT_ID")
BASE = "https://api.gumroad.com/v2"

DESCRIPTION_HTML = (
    "<p><strong>Five short evening stories for the parent who finally sat down.</strong></p>"
    "<p>The Hearth is not a course, a protocol, or a wellness shelf. It is a "
    "small collection of evening stories — written and read aloud by Anna, "
    "for the part of the day that belongs to you alone. The hour after the "
    "children sleep. The cup of tea that went cold during the day. The "
    "sock on the third step of the stairs.</p>"
    "<p><strong>Inside the collection:</strong></p>"
    "<p>• <strong>The Sock on the Stairs</strong> — about the moment you "
    "stop trying to finish what was never designed to end.</p>"
    "<p>• <strong>The Light in the Hallway</strong> — about being the "
    "small steady proof, not the floodlight.</p>"
    "<p>• <strong>The Coat on the Chair</strong> — about losing the role "
    "of being needed, and finding the role of being there.</p>"
    "<p>• <strong>The Window Left Open</strong> — about the difference "
    "between what your house needs and what your day needs to release.</p>"
    "<p>• <strong>The Garden in November</strong> — about dormancy as "
    "a job, not a failure.</p>"
    "<p><strong>What you get:</strong></p>"
    "<p>• 5 audio stories (~6 min each, ~30 min total) — read aloud by "
    "the person who wrote them.</p>"
    "<p>• 5-page PDF with the written stories — for the nights you want "
    "to read instead of listen.</p>"
    "<p>• One short reading note from the author at the start.</p>"
    "<p><strong>Listen anywhere:</strong> the first two stories are open "
    'at <a href="https://prulesoul.site/listen/hearth">prulesoul.site/listen/hearth</a>'
    " (no app, no login). The full collection downloads as MP3 + PDF.</p>"
    "<p><strong>Pricing:</strong> €19 for the complete collection. One "
    "payment. Lifetime access. No subscription, no &quot;premium reflection layer&quot;, "
    "no streak counter.</p>"
    "<p><strong>Refund:</strong> 14-day no-questions refund.</p>"
    "<p>Part of Matrix Aurin · Parents' Room (E cardinal). The evening "
    "hour, for the parent who has been carrying more than their own "
    "thoughts today.</p>"
    "<p><em>Not therapy. Not medical care. A quiet half-hour at the end "
    "of the day.</em></p>"
)

CUSTOM_RECEIPT = (
    "Thank you for choosing a quieter evening. Your five audio stories "
    "and PDF are attached. The first two also live at "
    "prulesoul.site/listen/hearth — no app, no login, just press play. "
    "Sit down before you start. The sock can wait."
)


def main():
    if not PRODUCT_ID:
        print("FATAL: GUMROAD_HEARTH_PRODUCT_ID is not set.")
        print()
        print("One-time founder workflow:")
        print("  1. Create the SKU in Gumroad UI:")
        print("     - Name: The Hearth")
        print("     - Price: EUR 19.00")
        print("     - URL slug: the-hearth")
        print("     - Currency: EUR")
        print("  2. Upload to Content tab:")
        print("     - the-sock-on-the-stairs.mp3")
        print("     - the-light-in-the-hallway.mp3")
        print("     - the-hearth.pdf  (already at /app/frontend/public/assets/pdfs/)")
        print("  3. Copy product ID from the Gumroad URL bar.")
        print("  4. export GUMROAD_HEARTH_PRODUCT_ID=<id>")
        print("  5. Re-run this script.")
        sys.exit(1)

    print(f"→ Updating Gumroad Hearth product: {PRODUCT_ID}")
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
    print("Next step: verify /the-hearth CTA points to:", p.get("short_url"))


if __name__ == "__main__":
    main()
