# POLARSTAR — Kids North-Star (Locked 2026-02-13)

> *"Here, even the night carries light."*

## Why this exists

The Kids layer of Matrix Aurin was being framed as "AI for children",
which is (a) wrong about the actual product, (b) a Payment-Service-
Provider red flag, and (c) emotionally distancing for parents.

Polarstar is the corrective frame. One single living world. Stories,
creativity, family rituals, memories. AI lives in the engine room,
never in the marketing surface.

---

## POLARSTAR DESIGN LAW (locked)

1. **One world only.** No separate day/night applications.
2. **Background changes with time of day.** Same UI, atmosphere shifts.
3. **UI stays consistent.** Buttons, cards, layout — same everywhere.
4. **Stories, activities, memories, and family features remain in the
   same locations.** Time of day affects atmosphere only.
5. **Northern-light aesthetic.** Cream, brass, indigo, candlelight.
6. **Calm before stimulation.** Anti-dopamine by design.
7. **Story before technology.** Always.
8. **Family before AI.** Always.
9. **80% world / 20% interface.** No dashboard energy.
10. **No "AI / chat / agent / companion / chatbot" anywhere on the
    public surface.** Technology is the engine room, not the badge.

---

## Time-of-day atmospheres (4 modes)

- **Morning** (05:00–10:59) — pale dawn, soft peach + cream, "the
  world wakes gently"
- **Day** (11:00–16:59) — bright but not loud; sky-cream + brass, the
  forest path is walkable
- **Evening** (17:00–21:59) — golden hour, lanterns light, amber
  warmth, the world hushes
- **Night** (22:00–04:59) — deep indigo, brass starlight, the
  candlelit treehouse. **The signature mode.**

Atmosphere is computed once on page load (`new Date().getHours()`).
Switching mode does not require any backend; CSS variables flip.

---

## Phase scope (very small on purpose)

### Phase 0 — Lock the vision (this doc) ✅

### Phase 1 — Visual sandbox `/kids-universe/polarstar`
- New page: `frontend/src/pages/Polarstar.jsx`
- Page styles: `frontend/src/styles/polarstar.css`
- Route added (preview-only)
- Existing `/kids-universe/*` routes untouched
- No backend changes
- 1 hero, 3 age cards, ~6 activity tiles, 1 "Tomorrow's Adventure",
  1 Aurin guide card, 1 Story Stars card, 1 Family Moment card
- All icons via `lucide-react` (no emoji in UI)
- Serif typography matching House

### Phase 2 — Backend wiring (later)
- `kids_polarstar_enrollments` collection (mirrors body_temple)
- 7-day chrono-lock path
- "Tomorrow's Adventure" countdown using existing chrono_lock service

### Phase 3 — Evening Room sub-route

### Phase 4 — Family Memory Box + Letters to Tomorrow

### Phase 5 — Microcopy polish + 1 real story

---

## What stays untouched

- ❌ Polar SKU descriptions
- ❌ Pricing model
- ❌ `/` landing (House)
- ❌ Body Room, Clarity Release, Course Room, Parents' Room (adult side)
- ❌ Existing `/kids-universe`, `/aurins-room`, `/kids-universe/journey`
  (they keep working — Polarstar is a parallel sandbox until proven)
- ❌ Production deployment (preview only until founder gives explicit
  go-live signal)

---

## Naming lock

- Public name: **Polarstar**
- Route slug: `/kids-universe/polarstar`
- Internal collection prefix (future): `polarstar_*`
- Marketing tagline: "Here, even the night carries light."
- Subcopy: "A calm family world for stories, creativity, memories
  and small daily adventures."

---

## Decision log

- 2026-02-13 — Founder + AI alignment: one world, four atmospheres,
  not two separate applications. Brand voice locked: anti-dopamine,
  family-first, technology invisible.
- 2026-02-13 — Naming: "Polarstar" chosen over "Young Polarstar"
  (kept room for future cross-age expansion without renaming).
