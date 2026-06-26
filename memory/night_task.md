# 🌙 Evening tasks — 2026-02-04

Left for you tonight when you're back and calm.

## 0. 🎉 LATEST FROM LANDING AGENT (post-noon)

- **Webhook 401 → 200 delivered** ✅ Bidirectional auto-sync now LIVE
  on preview. Every enrollment auto-syncs without intervention.
- **Announcements baseline** captured, watcher running on 10-min cadence.
- **All 16 new endpoints** respond 200 on preview.
- **Social footer** (Anna IG/FB/LinkedIn) added on landing.
- **Admin enrollment cleanup** added: `DELETE /api/admin/enrollments/:id`
  and `/by-email/:email` — for cleaning the 2 test enrollments
  squatting spots 1+2 in production.
- **The deploy you clicked earlier didn't rebuild fully.** Diagnosis
  per landing agent: code is 100% deployment-ready, production URL
  serves an older snapshot. Re-click Deploy on Emergent and **wait
  until "deployed" status confirms** (don't close the tab early).

## 1. Webhook status — GREEN on our side ✅

Live-tested `POST /api/integrations/pruesoul/webhook` against our
preview (aurin-hub.preview.emergentagent.com):

| Test                            | Result                          |
|---------------------------------|---------------------------------|
| Raw secret as signature         | **HTTP 200**                    |
| HMAC-SHA256 hex as signature    | **HTTP 200**                    |
| Wrong signature (control)       | **HTTP 401** (correct rejection)|
| `/api/integrations/pruesoul/health` | `{secret_set:true, events_total:5, enrollments_mirrored:4, waitlist_total:0}` |

→ **The 401 the landing agent sees is because production still runs
the older build where this endpoint doesn't exist yet.** It is one
of the 16 endpoints the landing audit called out as missing.
Fix: **Deploy on Emergent** → endpoint lands live → 401 gone.

Env vars already correct on preview (`/app/backend/.env`):
```
PRUESOUL_WEBHOOK_SECRET=Z_17var8A-ygzid-6XFp1q6ExUtaQtNS
PRUESOUL_OUTBOUND_TOKEN=mWQ4nKdY6vR2pXtL8qZsB1uFhCgEjAIo
```

Just make sure production .env mirrors these two keys after deploy
(Emergent platform usually carries .env forward, but worth a glance).

---

## 2. Resend sender — GREEN to switch ✅

Resend dashboard confirmed earlier today:
*"Domain verified: Your domain is ready to send emails."*

→ **Reply to landing agent:** YES, set
`SENDER_EMAIL=house@prulesoul.site` on the landing page.
No need to keep `onboarding@resend.dev` anymore.

(On our side we already use `support@prulesoul.site`,
`agent@prulesoul.site`, `info@prulesoul.site` — all verified.)

---

## 3. Launch checklist for Monday (~45 min, from landing agent)

1. **Deploy** on Emergent (for `pure-soul-life` app — unlocks the 16
   missing endpoints and the webhook 401 fix)
2. Verify `curl pure-soul-life.emergent.host/api/announcements` → `{items:[]}`
3. Paste landing URL to: Reddit · Mastodon · Slack/Discord · Telegram
   (OpenGraph unfurl auto-handled)
4. Submit `feed.rss` to Feedly + sitemap to Google Search Console
5. Admin → Whispers → add 5 people → copy DM script
6. Admin → Announcements → "Sync now" (baseline)
7. Ping Aurin-Hub agent with the 401 confirmation (this is us — already GREEN)
8. Tell landing agent: Resend sender = `house@prulesoul.site` ✅

---

## 4. Blockers still only on founder's side

- `the-night-angels-embrace.pdf` → direct Google Drive link
  (`uc?export=download&id=...` format) — updates one LemonSqueezy
  artifact. Everything else is shipping.

---

## 5. What I did NOT touch today (as promised)

- AI prompts, Body Room, Clarity Release, Course Room, Wanderer's
  Agreement, checkout flow, design system, agent knowledge base.
- Only addition: `Home.jsx` "How this is walked" 3-step section.

---

When you're ready tomorrow, say any of:
  - "approve the announcements queue" → I'll walk you through it
  - "send first newsletter" → I'll compose a draft first
  - "feedback loop" → I'll implement `/api/clarity/feedback`
  - "tts for courses" → requires integration_playbook call first
  - "generate 3 hotspot images" → nano banana, ~1 credit per image

Sleep well. 🌿
