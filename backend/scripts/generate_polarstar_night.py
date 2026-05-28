"""
generate_polarstar_night.py — one-shot Nano Banana call to produce
the signature night-time atmosphere image for /kids-universe/polarstar.

Output: /app/frontend/public/polarstar/night-world.png

Brand brief (NORTHSTAR locked):
  - deep indigo + brass + starlight
  - candlelit treehouse, lantern-lit stone path
  - winding river, gentle moon, soft northern lights overhead
  - calm, painterly, family-storybook, NOT photoreal
  - room for UI overlay (left & right thirds slightly darker, mid is empty sky)

Run from /app/backend:
    python scripts/generate_polarstar_night.py
"""
from __future__ import annotations

import asyncio
import base64
import os
import sys
from pathlib import Path

from dotenv import load_dotenv
from emergentintegrations.llm.chat import LlmChat, UserMessage

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

load_dotenv(ROOT / ".env")

OUT_DIR = Path("/app/frontend/public/polarstar")
OUT_DIR.mkdir(parents=True, exist_ok=True)

PROMPT = """A wide cinematic painterly storybook illustration of a calm
northern winter night. A soft winding stone path lit by warm hanging
lanterns leads through a gentle pine forest toward a small wooden
treehouse glowing with golden window light. A quiet river curls beside
the path with reflections of tiny lanterns. Above, a thin crescent
moon and faint aurora borealis ribbons drift across a deep indigo sky
filled with soft stars. The composition has plenty of open sky in the
upper-middle area and the visual weight rests slightly toward the
bottom edges. Color palette: deep indigo navy (#0e1730), warmer
midnight blue (#172b55), aged brass and candlelight gold (#c4a46b /
#d4b67d), cream highlights (#f0eadd). Style: hand-painted, soft
brushwork, family-friendly, gentle and reverent — NOT photorealistic,
NOT cartoonish, NOT busy. No people, no text, no logos, no UI elements.
Wide landscape composition. Cinematic depth, calm atmosphere, room to
breathe. Like a Studio Ghibli concept painting meets a Scandinavian
winter postcard."""


async def main() -> None:
    api_key = os.environ.get("EMERGENT_LLM_KEY")
    if not api_key:
        raise SystemExit("EMERGENT_LLM_KEY not set in backend/.env")

    chat = LlmChat(
        api_key=api_key,
        session_id="polarstar-night-bg-2026-02-13",
        system_message=(
            "You are an art director generating storybook backgrounds. "
            "Output painterly illustrations only, no text overlays, "
            "no UI elements, no people."
        ),
    )
    chat.with_model("gemini", "gemini-3.1-flash-image-preview")
    chat.with_params(modalities=["image", "text"])

    msg = UserMessage(text=PROMPT)
    text, images = await chat.send_message_multimodal_response(msg)
    print("Model text response:", (text or "")[:200])
    if not images:
        raise SystemExit("No images returned by Nano Banana.")

    out = OUT_DIR / "night-world.png"
    image_bytes = base64.b64decode(images[0]["data"])
    out.write_bytes(image_bytes)
    print(f"Saved {len(image_bytes)} bytes -> {out}")
    print(f"MIME: {images[0]['mime_type']}")


if __name__ == "__main__":
    asyncio.run(main())
