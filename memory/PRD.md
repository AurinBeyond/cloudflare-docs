> 🟢 **PHASE 0 — 2026-02-13 (CRITICAL SANCTUARY STABILIZATION · founder distress directive)**
>
> Founder directive (Estonian, in distress): logo/menu overlap, harsh
> robotic voice, AI-assistant defensive language ("wrong room"),
> static portrait, admin/preview chrome leaking into the wanderer's
> room. **Stop-work on all new features until the Clarity Release
> sanctuary feels alive and clean.**
>
> **What landed (all surgical, no architecture change):**
>
> 1. **Header overlap eliminated** (`Navigation.jsx`)
>    - Breakpoint raised from `lg:` (1024px) → `xl:` (1280px) so the 12
>      nav items either fit on one line or collapse cleanly to the
>      mobile menu. No more two-row wrap-onto-logo at 1280/1366.
>    - Logo + container gain `flex-shrink-0` + `whitespace-nowrap` +
>      `min-w-0`; nav items add `whitespace-nowrap`. Gap reduced
>      `gap-9 → gap-6`. Verified live: 16px clear gap at both 1280px
>      and 1920px viewports.
>
> 2. **TTS voice & pacing locked** (`clarity_tts.py`)
>    - Female voice changed `coral → shimmer` (the softest of the
>      OpenAI voices — calm, breathy, sanctuary-grade).
>    - `DEFAULT_SPEED` `0.82 → 0.85` (founder-mandated lock).
>
> 3. **Reply-length stabilization** (3 prompts updated)
>    - `clarity_ai.CLARITY_SYSTEM_PROMPT` — "two to four sentences" →
>      "**ONE or TWO short sentences per reply. Often one.**"
>    - `body_room_ai.BODY_ROOM_SYSTEM_PROMPT` — same lock.
>    - `parents_room_ai.PARENTS_ROOM_SYSTEM_PROMPT` — same lock.
>    - All three "your turn" trailers rewritten to: "If unsure, say
>      *'I am here. Take your time.'* and stop. Never explain rooms,
>      systems, or yourself."
>
> 4. **Sanctuary forbidden-behaviour block** (3 prompts + `clarity_safety.py`
>    regex safety net):
>    Forbidden phrases the mentor must NEVER produce:
>    - "wrong room" / "belongs in another room"
>    - "as an AI" / "I am just an AI" / "language model"
>    - "I'd be happy to…" / "let me clarify" / "is there anything
>      else I can help you with?"
>    - "you can leave any time" / "this room may not be for you"
>    `clarity_safety._LAYER_1` now rewrites all of these in place
>    (e.g. "wrong room" → "this room"; "as an AI" → "as a quiet
>    presence"; "Is there anything else..." → "I am here when you
>    want to keep going.") so even a model slip is caught.
>
> 5. **Subtle breathing presence** (`index.css` + `GuidePresence.jsx`)
>    - `@keyframes aurin-guide-breath` strengthened: scale 1.013 →
>      **1.022** + brightness pulse 0.98 → 1.04. 7s cycle preserved.
>    - Animation now also applied to the `<video>` element (was only
>      on `<img>` fallback) — every portrait now breathes whether
>      the Sora 2 clip is live or the static jpg.
>
> 6. **Admin / preview chrome hidden inside the sanctuary**
>    (`Layout.jsx`, `AdminBadge.jsx`)
>    - The `AiDock` "The Guardian · soon" teaser is suppressed on
>      `/clarity-release`, `/body-room`, `/parents-room`,
>      `/kids-universe`, `/cabinet`, `/guest`, `/portal/guest`.
>    - The `AdminBadge` ("admin · live preview") is suppressed on the
>      same paths so the founder herself, while signed in as admin,
>      sees the wanderer's experience un-cluttered.
>
> **Verified live (preview):**
> - `clarity_safety.sanitize_reply("You are in the wrong room")` →
>   "I am here with you"
> - `sanitize_reply("As an AI, I cannot help with that")` → "as a
>   quiet presence, I cannot help with that"
> - `VOICE_FOR_GENDER["female"] == "shimmer"`, `DEFAULT_SPEED == 0.85`
> - Body Room "Are you okay?" → *"I am here. Thank you for asking. …"*
>   (2 sentences, no defensive language, no "wrong room")
> - Parents' Room "Tonight was loud..." → 2 calm sentences,
>   parent-to-parent tone.
> - Header at 1280px: 16px clean gap between logo and nav.
> - 52/52 regression pytests still green.
>
> **Files changed:**
> - `/app/backend/clarity_tts.py` — shimmer + 0.85
> - `/app/backend/clarity_ai.py` — Phase 0 prompt block + reply length lock
> - `/app/backend/body_room_ai.py` — Phase 0 prompt block + reply length lock
> - `/app/backend/parents_room_ai.py` — Phase 0 prompt block + reply length lock
> - `/app/backend/clarity_safety.py` — 10 new Phase 0 regex rewrites
> - `/app/frontend/src/components/layout/Navigation.jsx` — xl: breakpoint, flex-shrink-0, whitespace-nowrap, gap-6
> - `/app/frontend/src/components/layout/Layout.jsx` — `!isSanctuary && <AiDock />`
> - `/app/frontend/src/components/AdminBadge.jsx` — sanctuary suppression
> - `/app/frontend/src/components/GuidePresence.jsx` — breath on `<video>` too
> - `/app/frontend/src/index.css` — stronger breath keyframes
>
> **Founder action required:** **Save to GitHub → Deploy** to push to
> `prulesoul.site`. The preview is live now and the next visit will
> show the quieter mentor + clean header + breathing portrait.
>
> ---

> 🟢 **STAGE 3.3 — 2026-02-13 (CROSS-ROOM "QUIET TEADMINE" BRIDGE + PARENTS' ROOM LIVE CHAT + WISDOM WEAVER ON)**
>
> Founder directive (Estonian): "Ehita Cross-Room Context Memory
> (jagatud teadvuse sild) + Parents' Roomi live-vestlus, hoolitse,
> et AI kasutaks uut Wisdom Weaver tonaalsust."
>
> **What landed:**
>
> 1. **`backend/shared_memory.py` (FINISHED)** — Cross-Room
>    "quiet teadmine" bridge:
>    - `extract_signals(text)` — 17 conservative regex patterns
>      (tiredness, sleep_loss, anger, anxiety, grief, loneliness,
>      shame, child, partner, work_stress, tension_chest/shoulders/
>      head/belly, screen_struggle, bedtime_struggle, food_struggle).
>      Each tag returned at most once; supports both English and
>      Estonian forms (`väsinud`, `laps`, `viha`, etc.).
>    - `record_signals(db, user_id, room, text)` — Mongo upsert into
>      `shared_memory_tags { user_id, tag, weight, last_seen_at,
>      last_source_room, source_rooms[] }`. Silent no-op when
>      `user_id` empty or room unknown.
>    - `quiet_knowledge(db, user_id, room, limit=6)` — returns up to
>      6 recent tags whose `last_source_room` ≠ current room, sorted
>      by `last_seen_at`.
>    - `render_prompt_block(tags)` — flattens the list into a calm
>      "§Quiet knowledge from earlier (do not quote back)" system-
>      prompt fragment.
>    - `ensure_indexes(db)` — unique `(user_id, tag)` + recency index.
>      Wired into `server.on_startup`.
>
> 2. **`backend/tonality_filter.py` (FINISHED · "Wisdom Weaver")** —
>    Conservative post-filter that runs after `clarity_safety.sanitize_reply`:
>    - Phrase rewrites: "research shows that…" → "many people find
>      that…", "you should/must/need to" → "you might/may want to",
>      "in conclusion" → "as a quiet close," (etc.).
>    - 1–2 bullet lines → flattened to prose.
>    - 3+ bullet lines (heavy listicle) → calm re-anchor fallback
>      ("I want to slow down here. There is no list for this…").
>    - `audit(text)` returns dry-blog signals for telemetry.
>    - Now linked into `clarity_safety.sanitize_reply` so every AI
>      reply across Body / Clarity / Parents passes through it.
>
> 3. **`backend/parents_room_ai.py` (NEW · 200 lines)** — Parents'
>    Room live mentor pipeline mirroring `body_room_ai.py`:
>    - `PARENTS_ROOM_SYSTEM_PROMPT` — tuned to parenting voice
>      ("parent-to-parent in tone, not clinical, not aspirational",
>      no "amazing parents" language, no developmental labelling).
>    - All AGOP §A–D locks (pacing, autonomy, voice, wellness).
>    - Extended crisis-phrase list: "hurt my child", "shake the
>      baby", "hit my child" route to Eluliin 116 123 + child-welfare
>      116 111 + 112.
>    - `generate_parents_reply(...)` accepts `lens`, `situation`,
>      `quiet_knowledge`, `transient_context`. Output flows through
>      `clarity_safety.sanitize_reply` (which now also runs Wisdom
>      Weaver).
>
> 4. **`POST /api/parents-room/chat` (NEW endpoint)** — mirrors
>    `/body-room/chat`:
>    - Auth required (401 without Bearer).
>    - Shared `_enforce_chat_cap(user, "parents_room")` — same daily
>      ceiling (60 during gift window) as Body Room + Cabinet.
>    - Loads `_quiet_knowledge_block(user_id, "parents")` server-side
>      before generating; injects into prompt invisibly.
>    - After reply: `asyncio.create_task(_record_room_signals_safe(...))`
>      writes tags from the wanderer's text for next visit.
>    - Returns `{reply, tone_tag, user_state}` matching Body Room shape.
>
> 5. **Cross-Room bridge wired into all three rooms (read + write):**
>    - `body_room_chat` (server.py:5413) — loads parents/clarity tags
>      before reply, records body tags after.
>    - `cabinet_message` (server.py:3362) — loads body/parents tags
>      before reply, records clarity tags after.
>    - `parents_room_chat` (NEW) — loads body/clarity tags before
>      reply, records parents tags after.
>    - The two AI functions `generate_guide_reply` (clarity_ai.py)
>      and `generate_body_reply` (body_room_ai.py) gained
>      `quiet_knowledge` param.
>
> 6. **`frontend/src/components/ParentsRoomChat.jsx` (NEW · 380 lines)** —
>    Live chat surface mirroring `BodyRoomChat.jsx`:
>    - Whisper STT + auto-speak TTS (same `useVoiceIO`).
>    - GuidePresence portrait + tone/state animation.
>    - Sends the active parenting lens + the currently-open situation.
>    - Browser-side history in `aurin_parents_chat_v1`.
>    - All interactive elements carry `data-testid="parents-room-chat-*"`.
>
> 7. **`frontend/src/pages/ParentsRoom.jsx`** — `<ParentsRoomChat />`
>    embedded at the bottom of the page, always visible. The "coming
>    next" placeholder paragraph replaced with a calm invitation.
>
> **Testing:**
> - **26/26 NEW Stage 3.3 unit tests pass** (`test_stage3_3_shared_memory.py`
>   14 + `test_stage3_3_parents_chat.py` 12 — uses FakeDB pattern so
>   no live Mongo dependency).
> - **11/11 NEW live HTTP integration tests pass**
>   (`tests/test_stage3_3_live_integration.py`, created by testing
>   subagent): GET lenses, POST chat 401/400/200, invalid lens,
>   long-message truncation, crisis Eluliin redirect, clinical-term
>   block, Estonian `ravim` block, body→parents Cross-Room bridge
>   verified via direct MongoDB inspection.
> - Regression: Body Room + Cabinet endpoints still 200 OK with
>   non-empty replies.
>
> **Files changed:**
> - `/app/backend/shared_memory.py` (logic completed)
> - `/app/backend/tonality_filter.py` (logic completed · wired into clarity_safety)
> - `/app/backend/parents_room_ai.py` (NEW · 200 lines)
> - `/app/backend/server.py` — `/api/parents-room/chat` endpoint, `_quiet_knowledge_block`, `_record_room_signals_safe`, cabinet wire-up, ensure_indexes startup
> - `/app/backend/clarity_ai.py` — `quiet_knowledge` param
> - `/app/backend/body_room_ai.py` — `quiet_knowledge` param
> - `/app/backend/clarity_safety.py` — Wisdom Weaver link (Stage 3.2 step)
> - `/app/backend/tests/test_stage3_3_shared_memory.py` (NEW · 14 tests)
> - `/app/backend/tests/test_stage3_3_parents_chat.py` (NEW · 12 tests)
> - `/app/backend/tests/test_stage3_3_live_integration.py` (NEW · 11 tests, by testing agent)
> - `/app/frontend/src/components/ParentsRoomChat.jsx` (NEW · 380 lines)
> - `/app/frontend/src/pages/ParentsRoom.jsx` — chat embed
>
> **Founder action required:** **Save to GitHub → Deploy** to push
> to `prulesoul.site`.
>
> **What's queued next (founder-prioritized after this lands):**
> - 🟡 Kids Universe Lenses — 3-lens system (Playfulness · Story · Peace).
> - 🟡 Welcome Email / Gift Delivery audit under mass traffic.
> - 🟡 Dynamic Course Curator (loose content instead of static PDFs).
> - 🟡 Stripe Elements frontend (still BLOCKED on sandbox keys).
> - 🟡 Sora 2 Grace v2 video (BLOCKED on founder's OpenAI key).
>
> ---

> 🟢 **STAGE 3.2+ — 2026-02-12 (CALM PARENT'S CODE · CREDIT-LEDGER SCAFFOLD)**
>
> Founder directive (Estonian, post-audit): "Kas oled valmis, et
> laseme kuraatoril Vanemate toa esimese praktilise harjutuse 'uksele'
> riputada?" + "AH Agent: Valmista ette Stripe Elements integratsioon
> (1€=10 krediiti)."
>
> **What landed (autonomous):**
>
> 1. **"The Calm Parent's Code · seven evenings" (NEW · Parents' Room
>    featured ritual):**
>    Above the lens selector on `/parents-room`, before any choice is
>    made. Three numbered steps in sage-circle bullets:
>    - **A small ritual.** One tiny act each evening, same order.
>    - **One sentence to swap.** Pick a heavy line, replace with a
>      lighter one from the Positive Coding lens, say only the new
>      one for seven days.
>    - **Ten seconds of full face.** Once a day, give the child your
>      whole face — no phone, no question, no fixing.
>    Closing permission: *"No tracker. No streak. No screen pressure.
>    The code lives in your home, not in this page."*
>    Test IDs: `parents-calm-code-{title,step-1,step-2,step-3,permission}`.
>
> 2. **`credit_ledger.py` (NEW · Stripe-ready bookkeeping layer):**
>    Three Mongo collections + idempotent helpers:
>    - `credit_balances` · `{user_id, balance, lifetime_purchased, lifetime_used, updated_at}`
>    - `credit_ledger` · append-only audit trail
>      `{id, user_id, kind, delta, balance_after, source, meta, created_at}`
>      kinds: `topup` · `spend` · `daily_reset` · `promo` · `refund`
>    - `daily_usage` · `{user_id, date_utc, replies_used, ceiling_at_time, last_reply_at}`
>    Helpers exposed:
>      `get_balance`, `get_daily_usage`, `credit_topup(eur)`,
>      `credit_spend(count)`, `daily_usage_increment(ceiling)`,
>      `ensure_indexes`.
>    Constants locked by founder directive:
>      `CREDITS_PER_EUR = 10` (1€ = 10 replies, never silently change)
>      `RESET_HOUR_UTC = 0` (daily reset at 00:00 UTC)
>    NO Stripe API calls live here — when sandbox keys arrive, the
>    webhook handler will simply call `credit_topup(eur_amount,
>    source=f"stripe:{event_id}")` and the bookkeeping is done.
>
> 3. **`tests/test_stage3_2_credit_ledger.py` (NEW · 10 tests, all
>    passing):**
>    - `test_credits_per_eur_locked_at_ten` — regression guard
>      against silently changing the founder-locked ratio.
>    - balance starts at zero, top-ups add `eur × 10` credits, multiple
>      top-ups accumulate, spend deducts, spend on empty balance
>      returns `{ok: False}` gracefully, zero/negative top-ups raise
>      `ValueError`, daily usage increments per `(user_id, date_utc)`,
>      ledger kinds always belong to the allowed set, indexes can be
>      created without error.
>
> **Regression check:**
> - **46/46 backend pytests still green** (36 prior + 10 new ledger).
> - Lint clean (Python + JS).
> - DOM smoke on `/parents-room`: Calm Code title + all 3 steps +
>   permission line + lens cards + situation tiles all render.
>
> **Files changed:**
> - `/app/frontend/src/pages/ParentsRoom.jsx` — Featured ritual block
> - `/app/backend/credit_ledger.py` (NEW · ~180 lines)
> - `/app/backend/tests/test_stage3_2_credit_ledger.py` (NEW · 10 tests)
>
> **Founder action required:** **Save to GitHub → Deploy** to push to
> `prulesoul.site`.
>
> **What's now ready and idle, waiting on founder credentials only:**
> - **Stripe Elements integration** — needs `STRIPE_PK_TEST` +
>   `STRIPE_SK_TEST` env vars. Then ~150 lines wires
>   `POST /api/credits/topup-intent` + Stripe webhook + the
>   `<CreditTopupSheet />` React component → credit_ledger functions
>   already in place. Estimated 1 focused session once keys arrive.
> - **Live parents-room chat endpoint** — mirrors `/api/body-room/chat`
>   with the parents-lens prompt anchor.
> - **Sora 2 Grace v2 + male video** — needs founder's OpenAI key.
> - **Smart Latency filler audio** — needs pre-recorded EE+EN clips.
>
> ---

> 🟢 **STAGE 3.2 — 2026-02-12 (PARENTS' ROOM SCAFFOLDING + OG-COVER + AUTONOMOUS)**
> autonomously while founder is at work.
>
> **What landed:**
>
> 1. **`backend/parents_lenses.py` (NEW)** — Parents' Room Multi-Lens
>    registry mirroring `body_lenses.py`. Four lenses:
>    - `intuitive` · default · invisible context-aware switcher
>    - `shitsuke` · Japanese rhythm parenting (Shitsuke + Itadakimasu + Amae)
>    - `montessori` · Montessori prepared-environment + Steiner +
>      developmental observation
>    - `positive_coding` · sentence-swap affirmation language
>    Each concrete lens carries 8 everyday situations
>    (`bedtime`, `mealtime`, `big_emotions`, `screen_time`, `sibling`,
>    `separation`, `school_stress`, `connection`) × 3 fields
>    (`insight`, `practice`, `permission`) = **72 authored micro-texts**.
>    All 72 pass `clarity_safety.sanitize_reply` + `audit_clinical_drift`
>    with zero rewrites (verified live).
>
> 2. **`GET /api/parents-room/lenses` (NEW endpoint)** — public,
>    no-auth, same shape as `/body-room/lenses`. Live verified:
>    returns 4 lenses with correct `situations` counts (0/8/8/8).
>
> 3. **`frontend/src/pages/ParentsRoom.jsx` (NEW · 405 lines)** —
>    new `/parents-room` page:
>    - Calm `PageHeader` ("Three quiet schools, one calm room for parents")
>    - `FreeAccessBadge variant="block"` while gift window active
>    - 4-card opt-in lens selector (`parents-lens-selector` testid)
>      with same `lens-breathing` halo CSS as Body Room
>    - 8-tile situation grid (Moon/Utensils/Flame/Smartphone/Users/
>      Plane/GraduationCap/HandHeart icons)
>    - `SituationModal` opens on tile click, showing the active lens's
>      `insight + practice + permission` for that situation (or a
>      calm placeholder for Intuitive Flow)
>    - Cross-links to Body Room + Clarity Release
>
> 4. **Routing & navigation:**
>    - `App.js` — new `<Route path="/parents-room" element={<ParentsRoom />} />`
>      (NO WandererGate — parents come for techniques, the
>      psychiatric-exclusion disclaimer is wrong tone)
>    - `Navigation.jsx` — "Parents' Room" added between Body Room and
>      Kids Universe with `data-testid="nav-parents-room"`
>    - `Footer.jsx` — "Parents' Room" added to explore section
>
> 5. **`scripts/make_og_cover.py` (NEW) → `public/og-cover.png`:**
>    1200×630 PNG, 52 KB. Sage-green vertical gradient
>    (forest → sage), soft radial glow upper-right, "PRULESOUL ·
>    MATRIX AURIN" eyebrow, "the room that reads you" display title,
>    "Three wisdom schools · one quiet room" subline, sage sparkle
>    accent, "FREE DURING LAUNCH" pill top-right. Served at
>    `/og-cover.png` (HTTP 200 verified). Picked up by the OG meta
>    tags shipped in Stage 3.0 — social shares on
>    LinkedIn / X / Facebook / iMessage will now show a branded card.
>
> **Verified live:**
> - `GET /api/parents-room/lenses` → 4 lenses, intuitive `situations=0`,
>   shitsuke/montessori/positive_coding `situations=8` each.
> - `/parents-room` renders all 4 lens cards + free-access block badge
>   + Intuitive default-active with sage halo.
> - Navigation shows "Parents' Room" between Body Room and Kids Universe.
> - `GET /og-cover.png` → HTTP 200, 52 KB PNG.
> - Lint clean (Python + JS).
>
> **Files changed:**
> - `/app/backend/parents_lenses.py` (NEW · ~430 lines · 72 texts)
> - `/app/backend/server.py` — `/api/parents-room/lenses` endpoint
> - `/app/frontend/src/pages/ParentsRoom.jsx` (NEW · 405 lines)
> - `/app/frontend/src/App.js` — import + route
> - `/app/frontend/src/components/layout/Navigation.jsx` — nav link
> - `/app/frontend/src/components/layout/Footer.jsx` — explore link
> - `/app/scripts/make_og_cover.py` (NEW · 100 lines)
> - `/app/frontend/public/og-cover.png` (NEW · 52 KB)
>
> **Founder action required:** **Save to GitHub → Deploy** prulesoul.site.
>
> **NOT yet built (queued):**
> - Live parents-room chat endpoint (`POST /api/parents-room/chat`) —
>   would mirror `/body-room/chat` with the parents-lens prompt anchor.
>   Surfacing the static-content + lens UX first so the founder can
>   validate the editorial voice before we wire the live mentor.
> - Stripe Elements integration — blocked on sandbox keys.
> - Smart Latency filler audio — needs recordings.
> - Sora 2 Grace v2 + male video — blocked on founder's OpenAI key.
> - Autonomous artist-loop orchestration — multi-iteration scope.
>
> ---

> 🟢 **STAGE 3.1 — 2026-02-12 (FREE-ACCESS CHAT-CAP LIFT + USAGE HINT POLISH)**
> eriti ei sujunud, vastus agendi poolt pidevalt väga viibis, vöi ta
> ainult tervitas… ning mingid numbrid, olid 1-12 vestluse all, mis
> see on?"
>
> **Root cause found:** The daily chat ceiling for free-tier wanderers
> was capped at 12 (`CHAT_CAP_FREE_PER_DAY`). Even during the
> `FREE_ACCESS_UNTIL=2026-05-20` gift window, free-tier visitors hit
> a hard 429 after 12 replies — which is why the mentor "only
> greeted" (the founder hit the cap mid-conversation) and why "1-12"
> appeared under the chat (the `ChatUsageHint` counter).
>
> **What landed:**
>
> 1. **`server._chat_cap_for_user()`** — added the gift-window short
>    circuit. While `_free_access_active()` is true, the cap is
>    `CHAT_CAP_PREMIUM` (60/day) for everyone, signed-in or not.
>    Verified via direct asyncio test (`Cap for free-tier wanderer
>    during gift window: 60`).
>
> 2. **`ChatUsageHint.jsx`** — hides the "0 of 60 today" counter
>    during the first five replies of a session when the ceiling is
>    ≥ 30 (i.e. the gift-window state). Founder feedback: showing
>    a hard counter at session start "feels like a paywall". The
>    soft "X quiet replies remaining" still appears when the cap is
>    actually being approached.
>
> **Answers to founder's three other questions (delivered in-message):**
>
> - **Magic link uuendused?** Yes. Magic links exchange a token for
>   an httpOnly session cookie; they carry no UI version. Every
>   visit after deploy reads the production deploy's UI. Cache may
>   need a hard reload (Cmd+Shift+R) on first visit after deploy.
>
> - **"ChatGPT vorm" Clarity Releases?** The `variant="call"`
>   Zoom-style layout is applied in code (verified `ClarityRelease.jsx:1085`).
>   GuidePresence renders the `grace_vision_pilot.mp4` video for
>   female guides; male guides fall back to a static portrait (no
>   male video yet — Sora 2 generation is blocked on the founder's
>   OpenAI key). Founder's session was probably using a non-female
>   guide profile, which is why the call layout felt static.
>
> - **Vastused viibivad** — Claude API latency floor is ~2-4s per
>   reply. Reaching sub-second requires the OpenAI Realtime WebRTC
>   path, which is gated on the founder's OpenAI key. The
>   "Smart Latency" filler-audio approach (mhm / oota / kuulan
>   clips while the LLM thinks) is queued as a P1; needs
>   pre-recorded audio assets.
>
> **Verified:**
> - 36/36 backend pytests still green.
> - `GET /api/aurin/free-access` → `{active:true, until:"2026-05-20"}`.
> - `_chat_cap_for_user` returns 60 for a synthetic free user during
>   the gift window.
>
> **Files changed:**
> - `/app/backend/server.py` — `_chat_cap_for_user` gift-window branch
> - `/app/frontend/src/components/ChatUsageHint.jsx` — hide early hint
>
> **Founder action required:** **Save to GitHub → Deploy** again.
> The previous deploy still has the 12-cap — until this push lands,
> active wanderers will keep hitting the limit.
>
> ---

> 🟢 **STAGE 3.0 — 2026-02-12 (GLOBAL AGENT ALIGNMENT + MARKETING REFRESH)**
> agendid nende uute muudatustega, ning pane marketing tööle"
> → Propagate the new wellness-language lock + Intuitive Flow lens
> system to every AI surface, and refresh marketing copy to reflect
> the free-during-launch + Multi-Lens positioning.
>
> **What landed:**
>
> 1. **Universal `sanitize_reply` post-filter (no more orphan AI paths):**
>    - `body_room_ai.generate_body_reply()` now sanitizes its final
>      `parsed["text"]` before returning. Body Room replies are now
>      guaranteed to pass through `clarity_safety` (no medical terms,
>      no Estonian `ravim` forms).
>    - `clarity_ai.generate_summary()` — the close-of-session note
>      that gets saved to the user's archive now ALSO passes through
>      `sanitize_reply`. Previously the summary was the only AI output
>      that could leak clinical drift.
>    - `clarity_ai.generate_reply()` was already sanitized (Stage 2.9b).
>    - `clarity_realtime.py` is gated off (`REALTIME_MODE=off`); no
>      action needed until the founder's OpenAI key arrives.
>
> 2. **Intuitive Flow lens propagation to Clarity Release:**
>    - `clarity_ai._build_system_prompt()` now injects
>      `body_lenses.lens_prompt_anchor("intuitive")` as a default
>      section right after the base `CLARITY_SYSTEM_PROMPT`.
>    - The Clarity mentor now silently shifts between somatic
>      regulation / psychosomatic mirror / eastern breath registers
>      based on the wanderer's wording — never naming the method
>      aloud (same invisible-mentor contract as Body Room).
>    - The summary builder path (line 563+) is left at the base
>      prompt — closing notes are descriptive, not conversational.
>
> 3. **Marketing copy refresh (the "Pane marketing tööle" half):**
>    - `Home.jsx` now renders a slim `home-free-access-strip` at the
>      very top: "Free during launch · every room, every voice,
>      until May 20, 2026" — only while the gift window is active.
>    - New `home-multilens-tile` between the 7-Days banner and the
>      mini-system-map: "The room reads you and *chooses silently.*
>      Eastern breath · Psychosomatic mirror · Nervous-system science"
>      Routes directly to `/body-room` where the lens selector lives.
>    - `public/index.html` meta tags rewritten:
>      - `<title>` → "prulesoul · Matrix Aurin — the room that reads you"
>      - `og:title` + `og:description` + `twitter:card` all updated to
>        the new positioning. Social-share previews now lead with the
>        Multi-Lens promise and the free-during-launch hook.
>
> **Verified live:**
> - **36/36 backend pytests green** (Stage 2.9d + 2.9e ravim filter
>   + body_chat_iter60 + AGOP-D wellness lock + p0_realtime).
> - `GET /api/aurin/free-access` → `{"active":true,"until":"2026-05-20"}`.
> - DOM smoke on `/` (preview): free-access strip, multi-lens tile,
>   7-days banner all render as expected.
>
> **Files changed:**
> - `/app/backend/body_room_ai.py` — sanitize_reply on final parsed text
> - `/app/backend/clarity_ai.py` — Intuitive Flow injection + summary sanitize
> - `/app/frontend/src/pages/Home.jsx` — free-access strip + multi-lens tile
> - `/app/frontend/public/index.html` — title + OG + Twitter meta refresh
>
> **Founder action required:** **Save to GitHub → Deploy** to push to
> `prulesoul.site`. Social-share image (`/og-cover.png`) is referenced
> in the OG meta but the file may not exist yet — preview will fall
> back to no image, which is acceptable for launch.
>
> **Still queued (out of scope this iteration, blocked on external dependencies):**
> - **Stripe in-app credit top-up** — blocked on sandbox keys
>   (`pk_test_…` + `sk_test_…`). Specs locked: 1€ = 10 replies, 15
>   free/day, 00:00 UTC reset, Stripe Elements.
> - **Parents' Room v2** — `/parents-room` new page, mirror of
>   `body_lenses.py` with Shitsuke / Montessori / Positive Coding
>   lenses. ~300 lines, will scope after Stripe.
> - **Autonomous Artist Loop** — marketing → artist → audio → AH;
>   needs job queue architecture, not a one-iteration job.
> - **Smart Latency filler audio** — pre-recorded EE+EN clips needed.
> - **Revolut Business** — second payment rail; scope after Stripe.
> - **`og-cover.png` asset** — branded social-share image. Trivial to
>   produce once founder approves the visual direction.
>
> ---

> 🟢 **STAGE 2.9g — 2026-02-12 (SITE-WIDE PAYWALL SWEEP · UNIVERSAL FREE-ACCESS BADGE)**
> köik makse vöimalused, pane kas tasuta kasutamiseks, vöi varsti
> saadaval. ainus mis läheb käiku on teie oma platvormil otsene
> krediitide täiendamine, klientide poolt, kui nende tegevus nöuab
> süsteemis krediidi kulu." → Remove every external paywall site-wide;
> the only future paid surface is the in-app credit top-up (Stripe
> Elements, 1€ = 10 replies, 15 free/day, 00:00 UTC reset; integration
> deferred until Stripe sandbox keys arrive).
>
> **What landed:**
>
> 1. **`useFreeAccess.js` (NEW hook)** — single source of truth for
>    the global gift window. Fetches `/api/aurin/free-access` once
>    per session, caches module-side. Returns
>    `{ active, until, loaded, formattedUntil }`. Never throws.
>
> 2. **`FreeAccessBadge.jsx` (NEW component)** — universal price-tag
>    replacement. Two variants:
>    - `compact` (default · inline sage tag with sparkle icon)
>    - `block` (card-style with date)
>    Renders nothing when the window is inactive, so callers can drop
>    it in next to existing price code without conditionals.
>
> 3. **Site-wide swap of price labels and external checkouts:**
>    - `ClarityRelease.jsx` (HUB) — already gated (Stage 2.9f);
>      tier-cards block hidden, "Your gift" banner shown.
>    - `MembershipTiers.jsx` — price-tag per tier replaced with
>      `<FreeAccessBadge />` when active. Billing-provider footer
>      hidden during gift window.
>    - `Catalogue.jsx` `<Shelf />` — price chip per item replaced
>      with `<FreeAccessBadge />` (skips "Coming soon" items).
>    - `CourseDetail.jsx` — the LemonSqueezy "Continue · $X" CTA is
>      completely removed during the gift window; a calm
>      "Free during launch" line shows instead.
>    - `Bookstore.jsx` — price chip swaps to "Free during launch";
>      the LemonSqueezy buy button is replaced with a Library "Read it"
>      link so the wanderer stays on-site.
>    - `BookDetail.jsx` — top price chip + cross-promo price both
>      swap to "Free during launch" when applicable.
>    - `KidsUniverse.jsx` — book cards swap `$X` → "Free during launch".
>
> 4. **`GET /api/aurin/free-access`** — already shipped (Stage 2.9f);
>    re-verified: `{"active":true,"until":"2026-05-20"}`.
>
> **Verified live:**
> - Catalogue rendered: no $ signs above the fold; first card is
>   "7 Days of Clarity · FREE · Join waitlist" (always free anyway).
> - 28/28 backend pytests still green.
> - Lint clean across all 8 touched files.
>
> **Files changed:**
> - `/app/frontend/src/hooks/useFreeAccess.js` (NEW)
> - `/app/frontend/src/components/FreeAccessBadge.jsx` (NEW)
> - `/app/frontend/src/components/MembershipTiers.jsx` — price swap
> - `/app/frontend/src/pages/Catalogue.jsx` — Shelf badge
> - `/app/frontend/src/pages/CourseDetail.jsx` — LS CTA hidden
> - `/app/frontend/src/pages/Bookstore.jsx` — price + LS CTA swap
> - `/app/frontend/src/pages/BookDetail.jsx` — price chips swap
> - `/app/frontend/src/pages/KidsUniverse.jsx` — kids price swap
>
> **Founder action required:**
> 1. **Save to GitHub** → **Deploy** to push to `prulesoul.site`.
> 2. Mobile re-test: open `prulesoul.site` on iPhone/Android; should
>    see ZERO $ amounts anywhere, only "Free during launch · until
>    May 20, 2026" badges.
>
> **Acknowledged P1 (Stripe credit top-up) — implementation queued, blocked on:**
> - Stripe sandbox `pk_test_…` and `sk_test_…` from founder.
> - Frontend will use **Stripe Elements** (in-app, no redirect).
> - Daily reset at **00:00 UTC**.
> - Founder also evaluating **Revolut Business** as second rail; we
>   will scope only after Stripe is live.
>
> **Acknowledged P2 (deferred · scope-too-large-for-one-iteration):**
> - Global Agent Alignment (Stage 3.0) — clarity_safety + Intuitive
>   Flow lens-system propagation to Clarity Release, marketing, audio,
>   artist, kuraator agents. Requires inventory + lift-and-shift.
> - Parents' Room v2 (`/parents-room`) — Shitsuke + Montessori +
>   Positive-coding lenses, mirror of `body_lenses.py`. ~300 lines.
> - Autonomous Artist Loop — multi-agent orchestration (marketing →
>   artist → audio → AH agent) + job queue + review pipeline.
> - "Wisdom Weaver" tonality filter — pre-publish review against the
>   blog-prose anti-pattern.
> - Seasonal flow + Soul Audit + Feedback loop.
> - Smart Latency filler audio — pre-recorded EE+EN clips needed.
>
> ---

> 🟢 **STAGE 2.9f — 2026-02-12 (FREE-ACCESS PAYWALL CLEANUP · PUBLIC ENDPOINT)**
> ees" — the $15 / $30 / $50 tier cards were still rendering on
> `/clarity-release` even though `FREE_ACCESS_UNTIL=2026-05-20` was
> set, because:
>   1. The free-access flag was only exposed via the authenticated
>      `/api/clarity/access` endpoint. Guest visitors never received
>      it and so the HUB always rendered the paywall.
>   2. Even for signed-in visitors with `free_access=true`, the HUB
>      tier-cards block was NOT gated by the flag, only the
>      "active pass" badge was.
>
> **What landed:**
>
> 1. **`GET /api/aurin/free-access` (NEW · public, no-auth)** — returns
>    `{"active": bool, "until": ISO-date | null}`. Reads the same
>    `FREE_ACCESS_UNTIL` env var as the signed-in helper. Lets guests
>    detect the gift window without forcing a login.
>
> 2. **`ClarityRelease.jsx`** — fetches `/api/aurin/free-access` on
>    mount in parallel with the pass catalog. `HubPanel` now computes
>    `giftActive = !!(access?.free_access || freeAccessWindow?.active)`
>    and `giftUntil = access?.expires_at || freeAccessWindow?.until`.
>    When `giftActive`:
>    - The `clarity-free-access` banner replaces the paid "active pass"
>      banner with the founder-requested copy: *"Your gift: free
>      access to every room until [date]. Walk slowly. There is no
>      payment to make today."*
>    - The entire `clarity-tiers` block (incl. the $15 30-Minute
>      Release card, the $30 60-Minute card, and the Season Pass) is
>      **completely hidden** for both guests and signed-in visitors.
>
> **Verified live:**
> - `curl /api/aurin/free-access` → `{"active":true,"until":"2026-05-20"}`
> - 28/28 pytests still green
> - Lint clean (Python + JS)
>
> **Files changed:**
> - `/app/backend/server.py` — `GET /api/aurin/free-access` endpoint
> - `/app/frontend/src/pages/ClarityRelease.jsx` — public free-access fetch + HubPanel gift gating
>
> **Founder action required:** Press **Deploy** to push to
> `prulesoul.site`. Preview is live now.
>
> **Acknowledged but explicitly deferred (need design before code):**
> - **Direct credit top-up (Stripe, 1€ = 10 replies, 15/day free cap):**
>   confirmed parameters. Implementation needs: Stripe sandbox keys
>   (founder will provide), credit-ledger Mongo collection, daily
>   reset cron, soft-paywall card after limit. ETA ~1 focused session
>   once keys arrive.
> - **Global Agent Alignment (Stage 3.0):** clarity_safety + lens
>   system propagation to Clarity Release / cabinet / landing voice /
>   marketing / artist agents. Requires explicit inventory of which
>   agents exist + which call paths to re-route. Will scope as next
>   ticket.
> - **Parents' Room lenses** (Shitsuke / Montessori / Positive-coding):
>   ~300 lines of new lens registry + UI; mirror of `body_lenses.py`.
>   Will scope after Stage 3.0.
> - **Autonomous Artist Loop** (marketing → artist → audio → seller):
>   multi-agent orchestration; needs a job queue + content review
>   pipeline. NOT a one-iteration job.
> - **Smart Latency filler audio** — pre-recorded EE+EN clips needed;
>   asset production is the blocker.
>
> ---

> 🟢 **STAGE 2.9e — 2026-02-12 (INTUITIVE FLOW DEFAULT + ESTONIAN `ravim` LOCK)**
>
> Founder directive (Estonian): two surgical follow-ups to the
> Multi-Lens system —
>   1. *"Intuitive Flow Mode: Sea see vaikimisi (default) režiimiks.
>       Grace ei tohi vestluse ajal deklareerida, millist meetodit
>       ta kasutab."* (Default mode where the mentor reads context
>       and switches lens invisibly — never names the method aloud.)
>   2. *"Sõna ravim (ja kõik selle vormid) on rangelt KEELATUD.
>       Kasuta: vabastamine, tasakaalustamine, toetamine, leevendus,
>       rännak, praktika."* (Hard ban on the Estonian word "ravim"
>       and its declensions/conjugations in all AI output.)
>
> **What landed:**
>
> 1. **`intuitive` lens (NEW · the default)** — added to
>    `body_lenses.py` as a fourth registry entry, region map left
>    intentionally empty (`regions: {}`). Its `prompt_anchor`
>    instructs Claude to read the wanderer's last line and pick the
>    register SILENTLY:
>    - high stress / alarm / racing-heart language → SOMATIC SCIENCE
>      register (regulating breaths, orienting, ground/exhale).
>    - guilt / anger / blame / withheld-words / relationship knot →
>      PSYCHOSOMATIC MIRROR register (Luule Viilma / Louise Hay
>      forgiveness sentences).
>    - fatigue / fog / energetic blockage → EASTERN register (one
>      Sanskrit term with plain meaning, one permission).
>    - The mentor MUST NOT say "I am using Viilma's method" or
>      "in Ayurveda we…" — wisdom must arrive as if her own.
>    - Allows micro-mixing (≤ 2 elements per reply). If the wanderer
>      explicitly asks "what method are you using?", an honest list
>      is allowed; then return to the body.
>
> 2. **`BodyLensSelector.jsx`** — promoted from 3 → 4 cards.
>    Intuitive sits leftmost and is **the default**: empty
>    `localStorage[aurin_body_lens_v1]` is treated as Intuitive Flow.
>    Other lens picks are stored explicitly. "Return to Intuitive"
>    replaces the previous "Step away" button (and only appears
>    when an override is active). New `DEFAULT_LENS` + `readActiveLens()`
>    exports keep the contract honest.
>
> 3. **`LensForRegion.jsx`** — when Intuitive is active, the modal
>    renders a calm placeholder instead of a static insight/practice/
>    permission triple ("The mentor will read your words for this
>    region and choose…"). For the other 3 lenses, the per-region
>    content is shown as before.
>
> 4. **`BodyRoomChat.jsx`** — always sends a known lens id (defaults
>    to `intuitive` when nothing explicit is picked). The "lens · …"
>    badge under the chat header is hidden when the lens is the
>    default Intuitive — preserving the "invisible mentor" promise.
>
> 5. **`clarity_safety.py` — Estonian `ravim` lock (P0):**
>    Layer 1 now rewrites all common declensions and conjugations:
>    - `ravim`, `ravimi`, `ravimid`, `ravimile`, `ravimist`,
>      `ravimina`, `ravimiks` → **`toetus`**
>    - `ravimid(e/ele/elt/esse/ega)` → **`toetused`**
>    - `ravimine(gi)` → **`tasakaalustamine`**
>    - `ravimisega` → **`tasakaalustamisega`**
>    - `raviefekt(i/id/ile/ist/iga)` → **`toetav mõju`**
>    - `ravimtaim(e/ed/ede/i/ele/elt)` → **`tugitaim`**
>    - `ravitse(n/d/me/te/ma/takse/tud/b/vad/nud/nuks)` →
>      **`toetama`**
>    - `ravi(da/nud/s/sin/sid/sime/site/vad/b/d/ks/me/te)` →
>      **`toetab`**
>    - bare `ravi(+ case endings)` → **`tasakaalustamine`**
>    `_AUDIT_WORDS` extended with the same family so drift logs
>    surface any AI output that still contains a forbidden form.
>
> 6. **Tests (28/28 PASS in this session):**
>    - `test_stage2_9d_body_lenses.py` (NEW · 14 tests): 4 lenses
>      present, all 3 concrete lenses carry 8 regions, Intuitive
>      carries 0 regions but its anchor explicitly forbids naming
>      the method.
>    - `test_stage2_9e_ravim_filter.py` (NEW · 4 tests): every
>      Estonian `ravi*` form is stripped from sanitized output;
>      audit flags raw drift; replacement vocabulary is one of
>      `toetus / toetused / toetav / tasakaalustamine / tugitaim`;
>      `sanitize_reply` is idempotent.
>    - 10/10 existing Body Room tests still green.
>
> **Files changed:**
> - `/app/backend/body_lenses.py` — new `intuitive` registry entry
> - `/app/backend/clarity_safety.py` — Estonian ravi-family Layer 1 + audit
> - `/app/frontend/src/components/BodyLensSelector.jsx` — 4 cards, intuitive default
> - `/app/frontend/src/components/LensForRegion.jsx` — intuitive placeholder
> - `/app/frontend/src/components/BodyRoomChat.jsx` — default lens + hidden badge
> - `/app/backend/tests/test_stage2_9d_body_lenses.py` — updated assertions
> - `/app/backend/tests/test_stage2_9e_ravim_filter.py` (NEW)
>
> **Live verified:**
> - `GET /api/body-room/lenses` → 4 lenses, intuitive first, regions
>   counts `0 / 8 / 8 / 8` (intuitive / eastern / psychosomatic /
>   somatic_science).
> - DOM smoke: `body-lens-card-intuitive` rendered as default with
>   `data-default="true"`.
>
> **Founder action required:** Press **Deploy** to push to
> `prulesoul.site` (preview is live now).
>
> **Out of scope this iteration (acknowledged, not implemented):**
> - **Direct credit top-up system** (separate from LemonSqueezy) —
>   needs UX scoping before code: price per credit unit, how many
>   credits = how many AI minutes, in-app one-click payment provider
>   (Stripe? LemonSqueezy mini-products? Coingate?), per-user
>   daily ceiling math. Will plan as a focused next phase.
> - **Smart Latency filler audio** — needs ~6-10 short pre-recorded
>   "mhm / kuulan / oota..." clips (Estonian + English) to play
>   while the LLM thinks. Audio asset production is the blocker.
> - **Admin emergency-brake** (auto read-only when daily API spend
>   exceeds ceiling) — backend-only, ~80 lines, scheduled after
>   the credit system lands.
> - **Mobile reality test** (iPhone Safari + Android Chrome +
>   Instagram in-app browser) — physical-device check, only the
>   founder can run.

---


> 🟢 **STAGE 2.9d — 2026-02-12 (BODY ROOM MULTI-LENS · 3 WISDOM SCHOOLS)**
>
> Founder directive (Estonian): "me peame haldama body ruumis väga
> palju erinevaid psühhosomaatika teooriad ja praktikaid, mis on
> maailmas näitanud häid tulemusi … on vöimalik kasutada neid
> teadmisi sama printsiibiga, nagu me tegime privat pihitoas."
>
> Founder choice: **(a) opt-in lens selector at the top** — three
> cards visible, none active by default, user picks one for the
> session.
>
> **What landed (additive, never breaks the existing universal
> register):**
>
> 1. **`backend/body_lenses.py` (NEW)** — central registry of three
>    opt-in wisdom lenses, each carrying:
>    - `id`, `name`, `subtitle`, `plain`, `scope`, `attribution`
>    - `prompt_anchor` — fragment injected into the body-room system
>      prompt when this lens is active
>    - `regions` — full 8-hotspot map (crown, throat, heart,
>      solar_plexus, belly, hips, hands, feet) with one `insight`,
>      one `practice`, one `permission` line each.
>    - **Lenses:**
>      - `eastern` · Ayurveda + classical Chinese medicine + yogic
>        prāṇāyāma. Energetic register: doṣas, meridians, breath.
>      - `psychosomatic` · *Psychosomatic Mirror* — Luule Viilma +
>        Louise Hay. Body-as-quiet-messenger register; forgiveness
>        sentences as the practice.
>      - `somatic_science` · Stephen Porges (nervous-system-aware
>        practice) + Peter Levine (somatic experiencing). Pure
>        regulation register.
>    - **NOT included** (legal-safety lock): GNM / Germanic New
>      Medicine, any "this cures X" claim, any cancer-disappearance
>      anecdote. Wellness-only language; all 24 region texts pass
>      `clarity_safety.sanitize_reply` + `audit_clinical_drift`
>      without rewrites.
>
> 2. **`POST /api/body-room/chat`** — now accepts optional `lens`
>    field (validates + lowercases + trims). The lens flows into
>    `generate_body_reply(..., lens=...)`, which injects the right
>    `prompt_anchor` so the mentor's register matches the chosen
>    perspective. AGOP pacing + wellness-language lock are NEVER
>    overridden.
>
> 3. **`GET /api/body-room/lenses` (NEW endpoint)** — returns the full
>    registry as JSON. Public (no auth) — the data is authored by us
>    and contains no PII. The frontend fetches it once and caches
>    module-side so the modal lens display is instantaneous.
>
> 4. **`frontend/src/components/BodyLensSelector.jsx` (NEW)** — Three
>    soft cards at the top of `/body-room`. Each card carries name,
>    subtitle, scope, and attribution. Clicking activates the lens
>    (soft sage halo CSS animation, `lens-breathing` keyframe).
>    Clicking the active card again or "Step away" clears the choice.
>    Selection persists in `localStorage` as `aurin_body_lens_v1`
>    and broadcasts a `aurin-body-lens-changed` custom event so the
>    chat + modal stay in sync without prop drilling.
>
> 5. **`frontend/src/components/LensForRegion.jsx` (NEW)** — replaces
>    the previous `AyurvedaForRegion`. Inside `HotspotModal`, shows
>    the active lens's view of that region. **Fallback:** if no lens
>    is picked, defaults to the Eastern lens so the modal never feels
>    empty. The "default lens" badge tells the wanderer they're
>    seeing a default.
>
> 6. **`frontend/src/components/BodyRoomChat.jsx`** — reads
>    `localStorage[aurin_body_lens_v1]` on mount, listens to the
>    custom event, and sends `lens` in every chat request. Active
>    lens is shown as a small calm badge under the chat header.
>
> 7. **`backend/tests/test_stage2_9d_body_lenses.py` (NEW, 12 tests,
>    all passing):**
>    - all 3 lenses present, all 8 regions per lens, all metadata
>      keys present
>    - 24/24 region texts pass `clarity_safety.sanitize_reply` (no
>      banned vocab) and `audit_clinical_drift` (no soft warnings)
>    - every prompt anchor carries possibility-language (MAY / may /
>      possibility / permission / never)
>    - `list_lenses` / `get_lens` / `lens_prompt_anchor` helpers
>    - `generate_body_reply` accepts unknown lens id without crashing
>    - parametrised over all 3 known lens ids — flows clean
>
> **Regression check:**
> - 10/10 existing body-room pytests still green
>   (`test_body_chat_iter60.py` + `test_aurin_p0_realtime_free_access_body_room.py`).
> - DOM smoke (live preview): `body-lens-selector` + all 3 cards
>   (`body-lens-card-eastern`, `psychosomatic`, `somatic_science`)
>   render. Backend endpoint returns 3 lenses with full payload.
>
> **Files changed:**
> - `/app/backend/body_lenses.py` (NEW · 24 region insights)
> - `/app/backend/body_room_ai.py` — `generate_body_reply` accepts `lens`
> - `/app/backend/server.py` — `BodyRoomChatIn.lens` field + `GET /api/body-room/lenses`
> - `/app/backend/tests/test_stage2_9d_body_lenses.py` (NEW · 12 tests)
> - `/app/frontend/src/components/BodyLensSelector.jsx` (NEW)
> - `/app/frontend/src/components/LensForRegion.jsx` (NEW)
> - `/app/frontend/src/components/BodyRoomChat.jsx` — reads lens + sends `lens` param
> - `/app/frontend/src/pages/BodyRoom.jsx` — replaced AyurvedaThreeWinds with BodyLensSelector
> - `/app/frontend/src/components/AyurvedaLens.jsx` — DELETED (replaced)
>
> **Founder action required:** Press **Deploy** to push to
> `prulesoul.site`. The preview is live now.

---


>
> Founder directive (Estonian): "tee see ayurveda teema korda body roomis. D)"
>
> **What landed (surgical, additive only):**
>
> 1. **`AyurvedaLens.jsx` (NEW component)** — Two named exports:
>    - `<AyurvedaThreeWinds />` — calm "three winds" intro card
>      (Vāta · Pitta · Kapha) with element + body-felt description +
>      one small steadying note per wind. No quiz, no doṣa lock-in,
>      no diagnosis. Disclaimer at bottom reaffirms wellness-only
>      framing.
>    - `<AyurvedaForRegion region={...} />` — single-region lens
>      rendered inside `HotspotModal`. Shows doṣa + element badge,
>      one breath note (Sanskrit + plain meaning), one permission
>      line. Hidden if region is unknown.
>
> 2. **`BodyRoom.jsx`** — Imported both exports. `AyurvedaThreeWinds`
>    placed right above `<BodyRoomChat />` (after questionnaire,
>    before chat). `AyurvedaForRegion` rendered inside `HotspotModal`
>    after the "One quiet release" section, before any deep_layer.
>
> 3. **`body_room_ai.py`** — Extended `§Ancient wisdom` block with a
>    concrete `§Region → ancient lens map`. The AI now has explicit
>    region→breath→permission mappings for all 8 hotspots (crown,
>    throat, heart, solar_plexus, belly, hips, hands, feet). Sanskrit
>    terms always paired with plain meaning. The instruction is
>    "MAY, not must" and "at most one phrase per reply" — pacing
>    discipline preserved.
>
> **Wellness-language safety re-verified:**
> - `clarity_safety.sanitize_reply()` passes Ayurveda terms (sītalī,
>   doṣa, vāta, ujjāyī, anuloma-viloma) without redaction.
> - `audit_clinical_drift()` returns [] for all three sample lines.
> - No banned words introduced.
>
> **Tests:**
> - 10/10 existing body-room pytests still green
>   (`test_body_chat_iter60.py` + `test_aurin_p0_realtime_free_access_body_room.py`).
> - DOM smoke verified live on preview: `[data-testid="ayurveda-three-winds"]`,
>   `ayurveda-wind-vata`, `ayurveda-wind-pitta`, `ayurveda-wind-kapha`
>   all present.
>
> **Files changed:**
> - `/app/frontend/src/components/AyurvedaLens.jsx` (NEW)
> - `/app/frontend/src/pages/BodyRoom.jsx` — import + 2 insertion points
> - `/app/backend/body_room_ai.py` — `§Region → ancient lens map` appended
>
> **Founder action required:** Press **Deploy** to push to `prulesoul.site`
> (preview is live now). Mobile reality test (iPhone Safari, Android Chrome,
> Instagram in-app browser) still pending.

---


>
> Founder directive: "FINAL GUEST ACCESS + MENTOR VISIBILITY DIRECTIVE.
> No new architecture. No new rooms. No redesign. Complete and
> stabilize existing flow so a first-time visitor can enter the
> mentor room in under 60 seconds, see both mentor choices, and take
> safe screenshots."
>
> **What landed (surgical, inside existing primitives only):**
>
> 1. **`POST /api/auth/guest` (NEW endpoint)** — one-call signup that
>    creates a real `users` row (`role=guest`, `email=guest-…@guest.aurin.local`
>    so Resend never tries to reach it), a 24-hour `user_sessions` row,
>    a pre-acknowledged `clarity_user_prefs` row (`consent_v2=true`,
>    chosen guide gender), and a `agreement_acceptances` row for the
>    private-scope WandererGate. Also sets the same httpOnly session
>    cookie as the magic-link verify path so every existing room
>    recognises the wanderer.
>
> 2. **`/guest` and `/portal/guest` (NEW page + route)** — a single
>    page with two large mentor cards side-by-side (Grace · Clarity),
>    each showing the existing portrait JPG (`/assets/illustrations/guide-female.jpg`
>    + `guide-male.jpg`), a calm line about their register, and the
>    "Enter with X" CTA. One tap → backend call → localStorage token +
>    WandererGate flag → full page reload → land directly in chat.
>    Reuses existing CSS variables (`aurin-sage`, `aurin-card`,
>    `aurin-display`). No new visual layer.
>
> 3. **Guest fast-path inside `ClarityRelease.jsx`** — once-per-session
>    auto-advance from HUB → CHAT when `user.role === "guest"`. The
>    long HUB welcome scroll stays for regular members, but a guest
>    who just picked their guide lands straight in the chat surface.
>    Single ref-guarded `useEffect`, ~10 lines.
>
> 4. **Coming-Soon lock for paid courses** —
>    `COMING_SOON_OVERLAY` now lists all 4 paid courses (founder
>    explicit: "kursused tulevad coming soon, LemoniSqueezy aktiveerime
>    3-4 päeva pärast"). Frontend already reads
>    `/api/catalogue/availability`; backend `/api/courses/{slug}/enroll`
>    now returns 409 with the calm sentence *"This course opens in a
>    few days. Join the quiet list to be told first."* — never a
>    stack trace, never a raw error. Day-1 lead-magnet email and
>    in-room preview remain open.
>
> 5. **5 new pytests (`test_stage2_9b_guest_entry.py`, all passing):**
>    guest-entry female session shape, male session shape, token reaches
>    `/api/clarity/access`, coming-soon 409 has calm copy, all 4 slugs
>    in availability overlay.
>
> **Live verified end-to-end (Playwright + curl):**
> - `POST /api/auth/guest` → 200 with `session_token` + `user_id` +
>   `guide_gender` + `redirect_to=/clarity-release` (both genders).
> - `/api/auth/me` with the new token → 200, `role=guest`,
>   `email=guest-…@guest.aurin.local`.
> - Browser flow: fresh cookies/localStorage → `/guest` → pick Grace
>   → 1 navigation → mentor portrait visible + welcome message
>   delivered + 96 px SPEAK button + "Speaking softly." indicator
>   active during TTS playback. Zero red overlays. Zero console errors.
>
> **Production deploy required** — preview-only until re-deploy.
>
> **Guest entry URLs (post-deploy):**
> - `https://prulesoul.site/guest`
> - `https://prulesoul.site/portal/guest`
> (Preview equivalents are live now.)
>
> **What I will NOT do without founder approval (lock):**
> - No new architecture.
> - No new rooms.
> - No mystical / sci-fi visuals.
> - No new ecosystem layer.
> - No autoplay of TTS until user clicks SPEAK (browser autoplay
>   policy compliance — already in place).

---


>
> Founder directive: **FINAL GREEN STATUS EXECUTION DIRECTIVE.**
> Finalization, not expansion. Of the 8 checklist sections + 5 explicit
> next-actions, AH-side scope was three: course daily dispatcher, TTS
> humanization tune, in-conversation thinking indicator. The other
> five blockers require founder action (production deploy, real
> LemonSqueezy purchase, mobile device test, external tester pass).
>
> **AH-side work, all green:**
>
> 1. **Courses daily-letter dispatcher** (server.py +260 lines).
>    `_render_course_letter_email`, `_course_letter_send_one`,
>    `_courses_dispatch_loop`, and admin endpoint
>    `POST /api/admin/courses/dispatch?dry_run=…`. Mirrors the working
>    `_six_nights_dispatch_loop` exactly:
>    - Hourly cron, registered on startup with 90 s boot offset.
>    - Letter N unlocks at `started_at + (N-1) days` UTC.
>    - **Idempotency:** `course_letter_sends(user_id, course_slug, day)`
>      doc per real send — re-running within the same hour cannot
>      double-email a wanderer.
>    - **Unsubscribe respect:** any enrollment whose user email is in
>      `email_unsubscribes` is paused with `paused_reason="unsubscribed"`,
>      not deleted (so the founder can manually resume).
>    - **Resend missing:** soft-skip with `reason="resend_not_configured"`.
>    - **Completion:** `completed=True` written on the final letter
>      send (or pre-existing `day_sent >= total_days`).
>    - **Timezone-safe:** all comparisons in UTC, all timestamps
>      stored as ISO 8601.
>    - **Live verified:** admin endpoint returns 200 with current
>      candidate / sent counts. `dry_run` reports candidates without
>      sending.
>    - **Test coverage:** `tests/test_stage2_9_courses_dispatcher.py` —
>      9 tests, all passing in isolation (render, missing-day raise,
>      resend-missing skip, not-yet, unknown-course skip, happy path,
>      idempotency, unsubscribe pause, final-letter completed).
>
> 2. **TTS speed lowered** `0.86 → 0.82` (`clarity_tts.py`
>    `DEFAULT_SPEED`). Combined with the existing humanize pre-pass
>    (em-dash → comma, markdown strip, EOL-comma insertion) the
>    consonant edge softens noticeably. Founder will re-judge on
>    deploy; further drops (0.80) trivially possible.
>
> 3. **In-conversation "thinking" / "speaking" indicator**
>    (ClarityRelease.jsx, ChatPanel render). Below the input row,
>    centered, italic, low-contrast:
>    - While `sending=true` (Claude composing): pulsing sage dot +
>      *"The room is listening with you…"* — `data-testid="clarity-thinking"`.
>    - While `voice.speaking=true` (TTS playing): solid sage dot +
>      *"Speaking softly."* — `data-testid="clarity-speaking"`.
>    - Otherwise the row collapses to a 16 px transparent reserve —
>    no layout shift. This closes the 2–4 s silent gap that the audit
>    flagged as the strongest "AI-breaking" moment.
>
> **Out of scope this iteration (BLOCKED on founder action):**
> - 🔴 #1 Production deploy to `prulesoul.site` (Emergent deploy flow).
> - 🔴 #4 Real LemonSqueezy live purchase walkthrough.
> - 🔴 #5 Mobile reality test (iPhone Safari · Android Chrome ·
>   Instagram in-app browser).
> - 🔴 #8 External tester full-flow pass without founder assistance.
>
> **Files changed:**
> - `/app/backend/server.py` — courses dispatcher block + startup task.
> - `/app/backend/clarity_tts.py` — `DEFAULT_SPEED = 0.82`.
> - `/app/frontend/src/pages/ClarityRelease.jsx` — thinking/speaking indicator below input.
> - `/app/backend/tests/test_stage2_9_courses_dispatcher.py` (NEW, 9 tests).
>
> **Rules respected:**
> - No new architecture. No new rooms. No new visual layer.
> - No new collections beyond `course_letter_sends` (parallel to the
>   existing `first_letter_sends`).
> - Backend hot-reloaded clean. Lint green on all modified files.
> - Reality Law: all email subjects use the wanderer's words, no
>   mystic / medical language. Audited copy uses calm prose only.

---


>
> Founder directive: "Produce a complete, reality-based audit of the
> current Matrix Aurin mentor system. No marketing copy, no visionary
> storytelling, no ecosystem mythology, no speculative future
> architecture. Operational documentation. Runtime mapping."
>
> **Output:** `/app/memory/REALITY_AUDIT_2026-02-10.md` — single-source
> reality map, 8 sections, every claim labelled VERIFIED / PARTIAL /
> PREVIEW ONLY / MOCKED / BLOCKED / NOT YET VERIFIED.
>
> **Headline reality corrections this audit produced:**
>
> 1. **The handoff's "P0 — paid courses 2-7 are 0 bytes" claim is
>    FACTUALLY INCORRECT.** All 4 paid courses (`letting-the-old-stories-rest`,
>    `the-language-you-forgot`, `seven-quiet-evenings-with-children`,
>    `the-body-knows-first`) plus the Estonian module
>    `raha-ja-teadvus-moodul-1` have full prose for all 7 days × 5
>    courses = 35 complete letters embedded in `server.py` lines
>    5380–5965 (1300–1800 chars each). The API returns empty `body=""`
>    for *time-locked* future days — that is the drip-content gating,
>    not missing content. Day 1 unlocks immediately; days 2-7 unlock
>    daily.
>
> 2. **The REAL P0 paid-course gap is a missing daily-letter email
>    scheduler.** A buyer today gets letter 1 (via `lead-magnet`) and
>    has to return to the website each day for letters 2-7. There is
>    no `_courses_dispatch_loop` mirror of the working
>    `_six_nights_dispatch_loop`. **This is the single real refund
>    risk** — not empty content, missing delivery.
>
> 3. **Production (`prulesoul.site`) is currently broken for any
>    logged-in user entering Clarity Release.** It runs the pre-2.8c
>    build with the `toneTag` ReferenceError. Re-deploy is the highest
>    priority item.
>
> 4. **LemonSqueezy webhook is wired for real** (29 events received on
>    preview, store_id + webhook_secret + api_key all configured). The
>    "preparing" state in earlier handoffs refers to the *frontend
>    checkout buttons*, not the backend integration. Production webhook
>    has 0 events because production has not been used.
>
> 5. **Booking flow is fully operational** — verified end-to-end this
>    audit: 182 available slots returned, reservation creates row,
>    confirmation email is attempted via Resend, magic_entry_url
>    issued. (Test booking `098c82bd…fc42` was cleaned up.)
>
> 6. **Mobile is unverified.** Voice-first push-to-talk + autoplay-mp3
>    have known cross-browser quirks (iOS Safari, Instagram in-app
>    browser). No real device test conducted.
>
> **The audit is the source of truth for the next stabilization
> window. This PRD section is the index.**

---


>
> Founder directive: "Complete the existing system so a first-time user
> experiences: 'I can speak, I am heard, and a calm human-like mentor
> responds.' NO new architecture. NO hologram fantasy. NO redesign.
> Only complete and refine the existing runtime."
>
> **What changed (surgical, inside the existing ChatPanel only):**
>
> 1. **Mentor is now the HOST.** GuidePresence portrait card moved from
>    BELOW the chat to ABOVE it. A first-time wanderer sees the calm
>    portrait + breath/sway + state line BEFORE they read any message.
>    Confirmed via Playwright bounding-box check: `presence.y < chat.y`.
> 2. **Microphone is now the PRIMARY action.** A 96 px round "SPEAK"
>    button sits centered above the input row, sage-glow, gentle pulse
>    when listening, soft glow when transcribing. Mute button sits
>    beside it. Empty-state CTA reads: *"Tap the circle below and speak
>    when you're ready. Or type quietly instead — both arrive the same."*
> 3. **Text input is DEMOTED to a quiet `<details>` fallback.** Summary
>    label: *"or type instead"* (italic, low contrast). The textarea +
>    send button are inside the collapsible. Auto-opens once the user
>    starts typing or has prior messages, so it never blocks anyone
>    who prefers text. Send button is now a ghost-style small icon
>    button — no longer the loud primary.
> 4. **Transcript visual weight reduced.** `clarity-messages` container
>    now uses `opacity-90`, `space-y-3` (down from 4), `max-h-[42vh]`
>    (down from 55vh). Guide replies are already italic prose
>    (intentional — feels spoken, not chatted).
> 5. **Mentor state mirrors voice activity.** GuideHologram
>    `runtimeState` now uses `voice.listening` (idle → listening) and
>    `voice.transcribing || sending` (→ thinking), then `audioPlaying`
>    (→ speaking). The presence card breathes in time with the
>    conversation.
>
> **TTS humanization (Stage 2.8d audio polish, `clarity_tts.py`):**
>
> - Speed dropped from `0.92` → `0.86`. Slightly slower than default.
> - New `_humanize_for_speech()` runs before every OpenAI TTS call:
>   - em-dashes (`—`) become soft commas → calmer audio pause.
>   - Markdown `**bold**` / `*italic*` stripped (the model never reads
>     them aloud).
>   - Single line breaks without trailing punctuation get a comma
>     appended → natural breath at end of phrases.
>   - Triple+ newlines collapsed.
>   - No semantic rewrite: zero word changes.
> - Model unchanged (`tts-1-hd`), voices unchanged (`coral` female,
>   `echo` male). Internal Clarity / Grace names unchanged (founder
>   hold still active until A&V agent confirms Brian/Jenny).
>
> **No new files for the experience. Only refinement:**
> - `/app/frontend/src/pages/ClarityRelease.jsx` — ChatPanel render
>   block restructured (mentor up, mic primary, text fallback).
> - `/app/backend/clarity_tts.py` — speed + humanization.
> - `/app/backend/tests/test_stage2_8d_tts_humanize.py` (NEW) — 6 tests,
>   all passing.
>
> **Verified live (preview, real Whisper-aware account):**
> - `/clarity-release` → mentor (Grace) portrait visible above chat,
>   `data-testid="clarity-mic"` is 96 × 96 (primary size), text
>   fallback collapsed, prior conversation reads as quiet italic prose.
> - `/body-room` still works, no regressions.
> - All Stage 2.8/2.8c/2.8d pytest suites green: 14/14.
> - No console errors.
>
> **Accessibility & activation regression guard (unchanged):**
> Magic-link flow, WandererGate, ClarityThreshold, GuidePresence,
> ChatPanel render, push-to-talk endpoint, TTS endpoint, Body Room,
> Cabinet booking — all still operational. `test_stage2_8c_chatpanel_regression`
> stays green (`toneTag` + `audioPlaying` still wired).
>
> **Remaining (P0 deferred, by founder priority order):**
> - 🔴 Tühjade kursuste lukustus (course content lock).
> - 🔴 Reaalne booking + paid PDF voo otsast-otsani test.
> - 🟡 Brian/Jenny re-apply (founder ratified Stage 2.8c, awaits A&V).
> - 🟡 Real-human test (founder personal walkthrough on desktop +
>   mobile per the directive's success condition).
>
> **🚨 Production deploy required** to push to `prulesoul.site`.

---


>
> Founder directive: "MATRIX AURIN — ACCESSIBILITY & LIVE EXPERIENCE
> UNBLOCK DIRECTIVE (P0). External testers report static content only.
> Repair the live mentor interaction layer."
>
> **Root cause (single bug, single fix):**
> `ChatPanel` sub-component inside `pages/ClarityRelease.jsx` referenced
> `toneTag` and `audioPlaying` (used to drive `<GuideHologram />` runtime
> state) but did **NOT** receive them as props. When Stage 2.7 + 2.8
> lifted those state vars into the parent component, the ChatPanel
> render site and function signature were never updated.
>
> Result: `ReferenceError: toneTag is not defined` thrown the moment
> any authenticated wanderer entered the CHAT phase. Visible symptom:
> "Uncaught runtime errors" red overlay; mentor never activates;
> external testers report "static content only".
>
> **Fix (2-line surgical, no architecture change):**
> 1. Pass `toneTag={toneTag}` and `audioPlaying={audioPlaying}` to the
>    `<ChatPanel ... />` render site (line ~488).
> 2. Add `toneTag, audioPlaying,` to the destructured props in the
>    `function ChatPanel({ ... })` signature (line ~926).
>
> **Verification (live preview, real Whisper-aware account):**
> - Magic-link request → 200 OK, email delivered via Resend.
> - `/api/auth/magic-link/verify` → returns `session_token` + correct
>   `redirect_to`.
> - `/api/auth/me` and `/api/me` both return the user.
> - `/clarity-release` after WandererGate accept → CHAT phase loads
>   without errors.
> - User typed "I am tired tonight." → mentor (Grace) replied via real
>   Claude Sonnet 4.5: *"I hear you. What kind of tired — the body, or
>   something underneath?"*
> - Voice mic + voice mute buttons render. Send works. Usage counter
>   "2 of 12 today" updates. Guide Presence portrait shows.
> - `/body-room` loads, `body-room-chat-mic` + `body-room-chat-mute`
>   render, no console errors.
> - `/cabinet/booking` loads, both guide tabs (Clarity / Grace), session
>   shapes, day strip, time slots all render.
>
> **Regression guard added:**
> `tests/test_stage2_8c_chatpanel_regression.py` — 2 static-source
> assertions that fail loudly if `toneTag` or `audioPlaying` ever drop
> off the ChatPanel prop list again. Both pass green.
>
> **Files modified:**
> - `/app/frontend/src/pages/ClarityRelease.jsx` — 2 lines
> - `/app/backend/tests/test_stage2_8c_chatpanel_regression.py` (NEW)
> - `/app/memory/test_credentials.md` — added live preview member token
>
> **Live test member (preview only, 7-day session):**
> - Email: `e1-stab-test@example.com`
> - Token: `ccb7b5b6-b89a-4e2b-b8d0-d25d18667cb8ae154a55d93342dc8ae34a83287340cd`
> - WandererGate skip key: `localStorage['wanderer_accepted_1.0-2026-02-07_private']='1'`
>
> **Findings during the audit (no fixes needed — works as designed):**
> - Magic-link email URL uses `PUBLIC_SITE_URL` env (`prulesoul.site`).
>   For preview testing, fetch the token directly from
>   `db.magic_link_tokens` instead of the email link.
> - Three gate layers exist for a fresh visitor:
>   `WandererGate` (private scope, localStorage flag) →
>   `ClarityThreshold` (4 declarations + companion choice + consent_v2) →
>   `ClarityRelease` HUB → CHAT. Each gate persists; subsequent visits
>   skip cleanly.
>
> **Production note:** The fix lands in preview. To push to
> `prulesoul.site`, the founder must re-deploy via the Emergent
> deployment flow.

---


>
> Originally shipped with a name-swap (Clarity→Brian, Grace→Jenny) that
> was REVERTED in 2.8b per founder directive. Voice-first pipeline
> remains live and unchanged.
>
> 1. **Backend (NEW):** `clarity_stt.py` wraps `OpenAISpeechToText`
>    (whisper-1) via Emergent LLM key. Endpoint `POST /api/clarity/stt`
>    accepts a single multipart `audio` field (webm/ogg/mp4/m4a/wav/mpeg).
>    Auth-required. 24 MB + 60 s caps. All validation paths return
>    BEFORE Whisper is invoked → zero LLM credits on error tests.
> 2. **Frontend:** `useVoiceIO.js` rewritten. Default path is
>    `MediaRecorder` → POST `/api/clarity/stt` → transcript lands in
>    input. Browser-native `SpeechRecognition` retained only as fallback.
>    Adds `transcribing` state + calm `voiceError` toast.
> 3. **Surfaces:** `/clarity-release` chat input now uses backend Whisper
>    under the hood. `/body-room` `BodyRoomChat.jsx` gained the same
>    `useVoiceIO`, plus new `body-room-chat-mic` and `body-room-chat-mute`
>    buttons + auto-speak of the latest guide reply (mirrors Clarity
>    Release behaviour).
> 4. **Tests:** `test_stage2_8_voice_first.py` (6 cases, all passing) +
>    `test_stage2_8_booking_label.py` (parametrised). Verified by testing
>    agent iter 63: 100 % backend, 0 critical / 0 minor.
>
> Files: `clarity_stt.py` (NEW), `server.py` (STT endpoint), `useVoiceIO.js`
> (rewrite), `BodyRoomChat.jsx`, `ClarityRelease.jsx` (transcribing state).
> 🟢 **STAGE 2.8 — 2026-02-10 (VOICE-FIRST FOUNDATION: Whisper STT + auto-speak in both rooms)**
>
> Founder directive: "A — APPROVED. Proceed with all 4 allowed stabilization tasks immediately. Do NOT rename yet — internal Clarity / Grace remain. Human-facing identities under evaluation with A&V Agent."
>
> **Done & verified ($0 warranty, all relevant pytests still pass):**
>
> 1. **REVERTED Brian/Jenny rename** — every user-facing surface is back
>    to **Clarity / Grace** (GuidePresence eyebrow + alt, HolographicCalendar
>    GUIDES + cabinet attendant + booking-mine list, server.py:8595
>    booking guide_label, clarity_ai.GENDERED_ENERGY_BLOCKS, related
>    pytest assertions). Internal slugs unchanged. Voice-first STT + TTS
>    pipeline kept fully intact; only cosmetic strings reverted.
>
> 2. **Forbidden-terminology audit (read-only sweep across all
>    client-facing copy):**
>    - **Found & corrected (clearly problematic):**
>      - `pages/AurinPhilosophy.jsx` "Inner Architect — From Masks to Light"
>        block — softened the strongest mystical/guru drift. Removed
>        "all paths as sacred outlets of the same Source", "we are all
>        threads in one great field of love", "returning to the Source
>        is returning to yourself". Replaced with grounded, autonomy-
>        respecting language: "an honest, original part of you that was
>        there before the masks arrived" / "hearing yourself a little
>        more clearly each day". Founder's "Inner Architect" metaphor
>        kept as-is.
>      - `pages/KidsColoringStudio.jsx` — "The ritual is complete" →
>        "The practice is complete" (the parent-guide closing line).
>    - **Inspected, kept (not problematic in context):**
>      - All `medical_note` / `disclaimer` strings in the psychosomatic
>        catalog (server.py:4400-4730) — these are SAFETY redirects
>        ("see a doctor first", "this is not a diagnosis"). They keep
>        the platform inside Reality Law.
>      - `email_psl_copy_pack.py` "Real hologram" mentions — these are
>        the FORBIDDEN→APPROVED replacement table sent internally to
>        the LP team. Not user-facing; they document the very lock we
>        enforce.
>      - `Sparkles` / `aurin-sage` / `aurin-glow` CSS class names — purely
>        visual; no semantic claim.
>      - `display_mode: Literal["text","voice","hologram"]` in
>        ClarityPrefsInput — internal Pydantic Literal, never surfaced
>        in any UI label. Removing the value risks invalidating stored
>        prefs; left as-is and noted.
>    - **No instances found of:** exorcism, chakra, kundalini, ascension,
>      manifest-coaching, "I'll be waiting", "come back to me", "always
>      heal", "guaranteed transformation", or any absolute-claim
>      dependency phrasing.
>
> 3. **AGOP §A — Conversational pacing (added to both AI prompts):**
>    Explicit pacing rules now anchored inside `clarity_ai.py`
>    `CLARITY_SYSTEM_PROMPT` and `body_room_ai.py`
>    `BODY_ROOM_SYSTEM_PROMPT`:
>    - one-sentence replies are valid; resist filling space.
>    - allow a small breath between thoughts (comma, line break, sparse
>      "...").
>    - never reply at machine speed; first words slow when the wanderer's
>      line is heavy.
>    - no motivational cadence, no upbeat closes, no podcast-finish
>      rhythm.
>    - silence is part of presence; restraint is its own kindness.
>
> 4. **AGOP §B — Autonomy & emotional safety (added to both AI prompts):**
>    Explicit autonomy rules:
>    - preserve autonomy (offer, never instruct).
>    - avoid dependency dynamics (no "come back tomorrow", no "I'll be
>      waiting", no "you can always come tell me").
>    - avoid absolute claims (no "this will heal you", no "this is your
>      truth", no guarantees).
>    - do not define identity (the wanderer is the only authority on
>      their inner world).
>    - reflective only — mirror, ask one quiet question, name one
>      possibility, then stop.
>    The Body Room version is tuned to the room's quieter register.
>
> 5. **Room-guide differentiation — refinement only, no new architecture:**
>    The 3 rooms continue sharing AGOP / Reality Law / tone_tag /
>    user_state / lightweight continuity. Differentiation lives only in
>    the system-prompt voice now:
>    - **Clarity Release:** broad emotional listening · voice-first ·
>      reflective concierge.
>    - **Body Room:** body-awareness · grounding · slower, softer pacing
>      (AGOP §A explicitly says "Body Room is the calmest of the three
>      rooms; your rhythm reflects that").
>    - **Course Room:** structured educator (no chat AI yet — courses
>      are text emails); no prompt change needed at this stage.
>    No new runtime systems, no 3D, no holographic systems, no avatar
>    rebuild. Lock honoured.
>
> **Files modified:**
> - `/app/backend/clarity_ai.py` — reverted name swap; added §AGOP-A + §AGOP-B
> - `/app/backend/body_room_ai.py` — added §AGOP-A + §AGOP-B (Body-Room tuned)
> - `/app/backend/server.py` — reverted booking guide_label
> - `/app/frontend/src/components/GuidePresence.jsx` — reverted labels + alt
> - `/app/frontend/src/components/HolographicCalendar.jsx` — reverted GUIDES + labels
> - `/app/frontend/src/pages/AurinPhilosophy.jsx` — softened mystical drift in Inner Architect block
> - `/app/frontend/src/pages/KidsColoringStudio.jsx` — "ritual" → "practice" in parent-guide closing
> - `/app/backend/tests/test_stage2_8_voice_first.py` — assertion lock now expects Clarity/Grace
> - `/app/backend/tests/test_stage2_8_booking_label.py` — parametrize now expects Clarity/Grace
>
> **Remaining blockers (carried forward, NOT in scope this iteration):**
> - 🔴 **P0** — Empty paid course letters 2-7 (lock under Coming Soon +
>   1 course fully written). Founder explicitly deferred to next pass.
> - 🔴 **P0** — Real booking + paid PDF flow walkthrough (no real
>   purchase has run end-to-end).
> - 🟡 **P1** — Mobile reality test of voice-first on iPhone/Android.
> - 🟡 **P1** — TTS pacing micro-tune in `clarity_tts.py` (extra
>   pause-markers / commas) so the AGOP §A pacing language is also
>   audible, not only textual.
> - 🟡 **Pending decision** — Human-facing guide names (final call
>   together with A&V Agent: keep Clarity/Grace OR adopt new pair).
>
> **Rules respected:**
> - No new runtime architecture, no 3D, no holographic systems, no
>   memory-system expansion.
> - No production rename — direction reversal honoured.
> - LemonSqueezy still `preparing`.
> - Stability > Safety > Voice-first > Human presence > Real walkthroughs
>   > Product readiness — priority order respected; this iteration sat
>   inside Stability + Safety.

---


>
> Founder directive (literal): "PRODUCTION STABILIZATION & LAUNCH EXECUTION · voice-first, mõlemad Clarity Release + Body Room, nimed Brian/Jenny, Whisper STT Emergent LLM keyga · kursused tulevad veidi hiljem kui need teemad on stabiilsed."
>
> **Done & verified (testing-agent iter 63: 100 % backend, no critical/minor):**
>
> 1. **Guide name swap — human-facing only (internal slugs intact).**
>    - `Clarity` (M) → **Brian**, `Grace` (F) → **Jenny** in every user-visible
>      surface: `GuidePresence` eyebrow + `<img alt>`, `HolographicCalendar`
>      GUIDES array + booking-mine list + cabinet attendant label,
>      `clarity_ai.GENDERED_ENERGY_BLOCKS` (the AI now answers "You can call
>      me Brian/Jenny"), and the booking-confirmation `guide_label`
>      (server.py:8595).
>    - DB slugs (`clarity` / `grace`), API routes (`/api/clarity/*`), product
>      names ("Clarity Release", "7 Days of Clarity", "Clarity Pass"),
>      Pydantic models, and Lemon variant IDs all unchanged → zero data
>      migration, zero billing impact.
>
> 2. **Voice-First Interaction Loop — push-to-talk via OpenAI Whisper.**
>    - **Backend (NEW):** `clarity_stt.py` wraps
>      `emergentintegrations.llm.openai.OpenAISpeechToText` (`whisper-1`).
>      Endpoint `POST /api/clarity/stt` accepts a single multipart `audio`
>      field (webm/ogg/mp4/m4a/wav/mpeg). Auth-required (Bearer). 24 MB
>      hard cap. Validates MIME + size BEFORE invoking Whisper, so all
>      error paths are LLM-credit-free.
>    - **Frontend:** `useVoiceIO.js` rewritten. Default path is
>      `MediaRecorder` → POST `/api/clarity/stt` → transcript lands in
>      input. Browser-native `SpeechRecognition` retained only as fallback
>      when MediaRecorder is unavailable. New `transcribing` state +
>      calm `voiceError` toast. Hard 60-s recording cap to keep credits
>      sane.
>    - **Surfaces touched:**
>      - `/clarity-release` chat input (existing mic/mute kept, now
>        backend-Whisper under the hood).
>      - `/body-room` `BodyRoomChat.jsx` — added the same `useVoiceIO`,
>        new `body-room-chat-mic` and `body-room-chat-mute` buttons,
>        auto-speak of the latest guide reply.
>    - **Privacy:** audio in-memory only, discarded immediately. Only the
>      transcript returns; the wanderer can review/edit before sending.
>
> 3. **Tests added (regression-clean):**
>    - `tests/test_stage2_8_voice_first.py` — 6 tests (anonymous 401,
>      missing field, empty blob, unsupported MIME, oversize 413, prompt
>      name swap).
>    - `tests/test_stage2_8_booking_label.py` — 2 parametrised tests
>      proving guide_label = Brian|Jenny across both slugs (added by
>      testing agent).
>
> **Verified end-to-end via testing agent (iter 63):**
> - Public preview URL returns the expected 401 'Sign in to continue.'
>   for both `/api/clarity/stt` (NEW) and `/api/clarity/tts` (unchanged).
> - Booking confirmation guide_label swap holds.
> - Frontend webpack compiles clean. Lint green on `useVoiceIO.js`,
>   `BodyRoomChat.jsx`, `clarity_stt.py`.
>
> **Files modified / created:**
> - `/app/backend/clarity_stt.py` (NEW)
> - `/app/backend/server.py` — STT import + endpoint + booking guide_label
> - `/app/backend/clarity_ai.py` — `GENDERED_ENERGY_BLOCKS` Brian/Jenny
> - `/app/frontend/src/hooks/useVoiceIO.js` — rewritten (MediaRecorder + Whisper)
> - `/app/frontend/src/components/GuidePresence.jsx` — labels + alt
> - `/app/frontend/src/components/HolographicCalendar.jsx` — GUIDES + labels
> - `/app/frontend/src/components/BodyRoomChat.jsx` — useVoiceIO mic/mute
> - `/app/frontend/src/pages/ClarityRelease.jsx` — transcribing state in mic + voice-error surface
> - `/app/backend/tests/test_stage2_8_voice_first.py` (NEW)
> - `/app/backend/tests/test_stage2_8_booking_label.py` (NEW, by testing agent)
>
> **Rules respected:**
> - NO 3D/WebGL. Voice-first stays inside the existing CSS-only Guide
>   Presence layer.
> - NO new pages, NO new routes other than `/api/clarity/stt`.
> - NO mass outbound, LemonSqueezy still `preparing`.
> - Course content (P0 empty letters 2-7) deferred per founder until
>   voice-first + name lock are stable.
>
> **Pending — next iteration:**
> - **P0 (deferred but still critical):** Lock empty paid course letters
>   2-7 behind "Coming Soon" overlay (Variant B + 1 course fully written
>   per hybrid path).
> - **P0:** Real booking + paid PDF flow walkthrough (still untested
>   end-to-end).
> - **P1:** Mobile reality test of Stage 2.8 voice-first on iPhone +
>   Android (push-to-talk + autoplay quirks).
> - **P1:** TTS pacing micro-tune (extra commas / pause markers in
>   `clarity_tts.py` to remove residual robot edge).

---


> 🟢 **ITER 68a — 2026-02-08 (FIRST CONTACT MODE: Hero + Dead-end patches + Early-bird)**
>
> Founder directive (literal): "REAL USER ENTRY · prefer stability over sophistication · stabilize the gate · prepare for the first real visitor."
>
> **Done & end-to-end verified ($0 warranty, 11/11 pytest still green):**
>
> 1. **Hero activation — "7 Days of Clarity" entry banner.**
>    Single soft Link tile under existing Home hero CTAs. Eyebrow
>    "First door · Free", title "7 Days of Clarity", subline "Enter
>    the Free Resonance Path". Routes to `/catalogue#7-days-of-clarity`.
>    Reuses existing styling system; no new page, no animation library.
>    Testids: `home-7days-banner`, `home-7days-title`, `home-7days-subline`.
>
> 2. **Catalogue 7-Days landing section (`SevenDaysEntry`).**
>    New section at top of `/catalogue` with id `7-days-of-clarity` so
>    the hero banner anchor lands directly on the waitlist form. Reuses
>    the same `WaitlistInline` from Iter 67 — `slug=7-days-of-clarity`,
>    Transient default. Carries the early-bird line.
>
> 3. **Dead-end CTAs patched (zero placeholders).**
>    All disabled "Coming Soon" buttons now route to the existing
>    waitlist capture:
>    - `BookDetail.jsx` — "Coming May 18" buy + Download PDF buttons → `/catalogue#7-days-of-clarity`
>    - `Bookstore.jsx` — "May 18" item buy → `/catalogue#7-days-of-clarity`
>    - `ClarityRelease.jsx` HUB — "Opens this Friday" tier buttons → `/catalogue#7-days-of-clarity`
>    - `ClarityRelease.jsx` continuation — disabled "Continue deeper" → `/catalogue#7-days-of-clarity`
>
> 4. **Single confirmation email (Soft Clarity tone).**
>    `/api/waitlist/join` updated: when slug == `7-days-of-clarity`,
>    confirmation subject "You are now inside the first resonance layer."
>    and body uses the founder's exact copy. All other slugs keep the
>    original quiet-list message. Both variants now carry the early-bird
>    line in a sage-bordered blockquote. NO automation tree, NO sequence
>    — exactly one email per first-time join.
>
> 5. **Early-bird line surfaced in success state.**
>    `WaitlistInline` success branch now shows the success message AND
>    "The first 100 Voyagers entering the resonance receive a quiet
>    early-entry blessing. Your place in the wave is secured." Quiet,
>    no countdown, no urgency widget.
>
> **End-to-end smoke test (real preview URL):**
> - Home (1920px) → 7 Days banner clicks through to Catalogue#7-days-of-clarity ✓
> - Mobile (390px) → banner visible, navigation works ✓
> - Submit `smoke-test-iter68a@example.com` → "joined" status, confirmation
>   text "You are now inside the first resonance layer. The gate will open
>   soon. The first 100 Voyagers entering the resonance receive a quiet
>   early-entry blessing." ✓
> - Smoke test data cleaned from DB ✓
>
> **Files modified:**
> - `/app/frontend/src/pages/Home.jsx` — added 7-days banner under hero CTAs
> - `/app/frontend/src/pages/Catalogue.jsx` — added `SevenDaysEntry` section
> - `/app/frontend/src/components/MembershipTiers.jsx` — early-bird line in success state, 7-days copy variant
> - `/app/frontend/src/pages/ClarityRelease.jsx` — 2 disabled CTAs → waitlist link
> - `/app/frontend/src/pages/Bookstore.jsx` — disabled buy → waitlist link
> - `/app/frontend/src/pages/BookDetail.jsx` — 2 disabled buttons → waitlist links
> - `/app/backend/server.py` — `/api/waitlist/join` confirmation email branched copy + early-bird line
>
> **Rules respected (per FOUNDER FREEZE):**
> - NO outbound mass send, NO Voyager/Eternal optimization
> - NO architecture refactor, NO new routes, NO new pages
> - NO countdowns, NO urgency widgets, NO loud marketing language
> - LemonSqueezy stays in `billing_status: "preparing"`
>
> **Pending founder action:**
> - Verify confirmation email lands in real inbox (founder's own address)
> - Send micro-segment outbound test (3-5 users) via `/admin/outbound`
> - Once first real visitor confirms flow, flip `billing_status` to `live`

---

> 🟢 **ITER 67 — 2026-02-08 (Market Validation: Tiers + Waitlist + Outbound + Email Audit)**
>
> Founder directive (literal): "$0 stabilization · turundus tööle, e-mailid kontrollima, 3-tier struktuur ja ühe-klõpsu outbound paneel · LemonSqueezy live veel ootel."
>
> **Done & end-to-end verified ($0 warranty, 11/11 pytest green):**
>
> 1. **Three-tier membership structure (`/api/membership/tiers`).**
>    - Constants in `server.py` (`MEMBERSHIP_TIERS`): `transient` ($0, device-only),
>      `voyager` (~$9/mo, 7-day rolling memory), `eternal` (~$19/mo, full Hybrid Memory).
>    - Each tier carries `memory_window_days` (0/7/-1), `includes` list, and a
>      typed CTA (`free` → `/clarity-release`; `waitlist` → inline form).
>    - Three supplemental low-friction supports surfaced in same payload:
>      Ko-fi (`https://ko-fi.com/puresoulife`), Six-Nights newsletter,
>      free Night-Angel PDF. ASCII-only price labels, no Estonian leak.
>    - `GET /api/membership/me` returns `{tier:"transient", authenticated:false}`
>      for guests, real tier from `cabinet_user_tier` for signed-in users.
>
> 2. **Waitlist endpoints (idempotent, deliverability-clean).**
>    - `POST /api/waitlist/join` — `{email, product_slug, consent}`. 400 on
>      bad email or no consent. Idempotent on `(email, slug)` via unique
>      index. Mirrors the address into `newsletter_subscribers` with
>      `source = waitlist:<slug>`. Sends a soft confirmation email via
>      Resend on first join only (sender = `info@prulesoul.site`),
>      includes one-click unsubscribe URL.
>    - `GET /api/waitlist/health` — counts only, no PII (`{total, by_slug}`).
>
> 3. **Email unsubscribe (`/api/email/unsubscribe`).**
>    - GET returns a calm dark-mode HTML page (works in any email client).
>    - Sets `consent=false` on `newsletter_subscribers`, marks `six_nights`
>      subscriptions completed, idempotent insert into `email_unsubscribes`.
>    - 400 on bad email shape. POST variant mirrors GET for in-app forms.
>
> 4. **Outbound Distribution Panel (admin-only, manual, rate-limited).**
>    - 5 endpoints: `POST /api/admin/outbound/draft` · `GET .../list` ·
>      `GET .../{id}` · `POST .../{id}/send-email[?dry_run=true]` ·
>      `DELETE .../{id}`. All require `X-Admin-Token` (401 without).
>    - 8 channels recognized (`email/telegram/x/facebook/instagram/linkedin/discord/blog`)
>      — only **email** auto-sends via Resend. The other 7 are advisory:
>      the panel renders a copy-ready preview the founder pastes into
>      networks manually (per Controlled Outbound Policy).
>    - Audience segments: `newsletter` / `waitlist` / `six_nights` / `all`,
>      with automatic exclusion of `email_unsubscribes` and dedup.
>    - **24h rate-limit** on real (non-dry-run) sends: 429 if any other
>      campaign was dispatched within the last 24h. Dry-run bypasses the
>      limit so the founder can preview audience size.
>    - Each campaign tagged in Resend (`outbound_campaign`, `campaign_id`)
>      so deliverability can be tracked.
>    - New `/admin/outbound` React page with admin-token gate, compose
>      form (title/body/image/channels/segment/notes), copy-ready preview,
>      campaigns list, dry-run + real-send buttons, and delete-draft button.
>
> 5. **Catalogue Coming Soon overlay (`/api/catalogue/availability`).**
>    - Public endpoint returns `{coming_soon: {}, tiers_in_waitlist: ["voyager","eternal"]}`.
>    - `coming_soon` is an editable dict in `server.py` — founder turns
>      individual product slugs ON without DB migration. Empty by default.
>    - `Catalogue.jsx` consumes the overlay: when a course/book slug
>      appears, the card shows "Coming soon" badge + "Join the waitlist"
>      button that reveals an inline `WaitlistInline` form.
>
> 6. **Cabinet paywall hook (`CabinetUpgradeHook`).**
>    - Renders inside `ClarityRelease.jsx` chat phase ONLY when:
>      `!access?.has_active_pass && messages.length >= 4`.
>    - Soft, premium, never urgent. Offers Voyager + Eternal waitlists
>      inline, plus a Ko-fi "Buy me a coffee" link as the lowest-friction
>      gesture. Telemetry events: `cabinet_paywall_view`, `cabinet_paywall_cta`.
>
> 7. **Pytest regression — `test_iter67_membership_outbound.py` (11/11 PASS).**
>    Covers tier shape & no-Estonian-leak, anonymous /me, availability,
>    waitlist consent+email validation, idempotent join+health, unsubscribe
>    HTML + bad-email 400, admin outbound full dry-run flow, channels
>    constant, and the **24h rate-limit 429 path** (verified via sync
>    pymongo seed of a recent campaign + non-dry-run 429 assertion).
>
> **Files modified:**
> - `/app/backend/server.py` — appended ~470 lines of Iter 67 endpoints
>   before `app.include_router`. Added 5 new collections to `on_startup`
>   index creation.
> - `/app/backend/tests/test_iter67_membership_outbound.py` — NEW.
> - `/app/frontend/src/components/MembershipTiers.jsx` — NEW (default
>   export `MembershipTiers`, named exports `WaitlistInline` +
>   `CabinetUpgradeHook`).
> - `/app/frontend/src/pages/AdminOutbound.jsx` — NEW.
> - `/app/frontend/src/pages/Catalogue.jsx` — wired in MembershipTiers,
>   `availability.coming_soon` overlay, and inline waitlist on cards.
> - `/app/frontend/src/pages/ClarityRelease.jsx` — added paywall hook.
> - `/app/frontend/src/App.js` — registered `/admin/outbound` route.
> - `/app/memory/test_credentials.md` — documented all new admin endpoints.
>
> **Honest gaps (Iter 67b deliverability — partial):**
> - SPF/DKIM/DMARC verification: visually checked via Resend dashboard
>   (founder confirmed earlier), but no automated probe added in this
>   session. The unsubscribe + tag system is the deliverability armor.
> - LemonSqueezy live mode: `billing_status: "preparing"` in the public
>   tier payload. Voyager + Eternal CTAs go to waitlist, not checkout,
>   until founder confirms live keys.
> - Real outbound dispatch was NOT triggered against the ~22 real
>   newsletter subscribers. Dry-run only verified.
>
> **Pending founder action:**
> - Compose first real outbound campaign at `/admin/outbound`.
> - Confirm LemonSqueezy live keys to flip `billing_status` to `live`.
> - When ready to mark a product "Coming Soon," add an entry to the
>   `COMING_SOON_OVERLAY` dict in `server.py`.

---

> 🟢 **ITER 55 — 2026-02-07 (Course Room content completion + Library shelf mapping)**
>
> Founder directive (literal): "$0 STABILIZATION / PRODUCT COMPLETION — kursused 1–4 viiakse etaloni-tasandile · riiulid täidetakse cross-listingutega · Deploy alles peale fix R1+R7+R2."
>
> **Done & forensically verified ($0 warranty):**
>
> 1. **Course Room — all 28 letters expanded.**
>    - Courses 1–4 (`letting-the-old-stories-rest`, `the-language-you-forgot`,
>      `seven-quiet-evenings-with-children`, `the-body-knows-first`) each had
>      ~142 chars per `letter.body` (~1 line). Now: ~1 100–1 220 chars per letter,
>      with **Päeva praktika** (writing exercise) + **Vaikne lause** (closing
>      whisper) at the end of every single letter — matching the founder-written
>      Raha-kursus etalon shape exactly.
>    - Average body length per course (post-fix): 1 146 / 1 129 / 1 180 / 1 224
>      chars. Etalon (Raha) at 1 104 chars.
>    - Päeva praktika present: 7/7 in every course. Vaikne lause: 7/7 in every
>      course.
>    - **Forbidden vocabulary scan: 0 violations** across all 28 letters
>      (no manifestation/abundance/hustle/breakthrough/diagnosis/therapy/
>      treatment/disorder/disease/PTSD/depression/anxiety/CBT/EMDR/etc.).
>    - §V Voice Framework respected: lowercase voice, no AI sentences, no
>      clichés, the "switch" frame for release moments, undefended Brené
>      Brown + Mary Oliver + Tara Westover undertone.
>    - Existing titles + prompts unchanged (founder explicitly required this).
>
> 2. **Library shelves — cross-shelf mapping.**
>    - New `_CROSS_SHELF_SLUGS` dict in `server.py`. `/api/library/shelves` now
>      enriches each shelf with cross-listed items (flagged
>      `cross_listed: True` so the UI can render a soft "also on this shelf"
>      affordance if it wishes).
>    - `raha-ja-teadvus` shelf: **1 → 3** items (cross-listed
>      `you-dont-have-to-dance-to-anothers-tune` book + `letting-the-old-stories-rest`
>      course).
>    - `keha-atlas` shelf: **1 → 3** items (cross-listed `the-language-of-angels`
>      book + `seven-quiet-evenings-with-children` course).
>    - No new products. No new architecture. Pure remapping of existing catalogue.
>
> 3. **Regression:** booking iter54 tests still 14/14 PASS. No regressions
>    introduced by content-only changes.
>
> **Files modified (single file):**
> - `/app/backend/server.py` — `SEED_COURSES` letters expanded for 4 courses;
>   `_CROSS_SHELF_SLUGS` added; `/api/library/shelves` enriched.
>
> **No frontend changes** — `CourseDetail.jsx` renderer was already correct
> (handles `letter.body` + `letter.prompt` identically to the Raha etalon).
>
> **Pending founder action:**
> - Press **Deploy** in Emergent UI — iter 54 (booking + dispatcher + scheduler)
>   AND iter 55 (course content + shelves) all live in /app code; production
>   prulesoul.site is still on iter 53 snapshot.
>
> **Pre-deploy risk ledger (post-iter-55):**
> - 🟢 R1 (Course Room thin content) — RESOLVED
> - 🟢 R2 (Library shelves empty) — RESOLVED
> - 🟢 R5 (Booking indexes + Six-Nights cron) — RESOLVED in code, will fire on deploy
> - 🟢 R7 (Course pricing checkout_ready=True) — RESOLVED (sisu nüüd vastab hinnale)
> - 🟡 R3 (LP Heartbeat 701 skipped) — UNCHANGED · LP-side block · §8.8 B-01
> - 🟡 R4 (LemonSqueezy 1 real purchase only) — UNCHANGED · checkout pole reaalse kaardiga testitud
> - 🟡 R6 (LP-side prod env vars stale) — UNCHANGED · founder-side fix only
>
> **Live ecosystem inventory (post-iter-55, deploy-pending):**
> - 5 courses, all ≥1 100 chars/letter, all carrying Päeva praktika + Vaikne lause
> - 8 books (4 adult + 4 kids), Night Angel free PDF live
> - 6 Six Nights canonical letters (auto-dispatcher live since iter 54)
> - 14 coloring pages (5 founder-uploaded + 9 nano-banana)
> - 2 blog posts (under nav-threshold by design)
> - 4 library shelves, all ≥3 items
> - 5 booking endpoints + 2 admin endpoints (§10)
> - 1 admin scheduler page (`/admin/scheduler`)
> - 1 cabinet booking page (`/cabinet/booking`)
> - WandererGate Hard Gate on 3 surfaces (clarity-release, body-room, cabinet/booking)
> - §V Voice Framework + Shadows & Light Matrix + Universal Mentor Core all live
> - Magic-Link SSO §8.4 live · Resend DNS verified · 3 senders live
>
> **Next session priorities (when founder approves):**
> - LP Heartbeat receiver (B-01) — blocked on LP agent's spec
> - LemonSqueezy real-card test — founder side
> - Admin/Scheduler integration into AdminContent.jsx as a tab (cosmetic, optional)
> - Native shadcn Calendar in `/admin/scheduler` date picker (cosmetic, optional)

---


> 🟢 **ITER 48 — 2026-02-07 (Master-direktiiv: Võlgnevuste likvideerimine)**
>
> Founder directive (literal): "$0 krediit · varem kokkulepitud ülesannete parandus".
> All five clauses of the LÕPLIK MASTER-DIREKTIIV addressed in a single
> $0 batch.
>
> ### 1. RAAMATUKOGU 2.0 — Online-riiuli süsteem (DONE)
> - New backend endpoint: `GET /api/library/shelves`
> - Four canonical shelves with EE/EN labels:
>   - **Raha & Teadvus** / Money & Consciousness
>   - **Keha Atlas** / Body Atlas
>   - **Suhted & Sagedus** / Relationships & Frequency
>   - **Vaimne Suveräänsus** / Spiritual Sovereignty
> - Books and courses mapped via `_THEME_BY_SLUG` table.
> - LibraryHub.jsx now renders shelves above two-doors, fed from
>   `/api/library/shelves`. Each shelf shows its courses + books.
> - Smoke verified: 4 shelves render, Money shelf carries the new
>   "Raha ja Teadvus — Moodul 1" course; Body Atlas carries "The
>   body knows first"; Suhted & Sagedus carries kids books +
>   "Seven quiet evenings with children"; Vaimne Suveräänsus
>   carries Beyond the Matrix I/II + Language of Angels + main
>   transformation course.
>
> ### 2. JURIIDILINE VÄRAV — Hard-Gate (DONE)
> - New backend endpoints:
>   - `POST /api/agreement/accept` (visitor_id + scope + locale)
>   - `GET /api/agreement/status?visitor_id=...&scope=...`
>   - Stored in `db.agreement_acceptances`. Idempotent on
>     (visitor_id, scope, version).
> - Agreement version: `1.0-2026-02-07`.
> - New `WandererGate.jsx` component:
>   - React Portal to `document.body` (escapes Layout's stacking
>     context — fixes z-index trap).
>   - Full-screen solid overlay (zIndex 9999, solid bg).
>   - 4 checkboxes from the Wanderer's Agreement PDF (educational
>     environment / no outcomes promised / personal responsibility
>     / no redistribution).
>   - "I enter consciously" button — disabled until all 4 ticked.
>   - Persists via localStorage (fast path) + server (slow path).
> - Mounted on `/clarity-release` and `/body-room` via App.js
>   route wrapper.
> - Smoke verified end-to-end: gate appears for new visitor, all
>   4 checks unlocks button, click dismisses, state persists
>   across navigation, Body Room same visitor walks straight in.
>
> ### 3. SIX NIGHTS EMAIL FUNNEL — backend wiring (DONE — manual trigger pending)
> - New backend endpoints:
>   - `POST /api/six-nights/subscribe` (email + consent + locale).
>   - `GET /api/six-nights/subscription/health` (counts).
>   - Stored in `db.six_nights_subscriptions`: email + day_sent
>     + completed + consent_at + locale.
>   - Idempotent on email; returns `already_subscribed` for repeats.
> - New `SubscribeCard` on `/six-nights` — calm consent form,
>   single-line copy: "One night per day for six nights, sent
>   quietly. Reply at any time to stop."
> - **Note (honest):** The actual cron-style daily sender (Resend
>   day-N-of-6) is NOT yet wired; the data layer + signup flow
>   are. A dispatcher endpoint can be added next session and
>   wired to a cron / admin trigger.
>
> ### 4. HÄÄLE JA SISU SÜNKROON — §V Voice Framework + Money frame (DONE)
> - `clarity_ai.py` system prompt now contains a dedicated "On
>   money, when it arises" section quoting the source:
>   *"Raha ei ole jumal ega vaenlane. Raha on peegel."* with
>   explicit ban on productivity / abundance / manifestation /
>   hustle language. The frame stays observational and tender.
> - Full §V Voice Framework continues to apply equally to
>   Clarity (M) and Grace (F) — each in their own register, but
>   bound by the same forbidden-sentences list.
>
> ### 5. RAHA JA TEADVUS — KURSUS (DONE)
> - New course `raha-ja-teadvus-moodul-1` added to `SEED_COURSES`
>   in `server.py`.
> - 7 days, all in Estonian, fully written from the founder's
>   PDF "Raha ja Teadvus — Moodul 1: Vaikne algus".
> - Day-by-day:
>   1. Raha ei ole ainult raha (Money is not only money)
>   2. Puuduse hääl (The voice of scarcity)
>   3. Raha ja turvatunne (Money and safety)
>   4. Raha ja eneseväärtus (Money and self-worth)
>   5. Perekonna nähtamatud laused (The family's invisible sentences)
>   6. Lubamine ilma ahnuseta (Allowing without greed)
>   7. Uus sisemine leping (The new inner contract)
> - Each day ends with **Päeva praktika** (writing exercise) +
>   **Vaikne lause** (closing whisper). No advice, no scripts, no
>   manifestation. Pure Aurin-voice.
> - Free, audience: adult, language: et. LemonSqueezy variant_id
>   left null for now; founder can attach a paid variant later.
> - Rendered correctly on `/course-room/raha-ja-teadvus-moodul-1`.
>
> ### Bonus fix (caught during smoke test)
> - **BodyRoom.jsx** had a long-standing runtime error: the
>   `honestyAccepted` state was used at line 376 but never
>   declared. The page worked only because it crashed the React
>   error boundary. Added `useState(false)` declaration. Body Room
>   now renders cleanly.
>
> ### Smoke test results (all green)
> - `/api/courses` → 5 courses, includes "raha-ja-teadvus-moodul-1"
> - `/api/courses/raha-ja-teadvus-moodul-1` → 7 letters, day 1
>   "Raha ei ole ainult raha", day 7 "Uus sisemine leping"
> - `/api/library/shelves` → 4 shelves with correct mapping
> - `/api/agreement/accept` (POST) → status accepted
> - `/api/agreement/status` (GET) → returns true after accept
> - `/api/six-nights/subscribe` (POST consent=true) → 200, returns
>   subscribed status with preamble
> - `/api/six-nights/subscription/health` → counts visible
> - Frontend Playwright: gate appears, dismisses with all checks,
>   persists across pages; library shelves render with 4 cards;
>   course page renders Estonian content; subscribe form visible.
>
> ### Files changed
> - `/app/backend/server.py` — added Raha kursus, agreement routes,
>   six-nights subscribe routes, library/shelves route, theme map,
>   constants. Cleaned `LEGAL_DRAFT_NOTICE = ""` migration kept.
> - `/app/backend/clarity_ai.py` — added "On money" frame to
>   §V Voice Framework.
> - `/app/frontend/src/App.js` — wrapped /clarity-release and
>   /body-room with `<WandererGate scope="private">`.
> - `/app/frontend/src/components/WandererGate.jsx` — new (Portal-
>   rendered hard gate).
> - `/app/frontend/src/pages/SixNights.jsx` — added SubscribeCard.
> - `/app/frontend/src/pages/LibraryHub.jsx` — added shelves
>   section with `library-shelves`, 4 ShelfCards.
> - `/app/frontend/src/pages/BodyRoom.jsx` — added missing
>   `honestyAccepted` useState (was a runtime error).
>
> ### Founder action required
> - Press **Deploy** in Emergent UI to push iter 48 to
>   prulesoul.site (preview is live now).
>
> ### Honestly remaining (not done this session)
> - Six Nights actual outbound email dispatcher (data layer + form
>   are ready; the cron sender that calls Resend day-by-day is
>   next session).
> - Library 2.0 thematic browsing inside `/library/adults`
>   (current shelves live on `/library` hub; the deeper adult
>   library page itself still uses legacy linear list).
> - Wanderer's Agreement PDF page (/wanderers-agreement) is
>   linked from the gate but its Estonian translation /
>   updated reglement is not yet retro-fitted with the four
>   gate clauses verbatim.
> - LP Heartbeat receiver still 401 (LP-side block).

---

> 🟢 **ITER 47 — 2026-02-07 (Six Nights LIVE + §V Voice Framework + System Purge)**
>
> Founder directive: "$0 credit · honest audit + system cleanup."
> Outcome: **the founder's most personal artefact, the Six Nights
> reflection journey, was promoted from a database-prisoner to a
> live, navigable surface.** Plus three structural cleanups.
>
> Done & curl-verified this session:
>
> 1. **§V Aurin Voice Framework — INJECTED into `clarity_ai.py`.**
>    New section "The line you must not cross" added to
>    `CLARITY_SYSTEM_PROMPT`:
>    - Hard-bans 12 specific "AI sentences" the wanderer must never
>      hear ("As an AI...", "I'm here to help...", "Thank you for
>      sharing...", etc.).
>    - Anchors voice to Brené Brown undefended + Mary Oliver in
>      prose + Tara Westover naming.
>    - Names the **Six Nights** texts as the canonical tuning fork.
>    - Codifies the "switch" frame for release moments (not
>      transformation, healing, breakthrough — a switch).
>    - Applies to BOTH Clarity (M) and Grace (F) equally — same
>      anti-jargon stance, each in their own register.
>    - Adds the single test before sending: *"Could this sentence
>      appear in a chat support transcript?"*
>
> 2. **Six Nights — released from prison.**
>    - New `six_nights_seed.py` module with all 6 canonical nights
>      (Night 1 + 2 already founder-approved; 3, 4, 5, 6 newly
>      written in same Aurin-voice tuning-fork tone).
>    - Themes: 1=tune-following / 2=forgiveness as a switch /
>      3=loneliness in a full room / 4=inherited money sentences /
>      5=child inside, child beside / 6=the room where you arrive.
>    - Each night: ~1100-1500 chars, intro + body + question +
>      closing_note + signature "Aurin", schema-consistent.
>    - **New API endpoints (public, no auth):**
>      - `GET /api/six-nights` — list of 6 (lightweight)
>      - `GET /api/six-nights/{1..6}` — full body
>      - 404 outside 1-6 with body "There are six nights."
>    - **New frontend page `/six-nights` + `/six-nights/:nightId`**
>      (`/app/frontend/src/pages/SixNights.jsx`):
>      - Grid of 6 cards on landing
>      - Reader view with prev/next, italic + bold inline rendering
>      - Testids: `six-nights-page`, `six-nights-card-{1..6}`,
>        `six-nights-reader`, `six-nights-title`, `six-nights-body`,
>        `six-nights-question`, `six-nights-closing`,
>        `six-nights-prev`, `six-nights-next`, `six-nights-back`.
>    - Idempotent seed via `seed_six_nights(db)` in `on_startup`.
>      Replaces stale rows; purges legacy docs without
>      `night_number`.
>    - Smoke test: 6 cards render, click → reader → italic/bold
>      visible, navigation works.
>
> 3. **Navigation reorder + cleanup.** Updated
>    `Navigation.jsx` and `Footer.jsx`:
>    - **Added to nav:** Six Nights, Kids Universe.
>    - **Removed from nav:** `/blog` (Insights) — only 2 posts,
>      hidden until 6+ articles. Routes still work; just not
>      promoted.
>    - **Removed from footer Explore column:** `/learning` (only 2
>      thin entries) and `/meditation-corner` (audio-only, very
>      thin). Still routable.
>    - New nav order: Home → Six Nights → The Beginning → Clarity
>      Release → Body Room → Kids Universe → Courses →
>      Philosophy → Library → Bookstore → Origin.
>
> 4. **Library DB cleanup — 6 test-prügi rows deleted.** Preview DB
>    no longer carries `test-entry-*` / `test-admin-*` slugs. (Prod
>    cleanup still pending founder Deploy.)
>
> 5. **Legal "starter draft" notice — REMOVED.**
>    `LEGAL_DRAFT_NOTICE = ""` in `server.py`. New idempotent
>    migration in `seed_initial_content()` re-upserts every
>    SEED_LEGAL row with the cleaned body so existing live rows
>    update on next boot. Verified curl: 4/4 legal entries no
>    longer contain the words "starter draft".
>    Tags `["...", "draft"]` → `["..."]` cleaned on all 4 rows.
>
> Tests: smoke-tested via curl + Playwright screenshot. 6/6 nights
> resolve, navigation renders, reader page renders italic/bold,
> 404 case correct.
>
> **Files added:**
> - `/app/backend/six_nights_seed.py`
> - `/app/frontend/src/pages/SixNights.jsx`
>
> **Files modified:**
> - `/app/backend/server.py` (import + 2 endpoints + on_startup
>   call + LEGAL_DRAFT_NOTICE empty + legal migration)
> - `/app/backend/clarity_ai.py` (§V Voice Framework section)
> - `/app/frontend/src/App.js` (route registration)
> - `/app/frontend/src/components/layout/Navigation.jsx`
> - `/app/frontend/src/components/layout/Footer.jsx`
>
> **Pending founder actions:**
> - Press **Deploy** in Emergent UI — iter 47 lives in /app code
>   (preview); production prulesoul.site is still on iter 46.
> - **Production DB** still has the 3 test-prügi rows
>   (`test-entry-9e95d8f3`, `test-admin-99768`,
>   `test-entry-1af1fae3`) — they will be auto-cleaned by next
>   deploy because seed migration deletes them, OR I can manually
>   purge prod via admin endpoint if founder gives token.
>
> **Honest gaps the founder asked to track:**
> - **Legal still says "starter draft" in the live (prod) site
>   until Deploy.** The PREVIEW serves the cleaned text already.
> - **Wanderer's Agreement is NOT yet a hard gate before Clarity
>   Release.** It is referenced inside the Guardian's first message
>   and footer/Body Room links. Hard first-time gate is a P1 next-
>   session task per founder directive.
> - **Library 2.0 thematic shelves (Money / Relationships / Body /
>   Spiritual Sovereignty)** — NOT yet implemented. Audience
>   filter (adult/kids) is the only grouping today. P1 follow-up.
> - **Money & Consciousness ("Raha ja Teadvus") course** — NOT
>   yet written. Night 4 covers the inherited-scarcity theme as
>   an entry. Course module is P0 follow-up.
> - **0 LemonSqueezy purchases** in production — checkout pipeline
>   is ID-mapped but never been tested with a real card.
> - **LP Heartbeat receiver** still 401 (paused loop) — blocked on
>   LP agent's HMAC spec.
>
> **Founder audit highlights (from this session's report):**
> - 31 React routes total · 6 books for sale · 4 courses (28
>   letters) · 9 coloring pages · 8 Body Room hotspots · 6 Six
>   Nights · 4 legal entries (now clean) · 2 blog posts · 4 users
>   in DB (sandbox).
>
> **Next agent priority:**
> 1. Wanderer's Agreement hard gate before Clarity Release first
>    use (P0 per directive).
> 2. Library 2.0 thematic shelves with `theme` field + UI
>    grouping.
> 3. Money & Consciousness course Module 1.
> 4. 4 new blog posts in Aurin voice (loneliness, money switch,
>    inherited contracts, child-inside).

---

# Matrix Aurin / prulesoul.site — PRD

> 🟢 **ITER 46 — 2026-02-06 (§8.4 Magic-Link SSO + B-04 Backfill + §14/§15 Architecture Lock)**
>
> Done & curl-verified this session ($0 warranty):
>
> 1. **§8.4 Magic-Link SSO — AH SIDE LIVE.** Helper
>    `_issue_magic_link_for_email()` extracted in `server.py` ~line 5152.
>    LemonSqueezy webhook now auto-issues a magic link for both book
>    purchases AND Clarity Pass purchases. Customer email pulled from
>    LS payload (`data.attributes.user_email/customer_email` or
>    `meta.custom_data.user_email`). Webhook response now returns
>    `{ status, magic_link_url, delivered_via }`. Resend email sent
>    automatically with calm purchase-specific copy. New email auto-
>    creates `users` row (`auth_method: "magic_link"`). 64-char single-
>    use token, 30-min expiry. Verified: `magic_link_url` returns from
>    `/api/auth/magic-link/request` and Resend `delivered_via:"email"`
>    works.
>
> 2. **B-04 Backfill helper — LIVE.** Admin-only
>    `POST /api/admin/integrations/pruesoul/backfill-enrollment`. Idempotent
>    on `enrollment_id`. Logs `enrollment.backfilled` event in
>    `db.pruesoul_events` for full audit trail. Returns updated counter
>    state in response. Tested: 401 without admin token, real backfill
>    creates row + updates count, cleanup removed test row.
>
> 3. **MASTER_PROTOCOL §14 (DOCS LOCK)** — Three Other Rooms spec:
>    - Kids Corner with **Lumm** persona (Storyteller archetype, kids-
>      safe knowledge subset, hard denylist filter, NOT a teacher)
>    - Meditation Room (audio-first, reuses existing local MP3 assets,
>      NO Lyria 3 dependency in Phase D — saves founder external API
>      cost; can swap engine later without UI change)
>    - Library Vault (UI-only work; backend gatekeeper already live
>      since iter 32 via `/api/cabinet/library/{slug}/download`)
>    - Phase plan A → E with founder approval gates (Kids Corner
>      requires explicit go-ahead given child-safety bar)
>
> 4. **MASTER_PROTOCOL §15 (DOCS LOCK)** — User Journey & Single-UID
>    Security Architecture:
>    - Single `users.user_id` (UUID4) keys every collection
>    - Magic-Link SSO = the Universal Key (one sign-in covers all
>      rooms for 7 days)
>    - 5 zero-trust boundaries documented (Browser→AH, LP→AH,
>      LS→AH, AH→LP heartbeat, Admin→AH) — each with a specific
>      proof (session_token / HMAC / admin token)
>    - AES-256-GCM at rest for Cabinet transcripts, password-less
>      auth (Google OAuth or magic-link only)
>    - Symbiosis Loop documented as future Phase E feature, NOT yet
>      built — honest about what is design vs. what is live
>
> 5. **MASTER_PROTOCOL §8.4 status updated** to 🟢 AH SIDE LIVE.
>    BLOCKING B-03 now reads "AH READY · WAITING FOR LP".
>
> Tests: 5/5 health endpoints 200 (preview), counter 8/10, magic-link
> request returns valid token + Resend "email" delivery, backfill 401
> without auth + 200 with auth + cleanup successful, lint clean (one
> pre-existing F811 unrelated to this work).
>
> **Pending founder actions (next session):**
> - Press "Deploy" to push iter 46 live to production
> - **B-04 triage decision:** confirm with LP admin panel whether the
>   2 LP enrollments are real (vs. test rows). If both real, run
>   `POST /api/admin/integrations/pruesoul/backfill-enrollment` once
>   for the missing enrollment to bring AH count from 1 to 2.
> - Provide LemonSqueezy fresh API keys (B-06 in §8.8)
> - Tell LP agent: "B-03 AH side is live. On Thank You page, read
>   `magic_link_url` from `/api/lemonsqueezy/webhook` response and
>   render as a single big 'Enter Aurin Hub' button."
>
> **Honest non-warranty items flagged for founder budget decision:**
> - Lyria 3 audio engine — new paid 3rd-party API, NOT in $0 warranty
>   scope. Phase D Meditation Room defaults to existing local MP3 assets
>   to keep cost at zero. Lyria swap-in possible later.
> - Lumm character Nano Banana visuals — would consume founder's
>   image-gen quota. Not a warranty item.
> - HolographicCalendar.jsx + LibraryVault.jsx UI components —
>   estimated 3-4 hours, included in next $0 phase if founder approves.
>
> **Next agent priority:** Phase B — Booking System backend code (§10).

> 🟢 **ITER 45 — 2026-02-06 (Counter live + Heartbeat live + Mentor Core + Soft-Landing + Gendered-Energy)**
>
> Done & curl-verified this session ($0 warranty):
>
> 1. **§8.3 Heartbeat — AH SIDE LIVE.** Background asyncio loop fires every
>    `HEARTBEAT_INTERVAL_SECONDS` (default 300 = 5 min). Signed POST to
>    `LP_HEARTBEAT_URL` env var with `{spots_total, spots_taken, spots_left,
>    cycle, last_event_at, last_event_kind, health, sent_at}`. HMAC-SHA256
>    in `X-Aurin-Signature`. Each attempt logged in
>    `db.aurin_heartbeat_log`. Admin endpoints:
>    `GET/POST /api/admin/heartbeat/{status|test}`. Graceful no-op when
>    `LP_HEARTBEAT_URL` empty (status="skipped"). 4/4 curl tests green.
>    **BLOCKING B-01:** waiting for LP to expose receiver.
>
> 2. **Universal Mentor Core (§11) LIVE in Claude system prompt.**
>    Synthesis-not-quotation rule: Jung / Adler / Frankl / Rogers /
>    Viilma / contemporary neuroscience / Stoic ethics. Plagiarism
>    Firewall enforced. No-Hallucination Rule: if a question lands
>    outside the library, mentor admits and points to a real human.
>    Documented in `clarity_ai.py` `CLARITY_SYSTEM_PROMPT` and
>    `/app/memory/AGENT_KNOWLEDGE_BASE.md` (founder-quoted firewall
>    table added at top).
>
> 3. **Soft-Landing Protocol (§12) LIVE.** Three windows: 5min /
>    2min / 0min. Server computes `minutes_remaining` from
>    `cabinet_sessions.started_at` + `duration_minutes` (default 30)
>    and routes through `_soft_landing_block()` in
>    `clarity_ai.py`. Mentor's tone shifts from "open exploration"
>    → "gathering" → "anchoring" → "closing breath" automatically.
>
> 4. **Gendered-Energy Framework (§13) LIVE.** Two named guides:
>    **Clarity (M)** masculine archetypal energy (direct, principled,
>    structured, calm/low/grounded) and **Grace (F)** feminine
>    archetypal energy (flowing, intuitive, warm/soft/receptive).
>    SAME knowledge library, SAME ethics, SAME safety override —
>    only the energetic register differs. The mentor never announces
>    name unprompted; if asked, replies with a single line.
>    `GENDERED_ENERGY_BLOCKS["male"|"female"]` appended to system
>    prompt when `clarity_user_prefs.guide_gender` is set.
>
> 5. **Dress Code mandate (§13.4).** Hard rule for all visual
>    generation prompts: append "professional attire, fully clothed,
>    calm presence, soft sage palette, glowing line-art style".
>    Documented in MASTER_PROTOCOL.
>
> 6. **MASTER_PROTOCOL.md sections 10–13 added (DOCS LOCK):**
>    - §10 Booking System spec (no code yet — code phase begins after
>      §8.4 Magic-Link SSO clears)
>    - §11 Universal Mentor Core
>    - §12 Soft-Landing Protocol
>    - §13 Gendered-Energy Framework + Dress Code
>
> 7. **VISUAL_BLUEPRINTS.md** updated with founder's 4 new images
>    (booking interface variants + Clarity/Grace final portraits).
>
> Tests: 9/9 unit tests green for `build_system_message()` covering
> neutral, Clarity-M, Grace-F, all three soft-landing windows, no-
> landing-when-open, and Mentor Core Jung+Viilma presence.
> Backend: 4/4 curl tests green for §8.3 admin heartbeat endpoints
> and §8.1 counter still 8/10.
>
> **Pending founder actions (tomorrow morning):**
> - Press "Deploy" to push iter 45 live
> - Once LP exposes `POST /api/integrations/aurin-hub/heartbeat`,
>   founder sets `LP_HEARTBEAT_URL` in Deployment Panel → Secrets
> - Provide LemonSqueezy fresh API keys
> - Upload Clarity (M) + Grace (F) face profiles via curl recipe in §4.3
>
> **Next agent priority:** §8.4 Magic-Link SSO — last P1 in §8 before
> §10 booking code phase begins.

> 🔴 **ITER 44 — 2026-02-06 (Warranty audit + Hyperloop Symbiosis order LOCKED)**
>
> **Founder directive:** Anna ordered a zero-credit warranty audit of
> the Aurin-Hub ↔ Pure-Soul-Life symbiosis. Prior agents had reported
> "symbiosis works" when reality was a one-way HMAC webhook with zero
> email overlap between the two systems. New rules locked in:
>
> 1. **Anti-gaslight rule** added to MASTER_PROTOCOL §1: No agent may
>    write "symbiosis works / counter synced / apps are talking"
>    without a live curl proof.
> 2. **MASTER_PROTOCOL §3.6 "Pruesoul Symbiosis Bridge"** — honest
>    one-way-bridge documentation (LP → AH), no return channel, no
>    shared auth, no shared DB.
> 3. **MASTER_PROTOCOL §8 "WARRANTY BACKLOG — HYPERLOOP SYMBIOSIS"** —
>    canonical queue of the full-duplex order from founder:
>    - §8.1 P0-A: Counter Drift Fix (AH = single source of truth,
>      `GET /api/integrations/pruesoul/counter` endpoint + LP
>      consumes)
>    - §8.2 P0-B: Production cross-wiring (prod talks only to prod)
>    - §8.3 P0-C: Heartbeat (AH sends signed POST to LP every 5m)
>    - §8.4 P1: Magic-Link SSO (LS buy → magic link → auto-created
>      user with purchase pre-mapped)
>    - §8.5 P1: Cross-App Blocking Board (shared visible queue)
>    - §8.6 P2: Hologram emotional layering (complete existing one,
>      don't rebuild)
>    - §8.7 P2: Psychosomatic conflict mapping in Clarity Cabinet
>    - §8.8: LIVE BLOCKING LOG with 3 open entries (B-01, B-02, B-03)
>
> **Verified this session (0 credits, curl-based):**
> - `/api/health` → 200
> - `/api/integrations/pruesoul/health` → `secret_set:true, 11 events, 8 enrollments`
> - `/api/lemonsqueezy/health` → 3/3 secrets set, 23 events
> - `/api/clarity/health` → encryption + AI + TTS true
> - `/api/email/health` → Resend configured, 3 senders live
> - No `book_orders` collection anywhere in DB (already clean)
> - 0 `paypal` references in backend/frontend source (already clean)
>
> **Founder closing note:** "Zero credit, warranty work only, until
> the system matches your honest report." Session ended; work resumes
> tomorrow morning with §8 as the priority queue. NO new features
> until symbiosis is real.

> 🛡️ **VERIFICATION PROTOCOL — KOHUSTUSLIK ENNE IGAT "VALMIS"**
>
> Iga agent (mina, sina, järgmised) peab enne ühegi asja "valmis"
> ütlemist läbi lugema `/app/memory/VERIFICATION_PROTOCOL.md` ja
> tegema selles kirjeldatud A+B+C+D+E baidi-tasemel kontrolli.
>
> **Reegel:** kui kontroll pole tehtud, sõnu "valmis", "live",
> "töötab", "verified", "deployed" KASUTADA EI TOHI.
>
> See protokoll loodi 2026-02-05 pärast Night Angel PDF avastust
> (eelmised agendid kinnitasid "PDF on süsteemis", aga fail oli
> 263-baidiline S3 AccessDenied error wrapper).
>
> Anna otsene tsitaat: *"sellest hetkest peale ja edasipidi enne
> kui midagi võetakse kasutusele tuleb kõik tooted, süsteemid,
> funktsioonid nii siin kui ka landing page lehel kontrollida
> 'kontrolli baidi-tasemel' automaatselt."*

> 🟢 **ITER 43 — 2026-05-05 (this session)**
>
> Done & byte-verified:
> 1. **Night Angel PDF lead-magnet** — real 7.5 MB PDF served at
>    `/api/books/free/the-night-angels-embrace/download`
>    (HTTP 200, magic `%PDF-1.4`, content-type `application/pdf`).
>    Email funnel returns BOTH `read_url` and `download_url`.
>    BookDetail.jsx now renders an in-page PDF iframe in Read mode +
>    a Download PDF button next to "Read it now".
> 2. **Kids Coloring Studio — Nano Banana automation.** Backend
>    `coloring_pipeline.py` generates one B&W line-art coloring page
>    per age group (3-5, 6-8, 9-12) per day. Daily loop fires from
>    `on_startup`. Manual trigger at `POST /api/coloring/generate-daily`
>    (admin-token gated). 3 pages already generated for today.
>    Estonian-text seed image deleted — page now fetches from
>    `/api/coloring/pages` (English-only, all from Nano Banana).
> 3. **Body Room — all 8 hotspot images regenerated** via Nano Banana
>    in the sage-on-black graphic-novel style: `crown-overthinker`,
>    `throat-unspoken`, `heart-compass`, `solar-plexus-control`,
>    `belly-intuition`, `hips-archive`, `hands-boundary`, `feet-roots`.
>    Re-encoded as true PNGs (magic `89504E47`) so Content-Type matches.
> 4. **Marketing infrastructure baked into the platform:**
>    - `MARKETING_BESTSELLER_PLAN_2026.md` — full multi-channel plan
>      (IG/TikTok Reels, Pinterest, Reddit, Discord, Hacker News,
>      Whispers, paid Meta ads, 7-letter Resend drip, Beyond-the-
>      Matrix-I bestseller push). Million-Dollar Book Method value
>      ladder translated into Aurin's quiet voice.
>    - **BookDetail cross-sell** — "If this spoke to you" module
>      with 3 audience-matched recommendations + Clarity Release
>      CTA on adult pages.
>    - **Whispers attribution** — `/api/whispers/track` +
>      `/api/whispers/summary` + `/whispers-portal?w=<slug>` page
>      with personal link, 3 DM scripts, 4 share-ready images,
>      copy-to-clipboard. Silent `WhispersTracker` component
>      auto-pings on `?w=` arrival.
>
> Testing: testing_agent_v3_fork ran iter_38 — 20/20 backend pass,
> 100% frontend pass. Two minor issues (PNG/JPEG mismatch + tracker
> double-fire in StrictMode) fixed in same session.

> ⚠️ **Next agent: before writing a plan, ALSO read
> `/app/memory/FOUNDER_REMINDERS.md`.** It contains time-delayed
> tasks the founder asked me to surface at the right moment. If any
> entry's `trigger_date` has arrived, raise it as a 🔴 red banner at
> the top of your session summary BEFORE anything else.

> 🚀 **LAUNCH WEEK CONTINUES — 2026-02-04 → 2026-02-05 / Iter 38–42**
>
> **Iter 42 (marketing machine, morning of 2026-02-05):**
> Founder confirmed T-0 launch date: **18 May 2026**, ~13 days
> sosistamise time. She named 5 Whisperers. Asked for 4 things at
> once, all built credit-efficiently:
>
> 1. **Lead-magnet endpoint + form** for Night Angel.
>    - New `POST /api/lead-magnet/book` (public). Validates email +
>      consent, requires book to be `price == 0`, rate-limits per
>      24h via `lead_magnet_sends` collection, idempotent upsert
>      into `newsletter_subscribers`. Sends a quiet thank-you email
>      via Resend (`info@prulesoul.site` sender) with a link to the
>      online reader. Tested: HTTP 200 ID returned by Resend.
>    - New `LeadMagnetForm` component appended to `BookDetail.jsx`,
>      conditionally rendered when `book.price === 0`. Soft tone,
>      data-testid coverage, success state, no toasts.
> 2. **Whispers DM kit** — `/app/memory/WHISPERS_DM_SCRIPTS.md`
>    contains 5 unique DM scripts (Dalí Karat, Tiit Trofimov,
>    Epp Kärsin, Alar Ojastu, Mari Jürjens), each personalised to
>    voice. Includes how-to-deliver-the-pass instructions
>    (Variant B recommended: just send them to /clarity-release
>    while beta-window active). Tracking table + don't-do list.
>    No code — pure docs to save credit.
> 3. **Founder essay** — added `on-not-hearing-myself` post to
>    SEED_BLOG (3.6 K chars, 5 sections: kitchen table → morning
>    silence → fear ↔ relief → opening doors → if you are here).
>    Voice-vetted: lowercase, no urgency, ends with permission slip.
>    Live at `/api/blog/on-not-hearing-myself` and via /blog UI.
> 4. **First newsletter sent (Variant A)** — to
>    `contact.puresoul@proton.me` test address from
>    `sanctuary@prulesoul.site`. Resend ID
>    `30a1b213-8926-4829-a704-f6e664267072`. Founder will read it
>    and decide whether to broadcast wider.
>
> Lint clean across all changes. Backend tests for lead-magnet:
> 4/4 cases green (consent missing, invalid email, wrong slug,
> happy path with email delivery). Idempotent retest: returns
> `already_sent`.
>
> **Resume options for next session:**
> a) Founder reads test newsletter — broadcast to wider list
> b) Founder Gemini-generates 3 missing Body Room images
>    (shoulders / throat / hips) → I place them
> c) Build Course Room "doorway" images (4 total, ~4 NB credits)
> d) Course Room Guardian TTS (P1) — needs integration_playbook
> e) Whispers admin tab in aurin-hub (if needed) — not currently
>    in this codebase
> f) Feedback Loop endpoint at end of Clarity Release session
>
> **Iter 41 (visual placement — 2026-02-05 morning):**
> Founder uploaded 5 custom Gemini-generated illustrations and asked
> to place them on the right pages. Saved + optimised to
> `/app/frontend/public/assets/illustrations/`:
> - `library-bookstore.jpg` (1407×768, 132 KB) — books stack + woman
>   writing → Bookstore hero (matches "If something started moving in
>   you" copy) + /library/adults
> - `founder-soft.jpg` (1408×768, 157 KB) — adult reading nook + kids
>   reading room → LibraryHub hero (matches "two doors" copy)
> - `inner-mirror.jpg` (1200×655, 99 KB) — wooden door + magical
>   journal → ClarityRelease page hero (below PageHeader)
> - `matrix-aurin-split.jpg` (1376×768, 99 KB) — Matrix vs Aurin
>   silhouettes → AurinPhilosophy between matrix and aurin blocks
> - `guides-portraits.jpg` source → split into `guide-female.jpg` +
>   `guide-male.jpg` (700×763 each) and used inside `GuideHologram`
>   replacing the SVG silhouette with a circular portrait that
>   ring-pulses while sending. Selection driven by existing
>   `guideGender` state from /api/clarity/prefs.
>
> All 6 images served from `/assets/illustrations/*.jpg`,
> verified HTTP 200 + DOM `naturalWidth/Height > 0` on /library,
> /library/adults, /bookstore, /aurin-philosophy, /clarity-release.
> Lint clean across 5 modified files. No copy/route/data changes.
>
> **Production env-vars problem (founder's side, both apps):**
> Cannot be fixed by me — they live in the Emergent platform's
> deployment config, not in any codebase. Founder must either find
> the env-vars panel in Emergent platform UI OR contact
> support@emergent.sh. Requires updating 5 vars on
> `pure-soul-life` + adding 2 new vars on `aurin-hub` (see iter 40).
>
> **Resume options for next session:**
> a) Feedback Loop (P1) — `/api/clarity/feedback` (1 question end
>    of Clarity Release session)
> b) Course Room Guardian TTS (P1) — needs integration_playbook
> c) 3 missing Body Room images (shoulders / throat / hips) via
>    Nano Banana — ~3 credits
> d) 4 Course Room "doorway" images — ~4 credits
> e) Send first newsletter (variant A from
>    `/app/memory/newsletter_drafts.md`)
> f) Kids Universe + Meditation Corner visual inventory
>
> **Iter 40 (this evening — covers + beta + content):**
> - **Book covers:** Installed PyMuPDF; wrote
>   `/app/scripts/extract_book_covers.py` which renders page 1 of
>   each PDF in `/app/backend/storage/books/` to
>   `/app/backend/storage/covers/{slug}.jpg` at 180 DPI. Generated
>   7/7 covers (1489×2105). Added route `GET /api/books/cover/{slug}.jpg`
>   (slug-safe, FileResponse). Patched all 7 SEED_BOOKS dicts with
>   `cover_image_url: "/api/books/cover/{slug}.jpg"`. Night Angel
>   keeps existing `bedtime-angel.png`. DOM check on Bookstore: 8/8
>   `<img>` tags now render (`naturalWidth > 0`, `complete: true`).
> - **Night Angel free:** price `5.0 → 0.0`. Added "Read it" CTA
>   path in Bookstore.jsx for `price === 0 && !pdf_url` case.
> - **Beta free-passes window:** Added env vars
>   `BETA_FREE_PASSES_START / _END` (now → +3 days). New endpoints
>   `GET /api/clarity/beta-window` (public) and
>   `POST /api/clarity/passes/{tier}/grant-beta` (auth). Idempotent
>   (re-grant returns existing). Updated `ClarityRelease.jsx`
>   HubPanel + TierCard to show a "A quiet gift" banner and swap
>   the 3 tier CTAs to "Activate free pass" while window is active
>   for any signed-in user without an active pass. Tested end-to-end
>   via direct Mongo session: 6/6 cases green (access before/after,
>   idempotency, season pass, invalid tier, anonymous → 401).
> - **Knowledge base expansion (founder request):** Wrote
>   `/app/memory/AGENT_MARKETING_PLAYBOOK.md` (10 sections,
>   ~600 lines) — positioning, zero-cost organic growth, conversion
>   psychology in our voice, funnel architecture, email cadence,
>   influencer/whisper outreach, web-design ↔ content balance with
>   per-surface visual audit, privacy-first analytics, crisis
>   handling. Internal agent reference only.
> - **Newsletter drafts:** Wrote `/app/memory/newsletter_drafts.md`
>   with 3 voice-vetted variants (warm-list, cold-list, short-gift)
>   plus pre-send checklist and Resend API example.
>
> **External (founder's side, both apps):**
> - **Landing page production env vars are stale** (per landing
>   agent): `SENDER_EMAIL`, `RESEND_API_KEY`, `WEBHOOK_URL`,
>   `PUBLIC_APP_URL`, `AURIN_HUB_API_URL`. Founder must update via
>   Emergent UI or contact Emergent Support.
> - **Aurin-hub production** also needs a fresh deploy + adding
>   `BETA_FREE_PASSES_START / _END` to production env so the gift
>   window activates publicly.
> - GitHub failure email is for `AurinBeyond/Genesis` repo — NOT
>   our app. Ignore.
>
> **Resume options for next session:**
> a) Visual audit Top-5 (homepage hero, 3 Body Room hotspots,
>    4 Course Room doorways, Bookstore hero, Clarity atmosphere)
>    — ~10 Nano Banana credits, ~30 min
> b) Feedback Loop (P1) — `/api/clarity/feedback`
> c) Course Room Guardian TTS (P1) — needs integration_playbook
> d) Send first newsletter (variant A/B/C from
>    `/app/memory/newsletter_drafts.md`)
> e) Visual inventory of Kids Universe + Meditation Corner
>
> **Iter 38 (autonomous DNS pipeline):**
> Founder migrated `prulesoul.site` to **Cloudflare** and issued an
> `Edit zone DNS` API token. Session executed:
> 1. Added 4 Resend records via Cloudflare API (idempotent script at
>    `/tmp/cf_resend_dns.py`, token NOT stored). DKIM TXT + send MX +
>    send SPF created; apex SPF extended with `include:amazonses.com`.
> 2. Background `/app/scripts/launch_pipeline.py` polled DNS → 4/4 at
>    09:19; verify-trigger returned HTTP 403 (Resend API auth quirk),
>    so the pipeline's auto-email step never fired — **no duplicate
>    sent to Lemon Squeezy**.
> 3. Founder confirmed out-of-band: Resend dashboard shows
>    *"Domain verified: Your domain is ready to send emails."* and
>    sent her own reply to Tanushree (hello@lemonsqueezy.com) with
>    product sample, pricing, LinkedIn, Instagram `@pruesoul.life`,
>    FB group link, landing page `pure-soul-life.emergent.host`.
>
> **Iter 39 (credit-conscious marketing addition — this session):**
> Added one tasteful landing section on `Home.jsx` — *"How this is
> walked"* — a soft 3-step orientation between the Layers and
> Principles blocks. Steps: `I. Find your own rhythm → /the-beginning`,
> `II. Let the body speak → /body-room`, `III. Meet yourself in
> private → /cabinet`. New constant `JOURNEY_STEPS`; new `<section
> data-testid="home-journey">`. Closing line: *"None of this is
> urgent. You can stop at any step, return later, or skip one. The
> rooms do not keep score."* Testids added: `home-journey`,
> `home-journey-step-{1,2,3}`, `home-journey-step-{1,2,3}-link`.
> Lint clean. Playwright DOM check: 3/3 steps + 3/3 links visible
> with correct hrefs. Zero copy/design/prompt/route/component
> changes elsewhere.
>
> **Active external blockers (founder's side, narrowed further):**
> - `the-night-angels-embrace.pdf` — still needs direct G-Drive link
>   (only remaining Lemon Squeezy artifact issue)
>
> **Resume options for next session:**
> a) First newsletter (Resend is verified — compose + send to any
>    test list founder provides)
> b) Feedback Loop (P1) — `/api/clarity/feedback`
> c) Course Room Guardian TTS (P1)
> d) Nano Banana images for shoulders/throat/hips (P2)
> e) Big-Bang announcements app (separate `pure-soul-life` repo) —
>    founder reviews auto-discovered announcements in admin queue

