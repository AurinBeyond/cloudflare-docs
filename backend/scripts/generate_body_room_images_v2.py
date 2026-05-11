"""Generate the 8 current Body Room hotspot images via Nano Banana.

Run from /app/backend:
    python3 scripts/generate_body_room_images_v2.py

Writes PNGs into /app/backend/storage/body_room/ using
gemini-3.1-flash-image-preview with the Matrix Aurin sage-on-black
graphic-novel style. Idempotent — skips files that already exist
above 5 KB. Designed to mirror the slugs in
server.py::BODY_HOTSPOTS so the /api/body-room/image/{slug} route
finds them.
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
    "Graphic-novel noir illustration. Minimalist anatomical silhouette of "
    "a single human figure on a deep charcoal-black background. Lines and "
    "luminous accents are muted SAGE GREEN (not neon). Soulful, symbolic, "
    "absolutely NOT cartoonish. NO facial features, NO medical diagram "
    "labels, NO text, NO letters, NO numbers, NO watermarks. Square 1:1 "
    "composition. Emotion is rendered as a quiet metaphor inside the body."
)

SPEC = [
    {
        "slug": "crown-overthinker",
        "prompt": (
            f"{STYLE} The crown of the head opens softly upward into a "
            "delicate web of glowing sage-green threads — like over-active "
            "neural filaments and circling thoughts forming a small "
            "constellation above the skull. The skull itself remains in "
            "calm shadow. Represents the overthinker's mind that cannot rest."
        ),
    },
    {
        "slug": "throat-unspoken",
        "prompt": (
            f"{STYLE} The throat region holds a small, slow-glowing sphere of "
            "compressed sage-green light, with thin wordless ribbons spiralling "
            "downward into the chest as if words swallowed and stored. A faint "
            "sealed seam runs across the front of the throat. Represents the "
            "unspoken truth held inside."
        ),
    },
    {
        "slug": "heart-compass",
        "prompt": (
            f"{STYLE} Inside the chest, in place of an anatomical heart, a "
            "small antique compass glows with quiet sage-green light. Two "
            "soft cracks in the surrounding chest wall let in faint silver "
            "moonlight. Represents the heart as a re-learning compass of trust."
        ),
    },
    {
        "slug": "solar-plexus-control",
        "prompt": (
            f"{STYLE} The solar plexus, just below the breastbone, holds a "
            "dense knot of luminous sage-green rope — tightly coiled, with "
            "one frayed thread beginning to unravel. Faint ripple lines around "
            "the upper belly. Represents the controller's knot starting to "
            "loosen."
        ),
    },
    {
        "slug": "belly-intuition",
        "prompt": (
            f"{STYLE} The lower belly, below the navel, contains a still pool "
            "of sage-green water seen as if from above — perfectly calm, with "
            "a single concentric ripple expanding outward. Represents the "
            "intuitive belly waiting to be heard."
        ),
    },
    {
        "slug": "hips-archive",
        "prompt": (
            f"{STYLE} The hip region holds a softly-glowing archive of layered "
            "sage-green sediment lines — like quiet geological strata of held "
            "memory. Two slow tendrils of mist curl upward from them. "
            "Represents the hips as the emotional archive of unmet feelings."
        ),
    },
    {
        "slug": "hands-boundary",
        "prompt": (
            f"{STYLE} Both hands at the figure's sides — one palm half-open "
            "with sage-green light pooling in it, the other softly closed. A "
            "thin luminous boundary line traces the outer edge of each hand. "
            "Represents the hands as the boundary makers of giving and receiving."
        ),
    },
    {
        "slug": "feet-roots",
        "prompt": (
            f"{STYLE} The feet stand on dark earth and slender, glowing "
            "sage-green roots descend from the heels and toes deep into the "
            "ground, branching gently. The body above is grounded and still. "
            "Represents the feet as the root of safety and right-to-be-here."
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
        await asyncio.sleep(2)


if __name__ == "__main__":
    asyncio.run(main())
