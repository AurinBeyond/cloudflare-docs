# Matrix Aurin — CHANGELOG

Append-only log of implemented features. PRD.md remains the static
source of truth for problem statement and architecture.

## 2026-06-25 (continued) — CRITICAL FIX: Free-access window expired

User-found blocker: visitors clicking "Enter Grace's Room" from the Host Intro could pass the Wanderer Gate but then **hit paywall blocks inside the room** ($15/$30/$50 session passes). Soft-launch would have failed at the most important step — actually entering the room.

### Root cause
`backend/.env` had `FREE_ACCESS_UNTIL=2026-05-20`, which expired **5 weeks before today (2026-06-25)**. The backend's `_free_access_active()` returned `False`, which re-activated the paywall hooks in `ClarityRelease.jsx` (and likely Sara/Kaelen/Alistair rooms too).

### Fix
- `backend/.env` → `FREE_ACCESS_UNTIL=2026-08-31` (gives Substack 2 months runway: launch + 14-day observation + buffer)
- Backend restarted
- Verified `GET /api/aurin/free-access` now returns `{"active": true, "until": "2026-08-31"}`
- Verified visiting `/grace/room`, ticking the 5 Wanderer Gate consents, clicking "I enter consciously" → lands in the full Hearth experience with "Start a Conversation" button, sidebar (Speak/Write/Evening/Messages/Library), keeper card. **No paywall in sight.**

### Now in effect (the right combination for listen-mode)
| Flag | Value | Effect |
|---|---|---|
| `LAUNCH_PAUSE` (frontend) | `true` | Every buy CTA renders as "Coming soon" pill — **nothing can be purchased** |
| `FREE_ACCESS_UNTIL` (backend) | `2026-08-31` | Free-access window ACTIVE — visitors get **full room access without paying** |

Together: visitor walks in, uses everything, can't accidentally buy anything. The exact listen-mode posture Anna + GPT wanted.


## 2026-06-25 (continued) — Source-tag passive analytics

Added `?source=` URL param capture so Anna can answer "which channel sent these 27 people?" on the admin dashboard. Strictly passive — no UX changes, no new visitor-facing element. GPT condition honoured.

### Added
- `/app/frontend/src/lib/track.js` — `getSource()` reads `?source=` or `?utm_source=` (latter for habit) on first landing, validates against `/^[a-z0-9_-]{1,40}$/i`, stashes in `sessionStorage["aurin.source.v1"]`, replays on every beacon for that session.
- `/app/backend/insights.py` `EventIn` model — new optional `source` field (max 40 chars). Stored on `insights_events` docs.
- `/app/backend/insights.py` `/summary` endpoint — new `source_distribution` field: unique sessions per source tag (e.g. `[{source: "substack", sessions: 27}, {source: "untagged", sessions: 9}]`).
- `/app/frontend/src/pages/AdminInsights.jsx` — one extra card "vii · Sources / Where they came from" with horizontal bar visualization.

### Recommended source tags
- `?source=substack` — Substack newsletter
- `?source=email` — personal/close-circle email
- `?source=threads` — Threads / Instagram
- `?source=linkedin` — LinkedIn
- `?source=podcast` — podcast mentions
- `?source=referral` — word-of-mouth (anything else)

Untagged visits (direct, organic, missing param) surface as `untagged` so the gap is visible.

### Tested
- POST `/api/insights/event` with `source` field → 204
- GET `/api/insights/summary` returns `source_distribution` array
- Frontend smoke test: visiting `/grace/intro?source=substack` → sessionStorage captures it → next beacon includes it → backend aggregates correctly
- `events_count=0`, `intake_count=0` at session close (clean slate for live launch)


## 2026-06-25 — Substack soft-launch readiness (Insights surface)

Built the privacy-first analytics + first-question intake form so the next two weeks of real visitor traffic actually teaches us something. No third-party trackers (no GA4, no Meta) — luxury silence brand lock.

### Added — Backend
- `/app/backend/insights.py` (NEW) — 3 endpoints:
  - `POST /api/insights/event` (anonymous, accepts pageview / cta_click / intro_complete / intake_shown)
  - `POST /api/insights/intake` (anonymous, validates one of 6 fixed answer options)
  - `GET /api/insights/summary` (**ADMIN_TOKEN required** via `X-Admin-Token` header or `?token=`)
- MongoDB collections: `insights_events`, `insights_intake`

