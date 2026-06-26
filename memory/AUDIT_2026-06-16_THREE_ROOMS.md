# Three-Room Visual Debt Sweep — 2026-06-16

## Scope
Founder's strict directive (2026-06-16): no new audits, no interpretations,
match LIVE to the approved founder reference images, hide visual debt
behind colour masks where painted assets cannot be re-rendered.

## Changes shipped this session

### 1. Alistair (`/course-room`)
- `SCENIC_BG` swapped from `g3ja4a52_…12_43_17.png` (with instruction
  strip baked in) to `7cqdspok_image.png` (founder upload tagged "nii on
  see ilma instrutsioonita" — clean version).
- Sidebar, hero typography, 11-lab 6+5 card grid, right column, bottom
  quote — UNTOUCHED per founder directive ("navigeerimise nuppe ei
  puutu ja ei muuda").

### 2. Grace (`/grace`)
- Removed `Welcome / Welcome back` greeting entirely (incl. `useState`
  first-visit logic).
- Replaced hero H1 with founder-approved 3-second recognition line
  (Tony Robbins × House register):
  ```
  You stopped performing.
  That's why you're here.
  ```
- `useState` import removed (was only used for the deleted greeting).
- Light home identity preserved. Hearth (`/grace/room`) dark theme
  preserved. No theme merging.

### 3. Body World (`/body-world` + `/body-world/world/:slug`)
- **Hub**: Added a dark radial mask at top:82% / left:65% / 26%×18%
  covering the legacy 15th painted stone "15 BODY ATTENTION" (eye
  icon) at bottom-right. z-index:2 to render above the painted hub
  image and below the click hotspot layer.
- **Painted stone pages** (`PaintedWorldView` in `BodyWorldStone.jsx`):
  - Added a top-left dark gradient strip overlay with text
    `STONE N OF 14` to mask the legacy painted "STONE 5 OF 15" /
    "STONE N OF 15" indicators baked into the asset.
  - Added LOCK sub-stone label overlays (radial gradient + cream
    serif text) on every `substone-*` hotspot zone. This masks the
    legacy painted text on each sub-stone (e.g. "5. Body WISOM" typo
    on Stone 6 sub-stone-5 is now masked by the overlay
    `5. Body Wisdom`).

## Known open debt (painted assets only)
- Body World hub painted caption `15 worlds. All connected.` — will be
  removed when the founder re-renders the hub asset with 14 stones.
- Painted small-caps stone titles on the hub (e.g. "1. Know Your Body",
  "2. Emotional Body" etc.) remain visible beneath the larger LOCK
  overlay text — visible doubling, but does not affect navigation.
  Will resolve when the painted asset is refreshed.

## Files touched
- `/app/frontend/src/pages/Alistair.jsx`
- `/app/frontend/src/pages/Grace.jsx`
- `/app/frontend/src/pages/BodyWorld.jsx`
- `/app/frontend/src/pages/BodyWorldStone.jsx`

## Reporting protocol followed
Per founder lock: status is reported as PARTIAL where any open visual
debt remains. The word DONE is not used.
