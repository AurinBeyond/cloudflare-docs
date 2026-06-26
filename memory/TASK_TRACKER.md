# Matrix Aurin — Internal Task Tracker
**Single source of truth for "what's done, what's open, what's broken"**
Updated: 2026-02 (forked session, Phase A.4)
Owner: agent + founder co-managed
Rule: do **not** delete entries — flip status only.

Legend:
- ✅ DONE & verified live
- 🟡 IN PROGRESS / partial / "needs polish"
- ⛔ BLOCKED (waiting on founder decision or external dep)
- 🔴 BROKEN / contradicts user-facing promise
- ⚪ NOT STARTED / backlog
- 🗑️ ARCHIVED / dead code

---

## SECTION 1 — Homepage & Onboarding (the warm front door)

| ID | Item | Status | Notes |
|---|---|---|---|
| 1.1 | Hero "Less Noise. More Meaning." (4-layer, outcome-first) | ✅ | Live in `HousePreview.jsx` |
| 1.2 | Transformation table (4 if-then rows) | ✅ | Sprint 0 |
| 1.3 | Audience trio (people / parents / families) | ✅ | Sprint 0 |
| 1.4 | 3 hero CTAs (`Start Here`, `See the Five Rooms`, `Browse Books`) | ✅ | Sprint 0 |
| 1.5 | `/start-here` funnel page (3 paths) | ✅ | Sprint 1+2 |
| 1.6 | Audio durations honest (6/6/2 min) | ✅ | Sprint 1 fix |
| 1.7 | "Step Inside" → "Continue Reading" + removed "back to yourself" | ✅ | Sprint 2 |
| 1.8 | FirstActionBlock (3-min prompt) injected in Grace / Kaelan / Sara rooms | ✅ | Sprint 4 |
| 1.9 | FAQ / trust-proof component near Gumroad checkout buttons | ⚪ | P2 backlog |
| 1.10 | "Default Product" recommendation to reduce choice fatigue | ⚪ | P3 backlog |

---

## SECTION 2 — Polarstar Kids (lead surface)

| ID | Item | Status | Notes |
|---|---|---|---|
| 2.1 | Polarstar main world (night + day modes) | ✅ | `Polarstar.jsx` |
| 2.2 | Discovery room — 5 cards routed to real content | ✅ | story-time, play-move, kindness-mission, morning-mindful-start live · drawing-palette "soon" |
| 2.3 | Exploration room — 7 cards routed to real content | ✅ | story-time, nature-quest, world-cultures, space-adventures, amazing-animals, science-lab, reflection-time |
| 2.4 | Creation room — 6 cards (4 live, 2 "soon") | 🟡 | code-studio + media-studio still "soon" placeholders |
| 2.5 | Play & Move 4-step journey w/ 18h cool-down | ✅ | `MovesJourney` in `PolarstarActivity.jsx` |
| 2.6 | `/listen/little-star` audio companion | ✅ | live, 2.3 MB mp3 |
| 2.7 | Polarstar Bedtime Stories PDF (€9 product) | ✅ | Gumroad SKU `fwqmha` on `prulesoul.gumroad.com` |
| 2.8 | `polarstarAgeGroups.js` (78 lines) | 🗑️ | DEAD CODE — not imported anywhere. Archive + delete after founder OK. |
| 2.9 | 7 night-time "day-pillar" buttons all pointing to /exploration | ✅ | Already removed in iter 86k (NAV-REPAIR) |
| 2.10 | Night map "Library / Adventure Hub / Story Stars / Evening Room" etc. | 🟡 | 9 zones still open the Explorer-List waitlist modal (no real destination). |

---

## SECTION 3 — Adult rooms (Grace / Kaelan / Sara / Alistair / Aurin)

| ID | Item | Status | Notes |
|---|---|---|---|
| 3.1 | Grace — `/clarity-release` page | ✅ | FirstActionBlock added |
| 3.2 | Kaelan — `/body-room` | ✅ | FirstActionBlock added |
| 3.3 | Sara — `/parents-room` | ✅ | FirstActionBlock added |
| 3.4 | Aurin — `/aurin` chat & story world | ✅ | Long-running |
| 3.5 | Alistair — `/alistair-bundle` €39 sales page | 🟡 | Sales page live, copy locked. **No letter content authored yet.** |
| 3.6 | **Alistair "21 letters · 24h cadence-lock"** promise backing | ⛔ | Promised 7+7+7 letters across 3 sequences; codebase has 0 letter files. Refund-risk if sold today. |
| 3.7 | "House" word cleanup across 24+ files (Sprint 6) | ⚪ | Plain-English / quiet-room terminology |

---

## SECTION 4 — Products / monetisation

