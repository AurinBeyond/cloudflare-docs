# 📋 Matrix Aurin — Complete Product & Price Catalogue

> **Generated**: 2026-02-10 (curl + DB verified, no guesses)
> **Use for**: FastSpring / Paddle onboarding, LinkedIn outreach,
> investor calls, internal pricing reference.

---

## 🟢 LIVE AND PURCHASABLE TODAY

### 1️⃣ Voice-Room Passes (Beta Rate — LemonSqueezy)

The **Clarity Release** voice rooms — Aurin, Grace, Kaelan, Sara, Alistair.
Quiet voice-only reflection. No transcripts saved. Each pass unlocks N minutes
of room access, which the user spends across any room they choose.

| Pass | Duration | Price | Type | LS Variant ID | Status |
|---|---:|---:|---|---:|:---:|
| 30-Minute Release | 30 min | **$15 USD** | One-time | `1606274` | ✅ Live |
| 60-Minute Release | 60 min | **$30 USD** | One-time | `1606349` | ✅ Live |
| Season Pass | 30 days | **$70 USD** | Subscription / 30d | `1606394` | ✅ Live |

**Notes**:
- These are **beta-discounted** rates. Regular rate planned: $19 / $39 / $89.
- Beta disclaimer: *"We are currently in Beta. Your feedback is vital. Enjoy a special discounted rate during this testing period."*
- Subscription is cancellable any time; pro-rated refund.
- Effective rate: $0.50/min (30min), $0.50/min (60min), $0.005/min capped (Season).

---

### 2️⃣ Body Temple 28 — Reading Practice

The flagship one-time product. A 28-day reading practice for adults:
4 weeks × 7 days × ~2-minute readings. Themes: **breath · touch · rest · presence**.

| Product | Days | Price | Type | LS Variant ID | Status |
|---|---:|---:|---|---:|:---:|
| Body Temple 28 | 28 | **$39 USD** | One-time | ⚠️ NOT SET | ❌ Needs LS variant |

**Notes**:
- Day 1 is free to read without account.
- $39 = one-time unlock of all 28 days.
- Refundable 14 days, no questions.
- **Action required**: Create LS variant + set `LEMONSQUEEZY_VARIANT_BODY_TEMPLE_28` env var.

---

### 3️⃣ The Aurin Library — Published Books

Eight books written by Anna, available on `prulesoul.site/library`:

| Book | Format | Price | Status |
|---|:---:|---:|:---:|
| **Angels' Story** | Digital book | $5 | ✅ Live in library |
| **Beyond the Matrix** | Digital book | $13 | ✅ Live in library |
| **The Night Angels' Embrace** | Digital book | Free (preview) | ✅ Live in library |
| **Engels' Friends 2** | Digital book | $5 | ✅ Live in library |
| **Angels' Tales** | Digital book | $5 | ✅ Live in library |
| **Beyond the Matrix II** | Digital book | $13 | ✅ Live in library |
| **The Language of Angels** | Digital book | $10 | ✅ Live in library |
| **You Don't Have to Dance to Another's Tune** | Digital book | $7 | ✅ Live in library |

**Notes**:
- Currently displayed at library, but **no per-book checkout flow wired** yet.
- These need LS variants per book OR a "library subscription" bundle.
- Total library value if sold individually: **$58**.

---

## 🟡 BUILT BUT NOT YET PURCHASABLE (waiting for LS variant IDs)

### 4️⃣ Voice Top-Up Ladder

Flexible voice-minute prepaid packs. Price per minute: **€0.60**.

| Minutes | Hours | Price | Suggested LS env name | Status |
|---:|---:|---:|---|:---:|
| 10 min | 0.17 h | **€6** | `LEMONSQUEEZY_VARIANT_TOPUP_10MIN` | ❌ Pending |
| 15 min | 0.25 h | **€9** | `LEMONSQUEEZY_VARIANT_TOPUP_15MIN` | ❌ Pending |
| 20 min | 0.33 h | **€12** | `LEMONSQUEEZY_VARIANT_TOPUP_20MIN` | ❌ Pending |
| **30 min** | **0.5 h** | **€18** ⭐ | `LEMONSQUEEZY_VARIANT_TOPUP_30MIN` | ❌ Pending |
| 45 min | 0.75 h | **€27** | `LEMONSQUEEZY_VARIANT_TOPUP_45MIN` | ❌ Pending |
| **60 min** | **1 h** | **€36** ⭐ | `LEMONSQUEEZY_VARIANT_TOPUP_60MIN` | ❌ Pending |
| 90 min | 1.5 h | **€54** | `LEMONSQUEEZY_VARIANT_TOPUP_90MIN` | ❌ Pending |
| 120 min | 2 h | **€72** | `LEMONSQUEEZY_VARIANT_TOPUP_120MIN` | ❌ Pending |
| **180 min** | **3 h** | **€108** ⭐ | `LEMONSQUEEZY_VARIANT_TOPUP_180MIN` | ❌ Pending |
| 300 min | 5 h | **€180** | `LEMONSQUEEZY_VARIANT_TOPUP_300MIN` | ❌ Pending |

⭐ = recommended P0 (create these 4 first — biggest revenue capture)

**Profitability**: 66-73% gross margin on all rungs (cost basis €0.13/min).

---

