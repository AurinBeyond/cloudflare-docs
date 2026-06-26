"""
generate_grace_portrait.py — Grace's host portrait.

§HOST-INTRO 2026-02 — GPT framing: two distinct visual roles.
Landing page = mystery (mask). Host-intro page = trust (face).

This portrait is for /grace/intro only. NOT a stock photograph.
Painterly watercolour, soft features, calm presence — the
perenaine who opens the door of an old manor.

Output: /app/frontend/public/style_samples/grace_portrait_v1.png
"""
from __future__ import annotations
import asyncio, base64, os, sys, uuid
from pathlib import Path
from dotenv import load_dotenv

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))
load_dotenv(ROOT / ".env")
from emergentintegrations.llm.chat import LlmChat, UserMessage  # noqa

OUT_DIR = Path("/app/frontend/public/style_samples")

PROMPT = (
    "Hand-painted watercolour portrait of a middle-aged woman, "
    "painted in the same Sara-Visual-System-Lock style as the "
    "rest of the Aurin house: visible paper grain, soft "
    "natural light, gentle imperfection, warm/calm/worn/timeless. "
    "Palette: warm cream, old parchment, ochre, amber, golden "
    "sunset, muted orange, deep sea blue, dusty sage green, warm "
    "brown wood, soft wheat. ABSOLUTELY NOT: photorealistic, 3D "
    "rendered, glossy, glamour, makeup-heavy, fashion-magazine, "
    "Instagram-style, AI-generic, plastic skin, perfect symmetry, "
    "neon, bright red, bright green, saturated purple, pure white, "
    "tech-blue, corporate. The portrait MUST look like a painting "
    "made with brush and water on textured paper. No text. No "
    "logos. No watermarks. "
    ""
    "SUBJECT: A woman in her late 40s to early 50s, painted from "
    "the shoulders up, three-quarter angle facing slightly to her "
    "left (image right). Her face is calm, intelligent, kind, "
    "open. Soft warm skin tones painted in watercolour. Hair is "
    "shoulder-length, wavy, in warm muted brown with subtle ochre "
    "highlights, gently pulled back. Eyes are soft hazel — looking "
    "directly at the viewer with quiet welcome, not staring. A "
    "small, gentle, almost-not-there smile at the corners of the "
    "mouth — the smile of someone who has waited patiently for "
    "you to arrive and is glad you did. No drama. No performance. "
    "She wears a soft cream linen blouse with a dusty sage-green "
    "wool cardigan loosely draped over her shoulders. No jewelry "
    "except possibly one small simple silver pendant. "
    ""
    "BACKGROUND: A blurred warm interior suggested with soft "
    "watercolour washes — hints of a wooden window with rain on "
    "the glass behind her left shoulder, a soft amber glow from a "
    "lantern just out of frame to her right. The background is "
    "INTENTIONALLY less detailed than the face, so the eye rests "
    "on her presence. "
    ""
    "FEELING: 'I have been waiting quietly for you. Come in. "
    "There is tea. The day can fall off your shoulders here.' "
    "This is the keeper of the evening room. Not a therapist. "
    "Not a coach. A wise, calm companion. "
    ""
    "Tall portrait composition (3:4 ratio, 1024×1280). The face "
    "occupies the upper centre of the canvas. There is breathing "
    "room around her — cream/parchment air."
)


async def main():
    api_key = os.environ.get("EMERGENT_LLM_KEY")
    chat = LlmChat(
        api_key=api_key,
        session_id=f"grace-portrait-{uuid.uuid4().hex[:6]}",
        system_message=(
            "You are a watercolour portrait painter for the Aurin "
            "house. Painterly only. Warm, calm, worn, timeless. "
            "No photographic realism. No glamour. No text."
        ),
    )
    chat.with_model("gemini", "gemini-3.1-flash-image-preview")
    chat.with_params(modalities=["image", "text"])
    text, images = await chat.send_message_multimodal_response(UserMessage(text=PROMPT))
    if not images:
        raise SystemExit("No image returned")
    out = OUT_DIR / "grace_portrait_v1.png"
    out.write_bytes(base64.b64decode(images[0]["data"]))
    print(f"✓ {out.stat().st_size:,} bytes -> {out}")


if __name__ == "__main__":
    asyncio.run(main())
