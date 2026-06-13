# BODY WORLD · LEGACY → 14-STONE MIGRATION MAP (2026-02-13 · FOUNDER LOCKED)

> Per founder directive: **do not create content. do not redesign.
> do not move anything yet.** This is a mapping document only —
> a complete migration table for every existing Body Room asset.
>
> Goal: verify nothing valuable is lost before V1 LOCK.
>
> **STATUS: Founder ruling received 2026-02-13 — Section F decisions
> LOCKED. Implementation cleared to begin (P1 phase).**

## FOUNDER DECISIONS (LOCKED 2026-02-13)

1. **Stone 4 (Body Identity)** — accept 0 legacy items. Stone 4 is a
   pure reflection / identity world. No forced legacy content.
2. **Silhouette `solar_plexus / control`** → **Stone 5** (control IS a
   protection mechanism). Stone 11 cross-link allowed but home is 5.
3. **Body Temple surface** → Right column "Continue Deeper · Body
   Temple · 28-Day Guided Journey" tile (NOT footer).
4. **Cross-stone tools** → Kaelan chat + Honesty Quiz + Crisis
   fallback stay shared. They are system tools, not stone content.
5. **`child-sleep`** → **Stone 10** (Body & Time · circadian rhythm).
   Stone 11 cross-reference allowed.
6. **`pattern-screen`** → **Stone 9 primary** (environment shapes
   patterns) + **Stone 7 secondary reference** (habits / systems
   cement patterns).

---

## A. COMPLETE LEGACY INVENTORY

Sourced by reading `pages/BodyRoom.jsx`, `backend/server.py` (Body Room
endpoints), `components/BodyArchitectureAudioShelf.jsx`,
`backend/body_room_ai.py`, `backend/storage/body_room/`.

### A.1 · Silhouette hotspots (8 regions)

Backend: `BODY_HOTSPOTS` in `server.py` line 8856.
Storage: `backend/storage/body_room/{region}-{sub}.png` illustrations.

| ID | Region | Sub-title (from PNG filename) | Sub-theme |
|----|--------|------------------------------|-----------|
| 1 | crown        | `crown-overthinker.png`     | the over-thinker |
| 2 | throat       | `throat-unspoken.png`       | the unspoken |
| 3 | heart        | `heart-compass.png`         | the compass |
| 4 | solar_plexus | `solar-plexus-control.png`  | the control point |
| 5 | belly        | `belly-intuition.png`       | the gut intuition |
| 6 | hips         | `hips-archive.png`          | the archive of inheritance |
| 7 | hands        | `hands-boundary.png`        | the boundary keepers |
| 8 | feet         | `feet-roots.png`            | the roots |

### A.2 · Children patterns (5)

Backend: `SEED_CHILDREN_PATTERNS` in `server.py` line 9288.

| ID | Pattern |
|----|---------|
| child-throat | child-throat |
| child-belly  | child-belly |
| child-skin   | child-skin |
| child-ears   | child-ears |
| child-sleep  | child-sleep |

### A.3 · Adult body-language patterns (7)

Backend: `SEED_PATTERNS` in `server.py` line 9391.

| ID | Pattern |
|----|---------|
| pattern-pull         | the pull |
| pattern-food         | food and body |
| pattern-anger        | anger and body |
| pattern-jealousy     | jealousy and body |
| pattern-screen       | screen and body |
| pattern-borrowed-key | the borrowed key |
| pattern-postponed    | the postponed life |

### A.4 · Body Architecture audio shelf (4 keys)

Component: `BodyArchitectureAudioShelf.jsx` mounted in legacy.

| Week | Key title | MP3 |
|------|-----------|-----|
| 1 | The Breath                  | `/audio/body-architecture-week1-breath.mp3` |
| 2 | Listening to the Armor      | `/audio/body-architecture-week2-armor.mp3` |
| 3 | The Radical Pause           | `/audio/body-architecture-week3-pause.mp3` |
| 4 | Coming Home to the Body     | `/audio/body-architecture-week4-home.mp3` |

