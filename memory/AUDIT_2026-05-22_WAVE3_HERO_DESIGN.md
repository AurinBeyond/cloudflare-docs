# Wave 3 — 2026-05-22 (founder design upgrade)

## ✅ COMPLETED — chat hero redesign + new assets

### New Grace room ambient image
**File:** `/app/frontend/public/assets/illustrations/inner-mirror.jpg`

Founder uploaded a doorway-portal image (book floating in light-spirals through a wooden doorframe). Replaced the existing meditation-sunrise image. Old image kept at `inner-mirror.jpg.backup-v2-2026-05-22`. Two backups now exist for full rollback safety.

**Code change:** ZERO. Same filename, same import path.

### New portrait images (Grace + Alistair)
**Files:** `/app/frontend/public/assets/portraits/grace.png`, `alistair.png`

Founder uploaded new composite mockup images. The composites contain a clean portrait on the LEFT ~55% and a chat preview on the RIGHT. We use CSS `object-position: 20% center` to show only the face area. Original portraits preserved as `*.png.backup-2026-05-22`.

Kaelan and Sara portraits kept (founder didn't send new ones).

### Portrait panel redesigned (hero card style)
**File:** `/app/frontend/src/components/RoomConvaiChat.jsx`

Old design: sidebar aside, 200×200 portrait, sticky beside chat panel.
New design (matches founder mockup):
- Large hero card ABOVE chat (full chat-column width, 340–420px tall portrait)
- Serif font agent name (Grace / Kaelan / Sara / Alistair)
- "Guide · Keeper" subtitle in spaced uppercase (e.g., "CLARITY GUIDE · LIGHT KEEPER")
- Italic supportive tagline below (e.g., "Listens for the quiet beneath the noise.")
- Soft gradient floor blends portrait into card background
- Mobile-responsive (same layout, smaller text)

New constant `ROOM_AGENT_SUBTITLE` added per founder's mockup taglines:
- clarity: "Clarity Guide · Light Keeper"
- body: "Soul Guide · Wisdom Keeper"
- parents: "Heart Guide · Soul Confidant"
- courses: "Courage Guide · Truth Keeper"

ConvaiPanel itself bit-for-bit unchanged. Voice/text/billing logic protected.

### Clarity Release Grace portrait — matching upgrade
**File:** `/app/frontend/src/pages/ClarityRelease.jsx`

The small avatar+text card in `PHASES.CHAT` upgraded to the same hero design as the other 4 rooms. Pure visual upgrade — ChatPanel props bit-for-bit unchanged.

## Verified in preview

- `/body-room`: Kaelan hero card renders ✅
- `/parents-room`: Sara hero card renders ✅
- `/course-room`: Alistair hero card renders ✅
- `/clarity-release`: Grace hero card (requires CHAT phase / authenticated user — confirmed via lint clean)
- Lint clean across all touched files
- No JS errors

## Pending after Wave 3

- 🟡 Anna may want to send clean standalone portrait images for Kaelan + Sara to match the new "Guide · Keeper" mockup look
- 🟡 Avatar-per-message inside chat bubbles (her mockup shows this) — would require touching ConvaiPanel rendering; HIGH RISK. Recommend skipping unless explicitly requested.
- 🟢 Backlog: Angel Stars DB, Audio-story RAG, real LemonSqueezy variant IDs

## Sacred rule status

All Wave 3 changes were:
- ADDITIVE / visual-layer only
- File swaps preserved backups
- ConvaiPanel + ChatPanel internals bit-for-bit unchanged
- Each change verified in preview before next
