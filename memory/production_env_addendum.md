# Production .env additions (set via Emergent UI)

After first successful Gumroad sale (2026-05-30), add these three
environment variables to PRODUCTION through Emergent's deploy UI:

```
GUMROAD_SELLER_ID=9598261080984
GUMROAD_PRODUCT_PERMALINKS=fwqmha
GUMROAD_ACCESS_TOKEN=5dGfYg3fPPh0D0a19cifZWkZHASYNnXcGFTSdAL3Sss
```

Effect once redeployed:
- `GUMROAD_SELLER_ID` → anti-spoof check activates. Any ping with a
  different seller_id is rejected with 403.
- `GUMROAD_PRODUCT_PERMALINKS` → product whitelist activates. Pings
  for products outside this list are ignored (e.g. accidental
  duplicate products).
- `GUMROAD_ACCESS_TOKEN` → enables `/api/admin/gumroad/reconcile`
  and `/api/admin/gumroad/summary` endpoints for revenue evidence
  and missed-ping recovery.

Verify after redeploy:
```
curl https://prulesoul.site/api/webhooks/gumroad/health
```
All five `configured.*` flags should be `true`.

Note: First sale (sale_id `vNV3ALiQ1KXbNDrU-3wlJg==`,
email mesterskredder.info@gmail.com, 2026-05-30 19:19:57 UTC) was
received WITHOUT these env vars set. This was intentional — we
wanted to verify the pipeline works end-to-end with maximum
diagnostic visibility. Now that the pipeline is confirmed, the
security layer can be enabled.
