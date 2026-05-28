"""
generate_polarstar_guides.py — generate 3 fairy guide characters +
a richer night background.

Outputs to /app/frontend/public/polarstar/:
  - night-world-v2.png  (richer landscape, no people, asymmetric lantern path)
  - guide-discovery.png  (4-6 fairy, warm green/cream)
  - guide-exploration.png  (7-10 fairy, soft purple/teal)
  - guide-creation.png  (11-13 fairy, deep blue/silver)

All guide PNGs requested with transparent backgrounds. Nano Banana
honors transparency when explicitly prompted.
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


BACKGROUND_V2 = (
    "A wide cinematic painterly storybook illustration of a calm "
    "northern winter night. NO HOUSES, NO BUILDINGS in the visible "
    "frame — just open landscape. A soft asymmetric WINDING stone path "
    "lit by warm hanging lanterns curls naturally through a gentle "
    "snowy pine forest, the stones placed organically not in a grid, "
    "the path bending left then right as it recedes. A quiet meandering "
    "river curls beside the path with reflections of lanterns. Above, "
    "a thin crescent moon and VIVID aurora borealis ribbons in green "
    "and violet drift dramatically across a deep indigo sky filled "
    "with soft stars. The composition has plenty of open sky in the "
    "upper-middle area and visual weight rests slightly toward the "
    "bottom edges. Lots of empty negative space in the middle for UI. "
    "Color palette: deep indigo (#0e1730), midnight blue (#172b55), "
    "brass candlelight (#c4a46b / #d4b67d), cream highlights, "
    "violet-green aurora. Style: hand-painted, soft brushwork, "
    "family-friendly, gentle and reverent. NOT photorealistic. NOT "
    "cartoonish. NOT busy. NO people, NO text, NO logos, NO UI elements. "
    "Wide landscape composition, like a Studio Ghibli concept painting "
    "meets a Scandinavian winter postcard."
)


def _guide_prompt(theme: dict) -> str:
    return (
        "A single small painterly storybook fairy guide character, "
        "full body, soft watercolor illustration, isolated on a fully "
        "TRANSPARENT background. PNG with alpha channel. No background "
        "at all behind the character — completely transparent. "
        f"Character: {theme['who']}. Wearing {theme['outfit']}. "
        f"Holding {theme['holds']}. Expression: gentle, soft smile, "
        "warm welcoming eyes. Pose: facing slightly toward the viewer, "
        "small wings visible behind. "
        f"Palette: {theme['palette']}. Style: hand-painted, soft "
        "brushwork, magical but grounded, family-friendly, NOT "
        "photorealistic, NOT chibi/cartoon, NOT busy. "
        "Studio Ghibli storybook quality. No text. No logos. No props "
        "other than what is described. Centered composition. Output "
        "must have a transparent background (alpha channel)."
    )


GUIDES = {
    "discovery": {
        "who": "a small young fairy guide for ages 4–6, gentle and approachable, child-like proportions",
        "outfit": "a soft cream and forest-green tunic with tiny leaf embroidery",
        "holds": "a small open storybook glowing softly with warm cream light",
        "palette": "warm cream, soft sage green, gentle brass accents on the book glow",
    },
    "exploration": {
        "who": "a mid-childhood fairy guide for ages 7–10, curious and bright-eyed, posture upright and alert",
        "outfit": "a soft purple and teal explorer's cloak with a small star pin",
        "holds": "a tiny brass compass with a glowing star pointer",
        "palette": "soft violet, muted teal, deep indigo, brass accents on the compass",
    },
    "creation": {
        "who": "an older-child fairy guide for ages 11–13, thoughtful and quietly confident, taller posture",
        "outfit": "a deep navy and silver-blue artisan robe with subtle constellation embroidery",
        "holds": "a slender silver paintbrush with a tiny glowing star at the tip",
        "palette": "deep navy, soft silver, midnight blue, cream highlights, brass accents",
    },
}


async def _gen(name: str, prompt: str) -> None:
    api_key = os.environ.get("EMERGENT_LLM_KEY")
    if not api_key:
        raise SystemExit("EMERGENT_LLM_KEY not set")
    chat = LlmChat(
        api_key=api_key,
        session_id=f"polarstar-{name}-{uuid.uuid4().hex[:6]}",
        system_message=(
            "You are an art director generating storybook illustrations. "
            "Painterly only. No text. No people in backgrounds. "
            "When character requested, honor transparent background."
        ),
    )
    chat.with_model("gemini", "gemini-3.1-flash-image-preview")
    chat.with_params(modalities=["image", "text"])
    text, images = await chat.send_message_multimodal_response(
        UserMessage(text=prompt)
    )
    print(f"[{name}] response: {(text or '')[:80]}")
    if not images:
        print(f"[{name}] WARNING: no image returned")
        return
    out = OUT_DIR / f"{name}.png"
    out.write_bytes(base64.b64decode(images[0]["data"]))
    print(f"[{name}] saved {out.stat().st_size:,} bytes -> {out}")


async def main() -> None:
    # Generate sequentially to avoid rate / order issues.
    await _gen("night-world-v2", BACKGROUND_V2)
    for guide_id, theme in GUIDES.items():
        await _gen(f"guide-{guide_id}", _guide_prompt(theme))


if __name__ == "__main__":
    asyncio.run(main())
