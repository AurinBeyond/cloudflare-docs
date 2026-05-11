# 📋 MATRIX AURIN — MASTER CATALOG OF ALL PAGES
*Iter 48 · 2026-02-06 · $0 audit · founder reference for content fill*

> Honest map: each row = one URL on the platform. The "current heading"
> column shows what the user actually sees today (read live from the
> JSX). The "subsections" column shows the visible structure. Use this
> to decide where new content lands.

Legend: 🟢 has real prose · 🟡 structure exists, content thin · 🔴 placeholder/scaffold

---

## SECTION 1 — Public marketing / discovery

| # | URL | Page name (current) | Hero / H1 | Subsections (current) | Status |
|---|-----|---------------------|-----------|-----------------------|--------|
| 1 | `/` | **Home / The Bestseller Funnel** | (dynamic — pulls book layers) | Layered display: matrix-i raamatud → side-rooms → philosophy ribbon → footer CTA | 🟢 |
| 2 | `/start` | **Start** (entry redirect) | "Begin here" | Single CTA card, 58 lines total | 🔴 SCAFFOLD — needs proper landing copy |
| 3 | `/about` | **About** | (founder letter) | Personal narrative + entries grid | 🟢 |
| 4 | `/aurin-philosophy` | **Aurin Philosophy** | "The quiet philosophy" | Multi-section essay (226 lines) | 🟢 |
| 5 | `/wanderers-agreement` | **Wanderer's Agreement** | "A guide, not a clinician" | A guide, not a clinician · Your freedom, your responsibility · About the companion · When the wave is bigger than this room · In one breath | 🟢 |
| 6 | `/legal` | **Legal** | "Terms · Responsibility · Refunds" | Terms, Responsibility, Refunds, Privacy | 🟢 |
| 7 | `/reach-out` | **Reach Out** | "Received, in spirit" | Contact form + warm response state | 🟢 |

---

## SECTION 2 — Bookstore (paid + free books)

| # | URL | Page name | Status | Notes |
|---|-----|-----------|--------|-------|
| 8 | `/bookstore` | **Bookstore** index | 🟢 | Lists all 8 books with cover, title, price |
| 9 | `/bookstore/:slug` | **Book detail** | 🟢 | Full markdown rendered, "Read sample" + "Add to library" CTAs |

### Books in DB (with prices PRESERVED — vana hinnastruktuur on kõik alles):

| # | Slug | Title | Subtitle | Price | LS Variant | Status |
|---|------|-------|----------|-------|------------|--------|
| 1 | `you-dont-have-to-dance-to-anothers-tune` | You Don't Have to Dance to Another's Tune | On boundaries, choice, and quiet courage | **$7.00** | `1606185` ✓ | 🟢 paid, full markdown |
| 2 | `the-language-of-angels` | The Language of Angels | (TBD) | **$10.00** | needs LS ID | 🟢 paid |
| 3 | `beyond-the-matrix-i` | Beyond the Matrix | (TBD) | **$13.00** | needs LS ID | 🟢 paid (Matrix series — keep paid) |
| 4 | `beyond-the-matrix-ii` | Beyond the Matrix II | (TBD) | **$13.00** | needs LS ID | 🟢 paid (Matrix series — keep paid) |
| 5 | `angels-tales` | Angels' Tales | (TBD) | **$5.00** | needs LS ID | 🟢 paid |
| 6 | `engels-friends-2` | Engels' Friends 2 | (TBD) | **$5.00** | needs LS ID | 🟢 paid |
| 7 | `the-night-angels-embrace` | The Night Angels' Embrace | (TBD) | **FREE** (no price field) | — | 🟢 already free |
| 8 | `angels-story` | Angels' Story | (TBD) | $5.00 → **suggest FREE** | — | 🟡 propose making free as 2nd taste-sample |

**Founder ruling 2026-02-06:** keep all prices as the DB stores them. Make 2 books free as introductory taste — Matrix series stays paid. Recommendation: **#7 The Night Angels' Embrace + #8 Angels' Story** as the two free pieces. (Founder to confirm or pick a different second.)

---

## SECTION 3 — Library (free reading shelf)

| # | URL | Page name | H1 / lead | Subsections | Status |
|---|-----|-----------|-----------|-------------|--------|
| 10 | `/library` | **Library Hub** | "Library · Free reading" | A quiet shelf · A quiet way to stay close · A note now and then. | 🟢 |
| 11 | `/library/adults` | **Library — for adults** | (book grid) | 8 entries listed dynamically | 🟢 |
| 12 | `/library/kids` | **Library — for children** | "Library · For children" | A quiet room · No noise. No rush. Stories and drawings. | 🟢 |
| 13 | `/library/kids/read` | **Kids — Read** | (story grid) | Pulls from `kids_stories` collection — currently empty (collection missing) | 🔴 needs stories or remove route |
| 14 | `/library/kids/draw` | **Kids Coloring Studio** | (page grid) | 9 coloring pages, daily generator runs | 🟢 |
| 15 | `/library/:slug` | **Library entry detail** | (markdown viewer) | Renders any library entry | 🟢 |

