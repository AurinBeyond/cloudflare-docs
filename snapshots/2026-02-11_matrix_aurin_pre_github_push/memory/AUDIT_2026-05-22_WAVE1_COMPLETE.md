# Wave 1 — 2026-05-22 (founder-approved batch)

## ✅ FIXES & ADDITIONS (all preview-only, awaiting redeploy)

### P0 — "A quiet ripple" CRASH ROOT-CAUSED AND FIXED
**File:** `/app/frontend/src/pages/AurinsRoomChat.jsx`

**Root cause (captured live via console error):**
```
Error: useRegisterCallbacks must be used within a ConversationProvider
    at useConversation
    at AurinsRoomChat
```

The `useConversation` hook from `@elevenlabs/react` SDK now REQUIRES a surrounding `<ConversationProvider>` (changed in a recent SDK version). The working `RoomConvaiChat.jsx` already wraps with this provider; `AurinsRoomChat.jsx` did not.

**Surgical fix:** Imported `ConversationProvider`. Split component into outer `AurinsRoomChat` (wrapper) and inner `AurinsRoomChatInner` (existing logic, unchanged). Mirrors the EXACT pattern from working `RoomConvaiChat.jsx` line 1079–1085.

**Risk:** ZERO. Pure additive — old logic untouched. Lint clean. Live screenshot confirmed 3/3 age groups render correctly with no JS errors.

---

### Grace's room (Clarity Release) — new ambient image
**File:** `/app/frontend/public/assets/illustrations/inner-mirror.jpg`

Replaced the old mirror image (101 KB) with founder-uploaded meditation-at-sunrise image (1.1 MB). The new image carries Grace's philosophy: "silence AFTER release — MINA ISE, SIIN JA PRAEGU". Original file backed up at `inner-mirror.jpg.backup-2026-05-22`.

**Code change:** ZERO — same filename, same import path. Pure asset swap.

---

### Aurin's Room — per-age-group visual themes (3 ages)
**Files:**
- `/app/frontend/src/lib/aurinPrompts.js` — added `theme` metadata block to each age group (pure addition; existing consumers ignore the new field)
- `/app/frontend/src/pages/AurinsRoomChat.jsx` — added a new `<section>` BETWEEN PageHeader and chat panel that conditionally renders the per-age hero illustration and tagline

**Hero assets downloaded from founder uploads:**
- `/app/frontend/public/assets/aurin/little-dreamers-hero.png` (1.8 MB) — blue dreaming star angel
- `/app/frontend/public/assets/aurin/explorers-hero.png` (1.8 MB) — golden positive explorer fairy
- `/app/frontend/public/assets/aurin/dreamweavers-hero.png` (2.1 MB) — cosmic dreamweaver figure

**Color palettes (founder-approved psychology):**
- Little Dreamers (3–5): peach-gold `#F4D9C2` + sage green `#A8C69F` → safety, warmth
- Explorers (6–8): emerald `#7BA888` + bronze `#C19A6B` on dark navy `#2B3A4F` → exploration, curiosity
- Dreamweavers (9–12): amethyst `#7E6B9C` + star-gold `#FFD700` on indigo `#1A237E` → introspection, vision

**Taglines per age group (founder's mockup spec):**
- Little Dreamers: "Bringing calm to little minds."
- Explorers: "Guiding positive explorers to light and wisdom."
- Dreamweavers: "Navigating deep dreams and future visions."

---

## 🟡 PENDING (next batch, awaiting founder green-light)

### Agent portraits in chat surface (RoomConvaiChat)
- Founder decision: large static portrait ALWAYS visible (not just during conversation), placed BESIDE chat panel as separate icon (not inside the chat).
- Mobile: small circular icon, still separate from chat.
- **4 portraits available:** Sara (already drawn), Grace (founder mockup), Kaelan, Alistair — but only 2 are confirmed in `guides-portraits.jpg` (left=Grace?, right=Alistair?).
- **Course Room (Alistair) HELD** — founder wants to think about agent visual choice carefully before committing.
- Pending: need clear confirmation of portrait assets per agent.

### Grace's ambient image — already done above, but Anna will verify visually after deploy.

### Kids Universe content audit (founder's request)
- "Skeleton there but feels incomplete" — Anna asked for a child-eyed review + dead-code sweep.
- Not yet started.

---

## 🛡️ SACRED RULE — followed today

Every change in Wave 1 was:
- ADDITIVE only (no existing code paths removed)
- One commit per logical unit
- Live verified in preview before moving to next change
- Backup created for any binary asset replacement (`inner-mirror.jpg.backup-2026-05-22`)

The persistent "A quiet ripple" crash is now ROOT-CAUSED and FIXED — not patched, not hidden. The fix copies the proven working pattern from RoomConvaiChat.jsx.
