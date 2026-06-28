# HOUSE LANGUAGE CALIBRATION — Phase 1 Brief
### Status: HELD until launch is stable
### Pass 5A activates immediately after stable deploy (no user data required)
### Pass 5B activates after first 10–20 real visitors
### v1.2 · 2026-06-27

> *This is not copywriting. This is identity calibration.*
> Drafted by GPT, refined by E1 with three discipline rules and one guiding question.

---

## 0 · Why this exists

The Aurin website is technically launch-ready, navigationally coherent, and legally compliant. The final remaining variable is **language** — the words a visitor reads in their first 90 seconds, on every page, in every keeper room.

The goal is **not** to "improve copy". The goal is to ensure every sentence on every page sounds like it belongs to one inhabited house — and that no sentence speaks on behalf of the visitor, diagnoses them, or competes against another product instead of inviting the visitor in.

---

## 1 · The one guiding question

When the auditor evaluates any sentence on any public surface, only one question is asked:

> **"Does this sentence sound like the House speaking?"**

Not:
- *Is it beautiful?*
- *Does it convert?*
- *Is it shorter?*
- *Does it sound like a brand?*

Only:
- *Does it sound like Aurin?*

Any sentence that does not pass this test is logged in the audit, even if everything else about it is technically fine. Any sentence that does pass this test is left untouched, even if it could be "improved" in some surface way.

This single question is the calibration. The six patterns below are only **detectors** that help find candidates worth asking the question about.

---

## 2 · The six patterns to detect

The audit must scan every public surface for these specific language failures. Each finding must still be evaluated against §1 before it is logged.

### 2.1 Negative openings
Sentences that begin with "I don't…", "We don't…", "This isn't…", "You don't…", "Not…", etc.
Rewrite into a positive statement whenever the meaning becomes clearer.
*Example*: "I did not want to build another platform competing for attention" → ???

### 2.2 Speaking on behalf of the visitor
Statements that tell visitors what they feel, think, or have already experienced.
Invite rather than diagnose.
*Example*: "You stopped performing. That's why you're here." → ???

### 2.3 Abstract or ambiguous language
Phrases that require interpretation before the meaning lands.
*Example*: "another platform competing for attention" → what does that mean concretely?

### 2.4 House consistency
Every page should speak the same language of the House — same metaphors, same vocabulary, same level of formality, same temperature.

### 2.5 Keeper voice consistency
Grace · Sara · Kaelan · Alistair · Polarstar — each must have a **distinct voice** that no other keeper could speak in. None of them may sound like a generic AI assistant or therapist.

### 2.6 Invitation instead of persuasion
- Prefer invitation over instruction.
- Prefer curiosity over certainty.
- Prefer observation over diagnosis.

---

## 3 · The three discipline rules

These exist so the calibration does not accidentally erase Anna's voice.

### Rule A — Scope freeze
The audit covers **only** the public marketing surfaces (Home hero, About, Pricing intro, Library covers, keeper-room landing pages).

It does **not** touch:
- Keeper conversation prompts (Grace's chat scripts, Sara's intake, Kaelan's body-room flow). These are voice-modeled assets, owned by Anna alone.
- Legal / Privacy / Cookies / Terms text. Legal language is "abstract by design".
- Footer trust links.
- Compliance disclosures (K1, K4).

### Rule B — Audit, not edit
Phase 1 produces **one document**: `/app/memory/HOUSE_LANGUAGE_AUDIT.md`.

For every finding the document records:
1. Page URL + element identifier
2. Current text (verbatim)
3. Pattern matched (which of 2.1–2.6)
4. Why it weakens the House (and fails §1)
5. Suggested replacement
6. Why the new version is stronger (and passes §1)

**No code change is made** before Anna reviews each finding individually. Anna may accept, reject, or rewrite the suggestion. The agent never overwrites Anna's voice unilaterally.

### Rule C — Two-pass execution (5A internal, 5B user-informed)
The calibration runs in **two separate passes**, not one.

**Pass 5A — Internal House Language Calibration** (immediately post-launch)
Scope: only language that *clearly* conflicts with the established House principles.
- Negative openings (pattern 2.1)
- Speaking on behalf of the visitor (pattern 2.2)
- Abstract or ambiguous metaphors (pattern 2.3)
- Inconsistent House vocabulary across pages (pattern 2.4)

These are **brand-consistency issues**. They are detectable from the House principles alone and do not require user feedback. They can be addressed as soon as the deploy is stable.

**Pass 5B — User-informed Calibration** (after first 10–20 real visitors)
Scope: the subtler issues that only surface in real behaviour.
- Keeper voice distinctness perceived by real users (pattern 2.5)
- Invitation-vs-persuasion balance as felt by real visitors (pattern 2.6)
- Any line that real users specifically asked about, hesitated on, or abandoned

Pass 5B requires at least one of:
- explicit feedback (email, contact form, social)
- implicit signal (Clarity heatmap, session-replay showing confusion or abandonment)

This split keeps the House language **internally consistent first**, while letting real users shape the second, deeper refinement.

---

## 4 · The output shape (single document)

```
# HOUSE LANGUAGE AUDIT — Phase 1
## Page: /about
### Finding #1 — Negative opening (pattern 2.1)
Current:    "I did not want to build another platform competing for attention."
Why weak:   Opens in the negative; the visitor must compute what Anna does NOT
            want before knowing what she does want. Fails §1 — sounds like a
            copywriter framing a competitor, not the House speaking.
Suggested:  "I built a quiet room for the part of life that doesn't fit on a feed."
Why stronger: Opens with the positive image (a quiet room). Anchors immediately
              in a felt sense. No competitor frame. Passes §1 — sounds like the
              House speaking.
```

Every finding follows this shape. Severity is ordered: critical → serious → minor.

---

## 5 · What the audit does NOT do

- ❌ Does not rewrite the whole website
- ❌ Does not redesign layouts, components, navigation, or functionality
- ❌ Does not unilaterally apply changes
- ❌ Does not touch keeper conversation prompts
- ❌ Does not change legal/compliance language

---

## 6 · When to activate (two passes)

### Pass 5A — Internal House Language Calibration
Activate when **both** are true:
1. Site is deployed to prulesoul.site
2. Deploy is stable (no rollback in first 24h)

No user data required. Patterns 2.1–2.4 are objectively detectable from the House principles.

### Pass 5B — User-informed Calibration
Activate when **all** are true:
1. Pass 5A is complete and Anna has approved the changes
2. ElevenLabs `convai_write` permission is added and one real Grace conversation has succeeded
3. At least one real payment has been processed via Polar
4. **First successful visitor journey** recorded — at least one real visitor has completed the full path (home → keeper → conversation → optional purchase) without getting stuck
5. At least 10–20 real visitors have spent time on the site and produced at least one of:
   - explicit feedback (email, contact form, social)
   - implicit signal (Clarity heatmap, session-replay showing confusion or abandonment)

If fewer than 10 users have arrived yet for Pass 5B, **wait**. Pass 5A is enough for the early days.

---

## 7 · Owner

- **Brief author**: GPT (2026-06-27)
- **Discipline rules**: E1 (2026-06-27)
- **Guiding question + first-successful-journey milestone**: Anna (2026-06-27)
- **Editorial authority**: Anna only. The agent proposes; Anna disposes.
- **Sister documents** (House Identity System):
  - `HOUSE_EXPERIENCE_AUDIT_FRAMEWORK.md` — governs the website experience
  - `AURIN_FILM_LANGUAGE.md` — governs moving image
  - this file — governs written copy

---

## End
