"""
clarity_stt.py — OpenAI Whisper wrapper for the voice-first input loop.

The Clarity Release and Body Room push-to-talk button records browser
audio with MediaRecorder, sends it to /api/clarity/stt, and the server
transcribes it with Whisper-1. Cheaper than naming a new model; the
voice never leaves the wanderer's session.

Privacy:
  • Audio is processed in-memory and discarded immediately.
  • Only the final transcript is returned to the client; the client
    decides whether to send it as a chat turn.
  • Request is bound to the user's bearer token (same as TTS).

Limits:
  • OpenAI Whisper hard-cap: 25 MB per request.
  • We also cap on duration via the client (≤ 60 s push-to-talk).
"""
from __future__ import annotations

import io
import os
from typing import Optional

from emergentintegrations.llm.openai import OpenAISpeechToText


STT_MODEL = "whisper-1"
STT_MAX_BYTES = 24 * 1024 * 1024  # 24 MB safety margin


def is_configured() -> bool:
    return bool(os.getenv("EMERGENT_LLM_KEY"))


async def transcribe_audio(
    audio_bytes: bytes,
    filename: str = "audio.webm",
    language: Optional[str] = None,
) -> str:
    """Transcribe a single audio blob and return the plain transcript.

    Raises RuntimeError if the LLM key is not configured, ValueError for
    bad input, and any underlying SDK exception otherwise.
    """
    api_key = os.getenv("EMERGENT_LLM_KEY")
    if not api_key:
        raise RuntimeError("EMERGENT_LLM_KEY not configured")

    if not audio_bytes:
        raise ValueError("Empty audio")
    if len(audio_bytes) > STT_MAX_BYTES:
        raise ValueError("Audio file is too large")

    # The SDK accepts a file-like with a .name attribute (or filename
    # tuple). A BytesIO with .name is the simplest path.
    buf = io.BytesIO(audio_bytes)
    buf.name = filename or "audio.webm"

    stt = OpenAISpeechToText(api_key=api_key)
    kwargs = dict(file=buf, model=STT_MODEL, response_format="json")
    if language:
        kwargs["language"] = language
    response = await stt.transcribe(**kwargs)

    text = getattr(response, "text", None)
    if text is None and isinstance(response, dict):
        text = response.get("text")
    return (text or "").strip()
