"""
Generate Grace + Clarity 12-second vision pilots via Sora 2 (sora-2-pro, 1024x1792).
Output: /app/frontend/public/avatars/grace_vision_pilot.mp4
        /app/frontend/public/avatars/clarity_vision_pilot.mp4
"""
import os
import sys
import time
import traceback
from dotenv import load_dotenv

sys.path.insert(0, "/app/backend")
load_dotenv("/app/backend/.env")

from emergentintegrations.llm.openai.video_generation import OpenAIVideoGeneration

OUT_DIR = "/app/frontend/public/avatars"
os.makedirs(OUT_DIR, exist_ok=True)

GRACE_PROMPT = """A woman in her late thirties sits in a deeply dim room lit by a single warm candle on her left. She has soft warm eyes, shoulder-length dark hair falling naturally, and wears a simple linen shirt the colour of warm sand. The right side of her face is in deep shadow. She does not look at the camera — her gaze rests gently in the middle distance, as if listening to someone she trusts.

Over 12 seconds, she breathes slowly and visibly, her chest rising and falling twice. At second 5 she blinks once, slowly. At second 9 she tilts her head a tiny degree to her left — the smallest movement, the gesture of leaning closer to hear better. She does not smile, does not frown — her presence is calm, open, completely non-judging.

The lighting is candle-warm amber, the atmosphere is hushed and monastic, the background is deeply out of focus and dark. Shot on a 50mm lens, shallow depth of field. No camera movement at all — the camera is still, like another person sitting opposite her. Photorealistic but soft, painterly, intimate. No text, no graphics, no glow effects, no AI artefacts, no studio lighting feel."""

CLARITY_PROMPT = """A man in his early forties sits in a deeply dim room lit by a single warm candle on his left. He has a calm thoughtful face with quiet steady eyes, short dark hair, and a few days of unshaven shadow on his jaw. He wears a charcoal grey wool sweater. The right side of his face is in deep shadow. He does not look at the camera — his gaze rests gently in the middle distance, with the look of someone who has all the time in the world to listen.

Over 12 seconds, he breathes slowly and visibly, his chest rising and falling twice. At second 5 he blinks once, slowly. At second 9 his hand (resting on his knee, mostly off-frame) shifts a fraction — a quiet settling gesture. He does not smile, does not frown — his presence is calm, principled, completely unrushed.

The lighting is candle-warm amber, the atmosphere is hushed and monastic, the background is deeply out of focus and dark. Shot on a 50mm lens, shallow depth of field. No camera movement at all — the camera is still, like another person sitting opposite him. Photorealistic but soft, painterly, intimate. No text, no graphics, no glow effects, no AI artefacts, no studio lighting feel."""


def generate(name, prompt, output_path):
    print(f"[{time.strftime('%H:%M:%S')}] >> START {name} -> {output_path}", flush=True)
    try:
        gen = OpenAIVideoGeneration(api_key=os.environ["EMERGENT_LLM_KEY"])
        video_bytes = gen.text_to_video(
            prompt=prompt,
            model="sora-2-pro",
            size="1024x1792",
            duration=12,
            max_wait_time=900,
        )
        if video_bytes:
            gen.save_video(video_bytes, output_path)
            size_mb = os.path.getsize(output_path) / (1024 * 1024)
            print(f"[{time.strftime('%H:%M:%S')}] ✅ DONE {name} ({size_mb:.2f} MB) -> {output_path}", flush=True)
            return True
        print(f"[{time.strftime('%H:%M:%S')}] ❌ FAIL {name} (no bytes)", flush=True)
        return False
    except Exception as e:
        print(f"[{time.strftime('%H:%M:%S')}] ❌ EXC  {name}: {e}", flush=True)
        traceback.print_exc()
        return False


if __name__ == "__main__":
    g = generate("grace", GRACE_PROMPT, os.path.join(OUT_DIR, "grace_vision_pilot.mp4"))
    c = generate("clarity", CLARITY_PROMPT, os.path.join(OUT_DIR, "clarity_vision_pilot.mp4"))
    print(f"\nSummary: grace={g}, clarity={c}", flush=True)
