#!/usr/bin/env python3
"""
Generate the Little Star hero illustration via Gemini Nano Banana.

Output: /app/frontend/public/assets/aurin/stories/little-star-hero.webp
Visual Bible: Night Palette (Warm Cream, Lantern Amber, Moonlight
Silver, Deep Blue). Painted storybook style, no characters.

Usage:
    python3 /app/scripts/generate_little_star_hero.py [seed]

Generates up to 3 candidates (seeds 1, 2, 3) and saves the first
that comes back as WEBP-converted output. Founder will pick the
preferred one and we update aurinStories.js accordingly.
"""
import asyncio
import base64
import os
import sys
from io import BytesIO
from pathlib import Path

from dotenv import load_dotenv
from PIL import Image

load_dotenv("/app/backend/.env")

from emergentintegrations.llm.chat import LlmChat, UserMessage  # noqa: E402

OUT_DIR = Path("/app/frontend/public/assets/aurin/stories")
OUT_DIR.mkdir(parents=True, exist_ok=True)

FOUNDATION = (
    "Hand-painted watercolor children's storybook illustration, soft gouache "
    "texture, warm gentle lighting, peaceful atmosphere, bedtime-friendly, "
    "timeless storybook art, calm wonder, beautiful printed-book quality, "
    "soft color palette, safe and comforting mood."
)

SCENE = (
    "A single small golden star shining softly in the upper night sky above a "
    "quiet sleeping village of small wooden cottages with warm amber window "
    "lights, gentle moonlit clouds drifting low, peaceful nighttime "
    "atmosphere, no people, no faces, no animals, "
    "palette strictly Night Palette: warm cream, lantern amber, moonlight "
    "silver, deep blue. Painted bedtime mood. No text, no logos, no borders."
)

PROMPT = (
    "Create a 1024x1024 illustration for a bedtime storybook cover. "
    f"{FOUNDATION} Scene: {SCENE} "
    "Style: not Disney, not Pixar, not anime — a quiet European painted "
    "storybook from the 1960s feel. Visible brush texture acceptable. "
    "Composition: the small golden star is clearly the focal point even "
    "though small in size, the village rests in the bottom third."
)


async def generate(seed_label: str) -> bytes | None:
    api_key = os.environ.get("EMERGENT_LLM_KEY")
    if not api_key:
        print("FATAL: EMERGENT_LLM_KEY missing")
        sys.exit(2)

    chat = LlmChat(
        api_key=api_key,
        session_id=f"polarstar-little-star-hero-{seed_label}",
        system_message="You generate calm storybook illustrations.",
    )
    chat.with_model("gemini", "gemini-3.1-flash-image-preview").with_params(
        modalities=["image", "text"]
    )

    msg = UserMessage(text=PROMPT)
    text, images = await chat.send_message_multimodal_response(msg)
    print(f"[{seed_label}] text len={len(text or '')} images={len(images or [])}")
    if not images:
        return None
    first = images[0]
    print(f"[{seed_label}] mime={first.get('mime_type')}")
    return base64.b64decode(first["data"])


def save_webp(raw: bytes, dest: Path) -> int:
    img = Image.open(BytesIO(raw))
    # Force RGB (drop alpha if any, since storybook covers are opaque)
    if img.mode != "RGB":
        img = img.convert("RGB")
    # Resize if larger than 1280 on long edge — keep file lean
    max_side = max(img.size)
    if max_side > 1280:
        ratio = 1280 / max_side
        new_size = (int(img.size[0] * ratio), int(img.size[1] * ratio))
        img = img.resize(new_size, Image.LANCZOS)
    img.save(dest, "WEBP", quality=88, method=6)
    return dest.stat().st_size


async def main():
    only = sys.argv[1] if len(sys.argv) > 1 else None
    seeds = [only] if only else ["a", "b", "c"]
    for s in seeds:
        try:
            raw = await generate(s)
        except Exception as exc:  # noqa: BLE001
            print(f"[{s}] FAIL: {exc}")
            continue
        if not raw:
            print(f"[{s}] no image returned")
            continue
        dest = OUT_DIR / f"little-star-hero-candidate-{s}.webp"
        size = save_webp(raw, dest)
        print(f"[{s}] saved → {dest}  ({size//1024} KB)")


if __name__ == "__main__":
    asyncio.run(main())
