"""
tonality_filter.py — the "Wisdom Weaver" guard.

A surgical post-filter for AI replies. Detects dry-blog / Wikipedia /
clinical-academic prose patterns that break the PureSoul mood and
either softens them in place OR (when too far gone) substitutes a
calm fallback line.

Runs AFTER `clarity_safety.sanitize_reply` (which handles the
medical-word lock) and BEFORE the reply leaves the backend. Loud,
explicit, and easy to extend with new patterns when new failure modes
appear.

The filter is conservative by design — most replies pass through
unchanged. It only fires when a clear "blog" signal is detected:
  - bullet-point listicles (more than 2 bullet lines)
  - heading-shaped lines ending with a colon followed by an
    enumeration ("Here are three things…")
  - hedging professional voice ("research shows that…",
    "studies have demonstrated…", "experts agree…")
  - long paragraphs that begin with "Generally," / "Typically," /
    "In conclusion," (essay tells)
"""
from __future__ import annotations

import re
from typing import Tuple, List


# Phrase rewrites — case-insensitive, word-boundary anchored.
# Each pair is (compiled regex, replacement). Replacements stay in
# wellness-language (no "should", "must", "always"); they invite, not
# instruct.
_SOFTENERS: List[Tuple[re.Pattern, str]] = [
    (re.compile(r"\b(research|studies)\s+(?:show(?:s|ed)?|demonstrate(?:s|d)?|suggest(?:s|ed)?)\s+that\b", re.I),
     "many people find that"),
    (re.compile(r"\bexperts?\s+(?:agree|recommend|suggest|say)\b", re.I),
     "many quiet observers notice"),
    (re.compile(r"\bit\s+is\s+(?:well[- ]known|important|essential|crucial|necessary)\s+(?:that|to)\b", re.I),
     "it can be helpful to"),
    (re.compile(r"\byou\s+should\b", re.I),
     "you might"),
    (re.compile(r"\byou\s+must\b", re.I),
     "you may want to"),
    (re.compile(r"\byou\s+need\s+to\b", re.I),
     "you might gently"),
    (re.compile(r"\bin\s+conclusion\b[,.]?", re.I),
     "as a quiet close,"),
    (re.compile(r"\bto\s+summari[sz]e\b[,.]?", re.I),
     "the simple of it is,"),
    (re.compile(r"\bgenerally\s+speaking\b[,.]?", re.I),
     "often,"),
    (re.compile(r"\btypically[,]?\s+", re.I),
     "often, "),
    (re.compile(r"\bfurthermore[,]?\s+", re.I),
     "and "),
    (re.compile(r"\bmoreover[,]?\s+", re.I),
     "and "),
    (re.compile(r"\badditionally[,]?\s+", re.I),
     "also, "),
    (re.compile(r"\bin\s+order\s+to\b", re.I),
     "to"),
]


# Pattern detectors — for telemetry / audit, not rewrites.
_BULLET_LINE = re.compile(r"^\s*(?:[-*•]|\d+[.)])\s+", re.M)
_HEADING_LIKE = re.compile(r"^\s*[A-Z][A-Za-z ]{2,60}:\s*$", re.M)


# A calm fallback line used ONLY when the reply is detected as
# heavily listicle-shaped (3+ bullet lines) and the wanderer would
# clearly benefit from a soft re-anchor rather than a cleaned-up list.
_FALLBACK = (
    "I want to slow down here. There is no list for this. "
    "Tell me one small thing your body is noticing right now, and "
    "we will sit with that."
)


def _count_bullet_lines(text: str) -> int:
    return len(_BULLET_LINE.findall(text or ""))


def _strip_bullets(text: str) -> str:
    """Convert markdown-style bullets to soft prose. Used when the
    bullet count is small (1-2) — we keep the content but flatten the
    visual rhythm."""
    if not text:
        return text
    lines = text.split("\n")
    out: List[str] = []
    for line in lines:
        m = _BULLET_LINE.match(line)
        if m:
            stripped = line[m.end():].rstrip()
            if stripped:
                out.append(stripped)
        else:
            out.append(line)
    return "\n".join(out)


def soften(text: str) -> str:
    """Main entry point. Returns a softened version of `text`.

    Behaviour:
      - phrase-level rewrites are always applied
      - if 1-2 bullet lines: bullets are flattened to prose
      - if 3+ bullet lines AND the text has a clear listicle shape:
        return the calm fallback instead of a half-fixed list
      - otherwise: return the phrase-rewritten text
    """
    if not text or not isinstance(text, str):
        return text

    # Phrase rewrites
    out = text
    for pat, repl in _SOFTENERS:
        out = pat.sub(repl, out)

    bullets = _count_bullet_lines(out)
    if bullets >= 3:
        # Heavily listicle — re-anchor the wanderer
        return _FALLBACK
    if bullets >= 1:
        out = _strip_bullets(out)

    return out


def audit(text: str) -> List[str]:
    """Return a list of dry-blog signals detected in the raw text.
    Used for logging / telemetry. Does not mutate. Empty list = clean."""
    flags: List[str] = []
    if not text:
        return flags
    if _count_bullet_lines(text) >= 3:
        flags.append("bullet_listicle")
    if _HEADING_LIKE.search(text):
        flags.append("heading_like_line")
    for pat, _ in _SOFTENERS:
        if pat.search(text):
            flags.append(pat.pattern[:40])
    return flags
