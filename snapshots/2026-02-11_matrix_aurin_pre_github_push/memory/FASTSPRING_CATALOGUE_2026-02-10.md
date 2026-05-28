# 📦 Matrix Aurin — FastSpring Product Catalogue (Bundles Separated)

> **Format aligned with FastSpring's onboarding form requirements.**
> Generated 2026-02-10 (verified from production code + DB).

---

## A. SINGLE PRODUCTS (one-time)

### A1. Body Temple 28 — Reading Practice
- **Internal SKU**: `body-temple-28`
- **Price**: **$39.00 USD** (one-time)
- **Tax category**: Digital goods — Educational/Wellness content
- **Description (short)**: A 28-day reading practice for adults. Two minutes per day, four weeks: breath, touch, rest, presence.
- **Description (legal)**: Digital reading material for adults. Not therapy, not medical advice. Refundable 14 days.
- **Currency display**: USD primary, EUR/GBP auto-converted
- **Status**: ⚠️ Built — needs FS variant ID

### A2. The Aurin Library — Individual Books
Eight digital books, sold individually:

| Title | Price | SKU |
|---|---:|---|
| Angels' Story | $5.00 | `book-angels-story` |
| Beyond the Matrix | $13.00 | `book-beyond-matrix-1` |
| The Night Angels' Embrace | Free preview | `book-night-angels-embrace` |
| Engels' Friends 2 | $5.00 | `book-engels-friends-2` |
| Angels' Tales | $5.00 | `book-angels-tales` |
| Beyond the Matrix II | $13.00 | `book-beyond-matrix-2` |
| The Language of Angels | $10.00 | `book-language-of-angels` |
| You Don't Have to Dance to Another's Tune | $7.00 | `book-dont-dance` |

- **Tax category**: Digital books / e-books
- **Status**: ⚠️ Books exist in library, individual checkout not wired yet

---

## B. VOICE-MINUTE TOP-UPS (one-time, consumable)

### B1. Voice Top-Up Ladder
Prepaid voice-companion minutes (€0.60/min). User redeems against any of 5 rooms.

| SKU | Minutes | **Price** | Tax category |
|---|---:|---:|---|
| `voice-topup-10` | 10 | **€6.00** | Digital service |
| `voice-topup-15` | 15 | **€9.00** | Digital service |
| `voice-topup-20` | 20 | **€12.00** | Digital service |
| `voice-topup-30` ⭐ | 30 | **€18.00** | Digital service |
| `voice-topup-45` | 45 | **€27.00** | Digital service |
| `voice-topup-60` ⭐ | 60 | **€36.00** | Digital service |
| `voice-topup-90` | 90 | **€54.00** | Digital service |
| `voice-topup-120` | 120 | **€72.00** | Digital service |
| `voice-topup-180` ⭐ | 180 | **€108.00** | Digital service |
| `voice-topup-300` | 300 | **€180.00** | Digital service |

⭐ = priority rungs to create first (highest expected volume)

- **Refund policy**: Unused minutes refundable within 14 days
- **Currency display**: EUR primary, USD/GBP auto
- **Status**: ⚠️ Built — needs FS variant IDs

### B2. Voice Beta Passes (currently live on LemonSqueezy)
For reference — these are working with current LS account:

| SKU | Duration | **Price** | LS Variant |
|---|---:|---:|---:|
| `voice-30min-release` | 30 min | $15 USD | 1606274 |
| `voice-60min-release` | 60 min | $30 USD | 1606349 |
| `voice-season-pass` | 30 days | $70 USD | 1606394 (subscription) |

When migrating to FastSpring: create matching variants with same SKUs.

---

## C. BUNDLES — Multiple products at a discount 📦

This is the section FastSpring keeps separate. Each bundle is **one transaction** that grants multiple entitlements via webhook.

### 📦 C1. Family Bundle
**The flagship cross-sell. Adult Body Temple + child's bedtime stories + voice companion.**

- **Internal SKU**: `bundle-family`
- **Price**: **$59.00 USD** (one-time)
- **What it includes**:
  - Body Temple 28 — full unlock ($39 standalone value)
  - 60 voice minutes — any room ($36 standalone value)
  - Kids Universe Premium — all stories + premium activities ($20 standalone value)
- **Standalone total value**: $104 → bundle saves **43%**
- **Tax category**: Digital goods bundle
- **Refund**: 14 days, full refund regardless of consumption
- **Our cost basis**: $8.10 (60min compute + LLM)
- **Net margin**: 80% after FS fee
- **Status**: ⚠️ Conceptually defined, code-side webhook handler ready

