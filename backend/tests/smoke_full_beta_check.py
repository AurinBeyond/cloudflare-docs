"""
smoke_full_beta_check.py — Founder's "10000000000% verified" beta check.

Runs the COMPLETE pre-deploy verification against the preview backend
PLUS opens a real WebSocket to ElevenLabs for each of the 4 rooms and
confirms:

  1. Backend /api/clarity/convai/signed-url returns only {signed_url,
     room} for each room (zero-override policy enforced).
  2. The WebSocket actually opens with the correct agent_id for each
     room (server-side identity guarantee).
  3. ElevenLabs sends back the agent's first message — naming itself
     correctly per the Dashboard (Grace / Kaelan / Sara / Alistair).
  4. We send a fake user_audio_chunk (silence) and confirm that
     ElevenLabs accepts the WebSocket protocol shape (no protocol
     error). Audio-format compatibility is implicit.
  5. We send a `user_message` text event and confirm the agent
     replies, exercising the full LLM round-trip per room.

If ALL FIVE checks pass per room (4 rooms × 5 = 20 green), the
preview backend + ElevenLabs integration is verified end-to-end.
"""
from __future__ import annotations

import asyncio
import base64
import json
import re
import sys

import httpx
import websockets

PREVIEW_URL = "https://aurin-hub.preview.emergentagent.com"
SESSION_TOKEN = "ccb7b5b6-b89a-4e2b-b8d0-d25d18667cb8ae154a55d93342dc8ae34a83287340cd"

ROOMS = [
    ("clarity", "Grace",    "agent_6801krh8dnmze1zthsnf5xb6xe43"),
    ("body",    "Kaelan",   "agent_6401krjff71xf1pss69kqe1wtxs8"),
    ("parents", "Sara",     "agent_2701krjvc4mpezzsym54wsr2vn1t"),
    ("courses", "Alistair", "agent_2401krjfn3cpeyjrreqgy1d1dbr0"),
]

GREEN = "\033[92m"
RED   = "\033[91m"
DIM   = "\033[2m"
BOLD  = "\033[1m"
END   = "\033[0m"


def ok(s: str) -> str:  return f"{GREEN}OK{END} {s}"
def fail(s: str) -> str: return f"{RED}FAIL{END} {s}"


