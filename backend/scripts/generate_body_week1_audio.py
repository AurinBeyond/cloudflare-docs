"""
generate_body_week1_audio.py — Master-class audio for Week 1 of
The Body Architecture: "The First Key — The Breath".

§BODY-ARCH-WEEK1-AUDIO 2026-05-28 — Founder PoC directive: build one
luxury masterclass audio first; founder auditions on live preview;
greenlit only after listen-and-approve, no batch generation.

Voice: ElevenLabs Daniel (ELEVENLABS_VOICE_KAELAN). Storyteller cadence,
deep and unhurried. Pause-rich. ~5 minutes spoken time.

Usage:
    python3 backend/scripts/generate_body_week1_audio.py
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
VOICE_ID = os.environ["ELEVENLABS_VOICE_KAELAN"]
OUTPUT = Path("/app/frontend/public/audio/body-architecture-week1-breath.mp3")

# §SCRIPT-LOCKED 2026-05-28 — Approved language register:
#   - Anti-wellness: no therapy / heal / cure / mindful / treatment
#   - Architecture vocabulary: structure, the room, the floor, the breath
#   - Reichian / Maté nods folded into house tone (never named in audio)
#   - ~700-750 words at storyteller pacing ≈ 4-5 min spoken
SCRIPT = """
[deliberate pause]

You found the first key.

Of the four ancient keys of the body architecture — the breath, the armor, the radical pause, and coming home — this one was always first, because it was here before you had a name. The body has been breathing for you since long before you could read, long before you could disagree with it, long before you learned that effort was a virtue. The breath was your first companion, and it has not left.

[soft pause]

This week, we do something the body has been waiting for, very quietly, for a long time. We listen.

Not to fix the breath. Not to improve it. Not to extract more oxygen, or longer life, or better focus from it. We listen to the breath the way you would listen to an old friend who has been sitting at your kitchen table for thirty years, waiting for you to look up.

Most of what the world calls breathing is, in truth, a very polite preparation for the next sentence. The shoulders rise. The collarbones lift. The throat tightens for the word that has not yet arrived. This is the breath of someone who has been getting ready to defend themselves their whole life, even when no one was attacking. You may recognise it. The body has been doing it for you, beautifully, for many years, so that you could keep living in a world that asked too much.

[long pause]

The first key is not a technique. It is a return.

When the body has lived too long in the shallow upper chest, the diaphragm forgets it is allowed to be wide. The belly forgets it is allowed to be soft. The throat forgets that words do not always have to come — that sometimes the wisest sentence is the one that stays in the body, complete, unspoken, and intact.

So this week, three times a day, you are going to do something almost embarrassingly simple. You are going to find one quiet place — your car before you leave it, the corner of a room where no one will ask anything of you, the moment between waking and standing — and you are going to take one long, unhurried exhale. Not deep. Long. There is a difference.

A deep breath is the breath of someone who has been told they need to perform health. A long exhale is the breath of someone who has decided, very quietly, to stop performing.

[pause]

Lengthen the exhale until it is longer than the inhale. Do not count. The body does not need a number to know what slow is. Let the air leave through a soft, slightly open mouth, the way you might exhale near a sleeping child you do not want to wake. Two or three rounds is enough. The architecture has begun.

[soft pause]

What we are doing this week is not breathing exercise. We are not optimising lung capacity. We are gently telling the nervous system — which has spent a great deal of your adult life in a low, civilised state of alarm — that the room is safe, that the door is locked, that the floor is doing its share, and that the next thirty seconds do not require defending.

This is the architecture of a body that has come home to its own walls. Nothing is performed. Nothing is shown. The breath becomes structural the way a foundation is structural: present, unannounced, holding up everything else.

[pause]

If you notice this week that the breath catches when you read a message, when you walk into a room, when you remember something you would rather not remember — do not correct it. Do not deepen, do not lengthen, do not fix. Only notice. The body is showing you, very honestly, where the old armor is. We will visit that armor next week. This week, we only listen.

[soft pause]

Some of you will find that the long exhale, the third or fourth time you do it, brings something close to tears. This is not a malfunction. This is the body releasing a small amount of vigilance that has been held for years, sometimes for decades. There is nothing to do with the tears. They are not a sign. They are the body, doing the quiet work of being a body again.

You are allowed to be moved by your own breath.

[long pause]

That is the first key. Three long exhales, three times a day, for seven days. No app, no count, no measurement. The room will hold the rhythm for you.

Welcome home.

[final pause]
""".strip()


def main() -> None:
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    client = ElevenLabs(api_key=API_KEY, timeout=120.0)

    # Storyteller-cadence settings: slightly higher stability for a
    # 5-minute take (no drift), modest style for warmth, speaker boost on.
    settings = VoiceSettings(
        stability=0.62,
        similarity_boost=0.82,
        style=0.18,
        use_speaker_boost=True,
    )

    audio_iter = client.text_to_speech.convert(
        text=SCRIPT,
        voice_id=VOICE_ID,
        model_id="eleven_multilingual_v2",
        voice_settings=settings,
        output_format="mp3_44100_192",
        language_code="en",
    )

    with open(OUTPUT, "wb") as f:
        for chunk in audio_iter:
            if chunk:
                f.write(chunk)

    size_kb = OUTPUT.stat().st_size / 1024
    print(f"✓ Wrote {OUTPUT.name}")
    print(f"  Size: {size_kb:.1f} KB")
    print(f"  Voice: Daniel ({VOICE_ID})")
    print(f"  Word count: {len(SCRIPT.split())}")


if __name__ == "__main__":
    main()
