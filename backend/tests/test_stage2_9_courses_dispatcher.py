"""§Stage 2.9 — Courses daily-letter dispatcher.

Verifies:
- `_render_course_letter_email()` produces sane (subject, html, text).
- `_course_letter_send_one()` honours every branch:
    * not_yet (day not unlocked yet)
    * idempotency (already_sent guard)
    * unsubscribe pause
    * resend_not_configured soft-skip
    * happy path (advances day_sent + writes course_letter_sends)
    * marks completed=True on the final letter
    * skipped for unknown course slug

Resend calls are mocked at module level to avoid burning real emails.
We use a small synchronous wrapper (`run`) because the project does
not depend on pytest-asyncio.
"""
import asyncio
import os
from datetime import datetime, timedelta, timezone
from unittest.mock import patch, AsyncMock

import pytest

os.environ.setdefault("DB_NAME", "matrix_aurin_test")

from server import (  # noqa: E402
    _render_course_letter_email,
    _course_letter_send_one,
    _course_by_slug,
    db as server_db,
)


def run(coro):
    """Tiny sync wrapper for async test bodies."""
    return asyncio.get_event_loop().run_until_complete(coro)


# ---------- _render_course_letter_email ----------

def test_render_letter_returns_subject_html_text():
    course = _course_by_slug("letting-the-old-stories-rest")
    assert course is not None
    subject, html, text = _render_course_letter_email(course, 1)
    assert "Day 1" in subject
    assert "Letting the old stories rest" in subject
    assert "<p>" in html
    assert "Day 1 of 7" in html
    assert "— Aurin" in text


def test_render_letter_raises_for_missing_day():
    course = _course_by_slug("letting-the-old-stories-rest")
    with pytest.raises(ValueError):
        _render_course_letter_email(course, 99)


# ---------- _course_letter_send_one ----------

def test_send_skipped_when_resend_not_configured():
    enrollment = {
        "id": "test-1",
        "user_id": "u1",
        "course_slug": "letting-the-old-stories-rest",
        "started_at": datetime.now(timezone.utc).isoformat(),
        "day_sent": 0,
    }
    with patch("email_service.is_configured", return_value=False):
        r = run(_course_letter_send_one(enrollment))
    assert r["status"] == "skipped"
    assert r["reason"] == "resend_not_configured"


def test_send_not_yet_when_day_locked():
    enrollment = {
        "id": "test-2",
        "user_id": "u2",
        "course_slug": "letting-the-old-stories-rest",
        "started_at": datetime.now(timezone.utc).isoformat(),
        "day_sent": 1,
    }
    sender = AsyncMock()
    with patch("email_service.is_configured", return_value=True), \
         patch("email_service.send_email", new=sender):
        r = run(_course_letter_send_one(enrollment))
    assert r["status"] == "not_yet"
    assert r["day"] == 2
    sender.assert_not_called()


def test_send_skipped_for_unknown_course():
    enrollment = {
        "id": "test-3",
        "user_id": "u3",
        "course_slug": "this-course-does-not-exist",
        "started_at": datetime.now(timezone.utc).isoformat(),
        "day_sent": 0,
    }
    with patch("email_service.is_configured", return_value=True):
        r = run(_course_letter_send_one(enrollment))
    assert r["status"] == "skipped"
    assert r["reason"] == "course_not_found"


def test_send_happy_path_advances_state():
    user_id = "test-u-2_9"
    enroll_id = "test-en-2_9"
    started_at = (datetime.now(timezone.utc) - timedelta(days=2)).isoformat()
    run(server_db.users.insert_one({"user_id": user_id, "email": "stage29-test@example.com"}))
    run(server_db.course_enrollments.insert_one({
        "id": enroll_id, "user_id": user_id,
        "course_slug": "letting-the-old-stories-rest",
        "started_at": started_at, "day_sent": 0,
    }))
    try:
        sender = AsyncMock(return_value={"id": "fake"})
        with patch("email_service.is_configured", return_value=True), \
             patch("email_service.send_email", new=sender):
            enrollment = run(server_db.course_enrollments.find_one({"id": enroll_id}, {"_id": 0}))
            r = run(_course_letter_send_one(enrollment))

        assert r["status"] == "sent", r
        assert r["day"] == 1
        assert r["completed"] is False
        sender.assert_called_once()
        updated = run(server_db.course_enrollments.find_one({"id": enroll_id}, {"_id": 0}))
        assert updated["day_sent"] == 1
        record = run(server_db.course_letter_sends.find_one({
            "user_id": user_id, "course_slug": "letting-the-old-stories-rest", "day": 1,
        }, {"_id": 0}))
        assert record is not None
    finally:
        run(server_db.users.delete_one({"user_id": user_id}))
        run(server_db.course_enrollments.delete_one({"id": enroll_id}))
        run(server_db.course_letter_sends.delete_many({"user_id": user_id}))


