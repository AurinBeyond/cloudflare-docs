# Matrix Aurin — Bestseller Marketing & Sales Plan, 2026
*A calm, modern, multi-channel strategy that translates the
"Million-Dollar Book Method" into Aurin's quiet voice.*

---

## 0 · Strategic Frame

> **Aurin's edge is its opposite-axis position.** Every other voice in
> this market is loud, urgent, transformational. Our edge is being the
> one quiet doorway in a noisy hallway. Every channel below is filtered
> through that voice — slow, honest, never urgent.

**The Value Ladder (Aurin translation of the Million-Dollar method):**

| Tier | Price | Role | Asset (existing or to build) |
|------|-------|------|------------------------------|
| 0 · Free | $0 | Lead magnet | **The Night Angels' Embrace** (children's bedtime PDF, email-gated) |
| 1 · Front-end | $5 | Qualifying purchase | **Engels' Friends 2** + **Angels' Tales** + **Angels' Story** (kids, $5 each) |
| 2 · Order bump | $7–13 | Add to cart at checkout | **You Don't Have to Dance** ($7), **Beyond the Matrix Vol I/II** ($13) |
| 3 · Upsell | $30–60 | Single Clarity pass | **30-min** ($30) / **60-min** ($60) Clarity Release |
| 4 · Back-end | $250 | Season pass | **30-day Season Pass** to Clarity Release |
| 5 · High-ticket | $1,000+ | Future | "Pruesoul Cohort" 8-week guided programme |

**Conversion rule:** at every step, the next step is offered ONLY as a
quiet "if this spoke to you, here is what comes next" sentence — never
a banner, never a timer.

---

## 1 · Channel Stack (zero-cost first, paid second)

### 1.1 — Instagram + TikTok (visual, slow Reels)

**Posting cadence:** 3 short Reels / week on each platform. Same asset,
cross-posted. **No daily content treadmill** — the brand is not loud.

**Reel format that works for our voice (60–90 s):**
1. Open on a single black frame with one whispered line of text
   (e.g. *"Some sentences are too heavy to say out loud."*)
2. Slow camera pan across one of the **8 Body Room images** (we have
   them — `crown-overthinker.png`, `throat-unspoken.png`, etc.)
3. One paragraph from the Library / Philosophy, voiced by the founder
   (or by OpenAI TTS through `/api/clarity/tts`)
4. Closing card: *"Matrix Aurin · prulesoul.site"* — never a CTA verb.

**Hashtag set (Instagram):** `#somatichealing #quietnessmovement
#unspoken #boundariesarelove #bedtimeforgrownups #estonianauthor
#SaintAurin #shadowwork`

**TikTok hook lines (test rotation):**
- "Your body remembers what you tried to forget."
- "Dark colours don't mean trouble — they mean release."
- "The lump in the throat is the weight of words never spoken."
- "What we don't say out loud, we store in the hips."

**Asset reuse for Reels (existing in /app/frontend/public/):**
- 8 × `body_room/*.png` (already generated)
- 4 × Gemini hologram silhouettes (Library, Philosophy, ClarityRelease)
- `book.mp4`, `Blueprint_Inside_You.mp4`, `Fragile_Construct.mp4`,
  `The_Weight_of_Stillness.mp4`
- `invideo-ai-1080 You Are Not Who You Became — 60s Trailer.mp4` (use as
  cornerstone reel, pin it on both profiles)

### 1.2 — Pinterest (HIGHLY underrated for quiet aesthetics)

Pinterest feeds Aurin's audience perfectly: women 28–55, journaling,
shadow-work, somatic, slow-living. **Five boards** to seed:

1. *"Quiet bedtime"* — pin every kids book cover + 3 inner spreads
2. *"The body remembers"* — 8 Body Room images as standalone pins,
   each links to the corresponding `/body-room` deep-link
3. *"A Wanderer's Library"* — every Philosophy / Library entry gets
   a vertical 1000×1500 pin (auto-generate later)
4. *"Sage on black"* — pure aesthetic board to seed brand recognition
5. *"For the parent beside them"* — Kids Coloring Studio downloads
   (printables are Pinterest-gold)

Pinterest pins keep working for 6–12 months unlike Instagram (24 h).

### 1.3 — Reddit (warm, but VERY careful)

The voice rule matters most here. Reddit punishes sales energy. Allowed
subreddits and tone:

- **r/CPTSD** (1.4M) — share *one essay* per fortnight, link in profile
- **r/Meditation** (1.3M) — share Body Room insight as comment, no link
- **r/Bedtimestories** — share one paragraph from Night Angel, free PDF
  link allowed because the book is genuinely free
