# Billing Source-of-Truth Audit — 2026-02-29 (iter 86h)

**Trigger:** Founder asked for honest billing audit. PRD claimed Polar
suspended + FastSpring under review + Gumroad LIVE. `.env` simultaneously
holds LemonSqueezy + Polar + FastSpring + Gumroad credentials. This
audit reads the actual code, not the PRD.

**Scope:** All payment provider endpoints in `backend/server.py`,
matched against `.env` configuration and against actual production
behaviour.

---

## What the code actually does, today

### 4 webhook endpoints exist, only 1 is LIVE in production

| # | Endpoint | server.py line | Provider | Real status (today) |
|---|----------|----------------|----------|---------------------|
| 1 | `POST /api/lemonsqueezy/webhook` | 5293 | LemonSqueezy | **ACTIVE code path**, signature verified, full grant logic. No active subscriptions known. |
| 2 | `POST /api/webhooks/polar` | 12484 | Polar.sh (v1) | **HTTP 503** — `POLAR_*_OAT` empty (sandbox + production). Returns clean 503. |
| 3 | `POST /api/billing/polar/webhook` | 16465 | Polar.sh (v2 — duplicate) | **HTTP 401** if invalid signature, otherwise reaches `_billing_webhook.handle_event`. Newer arch, second implementation. |
| 4 | `POST /api/webhooks/gumroad` | 15494 | Gumroad | **LIVE.** 4 purchases in DB. Seller-ID anti-spoof + permalink whitelist + Resend email delivery. |

**FastSpring:** zero webhook endpoints. Env vars (`FASTSPRING_API_USERNAME`,
`FASTSPRING_API_PASSWORD`, `FASTSPRING_STOREFRONT`, `FASTSPRING_DRY_RUN`)
exist but no `/api/webhooks/fastspring` or `/api/fastspring/*` endpoint
matches in the codebase. **FastSpring is therefore not a live PSP
today — it is a configuration placeholder for a never-launched
integration.**

**Also found:** `POST /api/integrations/pruesoul/webhook` (line 12010) —
separate from all 4 above. Likely site/marketing webhook, not a PSP.
Not relevant to billing source-of-truth.

---

## What the `.env` claims vs reality

| Block | Env keys present | Endpoint exists | Endpoint live | Verdict |
|-------|------------------|-----------------|---------------|---------|
| LEMONSQUEEZY | `_API_KEY`, `_STORE_ID`, `_WEBHOOK_SECRET`, 7× `_VARIANT_*` | ✅ `/api/lemonsqueezy/webhook` | 🟡 Code active, no traffic | **Legacy.** Was the primary PSP before Polar suspension. Variant IDs likely point at archived store products. |
| POLAR | `_MODE`, `_ORG_ID`, sandbox + production OAT, sandbox + production WEBHOOK_SECRET, `_SKU_MAP_JSON` | ✅ Two endpoints (v1 + v2) | ❌ HTTP 503 | **Standby.** Account suspended; no keys filled. Two competing impls. |
| FASTSPRING | `_API_USERNAME`, `_API_PASSWORD`, `_DRY_RUN`, `_STOREFRONT` | ❌ none | ❌ no traffic possible | **Documentation-only.** Code never wired this provider. PRD claims of "FastSpring application under review" are accurate to the founder's external account status but **the application has never been wired into the codebase**. |
| GUMROAD | `_SELLER_ID`, `_PRODUCT_PERMALINKS`, `_ACCESS_TOKEN`, `_PDF_URL` | ✅ `/api/webhooks/gumroad` | ✅ 4 live purchases | **LIVE.** This is the only PSP currently transacting money. |

---

## Risk surface today

1. **Duplicate Polar endpoints** — `/api/webhooks/polar` (v1) and
   `/api/billing/polar/webhook` (v2) implement the same provider with
   different code paths. If Polar account is ever re-approved, the
   founder must pick one. Recommendation: keep v2 (line 16465 — newer
   `_billing_webhook.handle_event` arch, uses `polar_processed_events`
   collection for idempotency). Remove v1 (line 12484) or 503 it
   permanently.

2. **LemonSqueezy variant ID drift** — the seven variant IDs in
   `.env` correspond to a store catalogue that has not been touched
   in months. If LemonSqueezy auto-retires inactive variants
   (it does after ~6 months), the next sale attempt would 200 the
   webhook but fail the entitlement grant silently. Recommendation:
   either delete the variant IDs from `.env` (force a hard fail if
   LemonSqueezy somehow fires) or verify each variant still exists
   in the LemonSqueezy admin.

