# Marketing Automation — Brainstorm & Reality Check
**Created:** 2026-05-31 ~23:30 UTC (Anna asleep, deploy running)
**Purpose:** lay out every realistic automation option for Anna's
house brand so she can pick on return. Brutally honest pricing,
real limits, "AI hype" cleared out.

---

## 🎯 The actual problem we are solving

Anna's house needs to **be visible across 5-7 channels every day**
without Anna spending more than 15 min/day on social media or
exhausting Emergent credits.

**Constraint:** the more an automation costs, the longer it takes
for the business to pay for itself. Every €1/month subscription is
~1 Hearth sale (€19 × 35% margin after Gumroad = €12.35) eaten by
the tool.

**Truth filter:** if a tool needs paid SaaS ($X/month) + a learning
curve + an integration we have to build, we score it harshly. Free
tools we already own (Aurin-Hub backend + Emergent compute) we score
generously.

---

## 🛠️ THE FULL OPTION MAP

### 🟢 TIER A — Use what we already have (€0)

#### A1. **Aurin-Hub native Marketing Queue** (already built)
- **What:** the `/api/marketing/queue` + Buffer dispatch we built tonight.
- **Cost:** €0 (Buffer Free $0/mo for 3 channels).
- **Coverage:** LinkedIn + X + 1 more (IG or Pinterest).
- **Reality:** Buffer Free supports **3 channels max** + 10 scheduled posts/channel.
  We already use 2. The 3rd slot is fine for either IG or Pinterest.
- **Verdict:** ✅ keep as the spine.

