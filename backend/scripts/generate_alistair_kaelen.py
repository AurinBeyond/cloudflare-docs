"""Generate Alistair + Kaelen oil-painting hosts in their rooms."""
from __future__ import annotations
import asyncio, base64, os, sys, uuid
from pathlib import Path
from dotenv import load_dotenv

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))
load_dotenv(ROOT / ".env")
from emergentintegrations.llm.chat import LlmChat, UserMessage  # noqa

OUT_DIR = Path("/app/frontend/public/style_samples")

BASE = (
    "Classical oil-painting portrait in the spirit of 17th-century "
    "Dutch masters (Vermeer warm window light, Rembrandt chiaroscuro). "
    "Painterly brush strokes visible on textured canvas. Framed by a "
    "soft IRREGULAR watercolour-wash border that bleeds gently into "
    "cream parchment paper — NOT a hard rectangle. Aged-paper feel. "
    "Warm sepia + amber + earth-tone palette. NOT cartoon, NOT digital "
    "illustration, NOT anime, NOT bright/saturated. No neon, no pure "
    "white, no tech-blue. No text. No logos. Vertical portrait "
    "composition (3:4 ratio, 1024×1280). Painted face, calm, mature, "
    "intelligent — no glamour, no makeup-heavy detail, no smile, "
    "gaze slightly downward or inward in contemplation. "
)

SCENES = {
    "alistair_in_lab_v1": (
        BASE +
        "SUBJECT: A man in his 50s — Alistair — seated at a worn "
        "wooden laboratory desk in a softly lit study. He wears a "
        "warm-brown wool waistcoat over a cream linen shirt, sleeves "
        "rolled to the elbow. Dark hair greying at the temples, "
        "neatly combed back. He looks DOWN at an open leather "
        "notebook on the desk, holding a brass dip-pen in his right "
        "hand, mid-thought — not writing, just considering. "
        "ON THE DESK: a brass nautical compass at the centre, a "
        "partly unrolled hand-drawn map of an unfamiliar coastline "
        "weighted with a stone, a small magnifying glass, a stack "
        "of three leather-bound books with gold-stamped spines, a "
        "single warm-amber oil lamp casting the main light. "
        "BACKGROUND: tall dark wooden shelves filled with books and "
        "small instruments, a single arched window to his right "
        "showing a soft warm evening sky. Chiaroscuro lighting — "
        "his face and hands lit by the lamp, the rest in warm "
        "shadow. MOOD: patient inquiry. 'Sit down. We will draw the "
        "question more carefully together.'"
    ),
    "kaelen_at_river_v1": (
        BASE +
        "SUBJECT: A man in his late 40s — Kaelen — seated on a flat "
        "moss-covered stone at the edge of a wide quiet river at dusk. "
        "He wears a loose oatmeal-cream linen shirt and dark olive "
        "wool trousers, barefoot. His hair is shoulder-length, dark "
        "with grey, falling forward. Weathered, kind face. He looks "
        "DOWN at the water, his right hand lightly resting on the "
        "stone beside him, his left hand cupping water that drips "
        "slowly back — contemplative, present, listening to his own "
        "body and the river both. "
        "AROUND HIM: the wide river in deep sea-blue and amber "
        "tones; exposed warm-brown tree roots reaching from a great "
        "tree on the right bank to drink from the water; smooth "
        "moss-covered stones; soft mist rising just above the water "
        "surface like slow breath; tall grasses bending at the "
        "water's edge. A small open leather satchel rests on the "
        "stone beside him with a folded notebook half-out. The far "
        "shore fades into warm dusk light. "
        "MOOD: 'The body remembers. Listen with me.'"
    ),
}


async def gen(slug, prompt):
    api_key = os.environ.get("EMERGENT_LLM_KEY")
    chat = LlmChat(
        api_key=api_key,
        session_id=f"{slug}-{uuid.uuid4().hex[:6]}",
        system_message="Classical oil-painting watercolour-edge artist for the Aurin sanctuary.",
    )
    chat.with_model("gemini", "gemini-3.1-flash-image-preview")
    chat.with_params(modalities=["image", "text"])
    _, images = await chat.send_message_multimodal_response(UserMessage(text=prompt))
    if not images:
        print(f"[{slug}] no image")
        return
    out = OUT_DIR / f"{slug}.png"
    out.write_bytes(base64.b64decode(images[0]["data"]))
    print(f"[{slug}] {out.stat().st_size:,}b -> {out}")


async def main():
    for slug, p in SCENES.items():
        await gen(slug, p)


if __name__ == "__main__":
    asyncio.run(main())
