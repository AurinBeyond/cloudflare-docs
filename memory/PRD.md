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

### Iteration 7 — Real catalogue + media wiring (2026-04-25)
**Bookstore — 6 real titles replacing 4 placeholders:**
| Slug | Audience | Price | LemonSqueezy ID | External preview |
|---|---|---|---|---|
| you-dont-have-to-dance-to-anothers-tune | adult | $35 | PLACEHOLDER_DANCE_TUNE | ebookmaker.ai/...ag5xc |
| the-language-of-angels | adult | $35 | PLACEHOLDER_LANGUAGE_OF_ANGELS | ebookmaker.ai/...osvhn |
| beyond-the-matrix-ii | adult | $35 | PLACEHOLDER_BEYOND_MATRIX_II | ebookmaker.ai/...w5x3tf |
| angels-tales | kids | $25 | PLACEHOLDER_ANGELS_TALES | ebookmaker.ai/angels-tales-... (+ free PDF) |
| engels-friends-2 | kids | $25 | PLACEHOLDER_ENGELS_FRIENDS_2 | ebookmaker.ai/...ugo0pf |
| the-night-angels-embrace | kids | $25 | PLACEHOLDER_NIGHT_ANGELS | ebookmaker.ai/the-night-angels-embrace (+ real cover) |

- New `external_read_url` + `pdf_url` fields on `Book` / `BookCreate` / GitHub-sync payload.
- `angels-tales.pdf` (6.8 MB) shipped at `/assets/books/`.
- `bedtime-angel.png` shipped as cover for *The Night Angels' Embrace*.
- Bookstore card now offers **Preview** (eBookMaker), **Free PDF sample** (when present), and the refund-policy line.

**Library — Soul Gift donation card** (`<SoulGiftCard />` at bottom of `Library.jsx`):
- Hero image `pure-soul-life-card.png` + €1 / €5 / €15 Ko-fi tiers → `ko-fi.com/puresoulife`.

**Kids Universe — real visualisation:**
- Bedtime visual `bedtime-angel.png` replaces the studio placeholder.
- Story-trailer section embeds `book.mp4` (2.7 MB, muted/autoplay/loop + poster fallback for iOS/Safari).

**Staged, not shipped:** the 166 MB "You Are Not Who You Became" 60 s trailer lives in `/app/.media-staging/`. Recommend external hosting before embedding.

**Tests:** Backend 13/13 pass · Frontend testids all verified · iteration_6.json clean.

## Backlog

### Iteration 8 — The Beginning + Social CTAs (2026-04-25)
**The Beginning — 7-step gated guided experience (free for signed-in users):**
- New backend system: `EXPERIENCE_STEPS` (Awareness → Dependency → Fear → Money → Childhood Patterns → Pattern Break → Clarity), `db.experience_progress` collection, endpoints under `/api/experience/the-beginning/{me,start,reflect,reset}`.
- Auth-gated (Emergent Bearer token). Reflection text required (≥ 6 chars) to advance. Soft 8-second pause between steps (psychological pacing).
- Frontend: silent landing at `/the-beginning` (Recognition → Shift → What this is → Balance → Notice → Honest note → Coming Soon → CTA), step view at `/the-beginning/step` (Read → Pause → Read → Done with own-reflections recap and Begin again).
- Hidden "module" language — UX reads as a continuous human experience.
- Optional 1-5 presence picker per step (saved into `reflections[].presence`).
- New nav item `nav-the-beginning` + footer Explore link.

**Social presence:**
- Instagram + Facebook in `<SocialLinks />` (single source of truth in `/components/SocialLinks.jsx`):
  - https://www.instagram.com/pruesoul.life/
  - https://www.facebook.com/groups/4059152880969336/
- Embedded in Footer brand block + new Reach Out "Find us elsewhere" panel.

