"""
test_phase1_voice_status_lock.py — §Phase 1 follow-up regression
guard (2026-02-14).

Iter 69 / 70 / 71 each had to remove the same banned soft-voice
state labels ("A small pause.", "Listening, unhurried.", "Speaking
softly.") from three near-identical voice-status JSX blocks
(ClarityRelease, BodyRoomChat, ParentsRoomChat). The pattern
re-emerged each iteration because the code was copy-pasted.

Iter 71 introduced `<VoiceStatusRow>` as the single source of truth.
This test fails CI the moment any banned label is reintroduced
ANYWHERE in `/app/frontend/src/` outside the documented exceptions.

It is a fast, file-system-only check — no React, no DOM, no
playwright. Runs in milliseconds.
"""
from __future__ import annotations

import re
from pathlib import Path

FRONTEND_SRC = Path("/app/frontend/src")

# Banned exact strings (with trailing period — these are state
# *labels*, not contemplative content). Each pattern is the EXACT
# string the wanderer would see; subtleties like a lowercase first
# letter or no trailing period are NOT banned.
BANNED_STATE_LABELS: list[str] = [
    "A small pause.",
    "Listening, unhurried.",
    "Speaking softly.",
    "Listening.",   # iter 69 removed from RealtimeCompanion
    "Speaking.",    # iter 69 removed from RealtimeCompanion + ClarityRelease
]

# Allow-listed occurrences. These have been audited by the founder
# and are intentional contemplative copy, NOT voice-status labels:
#   - TheBeginningStep.jsx eyebrow ("A small pause" — no period,
#     used as a slow-reflection heading, not a state indicator)
ALLOWED_OCCURRENCES: dict[str, list[str]] = {
    # File paths are relative to FRONTEND_SRC.
}


def _strip_js_comments(text: str) -> str:
    """Remove JS line and block comments so banned-string scans only
    see actual code. Documentation comments may legitimately mention
    the banned strings as examples of what NOT to emit."""
    # Block comments /* ... */
    text = re.sub(r"/\*.*?\*/", "", text, flags=re.DOTALL)
    # Line comments // ... — only strip if not inside a string. A
    # heuristic strip is enough for our use-case (the banned labels
    # are unique tokens unlikely to appear inside other strings).
    text = re.sub(r"//[^\n]*", "", text)
    return text


def _scan_for(pattern: str) -> list[tuple[str, int, str]]:
    """Return all (relative_path, line_no, line_content) hits for
    an exact-substring search across frontend source files. Skips
    auto-generated dirs and JS comment regions (so docstrings that
    describe the banned strings as cautionary examples do not
    trigger the guard)."""
    hits: list[tuple[str, int, str]] = []
    skip_dir_parts = {"node_modules", "build", "dist", "__pycache__"}
    for path in FRONTEND_SRC.rglob("*"):
        if not path.is_file():
            continue
        if any(part in skip_dir_parts for part in path.parts):
            continue
        if path.suffix not in {".js", ".jsx", ".ts", ".tsx"}:
            continue
        try:
            raw = path.read_text(encoding="utf-8")
        except (UnicodeDecodeError, OSError):
            continue
        stripped = _strip_js_comments(raw)
        if pattern not in stripped:
            continue
        rel = str(path.relative_to(FRONTEND_SRC))
        # Walk the stripped text by line so line numbers match the
        # stripped view (close enough — comments removed in-place).
        for line_no, line in enumerate(stripped.splitlines(), start=1):
            if pattern in line:
                hits.append((rel, line_no, line.strip()))
    return hits


def test_no_banned_state_labels_in_frontend():
    """Lock: no banned voice-status state label may appear in
    /app/frontend/src/. Single source of truth lives in
    VoiceStatusRow.jsx, which is also scanned — but those occurrences
    map to documented operational labels only ('Microphone paused.',
    'Hearing the words.'), so they will NOT match the banned list."""
    failures: list[str] = []
    for label in BANNED_STATE_LABELS:
        hits = _scan_for(label)
        # Strip allow-listed occurrences.
        filtered: list[tuple[str, int, str]] = []
        for rel, ln, content in hits:
            allowed_lines = ALLOWED_OCCURRENCES.get(rel, [])
            if any(allowed in content for allowed in allowed_lines):
                continue
            filtered.append((rel, ln, content))
        if filtered:
            failures.append(
                f"\n  Banned label {label!r} reappeared in:\n"
                + "\n".join(f"    {rel}:{ln}  →  {content}" for rel, ln, content in filtered)
            )
    assert not failures, (
        "Phase 1 House lock violated — banned voice-status state "
        "labels found in frontend source. Route them through "
        "<VoiceStatusRow> instead, which centralises permitted phrasing."
        + "".join(failures)
    )


def test_voice_status_row_is_the_single_source_of_truth():
    """The three chat surfaces (ClarityRelease, BodyRoomChat,
    ParentsRoomChat) must import <VoiceStatusRow>. If any of them
    starts rendering voice-status JSX inline again, this assertion
    fails — preventing the iter 69/70/71 regression pattern."""
    required_consumers = [
        "pages/ClarityRelease.jsx",
        "components/BodyRoomChat.jsx",
        "components/ParentsRoomChat.jsx",
    ]
    missing: list[str] = []
    for rel in required_consumers:
        path = FRONTEND_SRC / rel
        text = path.read_text(encoding="utf-8")
        if "VoiceStatusRow" not in text:
            missing.append(rel)
    assert not missing, (
        f"<VoiceStatusRow> not imported in: {', '.join(missing)}. "
        "These chat surfaces must use the shared component to keep "
        "the voice-status phrasing locked."
    )


def test_voice_status_row_only_emits_allowed_labels():
    """Source-level pin: the only string literals VoiceStatusRow may
    emit as the status `label` are 'Microphone paused.' and
    'Hearing the words.'. A simple regex over the file body locks
    the ternary shape."""
    path = FRONTEND_SRC / "components/VoiceStatusRow.jsx"
    raw = path.read_text(encoding="utf-8")
    text = _strip_js_comments(raw)
    # The component must contain these two allowed labels.
    assert '"Microphone paused."' in text, (
        "VoiceStatusRow lost the 'Microphone paused.' operational "
        "label — wanderers will not know the mic is off."
    )
    assert '"Hearing the words."' in text, (
        "VoiceStatusRow lost the 'Hearing the words.' STT-in-flight "
        "label — the room will feel broken during transcription."
    )
    # And must NOT contain any of the banned labels (covered by the
    # broad scan above, but pinned here for fast feedback). Comments
    # already stripped, so doc-strings describing banned labels do
    # not trigger this assertion.
    for banned in BANNED_STATE_LABELS:
        assert f'"{banned}"' not in text, (
            f"VoiceStatusRow reintroduced banned label {banned!r}. "
            "This is exactly the regression iter 69/70/71 fought."
        )
