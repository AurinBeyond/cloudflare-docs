# Matrix Aurin — Bundle & Pricing Strategy (Draft v1)

**Status:** DRAFT · Awaiting founder ratification · 2026-02-12
**Authors:** Founder (Anna) + AH Agent (acting as accountant / firm director / marketing head)
**Reference doctrine:** `BRAND_VOICE_LOCK.md`, `MATRIX_AURIN_GO_TO_MARKET_PLAN.md`
**Phase:** Pre-revenue · Coming-Soon waitlist (GA4 in validation)

> This document is the **single source of truth** for the offering
> architecture. It composes the GPT-generated 3-Gate geometry (which is
> brand-correct) with the accounting, regulatory, and operational
> guardrails the founder asked for.

---

## 1. Architectural verdict on the GPT proposal

**Accept (load-bearing):**

- The 3-Gate model: **Cadence Stream → Quantum Compass → Sovereign Circle**.
  This maps one-to-one onto the existing backend (Cadence engine vs ConvAI
  vs bespoke) — zero code-noise added, zero feature-table thinking.
- "Entry thresholds, not pricing tiers" framing in all public copy.
- Tier 1 contains **no AI voice generation** (pure-margin SaaS layer
  protected from API cost variance).
- Tier 3 has **no buy button** — by interview only — preserves status
  and anchors the perceived value of Tier 1 and Tier 2.
- The telecom-card mental model for voice: visible **minutes counter**,
  metered, expirable, top-up SKUs available.

**Modify (accountant overrides):**

1. **No-Roll-Over is too aggressive for HNW.** A founder paying €189/mo
   reading "your minutes burn at month-end" sounds like a telco scam,
   not an architectural house. Replace with **Roll-Forward One Cycle**
   (minutes carry into the next billing cycle, then expire). Still
   protects margin, still discourages hoarding, but reads as honourable.

2. **The €89/mo + 60 min combo is margin-fragile.** ElevenLabs Creator
   plan is ~€22/mo for ~100 k characters (~80 min audio). One heavy
   user on €89 burning 60 generated minutes is already on a thin
   margin once we add server, Polar fees, and Resend transmissions.
   The fix is to **separate voice from the base membership entirely**:
   - Tier 1 (Cadence Stream) ships **0 voice minutes** included.
   - Voice is unlocked exclusively at Tier 2 (Quantum Compass) where
     the higher price absorbs the COGS variance.

3. **"Credits" as a word is regulatorily dangerous in the EU.**
   Generic "credit currency" can be argued to fall under PSD2
   e-money rules. The fix is precise nomenclature: we sell
   **"prepaid voice transmission packages"** — defined units of a
   digital service, exactly like in-game telemetry, fully covered by
   normal VAT MOSS treatment via Polar.sh (our merchant of record).

---

## 2. The Three Gates (final structure)

### Gate I · The Cadence Stream

> *Passive resonance. The architecture speaks; you listen, log, walk
> through truth first.*

**What it is:**
- Full access to all four cardinal rooms (Body · Parents · Clarity ·
  Course) in read / log mode.
- The 24-hour cadence-lock: written transmissions from Kaelan, Grace,
  Sara, Alistair land on schedule.
- Full `The Broken Clockwork` library (Act I now; Acts II–IV as they
  ship at no surcharge).
- The Sovereign Counter and personal cadence log.
- **No live voice. No ConvAI. No real-time curator dialogue.**

**Why it exists:** This is the pure-margin layer. Serving it costs us
near-zero (DB read + Resend transmission). It validates intent without
exposing API cost to abuse.

**Pricing posture (draft):**
- Monthly cadence: **€89 / cycle**
- Annual cadence: **€890 / year** (two cycles gifted — luxury anchor,
  not "discount" language)

**Public surface during Coming-Soon:** Hidden. See §6.

---

### Gate II · The Quantum Compass

> *Active telemetry. The architecture answers. Bandwidth is metered.*

**What it is:**
- Everything in Gate I.
- Live ConvAI dialogue with the four curators (Sara, Kaelan, Grace,
  Alistair).
- Voice transmissions (ElevenLabs-generated, room-specific).
- **60 voice-transmission minutes per cycle, included.**
- Roll-Forward One Cycle on unused minutes (carry into next cycle, then
  expire — not infinitely hoardable, not telco-burned).

