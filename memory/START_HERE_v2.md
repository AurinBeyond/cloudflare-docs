# `/start-here` — Page Mockup v2 (Sprint 1)

**Sprint:** 1 (mockup) → 2 (code)
**Date:** 2026-02
**Purpose:** A single quiet door for new visitors. After the Sprint-0 hero
asks *"who are you here for?"*, this page lets them answer in one click,
gives them a single 3-minute action they can do **right now**, and only
then opens the room.

**Strict tone rules (locked):**
- 100% English UI.
- No "platform", "tools", "users", "digital", "wellness", "course".
- "Room", "story", "evening", "shelf", "page" are allowed.
- Anti-SaaS. Quiet library, not a B2B onboarding flow.
- One short paragraph per layer. No long copy.

---

## Page composition (top → bottom)

```
┌──────────────────────────────────────────────────────────────┐
│ NAV (existing HouseNav, untouched)                       │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│ HEAD                                                          │
│                                                               │
│            — START HERE —                                     │
│                                                               │
│       There is no wrong way to arrive.                        │
│       Pick the door that sounds like you today.               │
│                                                               │
│       (subline, smaller, italic, brass)                       │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│ THREE PATHS — vertical stack on mobile, 3-up on desktop      │
│                                                               │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                    │
│  │  Path 1  │  │  Path 2  │  │  Path 3  │                    │
│  └──────────┘  └──────────┘  └──────────┘                    │
│                                                               │
│  Each card (see anatomy below)                               │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│ QUIET CLOSING                                                 │
│                                                               │
│       (small italic line — "Whichever one you pick,          │
│        you can leave whenever you need to.")                 │
│                                                               │
│       [ Back to Matrix Aurin ]  (ghost link)                 │
└──────────────────────────────────────────────────────────────┘
```

---

## Card anatomy (every path uses the same shape)

```
┌─────────────────────────────────────────────────┐
│   I · For Yourself                              │  ← Roman numeral + label
│                                                 │
│   ────────────────────                          │
│   You came here with…                           │  ← small brass label
│   too many thoughts.                            │  ← echo of hero Layer 2
│                                                 │
│   What you may need…                            │  ← small brass label
│   one thought clearer.                          │  ← echo of hero Layer 2
│                                                 │
│   ────────────────────                          │
│                                                 │
│   A 3-minute first step                         │  ← small brass label
│   "<story title>"                               │  ← actual audio title
│   (one sentence describing it)                  │
│                                                 │
│   🟢 [ Listen now — 3 min ]                     │  ← PRIMARY CTA (filled brass)
│                                                 │
│   ────────────────────                          │
│                                                 │
│   When you are ready…                           │
│   ⚪ [ Enter Grace's room ]                     │  ← SECONDARY CTA (outline)
│                                                 │
└─────────────────────────────────────────────────┘
```

---

## Path 1 · For Yourself

**Eyebrow:** I · For Yourself

**Came with:**
> too many thoughts.

**Needs:**
> one thought clearer.

**Why this path:**
> When the day has been loud, and you just need a quiet corner to put
> something down before you go to sleep.

**3-minute first step:**
- **Title:** *The Coat on the Chair*
- **Type:** Listen (audio, ~3 min)
- **Route:** `/listen/hearth/the-coat-on-the-chair`
- **One-line description:**
  *A short evening story about the small things that wait quietly for
  you to come back to yourself.*
- **CTA label:** "Listen now · 3 min"

**Next room (when ready):**
- **Label:** "Enter Grace's room"
- **Route:** `/clarity-release`
- **What lives there:** Slow reflection. Reading. Clarity work. The room
  most people come back to when life asks too much.

---

## Path 2 · As a Parent

**Eyebrow:** II · As a Parent

**Came with:**
> a hard conversation at home.

**Needs:**
> one new way to begin it.

**Why this path:**
> For the parent who wants the evening to be quieter — without becoming
> the one who has to perform calm for everyone else.

**3-minute first step:**
- **Title:** *The Sock on the Stairs*
- **Type:** Listen (audio, ~3 min)
- **Route:** `/listen/hearth/the-sock-on-the-stairs`
- **One-line description:**
  *A short Hearth story about the moment you walk past the small thing
  on the stairs — and what happens if you stop and pick it up.*
- **CTA label:** "Listen now · 3 min"

**Next room (when ready):**
- **Label:** "Enter The Hearth"
- **Route:** `/the-hearth`
- **What lives there:** The full Hearth Protocol — five quiet evening
  stories built for households who want a softer landing into the night.

---

## Path 3 · Together (Family)

**Eyebrow:** III · Together

**Came with:**
> an evening that disappeared.

**Needs:**
> one shared moment back.

**Why this path:**
> For the household that wants one quiet minute together before sleep —
> without screens, without performance.

**3-minute first step:**
- **Title:** *Little Star*
- **Type:** Listen (audio, ~3 min)
- **Route:** `/listen/little-star`
- **One-line description:**
  *A gentle bedtime listen for the youngest one in the room — and for
  whoever is sitting beside them.*
- **CTA label:** "Listen together · 3 min"

**Next room (when ready):**
- **Label:** "Enter Polarstar"
- **Route:** `/kids-universe/polarstar`
- **What lives there:** Polarstar Kids — bedtime stories, quiet
  activities, and a parent-managed evening rhythm.

---

## Closing line (below the three cards)

> Whichever door you pick, you can leave whenever you need to.

Ghost link back: `[ Back to Matrix Aurin ]` → `/`

---

## Design tokens (must match HousePreview)

- Background: `#0b0a08`
- Ivory text: `#f0eadd`
- Muted text: `#bcb4a3`
- Brass: `#c4a46b`
- Brass bright: `#d4b67d`
- Serif: `"Cormorant Garamond", "EB Garamond", Georgia, serif`
- Eyebrow tracking: `0.42em` uppercase, 11px
- Body serif size: 17-22px depending on level
- Spacing: very generous — match HousePreview rhythm
- Card border: `1px solid rgba(196,164,107,0.32)` (matches "world" cards
  in `TwoWorldsSection`)
- Brass corner accent (top-left), like the Inner/Outer cards on the homepage

## CTAs visual hierarchy

- **Primary** (Listen now · 3 min) → filled brass button, dark text.
- **Secondary** (Enter X room) → brass outline, brass text.

## Data-testids

- `start-here-root`
- `start-here-headline`
- `start-here-card-for-yourself`
- `start-here-card-as-a-parent`
- `start-here-card-together`
- `start-here-listen-for-yourself` (Listen now CTA)
- `start-here-listen-as-a-parent`
- `start-here-listen-together`
- `start-here-room-for-yourself` (Enter X room CTA)
- `start-here-room-as-a-parent`
- `start-here-room-together`
- `start-here-back-home`

## What this page does NOT have

- No pricing.
- No "sign up".
- No newsletter capture.
- No third "premium" path that costs money.
- No mention of "subscription", "course", "platform".
- No imagery that competes with the audio focus (one quiet brass corner
  accent per card; everything else is type and silence).
