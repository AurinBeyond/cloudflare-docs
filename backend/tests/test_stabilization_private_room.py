"""Phase 1 STABILIZATION (2026-02-14) — Private Room body-aphorism strip.

Locks the rule that the Private Room (Clarity Release) MUST NOT
introduce body-as-knower aphorisms unprompted. These regressed twice
during prior iterations because the body_lenses "intuitive" lens was
being injected into clarity_ai's system prompt, AND because the
base Clarity prompt itself encouraged somatic register.

These tests assert:
  1. `_strip_body_aphorisms` removes each of 5 banned aphorism shapes.
  2. The strip is idempotent (running it twice changes nothing).
  3. Non-aphorism body language (e.g. when the wanderer named a
     sensation themselves and Grace mirrors it) survives the strip.
  4. `build_system_message` does NOT inject the body_lenses
     intuitive-lens anchor — the lens leak that caused the regression.
"""
import sys
import os

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from clarity_ai import _strip_body_aphorisms, build_system_message


def test_strip_removes_body_knows_before_mind():
    text = (
        "Sadness without a name is real. "
        "Sometimes the body knows before the mind does. "
        "What does the day feel like?"
    )
    out = _strip_body_aphorisms(text)
    assert "body knows" not in out.lower()
    assert "Sadness without a name" in out
    assert "What does the day feel like" in out


def test_strip_removes_body_remembers_aphorism():
    text = (
        "I hear you. The body remembers the day longer than the mind. "
        "How long has it felt this way?"
    )
    out = _strip_body_aphorisms(text)
    assert "body remembers" not in out.lower()
    assert "I hear you" in out
    assert "How long" in out


def test_strip_removes_body_is_telling_you():
    text = "Your body is telling you something. Listen."
    out = _strip_body_aphorisms(text)
    assert "telling you" not in out.lower()


def test_strip_removes_where_in_body_question():
    text = (
        "That's heavy. "
        "Where in the body do you feel it most? "
        "Take a breath."
    )
    out = _strip_body_aphorisms(text)
    assert "where in the body" not in out.lower()
    assert "That's heavy" in out


def test_strip_is_idempotent():
    text = "Sometimes the body knows before the mind does. Hello."
    once = _strip_body_aphorisms(text)
    twice = _strip_body_aphorisms(once)
    assert once == twice


def test_strip_preserves_user_named_body_sensations():
    """If the wanderer just said 'my chest is tight' and Grace mirrors
    it — that's allowed body language, NOT an aphorism, and must
    survive the strip."""
    text = "That tightness in your chest — what is tomorrow carrying?"
    out = _strip_body_aphorisms(text)
    assert "tightness in your chest" in out


def test_strip_never_returns_empty():
    """Safety net: if Claude's whole reply was aphorism, we keep the
    original rather than returning empty (upstream sanitize_reply
    still has the last word on clinical drift)."""
    text = "Sometimes the body knows before the mind does."
    out = _strip_body_aphorisms(text)
    assert out  # non-empty — falls back to original


def test_build_system_message_no_longer_injects_body_lens():
    """The body_lenses 'intuitive' anchor was being injected into the
    Clarity prompt as a 'default invisible lens' — the actual leak
    that caused Grace to talk about somatic stuff in the Private
    Room. This regression test asserts that injection is gone."""
    msg = build_system_message(history=[])
    assert "Active wisdom lens" not in msg
    assert "lens_prompt_anchor" not in msg
    # The intuitive lens text starts with a known marker — assert it
    # is NOT in the assembled prompt.
    assert "somatic regulation / psychosomatic mirror / eastern breath" not in msg


def test_build_system_message_carries_private_room_identity_lock():
    """The new stabilization block must be present so the prompt
    itself enforces room identity (defence in depth on top of the
    post-Claude regex strip)."""
    msg = build_system_message(history=[])
    assert "Private Room identity lock" in msg
    assert "NOT the Body Room" in msg
