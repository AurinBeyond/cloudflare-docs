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

### 2026-02-10 (E) — Final 4 labs internal hotspots (masks → body-language-v2)
- `pages/alistair/LabDashboard.jsx` extended with topic zones for the
  final 4 labs in LAB_ORDER, completing 11/11 lab coverage.
- Topic zone counts added this session: masks 34 · body-language 30 ·
  child-parent 35 · body-language-v2 32.
- `pages/alistair/TopicDetail.jsx` TOPIC_TITLES extended to cover
  every new topic ID. No placeholder fallback strings shown in UI.
- Verified end-to-end navigation:
  - masks → achiever → "The Achiever"
  - body-language → body-shoulders → "Shoulders — I carry"
  - child-parent → imagine → "Imagine"
  - body-language-v2 → jaw-holding-back → "Jaw — Holding back"

### 2026-02-10 (LIVE E2E AUDIT) — 295/295 hotspots verified
- Full automated traversal of every hotspot in every lab.
- Method: collect every `[data-testid^='lab-zone-topic']` href from
  all 11 lab pages, deduplicate (295 hotspots → 291 unique routes),
  navigate to every unique route, assert each renders
  `[data-testid='topic-title']`, `[data-testid='topic-back-to-lab']`
  and `[data-testid='topic-lab-label']`. Capture console + page
  errors throughout.
- Result (3 sequential batches to avoid Playwright session timeout):
    Batch 1 — money-tree + old-stories + body-knows-first + compass:
      99/99 PASS · 0 console errors · 0 page errors
    Batch 2 — self-sabotage + the-code + invisible-strings + masks:
      95/95 PASS · 0 console errors · 0 page errors
    Batch 3 — body-language + child-parent + body-language-v2:
      97/97 PASS · 0 console errors · 0 page errors
- **Total: 291/291 unique routes PASS, 295/295 hotspots resolved,
  0 dead ends, 0 console errors, 0 page errors, 0 malformed hrefs.**
- Difference (295 → 291): 4 hotspots in money-tree share topic IDs
  across painted groups (worth, fear, trust, receiving each appear
  in both TRUNK and CORE BELIEFS rows — same topicId by design).

### 2026-02-10 (FINAL AUDIT) — 11/11 Laboratories Complete
- Total topic hotspots: **295** across 11 labs.
- Labs using `hideSharedSidebar: true` (no painted Alistair sidebar
  in their mockups): money-tree, compass, the-code,
  invisible-strings, child-parent.
- Labs using shared Alistair sidebar (painted sidebar present in
  their mockups): old-stories, body-knows-first, self-sabotage,
  masks, body-language, body-language-v2.
- All routes /course-room/lab/{slug}/topic/{topicId} resolve to a
  named placeholder via TopicDetail. Zero dead-end links.

### 2026-02-10 (D) — 6 more labs internal hotspots (old-stories → invisible-strings)
- `pages/alistair/LabDashboard.jsx` extended with topic zones for the
  next 6 labs in LAB_ORDER. Total 124 topic hotspots added.
- Per-lab `hideSharedSidebar` set where the painted image has no
  Alistair sidebar painted in:
    - money-tree: hide  (already set)
    - old-stories: keep (painted sidebar present)
    - body-knows-first: keep
    - compass: hide
    - self-sabotage: keep
    - the-code: hide
    - invisible-strings: hide
- Topic zone counts: old-stories 14 · body-knows-first 27 · compass 22 ·
  self-sabotage 9 · the-code 36 · invisible-strings 16.
- `pages/alistair/TopicDetail.jsx` TOPIC_TITLES updated with ~115
  human-readable titles so every painted hotspot opens a named
  placeholder page (no dead ends).
- Verified end-to-end navigation for each lab (one hotspot per lab):
  - old-stories → recognize → "Recognize"
  - body-knows-first → feel → "Feel"
  - compass → purpose → "Purpose"
  - self-sabotage → hidden-patterns → "Hidden Patterns"
  - the-code → ext-parents → "Parents"
  - invisible-strings → string-need-more → "I need more to be enough"

### 2026-02-10 (C) — Money Tree internal hotspots (calibration prototype)
- New stable route layer: `/course-room/lab/:labSlug/topic/:topicId`
  rendered by `pages/alistair/TopicDetail.jsx` placeholder. Topic
  titles dictionary covers all 28 unique Money Tree topic IDs.
