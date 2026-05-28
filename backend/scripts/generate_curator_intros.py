"""
generate_curator_intros.py — Generate 15-second intro MP3s for the
three remaining adult-room curators (Grace, Sara, Alistair).
Mirrors `generate_kaelan_intro.py`.

§CURATOR-INTROS-POC 2026-05-28 — Founder directive: unified luxury
intro ritual across all four adult rooms. Pre-rendered static MP3s,
zero realtime cost, zero latency.

Usage:
    python3 backend/scripts/generate_curator_intros.py
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

API_KEY = os.environ["ELEVENLABS_API_KEY"]
OUTPUT_DIR = Path("/app/frontend/public/audio")

# §CURATOR-INTRO-TEXTS — locked 2026-05-28 by founder.
# Same 4-beat pattern as Kaelan: 1) "You found the X Room. I'm Y."
# 2) one sentence describing the room's soul, 3) one soft invitation.
INTROS = {
    "grace": {
        "voice_id": os.environ["ELEVENLABS_VOICE_GRACE"],  # Rachel — warm narration
        "text": (
            "You found the Confession Room. I'm Grace. "
            "Some sentences live in the body for years, "
            "waiting for one quiet place to be said out loud. "
            "There is no judgement here, and no answer to chase. "
            "Only the room. Speak when you are ready."
        ),
        # Slightly higher stability so Grace's warmth doesn't drift.
        "settings": VoiceSettings(
            stability=0.55, similarity_boost=0.82, style=0.12,
            use_speaker_boost=True,
        ),
    },
    "sara": {
        "voice_id": os.environ.get("ELEVENLABS_VOICE_FEMALE", "2cmw3pVpSgQyjo7Vu8fX"),
        "text": (
            "You found the Parents' Room. I'm Sara. "
            "You are not here because you are doing it wrong — "
            "you are here because you care, more than you can say. "
            "Whatever the day has been, sit down. "
            "We listen together."
        ),
        "settings": VoiceSettings(
            stability=0.58, similarity_boost=0.84, style=0.10,
            use_speaker_boost=True,
        ),
    },
    "alistair": {
        "voice_id": os.environ.get("ELEVENLABS_VOICE_MALE", "pNInz6obpgDQGcFmaJgB"),
        "text": (
            "You found the Course Room. I'm Alistair. "
            "You already work harder than most people will ever understand. "
            "This room will not add another task to your list. "
            "It will help you set down the ones that were never yours. "
            "Begin when you choose."
        ),
        # Slightly lower style — Alistair is precise, not warm.
        "settings": VoiceSettings(
            stability=0.60, similarity_boost=0.80, style=0.05,
            use_speaker_boost=True,
        ),
    },
}


def main() -> None:
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    client = ElevenLabs(api_key=API_KEY, timeout=30.0)

    for slug, cfg in INTROS.items():
        out = OUTPUT_DIR / f"{slug}-intro.mp3"
        audio_iter = client.text_to_speech.convert(
            text=cfg["text"],
            voice_id=cfg["voice_id"],
            model_id="eleven_multilingual_v2",
            voice_settings=cfg["settings"],
            output_format="mp3_44100_128",
            language_code="en",
        )
        with open(out, "wb") as f:
            for chunk in audio_iter:
                if chunk:
                    f.write(chunk)
        kb = out.stat().st_size / 1024
        print(f"✓ {slug:9s} → {out.name} ({kb:.1f} KB · voice {cfg['voice_id']})")


if __name__ == "__main__":
    main()
