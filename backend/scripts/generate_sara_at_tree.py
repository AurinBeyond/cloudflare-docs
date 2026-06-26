"""
generate_sara_at_tree.py — Sara at the great oak (full scene).

§HOST-INTRO 2026-02 — Sara seated by her oak and harbour.
Replaces empty wider_circle_world_sample_v1.png on /sara/intro.

Output: /app/frontend/public/style_samples/sara_with_tree_v1.png
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
    "Hand-painted watercolour illustration with visible paper grain, "
    "soft natural light, gentle imperfection. Warm cream, ochre, "
    "amber, golden sunset, deep sea blue, warm brown wood, dusty "
    "sage, soft moss green. Must look like a PAINTING on textured "
    "paper. No photorealism. No 3D. No corporate. No cartoon. No "
    "text. No logos. No watermarks. No neon, no saturated purple, "
    "no pure white, no tech-blue. Vertical portrait composition "
    "(3:4 ratio, 1024×1280). Soft fade-to-paper edges all sides. "
    ""
    "SUBJECT: A woman in her late 40s — Sara — seated on a warm "
    "wooden bench at the foot of a great old oak tree. The oak's "
    "trunk rises up to her right, its branches reaching wide. Behind "
    "her, a small wooden harbour with a single moored rowboat resting "
    "against a worn jetty. Beyond the harbour, calm sea in deep "
    "sea-blue reaching toward a low golden-sunset horizon. The sky "
    "carries amber and muted orange light. She wears a soft "
    "long linen dress in warm cream with a moss-green wool shawl "
    "around her shoulders. Her long warm-brown hair is loose, falling "
    "past her shoulders. She looks slightly downward, hands resting "
    "together in her lap — calm, watchful, present. A small open "
    "notebook rests on the bench beside her with a feather quill "
    "across it. She has the air of someone who has waited many quiet "
    "evenings under this tree. "
    ""
    "AROUND HER: at her feet, a single small bird's nest woven into "
    "exposed roots. A worn stone path leads from the bench toward "
    "the harbour. Soft tall grasses sway near the water's edge. A "
    "small brass lantern hangs from a wooden post by the jetty, "
    "unlit but ready. "
    ""
    "MOOD: 'The forest knows you. Sit. There is time.' Generational, "
    "patient, quietly welcoming. Painterly. Watercolour."
)


async def main():
    api_key = os.environ.get("EMERGENT_LLM_KEY")
    chat = LlmChat(
        api_key=api_key,
        session_id=f"sara-tree-{uuid.uuid4().hex[:6]}",
        system_message=(
            "Watercolour painter for the Aurin house. Painterly only. "
            "Warm, calm, worn, timeless. No glamour. No text."
        ),
    )
    chat.with_model("gemini", "gemini-3.1-flash-image-preview")
    chat.with_params(modalities=["image", "text"])
    text, images = await chat.send_message_multimodal_response(UserMessage(text=PROMPT))
    if not images:
        raise SystemExit("No image returned")
    out = OUT_DIR / "sara_with_tree_v1.png"
    out.write_bytes(base64.b64decode(images[0]["data"]))
    print(f"SUCCESS: {out.stat().st_size:,} bytes -> {out}")


if __name__ == "__main__":
    asyncio.run(main())
