# PRULESOUL · MARKETING MASTER PLAN
**Locked:** 2026-05-31 (post Phase 1.1 Deploy)
**Author:** Anna + agent, synthesised from GPT strategy + agent audit
**Status:** Operational — execution starts immediately.

---

## 1. THREE PARALLEL LINES (each runs independently)

| Line | Audience | Hero product | PSP | Primary URL |
|------|----------|--------------|-----|-------------|
| **🌐 Polarstar Kids** | Tired parents, screen-free families | €9 PDF + free audio companion | Gumroad | `/kids-universe/polarstar` + `/listen/little-star` |
| **🌑 Matrix Aurin (Adults)** | Night thinkers, creators, engineers, parents-after-9pm | Sanctuary rooms, soundscapes, essays | (TBD next sprint) | `/` + four mentor rooms |
| **⚡ Clarity Release** | High-performers, founders, leaders | Premium pass — daytime cognitive clarity | LemonSqueezy | `/clarity-release` |

**Rule:** Each line gets its own funnel, its own social presence, its own analytics goal. No cross-contamination of language ("bedtime" never appears on Clarity; "founder mode" never appears on Polarstar).

---

## 2. DAILY VISIBILITY RHYTHM (the "every day, everywhere" engine)

A single founder cannot maintain 5 platforms daily. The system below uses **batched content** + **weekly cadence** to feel daily.

### Weekly publishing cadence