### 📦 C2. Beginner's Bundle *(suggested addition)*
**Low-risk first-step combo for someone new to Aurin.**

- **Internal SKU**: `bundle-beginner`
- **Price**: **$29.00 USD** (one-time)
- **What it includes**:
  - Body Temple 28 — full unlock ($39 standalone)
  - 10 voice minutes — any room ($6 standalone)
- **Standalone value**: $45 → bundle saves **36%**
- **Refund**: 14 days
- **Status**: 🟣 Proposed — not yet built, easy to add

### 📦 C3. Year of Quiet *(suggested addition)*
**The committed-customer bundle, anchored at premium tier.**

- **Internal SKU**: `bundle-year`
- **Price**: **$199.00 USD** (one-time, annual)
- **What it includes**:
  - Body Temple 28 — lifetime
  - 720 voice minutes (12 hours) — any room
  - All 8 library books — full collection access
  - All Kids Universe premium features
  - 12 personalised Anneli Story Gifts
- **Standalone value**: ~$430 → bundle saves **54%**
- **Refund**: 30 days
- **Status**: 🟣 Proposed — high-AOV anchor product

---

## D. SUBSCRIPTIONS (recurring)

### D1. Season Pass — 30 days *(currently live)*
- **SKU**: `sub-season-30d`
- **Price**: **$70.00 USD / 30 days**
- **What it includes**: Unlimited voice room access for 30 days
- **Auto-renewal**: Yes, with one-click cancel
- **Refund**: Pro-rated within 14 days
- **Status**: ✅ Live on LS as variant 1606394

### D2. Steady Monthly *(planned)*
- **SKU**: `sub-steady-monthly`
- **Price**: **$29.00 USD / month**
- **What it includes**: Anna's weekly letter + library access + 60 voice min/month
- **Status**: 🟣 Roadmap

### D3. Own Room Monthly *(planned)*
- **SKU**: `sub-own-room-monthly`
- **Price**: **$45.00 USD / month**
- **What it includes**: Premium room access (Grace / Kaelan / Sara / Alistair) + unlimited Aurin
- **Status**: 🟣 Roadmap

---

## E. FREE / NO-CHARGE

These never touch FastSpring but inform their understanding of the funnel:

- **Anneli Story Gift** — Free Claude-generated bedtime stories (~$0.30 cost per story to us)
- **Kids Universe basic** — Free child-supervised space
- **Day 1 of Body Temple 28** — Free preview
- **30 seconds of any voice room** — Free preview

---

## 📊 RECOMMENDED FASTSPRING SETUP ORDER

**Phase 1 (week 1 — required for launch)**:
1. ⭐ **A1. Body Temple 28** ($39)
2. ⭐ **C1. Family Bundle** ($59)
3. ⭐ **B1. Voice top-up 30min** (€18)
4. ⭐ **B1. Voice top-up 60min** (€36)
5. ⭐ **B1. Voice top-up 180min** (€108)

**Phase 2 (week 2 — round out the ladder)**:
6. B1. Voice top-ups: 15min, 90min, 120min
7. C2. Beginner's Bundle ($29)

**Phase 3 (month 2 — premium and subscriptions)**:
8. C3. Year of Quiet ($199)
9. D2. Steady Monthly ($29/mo)
10. D3. Own Room Monthly ($45/mo)
11. B1. Voice top-ups: 10min, 20min, 45min, 300min
12. A2. Individual book purchases

---

## 💰 EXPECTED REVENUE MIX (year 1)

| Product family | % of revenue | Why |
|---|---:|---|
| Single products (A) | **45%** | BT28 flagship + library |
| Voice top-ups (B) | **25%** | Repeat customers |
| Bundles (C) | **20%** | Family Bundle is the hero |
| Subscriptions (D) | **10%** | Conservative — slow start |

**Target AOV**: $36–$59
**Average refund rate**: ≤4%
**Chargeback rate**: <0.5%

---

## 🛡️ LEGAL & TAX NOTES (for FastSpring intake)

- **Company**: Norwegian sole proprietorship
- **VAT**: FastSpring handles EU MOSS, US sales tax, GST/HST (all merchant-of-record duties)
- **Customer-facing entity**: Matrix Aurin (`prulesoul.site`)
- **Support email**: `info@prulesoul.site` (Google Workspace verified)
- **Product classification**: Digital wellness reading + voice reflection — NOT medical, NOT therapy
- **Disclaimer**: Visible on every paid product page; included in checkout copy
- **Refund window**: 14 days standard, 30 days for annual products

---

*All prices and SKUs verified from `body_temple_curriculum.py`, `server.py` topup ladder, `clarity/passes` endpoint, and `books` collection on 2026-02-10.*
