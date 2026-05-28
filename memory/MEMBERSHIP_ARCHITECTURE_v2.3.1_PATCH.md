# Matrix Aurin — Membership Architecture v2.3.1 (PATCH)

**Status:** 🔒 LOCKED · 2026-02-12 · patch applied
**Patches:** v2.3 (which remains the base; this file overrides only
the two sub-sections marked below).
**Authority:** Founder's directive 2026-02-12 ("ole aus kliendiga, et
me alles alustame; otsusta ise raamatupidaja-finantsjuhi seisukohast").

> This patch fixes one honesty issue and adds one founding-cohort
> safeguard. It does not change any price. It does not reshuffle
> tiers. v2.3 numbers stand.

---

## PATCH 1 — Sovereign Bespoke: honest content language

### What changed
The phrase "Founder's asynchronous content channel" (v2.3 §2.4) was
ambiguous and implied a commitment to ship recorded content at some
schedule. The founder has not committed to a schedule. The honest
formulation is:

### Replace v2.3 §2.4 bullet:
~~Founder's asynchronous content channel — when the founder records
a podcast episode, writes an essay, or publishes a long-form letter,
it is delivered first to Bespoke members through their `Subsystem
Wing`.~~

### With:
**"Unlimited access to the founder's growing archive — every podcast,
essay, technique, and long-form letter the founder publishes during
the membership cycle, at no per-piece fee. The archive begins
modestly and expands as the platform matures. Bespoke members
receive new pieces first via their `Subsystem Wing`."**

### Why this is the correct language
- It is **structurally honest**: clients know the archive starts
  small and grows.
- It **protects the founder's time**: there is no monthly delivery
  obligation. The founder publishes when she chooses.
- It **rewards the client** for early entry: every piece added during
  their cycle is theirs without surcharge.
- It is **the same business model as a private member library**, not
  a consultation contract.
- It survives the test: a Bespoke member at month 6 with 4 published
  pieces cannot reasonably complain — they paid for *access to what
  exists and what comes*, not a fixed cadence.

---

## PATCH 2 — Founding Cohort lock for both Sovereign tiers

### The accountant's reasoning

v2.3 prices Sovereign Standard at €1,890/qtr and Sovereign Bespoke at
€3,490/qtr. The market math is sound (see v2.3 §3 for margin proof:
83.0% and 85.6% respectively). The question Anna raised is whether
€3,490 might be heavy for *the very first customers*, given the
archive is still nascent.

Three possible responses:

| Response | Risk | Reward |
|----------|------|--------|
| **(a) Drop price preemptively** to €2,490 | Re-anchor everyone lower; raising later reads as greedy | Easier first close |
| **(b) Hold price and wait** | First Bespoke sale may take 6–12 months | Premium positioning intact |
| **(c) Founding Cohort: lock the first 10 in, review after** | Honours early customers; creates legitimate scarcity narrative; preserves room to revise | Slightly more language to maintain |

**Founder's role (firma juht) reasoning:** option (a) is a tactical
mistake — every luxury house from Hermès to Soho House uses option
(c). Locking the first cohort in is the only way to discount honestly
without breaking future positioning.

### What this patch adds

A **Founding Cohort safeguard** that lives separately from the
pricing structure but enables intelligent course-correction:

#### Founding Cohort terms (applies to Sovereign Standard and Bespoke)

- **The first 10 Sovereign Standard members** lock in at €1,890/qtr
  (or €6,800/yr) **for life**, as long as their membership remains
  continuous.
- **The first 10 Sovereign Bespoke members** lock in at €3,490/qtr
  (or €12,500/yr) **for life**, same condition.
- Public copy (only on the Sovereign intro page, beneath the anchor):
  *"Founding Cohort: the first ten members lock in the founder rate
  for the lifetime of their membership."*
- After cohort fills: prices may be revised quarterly based on actual
  conversion data. The cohort price is preserved for those members.

#### Auto-review trigger

A **90-day quiet review** is encoded in this patch: if neither
Sovereign tier has converted a single member within 90 days of the
public launch of the Sovereign intro page, the founder reviews
Sovereign pricing with the agent. No agent is permitted to drop
Sovereign pricing without this review. No agent is permitted to add
founder-time to make Sovereign easier to sell.

This protects against two failure modes:
1. **Founder fatigue:** dropping prices too early because no one is
   buying yet (most luxury launches need 4–9 months of patience).
2. **Agent drift:** an AI agent re-introducing "founder calls" or
   "personal advisor" benefits to compensate for slow sales (the
   exact mistake this strategy was built to avoid).

---

## PATCH 3 — Public-facing copy line for Sovereign intro page (updated)

### Replace v2.3 §6 Sovereign anchor:
~~"By application. Quarterly engagement from €1,890."~~

### With (two lines, one beneath the other, room intro page only):
> ***By application. Quarterly engagement from €1,890.***
> *Founding Cohort: the first ten lock in the founder rate for life.*

The second line is the **only** mechanism the platform uses to
signal scarcity. No countdown timer. No "X spots left" widget. No
urgency badges. The line stays the same after the cohort fills —
it simply becomes historical fact at that point.

---

## PATCH 4 — Implementation note for next sprint

In the Polar.sh catalogue setup, each Sovereign SKU receives a
`metadata.cohort` field:

```
sovereign.standard.quarter   metadata: { cohort: "founding", seats_remaining: 10 }
sovereign.standard.year      metadata: { cohort: "founding", seats_remaining: 10 }
sovereign.bespoke.quarter    metadata: { cohort: "founding", seats_remaining: 10 }
sovereign.bespoke.year       metadata: { cohort: "founding", seats_remaining: 10 }
```

Webhook decrement: on every successful Sovereign purchase, the
`seats_remaining` counter decrements atomically. When `seats_remaining`
reaches 0, the public intro page automatically swaps to the
"post-cohort" anchor line (single sentence: *"By application. Quarterly
engagement from €1,890."*). Existing cohort members retain their
locked rate via Polar's grandfathering — no re-billing.

---

## What this patch does NOT change

- All v2.3 prices remain.
- All v2.3 bundle content remains.
- All v2.3 margins remain.
- The 24-SKU Polar catalogue remains.
- The AI-only doctrine remains absolute (no founder time, ever, in
  any tier).
- The Kids Day Pass €25 remains the sole public numeric anchor.

---

## The locked decision (founder + accountant + firma juht)

**Sovereign Standard €1,890/qtr · Bespoke €3,490/qtr · Founding
Cohort 10 + 10 seats · 90-day auto-review trigger.**

The platform is honest with the first ten members ("you locked in
founder pricing because the archive was new"). The platform is
honest with member 11 ("the cohort closed; current pricing reflects
the matured archive"). No one is misled. No one is rushed. No
founder time is implied or sold.

---

**End of v2.3.1 patch · LOCKED · ready for sprint implementation.**
