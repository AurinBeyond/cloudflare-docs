# Matrix Aurin — Go-to-Market Plan (founder-locked)

**Authored:** 2026-02-11
**Founder:** Anna
**Time budget:** 2–3 hours/day max
**North-star:** Max-automated AI agent ecosystem · founder runs from
remote (resort, garden, family time) · agents handle execution
**Validation window:** 7 days in real-people-time
**Positioning:** Tesla-style — "We exist. Here is why we are different."
Pre-revenue, philosophical, magnetic. No hard-sell.

This document is **the source of truth** for the Google Cloud setup,
the launch positioning, and the agent ecosystem roadmap. It will be
executed step-by-step. Nothing happens without it.

---

## PART A — Founder reality lock

Three things this plan respects above all else:

1. **2–3 hours/day max** of founder hands-on-keyboard time. Anything
   that does not fit into this window must be either (a) automated,
   (b) delegated to AI agents, or (c) deferred.
2. **Anna's content authority is the limit on platform speed.** No
   sprint adds new transmissions, courses, or curator letters that
   require Anna's authoring time unless she explicitly chooses to.
3. **No "build a feature, then hope for traffic"** anymore. Every
   feature from here forward must answer the question: *"What measurable
   signal will this produce in the 7-day validation window?"*

---

## PART B — The 7-day market validation sprint

**Goal:** Find out within 7 real-people-days which of our four cardinal
rooms (Body / Parents / Clarity / Course) attracts the most signal
from cold visitors. Not opinion. Data.

### Day 0 (today) — Push & deploy
- [x] Code is clean, lint green, snapshot taken
- [ ] Founder pushes "Save to GitHub"
- [ ] Founder pushes "Deploy"
- [ ] Verify `prulesoul.site` reachable, all 4 cardinals load, waitlist
      form accepts emails

### Day 1 — Telemetry foundation (≤ 60 min founder time)
**Why this first:** without GA4 we are flying blind in days 2–7.

1. Founder: create Google Analytics 4 property at
   https://analytics.google.com (NOT the same as Google Cloud Console —
   GA4 is free, no $300 credit consumed)
2. Founder: copy the Measurement ID (format: `G-XXXXXXXXXX`)
3. Founder paste the ID into the chat → agent wires it into the
   frontend (1 env var `REACT_APP_GA4_ID` + 1 small gtag.js loader,
   ~15 LOC, deploy-safe)
4. Founder: create Google Search Console property for `prulesoul.site`,
   verify ownership via the GA4 tag (one-click)
5. Agent: add a tiny event-emitter to the existing
   `compass-arm-{cardinal}` click handlers so we know which heading
   cold visitors click most

**Verify same day:** open GA4 → see your own test visit. If yes ✓
proceed. If no, agent fixes before moving on.

### Days 2–3 — Tesla-style "We Exist" positioning
**No new product. No new course. Pure visibility test.**

1. Founder writes **one short LinkedIn post** (10 min) in the Matrix
   Aurin register, linking to `prulesoul.site`. Content: the brand's
   irreducible thesis — *"We retired the word 'puberty'. Here's what
   replaces it."* (one screenshot of `/parents-room/subsystem` page).
2. Founder posts **one Instagram visual card** (10 min): tume graniit
   + one Sovereign Code law + `→ prulesoul.site` only.
3. Founder DM's the **5 named people** I asked about — sends them the
   link and asks one question: *"What does this make you feel?"*
   Captures the verbatim responses into `/app/memory/FOUNDER_FIVE_RESPONSES.md`.
4. NO promotion. NO ads. NO email blasts. We are measuring **organic
   curiosity signal**.

### Days 4–7 — Read the data
Founder spends 15 minutes/day reviewing GA4:
- Top-clicked compass cardinal
- Bounce vs scroll-past-compass rate
- Waitlist conversion per cardinal slug
- The five named friends' verbatim responses

**Decision gate at end of Day 7:**
- If 1+ cardinal cleanly leads → that cardinal becomes the season-one
  flagship room and gets the next content investment
- If responses are confused / register doesn't land → we adjust copy
  before adding any new feature
- If signal is silence → we revisit reach, not product

This is the **dispassionate audit Anna's tailoring business graduated
through 10 years ago**. Same logic applied here.

---

## PART C — Google Cloud setup (founder runbook)

The $300 credit is for **Cloud APIs (Compute, BigQuery, Cloud Functions,
Cloud Storage, Vertex AI)** — NOT for Google Analytics (free), Search
Console (free), or basic Gmail API quota (free tier).

**Project naming:** The project `alert-almanac-497709-c6` is Google's
auto-generated name and will be opaque in invoices. Create a new
project named **`matrix-aurin-prod`** before any API keys are issued.

### Step 1 — Create the dedicated project (5 min)
1. Open https://console.cloud.google.com
2. Top bar → project selector → "NEW PROJECT"
3. Name: `matrix-aurin-prod` · ID: leave auto-generated · Org: your
   personal account
4. Confirm. Switch to this new project.

### Step 2 — Link billing (1 min)
1. Billing → Link a billing account → your default account with $300
   credit
2. Confirm: billing dashboard shows `$300.00 promotional credit
   available`. Set a budget alert at $50 to protect yourself.

### Step 3 — Enable ONLY what we need this week (3 min)
APIs & Services → Library → enable:
- ✅ Google Analytics Data API (free, for reading GA4 from backend)
- ❌ Gmail API — NOT YET (Phase 2)
- ❌ Drive API — NOT YET (Phase 2)
- ❌ Vertex AI — NOT YET (Phase 3)

