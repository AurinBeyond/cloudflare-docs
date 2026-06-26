# Matrix Aurin — Honest Comprehensive Blind-Spot Audit
**Date:** 2026-02 (forked session, Phase A.4 final)
**Mode:** READ-ONLY
**Replaces:** `AUDIT_PHASE_A4.md` (kept for history)

This audit reconciles all previous fragmented findings (Polarstar, Alistair, finance, portal) into one consistent picture. Founder asked for "the whole truth" without contradicting earlier reports.

---

## CONSISTENCY NOTE

Earlier in this session two separate audits contradicted each other:
- **Audit A** (kids universe + Alistair): "Polarstar Kids rooms are partially empty; Alistair has 0 letters."
- **Audit B** (Phase A.4): "Polarstar is healthy, Bookstore is healthy."

Both were partially right. The reconciliation:
- Polarstar is **structurally** healthy (all routes resolve, content renders). It is **content-thin** in the night-map and the Creation room.
- Alistair is **structurally** healthy (page renders, Gumroad URL set). It is **content-empty** (the 21 letters do not exist as files).
- Bookstore is **structurally** healthy (8 books in DB, grid renders). It is **commercially mis-wired** (LemonSqueezy live, Gumroad not yet seeded with books, "Payments soon" chip lies).

So neither "everything broken" nor "everything fine" is true. The truth is:
**Architecture is sound. Content + payment plumbing are inconsistent with what the page copy promises.**

---

## 🔴 PROMISE-vs-REALITY GAPS (the dangerous list)

These are the spots where a paying visitor would feel misled.

### G1 — Alistair €39 promises 21 letters; codebase has 0 letters
- **Where:** `/alistair-bundle` subtitle: *"Three transmission sequences. Twenty-one letters. One quiet shelf."*
- **Reality:** No letter files in `frontend/src/data/`, no Alistair letter API, no scheduling/cadence engine.
- **Risk:** Buyer pays €39, expects 21 daily letters, receives nothing.
- **Status flag:** 🔴 highest commercial risk.

### G2 — `/bookstore` "· Payments soon" chip + LemonSqueezy buy buttons live
- **Where:** `Bookstore.jsx` line 78–80 (chip) + line 310–322 (`buildLemonCheckoutUrl`).
- **Reality:** "Payments soon" tells visitors checkout is not ready. But the buy button DOES open a LemonSqueezy checkout if the variant ID is set. Two opposite signals on one page.
- **Plus:** Founder has not uploaded the 8 books to Gumroad. If PSP strategy flips to Gumroad-only, every buy button on the bookstore points to a PSP that won't be used.
- **Status flag:** 🔴

### G3 — Currency drift (USD vs EUR)
- **Where:** `/bookstore` (USD), `/portal` Body Temple 28 wood card (USD $39), all Gumroad products (EUR €7/€19/€39).
- **Reality:** One visitor scrolling from homepage → bookstore sees the currency swap, no toggle.
- **Founder direction (2026-02):** Add a **USD/EUR customer toggle** at checkout level.
- **Status flag:** 🔴 trust + lux-tone risk.

### G4 — `/portal` cold wall for 17+ inbound CTAs
- **Where:** 17 internal links route to `/portal`; unauth visitor sees magic-link form + $39 Body Temple upsell + 3 "Placeholder" skeleton cards.
- **Reality:** The "Placeholder" label is visible to users — it looks unfinished.
- **Risk:** A new visitor following a homepage CTA expecting "clarity / 3 minutes / better evenings" instead gets a login wall and a cold upsell.
- **Status flag:** 🟡

### G5 — Two Gumroad accounts (founder-only fix)
- **`prulesoul.gumroad.com`** holds Seven Quiet Nights.
- **`aurinbeyond.gumroad.com`** holds Hearth, Alistair, Family Bundle.
- Code cannot unify these — needs founder migration inside Gumroad UI.
- **Status flag:** 🟡

### G6 — `@pruesoul.life` (`pru` not `prue`) Instagram handle
- **Where:** `/reach-out` page.
- **Reality:** Could be typo OR intentional handle name. Awaiting founder.
- **Status flag:** ⛔ awaiting founder.

---

## 🟡 CONTENT-THIN BUT NOT BROKEN

### T1 — Polarstar night-map: 9 zones open the Explorer-List modal
- The painted night-world image has zones labeled "Library / Adventure Hub / Story Stars / My Story Space / Family Connection / Evening Room / Memory Trail / Tomorrow's Adventure / You are never alone". All 9 trigger the waitlist modal. They cannot be clicked to real content.
- This is **honest** ("Coming Soon" tags are shown), but it dilutes the "real-content" promise of the painted day-mode rooms.