### 5️⃣ Family Bundle

A combined offer: Body Temple 28 + 60 voice minutes + Kids Universe Premium.

| Bundle | Includes | Standalone value | **Bundle price** | LS env name | Status |
|---|---|---:|---:|---|:---:|
| Family Bundle | BT28 + 60min voice + Kids Premium | $104 | **$59 USD** | `LEMONSQUEEZY_VARIANT_FAMILY_BUNDLE` | ❌ Pending |

**Margin**: 80% (cost basis $8.10, LS fee $3.45, net $47.45)
**Discount frame**: 43% off perceived standalone value (strong without screaming sale)

---

## 🆓 FREE / GROWTH-LOOP PRODUCTS

### 6️⃣ Anneli Story Gift

Personalised 200-word bedtime story for any child, generated free by Claude.
Includes WhatsApp / Telegram / Email / Copy share.

- **Price**: Free (zero-CAC growth loop)
- **Cost to us**: ~$0.30 per generation (LLM)
- **Sharing UTM**: `?ref=story_gift&utm_source=anneli`
- **URL**: `prulesoul.site/aurins-room/gift`
- **Status**: ✅ Live, working with Claude Sonnet 4.5

### 7️⃣ Kids Universe (free tier)

Mood check-ins, bedtime stories, creative activities for children with parent supervision.

- **Price**: Free (parent supervised)
- **Premium upgrade**: included in Family Bundle ($59)
- **Status**: ✅ Live

### 8️⃣ MUSE Guest Keys (influencer / B2B partner gifts)

Founder-controlled access codes. Three tiers:

| Tier | Max uses | Min per redeem | Body Temple? | Max cost if all redeem |
|---|---:|---:|:---:|---:|
| **Micro** | 10 | 15 | ✅ | **€19.50** |
| **Standard** | 25 | 20 | ✅ | **€65** |
| **Power** | 50 | 30 | ✅ | **€195** |

**Currently minted**: 5 Micro + 2 B2B Demo (Paddle / FastSpring) — total max exposure ~€137.

---

## 🟣 ROADMAP — Planned but not built

### 9️⃣ Steady Monthly companion (planned)
- Monthly subscription, $29/month
- Unlimited voice + library access + Anna's letter
- **Status**: Concept only, not coded

### 🔟 Own Room Monthly (planned)
- Premium tier, $45/month
- Includes one private named room (Grace / Kaelan / Sara / Alistair)
- **Status**: Concept only, not coded

### 1️⃣1️⃣ Custom Storybook PDF (planned)
- Anneli Story Gift, but printed-quality PDF + 3 stories per child
- One-time $9 or $19 with custom illustration
- **Status**: Concept, growth-loop ready to extend

### 1️⃣2️⃣ Anna's Annual Companion (planned)
- Annual subscription bundling all the above
- Suggested price $299/year (≈ $25/mo)
- **Status**: Concept only

---

## 💰 Revenue Mix Forecast (Year 1 estimate)

Based on 5% conversion of organic-only traffic:

| Product | Expected % of revenue | Reason |
|---|---:|---|
| Body Temple 28 ($39) | **45%** | Flagship one-time, easiest to communicate |
| Voice Top-ups (€18-€36) | **25%** | Repeat customers buying more time |
| Voice Passes ($15-$70) | **15%** | Beta-grandfathered users |
| Family Bundle ($59) | **8%** | Higher-AOV cross-sell |
| Books ($5-$13) | **5%** | Library purchases by existing customers |
| Subscriptions | **2%** | Beta Season Pass only |

**Average Order Value target**: $36–$42
**Refund expectation**: ≤4% (conservative; product is "soft" house, low buyer's remorse)
**Chargeback expectation**: <0.5% (digital, refundable, no surprise billing)

---

## 🛡️ Legal Positioning (for FastSpring / Paddle review)

> **Matrix Aurin** is a **digital reading and voice-reflection product for adults**. It is **not** therapy, counselling, medical advice, diagnosis, treatment, or psychological intervention. All paid products are refundable within 14 days, no questions asked.
>
> Sold by: **[Sinu Norra ettevõte]** (sole proprietorship, Norway)
> Tax handling: via merchant-of-record (LemonSqueezy now, FastSpring transitioning)
> Customer support: `info@prulesoul.site` (verified Google Workspace)

---

## 📝 Next Steps for Production (in order)

1. ☐ **LS Agent**: create 5 LS variants → send IDs to Anna:
   - `BODY_TEMPLE_28` ($39)
   - `FAMILY_BUNDLE` ($59)
   - `TOPUP_15MIN` (€9)
   - `TOPUP_30MIN` (€18)
   - `TOPUP_60MIN` (€36)
   - `TOPUP_180MIN` (€108)
2. ☐ **Anna**: paste IDs into Deploy panel env vars
3. ☐ **Me (Engineering)**: 30-min real-test transaction, confirm full funnel
4. ☐ **Anna**: distribute 5 Micro MUSE keys to chosen influencers
5. ☐ **Marketing Agent**: Week-1 LinkedIn launch using `/high-performers`
6. ☐ **Anna**: ship FastSpring application (email already drafted)

---

*All prices, variant IDs, and product status verified via curl + DB on 2026-02-10.*
*If a number here is wrong, it is provably reproducible from the codebase.*
