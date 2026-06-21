# PRD — Aurin Hub / Matrix Aurin / Polarstar Kids (Sanctuary v3.0)

## Brand philosophy
- "Screen-Down, Ears-Open"
- Strictly anti-wellness — no coach / therapy / guru tone
- 100% English UI; conversations with founder are in Estonian

## Architecture
- React frontend (`/app/frontend`)
- FastAPI backend (`/app/backend`)
- MongoDB
- Supervisor-managed services

## Three rooms — production state (2026-06-16, first public deploy)

### ALISTAIR (`/course-room`)
- 11 laboratories, 6+5 painted card grid
- Hero `SCENIC_BG`: founder-approved clean upload `7cqdspok_image.png`
- Hub status badges:
  - Money Tree = **OPEN NOW** (green pill)
  - Other 10 = **PREVIEW** (brass pill)
- Inside each lab dashboard (painted hotspots):
  - Authored topics = clickable
  - Unwritten topics = dimmed + "SOON" badge + cursor:not-allowed + tooltip "Coming Soon — this field study is being written."
- Total authored topics: 36 (Money Tree) + 3 each × 10 = 66

### GRACE (`/grace` light home + `/grace/room` dark Hearth)
- Hero H1: "You stopped performing. That's why you're here." (Tony Robbins × human register, anti-wellness)
- Sidebar sub-pages (Speak, Write, Evening, Messages, Library) — all authored
- Library: 5 full articles, 3 sections (Understanding Yourself, Relationships, Moving Forward)
- Prompt-piping `/grace/write → /grace/room?write=...` auto-opens Write panel + pre-fills textarea
- ConvAI mounted at `/grace/room` PHASES.CHAT (gated behind sign-in)

### BODY WORLD (`/body-world` + `/body-world/world/:slug`)
- 14-stone LOCK navigation
- Hub painted asset legacy 15th stone "Body Attention" masked with dark patch
- Hub painted "15 worlds." caption masked + replaced with React "14 worlds. All connected."
- Stone N pages: "Stone N of 14" overlay masks painted "OF 15" typo
- Sub-stones with `legacy*` content = clickable + LOCK name overlay
- Sub-stones without content = dimmed + "SOON" badge + non-clickable

## Sara Room — Painted Worlds (in active development, 2026-06-17/18)

### Identity (locked)
- **Sara = The Quiet Heart of the Family** — Amae-style safe centre, not a lens menu
- Aurin = "The Places We Return To" / lighthouse-compass-northstar metaphor
- Each room = one compass:
  - Grace → return to yourself
  - Kaelen → return to your body
  - Sara → return to one another
  - Alistair → return to clarity
  - Polarstar → return to wonder · protects childhood itself
- **Constitutional rule §1:** Rooms may be CONNECTED, never MIXED
- Each room guards one question. Sara's question: *"What's going on between us?"*
- Lenses (Ikuji, Montessori, Scandinavian, French Cadre, Reggio, Waldorf, Positive Coding) live BACKEND-ONLY — never exposed as UI menu

### Architecture — Painted Map pattern (same as BodyWorld)
- `/parents-room` → SaraHub (painted hub, 14 vine-leaves + central nest = 15 themes)
- `/parents-room/category/<slug>` → painted Sara World OR poetic SaraCategoryStub
- `/parents-room/category/<slug>/<sub>` → sub-theme stub (until founder visuals arrive)
- `/parents-room/v1` → legacy ParentsRoom (chat + 8 situations + ConvAI Sara, preserved)
- `?debug=1` on any painted page = founder calibration mode (visible hotspots)

