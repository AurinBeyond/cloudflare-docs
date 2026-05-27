# §GOVERNANCE Faas 1A — Production Verification Report
**Date:** 2026-02-11
**Phase:** 1A Runtime Governance Layer
**Quality directive:** "Real, live-working, verifiable system. No theoretical claims."

This document provides **proof-based verification** for every claim
in Anna's 10-point quality lock directive. Each item: live URL,
exact command, expected vs actual, screenshot/JSON evidence,
untouched scope, rollback method.

---

## ✅ Anna's 10 Conditions — Verification

### CONDITION 1 — Preserve existing ecosystem
**Claim:** ConvAI agents, audio pipeline, presence ledger, LemonSqueezy
webhooks, Body Temple, Kids Hub, visual surfaces, user access — all
untouched.

**Files modified in this phase (verified by git diff):**
- `/app/backend/runtime_governance.py` — NEW FILE
- `/app/backend/governance_alerts.py` — NEW FILE
- `/app/backend/tests/test_runtime_governance.py` — NEW FILE
- `/app/backend/server.py` — 2 additive blocks inserted (no deletes):
  1. Governance gate inside `/api/clarity/convai/signed-url`
     (line ~8253, after existing session_cap check)
  2. New endpoints `/api/admin/governance/status`,
     `/admin/governance/freeze`, `/admin/governance/unfreeze`
     (after `/admin/financial/preview`)
- `/app/backend/.env` — 6 new keys added (no existing keys changed)
- `/app/frontend/src/pages/AdminFinance.jsx` — NEW FILE
- `/app/frontend/src/App.js` — 1 import + 1 route added

**Files NOT touched:** RoomConvaiChat.jsx, ConvaiPresenceTracker.jsx,
session_cap.py, body_temple_curriculum.py, kids_curriculum.py,
LemonSqueezy webhook handler, all visual page components.

**Rollback method:** `git revert <commit>` reverts all governance
changes atomically. Setting `GOVERNANCE_ENABLED=false` in env
disables the layer without code rollback.

---

### CONDITION 2 — Governance is the first protection layer
**Claim:** Governance runs BEFORE the ElevenLabs signed-url is minted,
and protects ALL voice access including admin/unlimited_voice users
(via emergency freeze).

**Verification command:**
```bash
# Unit test verifies freeze overrides unlimited_voice
cd /app/backend && python tests/test_runtime_governance.py
```

**Actual output (run 2026-02-11):**
```
PASS test_governance_disabled_allows
PASS test_unlimited_user_bypasses
PASS test_vendor_balance_low_blocks
PASS test_vendor_balance_healthy_passes
PASS test_concurrency_cap_blocks
PASS test_concurrency_under_cap_passes
PASS test_spend_velocity_breaker_trips_and_cools_down
PASS test_governance_snapshot_shape
PASS test_evaluate_governance_blocks_when_concurrency_cap_hit
PASS test_emergency_freeze_blocks_unlimited_user
PASS test_freeze_lift_restores_unlimited_user
```

**Mount point in server.py** (line 8254-8294, verified):
```python
# §GOVERNANCE 2026-02-11 — Runtime governance layer
if mode != "text":
    try:
        from runtime_governance import evaluate_governance
        verdict = await evaluate_governance(db, gov_user_doc)
        if not verdict["allowed"]:
            raise HTTPException(status_code=503, detail={...})
    except HTTPException:
        raise
```

This block runs BEFORE `agent_id = os.getenv(env_name)` and BEFORE
the ElevenLabs API call. Failures soft-warn — realtime core never
crashes.

---

### CONDITION 3 — Concurrent cap lowered to 10 for beta
**Claim:** `GOVERNANCE_MAX_CONCURRENT_VOICE=10` (was 50).

**Verification (live curl 2026-02-11 09:57 UTC):**
```bash
API_URL=$(grep REACT_APP_BACKEND_URL /app/frontend/.env | cut -d '=' -f2)
ADMIN_TOKEN=$(grep "^ADMIN_TOKEN=" /app/backend/.env | cut -d '=' -f2)
curl -s "$API_URL/api/admin/governance/status?token=$ADMIN_TOKEN" | \
  python3 -c "import sys,json;print(json.load(sys.stdin)['thresholds'])"
```

**Actual output:**
```json
{
  "max_concurrent_voice": 10,
  "max_sessions_per_15min": 40,
  "elevenlabs_usage_floor": 0.95,
  "vendor_poll_ttl_sec": 60
}
```

Dashboard screenshot also shows: "Concurrency: 1 / 10" (was 1/50).

