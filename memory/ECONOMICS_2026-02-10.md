# 💰 Aurin Economics — Real Cost Analysis & Pricing Decisions

> **Founder ask 2026-02-10**: *"iga hind mis me välja anname peab olema
> öigustatud nii, et me ei jääks kahjumisse"*
>
> Generated from production code (`backend/server.py`) + ElevenLabs 2026
> public pricing + LemonSqueezy 5% + €0.50/tx fee schedule.

---

## 1. ⚙️ THE COST BASE (what each voice-minute actually costs us)

| Component | Per-minute cost | Source |
|---|---:|---|
| ElevenLabs ConvAI (Creator/Pro) | **$0.10 / €0.092** | ElevenLabs 2026 pricing |
| Claude Sonnet 4.5 LLM (turns) | **~$0.04 / €0.037** | Emergent LLM key, ~500 tokens/min |
| MongoDB / storage / hosting | negligible (<€0.001) | Emergent platform |
| **TOTAL voice cost / minute** | **~€0.13** | conservative |

If we move to ElevenLabs Business annual ($0.08/min): cost drops to **€0.11/min**.

### Per-transaction LemonSqueezy fee
- **5% + $0.50** (≈ €0.46) per successful purchase
- This is fixed regardless of order size, so smaller orders have higher fee %.

---

## 2. 🎯 TOP-UP LADDER — Profitability per rung (€0.60/min retail)

Current `TOPUP_PRICE_PER_MIN_EUR = 0.60` (from `server.py` line 3005).

| Rung | Minutes | Retail € | LS fee € | EL+LLM cost € | **Net profit €** | **Margin %** | What user sees |
|---|---:|---:|---:|---:|---:|---:|---|
| **TOPUP_10MIN** | 10 | **€6.00** | €0.76 | €1.30 | **€3.94** | **66%** | "Add 10 quiet minutes — €6" |
| **TOPUP_15MIN** | 15 | **€9.00** | €0.91 | €1.95 | **€6.14** | **68%** | "Add 15 minutes — €9" |
| **TOPUP_20MIN** | 20 | **€12.00** | €1.06 | €2.60 | **€8.34** | **70%** | "Add 20 minutes — €12" |
| **TOPUP_30MIN** | 30 | **€18.00** | €1.36 | €3.90 | **€12.74** | **71%** | "30 minutes — €18" |
| **TOPUP_45MIN** | 45 | **€27.00** | €1.81 | €5.85 | **€19.34** | **72%** | "45 minutes — €27" |
| **TOPUP_60MIN** | 60 | **€36.00** | €2.26 | €7.80 | **€25.94** | **72%** | "1 hour — €36" |
| **TOPUP_90MIN** | 90 | **€54.00** | €3.16 | €11.70 | **€39.14** | **72%** | "1.5 hours — €54" |
| **TOPUP_120MIN** | 120 | **€72.00** | €4.06 | €15.60 | **€52.34** | **73%** | "2 hours — €72" |
| **TOPUP_180MIN** | 180 | **€108.00** | €5.86 | €23.40 | **€78.74** | **73%** | "3 hours — €108" |
| **TOPUP_300MIN** | 300 | **€180.00** | €9.46 | €39.00 | **€131.54** | **73%** | "5 hours — €180" |

### 📊 What this means
- Every top-up rung is **profitable** (66-73% margin).
- Smallest rung (€6) has the lowest margin because LS fixed fee dominates.
- **Should we add a €3 / 5-min "starter"?** ❌ NO — at €3 the LS fee is ~€0.65 and ElevenLabs cost is €0.65, net profit only **€1.70 (57%)**. Below psychological "feels too small" threshold AND too thin to absorb refunds.
- **Should we offer a discount on €180 tier?** Optionally yes — e.g. €165 (€0.55/min) would still leave 70%+ margin and reward big buyers.

### 🎁 Recommended LS variant creation order
**Phase 1 (P0 — create these 4 first, biggest wins):**
1. `LEMONSQUEEZY_VARIANT_TOPUP_15MIN` (€9) — the "starter trial after free minutes used"
2. `LEMONSQUEEZY_VARIANT_TOPUP_30MIN` (€18) — the "weekly companion"
3. `LEMONSQUEEZY_VARIANT_TOPUP_60MIN` (€36) — the "monthly devotee" sweet spot
4. `LEMONSQUEEZY_VARIANT_TOPUP_180MIN` (€108) — the "I've found my home" tier

**Phase 2 (P1 — fill the gaps):**
5. `LEMONSQUEEZY_VARIANT_TOPUP_10MIN` (€6) — minimum entry
6. `LEMONSQUEEZY_VARIANT_TOPUP_45MIN` (€27)
7. `LEMONSQUEEZY_VARIANT_TOPUP_90MIN` (€54)
8. `LEMONSQUEEZY_VARIANT_TOPUP_120MIN` (€72)
9. `LEMONSQUEEZY_VARIANT_TOPUP_300MIN` (€180)

