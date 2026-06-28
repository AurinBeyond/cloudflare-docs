# HOUSE COMMERCE LOGIC
### How Aurin sells — the constitution of access and exchange
### v1.0 · 2026-06-27 · Status: HELD until post-deploy commerce iteration

> *Aurin does not sell rooms. Aurin sells the time a visitor spends
> in the house. Everything else — Day Access, Monthly, Voice packs —
> is a way of measuring that time, never a way of slicing the
> visitor's experience.*

---

## 0 · Why this exists

Most products sell features. Most subscription products sell tiers
that differ by features. This creates **comparison shopping**: the
visitor must read a matrix and decide which version of themselves
they are buying for.

Aurin is the opposite kind of place. The visitor came here because
they did not want to comparison-shop their own life. So the commerce
logic must remove the matrix.

This document is the commerce constitution. It applies to:

- The pricing page
- Every paywall the visitor ever sees
- Every checkout flow
- Every webhook / fulfillment / refund decision
- Every future product Anna may add

If a future commercial idea cannot pass these rules, it does not
belong to Aurin — no matter how well it would convert.

---

## 1 · The one principle

> **The visitor buys the time they spend in the house — never a
> specific room, a specific keeper, or a specific feature.**

This is the line that must not be crossed. The moment Aurin sells
"Grace alone" or "Sara alone" or "the Body World tier", the house
becomes a mall. The house cannot recover from that.

Time is the only thing Aurin sells.

---

## 2 · The two product categories

There are only **two** kinds of products in the Aurin commerce model.
No third kind may be added without explicit reconsideration of this
document.

### 2.1 Access
The visitor's right to be in the house, measured in time.

- **Quiet Visit** — free, always. No account required.
- **Day Access** — twenty-four hours in the house.
- **Monthly Access** — one month in the house.
- **Annual Access** — (later, when the membership is mature) one year.

All Access tiers grant the **same** experience of the house. The
only difference is *for how long*. There is no room locked behind
any Access tier.

### 2.2 Voice Time
The visitor's right to use voice conversation, measured in minutes.

- 30 minutes
- 90 minutes
- 200 minutes
- 500 minutes

Voice is **always** purchased separately from Access. It is never
bundled inside an Access tier as a "feature". A Monthly Access
member who wants to speak with Grace buys voice minutes the same
way a Day Access visitor does.

The reason: voice is metered. Access is unmetered. Two different
units cannot live in the same product without confusion.

### 2.3 The open question — Lantern
Lantern (Anna's intimate content: a monthly letter, voice notes,
the option to send one quiet message back) is currently a tier.

**The open question**: is Lantern a third Access tier, or is it a
separate "subscription within a subscription" available as a layer
on top of Monthly/Annual Access?

This question is **deferred** until the post-deploy commerce iteration.
The answer must be made before the first real customer pays for
Lantern, not after.

---

## 3 · The four discipline rules

### Rule A — Paywall is contextual, not promotional
The visitor never has to *find* the pricing page to buy something.

The paywall appears **at the moment of need**:
- The visitor opens Grace's door without Access → an inline access
  card appears: *"Choose how long you'd like to stay."*
- The visitor presses "Start voice conversation" without Voice
  minutes → an inline voice card appears: *"Add Voice Time."*

The pricing page exists, but it is a **reference**, not a funnel.
Visitors should be able to buy without ever opening it.

### Rule B — Pricing page is a reference card, not a sales page
The pricing page lists:
- Access tiers (Quiet Visit · Day · Monthly · Annual)
- Voice packs (30 · 90 · 200 · 500)
- A single "What is included" table that shows: same rooms, same
  reading, same writing, same AI chat — for every paid Access tier
- A single sentence: *"Voice is always added separately."*

The pricing page does **not**:
- Push the visitor toward the "popular" or "best value" tier
- Hide cheap options behind expensive ones
- Use scarcity, urgency, or limited-time framing
- Compare itself to other products

### Rule C — One mental unit per product
Every product the visitor sees must answer one clean question:

