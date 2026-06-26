# Phase A.4 — Read-Only Blind Spot Audit
**Date:** 2026-02 (forked session continuation)
**Mode:** READ-ONLY · no code changes
**Investigator scope:** Polarstar ID-mismatch · `/portal` · `/bookstore`

---

## TL;DR (executive)

| Suspected issue | Verdict | Severity |
| --- | --- | --- |
| Polarstar Kids ID-mismatch leads users to 404s | **FALSE ALARM** — `polarstarAgeGroups.js` is dead code. Real UI reads `polarstarContentMap.js`. All routes resolve. | LOW (cleanup only) |
| `/portal` is a dead end for new visitors | **PARTIAL** — not a 404, but very cold landing (auth wall + $39 upsell + 3 placeholder cards). Mismatch with the warm homepage CTAs. | MEDIUM |
| `/bookstore` is empty / "0 titles" | **FALSE ALARM** — 8 real books returned from `/api/books`, grid renders, most have LemonSqueezy variant IDs. But the page header chip still says **"· Payments soon"** which contradicts the real checkout state. | MEDIUM (label drift) |

**Net conclusion:** the previously assumed crisis (broken Polarstar journey, empty bookstore) is not real. The real problems are smaller and editorial:
1. `polarstarAgeGroups.js` is unused dead code that confuses any future contributor.
2. `/portal` (the destination of 5+ homepage CTAs) is colder than the homepage promises.
3. `/bookstore` header label `Payments soon` contradicts the actually live LemonSqueezy variants.

Decision needed from founder before any code change.

---

## 1. Polarstar ID-mismatch — investigated

### What the previous note said
> `polarstarAgeGroups.js` button IDs (`bedtime`, `calm`, `myworld`, …) do not match `polarstarContentMap.js` IDs (`story-time`, `play-move`, …). Users might hit 404s.

### What is actually wired up

`grep -rn "polarstarAgeGroups" src/` returns ONE match — the file itself. No page, no component, no router imports it.

`polarstarContentMap.js` is imported by:
- `pages/PolarstarRoom.jsx` (the room shell users land on)
- `pages/PolarstarActivity.jsx` (the leaf content page)
- `pages/PolarstarStoryRead.jsx` (story reader)
- `components/PolarstarDayWorld.jsx` (day-mode overview)

So the IDs the user actually sees and clicks come from `polarstarContentMap.js`, NOT from `polarstarAgeGroups.js`.

### Live verification (Discovery room screenshot)

`GET /kids-universe/polarstar/discovery` rendered exactly **5 activity cards**, each one a real `<Link to=...>`:

| Card label (visible) | data-testid | href | Status |
| --- | --- | --- | --- |
| Story Time | `polarstar-activity-discovery-story-time` | `/kids-universe/polarstar/discovery/story-time` | live |
| Play & Move | `polarstar-activity-discovery-play-move` | `/kids-universe/polarstar/discovery/play-move` | live |
| Drawing Palette | `polarstar-activity-discovery-drawing-palette` | `/kids-universe/polarstar/discovery/drawing-palette` | **soon** (badge shown) |
| Kindness Mission | `polarstar-activity-discovery-kindness-mission` | `/kids-universe/polarstar/discovery/kindness-mission` | live |
| Morning Mindful Start | `polarstar-activity-discovery-morning-mindful-start` | `/kids-universe/polarstar/discovery/morning-mindful-start` | live |

All routes match `PolarstarActivity.jsx`'s `:roomId/:activitySlug` pattern AND are present in the contentMap. No 404.

### Verdict
- **No broken user journey in Polarstar.** The "ID-mismatch" was a static comparison of two unrelated files.
- `polarstarAgeGroups.js` is **dead code** (78 lines).
- The "missing" labels (Bedtime Stories, Calm Moments, My World, Gentle Learning, Creative Time, Draw Together, etc.) from the dead file were the OLD design's vocabulary. The new contentMap renamed them (Story Time, Play & Move, etc.) but the founder's narrative may still expect the old labels somewhere.

### Recommendations (do nothing yet — pending founder)
- (A) Delete `polarstarAgeGroups.js` after archiving to `/app/memory/archive/`.
- (B) Or: re-purpose its labels into a sub-grid (e.g. "Bedtime Stories" as a curated story-time filter) if the founder wants those words back.

---

## 2. `/portal` — investigated

### Live state (unauthenticated visitor)

`GET /portal` rendered:
1. `aurin-chip` "checking session…" → resolves to **signed-out** branch.
2. Hero copy: **"A small place that stays yours"** + body **"What you read, what you write, what you keep — held in one place. Enter your email below to receive a quiet access link."**
3. Magic-link email input + "Send a quiet link" button (`portal-magic-form`).
4. Privacy consent line (`portal-consent-line`).
5. `CycleBanner` — current marketing wave indicator (renders if backend returns active cycle).
6. **Body Temple 28 — Day 1 is free** wood card (`portal-body-temple-cta`) → `/body-temple?utm_source=portal`. Reads: *"$39 once, yours forever if you continue."* (USD — not EUR.)
7. Purpose section: *"Everything you need, in one place. … Books you've bought, what you've written, what you've returned to."*
8. **3 preview cards** (`portal-preview-0..2`) — My Content / My Progress / Account, each labelled `Placeholder` in the corner with skeleton bars (visibly unfinished).
9. Two trust cards at the bottom: "Forget my 18+ confirmation" + "Read the Legal · Responsibility".

