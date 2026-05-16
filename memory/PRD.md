# Matrix Aurin — PRD

## Original Problem Statement
"STABILIZATION + REAL PRODUCT EXECUTION MODE" — Matrix Aurin, calm voice-first mentor ecosystem with 4 psychologically isolated rooms (Grace/Private, Kaelan/Body, Sara/Parents, Alistair/Course), powered by ElevenLabs Conversational AI (`@elevenlabs/react`). Zero-Override policy: Dashboard is single source of truth for personas/voices/prompts; code only opens WebSocket + pipes audio.

## Core Architecture
- Frontend: React + `@elevenlabs/react` SDK + WandererGate consent
- Backend: FastAPI + MongoDB + signed-URL minter (`/api/clarity/convai/signed-url`)
- Auth: Magic-link via Resend; session token in localStorage `aurin_session_token`
- 4 rooms, 4 agents, locked voice_id per room
- Production: https://prulesoul.site

## Stabilization Session 2026-05-16 (Warranty / 0$ scope)

### Implemented (auto-committed)
- **Fix #1** — `.gitignore` cleaned: removed 9 duplicate `.env / *.env` exclusion blocks; added sentinel comment; `backend/.env`/`frontend/.env` no longer ignored (commit `9b3d16b`)
- **Fix #2** — `RoomConvaiChat.jsx`: error UI classifies failures into 4 buckets (mic-blocked / mic-missing / signed-url-503 / generic) with precise Chrome-permission instruction
- **Fix #3 (GHOSTING root cause)** — `ClarityRelease.jsx`: legacy `useVoiceIO({autoVoice:true})` and `voice.speak()` auto-speak useEffect now gated by `!convaiActive`. Eliminated "second female voice" caused by legacy `/api/clarity/tts` pipeline speaking in parallel
- **Fix #4** — `UserPortal.jsx`: magic-link error catch distinguishes warmup (502/503/504/no-response) vs real failure
- **Fix #5 (SILENCE AUTO-DISCONNECT REMOVAL)** — `RoomConvaiChat.jsx`: removed 10s mic-silence force-teardown timer that caused ~20s disconnects across all 4 rooms. Sessions now terminate only via user intent, package limits, or true SDK error. Companion to ElevenLabs Dashboard settings `turn_timeout=30`, `silence_end_call_timeout=-1`, `turn_eagerness=Patient` for all 4 agents

### Session-Cap Layer (Step 2, 2026-05-16 PM)
Thin, isolated monetization-prep layer on top of existing `clarity_passes` infrastructure. Grace / Private Room only for Phase 1.
- **New files:**
  - `/app/backend/session_cap.py` — read-only helper `compute_voice_window()`. Never mutates state. Resolution order: cap-disabled → unlimited-user → free-access → active pass → unconsumed pass → block.
  - `/app/backend/tests/test_session_cap.py` — 7 pytest cases, all passing
  - `/app/frontend/src/hooks/useVoiceSessionCap.js` — passive 15s-poll hook with 1s local tick; soft-fails open
  - `/app/frontend/src/components/VoiceSessionCountdown.jsx` — read-only banner with 4 visual states (invisible / pending / countdown / closed)
- **Edits (minimal):**
  - `server.py` — new endpoint `GET /api/clarity/convai/voice-window`; signed-url adds cap-check ONLY for `room="clarity"` (Body/Parents/Course untouched)
  - `ClarityRelease.jsx` — adds `<VoiceSessionCountdown />` above `<RoomConvaiChat>` (5-line wrapper)
- **Failsafe:**
  - ENV `SESSION_CAP_ENABLED=false` (default) — invisible layer; flip to `true` when ready to enforce
  - Per-user `users.{user_id}.unlimited_voice = true` admin override
  - Soft-fail on any error: cap layer never blocks the realtime core
- **Sacred ring (NOT touched):** `RoomConvaiChat.jsx`, `useVoiceIO.js`, audio/SDK/WebSocket, 4 room pages other than ClarityRelease

### Verified
- 7/7 pytest passes for `session_cap`
- ESLint clean (frontend), ruff clean (backend)
- Local curl: voice-window returns `{allowed:true, tier:"unlimited", cap_enabled:false}` with CAP=false; switches to `tier:"free_access"` with CAP=true and FREE_ACCESS_UNTIL active
- All 4 rooms (clarity/body/parents/courses) signed-url returns 200 with CAP=false
- With CAP=true: clarity gated by cap layer; body/parents/courses remain uncapped (200 OK)
- Production verification (current state): root HTTP 200, /api/aurin/free-access HTTP 200, /api/auth/magic-link/request HTTP 200 with Resend delivered_via=email

### Untouched (per founder lock)
- Prompts, personas, voices, agent_ids, Dashboard config
- Audio pipeline architecture, WebSocket, SDK lifecycle
- Auth framework, route guards, CORS
- Backend routing for Body/Parents/Course rooms
- Mocked: Stripe / LemonSqueezy (next phase)

## Pending User Action
- Click **Save to GitHub** + **Redeploy** to ship Fix #4, #5, and Session-Cap layer to production
- ElevenLabs Dashboard: set `turn_timeout=30`, `silence_end_call_timeout=-1`, `turn_eagerness=Patient` for all 4 agents
- Real-user verification: voice session 30s + 60s silence + 30s voice should NOT disconnect
- Decide when to flip `SESSION_CAP_ENABLED=true` in production (after stability proven)

## Roadmap (post-stabilization)
- **P1:** WandererGate consent persistence by `user_id` (currently `visitor_id` only)
- **P1:** WebRTC Migration for ConvAI (Stage 3) — latency reduction 200-400ms
- **P1:** LemonSqueezy/Stripe paywall completion — wire to `clarity_passes` grant flow
- **P1:** Latency logging in frontend (`onMessage` timestamps)
- **P1:** Kids Universe — 3-lens system
- **P2:** Expand session-cap layer to Body/Parents/Course rooms (after Grace stability proven)
- **P2:** Welcome Email / Gift Delivery audit
- **P2:** Dynamic Course Curator

## Key Files
- `/app/backend/server.py` — FastAPI, signed-URL minter, magic-link, voice-window endpoints
- `/app/backend/session_cap.py` — isolated cap helper
- `/app/frontend/src/components/RoomConvaiChat.jsx` — universal ConvAI UI (sacred — audio core)
- `/app/frontend/src/components/VoiceSessionCountdown.jsx` — cap banner
- `/app/frontend/src/hooks/useVoiceSessionCap.js` — cap poll hook
- `/app/frontend/src/components/WandererGate.jsx` — consent wrapping
- `/app/frontend/src/pages/ClarityRelease.jsx` — Private Room page (Grace)
- `/app/frontend/src/pages/UserPortal.jsx` — magic-link entry
- `/app/backend/email_service.py` — Resend wrapper
- `/app/.gitignore` — sentinel-protected against re-corruption
