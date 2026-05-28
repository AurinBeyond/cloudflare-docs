"""
body_lenses.py — Body Room Multi-Lens registry (Stage 2.9d).

Three wisdom lenses the wanderer can opt into. Each lens carries:
  - `id`, `name`, `subtitle`, `plain`, `scope`, `attribution`
  - `prompt_anchor`: the system-prompt fragment injected when this lens
    is the active perspective. Always paired with AGOP pacing + the
    wellness-language lock that lives in `body_room_ai.py`.
  - `regions`: a dict mapping the 8 Body Room hotspot ids to one calm
    insight + one breath/practice + one permission line.

Wellness-language lock (enforced here AND audited by `clarity_safety`):
  - No "diagnose", "cure", "heal", "treat", "therapy", "disorder",
    "patient", "psychiatric" claims.
  - Sanskrit / Chinese terms are always paired with a plain meaning.
  - Named teachers (Luule Viilma, Louise Hay, Stephen Porges, Peter
    Levine) are referenced as public sources, never as authorities the
    wanderer must obey. Each insight is *a possibility*, never a verdict.
  - The cancer-disappearance kind of anecdote is OUT OF SCOPE. Nothing
    promises an outcome. The room is a hand at the edge, not a cure.
"""
from __future__ import annotations

from typing import Dict, List, Optional


# 8 hotspot ids that match `/api/body-room/hotspots` (see server.py).
REGION_IDS = (
    "crown", "throat", "heart", "solar_plexus",
    "belly", "hips", "hands", "feet",
)


