# POLARSTAR ASSET PRODUCTION PLAN
**Version:** 1.0 · **Date:** 2026-02-29 (iter 86m)
**Scope:** Existing 5 stories only. NO new stories. NO code. NO image
generation. NO audio generation. NO frontend modification.
**Purpose:** One production table that organises the asset work before
a single credit is spent.

---

## Phase ordering (locked)

```
PHASE 1 — Voice Layer       (5 audio files)
PHASE 2 — Illustration Layer (5 hero images, one per story)
PHASE 3 — Dreamweavers Completion (2 new stories for ages 9–12)
```

**Rule:** Phase N+1 does not begin until Phase N is shipped.

---

## PHASE 1 — Voice Layer Production Table

| # | Story | Route | Est. audio length | Source text | Voice direction | Output filename | Implementation location | Status |
|---|-------|-------|-------------------|-------------|-----------------|------------------|------------------------|--------|
| 1 | Little Star | `/kids-universe/polarstar/discovery/story-time/little-star` | ~1:30–2:00 | `aurinStories.js` STORIES[0].body (6 paragraphs) — match Gumroad PDF canonical | Warm · slow · whispered "There you are." line · long pause before final paragraph | `little-star.mp3` | `/app/frontend/public/assets/audio/polarstar/little-star.mp3` + flip `audio: null` → path in `aurinStories.js` | ⏸ awaiting founder recording (Phase 1.1) |
| 2 | The Moon Boat | `/kids-universe/polarstar/discovery/story-time/moon-boat` | ~1:30–2:00 | `aurinStories.js` STORIES[1].body | Warm · gentle · dreamlike pacing on "moonlit clouds" line | `moon-boat.mp3` | `/app/frontend/public/assets/audio/polarstar/moon-boat.mp3` | ⏸ awaits 1.1 success |
| 3 | The Night Forest | `/kids-universe/polarstar/exploration/story-time/night-forest` | ~3:00–4:00 | `aurinStories.js` STORIES[2].body | Slightly braver tempo (7-10 audience) · quiet awe on woodland animals · no scary intonation | `night-forest.mp3` | `/app/frontend/public/assets/audio/polarstar/night-forest.mp3` | ⏸ awaits 1.1 success |
| 4 | The Quiet Dragon | `/kids-universe/polarstar/exploration/story-time/quiet-dragon` | ~3:00–4:00 | `aurinStories.js` STORIES[3].body | Calm, steady · dragon never sounds threatening · pause before "still" moments | `quiet-dragon.mp3` | `/app/frontend/public/assets/audio/polarstar/quiet-dragon.mp3` | ⏸ awaits 1.1 success |
| 5 | Aurin and the Lantern | `/kids-universe/polarstar/creation/story-time/aurin-and-the-lantern` | ~4:00–5:00 | `aurinStories.js` STORIES[4].body | A touch more grown-up · contemplative · honour the longer rhythm | `aurin-and-the-lantern.mp3` | `/app/frontend/public/assets/audio/polarstar/aurin-and-the-lantern.mp3` | ⏸ awaits 1.1 success |

**Phase 1 success criteria:**
- 5 mp3 files in `/app/frontend/public/assets/audio/polarstar/`
- 5 `audio: null` entries in `aurinStories.js` flipped to actual paths
- 5 stories play correctly inside `PolarstarStoryRead.jsx` via `<audio>` element
- Optional: a `/listen/little-star` public preview page (already
  scaffolded in `ListenLittleStar.jsx`, route not yet wired)

**Phase 1.1 (single-story pilot):** Little Star alone — verify quality,
verify integration, verify Gumroad PDF audio-link block. If pilot
succeeds, all 4 remaining recordings cleared.

**Phase 1.2 (bulk):** Moon Boat + Night Forest + Quiet Dragon +
Aurin Lantern recorded in one weekend by founder.

---

## PHASE 2 — Illustration Layer Production Table

