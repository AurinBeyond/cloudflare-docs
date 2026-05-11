/**
 * telemetry.js — fire-and-forget funnel events.
 *
 * Iter 65 stabilization: lightweight observability, NOT analytics.
 * One opaque anonymous client_id stored in localStorage. No PII.
 * Failures are silent — telemetry never breaks a wanderer's flow.
 *
 * Allowed events are enforced server-side; an unknown name returns
 * 400 and we just swallow it.
 */
const BACKEND = process.env.REACT_APP_BACKEND_URL || "";
const CID_KEY = "aurin_client_id_v1";

function getClientId() {
  try {
    if (typeof window === "undefined") return null;
    let cid = window.localStorage.getItem(CID_KEY);
    if (!cid) {
      cid = `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 12)}`;
      window.localStorage.setItem(CID_KEY, cid);
    }
    return cid;
  } catch {
    return null;
  }
}

let _lastFire = {};

export function track(eventType, opts = {}) {
  if (!BACKEND || !eventType) return;
  // De-dupe noisy repeats inside the same tab — don't post the same
  // (event, slug) more than once every 4s.
  const dedupeKey = `${eventType}|${opts.slug || ""}|${opts.room || ""}`;
  const now = Date.now();
  if (_lastFire[dedupeKey] && now - _lastFire[dedupeKey] < 4000) return;
  _lastFire[dedupeKey] = now;

  try {
    const body = JSON.stringify({
      event_type: eventType,
      client_id: getClientId(),
      room: opts.room || null,
      slug: opts.slug || null,
      meta: opts.meta || null,
    });
    if (
      typeof navigator !== "undefined" &&
      typeof navigator.sendBeacon === "function"
    ) {
      const blob = new Blob([body], { type: "application/json" });
      navigator.sendBeacon(`${BACKEND}/api/telemetry/event`, blob);
      return;
    }
    fetch(`${BACKEND}/api/telemetry/event`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
      keepalive: true,
    }).catch(() => {});
  } catch {
    /* noop — telemetry never breaks a flow */
  }
}
