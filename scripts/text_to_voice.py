#!/usr/bin/env python3
"""
Hearth / Polarstar — Text-to-Voice via ElevenLabs
==================================================

Reads a story manuscript (.md file with `## Story` body) and produces
a clean MP3 using ElevenLabs TTS. No ambient layering — pure narration.

Usage:
    # Default: female fallback voice (works today)
    python3 /app/scripts/text_to_voice.py the-sock-on-the-stairs \
        --world hearth --voice female

    # Once Anna provides her cloned voice IDs (added to backend/.env):
    python3 /app/scripts/text_to_voice.py the-sock-on-the-stairs \
        --world hearth --voice anna-adult

    python3 /app/scripts/text_to_voice.py little-star \
        --world polarstar --voice anna-kids

Available voice aliases (resolved from backend/.env):
    female          → ELEVENLABS_VOICE_FEMALE        (Bella-equivalent fallback)
    male            → ELEVENLABS_VOICE_MALE
    sara            → ELEVENLABS_VOICE_SARA          (Parents' Room curator)
    grace           → ELEVENLABS_VOICE_GRACE         (Clarity Release curator)
    kaelan          → ELEVENLABS_VOICE_KAELAN        (Body Room curator)
    alistair        → ELEVENLABS_VOICE_ALISTAIR      (Course Room curator)
    anna-kids       → ELEVENLABS_VOICE_ANNA_KIDS     (Polarstar — Anna's clone)
    anna-adult      → ELEVENLABS_VOICE_ANNA_ADULT    (Hearth — Anna's clone)

Voice settings (per Anna's locked config):
    Hearth / Adult: stability 0.65, similarity 0.80, style 0.05
    Polarstar:      stability 0.55, similarity 0.80, style 0.15

Notes:
    - The `voices_read` permission is missing on the current API key,
      so this script can ONLY use voice IDs that are present in
      backend/.env. It cannot fetch the list from ElevenLabs.
    - To add Anna's cloned voice IDs:
        1. Open ElevenLabs portal → Voice Library → My Voices
        2. Click the cloned voice → copy "Voice ID" (string)
        3. Add to /app/backend/.env (no quotes, no spaces):
             ELEVENLABS_VOICE_ANNA_KIDS=<id_from_portal>
             ELEVENLABS_VOICE_ANNA_ADULT=<id_from_portal>
        4. Re-run this script with --voice anna-kids / anna-adult
"""
import argparse
import os
import re
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

import httpx
from dotenv import load_dotenv

load_dotenv("/app/backend/.env")

ELEVEN_API = "https://api.elevenlabs.io/v1"

# World → output directory
WORLD_DIRS = {
    "hearth":    Path("/app/frontend/public/assets/audio/hearth"),
    "polarstar": Path("/app/frontend/public/assets/audio/polarstar"),
    "clarity":   Path("/app/frontend/public/assets/audio/clarity"),
    "course":    Path("/app/frontend/public/assets/audio/course"),
    "body":      Path("/app/frontend/public/assets/audio/body"),
}

# World → ElevenLabs voice settings
# §DIRECTIVE 2026-05-31 — style locked to 0.00 for adult/house worlds
# to enforce a completely flat, non-theatrical, grounding cadence.
WORLD_SETTINGS = {
    # §DIRECTIVE 2026-05-31 (v3 — Anna's locked params for her cloned Adult voice ID JRsw5bVcIrltULIav9RK)
    "hearth":    {"stability": 0.55, "similarity_boost": 0.85, "style": 0.08, "use_speaker_boost": True},
    "polarstar": {"stability": 0.55, "similarity_boost": 0.80, "style": 0.15, "use_speaker_boost": True},
    "clarity":   {"stability": 0.60, "similarity_boost": 0.80, "style": 0.00, "use_speaker_boost": True},
    "course":    {"stability": 0.60, "similarity_boost": 0.80, "style": 0.00, "use_speaker_boost": True},
    "body":      {"stability": 0.60, "similarity_boost": 0.80, "style": 0.00, "use_speaker_boost": True},
}

# Voice alias → env variable name
VOICE_ENV_MAP = {
    "female":     "ELEVENLABS_VOICE_FEMALE",
    "male":       "ELEVENLABS_VOICE_MALE",
    "sara":       "ELEVENLABS_VOICE_SARA",
    "grace":      "ELEVENLABS_VOICE_GRACE",
    "kaelan":     "ELEVENLABS_VOICE_KAELAN",
    "alistair":   "ELEVENLABS_VOICE_ALISTAIR",
    "anna-kids":  "ELEVENLABS_VOICE_ANNA_KIDS",
    "anna-adult": "ELEVENLABS_VOICE_ANNA_ADULT",
}

MODEL_DEFAULT = "eleven_multilingual_v2"


def extract_story_body(md_path: Path) -> str:
    """Extract the prose between `## Story` and end-of-file or next H2.
    Returns clean text with single newlines between lines."""
    text = md_path.read_text(encoding="utf-8")
    m = re.search(r"## Story\s*\n(.*?)(?=\n## |\Z)", text, flags=re.DOTALL)
    if not m:
        raise ValueError(f"No `## Story` section found in {md_path}")
    body = m.group(1).strip()
    # Collapse multiple blank lines to single (TTS handles pauses via punctuation)
    body = re.sub(r"\n{3,}", "\n\n", body)
    return body


