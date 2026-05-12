"""
shared_memory.py — Cross-Room "quiet teadmine" bridge.

When a wanderer brings up tiredness in Body Room, the Parents' Room
mentor should already know it. This module is the bridge.

Design:
  - One Mongo collection: `shared_memory_tags`
      { user_id, tag, source_room, weight, last_seen_at, sessions }
  - Tags are short, lowercased keywords ("tiredness", "child", "anger",
    "sleep_loss", "screen_time_struggle"). Never full sentences.
  - Each room's chat pipeline calls `record_signals(user_id, room,
    text)` AFTER it has generated a reply. The recorder extracts a
    small, conservative set of signals from the wanderer's own words.
  - Any room's chat pipeline calls `quiet_knowledge(user_id, room)`
    BEFORE building its prompt. The returned list of `(tag, source)`
    tuples is rendered into the system prompt as a "vaikne taustateadmine"
    line — never quoted back at the wanderer.

Privacy:
  - Tags are content-only categories, never PII.
  - Stored per `user_id`; if the wanderer is a guest, the bridge
    silently no-ops (no global state pollution).
"""
from __future__ import annotations

import re
from datetime import datetime, timezone
from typing import List, Dict, Tuple, Optional


# Conservative tag dictionary — these are the only signals we extract.
# Lowercase regex patterns checked against the wanderer's own text.
# Keep the list short and human; do NOT auto-expand from LLM output.
_SIGNAL_PATTERNS: List[Tuple[str, re.Pattern]] = [
    ("tiredness",        re.compile(r"\b(tired|exhausted|drained|wiped out|burned? out|väsinud|kurnatud)\b", re.I)),
    ("sleep_loss",       re.compile(r"\b(can'?t sleep|no sleep|haven'?t slept|sleepless|insomnia|une\w*\s+pu(?:udus|udu))\b", re.I)),
    ("anger",            re.compile(r"\b(angry|furious|rage|snapped|lost it|viha\w*|raevu\w*)\b", re.I)),
    ("anxiety",          re.compile(r"\b(anxious|anxiety|worried|panic|ärev\w*|mure\w*)\b", re.I)),
    ("grief",            re.compile(r"\b(grief|grieving|lost|mourning|lein\w*|kurbus\w*)\b", re.I)),
    ("loneliness",       re.compile(r"\b(lonely|alone|isolated|üksi\w*|üksilduses)\b", re.I)),
    ("shame",            re.compile(r"\b(shame|guilty|guilt|häbi\w*|süütund\w*)\b", re.I)),
    ("child",            re.compile(r"\b(child|kid|son|daughter|baby|toddler|laps\w*|tütar|poeg|beebi)\b", re.I)),
    ("partner",          re.compile(r"\b(partner|husband|wife|spouse|abikaasa|partner\w*|elukaasla\w*)\b", re.I)),
    ("work_stress",      re.compile(r"\b(work stress|deadline|boss|fired|laid off|töö\s*stress|töö\w*pinge)\b", re.I)),
    ("tension_chest",    re.compile(r"\b(chest (tight|heavy|hurts|aches?)|tight chest|rind\w* (pinges|raske))\b", re.I)),
    ("tension_shoulders",re.compile(r"\b(shoulders (tight|hurt|aching)|tight shoulders|õlga\w* pinge)\b", re.I)),
    ("tension_head",     re.compile(r"\b(headache|head hurts?|migrain\w*|peavalu\w*)\b", re.I)),
    ("tension_belly",    re.compile(r"\b(stomach (tight|hurts)|belly ache|tight (stomach|belly)|kõhu\w*\s+(valu|pinge))\b", re.I)),
    ("screen_struggle",  re.compile(r"\b(screen time|too much (?:phone|screen|tv)|ekraani\w*)\b", re.I)),
    ("bedtime_struggle", re.compile(r"\b(bedtime|won'?t (?:sleep|go to bed)|magama\s*minek)\b", re.I)),
    ("food_struggle",    re.compile(r"\b(won'?t eat|food fight|picky eater|söömis\w*\s+(?:probleem|raske))\b", re.I)),
]


_VALID_ROOMS = {"body", "clarity", "parents", "kids"}


def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def extract_signals(text: str) -> List[str]:
    """Return the set of tags the wanderer's text matches. Each tag
    appears at most once. Order is insertion-order of the dictionary."""
    if not text or not isinstance(text, str):
        return []
    seen: List[str] = []
    for tag, pat in _SIGNAL_PATTERNS:
        if pat.search(text) and tag not in seen:
            seen.append(tag)
    return seen


async def record_signals(db, user_id: str, room: str, text: str) -> List[str]:
    """Persist any tags found in `text` for this user_id + room.

    Returns the list of tags actually written. Silently no-ops if
    user_id is missing/guest, db is None, or the room name is unknown.
    """
    if not user_id or not db or room not in _VALID_ROOMS:
        return []
    tags = extract_signals(text)
    if not tags:
        return []
    now = _now_iso()
    for tag in tags:
        await db.shared_memory_tags.update_one(
            {"user_id": user_id, "tag": tag},
            {
                "$set": {
                    "user_id": user_id,
                    "tag": tag,
                    "last_seen_at": now,
                    "last_source_room": room,
                },
                "$inc": {"weight": 1, "sessions": 1},
                "$addToSet": {"source_rooms": room},
            },
            upsert=True,
        )
    return tags


async def quiet_knowledge(db, user_id: str, room: str, limit: int = 6) -> List[Dict]:
    """Return up to `limit` recent quiet-knowledge tags this room should
    silently carry into the prompt. Sorted by recency × weight.

    Tags whose `last_source_room` matches the current `room` are
    excluded — we already know what was said HERE; the bridge is for
    what was said ELSEWHERE.
    """
    if not user_id or not db:
        return []
    cursor = db.shared_memory_tags.find(
        {"user_id": user_id, "last_source_room": {"$ne": room}},
        {"_id": 0, "tag": 1, "last_source_room": 1, "weight": 1, "last_seen_at": 1},
    ).sort("last_seen_at", -1).limit(int(limit))
    out: List[Dict] = []
    async for doc in cursor:
        out.append(doc)
    return out


def render_prompt_block(tags: List[Dict]) -> Optional[str]:
    """Render the quiet-knowledge tags into a single system-prompt
    fragment. Returns None when the list is empty so the caller can
    skip the section entirely."""
    if not tags:
        return None
    lines = ["# §Quiet knowledge from earlier (do not quote back)"]
    lines.append(
        "The wanderer has previously spoken about the themes below "
        "in other rooms. Treat these as soft background only. NEVER "
        "say 'you mentioned…' or 'last time you said…'. Let the "
        "knowledge change your tone, not your words."
    )
    for t in tags:
        lines.append(
            f"  - {t.get('tag')} (room: {t.get('last_source_room', 'unknown')})"
        )
    return "\n".join(lines)


async def ensure_indexes(db) -> None:
    await db.shared_memory_tags.create_index(
        [("user_id", 1), ("tag", 1)], unique=True
    )
    await db.shared_memory_tags.create_index(
        [("user_id", 1), ("last_seen_at", -1)]
    )
