# Matrix Aurin — PRD

## Original Problem Statement
Build a structured digital environment called Matrix Aurin. Multi-page,
calm, premium. Phase 2: prepare for a GitHub-based knowledge source +
future AI companion. No payments / AI / auth wired yet — only the
receiving architecture.

## User Direction (key constraints)
- Unified dark-elegant + nature-inspired visual system. Serif headlines
  + sans body. Slow, structured, intentional.
- Library = free hub; Bookstore = paid digital products (ready for
  Norwegian 0% VAT digital book rate).
- AI companion ("The Guardian") prepared, not built.
- GitHub treated as a flexible, evolving source of truth — the platform
  must interpret and stabilise content, not blindly render it.
- Admin surfaces stay minimal; no SaaS-style dashboards.

## Architecture
- **Frontend**: React 19 + React Router 7 + Tailwind + shadcn/ui.
  Fonts: Fraunces (serif headlines) + Instrument Sans + Instrument
  Serif italic.
- **Backend**: FastAPI + MongoDB (Motor). Markdown pipeline uses a
  resilient `parse_markdown_safe()` (in `content_normalizer.py`) that
  never raises.
- **Routing**:
  - `/` Home · `/bookstore` · `/bookstore/:slug` · `/library` ·
    `/library/:slug` · `/learning` · `/kids-universe` ·
    `/meditation-corner` · `/reach-out` · `/portal` ·
    `/admin/content`
- **Primary nav**: Home · Bookstore · Library · Meditations · Reach Out.
  Other routes reachable via Footer + direct URL.

## Content Model
- `Category(slug, name, surface, source_path, …)`
- `ContentEntry(slug, title, category_slug, audience, surface, kind,
  access, markdown, html, sections, frontmatter, validation_warnings,
  source, source_path)`
- `Book(slug, title, subtitle, price, currency=NOK, tax_category,
  delivery_options, lemonsqueezy_product_id, pdf_url, html, sections,
  validation_warnings, source_path)`

## Implemented to date
### Iteration 1 (MVP shell)
- 5-page shell with shared nav + footer; design system in `index.css`.

### Iteration 2 (Phase 2 — content layer)
- Backend `/api/content/categories|entries`, markdown parsing into
  H2/H3 sections, GitHub sync STUB, AI chat STUB, AI context endpoint.
- Frontend Library refactored to API; Library entry detail page;
  Learning page; Admin-light page; AiDock placeholder.
- Seed: 5 categories + 8 entries across library/learning surfaces.

### Iteration 3 (Phase 2 — point 7 + Master Plan structure)
- **Resilient markdown pipeline** (`content_normalizer.py`): handles
  empty body, missing headings, orphan H4/H5, level jumps, H1
  demotion, zero-width chars, BOM, excessive blanks, frontmatter
  failures. Always returns safe HTML, sections list, and
  `validation_warnings`. Never raises.
- **`POST /api/content/validate`** dry-run endpoint for admin/internal
  use — same pipeline, no save.
- **`GET /api/content/admin/entries`** admin overview with
  `only_with_warnings` filter.
- **Bookstore**: separate `Book` model + `/api/books` endpoints.
  3 seed books (NOK pricing, `tax_category=book_zero_rate_ready`,
  delivery: read_online + download_pdf).
- **Bookstore + BookDetail** pages with distraction-free reading view.
  "Buy access" + "Download PDF" intentionally disabled.
- **Reach Out** page (calm, no backend submission yet).
- **Library**: filter tabs now by audience (All, Grown-ups, Kids
  Universe, Reflections). Migration ran on existing entries.
- **Navigation reorganised** to Home · Bookstore · Library · Meditations
  · Reach Out. Kids Universe / Learning / User Portal moved to footer
  but routes preserved.
- **AiDock** rebranded to **"The Guardian"**.
- **Admin /admin/content**: validate dry-run section + synced-files
  list with All / With-warnings filter (read-only).
- Full e2e tests passing (backend 26/26; frontend Bookstore, BookDetail,
  Reach Out, Library audience tabs, validate UI, admin list).

## Backlog
### P0 — awaits user input
- Decide repo structure + folder convention for live GitHub sync
  (suggested: `bookstore/`, `library/grown-ups/`, `library/kids-universe/`,
  `library/reflections/`, `_system/tone.md`, `_system/rules.md`).
- Decide auth provider (Emergent Google Auth vs custom JWT).

### P1
- Wire real GitHub sync (Contents API or shallow clone) to existing
  STUB endpoint. Add HMAC-verified webhook for push events.
- Wire LemonSqueezy for the Bookstore "Buy access" buttons.
- Object storage for cover images + PDFs (the `pdf_url` and
  `cover_image_url` fields are already prepared).
- Reach Out form → real backend submission + email notification.

### P2
- The Guardian: connect to LLM with RAG over the content layer and
  `_system/tone.md` as the tone contract.
- Member-area inside the Portal once auth is live.
- Admin: bulk re-validate + GitHub diff preview.

## Notes for fork agents
- `MONGO_URL` + `DB_NAME` in `backend/.env`. `REACT_APP_BACKEND_URL`
  in `frontend/.env`. Never hardcode.
- Markdown is parsed by `content_normalizer.parse_markdown_safe()` —
  this is the single point of contact for every entry and every
  future GitHub-ingested file.
- Validation warnings are **internal only** — they appear on
  `/admin/content` and on the LibraryEntry warnings panel, never to
  regular users.
- Books pricing displays as Intl `currency: NOK`. Tax category
  `book_zero_rate_ready` flags the entry as eligible for 0% VAT under
  the Norwegian digital book rate; the actual rate is the payment
  provider's responsibility.
