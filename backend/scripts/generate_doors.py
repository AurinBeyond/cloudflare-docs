"""
§DOORS GENERATOR 2026-05-19
Generates 4 "72-portal" style door images for prulesoul.site rooms section.

Usage:
  cd /app/backend && python -m scripts.generate_doors

Output:
  /app/frontend/public/house/doors/door72_grace.png
  /app/frontend/public/house/doors/door44_kaelan.png
  /app/frontend/public/house/doors/door108_sara.png
  /app/frontend/public/house/doors/door12_alistair.png

Founder approved variant C (2026-05-19). Standalone script — does NOT
touch backend runtime / supervisor / API surface.
"""
import asyncio
import os
import base64
import sys
from pathlib import Path

from dotenv import load_dotenv
from emergentintegrations.llm.chat import LlmChat, UserMessage

# Ensure backend/.env is loaded (EMERGENT_LLM_KEY)
BACKEND_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BACKEND_DIR / ".env")

OUT_DIR = Path("/app/frontend/public/house/doors")
OUT_DIR.mkdir(parents=True, exist_ok=True)

# Shared style anchor — keeps all 4 doors visually consistent.
STYLE_BASE = (
    "A single tall vertical wooden door set into a dark slate stone wall, "
    "photorealistic interior, cinematic dramatic side lighting, "
    "the door face is matte black with intricate fine golden line-art mandala "
    "geometry radiating outward like a sacred geometry portal, "
    "a luminous oval portal at the center of the door showing a mystical "
    "energy field, no visible doorknob, no people, no text other than the "
    "engraved numeral, 4:5 portrait aspect ratio, ultra-detailed, museum "
    "quality, esoteric and refined atmosphere, no AI artifacts, no watermarks."
)

DOORS = [
    {
        "key": "grace",
        "number": "72",
        "filename": "door72_grace.png",
        "accent": (
            "The central portal glows with a soft cool light-blue and pearly "
            "white nebula — the colour of CLARITY. Subtle silver-blue mist "
            "leaks around the door edges. The mood is calm, quiet release."
        ),
    },
    {
        "key": "kaelan",
        "number": "44",
        "filename": "door44_kaelan.png",
        "accent": (
            "The central portal burns with a warm orange and deep crimson "
            "energy — the colour of VITALITY and the body. Embers of soft "
            "amber light hang in the air around the door. The mood is grounded, "
            "alive, listening to the body."
        ),
    },
    {
        "key": "sara",
        "number": "108",
        "filename": "door108_sara.png",
        "accent": (
            "The central portal glows with a tender golden and rose-pink "
            "warmth — the colour of HEARTH and quiet care. A faint scattering "
            "of dust-gold light drifts in the air. The mood is sheltering, "
            "soft, motherly safety."
        ),
    },
    {
        "key": "alistair",
        "number": "12",
        "filename": "door12_alistair.png",
        "accent": (
            "The central portal radiates with a deep indigo and violet "
            "cosmic light — the colour of KNOWING and study. Distant stars "
            "shimmer inside the portal as if looking into a private library "
            "of the universe. The mood is contemplative, scholarly, ancient."
        ),
    },
]


async def generate_one(door: dict) -> Path:
    """Generate a single door image and write it to OUT_DIR."""
    prompt = (
        f"{STYLE_BASE} {door['accent']} "
        f"The numeral '{door['number']}' is engraved subtly at the bottom of "
        f"the door in thin golden serif, integrated into the mandala lines, "
        f"not loud — like a quiet room number."
    )
    api_key = os.getenv("EMERGENT_LLM_KEY")
    if not api_key:
        raise RuntimeError("EMERGENT_LLM_KEY missing from backend/.env")

    chat = (
        LlmChat(
            api_key=api_key,
            session_id=f"doors-{door['key']}",
            system_message="You are an image generation assistant.",
        )
        .with_model("gemini", "gemini-3.1-flash-image-preview")
        .with_params(modalities=["image", "text"])
    )

    msg = UserMessage(text=prompt)
    text, images = await chat.send_message_multimodal_response(msg)
    print(f"[{door['key']}] text reply: {(text or '')[:80]!r}")
    if not images:
        raise RuntimeError(f"[{door['key']}] no images returned")

    img = images[0]
    out_path = OUT_DIR / door["filename"]
    out_path.write_bytes(base64.b64decode(img["data"]))
    print(f"[{door['key']}] saved -> {out_path}  ({out_path.stat().st_size} bytes)")
    return out_path


async def main() -> int:
    print(f"Output dir: {OUT_DIR}")
    results = []
    # Sequential (not parallel) so quota errors are visible per-door.
    for d in DOORS:
        try:
            results.append(await generate_one(d))
        except Exception as exc:
            print(f"[{d['key']}] FAILED: {exc}", file=sys.stderr)
            results.append(None)
    ok = sum(1 for r in results if r)
    print(f"\nDONE. {ok}/{len(DOORS)} doors generated.")
    return 0 if ok == len(DOORS) else 1


if __name__ == "__main__":
    sys.exit(asyncio.run(main()))
