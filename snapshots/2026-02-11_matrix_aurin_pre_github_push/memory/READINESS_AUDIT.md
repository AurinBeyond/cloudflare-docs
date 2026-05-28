# READINESS AUDIT — Matrix Aurin Live Beta
**Auditor:** E1 (Stabilization fork)
**Date:** Feb 2026 · Iter 60 → pre-Iter 61
**Mode:** $0 Stabilization. Brutal honesty. No visionary language.
**Verification basis:** code paths, endpoint curls, integration tests run live against the preview backend.

This document is the source of truth. If the UI implies something that this document does not list as **OPERATIONAL**, the UI is overpromising and must be corrected.

---

## 0 · Legend (strict)

| Tier | Meaning |
| --- | --- |
| **OPERATIONAL** | Code path runs end-to-end. Persists or returns real data. Tested live in preview. |
| **PARTIAL** | Code path exists and runs, but one verifiable leg is missing or weakly covered (env, content, edge case). |
| **SIMULATED** | API responds, but the underlying intelligence is rules/rotation/static, not real model output. |
| **MOCKED** | Endpoint returns canned data; no real backend or third-party call. |
| **FUTURE-READY** | Stub or schema present; no real flow yet. |
| **VISUALLY IMPLIED** | UI suggests behaviour that the backend does not yet provide. |

---

## 1 · MENTOR CONTINUITY

### 1.1 Clarity Release (Cabinet) — primary mentor
- `POST /api/cabinet/message` → real Claude Sonnet 4.5 reply via `clarity_ai.generate_guide_reply` (server.py:3248). On any LLM exception, falls back to curated path-rotation prompt (`_pick_prompt`).
- Per-turn context assembled: history (decrypted in-memory), `body_context` from intake (cleared after 3 turns), guide gender, minutes_remaining for soft-landing, last 3 cross-session summaries, transient browser context.
- Crisis override `_detect_crisis` short-circuits BEFORE any LLM call (server.py:3168). Verified by `test_body_chat_iter60` and `test_cabinet_resume_iter56`.
- **STATUS: OPERATIONAL.**
- **Caveat:** the curated fallback (`_pick_prompt`) is SIMULATED. When `EMERGENT_LLM_KEY` budget is exhausted or Claude errors, the wanderer still gets a calm, on-tone reply, but it is not tailored. There is no UI flag indicating this. Acceptable for Live Beta; should not be hidden long-term.

### 1.2 Cross-session continuity (mentor's notes)
- `cabinet_user_summaries` collection. Index `[user_id, created_at desc]` confirmed at startup (server.py:8283).
- Summaries are written by `_summarise_closed_session_safe` (server.py:3075) on session close, ONLY if user has `save_threads = true` AND user_turns ≥ 2.
- Three most-recent summaries injected into next session's system prompt (server.py:3220–3232).
- **STATUS: OPERATIONAL** for users who opt in.

### 1.3 Resumable threads
- `GET /api/cabinet/threads` lists user's `keep_thread = true` closed sessions with decrypted preview (server.py:2914).
- `POST /api/cabinet/resume` rehydrates a closed session, closes any other active one, decrypts in-memory for client (server.py:2975).
- Verified by `test_cabinet_resume_iter56` — all 6 assertions PASS live.
- **STATUS: OPERATIONAL.**

### 1.4 Body Room mentor
- `POST /api/body-room/chat` → `body_room_ai.generate_body_reply` (server.py:5014, body_room_ai.py:109).
- Stateless server-side; client passes its own short history (cap 10 turns). Crisis override BEFORE LLM. Soft-fail returns calm fallback line on any LLM error.
- Verified by `test_body_chat_iter60` — 6 assertions PASS live, including a real 96-char Claude reply.
- **STATUS: OPERATIONAL.**
- **Caveat:** no TTS yet (Step 3 of this work order will add it). No client-side persistence except the wanderer's own browser memory.

