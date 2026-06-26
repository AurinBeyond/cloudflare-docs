# LemonSqueezy — Final Product Catalogue
**Version:** Iteration 26 · 2026-04-30
**Audience:** Founder copy-paste reference for LemonSqueezy admin panel.

> All checkout buttons on aurin-hub remain **disabled** ("Opens this Friday")
> until the founder pastes the LemonSqueezy `variant_id` for each row back
> into `/app/backend/server.py` SEED_BOOKS / SEED_PASSES. The webhook layer
> is already live and HMAC-verified.

---

## 1. PRODUCTS — copy this table into LemonSqueezy

For each row create one Product, set the price, and on the **Custom Data**
tab add the two keys exactly as shown (these tell our webhook what to grant).

### A. Books (8 one-time products)

| # | Product Name | Price | Custom Data → key | Custom Data → value | SKU |
|---|---|---|---|---|---|
| 1 | Beyond the Matrix I | **$13** | `book_slug` | `beyond-the-matrix-i` | `book-btm-1` |
| 2 | Beyond the Matrix II | **$13** | `book_slug` | `beyond-the-matrix-ii` | `book-btm-2` |
| 3 | The Language of Angels | **$10** | `book_slug` | `the-language-of-angels` | `book-loa` |
| 4 | You Don't Have to Dance to Another's Tune | **$7** | `book_slug` | `you-dont-have-to-dance-to-anothers-tune` | `book-yddt` |
| 5 | Angels' Story (kids) | **$5** | `book_slug` | `angels-story` | `book-as` |
| 6 | Angels' Tales (kids) | **$5** | `book_slug` | `angels-tales` | `book-at` |
| 7 | Engels' Friends 2 (kids) | **$5** | `book_slug` | `engels-friends-2` | `book-ef2` |
| 8 | The Night Angels' Embrace (kids) ⚠️ | **$5** | `book_slug` | `the-night-angels-embrace` | `book-nae` |

> ⚠️ #8: keep this product **draft / unpublished** in LS until the PDF
> re-upload succeeds. The book row is in our DB but `pdf_url` is null.

### B. Bookstore Bundles (2 one-time, marketing leverage)

| # | Product Name | Price | Custom Data → key | Custom Data → value | SKU |
|---|---|---|---|---|---|
| 9 | Adult Library — All four books | **$33** *(save $10 vs $43)* | `book_bundle` | `adult-all` | `bundle-adult` |
| 10 | Kids' Library — All four books | **$15** *(save $5 vs $20)* | `book_bundle` | `kids-all` | `bundle-kids` |

### C. Clarity Release passes (2 one-time + 1 subscription)

| # | Product Name | Price | Type | Custom Data → key | Custom Data → value | SKU |
|---|---|---|---|---|---|---|
| 11 | Clarity Release — 30 minutes | **$15** | One-time | `pass_tier` | `30min` | `pass-30m` |
| 12 | Clarity Release — 60 minutes | **$30** | One-time | `pass_tier` | `60min` | `pass-60m` |
| 13 | **House Monthly** ⭐ | **$45 / month** | **Subscription** | `pass_tier` | `season_30days` | `pass-monthly` |

### D. The Beginning — Companion (one-time, NEW)

| # | Product Name | Price | Custom Data → key | Custom Data → value | SKU |
|---|---|---|---|---|---|
| 14 | The Beginning — Companion edition | **$20** | `experience` | `the-beginning-companion` | `exp-tb-comp` |

### E. Lifetime House (one-time, marketing pillar)

| # | Product Name | Price | Custom Data → key | Custom Data → value | SKU |
|---|---|---|---|---|---|
| 15 | Lifetime House | **$249** | `bundle` | `lifetime-all` | `lifetime` |

### F. Coloring packs (Body Room kids) — when generated

| # | Product Name | Price | Custom Data → key | Custom Data → value | SKU |
|---|---|---|---|---|---|
| 16 | Coloring Pack Vol. 1 — 20 pages | **$7** | `coloring_pack` | `vol-1` | `colour-1` |
| 17 | Coloring Day Pass (10 generations) | **$5** | `coloring_credits` | `10` | `colour-day` |
| 18 | Coloring Week Pass (40 generations) | **$15** | `coloring_credits` | `40` | `colour-week` |

> Founder note: variants 16-18 ship together once the Nano Banana pipeline
> is approved (separate iteration; ~$1-2 of generation credit + 1 day work).

---

## 2. WEBHOOK CONFIGURATION (LemonSqueezy admin panel)

```
URL:     https://prulesoul.site/api/lemonsqueezy/webhook
Secret:  Emake!123Hea
Events:  ☑ order_created
         ☑ order_refunded
         ☑ subscription_created
         ☑ subscription_cancelled
         ☑ subscription_expired
```

After saving the webhook, send 1 test event from LemonSqueezy. Confirm
`/api/lemonsqueezy/health` shows `events_received += 1`.

---

## 3. PRICING RATIONALE (Million Dollar Book / launch psychology)

- **$5 books** → low-friction entry, especially for kids. Parents will buy
  3 at once. Anchors all higher prices.
- **$45/month House Monthly** → replaces the $70 season pass. Lower
  per-month price, recurring revenue, beats LemonSqueezy's flat fee on
  small one-time charges.
- **$249 Lifetime** → "anchor of devotion". Visible price tells everyone
  this is a serious work. Even rare buyers fund 6 months of beta operations.
- **Bundles** → reduce decision fatigue. Two clicks instead of eight.
- **The Beginning Companion ($20)** → first paid step for free-trial users
  who want depth without committing to a monthly sub.

---

## 4. AFTER YOU PASTE VARIANT IDs BACK INTO US

Send each LS variant id to me and I will:
1. Update `SEED_BOOKS` / `SEED_PASSES` in `/app/backend/server.py`.
2. Migrate any existing rows in `db.books` / `db.clarity_passes` so the
   field flips from `null` → live id.
3. Flip `checkout_ready` → `true` on the affected tier cards.
4. Activate the Buy buttons on aurin-hub.

Total time after you send the IDs: **~30 minutes** to live checkout.

---

## 5. WHAT IS NOT IN LEMONSQUEEZY YET (intentional)

- **Body Room — Self-paced & Companion paths** → still in v1 design. When
  content modules are written, we'll add new variants for $25 (self) and
  $40 (companion).
- **Course Room** → currently no /courses route ships paid content. See
  separate proposal in `/app/memory/COURSES_PROPOSAL.md`.
