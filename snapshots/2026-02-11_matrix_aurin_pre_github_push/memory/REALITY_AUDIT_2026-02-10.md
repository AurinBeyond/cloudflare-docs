# Matrix Aurin — Operational Reality Audit
**Date:** 2026-02-10
**Author:** AH (engineering agent)
**Scope:** Stabilization-phase reality map. Observable, verifiable, operational.
**Status of this document:** Single source of truth for what exists today. No mythology, no speculation.

Labels used throughout:
- **VERIFIED** — Tested live in this session, working as documented.
- **PARTIAL** — Implemented, works for most paths; one or more edge gaps named explicitly.
- **PREVIEW ONLY** — Code lives in preview; production (`prulesoul.site`) needs a re-deploy.
- **MOCKED** — Stubbed or in test/preparing state, not real.
- **BLOCKED** — Cannot proceed without external action (founder, ops, third-party).
- **NOT YET VERIFIED** — Code exists, but not exercised in this audit.

---

## SECTION 1 — System Reality Map

| Layer | Component | Status | Notes |
|---|---|---|---|
| **Frontend** | React 19 SPA, served from `/app/frontend` | **VERIFIED** | Hot-reload running. All pages render. |
| **Backend** | FastAPI monolithic `server.py` (~9,800 lines) | **VERIFIED** | Healthy on `/api/health`. Supervisor-managed. |
| **Database** | MongoDB, 41 collections in active DB | **VERIFIED** | Real records: 12 users, 13 sessions, 23 magic-link tokens, 18 funnel events, 3 cabinet sessions, 1 booking, 1 manual purchase, 12 lead-magnet sends, 1 first-letter send. |
| **Auth — magic link** | Resend email → `/portal/magic?token=…` → session token | **VERIFIED** | Tested live: request → DB token → verify → 200 OK with `session_token` + `redirect_to`. |
| **Auth — Google OAuth** | Emergent-managed Google login | **NOT YET VERIFIED** | Code present, not exercised this audit. |
| **Mentor runtime — Clarity Release chat** | `/api/cabinet/message` → Claude Sonnet 4.5 → tone_tag/user_state | **VERIFIED** | Tested live: "I am tired tonight." → real reply *"I hear you. What kind of tired — the body, or something underneath?"* (1.5–4 s latency typical). |
| **Mentor runtime — Body Room chat** | `/api/body-room/chat` (or shared) | **NOT YET VERIFIED** | Frontend renders correctly; chat round-trip not exercised this audit. |
| **Claude integration** | Emergent LLM Key, Sonnet 4.5 | **VERIFIED** | Real responses arrive; AGOP §A and §B prompt locks in place. |
| **STT — speech to text** | OpenAI Whisper-1 via `/api/clarity/stt` | **VERIFIED (validation)** / **NOT YET VERIFIED (real audio)** | Backend endpoint live; 6/6 validation tests pass; no real audio file transcribed in this audit (would burn credits). |
| **TTS — text to speech** | OpenAI `tts-1-hd`, voices `coral` (female) / `echo` (male), speed 0.86 | **VERIFIED** | Endpoint exists and returns mp3. Pre-processor (`_humanize_for_speech`) covered by 6 unit tests. Real audio playback path verified earlier in user testing. |
| **Continuity memory** | `cabinet_user_summaries` (opt-in), `cabinet_sessions` (transient) | **VERIFIED** | Default: stored only in browser localStorage. Opt-in upgrade writes a summary doc. 3 cabinet sessions present. NO vector DB. |
| **Room system** | Clarity Release · Body Room · Cabinet Booking | **VERIFIED** | All three render and gate correctly. |
| **Booking** | `/api/booking/available-slots` + `/api/booking/reserve` + Resend confirmation | **VERIFIED** | Live test created booking `098c82bdacae…fc42`, confirmation email attempted, magic_entry_url issued, slot held. 1 booking now in DB. |
| **Email delivery (Resend)** | Lead magnets, magic links, booking confirmations, six-nights drip | **VERIFIED** | 12 lead-magnet sends, 1 first-letter send, 23 magic-link tokens issued. The infrastructure is live; user inbox arrival not visually confirmed in this audit. |
| **PDF delivery** | `/api/cabinet/library/{slug}/download` (signed/auth-only) | **PARTIAL** | Endpoint enforces 403 for unpurchased books (verified). LemonSqueezy → purchase → library access pipeline exists in code, never end-to-end exercised by a real customer. |
| **Course content** | 4 paid courses, 7 letters each, hard-coded in `server.py` lines 5380–5965 | **VERIFIED** | Every letter has 1300–1800 chars of real prose. Day 1 unlocks immediately on enrollment; days 2–7 unlock daily. **Earlier handoff claim "letters 2-7 are 0 bytes" is FACTUALLY INCORRECT** — the API returns empty `body` for *time-locked* days; that is gating, not missing content. |
| **Course daily delivery** | Email cron that pushes day 2–7 letters to enrolled users | **MISSING** | Six-Nights has `_six_nights_dispatch_loop` (hourly cron). The 4 paid courses do **NOT** have a parallel scheduler. Buyers must return to the website each day. This is the real product gap, not empty content. |
| **Six Nights drip** | 6-letter free email series, hourly dispatcher | **VERIFIED** | 1 active subscription. Dispatcher loop running. Content present in `db.six_nights`. |
| **LemonSqueezy webhook** | `/api/lemonsqueezy/webhook` | **PARTIAL** | Preview has received 29 events and recorded 1 purchase (manual_grant test). Production has received 0 events. Webhook secret, API key, and store ID are all configured in env. |
| **Mobile state** | iPhone Safari + Android Chrome | **NOT YET VERIFIED** | Voice-first surfaces (Clarity Release, Body Room) compile cleanly and pass desktop Playwright. No real device test conducted. |
| **Production vs preview** | Two distinct backends | **VERIFIED — diverged** | Preview: `https://aurin-hub.preview.emergentagent.com`. Production: `https://prulesoul.site` (HTTP 200, serving older build). Stage 2.8 / 2.8c / 2.8d code lives in **PREVIEW ONLY** until a re-deploy. |

