# `FIRST_ACTIONS_v1.md` — Sprint 4 Mockup

**Sprint:** 4 (mockup only)
**Date:** 2026-02
**Status:** Content locked. Code not written yet.
**Where this lives:** Top of three room pages — `/clarity-release` (Grace),
`/body-room` (Kaelan), `/parents-room` (Sara). One quiet block at the
very top of each room, visible before any course, book, or product copy.

**Purpose:**
Close the Sprint-0 promise loop. The homepage hero says *"a quiet place
to read, listen, reflect, and reconnect with what matters most."* The
`/start-here` page hands the visitor a path. Sprint 4 makes sure the
**first minute inside the room** rewards them with a real action — not
more navigation.

---

## Strict tone rules (locked)

- 100% English UI.
- **Forbidden words on these blocks:** wellness, healing, therapy,
  therapist, tools, platform, users, fitness, exercise, medicine,
  treatment, technique, practice (as a noun), workout, app, signup,
  subscribe, course (in this block specifically), program.
- **Allowed words:** room, page, step, evening, breath, chair,
  the floor, a thought, a small thing, listen, sit, notice, return.
- Quiet library voice. Not a teacher. Not a guide. Not a therapist.
- The reader is an adult. No moralising. No congratulating them for
  showing up.
- No emojis. No checkboxes. No "Step 1 of 4" gamification.
- A "3-minute first step" must be readable in 30 seconds, then doable
  in the remaining 2.5 minutes without re-reading.

---

## Shared block anatomy (every room uses the same shape)

```
┌─────────────────────────────────────────────────┐
│   — Three minutes —                             │  ← eyebrow, brass uppercase
│                                                 │
│   "[Title in italics — one short phrase]"       │  ← small h2, serif italic
│                                                 │
│   [Intro: one short sentence, italic, muted]    │
│                                                 │
│   ─────────────────────                         │  ← brass hairline
│                                                 │
│   1.  [First 30 seconds]                        │  ← small brass numeral
│       [One sentence + a short verb-led step.]   │
│                                                 │
│   2.  [30 sec – 1 min]                          │
│       [One sentence + a short verb-led step.]   │
│                                                 │
│   3.  [1 min – 2 min]                           │
│       [One sentence + a short verb-led step.]   │
│                                                 │
│   4.  [2 min – 3 min]                           │
│       [One sentence + a short verb-led step.]   │
│                                                 │
│   ─────────────────────                         │
│                                                 │
│   [Closing line — one sentence.]                │  ← italic, ivory
│                                                 │
│   ⚪ [ When you are ready · Read on → ]         │  ← outline secondary CTA
│                                                 │
└─────────────────────────────────────────────────┘
```

Total visible block height target: under 70vh on desktop, scrollable on
mobile but not feeling like a long article. No images inside the block.
One brass corner accent (top-left), matching the cards at `/start-here`
and `/`.

---

## I · Grace — `/clarity-release`

### Eyebrow
— Three minutes —

### Title
*One thought, set down.*

### Intro
When the day's thinking has piled up, you do not need to solve it
tonight. You just need a place to put one piece of it down.

### Steps

**1. First 30 seconds — Sit.**
Find a chair or a step. Not the bed, not the floor. Somewhere your
back can be straight without effort.

**2. 30 sec – 1 min — Name the loudest thought.**
Not the most important one. The loudest one. The one that keeps
stepping in front of the others. Say it under your breath, or just
in your head. One sentence.

**3. 1 min – 2 min — Write it down, somewhere small.**
The back of an envelope. A phone note titled *tonight*. The first
blank page of a book. It does not need to be tidy. The point is that
it is now somewhere outside your head.

**4. 2 min – 3 min — Close the page.**
Close the note. Close the envelope. Close the book. The thought is
no longer your job for the rest of the evening. It will be there
tomorrow if it still matters.

### Closing line
That was the work. You do not need to do more tonight.

### When you are ready (soft next CTA)
**Label:** "Read on in Grace's room →"
**Route:** continues down the same page (`/clarity-release` — the
existing content lives below this block).
**Behaviour suggestion:** smooth scroll to the existing first
section, OR if Grace's room has a single canonical "next page",
link to that.

---

## II · Kaelan — `/body-room`

### Eyebrow
— Three minutes —

### Title
*Returning to the body.*

### Intro
You have been away from your body today. Not on purpose — most days
take you out of it. This is one quiet way back in.

### Steps

**1. First 30 seconds — Stand or sit.**
Whichever you can do without effort. Feet flat. Hands resting where
they want to rest. No special posture.

**2. 30 sec – 1 min — Feel where the floor is.**
Just the feet. Not posture. Not breathing yet. Only where the floor
is meeting your soles. Heels. Inside arch. Toes. That is it.

