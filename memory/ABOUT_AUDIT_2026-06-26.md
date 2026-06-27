# /about FIRST-VIEWPORT AUDIT
### 2026-06-26 · live · 1280×720 viewport
### After STEP INSIDE → /about routing change

---

## 0 · Why this page now matters

Per yesterday's persona simulation, **two of five personas land on
/about as their first click**: P4 (GPT sceptic) and P5 (random
visitor). With STEP INSIDE re-routed today, /about is no longer a
side page — it is the **landing surface for ~40% of first-time
visitors**.

This audit answers GPT's four questions plus the Persona-6
(ChatGPT-Plus user) test. Evidence is from the live DOM right now.

---

## 1 · GPT's four questions, answered with evidence

### Q1 · What is this?

**Visible in first viewport, in DOM order:**
- Eyebrow: *"ABOUT ANNA · FOUNDER"*
- H1: *"I did not want to build another platform competing for attention. **I wanted to build a calmer place.**"*
- Subtitle: *"A quiet room for noticing what is already shaping your life."*
- Visible image: a photograph of Anna in glasses, brown sweater, paintings behind her — clearly a real person, not stock.

**What this tells a first visitor:**
- Tells the **philosophy**: a "calmer place", an anti-attention-economy stance.
- Tells **who built it**: Anna, a real human (the photo carries this 90%).
- Does **NOT** tell what is **sold**, what the **product** is, or what the visitor **does** here.

**Verdict — Q1: PARTIAL.** Communicates intent, not product.

### Q2 · Who is it for?

- Subtitle implies *adult, reflective people* ("noticing what is already shaping your life").
- The word **"adult"** appears **nowhere** in the first 4KB of text.
- The word **"letters"** or **"essays"** (the actual product) appears **nowhere** in the first viewport.
- The nav above includes "Parents' Room" and "Polarstar Kids" — which **muddies** the audience signal for a first visitor.

**Verdict — Q2: WEAK.** Audience implied, never named.

### Q3 · Why different from free AI?

- Anna's face is the dominant non-text element. **The photo alone does the work** of saying "this is a human, not an AI product".
- H1 opens with *"I did not want to build another platform competing for attention"* — implicitly distances from AI/social platforms.
- The word **"AI"** does **NOT** appear in the first 4KB of /about text.
- No explicit contrast with ChatGPT / free AI / chatbots.

**Verdict — Q3: IMPLICIT, NOT EXPLICIT.** The photo answers it intuitively. The text doesn't.

### Q4 · What is the next step?

Searched the first viewport for action affordances:
- *Sign in* — **NO**
- *Pricing* — **NO**
- *Subscribe* — **NO**
- *Read more / Continue* — **NO**
- *Start here / Begin* — appears only as the "The Beginning" nav item (false positive)
- *Library / Portal* — appears only in the top nav (not as a hero CTA)

**Verdict — Q4: MISSING.** A first-time visitor who reads the hero and wants to act has no obvious next step in the first viewport.

---

## 2 · Persona 6 — ChatGPT-Plus user (the new persona GPT named)

**Profile**: pays €20/month for ChatGPT Plus, daily heavy user. Mental
frame on landing on /about: *"I have the best AI already. Why
should I bother?"*

### T+3s
Visual: Anna's face. **Pattern-break**. P6 expected another
"product-marketing site with stock photography or an AI hero
graphic". Instead they see a human face with paintings behind her.

**Mental shift in 3 seconds**: "This is NOT another AI product."

### T+30s
Reads H1: *"I did not want to build another platform competing for
attention."* — exactly the language P6 uses to describe their own
fatigue. Subtitle: *"A quiet room for noticing…"* — registers as a
different category, not a competitor to ChatGPT.

**Mental model**: "This is something that uses AI, not something
that sells AI. Maybe like Substack with extra layers."

### T+60s
Looks for the next step. Finds none in the hero. Forced to scroll
or to look back at the nav (which doesn't have a clear "start here"
button). May leave at this point.

### Three answers
1. *"A writer's project that uses AI as a tool. Not a chatbot, not
   an AI service. Something quieter."*
2. *"Trust = high. The photo, the personal voice, the absence of
   marketing copy. This earns trust faster than 95% of pages I land
   on."*
3. *"Click… nothing is obvious. I would probably scroll, then click
   Library to see actual content. If I find nothing in 60 seconds,
   I leave."*

**Falsifiable claim**: /about wins this persona's *trust* almost
immediately but loses them on *next step*. **The hero needs a single
quiet CTA** — even just "Read on" or "See the rooms" — to convert
the trust into a click.

---

## 3 · The unexpected gold — navigation INCONSISTENCY between / and /about

This is the finding I did not see coming.

| Surface | Top nav contents |
| --- | --- |
| **Homepage `/`** | MATRIX AURIN · WORLDS · COMPASS · ROOMS · OPEN WORLD · WAYS TO BE HERE · PHILOSOPHY · **STEP INSIDE** (+ trust row: WHAT THIS IS · PRICING · LIBRARY · CONTACT) |
| **/about** | prulesoul MATRIX · Aurin · Home · Six Nights · The Beginning · Grace · Body World · **Parents' Room · Polarstar Kids** · Alistair · Philosophy · Library · Bookstore · Origin · Enter Portal |