| # | Story | Hero image scene (per Visual Bible) | Image generation prompt (foundation + scene) | Output filename | Implementation location | Status |
|---|-------|--------------------------------------|----------------------------------------------|-----------------|------------------------|--------|
| 1 | Little Star | A small golden star shining softly above a sleeping village. Moonlit sky, quiet clouds, warm light, peaceful night. | `[VISUAL BIBLE FOUNDATION]` + *"a single small golden star shining softly in the upper night sky above a quiet sleeping village of cottages with warm window lights, gentle moonlit clouds, peaceful nighttime atmosphere, no characters, no faces, soft amber and indigo palette, painted bedtime mood"* | `little-star-hero.png` | `/app/frontend/public/assets/aurin/stories/little-star-hero.png` + update `cover` field in `aurinStories.js` | ⏸ awaits Phase 1 ship |
| 2 | The Moon Boat | A tiny wooden boat sailing across moonlit clouds. Silver moon, soft clouds, calm sky, glowing reflections. | `[FOUNDATION]` + *"a tiny wooden boat with a small lantern at its bow sailing gently across silver moonlit clouds, a large peaceful crescent moon in the sky, soft glowing reflections on the cloud surface, dreamlike but safe atmosphere, no characters visible, soft silver and warm cream palette"* | `moon-boat-hero.png` | `/app/frontend/public/assets/aurin/stories/moon-boat-hero.png` | ⏸ |
| 3 | The Night Forest | A child standing on a forest path illuminated by lantern light. Warm lantern glow, tall trees, friendly woodland animals, stars visible through branches. | `[FOUNDATION]` + *"a child of about 7 years with realistic proportions standing on a softly lit forest path holding a warm amber lantern, tall trees on either side, two friendly woodland animals (small fox, hare) at peaceful distance, gentle starlight breaking through branches above, mysterious but welcoming atmosphere"* | `night-forest-hero.png` | `/app/frontend/public/assets/aurin/stories/night-forest-hero.png` | ⏸ |
| 4 | The Quiet Dragon | A peaceful dragon resting near a lake at sunset. Calm dragon, soft scales, warm sky, reflections on water. | `[FOUNDATION]` + *"a large peaceful dragon resting calmly beside a still lake at golden sunset, soft scales rendered as gentle gouache texture, warm orange-pink sky reflecting on calm water, the dragon's posture protective and serene not threatening, no claws or aggression visible, painted in the spirit of an old children's storybook"* | `quiet-dragon-hero.png` | `/app/frontend/public/assets/aurin/stories/quiet-dragon-hero.png` | ⏸ |
| 5 | Aurin Lantern | A child carrying a glowing lantern through twilight. Golden lantern, winding path, evening sky, distant stars. | `[FOUNDATION]` + *"a child of about 11 years walking forward along a winding path through twilight, holding a golden glowing lantern in front, soft lavender-and-gold evening sky above, a scattering of distant stars beginning to appear, hopeful and calm atmosphere, the child's expression serene and inward, realistic proportions, timeless clothing"* | `aurin-lantern-hero.png` | `/app/frontend/public/assets/aurin/stories/aurin-lantern-hero.png` | ⏸ |

**Phase 2 success criteria:**
- 5 PNG files in `/app/frontend/public/assets/aurin/stories/`
- 5 `cover: "/assets/aurin/aurin-companion.png"` entries replaced with
  per-story hero paths
- All 5 pass the Visual Bible 5-point Quality Test
- Founder approval per image before commit (no batch-commit)

**Tool recommendation:** Nano Banana (Gemini image) with Visual Bible
foundation prompt. Estimated 3-5 attempts per story to land the
register. Budget: ~25 generations total. Founder selects final from
generated set; agent does not auto-commit.

---

## PHASE 3 — Dreamweavers Completion

**Trigger:** Phase 2 complete AND ≥10 real (non-test) Gumroad sales.

| # | Working title | Age band | Approx. length | Theme proposal | Status |
|---|---------------|----------|----------------|----------------|--------|
| 6 | TBD by founder | dreamweavers (9–12) | ~5 min | TBD — Story Bible value(s) to choose | 📝 not started |
| 7 | TBD by founder | dreamweavers (9–12) | ~5 min | TBD | 📝 not started |

**Rule:** Founder authors. Agent does not invent stories. Author
process: founder drafts → submits text → agent runs Story Bible
5-point approval test → if pass, agent adds to `aurinStories.js`.

---

## Budget reality

- **Phase 1** — zero LLM cost. Founder records on phone. Agent does
  audio cleanup + wiring (~1h per story).
- **Phase 2** — modest image generation budget (~25 Nano Banana
  generations × small cost). Founder selects final from each set.
  Total estimate: under €15 worth of Emergent LLM Key.
- **Phase 3** — founder time only. Agent integration cost trivial
  (~30 min per story added to catalogue).

---

## What this plan deliberately omits

- ❌ Per-story inline illustrations (only hero per story for Phase 2)
- ❌ Drawing Palette canvas (separate workstream, P2 backlog)
- ❌ Code Studio + Media Studio content (separate, P2 backlog)
- ❌ Per-story PDF downloads (separate, P2 backlog)
- ❌ Story Stars / Discovery Stars backend (Phase 3 backend prep)
- ❌ My Space / Family Zone features (Phase 4 territory)
- ❌ Audio cleanup / noise reduction tooling (handled ad-hoc per story
  by the agent using `ffmpeg`-level adjustments only)
- ❌ Subtitle / transcript generation (out of scope for v1)

---

## Versioning

- **v1.0** · 2026-02-29 · initial lock, 5 audio + 5 illustrations +
  2 future Dreamweavers entries.
- Bumps require founder approval; rationale logged in CHANGELOG.

---

*The agent reads this before any audio is processed or image is
generated. No deviation without explicit founder direction.*
