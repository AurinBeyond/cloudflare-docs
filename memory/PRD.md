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

### 2026-05-20 EVE — VOICE-TO-VOICE ROOT CAUSE: ElevenLabs lacked Estonian support
**Founder breakthrough investigation** — after weeks of trying browser cache, mic permissions, AudioContext resume hacks, the actual cause was: **ElevenLabs Conversational AI does not support Estonian in its standard ASR preset list** (34 supported: en, zh, es, hi, pt, fr, de, ja, ar, ko, id, it, nl, tr, pl, ru, sv, tl, ms, ro, uk, el, cs, da, fi, bg, hr, sk, ta, vi, no, hu, pt-br, fil). Estonian missing entirely.

This perfectly explained the recurring symptom: text→text OK (LLM Gemini handles Estonian), text→voice OK (TTS reads Estonian phonetically), but voice→voice broken (ASR returns empty transcript → agent receives nothing → silence).

**Fix applied — DASHBOARD-LEVEL agent reconfiguration (all 4 agents)**:
- ASR provider switched to **`scribe_realtime`** (ElevenLabs Scribe v1 — supports 99+ languages including Estonian natively)
- Agent `language` set to **`fi`** (Finnish — required because Estonian is not in preset list; Scribe handles the actual multilingual recognition)
- TTS model upgraded to **`eleven_flash_v2_5`** (multilingual, required for non-English agents)
- First message rewritten in Estonian per agent
- LLM prompt extended with strict directive: "Always respond in Estonian regardless of how the transcript appears"
- Frontend `RoomConvaiChat.jsx` startSession no longer tries `agent.language` override (Dashboard security overrides have it disabled)

**Verification command**:
```bash
KEY=<elevenlabs-key>
for AID in agent_6801krh8dnmze1zthsnf5xb6xe43 agent_6401krjff71xf1pss69kqe1wtxs8 agent_2701krjvc4mpezzsym54wsr2vn1t agent_2401krjfn3cpeyjrreqgy1d1dbr0; do
  curl -s -X GET "https://api.elevenlabs.io/v1/convai/agents/$AID" -H "xi-api-key: $KEY" \
    | python3 -c "import json,sys;d=json.load(sys.stdin);cc=d.get('conversation_config',{});a=cc.get('agent',{});t=cc.get('tts',{});asr=cc.get('asr',{});print(asr.get('provider'),a.get('language'),t.get('model_id'))"
done
# Expected: scribe_realtime fi eleven_flash_v2_5 × 4
```


### 2026-05-20 PM — 4-Tier Financial Engine RECALIBRATED + Admin Preview endpoint
**v2 model** (Founder explicit, 2026-05-20 PM):
- Tier 1 — Production Costs: €0.25 **per minute** (variable, real ElevenLabs API cost)
- Tier 2 — Reserve Fund: €2.00 **per transaction** (FIXED, one-time per order)
- Tier 3 — Loyalty Bank: €1.00 **per transaction** (FIXED, one-time per order)
- Tier 4 — Net Profit: gross − (T1 + T2 + T3)

**Why v2**: v1 treated reserve+loyalty as per-minute → broke margins on long-minute packages. v2 correctly treats them as fixed bookkeeping allocations.

**Dry-run results (all SOLVENT + HEALTHY)**:
| Product | Gross | Min | T1 | T2 | T3 | **T4 Profit** | Margin |
|---|---|---|---|---|---|---|---|
| First Step €45 | 45 | 60 | 15.00 | 2.00 | 1.00 | **27.00** | 60.0% ✓ |
| Steady Monthly €90 | 90 | 60 | 15.00 | 2.00 | 1.00 | **72.00** | 80.0% ✓ |
| Your Own Room €380 | 380 | 240 | 60.00 | 2.00 | 1.00 | **317.00** | 83.4% ✓ |
| Top-up €20 | 20 | 30 | 7.50 | 2.00 | 1.00 | **9.50** | 47.5% ✓ |

**New admin endpoint**: `GET /api/admin/financial/preview?amount=X&minutes=Y&label=Z&token=…` — protected by `ADMIN_TOKEN` (header `X-Admin-Token` or query `token`). Returns the full split JSON without touching DB. 401 on missing/wrong token, 400 on bad params. Also logs to `backend.err.log` with `ctx=preview` prefix for traceability.

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

## 2026-05-21 — Pre-launch sweep (LemonSqueezy demo submitted)

**Founder status:** Demo video successfully submitted to LemonSqueezy (real product clip + AI-promo combined). Awaiting LS approval. Tomorrow's plan: joint review of entire site, final polish.

**Fixed today (surgical):**
- **P0 — `/pricing` blank page**: Route was missing in `App.js`. Three components (`RoomConvaiChat`, `ConvaiPresenceTracker`, `AurinsRoomChat`) linked to `/pricing` but no route was registered → blank black page when users clicked "Add Presence Time". Added `<Route path="/pricing" element={<Navigate to="/clarity-release" replace />} />`. Revenue path now restored.

**Pending founder approval (P1, tomorrow):**
1. OpenWorld cards (Library/Bookstore/Courses/Kids Universe) missing "Enter →" CTAs.
2. Static agent portraits inside chat surface (Grace, Kaelan, Sara, Alistair, Aurin).
3. Per-age-group visual differentiation in Aurin's Room.
4. Course Room walkthrough.

Full audit: `/app/memory/AUDIT_2026-05-21_PRE_LAUNCH_REVIEW.md`

**Crash telemetry status:** No real `/aurins-room` "A quiet ripple" crashes captured in `funnel_events` over last 72h. The route loads cleanly through Wanderer's Agreement gate in preview. If founder sees crash again, hard-refresh first, then check `/api/admin/audit/crashes` for stack trace.

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

## 2026-02-08 — Founder Trust + Aurin Story World