### How many homepage CTAs land here?
At least 5 (per previous handoff). The homepage promises *clarity / better evenings / 3-minute action* — but the portal opens with **a login wall + a $39 upsell + three Placeholder skeletons**.

### Verdict
- Not a 404, not technically broken, but **emotionally cold**. The portal still acts as a member dashboard, while 5 homepage CTAs route here as if it were an onboarding entry.
- The "$39" line is also in **USD**, while the rest of the site is in **EUR** (Gumroad pricing) — small currency drift visible to wanderers.

### Recommendations (do nothing yet — pending founder)
- (A) Replace the magic-link-first hero with a **two-track choice for unauth visitors**: *"Already inside → enter email"* / *"New here → start with the 3-minute room"* linking to `/start-here`.
- (B) Demote/remove the Body Temple $39 wood card from the **unauth** view (it converts cold visitors poorly). Keep it for signed-in members only.
- (C) Replace the 3 "Placeholder" preview cards with a real value preview (e.g. an excerpt of *The Sock on the Stairs* or a 1-line read from each room).
- (D) Standardise currency to EUR on the $39 line (or switch globally to USD — pick one).

---

## 3. `/bookstore` — investigated

### Backend data state
`GET /api/books` returns **8 published books**:

| # | slug | title | audience | price | LemonSqueezy variant |
| --- | --- | --- | --- | --- | --- |
| 1 | `angels-story` | Angels' Story | kids | $5 | 1606247 ✅ |
| 2 | `beyond-the-matrix-i` | Beyond the Matrix | adult | (see API) | set ✅ |
| 3 | `the-night-angels-embrace` | The Night Angels' Embrace | kids | (set) | set ✅ |
| 4 | `engels-friends-2` | Engels' Friends 2 | kids | (set) | set ✅ |
| 5 | `angels-tales` | Angels' Tales | kids | (set) | set ✅ |
| 6 | `beyond-the-matrix-ii` | Beyond the Matrix II | adult | (set) | set ✅ |
| 7 | `the-language-of-angels` | The Language of Angels | adult | (set) | set ✅ |
| 8 | `you-dont-have-to-dance-to-anothers-tune` | You Don't Have to Dance to Another's Tune | adult | (set) | set ✅ |

All 8 are `published: true`. Most have `cover_image_url` pointing at `/api/books/cover/<slug>.jpg`.

### Live frontend rendering
- `bookstore-loading` disappears after fetch.
- `bookstore-empty` count = 0.
- Grid (`bookstore-grid`) renders all 8 cards (47 matching test-ids across the grid including buy/refund/preview elements).

### Visible contradictions
- Hero chip still reads **"· Payments soon"** (`bookstore-payments-chip`) — but actual book cards either link to LemonSqueezy checkout, or to the catalogue waitlist, depending on `freeAccess.active`.
- Founder note in PRD says **Gumroad** is the locked PSP, but the frontend buys via **LemonSqueezy** (`buildLemonCheckoutUrl`). This is a real architectural drift that the previous agent did not flag.
- Pricing displayed in **USD** (`Intl.NumberFormat("en-US", currency: "USD")`) — same currency drift as `/portal`.

### Verdict
- **Bookstore is not empty.** 8 real books are sold-ready.
- **But the labels lie:** the "Payments soon" chip + the PRD-claimed Gumroad-only payment model do not match what the buy button actually does (LemonSqueezy).
- The currency drift (USD on a Norway/EU-tax page tagged "0% VAT · Norway") will confuse buyers.

### Recommendations (do nothing yet — pending founder)
- (A) Decide the source of truth for PSP on the bookstore — Gumroad or LemonSqueezy. Then either flip the bookstore checkout to Gumroad (matches PRD) or update PRD + the "Payments soon" chip.
- (B) Remove the "· Payments soon" chip OR change it to "· Checkout via LemonSqueezy" (or whichever PSP is final).
- (C) Standardise currency display to EUR (or set per-book).

---

## Cross-cutting observations (bonus blind spots)

1. **Currency drift across the site.**
   - Homepage / Gumroad products → EUR (€7, €19, €39).
   - `/portal` Body Temple card → **USD** ($39).
   - `/bookstore` → **USD** (Intl `en-US` formatter).
   Confusing for any single visitor reading two pages.

2. **PSP drift.**
   - PRD locks Gumroad.
   - Bookstore buys are routed through `buildLemonCheckoutUrl(...)`.
   - The homepage 4-product set (`SevenQuietNights`, `TheHearthProtocol`, `AlistairBundle`, `FamilyBundle`) is Gumroad.
   The site is silently running two PSPs.

3. **`/start-here` is the ONE warm entry but is reached only via the homepage hero**, while 5+ homepage CTAs still land on `/portal`'s cold magic-link wall.

4. **Polarstar Day-World cards** (the painted day-mode panels) point to live activities in `polarstarContentMap.js` and are healthy.

---

## What this audit does NOT cover (deferred)

- Alistair Bundle 21-letter library status (founder paused this until A.4 was done).
- `/about` Anna page polish.
- "House" word audit across 24+ files (Sprint 6).
- FAQ / trust-proof component near Gumroad buttons.

---

*End of audit. No code was modified.*
