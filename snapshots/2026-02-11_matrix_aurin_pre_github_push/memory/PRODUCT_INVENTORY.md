# MATRIX AURIN — PRODUCT INVENTORY + LIVE COMMERCE STATE
**Generated:** Iter 62 (Feb 2026) · pre-LemonSqueezy production activation
**Source:** live `/api/books`, `/api/courses`, `/api/clarity/passes`, `/api/lemonsqueezy/health` calls against the preview backend.

This is the founder's single reference for live launch. Use it to:
- configure / activate LemonSqueezy variants in production
- decide free vs paid surfaces
- track which products are ready to sell vs internal only
- avoid double-charging or hidden test products

> ⚠️ Pricing shown here is what the API returns to the wanderer right now. LemonSqueezy variant IDs are the same in test and production — only the *store mode* (test vs live) and *API keys* differ.

---

## 1 · BOOKS (`/api/books`)

| # | Slug | Title | Audience | Type | Price | Status | LemonSqueezy | Delivery |
|---|---|---|---|---|---|---|---|---|
| 1 | `angels-story` | Angels' Story | kids | PAID | $5 USD | READY FOR SALE | ✅ `1606247` | PDF download via `/api/cabinet/library/{slug}/download` |
| 2 | `angels-tales` | Angels' Tales | kids | PAID | $5 USD | READY FOR SALE | ✅ `1606234` | PDF download |
| 3 | `engels-friends-2` | Angels' Friends 2 | kids | PAID | $5 USD | READY FOR SALE | ✅ `1606260` | PDF download |
| 4 | `the-night-angels-embrace` | The Night Angels' Embrace | kids | LEAD MAGNET (free) | $0 USD | READY | ✅ `1606266` (free variant) | PDF download via `/api/books/free/{slug}/download` |
| 5 | `you-dont-have-to-dance-to-anothers-tune` | You Don't Have to Dance to Another's Tune | adult | PAID | $7 USD | READY FOR SALE | ✅ `1606185` | PDF download |
| 6 | `the-language-of-angels` | The Language of Angels | adult | PAID | $10 USD | READY FOR SALE | ✅ `1606213` | PDF download |
| 7 | `beyond-the-matrix-i` | Beyond the Matrix I | adult | PAID | $13 USD | READY FOR SALE | ✅ `1606071` | PDF download |
| 8 | `beyond-the-matrix-ii` | Beyond the Matrix II | adult | PAID | $13 USD | READY FOR SALE | ✅ `1606223` | PDF download |

**Books summary:** 8 published. 7 paid + 1 free lead magnet. All 8 have valid LemonSqueezy variants. Cover images served from `/api/books/cover/{slug}.jpg`. PDFs persisted in MongoDB `binary_assets` (survives deploys).

**Iter 62 cleanup:** removed leaked `test-book-19d4f893` from production catalog and added idempotent `^test-` purge to backend startup. No more test data in `/api/books` payload.

---

## 2 · COURSES (`/api/courses`)

| # | Slug | Title | Audience | Type | Price | Letters | Audio | Status | LemonSqueezy |
|---|---|---|---|---|---|---|---|---|---|
| 1 | `letting-the-old-stories-rest` | Letting the old stories rest | adult | PAID | $25 USD | 7 | ✅ Borrowed Beliefs | READY FOR SALE | ✅ `1606407` |
| 2 | `the-language-you-forgot` | The language you forgot | adult | PAID | $25 USD | 7 | ✅ As Yourself | READY FOR SALE | ✅ `1606433` |
| 3 | `seven-quiet-evenings-with-children` | Seven quiet evenings with children | parents | PAID | $20 USD | 7 | ✅ Blueprint Inside You | READY FOR SALE | ✅ `1606445` |
| 4 | `the-body-knows-first` | The body knows first | adult | PAID | $25 USD | 7 | ✅ The Body Knows | READY FOR SALE | ✅ `1606453` |
| 5 | `raha-ja-teadvus-moodul-1` | Raha ja Teadvus — Moodul 1 | adult | INTERNAL / HIDDEN | $0 (free) | 7 | — | INTERNAL ONLY (Estonian, hidden from public payload by W-2) | n/a |