**Anna's directive:** Replace AI anonymity with real founder identity, and add a lightweight Kids Story World subpage (no realtime AI, static audio/PDF — easy to grow gradually).

**Shipped today:**

1. **About Anna page** (`/about`) — Complete rewrite of `/app/frontend/src/pages/About.jsx`. Removed the mystical "I spent fifty years observing the matrix" narrative; replaced with Anna's actual warm trust-building text. Uses real assets: `anna-original.jpg` (hero), `anna-storybook-intro.mp4` (Aurin world strip, autoplay-muted-loop), `anna-trailer-60s.mp4` (60s click-to-play intro), `anna-portrait.jpg` (signature avatar). Layout: hero + narrative blocks + promise band + trailer + children's universe block + storybook strip + core idea + signature + quiet CTA. All sections carry `data-testid` for testing.

2. **Aurin's Story World** (`/aurins-room/stories`) — New lightweight subpage (`AurinStoryWorld.jsx` + `AurinStoryRead.jsx`) per founder's "Mini Story World" architecture brief. Static MP3 + optional PDF slots, no streaming infra, no realtime AI. Five starter stories scaffolded across three age groups:
   - **Little Dreamers (3–5):** Little Star, The Moon Boat
   - **Explorers (6–8):** The Night Forest, The Quiet Dragon
   - **Dreamweavers (9–12):** Aurin and the Lantern
   Story data lives in `/app/frontend/src/data/aurinStories.js` — Anna can add new stories by appending one object. Audio shows "Audio coming soon" badge until an MP3 path is set. PDF link hidden until set.

3. **Aurin's Room CTA** — Added a "Story World" card below the three age groups in `AurinsRoom.jsx`.

4. **Routes** (`App.js`) — Added two new routes (`/aurins-room/stories`, `/aurins-room/stories/:storySlug`). Both public (no WandererGate) so parents can browse before committing.

**Verified by smoke test (screenshot tool):**
- `/about` headline + real photo + signature render correctly
- `/aurins-room/stories` shows all 3 age groups + 5 cards
- `/aurins-room/stories/little-star` shows body + "Audio coming soon" + Next story link

**Pending (tracked in `/app/memory/PENDING_REMINDERS.md`, repeat every 12h):**
- 🟡 P1 — Meta Pixel + CAPI integration. Blocked on Anna's Pixel ID + CAPI token.
- 🟡 P2 — Plan B payment (Stripe / PayPal). Anna will decide "tomorrow or next few days".

**Still open from previous session:**
- 🔴 P0 — Prod STT 500 error. `OPENAI_API_KEY` missing/invalid in production env panel. Preview is fine.
- 🔴 P0 — `FREE_VOICE_BETA=true` in preview env — flip to `false` before live launch.

## 2026-02-08 (later) — Aurin Storyteller Angel + Share Growth-Loop

**Anna's directive:** Position Aurin as a "storytelling angel" (universal, suits every age, decouples kids' world from Anna personally). Add multi-channel share buttons for organic trust-transfer growth (WhatsApp / Telegram / Facebook).

**Shipped:**

1. **Storyteller-angel intro hero** on `/aurins-room/stories` — "Meet your storyteller" card with the `aurin-companion.png` character image (cropped via `object-position: left center` so the right-side branding text from the marketing asset is hidden). Title rebranded to "Stories from Aurin — your gentle storytelling angel". Copy positions Aurin as a soft, imaginary friend, not a teacher / not a robot.

2. **Story covers** — All 5 starter stories now use the Aurin character image (`/assets/aurin/aurin-companion.png`) with left-center crop. Consistent visual identity across the shelf until Anna creates per-story illustrations.

3. **Share row** on every story page — New component `StoryShareStrip.jsx` with 6 channels: WhatsApp, Telegram, Facebook, X, Email, Copy link. Pre-fills a calm message ("A calm bedtime story from Aurin's Story World. I thought you might enjoy …"). Auto-picks up `window.location.href` so the URL stays correct once the live domain is deployed — no code change required at launch.

4. **Anna's name boundary** — Confirmed Anna's name appears ONLY in `/about` (founder section). The entire Aurin Story World (page + cards + story bodies + share strip) makes zero reference to Anna. Brand identity for the kids' universe stays purely "Aurin".

**Verified by smoke test:**
- `/aurins-room/stories` shows angel intro + 3 age groups + cards with character image
- `/aurins-room/stories/little-star` shows share strip with all 6 buttons functional

**Still open:** see `/app/memory/PENDING_REMINDERS.md`.

## 2026-02-09 — Aurin Crash Fix + Adult Agent Identity Boundary Protocol

**Two P0 production bugs Anna reported after going live on prulesoul.site:**

1. **Aurin's Room kicks users out immediately** (all 3 age groups).
2. **Adult agents hallucinate roles:** they adopt the user's greeting as their own name ("Hello Grace" → agent thinks its name is Grace), switch voices, mix rooms.

**Root cause of Aurin crash (founder-visible "kick-out"):**
The Aurin Dashboard had ALL overrides disabled (`platform_settings.overrides.conversation_config_override.agent.prompt.prompt: false`, `first_message: false`, `tts.speed: false`, `tts.stability: false`). The `AurinsRoomChat.jsx` code was sending exactly those four override fields → ElevenLabs rejected the session on open → "kicked out" symptom.

**Fix #1 — Aurin Dashboard PATCH (server-side, idempotent):**
```bash
PATCH /v1/convai/agents/<aurin_agent_id>
{ platform_settings.overrides.conversation_config_override: {
    agent: { first_message:true, language:true, prompt:{prompt:true, llm:false,...} },
    tts:   { speed:true, stability:true, voice_id:false, similarity_boost:false },
    conversation: { text_only:true }
}}
```
This enabled the four overrides Aurin requires (age-specific prompts via `aurinPrompts.js`, first_message, tts.speed, tts.stability) while keeping voice_id locked at Dashboard level.