### T2 — Polarstar Creation room: 2/6 cards are `soon`
- `code-studio` and `media-studio` are themed placeholders, not real content.
- Other 4 (story-time, design-lab, build-something, share-project) are live.

### T3 — `/portal` "Placeholder" preview cards
- Shown to unauth visitors with the literal word "Placeholder" in the corner. Looks like an unfinished demo.

### T4 — `polarstarAgeGroups.js` dead code (78 lines)
- Used nowhere. Confuses contributors. Archive + delete decision pending.

---

## 🟢 STRUCTURALLY HEALTHY / WORKING

| Surface | State |
|---|---|
| Homepage hero "Less Noise. More Meaning." | ✅ |
| `/start-here` 3-path funnel | ✅ |
| Grace `/clarity-release` + FirstActionBlock | ✅ |
| Kaelan `/body-room` + FirstActionBlock | ✅ |
| Sara `/parents-room` + FirstActionBlock | ✅ |
| Aurin chat + story world | ✅ |
| Polarstar Discovery / Exploration rooms | ✅ |
| Polarstar Play & Move 4-step journey | ✅ |
| Polarstar Bedtime Stories PDF (€9) | ✅ live on Gumroad |
| The Hearth Protocol (5 stories, 5 audios) | ✅ |
| Seven Quiet Nights (€7) | ✅ live on Gumroad |
| Family Bundle | ✅ live on Gumroad |
| `/legal` GDPR + refund + Norway law | ✅ |
| Plausible analytics | ✅ |
| `/api/books` returns 8 published books | ✅ (data layer fine) |

---

## DECISION-FIRST PROPOSAL (founder calls the order)

Given the user's explicit preference (PSP question first, then labels, then portal), here is the sequenced plan I propose:

### STEP 1 — Decide PSP strategy (D1)
**Recommendation (low risk):** Gumroad-only across **all public buy-paths**.
This means:
- Remove the LemonSqueezy buy link from `/bookstore` cards until books are uploaded to Gumroad.
- Re-label `/bookstore` chip to: *"Reading catalogue · purchases open soon via Gumroad"*.
- Bookstore cards become "About this book → /bookstore/:slug" (read-only), with a single "Notify me when this opens" waitlist button at the page bottom.

This is reversible if you later prefer LemonSqueezy. It just stops the silent dual-PSP drift today.

### STEP 2 — Add USD/EUR customer toggle (D2)
**Spec:** small currency-switch chip in the site header (next to "Enter Portal"). Saves choice in `localStorage`. Every price component reads the same `useCurrency()` hook. Gumroad URLs are appended with the right currency param.
- Touches: `Bookstore.jsx`, `UserPortal.jsx` (Body Temple), `SevenQuietNights.jsx`, `TheHearthProtocol.jsx`, `AlistairBundle.jsx`, `FamilyBundle.jsx`, header `Navigation.jsx`.

### STEP 3 — Alistair decision (D3)
**Two paths:**
- (3a) Hide the €39 BUY button on `/alistair-bundle` until the 21 letters are authored. Keep the page as a "doors open soon" preview.
- (3b) Keep selling, but state honestly: *"21 letters arrive over 21 days starting on a date we will announce. Pre-order accepted at €39."* — only ethical if you're committed to authoring quickly.

### STEP 4 — Warm `/portal` (D5)
- Add a "New here?" / "Already inside?" two-track choice in the unauth view.
- Replace the 3 "Placeholder" preview cards with real content excerpts.
- Demote Body Temple wood card to auth-only state (don't upsell cold visitors).

### STEP 5 — Polarstar cleanup (D4)
- Archive + delete `polarstarAgeGroups.js`.
- Reduce night-map waitlist zones to 3-4 honest ones (or convert them to "Coming this season" parchments without modal).

### STEP 6 — Founder-only items
- D6 (`@pruesoul.life` typo check).
- D7 (Gumroad account unification).

---

## What I am NOT recommending

- Sprint 6 (the "house" word cleanup) right now. It's editorial polish and does not affect a single sale. After STEP 1-4 are done, this becomes the next sprint.
- Touching the Hearth Protocol — it is the strongest product on the site. Don't disturb it.
- Touching the homepage hero — it just landed and is converting.

---

*End of unified audit. Status tracker now lives at `/app/memory/TASK_TRACKER.md`.*
