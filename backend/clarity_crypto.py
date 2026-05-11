"""
Clarity Release — AES-256-GCM at-rest encryption for cabinet conversation
text. Each user message is encrypted with a single server-side master key
(`CLARITY_ENCRYPTION_KEY`, base64 of 32 raw bytes). Each ciphertext carries
its own random 12-byte nonce; output is base64 of (nonce||ciphertext||tag).

Threat model:
  - Admin who can dump MongoDB sees only ciphertext.
  - Master-key access is required to decrypt — and every decrypt for a
    dispute is logged into `db.clarity_dispute_unlocks` for audit.
  - The key is never logged. If the env var is missing the helper raises
    so the API surfaces a hard 503 instead of writing plaintext.

This module does NOT touch the database. It is a pure crypto primitive.
"""
from __future__ import annotations

import base64
import os
from typing import Optional

from cryptography.hazmat.primitives.ciphers.aead import AESGCM


_KEY_ENV = "CLARITY_ENCRYPTION_KEY"
_NONCE_BYTES = 12  # AES-GCM standard


def _load_key() -> bytes:
    raw = os.environ.get(_KEY_ENV, "").strip()
    if not raw:
        raise RuntimeError(
            "CLARITY_ENCRYPTION_KEY is not set. Cannot encrypt Clarity "
            "Release conversations."
        )
    try:
        key = base64.b64decode(raw, validate=True)
    except Exception as exc:  # noqa: BLE001
        raise RuntimeError(
            "CLARITY_ENCRYPTION_KEY must be base64 of 32 raw bytes."
        ) from exc
    if len(key) != 32:
        raise RuntimeError(
            "CLARITY_ENCRYPTION_KEY must decode to exactly 32 bytes "
            "(AES-256). Got %d." % len(key)
        )
    return key


# Resolved lazily so import does not blow up at startup if .env hasn't
# loaded yet — the first encrypt/decrypt call surfaces the error instead.
_KEY: Optional[bytes] = None


def _key() -> bytes:
    global _KEY  # noqa: PLW0603
    if _KEY is None:
        _KEY = _load_key()
    return _KEY


def encrypt_text(plaintext: str) -> str:
    """AES-256-GCM encrypt a string. Output is URL-safe-ish base64."""
    if plaintext is None:
        plaintext = ""
    aes = AESGCM(_key())
    nonce = os.urandom(_NONCE_BYTES)
    ct = aes.encrypt(nonce, plaintext.encode("utf-8"), associated_data=None)
    return base64.b64encode(nonce + ct).decode("ascii")


def decrypt_text(ciphertext_b64: str) -> str:
    """Decrypt an envelope produced by `encrypt_text`. Raises on tamper."""
    if not ciphertext_b64:
        return ""
    raw = base64.b64decode(ciphertext_b64.encode("ascii"))
    if len(raw) < _NONCE_BYTES + 16:
        raise ValueError("Ciphertext too short.")
    nonce, ct = raw[:_NONCE_BYTES], raw[_NONCE_BYTES:]
    aes = AESGCM(_key())
    pt = aes.decrypt(nonce, ct, associated_data=None)
    return pt.decode("utf-8")


def is_configured() -> bool:
    """Soft check used by the /health endpoint. Does not raise."""
    try:
        _ = _key()
        return True
    except Exception:  # noqa: BLE001
        return False