### A.5 · Honesty Quiz

Backend: `/api/body-room/questionnaire` (line 9733).
Pre-quiz gate (`quiz-honesty-gate`) + question set + result mapping
(`quiz-result-region-*` + `quiz-result-pattern-*`).

### A.6 · Further reading

| ID | Source |
|----|--------|
| luule-viilma-goodreads | Luule Viilma (Estonian healer) — Goodreads further reading anchor |

### A.7 · AI companion

`body_room_ai.py` — `BODY_ROOM_SYSTEM_PROMPT` (somatic companion
persona, crisis-phrase detection, Eluliin / 112 / findahelpline.com
crisis fallback).

### A.8 · Other surfaces inside `BodyRoom.jsx`

| Section testid | What it is |
|---|---|
| `body-room-intro` | "Learning to speak" intro copy |
| `body-room-kaelan` | Kaelan intro audio card |
| `body-room-temple-entry` | **Body Temple (paid 28-day) CTA** |
| `body-room-mood-reflect` | `PostSessionMoodReflect` component |
| `body-room-waitlist` | Newsletter signup |

### A.9 · Lens system

`BodyLensSelector.jsx` + `LensForRegion.jsx` — toggle between
"somatic" / "energetic" / "psychological" lenses applied to a
silhouette region.

### A.10 · Body Temple (separate product, untouched)

`pages/BodyTemple.jsx` + `body_temple_curriculum.py` — 28-day premium
journey, 4 weeks × 7 days. Reached today only via legacy CTA or
direct URL. Has its own Stripe unlock flow + Letter of Admission email
(`backend/letter_of_admission.py`).

---

## B. MIGRATION MAP — EVERY ITEM → EXACT DESTINATION

Authoring instruction is **not** included. Only the home it should
land in. Founder confirms / overrides each row before any move.

### Silhouette hotspots → stones

| Silhouette region | New home (stone → sub-stone) | Reason |
|---|---|---|
| crown (overthinker)        | Stone 1 `body-awareness` *or* Stone 11 `nervous-system-basics` | The thinking head — awareness OR over-activated NS |
| throat (unspoken)          | Stone 12 `voice-tone-of-body` | The unspoken IS body language |
| heart (compass)            | Stone 2 `recognize` | Heart = emotional core |
| solar_plexus (control)     | Stone 5 `control` | The control response IS solar plexus |
| belly (intuition)          | Stone 1 `listen` | Listening to gut signals |
| hips (archive)             | Stone 3 `ancestral-stories` | Hips = inherited storage |
| hands (boundary)           | Stone 12 `gestures-and-movement` *or* Stone 8 `boundaries` | Gestures + relational boundaries |
| feet (roots)               | Stone 9 `space-and-surroundings` (grounding) | Roots = environmental rootedness |

### Children patterns → stones

| ID | New home | Reason |
|---|---|---|
| child-throat  | Stone 3 `inherited-patterns` + cross-link to Stone 12 `non-verbal-awareness` | Childhood silence → inherited + non-verbal |
| child-belly   | Stone 3 `inherited-patterns` + cross-link to Stone 1 `listen` | Childhood gut → inherited + listening |
| child-skin    | Stone 3 `protective-legacies` | Skin = outermost protective layer |
| child-ears    | Stone 3 `unresolved-trauma` | What the child heard |
| child-sleep   | Stone 10 `circadian-rhythm` *or* Stone 11 `regulation-tools` | Sleep regulation |

### Adult patterns → stones

