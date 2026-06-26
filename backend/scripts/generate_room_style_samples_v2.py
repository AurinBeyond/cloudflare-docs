"""
generate_room_style_samples_v2.py — Symbol-system proof samples.

§FAAS-2-PAINTED-ASSET-DEBT 2026-02 — GPT introduced the symbol
system per room (2026-06-23). Sara already has its proof in
wider_circle_world_sample_v1.png (oak + harbour + boat + nest).
We now generate ONE proof per remaining room so the founder sees
the symbol system applied across the full ecosystem before any
live asset is replaced.

Outputs (NONE wired into live routes — sample URLs only):
  /app/frontend/public/style_samples/room_grace_sample_v1.png
  /app/frontend/public/style_samples/room_alistair_sample_v1.png
  /app/frontend/public/style_samples/room_kaelen_sample_v1.png
  /app/frontend/public/style_samples/room_polarstar_sample_v1.png

All paintings share the Sara-Visual-System-Lock palette + watercolour
treatment so the ecosystem feels born from one painter's hand.
Each room differs in SUBJECT, not in style.

Run:
    cd /app/backend && python3 scripts/generate_room_style_samples_v2.py
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

# §SARA-VISUAL-SYSTEM-LOCK 2026-06-21 — universal style envelope.
COMMON_STYLE = (
    "Hand-painted watercolour illustration with visible paper grain, "
    "soft natural light, and gentle imperfection. Warm, calm, worn, "
    "timeless feeling — like a page from a well-loved storybook. "
    "Palette: warm cream, old parchment, ochre, amber, golden sunset, "
    "muted orange, deep sea blue, dark blue, greyish blue, warm "
    "brown wood. ABSOLUTELY NOT: photorealistic, 3D rendered, flat "
    "design, stock illustration, cartoon, emoji, infographic, neon, "
    "bright red, bright green, saturated purple, pure white, "
    "tech-blue, corporate. The image must look like a PAINTING, "
    "not an illustration. No text. No letters. No numbers. No UI "
    "elements. No logos. No watermarks. No human faces. Wide "
    "cinematic 3:2 composition (1536×1024). Composition standard: "
    "central scene at the centre, 4 small symbolic sub-vignettes "
    "painted lightly into the surrounding cream/parchment border."
)

# §SYMBOL-SYSTEM 2026-06-23 (GPT + founder) — per-room symbol set.
ROOMS = {
    "grace": {
        "central": (
            "A quiet evening interior seen from inside a softly lit "
            "room. A wooden window with thin curtains shows gentle "
            "rain falling against the glass. In the foreground a "
            "warm brass lantern rests on a small wooden table, its "
            "flame the brightest point in the painting. An empty "
            "wooden chair sits beside the window — the kind of "
            "chair that has held many quiet evenings."
        ),
        "vignettes": (
            "Top-left: a small fireplace with embers glowing. "
            "Top-right: a rain-streaked window pane with one warm "
            "yellow square of light beyond it. Bottom-left: a "
            "single open book resting face-down on a blanket. "
            "Bottom-right: a teacup with thin steam rising."
        ),
        "feeling": "evening, rest, quiet presence",
    },
    "alistair": {
        "central": (
            "A worn wooden laboratory table seen from a soft "
            "three-quarter angle. On the table: an old brass "
            "compass at the centre, a partly unrolled hand-drawn "
            "map of an unfamiliar coastline, a small leather "
            "notebook opened to a blank page with a feather quill "
            "resting across it. A single warm-amber oil lamp lights "
            "the scene from one side. The atmosphere is curious, "
            "patient — the desk of someone who maps decisions, not "
            "destinations."
        ),
        "vignettes": (
            "Top-left: a small magnifying glass over a fragment of "
            "an old chart. Top-right: a wooden drawer ajar with a "
            "few brass keys inside. Bottom-left: a stack of three "
            "old books with leather spines. Bottom-right: a small "
            "open question mark drawn faintly in ink on a torn "
            "parchment scrap."
        ),
        "feeling": "inquiry, decisions, direction",
    },
    "kaelen": {
        "central": (
            "A wide quiet river seen from a low bank, painted in "
            "deep sea-blue and dark amber tones. The river curves "
            "between two banks of moss-covered stones. On the "
            "right bank, the exposed roots of an old tree reach "
            "down to drink from the water — the roots are warm "
            "brown, painted with care, and the visible tree rings "
            "in a small cross-section of a fallen branch nearby "
            "show many slow years. Soft mist hangs just above the "
            "water surface, suggesting breath."
        ),
        "vignettes": (
            "Top-left: a single round stone, smoothed by water. "
            "Top-right: a faint cross-section of tree rings. "
            "Bottom-left: two cupped hands holding river water "
            "(no face shown). Bottom-right: a soft curl of mist "
            "rising from a stone, like breath on a cold morning."
        ),
        "feeling": "the body remembers",
    },
    "polarstar": {
        "central": (
            "A calm northern night scene: a small wooden rowboat "
            "rests gently on a still mirror-like lake, painted in "
            "deep sea-blue and dark blue tones with cream "
            "highlights. Above the boat, a single bright star — "
            "the polar star — burns soft amber-cream in a velvety "
            "midnight-blue sky. A faint snowy path winds along the "
            "lake edge, half-lit by the star's reflection on the "
            "water. The mood is wondrous, safe, slightly mysterious "
            "— a child's dream of arriving somewhere quiet and good."
        ),
        "vignettes": (
            "Top-left: a small painted star with five gentle "
            "points. Top-right: a thin crescent moon resting low "
            "in the sky. Bottom-left: a tiny brass lantern hanging "
            "from a wooden post at the lake's edge. Bottom-right: "
            "two small bootprints in soft snow."
        ),
        "feeling": "wonder, childhood, safety",
    },
}


async def generate_one(slug: str, brief: dict) -> None:
    api_key = os.environ.get("EMERGENT_LLM_KEY")
    if not api_key:
        raise SystemExit("EMERGENT_LLM_KEY not set in /app/backend/.env")

    prompt = (
        f"{COMMON_STYLE} "
        f"SUBJECT for the central scene: {brief['central']} "
        f"SUB-VIGNETTES (small, light, painted softly into the border, "
        f"each no larger than 1/10 of the canvas): {brief['vignettes']} "
        f"Overall feeling: {brief['feeling']}. "
        f"The painting itself carries the room's story. No captions."
    )

    chat = LlmChat(
        api_key=api_key,
        session_id=f"room-style-{slug}-{uuid.uuid4().hex[:6]}",
        system_message=(
            "You are an art director generating Sara-Visual-System-Lock "
            "watercolour paintings for the Aurin house. Painterly "
            "only. Warm, calm, worn, timeless. No text. No people's "
            "faces. No UI elements."
        ),
    )
    chat.with_model("gemini", "gemini-3.1-flash-image-preview")
    chat.with_params(modalities=["image", "text"])

    text, images = await chat.send_message_multimodal_response(
        UserMessage(text=prompt)
    )
    print(f"[{slug}] model said: {(text or '')[:80]}")
    if not images:
        print(f"[{slug}] WARNING: no image returned, skipping.")
        return

    out = OUT_DIR / f"room_{slug}_sample_v1.png"
    out.write_bytes(base64.b64decode(images[0]["data"]))
    print(f"[{slug}] saved {out.stat().st_size:,} bytes -> {out}")


async def main() -> None:
    # Generate sequentially so we surface failures clearly.
    for slug, brief in ROOMS.items():
        await generate_one(slug, brief)
    print("")
    print("All room samples generated. Compare side-by-side at:")
    for slug in ROOMS:
        print(f"  /style_samples/room_{slug}_sample_v1.png")


if __name__ == "__main__":
    asyncio.run(main())
