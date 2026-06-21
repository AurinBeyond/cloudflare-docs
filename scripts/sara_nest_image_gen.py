#!/usr/bin/env python3
"""
Sara Nest Image Generator — test script.
Generates ONE nest image using Nano Banana with the founder-curated
W1 hub painting as the style anchor. The painting style is locked.
Only the scene-subject swaps per nest.
"""
import asyncio
import os
import base64
import sys
import urllib.request
from pathlib import Path
from dotenv import load_dotenv
from emergentintegrations.llm.chat import LlmChat, UserMessage, ImageContent

load_dotenv("/app/backend/.env")

# §SARA-STYLE-ANCHOR — founder-locked World 1 hub painting.
STYLE_ANCHOR_URL = (
    "https://customer-assets.emergentagent.com/job_aurin-hub/"
    "artifacts/mghwh6or_image.png"
)

OUT_DIR = Path("/app/sara_nest_test")
OUT_DIR.mkdir(parents=True, exist_ok=True)


def download_anchor() -> bytes:
    anchor_path = OUT_DIR / "_style_anchor.png"
    if not anchor_path.exists():
        print(f"Downloading style anchor from {STYLE_ANCHOR_URL[:60]}...")
        urllib.request.urlretrieve(STYLE_ANCHOR_URL, anchor_path)
    return anchor_path.read_bytes()


async def generate_nest(nest_id: str, prompt_text: str) -> None:
    print(f"[{nest_id}] generating...")
    anchor_bytes = download_anchor()
    anchor_b64 = base64.b64encode(anchor_bytes).decode("utf-8")

    chat = LlmChat(
        api_key=os.getenv("EMERGENT_LLM_KEY"),
        session_id=f"sara-nest-{nest_id}",
        system_message=(
            "You are a hand-painted watercolour illustrator. You preserve "
            "the exact artistic style, palette, paper grain, lighting, and "
            "brushwork of the reference painting. You only change the scene "
            "content as instructed."
        ),
    )
    chat.with_model("gemini", "gemini-3.1-flash-image-preview").with_params(
        modalities=["image", "text"]
    )

    msg = UserMessage(
        text=prompt_text,
        file_contents=[ImageContent(anchor_b64)],
    )

    text, images = await chat.send_message_multimodal_response(msg)
    print(f"[{nest_id}] model text: {text[:160] if text else '(none)'}")

    if not images:
        print(f"[{nest_id}] NO IMAGES RETURNED")
        return

    for i, img in enumerate(images):
        out = OUT_DIR / f"{nest_id}_{i}.png"
        out.write_bytes(base64.b64decode(img["data"]))
        print(f"[{nest_id}] saved {out} ({out.stat().st_size:,} bytes)")


# §W1.1 — TIME — pocket watch resting in a nest with spilled sand,
# four painted navigation waypoints baked into the scene (Tase 2).
W1_1_TIME_PROMPT = """\
Create a new hand-painted watercolour illustration in the EXACT same style
as the reference painting (same warm cream / ochre / muted blue palette,
same visible paper grain, same soft amber lantern lighting, same painterly
brushwork, same children's-storybook illustrative quality — preserve every
visual property of the reference).

A 1:1 square watercolour painting with FIVE painted layers, all hand-painted
into the same canvas — never as digital UI:

CENTRAL SCENE (~55% of canvas):
An antique open pocket watch lying flat inside a small woven wicker nest.
The watch chain spills gently over the rim of the nest. A small heap of
fine pale sand has drifted out of the watch onto the dark blue woollen
blanket beneath the nest, as if the seconds had decided to rest. A single
lit oil-lantern glows softly in the background to the right. Soft sunset
light from the right. Warm cream parchment background with paper grain.

WAYPOINT 1 — TOP LEFT — BACK SIGN (small, ~13% of canvas):
A small weathered wooden sign hanging from a frayed rope from the top
edge. Hand-lettered dark serif text on two lines: "Back to" / "What Cannot
Be Replaced". A tiny painted heart below. Soft shadow.

WAYPOINT 2 — RIGHT-CENTRE — PAINTED THREE-LAYER PARCHMENT (~22% of canvas):
A small aged-parchment scroll resting upright against the base of the
lantern, half-curled, hand-lettered in dark brown ink on three lines,
centred:
   line 1 (large hand-lettered serif):  TIME
   line 2 (smaller, in flowing script):  what I am using:  speed
   line 3 (smaller, in flowing script):  what returns:  slowness
The parchment edges are torn and warm-stained. Treat the text as PAINTED
hand-lettering, never as printed type.

WAYPOINT 3 — BOTTOM-RIGHT — NEXT-NEST SIGN (small, ~12% of canvas):
A small rectangular weathered wooden sign hanging at an angle from the
bottom-right corner, painted to look hand-carved. Hand-lettered:
"Next:  Listening  →". A tiny painted leaf below the arrow. Less prominent
than the Back sign.

WAYPOINT 4 — BOTTOM-CENTRE — THEME-SPECIFIC CLOSING PLAQUE (~32% of canvas):
A small dark-blue painted wooden plaque resting on the wooden table near
the foreground. Hand-lettered in pale ivory on two lines:
   "Slowness lives here."
   "Stay as long as you need."
Edges weathered. The plaque is theme-specific to TIME — NEVER use a
generic "This nest is being painted" line.

ABSOLUTE RULES:
- NO human figures, NO faces, NO hands
- NO digital UI elements, NO buttons, NO icons, NO arrows that look like
  cursors — only painted decorative arrows where stated
- ALL lettering must look hand-painted with a quill — no modern fonts
- The four navigation waypoints must feel like natural parts of the scene
  — wooden signs, parchments, plaques — not stickers laid on top
- The painting must read as ONE coherent hand-made artwork

Theme: TIME — slowness held safe. The painting must feel quiet, unhurried,
timeless, like a page from a children's storybook of meaningful things.
"""


async def main():
    await generate_nest("w1.1-time", W1_1_TIME_PROMPT)


if __name__ == "__main__":
    asyncio.run(main())
