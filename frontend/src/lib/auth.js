/**
 * §AUDIT-P2 2026-05-20 — Centralised session-token storage.
 *
 * Before this module, 8+ files duplicated `const TOKEN_KEY = "aurin_session_token"`
 * and inlined `localStorage.getItem(...)`. A future rename would have
 * required hunting 8 places — invariably one would be missed, leaving
 * one room "signed-in" while the rest claimed "guest". This module is
 * the SINGLE source of truth.
 *
 * Surface is intentionally tiny:
 *   - SESSION_TOKEN_KEY  (the literal string key, exported only for
 *                         debug/tests; do NOT use directly).
 *   - getSessionToken()  → string | null
 *   - setSessionToken(v) → void   (pass null to clear)
 *
 * Safe under SSR / private-mode (try/catch around localStorage).
 */
export const SESSION_TOKEN_KEY = "aurin_session_token";

export function setSessionToken(token) {
  if (typeof window === "undefined") return;
  try {
    if (token) {
      window.localStorage.setItem(SESSION_TOKEN_KEY, token);
    } else {
      window.localStorage.removeItem(SESSION_TOKEN_KEY);
    }
  } catch {
    /* private-mode / quota-exceeded — safe to ignore */
  }
}

export function getSessionToken() {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(SESSION_TOKEN_KEY);
  } catch {
    return null;
  }
}
