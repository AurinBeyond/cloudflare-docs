/**
 * resolveBackendUrl — single source of truth for which backend host
 * the frontend talks to at runtime.
 *
 * §AUDIT-PROD-URL 2026-05-20 — Production redeploys frequently bake
 * an outdated REACT_APP_BACKEND_URL (e.g. `aurin-hub.emergent.host`)
 * into the bundle, even though the site is served from the custom
 * domain (`prulesoul.site`). Every API call then becomes cross-
 * origin → user cookies don't ride along → users appear logged-out,
 * components that need session data crash, and the ErrorBoundary
 * shows "A quiet ripple".
 *
 * The rule:
 *   1. If the page is served from a known PUBLIC custom domain, use
 *      that domain — the backend is reachable at /api on the same
 *      host via Emergent's ingress, and cookies / Bearer tokens all
 *      stay first-party.
 *   2. Otherwise (preview tunnels, localhost), fall back to the env.
 *
 * This is intentionally tiny and runtime-only so a single redeploy
 * with the wrong env var cannot ship a broken bundle again.
 */
const CUSTOM_DOMAINS = new Set([
  "prulesoul.site",
  "www.prulesoul.site",
]);

const ENV_BACKEND = process.env.REACT_APP_BACKEND_URL || "";

function resolve() {
  try {
    if (typeof window !== "undefined" && window.location) {
      const host = window.location.hostname;
      if (CUSTOM_DOMAINS.has(host)) {
        return `${window.location.protocol}//${host}`;
      }
    }
  } catch {
    /* fall through to env */
  }
  return ENV_BACKEND;
}

export const BACKEND_URL = resolve();
