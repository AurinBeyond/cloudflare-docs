# Matrix Aurin — Membership Architecture v2.1

**Status:** DRAFT v2.1 · Pricing locked for founder review · 2026-02-12
**Supersedes:** v1.1, v2.0
**Currency posture:** All EUR prices include a 5–10% USD→EUR FX buffer
on every voice-COGS line. If USD weakens, margins improve; if USD
strengthens, we still hold ≥70%.
**Naming source:** GPT terminology locked in (Quiet Entry · Compass
Access · Family Compass · Sovereign Circle).
**Billing periods:** Day Pass · 1 month · 1 quarter · 1 year (no
multi-year locks — founder's call: pricing must remain re-tunable).

---

## 1. The five public surfaces

```
  [ DAY PASS · QUIET ]       — €49   · 24h · 30 adult-voice min
  [ DAY PASS · DEEP ]        — €89   · 24h · 60 adult-voice min
  [ DAY PASS · KIDS ]        — €25   · 24h · 1 Aurin fairytale + 1 emotion check-in

  [ I ]    QUIET ENTRY            — €89 / mo    €239 / qtr    €890 / yr
  [ II ]   COMPASS ACCESS  ⭐     — €229 / mo   €619 / qtr    €2,290 / yr
  [ III ]  FAMILY COMPASS  🏛️    — €329 / mo   €889 / qtr    €3,290 / yr
  [ IV ]   SOVEREIGN CIRCLE 🔒    — from €3,500 / qtr  ·  from €12,600 / yr
           (or Bespoke Sovereign  — from €5,500 / qtr · €19,800 / yr · interview only)
```

⭐ = primary membership · 🏛️ = highest LTV · 🔒 = application only

---

## 2. The day-pass family — the front door

Three single-day SKUs. No auto-renew. No card-on-file beyond the
single charge. Designed to be the **only numeric prices the public
ever sees** (founder's call — see §7.4).

| SKU                  | Audience           | Price | Voice              | 24h scope |
|----------------------|--------------------|------:|--------------------|-----------|
| `access.day.quiet`   | Curious reader     |  €49  | 30 min adult ConvAI | Quiet Entry mode |
| `access.day.deep`    | Operator sampling  |  €89  | 60 min adult ConvAI | Compass mode |
| `access.day.kids`    | Parent trying for child | €25 | 1 Aurin fairytale (~10 min) + 1 emotion check-in (~2 min) | Kids Universe Day 1 of all 3 zones |

**Conversion vector:** within 7 days of any day-pass purchase, the
full ticket cost converts to a credit toward the first cycle of the
matched bundle (Quiet → Quiet Entry, Deep → Compass Access, Kids →
Family Compass). This is the only "discount-shaped" mechanic
permitted, and it is positioned as **honouring the prior visit**, not
as a sale.

**Why a kids day-pass is a strategic weapon:**
- A parent will hesitate at €49 for themselves but will pay €25 for
  their child's bedtime in a heartbeat. The kids day-pass is the
  cheapest, highest-converting trial in the entire architecture.
- Aurin storyteller voice is the cheapest engine we run (~€0.18/min,
  60%+ cache-hit on repeated bedtime stories). The Aurin day-pass at
  €25 carries **~85% margin** even at full usage — see §3.

---

## 3. Margin model — every surface, fully burned

All numbers in EUR. Worst-case usage. Conservative.

### 3.1 Day passes

| Surface              | Voice cost | Polar fee | Server | Total COGS | Revenue | Margin |
|----------------------|----------:|----------:|-------:|-----------:|--------:|-------:|
| `access.day.quiet`   |   10.50   |   2.36    |  0.07  |   12.93    |   49    | 73.6%  |
| `access.day.deep`    |   21.00   |   3.96    |  0.07  |   25.03    |   89    | 71.9%  |
| `access.day.kids`    |    2.16   |   1.40    |  0.05  |    3.61    |   25    | 85.6%  |

### 3.2 Recurring bundles (monthly view)

| Bundle              | Voice (adult / child) | Voice cost | Polar | Server+KMS | Resend | Total COGS | Revenue | Margin |
|---------------------|-----------------------|----------:|------:|-----------:|-------:|----------:|--------:|-------:|
| Quiet Entry         |  15 / 0 min           |   5.25    | 3.96  |   2.00     |  0.50  |  11.71    |  89.00  | 86.8%  |
| Compass Access      |  60 / 0 min           |  21.00    | 9.56  |   2.00     |  0.50  |  33.06    | 229.00  | 85.6%  |
| Family Compass      |  90 / 60 min          |  42.30    | 13.56 |   4.00     |  1.00  |  60.86    | 329.00  | 81.5%  |

### 3.3 Sovereign Circle (worst case at fair-use ceilings)

| Tier                | Adult fair-use | Child fair-use | Voice cost | Polar  | Ops    | Total COGS | Revenue (qtr) | Margin |
|---------------------|---------------:|---------------:|----------:|-------:|-------:|----------:|--------------:|-------:|
| Sovereign Standard  |   450 min      |   300 min      |  211.50   | 140.40 |  30.00 |  381.90   |  3,500.00     | 89.1%  |
| Sovereign Bespoke   |   600 min      |   400 min      |  282.00   | 220.40 |  50.00 |  552.40   |  5,500.00     | 89.9%  |

---

## 4. Full content map — what every bundle actually contains

| Surface element | Day·Quiet | Day·Deep | Day·Kids | Quiet Entry | Compass | Family | Sovereign Std | Sovereign Bespoke |
|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| 4 cardinal written rooms (Body · Parents · Clarity · Course) | partial | ✓ | partial | ✓ | ✓ | ✓ | ✓ | ✓ |
| 24h cadence transmissions (Sara · Kaelan · Grace · Alistair) | preview | ✓ | preview | ✓ | ✓ | ✓ | ✓ | ✓ |
| The Broken Clockwork (Acts I–IV) | preview | ✓ | preview | ✓ | ✓ | ✓ | ✓ | ✓ |
| Subsystem Wing (read) | — | — | — | ✓ | ✓ | ✓ | ✓ | ✓ |
| Sovereign Counter + cadence log | — | ✓ | — | ✓ | ✓ | ✓ | ✓ | ✓ |
| **Live ConvAI voice** | 30 min | 60 min | — | ~15 min (taste) | **~60 min/cycle** | **~90 min/cycle** | fair-use 450 | fair-use 600 |
| Memory continuity across sessions | — | — | — | — | ✓ | ✓ | ✓ | ✓ |
| Extended archive | — | partial | — | partial | ✓ | ✓ | ✓ | ✓ |
| **Kids Universe (3 zones full)** | — | — | Day 1 all 3 | Day 1 demo | Day 1 demo | **✓ full** | ✓ full | ✓ full + bespoke |
| Aurin storyteller voice | — | — | 1 tale (~10 min) | — | — | **~60 min/cycle** | fair-use 300 | fair-use 400 |
| Up to 3 child profiles | — | — | 1 sandbox | — | — | ✓ | ✓ | unlimited (1 family) |
| Emotion check-in + Weekly Digest | — | — | 1 check-in | — | — | ✓ | ✓ | ✓ |
| Star-reward commitments (screen-free) | — | — | — | — | — | ✓ | ✓ | ✓ |
| Private Album (KMS-encrypted) | — | — | — | — | — | ✓ | ✓ | ✓ |
| Subsystem Wing — isolated tenant | — | — | — | — | — | — | ✓ | ✓ |
| Bespoke curator tuning | — | — | — | — | — | — | partial | ✓ |
| Direct Architect (founder) correspondence line | — | — | — | — | — | — | — | ✓ |
| Concierge onboarding interview | — | — | — | — | — | — | ✓ | ✓ |
| Top-up access (adult voice) | — | — | — | — | ✓ | ✓ | n/a (fair-use) | n/a (fair-use) |
| Top-up access (child voice) | — | — | — | — | — | ✓ | n/a (fair-use) | n/a (fair-use) |

---

## 5. Why a two-rung Sovereign (Standard + Bespoke)

The founder's instinct was correct: a single jump from Family
Compass (€889 / qtr) to Sovereign (€5,000 / qtr) is a **5.6× cliff**.
A second rung at €3,500 closes the gap with a more credible ladder:

```
       Family Compass      Sovereign Standard       Sovereign Bespoke
           €889    →           €3,500       →           €5,500
           |         3.9×                  1.6×
```

**Sovereign Standard (from €3,500 / qtr)** is the "I'm ready for
isolation, but I don't yet need a custom-tuned curator" door — gets
the isolated tenant, the digest, the concierge onboarding interview,
and a partial bespoke curator tune (one curator chosen).

**Sovereign Bespoke (from €5,500 / qtr)** is the full architecture —
all four curators tuned, direct Architect line, the deepest privilege
tier.

**Both are interview-only.** The public anchor on the Sovereign intro
page reads: *"By application. Quarterly engagement from €3,500."* The
second tier is mentioned only inside the interview transcript, after
qualification.

---

## 6. Top-up architecture (unchanged from v2.0, recap)

**Adult voice** (Compass + Family):
- `topup.compass.30` — 30 min · €49 · 30 days
- `topup.compass.120` — 120 min · €159 · 60 days
- `topup.compass.300` — 300 min · €399 · 90 days

**Child voice** (Family only):
- `topup.aurin.20` — 20 min · €29 · 30 days
- `topup.aurin.60` — 60 min · €79 · 60 days
- `topup.aurin.150` — 150 min · €169 · 90 days

**Day-pass extension** (same 24h window only):
- `topup.daypass.30` — +30 adult min · €40

All top-ups maintain ≥69% margin worst-case (largest packs absorb
the ElevenLabs plan-tier discount, giving the user better €/min as
they buy more — natural commitment ladder).

---

## 7. Six locked decisions (Anna confirmed 2026-02-12)

| # | Decision | Locked answer |
|---|----------|---------------|
| 1 | URL rename `/parent-portal/wellness` → `/parent-portal/digest` | ✅ executed |
| 2 | Day-pass model | ✅ two variants (€49 / 30 min + €89 / 60 min) + Day Pass Kids €25 |
| 3 | Compass Access monthly price | ✅ €229 |
| 4 | Day-pass converts to credit toward first cycle if upgrade ≤ 7 days | ✅ 100% credit |
| 5 | Sovereign Circle anchor | ✅ two rungs: Standard €3,500 / Bespoke €5,500 |
| 6 | Public visibility of prices during Coming-Soon | ⏳ pending: founder reviewing §7.4 below |

### 7.4 — Day-pass display strategy on public visitkaardi pages

**Recommended posture (the "Million-Dollar Book" forward motion):**
- All bundle prices remain **hidden** until past the gate (qualification page).
- The three day-pass SKUs **are visible** on visitkaardi pages — *as the only numeric prices the public sees*.

Why this works:
- The day-pass is the **forward-motion mechanism** — visitor sees a
  small, gentle number (€25 / €49 / €89) that says "you can step
  inside today, without subscription, without commitment".
- Recurring prices remain mystery → preserves HNW positioning.
- The €25 Kids day-pass becomes the **lowest-friction entry point**
  ever offered. A parent who would never buy €329/mo blind will
  reach for €25 to give their child a single bedtime story tonight.
- After purchase, the 7-day credit-conversion makes the day-pass
  cost feel like a *deposit*, not a sale.

If founder ratifies §7.4: implementation adds ONE public price
component on each room intro page — a single discreet line below the
"Walk through truth first" sequence, reading:

> *"One day inside · €25 / €49 / €89 · pass converts toward
> membership within seven days."*

---

## 8. Anti-bankruptcy guardrails (final)

| Guardrail | Adult layer | Kids layer | Day passes |
|-----------|-------------|------------|------------|
| Per-cycle bundled minutes cap | 15 / 60 / 90 | 60 | one-shot |
| Daily generation cap | 30 min | 20 min | bundled in pass |
| Per-purchase top-up cap | 1 / 24h | 1 / 24h | n/a |
| Provider monthly spend alert | 60% | 60% | 60% |
| Provider hard kill-switch | 90% | 90% | 90% |
| Concurrency per child profile | n/a | 1 session | 1 session |
| Day-pass token TTL | n/a | n/a | 24h hard, no refresh |

---

## 9. Polar catalogue final SKU list (21 entries)

```
─ Bundles (3 periods × 3 bundles = 9 SKUs)
quiet.entry.month            €89
quiet.entry.quarter          €239
quiet.entry.year             €890
compass.access.month         €229
compass.access.quarter       €619
compass.access.year          €2,290
family.compass.month         €329
family.compass.quarter       €889
family.compass.year          €3,290

─ Sovereign (interview-gated, 2 tiers × 2 periods = 4 SKUs)
sovereign.standard.quarter   from €3,500
sovereign.standard.year      from €12,600
sovereign.bespoke.quarter    from €5,500
sovereign.bespoke.year       from €19,800

─ Day passes (3 SKUs)
access.day.quiet             €49
access.day.deep              €89
access.day.kids              €25

─ Top-ups (7 SKUs)
topup.compass.30             €49
topup.compass.120            €159
topup.compass.300            €399
topup.aurin.20               €29
topup.aurin.60               €79
topup.aurin.150              €169
topup.daypass.30             €40
```

**Total: 23 SKUs** (was projected 24 in v2.0; bumped slightly to fit
Sovereign two-rung and Day Pass Kids).

---

## 10. Implementation order (next sprint)

1. Polar.sh catalogue: 23 SKUs above, all in EUR (with Polar handling
   USD / GBP auto-conversion at checkout).
2. Backend: SKU-namespaced `user_credits` + immutable `audit_log`
   (7-yr retention, GDPR-K compliant for kids layer).
3. `/api/billing/polar/webhook` — HMAC verify + idempotency + bundle
   provisioning + Resend transmission.
4. `/api/voice/transmit` — adult-voice atomic spend with 30-min daily cap.
5. `/api/kids/fairytale-session` — Aurin-voice atomic spend with
   20-min daily cap.
6. Day-pass flow: time-bounded JWT (24h TTL) + hour-22 credit-toward-
   bundle nudge.
7. Visitkaardi footer: single day-pass display line per room intro
   (only if §7.4 ratified).
8. Sovereign intro page anchor: "By application. Quarterly engagement
   from €3,500."
9. GA4 events: `gate.disclosed`, `bundle.viewed`, `daypass.viewed`,
   `daypass.purchased`, `checkout.started`, `checkout.completed`,
   `voice.exhausted`, `topup.viewed`, `topup.purchased`,
   `daypass.upgraded_to_bundle`.
10. Smoke-test full purchase → allocation → transmission loop on test
    Polar org with founder's own card.
11. Git tag release: `v3.2-membership-locked`.

---

## 11. Explicitly NOT in this strategy

- ❌ No "Basic / Standard / Premium" wording.
- ❌ No "save 20%" / "limited offer" / discount badges.
- ❌ No "unlimited" qualifier anywhere customer-facing.
- ❌ No fungibility between adult-voice and child-voice wallets.
- ❌ No multi-year locks. Annual ceiling.
- ❌ No standalone Kids Universe membership (Day Pass Kids is
  intentionally one-shot; Family Compass is the only recurring kids
  surface).
- ❌ No word "credits" in user-facing copy. Always "prepaid voice
  transmission packages" or "passes".
- ❌ No price tables on public visitkaardi pages. Day-passes excepted
  only after §7.4 ratification.
- ❌ No path that classifies the platform as "wellness" / "therapy" /
  "mental-health service" — protects merchant-of-record relationship
  with Polar.sh.

---

## 12. The one principle quietly running underneath everything

> *Members buy access to architecture, continuity, atmosphere, and
> private space. They do not buy AI minutes. Minutes are fuel; they
> are metered, expirable, and never positioned as a product. The
> moment a customer feels they are buying minutes, we have lost.*

---

**End of Strategy v2.1 · founder-ratified pending §7.4 decision · ready
for catalogue implementation.**