**Fix #2 — Defensive retry in `AurinsRoomChat.jsx`:**
- Added mic pre-warm at top of `start()` (matches the working adult-room pattern from RoomConvaiChat.jsx)
- Added `retryWithoutOverridesRef`: on first error that is NOT a mic-class issue, the SDK is re-invoked once with overrides STRIPPED. Salvages sessions if Dashboard rejects a field in the future.
- Added detailed `console.log` taps in onConnect / onDisconnect / onError so the next agent has ground-truth telemetry.

**Fix #3 — Aurin character portrait LEFT, chat RIGHT** (founder explicit ask):
Replaced the full-width hero banner above the chat with a side-by-side layout matching the four adult rooms. Per-age `theme.hero` images (`little-dreamers-hero.png` etc.) are rendered as `background-image` with `background-size:180%` + `background-position:0% 20%` so the chat-mockup half of the marketing composite falls off-frame. Below the portrait: "Aurin" name + age tag (e.g. "EXPLORERS · AGES 6-8") + tagline.

**Fix #4 — Adult Agent IDENTITY & BOUNDARY PROTOCOL (Dashboard prepend, non-destructive):**
Built `/app/scripts/inject_agent_boundaries.py` which:
1. GETs each agent's current Dashboard `conversation_config.agent.prompt.prompt`
2. SAVES timestamped backup to `/app/memory/agent_prompt_backups/<name>__YYYY-MM-DD.txt`
3. PREPENDS (does NOT replace) a strict agent-specific boundary block:
   - "Your name is [Name]. Always [Name]. Only [Name]."
   - "You are NOT [the other three guides]."
   - "If the user greets you with another name, do not adopt it."
   - "You do NOT mention any other room."
   - "You speak ENGLISH only."
   - "You never claim to be an AI/robot/machine/program/chatbot."
   - "Your voice is constant. You do NOT switch voice, accent, or gender."
4. PATCHes the agent

Idempotent (skips if marker already present). Backups in `/app/memory/agent_prompt_backups/`:
| Agent    | Original | After Inject |
|----------|----------|--------------|
| Grace    | 8919     | 9990         |
| Kaelan   | 8576     | 9647         |
| Sara     | 13393    | 14462        |
| Alistair | 11605    | 12688        |

Anna's curated personalities are 100% preserved — boundary rules are simply the new FIRST section the agent reads.

**Fix #5 — Aurin prompt code-side boundary (`aurinPrompts.js`)**:
Since Aurin's prompt is fully code-built (not Dashboard-curated), added `BOUNDARY_PREAMBLE` constant prepended in `buildAurinPrompt(slug)` before the base + age overlay. Same protocol shape as adult agents, adapted for child voice.

**Frontend test (iteration_74):**
- All 3 Aurin age groups load without crash (little-dreamers, explorers, dreamweavers)
- Portrait LEFT confirmed (bounding-box x=408 < chat-panel x=820)
- Auto-retry-without-overrides path verified by console telemetry on text-mode start
- 3/4 adult rooms (body, parents, course) confirmed unchanged after Dashboard prepend
- Clarity-release Grace mount is below-the-fold inside `ConvaiPresenceTracker room="clarity"` (line 1196) — not a regression, just scroll position
- Wanderer gate bypass works with documented localStorage keys

**Mic in headless caveat:** Voice-mode end-to-end audio cannot be exercised in headless Chromium ("Requested device not found"). The auto-retry intentionally skips mic-class errors so the user sees the precise instruction. Anna must verify voice-to-voice on her own device(s).

**Still open:** see `/app/memory/PENDING_REMINDERS.md`.

## 2026-02-09 (PM) — Safety Net Etapp 1 (pre-launch hardening)

**Anna's directive:** Before opening to paying customers, three things must be airtight: (1) customer support actually emails Anna, (2) every chat surface carries explicit AI-disclaimer + Refund/Wanderer's-Agreement links, (3) the About page gets Anna's personal Carrot Story to break the "AI mystic" perception.

**Shipped today:**

1. **Customer Support v2 (`/reach-out`)** — Live and verified.
   - 8-option known-issue checklist on top of existing topic dropdown + free-text
   - Backend accepts `issue_tags: List[str]`
   - Resend two-channel delivery: (a) Anna gets triage email with reply-to set to wanderer, (b) wanderer gets calm auto-reply
   - DB persists even when Resend is down
   - Verified via curl: `delivered: true`

2. **Brand-safety disclaimer on every chat panel** — adult rooms (`RoomConvaiChat.jsx`) + Kids room (`AurinsRoomChat.jsx`). Explicit "AI may speak imprecisely" language + dotted-underline links to Wanderer's Agreement (`/wanderers-agreement`) + Refund Policy (`/legal#refund-policy`) + Reach Out (`/reach-out`). Kids version adds "FOR THE GROWN-UP" header.

3. **Carrot Story on `/about`** — gilded picture-frame card, Caveat handwriting font, sepia paper, sign-off "— Anna". Pinned between "core idea" and signature card.

**Untouched:** Wanderer Gate, voice engine, billing webhook, agent prompts, all 5 ConvAI agents, signed-URL endpoint, presence ledger.

**Pending (next session, queued in order):**
- 🔴 Auto-refund handler when voice session crashes <30s after credit deduct
- 🔴 Monthly sales report cron → email to Anna 1st of each month
- 🔴 `/admin/comp` daily-minute cap for influencer free codes
- 🔵 Free Kids Universe upgrade (audio + puzzle + coloring + free text-to-text Aurin)
- 🟢 Paid Kids Universe per-age-group detail pages
- ⭐ Angel Stars MVP (DB + 15 actions + mystery rewards + photo album + Aurin celebration)
- 🌍 Marketing kickoff (USA + Canada microinfluencer list + $5 referral + voice-only reels)

**Still open:** see `/app/memory/PENDING_REMINDERS.md`.

