/**
 * browserMemory.js — §HYBRID MEMORY (iter 59) frontend helper.
 *
 * The Matrix Aurin Cabinet stores the wanderer's last few sentences
 * locally in `localStorage`. On the next visit (same device, same
 * browser), these fragments are replayed to the backend as
 * `transient_context` at /cabinet/start, so the mentor has a soft
 * sense of where the previous walk left off — without spending any
 * Claude tokens on a server-side summary.
 *
 * Privacy contract:
 *   • Stored on the wanderer's device only. Never sent to anyone but
 *     the wanderer's own /cabinet/start call.
 *   • Cleared on Cabinet Clear, on Sign Out, or by browser settings.
 *   • Capped at MAX_FRAGMENTS most-recent entries × MAX_LEN chars.
 *
 * For "Eternal Thread" (server-side mentor's notes), see the paid
 * `save_threads` toggle in clarity/prefs.
 */

const KEY = "aurin_browser_memory_v1";
const MAX_FRAGMENTS = 6;
const MAX_LEN = 240;

function safeRead() {
  try {
    if (typeof window === "undefined") return null;
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return null;
    return parsed;
  } catch {
    return null;
  }
}

function safeWrite(obj) {
  try {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(KEY, JSON.stringify(obj));
  } catch {
    /* storage may be disabled / quota hit — silent */
  }
}

/** Read the wanderer's stored fragments + meta. */
export function getBrowserMemory() {
  const m = safeRead();
  if (!m) {
    return {
      fragments: [],
      last_visit_at: null,
      visit_count: 0,
    };
  }
  return {
    fragments: Array.isArray(m.fragments) ? m.fragments : [],
    last_visit_at: m.last_visit_at || null,
    visit_count: m.visit_count || 0,
  };
}

/** Append a single user-line fragment (one sentence the wanderer just said). */
export function appendBrowserFragment(fragment) {
  if (!fragment || typeof fragment !== "string") return;
  const cleaned = fragment.trim().slice(0, MAX_LEN);
  if (!cleaned) return;
  const cur = safeRead() || { fragments: [], visit_count: 0 };
  const next = Array.isArray(cur.fragments) ? [...cur.fragments] : [];
  next.push(cleaned);
  while (next.length > MAX_FRAGMENTS) next.shift();
  safeWrite({
    ...cur,
    fragments: next,
    last_visit_at: new Date().toISOString(),
  });
}

/** Increment the lightweight visit counter (called once per session-open). */
export function markBrowserVisit() {
  const cur = safeRead() || { fragments: [], visit_count: 0 };
  safeWrite({
    ...cur,
    last_visit_at: new Date().toISOString(),
    visit_count: (cur.visit_count || 0) + 1,
  });
}

/** Wipe the wanderer's local memory completely. */
export function clearBrowserMemory() {
  try {
    if (typeof window === "undefined") return;
    window.localStorage.removeItem(KEY);
  } catch {
    /* noop */
  }
}
