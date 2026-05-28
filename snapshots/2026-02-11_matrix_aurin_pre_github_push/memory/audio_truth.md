# Audio Truth — Why First Light is still the placeholder

> **Status:** Reference. Live behaviour summary, 2026-04-28.

## What the founder asked
> *"AUDIO — SEPARATE PLAYER. Audio must NOT be taken from video.
> Use external audio file (.mp3). Check: audio URL is direct playable
> link, returns 200, correct type (audio/mpeg). IF valid: connect to
> player. IF invalid: do not show broken player, keep placeholder."*

## What was provided
- 4 mp4 video files (3 unique). NO `.mp3` URL, NO direct audio file.
- Two earlier Gemini share links — already classified as REFERENCE
  ONLY in `/app/memory/meditation_reference.md` (founder confirmed).

## What we did NOT do (and won't, per founder's own rule)
- ❌ Did NOT extract the audio track from any of the videos and pass it
  off as First Light. The founder said: *"audio must not be taken from
  video"* and *"video = atmosphere (silent), audio = conscious action".*
- ❌ Did NOT wire `REACT_APP_FIRST_LIGHT_AUDIO_URL` to a synthesised TTS
  or to any Gemini-generated voice.
- ❌ Did NOT show a broken / autoplay / silent-fail audio player.

## What is live right now
- `MeditationPlayer` on `/library/adults` shows the **placeholder** with
  the founder-approved copy:
  > *"This sound will open soon."*
  > *"Human voice is being recorded."*
  Play button is **disabled** while no URL is set. Verified.

## How to activate when the founder ships her own .mp3
1. Founder records the meditation in her own voice → exports `.mp3`
   (or `.m4a` / `.wav`).
2. Host the file. Cleanest options:
   - Drop the file into `/app/frontend/public/assets/audio/` (ships
     with the build, no CDN).
   - OR upload to Cloudflare R2 / S3 / any clean static URL.
3. Set `REACT_APP_FIRST_LIGHT_AUDIO_URL` in `frontend/.env` to that URL.
4. Restart the frontend. The placeholder card automatically becomes a
   real Play / Pause player. **No code change. No deploy.**

## Truth table
| Asset                       | Status                  | Source           |
|-----------------------------|-------------------------|------------------|
| First Light meditation      | ⏳ Placeholder           | Awaiting founder |
| Hero ambient video          | ✅ Live (small card)     | Founder-uploaded |
| Bookstore audio             | ❌ Not planned (text only) | Founder rule    |
| Cabinet audio               | ❌ Not planned           | Founder rule    |
| Beginning step intro audio  | ⏳ Reserved for human voice | Awaiting founder |

— end of reference —
