# Marketing Agent — Sales Activation Response

**Compiled by E1 (build agent) · 2026-02-09**
**For**: Marketing Agent + Anna
**Concerning**: Body Temple 28 launch, $39 unlock validation, email tracking, Sara-tone coordination

---

## 1 · Content Check — Body Temple 28 Day 1 ACTIVE

| Surface                       | Status | Path                                |
|-------------------------------|--------|-------------------------------------|
| Body Temple landing page      | ✅     | `/body-temple` (public)             |
| Day 1 readable without sign-in | ✅     | `/api/body-temple/day/1` returns full content (no premium gate) |
| Day 1 deep-link from email    | ✅     | `/portal?utm_source=email&utm_campaign=body-temple-launch` → portal shows Body Temple 28 CTA card → click → `/body-temple` Day 1 modal |
| Stones path renders           | ✅     | 28 stones across 4 weeks, Day 1 pulses gold, days 2-28 padlocked for non-premium |

**Verified working** via curl + screenshot. The marketing email now lands on `/portal` (NOT directly on `/body-temple`) — this is intentional, because:
- The portal funnel captures UTM analytics
- Users see Cycle 01 banner (calm scarcity) AND the Body Temple card
- If they're signed in, magic-link guest-key redemption fires automatically
- One click → /body-temple → Day 1 modal opens

---

## 2 · Pricing — $39 unlock OPERATIONAL (with one caveat)

### How it works TODAY (verified end-to-end)

1. Visitor clicks Body Temple "Unlock all 28 days — $39" CTA
2. Lands on `/clarity-release` (the existing First Step funnel)
3. LemonSqueezy checkout for the First Step variant ($39)
4. On payment, webhook grants `clarity_passes` doc
5. `_user_has_premium()` returns True → all 28 days unlock

### ⚠️ Caveat the Marketing Agent must know

**There is no dedicated Body Temple LS variant yet.** The $39 routes through the existing First Step product, which ALSO grants:
- 1 hour of Aurin voice time
- Full Kids Universe Curriculum access
- Parent-stamp feature

This is a **higher-value transaction than just Body Temple** — economically good for Anna (more value delivered per $39), but it means our analytics cannot distinguish "buyer who came for Body Temple" from "buyer who came for First Step in general."

### Recommended founder action (5 min in LemonSqueezy dashboard)

Create a dedicated Body Temple 28 product in LemonSqueezy with:
- Price: $39 one-time
- Internal name: `Body Temple 28 — full unlock`
- Variant ID → paste into `LEMONSQUEEZY_VARIANT_BODY_TEMPLE` env var on production

Once that env var is set, I can extend the webhook to grant a `body_temple_unlocks` row specifically (not a full First Step pass). This separates marketing attribution cleanly.

**Until then**: $39 unlocks Body Temple **plus** First Step bonuses. Marketing agent can pitch it as "$39 unlocks Body Temple 28, plus your first hour of voice time with our voice rooms" — accurate and generous.

---

## 3 · Email Data — Click → Day 1 tracking IS NOW WIRED

I just shipped (iter 84) the following:

### What now happens when a parent clicks the email

```
[Email click] → https://prulesoul.site/portal?utm_source=email
                                               &utm_medium=resend
                                               &utm_campaign=body-temple-launch
```

1. **Frontend** (`CycleBanner.jsx`) detects the UTM params on landing
2. Fires `POST /api/marketing/ref-hit` with `{utm_source, utm_medium, utm_campaign}` payload
3. Backend stores in `db.referral_hits` collection
4. Marketing agent can query `GET /api/admin/marketing/analytics` to see the conversion funnel

### Analytics aggregation (real numbers, queryable today)

```
GET /api/admin/marketing/analytics
  X-Admin-Token: <ADMIN_TOKEN>

Returns:
  total_hits, total_redemptions, conversion_rate,
  top_hits[],     # ranked by code/UTM
  top_redemptions[]
```

### Resend campaign tag (Resend dashboard side)

The email sender also tags every send with:
```
campaign: body-temple-launch
```

So Anna gets two sources of truth:
- **Resend dashboard**: open rate + click rate
- **Our backend**: landing rate + sign-in rate + conversion to paid

---

## 4 · Tone Coordination — Sara-voice validation checklist

When Anna provides the draft, run it through these **8 hard checks**. If ANY check fails, the email needs revision before send.

### ✅ Tone PASSES if:

1. **First sentence is observation, not action** — "I have watched how Aurin and Clarity have created moments in your home…" ✅ 
   ❌ Fails: "Click here to start your transformation!"

2. **Verb-tense is past or present continuous, never imperative** — "I have been thinking about you, too." ✅
   ❌ Fails: "Take control of your wellness today."

3. **Zero clinical / diagnostic words** — no "anxiety", "burnout", "stress relief", "self-care routine"
   ❌ Fails: "Body Temple 28 is clinically proven to reduce parental stress."

4. **One Socratic moment present** — at least one line invites the reader to notice, not act
   ✅ "…what your body has been quietly asking for."

5. **No urgency** — no "limited time", "ending Friday", "act now", "spots filling fast"
   ❌ Fails: "Only 12 spots left — claim yours!"

6. **Anna's signature appears as handwritten** — uses Caveat font OR signed as a real person (not "The Aurin Team")
   ✅ "Walk gently, Anna & Aurin" — handwritten Caveat-style ✅

7. **One quoted day from the curriculum** — establishes credibility softly via real product content
   ✅ Current draft quotes Day 8: "The first touch is the one you give yourself…"

8. **Optional pause-out at the bottom** — gives reader a no-shame exit
   ✅ "If you'd rather not hear about future quiet things, simply reply with 'pause'…"

### Anti-patterns to reject on sight

| Phrase                                  | Why it kills the brand                          |
|-----------------------------------------|-------------------------------------------------|
| "Mom hack"                              | Patronising; not how this audience speaks       |
| "Game-changer"                          | Sells transformation, not slowness              |
| "Limited time only"                     | Manufactured urgency                            |
| "Studies show"                          | Clinical credibility; we use lived credibility  |
| "You owe it to yourself"                | Guilt-leverage; opposite of house           |
| "Click below to start your journey"     | Generic SaaS CTA; flat tone                     |
| "Special offer for the first 100"       | FOMO; we operate in cycles, not flash sales     |
| "Reclaim your peace"                    | Aggressive; peace isn't reclaimed, it's noticed |

### The phrase that ALWAYS works (founder's voice)

> "I noticed…"
> "It occurred to me…"
> "There is something I have been quietly carrying for you…"
> "If this finds you tired today, that's the only credential needed."

---

## 5 · Marketing-agent next physical actions

In order of priority:

1. ✅ **DONE by E1**: Portal Body Temple CTA card live  
2. ✅ **DONE by E1**: UTM tracking wired end-to-end  
3. ⏳ **Founder action** (5 min): create dedicated LS variant for Body Temple, paste into `LEMONSQUEEZY_VARIANT_BODY_TEMPLE` env  
4. ⏳ **Marketing agent action**: send launch email draft for tone check using the 8-point checklist above  
5. ⏳ **Marketing agent action**: after first 100 sends, query `/api/admin/marketing/analytics` and report:
   - Open rate (Resend)
   - Click-through rate (Resend)
   - **/portal landing rate** (our backend)
   - **Sign-in rate** after landing (our backend)
   - **Paid conversion rate** (our backend)

---

## 6 · The 5% conversion hypothesis — what success looks like

Marketing agent quoted "validate the 5% conversion hypothesis." Here is how we'll measure it:

```
conversion_rate = paid_unlocks / portal_landings_from_email
```

Numerator: from `db.lemonsqueezy_purchases` filtered by `referer LIKE %portal?utm_source=email%`
Denominator: from `db.referral_hits` filtered by `utm_campaign=body-temple-launch`

**5% target = if 1000 parents receive the email, ~280 click through (28% CTR is reasonable for warm Resend list), and ~14 buy = 5% of email recipients OR ~5% of click-throughs (industry standard is 1-3% — so 5% would be excellent).**

I'll add a dashboard endpoint when the founder is ready. For now, the raw data is queryable.

---

## Summary

| Ask                                | Status | Notes                                                       |
|------------------------------------|--------|-------------------------------------------------------------|
| 1. Day 1 active via /portal        | ✅     | New CTA card on /portal, deep-links into Body Temple        |
| 2. $39 unlock operational          | ✅ *   | Works via existing First Step variant; dedicated LS variant TBD by founder |
| 3. Click → Day 1 tracking          | ✅     | UTM-aware ref-hit endpoint; analytics queryable today        |
| 4. Sara-tone validation checklist  | ✅     | 8-point checklist above; ready for draft review              |

**Everything technical is ready. Marketing agent: send the email draft and Anna's launch can fly.**

🛡️ — E1
