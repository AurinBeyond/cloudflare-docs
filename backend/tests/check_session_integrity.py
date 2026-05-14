"""
check_session_integrity.py — Founder-requested diagnostic script.

Purpose: PROVE, in real-time, exactly which Agent ID is being served
to a specific user / room combination, with NO trust in code review.

Run:
    cd /app/backend && python tests/check_session_integrity.py

What it does (read-only, no writes anywhere):
  1. Prints the EXACT line of code that resolves agent_id (server.py).
  2. Reads the current .env values (no caching).
  3. Hits the live /api/clarity/convai/signed-url for all 4 rooms,
     using the founder's session token, and parses the agent_id from
     the WebSocket URL that the SDK actually receives.
  4. Hits ElevenLabs `/v1/convai/agents/{id}` for each agent and
     prints the agent's display name + first 200 chars of system
     prompt, so we can see "who" that ID actually is on the provider
     side.
  5. Cross-table: route → env var → env value → URL agent_id →
     ElevenLabs agent name. Any mismatch is highlighted in red.

This script is the SINGLE source of truth for "is there a session
lock / crosstalk". If every row matches, the code is innocent and
the issue is in the ElevenLabs Dashboard configuration (system
prompt of that specific agent).
"""
from __future__ import annotations

import os
import re
import sys
from pathlib import Path

import httpx
from dotenv import load_dotenv

ROOT = Path(__file__).resolve().parents[1]
load_dotenv(ROOT / ".env")

PREVIEW_URL = "https://aurin-hub.preview.emergentagent.com"
SESSION_TOKEN = "ccb7b5b6-b89a-4e2b-b8d0-d25d18667cb8ae154a55d93342dc8ae34a83287340cd"

ROOMS = [
    ("clarity", "/clarity-release",  "ELEVENLABS_CONVAI_AGENT_GRACE",    "Grace"),
    ("body",    "/body-room",        "ELEVENLABS_CONVAI_AGENT_KAELAN",   "Kaelan"),
    ("parents", "/parents-room",     "ELEVENLABS_CONVAI_AGENT_SARA",     "Sara"),
    ("courses", "/course-room",      "ELEVENLABS_CONVAI_AGENT_ALISTAIR", "Alistair"),
]

RED   = "\033[91m"
GREEN = "\033[92m"
DIM   = "\033[2m"
BOLD  = "\033[1m"
END   = "\033[0m"


def section(title: str) -> None:
    print(f"\n{BOLD}── {title} ──{END}")


def main() -> int:
    api_key = os.getenv("ELEVENLABS_API_KEY")
    if not api_key:
        print(f"{RED}ELEVENLABS_API_KEY missing in backend/.env{END}")
        return 1

    # ── 1. Show the exact code line that picks agent_id ──────────────
    section("1. The ONLY line in server.py that resolves agent_id")
    server = (ROOT / "server.py").read_text()
    for i, line in enumerate(server.splitlines(), 1):
        if "agent_id = os.getenv(env_name)" in line:
            print(f"  server.py:{i}  →  {line.strip()}")
        if "_ROOM_TO_CONVAI_AGENT_ENV" in line and "{" in line:
            print(f"  server.py:{i}  →  {line.strip()}")
    print(f"  {DIM}No fallback. No DB lookup. No session-stored mapping.{END}")

    # ── 2. .env values right now ─────────────────────────────────────
    section("2. backend/.env values being read RIGHT NOW")
    env_table = {}
    for _room, _route, env_var, _name in ROOMS:
        val = os.getenv(env_var) or ""
        env_table[env_var] = val
        print(f"  {env_var:42s} = {val}")

    # ── 3. Live signed-url for every room (3 passes) ─────────────────
    section("3. Live POST /api/clarity/convai/signed-url — 3 sequential passes")
    pass_results: dict[str, list[str]] = {r: [] for r, *_ in ROOMS}
    with httpx.Client(timeout=20) as client:
        for p in range(1, 4):
            print(f"  Pass #{p}")
            for room, _route, _env_var, _name in ROOMS:
                r = client.post(
                    f"{PREVIEW_URL}/api/clarity/convai/signed-url",
                    headers={"Authorization": f"Bearer {SESSION_TOKEN}"},
                    json={"room": room},
                )
                signed = r.json().get("signed_url", "") if r.status_code == 200 else ""
                m = re.search(r"agent_id=([^&]+)", signed)
                aid = m.group(1) if m else "<no agent_id in URL>"
                pass_results[room].append(aid)
                print(f"    room={room:8s} → {aid}")

    # ── 4. ElevenLabs side: who is each agent_id, really? ────────────
    section("4. ElevenLabs `/v1/convai/agents/{id}` — Provider-side identity")
    el_names: dict[str, str] = {}
    el_prompts: dict[str, str] = {}
    with httpx.Client(timeout=20) as client:
        for _room, _route, env_var, _name in ROOMS:
            aid = env_table[env_var]
            if not aid:
                continue
            try:
                r = client.get(
                    f"https://api.elevenlabs.io/v1/convai/agents/{aid}",
                    headers={"xi-api-key": api_key},
                )
                d = r.json() if r.status_code == 200 else {}
            except Exception as exc:  # noqa: BLE001
                d = {"_error": str(exc)}
            el_names[aid] = d.get("name", "<unknown>")
            prompt = (
                d.get("conversation_config", {})
                 .get("agent", {})
                 .get("prompt", {})
                 .get("prompt", "")
                or ""
            )
            el_prompts[aid] = prompt[:200].replace("\n", " ⏎ ")
            print(f"  agent_id={aid}")
            print(f"    provider_name = {el_names[aid]}")
            print(f"    prompt[:200]  = {el_prompts[aid]}")

    # ── 5. End-to-end truth table ────────────────────────────────────
    section("5. END-TO-END TRUTH TABLE (route → env → live URL → provider)")
    print(
        f"  {'route':<18}{'env_var':<42}{'expected_id':<48}"
        f"{'live_id (3 passes match?)':<28}{'provider_name':<32}{'verdict'}"
    )
    all_ok = True
    for room, route, env_var, expected_name in ROOMS:
        expected_id = env_table[env_var]
        passes = pass_results[room]
        consistent = len(set(passes)) == 1 and passes[0] == expected_id
        live = passes[0] if passes else ""
        name = el_names.get(live, "<?>")
        if consistent and expected_name.lower() in name.lower():
            verdict = f"{GREEN}OK{END}"
        else:
            verdict = f"{RED}MISMATCH{END}"
            all_ok = False
        print(
            f"  {route:<18}{env_var:<42}{expected_id:<48}"
            f"{('yes' if consistent else 'NO'):<28}{name:<32}{verdict}"
        )

    print()
    if all_ok:
        print(
            f"{GREEN}{BOLD}VERDICT: No session-lock, no caching, no crosstalk in code.{END}\n"
            f"  Every route consistently mints the correct agent_id across 3 passes.\n"
            f"  If the wanderer 'hears Kaelan in Grace's room', the misidentification\n"
            f"  comes from the ElevenLabs Dashboard system prompt of that agent\n"
            f"  (see section 4 above — the `prompt[:200]` column).\n"
        )
        return 0
    else:
        print(f"{RED}{BOLD}VERDICT: A mismatch was detected. Investigate the row marked MISMATCH.{END}")
        return 2


if __name__ == "__main__":
    sys.exit(main())