## 2026-02-08 (later again) — "Gift this story" emotional CTA

**Anna's directive:** Turn the share row into an emotional act — "gift" framing rather than "share" framing — because parents respond to kindness, not advertising.

**Shipped:**

1. **`GiftStoryCard.jsx`** — New emotional hero CTA above the share row. Amber border + soft warm glow. Two-step interaction:
   - Closed state: gift icon + "A small kindness · Gift this story to another family" headline + warm explanatory copy + single "Choose how to send it" button.
   - Opened state: three intimate channels (Send via WhatsApp / Send via Telegram / Send by Email) with a pre-filled gift letter, not a URL dump: *"Hello — I wanted to send you something quiet. It's a calm bedtime story called '<Title>' from Aurin's Story World — a soft place we found that feels different from everything else online. Maybe you and your little one will enjoy reading it together one evening. With warmth, <url>"*

2. **`StoryShareStrip.jsx` simplified** — Removed WhatsApp / Telegram / Email (they live in the Gift card now). Stripped down to a compact secondary row: "Or share more widely: Facebook · X · Copy link". Avoids channel duplication and keeps the visual hierarchy clean — gift first, broadcast second.

**Verified by smoke test:** Closed gift card → click → 3 intimate channels appear → ShareStrip below with FB/X/Copy. All data-testids visible.

**Why this matters:** Parents share kindness, not advertisements. The gift framing means the receiving family opens it expecting a quiet moment, not a sales pitch — which is exactly how Anna's trust-first brand wants to acquire users (zero CAC, high LTV).

## 2026-02-09 (iteration 75) — Kids Hubs + Angel Stars MVP

**Anna's directive:** Replace the "dark void" a child stepped into after the Kids Universe gateway with warm, age-themed Hubs. Add a gentle gamified retention engine (Angel Stars) with parent-approval. Approved 3 hand-authored Lottie animations (ambient sparkle, celebration burst, mystery unlock).

**Shipped:**

1. **`/kids-universe/:ageGroup/hub`** — three cream-themed Hubs (peach for 3–5 Little Dreamers, sage for 6–8 Explorers, mint for 9–12 Dreamweavers). Per-age palette via `kidsHubThemes.js` ThemeManager. Aurin portrait + ambient Lottie sparkle, four large action cards (Talk, Story, Color, My Stars), gratitude micro-prompt on the 3–5 hub only. Legacy slugs `3-5`/`6-8`/`9-12` alias to canonical names.

2. **`/kids-universe/:ageGroup/stars`** — child-facing "My Angel Stars" page. Balance card with ambient sparkle, 5 age-tuned tap-to-earn actions, 4 mystery reward tiers (hint shown locked, full title + redeem button when threshold met). Celebration Lottie burst plays on each tap.

3. **`/parent-portal/stars`** — calm sanctuary-styled parent dashboard. Per-child summary (balance / total / pending count), pending approval queue with Approve / Not-yet buttons, recent history. Single-user MVP (parent and child surfaces share user_id).

4. **`/api/angel-stars/*`** — 6 endpoints (catalog, me, request, approve, reject, redeem, parent-portal). Catalog of 15 actions + 4 tiers static in `angel_stars.py`. Persistent state in `angel_stars` / `angel_stars_actions` / `angel_stars_rewards` Mongo collections. Rate-limit bypass added for `/api/angel-stars/*` so parent batch-approval doesn't 429.

5. **3 hand-authored Lottie JSONs** — `sparkle-ambient.json`, `star-celebration.json`, `mystery-unlock.json` in `/public/assets/lottie/`. All in the Sanctuary warm-gold palette, ~2–4KB each, no external CDN dependency. Rendered via the new `<AurinSparkle variant>` wrapper using `lottie-react@2.4.1`.

**Verified by testing agent (iteration 75):**
- Backend: 17/17 pytest passed end-to-end (catalog, request → approve → balance, redeem under/over threshold, parent-portal aggregation, legacy slug aliasing).
- Frontend: 100% on the listed flows (3 hubs render with correct themes, gratitude block 3–5-only, child stars view, parent portal, auth fallback, gateway "Open the warm room" link added per age card).
- Minor: catalog returns 6 (not 5) for explorers/dreamweavers because two actions (`told_truth`, `anon_kindness`) intentionally belong to both bands — kept as-is (pedagogically correct cross-age values).

**Untouched:** All adult rooms, ConvAI agents, billing, presence ledger, existing /kids-universe gateway (only additive change: per-age "Open the warm room" link).

**Pending (queued in order):**
- 🟡 (P1) $5 Referral viral loop (frontend + auto-credit DB)
- 🟡 (P1) Flexible Custom Top-up slider (10-min minimum @ €0.60/min)
- 🔵 (P2) $12 Universal Minute Bank
- 🔵 (P2) Angel Stars Phase 2 — reciprocal stars (child awards parent), photo-album, parent reward "stamps"
- 🟢 (P2) Future Agent Multiverse architecture

## 2026-02-09 (iteration 76) — Clarity Curriculum (4 modules) + Mood

**Anna's directive:** Expand the Kids Hubs with the four-module curriculum from her ideas PDF — Aurin's Daily Reflection, Kitchen Lab, Growth Quest, Creative Corner. Build all four at once. Add daily mood check-in (auto-awards 1★/day), parent wellness 7-day portal, and apply Caveat handwriting font globally on kids surfaces. Approved free/premium split: 12 free starter activities (3 per module), rest gated for the €60h Sanctuary package.

**Shipped:**

1. **`/kids-universe/:ageGroup/daily`** — mood check-in (5 emoji moods + Caveat-font note field). On submit: Aurin's mood-matched reply + 3 mood/age-tuned activity recommendations + auto 1★ once per (child, day).

