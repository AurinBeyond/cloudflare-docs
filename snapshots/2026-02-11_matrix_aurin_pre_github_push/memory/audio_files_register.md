# Audio Files — Active + Reserved

> **Status:** ACTIVE asset register. 2026-04-29.

## Active

### `the-quiet-between-steps.mp3` — **First Light**
- Path: `/app/frontend/public/assets/audio/the-quiet-between-steps.mp3`
- Public URL: `/assets/audio/the-quiet-between-steps.mp3`
- Live verified: HTTP 200 · `content-type: audio/mpeg` · 728 KB · 30.77 s
- Wired via env: `REACT_APP_FIRST_LIGHT_AUDIO_URL=/assets/audio/the-quiet-between-steps.mp3`
- Surfaces (per founder rule, 2026-04-29):
  - **`/the-beginning`** (preferred — intro before writing, after `tb-what` block, testid `tb-listen`)
  - **`/library/adults`** (optional — same `MeditationPlayer`, automatically lit by env var)
- Tested live: paused→play→paused, current time advances, refresh-then-click works.
  No autoplay. Single Play/Pause. Progress bar visible.

## Reserved (uploaded, not deployed)

These two are saved on disk but NOT linked from any page. They are kept
in case the founder later wants a sequence (Option A: auto-play next, OR
Option B: "continue" button — *current state: deferred per founder's
"do not show multiple players, do not create complex UI" rule*).

### `the-weight-of-stillness.mp3`
- Path: `/app/frontend/public/assets/audio/the-weight-of-stillness.mp3`
- Public URL: `/assets/audio/the-weight-of-stillness.mp3`
- Live verified: HTTP 200, audio/mpeg, 726 KB.

### `fragile-construct.mp3`
- Path: `/app/frontend/public/assets/audio/fragile-construct.mp3`
- Public URL: `/assets/audio/fragile-construct.mp3`
- Live verified: HTTP 200, audio/mpeg, 728 KB.

## Anti-rules (re-affirmed)

- ❌ Do NOT extract audio from a video file and pass it off as First Light.
- ❌ Do NOT wire AI-synthesised voice anywhere.
- ❌ Do NOT autoplay any audio.
- ❌ Do NOT place audio on the homepage, in the Quiet Room, on Bookstore
  cards, or as background. Only the two surfaces listed above.
- ❌ Do NOT show multiple audio players on a single page.
- ❌ Do NOT add a sequence/playlist UI without explicit founder go-ahead.

## How to swap First Light to a different file
1. Decide which of the three .mp3 files (or a new one) becomes primary.
2. Update `REACT_APP_FIRST_LIGHT_AUDIO_URL` in `frontend/.env`.
3. `sudo supervisorctl restart frontend`.
4. Live URL refreshes — same player, new file. No code change needed.

— end of register —
