# Polar PSP-Safe Language Lock

**Status:** 🔒 LOCKED · 2026-02-12
**Reason:** Polar underwriting flagged the platform's product
descriptions when the previous language ("AI companion for kids",
"children chat with AI", "emotional AI for children", "Aurin
storyteller voice", "fairytale") was submitted. The Polar review
turned red on the children's tier.
**Author:** Founder (Anna) brief 2026-02-12 + AH agent applied across
backend Polar catalogue + frontend BundleDisclosure + KidsDayPassRow.

> This file is the third Brand Voice Lock — alongside
> `BRAND_VOICE_LOCK.md` and `MEMBERSHIP_ARCHITECTURE_v2.3.1_PATCH.md`.
> Any future agent (this one or any successor) MUST read this file
> before touching:
>   - Polar product descriptions (`scripts/create_polar_products.py`)
>   - `BundleDisclosure.jsx` body copy
>   - `KidsDayPassRow.jsx` body copy
>   - Any visitkaardi (room intro) page that mentions the children's tier
>   - Any GA4 event name that touches the children's funnel

---

## ❌ FORBIDDEN PHRASES (PSP risk-flag triggers)

Never use any of these in:
- Polar product names or descriptions
- Public website body copy
- GA4 event labels
- Webhook acknowledgement emails
- Subdomain or URL slugs
- App Store / Play Store descriptions (future)

| Phrase | Why |
|--------|-----|
| "AI companion for kids" | classifies as high-risk emotional AI |
| "AI friend" | child-AI relationship implication |
| "children chat with AI" | direct child↔AI communication framing |
| "emotional AI for children" | mental-health adjacency |
| "AI therapist" | regulated medical category |
| "talk to AI" (in any child context) | reinforces direct child↔AI dialogue |
| "AI listens to your child" | parental-monitoring concern |
| "kids dialogue with AI" | same as above |
| "AI for emotional support" | mental-health regulated |
| "AI tutoring" (without parent-mediation framing) | EdTech under-13 regulated |
| "fairytale" (in product descriptions) | childlike-magical adjacency to AI companion register |

---

## ✅ SAFE PHRASES (use these instead)

The platform's children's tier is **parent-guided storytelling and
creative activities**, NOT direct AI companion. Frame everything
that way.

| Use this | Instead of |
|----------|------------|
| "Parent-guided bedtime storytelling" | "AI bedtime companion" |
| "Calm audio stories" | "AI-generated fairytales for kids" |
| "Drawing prompts" | "AI suggests drawings" |
| "Guided imagination exercises" | "AI imagination companion" |
| "Creative family activities" | "AI activity for kids" |
| "Outdoor family activities" | "AI suggests outdoor play" |
| "Calm parent-child interaction" | "AI talks to your child" |
| "Educational prompts" | "AI teacher for kids" |
| "Family participation" | "kids using AI" |
| "Audio sessions" | "AI voice minutes" |
| "Curator audio session" | "AI voice chat" |
| "Curator letters" | "AI messages" |
| "Live curator dialogue for adults" | "AI chat" |
| "Audio meditation archive" | "AI-generated meditations" |
| "Verified parent account" | (always include this framing for child tiers) |
| "Storytelling and educational prompts only" | (use as a coda for child tier descriptions) |

---

## 📋 Reference: locked product descriptions in Polar

These are the **exact** descriptions currently live in the Polar
production catalogue (org `bac24e92-f176-4ce0-8337-236c62b5b013`)
after the 2026-02-12 PSP-safe rewrite. Future agents updating
descriptions must keep this register or stronger:

| SKU bundle | Description (locked) |
|-----------|----------------------|
| `quiet_entry` | A reading house for adults. All four cardinal rooms in read mode, the daily cadence stream of curator letters, and access to the full archive of essays and audio meditations. |
| `aurin_storyteller` | Parent-guided bedtime storytelling and creative family experiences. Calm audio stories, drawing prompts, and guided imagination exercises for one child profile under a verified parent account. Storytelling and educational prompts only. |
| `inner_compass` | The platform's heart. Live curator dialogue for adults, memory continuity across sessions, and the full essay and audio archive. |
| `house_compass` | A family operating system. The adult house plus parent-guided bedtime storytelling and creative activities for up to three child profiles. Two separate wallets keep adult dialogue and child storytelling independent. |
| `sovereign_standard` | A privately provisioned tenant. One curator tuned to the member's context. Higher fair-use ceilings, priority routing, earlier access to new rooms. By application. |
| `sovereign_bespoke` | All four curators tuned. The deepest privilege tier. Up to five child profiles for parent-guided bedtime storytelling within one family. By application. |
| `day_kids` | A quiet bedtime passage. One calm audio story plus one parent-guided check-in. Twenty-four hours of access. No subscription. Storytelling only. |
| `day_quiet` | Twenty-four hours of reading-house access for adults. Thirty minutes of curator audio session. No subscription. |
| `day_deep` | Twenty-four hours of full Compass access for adults. Sixty minutes of curator audio session. No subscription. |
| `topup_adult` | Prepaid curator audio session package for adults. Extends the current Compass cycle with additional dialogue minutes. |
| `topup_kids` | Prepaid bedtime storytelling minutes for the parent-guided child layer. Applies to the storytelling wallet only. |
| `topup_daypass` | Extends an active day pass by thirty minutes of curator audio for adults. Same twenty-four-hour window. |

---

## 📞 If Polar (or any PSP) asks for written attestation

The following paragraph is the **canonical statement** to submit to
Polar / Stripe / any underwriter in a children's-tier review:

> "All children's services on Matrix Aurin are accessed exclusively
> through a verified parent account. Children never register or sign in
> directly. We do not process children's payment data. The children's
> tier consists of parent-guided storytelling, drawing prompts, guided
> imagination exercises, and educational prompts delivered as calm
> audio content alongside the bedtime ritual. We do not market the
> service as an "AI companion", "AI friend", or any form of emotional-
> support or mental-health product. Audio is generated server-side and
> delivered to the parent's device; no live audio recording of the
> child is retained. Photos in the children's private album are
> KMS-encrypted at rest and require the parent's password re-
> confirmation per upload. We comply with GDPR-K and CPRA child-data
> rules; data retention windows are documented in our privacy notice."

---

## 🛡️ When to invoke this lock

Before any of the following actions, the agent MUST re-read this file:

- Updating any Polar product description
- Drafting marketing email copy (Resend transmissions)
- Writing GA4 event names
- Composing any landing-page hero or sub-headline
- Drafting App Store / Play Store metadata
- Writing PSP / KYC review responses
- Creating new SKUs in Polar
- Writing any Sovereign Circle application form copy
- Composing waitlist welcome emails

---

**End of Polar PSP Safe Language Lock · 2026-02-12 · LOCKED.**
