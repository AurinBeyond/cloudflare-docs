# Matrix Aurin — PRD

## Original Problem Statement
"STABILIZATION + REAL PRODUCT EXECUTION MODE" — Matrix Aurin, calm voice-first mentor ecosystem with 4 psychologically isolated rooms (Grace/Private, Kaelan/Body, Sara/Parents, Alistair/Course), powered by ElevenLabs Conversational AI (`@elevenlabs/react`). Zero-Override policy: Dashboard is single source of truth for personas/voices/prompts; code only opens WebSocket + pipes audio.

## MLV Locked Pricing Model (2026-05-16 PM directive)
- Free Open World — $0, voice OFF
- 30-min Guided Presence — $39 → 1800 sec
- 60-min Extended Session — $69 → 3600 sec
- Eternal monthly — $89 launch / $99 regular → 10800 sec/month
- Top-up +30 min — $19 → 1800 sec
- Top-up +60 min — $39 → 3600 sec
- Digital Store: Angel Stories $9.99 → Body Knows First $39

Canonical voice budget: `users.presence_seconds_left` (single MongoDB field).
LemonSqueezy is Merchant of Record; payouts settle to founder.

## Core Architecture
- Frontend: React + `@elevenlabs/react` SDK + WandererGate consent
- Backend: FastAPI + MongoDB
- Auth: Magic-link via Resend; session token in localStorage
- Production: https://prulesoul.site

## Stabilization Sessions

### 2026-05-20 PM — 4-Tier Financial Engine + Audio Path Verified indicator
**P0 — 4-Tier Financial Engine (dry-run logged)**
- Added `compute_financial_split(amount_eur, voice_minutes, label)` pure function in `server.py` near `_presence_seconds_for_variant`.
- Rates (Founder-confirmed 2026-05-20): T1 production costs €0.25/min · T2 reserve €2.00/min · T3 loyalty €1.00/min · T4 profit = gross − allocated.
- Env-overridable: `FIN_SPLIT_COST_EUR_PER_MIN`, `FIN_SPLIT_RESERVE_EUR_PER_MIN`, `FIN_SPLIT_LOYALTY_EUR_PER_MIN`.
- Dry-run emitted ONCE on module load to `/var/log/supervisor/backend.err.log` with prefix `[FIN-SPLIT] ctx=dry-run` for all 4 scenarios (€45 / €90 / €380 / €20).
- Live webhook now logs `[FIN-SPLIT] ctx=live label=variant=… kind=… order=…` on every recognised grant, BEFORE any DB writes (observability-only, does not affect grant flow).
- **Finding from dry-run**: at the confirmed rates, ALL 4 products are net-negative — Founder must adjust either rates, minutes-per-tier, or prices before flipping `SESSION_CAP_ENABLED=true`.

**P1 — Audio Path Verified dev indicator**
- New dev-only signal in `RoomConvaiChat.jsx`: requires `?dev=1` in URL. Becomes "✓ Audio Path Verified" pill when BOTH conditions hold at least once in the session: (a) `inputCtx.state === "running"`, (b) VAD score ever > 0.1. Resets on every `start()`. Never visible to regular wanderers.
- Three-state pill: emerald (verified) · amber (partial: ctx ok OR VAD ok) · grey (auditing). Includes title-tooltip with raw state for debugging.

### 2026-05-20 AM — Voice-to-voice deafness HOTFIX + hero opened up

**P0** — Founder reported persistent bug: text→text works, text→voice (hybrid) works, but voice→voice fails even after 5 config-check attempts. Root cause located by reading `@elevenlabs/client/utils/input.js#L60`:

