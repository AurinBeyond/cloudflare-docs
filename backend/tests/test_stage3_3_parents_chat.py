"""
test_stage3_3_parents_chat.py — Parents' Room live mentor endpoint
and the tonality / clarity_safety pipeline that fires on every reply.
"""
from __future__ import annotations

import asyncio

import pytest

import parents_room_ai
from clarity_safety import sanitize_reply, audit_clinical_drift
from tonality_filter import soften, audit


def _run(coro):
    return asyncio.run(coro)


def test_crisis_phrase_triggers_safe_response():
    out = _run(parents_room_ai.generate_parents_reply(
        user_text="I want to hurt my child tonight",
        session_id="test-crisis",
    ))
    # Crisis response must redirect to a human voice.
    assert "Eluliin" in out["text"] or "116" in out["text"]
    assert out["tone_tag"] == "compassion"


def test_empty_text_returns_calm_placeholder():
    out = _run(parents_room_ai.generate_parents_reply(
        user_text="",
        session_id="test-empty",
    ))
    assert out["text"]
    assert out["tone_tag"] in ("neutral", "support", "compassion", "reflection")


def test_crisis_detection_helper():
    assert parents_room_ai._detect_crisis("I want to kill myself") is True
    assert parents_room_ai._detect_crisis("I am tired tonight") is False


# --- Tonality filter (Wisdom Weaver) -----------------------------------

def test_softener_replaces_research_shows():
    out = soften("Research shows that bedtime routines help. You should be consistent.")
    assert "research shows that" not in out.lower()
    assert "you should" not in out.lower()


def test_softener_collapses_bullet_listicle_to_fallback():
    listicle = (
        "Here are 3 things:\n"
        "- Try a bath\n"
        "- Try music\n"
        "- Try silence\n"
    )
    out = soften(listicle)
    # Heavily listicle replies must be re-anchored.
    assert "list" not in out.lower() or "no list for this" in out.lower()


def test_softener_audit_flags_blog_signals():
    flags = audit(
        "Generally speaking, research shows that you should be consistent.\n"
        "- Bullet one\n- Bullet two\n- Bullet three\n"
    )
    assert any("bullet" in f.lower() or "listicle" in f.lower() for f in flags)


def test_softener_passthrough_for_short_reply():
    short = "I hear you. Tonight you can rest."
    assert soften(short) == short


# --- clarity_safety integration (Wisdom Weaver runs after sanitize) ----

def test_sanitize_reply_runs_tonality_filter():
    """sanitize_reply imports tonality_filter.soften; a 'research shows
    that' phrase should disappear after sanitization."""
    out = sanitize_reply("Research shows that bedtime is important.")
    assert "research shows that" not in out.lower()


def test_sanitize_reply_still_blocks_medical_terms():
    out = sanitize_reply("This is a therapy session for your child.")
    # Either layer 1 rewrote it, or layer 2 fired safe fallback.
    low = out.lower()
    assert "therapy" not in low
    assert "therapist" not in low


def test_no_estonian_ravim_leaks_through():
    out = sanitize_reply("Ravim aitab last paremini magada.")
    assert "ravim" not in out.lower()


def test_audit_clinical_drift_flags_ravim():
    flags = audit_clinical_drift("Ravim ja teraapia on lapse jaoks olulised.")
    assert any("ravim" in f for f in flags)


# --- generate_parents_reply integration shape --------------------------

def test_generate_parents_reply_accepts_quiet_knowledge_param():
    """The function must accept the new param without raising."""
    out = _run(parents_room_ai.generate_parents_reply(
        user_text="",
        session_id="test-qk",
        quiet_knowledge="# §Quiet knowledge from earlier\nTags: tiredness, child",
    ))
    assert out["text"]
