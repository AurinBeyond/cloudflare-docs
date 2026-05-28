"""
generate_polarstar_v7_night.py — the founder's exact reference:
deep indigo + violet aurora night sky, brass-glowing winding stone
path with golden lanterns lining it, moon top-right, small wooden
footbridge over a winding river, a cozy LIT TENT in the bottom-left
corner AND a small treehouse/second tent in the bottom-right corner,
purple wildflowers dotting the grass, plenty of open negative space
in the upper-middle for the title.
"""
from __future__ import annotations

import asyncio
import base64
import os
import sys
import uuid
from pathlib import Path

from dotenv import load_dotenv
from emergentintegrations.llm.chat import LlmChat, UserMessage

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))
load_dotenv(ROOT / ".env")

OUT = Path("/app/frontend/public/polarstar/night-world-v2.png")

PROMPT = (
    "Cinematic painterly storybook illustration of a magical northern "
    "winter night meadow, top-down 3-quarter view. The DOMINANT visual "
    "element is a WINDING glowing stone path of round flat brass-lit "
    "stones that S-curves from bottom-center upward through the scene, "
    "lined on both sides with small warm hanging brass LANTERNS on "
    "thin poles. A small wooden FOOTBRIDGE crosses a quiet river in "
    "the middle distance. In the BOTTOM-LEFT corner, a cozy small "
    "fabric TENT with warm string lights, scattered cushions and a "
    "tiny campfire glow. In the BOTTOM-RIGHT corner, a small wooden "
    "TREEHOUSE built into a leafy tree, lit gold from within, with a "
    "tiny rope swing beside it. Above: a thin crescent MOON in the "
    "upper right and VIVID green-and-violet aurora borealis ribbons "
    "drifting across a deep indigo starlit sky. Abundant tiny "
    "dark-purple WILDFLOWERS scattered through the meadow grass. "
    "Plenty of OPEN sky in the upper third for the page title. CENTER "
    "of the frame stays relatively clear so UI panels can overlay. "
    "Palette: deep indigo (#0e1730), midnight blue (#172b55), brass "
    "candlelight (#c4a46b / #d4b67d), violet-green aurora, cream "
    "highlights. Style: hand-painted, soft brushwork, family-friendly, "
    "Studio Ghibli concept painting, NOT photorealistic, NOT cartoonish, "
    "NOT busy. NO people. NO text. NO logos."
)


async def main() -> None:
    api_key = os.environ.get("EMERGENT_LLM_KEY")
    chat = LlmChat(
        api_key=api_key,
        session_id=f"polarstar-v7-{uuid.uuid4().hex[:6]}",
        system_message=(
            "Painterly storybook background. Honour every requested "
            "element: winding lit path, bridge, two corner shelters "
            "(tent left, treehouse right), moon, aurora. No text."
        ),
    )
    chat.with_model("gemini", "gemini-3.1-flash-image-preview")
    chat.with_params(modalities=["image", "text"])
    _, images = await chat.send_message_multimodal_response(
        UserMessage(text=PROMPT)
    )
    if not images:
        raise SystemExit("No image returned")
    OUT.write_bytes(base64.b64decode(images[0]["data"]))
    print(f"saved {OUT.stat().st_size:,} bytes -> {OUT}")


if __name__ == "__main__":
    asyncio.run(main())
