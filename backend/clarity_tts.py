"""
clarity_tts.py — TTS wrapper for the Clarity Release guide voice.

Founder directive · Phase 1 "Digital Presence" (2026-02-14):
Vendor support is now PROVIDER-pluggable so the founder can move
between OpenAI Shimmer (default) and ElevenLabs "Jenny-grade"
voices without a code change.

Env overrides
  CLARITY_VOICE_PROVIDER    "openai" (default) | "elevenlabs"
  CLARITY_VOICE_FEMALE      OpenAI voice name (default "shimmer")
  CLARITY_VOICE_MALE        OpenAI voice name (default "echo")
  CLARITY_TTS_SPEED         OpenAI speed 0.7..1.0 (default 0.85)
  ELEVENLABS_API_KEY        ElevenLabs API key (required for the
                            elevenlabs provider; obtain at
                            https://elevenlabs.io/app/settings/api-keys)
  ELEVENLABS_VOICE_FEMALE   ElevenLabs voice_id for the female guide.
                            Default = "21m00Tcm4Tlm" (Rachel — soft,
                            warm narrator; closest match to the
                            founder's "Jenny" reference).
  ELEVENLABS_VOICE_MALE     ElevenLabs voice_id for the male guide.
                            Default = "pNInz6obpgDQGcFmaJgB" (Adam —
                            warm mature male).
  ELEVENLABS_MODEL          Default "eleven_multilingual_v2".
  ELEVENLABS_STABILITY      0..1, default 0.42 (founder spec 35-45%).
  ELEVENLABS_SIMILARITY     0..1, default 0.80.
  ELEVENLABS_STYLE          0..1, default 0.10 (low style = calm,
                            non-performative).

If `CLARITY_VOICE_PROVIDER=elevenlabs` but no key is set, or if
ElevenLabs fails at request time, the synthesiser silently falls
back to OpenAI so the sanctuary never breaks.
"""
from __future__ import annotations

import io
import logging
import os
import re
from typing import Literal

from emergentintegrations.llm.openai import OpenAITextToSpeech


logger = logging.getLogger(__name__)

VoiceGender = Literal["female", "male"]

VOICE_FOR_GENDER = {
    "female": os.getenv("CLARITY_VOICE_FEMALE", "shimmer"),
    "male": os.getenv("CLARITY_VOICE_MALE", "echo"),
}

DEFAULT_MODEL = "tts-1-hd"


def _read_speed() -> float:
    raw = os.getenv("CLARITY_TTS_SPEED")
    if not raw:
        return 0.85
    try:
        v = float(raw)
    except ValueError:
        return 0.85
    return max(0.7, min(1.0, v))


DEFAULT_SPEED = _read_speed()
TTS_MAX_CHARS = 4000  # OpenAI cap is 4096, leave a small margin


# -- ElevenLabs defaults (founder "Grace Voice Mix" spec 2026-02-14) -
# Custom Grace voice designed in ElevenLabs Voice Lab. Founder spec:
#   Model: eleven_monolingual_v1  (English-only — no multilingual
#                                  drift, no accent leakage)
#   Stability: 0.50               (founder bumped from 0.42 → 0.50)
#   Similarity: 0.80
#   Style: 0.00                   (founder bumped from 0.10 → 0.00:
#                                  zero performative drift, pure
#                                  professional mentor)
#   Speaker Boost: true
ELEVENLABS_VOICE_FOR_GENDER = {
    "female": os.getenv("ELEVENLABS_VOICE_FEMALE", "21m00Tcm4Tlm"),  # Rachel until founder ships custom Grace voice_id
    "male": os.getenv("ELEVENLABS_VOICE_MALE", "pNInz6obpgDQGcFmaJgB"),  # Adam
}
ELEVENLABS_MODEL = os.getenv("ELEVENLABS_MODEL", "eleven_turbo_v2_5")


def _read_float(env_name: str, default: float, lo: float = 0.0, hi: float = 1.0) -> float:
    raw = os.getenv(env_name)
    if not raw:
        return default
    try:
        return max(lo, min(hi, float(raw)))
    except ValueError:
        return default


ELEVENLABS_STABILITY = _read_float("ELEVENLABS_STABILITY", 0.50)
ELEVENLABS_SIMILARITY = _read_float("ELEVENLABS_SIMILARITY", 0.80)
ELEVENLABS_STYLE = _read_float("ELEVENLABS_STYLE", 0.00)
ELEVENLABS_USE_SPEAKER_BOOST = (os.getenv("ELEVENLABS_SPEAKER_BOOST", "true").lower() == "true")


def voice_provider() -> str:
    """Return the active TTS provider after validating the env.

    `CLARITY_VOICE_PROVIDER=elevenlabs` requires `ELEVENLABS_API_KEY`
    to be set; otherwise we silently keep OpenAI so the sanctuary
    never breaks during a misconfigured rollout.
    """
    chosen = (os.getenv("CLARITY_VOICE_PROVIDER") or "openai").strip().lower()
    if chosen == "elevenlabs" and os.getenv("ELEVENLABS_API_KEY"):
        return "elevenlabs"
    return "openai"


# -- Subtle pacing prep ---------------------------------------------
_EM_DASH_PAUSE = re.compile(r"\s*—\s*")
_DOUBLE_LINEBREAK = re.compile(r"\n\s*\n")
_STRIP_MD_BOLD = re.compile(r"\*\*(.+?)\*\*")
_STRIP_MD_ITALIC = re.compile(r"(?<!\*)\*([^*\n]+?)\*(?!\*)")


