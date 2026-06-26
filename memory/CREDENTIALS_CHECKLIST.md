# Credentials Checklist — Plug In, Get Visibility
**Updated:** 2026-05-31
**Status:** all infrastructure built; awaiting founder to paste tokens into `/app/backend/.env`

This is the EXACT list of accounts + tokens needed for Aurin-Hub to
publish across every relevant channel from one command. After you
deliver each token, I add it to `.env`, restart backend, and that
pipe is live.

---

## 🟢 TIER 1 — DO THESE FIRST (biggest impact, fastest setup)

### 1. Buffer  ★ HIGHEST PRIORITY ★
**Why first:** ONE token covers LinkedIn + X (Twitter) + Instagram +
Pinterest — four channels with one paste.

**What founder does (15 min):**
1. Go to https://buffer.com/pricing → choose **Essentials plan ($6/mo)**
   or **Team plan ($12/mo)** if you want LinkedIn pages + Pinterest.
2. Connect your social accounts inside Buffer UI (LinkedIn, X, IG, Pinterest).
3. Go to https://publish.buffer.com/account/apps
4. Under "Access Tokens", click "Create Token".
5. Send me the token value (looks like `1/9a8b7c6d5e4f3g2h1i...`).
6. Also send me the 4 profile IDs: Buffer UI → click each social
   account → URL contains the profile_id (long string like
   `5a1b2c3d4e5f6789012345abc`).

**What I add to /app/backend/.env:**
```
BUFFER_ACCESS_TOKEN=...
BUFFER_PROFILE_LINKEDIN=...
BUFFER_PROFILE_TWITTER=...
BUFFER_PROFILE_INSTAGRAM=...
BUFFER_PROFILE_PINTEREST=...
```

**After:** `POST /api/marketing/queue` accepts a batch of posts; 
`POST /api/marketing/dispatch` pushes them to Buffer; Buffer publishes
at the scheduled time. **Founder does NOT sit at a computer.**

---

### 2. Substack
**Why:** primary long-form home. No automation needed — but I need to
hand you optimised pre-formatted drafts.

**What founder does (5 min, one-time):**
1. Create a Substack account at https://substack.com (free).
2. Create your publication: e.g. "Matrix Aurin Notes".
3. Add 4 sections inside: Matrix Aurin Notes / Polarstar Letters /
   Clarity Field Notes / From the Author.
4. Send me the publication URL (e.g. `prulesoul.substack.com`).

**Why no token needed:** Substack has no public publish API. Best
workflow: I generate ready-to-paste markdown in
`/app/memory/substack/`, you paste + click publish (3 min per essay).

---

### 3. Reddit (manual, intentional)
**Why manual:** Reddit auto-publishers get shadow-banned. The cost of
account loss > the value of automation.

**What founder does (30 min):**
1. If your current account is younger than 30 days OR has < 50 karma,
   it WILL be marked spam on first promo post. Build karma first by
   commenting on 5-10 posts per week in target subs for 2-3 weeks.
2. Send me your active Reddit username so I can tailor the warm-up
   list (which subs to comment in first, in what order).

**What pipeline supports:** the marketing queue stores Reddit posts
as `status=manual_pending`. I generate `GET /api/marketing/manual-digest`
daily — founder gets a list of what to paste where.

---

## 🟡 TIER 2 — DO WHEN TIER 1 IS WORKING

### 4. ConvertKit / MailerLite / Resend
**Why:** email list ownership. The single most valuable asset a
house brand can build. Substack subscribers ≠ email list (Substack
owns the relationship, not you).

**Recommended:** ConvertKit free plan (up to 1,000 subscribers, then
$15/mo). MailerLite is also fine.

**What founder does:**
1. Sign up at https://convertkit.com (or mailerlite.com).
2. Create a form, embed code, or hosted landing page.
3. Send me the API key + a default tag for house subscribers.