### 4a. Currency policy (NEW — user request 2026-02)
| ID | Item | Status | Notes |
|---|---|---|---|
| 4a.1 | Customer can choose USD or EUR at checkout | ⚪ | Founder request. Needs design + a currency-toggle component near every price. |
| 4a.2 | Site-wide currency state (localStorage + URL param) | ⚪ | Needs spec |
| 4a.3 | Update price display in `Bookstore.jsx`, `UserPortal.jsx` (Body Temple), `SevenQuietNights.jsx`, `TheHearthProtocol.jsx`, `AlistairBundle.jsx`, `FamilyBundle.jsx` | ⚪ | Touch many files |

### 4b. Payment Service Providers (PSP)
| ID | Item | Status | Notes |
|---|---|---|---|
| 4b.1 | Gumroad — Seven Quiet Nights (€7, SKU `fwqmha`) on `prulesoul.gumroad.com` | ✅ | live |
| 4b.2 | Gumroad — The Hearth (€19, SKU `the-hearth`) on `aurinbeyond.gumroad.com` | ✅ | live |
| 4b.3 | Gumroad — Alistair Bundle (€39, SKU `alistair-bundle`) on `aurinbeyond.gumroad.com` | 🟡 | sales page live, content gap (see 3.6) |
| 4b.4 | Gumroad — Family Bundle (SKU `vjurjm`) on `aurinbeyond.gumroad.com` | ✅ | live |
| 4b.5 | **Two Gumroad accounts** (`prulesoul` + `aurinbeyond`) | 🟡 | Founder to unify when convenient — agent cannot do this via code. |
| 4b.6 | LemonSqueezy still wired into `/bookstore` (`buildLemonCheckoutUrl`) | 🔴 | Contradicts PRD "Gumroad-only" lock. **Bookstore books NOT yet uploaded to Gumroad** (per founder, 2026-02). |
| 4b.7 | PRD § "Gumroad locked as single PSP" needs update OR Bookstore needs to be flipped to Gumroad | ⛔ | Founder decision needed |

### 4c. Bookstore
| ID | Item | Status | Notes |
|---|---|---|---|
| 4c.1 | 8 books in MongoDB (`/api/books`) all `published: true` | ✅ | Backend ready |
| 4c.2 | Books seeded with LemonSqueezy variant IDs | 🔴 | Variants present but founder has **not** loaded books into Gumroad → if PRD says Gumroad-only, current buy buttons send users to a PSP we don't operate live. |
| 4c.3 | Hero chip "· Payments soon" on `/bookstore` | 🔴 | Label lies. Buy buttons actually link to LemonSqueezy checkout. |
| 4c.4 | Currency display = USD `Intl.NumberFormat("en-US")` | 🟡 | Will be replaced when 4a.1 (USD/EUR toggle) ships |
| 4c.5 | Per-book detail page `/bookstore/:slug` | ✅ | renders from API |

---

## SECTION 5 — `/portal` user destination

| ID | Item | Status | Notes |
|---|---|---|---|
| 5.1 | Magic-link email auth flow | ✅ | live |
| 5.2 | Body Temple 28 wood card (Day 1 free, $39) | 🟡 | shown to unauth visitors too cold; price in USD |
| 5.3 | 3 "Placeholder" preview cards (My Content / My Progress / Account) | 🔴 | Marketing skeletons shown to new visitors — visibly unfinished |
| 5.4 | 17+ internal CTAs route to `/portal` (homepage hero, kids journey, navigation, the-beginning, body-temple etc.) | 🟡 | High traffic destination — needs warming for unauth visitors |
| 5.5 | Two-track unauth landing ("Already inside" / "New here → /start-here") | ⚪ | Proposed redesign |
| 5.6 | WandererGate consent re-asks for authenticated users every session | 🟡 | Backend reads only `visitor_id`, ignores `user_id` |

---

## SECTION 6 — The Hearth Protocol (5-story bundle)

| ID | Item | Status | Notes |
|---|---|---|---|
| 6.1 | Sales page `/the-hearth` | ✅ | live, €19 Gumroad |
| 6.2 | Story 1 — The Sock on the Stairs (audio + page) | ✅ | mp3 + `ListenSockOnStairs.jsx` |
| 6.3 | Story 2 — The Light in the Hallway (audio + page) | ✅ | mp3 + page exist |
| 6.4 | Story 3 — The Coat on the Chair (audio + page) | ✅ | mp3 + page exist |
| 6.5 | Story 4 — The Window Left Open (audio + page) | ✅ | mp3 + page exist |
| 6.6 | Story 5 — The Garden in November (audio + page) | ✅ | mp3 + page exist |
| 6.7 | `/listen/hearth` index page | ✅ | `ListenHearthIndex.jsx` |

**Verdict:** Hearth is the **most commercially-ready product** on the site.

---

## SECTION 7 — Legal / trust / compliance

| ID | Item | Status | Notes |
|---|---|---|---|
| 7.1 | `/legal` real GDPR + Refund + Norway law page | ✅ | rewritten this session |
| 7.2 | `info@prulesoul.site` contact | ✅ | matched |
| 7.3 | `@pruesoul.life` (missing 'l') on `/reach-out` | ⛔ | Awaiting founder confirmation: typo or real IG handle? |
| 7.4 | Plausible analytics active | ✅ | embedded in `index.html` |

