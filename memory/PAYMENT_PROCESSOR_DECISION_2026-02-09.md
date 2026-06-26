# Payment Processor Decision — LemonSqueezy vs FastSpring vs Digistore24
*Created 2026-02-09 (iter 76b) · Strategic memo for Anna*

## TL;DR
- **LemonSqueezy** = current integration. **Weeks of silence on approval** is a real red flag, not normal.
- **FastSpring** = my recommended fallback / parallel application. Best fit for AI house brand + $500 ticket + Norwegian payout.
- **Digistore24** = REJECTED for brand reasons (make-money-online marketplace vibe contaminates the house positioning).

## Step 1 — Last-shot escalation letter to LemonSqueezy (send today)

```
Subject: Account review pending — soul-care AI platform with full safety architecture

Hello LemonSqueezy support,

I'm Anna, the founder of prulesoul.site — a calm AI companion platform
for adults and children. My merchant application has been pending review
for several weeks now with no human response, and I'd like to ask for a
direct review before considering other processors.

A few things that may help reviewers see the actual shape of the platform:

  1. Wanderer's Agreement (consent gate, v1.1, 2026-02-11)
     https://prulesoul.site/wanderers-agreement
     — Five mandatory clauses including explicit psychiatric-care
       exclusion. Visitors cannot enter the paid rooms without
       conscious tick-through.

  2. Refund-flag automation
     POST /api/refund-flag — backend automatically flags any voice
     session that crashes within 30 seconds AND happens to belong to a
     pass <5 min old. Manual founder review queue. Designed to
     pre-empt chargebacks, not enable them.

  3. AI safety disclaimer on every room
     https://prulesoul.site/clarity-release
     — Bottom-of-page text on every chat surface: "AI may speak
       imprecisely. Use your own judgement."

  4. Daily-minute cap on free / influencer codes
     /admin/comp gates prevent any single account from running away
     with cost. Influencer abuse is mathematically impossible above
     the cap.

  5. Reach Out — Resend-integrated support
     POST /api/reach-out — every wanderer gets a calm auto-reply and
     a real human (me) responds within 24h.

I run a clean, audit-trail-heavy operation. I would much rather work
with LemonSqueezy long-term than migrate. Could a human review my
account before week's end?

Happy to share my full Wanderer's Agreement PDF, compliance docs, or
hop on a call.

With warmth,
Anna · prulesoul.site
[your email]
```

**Send via:**
1. support@lemonsqueezy.com
2. Your dashboard → "Contact Support" → highest urgency tier
3. Twitter/X DM to @lmsqueezy (it works, founders sometimes answer)

## Step 2 — Parallel FastSpring application (start today)

Application takes 5-10 business days. **Do not wait for LemonSqueezy** — apply now so the option exists.

**Application URL:** https://fastspring.com/apply
**You'll need:**
- Business name + registered country (Norway)
- Website URL: prulesoul.site
- Brief product description: "AI-assisted reflective companion platform for emotional clarity. Subscription + minute-pack model. €500 / 60h flagship package."
- Estimated monthly volume (conservative: €5k-15k starter; honest)
- Tax ID / company registration

**Why FastSpring works for our case:**
| Factor | Why it matters |
|---|---|
| Norwegian payout supported | You're banked in Norway — they handle the FX cleanly |
| AI-friendly | Used by many Claude/GPT wrappers; not flagged like LS does |
| Human review during onboarding | Real account manager, not just a bot |
| API exposure | Same level as LS — we can port our `/api/lemonsqueezy/webhook` to FS in ~2-4h backend work |
| MoR (Merchant of Record) | They handle ALL international VAT, same as LS promised |
| Refund / chargeback handling | Active legal department backs you up |

**Fee math at our scale (€500 sub):**
- FastSpring: 5.9% + $0.95 → ~$30 / sale → $470 net
- LemonSqueezy: 5% + $0.50 → ~$25 / sale → $475 net
- Digistore24: 7.9% + $1 + $5-25 affiliate → $50-75 / sale → $425-450 net

**Difference is $5-10 per sale.** For brand safety + active human support, this is worth it.

## Step 3 — If FastSpring approves before LemonSqueezy

Migration path (~3-4h backend work):
1. Create FS products mirroring our LS products (€9 paid, €500 sub, custom top-ups)
2. Generate FS webhook signing secret → store in `/app/backend/.env` as `FASTSPRING_WEBHOOK_SECRET`
3. New endpoint `/api/fastspring/webhook` modelled on existing `/api/lemonsqueezy/webhook` (same logic: verify HMAC → resolve user → credit ledger → grant pass)
4. Switch checkout URLs in `/app/frontend/src/pages/ClarityRelease.jsx` from LS to FS
5. Keep LS webhook live for any in-flight subscriptions (don't kill the old plumbing)

## Why NOT Digistore24

Three brand-safety reasons that outweigh the marketplace benefit:

1. **Marketplace neighborhood** — Digistore24's catalog is dominated by:
   - "Make $10K/month with this funnel" courses
   - Weight-loss e-books
   - Crypto signal services
   - "Manifest your dream life" workbooks
   - Adjacent products on the marketplace would tag our brand by association.

2. **Affiliate quality** — The CPA affiliates who'd promote a $500/mo subscription
   on Digistore are largely the same media-buyers who run aggressive
   Facebook/TikTok ad campaigns. Risk: "THIS AI WILL HEAL YOUR DEPRESSION"
   ad runs at scale → wrong customer arrives → refund storm → brand burned.

3. **GPT recommended BlackHatWorld** — That is literally the SEO/affiliate
   community known for grey/black-hat techniques. Recommending it for
   a soul-care brand is a category error. Any domain linked from BHW
   risks Google trust penalties.

**Conclusion:** Skip Digistore24 entirely. If you want affiliate-style
distribution later, build the OWN $5 referral system (already on the P1
backlog) where real parents recommend the platform to real friends. That
matches the brand. CPA affiliate networks do not.

## Decision tree

```
LS responds within 7 days?
  ├── YES → Stay on LS. Close FS application politely.
  └── NO  → Use FS application result.
             ├── FS approved → Migrate (~3-4h backend work)
             └── FS pending  → Wait. Don't migrate to Digistore.
                                  Send LS one more escalation,
                                  consider Paddle (third option, similar to FS).
```

## P1 ranking unchanged (LS/FS decision is parallel, not blocking)

1. P1 — $5 Referral viral loop (parent-to-parent — builds regardless of processor)
2. P1 — Custom Top-up slider (€0.60/min, 10-min min)
3. P1 — "Anna's small letter" weekly Friday digest email
4. (Background) — LS escalation + FS application

The product can ship referral + top-up + email digest on EITHER LS or FS
without rebuild. Webhook handler is the only file that differs.
