# 🔒 BODY WORLD V1 CORE LOCK
**Founder approved: 2026-06-16**
**Status: CORE LOCKED. Post-lock polish scheduled.**

## WHAT IS LOCKED ✅

### Architecture
- 14 stones with locked LOCK names + slugs + sub-stones (96 total)
- Routing: hub → 14 stone pages → 96 topic pages → 5 sidebar stubs
- Field Study fallback (Growing World pattern) for unauthored topics
- Body Temple cleanly separated as standalone product
- Legacy V1 preserved untouched at `/body-world/v1`

### Painted Assets (15/15)
- Hub: `9ndllntz_…21_05_25.png` (legacy 15-stone version — pending replacement)
- Stone 1–14: all wired with painted founder mockups
- Full inventory: `/app/memory/BODY_WORLD_ASSET_REGISTRY.md`

### Legacy Content Migration (27/27 migratable artifacts)
- 4 audio shelf items → distributed to Stone 3, 6, 9, 11
- Honesty Quiz CTA → Stone 11
- 8 silhouette regions → respective stones via API fetch
- 5 children patterns → Stone 1, 3, 10 via API fetch
- 7 adult patterns → distributed via API fetch
- Mood Reflect → Stone 14 `awareness`
- Children medical disclaimer → auto-renders inside child pattern blocks
- Tracker: `/app/memory/LEGACY_MIGRATION_STATUS.md`

### Room Isolation
- Body World ≠ Polarstar Kids ≠ Grace ≠ Alistair ≠ Sara ≠ Body Temple ≠ Aurin
- Polarstar nomenclature purged from Body World / Alistair contexts
- Children patterns = adult childhood reflections, NOT kids content

### Cleanup pass (2026-06-16 ad-hoc)
- `Catalogue.jsx` "fifteen stones" → "fourteen stones"
- `Home.jsx` /body-room → /body-world
- `CourseRoom.jsx` "N · Body Architecture" → "N · Body World"
- `ParentsRoom.jsx` "Visit the Body Room" → "Enter Body World"
- `WhispersPortal.jsx` "Body Room — Throat/Hips" → "Body World — *"
- `WanderersAgreement.jsx` "Body Room" mentions → "Body World"
- `AlistairBundle.jsx` /body-room + label → /body-world + "N · Body World"

## KNOWN POST-LOCK VISUAL DEBT

These do NOT block functionality. Hub clicks route correctly to LOCK
detail pages despite painted label mismatches.

| Item | Where | Resolution |
|------|-------|-----------|
| "Welcome to BODY WORLD" header | Hub painting | Awaiting new hub painting |
| "15 worlds. All connected." | Hub painting | Awaiting new hub painting |
| Slot 11 painted = "BODY & JOY" (routes to Stress & Nervous System) | Hub painting | Awaiting new hub painting |
| Slot 13 painted = "LIVING OR SURVIVING" (routes to Growth & Transformation) | Hub painting | Awaiting new hub painting |
| Slot 14 painted = "CONSEQUENCES" (routes to Living or Surviving) | Hub painting | Awaiting new hub painting |
| Slot 15 = "BODY ATTENTION" (no-op click, graceful) | Hub painting | Awaiting new hub painting |
| Slot 10 painted "10 10" duplicate | Hub painting | Awaiting new hub painting |
| Hotspot calibration v4: 6/14 stones ~5-10% offset | STONE_ZONES in BodyWorld.jsx | Single calibration pass on new hub |

## POST-LOCK PRIORITIES (in order)

1. **Sara Room (Parents Room) refactor** — Polarstar-pattern application
2. **New Hub painting + final calibration** — visual debt resolution
3. **Luule Viilma knowledge layer** — see `/app/memory/LUULE_VIILMA_POST_LOCK_NOTE.md`
4. **Body Lens Selector decision** — hub-level vs Stone 1
5. **Newsletter placement** — global/footer (not stone-specific)
6. **Lint debt cleanup** — AgeGate, BodyRoomChat, CadenceEngine, KidsRooms
7. **Launch Pause Mode removal** — when PSP strategy resolved

## SYSTEM HEALTH (verified 2026-06-16)

| Test | Result |
|------|--------|
| 14 stone detail routes | ✅ 14/14 HTTP 200 |
| 5 sidebar stubs | ✅ 5/5 HTTP 200 |
| Legacy APIs (/body-room/hotspots, children-patterns, patterns) | ✅ all returning correct counts |
| Painted asset URLs in code | ✅ 15/15 |
| Legacy mapping keys | ✅ 23 in code |
| Room isolation | ✅ verified |
| Body Temple isolation | ✅ no link from Body World |
| Kaelen ConvAI mount (V1) | ✅ working |

**Body World V1 CORE = LOCKED. 🔒**
