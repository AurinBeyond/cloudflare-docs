# Matrix Aurin — Membership Architecture v2.0

**Status:** DRAFT v2.0 · Pricing locked for founder review · 2026-02-12
**Supersedes:** `BUNDLE_STRATEGY_DRAFT.md`, `BUNDLE_STRATEGY_v1.1.md`
**Naming source:** GPT renaming proposal accepted (Cadence Access · Quantum Compass · House Compass · Sovereign Circle).
**Currency:** EUR throughout.
**Billing periods supported:** 1-day ticket · 1 month · 1 quarter · 1 year.

> Matrix Aurin is a private digital membership environment — never an
> AI app. The user buys deeper access, stronger continuity, calmer
> private space, and higher emotional value. Voice exists to create
> presence — never to be consumed without limit.

---

## 1. COGS assumptions (the engineering math behind every price)

These are **conservative ceilings**. Real costs run below; we price as
if we always hit the ceiling.

| Cost line                                  | Unit cost (€)    | Source / rationale |
|--------------------------------------------|------------------|---------------------|
| ElevenLabs adult ConvAI minute (STT + LLM + TTS round-trip) | **0.35 / min**   | Pro/Scale plan blended; full back-and-forth dialogue |
| ElevenLabs Aurin storyteller minute (single-voice narrative) | **0.18 / min**   | cheaper engine; 60% cache-hit target on bedtime repeats |
| Polar.sh merchant-of-record fee            | **4% + 0.40**    | per transaction; covers EU VAT MOSS handling |
| MongoDB + S3 + KMS per active user / cycle | **2.00**         | observed at current preview-pod scale |
| Resend transmissions per cycle             | **0.50**         | ~25 cadence emails @ €0.02 |
| Founder concierge time (Sovereign only)    | **not in COGS**  | profit deferred; tracked separately |

**Margin doctrine:** Every consumer-grade bundle must clear **≥ 70%
gross margin** at the *fully-burned* usage ceiling — no exceptions.

---

## 2. Four Gates — the public bundle architecture

### 2.1 Headline table

| Gate | Public name | Voice (adult) | Voice (child) | Kids Universe | ConvAI | Direction |
|:---:|---|---:|---:|:---:|:---:|---|
| I   | **Cadence Access**      | ~15 min /cycle  | —              | demo only | — | quiet entry, reading-first |
| II  | **Quantum Compass**     | ~60 min /cycle  | —              | demo only | ✓ | the system's heart |
| III | **House Compass**   | ~90 min /cycle  | ~60 min /cycle | full      | ✓ | family retention layer |
| IV  | **Sovereign Circle**    | fair-use cap (hidden) | fair-use cap (hidden) | full + bespoke | ✓ | by interview only |

### 2.2 Pricing across all billing periods (final draft)

| Gate                | 1-day ticket | 1 month  | 1 quarter (3 mo) | 1 year (12 mo) |
|---------------------|-------------:|---------:|-----------------:|---------------:|
| I · Cadence Access  | **€19**      | **€69**  | **€189** (≈ 9% off) | **€690** (≈ 17% off, 2 cycles gifted) |
| II · Quantum Compass| **€39**      | **€169** | **€459** (≈ 10% off) | **€1,690** (≈ 17% off, 2 cycles gifted) |
| III · House Compass | —        | **€239** | **€649** (≈ 10% off) | **€2,390** (≈ 17% off, 2 cycles gifted) |
| IV · Sovereign Circle | —          | —        | **from €4,500**  | **from €16,000** (3 quarters paid forward, 1 gifted) |

**Why no day-ticket for Gates III + IV:**
- Gate III activates child profiles + Private Album infrastructure +
  KMS encryption. Provisioning and dismantling all of that for a 24-h
  ticket is not commercially viable and not parentally honest.
- Gate IV is interview-only; there is no transactional surface at all.

---

## 3. Per-bundle full specification (the contract behind each price)

### 3.1 Gate I · Cadence Access — €69 / month

**Positioning:** *"Passive resonance. The architecture speaks; you
read, breathe, take what serves you."*

