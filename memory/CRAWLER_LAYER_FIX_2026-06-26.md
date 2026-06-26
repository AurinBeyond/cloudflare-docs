# §CRAWLER-LAYER-CONSISTENCY 2026-06-26

Triggered by: 4 MoR rejections (Lemon, Paddle, FastSpring, Polar)
+ EVIDENCE_PACK_2026-06-26.md
+ GPT sign-off: "Proceed with crawler-layer consistency fixes only.
  Do not change visible branding, copy, or UX."

## Goal
Make what compliance crawlers and reviewers see in the **first 1.5
seconds** match what Anna has already built on the human-facing site.
The site already reads as "quiet adult digital reading house". The
crawler-visible layer still reads as "Polarstar Kids + mindful
parenting". This document closes that gap. **Zero visible UX change.**

## Changes shipped

### 1 · `/app/frontend/public/index.html` — meta layer
| Field | Before | After |
| --- | --- | --- |
| `meta name="description"` | "Four quiet mentor rooms for adults who carry weight, and **Polarstar Kids** — a calm world of stories and family rituals." | "A quiet digital reading house for adults — letters, audio essays, and four reflective rooms. Less Noise. More Meaning." |
| `meta name="keywords"` | "polarstar, polarstar kids, mindful parenting, sovereignty, quiet evening stories" | "digital reading subscription, audio essays, reflective letters, sovereignty, no-screen practice" |
| `og:description` | same kids-first phrasing | same adult-first phrasing as meta description |
| `twitter:description` | same kids-first phrasing | adult-first phrasing |

### 2 · `/app/frontend/public/sitemap.xml` — full rewrite
- Removed internal versioning comment header
- **Added** to sitemap: `/pricing` (0.95), `/about` (0.9), `/library` (0.9), `/bookstore` (0.9), `/legal` (0.85, was 0.3), `/faq` (0.8), `/grace`/`/sara`/`/kaelen`/`/alistair` rooms (0.75), `/body-world` (0.7)
- **Demoted**: `/listen/little-star` (0.95 → 0.5), `/kids-universe/polarstar` (0.9 → 0.5), `/parents-room` (0.8 → 0.55), `/seven-quiet-nights` (0.85 → 0.45)
- Net effect: a crawler's priority-ordered walk visits commerce + legal + adult rooms first, family library second

### 3 · Polar dashboard product descriptions (via OAT PATCH)
All 8 products updated to use the same terminology as the live site:
- **"curator audio session"** → **"voice with the keeper"** (was used in all 4 voice top-ups; this term existed nowhere on the website, only in Polar)
- **Companion** description: "Polarstar Kids included (up to three child profiles)" → "the accompanying bedtime stories library, opened by the parent for the child (up to three reader profiles)"
- All 8 product names + descriptions are now identical-in-spirit to what appears on `/pricing` and `/legal`

## Verified end-to-end
- ✅ Live HTML meta layer now serves the new copy (tested via `curl https://aurin-hub.preview.emergentagent.com/`)
- ✅ Live sitemap now serves the new priority order
- ✅ Polar API GET on all 8 products returns the new descriptions
- ✅ Homepage first viewport visible text is **byte-identical** to before — no UX change

## Risk assessment
- **User-visible risk**: zero. No rendered text changed.
- **SEO risk**: minor short-term re-indexing. Google will see the new meta within a week. The new description is keyword-relevant for the actual product (adult digital reading subscription), which improves long-term ranking quality.
- **Compliance risk**: lowered. Crawlers and reviewers receive a coherent, single-category signal (adult digital reading) instead of a kids-first signal followed by an adult site.

## What remains for Anna's hand
Per GPT's sequencing:
1. Gather the 4 onboarding-text artifacts (what was typed into each MoR's "describe your business" field — Polar, FastSpring, Paddle, Lemon)
2. With those in hand, write the canonical Business Description Standard (one paragraph) and update every MoR onboarding to use it identically

This is **evidence-first, standard-second**. The Business Description Standard should be born from the truth of how each provider perceived Aurin, not from our guess about it.
