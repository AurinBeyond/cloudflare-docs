"""§GOVERNANCE 2026-02-11 — runtime_governance.py unit tests.

Style follows existing tests (test_session_cap.py): plain asyncio.run,
no pytest_asyncio plugin. Tests guards in isolation with mock DB +
preseeded vendor cache.
"""

import asyncio
import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))


class MockCursor:
    def __init__(self, items):
        self._items = items

    def __aiter__(self):
        return self._gen()

    async def _gen(self):
        for item in self._items:
            yield item


class MockCollection:
    def __init__(self, count_value=0, agg_items=None):
        self.count_value = count_value
        self.agg_items = agg_items or []

    async def count_documents(self, query):
        return self.count_value

    def aggregate(self, pipeline):
        return MockCursor(self.agg_items)


class MockDB:
    def __init__(self, voice_sessions_count=0, users_agg=None):
        self.voice_sessions = MockCollection(count_value=voice_sessions_count)
        self.users = MockCollection(agg_items=users_agg or [])


def test_governance_disabled_allows():
    from runtime_governance import evaluate_governance

    os.environ["GOVERNANCE_ENABLED"] = "false"
    try:
        verdict = asyncio.run(evaluate_governance(MockDB(), None))
        assert verdict["allowed"] is True
        assert verdict["reason"] == "governance_disabled"
    finally:
        os.environ["GOVERNANCE_ENABLED"] = "true"


def test_unlimited_user_bypasses():
    from runtime_governance import evaluate_governance

    os.environ["GOVERNANCE_ENABLED"] = "true"
    verdict = asyncio.run(evaluate_governance(MockDB(), {"unlimited_voice": True}))
    assert verdict["allowed"] is True
    assert verdict["reason"] == "unlimited_voice_user"


def test_vendor_balance_low_blocks():
    """When ElevenLabs usage >= floor, vendor guard trips."""
    from runtime_governance import check_vendor_balance, _VENDOR_CACHE

    _VENDOR_CACHE["data"] = {
        "character_count": 95_000,
        "character_limit": 100_000,
        "tier": "creator",
        "status": "active",
    }
    _VENDOR_CACHE["checked_at"] = 9999999999

    os.environ["GOVERNANCE_ELEVENLABS_USAGE_FLOOR"] = "0.90"
    try:
        ok, details = asyncio.run(check_vendor_balance())
        assert ok is False
        assert details["usage_ratio"] >= 0.90
    finally:
        os.environ.pop("GOVERNANCE_ELEVENLABS_USAGE_FLOOR", None)
        _VENDOR_CACHE["data"] = None
        _VENDOR_CACHE["checked_at"] = 0


def test_vendor_balance_healthy_passes():
    from runtime_governance import check_vendor_balance, _VENDOR_CACHE

    _VENDOR_CACHE["data"] = {
        "character_count": 20_000,
        "character_limit": 100_000,
    }
    _VENDOR_CACHE["checked_at"] = 9999999999

    try:
        ok, details = asyncio.run(check_vendor_balance())
        assert ok is True
        assert details["remaining_chars"] == 80_000
    finally:
        _VENDOR_CACHE["data"] = None
        _VENDOR_CACHE["checked_at"] = 0


def test_concurrency_cap_blocks():
    from runtime_governance import check_concurrency

    os.environ["GOVERNANCE_MAX_CONCURRENT_VOICE"] = "5"
    try:
        ok, details = asyncio.run(check_concurrency(MockDB(voice_sessions_count=10)))
        assert ok is False
        assert details["open_sessions"] == 10
        assert details["threshold"] == 5
    finally:
        os.environ.pop("GOVERNANCE_MAX_CONCURRENT_VOICE", None)


def test_concurrency_under_cap_passes():
    from runtime_governance import check_concurrency

    os.environ["GOVERNANCE_MAX_CONCURRENT_VOICE"] = "50"
    try:
        ok, details = asyncio.run(check_concurrency(MockDB(voice_sessions_count=3)))
        assert ok is True
    finally:
        os.environ.pop("GOVERNANCE_MAX_CONCURRENT_VOICE", None)


def test_spend_velocity_breaker_trips_and_cools_down():
    import runtime_governance as rg
    from runtime_governance import check_spend_velocity

    os.environ["GOVERNANCE_MAX_SESSIONS_PER_15MIN"] = "10"
    rg._VELOCITY_COOLDOWN_UNTIL = 0
    try:
        ok, details = asyncio.run(check_spend_velocity(MockDB(voice_sessions_count=20)))
        assert ok is False
        assert details["tripped"] is True
        # Cooldown active — even with 0 sessions, still blocked.
        ok2, details2 = asyncio.run(check_spend_velocity(MockDB(voice_sessions_count=0)))
        assert ok2 is False
        assert "cooldown_remaining_sec" in details2
    finally:
        os.environ.pop("GOVERNANCE_MAX_SESSIONS_PER_15MIN", None)
        rg._VELOCITY_COOLDOWN_UNTIL = 0