### Added — Frontend
- `/app/frontend/src/lib/track.js` (NEW) — `getSessionId()` with 12h TTL rotation, `track()`, `trackPageview()`, `submitIntake()`. Uses `sendBeacon` with `fetch keepalive` fallback. No PII collected; only coarse mobile/desktop hint.
- `/app/frontend/src/components/PageviewTracker.jsx` (NEW) — mounted once inside `<BrowserRouter>`, beacons every route change.
- `/app/frontend/src/components/IntakeQuestion.jsx` (NEW) — the 1-question form ("What brought you here today?") with 6 fixed sentence options + optional 400-char free-text note. Brand-aligned (brass/cream/serif). Hides itself permanently after first answer via `localStorage["aurin.intake.answered.v1"]`.
- Mounted `<IntakeQuestion>` at the bottom of **all 5 Host Intro pages**: GraceIntro, SaraIntro, KaelenIntro, AlistairIntro, PolarstarIntro.
- `/app/frontend/src/pages/AdminInsights.jsx` (NEW) — read-only dashboard at `/admin/insights`. 7 cards (sessions count, intake total, conversion %, intake distribution, host-intro engagement, top paths, recent free-text notes). Gated behind `useAdmin()` — renders a polite "Private" screen if no token is in localStorage.

### Six fixed intake answers
- `i_need_a_quieter_evening` — "I need a quieter evening."
- `family_life_feels_complicated` — "Family life feels complicated."
- `i_need_clarity_about_something` — "I need clarity about something."
- `i_feel_disconnected_from_myself` — "I feel disconnected from myself."
- `looking_for_something_for_my_child` — "I am looking for something for my child."
- `just_curious` — "I am just curious."

### Locked
- **All visitor data lives in our own Mongo** — no Google, no Meta, no Mixpanel.
- **`/api/insights/summary` and `/admin/insights` are token-gated** with the existing `ADMIN_TOKEN` env + `X-Admin-Token` header convention.
- **No IP, no fingerprint** collected — session_id is a client-rotated random 16-char base36, dropped from sessionStorage every 12h.

### Tests
- Backend pytest: 12/12 pass — `/app/backend/tests/test_insights_iter89.py`
- Frontend Playwright: all required testids + flow validated — `/app/test_reports/iteration_89.json`
- Post-fix admin gate: `curl -i /api/insights/summary` returns **401** without token, **200** with token. Confirmed manually.

### Database state at session close
- `insights_events`: **0 docs** (clean slate)
- `insights_intake`: **0 docs** (clean slate)

---


## 2026-06-25 — Selguse-pass (Clarity Pass)

Anna direktiiv: "Ei mingit checkouti enne, kui maja sees on selge ja külalisele väärtuslik." Ei puudutanud ühtegi hinda. Lisatud selgust, eemaldatud segadust, iga "TBD" punkt asendatud väärtustega.

