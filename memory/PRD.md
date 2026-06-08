# Matrix Aurin · prulesoul — PRD (2026-02 SESSION HANDOFF)

## Original Problem Statement
"High Luxury / Sanctuary v3.0" platform — Matrix Aurin / Polarstar Kids.
Estonian-speaking founder (Anna), 100% English UI. Brand philosophy:
"Screen-Down, Ears-Open" / strictly anti-wellness. Parent-managed
configuration dashboard as ambient media.

## Personas
- Adult seeker (Grace / Alistair rooms)
- Parent of children 3-12 (Polarstar Kids / Body Room / Parents' Room)
- Founder Anna (Estonian, manages content + sees previews)

## Architecture
- React frontend `/app/frontend` + FastAPI `/app/backend` (server.py monolith) + MongoDB
- Emergent platform with auto-commit per turn
- Nano Banana (Gemini) via Emergent LLM Key for hero backgrounds

## What's been implemented (THIS SESSION 2026-06-08)
### Grace Room (warm-light homepage)
- `/grace` = public homepage (Welcome back. — light, fireplace, daylight)
- `/grace/room` = real Wanderer's Gate + ConvAI + chat (legacy ClarityRelease.jsx behind /grace/room)
- `/grace/speak`, `/grace/write`, `/grace/evening`, `/grace/messages` = 4 sub-pages with own Nano Banana backgrounds
- `/grace/library` + 5 PDF articles (browser-native PDF export via window.print)
- Today's Reflection (7-day rotation) + Words For You + Recent Notes on home

### Alistair Laboratory of Life
- `/course-room` = public homepage ("Welcome to the Laboratory of Life", sunlit study)
- `/course-room/room` = real Wanderer's Gate + ConvAI + chat (legacy CourseRoom.jsx)
- `/course-room/laboratories` = 5 lab cards (Money Tree active, 4 SOON)
- `/course-room/lab/money-tree` = full Money Tree lab (3 explore, 5 read, 3 experiments, 4 notes, 1 PDF)
- `/course-room/explore`, `/read`, `/experiments`, `/notes`, `/library` = legacy Alistair sub-pages

### Navigation isolation
- Grace context (`/grace*`) → nav = `[Home, Grace]` only
- Alistair context (`/course-room*`) → nav = `[Home, Courses]` only
- All other rooms → full 13-item nav

### Redirects
- `/clarity-release` → `/grace/room`
- `/aurin` → `/kids-universe/polarstar` (Kids-isolated, NOT Grace)
- `/private-room`, `/pricing` → `/grace/room`
- Soft 404 with adult-only doors (Home / Grace / Reach Out, NO Kids link)

### Stabilisation (final step)
- Removed 6 fake-rule eslint-disable references (react-hooks/set-state-in-effect, purity, refs, immutability)
- Kept apostrophe + quote escapes + catch(_e)
- Pre-existing lint debt (13 hoiatust) intentionally NOT touched

## P0 / P1 Roadmap (not done)
- P0: Test ConvAI voice runtime tomorrow (Anna manual, voice rooms re-open free)
- P1: 4 remaining Alistair laboratories (Self-Sabotage, Child & Parent, Masks, Compass) — awaits Anna briefs
- P1: Pre-existing lint debt sprint (refactor CadenceEngine + BodyRoomChat + KidsRooms hook patterns)
- P2: Optimise Grace sub-page backgrounds (2.4-2.8 MB PNG → WebP)
- P2: Currency toggle USD/EUR in header
- P3: Re-enable commerce (Launch Pause Mode removal)

## Critical files of reference
- `/app/frontend/src/pages/Grace.jsx`
- `/app/frontend/src/components/grace/GraceSubPage.jsx`
- `/app/frontend/src/pages/grace/{Speak,Write,Evening,Messages,Library,LibraryArticle}.jsx`
- `/app/frontend/src/data/graceLibrary.js`
- `/app/frontend/src/pages/Alistair.jsx`
- `/app/frontend/src/components/alistair/AlistairSubPage.jsx`
- `/app/frontend/src/pages/alistair/{Explore,Read,Experiments,Notes,Library,LibraryArticle,Laboratories,Lab,LabArticle}.jsx`
- `/app/frontend/src/data/{alistairLibrary,alistairLabs}.js`
- `/app/frontend/src/App.js` (routes)
- `/app/frontend/src/components/layout/Navigation.jsx` (context isolation)
- `/app/scripts/generate_grace_light_bg.py`, `generate_alistair_bg.py`

## Deploy verdict (2026-06-08)
**B) READY FOR DEPLOY WITH KNOWN RISKS**
- 22/22 routes render clean, 6/6 mobile no horiz scroll
- Backend + packages: 0 changes
- Known risks: pre-existing lint debt (13), auth/ConvAI runtime UNKNOWN (Anna tests tomorrow)
