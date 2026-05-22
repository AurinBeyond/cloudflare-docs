# Wave 2 — 2026-05-22 (founder-authorized batch)

## ✅ COMPLETED & VERIFIED IN PREVIEW

### Kids Universe audit (founder requested "tee seda")
**File:** `/app/frontend/src/pages/KidsUniverse.jsx`

1. **"Future Builders" → "Dreamweavers"** (9-12 age group) — unified taxonomy with Aurin's Room. One name across the brand. Slug stayed `9-12`.
2. **Removed "Coming soon" chip** on Coloring Studio — the studio is fully live (uses `/api/coloring/pages` with Gemini Nano Banana daily generation).

### Agent portraits — 5 rooms
**Founder uploads downloaded to `/app/frontend/public/assets/portraits/`:**
- `grace.png` (1.5 MB) — older woman, grey hair, glasses, cream turtleneck
- `kaelan.png` (2.3 MB) — Black man, green tweed jacket
- `sara.png` (0.7 MB) — woman in green sweater
- `alistair.png` (0.9 MB) — Black man with books behind

**Files touched:**
1. `/app/frontend/src/components/RoomConvaiChat.jsx`:
   - Added `ROOM_AGENT_PORTRAIT` map (clarity, body, parents, courses → portrait paths)
   - Added `ROOM_AGENT_TAGLINE` map (NOT mystical, supportive English copy per founder rule)
   - Added new component `AgentPortraitPanel` (sticky aside, desktop vertical card / mobile circular avatar+name)
   - Outer `RoomConvaiChat` now wraps both `AgentPortraitPanel` + `ConvaiPanel` in flex container. ConvaiPanel itself is BIT-FOR-BIT UNCHANGED — voice/text/billing logic protected.

2. `/app/frontend/src/pages/ClarityRelease.jsx`:
   - Clarity uses the legacy `ChatPanel` (not `RoomConvaiChat`), so a separate insertion was needed.
   - Added Grace portrait card ABOVE `<ChatPanel>` inside `PHASES.CHAT` only — pure additive section.
   - ChatPanel props are bit-for-bit unchanged. Legacy useVoiceIO and audio pipeline untouched.

**Verified in preview:**
- `/body-room`: portrait loaded (naturalWidth=1380) ✅
- `/parents-room`: portrait visible with "Warmth for the questions parenting brings." ✅
- `/course-room`: portrait visible with "A patient guide through what you study." ✅
- Lint clean across both edited files
- No console JS errors

### Founder notes for tomorrow
- **Kaelan and Alistair portraits look very similar** (same race, same outfit style, similar setting). Founder chose Variant A (proceed) by sending Grace next without responding to the concern. If wanderers report confusion later, regenerate Kaelan with a different outfit/setting.
- Aurin intentionally remains SYMBOLIC (no human face) in children's rooms.
- Background frames around portraits are SUPPORTIVE not spiritual/mystical — founder's explicit directive followed.

## 🟡 Still pending (Wave 3+)

- Kids Universe Wave 1 of audit done. Optional Wave 2 (founder approval required):
  - Make age-group cards clickable → link to `/aurins-room/:slug`
  - Add a Library Kids section pointing to `/library/kids`
  - Aurin's Room CTA: add one sentence explaining what Aurin does
- Course Room visual upgrade (founder wants no stick-figures — needs market analysis first)
- Angel Stars DB (P2)
- Audio-story RAG (P2)
- Real LemonSqueezy variant IDs once store approved

## 🛡️ Sacred rule — followed today

- All Wave 2 changes are ADDITIVE only (no existing logic removed)
- Every change verified in preview before next
- Backup pattern: filename swaps keep originals (e.g., inner-mirror.jpg.backup-2026-05-22)
- ZERO test agents called — direct screenshot+console-error verification per change

## Deployment status
**Wave 1 + Wave 2 are PREVIEW ONLY.** Founder will hit "Deploy" in Emergent when ready. Deployment agent already confirmed: GREEN-light to deploy (only warning: CORS allowlist intentionally specific, NOT a wildcard — that is correct for this stack).
