# BODY WORLD · CONCEPTUAL AUDIT (2026-02-13 · v3 · COLD)

> Not an image quality audit. A **cold conceptual audit**: what was in
> the legacy Body Room, what is in the new 14-stone Body World, what
> is preserved, what is mis-placed, what is missing, and which links
> 404. Per founder directive: do not create anything. Audit only.

---

## A. LEGACY BODY ROOM INVENTORY (still living at `/body-world/v1`)

`pages/BodyRoom.jsx` is **untouched and reachable**. It still contains:

| § | Section testid | What it is | Reachable from new Body World? |
|---|---|---|---|
| 1 | `body-room-intro` | "Learning to speak" intro copy | only via `/body-world/v1` direct |
| 2 | `body-room-kaelan` | **Kaelan intro audio card** (`kaelan-intro-audio` · `kaelan-intro-play`) | hub sidebar → Chat / Talk with Kaelen ✓ |
| 3 | `body-room-temple-entry` | **Body Temple CTA** → `/body-temple` (premium 28-day unlock) | **🚨 NOT REACHABLE from new hub** |
| 4 | `body-room-silhouette` | **8-region body silhouette** (crown · throat · heart · solar_plexus · belly · hips · hands · feet) | only via `/body-world/v1` |
| 5 | `body-room-mood-reflect` | Mood-mirror reflect block | only via `/body-world/v1` |
| 6 | `body-room-children` | **5 children-body-pattern cards** (`children-pattern-*`) | only via `/body-world/v1` |
| 7 | `body-room-patterns` | **Adult body-language patterns** (`pattern-*`) | only via `/body-world/v1` |
| 8 | `body-room-questionnaire` | **Honesty Quiz** (`quiz-q-*` → `quiz-result-region-*` + `quiz-result-pattern-*`) | hub sidebar → Body Check-In · Assessments ✓ |
| 9 | `body-room-waitlist` | Newsletter / waitlist signup | only via `/body-world/v1` |

### `BodyArchitectureAudioShelf` · 4 audio keys (also living at `/body-world/v1`)

| Key | Title | MP3 file | Thematic home in 14-stone map |
|---|---|---|---|
| Week 1 | **The Breath** | `body-architecture-week1-breath.mp3` | Stone 9 (Body & Environment → Air & Breath) or Stone 11 (Regulation Tools) |
| Week 2 | **Listening to the Armor** | `body-architecture-week2-armor.mp3` | Stone 5 (Body Protection Mechanisms) |
| Week 3 | **The Radical Pause** | `body-architecture-week3-pause.mp3` | Stone 11 (Stress & NS → Regulation Tools) |
| Week 4 | **Coming Home to the Body** | `body-architecture-week4-home.mp3` | Stone 6 (Body as a Partner → Listening to My Body) |

### Backend endpoints still serving legacy

`/api/body/hotspots` · `/api/body/insights` · `/api/body/children-patterns` · `/api/body/patterns` · `/api/body/questionnaire` — still alive, only consumed by `BodyRoom.jsx` (legacy).

---

## B. NEW 14-STONE INVENTORY (`/body-world`)

### Status

| Layer | Count | Authored? |
|-------|-------|-----------|
| Stones (worlds) | 14 / 14 | ✅ slug · title · question · About · Kaelen quote |
| Sub-stones | 96 / 96 | ✅ slug · title · hint (one-liner only) |
| Sub-stone topic content | 0 / 96 | 🔴 **all Field Study placeholder — no authored content** |
| Painted map views | 3 / 14 | ✅ Stone 1, 2, 4 wired |
| Painted map URLs awaiting paste | 10 / 14 | ⏳ Stone 3, 6, 7, 8, 9, 10, 11, 12, 13, 14 |
| Painted map on hold | 1 / 14 | ⛔ Stone 5 (sild "of 15") |

### Content gap

The new Body World is a **navigable skeleton**, not a content vessel. The 96 sub-stones have no body text — every topic page shows the same "Coming Soon · This World Is Still Being Created" card. Legacy Body Room content has NOT yet been re-distributed into the 14-stone map.

---

## C. LEGACY → NEW MAPPING (proposed, not yet wired)

Founder-content mapping that **needs** to happen for V1 to stop being a skeleton:

| Legacy piece | Proposed destination | Status |
|---|---|---|
| Silhouette · crown | Stone 1 → `body-awareness` | ⏳ not wired |
| Silhouette · throat | Stone 12 → `voice-tone-of-body` | ⏳ not wired |
| Silhouette · heart | Stone 2 → `recognize` | ⏳ not wired |
| Silhouette · solar_plexus | Stone 5 → `fight` / `flight` | ⏳ not wired |
| Silhouette · belly | Stone 11 → `nervous-system-basics` | ⏳ not wired |
| Silhouette · hips | Stone 3 → `unresolved-trauma` (body-memory) | ⏳ not wired |
| Silhouette · hands | Stone 12 → `gestures-and-movement` | ⏳ not wired |
| Silhouette · feet | Stone 9 → `space-and-surroundings` (grounding) | ⏳ not wired |
| 5 Children patterns | Stone 3 → `inherited-patterns` + Stone 8 → `relationship-patterns` | ⏳ not wired |
| Adult body-language patterns | Stone 12 sub-stones (8 of them) | ⏳ not wired |
| Honesty Quiz | Stone 11 → `regulation-tools` OR keep as cross-stone Check-In tool | ✅ reachable via sidebar Body Check-In |
| Audio · The Breath | Stone 9 → `air-and-breath` | ⏳ not wired |
| Audio · Listening to the Armor | Stone 5 → `freeze` or `pleasing` | ⏳ not wired |
| Audio · The Radical Pause | Stone 11 → `regulation-tools` | ⏳ not wired |
| Audio · Coming Home to the Body | Stone 6 → `listening-to-my-body` | ⏳ not wired |
| Body Temple 28-day unlock | Stone 7 → cross-stone "deep practice" tile OR keep as separate paid product | 🚨 **NOT REACHABLE from new hub** |
| Mood Reflect | Stone 2 → `integration` or Stone 14 → `awareness` | ⏳ not wired |
| Waitlist signup | Body World footer OR profile area | ⏳ not wired |

