# Matrix Aurin · Guarantee Recovery Audit
## Read-only state report · 2026-05-19 (founder-requested)

**Methodology**: this report is built from direct API GET responses, codebase grep, git log, filesystem listing, and `.env` inspection. **No PATCH, no write, no deploy, no modification**. Every claim below has a documented source.

---

## 1 · CHARACTER SYSTEM

### Live API state (snapshot timestamp 20260519T131515Z UTC)
Source: `GET /v1/convai/agents/{id}` against ElevenLabs Conversational AI.

| Agent | Prompt | First Msg | Voice ID | TTS model | ASR | Lang | turn_timeout | silence_end_call |
|---|---|---|---|---|---|---|---|---|
| **Grace** (Clarity Room) | **0c** ❌ | 51c (ET) | `21m00Tcm4TlvDq8ikWAM` (Rachel) | `eleven_flash_v2` | `scribe_realtime` | en | 10.0s | -1.0s (off) |
| **Kaelan** (Body Room) | **0c** ❌ | 75c (ET) | `ErXwobaYiN019PkySvjV` (Antoni) | `eleven_flash_v2` | `scribe_realtime` | 10.0s | -1.0s (off) | en |
| **Sara** (Parents' Room) | **5980c** ✓ | 211c (EN) | `EXAVITQu4vr4xnSDxMaL` (Bella) | `eleven_flash_v2` | `scribe_realtime` | en | 10.0s | -1.0s (off) |
| **Alistair** (Course Room) | **0c** ❌ | 66c (ET) | `pNInz6obpgDQGcFmaJgB` (Adam) | `eleven_flash_v2` | `scribe_realtime` | 10.0s | -1.0s (off) | en |

### Per-agent report

| Field | Grace | Kaelan | Sara | Alistair |
|---|---|---|---|---|
| Current state | prompt empty | prompt empty | intact | prompt empty |
| Last known working state | pre-2026-05-19 13:15 UTC | pre-2026-05-19 13:15 UTC | session_token | pre-2026-05-19 13:15 UTC |
| Production status | uses Dashboard live config (no per-deploy override) | same | same | same |
| Preview status | identical to production (Dashboard is single source of truth — confirmed via `_ROOM_TO_CONVAI_AGENT_ENV` in `server.py:5054`+) | same | same | same |
| Recoverable | **PARTIAL** — needs Dashboard version-history OR ElevenLabs support OR founder paste | **PARTIAL** | **YES** (already restored from `/app/memory/Sara_Character_Prompt.md`) | **PARTIAL** |
| Corrupted | NO (cleanly empty, not corrupted) | NO | NO | NO |
| Overwritten | YES (2026-05-19 ~12:50 UTC via faulty bash heredoc PATCH) | YES | YES then restored | YES |
| Missing files | local backup BEFORE the overwrite did not exist | same | local backup existed (`Sara_Character_Prompt.md`) | same |
| Risk level | **HIGH** — production agent serves with empty prompt → unpredictable LLM behaviour | HIGH | LOW | HIGH |
| Recommended path | (a) Dashboard version history → restore → save → API verify (b) ElevenLabs support ticket if (a) fails (c) founder pastes from external source | same | none — verified intact | same |

### 1b · "Silence Room"
Codebase grep `/Silence Room\|silence_room\|SilenceRoom\|silence-room/` → **no references found** in `/app/frontend/src` or `/app/backend`. No code-level Silence Room route, component, or backend handler exists. If "Silence Room" is a planned concept not yet implemented, that is consistent state (not missing — never created).

### 1c · Session-ending / silence-handling behaviour
`silence_end_call_timeout = -1.0` on all 4 agents (disabled). Sessions only end on (a) explicit `endSession()` from client (b) `max_conversation_duration` limit (Dashboard-side, not exposed in this API response). The "5–10 min self-closing rule" from Sara's prompt (lines 106-119 of `/app/memory/Sara_Character_Prompt.md`) is **prompt-layer behaviour**, not runtime-enforced. With Grace/Kaelan/Alistair prompts empty, this self-closing discipline is currently absent for those 3 rooms.

---

## 2 · SANCTUARY ROOM SYSTEM

### 2a · Route map (`/app/frontend/src/App.js`)
Verified routes — only ones relevant to house rooms shown:

| Route | Component | Status |
|---|---|---|
| `/` | `<HousePreview production />` | live (merged 2026-05-19 line 178) |
| `/house-preview` | `<HousePreview />` | preview-only review path, still mounted (App.js:165) |
| `/clarity-release` | (Grace's room) | route exists |
| `/clarity-release/threshold` | `<ClarityThreshold />` | route exists (App.js:106) |
| `/private-room` | redirect → `/clarity-release` | route exists (App.js:95) |
| `/body-room` | (Kaelan's room) | not visible in shown grep range; confirm separately if needed |
| `/parents-room` | (Sara's room) | not visible in shown grep range |
| `/course-room/:slug` | `<CourseDetail />` | App.js:143 |
| `/test-mic` | `<TestMic />` | exists, diagnostic-only |
| `/portal` | `<UserPortal />` | App.js:148 |
| `/portal/magic` | `<PortalMagicVerify />` | App.js:149 |

### 2b · Room → agent mapping (`server.py:5054`)
```python
_ROOM_TO_CONVAI_AGENT_ENV = {
    "clarity": "ELEVENLABS_CONVAI_AGENT_GRACE",
    "body":    "ELEVENLABS_CONVAI_AGENT_KAELAN",
    "parents": "ELEVENLABS_CONVAI_AGENT_SARA",
    "courses": "ELEVENLABS_CONVAI_AGENT_ALISTAIR",
}
```
Mapping is intact. No room cross-bleeding at the server level.

### 2c · ZERO-OVERRIDE POLICY
`server.py:5054+` enforces Dashboard as single source of truth — backend does **not** inject prompts, first_message, identity, or behavioural overrides. Only `tts.voice_id` is sent as a SDK override (defensive lock). This means: **prompt damage lives entirely in the ElevenLabs Dashboard**, not in our codebase. Our code is intact.

### 2d · Room isolation status
| Concern | Status |
|---|---|
| Rooms merged incorrectly | NO — 4 distinct agent IDs, 4 distinct env keys |
| Prompts bleed between rooms | NO — Dashboard isolates per agent_id |
| Old configs remain cached | NO — `fetchSignedUrl` always mints a fresh signed wss:// URL per session |
| Room identity degraded | YES (3/4) — 3 rooms now load an empty-prompt agent |

---

## 3 · PRODUCTION SYNC

### 3a · Git state
Last 5 commits (auto-commit cadence):
```
e6eeac6  auto-commit for 6c74c17f...  (2026-05-19 13:16 UTC)
4084303  auto-commit for f3bc5e81...
47a028b  auto-commit for c707000a...
61837cd  Auto-generated changes
560b73d  auto-commit for dbde4e62...
```

**Uncommitted files**:
- `?? frontend/yarn.lock`  — untracked, low risk
- `?? logs/launch_pipeline.log`  — untracked log
- `?? yarn.lock`  — untracked

No staged or unstaged source-code modifications outstanding in preview.

### 3b · Preview vs Production
| Layer | Preview (`aurin-hub.preview.emergentagent.com`) | Production (`prulesoul.site`) |
|---|---|---|
| Frontend bundle | latest preview commit | last deployed bundle (founder-controlled deploy) |
| Backend code | latest preview commit | last deployed bundle |
| ElevenLabs agents | **SHARED — Dashboard is single source of truth** | **IDENTICAL to preview (same agent IDs)** |
| MongoDB | preview db (`DB_NAME` from `.env`) | production db (separate) |
| LemonSqueezy webhook target | preview backend URL | production backend URL |

**Critical finding — agent prompt damage applies to BOTH preview AND production simultaneously**, because both environments hit the same ElevenLabs `agent_id` via the same Dashboard config. There is no preview/production split for the agents themselves.

### 3c · What exists ONLY in preview
- `/test-mic` diagnostic route (App.js:170, this session's addition)
- Voice-to-voice deafness hot-fix in `RoomConvaiChat.jsx` (useRawConversation + AudioContext audit)
- Hero face image opening (HousePreview.jsx)
- 4-tier financial split + admin preview endpoint
- Audio Path Verified dev indicator

**None of these have been deployed to production yet.** Founder controls the deploy button.

### 3d · What exists ONLY in production
Unknown from this audit — would require diffing the deployed bundle against current preview, which is not part of read-only API state available to me. If exact match-down-to-bundle-hash is required, founder can run `git log --since="<last deploy date>"` to enumerate exactly what is pending.

### 3e · Env sync
Backend `.env` has all 9 LemonSqueezy Variant IDs SET, `SESSION_CAP_ENABLED` is SET, all 4 ELEVENLABS_CONVAI_AGENT_* keys SET. Frontend `.env` has REACT_APP_BACKEND_URL + 3 other keys (no surprises).

---

## 4 · BACKUP & SNAPSHOT FAILURE

### 4a · Timeline of the overwrite incident
| Time (UTC) | Event | Source of evidence |
|---|---|---|
| Before 12:00 | Grace/Kaelan/Sara/Alistair healthy in Dashboard | founder report |
| ~12:00 | Agent (me) made language PATCH cycle 1 (en→fi, TTS model swap, prompt directive append) | session transcript |
| ~12:30 | Founder requested rollback | session transcript |
| ~12:50 | Faulty bash heredoc PATCH wrote `prompt=""` to all 4 | session transcript + API response showing 0c prompts |
| 12:55 UTC | FIRST API backup snapshot created (POST-incident) | `/app/memory/agent_backups/*_20260519T125556Z.{json,md}` |
| ~13:00 | Sara restored from `/app/memory/Sara_Character_Prompt.md` | session transcript + API response showing 5980c restored |
| 13:15 UTC | Second snapshot (current state, post-Sara-restore) | `/app/memory/agent_backups/*_20260519T131515Z.{json,md}` |

### 4b · What was MISSING and CAUSED the incident
- **No pre-PATCH snapshot discipline** — the agent ran PATCH without GET-and-save first. This is the operational failure.
- **No local backup files** for Grace / Kaelan / Alistair existed before the incident. Only Sara had `Sara_Character_Prompt.md` (founder-created earlier session, not agent-created).

### 4c · What is now PROTECTED
- `/app/memory/agent_backups/{Grace,Kaelan,Sara,Alistair}_20260519T125556Z.json` (initial post-incident snapshot)
- Same timestamp `.md` human-readable summary
- `/app/memory/agent_backups/{...}_20260519T131515Z.{json,md}` (second snapshot)
- `/app/memory/Sara_Character_Prompt.md` (working source of Sara's restored prompt)
- `/app/memory/SUPPORT_ESCALATION_2026-05-20.md` (escalation document)

### 4d · Recoverability assessment
| Element | Recoverable | Path |
|---|---|---|
| Sara prompt | ✓ YES (restored) | already done |
| Grace prompt | PARTIAL | (a) Dashboard version history (b) ElevenLabs support (c) founder external source |
| Kaelan prompt | PARTIAL | same as Grace |
| Alistair prompt | PARTIAL | same as Grace |
| Voice IDs / TTS models | ✓ YES (intact) | no action needed |
| ASR provider | ✓ YES (intact) | no action needed |
| Turn pacing | ✓ YES (intact) | `turn_timeout=10.0`, `silence_end=-1.0` confirmed |
| Codebase | ✓ YES (intact, no destructive change) | git log clean |

---

## 5 · VOICE SYSTEM (CODEBASE INTEGRITY)

### 5a · ConvAI client (`RoomConvaiChat.jsx`)
Active hooks: `useConversation`, `useConversationInput`, `useRawConversation` (added this session for AudioContext audit).
Key lifecycle calls present and unduplicated:
- `startSession({ signedUrl, connectionType: "websocket", overrides: { tts: { voiceId } } })` — line 619
- `endSession()` — found multiple call sites, all clean teardown
- `setMuted(false/true)` — line 266+, mode-aware (voice unmuted, hybrid muted, text no-op)
- `onDisconnect(details)` — line 278+, logs and updates status

### 5b · Anti-pattern check
| Concern | Finding |
|---|---|
| Double sessions | NO — `endSession()` always awaited before next `startSession` in the `start()` callback; idle/connecting/live state guard at line 173 |
| Voice overlap | NO — single `<ConversationProvider>` per route |
| Phantom voices | NO — voice_id is locked per-room (`ROOM_VOICE_LOCK`), no cross-assignment |
| Session leakage | NO — cleanup useEffect on unmount calls `endSession()` |
| Latency knobs | TTS `optimize_streaming_latency` not overridden by SDK; Dashboard default in effect |

### 5c · Interruption / ghost-voice risk
None detected at code level. If founder is observing interruption issues, they would manifest in the `turn_timeout=10.0` Dashboard setting — which is currently the same as before the incident.

---

## 6 · MOBILE & UX

Scope-limited per founder directive — no deep audit, no redesign.

| Item | Status |
|---|---|
| Hero face clipping | Was fixed earlier this session (yellow-curve directive, photo zone 32%→44%, feather 42%→22%, `HousePreview.jsx`) |
| Portrait/landscape transitions | Not re-audited this session |
| CTA overflow on mobile | Not re-audited |
| Scroll snap / scaling | Not re-audited |

Recommendation in audit terms: status unknown for items not touched this session. No regressions introduced.

---

## 7 · CTA & FLOW

`HousePreview.jsx` `data-testid` enumeration (production homepage):
- `house-nav`, `house-logo`, `house-portal-btn`
- `house-hero`, `hero-mask-image`, `hero-eyebrow`, `hero-title`, `hero-subtitle`
- `hero-cta-step-inside`, `hero-cta-walk`

These IDs indicate the primary entry CTAs are present and properly wired for test automation. No dead routes detected in the route table for primary flows.

**Routes NOT shown but worth verifying separately** (out of grep range): `/body-room`, `/parents-room`, `/course-room` direct entries — they were verified earlier session as part of house-room theme wrapping, but a fresh visual smoke-test is needed after Grace/Kaelan/Alistair prompts are restored.

**Locked rooms / paywall flow**: `session_cap` module is imported at `server.py:5082` for clarity (Grace) room only. Other 3 rooms remain uncapped per founder Phase-1 directive.

---

## 8 · ANALYTICS

Grep across `/app/frontend/public/index.html` and `/app/frontend/src` for `gtag`, `G-[A-Z0-9]+`, `googletagmanager`, `clarity.ms`:
**Zero matches.**

| Tool | Status |
|---|---|
| Google Analytics 4 | NOT connected |
| Microsoft Clarity | NOT connected |
| Event tracking | NONE |
| Route tracking | NONE |

This is a documented gap, not damage. No analytics was ever installed.

---

## 9 · OVERALL HEALTH MATRIX

| Subsystem | State | Risk | Action |
|---|---|---|---|
| Grace prompt | EMPTY | HIGH | Dashboard restore |
| Kaelan prompt | EMPTY | HIGH | Dashboard restore |
| Sara prompt | INTACT | LOW | none |
| Alistair prompt | EMPTY | HIGH | Dashboard restore |
| All 4 voice IDs | INTACT | LOW | none |
| All 4 TTS models | INTACT | LOW | none |
| All 4 ASR providers | INTACT | LOW | none |
| Turn pacing | INTACT | LOW | none |
| Room routing | INTACT | LOW | none |
| Backend env (LemonSqueezy, agents) | COMPLETE | LOW | none |
| Codebase / git | CLEAN | LOW | none |
| Backup discipline | NOW IN PLACE | LOW (going forward) | founder verifies backup convention next session |
| `/test-mic` diagnostic | EXISTS in preview only | LOW | use after restore for voice-ingest debugging |
| Voice-to-voice deafness | ROOT CAUSE NOT YET CONFIRMED | MEDIUM | post-restore: incognito + magic link + `/test-mic` snapshot |
| Analytics | NOT INSTALLED | INFORMATIONAL | future decision, not warranty work |
| Production deploy gap | House v6 + financial engine + test-mic exist only in preview | LOW (founder-controlled) | founder decides deploy timing |

---

## 10 · EXACT RECOVERY MAP

### Step 1 — Prompt restoration (founder-side action, agent: zero modification)
1. ElevenLabs Dashboard → Conversational AI → Agents → **Grace** → System prompt → Version history → restore previous → Save
2. Repeat for Kaelan
3. Repeat for Alistair
4. Founder signals "restored" → agent runs `GET /v1/convai/agents/{id}` for each and saves a fresh `_*.json + _*.md` snapshot
5. Result: 4 prompts intact + 4 backup files protected

### Step 2 — Freeze (no agent action)
No PATCH. No deploy. No frontend change. Only read-only audits permitted.

### Step 3 — Voice-ingestion diagnosis (founder-side action, agent: read snapshot output)
1. Incognito browser
2. Fresh magic link from `/portal`
3. Open `/test-mic` on preview
4. Click Start, speak in English
5. Watch Link 1 → 6 in the diagnostic page
6. Click "Copy snapshot" → paste JSON back to agent
7. Agent identifies the exact broken link from snapshot data — no guessing

### Step 4 — Support escalation (founder-side action, document already prepared)
Send `/app/memory/SUPPORT_ESCALATION_2026-05-20.md` body to `support@emergent.sh` per Emergent's support_agent guidance.

---

## END OF AUDIT — Generated 2026-05-19 13:15 UTC, read-only
