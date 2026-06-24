/**
 * track.js — Privacy-first visitor signal collection
 *
 * Built 2026-06-25 for the Substack soft-launch test window.
 *
 * Design lock: no third-party trackers (GA4, Meta, Mixpanel are out).
 * All beacons flow to our own /api/insights/event endpoint. Session
 * id is a short random string rotated every 12 hours, kept in
 * sessionStorage — never persisted across browser sessions, never
 * shared. We send NO ip, NO user-agent string, only a coarse
 * mobile/desktop hint so Anna can read the data without GDPR
 * paperwork.
 */

const BACKEND = process.env.REACT_APP_BACKEND_URL;
const SESSION_KEY = "aurin.session.v1";
const SOURCE_KEY = "aurin.source.v1";
const SESSION_TTL_MS = 12 * 60 * 60 * 1000; // 12 hours
const ALLOWED_SOURCES = /^[a-z0-9_-]{1,40}$/i;

function makeId() {
  // 16 base36 chars from crypto.getRandomValues — enough entropy,
  // no PII, never round-trips outside our own collector.
  const arr = new Uint8Array(10);
  (window.crypto || window.msCrypto).getRandomValues(arr);
  return Array.from(arr).map((b) => b.toString(36).padStart(2, "0")).join("").slice(0, 16);
}

/**
 * Capture the `?source=<tag>` URL param the first time a visitor lands,
 * then stash it in sessionStorage so every subsequent beacon in this
 * browsing session carries the same channel tag.
 *
 * Passive analytics only — never alters UI, routing, or content. This
 * is purely so the admin dashboard can answer "which channel sent
 * these 27 people?" without third-party trackers.
 *
 * Supports either `?source=` or `?utm_source=` (latter for habit).
 */
export function getSource() {
  try {
    const stored = sessionStorage.getItem(SOURCE_KEY);
    if (stored) return stored;
  } catch {
    /* noop */
  }

  if (typeof window === "undefined") return null;
  const params = new URLSearchParams(window.location.search || "");
  const raw =
    (params.get("source") || params.get("utm_source") || "").trim().toLowerCase();
  if (!raw || !ALLOWED_SOURCES.test(raw)) return null;

  try {
    sessionStorage.setItem(SOURCE_KEY, raw);
  } catch {
    /* private mode — beacon still fires */
  }
  return raw;
}

export function getSessionId() {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.id && parsed.created && Date.now() - parsed.created < SESSION_TTL_MS) {
        return parsed.id;
      }
    }
  } catch {
    /* noop */
  }
  const fresh = { id: makeId(), created: Date.now() };
  try {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(fresh));
  } catch {
    /* sessionStorage may be blocked in private mode — beacon still fires */
  }
  return fresh.id;
}

function device() {
  if (typeof window === "undefined") return "unknown";
  return window.innerWidth < 768 ? "mobile" : "desktop";
}

function beacon(payload) {
  if (!BACKEND) return;
  const url = `${BACKEND}/api/insights/event`;
  const body = JSON.stringify(payload);
  // sendBeacon survives navigation; falls back to fetch for safety
  if (navigator.sendBeacon) {
    try {
      const blob = new Blob([body], { type: "application/json" });
      navigator.sendBeacon(url, blob);
      return;
    } catch {
      /* fallthrough to fetch */
    }
  }
  fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
    keepalive: true,
  }).catch(() => {
    /* swallow — analytics must never break the page */
  });
}

export function track(event_type, path, meta = {}) {
  beacon({
    session_id: getSessionId(),
    event_type,
    path: path || (typeof window !== "undefined" ? window.location.pathname : "/"),
    device: device(),
    referrer: typeof document !== "undefined" ? document.referrer || null : null,
    source: getSource(),
    meta,
  });
}

export function trackPageview(path) {
  track("pageview", path);
}

export function trackCtaClick(label, path) {
  track("cta_click", path, { label });
}

export function trackIntroComplete(path) {
  track("intro_complete", path);
}

export async function submitIntake({ answer, path, note }) {
  if (!BACKEND) return { ok: false };
  try {
    const res = await fetch(`${BACKEND}/api/insights/intake`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        session_id: getSessionId(),
        answer,
        path: path || (typeof window !== "undefined" ? window.location.pathname : null),
        note: note || null,
      }),
    });
    return { ok: res.ok, status: res.status };
  } catch (err) {
    return { ok: false, error: String(err) };
  }
}
