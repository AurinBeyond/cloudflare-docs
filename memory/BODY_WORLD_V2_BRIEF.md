# BODY WORLD V1 — IMPLEMENTATION LOCK (2026-02-13)

> **STRUCTURAL LOCK · DO NOT REDESIGN, INVENT, OR MERGE WORLDS.**
> This document is the single source of truth for the Body World
> system. Any agent working on Body World must respect this lock.

## Canonical URL

```
/body-world
```

Backwards-compatible aliases:
- `/body-room`             → 301 redirects to `/body-world`
- `/body-room/world/:slug` → 301 redirects to `/body-world/world/:slug`
- `/body-room/v1`          → legacy `BodyRoom.jsx` (preserved)
- `/body-world/v1`         → legacy `BodyRoom.jsx` (preserved)

## Architecture

```
BODY WORLD (Hub)               /body-world
↓
14 Worlds (Stones)             /body-world/world/:stoneSlug
↓
Sub-stones (Sub-themes)        /body-world/world/:stoneSlug/topic/:topicSlug
↓
Topics & Content               (authored later — Field Study skeleton today)
```

Mirrors the architecture already proven in **Polarstar** and the
**Alistair Laboratory**.

## Core Principle

**Traveller ≠ Kaelen.**
The man by the lake is the **visitor**. Kaelen is the **guide** —
he appears in the sidebar, in chat, in voice. Never by the lake.

## Stone Map (14 worlds — LOCKED)

| # | Title                          | Slug                      | Question                                       | Visual  |
|---|--------------------------------|---------------------------|------------------------------------------------|---------|
| 1 | Know Your Body                 | `know-your-body`          | What is my body trying to tell me?             | painted |
| 2 | Emotional Body                 | `emotional-body`          | What am I still carrying?                      | painted |
| 3 | Body Memory & Inheritance      | `body-memory`             | Where do the roots begin?                      | pending |
| 4 | Body Identity                  | `body-identity`           | Who do I believe I am?                         | painted |
| 5 | Body Protection Mechanisms     | `body-protection`         | What is this protecting me from?               | pending |
| 6 | Body as a Partner              | `body-as-partner`         | Who is leading?                                | pending |
| 7 | Body Engineering               | `body-engineering`        | How do I work WITH my body?                    | pending |
| 8 | Body & Relationships           | `body-relationships`      | How do people affect my body?                  | pending |
| 9 | Body & Environment             | `body-environment`        | What surrounds me?                             | pending |
|10 | Body & Time                    | `body-time`               | Am I living according to body rhythm?          | pending |
|11 | **Stress & Nervous System**    | `stress-nervous-system`   | Is my nervous system at war, or at rest?       | pending |
|12 | **Body as Language** *(LOCKED)*| `body-language`           | How does my body speak?                        | pending |
|13 | Consequences                   | `consequences`            | What future am I creating?                     | pending |
|14 | Living or Surviving *(BUBBLES)*| `living-or-surviving`     | Am I living or coping?                         | pending |

**Notes on the lock:**

- Stone 11 was previously "Body & Joy" — replaced by founder directive.
  Joy is a state that arises naturally from a regulated nervous system,
  so the world teaches the substrate, not the symptom.
- Stone 12 is **Body as Language**. DO NOT replace with "Connection &
  Relationships". World 8 (Body & Relationships) already owns
  relationships.
- Stone 14 (Living or Surviving) intentionally departs from stone
  iconography → uses **bubbles**. Bubbles convey freedom, possibility,
  future choices, lightness.
- Stones 1, 2, 4 currently have full painted Polarstar mockups in
  `bodyWorldStones.js → image`. Stones 3, 5-14 fall back to the Field
  Study skeleton until founder provides their painted views.

## World Page Structure (proven, locked)

Each world page (e.g. `/body-world/world/emotional-body`) layers
the founder's painted mockup as full-bleed background and stacks
invisible hotspots over every painted UI element:

```
- Back to Stone Map (top centre pill)
- Sidebar: 13 nav items (Home, Stone Map, Chat, Talk, My Journey,
  Body Check-In, Tools & Practices, Insights, Favourites, Journals,
  Assessments, Settings, Help Center)
- Centre stone (the world itself — no nav, decorative)
- 6 surrounding sub-stones at clock positions 12 / 2 / 4 / 6 / 8 / 10
  → each routes to /body-world/world/:s/topic/:subSlug
- Right column: About This World · Hero Topics · All Topics · Your Journey
- Stone 1 (Know Your Body) only: 3 chat/voice/check-in cards
  above the sub-stones
```

Append `?debug=1` to any world page to visualise hotspots (founder
calibration mode).

## Sub-stones (sample — Emotional Body)

```
1. Recognize         · Learn to see what you carry
2. Understand        · Learn why it stays
3. The Weight We Carry · Learn the cost of holding on
4. Release           · Learn to put down the stone
5. Freedom           · Life beyond the burden
6. Integration       · Turning pain into wisdom
```

Bottom legend (when painted): AWARENESS · UNDERSTANDING · RELEASE ·
FREEDOM · INTEGRATION.

## Chat System (UNTOUCHED)

The Chat with Kaelen, Talk to Kaelen, and Body Check-In surfaces all
route to `/body-world/v1#kaelan` / `#body-room-questionnaire`, where
the legacy `BodyRoom.jsx` (BodyRoomChat voice + text, the four Body
Architecture audio keys, the Honesty Quiz, the Body Temple entry,
BodyLensSelector) lives **completely intact**. Zero content loss.

## Content Status

Per Alistair Laboratory's proven model:
- **Hero Topics**: a handful per world, fully authored.
- **Field Study · In Progress**: standardised placeholder for every
  sub-stone that hasn't been authored yet.

V1 ships with all 14 worlds skeleton-complete; authored content
arrives world-by-world as the founder writes it.

## Purpose Lock

Body World is:

- understanding the body
- learning to listen
- understanding patterns
- understanding burdens
- learning release
- learning practical body stewardship

Body World is **NOT**:

- medical diagnosis
- therapy
- disease treatment

---

## Implementation Status (2026-02-13)

- ✅ Hub `/body-world` shipping with the painted traveller-by-the-lake
  mockup, 14 stone hotspots, 12 sidebar entries, 2 chat cards, 6
  right-column entries (34 hotspots total).
- ✅ World pages `/body-world/world/:stoneSlug` shipping.
- ✅ Three worlds shipping with painted Polarstar views: Know Your
  Body, Emotional Body, Body Identity.
- ✅ Eleven worlds shipping with Field Study skeleton.
- ✅ Topic placeholder `/body-world/world/:s/topic/:t` shipping.
- ✅ Legacy `/body-room/*` URLs preserved via 301 redirects.
- ✅ Legacy `BodyRoom.jsx` content reachable at `/body-room/v1` and
  `/body-world/v1`.
- ✅ Navigation label "Body Room" → "Body World" across Navigation,
  Footer, SanctuaryPreview, Catalogue, FAQ.
- ⏳ Hotspot coordinate calibration via `?debug=1` — founder pass
  pending; current values are visual best-fit.
- ⏳ Per-world painted mockups for stones 3, 5-14 — founder still
  creating.
- ⏳ Authored Hero Topic content per world — incremental, founder-led.
