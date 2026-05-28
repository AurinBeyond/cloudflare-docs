"""
parents_lenses.py — Parents' Room Multi-Lens registry (Stage 3.2).

Three opt-in parenting wisdom lenses, mirroring the body_lenses.py
architecture so the same Multi-Lens UX scales beyond the body:

  - shitsuke         · Japanese Shitsuke + Itadakimasu + Amae
  - montessori       · Montessori + Waldorf + developmental biology
  - positive_coding  · Positive psychology + affirmation language
  - intuitive        · the default · the room reads + chooses silently

§MATRIX-AURIN AUTHORIAL OVERLAY (founder-locked 2026-02-11)
-------------------------------------------------------------------
The named sources (Shitsuke, Montessori, Waldorf, Steiner, positive
psychology) are public-domain pedagogical traditions. This file does
NOT reproduce or paraphrase any one author's text. Every insight,
practice, and permission line in this registry is an *original
Matrix Aurin synthesis* — written in our biomechanical / architectural
register and run through Sara's "Anchor OS" lens before being placed
here.

The Matrix Aurin authorial transformation:
  • Source intent kept (e.g. Montessori's "prepared environment").
  • Source language replaced with our register (we say "small
    architectural shift", never "Montessori method").
  • Where a Japanese / Italian term remains, it is followed by a
    plain-meaning fragment authored by us, not by the source.
  • All judgement / moralising / parent-shaming verbs are stripped
    and replaced with possibility-verbs ("you may notice…",
    "one option is…").

This overlay is the legal AND the brand shield: the wisdom is
real, the words are ours. Do not copy in third-party copy.

Each lens carries:
  - id, name, subtitle, plain, scope, attribution
  - `prompt_anchor` — fragment injected into the parents-room system
    prompt when this lens is the active perspective.
  - `situations` — eight everyday situations a parent might bring
    (bedtime, mealtime, tantrum, screen-time, sibling conflict,
    separation, school stress, big emotions) with one quiet
    `insight` + one `practice` + one `permission` per situation.

Wellness-language lock (enforced here AND audited by clarity_safety):
  - No "diagnose", "cure", "heal", "treat", "therapy", "disorder",
    "patient", "psychiatric" claims.
  - No moralising language ("you must", "good parents do…",
    "bad behavior"). The room is a hand at the edge, not a judge.
  - Japanese / Italian terms are always paired with plain meaning.
  - Named teachers (Maria Montessori, Rudolf Steiner) are referenced
    as public sources, never as authorities the parent must obey.
  - Each insight is *a possibility*, never a verdict.
"""
from __future__ import annotations

from typing import Dict, List, Optional


# Eight everyday parenting situations — the equivalent of Body Room
# hotspots, surfaced as opt-in chips in the Parents' Room.
SITUATION_IDS = (
    "bedtime",          # winding down, sleep resistance
    "mealtime",         # food refusal, picky eating
    "big_emotions",     # tantrum, meltdown, overwhelm
    "screen_time",      # device negotiation, transitions
    "sibling",          # sibling friction, sharing
    "separation",       # daycare drop-off, parent-leaving
    "school_stress",    # homework, performance pressure
    "connection",       # everyday repair, "I see you"
)


