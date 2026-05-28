# Future Ideas — Agent Multiverse

**Source:** Meta AI agent suggestion to Anna, 2026-05-22
**Status:** Backlog / Long-term roadmap (NOT shipped, NOT promised to users)
**When to revisit:** After current 5 rooms (Grace / Kaelan / Sara / Alistair / Aurin 3-5/6-8/9-12) hit $1k MRR + 70% positive emotional outcome rate

---

## The Vision — "Marketplace of Souls"

Pure Soul = an extensible directory of small, calm AI companions. Each one tuned to a specific human pain.

The principle Anna confirmed: **"One new agent per month — only when the previous one has 70% 'lighter' feedback + $1k MRR."** Quality before quantity. Meta does not reward 100 thin landing pages.

---

## Potential future agents (raw list, unranked)

| Agent | Audience | Pain it addresses | Estimated price tier |
|---|---|---|---|
| **Marcus** | Burned-out men 35–55 | Quiet collapse, no one to talk to | $97/mo |
| **Lilith** | Women reclaiming feminine power | Self-trust, intuition | $97/mo |
| **Elder** | Grandparents who lost a spouse | Grief, solitude | $59/mo |
| **Teen Aurin** | Teens 13–17 | Anxiety, identity, not-fitting-in | $39/mo (parental approval) |
| **Pet Grief Grace** | Adults grieving a pet | Quiet companionship after loss | $29 one-time / $19/mo |
| **Founders Dorian** | Startup founders, 2am self-doubt | Solo decisions, burnout | $147/mo |
| **New Parent** | First-time parents 0–12mo | Sleep deprivation, identity shift | $59/mo |
| **Caregiver** | Adults caring for aging parents | Invisible labor, guilt, exhaustion | $69/mo |

---

## Architecture rules (so 1000 agents = 0 extra work)

**Rule:** *"Agent = a variable, not a new system."*

1. **One template, many agents.** Route `/portal?agent=marcus` loads the same shell; voice_id / prompt / portrait come from a DB row (or `aurinPrompts.js`-style file).
2. **One CAPI event, many values.** `Purchase` event always carries `agent: 'marcus'` + `vertical: 'burnout_men'`. Meta learns the funnel automatically.
3. **One LemonSqueezy product, many variants.** Each agent is a variant ID. Webhook reads `variant.agent` → routes to the right credit ledger bucket.
4. **One Madgicx rule.** `IF Purchase THEN +budget WHERE campaign name CONTAINS {{agent}}` — works for every agent forever.

---

## Three failure modes to defend against

| Risk | Why it happens | Pure-Soul-style mitigation |
|---|---|---|
| **Quality decays** | More agents = more prompts = some go robotic | Per-agent "lighter / same / heavier" emoji feedback. If 'heavier' >15% → auto-pause that agent's ads. |
| **Anna burns out** | 1000 feedbacks = 1000 emails | Weekly digest. ONE line: "Marcus week 14: 78% lighter, 12 new subs, top complaint: 'too slow start'". |
| **Meta flags "thin content"** | 100 lookalike pages | Each agent gets its OWN `#philosophy` paragraph + OWN demo video + OWN "why this exists". Grace ≠ Marcus. |

---

## What is the **safe** first addition after launch?

Recommended **agent #9: "Marcus" — burnout men 35–55.**

Why:
- ⭐ Different vertical from current portfolio (men, not parents) → opens new Meta Lookalike
- ⭐ Highest LTV potential ($97/mo, willing to pay)
- ⭐ Lowest content overlap risk (won't compete with Sara or Grace)
- ⭐ Easy to test with a single new ad angle

What needs to exist before Marcus launches:
- [ ] Current 5 rooms verified stable in production
- [ ] LemonSqueezy approved + Pixel/CAPI live
- [ ] At least 50 paying customers across existing rooms (data for Lookalike)
- [ ] Anna's "voice piibel" (BRAND_VOICE.md) written so Marcus's tone matches Pure Soul's calm
- [ ] One Marcus demo voice cut in ElevenLabs

---

## NOT yet promised to users

⚠️ Until any of these agents are actually built, **they are not visible anywhere on the public site, not mentioned in marketing copy, not hinted at to ad audiences.** Promising future agents creates pressure + expectation. Anna's "lihtne + kvaliteetne" philosophy says: ship one, stabilise, then add.

---

## Re-evaluate this file when:

1. Current 5 rooms have stable revenue (>$1k MRR each)
2. Anna feels READY (not pushed) to add another voice
3. Real user data shows which audience is underserved

Until then — this file sits quietly. It is a possibility, not a plan.