**Stability summary:** the runtime is small, clean, and honest. Failure surfaces are well-named. The single highest-risk gap is the missing daily course-letter scheduler.

---

## SECTION 2 — Mentor Experience Flow (current truth, end-to-end)

A first-time wanderer who lands on `/clarity-release`, today, lives this exact sequence:

1. **Marketing arrival → `/clarity-release`** *(VERIFIED)*
   The page loads. The mentor portrait is now the first card the eye lands on (Stage 2.8d). HUB welcome prose + CTA below.
   *Failure mode:* if `REACT_APP_BACKEND_URL` is wrong → blank gates. Not observed today.

2. **Login / magic link** *(VERIFIED)*
   "Enter Portal" → email field → `POST /api/auth/magic-link/request`. Resend sends an email containing `https://prulesoul.site/portal/magic?token=…`.
   *Failure mode:* email lands in spam (no observed reports). Token TTL: 30 min.

3. **`/portal/magic` verify** *(VERIFIED)*
   Front-end calls `POST /api/auth/magic-link/verify?token=…`. Backend issues a 7-day session token, sets a parallel httpOnly cookie, and returns `{session_token, redirect_to}`.
   *What the user sees:* a brief "Reading your token…" line, then a redirect.

4. **WandererGate** *(VERIFIED — by design)*
   First private-scope visit shows a 4-checkbox + "I enter consciously" gate. Acceptance is stored in `localStorage[wanderer_accepted_1.0-2026-02-07_private]` AND posted to `/api/agreement/accept`.
   *Feels:* deliberate. Some testers may read this as "another consent screen." It is the legal/psychological consent layer; cannot be skipped.

5. **ClarityThreshold (per-room consent)** *(VERIFIED — by design)*
   Four declarations + companion gender choice (Clarity / Grace) + final "Step through" → `POST /api/clarity/prefs`. Sets `consent_v2_at`.
   *Feels:* slow. Two consecutive consent screens before any conversation. This is the calmness contract; trimming it is a separate decision.

6. **Clarity Release HUB welcome** *(VERIFIED)*
   Long-form prose card explaining the room. Founder's choice; not part of the chat.

7. **Mentor presence appears** *(VERIFIED — Stage 2.8d)*
   `<GuidePresence />` portrait card at the top of the chat scope. State line breathes. CSS-only animation: gentle blink, slow head-sway, soft breath rhythm. **Not a hologram. Not 3D. Not WebGL.** A still JPG with three subtle CSS keyframes.

