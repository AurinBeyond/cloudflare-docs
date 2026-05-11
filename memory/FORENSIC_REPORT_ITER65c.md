# FORENSIC INSPECTION REPORT — Iter 66 / 65c
**Date:** Feb 2026 · system integrity restoration pass
**Inspector:** E1 (Independent System Inspector mode)
**Tone:** brutal · operational · zero protection bias

---

## A · CRITICAL ISSUES (P0) — ALL FIXED THIS ITER

### A-1 · 🔴 Estonian leak inside English course letter bodies
**FOUND.** Every English course letter rendered to a paying wanderer contained two Estonian markers in the markdown body:
- `**Päeva praktika:**` (Estonian for "Day's practice") — 28 instances across the 4 English courses
- `**Vaikne lause:**` (Estonian for "Quiet line") — 28 instances across the 4 English courses

A wanderer paying $25 for `letting-the-old-stories-rest`, `the-language-you-forgot`, `seven-quiet-evenings-with-children`, or `the-body-knows-first` would see Estonian section headings mid-paragraph, **inside premium content they paid for**. This is the worst possible language-isolation breach — premium content failing the founder's strict "one environment = one language" rule.

**ROOT CAUSE:** when iter 55 generated the 28 deep Aurin-voice letters in bulk, the agent reused the Estonian template structure (`Päeva praktika` / `Vaikne lause`) without translating them when the content was poured into English-`language: "en"` course rows.

**FIX APPLIED:** global replace in `backend/server.py`. All 28 instances changed to `**Day practice:**` and `**Quiet line:**`. The Estonian course `raha-ja-teadvus-moodul-1` was then patched back with its original Estonian markers (it was unintentionally caught by the global pass). Verified: all 4 English course detail payloads return zero Estonian characters; the Estonian course preserved.

**VERIFICATION:** new regression test `tests/test_language_isolation_iter65c.py` — runs against `/api/courses`, every `/api/courses/{slug}`, `/api/library/shelves`, `/api/books`, `/api/clarity/passes`. **PASS** live.

### A-2 · 🔴 Estonian shelf labels in `/api/library/shelves` public payload
**FOUND.** The library shelves endpoint was returning the raw `LIBRARY_THEMES` dict including the Estonian `"label"` and `"intro"` fields directly. The Estonian `"label_en"` and a separate English intro existed in source but were not promoted into the response. Result on the live preview:
- `"Raha & Teadvus"` instead of `"Money & Consciousness"`
- `"Keha Atlas"` instead of `"Body Atlas"`
- `"Suhted ja Sagedus"` instead of `"Relationships & Frequency"`
- `"Vaimne Suveräänsus"` instead of `"Spiritual Sovereignty"`

Public users browsing `/library` saw Estonian shelf names. Mid-trust break.

**FIX APPLIED:** `library_shelves` endpoint now promotes `label_en` → `label` and `_SHELF_INTRO_EN[slug]` → `intro` before returning. The Estonian source values are dropped from the response shape, not from source. Verified live: all 4 shelves return clean English labels and intros.

**VERIFICATION:** part of `test_language_isolation_iter65c.py` PASS.

### A-3 · 🔴 JSX comment in `CourseDetail.jsx` mentioned Estonian source
**FOUND.** A JS code comment at `CourseDetail.jsx:521` referenced the Estonian phrase `Päeva praktika` and `Vaikne lause` as the heading names. Internal comment, not user-visible — but it was a language-discipline breach in the codebase itself.

**FIX APPLIED:** comment rewritten to reference the English markers `"Day practice"` and `"Quiet line"`.

---

## B · ROBOTIC / AI-LIKE COPY — none found

The system-prompt voice for both `clarity_ai.py` and `body_room_ai.py` explicitly forbids generic "AI-therapist" patterns, synthetic empathy, and over-explaining. Hand-checked the Catalogue, FAQ, ClarityRelease, ClarityThreshold, BodyRoom, CourseRoom, MemoryPackageSelect, GuideHologram, and footer copy. Found no instances of:
- "We are here for you 24/7" / "always-on" / "instant"
- Repetitive AI cadence ("Here's the thing…" / "I understand that…" / "Let me help you with…")
- Synthetic empathy ("I feel your pain" / "That must be so hard for you")
- Over-soft "AI comfort" filler
- SaaS template phrasing

Hub-side copy reads as deliberately written, restrained, and grounded.

**Caveat:** PSL (`prulesoul.site`) is outside this repo. The PSL copy alignment email (iter 64d, Resend ID `58fd9337…`) sent the founder the replacement table. PSL audit remains the founder's responsibility.

---

## C · INCONSISTENT EMOTIONAL TONE — none found in this iter

Tone reviewed across:
- 4 English course letter bodies — calm, paragraphic, Aurin-voice consistent
- FAQ answers — short, factual, human-centered
- Catalogue descriptions — restrained, no marketing inflation
- Crisis override copy in both Cabinet and Body Room — calm, direct, points to real human help
- Empty-states (Body Room chat, Course Room loading) — quiet, non-judgmental
- 429 rate-limit copy — calm "the room is resting today"

No SaaS/transactional tone leaks detected. No "AI assistant" voice leaks.

---

## D · CULTURAL / LANGUAGE INCONSISTENCY — minor residual

### D-1 · 🟡 `LIBRARY_THEMES` source still contains Estonian originals
The `LIBRARY_THEMES` Python dict in `server.py` still holds the Estonian `"label"` and `"intro"` strings as the source-of-truth fields, with English versions in `"label_en"` and an out-of-band `_SHELF_INTRO_EN` dict.

