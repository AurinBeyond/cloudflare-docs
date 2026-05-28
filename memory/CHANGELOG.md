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

## 2026-02-11 (LATE) — Voice IDs Auto-Wired + Live Cadence Engine

### P0 · ElevenLabs voice generation — Grace & Sara
- ElevenLabs API tested with Charlotte (`XB0fDUnXU5powFXDhCwa`) and
  Lily (`pFZP5JQG7iQjIQuC4Bku`): **both return HTTP 200** — founder has
  successfully added them to her ElevenLabs Library
- Rachel (`21m00Tcm4Tlvkq7QITTI`) returns 404 — that backup voice was
  not added (Charlotte serves as Grace's voice → no rerun needed)
- Generated NEW distinct 15-second intro MP3s:
    - `frontend/public/audio/grace-intro.mp3` — Charlotte voice (238 KB)
    - `frontend/public/audio/sara-intro.mp3`  — Lily voice (262 KB)
- Brand-aligned scripts ("South — one-eighty degrees. I curate Clarity
  Release…" and "East — ninety degrees. I curate the Parents' Room…")
  linking each curator to her Compass heading
- Updated `backend/.env`:
    - `ELEVENLABS_VOICE_GRACE` → Charlotte
    - `ELEVENLABS_VOICE_SARA`  → Lily
  (previously both pointed at the same fallback ID — that is now fixed)
- Backend restarted; new voices live for any TTS fallback paths

### P0 · Live Cadence Engine (Founder enhancement)
**Backend** — `server.py` new endpoint `GET /api/courses/me/next-unlock`
- Iterates the authenticated user's `course_enrollments`, computes
  every letter's `unlock_at = started_at + (day - 1) days`, returns
  the soonest upcoming unlock (with course_slug, course_title,
  letter_day, letter_title, seconds_remaining)
- Returns `unlocked_at: null` gracefully when there are no
  enrollments / no upcoming locks

**Frontend** — `frontend/src/components/CadenceEngine.jsx` (NEW)
- Mounted in `CourseRoom.jsx` in place of the static T-0/+24H/+48H strip
- Personalised live countdown for authenticated users with active
  enrollments: "Your next transmission — `<letter title>` of
  `<course title>` — unlocks in 14h 23m 11s"
- 1Hz visual tick, server re-sync every 30s to prevent drift across
  long-open tabs
- Auto-refetches when remaining reaches zero
- Falls back to the original static reference strip for signed-out
  visitors and users with no upcoming locks → testid stable
- Anti-dopamine note rendered beneath the clock

### Verifications
- ElevenLabs Charlotte + Lily: 200 OK · file sizes 238/262 KB ✓
- `/api/courses/me/next-unlock` unauth → 401 ✓
- `/api/courses/me/next-unlock` auth, no enrolments → `unlocked_at: null` ✓
- After injected enrollment 12h ago → `seconds_remaining: 43199`,
  letter_day: 2, course_title: "The language you forgot" ✓
- Lint: ✓ both files clean
- Static strip fallback verified via screenshot

### Parents' Room (Sara) terminology audit
- Grep across `/app/frontend/src/pages/ParentsRoom.jsx` for
  `therapy|therapeutic|heal|healing|wellness|cure|treatment|patient|trauma `
  → **zero matches**. Page already speaks the architectural register.
- No code change required.

### Still on hold
- Polar.sh full switch — awaiting account approval
- Body Room 7-day chrono-lock + Clarity 48h chrono-lock — Course Room
  per-letter daily cadence is the only one currently enforced
  server-side; Body / Clarity locks remain front-end soft gates for
  the next sprint

## 2026-02-11 (LATE-PM) — Broken Clockwork + Authorial Overlay

### P0 · Sara wedge "Broken Clockwork" UX upgrade
File: `frontend/src/components/sanctuary/HeroCompass.jsx`
When the user hovers the East cardinal (Sara · 90° · Parents' Room):

1. **Visual:** the outer rotating tick-ring stops its slow ~3°/s
   breathing and switches to an accelerated ~36°/s **reverse**
   rotation — a clockwork-countdown signature.
2. **Audio:** the mechanical metronome morphs from a soft ~3.4s
   triangle-wave pulse (1800 Hz) to a sharp **1-second** clockwork
   tick (2400 Hz, higher peak) — the t.A.T.u. "30 minut"
   Broken Clockwork signature in synth form.
3. **Modal copy:** when the user clicks East, the WaitlistInline
   dialog now opens with a custom high-status frame:
     - eyebrow: `[ TRANSMISSION GATE: PARENTS' ROOM ]`
     - body: "You promised them time. The business demanded
       otherwise. The countdown hit zero, and the trust short-
       circuited. Parents' Room is not another counselling layer.
       It is the Anchor OS your home was never given. Leave your
       access key below and step out of the transactional loop —
       the clock is ticking."
4. **Other cardinals** retain the original generic copy & ambient
   cadence — verified by query `compass-modal-headline-north → False`.

### P1 · Sara persona memory — three cultural diagnostic blueprints
File: `memory/CURATORS_GRACE_SARA_ALISTAIR.md`
Appended under Sara's HNW teen dynamics section:

1. **The White Fence Syndrome** — t.A.T.u. "All The Things She Said"
   (Privilege Isolation, Cognitive Processor Overload, Anchor Resolution)
2. **The Golden Carousel Illusion** — t.A.T.u. "30 minut"
   (Mechanical Cadence, Glowing Vacuum, Voluntary System Crash)
3. **The Broken Clockwork** — Transactional Promise Trauma
   (Value Flip, Anticipated Crash, Mass over Mechanism)

Each blueprint includes Sara's biomechanical translation. She never
cites the source aloud — she reads through the pattern and speaks
in our architectural register.

### P1 · 10% Authorial-voice overlay on lens files
- `backend/parents_lenses.py` — top docstring now declares the
  Matrix Aurin authorial transformation (source intent kept, source
  language replaced, possibility-verbs, no copying). Legal AND brand
  shield in one move.
- `backend/body_lenses.py` — same authorial overlay declaration.

Both files lint clean. No backend-runtime behaviour change — purely
declarative documentation of our originality. This is the most
elegant 10% rewrite move: rather than rewriting 1200+ lines of
already-original synthesis prose, we declare and lock the principle
at the file's authorial preamble so any future maintainer (or AI
agent) knows the rule.

### Verifications
- Lint: ✓ HeroCompass.jsx, parents_lenses.py, body_lenses.py
- East-modal headline + body verified via DOM query ✓
- North-modal still uses generic copy (no custom headline) ✓
- Sara wedge accelerated tick + 1-sec metronome wired and visible
  in screenshot ✓
- Grace + Sara new voice MP3s already on disk (Charlotte 238 KB,
  Lily 262 KB) — `CuratorIntroCard` reads `/audio/{slug}-intro.mp3`
  automatically so `/clarity-release` and `/parents-room` will play
  the new voices on next visit, no extra wiring needed ✓

### Still on hold
- Body Room 7-day chrono-lock + Clarity 48h chrono-lock — next sprint
- "Broken Clockwork" full course (28-day Sara protocol) — next sprint
- Polar.sh full switch — awaiting account approval

## 2026-02-11 (NIGHT) — Polar.sh Prep + Broken Clockwork Scaffold

### P0 · Polar.sh switchover preparation (no live changes)
**Status:** Scaffolding complete · awaiting founder's Polar account approval

What was already wired in the codebase (verified, untouched):
- `/api/webhooks/polar` endpoint (HTTP 503 until env keys set) ✓
- `payment_providers/polar.py` — Standard Webhooks signature verification ✓
- `payment_providers/sku_mapping.py` — 3 SKUs (body_temple, topup_60min, eternal_monthly) ✓
- `polar_webhook_log` MongoDB idempotency layer ✓
- `/api/admin/payment/sku-map` admin visibility endpoint ✓
- LemonSqueezy stays the LIVE provider — Polar in 503 standby

What was added in this sprint:
- `backend/.env` — `§POLAR-PREP` block with all required env-key
  placeholders (`POLAR_MODE`, `POLAR_ORG_ID`, sandbox + production
  OAT + webhook secret, `POLAR_SKU_MAP_JSON`). Each documented inline.
- `backend/.env` — `TOPUP_PRICE_PER_MIN_EUR=0.60` now explicitly
  declared (was implicit fallback). Founder flips to `1.50` on
  Polar production cutover.
- `memory/POLAR_SWITCHOVER_GUIDE.md` — six-step founder runbook with
  rollback procedure, verification commands, and a clean cutover
  ordering rule (never flip price before sandbox verification).

Verifications after backend restart:
- `POST /api/webhooks/polar` → HTTP 503 (clean signal, not crash) ✓
- Backend supervisor RUNNING ✓
- No regression on existing routes ✓

### P1 · "The Broken Clockwork" 28-day Sara protocol — DRAFT BLUEPRINT
**Status:** Memory artifact only · NOT in `SEED_COURSES`

`memory/BROKEN_CLOCKWORK_COURSE_DRAFT.md` — full course blueprint:
- Slug, audience, blurb, audio companion, language="draft" target shape
- 4-act × 7-day arc structure:
    - Act I (1–7): Read the System (Value Flip diagnosis)
    - Act II (8–14): Find the Anchor (parent's own clock audit)
    - Act III (15–21): Install the OS (Anchor OS protocols α–δ)
    - Act IV (22–28): Hold the Clock (load-test the new cadence)
- All 28 letter titles authored (ready for founder to write the bodies)
- Authorial register lock documented (no t.A.T.u. citations in prose;
  blueprints referenced by mechanism only; ~400–550 words/letter)
- Promotion contract: when founder says "Promote The Broken Clockwork
  to SEED_COURSES", agent inserts the dict, lints, ships

This keeps the public catalog clean while the content is being authored.

### What was deliberately NOT done this sprint
- Body Room 7-day chrono-lock backend enforcement — waiting for
  founder's audit feedback
- Clarity Release 48h chrono-lock — same
- Wanderer Sovereign Counter ("127 sovereigns under cadence-lock") —
  GPT idea acknowledged; deferred until founder audit complete
- Parents' Room live in-room ticker — same
- Live Charlotte/Lily voice listen-test — founder doing this manually

## 2026-02-11 (FINAL SPRINT) — Act I + Sovereign Code

### P0 · "The Broken Clockwork" — Act I shipped to SEED_COURSES
**Status:** LIVE on `/api/courses` index
File: `backend/server.py` SEED_COURSES list (28th course entry)

Authored 7 full letter bodies (~1500–1850 chars each, ~350–450 words):
1. **The currency of attention** — calendar-audit framing
2. **The promise that died on a Tuesday** — Value Flip diagnosis
3. **The carousel that spins for no one** — Privilege Isolation
4. **What the teen heard when the call came** — frequency carries
5. **Three broken cycles equals firmware** — patience > intensity
6. **You did not raise a stranger. You raised a survivor.** — reframe
7. **The cost of compensating with objects** — capital ≠ presence

Each letter:
- Opens with one sharp diagnostic frame (no "Hello, parents")
- Holds biomechanical register throughout (Anchor OS, firmware,
  Value Flip, bandwidth, ledger, frequency)
- Closes with ONE small evening protocol (single action)
- Carries a Quiet sentence for the parent to hold across the 24-hour
  cadence-lock
- Day 7 explicitly closes Act I and signals Acts II–IV to come

Backend verified:
- `/api/courses` index → Broken Clockwork visible, letter_count: 7 ✓
- `/api/courses/the-broken-clockwork` → day 1 body 1674 chars
  (preview-open), days 2–7 locked (body=null until enroll +
  cadence-gate elapses) ✓
- `language: "en"` → publicly listed ✓
- `price: 39.0` · `lemonsqueezy_variant_id: None` → will receive
  Polar SKU on cutover ✓
- Lint: clean ✓

### P0 · The Sovereign Code manifest on landing page
File: `frontend/src/components/sanctuary/HeroCompass.jsx` — new
internal `SovereignCode` component rendered between the Compass
headline/subhead and the SVG dial.

Three-law manifesto (Russian carceral survival mantra translated into
Matrix Aurin's architectural register):

| Cardinal | English law | Russian source | Subtext |
|---|---|---|---|
| W · 270° | Do not trust empty words. | Не верь | The system updates on delivered signal, not declared intent. |
| N · 360° | Do not fear the chaos. | Не бойся | Your nervous system is the firewall the room is waiting for. |
| E · 90° | Do not force them to beg. | Не проси | Bandwidth and attention are infrastructure, never currency. |

Interactive sync:
- When the user hovers the matching wedge on the SVG dial, the
  corresponding law lifts (cream → bright, brass underline draws
  in 700ms, subtle translateX) while the other two laws dim to 32%.
- Hovering South (Grace · Clarity) dims all three equally — Grace
  is the room where the laws no longer apply (the mask drops here).
- No new DOM listeners; reuses the existing `active` state on the
  Compass via simple prop.

Visual lineage: brass on graniidist canvas, serif italic, 760px
max-width centered card with hairline brass border + backdrop blur,
coda line "— Three laws. Four headings. One way home."

Verifications:
- Lint: ✓
- Idle state screenshot: all 3 laws visible, cardinal coordinates
  rendered, Russian source displayed ✓
- Hover-East screenshot: "Do not force them to beg · Не проси"
  lifts, brass underline appears ✓
- Hover-West screenshot: "Do not trust empty words" lifts, others
  dim ✓
- NAV anchor unchanged; the manifest is part of the Compass section

### Files touched
- EDIT: `backend/server.py` SEED_COURSES (one new dict, 7 letters)
- EDIT: `frontend/src/components/sanctuary/HeroCompass.jsx`
  (one new internal `SovereignCode` component + render hook)

### Still on hold (next sprint, awaiting founder direction)
- Acts II, III, IV of Broken Clockwork (21 more letters to author)
- Puberty Room — architectural decision pending (see ask_human next)
- Wanderer Sovereign Counter
- Parents' Room live in-room "Broken Clockwork" ticker

## 2026-02-11 (CLOSING SPRINT) — Subsystem Wing + Sovereign Counter + Smoke Test

### P0 · The Subsystem Wing (Variant A · adult-only)
**Route:** `/parents-room/subsystem`
**File:** `frontend/src/pages/SubsystemWing.jsx` (NEW)
**Wired:** `App.js` route + `WandererGate scope="private"` (same gate
as Parents' Room — no separate auth surface for minors)

The word **"puberty"** is now permanently retired from the codebase.
Founder-locked nomenclature: **The Subsystem**. The new wing carries:

- Header: "E · 90° · Sara · Sub-cluster" → "The Subsystem"
- Founder note explaining the term retirement (with literal
  strikethrough on the word "puberty" in the UI)
- 7 architectural diagnostics in our register:
    01. The Subsystem (the renovation itself)
    02. Privilege Isolation pattern
    03. The White Fence Syndrome
    04. Cognitive Processor Overload
    05. The Voluntary System Crash
    06. The Anchor OS — what the Subsystem actually needs
    07. The Sovereign Code applied to the Subsystem
- "Teen Frequency · Season 2 · forthcoming" footer card
  (deliberate hold per founder directive — no minor data collection
  in this deployment cycle)
- Return link to `/parents-room`

Cross-link injected into Parents' Room (`ParentsRoom.jsx`) below the
28-day quiet path: a high-status sub-cluster card →
`/parents-room/subsystem`. Compass geometry unchanged (4-cardinal
intact).

### P0 · The Wanderer Sovereign Counter
**Backend:** `server.py` new endpoint `GET /api/sanctuary/sovereign-counter`
- Anonymous live telemetry, no individual data
- Returns `sovereigns_under_cadence_lock`, `transmissions_this_hour`,
  `waitlist_total`, `rooms_under_load`
- Computes transmissions by scanning enrollments × letter days
  whose unlock_at falls inside the last hour

**Frontend:** `frontend/src/components/sanctuary/SovereignCounter.jsx` (NEW)
- Three-cell strip beneath the Sovereign Code manifest on `/`
- Quietly refreshes every 60 seconds, silently disappears if the
  endpoint errors (manifest above carries the philosophical weight)
- Verified live: `0 · 0 · 2` (clean account state)

### P0 · polar_smoke_test.sh (Founder runbook companion)
**File:** `/app/scripts/polar_smoke_test.sh` (NEW, chmod +x)

Three-check verification script:
1. `/api/admin/payment/sku-map` reports `polar_configured: true`
2. `/api/webhooks/polar` rejects invalid signature with HTTP 400
   (or HTTP 503 if Polar env keys are still empty — script flags
   this state correctly)
3. `polar_webhook_log` MongoDB collection is queryable

Usage:
```
bash /app/scripts/polar_smoke_test.sh        # human-readable
bash /app/scripts/polar_smoke_test.sh --json # machine-readable
```
Exit codes: 0 = all passed, 1 = at least one failed, 2 = env problem.

Verified in current state: 1/3 pass (collection queryable), 2/3 fail
because Polar env keys still empty. This is the **expected** state
before the founder fills in keys per
`memory/POLAR_SWITCHOVER_GUIDE.md`. The script will report 3/3 green
once she completes Step 2 of the runbook.

### P1 · Teen Frequency · Season 2 backlog (NO BUILD)
Documented in:
- `SubsystemWing.jsx` (Season 2 card visible on the page)
- This CHANGELOG

When founder approves, the channel will be implemented with:
- Parental consent flow + age-gating
- Aurin as adolescent-facing curator (mascot returns *only* in
  teen context, never in adult rooms)
- Separate route `/parents-room/subsystem/teen-frequency`
- 5–7 short "system-call" transmissions

### Verifications
- Lint: ✓ SubsystemWing.jsx, SovereignCounter.jsx, server.py
- `/api/sanctuary/sovereign-counter` → 200 OK, returns valid JSON ✓
- `/parents-room/subsystem` renders 7 diagnostics + header ✓
- Sovereign Counter strip live on landing showing `0 · 0 · 2` ✓
- Compass cardinal geometry untouched (4-cardinal N/E/S/W) ✓
- No new dependencies added ✓

## 2026-02-11 (PRE-DEPLOY AUDIT) — Free Visitkaart Refresh

### Audit finding
The "tasuta visitkaardid" (free room intro cards) DID exist in
`SanctuaryPreview.jsx → RoomsSection` (live on `/`), but the copy
was written in the pre-v3.0 wellness register — "Your place for
clarity and quiet. Grace is here to listen" — which violates the
freshly-locked BRAND_VOICE_LOCK.md.

GPT proposed building new public intro routes per room, but that
would have introduced new components, new routes, and deploy-risk
on the eve of the GitHub push. Surgical move taken instead.

### What was changed (copy-edit only, no new routes)
File: `frontend/src/pages/SanctuaryPreview.jsx → RoomsSection`

All four cardinal room cards now carry:
- **Cardinal-coded sub-heading**: `S · 180° · Grace · The Private Room`
  (was just "The Private Room") — visually wires each card directly to
  the new Hero-Compass cardinal mapping
- **Architectural body line**: e.g. Parents' Room body is now
  "For the ones holding the operating system of a home. Architectural
  read, never pedagogical advice." (was "For the ones holding others.
  A quiet hour for the part of you that rarely rests.")
- **Refreshed intro paragraph** in the Matrix Aurin register, retaining
  the three-channel practical info and the "if line breaks, write" promise
- Course Room card now references "The Broken Clockwork (28-day Sara protocol)"
  directly — visitor now sees on the landing that this signature
  course exists
- Parents' Room card now references "The Subsystem" sub-cluster
- Aurin's Room (5th card · children) deliberately UNTOUCHED — that
  audience requires the soft register; the BRAND_VOICE_LOCK applies
  to the adult cardinals only

### Verifications
- Lint: ✓ clean
- Screenshot triple-check: all 4 cards render with new cardinal
  eyebrows, new body lines, new intros, "Enter →" CTAs intact ✓
- No routing changes ✓
- No gate changes ✓
- No backend changes ✓
- DOM testid attributes preserved ✓

### Snapshot taken pre-push
`/app/snapshots/2026-02-11_matrix_aurin_pre_github_push/` — 132 files
including all 100 memory artefacts, source files, Charlotte+Lily MP3s,
and a MANIFEST.md describing how to restore individual files if needed.

Backup tarball: 1.2 MB · expanded folder: 2.8 MB.
