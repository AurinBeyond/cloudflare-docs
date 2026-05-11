"""
clarity_safety.py — Wellness-only language filter (AGOP-D safety net).

Two-layer defence:

  Layer 1: targeted word/phrase substitutions that preserve grammar.
           Only the most legally-risky words are rewritten.

  Layer 2: nuclear-option scan. After Layer 1, if ANY remaining word
           from a hard-banned set is still present, the entire reply
           is replaced by a safe canned response that redirects to a
           licensed practitioner. We never ship clinical vocabulary.
"""
from __future__ import annotations

import re
from typing import List, Tuple

# ---- Layer 1: targeted, grammar-preserving substitutions --------------
# Each entry maps a clinical word/phrase to a replacement that slots
# into most sentence positions without breaking grammar.
_LAYER_1: List[Tuple[re.Pattern, str]] = [
    # Diagnostic disorder names (specific phrases first)
    (re.compile(r"\bpanic\s+disorder\b", re.IGNORECASE), "an alarm pattern"),
    (re.compile(r"\bpanic\s+attacks?\b", re.IGNORECASE), "an alarm wave"),
    (re.compile(r"\banxiety\s+disorder\b", re.IGNORECASE), "an alert pattern"),
    (re.compile(r"\bgeneralized\s+anxiety\b", re.IGNORECASE), "ongoing unease"),
    (re.compile(r"\bpost[\s-]?traumatic[\s-]?stress\s+disorder\b", re.IGNORECASE), "a pattern carried from the past"),
    (re.compile(r"\bpost[\s-]?traumatic[\s-]?stress\b", re.IGNORECASE), "a pattern carried from the past"),
    (re.compile(r"\bPTSD\b"), "a pattern carried from the past"),
    (re.compile(r"\bOCD\b"), "a tight repeating loop"),
    (re.compile(r"\bbipolar(?:\s+disorder)?\b", re.IGNORECASE), "shifting inner weather"),
    (re.compile(r"\bclinical\s+depression\b", re.IGNORECASE), "a deep heavy season"),
    (re.compile(r"\bmajor\s+depressive(?:\s+disorder)?\b", re.IGNORECASE), "a deep heavy season"),
    (re.compile(r"\bdepression\b", re.IGNORECASE), "a heavy season"),
    (re.compile(r"\bdepressive\b", re.IGNORECASE), "low and slowed"),
    (re.compile(r"\bphobias?\b", re.IGNORECASE), "an old block"),
    (re.compile(r"\bdissociation\b", re.IGNORECASE), "stepping outside the body"),
    # Trauma family — replaced cleanly; "trauma" maps to a phrase fragment
    (re.compile(r"\btrauma[\s-]?informed\b", re.IGNORECASE), "body-aware"),
    (re.compile(r"\btraumas\b", re.IGNORECASE), "heavy patterns"),
    (re.compile(r"\btraumatized\b", re.IGNORECASE), "carrying a heavy pattern"),
    (re.compile(r"\btraumatic\b", re.IGNORECASE), "very heavy"),
    (re.compile(r"\btrauma\b", re.IGNORECASE), "a heavy pattern"),
    # Clinical modalities and branded approaches
    (re.compile(r"\bsomatic\s+experiencing\b", re.IGNORECASE), "body-aware practice"),
    (re.compile(r"\bpolyvagal(\s+theory)?\b", re.IGNORECASE), "nervous-system aware practice"),
    (re.compile(r"\battachment\s+theory\b", re.IGNORECASE), "early-bond patterns"),
    # Clinical roles (preserve indefinite article handling)
    (re.compile(r"\b(an?\s+)?psychiatrists?\b", re.IGNORECASE), "a licensed practitioner"),
    (re.compile(r"\b(an?\s+)?psychologists?\b", re.IGNORECASE), "a licensed practitioner"),
    (re.compile(r"\b(an?\s+)?psychotherapists?\b", re.IGNORECASE), "a licensed practitioner"),
    (re.compile(r"\b(an?\s+)?therapists?\b", re.IGNORECASE), "a licensed practitioner"),
    (re.compile(r"\b(an?\s+)?mental\s+health\s+professionals?\b", re.IGNORECASE), "a licensed practitioner"),
    (re.compile(r"\bmental\s+health\b", re.IGNORECASE), "inner wellbeing"),
    (re.compile(r"\bpsychotherapy\b", re.IGNORECASE), "professional support"),
    (re.compile(r"\btherapy\b", re.IGNORECASE), "professional support"),
    (re.compile(r"\btherapeutic\b", re.IGNORECASE), "supportive"),
    (re.compile(r"\bclinical\s+support\b", re.IGNORECASE), "professional support"),
    (re.compile(r"\bclinically\b", re.IGNORECASE), "professionally"),
    (re.compile(r"\bclinical\b", re.IGNORECASE), "professional"),
    (re.compile(r"\bpatients?\b", re.IGNORECASE), "people"),
    # Treatments — handle grammar carefully
    (re.compile(r"\btreatment\s+plans?\b", re.IGNORECASE), "a plan with a licensed practitioner"),
    (re.compile(r"\btreatments?\b", re.IGNORECASE), "professional support"),
    (re.compile(r"\btreating\b", re.IGNORECASE), "supporting"),
    (re.compile(r"\btreated\b", re.IGNORECASE), "supported"),
    (re.compile(r"\bto\s+treat\b", re.IGNORECASE), "to support"),
    (re.compile(r"\bcures?\b", re.IGNORECASE), "settling"),
    (re.compile(r"\bcured\b", re.IGNORECASE), "settled"),
    (re.compile(r"\bcuring\b", re.IGNORECASE), "settling"),
    (re.compile(r"\bhealing\b", re.IGNORECASE), "settling"),
    (re.compile(r"\bhealed\b", re.IGNORECASE), "settled"),
    (re.compile(r"\bheals\b", re.IGNORECASE), "settles"),
    (re.compile(r"\bheal\b", re.IGNORECASE), "settle"),
    (re.compile(r"\bmedications?\b", re.IGNORECASE), "anything a licensed practitioner has given you"),
    (re.compile(r"\bprescriptions?\b", re.IGNORECASE), "anything a licensed practitioner has written"),
    # Diagnostic acts (preserve gerund/past forms)
    (re.compile(r"\bdiagnoses\b", re.IGNORECASE), "namings"),
    (re.compile(r"\bdiagnosis\b", re.IGNORECASE), "a naming"),
    (re.compile(r"\bdiagnosed\b", re.IGNORECASE), "named"),
    (re.compile(r"\bto\s+diagnose\b", re.IGNORECASE), "to name"),
    (re.compile(r"\bcannot\s+diagnose\b", re.IGNORECASE), "cannot name what this is"),
    (re.compile(r"\bdiagnose\b", re.IGNORECASE), "name"),
    (re.compile(r"\bdiagnostic\b", re.IGNORECASE), "naming"),
    # Disorders & illness vocabulary
    (re.compile(r"\bdisorders?\b", re.IGNORECASE), "pattern"),
    (re.compile(r"\bdiseases?\b", re.IGNORECASE), "imbalance"),
    (re.compile(r"\bpathology\b", re.IGNORECASE), "imbalance"),
    (re.compile(r"\bpathological\b", re.IGNORECASE), "very strong"),
    (re.compile(r"\bsyndromes?\b", re.IGNORECASE), "pattern"),
    (re.compile(r"\bmental\s+illness\b", re.IGNORECASE), "inner difficulty"),
    (re.compile(r"\billnesses\b", re.IGNORECASE), "imbalances"),
    (re.compile(r"\billness\b", re.IGNORECASE), "imbalance"),
    # Interventions
    (re.compile(r"\binterventions?\b", re.IGNORECASE), "practices"),
    (re.compile(r"\bprotocols?\b", re.IGNORECASE), "practices"),
    (re.compile(r"\bdysfunctions?\b", re.IGNORECASE), "imbalance"),
]