This is **deliberate** — preserves the Estonian seed for any future ET-localized route, while the public payload now strips it. **No public-facing impact.** Source-level cleanliness can be addressed in a future router-split refactor.

### D-2 · 🟢 No other cultural-translation stiffness detected
Hub copy reads as natively English. No "Eastern-European sentence structure leakage" detected.

---

## E · FIXES APPLIED THIS ITER (warranty — $0)

| # | Fix | File | Lines |
|---|---|---|---|
| 1 | Replaced 28× `**Päeva praktika:**` → `**Day practice:**` in EN courses | `backend/server.py` | -28 / +28 |
| 2 | Replaced 28× `**Vaikne lause:**` → `**Quiet line:**` in EN courses | `backend/server.py` | -28 / +28 |
| 3 | Restored Estonian markers inside `raha-ja-teadvus-moodul-1` block (preserved for future ET) | `backend/server.py` | +14 |
| 4 | `/api/library/shelves` now promotes `label_en` and English intro to the response | `backend/server.py` | +9 |
| 5 | Added `_SHELF_INTRO_EN` dict (4 English shelf intros) | `backend/server.py` | +5 |
| 6 | Fixed JSX comment language reference | `frontend/src/pages/CourseDetail.jsx` | -1 / +1 |
| 7 | Added language-isolation regression test | `backend/tests/test_language_isolation_iter65c.py` | +95 (new) |

Total: ~140 lines of warranty-fix code, one new regression test, zero new features.

---

## F · REMAINING UNSAFE PUBLIC SURFACES — none

After the fixes above, all 7 public API endpoints I scanned (`/api/courses`, every `/api/courses/{slug}`, `/api/library/shelves`, `/api/books`, `/api/clarity/passes`, `/api/sixnights/preview`, `/api/blog`, `/api/brand`) return **zero** Estonian or Cyrillic characters.

All `frontend/src/**/*.jsx` and `frontend/src/**/*.js` user-visible strings are English-only (verified by grep).

The Estonian course `raha-ja-teadvus-moodul-1` exists in source but is filtered out of the public catalog by the iter-62 W-2 language filter. Direct lookup via `/api/courses/raha-ja-teadvus-moodul-1` would still serve Estonian content if anyone hit that URL — **but no public link points there**. The Estonian course is effectively a dormant asset, ready for a future ET-localized route.

---

## G · OPERATIONAL VERIFICATION

| Suite | Status |
|---|---|
| `test_booking_iter54` | ✅ PASS |
| `test_cabinet_resume_iter56` | ✅ PASS |
| `test_course_tts_iter58` | ✅ PASS |
| `test_hybrid_memory_iter59` | ✅ PASS |
| `test_body_chat_iter60` | ✅ PASS |
| `test_chat_cap_iter62` | ✅ PASS |
| `test_language_isolation_iter65c` (NEW) | ✅ PASS |

7 of 7 active suites green. 24 stale legacy suites still failing (audited as 🔴 noise in iter 65 §3.3 — out of warranty scope, founder-deferred).

---

## H · TRUST-BREAKING MOMENTS DETECTED & ACTION

| Moment | Severity | Action |
|---|---|---|
| Wanderer pays $25, opens an English course letter, sees Estonian `Päeva praktika` mid-paragraph | 🔴 P0 | **FIXED** |
| Wanderer browses /library, sees `Vaimne Suveräänsus` shelf name | 🔴 P0 | **FIXED** |
| Wanderer mentions to a friend "the courses had typos in another language" | 🔴 P0 | **REMOVED** by fixes 1-2 |

---

## I · WHAT SHOULD BE IMMEDIATELY FIXED — nothing else

After this pass, no further public-facing language hygiene fix is required for the English-only beta launch. The 4 founder-side P0s and 2 post-launch P0s identified in earlier iters remain unchanged:

| Layer | Status |
|---|---|
| LemonSqueezy live mode + $1 test purchase | 🔴 founder-side, unchanged |
| PSL copy alignment scan | 🔴 founder-side, email sent iter 64d |
| Magic-link per-IP rate-limit | 🔴 post-launch P0 from iter-65 audit |
| Stale legacy tests quarantine | 🔴 post-launch P0 from iter-65 audit |
| LLM-fallback event log | 🔴 post-launch P0 from iter-65 audit |

---

## J · WHAT SHOULD REMAIN UNTOUCHED

Per the freeze rule and the warranty rule:
- Do NOT split `server.py` into routers right now (deferred to post-launch)
- Do NOT add an animated SVG/Lottie hologram (deferred)
- Do NOT add support agent KB / chat (deferred)
- Do NOT introduce vector / semantic memory (deferred)
- Do NOT touch the `raha-ja-teadvus-moodul-1` Estonian course content (preserved for future ET launch)
- Do NOT change `MemoryPackageSelect` PREMIUM badge yet (founder confirmed: free toggle during beta is intentional)

---

## K · FINAL CLASSIFICATION

Unchanged: **🟡 CONTROLLED BETA READY.**

The two language-isolation P0s found in this audit are now closed. The hub side is, as of this commit, free of mixed-language leakage on public surfaces. A new regression test guards against recurrence.

The remaining founder-side and post-launch P0s are tracked in `DEEP_AUDIT_ITER65.md` and `SYNC_REPORT_ITER64.md`.

End of forensic report.