---

## SECTION 4 — The Quiet Rooms (signature experiences)

| # | URL | Page name | H1 / lead | Subsections | Status |
|---|-----|-----------|-----------|-------------|--------|
| 16 | `/the-beginning` | **The Beginning** (7-day journey gateway) | "The Beginning" | Begin · Sign in to continue · Read what you wrote · Continue where you left off · Start when you feel ready | 🟢 |
| 17 | `/the-beginning/step` | **Beginning — step view** | "Module 3 / 7" | 7 daily steps, drip-fed | 🟢 |
| 18 | `/clarity-release` | **Private Room (Clarity Release)** | (gateway + cabinet) | Wanderer's Agreement gate · 3 pass tiers (30min/60min/season) · Clarity AI guide · Soft-Landing timer | 🟢 |
| 19 | `/clarity-release/threshold` | **Clarity Threshold** | (pre-cabinet hold) | Threshold breath · Tier select · Disclaimer | 🟢 |
| 20 | `/body-room` | **Body Room** | "Five quiet questions" | 5 quiet questions · 8 somatic hotspots (head/throat/chest/heart/belly/hips/back/legs) · Insights drawer | 🟢 |
| 21 | `/meditation-corner` | **Meditation Corner** | (s.title — dynamic 4 sessions) | 4 short sessions: Breath · Stillness · Letting go · Coming home | 🟡 STRUCTURE OK, audio engine for §14.2 not yet built |
| 22 | `/kids-universe` | **Kids Universe** | (gardens) | Story Garden · Drawing Garden · Sound Garden · Letter Garden | 🟡 STRUCTURE OK, sub-content thin |

---

## SECTION 5 — Course Room

| # | URL | Page name | Status | Notes |
|---|-----|-----------|--------|-------|
| 23 | `/course-room` | **Course Room** index | 🔴 **EMPTY** — code 212 lines, **0 courses in DB** |
| 24 | `/course-room/:slug` | **Course detail** | 🔴 unreachable until courses exist |

**Currently planned courses** (per founder, not yet in DB):
- "Money & Consciousness" (4 modules) — benchmark course
- "New-Era Architects" (Parents Room, 4 modules)
- "Biological Sovereignty" (Health pillar)
- "Cognitive Architecture" (Focus & attention)

---

## SECTION 6 — Blog (the magnet)

| # | URL | Page name | Status |
|---|-----|-----------|--------|
| 25 | `/blog` | **Blog** index | 🟡 only 2 posts |
| 26 | `/blog/:slug` | **Blog post** | 🟢 renderer works |

**Currently published:**
1. `mirror-of-our-souls` — The Mirror of Our Souls (parenting / programming / aurin-philosophy)
2. `on-not-hearing-myself` — On not hearing myself (founder letter)

**Founder's planned magnet articles** (not yet written):
1. The invisible architecture of the Matrix
2. Money as the language of consciousness
3. Neuroplasticity & screen time
4. Why the Matrix fears your silence
5. Childhood as the algorithm's fruit
6. Biological sovereignty — reclaiming your rhythm

---

## SECTION 7 — Auth & user surfaces

| # | URL | Page name | Status |
|---|-----|-----------|--------|
| 27 | `/test-group` | **Beta test group** | 🟢 enrollment + counter card |
| 28 | `/portal` | **User Portal** (magic-link landing + cabinet shelf) | 🟢 |
| 29 | `/whispers-portal` | **Whispers Portal** (founder-only outreach copy bank) | 🟡 founder tool, not user-facing |

---

## SECTION 8 — Admin (founder-only)

| # | URL | Page | Notes |
|---|-----|------|-------|
| 30 | `/admin/preview-assets` | Preview asset uploader | for the bypass-token founder workflow |
| 31 | `/admin/content` | Content admin | post/blog editor |

---

## 📦 SUMMARY — what's truly missing

**Critically empty (red):**
- `/course-room` — 0 courses in DB despite code being live
- `/blog` — only 2 posts
- `/start` — 58-line scaffold
- `/learning` — 59-line scaffold
- `/library/kids/read` — kids_stories collection missing entirely

**Structure ok, content thin (yellow):**
- `/meditation-corner` — needs §14.2 audio engine
- `/kids-universe` — gardens are placeholders

**Complete and on-brand (green):**
- Home, About, Aurin Philosophy, Wanderer's Agreement, Legal
- Bookstore (8 books with full text)
- Library Hub + adults + kids draw
- The Beginning + step
- Clarity Release + Threshold (huge — 1068 lines)
- Body Room (985 lines)
- Test Group, Portal, Reach Out

---

*— end of master catalog —*
