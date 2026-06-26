# Matrix Aurin — Membership Architecture v2.2 (FINAL LOCK)

**Status:** 🔒 LOCKED for catalogue implementation · 2026-02-12
**Supersedes:** v1.1, v2.0, v2.1
**Provenance:** Founder (Anna) + GPT v1.1 final brainstorm + AH Agent
accountant pass. Lock condition: ≥70% gross margin worst-case on every
public surface, ≤70% USD/EUR FX risk absorbed, zero positioning
exposure to "wellness / therapy / mental-health" PSP categories.
**Naming:** GPT v1.1 terminology accepted (Quiet Entry · Aurin
Storyteller · Inner Compass · House Compass · Sovereign Circle).

> Members buy access to architecture, continuity, atmosphere, and
> private space. They never buy AI minutes. Minutes are fuel; metered,
> expirable, never positioned as a product.

---

## 1. The Six Public Surfaces

```
  [ KIDS DAY PASS ]              — €25   · avalikult nähtav (sole pre-gate)
                                            1 Aurin fairytale + 1 emotion check-in · 24 h

  [ I ]    QUIET ENTRY                 — €89  / mo · €239 / qtr · €890  / yr
  [ II ]   AURIN STORYTELLER 👶 (NEW)  — €79  / mo · €209 / qtr · €790  / yr
  [ III ]  INNER COMPASS ⭐            — €229 / mo · €619 / qtr · €2,290 / yr
  [ IV ]   SANCTUARY COMPASS 🏛️       — €329 / mo · €889 / qtr · €3,290 / yr
  [ V ]    SOVEREIGN CIRCLE 🔒
            · Standard from €3,500 / qtr · €12,600 / yr · interview only
            · Bespoke  from €5,500 / qtr · €19,800 / yr · interview only

  [ ADULT DAY PASSES — gate-side only, never on public visitkaart ]
  · access.day.quiet  €49 / 30 min adult ConvAI / 24 h
  · access.day.deep   €89 / 60 min adult ConvAI / 24 h
```

⭐ = primary membership · 🏛️ = highest LTV · 🔒 = application only · 👶 = standalone children's bundle

---

## 2. The Aurin Storyteller — why it exists, what it costs

Standalone children's bundle. Specifically for parents who want the
bedtime ritual for their child **without** taking on the adult
vertical themselves. This was a gap in v2.1 and is the single most
important architectural addition in v2.2.

### 2.1 What it contains
- Kids Universe — all 3 zones (Discovery · Exploration · Creation).
- Aurin storyteller voice (calming, screen-down narrative engine).
- ~60 Aurin-voice minutes per cycle, Roll-Forward One Cycle.
- 1 child profile (House Compass extends this to 3).
- Emotion check-in (`puzzle_room`) — voice or written.
- Star-reward commitments (screen-free real-world ledger).
- Private Album (KMS-encrypted, password-reconfirm gated) — 1 child.
- Weekly Parent Digest (emotion log + commitment status).

### 2.2 What it deliberately excludes
- The four cardinal adult rooms (Body · Parents · Clarity · Course).
- ConvAI dialogue with curators.
- The Broken Clockwork library.
- The Subsystem Wing.
- Adult-voice quota of any kind.

This is the firewall that keeps the bundle's COGS predictable and the
child-data perimeter cleanly isolated from adult-context spend.

### 2.3 Margin model (worst case at full voice burn)

| Line                                | Cost (€) |
|-------------------------------------|---------:|
| Aurin voice 60 × 0.18               |    10.80 |
| Polar (4% × 79 + 0.40)              |     3.56 |
| Server + KMS (1 child + Album)      |     3.00 |
| Resend digest                       |     0.50 |
| **Total COGS**                      | **17.86** |
| **Revenue**                         | **79.00** |
| **Gross margin**                    | **77.4%** |

### 2.4 Why €79 (not €69, not €89)
- **Lateral parity, not Tier-1 floor.** Aurin Storyteller is a side
  door, not the bottom rung of a ladder. A parent who buys it should
  not feel they "settled for the cheap option" — they made a different
  choice.
- **€10 below Quiet Entry (€89)** because Storyteller carries less
  total content surface than the adult house. Pricing tells the
  truth of the relative bundle.
