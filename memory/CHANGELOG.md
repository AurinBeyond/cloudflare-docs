# Matrix Aurin — CHANGELOG

Append-only log of implemented features. PRD.md remains the static
source of truth for problem statement and architecture.

## 2026-02-11 — Hero-Compass + "Somatic" Sweep

### P0 · Hero-Compass SVG (Variant A) on Sanctuary homepage
- New component: `frontend/src/components/sanctuary/HeroCompass.jsx`
- Mounted into `SanctuaryPreview.jsx` directly after the Hero,
  before the Quiet Note section
- Custom-coded SVG (600×600 viewBox) — no external icon libs
- Cardinal mapping (founder lock):
    - N (360°) — Kaelan      — Body Architecture
    - E ( 90°) — Sara        — Parents' Room
    - S (180°) — Grace       — Clarity Release
    - W (270°) — Alistair    — Course Room
- Visual lineage: brass (#c4a46b) on graniidist (#0b0a08), serif
  italic typography, central MATRIX AURIN emblem, 24-tick rotating
  ring, fixed compass needle, hover-glow on cardinal arms
- Interactive — click/Enter opens a `CompassWaitlistDialog` that
  reuses the existing `WaitlistInline` form (POST /waitlist/join)
- Slugs per heading:
    - `compass-body-architecture`
    - `compass-parents-room`
    - `compass-clarity-release`
    - `compass-course-room`
- Backend verified: `curl POST /api/waitlist/join` returns
  `{status: joined, email_sent: true}`
- Nav anchor "Compass" added to `SanctuaryNav`

### P1 · "Somatic" terminology sweep
- `frontend/src/components/BodyRoomChat.jsx` — removed all 4
  user-facing instances of "somatic"; replaced with
  "Body Architecture" per anti-wellness brand directive
- Component is no longer mounted in production (ghost-fixed in
  iter §G3) but the strings are now clean for any rollback

### Voice IDs delivered to founder for ElevenLabs Library
- Grace: Charlotte `XB0fDUnXU5powFXDhCwa` / Rachel `21m00Tcm4Tlvkq7QITTI`
- Sara:  Lily `pFZP5JQG7iQjIQuC4Bku` / Sarah `EXAVITQu4vr4xnSDxMaL`
- Kaelan + Alistair already have working voices (Adam / Antoni)
- No new MP3s generated this session — waiting for founder green light

### Files touched
- CREATE: `frontend/src/components/sanctuary/HeroCompass.jsx`
- EDIT:   `frontend/src/pages/SanctuaryPreview.jsx` (import + mount + nav anchor)
- EDIT:   `frontend/src/components/BodyRoomChat.jsx` (4 string cleanups)
