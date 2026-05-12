"""
test_stage3_3_shared_memory.py — Cross-Room "quiet teadmine" bridge.

Uses a small in-memory FakeDB (mirrors the pattern in
`test_stage3_2_credit_ledger.py`) so the unit tests are independent of
the live Mongo on the box.
"""
from __future__ import annotations

import asyncio
import os
import sys
import uuid

import pytest

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import shared_memory as sm


# ----------------------------------------------------------------------
# FakeCollection — enough of motor to satisfy shared_memory.
# ----------------------------------------------------------------------


class _FakeCursor:
    def __init__(self, docs):
        self._docs = list(docs)
        self._sort_key = None
        self._sort_dir = 1
        self._limit = None

    def sort(self, key, direction=1):
        self._sort_key = key
        self._sort_dir = direction
        return self

    def limit(self, n):
        self._limit = int(n)
        return self

    def __aiter__(self):
        docs = self._docs
        if self._sort_key is not None:
            docs = sorted(docs, key=lambda d: d.get(self._sort_key) or "",
                          reverse=(self._sort_dir == -1))
        if self._limit is not None:
            docs = docs[: self._limit]
        self._iter = iter(docs)
        return self

    async def __anext__(self):
        try:
            return next(self._iter)
        except StopIteration:
            raise StopAsyncIteration


class FakeCollection:
    def __init__(self):
        self.docs = []

    async def update_one(self, query, update, upsert=False):
        for d in self.docs:
            if all(d.get(k) == v for k, v in query.items()):
                for k, v in (update.get("$set") or {}).items():
                    d[k] = v
                for k, v in (update.get("$inc") or {}).items():
                    d[k] = (d.get(k) or 0) + v
                for k, vals in (update.get("$addToSet") or {}).items():
                    arr = d.setdefault(k, [])
                    if vals not in arr:
                        arr.append(vals)
                return
        if upsert:
            new = dict(query)
            for k, v in (update.get("$set") or {}).items():
                new[k] = v
            for k, v in (update.get("$inc") or {}).items():
                new[k] = (new.get(k) or 0) + v
            for k, vals in (update.get("$addToSet") or {}).items():
                new[k] = [vals]
            self.docs.append(new)

    def find(self, query, projection=None):
        out = []
        for d in self.docs:
            ok = True
            for k, v in query.items():
                if isinstance(v, dict) and "$ne" in v:
                    if d.get(k) == v["$ne"]:
                        ok = False
                        break
                else:
                    if d.get(k) != v:
                        ok = False
                        break
            if ok:
                if projection:
                    proj = {k: vv for k, vv in d.items() if projection.get(k, 0) != 0}
                    out.append(proj)
                else:
                    out.append(dict(d))
        return _FakeCursor(out)

    async def create_index(self, keys, unique=False, **kwargs):
        return None

    async def delete_many(self, query):
        self.docs = [d for d in self.docs if not all(d.get(k) == v for k, v in query.items())]


class FakeDB:
    def __init__(self):
        self.shared_memory_tags = FakeCollection()


def _run(coro):
    return asyncio.run(coro)


# ----------------------------------------------------------------------
# extract_signals — no DB needed.
# ----------------------------------------------------------------------

def test_extract_tiredness_and_child():
    out = sm.extract_signals("I am exhausted and my child has not slept properly")
    assert "tiredness" in out
    assert "child" in out


def test_extract_estonian_väsinud():
    out = sm.extract_signals("ma olen väsinud ja laps ei maga öösel")
    assert "tiredness" in out
    assert "child" in out


def test_extract_chest_tension():
    out = sm.extract_signals("My tight chest and shoulders aching tonight.")
    assert "tension_chest" in out
    assert "tension_shoulders" in out


def test_extract_empty_text_returns_empty():
    assert sm.extract_signals("") == []
    assert sm.extract_signals(None) == []  # type: ignore[arg-type]


def test_extract_no_false_positives_on_unrelated_text():
    out = sm.extract_signals("The weather is nice today and the cat is sleeping.")
    assert "sleep_loss" not in out
    assert "tiredness" not in out


def test_extract_unique_tags_no_duplicates():
    out = sm.extract_signals("I am tired, so tired, completely exhausted, drained.")
    assert out.count("tiredness") == 1


# ----------------------------------------------------------------------
# record_signals + quiet_knowledge with FakeDB.
# ----------------------------------------------------------------------

def test_record_signals_writes_to_db():
    db = FakeDB()
    uid = f"u-{uuid.uuid4().hex[:6]}"
    tags = _run(sm.record_signals(db, uid, "body", "I am exhausted; my child won't sleep"))
    assert set(tags) >= {"tiredness", "child"}
    stored = {d["tag"] for d in db.shared_memory_tags.docs if d["user_id"] == uid}
    assert stored >= {"tiredness", "child"}
    for d in db.shared_memory_tags.docs:
        assert d["weight"] >= 1
        assert "body" in (d.get("source_rooms") or [])


def test_record_signals_noop_when_no_user_id():
    db = FakeDB()
    assert _run(sm.record_signals(db, "", "body", "tired")) == []


def test_record_signals_noop_for_unknown_room():
    db = FakeDB()
    assert _run(sm.record_signals(db, "u", "kitchen", "tired")) == []


def test_record_signals_db_none_returns_empty():
    assert _run(sm.record_signals(None, "u", "body", "tired")) == []


def test_quiet_knowledge_excludes_current_room():
    db = FakeDB()
    uid = "u-cross"
    _run(sm.record_signals(db, uid, "body", "I am exhausted"))
    _run(sm.record_signals(db, uid, "parents", "my child is screaming"))
    out_parents = _run(sm.quiet_knowledge(db, uid, "parents", limit=10))
    rooms = {t["last_source_room"] for t in out_parents}
    assert "parents" not in rooms
    out_body = _run(sm.quiet_knowledge(db, uid, "body", limit=10))
    rooms_body = {t["last_source_room"] for t in out_body}
    assert "body" not in rooms_body


def test_render_prompt_block_returns_none_for_empty():
    assert sm.render_prompt_block([]) is None


def test_render_prompt_block_warns_against_quoting():
    db = FakeDB()
    uid = "u-render"
    _run(sm.record_signals(db, uid, "body", "I am tired"))
    tags = _run(sm.quiet_knowledge(db, uid, "parents", limit=5))
    block = sm.render_prompt_block(tags)
    assert block is not None
    assert "do not quote back" in block.lower() or "never" in block.lower()
    assert "tiredness" in block


def test_ensure_indexes_does_not_raise():
    db = FakeDB()
    _run(sm.ensure_indexes(db))
