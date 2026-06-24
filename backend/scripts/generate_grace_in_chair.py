"""
generate_grace_in_chair.py — Grace seated in her armchair (full scene).

§HOST-INTRO 2026-02 — founder mockup target image. Replaces empty
chair with Grace seated, holding a steaming teacup, in the same
sage evening room. Composition mirrors the mockup the founder
shared on 2026-06-24.

Output: /app/frontend/public/style_samples/grace_in_chair_v1.png
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
OUT_DIR.mkdir(parents=True, exist_ok=True)

PROMPT = (
    "Hand-painted watercolour illustration with visible paper grain, "
    "soft natural light, gentle imperfection. Warm sepia, ochre, "
    "amber, deep sage green, muted brown, candle-amber. The painting "
    "MUST look like a painting on textured paper — not a photograph, "
    "not 3D rendered, not corporate, not cartoon. No text. No logos. "
    "No watermarks. No bright neon, no saturated purple, no pure "
    "white, no tech-blue. Vertical portrait composition (3:4 ratio, "
    "1024×1280). Soft fade-to-paper edges on every side. "
    ""
    "SUBJECT: A woman in her late 40s — Grace — seated in a deep "
    "sage-green velvet armchair beside a wooden window. Evening, "
    "rain falling against the glass behind her. She holds a small "
    "ceramic teacup in both hands close to her chest; thin steam "
    "rises from it. She wears a soft sage-green long dress or robe. "
    "Her shoulder-length warm brown hair is loosely pulled back. "
    "She looks slightly downward at her tea — calm, reflective, "
    "with the smallest gentle smile. Her face is painted softly, "
    "watercolour-style, with no glamour and no makeup-heavy detail. "
    "A cream wool blanket with thick fringe is draped across one "
    "arm of the chair and across her lap. "
    ""
    "AROUND HER: a small round wooden side table beside the chair, "
    "holding a brass oil lantern with a softly burning flame and a "
    "small glass teapot of amber tea. A stone fireplace behind her "
    "with embers and small flames glowing warm. On the mantelpiece "
    "a vase of dried branches and a single candle. On the wooden "
    "floor at her feet: two worn woollen slippers, a small stack "
    "of leather-bound books, and the trailing edge of the wool "
    "blanket. The room feels like a place where the day quietly "
    "falls off your shoulders. "
    ""
    "MOOD: 'I have been waiting for you. There is tea. Sit down.' "
    "Calm, intimate, timeless. Painterly. Watercolour."
)


async def main():
    api_key = os.environ.get("EMERGENT_LLM_KEY")
    if not api_key:
        raise SystemExit("EMERGENT_LLM_KEY not set")

    chat = LlmChat(
        api_key=api_key,
        session_id=f"grace-in-chair-{uuid.uuid4().hex[:6]}",
        system_message=(
            "You are a watercolour painter producing Sara-Visual-"
            "System-Lock paintings for the Aurin sanctuary. Painterly "
            "only. Warm, calm, worn, timeless. No text. No glamour."
        ),
    )
    chat.with_model("gemini", "gemini-3.1-flash-image-preview")
    chat.with_params(modalities=["image", "text"])
    text, images = await chat.send_message_multimodal_response(UserMessage(text=PROMPT))
    if not images:
        raise SystemExit("No image returned (model returned empty)")
    out = OUT_DIR / "grace_in_chair_v1.png"
    out.write_bytes(base64.b64decode(images[0]["data"]))
    print(f"SUCCESS: {out.stat().st_size:,} bytes -> {out}")


if __name__ == "__main__":
    asyncio.run(main())