| ID | New home | Reason |
|---|---|---|
| pattern-pull         | Stone 6 `cooperation-not-control` | The pull = forcing the body |
| pattern-food         | Stone 7 `nutrition-intelligence` | Food and body engineering |
| pattern-anger        | Stone 2 `weight-we-carry` + cross-link Stone 11 `triggers` | Held anger → emotional weight + NS trigger |
| pattern-jealousy     | Stone 8 `relationship-patterns` | Jealousy lives in relationships |
| pattern-screen       | Stone 9 `light-and-dark` *or* Stone 7 `daily-rituals` | Screen impact on body / environment |
| pattern-borrowed-key | Stone 3 `inherited-patterns` | Inherited solutions that aren't yours |
| pattern-postponed    | Stone 14 `survival-mode` *or* Stone 13 `aligning-with-purpose` | Postponed life = survival mode |

### Audio keys → stones

| Audio | New home | Reason |
|---|---|---|
| The Breath                | Stone 9 `air-and-breath` | Breath = primary environment |
| Listening to the Armor    | Stone 5 `freeze` (frozen armour) | The armour is the protection mechanism |
| The Radical Pause         | Stone 11 `regulation-tools` | NS regulation through stillness |
| Coming Home to the Body   | Stone 6 `listening-to-my-body` | Partnership reset |

### Honesty Quiz → cross-stone tool

The quiz returns `quiz-result-region-*` mapped to a body region (one
of the 8 silhouette regions) + `quiz-result-pattern-*` from the seven
adult patterns. The quiz itself stays **cross-stone** under the
sidebar **Body Check-In** / **Assessments** entries (already wired).
Each result region links into the appropriate stone (using the
silhouette-region map above).

### Other → stones