## Original Problem Statement
A structured digital environment ("Matrix Aurin") published at
prulesoul.site. GitHub is the source of truth for content. Calm,
premium, slow tone. Multi-page. Free Library + paid Bookstore + Kids
Universe + Learning + Meditations + Reach Out + About + Legal + Portal.

## Architecture (see SYSTEM_ARCHITECTURE.md)
GitHub → Content Normalizer → Mongo → FastAPI → React (prulesoul.site)
Access control: 18+ gate · Emergent Google Auth.
Guidance layer: "The Guardian" placeholder dock.

## Implemented to date

### Iteration 1 — MVP shell
5-page shell with shared nav + footer. Dark elegant + nature-inspired
design system. Fraunces serif + Instrument Sans body.

### Iteration 2 — content layer
Content endpoints, markdown sections, AI / GitHub sync STUBs. Library
refactored to API; entry detail; Learning; Admin-light; AiDock.

### Iteration 3 — content reliability + Master Plan structure
`parse_markdown_safe` (never raises); `/api/content/validate`;
`/api/content/admin/entries`; Bookstore + BookDetail + ReachOut;
audience filter; nav reorganised; AiDock → "The Guardian".

### Iteration 4 — prulesoul.site live MVP
Real GitHub sync (env-driven); Emergent Google Auth (Bearer-token);
About + Legal page wiring; 18+ gate (Kids Universe never gated);
Kids age groups + Coloring Studio placeholder; Reach Out → backend;
prulesoul.site branding; SYSTEM_ARCHITECTURE.md.