- **Family Compass upgrade ratio 4.2×** is steep, but the jump
  represents the entire adult vertical + 3 child profiles + adult
  voice + Subsystem Wing. The upgrade is **value-honest**.

### 2.5 Upgrade economics → Family Compass
A parent who outgrows Aurin Storyteller (e.g. wants ConvAI for
themselves, or has a second/third child) upgrades to House
Compass for **€250/mo delta**. Marginal COGS uplift: ~€43. Marginal
contribution per upgrader: **€207/cycle**. This is the single
highest-leverage upgrade vector in the architecture — even more so
than the v2.1 Compass → House path, because the parent has
already validated child usage before deciding.

---

## 3. Complete margin matrix — every surface, worst-case usage

### 3.1 Recurring bundles (monthly view)

| Bundle              | Voice (adult/child) | Voice cost | Polar | Server | Resend | Total COGS | Revenue | Margin |
|---------------------|---------------------|-----------:|------:|-------:|-------:|-----------:|--------:|-------:|
| Quiet Entry         | 15 / 0   min        |   5.25     | 3.96  |  2.00  |  0.50  |  11.71     |  89.00  | 86.8%  |
| Aurin Storyteller   |  0 / 60  min        |  10.80     | 3.56  |  3.00  |  0.50  |  17.86     |  79.00  | 77.4%  |
| Inner Compass       | 60 / 0   min        |  21.00     | 9.56  |  2.00  |  0.50  |  33.06     | 229.00  | 85.6%  |
| House Compass   | 90 / 60  min        |  42.30     | 13.56 |  4.00  |  1.00  |  60.86     | 329.00  | 81.5%  |
| Sovereign Standard  | 450 / 300 min (fair-use ceiling) | 211.50 | 140.40 | 30.00 | — | 381.90 | 3,500 / qtr | 89.1% |
| Sovereign Bespoke   | 600 / 400 min (fair-use ceiling) | 282.00 | 220.40 | 50.00 | — | 552.40 | 5,500 / qtr | 89.9% |

### 3.2 Day passes (single-charge, no auto-renew)

| SKU                 | Voice cost | Polar | Server | Total COGS | Revenue | Margin |
|---------------------|-----------:|------:|-------:|-----------:|--------:|-------:|
| `access.day.kids`   |    2.16    | 1.40  |  0.05  |   3.61     |   25    | 85.6%  |
| `access.day.quiet`  |   10.50    | 2.36  |  0.07  |  12.93     |   49    | 73.6%  |
| `access.day.deep`   |   21.00    | 3.96  |  0.07  |  25.03     |   89    | 71.9%  |

All passes apply **100% of ticket cost as credit toward first cycle**
of the matched bundle if upgrade happens within 7 days of purchase.

---

## 4. Full content map across all surfaces

| Element | Kids·Day | Day·Quiet | Day·Deep | Quiet Entry | Aurin Storyt. | Inner Compass | House | Sovereign Std | Sovereign Besp. |
|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| 4 cardinal adult rooms (Body · Parents · Clarity · Course) | preview | partial | ✓ | ✓ | — | ✓ | ✓ | ✓ | ✓ |
| 24h cadence transmissions | preview | preview | ✓ | ✓ | — | ✓ | ✓ | ✓ | ✓ |
| The Broken Clockwork library | preview | preview | ✓ | ✓ | — | ✓ | ✓ | ✓ | ✓ |
| Subsystem Wing (read mode) | — | — | — | ✓ | — | ✓ | ✓ | ✓ | ✓ |
| Sovereign Counter + cadence log | — | — | ✓ | ✓ | — | ✓ | ✓ | ✓ | ✓ |
| **Live ConvAI dialogue** | — | 30 min | 60 min | ~15 min taste | — | **~60 min/cycle** | **~90 min/cycle** | fair-use 450 | fair-use 600 |
| Memory continuity | — | — | — | — | — | ✓ | ✓ | ✓ | ✓ |
| Extended archive | — | partial | — | partial | — | ✓ | ✓ | ✓ | ✓ |
| **Kids Universe (3 zones full)** | Day 1 all 3 | — | — | Day 1 demo | **✓ full** | Day 1 demo | **✓ full** | ✓ full | ✓ full + bespoke |
| Aurin storyteller voice | 1 tale (~10 min) | — | — | — | **~60 min/cycle** | — | **~60 min/cycle** | fair-use 300 | fair-use 400 |
| Child profiles | 1 sandbox | — | — | — | **1** | — | **3** | 3 | unlimited (1 family) |
| Emotion check-in + Parent Digest | 1 check-in | — | — | — | ✓ | — | ✓ | ✓ | ✓ |
| Star-reward commitments | — | — | — | — | ✓ | — | ✓ | ✓ | ✓ |
| Private Album (KMS-encrypted) | — | — | — | — | **1 child** | — | **3 children** | ✓ | ✓ |
| Subsystem Wing — isolated tenant | — | — | — | — | — | — | — | ✓ | ✓ |
| Bespoke curator tuning | — | — | — | — | — | — | — | partial (1 curator) | ✓ all 4 |
| Direct Architect (founder) line | — | — | — | — | — | — | — | — | ✓ |
| Top-up access — adult voice | — | — | — | — | — | ✓ | ✓ | fair-use | fair-use |
| Top-up access — child voice | — | — | — | — | ✓ | — | ✓ | fair-use | fair-use |

