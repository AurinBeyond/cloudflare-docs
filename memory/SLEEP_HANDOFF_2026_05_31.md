# 🌟 House State Snapshot — Sleep Mode
**Created:** 2026-05-31 ~23:00 UTC (Anna offline ~20h)
**Resume marker:** When Anna says "I'm back", load this file first.

---

## 🎯 IMMEDIATE MORNING CHECKLIST (paste back to me)

```
TOMORROW MORNING — execute in this order:

🔴 P1 PRE-DEPLOY (5 min)
[ ] 1. Emergent dashboard → click DEPLOY
[ ] 2. Wait ~3 min
[ ] 3. Check prulesoul.site/the-hearth → fireplace hero visible
[ ] 4. Check prulesoul.site/alistair-bundle → €39 + Gumroad CTA
[ ] 5. Click "Step inside · €19" → must redirect aurinbeyond.gumroad.com/l/the-hearth

🟡 P2 GUMROAD ACTIVATION (10 min)
[ ] 6. gumroad.com → "The Hearth" → Discover ON
       → Affiliates: enable, 35% commission, 30-day cookie
       → Paste Welcome Copy from /app/memory/GUMROAD_AFFILIATE_COPY.md
[ ] 7. Repeat for "The Alistair Bundle"
[ ] 8. Repeat for "Polarstar Bedtime Stories"

🟢 P3 BUFFER HYGIENE (5 min)
[ ] 9. buffer.com → Queue tab on LinkedIn → confirm 12 posts visible
[ ] 10. Queue tab on X → confirm 8 posts visible
[ ] 11. Switch from Essentials → Free plan (saves $18/mo, keeps schedule)

🟢 P4 REDDIT DAY 1 (10 min)
[ ] 12. Open /app/memory/reddit_week_1_packet.md (or ask me)
[ ] 13. reddit.com/r/Parenting/new — find < 6h post about bedtime
[ ] 14. Adapt template, paste, post — NO LINKS

💬 Then say to me: "I'm back"
   → I'll: (1) run /api/hearth-funnel/dispatch-followups
            (2) show /api/hearth-funnel/stats (who opted in overnight)
            (3) show Plausible referrer report
            (4) confirm Buffer posted what to where
            (5) ask: Story #4 manuscript? Make.com connect?
```

---

## 📊 SYSTEM STATE AT SLEEP

### LIVE on preview (`aurin-hub.preview.emergentagent.com`) — awaits Deploy
- 3 Gumroad products fully filled (Polarstar €9, Hearth €19, Alistair €39)
  - URLs: aurinbeyond.gumroad.com/l/{fwqmha, the-hearth, alistair-bundle}
  - Product IDs known and stored in scripts