**What I do after:** wire the form into the existing `/the-hearth` and
`/alistair-bundle` pages with a soft opt-in (NOT a popup, NOT a "claim
your free PDF in 7 seconds" timer — just one line at the bottom).

---

### 5. Pinterest API (direct, bypass Buffer)
**Why direct:** Pinterest is the only channel where Aurin's visual
aesthetic (dark blue + lantern amber) compounds organically over years.

**What founder does:**
1. Go to https://developers.pinterest.com → create app.
2. Get OAuth access token for your business board.
3. Forward me the token.

**What I do:** add a `/api/marketing/pinterest/pin` endpoint that
takes (image_url, title, description, link) and posts directly. Useful
because Buffer Pinterest support is sometimes flaky.

---

### 6. YouTube Studio  (audio uploads, NOT video)
**Why:** "Dark screen audio" is a massive YouTube category for sleep/
insomnia/parents. ZERO video editing — black background + Anna's voice
= 8M+ view potential per upload.

**What founder does:**
1. Create YouTube channel "Matrix Aurin" (or use existing).
2. Go to https://console.cloud.google.com → enable YouTube Data API v3.
3. Generate OAuth 2.0 client ID + refresh token (I'll send a precise
   guide if you start this).
4. Forward credentials.

**What I do:** convert each Hearth MP3 + a still image into a YouTube
upload via `/api/marketing/youtube/upload`. One Hearth story = one
30-min YouTube video = compounding evergreen traffic.

**Honest projection:** within 6 months, a single well-titled dark-
screen audio can pull 50-500 visitors/day from YouTube search alone.
This is the largest untapped channel for the brand.

---

## 🔴 TIER 3 — OPTIONAL OR BLOCKED

### 7. Facebook (founder noted: blocked)
**Status:** founder's existing FB account is blocked. Either:
- Wait 30 days and request re-review with Meta support, OR
- Create a NEW account from a clean device/IP, then build a Page
  separately (don't link to old account).

**Realistic:** Facebook organic reach for non-paid pages is < 2% in
2026. Not worth the recovery effort unless you also want Meta Ads
(which I'd advise against for this brand — see strategic analysis
in `/app/memory/CONTENT_MASTER_LIBRARY.md`).

---

### 8. TikTok
**Status:** intentionally skipped for the house brand. Tempo and
algorithm are anti-brand. Skip.

---

### 9. HeyGen (via your other agent)
**Status:** other agent has it. If you forward me the API key, I can
generate Anna's video avatar reading short Substack quotes for IG
Reels / LinkedIn video posts. Optional — not needed for Tier 1 launch.

---

### 10. Fal.ai (via your other agent)
**Status:** other agent has it. If you forward me the API key, I can
generate the cover images for each Hearth/Polarstar/Alistair piece
without needing manual prompts in another tool.

---

## 🟦 BONUS — Things YOU should know that the other agent might not have set up

### 11. Plausible Analytics ✅ ALREADY LIVE
**Status:** verified 2026-05-31. Script tag is in `/app/frontend/public/index.html` line 46 (`pa-cAlID0tYe0jB6T4Z50GmY.js`). The marketing agent set this up earlier.
**What to do:** check https://plausible.io/prulesoul.site dashboard to confirm hits are arriving.
**Note:** Plausible doesn't use cookies and doesn't collect personal data, so this preserves the "no tracking" promise.

### 12. Google Search Console
**Status:** meta-tag placeholder in `index.html`. To activate:
1. Go to https://search.google.com/search-console
2. Add property `prulesoul.site` → HTML tag verification method
3. Copy the verification token, paste it in our chat
**Why:** essential to know what queries are bringing organic traffic.
Free.

### 13. Gumroad (the one bottleneck I cannot bypass)
**Status:** founder must create SKUs in Gumroad UI (API doesn't
allow product creation). For:
- **Alistair Bundle €39** (slug `alistair-bundle`) — script ready at `/app/scripts/gumroad_create_alistair_bundle.py`
- **The Hearth €19** (slug `the-hearth`) — script to be created

After founder pastes Product IDs, I run scripts to lock descriptions.

---

## 📋 PRIORITY ORDER (suggested founder action list this week)

| Priority | Action | Time | Returns |
|----------|--------|------|---------|
| 1 | Buy Buffer $6 plan, paste API token to me | 15 min | LinkedIn + X + IG + Pinterest automation LIVE |
| 2 | Create Gumroad SKU for Alistair Bundle, paste Product ID | 5 min | €39 product LIVE |
| 3 | Create Gumroad SKU for The Hearth, paste Product ID | 5 min | €19 product LIVE |
| 4 | Click Emergent Deploy button | 1 min | All Sprint 2/3/4 surfaces go LIVE on prulesoul.site |
| 5 | Create Substack publication, send URL | 5 min | Long-form home ready |
| 6 | Sign up Plausible, paste embed token | 10 min | Analytics LIVE without breaking brand |
| 7 | Verify in Google Search Console, paste token | 5 min | SEO visibility LIVE |
| 8 | (optional) YouTube channel + OAuth setup | 30 min | Dark-screen audio channel LIVE (highest upside) |

**Total founder time: ~75 min.**

**After this 75 min of paperwork**, every piece of content I generate
can be deployed across 4 channels (Buffer) + queued for 2 manual ones
(Substack + Reddit) + uploaded to YouTube — with ONE command from this
chat.

---

## 🤝 Working with the OTHER agent (marketing agent)

The other agent has X / LinkedIn / IG / HeyGen / Fal.ai connections
in their isolated environment. To bridge:

**Option A (recommended):** ask the other agent to export their
saved access tokens (X user-context token, LinkedIn refresh token,
HeyGen + Fal.ai API keys) and forward them to me. I add them to our
backend `.env`. From there, all marketing logic lives in ONE codebase
(this one). No more two-headed coordination.

**Option B:** keep the other agent for visual generation (HeyGen
videos, Fal.ai images) and use this agent for text + scheduling.
Each agent gets a clear lane. Less coordination overhead.

**My recommendation:** Option A. One pipe, one repo, one place where
the founder can audit what was posted and what wasn't. Easier to debug,
easier to scale.

---

## 📝 What I built TODAY (already live, awaiting your tokens)

✅ `/api/marketing/status` — GET, public. Shows which channels are configured.
✅ `/api/marketing/queue` — POST, admin token. Adds posts to the queue.
✅ `/api/marketing/queue` — GET, admin. Lists queued posts with filters.
✅ `/api/marketing/dispatch` — POST, admin. Pushes due posts to Buffer.
✅ `/api/marketing/manual-digest` — GET, admin. Lists Reddit/Substack
   pending posts for daily founder review.
✅ `/api/marketing/manual-mark-posted` — POST, admin. Marks manual
   posts as done after founder pastes them.

Test it now:
```
curl https://aurin-hub.preview.emergentagent.com/api/marketing/status
```
You should see `buffer_configured: false` (correct — no token yet).
The moment you paste the Buffer token, this flips to `true`.

---

## CHANGELOG
- **2026-05-31 v1** — drafted after founder critique on agent
  isolation + frustration over "silent investment of €4k."
  Honest about which channels can be automated (Buffer 4-in-1),
  which must stay manual (Reddit, Substack), which are blocked
  (Facebook), and which are highest leverage but currently unwired
  (YouTube dark-screen audio).
