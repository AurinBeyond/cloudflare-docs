"""
parents_lenses.py — Parents' Room Multi-Lens registry (Stage 3.3).

Seven parenting wisdom lenses. The first four are surfaced to the
parent as opt-in cards (mirroring body_lenses.py). The remaining
three are *hidden wisdom sources* — Sara reads from them silently
when the parent's situation calls for it, but they are never
rendered as menu items in the UI.

  Visible (opt-in cards):
    - intuitive        · the default · the room reads + chooses silently
    - shitsuke         · Japanese Ikuji (Shitsuke + Itadakimasu + Amae
                         + Ganbaru + Omoiyari + Soji)
    - montessori       · Montessori + developmental biology
    - positive_coding  · Positive psychology + affirmation language

  Hidden (behind-the-scenes wisdom for Sara only):
    - scandinavian     · Nordic free play, friluftsliv, lagom, hygge
    - french_cadre     · the French frame · le cadre · "non veut dire non"
    - reggio_emilia    · the child as competent researcher · 100 languages
    - waldorf          · Steiner / Waldorf rhythm · fantasy · natural materials

Visibility is governed by the `visible` flag on each lens entry.
`list_lenses()` returns only visible lenses (the four named above);
`get_lens()` resolves any lens id (visible or hidden) so Sara can
still anchor a reply on a hidden lens when the Intuitive Flow
selects it silently.

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
        "name": "Japanese Ikuji",
        "subtitle": "rhythm, ritual, care, the quiet bow",
        "plain": "raising through example, not instruction",
        "visible": True,
        "scope": (
            "Best when the home has been loud, transitions have been "
            "rough, or the parent feels they have been correcting more "
            "than connecting. Ikuji — the broader Japanese art of "
            "raising — is not discipline. It is the soft architecture "
            "of a day, built from small rituals, shared chores, and "
            "the welcome of healthy dependence."
        ),
        "attribution": (
            "Drawing on the Japanese practices of Shitsuke (gentle "
            "shaping through ritual), Itadakimasu (gratitude before "
            "meals), Amae (the welcome of healthy dependence), "
            "Ganbaru (steady, kind perseverance — not grit), "
            "Omoiyari (sensing what another may feel before they "
            "say it), and Soji (the daily ritual of caring for "
            "shared space — sweeping, wiping, setting right). "
            "Used here only as inspiration — never as a rulebook."
        ),
        "prompt_anchor": (
            "Active lens for this reply: JAPANESE IKUJI (Shitsuke "
            "family). Speak in the calm register of Japanese rhythm "
            "parenting. You MAY, at most once, mention one Japanese "
            "term — always followed by its plain meaning in the same "
            "sentence (e.g. 'itadakimasu — a small word said before "
            "eating, a quiet bow to the food'; 'omoiyari — sensing "
            "what another feels before they say it'; 'soji — the "
            "small daily act of caring for shared space'; 'ganbaru "
            "— a steady, kind kind of perseverance, not grit'; "
            "'amae — the welcome of healthy dependence'). Never "
            "imply Western parenting is wrong. Offer one small "
            "ritual, not a method. Never use shame language."
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

    # -----------------------------------------------------------------
    # 4) SCANDINAVIAN FREE PLAY  (HIDDEN · Nordic friluftsliv · lagom · hygge)
    # Sara reads silently from this lens when the family feels indoor-bound,
    # over-managed, or out of touch with weather and slow time.
    # -----------------------------------------------------------------
    "scandinavian": {
        "id": "scandinavian",
        "name": "Scandinavian Free Play",
        "subtitle": "friluftsliv · lagom · hygge — slow, outdoor, enough",
        "plain": "letting weather, time, and unstructured space be the teacher",
        "visible": False,
        "scope": (
            "Best when the home has become a sequence of supervised "
            "activities, when weather is treated as an obstacle, or "
            "when the parent is exhausted from over-providing. The "
            "Scandinavian register trusts boredom, mud, low light, "
            "and ordinary days as forms of nourishment."
        ),
        "attribution": (
            "Drawing on Nordic family culture — friluftsliv (open-air "
            "living), lagom (just enough, never too much), hygge "
            "(small cosy belonging), and the Scandinavian trust in "
            "self-directed outdoor play in any weather. Used as "
            "quiet permission, never as a school of parenting."
        ),
        "prompt_anchor": (
            "Active lens for this reply: SCANDINAVIAN FREE PLAY (hidden). "
            "Speak as if from a kitchen window watching a child play "
            "outside in light rain. Offer one quiet permission — to "
            "go outside, to do less, to leave the schedule alone, to "
            "let boredom soften into a discovery. You MAY name one "
            "Nordic word (friluftsliv, lagom, hygge) at most once, "
            "always followed by its plain meaning. Never lecture. "
            "Never moralise about screens or modern life."
        ),
        "situations": {
            "bedtime": {
                "insight": (
                    "A child who has been outside in fresh air falls "
                    "asleep with a heavier, kinder body. The day's "
                    "movement does more than any sleep-routine app."
                ),
                "practice": (
                    "before tomorrow's bedtime, give the child fifteen "
                    "unsupervised minutes outdoors — in any weather. "
                    "No instructions. No play prompts. Just outside."
                ),
                "permission": "you do not have to organise the evening. weather can do part of the work.",
            },
            "mealtime": {
                "insight": (
                    "Lagom — just enough — quietly asks: is this plate, "
                    "this drink, this portion the right size for this "
                    "child, this evening? Not too much, not too little. "
                    "Just lagom."
                ),
                "practice": (
                    "tonight, serve smaller portions and let the child "
                    "ask for more if they want it. Trust their belly "
                    "to know when lagom has been reached."
                ),
                "permission": "you do not have to fill the plate. the child knows the size of their own hunger.",
            },
            "big_emotions": {
                "insight": (
                    "The Scandinavian instinct in a storm is to move "
                    "the body to a window or a door. Outside air, "
                    "lower light, or simply a different room often "
                    "regulates faster than any conversation."
                ),
                "practice": (
                    "next storm, open a window or step onto the "
                    "balcony together. Don't speak about the feeling "
                    "yet. Let the cool air do the first half of the work."
                ),
                "permission": "fresh air is allowed to be a co-regulator.",
            },
            "screen_time": {
                "insight": (
                    "Nordic children do not have less screen time "
                    "because of rules. They have less screen time "
                    "because outside is consistently more interesting. "
                    "The competition is the open door, not the lecture."
                ),
                "practice": (
                    "for one week, put outdoor shoes by the door at "
                    "child-height. Do not mention screens. See whether "
                    "the door becomes louder than the iPad on its own."
                ),
                "permission": "you do not have to police the screen. you only have to make the door easier.",
            },
            "sibling": {
                "insight": (
                    "Two siblings indoors will argue. The same two "
                    "siblings in a forest, on a beach, or in a wide "
                    "park will, more often than not, find a parallel "
                    "game. Space dissolves what supervision sharpens."
                ),
                "practice": (
                    "next sibling friction, do not mediate first. "
                    "Move them both outside if at all possible. Wait "
                    "ten minutes before saying anything."
                ),
                "permission": "you do not have to be the referee. the outdoors arbitrates differently than you do.",
            },
            "separation": {
                "insight": (
                    "Hygge — the small cosy belonging — softens the "
                    "edges of separation. A familiar small object, a "
                    "candle lit at home that they know is burning for "
                    "them, a hygge cue carried in the pocket."
                ),
                "practice": (
                    "give the child a small smooth stone or wooden "
                    "bead from home. Tell them it knows the way back. "
                    "No further instructions."
                ),
                "permission": "small objects can carry whole homes inside them.",
            },
            "school_stress": {
                "insight": (
                    "When school becomes heavy, the Scandinavian "
                    "answer is rarely more study. It is more outside. "
                    "Friluftsliv — open-air living — restores what "
                    "indoor pressure has compressed."
                ),
                "practice": (
                    "for one weekend, ban homework and bring the "
                    "child outdoors for three short walks. No phones. "
                    "No talking-about-school. Just walking."
                ),
                "permission": "the brain rests outside in ways it cannot rest at a desk.",
            },
            "connection": {
                "insight": (
                    "Hygge connection is not an event. It is a low "
                    "lamp, a thick blanket, a slow drink, two people "
                    "sharing the same warm light without needing to "
                    "speak. Smallness is the medicine."
                ),
                "practice": (
                    "tonight, light one small lamp and turn off the "
                    "rest. Sit beside the child for ten minutes. Do "
                    "not narrate the moment. Let it be small."
                ),
                "permission": "you do not have to fill the silence. the lamp is already saying enough.",
            },
        },
    },

    # -----------------------------------------------------------------
    # 5) FRENCH CADRE  (HIDDEN · le cadre · gentle frame · "non veut dire non")
    # Sara reads silently from this lens when the home has become
    # negotiation-heavy, when the parent has lost the calm "no", or
    # when the child seems to be testing where the edges are.
    # -----------------------------------------------------------------
    "french_cadre": {
        "id": "french_cadre",
        "name": "French Cadre",
        "subtitle": "le cadre — the calm frame · grown-up time · simple no",
        "plain": "the home has a frame, and the frame is held quietly",
        "visible": False,
        "scope": (
            "Best when the home has become a constant negotiation, "
            "when the parent feels worn down by endless 'whys', or "
            "when adults have lost their own evenings to the children's "
            "demands. The French cadre offers a steady, low-volume "
            "frame: clear, calm, repeated."
        ),
        "attribution": (
            "Drawing on French family culture — le cadre (the frame), "
            "the practice of separate adult-and-child times, the "
            "simple 'non veut dire non' (no means no, said once, "
            "without argument), and the cultural permission for "
            "parents to remain adults. Used as quiet ballast, never "
            "as a discipline programme."
        ),
        "prompt_anchor": (
            "Active lens for this reply: FRENCH CADRE (hidden). Speak "
            "in the calm, low-volume register of a parent who knows "
            "the frame and does not raise their voice to hold it. "
            "You MAY mention 'le cadre' at most once, followed by its "
            "plain meaning ('the frame'). Offer one small structural "
            "permission — the parent is allowed an adult evening, a "
            "quiet 'no', a moment off-duty. Never moralise about "
            "modern parenting. Never advise harshness."
        ),
        "situations": {
            "bedtime": {
                "insight": (
                    "In a French home, bedtime is often non-negotiable "
                    "not because the parent is strict, but because the "
                    "frame is calm. The 'no more' is said once, "
                    "quietly, and held."
                ),
                "practice": (
                    "tonight, say bedtime in one short sentence. Do "
                    "not negotiate. If the child argues, repeat the "
                    "same sentence in the same tone. Do not escalate."
                ),
                "permission": "you are allowed to repeat the same calm sentence three times instead of three different ones.",
            },
            "mealtime": {
                "insight": (
                    "Le cadre at the table is a small art: the meal "
                    "is the meal, the food is the food, and the child "
                    "joins it as a small family member — not as a "
                    "diner with a menu."
                ),
                "practice": (
                    "next dinner, offer one meal. No alternatives. "
                    "Sit together for a defined time. The child may "
                    "eat or not eat — but the meal itself is held."
                ),
                "permission": "you are not a short-order cook. the table is allowed to be one shape.",
            },
            "big_emotions": {
                "insight": (
                    "Le cadre does not panic in a storm. It does not "
                    "join the storm either. It says, simply and once: "
                    "'I see you are very upset. I am here. I am not "
                    "leaving.' Then it stays steady."
                ),
                "practice": (
                    "next storm, lower your voice instead of raising "
                    "it. Speak in shorter sentences. Stay physically "
                    "in the room. Do not bargain."
                ),
                "permission": "you are allowed to be calmer than the situation seems to demand.",
            },
            "screen_time": {
                "insight": (
                    "In French homes, screens are often simply 'not "
                    "now' — said the same way three times, without "
                    "explanation. The reason is not litigated. The "
                    "frame is the reason."
                ),
                "practice": (
                    "next screen request, say 'not now' in a calm, "
                    "neutral voice. If asked why, say 'because it is "
                    "not the time for it'. Do not justify further."
                ),
                "permission": "you do not owe a five-paragraph explanation for every limit.",
            },
            "sibling": {
                "insight": (
                    "Le cadre treats sibling conflict as the children's "
                    "work, with the adult quietly nearby. The frame "
                    "trusts that children can repair if the adult does "
                    "not solve."
                ),
                "practice": (
                    "next conflict, step nearby but do not arbitrate. "
                    "Say once: 'you two will find a way. I am here if "
                    "you need me.' Then let them work it."
                ),
                "permission": "you do not have to know who started it. you only have to remain present.",
            },
            "separation": {
                "insight": (
                    "The French goodbye is brief and warm. A long "
                    "farewell reads to the child as 'something is "
                    "wrong'. A short, certain one reads as 'this is "
                    "normal, and I will return'."
                ),
                "practice": (
                    "next drop-off, say goodbye in three short steps: "
                    "kiss, sentence, leave. Do not linger. Do not "
                    "explain."
                ),
                "permission": "a brief goodbye is a gift, not a coldness.",
            },
            "school_stress": {
                "insight": (
                    "Le cadre asks the child to do their school work "
                    "because it is the child's job — not because the "
                    "parent is anxious about it. The parent stays "
                    "warm; the work stays the child's."
                ),
                "practice": (
                    "for one week, do not ask 'have you done your "
                    "homework?'. Ask instead 'how was today?' and let "
                    "the homework be in the child's hands."
                ),
                "permission": "the homework is not your homework.",
            },
            "connection": {
                "insight": (
                    "Le cadre protects adult time. Connection with the "
                    "child is deeper when the parent has also been a "
                    "person that day. A small evening of one's own "
                    "feeds the next morning's warmth."
                ),
                "practice": (
                    "after the child's bedtime tonight, claim thirty "
                    "minutes that are not for the child, the house, "
                    "or the phone. A book, a walk, a slow tea. The "
                    "house can wait."
                ),
                "permission": "you are allowed to be an adult in your own home in the evening.",
            },
        },
    },

    # -----------------------------------------------------------------
    # 6) REGGIO EMILIA  (HIDDEN · the competent child · 100 languages)
    # Sara reads silently from this lens when the parent is doing too
    # much FOR the child, when a child's questions are being closed
    # down, or when the home has lost its sense of the child as a
    # serious thinker.
    # -----------------------------------------------------------------
    "reggio_emilia": {
        "id": "reggio_emilia",
        "name": "Reggio Emilia",
        "subtitle": "the competent child · the hundred languages",
        "plain": "the child is a researcher of the world, not a beginner",
        "visible": False,
        "scope": (
            "Best when the parent is doing too much for the child, "
            "when the child's strange questions are being answered "
            "too quickly, or when the home treats the child as a "
            "small empty cup to be filled. Reggio reverses the lens: "
            "the child arrives as a full, competent researcher."
        ),
        "attribution": (
            "Drawing on the Reggio Emilia approach (post-war "
            "northern Italy) — Loris Malaguzzi's principle of the "
            "'hundred languages' (drawing, building, asking, "
            "imagining, dancing, singing) and the cultural insistence "
            "that the child is a competent person from the start. "
            "Used as a quiet reframing, never as a curriculum."
        ),
        "prompt_anchor": (
            "Active lens for this reply: REGGIO EMILIA (hidden). "
            "Speak as if the child were already a serious researcher "
            "of life — not 'someone who will one day be'. Offer one "
            "small reframe that hands a question, a tool, or a choice "
            "back to the child instead of taking it on yourself. You "
            "MAY refer to the 'hundred languages' (drawing, building, "
            "asking, singing) at most once. Never imply the child is "
            "lacking. Never prescribe."
        ),
        "situations": {
            "bedtime": {
                "insight": (
                    "A child who has been given small authorship over "
                    "the day falls asleep with less protest. Reggio "
                    "asks: which two or three decisions could the "
                    "child have made today that they did not?"
                ),
                "practice": (
                    "tonight, let the child choose the order of the "
                    "bedtime steps. Bath first or story first? Their "
                    "answer is fine either way."
                ),
                "permission": "the child can be an author of small things.",
            },
            "mealtime": {
                "insight": (
                    "In Reggio kitchens, children participate as "
                    "researchers, not eaters. They wash, they pour, "
                    "they ask 'why does that change colour?'. The "
                    "meal is a small studio."
                ),
                "practice": (
                    "for one meal this week, give the child one real "
                    "task at the counter — washing a leaf, tearing "
                    "bread, mixing a sauce. Let them be a co-cook, "
                    "not an assistant."
                ),
                "permission": "the child is allowed to make the food, not just eat it.",
            },
            "big_emotions": {
                "insight": (
                    "Reggio honours the hundred languages — and "
                    "sometimes the language of the moment is drawing, "
                    "tearing paper, building something tall, or dancing "
                    "the feeling out. Words are not the only release."
                ),
                "practice": (
                    "next storm, offer paper and crayons or a stack "
                    "of cushions to climb. Let the body or the hand "
                    "speak before the mouth."
                ),
                "permission": "feelings are allowed to come out through the hands.",
            },
            "screen_time": {
                "insight": (
                    "Reggio would notice: a child glued to a screen "
                    "is often a child whose curiosity has not been "
                    "given a serious enough question. The screen wins "
                    "by default when nothing else has been offered "
                    "with respect."
                ),
                "practice": (
                    "before the next screen, ask the child one real "
                    "question they have not heard before — 'how do "
                    "you think rain knows when to stop?'. Wait for "
                    "their actual theory."
                ),
                "permission": "you are allowed to take the child's theories seriously.",
            },
            "sibling": {
                "insight": (
                    "When siblings fight in a Reggio room, the adult "
                    "asks: what were they each trying to build that "
                    "the other interrupted? Conflict is often two "
                    "research projects colliding."
                ),
                "practice": (
                    "next conflict, ask each child in turn: 'what "
                    "were you trying to do?' Not 'who started it'. "
                    "Listen to the work, not the wrong."
                ),
                "permission": "every conflict can be a research conversation in disguise.",
            },
            "separation": {
                "insight": (
                    "A Reggio goodbye trusts the child as the one in "
                    "charge of their own crossing. The parent does "
                    "not drag, does not coax, does not perform the "
                    "leaving — they walk beside, and trust."
                ),
                "practice": (
                    "next morning drop-off, ask 'how do you want to "
                    "say goodbye today?' and follow their answer "
                    "exactly. Even if it changes every day."
                ),
                "permission": "the child knows what kind of goodbye they need today.",
            },
            "school_stress": {
                "insight": (
                    "Reggio is not afraid of difficulty. It is afraid "
                    "of difficulty without research. A hard subject "
                    "is treated as a question, not a failure: 'what "
                    "is your current theory about this?'"
                ),
                "practice": (
                    "tonight, instead of explaining the hard subject, "
                    "ask: 'what do you think is happening here?'. "
                    "Listen to the theory. Build with it, do not "
                    "correct it."
                ),
                "permission": "wrong theories are the beginning of right ones.",
            },
            "connection": {
                "insight": (
                    "Connection in Reggio is documentation — noticing "
                    "the child's process so closely that the noticing "
                    "itself becomes the love. The drawing on the "
                    "fridge is not decoration. It is a witness statement."
                ),
                "practice": (
                    "this week, save one piece of the child's work — "
                    "a scrap, a sentence, a photo — and tell them you "
                    "are keeping it because you saw what they were "
                    "doing."
                ),
                "permission": "to be deeply noticed is one of the largest forms of love.",
            },
        },
    },

    # -----------------------------------------------------------------
    # 7) WALDORF / STEINER RHYTHM  (HIDDEN · breath of the year · imagination · natural materials)
    # Sara reads silently from this lens when the family has become
    # over-stimulated, when imagination has been replaced by content,
    # or when the home has lost its yearly rhythm.
    # -----------------------------------------------------------------
    "waldorf": {
        "id": "waldorf",
        "name": "Waldorf Rhythm",
        "subtitle": "the breath of the year · imagination · natural materials",
        "plain": "the year breathes, and the home breathes with it",
        "visible": False,
        "scope": (
            "Best when the home feels over-stimulated, when the "
            "child's imagination has been replaced by content, when "
            "the year has flattened into a calendar without seasons. "
            "Waldorf restores the breath of the year — natural light, "
            "natural materials, slow imagination."
        ),
        "attribution": (
            "Drawing softly on the rhythm-of-childhood ideas in the "
            "Waldorf tradition (after Rudolf Steiner) — the breath "
            "of the year, the festival of the seasons, the love of "
            "wool, wood, beeswax, candlelight, and slow, image-rich "
            "story. Used as a quiet seasonal cue, never as method."
        ),
        "prompt_anchor": (
            "Active lens for this reply: WALDORF RHYTHM (hidden). "
            "Speak in the warm register of a slow-seasonal home — "
            "candlelight, natural materials, hand-told stories, the "
            "weather of the year. Offer one small image-rich "
            "permission (a candle lit at supper, a stone collected "
            "on a walk, a story told without a book). You MAY mention "
            "'the breath of the year' once. Never moralise about "
            "screens or plastic. Never prescribe a Waldorf school."
        ),
        "situations": {
            "bedtime": {
                "insight": (
                    "Waldorf evenings prefer image to instruction. A "
                    "small spoken story carries a child to sleep more "
                    "gently than any screen-based goodnight ever will."
                ),
                "practice": (
                    "tonight, tell a one-minute story from your own "
                    "memory — no book, no app. Begin with 'once, when "
                    "I was small…'. End on a soft image."
                ),
                "permission": "your own voice, however ordinary, is more nourishing than any narrator.",
            },
            "mealtime": {
                "insight": (
                    "Waldorf trusts that a meal lit by one candle "
                    "shifts the body of the whole table — children "
                    "and adults — toward slower eating and warmer "
                    "talk. The light is not decoration; it is a signal."
                ),
                "practice": (
                    "tonight, light one candle on the table. Eat by "
                    "its light. Do not name what you are doing."
                ),
                "permission": "the candle does the work. you do not have to.",
            },
            "big_emotions": {
                "insight": (
                    "Waldorf reads the breath of the year inside a "
                    "small child's storm: every feeling has a season, "
                    "and the storm passes the way weather passes — "
                    "not by being argued with, but by being weathered."
                ),
                "practice": (
                    "next storm, wrap the child in a wool blanket if "
                    "they will accept it. The weight and warmth often "
                    "settle the body when words cannot."
                ),
                "permission": "natural materials know things synthetic ones do not.",
            },
            "screen_time": {
                "insight": (
                    "Waldorf would not argue with the screen. It "
                    "would offer something the screen cannot: a "
                    "lump of beeswax, a bundle of yarn, a piece of "
                    "wood, the open hand. Imagination expands when "
                    "the input is small."
                ),
                "practice": (
                    "place one quiet hand-thing on the table tonight "
                    "— wool, clay, wood, a smooth stone. Do not "
                    "introduce it. Let the child find it."
                ),
                "permission": "the most powerful materials are usually the simplest.",
            },
            "sibling": {
                "insight": (
                    "In a Waldorf home, sibling friction is often "
                    "absorbed by a shared seasonal task — gathering "
                    "leaves, kneading bread, polishing a stone. The "
                    "shared rhythm dissolves the rivalry."
                ),
                "practice": (
                    "next sibling friction, give them a single "
                    "seasonal task together — sweeping the doorstep, "
                    "watering the plants, folding the wool blankets. "
                    "Walk away while they do it."
                ),
                "permission": "siblings often reconcile through work they did not ask for.",
            },
            "separation": {
                "insight": (
                    "Waldorf separations carry a small natural object "
                    "between adult and child — a shared stone, a "
                    "knotted ribbon, a piece of beeswax. The object "
                    "carries the connection across the day."
                ),
                "practice": (
                    "before the next separation, find together one "
                    "small natural thing (a leaf, a stone, an acorn). "
                    "Each carries half of it in a pocket all day."
                ),
                "permission": "natural objects can carry love that words cannot.",
            },
            "school_stress": {
                "insight": (
                    "Waldorf trusts that a tired learning-brain is "
                    "restored less by more study and more by rhythm "
                    "— a walk in the same direction at the same hour, "
                    "a candle lit at the same moment, a story told "
                    "in the same chair."
                ),
                "practice": (
                    "for one week, take a short walk at the same time "
                    "every evening with the child. No phone. No "
                    "school-talk. Just the walk."
                ),
                "permission": "the same walk every day is more nourishing than seven different ones.",
            },
            "connection": {
                "insight": (
                    "Waldorf connection is the breath of the year — "
                    "small repeated rituals at the same point of the "
                    "season. The first candle of autumn. The first "
                    "warm day of spring. A story told only at "
                    "midwinter. The child grows a calendar inside "
                    "them, and the family lives inside it."
                ),
                "practice": (
                    "choose one seasonal ritual to keep this year. "
                    "Whatever it is, do it the same way next year, "
                    "and the next. Time will become a home."
                ),
                "permission": "you are allowed to keep small things sacred just because you keep them.",
            },
        },
    },
}


# ----------------------------------------------------------------------
# Public helpers (same shape as body_lenses)
# ----------------------------------------------------------------------

def list_lenses() -> List[dict]:
    """Sanitized list of lens metadata + situation maps for the
    frontend. Returns ONLY the visible lenses (intuitive +
    shitsuke + montessori + positive_coding). Hidden lenses are
    reachable via get_lens() for Sara's silent reading, but never
    rendered as menu items in the UI."""
    out: List[dict] = []
    for lens_id, lens in LENSES.items():
        if lens.get("visible", True) is False:
            continue
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