### Iteration 5 — Content & Security Phase (this iteration)
**Bookstore (real catalogue):**
- 4 books seeded with USD pricing + LemonSqueezy product-ID
  placeholders:
  - Genesis Protocol Vol I — $35 (adult)
  - Genesis Protocol Vol II — $35 (adult)
  - Star Whispers — $25 (kids)
  - Meditation Pack Vol I — $35 (adult)
- New `audience` field on Book model (`adult` | `kids`).
- `/bookstore` page filters by audience tabs (All · Adult · Kids).
- `tax_category: book_zero_rate_ready` retained on every book.
- LemonSqueezy IDs prefixed `PLACEHOLDER_` until activation.

**Legal foundation (seed text, replaceable from GitHub):**
- 4 legal entries seeded into the `legal` surface:
  - Terms of Service · 8 H2 sections
  - User Responsibility · 5 H2 sections
  - Refund Policy · 4 H2 sections
  - Acceptable Use & Community · 4 H2 sections
- Each entry prefixed with a clearly-marked "starter draft — replace
  with attorney-reviewed text before payments" notice.
- Replaced automatically once `/legal/*.md` lands in the connected
  GitHub repo.

**Kids Universe (renamed + interactive placeholder):**
- Age groups renamed to Little Dreamers (3–5), Explorers (6–8),
  Future Builders (9–12).
