# DEEP AUDIT & CRITICAL REPORT — Iter 65
**Date:** Feb 2026 · controlled-observation phase
**Scope:** the entire `/app` repo as it stands today (post iter 64d)
**Tone:** brutal · operational · zero marketing language
**Auditor:** E1

This report is uncomfortable on purpose. The founder has explicitly asked for a **critical** audit, not a victory lap. Anything below tagged 🔴 is a real risk. Anything tagged 🟡 is real but acceptable for controlled beta. Anything tagged 🟢 is fine.

---

## 1 · Code-base shape (raw facts)

| Metric | Value | Verdict |
|---|---|---|
| `backend/server.py` line count | **8 753** lines · 400 KB | 🔴 monolith risk |
| Total `.jsx` page line count | ~20 906 lines | 🟡 large but split per page |
| Backend test files | 31 `test_*.py` | 🟡 many stale |
| Active green test suites (this iter) | 6 | 🟢 |
| Stale test suites failing (legacy book inventory) | 24+ | 🔴 invisible failures hiding real ones |
| Background asyncio loops on the API event loop | 4 (`heartbeat`, `coloring`, `six_nights`, `migrate_assets`) | 🟡 single-loop coupling |
| LLM-bearing endpoints | 2 (`/cabinet/message`, `/body-room/chat`) | 🟢 tightly auth-gated |

### Critical weakness 1 — `server.py` is 8 753 lines

🔴 **This is now an operational hazard.** A single file at this size:
- Slows hot-reload from ~1.5s to ~5s, causing devs to skip reloads and miss errors.
- Makes `git blame`, `git diff`, and code review functionally useless for any non-trivial change.
- Pushes any regression to land at full 8.7k-line surface area, with no module boundary to contain it.
- Makes `import` ordering fragile — see the `_hashlib` / `_json` underscore-aliased imports we already had to work around in iter 65.

The founder forbade refactoring under MVP-lock rules. **That decision was correct for launch, but it MUST be revisited in the 30 days after public launch.** A first split into 8–10 routers (`auth`, `clarity`, `body_room`, `course`, `library`, `booking`, `lemon`, `admin`, `telemetry`, `system`) is the single highest-impact future cleanup.

---

## 2 · Trust risks (operational)

### 2.1 LLM-budget silent fallback
🔴 When `EMERGENT_LLM_KEY` runs dry, both Cabinet and Body Room return curated static lines. **The wanderer is not told.** They receive a calm, on-tone reply, but it is not from the model — it is from `_pick_prompt` rotation.

This is a *feature* (graceful degradation) and a *trust risk* (silent simulation) at the same time. If this happens during a paid 60-minute Clarity session, the founder is in a refund position they cannot detect because no audit trail exists.

**Fix (deferred, NOT blocker):** add `db.llm_fallback_events` row each time `clarity_ai.generate_guide_reply` or `body_room_ai.generate_body_reply` falls through to the fallback. Surface a count on `/admin/observation`. ~40 lines.

### 2.2 No global LLM-budget circuit breaker
🟡 A single bad actor with the daily 12-cap can chain across multiple anonymous accounts and drain the budget for everyone else. The auth gate slows this down (signup requires email magic-link, which requires Resend) but does not stop it.

**Fix (deferred):** weekly global LLM budget envelope. Soft-block all chat when 90% reached. ~30 lines.

### 2.3 Static "Neural Portrait" copy hygiene
🟢 Hub side is clean (verified iter 64c). PSL side scan is the founder's responsibility (email sent iter 64d).

### 2.4 Eternal Thread monetization ambiguity
🟡 Today: free toggle, no paywall. The MemoryPackageSelect card says "PREMIUM" badge. **That copy is mildly misleading right now** because nothing is actually being paid for. The current iter 64 deliverable explicitly chose to keep it free during beta — fine — but the badge says otherwise.

**Quick fix (5 lines, can be done today):** change PREMIUM badge to "OPT-IN" while it is free. Restore PREMIUM only when a Lemon SKU is created.

### 2.5 No vector / semantic memory · marketed honesty
🟢 Honest: neither the FAQ, nor the Memory Package card, nor the Clarity Release threshold copy ever claims deep recall. The 3-most-recent-summary continuity is the actual contract.

---

## 3 · Operational risks (technical)

