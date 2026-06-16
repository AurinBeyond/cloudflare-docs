"""
§ALISTAIR HERO GENERATOR 2026-06-16
Generates the new Alistair hero image with title + subtitle visually
integrated into the artwork — so the temporary React overlay card can
be removed entirely. Founder directive: same approach as Body World
(text baked into the painted asset).

Usage:
  cd /app/backend && python -m scripts.generate_alistair_hero

Output:
  /app/frontend/public/aurin/alistair/hero_v2.png
"""
import asyncio
import base64
import os
from pathlib import Path

from dotenv import load_dotenv
from emergentintegrations.llm.chat import LlmChat, UserMessage

BACKEND_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BACKEND_DIR / ".env")

OUT_DIR = Path("/app/frontend/public/aurin/alistair")
OUT_DIR.mkdir(parents=True, exist_ok=True)

PROMPT = """A wide cinematic hero illustration for an inquiry-based, anti-wellness web platform called "Alistair — Laboratory of Life". Painterly digital matte painting, warm sunset-amber and deep-navy palette, museum quality, photorealistic interiors with a touch of romantic painted illustration.

COMPOSITION (wide 16:9 banner, ~1920x1080):
- LEFT THIRD: a vertical block of warm-cream serif text floating over a dark slate / inky-navy backdrop with a subtle brass vertical hairline accent on the far left edge. The text reads exactly, on four lines, in this exact order, with this exact wording, no typos, classical refined serif typography (think Cormorant Garamond / Trajan), generous leading:
    "— ALISTAIR · GUIDE"      (small caps, brass / antique gold, 0.4em letter-spacing)
    "Laboratory of Life"       (large refined serif, cream off-white, light weight)
    a thin 60px brass horizontal divider
    "Not a course. Not a coach."   (slightly bold cream serif, italic optional)
    "Eleven open questions about your own life —"
    "and the patience to actually sit with them."   (regular cream serif)
- RIGHT TWO THIRDS: a beautifully painted scholar's study room interior — a heavy wooden desk in the foreground with an open leather journal, a quill or fountain pen, a warm glowing oil lamp, a brass telescope on a side table, a small potted plant, stacks of antique leather-bound books on dark wooden shelves on the side walls. The dominating element is a LARGE PERFECTLY ROUND ARCHED WINDOW behind the desk, taking up most of the right portion, framing a breathtaking sunset over a forested mountain valley with misty pine trees, golden hour amber light pouring through the round window onto the desk, soft volumetric god-rays, the silhouette of distant mountains and a calm lake.

MOOD: contemplative, scholarly, dignified, anti-self-help, anti-wellness. Not a yoga studio. Not therapy. Not a coach's office. Think: the private study of a thoughtful philosopher who reads slowly and asks better questions. Warm but not sentimental. Quiet but alive.

LIGHTING: dramatic golden hour pouring in through the round window, warm rim light on the desk objects, deep cool shadow on the left third where the text sits, brass accents catching the light, lamp glow adds a second warmer point source on the desk.

TYPOGRAPHY DETAILS: text must be perfectly legible, classical serif, NO sans-serif, NO modern UI fonts, NO emoji, NO watermark, NO logos. The four text lines on the left must be the ONLY text visible anywhere in the image. Spell every word correctly. No misspellings. No extra punctuation. No additional captions.

STRICTLY NO: yoga poses, meditation cushions, lotus flowers, chakras, mandalas, crystals, candles arranged in spiritual patterns, wellness icons, modern UI mockup elements, sidebars, navigation bars, cards, buttons, badges, or any other UI chrome. This is a single painted illustration, not a website mockup.

ASPECT: wide 16:9 cinematic banner, exquisite painterly finish, no AI artifacts, no watermarks, no signatures."""


async def main() -> int:
    api_key = os.getenv("EMERGENT_LLM_KEY")
    if not api_key:
        raise RuntimeError("EMERGENT_LLM_KEY missing from backend/.env")

    chat = (
        LlmChat(
            api_key=api_key,
            session_id="alistair-hero-v2-2026-06-16",
            system_message="You are an image generation assistant.",
        )
        .with_model("gemini", "gemini-3.1-flash-image-preview")
        .with_params(modalities=["image", "text"])
    )

    msg = UserMessage(text=PROMPT)
    text, images = await chat.send_message_multimodal_response(msg)
    print(f"[alistair-hero] text reply: {(text or '')[:120]!r}")
    if not images:
        raise RuntimeError("[alistair-hero] no images returned")

    img = images[0]
    out_path = OUT_DIR / "hero_v2.png"
    out_path.write_bytes(base64.b64decode(img["data"]))
    print(f"[alistair-hero] saved -> {out_path}  ({out_path.stat().st_size} bytes)")
    return 0


if __name__ == "__main__":
    raise SystemExit(asyncio.run(main()))
