# Polarstar Kids — Full System Audit
**Date:** 2026-02-29 (iter 86h+++)
**Trigger:** Founder asked for honest, complete audit of which Polarstar
Kids surfaces exist, which buttons navigate to real content, which are
placeholders, and where illustrations are or are not present.

This audit is **read-only**. No code changed. Findings to be discussed
before any cleanup is attempted.

---

## TL;DR (4 lines)

- **3 rooms (Discovery / Exploration / Creation), 17 activities total, 10 LIVE + 7 "Coming Soon".**
- **5 stories total across all 3 age bands** (2 / 2 / 1). The oldest age band (9–12) has only ONE story.
- **0 audio files. 0 per-story PDFs. 0 unique per-story illustrations** — all stories share one fallback image (`aurin-companion.png`).
- **The "Coming Soon" cards open themed previews — they are NOT broken**, but they advance no real content forward and they live inside the world (not waitlist modals).

---

## 1. Surface map (every clickable route)

```
/                                       — House Preview (adult)
/kids-universe                          → 302 redirect → /kids-universe/polarstar
/kids-universe/polarstar                — Painted world hero, 3 age tabs (day/night modes)
/kids-universe/polarstar/discovery      — Discovery World (ages 4-6) shell + activity grid
/kids-universe/polarstar/exploration    — Exploration World (ages 7-10) shell + activity grid
/kids-universe/polarstar/creation       — Creation Studio (ages 11-13) shell + activity grid
/kids-universe/polarstar/:roomId/:activitySlug
                                        — Generic activity reader (PolarstarActivity.jsx · 665 lines)
/kids-universe/polarstar/:roomId/story-time/:storySlug
                                        — Story reader (PolarstarStoryRead.jsx · 114 lines)

Legacy redirects to /kids-universe/polarstar (no broken paths):
  /kids-universe/legacy
  /kids-universe/coloring
  /kids-universe/journey
  /kids-universe/journey/:zone
  /kids-universe/:ageGroup/hub
  /kids-universe/:ageGroup/stars
  /kids-universe/:ageGroup/daily
  /kids-universe/:ageGroup/activities
  /kids-universe/:ageGroup/activities/:slug
  /aurins-room/stories                  (deprecated path)
  /aurins-room/stories/:storySlug       (deprecated path)
  /aurins-room/gift                     (deprecated path)
```

**Verdict on surfaces:** Architecture is clean. No 404s. No orphan
routes. Coming Soon clicks land *inside* the world (theme preserved),
not on a generic modal. This is correctly implemented.

---

## 2. Content inventory by age band

### 2.1 Discovery World (Ages 4–6) — bucket: `little-dreamers`

| Activity | Status | Content present? | Notes |
|----------|--------|------------------|-------|
| **Story Time** | 🟢 LIVE | 2 stories | "Little Star" (3 min), "The Moon Boat" (3 min). No audio. No per-story PDF. |
| **Play & Move** | 🟢 LIVE | 4 moves | Tall tree / Bunny hops / Bear walk / Wiggle and freeze. **THIS is the activity targeted for the "Play & Move" UX deepening rewrite.** |
| **Drawing Palette** | 🟡 SOON | 4 prompts present, canvas not built | Prompts ready but no canvas. Page is a themed preview. |
| **Kindness Mission** | 🟢 LIVE | 4 actions | "Today's Kind Challenge" + 4 options. |
| **Morning Mindful Start** | 🟢 LIVE | 4 steps | Soft 3-breath ritual. |

**Score:** 4/5 LIVE · 1 themed preview · 2 stories.

### 2.2 Exploration World (Ages 7–10) — bucket: `explorers`

| Activity | Status | Content present? | Notes |
|----------|--------|------------------|-------|
| **Story Time** | 🟢 LIVE | 2 stories | "The Night Forest" (4 min), "The Quiet Dragon" (4 min). No audio. No PDF. |
| **Nature Quest** | 🟢 LIVE | 4 actions | Touch bark / find leaf / count bird sounds / hold a stone. |
| **World Cultures** | 🟡 SOON | Parent tip only | No prompts, no list, no content. |
| **Space Adventures** | 🟡 SOON | Parent tip only | No prompts, no list, no content. |
| **Amazing Animals** | 🟡 SOON | Parent tip only | No prompts, no list, no content. |
| **Science Lab** | 🟡 SOON | Parent tip only | No prompts, no list, no content. |
| **Reflection Time** | 🟢 LIVE | 4 prompts | "What made you smile today?" etc. |

**Score:** 3/7 LIVE · 4 themed previews · 2 stories.
**⚠️ Critical finding:** Exploration is the **WEAKEST room**. 4 of 7
activities are blank previews. The 7–10 audience is also the largest
addressable kids segment commercially. Worth filling FIRST.

