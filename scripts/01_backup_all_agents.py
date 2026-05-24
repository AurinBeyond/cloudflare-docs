#!/usr/bin/env python3
"""
PHASE 1 — Full inventory + backup of ALL ElevenLabs ConvAI agents
on Anna's account. Saves the complete conversation_config of every
agent as JSON to /app/memory/agent_prompt_backups/full_<date>/.

No mutations. Read-only. Idempotent (rewrites backup with today's
timestamp every run).
"""
import json
import os
import sys
import urllib.request
from datetime import datetime, timezone
from pathlib import Path

BACKEND_ENV = Path("/app/backend/.env")
TODAY = datetime.now(timezone.utc).strftime("%Y-%m-%d")
BACKUP_DIR = Path(f"/app/memory/agent_prompt_backups/full_{TODAY}")
BACKUP_DIR.mkdir(parents=True, exist_ok=True)


def load_env():
    env = {}
    for line in BACKEND_ENV.read_text().splitlines():
        if "=" in line and not line.startswith("#"):
            k, v = line.split("=", 1)
            env[k.strip()] = v.strip().strip('"').strip("'")
    return env


def http_get(url, headers):
    req = urllib.request.Request(url)
    for k, v in headers.items():
        req.add_header(k, v)
    with urllib.request.urlopen(req, timeout=20) as resp:
        return json.loads(resp.read().decode())


def main():
    env = load_env()
    key = env.get("ELEVENLABS_API_KEY")
    if not key:
        print("ERROR: ELEVENLABS_API_KEY missing", file=sys.stderr)
        sys.exit(1)
    headers = {"xi-api-key": key}

    listing = http_get("https://api.elevenlabs.io/v1/convai/agents", headers)
    agents = listing.get("agents", [])
    print(f"Found {len(agents)} agents on Anna's account.\n")

    summary = []
    for a in agents:
        aid = a["agent_id"]
        name = a.get("name", "")
        try:
            doc = http_get(
                f"https://api.elevenlabs.io/v1/convai/agents/{aid}", headers
            )
        except Exception as e:
            print(f"[ERR] {aid} ({name}): {e}")
            continue

        # Save full JSON
        safe = aid.replace("/", "_")
        out_json = BACKUP_DIR / f"{safe}.json"
        out_json.write_text(json.dumps(doc, indent=2, ensure_ascii=False))

        # Save plain prompt for easy diffing
        cc = doc.get("conversation_config", {})
        agent_cfg = cc.get("agent", {})
        prompt = (agent_cfg.get("prompt") or {}).get("prompt") or ""
        first_msg = agent_cfg.get("first_message") or ""
        voice_id = (cc.get("tts") or {}).get("voice_id") or ""

        out_txt = BACKUP_DIR / f"{safe}.prompt.txt"
        out_txt.write_text(
            f"# AGENT NAME (raw): {name!r}\n"
            f"# AGENT ID: {aid}\n"
            f"# VOICE ID: {voice_id}\n"
            f"# FIRST MESSAGE:\n{first_msg}\n\n"
            f"# SYSTEM PROMPT ({len(prompt)} chars):\n"
            f"{'='*72}\n{prompt}\n"
        )
        summary.append(
            (aid, name, len(prompt), voice_id, first_msg[:80].replace("\n", " "))
        )
        print(f"  [OK] {aid}  '{name[:50]}'  prompt={len(prompt)}ch")

    print("\n=== INVENTORY ===")
    for aid, name, plen, vid, fm in summary:
        print(f"  {aid}  {plen:>5}ch  voice={vid:<24}  name={name[:60]!r}")
        print(f"      first_msg={fm!r}")
    print(f"\nBackup dir: {BACKUP_DIR}")


if __name__ == "__main__":
    main()