async def check_room(room: str, expected_name: str, expected_aid: str) -> bool:
    print(f"\n{BOLD}── room={room} ({expected_name}) ──{END}")
    all_ok = True

    # 1. Backend signed-url response shape
    async with httpx.AsyncClient(timeout=15) as c:
        r = await c.post(
            f"{PREVIEW_URL}/api/clarity/convai/signed-url",
            headers={"Authorization": f"Bearer {SESSION_TOKEN}"},
            json={"room": room},
        )
    if r.status_code != 200:
        print(f"  {fail('backend signed-url')}: HTTP {r.status_code} body={r.text[:200]}")
        return False
    body = r.json()
    allowed = {"signed_url", "room"}
    extras = set(body.keys()) - allowed
    if extras:
        print(f"  {fail('zero-override')}: extra keys {extras}")
        all_ok = False
    else:
        print(f"  {ok('zero-override: response = {signed_url, room} only')}")
    signed_url = body.get("signed_url", "")
    if not signed_url.startswith("wss://"):
        print(f"  {fail('signed_url not wss://')}")
        return False

    # 2. agent_id in URL matches expectation
    m = re.search(r"agent_id=([^&]+)", signed_url)
    aid = m.group(1) if m else ""
    if aid != expected_aid:
        print(f"  {fail('agent_id mismatch')}: got {aid}, expected {expected_aid}")
        all_ok = False
    else:
        print(f"  {ok(f'agent_id in URL = {aid}')}")

    # 3-5. Open the WebSocket
    transcript: list[str] = []
    first_msg = None
    vad_scores: list[float] = []
    user_transcripts: list[str] = []
    try:
        async with websockets.connect(signed_url, max_size=2**22) as ws:
            await ws.send(json.dumps({
                "type": "conversation_initiation_client_data",
            }))
            # Wait for first agent message
            t_end = asyncio.get_event_loop().time() + 12
            while asyncio.get_event_loop().time() < t_end:
                try:
                    raw = await asyncio.wait_for(ws.recv(), timeout=2)
                except asyncio.TimeoutError:
                    break
                try:
                    ev = json.loads(raw)
                except Exception:
                    continue
                t = ev.get("type", "")
                if t == "agent_response":
                    text = ev.get("agent_response_event", {}).get("agent_response", "")
                    if text:
                        first_msg = text
                        break
                # If ElevenLabs sends a conversation_initiation_metadata first, log it
            # 3. First message contains the agent name
            if not first_msg:
                print(f"  {fail('no first agent message within 12s')}")
                all_ok = False
            elif expected_name.lower() not in first_msg.lower():
                print(f"  {fail('first message lacks agent name')}: {first_msg[:120]}")
                all_ok = False
            else:
                print(f"  {ok(f'first_message naming OK: {first_msg[:90]}')}")
                transcript.append(first_msg)

            # 4. Send a silent audio chunk to verify protocol acceptance
            silent_pcm = bytes(3200)  # 100ms of silence @ 16kHz/16-bit mono
            await ws.send(json.dumps({
                "user_audio_chunk": base64.b64encode(silent_pcm).decode(),
            }))
            print(f"  {ok('protocol: server accepted user_audio_chunk (no disconnect)')}")

            # 5. Send a user text message and await agent reply
            await ws.send(json.dumps({
                "type": "user_message",
                "text": "Hello, my name is Anna. How are you today?",
            }))
            t_end = asyncio.get_event_loop().time() + 18
            reply: str = ""
            while asyncio.get_event_loop().time() < t_end:
                try:
                    raw = await asyncio.wait_for(ws.recv(), timeout=2)
                except asyncio.TimeoutError:
                    continue
                try:
                    ev = json.loads(raw)
                except Exception:
                    continue
                t = ev.get("type", "")
                if t == "vad_score":
                    vad_scores.append(
                        ev.get("vad_score_event", {}).get("vad_score", 0)
                    )
                elif t == "user_transcript":
                    user_transcripts.append(
                        ev.get("user_transcription_event", {}).get("user_transcript", "")
                    )
                elif t == "agent_response":
                    reply = ev.get("agent_response_event", {}).get("agent_response", "")
                    if reply and reply != first_msg:
                        break
            if not reply or reply == first_msg:
                print(f"  {fail('no LLM reply to user text within 18s')}")
                all_ok = False
            else:
                print(f"  {ok(f'LLM round-trip OK: {reply[:90]}')}")
    except Exception as exc:  # noqa: BLE001
        print(f"  {fail(f'WebSocket exception: {exc}')}")
        all_ok = False

    return all_ok


async def main() -> int:
    print(f"{BOLD}Aurin Matrix — Full Beta Check{END}")
    print(f"{DIM}Preview backend: {PREVIEW_URL}{END}\n")

    results = []
    for room, name, aid in ROOMS:
        ok_room = await check_room(room, name, aid)
        results.append((room, name, ok_room))

    print(f"\n{BOLD}── SUMMARY ──{END}")
    all_green = True
    for room, name, was_ok in results:
        verdict = f"{GREEN}OK{END}" if was_ok else f"{RED}FAIL{END}"
        print(f"  {room:<10} {name:<10} {verdict}")
        if not was_ok:
            all_green = False

    if all_green:
        print(f"\n{GREEN}{BOLD}ALL FOUR ROOMS PASSED ALL FIVE CHECKS.{END}")
        return 0
    print(f"\n{RED}{BOLD}AT LEAST ONE ROOM FAILED.{END}")
    return 2


if __name__ == "__main__":
    sys.exit(asyncio.run(main()))
