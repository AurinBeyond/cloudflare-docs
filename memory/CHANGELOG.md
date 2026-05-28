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

## 2026-02-11 (PM) — Course Room Audit + Sonic Layer + Sara Memory

### P0 · Course Room (Alistair) Strategic Architecture rebuild
File: `frontend/src/pages/CourseRoom.jsx` — copy/structure rewrite ONLY
(no backend changes, no new components). Anti-wellness language sweep:

- Header eyebrow `"Course Room"` → `"W · 270° · Alistair"`
  (links visually back to the new Hero-Compass)
- Title `"Quiet Letters"` → `"Strategic Architecture"`
- Description rewritten: "Not a course shelf. A protocol library.
  …24-hour cadence-lock — no binge, no dopamine loop."
- Intro card: added "PROTOCOL STRUCTURE" eyebrow, rewrote both paragraphs
  with biomechanical / sovereign register, italicised
  "Anti-dopamine by design."
- NEW chrono-strip visible on the room itself (`data-testid="course-room-chrono-strip"`)
  showing: T-0 Read · +24H Integrate · +48H Next gate opens.
  Maps the cadence-lock visually so HNW visitors see the constraint
  as the feature (not a limitation)
- Course card format line: `"7 letters · 7 quiet evenings of inward listening · A solo walk, with audio whispers as company"` → `"7 transmissions · 24-hour cadence-lock between each · Audio sub-channel runs in parallel"`
- Course CTA `"Begin gently"` → `"Activate sequence"`
- Price hint `"letter 1 free"` → `"transmission 1 open"`
- Bridge card rewritten: routes to "N · Body Architecture" and
  "S · Clarity Release" using compass headings instead of soft prose

### P1 · Compass sonic layer (Founder approved enhancement)
File: `frontend/src/components/sanctuary/HeroCompass.jsx`
- Web Audio API engine — zero asset weight, no external files
- Two-layer ambient: detuned sine drone (E2 + A2) through lowpass +
  slow LFO breathing modulation, plus a triangle-wave mechanical tick
  every ~3.4s at 1800Hz
- Master gain 0.18 idle, ramps to 0.34 when any cardinal is hovered
- User-controlled toggle (`data-testid="compass-audio-toggle"`):
  "Sonic layer · off" by default — one calm tap activates it
- Browser autoplay policy respected (no audio until user interaction)
- Cleanup on unmount stops all oscillators and closes AudioContext

### P1 · Sara persona memory expansion
File: `memory/CURATORS_GRACE_SARA_ALISTAIR.md` (founder-locked)
Two new sections appended under Sara:
1. **Architectural expertise** — Special education / neurodivergent
   dynamics translated through biomechanical framing. Clinical →
   Sara's register translation table (sensory overload, meltdown,
   ADHD, autism, transition anxiety)
2. **High-Net-Worth teen dynamics** — three named patterns:
   The "Project Child" Syndrome · Privilege Isolation · Parent as
   Anchor OS not Friend

### Verifications
- Lint: ✓ both files clean
- Backend `POST /api/waitlist/join` → 200 OK, saves to
  `waitlist_entries` AND mirrors to `newsletter_subscribers` ✓
- Course Room renders correctly after WandererGate consent ✓
- Compass audio toggle button visible in DOM ✓
- Mobile viewport: SVG uses `w-full h-full max-w-[640px] aspect-square`
  → scales down responsively

### Still on hold (founder waiting)
- Grace + Sara new MP3 generation — paused until founder confirms
  voices added to ElevenLabs Library
- Polar.sh full switch — awaiting account approval
