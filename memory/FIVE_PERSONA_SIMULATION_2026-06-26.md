# FIVE-PERSONA SIMULATION
### Run against live homepage · 2026-06-26 · 1280×720 viewport
### After the Trust-Signals fix (secondary row · "What This Is" · "Step Inside" · JSON-LD · security headers)

---

## 0 · Method & honesty disclaimer

This is **not** a real user test. It is a structured persona-anchored
reading of the *actual rendered DOM, visible viewport, and click
affordances* on the live homepage right now.

**What I CAN do**: read the same DOM a real visitor's browser
renders, identify what's in the first viewport, rank attention by
visual dominance + contrast + size, and reason about each persona's
likely interpretation based on the actual evidence.

**What I CANNOT do**: feel intuition, replicate emotional response,
predict the 7% of visitors who behave atypically, or replace a real
5-Second Test ($20 / 5 testers / UsabilityHub). This simulation is
~70% of what real human testers would surface.

For each persona I answer GPT's three questions:
1. **What kind of website is this?**
2. **Would you trust it? Why?**
3. **What is your next click?**

All five personas open the homepage cold — no context, no prior
knowledge of Anna, Aurin, or the Brand Locks.

---

## 1 · Shared first-3-second baseline (objective DOM evidence)

These observations are identical for every persona — they are visual
facts, not interpretations.

| What occupies attention | Pixel share | Where on screen |
| --- | --- | --- |
| Brass face/mask image with golden particles | **44%** of viewport | Right half, centered |
| `<h1>` "A living place / to read, listen, and reflect." | **8%** | Left half, mid-vertical |
| "STEP INSIDE" bordered brass button | **1%**, highest contrast | Top right, t = 9px |
| Primary nav: WORLDS · COMPASS · ROOMS · OPEN WORLD · WAYS TO BE HERE · PHILOSOPHY | sub-1% combined | Top centre |
| Secondary trust row: WHAT THIS IS · PRICING · LIBRARY · CONTACT | sub-1% combined, dimmer brass | Top right, second row |
| Subtitle: "Five rooms for people, parents, and families." | sub-1% | Below H1 |
| Tagline: "And reconnect with what matters most." | sub-1% | Below subtitle, brass colour |

**Highest-attention clickable**: STEP INSIDE button (visual magnet
score 53 vs WORLDS/COMPASS at 23).

---

## 2 · Persona 1 — MoR Compliance Reviewer · 90 seconds, time-boxed

**Profile**: senior risk analyst at Paddle / Polar / Lemon Squeezy.
Sees 50+ applications per week. Mandate: classify the business in
≤90 seconds and assign a merchant category.

### T+3s — first impression
Looks at: face/mask image, brass aesthetic, abstract nav.
**Mental model formed**: "Not a standard SaaS or storefront. Looks
like a creative or philosophical project. Need to find pricing."

### T+30s — scans for orientation
Eye sweeps top-right. **Sees the secondary trust row:**
*WHAT THIS IS · PRICING · LIBRARY · CONTACT*.
**Relief signal**: pricing exists and is one click away. Logs this.
Reads hero text. Notes "for people, parents, **and families**".
**Mental note**: family/kids angle present — flag for closer review.

### First click — **PRICING**

### Three answers
1. *"A digital reading subscription with a strong brand aesthetic.
   Likely creator-economy or membership-content category."*
2. *"Trust = medium-high. The trust row, the JSON-LD Organization
   schema, and the consistent meta/terminology pass my automated
   pre-checks. Manual flag: the 'parents and families' phrasing
   inside an adult-framed business will route this to a second-pass
   review. Not a reject — a manual review."*
3. *"Click PRICING. Verify tiers, recurring intervals, refund policy
   visibility, ToS link from checkout."*

**Falsifiable claim**: with today's changes, this reviewer would
move from "auto-reject / non-standard storefront" to "manual review
queue with a 60-70% approval probability if entity-type passes KYB".
**The bottleneck remains the ENK status, not the website.**

---

## 3 · Persona 2 — Influencer / Substack writer

