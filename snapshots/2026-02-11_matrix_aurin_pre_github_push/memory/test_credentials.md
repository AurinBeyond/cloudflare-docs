# Test Credentials — Aurin Hub / Prulesoul

## Local dev / preview session token
```
session_token: ccb7b5b6-b89a-4e2b-b8d0-d25d18667cb8ae154a55d93342dc8ae34a83287340cd
```
Used by:
- backend pytest tests (`tests/test_*`)
- backend curl smoke tests (`Authorization: Bearer <token>`)
- frontend localStorage key: `aurin_session_token`
- `?t=<token>` on streaming TTS endpoint (`<audio>` cannot send headers)

## ElevenLabs Conversational AI agents (founder, 2026-02-15)
The agent_ids live in `/app/backend/.env`:
- `ELEVENLABS_CONVAI_AGENT_GRACE`   = agent_6801krh8dnmze1zthsnf5xb6xe43 (Private Room, /clarity-release)
- `ELEVENLABS_CONVAI_AGENT_KAELAN`  = agent_6401krjff71xf1pss69kqe1wtxs8 (Body Room, /body-room)
- `ELEVENLABS_CONVAI_AGENT_SARA`    = agent_2701krjvc4mpezzsym54wsr2vn1t (Parents' Room, /parents-room)
- `ELEVENLABS_CONVAI_AGENT_ALISTAIR`= agent_2401krjfn3cpeyjrreqgy1d1dbr0 (Course Room, /course-room)

## Wanderer-gate localStorage keys (frontend Playwright tests)
```
wanderer_accepted_1.1-2026-02-11-psych-exclusion_private = "1"
```

## Notes
- No test admin account required for the current scope.
- ElevenLabs API key was rotated by founder on 2026-02-14; current key
  has scopes: text_to_speech, convai_write, user_read, voices_read.
- Founder's ElevenLabs account tier: Creator (158,500 chars / month).

## Angel Stars test session (2026-02-09 — iteration 75)
A throwaway token used by the testing agent end-to-end for the new
`/api/angel-stars/*` lifecycle. Persistent inside the preview DB:
```
session_token: test_token_6489e6cf1440
user_id prefix: user_angel_test_*
```
Post-iteration-75 state for this user:
- ~12 stars approved on `little-dreamers`
- tier 1 redeemed
- premium = TRUE (has presence_seconds_left > 0 from referrer reward)
Use `Authorization: Bearer test_token_6489e6cf1440` to inspect.

## Iteration 77 lifecycle artifacts

Two long-lived test users still active in the preview DB:

```
user_id: user_angel_test_c01ba5
session_token: test_token_6489e6cf1440
referral_code: AURIN515556
state: 12 stars on little-dreamers, tier 1 redeemed, 500s balance from referrer reward
        opt_out=false on Anna's letter
        body_temple_progress: day 1 marked completed (iter 79 test)
        grace_mode: "" (cleared at end of iter 79 test)
NOTE (iter 83 2026-05-27): testing agent re-inserted the `user_sessions`
row for this token (it had been pruned). Expires 2026-06-26.

user_id: user_referee_<6hex>
session_token: ref_token_4541d15c20c8
state: 500s balance from referee reward, 1 mood checkin on explorers
```

Both can be used to verify the full system end-to-end without
manual setup. ADMIN_TOKEN for /api/admin/annas-letter is in
/app/backend/.env.

## Iteration 83 — Kids Universe Phase 2-4 (2026-02-27)

Re-inserted user_sessions row (30d expiry) for the long-lived test token
during iteration_83 backend tests. Still valid:

```
session_token: test_token_6489e6cf1440
user_id:       user_angel_test_c01ba5
state:         premium (presence_seconds_left>0 from referrer reward),
               body_temple_unlock granted, kids_progress + star_commitments
               + kids_album_photos + emotion_checkins seeded by tests
```

All `/api/kids-journey/*` endpoints + `/api/admin/letter-of-admission/send`
verified end-to-end with this token. ADMIN_TOKEN read from
/app/backend/.env at runtime.

## Iteration 79 — Body Temple 28 + Grace Boundaries Mode

New endpoints (all working, smoke-tested via curl 2026-02-09):

```
GET  /api/body-temple/overview         (public; returns weeks+days+unlocked)
GET  /api/body-temple/day/{1..28}      (public; locked content hidden for non-premium)
POST /api/body-temple/complete         (auth; marks day walked, premium required)
GET  /api/grace/modes                  (public; lists 3 modes)
GET  /api/grace/mode                   (returns persisted mode for user)
POST /api/grace/mode {"mode": "boundaries"|"energy"|"grey_rocking"|""}
```

Frontend routes:
```
/body-temple                  — new course landing (public)
/body-room                    — entry card added pointing to /body-temple
/clarity-release              — GraceModeSelector added on Hub phase (signed-in only)
```

To test Grace mode selector in playwright:
1. Set `aurin_session_token` + `wanderer_accepted_1.1-2026-02-11-psych-exclusion_private` in localStorage
2. Walk through the "four quiet truths" GATE phase first (clicking each
   confirm checkbox) OR set the relevant gate-bypass localStorage if any.
3. The GraceModeSelector appears under section[data-testid="grace-mode-section"]
   only AFTER the gate is passed (PHASES.HUB).
