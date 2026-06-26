"""
generate_grace_v2_oil.py — Grace as a classical oil-painting portrait.

§HOST-INTRO 2026-02 v2 — founder shared a GPT reference 2026-06-24:
the painting must read as a 17th-century oil portrait (Vermeer /
Rembrandt warmth + watercolour-wash border), NOT a digital
illustration. Darker palette. Multiple light sources. Contemplative
downward gaze. Natural undone hair. Irregular painterly edges.

Output: /app/frontend/public/style_samples/grace_in_chair_v2.png
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
    "A classical oil-painting portrait in the spirit of 17th-century "
    "Dutch masters (Vermeer's warm window light, Rembrandt's "
    "chiaroscuro, subtle Caravaggio depth). Painterly brush strokes "
    "visible on textured canvas. The whole painting is framed by a "
    "soft IRREGULAR watercolour-wash border that bleeds gently into "
    "cream parchment paper — NOT a hard rectangle. Aged-paper feel. "
    "Slightly desaturated, warm sepia + olive-green + candle-amber "
    "+ deep umber palette. NOT cartoon, NOT digital illustration, "
    "NOT anime, NOT modern art, NOT bright/saturated. No neon, no "
    "pure white, no tech-blue, no corporate. No text. No logos. "
    "Vertical portrait composition (3:4 ratio, 1024×1280). "
    ""
    "SUBJECT: A woman in her late 40s — Grace — seated SIDEWAYS in "
    "a deep, plush, dark olive-green velvet armchair beside a tall "
    "wooden window. Evening. Heavy raindrops on the window glass, "
    "subtly catching the warm light from inside. She holds a simple "
    "matte ceramic mug at chest level with both hands, fingers "
    "wrapped around it, drawing warmth. Thin steam rises from the "
    "mug. She wears a LOOSE LONG OLIVE-GREEN SILK ROBE / SHIRT-DRESS "
    "that drapes naturally around her body in soft folds — elegant, "
    "lived-in, not staged. Her hair is dark brunette, gathered "
    "loosely in a SOFT MESSY BUN at the back of her head, with a "
    "few wisps escaping near her temples. Her face is calm, mature, "
    "intelligent, painted softly. She gazes DOWNWARD into the mug, "
    "eyes nearly closed, with a barely-there contemplative "
    "expression — NOT smiling, NOT performing, NOT looking at the "
    "viewer. Bare feet. "
    ""
    "LIGHTING: warm chiaroscuro. The MAIN light source is a single "
    "brass lantern on the windowsill behind her right shoulder — "
    "its flame creates a soft golden glow on her face and the "
    "rim of the mug. A secondary warm glow comes from a fireplace "
    "with low embers and a small open flame to the LEFT of the "
    "chair, casting amber light on the wooden floor and the bottom "
    "of her robe. A third light: a single small candle on the "
    "mantelpiece above the fireplace. Most of the painting falls "
    "into warm shadow — only her face, mug, and the closest "
    "objects are clearly lit. "
    ""
    "SCENE DETAILS: a small round wooden side table beside the "
    "armchair holds a brass oil lantern with a softly burning "
    "flame and a glass teapot half-full of amber tea — its handle "
    "casting a small shadow. A heavy cream wool blanket with thick "
    "fringe is draped over the chair's arm and falls into her lap "
    "and across the floor. On the floor at her feet: a stack of "
    "three worn leather-bound books with gold-stamped spines, two "
    "well-loved fabric slippers placed neatly side by side, and the "
    "trailing fringe of the wool blanket spilling onto a worn "
    "patterned rug. On the mantelpiece above the fireplace: two "
    "more candles in brass holders + a small dark glass vase of "
    "dried branches with a few late seedheads. "
    ""
    "MOOD: 'The day is over. I have been waiting quietly. The tea "
    "is warm. Sit with me.' Solitude with warmth. The kind of "
    "evening a painter would have wanted to record."
)


async def main():
    api_key = os.environ.get("EMERGENT_LLM_KEY")
    chat = LlmChat(
        api_key=api_key,
        session_id=f"grace-oil-{uuid.uuid4().hex[:6]}",
        system_message=(
            "Classical oil-painting portrait artist for the Aurin "
            "house. Vermeer + Rembrandt warmth + irregular "
            "watercolour-wash borders. NO digital illustration look. "
            "NO cartoon. NO modern brightness. Painterly only."
        ),
    )
    chat.with_model("gemini", "gemini-3.1-flash-image-preview")
    chat.with_params(modalities=["image", "text"])
    text, images = await chat.send_message_multimodal_response(UserMessage(text=PROMPT))
    if not images:
        raise SystemExit("No image returned")
    out = OUT_DIR / "grace_in_chair_v2.png"
    out.write_bytes(base64.b64decode(images[0]["data"]))
    print(f"SUCCESS: {out.stat().st_size:,} bytes -> {out}")


if __name__ == "__main__":
    asyncio.run(main())
