# 🚀 FastSpring Quick-Entry Cheat Sheet — Phase 1 launch (5 products)

> Built 2026-02-11 for Anna's BasicStoreSite onboarding form.
> Fields below are in the **exact order** FastSpring's UI shows them.
> Copy-paste cell by cell, no thinking required.

**Company support email to use everywhere:** `contact.puresoul@proton.me`  
**Brand display name:** `Matrix Aurin`  
**Storefront URL:** `https://prulesoul.site`

---

## 1️⃣ Body Temple 28

| Field (FastSpring label)        | Value |
|---|---|
| **Product Name (display)**      | `Body Temple 28 — Reading Practice` |
| **Product SKU (internal)**      | `body-temple-28` |
| **Product type**                | One-time |
| **Price (USD)**                 | `39.00` |
| **Tax category**                | `Digital goods — Educational content` |
| **Short description**           | `A 28-day reading practice for adults. Two minutes a day, four weeks of breath, touch, rest, presence.` |
| **Long description**            | `Body Temple 28 is a calm, slow-read curriculum for adults who carry too much. No therapy claims, no medical advice — just 28 short reflections, one per day, that build a softer relationship with your own body. Lifetime access. Refundable within 14 days.` |
| **Fulfillment type**            | Digital — license key (we issue via webhook) |
| **Refund policy**               | 14 days |

---

## 2️⃣ Family Bundle 📦

| Field                           | Value |
|---|---|
| **Product Name**                | `Family Bundle — Adult + Child + Voice` |
| **SKU**                         | `bundle-family` |
| **Product type**                | One-time **bundle** (multi-grant) |
| **Price (USD)**                 | `59.00` |
| **Tax category**                | `Digital goods bundle` |
| **Short description**           | `Body Temple 28 + 60 minutes of voice companion + Kids Universe Premium. One purchase, three doors open.` |
| **Long description**            | `For the parent who wants the whole house at once. Unlocks: (1) Body Temple 28 reading practice for the grown-up, (2) 60 minutes of any voice-companion room time, (3) Kids Universe Premium — bedtime stories and quiet activities for ages 3–12. Standalone value $104. Refundable within 14 days.` |
| **Bundle contents (entitlements)** | `body-temple-28`, `voice-topup-60`, `kids-premium` |
| **Fulfillment**                 | Digital — webhook triggers 3 entitlements |
| **Refund policy**               | 14 days |

---

## 3️⃣ Voice Top-Up · 30 minutes

| Field                           | Value |
|---|---|
| **Product Name**                | `Voice Companion · 30 minutes` |
| **SKU**                         | `voice-topup-30` |
| **Product type**                | One-time (consumable) |
| **Price (EUR)**                 | `18.00` |
| **Tax category**                | `Digital service` |
| **Short description**           | `30 minutes of voice-companion time. Use it in any room: Aurin, Grace, Kaelan, Sara, Alistair.` |
| **Long description**            | `Prepaid voice-companion minutes. €0.60 per minute. Redeem against any of the five voice rooms — they share the same minute pool. Unused minutes refundable within 14 days.` |
| **Fulfillment**                 | Digital — minutes added to user wallet via webhook |
| **Refund**                      | 14 days, unused minutes only |

---

## 4️⃣ Voice Top-Up · 60 minutes ⭐

| Field                           | Value |
|---|---|
| **Product Name**                | `Voice Companion · 60 minutes` |
| **SKU**                         | `voice-topup-60` |
| **Price (EUR)**                 | `36.00` |
| **Tax category**                | `Digital service` |
| **Short description**           | `One full hour of voice-companion time. Use it in any room.` |
| **Long description**            | Same as 30-min, with "60 minutes" instead of "30". |
| **Fulfillment**                 | Digital — webhook |
| **Refund**                      | 14 days, unused minutes only |

---

## 5️⃣ Voice Top-Up · 180 minutes (premium tier)

| Field                           | Value |
|---|---|
| **Product Name**                | `Voice Companion · 3 hours` |
| **SKU**                         | `voice-topup-180` |
| **Price (EUR)**                 | `108.00` |
| **Tax category**                | `Digital service` |
| **Short description**           | `Three hours of voice-companion time across any room. For wanderers who return.` |
| **Long description**            | `180 prepaid minutes — €0.60/min, the same per-minute rate as smaller top-ups, just more headroom. Use across Aurin, Grace, Kaelan, Sara, Alistair as you wish. Refundable within 14 days on unused balance.` |
| **Fulfillment**                 | Digital — webhook |
| **Refund**                      | 14 days, unused minutes only |

---

## 📋 ANSWERS TO COMMON FASTSPRING INTAKE QUESTIONS

| Question | Answer |
|---|---|
| What does your company sell? | Digital reading material and AI-conversational reflection rooms for personal clarity. Educational/wellness category. |
| Are you a software/SaaS company? | **No.** We sell digital educational content + a voice-companion service. Not therapy, not medical. |
| Where is your business registered? | Norway (sole proprietorship). |
| Will you sell to EU customers? | Yes — FastSpring acts as merchant of record for EU VAT. |
| Estimated monthly volume year 1? | $3,000–$10,000 USD. |
| Average order value? | $36–$59. |
| Expected refund rate? | ≤4% (house tone, low buyer's remorse). |
| Chargeback rate? | <0.5%. |
| Customer support email? | `contact.puresoul@proton.me` |
| Brand website? | `https://prulesoul.site` |
| Refund window? | 14 days standard, 30 days for annual products. |

---

## ⚠️ DON'T FORGET (Phase 1 launch checklist)

1. ☐ Create the **5 products above** in FastSpring
2. ☐ Set **currency preference** = USD primary; EUR/GBP auto-converted
3. ☐ Enable **EU VAT collection** (FastSpring handles it as merchant of record)
4. ☐ Set **default refund policy** to 14 days
5. ☐ Add **`https://prulesoul.site`** as your storefront / returning URL
6. ☐ Webhook URL: `https://prulesoul.site/api/fastspring/webhook` (we wire this in after you confirm the 5 products are live)
7. ☐ Add the Matrix Aurin disclaimer to product descriptions: "Not therapy, not medical advice. Educational house content."

---

## 🎁 BONUS — Phase 2 ladder (do these AFTER the 5 above go live)

Once the 5 above are sold at least once and you're confident in the flow:
- Voice top-ups: **15-min** (€9), **90-min** (€54), **120-min** (€72)
- **Beginner's Bundle** ($29) — Body Temple 28 + 10 voice min
- **Year of Quiet** ($199) — committed-customer flagship

Phase 3 (later): individual books ($5–$13 each), monthly subscriptions, Own Room monthly.

---

*Full long-form catalogue (with all bundles, books, subscriptions, revenue mix and tax notes) lives in `/app/memory/FASTSPRING_CATALOGUE_2026-02-10.md`. This file is the trimmed-down "fill the form" version.*
