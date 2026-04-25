# Matrix Aurin / prulesoul.site — PRD

## Original Problem Statement
A structured digital environment ("Matrix Aurin") published at
prulesoul.site. GitHub is the source of truth for content. Calm,
premium, slow tone. Multi-page. Free Library + paid Bookstore + Kids
Universe + Learning + Meditations + Reach Out + About + Legal + Portal.

## Architecture (see SYSTEM_ARCHITECTURE.md)
GitHub → Content Normalizer → Mongo → FastAPI → React (prulesoul.site)
Access control: 18+ gate · Emergent Google Auth.
Guidance layer: "The Guardian" placeholder dock.

## Implemented to date

### Iteration 1 — MVP shell
5-page shell with shared nav + footer. Dark elegant + nature-inspired
design system. Fraunces serif + Instrument Sans body.

### Iteration 2 — content layer
Content endpoints, markdown sections, AI / GitHub sync STUBs. Library
refactored to API; entry detail; Learning; Admin-light; AiDock.

### Iteration 3 — content reliability + Master Plan structure
`parse_markdown_safe` (never raises); `/api/content/validate`;
`/api/content/admin/entries`; Bookstore + BookDetail + ReachOut;
audience filter; nav reorganised; AiDock → "The Guardian".

### Iteration 4 — prulesoul.site live MVP
Real GitHub sync (env-driven); Emergent Google Auth (Bearer-token);
About + Legal page wiring; 18+ gate (Kids Universe never gated);
Kids age groups + Coloring Studio placeholder; Reach Out → backend;
prulesoul.site branding; SYSTEM_ARCHITECTURE.md.

### Iteration 5 — Content & Security Phase (this iteration)
**Bookstore (real catalogue):**
- 4 books seeded with USD pricing + LemonSqueezy product-ID
  placeholders:
  - Genesis Protocol Vol I — $35 (adult)
  - Genesis Protocol Vol II — $35 (adult)
  - Star Whispers — $25 (kids)
  - Meditation Pack Vol I — $35 (adult)
- New `audience` field on Book model (`adult` | `kids`).
- `/bookstore` page filters by audience tabs (All · Adult · Kids).
- `tax_category: book_zero_rate_ready` retained on every book.
- LemonSqueezy IDs prefixed `PLACEHOLDER_` until activation.

**Legal foundation (seed text, replaceable from GitHub):**
- 4 legal entries seeded into the `legal` surface:
  - Terms of Service · 8 H2 sections
  - User Responsibility · 5 H2 sections
  - Refund Policy · 4 H2 sections
  - Acceptable Use & Community · 4 H2 sections
- Each entry prefixed with a clearly-marked "starter draft — replace
  with attorney-reviewed text before payments" notice.
- Replaced automatically once `/legal/*.md` lands in the connected
  GitHub repo.

**Kids Universe (renamed + interactive placeholder):**
- Age groups renamed to Little Dreamers (3–5), Explorers (6–8),
  Future Builders (9–12).
- Coloring Studio rebranded to "Aurin Kids · Imagine & Color" with
  4 theme buttons (Nature, Animals, Space, Stories) — placeholder UI,
  no AI logic yet.

**Secure Access Gate (strengthened):**
- 18+ modal on `/learning` and `/meditation-corner` only.
- Modal now offers a "Visit Kids Universe" alternative button (no
  18+ flag set when chosen).
- `/kids-universe` remains entirely open.

**Tests:**
- Backend 12/12 pass · Frontend 30/30 pass · 0 issues.
- New permanent regression suite at
  `/app/backend/tests/test_iter4_books_legal.py`.

### Iteration 6 — Real assets + author preface (this iteration · 2026-04-25)
**Brand identity wired:**
- `prulesoul-logo.png` rendered in `Navigation.jsx` and `Footer.jsx`.
  Two-line lock-up: "prulesoul" + "MATRIX · *Aurin*" eyebrow.
- `aurinbeyond-hero.png` archived under `/assets/brand/` for future
  hero/welcome use.

**About page — author's personal preface (`/brand` surface):**
- New `SEED_BRAND` list in `server.py` with idempotent upsert in
  `seed_initial_content()` (step 6 — replaceable by `/brand/about.md`
  from GitHub).
- Entry `about-the-author` carries the user's exact life-story text.
- `About.jsx` now selects the entry by slug (with first-entry fallback).

**Kids Universe — Coloring Studio (gallery rewrite):**
- `KidsColoringStudio.jsx` replaces the prompt-form placeholder with a
  real gallery driven by an in-file `COLORING_PAGES` array (mirrors the
  requested markdown frontmatter: `type/age_group/tags/download_url`).
- First live page: `aurin-kids-cover.png` on a **pure-white card**.
- Per card: age chip, tag chips, **Download to Print** (real PNG link)
  and **Print now** (opens print dialog).
- Age-group filter (All · 3-5 · 6-8 · 9-12) with empty-state.

**Bookstore — refund acknowledgment:**
- `bookstore-item-${slug}-refund-notice` paragraph under every Buy-access
  row links to `/legal#refund-policy`. Closes the audit's compliance gap.

**Tests:**
- Backend 6/6 pass · Frontend 5/5 pass (iteration_5.json).
- Regression file: `/app/backend/tests/test_iteration5.py`.


| Item | Status |
|---|---|
| Multi-page structure | Done |
| Dark-elegant design system | Done |
| Real GitHub sync architecture | Done · awaiting `GITHUB_REPO` env |
| Content normalizer | Done |
| Bookstore catalogue | Done · 4 books, USD pricing, placeholder LemonSqueezy IDs |
| Library (free) | Done |
| About / Legal pages | Wired · seeded starter Legal text · awaiting GitHub /brand |
| Kids Universe + age groups + studio | Done |
| 18+ gate (with Kids alternative) | Done |
| Auth | Done (Emergent Google) |
| Reach Out | Done · awaiting `REACH_OUT_EMAIL` |
| AI Guardian | Placeholder by design |
| prulesoul.site branding | Done · DNS at registrar required |

## Backlog
### P1
- Set `GITHUB_REPO` and run first sync of /brand /legal /library
  /bookstore /kids /learning /meditations
- Replace `PLACEHOLDER_*` LemonSqueezy IDs with real ones → Buy Access activates
- Object storage for cover images + PDFs
- `REACH_OUT_EMAIL` + transactional provider (SendGrid/Resend)
- Lawyer-reviewed final Legal text (replace seed)

### P2
- Real RAG over content for The Guardian (Emergent LLM key)
- Member-area inside Portal once a paid book ships
- Real Aurin Kids generator (separate, safety-vetted pipeline)
- Admin: bulk re-validate, sync history, GitHub diff preview

## Notes for fork agents
- Auth = Bearer token in `localStorage.aurin_session_token`
- Markdown = `content_normalizer.parse_markdown_safe` (single source of truth)
- Internal validation warnings shown only on `/admin/content` and
  the entry warnings panel
- 18+ gate uses `localStorage.aurin_age_confirmed_v1`
- Books carry `audience: adult|kids`. Filter UI live at /bookstore
- Legal entries are seeded; SEED_LEGAL only runs when surface=legal
  count is zero (intentional — re-seed by deleting the entries)
- Server.py is large (~1400 lines); flagged for future router splitting
