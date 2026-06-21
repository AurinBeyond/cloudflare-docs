#!/usr/bin/env python3
"""Sara nest image generator — 3-image differentiation test.
Generates W1.2 LISTENING and W1.3 ATTENTION with the same 4-waypoint
template used for W1.1 TIME v3, so all three can be viewed side-by-side.
"""
import asyncio
import os
import base64
import urllib.request
from pathlib import Path
from dotenv import load_dotenv
from emergentintegrations.llm.chat import LlmChat, UserMessage, ImageContent

load_dotenv("/app/backend/.env")

STYLE_ANCHOR_URL = (
    "https://customer-assets.emergentagent.com/job_aurin-hub/"
    "artifacts/mghwh6or_image.png"
)

OUT_DIR = Path("/app/sara_nest_test")
OUT_DIR.mkdir(parents=True, exist_ok=True)


def anchor_b64() -> str:
    p = OUT_DIR / "_style_anchor.png"
    if not p.exists():
        urllib.request.urlretrieve(STYLE_ANCHOR_URL, p)
    return base64.b64encode(p.read_bytes()).decode()


def build_prompt(
    *, world_name: str, title: str, completion: str, truth: str,
    next_name: str, closing_line_1: str, closing_line_2: str,
    central_scene: str,
) -> str:
    return f"""\
Create a new hand-painted watercolour illustration in the EXACT same style
as the reference painting (same warm cream / ochre / muted blue palette,
same visible paper grain, same soft amber lantern lighting, same painterly
brushwork, same children's-storybook illustrative quality — preserve every
visual property of the reference).

A 1:1 square watercolour painting with FOUR painted navigation waypoints
baked into the scene — never as digital UI.

CENTRAL SCENE (~55% of canvas):
{central_scene}

WAYPOINT 1 — TOP LEFT — BACK SIGN (small, ~13% of canvas):
A small weathered wooden sign hanging from a frayed rope from the top
edge. Hand-lettered dark serif text on two lines: "Back to" / "{world_name}".
A tiny painted heart below. Soft shadow.

WAYPOINT 2 — RIGHT-CENTRE — PAINTED THREE-LAYER PARCHMENT (~22% of canvas):
A small aged-parchment scroll resting upright against the side of the
scene, half-curled, hand-lettered in dark brown ink on three lines, centred:
   line 1 (large hand-lettered serif):  {title}
   line 2 (smaller, in flowing script):  what I am using:  {completion}
   line 3 (smaller, in flowing script):  what returns:  {truth}
The parchment edges are torn and warm-stained. Treat the text as PAINTED
hand-lettering, never as printed type.

WAYPOINT 3 — BOTTOM-RIGHT — NEXT-NEST SIGN (small, ~12% of canvas):
A small rectangular weathered wooden sign hanging at an angle from the
bottom-right, painted to look hand-carved. Hand-lettered:
"Next:  {next_name}  →". A tiny painted leaf below. Less prominent than
the Back sign.

WAYPOINT 4 — BOTTOM-CENTRE — THEME-SPECIFIC CLOSING PLAQUE (~32% of canvas):
A small dark-blue painted wooden plaque resting on the surface near the
foreground. Hand-lettered in pale ivory on two lines:
   "{closing_line_1}"
   "{closing_line_2}"
Edges weathered. NEVER use a generic "This nest is being painted" line.

ABSOLUTE RULES:
- NO human faces under any circumstance
- Hands ALLOWED only if they are part of the central symbol (otherwise none)
- NO digital UI elements, buttons, icons, modern fonts
- ALL lettering looks hand-painted with a quill
- All four waypoints feel like natural parts of the scene — wooden signs,
  parchments, plaques — not stickers on top
- The painting must read as ONE coherent hand-made artwork
"""


NESTS = {
    "w1.2-listening": dict(
        world_name="What Cannot Be Replaced",
        title="LISTENING",
        completion="advice",
        truth="silence",
        next_name="Attention",
        closing_line_1="Silence lives here.",
        closing_line_2="Stay until the question fully arrives.",
        central_scene=(
            "A small unopened folded letter rests at the bottom of a deep "
            "woven nest made of dried grasses. The letter is on aged ivory "
            "paper, its red wax seal intact and unbroken. A tiny painted "
            "ear-shape is subtly worked into the curve of the nest's weave — "
            "visible only on close looking. A single oil lantern glows softly "
            "off to the left, casting warm amber light across the unopened "
            "letter. No words anywhere on the letter — only its kept silence. "
            "Warm parchment background with visible paper grain. Soft "
            "afternoon light, no human figures, no faces, no hands."
        ),
    ),
    "w1.3-attention": dict(
        world_name="What Cannot Be Replaced",
        title="ATTENTION",
        completion="divided attention",
        truth="undivided gaze",
        next_name="Presence",
        closing_line_1="Undivided gaze lives here.",
        closing_line_2="Stay with what you are looking at.",
        central_scene=(
            "Two soft weathered cupped hands rise into the centre of the "
            "frame, holding a single small lit oil-lantern between their "
            "palms. The lantern glows warm gold. Around the hands and "
            "lantern, the background fades into deep midnight blue — every "
            "other light extinguished, only this one undivided light. The "
            "hands are neither young nor old, painted in soft sepia, no "
            "wedding ring, no jewellery, no faces, no arms beyond the wrists. "
            "Lantern-light catches the edges of the fingers and the parchment "
            "grain. Pure focus on the held warmth."
        ),
    ),
}


async def generate(nest_id: str, data: dict) -> None:
    print(f"[{nest_id}] generating...")
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
    prompt = build_prompt(**data)
    msg = UserMessage(text=prompt, file_contents=[ImageContent(anchor_b64())])
    text, images = await chat.send_message_multimodal_response(msg)
    if not images:
        print(f"[{nest_id}] NO IMAGES")
        return
    for i, img in enumerate(images):
        out = OUT_DIR / f"{nest_id}_{i}.png"
        out.write_bytes(base64.b64decode(img["data"]))
        print(f"[{nest_id}] saved {out.name} ({out.stat().st_size:,} bytes)")


async def main():
    await asyncio.gather(*(generate(k, v) for k, v in NESTS.items()))


if __name__ == "__main__":
    asyncio.run(main())
