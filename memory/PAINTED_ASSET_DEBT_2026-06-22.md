# Painted-Asset Visual Debt · 2026-06-22

These are visual flaws identified in the Iteration-86 lux audit that
**cannot be fixed in code** because they live inside founder-painted
hub/world image assets. We deliberately defer them; the chosen path
when we return is to regenerate the affected paintings via Nano
Banana, NOT to mask them in CSS.

> Founder verdict (2026-06-22):
> *"siis me hetkel ei muuda seda ja jätame selle kui võla, tuleme
> selle kriitilise osa juurde hiljem tagasi."*

---

## 🔴 P0 — Identity-tone violations

### SARA HUB · wellness-pill row (bottom of painting)
- Asset: `HUB_IMAGE` (Sara Hub painted hub asset)
- Baked text row: **"Trustworthy · Compassionate · Practical · Inspiring · Growth-Oriented"**
- Why it's a problem: classic anti-wellness lock violation; reads as a feature pitch on a page whose entire job is *not* to pitch.
- Recommended new version when we regenerate: either a single Sara-voice line ("Sara · in the quiet between moments") or remove the row entirely and let the wreath of leaves carry the bottom.

### SARA HUB · double "Chat with Sara" CTA
- Asset: same `HUB_IMAGE`
- Both the central nest button **and** the top-right Sara avatar card carry the words "Chat with Sara"; the visual weight of two CTAs lowers each one.
- Recommended new version: keep only the central pesa CTA; the top-right Sara portrait stays as a face (no repeated label).

### SARA HUB · "Your guide for every parenting moment ❤️"
- Asset: same `HUB_IMAGE`
- Anti-wellness-adjacent phrasing + emoji ❤️ inside a watercolour aesthetic.
- Recommended new version: *"Sara · in the quiet between moments"* (no emoji).

---

## 🟡 P1 — Stale copy from the "pre-nest" era

### W1 / W2 / W3 / W4 painted-world plaque: "This world is being painted. Return when the colour has settled."
- Assets: each Wider Circle painted world (`WorldWhatCannotBeReplaced.jsx` → `mghwh6or_image.png`, and the three sister worlds).
- Why it's a problem: this copy made sense when the 6 nests were empty stubs. Now all 24 Wider Circle nests are live; the plaque tells the visitor the wrong story.
- Recommended new version when we regenerate (per world): something like *"This world is open. Step into any nest, or speak with Sara in the harbour."*

### Wider Circle Hub · "Choose a world below and explore one question at a time."
- Asset: the Wider Circle Hub painting.
- Why it's a problem: instructional voice in a space that should feel like a story.
- Recommended new version: omit the line entirely; the four world-cards do the work.

---

## How we will resolve these (when capacity returns)

1. Founder picks which paintings to regenerate first (priority order suggested above).
2. We brief Nano Banana with the exact watercolour palette + structural locks already documented in PRD §SARA-VISUAL-SYSTEM-LOCK.
3. We compare the regenerated version against the current asset side-by-side (similar to `/test_nest_images/w1_time_compare.html`).
4. Founder locks the chosen variant.
5. We update the asset URL constant in the relevant file; the routes and click-zones stay identical.

## Until then
- The audit findings remain accurate.
- We do **not** mask, blur, or CSS-overlay these baked elements.
- We do **not** rewrite copy that the visitor cannot see (i.e. JS strings that no longer render are NOT a fix).