**Courses summary:** 4 English courses publicly listed and ready to sell. 1 Estonian course (`raha-ja-teadvus-moodul-1`) is **filtered out** of `/api/courses` and `/api/library/shelves` since iter 62 W-2; it remains reachable by direct slug for any future Estonian-localized landing page.

**Course depth:** all 4 English courses have full Aurin-voice letters (~1100–1400 chars each, iter 55) plus audio companions. Letter 1 is free preview; letters 2–7 unlock daily after enrollment.

---

## 3 · CLARITY RELEASE PASSES (`/api/clarity/passes`)

| Tier | Label | Duration | Subscription? | Price | Status | LemonSqueezy |
|---|---|---|---|---|---|---|
| `30min` | 30-Minute Release | 30 minutes | one-shot | $15 USD | READY FOR SALE | ✅ `1606274` |
| `60min` | 60-Minute Release | 60 minutes | one-shot | $30 USD | READY FOR SALE | ✅ `1606349` |
| `season_30days` | Season Pass — 30 days | 43 200 minutes | **subscription** | $70 USD | READY FOR SALE | ✅ `1606394` |

**Beta note:** the `passes` endpoint flags `beta: true` with discounted-rate copy. After production activation this flag stays on until the founder flips it.

**Beta grant:** during beta window users can `POST /api/clarity/passes/{tier}/grant-beta` to receive a free pass — gated by `/api/clarity/beta-window` schedule. Useful for influencer trials.

---

## 4 · MEMORY TIERS (Hybrid Memory)

| Tier | Surface | Type | Price | Delivery | Status |
|---|---|---|---|---|---|
| **Transient Echo** | `MemoryPackageSelect` (cyan card) | FREE | $0 | Browser `localStorage` (`aurin_body_chat_v1`, `aurin_clarity_*`) | ✅ OPERATIONAL |
| **Eternal Thread** | `MemoryPackageSelect` (amber card) | PREMIUM (currently bundled with Clarity passes) | included with active Clarity pass · **no standalone variant yet** | Server-side `cabinet_user_summaries` (encrypted, opt-in via `clarity_user_prefs.save_threads`) | ✅ OPERATIONAL but **NOT yet sold standalone** |

**Decision needed before launch:** Eternal Thread is currently **active for any user with an active Clarity pass OR who flips the `save_threads=true` toggle (no payment gate)**. If you want it gated behind payment, a new LemonSqueezy variant must be created — or it must remain a free trust-feature.

> Founder rule from this iter: **HOLD on BYOK / Universal Key model.** Stay with the current "fixed premium limits" structure.

---

## 5 · BODY ROOM EXPERIENCES

| Surface | Type | Price | Status |
|---|---|---|---|
| 8 hotspots + pattern lookup | FREE | $0 | ✅ OPERATIONAL |
| Children patterns + further reading | FREE | $0 | ✅ OPERATIONAL |
| Somatic AI Mentor chat (`/api/body-room/chat`) | FREE (capped 12/day) | $0 | ✅ OPERATIONAL |
| Body Room TTS (Listen on each guide reply) | FREE (capped 12/day shares with Cabinet) | $0 | ✅ OPERATIONAL (iter 61) |

**No standalone Body Room product.** It is a free trust-room. Premium chat ceiling (60/day) is unlocked by holding a Clarity pass or flipping Eternal Thread.

---

## 6 · COURSE ROOM TTS / AUDIO COMPANIONS

| Asset | Type | Delivery | Status |
|---|---|---|---|
| Per-letter "Listen to this letter" (OpenAI TTS) | FREE in preview, gated to enrolled users for letters 2–7 | mp3 blob via `/api/clarity/tts` | ✅ OPERATIONAL |
| Audio companions (4 mp3s in `/assets/audio/courses/`) | included with course purchase | static mp3 | ✅ OPERATIONAL |

---

## 7 · SIX NIGHTS

| Surface | Type | Price | Delivery | Status |
|---|---|---|---|---|
| Six Nights email drip | FREE / LEAD MAGNET | $0 | Email via Resend | ✅ OPERATIONAL (env-bound on `RESEND_API_KEY`) |