- `pages/alistair/LabDashboard.jsx` upgraded (v5):
  - `?debug=1` URL param visualises hotspot outlines with their zone
    ids — used for founder visual calibration.
  - Per-lab `hideSharedSidebar` flag opts a lab out of the shared
    Alistair sidebar zones when the painted mockup has no nav
    sidebar painted in. `money-tree` opts out.
  - Per-lab `topics: TopicZone[]` array allows attaching painted-area
    hotspots that each route to a stable `/topic/{topicId}`.
- Money Tree calibrated with **40 hotspots → 28 unique topic IDs**
  across 8 painted groups:
    GARDENER ACTIONS (3): prune, water, plant
    NOURISHED BRANCHES (5): opportunity, relationships, work-impact,
      creativity, leadership
    TRUNK / INTERNAL BELIEFS (5): worth, trust, identity, value,
      receiving (trunk variants)
    NEGLECTED BRANCHES (5): fear, guilt, scarcity, overworking,
      self-sabotage (branch variants)
    DEEPER ROOTS (5): family, childhood, safety, belonging, love
    OLD STORIES quotes (5): money-doesnt-grow, be-realistic,
      dont-disappoint, work-harder, who-do-you-think
    CORE BELIEFS / INTERNAL PROGRAMS (6): worth, fear, approval,
      control, trust, receiving (belief variants)
    FRUITS / LIFE RESULTS (6): abundance, freedom, contribution,
      financial-flow, inner-peace, meaning
- Verified end-to-end: click "Approval" topic → routed to
  `/course-room/lab/money-tree/topic/approval`, placeholder
  "Approval" page rendered, "Back to Money Tree Within" returns
  to the painted hub.
- Same topic ID is reused across multiple painted locations within
  the same image (e.g. `worth` appears in TRUNK and CORE BELIEFS;
  `fear` in NEGLECTED BRANCHES and CORE BELIEFS).

### 2026-02-10 (B) — Alistair Hub v4: 11 Laboratories
- Founder decision: hub MUST show ALL 11 labs (not 4). Polarstar
  single-image pattern relaxed to a composition: dark CSS sidebar +
  scenic backdrop hero + 11 painted-thumbnail cards (LAB_ORDER) +
  dark CSS right column.
- `/app/frontend/src/pages/Alistair.jsx` rewritten:
  - Source of truth: `LAB_ORDER` (11 slugs), NOT
    `HOME_PATH_OF_EXPLORATION` (4).
  - 11 cards rendered with numbered badges 1–11, painted lab
    thumbnails, cream body, mockup-matched short descriptions.
  - Each card → `/course-room/lab/{slug}` (no invented routes).
  - Sidebar: ALISTAIR mark + Home / Explore (→ /laboratories) /
    Read / Experiments / Notes / Library + Alistair quote.
  - Right column: HOW WE EXPLORE 4 steps + Alistair bio + "Let's
    explore together" → `/course-room/room`.
- `data/alistairLabs.js`: lab names/short descriptions aligned with
  founder mockup (Self-Sabotage, Masks, The Code, Invisible Strings,
  Body Language, Body Language V2, Child & Parent, Compass of
  Meaning).
- `components/layout/Navigation.jsx`: global header now HIDDEN on
  `/course-room/lab/*` (success criterion) so painted lab pages read
  edge-to-edge; hub `/course-room` still shows the filtered top-bar.

### 2026-02-10 (A) — Alistair Hub (Polarstar Pattern, v3) [SUPERSEDED]
- `/app/frontend/src/pages/Alistair.jsx` rewritten to use the
  Polarstar pattern: full-bleed painted `course-room-hub.png` image
  + invisible percentage-based hotspots. NO CSS recreation.
- Hotspots wired (calibrated against painted UI):
  - Sidebar: Home, Explore→/course-room/laboratories, Read, Experiments,
    Notes, Library + ALISTAIR logo→/course-room
  - 4 painted lab cards on hub → /course-room/lab/{slug} for
    money-tree, old-stories, body-knows-first, compass (matching
    HOME_PATH_OF_EXPLORATION from data/alistairLabs.js)
  - Right-column "Let's explore together" CTA → /course-room/room
- `?debug=1` URL param visualises hotspot outlines for founder
  calibration.
