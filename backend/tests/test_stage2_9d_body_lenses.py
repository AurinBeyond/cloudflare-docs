"""Tests for the Body Room Multi-Lens system (Stage 2.9d).

Validates:
  - All 3 lenses are present with the expected shape
  - Each lens has all 8 region entries
  - No clinical / banned vocabulary leaks (clarity_safety lock)
  - The `/api/body-room/lenses` endpoint is reachable + returns the
    same shape as the in-module helper.
  - `generate_body_reply` accepts an unknown `lens` value gracefully
    (no crash, no anchor injection).
"""
from __future__ import annotations

import asyncio
import os
import sys
import pytest

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from body_lenses import (  # noqa: E402
    LENSES,
    REGION_IDS,
    list_lenses,
    get_lens,
    lens_prompt_anchor,
)
from clarity_safety import sanitize_reply, audit_clinical_drift  # noqa: E402


REQUIRED_LENS_IDS = {"intuitive", "eastern", "psychosomatic", "somatic_science"}
LENSES_WITH_REGIONS = {"eastern", "psychosomatic", "somatic_science"}


def test_four_lenses_present():
    assert set(LENSES.keys()) == REQUIRED_LENS_IDS


def test_each_lens_has_all_eight_regions():
    """Region maps are required for the three concrete lenses. The
    Intuitive Flow lens intentionally has no static region map — the
    mentor reads context and chooses live."""
    for lens_id in LENSES_WITH_REGIONS:
        lens = LENSES[lens_id]
        for region in REGION_IDS:
            assert region in lens["regions"], (
                f"{lens_id} is missing region {region}"
            )
            entry = lens["regions"][region]
            assert entry.get("insight"), f"{lens_id}/{region} missing insight"
            assert entry.get("practice"), f"{lens_id}/{region} missing practice"
            assert entry.get("permission"), f"{lens_id}/{region} missing permission"


def test_intuitive_lens_has_no_static_regions():
    """The intuitive lens uses the prompt to choose at run time."""
    assert LENSES["intuitive"]["regions"] == {}
    # But the prompt anchor must explicitly forbid naming the method.
    anchor = LENSES["intuitive"]["prompt_anchor"]
    assert "MUST NOT" in anchor or "must not" in anchor
    assert "without naming" in anchor.lower() or "naming it aloud" in anchor.lower()


def test_each_lens_has_required_metadata():
    required_keys = {"id", "name", "subtitle", "plain", "scope", "attribution", "prompt_anchor", "regions"}
    for lens_id, lens in LENSES.items():
        missing = required_keys - set(lens.keys())
        assert not missing, f"{lens_id} missing keys {missing}"


def test_no_clinical_drift_in_any_region_text():
    """Every insight + practice + permission must pass clarity_safety
    without redaction or audit warnings. This is the wellness-language
    lock for the Multi-Lens system. sanitize_reply may capitalize the
    leading letter — that is cosmetic, not a safety failure, so we
    compare case-insensitively after dropping the first character."""
    for lens_id, lens in LENSES.items():
        for region, entry in lens["regions"].items():
            for field in ("insight", "practice", "permission"):
                text = entry[field]
                sanitized = sanitize_reply(text)
                # Strip the leading-cap normalization before comparing.
                assert sanitized[1:] == text[1:], (
                    f"{lens_id}/{region}/{field} contains banned text: {text!r}"
                )
                warnings = audit_clinical_drift(text)
                assert warnings == [], (
                    f"{lens_id}/{region}/{field} drifted clinically: {warnings}"
                )


def test_each_prompt_anchor_carries_safety_language():
    """The active-lens system prompt fragment must explicitly anchor
    the AI in possibility-language, never diagnosis. We enforce the
    presence of at least one of the soft modal markers."""
    soft_markers = ("MAY", "may ", "possibility", "permission", "never")
    for lens_id, lens in LENSES.items():
        anchor = lens["prompt_anchor"]
        assert any(m in anchor for m in soft_markers), (
            f"{lens_id} anchor lacks soft modal language: {anchor[:120]}..."
        )


def test_list_lenses_helper_shape():
    out = list_lenses()
    assert len(out) == 4
    ids = {l["id"] for l in out}
    assert ids == REQUIRED_LENS_IDS
    for lens in out:
        for k in ("id", "name", "subtitle", "scope", "attribution", "regions"):
            assert k in lens


def test_get_lens_helper():
    assert get_lens(None) is None
    assert get_lens("") is None
    assert get_lens("nonexistent") is None
    assert get_lens("eastern")["id"] == "eastern"
    # case-insensitive + whitespace trim
    assert get_lens(" PSYCHOSOMATIC ")["id"] == "psychosomatic"


def test_prompt_anchor_helper():
    assert lens_prompt_anchor(None) is None
    assert lens_prompt_anchor("does_not_exist") is None
    assert "EASTERN" in lens_prompt_anchor("eastern")
    assert "PSYCHOSOMATIC" in lens_prompt_anchor("psychosomatic").upper()


def test_generate_body_reply_handles_unknown_lens_gracefully():
    """The pipeline must not crash when `lens` is unknown — it should
    silently skip the lens anchor and respond normally."""
    from body_room_ai import generate_body_reply

    async def run():
        # No OPENAI key in test env → expect calm fallback string, not
        # a crash.
        result = await generate_body_reply(
            user_text="my shoulders feel heavy tonight",
            history=[],
            body_context={"region": "shoulders"},
            transient_context=[],
            session_id="test-session",
            lens="nonexistent_lens_id",
        )
        return result

    result = asyncio.run(run())
    assert isinstance(result, dict)
    assert result.get("text"), "reply text must be non-empty"
    # Reply must pass the same wellness-language audit
    assert audit_clinical_drift(result["text"]) == []


@pytest.mark.parametrize("lens_id", sorted(REQUIRED_LENS_IDS))
def test_generate_body_reply_accepts_each_known_lens(lens_id):
    """Each known lens id must flow through `generate_body_reply`
    without exception. (LLM mock not needed — we hit the early
    fallback path when the API key is missing in the test env.)"""
    from body_room_ai import generate_body_reply

    async def run():
        return await generate_body_reply(
            user_text="i feel tight here",
            history=[],
            body_context={"region": "heart"},
            transient_context=[],
            session_id="test-session",
            lens=lens_id,
        )

    result = asyncio.run(run())
    assert isinstance(result, dict)
    assert result.get("text")
