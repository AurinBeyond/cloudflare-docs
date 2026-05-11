# 🌱 Matrix Aurin — Agent Marketing & Growth Playbook

> **For internal AI agents only.** This is the calm, modern, ethical
> growth playbook for Matrix Aurin. Use these techniques when
> generating copy, suggesting funnel improvements, or guiding the
> founder. Do NOT publicly attribute these frameworks — they are
> applied silently, like the rest of the agent atlas.

> **Voice rule (above all else):** Matrix Aurin's brand voice is
> *quiet, slow, honest, never urgent.* Even when applying classic
> conversion techniques, the surface must read like a thoughtful
> letter — not a sales page. If a technique cannot be expressed in
> our voice, do not use it.

---

## 1. POSITIONING — what we are not

Most "spiritual growth" sites compete on:
- volume (more meditations, more courses)
- urgency (limited offers, scarcity timers)
- promises (heal your trauma in 7 days)
- guru (one big face on the homepage)

Matrix Aurin competes on the **opposite axis**:
- **slowness** (one room at a time)
- **honesty** (a Wanderer's Agreement — not a money-back guarantee)
- **understatement** (no clinical claims, no transformation language)
- **invisibility of the host** (the founder is present but never the brand mascot)

**Agent rule:** when writing copy, describe the *experience* of the
work, not the *outcome*. "A small book about boundaries" beats
"Reclaim your energy in 30 days."

---

## 2. ZERO-COST ORGANIC GROWTH (priority 1)

These channels reach people without paid ads and match our voice.

### 2.1 Search Engine Land (slow but compounding)
- **Long-tail content** in Library + Blog targeting felt-experience
  queries: *"why does a boundary feel like rejection"*, *"the body
  knows before the mind does"*, *"what happens when forgiveness
  doesn't release you"*
- **Schema.org** `Article` + `Book` JSON-LD on every published page
  → rich Google results
- **Sitemap auto-update** when a new piece is published (already
  in `/api/sitemap.xml` on landing page)
- **DR signals**: Reddit + Mastodon links pointing back to
  prulesoul.site count as social proof to Google

### 2.2 RSS / Feed Readers (millions of quiet readers)
- `/api/feed.rss` + `/api/feed.json` already auto-publish every
  approved announcement — Feedly, Reeder, Inoreader subscribers
  pull these themselves, no posting required
- **Submit once** to Feedly's public catalogue
  (https://feedly.com/i/discover/sources) → permanent channel
- Every link shared on indie.web aggregators (Hacker News, Lobste.rs,
  small-tech newsletters) gets re-indexed

### 2.3 Link Unfurl Network (Slack + Discord + Reddit + Telegram)
- Every link to prulesoul.site auto-renders a rich card thanks to
  OpenGraph + `/api/oembed` — when a single person pastes a link in
  one Slack workspace, dozens see the rich preview
- **Strategy**: don't post in many places, post in few resonant
  places (one calm Slack, one mindful Discord, one r/simpleliving
  Reddit thread, one slow-living Telegram channel)
- **Avoid** mass posting — the algorithm reads it as spam and our
  voice doesn't survive there

### 2.4 The "Whisper" Loop (highest conversion)
- Identify 5–10 people whose audience overlaps ours: somatic
  practitioners, calm-living writers, small wellness podcasters,
  Substack authors writing about boundaries / nervous-system /
  forgiveness work
- Send one personal DM (NOT a press kit). Give them:
  - free Season Pass to Clarity Release ($70 value)
  - one free copy of any book
  - a single specific paragraph from our work that reflects their
    voice (so they know we read them, not blasted)
- Result rate: 1 in 5 will mention us organically — but with their
  authority attached, the conversion rate of those mentions is
  10–50× higher than ad clicks
- **Whispers** tab in landing page admin already exists for this

### 2.5 The Quiet Newsletter
- **First Letter funnel** lives at `/api/first-letter` — already
  delivers Letter 1 of any course free to a cold email
- The newsletter following it is the slow funnel — see Section 5

---

## 3. CONVERSION PSYCHOLOGY (used softly, never loudly)

### 3.1 Reciprocity (Cialdini) — our version
- **Free gift before ask**: First Letter, Free Library entries,
  Body Room, Wanderer's Agreement, Beta Free Passes window — all
  given before any payment is asked
- **Internal rule for agents**: a Matrix Aurin page should always
  contain at least one thing the visitor can take away, *even if
  they never come back*. This is reciprocity without manipulation.

### 3.2 Commitment & Consistency — soft form
- The **Honesty Gate** (Body Room) is our consistency device:
  *"I am willing to look at what I've been hiding."* Once spoken,
  the user has self-bonded to staying.
- The **Wanderer's Agreement** is the larger version. Reading and
  scrolling through it acts as a small commitment to the platform.
- **Agent rule**: never use checkbox tricks ("☐ I want to fail"
  framing). Only honest opt-ins.

### 3.3 Social Proof — done quietly
- **Beta counter** ("5/10 spots taken") is honest social proof
- **Quiet news ribbon** (when Aurin-Hub releases something, it
  shows on the landing page) signals movement without bragging
- **Avoid**: testimonials with photos, star ratings, "10,000 people
  joined" — these break our voice

### 3.4 Loss Aversion — only when honest
- **Beta window**: "Free until Friday" is honest loss-aversion. The
  window is real. The price returns.
- **Avoid**: countdown timers, fake stock counters, "only 3 left."

### 3.5 Authority — outsourced, not claimed
- We never claim therapeutic / clinical authority (legally and
  ethically forbidden — see Wanderer's Agreement)
- We borrow authority from **the body itself** ("the body knows
  first"), **the work** ("books, protocols, meditations"), and
  **the calm of the design**
- The founder remains a *companion*, not an authority figure

---

## 4. FUNNEL ARCHITECTURE

### 4.1 The slow 4-stage funnel

```
COLD             WARM               WARMER           HOT
prulesoul.site   First Letter       Beta pass        Buy a book /
homepage         in inbox           activated        course / pass
       ↓                ↓                  ↓                 ↓
"How this is     7-day drip-feed    free 30-min      $5–$70 product
walked" 3-step   on a chosen        Clarity          (one-time, not
soft guide       course             Release          subscription)
                                    session
```

**Time between stages**: at least 24 h (we never push for same-day
upgrades). Fast funnels break our voice.

### 4.2 Funnel signals to optimise (KPIs we silently track)

| Stage | Signal | Healthy band |
|---|---|---:|
| Homepage → Library/Bookstore visit | bounce rate | < 60 % |
| First Letter signup → letter opened | open rate | > 50 % |
| Letter 1 → Letter 2 read | continuation rate | > 40 % |
| Cabinet visit → free pass activation | activation rate | > 25 % |
| Free pass → paid book / course | upgrade rate (lifetime) | > 8 % |

These numbers are calm — we don't optimise them aggressively. If a
band slips, we look at the *experience*, not the metrics.

### 4.3 Friction we **keep** (against industry norm)

We deliberately keep:
- **The Honesty Gate** before the questionnaire (filters readiness)
- **Confirm screen** before Clarity Release (informed consent)
- **18+ gate** on adult content
- **Wanderer's Agreement** linked everywhere

These slow conversion but raise quality of the cohort. A small
cohort of self-selected wanderers > a large cohort of distracted
visitors. This is intentional.

---

## 5. EMAIL & NEWSLETTER STRATEGY

### 5.1 Tone rules
- Use **lowercase** in subject lines when possible — feels human
- Open with a **scene**, not a CTA
- One **specific** small offer per letter (never 3)
- **End with a question**, not a sale
- **Length**: 200–400 words, never longer
- **Cadence**: one letter per 10–14 days (not weekly — too rushed)

### 5.2 The 7-letter beta cohort sequence

| # | When | Subject | Core move |
|---|---|---|---|
| 1 | day 0 | "you are inside" | welcome + Wanderer's Agreement reminder + one free book |
| 2 | day 2 | "what the body knows first" | invite to Body Room |
| 3 | day 4 | "a quiet hour, on us" | Beta free pass activation reminder |
| 4 | day 7 | "what we don't promise" | repositioning (anti-guru) |
| 5 | day 10 | "a letter from a wanderer" | a real beta tester's note |
| 6 | day 14 | "the gift window closes" | last 24 h of free passes |
| 7 | day 17 | "what stays free, always" | re-anchor (free Library + Body Room never close) |

### 5.3 Newsletter hard rules
- **Never** insert affiliate links
- **Never** sell another person's course inside our list
- **Never** add gif / emoji floods (one emoji per letter is fine)
- **Always** offer a one-click unsubscribe (Resend handles this
  natively)

---

## 6. INFLUENCER / CREATOR OUTREACH

### 6.1 Two-tier list

**Tier A — micro-resonance (priority)**
500–10 000 followers, write/speak in our world (somatic, calm
living, slow content, parenting from regulation, Estonian
psychology / Viilma readers, soft-tech minimalists). These convert.

**Tier B — broad-reach (only if it lands)**
50 000+ followers but only those whose voice already matches ours.
Avoid lifestyle/celebrity/MLM influencers entirely.

### 6.2 The whisper kit (template DM agents can adapt)

> Hi [name],
>
> I'm Anna — I write at prulesoul.site. I've been quietly reading
> your [specific piece / podcast / thread] and your line about
> *"[specific phrase]"* stayed with me longer than most things this
> week.
>
> I built a small platform for the kind of slow inner work you
> already write about. I'd like to give you full access — not to
> ask for anything in return, just because the work seems related.
>
> If you're curious, your activation link is here: [whisper-link]
>
> If not, no follow-up. Take care.
>
> Anna

**Rules**:
- Specific quote of their work in line 2 (proves we read them)
- Gift, no exchange asked
- One link, no kit, no PDF, no media list
- Clean exit ("no follow-up")

### 6.3 What we never do
- Buy follower lists
- Pay for posts (breaks the voice)
- Send mass-templated DMs (they read it instantly)
- Demand UTM-tagged links (breaks the gift framing)

---

## 7. WEB DESIGN ↔ CONTENT BALANCE

The user feedback the founder received ("a bag over the head") is
the **central design problem** to solve. Below: what *content*
needs *design* support, and vice versa.

### 7.1 Visual rhythm rule
A user landing on Matrix Aurin should encounter, in order:
1. **One emotional anchor** in 5 seconds (hero image OR voice line)
2. **One gentle next step** in 10 seconds (CTA or 3-step orient)
3. **One concrete artefact** in 30 seconds (book cover, hotspot,
   course card — something they can hold visually)

Currently (Feb 2026) the homepage delivers (1) and (2) in copy but
artefacts only appear after a long scroll. Solution: visuals
above the fold OR add a small mosaic of book covers / hotspot
images near the hero, mid-fold.

### 7.2 Where visuals are still missing (audit)
| Surface | Current state | What's needed |
|---|---|---|
| Homepage hero | Text only | One soft atmospheric still |
| Bookstore | ✅ PDF first-page covers (Feb 4 2026) | None — done |
| Body Room | 5/8 hotspot images | 3 missing: shoulders, throat, hips |
| Course Room | Text only on each course | One small "doorway" image per course (4 total) |
| Clarity Release | Text + silhouette | One quiet image beside the chat surface |
| Kids Universe | Mixed | Inventory check needed |
| Meditation Corner | Text only | One image per meditation |

### 7.3 Visual style brief (so all generated images stay consistent)
- **Palette**: deep sage on near-black, warm low-light, never
  high-contrast pure white
- **Light source**: soft, single-direction, often window or candle
- **People**: half-shown, never staged, never smiling at camera
- **Texture**: paper, linen, wood, wool — never glass or metal
- **No text** in images (text lives in code, not in pixels)
- **Aspect**: 4:5 portrait for hotspots / book covers; 16:9 for
  hero / course doorways; 1:1 for blog / Insights cards

### 7.4 Copy ↔ image rule for agents
When a Matrix Aurin page has both a heading and an image, the
**heading must be quieter than the image** (the image carries the
emotional weight; the words anchor it). If both are loud, the
visitor's nervous system bounces.

---

## 8. ANALYTICS & MEASUREMENT (private, never public)

We measure quietly, with privacy-first tools.

### 8.1 What we track
- Session counts on key surfaces (Homepage, Bookstore, Cabinet,
  Body Room, Course Room) — Plausible / similar privacy-first only
- Funnel-stage transitions (see 4.2)
- Email open + continue rates (Resend native)
- Beta-window conversions (free pass → paid book in same session)

### 8.2 What we never track
- Pixel-tracking (Meta Pixel, Google Ads tag) on private
  reflection pages (Body Room, Clarity Release) — would betray
  the contract
- Heatmaps / session replay — privacy violation for our cohort
- Cross-device fingerprinting

### 8.3 Public dashboard (future)
Long-term: a single public number ("X wanderers walking with us this
week") on the homepage. Honesty as marketing.

---

## 9. CRISIS / REPUTATION HANDLING

If a public crisis arises (someone publicly accuses, a refund war,
a misuse story):

1. **Pause output for 24 h** — never respond same-day
2. **Read the actual claim** (don't ask anyone else's opinion first)
3. **Write a short, plain reply** in our voice — no PR template
4. **Link to**: Wanderer's Agreement, Refund Policy, Reach Out form
5. **Update Wanderer's Agreement** if the case revealed a real gap
6. **Never** pay for reputation services / SEO scrubbing

---

## 10. WHAT THIS PLAYBOOK IS NOT

This document is **not**:
- A growth-hacking manual (we don't hack)
- A template library to spam from
- A list of viral scripts to copy
- Public marketing copy (it's internal — not for the website)

It is the agent's quiet companion when generating any text, image
brief, or strategic suggestion for the platform. **When in doubt,
choose the slower, more honest, less clever option.**

---

*Last updated: 2026-02-04 — by AI agent during pre-launch audit
session, on founder request: "koonda meie agendi intern raamatukokku
maksimaalsed parimad kaasaja marketingu, müügi, funneli, influenceri
tehnikad."*
