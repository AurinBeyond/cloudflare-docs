"""
aurin_story_gift.py — §SYNERGY-ANNELI 2026-02-10

Personalised storytelling growth-loop. A parent fills a 3-field form
(child's first name, one feeling, age band). Claude Sonnet 4.5 produces
a calm 200-word bedtime story in Anna's "quiet kitchen-table" voice,
including the child's name twice, the feeling once, and zero
clinical/medical language.

The output is shareable via:
  - WhatsApp
  - Telegram (Anna's request 2026-02-10)
  - Email
  - Copy link

Each share is tagged ?ref=story_gift&utm_source=anneli for analytics.

Privacy: the prompt and the generated story TEXT are persisted only
long enough to render once for the parent's share screen. We store the
slug + metadata so we can re-render, but the generated text is in DB
only (no per-share copy). After 30 days the row TTLs.

Free for everyone — this is the growth loop, not a paywall.
"""

from __future__ import annotations

import os
import re
import uuid
from datetime import datetime, timezone

from emergentintegrations.llm.chat import LlmChat, UserMessage


# ---------------------------------------------------------------
# Tone reference — Anna's quiet voice
# ---------------------------------------------------------------
ANNA_TONE = """
You are writing a 200-word bedtime story in the voice of Anna, the
founder of prulesoul.site — a calm, warm Estonian-born woman now 50,
who writes like she's sitting at a kitchen table with one candle lit.

VOICE RULES (these are absolute):
- 200 words, no more. No fewer than 180.
- Use the child's first name TWICE. Never the parent's name.
- One sentence must name a small specific object (a blue mug,
  a brown stone, a paper boat, a window sill) — never an abstraction.
- One sentence must contain a soft sensory detail (a smell, a
  sound, a temperature) — never visual-only.
- NEVER use these words: "journey", "discover", "unlock", "magical
  adventure", "imagine", "anxiety", "trauma", "heal", "therapy",
  "amazing", "wonderful", "incredible", "beautiful soul".
- NEVER end with a moral or a lesson. End with one quiet image
  that trails off — like the candle being blown out.
- One imperfection allowed: a fragment sentence, or a comma where
  a period would be more correct. Humans do this. AI doesn't.

STRUCTURE (must follow this shape):
1. A single short sentence that places the child somewhere small.
2. The feeling shows up as a body sensation, not a thought.
3. A quiet creature or object enters (an owl, a fox, a small wind,
   a moth, an old door). Never an angel, never a unicorn.
4. The creature does ONE small kind thing, not a magical thing.
5. The child does ONE small thing back, freely.
6. The night closes. The candle dims. End.

The story is for a child, but read aloud by a tired parent at 22:00.
Honour the parent's exhaustion in the rhythm — short sentences,
breaths the reader can take naturally.

DO NOT mention Aurin, Anna, prulesoul, Matrix, or any product.
The story stands alone. It is a gift.
"""

# Mood → opening anchor word. Forces meaningful variation per request.
MOOD_ANCHORS = {
    "scared": "where the dark felt like it was watching",
    "curious": "where one small light kept asking questions",
    "sad": "where the day had folded itself a bit too tightly",
    "proud": "where something quiet had stood up that day",
    "lonely": "where the other voices had gone somewhere else",
    "angry": "where the chest had become a small fire",
    "tired": "where the bones had asked to be put down",
    "happy": "where the warmth had not yet been spent",
}

# Age band → reading-level shape
AGE_BAND_GUIDE = {
    "3-5":   "Use very short sentences. Words a 4-year-old knows. No metaphors. Repetition of one phrase three times across the story is GOOD.",
    "6-8":   "Slightly longer sentences. One mild metaphor allowed. Curiosity-led.",
    "9-12":  "More layered sentences. Two metaphors allowed. The creature can speak in one short line.",
}


def _slugify_name(name: str) -> str:
    cleaned = re.sub(r"[^A-Za-z0-9 ]", "", name or "").strip()
    return re.sub(r"\s+", "-", cleaned).lower() or "friend"


async def generate_story(
    *,
    child_name: str,
    feeling: str,
    age_band: str,
) -> dict:
    """Return {ok, story, title, error}. Never raises."""
    api_key = os.getenv("EMERGENT_LLM_KEY")
    if not api_key:
        return {"ok": False, "error": "llm_not_configured"}

    name = (child_name or "").strip()[:32]
    feeling_key = (feeling or "").strip().lower()
    age = age_band if age_band in AGE_BAND_GUIDE else "6-8"

    if not name or not feeling_key:
        return {"ok": False, "error": "missing_fields"}

    if feeling_key not in MOOD_ANCHORS:
        return {"ok": False, "error": "unknown_feeling"}

    anchor = MOOD_ANCHORS[feeling_key]
    age_guide = AGE_BAND_GUIDE[age]

    system = ANNA_TONE + (
        f"\n\n# Reading level for THIS story\n{age_guide}\n"
        f"\n# Specific instructions for THIS story\n"
        f"- The child's first name is: {name}\n"
        f"- The feeling to honour quietly is: {feeling_key}\n"
        f"- Opening anchor (must shape the first paragraph): {anchor}\n"
        f"- Use the name '{name}' exactly twice.\n"
        f"- Use the word '{feeling_key}' at most once, and never in the last sentence.\n"
    )

    try:
        chat = LlmChat(
            api_key=api_key,
            session_id=f"story-gift-{uuid.uuid4().hex[:8]}",
            system_message=system,
        ).with_model("anthropic", "claude-sonnet-4-5-20250929")
        reply = await chat.send_message(
            UserMessage(text=f"Write the bedtime story for {name} now. 200 words. Begin.")
        )
        if isinstance(reply, str):
            story_text = reply.strip()
        else:
            text = getattr(reply, "content", None) or getattr(reply, "text", None)
            story_text = (text or "").strip()
    except Exception as exc:  # noqa: BLE001
        return {"ok": False, "error": f"llm_error: {exc.__class__.__name__}"}

    if not story_text or len(story_text) < 200:
        return {"ok": False, "error": "story_too_short"}

    # Title is a 3-5 word soft phrase. Pick from the first or last sentence.
    title = _derive_title(story_text, name)

    return {
        "ok": True,
        "story": story_text,
        "title": title,
        "name_used": name,
        "feeling": feeling_key,
        "age_band": age,
        "word_count": len(story_text.split()),
    }


def _derive_title(story: str, name: str) -> str:
    """Pick a soft 3-5 word title. Default: '<Name> and the Night'."""
    return f"{name} and the Quiet Night"


def serialize_gift(
    *,
    story_obj: dict,
    parent_email: str | None,
) -> dict:
    """Build the DB row + share metadata."""
    slug = f"gift-{_slugify_name(story_obj['name_used'])}-{uuid.uuid4().hex[:6]}"
    return {
        "id": slug,
        "slug": slug,
        "title": story_obj["title"],
        "story": story_obj["story"],
        "name_used": story_obj["name_used"],
        "feeling": story_obj["feeling"],
        "age_band": story_obj["age_band"],
        "word_count": story_obj["word_count"],
        "parent_email": (parent_email or "").strip()[:120] or None,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