**Includes:**
- All four cardinal rooms (Body · Parents · Clarity · Course) — read +
  log mode.
- 24-hour cadence transmissions from Sara · Kaelan · Grace · Alistair
  (written letters).
- The Broken Clockwork library — Acts I → IV at no surcharge as they
  ship.
- The Subsystem Wing (read access) inside the Parents' Room.
- Sovereign Counter + personal cadence log.
- **~15 voice minutes per cycle** (the taste — one or two short
  curator transmissions, Roll-Forward One Cycle).
- Kids Universe: Day 1 public demo only.

**Excludes:** Live ConvAI dialogue · child profiles · Private Album ·
top-up access for adult voice (must upgrade first).

**Margin model (worst case, full voice burn at €0.35/min adult):**

| Line                           | Cost (€) |
|--------------------------------|---------:|
| Voice 15 × 0.35                |     5.25 |
| Polar (4% × 69 + 0.40)         |     3.16 |
| Server + storage               |     2.00 |
| Resend cadence                 |     0.50 |
| **Total COGS**                 | **10.91** |
| **Revenue**                    | **69.00** |
| **Gross margin**               | **84.2%** |

---

### 3.2 Gate II · Quantum Compass — €169 / month

**Positioning:** *"Active telemetry. The architecture answers.
Bandwidth is measured in minutes, not subscriptions."*

**Includes:**
- Everything in Cadence Access.
- Live ConvAI dialogue with all four curators (Sara · Kaelan · Grace ·
  Alistair).
- Memory continuity across sessions.
- Extended archive access.
- **~60 adult voice minutes per cycle**, Roll-Forward One Cycle.
- Daily voice cap (30 min) — "the Compass cools between transmissions".
- Top-up access for adult voice (see §4).

**Excludes:** Kids Universe activation · child voice quotas · Private
Album.

**Margin model (worst case):**

| Line                           | Cost (€) |
|--------------------------------|---------:|
| Voice 60 × 0.35                |    21.00 |
| Polar (4% × 169 + 0.40)        |     7.16 |
| Server + storage               |     2.00 |
| Resend cadence                 |     0.50 |
| **Total COGS**                 | **30.66** |
| **Revenue**                    | **169.00** |
| **Gross margin**               | **81.9%** |

---

### 3.3 Gate III · House Compass — €239 / month

**Positioning:** *"Emotional house. One operating system for the
family. Adult and child bandwidth held in separate vaults."*

**Includes:**
- Everything in Quantum Compass.
- Adult voice quota **uplifted to ~90 min / cycle** (+30 over Gate II).
- **Kids Universe — all 3 zones unlocked** (Discovery · Exploration ·
  Creation).
- Aurin storyteller voice (fairytale_room).
- Emotion check-ins (puzzle_room) + weekly Parent Digest.
- Star-reward commitments + screen-free real-world ledger.
- Private Album (KMS-encrypted, password-reconfirm gated, one photo
  per node per child).
- **~60 Aurin voice minutes per cycle** (child layer — separate vault).
- Up to **3 child profiles**.
- Top-up access for adult AND child voice (independent SKU families).

**Excludes:** Bespoke curator tuning · isolated tenant · direct
Architect line (those live in Sovereign Circle).

**Margin model (worst case):**

| Line                                   | Cost (€) |
|----------------------------------------|---------:|
| Adult voice 90 × 0.35                  |    31.50 |
| Child voice 60 × 0.18                  |    10.80 |
| Polar (4% × 239 + 0.40)                |     9.96 |
| Server + storage + KMS (3 children)    |     4.00 |
| Resend digests + cadence               |     1.00 |
| **Total COGS**                         | **57.26** |
| **Revenue**                            | **239.00** |
| **Gross margin**                       | **76.0%** |

**Upgrade economics II → III:** marginal price uplift €70, marginal
COGS uplift €26.60 → **€43.40 extra contribution per cycle per
upgrader**. If 25% of Gate II holders upgrade, blended margin
improves by ~6 percentage points.

---

