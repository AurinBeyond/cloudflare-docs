# PRD — Aurin Hub / Matrix Aurin / Polarstar Kids (Sanctuary v3.0)

## Brand philosophy
- "Screen-Down, Ears-Open"
- Strictly anti-wellness — no coach / therapy / guru tone
- 100% English UI; conversations with founder are in Estonian

## Architecture
- React frontend (`/app/frontend`)
- FastAPI backend (`/app/backend`)
- MongoDB
- Supervisor-managed services

## Three rooms — production state (2026-06-16, first public deploy)

### ALISTAIR (`/course-room`)
- 11 laboratories, 6+5 painted card grid
- Hero `SCENIC_BG`: founder-approved clean upload `7cqdspok_image.png`
- Hub status badges:
  - Money Tree = **OPEN NOW** (green pill)
  - Other 10 = **PREVIEW** (brass pill)
- Inside each lab dashboard (painted hotspots):
  - Authored topics = clickable
  - Unwritten topics = dimmed + "SOON" badge + cursor:not-allowed + tooltip "Coming Soon — this field study is being written."
- Total authored topics: 36 (Money Tree) + 3 each × 10 = 66

### GRACE (`/grace` light home + `/grace/room` dark Hearth)
- Hero H1: "You stopped performing. That's why you're here." (Tony Robbins × human register, anti-wellness)
- Sidebar sub-pages (Speak, Write, Evening, Messages, Library) — all authored
- Library: 5 full articles, 3 sections (Understanding Yourself, Relationships, Moving Forward)
- Prompt-piping `/grace/write → /grace/room?write=...` auto-opens Write panel + pre-fills textarea
- ConvAI mounted at `/grace/room` PHASES.CHAT (gated behind sign-in)

### BODY WORLD (`/body-world` + `/body-world/world/:slug`)
- 14-stone LOCK navigation
- Hub painted asset legacy 15th stone "Body Attention" masked with dark patch
- Hub painted "15 worlds." caption masked + replaced with React "14 worlds. All connected."
- Stone N pages: "Stone N of 14" overlay masks painted "OF 15" typo
- Sub-stones with `legacy*` content = clickable + LOCK name overlay
- Sub-stones without content = dimmed + "SOON" badge + non-clickable

## Sara Room — Painted Worlds (in active development, 2026-06-17/18)

### Identity (locked)
- **Sara = The Quiet Heart of the Family** — Amae-style safe centre, not a lens menu
- Aurin = "The Places We Return To" / lighthouse-compass-northstar metaphor
- Each room = one compass:
  - Grace → return to yourself
  - Kaelen → return to your body
  - Sara → return to one another
  - Alistair → return to clarity
  - Polarstar → return to wonder · protects childhood itself
- **Constitutional rule §1:** Rooms may be CONNECTED, never MIXED
- Each room guards one question. Sara's question: *"What's going on between us?"*
- Lenses (Ikuji, Montessori, Scandinavian, French Cadre, Reggio, Waldorf, Positive Coding) live BACKEND-ONLY — never exposed as UI menu

### Architecture — Painted Map pattern (same as BodyWorld)
- `/parents-room` → SaraHub (painted hub, 14 vine-leaves + central nest = 15 themes)
- `/parents-room/category/<slug>` → painted Sara World OR poetic SaraCategoryStub
- `/parents-room/category/<slug>/<sub>` → sub-theme stub (until founder visuals arrive)
- `/parents-room/v1` → legacy ParentsRoom (chat + 8 situations + ConvAI Sara, preserved)
- `?debug=1` on any painted page = founder calibration mode (visible hotspots)

### Painted Worlds — progress
- ✅ **Hub** (`SaraHub.jsx`) — asset `36vfb47d_...21_25_41.png`, 14 leaves calibrated
- ✅ **World 1 · My Child** (`SaraMyChild.jsx`) — asset `rijfgst3_image.png`, 6 nests
- ✅ **World 2 · Emotions & Safety** (`SaraEmotionsSafety.jsx`) — asset `pbiwwti2_...09_36_24.png`, 6 nests
- ✅ **World 3 · Our Family** (`SaraOurFamily.jsx`) — asset `pzbbdk2p_image.png`, 6 nests
- ✅ **World 4 · Boundaries & Responsibility** (`SaraBoundariesResponsibility.jsx`) — asset `iis5gc3n_image.png`, 6 nests calibrated first try (boundaries · responsibility · choices-consequences · respect · consistency · freedom-within-structure)
- ✅ **World 5 · Growth & Development** (`SaraGrowthDevelopment.jsx`) — asset `fub9m0yw_image.png`, 6 nests calibrated first try (development-stages · learning-through-experience · confidence-resilience · curiosity-discovery · mistakes-growth · becoming-yourself)
- ✅ **World 6 · Relationships & Cooperation** (`SaraRelationshipsCooperation.jsx`) — asset `b4uvi3j7_image.png`, 6 nests calibrated first try (communication · cooperation · friendship · understanding-differences · empathy-kindness · solving-conflicts-together)
- ✅ **World 7 · Challenging Situations** (`SaraChallengingSituations.jsx`) — asset `qw6okgoh_image.png`, 6 nests calibrated first try, FIRST world to include small icon plaques per nest (🏠 ❓ 💔 🌱 ⚡ ☀️) — pattern recommended for all future worlds
- ✅ **World 8 · Wisdom Garden** (`SaraWisdomGarden.jsx`) — asset `cmyiq27h_image.png`, 6 nests calibrated first try (different-ways-of-seeing · stories-that-teach · family-wisdom · questions-worth-asking · reflection-awareness · everyday-philosophy) — mother + daughter at the centre, grandparents present in the nests
- ✅ **World 9 · Weekly Digest** (`SaraWeeklyDigest.jsx`) — asset `xj4ylrpo_image.png`, 6 nests calibrated first try (this-weeks-reflection · small-moments-that-matter · family-conversations · challenges-lessons · gratitude-joy · looking-ahead) — **father + daughter** at the journal (first non-mother centrepiece)
- ✅ **World 10 · Stories from Real Life** (`SaraStoriesRealLife.jsx`) — asset `uzdnty7e_image.png`, 6 nests calibrated first try (family-stories · turning-points · lessons-learned · voices-across-generations · courage-hope · small-moments-big-meaning) — multi-cast: every nest carries a different family configuration; the centre is a great open book unfolding into scenes of real family life. **Bridge between Wisdom Garden and lived experience.**
- ⏳ Remaining 4 worlds (founder generates with GPT, agent places ~5 min each):
  11. Tools & Exercises
  13. Parenting Journey
  14. Generations & Heritage
  15. Home, Memories & Roots