The SDK calls `await context.resume()` AFTER several async hops (`getUserMedia` + `loadRawAudioProcessor` + worklet module add). On Chrome (macOS + founder's primary profile), the user-gesture token can expire before resume() runs → INPUT AudioContext silently stays `suspended` while OUTPUT context resumes correctly. AudioWorklet never processes PCM frames, mic chunks sent over WebSocket are silence → ElevenLabs sees a connected client that never speaks.

**Fix**: `RoomConvaiChat.jsx` now imports `useRawConversation` → gains access to `raw.input.context` and `raw.output.context`. On every `status → live`, runs an AudioContext audit + auto-resume + 5-second guard interval. Telemetry log: state, sampleRate, baseLatency printed to console. Re-emits `setMuted` after context confirmed running so the worklet's MessagePort flushes any queued message against a live audio graph. Pure additive — does NOT touch the existing audio pipeline, worklet, format, or constraints.

**Diagnostic page**: new `/test-mic` route renders the bare ElevenLabs SDK with NO custom CSS, NO overlays, NO focus-stealing div. If voice-to-voice fails here too → bug is browser/profile or upstream ElevenLabs WebSocket. If it works here but fails on `/clarity-release` → bug is in the CSS/overlay stack.

**Hero**: photo zone widened (32% → 44%), right-edge feather reduced (42% → 22%) per founder's yellow-curve sketch — eye, cheek, jawline, and smile of the unmasked face are now fully visible before fade.

### 2026-05-19 — V6 polish merged to production
- `/sanctuary-preview` mounted as `/` with `production` flag
- `.sanctuary-room` wrapper applied to all 4 internal rooms
- New 6-tier pricing model rendered in WaysToBeHere + VoiceMeter sections

### 2026-05-16 AM — Layers 1-5 (voice stabilization)
1. `.gitignore` cleanup — production env delivery restored
2. `RoomConvaiChat.jsx` — 4-bucket error UI for mic-permission diagnostics
3. `ClarityRelease.jsx` — legacy `useVoiceIO`/`voice.speak()` gated by `!convaiActive` (ghosting / "second female voice" root cause eliminated)
4. `UserPortal.jsx` — magic-link warmup-vs-real-failure error UI
5. `RoomConvaiChat.jsx` — silence auto-disconnect timer REMOVED (was killing sessions after 10s mic-silence). Companion: ElevenLabs Dashboard `turn_timeout=30`, `silence_end_call_timeout=-1`, `turn_eagerness=Patient` for all 4 agents.

### 2026-05-16 PM — Session-Cap Layer (Step 2)
Read-only `compute_voice_window()` helper, `/api/clarity/convai/voice-window` endpoint, `VoiceSessionCountdown` banner, `useVoiceSessionCap` hook. Default `SESSION_CAP_ENABLED=false`. 7/7 tests pass.

### 2026-05-16 PM — Phase 1 MLV Runtime (Presence Time + Voice Recovery)
**Backend (server.py + session_cap.py):**
- `User` model: added `presence_seconds_left: int = 0`, `unlimited_voice: bool = False`
- `session_cap.compute_voice_window()`: `presence_seconds_left > 0` now takes priority over passes (returns `tier="presence"`)
- LemonSqueezy webhook: new presence-grant branch maps variant_id → seconds via 5 ENV vars (`LEMONSQUEEZY_VARIANT_*`). Idempotent via `presence_grants` collection. Issues magic-link on success.
- Helpers: `_extract_lemonsqueezy_variant_id()`, `_presence_seconds_for_variant()`
- 5 new endpoints:
  - `GET  /api/presence/balance` — read user's `presence_seconds_left`
  - `POST /api/presence/start` — open `voice_sessions` row, return session_id
  - `POST /api/presence/heartbeat` — update last_ping_at every 30s
  - `POST /api/presence/end` — close session, decrement balance by elapsed seconds (max 0)
  - `POST /api/presence/interrupted` — telemetry beacon for recovery card
- Telemetry events: `presence_granted`, `voice_session_started`, `voice_session_ended`, `presence_drained`, `voice_session_interrupted`
- `_close_voice_session_safe()` — idempotent, handles orphans + tab-crash

**Frontend (3 new files):**
- `VoiceRecoveryCard.jsx` — calm overlay shown on `status==="error"` with Continue/Retry/Hybrid CTAs. Triggers existing mode-toggle buttons via DOM click (no SDK touch)
- `ConvaiPresenceTracker.jsx` — wraps `RoomConvaiChat`, listens to passive `onStatusChange` emit, drives `/presence/start|heartbeat|end|interrupted` calls, renders `VoiceRecoveryCard` on error. Uses `navigator.sendBeacon` on `pagehide`
- (Phase 1 also reused `VoiceSessionCountdown.jsx` + `useVoiceSessionCap.js` from Step 2)

**Minimal edits:**
- `RoomConvaiChat.jsx` — added single passive `onStatusChange?: (status, errorMsg) => void` prop. 5 lines. ZERO audio/SDK/WebSocket touch.
- `ClarityRelease.jsx` — wrap `<RoomConvaiChat room="clarity" />` with `<ConvaiPresenceTracker room="clarity" />`. 1 line swap.
- `VoiceSessionCountdown.jsx` — wording: "Refill a pass" → "Refill Presence Time"; tier labels updated to MLV names.

**ENV added (placeholders, all empty until LemonSqueezy account opens):**
```
LEMONSQUEEZY_VARIANT_VOICE_30MIN=""
LEMONSQUEEZY_VARIANT_VOICE_60MIN=""
LEMONSQUEEZY_VARIANT_ETERNAL=""
LEMONSQUEEZY_VARIANT_TOPUP_30MIN=""
LEMONSQUEEZY_VARIANT_TOPUP_60MIN=""
```

**Verification:**
- 16/16 pytest pass (7 session_cap + 9 presence)
- Backend ruff clean, frontend ESLint clean
- Curl smoke: balance / start / heartbeat / end / interrupted all return 200
- Voice session of 3 seconds correctly returned `elapsed_seconds: 3`
- Frontend smoke: no console errors, no audio auto-play, gate active

### 2026-05-18 — P0 Hotfix: ElevenLabs Agent "Deafness" (Grec/Grace)
**Symptom:** Grec/Grace agent connected (status="live") but never heard the user's voice despite mic permissions being granted.

**Founder hard-evidence:** A stable 4-minute voice call worked on 2026-05-13 morning. So the WebRTC credentials, mic access, and integration are all proven functional. Something committed between 2026-05-13 and now broke the audio bridge.

**Root-cause (git audit of 2026-05-13 → HEAD on RoomConvaiChat.jsx, 514 lines changed):**

Primary breakage: **page-level mic pre-warm was removed** by a 2026-05-15 commit. The working 2026-05-13 version had at the top of `start()`:
```js
await navigator.mediaDevices.getUserMedia({ audio: true });
```
This was removed on the (now-disproven) theory that "SDK owns the full mic lifecycle". What the SDK actually does (verified in `@elevenlabs/client/VoiceConversation.js#startSession` and `utils/input.js#MediaDeviceInput.create`):
  1. preliminary `getUserMedia({ audio: true })` — generic stream
  2. immediately `MediaDeviceInput.create` → `getUserMedia({ audio: { voiceIsolation: true, ... } })` — the REAL stream feeding the worklet

On macOS Sonoma + Chrome (Apple Silicon), if the underlying CoreAudio device hasn't fully opened by the time the `voiceIsolation` constraint is applied, the stream returns silence → agent is "live" but never receives audio chunks. The page-level pre-warm gave the OS the headroom it needed.

Secondary safety improvements found in the same audit:
- Redundant `await conversation.endSession()` + 220ms wait at top of `start()` (Provider.startSession already bails if a session exists; the redundant teardown caused a `shouldEndRef` race).
- `[mode]` useEffect fired on initial mount + StrictMode double-mount, where the endSession branch could clobber a session opened a microtask earlier.

**Surgical Changes (RoomConvaiChat.jsx only — no SDK, audio, WebSocket, layout, or copy touch):**
1. **RESTORED page-level mic pre-warm** at top of `start()` — exact line that was present 2026-05-13 — wrapped with try/finally + skipped in TEXT mode + warmup tracks released immediately so SDK can re-acquire with its own constraints.
2. Removed redundant pre-emptive `endSession()` + 220ms wait in `start()`.
3. `[mode]` useEffect now early-returns when `modeRef.current === mode` (only acts on real mode toggles).
4. Added passive `console.log` taps in `onConnect`, `onDisconnect`, `onError`, `startSession` for in-browser diagnostics.

**Scope lock honored:** Zero changes to design, copy, layout, V6 baseline visuals, ConversationProvider, audio worklet, getUserMedia constraints, WebSocket transport, mic FFT / VAD bars, three-mode toggle, identity-lock voiceIds, ElevenLabs Dashboard agent config, or any other component file.

**Untouched:** ConversationProvider, audio worklet, getUserMedia constraints, WebSocket transport, mic FFT / VAD bars, three-mode toggle, identity-lock voiceIds, ElevenLabs Dashboard agent config.

**Verification:** Lint clean, /clarity-release renders, deep-mystical V6 visual locked intact.

**Pending:** Founder live mic test on /clarity-release to confirm Grace hears speech.

### Untouched (sealed core)
- RoomConvaiChat.jsx audio pipeline, SDK lifecycle, WebSocket — sacred ring
- 4 ConvAI agents in ElevenLabs Dashboard
- All 3 non-Grace rooms (Body / Parents / Course) — still uncapped, presence layer only applies to Grace
- Auth framework, route guards, WandererGate, CORS
- Books, Courses, visual identity, Grace persona

## Pending User Action
1. **Save to GitHub** + **Redeploy** to ship Phase 1 to production
2. ElevenLabs Dashboard for all 4 agents: `turn_timeout=30`, `silence_end_call_timeout=-1`, `turn_eagerness=Patient`
3. Open LemonSqueezy account, create 5 products/variants, paste variant IDs into Deploy panel ENV (`LEMONSQUEEZY_VARIANT_*`)
4. Make demo video (founder)
5. After live test: flip `SESSION_CAP_ENABLED=true` in production
6. Live revenue test: founder buys $39 30-min product → verify webhook grants 1800 sec + magic-link delivers + voice opens + 30 min counts down + soft-close at 0 + telemetry events appear

## Roadmap (Phase 2 — post-launch hardening, separate approval needed)
- Backend-enforced idle timeout (2min soft / 5min hard) — currently delegated to ElevenLabs Dashboard `turn_timeout=30`
- Concurrency limit + graceful queue (`MAX_ACTIVE_VOICE_SESSIONS=50`)
- Financial reconciliation ledger (analytics only — no runtime cost deduction)
- "Presence Time" wording across full site (UserPortal, TheBeginning, About, Bookstore)
- Admin balance-override endpoint
- WandererGate consent persistence by user_id
- Expand presence layer to Body/Parents/Course rooms (P2 — after Grace stability proven)

## Roadmap (Phase 3 — scale-prep, later)
- Telemetry dashboard admin page
- CDN / autoscale-ready hosting
- WebRTC migration for ConvAI

## Key Files
- `/app/backend/server.py` — FastAPI, webhook, presence endpoints
- `/app/backend/session_cap.py` — cap helper (read-only)
- `/app/backend/tests/test_session_cap.py` — 7 tests
- `/app/backend/tests/test_presence.py` — 9 tests
- `/app/frontend/src/components/RoomConvaiChat.jsx` — universal ConvAI UI (sacred — audio core, only passive onStatusChange prop added)
- `/app/frontend/src/components/ConvaiPresenceTracker.jsx` — presence ledger driver
- `/app/frontend/src/components/VoiceSessionCountdown.jsx` — cap banner
- `/app/frontend/src/components/VoiceRecoveryCard.jsx` — UX failsafe card
- `/app/frontend/src/hooks/useVoiceSessionCap.js` — cap poll hook
- `/app/frontend/src/pages/ClarityRelease.jsx` — Private Room page (Grace)
- `/app/.gitignore` — sentinel-protected against re-corruption
