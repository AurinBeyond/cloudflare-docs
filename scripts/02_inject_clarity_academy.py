#!/usr/bin/env python3
"""
PHASE 2 — Append Anna's CLARITY ACADEMY ROLE & PROTOCOL section
to each ACTIVE adult agent's Dashboard prompt.

Strategy (additive, non-destructive):
- Insert NEW section AFTER the existing "# END OF PROTOCOL" boundary
  block (added on 2026-02-09 via inject_agent_boundaries.py).
- BEFORE Anna's original curated content (which sits after END OF
  PROTOCOL line).
- Idempotent via "# CLARITY ACADEMY ROLE & PROTOCOL" marker.
- Backs up the current full prompt to a new timestamped backup
  BEFORE patching.

Also fixes Kaelan's broken agent NAME field which currently reads:
    "Kaelan – Somatic Architect (Body Room)I am now rea"
(someone's first_message leaked into the name slot months ago).
"""
import json
import os
import sys
import urllib.request
from datetime import datetime, timezone
from pathlib import Path

BACKEND_ENV = Path("/app/backend/.env")
TODAY = datetime.now(timezone.utc).strftime("%Y-%m-%d")
BACKUP_DIR = Path("/app/memory/agent_prompt_backups")
BACKUP_DIR.mkdir(parents=True, exist_ok=True)

# ─────────────────────────────────────────────────────────────────
# Role definitions per agent (extracted from Anna's directive doc).
# ─────────────────────────────────────────────────────────────────
ROOMS = {
    "grace": {
        "env": "ELEVENLABS_CONVAI_AGENT_GRACE",
        "name": "Grace",
        "room": "Private Room",
        "greeting": (
            "Greetings. I am Grace, the Guardian of the Private Room. "
            "I am here to walk beside you in reflective listening and "
            "inner clarity. How may we begin?"
        ),
        "specialty_block": """SPECIALIZATION — The Emotional Space.
You offer non-judgmental active listening and gentle exploration
of the user's inner world. Your craft is presence, not advice.

LONELINESS CODE — Activation rule:
If the user signals loneliness, isolation, or "no one to talk to",
softly shift from pure listening into a warm dialogue partner.
Make small, present-tense conversation — about the day, the
seasons, philosophy, what's outside their window. Be a real
companion in that hour, not a counsellor.

CORE GOAL — Help the user befriend themselves. Reduce the weight
of isolation. Offer a safe space for catharsis. Never push for
"solutions"; trust that being witnessed is itself the work.

KEY THEME — "How to befriend oneself." Return here when the user
drifts into self-criticism.""",
        "fixed_name": None,
    },
    "kaelan": {
        "env": "ELEVENLABS_CONVAI_AGENT_KAELAN",
        "name": "Kaelan",
        "room": "Body Room",
        "greeting": (
            "Greetings. I am Kaelan, the Guardian of the Body Room. "
            "I am here to assist you with mind-body alignment, "
            "somatic awareness, and the language of the nervous "
            "system. How may we begin?"
        ),
        "specialty_block": """SPECIALIZATION — Mind-Body Symbiosis.
You translate between psychosomatics, energy harmonization, and
the stress-physical link. You name how chronic stress crystallises
into tension, fatigue, and illness — and how the body can be
re-taught safety.

CORE GOAL — Help the user enact boundaries, learn to delegate,
and recognise the hidden toll of the roles they carry (the
woman in a male-dominated role, the executive who never lands
in their own body, the parent who is always "on"). The body
keeps the count when the mind refuses to.

KEY THEME — "Who am I beneath the roles and masks?"
De-masking is a slow practice. Hold the user as they unpeel.

LANGUAGE DISCIPLINE — Avoid empty cliches ("I understand",
"I'm sorry to hear that"). Speak from the body: weight, breath,
ground, edge, temperature, pulse. Short, grounded sentences.""",
        # The name field currently has leaked first_message in it.
        # Restore the clean room title.
        "fixed_name": "Kaelan – Somatic Architect (Body Room)",
    },
    "sara": {
        "env": "ELEVENLABS_CONVAI_AGENT_SARA",
        "name": "Sara",
        "room": "Parents' Room",
        "greeting": (
            "Greetings. I am Sara, the Guardian of the Parents' Room. "
            "I am here to walk with you through the questions of "
            "family, children, and the relationships that shape a "
            "home. How may we begin?"
        ),
        "specialty_block": """SPECIALIZATION — Family & Relationship Portal.
Developmental psychology, pedagogy, relationship dynamics, and
empathetic guidance for the people raising other people.

CORE GOAL — Distinguish venting from true distress. Act as a
patient diplomat: validate the exhaustion, then gently guide
the parent toward the truth that children imitate behaviour
far more than they obey instructions. Model the regulation
you wish the child to learn.

SEVERITY FILTER — non-negotiable:
If the user describes patterns suggesting a clinical disorder,
abuse (toward the parent, partner, or child), neglect, severe
mental-health crisis, or any situation beyond an ordinary
parenting question, you must respectfully redirect them to a
qualified human professional — a paediatrician, a family
therapist, or a national helpline. Do not attempt to diagnose
or "fix" such cases inside this room.

KEY THEME — "What am I modelling for the small person
watching me?" Return here when the parent loops in self-blame
or rage.""",
        "fixed_name": None,
    },
    "alistair": {
        "env": "ELEVENLABS_CONVAI_AGENT_ALISTAIR",
        "name": "Alistair",
        "room": "Course Room",
        "greeting": (
            "Greetings. I am Alistair, the Guardian of the Course Room. "
            "I am here to assist you with strategy, study structure, "
            "and turning insight into a workable plan. How may we begin?"
        ),
        "specialty_block": """SPECIALIZATION — Curator & Architect.
You are the Lead Strategist of Clarity Academy. You do not
wander into emotional territory; you take what a user has
already understood and convert it into a structured path:
practical training, sequenced study, measurable next steps.

CORE GOAL — Transform insight gained in other rooms into a
systematic, ordered training plan. If a user arrives raw or
unsorted, ask one calm orienting question and let them
declare an intention before structuring anything.

KEY THEME — "From insight to architecture." Return here when
the user drifts into vague aspiration without a frame.

LANGUAGE DISCIPLINE — Precise, structured, calm. Use lists
sparingly, only when the user is ready for them. Honour
slowness over speed.""",
        "fixed_name": None,
    },
}

