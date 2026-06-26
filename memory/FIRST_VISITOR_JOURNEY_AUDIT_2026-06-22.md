# First Visitor Journey + Room Hook Audit
*Date: 2026-06-22 · No-build deliverable · Pre-beta gate*

Three axes:
1. **Journey** — Discord-link → first conversation in each of 5 rooms
2. **Hook test** — 3-second recognition on the first screen (Tony Robbins clarity, Sara tone)
3. **Priority** — Critical / Important / Nice-to-Have

---

## 🟢 What is already strong (do not change)

### Grace · hero hook
> **"You stopped performing. That's why you're here."**
> ★★★★★ — instant recognition, anti-wellness tone, opens a real door. This is the standard the other four rooms should aspire to.

### Polarstar · hero hook
> **"Not another app to babysit. Audio adventures the family lives together — screen-down, ears-open."**
> ★★★★★ — sharp positioning, names the enemy (screen-as-babysitter), gives the alternative in 7 words.

### Landing · the negation
> **"Not a course. Not therapy. Five rooms for people, parents, and families — to slow down and hear yourself again."**
> ★★★★ — the "Not a course. Not therapy." double-no is the strongest line on the landing. Keep it.

---

## 🔴 CRITICAL — fix before Discord beta

### C1 · Wanderer Gate inconsistency across rooms
**Issue:** Of the 5 rooms, only **Body World** and **Parents' Room (Sara)** intercept with a Wanderer Gate. Grace, Alistair, and Polarstar open directly to their hubs.
**Why critical:** A first visitor will tick 5 boxes to enter Sara, then arrive at Grace and find no gate. They will think: *"Was the gate real or theatre?"* Either every private room has a gate, or none do — but the inconsistency erodes the threshold's authority.
**Recommendation:** Pick one of two paths *before* the invite goes out:
- **(a)** Gate ALL private rooms with the same 5-box Wanderer Agreement (Grace, Body World, Alistair, Sara, Polarstar-adult-side).
- **(b)** Keep the gate ONLY for the two rooms that touch psychological/parenting content (Sara, Body World). Add a one-line explainer to the landing or Philosophy page: *"Two rooms (Sara and Body World) ask you to read a short threshold before entering. The others do not."* — so the inconsistency is named, not hidden.

### C2 · Wanderer Gate is generic — does not name the room
**Issue:** Gate copy is "*A quiet threshold, with clear edges. This space was created for reflection, learning, and slow inner work.*" — identical for Body World and Sara. The visitor does not see *which* room they are about to enter until after they tick all 5 boxes.
**Why critical:** A visitor ticks 5 boxes and lands on an unexpected room → small but real trust hit. *"I agreed to something — but to what exactly?"*
**Recommendation:** One added line at the top of the gate, dynamic by room:
> *"You are about to enter __Sara's harbour__. Before you do —"*
> *"You are about to enter __Body World__. Before you do —"*
> *"You are about to enter __Grace's room__. Before you do —"*
> Tiny copy fix. Big trust gain.

### C3 · First-fold landing does not name the 5 rooms or their inhabitants
**Issue:** Landing says "Five rooms for people, parents, and families" but does **not** name them or their inhabitants on the first fold. Visitor must scroll or click ENTER to discover the rooms.
**Why critical:** Tony-Robbins test fails. 3 seconds in, the visitor knows the tone is "quiet, not a course". They do not know **whether anything here is for them.**
**Recommendation:** Add a single sub-section visible without scrolling — five small rows, each one line:
> ⛵ Sara · *for the spaces between people*
> 🔥 Grace · *for when you stopped performing*
> 🌿 Kaelen · *for what the body is saying*
> 🧭 Alistair · *for the questions that refuse to leave*
> ⭐ Polarstar · *for arriving through wonder, not lectures*

Each row links into that room. **First-fold = 5 recognitions in 3 seconds each.** Match the Grace standard.

### C4 · Sara Hub painted-asset wellness pills (existing debt)
**Issue:** *"Trustworthy · Compassionate · Practical · Inspiring · Growth-Oriented"* row is painted into the Sara Hub asset. Cannot be removed in code.
**Status:** Already documented in `PAINTED_ASSET_DEBT_2026-06-22.md`.
**Decision for beta:** Either regenerate the Sara Hub painting before invite (one of the painted-debt items addressed) OR include it in the framing line: *"Some rooms carry visible traces of earlier drafts."* (Founder choice — neither is wrong.)

---

## 🟡 IMPORTANT — fix during the beta period, not necessarily before

### I1 · Alistair's hub hook is abstract
**Current:** "ALISTAIR · LABORATORY OF LIFE · EXPLORE"
**Test:** 3-second visitor reads "Laboratory of Life" and asks: *"…of what?"* It is poetic but does not pull.
**Recommendation:** Add one Sara-style line under the title that says **what Alistair does to the visitor:**
> *"Alistair asks the questions that refuse to leave you alone."*
> Stays anti-wellness. Sharpens identity. Visitor knows in 3 seconds whether this is their room.