### 1.5 Other rooms with mentor presence
- **Course Room** — letters are static SEED_COURSES content. There is no per-user AI chat in the Course Room. The "Listen" button is OpenAI TTS over the static letter text. **STATUS: OPERATIONAL** as a content+audio room. **NOT** an AI mentor room.
- **Six Nights** — pure email drip via Resend. No AI. **STATUS: OPERATIONAL** when `RESEND_API_KEY` is set; **PARTIAL** otherwise (loop runs, soft-skips send).
- **The Beginning** — scripted reflection steps, no LLM. **STATUS: OPERATIONAL** as scripted content.

---

## 2 · MEMORY SYSTEMS

### 2.1 Hybrid memory architecture (iter 59)
Two layers, by design:

| Layer | Where | Cost | Trigger |
| --- | --- | --- | --- |
| **Transient (Free)** | Browser `localStorage` (`/app/frontend/src/lib/browserMemory.js`) | $0 | Always on |
| **Eternal Thread (Premium)** | MongoDB `cabinet_user_summaries`, written via Claude summarisation | LLM cost on session close | Opt-in: `clarity_user_prefs.save_threads = true` |

- Default for new users: `save_threads = false`. Confirmed live: `test_hybrid_memory_iter59` passes 6/6.
- Transient context is sent on `/cabinet/start` AND `/body-room/chat`, capped at 5 fragments × 240 chars (server.py:5031, cabinet code in 3017+).
- `STATUS: OPERATIONAL.`

### 2.2 Encryption at rest
- User messages persisted with `text_enc` only (Fernet via `encrypt_text`); plaintext field cleared before `insert_one` (server.py:3171–3172). Decryption only in-memory for response composition.
- `STATUS: OPERATIONAL.` Note: thread previews in `/cabinet/threads` perform decrypt-on-read.

### 2.3 Vector DB / RAG
- **NONE.** There is no vector store, no embedding pipeline, no semantic search across the wanderer's history. Continuity is built from text summaries, not embeddings.
- `STATUS: NOT IMPLEMENTED.` This is intentional ($0 mode). It must not be marketed as "deep recall" or "semantic memory."

---

## 3 · ROOM-BY-ROOM READINESS

### 3.1 Clarity Release (Cabinet)
- Sessions, encryption, paths, Claude replies, body-context import, summaries, threads, TTS (`POST /api/clarity/tts` via OpenAI), guide-gender pref, beta windows, paid tier passes.
- Hologram: rendered as a **static portrait** (`/api/clarity/guide-face/{gender}` with `/assets/illustrations/guide-{gender}.jpg` fallback). The "breathing" is a CSS pulse class. No animated SVG/Lottie. **VISUALLY IMPLIED — not a live hologram.**
- `STATUS: OPERATIONAL` for the room logic. `VISUALLY IMPLIED` for the hologram.

### 3.2 Body Room
- 8 hotspots, pattern lookup, children patterns, further reading, image endpoint, insight save, AI chat, TTS planned.
- All endpoints respond. `test_body_chat_iter60` passes.
- `STATUS: OPERATIONAL.` (Adding TTS in Step 3.)

### 3.3 Course Room
- 4 courses live (`letting-the-old-stories-rest`, `the-language-you-forgot`, `seven-quiet-evenings-with-children`, `the-body-knows-first`). Each has `letter_count = 7`, `checkout_ready = true`, audio companion.
- Letter bodies are **deep, multi-paragraph Aurin-voice** (~1100–1400 chars each) — verified by direct file inspection (server.py:5066+). Iter 55 work confirmed in code.
- Per-letter TTS via `/api/clarity/tts` (text-to-speech is a shared OpenAI endpoint, not per-room). `test_course_tts_iter58` passes 3/3 live.
- Audio companion mp3s served from `/assets/audio/courses/`.
- `STATUS: OPERATIONAL.`
- **Caveat:** there is exactly **one English course track**. There is NO live `raha-ja-teadvus-moodul-1` (Estonian) course content — it appears in `/api/library/shelves` as a teaser entry for the shelf, but the slug is **not** in `SEED_COURSES`. A wanderer who clicks it from the Library will land on a 404 or a Course Room without that slug. **BLOCKER: VISUALLY IMPLIED.**

