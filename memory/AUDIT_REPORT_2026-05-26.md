# 🛡️ Aurin Deep Audit — 2026-05-26T21:33:37.206689+00:00

Non-destructive integrity check. Read-only. No changes applied.

## 📊 Summary

- 🔴 **Critical (red): 0**
- 🟡 **Warning (yellow): 3**
- 🟢 **Secure (green): 100**

---

## 🔴 RED — Critical findings (fix before launch)

_None._

---

## 🟡 YELLOW — Warnings (fix when safe)

### [env:empty] `RESEND_WEBHOOK_SECRET` exists but is empty.
- **Patch:** Fill `RESEND_WEBHOOK_SECRET` with the value from the relevant provider dashboard.

### [dataflow:secret-missing] Resend webhook secret (RESEND_WEBHOOK_SECRET) is empty.
- **Patch:** Paste signing secret to .env and restart backend.

### [fastspring:no-creds] FastSpring API credentials not configured — live audit skipped.
- **Patch:** Once merchant agreement activates, this audit will run automatically.


---

## 🟢 GREEN — Verified clean

- [catalogue:bundle-deferred] `bundle-lonely-heart` correctly deferred to FastSpring dashboard (bundle).
- [catalogue:bundle-deferred] `bundle-igapaevane` correctly deferred to FastSpring dashboard (bundle).
- [catalogue:bundle-deferred] `bundle-business-clarity` correctly deferred to FastSpring dashboard (bundle).
- [catalogue:bundle-deferred] `bundle-perekond-hybrid` correctly deferred to FastSpring dashboard (bundle).
- [catalogue:bundle-deferred] `bundle-family-magic` correctly deferred to FastSpring dashboard (bundle).
- [catalogue:bundle-deferred] `bundle-perekond-premium` correctly deferred to FastSpring dashboard (bundle).
- [catalogue:bundle-deferred] `bundle-perekond-full-el` correctly deferred to FastSpring dashboard (bundle).
- [catalogue:bundle-deferred] `bundle-vip-unlimited` correctly deferred to FastSpring dashboard (bundle).
- [catalogue:bundle-deferred] `bundle-house-season` correctly deferred to FastSpring dashboard (bundle).
- [catalogue:bundle-deferred] `bundle-couples-house` correctly deferred to FastSpring dashboard (bundle).
- [catalogue:bundle-deferred] `lux-annual` correctly deferred to FastSpring dashboard (bundle).
- [catalogue:bundle-deferred] `lux-lifetime` correctly deferred to FastSpring dashboard (bundle).
- [catalogue:bundle-deferred] `clarity-season-30d` correctly deferred to FastSpring dashboard (bundle).
- [catalogue:counts] Bulk script: 29 atomics. FINAL md: 42 SKUs total.
- [backend:endpoint] /api/webhooks/resend is mounted in server.py
- [backend:endpoint] /api/admin/email-health is mounted in server.py
- [backend:endpoint] /api/admin/email-suppression/remove is mounted in server.py
- [backend:endpoint] /api/kids-journey/progress is mounted in server.py
- [backend:endpoint] /api/kids-journey/day/{day_index} is mounted in server.py
- [backend:rate-limit-bypass] /api/webhooks/resend is in the rate-limit bypass tuple.
- [backend:email-suppression] email_suppression.py module present.
- [backend:suppression-gate] send_email() honours the suppression list before sending.
- [env:present] `MONGO_URL` is set (masked).
- [env:present] `DB_NAME` is set (masked).
- [env:present] `RESEND_API_KEY` is set (masked).
- [env:present] `EMERGENT_LLM_KEY` is set (masked).
- [env:present] `ELEVENLABS_API_KEY` is set (masked).
- [env:present] `FASTSPRING_API_USERNAME` is set (masked).
- [env:present] `FASTSPRING_API_PASSWORD` is set (masked).
- [env:present] `FASTSPRING_STOREFRONT` is set (masked).
- [env:present] `RESEND_FROM_INFO` is set (masked).
- [disclaimer:all] All bulk-script products carry the brand disclaimer.
- [margin:healthy] `body-temple-28` — margin 100.0%.
- [margin:healthy] `first-step` — margin 56.7%.
- [margin:healthy] `book-beyond-matrix-1` — margin 100.0%.
- [margin:healthy] `book-beyond-matrix-2` — margin 100.0%.
- [margin:healthy] `book-language-of-angels` — margin 100.0%.
- [margin:healthy] `book-dont-dance` — margin 100.0%.
- [margin:healthy] `book-angels-story` — margin 100.0%.
- [margin:healthy] `book-angels-tales` — margin 100.0%.
- [margin:healthy] `book-engels-friends-2` — margin 100.0%.
- [margin:healthy] `course-old-stories` — margin 100.0%.
- [margin:healthy] `course-language-forgot` — margin 100.0%.
- [margin:healthy] `course-seven-evenings` — margin 100.0%.
- [margin:healthy] `course-body-knows` — margin 100.0%.
- [margin:healthy] `voice-topup-30` — margin 50.5%.
- [margin:healthy] `voice-topup-60` — margin 53.8%.
- [margin:healthy] `voice-topup-180` — margin 55.1%.
- [margin:healthy] `voice-topup-premium-30` — margin 65.4%.
- [margin:healthy] `voice-topup-premium-60` — margin 67.0%.
- [margin:healthy] `voice-topup-premium-180` — margin 67.9%.
- [margin:healthy] `bundle-family` — margin 64.2%.
- [margin:healthy] `clarity-30min` — margin 50.5%.
- [margin:healthy] `clarity-60min` — margin 45.3%.
- [margin:healthy] `sub-text-basic` — margin 100.0%.
- [margin:healthy] `sub-text-voice-15` — margin 93.0%.
- [margin:healthy] `sub-text-premium` — margin 90.3%.
- [margin:healthy] `sub-steady-monthly` — margin 83.9%.
- [margin:healthy] `sub-own-room-monthly` — margin 79.7%.
- [margin:healthy] `tier-voyager` — margin 100.0%.
- [margin:healthy] `tier-eternal` — margin 100.0%.
- [route] / reachable (HTTP 200)
- [route] /kids-universe reachable (HTTP 200)
- [route] /body-temple reachable (HTTP 200)
- [route] /parents-room reachable (HTTP 200)
- [route] /for-leaders reachable (HTTP 200)
- [route] /aurins-room/stories reachable (HTTP 200)
- [route] /aurins-room/explorers reachable (HTTP 200)
- [route] /aurins-room/little-dreamers reachable (HTTP 200)
- [route] /aurins-room/dreamweavers reachable (HTTP 200)
- [route] /library/kids/read reachable (HTTP 200)
- [route] /library/kids/draw reachable (HTTP 200)
- [route] /admin/email-health reachable (HTTP 200)
- [dataflow:agent] ELEVENLABS_CONVAI_AGENT_AURIN configured.
- [dataflow:agent] ELEVENLABS_CONVAI_AGENT_GRACE configured.
- [dataflow:agent] ELEVENLABS_CONVAI_AGENT_KAELAN configured.
- [dataflow:agent] ELEVENLABS_CONVAI_AGENT_SARA configured.
- [dataflow:agent] ELEVENLABS_CONVAI_AGENT_ALISTAIR configured.
- [dataflow:secret] LS webhook secret configured & referenced in code.
- [dataflow:secret] Pruesoul internal webhook secret configured & referenced in code.
- [dataflow:race-safety] Server uses 32 atomic MongoDB operations (find_one_and_update / $inc / $max / $setOnInsert).
- [dataflow:log-trim] email_webhook_log auto-trims past 1000 entries to prevent unbounded growth.
- [dataflow:collection] `email_suppression` collection reachable (sample-count=0).
- [dataflow:collection] `email_webhook_log` collection reachable (sample-count=0).
- [dataflow:collection] `email_unsubscribes` collection reachable (sample-count=1).
- [dataflow:collection] `voice_sessions` collection reachable (sample-count=1).
- [dataflow:collection] `credit_ledger` collection reachable (sample-count=1).
- [dataflow:collection] `purchases` collection reachable (sample-count=1).
- [dataflow:index] email_suppression.email has unique index (prevents duplicate suppressions).
- [agents:room-map] Room 'clarity' is mapped to ELEVENLABS_CONVAI_AGENT_GRACE.
- [agents:room-map] Room 'body' is mapped to ELEVENLABS_CONVAI_AGENT_KAELAN.
- [agents:room-map] Room 'parents' is mapped to ELEVENLABS_CONVAI_AGENT_SARA.
- [agents:room-map] Room 'courses' is mapped to ELEVENLABS_CONVAI_AGENT_ALISTAIR.
- [agents:room-map] Room 'aurin' is mapped to ELEVENLABS_CONVAI_AGENT_AURIN.
- [agents:house] All bulk-script descriptions free of forbidden clinical terms.
- [agents:fair-use] `sub-text-basic` carries the fair-use clause.
- [agents:fair-use] `sub-text-voice-15` carries the fair-use clause.
- [agents:fair-use] `sub-text-premium` carries the fair-use clause.
- [agents:admin-route] /admin/email-health mounted in App.js.
- [agents:admin-route] /admin/observation mounted in App.js.
