#!/usr/bin/env python3
"""
Inject strict IDENTITY & BOUNDARY PROTOCOL into the Dashboard system
prompt of each adult-room ElevenLabs agent.

Founder directive (2026-02-09):
- Agents must NOT adopt the user's greeting as their own name
  ("Hello Grace" → agent thinking its own name is "Grace").
- Agents must NOT discuss other rooms or other guides.
- Agents must NOT switch voice / gender / language.
- Agents must NOT impersonate the user.

Strategy (safe, non-destructive):
1. GET each agent's current `conversation_config.agent.prompt.prompt`
2. SAVE a backup to /app/memory/agent_prompt_backups/<agent>.txt
3. If the prompt already contains the boundary marker, SKIP (idempotent)
4. PREPEND the boundary preamble + original prompt
5. PATCH back

Run once: `python3 /app/scripts/inject_agent_boundaries.py`
"""
import json
import os
import sys
import urllib.request
from datetime import datetime, timezone
from pathlib import Path

BACKEND_ENV = Path("/app/backend/.env")
BACKUP_DIR = Path("/app/memory/agent_prompt_backups")
BACKUP_DIR.mkdir(parents=True, exist_ok=True)

ROOM_TO_ENV = {
    "grace":    ("ELEVENLABS_CONVAI_AGENT_GRACE",    "Grace",    "Private Room"),
    "kaelan":   ("ELEVENLABS_CONVAI_AGENT_KAELAN",   "Kaelan",   "Body Room"),
    "sara":     ("ELEVENLABS_CONVAI_AGENT_SARA",     "Sara",     "Parents' Room"),
    "alistair": ("ELEVENLABS_CONVAI_AGENT_ALISTAIR", "Alistair", "Course Room"),
}

BOUNDARY_MARKER = "# IDENTITY & BOUNDARY PROTOCOL — non-negotiable"


def boundary_preamble(name: str, room_label: str) -> str:
    other_names = [n for n in ("Grace", "Kaelan", "Sara", "Alistair") if n != name]
    other_str = ", ".join(other_names)
    return f"""{BOUNDARY_MARKER}
Your name is {name}. Always {name}. Only {name}.
You are NOT {other_str}. They are other guides in other rooms. You
do not share their voice, personality, or memories.
If the user greets you with another name ("Hello {other_names[0]}",
"Hi {other_names[1]}", "Hello [any other name]"), you do NOT adopt
it as your own. Reply warmly: "I'm {name} — glad you're here." then
continue with your role.
You do NOT discuss or mention any other room (no Private Room, no
Body Room, no Parents' Room, no Course Room, no Aurin's Room) other
than your own ({room_label}). If asked, say: "I only know this room
— it's where I live."
You speak ENGLISH only. You never switch language even if the user
writes in another tongue — respond in soft, simple English.
You never claim to be an AI, a robot, a machine, a program, a
chatbot, or technology. You are simply {name}.
Your voice is constant — gentle, kind, in your own timbre. You do
NOT switch voice, accent, or gender. You do NOT impersonate the
user or anyone the user mentions.
# END OF PROTOCOL

"""


def load_env():
    env = {}
    for line in BACKEND_ENV.read_text().splitlines():
        if "=" in line and not line.startswith("#"):
            k, v = line.split("=", 1)
            env[k.strip()] = v.strip().strip('"').strip("'")
    return env


def http_request(method: str, url: str, headers: dict, body: dict | None = None):
    data = json.dumps(body).encode() if body else None
    req = urllib.request.Request(url, data=data, method=method)
    for k, v in headers.items():
        req.add_header(k, v)
    with urllib.request.urlopen(req, timeout=20) as resp:
        return json.loads(resp.read().decode())


def main():
    env = load_env()
    key = env.get("ELEVENLABS_API_KEY")
    if not key:
        print("ERROR: ELEVENLABS_API_KEY not in /app/backend/.env", file=sys.stderr)
        sys.exit(1)

    headers = {"xi-api-key": key, "Content-Type": "application/json"}
    today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    report = []

    for room_slug, (env_var, name, room_label) in ROOM_TO_ENV.items():
        agent_id = env.get(env_var)
        if not agent_id:
            print(f"[SKIP] {name}: {env_var} not set")
            report.append((name, "SKIPPED — no agent_id"))
            continue

        try:
            doc = http_request(
                "GET",
                f"https://api.elevenlabs.io/v1/convai/agents/{agent_id}",
                headers,
            )
        except Exception as e:
            print(f"[ERR] {name}: GET failed — {e}")
            report.append((name, f"FAILED GET: {e}"))
            continue

        cc = doc.get("conversation_config", {})
        agent_cfg = cc.get("agent", {})
        prompt_cfg = agent_cfg.get("prompt", {})
        original = prompt_cfg.get("prompt") or ""

        # Backup (timestamped)
        backup_path = BACKUP_DIR / f"{room_slug}__{today}.txt"
        backup_path.write_text(original)
        print(f"[BACKUP] {name}: {len(original)} chars → {backup_path}")

        # Idempotent check
        if BOUNDARY_MARKER in original:
            print(f"[SKIP] {name}: boundary already present")
            report.append((name, "SKIPPED — already protected"))
            continue

        new_prompt = boundary_preamble(name, room_label) + original

        try:
            patch_body = {
                "conversation_config": {
                    "agent": {
                        "prompt": {
                            "prompt": new_prompt,
                        }
                    }
                }
            }
            http_request(
                "PATCH",
                f"https://api.elevenlabs.io/v1/convai/agents/{agent_id}",
                headers,
                patch_body,
            )
            print(f"[OK] {name}: boundary prepended ({len(new_prompt)} chars total)")
            report.append((name, f"INJECTED ({len(new_prompt)} chars)"))
        except Exception as e:
            print(f"[ERR] {name}: PATCH failed — {e}")
            report.append((name, f"FAILED PATCH: {e}"))

    print("\n=== SUMMARY ===")
    for name, status in report:
        print(f"  {name}: {status}")


if __name__ == "__main__":
    main()