### 2.3 Creation Studio (Ages 11–13) — bucket: `dreamweavers`

| Activity | Status | Content present? | Notes |
|----------|--------|------------------|-------|
| **Design Lab** | 🟢 LIVE | 4 steps | Redesign a chair/lamp/book cover. |
| **Build Something** | 🟢 LIVE | 4 steps | 45-min timer + one material. |
| **Code Studio** | 🟡 SOON | Parent tip only | No content. |
| **Media Studio** | 🟡 SOON | Parent tip only | No content. |
| **Share Project** | 🟢 LIVE | 4 actions | Read paragraph / show drawing / send photo / sit nearby. |

**Score:** 3/5 LIVE · 2 themed previews · **0 stories in story-time
because Story Time is not even in this room's activity list!**

**⚠️ Critical finding #2:** Creation Studio has **no Story Time slot
at all**. The 9–12 age band gets only ONE story in the entire catalogue
("Aurin and the Lantern"), and the room doesn't even surface it. A
visitor age 11 lands on Creation and cannot find any story without
manually typing the story-time URL.

---

## 3. Story catalogue — total 5

| Slug | Age band | Length | Audio | PDF | Illustration |
|------|----------|--------|-------|-----|--------------|
| `little-star` | 3–5 | 3 min · 6 paras | ❌ null | ❌ null | shared `aurin-companion.png` |
| `moon-boat` | 3–5 | 3 min · 5 paras | ❌ null | ❌ null | shared `aurin-companion.png` |
| `night-forest` | 6–8 | 4 min · 8 paras | ❌ null | ❌ null | shared `aurin-companion.png` |
| `quiet-dragon` | 6–8 | 4 min · 8 paras | ❌ null | ❌ null | shared `aurin-companion.png` |
| `aurin-and-the-lantern` | 9–12 | 5 min · 9 paras | ❌ null | ❌ null | shared `aurin-companion.png` |

**Audio:** 0/5 — none of the in-app stories have audio. (The Gumroad
PDF is a separate physical bundle; this audit only addresses what
exists *inside* the Polarstar Kids in-app surface.)

**PDF:** 0/5 — none of the in-app stories has a per-story PDF download.
The Gumroad bundle PDF contains all 5 but is gated behind purchase.

**Illustrations:** 1/5 — all stories show the same Aurin companion
portrait. **No story has its own painting.**

---

## 4. The "Play & Move" status (founder asked specifically)

- File: `frontend/src/pages/PolarstarActivity.jsx` — 665 lines, renders
  ALL activity types generically (story / moves / breathe / kindness /
  reflect / draw / project / soon).
- Discovery's `play-move` route resolves to this component with the
  4 moves attached (Tall tree, Bunny hops, Bear walk, Wiggle and freeze).
- Current rendering: a 4-card grid. **NOT** the narrative wrapper
  ("Little Star reach the moon") + parent-lock the founder approved
  in `play_move_mockup.md`.
- Mockup was created. Code rewrite has NOT begun. Founder asked to wait
  for explicit confirmation of `play_move_mockup.md` before any
  PolarstarActivity.jsx changes.

---

## 5. Illustrations — what exists and where

`/app/frontend/public/assets/`:
- `kids/visualisations/book.mp4` — 1 video, animation, unclear placement
- `aurin/aurin-companion.png` — single portrait used as fallback for all 5 stories
- Sub-directories under `/public/assets/`: about/, audio/, aurin/,
  blog/, books/, brand/, coloring/, illustrations/, kids/, lottie/,
  origin/, pdfs/, portraits/, house/, videos/.

**The `illustrations/` directory exists but no story file references
it.** Worth a separate audit pass to map what's there vs what's
referenced. Quick scan suggests illustrations were created for an
earlier non-Polarstar version of the kids surface and never wired in.

---

## 6. What is **working well** (don't break)

- Painted-world feel preserved across every Coming Soon — no jarring
  jumps to waitlist modals
- Per-age palette (`PAL.discovery` amber / `PAL.exploration` sage /
  `PAL.creation` indigo) is consistent and visually disciplined
- `polarstarContentMap.js` is genuine source-of-truth — no copy-pasted
  parallel definitions of activities
- `getActivity()` hydrates story collections lazily from
  `aurinStories.js` — adding a new story automatically appears in the
  correct age room
- Mobile-friendly layouts (PolarstarThemePage shell scales)
- All legacy URLs redirect cleanly (no 404s)
- Brand language is **fully PSP-safe** across all 17 activity copies
  (no "AI", "therapy", "wellness" found in any activity blurb or
  parent tip — verified by spot-grep)

---

## 7. What is **missing** (in priority order)