### Step 4 — Create credentials (5 min) — when ready for Phase 2
APIs & Services → Credentials → "Create credentials" → OAuth 2.0
Client ID. We will use this only when Phase 2 begins. Until then, the
$300 credit sits unspent.

**Key truth:** for Phase 1 (telemetry only), the $300 Cloud credit is
NOT consumed at all. GA4 + Search Console are free outside Cloud's
billing scope.

---

## PART D — Phased agent ecosystem roadmap

### Phase 1 — Telemetry (Week 1) · CURRENT
- GA4 + Search Console wired
- Compass-arm click events emitted
- Founder reviews daily (15 min)
- $300 credit consumed: **$0**

### Phase 2 — Waitlist auto-response agent (Week 2–3) · CONDITIONAL
Triggers only if Week 1 shows ≥ 20 organic visitors and ≥ 3 waitlist
sign-ups.

What it does:
- When `db.waitlist_entries` inserts a new row, a backend cron picks
  it up
- AI agent (Emergent LLM key, claude haiku 4.5) drafts a one-paragraph
  welcome transmission in the Matrix Aurin register, referencing the
  cardinal the user signed up for
- Gmail API sends from `connect@prulesoul.site`
- Founder reviews the first 5 outgoing emails manually before the
  agent goes auto

What it costs: ~$5–10 of Cloud credit/month for Gmail API at low
volume. $0 LLM cost (Emergent LLM key covers).

### Phase 3 — Content drafting agent (Month 2+) · CONDITIONAL
Triggers only if Phase 2 shows ≥ 1 paid conversion.

What it does:
- Anna writes a single seed sentence ("Today I want to address X")
- Agent expands into a draft Matrix Aurin transmission in the locked
  register (BRAND_VOICE_LOCK.md is the agent's system prompt)
- Anna approves / edits / sends — never more than 15 min of her time
  per transmission
- Output channels: weekly waitlist transmission email + LinkedIn post

This is the lever that lets her **work 2–3 hours/day from a resort**.

### Phase 4 — Voice content automation (Month 3+) · CONDITIONAL
- ElevenLabs already wired for Charlotte/Lily/Adam/Antoni
- Agent generates new audio transmissions from approved text scripts
- Optional: Aurin-voice teen-frequency channel (only when legal review
  complete)

### Phase 5 — Full autonomous ecosystem (Month 6+) · NORTH STAR
This is what Anna originally drew in the GitHub spec. The version we
ship will be:
- More minimal than the original sketch
- Validated step-by-step rather than built upfront
- Built on the telemetry that Phase 1 starts collecting today

---

## PART E — Operational hygiene (Anna's daily ritual)

**The 2–3 hour day, optimised:**

- **30 min — review** (GA4 dashboard, waitlist count, any inbound DMs)
- **30 min — one piece of public content** (one LinkedIn post OR one
  Instagram card OR one short audio transmission)
- **30 min — content authoring** (one Broken Clockwork letter, OR
  one curator transmission, OR one update to memory artefacts)
- **30 min — buffer** (5 named friends DM, deal with one operational
  item like Meta business setup, etc.)
- **0–60 min — agent supervision** (review what the agents drafted
  while you were away; approve or correct)

**Off-days are allowed.** Agents keep running, the platform stays up,
the waitlist keeps collecting. The system is designed to not require
daily founder presence.

---

## PART F — Anna's open operational items (from this session)

These are not blockers for the deploy but they sit on the runway:

| Item | Owner | Window |
|---|---|---|
| Meta business account fix | Anna | ~7 days |
| Google Cloud project rename to `matrix-aurin-prod` | Anna | Day 1 |
| GA4 property + Measurement ID | Anna | Day 1 |
| 5 named-friends DM | Anna | Days 2–3 |
| Charlotte/Lily voice listening test | Anna | Today |
| Polar.sh account approval | Anna | When Polar replies |
| Acts II–IV authoring (21 letters) | Anna | Founder choice |

---

## PART G — Honest red flags I want Anna to look at weekly

Each Sunday evening (15 min), Anna asks herself:

1. **Did I hear from a real person this week who is not paid by me?**
   (If 4 weeks in a row = no → product-market fit is the issue, not the
   features)
2. **How much money did the platform earn this week?** (raw number)
3. **How much credit / cash did the platform consume this week?** (raw number)
4. **Did I personally need to be on a keyboard more than 21 hours
   this week (3h × 7)?** (If yes → automation gap, fix it next week)
5. **Is GPT proposing things that violate BRAND_VOICE_LOCK?** (If yes
   → agent must push back before implementing)

These five questions are the **founder's instrument panel**. Not
emotion. Numbers and constraints.

---

## PART H — What success looks like at 90 days

**Soft win (acceptable):**
- 200+ waitlist members across the four cardinals
- 1+ paying customer (any tier)
- One viral moment (post, video, mention) ≥ 50K impressions
- Anna spent ≤ 21 hours/week on the platform

**Hard win (target):**
- 1,000+ waitlist members
- 20+ paying customers, mixed tiers
- One signed enterprise / family-office conversation in flight
- Phase 2 agent (waitlist auto-response) is live and producing real
  email outflow daily

**Failure pattern to avoid:**
- 90 days, 0 paying customers, Anna burned out from authoring 21+
  letters that no one paid to read. If we're heading there at Day 30,
  we pause and re-architect, we do not push through.

---

This plan is now saved. It will be re-read at the start of every
sprint. Any deviation requires Anna's explicit go-ahead.
