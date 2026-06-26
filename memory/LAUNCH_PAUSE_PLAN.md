# Launch Pause Mode — Preparation Plan (NO CODE YET)
**Date:** 2026-02 (forked session)
**Mode:** READ-ONLY · plan only · awaiting founder green-light
**Founder directive:** "Ükski külastaja ei saa enne lõplikku PSP/valuuta otsust kogemata osta valest süsteemist ega ka valet toodet, vöi toodet mida ei ole olemas."

**Rules of the pause:**
1. NOTHING is deleted (no file, no product, no page, no SKU in our codebase).
2. NO PSP work, NO currency toggle work — until founder later decides.
3. Every active checkout link is converted to **"Coming soon"** OR **"Notify me / Join the waitlist"**.
4. Original Gumroad / LemonSqueezy URLs stay in the codebase, just hidden behind the pause flag, so a single line reverses everything later.

> **PRICE CORRECTION:** Seven Quiet Nights / Polarstar Bedtime Stories PDF is **€9** (not €7 as my earlier inventory said by mistake). Confirmed from `SevenQuietNights.jsx:231`, `HousePreview.jsx:807`, `FamilyBundle.jsx:247`. Inventory file now corrected.

---

## A. Every active buy button on the site (exhaustive)

Cross-checked by grep of `gumroad.com/l/`, `buildLemonCheckoutUrl(`, `data-testid="*-buy"`, `data-testid="*-cta"`, and `href="https://*"` patterns.

### A.1 — Gumroad-driven CTAs (4)

| # | File · line | Visible button text | Goes to | Becomes after pause |
|---|---|---|---|---|
| 1 | `SevenQuietNights.jsx:218–232` `data-testid="sqn-gumroad-cta"` | "See the full Polarstar collection (€9 PDF)" | `prulesoul.gumroad.com/l/fwqmha` | **Coming soon** + "Notify me" input (Hearth-funnel API can be re-used) |
| 2 | `TheHearthProtocol.jsx:291–294` `data-testid="hearth-buy-cta"` | "Step inside · €19" | `aurinbeyond.gumroad.com/l/the-hearth` | **Coming soon** + "Notify me" |
| 3 | `AlistairBundle.jsx:38, 255+` `data-testid="alistair-bundle-cta"` (CTA pill at bottom) | "Step into the shelf · €39" / "Take the whole shelf" | `aurinbeyond.gumroad.com/l/alistair-bundle` | **Coming soon — content opens later** (do not even say "Notify me" — the 21 letters do not exist yet, founder choice) |
| 4 | `FamilyBundle.jsx:39, 255` `data-testid="family-bundle-buy-cta"` | "Take both shelves · €25" | `aurinbeyond.gumroad.com/l/vjurjm` | **Coming soon** + "Notify me" |

### A.2 — LemonSqueezy-driven CTAs (sales catalogue)

| # | File · line | Surface | Becomes after pause |
|---|---|---|---|
| 5 | `Bookstore.jsx:310, 318` (per-card buy button) | each of 8 books | per-card button → **"Notify me when this opens"** (replaces both "Continue / Waitlist" branches) |
| 6 | `Bookstore.jsx:78–80` chip "· Payments soon" | bookstore header | already says it — **rephrase** to: *"Reading catalogue · purchases open soon"* (so it stops contradicting the buy buttons) |
| 7 | `ClarityRelease.jsx:901, 1051` (3 tier rows: 30min / 60min / Season) | `/clarity-release` | each tier button → **"Doors open soon"** disabled button. The free-access / beta-grant branch is preserved. |
| 8 | `CourseDetail.jsx:189–198` (per-course buy CTA) | every course detail page | button → **"Notify me when this course opens"** |
| 9 | `CourseRoom.jsx` price chips | course room shelf | price chip stays visible; row-level CTA becomes **"Coming soon"** |
| 10 | `BodyTemple.jsx:217–225, 412–420` "Unlock all 28 days — $39" | `/body-temple` | button → **"Coming soon — Day 1 still free to read"** (Day 1 free preview stays open) |

### A.3 — Tier prices on homepage with no PSP wiring today (3)

| # | File · line | Tier | Today's behaviour | After pause |
|---|---|---|---|---|
| 11 | `HousePreview.jsx:1060–1070` "A First Step · €45" | links to `/portal` | already cold (no PSP) | rename CTA: **"Join the quiet list"** (no price change yet) |
| 12 | same · €120 "A Steady Presence" | `/portal` | cold | **"Join the quiet list"** |
| 13 | same · €380 "Your Own Room" | `/portal` | cold | **"Join the quiet list"** |

### A.4 — Voice top-ups (already display-only, no action needed) ✅