### §SARA-CAST-VARIETY 2026-06-18 — Cast variation rule (founder)
- **Rule:** Across the Sara worlds, deliberately vary the central figures so the cast mirrors real family life. Do NOT default to mother+child in every world.
- **Rotation pool:**
  - mother + child
  - father + child
  - both parents
  - grandparent + child
  - siblings
  - step-parents
  - single parent
  - multi-generational household
- **Encoded in code** at the top of every Sara World file (`§SARA-CAST-VARIETY` block in World 9, to be carried forward into Worlds 10-15 prompt generation).
- **Current cast roster:**
  - World 1 My Child — single child
  - World 3 Our Family — full family
  - World 6 Relationships & Cooperation — children together
  - World 7 Challenging Situations — mother + child after rain
  - World 8 Wisdom Garden — mother + daughter (grandparents in nests)
  - World 9 Weekly Digest — **father + daughter**
  - World 10 Stories from Real Life — **multi-cast** (every nest a different configuration)
- **Founder hint for Worlds 11, 13-15:** prioritise grandparent+child, siblings, single parent, multi-generational angles to balance the roster.

### Deferred architectural candidate — "Every Child Is Our Child" (2026-06-18)
- **Status:** Saved idea, decision deferred to the very end of Sara construction
- **Origin:** Emerged during World 3 (Our Family) calibration when founder + GPT + agent considered replacing "Daily Life" zone. All three agreed: replacement is wrong (Daily Life is the most-used handle in real parenting), but the idea is too strong to discard.
- **What it is:** A philosophical handle for the child's life *outside the four walls of the home* — community, neighbours, school, role models, what adults show children, shared responsibility, what we leave behind.
- **Proposed nests (if it becomes a world):**
  - 🪺 The Village Around the Child
  - 🪺 Community & Belonging
  - 🪺 Generations of Care
  - 🪺 Role Models
  - 🪺 Shared Responsibility
  - 🪺 What We Leave Behind
- **Three open possibilities — DO NOT decide yet:**
  1. 16th standalone Sara world (requires new hub painted asset with 16th leaf)
  2. Central spine of existing **World 12 · School, Friends & the World**
  3. Cross-room philosophical thread (painted motto in multiple worlds, no dedicated nest)
- **Decision trigger:** Revisit AFTER all 14 painted Sara worlds are complete. (Hub v2 dropped the original "School, Friends & the World" leaf — numerals jump 11 → 13 — so there is no current World 12. The natural test will become: with all 14 worlds painted, does "Every Child Is Our Child" still feel orphaned? If yes → 16th standalone world OR re-introduce hub leaf #12 as its dedicated home. If no → cross-room motto, no dedicated nest.)
- **Rule until then:** Do NOT carve a hub slot. Do NOT place it under Generations & Heritage. Do NOT remove this PRD entry. Keep all 15 existing worlds + 6 nests in each untouched.

### Backend lenses (`parents_lenses.py`) — partial
- ✅ shitsuke renamed → "Japanese Ikuji" (Shitsuke + Itadakimasu + Amae + Ganbaru + Omoiyari + Soji)
- ✅ Header docstring updated to 7-lens registry with visible/hidden flag concept
- ⏳ 4 new hidden lenses NOT YET ADDED (Scandinavian, French Cadre, Reggio Emilia, Waldorf) — founder paused this work to focus on visuals first

## 3rd-party integrations
- Gumroad & LemonSqueezy (payments) — founder-supplied keys
- Gemini Nano Banana (image generation) — Emergent LLM Key
- ElevenLabs ConvAI (voice) — founder-supplied key, Creator tier 158,500 chars/month

## Deployment readiness
- Static analysis: PASS (deployment_agent, 2026-06-16)
- CORS: prulesoul.site, www.prulesoul.site, aurin-hub.preview.emergentagent.com
- No hardcoded secrets
- All env-driven (REACT_APP_BACKEND_URL, MONGO_URL, DB_NAME)

## P0/P1/P2 backlog (post-deploy)
- P1: Authored content expansion for the 10 preview labs (target 8-12 topics each)
- P1: New painted hub asset for Body World (14 stones, no "15 worlds" caption, no eye-icon 15th stone)
- P1: New painted Stone 5 + Stone 6 assets (no "OF 15" typo, no "WISOM" typo)
- P2: Sara Room (Parents Room) refactor to RoomShell + Painted Map pattern
- P2: USD/EUR currency toggle in header
- P2: Connect "Recent Notes" placeholder UI to user DB/state
- P3: Remove "Launch Pause Mode" once PSP strategy resolved
- Post-Lock: Luule Viilma Knowledge Layer (alt-wisdom lens across Body World)
- Tech debt: Lint cleanup in AgeGate.jsx, CadenceEngine.jsx, BodyRoomChat.jsx, KidsRooms.jsx
