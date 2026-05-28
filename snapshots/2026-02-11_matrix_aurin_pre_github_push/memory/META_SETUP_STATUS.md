# Meta Setup — Live Status Tracker

**Started:** 2026-02-08
**Anna's goal:** Have technical foundation ready before LemonSqueezy approval lands.

---

## ✅ FAAS 1 — Business Manager

- [ ] Business Manager loodud
- [ ] Business name set (Pure Soul Life / Matrix Aurin)
- [ ] 2FA active (TOTP app, mitte SMS)
- [ ] Admin role set
- [ ] Payment method added

## ✅ FAAS 2 — Domain Verification

- [ ] PRIMARY domain decided: ___________ (puresoul.life / matrixaurin.com)
- [ ] DNS provider identified: ___________ (Cloudflare / Zone.ee / GoDaddy / …)
- [ ] TXT record added in DNS panel
- [ ] Meta "Verify" clicked
- [ ] Verification confirmed ✓ (kuni 24h)

## ✅ FAAS 3 — Pixel + CAPI

- [ ] Pixel created (`prulesoul-main`)
- [ ] Pixel ID copied: ___________
- [ ] CAPI Access Token generated: ___________
- [ ] Token saved securely (1Password / Bitwarden)

## ✅ FAAS 4 — AEM 8 Events Priority

- [ ] Saved in this exact order:
  1. Purchase
  2. InitiateCheckout
  3. Lead
  4. ViewContent
  5. AddToCart
  6. CompleteRegistration
  7. Custom: GiftSent
  8. PageView
- [ ] 24h elapsed after save

## ✅ FAAS 5 — Custom Conversions

- [ ] Purchase — 30min Pass ($39) created
- [ ] Purchase — 60min Pass ($59) created
- [ ] Purchase — 90min Pass ($99) created
- [ ] (Optional) Quiet Voice — 15min ($12) created — only if Anna approves the new product

## ✅ FAAS 6 — Test Events Tool

- [ ] Test Event Code generated: ___________
- [ ] Test $1 LemonSqueezy variant created
- [ ] Test purchase fired
- [ ] Both Pixel + CAPI showing in Test Events (dedup OK)
- [ ] Match Quality: Excellent / Good

## ✅ FAAS 7 — Custom Audiences

- [ ] Website — All visitors (180d)
- [ ] Website — Story World visitors (180d)
- [ ] Website — Pricing viewers (180d)
- [ ] Website — Purchasers (180d)

## ✅ FAAS 8 — Ad Account

- [ ] Currency: **EUR** (locked)
- [ ] Timezone: **Europe/Tallinn** (locked)
- [ ] Account name: `puresoul-main-ads`
- [ ] Monthly spending limit: €500 (safety cap, raise later)
- [ ] Pixel connected to ad account

## ✅ FAAS 9 — Privacy & GDPR

- [ ] DPO listed
- [ ] LDU (Limited Data Use) flag verified active
- [ ] Privacy policy URL set
- [ ] Privacy policy mentions "Meta Conversions API server-side processing"

## ✅ FAAS 10 — Madgicx

- [ ] Madgicx account created (14-day trial)
- [ ] Meta Ad Account connected
- [ ] Pixel connected
- [ ] CAPI events visible in Madgicx
- [ ] ALL automation rules set to "Notify only" for first 14 days

---

## What Anna sends to dev (agent) when ready:

```
PIXEL_ID=
CAPI_ACCESS_TOKEN=
TEST_EVENT_CODE=        # temporary, dev only
PRIMARY_DOMAIN=         # puresoul.life vs matrixaurin.com
LEMONSQUEEZY_VARIANTS=  # IDs for $39 / $59 / $99 (and $12 if Quiet Voice approved)
```

---

## Dev-side preparation (what the agent does in parallel)

- [ ] GDPR consent banner skeleton (waiting for "go" signal)
- [ ] `.env` slots reserved (`META_PIXEL_ID`, `META_CAPI_ACCESS_TOKEN`, `META_TEST_EVENT_CODE`, `META_LDU_DEFAULT`)
- [ ] LemonSqueezy webhook → CAPI Purchase event hook (waiting for keys)
- [ ] Frontend Pixel JS injection (waiting for Pixel ID)
- [ ] event_id deduplication strategy (UUID per checkout, shared Pixel↔CAPI)
- [ ] Hash helpers (SHA-256 for email/phone before sending to CAPI)
- [ ] LDU fallback logic (consent=denied → only event_name+value+currency+event_id+LDU flag)

---

## Decisions still open

- [ ] Currency: **EUR** (agent's recommendation, EU founder) or USD (GPT's outdated advice)?
- [ ] Timezone: **Europe/Tallinn** (agent's recommendation) or US Pacific (GPT's myth)?
- [ ] Primary domain: puresoul.life or matrixaurin.com?
- [ ] DNS host: ?
- [ ] Voice-Only Minute Pack: build new $12 / 15-min product? (agent recommendation: YES — self-liquidating offer)
