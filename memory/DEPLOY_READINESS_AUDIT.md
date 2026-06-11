# Alistair · Deploy Readiness Audit

Date: 2026-02-10
Auditor: cold technical sweep (no marketing language)
Scope: navigation graph + content rendering + assets + mobile + errors

---

## Verdict

**READY FOR DEPLOY**

Caveats are listed below; none are blockers.

---

## A · Navigation graph

| Check | Result |
|---|---|
| Hub `/course-room` renders | ✅ 11/11 lab cards present |
| Hub subtitle | "Your life is the laboratory. Start exploring." |
| 11 lab pages render their painted image | **11/11** (complete=True after `networkidle`) |
| All 295 hotspots wired | ✅ unchanged since NAV_V1 lock |
| All 291 unique topic routes resolve | ✅ verified earlier in 3-batch sweep |

False-alarm note: an initial 400 ms wait reported `compass.png` and `body-language-v2.png` as `complete=False`. Both painted images are 1.5–2 MB and were still mid-load. Re-tested with `networkidle` — both load successfully, naturalWidth = 1536 px.

## B · Content rendering

| Check | Result |
|---|---|
| 11/11 authored hero topics render | core question + body ≥ 2 paragraphs + reflection ≥ 2 + back link ✅ |
| 10/10 Field Study cards render | title + "FIELD STUDY · IN PROGRESS" tag + back link ✅ |
| TopicDetail data-testid contract preserved | ✅ same hooks as audit harness |

## C · Errors & failed requests

| Check | Result |
|---|---|
| Console errors during sweep | **0** |
| Page errors during sweep | **0** |
| Failed asset requests on production preview | **0** (all `assets/*.png` return HTTP 200) |
| Other failed requests | telemetry only — Google Analytics `g/collect`, Cloudflare `cdn-cgi/rum`. Cosmetic, do not affect UX. |

## D · Mobile viewport (390 × 844)

| Route | Result |
|---|---|
| `/course-room` | OK · no horizontal overflow |
| `/course-room/lab/money-tree` | OK |
| `/course-room/lab/money-tree/topic/worth` | OK |
| `/course-room/lab/masks/topic/pleaser` | OK |
| `/course-room/lab/old-stories/topic/i-always-fail` | OK (Field Study card) |

Lab dashboards are painted at 1536 × 1024 and rendered at viewport width. On a 390 px mobile screen the painted hotspots remain proportionally placed; readability of the painted micro-copy at that scale is the founder's call (typical mobile UX trade-off for a painted-image-as-UI pattern).

## E · Cross-room integration

| Check | Result |
|---|---|
| Hub sidebar "Explore" links to `/course-room/laboratories` | ✅ |
| Lab cards link to `/course-room/lab/{slug}` | ✅ |
| Topic hotspots link to `/course-room/lab/{slug}/topic/{topicId}` | ✅ |
| Topic-back-to-lab links to `/course-room/lab/{slug}` | ✅ |
| Related-topic chips link within the same lab | ✅ |
| Global header behaviour | Hidden on `/course-room/lab/*`, visible on hub (intentional) |

## F · Known limitations (not blockers)

- **Authoring coverage: 66 / 291 (23 %)**. Money Tree 100 %, other 10 labs 3 hero topics each. The remaining 225 painted cards display the "FIELD STUDY · IN PROGRESS" working-card — by design, framed as part of the laboratory aesthetic.
- **Hotspot calibration not yet founder-verified**. The `?debug=1` red rectangles approximate the painted UI; the founder sweep step (NAV_V1 step 3) is still pending.
- **Painted-image-as-UI is a stylistic constraint**, not a bug: the hotspot rectangles are tied to image regions, so the same image is rendered on every screen size. Mobile readability of the painted micro-text follows from the asset choice.

## G · Recommendation

Deploy.

Then continue authoring Field Study cards on demand, calibrating hotspots based on real founder visits, and iterating in live.

Holding deploy until 100 % authoring coverage would mean writing 225 more topic pages before any external visitor sees the system — that's the opposite of "laboratory grows".