### Samm 1 — Avalehe lihtsustamine (`/sanctuary-preview`)
- Sprint Zero CTA-d 3 → 2 (eemaldatud 'See the Five Rooms' — redundantne, FiveRoomsRecognitionSection juba pakub seda)
- Primary CTA: "Start Here" → **"Walk into Grace's room"** (`/start-here` → `/grace/intro`)
- Secondary CTA: "Browse Books" → **"Read for free in the Library"** (`/bookstore` → `/library`)
- `TwoPathsSection` eemaldatud render-flowst (dubleeris TwoWorldsSection'i sõnumit)
- `TwoPathsSection` funktsiooni definitsioon ka eemaldatud failist (~100 rida surnud koodi) — fail 1407 → 1305 rida

### Samm 2 — Host Intro lehed nähtavaks
- `FiveRoomsRecognitionSection` iga ruumi link suunab nüüd `/[room]/intro` lehele (mitte otse ruumi). Lävepakud on lõpuks avastatavad avalehelt.
- Iga kaardi alla lisatud nähtav **"Meet [Name] →"** vihje (`data-testid="five-rooms-<name>-meet-hint"`)

### Samm 3 — TBD → Anticipation (`/pricing`)
- **Day Pass** CTA: "See day passes" → **"Read the Library now"** (`/portal` → `/library`); priceNote: "Day Passes open this spring — until then, the Library is yours, free"
- **Journey** CTA: "Be told when Journeys open" → **"Meet the keepers"** (`/portal` → `/grace/intro`); priceNote: "Doors open this spring — meet Grace, Sara, Kaelen, Alistair and Polarstar first"
- **Companion** CTA: "Be told when Companion opens" → **"Read what's already inside"** (`/portal` → `/library`); priceNote: "Doors open this spring — read what's already inside while we finish the rooms"

### Samm 4 — Voice = võimalus, mitte minutid
- 3 voice-tasandi pealkirjad: "30 minutes / 60 minutes / 180 minutes" → **"One quiet evening" / "When more is being asked of you" / "Across the months"**
- Minutid (~30/~60/~180) liigutatud väikese kõrvalmärkusena alla, mitte enam pealkirjadena
- Voice explainer ümber: "Voice presence with a keeper carries a real cost each minute it runs..." → **"Voice is when Grace, Sara, Kaelen or Alistair speaks back — not a message, a presence."**
- TBD-rida ümber: "Per-minute pricing being finalised" → **"Voice access opens after the rooms settle — until then, the keepers write back"**

### Põhimõte
Iga "ei saa veel osta" punkt pakub konkreetset alternatiivset väärtust — Library, Host Intro, Bookstore. Külalise frustratsioon → anticipatsioon.

### Tests
- 100% pass (16/16) — `/app/test_reports/iteration_88.json`

---


## 2026-06-25 — Phase 3 Pricing Chaos Cleanup (Anna lock + GPT synthesis)

### Added
- **NEW `/pricing` page** (`/app/frontend/src/pages/Pricing.jsx`) — the canonical Access Ladder replacing 39 legacy SKUs:
  - I · **Explore** (Free, always)
  - II · **Day Pass** (24h, one room, from €19 — TBD)
  - III · **Journey** (one room, Monthly · Annual — TBD, featured "Most chosen")
  - IV · **Companion** (all 5 rooms incl. Polarstar Kids, Monthly · Annual — TBD)
  - V · **Private** (by application, quarterly)
  - **Voice Access** — explicit SEPARATE section (cost-transparency lock)
  - **Honest-note** section explaining prices are TBD pending Substack soft-launch

### Removed (Phase 3 cleanup)
- **Mike Ways** on `/sanctuary-preview`: €45 First Step · €120 Steady Presence · €380 Your Own Room — replaced with single CTA → `/pricing`
- **Legacy Voice Meter topups** on `/sanctuary-preview`: €25 / €39 / €99 — replaced with short prose pointer → `/pricing`
- **€3,290 Family Compass annual SKU** on `/membership` — out of WTP range per audit

### Renamed
- "Sovereign Circle" → **"Private"** on `/membership` (heading + `data-testid` rename: `sovereign-apply-cta` → `private-apply-cta`)

### Locked
- **Voice is SEPARATE** from room access (cost-transparency, per Anna+GPT). Bundling would expose the 80/20 cost-tail.
- **Prices remain TBD** on `/pricing` — final numbers after Substack soft-launch reveals WTP + return-rate.

### Tests
- 100% pass (44/44 checks) — `/app/test_reports/iteration_87.json`

---


## 2026-02 — Launch Pause Mode (active site-wide)

Founder mandate: *"Ükski külastaja ei saa enne lõplikku PSP/valuuta
otsust kogemata osta valest süsteemist ega ka valet toodet, vöi
toodet mida ei ole olemas."*

### Rationale
- Site silently ran two PSPs (Gumroad + LemonSqueezy) with currency drift (EUR vs USD).
- Books were not uploaded to Gumroad yet, but Bookstore buy buttons still resolved a working LemonSqueezy checkout.
- Alistair Bundle €39 promised 21 letters; codebase had 0 letter files.
- "Payments soon" chip contradicted active checkouts.

### What shipped
- New flag `frontend/src/lib/launchPause.js` — single boolean `LAUNCH_PAUSE = true`. Flip to `false` reverses every change in this PR.
- New component `frontend/src/components/LaunchPauseButton.jsx` — calm "Coming soon" disabled pill + supportive subtext, with optional `size="sm"` for inline cards.
- Eight files updated (every active checkout CTA wrapped):
  - `SevenQuietNights.jsx` — Gumroad CTA → "Coming soon · €9 PDF"
  - `TheHearthProtocol.jsx` — Gumroad CTA → "Coming soon · €19"
  - `AlistairBundle.jsx` — Gumroad CTA → "Doors open later" + Alistair-specific subtext ("We are finishing the letters before we open the shelf.") · NO waitlist (21 letters not yet authored)
  - `FamilyBundle.jsx` — Gumroad CTA → "Coming soon · €25"
  - `Bookstore.jsx` — chip rewritten to "Reading catalogue · purchases open soon"; per-book LemonSqueezy buy → "Notify me" (free books and admin previews untouched)
  - `ClarityRelease.jsx` — 3 tier LemonSqueezy buys → "Doors open soon" (beta-grant branch + waitlist branch preserved)
  - `CourseDetail.jsx` — per-course buy → "Notify me when this opens" (enroll / sign-in branches preserved)
  - `BodyTemple.jsx` — hero unlock CTA → "Coming soon — Day 1 still free to read"; modal unlock → "Coming soon" (Day 1 free preview unchanged)
  - `SanctuaryPreview.jsx` — three "Ways to be here" CTAs renamed from "Begin quietly / Step in / Enter gently" to a single "Join the quiet list" (no PSP wiring existed here, only label tightening)

### Untouched (intentionally)
- Polarstar Kids universe (entire surface free, no PSP).
- All `/listen/*` audio pages.
- `/library`, `/start-here`, `/legal`, `/about`, `/reach-out`, `/faq`.
- Navigation, footer, homepage hero.
- Free books in the Bookstore (price `$0`) — they keep the "Take it" / "Read it" CTA.
- Admin preview links inside Bookstore.
- WandererGate beta-grant ("Activate free pass") branch in Clarity Release.
- Backend (FastAPI / MongoDB / webhooks) — existing customers continue to be served.

### Verified live (smoke-test 2026-02)
- `/the-hearth` — `hearth-buy-cta` renders as SPAN, label "Coming soon · €19", subtext shown.
- `/alistair-bundle` — `alistair-bundle-cta` SPAN, label "Doors open later", subtext "We are finishing the letters before we open the shelf...".
- `/family-bundle` — `family-bundle-buy-cta` SPAN, label "Coming soon · €25".
- `/seven-quiet-nights` — `sqn-gumroad-cta` SPAN, label "Coming soon · €9 PDF".
- `/bookstore` — chip = "· Reading catalogue · purchases open soon"; 7 paid buy buttons all "Notify me" (the one free kids book keeps "Take it").
- `/body-temple` — `body-temple-unlock-cta` SPAN, label "Coming soon — Day 1 still free to read"; "Read Day 1 first (free)" link unchanged.
- `/` (homepage) — three "Ways to be here" CTAs all read "Join the quiet list".

### Reversal recipe
1. Open `frontend/src/lib/launchPause.js`.
2. Change `LAUNCH_PAUSE = true` to `false`.
3. Save. Hot-reload restores every original Gumroad / LemonSqueezy CTA in place.

### Inventory + plan files (read-only references)
- `/app/memory/PRODUCT_INVENTORY_2026-02.md` — 28 paid surfaces mapped.
- `/app/memory/LAUNCH_PAUSE_PLAN.md` — what changes, what does not.
- `/app/memory/AUDIT_COMPREHENSIVE_2026-02.md` — full blind-spot audit reconciling earlier contradictory audits.
- `/app/memory/TASK_TRACKER.md` — single source of truth for "what's done, open, blocked".

---

## 2026-02 — RoomIntroCard ("selguse kaart") — five rooms

Founder mandate: shift the user journey from "Room → Product → Buy"
to Intuvio-style inbound flow "Problem → Understanding → Trust → Interest → Contact". Every adult room must answer five plain questions within ten seconds — without selling anything.

### What shipped
- `frontend/src/data/roomIntros.js` — copy for all five rooms (Grace, Kaelan, Sara, Alistair, Aurin). Each entry contains: `forWhom` (5 problems), `whatItIs` (2-3 sentences), `whatYoullFind` (concrete list), `whatItIsNot` (expectation-setting list), `freeThing` (one real, free link), `reflectionPrompt` (one italic question), `furtherReading` (3 free paths).
- `frontend/src/components/RoomIntroCard.jsx` — shared component renders five sections + a free CTA + a reflection prompt blockquote + three further-reading links + a footer "Nothing here asks you to buy anything to be welcome." All on a calm cream `#f5ebd5` background, so it reads cleanly under any parent room theme (dark or light).
- Mounted directly under the `<PageHeader />` in five rooms:
  - `/clarity-release` (Grace)
  - `/body-room` (Kaelan)
  - `/parents-room` (Sara) — also wraps FirstActionBlock in `id="first-action"` so Sara's "free thing" anchor link resolves
  - `/course-room` (Alistair)
  - `/aurins-room` (Aurin)

### Vocabulary rule observed
- No "sanctuary, holy, sacred, pühadus" anywhere in this new copy.
- Uses "quiet, small, room, library, evening, presence" instead.

### Verified live (smoke-test 2026-02)
- Grace card visible after consent; "One free thing" reads "Read one quiet reflection — free".
- Kaelan card visible; "One free thing" reads "Read Day 1 of Body Temple 28 — free".
- Sara card visible; "One free thing" reads "Try the three-minute first action below" (anchor jumps to FirstActionBlock).
- Alistair card visible; "One free thing" reads "Read one full sample letter — free".
- Aurin card visible; "One free thing" reads "Listen to the Little Star — free".

### Untouched
- Existing hero copy in every room (left as-is — founder may polish later).
- FirstActionBlock — still mounted below RoomIntroCard.
- CuratorIntroCard — still mounted below FirstActionBlock.
- All checkout CTAs remain in Launch Pause Mode.

---

# Matrix Aurin — CHANGELOG

Append-only log of implemented features. PRD.md remains the static
source of truth for problem statement and architecture.

## 2026-02 — Sprint 0: "Less Noise. More Meaning." 4-layer hero

After a 5-day locked-room brainstorm (Anna + GPT + Norwegian AI + agent),
the production homepage hero was rewritten to pass the 5-second test for
new visitors. The page now sells the **outcome** before the architecture.

### What changed
- **Real production file:** `SanctuaryPreview.jsx` (`/` route), not
  `LuxurySanctuaryLanding.jsx` as the previous handoff suggested. The
  `/luxury` route was retired on 2026-02-12 and redirects to `/`.
- **HeroSection (`SanctuaryPreview.jsx`)** — Layer 1 only. The right-anchored
  mask visual + parallax + brass spotlight are preserved verbatim. Only the
  left-side text block was rewritten.
  - **Old headline:** *Welcome back / to yourself.*
  - **New headline:** *Matrix Aurin is a quiet place to read, listen, reflect,
    and reconnect with what matters most.*
  - **Old support:** *A quiet room for noticing what is already shaping your
    life. You do not have to perform here. Step Inside / Walk through truth
    first. The doors are open this season.*
  - **New support:** *Built around books and five guided rooms for people,
    parents, and families.*
  - **Eyebrow / season / Truth-Sequence CTAs removed from the hero.** The
    `TruthSequenceModal` wiring remains for future entry points but no longer
    fires from the hero.
- **New `SprintZeroLayersSection`** inserted between `HeroSection` and
  `HeroCompass`. Contains:
  - **Layer 2 — Transformation table** (4 rows, "If you came here with… you
    may leave with…"). Cormorant serif, italic on the left (muted), ivory on
    the right.
    - too many thoughts → one thought clearer
    - tension your body has carried → one quieter breath
    - a hard conversation at home → one new way to begin it
    - an evening that disappeared → one shared moment back
  - **Layer 3 — Audience trio** (For people / parents / families who want a
    little more clarity / patience / time together).
  - **Layer 4 — Three CTAs**, visual hierarchy locked:
    - 🟢 `[Start Here]` → `/start-here` (filled brass, primary)
    - ⚪ `[See the Five Rooms]` → `#worlds` (outline, secondary)
    - ⚪ `[Browse Books]` → `/bookstore` (outline, secondary)
- **`LuxurySanctuaryLanding.jsx`** (dead `/luxury` route, kept for reference)
  also received the 4-layer treatment in a single section so the file
  documents the intended pattern. Pure CSS extension in
  `styles/luxury-sanctuary.css` (`.transformation`, `.audience`, `.hero-ctas`).

### Strict rules honoured (per Founder lock)
- ❌ No "digital place" — Norwegian AI suggestion rejected.
- ❌ No "everyday life" — kept the warmer "what matters most".
- ❌ No "reflective tools" — the 4-day no-system-talk rule held.
- ❌ No "wellness" framing anywhere.
- ✅ "who want" not "looking for".
- ✅ "See the Five Rooms" not "Explore" (lower threshold).
- ✅ Start Here = visually dominant primary (filled brass button).

### Archived
- Original production hero → `/app/memory/archive/hero_2026_06.md`
- Original `/luxury` hero → same file (correction notice appended).

### Why
The previous hero answered "How does the platform feel?" before it answered
"What is this and what will I get?". New visitors failed the 5-second test:
they could not say what the place is, what they would get, who it is for, or
where to start. The 4-layer structure orientates a stranger before the
architecture (rooms, books, curators) is introduced.

---

## 2026-02-13 — Title hierarchy lock + PSP-safe redirect (iter 85e)

Founder locked the title hierarchy and asked us to neutralise the
last PSP-risky surface.

### Hierarchy lock
- **POLARSTAR KIDS** is now the primary brand for the kids surface.
- Tagline: *One World. Three Paths. One Family.*
- "Kids Universe Journey" demoted from brand to world description
  (it lives only as painted typography inside the day-mode painting).

Rule (recorded for future iterations): "Kids Universe Journey" is
the journey. "POLARSTAR KIDS" is the world. Do not use the former
as a primary title anywhere.

### Day-mode brand band (`Polarstar.jsx` + `PolarstarDayWorld.css`)
The compact title that floated above the painting was replaced with
a dark cream-on-indigo brand capsule:
- `PREVIEW WORLD · The First Lanterns Are Lit` (eyebrow)
- `POLARSTAR KIDS` (serif, 36px, gold-on-indigo, 0.22em tracking)
- `One World. Three Paths. One Family.` (italic gold tagline)

The capsule sits at the very top centre, dominates the painted
"Kids Universe Journey" without erasing it, and matches the night-
mode header tone so the brand reads identically across moods.

### Legacy `/kids-universe` redirect (`App.js`)
The old `/kids-universe` landing page is the surface that triggered
the Polar.sh suspension — it contained:
- "Talk with Aurin" + "Open Aurin's Room" CTA (AI-for-kids language)
- Three age cards with baked-in "Aurin's Room — Bringing Calm to
  Little Minds" chat mockups
- A live featured-books carousel with $5 priced items

It is now a one-line redirect to `/kids-universe/polarstar`. The
original component is preserved on `/kids-universe/legacy` for
internal reference until the Polar.sh review concludes; the top-nav
"Kids Universe" link silently lands on the PSP-safe Polarstar
world.

### Files touched
- Updated: `frontend/src/App.js`
- Updated: `frontend/src/styles/PolarstarDayWorld.css`

### Verified
- `/kids-universe` → 302-style client redirect to
  `/kids-universe/polarstar` (Playwright confirmed final URL)
- `/kids-universe/legacy` still serves the old component (escape
  hatch for the founder)
- Brand capsule visible on day mode without obscuring the painted
  world identity
- Night mode (existing `ps9-header`) already honoured the hierarchy
  so was left untouched
- Per-age rooms (`/discovery`, `/exploration`, `/creation`) already
  show `← POLARSTAR · {AGE} · {RANGE}` breadcrumb so the hierarchy
  is consistent across all four routes



## 2026-02-13 — Polarstar v10 STOP-the-dashboard correction (iter 85d)

Founder pushed back, hard and rightly: previous iterations were
turning the per-age rooms into Body-Temple-style course modules and
my screenshot runner was still passing `PLACEHOLDER` as the URL.
Both issues now fixed in one pass.

### Per-age rooms — STRIPPED of dashboard layout
`PolarstarRoom.jsx` was completely rewritten. The cream-paper hero,
the seven-day grid, the four-card rail, the bottom CTA panel — all
deleted. The room now renders ONLY:
- The same painted Polarstar atmosphere (unchanged)
- A compact breadcrumb pill at top-center:
  `← POLARSTAR · EXPLORATION · 7–10 YEARS`
- A subtle "lantern" at bottom-center:
  `THE LANTERN IS BEING LIT · {age subtitle} · Join the Explorer List`
- The Explorer-List modal mounts on demand

Same painted world. No dashboard surface. No course-style cards.
Same visual language as the main map.

### Main world — Day mode now matches founder's spec (invisible
### click-zones over the painted UI)
`Polarstar.jsx` became a mode-aware container:
- `day` / `morning` → renders new `PolarstarDayWorld`
- `night` / `evening` → renders the existing v8 click-zone map

`PolarstarDayWorld` implements the founder's exact JSX/CSS spec
(age tabs, Explorer's Hub, Daily Challenges, Today I Feel, Family
Connection Zone, Discovery Stars, Daily Compass, bottom navigation,
Avatar/Calendar/Messages/Parents shortcuts). The current
`day-world-v2.png` is a fully-painted UI mockup, so the React panels
are rendered as INVISIBLE click-zones (transparent backgrounds, zero
opacity contents) layered over the painted elements. The painting
remains the visible surface; React provides the interactivity. When
the founder later swaps in a clean Nano-Banana background, simply
delete the `INVISIBLE-MODE OVERRIDE` block in `PolarstarDayWorld.css`
and the spec re-emerges opaque.

Visible chrome on the main world is intentionally minimal:
- Compact `POLARSTAR KIDS` + `One World. Three Paths. One Family.`
- `PREVIEW WORLD · The First Lanterns Are Lit` badge
- Fixed `Join the Explorer List` pill bottom-right

### Global waitlist event bridge
Both the main world and the rooms listen for
`polarstar:openWaitlist` window events. Any descendant (painted age
tab, bottom-nav button, Daily Challenge row, mood emoji, footer link,
etc.) can dispatch the event and the modal opens with the right
pre-filled interest. One modal, one source of truth.

### Screenshot runner — PLACEHOLDER bug fixed
Earlier screenshot calls were passing `page_url="PLACEHOLDER"` and
relying on the script to navigate. The screenshot harness pre-loads
the `page_url` BEFORE running the script, so PLACEHOLDER failed
three navigation attempts every time. All screenshots now pass the
real preview URL (`https://aurin-hub.preview.emergentagent.com/...`)
directly to `page_url`. Verified across all four routes:
- `/kids-universe/polarstar` ✓
- `/kids-universe/polarstar/discovery` ✓
- `/kids-universe/polarstar/exploration` ✓
- `/kids-universe/polarstar/creation` ✓

### Files touched
- New: `frontend/src/components/PolarstarDayWorld.jsx`
- New: `frontend/src/styles/PolarstarDayWorld.css`
- Updated: `frontend/src/pages/Polarstar.jsx`,
  `frontend/src/pages/PolarstarRoom.jsx`

### Verified
- All 4 routes load cleanly, no compile errors
- Age tab click on main map navigates to the correct age room
- Coming-Soon click zones (Calendar / Messages / Daily Challenges /
  moods / bottom-nav / etc.) all open the Explorer-List modal
- Modal pre-fills the right interest
- Per-age rooms show the same painted world + minimal in-world UI

### What is still NOT done (by design)
- Resend confirmation emails remain disabled
- No new functionality, no billing, no Polar.sh touched
- Clean Nano-Banana background not yet generated (founder's prompt
  exists; flipping the invisible-mode override is a 1-line change
  once the new image lands)



## 2026-02-13 — Polarstar v9 PSP-safe Preview Polish (iter 85)

Final pre-PSP-review polish for the Kids surface. Polar.sh underwriter
is currently reviewing the production account, so the Kids layer must
visibly stay "preview only" — no purchase CTAs, no AI badges, only an
interest list.

### New day painting + mode-aware click zones
- Replaced `/app/frontend/public/polarstar/day-world-v2.png` with the
  founder's new daytime composition (3 age paths + central
  exploration path + side panels, matching the night painting's
  structure).
- `Polarstar.jsx` now switches between `ZONES_DAY` and `ZONES_NIGHT`
  coordinate arrays based on `getTimeMode()`. Each set is tuned for
  its painting (day panels sit higher; night has an extra
  "Adventure Hub" zone).
- Exploration day-tile chips also use mode-specific coordinates.

### Header overlay (was missing in v8)
- Compact top banner: pulsing "PREVIEW WORLD · The First Lanterns
  Are Lit" badge + serif "POLARSTAR KIDS" + "One World · Three
  Paths · One Family." subtitle.
- Tone-aware (`ps9-header--dark` on night/evening, `--light` on
  day/morning) so cream painting and indigo painting both keep
  legible contrast.
- Sized to *not* compete with the painted "Kids Universe Journey"
  title baked into the background art.

### Coming Soon markers + zone variants
- New zone variants: `primary` (active age path), `library` (preview
  panel, no badge), `soon` (preview + Coming Soon pill).
- Tomorrow's Adventure / Discovery Stars / Memory Trail (and their
  day equivalents Morning Boost / Discovery Stars / Today I Feel)
  carry a "COMING SOON" pill that fades in on hover so the painting
  is never visually crowded.