| Day | Action | Platform | Effort |
|-----|--------|----------|--------|
| **Mon** | Substack essay (~600 words) | Substack/Medium | 60 min |
| **Tue** | Reddit comment / answer (no link) on 1 thread | Reddit (r/Parenting, r/SlowLiving, r/getdisciplined) | 20 min |
| **Wed** | Pin 3 images to Pinterest (Polarstar covers / Aurin night moods) | Pinterest | 10 min |
| **Thu** | YouTube short or TikTok (60s audio + hero image, vertical) | YouTube/TikTok | 30 min |
| **Fri** | Hacker News comment on 1 thread + a quiet personal note | HN | 15 min |
| **Sat** | Off (or repurpose Mon's essay into a Twitter/X thread) | X/Threads | optional |
| **Sun** | Read Aloud Sunday photo (Polarstar challenge) or Clarity reflection | IG/Threads | 15 min |

**Total founder time:** ~3.5 h/week of active publishing. Compounds over 12 weeks.

### Per-line content sources

| Line | Recurring content | Where it lives |
|------|------------------|----------------|
| Polarstar | "How tonight went" parent stories, story behind each story, audio teasers | Substack, IG/Pinterest, YouTube |
| Matrix Aurin | Essays: "Cognitive cost of unfinished loops", "What screen-down hours give back" | Substack, HN, X |
| Clarity Release | Founder/builder essays: focus rituals, deep work without burnout | Substack, HN, LinkedIn |

---

## 3. THE BIG SWINGS (low-frequency, high-impact)

### Swing #1 — Show HN (one shot)
- **When:** within 14 days of deploy, Tuesday 10:00 UTC
- **Title:** *"Show HN: I built a bedtime story platform with no app, no tracking, no AI for kids (€9 PDF, free audio)"*
- **Body:** founder confession (anti-marketing). Pure Anna voice.
- **Backup:** if it doesn't hit front page, recycle as the FIRST Substack essay (the post is already 80% of an essay)
- **File:** `/app/memory/show_hn_draft.md` (exists, needs final pass)

### Swing #2 — Adult-line Substack launch essay
- **Title:** *"The Cognitive Cost of Unfinished Loops"* (GPT's suggestion — strong)
- **Anchors:** Matrix Aurin sanctuary as the "container" for closing loops
- **CTA:** Free read; if it resonates, visit `/clarity-release` (Clarity) OR a future Matrix Aurin sound pass

### Swing #3 — YouTube channel seeding (3 videos in batch)
- **Format:** Static hero image + gentle pulsating star (CSS-style animation, ffmpeg-rendered) + voiced story
- **Length:** 2 min each, vertical 9:16 + horizontal 16:9 versions
- **Videos:**
  1. Little Star (already have audio + hero)
  2. Why I built Polarstar (founder voice, 90s)
  3. "Night-mind protocol" (Matrix Aurin teaser, adult line — 2 min meditation script + quiet ambient)
- **Effort:** 1 weekend production sprint with agent's ffmpeg help

---

## 4. INFLUENCER OUTREACH — 20-NAME BATCHED PLAN

**Discipline:** never approach more than 5 at a time. Pause 7 days between batches to track responses. No paid campaigns — only **gifted** access.

### Batch 1 (Week 2) — Sleep specialists (highest conversion if they reply)
1. **@takingcarababies** (Cara Dumaplin) — DM Instagram
2. **@thesleepchef** — Instagram + website contact
3. **@babysleep.answers** (Andrea De La Torre) — Instagram
4. **@heavensentsleep** (Rachel Mitchell) — Instagram
5. **@sleepyislands** — Instagram

### Batch 2 (Week 3) — Screen-free / gentle parenting
6. **@jerricaannesnes** (Jerrica Sannes)
7. **@screenfreeparenting** (Dr. Meghan Owenz)
8. **@raisingwellkids** (Lizzie Assa)
9. **@transformingtoddlerhood** (Devon Kuntzman)
10. **@curious.parenting**

### Batch 3 (Week 4) — Minimalist / slow living moms
11. **@ashlynne.eaton**
12. **@the.minimalist.mom** (Dawn Madsen)
13. **@simplefamilies** (Denaye Barahona)
14. **@slowlivingmom**
15. **@cozy_minimalist** (Myquillyn Smith)

### Batch 4 (Week 5) — Podcast hosts + magazines (highest authority)
16. **@janetlansbury** ("Elevate Childcare" podcast)
17. **@drbeckyatgoodinside** ("Good Inside")
18. **@themindfulparentingpodcast**
19. **@untigering** (Iris Chen)
20. **@mothermag** (Mother Magazine)

### Outreach template — Anti-Marketing Pitch (DO NOT alter the structure)

> Hey [Name], I'm the voice and creator behind Polarstar.
>
> I got tired of flashing screens and subscription apps at bedtime, so I built a single, quiet audio sanctuary for my own child. Here is a completely free link to "Little Star" — `prulesoul.site/listen/little-star`. No login, no download required. Just hit play in a dark room.
>
> If it helps your little one drift off to sleep, I'd love to gift your family the full book companion. No expectations, no required mention. Keep the lantern lit.
>
> — Anna

**Tracking:** spreadsheet at `/app/memory/influencer_log.md` (created next sprint). Columns: name, batch, sent date, replied (Y/N), gifted (Y/N), posted (Y/N), conversion attribution.

---

## 5. ANALYTICS — THE MEASUREMENT FOUNDATION (Sprint 2, week 1)

| Tool | Purpose | Why |
|------|---------|-----|
| **Plausible** (or Umami) | Privacy-first analytics, no cookie banner | Brand-aligned: "no tracking" promise preserved |
| **Google Search Console** | Indexation + organic queries | Free, mandatory for SEO |
| **Updated sitemap.xml** | Lists `/listen/little-star`, 5 story pages, Clarity, mentor rooms | Currently missing — Google can't find them |
| **Per-line conversion goals** | (a) PDF purchase, (b) Clarity pass, (c) Substack signup | Track which line actually converts |

**Implementation effort:** agent does this in 2-3 hours. Founder needs only:
- A Plausible account (free tier covers prulesoul.site easily)
- A Google Search Console account
- A Substack URL (decide on a handle)

---

## 6. THREE LINES — PARALLEL EXECUTION TABLE

| Item | Polarstar | Matrix Aurin (adult) | Clarity Release |
|------|-----------|---------------------|-----------------|
| Landing page | ✅ Live | ✅ Live (/) | ✅ Live (/clarity-release) |
| Free preview | ✅ /listen/little-star | ❌ TODO: free 5-min sample sound | ❌ TODO: free Clarity day guide |
| Audio asset | ✅ Little Star | ❌ TODO: 1 sample night soundscape | n/a |
| Hero illustration | ✅ Little Star hero | ❓ Decide aesthetic | ✅ Likely exists |
| Substack feed link | ❌ TODO | ❌ TODO | ❌ TODO |
| Analytics goal | PDF sale (€9 Gumroad) | Substack signup → future pass | Clarity Release pass (LemonSqueezy) |

**Note:** Polarstar is the only fully shipped line. Matrix Aurin (adult sound + essay) and Clarity Release (positioning + free preview) are the next two production sprints.

---

## 7. SPRINT 2 — CONCRETE TASK LIST (next 7 days, agent-executable)

| # | Task | Owner | Lines affected |
|---|------|-------|----------------|
| 1 | Install Plausible (or Umami) analytics script | agent | all 3 |
| 2 | Update sitemap.xml — add 5 stories, /listen, /clarity-release, /parents-room | agent | all 3 |
| 3 | Add Google Search Console verification meta tag | agent | all 3 |
| 4 | Finalise Show HN draft (`show_hn_draft.md`) | agent + founder | Polarstar |
| 5 | Create `/seven-quiet-nights` challenge landing page | agent | Polarstar |
| 6 | Draft Substack essay #1: *"The Cognitive Cost of Unfinished Loops"* | agent + founder | Matrix Aurin |
| 7 | Write Clarity Release "free 1-page guide" lead magnet | agent + founder | Clarity |
| 8 | Generate one ambient 5-min adult soundscape (ffmpeg or stock + voiceover) | founder records | Matrix Aurin |
| 9 | Create `/app/memory/influencer_log.md` tracker | agent | Polarstar (mostly) |
| 10 | Set up shared Substack publication (one handle, three tags) | founder | all 3 |

**Sprint 2 total agent time:** ~6 hours.
**Sprint 2 total founder time:** ~3 hours (Substack handle, Plausible account, soundscape recording, essay review).

---

## 8. SUCCESS METRICS (90-day check)

| Metric | Polarstar | Matrix Aurin | Clarity Release |
|--------|-----------|--------------|-----------------|
| Pageviews on hero page | 5,000+ | 2,000+ | 1,000+ |
| Email/Substack signups | 200+ | 150+ | 80+ |
| Conversions (paid) | 30+ PDFs | n/a (free phase) | 10+ passes |
| Influencer replies | 5+ of 20 | n/a | n/a |
| Show HN front-page rank | top 30 | n/a | n/a |
| YouTube channel subs | 100+ | (shared) | (shared) |
| Pinterest monthly views | 10,000+ | n/a | n/a |

**If 50% of these metrics hit:** the system works. Double down.
**If less:** the problem is **distribution**, not product. Rotate which platforms get focus.

---

## 9. WHAT WE EXPLICITLY DO NOT DO

- ❌ Paid Facebook/Google/Instagram ads (brand mismatch + flagged by PSPs)
- ❌ Push notifications
- ❌ Cookie banners
- ❌ Exit-intent popups
- ❌ "Limited time offer" countdowns
- ❌ Affiliate networks (yet)
- ❌ AI-generated marketing copy claiming to be human
- ❌ Buying followers / engagement pods

---

## 10. THE PRINCIPLE

> "Vaikuses olemine ei tähenda, et me ei levita oma infot igale poole.
> See tähendab, et me teeme seda väga efektiivselt, samas omamoodi —
> mitte nii nagu teised."
> — Anna, 2026-05-31

---

*Agent reads this before any marketing or content production. Updates require founder approval; rationale logged in CHANGELOG section below.*

## CHANGELOG
- **2026-05-31** · v1.0 · Initial lock. Three lines mapped. Sprint 2 task list issued. 20 influencers batched into 4 waves. Plausible + Substack + sitemap selected as foundation tools.