### 3.4 Library
- `GET /api/library/shelves` returns 4 curated shelves (Raha & Teadvus, Keha Atlas, Suhted ja Sagedus, Vaimne Suverignsus) with cross-listed books and courses. Verified live.
- `STATUS: OPERATIONAL` for English content + cross-listing.
- **Caveat:** the Estonian Moodul-1 teaser entry on the `raha-ja-teadvus` shelf is unbacked (see §3.3). That slug must either be (a) added to SEED_COURSES, or (b) removed from the shelf payload. As of this audit it is unbacked.

### 3.5 Six Nights
- Subscription endpoint, scripted nights, hourly dispatcher loop (server.py:8186, started at 8292).
- `STATUS: OPERATIONAL` only when `RESEND_API_KEY` is set in env. Otherwise the loop runs and soft-skips send. Confirmed: `RESEND_API_KEY` IS present in `/app/backend/.env`.

### 3.6 Kids Universe / Coloring
- Daily coloring page generator running as background task (server.py:8286). Static seed pages exist.
- `STATUS: OPERATIONAL.`

---

## 4 · BOOKING + ADMIN SCHEDULER

- 5 endpoints under `/api/booking/*` (server.py:7685+) and `/api/admin/booking/*` (8012+).
- Quiet-hours window enforced server-side; per-server capacity ceiling; one-active-reservation per user (anti-FOMO §10.5); idempotent within the same hour.
- `bookings` collection has 3 indexes set at startup (server.py:8277–8279).
- `test_booking_iter54` passes 13/13 live, including admin-token gate, capacity, idempotency, cancel, past-date reject, outside-quiet-hours reject.
- `STATUS: OPERATIONAL.`

---

## 5 · AUTOMATION

### 5.1 Email
- `RESEND_API_KEY` present in env. `email_health` endpoint and magic-link, lead-magnet, first-letter, six-nights flows all use it. Soft-fail when missing.
- `STATUS: OPERATIONAL` (env-bound).

### 5.2 LemonSqueezy
- Webhook `/api/lemonsqueezy/webhook` validates HMAC against `LEMONSQUEEZY_WEBHOOK_SECRET`, handles `order_created` / `order_refunded`. Idempotent via `purchases` unique index `(user_id, book_slug)`.
- Health endpoint reports key/store status (server.py:2408).
- `STATUS: OPERATIONAL` if user provides production keys. Currently in **sandbox/test** posture per env. **Founder action required** for production keys.

### 5.3 LP Heartbeat (B-01)
- Loop running (server.py:8289) but `LP_HEARTBEAT_URL` is empty in env. Loop soft-skips. 701+ skipped attempts logged in earlier sessions.
- `STATUS: PARTIAL (external blocker).` Code is ready; LP side env is not.

### 5.4 Background loops
- `_coloring_daily_loop`, `_aurin_heartbeat_loop`, `_six_nights_dispatch_loop`, `_auto_migrate_assets_to_mongo` — all four scheduled at startup. Each guarded by try/except.
- `STATUS: OPERATIONAL.`

### 5.5 Reminders calendar
- `/api/admin/reminders` parses `/app/memory/FOUNDER_REMINDERS.md` and exposes DORMANT/TRIGGERED entries to the admin dashboard.
- `STATUS: OPERATIONAL`. Requires admin token.

---

## 6 · EMOTIONAL CONTINUITY (Aurin voice)

