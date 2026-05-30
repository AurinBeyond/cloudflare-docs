# Polarstar Content Coverage Matrix — 2026-02-29

Read-only audit of every visible Polarstar entry in the painted world
(day + night mode) plus the 3 age rooms. **No code changed.**

Full text mirrored from the agent's chat output for permanent
reference. Founder reviews this document before any structural sprint
is started.

---

## Coverage summary (96 entries audited)

| Metric | Count |
|--------|-------|
| Total entries | 96 |
| Truly LIVE with real content | 18 |
| Decorative / aria-hidden / OK | 6 |
| Waitlist-only previews (intentional) | 30 |
| **Waitlist where LIVE content exists (DISCONNECT)** | **6** |
| **Dead nested buttons inside age panels** | **17** |
| **Misleading Day 1-7 pillars** | **7** |
| Audio anywhere in kids surface | 0 / 96 |
| Per-entry illustrations | 0 unique |
| Completion tracking persisted | 1 / 96 (Play & Move) |

## The three structural defects

### Defect A1 — Dead nested buttons in age-zone panels (~17 surfaces)
File: `PolarstarDayWorld.jsx` lines 319-345 (AgeZone component)
Each AgeZone wraps an inner IconRow inside a `<button>`. Inner
`<button>` elements look like shortcuts but their onClick is a no-op
(IconRow is called without an onClick prop). HTML also disallows
button-in-button nesting. Effect: 17 visible icons (5+7+5) under the
Discovery / Exploration / Creation tabs are decorative-only.

**Recommended fix:** Replace `IconRow` with a `<Link>`-based version
that routes directly to each activity's route. Activity slugs already
exist in `polarstarContentMap.js`.

### Defect A2 — Explorer's Hub + Morning Boost open waitlist despite LIVE content
File: `PolarstarDayWorld.jsx` lines 173-190
The 5 Explorer Hub icons + the Morning Boost panel dispatch
`polarstar:openWaitlist` regardless of whether the underlying route
has real content. After iter 86i, four Hub items now have LIVE
routes (`/exploration/world-cultures`, `/space-adventures`,
`/amazing-animals`, `/science-lab`) and Morning Boost has LIVE
`/discovery/morning-mindful-start`. These never link to those routes.

**Recommended fix:** Per-icon `navigate()` call when a LIVE route
exists; fall back to waitlist only when route is null.

### Defect A3 — Night-world Day 1-7 pillars all land on the same page
File: `Polarstar.jsx` lines 39-47, 139-149
Seven painted day-pillars labelled d1…d7 all call
`navigate("/kids-universe/polarstar/exploration")`. Visitor clicks
"Day 3" and gets the Exploration room overview, identical to
clicking Day 1 or Day 7.

**Recommended fix:** Either remove the 7-day labelling from the
night painting and the pillars (most honest), or map each pillar to
a specific Exploration activity (Day 4 → nature-quest, Day 7 →
reflection-time, etc.). Author the missing Day 1, 2, 3, 5, 6
activities OR delete the framing.

---

## Effort estimate to resolve all Priority A items

- A1 fix: ~45 min
- A2 fix: ~30 min
- A3 fix: ~45 min (decision + minimal rewire)
- Smoke screenshots per defect: ~30 min
- **Total: ~2-3 hours, frontend-only, no backend, no env changes.**

This is the recommended next sprint AFTER the Little Star audio lands
and AFTER the founder approves at least one bundle from
`BUNDLES_PROPOSAL_2026-02-29.md`.

---

*For the full 96-row entry table, see the agent message dated
2026-02-29 (iter 86j) that produced this audit. Memory is for the
structural narrative; the master table is in chat history.*
