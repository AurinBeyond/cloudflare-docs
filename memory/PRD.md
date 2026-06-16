# PRD — Matrix Aurin / Polarstar Kids Platform
**Last update: 2026-02-13**
**Founder language: Estonian. UI: 100% English. Brand: "Screen-Down, Ears-Open".**

## ROOMS (all isolated, no mixing)
- **Grace** — `/grace/*` (Clarity Release)
- **Alistair Laboratory** — `/course-room/*`
- **Body World** — `/body-world/*` (14 stones, 96 sub-stones — burdens carried in the backpack)
- **Body World V1 (legacy, preserved)** — `/body-world/v1`
- **Body Temple** — `/body-temple` (separate paid 28-day course, archived UI)
- **Sara Room (Parents Room)** — `/parents-room/*` (next major work after Body World V1 LOCK)
- **Polarstar Kids** — `/kids-universe/polarstar/*`
- **Aurin's Room** — `/aurins-room/*`

## BODY WORLD STATUS (16.06.2026)

### Architecture: 100% LOCK
14 stones, 96 sub-stones, routing, fallbacks, sidebar stubs, Kaelen ConvAI mount — all stable.

### Painted assets: 15/15 wired (16.06.2026 ✅)
Single source of truth: `/app/memory/BODY_WORLD_ASSET_REGISTRY.md`

### V1 LOCK blockers (only 2)
1. New 14-stone Hub painting (founder to generate)
2. Hotspot re-calibration on new Hub (1 vision pass)

### Source of Truth Audit (2026-02-13 ✅)
Single source of truth: `/app/memory/BODY_WORLD_SOURCE_OF_TRUTH.md`
- Vision-verified all 15 painted assets (Hub + 14 stones) layer-by-layer
- Confirmed routes 100% correct in code
- LOCK realigned 2026-02-13 for Stones 11 and 14 to match approved painted asset names verbatim
- Legacy content (Radical Pause audio, Honesty Quiz, pattern-postponed, kaelan mood-reflect) re-mapped conceptually into new sub-stone slots
- 12 of 14 stones now FULL MATCH; 2 stones (5, 6) have cosmetic-only painted-text issues (old "OF 15" sild, "WISOM" typo); Hub still old-15-stone painting awaiting re-render

### Content migration: 5/31 done (16%)
Tracker: `/app/memory/LEGACY_MIGRATION_STATUS.md`
26 legacy artifacts mapped to stones but NOT YET in code.
This is the **next big work** after V1 LOCK 🔒.

## SESSION-LEVEL NOTES

**13.02.2026 session findings (Source of Truth Audit):**
- Full vision verification of every painted asset against LOCK config (Hub + 14 stones)
- 5-layer check per stone: Painted IMAGE → STONE slug + LOCK title → ROUTE → WORLD page → CONTENT
- Found 2 structural mismatches (Stones 11 and 14) where painted sub-stone names differed from LOCK sub-stone names → resolved by realigning LOCK to painted (founder decision: option A — keep paintings, update code)
- Stone 11: 8 sub-stones → 7 (matches painting); legacyAudio (Radical Pause) + legacyQuiz (Honesty Quiz) moved to new "Regulation Tools" slot (position 4 in painting)
- Stone 14: 10 sub-bubbles → 9 (matches painting); legacyAdultPattern "pattern-postponed" moved to "Letting Go of Survival Patterns" (bubble 2); legacyMoodReflect "kaelan" moved to "Living in Presence" (bubble 9)
- All routing, hotspots, topic pages verified working (screenshot tested)
- Remaining: Hub painting (founder regenerates) + Stone 5 "OF 15" sild + Stone 6 "WISOM" typo (deferred to next render pass)

**16.06.2026 session findings:**
- Asset inventory revealed 14/15 Body World images were already in customer-assets server (uploaded 11-13.06)
- Previous agent had wired only 4 + Hub; remaining 11 were uncataloged
- This session wired 10 stones + 1 Hub variant + Stone 11 (new 16.06 upload)
- Founder narrative locked: **the backpack is the protagonist** (see `BODY_WORLD_NARRATIVE.md`)
- Polarstar nomenclature purged from Body World / Alistair contexts (Polarstar Kids untouched)
- Hub calibration v4 (~10/14 hotspots well-aligned) frozen until new Hub painting arrives

**Credit refund request:** Forwarded via `support_agent` to support@emergent.sh. User entitled to follow up with Job ID 38555318-3213-4a50-9a5c-00284575334e.

## ROADMAP (prioritized)

### P0 — Body World V1 LOCK (1-2 sessions)
- [ ] New Hub painting URL → swap + calibrate
- [ ] Visual final audit (14 stones + sidebar)
- [ ] Mark V1 LOCK in code + audit docs

### P1 — Legacy content migration (multi-session, 26 artifacts)
- [ ] 8 silhouette regions → respective stones
- [ ] 5 children patterns → mostly Stone 3
- [ ] 7 adult patterns → distributed
- [ ] Other surfaces (Luule reading, Mood Reflect, Lens, disclaimer)

### P1 — Sara Room (Parents Room) Polarstar-pattern refactor
- After Body World V1 LOCK
- Requires founder visual brief
- 72 files + 4 philosophies to organize

### P1 — Luule Viilma knowledge layer (post-LOCK)
- See `/app/memory/LUULE_VIILMA_POST_LOCK_NOTE.md`
- NOT a P0 blocker — strategic content depth development
- Cross-stone perspective layer (Fear/Guilt/Anger/Love/Body-as-messenger themes)
- Awaits founder-supplied source material

### P2 — Polish
- Currency toggle USD/EUR
- Recent Notes UI ↔ DB connection
- Bridge link cleanup (`/body-room` → `/body-world` URL updates)
- Outdated label cleanup ("fifteen stones", "Body Architecture", etc.)
- Lint debt: AgeGate, BodyRoomChat, CadenceEngine, KidsRooms

### P3 — Launch
- Remove "Launch Pause Mode"
- Resolve PSP strategy (Gumroad/LemonSqueezy)
- Submit to "Eesti parim koduleht" competition