- **System prompts** in `clarity_ai.py` and `body_room_ai.py` enforce: short replies, no clinical vocabulary, no diagnoses, single-question discipline, soft permissions, single-chime references to other rooms.
- **Cross-room hint:** Body Room mentor will gently mention Clarity Release once per conversation when narrative content surfaces. One-shot, not a refrain. Verified.
- **Tone drift risk:** when Claude is unavailable, the Cabinet falls back to `_pick_prompt` (rotation). Body Room falls back to two static lines. Both stay on-tone. **Acceptable.**
- `STATUS: OPERATIONAL.`

---

## 7 · STABILITY UNDER REAL USER LOAD

- Single-process FastAPI behind supervisor. MongoDB Atlas. No horizontal scaling configured.
- Background loops are coroutines on the same loop as the API — a hung HTTP call could starve them. No explicit watchdog.
- `EMERGENT_LLM_KEY` budget is a global resource. When one wanderer hammers the Cabinet, the next one's reply may fall back to the curated rotation. **Soft degradation, not failure.**
- No rate limiting on `/api/cabinet/message` or `/api/body-room/chat`. A bad actor could drain the LLM budget.
- `STATUS: PARTIAL.` Acceptable for Live Beta with the current user count (low). **Not** acceptable for an open public launch without rate-limit + per-user daily cap.

---

## 8 · SUPPORT / SALES / INFLUENCER AGENTS

- **None implemented.** There is no support-agent endpoint, no sales-funnel chatbot, no influencer outreach automation in the backend.
- `STATUS: NOT IMPLEMENTED.` This is intentional ($0 mode). Must not appear in marketing copy as if active.

---

## 9 · TESTS — ground truth

Run live against preview backend on this audit:

| Suite | Result | Notes |
| --- | --- | --- |
| `test_booking_iter54.py` | **PASS** (13/13) | Booking + admin scheduler |
| `test_cabinet_resume_iter56.py` | **PASS** (6/6) | Threads + resume |
| `test_course_tts_iter58.py` | **PASS** (3/3) | OpenAI TTS wiring |
| `test_hybrid_memory_iter59.py` | **PASS** (6/6) | Default save_threads=false confirmed |
| `test_body_chat_iter60.py` | **PASS** (6/6) | Real Claude reply received |
| `test_mentor_notes_iter57.py` | **FAIL** (1 assertion) | Stale: still expects save_threads default=true (pre-iter-59). **Test bug, not code bug.** |
| Legacy `test_iteration5/6/7/9/27/...` | 24 fails total | Stale book-inventory expectations from earlier iterations. **Not regressions of recent work** — the catalogue evolved. |

- **Recent-work test count:** 34 of 35 PASS. The single fail is a stale assertion in iter57's test that the iter59 change deliberately invalidated.
- **Recommendation:** update `test_mentor_notes_iter57.py` to assert `save_threads=True` only AFTER explicit POST `/clarity/prefs save_threads=true`. Do not roll back the iter59 default.

---

## 10 · WEAK POINTS — must be visible before launch

| # | Item | Tier | Action |
| --- | --- | --- | --- |
| W-1 | Clarity Release "hologram" is a static JPG, not animated. | VISUALLY IMPLIED | Either (a) call it "portrait" in copy, or (b) build animated SVG. Don't claim "hologram" without animation. |
| W-2 | Library has unbacked Estonian Moodul-1 course teaser. | BLOCKER (small) | Either seed the course or remove the teaser from `/api/library/shelves`. |
| W-3 | No rate limiting on Cabinet / Body Room chat. | PARTIAL | Add per-user-per-day cap before public launch. |
| W-4 | LP Heartbeat blocked by missing LP env. | EXTERNAL BLOCKER | Founder must set `LP_HEARTBEAT_URL` on LP side. |
| W-5 | LemonSqueezy in test/sandbox posture. | PARTIAL | Founder must paste production keys. |
| W-6 | Stale legacy tests (iter5/6/7/9/27, iter57 case). | TECH DEBT | Either update or quarantine before next CI integration. |
| W-7 | No vector / semantic memory. | NOT IMPLEMENTED | Do not market continuity as "deep recall." Current model = 3 most-recent summaries. |
| W-8 | Curated fallback when LLM budget drained is invisible to user. | SIMULATED | Optionally surface a quiet "the room is resting" badge when fallback fires. |

