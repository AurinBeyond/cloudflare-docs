"""
generate_polarstar_v6_day.py — day background that matches the
founder's reference image: bright meadow, winding stone path,
distant mountains, a small wooden bridge crossing a river, a
cozy tent on the LEFT, a treehouse on the RIGHT, abundant
wildflowers. Used by the v6 Polarstar layout.

Output: /app/frontend/public/polarstar/day-world-v2.png (overwrites)
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

OUT = Path("/app/frontend/public/polarstar/day-world-v2.png")

PROMPT = (
    "Wide cinematic painterly storybook illustration of an enchanted "
    "summer meadow. A WINDING stone path of round flat stones curls "
    "through the meadow from the bottom-center upward, crossing a "
    "small WOODEN FOOTBRIDGE over a clear blue river in the middle "
    "distance. On the LEFT edge of the frame, a cozy small fabric "
    "TENT with warm string lights and a campfire. On the RIGHT edge, "
    "a small wooden TREEHOUSE built into a leafy tree, with a tiny "
    "rope swing hanging beside it. Abundant tiny wildflowers in pinks, "
    "yellows, purples and whites carpet the meadow. Soft, leafy "
    "deciduous trees frame the scene, but they are SMALL and STAY at "
    "the edges. In the far distance, gentle blue-green rolling hills "
    "and faint mountain silhouettes provide depth. Warm dappled "
    "morning sunlight bathes the scene. Plenty of OPEN sky in the "
    "upper third. The CENTER of the frame is OPEN meadow and path so "
    "UI overlays can be placed there. Style: hand-painted, gentle "
    "brushwork, family-friendly, Studio Ghibli concept painting, "
    "Scandinavian summer postcard, NOT photorealistic, NOT cartoonish, "
    "NOT busy. NO people. NO text. NO logos. Wide landscape aspect."
)


async def main() -> None:
    api_key = os.environ.get("EMERGENT_LLM_KEY")
    chat = LlmChat(
        api_key=api_key,
        session_id=f"polarstar-v6-day-{uuid.uuid4().hex[:6]}",
        system_message=(
            "Painterly storybook backgrounds. Bridge, tent, treehouse "
            "exactly where requested. Center stays open for UI. "
            "Small trees, not large foreground pines. No text."
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
    print(f"saved {OUT.stat().st_size:,} bytes")


if __name__ == "__main__":
    asyncio.run(main())
