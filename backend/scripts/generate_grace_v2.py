"""
generate_grace_v2.py — Grace sample REVISION 2026-02 morning.

Founder feedback: "muudaks vaid 1 asja pankes sinna laua körvale
mugavama tooli, mis annab tunne, et kui sinna istun siis vajun sinna
sisse ja kogu päeva koorem vajub minust välja nii et ma tunnen
löögastust."

Translation: replace the wooden Windsor chair with a deep, plump
overstuffed armchair you can sink into — the kind where the day
falls off your shoulders the moment you sit down.

Output: /app/frontend/public/style_samples/room_grace_sample_v2.png
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
    "soft natural light, gentle imperfection. Warm, calm, worn, "
    "timeless. Palette: warm cream, old parchment, ochre, amber, "
    "golden sunset, muted orange, deep sea blue, dark blue, greyish "
    "blue, warm brown wood, dusty sage. ABSOLUTELY NOT: photorealistic, "
    "3D rendered, flat design, stock illustration, cartoon, emoji, "
    "infographic, neon, bright red, bright green, saturated purple, "
    "pure white, tech-blue, corporate. Must look like a PAINTING. "
    "No text. No letters. No numbers. No UI elements. No logos. "
    "No human faces. Wide cinematic 3:2 composition (1536×1024). "
    "Central scene at the centre, 4 small symbolic sub-vignettes "
    "painted lightly into the surrounding cream/parchment border. "
    ""
    "SUBJECT for the central scene: A quiet evening interior. A "
    "deep, plump, overstuffed armchair upholstered in soft dusty "
    "sage-green velvet sits beside a wooden window. The armchair "
    "looks like one you sink INTO — heavy, generous, with cushions "
    "that hold you. A soft cream-coloured wool blanket is draped "
    "over one armrest. The chair faces a small wooden side table. "
    "On the table: a warm brass lantern with a soft flame and a "
    "ceramic teacup with thin steam rising. The wooden window "
    "behind shows gentle rain falling against the glass in the "
    "blue evening light. A simple woven rug warms the floor under "
    "the chair. The whole scene says: SIT DOWN, the day falls off "
    "you here. "
    ""
    "SUB-VIGNETTES (small, light, painted softly into the border, "
    "each no larger than 1/10 of the canvas): "
    "Top-left: a small fireplace with embers glowing softly. "
    "Top-right: a rain-streaked window pane with one warm yellow "
    "square of light beyond. "
    "Bottom-left: a single open book resting face-down on a folded "
    "wool blanket. "
    "Bottom-right: a pair of worn slippers placed neatly side by "
    "side on a wooden floor. "
    ""
    "Overall feeling: evening, rest, deep release, the kind of "
    "comfort that holds you. The painting itself carries the room's "
    "story. No captions."
)

async def main():
    api_key = os.environ.get("EMERGENT_LLM_KEY")
    chat = LlmChat(
        api_key=api_key,
        session_id=f"grace-v2-{uuid.uuid4().hex[:6]}",
        system_message=(
            "You are an art director generating Sara-Visual-System-Lock "
            "watercolour paintings for the Aurin sanctuary. Painterly "
            "only. Warm, calm, worn, timeless. No text. No faces."
        ),
    )
    chat.with_model("gemini", "gemini-3.1-flash-image-preview")
    chat.with_params(modalities=["image", "text"])
    text, images = await chat.send_message_multimodal_response(UserMessage(text=PROMPT))
    if not images:
        raise SystemExit("No image returned")
    out = OUT_DIR / "room_grace_sample_v2.png"
    out.write_bytes(base64.b64decode(images[0]["data"]))
    print(f"✓ {out.stat().st_size:,} bytes -> {out}")

if __name__ == "__main__":
    asyncio.run(main())