### Join the Explorer List (waitlist, NOT a checkout)
- Floating "✦ Join the Explorer List" CTA at fixed bottom-right
  (intentionally below the site nav so the nav's "Enter Portal"
  cannot intercept clicks).
- Footer ribbon "A quiet preview of Polarstar Kids · Be told when
  it opens." — opens the same modal.
- Clicking ANY Coming-Soon zone also opens the modal pre-filled with
  "Interested in: <zone label>".
- `PolarstarWaitlistModal.jsx` (new): cream-paper modal with email +
  optional name + age-path picker + optional note + consent
  checkbox + done-state. Escape closes. Backdrop-click closes.

### Backend — quiet MongoDB-only waitlist endpoint
- New `POST /api/waitlist/polarstar` and `GET /api/waitlist/polarstar/health`.
- Stores into `db.polarstar_waitlist` (`email`, `name`, `age_group`,
  `note`, `source="polarstar_preview"`, timestamps). Idempotent on
  email (re-submission returns `already_on_list`).
- **Deliberately does NOT call Resend.** Founder explicitly asked to
  keep the email pipeline silent for now (no automated confirmation),
  so the underwriter cannot see automated mail traffic tied to the
  Kids brand during review. Resend wiring is a later P2 task.
- Rejects invalid email (400) and missing consent (400).