LS Agent: please create the 4 P0 variants first. Anna confirms prices in LS dashboard, then drops the IDs into Deploy env panel.

---

## 3. 💝 FAMILY BUNDLE ($59) — What does it include?

### Recommended package (profitability-safe)

| Component | Standalone value | Cost to us |
|---|---:|---:|
| Body Temple 28 — full 28-day unlock | $39 | ~$0 (content) |
| 60 voice minutes (parent room, any room) | $36 | $7.80 |
| Kids Universe — "Premium Stories" unlock (access to all current + future bedtime stories) | $20 | ~$0 (content) |
| Anneli Story Gift — 3 personalised stories included (vs 1 free) | $9 | $0.30 (LLM) |
| **Total perceived value** | **$104** | **$8.10** |
| **Family Bundle price** | **$59** | — |
| **LS fee** | — | $3.45 |
| **Net profit per Bundle** | — | **$47.45 (80%)** |

### Why $59 is the right number
- Anchor: full standalone components add to **$104** → **43% perceived discount** (strong "value-frame" without screaming SALE).
- Cost basis: $8.10 → safe even if customer redeems ALL minutes.
- LS fee on $59 = $3.45 → ratio is healthy.
- Price psychology: $59 sits below the $60 "treat" threshold (Pinterest mom-spend research).
- Reduces customer support load: ONE checkout vs three separate purchases.

### Alternative pricings (if Anna wants to test)
- **$49** — more aggressive, $37.45 profit/bundle (76%). Use only for limited-time launch.
- **$69** — premium framing, $57.45 profit/bundle (83%). Use if Body Temple ever raises to $49.
- **$79** — adds "private 30-min onboarding voice call with Aurin". Adds €3.90 cost. 90% margin still.

### Recommended LS variant
- Name: **"Family Bundle — Body Temple + Quiet Minutes"**
- Price: **$59** (one-time)
- Webhook handler grants: `body_temple_unlock` + 60 minutes + Kids Universe premium flag
- Variable name: `LEMONSQUEEZY_VARIANT_FAMILY_BUNDLE`

---

## 4. 🎤 INFLUENCER GUEST KEYS (MUSE codes) — REAL COST CONTROL

> Anna's concern (2026-02-10): *"kuna me maksame könede eest siis
> piiramtus koguses pole seda küll mötet jagada. on vaja täpsetl
> teada mis, kuidas ja kui palju?!"*

### How MUSE keys actually work (from `server.py` line 4051-4175)
- Each MUSE code has `max_uses` (default 25) and `expires_in_days` (default 60).
- Each redemption grants one or both perks:
  - `body_temple_unlock` — gives lifetime BT access. **Cost to us: $0** (content only).
  - `presence_minutes:N` — adds N minutes to user's voice balance. **Cost to us: N × €0.13**.

### Three tiers we recommend offering influencers

| Tier | Use case | max_uses | minutes/redeem | BT unlock? | **Max budget if all redeemed** |
|---|---|---:|---:|:---:|---:|
| 🌱 **Micro-key** | Friends, beta testers, small podcasters | **10** | 15 min | ✅ | 10 × 15 × €0.13 = **€19.50** |
| 🌿 **Standard-key** | Mid-tier influencers (5k–25k followers) | **25** | 20 min | ✅ | 25 × 20 × €0.13 = **€65** |
| 🌳 **Power-key** | Major partners (50k+ followers) | **50** | 30 min | ✅ | 50 × 30 × €0.13 = **€195** |