- **r/BetweenSelves** (small but on-tone)
- **r/InternalFamilySystems**

**Posting rule:** 90 % comments, 10 % posts. Account ages slowly,
karma builds, then a single thoughtful post lands like a gift.

### 1.4 — Hacker News / Indie Hackers / Lobste.rs

The platform itself is a *story* there: "I built a calm somatic-
psychology platform with FastAPI + React in 60 days." HN loves a
slow founder's note. **One Show HN post**, never two.

### 1.5 — Discord & gaming-adjacent platforms (user-requested)

**Free placement, calm voice:**
- **Discord servers** about journaling, mental health, parenting,
  esoteric study (e.g. *Jung's Anonymous*, *The Inner Work Hub*).
  Become a quiet member for 2 weeks before sharing anything.
- **Steam** — not for direct ads, but the game *Mountain* / *Behind
  the Frame* communities overlap heavily with our reader; mention in
  reviews / forum threads as inspiration.
- **Roblox / Minecraft parent groups** for Kids Universe — Pinterest
  + Facebook parent groups link straight to free coloring pages
- **Twitch** — partner with one gentle ASMR streamer who reads
  bedtime stories; offer them free copies of *Engels' Friends 2*
  for live read-aloud.
- **YouTube Shorts** — same Reels, re-uploaded; YT discovers calm
  voices for free via the algorithm

### 1.6 — Whispers (signal-rich micro-influencers)

The Whispers list is in `/app/memory/WHISPERS_DM_SCRIPTS.md`.

**Outreach tier strategy:**
- Tier A — micro (5K–50K followers): send free 30-day Clarity Pass
- Tier B — small (50K–250K): send full book bundle + 60-min pass
- Tier C — mid (250K+): personalised letter + custom essay invite

**Affiliate model (low-friction):** every Whisper gets a tracked link
`https://prulesoul.site/?w=<slug>` — backend stores hits, attributes
purchases for 30 days, founder thanks them with 25 % share.
*(Implementation: see `Implementation Notes` below.)*

---

## 2 · The Funnel — front to back

```
  [Reel / Pin / Reddit comment]
              │
              ▼
     prulesoul.site (lands on /home or deep-link)
              │
              ▼
   ┌──────────────────────────┐
   │  /bookstore/the-night-   │  ← FREE lead magnet
   │   angels-embrace         │     (email captured, list grows,
   │   "Read it now" / PDF    │     PDF emailed via Resend)
   └──────────────────────────┘
              │
              ▼  (welcome letter → 24 h later → second letter)
   ┌──────────────────────────┐
   │  Bookstore — paid books  │  ← Front-end ($5 kids / $7-13 adult)
   │   "If this spoke to you" │     Cross-sell module (NEW)
   └──────────────────────────┘
              │
              ▼  (post-purchase email)
   ┌──────────────────────────┐
   │  Clarity Release pass    │  ← Upsell ($30 / $60)
   │   "A quiet hour with     │
   │    your own voice"       │
   └──────────────────────────┘
              │
              ▼  (after 1st pass used)
   ┌──────────────────────────┐
   │  Season Pass / Pruesoul  │  ← Back-end ($250 / $1,000+)
   │  Cohort                  │
   └──────────────────────────┘
```

---

## 3 · Email Funnel (Resend, 7-letter bedtime drip)

Already partly wired via Resend. Letters are short (≤ 200 words),
voice = first-person Anna. Subjects below:

1. **Day 0 ·** *"a quiet bedtime book — The Night Angels' Embrace"*
   (existing — `/api/lead-magnet/book`)
2. **Day 2 ·** *"a small story about why this exists"* (founder note)
3. **Day 5 ·** *"the room you can visit even on the loud days"*
   (introduces Body Room — 1 image, 1 invitation)
4. **Day 9 ·** *"if you've ever swallowed a sentence"*
   (Throat hotspot story — soft pitch for *You Don't Have to Dance*)
5. **Day 14 ·** *"a smaller hour, just for you"*
   (Clarity Release — 30-min / 60-min, $30/$60)
6. **Day 21 ·** *"what most people miss about boundaries"*
   (Beyond the Matrix Vol I — $13)
7. **Day 30 ·** *"if you'd like to walk a little further"*
   (Season Pass — $250, framed as a season, not a subscription)

*Content slots 2–7 to be drafted by founder; agent provides copy
suggestions in `/api/admin/draft-letter` on request.*

---

## 4 · Paid Ads (start tiny, $10/day, double-or-nothing)

**Phase 1 — proof of CPA (Weeks 1–2):**
- Meta (Instagram + Facebook) only, $10/day, 5 ad variants
- Single objective: free PDF download (Night Angel)
- Metric: cost per email sign-up < $1.50

**Phase 2 — turn winners into paid funnel (Weeks 3–6):**
- Take top 1–2 winning ads, duplicate at $10/day each
- Send to a paid book page (*Engels' Friends 2* — $5)
- Metric: ROAS ≥ 1.0 within 7 days; if so, scale 50 % week-over-week

**Phase 3 — retargeting (Week 6+):**
- Custom audience: visitors who saw `/bookstore/*` but didn't buy
- Creative: 15-second Body Room reel + soft offer
- Custom audience: free-PDF subscribers (warmer) → Clarity Release

**Tracking:** Meta Pixel + LemonSqueezy purchase event (already wired
via webhook → `/api/lemonsqueezy/webhook`). Need to add Pixel to
`<head>` — see Implementation Notes.

---

## 5 · Bestseller Push for *Beyond the Matrix Vol I*

**Goal:** position Vol I as #1 New Release in *Personal Transformation*
on Amazon Kindle in 30 days. (User mentioned manual Kindle linking,
so we still benefit from external Amazon ranking.)

**Method (overlay the standard tactic with our voice):**
1. Day –7 to Day 0: tease one paragraph per day on IG / Pinterest
2. Launch day: every existing email subscriber receives a quiet note
   with the Amazon link AND the prulesoul.site link, side by side
3. Whispers receive a personal letter with the Amazon ASIN one day
   before launch
4. **No discount.** No "first 24 hours only" line. Let the rank
   build by velocity, not panic
5. Submit to: BookBub (paid), Reedsy Discovery, NetGalley, BookFunnel
   *(none mention urgency — they accept calm copy)*

---

## 6 · Implementation Notes (what we wire into the platform)

The following is implemented or being implemented in the codebase:

### 6.1 — Cross-sell module on every BookDetail page
*(Implemented in this session.)*
A "If this spoke to you" section at the bottom of every book page,
serving 3 contextually-related books from the catalogue. Logic:
- Kids audience → next kids book + free Night Angel + a Body Room link
- Adult → next adult book + Clarity Release one-time pass

### 6.2 — Whispers attribution tracking
A new endpoint `/api/whispers/track?w=<slug>` will set a 30-day cookie
on visit. The LemonSqueezy webhook reads the cookie at purchase and
attributes the sale. Founder dashboard at `/whispers-portal` shows
attributed revenue per Whisper.

### 6.3 — Pinterest / OG meta tags
Every page must serve correct OG `image`, `title`, `description` so
that any pin / share looks like a designed card. Most are already set;
audit pending.

### 6.4 — Sitemap + JSON-LD `Book` markup
Already partially in place; verify every paid book entry has
`schema.org/Book` JSON-LD with `offers` and `inStock`.

### 6.5 — Coloring Studio daily generation
*(Implemented in this session.)* Three pages/day (one per age group)
generated by Nano Banana, served at `/kids-universe/coloring`,
indexed by Google as fresh content (huge SEO win).

---

## 7 · 30-day execution calendar

| Week | Focus | Concrete deliverable |
|------|-------|----------------------|
| 1 | Funnel hardening | Cross-sell module, OG audit, Pixel install |
| 2 | Pinterest seeding | All 8 Body Room pins + 8 book covers + 5 Library essays |
| 3 | Whispers wave 1 | 10 Tier-A DMs (script in WHISPERS_DM_SCRIPTS.md) |
| 4 | Paid ads $10/day | Meta ads to free PDF — measure CPA |
| 5 | Reddit warm-up | 30 thoughtful comments before any post |
| 6 | First Reel batch | 5 Reels using Body Room images |
| 7 | Bestseller tease | Beyond the Matrix Vol I daily one-paragraph tease |
| 8 | Bestseller launch | Amazon launch day + email blast |

---

## 8 · KPI panel (founder-facing)

- Free PDF email captures / week → target 50 → 200 → 500
- Front-end book sales / week → target 10 → 40 → 100
- Clarity Release passes / week → target 2 → 8 → 20
- Email-list size → target 1k by Day 90
- Pinterest impressions / month → target 100k by Day 90
- Whispers attributed revenue / month → target $1k by Day 60

---

*This document is the single source of truth for marketing & sales.
All other strategy memos defer to this one. Updated by the agent on
behalf of Anna (Aurin), founder.*