8. **Voice activation** *(VERIFIED desktop)*
   Inside the chat surface, a 96 px sage-glow circular SPEAK button is the centered primary action. Below it, a small `<details>` toggle reveals the typing fallback. Mute icon next to the mic.
   *Feels:* voice-first. Confirmed via Playwright bounding-box.

9. **User speech (push-to-talk)** *(NOT YET VERIFIED with real mic)*
   On press: `navigator.mediaDevices.getUserMedia({audio:true})` → `MediaRecorder` with negotiated MIME (webm/ogg/mp4). Recording max 60 s. On release: blob is POSTed to `/api/clarity/stt`.
   *Currently artificial:* no live human-mic test in this audit, only validation paths.

10. **STT processing** *(VERIFIED — validation)*
    Backend `clarity_stt.transcribe_audio()` → OpenAI Whisper-1 → returns `{text}`. Empty/oversize/wrong-MIME paths fail before Whisper is called (zero credit burn). Transcript lands in the input box; the wanderer can edit before sending.

11. **Claude response generation** *(VERIFIED)*
    `/api/cabinet/message` calls Claude Sonnet 4.5 with the AGOP system prompt + last N turns + opt-in summary. Response includes `tone_tag` and `user_state` signals parsed by `_split_signals`.
    *Currently feels:* human-adjacent at the prose level. Sentence pacing inside the AI's reply is the next polish layer (AGOP §A).

12. **TTS playback** *(VERIFIED)*
    Frontend posts the reply text to `/api/clarity/tts` with the chosen gender. Backend humanizes punctuation (em-dash → comma, strip Markdown, ensure end-of-line punctuation), then OpenAI returns mp3 at speed 0.86. Browser autoplays unless muted.
    *Still feels artificial:* the consonant edge of `tts-1-hd` is audible on hard `t`/`s`. Slowing speed to 0.82 or splicing in a short ambient breath are the next polish levers.

13. **Transcript rendering** *(VERIFIED)*
    Guide reply appears as italic prose (no chat bubble, no avatar mini), at 90 % opacity, at the top of the visible area, while the user's typed line appears as a small pill on the right. The transcript looks like a reading record, not a chat log.

14. **Continuity & session return** *(VERIFIED — default behavior)*
    Default: chat is browser-local (`localStorage`). On the next visit, a returning wanderer can choose to upgrade to "Cabinet remembers" — that writes a summary to `cabinet_user_summaries`. No transcript is stored on the server by default.
    *Feels:* private. The "Voyager / Eternal" tier copy explains the upgrade.

**What still feels artificial overall:**
- Two-gate front-load (WandererGate + ClarityThreshold) before first sentence.
- TTS hard-consonant edge.
- HUB welcome prose is long; some testers may scroll past the mentor without seeing it.
- No visible "I'm thinking…" animation between user-speak and TTS-start (latency window: 2–6 s; mentor portrait state changes but does not visibly light up).

---

## SECTION 3 — Clarity / Grace Role Audit