| # | File | Item | Today | After pause |
|---|---|---|---|---|
| 14 | `HousePreview.jsx:1118–1140` | 3 top-up cards (€25 / €39 / €99) | no CTA — info cards only | **NO CHANGE** |

### A.5 — "Ways to be here" links on `HousePreview.jsx` 2nd CTA row

Already point to `/portal` — no purchase happens. **NO CHANGE.**

---

## B. After-the-pause site map (what visitor sees)

### B.1 — Pages that REMAIN visible and untouched (read-only / preview)
- `/` (homepage) — hero, world cards, Ways to be here (with new "Join the quiet list")
- `/start-here` — 3-path onboarding
- `/library`, `/listen/little-star`, `/listen/hearth/*` (all 5 stories), `/listen/hearth` index — listening surfaces stay
- `/legal`, `/about`, `/reach-out`, `/faq`
- `/kids-universe/polarstar` + all 3 rooms + all live activities — Polarstar stays fully open (no PSP touched there)
- `/portal` magic-link entry remains
- Grace `/clarity-release`, Kaelan `/body-room`, Sara `/parents-room`, Alistair `/course-room`, Aurin `/aurins-room` rooms — content sections stay; only checkout-CTAs swap

### B.2 — Pages that become "preview / waitlist" surface
- `/seven-quiet-nights` — sample stories stay, PDF CTA → Coming soon
- `/the-hearth` — story listing stays, €19 CTA → Coming soon
- `/family-bundle` — bundle copy stays, €25 CTA → Coming soon
- `/alistair-bundle` — copy stays, €39 CTA → "Content opens later"
- `/bookstore` — 8 book cards stay, all buy buttons → "Notify me"
- `/body-temple` — Day 1 still free; "Unlock 28 days" CTA → Coming soon
- `/clarity-release` — voice rooms stay, 3 tier CTAs → Coming soon
- `/course-room` + 4 course detail pages — copy stays, buy CTAs → Coming soon

### B.3 — Pages / products that are NEVER touched
- Polarstar Kids universe (free)
- All `/listen/*` audio pages (free)
- `/start-here`, `/library`, `/legal`, `/about`, `/reach-out`, `/faq`
- All admin pages
- Backend webhook endpoints (LS / Gumroad receipt handlers remain wired so existing customers can be served)

---

## C. Special checks the founder asked for