- Constraint: the painted hub image only depicts 4 lab cards. The
  remaining 7 labs are reachable in one click via the painted "Explore"
  sidebar item → /course-room/laboratories index. A new painted hub
  image with all 11 cards would be required to expose 11 direct
  hotspots on the hub.

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

## Alistair v3 sprint complete — Polarstar pattern, all 11 labs (2026-02-08)

**What shipped (technical-execution only, no design invention)**
- `Alistair.jsx` v2 hub: dark sidebar + painted study scene + 4-card path of exploration with founder-supplied painted thumbnails (money-tree, old-stories, body-knows-first, compass) + HOW WE EXPLORE 4-step panel + Alistair bio + bottom italic quote. All emoji/placeholder/pending art removed.
- `alistair/LabDashboard.jsx` v3: single Polarstar-pattern component serving all 11 laboratory routes (`/course-room/lab/:labSlug`). Each lab renders its supplied painted mockup edge-to-edge with 7 invisible Link-hotspots over the painted nav (back-to-labs + 6 sidebar items). No CSS panels. No recreated UI. The image IS the design.
- `alistairLabs.js`: full 11-lab catalogue with `thumbnail` field for each. Founder copy adopted on cards.
- `Navigation.jsx`: full global header hide on `/grace*` and `/course-room*`. setState-in-effect refactored to onClick handlers.
- `SanctuaryPreview.jsx`: gold italic line repositioned out of the H1 onto its own paragraph below the subtitle so the painted face on the right is no longer obscured.

**Locked design law (founder, 2026-02-08)**
- The uploaded Alistair images are not references or inspiration. They are the visual specification. Reproduce them as closely as possible. Do not redesign. Do not improvise.
- Same technique as Polarstar: supplied painted image as the full-bleed background + invisible navigation hotspots layered on top. No rebuilding the painted UI in CSS.
- 11 laboratories on equal footing — no Tier-1 / Tier-2 split. All share the same Polarstar dashboard pattern.
- Public-facing system language: English only.

**Still pending (founder asset uploads)**
- `course-room-hub.png` (ChatGPT 9. juni 07_48_06) — `/course-room` hub background
- `invisible-strings.png` (ChatGPT 8. juni 23_38_03) — laboratory #11 hero
- Hotspot coordinate refinements per laboratory if the shared sidebar coordinates do not align perfectly with each painted mockup

## Deploy verdict (2026-06-08)
**B) READY FOR DEPLOY WITH KNOWN RISKS**
- 22/22 routes render clean, 6/6 mobile no horiz scroll
- Backend + packages: 0 changes
- Known risks: pre-existing lint debt (13), auth/ConvAI runtime UNKNOWN (Anna tests tomorrow)

## Alistair v2 sprint (2026-02-08, deployment-freeze lifted by founder)

**What shipped this sprint**
- Homepage hero fix: gold italic line *"And reconnect with what matters most."* moved out of the H1 and into its own paragraph below the subtitle so it sits on the dark left column instead of running into the painted face (Founder explicit fix).
- `Alistair.jsx` (`/course-room`) completely rebuilt to match the founder's approved English mockup: solid dark navy sidebar with brass-accent Alistair star monogram, EXPLORE section, sidebar nav (Home/Explore/Read/Experiments/Notes/Library), Alistair quote, painted study scene as the centre hero, "Alistair / Laboratory of Life" headline, "YOUR PATH OF EXPLORATION" 4-card grid, right column with "HOW WE EXPLORE" 4-step panel (NOTICE / INQUIRE / EXPERIMENT / INTEGRATE) + extended Alistair bio "Guide. Explorer. Questioner." + "Let's explore together" CTA + bottom centered italic quote *"Life is not something to be solved, but a mystery to be lived."*
- `alistairLabs.js`: added two new founder-introduced lab entries — `old-stories` (📖) and `body-knows-first` (🫀, with future sub-lab "The Body Language"). All 5 pre-existing labs preserved untouched per explicit founder rule "do NOT change the laboratory data model from 5 to 4 until we explicitly decide which laboratory is being removed". Total = 7 labs in catalogue. Two new exports added: `LAB_ORDER` (all 7) and `HOME_PATH_OF_EXPLORATION` (4 featured slugs shown on the home grid: money-tree, old-stories, body-knows-first, compass).
- `alistair/Lab.jsx` Money Tree visual upgrade: cream wash opacity reduced 0.86→0.58, background blur dropped 3px→0px so the painted arch-window study scene reads crisply. New laboratory crest with concentric rings + accent-key drop-shadow, horizontal hairline dividers around the LABORATORY OF LIFE kicker, bigger H1 (clamp 2.4rem→2.8rem min), stronger Core Question card with solid border + accent shadow. Founder feedback "udused pildid, puudub konkreetika" addressed.
- Pre-existing blocking lint fix: `fetchpriority` → `fetchPriority` (camelCase) in SanctuaryPreview hero `<img>`.