---

## 11 · DEPLOY DECISION

- **Functional core (Cabinet, Body Room, Course Room, Library, Booking, Six Nights, Email, LemonSqueezy webhook): OPERATIONAL.**
- **Visual claims (hologram): VISUALLY IMPLIED — must be reframed in copy or kept as is with no extra promises.**
- **Library has one unbacked teaser slug — fix before next deploy.**
- **No silent regressions introduced in iter 60 — verified.**

**Deploy clearance:** GREEN for the existing production deploy at `prulesoul.site` AS LONG AS W-1, W-2 are addressed in copy (W-1) and content (W-2) before any new acquisition push.

End of audit.


---

# APPENDIX A — Iter 62 Final Pre-Launch Pass

This appendix supersedes earlier sections where iter 62 changed reality.

## 14 · SUPPORT AGENT — FORENSIC VERIFICATION

**The previous session's claim that "24/7 website support AI agent is operational" is NOT TRUE.** Code-level evidence:

- `grep -rE 'support[-_]?agent|SupportAgent|support[-_]?chat|helpdesk' /app` returns **zero** code matches.
- The only "24/7" reference is **Eluliin 116 123** — an external human crisis hotline displayed in the Wanderer's Agreement and the Clarity Release crisis-override response. That is a public phone number, not an agent.
- `/api/ai/chat` (server.py:669–680) is an **explicit STUB** that returns:
  ```
  {"status": "not_active",
   "reply": "The companion is not yet active. When it is, ..."}
  ```
- `/api/support/crisis` (server.py:3872) returns a static **list of hotline numbers** — no chat, no LLM, no escalation, no knowledge base.
- No frontend support widget. No chat bubble. No floating helper. No `/support` route.
- No `support_knowledge_base` collection in MongoDB. No escalation rules. No KB-driven retrieval.

**Classification: NOT IMPLEMENTED.**

What exists today as the closest thing to support:
1. **Crisis hotline panel** in the Wanderer's Agreement and crisis-override path of both mentor systems → operational, but it points at human help, not at an AI agent.
2. **Magic-link auth flow** with calm error states → operational, handles the most common access-friction case.
3. **The Cabinet / Body Room mentors themselves** can answer some questions about the room they are in — but they are explicitly bounded to their reflective-presence role and will refuse to act as a sales/navigation agent.

**Risk classification:** PSYCHOLOGICAL TRUST RISK — if the public landing page or any marketing copy currently promises "24/7 AI support", that promise must be removed before launch. Direct visitors instead to:
- the founder's email (set `REACH_OUT_EMAIL` in env), and
- the existing `/api/reach-out` form.

**Decision required from founder:**
- (A) Remove all "24/7 support" language from public copy and ship without an agent (P0 trust safety) — fastest, $0.
- (B) Build a real support agent with a knowledge base in a future iteration — out of scope for this MVP lock per the "no new systems" rule.

This audit recommends (A).

---

## 15 · EMPTY-ROOM / FAILURE-STATE CHECK

Verified by code inspection in iter 62:

