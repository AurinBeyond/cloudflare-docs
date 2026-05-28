# Matrix Aurin — PRD

## Original Problem Statement
"STABILIZATION + REAL PRODUCT EXECUTION MODE" — Matrix Aurin, calm voice-first mentor ecosystem with 4 psychologically isolated rooms (Grace/Private, Kaelan/Body, Sara/Parents, Alistair/Course), powered by ElevenLabs Conversational AI (`@elevenlabs/react`). Zero-Override policy: Dashboard is single source of truth for personas/voices/prompts; code only opens WebSocket + pipes audio.

## 🔒 LOCKED Membership Architecture v2.3.1 (2026-02-12 — supersedes 2026-05-16 model)

**Single source of truth:** `/app/memory/MEMBERSHIP_ARCHITECTURE_v2.3.md` (base) + `/app/memory/MEMBERSHIP_ARCHITECTURE_v2.3.1_PATCH.md` (cohort safeguard + honest archive language).

**Six public surfaces (AI-only · no founder time in any tier):**
- Kids Day Pass €25 / 24h (sole pre-gate public price)
- Quiet Entry €89/mo · €239/qtr · €890/yr
- Aurin Storyteller €79/mo · €209/qtr · €790/yr (standalone children's bundle)
- Inner Compass ⭐ €229/mo · €619/qtr · €2,290/yr (primary membership)
- Sanctuary Compass 🏛️ €329/mo · €889/qtr · €3,290/yr (highest LTV / family layer)
- Sovereign Circle 🔒 Standard €1,890/qtr · Bespoke €3,490/qtr (by application; Founding Cohort: first 10 lock founder rate for life)

**Adult day passes (gate-side only):** €49 / 30 min ConvAI, €89 / 60 min ConvAI.
**Margins (worst-case full burn):** 71.9% – 86.8% across all surfaces.
**Polar.sh catalogue:** 24 SKUs (12 bundle + 4 Sovereign + 3 day-pass + 7 top-up).

**Doctrinal constraints (no agent may violate):**
- No founder time in any tier. No "personal advisor", "interview", "live call", "coaching".
- No "wellness / therapy / mental-health" classifier (PSP relationship risk).
- No "credits" as a word. Always "prepaid voice transmission packages".
- No "unlimited" customer-facing.
- No fungibility between adult-voice and child-voice wallets.
- Public surface displays only the Kids Day Pass €25; all other prices behind the gate.

**90-day auto-review trigger:** If neither Sovereign tier converts a member within 90 days of public launch, founder reviews with agent. No price drop without this review. No founder time may be added to compensate for slow Sovereign sales.

---


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


### 2026-02-10 MORNING — Faas 5 (Kids visual unification) + Anneli Story Gift Growth Loop

**Founder context**: Anna pointed out (correctly) that Faas 5 was paused mid-way.
She also asked to build the Anneli personalised story idea immediately, with
Telegram share (her explicit ask). Approved go-ahead: A1+A2.

**Shipped (additive, no regressions, beta-audited 14/14 routes 200):**

1. **§FAAS-5 (continuation) — Kids visual unification across 3 missing pages**
   - `KidsDaily.jsx` — Caveat H1 ("How are you, really?") in palette.accent;
     mood cards with gradient + top-sheen + per-palette glow shadow.
   - `KidsStarsView.jsx` — Caveat H2 ("Things that earn a star",
     "Give a star to your grown-up", "Mystery wishes"); action buttons
     redesigned with gradient + sheen + Caveat labels at 18px.
   - `KidsActivities.jsx` (detail view) — Caveat H1 for activity title;
     instruction step cards re-cased with gradient + sheen.
   - All three honour the per-age palette (Little Dreamers blush /
     Explorers sage / Dreamweavers indigo).

2. **§SYNERGY-ANNELI — Personalised Story Gift growth loop**
   - Backend module `aurin_story_gift.py`: Claude Sonnet 4.5 generates
     200-word bedtime story in Anna's voice. 8 feelings × 3 age bands
     × specific mood-anchored opening. Hard tone rules (no "journey/
     unlock/magical adventure"; one fragment sentence; one sensory
     detail; ends with a quiet image, not a moral).
   - Backend endpoints in `server.py`:
     - `GET  /api/story-gift/feelings` (8 feelings + 3 age bands)
     - `POST /api/story-gift/create` (validates + generates + stores)
     - `GET  /api/story-gift/{slug}` (reader view)
   - DB collection `story_gifts` (slug-indexed, persistent for re-render)
   - Frontend pages:
     - `/aurins-room/gift` — 3-field form (name, feeling, age band)
     - `/aurins-room/gift/:slug` — reader view with **WhatsApp · Telegram
       · Email · Copy link** share strip + growth-loop CTA "Would you
       like one for your own child tonight?" + 3 soft doorways (more
       stories, Body Temple, Kids Universe).
   - Live LLM test verified: 199-word story, child's name appears,
     no banned words detected, ends with sensory trailing image.
   - UTM analytics: every share carries `?ref=story_gift&utm_source=anneli`;
     every "make own story" click carries `?ref=gift_inception` — these
     land in `referral_hits` for 5%-hypothesis measurement.

**Anna's strategic Q&A answered:**
- **Faas 2**: Confirmed already shipped in iter 81 (Alistair persona on
  Course Room with 3 modes). Anna asked if she wanted a dedicated
  `/high-performers` landing page — pending her morning decision.
- **Family Bundle LS Variant ID**: Specified — Anna creates one LS variant
  "Family Bundle — Body Temple + Kids Universe Premium" at $59 one-time,
  passes its 12-digit ID via `LEMONSQUEEZY_VARIANT_FAMILY_BUNDLE` env.
  Code can be wired in ~30min once ID exists.
- **Paddle vs FastSpring**: Recommended Paddle (owner of LemonSqueezy
  since 2024; AI-friendly; faster onboarding; cheaper). FastSpring
  reserved as plan B. No urgency — LS already functional.
