# AURIN — TERVIKU LOOMISE TEGEVUSKAVA
### 2026-06-26 · The plan we follow step-by-step from here forward

This document is the **single source of truth** for what we do next.
Built from: Robin audit · Falsification report · Five-Persona simulation
· /about audit · Anna's decisions · GPT's strategic framing.

**No more new audits.** No more new hypotheses. Every action below
is either an execution step or a measurement step.

---

## 0 · The strategic shift that happened today

| Morning question                       | Evening question                                                                |
| -------------------------------------- | ------------------------------------------------------------------------------- |
| *"What's wrong with the website?"*     | *"How does a visitor move from second 0 to membership, and why would they?"*    |

This is a more mature question. Every decision below serves it.

---

## 1 · Four parallel work-tracks (GPT's framing, kept verbatim)

### TÖÖLIIN 1 — TRUST & UX (P0)
**Goal**: a visitor and a reviewer trust the site within 60 seconds.
- ✅ Secondary trust row (kept)
- ✅ STEP INSIDE → /about (kept)
- ✅ JSON-LD Organization + WebSite schema (kept)
- ✅ Security headers (kept)
- ⏳ **Nav consistency between / and /about** ← NEXT
- ⏳ **Sign-in affordance on /about** ← NEXT
- ⏳ Web Vitals — **measure first, then fix**
- ⏳ WCAG axe-core audit → fix specific findings (not assumed)
- ⏳ Spelling pass (after Robin gives specifics or we run our own)
- ⏳ GDPR cross-check (Robin findings may be false-positive)

### TÖÖLIIN 2 — USER JOURNEY (P0)
**Goal**: every step from `/` → `/about` → `/library` → `/pricing` →
checkout → member area answers the four questions:
1. What is this?
2. Who is it for?
3. Why different from free AI?
4. What is the next step?

**No CTA additions until the full journey is audited.** GPT is right:
adding a random "Read on" button without knowing where the natural
next step is would be guessing.

### TÖÖLIIN 3 — PAYMENTS (P0)
**Independent of UX.** Polar manual review pending. Gumroad already
integrated. Don't wait for UX to be perfect to keep payments moving.
- ⏳ Anna asks Kevin (FastSpring) the one-sentence question about
  whether rejection was based on (a) site, (b) entity type, or (c)
  trading history
- ⏳ If answer is (b): register OÜ (€265, 1 day in Estonia)
- ⏳ Gumroad stays warm as fallback

### TÖÖLIIN 4 — DISTRIBUTION (P0)
**Not after launch. Now.** Even a perfect site doesn't bring traffic.
- ⏳ Monday meeting with Robin / digital marketing
- ⏳ Ask the question GPT proposed: *"If you were an influencer, could
  you describe Aurin in one sentence to your audience?"*
- ⏳ Map per-persona entry points: parent → Sara, burnout → Grace,
  body/health → Kaelen, money → Alistair

---

## 2 · P1 — Value proposition (business strategy, not copy)

The sentence that answers:
> **"Why should I pay for Aurin when I have ChatGPT?"**

GPT's draft to anchor our thinking (Anna's voice required to finalise):
> *Aurin is not selling AI. Aurin offers a carefully created world of
> lived experience, real stories, curated knowledge and reflective
> dialogue, where AI serves as a guide rather than the destination.*

**This sentence is not written by an agent.** It will be born from:
1. The full user-journey audit (Tööliin 2)
2. The Monday meeting feedback (Tööliin 4)
3. Anna's own clarity after the funnel walk-through

It then becomes the seed for:
- /about hero
- homepage subtitle (replacing "Five rooms for people, parents…")
- pricing page header
- influencer pitch
- press kit

---

## 3 · P2 — Real-human validation (after P0+P1)

- **$20 UsabilityHub 5-Second Test** with 5 strangers · 3 questions:
  1. What is this website?
  2. Who is it for?
  3. What would your next click be?
- Microsoft Clarity script (15-min add) for 1-2 weeks of real
  heatmap + session-replay data
- Monday Robin meeting feedback
- First influencer / partner reaction

---

## 4 · What we DO NOT do anymore

❌ New audits
❌ New hypotheses
❌ "Maybe the problem is…"
❌ Writing new copy without strategic grounding
❌ Adding CTAs that haven't been earned by funnel evidence
❌ Predicting scores ("Robin 68 → 88") without measurement

---

## 5 · Decisions log — what Anna has confirmed today

| Topic | Decision |
| --- | --- |
| Trust row on homepage | KEEP (3 of 5 personas use it) |
| STEP INSIDE → /about routing | KEEP (re-route from /portal) |
| "About" wording on homepage | "What This Is" (Aurin-truthful) |
| "Enter" wording on homepage | "Step Inside" (Aurin-truthful) |
| JSON-LD schema | KEEP |
| Security headers | KEEP |
| Hero subtitle ("Five rooms for people, parents…") | UNTOUCHED — wait for user testing |
| /about hero CTA (Change B) | DEFERRED — waits for full funnel audit |
| /about nav consistency (Change A) | APPROVED — execute now |
| /about sign-in affordance (Change C) | APPROVED — execute now |
| New value-prop sentence | DO NOT WRITE YET — strategic, needs Anna |

---

## 6 · Immediate execution order (this session)

| # | Step | Tööliin | Owner | Status |
| --- | --- | --- | --- | --- |
| 1 | **Make /about use the same nav as homepage** (Change A) | 1 | Agent | NOW |
| 2 | **Add quiet "Already a member? Sign in" link to /about** (Change C) | 1 | Agent | NOW |
| 3 | **Take screenshot to verify both changes** | 1 | Agent | NOW |
| 4 | Update this plan + PRD with what we shipped | — | Agent | end of session |

### Deferred to next session (not now)

| # | Step | Tööliin | Owner |
| --- | --- | --- | --- |
| 5 | **Full funnel walk-through audit** (/ → /about → /library → /pricing → checkout) using the 4 questions at every step | 2 | Agent |
| 6 | **Measure Web Vitals properly** (Lighthouse via Playwright) | 1 | Agent |
| 7 | **Run axe-core on top 5 pages** to find the 10 WCAG AA issues Robin flagged | 1 | Agent |
| 8 | **Anna writes one-sentence question to Kevin (FastSpring)** | 3 | Anna |
| 9 | **Anna registers $20 5-Second Test** on UsabilityHub | 4 | Anna |
| 10 | **Monday Robin meeting** | 4 | Anna |
| 11 | **Anna decides on OÜ registration** based on Kevin's answer | 3 | Anna |
| 12 | **Value-prop sentence finalisation** (Anna writes, GPT refines) | P1 | Anna |

---

## 7 · The principle that holds it all together

Every step in this plan is **either an execution step or a
measurement step**. We have stopped speculating. From here, every
change is justified by:
- evidence (Robin / persona simulation / user test / Kevin's answer)
- or a clear strategic decision Anna has made.

This is what GPT meant by *"culpable maturity"*. Aurin is no longer
a project that is searching for what is wrong. It is a project that
is **executing what is known to be needed**.

---

## End

**Status**: live · followed step-by-step from now forward
**Next session**: starts at Step 5 (full funnel walk-through)