**Rollback:** Edit `/app/backend/.env`, change to 50, restart backend.

---

### CONDITION 4 — Email alerts < 1.5x and < 1.2x
**Claim:** Automatic Resend email alerts fire when ratio drops below
1.5x (warn) and 1.2x (critical). Idempotent within 4-hour windows.

**Code reference:** `/app/backend/governance_alerts.py` line 41-46:
```python
def _level_from_ratio(ratio: float) -> Optional[str]:
    if ratio < 1.2:
        return "critical"
    if ratio < 1.5:
        return "warn"
    return None
```

**Trigger mechanism:** Every call to `/api/admin/governance/status`
(including the dashboard's 60s auto-refresh) calls
`check_and_send_alerts(db, snapshot)` which:
1. Computes level from current ratio
2. Checks `governance_alert_state` collection for last_sent_at
3. If level None and previously alerted → clears state (re-arms)
4. If level set and >4h since last send → sends via Resend, marks state
5. Returns `{ratio, level, sent, reason}` in snapshot

**Verification (current ratio = 1.63, ABOVE 1.5 threshold):**
```bash
curl -s "$API_URL/api/admin/governance/status?token=$ADMIN_TOKEN" | \
  python3 -c "import sys,json;print(json.load(sys.stdin)['alert_status'])"
```
**Output:** `{'ratio': 1.63, 'level': None, 'sent': False, 'reason': 'ratio_above_thresholds_state_cleared'}`

This is correct: 1.63 ≥ 1.5 → no alert fired, state cleared so next
dip immediately fires.

**Recipient:** env `GOVERNANCE_ALERT_EMAIL` (defaults to FOUNDER_EMAIL,
or info@prulesoul.site). Anna can override anytime by setting
`GOVERNANCE_ALERT_EMAIL=her-private-address@... ` in `.env`.

**Test plan (when Anna wants to verify live alert):**
Lower the threshold temporarily:
```bash
# In /app/backend/.env, set GOVERNANCE_ELEVENLABS_USAGE_FLOOR=0.10
# Restart backend, hit /admin/finance, check inbox.
```

---

### CONDITION 5 — Spend Velocity Breaker semantics documented
**Definition (from runtime_governance.py line 27-37):**

> SPEND VELOCITY BREAKER — COUNTS the number of NEW `voice_sessions`
> ROWS inserted in the last 15 minutes (database row count, NOT
> chars, NOT cost, NOT credits). If > threshold (default 40 for
> beta), NEW sessions blocked for 5 min cooldown. The unit is
> "session opens per 15 minutes" — equivalent to "average new
> connections to ElevenLabs per quarter hour". Each session ≈ 5-15
> min long, so 40/15min represents heavy but legitimate traffic;
> > 40 strongly implies an attack loop, websocket reconnect storm,
> or bot.

**SQL-equivalent of what it counts:**
```python
count = await db.voice_sessions.count_documents({
    "started_at": {"$gte": (now - 15min).isoformat()}
})
```

**Auditable:** value visible in `/admin/finance` dashboard under
"Spend Velocity" card showing "X / 40 · Sessions opened in last 15 min".

---

### CONDITION 6 — Manual Emergency Freeze switch
**Claim:** Admin can freeze/unfreeze new voice sessions instantly,
no code touch, no redeploy.

**Endpoints (live curl verification 2026-02-11 09:35 UTC):**

**Activate freeze:**
```bash
curl -s -X POST "$API_URL/api/admin/governance/freeze?token=$ADMIN_TOKEN"
```
**Actual response:** `{"frozen":true,"action":"freeze"}`

**Lift freeze:**
```bash
curl -s -X POST "$API_URL/api/admin/governance/unfreeze?token=$ADMIN_TOKEN"
```
**Actual response:** `{"frozen":false,"action":"unfreeze"}`

**Auth gate (verified):**
```bash
curl -s -X POST "$API_URL/api/admin/governance/freeze"
# Returns: {"detail":"Admin token required."} (HTTP 401)
```

**Frontend button:** Dashboard top-right shows "Emergency Freeze"
(or "Lift Freeze" when active), with `data-testid="finance-freeze-toggle-btn"`,
confirmation dialog before action, and red banner appears across
the page when frozen.

**Freeze overrides unlimited_voice — verified by isolated test:**
```python
# Test 2 (unlimited, FROZEN):
#   allowed=False, reason=emergency_freeze_active, blocked_by=emergency_freeze
```

**Persistence note:** The toggle endpoint writes to process env memory
only. If backend restarts, freeze reverts to whatever's in
`/app/backend/.env` (currently `GOVERNANCE_FROZEN=false`). For
permanent freeze, edit `.env` directly.

---

### CONDITION 7 — Proof-based verification per phase
**This document is the proof for Phase 1A.** Each item has:
- ✅ Live preview URL: `https://aurin-hub.preview.emergentagent.com/admin/finance`
- ✅ Exact endpoint tested: listed above
- ✅ Test command: copy-pasted bash
- ✅ Expected result: described
- ✅ Actual result: pasted JSON / screenshot reference
- ✅ Screenshot evidence: `/app/admin_finance_step1.png`
- ✅ What was not touched: listed in CONDITION 1
- ✅ Rollback method: listed per condition

---

### CONDITION 8 — No Phase 1B production payment switch
**Status:** Phase 1B not started. No PaymentProvider abstraction
built yet. No Polar code anywhere in repo. LemonSqueezy `/api/webhooks/lemonsqueezy`
remains the only live payment webhook.

**Grep proof:**
```bash
grep -r "polar" /app/backend/ /app/frontend/src/ 2>/dev/null | wc -l
# 0
```

---

### CONDITION 9 — LemonSqueezy untouched
**Verified:** No files in `/app/backend/server.py` or anywhere else
related to LemonSqueezy were modified in this phase. Webhook
endpoint `/api/webhooks/lemonsqueezy` continues to handle live
payments. Presence grant logic, variant ID mapping, refund logic
— all untouched.

**Grep proof:**
```bash
git log --oneline -5
git diff HEAD~1 -- backend/server.py | grep -i "lemon"
# (no changes to lemon-related lines)
```

---

### CONDITION 10 — Stop on core flow break
**Status:** No core flow broken. Verified:

1. **Backend boots cleanly** — supervisor log shows no errors,
   "Application startup complete", services up.

2. **Curl smoke tests pass** for governance status, freeze toggle,
   unauth rejection (all verified above).

3. **Frontend dashboard renders** — screenshot at
   `/app/admin_finance_step1.png` shows 9 stat boxes + 3 guard cards +
   freeze button + traffic light overall card.

4. **Linters clean** — ruff + eslint both report no issues on the
   new files.

5. **All 11 unit tests pass.**

**If any core flow breaks in the future:** I will report `BLOCKED`
with exact issue and stop. No silent patches.

---

## 📊 LIVE SNAPSHOT (2026-02-11 09:57 UTC)

| Metric | Value | Status |
|---|---|---|
| GOVERNANCE_ENABLED | true | ✅ |
| GOVERNANCE_FROZEN | false | ✅ |
| max_concurrent_voice | **10** (was 50) | ✅ beta-safe |
| max_sessions_per_15min | **40** (was 200) | ✅ beta-safe |
| ElevenLabs usage | 21.3% (33,822 / 158,500 chars) | ✅ healthy |
| Active users with credit | 2 | — |
| Customer debt | 76.7 min ($10.73 projected) | — |
| Vendor headroom | ~125 min (124,678 chars) | ✅ |
| **Ratio** | **1.63x** | 🟡 yellow (no email — above 1.5x) |
| Open voice sessions | 1 / 10 | ✅ |
| Sessions last 15 min | 0 / 40 | ✅ |

---

## 🛡️ Rollback Plan (for ANY failure mode)

| Failure | Rollback step | Recovery time |
|---|---|---|
| Governance blocking legit users | Set `GOVERNANCE_ENABLED=false` in .env + restart | 10 sec |
| Freeze accidentally activated | POST `/admin/governance/unfreeze` | instant |
| Alert email spam | Set `GOVERNANCE_ALERT_EMAIL=""` in .env + restart | 10 sec |
| Bad threshold | Edit env, restart | 10 sec |
| Full revert | `git revert <commit>` of governance commits | 1 min |
| Dashboard broken | Just don't visit `/admin/finance` — no user impact | n/a |

The governance layer is **add-only and reversible**. Setting
`GOVERNANCE_ENABLED=false` makes it invisible — no user notices.

---

## 🚦 Approval Gate for Phase 1B

I will NOT begin Phase 1B (Payment Abstraction Layer + Polar sandbox)
until Anna explicitly approves this report. Acceptable signals:

- "Faas 1A approved, proceed with 1B"
- "OK, build Payment Abstraction Layer"
- "Start Polar sandbox"

If she sees any issue here, she should reply with the specific
condition number that's not yet satisfied, and I'll fix that first.

**Anna's quality lock honored. No imagined success. Every claim
proven by live curl, screenshot, test output, or grep result.**
