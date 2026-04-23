# Matrix Aurin — PRD

## Original Problem Statement
Build a full-stack multi-page platform called "Matrix Aurin".
Start simple. Build only the core structure first. Do NOT add payments,
AI, or admin dashboards yet.

Pages (exact names): Home, Library, Kids Universe, Meditation Corner, User Portal.
Each page: clear structure, purpose-driven sections, minimal and calm, not
over-designed. Prepare architecture for digital content, user access,
future expansion. Design: modern, calm, premium, not overloaded.

Wait for next instruction after structure is ready.

## User's Design Direction (verbatim)
- Unified visual system: dark, elegant, calm, premium. Serif headlines +
  sans body. High contrast for readability. Strong hierarchy.
- Page-specific tone: Home (strong first impression, clear direction),
  Library (organised, browseable), Kids Universe (softer, slightly playful,
  still controlled), Meditation Corner (quiet, spacious), User Portal
  (simple placeholder: Sign In / Register buttons + light structural
  preview of My Content / My Progress / Account — NO real dashboard).
- Future-ready architecture: space reserved for an AI assistant layer.
  System may later connect to external data sources (e.g., GitHub-based
  content).

## Architecture
- **Frontend**: React 19 + React Router 7 + Tailwind + shadcn/ui
  components library. Fraunces (serif) + Instrument Sans + Instrument
  Serif (italic accents). Dark-first design tokens in index.css.
- **Backend**: FastAPI + MongoDB (Motor). Stock `/api/` root and
  `/api/status` endpoints retained; no domain endpoints built yet per
  user instruction.
- **Routing**:
  - `/` → Home
  - `/library` → Library
  - `/kids-universe` → Kids Universe
  - `/meditation-corner` → Meditation Corner
  - `/portal` → User Portal

## Files Implemented (2026-02)
- `frontend/src/App.js` — router wiring with `Layout` + 5 pages
- `frontend/src/components/layout/Layout.jsx` — Navigation + Outlet + Footer
- `frontend/src/components/layout/Navigation.jsx` — sticky nav, desktop + mobile
- `frontend/src/components/layout/Footer.jsx` — branded footer, Explore/Account
- `frontend/src/components/layout/PageHeader.jsx` — shared page header
- `frontend/src/pages/Home.jsx` — hero, 4 system layers, 3 principles, AI-future note
- `frontend/src/pages/Library.jsx` — search + 5 filters + 8 sample items w/ Free/Member access
- `frontend/src/pages/KidsUniverse.jsx` — 3 age worlds + 3 parent notes
- `frontend/src/pages/MeditationCorner.jsx` — breathing orb + 4 sessions + closing note
- `frontend/src/pages/UserPortal.jsx` — disabled Sign In/Register + 3 preview blocks
- `frontend/src/index.css` — design tokens + component utilities (.aurin-*)
- `frontend/public/index.html` — font imports (Fraunces / Instrument Sans / Instrument Serif)

## Core Requirements (static)
- Multi-page structured platform, unified visual system, no payments /
  AI / admin dashboard yet, minimal & calm tone, future-ready for AI and
  external content sources.

## What's Been Implemented (2026-02)
- [x] Multi-page routing with 5 routes
- [x] Shared Navigation (desktop + mobile hamburger) and Footer
- [x] Design system: dark elegant + nature-inspired palette, serif+sans
      typography, unified tokens in index.css
- [x] Page-specific tonal variation kept within one system
- [x] User Portal as non-functional placeholder with structural preview
- [x] Library with Free vs Member access badges on each item
- [x] Meditation breathing animation
- [x] Future AI-layer placeholder section on Home
- [x] 100% frontend smoke tests passing (iteration 1)

## Backlog (Next Phases)
### P0 — waits for user instruction
- Decide content model for Library (MongoDB collection shape for
  books/protocols/audio/video).
- Decide auth approach (Emergent Google Auth vs custom JWT) before
  User Portal goes live.

### P1 — likely next
- Real item detail pages (Library → /library/:id).
- Kids Universe per-world landing pages (/kids-universe/:slug).
- Meditation session player (audio streaming).
- Content seeded via backend → swap hardcoded arrays for API calls.

### P2 — later
- LemonSqueezy (or Stripe) for paid access to Member items.
- AI companion (guided chat assistant) in the reserved future-layer slot.
- Admin dashboard for content management.
- Connect to external content source (e.g., GitHub-based Markdown).

## Notes
- Backend currently unchanged (stock `status_checks` endpoints). No new
  models were added yet — kept minimal per the instruction to wait.
- No hardcoded env values; MONGO_URL, DB_NAME, REACT_APP_BACKEND_URL
  all sourced from `.env`.
