#!/usr/bin/env python3
"""
§ALISTAIR-LIGHT-BG 2026-02 — Generate Alistair's "Laboratory of Life"
study background via Gemini Nano Banana. Founder brief (Anna):
"sunlit study, books, notebooks, maps, ideas, quiet curiosity."
"""
import asyncio
import os
import base64
import sys
from pathlib import Path
from dotenv import load_dotenv
from emergentintegrations.llm.chat import LlmChat, UserMessage

load_dotenv(Path("/app/backend/.env"))

OUT = Path("/app/frontend/public/assets/alistair/alistair-light-bg.png")
OUT.parent.mkdir(parents=True, exist_ok=True)

PROMPT = (
    "Photorealistic warm sunlit scholar's study interior, wide "
    "cinematic 16:9 composition. Bright natural daylight pouring "
    "through a tall arched window with sheer linen curtains, "
    "overlooking a peaceful lakeside village with green hills in the "
    "distance. Beautiful wooden writing desk with an open notebook, "
    "vintage fountain pen, brass desk lamp, and a steaming ceramic "
    "tea cup. Tall floor-to-ceiling oak bookshelves filled with "
    "leather-bound books on either side. Vintage brass telescope on a "
    "tripod near the window. Hand-drawn maps and botanical "
    "illustrations pinned to the wall. Indoor plants in terracotta "
    "pots. A small antique globe on the desk. Soft golden afternoon "
    "light, dust particles drifting in sunbeams, shallow depth of "
    "field. Empty centre — no people. Intellectual curiosity, quiet "
    "thoughtful researcher's room atmosphere, warm cream and honey "
    "wood tones. Ultra detailed magazine interior photography. "
    "Strictly NO PEOPLE, NO FACES, NO TEXT, NO LETTERS, NO LOGOS, "
    "NO UI elements, NO signs anywhere in the image."
)


async def main():
    key = os.getenv("EMERGENT_LLM_KEY")
    if not key:
        print("ERR: EMERGENT_LLM_KEY missing", file=sys.stderr)
        sys.exit(1)
    chat = LlmChat(api_key=key, session_id="alistair-bg-2026-02",
                   system_message="You are an image generation assistant.")
    chat.with_model("gemini", "gemini-3.1-flash-image-preview")\
        .with_params(modalities=["image", "text"])
    text, images = await chat.send_message_multimodal_response(UserMessage(text=PROMPT))
    if not images:
        print("ERR: no images", file=sys.stderr); sys.exit(2)
    OUT.write_bytes(base64.b64decode(images[0]["data"]))
    print(f"✓ {OUT} ({OUT.stat().st_size} bytes)")


if __name__ == "__main__":
    asyncio.run(main())