**Founder design law captured**
- Public-facing system language is **English only** (UI, nav, buttons, room content, placeholders, hero text, onboarding, laboratories, articles, gates, notifications, emails to users, error messages shown to users). Estonian is allowed only for: Anna comms, internal audits, technical reports, dev notes, implementation discussions. **Any Estonian in user-facing surface = bug.**
- Every room must function as a 10-second business card: where am I, who guides me, what to expect.
- Same "painted-scene + overlay navigation" principle as Polarstar and Grace must be applied to Alistair and (next) Body Room + Parents' Room.

**Verified routes after this sprint**
- `/` — hero text repositioned, mask face fully visible. PASS.
- `/course-room` — new dark-sidebar v2 design rendering correctly with 4 path cards + how-we-explore + bio. PASS.
- `/course-room/lab/money-tree` — crisp painted background visible, stronger hero hierarchy. PASS.
- `/course-room/laboratories` — all 7 labs (1 OPEN, 6 SOON) listed and clickable. PASS.

## Next actions (P0/P1)

**P0 — Alistair lab pages v2 (founder mockups received)**
Each top-level lab gets a dedicated dark-sidebar v2 detail page matching the mockups the founder sent on 2026-02-08:
- `The Body Knows First` lab page (with right-side feel/breathe/listen/trust/integrate panel, IN THIS LABORATORY WE EXPLORE 5 cards, body check-in, reflection questions, Alistair note, quick actions bar).
- `The Body Language` SUB-PAGE under `/course-room/lab/body-knows-first/body-language` (mirror + body-meridian hero, THE BODY SPEAKS THROUGH 7 items panel, COMMON BODY SIGNALS 6-card grid).
- `Self-Sabotage` lab page (cracked-egg hero, HOW WE EXPLORE right panel, WHAT WE EXPLORE HERE 5 cards, About Alistair bio).
- These require founder to deliver the specific Nano-Banana hero/thumbnail images. Founder said in this sprint message: "kui selle run löpetad lisan veel sulle pildi visaali juurde sarnaste teemadega" — images coming.

**P0 — Body Room (Kaelan) refactor to v2 inbound architecture**
Mirror the Alistair v2 pattern (dark sidebar + painted hero + path cards + how-we-explore + bio + bottom quote). Founder said: "pärast liigume veel 2 tuba korda tegema" — Body Room then Parents' Room.

**P0 — Parents' Room (Sara) refactor to v2 inbound architecture**
Same as Body Room.

**P1 — Pre-existing lint debt cleanup**
Legacy hook warnings in AgeGate.jsx, BodyRoomChat.jsx, CadenceEngine.jsx, KidsRooms.jsx. **DO NOT use `eslint-disable` for `react-hooks/set-state-in-effect`, `react-hooks/purity`, `react-hooks/refs`, `react-hooks/immutability` — these are Emergent-internal rules and adding the disables crashes the build with "Rule not found". Refactor the actual hook dependencies instead.

**P1 — Wire "Recent Notes" / "Recent Discoveries" UI to real user data**
Currently placeholder arrays on Grace and Alistair homepages.

**P2 — Lab data model 5→4 final decision**
Founder rule: "Do NOT change the laboratory data model from 5 to 4 until we explicitly decide which laboratory is being removed or merged." Pending decision on whether `child-parent` + `masks` get merged or removed.

**P2 — USD/EUR currency toggle in header.**

**P3 — Remove Launch Pause Mode once PSP strategy (Gumroad/LemonSqueezy) resolved.**

**Future / Backlog**
- Emergent LLM Key budget top-up (over budget by ~$0.03; daily coloring page generator failed for 1 of 3 age groups on 2026-06-08).
- ConvAI/voice manual smoke test on production (cannot be tested headlessly).
- Real-device mobile visual verification (tooling can't honour 390×844 viewport).

