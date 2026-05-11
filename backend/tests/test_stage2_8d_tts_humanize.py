"""§Stage 2.8d — TTS humanization regression.

Verifies the pause-shaping helper in `clarity_tts._humanize_for_speech`:
  - em-dashes are converted to soft commas (gentler audio pause)
  - markdown bold/italic markers are stripped (TTS reads them literally)
  - sentences without trailing punctuation get a comma added
  - excessive newlines are collapsed
  - core text content is preserved
"""
import os

os.environ.setdefault("DB_NAME", "matrix_aurin_test")

from clarity_tts import _humanize_for_speech  # noqa: E402


def test_em_dash_to_comma():
    out = _humanize_for_speech("I hear you — and that weight is real.")
    assert "—" not in out
    assert "I hear you" in out
    assert "that weight is real" in out
    assert out.endswith(".")


def test_markdown_emphasis_stripped():
    out = _humanize_for_speech("This is **important** and *gentle*.")
    assert "*" not in out
    assert "important" in out
    assert "gentle" in out


def test_sentence_without_punct_gets_comma():
    out = _humanize_for_speech("A quiet line\nAnother quiet line\n")
    # Each line should end with at least one punctuation mark.
    lines = [ln for ln in out.split("\n") if ln.strip()]
    for ln in lines:
        assert ln.rstrip().endswith((".", ",", "?", "!", ":", ";", "…"))


def test_triple_newlines_collapsed():
    out = _humanize_for_speech("Line one.\n\n\n\nLine two.")
    assert "\n\n\n" not in out


def test_empty_input_passthrough():
    assert _humanize_for_speech("") == ""
    assert _humanize_for_speech("   ") == ""


def test_existing_punctuation_preserved():
    out = _humanize_for_speech("Are you tired? The body is wise.")
    assert "?" in out
    assert "tired?" in out