6 nights pre-seeded. Hourly dispatcher loop active. Subscription via `/api/six-nights/subscribe`. Soft-skips when Resend missing.

---

## 8 · KIDS UNIVERSE

| Surface | Type | Price | Delivery | Status |
|---|---|---|---|---|
| `Aurin Kids` daily coloring page | FREE | $0 | Daily background generator | ✅ OPERATIONAL |
| Coloring RSS feed | FREE | $0 | `/api/feeds/coloring.rss` | ✅ OPERATIONAL |
| Books RSS feed | FREE | $0 | `/api/feeds/books.rss` | ✅ OPERATIONAL |
| Kids book sales (cards 1–4 above) | PAID | $5/each | LemonSqueezy → PDF | ✅ OPERATIONAL |

---

## 9 · BOOKING SYSTEM

| Surface | Type | Price | Status |
|---|---|---|---|
| Holographic Cabinet — guide booking (`clarity` / `grace`) | FREE to reserve a time anchor; the **session** itself requires a Clarity pass | Reserve = $0 · Session = $15 / $30 / $70 | ✅ OPERATIONAL (5 wanderer endpoints + 2 admin) |
| Admin Scheduler dashboard | INTERNAL | $0 | ✅ OPERATIONAL (admin token gated) |

**Booking does NOT charge.** It only reserves a time. Payment is taken separately via the Clarity Pass purchase. Anti-FOMO: one active reservation per user (§10.5).

---

## 10 · LEMONSQUEEZY HEALTH (`/api/lemonsqueezy/health`)

```
store_id_set:        true
webhook_secret_set:  true
api_key_set:         true
events_received:     25
purchases_total:     1
```

**Posture:** keys present in env. Webhook signature validated (HMAC). Idempotent purchase row via `(user_id, book_slug)` unique index. **Mode:** verify in LemonSqueezy panel whether store is in *test mode* or *live mode*. Switch to live before accepting real payments.

---

## 11 · PRODUCT TOTAL — LIVE COMMERCE READY

| Category | Ready to sell | Count |
|---|---|---|
| Books (paid) | ✅ | 7 |
| Books (free) | ✅ | 1 |
| Courses (paid, English) | ✅ | 4 |
| Clarity Passes | ✅ | 3 |
| **TOTAL paid SKUs** | ✅ | **14** |
| Free / lead-magnet surfaces | ✅ | 5 (Body Room, Six Nights, Kids coloring, Transient memory, Magic-link agreement gift) |

---

## 12 · BLOCKERS BEFORE FIRST REAL PAYMENT

| # | Blocker | Severity | Owner |
|---|---|---|---|
| 1 | Confirm LemonSqueezy store is in **live mode** (not test mode) and webhook URL points at production `prulesoul.site/api/lemonsqueezy/webhook` | 🔴 P0 | Founder + LemonSqueezy panel |
| 2 | Re-test one $1 dummy purchase end-to-end with a real card to verify (a) checkout opens, (b) webhook fires, (c) `purchases` row is written, (d) book download works | 🔴 P0 | Founder |
| 3 | LP Heartbeat env (`LP_HEARTBEAT_URL`) — currently empty, breaks symbiosis with landing page | 🟡 P1 | LP-side env |
| 4 | Decide if Eternal Thread should be **gated behind payment** or **free as trust-feature** (currently free) | 🟡 P1 | Founder decision |
| 5 | Clarity passes still flagged `beta: true` with discounted copy — flip when ready | 🟡 P2 | Founder decision |

---

## 13 · NOT FOR SALE (deferred / hidden)

- **BYOK / Universal Key model** — HOLD per founder rule. No new architecture before launch.
- **Animated hologram** — deferred. Static "Neural Portrait" is intentional (W-1).
- **Standalone Eternal Thread variant** — not yet a separate SKU; bundled with Clarity passes and the free toggle.
- **Real support agent / 24/7 helpdesk** — NOT IMPLEMENTED. See `/app/memory/READINESS_AUDIT.md` §14.
- **Russian / Norwegian / German localization** — deferred. English-only at launch.