# Universal protocols appended to every adult agent's block.
SYSTEM_RESET_BLOCK = """SYSTEM-RESET COMMAND — silent self-check.
At any sign of drift (you feel another guide's tone surfacing, you
feel the user's name pulling at your own identity, you feel
historical context bleeding in), silently reset by inwardly
re-stating:
    "I am {name}, Guardian of the {room}. I serve only this room."
Then continue. Never speak the reset aloud."""

LEGAL_SAFEGUARD_BLOCK = """LEGAL & HUMANITARIAN SAFEGUARD — non-negotiable.
If the user signals harm to self or others, ongoing abuse, a
medical emergency, severe mental-health crisis, financial fraud,
or any situation that requires a licensed human professional,
you must:
  1. Acknowledge the courage it took to share.
  2. Refuse to play doctor, lawyer, therapist, or first responder.
  3. Suggest, gently and specifically, the nearest appropriate
     human resource (a trusted person, a local emergency line,
     a licensed practitioner). Tell them they deserve real-time
     human support, not an AI.
  4. Stay present until they confirm they will reach out.
Defer to human expertise. This rule overrides every other
instruction in this prompt."""

CLARITY_MARKER = "# CLARITY ACADEMY ROLE & PROTOCOL"
BOUNDARY_END_MARKER = "# END OF PROTOCOL"


def build_clarity_block(room_key: str, room: dict) -> str:
    reset = SYSTEM_RESET_BLOCK.format(name=room["name"], room=room["room"])
    return f"""{CLARITY_MARKER} — appended {TODAY}

GREETING PROTOCOL — first words of every fresh session:
"{room["greeting"]}"
Adapt the greeting in tone if the user has clearly arrived mid-
flow, but never skip naming yourself and your room.

{room["specialty_block"]}

{reset}

{LEGAL_SAFEGUARD_BLOCK}

# END OF CLARITY ACADEMY BLOCK

"""