### 3.4 Gate IV · Sovereign Circle — from €4,500 / quarter

**Positioning:** *"High-frequency isolation. No buy button. By
interview only. A status anchor for the architecture above it."*

**Includes:**
- Everything in House Compass.
- Privately provisioned `Subsystem Wing` — isolated tenant, sealed
  data perimeter.
- Bespoke curator tuning (all four curators adapted to family / firm).
- Direct correspondence line with the Architect (founder).
- Unmetered curator dialogue under contractual fair-use cap (client
  sees no counter).
- Unlimited child profiles within one family unit.
- Founder-conducted onboarding interview before activation.
- 90-day minimum commitment.

**Margin model (worst case at fair-use ceiling 600 adult + 400 child min):**

| Line                                   | Cost (€) |
|----------------------------------------|---------:|
| Adult voice 600 × 0.35                 |   210.00 |
| Child voice 400 × 0.18                 |    72.00 |
| Polar (4% × 4500 + 0.40)               |   180.40 |
| Isolated tenant + KMS + ops            |    30.00 |
| Resend + concierge tooling             |    10.00 |
| **Total COGS**                         | **502.40** |
| **Revenue (quarterly)**                | **4,500.00** |
| **Gross margin**                       | **88.8%** |

---

## 4. Prepaid voice transmission packages (top-ups)

Top-ups are **SKU-namespaced**: adult-voice and child-voice quotas
cannot be cross-spent. Backend enforces this at the credit-document
level.

### 4.1 Adult-voice top-ups (`topup.compass.*`)

| SKU                    | Minutes | Price | €/min | Validity | Worst-case COGS | Margin |
|------------------------|--------:|------:|------:|---------:|----------------:|------:|
| `topup.compass.30`     |      30 |   €49 |  1.63 |  30 days |     €13.51      | 72.4% |
| `topup.compass.120`    |     120 |  €159 |  1.33 |  60 days |     €48.76      | 69.3% |
| `topup.compass.300`    |     300 |  €399 |  1.33 |  90 days |    €120.36      | 69.8% |

Available to **Gates II + III** holders only. Gate I cannot top-up
adult voice — must upgrade.

### 4.2 Child-voice top-ups (`topup.aurin.*`)

| SKU                    | Minutes | Price | €/min | Validity | Worst-case COGS | Margin |
|------------------------|--------:|------:|------:|---------:|----------------:|------:|
| `topup.aurin.20`       |      20 |   €29 |  1.45 |  30 days |     €5.16       | 82.2% |
| `topup.aurin.60`       |      60 |   €79 |  1.31 |  60 days |     €13.96      | 82.3% |
| `topup.aurin.150`      |     150 |  €169 |  1.13 |  90 days |     €33.16      | 80.4% |

Available to **Gate III** holders only.

---

## 5. The day-ticket (`access.day.*`) — single-day pass

A novel surface designed to capture **curious visitors who refuse
recurring billing on first contact**. Behaves like a museum day-pass:
24 hours of access from time of purchase, no auto-renew, no card on
file beyond the single charge.

| SKU                    | Duration | Price | Voice included | Notes |
|------------------------|---------:|------:|---------------:|-------|
| `access.day.cadence`   |    24 h  |  €19  |  0 min         | reading-only sample of Gate I |
| `access.day.compass`   |    24 h  |  €39  |  10 min adult  | ConvAI sample of Gate II      |

**Conversion vector:** at hour 22, an in-app prompt (and a single
gentle Resend transmission) offers the holder a one-click upgrade to
Cadence Access or Quantum Compass, applying the day-ticket cost as a
credit toward the first cycle. This is the only "discount-shaped"
mechanic permitted (and it is positioned as *honouring the prior
visit*, not as a sale).

**Margin model (`access.day.compass`, worst case):**

| Line                          | Cost (€) |
|-------------------------------|---------:|
| Voice 10 × 0.35               |     3.50 |
| Polar (4% × 39 + 0.40)        |     1.96 |
| Server + storage (1 day)      |     0.07 |
| **Total COGS**                | **5.53** |
| **Revenue**                   | **39.00** |
| **Gross margin**              | **85.8%** |

