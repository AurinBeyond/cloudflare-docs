"""
generate_polarstar_day_v2.py — produce a daytime equivalent of the
night-world-v2.png that matches the same composition but in warm
daylight. Same path, same forest, same tent/treehouse vibe, no
aurora, no moon — sunshine, wildflowers, a soft stream.

Output: /app/frontend/public/polarstar/day-world-v2.png
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
    "A wide cinematic painterly storybook illustration of a calm "
    "northern SUMMER DAY in a gentle forest. NO HOUSES, NO BUILDINGS "
    "in the visible frame. A soft asymmetric WINDING stone path of "
    "round pale stepping stones curls naturally through a meadow of "
    "wildflowers and tall pines, the stones placed organically not "
    "in a grid, the path bending left then right as it recedes. A "
    "quiet meandering small river curls beside the path with soft "
    "sunlight glinting on the water and a tiny wooden bridge crossing "
    "it in the middle distance. Above, a pale-cream sky with a few "
    "soft wispy clouds and gentle warm sunlight filtering through "
    "the pine canopy. The composition has plenty of open sky in the "
    "upper-middle area and visual weight rests slightly toward the "
    "bottom edges. Lots of empty negative space in the middle for UI. "
    "Color palette: warm cream (#e6e0cf), soft sage and forest green "
    "(#d8dfd0 / #6b8c64), gentle northern sky blue (#c9d4dc), "
    "wildflower pink and lavender accents, brass-gold highlights on "
    "the path stones, no neon. Style: hand-painted, soft brushwork, "
    "family-friendly, gentle and reverent — like the night-world but "
    "in daylight. NOT photorealistic, NOT cartoonish, NOT busy. "
    "NO people, NO text, NO logos, NO UI elements. Wide landscape "
    "composition. Calm, hopeful, breathable. Studio Ghibli concept "
    "painting meets a Scandinavian summer postcard."
)


async def main() -> None:
    api_key = os.environ.get("EMERGENT_LLM_KEY")
    chat = LlmChat(
        api_key=api_key,
        session_id=f"polarstar-day-v2-{uuid.uuid4().hex[:6]}",
        system_message=(
            "You are an art director generating storybook backgrounds. "
            "Painterly only. No text. No people. No buildings unless asked."
        ),
    )
    chat.with_model("gemini", "gemini-3.1-flash-image-preview")
    chat.with_params(modalities=["image", "text"])
    text, images = await chat.send_message_multimodal_response(
        UserMessage(text=PROMPT)
    )
    print(f"model: {(text or '')[:80]}")
    if not images:
        raise SystemExit("No image returned")
    OUT.write_bytes(base64.b64decode(images[0]["data"]))
    print(f"saved {OUT.stat().st_size:,} bytes -> {OUT}")


if __name__ == "__main__":
    asyncio.run(main())