**Top-up architecture (prepaid voice transmission packages):**

| SKU                          | Minutes | Price  | Effective €/min | Validity         |
|------------------------------|--------:|-------:|----------------:|------------------|
| `topup.compass.30`           |      30 | €49    | €1.63           | 30 days from purchase |
| `topup.compass.120`          |     120 | €159   | €1.33           | 60 days from purchase |
| `topup.compass.300`          |     300 | €349   | €1.16           | 90 days from purchase |

**Margin model (target floor 70% post-COGS):**
- ElevenLabs effective cost at scale ≈ €0.18 – €0.25 per generated min
  (depending on plan: Creator → Pro → Scale).
- Server / streaming overhead: ≈ €0.05 / min.
- Polar.sh fee: 4% + €0.40 transaction.
- Worst-case COGS on `topup.compass.30`:
  `30 × 0.30 + 0.04×49 + 0.40 = €11.36` → gross margin
  `(49 − 11.36) / 49 = 76.8%` ✓

**Pricing posture (draft):**
- Monthly cadence: **€189 / cycle**
- Annual cadence: **€1,890 / year**

**Public surface during Coming-Soon:** Hidden. See §6.

---

### Gate III · The Sovereign Circle

> *High-frequency isolation. No buy button. By interview only.*

**What it is:**
- Everything in Gate I + Gate II.
- A privately provisioned `Subsystem Wing` (isolated tenant + sealed
  data perimeter).
- Bespoke curator tuning (Sara / Kaelan / Grace / Alistair adapted to
  the family / firm).
- Direct correspondence line with the Architect (founder).
- Unmetered curator dialogue under a contractual fair-use cap (we keep
  the cap, the client never sees a minute counter).

**Pricing posture (draft):**
- Quarterly engagement: **from €4,500 / quarter**.
- Mandatory founder interview before activation.
- 90-day minimum commitment.

**Public surface during Coming-Soon:** ONE anchor line. See §6.

---

## 3. Automatic post-payment allocation (Anna's legal point)

> "Pärast makset peab automaatselt edasi saatma kuhu vaja, et see on
> seaduslik, sama nagu mängudes."

This is correct and non-negotiable. EU consumer law (digital content
exemption from 14-day right of withdrawal) requires:

1. **Pre-payment explicit consent** that the digital service begins
   immediately and the withdrawal right expires once any minute is
   consumed. Polar.sh handles this checkbox at checkout.
2. **Immediate fulfilment** with paper trail.

**Backend flow (to implement after this draft is ratified):**

```
[ Polar Checkout ] ──webhook──► /api/billing/polar/webhook
                                   │
                                   ├─► verify signature (HMAC)
                                   ├─► idempotency check (payment_id)
                                   ├─► user_credits.insert({
                                   │     user_id, sku, minutes_granted,
                                   │     issued_at, expires_at,
                                   │     source_payment_id, vat_invoice_id
                                   │   })
                                   ├─► audit_log.insert({...immutable})
                                   ├─► Resend → transmission email
                                   │     ("Cycle granted · 60 min ·
                                   │      expires 2026-03-14")
                                   └─► return 200
```

**Voice gateway atomic spend:**

```
/api/voice/transmit
  ├─► find_one_and_update user_credits
  │     where minutes_remaining > 0 AND expires_at > now()
  │     decrement minutes_remaining by call_duration_estimate
  ├─► if no document matched → 402 Payment Required
  │     (telecom-style: "Bandwidth quota exhausted.
  │      Acquire transmission package to continue.")
  └─► after ElevenLabs response, reconcile actual duration in audit_log
```

**Compliance checklist:**
- [ ] Polar.sh acts as Merchant of Record → handles EU VAT MOSS, US
  sales tax, UK VAT. No founder VAT registration in 27 jurisdictions.
- [ ] `audit_log` collection is append-only and survives user delete
  (legal retention 7 years for tax in most EU jurisdictions).
- [ ] GDPR data export endpoint must include `user_credits` and the
  user's view of `audit_log` entries.
- [ ] At checkout, explicit "I consent that the digital transmission
  begins immediately and my right of withdrawal is waived upon first
  use" checkbox — Polar provides this; we just enable it.
- [ ] Refund policy page references "digital content — immediate
  performance" carve-out (Article 16(m) Consumer Rights Directive).

---

## 4. Anti-bankruptcy guardrails (the founder's actual fear)