### Painted Worlds — progress
- ✅ **Hub** (`SaraHub.jsx`) — asset `36vfb47d_...21_25_41.png`, 14 leaves calibrated
- ✅ **World 1 · My Child** (`SaraMyChild.jsx`) — asset `rijfgst3_image.png`, 6 nests
- ✅ **World 2 · Emotions & Safety** (`SaraEmotionsSafety.jsx`) — asset `pbiwwti2_...09_36_24.png`, 6 nests
- ✅ **World 3 · Our Family** (`SaraOurFamily.jsx`) — asset `pzbbdk2p_image.png`, 6 nests
- ✅ **World 4 · Boundaries & Responsibility** (`SaraBoundariesResponsibility.jsx`) — asset `iis5gc3n_image.png`, 6 nests calibrated first try (boundaries · responsibility · choices-consequences · respect · consistency · freedom-within-structure)
- ✅ **World 5 · Growth & Development** (`SaraGrowthDevelopment.jsx`) — asset `fub9m0yw_image.png`, 6 nests calibrated first try (development-stages · learning-through-experience · confidence-resilience · curiosity-discovery · mistakes-growth · becoming-yourself)
- ✅ **World 6 · Relationships & Cooperation** (`SaraRelationshipsCooperation.jsx`) — asset `b4uvi3j7_image.png`, 6 nests calibrated first try (communication · cooperation · friendship · understanding-differences · empathy-kindness · solving-conflicts-together)
- ✅ **World 7 · Challenging Situations** (`SaraChallengingSituations.jsx`) — asset `qw6okgoh_image.png`, 6 nests calibrated first try, FIRST world to include small icon plaques per nest (🏠 ❓ 💔 🌱 ⚡ ☀️) — pattern recommended for all future worlds
- ✅ **World 8 · Wisdom Garden** (`SaraWisdomGarden.jsx`) — asset `cmyiq27h_image.png`, 6 nests calibrated first try (different-ways-of-seeing · stories-that-teach · family-wisdom · questions-worth-asking · reflection-awareness · everyday-philosophy) — mother + daughter at the centre, grandparents present in the nests
- ✅ **World 9 · Weekly Digest** (`SaraWeeklyDigest.jsx`) — asset `xj4ylrpo_image.png`, 6 nests calibrated first try (this-weeks-reflection · small-moments-that-matter · family-conversations · challenges-lessons · gratitude-joy · looking-ahead) — **father + daughter** at the journal (first non-mother centrepiece)
- ✅ **World 10 · Stories from Real Life** (`SaraStoriesRealLife.jsx`) — asset `uzdnty7e_image.png`, 6 nests calibrated first try (family-stories · turning-points · lessons-learned · voices-across-generations · courage-hope · small-moments-big-meaning) — multi-cast: every nest carries a different family configuration; the centre is a great open book unfolding into scenes of real family life. **Bridge between Wisdom Garden and lived experience.**
- ✅ **World 11 · Tools & Exercises** (`SaraToolsExercises.jsx`) — asset `f5xlh6so_image.png` (**square 1:1, not 3:2**), 6 nests calibrated first try (conversation-cards · family-activities · reflection-prompts · weekly-practices · play-discovery · relationship-tools) — **grandmother + two grandchildren** at the conversation-card table; anti-classroom, anti-wellness, "small practices can open big conversations." First Sara world rendered at **1:1 aspect ratio** (matches founder's square painted asset).
- ✅ **World 13 · Parenting Journey** (`SaraParentingJourney.jsx`) — asset `8shbu47m_image.png` (square 1:1), 6 nests calibrated first try (becoming-a-parent · growing-through-challenges · learning-about-yourself · letting-go-of-perfection · balancing-family-and-self · looking-back-looking-forward) — **multi-stage cast**: new parents + mid-life parents + grandparents all on the same woodland path. "As children grow, parents grow too." First Sara world that centres the parent's own inner journey rather than the child's.
- ✅ **World 14 · Generations & Heritage** (`SaraGenerationsHeritage.jsx`) — asset `ihmnen44_image.png` (square 1:1), 6 nests calibrated first try (family-stories · traditions-rituals · wisdom-passed-on · what-we-choose-to-carry-forward · patterns-across-generations · roots-belonging) — **three-generation household** (grandparents + parents + 3 children + dog on quilted blanket with photo album & memory chest). `§SARA-TONE-NOTE`: stays curious, never judgemental — no genealogy, no ethnic identity politics, no "broken generations" narrative.
- ✅ **World 15 · Home, Memories & Roots** (`SaraHomeMemoriesRoots.jsx`) — asset `nypj62t3_image.png` (square 1:1), 6 nests calibrated first try (places-we-remember · family-memories · traditions-of-home · returning-home · belonging · creating-home) — **multi-generation evening homecoming** (father with guitar, mother with heart-mug, grandmother with grandson + photo album, three children, golden retriever, lantern, "Home" sign). `§SARA-CLOSING-RING`: closes the forest — World 14 = where we come from, World 15 = where we belong.
- 🎉 **ALL 14 SARA WORLDS COMPLETE.** First whole-forest checkpoint reached on 2026-06-19. The hub at `/parents-room` and the 14 painted interiors form a fully navigable, calibrated tree.

---

## 🔒 SARA FOREST — LOCKED (2026-06-19)

**Status:** `LOCKED`. The 14-world Sara Forest is considered architecturally complete. **No new leaves will be added to the painted hub.** All future expansions go into a **secondary hub** below.

**Locked components:**
- Painted hub asset `36vfb47d_...21_25_41.png` — DO NOT redraw, DO NOT extend the leaf count
- 14 LEAF_THEMES with numerals 1-11 + 13-15 (no World 12)
- 14 painted interior worlds + their nest calibrations
- 3 chat-zones (center nest, top-right Sara card, bottom-right garden card) → `/parents-room/v1`
- Central compass question: **"What's going on between us?"**

**The empty World 12 slot remains a painted gap on purpose.** The number is not filled; the gap is honoured.

---

## 🌳 THE CIRCLE WE CREATE — Secondary Hub (PLANNED 2026-06-19)

**Founder's decision (with GPT consultation):** The 4 deeper philosophical questions that emerged after the forest was complete do NOT belong on the Sara Forest hub. They belong in a separate, parallel space — a **secondary hub** that opens *beside* the nest, not *inside* the tree.

**Name:** 🌳 **The Circle We Create**
**Subtitle:** *Every choice reaches further than we think.*

**Rationale:**
- Sara Forest answers *"What's going on between us?"* — warm sanctuary, family-inward
- The Circle We Create answers *"What's going on around us?"* — philosophical, outward, value-facing
- Different temperature, different breath. Same Sara universe.
- Architecturally cleaner: no hub repaint, no calibration risk, future-extensible (5th, 6th world could be added later without breaking anything)

**4 worlds planned:**
1. 🌎 **The Voices Around the Child** — *"Who speaks to my child when I am not speaking?"* (social media, school, internet, peers, culture, state, parenting trends)
2. 🌍 **Every Child Is Our Child** — *"What responsibility comes with creating and receiving life?"* (conscious choice, 9 months, mothers who stayed, abandonment, adoption, community responsibility — `§EVERY-CHILD-VOICE-LOCK`: speak in time/step/preparation language, not awakening/consciousness language)
3. 💞 **What Cannot Be Replaced** — *"What am I using in place of being truly here?"* (substitution patterns — money, gifts, broken promises, control, fear, manipulation; not just wealth — **renamed from "Presence vs Provision"**)
4. 🫂 **When One Heart Holds the House** — *"How does one heart carry the whole home?"* (universal carrying — single parents, caregivers of sick spouses, special-needs parents, long-distance partner absences, recently widowed; **renamed from "Single Parents"** to widen the mirror)

**Architecture (LOCKED 2026-06-19):**
```
Sara Forest (LOCKED — painted hub untouched)
   ↓
ONE new entry card on Sara Hub:
   🌳 The Circle We Create
   Every choice reaches further than we think.
   ↓
Secondary painted hub (own page, own asset, own navigation)
   ↓
4 Wider Worlds (own painted interiors)
   ↓
6 nests each — each passes the world's Completion Test
```

**Founder's poetic anchor (2026-06-19):**
*"The Circle We Create" is the same question as "What's going on between us?" — just one ring wider. The Forest asks "between us" (family). The Circle asks "between all of us" (world). Same dynamic, larger scope. One nest grows into another ring.*

**Routes (locked):**
- Sara Hub entry card → `/parents-room/wider-circle` (secondary hub)
- `/parents-room/wider-circle/voices-around-the-child`
- `/parents-room/wider-circle/every-child-is-our-child`
- `/parents-room/wider-circle/what-cannot-be-replaced`
- `/parents-room/wider-circle/when-one-heart-holds-the-house`

**§CIRCLE-TONE-LOCK:**
- Wider Circle is NOT "harder Sara". It is **deeper Sara, not angrier Sara.**
- Same Tony Robbins × Luule Viilma voice — never activism, never politics, never blame.
- Every visitor must find a mirror, not a verdict.
- No pro/anti-abortion stances, no rich/poor judgements, no "ideal family" narrative.

**§EVERY-CHILD-VOICE-LOCK (founder's lived language):**
- Speak in time, step, preparation language — not awakening/consciousness language
- ✅ "I had nine months."   ❌ "I awakened to my responsibility."
- Founder's own story (chose to keep her daughter at 24 despite no work, no education, no certainty) is the inner compass for this world's tone.

**§CORE-PATTERN-RULE (founder + GPT methodology, 2026-06-19):**
Before designing 6 nests for any Wider Circle world, lock TWO things first:
1. **Core Pattern** — one sentence defining the central pattern this world guards
2. **Completion Test** — fill-in-the-blank sentence every nest must complete naturally

If a nest cannot complete the test, it does NOT belong to this world. It belongs to one of the other 3.

**Locked Core Patterns + Completion Tests for all 4 Wider Worlds:**

| World | Core Pattern | Completion Test | Domain |
|---|---|---|---|
| 💞 What Cannot Be Replaced | What am I using instead of being truly present? | "I am using ___ instead of being here." | SUBSTITUTION |
| 🫂 When One Heart Holds the House | What weight do I carry when there is no one to share it? | "When I carry this alone, ___." | CARRYING |
| 🌍 Every Child Is Our Child | A child has arrived. What do the adults around them choose? | "This life came among us, and we choose ___." | RECEPTION |
| 🌎 The Voices Around the Child | Beside my voice, who else is shaping my child? | "While I am not speaking, ___ is speaking to my child." | EXTERNAL VOICES |

The 4 domains are MUTUALLY EXCLUSIVE. No nest may live in two worlds at once.

**Architecture (planned):**
- Routes: `/parents-room/wider-circle` (hub) + `/parents-room/wider-circle/<slug>` (4 worlds)
- Entry point: **6th card** alongside the existing 5 values strip at the bottom of Sara Hub (option C — most organic, leaves painted hub untouched)
- Each world: same 6-nest Painted Map pattern
- Each world gets a `§ANTI-JUDGEMENT-LOCK` comment block

**Phased plan:**
- ETAPP 0: PRD lock + naming (✅ done 2026-06-19)
- ETAPP 1: 4 worlds' content design (founder + GPT, paper-only) — IN PROGRESS
- ETAPP 2: Wider Circle painted hub asset (GPT-generated) — ✅ done 2026-06-20 (`tzl013rr_image.png`)
- ETAPP 3: 4 painted world interiors — World 1 ✅ done 2026-06-21 (`mghwh6or_image.png`); World 2 ✅ done 2026-06-21 (`js2g8gnk_image.png`); World 3 ✅ done 2026-06-21 (`f7l2y33z_image.png` hub + `g82x79km_image.png` long-form anchor); World 4 ✅ done 2026-06-21 (`agtsx58u_image.png`). **All 4 painted hubs complete.**
- ETAPP 4: Entry point on Sara Hub (✅ done 2026-06-19 — sea-ripple SVG overlay; revised 2026-06-20 — invisible click-zone over painted ripples)
- ETAPP 4b: Wider Circle Hub page calibrated (✅ done 2026-06-21 — `WiderCircleHub.jsx` 5 zones aligned to `tzl013rr_image.png`, navigation verified end-to-end)
- ETAPP 5: Content fill for nests (long phase, deferred)

**§WIDER-CIRCLE-WORLD-1-LOCK 2026-06-21 (Etapp 3, World 1 of 4 complete):**
- Painted asset: `mghwh6or_image.png` (1536×1024, 3:2 aspect)
- File: `/app/frontend/src/pages/WorldWhatCannotBeReplaced.jsx`
- Container: `aspectRatio: 3/2, maxWidth: 1536px`, `object-contain`
- 7 calibrated click zones (`?debug=1` to inspect):
  - `back-to-wider-circle` (wooden sign top-left) → `/parents-room/wider-circle` — `top:3, left:3, w:14, h:12`
  - LEFT column nests (`top:19/43/67, left:17, w:14, h:22`): time, listening, attention
  - RIGHT column nests (`top:19/43/67, left:69, w:14, h:22`): presence, trust, connection
- Nest routes: `/parents-room/wider-circle/what-cannot-be-replaced/<slug>` → `SaraCategoryStub` (placeholder until founder visuals arrive for each nest).
- Subtitle: *"Some things only presence can give."* (baked into painting)
- Core pattern (locked): every nest must complete the sentence *"I am using ___ instead of being here."*
- Bottom parchment: *"Life is full of good intentions. Yet the things that matter most cannot be swapped, rushed, or outsourced. They can only be given in one way: I am here. With you."* (baked into painting)
- Bottom plaque: *"This world is being painted. Return when the colour has settled."* (baked into painting)
- Tone: anti-wellness, anti-guilt — notices without lecturing.
- Navigation verified end-to-end: Sara Forest → sea-ripple → Wider Circle Hub → What Cannot Be Replaced → nest click → SaraCategoryStub; Back to Sara's World and Back to The Circle We Create both functional.

**§WIDER-CIRCLE-WORLD-2-LOCK 2026-06-21 (Etapp 3, World 2 of 4 complete):**
- Painted asset: `js2g8gnk_image.png` (1536×1024, 3:2 aspect)
- File: `/app/frontend/src/pages/WorldOneHeartHoldsTheHouse.jsx`
- Container: `aspectRatio: 3/2, maxWidth: 1536px`, `object-contain`
- 7 calibrated click zones (`?debug=1` to inspect):
  - `back-to-wider-circle` (small wooden sign top-left) → `/parents-room/wider-circle` — `top:1, left:2, w:9, h:12`
  - LEFT column ring-nests (`top:13/38/63, left:8, w:18, h:26`): time (speed), listening (advice), attention (checking)
  - RIGHT column ring-nests (`top:13/38/63, left:74, w:18, h:26`): presence (being nearby), trust (control), connection (fixing)
- Nest routes: `/parents-room/wider-circle/when-one-heart-holds-the-house/<slug>` → `SaraCategoryStub`
- Subtitle: *"The sea remembers what every family eventually learns: one heart cannot carry everything forever."* (baked into painting)
- Core pattern (locked): every nest completes *"I am using ___ instead of being here."* — six founder-locked completions:
  · time → **speed** · listening → **advice** · attention → **checking**
  · presence → **being nearby** · trust → **control** · connection → **fixing**
- Bottom parchment: same heart-line as World 1 ("Life is full of good intentions… I am here. With you.") — intentional binding between worlds.
- Bottom plaque: *"This world is being painted. Return when the colour has settled."* (baked into painting)
- Tone: anti-blame — notices the parent who carries the house without lecturing.
- Navigation verified end-to-end (Sara Forest → sea-ripple → Wider Circle → Card 2 → World 2 → nest click → SaraCategoryStub → Back).

### 🌉 Founder-approved backlog — "Sara is listening" bridge (refined 2026-06-21, deferred):

**§SARA-ROOM-PHILOSOPHY-LOCK 2026-06-21 (founder quote, captures the whole room):**
> *"Sara ei seisa keset merd hüüdmas 'Tule räägi minuga!' vaid ootab vaikselt sadamas."*
> *(Sara does not stand in the middle of the sea shouting 'Come speak to me!' — she waits quietly in the harbour.)*

This is the locked tonal contract for every Sara-room surface — Sara Forest, Wider Circle, all current and future nests. Compare with the other three rooms to keep them distinct:
- **Grace listens.**
- **Kaelen observes.**
- **Alistair asks.**
- **Sara waits.**

Any future copy, button, hover-state, prompt, or notification inside Sara's domain must honour "waits quietly in the harbour" — never call, never beckon, never sell.


GPT proposed and founder approved a refined 3-point architecture. **Do NOT make this visible in every world or every nest.** Surface it only in three precise places:

1. **The Invitation** (W3 portrait long-form canvas) — natural decision-point after the wanderer has walked the whole circle. Three options: go back · continue exploring · speak with Sara.
2. **Each world's bottom plaque** — beneath *"This world is being painted. Return when the colour has settled."* quietly add (no CTA styling, no button — just permission):
   > *Or speak with Sara while you wait.*
3. **Sara herself** — when the visitor opens Sara Chat from a world, the chat backend receives a `from_world` context (e.g. `voices-around-the-child`) so Sara knows which door they walked through. Sara does not greet them about it; she just already knows.

Founder reasoning: "Sara ei seisa keset merd hüüdmas 'Tule räägi minuga!' vaid ootab vaikselt sadamas." Keep the painted sea-journey intact. Implement as a layer ON TOP of the existing structure — not woven into it. Revisit after 24 sub-nest content briefs are written.

**§WIDER-CIRCLE-WORLD-3-LOCK 2026-06-21 (Etapp 3, World 3 of 4 complete):**
- Painted hub asset: `f7l2y33z_image.png` (1536×1024, 3:2 aspect)
- File: `/app/frontend/src/pages/WorldEveryChildIsOurChild.jsx`
- Container: `aspectRatio: 3/2, maxWidth: 1536px`, `object-contain`
- 8 calibrated click zones (`?debug=1` to inspect):
  - `back-to-wider-circle` (wooden sign top-left) → `/parents-room/wider-circle` — `top:1, left:2, w:12, h:14`
  - LEFT column rowboat-nests (`top:13/38/63, left:7, w:21, h:26`): seeing (judgement→curiosity), speaking (criticism→encouragement), belonging (comparison→acceptance)
  - RIGHT column rowboat-nests (`top:13/38/63, left:72, w:21, h:26`): including (exclusion→welcome), trusting (suspicion→belief), guiding (control→partnership)
  - `the-invitation` (central parchment + figurines) → opens the long-form portrait anchor — `top:60, left:36, w:28, h:26`
- Nest routes: `/parents-room/wider-circle/every-child-is-our-child/<slug>` → `SaraCategoryStub`
- Subtitle: *"It takes a whole shore to raise a steady boat."* (baked into painting)
- Core pattern (locked, community-facing replacements): every nest completes *"I am using ___ instead of ___."* —
  · seeing → **judgement** instead of **curiosity**
  · speaking → **criticism** instead of **encouragement**
  · belonging → **comparison** instead of **acceptance**
  · including → **exclusion** instead of **welcome**
  · trusting → **suspicion** instead of **belief**
  · guiding → **control** instead of **partnership**
- Bottom parchment: *"Children do not need perfect people. They need many safe ones. When many hearts take small steps, a child can grow with roots and wings. We do not raise them alone. We raise them together."* (baked into painting)
- Tone: anti-blame, community-noticing — no "village" cliché, no activist tone.
- Navigation verified end-to-end (Wider Circle → Card 3 → World 3 → nest click → SaraCategoryStub → Back; invitation click → portrait anchor → Back).

**§WIDER-CIRCLE-WORLD-3-INVITATION-LOCK 2026-06-21 (emotional anchor canvas):**
- Painted asset: `g82x79km_image.png` (1024×1536, **portrait 2:3** aspect)
- File: `/app/frontend/src/pages/WorldEveryChildIsOurChildInvitation.jsx`
- Container: `aspectRatio: 2/3, maxWidth: 768px`, `object-contain`
- 1 calibrated click zone: `back-to-world` (top-left "The Circle We Create" sign) → `/parents-room/wider-circle/every-child-is-our-child` — `top:2, left:4, w:22, h:9`
- Long-form invitation body is baked into the painting (No single person can be everything to a child / Communities were never meant to be optional / Every child thrives when they belong to more / It does not mean everyone agrees / When a child feels held by many / This world is a reminder). Founder asked: "I don't know where to place it" — placed as a quiet "deep read" one step inside World 3, reachable via the central parchment hotspot on the painted hub.

**§WIDER-CIRCLE-WORLD-4-LOCK 2026-06-21 (Etapp 3, World 4 of 4 complete — all hubs done):**
- Painted asset: `agtsx58u_image.png` (1536×1024, 3:2 aspect)
- File: `/app/frontend/src/pages/WorldVoicesAroundTheChild.jsx`
- Container: `aspectRatio: 3/2, maxWidth: 1536px`, `object-contain`
- 7 calibrated click zones (`?debug=1` to inspect):
  - `back-to-wider-circle` (wooden sign top-left) → `/parents-room/wider-circle` — `top:2, left:2, w:10, h:11`
  - 4 voice-category parchments (`w:14, h:15-18`): pressure (top-left), fear (top-right), belonging (mid-left), comparison (mid-right)
  - 2 notebook tools (`w:18, h:24`): good-voices (bottom-mid-left), ask-yourself (bottom-mid-right)
- Nest routes: `/parents-room/wider-circle/voices-around-the-child/<slug>` → `SaraCategoryStub`
- Subtitle: *"Not every voice deserves to become a compass."* (baked into painting)
- Pattern pivot (locked): World 4 evolves the Core Pattern from "I am using ___ instead of ___" to **noun-based voice recognition** —
  · PRESSURE pushes hard, leaves little room to breathe
  · FEAR wants to protect, can also keep you stuck
  · BELONGING welcomes you exactly as you are, lights the way home
  · COMPARISON looks outward, steals the joy of your own path
  · GOOD-VOICES checklist (Stay when it's hard / Speak truth with kindness / Make space for mistakes / Believe in your becoming)
  · ASK-YOURSELF daily prompts (Which voices am I listening to? / Which voices do I repeat to others? / Which voices do I want my child to carry within? / Are my words helping them find their way home?)
- 4 painted voice-bottles around the scene name the metaphor: **The Wind** (Go faster. Be the best. Prove yourself.) · **The Harbour** (Be careful. Don't fail. Stay small.) · **The Lighthouse** (You belong. You matter. We see you.) · **The Other Ships** (Be more. Look perfect. Make them proud.)
- Closing question (baked): *"When the sea becomes loud, which voice remains? And is that voice helping the child find their way home?"*
- Tone: anti-cynical, anti-shame — no media-bashing, no "kids these days" laments.
- All 4 Wider Circle worlds (W1–W4) now wired end-to-end. Worlds 1–3 use 6-nest pattern with "I am using ___ instead of ___" completion; World 4 pivots to **voice-recognition** to honour the outward-facing nature of the final world.

**§CIRCLE-HUB-LOCK 2026-06-21 (Etapp 4b complete):**
- Painted asset: `tzl013rr_image.png` (1536×1024, 3:2 aspect)
- Container: `aspectRatio: 3/2, maxWidth: 1536px`, `object-contain` (changed from 1:1 + object-cover to prevent left/right cropping of wooden sign and 4th card)
- 5 calibrated click zones (all rendered with debug-mode dashed outline):
  - `back-to-forest` (wooden sign top-left) → `/parents-room` — `top:12, left:1, w:11, h:10`
  - `world-what-cannot-be-replaced` → `/parents-room/wider-circle/what-cannot-be-replaced` — `top:34, left:7.5, w:13.5, h:42`
  - `world-one-heart-holds-the-house` → `/parents-room/wider-circle/when-one-heart-holds-the-house` — `top:34, left:23, w:13.5, h:42`
  - `world-every-child-is-our-child` → `/parents-room/wider-circle/every-child-is-our-child` — `top:34, left:39, w:13.5, h:42`
  - `world-voices-around-the-child` → `/parents-room/wider-circle/voices-around-the-child` — `top:34, left:55, w:13.5, h:42`
- Navigation verified: Sara Forest → sea-ripple click → Wider Circle Hub → world card click → World 1 ready, Worlds 2-4 land on soft-404 (intentional, awaiting assets).
- The 14 Sara Forest worlds are LOCKED — untouched.

**§CIRCLE-RIPPLE-ENTRANCE-LOCK 2026-06-20 (Etapp 4 complete, REVISED):**
- Hub painted asset REPLACED with new image `nsl4baid_image.png` — the "The Circle We Create" ripples + title + subtitle are now BAKED INTO the painting itself (in the sea area between lighthouse and cottage). All 14 leaf names, icons, central nest, chat cards, values strip, and garden card preserved identically.
- Implementation: invisible click-zone overlay (no SVG, no HTML label) over the painted ripples.
- Click-zone: `top: 11%, left: 38%, w: 14%, h: 18%`
- Hover affordance: subtle cream-glow (rgba(232,217,184,0.08)) on mouseEnter; transparent on mouseLeave
- Click route: `/parents-room/wider-circle` → `WiderCircleHub.jsx` placeholder
- All 14 leaf-zones + 3 chat-zones calibrated first try — no shifts needed (new image preserved layout)
- Old SVG ripple overlay (V4) removed completely along with @keyframes saraCircleRipple

### §SARA-CAST-VARIETY 2026-06-18 — Cast variation rule (founder)
- **Rule:** Across the Sara worlds, deliberately vary the central figures so the cast mirrors real family life. Do NOT default to mother+child in every world.
- **Rotation pool:**
  - mother + child
  - father + child
  - both parents
  - grandparent + child
  - siblings
  - step-parents
  - single parent
  - multi-generational household
- **Encoded in code** at the top of every Sara World file (`§SARA-CAST-VARIETY` block in World 9, to be carried forward into Worlds 10-15 prompt generation).
- **Current cast roster:**
  - World 1 My Child — single child
  - World 3 Our Family — full family
  - World 6 Relationships & Cooperation — children together
  - World 7 Challenging Situations — mother + child after rain
  - World 8 Wisdom Garden — mother + daughter (grandparents in nests)
  - World 9 Weekly Digest — **father + daughter**
  - World 10 Stories from Real Life — **multi-cast** (every nest a different configuration)
  - World 11 Tools & Exercises — **grandmother + two grandchildren** (intergenerational, bridges to Worlds 14 & 15)
  - World 13 Parenting Journey — **multi-stage cast** (new parents + mid-life parents + grandparents on the same road simultaneously)
  - World 14 Generations & Heritage — **three-generation household** (grandparents + parents + 3 children together on a blanket)
- **Founder hint for World 15:** consider single parent, step-family, father+children, OR a quiet solo-with-memory cast to round out the roster.

### Deferred architectural candidate — "Every Child Is Our Child" (2026-06-18)
- **Status:** Saved idea, decision deferred to the very end of Sara construction
- **Origin:** Emerged during World 3 (Our Family) calibration when founder + GPT + agent considered replacing "Daily Life" zone. All three agreed: replacement is wrong (Daily Life is the most-used handle in real parenting), but the idea is too strong to discard.
- **What it is:** A philosophical handle for the child's life *outside the four walls of the home* — community, neighbours, school, role models, what adults show children, shared responsibility, what we leave behind.
- **Proposed nests (if it becomes a world):**
  - 🪺 The Village Around the Child
  - 🪺 Community & Belonging
  - 🪺 Generations of Care
  - 🪺 Role Models
  - 🪺 Shared Responsibility
  - 🪺 What We Leave Behind
- **Three open possibilities — DO NOT decide yet:**
  1. 16th standalone Sara world (requires new hub painted asset with 16th leaf)
  2. Central spine of existing **World 12 · School, Friends & the World**
  3. Cross-room philosophical thread (painted motto in multiple worlds, no dedicated nest)
- **Decision trigger:** Revisit AFTER all 14 painted Sara worlds are complete. (Hub v2 dropped the original "School, Friends & the World" leaf — numerals jump 11 → 13 — so there is no current World 12. The natural test will become: with all 14 worlds painted, does "Every Child Is Our Child" still feel orphaned? If yes → 16th standalone world OR re-introduce hub leaf #12 as its dedicated home. If no → cross-room motto, no dedicated nest.)
- **Rule until then:** Do NOT carve a hub slot. Do NOT place it under Generations & Heritage. Do NOT remove this PRD entry. Keep all 15 existing worlds + 6 nests in each untouched.

### Backend lenses (`parents_lenses.py`) — partial
- ✅ shitsuke renamed → "Japanese Ikuji" (Shitsuke + Itadakimasu + Amae + Ganbaru + Omoiyari + Soji)
- ✅ Header docstring updated to 7-lens registry with visible/hidden flag concept
- ⏳ 4 new hidden lenses NOT YET ADDED (Scandinavian, French Cadre, Reggio Emilia, Waldorf) — founder paused this work to focus on visuals first

## 3rd-party integrations
- Gumroad & LemonSqueezy (payments) — founder-supplied keys
- Gemini Nano Banana (image generation) — Emergent LLM Key
- ElevenLabs ConvAI (voice) — founder-supplied key, Creator tier 158,500 chars/month

## Deployment readiness
- Static analysis: PASS (deployment_agent, 2026-06-16)
- CORS: prulesoul.site, www.prulesoul.site, aurin-hub.preview.emergentagent.com
- No hardcoded secrets
- All env-driven (REACT_APP_BACKEND_URL, MONGO_URL, DB_NAME)

## P0/P1/P2 backlog (post-deploy)
- P1: Authored content expansion for the 10 preview labs (target 8-12 topics each)
- P1: New painted hub asset for Body World (14 stones, no "15 worlds" caption, no eye-icon 15th stone)
- P1: New painted Stone 5 + Stone 6 assets (no "OF 15" typo, no "WISOM" typo)
- P2: Sara Room (Parents Room) refactor to RoomShell + Painted Map pattern
- P2: USD/EUR currency toggle in header
- P2: Connect "Recent Notes" placeholder UI to user DB/state
- P3: Remove "Launch Pause Mode" once PSP strategy resolved
- Post-Lock: Luule Viilma Knowledge Layer (alt-wisdom lens across Body World)
- Tech debt: Lint cleanup in AgeGate.jsx, CadenceEngine.jsx, BodyRoomChat.jsx, KidsRooms.jsx
