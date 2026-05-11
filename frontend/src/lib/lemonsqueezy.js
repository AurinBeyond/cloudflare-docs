// Build a LemonSqueezy checkout URL from a numeric variant ID.
// Store slug `puresoullife` is the public LS storefront subdomain
// (https://puresoullife.lemonsqueezy.com). It is fixed for this brand.
const STORE_SLUG = "puresoullife";

export function buildLemonCheckoutUrl(variantId) {
  if (!variantId) return null;
  return `https://${STORE_SLUG}.lemonsqueezy.com/buy/${variantId}`;
}