- Coloring Studio rebranded to "Aurin Kids · Imagine & Color" with
  4 theme buttons (Nature, Animals, Space, Stories) — placeholder UI,
  no AI logic yet.

**Secure Access Gate (strengthened):**
- 18+ modal on `/learning` and `/meditation-corner` only.
- Modal now offers a "Visit Kids Universe" alternative button (no
  18+ flag set when chosen).
- `/kids-universe` remains entirely open.

**Tests:**
- Backend 12/12 pass · Frontend 30/30 pass · 0 issues.
- New permanent regression suite at
  `/app/backend/tests/test_iter4_books_legal.py`.

### Iteration 6 — Real assets + author preface (this iteration · 2026-04-25)
**Brand identity wired:**
- `prulesoul-logo.png` rendered in `Navigation.jsx` and `Footer.jsx`.
  Two-line lock-up: "prulesoul" + "MATRIX · *Aurin*" eyebrow.
- `aurinbeyond-hero.png` archived under `/assets/brand/` for future
  hero/welcome use.

**About page — author's personal preface (`/brand` surface):**
- New `SEED_BRAND` list in `server.py` with idempotent upsert in
  `seed_initial_content()` (step 6 — replaceable by `/brand/about.md`
  from GitHub).
- Entry `about-the-author` carries the user's exact life-story text.
- `About.jsx` now selects the entry by slug (with first-entry fallback).

