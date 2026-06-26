# §CHANGELOG — 2026-06-26 entry

## 2026-06-26 — EU Compliance Wave + Polar Live Checkout

### Backend
- **GDPR endpoints added** (`/app/backend/services/gdpr.py`)
  - `GET  /api/account/data-export`  → Art. 15 — downloadable JSON with every row tied to user_id/email.
  - `POST /api/account/delete`       → Art. 17 — requires `{"confirm":"delete-my-account"}`, sweeps users/sessions/intakes/marketing/etc., clears session cookie.
- **Polar checkout hardened**
  - Fixed `user.id` → `user.user_id` in `/api/billing/checkout/session`, `/api/billing/wallets`, `/api/voice/transmit`, `/api/kids/fairytale-session`.
  - `services/checkout.py` — guarded against RFC-6761 reserved domains (`*.guest.aurin.local`, `*.local`, etc.) so guest sessions don't choke Polar's email validator.
  - Polar internal validation messages no longer leak to client (`502 checkout_provider_error`).
- **Webhook secret rotated** — `POLAR_PRODUCTION_WEBHOOK_SECRET` = `polar_whs_w4QwxvOdOETeMH1tpTPLfEKzmizmn87NAnFQs1dCvzk` (manually created in Polar dashboard with Raw format + full event list).
- **SKU_RULES extended** in `services/billing_webhook.py` with the 8 new Access Ladder products: `access.day.pass`, `journey.month`, `companion.month`, `lantern.month`, `voice.return.30`, `voice.full.90`, `voice.season.200`, `voice.habit.500`.

### Frontend
- **K1 — AI Disclosure** (`components/RoomConvaiChat.jsx`): quiet line *"You are speaking with one of Aurin's AI keepers."* under every keeper conversation panel.
- **K4 — Kids Age Gate** (`components/KidsAgeGate.jsx`): one-time modal on `/kids-universe` and `/polarstar` asking "Are you a parent or guardian?". Adult confirmation stored in localStorage; under-18 quietly redirected to `/library`.
- **`/legal` rewritten** (`pages/Legal.jsx`): 10-section EU-compliant single-page legal:
  01 Operator · 02 What you're buying · 03 Terms of Service · 04 Refund Policy (14-day withdrawal + house promise) · 05 Privacy & GDPR (legal basis per data type, retention, rights) · 06 Cookies (essential only — no banner needed) · 07 Accessibility (WCAG 2.1 AA aim) · 08 Polarstar Kids · 09 What this is not · 10 Disputes & supervisory authority (Estonian DPA).
  Lists all 6 processors with DPA notes: Polar, ElevenLabs, Resend, MongoDB Atlas, Emergent, Plausible.
- **`/account` new** (`pages/Account.jsx`): GDPR-rights surface with identity card, "Download my data" button, and "Delete my account" flow with text-confirmation gate.
- **`/pricing` consumer-rights footer**: visible 4-bullet block at point-of-sale covering Polar MoR, 14-day withdrawal right, refund policy, auto-renewal — linked to full `/legal` sections.
- **Pricing buttons wired to Polar** (`lib/checkout.js` + `pages/Pricing.jsx`): when `LAUNCH_PAUSE` flips to false, the 4 tier CTAs and 4 voice top-up tiles start a real Polar checkout via `POST /api/billing/checkout/session`. Until then they keep the soft "Be first to know" / "Meet the keepers" copy.
- **Footer updated** (`components/layout/Footer.jsx`): linked to new legal anchors and `/account`.

### Verified end-to-end (manual + testing agent iter91)
- ✅ All 8 SKUs return real Polar hosted-checkout URLs with a guest session.
- ✅ Data export returns JSON file (`Content-Disposition: attachment`).
- ✅ Delete requires correct confirm string; sweeps DB; invalidates session (next request → 401).
- ✅ `/legal`, `/account`, `/pricing` consumer-rights block render with the documented `data-testid`s.
- ✅ `KidsAgeGate` mounts on `/kids-universe` and `/polarstar`.
- ✅ Webhook signature verification still enforced (401 without valid sig).

### Still requires human action (not codable)
1. **Rotate the exposed Polar OAT** after one successful test purchase (Polar dashboard → Settings → Tokens → Rotate). Then update `POLAR_PRODUCTION_OAT` in `/app/backend/.env`.
2. **Flip `LAUNCH_PAUSE = false`** in `/app/frontend/src/lib/launchPause.js` once the rotation is done and a real test purchase has been confirmed.
3. **One self-funded test purchase** (any tier) to verify the webhook actually grants minutes via the new SKU rules.
4. **Confirm trader name + EE jurisdiction** on `/legal` matches your actual Polar profile (or update both sides).
5. **(Optional) Cookie consent banner** — currently NOT needed because we use only essential first-party cookies + cookieless Plausible. If you later add Meta pixel / Google Ads, a consent banner becomes mandatory.
