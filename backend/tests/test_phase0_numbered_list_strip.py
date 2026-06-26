"""
test_phase0_numbered_list_strip.py — §Phase 0 House regression (2026-02-14).

Founder directive: numbered-list token leakage like
``"5. 6. 7. 8. 9. ... Hello."`` MUST never reach the wanderer.

These tests pin the behaviour of `clarity_safety._strip_numbered_list_leakage`
and the full `sanitize_reply` pipeline so this exact bug cannot
silently re-appear.
"""
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from clarity_safety import sanitize_reply, _strip_numbered_list_leakage  # noqa: E402


def test_strips_long_enumeration_run_at_start():
    src = "5. 6. 7. 8. 9. 10. 11. 12. 13. 14. 15. 16. 17. 18. 19. Hello."
    assert _strip_numbered_list_leakage(src).strip() == "Hello."


def test_strips_short_enumeration_run_at_start():
    assert _strip_numbered_list_leakage("1. 2. 3. Take a breath.").strip() == "Take a breath."


def test_strips_enumeration_after_sentence_boundary():
    src = "Quiet. 5. 6. 7. Then nothing."
    assert _strip_numbered_list_leakage(src).strip() == "Quiet. Then nothing."


def test_preserves_clean_reply():
    src = "I am here. Take your time."
    assert _strip_numbered_list_leakage(src).strip() == src


def test_preserves_legitimate_inline_number():
    # A single "in 5 minutes" must survive — only sequences of N. tokens go.
    src = "Come back in 5 minutes."
    assert _strip_numbered_list_leakage(src).strip() == src


def test_sanitize_reply_pipeline_runs_layer0_first():
    src = "5. 6. 7. Hello, I am here with you."
    out = sanitize_reply(src)
    # Numbers gone, calm sentence preserved.
    assert "5." not in out
    assert "6." not in out
    assert "Hello, I am here with you." in out


def test_sanitize_reply_handles_whitespace_padding():
    src = "  5.   6.   7. Hello there."
    out = sanitize_reply(src)
    assert "5." not in out and "6." not in out
    assert "Hello there." in out


def test_sanitize_reply_idempotent():
    src = "5. 6. 7. 8. 9. 10. Hello."
    once = sanitize_reply(src)
    twice = sanitize_reply(once)
    assert once == twice
