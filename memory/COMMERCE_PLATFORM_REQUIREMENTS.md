# Requirements for an AI-managed commerce platform
### Aurin technical spec · 2026-07-01

> *This is a comparison sheet, not a constitution. Its purpose: to make
> the next commerce-platform decision reproducible instead of shopping
> vendor-by-vendor.*

## The one need in one sentence

Aurin's founder writes a product specification in plain text; an
AI agent turns that specification into a fully listed, purchasable
product without any manual UI clicking.

## Non-negotiable requirements

| # | Requirement | Why |
|---|---|---|
| R1 | **Product create/update/delete via API** | The whole reason to move |
| R2 | **Digital delivery** (PDFs, audio, session tokens) | Aurin sells no physical goods |
| R3 | **Recurring subscriptions** | Monthly / Annual Access |
| R4 | **One-time purchases** | Day Pass, books, voice packs |
| R5 | **International payments (EU + global)** | Aurin has readers everywhere |
| R6 | **EU VAT handled** (own MoR *or* clean Avalara integration) | Anna is Estonian ENK/OÜ |
| R7 | **Webhooks** for fulfillment | Aurin's backend grants access/minutes |
| R8 | **Well-documented developer API** | Anna is not shopping for a service; she is shopping for a partner-in-code |
| R9 | **Does not blanket-reject "AI + wellness" mixes** | Five MoR rejections say enough |
| R10 | **Sane fees** (< 8% end-to-end after payment + platform) | Aurin's margins already tight on voice minutes |

## Desired (not blocking)

- Image/file upload via API
- Category taxonomy via API (adult / kids segregation without hacks)
- SEO fields on the product page
- Multi-currency display
- Product variants

## Explicitly NOT required

- Physical shipping, tax label printing, warehouse tools — Aurin will never need these
- Point-of-sale hardware
- Wholesale / B2B tiers

## First-round candidates (to be compared against the checklist above)

| Platform | Model | R1 API | R6 VAT | R9 AI-friendly | Notes |
|---|---|---|---|---|---|
| **Gumroad** | MoR | ⚠️ limited | ✅ handled | ✅ yes so far | Currently live. Products must be entered manually. |
| **Polar** | MoR | ✅ good | ✅ handled | 🔴 rejected | Dormant in code. |
| **Lemon Squeezy** | MoR | ✅ good | ✅ handled | ⚠️ unknown risk | Same category risk as Polar |
| **Paddle** | MoR | ✅ good | ✅ handled | ⚠️ likely rejects | Same category risk |
| **Stripe** | Payment | ✅ excellent | 🟡 Avalara required | ⚠️ AI+wellness sometimes flagged | Requires OÜ; Anna is the merchant |
| **Mollie** | Payment | ✅ good | 🟡 Avalara required | 🟢 more liberal | EU-first; requires business entity |
| **Shopify + digital delivery app** | Platform + payments | ✅ mature | ✅ (Shopify Tax) | 🟢 accepts | Overkill for pure digital but rock-solid API |
| **Medusa (self-hosted) + Stripe** | Open-source platform | ✅ full control | 🟡 Avalara | ✅ (Anna is merchant) | Requires hosting; maximum API freedom |
| **Snipcart** | Embed + gateway | ✅ HTML-native | ✅ handled | 🟢 accepts | Lightweight, works with existing site |
| **Swell** | Headless commerce | ✅ full API | 🟡 external | ✅ accepts | Cleanest headless option |

## Decision rule

The winning platform is the one that scores **✅ on R1, R2, R3, R6, R7, R9**
without a hard 🔴 on any other row. Fees (R10) is the tiebreaker.

## Not a decision today

This document is a **filter**, not a choice. Anna reviews the shortlist
when the AI-managed commerce workflow becomes the priority — after
the current Gumroad restructure has produced enough real revenue data
to justify the migration.

## Status
HELD as a decision aid.
Next re-open: after Gumroad restructure completes AND Aurin has
either OÜ registered or 30+ paying visitors — whichever comes first.