Three independent rate-limits, layered:

1. **Per-cycle cap (Gate II):** 60 min included + max one top-up per
   24h (prevents one user purchasing 10× 300-min packs in an hour and
   us holding €1,500 worth of API liability on a single account).
2. **Daily generation cap:** 30 min hard ceiling per user per 24h
   regardless of credit balance — surfaces as "the Compass cools
   between transmissions" copy, never as an error.
3. **Provider-level monthly budget:** ElevenLabs spend alert at 60%,
   hard kill-switch at 90% of monthly budget. Forces us to migrate to
   a higher plan deliberately, never by surprise.

---

## 5. Sovereign Circle — operational mechanics

- Lead form is *not* "request a demo". It is `Apply for an Interview`.
- Founder-only review, 48 h response window.
- Activation only after a signed deed (one page, plain English) —
  protects against frivolous applications.
- Internal fair-use cap (e.g. 600 min / quarter) is never shown to the
  client. If a client passes 80% in the first month, the founder
  initiates a conversation about deepening engagement (upsell vector).

---

## 6. Public-surface strategy during Coming-Soon

**Decision:** Do **not** publish numerical pricing on any public
`visitkaart` (intro) page during the validation phase.

**Rationale (marketing head perspective):**
- We are validating traffic via GA4. Public prices become an anchor we
  cannot quietly walk back. If we publish €89 today and the data says
  €149 is correct, we either look greedy or scarce — both bad.
- HNW positioning requires "qualification before price". The intro
  pages should make the prospect want the gate; the gate reveals the
  price.
- Polar.sh checkout itself is the eventual price-reveal surface.

**What goes on the public surface instead** — one anti-wellness line
per room, brand-locked:

- All rooms (footer): *"Bandwidth is metered. Cadence is fixed.
  Pricing is disclosed at the gate."*
- Cadence Stream intro page: *"Cycle access opens once the gate
  closes."*
- Quantum Compass intro page: *"Live transmissions are measured in
  minutes, not subscriptions."*
- Sovereign Circle intro page (single anchor line, intentional):
  *"By application. Quarterly engagement from €4,500."*

This single Sovereign Circle anchor does the work of pricing the
entire platform without quoting the other two — exactly the GPT
geometry's point.

---

## 7. Open questions for founder ratification

1. **Roll-Forward One Cycle** (my recommendation) vs **No Roll-Over**
   (stricter, more telco-feel) — confirm preference.
2. **Annual pricing posture:** €890 (two cycles gifted) and €1,890
   (~2 cycles gifted) — keep, or reduce gift to one cycle to preserve
   margin until GA4 says LTV justifies it?
3. **Sovereign Circle public anchor** — keep at "from €4,500", raise to
   "from €7,500" to widen the gap, or hold entirely until first three
   are sold privately and we know the real average?
4. **Daily cap (30 min)** — confirm or set elsewhere (founder's call;
   accountant says 30 is the safe number, brand head can argue 45 to
   reduce friction-feel).
5. **Top-up validity periods** (30 / 60 / 90 days) — confirm or
   compress (shorter validity = more urgency, more rebuy, but more
   complaint risk).

---

## 8. What is NOT in this draft (deliberately)

- No "Basic / Pro / Premium" wording anywhere.
- No "save 20%" discount badges.
- No "unlimited" anywhere.
- No code-tag headers like `[ TIER_2_PRICING ]` (Brand Voice Tier 3
  ban).
- No public price tables on visitkaardi pages.

---

## 9. Next actions (in order, only after ratification)

1. Founder ratifies §7 open questions.
2. Update Polar.sh catalogue with the SKUs above
   (`cadence.stream.monthly`, `cadence.stream.annual`,
   `compass.quantum.monthly`, `compass.quantum.annual`,
   `topup.compass.30 / 120 / 300`, `sovereign.circle.application`).
3. Implement `/api/billing/polar/webhook` allocation flow (§3).
4. Implement `/api/voice/transmit` atomic credit spend (§3).
5. Append the public anti-wellness lines (§6) to the existing
   visitkaardi pages — copy only, no price reveal.
6. Smoke-test full purchase → allocation → transmission flow with
   founder's own card on test Polar org.
7. GA4 gate event (`gate.disclosed`) fires only after qualification —
   measures conversion from intro page → gate disclosure → checkout.

---