**Instagram CTA cards:**
- Reusable `<InstagramCTA />` ("Follow us for *Matrix Protocols*") shown:
  - On `/library` next to a hero "The Beginning · Free" card (split 7/5).
  - Above the catalogue on `/bookstore`.

**Tests:** Backend 12/12 pass · Frontend testids all verified · iteration_7.json clean.
- Regression file: `/app/backend/tests/test_iteration7.py`.

### Iteration 9 — Brand layer + Blog + Meditation + Origin (2026-04-25)
**Blog engine** (replaceable from `/blog/*.md` later):
- New backend `BlogPost` model + `SEED_BLOG` (idempotent upsert), `GET /api/blog`, `GET /api/blog/{slug}`.
- Seeded post: **"The Mirror of Our Souls — Why Parenting is the Ultimate Programming"** (Prulesoul). Mirror cover at `/assets/blog/mirror-of-our-souls.png`. Body weaves the parenting/programming + harvest-of-generations material into a single letter ending with "What programs are you running today?".
- New `/blog` index + `/blog/:slug` reader — italic excerpt, share strip top + bottom, prose body, end-of-post CTA bridge into The Beginning, newsletter capture.

**Newsletter capture** (Tier-1 list-building):
- `POST /api/newsletter` with explicit `consent` flag, idempotent on email, `db.newsletter_subscribers`.
- `<NewsletterSignup />` with consent checkbox at end of blog posts.

**The Aurin Philosophy** (`/aurin-philosophy`):
- Matrix vs. Aurin concept · 3 pillars (Mirror Principle · Sponge Effect · Transformation over Information) · Prulesoul Insight quote · CTA bridge.

**The Origin** (`/about` rewrite):
- Stone-portal mirror image hero · 3 narrative blocks · expandable longer preface (loads brand entry) · Founder's Promise quote with sage glow · Guardian invitation buttons · final CTA.

**Meditation lead magnet** (Library):
- `<MeditationPlayer />` — text-script audio-style UI (Play / Pause / Restart, progress bar, 11 lines × 5.5 s ≈ 1 min). Softened "First Light" script (no absolute claims).
- Tier 3 "Premium meditation series — coming soon" block.

**Privacy / consent:**
- Portal `portal-consent-line` paragraph below sign-in: occasional updates, opt-out, reflections private, industry-standard storage.

**Navigation refresh:**
- Top bar: Home · The Beginning · Philosophy · Insights · Bookstore · Library · Origin · Reach Out.
- Footer Explore adds The Beginning / Philosophy / Insights · Blog / The Origin.

**Tests:** Backend 9/9 pass · Frontend 95 % (3 cosmetic LOW notes — share-strip child testids renamed `*-strip-{facebook|instagram|copy}` after report; native HTML5 email validation by design). iteration_9.json clean.
- Regression file: `/app/backend/tests/test_iteration9.py`.

### Iteration 12 — Iteration-11 P0 frontend bug fixes (2026-04-27)
- **`LibraryKidsRead`** — `angels-tales` sample card now renders. RC: a 422 on `/api/content/entries?audience=kids` (entries Audience literal is `kids-universe`, not `kids`) was thrown inside a single `Promise.all`, which discarded the books payload. Fix: split entries + books into independent promises with their own `.catch`, and use `audience='kids-universe'` for entries. `freeBooks` filter still gates on `!!pdf_url`.
- **`PrivateRoom` cabinet-reset** — single-click reset now returns the user to `cabinet-intro`. RC: `window.confirm` was auto-dismissed in tests AND the local `phase` state wasn't reset on success. Fix: removed `window.confirm`, unconditionally clear all local state and `setPhase(PHASES.INTRO)` whether or not `clearCabinet()` succeeds.
- **Tests:** iteration_12 — Backend 16/16 pytest pass, Frontend 100% (both fixes verified end-to-end against live preview with synthetic Mongo session).

### Iteration 14 — Quiet Room: greeting + topic routing · Media readiness (2026-04-27)