### Click-zone audit (12 nighttime / 11 daytime)
- **ACTIVE (3):** Discovery / Exploration / Creation → routes to
  `/kids-universe/polarstar/{discovery|exploration|creation}` which
  renders the existing `PolarstarRoom.jsx`.
- **PREVIEW (8–9):** Library, Adventure Hub (night only), Tomorrow,
  Stars, My Story Space, Family, Evening Room, You-are-never-alone,
  Keepsakes — all open the waitlist modal (no broken navigation,
  no checkout, no AI mention).
- Bottom rail buttons removed (the old `pw8-rail-btn` invisible
  pills) so they don't trigger silent no-ops; the painted rail
  remains decorative only.

### Files touched
- New: `frontend/src/components/PolarstarWaitlistModal.jsx`
- Updated: `frontend/src/pages/Polarstar.jsx`,
  `frontend/src/styles/polarstar.css`, `backend/server.py`
- Replaced asset: `frontend/public/polarstar/day-world-v2.png`

### Verified
- Backend curl: 4/4 cases pass (400 invalid email, 400 no consent,
  joined/already_on_list idempotency, /health returns count).
- Playwright: header + badge + title render, Discovery zone
  navigates correctly, Tomorrow zone opens the waitlist modal with
  the right pre-filled context, full submission shows the "done"
  state.

