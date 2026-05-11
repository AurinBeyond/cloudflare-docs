"""§Phase 1A — concierge presence runtime signal parser.

Verifies that `clarity_ai._split_signals` correctly extracts
`tone_tag` and `user_state` from a model reply and never breaks
the visible reply when the trailer is missing or malformed.
"""
import os

os.environ.setdefault("DB_NAME", "matrix_aurin_test")

from clarity_ai import _split_signals  # noqa: E402


def test_full_trailer():
    r = _split_signals(
        "I hear you. That weight is real.\n\n"
        "tone_tag: compassion\nuser_state: overwhelmed"
    )
    assert r["text"] == "I hear you. That weight is real."
    assert r["tone_tag"] == "compassion"
    assert r["user_state"] == "overwhelmed"


def test_no_trailer():
    r = _split_signals("Just a calm reply, no trailer.")
    assert r["text"] == "Just a calm reply, no trailer."
    assert r["tone_tag"] is None
    assert r["user_state"] is None


def test_one_signal_only():
    r = _split_signals("Some words here.\nuser_state: focused")
    assert r["text"] == "Some words here."
    assert r["tone_tag"] is None
    assert r["user_state"] == "focused"


def test_invalid_value_dropped():
    r = _split_signals(
        "Words.\ntone_tag: GIANT_HAPPY\nuser_state: emotional"
    )
    # Invalid tone is dropped (None), valid user_state retained, line still consumed.
    assert r["tone_tag"] is None
    assert r["user_state"] == "emotional"
    assert "tone_tag" not in r["text"].lower()
    assert "user_state" not in r["text"].lower()


def test_case_insensitive_with_whitespace():
    r = _split_signals(
        "  Words.  \nTONE_TAG:   reflection  \nUSER_STATE:  RETURNING "
    )
    assert r["tone_tag"] == "reflection"
    assert r["user_state"] == "returning"


def test_trailer_only_falls_back_to_full_text():
    """If the model emits ONLY the trailer with no body, the visible
    text must NOT be empty (defensive — never break the conversation)."""
    r = _split_signals("tone_tag: support\nuser_state: focused")
    assert r["text"]  # non-empty
    assert r["tone_tag"] == "support"
    assert r["user_state"] == "focused"


def test_swapped_order():
    r = _split_signals(
        "Text body here.\nuser_state: hesitant\ntone_tag: support"
    )
    assert r["text"] == "Text body here."
    assert r["tone_tag"] == "support"
    assert r["user_state"] == "hesitant"


def test_empty_input():
    r = _split_signals("")
    assert r["text"] == ""
    assert r["tone_tag"] is None
    assert r["user_state"] is None


def test_all_seven_user_states_valid():
    for s in ["overwhelmed", "analytical", "emotional", "confused",
              "returning", "hesitant", "focused"]:
        r = _split_signals(f"x.\nuser_state: {s}")
        assert r["user_state"] == s


def test_all_four_tone_tags_valid():
    for t in ["compassion", "support", "reflection", "neutral"]:
        r = _split_signals(f"x.\ntone_tag: {t}")
        assert r["tone_tag"] == t
