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
    "Photorealistic warm sunlit researcher's private study, wide "
    "cinematic 16:9 composition. A LARGE arched window in the centre "
    "dominates the room, opening onto a peaceful sunlit valley with "
    "distant green hills and a quiet lake — daylight pours in, "
    "golden and soft. In front of the window sits a wooden writing "
    "desk with an OPEN handwritten leather notebook, a vintage "
    "fountain pen, a steaming ceramic mug, a small antique brass "
    "globe, a folded hand-drawn paper map, and a single brass desk "
    "lamp turned off. A vintage brass telescope on a tripod stands "
    "beside the desk, pointed toward the window. A few open books "
    "stacked casually — NOT walls of bookshelves, NOT a library. "
    "One indoor plant in a terracotta pot. A simple wooden chair "
    "with a soft linen blanket. The walls are mostly bare warm "
    "plaster with a single small framed botanical sketch. Cream, "
    "honey wood, and pale linen tones throughout. Empty centre, no "
    "people. Soft golden afternoon light, dust particles drifting "
    "in sunbeams, shallow depth of field, blurred bokeh corners. "
    "Atmosphere of quiet curiosity, exploration, fieldwork — the "
    "study of a thoughtful researcher who studies LIFE, not books. "
    "Ultra detailed magazine interior photography. Strictly NO "
    "PEOPLE, NO FACES, NO TEXT, NO LETTERS, NO LOGOS, NO UI, NO "
    "library walls, NO classroom, NO university feel, NO bookshelf "
    "walls of any kind."
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
