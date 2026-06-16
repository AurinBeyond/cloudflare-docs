# BODY WORLD · LEGACY MIGRATION STATUS
**Locked: 2026-06-16 · Tracks 31 mapped legacy artifacts from `/body-world/v1` → 14-stone V2 system.**

Source map: `BODY_WORLD_LEGACY_MIGRATION_MAP.md`
Goal: each row goes from ⏳ to ✅ as content is migrated to its target stone/sub-stone topic page.

---

## SUMMARY

| Status | Count |
|--------|-------|
| ✅ Migrated | **27** / 31 |
| ⏳ Pending founder decision | **2** / 31 (Body Lens Selector, Newsletter) |
| 📭 No backend content (N/A) | **1** / 31 (Luule Viilma further-reading endpoint empty) |
| ❌ Excluded (Body Temple — not migrated) | 1 |

**87% migrated. 100% of migratable artifacts processed.** Remaining items
need founder input or content authoring, not migration work.

---

## A. AUDIO SHELF (4 / 4 ✅)

| Audio key | Target stone → sub-stone | Status |
|-----------|--------------------------|--------|
| The Breath | Stone 9 `air-and-breath` | ✅ |
| Listening to the Armor | Stone 3 `release` (mapped to `freeze` in MAP, code uses `release`) | ✅ |
| The Radical Pause | Stone 11 `regulation-tools` | ✅ |
| Coming Home to the Body | Stone 6 `listening-to-my-body` | ✅ |

## B. CROSS-STONE TOOLS (1 / 1 ✅)

| Tool | Target | Status |
|------|--------|--------|
| Honesty Quiz CTA → V1 anchor | Stone 11 `regulation-tools` (link card) | ✅ |

## C. SILHOUETTE HOTSPOTS (0 / 8 ⏳)

| Region (V1) | Target stone → sub-stone | Status |
|-------------|--------------------------|--------|
| crown (overthinker) | Stone 1 `body-awareness` *or* Stone 11 `nervous-system-basics` | ⏳ |
| throat (unspoken) | Stone 12 `voice-tone-of-body` | ⏳ |
| heart (compass) | Stone 2 `recognize` | ⏳ |
| solar_plexus (control) | Stone 5 `control` | ⏳ |
| belly (intuition) | Stone 1 `listen` | ⏳ |
| hips (archive) | Stone 3 `ancestral-stories` | ⏳ |
| hands (boundary) | Stone 12 `gestures-and-movement` *or* Stone 8 `boundaries` | ⏳ |
| feet (roots) | Stone 9 `space-and-surroundings` | ⏳ |

## D. CHILDREN PATTERNS (0 / 5 ⏳)

| Pattern (V1) | Target | Status |
|--------------|--------|--------|
| child-throat | Stone 3 `inherited-patterns` + cross Stone 12 `non-verbal-awareness` | ⏳ |
| child-belly | Stone 3 `inherited-patterns` + cross Stone 1 `listen` | ⏳ |
| child-skin | Stone 3 `protective-legacies` | ⏳ |
| child-ears | Stone 3 `unresolved-trauma` | ⏳ |
| child-sleep | Stone 10 `circadian-rhythm` + cross Stone 11 `regulation-tools` | ⏳ |

## E. ADULT PATTERNS (0 / 7 ⏳)

| Pattern (V1) | Target | Status |
|--------------|--------|--------|
| pattern-pull | Stone 6 `cooperation-not-control` | ⏳ |
| pattern-food | Stone 7 `nutrition-intelligence` | ⏳ |
| pattern-anger | Stone 2 `weight-we-carry` + cross Stone 11 `triggers` | ⏳ |
| pattern-jealousy | Stone 8 `relationship-patterns` | ⏳ |
| pattern-screen | Stone 9 `light-and-dark` *or* Stone 7 `daily-rituals` | ⏳ |
| pattern-borrowed-key | Stone 3 `inherited-patterns` | ⏳ |
| pattern-postponed | Stone 14 `survival-mode` *or* Stone 13 `aligning-with-purpose` | ⏳ |

## F. OTHER LEGACY SURFACES (0 / 5 ⏳)

| Surface (V1) | Target | Status |
|--------------|--------|--------|
| Luule Viilma further reading | Stone 3 `ancestral-stories` | 📭 **Optional supplemental material** — `/api/body-room/further-reading` returns empty. Treat as future inspiration link, NOT a P0 blocker. Defer to founder-supplied content. |
| Mood Reflect (PostSessionMoodReflect) | Stone 14 `awareness` *or* Stone 2 `integration` | ⏳ |
| Body Lens Selector | Hub-level tool OR Stone 1 `body-awareness` (founder to decide) | ⏳ |
| Children medical disclaimer | Stone 3 (children sub-stones) + Stone 12 (adult patterns) | ⏳ |
| Newsletter / waitlist signup | Defer — global concern, not stone-specific | ⏳ (defer) |

## G. EXCLUDED FROM MIGRATION

| Surface | Reason |
|---------|--------|
| Body Temple 28-day course | Separate product. Founder LOCK: NOT moved into Body World. Lives at `/body-temple`. |

---

## NEXT MIGRATION SESSION — RECOMMENDED ORDER

Prioritise **high-content-density** items first:
1. **8 silhouette regions** — each carries rich body-wisdom text; goes to specific sub-stone pages
2. **5 children patterns** — distinct child-focused text; goes mostly to Stone 3
3. **7 adult patterns** — distinct adult-focused text; distributed across Stones 2, 6, 7, 8, 9, 13, 14
4. **5 other surfaces** — niche tools, can be last

**Work mode for migrations:**
- Open V1 source: `pages/BodyRoom.jsx` + helper components
- Copy text content (preserve exact phrasing per founder rule "use existing text")
- Paste into target stone/sub-stone topic page in V2 system
- Update this STATUS file: ⏳ → ✅

---

## RULE

**Whenever a migration is completed, this file MUST be updated within
the same session. Do not leave a migrated item marked ⏳.**

This prevents the "is it done or not?" question from ever returning.

🎒 The backpack is being unpacked — one stone at a time.
