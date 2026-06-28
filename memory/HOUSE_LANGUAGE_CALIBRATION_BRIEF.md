# HOUSE LANGUAGE CALIBRATION — Phase 1 Brief
### Status: HELD until Phase 5 of launch roadmap
### Activated: only after first 10 real users + their feedback are gathered
### v1.0 · 2026-06-27

> *This is not copywriting. This is identity calibration.*
> Drafted by GPT, refined by E1 with three discipline rules.

---

## 0 · Why this exists

The Aurin website is technically launch-ready, navigationally coherent, and legally compliant. The final remaining variable is **language** — the words a visitor reads in their first 90 seconds, on every page, in every keeper room.

The goal is **not** to "improve copy". The goal is to ensure every sentence on every page sounds like it belongs to one inhabited house — and that no sentence speaks on behalf of the visitor, diagnoses them, or competes against another product instead of inviting the visitor in.

---

## 1 · The six patterns to detect

The audit must scan every public surface for these specific language failures:

### 1.1 Negative openings
Sentences that begin with "I don't…", "We don't…", "This isn't…", "You don't…", "Not…", etc.
Rewrite into a positive statement whenever the meaning becomes clearer.
*Example*: "I did not want to build another platform competing for attention" → ???

### 1.2 Speaking on behalf of the visitor
Statements that tell visitors what they feel, think, or have already experienced.
Invite rather than diagnose.
*Example*: "You stopped performing. That's why you're here." → ???

### 1.3 Abstract or ambiguous language
Phrases that require interpretation before the meaning lands.
*Example*: "another platform competing for attention" → what does that mean concretely?

### 1.4 House consistency
Every page should speak the same language of the House — same metaphors, same vocabulary, same level of formality, same temperature.

### 1.5 Keeper voice consistency
Grace · Sara · Kaelan · Alistair · Polarstar — each must have a **distinct voice** that no other keeper could speak in. None of them may sound like a generic AI assistant or therapist.

### 1.6 Invitation instead of persuasion
- Prefer invitation over instruction.
- Prefer curiosity over certainty.
- Prefer observation over diagnosis.

---

## 2 · The three discipline rules (added by E1)

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
3. Pattern matched (which of 1.1–1.6)
4. Why it weakens the House
5. Suggested replacement
6. Why the new version is stronger

**No code change is made** before Anna reviews each finding individually. Anna may accept, reject, or rewrite the suggestion. The agent never overwrites Anna's voice unilaterally.

### Rule C — Run only after first-10-users signal
This calibration runs **after** the first 10 real visitors have used the live site and given feedback (either explicitly via contact form, or implicitly via session-replay heatmaps).

The reason: agent-inferred copy issues are guesses. First-user reactions are facts. Polishing in advance risks "fixing" lines that actually worked, while missing lines that actually confused.

---

## 3 · The output shape (single document)

```
# HOUSE LANGUAGE AUDIT — Phase 1
## Page: /about
### Finding #1 — Negative opening (pattern 1.1)
Current:    "I did not want to build another platform competing for attention."
Why weak:   Opens in the negative; the visitor must compute what Anna does NOT
            want before knowing what she does want.
Suggested:  "I built a quiet room for the part of life that doesn't fit on a feed."
Why stronger: Opens with the positive image (a quiet room). Anchors immediately
              in a felt sense. No competitor frame.
```

Every finding follows this shape. Severity is ordered: critical → serious → minor.

---

## 4 · What the audit does NOT do

- ❌ Does not rewrite the whole website
- ❌ Does not redesign layouts, components, navigation, or functionality
- ❌ Does not unilaterally apply changes
- ❌ Does not touch keeper conversation prompts
- ❌ Does not change legal/compliance language

---

## 5 · When to activate

Activate House Language Calibration Phase 1 when **all four** are true:

1. Site is deployed to prulesoul.site
2. ElevenLabs `convai_write` permission is added and one real Grace conversation has succeeded
3. At least one real payment has been processed via Polar
4. At least 10 real visitors have spent time on the site and produced at least one of:
   - explicit feedback (email, contact form, social)
   - implicit signal (Clarity heatmap, session-replay showing confusion or abandonment)

If fewer than 10 users have arrived yet, **wait**. The premature calibration is more dangerous than the imperfect copy.

---

## 6 · Owner

- **Brief author**: GPT (2026-06-27)
- **Discipline rules**: E1 (2026-06-27)
- **Editorial authority**: Anna only. The agent proposes; Anna disposes.

---

## End