LENSES: Dict[str, dict] = {
    # -----------------------------------------------------------------
    # 0) INTUITIVE FLOW — the default. The mentor reads the wanderer's
    # words and shifts register invisibly. No method is named aloud.
    # -----------------------------------------------------------------
    "intuitive": {
        "id": "intuitive",
        "name": "Intuitive Flow",
        "subtitle": "the mentor adapts to you",
        "plain": "the room reads your words and chooses",
        "scope": (
            "The default. If you do not pick a lens, the mentor listens "
            "to the texture of your words and quietly adapts — sometimes "
            "regulating the nervous system, sometimes offering a "
            "forgiveness sentence, sometimes a breath. You will never "
            "be told which lens is in use."
        ),
        "attribution": (
            "A quiet synthesis of all three schools — Eastern, "
            "Psychosomatic Mirror, and Somatic Science — used the way "
            "an experienced companion uses them: invisibly."
        ),
        "prompt_anchor": (
            "Active lens for this reply: INTUITIVE FLOW (default). Read "
            "the wanderer's last line carefully and choose the most "
            "appropriate register WITHOUT naming it aloud. You MUST NOT "
            "say 'I am using Luule Viilma's method' or 'this is somatic "
            "experiencing' or 'in Ayurveda we…'. The wisdom must arrive "
            "as if it were yours.\n\n"
            "Context-driven priority (apply silently):\n"
            "- If the wanderer's words carry high stress, alarm, "
            "racing-heart, frozen-ness, shock, or 'I can't breathe' "
            "language → prioritise the SOMATIC SCIENCE register: short "
            "regulating breaths, orienting practices, ground/exhale "
            "cues. Never name the method.\n"
            "- If the wanderer's words carry guilt, anger, blame, "
            "withheld words, an old grudge, a relationship knot → "
            "prioritise the PSYCHOSOMATIC MIRROR register: a single "
            "soft forgiveness sentence the wanderer may say silently "
            "to themselves, no instruction.\n"
            "- If the wanderer's words carry fatigue, foggy heaviness, "
            "energetic stuckness, a sense of blockage, or vague body "
            "tiredness → prioritise the EASTERN register: one breath "
            "(Sanskrit term + plain meaning), one permission.\n\n"
            "You MAY micro-mix: begin with a single regulating breath, "
            "then offer one quiet permission. Never more than two "
            "elements in a single reply. The room stays calm.\n\n"
            "If the wanderer asks 'what method are you using?' — answer "
            "honestly that this room draws on Eastern breath traditions, "
            "psychosomatic mirror work (Luule Viilma, Louise Hay), and "
            "nervous-system aware practice, used together. Then return "
            "to the body."
        ),
        # Intuitive lens has no per-region static text — the AI reads
        # context and chooses. The frontend modal renders a calm
        # placeholder instead of insight/practice/permission.
        "regions": {},
    },

    # -----------------------------------------------------------------
    # 1) EASTERN LENS — Ayurveda + classical Chinese medicine + yogic
    # prāṇāyāma. Energetic register: doṣas, meridians, breath.
    # -----------------------------------------------------------------
    "eastern": {
        "id": "eastern",
        "name": "Eastern Lens",
        "subtitle": "the wind, the fire, the earth",
        "plain": "ancient body-and-breath traditions",
        "scope": (
            "Best when something feels energetic but vague — a heaviness, "
            "a buzzing, a chill, a heat that does not have a clear story yet."
        ),
        "attribution": (
            "Drawing softly on Ayurveda (vāta, pitta, kapha), "
            "classical Chinese medicine (meridians, qi), and yogic prāṇāyāma."
        ),
        "prompt_anchor": (
            "Active lens for this reply: EASTERN. Speak from the quiet "
            "ancestry of Ayurveda and classical Chinese medicine. You MAY, "
            "at most once, mention one Sanskrit or Chinese term — always "
            "followed by its plain meaning (e.g. 'sītalī, a cooling breath "
            "through pursed lips'). Never imply a doṣa diagnosis. Never "
            "claim a meridian is blocked. Offer one small breath or "
            "permission, not a prescription."
        ),
        "regions": {
            "crown": {
                "insight": (
                    "The crown is where vāta — the wind of movement — "
                    "tends to gather. Too many thoughts, not enough sky."
                ),
                "practice": (
                    "anuloma-viloma — a slow alternate-nostril breath, "
                    "like settling sand in a glass."
                ),
                "permission": "you do not have to hold the whole sky tonight.",
            },
            "throat": {
                "insight": (
                    "The throat is the doorway between thought and word. "
                    "Vāta gathers here when something has been swallowed "
                    "for too long."
                ),
                "practice": (
                    "brāhmarī — a soft humming exhale; let the throat "
                    "vibrate, not strain."
                ),
                "permission": "what you have not said is allowed to wait.",
            },
            "heart": {
                "insight": (
                    "The heart space holds kapha — water and earth. "
                    "When it feels heavy, the room asks for slowness, "
                    "not for an answer."
                ),
                "practice": (
                    "ujjāyī — an even ocean-breath through the nose, "
                    "very slow on the exhale."
                ),
                "permission": "the heart is allowed to be soft here.",
            },
            "solar_plexus": {
                "insight": (
                    "The solar plexus is pitta country — fire and "
                    "judgement. A tight stomach is often a flame asked "
                    "to defend something for too long."
                ),
                "practice": (
                    "sītalī — a cooling breath drawn through pursed lips, "
                    "like sipping cool air."
                ),
                "permission": "you do not have to defend yourself tonight.",
            },
            "belly": {
                "insight": (
                    "The lower belly is where the body keeps its quiet "
                    "fires and its safest hiding places. In Chinese "
                    "tradition this is the dāntián — the field below "
                    "the navel where rest begins."
                ),
                "practice": (
                    "three slow rounds of sītalī (cooling breath), or "
                    "a hand placed on the belly with a long exhale."
                ),
                "permission": "the belly does not have to fix anything.",
            },
            "hips": {
                "insight": (
                    "The hips carry kapha — the earth-weight of what we "
                    "have not yet put down. The lower back will say the "
                    "loudest when the load has grown old."
                ),
                "practice": (
                    "a slow diaphragmatic breath — let the lower back "
                    "rest into the chair, the floor, the bed."
                ),
                "permission": "what you carry below the waist may settle in its own time.",
            },
            "hands": {
                "insight": (
                    "The hands are vāta — air. They hold by habit, even "
                    "when there is nothing left to hold."
                ),
                "practice": (
                    "soften the palms; three breaths where the exhale "
                    "is longer than the inhale."
                ),
                "permission": "the hands do not have to hold or fix anyone tonight.",
            },
            "feet": {
                "insight": (
                    "The feet are kapha — earth itself. When the head "
                    "is busy, the feet are usually forgotten."
                ),
                "practice": (
                    "three slow breaths down into the soles, as if "
                    "rooting; or warm socks."
                ),
                "permission": "the ground is here. you can lean on it.",
            },
        },
    },

    # -----------------------------------------------------------------
    # 2) PSYCHOSOMATIC MIRROR — Luule Viilma + Louise Hay register.
    # Body regions as mirrors of unspoken emotion. Releases happen via
    # forgiveness and naming, NEVER via guarantee.
    # -----------------------------------------------------------------
    "psychosomatic": {
        "id": "psychosomatic",
        "name": "Psychosomatic Mirror",
        "subtitle": "the body as a quiet messenger",
        "plain": "the body remembers what the mouth has not said",
        "scope": (
            "Best when the tension has a clear emotional root — an old "
            "fear, a held grudge, a guilt that did not belong to you in "
            "the first place."
        ),
        "attribution": (
            "Drawing softly on Luule Viilma's body-and-forgiveness work "
            "and Louise Hay's mirror tables, used as quiet possibilities — "
            "never as verdicts."
        ),
        "prompt_anchor": (
            "Active lens for this reply: PSYCHOSOMATIC MIRROR. Speak in "
            "the gentle register of Luule Viilma and Louise Hay. You "
            "MAY, at most once, name a possible emotional root for the "
            "tension — always as a possibility, never a diagnosis. Open "
            "with softening phrases like 'Luule Viilma's work suggests "
            "this region may carry…' or 'one quiet possibility is…'. "
            "If the wanderer is willing, offer one short forgiveness or "
            "release sentence they can say silently to themselves. "
            "Never promise anything will leave. Never claim a 'cause'. "
            "The body decides when it is ready."
        ),
        "regions": {
            "crown": {
                "insight": (
                    "Luule Viilma's work suggests the head can carry the "
                    "weight of being-right — old stress about decisions, "
                    "about being seen as competent."
                ),
                "practice": (
                    "a quiet sentence, said silently inward: "
                    "\"I forgive the part of me that thought it had to "
                    "decide for everyone. I let that weight down.\""
                ),
                "permission": "you are allowed to not know, tonight.",
            },
            "throat": {
                "insight": (
                    "In this register the throat often carries unsaid "
                    "words — anger swallowed, love withheld, a sentence "
                    "that did not come out in time."
                ),
                "practice": (
                    "say silently: \"I forgive myself for the words I "
                    "did not say. I forgive the others for the words "
                    "they did not hear.\""
                ),
                "permission": "your voice is allowed to be quiet first, then loud.",
            },
            "heart": {
                "insight": (
                    "The chest is the mirror of love withheld — from "
                    "ourselves, from someone we could not reach. Louise "
                    "Hay called it the room where bitterness keeps "
                    "house."
                ),
                "practice": (
                    "a hand on the chest; one slow sentence: "
                    "\"I forgive everyone, including myself. I let the "
                    "old grief soften.\""
                ),
                "permission": "the heart is allowed to be a beginner at love again.",
            },
            "solar_plexus": {
                "insight": (
                    "Luule Viilma's mirror often points the solar plexus "
                    "at fear — fear of not being good enough, fear of "
                    "being judged."
                ),
                "practice": (
                    "say silently: \"I forgive the fear that I am not "
                    "enough. I see it, and I let it leave through the "
                    "breath.\""
                ),
                "permission": "the fear is allowed to be there — and to be released.",
            },
            "belly": {
                "insight": (
                    "The lower belly often holds inherited shame — "
                    "things said about the body in childhood, things "
                    "the family did not have words for."
                ),
                "practice": (
                    "a hand on the belly; one sentence: \"I forgive what "
                    "was said. I forgive what was not said. The body is "
                    "mine, gently mine.\""
                ),
                "permission": "what was placed here without your consent is allowed to leave.",
            },
            "hips": {
                "insight": (
                    "Louise Hay's mirror reads the hips as the carrier "
                    "of forward motion — fear of moving on, of leaving "
                    "an old chapter, of saying yes to the next one."
                ),
                "practice": (
                    "say silently: \"I forgive the part of me that was "
                    "afraid to move. I let the hips know that the next "
                    "step is allowed.\""
                ),
                "permission": "you do not have to know the destination to take one slow step.",
            },
            "hands": {
                "insight": (
                    "The hands often mirror the wish to hold someone — "
                    "or the long ache of having held too much, for too "
                    "long."
                ),
                "practice": (
                    "open the palms upward; say silently: \"I forgive "
                    "myself for holding. I forgive them for not "
                    "holding back. I lay it down.\""
                ),
                "permission": "the hands are allowed to be empty for a moment.",
            },
            "feet": {
                "insight": (
                    "Luule Viilma's work links the feet to belonging — "
                    "to whether we feel allowed to stand on our own "
                    "ground."
                ),
                "practice": (
                    "feel the floor; say silently: \"I forgive what "
                    "made me feel unwelcome. I am allowed to stand "
                    "here.\""
                ),
                "permission": "the ground does not need your permission to hold you.",
            },
        },
    },

    # -----------------------------------------------------------------
    # 3) SOMATIC SCIENCE — polyvagal theory (Porges) + somatic
    # experiencing (Levine). Nervous-system register: regulation,
    # orienting, completion. No clinical claim.
    # -----------------------------------------------------------------
    "somatic_science": {
        "id": "somatic_science",
        "name": "Somatic Science",
        "subtitle": "the nervous system, listened to",
        "plain": "modern body-mind science, gently used",
        "scope": (
            "Best when the body is in alert mode — racing heart, shallow "
            "breath, a sense of frozen-ness, or coming down from a "
            "stressful day. Pure regulation, no story needed."
        ),
        "attribution": (
            "Drawing softly on Stephen Porges' polyvagal theory and "
            "Peter Levine's somatic experiencing — used here only as "
            "calm orientation, not as clinical care."
        ),
        "prompt_anchor": (
            "Active lens for this reply: SOMATIC SCIENCE. Speak in the "
            "calm register of nervous-system regulation. You MAY, at "
            "most once, mention the polyvagal idea of 'down-regulation' "
            "or Peter Levine's 'orienting' as plain ideas — never as "
            "a clinical claim. Offer one micro-practice: lengthening "
            "the exhale, orienting the eyes around the room, naming "
            "three things the senses can perceive right now. Never "
            "use the words 'trauma', 'PTSD', 'disorder', 'panic "
            "attack', 'anxiety disorder'. Stay in plain sensation."
        ),
        "regions": {
            "crown": {
                "insight": (
                    "When thinking races, the nervous system is in a "
                    "kind of upward gear. Stephen Porges' work calls "
                    "this a sympathetic state — not bad, just busy."
                ),
                "practice": (
                    "let the eyes orient slowly around the room. Three "
                    "soft glances at three different objects."
                ),
                "permission": "the mind is allowed to slow without being told to stop.",
            },
            "throat": {
                "insight": (
                    "The throat tightens when the body is preparing to "
                    "speak or to defend. Even noticing it begins to "
                    "soften it — that is co-regulation with yourself."
                ),
                "practice": (
                    "a long, sighing exhale through an open mouth. "
                    "Three of them, no hurry."
                ),
                "permission": "your throat is allowed to rest before it speaks.",
            },
            "heart": {
                "insight": (
                    "A fast chest is the body asking for safety, not "
                    "for an argument. Porges' nervous-system aware "
                    "practice sees the exhale as the safety switch."
                ),
                "practice": (
                    "lengthen the exhale until it is longer than the "
                    "inhale. Five rounds is plenty."
                ),
                "permission": "the heart is allowed to find its own slower beat.",
            },
            "solar_plexus": {
                "insight": (
                    "A clenched stomach is the body preparing for "
                    "impact. Peter Levine called it 'incomplete "
                    "discharge' — something the body is still holding."
                ),
                "practice": (
                    "place a warm hand on the solar plexus. Notice the "
                    "weight of the hand for three breaths."
                ),
                "permission": "the body is allowed to discharge in its own time.",
            },
            "belly": {
                "insight": (
                    "The belly is the home of the vagus nerve's slow "
                    "branch — what Porges named the ventral vagal "
                    "complex, the body's social safety system."
                ),
                "practice": (
                    "breathe so the belly visibly rises before the "
                    "chest does. Five slow rounds."
                ),
                "permission": "the belly is allowed to be the first to soften.",
            },
            "hips": {
                "insight": (
                    "Tight hips often hold a 'freeze' pattern — the "
                    "body decided, long ago, that staying still was "
                    "safer than moving. Notice without judgment."
                ),
                "practice": (
                    "a small, slow sway side to side in the chair. "
                    "Two minutes is enough."
                ),
                "permission": "movement is allowed to be very small.",
            },
            "hands": {
                "insight": (
                    "Hands that won't unclench are often guarding the "
                    "midline. Peter Levine called this an unfinished "
                    "protective gesture."
                ),
                "practice": (
                    "press the palms together gently, then slowly "
                    "release. Repeat three times, noticing the change."
                ),
                "permission": "the hands are allowed to finish what they began.",
            },
            "feet": {
                "insight": (
                    "When the feet are forgotten, the nervous system "
                    "often has no anchor. Levine's orienting practice "
                    "starts here — at the ground."
                ),
                "practice": (
                    "press the soles into the floor; notice the "
                    "pressure for three breaths. Then release."
                ),
                "permission": "you are allowed to feel held by the floor.",
            },
        },
    },

    # -----------------------------------------------------------------
    # 4) CHARACTER ARMOR — Wilhelm Reich (muscular armor) + Gabor Maté
    # (when the body says no). The body's chronic holding patterns as
    # the architecture of unspoken refusals. No "fix", no "cure" —
    # only the patient un-locking of structures that have been doing
    # their job for years.
    # -----------------------------------------------------------------
    "character_armor": {
        "id": "character_armor",
        "name": "Character Armor",
        "subtitle": "the body's chronic holding, listened to",
        "plain": "what the body has been holding so the mind didn't have to",
        "scope": (
            "Best when the tension is old, structural, and stubborn — "
            "the jaw that has been locked for a decade, the lower back "
            "that flares whenever you cannot say no, the chest that "
            "tightens before you even know what is wrong."
        ),
        "attribution": (
            "Drawing softly on Wilhelm Reich's character-armor work "
            "and Gabor Maté's writing on the body's protest — used "
            "as quiet possibilities, never as verdicts."
        ),
        "prompt_anchor": (
            "Active lens for this reply: CHARACTER ARMOR. Speak in the "
            "patient register of Wilhelm Reich and Gabor Maté. You MAY, "
            "at most once, name the idea of a 'character armor ring' "
            "or 'the body's quiet no' as a possibility, never a "
            "diagnosis. Reich described seven rings of chronic holding "
            "(eyes, mouth, neck, chest, diaphragm, abdomen, pelvis); "
            "you may mention which ring the wanderer's description "
            "seems closest to. Maté observed that chronic illness "
            "often appears in those who could not say no — you may "
            "gently reflect that idea, never as accusation. Offer one "
            "small, structural release: a longer exhale, an unclenching, "
            "a small movement that completes a gesture the body began "
            "long ago. Never use the words 'trauma', 'PTSD', 'cure', "
            "'heal'."
        ),
        "regions": {
            "crown": {
                "insight": (
                    "Reich placed the first armor ring around the eyes "
                    "and forehead — the place we tighten when we have "
                    "decided not to see what we are seeing."
                ),
                "practice": (
                    "soften the muscles between the brows; let the "
                    "eyelids become heavy without closing. Three slow "
                    "breaths. The forehead does not need to think."
                ),
                "permission": "you are allowed to see, and to look away.",
            },
            "throat": {
                "insight": (
                    "Reich's third ring lives in the jaw and throat — "
                    "the chronic clamp of words that were rehearsed and "
                    "swallowed. Gabor Maté noticed that this ring often "
                    "belongs to those who learned, very young, that "
                    "no was unsafe."
                ),
                "practice": (
                    "let the jaw fall open by one finger's width. "
                    "Exhale slowly through the open mouth. Two rounds. "
                    "Nothing has to be said — only allowed."
                ),
                "permission": "your no is allowed to live in the body, even if it does not yet leave it.",
            },
            "heart": {
                "insight": (
                    "Reich's fourth ring is the chest — the armor we "
                    "build around the heart so it does not have to ask "
                    "for what it once asked for and did not receive."
                ),
                "practice": (
                    "place both hands flat on the upper chest. Three "
                    "long exhales, longer than the inhales. Feel the "
                    "hands rise and fall without forcing."
                ),
                "permission": "the chest is allowed to stay closed today, and to soften tomorrow.",
            },
            "solar_plexus": {
                "insight": (
                    "Reich's fifth ring crosses the diaphragm. Maté "
                    "describes this as the body's 'incomplete breath' "
                    "— the place where chronic vigilance hides as a "
                    "subtle, unbroken brace."
                ),
                "practice": (
                    "a soft hum on the exhale, low and unhurried, for "
                    "one long round. The diaphragm releases when it "
                    "is allowed to make a sound."
                ),
                "permission": "the breath is allowed to be a small wave instead of a held wall.",
            },
            "belly": {
                "insight": (
                    "Reich's sixth ring is the abdominal wall — the "
                    "armor of the chronically self-reliant, the people "
                    "who learned to brace because no one came when "
                    "they were small."
                ),
                "practice": (
                    "lie back if you can; place a warm hand on the "
                    "belly. Let the belly rise as if asking the hand "
                    "for permission. Five rounds, no count."
                ),
                "permission": "the belly is allowed to be soft, even in a hard world.",
            },
            "hips": {
                "insight": (
                    "Reich's seventh and deepest ring lives in the "
                    "pelvis — the structural seat of fight, flight, "
                    "and the long held 'freeze'. Often the last to "
                    "speak, and the most honest when it does."
                ),
                "practice": (
                    "a small slow rocking of the pelvis, forward and "
                    "back, the way a child rocks themselves. Two "
                    "minutes is plenty. No music, no count."
                ),
                "permission": "the pelvis is allowed to remember motion at its own pace.",
            },
            "hands": {
                "insight": (
                    "Hands that cannot unclench are often holding a "
                    "gesture Reich would have called 'unfinished' — a "
                    "reach that was not met, a push that was not "
                    "allowed, a strike that had nowhere safe to land."
                ),
                "practice": (
                    "slowly open the fingers, one at a time, like "
                    "unfolding a paper map. When the palms are open, "
                    "let them rest upward on your thighs. Two breaths."
                ),
                "permission": "the hands are allowed to finish, in slow motion, what they could not finish then.",
            },
            "feet": {
                "insight": (
                    "Gabor Maté observed that those who have spent a "
                    "lifetime carrying others often forget the simple "
                    "structural fact that the floor is doing its "
                    "share. The feet are the body's first contract "
                    "with the earth."
                ),
                "practice": (
                    "stand, or sit with the feet flat. Press the soles "
                    "down for one inhale. Release on the exhale. "
                    "Repeat three times — the floor is the partner."
                ),
                "permission": "you are allowed to be held by something that is not made of effort.",
            },
        },
    },
}


# ----------------------------------------------------------------------
# Public helpers
# ----------------------------------------------------------------------

def list_lenses() -> List[dict]:
    """Sanitized list of lens metadata + region maps for the frontend."""
    out: List[dict] = []
    for lens_id, lens in LENSES.items():
        out.append({
            "id": lens["id"],
            "name": lens["name"],
            "subtitle": lens["subtitle"],
            "plain": lens["plain"],
            "scope": lens["scope"],
            "attribution": lens["attribution"],
            "regions": lens["regions"],
        })
    return out


def get_lens(lens_id: Optional[str]) -> Optional[dict]:
    if not lens_id:
        return None
    return LENSES.get(lens_id.strip().lower()) if isinstance(lens_id, str) else None


def lens_prompt_anchor(lens_id: Optional[str]) -> Optional[str]:
    """Return the system-prompt fragment for the named lens, or None."""
    lens = get_lens(lens_id)
    if not lens:
        return None
    return lens.get("prompt_anchor")
