# Hero Videos — Placement Decisions

> **Status:** ACTIVE asset register. Not for embedding in unsanctioned places.
> Founder rule (binding): video belongs ONLY on homepage as ambient hero.
> Other placements require explicit founder approval.

## Available video assets (locally hosted, ~2.7 MB each)

All three were uploaded by the founder on 2026-04-28 and saved under
`/app/frontend/public/assets/videos/` so they ship with the build (no
external CDN dependency, privacy-safe).

| Slug | File | Dimensions | Duration | Tone |
|------|------|------------|----------|------|
| `weight-of-stillness` | `/assets/videos/weight-of-stillness.mp4` | 1024×1024 | 30.7s | Still, weighted, contemplative |
| `blueprint-inside-you` | `/assets/videos/blueprint-inside-you.mp4` | (TBC) | (TBC) | Inward, architectural, introspective |
| `fragile-construct` | `/assets/videos/fragile-construct.mp4` | (TBC) | (TBC) | Deconstruction, before-the-pause |

## Current placements

### ✅ HOMEPAGE — `weight-of-stillness.mp4`
- File: `frontend/public/assets/videos/weight-of-stillness.mp4`
- Mounted in: `frontend/src/pages/Home.jsx` (HERO section)
- testid: `home-hero-ambient-video`
- Behavior: `autoplay muted loop playsInline` · `opacity-25` · gradient overlay above
- Decoded once on first paint, plays in background. No controls, no
  poster, no flash. Title remains razor-clear over the loop (verified).

### 🟡 RESERVED — `blueprint-inside-you.mp4`
- File present, NOT yet placed.
- Recommended placement (founder to confirm): `/aurin-philosophy` hero,
  same ambient pattern as homepage. Tone fits the "blueprint inside"
  motif of the page. Wait for explicit founder go-ahead.

### 🟡 RESERVED — `fragile-construct.mp4`
- File present, NOT yet placed.
- Recommended placement (founder to confirm): `/the-beginning` intro
  section (BEFORE Step 1, soft hero). Aligns with the "what we built
  is not what we are" arc. Wait for explicit founder go-ahead.

## Anti-rules (do not violate)

- ❌ Do NOT autoplay with sound. Always muted.
- ❌ Do NOT show video controls. The viewer cannot pause/scrub.
- ❌ Do NOT place video on Bookstore, Private Room, Library entries,
  Portal, or any course step. Founder explicit rule.
- ❌ Do NOT embed third-party video iframes (YouTube/Vimeo) for these
  ambient layers. They are local mp4 by design — privacy + no branding.
- ❌ Do NOT add captions / titles overlayed on the video itself. The
  copy lives in the page DOM; the video is mood only.
- ❌ Do NOT loop a video that is louder than 30s without checking with
  the founder — short loops can become hypnotic if they catch the eye.

## To place blueprint-inside-you.mp4 on /aurin-philosophy (when approved)
Mirror the Home pattern:
```jsx
<video
  data-testid="philosophy-hero-ambient-video"
  src="/assets/videos/blueprint-inside-you.mp4"
  className="absolute inset-0 w-full h-full object-cover opacity-25 pointer-events-none"
  autoPlay muted loop playsInline preload="metadata" aria-hidden="true"
/>
<div className="absolute inset-0 bg-gradient-to-b from-[hsl(var(--aurin-bg))/0.65] via-[hsl(var(--aurin-bg))/0.85] to-[hsl(var(--aurin-bg))]" />
```

## To place fragile-construct.mp4 on /the-beginning intro (when approved)
Same pattern, on the TheBeginning landing (NOT inside the step view).