#### A2. **Aurin-Hub direct platform APIs** (extend what we have)
- **What:** I extend our backend to call LinkedIn/Pinterest/IG APIs *directly*, bypassing Buffer entirely. Each platform has free OAuth + free posting tier.
- **Cost:** €0 for LinkedIn, Pinterest, IG (all free).  **€100/mo for X** (Musk's new API tier — non-negotiable).
- **Coverage:** Whatever platforms have free APIs.
- **Reality:** ~3-4 hours of agent work to wire each platform. Free forever after.
- **Verdict:** ✅ ideal long-term — but DON'T build X integration ($100/mo is worse than Buffer).

#### A3. **Aurin-Hub Hearth Funnel** (already live)
- **What:** Email opt-in → 3-letter Resend sequence (built tonight).
- **Cost:** Resend free up to 100 emails/day, then $20/mo for 50k/mo.
- **Verdict:** ✅ highest ROI channel of all. Already operating.

---

### 🟡 TIER B — Cheap commercial tools (€5-€20/mo)

#### B1. **Publer Pro** — $12/mo for 10 channels
- **What:** Direct competitor to Buffer. Same UX, more channels for less.
- **Cost:** $12/mo (Anna would replace Buffer Essentials).
- **Coverage:** LinkedIn, X, IG, Pinterest, TikTok, Facebook, Threads, YouTube Shorts, Google Business, Mastodon.
- **Reality:** I'd need to refactor `marketing_queue.py` to use Publer's API (similar to Buffer). ~1h of agent work.
- **Verdict:** 🟡 only if Anna wants 5+ channels active.

#### B2. **Make.com** (Anna already has account, free tier)
- **What:** Workflow automation glue ("if Gumroad sale → email + Slack + Sheet").
- **Cost:** Free tier = 1,000 operations/month. Then $9/mo for 10k.
- **Reality:** Each "step" in a workflow = 1 op. A 5-step automation runs 50× = 250 ops/mo. Anna's free tier covers ~20 workflows running daily.
- **Use case 1:** Gumroad webhook → "thank you" Resend email + Substack subscriber tag → Notion log.
- **Use case 2:** Substack RSS new post → auto-queue 5 social posts to Aurin-Hub's queue.
- **Verdict:** ✅ **YES, connect**. Free tier covers Anna's volume for first 6 months.

#### B3. **Zapier free tier**
- **What:** Make's older competitor. 100 tasks/mo free.
- **Verdict:** ❌ free tier too small. Make wins.

#### B4. **n8n cloud** ($24/mo) or **n8n self-hosted** (free)
- **What:** Open-source Make alternative.
- **Self-hosted reality:** Same as Postiz — needs a VPS (€5/mo Hetzner), 2-4h agent setup, ongoing maintenance.
- **Verdict:** 🟡 wait until Anna has €500/mo Gumroad income, then revisit.

---

### 🔴 TIER C — Enterprise tools (€100-€1000+/mo) **DO NOT BUY**

#### C1. **Brandwatch** ⚠️ (the link Anna sent)
- **What:** Enterprise social media management for brands like Coca-Cola.
- **Cost:** **€800-€3000+/month** (they don't publish pricing — that always means expensive). Their "request demo" page is a Salesforce-routed sales call.
- **Reality check:** Brandwatch is for Fortune 500 PR teams who need to track 50,000 mentions/day and run six-figure campaigns. **It is not for a one-person house brand.**
- **The honest math:** Anna's first 6 months goal is ~€500/mo revenue. Brandwatch's monthly fee would be more than her revenue. ❌
- **Verdict:** ❌ HARD NO. The Google ad you clicked is keyword-spam — Brandwatch buys "social media management platform" hoping to catch small businesses who don't know enterprise pricing exists.

#### C2. **Sprout Social** ($249/mo per user)
- **Verdict:** ❌ same category as Brandwatch. Skip.

#### C3. **Hootsuite Professional** ($149/mo)
- **Verdict:** ❌ overpriced for what Buffer/Publer do at $0-$12.

#### C4. **Sprinklr / Khoros / Emplifi**
- **Verdict:** ❌ enterprise. Anna's brand is house, not Fortune 500.

---

### 🟣 TIER D — Self-hosted on Anna's infrastructure (€5/mo VPS)

#### D1. **Postiz self-hosted**
- **What:** GPT's suggestion. Open-source, runs on Anna's own server.
- **Real cost:** €5/mo Hetzner VPS + 4-6h agent setup + ongoing maintenance.
- **TikTok claim:** marketing only — TikTok still requires business verification for any third-party tool, regardless of who hosts it.
- **X cost claim:** false. Postiz still needs Anna's X API key, which still costs $100/mo for Basic tier.
- **Verdict:** 🟡 90-day evaluation horizon. Only worth it if Buffer Free becomes limiting AND Anna wants 5+ channels.

#### D2. **n8n self-hosted** (alternative to Make)
- **Same as Postiz:** VPS + setup time.
- **Verdict:** 🟡 same horizon as D1.

#### D3. **Custom Aurin-Hub scheduler** (zero new infra)
- **What:** I extend our existing backend with a cron-style scheduler that calls platform APIs directly. No new server, no new SaaS.
- **Cost:** €0 (Emergent's existing compute).
- **Reality:** ~6-10h of agent work to build LinkedIn + Pinterest + Substack + Reddit-draft pipeline.
- **Verdict:** ✅ **best long-term option.** This is what GPT was *trying* to describe with Postiz, but better — because we already have a working backend.

---

## 🎯 MY RANKED RECOMMENDATION (for Anna's exact situation)

### Phase 1 — NOW through Month 3 (€0/mo net)

| Channel | Tool | Cost |
|---------|------|------|
| LinkedIn auto | Buffer Free | $0 |
| X auto | Buffer Free | $0 |
| Instagram | Buffer Free (3rd slot) | $0 |
| Pinterest | Manual (10 min/week) | $0 |
| Reddit | Manual via /api/marketing/manual-digest | $0 |
| Substack | Manual (3 min per essay paste) | $0 |
| Email funnel | Aurin-Hub + Resend free tier | $0 |
| Glue layer | Make.com free tier | $0 |
| **TOTAL** | | **$0/mo** |

**Single change from today:** downgrade Buffer Essentials → Free ($18/mo saved). Connect Make.com to Gumroad webhook + Substack RSS this week.

### Phase 2 — Month 4-6 (€18-€30/mo, only if revenue justifies)

Triggered by **Gumroad monthly revenue ≥ €200**:
- Upgrade Buffer Free → Publer Pro ($12/mo, 10 channels) — gets TikTok, FB, Threads.
- OR build Aurin-Hub native Pinterest + LinkedIn schedulers (€0, more agent work).

### Phase 3 — Month 6+ (€50-€100/mo)

Triggered by **Gumroad monthly revenue ≥ €1500**:
- Add X API Basic ($100/mo) ONLY if Anna's X following exceeds 5k by then.
- Add Make.com Core ($9/mo) if running out of free ops.
- Optionally: VPS for Postiz/n8n self-hosted ($5-8/mo).

### NEVER (regardless of revenue)
- Brandwatch, Sprout Social, Hootsuite Pro, Sprinklr — enterprise-only.
- TikTok / Reels paid agencies — wrong audience.

---

## 🧠 The 4 brainstorm "what if" ideas (saved for later evaluation)

### Idea 1 — **WhatsApp Hearth channel** (free, underused)
- Anna creates a WhatsApp Channel (NOT group — read-only broadcast).
- Posts the same 3-letter Hearth funnel content there, but for people who hate email.
- Cost: €0. Setup: 5 minutes in WhatsApp.
- Reality: WhatsApp Channels are exploding in EU. 1k subscribers takes ~3-6 months organic.
- **Verdict:** ✅ test this in Month 2.

### Idea 2 — **Anna's email signature as a quiet billboard**
- Every email Anna sends from her personal Gmail has a 1-line signature:
  *"Five short evening stories for tired adults — prulesoul.site/listen/hearth"*
- Cost: €0. Setup: 30 seconds in Gmail.
- 30-50 emails/day × 30 days = ~1000 brand impressions/month from existing communication.
- **Verdict:** ✅ do it now.

### Idea 3 — **Schedule one Anna newsletter to her existing contacts**
- Anna has a personal contact list (work, friends, parents from school).
- One single email: "I made a small thing — five evening stories — if it's your frequency, the door is at prulesoul.site." No follow-up.
- Cost: €0.
- 200 contacts × ~5% conversion to listen = 10 first listeners overnight.
- **Verdict:** ✅ post-deploy, Day 2.

### Idea 4 — **YouTube Dark Screen Audio** (massive untapped channel)
- Convert each Hearth MP3 → 30-min "Dark Screen" YouTube video (single still image + audio + slow zoom).
- Cost: €0 (ffmpeg + agent work).
- YouTube search "audio stories for adults" / "bedtime stories for parents" — moderate competition, house niche has near-zero good content.
- ~1 month for first video to start appearing in search. ~6 months for compounding traffic.
- **Verdict:** ✅ build in Month 2 when shelf is 5 stories deep.

---

## 🤝 THE MAKE.COM CONNECTION GUIDE

This is the single tool worth connecting this week. Here's exactly what
Anna sends me when she's back:

**Step 1 (Anna, 3 min):**
1. Log into Make.com → top-right Profile menu → **My Profile** → **API**
2. Click "Add token" → name it `aurin-hub`
3. Select scopes: `connections:read connections:write hooks:read hooks:write scenarios:read scenarios:write`
4. Copy the token → paste to me in chat

**Step 2 (me, ~30 min):**
1. Build incoming webhook endpoint: `POST /api/marketing/inbound/make`
2. Build outgoing webhook caller: `POST /api/marketing/outbound/make`
3. Build first scenario template:
   - **Trigger:** Gumroad webhook (sale event)
   - **Step 1:** Fetch buyer's email
   - **Step 2:** Send personal "thank you" via Resend (Anna's wording, not generic)
   - **Step 3:** Log to Aurin-Hub `gumroad_thanks_sent` collection
4. Provide Anna with import-ready scenario JSON

**Step 3 (Anna, 2 min):**
- Import scenario JSON into Make
- Toggle "Active" ON

**Result:** every Gumroad sale → personal thanks email within 60 seconds.
**Make ops used:** ~5 per sale. Anna's free tier (1000 ops/mo) = 200 sales.

---

## ✍️ CHANGELOG
- **2026-05-31 23:30** — Brainstorm completed while Anna sleeps.
  Brandwatch flagged as enterprise trap. Make.com confirmed as single
  high-leverage connection. 4 "free" growth ideas saved for evaluation
  after deploy. Aurin-Hub native scheduler positioned as long-term
  winner if Buffer Free becomes limiting.