- **LS Top-Up 9-rung variants**: pending — needs 3-way coordination
  with Anna + Marketing Agent + LS Agent (Anna's call).

**Awaiting Anna's morning approval / data:**
- LS Top-Up variant IDs (9 of them) for €0.60/min ladder
- Family Bundle variant ID (when she creates it)
- Whether to build dedicated `/high-performers` landing page
- Whether to ship the bulk Body Temple launch email (still GO when
  ≥20 real parents have signed up via Cycle 01 portal)


### 2026-02-10 AFTERNOON — Economics + /high-performers + 5 Micro MUSE keys

**Founder approved entire economic plan**. Acted on every item:

1. **5 Micro MUSE Guest Keys minted** (Cycle 01 distribution)
   - Each: 10 uses × 15 voice-min + Body Temple unlock, 45-day expiry
   - **Maximum total cost exposure**: €97.50 if every single redemption maxes out
   - **Realistic expected cost** (40% redemption × 60% minute-use): ~€23
   - Codes ready for Anna's hand-distribution:
     - `MUSETLMJND` / `MUSEGV8RFK` / `MUSE3FHB9S` / `MUSE3TVFK7` / `MUSEGBLPQL`
   - Share URL pattern: `https://prulesoul.site/portal?key=MUSEXXXXXX`

2. **`/high-performers` LinkedIn landing page — LIVE**
   - File: `frontend/src/pages/HighPerformers.jsx` (~250 lines)
   - B2B-positioned ("decision-recovery", "professional OS",
     "the calendar that ate my sleep") — uses Linguistic Guardrails-
     approved vocabulary only. NO trauma/anxiety/therapy/mental-health.
   - Hero (Fraunces serif) → felt-lines (Caveat handwriting) →
     4 pillars (gradient cards with sheen) → founder voice (Anna's
     03:14 Monday story) → "what it is/isn't" legal-safe disclaimer →
     final CTA. All paths point to `/body-temple` for checkout.
   - Auto-fires `?utm_source=high_performers&utm_campaign=linkedin_b2b`
     to `referral_hits` for LinkedIn conversion tracking.

3. **Economics document** — `/app/memory/ECONOMICS_2026-02-10.md`
   - Real cost basis: €0.13/voice-min (ElevenLabs $0.10 + Claude $0.04)
   - Top-up margins 66-73% across all rungs
   - Family Bundle $59 → 80% margin (cost basis $8.10, LS fee $3.45,
     perceived value $104 with 43% "value-frame" anchor)
   - 5 Micro-key strategy validated as max €97.50 worst-case
   - Break-even: 4 × €36 top-ups OR 2.1 × Family Bundles cover monthly
     ElevenLabs Pro fixed costs

**Paddle vs FastSpring** — comprehensive answer delivered:
- Hold LemonSqueezy today (it's working, Paddle owns LS since 2024 anyway)
- Migrate to Paddle ONLY IF: LS limits AI products / Anna hits €10k/mo /
  needs subscription pause / discovers FS-tier fee differential
- Never go FastSpring (0.9% higher fees, 3-7 day approval, AI-conservative)

**Beta audit**: 10/10 routes 200 OK, lint clean

**Awaiting Anna / LS Agent:**
- LS Agent: create 4 P0 TopUp variants (€9, €18, €36, €108) +
  Family Bundle ($59) → drop env IDs in Deploy
- Marketing Agent: LinkedIn copy + ≥10 business email list
- Anna: distribute the 5 MUSE keys to chosen influencers


### 2026-02-10 LATE — LS Affiliate Hub wiring + Marketing Brief curation

**Founder approved**: A=a1 (LS Affiliate), B=b1 (no Paddle now),
C=c2 (wait for partner), D=d1 (Marketing Brief).

**Also**: Founder shared raw GPT-generated LinkedIn copy and asked for
honest, critical curation against Linguistic Guardrails.

**Shipped (no regressions, 9/9 routes 200):**

1. **LemonSqueezy Affiliate Hub — end-to-end tracking wired**
   - Backend: `RefHitInput` accepts new `affiliate_id` field; analytics
     now classifies `code_kind == "affiliate"` separately from MUSE / AURIN / UTM.
   - Frontend `BodyTemple.jsx` + `HighPerformers.jsx`: capture `?aff=`
     URL param, log it to `/marketing/ref-hit`, persist to `sessionStorage`.
   - `lemonsqueezy.js` checkout builder: appends `?aff=<id>` to the
     LS checkout URL so LS Affiliate Hub gets last-click attribution.
   - Verified: `code=AFF_PARTNER42 kind=affiliate` correctly logged.

2. **Honest critique of GPT-shared marketing copy (delivered to founder)**
   - Identified brand confusion (GPT used "Clarity" — should be "Aurin"/"Body Temple 28").
   - Flagged $500/mo fabricated price tier.
   - Identified ChatGPT recommendation overstated Paddle+Impact integration depth.
   - Confirmed LS has built-in affiliate (matches what Paddle+Impact would need extra setup for).
   - Recommended: keep LS, activate LS Affiliate Hub, defer Paddle to >€10k/mo.

3. **Marketing Agent Brief** — `/app/memory/MARKETING_BRIEF_LINKEDIN_2026-02-10.md`
   - 3 LinkedIn posts curated (Rational / Professional / Human),
     all brand-corrected and guardrails-compliant.
   - 3 cold DM templates (executive / somatic practitioner / HR leader).
   - 1 cold email template with mandatory legal disclaimer footer.
   - 4-week rollout calendar.
   - Anti-AI tone enforcement rules.
   - Full audit trail of what was removed from GPT draft and why.

**Awaiting:**
- LS Agent: 5 LS variant IDs (Top-Up + Family Bundle) in Deploy env.
- LS Agent: activate LS Affiliate Hub, generate 1 partner link if Anna chooses someone.
- Marketing Agent: pick a post from the brief and ship Week-1 schedule.
- Anna: distribute the 5 MUSE keys + decide if/when to mint a Standard-key


### 2026-02-10 EVENING — Story Gift Gallery + Google Workspace guidance

**Founder asked**: build the "Aurin's first ten stories" gallery to
reduce blank-page hesitation on `/aurins-room/gift`. Also asked for
help with Google Workspace domain verification.

**Shipped:**

1. **StoryGiftGallery component** — `/app/frontend/src/components/StoryGiftGallery.jsx`
   - 10 hand-curated reference stories below the form
   - Each card: title, feeling/age/archetype tag, opening 30-40 words
   - Click to expand the next 30 words inline
   - Covers all 3 archetypes (Night Guardian / Peace Keeper / Protector)
     and all 8 feelings × 3 age bands matrix
   - Characters: Luca, Mira, Eero, Noa, Iris, Amos, Stella, Kai, Lina, Tobi
   - Sage Caveat headers + Fraunces body + gradient sheen cards
   - data-testids: `story-gift-gallery` + `story-gift-sample-<slug>`
   - Stories are STATIC reference (no LLM cost) — actual user story
     generated fresh by Claude when they fill the form

2. **Google Workspace domain verification — instructions delivered**
   - Anna needs to add ONE TXT record in Cloudflare:
     - Type: TXT
     - Name: @
     - Content: `google-site-verification=hlJwTFZJ67aS8kFNOWX6YCjS7OCzbNkFEGnY4yS_NqE`
     - TTL: Auto, DNS-only (grey cloud, not orange)
   - Detailed step-by-step provided in chat (Anna executes in Cloudflare UI)
   - Once verified: Resend can send from `anna@prulesoul.site` (much
     better trust signal than `noreply@resend.dev`)

**No regressions, lint clean, gallery renders cleanly.**.


### 2026-02-10 LATE-PM — Iter 82: Kids Universe Stepping-Stone Path (Faas 5 closure)

**Founder directive (Anna, very upset)**: prior "Kids Universe done" claims were
superficial (only fonts/colors). She demanded a REAL immersive 28-day path —
stepping stones, themed per age, navigable across hub/daily/activities, with
clickable popup showing Aurin's tiny day-message + buttons to today's
check-in or activities. Stein-på-stein language to extend into Body Temple too.

**Shipped (verified end-to-end with real Playwright + testing_agent_v3_fork):**

1. **Backend `/api/kids-journey/*` endpoints + rate-limit bypass**
   - `GET /api/kids-journey/progress?child_slug=<slug>` — returns
     `today_index` (days since signup, clamped 1..28), `completed_days`
     (computed from distinct `kids_mood_checkins` days), `total_days=28`,
     `messages[]` (28 per age) and `anonymous` flag. Works for anonymous
     wanderers — public Kids Universe doorway always paints alive.
   - `GET /api/kids-journey/day/{N}` — returns one day's Aurin message,
     clamps 1..28.
   - `/api/kids-journey/` added to rate-limit bypass list.
   - Backend module: `/app/backend/kids_journey.py` — 28 hand-tuned
     messages per age band (little-dreamers / explorers / dreamweavers).

2. **Frontend `KidsJourneyPath.jsx` (rebuilt, 4 themes)**
   - Three age-themed visual languages per Anna's reference images:
     • little-dreamers → cream PEBBLES + soft clouds on sage-blue meadow
     • explorers       → purple CRYSTAL stones + leaves on violet path
     • dreamweavers    → teal HEXAGON stones + leaves on deep emerald
     • body-temple     → amber WOODEN stones (adult/warm — same visual
                         family, "Today's keystone is warm" title)
   - 28 stones laid out in serpentine 7-per-row, smooth dashed connector
     path under stones, today's stone pulses (animated SVG circle),
     completed stones show a star, locked show padlock.
   - Internal popup on stone click (kids hubs): Aurin's day message in
     Caveat handwriting + two buttons "Open today's check-in" /
     "See activities". For Body Temple the parent passes `onStoneClick`
     to route locked days → `/clarity-release` upsell.

3. **Wired into 4 surfaces** (data-testids preserved for regression):
   - `/kids-universe/:age/hub` — `[data-testid=kids-hub-journey-section]`
     right under the Today hero
   - `/kids-universe/:age/daily` — `[data-testid=kids-daily-journey-strip]`
     above the mood picker (compact variant)
   - `/kids-universe/:age/activities` — `[data-testid=kids-activities-journey-strip]`
     above the activity grid (compact variant)
   - `/body-temple` — `[data-testid=body-temple-journey]` unified 28-stone
     overview above the existing four-week cards (StonePath chip rows
     preserved inside each week card)

**Verified by testing_agent_v3_fork iter 82:**
- Backend: 4/4 pytest pass (anonymous default, legacy slug alias,
  day-clamping 1..28, distinct day-1 messages per age).
- Frontend: 10/10 UI assertions PASS (initially 9/10; the failing
  locked-stone navigation was diagnosed as screenshot-tool async
  console listener limitation, then verified directly with a fresh
  Playwright run — body-temple stone-5 → /clarity-release works,
  console logs `[body-temple] stone click day=5 is_premium=true
  unlocked=false → navigate /clarity-release`).
- Zero regressions: 5 KidsHub action cards still render, Daily mood
  picker still works, Body Temple per-week cards + day modal still open.

**Files added/touched:**
- `/app/backend/kids_journey.py` (NEW)
- `/app/backend/server.py` (+1 import, +2 endpoints, rate-limit bypass entry)
- `/app/backend/tests/test_kids_journey.py` (NEW — 4 passing tests)
- `/app/frontend/src/components/KidsJourneyPath.jsx` (full rebuild — 4
  themes, popup, scatter decorations, today-pulse animation)
- `/app/frontend/src/pages/KidsHub.jsx`, `KidsDaily.jsx`,
  `KidsActivities.jsx`, `BodyTemple.jsx` (component wiring only —
  zero existing behaviour removed)

**Future / Anna's open thread**: she floated a Parents Room twin —
"1 step closer to understanding yourself and your child" — deferred


### 2026-02-10 LATE-PM v2 — Kids Universe Path Refinement + Navigation Audit

**Anna's follow-up** (after seeing v1): keep stones for now, focus on the
navigation audit — *no dead pages*; make the path **winding**, not straight
serpentine; shrink Aurin character ~20%; defer per-room themed
backgrounds for later iteration.

**Shipped:**

1. **Aurin character resized** 78×78 → 62×62 (~20% smaller), positioned
   tighter above today's stone, halo + sparkle scale matches.
2. **Winding path** — replaced rigid grid with sine-wave Y-offset per
   stone (`amplitude * sin(phase) * waveDir`) plus longer bezier control
   points on connectors. The path now meanders instead of forming
   straight rows with sharp 90° corners.
3. **Themed glyphs on stones** — 7 SVG glyph motifs (leaf, heart, star,
   droplet, flower, moon, spark) cycled across the 28 days. Day numbers
   shifted to a small subscript below the glyph.
4. **Atmospheric particles** — 8 drifting white sparkles on the path
   surface plus a glittering trail from Aurin down to today's stone.
5. **Kids Universe navigation audit** (`/app/backend/tests/audit_kids_nav.py`,
   permanent regression artifact):
   - Harvested **52 unique kid-related routes** by visiting 8 entry
     points and crawling every `<a href>` link.
   - Visited each route, checked HTTP status, runtime overlay,
     page-error events, and body text length.
   - **Result: 52/52 routes clean.** Zero 404s, zero runtime errors,
     zero near-empty pages.
6. **Graceful 404 fallback for invalid activity slugs** — KidsActivities
   now catches the axios 404 and renders a soft "A quiet detour — that
   doorway hasn't been built yet" page in the age-band palette with
   Caveat handwriting and a "Back to activities" CTA. This replaces
   what used to be a raw Uncaught Runtime Errors overlay if a stale
   or mistyped slug was visited.

**Files touched:**
- `/app/frontend/src/components/KidsJourneyPath.jsx` (winding bezier
  layout, glyph row, Aurin sizing, particle drift)
- `/app/frontend/src/pages/KidsActivities.jsx` (notFound state +
  soft 404 page rendering)
- `/app/backend/tests/audit_kids_nav.py` (NEW — Kids navigation
  end-to-end audit script, run with `python audit_kids_nav.py`)

**Anna's deferred items (do later):**
- Per-room themed backgrounds: golden / mossy / mountain-silhouette /
  cloud-silhouette borders depending on which "room" (story / drawing /
  activity) the path leads into.
- Different stone shapes per activity-type (puzzle pieces in puzzle
  room, leaves in story room, etc.) — current uniform stones stay.
- "Sparkly path" upgrade in select rooms.

**Anna's NEW idea (still thinking)**:
- Parents Room twin 28-day path: "1 step closer to understanding
  yourself and your child" — uses existing reading material / practices
  per day. Component is ready (just add `THEMES["parents-room"]` and
  wire one extra Kids-Journey endpoint per parent slug).

until she decides the content shape. Code is now ready to host a
fourth `parents-room` theme (just add a new entry to `THEMES`).



### 2026-02-10 LATE-PM v3 — Parents Room 28-day path + LS deprioritised

**Anna's three decisions this evening:**
1. **LemonSqueezy abandoned** (no response since 21 Jan). Moving on
   without LS. Webhooks kept dormant; full removal queued for 5 June check-in.
2. **Resend confirmed verified** (`prulesoul.site`). Email code already
   prefers @prulesoul.site senders by default — no env change needed.
3. **Parents Room 28-day path approved** — her own idea. Built today.

**Shipped:**
- Backend `/api/kids-journey/progress?child_slug=parents-room` returns
  28 messages tuned for parents (e.g. *"Day 1 — start where you are."*,
  *"Day 28 — one step closer to understanding yourself and your child."*).
  Reads from a separate `parents_room_visits` collection for "walked
  days" so kids' and parents' progress never mix.
- Frontend `KidsJourneyPath` adds a `parents-room` theme: warm tan
  background, river-worn (oblong) pebbles, a new `shape="river"`
  variant, and the title *"One step closer to yourself and your child"*.
- `/parents-room` page now hosts the path between the Sara ConvAI tile
  and the Calm Parent's Code ritual. Stone click smooth-scrolls the
  wanderer down to the existing ritual section (no separate route,
  reuses today's content).
- `aurin-sovereign.png` is the floating companion above today's pebble
  (clipped to the character half).

**Verified:**
- Backend pytest: 4/4 (existing tests still pass; parents-room shows up
  via the existing `progress` endpoint with the new slug).
- Real-Playwright smoke: 28 stones render, "I enter consciously" gate
  passes, stone-5 click handler fires and smooth-scrolls correctly.
- Kids navigation audit re-run: 52/52 routes still clean.

**Files touched:**
- `/app/backend/kids_journey.py` (+ 28 parents-room messages prepended)
- `/app/backend/server.py` (parents-room slug bypass + parents_room_visits source)
- `/app/frontend/src/components/KidsJourneyPath.jsx` (theme + river shape + isAdultPath flag)
- `/app/frontend/src/pages/ParentsRoom.jsx` (new `parents-room-path` section)
- `/app/memory/REMINDERS.md` (5 June reminder block appended)

**5 June 2026 reminder set** in `/app/memory/REMINDERS.md` covering:
LS removal decision, per-room themed backgrounds, activity-type stone
shapes, Resend fallback cleanup, Kids→Parents cross-sell CTA,
FastSpring migration trigger, GPT marketing-copy per-line approval.



### 2026-02-11 — FastSpring bulk import prep + Parents Room launched

**Decisions of the day:**

1. **LemonSqueezy formally abandoned** (no response since 21 Jan, dormant code kept).
2. **Paddle declined us** (AUP — "not B2B SaaS"). Confirmed dead-end.
3. **FastSpring is the chosen merchant of record.** Contract signed today by Anna.
4. **API credentials provided** by Anna: `4TF-HEYFTC2AGHTQOOONXG` / `JXmSTAjORaSJPVffXHgNmg`. Storefront: `prulesoul.test.onfastspring.com`.
5. **API returns 401 across all endpoints** — diagnosed as merchant agreement
   pending FastSpring-side activation. Anna sent email to support, will
   continue tomorrow.

**Shipped today:**
- `/app/backend/tools/fastspring_bulk_import.py` — production-ready bulk
  import script for 29 single products (books, courses, voice top-ups,
  subscriptions, memberships). Uses Basic Auth, DRY_RUN=true by default,
  audit logs to JSON. Bundle products excluded — must be created in
  FastSpring dashboard with the copy-paste forms in
  `FASTSPRING_FINAL_2026-02-11.md`.
- `/app/memory/FASTSPRING_FINAL_2026-02-11.md` — locked 49-SKU catalogue
  with margins verified against FastSpring 5.9% + €0.85 transaction fee.
- `/app/memory/FASTSPRING_COMPLETE_2026-02-11.md` and
  `/app/memory/FASTSPRING_QUICK_ENTRY_2026-02-11.md` — earlier draft files,
  superseded by the FINAL file above.
- Margin audit complete: corrected 2 underpriced premium tiers
  (Premium 60min €39→€59, Premium 180min €99→€179). Added fair-use
  clauses to all unlimited-text products to protect against heavy-user
  drift.
- Added 2 new mid-tier bundles per Anna's request: Sanctuary Season
  €890 (3mo) and Couples Sanctuary €1,190 (6mo, 2 accounts).
- Raised VIP Unlimited €490 → €590 (Anna chose premium positioning).
- LUX Lifetime priced at €2,990 (Anna chose this over €4,990).

**Backend env:**
- `/app/backend/.env` now contains FastSpring credentials and storefront.
  DRY_RUN=true until API activation.
- ⚠️ Credentials shared in chat — Anna planned to rotate after first
  successful import. Tracked.

**Tomorrow's plan:**
1. Wait for FastSpring activation confirmation.
2. As soon as API returns 200 on any endpoint → run bulk import.
3. Anna creates the 13 bundles manually in dashboard with provided forms.
4. Resend webhooks (engagement tracker) — Anna is curious, defer to
   after FastSpring goes live.



### 2026-02-11 — §GOVERNANCE Faas 1A — Runtime Governance Layer (LIVE)

**Anna's "$0 cash risk" directive — pre-Polar payment work.**
Three independent vendor-cost guards live in production:

1. **Vendor Balance Guard** — polls ElevenLabs `/v1/user/subscription`
   every 60s, blocks new sessions at ≥95% character usage.
2. **Concurrency Guard** — caps open voice_sessions at 50 (env).
3. **Spend Velocity Breaker** — caps 200 sessions / 15 min, trips
   5-min cooldown.

All guards bypass `unlimited_voice=true` accounts. Master switch
`GOVERNANCE_ENABLED`. Failures soft-warn — realtime core never crashes.

**Files added:**
- `backend/runtime_governance.py` (250 lines, 0 deps beyond httpx)
- `backend/tests/test_runtime_governance.py` (9 tests, all pass)
- `frontend/src/pages/AdminFinance.jsx` (real-time dashboard)
- `/api/admin/governance/status` endpoint (ADMIN_TOKEN required)

**Mount point:** `/api/clarity/convai/signed-url` (server.py ~8253).
Single try/except after existing session_cap. Returns HTTP 503
+ retry_after=60s on trip.

**Live snapshot (2026-05-27):**
- ElevenLabs 21.3% used / 124,678 chars left / ~125 voice min
- 2 users / 76.7 min owed / $10.73 projected
- Ratio 1.63x → 🟡 YELLOW (watch zone — Anna should monitor)

**Dashboard:** `/admin/finance?token=<ADMIN_TOKEN>`.
Auto-refresh 60s. Traffic light ≥3x green, 1.5-3.0x yellow, <1.5x red.

**Next (queued, awaiting Anna's GO):**
- Faas 1B: Payment Abstraction Layer + Polar.sh sandbox integration
  (LemonSqueezy stays parallel 30d)
- Polar account creation (Anna: 15-min task, full instructions in
  `/app/memory/GOVERNANCE_FAAS1A_2026-02-11.md`)


### 2026-02-11 — §FAAS 1B — Payment Abstraction + Polar Sandbox (DORMANT)

**Quality-lock approach.** All 9 Anna conditions verified with live curl proof.

**Built:**
- Payment Abstraction Layer (`payment_providers/` — base.py + polar.py + sku_mapping.py + __init__.py)
- Polar.sh webhook handler `/api/webhooks/polar` (Standard Webhooks HMAC-SHA256 + timestamp tolerance + idempotency)
- Admin endpoints `/api/admin/payment/sku-map` and `/api/admin/payment/polar-events`
- 3 SKU registry: body_temple ($39 one_time), topup_60min ($39 one_time), eternal_monthly ($89 recurring)
- 8 unit tests + 5 live e2e webhook tests — ALL PASS

**Email alert chain verified end-to-end:**
- Temporary 1.7x threshold triggered → real email sent to info@prulesoul.site
- Resend ID `88712441-b28d-4129-9e92-f37924bbd193` delivered
- Idempotency: 2nd call → `within_4h_window_skip`
- Threshold restored to 1.5x

**Dormant by design:**
- POLAR_* env not set → all Polar endpoints return 503
- LemonSqueezy 100% untouched (legacy direct path)
- No production switchover, no checkout replacement, no 49-SKU import
- Faas 1B = log-only; presence grants in Faas 1C after Anna verifies sandbox

**Next (PAUSED — Anna's 15-min task):**
- Anna creates Polar account → 3 sandbox products → 2 OATs → 2 webhook secrets
- Enter env vars in Emergent Deploy panel (never paste in chat)
- Reply "Polar configured, run sandbox tests"
- I then run live sandbox purchase + refund + duplicate-webhook tests = Faas 1C


---

## 2026-02-27 — Luxury copy pass (Variant A — value-driven, no price emphasis)

**Done in this iteration:**
- Full P&L breakdown of current €0.60/min vs €1.50/min vs €2.00/min — shared with Anna
- Decision: keep backend price at €0.60/min for now (Polar approval still pending). Move to €1.50/min ONLY when LemonSqueezy variants can be co-updated, ideally after Polar onboarding.
- Applied 4 copy changes across frontend — no backend, no price math touched:
  1. `VoiceTopupSlider.jsx` — eyebrow "Voice top-up" → "Minutes of presence"; removed €/min phrase from narrative ("Invite as much time as you need to return…"). Price preview block + CTA button still show €X (legal minimum).
  2. `ClarityRelease.jsx` — "Or choose your own minutes" → "Or choose your own volume of presence"
  3. `SanctuaryPreview.jsx` — Voice Meter cards: `30/60/180 minutes` → `30/60/180 minutes of presence`; subtext rewritten to remove "measured by the minute" language; TwoPaths "flexible top-ups" → "flexible additions of presence"
  4. `WhatThisIs.jsx` — added new "✦ Voice-first by design" section ("Made to be heard, not watched.") between "Why this exists" and "Who it's for", with two sub-callouts:
     - ✦ For Individuals — confidential sanctuary, never used to train public models
     - ✦ For Families & Children — screen-down technology, device upside down
- Lint passed on all modified files. Smoke screenshots of `/what-this-is` and `/` Voice Meter confirm correct rendering.

**Pending P0/P1 (carry forward):**
- Anna confirms Polar.sh sandbox is ready → run Faas 1C/1D sandbox + refund + duplicate-webhook tests
- After Polar approved + Anna updates LS variants in dashboard: lift `TOPUP_PRICE_PER_MIN_EUR` from 0.60 → 1.50 in backend `.env` (one-line change). 65% margin target.
- P1: Letter of Admission email via Resend for Body Temple purchasers (luxury onboarding instead of plain receipt)

**Deferred:**
- "High Luxury / Sanctuary v3.0" full visual overhaul — Anna confirmed to wait until Polar onboarding is fully cleared.
- 49 SKU bulk import to Polar after core 3 products are stable.


---

## 2026-02-27 (PM) — Letter of Admission + Kids Universe Phase 1 SHIPPED

**Done in this session:**

### 1. Letter of Admission email (P1 — DONE) ✅
- New module `/app/backend/letter_of_admission.py` with luxury HTML+text Resend email
- Hooked into guest-key redemption flow (server.py): fires once per user when `body_temple_unlock` perk granted
- Idempotent via `letters_of_admission` collection — never sends twice for same user
- Admin endpoint `POST /api/admin/letter-of-admission/send` for manual resend (ADMIN_TOKEN-gated)
- Tone: "A quiet letter of admission · Body Temple 28" — threshold, not receipt. Sanctuary palette, Cormorant Garamond, Honey-Gold CTA "Enter the Temple →"
- Uses `agent@prulesoul.site` sender (RESEND_FROM_AGENT) with sandbox fallback
- Backend started clean (verified via `/api/health`)

### 2. Kids Universe Journey — Phase 1 Static Skeleton (DONE) ✅
- New page `/app/frontend/src/pages/KidsUniverseJourney.jsx`
- Routes registered: `/kids-universe/journey` (default discovery) and `/kids-universe/journey/:zone`
- **Existing `/kids-universe` treats page UNTOUCHED** — safe coexistence
- Aurin Inner Guide portrait saved to `/app/frontend/public/avatars/aurin-inner-guide.png`
- Three age zones with full color theming:
  - Discovery (4-6, emerald green) → "The forest of wonder."
  - Exploration (7-10, crystal blue) → "The crystal cave of mystery."
  - Creation (11-13, cosmic purple) → "The cosmic studio of becoming."
- Curved SVG path (gradient + dashed overlay) with 4 stones alternating left/right
- Day 1 stone = OPEN demo (routes to Storytelling Sanctum demo state-swap)
- Days 2-4 = LOCKED with soft frosted blur + Lock icon
- Click locked stone → Unlock Modal: "This stone is held in quiet until the Sanctuary opens." with Honey-Gold "Discover the Parent Sanctuary →" CTA
- Topbar: "← Back to Matrix Aurin" + "Parent Sign In →"
- Footer CTA: "Open the Full Journey ✦"
- **100% English UI** per Anna's directive
- Lint clean. Smoke test verified all 3 zones + unlock modal flow.

**Carry forward (next session):**

P0/P1:
- Anna's Polar.sh approval signal (PAUSED — Anna's action)
- Phase 2 Kids Universe: build Storytelling Sanctum demo state-swap fully (currently routes to demo page; need polished Mode B Room view with text-only Aurin greeting + "Open Aurin's Voice" CTA to /pricing)
- Phase 3 Kids Universe: Premium gating + Star Chamber with 6 reward cards + Resend reminder (48h)
- Phase 4 Kids Universe: Album upload with password reconfirm + Reflection voice + Storytelling voice (governance-protected)
- Phase 5 Kids Universe: per-age content tuning + Anna review

P2 (Deferred):
- High Luxury v3.0 visual overhaul — wait until Polar approved
- 49 SKU bulk import to Polar
- Adult v3.0 vision doc (`/app/memory/ADULT_V3_VISION.md`) — Grace/Kaelan/Sara/Alistair room shells using `SanctuaryChatRoom` model

**Key decisions locked:**
- LemonSqueezy variants NEVER edited manually. Clean cutover day = LS disable + Polar enable + `TOPUP_PRICE_PER_MIN_EUR=1.50` simultaneously.
- Aurin avatar strategy v1.0: single Inner Guide portrait for all kids zones. v1.1 will add outfit variants.
- 1 child / parent account in V1.
- 1 stone / 24h cap.
- Album photos: forever retention, parent delete only.
- Star fulfilled: marks complete + auto-unlocks next star.



---

## 2026-02-27 (PM Late) — Kids Universe Phase 2 + 3 + 4 SHIPPED + TESTED ✅

**Done in this iteration (testing_agent_v3_fork: 100% pass, 18/18 backend + 6/6 frontend):**

### Backend
- New module `/app/backend/kids_universe_endpoints.py` (~489 LOC) with all kids-journey endpoints, mounted at `/api/kids-journey/*`.
- Collections: `kids_progress`, `star_commitments`, `kids_album_photos`, `emotion_checkins`, `letters_of_admission`.
- Endpoints:
  - GET `/progress/{zone}` — anonymous returns demo state; premium returns unlocked_nodes + next_unlock_at
  - POST `/unlock-stone` — auth + premium, idempotent, 24h cap with HTTP 429
  - POST `/star/commit` — saves promise + auto-schedules 48h reminder_at
  - GET `/star/commitments` — list, optionally only_active=true
  - POST `/star/fulfill` — marks fulfilled, returns next_star_unlocked
  - POST `/album/upload` — parental_affirmation required, 6 MB max, base64 in Mongo (V1; KMS later)
  - GET `/album/list` — returns photos with payload (for FAB drawer)
  - POST `/album/delete` — soft delete owned-only
  - POST `/emotion-checkin` — anonymous-emotion log (V1 text input)
  - POST `/cron/star-reminders` — admin-token-gated; processes due 48h Resend emails idempotently
- Fix applied by testing agent: ObjectId `_id` removed from `/star/commit` response (Mongo insert mutation).

### Frontend
- New `/app/frontend/src/pages/kids/KidsRooms.jsx` (~600 LOC) — 4 Mode B room components + Family Album FAB
- `KidsUniverseJourney.jsx` extended with auth-aware progress fetching + Mode B state-swap routing
- 100% English UI, lint clean.

**Pending P0/P1 (carry forward):**
- Anna's Polar.sh approval signal (PAUSED — Anna's action)
- External cron hook for `/api/kids-journey/cron/star-reminders` (UptimeRobot or similar; Anna chooses)
- Adult v3.0 vision doc — Grace/Kaelan/Sara/Alistair room shells

**P2 (Deferred):**
- High Luxury v3.0 visual overhaul — wait until Polar approved
- 49 SKU bulk import to Polar
- Phase 5 Kids Universe: per-age content tuning + Aurin outfit variants v1.1
- KMS migration for album photos (currently base64 in Mongo, fine for V1)
- Multiple children per account (V1 = 1 child only)



---

## 2026-02-27 (Late Night) — Phase 5 SHIPPED + Pre-deploy AUDIT PASSED ✅

**Phase 5 content tuning (per-age tonal voice):**
- `ZONE_COPY` matrix added to KidsRooms.jsx — every room (Storytelling, Reflection, Star, Album) speaks in a distinctly tuned voice per age group.
- **3-6 Jungle Wonder** (sensory wonder): "Welcome, little star…", "small wonders", "little promise", "one special picture"
- **7-10 Crystal Exploration** (strategic intuition): "Hello, explorer", "riddles hidden in plain sound", "outdoor quest", "field-note memory"
- **11-13 Canopy Creation** (peak agency): "Welcome. I am Aurin.", "built with you", "real-world build", "single, undeniable proof"
- Tab labels corrected: Discovery is **3-6 Years** (not 4-6) per Anna's clarification.

**Pre-deploy audit results:**
- Lint clean: backend (kids_universe_endpoints.py, letter_of_admission.py) + frontend (KidsUniverseJourney.jsx, KidsRooms.jsx)
- Backend healthy: `/api/health` OK; all 3 zone progress endpoints respond correctly; auth gating works; admin token gating works
- Frontend 11-step navigation E2E: 11/11 PASS (zone tabs, stone clicks, back button, unlock modal open/close, footer CTA, topbar links)
- Phase 5 verification: 3 zones × age-tuned content confirmed via screenshot diff
- Letter of Admission send confirmed (resend_id logged in backend logs)
- Testing-agent iteration_83: 18/18 backend + 6/6 frontend — no regressions

**Known cosmetic notes (NOT blockers):**
- The static Aurin portrait PNG (`/avatars/aurin-inner-guide.png`) shows "4-6 YEARS" inside the artwork. Tab/copy correctly say 3-6. Can be swapped for v1.1 reshoot.
- Tailwind warning for `duration-[2400ms]` exists elsewhere in codebase (not in any Kids Universe file).

**Anna is GO for deploy.**


---

## 2026-02-27 (Final) — Adventure Sparks ADDED ✅

**The closing loop is in.** After Anna spotted the missing "Adventure & DIY Ideas" — real-world creative play that the Star Chamber alone did not cover — we added a luxury **Adventure Sparks** panel inside the Storytelling Sanctum room. NOT a new screen-game; an inspirational panel that pushes the child OFFLINE and back into the Secret Album loop.

- Section appears beneath the "Begin Today's Tale" CTA, framed by a thin gold border, with an "✦ Adventure Sparks" eyebrow and the master headline **"When the tale ends, the world begins."**
- Per-age DIY pools (4 cards each):
  - **3-6 Discovery (Jungle Wonder):** Leaf Collage · Stone Friends · Finger Painting Sky · Pinecone Family
  - **7-10 Exploration (Crystal Exploration):** Secret Forest Map · Crystal Hideout · Nature's Five Riddle · Field Notebook
  - **11-13 Creation (Canopy Creation):** Dream Room Blueprint · Hand-bound Journal · Build Something Real · Photo Essay: One Hour
- Each card: icon · serif title · italic 1-2 line description
- For premium parents: "Save your creation to the Secret Album →" button state-swaps directly to Album room
- Smoke test: all 3 zones × 4 DIY cards × headline confirmed via Playwright assertions

**Final architecture loop (closed):**
1. Aurin speaks the tale →
2. Adventure Sparks suggest offline DIY →
3. Child does it in the real world →
4. Photo of creation → Secret Album → glows on the Path forever

**Anna is GO for deploy — full Kids Universe Journey is shipped.**


---

## 2026-02-27 (Final Final) — Adult v3.0 Vision LOCKED in document

Created `/app/memory/ADULT_V3_VISION.md` — the full architectural contract for the future adult mentor sanctuary. NO code written. Build status: 🟡 BLOCKED on Polar.sh approval + Anna's explicit "alustame Adult v3.0" greenlight.

**Four rooms locked in vision:**
- 🌟 **Grace** — *The Art of Self-Belonging* (warm amber) — breaks productivity-as-worth programming
- 🪨 **Kaelan** — *The Unshakable Center* (granite gray) — breaks reactivity to disruption
- 🌹 **Sara** — *The Freedom of Boundaries* (soft rose) — breaks relational drama / social-media manipulation
- 💙 **Alistair** — *The Grand Architecture* (deep navy) — breaks political theater / news anxiety

**Closing loop mirrors Kids Universe:**
Voice session → Sovereignty Sparks (real-world screen-down practices) → Sovereignty Vault (private text + photo proof) → archive

**Reuse plan:** Same RoomShell, same Mode B state-swap, same governance layer for voice, same 1-stone-per-24h, same 48h Resend reminder cron pattern.

**Marketing line locked:**
> "Most adult wellness apps want to fix you. Matrix Aurin's Adult Rooms refuse to."

Build estimate when greenlit: ~12-13h across 5 phases. Until then, this is the contract — no drift, no improvisation.


---

## 2026-02-27 (Night) — Adult v3.0 Phase 1 + Phase 2 SHIPPED (Kaelan first) ✅

**Backend** (`/app/backend/adult_universe_endpoints.py`):
- `/api/adult-rooms/progress/{room}` — anonymous OR premium-aware
- `/api/adult-rooms/unlock-stone` — 24h-gated stone unlock (HTTP 429)
- `/api/adult-rooms/vault/save-note` — Sovereignty Vault private text
- `/api/adult-rooms/vault/list` + `/api/adult-rooms/vault/delete`
- `/api/adult-rooms/sparks/commit` — schedule 48h reminder
- `/api/adult-rooms/cron/spark-reminders` — dual-auth (X-Admin-Token OR ?secret=)
- New collections: `adult_room_progress`, `adult_sovereignty_vault`, `adult_sovereignty_sparks`

**Frontend:**
- `/app/frontend/src/pages/AdultRooms.jsx` — luxury map page with 4 character cards:
  - 🌟 **Grace** (Warm Amber) — "Opening soon"
  - 🪨 **Kaelan** (Granite Gray) — ACTIVE
  - 🌹 **Sara** (Soft Rose) — "Opening soon"
  - 💙 **Alistair** (Deep Navy) — "Opening soon"
  - Hero: *"Four quiet rooms. One unshakable center."*
- `/app/frontend/src/pages/adult/KaelanRoom.jsx` — full Mode B state-swap with:
  - **Cycle view**: "When the storm rises, you govern the ship." + 4-stone grid
  - **Stone Detail view**: per-day body + Reflection (Vault) input + Sovereignty Sparks
  - Granite-themed portrait placeholder (graceful fallback if PNG missing at `/avatars/kaelan.png`)
  - Free users: see Day 1 body + "Open the Sanctuary" CTA → /pricing
  - Premium users: write to Vault + commit a Sparks practice → 48h Resend reminder

**Stone cycle copy locked (per ADULT_V3_VISION.md):**
1. **Clear Seeing** — Strip the label. See the structure.
2. **The Filter** — Noise passes through. It does not enter.
3. **Actionable Stillness** — What you govern, and what you do not.
4. **Sovereignty Vault** — The room remembers, so you do not have to.

**Sparks (real-world screen-down practices) per stone:** walk without phone · write the event twice · mute one source for 7 days · no-news morning · one solid step · handwritten 90-day strategy · one hour alone · one in-person conversation.

**Smoke test: 8/8 PASS** (map loads, all 4 cards render, Kaelan enabled, cycle view opens, all 4 stones, Day 1 detail shows "Strip the label. See the structure.", free user sees pricing CTA, locked Day 3 opens unlock modal).

**Minor bugfix**: duplicate header in cycle view (nested `Shell`) → fixed.

**Build status:**
- ✅ Phase 1 (Map + zone tabs) — DONE
- ✅ Phase 2 (Kaelan full room) — DONE
- 🟡 Phase 3 (Voice integration via new ConvAI agent `ELEVENLABS_CONVAI_AGENT_KAELAN`) — Anna provisions agent
- 🟡 Phase 4 (Grace, Sara, Alistair rooms with own tonal ZONE_COPY) — when ready
- 🟡 Phase 5 (Polish, full e2e testing) — final pass

**Carry forward:**
- Anna to provide curated Kaelan portrait PNG → save to `/app/frontend/public/avatars/kaelan.png`
- ElevenLabs ConvAI agent for Kaelan (low, measured male voice) — env var `ELEVENLABS_CONVAI_AGENT_KAELAN`
- UptimeRobot URL for adult reminders: `https://prulesoul.site/api/adult-rooms/cron/spark-reminders?secret=...`
