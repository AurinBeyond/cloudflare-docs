# Polar.sh Switchover Guide — Matrix Aurin

**Status:** SCAFFOLDED · awaiting Polar.sh account approval
**Owner:** Founder (Anna)
**Last updated:** 2026-02-11

This is the founder-runbook for flipping the live payment provider
from LemonSqueezy → Polar.sh. The codebase is already wired for
this — there is no engineering work left. Only configuration.

---

## What is already done in the codebase

| Layer | File | Status |
|---|---|---|
| Webhook receiver | `backend/server.py:12141 /api/webhooks/polar` | ✓ Live, returns 503 until env set |
| Signature verification | `payment_providers/polar.py` `verify_webhook()` | ✓ Standard Webhooks spec |
| Idempotency | `polar_webhook_log` MongoDB collection, unique `webhook-id` | ✓ Duplicate deliveries return `{duplicate: true}` |
| Entitlement dispatch | `polar_webhook()` calls existing grant helpers | ✓ Same path as LemonSqueezy |
| Admin visibility | `/api/admin/payment/sku-map` | ✓ Returns Polar mode, configuration status, SKU registry |
| SKU registry | `payment_providers/sku_mapping.py` | ✓ 3 SKUs ready (body_temple, topup_60min, eternal_monthly) |
| Sandbox/production split | `POLAR_MODE` env switch | ✓ Polar treats them as separate environments |

LemonSqueezy is **untouched** and stays the live provider until you
explicitly flip the switch. The two providers can co-exist.

---

## Step-by-step switchover (founder action)

### Step 1 — When Polar account is approved
1. Sign in to https://polar.sh
2. Create 3 sandbox products mirroring the SKU registry:
   - `Body Temple Lifetime` — $39 one-time
   - `Voice Top-up · 60 minutes` — $39 one-time
   - `Eternal House · Monthly` — $89/month recurring
3. Copy each product's UUID

### Step 2 — Sandbox configuration
Edit `/app/backend/.env`:
```
POLAR_MODE=sandbox
POLAR_ORG_ID=<your org id>
POLAR_SANDBOX_OAT=<your sandbox OAT>
POLAR_SANDBOX_WEBHOOK_SECRET=<your sandbox webhook secret>
POLAR_SKU_MAP_JSON={"sandbox":{"body_temple":"<uuid>","topup_60min":"<uuid>","eternal_monthly":"<uuid>"},"production":{"body_temple":"","topup_60min":"","eternal_monthly":""}}
```

Restart backend:
```
sudo supervisorctl restart backend
```

### Step 3 — Verify sandbox
1. In the Polar dashboard, point a webhook endpoint at:
   `https://<your-prod-domain>/api/webhooks/polar`
2. Send a test event from Polar dashboard
3. Hit `/api/admin/payment/sku-map` with `X-Admin-Token` header — should report:
   ```
   "polar_mode": "sandbox",
   "polar_configured": true
   ```
4. Run a $1 test purchase through Polar sandbox → confirm
   entitlement granted in MongoDB `users.presence_seconds_left`
5. Check `db.polar_webhook_log` shows the event with `status: processed`

### Step 4 — Production cutover
1. Create the same 3 products in Polar **production** mode
2. Add their UUIDs to the `"production"` block of `POLAR_SKU_MAP_JSON`
3. Set:
   ```
   POLAR_MODE=production
   POLAR_PRODUCTION_OAT=<prod OAT>
   POLAR_PRODUCTION_WEBHOOK_SECRET=<prod webhook secret>
   ```
4. Update Polar production webhook URL → same `/api/webhooks/polar`
5. Restart backend
6. Place a real $1 micro-purchase to verify live flow

### Step 5 — Price increase (ONLY after Step 4 is verified)
In `/app/backend/.env`:
```
TOPUP_PRICE_PER_MIN_EUR=1.50    # was 0.60
```
Restart backend.

Audit: `GET /api/topup/options` should now show price_per_min_eur: 1.50.

### Step 6 — Retire LemonSqueezy (optional)
Once Polar is live for 7+ days with clean webhook log:
1. Disable LemonSqueezy webhook on their dashboard side
2. Leave `lemonsqueezy_variant_id` fields in SEED_COURSES intact for
   one full month as rollback insurance
3. After 30 days clean operation, those can be removed

---

## Rollback (in case of incident)
1. Set `POLAR_MODE=` (empty) → endpoint returns 503, LemonSqueezy
   re-asserts as the sole provider
2. Re-enable LemonSqueezy webhook on their dashboard
3. Lower `TOPUP_PRICE_PER_MIN_EUR` back to 0.60 if it was flipped
4. Restart backend

No code changes required for rollback.

---

## Verification dashboard

After switchover, monitor:
- `GET /api/admin/payment/sku-map` (admin token required)
- `db.polar_webhook_log` last 24h count + status distribution
- `db.users.presence_seconds_left` delta before/after a test purchase

That is the entire runbook. The scaffolding is done; only the keys
and the price flip are pending your action.
