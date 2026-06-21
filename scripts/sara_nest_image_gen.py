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


# §W1.1 — TIME — pocket watch resting in a nest with spilled sand.
W1_1_TIME_PROMPT = """\
Create a new hand-painted watercolour illustration in the EXACT same style
as the reference painting (same warm cream / ochre / muted blue palette,
same visible paper grain, same soft amber lantern lighting, same painterly
brushwork — preserve every visual property of the reference).

Change only the scene to depict the following:

A 1:1 square watercolour painting. At the centre: an antique open pocket
watch lying flat inside a small woven wicker nest. The watch chain spills
gently over the rim of the nest. A small heap of fine pale sand has
drifted out of the watch onto the dark blue woollen blanket beneath the
nest, as if the seconds had decided to rest. A single lit oil-lantern
glows softly in the background to the right. No clock-face is visible
anywhere else in the painting. Soft sunset light enters from the right.
The background is warm cream parchment with visible paper texture.
NO human figures, NO faces, NO text, NO writing, NO digital UI elements.

Theme: TIME — slowness held safe. The painting must feel quiet, unhurried,
hand-made, timeless. It must look like a painting, NOT like an
illustration, photograph, 3D render, or AI-generated image.
"""


async def main():
    await generate_nest("w1.1-time", W1_1_TIME_PROMPT)


if __name__ == "__main__":
    asyncio.run(main())
