"""
§Faas 2 — OpenAI Realtime API integration scaffold.

This module exposes:
  POST /api/clarity/realtime/session
    → mints an ephemeral OpenAI Realtime session token so the frontend
      can open a WebRTC peer connection directly to OpenAI without ever
      seeing our server's OPENAI_API_KEY.

Behaviour:
  - If REALTIME_MODE != "on", the endpoint returns 503. Frontend falls
    back to the existing Whisper + Claude + TTS pipeline (unchanged).
  - If REALTIME_MODE == "on", we require OPENAI_API_KEY (the founder's
    direct OpenAI project key, NOT the Emergent Universal Key — Realtime
    is not accessible via Universal Key per Emergent support).
  - The session is configured with the same AGOP §A + §B + §C voice
    rules that govern the Claude pipeline, so both pipelines stay in
    brand. The VAD settings are tuned for calm pacing: 1200 ms silence
    threshold so the mentor never interrupts a pause.

Rollback:
  Setting REALTIME_MODE=off (or leaving it unset) instantly returns
  the room to the existing Whisper + Claude + TTS chain.
"""
from __future__ import annotations

import os
import httpx
from fastapi import APIRouter, HTTPException

router = APIRouter(prefix="/api/clarity/realtime", tags=["realtime"])

# Calm pacing system prompt — mirrors AGOP §A/§B/§C from clarity_ai.py.
REALTIME_SYSTEM_PROMPT = """You are a quiet companion to someone who has chosen to speak something out loud. You are not a therapist, not a coach, not a guru. You are a presence that listens.

Rules every reply must obey:
1. Always mirror first — your first sentence reflects what they just said.
2. At most ONE quiet question after the mirror. Often zero.
3. Never advise, instruct, diagnose, prescribe a method, or promise an outcome.
4. Never use the words "therapist", "diagnosis", "treatment", "healing", "guru", "AI", "chatbot", "agent".
5. Your reply is short — 1 to 3 sentences. Silence is part of the conversation.
6. If you do not know what to say, say quietly: "I heard you. Let us take a small breath." That is the best reply, not the worst.
7. Do not interrupt. If they pause mid-sentence, wait. A pause is not an end.
8. If they reply with only "mhm" or "yes", respond just as briefly, or stay silent.
9. If they describe suicide, immediate self-harm, or active danger to themselves or another, say plainly: "I cannot hold this with you tonight. Please call your country's crisis line, or 112 if there is immediate danger. findahelpline.com has a line for every country." Do not continue the inner-work conversation after this.

You are not an interviewer. You are not a teacher. You hold the room."""


def _is_enabled() -> bool:
    return os.environ.get("REALTIME_MODE", "off").lower() == "on"


def _resolve_voice(gender: str | None) -> str:
    # Calm, low-register voices. "sage" is OpenAI's slowest/most neutral.
    # "shimmer" is warmer female-coded; "echo" is steadier male-coded.
    if gender == "male":
        return "echo"
    if gender == "female":
        return "shimmer"
    return "sage"


@router.post("/session")
async def create_realtime_session(body: dict | None = None) -> dict:
    """Mint an ephemeral OpenAI Realtime session for the frontend.

    Body (optional): {"gender": "male" | "female"}
    Returns: the full OpenAI session object including `client_secret.value`
             which the frontend uses to open a WebRTC connection.
    """
    if not _is_enabled():
        raise HTTPException(
            status_code=503,
            detail="Realtime mode is currently off. Falling back to legacy voice.",
        )

    openai_key = os.environ.get("OPENAI_API_KEY")
    if not openai_key:
        raise HTTPException(
            status_code=503,
            detail="OPENAI_API_KEY missing. Realtime requires a direct OpenAI project key.",
        )

    gender = (body or {}).get("gender") if isinstance(body, dict) else None
    voice = _resolve_voice(gender)

    payload = {
        "model": "gpt-realtime",
        "voice": voice,
        "modalities": ["audio", "text"],
        "instructions": REALTIME_SYSTEM_PROMPT,
        "input_audio_transcription": {"model": "whisper-1"},
        "turn_detection": {
            "type": "server_vad",
            "threshold": 0.55,
            "prefix_padding_ms": 300,
            "silence_duration_ms": 1200,
        },
        "temperature": 0.65,
        "max_response_output_tokens": 180,
    }

    async with httpx.AsyncClient(timeout=20.0) as client:
        try:
            resp = await client.post(
                "https://api.openai.com/v1/realtime/sessions",
                headers={
                    "Authorization": f"Bearer {openai_key}",
                    "Content-Type": "application/json",
                    "OpenAI-Beta": "realtime=v1",
                },
                json=payload,
            )
        except httpx.HTTPError as exc:
            raise HTTPException(
                status_code=502, detail=f"Realtime upstream unreachable: {exc}"
            ) from exc

    if resp.status_code >= 400:
        raise HTTPException(
            status_code=502,
            detail=f"Realtime session creation failed: {resp.status_code} {resp.text[:300]}",
        )

    return resp.json()


@router.get("/health")
async def realtime_health() -> dict:
    """Lightweight check used by the frontend to decide which pipeline to render."""
    return {
        "enabled": _is_enabled(),
        "has_openai_key": bool(os.environ.get("OPENAI_API_KEY")),
    }