### 3.1 Single-process backend, event-loop coupling
🟡 FastAPI is single-process. All four background loops (`_aurin_heartbeat_loop`, `_coloring_daily_loop`, `_six_nights_dispatch_loop`, `_auto_migrate_assets_to_mongo`) run on the same asyncio loop as the API. A hung outbound HTTP call inside a loop can starve the next chat reply.

Acceptable for low-traffic beta. **NOT acceptable for an open public push.** No fix needed today; named risk.

### 3.2 Telemetry rate-limit is in-memory
🟡 The `app.state._telemetry_buckets` dict is per-process. A pod restart resets the counter. A multi-pod deployment would let bots round-robin past the 60/min ceiling. Single-pod deploy today, so fine. Named risk.

### 3.3 Stale legacy test suites failing
🔴 `pytest tests/` reports **24 failures** from older iterations (book inventory expectations, iter 5–9, 27, 36, 37). These are not regressions of recent work — the catalog evolved past their assumptions. But they create noise that hides any real regression. **The next time a real bug lands, it will be missed in the noise.**

**Fix (~30 minutes):** quarantine the broken iterations into a `tests/legacy/` folder and exclude from CI.

### 3.4 No CI / no automated test execution
🔴 There is NO automated test gate. The 6 green suites are only green because we run them manually each iter. A future agent or human can break a suite and the founder will never know until a real user hits the bug.

**Fix (medium):** GitHub Action that runs the 6 active suites on PR. Out of MVP-lock scope but should be the very first post-launch task.

### 3.5 Mongo indexes — created but not verified at runtime
🟡 `startup_db_init` creates 17 indexes (we counted). If any throws `IndexOptionsConflict` (e.g. an old deploy created an index with different options), the create_index call swallows it silently because of the `except Exception` wrapper. Result: queries run unindexed and slow without anyone noticing.

**Fix (~10 lines):** log every index creation result. Surface via `/api/admin/observation`. Defer.

### 3.6 No rate-limit on `/api/auth/*` magic-link
🔴 A bot can spam magic-link requests and burn Resend budget. There is no per-IP throttle on `auth/magic-link/request`.

**Fix (15 lines):** reuse the same in-memory bucket pattern we just built for telemetry. Apply to `/auth/magic-link/request`. **This should be done before any public marketing push.**

---

## 4 · UX & flow risks

### 4.1 Catalogue is ungated for kids books
🟢 Adult and Kids books rendered side by side on `/catalogue`. The page header is calm. The kids section says "For children". A wandering parent is not surprised. Fine.

### 4.2 No "where am I?" breadcrumbs in deep rooms
🟡 If a wanderer enters Clarity Release → Threshold → Confirmation Panel → Cabinet, there is no visible breadcrumb. The "Leave" emergency exit exists, but a back-step is implicit. Non-blocker; quality-of-life polish for later.

### 4.3 Mobile audit not run this iter
🟡 The founder asked for one in iter 64. We have not screenshot-verified the new `/catalogue`, `/faq`, and `/admin/observation` on a 375px-wide viewport. Likely fine because each uses the existing `aurin-container` constraints, but **untested on real mobile**.

**Fix:** 3-screenshot mobile pass on the next admin login. ~5 minutes.

### 4.4 `/admin/observation` token in URL query string
🟡 The page accepts `?token=…` for first-load convenience, then writes it to localStorage. **This URL ends up in browser history, in any analytics the founder has on the LP, and in server access logs.** Not catastrophic for an admin token (the founder controls the env), but it is a leak surface.

**Fix:** drop `?token=` from URL after first read using `window.history.replaceState`. ~5 lines.

---

## 5 · Friction observations (predicted, not measured)

These are predictions based on code structure. **They will be confirmed or refuted by the iter 65 telemetry layer over the next 30 days.**

| Predicted friction | Where | Telemetry that will confirm |
|---|---|---|
| Wanderers click `/catalogue` from footer, browse, but never click into a course detail | Catalogue cards have small CTAs ("Read", "Reserve") that may not feel like buy buttons | `catalogue_open` → `course_room_open` ratio |
| Body Room chat empty-state has no example | No prompt-suggestion chips below "Begin with one short line about where in the body you are paused right now." | `body_room_open` → `body_chat_first_message` ratio |
| Clarity Threshold has 4 declarations + 1 identity choice + 1 agreement = 6 separate accept clicks | Friction surface | `clarity_threshold_open` → `agreement_accepted` |
| FAQ is reachable only from footer | Not surfaced contextually. A confused wanderer mid-Cabinet has no ambient "Help" link. | `faq_open` event volume |
| Magic-link delivery delay (Resend free-tier ~30s on cold-start) | First-time wanderer thinks the link did not arrive | `magic_link_sent` → `signed_in` time delta |

