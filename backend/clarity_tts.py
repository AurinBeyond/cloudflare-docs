"""
clarity_tts.py — OpenAI TTS wrapper for the Clarity Release guide voice.

Voice choice (founder directive: safe, natural, human, calming, soft,
about one gram sweet, never broken):
    female  → "coral"   (warm, friendly — closest to a soothing companion)
    male    → "echo"    (smooth, calm)

Model: tts-1-hd. Quality matters more than cost for intimate sessions.
Speed: 0.86 — slightly slower than default. Stage 2.8d humanization
       directive: drop from 0.92 to remove residual machine-edge.
Format: mp3 (browser-native).
"""
from __future__ import annotations

import os
import re
from typing import Literal

from emergentintegrations.llm.openai import OpenAITextToSpeech


VoiceGender = Literal["female", "male"]

VOICE_FOR_GENDER = {
    "female": "coral",
    "male": "echo",
}

DEFAULT_MODEL = "tts-1-hd"
DEFAULT_SPEED = 0.82
TTS_MAX_CHARS = 4000  # OpenAI cap is 4096, leave a small margin


# -- Subtle pacing prep ---------------------------------------------
# The model often emits long em-dash chains ("— and yet —") that the
# TTS reads as a clipped beat rather than a breath. We rewrite a few
# patterns so the audio carries a calmer rhythm without rewriting the
# wanderer's actual words.
_EM_DASH_PAUSE = re.compile(r"\s*—\s*")
_DOUBLE_LINEBREAK = re.compile(r"\n\s*\n")
_STRIP_MD_BOLD = re.compile(r"\*\*(.+?)\*\*")
_STRIP_MD_ITALIC = re.compile(r"(?<!\*)\*([^*\n]+?)\*(?!\*)")


def _humanize_for_speech(text: str) -> str:
    """Return a slightly re-punctuated version of `text` so OpenAI TTS
    pronounces it with calmer pacing. Non-destructive: no semantic
    rewriting, no word changes — only pause shaping.
    """
    if not text:
        return text
    out = text
    # Strip Markdown emphasis markers (TTS reads them literally otherwise).
    out = _STRIP_MD_BOLD.sub(r"\1", out)
    out = _STRIP_MD_ITALIC.sub(r"\1", out)
    # Em-dash → soft comma. Keeps the pause but feels less staccato.
    out = _EM_DASH_PAUSE.sub(", ", out)
    # Double line breaks already give a long breath; OpenAI honours
    # them. Single line breaks become a comma+space if not already
    # punctuated, so phrases land with a small breath.
    lines = out.split("\n")
    re_punct_end = re.compile(r"[\.\?\!,:;…]\s*$")
    fixed = []
    for ln in lines:
        s = ln.strip()
        if not s:
            fixed.append("")
            continue
        if not re_punct_end.search(s):
            s = s + ","
        fixed.append(s)
    out = "\n".join(fixed)
    # Replace 3+ line breaks with double (max one breath).
    out = re.sub(r"\n{3,}", "\n\n", out)
    # Collapse spaces around the new commas.
    out = re.sub(r"\s+,", ",", out)
    out = re.sub(r",\s*,", ", ", out)
    out = re.sub(r" {2,}", " ", out)
    return out.strip()


def is_configured() -> bool:
    return bool(os.getenv("EMERGENT_LLM_KEY"))


async def synthesize_speech(
    text: str,
    gender: VoiceGender = "female",
) -> bytes:
    """Return MP3 audio bytes for the given text. Raises RuntimeError
    if the LLM key is not configured."""
    api_key = os.getenv("EMERGENT_LLM_KEY")
    if not api_key:
        raise RuntimeError("EMERGENT_LLM_KEY not configured")

    clean = (text or "").strip()
    if not clean:
        raise ValueError("Empty text")
    if len(clean) > TTS_MAX_CHARS:
        clean = clean[:TTS_MAX_CHARS]

    # Stage 2.8d: shape pauses before sending to OpenAI.
    clean = _humanize_for_speech(clean)

    voice = VOICE_FOR_GENDER.get(gender, "coral")
    tts = OpenAITextToSpeech(api_key=api_key)
    audio = await tts.generate_speech(
        text=clean,
        model=DEFAULT_MODEL,
        voice=voice,
        speed=DEFAULT_SPEED,
        response_format="mp3",
    )
    return audio