### 🔴 P0 — Already approved, awaiting trigger
1. **Story Time audio per story** (0/5 stories have it) — Little Star
   audio coming as Phase 1 free preview. Path is `audio: null` →
   `audio: "/assets/audio/stories/little-star.mp3"` in
   `aurinStories.js`.

### 🟡 P1 — Catalogue gaps that hurt user experience now
2. **Creation Studio has no Story Time slot** — 11–13 visitors cannot
   discover "Aurin and the Lantern". Fix: add a story-time activity
   to `CREATION_ACTIVITIES` with `storyAgeBucket: "dreamweavers"`.
3. **Dreamweavers has only 1 story** — should be 2–3 to match other
   age bands. Author 1–2 more 9–12 stories.
4. **Exploration's 4 blank "Soon" cards** (World Cultures, Space,
   Amazing Animals, Science Lab) — at minimum, give each an
   `actions: [...]` array with 3–4 prompts so the click yields
   *something* useful, like "Pick a country your child has never
   heard of. Look it up together for 2 minutes."

### 🟢 P2 — Polish + retention
5. **Per-story illustrations** — 5 unique paintings would lift the
   product from "text site with stock cover" to "real picture book".
   ~€50 / illustration if outsourced; ~6h / illustration if generated
   via Nano Banana or Midjourney with disciplined prompts.
6. **Per-story PDF download** — single-page printable per story.
   Trivial to wire (`pdf` field already exists in schema).
7. **Drawing Palette canvas** — Discovery's only Coming Soon. 4 prompts
   already drafted. Either ship a simple HTML5 canvas (Drawing happens
   in the browser, child saves PNG locally) or convert it from "soon"
   to a "use real paper" challenge.
8. **`play-move` UX deepening** to the `play_move_mockup.md` spec
   (narrative wrapper, 4-step progression, parent-lock).

### 🟣 P3 — Backend wiring (NEVER before frontend UX is approved)
9. `kids_polarstar_progress` collection — track which activities a
   parent/child completes, for "Tomorrow's Adventure" chrono-lock.
10. Story Stars (the painted constellation) — tie completed story
    reads to a soft accumulation visible on the painted world.

---

## 8. Coverage matrix — at-a-glance scorecard

| Room | LIVE / total | Story count | Audio | PDF | Unique art |
|------|--------------|-------------|-------|-----|------------|
| Discovery (4–6) | **4 / 5** ✅ | 2 ✅ | 0 ⚠️ | 0 ⚠️ | 0 ⚠️ |
| Exploration (7–10) | **3 / 7** 🔴 | 2 ✅ | 0 ⚠️ | 0 ⚠️ | 0 ⚠️ |
| Creation (11–13) | **3 / 5** 🟡 | **0** 🔴 (catalogue has 1, room hides it) | 0 ⚠️ | 0 ⚠️ | 0 ⚠️ |
| **TOTALS** | **10 / 17 LIVE (59%)** | 5 catalogue / 4 shown | 0 / 5 | 0 / 5 | 0 / 5 |

**Honest reading:** the surface is **well-architected but under-stocked**.
The skeleton is right. The flesh is partial. Discovery is the
strongest room. Exploration has the biggest content gap. Creation has
a structural bug (no story-time slot).

---

## 9. Recommended sequence (if/when founder green-lights)

```
Sprint A (this week)
  ☐ A1. Little Star audio → /listen/little-star (P0, audio pending)
  ☐ A2. Wire 4 Exploration "Soon" cards with action lists (P1, ~30 min)
  ☐ A3. Add Story Time slot to Creation Studio (P1, ~5 min code change)

Sprint B (next week, after W2 audio observation)
  ☐ B1. PolarstarActivity.jsx "Play & Move" rewrite to mockup (P1, ~2h)
  ☐ B2. Author 1 new Dreamweavers story (founder authoring, ~1h)
  ☐ B3. Drawing Palette canvas OR convert to paper-challenge (P2, ~3h vs ~5min)

Sprint C (later, after first real Gumroad sale)
  ☐ C1. Audio for remaining 4 stories (founder recording)
  ☐ C2. Per-story PDF download wiring
  ☐ C3. Per-story illustrations
  ☐ C4. kids_polarstar_progress backend
```

---

## 10. What this audit deliberately did NOT check

- Backend MongoDB collections referenced by Polarstar (only frontend route surface and content data).
- House/adult surface — separate audit.
- A/B test analytics on which activities convert most clicks.
- Mobile vs desktop visual regressions.
- Accessibility (screen-reader / keyboard navigation).
- Day-mode vs night-mode painted-world differences (both render the same activity grid).
- Whether any of the 7 Coming Soon previews accidentally trigger Resend emails (spot-checked — they do not; they open inside-the-world themed previews via PolarstarActivity.jsx type="soon").

---

*Audit completed read-only by agent on 2026-02-29 while founder records
Little Star audio. Founder reviews before any sprint is started.*