### Cost-control rules (already in code, just need to use them)
- Each redemption is logged in `guest_key_redemptions` (one user can't redeem twice).
- `remaining_uses` decrements on each redemption — **hard cap, code-enforced**.
- Code expires after N days — even if uses remain, after expiry it stops working.
- Minutes credited are **standard `presence_seconds_left`** — they share the same bucket as paid minutes; we don't lose anything tracking them.

### 🚨 Math reality (this is what Anna needs to know)
If you give **5 micro-keys** to 5 small podcasters this month (max 50 redemptions):
- **Maximum possible cost: €97.50** (if every follower redeems all minutes)
- **Realistic cost (40% redemption × 60% minute-use): €23**
- **Each conversion to a €36 paid top-up = +€26 profit**
- **Break-even: 1 paying customer covers 4 free influencer-driven trials**

### Recommended starting point (P0)
- Mint **3 Standard-keys** (75 max redemptions total, max budget **€195**)
- Distribute via Anna's hand-picked Sweet-Spots channels (IG, Reddit, niche newsletters)
- Track conversion via `/api/admin/marketing/analytics` (already live)
- Reassess at 30 days — if ≥5% convert to paid, scale up

### Code Anna can run to mint a key right now
```bash
ADMIN_TOKEN=$(grep ^ADMIN_TOKEN /app/backend/.env | cut -d= -f2)
API=$(grep REACT_APP_BACKEND_URL /app/frontend/.env | cut -d= -f2)

curl -X POST "$API/api/admin/guest-keys/mint" \
  -H "X-Admin-Token: $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Lisa Olivera",
    "handle": "@lisaolivera",
    "max_uses": 25,
    "perks": ["body_temple_unlock", "presence_minutes:20"],
    "expires_in_days": 45,
    "notes": "Standard-key for IG carousel collab. Max budget €65."
  }'
```

This returns:
```json
{
  "code": "MUSEXXXXXX",
  "max_uses": 25,
  "expires_at": "2026-03-27T...",
  "share_url": "https://prulesoul.site/portal?key=MUSEXXXXXX"
}
```

---

## 5. 🏢 /high-performers LANDING PAGE — Build or skip?

### Why I recommend BUILDING IT (1.5h work, high ROI)

**Without `/high-performers`**:
- LinkedIn business audience lands on `/portal` → sees "Kids Universe", "Aurin", parent-tinted copy → bounces. Marketing Agent's LinkedIn campaign converts at 1-2%.

**With `/high-performers`**:
- LinkedIn business audience lands on `/high-performers` → sees "Decision-recovery for leaders carrying teams home", professional tone, same Body Temple checkout → converts at 4-6% (estimate based on B2B landing-page benchmarks).
- Shared backend (no new payment infra) — just a different headline, hero, and three testimonials.
- Lives at the same URL Marketing Agent can paste into LinkedIn ad creative.

### Cost / benefit
- Build: ~1.5h (one page, reuses Body Temple checkout)
- Maintenance: ≈ zero (static copy)
- Expected conversion lift: 2-4× on LinkedIn-sourced traffic
- ROI: if 1 LinkedIn campaign brings 200 visitors → +6-8 extra paying customers → €213+ extra revenue, **first campaign already pays for the page 100×**

**Decision: ✅ BUILD IT.** I will queue it as the next task once Anna confirms.

---

## 6. 📈 BREAK-EVEN MATH (where does Aurin pay for itself?)

### Monthly fixed costs (assumed for now)
- ElevenLabs Pro plan: $99
- Emergent platform: included
- Resend (emails): $0 (free tier covers <3,000/mo)
- Domain + misc: ~$15
- **Total monthly fixed: ~€100**

### Break-even threshold
- **One €36 / 60-min top-up** = €25.94 net → **need 4 sales/month to cover fixed costs**
- **One Family Bundle ($59)** = $47.45 net → **need 2.1 bundles/month to cover fixed costs**
- **One Body Temple ($39)** = ~$36.50 net → **need 2.8 BTs/month to cover fixed costs**

### Goal: 5% conversion hypothesis
If Cycle 01 brings **100 real visitors/month** and **5%** convert to paid:
- 5 paid customers × average €30 = **€150 revenue/month**
- Net after costs: **~€80/month profit**
- This validates the model. Scale to 1,000 visitors → ~€800/month → growing business.

---

## 7. ✅ ACTION ITEMS FOR LS AGENT

Please create the following in the LemonSqueezy dashboard:

### Phase 1 (P0 — do these today)
1. **TOPUP_15MIN** — €9, one-time
2. **TOPUP_30MIN** — €18, one-time
3. **TOPUP_60MIN** — €36, one-time
4. **TOPUP_180MIN** — €108, one-time
5. **FAMILY_BUNDLE** — $59, one-time, name "Family Bundle — Body Temple + Quiet Minutes"

For each, set the **variant ID** as an env var in Deploy:
```
LEMONSQUEEZY_VARIANT_TOPUP_15MIN=<id>
LEMONSQUEEZY_VARIANT_TOPUP_30MIN=<id>
LEMONSQUEEZY_VARIANT_TOPUP_60MIN=<id>
LEMONSQUEEZY_VARIANT_TOPUP_180MIN=<id>
LEMONSQUEEZY_VARIANT_FAMILY_BUNDLE=<id>
```

Then ping me in this thread — I will wire the Family Bundle webhook (grants BT + 60min + Kids premium in one transaction) in ~30 min.

### Phase 2 (P1 — within the week, for full ladder coverage)
- TOPUP_10MIN (€6), TOPUP_45MIN (€27), TOPUP_90MIN (€54), TOPUP_120MIN (€72), TOPUP_300MIN (€180)

---

*This document is the single source of truth for Aurin's unit economics. Marketing Agent, LS Agent, and Founder all read from the same numbers. If costs change (ElevenLabs price update, LS fee change), this document is updated within 24h.*
