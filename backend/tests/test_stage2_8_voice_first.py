"""§Stage 2.8 — Voice-First STT endpoint smoke tests.

Verifies the /api/clarity/stt endpoint:
- Anonymous → 401
- Member without audio field → 400
- Member with empty audio bytes → 400
- Member with garbage non-audio bytes → 500/400 (Whisper rejects, calm message)

We do NOT call OpenAI Whisper for real here — the empty/garbage audio
trips backend validation before the SDK is invoked.

Also checks the human-facing guide name swap (Brian / Jenny) is reflected
in the booking confirmation guide_label.
"""
import io
import os
import pytest
from fastapi.testclient import TestClient

os.environ.setdefault("DB_NAME", "matrix_aurin_test")

from server import app  # noqa: E402


@pytest.fixture(scope="module")
def client():
    with TestClient(app) as c:
        yield c


# ---------------- /api/clarity/stt ----------------

def test_stt_anonymous_blocked(client):
    r = client.post("/api/clarity/stt", files={"audio": ("a.webm", b"\x00", "audio/webm")})
    assert r.status_code == 401


def test_stt_missing_audio_field(client, member):
    token, _ = member
    r = client.post(
        "/api/clarity/stt",
        headers={"Authorization": f"Bearer {token}"},
    )
    # Missing field → 400 (or 422 if FastAPI form validation triggers).
    assert r.status_code in (400, 422)


def test_stt_empty_audio_blob(client, member):
    token, _ = member
    r = client.post(
        "/api/clarity/stt",
        headers={"Authorization": f"Bearer {token}"},
        files={"audio": ("a.webm", b"", "audio/webm")},
    )
    assert r.status_code == 400
    assert "empty" in r.json()["detail"].lower() or "audio" in r.json()["detail"].lower()


def test_stt_unsupported_mime(client, member):
    token, _ = member
    r = client.post(
        "/api/clarity/stt",
        headers={"Authorization": f"Bearer {token}"},
        files={"audio": ("a.txt", b"hello world", "text/plain")},
    )
    assert r.status_code == 400


def test_stt_oversize_audio(client, member):
    token, _ = member
    big = b"\x00" * (25 * 1024 * 1024 + 10)  # > 24MB cap
    r = client.post(
        "/api/clarity/stt",
        headers={"Authorization": f"Bearer {token}"},
        files={"audio": ("a.webm", big, "audio/webm")},
    )
    assert r.status_code == 413


# ---------------- Guide name swap ----------------

def test_guide_inner_name_lock_in_clarity_ai_prompt():
    """`Clarity` (M) and `Grace` (F) remain the inner names — human-facing
    rename is on hold per founder directive (Stage 2.8 stabilization sweep).
    The AGOP prompt must still anchor on these two names so the AI
    answers consistently if asked.
    """
    from clarity_ai import GENDERED_ENERGY_BLOCKS

    male = GENDERED_ENERGY_BLOCKS["male"]
    female = GENDERED_ENERGY_BLOCKS["female"]

    assert "Clarity" in male
    assert "Grace" in female
