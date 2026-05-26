"""
aurin_story_gift.py — §SYNERGY-ANNELI 2026-02-10
                       §INGLI-JUTUD 2026-02-10 (updated with Anna's source)

Personalised storytelling growth-loop, grounded in the **Ingli Jutud**
(Angel Stories) book DNA Anna shared on 2026-02-10. Each story carries
the SAME purpose as the book — but the "guardian" character is rendered
as a NON-RELIGIOUS symbol of goodness, never as a religious figure.

Anna's book purpose (verbatim translated):
  • The child feels they are not alone
  • Goodness and love are real
  • Even inside heavy feelings, there can be light
  • Through imagination, the child learns to meet and calm their feelings

The closing felt-sense every story must leave behind:
  > "I am held. I am loved. I am never truly alone."

Three guardian archetypes (mapped from the book's three angels):
  1. NIGHT_GUARDIAN  ← Ööingel — calms night fears, builds bedtime safety
  2. PEACE_KEEPER    ← Rahu Ingel — empathy, kindness over force
  3. PROTECTOR       ← Kaitseingel — invisible support, courage in difficulty

The guardian is NEVER:
  - explicitly called an "angel" in English (legal/religious neutrality)
  - magical, sparkly, or supernatural ("not nõid, not haldjas, not magical")
  - a clinical/therapeutic figure
  - human (must be a non-human, gentle presence)

The guardian IS:
  - a small, gentle creature or quiet element (moth, owl, fox, wind, candle,
    lantern, old door, sleeping cat, river-stone)
  - a symbol of inner light — never a fixer
  - a quiet companion who does ONE small kind thing and leaves

Shareable via WhatsApp, Telegram (Anna's request), Email, Copy link.
Free. Zero-CAC growth loop with `?ref=story_gift&utm_source=anneli`.
"""

from __future__ import annotations

import os
import re
import random
import uuid
from datetime import datetime, timezone

from emergentintegrations.llm.chat import LlmChat, UserMessage


# ---------------------------------------------------------------
# §INGLI-JUTUD ARCHETYPES — three guardian-purpose families
# ---------------------------------------------------------------
# Each feeling routes to the archetype best suited to honour it.
# The archetype is the SOUL of the story, never named directly.
NIGHT_GUARDIAN = {
    "id": "night_guardian",
    "purpose": (
        "Calm a night fear. Show that darkness can hold safety, not danger. "
        "Build a quiet evening ritual feeling. The child should fall asleep "
        "after this story with a slightly slower breath."
    ),
    "creatures": ["a pale grey moth", "a soft brown owl", "an old folded blanket",
                  "a quiet candle in a jar", "a small grey cat", "the wind under the door"],
    "sensory_anchor": "the smell of cool air, or warm fabric, or old wood",
}

PEACE_KEEPER = {
    "id": "peace_keeper",
    "purpose": (
        "Show that kindness is strength. Demonstrate, through a small story, "
        "that gentleness can change a moment more than force. The child should "
        "finish the story feeling that their own softness is a kind of power."
    ),
    "creatures": ["a small grey fox", "an old garden bee", "a stray dog with kind eyes",
                  "a sparrow on a window-sill", "a slow turtle by a stream"],
    "sensory_anchor": "the sound of breathing, or rain on a roof, or leaves moving",
}

PROTECTOR = {
    "id": "protector",
    "purpose": (
        "Name invisible support. Show that even when no one is in the room, "
        "the child is not alone — through a small kind thing that arrives "
        "without being asked. The child should finish the story feeling held."
    ),
    "creatures": ["an old wooden door that stayed open", "a streetlamp that did not go out",
                  "a folded coat over a chair", "a stone in their pocket",
                  "a lamp on a far hill", "the warm spot a sleeping animal left behind"],
    "sensory_anchor": "warmth on the skin, or the weight of a hand, or a steady light",
}

# Map feeling → archetype (Anna's source guides this)
FEELING_TO_ARCHETYPE = {
    "scared":  NIGHT_GUARDIAN,
    "tired":   NIGHT_GUARDIAN,
    "lonely":  PROTECTOR,
    "sad":     PROTECTOR,
    "angry":   PEACE_KEEPER,
    "proud":   PEACE_KEEPER,
    "curious": PEACE_KEEPER,
    "happy":   PEACE_KEEPER,
}

# Mood → opening anchor word (forces meaningful per-request variation).
MOOD_ANCHORS = {
    "scared":  "where the dark felt like it was watching",
    "curious": "where one small light kept asking questions",
    "sad":     "where the day had folded itself a bit too tightly",
    "proud":   "where something quiet had stood up that day",
    "lonely":  "where the other voices had gone somewhere else",
    "angry":   "where the chest had become a small fire",
    "tired":   "where the bones had asked to be put down",
    "happy":   "where the warmth had not yet been spent",
}

# Age band → reading-level shape.
AGE_BAND_GUIDE = {
    "3-5":   "Use very short sentences. Words a 4-year-old knows. No metaphors. "
             "Repetition of one phrase three times across the story is GOOD.",
    "6-8":   "Slightly longer sentences. One mild metaphor allowed. Curiosity-led.",
    "9-12":  "More layered sentences. Two metaphors allowed. The creature can speak "
             "in one short line.",
}