- Access: *"For how long?"*
- Voice: *"For how many minutes?"*

Never both. Never "How long + how much voice + which rooms + which
keepers". The mental tax of a comparison matrix is the same as
walking through a shopping mall — exhausting and impersonal.

### Rule D — Refund and pause are part of the offer
Because Aurin sells time, the visitor must be able to:
- Cancel any recurring Access at any time (no contract trap)
- Carry voice minutes forward within their non-expiry window
- Receive a refund per the 14-day EU withdrawal right at any
  point of sale

These are not "policies" hidden in /legal. They are part of the
commerce offer and may be repeated on the inline paywalls.

---

## 4 · What this logic is NOT

- ❌ Not a sales funnel
- ❌ Not a conversion-optimisation framework
- ❌ Not a feature comparison matrix
- ❌ Not a tier-laddering pricing psychology
- ❌ Not a marketing pricing page
- ❌ Not a SaaS-style "Basic / Pro / Enterprise" structure

It is only — and exclusively — about how Aurin invites the visitor
to **buy time in the house**.

---

## 5 · The current vs. the target state

### Current state (as of 2026-06-27 pre-deploy)
| Product | Sold as | Backend actually grants |
|---|---|---|
| Day Pass €19 | Day access | 1440 voice min, 1 day |
| Journey €29/mo | "One chosen room" | 30 voice min, 35 days, all rooms |
| Companion €49/mo | "All five rooms" | 60 voice min + kids, 35 days |
| Lantern €69/mo | All + Anna's voice | 60 voice min + kids + lantern flag, 35 days |
| Voice top-ups €11–€109 | Standalone | Voice minutes added to wallet |

The **gap**: UI describes room scope ("one chosen room"). Backend
ignores room scope and grants minutes. The visitor must learn an
inaccurate mental model that the system then quietly violates.

### Target state (to be implemented in post-deploy commerce iteration)

| Product | Sold as | Backend grants |
|---|---|---|
| Quiet Visit | Free, always | reading + writing + AI chat, no voice |
| Day Access | 24h in the house | full Access, voice if a pack is held |
| Monthly Access | one month in the house | full Access, voice separate |
| Annual Access (later) | one year in the house | full Access, voice separate |
| Lantern *(open question)* | upstairs door | Anna's intimate content layer |
| Voice 30 / 90 / 200 / 500 | voice minutes | minutes added to wallet |

The mental model is finally honest: **Access answers "how long",
Voice answers "how many minutes". Nothing else needs to be answered
before the visitor enters.**

---

## 6 · When to apply this

This document is **HELD** until the post-deploy commerce iteration.

The trigger is:
1. Site is deployed to prulesoul.site ✓
2. ElevenLabs `convai_write` permission added
3. One real Grace voice conversation succeeded
4. Anna explicitly says *"begin commerce refactor"*

Until that trigger, the current pricing remains. **LAUNCH_PAUSE**
protects the visitor from the current model: while `LAUNCH_PAUSE=true`,
no one can buy under the confusing tier names.

After the refactor, **LAUNCH_PAUSE** flips to `false` and the new,
honest commerce model is the first one any real customer ever sees.

---

## 7 · Owner & sister documents

- **Logic author**: Anna (insight: *"kui inimene valib toa, automaatselt
  tuleb maksepakettide ettepanek"*)
- **Drafted by**: E1 (2026-06-27) after Anna+GPT diagnosis
- **Editorial authority**: Anna only
- **Sister documents** (House Identity System):
  - `HOUSE_EXPERIENCE_AUDIT_FRAMEWORK.md` — the website experience
  - `HOUSE_LANGUAGE_CALIBRATION_BRIEF.md` — written copy
  - `AURIN_FILM_LANGUAGE.md` — moving image
  - this file — commerce

Together these four documents define what Aurin **is** — across
experience, words, image, and exchange.

---

## End

**Status**: HELD until post-deploy commerce iteration.
**Do not edit prices, SKUs, or checkout flows before that trigger.**