# ---- Layer 2: hard-banned tokens that NEVER ship to the wanderer ------
# If any of these survives layer 1, we replace the entire reply.
_HARD_BANNED = re.compile(
    r"\b("
    r"therapy|therapist|therapists|therapeutic|"
    r"psychotherapy|psychotherapist|psychologist|psychologists|psychiatrist|psychiatrists|"
    r"treatment|treatments|cure|cures|cured|heal|healing|healed|"
    r"diagnosis|diagnose|diagnosed|diagnoses|diagnostic|"
    r"disorder|disorders|disease|diseases|pathology|pathological|syndrome|syndromes|"
    r"patient|patients|prescription|prescriptions|medication|medications|"
    r"ptsd|panic\s+disorder|panic\s+attack|panic\s+attacks|"
    r"phobia|phobias|depression|depressive|anxiety\s+disorder|"
    r"clinical|clinically|"
    r"mental\s+health\s+professional|mental\s+health\s+professionals|"
    r"trauma|traumatic|traumatized|traumas|trauma-informed|"
    r"dissociation|polyvagal|somatic\s+experiencing|attachment\s+theory|"
    r"intervention|interventions|protocol|protocols|dysfunction|dysfunctions"
    r")\b",
    re.IGNORECASE,
)

# Safe canned reply used when layer 2 fires. Calm, non-clinical, redirects.
_SAFE_FALLBACK = (
    "I hear you. What you are carrying is real, and the words for it "
    "are bigger than the room I am. For a naming, please reach a "
    "licensed practitioner. For tonight, I can stay with the felt "
    "sense in your body — where does it sit right now?"
)


