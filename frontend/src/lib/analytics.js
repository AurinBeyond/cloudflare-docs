/**
 * analytics.js — Google Analytics 4 (GA4) initialiser + event helpers.
 *
 * §GA4 2026-02-11 — Founder directive. Measurement ID is read from
 *   `REACT_APP_GA4_ID` env var (currently `G-7E9R7QLP0C`). If the env
 *   var is absent, this module is a no-op — safe for dev / staging /
 *   any environment without analytics configured.
 *
 *   Why we wire it in JS rather than baking the snippet into
 *   `public/index.html`:
 *     - env-var-driven (no hardcoded ID in source)
 *     - same module exports `trackEvent()` so React components
 *       (Compass arms, etc.) can emit named events
 *     - script injection is idempotent — even if React StrictMode
 *       double-invokes, we only ever add one <script> to the page
 *
 *   What we DO track (Phase 1 of the Go-to-Market plan):
 *     - default GA4 page-views (automatic via gtag config)
 *     - `compass_arm_click` with cardinal label (which heading drew
 *       the click)
 *     - `waitlist_submit_attempt` with cardinal slug
 *   What we deliberately do NOT track:
 *     - any PII (no emails, no names, no user_ids in event params)
 *     - any chat content (Clarity / Body / Parents / Course rooms
 *       are private by design)
 */

const GA4_ID = process.env.REACT_APP_GA4_ID;
let initialised = false;

/**
 * Initialise GA4. Called once from App.js on mount. Safe to call
 * multiple times — the script only loads once.
 */
export function initAnalytics() {
  if (initialised) return;
  if (!GA4_ID) {
    // No measurement ID configured — silently skip.
    return;
  }
  if (typeof window === "undefined" || typeof document === "undefined") {
    return;
  }

  // 1. Bootstrap the dataLayer + gtag() function exactly as Google's
  //    canonical snippet does. Doing this BEFORE injecting the loader
  //    script means any events queued during page-load are flushed
  //    once gtag.js finishes downloading.
  window.dataLayer = window.dataLayer || [];
  function gtag() {
    // eslint-disable-next-line prefer-rest-params
    window.dataLayer.push(arguments);
  }
  // Expose on window so the rest of the module can use it.
  window.gtag = gtag;

  gtag("js", new Date());
  gtag("config", GA4_ID, {
    // We do not need IP anonymisation flag in GA4 — it's the default
    // behaviour. Adding it here as defensive documentation.
    anonymize_ip: true,
    // Suppress the automatic page_view because BrowserRouter inside
    // React handles navigation client-side. We emit page_view manually
    // on route change in App.js if/when we need that resolution.
    send_page_view: true,
  });

  // 2. Inject the loader script once.
  const existing = document.querySelector(
    `script[src*="googletagmanager.com/gtag/js"]`,
  );
  if (!existing) {
    const s = document.createElement("script");
    s.async = true;
    s.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(GA4_ID)}`;
    document.head.appendChild(s);
  }

  initialised = true;
}

/**
 * Emit a named GA4 event. Silently no-ops if GA4 is not configured.
 *
 * Usage:
 *   trackEvent("compass_arm_click", { cardinal: "east", degrees: 90 });
 *   trackEvent("waitlist_submit_attempt", { slug: "compass-parents-room" });
 */
export function trackEvent(name, params = {}) {
  if (!GA4_ID) return;
  if (typeof window === "undefined" || typeof window.gtag !== "function") {
    return;
  }
  try {
    window.gtag("event", name, params);
  } catch {
    // Analytics must never break the app. Swallow.
  }
}
