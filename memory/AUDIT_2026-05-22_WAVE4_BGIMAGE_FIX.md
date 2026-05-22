# Wave 4 — 2026-05-22 (founder portrait redesign v3)

## ✅ COMPLETED

### New composite portraits installed (3 agents)
**Files (with backups):**
- `grace.png` (already installed in Wave 3)
- `kaelan.png` ← NEW (composite mockup: face left, chat preview right)
- `sara.png` ← NEW (composite mockup)
- `alistair.png` (already installed in Wave 3)
- Backups: `*.png.backup-v2-2026-05-22`

### Aurin companion artwork
- `/app/frontend/public/assets/aurin/aurin-companion.png` — saved for future use in Aurin's Room composite. Not yet wired into rendering — Aurin still uses age-group themed heros from Wave 2.

### Background-image rendering strategy (KEY FIX)
**Problem:** `object-fit: cover` on a square (1:1) source image inside a wide container (820×420, ~1.95:1) cropped the image VERTICALLY only — `object-position` had no effect horizontally. Result: the chat-mockup half of the composite leaked into view next to the face.

**Fix:** Switched from `<img object-fit:cover>` to a `<div>` with `background-image: url(...)`, `background-size: 200% auto`, `background-position: 0% 28%`. This zooms the source 2x and anchors to top-left, so wanderers see only the clean face portion. Aspect-ratio shifted to taller (h-[380px] md:h-[480px]) to give more vertical face space.

**Files touched (visual layer only):**
- `frontend/src/components/RoomConvaiChat.jsx` — AgentPortraitPanel rewrite with `isComposite` branch
- `frontend/src/pages/ClarityRelease.jsx` — Grace portrait card matching design

### Honest risk briefing delivered to founder
Three-tier breakdown shared:
- A. Swap portraits only (ZERO risk) → DONE
- B. Portrait as background, chat overlaid (LOW risk, CSS only) → pending founder go
- C. Avatar per chat message (HIGH risk, needs ConvaiPanel surgery) → recommended SKIP

## Verified in preview
- /body-room: Kaelan face fills hero, no chat-mockup leak ✅
- /parents-room: Sara face properly framed ✅
- /course-room: Alistair face properly framed ✅
- /clarity-release: Grace card matching style (verified via lint clean)
- Lint clean, no JS errors

## Pending
- 🟡 Variant B (portrait-as-background + chat overlay) — awaiting founder decision after she reviews current result in production
- 🟡 Aurin's Room — `aurin-companion.png` downloaded but not wired into RoomConvaiChat. Aurin stays symbolic per earlier directive; if founder wants it shown, add to ROOM_AGENT_PORTRAIT.aurin
- 🟢 Backlog: Angel Stars DB, Audio-story RAG, real LemonSqueezy variant IDs
