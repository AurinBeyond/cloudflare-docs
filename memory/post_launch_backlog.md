# Post-launch Backlog — refinements after first paying customers

**Trigger:** Apply only after we have **10 real (non-test) Gumroad
sales**. Until then: no copy changes, no UX scope expansion. The
discipline of iter 86e ("kuld vs müra") holds.

**Owner:** Founder.
**Last reviewed:** iter 86f (2026-02-29).

---

## P1 — Voice content track (Anna's own voice)

**Founder breakthrough (this session):** Anna will record her own
voice telling the origin of Matrix Aurin, methodology source, and
life-example stories — including a series for women who keep
accepting too little. This solves four problems at once:

1. The "edu lugu" gap (GPT-noted) — the founder's lived story
   IS the credential, no certificate fiction needed.
2. PSP-safe — personal narrative, not health claims.
3. Revenue diversification — Anna-voice audio bundles can sell
   at €15–€19, higher AOV than the PDF.
4. Brand differentiation — every wellness app has TTS. None
   have *this* founder's voice.

### Concrete first three audio products

| Product | Length | Price | Where it sits |
|---------|--------|-------|---------------|
| "Why Matrix Aurin was born" — origin story | ~12 min | €0 (lead magnet) | Site `/origin` page + Resend onboarding email |
| "Five letters to the woman who keeps accepting too little" | 5 × ~6 min | €19 | New Gumroad SKU |
| "Bedtime Stories — audio companion" (Anna narrates the 5 PDF stories) | ~25 min | €15 (or bundle PDF+audio €19) | Add to existing Gumroad PDF product as bonus tier |

### Technical path

- **Phase 1 (cheap, fast):** record on phone in a quiet room,
  trim in Audacity, MP3 export, host on `/public/assets/audio/`.
- **Phase 2 (scalable):** ElevenLabs Voice Clone — one clean
  60-second sample creates an "Anna voice" that can read any
  future text (newsletter, ankrute audio cues, Polarstar story
  narrations). Cost: ~€22/month Creator tier.
- **Phase 3:** semi-pro mic (Shure SM7B or similar, ~€400) if
  audio revenue clears its own cost.

### What this is NOT

- Not therapy, not coaching certification, not medical claim.
- Anna is sharing **lived experience and observations** —
  framed exactly as authors like Brené Brown, Esther Perel,
  Mel Robbins started: storytelling, not credentialed advice.
- Every audio product carries the same disclaimer block we
  use in PDFs: *"Not therapy. Not medical care. A personal
  perspective. Always consult a qualified human for clinical
  needs."*

---

## P2 — Anchor library (3–4, not 16)

From the GPT 16-anchor pack, keep these four. They map to existing
rooms and to felt human moments parents recognise immediately:

| Anchor | Maps to | When user sees it |
|--------|---------|-------------------|
| **"Tööpäeva dekompressioon · 17:00"** | Grace / Clarity Release | Site CTA: *"Drop today before you walk through the door."* |
| **"Uneeelne shutdown"** | Kaelan / Body Room | Site CTA: *"Empty what is keeping your eyes open."* |
| **"Enne kui sa reageerid" (parent line)** | Sara / Parents' Room | Site CTA: *"Two minutes before you raise your voice."* |
| **"Pühapäevaõhtune inventuur"** | Grace | Email cadence: *"Sunday letter — five minutes before the week begins."* |

Implementation: a single new section on `/` titled *"When to step
inside"* with four small cards, each linking to the right room.
Estimated: ~40 min frontend work, no backend, no copy beyond the
four lines above.

**Trigger to build:** after first 10 sales + after voice clone
exists (so the cards can play a 20-second Anna intro on hover).

---

## P3 — "Miinus-märk" positioning line

Add to the existing compass-line refrain on `/` and `/about`:

```
A quiet room for noticing what is already shaping your life.
A place you come to leave something behind, not to add another habit.
```

Two sentences max. The second line is the differentiator from
every wellness app on the market. This is a Tony-discipline win
because it states what we are by stating what we are NOT — but
without using "not therapy", which is a defensive line.

**Trigger to ship:** after 1 week of current compass-line refrain
in production has run, so we can A/B observe.

---

## P4 — RAM / runtime / system vocabulary INSIDE rooms (not on entry)

The "kognitiivne RAM puhastus" language from GPT works as flavour
**inside a room**, never on the public landing. Sample placements:

- Clarity Release intro panel: *"Your working memory is for ideas,
  not storage. Empty what is being held tonight."*
- Body Room intro: *"A short audit of where the body is keeping
  what the calendar has not yet had time to carry."*

This keeps the public surface in compass / quiet voice and reserves
the harder, more architectural language for already-inside users.

**Trigger to ship:** same time as P2 (anchor library), since both
are room-internal copy refreshes.

---

## P5 — Cold-start prompt buttons

GPT's idea, kept. Add prompt-pill buttons to each room's empty-state
chat box. Examples for Clarity Release:

- *"Work thoughts won't let me sleep"*
- *"I owe a difficult email"*
- *"Tomorrow morning already feels heavy"*

Each pill pre-fills the chat with a gentle opener for the curator.

**Trigger to ship:** after the voice content (P1) gives us
authentic phrasing examples from Anna's own stories. Then we use
her actual phrasing for the pills, instead of inventing them.

---

## Discipline reminders (from founder, iter 86e)

- "Kuld, mitte mass."
- Pick 3, not 16.
- Add only after the previous addition has lived in production for
  at least one week and survived contact with real users.
- Polarstar Kids terminology stays untouched.
- "Welcome back to yourself." stays untouched.
- Defensive disclaimers ("not therapy / not medical care") stay
  untouched.
- No coaching certifications, no medical claims, no "transform
  your life in 21 days" rhetoric.

---

*This file is the agent's backlog memory. Re-read before any
post-launch copy change. Add new items at the bottom. Mark items
as DONE with the iter number when shipped.*
