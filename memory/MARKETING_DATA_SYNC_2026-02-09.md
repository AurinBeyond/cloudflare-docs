# Marketing Agent Data Sync — Kids Universe & Parents' Room

**Compiled by E1 for the Marketing Agent · 2026-02-09**
**Source**: live codebase (`kids_curriculum.py`, `KidsHub.jsx`, `ParentsRoom.jsx`, Sara/Aurin ConvAI agents, Angel Stars schema)

This document is the **single source of truth** for influencer-outreach copy. All numbers are from the running app — not aspirational.

---

## 1 · KIDS UNIVERSE — Core Experience

### What it actually is
A voice-first, calm-tone universe with **three age-shaped rooms** + a **27-activity Clarity Curriculum** + a **reciprocal kindness economy** (Angel Stars). Children move between hubs at their own pace. The single Aurin voice adapts tone to age group.

### Three age groups (each its own visual palette)

| Age group  | Slug             | Range | Palette         | Tone                            |
|------------|------------------|-------|-----------------|---------------------------------|
| **Little Dreamers** | `little-dreamers` | 3–5   | peach / cream   | soft, sleep-adjacent, lullaby   |
| **Explorers**       | `explorers`       | 6–8   | sage / forest   | curiosity, small adventures     |
| **Dreamweavers**    | `dreamweavers`    | 9–12  | mint / lavender | reflective, friendship-shaped   |

Each age hub surfaces **5 doors**:
- **Talk with Aurin** (primary CTA — voice room)
- **Stories** (age-appropriate book / nights)
- **Quiet activities** (the 27-activity curriculum)
- **Color & create** (no-text creative space)
- **Stars** (Angel Stars dashboard — earn / give / redeem)

### The Clarity Curriculum — 30 activities across 4 modules

| Module    | Count | Sample titles                                                                 |
|-----------|-------|-------------------------------------------------------------------------------|
| Reflect   | 5     | "A jar for today's feeling", "Three slow breaths with Aurin", "Gratitude Journal" |
| Kitchen   | 6     | "Oat & honey energy balls", "A pot of tea for someone you love"               |
| Quest     | 9     | "Confidence pages", "Friendship skills workbook", "Kindness lessons"          |
| Create    | 10    | "A paper pet to feed and keep", "A 3D paper house", "Color by number — sleeping fox" |

**Free / Premium split**: 12 activities free, **18 premium** (paid tier unlocks all).
**Reward stars across the curriculum**: 74 total.

### Angel Stars — the kindness economy
Founder calls this the **single most differentiated feature** of the product.

- Children earn stars by completing activities or by being kind in real life.
- **Children can also give stars TO their parents** (the reciprocal current — extremely rare in the wellness category).
- Parents can give a "stamp of being seen" back to the child.
- Stars unlock real rewards (story chapters, extra voice minutes, photo-album memory pages).
- A **Memory Photo Album** lets parents upload one photo per kind moment, building a year-long family scrapbook of small kindnesses.

### Free vs Paid Tier — Kids Universe

| Tier            | Price            | What's inside                                                              |
|-----------------|------------------|----------------------------------------------------------------------------|
| **Free always** | $0               | 1 hub of choice, 12 curriculum activities, daily mood check-in, basic Angel Stars (earn only) |
| **First Step**  | $39 (one-time)   | All 3 age hubs, 1 hour of Aurin voice time, all 30 activities, parent-stamp feature |
| **Eternal**     | $89 / month      | Unlimited voice time across all four rooms, full curriculum, full Angel Stars including the Memory Album, weekly Aurin reflection digest |
| **Universal Bank** | $12 (one-time) | 20 min of voice time top-up — works as a low-friction starter to test the voice room |

### Sticky moments (what brings parents back)
1. **The mood check-in → Today's Quest pipeline**: child marks today's mood, Aurin softly recommends 3 activities. No pressure.
2. **Reciprocal Angel Stars**: the child gives a star to their parent. Parents report this as "the most unexpectedly emotional thing the app does."
3. **The Memory Photo Album**: a slow-build family artefact that *cannot be replicated by any competitor*.

---

## 2 · PARENTS' ROOM (Sara) — Selling Points

### What it actually is
A voice room built specifically for parents. **Sara** is the AI presence. She is **not** another life coach. She is what the founder calls a "house listener" — held by Socratic questioning, never advice-shaped.

### Sara's exact tonal contract
- Never says: "you should…", "have you tried…", "experts recommend…"
- Always says: "what does this remind you of?", "where in your body did that sting?", "what would you tell your best friend if she said this to you?"
- **Never diagnoses**. **Never prescribes**. **Never measures**.

### The 4 things Sara is built for
1. **The things parents can't say in front of their child** (overwhelm, resentment, fear, regret about a recent moment)
2. **The things parents can't say in front of their partner** (an unequal load, a quiet drift)
3. **The things parents can't say in front of the school chat** (judgment, comparison, jealousy)
4. **The things parents don't even fully know yet** (the half-formed thought before it has words)

### Companion: Parent Wellness Portal
At `/parent-portal/wellness`:
- **7-day mood graph** of the parent's own check-ins (NOT the child's)
- **Anna's Weekly Letter** — one Friday letter, opt-in, opt-out one-click (already shipped)
- **Today's Quest** for parents (mood-based, just like the child's version)
- Eventually: **weekly digest of the child's emotional patterns** (privacy-respecting summary)

