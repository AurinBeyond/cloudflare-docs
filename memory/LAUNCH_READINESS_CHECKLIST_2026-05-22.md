# Launch-Readiness Checklist — Matrix Aurin / prulesoul.site

Anna asked: *"soovin nimekirja sellest mis meil on puudu et see tooteleht pidulikult vöib avatuks lugeda iga lehe peal vaata mis on veel vaja juurde lisada vöi puudu."*

> Translation: list of what's missing so we can officially open the site. Look at every page.

This list is **opinionated, prioritised, and honest**. Each item is marked:
- 🔴 **Blocker** — fix before launch
- 🟡 **Strong recommend** — fix within 7 days of launch
- 🟢 **Nice-to-have** — can ship later

---

## 🔴 BLOCKERS (must be done before launch)

### 1. The ghost voice + STT 500 bugs (covered in `ANNAS_ACTION_LIST_2026-05-22.md`)
- ElevenLabs agent first_message cleared
- OPENAI_API_KEY verified
- Deploy of today's code fixes

### 2. Real LemonSqueezy variant IDs in production
- Store is awaiting LemonSqueezy approval
- Once approved, real `lemonsqueezy_variant_id` values must populate `books`, `courses`, `tiers` collections
- Currently many use placeholder IDs which mean "Join waitlist" instead of "Buy now"
- **Where to update:** Emergent env vars or the courses/books DB rows in MongoDB

### 3. About page
- Currently no visible "About" or "Anna" page
- External AI reviewers flagged the site as "anonymous / ARG-like / suspicious"
- Even a minimal `/about` route with one paragraph + photo would fix this
- **Anna parked this** — her photo + voice + bio coming when she's ready
- **Workaround until then:** Add a footer credit "Built by Anna in Estonia. No team, no investors, no AI hype." — one line, no photo needed.

### 4. Privacy notice
- No visible privacy line anywhere
- Wanderers entering voice with mic permission do not know what happens to their voice
- **Minimum requirement:** one line in footer:

  > Your voice is not stored. Conversations stay private. No third-party tracking.

- Optionally: a real `/privacy` page (1 page, plain language, can be drafted by Agent on request)

### 5. Terms of use / wellness disclaimer
- Required by LemonSqueezy for product approval AND by EU consumer law
- **Minimum requirement:** one line in footer + a `/terms` route:

  > Matrix Aurin is a wellness companion, not medical or psychological care.
  > If you are in crisis, please contact your local emergency line.

- One screen, plain language, ~150 words is enough

### 6. Contact / support email
- Must exist for LemonSqueezy approval and customer trust
- **Recommend:** `hello@prulesoul.site` or `anna@prulesoul.site`
- Place: footer + `/about` if added
- Anna sets up via her domain provider

---

## 🟡 STRONG RECOMMENDATIONS (within 7 days of launch)

### 7. Hero clarifier sentence
- Current hero: "Welcome back to yourself"
- A second line of plain English helps undecided visitors:

  > "A quiet reading room with five guides. Read, breathe, take what serves you."

- Place: directly under existing hero headline. Pure additive, ZERO risk.

### 8. Anna's voice section ("Met by a real human")
- A single 3-line paragraph on homepage signed by Anna:

  > "Built by Anna — a soul guide, hypnotherapist, and author.
  > No team, no investors, no AI hype.
  > Just a quiet room you can step into when life asks too much."

- Massively reduces "anonymous ARG" suspicion
- Place: between "Ways to be here" and "Open World" sections

### 9. Per-room voice-tone polish (ElevenLabs Dashboard work)
- Anna observed: "hääled on liiga intensiivsed, möjuvad nagu müügi agendid, aga mitte teraapiliselt"
- Each agent's system prompt needs a calm-down pass on the Dashboard
- Suggested prompt suffix (also in Action List):

  ```
  Speak slowly. Pause often. Use few words.
  Never sell, motivate, or push. Match the user's emotional pace.
  If unsure, say less.
  ```

### 10. Per-age-group visual differentiation on Aurin's Room
- Hero illustrations are in place (Wave 2)
- But age-group accent colours could be more present in the page background, not just the hero image
- Adds the "this is for MY child specifically" feeling parents are looking for
- LOW priority — current state works

### 11. Course Room visual upgrade
- Founder asked for visual improvement; no stick-figures
- Needs market research first (founder will provide direction)
- Held in backlog

### 12. Library Kids → Aurin's Room cross-link
- Currently `/library/kids` (free stories) and `/aurins-room` (paid voice) feel like separate islands
- Adding a peen brass-accent link "Want to talk to Aurin? →" inside Library Kids would convert
- One-line addition, ZERO risk

### 13. Bookstore / Courses social proof
- No testimonials, no ratings, no "X readers this week"
- A single quiet quote from one early reader would unlock 2–4x conversion
- Anna provides quote text

### 14. 404 + error page kindness
- Default React 404 / network-error screens are clinical
- A short "calm" 404 ("This page is still being written. Return home →") matches house tone
- One file, ZERO risk

---

## 🟢 NICE-TO-HAVE (can wait)

### 15. Anna's photo + bio page
- Parked at her request
- Footer credit (item #3 above) is enough interim

### 16. Newsletter signup
- Resend integration already there for transactional email
- A "Get a quiet letter every other week" form on footer could grow audience
- Anna's call — only if she's willing to write the letter

### 17. Per-room ambient bg-audio
- Light loop track, fades when convo starts
- Adds immersion
- LOW priority — only if the voice tone polish (item 9) lands first

### 18. Multilingual support
- ANNA'S EXPLICIT DIRECTIVE: 100% English only for now
- Future: a language selector that switches the entire site (UI + agent + content)
- Do NOT half-implement. Either all English or a complete second language with native agent voices.

### 19. Angel Stars database
- Children's positive-action tracking system
- Parked in backlog for after Aurin's Room is proven in market

### 20. Audio-story RAG
- Upload PDFs into ElevenLabs Knowledge Base so Aurin can read bedtime stories
- Long-term, after revenue starts

---

## What's been DONE today (2026-05-22)

✅ `/pricing` route added (was blank black page)
✅ OpenWorld card "Enter →" links
✅ All 5 rooms listed on homepage
✅ Aurin's Room age-group visual themes
✅ Static agent portraits in 4 rooms + Grace
✅ Side-by-side portrait layout per founder directive
✅ Removed "Made with Emergent" badge
✅ Meta title updated ("a quiet reading room")
✅ Body / Parents `guide-face/undefined` 404 bugs fixed
✅ Defensive English language + empty first_message overrides added to RoomConvaiChat
✅ "Future Builders" renamed to "Dreamweavers" (consistent naming)
✅ Removed legacy circular GuidePresence (was visually duplicate)
✅ Updated Kids Universe "Coming soon" copy

**Code fixes are all in PREVIEW**. Production needs a new deploy to receive them.

---

## TL;DR — Anna's must-do before launch

1. ✅ **Fix ElevenLabs agents** (language=en, first_message empty, voice tone calm-down)
2. ✅ **Verify OPENAI_API_KEY** on prod env vars
3. ✅ **Verify FREE_VOICE_BETA** still true (for live test) — set back to false right before public launch
4. ✅ **Deploy today's code fixes** (Emergent panel)
5. ✅ **Add 4 micro-pages**: about credit (footer 1 line), privacy (one screen), terms (one screen), contact email
6. ✅ **Real LemonSqueezy variant IDs** once store approves
