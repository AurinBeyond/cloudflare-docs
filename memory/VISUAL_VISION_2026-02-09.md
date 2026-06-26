# Visual Vision — House Design Language (Anna's mood-board)

**Saved**: 2026-02-09 EVE (iter 80)
**Status**: Phase 1 applied (Body Temple + Kids Hub); broader rollout deferred to 2026-03-02

---

## Source mood-boards

1. **Kids-hub mockup** — `frontend/public/house-visuals/kids-hub-wooden-modules.png`
   - Wooden buttons (Daily Reflection, Kindness Quest, Quiet Corner, Creative Spark)
   - Caveat handwriting font
   - Aurin avatar with golden aura (left)
   - Real child sitting next to the modules (right) — visual grounding

2. **Body Temple mockup** — `frontend/public/house-visuals/body-temple-4keys.png`
   - Four wooden buttons (Breathing, Touch, Rest, Presence) with line-icons
   - Aurin avatar (left), meditating child (right)
   - Soft golden bubble around the practising figure

3. **Adult Course flow mockup** (Gemini-generated, Anna 2026-02-09 PM)
   - Three-panel diagram: PROGRAM HUB · PROGRAM DASHBOARD · PRACTICE SESSION
   - Stepping-stones path ("MY DAILY JOURNEY") as the visual metaphor
   - Pulsing-gold "current day" stone
   - Lock/Unlock progression
   - Floating-Action-Button (Aurin) bottom right
   - "Tomorrow's path reveals itself" poetic transition

4. **Kids Course flow mockup** (Gemini, Anna 2026-02-09 PM)
   - "Wellness Zone" main page with Aurin card prominent
   - "Daily Quest Dashboard" with 28-day weekly grouping
   - "Play & Grow Space" with Hingamine/Puudutus example activities
   - Same stepping-stones metaphor but warmer Aurin avatar

---

## Anna's GOLD (what to keep)

- ✅ Stepping-stones ("stein på stein" — Norwegian) as daily progression
- ✅ Pulsing-gold current day
- ✅ "Tomorrow's path reveals itself" poetic micro-copy
- ✅ Caveat handwriting on titles
- ✅ Aurin avatar with golden aura halo
- ✅ Wooden panels with sheen (NOT matte — "klar / semi klar")
- ✅ Cream house background
- ✅ Floating Action Button for Aurin during action screens
- ✅ Themed week names that match audience tone (kids = "Discovering Breath"; adults = "Breathing & Vagal Tone")

## Anna's LÕKS (what to discard)

- ❌ HRV graphs, heart-rate metrics, somatic nervous-system diagrams (CLINICAL → kills brand)
- ❌ Session Metrics & Data Log (gives a tracker/quantified-self vibe)
- ❌ Sequential locking for KIDS (kids need play freedom; adults can have structure)
- ❌ B2B-style "Mindful Leadership Program" course-marketplace look
- ❌ "Pulseeriv / Kuldne Module 3" jargon

---

## Phase 1 applied (iter 79 + 80)

### Body Temple 28 (`/body-temple`)
- ✅ Cream house background
- ✅ Wooden week cards (brightened with top sheen, "klar" not matte)
- ✅ Caveat handwriting on "Body Temple 28" and week titles
- ✅ Aurin avatar with golden aura
- ✅ Stepping-stones inside each week card (StonePath)
- ✅ Pulsing-gold current day
- ✅ Padlock on locked premium days
- ✅ Day modal with "Aurin asks" Socratic question

### Kids Hub (`/kids-universe/<age>/hub`)
- ✅ HubCard repainted with white→palette gradient + top sheen
- ✅ Caveat handwriting on all card titles
- ✅ Aurin portrait wrapped in house-aura class
- ✅ Per-age palette differentiation PRESERVED (peach/sage/lavender)
- ✅ Navigation hrefs unchanged
- ✅ Subtle hover glow

### Body Room (`/body-room`)
- ✅ Wooden Body Temple 28 entry card at top
- ✅ Caveat title

### CSS (`/app/frontend/src/index.css`)
- New opt-in classes (no existing class modified):
  - `.house-wood` — brightened gradient + top sheen ::after
  - `.house-aura` — golden halo (radial gradient pulse)
  - `.house-cream` — cream page background
  - `.house-hand` / `.font-house-hand` — Caveat font
  - `.house-bubble` — golden meditation-bubble (unused yet, reserved)

---

## Phase 2 / 3 (deferred to 2026-03-02+)

Per Anna's directive (sales-focus next 3 weeks):

- Apply stepping-stones metaphor to other Kids modules (Daily Mood
  flow could use a "week's stones" view)
- Apply wooden-panel + Caveat treatment to Kindness Quest detail
  page, Quiet Corner, Creative Spark when they get standalone routes
- Floating Aurin avatar (FAB) on the Body Room silhouette interaction
- Adult Course Hub (when more courses launch beyond Body Temple)
- "Tomorrow's path reveals itself" micro-animation when day marked walked

---

## Notes for future agents

- Use `<img src="/house-visuals/<file>.png">` to pull the
  original mood-board assets when building new pages
- Anna's brand guardrails (NEVER violate):
  - No medical / clinical / diagnostic language
  - No "gamified generic cartoon" feel (no Duolingo, no Headspace
    bear)
  - No data-tracker / quantified-self UI (heart rate, HRV, etc.)
  - Socratic questioning, not directives
  - House tone: soft, slow, never urgent