### Free vs Paid — Parents' Room

| Tier            | Sara voice                                  | Wellness Portal           | Anna's Letter |
|-----------------|---------------------------------------------|---------------------------|---------------|
| **Free**        | 20-min Universal Bank starter ($12)         | Full access               | Free, opt-in  |
| **First Step**  | 1 hour                                       | Full access               | Free          |
| **Eternal**     | Unlimited                                    | Full access + weekly child digest | Free   |

---

## 3 · Free → Paid Funnel (for influencer scripting)

The **most-converting path** (per the data design):

1. Parent arrives via influencer link → `/portal?key=MUSE…&ref=…`
2. CycleBanner shows "Cycle 01 · 249 of 250 spots remain"
3. Magic-link sign-in → automatic guest-key redemption (free 60 voice-minutes + Body Temple unlock)
4. First voice session in **Sara's room** (uses gifted minutes)
5. Adds child → child enters Kids Universe → completes one mood check-in
6. Within 7 days, parent receives Anna's Friday Letter
7. **Conversion moment**: parent upgrades to **Eternal $89/mo** OR child requests "more story chapters" → parent buys **First Step $39**

### Two distinct funnels we track separately

| Funnel name        | Code prefix | Destination       | Reward                 |
|--------------------|-------------|-------------------|------------------------|
| Influencer swarm   | `MUSE…`     | `/portal`         | 60 min + Body Temple   |
| Parent-to-parent   | `AURIN…`    | `/`               | $5 / $5 voice credit   |

These never collide. Analytics are kept separate in `/api/admin/marketing/analytics`.

---

## 4 · 🎯 Hooks for parent-focused influencers

Use whichever one matches your influencer's existing audience tone:

### Hook A · "The reciprocal star"
> "Most kids' apps reward children for being good. This one lets the child reward the parent back — and watching my 7-year-old solemnly award me a 'star for being patient when she was scared' has unmade me."

**Best for**: gentle-parenting influencers, sensory-parents, divorce/blended-family voices.

### Hook B · "The room nobody talks to"
> "There's a house room here that's built only for things parents can't say in front of their child, their partner, or the group chat. Sara doesn't fix it. She just lets you say it."

**Best for**: mental-load, ADHD-parent, peri-menopause, and "I'm not okay" content creators.

### Hook C · "Twenty-eight quiet days"
> "I unlocked $39 of body work that has no tracker, no graph, no streak. Day 8 was 'hand on heart for one minute' and I cried."

**Best for**: somatic, body-neutrality, slow-living, post-natal recovery voices.

### Hook D · "The family scrapbook that builds itself"
> "Every time my child does a small kindness, I tap one button and a photo lands in our family's Memory Album. By December we had 217 pages we'd never have remembered to take."

**Best for**: legacy-keeping, multi-generational, grandmother voices.

### Hook E · "The course we didn't realise we needed"
> "There's a free 7-day course inside Aurin about *the inner patterns around money* — scarcity voice, inherited family sentences, self-worth as a price. No budgeting. No hustle. Just listening."

**Best for**: finance-but-soft, women's-finance, motherhood-financial-anxiety voices.

---

## 5 · Demographic targeting — "the tired parent"

**Primary**: 30–48-year-old parent, one to three children, dual-income or single-income, has tried at least one wellness app, is allergic to "optimise yourself" language.

**Sub-segments worth targeting first**:
1. **Post-natal year 2** — emerging from baby fog, identity work
2. **Parents of the deeply-feeling child** — child who needs softer landings than school can give
3. **Re-entry parents** — returning to work after leave, carrying invisible guilt
4. **Inherited-trauma parents** — actively NOT raising kids the way they were raised

**Avoid targeting**: hustle-parent influencers, perfectionist-mom content, gentle-parenting accounts that aggressively shame.

---

## 6 · Technical assets ready for distribution

- ✅ **Guest-key endpoint** (`POST /api/admin/guest-keys/mint`) — mint 50 MUSE codes when ready
- ✅ **Validation** (`GET /api/guest-keys/validate?code=…`) — public, used by /portal
- ✅ **Redemption** (`POST /api/guest-keys/redeem`) — authed, idempotent
- ✅ **Conversion tracking** (`POST /api/marketing/ref-hit`) — auto-fires on every `?ref=` and `?key=` landing
- ✅ **Cycle banner** on `/portal` — live, scarcity-honest
- ✅ **Analytics** (`GET /api/admin/marketing/analytics`) — top hits, top redemptions, real conversion rate
- ✅ **28-day content calendar** — `/app/backend/marketing_engine.py` (all 5 hooks pre-written for X / LinkedIn / Instagram)
- ✅ **Daily digest script** — emails the founder copy-paste-ready posts every morning

### Founder's next physical step
Run once on a chosen launch morning:
```
python3 /app/backend/scripts/marketing_daily_digest.py --start-today
```
Then add cron `0 6 * * * python3 /app/backend/scripts/marketing_daily_digest.py --send`.

---

## 7 · Brand guardrails (NEVER violate in influencer briefs)

- ❌ No "transform your child" language
- ❌ No "in just 5 minutes a day" language
- ❌ No "experts say" / "studies show" appeals
- ❌ No urgency timers or "limited spots ending tonight"
- ❌ No before/after scripts
- ✅ Quiet curiosity > excitement
- ✅ "I noticed…" > "you must…"
- ✅ Show one small moment, never the whole transformation
