# AURIN COMPLIANCE — FINAL ACTION PLAN v4

**Status:** REVIEW DRAFT — no code has been touched
**Author:** E1 (2026-02) — synthesised from Anna's feedback + GPT's audit + v3 evidence classification
**Approval owner:** Anna
**Prior documents:** `AURIN_COMPLIANCE_ACTION_PLAN_v3.md` (backing analysis) · `AURIN_COMPLIANCE_AND_ROOM_INTROS_v2.md` (room draft) · `HOUSE_ROOM_INTRO_SAMPLES_v1.md` (superseded)

---

## 0 · The North Star (the one sentence every decision is tested against)

> **Don't try to look "less self-help". Try to look clearly like a knowledge and learning platform where AI helps explore existing content — not a replacement for professional advice.**
>
> *(Anna + GPT, 2026-02)*

Every future compliance decision, every text change, every phase execution is measured against this one sentence. If a proposed change moves Aurin **closer** to "clearly a knowledge & learning platform", we ship it. If a proposed change moves Aurin **closer** to "another AI wellness service" or **closer** to "generic self-help copy", we reject it.

### The five governing principles (locked, per GPT synthesis)

1. **The problem is not the word "self-help" alone.** The problem is any impression that Aurin provides therapy, diagnosis, or treatment. Illinois WOPRA §25 and Nevada AB 406 confirm this distinction.

2. **Aurin is positioned as a knowledge platform first.** Library, knowledge, and learning come first. AI is a *second-order feature* — an optional conversation companion, not the product.

3. **Scientific facts are used carefully.** Facts strengthen credibility, but never write "science proves…" without a specific strong source in the same line. Verifiable facts, universal observations, and metaphors — in that order of caution.

4. **Aurin's identity does not change.** No wellness-platform pivot. No coaching-platform pivot. No science-platform pivot. The house, the keepers, the rooms, the metaphors all stay. Only the public-facing product description changes.

5. **The canonical public description of Aurin is:**

   > *"Aurin is a private knowledge and reading library with optional AI conversations for exploring ideas — not therapy or medical care."*

   This exact sentence appears in: meta description, About page opening, MoR application form, ToS opening paragraph. Same words, same order, in all four places. Consistency is a compliance signal.

---

## 0.1 · The one principle underneath the North Star

> **The goal is not to change Aurin. The goal is to change how a first-time visitor (and a compliance reviewer) categorises Aurin in their first ten seconds.**

The *inside* of the House stays exactly as Anna built it. Only the *doorway sign* changes.

---

## 1 · What GPT contributed that must be honoured

GPT's most important correction to v3:

**a) Science is background, not identity.**
Aurin is not a science channel like Huberman. Science-verifiable facts appear only when useful and sourced. They are used for *credibility*, not for *positioning*.

**b) Language works on three tiers, not one:**

| Tier | Example | When to use |
|---|---|---|
| **1. Verifiable facts** (with source) | "Memory consolidates during sleep." (cite study) | Rarely. Only when it strengthens a specific observation. |
| **2. Universal observations** (no citation needed) | "Nobody is born knowing." "Every language learns one word at a time." | Freely. This is Aurin's natural voice. |
| **3. Metaphors** | "Rivers never force their way around a mountain. They simply continue until a path appears." | This is Aurin's strongest tier. Keep central. |

**c) Phase order matters.** Do public positioning BEFORE room-level text work. Otherwise you polish rooms that still sit on the wrong foundation.

---

## 2 · The final phase order (this is what happens, in this exact sequence)

### Phase 1 · Evidence gathering — DONE

The v3 report already classified every claim as 🟢 Evidence / 🟡 Strong inference / 🔴 Hypothesis. This phase produced the two corrections that changed the plan:

- *"Self-help is legally regulated"* was 🔴 — corrected. Illinois WOPRA §25 and Nevada AB 406 **explicitly exempt** self-help materials. We do not have to purge the word.
- *"Confession Room name is a compliance risk"* was 🔴 — parked until an MoR actually cites it.

**Status:** ✅ complete. Approval: N/A.

---

### Phase 2 · Legal disclaimer package (mechanical, non-identity)

Ship these regardless of everything else. They cannot damage Aurin. They can only strengthen MoR review.