---

## 5. Public-surface display strategy (§7.4 ratified)

Only **one numeric price** ever appears on a visitkaart (room intro)
page during Coming-Soon. That price is the Kids Day Pass.

**Implementation:** Each room intro page receives a single discreet
line, placed below the "Walk through truth first" sequence:

> *"A quiet bedtime passage for children — from €25."*

Adult Day Passes (€49 / €89), all four recurring bundles, and the
Sovereign tiers remain **behind the gate** until qualification is
complete. The Sovereign Circle intro page receives its single anchor
sentence: *"By application. Quarterly engagement from €3,500."*

Polar.sh checkout is the eventual price-reveal surface for everything
except the Kids Day Pass.

---

## 6. Top-up architecture (validity 30 / 60 / 90 days — locked)

Note: GPT v1.1 proposed tightening validity to 30/45/60 days. Founder
+ AH agent recommendation: **keep 30/60/90**. Reasoning: shorter
validity reads as telco-style on the heaviest pack (€399/300 min);
HNW positioning recovers slower from that than the platform recovers
from carrying ~60 days extra balance-sheet liability.

### Adult voice (Inner Compass + House Compass holders)

| SKU                    | Min | Price | €/min | Validity | Margin |
|------------------------|----:|------:|------:|---------:|-------:|
| `topup.compass.30`     |  30 |  €49  | 1.63  | 30 days  | 72.4% |
| `topup.compass.120`    | 120 | €159  | 1.33  | 60 days  | 69.3% |
| `topup.compass.300`    | 300 | €399  | 1.33  | 90 days  | 69.8% |

### Child voice (Aurin Storyteller + House Compass holders)

| SKU                    | Min | Price | €/min | Validity | Margin |
|------------------------|----:|------:|------:|---------:|-------:|
| `topup.aurin.20`       |  20 |  €29  | 1.45  | 30 days  | 82.2% |
| `topup.aurin.60`       |  60 |  €79  | 1.31  | 60 days  | 82.3% |
| `topup.aurin.150`      | 150 | €169  | 1.13  | 90 days  | 80.4% |

### Day-pass extension (same 24h window only)

| SKU                    | Min | Price | Margin |
|------------------------|----:|------:|-------:|
| `topup.daypass.30`     |  30 |  €40  | 67.4% |

---

## 7. Polar.sh final catalogue (24 SKUs)

```
─ Recurring bundles (4 bundles × 3 periods = 12 SKUs)
quiet.entry.month            €89
quiet.entry.quarter          €239
quiet.entry.year             €890
aurin.storyteller.month      €79
aurin.storyteller.quarter    €209
aurin.storyteller.year       €790
inner.compass.month          €229
inner.compass.quarter        €619
inner.compass.year           €2,290
house.compass.month      €329
house.compass.quarter    €889
house.compass.year       €3,290

─ Sovereign (4 SKUs · interview-gated)
sovereign.standard.quarter   from €3,500
sovereign.standard.year      from €12,600
sovereign.bespoke.quarter    from €5,500
sovereign.bespoke.year       from €19,800

─ Day passes (3 SKUs)
access.day.kids              €25
access.day.quiet             €49
access.day.deep              €89

─ Top-ups (7 SKUs)
topup.compass.30             €49
topup.compass.120            €159
topup.compass.300            €399
topup.aurin.20               €29
topup.aurin.60               €79
topup.aurin.150              €169
topup.daypass.30             €40
```

