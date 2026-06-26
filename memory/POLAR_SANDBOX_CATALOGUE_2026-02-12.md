# Polar Catalogue · v2.3.1 · Sandbox Build Complete

**Status:** 🟢 26/26 SKUs created in Polar sandbox (organisation
`a517d659-5f9d-46da-989b-ef1ff7b2ff21`)
**Date:** 2026-02-12
**Source:** `/app/backend/scripts/create_polar_products.py`
**Map artifact:** `/app/backend/polar_sku_map.json`

---

## Sprint A complete — what is now live in Polar sandbox

| SKU | Polar product ID | EUR price |
|-----|------------------|----------:|
| quiet.entry.month            | 6bf54659-f36c-4c4a-b0e8-a2340a269aee |   €89 |
| quiet.entry.quarter          | 1e8b895d-08a8-4988-beba-94c75ab7bc11 |  €239 |
| quiet.entry.year             | 41277732-266b-4520-be53-926c81441cd7 |  €890 |
| aurin.storyteller.month      | 18d23eb7-ec9b-450b-8b6d-2b60cd6f40bb |   €79 |
| aurin.storyteller.quarter    | a8834e85-2847-4e99-a367-d9984ede280a |  €209 |
| aurin.storyteller.year       | fb9f5a16-db37-4d18-ad90-62a15d93ce31 |  €790 |
| inner.compass.month          | dad525f4-a63c-4646-a136-3706c6aa5b36 |  €229 |
| inner.compass.quarter        | f065c395-ac41-4e30-a8a0-b97d4e78131f |  €619 |
| inner.compass.year           | 193b554c-643c-457a-b727-34ae6ab1f226 | €2,290 |
| house.compass.month      | ef09715e-1654-4f6f-afb4-87578da3cbd8 |  €329 |
| house.compass.quarter    | 3675828e-c40d-4967-af35-3eef2f1157f1 |  €889 |
| house.compass.year       | b35e6300-8ace-42ba-a0f0-ce50f3928f15 | €3,290 |
| sovereign.standard.quarter   | a73fdba9-4231-414f-b8e2-11115e43e548 | €1,890 |
| sovereign.standard.year      | 3c4f78c2-6171-4c18-ae17-a246159f5bef | €6,800 |
| sovereign.bespoke.quarter    | 00439402-d539-4111-bca1-70059b5e8a3e | €3,490 |
| sovereign.bespoke.year       | 3804c798-3cba-4c64-8f32-b8843376e3b3 | €12,500 |
| access.day.kids              | a2156844-285e-4008-92fd-a70dc3175579 |   €25 |
| access.day.quiet             | af998d19-a628-4128-8f54-e3ea0e3ef907 |   €49 |
| access.day.deep              | df3738c6-e251-4947-bbeb-a46cc1c5efe7 |   €89 |
| topup.compass.30             | 22ccb8da-6c80-49e8-9a7c-b306b7acb4d8 |   €49 |
| topup.compass.120            | 63c7543f-d527-400b-bbc3-d6153f67259e |  €159 |
| topup.compass.300            | 657f5d5c-778e-448c-a916-1067d542ea81 |  €399 |
| topup.aurin.20               | f82d5159-e647-4b2d-a470-6f625e85f8ba |   €29 |
| topup.aurin.60               | 3c747d0a-5300-4530-8465-b4af09d048a5 |   €79 |
| topup.aurin.150              | 07246a6d-f2ed-45b8-82c8-2ea108ae836d |  €169 |
| topup.daypass.30             | 86fd5e01-b0e8-4acf-847c-57a4168858c6 |   €40 |

---

## Lessons learned (recorded for future Polar work)

1. **Currency must be lowercase** — Polar enum accepts `eur`, not `EUR`.
2. **Do not pass `organization_id` in product create body** when using
   an Organization Access Token (OAT). The OAT implicitly scopes to
   the org; passing org_id triggers `organization_token` validation
   error.
3. **Each product must include a price in the org's default presentment
   currency** (sandbox default = USD). We add a USD price alongside
   every EUR price; Polar Checkout displays the price in the
   customer's IP-derived currency automatically.
4. **Sandbox rate limit is 100 req/min** — script paces creates at
   0.7 s intervals to stay under the ceiling.
5. **Trailing-slash redirects** — Polar API redirects `/organizations`
   → `/organizations/`; the client uses `follow_redirects=True`.

---

## Founder dashboard verification

Anna can confirm all 26 SKUs are visible at **sandbox.polar.sh → Products**
in the auto-detected organisation (slug `824770492`). Each product shows
both USD and EUR prices; descriptions follow brand voice (no SaaS
register).

---

## What's left for Sprint B (webhook + voice gateway)

1. `/api/billing/polar/webhook` — HMAC verify + idempotency
2. `services/credit_ledger.py` — SKU-namespaced atomic spend
3. `/api/voice/transmit` — adult-voice atomic gateway
4. `/api/kids/fairytale-session` — Aurin-voice atomic gateway
5. `/api/billing/checkout/session` — frontend kutsutav checkout creator
6. Day-pass JWT flow (24h TTL)
7. End-to-end smoke test with founder's own test card