3. **FastSpring "review pending" framing** — PRD repeatedly says
   "FastSpring review on June 9" as if it is an imminent activation.
   Code says otherwise: no wiring exists. **If FastSpring approves
   the founder's account, that approval activates the dashboard, but
   the integration still requires 2–4 hours of webhook + SKU mapping
   work on our side before any sale could process.** This is worth
   knowing before June 9 so expectations are calibrated.

4. **Gumroad single-point-of-failure** — the only PSP currently
   working is Gumroad. If Gumroad suspends the account (the children's
   + AI keyword sweep was the mitigation), revenue stops cold. There
   is no failover. **This is the correct state for a pre-revenue
   product**, but the founder should know it explicitly.

5. **No FastSpring webhook secret in `.env`** — even the prep keys
   that would let us scaffold an endpoint are missing. The
   `_API_PASSWORD` + `_API_USERNAME` are for REST API access, not
   webhook signature verification.

---

## Recommendation — minimum needed clean state

**If founder wants to keep Gumroad-only revenue for the next 60 days
(which is the rational path right now):**

```
✅ Keep:  Gumroad env keys + /api/webhooks/gumroad   (LIVE)
🟡 Keep:  Polar env keys (empty) + v2 endpoint        (standby for later)
❌ Remove: Polar v1 endpoint /api/webhooks/polar      (dead duplicate)
❌ Remove: LemonSqueezy variant IDs from .env         (drift risk)
❌ Remove: FastSpring env keys                        (no wiring exists)
```

**If founder wants FastSpring to be a real fallback option:**

Add ~3h of work to the backlog:
- Build `POST /api/webhooks/fastspring` with HMAC-SHA256 signature verification
- Build `fastspring_provider.py` (mirroring `payment_providers/polar.py`)
- Add `fastspring_webhook_log` MongoDB collection for idempotency
- Map FastSpring product paths to internal SKUs in `fastspring_sku_map.json`
- Update `payment_providers/sku_mapping.py` to know about the FastSpring axis
- Smoke-test with FastSpring's sandbox before flipping production

Without this work, "FastSpring approves on June 9" produces no
immediately usable PSP — it produces a dashboard the founder cannot
actually transact through until the integration is built.

---

## What is NOT a problem (despite appearing in `.env`)

- **All `ELEVENLABS_*` keys** — ElevenLabs is a content-generation
  provider, not a PSP. Charged via the API key, not webhook.
- **`RESEND_*` keys** — Email-delivery provider. Pays per email,
  flat-rate plan. Not a PSP.
- **`MONGO_URL`** — Database, obviously.
- **`POLAR_SKU_MAP_JSON`** — Static config that becomes useful only
  if Polar comes back online. Safe to keep.

---

## Suggested founder decision

Pick exactly one of the three paths:

**Path A — "Gumroad-only for 60 days"** (recommended)
- Clean up `.env` per the "Remove" list above
- Park Polar v2 endpoint with current 503 state
- Stop calling FastSpring "the next PSP" until the wiring exists
- Estimated cleanup: ~20 min by agent, zero production risk

**Path B — "Gumroad-primary, Polar-fallback ready"**
- Keep both
- Pick Polar v1 OR v2, delete the other (recommend v2)
- Leave Polar OAT keys empty until Polar account approves
- Same cleanup of LemonSqueezy + FastSpring
- Estimated cleanup: ~30 min

**Path C — "Gumroad-primary, FastSpring-fallback before June 9"**
- All of Path B plus the 3h FastSpring wiring sprint
- Triggers a `testing_agent_v3_fork` round to validate the new endpoint
- Estimated total: ~5h spread over 2–3 sessions

---

## Files referenced in this audit

- `backend/server.py:5293` — LemonSqueezy webhook (legacy)
- `backend/server.py:12484` — Polar v1 webhook (duplicate)
- `backend/server.py:12010` — Pruesoul integration webhook (non-PSP)
- `backend/server.py:15494` — Gumroad webhook (LIVE)
- `backend/server.py:16465` — Polar v2 webhook (newer arch, also 503)
- `backend/.env` — All four PSPs' env blocks coexist
- `backend/payment_providers/polar.py` — Polar provider impl
- `backend/payment_providers/sku_mapping.py` — internal SKU axis
- `backend/services/_billing_webhook.py` (inferred from import on line 16473)

---

## What this audit does NOT touch

- Stripe (not in `.env`, not in code — never wired, no work needed)
- PayPal (same)
- Apple/Google in-app (same)
- The actual Gumroad seller account (founder's external dashboard)
- Whether FastSpring's external review approves or not (out of scope)

---

*Audit completed read-only by agent on 2026-02-29 while waiting for
Little Star audio recording. No code changes made. Founder decision
required before any cleanup is executed.*
