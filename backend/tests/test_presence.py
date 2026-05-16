"""Tests for Presence Time runtime (§STABILIZATION 2026-05-16 PM).

These tests cover the pure helpers used by the LemonSqueezy webhook
and the session_cap layer. They do NOT exercise the FastAPI endpoints
directly (those have full DB integration and live curl smoke covers
them); we test the deterministic logic that lives in session_cap and
in the variant-mapping helper imported from server.py.
"""

import os
import sys
import asyncio
from unittest.mock import patch

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from session_cap import compute_voice_window  # noqa: E402


class _FakeCollection:
    def __init__(self):
        self._docs = []

    async def find_one(self, *args, **kwargs):
        return None


class _FakeDB:
    def __init__(self):
        self.clarity_passes = _FakeCollection()


def _run(coro):
    return asyncio.get_event_loop().run_until_complete(coro)


def test_presence_seconds_takes_priority_over_passes():
    """When user has presence_seconds_left > 0, tier is 'presence' and
    seconds_remaining reflects the balance, even with cap enabled."""
    env = {"SESSION_CAP_ENABLED": "true", "FREE_ACCESS_UNTIL": ""}
    with patch.dict(os.environ, env, clear=False):
        user_doc = {"user_id": "u1", "presence_seconds_left": 1800}
        out = _run(compute_voice_window("u1", user_doc, _FakeDB()))
        assert out["allowed"] is True
        assert out["tier"] == "presence"
        assert out["seconds_remaining"] == 1800
        assert out["reason"] == "presence_balance"


def test_zero_presence_balance_falls_through_to_passes():
    """When balance is 0, the cap moves on to other tiers (no passes
    in this fake DB → no_pass block)."""
    env = {"SESSION_CAP_ENABLED": "true", "FREE_ACCESS_UNTIL": ""}
    with patch.dict(os.environ, env, clear=False):
        user_doc = {"user_id": "u1", "presence_seconds_left": 0}
        out = _run(compute_voice_window("u1", user_doc, _FakeDB()))
        assert out["allowed"] is False
        assert out["reason"] == "no_pass"


def test_unlimited_user_overrides_presence():
    """unlimited_voice=true wins even when presence balance is 0."""
    env = {"SESSION_CAP_ENABLED": "true"}
    with patch.dict(os.environ, env, clear=False):
        user_doc = {
            "user_id": "u1",
            "presence_seconds_left": 0,
            "unlimited_voice": True,
        }
        out = _run(compute_voice_window("u1", user_doc, _FakeDB()))
        assert out["allowed"] is True
        assert out["tier"] == "unlimited"
        assert out["reason"] == "unlimited"


def test_cap_disabled_makes_presence_irrelevant():
    """When the kill-switch is off, the cap returns unlimited regardless
    of balance — the layer is invisible."""
    env = {"SESSION_CAP_ENABLED": "false"}
    with patch.dict(os.environ, env, clear=False):
        user_doc = {"user_id": "u1", "presence_seconds_left": 1800}
        out = _run(compute_voice_window("u1", user_doc, _FakeDB()))
        assert out["allowed"] is True
        assert out["tier"] == "unlimited"
        assert out["reason"] == "cap_disabled"


def test_variant_mapping_returns_correct_seconds():
    """The variant-id → seconds helper reads the ENV mapping."""
    # Import inside the function so the helper module reads our env.
    from importlib import import_module
    server = import_module("server")
    env = {
        "LEMONSQUEEZY_VARIANT_VOICE_30MIN": "111",
        "LEMONSQUEEZY_VARIANT_VOICE_60MIN": "222",
        "LEMONSQUEEZY_VARIANT_ETERNAL": "333",
        "LEMONSQUEEZY_VARIANT_TOPUP_30MIN": "444",
        "LEMONSQUEEZY_VARIANT_TOPUP_60MIN": "555",
    }
    with patch.dict(os.environ, env, clear=False):
        assert server._presence_seconds_for_variant("111") == 1800
        assert server._presence_seconds_for_variant("222") == 3600
        assert server._presence_seconds_for_variant("333") == 10800
        assert server._presence_seconds_for_variant("444") == 1800
        assert server._presence_seconds_for_variant("555") == 3600
        assert server._presence_seconds_for_variant("999") == 0
        assert server._presence_seconds_for_variant(None) == 0


def test_variant_mapping_empty_env_returns_zero():
    """When the ENV is unset (founder hasn't opened Lemon yet), every
    variant returns 0 — no accidental grants from a manual purchase."""
    from importlib import import_module
    server = import_module("server")
    env = {
        "LEMONSQUEEZY_VARIANT_VOICE_30MIN": "",
        "LEMONSQUEEZY_VARIANT_VOICE_60MIN": "",
        "LEMONSQUEEZY_VARIANT_ETERNAL": "",
        "LEMONSQUEEZY_VARIANT_TOPUP_30MIN": "",
        "LEMONSQUEEZY_VARIANT_TOPUP_60MIN": "",
    }
    with patch.dict(os.environ, env, clear=False):
        assert server._presence_seconds_for_variant("anything") == 0


def test_extract_variant_id_from_subscription_payload():
    from importlib import import_module
    server = import_module("server")
    data = {"attributes": {"variant_id": "777"}}
    assert server._extract_lemonsqueezy_variant_id(data) == "777"


def test_extract_variant_id_from_order_payload():
    from importlib import import_module
    server = import_module("server")
    data = {"attributes": {"first_order_item": {"variant_id": "888"}}}
    assert server._extract_lemonsqueezy_variant_id(data) == "888"


def test_extract_variant_id_missing():
    from importlib import import_module
    server = import_module("server")
    assert server._extract_lemonsqueezy_variant_id({}) is None
    assert server._extract_lemonsqueezy_variant_id({"attributes": {}}) is None