| # | Action | Anna decision |
|---|---|---|
| 2.1 | Homepage footer: *"Aurin is a reading library and AI conversation companion. It is not therapy or medical care. If you are in crisis, contact your local emergency service (EU: 112, US: 988)."* | approve / rewrite / reject |
| 2.2 | Pre-conversation modal (first time only, in every keeper room): *"The AI in this room is a conversation companion, not a licensed professional. Its answers may be inaccurate. It cannot diagnose, treat, or replace human care."* | approve / rewrite / reject |
| 2.3 | ToS additions: AS-IS clause · hallucination disclaimer · no-medical-advice clause · emergency-line clause (see §A.5 in v2 doc). | approve / rewrite / reject |
| 2.4 | Refund page: 14-day EU withdrawal + cancel-anytime + voice-minutes-do-not-expire-mid-subscription. | approve / rewrite / reject |

**Estimated implementation time:** 30–45 minutes total.
**Risk to Aurin identity:** Zero.

---

### Phase 3 · Public positioning shift (the actual re-categorisation)

This is where "knowledge first, AI second" happens. Small surface, high leverage.

| # | Action | Anna decision |
|---|---|---|
| 3.1 | **Site meta description** (invisible to visitor, critical for MoR reviewers & search): *"Aurin is a private reading library with an optional AI conversation companion. Rooms of collected knowledge on parenting, presence, the body, and the questions life keeps asking. Not therapy. Not medical care."* | approve / rewrite / reject |
| 3.2 | **Home page hero** — reordered so that **knowledge** is named before **AI**. AI is described as *"one way to explore what's inside — not the reason the house exists."* | approve / rewrite / reject |
| 3.3 | **About page** opening — rewritten around: (a) the collected knowledge, (b) the rooms, (c) the keepers as companions, (d) only then the AI as one of several ways to move through the library. | approve / rewrite / reject |
| 3.4 | **Metaphor-first opening line** on the Home hero (GPT's example style): a single Aurin-voice observation about something universal (river / language / memory) — not "Nobody is born a…" — as a hook before the category sentence. Anna writes this or approves the agent's version. | approve / rewrite (Anna writes) / reject |

**What does NOT change in Phase 3:**
- ❌ No keeper renames
- ❌ No room renames
- ❌ No removal of Anna's voice
- ❌ No "science platform" pivot
- ❌ No pricing structure changes
- ❌ No book/course removals

**Estimated implementation time:** 2–3 hours (once Anna approves each text block).
**Risk to Aurin identity:** Low if Anna approves every text block before code moves.

---

### Phase 4 · Language audit (targeted, not blanket)

GPT correctly widened the ban list beyond "self-help". These are the terms whose presence — *when applied to AI or keepers* — will hurt any MoR application. When they appear elsewhere (e.g., in a book description quoting a psychologist), they are fine.

**High-risk terms (remove when applied to AI or keepers):**
`therapy` · `therapist` · `counselor` · `psychologist` · `diagnose` · `treat` · `cure` · `clinical` · `medical advice` · `heal / healing` · `treatment` · `depression` · `anxiety` · `trauma` · `recovery` · `emotional support` (as a service description)

**High-risk promises (rewrite anywhere they appear):**
- ❌ "transform your life" → ✅ "explore your questions"
- ❌ "find yourself" → ✅ "notice what you already know"
- ❌ "heal from…" → ✅ "sit with…"
- ❌ "overcome…" → ✅ "carry differently"

**Kept, per corrections:**
- ✅ *self-help* — legally safe (WOPRA §25, AB 406 exemption). Anna decides case-by-case if replacing improves the sentence.
- ✅ *sanctuary* — Anna's brand call. Not a legal risk. Only a brand-consistency question.
- ✅ *house*, *room*, *door*, *library*, *keeper*, *companion* — Aurin's core vocabulary. Untouched.

| # | Action | Anna decision |
|---|---|---|
| 4.1 | Automated codebase scan for the high-risk terms → report only. No auto-edits. | approve / reject |
| 4.2 | Anna reviews the scan report and marks each occurrence: `remove / rewrite / keep`. Agent applies only what Anna marks. | approve / reject |
| 4.3 | Rewrite risky promises ("transform your life" family) per Anna's approval. | approve / reject |

**Estimated implementation time:** scan is minutes; review depends on how many hits (probably 30–60); rewrites 1–2 hours.
**Risk to Aurin identity:** Low. Anna decides each occurrence.

---

### Phase 5 · MoR pre-application inquiry (validation, not commitment)

Before restructuring anything expensive:

| # | Action | Anna decision |
|---|---|---|
| 5.1 | Draft an honest one-page description of Aurin using the new positioning + the language of the disclaimer package. Send to **Lemon Squeezy support** as a pre-application inquiry: *"Would this qualify under your AI + self-help policy? Are there specific concerns?"* | approve / rewrite / reject |
| 5.2 | Also ask specifically: *"We have a small children's reading area (no AI, no accounts, no data collection) on the same domain. Is that acceptable?"* — this is the H1 kids-domain hypothesis, tested by asking. | approve / rewrite / reject |
| 5.3 | Wait for their reply before making room-level changes. If they accept: skip Phase 6. If they raise specific concerns: address only those in Phase 6. | approve / reject |

**Estimated turnaround:** LS typically replies in 2–5 business days.
**Risk to Aurin identity:** Zero (no code changes here).

---

### Phase 6 · Room intros — LAST, and only if needed

Room intros stay in `AURIN_COMPLIANCE_AND_ROOM_INTROS_v2.md` as a draft. They are **not implemented** and **not approved**.

They activate only if:
- Lemon Squeezy's reply specifically points at room intros as a problem, OR
- Anna decides independently (post-launch) that she wants them for editorial reasons — not compliance.

If activated, Anna approves each room intro individually. No blanket rollout.

| # | Action | Anna decision |
|---|---|---|
| 6.1 | Defer until Phase 5 answer. | approve (defer) |

---

### Phase 7 · Private founder docs (safe cleanup, orthogonal to everything)

| # | Action | Anna decision |
|---|---|---|
| 7.1 | Add to `.gitignore`: `/app/memory/*_AUDIT_*.md`, `/app/memory/CURATORS_*.md`, `/app/memory/SARA_*.md`, `/app/memory/*_CHARACTER_*.md`. Ensures private strategy docs don't leave the machine. | approve / reject |
| 7.2 | Files stay locally untouched. | approve / reject |

**Estimated implementation time:** 5 minutes.
**Risk to Aurin identity:** Zero.

---

## 3 · Recommended execution order (my proposal, for Anna to approve)

**Today (if Anna approves):**
- ✅ Phase 2 (all four disclaimer items) → deployed immediately
- ✅ Phase 7 (git-ignore founder docs) → deployed immediately
- ✅ Phase 5.1 draft prepared for Anna's review → sent by Anna, not the agent

**This week (once Phase 2/7 are live):**
- ✅ Phase 3.1 (meta description) → agent proposes, Anna approves
- ✅ Phase 3.2, 3.3 (Home + About text) → agent drafts, Anna approves each block
- ✅ Phase 4.1 (language scan) → report to Anna

**Once Lemon Squeezy answers (Phase 5):**
- Only then, if needed, Phase 6 (rooms) and any structural changes.

**Deferred and possibly never needed:**
- Renaming rooms (only if LS flags them)
- Restructuring kids domain (only if LS flags it)
- Repositioning as "science platform" (this is now explicitly rejected as a wrong direction)

---

## 4 · Anna's decision needed on FOUR things right now

Anna, before the agent moves, please answer:

**Q1.** Do you approve Phase 2 (four disclaimer items) to ship this session?
→ *approve / rewrite / reject*

**Q2.** Do you approve Phase 7 (.gitignore founder docs) to ship this session?
→ *approve / rewrite / reject*

**Q3.** For Phase 3.4 (metaphor-first opening line on Home hero), do you want:
- (a) to write it yourself,
- (b) let the agent propose 3 options in your voice for your selection, or
- (c) skip Phase 3.4 entirely for now?

**Q4.** For Phase 5 (Lemon Squeezy pre-application inquiry):
- (a) draft the letter now, Anna sends it herself,
- (b) draft and Anna reviews before sending,
- (c) defer Phase 5 until after Phases 2, 3, 4 are complete?

Once these four answers arrive, the agent begins — one phase at a time, with a checkpoint after each.

---

## 5 · My honest assessment

**GPT's biggest gift to this plan** was refusing to let me build Aurin into a science-education platform. That would have been a subtle betrayal of what Aurin is. Instead, GPT clarified:

- Aurin's **category** is *knowledge library + AI companion*
- Aurin's **credibility layer** may include verifiable facts when useful
- Aurin's **voice** is universal observation and metaphor — Anna's natural mode

**Anna's biggest gift to this plan** was the video insight — the recognition that the MoR problem is about **how Aurin's category reads to a reviewer**, not about which words are in which paragraph. That reframed the entire problem from *"copywriting exercise"* into *"category positioning exercise"*.

**My contribution** was reducing hypotheses to evidence, admitting past errors (the self-help legal claim was wrong; I corrected it publicly in Part 0 of the v3 doc), and building a phased execution that cannot damage Aurin even if any single hypothesis turns out to be wrong.

**Together this plan is safer than any previous version** because it moves from mechanical → positional → validated → structural, in that order. Each phase can be paused, and no phase depends on a hypothesis that has not been tested first.

---

**End of document.**