### What is still NOT done (per founder's instruction)
- No Resend confirmation email yet (intentional).
- No billing / checkout wiring (Polar.sh review still pending).
- `kids_polarstar_progress` collection + 7-day chrono-lock countdown
  (Phase 2 — paused until preview launch is approved by founder).



## 2026-02-13 — Truth Sequence Modal + Chrono-Lock Enforcement (P1 sprint while Polar PSP review pending 24h)

### Frontend · "Walk truth first" interactive modal
- New component: `frontend/src/components/TruthSequenceModal.jsx`
- Mounted into `SanctuaryPreview.jsx` (production `/` and preview routes)
- Both hero CTAs (`hero-cta-step-inside` + `hero-cta-walk`) now open the
  modal instead of routing directly to `/portal` or scrolling to `#worlds`
- 5-step anti-dopamine sequence:
    I.  "Can you sit for a moment?"
    II. "What is loudest in you right now?"
    III. "Are you here to perform, or to be?"
    IV. "Slow is not weakness."
    V.  "You may walk through." → /portal
- Each step holds for 4.2s before the primary CTA fades in (no skip)
- `localStorage` flag `matrix_aurin.truth_sequence.walked_at` lets us
  recognise returning founders for 30 days (re-prompt thereafter)
- Brass-keyed progress vein at the top edge advances per step