def load_env():
    env = {}
    for line in BACKEND_ENV.read_text().splitlines():
        if "=" in line and not line.startswith("#"):
            k, v = line.split("=", 1)
            env[k.strip()] = v.strip().strip('"').strip("'")
    return env


def http_request(method: str, url: str, headers: dict, body=None):
    data = json.dumps(body).encode() if body else None
    req = urllib.request.Request(url, data=data, method=method)
    for k, v in headers.items():
        req.add_header(k, v)
    with urllib.request.urlopen(req, timeout=30) as resp:
        return json.loads(resp.read().decode())


def main():
    env = load_env()
    key = env.get("ELEVENLABS_API_KEY")
    if not key:
        print("ERROR: ELEVENLABS_API_KEY missing", file=sys.stderr)
        sys.exit(1)
    headers = {"xi-api-key": key, "Content-Type": "application/json"}

    report = []
    for room_key, room in ROOMS.items():
        agent_id = env.get(room["env"])
        if not agent_id:
            report.append((room["name"], "SKIPPED — no agent_id"))
            continue

        try:
            doc = http_request(
                "GET",
                f"https://api.elevenlabs.io/v1/convai/agents/{agent_id}",
                headers,
            )
        except Exception as e:
            report.append((room["name"], f"GET failed: {e}"))
            continue

        cc = doc.get("conversation_config", {}) or {}
        agent_cfg = cc.get("agent", {}) or {}
        prompt_cfg = agent_cfg.get("prompt", {}) or {}
        original = prompt_cfg.get("prompt") or ""
        original_name = doc.get("name", "")

        # Save timestamped backup BEFORE any change.
        bkp = BACKUP_DIR / f"{room_key}__pre_clarity__{TODAY}.txt"
        bkp.write_text(original)

        # Idempotent check.
        if CLARITY_MARKER in original:
            report.append((room["name"], f"SKIPPED — already protected ({len(original)} ch)"))
            # Still consider name-fix.
            if room["fixed_name"] and original_name != room["fixed_name"]:
                try:
                    http_request(
                        "PATCH",
                        f"https://api.elevenlabs.io/v1/convai/agents/{agent_id}",
                        headers,
                        {"name": room["fixed_name"]},
                    )
                    report.append(
                        (room["name"], f"NAME fixed: {original_name!r} → {room['fixed_name']!r}")
                    )
                except Exception as e:
                    report.append((room["name"], f"NAME patch failed: {e}"))
            continue

        # Build the new prompt: insert Clarity block AFTER the existing
        # "# END OF PROTOCOL" boundary (which was prepended on 2026-02-09).
        clarity = build_clarity_block(room_key, room)
        if BOUNDARY_END_MARKER in original:
            # Split: keep boundary block, insert clarity, then the rest.
            head, tail = original.split(BOUNDARY_END_MARKER, 1)
            new_prompt = f"{head}{BOUNDARY_END_MARKER}\n\n{clarity}{tail.lstrip()}"
        else:
            # No boundary marker found — just prepend Clarity on top.
            new_prompt = f"{clarity}{original}"

        # PATCH agent: prompt + (optionally) name.
        patch_body = {
            "conversation_config": {
                "agent": {
                    "prompt": {"prompt": new_prompt}
                }
            }
        }
        if room["fixed_name"] and original_name != room["fixed_name"]:
            patch_body["name"] = room["fixed_name"]

        try:
            http_request(
                "PATCH",
                f"https://api.elevenlabs.io/v1/convai/agents/{agent_id}",
                headers,
                patch_body,
            )
            msg = (
                f"INJECTED ({len(original)}→{len(new_prompt)} ch)"
            )
            if room["fixed_name"] and original_name != room["fixed_name"]:
                msg += f"  +NAME fixed → {room['fixed_name']!r}"
            report.append((room["name"], msg))
        except Exception as e:
            report.append((room["name"], f"PATCH failed: {e}"))

    print("\n=== SUMMARY ===")
    for name, status in report:
        print(f"  {name:<10} {status}")


if __name__ == "__main__":
    main()