**Founder action item:** confirm/edit this mapping. Once locked, the Field Study placeholders can be replaced with the legacy authored content per slot.

---

## D. NAVIGATION HEALTH CHECK (cold)

### Routes that work ✅

- `/body-world` → painted hub (14 stone hotspots)
- `/body-world/world/:stoneSlug` → painted map view (3) or Field Study (11)
- `/body-world/world/:stoneSlug/topic/:topicSlug` → Field Study topic placeholder
- `/body-world/v1` and `/body-room/v1` → legacy `BodyRoom.jsx`
- `/body-room` and `/body-room/world/:slug` → 301 redirects ✓
- `/body-temple` → premium 28-day surface (untouched)

### Routes that 404 (sidebar dead ends — **my debt**)

| Painted sidebar link | Current route | Reality |
|---|---|---|
| **My Journey** | `/body-world/journey` | 🚨 **404** — no route defined |
| **Tools & Practices** | `/body-world/tools` | 🚨 **404** |
| **Insights** | `/body-world/insights` | 🚨 **404** |
| **Favourites** | `/body-world/favourites` | 🚨 **404** |
| **Journals** | `/body-world/journals` | 🚨 **404** |

These are referenced in `BodyWorld.jsx` `SIDEBAR_ZONES` and `BodyWorldStone.jsx` `SIDEBAR_ZONES`. Every world page paints them. Clicking → React 404. **This must be resolved before V1 LOCK.**

### Hub visual mismatch (cosmetic, not a route bug)

Painted hub asset (`9ndllntz_…21_05_25.png`) renders the **older 15-stone "Welcome to Body World"** version. Code has 14 LOCK-aligned hotspots. Painted "Stone 11 BODY & JOY" hotspot routes to `stress-nervous-system` (correct LOCK), painted "Stone 15 BODY ATTENTION" has no hotspot (graceful no-op). Founder needs to upload a 14-stone hub painting to remove this divergence.

### Other reachability gaps

- **Body Temple** (`/body-temple`) — paid 28-day product. The new hub has no CTA pointing at it. Pre-refactor, the entry lived inside `BodyRoom.jsx` (`body-room-temple-entry`). Now only reachable by typing the URL or via `/body-world/v1` legacy page. **Revenue surface is half-hidden.**
- **`/body-temple` legacy** — page itself works; only the *path to it* from the new hub is missing.
- **PostSessionMoodReflect, BodyLensSelector, LensForRegion** — components imported by `BodyRoom.jsx` only. No mount inside the new 14-stone map. Out of immediate user reach.

---

## E. KAELAN VOICE / CHAT INTEGRATION

- Hub "Chat with Kaelen" and "Talk to Kaelen" cards → `/body-world/v1#kaelan` → mounts `ConvaiPresenceTracker` + (commented-out) `RoomConvaiChat`.
- Every world page sidebar also points to the same anchor.
- **Risk**: if `RoomConvaiChat` import is permanently commented (`// eslint-disable-line no-unused-vars`), the voice chat surface may not actually mount in the legacy page. Worth a smoke test in production preview before V1 LOCK.

---

## F. AUDIT VERDICT (cold)

### What is solid ✅

1. 14-stone LOCK names + numbering correct.
2. 96 sub-stones authored at metadata level.
3. Routes for every stone + every sub-stone resolve (no 404 in the stone graph).
4. Legacy `BodyRoom.jsx` 100% preserved at `/body-world/v1`.
5. URL canonicalisation (`/body-room` → `/body-world`) clean.

### What is brittle ⚠️

1. **5 sidebar routes 404** (journey/tools/insights/favourites/journals) — must be stubbed before V1 LOCK.
2. **96 sub-stones empty** — Body World is a skeleton until legacy content is redistributed (see Section C mapping).
3. **Body Temple CTA absent** from new hub — revenue path weakened.
4. **Hub painting out of sync** with LOCK (15 painted, 14 routed).
5. **Stone 5 painting on hold** (sild "of 15").
6. **10 painted-stone URLs awaiting paste pass.**

### Verdict on GPT's "9.5/10 structure, ready for V1 LOCK"

**GPT is right about the conceptual map.** The 14-stone narrative
**Notice → Feel → Remember → Identity → Protect → Partner → Build →
Relate → Environment → Rhythm → Regulate → Express → Transform → Live**
is a strong, distinct, well-flowing journey.

**But "V1 LOCK ready" is too generous given the engineering reality:**
the *concept* is locked; the *implementation* still has the six brittle
items above. Locking now would freeze a skeleton with five 404 sidebar
links, hidden Body Temple, and a hub painting that disagrees with the
route graph.

### Recommended order before V1 LOCK

1. Stub the 5 sidebar 404 routes (Field Study skeletons or "Coming Soon").
2. Re-add a Body Temple entry tile to the new hub (right column).
3. Founder paste pass for 10 painted URLs.
4. Founder uploads 14-stone hub painting (replaces 15-stone version).
5. Founder confirms legacy → stone content mapping (Section C).
6. Stone 5 painting re-render to "of 14".
7. Visual sub-stone calibration via `?debug=1` on all 14 worlds.
8. **THEN** V1 LOCK and move to V2 backlog.

This audit produced no code changes. No new screens, redesigns, or
renamed worlds were introduced. Founder ruling required before any of
the recommended actions are executed.