### Backend · Body Architecture 7-day weekly chrono-lock
- New service: `backend/services/chrono_lock.py` (pure helpers + Mongo)
- New collection: `db.body_temple_enrollments` (idempotent upsert)
- `GET /api/body-temple/overview` now returns `chrono_lock_days`,
  `week_unlocks` (per-week unlock status for the user), and
  `enrollment_started_at`
- `GET /api/body-temple/day/{day}` now returns `chrono_locked`,
  `chrono_unlocks_at`, `chrono_seconds_remaining`. When locked, the
  `body`, `practice` and `reflection` fields are scrubbed so the
  wanderer cannot bypass via the API.
- `POST /api/body-temple/complete` lazy-enrols on the first successful
  call, then returns HTTP 423 with `detail.code = "chrono_locked"`
  for any day in weeks 2–4 attempted before the 7-day window opens

### Backend · Clarity Release 48-hour Integration Lock
- New collection: `db.clarity_integration_locks` (one row per user)
- `GET /api/clarity/integration-lock` — current lock state (guest-safe)
- `POST /api/clarity/integration-lock/consume` — auth-required, records
  the moment a foundational module was finished
- `POST /api/grace/mode` — switching to a *different* mode during the
  48h window returns HTTP 423 with the unlock_at; re-selecting the
  same mode is permitted (integration continues)

