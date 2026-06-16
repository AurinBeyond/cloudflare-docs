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
- Hero H1: "You stopped performing. That's why you're here." (Tony Robbins × Sanctuary register)
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

## Sara Room — next iteration
Deferred per founder directive after current three rooms locked.

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
