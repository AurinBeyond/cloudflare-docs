# Sprint B Complete · Polar Webhook + Voice Gateway

**Status:** 🟢 ALL TESTS PASSED · 2026-02-12
**Tests:** 11/11 in 1.10 s (`tests/test_stage3_4_sprint_b.py`)
**Source files:**
- `/app/backend/services/credit_ledger.py` — SKU-namespaced atomic wallet
- `/app/backend/services/billing_webhook.py` — HMAC verify + provisioning
- `/app/backend/services/checkout.py` — Polar hosted-checkout creator
- `/app/backend/server.py` (§POLAR-BILLING block) — endpoint wiring

---

## What is now live in `aurin-hub.preview.emergentagent.com` backend

### Public endpoints

| Verb | Path | Auth | Purpose |
|------|------|------|---------|
| POST | `/api/billing/polar/webhook`         | HMAC | Polar event receiver (verified, idempotent) |
| POST | `/api/billing/checkout/session`      | user | Create Polar hosted-checkout for a sku_code |
| GET  | `/api/billing/wallets`               | user | Adult + kids minute balances |
| POST | `/api/voice/transmit`                | user | Adult-voice atomic spend gateway |
| POST | `/api/kids/fairytale-session`        | user | Aurin-voice atomic spend gateway |
| GET  | `/api/billing/cohort-seats`          | open | Sovereign Founding Cohort remaining seats |

### Database collections introduced

| Collection | Purpose |
|------------|---------|
| `user_credits`           | SKU-namespaced grants (wallet + minutes_remaining + expires_at) |
| `audit_log`              | Append-only ledger (`credit_granted`, `credit_spent`); 7-yr retention |
| `polar_processed_events` | Idempotency log (event_id → processed_at) |
| `polar_cohort_seats`     | Founding Cohort seat counters (10 + 10 + 10 + 10) |

### Verified invariants (test-locked)

1. ✅ Grant is idempotent on `(user_id, source_payment_id, source_sku, wallet)`
2. ✅ Spending oldest-expiring grant first (FEFO order)
3. ✅ Daily cap blocks (30 min adult / 20 min kids)
4. ✅ Wallet firewall (adult cannot drain kids and vice versa)
5. ✅ Webhook dedupe (replay → `{ok: true, duplicate: true}`)
6. ✅ House Compass grants BOTH wallets in one transaction
7. ✅ Sovereign cohort seat decrement is atomic + `cohort: "founding"` is stamped on the grant only when seats remain
8. ✅ Unknown SKU codes are ignored gracefully (no crash, no garbage grants)

---

## Smoke checks against the deployed backend

```
curl /api/                              → 200 {service: matrix-aurin}
curl /api/billing/cohort-seats          → 200 {sovereign_cohorts: [4 SKUs, 10 seats each]}
curl POST /api/billing/polar/webhook    → 401 invalid_signature (HMAC active)
```

---

## What remains for Sprint C (frontend + final smoke)

1. Frontend `<KidsDayPassRow>` component for each visitkaardi (intro)
   page — single discreet line *"A quiet bedtime passage for children
   — from €25."* with a CTA that calls `/api/billing/checkout/session`
   with `sku_code: "access.day.kids"`.
2. Sovereign intro page anchor + Founding Cohort line that reads
   `seats_remaining` from `/api/billing/cohort-seats`.
3. Bundle disclosure page (post-gate) listing all four recurring
   bundles + day-passes with Polar checkout buttons.
4. Wallet/minutes UI on the dashboard (reads `/api/billing/wallets`).
5. Day-pass JWT TTL helper (hour-22 upgrade nudge via Resend).
6. End-to-end smoke test with Anna's real test card on the sandbox
   Polar org.
7. Switch `POLAR_MODE=production` once Anna has confirmed the sandbox
   loop and provisioned the production org + production OAT/webhook.
8. Git tag release `v3.2-membership-locked`.

---

## Doctrine reminders for future sessions

- **No founder time in any tier** (v2.3.1 §11). The "Architect line"
  removed permanently.
- **Public price visibility:** only `access.day.kids` (€25) on
  visitkaardi pages; everything else gate-side.
- **PSP positioning protection:** never re-introduce "wellness",
  "therapy", or "mental-health" classifier (Polar high-risk merchant
  risk).
- **Currency:** EUR primary, USD secondary (Polar IP-routes the
  presented currency automatically).
- **Roll-Forward One Cycle:** minutes carry into next cycle then
  expire. Reflected in the `validity_days` field of every grant.

---

**End of Sprint B report. Ready for Sprint C when founder gives the green light.**
