# Matrix Aurin / prulesoul.site — PRD

## Original Problem Statement
Build a structured digital environment ("Matrix Aurin") published at
prulesoul.site. Source of truth lives in a GitHub repository. Calm,
premium, slow tone. Multi-page. Free Library + paid Bookstore + Kids
Universe + Learning + Meditations + Reach Out + About + Legal + Portal.

## Architecture (see SYSTEM_ARCHITECTURE.md)
```
GITHUB → CONTENT NORMALIZER → MONGO → FASTAPI → REACT (prulesoul.site)
                                               ↑
                          ACCESS CONTROL: 18+ gate · Emergent Google Auth
                                               ↑
                          GUIDANCE: "The Guardian" placeholder dock
```

## Implemented to date

### Iteration 1 — MVP shell
5-page shell with shared nav + footer. Dark elegant + nature-inspired
design system. Fraunces serif headlines + Instrument Sans body.

### Iteration 2 — content layer
Backend `/api/content/categories|entries`, markdown parsing into
H2/H3 sections, GitHub sync STUB, AI chat STUB. Frontend Library
refactored to API; entry detail page; Learning page; admin-light;
AiDock placeholder.

### Iteration 3 — content reliability + Master Plan structure
Resilient `parse_markdown_safe` (handles malformed input, never raises).
`POST /api/content/validate`, `GET /api/content/admin/entries`.
Bookstore + BookDetail + ReachOut. Library audience filters. Nav
reorganised. AiDock → "The Guardian".

### Iteration 4 — prulesoul.site live MVP (this iteration)
- **Real GitHub sync** at `/api/content/sync/github`:
  honours folder convention `/brand /legal /library /bookstore /kids
  /learning /meditations`. Activates when `GITHUB_REPO` env is set;
  returns `not_configured` cleanly when blank. Upserts by `source_path`.
- **Emergent Google Auth** wired end-to-end (Bearer token in
  localStorage; `/api/auth/session`, `/api/auth/me`, `/api/auth/logout`).
  CORS set to `allow_origin_regex='.*'` to handle Kubernetes ingress
  overriding Access-Control-Allow-Origin.
- **About** page reads `/api/content/entries?surface=brand`; falls back
  to a clearly-labelled placeholder when empty.
- **Legal · Responsibility** page reads `?surface=legal`; same
  graceful placeholder pattern.
- **18+ gate** modal (`AgeGate.jsx`) on `/learning` and
  `/meditation-corner` only — `/kids-universe` is NEVER gated.
  localStorage persisted; resettable from User Portal.
- **Kids Universe** rebuilt with three age groups (3–5, 6–8, 9–12) and a
  Coloring Studio placeholder route at `/kids-universe/coloring`.
- **Reach Out** form now POSTs to `/api/reach-out` (persists to Mongo;
  email forwarding turns on once `REACH_OUT_EMAIL` is set + a provider
  wired).
- **prulesoul.site** branding in `<title>`, og tags, canonical link,
  footer copyright. No new content generated.
- **SYSTEM_ARCHITECTURE.md** + **auth_testing.md** created.
- **All four new surfaces** (brand, legal, kids, meditations) are
  queryable via the existing `/api/content/entries` endpoint.
- **Deployment readiness**: PASS (no hardcoded secrets, no hardcoded
  URLs, env-driven everywhere, supervisor healthy).

## Production checklist (handover)
| Item | Status |
|---|---|
| Multi-page structure | Done |
| GitHub sync architecture | Done · awaiting `GITHUB_REPO` env value |
| Content normalizer | Done |
| Bookstore (paid prep) | Done · awaiting LemonSqueezy product IDs |
| Library (free) | Done |
| About / Legal pages | Done · awaiting GitHub `/brand` `/legal` content |
| Kids Universe + Coloring | Done (placeholder studio) |
| 18+ gate | Done |
| Auth | Done (Emergent Google) |
| Reach Out | Done · awaiting `REACH_OUT_EMAIL` |
| AI Guardian | Placeholder by design |
| Domain prulesoul.site | Branding done · DNS at registrar required |

## DNS — manual step at registrar
After clicking Deploy in Emergent, the deployment URL becomes the CNAME
target. At your registrar:
- Add a `CNAME` record: `prulesoul.site` → `<your-emergent-deployment-host>`
- Or, if the registrar requires apex `A`-records, use the four
  Emergent-provided IPs (visible inside the deployment screen)
- Add `www.prulesoul.site` `CNAME` → `prulesoul.site`
- TTL 300 is fine for testing, raise to 3600 once stable.

## Backlog after first launch
### P1
- Wire `GITHUB_REPO` + initial sync of /brand /legal /library /bookstore
  /kids /learning /meditations
- LemonSqueezy product IDs into the seeded books → enable Buy Access
- Object storage for cover images + PDFs
- Real email transport for Reach Out (SendGrid / Resend) using
  `REACH_OUT_EMAIL`
- GitHub webhook (HMAC-verified) for automatic re-sync on push

### P2
- The Guardian: real RAG over content + `/brand/tone.md` system prompt
- Admin: bulk re-validate, sync history, GitHub diff preview
- Member-area inside the Portal once the first paid book ships
- Real coloring image generation in Kids Studio (separate, safety-vetted
  pipeline)

## Notes for fork agents
- Auth is **Bearer token in `localStorage` key `aurin_session_token`**
  (axios interceptor auto-attaches header). Cookie path also works but
  ingress wildcard breaks it cross-origin.
- Markdown is normalised through `content_normalizer.parse_markdown_safe`
  — single source of truth for every entry, GitHub-ingested or manual.
- Every entry/book carries `validation_warnings: string[]` — internal
  only, surfaced on `/admin/content` and the entry detail warnings panel.
- 18+ gate uses `localStorage.aurin_age_confirmed_v1`; reset via Portal.
