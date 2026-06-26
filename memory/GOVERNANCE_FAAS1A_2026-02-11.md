## 2026-02-11 — §GOVERNANCE Faas 1A — Runtime Governance Layer (LIVE)

**Founder directive (Anna)**: build "$0 cash risk" architecture before
Polar.sh migration. Three independent vendor-cost guards. Payment
abstraction comes AFTER governance is bulletproof.

**Shipped:**

1. **`backend/runtime_governance.py`** — 3 independent guards:
   - Vendor Balance Guard — polls ElevenLabs `/v1/user/subscription`
     every 60s (TTL-cached); blocks new sessions when character usage
     ≥ 95% of monthly limit. Fails OPEN on API errors (other guards
     still protect).
   - Concurrency Guard — counts open `voice_sessions` (closed≠True);
     blocks new sessions above `GOVERNANCE_MAX_CONCURRENT_VOICE`
     (default 50).
   - Spend Velocity Breaker — counts voice_sessions opened in last
     15 min; trips a 5-minute cooldown when above
     `GOVERNANCE_MAX_SESSIONS_PER_15MIN` (default 200).
   - All guards bypassed for `users.unlimited_voice=true` (founder/admin).
   - Master switch: `GOVERNANCE_ENABLED=true|false`.

2. **Mount point in `/api/clarity/convai/signed-url`** (server.py
   line ~8253): single try/except block after existing session_cap
   check. Returns HTTP 503 with `retry_after_sec=60` and a calm
   house-tone message when any guard trips. Failures soft-warn
   and proceed — realtime core never crashes.

3. **`/api/admin/governance/status`** — read-only snapshot endpoint
   (ADMIN_TOKEN required). Returns guards + customer "debt"
   (sum of `presence_seconds_left` across users) + ElevenLabs
   headroom + 24h/7d activity + actual vendor burn cost. Powers
   the dashboard.

4. **`/admin/finance` dashboard** — real-time React page. Auto-refresh
   every 60s. Traffic light: ≥3x ratio green, 1.5-3.0x yellow, <1.5x
   red. Shows all three guards, customer debt, vendor headroom,
   recent activity, current thresholds.

5. **`tests/test_runtime_governance.py`** — 9 unit tests, all pass.
   Mock DB + cached vendor data. Covers each guard isolated +
   `evaluate_governance` integration + snapshot shape.

**Live system snapshot at deploy** (2026-05-27 09:39 UTC):
- ElevenLabs: 33,822 / 158,500 chars used (21.3%) — 124,678 chars left
- Vendor estimate: ~125 voice minutes available
- Customer debt: 2 users holding 4,600 seconds (76.7 min, ~$10.73 vendor cost)
- **Headroom/Debt ratio: 1.63x** → 🟡 YELLOW (watch zone)
- All three guards: OK

**ENV added (`/app/backend/.env`):**
```
GOVERNANCE_ENABLED=true
GOVERNANCE_MAX_CONCURRENT_VOICE=50
GOVERNANCE_MAX_SESSIONS_PER_15MIN=200
GOVERNANCE_ELEVENLABS_USAGE_FLOOR=0.95
GOVERNANCE_VENDOR_POLL_TTL_SEC=60
```

**Dashboard URL:**
`/admin/finance?token=<ADMIN_TOKEN>` (token cached in localStorage
after first visit).

**Anna's "$0 cash risk" architecture: STATUS LIVE.**
- No card binding to ElevenLabs auto-recharge ✅
- Hard caps on concurrency + velocity ✅
- Vendor balance polling (max 60s detection window) ✅
- Existing `presence_seconds_left` ledger = prepaid wallet ✅ (already)
- Real-time owe vs available ratio visible ✅

**Untouched:** ConvAI agents, audio pipeline, presence ledger,
session_cap (governance is additive, runs AFTER session_cap),
LemonSqueezy webhooks, Kids Hub, Body Temple, all visual surfaces.

**Next (Faas 1B — pending Anna's go-ahead):**
- Payment Abstraction Layer (`PaymentProvider` interface)
- `/api/webhooks/polar` + `polar_client.py`
- 3 SKU sandbox: Body Temple, Top-up 60min, Eternal monthly
- Polar account creation (Anna: 15 min task, see ASK_FOR_POLAR_2026-02-11.md)