def test_governance_snapshot_shape():
    from runtime_governance import governance_status_snapshot, _VENDOR_CACHE

    _VENDOR_CACHE["data"] = {
        "character_count": 30_000,
        "character_limit": 100_000,
        "tier": "creator",
    }
    _VENDOR_CACHE["checked_at"] = 9999999999

    db = MockDB(
        voice_sessions_count=0,
        users_agg=[{"_id": None, "total": 6000, "count": 3}],
    )

    try:
        snap = asyncio.run(governance_status_snapshot(db))
        assert "checked_at" in snap
        assert set(snap["guards"].keys()) == {"vendor_balance", "concurrency", "spend_velocity"}
        assert snap["customer_debt"]["total_owed_seconds"] == 6000
        assert snap["customer_debt"]["active_users_with_balance"] == 3
        assert snap["vendor_headroom"]["elevenlabs_remaining_chars"] == 70_000
        # Ratio: 70k chars / 1000 = 70 minutes / 100 minutes owed (6000s/60) = 0.7
        assert snap["vendor_headroom"]["headroom_vs_debt_ratio"] == 0.7
    finally:
        _VENDOR_CACHE["data"] = None
        _VENDOR_CACHE["checked_at"] = 0


def test_evaluate_governance_blocks_when_concurrency_cap_hit():
    from runtime_governance import evaluate_governance, _VENDOR_CACHE

    _VENDOR_CACHE["data"] = {"character_count": 1000, "character_limit": 100_000}
    _VENDOR_CACHE["checked_at"] = 9999999999

    os.environ["GOVERNANCE_MAX_CONCURRENT_VOICE"] = "2"
    try:
        verdict = asyncio.run(
            evaluate_governance(MockDB(voice_sessions_count=5), {"unlimited_voice": False})
        )
        assert verdict["allowed"] is False
        assert verdict["blocked_by"] == "concurrency"
    finally:
        os.environ.pop("GOVERNANCE_MAX_CONCURRENT_VOICE", None)
        _VENDOR_CACHE["data"] = None
        _VENDOR_CACHE["checked_at"] = 0


def test_emergency_freeze_blocks_unlimited_user():
    """Freeze must override even unlimited_voice — red button."""
    from runtime_governance import evaluate_governance, set_frozen

    set_frozen(True)
    try:
        verdict = asyncio.run(
            evaluate_governance(MockDB(), {"unlimited_voice": True})
        )
        assert verdict["allowed"] is False
        assert verdict["blocked_by"] == "emergency_freeze"
        assert verdict["reason"] == "emergency_freeze_active"
    finally:
        set_frozen(False)


def test_freeze_lift_restores_unlimited_user():
    from runtime_governance import evaluate_governance, set_frozen, _VENDOR_CACHE

    _VENDOR_CACHE["data"] = {"character_count": 1000, "character_limit": 100_000}
    _VENDOR_CACHE["checked_at"] = 9999999999

    set_frozen(True)
    set_frozen(False)
    try:
        verdict = asyncio.run(
            evaluate_governance(MockDB(), {"unlimited_voice": True})
        )
        assert verdict["allowed"] is True
        assert verdict["reason"] == "unlimited_voice_user"
    finally:
        _VENDOR_CACHE["data"] = None
        _VENDOR_CACHE["checked_at"] = 0


if __name__ == "__main__":
    # Allow running as `python tests/test_runtime_governance.py`.
    tests = [
        test_governance_disabled_allows,
        test_unlimited_user_bypasses,
        test_vendor_balance_low_blocks,
        test_vendor_balance_healthy_passes,
        test_concurrency_cap_blocks,
        test_concurrency_under_cap_passes,
        test_spend_velocity_breaker_trips_and_cools_down,
        test_governance_snapshot_shape,
        test_evaluate_governance_blocks_when_concurrency_cap_hit,
        test_emergency_freeze_blocks_unlimited_user,
        test_freeze_lift_restores_unlimited_user,
    ]
    for t in tests:
        try:
            t()
            print(f"PASS {t.__name__}")
        except AssertionError as e:
            print(f"FAIL {t.__name__}: {e}")
            raise
