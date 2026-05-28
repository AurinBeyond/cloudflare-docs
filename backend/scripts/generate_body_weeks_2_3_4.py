"""
generate_body_weeks_2_3_4.py — Master-class audios for Weeks 2-4 of
The Body Architecture (locked 2026-05-28 by founder after Week 1 PoC
approval).

Each script ≈ 700-800 words, ~5 minutes spoken at Daniel's
storyteller pace. Same VoiceSettings as Week 1.

Usage:
    python3 backend/scripts/generate_body_weeks_2_3_4.py
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

WEEKS = {
    "week2-armor": {
        "title": "The Second Key — Listening to the Armor",
        "filename": "body-architecture-week2-armor.mp3",
        "script": """
[deliberate pause]

You found the second key.

Last week was the breath. This week we listen to what the breath has been holding for you — quietly, patiently, sometimes for decades. The body has built itself a kind of architecture over the years, in response to a world that asked for things you could not always give. The jaw that holds the unspoken sentence. The shoulders that carry the weight of someone else's expectation. The lower back that has been bracing, for a long time, against a fall that never quite came. We will not call this damage. We will call it work. The body has been doing this work for you.

[soft pause]

There is an old word for what we are visiting this week. The Austrian observer Wilhelm Reich called it character armor. Not because the body is a knight, but because the muscles, over years, learn to hold a shape that protects something tender underneath. The shape is intelligent. It made sense, once. The shape is also old, and very tired, and ready to be listened to.

This week, three times — not three times a day, but three times across the week — you are going to find a quiet room, a closed door, and twenty minutes you do not owe to anyone else. You are going to lie back, or sit comfortably, and you are going to do something almost embarrassingly slow. You are going to scan the body from the crown of the head to the soles of the feet, and you are going to listen.

[pause]

Not to fix. Not to release. Not to breathe into anything. Only to listen.

You begin at the top — the forehead, the brow, the small muscles around the eyes. Notice what is held. Do not unclench. Just notice. The eyes are an old guard; they have been doing this for many years. Then the jaw, where so many sentences live. Then the throat. Then the neck and the small bridge of muscle at the base of the skull, where the head has been carried as though it were heavier than it is.

[long pause]

Move down. The shoulders. The clavicles. The space between them, where the breath has often been getting ready to defend. The chest — wide, and a little less wide than it could be. The diaphragm, which Reich called the most patient of all the rings. The belly, which has been bracing softly since you were small. The hips and the pelvis, which carry more than they admit. The thighs. The knees. The calves. The soles of the feet, which have been holding you up your whole life and never once complained.

This is the architecture you have been living inside. None of it is wrong. All of it has been doing exactly the job it was given.

[soft pause]

What we do now is not a release exercise. It is the opposite. We simply allow the body to notice that someone — finally, you — is paying attention. The body has not had this in a long time. It will respond, quietly. Some places will soften without your permission, because being seen is enough. Other places will not soften at all this week, and that is also right. The armor is not the enemy. It is a long letter the body wrote when the world was loud, and we are reading it slowly.

[pause]

Sometimes, during this scan, a small wave will pass through. A trembling. A long sigh. A piece of memory you had forgotten you were storing in a shoulder, or a knee. There is nothing to do with it. You do not need to understand it. The body knows what to do with what it is given, when it is given a witness. The Canadian physician Gabor Maté wrote that chronic illness often arrives in those who could not say no. The body's no, when it is finally heard, sometimes leaves as a breath that is wider than the one before.

[long pause]

This week, the only task is the listening. No protocol, no count, no measurement. Three slow body-scans, twenty minutes each, somewhere quiet. The armor is not removed. The armor is read. And what is read by a kind witness begins, in its own time, to soften.

We do not hurry this part.

[final pause]
""".strip(),
    },
    "week3-pause": {
        "title": "The Third Key — The Radical Pause",
        "filename": "body-architecture-week3-pause.mp3",
        "script": """
[deliberate pause]

You found the third key.

This week's practice is simpler than any of the others, and harder for almost everyone. You are going to stop. Not because you have finished, not because the work is done, not because the world has given you permission. You are going to stop because the body has been asking for this for a very long time, and we are finally going to answer.

[soft pause]

Modern life has built a strange story about rest. It has told you that rest is a reward — earned after enough effort, deserved only when the inbox is empty, granted to you by an external authority who will eventually say, you have done enough, you may now sit down. The trouble is, that authority does not exist. The inbox is never empty. And rest, as the Canadian physician Gabor Maté observed, is not the reward for a productive life. Rest is the foundation that makes any life possible.

The body has been quietly issuing receipts for years. The shoulder that flares before a meeting. The afternoon headache. The sleep that no longer arrives clean. The small, almost unnoticed flatness behind the eyes when you wake up. These are not failures of discipline. They are the body, doing its honest accounting, reminding you that something has been withdrawn from an account you never meant to overdraw.

[pause]

This week, for seven days, you are going to add one practice and remove one practice. Just one of each.

The practice you add: one daily, deliberate pause of fifteen to twenty minutes during which you do nothing. Not nap. Not scroll. Not listen to a podcast. Not read. Not think productively. You sit, or lie back, or stand at a window, and you let the world continue without your supervision. Fifteen minutes. The wisdom traditions called this many things — some called it the long exhale of the day. We will call it nothing. That is closer to what it actually is.