def test_send_idempotent_when_already_sent():
    user_id = "test-u-idem"
    enroll_id = "test-en-idem"
    started_at = (datetime.now(timezone.utc) - timedelta(days=1)).isoformat()
    run(server_db.users.insert_one({"user_id": user_id, "email": "idem@example.com"}))
    run(server_db.course_enrollments.insert_one({
        "id": enroll_id, "user_id": user_id,
        "course_slug": "letting-the-old-stories-rest",
        "started_at": started_at, "day_sent": 0,
    }))
    run(server_db.course_letter_sends.insert_one({
        "id": "prev-send",
        "user_id": user_id,
        "course_slug": "letting-the-old-stories-rest",
        "day": 1, "sent_at": started_at,
        "email": "idem@example.com",
    }))
    try:
        sender = AsyncMock()
        with patch("email_service.is_configured", return_value=True), \
             patch("email_service.send_email", new=sender):
            enrollment = run(server_db.course_enrollments.find_one({"id": enroll_id}, {"_id": 0}))
            r = run(_course_letter_send_one(enrollment))
        assert r["status"] == "already_sent"
        assert r["day"] == 1
        sender.assert_not_called()
    finally:
        run(server_db.users.delete_one({"user_id": user_id}))
        run(server_db.course_enrollments.delete_one({"id": enroll_id}))
        run(server_db.course_letter_sends.delete_many({"user_id": user_id}))


def test_send_pauses_when_unsubscribed():
    user_id = "test-u-unsub"
    enroll_id = "test-en-unsub"
    email = "unsub-stage29@example.com"
    started_at = (datetime.now(timezone.utc) - timedelta(days=1)).isoformat()
    run(server_db.users.insert_one({"user_id": user_id, "email": email}))
    run(server_db.course_enrollments.insert_one({
        "id": enroll_id, "user_id": user_id,
        "course_slug": "letting-the-old-stories-rest",
        "started_at": started_at, "day_sent": 0,
    }))
    run(server_db.email_unsubscribes.insert_one({"email": email}))
    try:
        sender = AsyncMock()
        with patch("email_service.is_configured", return_value=True), \
             patch("email_service.send_email", new=sender):
            enrollment = run(server_db.course_enrollments.find_one({"id": enroll_id}, {"_id": 0}))
            r = run(_course_letter_send_one(enrollment))
        assert r["status"] == "skipped"
        assert r["reason"] == "unsubscribed"
        sender.assert_not_called()
        updated = run(server_db.course_enrollments.find_one({"id": enroll_id}, {"_id": 0}))
        assert updated.get("paused") is True
        assert updated.get("paused_reason") == "unsubscribed"
    finally:
        run(server_db.users.delete_one({"user_id": user_id}))
        run(server_db.course_enrollments.delete_one({"id": enroll_id}))
        run(server_db.email_unsubscribes.delete_one({"email": email}))


def test_send_marks_completed_after_last_letter():
    user_id = "test-u-final"
    enroll_id = "test-en-final"
    started_at = (datetime.now(timezone.utc) - timedelta(days=8)).isoformat()
    run(server_db.users.insert_one({"user_id": user_id, "email": "final@example.com"}))
    run(server_db.course_enrollments.insert_one({
        "id": enroll_id, "user_id": user_id,
        "course_slug": "letting-the-old-stories-rest",
        "started_at": started_at, "day_sent": 6,
    }))
    try:
        with patch("email_service.is_configured", return_value=True), \
             patch("email_service.send_email", new=AsyncMock(return_value={"id": "x"})):
            enrollment = run(server_db.course_enrollments.find_one({"id": enroll_id}, {"_id": 0}))
            r = run(_course_letter_send_one(enrollment))
        assert r["status"] == "sent"
        assert r["day"] == 7
        assert r["completed"] is True
        updated = run(server_db.course_enrollments.find_one({"id": enroll_id}, {"_id": 0}))
        assert updated["completed"] is True
    finally:
        run(server_db.users.delete_one({"user_id": user_id}))
        run(server_db.course_enrollments.delete_one({"id": enroll_id}))
        run(server_db.course_letter_sends.delete_many({"user_id": user_id}))