LENSES: Dict[str, dict] = {
    # -----------------------------------------------------------------
    # 0) INTUITIVE FLOW — the default. The mentor reads the parent's
    # words and shifts register invisibly. No method is named aloud.
    # -----------------------------------------------------------------
    "intuitive": {
        "id": "intuitive",
        "name": "Intuitive Flow",
        "subtitle": "the room adapts to you",
        "plain": "the mentor reads what you bring and chooses",
        "scope": (
            "The default. If you do not pick a lens, the mentor "
            "listens to the texture of what you describe and quietly "
            "adapts — sometimes a Japanese rhythm, sometimes a "
            "developmental cue, sometimes a small affirming sentence. "
            "You will never be told which lens is in use."
        ),
        "attribution": (
            "A quiet synthesis of all three schools — Shitsuke, "
            "Montessori / developmental, and positive-coding — used "
            "the way an experienced grandparent might use them: "
            "invisibly, warmly, never as instruction."
        ),
        "prompt_anchor": (
            "Active lens for this reply: INTUITIVE FLOW (default). Read "
            "the parent's last line carefully and choose the most "
            "appropriate register WITHOUT naming it aloud. You MUST NOT "
            "say 'in Montessori we…' or 'the Japanese approach is…' "
            "or 'this is positive parenting'. The wisdom must arrive "
            "as if it were yours.\n\n"
            "Context-driven priority (apply silently):\n"
            "- If the parent describes overwhelm, big emotions, "
            "tantrums, sensory-flooding, or 'I lost it' moments → "
            "prioritise the SHITSUKE register: rhythm, breath, soft "
            "co-regulation, a single small ritual.\n"
            "- If the parent describes a developmental question "
            "(motor skills, autonomy, attention, learning rhythm, "
            "frustration with a stage) → prioritise the MONTESSORI / "
            "developmental register: a small environmental shift or "
            "a game, framed as 'an invitation, not a fix'.\n"
            "- If the parent describes self-doubt, comparison, guilt, "
            "shame about their own parenting, or a child internalising "
            "a hard label → prioritise the POSITIVE-CODING register: "
            "ONE short, repeatable sentence the parent can say to "
            "the child (or to themselves) that replaces the heavy "
            "phrasing with a lighter one.\n\n"
            "You MAY micro-mix: a small breath plus a single sentence. "
            "Never more than two elements per reply. Never offer "
            "advice the parent did not ask for."
        ),
        "situations": {},
    },

    # -----------------------------------------------------------------
    # 1) SHITSUKE — Japanese rhythm parenting. Quiet rituals, social
    # harmony, parent-as-mirror.
    # -----------------------------------------------------------------
    "shitsuke": {
        "id": "shitsuke",
        "name": "Japanese Shitsuke",
        "subtitle": "rhythm, ritual, and the quiet bow",
        "plain": "raising through example, not instruction",
        "scope": (
            "Best when the home has been loud, transitions have been "
            "rough, or the parent feels they have been correcting more "
            "than connecting. Shitsuke is not discipline — it is the "
            "soft architecture of a day."
        ),
        "attribution": (
            "Drawing on the Japanese practices of Shitsuke (gentle "
            "shaping through ritual), Itadakimasu (gratitude before "
            "meals), and Amae (the welcome of healthy dependence). "
            "Used here only as inspiration — never as a rulebook."
        ),
        "prompt_anchor": (
            "Active lens for this reply: SHITSUKE. Speak in the calm "
            "register of Japanese rhythm parenting. You MAY, at most "
            "once, mention one Japanese term — always followed by its "
            "plain meaning (e.g. 'itadakimasu — a small word said "
            "before eating, a quiet bow to the food'). Never imply "
            "Western parenting is wrong. Offer one small ritual, not "
            "a method. Never use shame language."
        ),
        "situations": {
            "bedtime": {
                "insight": (
                    "In the Shitsuke rhythm, bedtime is not a battle — "
                    "it is a slow descent. The same three small acts "
                    "in the same order each night become a stronger "
                    "boundary than any rule."
                ),
                "practice": (
                    "tonight, choose three tiny acts (a warm cloth, a "
                    "candle blown out together, one whispered line) "
                    "and let them happen in the same order — no "
                    "negotiation, no speed."
                ),
                "permission": "you do not have to make tonight perfect to begin a rhythm.",
            },
            "mealtime": {
                "insight": (
                    "Itadakimasu — the small word said before a meal — "
                    "is not about politeness. It is a single breath "
                    "that turns food into company. Even a tired family "
                    "can offer that one breath."
                ),
                "practice": (
                    "before the next meal, take one breath together "
                    "with the child. No grace, no speech. Just the "
                    "breath, then eat."
                ),
                "permission": "what the child eats matters less than the breath at the start.",
            },
            "big_emotions": {
                "insight": (
                    "Shitsuke holds the storm without trying to stop "
                    "it. The parent's quiet body is the room the child "
                    "is borrowing for a few minutes — that is enough."
                ),
                "practice": (
                    "sit lower than the child — kneel or sit on the "
                    "floor. Slow your own breath visibly. Say less, "
                    "stay longer."
                ),
                "permission": "you do not have to fix the storm. you are the room.",
            },
            "screen_time": {
                "insight": (
                    "In Japanese homes the transition off a screen is "
                    "often softened by a small parallel act — folding "
                    "a cloth, watering a plant, walking to a window. "
                    "The body needs a bridge, not a cliff."
                ),
                "practice": (
                    "before turning off the screen, offer one tiny "
                    "parallel act ('come, we'll close the curtains "
                    "together'). The screen ends inside the new act, "
                    "not before it."
                ),
                "permission": "transitions are allowed to take three minutes, not three seconds.",
            },
            "sibling": {
                "insight": (
                    "Shitsuke does not assign blame between siblings — "
                    "it offers the same calming ritual to both, even "
                    "the 'guilty' one. The repair is the room, not "
                    "the verdict."
                ),
                "practice": (
                    "kneel between them. Place one hand on each "
                    "back. Say nothing for ten seconds. Then ask each "
                    "one in turn: 'what did your body feel?'"
                ),
                "permission": "you do not have to find out who started it.",
            },
            "separation": {
                "insight": (
                    "Amae — the welcome of healthy dependence — says "
                    "that needing the parent is not weakness. The "
                    "Shitsuke goodbye is honest, slow, and the same "
                    "shape every time."
                ),
                "practice": (
                    "build a tiny goodbye ritual — a wave from a "
                    "specific window, a hand on the heart, a short "
                    "phrase. Use the SAME ritual every time you leave."
                ),
                "permission": "the child's tears at goodbye are not a sign you are doing this wrong.",
            },
            "school_stress": {
                "insight": (
                    "Shitsuke trusts the child's body to know when it "
                    "is overloaded. The parent's job is not to "
                    "explain — it is to lower the lights, soften the "
                    "voice, lengthen the meal."
                ),
                "practice": (
                    "for one evening, ban homework talk during meals. "
                    "Replace it with one small question: 'what was the "
                    "warmest part of today?'"
                ),
                "permission": "you do not have to know what is going wrong at school tonight.",
            },
            "connection": {
                "insight": (
                    "The Japanese phrase 'iitte irasshai / okaerinasai' "
                    "— 'go and come back / welcome home' — is a daily "
                    "thread woven through the door. Connection is not "
                    "a long conversation. It is a small ceremony at "
                    "each crossing."
                ),
                "practice": (
                    "for one week, say the same warm sentence at the "
                    "door every time the child leaves and returns. "
                    "Whatever your version is, keep it the same."
                ),
                "permission": "small repeated warmth carries further than long talks.",
            },
        },
    },

    # -----------------------------------------------------------------
    # 2) MONTESSORI — developmental autonomy, prepared environment,
    # respect for the child's pace.
    # -----------------------------------------------------------------
    "montessori": {
        "id": "montessori",
        "name": "Montessori & Developmental",
        "subtitle": "the prepared environment",
        "plain": "the child is allowed to be the doer",
        "scope": (
            "Best when the parent finds themselves doing too much for "
            "the child, or when the home feels mismatched with the "
            "child's growing reach. Montessori asks: what one shelf, "
            "one chair, one tray can change everything tonight?"
        ),
        "attribution": (
            "Drawing softly on Maria Montessori's prepared-environment "
            "principle and Rudolf Steiner's rhythm-of-childhood ideas, "
            "alongside modern developmental observation. Used as "
            "quiet invitations, never as method-of-record."
        ),
        "prompt_anchor": (
            "Active lens for this reply: MONTESSORI / DEVELOPMENTAL. "
            "Speak in the warm register of 'an invitation, not a "
            "method'. You MAY name one small environmental shift the "
            "parent could try — one shelf, one tray, one chair, one "
            "morning ritual. Never imply the child is behind. Never "
            "prescribe. Frame everything as 'a possibility for the "
            "next few days', not a rule."
        ),
        "situations": {
            "bedtime": {
                "insight": (
                    "Children who choose two pyjamas instead of being "
                    "handed one fall asleep with more dignity. "
                    "Autonomy at the threshold of sleep is half the "
                    "ritual."
                ),
                "practice": (
                    "place two folded pyjama sets on a low shelf "
                    "tonight. Let the child pick. Say nothing about "
                    "the choice."
                ),
                "permission": "you do not have to manage the choice. you only set the shelf.",
            },
            "mealtime": {
                "insight": (
                    "In a Montessori kitchen, a small jug of water "
                    "the child can pour themselves does more than ten "
                    "reminders to drink. The environment teaches."
                ),
                "practice": (
                    "for this week, put one small jug of water and "
                    "one small cup at the child's height. Let them "
                    "pour. Spills are research."
                ),
                "permission": "wet floors are a small price for a child who learns to serve themselves.",
            },
            "big_emotions": {
                "insight": (
                    "Developmental science describes the prefrontal "
                    "cortex as 'last to arrive'. The child is not "
                    "choosing the storm — the part of the brain that "
                    "could choose has not finished building yet."
                ),
                "practice": (
                    "lower yourself to the child's eye level. Offer "
                    "two short sentences: 'I am here. I will wait.' "
                    "Then wait."
                ),
                "permission": "this is brain biology, not bad parenting.",
            },
            "screen_time": {
                "insight": (
                    "Montessori would notice: the strongest "
                    "alternative to a screen is not 'no screen' — it "
                    "is a beautiful, accessible, ready activity at "
                    "the child's eye level."
                ),
                "practice": (
                    "set out one small tray (clay, a puzzle, water "
                    "and a sponge) on a low surface BEFORE the screen "
                    "ends. The transition becomes a discovery."
                ),
                "permission": "you do not have to ban the screen. you only set the tray.",
            },
            "sibling": {
                "insight": (
                    "Siblings often fight not because they are "
                    "incompatible but because the shared space has no "
                    "neutral object between them. A small mat, a "
                    "round table, a shared bowl can resolve more than "
                    "any lecture."
                ),
                "practice": (
                    "for one week, give each child one small mat for "
                    "their own work. Anything on the mat is theirs. "
                    "Anything off is shared."
                ),
                "permission": "boundaries between siblings can be drawn in cloth, not in voice.",
            },
            "separation": {
                "insight": (
                    "A child who has helped pack the bag is half-way "
                    "out the door already. Participation is the best "
                    "antidote to separation distress."
                ),
                "practice": (
                    "the night before, let the child place one item "
                    "they choose into the day-bag. In the morning, "
                    "name it together: 'here is the thing you packed.'"
                ),
                "permission": "the bag is a small ambassador the child sends ahead.",
            },
            "school_stress": {
                "insight": (
                    "Maria Montessori observed that the child does "
                    "not want praise for effort — they want a witness "
                    "to it. Witnessing is quieter and more durable "
                    "than evaluation."
                ),
                "practice": (
                    "tonight, replace 'good job' with one specific "
                    "observation: 'I noticed you tried this part three "
                    "times.' Then say nothing else."
                ),
                "permission": "you do not have to praise. you only have to notice.",
            },
            "connection": {
                "insight": (
                    "Developmental connection is built in the seams of "
                    "the day, not in the events. A small predictable "
                    "moment of full attention is worth more than an "
                    "outing."
                ),
                "practice": (
                    "choose one daily seam (waking, the doorway, the "
                    "last light). For ten seconds, give the child "
                    "your whole face. No phone. No question. Just the "
                    "face."
                ),
                "permission": "ten seconds of full attention is a real meal.",
            },
        },
    },

    # -----------------------------------------------------------------
    # 3) POSITIVE CODING — language that programmes a kinder inner
    # narrator. Sentence-level swaps, never lectures.
    # -----------------------------------------------------------------
    "positive_coding": {
        "id": "positive_coding",
        "name": "Positive Coding",
        "subtitle": "the sentence becomes the script",
        "plain": "rewriting the everyday lines we hand to children",
        "scope": (
            "Best when the parent notices the same heavy sentence "
            "leaving their mouth on repeat ('don't run', 'stop "
            "crying', 'you never listen'). Children absorb the script "
            "wholesale — Positive Coding offers one lighter sentence "
            "to swap in."
        ),
        "attribution": (
            "Drawing on positive psychology, affirmation research, and "
            "the founder's intuition that what we say to a child "
            "becomes the voice they say to themselves at thirty. Used "
            "as quiet sentence-swaps, never moral instruction."
        ),
        "prompt_anchor": (
            "Active lens for this reply: POSITIVE CODING. Speak as a "
            "gentle linguistic mirror. You MAY offer ONE short "
            "sentence the parent could say to the child (or to "
            "themselves) that replaces the heavy phrasing with a "
            "lighter one. Format: 'instead of \"X\", you could try "
            "\"Y\"'. Never lecture. Never imply the parent's old "
            "sentence was wrong — it was simply heavier than it "
            "needed to be."
        ),
        "situations": {
            "bedtime": {
                "insight": (
                    "'It is time for bed' lands as a command. "
                    "'Your body is asking for the dark' lands as a "
                    "translation. The body trusts the second sentence "
                    "more."
                ),
                "practice": (
                    "tonight, try: 'your body is asking for the dark.' "
                    "Notice what the child's body does after that "
                    "sentence."
                ),
                "permission": "the child can refuse the sentence and still receive the warmth in it.",
            },
            "mealtime": {
                "insight": (
                    "'You have to finish your plate' programmes guilt. "
                    "'Your belly knows when it is enough' programmes "
                    "self-trust. Same dinner, different inner script."
                ),
                "practice": (
                    "next meal, replace any 'you have to' with 'your "
                    "body knows…'. See what the body answers."
                ),
                "permission": "the body is allowed to know.",
            },
            "big_emotions": {
                "insight": (
                    "'Stop crying' translates inside the child as "
                    "'feelings are not welcome'. 'I see you are full' "
                    "translates as 'you are not too much'. Both "
                    "sentences last decades."
                ),
                "practice": (
                    "next storm, try one sentence: 'I see you are "
                    "full. I am here.' Then wait. Repeat the same "
                    "sentence if needed."
                ),
                "permission": "you do not have to fix the feeling. you only have to name it as welcome.",
            },
            "screen_time": {
                "insight": (
                    "'Get off the iPad' creates an enemy. 'In two "
                    "minutes we'll close the iPad together' creates a "
                    "partner. The second sentence makes the transition "
                    "shared."
                ),
                "practice": (
                    "give a two-minute warning out loud. Then close "
                    "the device WITH the child, hand-to-hand on the "
                    "button."
                ),
                "permission": "you and the child can close the screen as a team, not as opponents.",
            },
            "sibling": {
                "insight": (
                    "'Be nice to your sister' is a verdict. 'You can "
                    "be angry AND careful' is a possibility. The "
                    "second sentence does not collapse the feeling."
                ),
                "practice": (
                    "next conflict, try: 'you can be angry and still "
                    "careful with her body.' Say it once, then step "
                    "back."
                ),
                "permission": "anger is allowed. hurt is not. the sentence holds both.",
            },
            "separation": {
                "insight": (
                    "'Don't cry, you'll be fine' tells the child "
                    "their tears are inconvenient. 'I'll miss you "
                    "too, and I'll come back' tells them the missing "
                    "is mutual and safe."
                ),
                "practice": (
                    "before the next goodbye, try: 'I will miss you "
                    "too. I will come back.' Then leave on time — the "
                    "sentence does the work."
                ),
                "permission": "missing each other is part of loving each other.",
            },
            "school_stress": {
                "insight": (
                    "'You'd better study harder' programmes shame. "
                    "'Your brain is allowed to find this hard' "
                    "programmes patience. Both sentences become the "
                    "inner voice."
                ),
                "practice": (
                    "next time the child looks stuck, try: 'your "
                    "brain is allowed to find this hard. I'm here.' "
                    "Then sit nearby — do not solve."
                ),
                "permission": "the child does not have to be quick to be capable.",
            },
            "connection": {
                "insight": (
                    "Three sentences carry further than any speech: "
                    "'I see you', 'I am proud you are mine', 'I am "
                    "still here'. Said often, said quietly, they "
                    "become a permanent inner room."
                ),
                "practice": (
                    "choose one of those three sentences. Say it once "
                    "this evening. Say the SAME ONE tomorrow. Notice "
                    "what changes over a week."
                ),
                "permission": "small repeated words build the room the child will live in.",
            },
        },
    },
}


# ----------------------------------------------------------------------
# Public helpers (same shape as body_lenses)
# ----------------------------------------------------------------------

def list_lenses() -> List[dict]:
    """Sanitized list of lens metadata + situation maps for the
    frontend. Intuitive carries an empty `situations` dict by design."""
    out: List[dict] = []
    for lens_id, lens in LENSES.items():
        out.append({
            "id": lens["id"],
            "name": lens["name"],
            "subtitle": lens["subtitle"],
            "plain": lens["plain"],
            "scope": lens["scope"],
            "attribution": lens["attribution"],
            "situations": lens["situations"],
        })
    return out


def get_lens(lens_id: Optional[str]) -> Optional[dict]:
    if not lens_id:
        return None
    return LENSES.get(lens_id.strip().lower()) if isinstance(lens_id, str) else None


def lens_prompt_anchor(lens_id: Optional[str]) -> Optional[str]:
    lens = get_lens(lens_id)
    return lens.get("prompt_anchor") if lens else None