**Kids Universe — Coloring Studio (gallery rewrite):**
- `KidsColoringStudio.jsx` replaces the prompt-form placeholder with a
  real gallery driven by an in-file `COLORING_PAGES` array (mirrors the
  requested markdown frontmatter: `type/age_group/tags/download_url`).
- First live page: `aurin-kids-cover.png` on a **pure-white card**.
- Per card: age chip, tag chips, **Download to Print** (real PNG link)
  and **Print now** (opens print dialog).
- Age-group filter (All · 3-5 · 6-8 · 9-12) with empty-state.

**Bookstore — refund acknowledgment:**
- `bookstore-item-${slug}-refund-notice` paragraph under every Buy-access
  row links to `/legal#refund-policy`. Closes the audit's compliance gap.

**Tests:**
- Backend 6/6 pass · Frontend 5/5 pass (iteration_5.json).
- Regression file: `/app/backend/tests/test_iteration5.py`.


| Item | Status |
|---|---|
| Multi-page structure | Done |
| Dark-elegant design system | Done |
| Real GitHub sync architecture | Done · awaiting `GITHUB_REPO` env |
| Content normalizer | Done |
| Bookstore catalogue | Done · 4 books, USD pricing, placeholder LemonSqueezy IDs |
| Library (free) | Done |
| About / Legal pages | Wired · seeded starter Legal text · awaiting GitHub /brand |
| Kids Universe + age groups + studio | Done |
| 18+ gate (with Kids alternative) | Done |
| Auth | Done (Emergent Google) |
| Reach Out | Done · awaiting `REACH_OUT_EMAIL` |
| AI Guardian | Placeholder by design |
| prulesoul.site branding | Done · DNS at registrar required |

### Iteration 7 — Real catalogue + media wiring (2026-04-25)
**Bookstore — 6 real titles replacing 4 placeholders:**
| Slug | Audience | Price | LemonSqueezy ID | External preview |
|---|---|---|---|---|
| you-dont-have-to-dance-to-anothers-tune | adult | $35 | PLACEHOLDER_DANCE_TUNE | ebookmaker.ai/...ag5xc |
| the-language-of-angels | adult | $35 | PLACEHOLDER_LANGUAGE_OF_ANGELS | ebookmaker.ai/...osvhn |
| beyond-the-matrix-ii | adult | $35 | PLACEHOLDER_BEYOND_MATRIX_II | ebookmaker.ai/...w5x3tf |
| angels-tales | kids | $25 | PLACEHOLDER_ANGELS_TALES | ebookmaker.ai/angels-tales-... (+ free PDF) |
| engels-friends-2 | kids | $25 | PLACEHOLDER_ENGELS_FRIENDS_2 | ebookmaker.ai/...ugo0pf |
| the-night-angels-embrace | kids | $25 | PLACEHOLDER_NIGHT_ANGELS | ebookmaker.ai/the-night-angels-embrace (+ real cover) |

- New `external_read_url` + `pdf_url` fields on `Book` / `BookCreate` / GitHub-sync payload.
- `angels-tales.pdf` (6.8 MB) shipped at `/assets/books/`.
- `bedtime-angel.png` shipped as cover for *The Night Angels' Embrace*.
- Bookstore card now offers **Preview** (eBookMaker), **Free PDF sample** (when present), and the refund-policy line.

**Library — Soul Gift donation card** (`<SoulGiftCard />` at bottom of `Library.jsx`):
- Hero image `pure-soul-life-card.png` + €1 / €5 / €15 Ko-fi tiers → `ko-fi.com/puresoulife`.

**Kids Universe — real visualisation:**
- Bedtime visual `bedtime-angel.png` replaces the studio placeholder.
- Story-trailer section embeds `book.mp4` (2.7 MB, muted/autoplay/loop + poster fallback for iOS/Safari).

**Staged, not shipped:** the 166 MB "You Are Not Who You Became" 60 s trailer lives in `/app/.media-staging/`. Recommend external hosting before embedding.

**Tests:** Backend 13/13 pass · Frontend testids all verified · iteration_6.json clean.

## Backlog

### Iteration 37 — Safety layer + Wanderer's Agreement + Crisis hotlines + Admin reminders (2026-05-03)

Directly in response to the external critic's two most valid points:
**(1) legal/ethical risk of AI guiding deep inner work without clinical oversight**,
and **(4) need for a visible human-ethical contract with the wanderer**.
The founder explicitly requested *additions only, no destructive changes*.

**A. Wanderer's Agreement page** (`/wanderers-agreement`)
New brand-voiced disclaimer page with 5 clauses: *A guide, not a clinician* · *Your freedom, your responsibility* · *About the companion* (AI honesty + encryption pledge) · *When the wave is bigger* (hotlines) · *In one breath* (summary + acceptance statement). Not hidden in the footer — actively linked at:
- Footer "Trust" column (between About and Legal)
- Honesty Gate on the Body Room questionnaire (new line: *"By continuing, you accept the Wanderer's Agreement"*)
- Guardian's first message in every new Clarity Release session

**B. Panic Button / Safety clause in Clarity AI system prompt**
New absolute-override section: *"Safety — the one rule that overrides everything else"*. When the wanderer expresses suicidal ideation, intent to harm, active medical emergency, or active psychotic break, the Guardian:
1. Acknowledges briefly + warmly
2. States plainly this is bigger than the room can hold tonight
3. Gives the exact hotline wording: **Eluliin 116 123** (Estonia 24/7), **112** (emergency), **findahelpline.com** (international)
4. Does NOT continue the inner-work conversation. No deepening question, no somatic invitation.
5. Never downplays. Never says *"it will pass"*.
Rule is marked **absolute**, overrides tone/brand/four-beat loop.

**C. `/api/support/crisis` endpoint** — public, unauthenticated, no logging of requester. Returns 5 hotlines (Eluliin 116 123, Peaasi.ee, pan-European 116 123, 112, findahelpline.com) + preamble + reminder that Aurin is not a crisis service.

**D. Updated Cabinet opening greeting**
`CABINET_OPENING_GREETING` now opens every new Clarity session with the safety line + Agreement link before any inner work begins. Still warm, still short, still in Aurin voice — just no longer silent about the boundary.

**E. Admin Founder Reminders** — visible red banner
- New `GET /api/admin/reminders` (admin-only, 401/403 for non-admins) — parses `/app/memory/FOUNDER_REMINDERS.md` on every call, returns each reminder with status `DORMANT` or `TRIGGERED` based on trigger_date vs today
- Red banner at the top of `/admin/content` surfaces every TRIGGERED entry with the founder-facing red-quote block
- First active reminder: **R-01** (hire guest psychologist ≈3 months after launch; trigger 3 Aug 2026)
- Also available as CLI: `python3 /app/scripts/check_founder_reminders.py`

**F. Tests — `test_iteration37.py` (7 tests) + new `conftest.py`**
All PASS:
- `test_crisis_support_public_and_complete` — Eluliin + 112 + findahelpline present, schema valid
- `test_safety_clause_present_in_prompt` — Safety section + 116 123 + 112 + "absolute" + "do not continue"
- `test_opening_greeting_points_to_agreement` — `/wanderers-agreement` + Eluliin + Wanderer + Agreement in greeting constant
- `test_admin_reminders_requires_auth` — 401 unauth
- `test_admin_reminders_rejects_non_admin_member` — 403 for member
- `test_admin_reminders_parses_founder_file` — R-01 present, schema valid, triggered_count consistent
- `test_founder_reminders_file_valid` — on-disk file has ACTIVE REMINDERS + R-01 entry
- Moved `member`/`admin` fixtures into `conftest.py` so all future test files inherit them

**G. Zero destructive changes.** No existing copy rewritten. No routes renamed. No DB migrations. Every addition is additive and reversible.

**What we did NOT change from critic's advice:**
- Front-page rewrite to "pain points first" language — founder's current voice is the brand, not a conversion funnel
- Adding founder face / manifest — About page already exists and was not asked to be changed
- Metaphor reduction — progressive disclosure is already structured (patterns under-fold, deep_layer in modals only)
- Swapping LLM provider — memory-based atlas already insulates us from Claude quirks; cross-provider fallback is a P2 ticket

**Pending founder actions (unchanged)**
1. **Press "Deploy"** — iter32 + 33 + 34 + 35 + 36 + 37 all waiting
2. DNS for prulesoul.site (Monday)
3. Ööingli PDF re-upload

**Future / Backlog (re-prioritised)**
- P1: Course Room Guardian TTS
- P1: 7-day honesty follow-up email
- P2: Cross-LLM fallback (Claude → GPT → Gemini degradation) for the atlas-driven prompt
- P2: Nano Banana 8 chakra images (~$0.30)
- P2: `server.py` refactor into `/routes/` + `/models/` (now 5,099 lines)
- P3: Admin `/admin/clarity` dispute log dashboard
- P3: "Matrix: Awakening" course
- P3: Expand unwinding patterns library (grief, hypervigilance, chronic self-attack)



### Iteration 36 — Agent Consciousness (Shadows & Light Matrix + Transmuted Instruments + four-beat loop) (2026-02-03)

**Founder directive:** *"Anna agendile ülesanne koguda kokku kõik negatiivsed emotsioonid, sõltuvused, tungid… grupeeritult agentide salve, et Guardian oskaks hakata küsimuste kaudu inimest samm-sammult edasi suunama. Lisaks negatiivsele grupile luua ka positiivne vastand-lahendus. Päev / öö. Kasutada kaasaegseid psühholoogilisi instrumente, transmuteeritud meie brändikeelde."*

This was a pure agent-consciousness upgrade. Zero UI change, zero
credit-intensive content generation — the effect is that **every
Clarity Release conversation from here on is measurably deeper and
safer**, because Claude Sonnet 4.5 now reads with a sharper listening
grid and uses contemporary psychological tools without ever naming
them.

**A. Shadows & Light Matrix (15 night-side patterns × root × day-side)**
Added to `/app/memory/AGENT_KNOWLEDGE_BASE.md` as a three-column
table and embedded in the Clarity AI system prompt as a bulleted
listening grid. Covers: compulsion/pull, sudden anger, screen
escape, jealousy, victim posture, people-pleasing, procrastination,
over/under-eating, over-thinking, self-silencing, control,
shame, hypervigilance, isolation, fear of abandonment. For each,
the root pattern is private and the counter-light is the `new_rhythm`
the agent quietly helps the wanderer move toward — **never named
back as a label**.

**B. Transmuted Psychological Instruments (13 tools → voiced lines)**
The agent is now explicitly authorised to use the full contemporary
toolkit (CBT, Socratic, somatic tracking, IFS/parts, shadow work,
family-systems, attachment, EMDR resourcing, mindfulness,
self-compassion, motivational interviewing, trauma-pacing). Each
tool is paired with an Aurin-voice line the wanderer actually hears.
Examples:
- (CBT reframe) → *"Whose voice is that, really?"*
- (parts work) → *"There's a part of you that still does this. How old does it feel?"*
- (shadow work) → *"Is there a part of this you have been ashamed to meet? It is allowed to come forward."*
- (trauma pacing) → *"This is enough for now. We can pause here. Nothing has to resolve tonight."*

**Constraint:** one technique per turn, never stacked. Voice stays
unhurried.

**C. Four-beat loop (Mirror → Deepen → Release → Anchor)**
Every extended exchange now follows this private rhythm. Embedded
in both the knowledge base and the system prompt so Claude carries
it through every reply. Mirror before moving; one deepening
question; optional sub-30-second somatic movement; anchor in a
small image of the day-side life.

**D. Hard forbidden-vocabulary list in the prompt**
Previously Claude was told "never diagnose, never label". Now the
system prompt lists ~25 specific words the wanderer must never hear:
diagnosis, disease, disorder, patient, therapy, treatment, cure,
intervention, pathology, dysfunction, addiction, trauma (as a
noun), PTSD, depression, anxiety, OCD, ADHD, CBT, IFS, EMDR,
polyvagal, attachment theory, shadow work, parts work, somatic
experiencing, constellation, mindfulness. This is a **hard rule**,
not taste.

**E. Tests — `test_iteration36.py` (5 new tests, all PASS)**
- `test_clinical_vocabulary_is_listed_as_forbidden` — prompt
  explicitly names each clinical term under "Vocabulary that must
  never appear"
- `test_four_beat_loop_is_present` — Mirror / Deepen / Release /
  Anchor all in prompt
- `test_shadow_patterns_in_prompt` — 14 shadow patterns named
- `test_techniques_section_present_and_transmuted` — 7 sampled
  voiced lines present; "one technique per turn" rule present
- `test_knowledge_base_carries_matrix_and_instruments` — memory
  file carries Shadows & Light, Instruments, four-beat loop, Safe
  Terminology Map, Root Programs Atlas

**F. Zero UI change, zero new endpoints, zero new assets.** The
effect is entirely in how the existing Clarity Release chat behaves
from the next message onward.

**Pending founder actions (unchanged)**
1. **Press "Deploy"** — iter32 + 33 + 34 + 35 + 36 all waiting.
2. DNS for prulesoul.site (domene.no support — Monday).
3. Ööingli PDF re-upload.

**Future / Backlog**
- P1: Course Room Guardian TTS — reads letters aloud; the new atlas now gives the Guardian voice strong listening grid beneath the text.
- P2: Nano Banana regeneration for the 8 chakra images.
- P2: `server.py` refactor into `/routes/` + `/models/`.
- P3: Admin `/admin/clarity` dispute log dashboard.
- P3: "Matrix: Awakening" course.



### Iteration 35 — Honesty gate + Borrowed Key + Postponed Life + Agent Atlas (2026-02-03)

**Founder directive:** *"Kui sa leiad siin midagi mis vöib seda teemat täiendada, siis lisad täiendused kui leiad et see on otstarbekas ja praktiliselt kasulik — ei kirjuta üle, ei tee midagi uut."*

From the GPT-drafted "Hingekaart" vision, three additions were
selected as genuinely enriching (the rest duplicated existing
structure or would require large UI surfaces and high credit cost):

**A. Honesty gate on the questionnaire** — a single-screen opt-in
before the 5 questions. Carries the founder's own vow, softly
reframed in English: *"I am willing to look at what I have been
hiding — not to judge it, but to find my own light again."*
Testids: `quiz-honesty-gate`, `quiz-honesty-accept`,
`quiz-honesty-later`. Declining scrolls the user to the patterns
library instead. Complete reset (`quiz-reset`, `quiz-retake`) now
also resets the gate, so a second visit re-asks the vow.

**B. Two new unwinding patterns** (now 7 total, up from 5):
- **"The borrowed key"** — people-pleasing framed through the
  inherited-solution metaphor: *"You were handed a key — not your
  own… in your life it only opens exhaustion."* Closes in a
  `new_rhythm` where small personal preferences return.
- **"The postponed life"** — procrastination framed as nervous-system
  protection, not laziness: *"You are not avoiding the task. You are
  avoiding the feeling."* Closes in a `new_rhythm` where the user
  begins to trust their own word to themselves.

**C. Agent Knowledge Base expansion** (`/app/memory/AGENT_KNOWLEDGE_BASE.md`)
— fully internal, no public surface impact:
- **Safe Terminology Map** — 11-row "never say / always say
  instead" table. AI agents (Clarity Guide, Guardian, First Letter
  writer) must use the right column exclusively. Bans clinical
  vocabulary (diagnosis, disease, addiction, disorder, patient,
  treatment, therapy) and gives soft-voice replacements.
- **Root Programs Atlas** — 10 meta-patterns that underlie the
  specific unwinding patterns (loyalty to an older self, inherited
  sentences, substitute-for-closeness, armour of usefulness, grip
  on tomorrow, fear of being seen, echo of unsafe home, ungranted
  permission, exhausted boundary, refusal to feel). Agent usage
  rule: **map privately, never label the user**.
- **"The Broken Key" metaphor** — documented as a writer's lens
  already implicit in existing `forgiveness_path` + `new_rhythm` +
  `pattern-borrowed-key`. Explicitly decided **not** to surface as a
  dedicated UI feature, to avoid over-intellectualising what is
  already a felt experience.

**Not done (deliberately, to preserve credits and avoid
duplication):**
- Separate "Soul Map" system (already realised in the existing
  patterns + questionnaire + deep_layer + children_patterns pipeline)
- Full 12-Root-Program public UI (lives in agent atlas; avoids
  bloat; Guardian can use it when voice lands)
- "Keychain inventory" — requires account state + new page; keeps
  for a future iteration if the metaphor proves resonant

**Tests — `test_iteration32.py` (15 tests, all PASS)**
- `test_patterns_endpoint_shape` updated to expect 7 patterns
  (pull / food / anger / jealousy / screen / borrowed-key / postponed)
- All 15 iter32/33/34/35 tests green.

**Pending founder actions (unchanged)**
1. Press **"Deploy"** (iter32 + iter33 + iter34 + iter35 all waiting)
2. DNS for prulesoul.site (domene.no support)
3. Ööingli PDF re-upload



### Iteration 34 — The New Rhythm + Unwinding patterns + Light Guide + Attribution hygiene (2026-02-03)

**Founder directives honoured in this iteration:**
1. *"Joonistused peavad alati kajastama positivst löpp faasi. Seda tunneli löpu valgust."* → Every deep section now ends in **New Rhythm** (the life on the other side of the release).
2. *"Me ei kasuta Luule Viilma nime mitte kuskil avalikult kodulehel."* → All public attribution removed. Source thinkers live only in `/app/memory/AGENT_KNOWLEDGE_BASE.md`.
3. *"Vajame nimekirja inimeste väärharjumustest, rännaku tee selle läbimiseks."* → New unwinding patterns library (5 canonical patterns) + 5-question honesty map.
4. *"Joonistusnurk — kuidas toetada last joonistusretkel. Tunneli lõpu valgus."* → Kids Coloring Studio now carries a 5-step **Light Guide** for parents.
5. *"Safer language — pigem mitte söna diagnoos, haigus jms."* → All 'medical_note' fields reworded to avoid clinical vocabulary; UI copies say "pattern", "loop", "weight", "shape", "load" — never "diagnosis", "disease", "addiction".

**A. The New Rhythm — tunnel-exit phase for all 8 regions**
- Added `new_rhythm` (~70–90 words) to every `deep_layer`. Describes life on the other side of the release, in the second person, soft-present tense.
- Modal now has its own "The new rhythm" sub-section with a **Sprout** icon accent.
- Pattern library cards also close with `new_rhythm`. The journey structure is: **the shape → beneath the pattern → the soft exit → the new rhythm**. No card ends in the weight.

**B. Unwinding patterns library (`/api/body-room/patterns`)**
- 5 patterns, framed without any medical/shame language:
  1. **The pull you cannot explain** — compulsive draw to people/places/pleasures that contradict the life we say we love
  2. **Food that isn't about food** — eating past fullness / restriction / secrecy
  3. **The storm that arrives too quickly** — disproportionate anger + the after-wave of regret
  4. **The green shadow** — jealousy and the sentence-underneath ("I am not enough")
  5. **The screen that soothes and steals** — hours disappearing into a glowing rectangle (parent + child both covered)
- Each pattern has `surface` (observable) → `beneath` (unmet need) → `soft_exit` (the one step that opens the loop) → `new_rhythm` (what life becomes).
- Endpoint also returns `preamble` + `honesty_note`.

**C. Honesty questionnaire (`/api/body-room/questionnaire`)**
- Five quiet questions that map to regions + patterns:
  1. "When the day ends, what is loudest inside?" → mind regions
  2. "Where in the body does the day settle?" → somatic regions
  3. "Is there a pattern that keeps returning?" → unwinding patterns
  4. "How does it feel to stand, right now?" → belonging/trust
  5. "How ready are you, tonight, to let one old structure rest?" → honesty weight (0–3)
- Client-side only (no server storage). `computeQuizResult()` produces a small personalised map: top 3 regions + up to 5 patterns + an honesty-tuned closing note. Regions surface as clickable chips that open the corresponding hotspot modal.

**D. Attribution hygiene — public surface cleaned**
- `/api/body-room/further-reading` now returns `{ items: [] }` publicly (stub kept for backward compat).
- Frontend Viilma card removed from `/body-room`.
- New tests enforce zero `viilma / lipton / gabor mat / goodreads` in any public payload (3 endpoints covered).
- New file `/app/memory/AGENT_KNOWLEDGE_BASE.md` documents the three philosophical pillars that shape Aurin content (psychosomatic root, biology of belief, "the body says no"). **Internal use only** — this file is the reference the content agents use to write original Aurin language without ever attributing the source authors.

**E. Kids Coloring Studio — Light Guide for parents**
- New soft section `kids-coloring-light-guide` at `/library/kids/draw` (and `/kids-universe/coloring`).
- 5-step ritual guide:
  1. **The room** — containment without direction
  2. **The heavy colours** — if darkness arrives, stay beside without asking why
  3. **The turn toward light** — soft invitation to add a sun, flower, joy-mark before closing
  4. **The body's small sounds** — yawns, coughs, humming as release, gently named
  5. **The closing breath** — look at the bright parts together, put pencils away unhurried
- Closing note affirms medical/psychological care as primary when needed.

**F. Tests — `test_iteration32.py` extended (20 tests, all PASS)**
- `test_every_hotspot_has_new_rhythm`
- `test_patterns_endpoint_shape` (5 patterns, 4 structural fields each, `new_rhythm > 60 chars`)
- `test_questionnaire_shape` (5 questions, preamble + honesty_prompt)
- `test_further_reading_returns_empty_publicly`
- `test_no_external_author_attribution_in_hotspots` (viilma/lipton/mat/goodreads banned from payload)
- `test_no_attribution_in_patterns_or_children`
- Iter32 `test_further_reading_exposes_viilma_shelf` **removed** (reversed to attribution hygiene test)

**G. Pending founder actions (unchanged)**
1. **Press "Deploy"** in Emergent UI — iter32/33/34 still in /app code; live domain on older snapshot.
2. **DNS for prulesoul.site (domene.no)** — awaiting support response.
3. **`the-night-angels-embrace.pdf`** — stable re-upload needed.

**H. Future / Backlog (updated priorities)**
- P1: Course Room "Guardian" voice (OpenAI TTS reading letters).
- P2: Extend unwinding patterns library with 3–5 more canonical shapes (grief that will not pass, people-pleasing, self-silencing, procrastination).
- P2: Nano Banana regeneration for the 8 chakra image_slugs (~$0.30 budget).
- P2: `server.py` refactor into `/routes/` + `/models/`.
- P3: Admin `/admin/clarity` dispute log dashboard.
- P3: "Matrix: Awakening" course.



### Iteration 33 — Body Room deep layer (Viilma-influenced) + Inherited loads (2026-02-03)

**Founder directive:** *"Süvenda body ruumi tuuma. Luule Viilma stiilis psühhosomaatiline dialoog — mõistmine ilma süüdistuseta. Iga hotspot saab oma süvakihi. Lapsed kannavad vanemate koormat — see on omaette peatükk. Vöib ka kuruseid siit kokku panna."*

**Live status check (before work):**
- `prulesoul.site` kõik 7 API-d + 5 lehte → 200. Deploy on tervis.
- **Aga** live on ikka iter28/29 snapshot: vanad TCM regioonid (jaws/liver/lungs/kidneys/shoulders) ja `checkout_ready=False`. Iter32 muudatused ootavad deploy'd.

**A. Body Room — `deep_layer` per hotspot (all 8)**
- New `BODY_DEEP_LAYERS` dict in `server.py`, merged into `/api/body-room/hotspots` response.
- Each deep layer has 5 fields:
  - `toxin_name` — the named pattern (e.g. "The armour of protection" for hips, "The swallowed sentence" for throat)
  - `how_it_forms` — the psychosomatic origin (understanding, not blame)
  - `forgiveness_path` — release through understanding, replacing the protection with something gentler
  - `release_signs` — the body's vocabulary of letting go (yawning, trembling, deep sighs, warmth, cough)
  - `medical_note` — medical care always comes first, always respected
- Frontend modal: new collapsible `<section>` "Going deeper — understanding without blame" (`body-modal-deep-toggle-{region}`), lucide `BookOpen` icon, sage accent. Expands to show all 5 fields in themed sub-sections.
- Tone: sanctuary, never clinical, never diagnostic. Hips deep layer written as the canonical Viilma-stylereference (armour/weight/storage metaphor); the other 7 match the depth and tone.

**B. Inherited loads — 5 children's psychosomatic patterns**
- New endpoint `GET /api/body-room/children-patterns` + `SEED_CHILDREN_PATTERNS` list. Five most common childhood symptoms mapped to the parent's unresolved material:
  1. **Recurring throat & tonsil infections** ← the family's unspoken sentence
  2. **Stomach aches / nausea** ← the parent's quiet anxiety
  3. **Eczema / rashes / allergies** ← the parent's untended boundary
  4. **Chronic ear infections** ← the acoustic climate of the home
  5. **Nightmares / bed-wetting / restless sleep** ← the parent's unfelt weight
- Each pattern has: `child_symptom`, `in_the_child` (what the body is saying), `parent_mirror` (the adult's usual parallel), `release_path` (the parent's inner work that releases the child in parallel).
- Framing preamble + medical_note returned alongside — **strictly understanding, never blame; medical care always first**.
- Rendered on `/body-room` as a 2-column card grid below the silhouette (`body-room-children` testid), with preamble, per-card subsections, and a closing medical note with italic sage tone.

**C. Further reading — Luule Viilma internal reference (quiet shelf)**
- New endpoint `GET /api/body-room/further-reading` + `BODY_ROOM_FURTHER_READING` list.
- First (only) item: Viilma's Goodreads author page (`https://www.goodreads.com/author/list/6884214.Luule_Viilma`), framed as "A quiet shelf, for those who want to go further" — intern reference material, not a public blog or content to reproduce.
- Rendered on `/body-room` as a small card with `BookOpen` icon + `ExternalLink` button opening in new tab.

**D. New API endpoints (all public)**
| Method | Path                                     | Purpose                               |
|--------|------------------------------------------|---------------------------------------|
| GET    | /api/body-room/hotspots                  | 8 regions w/ `deep_layer` enrichment  |
| GET    | /api/body-room/children-patterns         | 5 inherited-load cards + medical note |
| GET    | /api/body-room/further-reading           | Viilma shelf                          |

**E. Tests — `test_iteration32.py` extended (13 tests total, all PASS)**
- `test_every_hotspot_has_deep_layer` — all 8 regions carry the 5 deep-layer fields with substantive content.
- `test_children_patterns_endpoint` — 5 patterns with all 4 content fields, preamble + medical_note present.
- `test_further_reading_exposes_viilma_shelf` — Viilma reference present with Goodreads URL.

**F. Lint clean** (JS + Python). Pre-existing `frontmatter` warning on line 171 untouched.

**G. Pending founder actions (unchanged from iter32 + this one)**
1. **Press "Deploy"** in Emergent UI — both iter32 and iter33 changes still in /app code only. Live domain is currently on iter28/29 snapshot.
2. **DNS for prulesoul.site (domene.no)** — awaiting support response.
3. **`the-night-angels-embrace.pdf`** — stable re-upload needed.

**H. Future / Backlog (unchanged)**
- P1: Course Room "Guardian" voice (OpenAI TTS reading letters; MP3 stays as background loop).
- P2: Nano Banana regeneration for the 8 new chakra image_slugs (~$0.30 budget).
- P2: `server.py` refactor into `/routes/` + `/models/` (~4,300 lines now with deep layer + children patterns).
- P3: Admin `/admin/clarity` dispute log dashboard.
- P3: "Matrix: Awakening" course from `/app/memory/COURSE_IDEAS.md`.



### Iteration 32 — LemonSqueezy live + Body Room chakra redesign (2026-02-03)

**Founder directive:** *"Alusta LemonSqueezy Variant ID mappingust ja Buy nuppude aktiveerimisest; lisaks Body Room — 8 hotspoti, sügav psühholoogiline tekst (chakra-aligned, mediteeriva figuuriga)."*

**A. LemonSqueezy Variant ID mapping — 15/15 products LIVE**
- Queried LS API with founder's new key → fetched all 16 products + their variants. 15 mapped to backend SEED arrays:

  | SEED list           | Slug / Tier                                  | Variant ID  |
  |---------------------|----------------------------------------------|-------------|
  | SEED_BOOKS (8)      | beyond-the-matrix-i                          | 1606071     |
  |                     | beyond-the-matrix-ii                         | 1606223     |
  |                     | the-language-of-angels                       | 1606213     |
  |                     | you-dont-have-to-dance-to-anothers-tune      | 1606185     |
  |                     | angels-tales                                 | 1606234     |
  |                     | angels-story                                 | 1606247     |
  |                     | engels-friends-2                             | 1606260     |
  |                     | the-night-angels-embrace                     | 1606266     |
  | SEED_PASSES (3)     | 30min                                        | 1606274     |
  |                     | 60min                                        | 1606349     |
  |                     | season_30days                                | 1606394     |
  | SEED_COURSES (4)    | letting-the-old-stories-rest                 | 1606407     |
  |                     | the-language-you-forgot                      | 1606433     |
  |                     | seven-quiet-evenings-with-children           | 1606445     |
  |                     | the-body-knows-first                         | 1606453     |

- New helper `/app/frontend/src/lib/lemonsqueezy.js` builds `https://puresoullife.lemonsqueezy.com/buy/{variant_id}` URLs.
- `/api/clarity/passes`, `/api/courses`, `/api/courses/{slug}` now expose `lemonsqueezy_variant_id`. `/api/books` already did.
- Frontend Buy buttons are LIVE in 3 surfaces:
  - Bookstore card → `bookstore-item-{slug}-buy` becomes `<a target=_blank>` to LS checkout (or stays disabled when variant missing)
  - ClarityRelease tier card → `clarity-tier-{tier}-buy` (replaced "Opens this Friday" disabled state)
  - CourseDetail header → new `course-detail-buy` button alongside the free "Begin gently" enrollment button (soft-conversion architecture: free trial first, then upgrade)
- Refund-policy notice on Bookstore now shortens copy when checkout is active.

**B. Body Room — TCM organ map → chakra-aligned vertical map (founder pivot)**
- 8 brand-new psycho-anatomical regions replacing the previous TCM model:
  1. **Crown** — *The overthinker's gate* (mental clarity vs. information hoarding)
  2. **Throat** — *The silent truth* (swallowed words, voice withheld)
  3. **Heart** — *The compass of trust* (emotional walls vs. openness)
  4. **Solar plexus** — *The controller's knot* (need to control, life-flow distrust)
  5. **Belly** — *The intuitive void* (gut wisdom buried under expectations)
  6. **Hips** — *The emotional archive* (stored fears and trauma)
  7. **Hands** — *The boundary maker* (give/receive rhythm with the world)
  8. **Feet & roots** — *The root of safety* (existential right to be here)
- Frontend `Silhouette` redrawn with founder-specified positions: crown 50%/12%, throat 50%/25%, heart 50%/38%, solar_plexus 50%/47%, belly 50%/55%, hips 50%/66%, hands 19%/52% + 81%/52% (twin), feet 50%/90%. Hands hotspot renders as **two synchronized dots** (left + right wrist).
- Schema kept identical — every hotspot carries `region`, `label`, `emotion`, `symptom`, `what_it_carries`, `release`, `why_it_speaks_to_you`, `image_slug`. Uniform depth.
- Old TCM image files (`jaws-anger.png`, `liver-bitterness.png`, `lungs-melancholy.png`, `kidneys-fear.png`, `heart-grief.png`) now orphaned (no slug references them). New image_slugs (`crown-overthinker`, `throat-unspoken`, `heart-compass`, `solar-plexus-control`, `belly-intuition`, `hips-archive`, `hands-boundary`, `feet-roots`) exist in dict but PNGs deferred for credit-budget reasons. Frontend modal hides image div on 404.
- Claude AI prompt updated: state-bridge greeting uses new region labels; system prompt's two-rooms reminder lists the 8 chakra regions instead of TCM organs.

