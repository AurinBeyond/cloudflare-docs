# Matrix Aurin — Product Inventory (read-only snapshot)
**Date:** 2026-02 (forked session)
**Mode:** READ-ONLY · no code changes made
**Purpose:** founder needs one table of every paid surface, with PSP, currency, content readiness, and live-sale status. This file is the answer to *"Mis toode? Mis hind? Mis valuuta? Gumroad või Lemon? Kas valmis?"*.

---

## Table A — Gumroad checkouts (live, public buy buttons)

| # | Product | Page | Price | Currency | Gumroad URL | Account | Content ready? | Active sale? |
|---|---|---|---|---|---|---|---|---|
| 1 | **Seven Quiet Nights** *(aka Polarstar Bedtime Stories PDF)* | `/seven-quiet-nights` | **€9** | EUR | `prulesoul.gumroad.com/l/fwqmha` | `prulesoul` | ✅ PDF + 1 audio (Little Star) | 🟢 YES |
| 2 | **The Hearth Protocol** | `/the-hearth` | **€19** | EUR | `aurinbeyond.gumroad.com/l/the-hearth` | `aurinbeyond` | ✅ 5 audios + 5 listen pages | 🟢 YES |
| 3 | **Alistair Bundle** | `/alistair-bundle` | **€39** | EUR | `aurinbeyond.gumroad.com/l/alistair-bundle` | `aurinbeyond` | 🔴 **0 of 21 letters authored** | 🟢 YES (risk!) |
| 4 | **Family Bundle** *(Polarstar + Hearth combo)* | `/family-bundle` | **€25** | EUR | `aurinbeyond.gumroad.com/l/vjurjm` | `aurinbeyond` | ✅ inherits (1) + (2) content | 🟢 YES |

> NOTE — naming drift: row 1's product on Gumroad is literally **"Polarstar Bedtime Stories"** (€9 in the original Gumroad listing) but the homepage sells it at **€7** on the page `/seven-quiet-nights` and `FamilyBundle.jsx` describes it as "€9 + €19 = €28". The price shown on the prulesoul Gumroad page itself is the source of truth — codebase reflects what it copied. Founder to reconcile.

---

## Table B — LemonSqueezy checkouts (also live, parallel to Gumroad)

These are still wired in the code with real variant IDs. Buy buttons WORK if a visitor reaches them.

| # | Product | Page | Price | Currency | LemonSqueezy variant | Content ready? | Active sale? |
|---|---|---|---|---|---|---|---|
| 5 | **Body Temple 28** | `/body-temple` | **$39** | USD | (env: `LS_VARIANT_BODY_TEMPLE`) | ✅ 28 days seeded in backend | 🟢 YES |
| 6 | Clarity Release · 30-Minute Release | `/clarity-release` | **$15** | USD | `1606274` | ✅ live voice session backend | 🟢 YES |
| 7 | Clarity Release · 60-Minute Release | `/clarity-release` | **$30** | USD | `1606349` | ✅ live voice session backend | 🟢 YES |
| 8 | Clarity Release · Season Pass (30 days) | `/clarity-release` | **$70** | USD | `1606394` | ✅ live voice subscription | 🟢 YES |
| 9 | Course · *Letting the Old Stories Rest* | `/course-room/letting-the-old-stories-rest` | **$25** | USD | `1606407` | 🟡 stub (7-letter cadence engine TBC) | 🟢 YES |
| 10 | Course · *The Language You Forgot* | `/course-room/the-language-you-forgot` | **$25** | USD | `1606433` | 🟡 stub | 🟢 YES |
| 11 | Course · *Seven Quiet Evenings With Children* | `/course-room/seven-quiet-evenings-with-children` | **$20** | USD | `1606445` | 🟡 stub | 🟢 YES |
| 12 | Course · *The Body Knows First* | `/course-room/the-body-knows-first` | **$25** | USD | `1606453` | 🟡 stub | 🟢 YES |
| 13 | Course · *Money and Consciousness Module 1* | `/course-room/...` | $0 | USD | — | 🟡 stub | ⚪ NOT (no variant) |
| 14 | Course · *The Broken Clockwork* | `/course-room/the-broken-clockwork` | **$39** | USD | — | 🟡 stub | ⚪ NOT (no variant) |

> NOTE — Alistair Bundle (row 3) bundles together rows 9, 10 and 12 individually-priced courses. The Bundle is Gumroad-sold (€39), the individual courses are LemonSqueezy-sold ($25 each). **Same content, two PSPs, two currencies.**

---

## Table C — Bookstore (LemonSqueezy, page `/bookstore`)

