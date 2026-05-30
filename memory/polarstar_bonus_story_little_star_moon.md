# Polarstar Bonus Story — "Little Star (Moon Version)"

**Status:** RESERVED for Polarstar Bedtime Stories Vol II.
**NOT** shown in the current customer-facing in-app catalogue
(`aurinStories.js`) so as not to confuse buyers of the existing PDF.
The current PDF's Little Star is the 6-paragraph "quiet version".
This Moon Version lives here until Vol II ships.

**Authored:** 2026-02-29 by founder (Anna), during the audio-recording
morning. ~330 words. ~2:30 read aloud slowly.

**Reserved route slug:** `little-star-moon`
**Reserved audio path:** `/assets/audio/polarstar/little-star-moon.mp3`
**Reserved listening page:** `/listen/little-star-moon` (parallel to
`/listen/little-star`, not wired yet)

---

## Why this story is reserved, not shipped (decision log)

The founder authored a longer alternative version of "Little Star"
with a Moon dialogue, internal sighing, and an explicit moral spoken
aloud by the Moon. The original PDF version trusts the moral to land
implicitly through the action. Two different stories, same name.

To avoid bait-and-switch with current PDF buyers, the agent
recommended:
- Keep the existing **PDF / `/listen/little-star`** as the
  6-paragraph quiet version that **matches the PDF**.
- Reserve **this Moon Version** as either (a) a bonus story on a
  separate audio page or (b) Vol II opening story under its own
  identity.

Founder approved both reservations: **path A + path B**. This document
holds the verbatim authored text plus implementation notes for when
either path is greenlit.

---

## Verbatim text (author: Anna · 2026-02-29)

> **Little Star.**
> A bedtime story.
>
> Once upon a time, high above the clouds, there lived a tiny star
> named Little Star.
> Little Star was smaller than all the other stars in the night sky.
> Sometimes she looked around and wondered:
> "Why am I so small?"
>
> The bright stars shone strongly.
> The big stars could be seen from far away.
> But Little Star felt that nobody noticed her gentle light.
>
> One evening, as she quietly twinkled in the darkness, the Moon
> smiled down at her.
> "Why do you look so sad, Little Star?" asked the Moon.
>
> Little Star sighed.
> "I wish I were bigger. I wish I could shine like the others."
>
> The Moon listened carefully and then said:
> "Do you see that little child sleeping below?"
>
> Little Star looked down. Far beneath the clouds, a small child
> was lying in bed, feeling a little lonely. The room was dark.
> The night felt very big.
>
> Little Star focused her light and sent one tiny beam down toward
> the window. A soft sparkle entered the room. The child opened
> their eyes and saw a beautiful little light dancing on the wall.
>
> Suddenly, the room didn't feel so dark anymore. The child smiled,
> and then closed their eyes and drifted peacefully to sleep.
>
> Little Star watched quietly. For the first time, she understood
> something important.
>
> She did not need to be the biggest star. She did not need to shine
> brighter than anyone else. Her small light had been exactly what
> someone needed.
>
> The Moon smiled.
> "Even the smallest star can brighten someone's world."
>
> From that night on, Little Star never worried about being small
> again. She simply shone with all the light she had. And every
> evening, somewhere below, children smiled when they saw her
> twinkling in the sky.
>
> And Little Star smiled back.
>
> The End.

---

## Notes for the agent (when Vol II / bonus is greenlit)

### If Path A — Bonus story #6 alongside Vol I

1. Add a new STORIES entry in `aurinStories.js`:
   ```js
   {
     slug: "little-star-moon",
     title: "Little Star (Moon Version)",
     ageGroup: "little-dreamers",
     minutes: 3,
     intro: "A bonus telling of Little Star, with a wise Moon.",
     cover: "/assets/aurin/aurin-companion.png",  // until unique art exists
     audio: "/assets/audio/polarstar/little-star-moon.mp3",
     pdf: null,
     body: [...verbatim paragraphs above...],
     bonus: true,           // future flag for "Bonus" badge in UI
   }
   ```
2. Add the `/listen/little-star-moon` route to `App.js` — clone
   `ListenLittleStar.jsx` and parameterise the AUDIO_SRC.
3. Update the in-app story card to show a small "Bonus" badge so
   parents see at-a-glance that this is the longer alternative version,
   not the canonical PDF story.
4. Do NOT add a banner to the existing PDF. The PDF buyer who wants
   the bonus will find it via the in-app catalogue, not via the PDF.

### If Path B — Vol II opening story

1. This story becomes the opening of "Polarstar Bedtime Stories Vol II"
   under its own SKU.
2. Vol II's editorial voice should LEAN INTO this style (Moon dialogues,
   explicit emotional beats, "Once upon a time" / "The End" frame) so
   the volume reads as a deliberate aesthetic shift, not a drift.
3. Vol II would need ~4 more stories in the same register. Founder
   estimates ~6h authoring per story.
4. Vol II launch waits until Vol I has ≥10 real sales (per the
   discipline rules in `product_portfolio_plan.md`).

### What to avoid

- ❌ Do **NOT** replace the existing `little-star` entry in
  `aurinStories.js` with this version.
- ❌ Do **NOT** add this text to the existing PDF — that PDF is
  the canonical source for Vol I, and 4 customers already received it.
- ❌ Do **NOT** record the audio of this version as
  `little-star.mp3` (the unsuffixed canonical slot). That slot is
  reserved for the existing PDF's 6-paragraph version.
- ❌ Do **NOT** show this story above the canonical Little Star in
  the in-app catalogue. The canonical version must be first; the
  bonus must be visibly secondary.

---

## Cross-references

- Canonical Vol I source-of-truth: `frontend/src/data/aurinStories.js`
  story slug `little-star`
- Canonical Vol I PDF: `frontend/public/assets/pdfs/polarstar-bedtime-stories.pdf`
- Audio Phase 1 plan: `product_portfolio_plan.md` Week 1
- Listen page scaffold (for canonical): `frontend/src/pages/ListenLittleStar.jsx`
- PDF generator: `scripts/generate_polarstar_pdf.py` with
  `POLARSTAR_AUDIO_LINK_LIVE` flag

---

*Document created on 2026-02-29 by agent on behalf of founder, who
explicitly chose both Path A and Path B placement.*