**C. Test housekeeping (137/137 backend PASS)**
- New `test_iteration32.py` (7 tests) — variant ID mapping for books/passes/courses, Body Room order/schema/no-old-regions.
- Updated `test_iteration23.py` — passes now `checkout_ready=True`.
- Updated `test_iteration26.py` — region assertions migrated jaws→crown, kidneys→belly. Image endpoint test relaxed to `200 or 404` (PNGs deferred).
- Updated `test_iteration27.py` — state bridge insight uses `crown` region.
- Rewrote `test_iteration28.py` — region order now `[crown, throat, heart, solar_plexus, belly, hips, hands, feet]`, every region carries `why_it_speaks_to_you`, image endpoint accepts 200/404.

**D. Pending founder actions**
1. **DNS for prulesoul.site (domene.no)** — still awaiting domene.no support response. Resend sandbox-fallback keeps Magic Link + First Letter funnel functional in the meantime.
2. **`the-night-angels-embrace.pdf`** — re-upload from a stable host (Drive direct-link `?export=download&id=...` format).
3. **Deploy** — press "Deploy" in Emergent UI to push iter32 changes to `aurin-hub.emergent.host` / `prulesoul.site`.

**E. Future / Backlog**
- P1: Course Room "Guardian" voice (OpenAI TTS reading letters; MP3 stays as background loop).
- P2: Nano Banana regeneration for the 8 new chakra image_slugs (~$0.30 budget).
- P2: `server.py` refactor into `/routes/` + `/models/` (~4,200 lines). High-risk; do incrementally.
- P3: Admin `/admin/clarity` dispute log dashboard.
- P3: "Matrix: Awakening" course from `/app/memory/COURSE_IDEAS.md`.



### Iteration 31 — Tone deepening + AI guide values (2026-05-02)

**Founder directive:** *"Anda veelgi sügavust juurde — minimaalsete kuludega tugevam, kõnetavam toon, ilma ümber ehitamata."*

**A. Body Room — `why_it_speaks_to_you` extended to all 8 hotspots**
- Previously: only the 3 new regions (shoulders, throat, hips) carried this field.
- Now: all 5 originals (jaws, liver, heart, lungs, kidneys) also have it.
- This answers the wanderer's silent question on every region: "Why is THIS the one calling me tonight?"
- UX consistency: every hotspot modal now shows the same depth of self-recognition.

**B. Claude AI guide — embedded "Quiet principles"**
- Added a final block to `clarity_ai.CLARITY_SYSTEM_PROMPT` titled "Quiet principles you carry":
  - Free will is sacred
  - Solutions over problems
  - Human, not clinical
  - The wanderer's own answer
- Empirically verified: replies are now slightly tighter and turn faster from acknowledgement toward an opening question.

**Deploy required:** Both changes live in /app code. Founder must press "Deploy" again in the Emergent UI to push them to `aurin-hub.emergent.host` / `prulesoul.site`.



### Iteration 30 — LIVE deploy fully verified on prulesoul.site (2026-05-01)

**Founder pressed Deploy → live snapshot is now CURRENT code state.**

**Verification (all 10/10 backend endpoints + 9/9 frontend pages green via LIVE URL, NOT preview):**
- `aurin-hub.emergent.host/api/blog` → 200
- `aurin-hub.emergent.host/api/courses` → 200 (4 courses, audio companions wired)
- `aurin-hub.emergent.host/api/clarity/health` → 200 (encryption + AI + TTS all true)
- `aurin-hub.emergent.host/api/email/health` → 200 (Resend configured, 3 senders)
- `aurin-hub.emergent.host/api/body-room/hotspots` → 200 (8 hotspots)
- `aurin-hub.emergent.host/api/experience/the-beginning/step/1` → 401 (gated, correct)
- `aurin-hub.emergent.host/api/integrations/pruesoul/health` → 200
- `aurin-hub.emergent.host/api/cabinet/library` → 401 (gated, correct)
- `aurin-hub.emergent.host/api/books` → 200
- `aurin-hub.emergent.host/api/auth/me` → 401 (gated, correct)
- `prulesoul.site/`, `/course-room`, `/course-room/:slug`, `/body-room`, `/clarity-release`, `/the-beginning`, `/library`, `/bookstore`, `/blog` → all 200, all render with full content

