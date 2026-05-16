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
- **Fix #3 (GHOSTING root cause)** — `ClarityRelease.jsx`: legacy `useVoiceIO({autoVoice:true})` and `voice.speak()` auto-speak useEffect now gated by `!convaiActive`. The "second female voice" was the legacy `/api/clarity/tts` pipeline speaking guide messages in parallel with ConvAI Grace
- **Fix #4** — `UserPortal.jsx`: magic-link error catch distinguishes warmup (502/503/504/no-response) vs real failure; shows "Service is warming up — please try again in 30 seconds." instead of generic copy

### Verified facts
- Production magic-link endpoint: HTTP 200, Resend `delivered_via: "email"`, `resend_error: null` (not a regression — was post-deploy warmup)
- Local preview ConvAI signed-url: HTTP 401 without auth (correct), tested with session token returns valid signed_url
- WandererGate consent gate active on `/clarity-release`
- ZERO audio tags on page load before user click
- No auto-play before explicit user action

### What was NOT touched (per warranty lock)
- Prompts, personas, voices, agent_ids
- Dashboard config
- Audio pipeline architecture
- Auth framework, route guards, CORS
- Backend routing, room content, hologram logic
- Mocked: Stripe / LemonSqueezy (out of stabilization scope)

## Pending User Action
- Real-user verification: speak with Grace in working Chrome profile → confirm response + no second voice
- Repo privacy decision before `git add -f backend/.env` (still uncommitted by founder request)
- Next Redeploy to ship Fix #4 (`UserPortal.jsx` warmup copy) to production

## Roadmap (post-stabilization — P1)
- WebRTC Migration for ConvAI (Stage 3) — latency reduction 200-400ms
- Latency logging in frontend (`onMessage` timestamps)
- Stripe/LemonSqueezy paywall logic
- Kids Universe — 3-lens system
- WandererGate consent persistence by `user_id` (currently `visitor_id` only)

## Roadmap (P2 / Backlog)
- Welcome Email / Gift Delivery audit
- Dynamic Course Curator

## Key Files
- `/app/backend/server.py` — FastAPI, signed-URL minter, magic-link endpoint
- `/app/frontend/src/components/RoomConvaiChat.jsx` — universal ConvAI UI wrapper
- `/app/frontend/src/components/WandererGate.jsx` — consent wrapping
- `/app/frontend/src/pages/ClarityRelease.jsx` — Private Room page (Grace)
- `/app/frontend/src/pages/UserPortal.jsx` — magic-link entry
- `/app/backend/email_service.py` — Resend wrapper
- `/app/.gitignore` — sentinel-protected against re-corruption