**3. 1 min – 2 min — Find one place the body is holding something.**
Jaw. Shoulders. Lower back. The strip across your forehead. Whichever
one answers first. Do not try to fix it. Just notice that it is there,
and that you found it.

**4. 2 min – 3 min — One slower breath into that place.**
Not a deep breath. A slow one. Let the breath end on its own. No
counting. No second one required.

### Closing line
Nothing more needed. You are back in the room with yourself.

### When you are ready (soft next CTA)
**Label:** "Read on in Kaelan's room →"
**Route:** continues down `/body-room` to the existing content.

---

## III · Sara — `/parents-room`

### Eyebrow
— Three minutes —

### Title
*One small thing that already worked.*

### Intro
You are tired. Some of today did not go the way you wanted. That is
not the whole story. Here is one quiet way to remember the rest.

### Steps

**1. First 30 seconds — Put the phone face-down.**
Not away. Just face-down. So the screen is not running you for the
next few minutes.

**2. 30 sec – 1 min — Sit somewhere you were not just working.**
A different chair. The bottom step of the stairs. The end of a bed.
A small change in geography is enough.

**3. 1 min – 2 min — Name one small thing that already worked today.**
Not a milestone. A small one. The lunch box that got packed. The
shoe that got tied. The two minutes you listened, even though you
were tired. The moment you did not say the thing you almost said.

**4. 2 min – 3 min — Sit with it for one full breath.**
Do not move on yet. Do not start planning tomorrow. Just let the
small thing be the thing this minute is built around.

### Closing line
Tonight you did not need to be a better parent. You needed one quieter
minute. You just gave yourself one.

### When you are ready (soft next CTA)
**Label:** "Read on in Sara's room →"
**Route:** continues down `/parents-room` to the existing content.

---

## Cross-room consistency checks (for Sprint-4 code review)

| Element | Grace | Kaelan | Sara |
|---|---|---|---|
| Eyebrow | "— Three minutes —" | "— Three minutes —" | "— Three minutes —" |
| Step count | 4 | 4 | 4 |
| Step length | 1-3 short sentences | 1-3 short sentences | 1-3 short sentences |
| Opens with | Sit | Stand or sit | Put the phone face-down |
| Closes with | Close the page | One slower breath | One full breath with the small thing |
| Closing voice | quietly finished | quietly arrived | quietly forgiven |
| Soft CTA | "Read on in Grace's room →" | "Read on in Kaelan's room →" | "Read on in Sara's room →" |
| Forbidden word audit | passes | passes | passes |

---

## Suggested `data-testid` map (for Sprint-4 code)

Per room, prefix with the room id:

- `first-action-grace-block`
- `first-action-grace-title`
- `first-action-grace-step-1` … `-step-4`
- `first-action-grace-cta`

(Same shape for `kaelan` and `sara`.)

---

## What this mockup does NOT do

- No pricing.
- No email capture.
- No product upsell ("if this worked, buy X").
- No paid course mention inside the block.
- No "join the community".
- No "this is what we believe" philosophy.
- No autoplay audio. No background music. No video.
- No links out to the homepage hero, `/start-here`, or social media.

The only allowed link inside the block is the soft "Read on" CTA, which
continues into the same room.

---

## Decision points for Sprint-4 implementation (when you give the green light)

These are open questions the **founder** decides, not the agent:

1. **Order of block vs existing room content:** does the 3-minute block
   sit *above the fold* on each room (replacing any current hero on
   that page), or *immediately below* the existing room title?
   *Recommended: above the fold, top-anchored. The room's existing
   intro becomes the second screen.*

2. **"Read on" target:** smooth-scroll to the next section on the same
   page, or a hard link to a sub-page (`/clarity-release/grace-room`,
   etc.)? Existing routes differ between rooms — needs a quick audit.

3. **Visibility on return visits:** should the block collapse to just
   the title once a returning visitor has scrolled past it once
   (`localStorage` flag), or stay full-size every time?
   *Recommended: always full-size. The block is the room. Hiding it
   defeats the point.*

4. **Shared component or three separate copies?** A single
   `<FirstActionBlock>` component fed by config is the cleaner shape.
   Three hand-tuned copies risk drift over time.
   *Recommended: one component, three configs in `/src/data/firstActions.js`.*

---

## Founder approval checklist before coding

- [ ] All three intros sound like *me* (Anna), not a wellness coach.
- [ ] No step requires a screen.
- [ ] The 4-step rhythm feels like the same "song" across all three.
- [ ] The closing line of each room lands without applause.
- [ ] The CTA invites, never instructs.
- [ ] Nothing here would scare a tired parent at 11pm.

When all six boxes feel true, give the green light and I'll code Sprint 4.