# ---------------------------------------------------------------
# §INGLI-JUTUD TONE — Anna's voice + book DNA
# ---------------------------------------------------------------
ANNA_TONE_BASE = """
You are writing a 200-word bedtime story in the voice of Anna, the
founder of prulesoul.site — a calm, warm Estonian-born woman now 50,
who writes like she's sitting at a kitchen table with one candle lit.

This story is part of the *Ingli Jutud* (Angel Stories) tradition Anna
created — but you must NEVER use the word "angel", "spirit", "god",
"prayer", "blessed", or any religious term. The guardian figure must
appear as a small earthly creature or quiet object that carries the
SAME purpose as an angel in the book: a symbol of goodness, an inner
light, a reminder that the child is not alone.

THE FELT-SENSE EVERY STORY MUST LEAVE BEHIND:
  "I am held. I am loved. I am never truly alone."
The child should close the story (or the parent should close the page)
feeling slightly safer, slightly less alone, slightly more able to sleep.

VOICE RULES (these are absolute):
- 180–210 words. Always count.
- Use the child's first name TWICE — never more than three times.
- Use the named feeling at most ONCE, and NEVER in the last sentence.
- The first sentence must place the child in a small, ordinary space
  (their bed, their window, their kitchen, their garden) — never
  in a "magical land".
- One sentence must contain a SOFT SENSORY detail (smell, sound,
  temperature, touch) — never visual-only.
- One sentence must name a SMALL SPECIFIC OBJECT — a wooden pencil,
  a blue mug, a paper boat, a pebble, the corner of a blanket.
- One small "imperfection" is allowed: a fragment sentence, or a
  comma where a period would be more strictly correct. Humans do this.

WORDS YOU MUST NEVER USE (hard ban — these will be filtered):
  therapy, therapist, treatment, cure, heal, healing, diagnosis,
  trauma, traumatic, anxiety disorder, depression, depressive, PTSD,
  panic attack, clinical, mental health, intervention, protocol,
  patient, medication, prescription, disorder, disease, pathology,
  syndrome, magical, magic, journey, unlock, discover, "imagine that",
  amazing, wonderful, incredible, beautiful soul, perfect, special
  ("special" is overused — replace with "quiet" or omit).

ENDING RULE:
  Never end with a moral, a lesson, or a "remember to…" sentence.
  End with ONE quiet image that trails off — like a candle being
  blown out, like a cat shifting in its sleep, like the temperature
  changing in a room.

The story is for a child, but read aloud by a tired parent at 22:00.
Honour the parent's exhaustion in the rhythm — short sentences,
breaths the reader can take naturally.

DO NOT mention Aurin, Anna, prulesoul, Matrix, the company, or any
product. The story stands alone. It is a gift.
"""


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

    archetype = FEELING_TO_ARCHETYPE[feeling_key]
    anchor = MOOD_ANCHORS[feeling_key]
    age_guide = AGE_BAND_GUIDE[age]
    creature = random.choice(archetype["creatures"])

    archetype_block = (
        f"\n# Guardian archetype for THIS story: {archetype['id']}\n"
        f"Purpose to honour (do not name explicitly): {archetype['purpose']}\n"
        f"The guardian figure in THIS story is: {creature}.\n"
        f"It must do ONE small, ordinary kind thing — not a magical thing.\n"
        f"It must NOT speak unless the age band is 9-12, and then only one short line.\n"
        f"Sensory anchor for THIS archetype: {archetype['sensory_anchor']}.\n"
    )

    system = ANNA_TONE_BASE + archetype_block + (
        f"\n# Reading level for THIS story\n{age_guide}\n"
        f"\n# Specific instructions for THIS story\n"
        f"- The child's first name is: {name}\n"
        f"- The feeling to honour quietly is: {feeling_key}\n"
        f"- Opening anchor (must shape the first paragraph): {anchor}\n"
        f"- Use the name '{name}' exactly twice, never three times.\n"
        f"- Use the word '{feeling_key}' at most once, never in the last sentence.\n"
        f"- The closing felt-sense must be: 'I am held. I am loved. I am never alone.'\n"
        f"  Without ever saying those words directly.\n"
    )

    try:
        chat = LlmChat(
            api_key=api_key,
            session_id=f"story-gift-{uuid.uuid4().hex[:8]}",
            system_message=system,
        ).with_model("anthropic", "claude-sonnet-4-5-20250929")
        reply = await chat.send_message(
            UserMessage(text=f"Write the bedtime story for {name} now. 180–210 words. Begin.")
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

    # Sanitize against the production clarity-safety filter — same lexicon
    # the wanderer rooms use. Belt-and-braces against banned words.
    try:
        from clarity_safety import sanitize_reply
        story_text = sanitize_reply(story_text)
    except Exception:  # noqa: BLE001
        pass

    title = _derive_title(story_text, name, archetype)

    return {
        "ok": True,
        "story": story_text,
        "title": title,
        "name_used": name,
        "feeling": feeling_key,
        "age_band": age,
        "archetype": archetype["id"],
        "word_count": len(story_text.split()),
    }


def _derive_title(story: str, name: str, archetype: dict) -> str:
    """Soft 3-5 word title shaped by the archetype family."""
    suffix_map = {
        "night_guardian": "and the Quiet Night",
        "peace_keeper":   "and the Soft Answer",
        "protector":      "and the Steady Light",
    }
    return f"{name} {suffix_map.get(archetype['id'], 'and the Quiet Night')}"


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
        "archetype": story_obj.get("archetype"),
        "word_count": story_obj["word_count"],
        "parent_email": (parent_email or "").strip()[:120] or None,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