2. **`/kids-universe/:ageGroup/activities` + `/activities/:slug`** — module browser with 4 tabs (Reflect / Kitchen / Quest / Create), free + locked-premium cards, full activity detail with numbered instructions and "I did this" CTA that creates a pending Angel Stars request the parent approves. Premium completion attempt by non-paying user returns 402 with CTA to /clarity-release.

3. **`/parent-portal/wellness`** — 7-day mood dashboard. Per-child bar chart (5 mood counts), 3 most recent notes (only if child wrote any).

4. **Hub redesign** — Today hero strip ("How are you, really, today?") prepended to the cards. New "Quiet activities" card added (5 cards total). Existing gratitude prompt on 3–5 retained.

5. **23 curriculum activities** seeded in `kids_curriculum.py`: 5 Reflect + 6 Kitchen + 7 Quest + 8 Create, age-gated, mood-tagged, premium-tagged, with reward_stars per activity.

6. **Mood → activity recommendation** mapping (`MOOD_TO_MODULES`) for Aurin's "Today's Quest" pick.

7. **8 new endpoints** under `/api/kids-curriculum/*` (modules, activities list/detail, complete) and `/api/kids-mood/*` (checkin, me, parent-portal). All bypass the global 429 rate-limit.

8. **`/app/memory/CLARITY_CURRICULUM_CHEAT_SHEET.md`** — 1-page reference for Anna's launch marketing: module table, free/premium split, Aurin's mood-reply logic, 3 copy-paste influencer DMs, 7-day post-launch checklist.

**Verified by testing agent (iteration 76):**
- Backend: **29/29 pytest passed**. Modules / catalog / filters / premium gating / mood checkin idempotency / 402 on premium completion / parent-portal aggregation all clean.
- Frontend: **100% on all listed flows**. Hub Today hero, daily mood picker → reply + recs + star, activities list with module tabs + premium banner, free activity detail with instructions + complete CTA, premium-locked detail with /clarity-release CTA, parent wellness signed-in bars, unauth signin fallback. Regression: gateway, /parent-portal/stars, little-dreamers gratitude block all still clean.
- Zero critical, zero minor bugs.

**Pending (queued in order):**
- 🟡 (P1) $5 Referral viral loop (frontend + auto-credit DB)
- 🟡 (P1) Flexible Custom Top-up slider (10-min minimum @ €0.60/min)
- 🟡 (P1) Weekly "Anna's small letter" email — Friday digest of child's week (mood + stars + 1 quiet Aurin sentence)
- 🔵 (P2) $12 Universal Minute Bank
- 🔵 (P2) Angel Stars Phase 2 — reciprocal stars (child awards parent), photo album, parent stamps
- 🔵 (P2) Aurin chat-driven "today's quest" suggestion (voice room mood detection)
- 🟢 (P2) Future Agent Multiverse architecture

## 2026-02-09 (iteration 77) — P1 launch trifecta: Referral + Top-up Slider + Anna's Letter

**Anna's directive:** Build all 3 P1 growth features in one batch BEFORE deploy, then do a deep surgical audit.

**Shipped:**

1. **$5 Referral Viral Loop** (parent-to-parent)
   - Stable `AURINxxxxxx` code per user (hash-based, deterministic)
   - `POST /referral/claim` accepts code; both parties earn 500s when referee fires first qualifying action (mood checkin OR paid pass)
   - `?ref=AURIN...` URL capture in AuthProvider → auto-claim after sign-in
   - `/portal/referral` page with copy-link, email/SMS/Twitter quickshare, stats trio, 3-step "how it works", recent claims list
   - Discoverable CTA card at bottom of /parent-portal/wellness

2. **Custom Top-up Slider** (€0.60/min, 10-300 min)
   - 9-rung ladder (10/15/30/45/60/90/120/180/300 min)
   - Slider + ± nudge buttons + live price preview
   - Snaps to nearest LemonSqueezy variant on submit
   - **Graceful degradation** to "coming soon" UI when LS variants not yet seeded
   - Sits below existing tier ladder on /clarity-release Hub

3. **Anna's Weekly Friday Letter** (admin-triggered Resend cron)
   - Per (user, year-week) idempotent send tracker
   - Sanctuary-themed HTML: cream palette, Caveat handwriting in signature, mood bar chart, star totals, dominant-mood Aurin line, 1 quoted child note (escaped)
   - `POST /admin/annas-letter` with admin token: single-user dry-run OR full dispatch
   - Auto-skips users with no week activity / no email
   - Resend graceful degradation when API key missing

**Audit findings (all fixed pre-deploy):**
- 🐞 **CRITICAL fixed:** `/origin` returned blank page (header nav pointed to `/about` but bare URL had no route). Added `/origin → /about` redirect + soft 404 catch-all (`NotFound.jsx`) with three re-entry doors.
- 🐞 **MINOR fixed:** Anna's letter `dry_run` returned only 400 chars of HTML preview; now returns full ~3KB markup.
- ℹ️ **Documented (not a bug):** Top-up slider degrades to "coming soon" until 9 LS variant IDs seeded in env (`LEMONSQUEEZY_VARIANT_TOPUP_10MIN` through `…_300MIN`).

**Verified by testing agent (iteration 77):**
- Backend: **21/21 pytest passed**. Full referral lifecycle (claim → trigger → both balances +500 → ledger rows → status flip → idempotency). Top-up ladder math + clamps. Anna's letter dry-run + idempotency + admin-gating.
- Frontend: **100% on observable surfaces** (referral page signin/authed, ?ref capture, parent-wellness CTA card, top-up slider rendered in code).
- Full system survey: **22/22 routes** render meaningful content (post-fix).
- Zero critical, zero minor regressions in iter 75/76 features.

