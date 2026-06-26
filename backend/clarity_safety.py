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
    # ---- §Phase 0 House lock (2026-02-13). The mentor must never
    # tell a wanderer they are in the wrong room, offer them an exit,
    # break the spell with AI-assistant language, or argue.
    (re.compile(r"\b(?:you(?:'re|\s+are)|that(?:'s|\s+is))\s+in\s+the\s+wrong\s+room\b", re.IGNORECASE),
     "I am here with you"),
    (re.compile(r"\bwrong\s+room\b", re.IGNORECASE), "this room"),
    (re.compile(r"\bbelongs?\s+(?:in|to)\s+(?:a|another|the\s+other)\s+room\b", re.IGNORECASE),
     "is welcome here"),
    (re.compile(r"\bas\s+an?\s+(?:AI|A\.I\.|artificial\s+intelligence|language\s+model|assistant)\b", re.IGNORECASE),
     "as a quiet presence"),
    (re.compile(r"\bI\s+am\s+(?:just\s+)?an?\s+(?:AI|A\.I\.|language\s+model|chatbot|assistant)\b", re.IGNORECASE),
     "I am here with you"),
    (re.compile(r"\bI(?:'d|\s+would)\s+be\s+happy\s+to\b", re.IGNORECASE), "I can"),
    (re.compile(r"\bis\s+there\s+anything\s+else\s+I\s+can\s+help\s+(?:you\s+)?with\??", re.IGNORECASE),
     "I am here when you want to keep going."),
    (re.compile(r"\blet\s+me\s+clarify\b", re.IGNORECASE), "let me listen again"),
    (re.compile(r"\byou\s+can\s+(?:leave|exit)\s+(?:any\s*time|whenever)\b", re.IGNORECASE),
     "I am here as long as you stay"),
    (re.compile(r"\bthis\s+room\s+may\s+not\s+be\s+for\s+you\b", re.IGNORECASE),
     "I am here with you"),
    # ---- Estonian forms — explicitly forbidden by founder directive
    # 2026-02-12. The word "ravim" and its family are clinical in
    # Estonian; we replace with the wellness vocabulary the founder
    # asked for (vabastamine, tasakaalustamine, toetamine).
    (re.compile(r"\braviefekt(?:i|id|ile|ist|iga)?\b", re.IGNORECASE), "toetav mõju"),
    (re.compile(r"\bravimtaim(?:e|ed|ede|edega|i|ele|elt)?\b", re.IGNORECASE), "tugitaim"),
    (re.compile(r"\bravimid(?:e|ele|elt|esse|ega)?\b", re.IGNORECASE), "toetused"),
    (re.compile(r"\bravim(?:i|it|ile|ist|iga|ina|iks)?\b", re.IGNORECASE), "toetus"),
    (re.compile(r"\bravimist(?:ki|gi)?\b", re.IGNORECASE), "tasakaalustamisest"),
    (re.compile(r"\bravimine(?:gi)?\b", re.IGNORECASE), "tasakaalustamine"),
    (re.compile(r"\bravimisega\b", re.IGNORECASE), "tasakaalustamisega"),
    (re.compile(r"\bravitse(?:n|d|me|te|ma|takse|tud|b|vad|nud|nuks)\b", re.IGNORECASE), "toetama"),
    (re.compile(r"\bravi(?:da|nud|s|sin|sid|sime|site|vad|b|d|ks|me|te)\b", re.IGNORECASE), "toetab"),
    (re.compile(r"\bravi(?:le|st|ga|sse|ks|na|d|de|dele|delt|desse)?\b", re.IGNORECASE), "tasakaalustamine"),
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


def _strip_numbered_list_leakage(text: str) -> str:
    """§Phase 0 House fix (2026-02-14) — strip number-token leakage.

    Claude occasionally streams sequences like ``"5. 6. 7. 8. 9. 10. Hello."``
    when it has been asked not to use numbered lists but slips into one
    anyway. The wanderer must NEVER see that. We:

      1. Collapse any run of two-or-more leading ``N.`` tokens that
         appear at the start of a sentence or message into nothing.
      2. Strip a single bare ``N.`` at the very start of the reply.
      3. Strip any inline run of three-or-more ``N.`` tokens anywhere.
    """
    if not text:
        return text
    out = text
    # 1) Leading run at start of string
    out = re.sub(r"^\s*(?:\d{1,3}\.\s+){2,}", "", out)
    # 2) Run after sentence boundary
    out = re.sub(r"([.!?\n]\s+)(?:\d{1,3}\.\s+){2,}", r"\1", out)
    # 3) Any remaining 3+ consecutive enumeration markers anywhere
    out = re.sub(r"(?:\d{1,3}\.\s+){3,}", "", out)
    # 4) Single bare "N." at the very start with no sentence content
    out = re.sub(r"^\s*\d{1,3}\.\s*(?=[A-ZÄÖÕÜ])", "", out)
    # Collapse double spaces left behind.
    out = re.sub(r" {2,}", " ", out).strip()
    return out


def sanitize_reply(text: str) -> str:
    """Run the AGOP-D filter. Always returns wellness-safe text.

    Layer 0 strips numbered-list / enumeration leakage from the model.
    Layer 1 rewrites known clinical words/phrases grammar-aware.
    Layer 2 substitutes the whole reply if any banned token survives.
    Idempotent: applying twice is safe.
    """
    if not text:
        return text
    out = _strip_numbered_list_leakage(text)
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
    # Layer 3: §Stage 3.3 — Wisdom Weaver tonality filter. Softens
    # dry-blog / hedging-academic patterns and collapses bullet-list
    # listicles into prose. Conservative; most replies untouched.
    try:
        from tonality_filter import soften
        out = soften(out)
    except Exception:  # noqa: BLE001
        pass
    return out


_AUDIT_WORDS = (
    "therapy", "therapist", "diagnosis", "diagnose", "treatment", "ptsd",
    "trauma", "panic disorder", "phobia", "depression", "anxiety disorder",
    "patient", "clinical", "mental health",
    # Estonian forms — founder directive 2026-02-12
    "ravim", "ravimi", "ravimid", "ravimine", "ravimisega",
    "raviefekt", "ravimtaim", "ravitseb", "ravitsema", "ravitsen",
)


def audit_clinical_drift(original: str) -> List[str]:
    """Return list of clinical hits in `original` (for monitoring/log)."""
    if not original:
        return []
    low = original.lower()
    return sorted({w for w in _AUDIT_WORDS if w in low})
