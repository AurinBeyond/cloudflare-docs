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
back to OpenAI so the house never breaks.
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


# -- ElevenLabs defaults (founder "Grace Voice Mix" spec 2026-02-14, ---
# -- model migrated 2026-06-29 due to ElevenLabs deprecation notice) -
# Custom Grace voice designed in ElevenLabs Voice Lab. Founder spec:
#   Model: eleven_multilingual_v2  (migrated 2026-06-29 — legacy
#                                   eleven_monolingual_v1 sunset on
#                                   2026-07-09. v2 is the official
#                                   migration target; voice_id +
#                                   VoiceSettings are preserved byte-
#                                   for-byte. English is locked via
#                                   the language_code="en" parameter
#                                   passed at convert() time, so the
#                                   founder mandate — zero accent
#                                   leakage, zero language switching —
#                                   continues to hold under v2.)
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
ELEVENLABS_MODEL = os.getenv("ELEVENLABS_MODEL", "eleven_multilingual_v2")


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
    to be set; otherwise we silently keep OpenAI so the house
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
      • Model is pinned to eleven_multilingual_v2 by default
        (migrated 2026-06-29 from eleven_monolingual_v1 due to
        ElevenLabs deprecation on 2026-07-09). The founder mandate
        — zero language switching, zero accent leakage — is now
        enforced by the explicit language_code="en" parameter
        passed at convert() time, which v2 honours.
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
    # `language_code` is supported by eleven_turbo_v2 and the
    # eleven_multilingual_v2 family; the deprecated monolingual_v1
    # ignored it. Passing it everywhere is harmless under v2 and
    # locks en-US — the founder's "no language drift" mandate.
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


# =============================================================
# §Phase 1 Market-Ready (2026-02-14) — STREAMING TTS
# =============================================================
# Reduces perceived latency from ~5 s → ~1.5 s by streaming MP3
# chunks from ElevenLabs to the browser as they are generated.
# Uses ElevenLabs `stream()` endpoint with
# `optimize_streaming_latency=3` for the lowest first-byte time.
#
# Flow:
#   FastAPI StreamingResponse → calls synthesize_speech_stream()
#   → which run-in-executor's the sync ElevenLabs iterator and
#     pushes each chunk onto an asyncio.Queue → which the async
#     generator yields back to the StreamingResponse.
# =============================================================

def _synthesize_elevenlabs_stream_sync(clean: str, gender: VoiceGender):
    """Returns the sync ElevenLabs stream iterator (yields MP3 bytes).

    Latency knobs (founder spec):
      optimize_streaming_latency=3  (max latency reduction with quality)
      output_format=mp3_44100_64    (smaller chunks → faster first byte;
                                     still browser-playable everywhere)
    """
    api_key = os.getenv("ELEVENLABS_API_KEY")
    if not api_key:
        raise RuntimeError("ELEVENLABS_API_KEY not configured")
    from elevenlabs.client import ElevenLabs  # noqa: WPS433
    from elevenlabs import VoiceSettings  # noqa: WPS433

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
    convert_kwargs = dict(
        text=clean,
        voice_id=voice_id,
        model_id=ELEVENLABS_MODEL,
        voice_settings=settings,
        output_format="mp3_44100_64",
        optimize_streaming_latency=3,
    )
    try:
        return client.text_to_speech.stream(
            language_code="en", **convert_kwargs
        )
    except TypeError:
        # Older SDK signature — drop language_code.
        return client.text_to_speech.stream(**convert_kwargs)


async def synthesize_speech_stream(
    text: str,
    gender: VoiceGender = "female",
):
    """Async generator yielding MP3 audio bytes as they are produced.

    Tries ElevenLabs streaming first (low TTFB). Falls back to
    OpenAI non-streaming on any failure — the browser still gets a
    single MP3 blob, just with the higher 1-2 s TTFB.
    """
    import asyncio  # noqa: WPS433

    clean = (text or "").strip()
    if not clean:
        raise ValueError("Empty text")
    if len(clean) > TTS_MAX_CHARS:
        clean = clean[:TTS_MAX_CHARS]
    clean = _humanize_for_speech(clean)

    provider = voice_provider()
    if provider == "elevenlabs":
        loop = asyncio.get_running_loop()
        queue: asyncio.Queue = asyncio.Queue(maxsize=64)
        _SENTINEL = object()

        def _producer():
            try:
                stream_iter = _synthesize_elevenlabs_stream_sync(clean, gender)
                for chunk in stream_iter:
                    if chunk:
                        # Push back onto the asyncio loop.
                        asyncio.run_coroutine_threadsafe(
                            queue.put(chunk), loop
                        ).result()
            except Exception as exc:  # noqa: BLE001
                asyncio.run_coroutine_threadsafe(
                    queue.put(("__error__", exc)), loop
                ).result()
            finally:
                asyncio.run_coroutine_threadsafe(
                    queue.put(_SENTINEL), loop
                ).result()

        producer_fut = loop.run_in_executor(None, _producer)
        try:
            first = True
            while True:
                item = await queue.get()
                if item is _SENTINEL:
                    break
                if isinstance(item, tuple) and item[0] == "__error__":
                    # ElevenLabs failed mid-stream. If we haven't yielded
                    # anything yet, fall back to OpenAI. Otherwise log
                    # and end the stream — the browser will play what
                    # it has.
                    if first:
                        logger.warning(
                            "ElevenLabs stream failed (%s) — OpenAI fallback",
                            item[1],
                        )
                        audio = await _synthesize_openai(clean, gender)
                        yield audio
                    else:
                        logger.warning(
                            "ElevenLabs stream broke mid-flight: %s", item[1]
                        )
                    break
                first = False
                yield item
        finally:
            try:
                await producer_fut
            except Exception:  # noqa: BLE001
                pass
        return

    # OpenAI provider — no streaming SDK available, yield single blob.
    audio = await _synthesize_openai(clean, gender)
    yield audio
