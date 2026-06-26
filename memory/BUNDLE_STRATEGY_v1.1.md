# Matrix Aurin — Bundle Architecture v1.1

**Status:** DRAFT v1.1 · Founder ratification pending · 2026-02-12
**Supersedes:** `BUNDLE_STRATEGY_DRAFT.md` (v1.0)
**Why v1.1:** Adds the Kids Universe vertical as a first-class bundle
component (parent-driver) and resolves how voice-COGS is split between
adult ConvAI and the Aurin storyteller.

---

## 0. The mental model in one line

> **"You don't buy features. You acquire bandwidth into the
> architecture — and the architecture answers in measured minutes."**

The platform is composed of TWO operating layers:

| Layer | Who it speaks to | Voice engine                | COGS profile |
|-------|------------------|-----------------------------|--------------|
| Adult House | Founder / Parent | ConvAI (Sara / Kaelan / Grace / Alistair) | High variance — protected by `compass.voice` minutes |
| Kids Universe   | Child (via parent account) | Aurin storyteller (ElevenLabs, narrative) | Medium variance — protected by `aurin.voice` minutes |

Voice minutes are **never fungible across layers.** Adult-voice
minutes cannot be spent on a child fairytale and vice versa. This is
both an accounting protection (different COGS curves) and a child-
safety protection (no accidental adult-context spend on a child
session).

---

## 1. The Four Public Bundles + One Application Tier

```
┌──────────────────────────────────────────────────────────────────┐
│                        THE COMPASS LADDER                        │
└──────────────────────────────────────────────────────────────────┘

  [ I ]    CADENCE STREAM           — €89 / cycle      (€890 / yr)
            Adult · Read-only architecture · 0 voice

  [ II ]   QUANTUM COMPASS          — €189 / cycle     (€1,890 / yr)
            Adult · 60 adult-voice min · ConvAI

  [ III ]  FAMILY OPERATING SYSTEM  — €249 / cycle     (€2,490 / yr)
            Adult + Kids Universe · 90 adult-min · 60 aurin-min

  [ IV ]   SOVEREIGN CIRCLE         — from €4,500 / quarter
            By interview only · bespoke isolation

  [ + ]    PREPAID TRANSMISSION PACKAGES
            (top-ups, ladder-independent, see §3)
```

The order matters: Tier II is the marketing **sweet spot** (highest
expected conversion), Tier III is the **margin amplifier** (parents
upgrade once they realise the child experience is gated), Tier IV is
the **price anchor** that retroactively justifies I–III.

---

## 2. Bundle specification (full content map)

### Bundle I · The Cadence Stream — €89 / cycle

| Surface             | Included | Notes |
|---------------------|:--------:|-------|
| 4 Cardinal Rooms (Body · Parents · Clarity · Course) | ✓ | read + log mode |
| 24h Cadence transmissions (Sara · Kaelan · Grace · Alistair) | ✓ | written letters only |
| The Broken Clockwork library | ✓ | Acts I → IV at no surcharge |
| The Subsystem Wing (read access) | ✓ | inside Parents' Room |
| Sovereign Counter + personal cadence log | ✓ | |
| Adult voice (ConvAI) | ✗ | not unlocked |
| Kids Universe (3 zones) | ✗ | preview only (Day 1 demo, public) |
| Star-reward commitments | ✗ | |
| Private Album | ✗ | |

**Margin profile:** 97% post-COGS. This is the platform's pure
recurring-revenue floor. Designed for founders who want the
architecture but reject voice-AI on principle (a non-trivial HNW
segment).

---

### Bundle II · The Quantum Compass — €189 / cycle

| Surface             | Included | Notes |
|---------------------|:--------:|-------|
| Everything in Bundle I | ✓ | |
| ConvAI dialogue with all 4 curators | ✓ | live transmissions |
| **60 adult-voice minutes / cycle** | ✓ | Roll-Forward One Cycle |
| Daily voice cap (30 min) | ✓ | "the Compass cools between transmissions" |
| Kids Universe (3 zones) | ✗ | preview only |
| Private Album | ✗ | |

