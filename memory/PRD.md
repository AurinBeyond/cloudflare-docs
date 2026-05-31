# Polarstar / Aurin Hub — Product Requirements

**Last updated:** 2026-05-31 (iter 86o-fork)
**Project:** Matrix Aurin · Polarstar Kids platform
**Brand philosophy:** "Screen-Down, Ears-Open" · strictly anti-wellness · parent-managed ambient media

---

## Original problem statement

Continue building the "High Luxury / Sanctuary v3.0" platform. UI must be
100% in English, conversational responses in Estonian. Polarstar Kids is
the lead surface — a calm, parent-managed configuration dashboard acting
as ambient media. Primary monetisation = €9 PDF "Polarstar Bedtime
Stories" sold via Gumroad.

## Tech stack (locked)

- React frontend (`/app/frontend`) — port 3000
- FastAPI backend (`/app/backend`) — port 8001
- MongoDB
- ffmpeg (for audio mastering)
- Gumroad (LIVE PSP, €9 product fwqmha)
- Emergent LLM Key (Nano Banana image generation, Claude/GPT text)

## Critical files (do not delete without founder)

- `/app/memory/POLARSTAR_STORY_BIBLE_v1.md`
- `/app/memory/POLARSTAR_VISUAL_BIBLE_v1.md` (v1.2 — .webp, slug 1:1)
- `/app/memory/POLARSTAR_ASSET_PRODUCTION_PLAN.md`
- `/app/memory/BILLING_SOURCE_OF_TRUTH_2026-02-29.md`
- `/app/frontend/src/data/aurinStories.js`
- `/app/frontend/src/pages/PolarstarStoryRead.jsx`
- `/app/frontend/src/pages/ListenLittleStar.jsx`
- `/app/scripts/generate_polarstar_pdf.py`
- `/app/scripts/gumroad_update_description.py` (new)
- `/app/scripts/generate_little_star_hero.py` (new)

---

## What's implemented

### 2026-02-29 / 2026-03-01 (earlier iterations)
- Billing audit — Gumroad locked as single PSP
- `/listen/little-star` web player (ambient, no download — by design)
- v1.1 PDF with audio link
- 3 Master Bibles authored
- UX structural defects fixed (nested buttons, waitlist disconnects)
- Audio mastered via ffmpeg (little-star.mp3, 2.3 MB)
- `PolarstarStoryRead.jsx` defensive/conditional rendering for hero + audio

### 2026-05-31 (Sprint 2 — preview, awaits Deploy)
- **Sitemap.xml v2** — added `/listen/little-star`, `/seven-quiet-nights`,
  all 5 per-story reader routes, `/clarity-release` (15 URLs total, +9 new)
- **Google Search Console** verification meta-tag scaffold in `index.html`
  (placeholder token, founder swaps in real token after first auth)
- **Plausible analytics** snippet scaffolded in `index.html` (commented
  out by default; uncomment after Plausible account is created)
- **`/seven-quiet-nights`** challenge landing page shipped — Idea A from
  the marketing master plan. One CTA → Gumroad PDF. Brand-aligned, no
  urgency, no streaks, no notifications.
- **`/app/memory/PLATFORM_INVENTORY.md`** — **CRITICAL course-correction
  doc.** Full audit of the actual house: 5 rooms, 7 audience groups,
  4 existing products, 5 empty product slots, 4 influencer-list
  directions. Agent reads this every session to avoid Polarstar
  fixation.
- **`/app/memory/FOUR_WORLDS_RULE.md`** — **supreme** marketing rule
  (locked 2026-05-31): four audiences, four platforms maps, no message
  contamination. Overrides any conflicting line in other marketing files.
- **`/app/memory/MARKETING_MASTER_PLAN.md`** — v1.1 marketing
  blueprint. Three product lines, weekly publishing cadence, 20-name
  influencer batched plan.
- **`/app/memory/CONTENT_DISTRIBUTION_PLAYBOOK.md`** — 3 Show HN angles
  (one per line, spaced 4 weeks), 9-subreddit infiltration map,
  12-essay Substack backlog, YouTube/TikTok/Pinterest format specs,
  weekly execution checklist
- **`/app/memory/influencer_log.md`** — 4-batch tracker with pitch
  template + per-category pitch variants

### 2026-05-31 (Phase 1.1 — LIVE in production)
- **Gumroad product description updated via API** (`PUT /v2/products/:id`)
  - Added "Free audio companion (NEW)" section
  - Updated custom_receipt copy
  - PDF file preserved untouched (safe path — founder will add MP3 to
    Gumroad Content tab manually via UI)
- **Little Star Hero illustration** generated via Nano Banana
  - 3 candidates produced and passed Visual Bible 5-point test
  - Founder selected candidate C ("äärmiselt armas")
  - Committed as `/app/frontend/public/assets/aurin/stories/little-star-hero.webp`
  - `aurinStories.js` `cover` field flipped from fallback to hero path
  - Verified: hero renders on `/kids-universe/polarstar/discovery/story-time/little-star`

---

## Roadmap

### P0 — Founder action items (NEXT)
1. Click **Deploy** in Emergent panel so that:
   - `/listen/little-star` page goes live on prulesoul.site
   - `/assets/audio/polarstar/little-star.mp3` becomes downloadable on prod
   - New Little Star hero shows on prod story reader
2. Open Gumroad → Polarstar Bedtime Stories → Content tab and upload
   `little-star.mp3` (path: `/app/frontend/public/assets/audio/polarstar/`)
3. Verify a test purchase delivers PDF + MP3 + correct receipt copy

### P1 — Phase 1.2 Voice + Visual continuation
- Record audio for: Moon Boat, Night Forest, Quiet Dragon, Aurin Lantern
  (founder, one weekend session)
- Generate hero illustrations for the remaining 4 stories (Nano Banana,
  Visual Bible Night Palette, ~3 candidates each, founder approves each)
- Once all 5 ship → create €19 Audio Bundle SKU on Gumroad

### P1 — Marketing / Distribution
- Finalize Show HN draft "Variant A" (founder confession) in
  `/app/memory/show_hn_draft.md`
- Substack/Medium essays for organic leads (P3)
- Founder mentioned a YouTube idea (https://www.youtube.com/watch?v=4y3TjP66OTk)
  — backlog item to review and discuss separately

### P2 — Content catalogue
- 2 new "Dreamweavers" stories (ages 9–12) authored by founder
- Discovery Drawing Palette (HTML5 Canvas)
- Per-story PDF downloads

### P3 — Phase 2 backend wiring (DO NOT START until content fill complete)
- Story Stars
- Tomorrow's Adventure chrono-lock
- My Space / Family Zone features

---

## Outstanding issues

- **ElevenLabs API key lacks `voices_read` scope** — ON HOLD. User and
  agent agreed to skip Speech-to-Speech harmonisation; original
  ffmpeg-polished audio is the canonical version (founder's authentic
  breathing is a brand asset).

## Health check

- Broken: none
- Mocked: none
- All services running (frontend, backend, MongoDB)
- Gumroad webhook live
- Audio + hero illustration verified end-to-end on preview URL