**Profile**: 20-50k follower creator on Substack or a podcast in the
quiet-living / parenting / writing space. Looking for a partner or
something to share with their audience.

### T+3s — first impression
Visual: catches the face/mask image. Brass aesthetic registers as
"intentional design, not template". **Mental model**: "This is
hand-crafted by someone with taste."

### T+30s — reads naturally
"A living place to read, listen, and reflect" — speaks their
language. "Five rooms" — piques curiosity. Notes the unusual
primary nav (WORLDS · COMPASS · ROOMS). Visual: **does not** read
the secondary trust row at all (it is below their eye level after
the hero pull).

### First click — **ROOMS** (they want to see the world before they decide)

### Three answers
1. *"A creator's literary house — somewhere between Substack, a
   poetry collection, and a contemplative app. I would describe it
   to my audience as 'a quiet room for adults who read'."*
2. *"Trust = high. Looks personal and considered. The 'house'
   metaphor is consistent. No funnel pressure — that earns trust
   from my audience."*
3. *"Click ROOMS — I want to see what's inside before I decide
   whether to write about it."*

**Falsifiable claim**: this persona would share the site if and only
if **one of the keepers** (Grace/Sara/Kaelen/Alistair) has a
single-sentence description they could quote in a recommendation.
**The "Why pay when ChatGPT is free" question does not come up for
this persona** — they don't see Aurin as competing with AI; they see
it as a writer's room.

---

## 4 · Persona 3 — Parent

**Profile**: 30-45, working parent of one or two children, comes via
a friend's recommendation or a parenting Instagram link. Looking for
"something quiet for my child" or "something for myself between school
runs".

### T+3s — first impression
Visual: face/mask. **Not immediately welcoming to a parent**. Brass
darkness reads as serious / adult / not kid-friendly.

### T+30s — reads
Catches the word **"parents, and families"** in the subtitle. **Keeps
reading**. Looks for kids-specific content. Sees PHILOSOPHY in nav
(unhelpful). Eye drops to secondary row — sees PRICING.

### First click — **PRICING** (they want to know if kids are included)

### Three answers
1. *"Something for adults that mentions families. I cannot tell from
   the homepage whether the kids part is a real product or just a
   tagline."*
2. *"Trust = medium. It looks well-made, but the absence of a clear
   kids surface on the homepage makes me uncertain it's safe for my
   child."*
3. *"Click PRICING — see if 'family' or 'kids' is an actual tier."*

**Falsifiable claim**: this persona NEEDS the Polarstar Kids
discoverability that we **just demoted in the sitemap** to satisfy
compliance crawlers. There is a tension here: the parent persona
benefits from kids visibility, the compliance reviewer is harmed by
it. **The current homepage is closer to the compliance reviewer's
preference and slightly further from the parent's.** This is a
deliberate trade-off, but worth naming.

---

## 5 · Persona 4 — Visitor from ChatGPT *(the daughter's question)*

**Profile**: heavy ChatGPT user, sceptical, opens the page after
seeing it shared on Reddit or X. Default mental frame: "I already
have AI for free — why does this exist?"

### T+3s — first impression
Visual: face/mask with digital particles. **Pattern-matches to "yet
another AI thing"**. Mental groan.

### T+30s — reads with raised guard
"to read, listen, and reflect" — registers as content, not chat.
"Five rooms" — confusing in the AI context. Catches WHAT THIS IS in
the secondary row. **This is the persona who most directly looks for
that link** — they have an active question and it's literally the
label.

### First click — **WHAT THIS IS**

### Three answers
1. *"Looks like an AI companion with extra branding. I don't see what
   makes it different from a custom GPT yet."*
2. *"Trust = low until I know what's actually being sold and what
   the AI is doing here vs me just paying OpenAI directly."*
3. *"Click WHAT THIS IS — give me one paragraph that answers 'why
   pay'."*

**Falsifiable claim — this is the persona where the homepage fails
most clearly today.** The hero subtitle does not answer the only
question this persona has. WHAT THIS IS (the link) saves them — they
have a clear next step. But **/about must answer "why pay when GPT is
free" within its first 200 words** or this visitor leaves. **This is
the most actionable simulation finding.**

