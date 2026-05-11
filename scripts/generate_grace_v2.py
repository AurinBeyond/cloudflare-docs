"""
Faas 1: Grace v2 + Clarity pilot. 8s, sora-2-pro, 1024x1792.
"""
import os, sys, time, traceback
from dotenv import load_dotenv

sys.path.insert(0, "/app/backend")
load_dotenv("/app/backend/.env")

from emergentintegrations.llm.openai.video_generation import OpenAIVideoGeneration

OUT_DIR = "/app/frontend/public/avatars"
os.makedirs(OUT_DIR, exist_ok=True)

GRACE = """A seated bust-up portrait of a woman in her late thirties to early forties, photographed in a softly lit modern room. The single light source is a small warm uplight built flush into the surface of a low side table to her left, embedded beneath a small potted green plant — the light is amber-warm and indirect, casting a soft glow upward through the plant's leaves and outward across her face. The pot itself sits low at the very edge of the frame and is never a focal object. The right side of her face falls into soft warm shadow, not deep darkness.

She has soft warm intelligent eyes with a small natural catch-light reflected in them from the uplight, shoulder-length dark hair falling naturally and lightly tucked behind one ear, and wears a simple linen shirt the colour of warm sand. Her facial expression is calmly professional — neutral but warm and approachable, the look of an experienced quiet mentor who has heard everything before without judgment. Her gaze rests softly forward at a person sitting opposite her at almost eye level — present, level, unjudging. The corners of her mouth hold a barely visible softness — not a smile, but the quiet ease of someone fully here and at peace.

Over 8 seconds, she breathes slowly and visibly, her chest rising and falling once and a half. At second 4 she blinks once, slowly. She does not smile, does not frown — her presence is warm, steady, quietly intelligent, and emotionally light.

The atmosphere is intimate and hushed but not heavy — softly amber-warm, modern and grounded, like a quiet evening living room. The background is deeply out of focus and warm-dark, with only a faint suggestion of ambient glow. Shot on a 50mm lens, shallow depth of field. No camera movement at all — the camera is still, like another person sitting opposite her. Photorealistic but soft, painterly, intimate.

No text, no graphics, no studio lighting feel, no candle, no ritual or spiritual atmosphere, no sadness or heaviness, no clinical or office setting, no AI artefacts."""

CLARITY = """A seated bust-up portrait of a man in his early to mid forties, photographed in a softly lit modern room. The single light source is a small warm uplight built flush into the surface of a low side table to his left, embedded beneath a small potted green plant — the light is amber-warm and indirect, casting a soft glow upward through the plant's leaves and outward across his face. The pot itself sits low at the very edge of the frame and is never a focal object. The right side of his face falls into soft warm shadow, not deep darkness.

He has calm thoughtful steady eyes with a small natural catch-light reflected in them from the uplight, short dark hair with a few strands of grey at the temples, a few days of unshaven shadow on the jaw. He wears a charcoal grey wool sweater. His facial expression is calmly professional — neutral but warm and approachable, the look of an experienced quiet mentor who has heard everything before without judgment. His gaze rests softly forward at a person sitting opposite him at almost eye level — present, level, principled, unrushed. The corners of his mouth hold a barely visible softness — not a smile, but the quiet ease of someone fully here and at peace.

Over 8 seconds, he breathes slowly and visibly, his chest rising and falling once and a half. At second 4 he blinks once, slowly. He does not smile, does not frown — his presence is warm, steady, quietly intelligent, and emotionally light.

The atmosphere is intimate and hushed but not heavy — softly amber-warm, modern and grounded, like a quiet evening living room. The background is deeply out of focus and warm-dark, with only a faint suggestion of ambient glow. Shot on a 50mm lens, shallow depth of field. No camera movement at all — the camera is still, like another person sitting opposite him. Photorealistic but soft, painterly, intimate.

No text, no graphics, no studio lighting feel, no candle, no ritual or spiritual atmosphere, no sadness or heaviness, no clinical or office setting, no AI artefacts."""


def gen(name, prompt, path):
    print(f"[{time.strftime('%H:%M:%S')}] >> START {name}", flush=True)
    try:
        g = OpenAIVideoGeneration(api_key=os.environ["EMERGENT_LLM_KEY"])
        b = g.text_to_video(prompt=prompt, model="sora-2-pro", size="1024x1792", duration=8, max_wait_time=900)
        if b:
            g.save_video(b, path)
            mb = os.path.getsize(path) / (1024 * 1024)
            print(f"[{time.strftime('%H:%M:%S')}] DONE {name} ({mb:.2f} MB)", flush=True)
            return True
        print(f"[{time.strftime('%H:%M:%S')}] FAIL {name}", flush=True)
        return False
    except Exception as e:
        print(f"[{time.strftime('%H:%M:%S')}] EXC {name}: {e}", flush=True)
        traceback.print_exc()
        return False


if __name__ == "__main__":
    g_ok = gen("grace_v2", GRACE, os.path.join(OUT_DIR, "grace_vision_pilot_v2.mp4"))
    if g_ok:
        c_ok = gen("clarity_pilot", CLARITY, os.path.join(OUT_DIR, "clarity_vision_pilot.mp4"))
        print(f"\nSUMMARY grace={g_ok} clarity={c_ok}", flush=True)
    else:
        print(f"\nSUMMARY grace=FAIL — not attempting clarity", flush=True)
