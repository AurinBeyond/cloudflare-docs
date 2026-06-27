# HOUSE EXPERIENCE AUDIT — Framework
### A permanent tool for evaluating room-based digital experiences
### v1.0 · 2026-06-27

> *This framework was born inside the Aurin project, but it is written
> to be reusable for any digital experience that treats itself as a
> coherent inhabited space rather than a sequence of optimised landing
> pages. Museums, libraries, slow-reading platforms, atelier shops,
> world-based products — anywhere the metaphor of "house" applies.*

---

## 0 · Purpose of this tool

> **The purpose of the House Experience Audit is not to maximise
> conversions. It is to preserve the feeling that every room belongs
> to one coherent house while still allowing every visitor to find
> their own path through it.**

This is the constitution. Everything below serves this one sentence.

A traditional UX audit asks: *"Does this page convert?"*
A House Experience Audit asks: *"Does this room belong in this house?"*

The two are not the same question. A page can convert beautifully
and still break the house. A room can be slow and still hold the
house together. We are auditing **coherence**, not throughput.

---

## 1 · The two non-negotiable rules

### Rule 1 — The Golden Rule

> **A room is never evaluated in isolation. Every room is evaluated in
> relation to the room before it and the room after it.**

If a finding cannot be expressed as a transition (from → to), it does
not belong in this audit. It belongs in a different document.

### Rule 2 — The Anti-Optimisation Clause

> **No room may be optimised in isolation if that optimisation
> weakens the coherence of the house.**

This rule exists because, twelve months from now, someone will look
at one room and say *"this landing page converts better."* They will
be technically right and architecturally wrong. This clause gives
the house the authority to refuse that local win.

---

## 2 · The six axes of evaluation

At every transition between two rooms, ask these six questions in
this order:

### Axis 0 — Temperature
*Before architecture comes the felt sense.*
Light, tempo, silence, breath, density, hush vs. urgency.
> *"When I step through this door, does the air feel like the same
> air as the room I just left?"*

### Axis 1 — World
*Are we still inside the same fiction?*
Vocabulary, metaphors, named entities, the rules of this place.
> *"Could the next room exist in a completely different product
> without anyone noticing?"*

### Axis 2 — Voice
*Is the same person still speaking to me?*
Tone, sentence rhythm, pronoun choices, formality, warmth.
> *"Did the narrator change? Or worse — did the narrator suddenly
> become a marketing department?"*

### Axis 3 — Promise
*Does the next room honour what the previous one offered?*
If room A said *"come slowly"*, does room B not now sprint?
If room A said *"no funnel"*, does room B not now show a CTA stack?
> *"Is the contract still being kept?"*

### Axis 4 — Orientation
*Do I naturally know what comes next — without being pushed?*
Note: "next" is not always "forward". Sometimes it is back, sometimes
pause, sometimes simply read. Orientation is broader than next-step.
> *"Could I stop here without feeling rejected?"*

### Axis 5 — Trust
*Did this new room increase or decrease my trust?*
A room can earn trust by quiet design, by truth-telling, by what it
chooses not to ask. A room can lose trust by demanding too soon, by
hiding too much, by feeling like a different building.
> *"Am I more inside now, or less?"*

---

## 3 · The four verdicts

Every transition receives exactly one verdict per axis:

🟢 **Belongs naturally** — the door opens onto the same house. Nothing wobbles.
🟡 **Small wobble** — there is a flicker; the house holds, but I noticed it.
🟠 **Needs redesign** — the transition works mechanically but damages the house. It is fixable.
🔴 **Leaves the house** — the visitor feels they accidentally entered a different building. Critical.

A transition with even one 🔴 verdict is treated as broken even if
the other five axes are green.

---

## 4 · The multi-persona protocol

A house is not walked through by one person. Different visitors
arrive at different doors with different concerns. The audit must
honour that.

At each transition, the auditor explicitly swaps glasses to the
persona most likely to be standing in that doorway:

| Door (typical) | Persona at this door | What they notice |
|---|---|---|
| First entry (`/`) | **Merchant-of-record reviewer** | Is this a real business? |
| Entry → about | **GPT-Plus / curious skeptic** | Why is this not free chat? |
| About → library | **Quiet reader** | Will this respect my pace? |
| Library → keepers | **Person in difficulty** | Will this hold me? |
| Keepers → pricing | **Potential member** | Is the contract honest? |
| Pricing → checkout | **Buyer with a credit card** | Is this trustworthy at the moment of payment? |
| Any → legal/account | **Already-member** | Are my rights respected here? |

Other personas (parent, journalist, regulator, returning user) are
inserted at the doors where they are most plausible.

---

## 5 · The walk-through method

1. Begin at the canonical entry door (usually `/`).
2. List the rooms the visitor is likely to traverse, in the order
   most plausible for the persona currently active.
3. For each door (transition), record:
   - **From → To** (room names + URLs)
   - **Persona** active at this door
   - **Six axis verdicts** (one of 🟢🟡🟠🔴 each)
   - **One sentence** stating the felt experience
   - **One concrete fix** if any verdict is 🟠 or 🔴
4. Never grade the rooms themselves. Grade the doors.

---

## 6 · The output shape

A House Experience Audit produces **one document**, structured:

1. The route walked (rooms in order)
2. A door-by-door table of verdicts (6 axes × 4-level scale)
3. The top three transitions where coherence breaks (ranked)
4. The top three transitions that are already strong (so they are not accidentally damaged in a later sprint)
5. A prioritised, dated fix list — each item tied to a specific door and a specific axis

Anything not in this shape is not a House Experience Audit. It is
a different document. That is fine — but it should not be filed
under this name.

---

## 7 · When to run this audit

- After any new room is added.
- Before any launch.
- After any major copy or visual change to an existing room.
- When a stakeholder proposes "optimising" a single page.
- When a designer asks *"does this still belong?"* and cannot answer themselves.

It is also **the question to ask before adding a new room**:
*"If I add this room, will the house still feel like one house?"*
If the answer is unclear, build a draft and walk through it before
committing.

---

## 8 · What this framework is not

- ❌ Not a conversion-rate audit
- ❌ Not a SEO audit
- ❌ Not an accessibility audit (axe-core covers that — separately)
- ❌ Not a Web Vitals audit (Lighthouse covers that — separately)
- ❌ Not a launch-readiness checklist (that is a different document)
- ❌ Not a copy-edit pass
- ❌ Not a stakeholder workshop

It is only — and exclusively — about whether the experience feels
like one inhabited house.

---

## 9 · Why this exists

Most digital products are built page by page. Each page is owned
by a different optimisation team, each team has its own metric, and
over time the product becomes a mall — many shops, no architecture.

A House is the opposite: every room exists because of the rooms
around it, and the spaces between rooms matter as much as the
rooms themselves. The risk in a House is the slow erosion of
coherence; the risk in a Mall is failure to convert. Different
risks demand different audits.

This framework is the defence against the slow erosion.

---

## 10 · One closing principle

> **Do not optimise the room. Defend the house.**

If the two ever conflict, the house wins. Always.

---

## End

**Status**: v1.0, ratified 2026-06-27
**Owner of the house**: the project lead (currently Anna)
**Use it before**: any room change, any launch, any new room proposal