---

## 6. Three iron accounting rules running quietly underneath

1. **Voice is fuel, not a right.** No bundle ever offers "unlimited"
   to the customer. When minutes run out, voice locks and curators
   fall back to written transmission until the user buys a top-up.
   This is the platform's structural defence against an ElevenLabs
   bill that could otherwise scale faster than revenue.
2. **Two firewalled wallets in the family layer.** A child's
   storytelling minute can never accidentally consume the parent's
   ConvAI minute. Each `user_credits` document is namespaced by SKU
   family and atomically spent.
3. **Dignified expiry (Roll-Forward One Cycle).** Unused minutes
   roll into the next cycle and only then expire. HNW members do not
   feel cheated; the platform's balance sheet does not carry
   indefinite voice liability.

---

## 7. Implementation order (only after founder ratification of §8)

1. Polar.sh catalogue setup: **4 bundle SKUs × 4 billing periods + 6
   top-up SKUs + 2 day-ticket SKUs = 24 catalogue entries.**
2. Backend: SKU-namespaced `user_credits` + immutable `audit_log` (7-yr
   retention).
3. `/api/billing/polar/webhook` with HMAC verify + idempotency check
   + allocation + Resend welcome transmission.
4. `/api/voice/transmit` → adult-voice atomic spend with daily 30-min
   cap.
5. `/api/kids/fairytale-session` → aurin-voice atomic spend with daily
   20-min cap.
6. Day-ticket flow: time-bounded access token + hour-22 upgrade nudge.
7. Visitkaardi footer copy: anti-wellness line (no numeric price)
   per intro page.
8. Sovereign Circle anchor line on its intro page only.
9. GA4 events: `gate.disclosed`, `bundle.viewed`, `checkout.started`,
   `checkout.completed`, `voice.exhausted`, `topup.viewed`,
   `topup.purchased`, `dayticket.purchased`, `dayticket.upgraded`.
10. Smoke-test the full purchase → allocation → transmission loop on
    a test Polar org with founder's card.
11. Git tag release: `v3.2-membership-locked`.

---

## 8. Founder ratification — six live decisions

The final yes/no items before this draft becomes the working
specification:

1. **Gate III price point.** Drafted €239 / month. Hold, soften to
   €229, or steepen to €259?
2. **Day-ticket conversion credit.** Apply full ticket cost as a
   credit toward first cycle if upgraded within 7 days, or only 50%?
3. **Annual gift ratio.** Currently ~2 cycles gifted on every annual
   tier. Hold, or compress to 1 cycle until GA4 LTV data justifies
   the deeper gift?
4. **Sovereign Circle public anchor on its intro page.** Show
   "from €4,500 / quarter", raise to "from €7,500", or hide entirely
   until first three close privately?
5. **Demo policy in Gates I + II.** Show Kids Universe Day 1 public
   demo (as drafted, preserves the "preview the architecture"
   principle), or hide Kids Universe entirely from Gates I + II to
   maximise Gate III upgrade pressure?
6. **Day-ticket presence on public visitkaardi.** Visible on intro
   pages as the one numeric price disclosed pre-gate, or kept hidden
   like all other prices?

A single block reply (1c, 2a, 3a, etc.) is enough to lock v2.0.

---

## 9. What is explicitly NOT in this strategy

- ❌ No "Basic / Standard / Premium" wording.
- ❌ No discount badges ("save 20%", "limited offer").
- ❌ No "unlimited" qualifier in any customer-facing surface.
- ❌ No fungibility between adult and child voice quotas.
- ❌ No annual auto-renew with surprise charge: every annual term ends
  with an explicit re-entry transmission 14 days before renewal.
- ❌ No standalone Kids Universe SKU sold without an adult Gate III
  account.
- ❌ No word "credits" — always "prepaid voice transmission packages".
- ❌ No price tables published on public visitkaardi pages until
  Founder ratifies §8.6.

---

**End of Strategy v2.0 draft. Awaiting founder ratification of §8.**