[long pause]

The practice you remove: one small obligation you took on out of politeness, out of guilt, out of the soft pressure of being someone who can be relied upon. Just one. The committee you no longer want to be on. The newsletter you say yes to out of habit. The recurring meeting that has not produced a single useful sentence in eighteen months. Remove only one. The room remembers. The space is real.

You will notice this week, on day three or four, a strange feeling that is sometimes mistaken for sadness. It is not sadness. It is the nervous system, having spent years in a low-grade emergency, registering that the emergency has been called off and not yet knowing what to do with the spare energy. This is a good feeling, even when it feels uncomfortable. Let it stay. It will sort itself.

[pause]

There is no measurement here. No tracker, no app, no streak. The body is not a system to be optimised this week — it is a guest you are finally treating properly. You give it the seat by the window. You let it have the long, unhurried conversation it has been waiting to have with itself.

[soft pause]

On the seventh day, if you have done even four or five of the daily pauses, you will notice something quietly architectural inside you. A small, structural calm that was not there last week. A capacity to receive a difficult message without immediately defending. A breath that is longer at the bottom. You did not earn it. You allowed it.

That is the third key.

The mountain is patient. The well refills in silence. The body has been waiting a long time to teach you this.

[final pause]
""".strip(),
    },
    "week4-home": {
        "title": "The Fourth Key — Coming Home to the Body",
        "filename": "body-architecture-week4-home.mp3",
        "script": """
[deliberate pause]

You found the fourth and final key.

Three weeks ago, we began with the breath. Two weeks ago, we listened to the armor. Last week, we stopped. This week, we come home.

[soft pause]

The word home is a difficult one. The world has been very busy in your lifetime, telling you that home is a place you must build, a status you must earn, a reward at the end of a long climb. The body has been holding a quieter truth the whole time: you have never not been home. The body has been the home all along. You have only been away from it — busy, distracted, defending, deciding. The body did not leave. You did. And the body, with its long patience, has been keeping the lights on, the door unlocked, the kitchen warm, in case you remembered.

This week, you are going to remember.

[pause]

There is nothing to do this week. No scan, no exercise, no protocol. Only one quiet question, which you will ask the body three times — perhaps in the morning, perhaps in the afternoon, perhaps just before sleep. The question is this: where are you? Not where do you hurt. Not where is there tension. Only — where are you, today? The body, asked kindly and without agenda, almost always answers. Sometimes it answers in the chest. Sometimes in the hands, or behind the eyes, or in a small warm place in the belly that you had forgotten existed. There is no right answer. The asking is the practice.

[long pause]

What you have built across these twenty-eight days is not a new body. It is a friendlier relationship with the one you have always had. The breath is wider, not because you trained it, but because you stopped defending against it. The armor is softer in some places, not because you forced it, but because you finally read what it had written. The nervous system is quieter, not because you optimised it, but because you stopped asking it to perform.

The architecture of the body is the architecture of the life. A house that is kindly inhabited is a different building than a house that is merely occupied. You have begun to inhabit yourself kindly. That is the entire teaching. Every wisdom tradition we drew from this month — the old Estonian work on the body's forgiveness, the Austrian observer's character armor, the Canadian physician's long, careful writing about the body that says no — they all point at the same simple fact: the body is not your project. The body is your home, your companion, and the most truthful witness you will ever have.

[pause]

Some of you, this week, will notice that you have grown quieter. That a friend or a partner has remarked, you seem less in a hurry. That the morning, which used to begin with three urgent thoughts, now begins with one. That you can sit through a difficult conversation without holding the breath. Do not make a method of it. Do not write a book about it. Let it stay small, and structural, and yours.

[soft pause]

The four keys — the breath, the armor, the radical pause, and the coming home — are not a course you have finished. They are the four corners of a room you can walk back into any time. Some weeks the breath will be more useful. Some seasons, the long pause. Some years, the slow listening to a part of the body that has begun, finally, to speak. The room remains. The keys remain. The body remains.

You did not become someone new this month. You simply came home.

Welcome.

[final pause]
""".strip(),
    },
}


def main() -> None:
    out_dir = Path("/app/frontend/public/audio")
    out_dir.mkdir(parents=True, exist_ok=True)
    client = ElevenLabs(api_key=API_KEY, timeout=180.0)

    settings = VoiceSettings(
        stability=0.62,
        similarity_boost=0.82,
        style=0.18,
        use_speaker_boost=True,
    )

    for slug, cfg in WEEKS.items():
        out = out_dir / cfg["filename"]
        print(f"… generating {cfg['title']}")
        audio_iter = client.text_to_speech.convert(
            text=cfg["script"],
            voice_id=VOICE_ID,
            model_id="eleven_multilingual_v2",
            voice_settings=settings,
            output_format="mp3_44100_192",
            language_code="en",
        )
        with open(out, "wb") as f:
            for chunk in audio_iter:
                if chunk:
                    f.write(chunk)
        kb = out.stat().st_size / 1024
        words = len(cfg["script"].split())
        print(f"  ✓ {out.name} · {kb:.1f} KB · {words} words")


if __name__ == "__main__":
    main()
