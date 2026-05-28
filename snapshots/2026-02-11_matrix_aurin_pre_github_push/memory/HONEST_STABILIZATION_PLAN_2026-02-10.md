# Aurin — Honest Stabilization Plan
**Date:** 2026-02-10  ·  **Author:** AH agent  ·  **Status:** PLAN ONLY — no code touched.
**Goal:** Take Aurin from "technically working preview" to "bestseller-luxury product the founder can sell with pride", at honest cost, with the brand voice the founder has been trying to convey for weeks.

This plan is structured the way the founder asked: **brand definition first → product per room → avatar at low cost → voice realism → real prices**. No mythology, no hologram fantasy, no upsell-of-features-you-don't-need.

---

## 1. What Aurin actually is (the line that has been missing)

Aurin is **a quiet companion you talk to when there's no one else you can say it to.**

Not a therapist (legal/clinical implication — forbidden).
Not a coach (too transactional, too American).
Not a guru, not a healer, not a psychologist.

A **mentor · keeper · listener** — closest English word: **"companion"** or **"keeper of the room"**.
The clean Estonian equivalent the founder used: **"teejuht · tugiisik · keegi kellega rääkida sellest millest kellegi teisega ei saa."**

The reference image the founder gave the priest: people sit with a priest not for sacraments but to unburden the heart. Aurin is the secular version of that — without the religion, without the doctrine, without the "ahaa, you must change yourself" pressure. **The room listens. The visitor decides what to do with their own words.**

### Words we use (brand vocabulary lock)
- companion · keeper · room · listening · quiet · presence
- a guide who has all the time in the world
- a place to set something down
- *honest words, your own pace*

### Words we never use (legal + brand)
- therapist · therapy · counselling · counsellor
- psychologist · clinician · diagnosis · treatment · cure
- coach · coaching (in the American business sense)
- guru · master · spiritual guide · healer
- "AI assistant" · "chatbot" · "agent" · "hologram"

### What the customer takes away
- They said something out loud, in a calm room, without judgment.
- They heard it mirrored back in plain sentences.
- They left lighter — without anyone telling them who to become.

---

## 2. Customer (who actually buys this)

