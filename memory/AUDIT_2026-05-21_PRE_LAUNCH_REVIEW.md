# Founder-Requested Audit — 2026-05-21

Founder context: LemonSqueezy demo video successfully submitted (real product video + AI-promo combined). Awaiting LS response. She asked Main Agent to do a thorough read-only sweep of the site while she's away so tomorrow's joint review is fast.

Strict rule: keep system stable, nothing gets displaced.

---

## ✅ FIXED TODAY (surgical, low-blast-radius)

### P0 — `/pricing` returned blank black page → REVENUE LEAK
- **Root cause:** Three components linked `href="/pricing"` (RoomConvaiChat blocked card, ConvaiPresenceTracker, AurinsRoomChat) but the route was NEVER registered in `App.js`. React Router fell through → empty page.
- **Fix:** Added `<Route path="/pricing" element={<Navigate to="/clarity-release" replace />} />` in `App.js`.
- **Verified:** Preview env → `/pricing` now redirects to `/clarity-release` (Wanderer's Agreement gate → tier passes with LemonSqueezy checkout).
- **Files touched:** `frontend/src/App.js` (1 line + comment).

---

## 🟡 FINDINGS — pending founder approval before changes

### 1. OpenWorld cards have NO "Enter" CTAs (matches founder's screenshot feedback)
`HousePreview.jsx` (homepage) — the four cards "The Library / Bookstore / Courses / Kids Universe" are pure text with a top badge. No clickable button. Visitors must guess that the *whole card* might be clickable (it isn't).

**Suggested action (P1, tomorrow):**
- Each card gets a quiet "Enter →" link at the bottom, routing to:
  - The Library → `/library`
  - The Bookstore → `/bookstore`
  - The Courses → `/course-room`
  - Kids Universe → `/kids-universe`
- Visual: small text link, same brass colour, no big button (preserves "luxury house" aesthetic).

### 2. Static agent portraits inside chat surface (founder request)
Currently `RoomConvaiChat.jsx` shows a textual room header only. Founder wants each speaking agent (Grace, Kaelan, Sara, Alistair, Aurin) to have a **static portrait** shown in the chat surface to build trust.

**Suggested action (P1, tomorrow):**
- Re-use existing portraits from `Gemini_Generated_Image_*.png` artifacts (already uploaded by founder).
- Mapping:
  - Grace (Clarity Release) → female ivory-masked portrait
  - Kaelan (Body Room) → male mentor portrait
  - Sara (Parents' Room) → female warm-mentor portrait
  - Alistair (Courses) → male teacher portrait
  - Aurin (Kids) → light-presence symbol (no human face — already designed)
- Component placement: small circular avatar at top of chat panel, NOT full-bleed.
- **Risk:** zero — purely additive to `RoomConvaiChat.jsx` (within the existing header div, no SDK/billing logic touched).

### 3. Aurin's Room — separate sub-rooms per age group
Founder wants each age group (Little Dreamers 3-5, Explorers 6-8, Dreamweavers 9-12) to feel like its own room under one parent heading "Aurin's Room".

**Status:** Already 95% built — `/aurins-room/:ageGroup` route exists and works. The gateway `/aurins-room` already shows three doors. What's missing: each age group's chat page could lean into a different visual tone (softer for Little Dreamers, more illustrative for Dreamweavers) — currently they all share one template.

**Suggested action (P2, after LemonSqueezy approval):**
- Add per-age-group accent colour + heading style.
- Per-age-group illustration above the chat panel.

### 4. Course Room review
Need to walk through `/course-room` and `/course-room/:slug` together tomorrow. Founder mentioned suggestions she'd like to hear.

**Read-only notes:**
- `CourseRoom.jsx` loads courses from backend.
- `CourseDetail.jsx` has LemonSqueezy checkout wired (`buildLemonCheckoutUrl(course.lemonsqueezy_variant_id)`).
- TODO: confirm all course variant IDs are populated in DB. (Some courses may still show "Join waitlist" because variant_id is null.)

### 5. Crash telemetry observation
Last 72h of `funnel_events.react_error_boundary` shows only synthetic test crashes from iteration 73 audit + one historical from `/clarity-release` 7 days ago. **No real `/aurins-room` crash has been captured by the telemetry endpoint**. Whatever the founder saw earlier may have been local browser cache / stale bundle. The preview env `/aurins-room/explorers` route loads cleanly through the Wanderer's Agreement gate (verified by screenshot today).

If she sees "A quiet ripple" again tomorrow, ask her to **hard-refresh** (Ctrl+Shift+R) once — bundle may be cached. If it persists, the crash will show up in `/api/admin/audit/crashes` with full stack trace and we can fix surgically.

---

## 🟢 BACKLOG (P2, untouched today)

- Angel Stars database (kids' positive-action tracking)
- Audio-story RAG (PDF → ElevenLabs Knowledge Base)
- Real LemonSqueezy variant IDs once store is approved
- Million Dollar Book methodology applied to copy/funnel (founder mentioned)

---

## 📌 Tomorrow's joint review checklist (proposed)

1. Test the `/pricing` → `/clarity-release` redirect end-to-end with founder.
2. Approve OpenWorld card "Enter →" links (or pick different routing).
3. Approve agent-portrait mapping for chat surfaces.
4. Walk through `/course-room` together for content/UX suggestions.
5. Verify no "A quiet ripple" crashes in last 24h (`/api/admin/audit/crashes`).