---

## SECTION 8 — Backend / infra

| ID | Item | Status | Notes |
|---|---|---|---|
| 8.1 | FastAPI + MongoDB stack | ✅ | running |
| 8.2 | `/api/books` returns 8 books | ✅ | |
| 8.3 | `/api/hearth-funnel/subscribe` | ✅ | tracking opt-ins |
| 8.4 | Production deploy gap (preview ≠ live) | 🟡 | Several updates only in preview |
| 8.5 | `[FIN-SPLIT]` financial engine v2 | ✅ | dry-run green |
| 8.6 | LemonSqueezy live billing switch (`SESSION_CAP_ENABLED`) | 🟡 | not flipped yet |
| 8.7 | Voice-to-voice deafness (test-mic flow) | ⛔ | Older blocker, needs founder snapshot |

---

## SECTION 9 — Founder decisions pending

| ID | Decision needed | Why it blocks | Owner |
|---|---|---|---|
| D1 | PSP strategy: Gumroad-only OR keep LemonSqueezy for Bookstore? | Unblocks 4b.6 / 4b.7 / 4c.2 / 4c.3 | Founder |
| D2 | Currency: USD/EUR toggle for customer? (founder's new request) | Unblocks 4a.* | Founder ✅ confirmed: **wants toggle** |
| D3 | Alistair: hide €39 page until 21 letters authored OR keep & author content urgently? | Unblocks 3.6 | Founder |
| D4 | `polarstarAgeGroups.js`: delete or repurpose old labels? | Unblocks 2.8 | Founder |
| D5 | `/portal` unauth-mode warm redesign vs. current cold magic-link wall? | Unblocks 5.4 / 5.5 | Founder |
| D6 | `@pruesoul.life` (`pru` not `prue`) — typo or real handle? | Unblocks 7.3 | Founder |
| D7 | Two Gumroad accounts — unify when? | Unblocks 4b.5 | Founder |

---

## SECTION 10 — Future / Backlog (P2 / P3)

- "House" word cleanup across 24+ files (P2)
- `/about` Anna page polish + video snippet (P2)
- Social Media Sprint via Publer — 7 posts (P3)
- Dynamic Course Curator (P3)
- Silence Room (new ElevenLabs agent) (P3)
- Welcome email / gift delivery audit (P2)

---

## SECTION 11 — Launch Pause Mode (2026-02, active)

| ID | Item | Status |
|---|---|---|
| 11.1 | `LAUNCH_PAUSE` flag created in `frontend/src/lib/launchPause.js` | ✅ |
| 11.2 | `<LaunchPauseButton />` shared component | ✅ |
| 11.3 | Seven Quiet Nights buy CTA paused | ✅ |
| 11.4 | The Hearth Protocol buy CTA paused | ✅ |
| 11.5 | Alistair Bundle buy CTA paused (no waitlist — content gap) | ✅ |
| 11.6 | Family Bundle buy CTA paused | ✅ |
| 11.7 | Bookstore "Payments soon" chip rewritten + per-book buy → Notify me | ✅ |
| 11.8 | Clarity Release 3 tier buys paused | ✅ |
| 11.9 | Course Detail buy CTA paused | ✅ |
| 11.10 | Body Temple hero + modal unlock CTA paused | ✅ |
| 11.11 | Homepage Ways-to-be-here CTAs → "Join the quiet list" | ✅ |
| 11.12 | Smoke-test verified on 7 surfaces | ✅ |
| 11.13 | RoomIntroCard (10-sec selguse kaart) component | ✅ |
| 11.14 | RoomIntroCard mounted in 5 rooms (Grace, Kaelan, Sara, Alistair, Aurin) | ✅ |
| 11.15 | Grace + Alistair hero copy cleanup (house / high-bandwidth removed) | ✅ |
| 11.16 | RoomShell mockup layout (sidebar + hero + right panel + curator) — Alistair (The Life Laboratory) | ✅ |
| 11.17 | RoomShell mockup layout — Grace (The Hearth) + Atomsi spec + hero image + Notes Left By The Fire | ✅ |
| 11.18 | Replace Atomsi mockup-image with a clean Nano-Banana cinematic fireplace background (no embedded UI text) | ⚪ next — required because current image contains Estonian UI snippets baked into it |
| 11.18 | RoomShell mockup layout — Kaelan (The Observatory) | ⚪ next |
| 11.19 | RoomShell mockup layout — Sara (The Family Table) | ⚪ next |
| 11.20 | Replace monogram avatars with Nano-Banana-generated portraits | ⚪ deferred |
| 11.21 | Replace CSS atmosphere with Nano-Banana cinematic backgrounds | ⚪ deferred |

**Update rule:** every time a status flips, append a one-line note with the date below the relevant row instead of editing in place. Keep history.