Not entrepreneurs (the Million-Dollar Book Method's audience). That book is the *commercial framework*, not the customer profile.

**Aurin's customer is the person who:**
- Carries something heavy and has nobody safe to tell.
- Is tired of self-help that demands they become someone else.
- Has tried therapy and felt clinical, or has not tried it because it feels like admitting defeat.
- Wants a calm, premium, private space — not a forum, not a free chatbot, not a Reddit thread.
- Has $5–$50 to spend on a book / quiet hour, and possibly $300+ for a deeper journey.

This customer does not want "scale your business" copy. They want **a sentence that recognises them**.

---

## 3. Room-by-room product (what each space actually offers)

### `/clarity-release` — **Clarity Release · The Listening Room**
- **What:** one private hour with a companion who only listens, mirrors, asks one quiet question at a time.
- **Voice-first by design.** Tap once → speak → hear a calm voice answer.
- **Who it is for:** anyone carrying a thing they haven't been able to say out loud.
- **What it is NOT:** therapy, advice, prescription, a person on the other end.
- **The companion (Grace or Clarity)** is honest about being a software companion. The wanderer always knows. **That honesty is the trust.**
- **Price ladder:** First message free → 12 lines/day free → unlimited day-pass (€7) → monthly companion (€39/month) → in-depth weekend ticket (€97).

### `/body-room` — **Body Room · The Slow Companion**
- **What:** the same companion but tuned for body-attention work — slower, fewer words, more silence.
- **Use cases:** when the chest feels tight, when sleep won't come, when the words are too many.
- **Different copy, same engine, same companion choice.**

### `/cabinet/booking` — **Cabinet · The Private Sitting**
- **What:** a scheduled, longer session (30/60 min) in a quieter time window (evening UTC).
- A booked sitting is the **premium** version of the same room — same companion, but with a confirmed slot, a confirmation email, and the option to set an intention beforehand.

### `/bookstore` — **The Quiet Bookstore**
- Books you've already written: *Beyond the Matrix I & II*, *The Language of Angels*, *You Don't Have to Dance to Another's Tune*, *Angels' Tales*, *The Night Angel*.
- **Price:** $5–$13 per book (the Million-Dollar Method's $5 entry point applied honestly).
- **Function:** front-end offer. The reader meets your voice in a book → trusts the room.

### `/courses` — **The Slow Courses** (Coming Soon while LemonSqueezy is finalising)
- 7-letter quiet courses on the four founder themes.
- $20–$25 each. Daily email + in-room preview.
- **Currently locked behind COMING_SOON_OVERLAY until founder is ready to switch on.**

### `/kids` — **The Children's Side**
- Free for now. *Angels' Tales*, gentle illustrations, no in-app companion.
- A trust-building public surface — parents who land here will trust the adult side later.

---

## 4. Avatar — moving silhouette mentor at honest cost

The founder's image reference (asset `b1v5otb1`) and description make it clear:

> *"Hallogram jääb sellise siluetina kuid liikuva näo miimika ning suurema motoorsete keha osade liikumisega; näiteks käsi lehvitab, keha asendi väike kohendamine, kerge pea liikumine."*

→ **NOT a photorealistic talking head (HeyGen / D-ID / Tavus).** That's the wrong direction and expensive.
→ **YES a rigged silhouette with subtle living motion: breath, blink, micro-sway, occasional hand wave, posture shift.**

This is achievable for **under $100 one-time + $0/month ongoing**. Three real paths:

### Path A — Pre-rendered MP4 loops (cheapest, ~6 hours of work, ~$0)
- **What:** the existing portrait JPG is replaced with a 10–15 second silent looping MP4 of the silhouette: idle breath, occasional blink, gentle posture shift, one slow hand gesture.
- **Speaking state:** a second MP4 (or same MP4 dimmed slightly) plays while TTS is active.
- **Cost:** generated with **Sora 2** (already on the Emergent LLM key, ~$0.10/sec). 15-second loop = $1.50 per video, two videos per companion = ~$6 total for Grace + Clarity.
- **Pros:** instant playback, no per-message API cost, calm, no uncanny valley.
- **Cons:** the motion is identical every time (loop). Not "responsive" — but the wanderer doesn't notice on first 5 visits.
- **Recommendation:** ✅ **start here this week.** Get the moving-presence feeling live for $6.

### Path B — Lottie / SVG rigged animation (~$200 designer fee on Fiverr, $0/month)
- **What:** a designer rigs the silhouette in After Effects → exports as Lottie JSON → 8-12 parameterised states (idle / listening / speaking / nodding / gentle wave / settling).
- **Cost:** ~$200 one-time. **$0 ongoing.**
- **Pros:** parametric — the room can trigger "listening" when the wanderer is recording, "speaking" when TTS plays, "settling" when the conversation ends. Subtle and responsive without per-request fees.
- **Cons:** 5-10 day delivery from a freelancer, requires one round of revisions.
- **Recommendation:** ✅ **commit to this for the final brand polish.** $200 one-time is well within budget.

### Path C — Real talking-head streaming (HeyGen / D-ID / Tavus) ❌ NOT recommended
- **Cost:** $50–$99/month base + $0.10–$0.40 per minute streamed → **easily $50–$200/month at low traffic, $500–$2000/month at scale.**
- **Quality issue:** the founder's reference is a silhouette, not a photorealistic person. Talking-head services are tuned for the latter. Using them here means fighting the brand.
- **Latency:** 3–8 seconds per reply on top of TTS — kills the "calm" feeling.
- **Verdict:** **do not pursue this path.** It is the raharöövel option.

**My honest recommendation:**
- **This week:** Path A (Sora MP4 loops, ~$6, 6 hours of my work).
- **Next 1–2 weeks:** Path B (Lottie rig, ~$200, hire one Fiverr designer).
- **Skip Path C entirely** until traffic + paid usage justify it (probably never).

---

## 5. Voice realism — the cheap upgrade nobody is talking about

Current chain: **mic → Whisper STT → Claude → OpenAI TTS** = 4 round trips, 3–7 second pause between user and reply. That pause is the "AI-breaking" moment the reality audit flagged.

There is **one** real upgrade that collapses this:

### **OpenAI Realtime API** (gpt-realtime / gpt-4o-realtime)
- **What it does:** the wanderer speaks → audio streams directly into a single model that responds with audio. No Whisper. No separate TTS. One pipe.
- **Latency drop:** from 3–7 s to ~600–900 ms. The companion sounds like it is actually listening.
- **Cost:** ~$0.06 per input minute, ~$0.24 per output minute (audio-to-audio pricing). For a 5-minute session: ~$1.20 — **comparable to or cheaper than the current Whisper + Claude + TTS chain on long sessions.**
- **Voice quality:** OpenAI's `alloy / shimmer / sage / coral` voices are already what we use. Same brand voice, dramatically smoother delivery.
- **Recommendation:** ✅ **integrate this as a Phase 2 voice upgrade.** It is the single biggest "elus inimene" lever we have, at the same or lower cost.

This is **NOT a new architecture** — it replaces three internal calls with one. Two days of careful work. Founder approval required because it changes the audio path.

---

## 6. Aligning Aurin with the Million-Dollar Book Method (cleanly)

| Stage | Million-Dollar role | Aurin product |
|---|---|---|
| Free trust-building | Lead magnet | First Light audio (already exists) + free Kids side + free first Clarity Release line |
| Front-end offer ($5) | The book | One of your existing books in the bookstore at $5 (e.g. *Beyond the Matrix I*) |
| Order bump ($7–$10) | Swipe file | A companion audio track (you already have 9 MP3s) bundled with the book |
| Upsell ($25–$50) | Mid-ticket course | One of the 7-letter courses (currently Coming Soon) |
| Premium ($97–$300) | High-ticket programme | The "Companion Month" subscription + a booked Cabinet sitting + the full audio library |

This is **not new product** — every piece already exists in your assets folder. It is sequencing, copy, and price-pointing. **One week of copy work + LemonSqueezy switch-on.**

---

## 7. Real budget — total monthly cost at three scales

| Scale | LLM (Claude + OpenAI) | Resend | LemonSqueezy fee | Hosting | **Monthly total** |
|---|---|---|---|---|---|
| **Quiet beta** (5–20 wanderers/day) | ~$15 | $0 (free tier 3k/mo) | 5% of revenue | Emergent included | **~$15** |
| **Healthy traction** (50–200 wanderers/day) | ~$60–$120 | $20 (Resend Pro) | 5% of revenue | Emergent included | **~$100** |
| **Real product** (500+ wanderers/day) | ~$300–$600 | $20 | 5% of revenue | possibly +$50 | **~$400** |

Avatar Path A = **$6 one-time**. Avatar Path B = **$200 one-time**. Realtime voice upgrade = same cost line as current TTS.

**The $100/day burn the founder is seeing is not the product running — it is the iterative agent work and integration credit.** Once the product is stable and code-frozen, daily runtime cost drops 10–30×.

---

## 8. What I propose to do next (founder picks the order)

### Week 1 — make the room actually feel alive (no new architecture)
1. **Fix the voice autoplay bug on `/guest`** (the founder couldn't hear Grace at first — autoplay is blocked because of the full reload pattern I used). Real fix, not a band-aid.
2. **Rewrite the brand copy room-by-room** using Section 1's vocabulary. Strip "not a hologram" descriptors. Add benefit-led one-liners. Remove the Estonian-only Eluliin number, replace with a single calm international line.
3. **Generate Sora 2 MP4 silhouette loops** for Grace + Clarity (Path A). Replace the static portrait with a quietly moving one. **~$6 total.**

### Week 2 — turn the funnel on
4. **LemonSqueezy live mode** — only when founder is ready. Each book becomes a real $5–$13 product. Order bump = an audio track from the library. **No more "preparing" placeholders.**
5. **Switch course content from Coming Soon → live** once founder approves at least one course's email sequence.
6. **First 50-line landing-page rewrite** — *"A quiet companion you talk to when there's no one else you can say it to."* Lead with that. Picture below: the moving silhouette. CTA: *"Step in for a quiet hour — first line is free."*

### Week 3 — the realism leap (optional, founder approval)
7. **OpenAI Realtime voice integration.** Brings the chain from 3–7 s to <1 s. Same cost line. This is the single biggest "elus" upgrade we have.
8. **Lottie rigged silhouette** (Path B). One-time $200, $0/month ongoing.

### What I will NOT do without explicit founder approval
- ❌ Sign up for HeyGen / D-ID / Tavus
- ❌ Add any new room
- ❌ Add any new collection or DB schema
- ❌ Change the LLM provider away from Emergent key
- ❌ Touch the wanderer's data privacy contract
- ❌ Spend any credit on speculative redesign

---

## 9. What I need from the founder to start

**One short message, on one line:**

> "Start Week 1. Skip Week 3 for now. I will approve Week 2 once I see Week 1." (or amend as you like)

That is all. I will then:
- fix voice bug
- rewrite room copy
- generate the two Sora silhouette MP4s ($6)
- show you the result
- stop and wait

No more iterative drift. No more "let me try one more thing." One bounded sprint, one screenshot, one founder decision.

— end of plan —