These are **two different sites** structurally. They share no nav
items beyond "Library" and "Philosophy". A visitor who lands on
home, clicks STEP INSIDE, and arrives at /about experiences a
**total context collapse**:
- The poetic primary (WORLDS / COMPASS / ROOMS) — gone
- The trust row (WHAT THIS IS / PRICING / CONTACT) — gone
- "Step Inside" button — gone
- Suddenly: "Six Nights", "Parents' Room", "Polarstar Kids" are
  visible — labels the visitor has never seen.

**For the compliance reviewer (P1)**: the homepage looked
adult-focused; /about's nav shows "Polarstar Kids" + "Parents'
Room" at top-level — the audience signal flips from "adult" to
"family/kids" on the very next click.

**For P4 (GPT sceptic) and P6 (GPT Plus user)**: they were
prepared for one site by the homepage; they encounter a different
information architecture on /about. Cognitive cost is real.

**This is a falsifiable claim**: the homepage's careful work today
(trust row, Step Inside, anti-kids-priority sitemap) **does not
follow the visitor into /about**, where the old "every room
visible" nav still rules.

---

## 4 · What's working on /about (evidence-bound, no praise inflation)

- **Anna's photo is the single strongest trust signal on the page.** It does in 3 seconds what 200 words of copy could not do — communicate "this is built by a real person".
- **H1 is brand-truthful**: the "competing for attention" line lands without sounding marketing-y.
- **Subtitle "noticing what is already shaping your life"** is poetic and lands well for personas P2 (Influencer), P4 (GPT sceptic), P6 (GPT Plus user).
- **No funnel pressure visible** — earns trust from sceptical visitors.

---

## 5 · What's missing on /about (evidence-bound)

| Gap | Evidence | Affects which persona |
| --- | --- | --- |
| No explicit product naming ("letters · audio essays · rooms") in first viewport | Searched first 4KB: words *letters, essays* absent | P1 (MoR), P3 (Parent), P5 (Random) |
| No explicit audience name ("for adults") | Word *adult* absent in first 4KB | P1 (MoR) — categorisation friction |
| No explicit AI honesty line | Word *AI* absent in first 4KB | P4 (GPT sceptic) — they have an active question and don't see it addressed |
| No hero CTA / next-step affordance | Sign in / Pricing / Begin / Subscribe / Continue all absent from first-viewport buttons | All personas, especially P5 and P6 |
| Nav inconsistency vs homepage | Side-by-side comparison in §3 above | All personas, especially P1 |

---

## 6 · The four questions — final verdict

| GPT's question | Answered in /about's first viewport? |
| --- | --- |
| 1 · What is this? | **Partially** — philosophy yes, product no |
| 2 · Who is it for? | **Implied, not named** |
| 3 · Why different from free AI? | **Implicit via photo, not explicit in text** |
| 4 · What is the next step? | **No** |

Three of four questions land partially or not at all in the first
viewport. **For a page that is now the landing surface for 40% of
first-time visitors, this is the highest-leverage place to fix
next.**

---

## 7 · What I am NOT proposing

Per Anna's instruction (and GPT's agreement):
- I am **not** writing new copy.
- I am **not** writing a new hero subtitle.
- I am **not** writing the value-proposition sentence.

Those three writing tasks are Anna's voice, not mine. The
value-prop sentence in particular is **business strategy**, not UX
copy — it shapes the homepage, /about, pricing, influencer pitch,
and investor pitch simultaneously. Writing it lightly here would
do real damage.

---

## 8 · What I AM proposing (three small, surgical changes — Anna decides each)

### 🔴 Change A — Make the /about nav match the homepage nav
**The single highest-leverage fix.** Replace the legacy nav on
/about with the same two-row nav the homepage now uses (poetic
primary + trust secondary + Step Inside / Library button on the
right). This closes the context-collapse problem and means the
trust row Anna confirmed today follows the visitor everywhere.

**Risk**: zero visual identity change. **Cost**: 30 min. **Decision needed**: yes/no.

### 🟡 Change B — Add ONE quiet next-step affordance to /about hero
Currently: the hero ends with no next step. Even a single
brass-bordered button reading *"Read on"* or *"See the rooms"* or
*"Read what's already inside"* (linking to /library) closes the
"what now?" question for P5 and P6 without changing tone or copy.

**Risk**: small — adds one new element. **Cost**: 15 min. **Decision needed**: yes/no + which label.

### 🟢 Change C — Add a Sign in affordance for returning members
Currently: a returning member who lands on /about has no way to
sign in from there. Step Inside now goes to /about (not /portal),
so the sign-in route was implicitly orphaned. A small "Already a
member? Sign in" link in the /about footer or below the hero
restores it.

**Risk**: zero. **Cost**: 10 min. **Decision needed**: yes/no.

---

## 9 · What needs Anna's hand (not mine)

1. **The value-prop sentence**. The single sentence that answers
   *"what is this and why does it exist?"* — needs Anna's voice,
   informed by all of yesterday's discussion. Ideal place: as a
   small italic line above or below /about's H1.

2. **The hero subtitle revisit**. Current homepage subtitle *"Five
   rooms for people, parents, and families"* is the line that 4 of
   5 personas struggle with. Whether to keep it or evolve it is a
   founder-voice decision, not an audit decision.

3. **The $20 / 24-hour real-human validation**. UsabilityHub
   5-Second Test with the three questions GPT proposed. This is
   the only thing that can promote the persona simulation's
   hypotheses into facts.

---

## End

**Status**: read-only audit. Zero further code changes made.
**Single next step Anna confirms**: which of Changes A / B / C to
ship (any combination, or none).
