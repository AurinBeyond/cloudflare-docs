"""
generate_polarstar_v3_landscapes.py — produce true world-map landscapes
where the LANDSCAPE itself is the navigation surface, not a backdrop.

Founder feedback 2026-02-13:
  - smaller trees (current trees dominate)
  - mountains visible (currently no relief)
  - winding glowing path the dominant visual element
  - much more open negative space in the center for clickable nodes
  - same brand DNA (indigo/brass at night; cream/sage at day)

Outputs (overwrite):
  /app/frontend/public/polarstar/night-world-v2.png
  /app/frontend/public/polarstar/day-world-v2.png
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

OUT = Path("/app/frontend/public/polarstar")
OUT.mkdir(parents=True, exist_ok=True)

COMMON = (
    "Wide cinematic aerial-3-quarter view of a painterly storybook "
    "world map. The composition is dominated by a long, WINDING glowing "
    "stone path that S-curves from the bottom-center of the frame up "
    "and away into rolling mountains in the far distance. The path is "
    "the HERO of the image. Small distant trees (NOT large foreground "
    "pines) dot the rolling hills on the LEFT and RIGHT edges, well "
    "away from the path. The middle of the image is OPEN — a vast "
    "expanse of soft hilly meadow, scattered tiny wildflowers and "
    "small clusters of low shrubs, with a quiet river curling beside "
    "the path. The horizon shows distant blue mountain silhouettes "
    "with snow at the peaks, layered for depth. Plenty of negative "
    "sky in the upper third of the frame. No buildings. No houses. "
    "No people. No text. No logos. No UI. Style: hand-painted, soft "
    "brushwork, family-friendly, gentle, like a Studio Ghibli concept "
    "painting meets a Scandinavian world-map illustration. Composition "
    "must leave the central area sparse enough for UI overlays."
)

NIGHT = (
    COMMON +
    " TIME OF DAY: deep northern winter night. The winding path is lit "
    "by warm hanging brass lanterns and glowing stepping stones, "
    "drawing the eye from foreground to mountain horizon. Above: a "
    "thin crescent moon and VIVID green-and-violet aurora borealis "
    "ribbons drifting across a deep indigo starlit sky. Palette: deep "
    "indigo (#0e1730), midnight blue (#172b55), brass candlelight "
    "(#c4a46b), violet-green aurora, cream highlights on snow caps."
)

DAY = (
    COMMON +
    " TIME OF DAY: gentle northern morning. The winding stone path is "
    "warm and inviting in the daylight, surrounded by a meadow of "
    "tiny wildflowers in pinks, yellows and lavenders. A small wooden "
    "footbridge crosses the river in the middle distance. Above: a "
    "pale cream sky with a few soft wispy clouds and gentle morning "
    "sunlight. Palette: warm cream (#e6e0cf), soft sage and forest "
    "green, pale sky blue, wildflower pink and lavender accents, "
    "brass-gold highlights on the path."
)


async def gen(name: str, prompt: str) -> None:
    api_key = os.environ.get("EMERGENT_LLM_KEY")
    chat = LlmChat(
        api_key=api_key,
        session_id=f"{name}-{uuid.uuid4().hex[:6]}",
        system_message=(
            "You are an art director generating storybook world-map "
            "backgrounds. The PATH is the hero. Trees stay small at "
            "the edges. Mountains visible. Center stays open."
        ),
    )
    chat.with_model("gemini", "gemini-3.1-flash-image-preview")
    chat.with_params(modalities=["image", "text"])
    text, images = await chat.send_message_multimodal_response(
        UserMessage(text=prompt)
    )
    if not images:
        print(f"[{name}] NO IMAGE returned")
        return
    out = OUT / f"{name}.png"
    out.write_bytes(base64.b64decode(images[0]["data"]))
    print(f"[{name}] saved {out.stat().st_size:,} bytes")


async def main() -> None:
    await gen("night-world-v2", NIGHT)
    await gen("day-world-v2", DAY)


if __name__ == "__main__":
    asyncio.run(main())
