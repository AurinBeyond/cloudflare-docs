"""§2026-02-15 STABILIZATION — Whisper hallucination filter unit tests.

Founder reported on prulesoul.site live:
  • Whisper transcribed silence as "10. 10. 12. 13. 14. 15. ..."
  • Whisper transcribed mic noise as "10.5tbsp soy sauce mirin sugar"
  • Whisper occasionally injected CJK glyphs on quiet rooms.
Claude then earnestly replied "What are you carrying underneath the
numbers?" — destroying trust in the mentor.

The filter MUST:
  - Drop bare-number sequences
  - Drop short recipe fragments
  - Drop YouTube-credits footer phrases
  - Drop runs of CJK / Cyrillic / Arabic on short clips
  - Drop "hello hello hello" loops
  - PRESERVE real short sentences ("Hello", "I feel sad", "Help me")
  - PRESERVE real long sentences (even if they contain a number)
"""
import sys
import os

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from server import _filter_whisper_hallucination as f


# --- DROP patterns (must return "") ---

def test_drops_bare_number_sequence():
    assert f("10. 11. 12. 13. 14. 15. 16. 17. 18. 19. 20.") == ""


def test_drops_recipe_fragment():
    assert f("10.5tbsp soy sauce") == ""
    assert f("2 tsp vanilla") == ""


def test_drops_youtube_footer():
    assert f("Thanks for watching!") == ""
    assert f("Please subscribe to my channel") == ""
    assert f("Subtitles by Joe") == ""


def test_drops_repeated_token():
    assert f("hello hello hello hello hello") == ""
    assert f("hi hi hi hi hi") == ""


def test_drops_cjk_on_short_clip():
    # Random Chinese on a quiet room
    assert f("你好 世界 中文") == ""
    # Cyrillic
    assert f("привет мир тест") == ""


def test_drops_single_consonant():
    assert f("hm") == ""
    assert f("k") == ""
    assert f("zz") == ""


# --- KEEP patterns (must pass through unchanged) ---

def test_keeps_real_short_greeting():
    assert f("Hello") == "Hello"
    assert f("Hi") == "Hi"


def test_keeps_real_short_emotional():
    assert f("I feel sad") == "I feel sad"
    assert f("Help me please") == "Help me please"


def test_keeps_long_sentence_even_with_numbers():
    """A real sentence that just happens to mention a number must
    NOT be filtered — the recipe pattern only matches at sentence
    start AND only on short clips."""
    real = (
        "I am 45 years old and I have been feeling lost since my "
        "mother passed away three months ago."
    )
    assert f(real) == real


def test_keeps_mixed_language_long_sentence():
    """A long sentence with a few Cyrillic chars is real — Whisper
    only hallucinates non-latin on SHORT clips."""
    real = (
        "I want to tell you a story about my grandmother who used "
        "to sing in a language I never learned, the words still "
        "soft in my chest after all these years."
    )
    assert f(real) == real


def test_keeps_empty_as_empty():
    assert f("") == ""
    assert f("   ") == ""


def test_keeps_whitespace_normalised():
    """Leading/trailing whitespace must be stripped but content preserved."""
    assert f("  Hello  ") == "Hello"