---

## 8. Three anti-bankruptcy rules running quietly underneath

1. **Voice is fuel, never a right.** No bundle ships "unlimited" to
   the customer. When minutes reach zero, voice locks and curators
   fall back to writing until the user buys a top-up. Structural
   defence against an ElevenLabs invoice scaling faster than revenue.
2. **Two firewalled wallets in every family-layer surface.** Adult
   ConvAI minutes and Aurin storyteller minutes live in separate
   SKU-namespaced credit documents. A child's bedtime cannot
   accidentally drain the parent's morning ConvAI session.
3. **Dignified expiry (Roll-Forward One Cycle).** Unused recurring
   minutes carry into the next cycle only, then expire. HNW members
   are not insulted by telco-style burn; the platform avoids
   indefinite liability.

---

## 9. Implementation order (next sprint)

1. Polar.sh catalogue: 24 SKUs above, all EUR, Polar handles
   USD/GBP/auto-conversion at checkout.
2. Backend: SKU-namespaced `user_credits` + immutable `audit_log`
   (7-year retention; GDPR-K compliant; Article 16(m) consent on
   digital-content immediate-performance carve-out).
3. `/api/billing/polar/webhook` — HMAC verify + idempotency check +
   bundle provisioning + Resend welcome transmission.
4. `/api/voice/transmit` — adult-voice atomic spend with 30-min
   daily cap.
5. `/api/kids/fairytale-session` — Aurin-voice atomic spend with
   20-min daily cap.
6. Day-pass flow: time-bounded JWT (24h TTL) + hour-22 credit-toward-
   bundle nudge via Resend.
7. Visitkaardi single-line display: *"A quiet bedtime passage for
   children — from €25."* — applied to every room intro.
8. Sovereign intro page anchor: *"By application. Quarterly
   engagement from €3,500."*
9. GA4 events: `gate.disclosed`, `bundle.viewed`, `daypass.viewed`,
   `daypass.purchased`, `checkout.started`, `checkout.completed`,
   `voice.exhausted`, `topup.viewed`, `topup.purchased`,
   `daypass.upgraded_to_bundle`, `storyteller.upgraded_to_house`.
10. Smoke-test full purchase → allocation → transmission loop on
    test Polar org with founder's own card.
11. Git tag release: `v3.2-membership-locked`.

---

## 10. Explicitly NOT in this strategy

- ❌ No "Basic / Standard / Premium" wording.
- ❌ No "save 20%" / "limited offer" / discount badges.
- ❌ No "unlimited" qualifier anywhere customer-facing.
- ❌ No fungibility between adult-voice and child-voice wallets.
- ❌ No multi-year locks. Annual ceiling.
- ❌ No standalone Kids Universe + Aurin Storyteller without an adult
  parent account (KYC + age-attest + GDPR-K consent at registration).
- ❌ No word "credits" in user-facing copy. Always "prepaid voice
  transmission packages" or "passes".
- ❌ No public price tables on visitkaardi pages. Kids Day Pass €25
  is the sole pre-gate numeric disclosure.
- ❌ No path classifying the platform as "wellness" / "therapy" /
  "mental-health service". Protects Polar.sh merchant-of-record
  relationship.
- ❌ No "Quantum" anywhere customer-facing (GPT v1.1 verdict: register
  is too tech-bro). Replaced with "Inner".

---

## 11. The locked principle underneath everything

> *Aurin is not an AI product. It is a layered private digital
> membership world. The user buys access, continuity, atmosphere, and
> private space. They never buy AI minutes — those exist only to
> create the felt presence of the architecture, and they remain
> metered so the platform survives.*

---

**End of Strategy v2.2 · LOCKED for catalogue implementation.**
