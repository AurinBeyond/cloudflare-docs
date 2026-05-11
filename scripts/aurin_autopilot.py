"""
AUTOPILOT — retries Grace v2 + Clarity pilot generation every 20 min for up to 12 hours.
Stops when both succeed, or when wall-clock limit reached.
All progress logged to /tmp/aurin_autopilot.log and /app/memory/AUTOPILOT_STATUS.md.
"""
import os, sys, time, traceback, datetime
from dotenv import load_dotenv

sys.path.insert(0, "/app/backend")
load_dotenv("/app/backend/.env")

from emergentintegrations.llm.openai.video_generation import OpenAIVideoGeneration

OUT_DIR = "/app/frontend/public/avatars"
STATUS_FILE = "/app/memory/AUTOPILOT_STATUS.md"
os.makedirs(OUT_DIR, exist_ok=True)

GRACE_PATH = os.path.join(OUT_DIR, "grace_vision_pilot_v2.mp4")
CLARITY_PATH = os.path.join(OUT_DIR, "clarity_vision_pilot.mp4")

GRACE_PROMPT = """A seated bust-up portrait of a woman in her late thirties to early forties, photographed in a softly lit modern room. The single light source is a small warm uplight built flush into the surface of a low side table to her left, embedded beneath a small potted green plant — the light is amber-warm and indirect, casting a soft glow upward through the plant's leaves and outward across her face. The pot itself sits low at the very edge of the frame and is never a focal object. The right side of her face falls into soft warm shadow, not deep darkness.

She has soft warm intelligent eyes with a small natural catch-light reflected in them from the uplight, shoulder-length dark hair falling naturally and lightly tucked behind one ear, and wears a simple linen shirt the colour of warm sand. Her facial expression is calmly professional — neutral but warm and approachable, the look of an experienced quiet mentor who has heard everything before without judgment. Her gaze rests softly forward at a person sitting opposite her at almost eye level — present, level, unjudging. The corners of her mouth hold a barely visible softness — not a smile, but the quiet ease of someone fully here and at peace.

Over 8 seconds, she breathes slowly and visibly, her chest rising and falling once and a half. At second 4 she blinks once, slowly. She does not smile, does not frown — her presence is warm, steady, quietly intelligent, and emotionally light.

The atmosphere is intimate and hushed but not heavy — softly amber-warm, modern and grounded, like a quiet evening living room. The background is deeply out of focus and warm-dark, with only a faint suggestion of ambient glow. Shot on a 50mm lens, shallow depth of field. No camera movement at all — the camera is still, like another person sitting opposite her. Photorealistic but soft, painterly, intimate.

No text, no graphics, no studio lighting feel, no candle, no ritual or spiritual atmosphere, no sadness or heaviness, no clinical or office setting, no AI artefacts."""

CLARITY_PROMPT = """A seated bust-up portrait of a man in his early to mid forties, photographed in a softly lit modern room. The single light source is a small warm uplight built flush into the surface of a low side table to his left, embedded beneath a small potted green plant — the light is amber-warm and indirect, casting a soft glow upward through the plant's leaves and outward across his face. The pot itself sits low at the very edge of the frame and is never a focal object. The right side of his face falls into soft warm shadow, not deep darkness.

He has calm thoughtful steady eyes with a small natural catch-light reflected in them from the uplight, short dark hair with a few strands of grey at the temples, a few days of unshaven shadow on the jaw. He wears a charcoal grey wool sweater. His facial expression is calmly professional — neutral but warm and approachable, the look of an experienced quiet mentor who has heard everything before without judgment. His gaze rests softly forward at a person sitting opposite him at almost eye level — present, level, principled, unrushed. The corners of his mouth hold a barely visible softness — not a smile, but the quiet ease of someone fully here and at peace.

Over 8 seconds, he breathes slowly and visibly, his chest rising and falling once and a half. At second 4 he blinks once, slowly. He does not smile, does not frown — his presence is warm, steady, quietly intelligent, and emotionally light.

The atmosphere is intimate and hushed but not heavy — softly amber-warm, modern and grounded, like a quiet evening living room. The background is deeply out of focus and warm-dark, with only a faint suggestion of ambient glow. Shot on a 50mm lens, shallow depth of field. No camera movement at all — the camera is still, like another person sitting opposite him. Photorealistic but soft, painterly, intimate.

No text, no graphics, no studio lighting feel, no candle, no ritual or spiritual atmosphere, no sadness or heaviness, no clinical or office setting, no AI artefacts."""


def ts():
    return datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S UTC")


def log(msg):
    line = f"[{ts()}] {msg}"
    print(line, flush=True)
    with open("/tmp/aurin_autopilot.log", "a") as f:
        f.write(line + "\n")