**Margin profile:** ≥ 72% post-COGS at full 60-minute monthly burn.
This is the **default recommended bundle** for any qualified single
operator (founder, exec, single-parent operator).

---

### Bundle III · The Family Operating System — €249 / cycle

| Surface             | Included | Notes |
|---------------------|:--------:|-------|
| Everything in Bundle II | ✓ | |
| **90 adult-voice minutes / cycle** (uplift from 60) | ✓ | |
| **Kids Universe — all 3 zones unlocked** | ✓ | Discovery · Exploration · Creation |
| Aurin storyteller voice (fairytale_room) | ✓ | |
| Emotion check-ins (puzzle_room) | ✓ | |
| Star-reward commitments + parent digest | ✓ | screen-free real-world ledger |
| Private Album (KMS-encrypted, password-reconfirm gated) | ✓ | one photo per node |
| **60 Aurin-voice minutes / cycle (child layer)** | ✓ | separate quota |
| Up to 3 child profiles | ✓ | siblings or co-parent's children |
| Weekly parent digest (emotion log + commitments) | ✓ | Resend transmission |

**Margin profile:** ≥ 68% post-COGS at full burn across both quotas.
Lower than Tier II by design — this bundle wins on **parent
willingness-to-pay for child-screen-free outcomes**, not on raw COGS
math. We anticipate Tier III to carry the highest LTV (parent renews
because the child won't let them stop).

---

### Bundle IV · The Sovereign Circle — from €4,500 / quarter

| Surface             | Included | Notes |
|---------------------|:--------:|-------|
| Everything in Bundle III | ✓ | |
| Privately provisioned `Subsystem Wing` (isolated tenant + sealed data perimeter) | ✓ | |
| Bespoke curator tuning (Sara / Kaelan / Grace / Alistair adapted to family / firm) | ✓ | |
| Direct correspondence line with the Architect | ✓ | |
| Unmetered curator dialogue under contractual fair-use cap | ✓ | client never sees a counter |
| Unlimited child profiles | ✓ | one family unit |
| Founder-conducted onboarding interview | ✓ | mandatory before activation |
| 90-day minimum commitment | ✓ | |

**Access:** No buy button anywhere. `Apply for an Interview` form
only. Founder reviews within 48 hours.

**Margin profile:** ≥ 80% post-COGS due to the fair-use cap absorbing
worst-case usage.

---

## 3. Prepaid Transmission Packages (top-ups, ladder-independent)

### Adult-voice (`topup.compass.*`)

| SKU                     | Minutes | Price  | €/min | Validity |
|-------------------------|--------:|-------:|------:|----------|
| `topup.compass.30`      |     30  | €49    | €1.63 | 30 days  |
| `topup.compass.120`     |    120  | €159   | €1.33 | 60 days  |
| `topup.compass.300`     |    300  | €349   | €1.16 | 90 days  |

Available to **Bundle II and III holders only.** Bundle I cannot
top-up adult voice — they must upgrade first (deliberate funnel).

### Aurin-voice (`topup.aurin.*`) — CHILD LAYER ONLY

| SKU                     | Minutes | Price  | €/min | Validity |
|-------------------------|--------:|-------:|------:|----------|
| `topup.aurin.20`        |     20  | €29    | €1.45 | 30 days  |
| `topup.aurin.60`        |     60  | €79    | €1.31 | 60 days  |
| `topup.aurin.150`       |    150  | €169   | €1.13 | 90 days  |

Available to **Bundle III holders only.** This is the second-largest
revenue driver in our LTV model: a parent will buy `aurin.60` rather
than tell the child "no story tonight". Pricing is deliberately
below adult-voice €/min because:
1. ElevenLabs single-voice narrative is cheaper than ConvAI back-and-forth.
2. Parents emotionally absorb child-spend more easily.
3. Volume drives the per-minute ElevenLabs plan up to higher tiers.

---

## 4. Visual scheme — the customer journey

```
                  ┌──────────────────────────────────┐
                  │          Public surfaces         │
                  │  (visitkaardid / intro pages)    │
                  │                                  │
                  │  No numerical prices visible.    │
                  │  One footer line per page:       │
                  │  "Bandwidth is metered.          │
                  │   Cadence is fixed.              │
                  │   Pricing is disclosed at        │
                  │   the gate."                     │
                  │                                  │
                  │  Sovereign Circle page only:     │
                  │  "By application. Quarterly      │
                  │   engagement from €4,500."       │
                  └────────────────┬─────────────────┘
                                   │
                       Visitor clicks ENTER
                                   │
                                   ▼
                  ┌──────────────────────────────────┐
                  │          The Sovereign Gate      │
                  │       (qualification page)       │
                  │                                  │
                  │  Three diagnostic questions      │
                  │  ("Walk through truth first")    │
                  │  → reveals pricing only after    │
                  │     completion.                  │
                  └────────────────┬─────────────────┘
                                   │
                                   ▼
                  ┌──────────────────────────────────┐
                  │      The Bundle Disclosure       │
                  │                                  │
                  │  I    Cadence Stream   €89       │
                  │  II   Quantum Compass  €189 ◀━━━ recommended
                  │  III  Family OS        €249 ◀━━━ best value
                  │  IV   Sovereign Circle (apply)   │
                  │                                  │
                  │  Annual posture toggle.          │
                  │  Top-up shelf below.             │
                  └────────────────┬─────────────────┘
                                   │
                                   ▼
                  ┌──────────────────────────────────┐
                  │           Polar Checkout         │
                  │                                  │
                  │  + EU consent checkbox           │
                  │    "I consent that the digital   │
                  │     transmission begins          │
                  │     immediately and my right of  │
                  │     withdrawal is waived upon    │
                  │     first use."                  │
                  └────────────────┬─────────────────┘
                                   │
                          payment.completed
                                   ▼
                  ┌──────────────────────────────────┐
                  │   /api/billing/polar/webhook     │
                  │                                  │
                  │  1. verify HMAC                  │
                  │  2. idempotency check            │
                  │  3. provision bundle + minutes   │
                  │  4. write audit_log (7-yr ret.)  │
                  │  5. Resend welcome transmission  │
                  │  6. return 200                   │
                  └──────────────────────────────────┘
```

---

## 5. How Kids Universe is solved (the question Anna asked)

### 5.1 Access principle
- Kids Universe is **bundled into Bundle III only.** Not sold
  standalone. Reason: every child surface requires a parent account
  in good standing (KYC implicit, GDPR-K explicit) — a standalone
  child-bundle would require us to operate as a direct child-data
  controller, which is regulatorily expensive and brand-risky.
- Bundles I and II see the **public demo (Day 1)** of each zone — same
  as a non-logged-in visitor. This is intentional: it preserves the
  upgrade path from Bundle II to III without locking the child entirely
  out of the visual world.

### 5.2 Voice isolation
- Adult `compass.voice` minutes and child `aurin.voice` minutes live in
  **two independent counters.** A spend on one never reduces the
  other. Backend enforces this by SKU-namespaced `user_credits`
  documents.
- Why: a child fairytale at 11pm should never accidentally consume the
  parent's morning ConvAI session quota. Brand-trust + COGS isolation
  in a single decision.

### 5.3 Child-data perimeter
- Voice recordings of children are **never stored** (transcription only
  for emotion-checkin log; audio is discarded after ElevenLabs
  response is streamed back).
- Photos in the Private Album are KMS-encrypted at rest, never
  appear in analytics, and require password re-confirmation before
  upload — even for an already-logged-in parent.
- Per-child quota: 3 child profiles in Bundle III. Sovereign Circle:
  unlimited but tied to a single family unit (no commercial multi-
  family use).

### 5.4 Pricing rationale for Bundle III's €60 uplift over Bundle II

| Component                                    | Notional cost to us |
|----------------------------------------------|--------------------:|
| Additional 30 adult-voice min                | ~€7.50              |
| 60 aurin-voice min                           | ~€12                |
| Storage + KMS for Private Album              | ~€2                 |
| Star-reward digest infra (Resend)            | ~€1                 |
| **Total COGS uplift**                        | **~€22.50**          |
| **Price uplift**                             | **€60**             |
| **Marginal contribution from upgrade**       | **€37.50** per cycle |

The €60 jump from Bundle II → III generates ~€37.50 of additional
contribution per cycle per upgrader. **If even 30% of Bundle II
holders upgrade to III, the platform's blended margin improves by
~7 percentage points.** This is the single highest-leverage upgrade
path in the architecture.

### 5.5 Aurin storyteller — voice engineering

- Same ElevenLabs voice ID as the existing Jutuvestja Aurin asset.
- Single-voice narrative (not turn-taking ConvAI) — cheaper per minute.
- Pre-generated for static fairytales (cached); dynamically generated
  only for child-specific personalised content.
- Cache-hit ratio target: 60%+ (most child sessions are repeated
  bedtime stories — strong cache locality).

---

## 6. Anti-bankruptcy guardrails (now with Kids layer)

| Guardrail                                   | Adult layer | Kids layer  |
|---------------------------------------------|-------------|-------------|
| Per-cycle bundled minutes cap               | 60 / 90     | 60          |
| Daily generation cap                        | 30 min      | 20 min      |
| Per-purchase top-up cap (max packs / 24 h)  | 1           | 1           |
| Provider-level monthly spend alert          | 60%         | 60%         |
| Provider-level kill-switch                  | 90%         | 90%         |
| Per-child profile concurrency               | n/a         | 1 active session at a time |

---

## 7. Founder ratification — five live questions

The five items I need a yes/no on before locking Strategy v2.0:

1. **Bundle III price point.** €249 / cycle as drafted, or €229
   (softer upgrade ramp from €189 → ?), or €279 (steeper upgrade,
   stronger anchor)?
2. **Aurin top-up validity.** 30 / 60 / 90 days as drafted, or shorter
   (15 / 30 / 60) to drive rebuy frequency?
3. **Annual posture.** €890 / €1,890 / €2,490 (two cycles gifted) —
   keep, or compress gift to one cycle until GA4 LTV data justifies
   it?
4. **Sovereign Circle public anchor.** "from €4,500" visible on the
   Circle intro page, raise to "from €7,500", or hide entirely until
   first three close privately?
5. **Demo policy in Bundles I & II.** Show Kids Universe Day 1 demo
   (as in §5.1), or hide Kids Universe entirely from Bundles I & II
   (stronger upgrade pressure, but breaks the "preview the architecture"
   principle)?

---

## 8. What is explicitly NOT in this strategy

- ❌ No "Basic / Standard / Premium" wording anywhere.
- ❌ No discount badges ("save 20%", "limited offer").
- ❌ No "unlimited" qualifier anywhere except Sovereign Circle's
  *internal* fair-use language (never client-facing).
- ❌ No fungibility between adult and child voice quotas.
- ❌ No public price tables on `visitkaart` intro pages during
  Coming-Soon validation.
- ❌ No standalone Kids Universe SKU sold without an adult Bundle III
  account.
- ❌ No mention of "credits" as a currency word — always "prepaid
  voice transmission packages".

---

## 9. Implementation order (only after §7 ratification)

```
1. Polar.sh catalogue: 4 bundle SKUs + 6 top-up SKUs
2. Backend: SKU-namespaced user_credits + audit_log
3. /api/billing/polar/webhook (allocation + idempotency)
4. /api/voice/transmit  → adult-voice atomic spend
5. /api/kids/fairytale-session → aurin-voice atomic spend
6. Visitkaart footer copy: one anti-wellness line per room
7. Sovereign Circle anchor (single line, intro page only)
8. GA4 events: gate.disclosed, bundle.viewed, checkout.started,
   checkout.completed, voice.exhausted, topup.viewed, topup.purchased
9. Smoke-test the full purchase → allocation → transmission loop
   with founder's own card on test Polar org
10. Founder Lock: tag git release v3.1-bundles-locked
```

---

**End of Strategy v1.1 draft.**