---

## 6 · Verified bug evidence (this audit)

🟢 **None found this iter.** All 6 active integration suites pass. Live `/api/health`, `/api/courses`, `/api/library/shelves`, `/api/admin/observation`, `/api/admin/observation/funnel`, `/api/admin/payment-events`, `/api/telemetry/event` all return valid responses.

🔴 **Pre-existing latent issue (NOT introduced this iter):** `backend/server.py:175` raises `F811` (Redefinition of unused `frontmatter` from line 36). Pre-existing tech debt. Does not crash because both imports succeed. Should be cleaned in the future router-split pass.

---

## 7 · Honest classification

| Layer | State |
|---|---|
| Functional core (rooms, auth, books, courses, booking, memory) | 🟢 OPERATIONAL |
| Tone, copy hygiene, English uniformity | 🟢 OPERATIONAL on hub side; PSL side founder-owned |
| Trust continuity (Eternal Thread, mentor honesty, crisis override) | 🟢 OPERATIONAL |
| Telemetry / observation | 🟢 OPERATIONAL (iter 65 deliverable) |
| Payment-event audit log | 🟡 SCHEMA READY · not wired into Lemon flow yet (deliberate per founder rule) |
| Magic-link rate-limit | 🔴 MISSING — should be added before any public marketing push |
| LLM-fallback observability | 🔴 MISSING — silent simulation risk |
| Stale legacy tests | 🔴 NOISE — hides real regressions |
| Mobile real-device audit | 🟡 NOT RUN this iter |
| `server.py` monolith | 🔴 OPERATIONAL HAZARD — must split post-launch |
| CI / automated test gate | 🔴 MISSING |

---

## 8 · Recommended order of fixes (post-Lemon-approval)

When the founder gets the green light from LemonSqueezy and resumes building, these are the **safe surgical fixes** in the order they should land. None of them are new systems.

| # | Fix | Effort | Why |
|---|---|---|---|
| 1 | Magic-link per-IP rate-limit | 15 lines | 🔴 closes the cheapest abuse vector |
| 2 | Quarantine 24 stale legacy test suites | 30 min | 🔴 unblocks regression detection |
| 3 | LLM-fallback event log + admin counter | ~40 lines | 🔴 closes the silent-simulation trust risk |
| 4 | Eternal Thread badge: PREMIUM → OPT-IN while free | 5 lines | 🟡 stops a small overpromise |
| 5 | `?token=` URL strip on `/admin/observation` | 5 lines | 🟡 closes a small leak |
| 6 | Mobile screenshot pass on /catalogue, /faq, /admin/observation | 5 min | 🟡 covers 3.4 |
| 7 | Wire `_log_payment_event` into Lemon webhook handler | ~25 lines | 🟢 enables payment audit |
| 8 | GitHub Action for the 6 green suites | 1 hour | 🔴 makes the test gate real |
| 9 | (Bigger) split `server.py` into 8 routers | 1–2 days | 🔴 reverses monolith hazard |
| 10 | (Bigger) horizontal scaling readiness (separate process for background loops) | 2–3 days | 🟡 only when traffic justifies it |

**None of these are required for controlled-beta launch today.** The platform is in an honest, defensible state. These are debt-payment items.

---

## 9 · Final operational verdict

**Unchanged: 🟡 CONTROLLED BETA READY.**

- The platform can accept invited / controlled-volume real users today.
- Two P0s remain founder-side (LemonSqueezy live mode + 1× test purchase, PSL copy alignment).
- The hub side is grounded, tested, and observability-instrumented.
- Two **NEW post-launch P0s** were uncovered in this audit:
  - 🔴 Magic-link rate-limit (cheap abuse vector)
  - 🔴 Stale legacy tests hide regressions (regression-detection blindness)
- These should land **before** any open public push, AFTER LemonSqueezy approves and the founder resumes building.

End of report.
