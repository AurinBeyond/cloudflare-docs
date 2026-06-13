# BODY WORLD · RELEASE CANDIDATE AUDIT (2026-02-13)

> Generated after FINAL WIRING PHASE per founder directive.
> Status: **RC-1 — wiring complete, awaiting URL paste pass.**

---

## 1. Stone Inventory · 14/14

| # | Stone (LOCK)                   | Slug                       | Sub-stones | Geometry | Painting URL |
|---|--------------------------------|----------------------------|------------|----------|--------------|
| 1 | Know Your Body                 | `know-your-body`           | 6          | hex (custom) | ✅ wired |
| 2 | Emotional Body                 | `emotional-body`           | 6          | hex (custom) | ✅ wired |
| 3 | Body Memory & Inheritance      | `body-memory`              | 7          | HEX_SLOTS    | ⏳ TBD-FOUNDER-PASTE |
| 4 | Body Identity                  | `body-identity`            | 6          | hex (custom) | ✅ wired |
| 5 | Body Protection Mechanisms     | `body-protection`          | 7          | HEX_SLOTS    | ⛔ HOLD — painted sild "of 15", awaiting re-render to "of 14" |
| 6 | Body as a Partner              | `body-as-partner`          | 8          | OCT_SLOTS    | ⏳ TBD-FOUNDER-PASTE |
| 7 | Body Engineering               | `body-engineering`         | 8          | OCT_SLOTS    | ⏳ TBD-FOUNDER-PASTE |
| 8 | Body & Relationships           | `body-relationships`       | 8          | OCT_SLOTS    | ⏳ TBD-FOUNDER-PASTE |
| 9 | Body & Environment             | `body-environment`         | 8          | OCT_SLOTS    | ⏳ TBD-FOUNDER-PASTE |
| 10| Body & Time                    | `body-time`                | 8          | OCT_SLOTS    | ⏳ TBD-FOUNDER-PASTE |
| 11| Stress & Nervous System        | `stress-nervous-system`    | 8          | OCT_SLOTS    | ⏳ TBD-FOUNDER-PASTE |
| 12| Body as Language               | `body-language`            | 8          | OCT_SLOTS    | ⏳ TBD-FOUNDER-PASTE |
| 13| Growth & Transformation        | `consequences`             | 8          | OCT_SLOTS    | ⏳ TBD-FOUNDER-PASTE |
| 14| Living or Surviving 🫧         | `living-or-surviving`      | 10 bubbles | BUBBLE_SLOTS | ⏳ TBD-FOUNDER-PASTE (NEW image — female traveller, 10 bubbles) |

**Numbering verified:** 1 → 14 sequential, no gaps, all locked names match founder directive.

## 2. Geometry Helpers (locked)

- `HEX_SLOTS` — 6 stones at clock 12 / 2 / 4 / 6 / 8 / 10
- `OCT_SLOTS` — 8 stones at clock 12 / 1.5 / 3 / 4.5 / 6 / 7.5 / 9 / 10.5
- `BUBBLE_SLOTS` — 10 bubbles in organic cluster around centre (Stone 14 only)
- Stones 1, 2, 4 retain calibrated per-image slots (overrides shared geometry)

## 3. Routes Verified

| Route | Component | Status |
|-------|-----------|--------|
| `/body-world` | `BodyWorld.jsx` | ✅ painted hub (backpack traveller) |
| `/body-world/world/:stoneSlug` | `BodyWorldStone.jsx` | ✅ Polarstar if `image`, else Field Study skeleton |
| `/body-world/world/:s/topic/:t` | `BodyWorldTopic.jsx` | ✅ Field Study placeholder |
| `/body-world/v1` · `/body-room/v1` | `BodyRoom.jsx` legacy | ✅ untouched |
| `/body-room` | redirect → `/body-world` | ✅ |
| `/body-room/world/:slug` | redirect → `/body-world/world/:slug` | ✅ |