Chip in page header reads **"· Payments soon"** — but the buy buttons DO open LemonSqueezy checkouts when a variant ID is present. Per founder (2026-02): **books are NOT uploaded to Gumroad yet**.

| # | Slug | Title | Audience | Price | Currency | LS variant | Active sale? |
|---|---|---|---|---|---|---|---|
| 15 | `angels-story` | Angels' Story | kids | $5 | USD | 1606247 | 🟢 YES (chip lies) |
| 16 | `beyond-the-matrix-i` | Beyond the Matrix | adult | $13 | USD | 1606071 | 🟢 YES |
| 17 | `the-night-angels-embrace` | The Night Angels' Embrace | kids | $0 (free) | USD | 1606266 | 🟢 YES (free) |
| 18 | `engels-friends-2` | Engels' Friends 2 | kids | $5 | USD | 1606260 | 🟢 YES |
| 19 | `angels-tales` | Angels' Tales | kids | $5 | USD | 1606234 | 🟢 YES |
| 20 | `beyond-the-matrix-ii` | Beyond the Matrix II | adult | $13 | USD | 1606223 | 🟢 YES |
| 21 | `the-language-of-angels` | The Language of Angels | adult | $10 | USD | 1606213 | 🟢 YES |
| 22 | `you-dont-have-to-dance-to-anothers-tune` | You Don't Have to Dance to Another's Tune | adult | $7 | USD | 1606185 | 🟢 YES |

---

## Table D — Tier-pricing block on the homepage ("Ways to be here")

Section: `HousePreview.jsx` lines ~921–1078. CTAs all point to `/portal` (not a PSP).

| # | Tier | Price | Currency | Cadence | CTA destination |
|---|---|---|---|---|---|
| 23 | A First Step | **€45** | EUR | one session | `/portal` |
| 24 | A Steady Presence | **€120** | EUR | per month | `/portal` |
| 25 | Your Own Room | **€380** | EUR | per month | `/portal` |

> These prices are shown to every homepage visitor but do not have a clickable checkout — they pass the visitor to `/portal` (cold magic-link wall). No PSP wiring is visible in the page; presumably handled post-auth (or not at all yet).

---

## Table E — Voice top-ups ("The Voice Meter" block on homepage)

Section: `HousePreview.jsx` lines ~1081–1145. Info-only cards, no buy buttons in the current UI.

| # | Item | Price | Currency | Buyable today? |
|---|---|---|---|---|
| 26 | 30 minutes of presence | **€25** | EUR | ⚪ NO (no CTA) |
| 27 | 60 minutes of presence | **€39** | EUR | ⚪ NO (no CTA) |
| 28 | 180 minutes of presence | **€99** | EUR | ⚪ NO (no CTA) |

---

## SUMMARY ROW COUNTS

- **Total paid surfaces:** 28 (rows 1–28).
- **Gumroad SKUs active:** 4 (rows 1–4).
- **LemonSqueezy SKUs active:** 12 (rows 5–22 with variant IDs).
- **Tiers + voice top-ups not yet wired to a PSP:** 6 (rows 23–28).
- **Real content-vs-promise gap:** row 3 (Alistair €39, 0 letters), rows 9–12 (course "stubs" — backend stub OK but founder hasn't confirmed full content authored).
- **PSP mix:** EUR-Gumroad-side (4 rows) + USD-LemonSqueezy-side (12 rows) + portal/no-PSP (12 rows).
- **Two different Gumroad accounts in use:** `prulesoul` (1 product) and `aurinbeyond` (3 products).
- **Currency drift visible to single visitor scrolling homepage → bookstore:** YES (EUR ↔ USD).

---

## What this inventory shows the founder

1. The site is silently running **two PSPs simultaneously**: Gumroad for the 4 named bundles, LemonSqueezy for the entire course catalogue + bookstore + clarity sessions + Body Temple. PRD says "Gumroad locked".
2. Currency follows PSP — Gumroad rows = EUR, LemonSqueezy rows = USD. There is no per-visitor currency choice today.
3. The €45/€120/€380 "Ways to be here" tiers on the homepage do not have a working checkout — they punt to `/portal`. Either a high-trust hand-off model or unfinished plumbing.
4. The "Polarstar Bedtime Stories" / "Seven Quiet Nights" product has at least three different price references (€9, €7, €25-as-part-of-Family-Bundle) — founder should pick one.
5. Alistair Bundle row 3 carries the biggest commercial risk: real Gumroad SKU live + €39 sale active + 21 promised letters that do not exist in the codebase.

---

*End of inventory. No code modified. Source of truth for next decision phase.*
