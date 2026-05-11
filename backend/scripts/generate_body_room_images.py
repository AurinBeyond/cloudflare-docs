"""One-shot Body Room image generator. Run from /app/backend:
    python3 scripts/generate_body_room_images.py

Writes PNGs into /app/backend/storage/body_room/ using Nano Banana
(gemini-3.1-flash-image-preview) with a consistent "serious graphic
novel noir, sage-on-black silhouette with emotion metaphor" style.

DO NOT commit the prompts as marketing copy — these are generation-only
prompts. The user-facing text stays in server.py::BODY_HOTSPOTS.
"""
import asyncio
import base64
import os
import sys
import uuid
from pathlib import Path

from dotenv import load_dotenv

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
load_dotenv(Path(__file__).resolve().parents[1] / ".env")

from emergentintegrations.llm.chat import LlmChat, UserMessage  # noqa: E402


STYLE = (
    "Graphic novel noir illustration, minimalist anatomical silhouette of a "
    "human body, deep charcoal black background, sage-green outlines (not "
    "neon, muted), highly symbolic and soulful, NOT a caricature or cartoon, "
    "NO face details, NO medical diagram labels, NO text or letters, "
    "square 1:1 composition. Emotion rendered as metaphor inside the body."
)

SPEC = [
    {
        "slug": "jaws-anger",
        "prompt": (
            f"{STYLE} The body's jaw and temple region shows a concentrated, "
            "glowing ember of deep red-orange light, pressurised and trapped. "
            "Sharp jagged lines radiate upward from the clenched jaw, heavy "
            "shadows around the mouth. Represents unspoken anger held in the "
            "body."
        ),
    },
    {
        "slug": "liver-bitterness",
        "prompt": (
            f"{STYLE} The liver region below the right ribs glows with a dark "
            "green, acrid pool of fluid — almost bile-like — slow tendrils of "
            "smoke rising from it. Represents old bitterness and held "
            "resentment stored in the body."
        ),
    },
    {
        "slug": "heart-grief",
        "prompt": (
            f"{STYLE} The heart and chest region shows a cold, cracked cobalt-"
            "blue void, like a frozen stone with a quiet hairline fracture "
            "running through it. Shallow breath-lines hovering above. "
            "Represents grief and absence of love."
        ),
    },
    {
        "slug": "lungs-melancholy",
        "prompt": (
            f"{STYLE} Both lung regions filled with a heavy, slow grey mist, "
            "curling downward instead of rising, weighing the chest. A single "
            "pale light above the collarbones tries to break through. "
            "Represents deep grief and melancholy."
        ),
    },
    {
        "slug": "kidneys-fear",
        "prompt": (
            f"{STYLE} The kidneys and lower-back region pulses with a deep "
            "black swirl of ink, flecked with tiny cold blue sparks like "
            "distant lightning. The solar plexus above is frozen pale. "
            "Represents fear and loss of vital energy."
        ),
    },
]

OUT = Path("/app/backend/storage/body_room")
OUT.mkdir(parents=True, exist_ok=True)


async def one(spec):
    target = OUT / f"{spec['slug']}.png"
    if target.exists() and target.stat().st_size > 5000:
        print(f"[skip] {target.name} already present")
        return
    chat = LlmChat(
        api_key=os.environ["EMERGENT_LLM_KEY"],
        session_id=f"body-room-{uuid.uuid4()}",
        system_message="You are a precise visual illustrator. Obey the style exactly.",
    )
    chat.with_model("gemini", "gemini-3.1-flash-image-preview").with_params(
        modalities=["image", "text"]
    )
    msg = UserMessage(text=spec["prompt"])
    _text, images = await chat.send_message_multimodal_response(msg)
    if not images:
        print(f"[FAIL] no image returned for {spec['slug']}")
        return
    raw = base64.b64decode(images[0]["data"])
    target.write_bytes(raw)
    print(f"[ok]   {target.name} ({len(raw)} bytes)")


async def main():
    for spec in SPEC:
        try:
            await one(spec)
        except Exception as exc:  # noqa: BLE001
            print(f"[ERROR] {spec['slug']}: {exc!r}")


if __name__ == "__main__":
    asyncio.run(main())