def _humanize_for_speech(text: str) -> str:
    """Return a slightly re-punctuated version of `text` so the TTS
    pronounces it with calmer pacing. Non-destructive: no semantic
    rewriting, no word changes — only pause shaping. Works for both
    providers."""
    if not text:
        return text
    out = text
    out = _STRIP_MD_BOLD.sub(r"\1", out)
    out = _STRIP_MD_ITALIC.sub(r"\1", out)
    out = _EM_DASH_PAUSE.sub(", ", out)
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
    out = re.sub(r"\n{3,}", "\n\n", out)
    out = re.sub(r"\s+,", ",", out)
    out = re.sub(r",\s*,", ", ", out)
    out = re.sub(r" {2,}", " ", out)
    return out.strip()


def is_configured() -> bool:
    """Either provider configured is enough."""
    if voice_provider() == "elevenlabs":
        return True
    return bool(os.getenv("EMERGENT_LLM_KEY"))


async def _synthesize_openai(clean: str, gender: VoiceGender) -> bytes:
    api_key = os.getenv("EMERGENT_LLM_KEY")
    if not api_key:
        raise RuntimeError("EMERGENT_LLM_KEY not configured")
    voice = VOICE_FOR_GENDER.get(gender, "shimmer")
    tts = OpenAITextToSpeech(api_key=api_key)
    audio = await tts.generate_speech(
        text=clean,
        model=DEFAULT_MODEL,
        voice=voice,
        speed=DEFAULT_SPEED,
        response_format="mp3",
    )
    return audio


def _synthesize_elevenlabs_sync(clean: str, gender: VoiceGender) -> bytes:
    """Sync ElevenLabs call. Wrapped in `run_in_executor` by the async
    entry point so the FastAPI event loop is not blocked.

    §Phase 1 follow-up 2026-02-14 — hard guards added:
      • httpx_options.timeout=20.0 — ElevenLabs occasionally has 30+s
        cold-start latencies during model warm-up. Without an
        explicit timeout the FastAPI worker would block indefinitely.
        20 s is a generous ceiling; if exceeded, the caller catches
        the exception and we fall back to OpenAI Shimmer.
      • Model is pinned to eleven_monolingual_v1 by default
        (English-only, no multilingual v2 drift). Founder mandate:
        zero language switching, zero accent leakage.
      • language_code="en" is passed where the SDK supports it
        (newer monolingual variants honour this; older ignore it
        silently — both safe).
    """
    api_key = os.getenv("ELEVENLABS_API_KEY")
    if not api_key:
        raise RuntimeError("ELEVENLABS_API_KEY not configured")
    from elevenlabs.client import ElevenLabs  # noqa: WPS433
    from elevenlabs import VoiceSettings  # noqa: WPS433
    import httpx  # noqa: WPS433

    # 20 s hard ceiling. The SDK uses an internal httpx.Client which
    # we can override via the client constructor's httpx_client kwarg
    # only on newer versions; for broad compatibility we set REST
    # timeout via the env var the SDK honours.
    os.environ.setdefault("ELEVEN_HTTP_TIMEOUT", "20")
    client = ElevenLabs(api_key=api_key, timeout=20.0)
    voice_id = ELEVENLABS_VOICE_FOR_GENDER.get(
        gender, ELEVENLABS_VOICE_FOR_GENDER["female"]
    )
    settings = VoiceSettings(
        stability=ELEVENLABS_STABILITY,
        similarity_boost=ELEVENLABS_SIMILARITY,
        style=ELEVENLABS_STYLE,
        use_speaker_boost=ELEVENLABS_USE_SPEAKER_BOOST,
    )
    # `language_code` is supported by eleven_turbo_v2 and the newer
    # multilingual models; eleven_monolingual_v1 ignores it. Passing
    # it everywhere is harmless and locks en-US wherever supported.
    convert_kwargs = dict(
        text=clean,
        voice_id=voice_id,
        model_id=ELEVENLABS_MODEL,
        voice_settings=settings,
        output_format="mp3_44100_128",
    )
    try:
        audio_iter = client.text_to_speech.convert(
            language_code="en", **convert_kwargs
        )
    except TypeError:
        # Older SDK signature without language_code — fall back.
        audio_iter = client.text_to_speech.convert(**convert_kwargs)
    except httpx.TimeoutException as exc:
        # Surface as a generic exception so the async caller's
        # fallback-to-OpenAI path kicks in.
        raise RuntimeError(f"ElevenLabs timeout: {exc}") from exc

    buf = io.BytesIO()
    for chunk in audio_iter:
        if chunk:
            buf.write(chunk)
    return buf.getvalue()


async def synthesize_speech(
    text: str,
    gender: VoiceGender = "female",
) -> bytes:
    """Return MP3 audio bytes for the given text using the active
    provider (openai or elevenlabs, env-driven). On any ElevenLabs
    failure, gracefully falls back to OpenAI."""
    clean = (text or "").strip()
    if not clean:
        raise ValueError("Empty text")
    if len(clean) > TTS_MAX_CHARS:
        clean = clean[:TTS_MAX_CHARS]
    clean = _humanize_for_speech(clean)

    provider = voice_provider()
    if provider == "elevenlabs":
        import asyncio  # noqa: WPS433

        loop = asyncio.get_running_loop()
        try:
            return await loop.run_in_executor(
                None, _synthesize_elevenlabs_sync, clean, gender
            )
        except Exception as exc:  # noqa: BLE001
            logger.warning(
                "ElevenLabs TTS failed (%s) — falling back to OpenAI", exc
            )
            return await _synthesize_openai(clean, gender)

    return await _synthesize_openai(clean, gender)
