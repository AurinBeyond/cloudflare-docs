"""
generate_polarstar_atmospheres.py — generates the remaining 3 time-of-day
backgrounds (morning, day, evening) to match the existing night world.

Output:
  /app/frontend/public/polarstar/morning-world.png
  /app/frontend/public/polarstar/day-world.png
  /app/frontend/public/polarstar/evening-world.png

Each uses the SAME composition framing as night-world so atmosphere
shifts feel like a single living place, not four different scenes.

Run: python /app/backend/scripts/generate_polarstar_atmospheres.py
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

OUT_DIR = Path("/app/frontend/public/polarstar")
OUT_DIR.mkdir(parents=True, exist_ok=True)

BASE_COMPOSITION = (
    "A wide cinematic painterly storybook illustration of a calm "
    "northern landscape. A soft winding stone path leads through a "
    "gentle pine forest toward a small wooden treehouse. A quiet river "
    "curls beside the path. The composition has plenty of open sky in "
    "the upper-middle area and visual weight slightly toward the "
    "bottom edges. Style: hand-painted, soft brushwork, family-"
    "friendly, gentle and reverent — NOT photorealistic, NOT cartoonish, "
    "NOT busy. No people, no text, no logos, no UI elements. Wide "
    "landscape composition. Calm atmosphere, room to breathe. Like a "
    "Studio Ghibli concept painting meets a Scandinavian postcard."
)

ATMOSPHERES = {
    "morning": (
        BASE_COMPOSITION
        + " TIME OF DAY: early northern dawn. Soft pale-pink and "
        "cream sky just brightening, a faint mist over the river, dew "
        "on the pines, lanterns gone cold but still hanging. Palette: "
        "pale peach (#f3e7d4), soft cream (#dee9f0), gentle sage green "
        "(#c8d9c4), with warm brass accents (#c4a46b) on the treehouse "
        "and the lantern frames. The world is waking gently."
    ),
    "day": (
        BASE_COMPOSITION
        + " TIME OF DAY: bright but soft midday. Pale cream-yellow "
        "sun high in a gentle sky with a few wispy clouds. The pine "
        "needles catch the light, the river sparkles softly, the "
        "treehouse is fully visible. Palette: warm cream (#e6e0cf), "
        "sage greens (#d8dfd0), pale northern sky blue (#c9d4dc), with "
        "brass accents (#c4a46b). The path is open, the day is "
        "walkable, NOT loud or oversaturated."
    ),
    "evening": (
        BASE_COMPOSITION
        + " TIME OF DAY: golden hour just after sunset. Warm amber "
        "and coral light pouring across the scene from the lower-right "
        "horizon, lanterns just beginning to glow warm, the treehouse "
        "windows lit golden, long soft shadows stretched across the "
        "stone path. Palette: warm amber (#c98e57), deep blue dusk "
        "(#3a4a64), brass candlelight (#c4a46b / #d4b67d), with cream "
        "highlights. Lanterns are lighting one by one."
    ),
}


async def generate_one(name: str, prompt: str) -> None:
    api_key = os.environ.get("EMERGENT_LLM_KEY")
    if not api_key:
        raise SystemExit("EMERGENT_LLM_KEY not set")
    chat = LlmChat(
        api_key=api_key,
        session_id=f"polarstar-{name}-{uuid.uuid4().hex[:6]}",
        system_message=(
            "You are an art director generating storybook backgrounds. "
            "Painterly illustrations only. No text. No UI elements. "
            "No people."
        ),
    )
    chat.with_model("gemini", "gemini-3.1-flash-image-preview")
    chat.with_params(modalities=["image", "text"])

    text, images = await chat.send_message_multimodal_response(
        UserMessage(text=prompt)
    )
    print(f"[{name}] model said: {(text or '')[:80]}")
    if not images:
        print(f"[{name}] WARNING: no image returned, skipping.")
        return
    out = OUT_DIR / f"{name}-world.png"
    out.write_bytes(base64.b64decode(images[0]["data"]))
    print(f"[{name}] saved {out.stat().st_size:,} bytes -> {out}")


async def main() -> None:
    for name, prompt in ATMOSPHERES.items():
        await generate_one(name, prompt)


if __name__ == "__main__":
    asyncio.run(main())