def write_status(state, grace_done, clarity_done, attempts, last_err=""):
    backend_url = os.environ.get("REACT_APP_BACKEND_URL", "https://aurin-hub.preview.emergentagent.com")
    with open(STATUS_FILE, "w") as f:
        f.write(f"# AUTOPILOT STATUS\n\n")
        f.write(f"**Last update:** {ts()}\n\n")
        f.write(f"**State:** {state}\n\n")
        f.write(f"**Attempts so far:** {attempts}\n\n")
        f.write(f"**Last error:** `{last_err}`\n\n")
        f.write(f"## Videos\n\n")
        if grace_done and os.path.exists(GRACE_PATH):
            mb = os.path.getsize(GRACE_PATH) / (1024 * 1024)
            f.write(f"- ✅ **Grace v2** ({mb:.2f} MB): {backend_url}/avatars/grace_vision_pilot_v2.mp4\n")
        else:
            f.write(f"- ⏳ Grace v2: pending\n")
        if clarity_done and os.path.exists(CLARITY_PATH):
            mb = os.path.getsize(CLARITY_PATH) / (1024 * 1024)
            f.write(f"- ✅ **Clarity pilot** ({mb:.2f} MB): {backend_url}/avatars/clarity_vision_pilot.mp4\n")
        else:
            f.write(f"- ⏳ Clarity pilot: pending\n")


def try_generate(name, prompt, out_path):
    """Attempt a single Sora 2 generation. Returns (success: bool, err_msg: str).
    Note: emergentintegrations prints API errors to stdout and returns None,
    so we capture stdout during the call to know if it was insufficient_balance."""
    import io
    from contextlib import redirect_stdout
    buf = io.StringIO()
    try:
        with redirect_stdout(buf):
            g = OpenAIVideoGeneration(api_key=os.environ["EMERGENT_LLM_KEY"])
            b = g.text_to_video(prompt=prompt, model="sora-2-pro", size="1024x1792", duration=8, max_wait_time=900)
        captured = buf.getvalue()
        if b:
            g.save_video(b, out_path)
            mb = os.path.getsize(out_path) / (1024 * 1024)
            log(f"✅ DONE {name} ({mb:.2f} MB)")
            return True, ""
        # Failure — return captured stdout as err so caller can detect insufficient_balance
        err_msg = captured.strip().replace("\n", " | ")[:400] or "no_bytes_no_stdout"
        log(f"❌ FAIL {name}: {err_msg[:200]}")
        return False, err_msg
    except Exception as e:
        captured = buf.getvalue()
        err = (captured + " | " + str(e)).strip()[:400]
        log(f"❌ EXC {name}: {err[:200]}")
        return False, err


def is_insufficient_balance(err):
    return "insufficient_balance" in err or "insufficient balance" in err


def main():
    log("=" * 60)
    log("AUTOPILOT START")
    log("Retry every 20 min, max 12 hours, sora-2-pro 8s 1024x1792")
    log("=" * 60)

    grace_done = os.path.exists(GRACE_PATH) and os.path.getsize(GRACE_PATH) > 100000
    clarity_done = os.path.exists(CLARITY_PATH) and os.path.getsize(CLARITY_PATH) > 100000
    attempts = 0
    last_err = ""
    start = time.time()
    max_duration_s = 12 * 60 * 60  # 12 hours
    poll_interval_s = 20 * 60  # 20 min

    write_status("starting", grace_done, clarity_done, attempts, last_err)

    while time.time() - start < max_duration_s:
        attempts += 1
        log(f"--- Attempt {attempts} ---")

        if not grace_done:
            ok, err = try_generate("grace_v2", GRACE_PROMPT, GRACE_PATH)
            if ok:
                grace_done = True
                last_err = ""
            else:
                last_err = err
                if is_insufficient_balance(err):
                    write_status("waiting_for_balance_sync", grace_done, clarity_done, attempts, last_err)
                    log(f"insufficient_balance — sleeping {poll_interval_s}s ({poll_interval_s/60:.0f} min)")
                    time.sleep(poll_interval_s)
                    continue
                else:
                    log(f"non-balance error, will still retry after sleep")
                    write_status("unexpected_error_retrying", grace_done, clarity_done, attempts, last_err)
                    time.sleep(poll_interval_s)
                    continue

        # Grace is done — try Clarity immediately
        if grace_done and not clarity_done:
            time.sleep(5)
            ok, err = try_generate("clarity_pilot", CLARITY_PROMPT, CLARITY_PATH)
            if ok:
                clarity_done = True
                last_err = ""
            else:
                last_err = err
                if is_insufficient_balance(err):
                    write_status("grace_done_clarity_waiting_balance", grace_done, clarity_done, attempts, last_err)
                    log(f"clarity insufficient_balance — sleeping {poll_interval_s}s")
                    time.sleep(poll_interval_s)
                    continue
                else:
                    write_status("grace_done_clarity_error", grace_done, clarity_done, attempts, last_err)
                    time.sleep(poll_interval_s)
                    continue

        if grace_done and clarity_done:
            log("🎉 BOTH VIDEOS DONE — autopilot exits")
            write_status("complete", grace_done, clarity_done, attempts, "")
            return

    log("⏰ 12h timeout reached — autopilot exits")
    write_status("timeout_12h", grace_done, clarity_done, attempts, last_err)


if __name__ == "__main__":
    try:
        main()
    except Exception as e:
        log(f"FATAL: {e}")
        traceback.print_exc()