**Cabinet refinement (per founder's "Starting Rule" directive):**
- New `CABINET_OPENING_GREETING` ("Hello. It's good to meet you here.\n\nHow can I be of help to you today?") seeded as the first guide message on `/api/cabinet/start` AND on auto-creation in `/api/cabinet/message`.
- Added `path` field to `CabinetSession` model. The first user message is routed via case-insensitive whole-phrase keyword matching into one of:
  - `relationship_attachment`
  - `fear_anxiety`
  - `self_worth`
  - `confusion_identity`
  - `emotion_release`
  - `default`
  Path locks on the session — subsequent guide replies rotate through that lane only.
- Each path has its own curated 5-prompt rotation tuned to the theme. No advice, no diagnosis.
- `/cabinet/me` and `/cabinet/message` `guide_replies` and `show_continuation` now key on **user-message count** (not guide-message count) so the seeded greeting doesn't burn a free reply.
- Crisis detection still wins over routing.
- Frontend `PrivateRoom.beginSession` now fetches the freshly-seeded greeting after `startCabinet()` so the visitor sees the room speak first.

**Media readiness (Light Streaming Mode):**
- `MeditationPlayer.jsx` rewritten — single Play/Pause bound to a hidden `<audio>` element; reads URL from `mediaConfig.firstLightAudioUrl` (env: `REACT_APP_FIRST_LIGHT_AUDIO_URL`). If URL missing, shows the placeholder "*This sound will open soon.*" and disables the button.
- New `components/MediaVideo.jsx` — privacy-respecting external video container (YouTube `youtube-nocookie`, Vimeo `dnt=1`, direct mp4/webm). Lazy-loaded, muted by default, related/branding hidden. Renders nothing when no URL set.
- New `lib/mediaConfig.js` — single source of truth for `firstLightAudioUrl`, `ambientVideoUrl`, `courseVideoUrl`. All optional env-driven.

**Tests:**
- New `/app/backend/tests/test_iteration14.py` → 10/10 PASS (greeting seed, continuation-after-3-user-messages, 6 routing cases, path-lock, crisis override).
- `test_iteration11.py` regression → 16/16 PASS.

### Iteration 13 — Deep Sanctuary language pass (2026-04-27)
**Master Directive:** No public-facing UI text may contain `system`, `protocol`, `interface`, `module`, `agent`, `chatbot`, `structure`. Site stays 100% English. Backend code untouched (only seed strings + a small migration block).

**Frontend rewrites:**
- `Home.jsx` — hero CTA "Begin the protocol" → "Begin gently"; LAYERS card "The Genesis Protocols" → "The Genesis Volumes"; PRINCIPLES "Soul over system" → "Soul before pattern"; kids LAYER "A child does not need a system to be whole" → "…does not need to be fixed to be whole".
- `TheBeginning.jsx` — Honest note: "The old system is deeply rooted" → "The old pull runs deep"; Balance block: "respect structure" → "respect the shape of your life".
- `Learning.jsx` — eyebrow "Structured Modules" → "Quiet readings"; CTA italic "one module at a time" → "one piece at a time"; loading state → "A small breath…"; per-track count `n module(s)` → `n reading(s)`; entry top label "Module · 0X" → "Reading · 0X"; empty state → "Nothing here yet. Soon."
- `Library.jsx` — `kindMeta.protocol.label` "Protocol" → "Reading" (key intact for backend match).
- `About.jsx` — narrative "fear protocols" → "quiet fear loops"; final CTA "7-step protocol is the first practical layer" → "7-day beginning".
- `Bookstore.jsx` — added psychosomatic thread (`bookstore-body-thread`: "Your body usually knows before your mind does…") + no-dead-end closer (`bookstore-closing-note`: "If something here keeps moving in you, you can come back. Nothing here will run out.").
- `UserPortal.jsx` — "Books, protocols, and sessions" → "Books, readings, and quiet sessions".
- `InstagramCTA.jsx` (shared, 5 routes) — heading "Matrix Protocols" → "quiet drops".
- `AiDock.jsx` — info paragraph rewritten to remove "system guide" + "AI" wording.

**Backend seed + migration (server.py):**
- Renamed seeded library entries: `morning-orientation-protocol` title → "Morning Orientation"; `evening-reflection-protocol` → "Evening Reflection"; `genesis-protocols-volume-i/ii` → "The Genesis Volumes — Volume I/II". Slugs preserved.
- Renamed seeded book "The Language of Angels" description ("structured" removed) and "Beyond the Matrix II" description ("patterns and protocols" → "patterns and quiet rhythms"); `tags: ["protocols", …]` → `["patterns", …]`.
- Renamed two `learning` content categories: `foundations` description → "Introductory readings"; `practice` → "Applied readings and exercises".
- Added an idempotent **3b/3c migration block** in `seed_initial_content` that updates the above entries + categories on every restart (the original entry seed only runs when the collection is empty).

**Verification:**
- Live forbidden-word scan over 12 public routes (`/`, `/the-beginning`, `/aurin-philosophy`, `/about`, `/library`, `/library/adults`, `/library/kids`, `/library/kids/read`, `/bookstore`, `/portal`, `/blog`, `/learning`) → **0 hits** for `system | protocol | interface | module | agent | chatbot | structure`.
- Backend pytest `/app/backend/tests/test_iteration11.py` → **16/16 PASS** (regression unchanged).
- Iteration 12 fixes still hold: `/library/kids/read` renders Angels' Tales card; `/private-room` `cabinet-reset` returns to `cabinet-intro`.


- **`LibraryKidsRead`** — `angels-tales` sample card now renders. Root cause: a 422 on `/api/content/entries?audience=kids` (entries Audience literal is `kids-universe`, not `kids`) was thrown inside a single `Promise.all`, which discarded the books payload. Fix: split entries + books into independent promises with their own `.catch`, and use `audience='kids-universe'` for entries. `freeBooks` filter still gates on `!!pdf_url`.
- **`PrivateRoom` cabinet-reset** — single-click reset now correctly returns the user to `cabinet-intro`. Root cause: `window.confirm` was auto-dismissed in tests AND the local `phase` state wasn't reset on success. Fix: removed `window.confirm`, unconditionally clear all local state (messages / showContinuation / threadKey / keepThread / confirms / input / error) and `setPhase(PHASES.INTRO)` whether or not `clearCabinet()` succeeds.
- **Tests:** iteration_12 — Backend 16/16 pytest pass (regression suite unchanged), Frontend 100% (both fixes verified end-to-end against live preview with synthetic Mongo session).

### Iteration 10 — Invisible Architect Protocol (2026-04-25)
**Brand voice tightening — no marketing speak, "portal not website":**
- New **Inner Architect — From Masks to Light** manifest section on `/aurin-philosophy` (`ap-inner-architect`). Three calm paragraphs ending on *"returning to the Source is returning to yourself."*
- New **Privacy as Luxury** card on Philosophy + footer-wide line: *"No social-media pixels. No tracking cookies. No public feed. Your journey through this work stays yours — that is part of the design."* Testids: `ap-privacy-as-luxury`, `footer-privacy-luxury`.
- **Word-of-mouth share** at the end of The Beginning (Done panel): `tb-share-coordinates` — *"If this shift was real for you, share the coordinates with one person you trust."* Includes a single "Copy the coordinates" button (clipboard) showing `tb-share-coordinates-copy`. No urgency, no marketing copy.
- **Bookstore framing line** above the catalogue (`bookstore-core-library-line`): *"To integrate this frequency deeper, explore the Core Library — slow-written books for adults, calm storybooks for children. No urgency. Read in the order that feels true."* Replaces salesy framing.

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