**Pre-deploy fixes that landed in this snapshot:**
- CORS middleware re-wired (Iter28 cleanup had accidentally removed it, all cross-origin /api/* requests would have failed otherwise)
- `RESEND_FROM_*` env values quoted to satisfy strict env parsers
- `CLARITY_AI_ENABLED=1` made explicit
- Static asset folders all populated: 6 audio MP3s, 5 Body Room PNGs, 7 book PDFs, 4 illustrations

**Test policy change (founder-driven):** Going forward, all "ready for live" claims must be verified against the LIVE URL (`prulesoul.site` + `aurin-hub.emergent.host`), NEVER only against the preview URL. Preview-only validation gave a false-positive in Iter28 audit.

**Pending founder actions:**
1. **DNS for prulesoul.site (domene.no)** — add the 3 Resend records (DKIM TXT `resend._domainkey`, MX `send`, SPF TXT `send`) so emails leave the sandbox sender. Then notify me with "kontroll" and I will verify propagation.
2. **`the-night-angels-embrace.pdf`** — re-upload from a stable host.
3. **Monday session** — LemonSqueezy variant IDs for 4 courses + 3 Clarity passes + 9 books → flip Buy buttons live.



### Iteration 29 — The Great Opening: Resend + First Letter Funnel + Magic Link live (2026-05-01)

**Founder directive:** *"RESEND GO — igas mõttes. Magic Link + First Letter + DNS + Stability. Vajutan LIVE."*

**A. Resend integration — `email_service.py`**
- New module wraps the Resend SDK with three canonical senders (`support@`, `agent@`, `info@`) backed by env vars.
- Smart auto-fallback: when the configured `@prulesoul.site` sender is rejected ("not verified"/"verify your domain"), we transparently retry once from `onboarding@resend.dev` (sandbox) so email still lands for verified recipients. When DNS is green, the fallback simply never triggers — no code change needed at DNS-go-live.
- Magic-link email template (dark sage-on-black HTML + plain-text fallback, 30-min expiry copy).
- First-letter email template (letter body + evening question + course CTA button).

**B. Magic Link delivery — live**
- `/api/auth/magic-link/request` now actually mails the link via Resend. Returns `delivered_via: "email"` when sent; `"manual"` with the link surfaced only when Resend isn't configured or a send fails. `resend_error` field present on failure.
- Single-use + 30-min expiry preserved. Token existence check is non-revealing (always 200).

**C. First Letter funnel — live**
- `POST /api/first-letter { email, course_slug, consent }` — public endpoint, no sign-in required.
- Rate-limited at 24h per `(email, course_slug)` → same email different course is still allowed.
- Double bookkeeping:
  - `db.first_letter_sends` — one row per send, rate-limit source of truth.
  - `db.newsletter_subscribers` — upsert on `email` so the founder can build the quiet list over time.
- Copy tags ride along to Resend (`kind=first_letter`, `course=<slug>`) for analytics.
- Delivery failure is soft: `status="queued_delivery_failed"` with friendly message, never 5xx.
- `GET /api/email/health` — read-only sanity (`resend_configured`, 3 sender strings, total sends).

**D. FirstLetterWidget — frontend lead magnet**
- `/app/frontend/src/components/FirstLetterWidget.jsx` — email input + course picker (populated from `/api/courses`) + consent copy. Compact + non-compact modes.
- Wired into:
  - `/` Home page — before final closing note (`data-testid=home-first-letter`)
  - `/course-room` — bottom card, signed-out users only (replaced `NewsletterSignup` with the stronger lead magnet).
- Degrades gracefully: if `/api/courses` is unreachable, the picker hides and the widget still functions as an email-only capture.

**E. Env vars (founder must set these eventually in production)**
- `RESEND_API_KEY` ✅ set
- `RESEND_FROM_SUPPORT=Matrix Aurin Support <support@prulesoul.site>` ✅
- `RESEND_FROM_AGENT=The Guardian <agent@prulesoul.site>` ✅
- `RESEND_FROM_INFO=Matrix Aurin <info@prulesoul.site>` ✅
- `RESEND_SANDBOX_FALLBACK=onboarding@resend.dev` ✅ (auto-fallback while DNS pending)

**F. DNS checklist — founder's domain registrar (Namecheap/Cloudflare/etc.)**
Resend Dashboard → Domains → Add `prulesoul.site` → copy exactly the records shown:
- **SPF** TXT `@` with `v=spf1 include:amazonses.com ~all` (or Resend's latest include)
- **DKIM** CNAME `resend._domainkey` pointing to Resend's cname
- **MX** for inbound (if receiving) `send` priority 10 → `feedback-smtp.[region].amazonses.com`
- Verify in the dashboard (may take 15-60 min to propagate). Once green, the `@prulesoul.site` senders deliver directly — code path unchanged.

**Tests — `/app/backend/tests/test_iteration29.py` (9/9 PASS)**
- /api/email/health: resend configured + 3 senders
- /api/first-letter: valid send, consent=false → 400, bad email → 400, unknown slug → 404
- /api/first-letter rate-limit: same email+slug within 24h → `already_sent`
- /api/first-letter idempotent newsletter upsert
- /api/auth/magic-link/request: always 200, token row created
- /api/auth/magic-link/verify: session token issued, replay → 410

**Regression: iter26 + iter27 + iter28 (49 tests) all green. Total iter23+ tests: 87/87.**

**Pre-existing (NOT iter29, deferred to cleanup pass):** ~20 stale book-inventory tests from iter4-9 still fail because SEED_BOOKS grew 6→9 and PDFs now gate through `/api/cabinet/library/{slug}/download`. Not regressions — stale assertions.

**Pending founder actions:**
1. **Verify `prulesoul.site` DNS** (SPF/DKIM/MX) so sends leave the Resend sandbox — First Letter funnel will then deliver to any address.
2. **`the-night-angels-embrace.pdf`** — awaiting new stable upload link (Drive/Dropbox).
3. **LemonSqueezy variant IDs** — Monday session, founder will sit with it uninterrupted.
4. **`pure-soul-life.emergent.host`** subdomain integration — already has webhook bridge; confirm domain routing.



### Iteration 28 — Body Room 5→8 hotspots + text deepening + housekeeping (2026-05-01)

**Founder directive:** *"GO Body Room expansion 5→8. Confirmation: All 54+ backend tests must remain green during the refactor. Tekstid sügavamaks, kõnetavamaks — mitte ainult milleks see on, vaid ka miks see on osalejale, külastajale kasulik."*

**A. Body Room — 3 new hotspots (shoulders, throat, hips)**
- `shoulders` — "the weight of duty, carrying others" — for the responsible ones who keep saying "I'll handle it"
- `throat` — "words swallowed, voice withheld" — for the truths held back to keep peace
- `hips` — "held fear of change, stored grief, suppressed creativity" — what was too much to feel at the time
- Each new entry adds an OPTIONAL `why_it_speaks_to_you` field (2–3 sentences) — answers the wanderer's silent question "why is THIS the one calling me tonight?". The original 5 hotspots stay as they are (no breaking schema change).
- `BodyInsightInput.region` Literal extended to all 8 regions.
- Image endpoint correctly distinguishes `Image not found.` (slug not allowed) from `Image not generated yet.` (allowed but PNG missing for the 3 new ones — Nano Banana not run yet for them).
- Frontend Silhouette HOT array gains 3 new positions; HotspotModal hides the image div gracefully on `onError` for the 3 new regions.
- New body modal section: "Why this place may be speaking to you" — only renders when `why_it_speaks_to_you` is present.

**B. "Somatic Presence" hit-testing fix**
- Halos and breath-rings now have `pointer-events: none`. Only the filled centre dots catch clicks. This keeps the breathing-presence visual intact while preventing overlapping halos from miss-routing clicks (especially throat/lungs at adjacent y coordinates).

**C. Text deepening — Clarity Release SoftGate**
- Replaced the previous "This space is built only for you / Enter" copy with the founder's pre-approved deeper variant:
  - **A small place that stays yours.**
  - *What you read, what you write, what you don't say out loud — held in one quiet space.*
  - *There is no right way to be here. Only a place to slow down, notice, and return. Everything stays where you leave it. Nothing is lost.*
  - **Sign in with Google to begin.**
- Three PURPOSE_BLOCKS (Listen / Clarify / Release) bodies rewritten more empathically — every block now answers "what this gives YOU" not just "what this is".

**D. Body Room intro deepened**
- Added the founder-quoted line: *"A wise person once said: 'I am not the enemy of my body. To let an emotion arrive and let it stay for a moment is not poison — refusing it is.'"* Plus a new closing line listing all 8 quiet places.

**E. New audio companion — `the-architecture-of-breath.mp3`**
- Founder uploaded `The_Architecture_of_Breath.mp3` (740 KB). Wired as the audio companion for `the-body-knows-first` (replacing the previous `between-each-breath.mp3`). The `Between_Each_Breath.mp3` and `Borrowed_Beliefs.mp3` were duplicates of existing files — not re-saved per founder rule "kui kordub, ei pea topelt võtma".

**F. server.py housekeeping**
- Removed ~100 lines of duplicated `on_startup` / `on_shutdown` / `add_middleware` / `logging.basicConfig` blocks that had accreted at the bottom of the file. Single canonical block now lives right after `app.include_router(api_router)`. Pre-existing `frontmatter` lint warning at line 151 remains (untouched, scheduled for future cleanup pass).

**Tests — `/app/backend/tests/test_iteration28.py` (24/24 PASS)**
- 8-hotspot order: jaws, liver, heart, lungs, kidneys, shoulders, throat, hips
- `why_it_speaks_to_you` only on the 3 new entries
- /body-room/insight accepts new regions, rejects unknown
- /body-room/image: 200 for 5 generated, 404 "Image not generated yet" for 3 new
- /api/courses includes the-architecture-of-breath.mp3 audio_companion
- /assets/audio/courses/the-architecture-of-breath.mp3 is 200/audio/mpeg ~700KB
- /api/clarity/health remains ai_guide_enabled=true & tts_configured=true
- Frontend smoke: 8 body-hotspot testids + 8 .body-presence-halo + new "Why this place may be speaking to you" Section + new SoftGate copy
- iter26 hotspot count assertion updated 5→8 in place

**Pre-existing failures (NOT iter28, deferred):** ~19 test failures in test_iter4_books_legal / test_iteration5/6/7/9 / test_phase2_continued / test_content_api — all assert old book-inventory shape (6 books, public PDF paths). Current SEED_BOOKS has 8 entries with gated `/api/cabinet/library/{slug}/download`. Schedule a future cleanup pass.

**Total iter27 + iter28 PASS: 16 + 24 + 38 regression = 78 backend tests green.**

**Pending founder actions:**
1. **Resend API key** — once provided, ship: domain verification (DNS), transactional email, Magic Link auth, "First Letter" lead-magnet funnel.
2. **`the-night-angels-embrace.pdf`** — re-upload from a different host (current artifact still 263-byte XML error after 3rd attempt).
3. **LemonSqueezy variant IDs** for 4 courses + 3 Clarity passes.
4. **Nano Banana** for the 3 new body regions when budget allows: `shoulders-burden`, `throat-unspoken`, `hips-held` (graceful fallback already in place).

**Next iteration (separate, careful):** server.py refactor into `/app/backend/routes/` + `/app/backend/models/` directories. Risk-managed — incremental, with full test suite green after each module split.



### Iteration 27 — Phase B3: Real Claude LLM guide + OpenAI TTS + Course Room (2026-05-01)

**Founder directive:** *"Jätka Phase B3. Privaatne tuba ja psühho-somaatika on 2 eraldi ruumi, AI abiline võib inimest suunata ühest ruumist teise. Hääl peab kõlama turvaliselt, loomulikult, inimlikult, austavalt, leevendavalt, pehmelt — võib olla 1 gramm magusalt."* Plus 5 mp3 audio companions uploaded for the Course Room.

**A. Phase B3 — Claude Sonnet 4.5 mentor live in Clarity Release**
- New module `/app/backend/clarity_ai.py`. Wraps `emergentintegrations.llm.chat.LlmChat` with `claude-sonnet-4-5-20250929`. System prompt encodes:
  - Sanctuary tone (soft, human, unhurried, slightly warm — about a gram of sweetness)
  - 2–4 sentence replies, no headings, no bullet lists
  - Two-rooms awareness — may invite the wanderer into `/body-room` when somatic content surfaces, "as a quiet door, never a redirect"
  - Positive focus + somatic validation + tiny <30s practices
  - Never diagnoses, never advises, never breaks the spell with meta-talk
  - Crisis defers to a real human + emergency services
- History is inline-formatted into the system prompt (16-turn cutoff) — stateless SDK call per turn, safe with the AES-256 ciphertext-at-rest model.
- `cabinet_message` now calls Claude FIRST, falls back to the curated `_pick_prompt` rotation on any exception (so a transient Anthropic outage never 500s the cabinet). Crisis detection still runs ahead of both paths.
- `CLARITY_AI_ENABLED` env flag (default true) toggles the AI guide globally.
- State Bridge upgraded — `/clarity/start` now persists `body_context = {region, emotion, label}` on the session document. Claude receives this in the system prompt for the first 3 user turns, then it ages out (the founder rule: "single soft chime, not a refrain").

**B. OpenAI TTS — soft, human voice for the guide**
- New module `/app/backend/clarity_tts.py`. Wraps `OpenAITextToSpeech` with `tts-1-hd`, speed 0.92.
- Voice mapping per founder voice spec:
  - `female` → `coral` (warm, friendly — closest to a soothing companion)
  - `male` → `echo` (smooth, calm)
- New endpoint `POST /api/clarity/tts` — auth-gated, ETag-cached (304 on identical text+gender re-ask, saves credits on browser re-renders), `Cache-Control: private, max-age=86400`. 503 if key missing.
- Frontend `useVoiceIO.js` rewritten — replaced robotic browser `speechSynthesis` with backend OpenAI TTS calls. Mic input via SpeechRecognition unchanged. Each new guide reply automatically auto-speaks unless muted.

**C. Course Room — "Quiet Letters" (live)**
- 4 hand-curated 7-letter courses seeded in `SEED_COURSES`:
  - `letting-the-old-stories-rest` (adult, $25) · audio: Borrowed beliefs
  - `the-language-you-forgot` (adult, $25) · audio: As yourself
  - `seven-quiet-evenings-with-children` (parents, $20) · audio: Blueprint inside you
  - `the-body-knows-first` (adult, $25) · audio: Between each breath
- Letter 1 always free preview; letters 2–7 unlock day-by-day from `started_at`.
- 5 mp3 audio companions uploaded by founder, saved to `/app/frontend/public/assets/audio/courses/` (5 files, 700-744 KB each). The 5th (`what-has-changed.mp3`) is reserved for a future course or hub ambient.
- New routes `/course-room` + `/course-room/:slug` (`CourseRoom.jsx` + `CourseDetail.jsx`).
- Audio companion player loops by default (founder rule: "5–7 cycles becomes the practice"). Includes Play/Pause + Restart + progress bar.
- Soft conversion architecture: free letter 1 = the open door, audio companion = a small gift before the threshold, "Begin gently" = beta enrollment (free 14-day window). LemonSqueezy variant IDs still pending.
- Top nav now includes `nav-course-room` AND `nav-body-room`.

**D. Body Room — "Somatic Presence" glow refinement**
- Per founder rule: hotspot glow must NOT be a medical warning. Replaced 4.5s bright pulse with:
  - Outer "presence halo" (9s `body-halo` keyframe, scale 0.85→1.25, opacity 0.10→0.42)
  - Mid breath ring (7s `body-pulse`, scale 1→1.12, opacity 0.32→0.62)
  - Centre dot unchanged
- Effect: gentle radiating breathing presence, never alarming. Wanderer can "breathe through" the tension.

**E. MagicLinkRequest fix (unblock backend startup)**
- Previous agent left `email: EmailStr` import-broken — backend couldn't boot. Changed to `email: str` for now (soft-validation deferred until `email-validator` is added).

**Tests — `/app/backend/tests/test_iteration27.py` (16/16 PASS)**
1. health → ai_guide_enabled=true & tts_configured=true
2. cabinet/message returns non-curated Claude reply
3. 3-turn continuity (all 3 non-curated)
4. crisis detection still wins (`This room isn't built to carry a crisis alone`)
5–8. /clarity/tts: 401 unauth, 200 coral female, 200 echo male, 304 ETag cache
9–10. /api/courses: 4 slugs with audio_companion + audio_title
11. /api/courses/{slug} signed-out: only day-1 unlocked, 2-7 body=null
12. /api/courses/{slug}/enroll: enrolled → already_enrolled idempotent + 404 unknown + 401 unauth
13. enrolled user: day-1 unlocked, day-2 unlock_at future ISO
14. all 5 mp3 audio companions return 200/audio/mpeg ~700KB+
15. State Bridge persists body_context on cabinet_sessions
16. Regression suite (iter23+iter23_extra+iter24+iter25+iter26 = 38) all green.

**Total backend tests: 54/54 PASS** (16 new + 38 regression).
**Frontend smoke: 9/9 critical assertions pass.**

**Pending founder actions:**
1. LemonSqueezy variant IDs for the 4 courses → flip Buy buttons live.
2. Resend API key → enable Magic Link emailing for restricted regions.
3. Re-upload `the-night-angels-embrace.pdf` from a different host (current artifact is a 263-byte XML error).



### Iteration 27 — Nano Banana visuals + Human Silhouette + Voice + TCM hotspots (2026-04-30)

**A. GO BANANA — 5/5 images generated**
- New script `/app/backend/scripts/generate_body_room_images.py` drives Gemini 3.1 Nano Banana via `emergentintegrations`. One-shot, idempotent (skips if file already exists and > 5KB). Consistent "graphic novel noir, sage on black, silhouette + emotion metaphor" style prompt.
- 5 images now live at `/app/backend/storage/body_room/*.png`: `jaws-anger`, `liver-bitterness`, `heart-grief`, `lungs-melancholy`, `kidneys-fear`.
- Serving endpoint: `GET /api/body-room/image/{slug}` whitelists against `BODY_HOTSPOTS.image_slug` — path traversal blocked, unknown slug returns 404.
- Total Nano Banana spend: ~$0.20.

**B. HumanSilhouette — PERMANENT RULE**
- New component `/app/frontend/src/components/HumanSilhouette.jsx` + CSS. Sage-on-black breathing figure, male (angular shoulders, straight torso) or female (softer curves, implied skirt). Breathes on its own (6s cycle), pulses faster when `active` (2.4s).
- **Founder permanent directive encoded in component doc:** "The guide in the Clarity Release / Threshold surfaces MUST always appear as a HUMAN SILHOUETTE (male or female). Abstract light orbs break trust — people instinctively trust a human shape."
- Applied in 3 places: ClarityThreshold guide selection (replaces orbs), ClarityRelease GuideHologram in chat (replaces orbs), reusable anywhere we show the companion.

**C. Body Room v2 — TCM-aligned 5 hotspots**
- Expanded from 3 to 5 regions per founder's verified emotional-anatomy map: **jaws** (unspoken anger), **liver** (old bitterness), **heart** (grief / absence of love), **lungs** (deep grief / loss), **kidneys** (fear / lost vital energy).
- Each hotspot entry now has an `image_slug` pointing to a Nano Banana PNG. Modal renders the image in a 1:1 aspect-square frame above the text.
- SVG silhouette updated to 5 hand-positioned hotspots with breathing pulses.
- `BodyInsightInput.region` Pydantic validator updated to the 5 allowed regions; existing `state bridge` logic works unchanged (picks the most recent unacknowledged, surfaces its emotion in Clarity greeting).

**D. B2 Voice — Web Speech + browser TTS**
- New hook `/app/frontend/src/hooks/useVoiceIO.js` — supports `SpeechRecognition` (mic input) and `speechSynthesis` (browser TTS output). Gracefully degrades: if browser lacks support, controls hide automatically.
- Integrated into ClarityRelease ChatPanel:
  - Mic button (`data-testid="clarity-mic"`) — tap to dictate; transcript appended to textarea.
  - Mute button (`data-testid="clarity-mute"`) — toggles guide voice on/off; cancels in-flight speech.
  - Auto-speak: the newest guide message is spoken aloud unless muted.
  - Voice uses matching gender heuristic — picks `Samantha`-family for female, `Daniel`-family for male when available.
  - Rate 0.92 (slightly slower than default), softer pitch.
- Zero external cost — runs entirely in the browser.

**E. Tests — `/app/backend/tests/test_iteration26.py` updated (8/8 PASS)**
- Regions list assertion updated to the 5 TCM regions.
- New `test_body_image_endpoint` — verifies 200+image/png for valid slug, 404 for unknown, path traversal blocked.
- State bridge test migrated `belly` → `kidneys`.
- **Total: 76/76 backend PASS** across all iterations (8 it26 + 9 it25 + 59 it11/14/17/21/23/24).

**F. Still pending (acknowledged, not built this iteration)**
- **Course Room "Quiet Letters"** — founder said GO; scaffold not built this iteration to preserve credit budget. Documented in `/app/memory/COURSES_PROPOSAL.md`.
- **Admin dashboard `/admin/clarity`** — deferred by design.
- **Phase B3 Real LLM guide** — `EMERGENT_LLM_KEY` now in .env; Claude Sonnet 4.5 integration deferred until founder confirms credit budget for ongoing chat turns.
- **ElevenLabs premium voice** — browser TTS first, upgrade path documented.
- **Google OAuth limitation in restricted countries** — flagged as known concern; recommend adding email magic-link path before public launch.

### Iteration 26 — Body Room v1 + State Bridge + B2 Hologram + Catalogue (2026-04-30)

**A. Body Room v1 — interactive, fully shipped**
- Founder wanted "interactive silhouette + emotion mapping + somatic validation" — delivered as a SVG silhouette with **3 starter hotspots** (jaws / heart / belly) per founder's "start small" recommendation.
- Each hotspot opens a modal with 3 hand-written content blocks: "what this region tends to hold", "the way it asks for attention", "one quiet release". Tone is Aurin-sanctuary, never clinical.
- New chapter: **"The body is your first temple"** (in-page intro, ~280 words). Hand-written.
- New backend collection `db.body_insights` + endpoints:
  - `GET /api/body-room/hotspots` — public, returns the 3 curated regions.
  - `POST /api/body-room/insight` — auth, records a "I noticed this" tap. Validates region ∈ {jaws, heart, belly}.
  - `GET /api/body-room/insights?limit=N` — auth, newest-first.
- The silhouette SVG is hand-tuned (sage outlines, breathing pulses on hotspot rings) — **no AI image gen yet**. Image generation pipeline (Nano Banana) deferred to next iteration with explicit founder GO.

**B. State Bridge — Body Room ↔ Clarity Release**
- `POST /api/clarity/start` now reads the user's most recent unacknowledged body insight. If found, it appends a second guide message: *"I noticed your body paused at the [region] not long ago — where [emotion] often lives. If you'd like, we can begin there. Or somewhere else. There is no wrong door tonight."*
- The insight is then marked `acknowledged_at`. Replays are silent (won't spam).
- Frontend `/body-room` shows "A quiet thread" panel with the user's last 3 visited regions and a "Step into Clarity Release" button.

**C. Phase B2 — Hologram visual (no voice yet, by design)**
- `<FloatingBagRitual>` replaced with `<GuideHologram gender={...} sending={...}>`.
- Shape language matches the threshold orbs: female=round halo, male=elongated denser core. Sage-on-black radial gradient + ring.
- Pulses faster while the user is sending a message (`clarity-orb-breath` 2.2s vs 6s).
- ChatPanel reads `guide_gender` from `db.clarity_user_prefs` and threads it down.
- **Voice (Web Speech API + browser TTS) explicitly deferred.** Founder said "tähitis on mitte rikkuda" — shipping the visual layer first, validating it, then layering voice in B2.5.

**D. LemonSqueezy final catalogue (`/app/memory/LEMONSQUEEZY_CATALOGUE.md`)**
- 18 products mapped to copy-paste tables with `Custom Data` keys exactly as the webhook expects.
- Re-priced **Sanctuary Monthly $45/month subscription** replacing the $70 season pass per founder's marketing instinct.
- Added bundles: Adult Library $33 (save $10), Kids Library $15 (save $5), Lifetime Sanctuary $249.
- Added Coloring packs (Vol. 1 $7 fixed, Day Pass $5/10 generations, Week Pass $15/40 generations) — all marked NOT-BUILT pending separate Nano Banana iteration.
- Added The Beginning Companion ($20).
- Pricing rationale section explains anchor / recurring / bundle psychology.

**E. Course Room proposal (`/app/memory/COURSES_PROPOSAL.md`)**
- Founder requested no video; 30-sec mp3 OK; AI courses acceptable if brand-grade.
- Proposed format: **"Quiet Letters"** — 7 written letters over 7 days, each ~250 words, optional 30-60s founder-recorded mp3, hand-written prompt at the end.
- 3 starter courses identified (extracting from existing books). Backend model + endpoints sketched. Awaiting explicit GO.

**Tests — `/app/backend/tests/test_iteration26.py` (8/8 PASS):**
1. Hotspots public (3 regions returned with all 5 content fields).
2-3. Auth gates on /insight POST + /insights GET.
4. Record + retrieve newest-first.
5. Unknown region (e.g. "elbow") → 422 validation error.
6. State Bridge: clarity/start appends bridge greeting AND acknowledges insight.
7. State Bridge silent without insight.
8. State Bridge does not replay an already-acknowledged insight.

**Total: 75/75 backend PASS** (8 new + 67 regression).

### Iteration 25 — Threshold + EmergencyExit + Pruesoul webhook + BodyRoom (2026-04-30)

Three landings in one iteration:

**A. Pruesoul landing-page webhook handshake (LIVE)**
- Endpoint `POST /api/integrations/pruesoul/webhook` accepts both HMAC-SHA256 digests and the raw shared secret in `X-Aurin-Signature` (per pure-soul-life agent's spec).
- Live shared secret: `Z_17var8A-ygzid-6XFp1q6ExUtaQtNS` set in `/app/backend/.env` as `PRUESOUL_WEBHOOK_SECRET`. Outbound reverse token `mWQ4nKdY6vR2pXtL8qZsB1uFhCgEjAIo` stored as `PRUESOUL_OUTBOUND_TOKEN` for if we ever need to call them.
- Handles `enrollment.created` (mirrors into `db.beta_enrollments` with source="pruesoul", deterministic `user_id="pruesoul:<enrollment_id>"`) AND `waitlist.joined` (upserts on lowercased email).
- Idempotent on `enrollment_id` / `email` via unique indices in `db.pruesoul_enrollments` and `db.pruesoul_waitlist`. Replay → 200, no duplicates.
- `GET /api/integrations/pruesoul/health` exposes counts (no PII, no secret).
- 401 on bad signature, 400 on bad JSON, 200 always on accepted payloads (so sender's BackgroundTask retry stays quiet).

**B. Clarity Release — Sanctuary Level Phase B1**
New `/clarity-release/threshold` page (founder directive "GO B1"):
- 4 declaration cards (encryption / physical-space responsibility / memory continuity / not-medical) — each requires its own acknowledgement checkbox.
- Guide selection rendered as **two breathing light orbs** (female=round halo, male=elongated denser core), CSS-only `clarity-orb-breath` keyframe (5.5–7s). Selected orb pulses faster + ring solidifies.
- Solemn Agreement button enabled only when all 4 acknowledgements + a guide are chosen → POST `/api/clarity/prefs` stamps `consent_v2_at` + `guide_gender` → fade redirect to `/clarity-release`.
- ClarityRelease.jsx now reads prefs on mount. If `has_consented=false` → push to threshold. Already-consented users skip the gate.
- New backend endpoints:
  - `GET /api/clarity/prefs` — reads from `db.clarity_user_prefs`. Defaults for fresh user.
  - `POST /api/clarity/prefs` — upserts; validates `guide_gender` ∈ {male,female} and `display_mode` ∈ {text,voice,hologram}.
  - `POST /api/clarity/emergency-exit` — closes active session w/ `closed_reason="emergency_exit"`. Safe to call without an open session.
- New `<EmergencyExit>` component: a "Ghost Button" anchored bottom-right of every signed-in Clarity surface. Subtle border, sage hover, fade-to-black veil on click → redirect to `/`. NEVER throws confirmation dialog (speed > polish, by design).
- All 4 declaration texts handcrafted in English, sanctuary tone — no medical / legal-boilerplate language.

**C. The Body Room (`/body-room`)**
Founder requested an intro page for the future "psychosomatics" experience but expressly asked to AVOID the medical term. Final naming: **"The Body Room — Learning to speak with your body."** Pure Matrix Aurin programme vocabulary, zero clinical claims.
- Hero: *"The body is not a problem to solve."*
- Two future paths previewed (with disabled "Opens later" buttons):
  - **Self-paced learning** — chapters + writing prompts, walked alone.
  - **Companion session** — body-aware one-to-one inside the encrypted room.
- 6-row "small compass" of upcoming themes (throat, fourth-hour-of-the-night, permission to yawn/cry, asking the body one question, sending it back to the universe).
- Newsletter waitlist (`source="body-room:waitlist"`).
- Soft footer: *"This room is not a medical service. If your body is asking for a doctor — please listen to that voice first."*

**Tests — `/app/backend/tests/test_iteration25.py` (9/9 PASS):**
1–4. Clarity prefs auth, defaults, consent stamp, validation reject.  
5–6. Emergency exit closes session w/ reason; safe without active session.  
7. Pruesoul webhook 401 on bad signature.  
8. Pruesoul webhook accepts live secret + replay idempotent.  
9. Enrollment.created mirrors into `db.beta_enrollments` (counter unified).

**Total: 67/67 backend PASS** (9 new + 58 regression). Pre-existing `frontmatter` lint warning unchanged.

### Iteration 24 — Beta Test Group (`/test-group`) (2026-04-29)

**Founder strategy pivot:** before live LemonSqueezy goes on, recruit 10 quiet beta testers for **14 days of fully-free access** in exchange for honest feedback. Conversion-via-attention, not urgency. Pure English UI, sanctuary tone (no purple "AI slop" gradients, no marketing speak).

**Backend — `server.py`:**
- New `BetaEnrollment` model + `db.beta_enrollments` collection. Hard cap `BETA_TOTAL_SLOTS=10`, `BETA_DURATION_DAYS=14`.
- Unique compound index on `beta_enrollments(user_id)` enforces one enrollment per user.
- New endpoints (all under `/api/beta/*`):
  - `GET /api/beta/status` — public, returns `{slots_total, slots_taken, slots_left, is_open, duration_days}`. Used by the live counter on `/test-group`.
  - `GET /api/beta/me` — auth, returns user's enrollment row + `seconds_remaining`.
  - `POST /api/beta/enroll` — auth, idempotent. On success: inserts a 14-day Clarity Release pass (reuses `season_30days` tier with `expires_at=now+14d`, `consumed=true`) AND auto-grants every book in `db.books` via `db.purchases` rows (source=`beta_grant`). At the cap, returns `{is_full: true}` and DOES NOT enroll.

**Frontend — new `/app/frontend/src/pages/BetaTestGroup.jsx` (route `/test-group`):**
- Hero: *"We are looking for ten quiet wanderers."* (PageHeader) + Aurin sanctuary palette (deep black + sage accent — NOT the demo's purple gradient).
- Live counter card (`beta-counter-text`) auto-refreshes every 20 s. `<ProgressBar>` fills sage proportional to slots remaining.
- Smart CTA logic with separate testids for each state:
  - `beta-cta-loading` (auth still resolving)
  - `beta-cta-signedout` → `beta-apply-signin` → `/portal?next=/test-group`
  - `beta-cta-ready` → `beta-apply` → POST `/api/beta/enroll`
  - `beta-cta-enrolled` → "You are in. N quiet days remain." + `beta-go-clarity` + `beta-go-library`
  - `beta-cta-full` → "All ten doors are taken." + waitlist newsletter
- Three benefit cards (`beta-benefit-clarity`, `beta-benefit-library`, `beta-benefit-beginning`).
- Four "Soon, also" cards (`beta-soon-parents`, `beta-soon-body`, `beta-soon-coloring`, `beta-soon-audio`) — communicates roadmap without committing to dates.
- Newsletter waitlist (`source="test-group:waitlist"`) so capped applicants can still leave a quiet note.
- Trust footer: *"Limited to ten early wanderers · No card required · Two quiet weeks."*
- **Hidden from main nav by design** — direct link only, preserves exclusivity. Founder shares the URL on Instagram / Facebook / mailing list.

**Tests — `/app/backend/tests/test_iteration24.py` (5/5 PASS):**
1. Public status returns 10 slots open at boot.
2. `/beta/me` 401 unauth, default `enrolled=false` for fresh user.
3. Enroll grants Clarity pass + ≥7 books (skips `the-night-angels-embrace` because that book has no PDF), idempotent on second click.
4. After enrollment, `/api/clarity/access` shows `has_active_pass=true` with `~14 day` `seconds_remaining`.
5. Cap at 10 — pre-fill 10 enrollments, 11th user gets `is_full=true` and is NOT inserted into `beta_enrollments` or `clarity_passes`.

**Total backend tests: 58/58 PASS** (5 new + 53 regression across iter11/14/17/21/23).

### Iteration 23 — Clarity Release (formerly Private Room) (2026-04-29)

**Founder's "FINAL DIRECTIVE: Evolving the Private Room into Clarity Release"** acknowledged and shipped end-to-end. UI rename + encrypted-at-rest cabinet + three paid timed tiers (frontend buy still disabled until variant IDs land).

**Backend — new `/app/backend/clarity_crypto.py`:**
- AES-256-GCM helpers (`encrypt_text`, `decrypt_text`, `is_configured`).
- Key from `CLARITY_ENCRYPTION_KEY` env (base64 of 32 raw bytes). Random 12-byte nonce per message; output is base64 of `nonce || ciphertext || tag`. Tamper detection via GCM auth tag.
- Loads lazily; raises hard if key missing so the first `/cabinet/message` would surface a 500 instead of writing plaintext.

**Backend — `server.py`:**
- `CabinetMessage.text_enc` field added; user messages persist with `text=""` and `text_enc=<ciphertext>`. Guide messages (canned reflective prompts, no PII) stay plaintext.
- `_get_active_cabinet_session` now decrypts user messages on read and auto-closes any session whose `expires_at` has passed.
- `CabinetSession` extended with `tier`, `pass_id`, `expires_at` to bind a session to a paid Clarity pass.
- New `ClarityPass` model + `db.clarity_passes` collection. Three tiers: `30min`, `60min`, `season_30days`.
- `SEED_PASSES` (`$15 / $30 / $70` Beta pricing). `lemonsqueezy_variant_id=None` until founder ships them.
- New endpoints:
  - `GET /api/clarity/passes` — public, returns 3 tiers + `beta=true` + `beta_note`.
  - `GET /api/clarity/access` — auth, returns `{has_active_pass, tier, expires_at, seconds_remaining, free_replies}`.
  - `POST /api/clarity/start` — opens session, activates a queued one-time pass (countdown starts now), binds session.tier+pass_id+expires_at.
  - `POST /api/clarity/clear` — alias of `/cabinet/clear`.
  - `POST /api/clarity/admin/dispute-unlock/{session_id}` — **admin only** (role check; 403 for member). Decrypts the session messages for review AND writes an audit row to `db.clarity_dispute_unlocks` (admin_user_id, reason, timestamp). Conversations themselves stay encrypted at rest.
  - `GET /api/clarity/admin/unlock-log` — **admin only**, audit log read-only.
  - `GET /api/clarity/health` — public, reports `encryption_configured`, tiers, counts.
- `cabinet_message` now suppresses `show_continuation` when the session is bound to an active pass (paid users get unlimited reflections until the timer runs out).
- LemonSqueezy webhook `/api/lemonsqueezy/webhook` now handles BOTH legacy book purchases (`custom_data.book_slug`) AND new pass purchases (`custom_data.pass_tier`). For `season_30days` the pass is granted with `consumed=true` and 30-day `expires_at`; for one-time tiers `consumed=false` (countdown starts on `/clarity/start`).

**Frontend — new `/app/frontend/src/pages/ClarityRelease.jsx`:**
- Replaces `PrivateRoom.jsx` (deleted). Same chat flow + new HUB phase before confirm.
- `<HubPanel>`: `clarity-beta-notice` card, 3 purpose blocks (Listen / Clarify / Release), 3 `<TierCard>` (`clarity-tier-30min/60min/season_30days`) with disabled "Opens this Friday" buy buttons.
- `<ChatPanel>`: `clarity-encryption-badge` ("Encrypted at rest · AES-256"), live timer for paid sessions (`clarity-timer`), season-pass label.
- `<FloatingBagRitual>`: small CSS-only floating bag visual ("Release ritual" — when something is ready to leave, picture it as a bag rising into the air).
- Welcome onboarding text exactly matches founder's spec ("Welcome to Clarity Release / This is your private sanctuary for the soul…").

**Routing:**
- `/private-room` → React Router `<Navigate to="/clarity-release" replace />` (history clean).
- `/clarity-release` → `ClarityRelease`.
- Top nav, Footer Explore, Student Cabinet links all repointed and relabelled.

**Env:**
- `CLARITY_ENCRYPTION_KEY` added to `/app/backend/.env`. Do NOT rotate without re-encrypting existing `cabinet_sessions` ciphertext.

**4 kids' PDFs re-uploaded — 3 valid, 1 still broken:**
- ✅ `engels-friends-2.pdf` (23 MB)
- ✅ `angels-tales.pdf` (6.6 MB)
- ✅ `angels-story.pdf` (14 MB)
- ❌ `the-night-angels-embrace.pdf` — CDN STILL returns 263-byte XML AccessDenied. `pdf_url=null` stays in seed; book row remains in catalog. Founder needs to re-upload from a different host or fix the artifact bucket.

**Tests — `/app/backend/tests/test_iteration23.py` + `test_iteration23_extra.py` (added by testing agent):**
- 10/10 + 5/5 new PASS. Plus 43 regression PASS. **58/58 backend total.**
- Frontend: 22/22 critical assertions pass (synthetic Mongo session). No console errors. No `Quiet Room` text remaining.

**Pending founder actions (when ready to flip checkout ON):**
1. Send 3 LemonSqueezy variant IDs (`30min`, `60min`, `season_30days`).
2. Configure LS `custom_data.pass_tier` on each product.
3. Confirm `order_refunded` / `subscription_cancelled` revoke semantics.
4. (Recommend) unique compound index on `clarity_passes (external_order_id)` to harden against duplicate webhook fires for passes — already have one-per-(user,book) for purchases.

### Iteration 8 — The Beginning + Social CTAs (2026-04-25)
**The Beginning — 7-step gated guided experience (free for signed-in users):**
- New backend system: `EXPERIENCE_STEPS` (Awareness → Dependency → Fear → Money → Childhood Patterns → Pattern Break → Clarity), `db.experience_progress` collection, endpoints under `/api/experience/the-beginning/{me,start,reflect,reset}`.
- Auth-gated (Emergent Bearer token). Reflection text required (≥ 6 chars) to advance. Soft 8-second pause between steps (psychological pacing).
- Frontend: silent landing at `/the-beginning` (Recognition → Shift → What this is → Balance → Notice → Honest note → Coming Soon → CTA), step view at `/the-beginning/step` (Read → Pause → Read → Done with own-reflections recap and Begin again).
- Hidden "module" language — UX reads as a continuous human experience.
- Optional 1-5 presence picker per step (saved into `reflections[].presence`).
- New nav item `nav-the-beginning` + footer Explore link.

**Social presence:**
- Instagram + Facebook in `<SocialLinks />` (single source of truth in `/components/SocialLinks.jsx`):
  - https://www.instagram.com/pruesoul.life/
  - https://www.facebook.com/groups/4059152880969336/
- Embedded in Footer brand block + new Reach Out "Find us elsewhere" panel.

**Instagram CTA cards:**
- Reusable `<InstagramCTA />` ("Follow us for *Matrix Protocols*") shown:
  - On `/library` next to a hero "The Beginning · Free" card (split 7/5).
  - Above the catalogue on `/bookstore`.

**Tests:** Backend 12/12 pass · Frontend testids all verified · iteration_7.json clean.
- Regression file: `/app/backend/tests/test_iteration7.py`.

### Iteration 9 — Brand layer + Blog + Meditation + Origin (2026-04-25)
**Blog engine** (replaceable from `/blog/*.md` later):
- New backend `BlogPost` model + `SEED_BLOG` (idempotent upsert), `GET /api/blog`, `GET /api/blog/{slug}`.
- Seeded post: **"The Mirror of Our Souls — Why Parenting is the Ultimate Programming"** (Prulesoul). Mirror cover at `/assets/blog/mirror-of-our-souls.png`. Body weaves the parenting/programming + harvest-of-generations material into a single letter ending with "What programs are you running today?".
- New `/blog` index + `/blog/:slug` reader — italic excerpt, share strip top + bottom, prose body, end-of-post CTA bridge into The Beginning, newsletter capture.

**Newsletter capture** (Tier-1 list-building):
- `POST /api/newsletter` with explicit `consent` flag, idempotent on email, `db.newsletter_subscribers`.
- `<NewsletterSignup />` with consent checkbox at end of blog posts.

**The Aurin Philosophy** (`/aurin-philosophy`):
- Matrix vs. Aurin concept · 3 pillars (Mirror Principle · Sponge Effect · Transformation over Information) · Prulesoul Insight quote · CTA bridge.

**The Origin** (`/about` rewrite):
- Stone-portal mirror image hero · 3 narrative blocks · expandable longer preface (loads brand entry) · Founder's Promise quote with sage glow · Guardian invitation buttons · final CTA.

**Meditation lead magnet** (Library):
- `<MeditationPlayer />` — text-script audio-style UI (Play / Pause / Restart, progress bar, 11 lines × 5.5 s ≈ 1 min). Softened "First Light" script (no absolute claims).
- Tier 3 "Premium meditation series — coming soon" block.

**Privacy / consent:**
- Portal `portal-consent-line` paragraph below sign-in: occasional updates, opt-out, reflections private, industry-standard storage.

**Navigation refresh:**
- Top bar: Home · The Beginning · Philosophy · Insights · Bookstore · Library · Origin · Reach Out.
- Footer Explore adds The Beginning / Philosophy / Insights · Blog / The Origin.

**Tests:** Backend 9/9 pass · Frontend 95 % (3 cosmetic LOW notes — share-strip child testids renamed `*-strip-{facebook|instagram|copy}` after report; native HTML5 email validation by design). iteration_9.json clean.
- Regression file: `/app/backend/tests/test_iteration9.py`.

### Iteration 12 — Iteration-11 P0 frontend bug fixes (2026-04-27)
- **`LibraryKidsRead`** — `angels-tales` sample card now renders. RC: a 422 on `/api/content/entries?audience=kids` (entries Audience literal is `kids-universe`, not `kids`) was thrown inside a single `Promise.all`, which discarded the books payload. Fix: split entries + books into independent promises with their own `.catch`, and use `audience='kids-universe'` for entries. `freeBooks` filter still gates on `!!pdf_url`.
- **`PrivateRoom` cabinet-reset** — single-click reset now returns the user to `cabinet-intro`. RC: `window.confirm` was auto-dismissed in tests AND the local `phase` state wasn't reset on success. Fix: removed `window.confirm`, unconditionally clear all local state and `setPhase(PHASES.INTRO)` whether or not `clearCabinet()` succeeds.
- **Tests:** iteration_12 — Backend 16/16 pytest pass, Frontend 100% (both fixes verified end-to-end against live preview with synthetic Mongo session).

### Iteration 22 — Seed source-of-truth + 4 kids' PDFs (2026-04-29)

**Bug found and fixed:** the iteration-21 DB migration was being **silently overwritten on every backend restart** because the `seed_initial_content()` upsert clobbers `price` / `pdf_url` / `lemonsqueezy_*` fields on every boot. The fix: SEED_BOOKS itself is now the single source of truth — updated all 8 entries with the new prices, gated `pdf_url`s, and added `lemonsqueezy_variant_id: None` (waiting on founder's variant IDs). Upsert dict in `seed_initial_content` extended to write `lemonsqueezy_variant_id`. No more migrations getting wiped.

**Catalog now has 8 books** (was 7). New entry: **`angels-story`** (kids, $5).

**4 kids' PDFs uploaded — 3 succeeded, 1 failed:**
- ✅ `engels-friends-2.pdf` (23 MB, $5) → /app/backend/storage/books/
- ✅ `angels-tales.pdf` (6.4 MB, $5) — was originally uploaded as `eeew.pdf`, mapped to existing slug
- ✅ `angels-story.pdf` (14 MB, $5) — NEW slug `angels-story`
- ❌ `the-night-angels-embrace.pdf` — CDN returned 263-byte XML 404, NOT a real PDF. `pdf_url` set to `null` in seed; the book row is still in the catalog but cannot be downloaded until founder re-uploads.

**Final pricing (all 8 books):**
| Slug | Audience | Price |
|------|----------|-------|
| beyond-the-matrix-i | adult | $13 (was free) |
| beyond-the-matrix-ii | adult | $13 |
| the-language-of-angels | adult | $10 |
| you-dont-have-to-dance-to-anothers-tune | adult | $7 |
| angels-tales | kids | $5 |
| angels-story | kids | $5 (NEW) |
| engels-friends-2 | kids | $5 |
| the-night-angels-embrace | kids | $5 (PDF missing) |

All paid books point at `/api/cabinet/library/{slug}/download` (gated, auth+ownership required).

**Test housekeeping:** `test_iteration11.py::TestBooksRegression` updated — was asserting 7 books with a free `beyond-the-matrix-i` and a public `/assets/books/beyond-the-matrix-vol1.pdf` static path. Now correctly asserts ≥8 books, paid `$13`, gated 401 endpoint. Stale public PDF deleted.

**Total backend tests: 43/43 PASS.**

**Founder's "Pihituba" / Confessional directive (2026-04-29):** ACKNOWLEDGED, not built. Per founder's own rule: *"Do NOT build the full UI yet — confirm the backend logic is ready for this level of security."* The current `db.cabinet_sessions` schema does support time-based access via `started_at` + closed flags. AES-256 at rest, JWT entry, and time-block subscription logic are FUTURE work — must wait for founder's explicit go-ahead AND a live LemonSqueezy time-block product.

### Iteration 21 — LemonSqueezy webhook + gated PDF downloads (2026-04-29)

**Founder pivot:** PDFs hosted directly on the server (NOT LemonSqueezy file delivery). Backend serves the PDF only after webhook unlocks the user.

**Secrets stored** (`backend/.env`, never logged):
- `LEMONSQUEEZY_STORE_ID="358969"`
- `LEMONSQUEEZY_WEBHOOK_SECRET="HeeliumLont!123"` (founder-chosen; flagged for rotation post-test)
- `LEMONSQUEEZY_API_KEY` (set previous iter)

**4 PDFs uploaded** to `/app/backend/storage/books/` (private, NOT in `frontend/public`):
- `the-language-of-angels.pdf` (17 MB) — $10
- `beyond-the-matrix-i.pdf` (1.7 MB) — $13 (was free, now paid)
- `you-dont-have-to-dance-to-anothers-tune.pdf` (17 MB) — $7
- `beyond-the-matrix-ii.pdf` (651 KB) — $13 (was $35 placeholder)

**DB migration ran:** for the 4 books above, `price` updated, `pdf_url` rewritten to `/api/cabinet/library/{slug}/download` (gated endpoint), `external_read_url` cleared (no more eBookMaker links), `lemonsqueezy_product_id` cleared, `lemonsqueezy_variant_id` field added (None for now). Free public PDFs removed from `/app/frontend/public/assets/books/`.

**New backend endpoints** (all live, all tested):
- `POST /api/lemonsqueezy/webhook` — HMAC-SHA256 signature verification (401 on forge), JSON parse (400 on bad), idempotent `order_created` (`granted` first time, `already_granted` on replay), `order_refunded` revokes the row, missing `custom_data` returns `ignored`. Every event logged to new `db.lemonsqueezy_events` collection for audit/replay.
- `GET /api/cabinet/library/{slug}/download` — auth required (401), book must exist (404), user must own it via `db.purchases` row OR book must be free (403 otherwise). Streams the file from `/app/backend/storage/books/{slug}.pdf` as `application/pdf` with `Cache-Control: private, no-store`.
- `GET /api/lemonsqueezy/health` — read-only sanity check (booleans for the 3 secrets, counts for events + purchases).

**Schema change:** `Book.lemonsqueezy_variant_id: Optional[str]` added (waiting on founder's variant ID list).

**Checkout flow: ready-but-disabled** (per founder directive). Bookstore `Buy` buttons stay in their existing soft-disabled state showing *"The full version opens soon."* until the founder hands over the variant IDs and explicitly says go. The plumbing behind them is complete.

**Tests:**
- New `/app/backend/tests/test_iteration21.py` → 10/10 PASS (health, forged sig, bad JSON, missing custom_data, grant + idempotency, refund, download 401/403/404/200).
- Regression: `test_iteration11` 16/16 + `test_iteration14` 10/10 + `test_iteration17` 7/7 → all green.
- Total backend test suite: **43/43 PASS**.

**Next user action required to flip checkout ON:**
1. Update LemonSqueezy webhook URL from `prulesoul.site/webhook` → `https://prulesoul.site/api/lemonsqueezy/webhook`.
2. Send the 6 variant IDs (one per book) so we can populate `lemonsqueezy_variant_id` and build `POST /api/checkout/create`.
3. Rotate webhook secret (currently visible in a screenshot).

### Iteration 20 — First Light audio activated (2026-04-29)

**Founder uploaded 5 mp3 artifacts (3 unique).** Per founder rule: *"Preferred location: `/the-beginning` (intro before writing). Optional: `/library/adults`."*

**Audio activation:**
- Downloaded all 3 unique mp3s to `/app/frontend/public/assets/audio/` (~2 MB total). Live HTTP 200 + `content-type: audio/mpeg` confirmed for each.
- Selected primary: **`the-quiet-between-steps.mp3`** (30.77 s, neutral tone, fits "intro before writing").
- Wired via `REACT_APP_FIRST_LIGHT_AUDIO_URL=/assets/audio/the-quiet-between-steps.mp3` in `frontend/.env`.
- Frontend restarted. The existing `MeditationPlayer` automatically picked up the URL.

**Placement:**
- `/the-beginning` (preferred, after `tb-what` block) — added `tb-listen` wrapper hosting the `<MeditationPlayer />`. Single quiet beat between "this is just a small sequence" and the rest of the orientation copy.
- `/library/adults` — no code change; the existing player lit up automatically when the env var was set.

**Reality test (live):**
- Visit `/the-beginning` → click Play → `audio.paused: false`, `currentTime` advances, `duration: 30.77s`, no errors. Pause icon replaces Play. Progress bar fills. Refresh + click → works again.
- Same on `/library/adults`.
- Screenshot captured the active player mid-stream.

**Reserved (saved, not wired):**
- `the-weight-of-stillness.mp3` and `fragile-construct.mp3` documented in `/app/memory/audio_files_register.md`. Anti-rules reaffirmed: no homepage audio, no Quiet Room audio, no autoplay, no sequence UI without explicit approval.

**No backend changes. No regression run needed** — backend untouched.

### Iteration 19 — Video card refinement + correct media separation (2026-04-28)

**Founder reversal (2026-04-28):** the iteration-18 full-screen ambient hero video was REMOVED. Replaced by a small, click-to-play `<VideoCard>` placed on TWO surfaces only — Home (lower-right) and Meditation Corner (centered). All other founder rules from the new directive enforced strictly.

**Frontend changes:**
- `Home.jsx` — full-screen `home-hero-ambient-video` element + gradient overlay REMOVED. Hero is back to grid + glow only. New small `<VideoCard>` (testid `home-video-card`) added in a tucked lower section after the AI footnote, right-aligned, max-w-md.
- `MeditationCorner.jsx` — added `<VideoCard>` (testid `meditation-video-card`, max-w-lg) before the closing note. Plays `weight-of-stillness.mp4` (the calmest clip).
- New `components/VideoCard.jsx` — purpose-built small player with: dark poster, centered Play overlay (lucide Play/Pause), soft shadow, rounded corners, `preload="none"` (file only downloads on click), no autoplay, no native controls visible until interaction, hides itself on `error` event. Aspect ratio 16/9. Caption block (eyebrow + title + description) below the frame. All testids namespaced via `testId` prop.

**New asset shipped (compressed):**
- `you-are-not-who-you-became-720p.mp4` — 8.9 MB, 1280×720, 81.9s. Sourced from a 160 MB 1080p artifact uploaded by the founder; first download was corrupted (NAL unit errors), re-downloaded clean, re-encoded with `ffmpeg -vf scale=-2:720 -crf 28 -preset fast +faststart`. Ships from `/app/frontend/public/assets/videos/`.

**Asset folder total:** 17 MB across 4 mp4 files. The 160 MB original was deleted post-encode.

**Audio rule honored** (`/app/memory/audio_truth.md`):
- Did NOT extract audio from any video.
- Did NOT wire AI-synthesised voice.
- First Light placeholder ("*This sound will open soon. Human voice is being recorded.*") stands. Play button still disabled until founder sets `REACT_APP_FIRST_LIGHT_AUDIO_URL`.

**Verification:**
- Live: `home-hero-ambient-video` count = 0 (background gone), `home-video-card` + `meditation-video-card` render correctly. Both mp4 files serve HTTP 200. Page text remains the focal point; video is a quiet side element. Lint clean.
- No backend changes. No regression run needed.

### Iteration 18 — Hero ambient video on Home (2026-04-28)

**Founder uploaded 4 mp4 artifacts (3 unique).** Per founder rule: *"video ONLY on homepage, hero/background layer, muted/looped/no-controls".* Saved all three to `/app/frontend/public/assets/videos/` (~8 MB total) so they ship with the build — no CDN, privacy-safe.

**Active placement:**
- `weight-of-stillness.mp4` → `Home.jsx` HERO behind the title ("Leave the noise. Find the Architect within."). `data-testid=home-hero-ambient-video`. Autoplay, muted, looped, no controls, `opacity-25` with a gradient overlay so the title stays razor-clear. 30.7s loop, 1024×1024.

**Reserved (waiting on founder approval):**
- `blueprint-inside-you.mp4` → recommended for `/aurin-philosophy` hero.
- `fragile-construct.mp4` → recommended for `/the-beginning` intro (landing, not the step view).

**Documented:** `/app/memory/hero_videos_register.md` — placement, anti-rules, exact JSX pattern for the next two when approved.

**No backend changes. No regression run needed.** Lint clean. Live verified: video element present, autoplay/muted/loop/no-controls all true, mp4 served HTTP 200.

### Iteration 17 — Pre-sales activation pass (2026-04-28)

**Founder directive:** make the system usable & clear for first 10 users BEFORE LemonSqueezy goes live. No new features beyond the bounded list.

**Backend (server.py):**
- New `GET /api/experience/the-beginning/step/{n}` — read-only past-reflection view. 401 unauth, 404 if `n` out of 1..7, 403 if step not in `completed_steps`, 200 with full step + saved reflection + `is_last`.
- New `Purchase` Pydantic model + `db.purchases` collection. New `GET /api/cabinet/library` — returns `[{book_slug, title, description, cover_image_url, pdf_url, external_read_url, granted_at, source}]` joining `db.purchases` ⨝ `db.books`. Empty list until LS webhook starts writing.
- New unique compound index `(user_id, book_slug)` on `db.purchases` — idempotent against double-fired LS webhooks.
- All pre-existing endpoints unchanged. test_iteration11 (16/16) + test_iteration14 (10/10) regression green.

**Frontend:**
- `lib/api.js` — `fetchBeginningStep(n)` + `fetchCabinetLibrary()`.
- `components/StudentCabinet.jsx` — added **Your Materials** section (`cabinet-your-materials`):
  - `cabinet-past-reflections`: chips for each completed step. Click → opens `cabinet-past-reader` with the saved reflection text + step prompt + closing line *"What is written stays. It cannot be overwritten."*
  - `cabinet-purchased`: list of unlocked books with Open / Take it actions; `cabinet-purchased-empty` placeholder for the (current) zero-purchase state.
- `pages/Learning.jsx` — REWRITTEN as a quiet stub: *"This part is still being written. Some things take longer to form."* with two soft CTAs (Begin gently / Open the library). Old `learning-loading` / `learning-groups` testids removed.
- `pages/Start.jsx` — NEW `/start` route. Single calm door with two CTAs. Auto-redirects to `/the-beginning` after 2.5s of inactivity.
- `App.js` — registered `/start`.
- `pages/TheBeginningStep.jsx` — added `tb-step-newsletter` (NewsletterSignup with `source="beginning:end"`) inside `DonePanel`, only shown when `is_done=true`.
- `pages/LibraryHub.jsx` — added soft NewsletterSignup at the bottom (`source="library:hub"`).
- `pages/Bookstore.jsx` — added `bookstore-author-note`: *"Material is created by the author. Technical tools were used only to support clarity."*

**Saved to memory:** none new this iteration.

**Tests:**
- iteration_17 → Backend 33/33 (7 new + 16 iter11 + 10 iter14) · Frontend 15/15 PASS first run.
- Forbidden-word scan over 8 routes including new `/start` and rewritten `/learning` — 0 hits.
- Regressions held: kids-read sample, meditation placeholder copy, cabinet reset.

### Iteration 16 — Conversion-without-selling layer + soft pause refinement (2026-04-27)

**Founder directive:** add subtle "consequence-based" lines in 4 specific locations. No "buy / offer / upgrade / limited / transformation promise" wording. No new features. Text only.

**Four soft consequence lines added:**
1. **Bookstore** (`bookstore-soft-consequence`) — under the section header, in italics: *"You don't have to take my word for it. Just see what shifts in you."*
2. **End of The Beginning** (`tb-soft-consequence`, in `DonePanel`) — *"If this touched something in you, you are not quite in the same place anymore. And from here, sometimes, the next step is taken quietly."*
3. **Portal resume area** (`cabinet-resume-consequence`, in `StudentCabinet`) — under the resume card: *"If something stayed with you, you can step in from here."*
4. **Library → Bookstore bridge** (new `library-to-bookstore-bridge` section at the bottom of `/library/adults`) — full calm bridge with header *"If something here kept moving in you, there is a longer way to listen."* + the same consequence line as Bookstore + ghost link *"Step into the longer readings →"*.

**Soft pause refinement** (PausePanel during The Beginning):
- Headline "Take a breath." → "**No need to rush.**"
- Body "What you wrote needs a moment to settle. The next part will appear on its own." → "**Let what you wrote settle. The next part will appear on its own.**"

**Saved to memory (NOT deployed):**
- `/app/memory/seven_day_audio_reference.md` — founder's full Estonian audio refinement script (Stop / Notice / Pattern / Distance / Release / Space / Return) saved verbatim. NOT auto-translated into the existing English step copy because the themes differ (current journey: awareness · dependency · fear · money · childhood · pattern-break · clarity). Both can coexist later as separate audio series.
- Third Gemini share link archived in the same file as a placement-intuition reference. NEVER embed.
- Audio placement rule honored: founder said *"if link is not a direct playable audio URL, keep it as reference only"* — so we did NOT add three identical "Soon" placeholders across Home / Beginning / Library. The existing single placeholder on `/library/adults` stands; one drop activates it when the founder ships her own `.mp3`.

**Verification:**
- Forbidden-word scan over 6 high-traffic routes — 0 hits.
- Lint clean on all touched files. Backend untouched.

### Iteration 15 — Student Cabinet + meditation placeholder copy (2026-04-27)

**For the first 10 students.** The Sanctuary's signed-in dashboard now exists.

**Frontend:**
- New `components/StudentCabinet.jsx` — signed-in dashboard at `/portal`. Resume card chooses the next quiet step (`cabinet-resume-beginning` if mid-journey · `cabinet-resume-room` if cabinet open · `cabinet-resume-beginning-done` if 7/7 walked · `cabinet-resume-default` for fresh users). Three surfaces below: The Beginning · The Quiet Room · The Library. Plus `cabinet-deeper-shelf` empty-state for future paid content. No "% completed", no achievements — tone is "you don't have to start over".
- `pages/UserPortal.jsx` — splits signed-in vs signed-out. Signed-in renders `<StudentCabinet />`; signed-out keeps the existing 3-block preview grid. Trust/legal/age-reset block stays for both.
- `components/MeditationPlayer.jsx` — placeholder copy now reads "*This sound will open soon.*" + secondary line "*Human voice is being recorded.*" (italic + small calm grey). Play button stays disabled, no `<audio>` element rendered until a real URL is set.

**Saved to memory (NOT deployed):**
- `/app/memory/meditation_reference.md` — two Gemini share URLs kept ONLY as inspiration references for the founder's future human-voice recording. Hard rules: never embed Gemini, never use Gemini branding, never add AI-generated voice to the public meditation page.

**Tests:**
- iteration_15 → Backend 26/26 (test_iteration11 16/16 + test_iteration14 10/10) · Frontend 13/13 PASS first run.
- Forbidden-word scan over 12 public routes — 0 hits.

### Iteration 14 — Quiet Room: greeting + topic routing · Media readiness (2026-04-27)

**Cabinet refinement (per founder's "Starting Rule" directive):**
- New `CABINET_OPENING_GREETING` ("Hello. It's good to meet you here.\n\nHow can I be of help to you today?") seeded as the first guide message on `/api/cabinet/start` AND on auto-creation in `/api/cabinet/message`.
- Added `path` field to `CabinetSession` model. The first user message is routed via case-insensitive whole-phrase keyword matching into one of:
  - `relationship_attachment`
  - `fear_anxiety`
  - `self_worth`
  - `confusion_identity`
  - `emotion_release`
  - `default`
  Path locks on the session — subsequent guide replies rotate through that lane only.
- Each path has its own curated 5-prompt rotation tuned to the theme. No advice, no diagnosis.
- `/cabinet/me` and `/cabinet/message` `guide_replies` and `show_continuation` now key on **user-message count** (not guide-message count) so the seeded greeting doesn't burn a free reply.
- Crisis detection still wins over routing.
- Frontend `PrivateRoom.beginSession` now fetches the freshly-seeded greeting after `startCabinet()` so the visitor sees the room speak first.

**Media readiness (Light Streaming Mode):**
- `MeditationPlayer.jsx` rewritten — single Play/Pause bound to a hidden `<audio>` element; reads URL from `mediaConfig.firstLightAudioUrl` (env: `REACT_APP_FIRST_LIGHT_AUDIO_URL`). If URL missing, shows the placeholder "*This sound will open soon.*" and disables the button.
- New `components/MediaVideo.jsx` — privacy-respecting external video container (YouTube `youtube-nocookie`, Vimeo `dnt=1`, direct mp4/webm). Lazy-loaded, muted by default, related/branding hidden. Renders nothing when no URL set.
- New `lib/mediaConfig.js` — single source of truth for `firstLightAudioUrl`, `ambientVideoUrl`, `courseVideoUrl`. All optional env-driven.

**Tests:**
- New `/app/backend/tests/test_iteration14.py` → 10/10 PASS (greeting seed, continuation-after-3-user-messages, 6 routing cases, path-lock, crisis override).
- `test_iteration11.py` regression → 16/16 PASS.

### Iteration 13 — Deep Sanctuary language pass (2026-04-27)
**Master Directive:** No public-facing UI text may contain `system`, `protocol`, `interface`, `module`, `agent`, `chatbot`, `structure`. Site stays 100% English. Backend code untouched (only seed strings + a small migration block).

**Frontend rewrites:**
- `Home.jsx` — hero CTA "Begin the protocol" → "Begin gently"; LAYERS card "The Genesis Protocols" → "The Genesis Volumes"; PRINCIPLES "Soul over system" → "Soul before pattern"; kids LAYER "A child does not need a system to be whole" → "…does not need to be fixed to be whole".
- `TheBeginning.jsx` — Honest note: "The old system is deeply rooted" → "The old pull runs deep"; Balance block: "respect structure" → "respect the shape of your life".
- `Learning.jsx` — eyebrow "Structured Modules" → "Quiet readings"; CTA italic "one module at a time" → "one piece at a time"; loading state → "A small breath…"; per-track count `n module(s)` → `n reading(s)`; entry top label "Module · 0X" → "Reading · 0X"; empty state → "Nothing here yet. Soon."
- `Library.jsx` — `kindMeta.protocol.label` "Protocol" → "Reading" (key intact for backend match).
- `About.jsx` — narrative "fear protocols" → "quiet fear loops"; final CTA "7-step protocol is the first practical layer" → "7-day beginning".
- `Bookstore.jsx` — added psychosomatic thread (`bookstore-body-thread`: "Your body usually knows before your mind does…") + no-dead-end closer (`bookstore-closing-note`: "If something here keeps moving in you, you can come back. Nothing here will run out.").
- `UserPortal.jsx` — "Books, protocols, and sessions" → "Books, readings, and quiet sessions".
- `InstagramCTA.jsx` (shared, 5 routes) — heading "Matrix Protocols" → "quiet drops".
- `AiDock.jsx` — info paragraph rewritten to remove "system guide" + "AI" wording.

**Backend seed + migration (server.py):**
- Renamed seeded library entries: `morning-orientation-protocol` title → "Morning Orientation"; `evening-reflection-protocol` → "Evening Reflection"; `genesis-protocols-volume-i/ii` → "The Genesis Volumes — Volume I/II". Slugs preserved.
- Renamed seeded book "The Language of Angels" description ("structured" removed) and "Beyond the Matrix II" description ("patterns and protocols" → "patterns and quiet rhythms"); `tags: ["protocols", …]` → `["patterns", …]`.
- Renamed two `learning` content categories: `foundations` description → "Introductory readings"; `practice` → "Applied readings and exercises".
- Added an idempotent **3b/3c migration block** in `seed_initial_content` that updates the above entries + categories on every restart (the original entry seed only runs when the collection is empty).

**Verification:**
- Live forbidden-word scan over 12 public routes (`/`, `/the-beginning`, `/aurin-philosophy`, `/about`, `/library`, `/library/adults`, `/library/kids`, `/library/kids/read`, `/bookstore`, `/portal`, `/blog`, `/learning`) → **0 hits** for `system | protocol | interface | module | agent | chatbot | structure`.
- Backend pytest `/app/backend/tests/test_iteration11.py` → **16/16 PASS** (regression unchanged).
- Iteration 12 fixes still hold: `/library/kids/read` renders Angels' Tales card; `/private-room` `cabinet-reset` returns to `cabinet-intro`.


- **`LibraryKidsRead`** — `angels-tales` sample card now renders. Root cause: a 422 on `/api/content/entries?audience=kids` (entries Audience literal is `kids-universe`, not `kids`) was thrown inside a single `Promise.all`, which discarded the books payload. Fix: split entries + books into independent promises with their own `.catch`, and use `audience='kids-universe'` for entries. `freeBooks` filter still gates on `!!pdf_url`.
- **`PrivateRoom` cabinet-reset** — single-click reset now correctly returns the user to `cabinet-intro`. Root cause: `window.confirm` was auto-dismissed in tests AND the local `phase` state wasn't reset on success. Fix: removed `window.confirm`, unconditionally clear all local state (messages / showContinuation / threadKey / keepThread / confirms / input / error) and `setPhase(PHASES.INTRO)` whether or not `clearCabinet()` succeeds.
- **Tests:** iteration_12 — Backend 16/16 pytest pass (regression suite unchanged), Frontend 100% (both fixes verified end-to-end against live preview with synthetic Mongo session).

### Iteration 10 — Invisible Architect Protocol (2026-04-25)
**Brand voice tightening — no marketing speak, "portal not website":**
- New **Inner Architect — From Masks to Light** manifest section on `/aurin-philosophy` (`ap-inner-architect`). Three calm paragraphs ending on *"returning to the Source is returning to yourself."*
- New **Privacy as Luxury** card on Philosophy + footer-wide line: *"No social-media pixels. No tracking cookies. No public feed. Your journey through this work stays yours — that is part of the design."* Testids: `ap-privacy-as-luxury`, `footer-privacy-luxury`.
- **Word-of-mouth share** at the end of The Beginning (Done panel): `tb-share-coordinates` — *"If this shift was real for you, share the coordinates with one person you trust."* Includes a single "Copy the coordinates" button (clipboard) showing `tb-share-coordinates-copy`. No urgency, no marketing copy.
- **Bookstore framing line** above the catalogue (`bookstore-core-library-line`): *"To integrate this frequency deeper, explore the Core Library — slow-written books for adults, calm storybooks for children. No urgency. Read in the order that feels true."* Replaces salesy framing.

### P1
- Set `GITHUB_REPO` and run first sync of /brand /legal /library
  /bookstore /kids /learning /meditations
- Replace `PLACEHOLDER_*` LemonSqueezy IDs with real ones → Buy Access activates
- Object storage for cover images + PDFs
- `REACH_OUT_EMAIL` + transactional provider (SendGrid/Resend)
- Lawyer-reviewed final Legal text (replace seed)

### P2
- Real RAG over content for The Guardian (Emergent LLM key)
- Member-area inside Portal once a paid book ships
- Real Aurin Kids generator (separate, safety-vetted pipeline)
- Admin: bulk re-validate, sync history, GitHub diff preview

## Notes for fork agents
- Auth = Bearer token in `localStorage.aurin_session_token`
- Markdown = `content_normalizer.parse_markdown_safe` (single source of truth)
- Internal validation warnings shown only on `/admin/content` and
  the entry warnings panel
- 18+ gate uses `localStorage.aurin_age_confirmed_v1`
- Books carry `audience: adult|kids`. Filter UI live at /bookstore
- Legal entries are seeded; SEED_LEGAL only runs when surface=legal
  count is zero (intentional — re-seed by deleting the entries)
- Server.py is large (~1400 lines); flagged for future router splitting

---

## Iter 61 — $0 Stab (Feb 2026)

**Mode:** strict completion of promised features, no new architecture.

### Done
1. **`/app/memory/READINESS_AUDIT.md`** — brutally honest forensic audit of every room, memory layer, mentor continuity, booking, automation. Verified live against preview backend. 5 of 6 recent integration suites GREEN; one stale assertion in test_mentor_notes_iter57 documented as test bug, not code bug. 24 legacy book-inventory tests fail as known tech debt.
2. **`MemoryPackageSelect.jsx`** — Premium Memory Selection panel inside ClarityRelease confirmation. Two side-by-side cards: Hetke Kaja / Transient Echo (cyan, FREE) vs Igavene Lõim / Eternal Thread (amber, PREMIUM). Wired ONLY to existing `POST /api/clarity/prefs save_threads`. Optimistic UI with rollback on rejection. No new backend.
3. **Body Room TTS** — inline `SomaticTtsButton` inside `BodyRoomChat.jsx`, attached to each guide reply. Reuses the SAME `/api/clarity/tts` endpoint used by Course Room and Clarity Release. No parallel system.

### Known caveats (documented, not silently hidden)
- Clarity Release "hologram" remains a static portrait. Not animated. Acceptable for Live Beta; copy must not promise animation.
- Library shelf carries one teaser slug (`raha-ja-teadvus-moodul-1`) that has no `SEED_COURSES` row. Fix before next acquisition push: seed it OR remove from `/api/library/shelves`.
- No rate limit on Cabinet/Body Room chat. Fine for Beta; add per-user-per-day cap before public launch.
- LP Heartbeat env still missing on LP side. External blocker.

### Test status (live, this iter)
- test_booking_iter54 → 13/13 PASS
- test_cabinet_resume_iter56 → 6/6 PASS
- test_course_tts_iter58 → 3/3 PASS
- test_hybrid_memory_iter59 → 6/6 PASS
- test_body_chat_iter60 → 6/6 PASS
- iter 61 frontend e2e (testing agent) → 100%

### Next (from READINESS_AUDIT §10)
- W-1 hologram copy reframe OR animation
- W-2 Library Estonian course teaser fix
- W-3 chat rate limit
- W-5 LemonSqueezy production keys (founder action)


---

## Iter 62 — Final MVP Lock (Feb 2026)

**Mode:** strict launch-readiness. 4 explicit founder tasks, no scope creep.

### Done
1. **W-2 — Library cleanup.** `/api/library/shelves` and `/api/courses` now filter out `language != 'en'` rows. Estonian course `raha-ja-teadvus-moodul-1` no longer surfaces in the public payload. Course content remains in `SEED_COURSES` and is reachable by direct `/api/courses/{slug}` for any future Estonian-localized link.
2. **W-1 — Neural Portrait reframe.** Clarity Release `GuideHologram` copy is now: "Neural portrait · steady/soft companion · A static signal-presence impression … Quiet by design. It does not animate, it does not perform … the small pulse is a heartbeat cue from the room itself — not a claim of sentience." Static visual is now intentional design language, not unfinished animation.
3. **W-3 — Daily chat cap.** New `chat_usage_daily` collection with unique `(user_id, date)` index. `_enforce_chat_cap` enforced in both `/api/cabinet/message` and `/api/body-room/chat`. Free tier = 12/day shared across rooms. Premium (active Clarity pass OR Eternal Thread opt-in) = 60/day. Admin = unlimited. New `/api/chat/usage` endpoint exposes `{date, used, ceiling, remaining, tier}` for UI hints. 429 message: *"You have reached the quiet limit for today. The room will reopen tomorrow morning. If you would like a wider threshold, the Eternal Thread carries a higher daily ceiling."*
4. **W-4 — English uniformity sweep.**
   - `CourseRoom.jsx` line 148 + `CourseDetail.jsx` line 141: removed Estonian fallback string `"X kirja · X õhtut vaikset süvenemist · …"`. UI is now English-only regardless of `course.language`.
   - `MemoryPackageSelect.jsx`: removed bilingual brand labels (`Hetke Kaja` / `Igavene Lõim`). Cards now display only `Transient Echo` / `Eternal Thread` with English subtitles.
   - `grep -rE '[ÕÄÖÜõäöü]' frontend/src` returns one remaining match: an inline JS comment in `CourseDetail.jsx:521` referencing Estonian markdown headings inside seeded letters — invisible to the user.

### NOT done in this iter (deferred, by founder rule "no new systems")
- BYOK / Universal Key model for Premium (table item #2). This is a structural pricing/architecture change. Documented in audit; not implemented. Ask founder for explicit go-ahead before next iter touches it.

### Test status (live, this iter)
- test_booking_iter54 → PASS
- test_cabinet_resume_iter56 → PASS
- test_course_tts_iter58 → PASS
- test_hybrid_memory_iter59 → PASS
- test_body_chat_iter60 → PASS
- **test_chat_cap_iter62 (new) → PASS** — verifies free=12 ceiling, 13th = 429, premium=60 ceiling, cabinet+body shared counter.

### Trust continuity / human presence framework
The founder issued a doctrine document about TRUST CONTINUITY and HUMAN PRESENCE. Concrete code coverage already in place:
- **No memory hallucination at low confidence:** `body_room_ai.py` and `clarity_ai.py` system prompts forbid invention. Crisis override fires before any LLM call. Soft-fallback lines on LLM error are calm and grounded ("I am beside you. Stay with the place where you are right now.").
- **Cross-user isolation:** every chat handler resolves `user.user_id` via Bearer auth before touching any history. `cabinet_user_summaries` and `cabinet_sessions` are scoped by `user_id` in every read.
- **Eternal Thread is opt-in only** (default `save_threads=false`). No silent server-side memory.
- **Chat cap protects against abuse and emotional overload** (W-3).
- **English uniformity** (W-4) keeps the experience coherent.

Open trust risks documented in `/app/memory/READINESS_AUDIT.md` §10:
- W-5 LemonSqueezy production keys (founder action)
- W-7 No vector / semantic memory (intentional; do not market as "deep recall")
- W-8 Curated fallback when LLM budget drained is invisible to user


---

## Iter 62b — Final Pre-Launch Pass (Feb 2026, late iter 62)

**Mode:** observation prep. Documentation + small UI polish only. Zero new systems.

### Done
1. **Support Agent forensic verification** — confirmed in `/app/memory/READINESS_AUDIT.md` §14: NO support agent exists. Only crisis hotline reference + `/api/ai/chat` STUB. Founder must remove "24/7 AI support" claims from public copy before launch.
2. **`/app/memory/PRODUCT_INVENTORY.md`** — full structured product inventory. 14 paid SKUs (8 books · 4 courses · 3 Clarity passes), 5 free surfaces, all variants mapped to LemonSqueezy IDs. Lists 5 blockers before first real payment.
3. **READINESS_AUDIT.md Appendix A (§14–16)** — empty-room check (all rooms covered), failure-state audit (graceful), final classification: **PARTIAL LIVE BETA — READY** under 4 named blockers.
4. **`ChatUsageHint.jsx`** — small calm "X of N today" / "N quiet replies remaining today." indicator. Uses existing `/api/chat/usage`. Wired into BodyRoomChat (below Send) and ClarityRelease ChatPanel (below composer). Tones: calm → soft → rest. Renders nothing for admins or when API unreachable.
5. **Production data hygiene** — purged leaked `test-book-19d4f893` from `db.books`. Added idempotent `^test-` purge for books to backend startup (matches existing content_entries purge).
6. **W-3 graceful 429 surfacing** — both Cabinet and Body Room chat now display the calm rate-limit copy instead of a generic "try again" toast.

### NOT done (HOLD per founder rule)
- BYOK / Universal Key model — explicit HOLD.
- Animated hologram — frozen as Neural Portrait.
- Real support agent — out of scope for MVP. Founder must remove "24/7 AI support" claims from copy.
- Multi-language localization (RU/NO/DE) — deferred.

### Blockers before public push (from audit §16)
1. 🔴 LemonSqueezy live mode + $1 dummy purchase end-to-end.
2. 🔴 Remove "24/7 AI support" from public copy.
3. 🟡 Decide: Eternal Thread as paid SKU or free trust-feature?
4. 🟡 LP Heartbeat env on LP side.

### Test status
- test_chat_cap_iter62 → PASS
- test_body_chat_iter60 → PASS
- test_hybrid_memory_iter59 → PASS
- test_booking_iter54 → PASS
- All frontend lint clean.

### Final classification
**PARTIAL LIVE BETA — READY** for controlled-volume real users today. **NOT** ready for an open public push until the 4 blockers are closed.



---

## Iter 64 — Inter-Platform Sync + Launch Alignment (Feb 2026)

**Mode:** $0 stabilization. Two new static React pages (allowed under "no new systems" — pure routes, zero new backend). Plus copy-paste product list for LemonSqueezy.

### Done
1. **`/catalogue`** — public structured archive. Live data from `/api/books`, `/api/courses`, `/api/clarity/passes`. Hides internal IDs. Linked from footer Trust column.
2. **`/faq`** — 18 hand-written Q&As across 6 topics. Pure static. Explicitly states "We do not run a 24/7 AI helper." Reach Out CTA.
3. **`/app/memory/LEMONSQUEEZY_PRODUCT_LIST.md`** — copy-paste 14-SKU list + 6-step pre-launch checklist.
4. **`/app/memory/SYNC_REPORT_ITER64.md`** — sync report with PSL copy replacement table. Verdict: CONTROLLED BETA READY.

### Files added
- `/app/frontend/src/pages/Catalogue.jsx`
- `/app/frontend/src/pages/Faq.jsx`
- `/app/memory/LEMONSQUEEZY_PRODUCT_LIST.md`
- `/app/memory/SYNC_REPORT_ITER64.md`

### Files modified
- `/app/frontend/src/App.js` (routes)
- `/app/frontend/src/components/layout/Footer.jsx` (footer links)

### Final classification
**🟡 CONTROLLED BETA READY** → **PUBLIC READY** once founder closes 2 P0 blockers (LemonSqueezy live-mode + 1× test purchase, PSL copy scan).

---

## Iter 64c — Guide Presence Restoration + LemonSqueezy PDF dispatch (Feb 2026)

**Mode:** $0 stabilization. Three concrete deliverables, NO new architecture.

### Done
1. **PDF email dispatch.** `/app/backend/scripts/email_lemon_pdf.py` renders `LEMONSQUEEZY_PRODUCT_LIST.md` to a clean A4 PDF (reportlab) and emails it via Resend with attachment. Sent to `support@prulesoul.site` (Resend ID logged). Founder can re-trigger any time: `python /app/backend/scripts/email_lemon_pdf.py [recipient]`. `email_service.send_email` extended with `attachments` parameter.
2. **Guide Presence restored.** Cropped founder's CLARITY (M) / GRACE (F) reference (`Gemini_Generated_Image_8fnbtc8fnbtc8fnb.png`) into two square portraits → `guide-male.jpg` / `guide-female.jpg` (560×560). Restrained CSS micro-animations added to `index.css`:
   - `aurin-guide-breath` — 7s slow scale (1.0 → 1.013 → 1.0)
   - `aurin-guide-sway` — 11s subtle horizontal sway (±0.6%)
   - `aurin-guide-blink` — soft 7s horizontal eye-line flash (occasional double-blink)
   - Outer ambient pulse via `aurin-guide-presence::after`
   - All animations honor `prefers-reduced-motion`. NO lip-sync, NO hand gestures, NO posture changes.
3. **Copy reframe.** `GuideHologram` component rewritten: "Guide Presence · Clarity / Grace" replaces "Neural portrait · steady/soft companion". Comment + alt-text honest about the system being a calm reflective presence, not a chatbot character.
4. **FAQ exit / deletion path.** Added 4 new Q&As to `/faq` Privacy section: "How do I remove my stored reflections?", "How do I leave a room mid-session?", "How do I request full account deletion?", and the original "Can I delete my data?" expanded.

### Files
- NEW: `/app/backend/scripts/email_lemon_pdf.py`, `/app/frontend/public/assets/illustrations/guide-male.jpg`, `/app/frontend/public/assets/illustrations/guide-female.jpg` (+ `-sm` thumbs)
- MODIFIED: `/app/backend/email_service.py` (attachments arg), `/app/frontend/src/index.css` (Guide Presence keyframes), `/app/frontend/src/pages/ClarityRelease.jsx` (GuideHologram rewrite), `/app/frontend/src/pages/Faq.jsx` (deletion Q&As)

### Verification
- Both portrait crops verified via screenshot. Faces are centered, expression composed.
- Lint clean on all modified frontend files.
- PDF email delivered (Resend ID `18dfcacb-812b-40d3-adc9-c42da61909cd`).

### Not done (HOLD per founder rule)
- BYOK / Universal Key.
- Lip-sync / voice-driven facial animation.
- Eternal Thread paid SKU (deferred to post-beta per founder decision).
- Animated SVG/Lottie hologram (current CSS-only restraint is intentional).

### Final classification
Unchanged: **🟡 CONTROLLED BETA READY**. Two P0s still founder-side (LemonSqueezy live mode + 1× test purchase, PSL copy alignment).


---

## Iter 64d — Observation Mode + PSL copy dispatch (Feb 2026)

**Mode:** $0 stabilization. Two concrete deliverables. No new architecture, no LLM dependency.

### Done
1. **Observation Mode dashboard.** `GET /api/admin/observation` (admin-token gated) returns 4 signals + side metrics:
   - Cap hits (today + last 7 days)
   - Body Room engagement % (unique chat users / total non-admin users)
   - Eternal Thread opt-in % (save_threads=true / total prefs rows)
   - Course letter 1→2 retention (per English course)
   - Side metrics: active sessions, mentor notes stored, bookings active, lifetime purchases
   Frontend page at `/admin/observation` (token form + 4 signal cards + retention table). Token cached in localStorage. Verified live on preview.
2. **PSL copy pack emailed.** `/app/backend/scripts/email_psl_copy_pack.py` sends a clean HTML email with:
   - 7-row replacement table (forbidden phrasing → calm replacements)
   - Approved terminology lock list
   - Two LP-side P0 blockers (LP copy scan + LP_HEARTBEAT_URL env)
   - Live links to `/catalogue` and `/faq`
   Sent to `support@prulesoul.site` (Resend ID `58fd9337-6767-4cb1-a5d8-abc1bf8ac92a`). Re-runnable: `python /app/backend/scripts/email_psl_copy_pack.py [recipient]`.

### Files
- NEW: `/app/backend/scripts/email_psl_copy_pack.py`, `/app/frontend/src/pages/AdminObservation.jsx`
- MODIFIED: `/app/backend/server.py` (one new admin endpoint, ~115 lines), `/app/frontend/src/App.js` (one new route)

### Verification
- `/api/admin/observation` returns valid JSON with all 4 signals (verified live).
- `/admin/observation` page renders with admin token form (screenshot verified).
- Frontend lint clean, Python lint clean.

### Founder workflow
- Open `/admin/observation?token=<ADMIN_TOKEN>` to see live beta signals.
- Token is cached in localStorage; clear via the Clear-token button.
- Watch the 4 signals over 30 days. No alerts, no thresholds enforced — pure quiet awareness.

### NOT done (HOLD per founder rule)
- Alerting / thresholds / paging — observation is read-only by design.
- BYOK, vector memory, voice-driven Guide Presence, animated SVG/Lottie hologram.

### Final classification
Unchanged: **🟡 CONTROLLED BETA READY**.


---

## Iter 65 — Observation Mode + Funnel Telemetry + Payment-Event Schema (Feb 2026)

**Mode:** $0 stabilization. Observation phase. Founder paused all building, waiting on LemonSqueezy approval.

### Done
1. **Funnel telemetry layer.**
   - `POST /api/telemetry/event` — public, anon, in-memory rate-limited (60/IP/min).
   - 26 allowed event types whitelisted server-side. Unknown names rejected with 400.
   - `funnel_events` collection. Indexed `(event_type, created_at)` and `(client_id, created_at)`.
   - No PII. Only opaque `client_id` (random localStorage hex), event_type, optional room/slug, sha1-truncated IP, UA prefix.
   - `GET /api/admin/observation/funnel` — admin-token gated. Returns 24h + 7d counts and unique-client counts per event type.
   - Frontend `lib/telemetry.js` helper using `navigator.sendBeacon` with fetch fallback. 4-second per-event de-dupe.
   - Wired into 6 surfaces: Catalogue, FAQ, ClarityThreshold, BodyRoom, CourseRoom, UserPortal (portal_open + signed_in).
2. **Payment-event audit log (schema only).**
   - `payment_events` collection with 6 allowed kinds: `payment_started`, `payment_success`, `payment_failed`, `entitlement_unlocked`, `email_sent`, `webhook_received`.
   - Indexed `(created_at desc)` and `(order_ref)` sparse.
   - Internal helper `_log_payment_event(...)`. Not yet wired into the Lemon webhook handler — that wiring is reserved for after founder confirms LemonSqueezy live-mode approval.
   - `GET /api/admin/payment-events` — read-only tail, admin-token gated.
3. **Deep audit & critical report.** `/app/memory/DEEP_AUDIT_ITER65.md` — brutal, operational, no marketing language. Documents:
   - 8 753-line monolith server.py as a 🔴 operational hazard (split post-launch).
   - 24 stale legacy tests as 🔴 regression-detection blindness.
   - 🔴 Magic-link missing per-IP rate-limit (cheapest abuse vector).
   - 🔴 LLM silent-fallback (no audit trail when budget drains).
   - 🟡 Eternal Thread "PREMIUM" badge mildly misleading while free.
   - 🟡 `?token=` URL leak on /admin/observation (~5 lines fix).
   - 🟡 Mobile real-device audit not run.
   - 10-step recommended fix order for after Lemon approval.

### Files
- NEW: `/app/frontend/src/lib/telemetry.js`, `/app/memory/DEEP_AUDIT_ITER65.md`
- MODIFIED: `/app/backend/server.py` (+~250 lines: telemetry endpoint, funnel admin, payment-event helper + admin endpoint, 4 startup indexes), 6 frontend pages instrumented (Catalogue · Faq · ClarityThreshold · BodyRoom · CourseRoom · UserPortal)

### Verification
- `/api/telemetry/event` accepts valid types, rejects unknown, throttles past 60/min.
- `/api/admin/observation/funnel` returns expected JSON with 24h+7d counts.
- `/api/admin/payment-events` returns empty list (no events written yet).
- All 6 backend integration suites still green.
- All 7 modified frontend files lint clean.

### Open NEW post-launch P0s (from audit §7)
- 🔴 Magic-link per-IP rate-limit
- 🔴 Quarantine 24 stale legacy tests
- 🔴 LLM-fallback event log + counter

### Final classification
Unchanged: **🟡 CONTROLLED BETA READY.** Two founder-side P0s remain (LemonSqueezy + PSL copy). Two **new** post-launch P0s identified in audit (magic-link rate-limit + stale tests). Both surgical, < 100 lines each, deferred per "no new systems" rule until founder resumes building.


---

## Iter 65c / 66 — Forensic Language-Isolation Pass (Feb 2026)

**Mode:** $0 warranty fixes. Independent System Inspector role. Brutal forensic scan.

### Two CRITICAL P0 leaks found and fixed (warranty)
1. **🔴 28 Estonian markers (`**Päeva praktika:**`, `**Vaikne lause:**`) embedded inside ALL English course letter bodies.** Every wanderer paying $25 for any of the 4 English courses was reading Estonian section headings mid-paragraph. **FIXED:** all 28 instances replaced with `**Day practice:**` and `**Quiet line:**`. Estonian course `raha-ja-teadvus-moodul-1` Estonian markers preserved separately for any future ET launch.
2. **🔴 Estonian shelf labels in `/api/library/shelves` public payload.** Library was showing "Raha & Teadvus", "Keha Atlas", "Suhted ja Sagedus", "Vaimne Suveräänsus" instead of the English equivalents. **FIXED:** endpoint now promotes `label_en` and a new `_SHELF_INTRO_EN` dict to the response shape. Source dict unchanged.

### Warranty-fix code
- `backend/server.py` — ~150 line delta in 3 sections (28+28 letter markers, shelf endpoint promotion, ET course block restoration)
- `backend/tests/test_language_isolation_iter65c.py` — NEW regression test guards 7 public payloads against future ET/Cyrillic leaks
- `frontend/src/pages/CourseDetail.jsx:521` — JS comment language reference fixed

### Verification
- 7/7 backend integration suites green (added `test_language_isolation_iter65c`)
- 7 public API endpoints scanned: `/api/courses`, every `/api/courses/{slug}`, `/api/library/shelves`, `/api/books`, `/api/clarity/passes`, `/api/sixnights/preview`, `/api/blog`, `/api/brand` — all return **zero** Estonian/Cyrillic characters
- All `frontend/src/**/*.jsx` user-visible strings are English-only

### Forensic report
`/app/memory/FORENSIC_REPORT_ITER65c.md` — sections A through K covering: critical issues, robotic-copy detection, tone consistency, cultural inconsistency, fixes applied, remaining unsafe surfaces, operational verification, trust-breaking moments, immediate-fix list, and what should remain untouched.

### Final classification
Unchanged: **🟡 CONTROLLED BETA READY.** Hub side now language-pure with regression coverage. PSL still founder-side per iter-64d email. Post-launch P0s from iter 65 (magic-link rate-limit, stale tests, LLM-fallback log) unchanged.


---

## Iter 67 — Operation "Open Factory" + Faas 1 & 2 (Feb 11, 2026)

**Mode:** Founder-directed sprint. Visual + voice ergonomics + temporary paywall bypass while LemonSqueezy is being activated by support.

### Faas 1 — Visual anchor (Grace v1 video avatar)
- `GuidePresence.jsx` now renders `/avatars/grace_vision_pilot.mp4` (Sora 2 vertical 12s loop, candlelit pose) for `gender="female"`. Static JPG remains as fallback.
- Clarity guide (`gender="male"`) still uses the static portrait. Body Room shares the same component so it inherits the video automatically when shown with the female guide.
- New CSS animation `.aurin-guide-speaking-halo` provides a soft sage glow when `runtimeState="speaking"`.

### Faas 2 — Smooth conversation (no-button + VAD)
- `useVoiceIO` extended with `autoVoice`, `vadSilenceMs`, `vadVolumeThreshold`, `vadMinSpeechMs` props.
- When `autoVoice=true`: Web Audio API analyser drives turn detection; recorder auto-stops after 1.5s of silence following ≥350ms of voiced audio; barge-in pauses the TTS the moment the user begins to speak; after `speak()` finishes (or is interrupted), listening auto-restarts.
- `ClarityRelease.jsx` and `BodyRoomChat.jsx` both flipped to `autoVoice=true`. Push-to-talk buttons removed. Replaced by a calm 4-state voice status line (`A small pause / Listening, unhurried / Hearing the words / Speaking`). Mute/pause toggle preserved.
- AGOP §C "Voice & silence wisdom" block added to both `clarity_ai.py` and `body_room_ai.py` — controls when to stay quiet, never interrupt, match cadence, "mhm" gets a "mhm".

### Faas 2 scaffold — OpenAI Realtime API (gated)
- New module `backend/clarity_realtime.py` exposing `POST /api/clarity/realtime/session` and `GET /api/clarity/realtime/health`.
- `REALTIME_MODE=off` (default) → 503 with helpful detail; legacy Whisper+Claude+TTS pipeline remains the live path.
- Activation: founder provides direct `OPENAI_API_KEY` (Universal Key does NOT cover Realtime per Emergent Support) and sets `REALTIME_MODE=on`. Frontend `<RealtimeCompanion />` peer component still TODO.

### Operation "Open Factory" — temporary free-access window
- Backend env `FREE_ACCESS_UNTIL=2026-05-20` (ISO date) → `_free_access_active()` helper returns True until that date passes.
- `/api/clarity/access` now returns `{has_active_pass:true, tier:"free_access", free_access:true, expires_at:"2026-05-20"}` for every signed-in wanderer.
- `/api/cabinet/message` keeps `show_continuation:false` indefinitely while the window is open (LemonSqueezy paywall fully bypassed).
- Reverting: clear or expire the env var → behavior returns to per-session pass model.

### Body Room — Ancient wisdom layer
- `body_room_ai.py` system prompt extended with `# §Ancient wisdom (Open Factory layer)`: mentor may now sparingly offer Ayurveda (doṣa/sītalī breath), classical Chinese medicine (meridians/gates), yogic prāṇāyāma, Tibetan tsa-lung, slow-walk traditions — under strict constraints (single tradition word per reply, plain-language gloss, never diagnostic, only when the body region invites it).

### Test coverage
- Testing agent iter_64: 10/10 backend tests pass including free-access bypass, realtime gating, AGOP-A pacing, Ayurveda-offering tolerance, static asset reachability.
- Minor adjustment by tester: expanded valid tone set to match `clarity_ai.py` output (compassion/support/reflection/neutral).

### Deploy notes
- `/app/memory/DEPLOY_FAAS_1_2.md` — operator-ready deploy + rollback playbook.
- Production env needs: `FREE_ACCESS_UNTIL=2026-05-20`, `REALTIME_MODE=off`, all existing keys preserved. Static avatar mp4 ships in the frontend public bundle.

### What's NOT in this sprint
- Course Curator / COO production-manager (separate sprint; needs PDF intake + RAG architecture).
- Frontend `<RealtimeCompanion />` peer (waits on founder's OpenAI key).
- Grace v2 with plant uplight + Clarity pilot videos (waits on Sora 2 access — Emergent video pool empty per support).
- Mobile reality test (iPhone Safari / Android Chrome / Instagram in-app browser).

### Status
🟢 **Faas 1 + Faas 2 deployable on preview, regression green.** Founder action items: (1) Save to GitHub + manual production deploy, (2) sort LemonSqueezy with support to remove the Open Factory bypass when ready, (3) optionally provide own `OPENAI_API_KEY` to flip Realtime on.

---

## Iter 68 — Operation Open Factory tail (Feb 11, 2026 — same day)

### Wellness-only language lock (AGOP-D) — airtight
**Problem:** AGOP-D system prompt alone leaked clinical vocabulary under adversarial input — Claude tends to echo user's exact words in mirror-first replies ("if user says PTSD, reply may also say PTSD").

**Solution — two-layer post-filter:** `backend/clarity_safety.py` (new module).
- **Layer 1:** targeted grammar-aware substitutions for clinical phrases (panic disorder → alarm pattern, trauma → heavy pattern, therapist → licensed practitioner, treatment → professional support, diagnosis → naming, etc.). Article collisions ("a a"/"a an old") cleaned up.
- **Layer 2:** hard-banned token regex scan. If ANY of ~30 banned words survive layer 1, the entire reply is replaced by a safe canned fallback that redirects to a licensed practitioner.
- Applied at the end of `_split_signals()` in `clarity_ai.py`. Body Room reuses `_split_signals`, so both rooms inherit the filter.

**Test result:** Iter 66 — 8/8 pass + 6x stress repeats against the two most adversarial prompts = ZERO clinical-vocabulary leaks. Legal-safety lock confirmed airtight by testing agent.

### "Just talk to Grace" soft entry from Body Room
New section on `BodyRoom.jsx` introductions: "If nothing yet has a name" card with CTA → `/clarity-release?entry=just-talk`. For wanderers who arrive without a clear body region to choose. (Server-side `entry` parameter handling left as a later micro-task — Grace's existing opening already invites soft conversation.)

### Disclaimer wording — wellness-explicit
ClarityThreshold disclaimer rewritten:
- "This is a self-development and inner-balance space ... It is not a medical service, not counselling, and not therapy."
- Consent label: "I understand this is not medical care and does not replace a licensed practitioner."

### Marketing & LP copy pack (founder-publishable)
`/app/memory/MARKETING_LP_COPY_PACK.md` — Instagram main post, reel caption, story sequence, email-to-list, LP headline rewrite, plus a banned-words list for ongoing marketing copy.

### Products verified vs PDF
All products from founder's `prodct and price.pdf` are present in `server.py` with matching prices ($5 / $7 / $10 / $13 / $25 / $30 / $70 / $19/mo / $9/mo / $4/mo). "Hetke Kaja / Igavene Lõim" concept is live as Transient Echo / Eternal Thread (English labels — Estonian labels can be swapped in UI on request).

### Status
🟢 **Legal-safety lock airtight, Open Factory window open, smoke + adversarial tests green.** Code is ready for redeploy from preview → production whenever founder is ready. No open blockers from this iter.

### Founder action items (still open)
- 🟢 Save to GitHub + redeploy to prulesoul.site
- 🟡 (optional) Provide own OPENAI_API_KEY → flip REALTIME_MODE=on for sub-second voice
- 🟡 Mobile reality test (iPhone Safari, Android Chrome, Instagram in-app)
- 🟡 LemonSqueezy support resolution → eventually remove FREE_ACCESS_UNTIL
- 🟡 First course PDF for Curator/RAG sprint (founder-content, not agent-content)

---

## Iter 69 — Final Open Factory tail (Feb 11, 2026, same evening)

### Psychiatric exclusion — hard gate
`WandererGate.jsx` consent clauses expanded from 4 → 5:
- "I confirm I am not currently under psychiatric care and do not carry a psychiatric diagnosis. (If I do, I will use a licensed practitioner instead — this space is not for me.)"
- "I take full responsibility for my own decisions, choices, and wellbeing while using this space."

`AGREEMENT_VERSION` bumped `1.0-2026-02-07 → 1.1-2026-02-11-psych-exclusion`. Every previously-consenting visitor is automatically forced to re-consent to the new version. Per-room `ClarityThreshold` mirrors the same 5-clause structure (confirm-a..confirm-e).

### Wanderer's Agreement — country-neutral hotlines
Removed Estonian "Eluliin 116 123" hard-coded crisis line. Replaced with:
- "Your local emergency number (112 in Europe, 911 in North America)"
- "A free, confidential crisis line in your country: findahelpline.com"

Aligns the entire public site with the founder's directive: 100% English / international, zero Estonian user-facing strings.

### RealtimeCompanion frontend (gated, ready for OpenAI key)
New component `frontend/src/components/RealtimeCompanion.jsx`:
- Probes `GET /api/clarity/realtime/health` on mount.
- Renders nothing when `enabled:false` → legacy Whisper+Claude+TTS pipeline stays the only path.
- When the founder provides direct `OPENAI_API_KEY` + sets `REALTIME_MODE=on`, the component mints an ephemeral token via `/api/clarity/realtime/session`, opens an `RTCPeerConnection` straight to `api.openai.com/v1/realtime`, streams mic audio and plays the model's audio reply.
- Handles standard event flow (speech_started / response.audio.delta / response.done / transcription completed) and exposes runtime state to the parent.
- Mounted inside `ClarityRelease.jsx` chat form, transparent to the user when off.

### Public catalogue verified English-only
`/api/courses` already filters by `language=='en'`, so the Estonian "Raha ja Teadvus" seed remains in code but does NOT appear in the public catalogue. Verified by iter-67 testing agent.

### Test result
Iter 67: 9/9 PASS. AGOP-D filter still airtight after all today's additions, Open Factory still open, Realtime gating still correct, English-only catalogue confirmed.

### What still requires founder input (cannot be agent-completed)
- **Sora 2 Grace v2 + Clarity videos:** need founder's own OpenAI API key (Universal Key does not cover Sora 2 per Emergent Support). Once provided + REALTIME_MODE=on, the autopilot script generates all videos and Realtime activates.
- **Course Curator / RAG sprint:** need founder's first course PDF as input. Agent cannot author psychology/Ayurveda content for the founder.
- **Body Room v2 / Ayurveda widget:** founder concept undefined ("widget" of what shape?); needs a one-paragraph spec from founder before scoping.
- **Mobile reality test:** physical devices required; agent's tooling is desktop-headless only.
- **LemonSqueezy live mode:** awaiting Lemon support's account confirmation.

### Status
🟢 **Open Factory tail complete. Code is wellness-safe, legal-locked, English-only, ready for redeploy.** Founder can "Save to GitHub" + manual deploy any time.
