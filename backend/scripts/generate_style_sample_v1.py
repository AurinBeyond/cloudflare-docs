"""
generate_style_sample_v1.py — ONE proof-of-style sample for founder approval.

§FAAS-2-PAINTED-ASSET-DEBT 2026-02 — Before regenerating any of the
8 baked-in painted assets (Sara Hub wellness pills, 4 Wider Circle
"being painted" plaques, Body World stones 11+13), we produce a
single sample painting that demonstrates the Sara-Visual-System-Lock
style on a real production-shaped subject.

Output:
  /app/frontend/public/style_samples/wider_circle_world_sample_v1.png

This file is NOT wired into any live route. It exists only at the
sample URL for the founder to inspect. If approved → we run the full
regeneration pass. If rejected → we adjust the prompt and rerun.

Run:
    cd /app/backend && python3 scripts/generate_style_sample_v1.py
"""
from __future__ import annotations

import asyncio
import base64
import os
import sys
import uuid
from pathlib import Path

from dotenv import load_dotenv

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))
load_dotenv(ROOT / ".env")

from emergentintegrations.llm.chat import LlmChat, UserMessage  # noqa: E402

OUT_DIR = Path("/app/frontend/public/style_samples")
OUT_DIR.mkdir(parents=True, exist_ok=True)

# §SARA-VISUAL-SYSTEM-LOCK 2026-06-21 — full prompt assembled from
# PRD locks (palette, art style, composition, tone test).
SARA_STYLE = (
    "Hand-painted watercolour illustration with visible paper grain, "
    "soft natural light, and intentional imperfection. The painting "
    "feels warm, calm, worn, and timeless — like a page from a "
    "well-loved storybook that has lived through many seasons. "
    "Palette: warm cream, old parchment, ochre, amber, golden sunset, "
    "muted orange, deep sea blue, dark blue, greyish blue, and warm "
    "brown wood. ABSOLUTELY NOT: photorealistic, 3D rendered, flat "
    "design, stock illustration, cartoon, emoji, infographic, "
    "or any neon / bright red / bright green / saturated purple / "
    "pure white / tech-blue / corporate palette tones. The image "
    "must look like a PAINTING, not an illustration. No text. No "
    "letters. No numbers. No UI elements. No logos. No watermarks. "
    "No people's faces. Wide cinematic 3:2 composition (1536×1024)."
)

# Sample subject: a Wider Circle painted-world hero image — the kind
# of painting we will use to replace the four "this world is being
# painted" placeholders. Subject chosen for stylistic stress-test:
# it must contain the tree symbol (heritage), the harbour symbol
# (Sara waits quietly in the harbour), and a sense of "this world is
# open" without literal text.
SAMPLE_PROMPT = (
    f"{SARA_STYLE} "
    "Subject: a painted Wider Circle world seen from a soft middle "
    "distance. A large, old oak tree stands slightly off-centre to "
    "the left — its roots visible in warm brown earth, its branches "
    "spreading wide. Beneath the tree, a small wooden harbour with "
    "a single empty boat resting against a worn jetty. Beyond the "
    "harbour, a calm sea in deep sea-blue tones reaching toward a "
    "low golden-sunset horizon. The sky carries amber and muted "
    "orange light, with a few cream-coloured clouds. Around the "
    "central scene, four small symbolic sub-vignettes painted very "
    "lightly into the surrounding cream/parchment border: a small "
    "nest in branches (top-left), a stone path (top-right), a soft "
    "wind through grasses (bottom-left), and a lantern on the "
    "harbour post (bottom-right). The whole painting feels like a "
    "world that is OPEN and inhabited — quiet, ready, waiting for "
    "the wanderer to arrive. No instructional captions. No people. "
    "The painting itself carries the story."
)


async def main() -> None:
    api_key = os.environ.get("EMERGENT_LLM_KEY")
    if not api_key:
        raise SystemExit("EMERGENT_LLM_KEY not set in /app/backend/.env")

    print("Generating ONE style sample (Wider Circle world)...")
    chat = LlmChat(
        api_key=api_key,
        session_id=f"style-sample-{uuid.uuid4().hex[:6]}",
        system_message=(
            "You are an art director generating Sara-Visual-System-Lock "
            "watercolour paintings for the Aurin sanctuary. Painterly "
            "only. Warm, calm, worn, timeless. No text. No people's "
            "faces. No UI elements."
        ),
    )
    chat.with_model("gemini", "gemini-3.1-flash-image-preview")
    chat.with_params(modalities=["image", "text"])

    text, images = await chat.send_message_multimodal_response(
        UserMessage(text=SAMPLE_PROMPT)
    )
    print(f"Model said: {(text or '')[:120]}")
    if not images:
        raise SystemExit("No image returned. Check Emergent LLM Key balance.")

    out = OUT_DIR / "wider_circle_world_sample_v1.png"
    out.write_bytes(base64.b64decode(images[0]["data"]))
    print(f"✓ Saved {out.stat().st_size:,} bytes -> {out}")
    print(f"  Public URL: /style_samples/wider_circle_world_sample_v1.png")


if __name__ == "__main__":
    asyncio.run(main())