## 4. URL Paste Pass — Founder Action

Open `/app/frontend/src/data/bodyWorldStones.js` and replace every `image: ""` marked `TBD-FOUNDER-PASTE` with the matching painted-world URL. The Polarstar view activates the moment the URL is non-empty — no other change required.

11 paintings await the paste pass (Stone 3, 6, 7, 8, 9, 10, 11, 12, 13, 14, plus Stone 5 once re-rendered).

## 5. Archived (not wired)

- "Connection & Relationships" painting (Stone 8 has dedicated painting)
- "Living Your Purpose" painting (Stone 14 stays "Living or Surviving")
- "Mind & Thoughts" painting (Stone 11 stays "Stress & NS")
- "Purpose & Meaning" Stone 10 painting (folded into Stone 14 sub-bubble narrative)
- Earlier Stone 14 (lilac, 9 bubbles, no figure) — reserved for future Body World **Completion / Crossing the Threshold** screen, per founder narrative judgement.

## 6. Sub-stone Authoring Status

Every sub-stone has: slug, title, hint. 96 sub-stones authored total (6+6+7+6+7+8+8+8+8+8+8+8+8+10 = 96).

Topic content per sub-stone is **Field Study · In Progress** placeholder for V1, per founder's "Hero Topics + Field Study" content strategy (same as Alistair Laboratory).

## 7. Known Hold Items (not blocking RC)

- **Stone 5** — painted sild "of 15" → needs GPT re-render to "of 14".
- **Sub-stone hotspot calibration** — Stones 1, 2, 4 calibrated via Gemini pass + manual; Stones 3, 5-14 use shared HEX / OCT / BUBBLE geometry as v1 baseline. Founder visual audit via `?debug=1` recommended after URL paste.
- **Sidebar sub-routes** (`/body-world/journey`, `/tools`, `/insights`, `/favourites`, `/journals`) — currently 404. Out of RC scope; add as Field Study skeletons or "Coming Soon" in next sprint.
- **Lint debt** (AgeGate, BodyRoomChat, CadenceEngine, KidsRooms) — acknowledged, deferred per founder directive.

## 8. Release Decision

**Body World V1 is at Release Candidate when:**
1. Founder pastes the 11 TBD URLs into `bodyWorldStones.js`.
2. Stone 5 re-rendered "of 14" or accepted with the "of 15" sild.
3. Founder visual audit of all 14 worlds via `?debug=1` (sub-stone hotspot calibration).
4. Sign-off.

## 9. Hub Painting Sync (known visual mismatch)

**Painted hub** (URL `9ndllntz_…21_05_25.png`) shows the **older 15-stone "Welcome to Body World" version**:
- Stone 11 painted = "BODY & JOY" (LOCK renamed → "Stress & Nervous System")
- Stone 15 painted = "BODY ATTENTION" (LOCK removed)

**Code-side hotspot graph** is LOCK-aligned (14 hotspots, no Stone 15):
- Painted "Body & Joy" → routes to `/body-world/world/stress-nervous-system` ✓
- Painted "Body Attention" → **no hotspot** (click does nothing — graceful no-op)

**Resolution path:** founder uploads a new 14-stone hub painting matching the LOCK (Stone 11 = "Stress & Nervous System", Stone 15 removed). Until then, **system works** but visual labels diverge from routes.

This does NOT block Release Candidate. It is cosmetic and self-healing once founder uploads a new hub painting.

## 10. Routes Smoke Test (2026-02-13)

All 14 stone routes verified live:
- `/body-world/world/{know-your-body, emotional-body, body-identity}` → painted Polarstar ✅
- `/body-world/world/{body-memory, body-protection, body-as-partner, body-engineering, body-relationships, body-environment, body-time, stress-nervous-system, body-language, consequences, living-or-surviving}` → Field Study skeleton ✅
- `/body-world/world/:s/topic/:t` (sampled 5) → topic placeholders ✅

