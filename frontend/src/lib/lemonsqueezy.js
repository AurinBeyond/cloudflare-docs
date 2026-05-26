// Build a LemonSqueezy checkout URL from a numeric variant ID.
// Store slug `puresoullife` is the public LS storefront subdomain
// (https://puresoullife.lemonsqueezy.com). It is fixed for this brand.
const STORE_SLUG = "puresoullife";

// §LS-AFFILIATE 2026-02-10 — If a visitor arrived via ?aff=XXX on
// any landing page, we persist it in sessionStorage. When they hit
// a checkout button we append `?aff=XXX` so LemonSqueezy's Affiliate
// Hub attributes the sale to the correct partner.
function _persistedAffiliateId() {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage?.getItem("ls_aff");
    if (raw && /^[A-Za-z0-9_-]{1,32}$/.test(raw)) return raw;
  } catch { /* noop */ }
  return null;
}

export function buildLemonCheckoutUrl(variantId) {
  if (!variantId) return null;
  const aff = _persistedAffiliateId();
  const suffix = aff ? `?aff=${encodeURIComponent(aff)}` : "";
  return `https://${STORE_SLUG}.lemonsqueezy.com/buy/${variantId}${suffix}`;
}