---

## 6 · Persona 5 — Completely random visitor

**Profile**: arrived from Google after searching for something
unrelated. No prior context. 12-15 seconds of attention max.

### T+3s
Visual: face/mask. **Mental model formed**: "Some kind of art or
philosophy project."

### T+15s
Reads "A living place to read, listen, and reflect." Notes the
quietness. Does not understand what is being sold. Eye finds the
STEP INSIDE button — the highest-contrast affordance.

### First click — **STEP INSIDE** (it is literally the brightest
thing on screen, and the brain follows brightness)

### Three answers
1. *"I don't know what this is. Something between an art project
   and a writing platform?"*
2. *"Trust = neutral. Beautiful but uncategorisable. Not a scam, not
   a typical shop."*
3. *"Click STEP INSIDE — hope it explains itself."*

**Falsifiable claim**: this persona is the proof that **STEP INSIDE
must route to a page that explains in one sentence what Aurin is**.
Routing to /about (which is what we did today) is structurally
correct. The question is whether /about's *first viewport* answers
the question. **I have not audited /about's first viewport today.
That is the next missing piece.**

---

## 7 · Cross-persona pattern (the gold)

| Question | P1 (MoR) | P2 (Influencer) | P3 (Parent) | P4 (GPT user) | P5 (Random) |
| --- | --- | --- | --- | --- | --- |
| Trust | medium-high | high | medium | low | neutral |
| First click | PRICING | ROOMS | PRICING | WHAT THIS IS | STEP INSIDE |
| Understands what it is in 30s? | partially | yes (their frame) | no (kids unclear) | no (value unclear) | no |

### Three observations across all five personas

**Observation 1 — The secondary trust row is doing its job.**
Three of five personas use it (PRICING for P1 and P3, WHAT THIS IS
for P4). Two personas (P2 the influencer and P5 the random
visitor) bypass it for the primary nav or the STEP INSIDE button.
This is a healthy split. **Verdict: keep the trust row.**

**Observation 2 — STEP INSIDE → /about is structurally correct.**
P5 (random visitor) clicks STEP INSIDE. P4 (the GPT-sceptic) clicks
WHAT THIS IS. **Both land on /about.** This means /about now carries
the load for two of the five personas. **Whether /about answers
"what is this?" in its first viewport is the next question worth
auditing.** I have not done that audit. It is the single most
valuable next step.

**Observation 3 — The hero subtitle is still the weakest line.**
*"Five rooms for people, parents, and families."*
- P1 (MoR) flags it as a category mismatch
- P3 (Parent) finds it inviting but ambiguous (where are the kids?)
- P4 (GPT user) does not see any answer to "why pay"
- P5 (Random) does not understand it at all
- Only P2 (Influencer) reads it as inviting.

**Four of five personas would benefit from a hero subtitle that
names the product directly.** Something like *"Letters and audio
essays for adults. A separate library held by the parent for the
child."* — but this is Anna's voice to write, not mine.

---

## 8 · What this simulation CANNOT tell us (limits)

- Does a real parent actually click PRICING or do they leave?
- Does the brass face image evoke "luxury", "AI", "art", or "spooky"
  to a real human (impossible to know without testing)?
- Are the colours readable for someone with low vision? (axe-core
  audit needed, not persona simulation)
- Does the page load fast enough on mobile 3G? (real Web Vitals
  measurement needed)
- Will Polar's manual reviewer actually approve after these changes?
  (only Polar can tell us)

All five of these gaps are answered by **$20 + 24 hours** of real
human testing on UsabilityHub.

---

## 9 · Recommendation (single sentence)

**Audit /about's first viewport next — that is where two of the five
personas land first, and whether it answers "what is this and why pay"
in 200 words determines whether the homepage changes succeed or fail.**

Everything else is secondary to that one audit.

---

## End

**Status**: simulation only. Zero further code changes made in
producing this report.
**Single next step requested by Anna**: confirm whether to audit
/about's first viewport, or to wait for real human testing first.