| Room | Empty state | Failure state | Verdict |
|---|---|---|---|
| **Clarity Release** | First-time visitors see threshold flow with copy "A quiet threshold, with clear edges." Cabinet without a session shows opening greeting. | Errors handled via `setError("Could not open the room. Please try again.")` (line 287); rendered with `data-testid="clarity-error"`. Crisis override before any LLM call. | ✅ |
| **Body Room** | 8 hotspots always rendered. Chat empty state: "Begin with one short line about where in the body you are paused right now." (`data-testid="body-room-chat-empty"`) | Soft-fail line on LLM error: "I am beside you. Stay with the place where you are right now…". 401 silent (no error toast). | ✅ |
| **Course Room** | Loading state "A small breath…". Empty fallback "The shelf is being prepared. Come back soon." (`data-testid="course-room-empty"`) | Per-letter TTS errors fall back to disabled "Voice unavailable" label. | ✅ |
| **Cabinet (Threads)** | Threads list shows 0–N rows; empty list is implicit (no row rendered). | Resume rejection → 404 surfaced as toast. | ⚠️ Could add empty-state copy to Threads list (P2 polish, not a blocker). |
| **Booking** | Calendar always renders quiet-hour slots; if all are full, slots show `is_full: true` with reduced opacity. | Past / outside-quiet-hours / capacity-exceeded all return calm 400/409 with human-readable detail strings. | ✅ |
| **Memory selection** | Two cards always rendered. No empty state possible. | Optimistic UI rolls back on `updateClarityPrefs` rejection. | ✅ |

**Verdict:** No critical empty-room dead space. One P2 polish (Cabinet Threads empty-state copy) recommended but not a blocker.

---

## 16 · FINAL READINESS CLASSIFICATION

After iter 62 work (W-1 Neural Portrait, W-2 Library cleanup, W-3 chat-cap, W-4 English uniformity, support-agent verification, product inventory, test-book purge):

**PARTIAL LIVE BETA — READY**

The platform can accept real users in a **controlled live-beta posture** today. It is **NOT** ready for an open public push.

### Ready (operational)
- 8 books · 4 English courses · 3 Clarity passes · Hybrid memory · Booking · Body Room · Course TTS · Six Nights · Kids Universe · Magic-link auth · LemonSqueezy webhook · Crisis override · Daily chat-cap · Encrypted user-message storage.

### Blockers before public push
1. 🔴 Confirm LemonSqueezy is in **live mode** (not test) and run **one $1 end-to-end test purchase**.
2. 🔴 **Remove any "24/7 AI support" copy** from public landing page and marketing surfaces, OR clearly reframe to "we reply within X hours by email."
3. 🟡 Decide whether Eternal Thread should be a **standalone paid SKU** or remain a free trust-feature.
4. 🟡 LP Heartbeat env on the LP side.

### Medium risks (acceptable for beta, not for full launch)
- No rate-limiter beyond per-user-per-day cap (no IP throttle, no global LLM-budget circuit breaker).
- Curated fallback when LLM budget drained is invisible to user.
- Static "Neural Portrait" must stay framed as intentional in all copy.
- 24 stale legacy tests left in the repo (book-inventory expectations from earlier iterations) — tech debt, not user-facing.

### Trust risks (psychological)
- Eternal Thread is opt-in only and writes only short summaries — but the marketing language must NEVER promise "the mentor will remember everything you said." Today's storage is **3 most-recent summaries**, injected at session open. If the founder's copy promises more, the copy is overpromising.
- Body Room mentor is calm and does not invent — verified in code via system-prompt forbid list (no diagnoses, no patterns, no "many people who…").
- Crisis path fires before LLM — verified.

### Technical risks
- Single-process backend behind supervisor. Background loops share the same loop as the API. Acceptable for low-volume beta.
- No global LLM-budget watchdog. When `EMERGENT_LLM_KEY` runs dry, both Cabinet and Body Room fall back to static lines. The wanderer is not told. (Documented as W-8.)

### Still emotionally "fake" or visually misleading?
- **Static "Neural Portrait"** — only if copy still uses the word "hologram" anywhere. Iter 62 W-1 reframed the inline copy. Verify no old marketing page still says "hologram."
- **No support agent** — if copy claims "24/7 AI support" it is misleading. Must be removed (Blocker #2 above).

**Overall verdict: PARTIAL LIVE BETA — READY** under the four blockers being closed.

End of Iter 62 appendix.

