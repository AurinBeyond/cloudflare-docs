# Matrix Aurin / prulesoul.site — System Architecture

> A structured digital environment where GitHub is the source of truth,
> the platform is the calm, stable interpretation layer, and access is
> governed by clear, lightweight rules.

---

## 1. Layers

```
┌────────────────────────────────────────────────────────────┐
│                         GITHUB                             │
│     /brand   /legal   /library   /bookstore                │
│     /kids    /learning   /meditations                      │
└────────────────────────────────────────────────────────────┘
                          │
                          ▼  (raw markdown + frontmatter)
┌────────────────────────────────────────────────────────────┐
│              CONTENT NORMALIZER (server side)              │
│  - parse_markdown_safe() — never raises                    │
│  - heading hygiene · BOM strip · frontmatter parse         │
│  - validation_warnings (internal only)                     │
└────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌────────────────────────────────────────────────────────────┐
│           STORAGE — MongoDB (Motor / async)                │
│  content_categories · content_entries · books             │
│  users · user_sessions                                     │
└────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌────────────────────────────────────────────────────────────┐
│                    REST API — FastAPI                      │
│  /api/content/*    /api/books/*    /api/auth/*             │
│  /api/content/sync/github     /api/content/validate        │
│  /api/content/admin/entries   /api/ai/*                    │
└────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌────────────────────────────────────────────────────────────┐
│         PRESENTATION — React (prulesoul.site)              │
│  Home · Bookstore · Library · Meditations · Reach Out      │
│  About · Legal · Kids Universe · Learning · Portal         │
└────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌────────────────────────────────────────────────────────────┐
│                  ACCESS CONTROL                            │
│  18+ gate → /learning · /meditations  (client-side modal)  │
│  Auth gate → /portal (Emergent Google Auth, session cookie)│
│  Open      → /  /library  /bookstore  /kids-universe       │
│            /reach-out  /about  /legal                      │
└────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌────────────────────────────────────────────────────────────┐
│                  GUIDANCE LAYER (placeholder)              │
│   "The Guardian" — bottom-left dock. Returns honest        │
│   "not yet active" until the AI layer is wired.            │
└────────────────────────────────────────────────────────────┘
```

---

## 2. GitHub mapping

| Repo folder    | Surface in DB | Visible at        |
|----------------|---------------|-------------------|
| `/brand`       | `brand`       | Home, About       |
| `/legal`       | `legal`       | /legal            |
| `/library`     | `library`     | /library          |
| `/bookstore`   | (books coll.) | /bookstore        |
| `/kids`        | `kids`        | /kids-universe    |
| `/learning`    | `learning`    | /learning (18+)   |
| `/meditations` | `meditations` | /meditation-corner (18+) |

Conventions:
- Folder names in the repo become `category_slug` values.
- File names (without `.md`) become entry `slug`.
- Frontmatter overrides derived defaults:
  ```yaml
  ---
  title: <string>
  description: <string>
  access: free | member
  audience: grown-ups | kids-universe | reflections
  tags: [string]
  ---
  ```

---

## 3. Content normalizer (resilience)

`backend/content_normalizer.py` — single point of contact for every
markdown source (manual create, GitHub sync, dry-run validate).

Guarantees:
- Never raises on bad input
- Strips zero-width / BOM characters
- Demotes stray H1, promotes orphan H4+ subheadings
- Detects heading-level jumps
- Empty body → safe empty-state card
- No headings → wraps in default "Overview" section
- Hard parser failure → escaped `<pre>` block + warning
- Returns `validation_warnings: string[]` (internal only)

---

## 4. Access control

### 4.1 18+ gate
- Pure client-side modal stored in `localStorage`
- Active on `/learning` and `/meditation-corner`
- `/kids-universe` is explicitly NOT gated
- Reset via "Forget my confirmation" button on the portal

### 4.2 Authentication
- Provider: **Emergent Google Auth** (`auth.emergentagent.com`)
- Flow:
  1. User clicks "Sign in with Google" on `/portal`
  2. Redirected to `auth.emergentagent.com` with `redirect=window.location.origin/portal`
  3. Returns to `/portal#session_id=<token>`
  4. Frontend `<AppRouter />` detects fragment, mounts `<AuthCallback />`
  5. `AuthCallback` POSTs `session_id` to `/api/auth/session`
  6. Backend exchanges with Emergent, stores session in Mongo, sets `session_token` cookie (`httpOnly, secure, samesite=none, 7d`)
- Read current user: `GET /api/auth/me` (cookie or Bearer token)
- Logout: `POST /api/auth/logout`

### 4.3 Roles (prepared, not enforced)
- `guest` — open content
- `member` — paid books + member-only library entries
- `admin` — content management

---

## 5. Bookstore (sales-ready, not yet active)

- Separate `books` collection (not entries) — paid products are different from free content.
- Each book has:
  - `price`, `currency` (default `NOK`)
  - `tax_category: book_zero_rate_ready` — Norway 0% VAT digital book rate signal
  - `delivery_options: [read_online, download_pdf]`
  - `lemonsqueezy_product_id` (placeholder until activation)
  - `pdf_url`, `cover_image_url` (placeholder; ready for object storage)
- "Buy Access" button is intentionally disabled until LemonSqueezy is wired.

---

## 6. AI / Guardian layer (placeholder)

- `POST /api/ai/chat` returns `not_active` honestly
- `GET /api/ai/context/{slug}` returns the structured payload a future
  Retrieval-Augmented assistant will use:
  - tone reference (will be sourced from `/brand/tone.md`)
  - sections of the entry
  - markdown body
- Frontend: `<AiDock />` (label "The Guardian") — bottom-left, never
  interrupts.

---

## 7. Environments

```env
# Backend (.env)
MONGO_URL=...                # supplied by environment
DB_NAME=...                  # supplied by environment
CORS_ORIGINS=*
GITHUB_REPO=                 # e.g. "owner/prulesoul-content" — empty = inactive
GITHUB_BRANCH=main
PUBLIC_SITE_URL=https://prulesoul.site
REACH_OUT_EMAIL=             # destination address for contact form (placeholder if blank)

# Frontend (.env)
REACT_APP_BACKEND_URL=...
```

---

## 8. Production checklist

- [ ] Connect domain `prulesoul.site` (DNS at registrar — see deploy notes)
- [ ] Set `GITHUB_REPO` env on the backend service
- [ ] Replace placeholder `lemonsqueezy_product_id`s with real ones
- [ ] Wire object storage for `cover_image_url` and `pdf_url`
- [ ] Set `REACH_OUT_EMAIL` env + connect a transactional email provider
- [ ] Activate the AI layer (Emergent LLM key + RAG over content)