| Item | New home | Reason |
|---|---|---|
| `BODY_ROOM_SYSTEM_PROMPT` (somatic AI) | Stays cross-stone Chat / Talk with Kaelen | Already shared by every world |
| Crisis-phrase detection + Eluliin fallback | Stays cross-stone — must be active in every Kaelen surface | Safety net |
| Luule Viilma further reading | Stone 3 `ancestral-stories` (cultural inheritance) | Estonian healing lineage source |
| Mood Reflect (PostSessionMoodReflect) | Stone 14 `awareness` *or* Stone 2 `integration` | End-of-session reflection |
| BodyLensSelector + LensForRegion | Hub-level toggle (not stone-bound) | Lens applies across silhouette/stone view |
| Body Temple CTA | Hub right-column "Continue Deeper" tile (founder's wording) — NOT inside a stone | Premium product, deserves top-level surface |
| Newsletter waitlist | Hub footer or `/portal` profile area | Not stone content |
| Letter of Admission email flow | Triggered by Body Temple Stripe unlock — unchanged | Separate product flow |

### Children medical disclaimer

`children-medical-note` + `patterns-honesty-note` must stay visible
wherever children patterns or adult patterns appear in the new map.
**Disclaimer carries forward to Stone 3** (children-related sub-stones)
and **Stone 12** (adult pattern sub-stones).

### Body Temple (28-day) — NOT migrated

Body Temple is a separate paid product. **Not folded into any stone.**
Surface point from new Body World = single hub-level tile in the right
column. Founder copy suggestion: "Continue Deeper · Body Temple ·
28-Day Guided Journey".

Letter of Admission email flow, Stripe unlock, curriculum file
(`body_temple_curriculum.py`) — all unchanged.

---

## C. CROSS-STONE / SHARED ASSETS (do not duplicate)

These belong to every stone, not one:

1. Kaelan voice + text chat (`/body-world/v1#kaelan`)
2. Body Check-In quiz (`/body-world/v1#body-room-questionnaire`)
3. Crisis-phrase fallback (Eluliin 116 123 · 112 · findahelpline.com)
4. Wanderer's Agreement gate (`WandererGate` `scope="private"`)
5. Kaelan sidebar profile (avatar + "Your guide" line)
6. `BODY_ROOM_SYSTEM_PROMPT` somatic-companion AI persona

---

## D. COVERAGE CHECK — anything left orphaned?

Legacy item count: **8 silhouette regions + 5 children patterns + 7 adult patterns + 4 audio keys + 1 quiz + 1 mood-reflect + 1 lens system + 1 Body Temple CTA + 1 newsletter + 1 further-reading anchor + 1 AI prompt + crisis flow = 31 distinct content units.**

Mapped to a new home: **31 / 31.**

Orphaned: **0.**

Worth noting (not orphaned, but degraded reachability):
- Body Temple CTA — currently only via `/body-world/v1`. Map proposes
  a hub-level tile.
- Children medical disclaimer — must follow children patterns
  wherever they land (Stone 3).
- Lens system — currently silhouette-only. Map proposes hub-level
  toggle so it can apply across stones.

---

## E. STONE COVERAGE GRID

How many legacy items each stone receives (after migration):

| Stone | Items inbound | Primary role |
|-------|---------------|--------------|
| 1 Know Your Body                | 3 (crown, belly, lens system spillover) | Awareness + listening |
| 2 Emotional Body                | 2 (heart, anger pattern) | Emotional weight |
| 3 Body Memory & Inheritance     | 7 (hips + 5 children patterns + borrowed-key pattern + Luule Viilma + disclaimer) | Inheritance / roots |
| 4 Body Identity                 | 0 *(authored content needed)* | Self-image |
| 5 Body Protection Mechanisms    | 2 (solar_plexus, "Listening to the Armor" audio) | Protection |
| 6 Body as a Partner             | 2 (pattern-pull, "Coming Home" audio) | Partnership |
| 7 Body Engineering              | 2 (pattern-food, pattern-screen alt) | Daily systems |
| 8 Body & Relationships          | 1 (pattern-jealousy, hands boundary alt) | Relational nervous system |
| 9 Body & Environment            | 3 (feet, pattern-screen, "The Breath" audio) | Environment |
| 10 Body & Time                  | 1 (child-sleep) | Rhythm |
| 11 Stress & Nervous System      | 2 ("Radical Pause" audio, anger-trigger cross-link) | NS regulation |
| 12 Body as Language             | 3 (throat, hands gesture, adult patterns container) | Expression |
| 13 Growth & Transformation      | 1 (pattern-postponed alt) | Becoming |
| 14 Living or Surviving          | 2 (pattern-postponed, mood-reflect) | Living vs coping |

**Empty stone alert:** Stone 4 (Body Identity) receives no legacy
content. Either (a) accept that authored content arrives later, or
(b) cross-link to children patterns about body image. Founder
ruling needed.

---

## F. FOUNDER DECISIONS — LOCKED 2026-02-13

| # | Decision | Locked outcome |
|---|----------|----------------|
| 1 | Stone 4 — 0 legacy items, accept? | ✅ **OK** — pure reflection world |
| 2 | Solar Plexus / Control destination | ✅ **Stone 5** (Stone 11 cross-link allowed) |
| 3 | Body Temple surface | ✅ **Right column "Continue Deeper" tile** |
| 4 | Cross-stone tools (Kaelan / Quiz / Crisis) | ✅ **Stays shared** |
| 5 | `child-sleep` destination | ✅ **Stone 10** (Stone 11 cross-link allowed) |
| 6 | `pattern-screen` destination | ✅ **Stone 9 primary + Stone 7 secondary** |

---

## G. STATUS

This document is the **migration plan**, not the migration. Nothing
was moved. No content was duplicated. No code was changed.

Once founder signs off the rows above:
- the silhouette region pages → stone sub-stone pages
- the patterns → stone sub-stone pages
- the audio keys → stone sub-stone pages
- the quiz → stays cross-stone (already wired)

Estimated implementation effort after sign-off:
- 8 silhouette region copies → 8 sub-stone Field Study replacements (~1h)
- 5 children patterns → 5 sub-stone slots (~30min)
- 7 adult patterns → 7 sub-stone slots (~30min)
- 4 audio key mounts → 4 sub-stone audio embeds (~30min)
- Body Temple hub tile → ~15min
- Lens system promotion → ~30min
- **Total: ~3.5 hours of implementation work, once mapping is locked.**
