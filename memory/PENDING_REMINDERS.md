# Anna — Pending Reminders (every 12h until done)

**Created:** 2026-02-08 (session restart)
**Rule:** Surface these reminders in every check-in until the user marks them complete.

---

## 🟡 P1 — Meta Pixel + CAPI Integration

**Goal:** Track LemonSqueezy purchases through Meta Pixel + Conversions API so Madgicx ($5/buyer) ad campaigns can optimise on real conversions.

**Blocked on (need from Anna):**
- Meta Pixel ID (numeric, from Meta Business Manager → Events Manager)
- Meta CAPI Access Token (generated under the Pixel → Settings → Conversions API)
- Domain to verify in Meta Business Manager (puresoul.life or matrixaurin.com — whichever is live)

**What the agent will build once keys are in:**
1. Frontend: Pixel JS snippet in `/app/frontend/public/index.html`, `PageView` + `Lead` (signup) + `InitiateCheckout` (LS button click).
2. Backend: CAPI `Purchase` event in `server.py` `lemonsqueezy_webhook` after a confirmed `order_created`.
3. Deduplication via `event_id` shared between Pixel and CAPI.

**Timing:** As soon as LemonSqueezy approves the store (so test purchases can fire real events).

---

## 🟡 P2 — Plan B Payment (Stripe or PayPal)

**Goal:** Backup checkout flow if LemonSqueezy approval drags.

**Need from Anna:**
- Choice: Stripe (a) / PayPal (b) / Both (c). User leaning towards "let's see when we have time".
- If Stripe: a test key is already in the pod env per platform docs — main agent will pull it. Live keys come later from Anna.
- If PayPal: PayPal Business account email + Sandbox + Live client credentials.

**What the agent will build:**
- A `/api/checkout/{provider}` endpoint that mints a session for the same three Wanderer Pass tiers currently in LemonSqueezy.
- A toggle in `/clarity-release` that picks the active provider via env var, so Anna can switch without code changes.
- Webhook handler that lands in the same `credit_ledger` flow as LemonSqueezy (idempotent by transaction id).

**Timing:** Anna said "tomorrow or the next few days, depending on time".

---

## ✅ Done this session (2026-02-08)

- About Anna page rewritten with her real text + real photo + 60s trailer + storybook intro video.
- Aurin's Story World subpage launched: 5 starter stories (Little Star, Moon Boat, Night Forest, Quiet Dragon, Aurin and the Lantern) grouped by age, with optional MP3 + PDF slots ready for future content.
- Card in Aurin's Room links to the new Story World.
- Routes registered (public, no WandererGate) so parents can browse before committing.

---

## ⚠️ Still open from previous session

- **P0** Prod STT 500 error — `OPENAI_API_KEY` missing/invalid in Emergent **Production** env panel. Anna must fix in deployment dashboard. Preview is fine.
- **P0** `FREE_VOICE_BETA=true` in preview `/app/backend/.env` — must flip to `false` before launch / production deploy.