### I2 · Body World post-gate identity not visible above the fold
**Current:** After gate → Body World hub painting with 14 stones. No single line at the top saying *who Kaelen is* or *what this room is for*.
**Recommendation:** Add one line above the painted hub:
> *"Kaelen watches what the body has been quietly saying."*

### I3 · Parents' Room post-gate identity (Sara Hub)
**Current:** Sara Hub has Sara portrait + "Sara is always here" + 14 painted leaves. Identity is there but the wellness-pill row at the bottom contradicts it.
**Recommendation:** Until the painted asset is regenerated, the gate's new dynamic line *("You are about to enter Sara's harbour")* will partly bridge this. After regeneration, fully fixed.

### I4 · Wanderer Gate's 5 boxes — order is medical-first, room-feeling last
**Current order:** (1) educational not medical, (2) no specific outcomes, (3) not under psychiatric care, (4) full responsibility, (5) no redistribution.
**Issue:** Reads like a legal page from a clinic. The threshold says "this is a house" but the boxes say "this is a liability document". Tone mismatch.
**Recommendation:** Keep all 5 boxes (legally important) but **reorder** so the lighter "no redistribution" comes second, and the heavier medical-exclusion comes nearer the bottom. The first box could even be a softer one:
> *"I understand I am entering a quiet space, not a course or a clinic."*
> Same meaning, different doorway feeling.

### I5 · Global navigation bar dominates Sara/Wider Circle pages
**Current:** Header has 13 nav items + Enter Portal button, visible on every Sara/Wider Circle page. Painted hubs would breathe more without it.
**Recommendation:** On Sara/House routes (`/parents-room/*`, `/grace`, `/body-world`, `/alistair`, `/polarstar`), make the header **auto-hide on scroll** and reappear when scrolling up. CSS-only. One day of work after beta if testers confirm it bothers them.

---

## 🟢 NICE-TO-HAVE — backlog, not pre-beta

### N1 · Landing's "Matrix Aurin" as proper noun
"Matrix Aurin" is the brand but reads slightly sci-fi to a first-time visitor. Not a blocker — the surrounding copy carries the warmth. Revisit only if Discord testers flag it.

### N2 · Polarstar's redirect `/kids-universe → /kids-universe/polarstar`
Works correctly but a fresh visitor watching the URL bar may notice the redirect. Cosmetic only.

### N3 · "Aurin Philosophy" page hook
*"Beyond the frequency of limitation."* — strong line. But the underlying landing says "Not therapy". Philosophy page reads slightly more spiritual than the rest. Revisit voice consistency post-beta.

### N4 · Footer's "prulesoul.site" callout
Mentions the published face by name. Some Discord testers may not know the brand-vs-domain distinction. Revisit only if questions come.

---

## Tony-Robbins-style 3-second hook proposal — all 5 rooms

The standard Grace already meets. Apply to the other four:

| Room | Current first line | Proposed sharper first line |
|---|---|---|
| 🔥 Grace | *"You stopped performing. That's why you're here."* | **keep — gold standard** |
| ⛵ Sara | (after gate) Sara portrait, no single text hook | *"Did anyone notice you carrying it today?"* |
| 🌿 Kaelen | (after gate) painted hub, no single text hook | *"What has the body been quietly saying?"* |
| 🧭 Alistair | "Laboratory of Life · Explore" | *"What questions refuse to leave you alone?"* |
| ⭐ Polarstar | *"Not another app to babysit. screen-down, ears-open."* | **keep — strong** |

Each proposed line:
- ✅ 3-second readable
- ✅ Anti-wellness (no "transform / thrive / abundance / journey")
- ✅ Recognition-based ("am I that person?") not feature-based ("here's what we offer")
- ✅ Stays inside the painter / curator voice already locked in PRD

---

## What I would NOT touch before beta

- ❌ Pulse-feedback button (Discord chat is richer right now)
- ❌ 84 Sara Forest sub-nests (content debt, not journey debt)
- ❌ New rooms / new features
- ❌ "Invisible Brain Remote" / USD-EUR / ambient motion
- ❌ Auto-hide nav (one-day fix, do it during beta if confirmed)

---

## Pre-beta minimum (Critical only)

If founder approves, the work is:
1. **C1** — decide gate strategy (one of two options)
2. **C2** — add the one dynamic line to Wanderer Gate ("You are about to enter X")
3. **C3** — add 5-row room directory above the fold on landing
4. **C4** — decide whether to regenerate Sara Hub painting OR frame the painted debt in the invite

Estimated build time, if all four are approved: **half a day to one day**.

Then the Discord invite goes out.

---

## Founder's three-axis verdict (from the audit)

| Axis | Score |
|---|---|
| Architecture (5 rooms wired, routes, data, integrations) | 9 / 10 |
| Content depth (Sara Wider Circle locked, Forest sketched, others mid-fill) | 7 / 10 |
| Visual identity (painted aesthetic consistent, asset debt named) | 8.5 / 10 |
| First-visitor journey (the audit's focus) | **6.5 / 10 → after Critical fixes ≈ 8.5 / 10** |
| Beta-readiness | 8 / 10 → after Critical fixes ≈ 9 / 10 |

🌳🔥🌿🧭⭐
