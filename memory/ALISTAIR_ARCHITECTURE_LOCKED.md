# ALISTAIR LABORATORY ARCHITECTURE — Locked Doctrine

**Status:** Locked design law (Founder, 2026-02-08). Approved interpretation by Anna + her GPT collaborator. Do **not** re-litigate or re-interpret. Future agents must obey verbatim.

---

## The Two-Depth Rule

There are NOT two competing design systems. There is **one laboratory with two depths**.

### Tier 1 — Laboratory ENTRANCE (the doorway)
**Visual master template:** the current `/course-room/lab/money-tree` page (light, airy, cream/warm, editorial, serif typography).

Every laboratory's landing page (`/course-room/lab/<slug>`) follows this same template:
- One painted hero image specific to the laboratory.
- One large serif title.
- One subtitle.
- One **Core Question** card.
- One primary CTA ("Start this laboratory with Alistair").
- Generous whitespace. Few elements. One strong symbol. Editorial feel.

This includes:
- The Money Tree Within (already live, template source)
- Old Stories
- Body Knows First
- Self-Sabotage
- Compass of Meaning

### Tier 2 — Laboratory INTERIOR (inside the lab)
**Visual master templates:** the dark dashboard mockups the founder sent on 2026-02-08 — Body Language, Masks, Marionette / Code, Soul Compass deep-dive, Old Stories interior.

Every laboratory's interior surfaces follow this same dark dashboard pattern:
- Dark sidebar continues from the entrance (same dark navy + brass).
- Painted hero scene specific to the deeper theme.
- Multiple panels: BODY CHECK-IN, REFLECTION QUESTIONS, ALISTAIR'S NOTE, BODY LANGUAGE MAP, MASKS EXAMPLES, etc.
- 5–6 themed cards in a row ("IN THIS LABORATORY WE EXPLORE …").
- Tabs row (OVERVIEW / BODY SIGNALS / NERVOUS SYSTEM / PRACTICES / INSIGHTS / JOURNAL).
- Quick Actions bar at the bottom.

Routes will be nested, e.g.
- `/course-room/lab/body-knows-first/body-language`
- `/course-room/lab/old-stories/the-code`
- `/course-room/lab/masks-we-wear/[…]`

---

## The User Journey

```
1. /course-room                              the room hub (sidebar + painted study + 4 path cards)
2. /course-room/lab/<slug>                   laboratory entrance (Tier 1, light, editorial)
3. /course-room/lab/<slug>/<deeper-slug>     laboratory interior (Tier 2, dark dashboard)
4. /course-room/room                         specific exercise / Alistair voice conversation
```

## Painted Image = Navigation Map (founder Phase-2 ambition)

Each Tier-1 hero image (Money Tree painting, Old Stories book scene, Soul Compass) is *not just decoration*. It is a navigation map. Specific zones inside the painting are clickable and open Tier-2 sub-laboratory areas.

Example (Money Tree):
- **Roots zone** → Family / Childhood / Safety / Belonging sub-pages
- **Trunk zone** → Worth / Fear / Approval / Trust / Receiving core beliefs
- **Branches zone** → Opportunity / Creativity / Leadership / Relationships
- **Fruits zone** → Abundance / Freedom / Financial Flow / Meaning
- **Gardener zone** (you) → Prune / Water / Plant exercises with Alistair

The image acts as a visual table of contents. This is the depth of immersion the founder is building toward.

---

## Strict Execution Rules

1. **Never invent new visuals.** Founder mockups = the approved design system, not inspiration. Translate, do not redesign.
2. **No emoji thumbnails on lab cards.** Use the founder's painted thumbnails (a money tree painting, an open journal painting, a meditation silhouette painting, a vintage compass painting). If the painted thumbnail is not yet delivered, leave an empty cream/light placeholder slot of the correct dimensions. Wait for the asset.
3. **English only on every visible surface.** Estonian only for internal/Anna communications.
4. **No text on bright areas** — never let typography sit on the face of the Matrix Aurin portrait, on the bright sky of the arched window, on the lake reflection, on the body-meridian glow, or on any bright/light region of a painted scene. Confine title typography to the dark/textured anchor zones of the painting.
5. **Global top-bar must disappear** the moment the visitor enters `/grace*` or `/course-room*`. The room's own dark sidebar is the only navigation inside the room.
6. **Tier-1 = light & editorial. Tier-2 = dark & dashboard.** Do not mix. Do not collapse one into the other.

---

## What the Founder Has Already Delivered (treat as APPROVED SPEC)

| Asset | Tier | Role |
|---|---|---|
| Money Tree Within current page | 1 | Master template for all lab entrances |
| Alistair `/course-room` Laboratory of Life dashboard mockup (cream lab cards + painted thumbnails) | hub | Master template for the room hub |
| Old Stories book + paper-scraps mockup | 2 | Old Stories interior |
| Body Knows First river meditation mockup | 1 + 2 | BKF landing (light variant) + Body Signals interior (dark variant) |
| Body Language meridian dashboard mockup | 2 | Body Language sub-lab interior |
| Masks We Wear gold-mask mockup | 2 | Masks interior |
| Soul Compass infographic | 2 | Compass deep-dive interior |
| Controlled By What You Can't See / Marionette infographic | 2 | Cross-lab "Words Become Code" interior |

When the founder sends Tier-1 painted thumbnails for Old Stories, Body Knows First, Self-Sabotage and Compass, those drop into the `/course-room` hub's lab-card thumbnail slots without any visual reinterpretation.
