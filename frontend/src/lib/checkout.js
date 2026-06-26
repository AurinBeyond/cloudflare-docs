/**
 * checkout.js — §POLAR-CHECKOUT 2026-02-29
 *
 * Tiny client helper for /api/billing/checkout/session.
 * Resolves a sku_code → Polar hosted checkout URL → redirects the
 * browser to it. Returns the response for callers that prefer to
 * handle the redirect themselves (e.g., open in a new tab).
 *
 * Why a helper: every pricing card, every voice top-up tile and
 * every gated feature uses the same call shape. Centralising it
 * avoids drift if Polar's response shape changes.
 */
import { BACKEND_URL } from "@/lib/backendUrl";

/**
 * Start a Polar hosted-checkout for the given internal sku_code.
 * Caller is responsible for ensuring the user is authenticated
 * (the backend returns 401 otherwise — surface this in the UI).
 *
 * @param {string} skuCode      — e.g. "access.day.pass", "journey.month"
 * @param {object} options
 * @param {string} options.successUrl — where Polar should land the
 *                                       wanderer after a successful pay.
 *                                       Defaults to /billing/welcome.
 * @param {boolean} options.redirect  — if true (default), navigate the
 *                                       current tab to the Polar URL.
 * @returns {Promise<{url: string, id: string, sku_code: string}>}
 * @throws  if backend returns non-2xx (status + body surfaced).
 */
export async function startPolarCheckout(skuCode, options = {}) {
  const { successUrl, redirect = true } = options;
  const body = { sku_code: skuCode };
  if (successUrl) body.success_url = successUrl;

  const res = await fetch(`${BACKEND_URL}/api/billing/checkout/session`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`checkout_${res.status}: ${text || res.statusText}`);
  }

  const data = await res.json();
  if (redirect && data?.url) {
    window.location.href = data.url;
  }
  return data;
}
