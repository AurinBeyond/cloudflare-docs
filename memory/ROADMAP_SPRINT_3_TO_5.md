# SPRINT 3 → 5 ROADMAP
## "Balance the House" — from 2 products to 5
**Locked:** 2026-05-31 (Anna's directive: stop circling Polarstar, fill empty rooms)
**Discipline:** one bundle per sprint, in order. No skipping. No expanding the prior sprint.
**Source for distribution channels:** Anna's research + GPT curation (2026-05-31 chat).

---

## EXECUTION ORDER (locked by GPT recommendation accepted by Anna)

1. **Sprint 3 — The Hearth Protocol** (Parents' Room) → €19
2. **Sprint 4 — 5 Quiet Audios** (Meditation Corner / Matrix Aurin) → €12
3. **Sprint 5 — Alistair Bundle** (Course Room) → €39
4. **Backlog (deferred)** — Body Temple 28-day → after Sprint 5 ships

Rationale: smallest bundle first (Hearth = audio + 1 PDF), then audio-only,
then bundle-of-three. Body Temple is course-sized and goes last.

---

# SPRINT 3 — The Hearth Protocol (€19)

## What it is
A short, written-and-spoken protocol for the parent who is **alone**
(child asleep, partner offline, the day ending). Not for parent+child.
Not screen-time advice. A 20-minute structured wind-down for the
person who has been Anchor OS for the household all day.

## Contents

| # | Asset | Format | Estimated effort |
|---|-------|--------|------------------|
| 1 | The Hearth Protocol PDF (~12 pages) | PDF, A5 | 1 weekend writing + agent layout |
| 2 | Hearth Audio Companion | MP3, ~15 min | 1 evening recording (Anna) |
| 3 | "The Inheritance Inventory" worksheet | PDF, 1 page | 30 min agent |
| 4 | One quiet evening soundscape | MP3, 30 min, looping | 1 evening (Anna voice + ambient) |

**Total package:** PDF (12-page protocol) + Worksheet (1p) + 15-min
audio + 30-min ambient = ~€19 fair price.

## Audience (Group B — parents alone)
- **Door:** *"You spent the day decoding what your parents handed you,
  and what your kids hand you. This is the 20-minute protocol for
  closing the day's open loops before sleep."*
- **NOT a Polarstar audience.** This is the parent's own room, not the
  child's bedtime.

## Pricing
- **€19** — one-time, no subscription
- **PSP: Gumroad** (Anna's Gumroad account already configured, second
  product can be added under same account, same webhook)
- **Refund:** 14-day no-questions, identical to Polarstar policy

## Distribution channels (per GPT's curated list)

### 🌟 World 1 leakage (allowed — Polarstar buyers who are also parents alone)
- One quiet email to Polarstar PDF buyers via Resend (Gumroad followers
  feature): *"For when the children are asleep — a 20-min protocol for
  you. The Hearth Protocol, €19."*
- No bundle discount required, but offer "Polarstar + Hearth" combo
  price (€25 for both) for 7 days only after launch.

### World 2 leakage (allowed — adults who already trust Anna's voice)
- Substack section: **Polarstar Letters** + **Matrix Aurin Notes**
  both get a one-paragraph announcement essay
- Title for the announcement: *"The Inheritance Inventory: what I do
  when the children are finally asleep"*

### Reddit (parent-alone subs)
- `r/Parenting` — post titled *"What I do in the 20 minutes after the
  kids are finally asleep (and why I stopped scrolling)"*
- `r/AttachmentParenting` — quiet post about decompression rituals
- `r/Mommit` and `r/Daddit` — separate posts, different angles
- **No link in post body.** Link only if asked.

### Specifically NOT allowed (per Four Worlds Rule)
- ❌ Pinterest pin (wrong audience — Pinterest parents want kid-facing content)
- ❌ Hacker News (wrong audience entirely)
- ❌ r/productivity, r/getdisciplined (wrong audience — this is not a focus tool)

## Sprint 3 task list

| # | Task | Owner | Estimated time |
|---|------|-------|----------------|
| 1 | Anna writes the 12-page Hearth Protocol manuscript | Anna | 6 hours over 1 weekend |
| 2 | Agent designs the PDF layout (matching Polarstar Visual Bible — calm cream + amber) | agent | 2 hours |
| 3 | Anna records the 15-min audio companion | Anna | 1 evening |
| 4 | Agent processes audio (ffmpeg, same script as Little Star) | agent | 30 min |
| 5 | Anna records 30-min ambient evening soundscape | Anna | 1 evening |
| 6 | Agent builds `/the-hearth-protocol` landing page (Polarstar visual lineage but **adult palette** — deep blue + cream, NOT children's gouache) | agent | 3 hours |
| 7 | Agent creates Gumroad product "The Hearth Protocol" via API (re-use `gumroad_update_description.py` pattern) | agent | 30 min |
| 8 | Agent adds Hearth section to Parents' Room (`/parents-room`) | agent | 1 hour |
| 9 | Anna writes the announcement Substack essay | Anna | 90 min |
| 10 | Anna sends Reddit posts in 3 spaced-out evenings (not all at once) | Anna | 30 min × 3 |

---

# SPRINT 4 — 5 Quiet Audios (€12)

## What it is
A 5-piece audio pack for adults who lie awake at 2am. Pure audio.
No PDF, no protocol, no chat. Just the voice + ambient.

## Contents (each ~5–7 min)
1. *Closing the Day's Loops* — guided offload
2. *The Empty Terminal* — silent breath protocol
3. *The Slow Inventory* — what you carry, what you can put down
4. *Night Mind* — for when sleep won't come
5. *Quiet Return* — for waking at 3am and falling back asleep

**Total package:** 5 × MP3 (~30 min total) = €12 fair price.

## Audience (Group C — adults at 2am)
- **Door:** *"You're awake. Again. Here are five audios that don't ask
  you to install anything, log in, or rate them."*

## Pricing
- **€12** — one-time, no subscription
- **PSP: Gumroad** (same account, third product slot)

## Distribution channels

### Substack (Matrix Aurin Notes section)
- Essay: *"Five Audios I Made for the Hour I Hate Most"*
- Free preview: 1 of the 5 audios at `/listen/closing-the-loops`
  (mirror the `/listen/little-star` pattern — same architecture, adult palette)

### Reddit (adult night audience)
- `r/digitalminimalism` — *"I stopped using sleep apps and made my own audio instead"*
- `r/Insomnia` — quiet post, no link
- `r/SlowLiving` — minimalist angle
- `r/simpleliving` — same

### Hacker News (Show HN Shot #2 — Matrix Aurin, Week 6 of plan)
- *"Show HN: A private, non-therapy house to offload cognitive debt"*
- Free audio preview is the killer hook for HN's anti-app sensibilities

### Dev.to / Hashnode (per GPT list)
- Cross-post the Substack essay with a tech twist:
  *"Killall processes: ambient soundscapes for post-screen recovery"*

### YouTube (lofi/ambient niche)
- Upload all 5 audios as 1-hour looped videos with static dark visual
- Description links to Gumroad product
- This is **YouTube SEO**, not "channel building"

### Specifically NOT allowed
- ❌ Pinterest (wrong audience)
- ❌ Polarstar PDF buyers' email list (wrong door)
- ❌ Parenting Reddits (wrong audience)

## Sprint 4 task list

| # | Task | Owner | Est. time |
|---|------|-------|-----------|
| 1 | Anna writes 5 voice scripts (~700 words each) | Anna | 4 hours |
| 2 | Anna records 5 audios in one evening | Anna | 2 hours |
| 3 | Agent processes (ffmpeg, same Little Star pipeline) | agent | 1 hour |
| 4 | Agent creates `/listen/closing-the-loops` free preview page (mirror `/listen/little-star`, adult palette) | agent | 1 hour |
| 5 | Agent creates `/five-quiet-audios` landing page | agent | 2 hours |
| 6 | Agent uploads to Gumroad via API + creates product (€12) | agent | 30 min |
| 7 | Agent generates 5 YouTube 1-hour looped videos with ffmpeg | agent | 2 hours |
| 8 | Anna writes Substack announcement essay | Anna | 90 min |
| 9 | Show HN post + Dev.to cross-post | Anna | 30 min |

---

# SPRINT 5 — Alistair Bundle (€39)

## What it is
Three of Alistair's existing course-room protocols packaged as a single
purchasable bundle. The Course Room already has course content surface —
this sprint creates a unified SKU for it.

## Contents (TBD with Anna's input)
- **Protocol 1:** TBD (Anna picks)
- **Protocol 2:** TBD
- **Protocol 3:** TBD
- Each protocol = PDF + optional audio reading by Anna

## Audience (Group D — sovereign operators, builders, focused workers)
- **Door:** *"Three protocols you can run instead of installing another
  productivity app. One per quarter. Permanent ownership."*

## Pricing
- **€39** — one-time bundle, no subscription
- **PSP: Gumroad** (fourth product slot — same Gumroad account)

## Distribution channels

### Hacker News (Show HN Shot #1 — Clarity Release, Week 2 of plan)
- *"Show HN: I built a daytime focus protocol because every productivity app made me anxious"*
- This is the HN-native product. Anchor product for World 3.

### Reddit (builder audience)
- `r/getdisciplined`, `r/productivity`, `r/SelfImprovement`
- `r/RoamResearch`, `r/ObsidianMD`, `r/NotionSo` (per GPT's deeper niche list)

### LinkedIn
- Anna's profile: long-form essay *"I stopped using productivity apps. Here's the 3-protocol bundle I run instead."*

### Product Hunt
- **Official launch** when bundle ships. Tag: Productivity, Self Improvement.

### Indie Hackers + builder newsletters (GPT's curated list)
- Outreach to TLDR, Every, Indie Hackers podcast hosts
- Cross-promote with similar quiet-productivity Substacks

### Specifically NOT allowed
- ❌ Parenting subs
- ❌ Pinterest
- ❌ Polarstar buyer email list

## Sprint 5 task list

| # | Task | Owner | Est. time |
|---|------|-------|-----------|
| 1 | Anna picks 3 protocols from Course Room catalogue | Anna | 1 hour |
| 2 | Agent extracts content from existing Course Room data, builds bundle PDF | agent | 3 hours |
| 3 | Anna records optional audio versions of 3 protocols (optional) | Anna | 2 hours if she opts in |
| 4 | Agent creates `/alistair-bundle` landing page | agent | 3 hours |
| 5 | Agent creates Gumroad product (€39) | agent | 30 min |
| 6 | Anna writes Show HN draft | Anna + agent | 90 min |
| 7 | Anna writes Product Hunt launch copy | Anna + agent | 60 min |
| 8 | Anna writes LinkedIn essay | Anna | 90 min |

---

# AFTER SPRINT 5 — house balance reached

| Room | Product | Price | Status after Sprint 5 |
|------|---------|-------|------------------------|
| Clarity Release | Pass (LemonSqueezy) | per tier | ✅ Existed before |
| Aurin's Room / Polarstar | €9 PDF + free audio (Gumroad) | €9 | ✅ Existed before |
| Parents' Room | Hearth Protocol (Gumroad) | €19 | ✅ Ships Sprint 3 |
| Meditation Corner | 5 Quiet Audios (Gumroad) | €12 | ✅ Ships Sprint 4 |
| Course Room | Alistair Bundle (Gumroad) | €39 | ✅ Ships Sprint 5 |
| Body Room | Body Temple 28-day | (TBD) | ⏸ Backlog |

**Result:** 5 active products across 5 rooms (counting Polarstar +
Aurin's Room as one) — the house is balanced.

---

# CHANGE LOG

- **2026-05-31** · v1.0 · Locked after Anna's hard course-correction
  *"sa ikka jälle tuled selle laste teemale"*. Sprint order:
  Hearth Protocol → 5 Quiet Audios → Alistair Bundle.
  Body Temple deferred to after Sprint 5. No new Polarstar work until
  at least Sprint 3 ships.
