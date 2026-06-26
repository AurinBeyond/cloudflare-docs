#!/usr/bin/env python3
"""
§GRACE-LIGHT-BG 2026-02 — Generate the warm-light Grace Room hero
background via Gemini Nano Banana. Founder's brief (Anna, Estonian
session): "warm welcoming house, light not dark, daylight not
evening, cream + wood + plants + fireplace still visible, no UI, no
people, no text".

Output: /app/frontend/public/assets/grace/grace-light-bg.png
"""
import asyncio
import os
import base64
import sys
from pathlib import Path
from dotenv import load_dotenv
from emergentintegrations.llm.chat import LlmChat, UserMessage

BACKEND_ENV = Path("/app/backend/.env")
load_dotenv(BACKEND_ENV)

OUT_DIR = Path("/app/frontend/public/assets/grace")
OUT_DIR.mkdir(parents=True, exist_ok=True)
OUT_FILE = OUT_DIR / "grace-light-bg.png"

PROMPT = (
    "Photorealistic warm sunlit luxury house living room interior, "
    "wide cinematic 16:9 composition. Soft golden afternoon sunlight "
    "pouring through a tall arched window with sheer linen curtains. "
    "Peaceful lakeside village with green hills visible through the "
    "window. Cream and warm beige tones, natural light oak wood textures. "
    "Cozy cream upholstered armchair with a chunky knitted ivory throw "
    "blanket. A lit fireplace with gentle warm flames in a white painted "
    "mantel on the right side. Indoor plants in ceramic pots on a "
    "wooden shelf. Fresh wildflowers in clear glass vases. White pillar "
    "candles. Vintage hardcover books and a steaming ceramic mug on a "
    "low round wooden coffee table. Soft golden hour highlights, dust "
    "particles drifting in the sunbeams, shallow depth of field, blurred "
    "bokeh in the corners. Calm contemplative welcoming atmosphere, "
    "hopeful and elegant. Empty room, no furniture in the centre — "
    "decorative background only. Ultra detailed photography, magazine "
    "interior shoot quality. Strictly no people, no faces, no text, no "
    "letters, no logos, no UI elements, no signs, no writing of any "
    "kind anywhere in the image."
)


async def main():
    api_key = os.getenv("EMERGENT_LLM_KEY")
    if not api_key:
        print("ERROR: EMERGENT_LLM_KEY not in /app/backend/.env", file=sys.stderr)
        sys.exit(1)

    chat = LlmChat(
        api_key=api_key,
        session_id="grace-light-bg-2026-02",
        system_message="You are an image generation assistant.",
    )
    chat.with_model("gemini", "gemini-3.1-flash-image-preview").with_params(
        modalities=["image", "text"]
    )

    msg = UserMessage(text=PROMPT)
    print("→ Calling Gemini Nano Banana…")
    text, images = await chat.send_message_multimodal_response(msg)

    if not images:
        print("ERROR: no images returned", file=sys.stderr)
        print(f"Text reply: {text[:300]}", file=sys.stderr)
        sys.exit(2)

    img = images[0]
    mime = img.get("mime_type", "image/png")
    data_b64 = img["data"]
    image_bytes = base64.b64decode(data_b64)
    OUT_FILE.write_bytes(image_bytes)
    print(f"✓ Saved {OUT_FILE} ({len(image_bytes)} bytes, mime={mime})")


if __name__ == "__main__":
    asyncio.run(main())
