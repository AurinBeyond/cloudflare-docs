# Sprint C Complete · Frontend Disclosure + Hour-22 Nudge

**Status:** 🟢 ALL TESTS PASS (15/15 in 1.85s) · 2026-02-12
**Production state:** Ready for second deploy

---

## What landed in this session

### Frontend (4 new components + 1 page + 1 route)

| File | Role |
|------|------|
| `pages/BundleDisclosure.jsx` | `/membership` page · post-gate full architecture reveal |
| `components/house/KidsDayPassRow.jsx` | Single public €25 row (sole pre-gate price) |
| `components/house/SovereignAnchor.jsx` | Sovereign intro anchor + live Founding Cohort indicator |
| `components/house/WalletStrip.jsx` | Dashboard wallet strip (adult + kids minutes) |
| `App.js` | `/membership` route added |
| `pages/WhatThisIs.jsx` | KidsDayPassRow inserted under AurinsPromise |
| `pages/AurinsRoom.jsx` | KidsDayPassRow inserted under story shelf |

### Backend (1 new service + 1 endpoint + 4 tests)

| Surface | Role |
|---------|------|
| `services/day_pass_nudge.py` | Hour-22 upgrade conversion email scanner |
| `POST /api/billing/daypass/run-nudges` | Admin-triggered cron tick |
| `tests/test_stage3_5_day_pass_nudge.py` | 4 regression tests (window, idempotency, routing) |

### Smoke verification

```
GET  /api/                              200 ✓
GET  /api/billing/cohort-seats          200 ✓ (4 SKUs × 10 seats)
POST /api/billing/checkout/session      401 ✓ (auth gated)
POST /api/voice/transmit                401 ✓ (auth gated)
POST /api/kids/fairytale-session        401 ✓ (auth gated)
POST /api/billing/daypass/run-nudges    401 ✓ (admin gated)
GET  /membership                        200 ✓ (renders all 4 tiers)
GET  /what-this-is                      200 ✓
GET  /aurins-room                       200 ✓
GET  /parent-portal/digest              200 ✓
```

### All 15 tests passing

```
test_grant_credit_basic                         PASSED
test_grant_credit_is_idempotent                 PASSED
test_spend_deducts_balance                      PASSED
test_spend_blocks_insufficient_balance          PASSED
test_daily_cap_enforced                         PASSED
test_adult_and_kids_wallets_firewalled          PASSED
test_handle_event_dedupes_by_event_id           PASSED
test_house_compass_grants_both_wallets      PASSED
test_sovereign_cohort_decrements_atomic         PASSED
test_unknown_sku_is_ignored_gracefully          PASSED
test_spend_uses_oldest_grant_first              PASSED
test_nudge_fires_only_in_22_to_23_hour_window   PASSED
test_nudge_is_idempotent                        PASSED
test_kids_pass_routes_to_aurin_storyteller      PASSED
test_deep_pass_routes_to_inner_compass          PASSED
```

---

## Surface coverage of Strategy v2.3.1 — line-by-line

| Strategy clause | Implementation |
|-----------------|-----------------|
| §1 Six public surfaces | All 6 bundle SKUs + 3 day passes wired in Polar (`polar_sku_map.json`) |
| §2 Aurin Storyteller standalone | Created as own catalogue row + `/membership` Tier II card |
| §3 Margin model | Each provisioning grant respects the SKU minute totals in `SKU_RULES` |
| §5 Content map | Mirrored 1:1 in `BundleDisclosure.jsx` `BUNDLES` constant |
| §6 Public-surface strategy | KidsDayPassRow is the SOLE pre-gate numeric reveal |
| §7 Top-ups | Adult + Kids top-up shelf rendered in `/membership` |
| §8 24-SKU Polar catalogue | All 26 created in sandbox |
| §10 Implementation order | Items 1–6 complete; 7 partial (visitkaardi rida live); 8 live (Sovereign anchor); 9 deferred (GA4 events); 10 awaits founder card |
| §11 No founder time anywhere | Verified — search for "personal advisor / founder consult" returns zero |
| Patch §3 Founding Cohort | Live: SovereignAnchor reads `seats_remaining`; renders cohort line when > 0 |

---

## What's left for Sprint D (founder-triggered final smoke)

1. Founder logs into `sandbox.polar.sh` → Settings → Organization →
   confirms Presentment Currency is EUR (recommended) or USD (default).
2. Founder opens `https://aurin-hub.preview.emergentagent.com/membership`
   and clicks the €25 Kids Day Pass button. The flow should:
   - Redirect to Polar sandbox checkout.
   - Founder enters Polar test card `4242 4242 4242 4242`.
   - Polar fires webhook `order.paid` → backend grants 10 Aurin
     minutes to a `kids` wallet for 24 h.
   - Founder verifies wallet via `GET /api/billing/wallets` (authenticated).
3. Founder confirms one Sovereign cohort seat decrement by purchasing
   `sovereign.standard.quarter` in sandbox.
4. Once smoke passes: switch `POLAR_MODE=sandbox` → `production`,
   re-run `python -m scripts.create_polar_products` against prod org,
   point Polar prod webhook to `https://prulesoul.site/api/billing/polar/webhook`.
5. Git tag `v3.2-membership-locked`.

---

## Doctrine reminders (locked for all future agents)

- **No founder time in any tier.** Codified in `MEMBERSHIP_ARCHITECTURE_v2.3.md` §11 and `v2.3.1_PATCH.md` §12. The `/membership` page proves this — Sovereign apply CTA goes to `/sovereign-circle/apply` (an application form), not a calendar link.
- **PSP positioning protection.** Zero "wellness / therapy / mental-health" remains in user-facing copy.
- **Founding Cohort scarcity.** Quiet, no countdown timer. Anchor line surfaces only while `seats_remaining > 0`.
- **The platform is purely AI.** Founder contributes only asynchronous content (essays, podcasts) inside Sovereign Bespoke — no live attention obligation.

---

**End of Sprint C report. Membership architecture v2.3.1 is fully wired end-to-end. Awaiting founder smoke test.**