- 3 Hearth audio stories + listen pages
  - /listen/hearth → auto-redirects to newest (Story #3 currently)
  - Story #1, #2, #3 all have Anna's cloned voice (JRsw5bVcIrltULIav9RK)
  - All 1.0s silence padded both ends
- /the-hearth landing page with fireplace hero image + live €19 CTA
- /alistair-bundle landing with hero + €39 CTA
- Email funnel: opt-in form on all 3 listen pages
- Marketing API: 6 endpoints under /api/marketing/*
- Hearth funnel API: 4 endpoints under /api/hearth-funnel/*
- Alistair Course 1 letters (sharp v2 tone) LIVE in backend SEED_COURSES

### Buffer queue (will auto-publish starting tomorrow ~9:00 UTC)
- 12 LinkedIn posts queued (Tue/Thu/Sun cadence over 4 weeks)
- 8 X/Twitter posts queued (interleaved)
- 4 Pinterest + 4 Instagram POSTS NOT QUEUED — they failed because
  Buffer requires images for these channels. Logged in marketing_queue
  as status=failed. Handle Week 2 with image attachments.

### Manual-pending (no auto-post — need Anna's hand)
- 3 Reddit drafts in /api/marketing/manual-digest

### Active config in /app/backend/.env (verified)
```
✓ BUFFER_ACCESS_TOKEN    (token works against GraphQL v2)
✓ BUFFER_ORG_ID
✓ BUFFER_PROFILE_{LINKEDIN, TWITTER, INSTAGRAM, PINTEREST}
✓ GUMROAD_ACCESS_TOKEN
✓ RESEND_API_KEY
✓ ADMIN_TOKEN
✓ ELEVENLABS_API_KEY + ELEVENLABS_VOICE_ANNA_ADULT
```

---

## 📁 KEY FILES (for fast recall)

| File | What it is |
|------|-----------|
| `/app/memory/GUMROAD_AFFILIATE_COPY.md` | Affiliate welcome text per product — paste into Gumroad UI |
| `/app/memory/reddit_week_1_packet.md` | 7 days of Reddit comment templates |
| `/app/memory/REDDIT_WARMUP_PROTOCOL.md` | 30-day full warm-up plan |
| `/app/memory/CONTENT_MASTER_LIBRARY.md` | 38 story ideas, 4 rooms, bundle architecture |
| `/app/memory/omnichannel_pack_essay_2.md` | 16 posts derived from Substack essay #2 |
| `/app/memory/substack_essay_2_wellness_was_never_going_to_save_you.md` | Lead Substack essay (draft, NOT published) |
| `/app/memory/CREDENTIALS_CHECKLIST.md` | Full list of pipes (live + pending) |
| `/app/memory/alistair_course_1_letters_v2_sharp_tone.md` | The 7 letters now live in backend |
| `/app/memory/hearth_story_03_the_coat_on_the_chair.md` | Story #3 manuscript |
| `/app/backend/marketing_queue.py` | Buffer GraphQL v2 wrapper |
| `/app/backend/hearth_funnel.py` | Email funnel router (Resend) |
| `/app/scripts/queue_30_day_sprint.py` | Re-runnable 30-day post loader |
| `/app/scripts/gumroad_create_alistair_bundle.py` | Already ran successfully |
| `/app/scripts/gumroad_create_hearth.py` | Already ran successfully |
| `/app/frontend/src/components/HearthFunnelOptIn.jsx` | "open the door" opt-in form |

---

## 🦅 PENDING DECISIONS for Anna when back

1. **Make.com connect** — Anna has account. ~1h work, 2 use cases:
   - Gumroad webhook → personal thank-you email via Resend
   - Substack RSS → auto-queue social posts when new essay drops
   - **Needs:** Make API key
2. **Hearth Story #4 "The Window Left Open"** — manuscript + audio
3. **Hearth Story #5 "The Garden in November"** — completes the 5-story shelf
4. **Family Bundle (€25 = Polarstar €9 + Hearth €19)** — new Gumroad SKU
5. **Apple Books for The Hearth** — once Story #4 + #5 audio ship
6. **Add images to IG/Pinterest posts** for Week 2 retry
7. **Cron job for funnel dispatch-followups** — currently manual

---

## 🛟 EMERGENCY RECOVERY

If anything broken when Anna returns:
- Backend logs: `/var/log/supervisor/backend.err.log`
- Verify routes: `curl https://aurin-hub.preview.emergentagent.com/api/marketing/status`
- Verify funnel: `curl https://aurin-hub.preview.emergentagent.com/api/hearth-funnel/stats -H "Authorization: Bearer $ADMIN_TOKEN"`
- Restart backend: `sudo supervisorctl restart backend`
- Buffer GraphQL alive check: see `BufferClient` in `marketing_queue.py`

---

## ✍️ CHANGELOG
- **2026-05-31 23:00** — Snapshot taken at handoff. Anna offline ~20h.
  Buffer 22 posts queued, Gumroad 3 products live, email funnel ready,
  affiliate copy drafted, Reddit Week 1 packet ready. DEPLOY APPROVED
  pending Anna's manual click.