def sanitize_reply(text: str) -> str:
    """Run the AGOP-D filter. Always returns wellness-safe text.

    Layer 1 rewrites known clinical words/phrases grammar-aware.
    Layer 2 substitutes the whole reply if any banned token survives.
    Idempotent: applying twice is safe.
    """
    if not text:
        return text
    out = text
    for pattern, replacement in _LAYER_1:
        out = pattern.sub(replacement, out)
    # Collapse article collisions: "a a", "an an", "a an old", "an a quiet"
    out = re.sub(r"\b(a|an)\s+a\s+", "a ", out, flags=re.IGNORECASE)
    out = re.sub(r"\ba\s+an\s+", "an ", out, flags=re.IGNORECASE)
    out = re.sub(r"\ban\s+a\s+", "a ", out, flags=re.IGNORECASE)
    out = re.sub(r"\b(a|an)\s+\1\b", r"\1", out, flags=re.IGNORECASE)
    # Strip stray article when a previous adjective already supplied one:
    #   "a body-aware a licensed practitioner" -> "a body-aware licensed practitioner"
    out = re.sub(r"\b(a|an)\s+([a-z-]+)\s+(a|an)\s+", r"\1 \2 ", out, flags=re.IGNORECASE)
    out = re.sub(r" {2,}", " ", out)
    # Fix "a" → "an" before vowel-starting nouns (and vice versa) only
    # for our known replacement phrases.
    out = re.sub(r"\ba (alarm|alert|old|imbalance|inner)\b", r"an \1", out)
    out = re.sub(r"\ban ([bcdfghjklmnpqrstvwxz])", r"a \1", out, flags=re.IGNORECASE)
    # Re-capitalise sentence-start lowercase article that came from a
    # mid-sentence replacement landing at the start.
    out = re.sub(r"(^|[.!?]\s+)(a|an)\b", lambda m: m.group(1) + m.group(2).capitalize(), out)
    # Layer 2: hard ban.
    if _HARD_BANNED.search(out):
        return _SAFE_FALLBACK
    return out


_AUDIT_WORDS = (
    "therapy", "therapist", "diagnosis", "diagnose", "treatment", "ptsd",
    "trauma", "panic disorder", "phobia", "depression", "anxiety disorder",
    "patient", "clinical", "mental health",
)


def audit_clinical_drift(original: str) -> List[str]:
    """Return list of clinical hits in `original` (for monitoring/log)."""
    if not original:
        return []
    low = original.lower()
    return sorted({w for w in _AUDIT_WORDS if w in low})
