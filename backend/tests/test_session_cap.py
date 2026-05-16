"""Tests for the session-cap layer (§STABILIZATION 2026-05-16).

Verifies the helper module in isolation — no FastAPI app, no real
Mongo. We pass a tiny fake `db` so `compute_voice_window` returns
exactly what the production endpoint will return.
"""

import asyncio
import os
from datetime import datetime, timedelta, timezone
from unittest.mock import patch

import sys
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from session_cap import (  # noqa: E402
    compute_voice_window,
    is_cap_enabled,
    is_user_unlimited,
)


class _FakeCollection:
    def __init__(self, docs=None):
        self._docs = docs or []
        self.queries = []

    async def find_one(self, query, projection=None, sort=None):
        self.queries.append(query)
        # Return the first doc that satisfies a minimal subset of the
        # query operators we use (user_id, tier, consumed, $gt, $in).
        for doc in self._docs:
            if not self._matches(doc, query):
                continue
            out = dict(doc)
            if projection and projection.get("_id") == 0:
                out.pop("_id", None)
            return out
        return None

    @staticmethod
    def _matches(doc, query):
        for k, v in query.items():
            if isinstance(v, dict):
                # Handle $gt and $in operators only — we don't need more.
                for op, op_val in v.items():
                    if op == "$gt":
                        if not (doc.get(k) and doc[k] > op_val):
                            return False
                    elif op == "$in":
                        if doc.get(k) not in op_val:
                            return False
                    else:
                        return False
            else:
                if doc.get(k) != v:
                    return False
        return True


class _FakeDB:
    def __init__(self, passes=None):
        self.clarity_passes = _FakeCollection(passes)


def _run(coro):
    return asyncio.get_event_loop().run_until_complete(coro)


def test_cap_disabled_always_allows():
    with patch.dict(os.environ, {"SESSION_CAP_ENABLED": "false"}, clear=False):
        assert is_cap_enabled() is False
        out = _run(compute_voice_window("u1", None, _FakeDB()))
        assert out["allowed"] is True
        assert out["tier"] == "unlimited"
        assert out["reason"] == "cap_disabled"
        assert out["cap_enabled"] is False


def test_cap_enabled_unlimited_user_passes():
    with patch.dict(os.environ, {"SESSION_CAP_ENABLED": "true"}, clear=False):
        assert is_cap_enabled() is True
        user = {"user_id": "u1", "unlimited_voice": True}
        assert is_user_unlimited(user) is True
        out = _run(compute_voice_window("u1", user, _FakeDB()))
        assert out["allowed"] is True
        assert out["tier"] == "unlimited"
        assert out["reason"] == "unlimited"
        assert out["cap_enabled"] is True


def test_cap_enabled_free_access_window_passes():
    future = (datetime.now(timezone.utc) + timedelta(days=1)).isoformat()
    env = {"SESSION_CAP_ENABLED": "true", "FREE_ACCESS_UNTIL": future}
    with patch.dict(os.environ, env, clear=False):
        out = _run(compute_voice_window("u1", {"user_id": "u1"}, _FakeDB()))
        assert out["allowed"] is True
        assert out["tier"] == "free_access"


def test_cap_enabled_active_consumed_pass():
    future = (datetime.now(timezone.utc) + timedelta(minutes=20)).isoformat()
    db = _FakeDB(passes=[{
        "user_id": "u1",
        "tier": "30min",
        "consumed": True,
        "expires_at": future,
    }])
    # Disable free access for this test
    env = {"SESSION_CAP_ENABLED": "true", "FREE_ACCESS_UNTIL": ""}
    with patch.dict(os.environ, env, clear=False):
        out = _run(compute_voice_window("u1", {"user_id": "u1"}, db))
        assert out["allowed"] is True
        assert out["tier"] == "30min"
        assert out["reason"] == "active_pass"
        # 20 minutes - a few seconds of test latency
        assert 1100 <= out["seconds_remaining"] <= 1200


def test_cap_enabled_unconsumed_pass_allows_with_no_countdown():
    future = (datetime.now(timezone.utc) + timedelta(days=365)).isoformat()
    db = _FakeDB(passes=[{
        "user_id": "u1",
        "tier": "60min",
        "consumed": False,
        "expires_at": future,
    }])
    env = {"SESSION_CAP_ENABLED": "true", "FREE_ACCESS_UNTIL": ""}
    with patch.dict(os.environ, env, clear=False):
        out = _run(compute_voice_window("u1", {"user_id": "u1"}, db))
        assert out["allowed"] is True
        assert out["tier"] == "60min"
        assert out["reason"] == "pending_pass"
        assert out["seconds_remaining"] == 0


def test_cap_enabled_no_pass_blocks():
    env = {"SESSION_CAP_ENABLED": "true", "FREE_ACCESS_UNTIL": ""}
    with patch.dict(os.environ, env, clear=False):
        out = _run(compute_voice_window("u1", {"user_id": "u1"}, _FakeDB()))
        assert out["allowed"] is False
        assert out["tier"] is None
        assert out["reason"] == "no_pass"
        assert out["cap_enabled"] is True


def test_expired_pass_does_not_match():
    past = (datetime.now(timezone.utc) - timedelta(minutes=1)).isoformat()
    db = _FakeDB(passes=[{
        "user_id": "u1",
        "tier": "30min",
        "consumed": True,
        "expires_at": past,
    }])
    env = {"SESSION_CAP_ENABLED": "true", "FREE_ACCESS_UNTIL": ""}
    with patch.dict(os.environ, env, clear=False):
        out = _run(compute_voice_window("u1", {"user_id": "u1"}, db))
        assert out["allowed"] is False
        assert out["reason"] == "no_pass"
