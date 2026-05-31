#!/usr/bin/env python3
"""
Gumroad — update description + custom_receipt for Polarstar Bedtime Stories.

SAFE MODE: does NOT touch `files` (founder will add the MP3 manually
via Gumroad UI to avoid any risk of the existing PDF being replaced).

Run once after each copy revision:
    python3 /app/scripts/gumroad_update_description.py
"""
import os
import sys
import httpx

TOKEN = os.environ.get(
    "GUMROAD_ACCESS_TOKEN"
) or "5dGfYg3fPPh0D0a19cifZWkZHASYNnXcGFTSdAL3Sss"

PRODUCT_ID = "rjZkGpYc01gvqwzA-wf_wA=="
BASE = "https://api.gumroad.com/v2"

DESCRIPTION_HTML = (
    "<p><strong>Five quiet stories for the slow part of the evening.</strong></p>"
    "<p>A 24-page PDF with five short bedtime stories — written to be read aloud "
    "in three to five minutes. After every story, one page of three gentle "
    'questions ("Together After the Story") and one small invitation to a '
    "Quiet Activity before lights out.</p>"
    "<p><strong>Inside the bundle:</strong></p>"
    "<p>• Little Star — a tiny star learns that being small is not the same as "
    "being unseen. (Ages 3–5, ~3 min)</p>"
    "<p>• The Moon Boat — a sleepy boat carries dreams across a calm night sea. "
    "(Ages 3–5, ~3 min)</p>"
    "<p>• The Night Forest — the forest at night is not louder than the day. "
    "It is listening. (Ages 6–8, ~4 min)</p>"
    "<p>• The Quiet Dragon — most dragons roar. This one listened, and changed "
    "a village. (Ages 6–8, ~4 min)</p>"
    "<p>• Aurin and the Lantern — a small steady light, an honest step, one "
    "quiet companion on the road. (Ages 9–12, ~5 min)</p>"
    "<p><strong>Free audio companion (NEW):</strong></p>"
    "<p>• Little Star — read aloud by the author, ~2 minutes, soft and "
    "unhurried. Listen anywhere at "
    '<a href="https://prulesoul.site/listen/little-star">prulesoul.site/listen/little-star</a>'
    ", or download the MP3 below alongside your PDF. (More stories will follow "
    "as they are recorded.)</p>"
    "<p><strong>For parents:</strong></p>"
    "<p>• Read aloud — no app to open, no streak, no screen.</p>"
    "<p>• Each story includes a one-minute reading guide for the adult.</p>"
    "<p>• Use any order. Skip what doesn't fit tonight.</p>"
    "<p>• A short letter at the start explains how to use the book.</p>"
    "<p><strong>Format:</strong> PDF, A5, 24 pages. Plus optional MP3 audio for the first story.</p>"
    "<p><strong>Delivery:</strong> instant download after checkout.</p>"
    "<p><strong>Refund:</strong> 14-day no-questions refund.</p>"
    "<p>Part of Polarstar Kids — a calm, parent-managed media collection for "
    "families. More stories are in the slow making.</p>"
    "<p><em>Not therapy. Not medical care. A calm half-hour at the end of the day.</em></p>"
)

CUSTOM_RECEIPT = (
    "Thank you for choosing a calmer evening. Your PDF and the free Little Star "
    "audio companion are attached. The audio also lives at "
    "prulesoul.site/listen/little-star — no app, no login, just press play. "
    "Read with someone you love."
)


def main():
    print("→ Updating Gumroad product:", PRODUCT_ID)
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
    print("OK   published         =", p.get("published"))
    print("OK   custom_receipt    =", (p.get("custom_receipt") or "")[:80], "...")
    print("OK   description first =", (p.get("description") or "")[:120], "...")
    print()
    print("Next step (manual):")
    print(" Go to Gumroad → Polarstar Bedtime Stories → Content tab")
    print(" Add file: little-star.mp3")
    print(" (path: /app/frontend/public/assets/audio/polarstar/little-star.mp3)")
    print(" Then click Save and Publish.")
    print(" After Emergent Deploy, link in receipt + landing page will work.")


if __name__ == "__main__":
    main()