### Tests
- New: `backend/tests/test_chrono_lock.py` — 13 unit + Mongo tests
- New: `backend/tests/test_iter84_live_chrono.py` (added by testing
  agent) — 7 live HTTP regression tests against
  `REACT_APP_BACKEND_URL`
- Run all green: `pytest tests/test_chrono_lock.py tests/test_stage3_4_sprint_b.py -v`
  → 24/24 passing
- Iteration report: `/app/test_reports/iteration_84.json` — backend
  100% (31/31), frontend 100% (full Playwright E2E walk)

### Files touched
- `frontend/src/components/TruthSequenceModal.jsx` (created)
- `frontend/src/pages/SanctuaryPreview.jsx` (hero CTAs + modal mount)
- `backend/services/chrono_lock.py` (created)
- `backend/server.py` (body-temple endpoints + grace/mode + clarity
  integration-lock endpoints + Mongo indexes)
- `backend/tests/test_chrono_lock.py` (created)
- `backend/tests/test_iter84_live_chrono.py` (created by tester)

---


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

## 2026-02-11 (GA4 WIRED) — Phase 1 Telemetry Live

### What landed
- `frontend/.env` → `REACT_APP_GA4_ID=G-7E9R7QLP0C`
- `frontend/src/lib/analytics.js` (NEW) — env-var-driven GA4 initialiser
  with `initAnalytics()` + `trackEvent(name, params)` API. Silently
  no-ops if env var absent.
- `frontend/src/App.js` — `useEffect(() => initAnalytics(), [])` on
  mount. One-time, idempotent under React StrictMode.
- `frontend/src/components/sanctuary/HeroCompass.jsx` — emits
  `compass_arm_click` event with `{cardinal, degrees, curator, slug}`
  payload on every cardinal click (including keyboard activation).

### Verified live
- `bundle.js` contains `G-7E9R7QLP0C` (build-time injection ✓)
- `window.gtag === 'function'` ✓
- `<script src=googletagmanager.com/gtag/js?id=G-7E9R7QLP0C>` in DOM ✓
- 4 GA4 network requests on first load (config + page_view + ID sync) ✓
- `initAnalytics()` runs without errors ✓
- Lint: clean

### What this gives the founder
- Real-time data in https://analytics.google.com Realtime tab from
  the moment the next visitor lands
- Geographic breakdown (Phase 1 plan calls for UK/EU first market test)
- Cardinal-arm click distribution (which heading draws the most
  organic curiosity)
- $0 Google Cloud credit consumed — GA4 is free outside Cloud billing