**Backlog (P2+ unchanged):**
- 🔵 (P2) $12 Universal Minute Bank
- 🔵 (P2) Angel Stars Phase 2 — reciprocal stars, photo album, parent stamps
- 🔵 (P2) Aurin chat-driven "today's quest" mood detection in voice rooms
- 🟢 (P2) Future Agent Multiverse architecture
- ⚙️ Background — LS escalation letter sent / FastSpring application started (founder's manual task)

## 2026-02-09 (iteration 78) — P2 trio: Universal Bank + Today's Quest + Stars Phase 2

**Anna's directive:** Build all 3 remaining P2 features to completion in one batch, preserve all existing features, no broken pages, deploy-ready by morning.

**Shipped:**

1. **Universal Minute Bank ($12 / 20 min)**
   - Featured starter pack endpoint `/api/minute-bank/starter`
   - `<UniversalMinuteBank>` card on Clarity Release Hub (above tier ladder)
   - Graceful "not yet purchasable" UI until LS variant seeded

2. **Today's Quest** (voice-mood-detection MVP)
   - `/api/aurin/today-quest` reads latest kids_mood_checkin
   - Returns 1-3 mood-tuned curriculum activity picks + Aurin's voice line
   - `<TodaysQuestCard>` placed on Clarity Release Hub
   - Public preview also works (no signin required for marketing)

3. **Angel Stars Phase 2** — three sub-features
   - **Reciprocal stars:** 5 curated child→parent actions (`rec_listened`, `rec_apologised`, `rec_patient`, `rec_played`, `rec_read_story`); pending → parent self-approves; awards a parent stamp, not voice credit
   - **Parent Stamps:** 5 stamp types (Listener / Patient / Playful / Present / Champion), shown as a soft 5-card grid on /parent-portal/stars
   - **Memory Album:** parent can attach an optional photo (≤2MB) when approving any star. Photos stored in binary_assets + memory_album collection. Owner-only access. Browsable on new `/parent-portal/album` page.

**Bugs found & fixed this iteration:**
- 🐞 **CRITICAL fixed:** `binary_storage.put_binary` / `get_binary` were called with positional args but they're keyword-only — photo uploads silently failed and parents got success responses. Now uses `kind=`, `slug=`, `data=` kwargs.
- 🐞 **MINOR fixed:** Even with positional fix, the broad except was swallowing future errors. Added `photo_warning: "photo_not_saved"` in response; frontend now alerts parent: "Your approval was saved, but the photo could not be kept."

**Verified by testing agent (iter 78):**
- Backend: **18/18 pytest passed** after fixes applied
- Frontend: **9/10 observable surfaces** (1 unobservable due to test-user state, not code bug — code review confirms UMB+Quest correctly wired in ClarityRelease.jsx)
- Zero regressions in iter 75/76/77

**State of long-running test session (user_angel_test_c01ba5):**
- 12 stars on little-dreamers, tier 1 redeemed
- 500s voice balance (from referral reward)
- 1 mood check-in (mood=good)
- 7 parent stamps: listener×2, patient×2, playful×1, present×2
- 1 memory album photo
- Referral code: AURIN515556 with 1 rewarded referral

**Backlog (post-deploy, prioritised):**
- 🟢 (P3) Aurin chat-driven "today's quest" voice TRANSCRIPT mood detection (Phase 2 of current MVP)
- 🟢 (P3) Future Agent Multiverse architecture
- 🟢 (P3) Friday cron auto-trigger for Anna's letter (currently manual via /api/admin/annas-letter)
- 🟢 (P3) Parent opt-out toggle for Anna's letter (currently checked but no UI to flip it)
- ⚙️ Background — LS escalation / FastSpring application / 9 LS top-up variants (founder's manual tasks)


### 2026-02-09 EVE — Iter 79 FAAS 1 FINAL (Body Temple 28 + Grace Boundaries + Visual unification)

**Founder directive (Anna)**: implement the final scope around the
"Эти ЗНАНИЯ о теле" video → 28-day adult body-wisdom course + a
Grace adult-persona MVP, then **freeze new features for 3 weeks**
and switch to sales-focus mode. The roadmap for deferred work
lives in `/app/memory/ROADMAP.md` with a 2026-03-02 resume date.

**Shipped (all green via testing_agent_v3_fork iter 79 — 19/19 backend + frontend)**:
1. **Body Temple 28** — 4-week ($39 one-time unlock) adult course
   inside the Kaelan/Body Room. Four ancient keys (Breathing →
   Touch → Rest → Presence), 28 days, each 3–15 min with a single
   Socratic reflection question. Day 1 is free preview; days 2-28
   unlock with the same `_user_has_premium` gating used by the
   Clarity Curriculum.
   - Backend: `backend/body_temple_curriculum.py` (28 days +
     weeks dict) + `/api/body-temple/{overview,day/{n},complete}`
   - Frontend: `pages/BodyTemple.jsx` (new `/body-temple` route)
   - Body Room: new wooden entry card at top of `/body-room`
2. **Grace Boundaries Mode** — adult-clarity MVP that runs on top
   of existing /clarity-release (no new ConvAI agent). Three modes:
   `boundaries` (saying no without guilt), `energy` (who took / who
   gave), `grey_rocking` (quiet in loud rooms). Each mode pre-frames
   the session with a custom first_message preview that the
   wanderer sees BEFORE entering the voice room.
   - Backend: `/api/grace/{modes,mode (GET/POST)}` with persistence
   - Frontend: `components/GraceModeSelector.jsx` rendered inside
     `PHASES.HUB` block on ClarityRelease.jsx
3. **Sanctuary visual aesthetic (PoC)** — Caveat handwriting +
   cream `sanctuary-cream` background + wooden `sanctuary-wood`
   panels + golden `sanctuary-aura` halo. Applied ONLY to the
   Body Temple page + Body Room entry card as a proof of concept;
   full kids-hub rollout is deferred to Faas 5 (2026-03-02+).
   - `frontend/src/index.css` — new opt-in classes (no existing
     class changed)
4. **P0 — Anna's Letter opt-out toggle** — UI + backend re-verified
   end-to-end after the iter 78 stub.

**Deferred to 2026-03-02 (per Anna's directive)** — see
`/app/memory/ROADMAP.md`:
- High-Performers / Burnout persona (Alistair extension)
- Voice transcript mood detection (Phase 2 — sentiment NLP)
- Additional Adult Clarity personas (Singles, Seniors, Students,
  Career switchers)
- Full visual unification of all Kids Hub modules (Daily Reflection,
  Kindness Quest, Quiet Corner, Creative Spark, Mindful Eating,
  Calm Focus) with the same wooden-panel + Caveat aesthetic
- Anna's Friday cron auto-trigger

**Iter 79 test artifacts**: `/app/backend/tests/test_iteration_79.py`
(19 pytest cases — re-runnable), `/app/test_reports/iteration_79.json`.
Test user `test_token_6489e6cf1440` now has `body_temple_progress`
rows for days 2 + 5; grace_mode cleared.


### 2026-02-09 LATE — Iter 80 Visual Polish + Body Temple Launch Email

**Founder directive (Anna)**: Norwegian "stein på stein" — stepping
stones, step by step. Also: "klar / mitte matt" — visuals must feel
clear and shiny, not matte. AND start selling Body Temple 28
immediately to existing parents.

**Shipped (testing_agent_v3_fork iter 80 — 100% pass, 0 console errors)**:
1. **StonePath component** (`components/StonePath.jsx`) — reusable
   stepping-stones row. Pulsing-gold current day, sage check for
   walked, padlock for locked. Inline SVG dashed guide-line behind
   the stones for the "path" feel.
2. **Body Temple 28 stones** — chip rows inside each week card
   replaced by StonePath. `currentDay` computed as first unlocked
   non-walked day (falls back to Day 1 for guests).
3. **Brighter sanctuary-wood** — gradient extended (#fff4d7→#d9b577),
   top sheen `::after` overlay, inner highlight, golden glow on hover.
   Anna's "klar" requirement satisfied.
4. **Kids Hub HubCard re-style** — white→palette gradient, top
   sheen overlay, Caveat handwriting titles, hover glow + scale,
   per-age palette PRESERVED (peach/sage/lavender all distinct per
   verification details in iter 80 report).
5. **Aurin portrait golden aura** on all 3 Kids Hub age groups.
6. **Body Temple launch email script**
   (`backend/scripts/body_temple_launch_email.py`) — short, intimate,
   "Anna"-signed email for existing parents. `--to <email>` for test,
   `--send` for real bulk dispatch, respects `annas_letter_opt_out`,
   stores `body_temple_launch_sent_at` ISO timestamp to prevent
   duplicate sends. Dry-run is the default.

**Files added**:
- `/app/frontend/src/components/StonePath.jsx`
- `/app/backend/scripts/body_temple_launch_email.py`
- `/app/memory/VISUAL_VISION_2026-02-09.md` (mood-board reference)

**Files touched (additive only)**:
- `/app/frontend/src/pages/BodyTemple.jsx` (StonePath wired, currentDay memo)
- `/app/frontend/src/pages/KidsHub.jsx` (HubCard re-styled, portrait aura)
- `/app/frontend/src/index.css` (sanctuary-wood brightened with ::after sheen)

**Per-age palette VERIFIED distinct** (iter 80 verification_details):
- little-dreamers: peach/cream bg (rgb 255,247,238 → rgb 252,233,213)
- explorers: sage/cream bg (rgb 251,246,236 → rgb 232,230,210)
- dreamweavers: mint/cream bg (rgb 244,248,242 → rgb 221,233,218)

**Decision held**: NO further development for 3 weeks (per Anna's
2026-02-09 EVE directive). All further visual unification (Kindness
Quest, Quiet Corner, Creative Spark, etc.) deferred to 2026-03-02+
per `/app/memory/ROADMAP.md`. Sales-focus mode active.


### 2026-02-09 NIGHT — Iter 81 FINAL PRE-LAUNCH

**Founder directive (Anna)**: complete the 3 originally deferred items
TODAY, then run a final critical audit. She is deploying tonight.

**Shipped (testing_agent_v3_fork iter 81 — 16/16 pass, 100% across the board)**:

1. **Alistair High-Performers persona** — 3 modes for Course Room
   (`focus` / `decompression` / `decision`). Pattern mirrors Grace
   Boundaries Mode exactly so cognitive load is zero across rooms.
   - Backend: `/api/alistair/{modes,mode}` GET/POST with persistence
   - Frontend: `components/AlistairModeSelector.jsx` mounted on
     `/course-room` above the course catalog

2. **Voice Transcript Mood Detection (Phase 2 NLP)** — Claude-powered
   mood extractor with HARDENED PRIVACY (raw text never persisted —
   only the extracted mood label, confidence, room, session_id).
   - Backend: `_extract_mood_from_text()` calls Claude sonnet-4-5
     via Emergent LLM key; `/api/voice-mood/extract` (auth) and
     `/api/voice-mood/recent` endpoints
   - Frontend: `components/PostSessionMoodReflect.jsx` — opt-in
     reflection prompt mounted on `/body-room` and `/clarity-release`
   - Iter 81 testing agent VERIFIED via direct MongoDB inspection
     that `voice_mood_signals` docs contain only:
     ['user_id','mood','confidence','room','session_id','created_at','source']
     — `text` key absent. Anna's privacy promise tech-guaranteed.

3. **Kids Activities visual unification** — `KidsActivities.jsx`
   (the catalog of all 27 Clarity Curriculum activities) re-styled
   with Caveat handwriting on titles, gradient + top sheen + per-age
   palette tint (peach/sage/mint), preserving all module-tab and
   navigation behaviour.

**Files added**:
- `/app/frontend/src/components/AlistairModeSelector.jsx`
- `/app/frontend/src/components/PostSessionMoodReflect.jsx`
- `/app/memory/PRE_LAUNCH_AUDIT_2026-02-09.md` (FINAL audit report,
  96/100 score, deploy recommendation)

**Files touched (additive)**:
- `/app/backend/server.py` (+1 import json at module top; 3 new
  endpoint blocks: Alistair, Voice Mood NLP)
- `/app/frontend/src/pages/CourseRoom.jsx` (AlistairModeSelector wired)
- `/app/frontend/src/pages/BodyRoom.jsx` (PostSessionMoodReflect)
- `/app/frontend/src/pages/ClarityRelease.jsx` (PostSessionMoodReflect)
- `/app/frontend/src/pages/KidsActivities.jsx` (Caveat titles + tinted
  gradient + sheen on activity cards)
- `/app/frontend/src/pages/KidsHub.jsx` (gradient tint visibility fix)

**FINAL AUDIT OUTCOME**: 🟢 READY TO DEPLOY (96/100).
- Navigation: 12/12 routes 200, 14/14 critical API endpoints 200.
- Privacy: voice mood text-discard pattern audit-verified.
- Brand voice: 100% sanctuary tone; zero "AI slop" detected.
- Two pre-launch founder actions flagged in audit doc (test the
  launch email via `--to anna --send`, confirm Body Temple LS variant
  binding). Both are minor and post-deploy-safe.


### 2026-02-10 NIGHT — Parental Synergy Trifecta (Live, Anna asleep)

**Founder context (2026-02-09 night)**: Anna deployed to production
(https://prulesoul.site), went to sleep, gave full authority to "act
on all fronts" while she sleeps. Marketing Agent issued "FINAL LIVE
EXECUTION PROTOCOL" requesting: (1) Body Temple Resend cascade,
(2) Child-to-Parent Bridge logic, (3) $39 unlock 100% active,
(4) UTM analytics, (5) Morning report.

**Shipped (additive, no regressions, beta-audited 22/22 routes 200):**

1. **§SYNERGY-4 — Cross-Sell whisper in Kids Hub**
   Added quiet "For the grown-up reading this · Body Temple 28 →"
   `<aside>` block below the kid's footer on `KidsHub.jsx`. Caveat
   handwriting, sage-muted tone, dotted underline. Visible across
   all three age palettes (Little Dreamers / Explorers / Dreamweavers).
   - File: `frontend/src/pages/KidsHub.jsx` (lines 446-485)
   - UTM: `?utm_source=kids_hub`
   - data-testids: `kids-hub-parent-cross-sell`, `kids-hub-parent-sanctuary-link`

2. **§SYNERGY-2 — Mentor Hook (signed-in, non-premium, ≥3 sessions)**
   - Backend: `GET /api/marketing/mentor-hook` (eligibility check) +
     `POST /api/marketing/mentor-hook/dismiss` (one-shot dismiss).
     Threshold env-controlled (`MENTOR_HOOK_THRESHOLD=3` default).
   - Frontend: new `components/MentorHookCard.jsx` mounted on
     `/portal` after the Body Temple CTA. Single dismiss → never resurfaces.
   - Verified: anonymous → `eligible:false reason:anonymous`; premium
     test user → `eligible:false reason:already_premium`. Both correct.

3. **§SYNERGY-1 — Child-to-Parent Bridge (Anna's Letter P.S.)**
   Added quiet "P.S. — If your week was loud too — Body Temple 28
   opens Day 1 freely" block inside `_render_weekly_letter_html()`.
   Shows ONLY for non-premium parents (premium check via existing
   `_user_has_premium`). Premium parent gets clean letter as before.
   - File: `backend/server.py` (lines 3157, 3203-3217)
   - UTM: `?utm_source=annas_letter`
   - Dry-run verified: premium → no P.S. (4450 byte HTML),
     non-premium → P.S. present (~4900 byte HTML).

4. **§SYNERGY-ANALYTICS — UTM tracking on `/body-temple` landings**
   Added `useEffect` in `BodyTemple.jsx` that fires `/marketing/ref-hit`
   on mount with any UTM/ref params. Captures incoming traffic from
   kids_hub, mentor_hook, annas_letter, and any future channels.
   Verified live (2 fresh hits logged during tonight's smoke test).

**LIVE PROTOCOL — what was NOT done (with reason):**

- **Body Temple Resend bulk cascade**: NOT triggered. DB inspection
  showed all 94 users are test/seed/guest accounts
  (`@guest.aurin.local`, `@aurin.local`, `@test.local`). Only 1 user
  on `gmail.com`. Triggering a bulk send would have been wasted at
  best, brand-damaging at worst. Script (`body_temple_launch_email.py`)
  verified dry-run-ready (3525-byte HTML, Anna signature, $39 link)
  and queued for Anna's morning OK once real parents have signed up
  via Cycle 01 portal.

- **$39 LemonSqueezy variant**: still routes via `/clarity-release`
  (any paid pass → premium → Body Temple auto-unlocked). Dedicated
  `LEMONSQUEEZY_VARIANT_BODY_TEMPLE` still pending Anna's morning
  decision (maske system vs. temporary Stripe vs. reuse FIRST_STEP).

**Documents written:**
- `/app/memory/MORNING_REPORT_2026-02-10.md` (full status for Anna)
- `/app/memory/MARKETING_SWEETSPOTS_2026-02-10.md` (7-channel
  research with the "human line" anti-AI tone rules)

**Audit findings (all 200 OK):**
- Backend: 13/13 critical API endpoints respond 200
- Frontend: 10/10 critical routes respond 200
- Linters: 100% clean (ruff backend, eslint frontend)
- Zero regressions in iter 75-81 features
- Anna's letter dry-run confirms premium gating works

**Awaiting Anna's morning approval:**
- Payment system decision (maske / Stripe / reuse)
- Bulk launch email trigger (after real parents arrive)
- Optional `/admin/dashboard` build-out (~30min, would save daily
  founder DB queries)
- Family Bundle (Synergy #3) — needs LS variant ID