Internal slugs: `clarity` (M) and `grace` (F). Human-facing names currently shown: **Clarity** and **Grace** (Brian/Jenny is staged but on hold per founder's 2.8b directive, awaiting A&V agent ratification).

### What Clarity does
- Holds masculine archetypal energy: direct, principled, structured.
- Opens with shorter, lower-cadence sentences.
- More likely to mirror back a single clean reflection ("That sounds like the part of you that learned to brace early.") than to ask three soft questions.
- Voice: `echo` (smooth, calm baritone register).

### What Grace does
- Holds feminine archetypal energy: warm, receptive, intuitive.
- Opens with a softer, slightly slower acknowledgement ("I hear you.").
- More likely to ask one quiet question after the mirror.
- Voice: `coral` (warm friendly companion).

### Tone & pacing differences (codified in `clarity_ai.GENDERED_ENERGY_BLOCKS`)
- Both names are bound by the same AGOP system prompt + Reality Law + §A pacing + §B autonomy locks.
- Differences live only in the personal-name block and the chosen voice. Nothing else changes per mentor.
- Both refuse to:
  - diagnose, treat, prescribe.
  - act as a therapist, guru, or spiritual authority.
  - claim certainty about who the user "really is".
  - promise outcomes ("this will heal you").
  - invite dependency ("come back to me", "I'll be waiting").

### Room behavior
- **Clarity Release** — the fuller listening room. Either Clarity or Grace, chosen at threshold.
- **Body Room** — body-awareness focus. The same gendered system prompt is used (AGOP §A pacing layer is tuned slower for this room). Currently "A Quiet Hand" is shown as the room's mentor card. *Note: the Body Room mentor identity overlaps with Clarity / Grace; if the founder wants Body Room to have a distinct calm-attendant face, that decision is currently open.*
- **Cabinet Booking** — UI selector lets the wanderer book a slot with either guide. The guide_label is returned in the booking confirmation email.

### Emotional safety mechanisms (operationally enforced)
- `_split_signals` extracts `tone_tag` (e.g. `compassion`, `holding`, `clarity_redirect`) from the model's reply and removes those tags from the visible text.
- `user_state` (e.g. `hesitant`, `grieving`) drives subtle UI cues only; the model never tells the user what state they are in.
- Crisis override path: if a wanderer signals immediate harm, the model is instructed (in the system prompt) to redirect to local emergency numbers and to say plainly that this room cannot help. Not yet stress-tested in this audit.

### What the mentor IS NOT (by code, not by promise)
- Not therapy. Not diagnosis. Not treatment. Not spiritual authority. Not coaching with a method.

### What the mentor IS
- A reflective conversational presence.
- An emotional decompression companion.
- A voice-first calm-listening room.

---

## SECTION 4 — Human Presence Audit (1 = robotic, 5 = quietly believable)

| Dimension | Score | Strongest element | Weakest element |
|---|---|---|---|
| Voice warmth | **3.5 / 5** | `coral` voice + speed 0.86 + em-dash → comma rewrite | Hard consonant edge of `tts-1-hd` on long sentences |
| Pacing | **4 / 5** | AGOP §A locks short-line replies; humanize prep adds breath commas | TTS does not insert real silence between sentences yet |
| Latency | **3 / 5** | Real Claude reply: 1.5–4 s in this audit | TTS adds another 0.7–1.5 s before audio starts; no visible "thinking" animation in that window |
| Conversational realism | **4 / 5** | Replies follow §B autonomy: one mirror + at most one question | Occasional model-isms ("That sounds like…") still slip through |
| Emotional grounding | **4.5 / 5** | Reality Law + AGOP §B keep the mentor calm and non-prescriptive | None blocking |
| Silence usage | **3 / 5** | Code permits short replies; no chained reasoning | Empty pause between turns is filled by silence-of-loading, not silence-of-presence |
| Response timing | **3 / 5** | Same as latency — no breath cue while STT/Claude/TTS chain | The chain feels like "submit form" until audio plays |
| Mentor visual presence | **4 / 5** | Portrait now above chat (Stage 2.8d), CSS breath/sway visible | Portrait does not light up perceptibly when the model is "thinking" |
| UI calmness | **4.5 / 5** | Voice-first layout, italic prose, transcript at 90 % opacity | HUB welcome prose is long and may bury the mentor on first scroll |
| Trust | **4 / 5** | Reality Law copy, two consent layers, no marketing claims | Brand-new visitor sees two consent screens before first sentence — adds friction even if it adds trust |

**Strongest "human" moment today:** the mentor's portrait visibly breathing while the wanderer is mid-sentence, and the reply arriving as quiet italic prose without a chat bubble.

**Strongest "AI-breaking" moment today:** the 2–4 second silent gap between hitting send and hearing the voice, with no visible cue that the room is composing.

**Biggest emotional trust risk:** a tester writes one sad sentence, gets a competent but slightly machine-edged TTS reply, and concludes "this is just a chatbot pretending to be calm". Mitigation: drop TTS speed once more, add a soft inhale audio file (1 file, ~0.6 s) played while the model is composing.

**Biggest "chatbot" feeling left:** the SEND button (still present, even if smaller) on the text-fallback path; and the visible chat bubble for the user's own line.

---

## SECTION 5 — Accessibility & Activation Audit (external chain, both environments)

The seven-step external chain, traced today against the live preview:

| Step | Preview (`aurin-hub.preview…`) | Production (`prulesoul.site`) |
|---|---|---|
| 1. Entry | **VERIFIED** — landing page renders, no console errors | **PARTIAL** — site reachable (HTTP 200), serves an older build (Stage 2.8d not yet deployed) |
| 2. Email capture (`/api/auth/magic-link/request`) | **VERIFIED** — returns OK, writes token to `magic_link_tokens` | **NOT YET VERIFIED** in this audit |
| 3. Magic-link delivery (Resend) | **VERIFIED** — 23 tokens issued, 12 lead-magnet sends, 1 first-letter send | **NOT YET VERIFIED** in this audit |
| 4. Redirect (`/portal/magic?token=…`) | **VERIFIED** — verify → 200 + `session_token` | **NOT YET VERIFIED** |
| 5. Room arrival | **VERIFIED** — three rooms render after gates | **NOT YET VERIFIED** |
| 6. Mentor visibility | **VERIFIED** — `<GuidePresence />` renders above the chat, breathing CSS animation present | **BLOCKED until re-deploy** — Stage 2.8c hotfix (the `toneTag` ReferenceError) and Stage 2.8d voice-first layout are not yet on production |
| 7. Voice response | **PARTIAL** — endpoints validated (TTS 200, STT validation 200), real audio round-trip not exercised today | **BLOCKED until re-deploy** |

**Desktop:** the full chain passes on preview. An external tester with a fresh cookie can request a magic link, click through, accept the WandererGate, accept the ClarityThreshold, see Grace breathing, type "I am tired tonight." and read a real Claude reply within seconds.

**Mobile:** **NOT YET VERIFIED.** Code paths for `MediaRecorder` + autoplay-on-mp3 are known to vary between iOS Safari, Android Chrome, and the iOS in-app browsers (Instagram, Facebook). Without a real device pass, mobile experience must be labeled untested.

**An external tester landing on production today** (per the system note about deployed environment): they would experience the **pre-2.8c** version, which contains the `toneTag` ReferenceError that crashes Clarity Release on first chat entry. **Production is currently broken for any logged-in user trying to enter the chat.** Re-deploy is required.

---

## SECTION 6 — Operational Role Map

Honest framing: there is one engineering agent (this one) and one founder. Everything else is naming convention, not autonomous infrastructure.

| Role | Real responsibility | Real authority | Runtime or coordination | What is automated | What does NOT exist |
|---|---|---|---|---|---|
| **AH (engineering agent)** | Implements changes in `/app`. Writes regression tests. Operates the codebase. | Code edits inside this repo only. | Coordination + runtime via tools. | Code generation, lint, regression tests, deploy preview. | Direct production deploy (founder must trigger). |
| **LP (landing-page / marketing copy agent)** | Drafts email copy and landing-page text. | None at runtime. | Coordination only. | Nothing autonomous. | A live "marketing engine" that writes / publishes on its own. |
| **A&V (audio & video agent)** | Approves TTS voice choice, pacing rules, mentor portrait. | Advisory. | Coordination only. | Nothing autonomous. | A live audio post-processor or video renderer. The current TTS pipeline is a single OpenAI call with a punctuation pre-pass. |
| **KUNSTNIK (visual)** | Approves portrait, color, spacing decisions. | Advisory. | Coordination only. | Nothing. | A live design system pushing changes. |
| **Marketing** | None operational. | None. | Coordination only. | Nothing. | A campaign engine, ad pipeline, or analytics stack. The only outbound is the manual `outbound_campaigns` admin endpoint. |
| **Course Coordinator** | Approves course copy. | Advisory. | Coordination only. | Nothing. | A course-LMS, scheduler, or progress tracker beyond `course_enrollments`. The daily letter dispatcher is missing. |
| **HUB-CONNECT-29** | Founder-facing label. | None at runtime. | Naming convention. | Nothing. | A connection bus, message broker, or service mesh. There is no event bus inside the system. |

**Plain truth:** the system is one FastAPI service + one React app + one Mongo + Resend + OpenAI + Anthropic + LemonSqueezy webhooks. Roles above are how the founder organizes intent. They are not separate runtime layers.

---

## SECTION 7 — Remaining Blockers (real ones only)

### P0 — must fix before any external scaling

1. **Production re-deploy** — `prulesoul.site` is running the pre-2.8c build that crashes Clarity Release for logged-in users. **STATUS: BLOCKED on founder action** (Emergent deploy flow). This is the single most urgent item.

2. **Course daily-letter delivery scheduler** — paid courses 1 → 4 have full content for all 7 days, but the only thing emailed today is letter 1 (via `lead-magnet`). Days 2–7 are accessible only via the website. **STATUS: MISSING.** Mirror the existing `_six_nights_dispatch_loop` pattern. Real refund risk: a buyer expects "7 letters by email"; today they get one + a website to remember.

3. **Mobile reality test** — iPhone Safari + Android Chrome + at least one in-app browser (Instagram). Voice-first MediaRecorder + autoplay are the most likely fail points. **STATUS: NOT YET VERIFIED.**

4. **Real PDF flow walkthrough** — at least one full LemonSqueezy live purchase → webhook → `purchases` insert → `library/{slug}/download` 200 OK with the PDF bytes. **STATUS: NOT YET VERIFIED.** Code is in place; preview has 1 manual_grant purchase only.

### P1 — must fix before real-public launch

5. **TTS realism polish** — drop speed to 0.82 (or splice a short inhale audio between user-send and TTS-start) so the consonant edge softens and the silent gap fills. **STATUS: SIMPLE TUNE, NOT YET DONE.**

6. **A "thinking" presence cue** — visible micro-animation on the mentor portrait between user-send and TTS-start. Not a spinner. A single pulse on the breath. **STATUS: NOT YET DONE.**

7. **Front-load consent reduction (optional)** — WandererGate + ClarityThreshold = two consecutive consent screens. Combining them or remembering wider consent is a single-screen call worth the founder's review.

8. **Brian / Jenny rename re-apply** — founder's 2.8c message ratified the rename, then 2.8b's hold reversed it. Final call sits with the A&V agent. **STATUS: BLOCKED on A&V confirmation.**

### P2 — clearly future, do not work on yet

9. Choose-your-companion portrait card on `/portal`.
10. Expanded tone-tag taxonomy / breathing modulation.
11. LemonSqueezy `preparing` → `live` switch. (Webhook secret + API key + store ID are wired; the gate is product readiness, not config.)

---

## SECTION 8 — Final Reality Verdict

**Where Matrix Aurin actually is:** **partial runtime in private beta**, with one critical accessibility regression on production that must be redeployed away.

**What already works surprisingly well:**
- Magic-link auth round-trip is reliable and fast.
- Claude Sonnet 4.5 replies are short, calm, and on-tone — the AGOP §A and §B locks are doing real work.
- The booking flow is end-to-end live (slot listing, reserve, confirmation email with a magic-entry URL).
- Voice-first UI on Clarity Release feels intentional, not bolted-on.
- The Reality Law audit found nothing severe in client copy — the system is no longer drifting toward mystic claims.

**What still prevents stable public release:**
- Production is on a build that crashes for any logged-in user entering Clarity Release. **Re-deploy first; everything else after that.**
- Paid course delivery has no daily email scheduler. A buyer today gets one letter and a memory of a website. **This is the one real refund risk.**
- Mobile is untested. We do not yet know if push-to-talk works on iOS Safari from a fresh user.
- TTS is good enough to feel calm but not yet good enough to feel believable for a tired tester. One more pacing pass.

**What must absolutely not break during stabilization:**
- Magic-link issue + verify.
- WandererGate + ClarityThreshold.
- `<GuidePresence />` render path (the `toneTag` / `audioPlaying` props lock — guarded by `tests/test_stage2_8c_chatpanel_regression.py`).
- `/api/clarity/stt` validation paths (no real-audio call without explicit founder action).
- `/api/clarity/tts` voice + speed contract.
- Booking reserve idempotency.
- Library `/api/cabinet/library/{slug}/download` 403 on unowned books.

**One-line verdict:**
> Matrix Aurin is a calm, narrowly-scoped private-beta voice-first listening room. The runtime is real; the production deploy is stale; the paid-course delivery loop is half-built; mobile is unverified. With those four items closed, it can serve real wanderers without theatre.

— end of audit —
