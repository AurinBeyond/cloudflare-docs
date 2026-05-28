"""
generate_kaelan_intro.py — One-shot script to generate Kaelan's
15-second introduction MP3 via ElevenLabs (Daniel voice).

§KAELAN-VOICE-POC 2026-05-28 — Founder directive: ship a pre-recorded
luxury intro before any realtime ConvAI integration. The file is
written ONCE and served as a static asset, so playback latency is
zero and the founder can audition the voice before approving deeper
voice work.

Usage:
    python3 backend/scripts/generate_kaelan_intro.py
"""
from __future__ import annotations

import os
import sys
from pathlib import Path

sys.path.insert(0, "/app/backend")
from dotenv import load_dotenv
load_dotenv("/app/backend/.env")

from elevenlabs.client import ElevenLabs
from elevenlabs import VoiceSettings

VOICE_ID = os.environ["ELEVENLABS_VOICE_KAELAN"]  # Daniel
API_KEY = os.environ["ELEVENLABS_API_KEY"]
OUTPUT = Path("/app/frontend/public/audio/kaelan-intro.mp3")

# §KAELAN-INTRO-TEXT — locked 2026-05-28 by founder.
# ~15s spoken at storyteller pacing. Soft, warm, never clinical.
INTRO_TEXT = (
    "You found the Body Room. I'm Kaelan. "
    "The body has carried you here through everything — "
    "without instructions, without applause. "
    "Tonight, we listen to it. No measuring, no fixing. "
    "Just one quiet breath, on purpose, at last."
)


def main() -> None:
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)

    client = ElevenLabs(api_key=API_KEY, timeout=30.0)

    # Founder spec: storyteller cadence, deep and unhurried.
    # Stability slightly higher than Grace default (0.50 → 0.55) so
    # the voice does not drift across the 15-second take. Style 0.10
    # adds a touch of emotional shape without performance.
    settings = VoiceSettings(
        stability=0.55,
        similarity_boost=0.82,
        style=0.10,
        use_speaker_boost=True,
    )

    audio_iter = client.text_to_speech.convert(
        text=INTRO_TEXT,
        voice_id=VOICE_ID,
        model_id="eleven_multilingual_v2",
        voice_settings=settings,
        output_format="mp3_44100_128",
        language_code="en",
    )

    with open(OUTPUT, "wb") as f:
        for chunk in audio_iter:
            if chunk:
                f.write(chunk)

    size_kb = OUTPUT.stat().st_size / 1024
    print(f"✓ Wrote {OUTPUT} ({size_kb:.1f} KB)")
    print(f"  Voice: Daniel ({VOICE_ID})")
    print(f"  Text:  {INTRO_TEXT!r}")


if __name__ == "__main__":
    main()
