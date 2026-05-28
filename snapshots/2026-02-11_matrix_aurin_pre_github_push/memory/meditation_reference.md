# Meditation — Inspiration References

> **Status:** REFERENCE ONLY. Inspiration source for the meditation theme.
> **NEVER EMBED. NEVER SHIP. NEVER MENTION ON THE PUBLIC SITE.**
>
> The founder explicitly forbade:
> - Embedding Gemini pages as iframes anywhere on the portal.
> - Using Gemini branding (logo, "Created with Gemini", etc.).
> - Adding AI-generated voice to the public meditation page.
>
> These links exist solely as theme/idea references for a future
> meditation that the founder will record in her own human voice.

## Source links (founder, 2026-04-27)
- https://gemini.google.com/share/6c48681fde33
- https://gemini.google.com/share/6c262d543e71

## Current state of the public meditation page
- `MeditationPlayer` renders a quiet **placeholder** card on /library
  and /library/adults: *"This sound will open soon."*
- Placeholder is shown whenever `REACT_APP_FIRST_LIGHT_AUDIO_URL` is
  unset — which is the deliberate state right now.
- No Gemini, no AI label, no machine voice.

## Path forward (when the founder is ready)
1. Founder records the meditation in her own voice and produces an
   `.mp3` (or `.m4a` / `.wav`).
2. The file is hosted somewhere with a clean public URL — e.g.
   Cloudflare R2 / S3 / a static asset under `/app/frontend/public/`.
3. Set `REACT_APP_FIRST_LIGHT_AUDIO_URL` in `frontend/.env` to that URL.
4. Restart the frontend. The placeholder card automatically becomes a
   real Play / Pause player. Nothing else changes.

## Anti-rules (do not violate, ever)
- ❌ Do NOT iframe-embed gemini.google.com (or any AI tool) into the
  meditation page or anywhere else.
- ❌ Do NOT route a TTS / synthesised-voice URL into
  `firstLightAudioUrl` and pass it off as the founder's voice.
- ❌ Do NOT add a "Generated with…" or "AI-assisted" label anywhere
  public. The page reads as fully human, by design.
- ❌ Do NOT introduce links to gemini.google.com from any page,
  footer, blog post, library entry, or admin surface.

— end of reference —
