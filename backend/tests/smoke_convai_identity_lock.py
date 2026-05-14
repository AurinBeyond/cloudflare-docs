"""
smoke_convai_identity_lock.py — REAL end-to-end identity-lock proof.

For each room:
  1. Asks our backend for a signed URL + identity prompt + first message.
  2. Opens a WebSocket directly to ElevenLabs with that signed URL.
  3. Sends the `conversation_initiation_client_data` event with the
     identity-lock overrides — EXACTLY as the frontend SDK will.
  4. Reads the first 'agent_response' message that ElevenLabs sends
     back and checks whether it contains the expected mentor name.

This is the wire-level proof that the override is actually accepted
by ElevenLabs after enabling the per-agent override allowlist.
"""
from __future__ import annotations

import asyncio
import json
import sys

import httpx
import websockets

PREVIEW_URL = "https://aurin-hub.preview.emergentagent.com"
SESSION_TOKEN = "ccb7b5b6-b89a-4e2b-b8d0-d25d18667cb8ae154a55d93342dc8ae34a83287340cd"

ROOMS = [
    ("clarity", "Grace"),
    ("body",    "Kaelan"),
    ("parents", "Sara"),
    ("courses", "Alistair"),
]


async def probe(room: str, expected_name: str) -> tuple[bool, str]:
    async with httpx.AsyncClient(timeout=15) as c:
        r = await c.post(
            f"{PREVIEW_URL}/api/clarity/convai/signed-url",
            headers={"Authorization": f"Bearer {SESSION_TOKEN}"},
            json={"room": room},
        )
    if r.status_code != 200:
        return False, f"backend signed-url failed: {r.status_code} {r.text[:200]}"
    payload = r.json()
    signed_url = payload["signed_url"]
    identity_prompt = payload["identity_prompt"]
    first_message = payload["first_message"]

    init_event = {
        "type": "conversation_initiation_client_data",
        "conversation_config_override": {
            "agent": {
                "prompt": {"prompt": identity_prompt},
                "first_message": first_message,
            },
        },
    }

    transcript: list[str] = []
    try:
        async with websockets.connect(signed_url, max_size=2**22) as ws:
            await ws.send(json.dumps(init_event))
            try:
                while True:
                    raw = await asyncio.wait_for(ws.recv(), timeout=12.0)
                    try:
                        msg = json.loads(raw)
                    except Exception:
                        continue
                    mtype = msg.get("type", "")
                    if mtype == "agent_response":
                        text = (
                            msg.get("agent_response_event", {})
                               .get("agent_response", "")
                        )
                        transcript.append(text)
                        if text:
                            break
                    elif mtype == "interruption" or mtype == "audio":
                        continue
            except asyncio.TimeoutError:
                pass
    except Exception as exc:  # noqa: BLE001
        return False, f"ws error: {exc}"

    if not transcript:
        return False, "no agent_response received within 12s"
    full = " ".join(transcript)
    ok = expected_name.lower() in full.lower()
    return ok, full[:300]


async def main() -> int:
    print(f"{'room':<10}{'expected':<12}{'verdict':<10}first agent_response (truncated)")
    print("-" * 100)
    all_ok = True
    for room, name in ROOMS:
        ok, transcript = await probe(room, name)
        verdict = "OK" if ok else "FAIL"
        if not ok:
            all_ok = False
        print(f"{room:<10}{name:<12}{verdict:<10}{transcript}")
    return 0 if all_ok else 2


if __name__ == "__main__":
    sys.exit(asyncio.run(main()))