def resolve_voice_id(alias: str) -> tuple[str, str]:
    """Returns (voice_id, friendly_name). Falls back to FEMALE if alias unknown
    or env variable empty."""
    env_var = VOICE_ENV_MAP.get(alias)
    if not env_var:
        print(f"[!] Unknown alias {alias!r}. Falling back to 'female'.")
        env_var = VOICE_ENV_MAP["female"]
        alias = "female"
    vid = os.environ.get(env_var)
    if not vid:
        print(f"[!] {env_var} not set in /app/backend/.env. Falling back to 'female'.")
        vid = os.environ.get(VOICE_ENV_MAP["female"])
        alias = "female"
    if not vid:
        print("FATAL: No voice ID available. Add ELEVENLABS_VOICE_FEMALE to /app/backend/.env.")
        sys.exit(2)
    return vid, alias


def synthesize(text: str, voice_id: str, settings: dict, out_path: Path) -> None:
    api_key = os.environ.get("ELEVENLABS_API_KEY")
    if not api_key:
        print("FATAL: ELEVENLABS_API_KEY missing from /app/backend/.env")
        sys.exit(2)

    url = f"{ELEVEN_API}/text-to-speech/{voice_id}"
    payload = {
        "text": text,
        "model_id": MODEL_DEFAULT,
        "voice_settings": settings,
    }
    headers = {
        "xi-api-key": api_key,
        "Content-Type": "application/json",
        "Accept": "audio/mpeg",
    }
    print(f"[*] POST {url}")
    print(f"    chars={len(text)}  model={MODEL_DEFAULT}  settings={settings}")

    out_path.parent.mkdir(parents=True, exist_ok=True)
    # First, write raw narration to a temp file
    with tempfile.NamedTemporaryFile(suffix=".mp3", delete=False) as tmp:
        tmp_path = Path(tmp.name)

    with httpx.Client(timeout=180) as c:
        with c.stream("POST", url, headers=headers, json=payload) as r:
            if r.status_code != 200:
                body = r.read()
                print(f"[X] HTTP {r.status_code}")
                print(body.decode("utf-8", errors="replace")[:1000])
                tmp_path.unlink(missing_ok=True)
                sys.exit(3)
            with tmp_path.open("wb") as f:
                for chunk in r.iter_bytes(chunk_size=8192):
                    f.write(chunk)

    # §DIRECTIVE — pad 1.0s of pure digital silence at both ends
    # for sensory buffer. ffmpeg is required (already installed for Polarstar).
    if shutil.which("ffmpeg") is None:
        print("[!] ffmpeg not found — saving without silence padding.")
        shutil.move(str(tmp_path), str(out_path))
        padded = False
    else:
        cmd = [
            "ffmpeg", "-y", "-loglevel", "error",
            "-i", str(tmp_path),
            "-af", "adelay=1000|1000,apad=pad_dur=1.0",
            "-c:a", "libmp3lame", "-b:a", "192k",
            str(out_path),
        ]
        try:
            subprocess.run(cmd, check=True)
            padded = True
        finally:
            tmp_path.unlink(missing_ok=True)
    size_kb = out_path.stat().st_size // 1024
    pad_note = "  [1.0s silence padded both ends]" if padded else "  [raw, no padding]"
    print(f"[+] OK  saved → {out_path}  ({size_kb} KB){pad_note}")


def find_manuscript(slug: str, world: str) -> Path:
    """Search /app/memory/ for the manuscript file matching the slug.
    Matches against both dashed slug and underscored variant."""
    memory = Path("/app/memory")
    slug_under = slug.replace("-", "_")
    patterns = [f"*{slug}*.md", f"*{slug_under}*.md"]
    candidates = []
    for pat in patterns:
        candidates.extend(memory.glob(pat))
    candidates = list(dict.fromkeys(candidates))  # dedupe, preserve order
    # Prefer world-tagged file names
    candidates = sorted(candidates, key=lambda p: (world not in p.name.lower(), p.name))
    if not candidates:
        print(f"FATAL: No .md manuscript matching {slug!r} found in /app/memory/")
        sys.exit(4)
    return candidates[0]


def main():
    p = argparse.ArgumentParser(description="Generate story audio via ElevenLabs TTS")
    p.add_argument("slug", help="Story slug (e.g. the-sock-on-the-stairs, little-star)")
    p.add_argument(
        "--world",
        required=True,
        choices=list(WORLD_DIRS.keys()),
        help="Which world the story belongs to — sets output dir + voice settings",
    )
    p.add_argument(
        "--voice",
        default="female",
        choices=list(VOICE_ENV_MAP.keys()),
        help="Voice alias (resolved to voice_id from /app/backend/.env)",
    )
    p.add_argument(
        "--manuscript",
        default=None,
        help="Explicit manuscript path (.md file); auto-discovered if omitted",
    )
    args = p.parse_args()

    md_path = Path(args.manuscript) if args.manuscript else find_manuscript(args.slug, args.world)
    print(f"[*] Manuscript: {md_path}")
    body = extract_story_body(md_path)
    print(f"[*] Story body: {len(body)} chars, {len(body.split())} words")
    voice_id, resolved_alias = resolve_voice_id(args.voice)
    print(f"[*] Voice: alias={resolved_alias}  voice_id={voice_id}")

    out_path = WORLD_DIRS[args.world] / f"{args.slug}.mp3"
    synthesize(body, voice_id, WORLD_SETTINGS[args.world], out_path)


if __name__ == "__main__":
    main()
