# Play & Move — UX Mockup

**Status:** Wireframe & flow only. **NOT CODE.** Awaiting founder
approval before implementation.

**Goal:** Transform the current 4-card grid (`MovesGrid`) into a
narrative journey for Discovery World ages 4–6, while keeping the
underlying `polarstarContentMap.js` data structure unchanged.

**Hard constraint (Tony-discipline + brand):** The session must end
itself. The child cannot run it forever. The parent stays in control.
This is the platform's anti-attention-economy signature — and it is
the strongest single sales argument to parents.

---

## Narrative

The Little Star is feeling heavy tonight. It needs to wake its body
up before it can fly. Each move sends a quiet light into the Star's
wings. After four moves, the Star is ready to glow.

(The child is not "performing for the Star". The child is *helping*
the Star — small, gentle agency, no leaderboard, no streak.)

---

## Flow — three screens, one return

### Screen 1 — Intro

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│   ←  Back to Discovery World                                │
│                                                             │
│   ┌─────────────────────────────────────────────────────┐   │
│   │   ✦  PLAY & MOVE  ·  AGES 4–6                       │   │
│   │   Help the Little Star reach the moon.              │   │
│   └─────────────────────────────────────────────────────┘   │
│                                                             │
│   The Little Star feels heavy tonight.                      │
│   It needs to wake its body up before it can fly.           │
│                                                             │
│   Will you help? Each move you do sends light               │
│   into the Star's wings.                                    │
│                                                             │
│           ●─○─○─○      4 moves · ~5 minutes                 │
│                                                             │
│           [  Let's begin  →  ]                              │
│                                                             │
│   ─── tip for parents ───────────────────────────────────   │
│   Movement before bedtime can feel silly — that's the       │
│   point. Laughter is part of the recipe. Stay close.        │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Screen 2 — Active move (one at a time)

```
┌─────────────────────────────────────────────────────────────┐
│   ←  Back to Discovery World                                │
│                                                             │
│           ●─●─○─○         Move 2 of 4                       │
│                                                             │
│   ┌─────────────────────────────────────────────────────┐   │
│   │                                                     │   │
│   │   STEP 2                                            │   │
│   │                                                     │   │
│   │   Bunny hops                                        │   │
│   │                                                     │   │
│   │   Hop softly across the room — five hops there,     │   │
│   │   five hops back.                                   │   │
│   │                                                     │   │
│   │   [ ✓ I did it — next move → ]                      │   │
│   │   [ Skip this one  ]                                │   │
│   │                                                     │   │
│   └─────────────────────────────────────────────────────┘   │
│                                                             │
│   ─── absolute time guard ────────────────────────────      │
│   This session ends in 8 minutes. The page will close       │
│   itself when the moves are done. No screens after.         │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Screen 3 — Outro

```
┌─────────────────────────────────────────────────────────────┐
│   ←  Back to Discovery World                                │
│                                                             │
│           ●─●─●─●         All four moves done.              │
│                                                             │
│   ✦  THE STAR IS GLOWING                                    │
│                                                             │
│   You moved your body. The Little Star is ready             │
│   to fly. Well done — and goodnight, if it's time.          │
│                                                             │
│           [  Back to Discovery World  ]                     │
│           [  One quiet story before bed →  ]                │
│                                                             │
│   ─── tip for parents ───────────────────────────────────   │
│   Don't restart. The Star has done its work for tonight.    │
│   Tomorrow there will be another adventure.                 │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Parent-lock rules (NON-NEGOTIABLE)

These three behaviours are the platform's anti-attention-economy
signature. They MUST hold:

1. **Session ends automatically.**
   After all four moves are completed *or* skipped, the activity
   shows the Outro screen ONCE and offers exactly two exits:
   "Back to Discovery World" and "One quiet story before bed".
   There is no "Play again" button. There is no rerun loop.

2. **Time limits are absolute.**
   A soft cap of 10 minutes from session start. At 9 minutes a small
   line appears: *"Two minutes left. We will close together."* At 10
   minutes the session forces the Outro screen, regardless of which
   step the child is on. The Star is "glowing enough" — the child
   has succeeded.

3. **Control returns to parent.**
   When the Outro fires, the focus moves to the parent CTAs (Back /
   Story). The child cannot return to the same activity from the
   Outro for the rest of the calendar day — re-entering the URL
   shows: *"The Star is resting. See you tomorrow."* This is a soft
   client-side date check (no auth required), bypassable by
   refreshing the parent device. Good enough at this stage. **NOT
   "soft lock"** — the brand promise is: when the activity ends,
   it ends.

These three rules together form the platform's strongest sales line
to parents:
> *"The activity closes itself. You do not have to fight to stop it."*

---

## Data shape changes (additive to `polarstarContentMap.js`)

The existing `play-move` activity entry gets two new fields, both
optional. Backward-compatible — every other "moves" activity keeps
working with `MovesGrid`.

```js
{
  id: "play-move",
  // ... existing fields kept verbatim
  moves: [ /* existing 4 entries kept verbatim */ ],

  // NEW (optional):
  journey: {
    character: "Little Star",
    intro: "The Little Star feels heavy tonight. It needs to wake \
            its body up before it can fly. Will you help? Each move \
            you do sends light into the Star's wings.",
    outroEyebrow: "The star is glowing",
    outro: "You moved your body. The Little Star is ready to fly. \
            Well done — and goodnight, if it's time.",
    sessionCapMinutes: 10,           // absolute time guard
    softWarningAtMinutes: 9,         // gentle one-line nudge
    coolDownHours: 18,               // returns to "resting" after Outro
  },
}
```

When `journey` is present and `act.type === "moves"`, render the new
`MovesJourney` component. When `journey` is absent (any other moves
activity in the future), keep rendering the existing `MovesGrid`.

---

## Render component spec — `MovesJourney`

State (purely client-side, `useState` + `useEffect`):
- `phase` — `"intro" | "step" | "outro" | "resting"`
- `stepIndex` — 0..moves.length-1
- `sessionStartedAt` — `Date.now()` set when Intro CTA clicked
- `completed` — `boolean[]` length = moves.length (entry is true when "I did it" OR "Skip" clicked)
- `lastFinishedAt` — `localStorage["polarstar-play-move-finished-at"]` ISO string. If within `coolDownHours` of now → start in `"resting"` phase.

Effects:
- One `setInterval(checkTime, 30_000)` while `phase === "step"`.
  At `softWarningAtMinutes` → set `showSoftWarning = true`.
  At `sessionCapMinutes` → force `phase = "outro"`.
- On entering `"outro"` → write `localStorage` timestamp.

Routes / CTAs:
- Outro "Back to Discovery World" → `/kids-universe/polarstar/discovery`
- Outro "One quiet story before bed" → `/kids-universe/polarstar/discovery/story-time`

Data-testids (additive, none renamed):
- `polarstar-move-journey-intro`
- `polarstar-move-journey-begin`
- `polarstar-move-journey-stepcard`
- `polarstar-move-journey-step-{n}` (existing testids can stay)
- `polarstar-move-journey-done`
- `polarstar-move-journey-skip`
- `polarstar-move-journey-outro`
- `polarstar-move-journey-back`
- `polarstar-move-journey-story`
- `polarstar-move-journey-resting`

No backend changes. No new env vars. No new endpoints.

---

## What does NOT change

- ✅ Painted-world background, parchment veil, palette
- ✅ Title cloud + back button + parent-tip parchment
- ✅ Existing route `/kids-universe/polarstar/discovery/play-move`
- ✅ `polarstarContentMap.js` `moves` array stays byte-identical
- ✅ Other "moves"-type activities (none today) keep MovesGrid
- ✅ Polarstar terminology untouched
- ✅ Compliance fixes (iter 86b) untouched
- ✅ Brand Translation Foundation (iter 86e) untouched

---

## PSP / compliance check on the new copy

Each line in this mockup was greped against the PSP red-flag list.
None of the following appear: AI, therapy, healing, treatment,
wellbeing, anxiety, depression, mental health, cure, clinical.

The closest neighbour is "soothing / calming the child" — which is
absent on purpose. The activity is sold as *physical movement before
bed* (universal, parental-tradition copy), not as a sleep aid or
emotional regulation tool.

---

## Future hooks (NOT in scope for first build)

- Audio narration of intro + outro (ElevenLabs character "Aurin")
- Cross-room mirror: same journey pattern for Kindness Mission
  ("The Lantern Bearer" character) and Morning Mindful Start
  ("The First Bird")
- Per-day rotation: a different metaphor each calendar day
- Persistence by parent account (when Phase 2 backend lands)

These are **explicitly out of scope** for the first implementation.
The first build is JavaScript + localStorage, nothing else.

---

## Implementation order (when founder green-lights)

1. Add `journey` field to `polarstarContentMap.js` `play-move` entry.
2. Create `MovesJourney.jsx` next to `PolarstarActivity.jsx`.
3. Branch in `PolarstarActivity` render: if `act.journey` → `MovesJourney`, else `MovesGrid`.
4. Screenshot at three phases.
5. Manual smoke test of the time-cap path (set `sessionCapMinutes: 1` in dev, watch the auto-Outro fire).
6. Lock in PRD under "Iter 86f — Play & Move journey shipped".

Estimated implementation: ~1 hour of careful code, no backend, no deploy.

---

*End of mockup. Awaiting founder approval before any line of code is touched.*