### C.1 — Alistair Bundle (the highest risk)
- File: `/app/frontend/src/pages/AlistairBundle.jsx`
- Promises: *"Three transmission sequences. Twenty-one letters."* + €39 Gumroad CTA.
- Reality in codebase: **zero letter files**, no cadence engine, no email automation visible.
- Proposed pause: keep the page, swap the bottom CTA pill for a calm dark **"Doors open later — no waitlist while we finish the letters"** non-clickable badge. Do not even collect email yet (avoids promising delivery we can't yet honour).

### C.2 — Seven Quiet Nights price discrepancy (€7 vs €9)
- **The discrepancy was in my earlier audit, not in the site.** Code consistently says **€9** everywhere (3 files checked, all match).
- I have corrected `PRODUCT_INVENTORY_2026-02.md` accordingly.
- No founder action needed on this.

### C.3 — `/bookstore` "Payments soon" chip
- File: `Bookstore.jsx:77–80`
- Today: says "Payments soon" BUT every card buy button actually opens LemonSqueezy.
- Proposed pause: chip becomes *"Reading catalogue · purchases open soon"*. Buy buttons become "Notify me". Now the chip and the buttons tell the same story.

### C.4 — Every USD / EUR display spot

| Surface | Currency now | After pause |
|---|---|---|
| `/seven-quiet-nights` | EUR €9 | EUR €9 (unchanged) |
| `/the-hearth` | EUR €19 | EUR €19 (unchanged) |
| `/family-bundle` | EUR €25 | EUR €25 (unchanged) |
| `/alistair-bundle` | EUR €39 | EUR €39 (unchanged, but no CTA) |
| `/seven-quiet-nights` text mentions €9 PDF | EUR | EUR |
| Homepage "Ways to be here" tiers | EUR (€45/€120/€380) | EUR (unchanged) |
| Homepage Voice Meter top-ups | EUR (€25/€39/€99) | EUR (unchanged) |
| `/bookstore` (header chip "0% VAT · Norway") | NO currency text | unchanged |
| `/bookstore` per-book price | **USD $0–$13** | **USD** (unchanged — display only, no buy) |
| `/body-temple` "$39" line | **USD** | **USD** (display only, no buy) |
| `/clarity-release` tier prices | **USD** ($15/$30/$70) | **USD** (display only, no buy) |
| `/course-room` + course detail | **USD** ($20–$25) | **USD** (display only, no buy) |
| Mentor hook backend response (`cta_url=/body-temple`) | n/a | n/a |

> **Conclusion:** the currency drift becomes harmless during pause mode because no one can actually buy from any of the USD surfaces. The drift can be fixed properly **after** the founder picks the PSP and currency strategy.

---

## D. The 10-second "business card" question (room-by-room)

Founder asked: *"kas reaalselt on igas toas olemas tasuta visiitkaardi moodi leht, kus on kirjas millega on tegu, mida inimene siit saab, ning mis teenust/toodet siin saab osta ning mis raha eest, kuidas see töötab, ning turvalisuse kohta?"*

A "10-second business card" should contain 5 elements: **(1) what this room is, (2) what the visitor gets, (3) what is for sale + price, (4) how it works, (5) security/refund/privacy.**

I inspected the hero of every adult room + Polarstar + Aurin. Here is the honest answer:

| Room | (1) What it is | (2) What you get | (3) For sale + price | (4) How it works | (5) Security/refund | 10-sec card complete? |
|---|---|---|---|---|---|---|
| Grace `/clarity-release` | ✅ hero copy | 🟡 implied | ✅ 3 tier prices visible | 🟡 scattered | ❌ no refund/privacy line on the page | **NO** |
| Kaelan `/body-room` | ✅ hero copy | 🟡 implied | 🟡 "$39 unlock" buried in body | ❌ | ❌ | **NO** |
| Sara `/parents-room` | ✅ hero copy | ✅ ("not a course, sentences + rituals") | ❌ no price (room is free?) | 🟡 | ❌ | **NO** |
| Alistair `/course-room` | ✅ hero copy | 🟡 | ✅ per-course price chips | 🟡 "24h cadence-lock" mentioned | ❌ | **NO** |
| Aurin `/aurins-room` | ✅ hero copy | ✅ Kids Day Pass €25 row | ✅ €25 | 🟡 | ❌ | **NO** |
| Polarstar `/kids-universe/polarstar` | ✅ painted world | ✅ free path cards | ✅ €9 PDF (mentioned via Family Bundle / SQN) | 🟡 | ❌ | **NO** |

**Verdict:** **NONE of the rooms has a single consolidated "10-second card" block** with all five elements together. The information exists, but it is scattered down the page, sometimes in the curator intro, sometimes in a tier table, almost never with refund / privacy / how-it-works in one calm card.

This is an honest gap. Recommended fix (after Launch Pause):
- Build a single shared component `<RoomCard10s />` that every room mounts directly under its hero. Five lines:
  - Line 1 — *What is this room?*
  - Line 2 — *What do you walk out with?*
  - Line 3 — *What is for sale here & at what price?* (or *"Free during the launch pause"*)
  - Line 4 — *How does it work?* (one sentence)
  - Line 5 — *Your data, refund, privacy* (one sentence + link to `/legal`)
- During Launch Pause Mode the "for sale" line says *"Currently closed for purchases. Open the Notify list."*

---

## E. Suggested rollout order (when founder green-lights coding)

1. Add a single `launchPause = true` flag in `frontend/src/lib/flags.js`.
2. Bookstore cards swap behaviour based on flag (smallest blast radius, 1 file).
3. The 4 Gumroad sales pages (Seven Quiet Nights, Hearth, Alistair, Family) swap their bottom CTA via flag.
4. Body Temple + Clarity Release + Course Detail rooms swap their checkout CTAs.
5. Homepage Ways-to-be-here CTAs renamed.
6. After founder verifies pause is live → build the shared `<RoomCard10s />` block and mount in every room (one PR).
7. Only after that → currency toggle + PSP strategy.

Reversal: flip the flag to `false` and the entire site returns to today's state with one commit.

---

## F. What I am NOT doing in this plan

- Not touching backend (webhook endpoints, db, FastAPI routes stay live so existing customers are still served).
- Not deleting any product, page, file, or copy.
- Not touching the 5 free `/listen/*` audio pages.
- Not touching Polarstar — the entire kids surface stays open.
- Not changing any price number on screen.
- Not touching `/legal`, `/about`, `/start-here`, navigation, footer.

---

## G. Single yes/no for founder

> *Should I now implement Launch Pause Mode exactly as mapped in Section A + B?*

If yes → I will:
1. Create the `launchPause` flag.
2. Swap the buy buttons in 10 files per A.1–A.3.
3. Rewrite the Bookstore chip per C.3.
4. Smoke-test once with the screenshot tool.
5. Commit nothing else.

If no / partial → tell me which rows in Section A to skip, and I'll respect that.

*End of plan. No code modified.*
