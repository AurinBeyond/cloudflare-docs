# Nano Banana — Room Background Image Prompts
**Status:** prompts ready, generation pending (next PR via integration_playbook_expert_v2)
**Target dir:** `/app/frontend/public/assets/rooms/`
**Output format:** PNG, 16:9, premium hero quality

---

## GRACE_ROOM — The Hearth
**Output file:** `grace-hearth.png` (replaces Atomsi mockup which had Estonian UI baked in)
**Source:** Founder, 2026-02, verbatim.

```
THE HEARTH — GRACE ROOM

Cinematic premium digital house.

Late evening atmosphere.

A large old window with rain running down the glass.

Warm fireplace glowing softly.

Deep navy blue shadows.

Warm amber and fireplace gold lighting.

One comfortable armchair facing the fireplace.

Bookshelves in the background.

Soft candlelight.

Quiet luxury aesthetic.

European library and salon inspiration.

No people.

No user interface.

No buttons.

No text.

No words.

No labels.

No logos.

No watermarks.

No screens.

No chat windows.

The image must feel peaceful, intimate, safe, reflective and timeless.

Color palette:
Deep Navy
Warm Amber
Fireplace Gold
Soft Copper

Ultra realistic.
Premium web application hero background.
16:9 composition.
High detail.
```

---

## ALISTAIR_ROOM — The Life Laboratory (placeholder — refine with founder)
**Output file:** `alistair-laboratory.png`

```
THE LIFE LABORATORY — ALISTAIR ROOM

Cinematic premium digital study.

Warm daylight atmosphere.

A large round window with nature outside — soft mountains, gentle forest, calm horizon.

Wooden research desk in the centre.

Open notebook, pencil, small lamp, leather-bound books, brass telescope, magnifying glass.

Plants and a brass compass.

Warm sand, soft gold, deep olive, natural wood tones.

Quiet European study aesthetic.

No people.

No user interface.

No buttons. No text. No labels. No logos. No watermarks. No screens.

The image must feel curious, calm, intellectual, observant, timeless.

Color palette:
Warm Sand
Soft Gold
Deep Olive
Natural Wood

Ultra realistic.
Premium web application hero background.
16:9 composition.
High detail.
```

---

## KAELAN_ROOM — The Observatory (founder spec, to be applied later)
**Output file:** `kaelan-observatory.png`

```
THE OBSERVATORY — KAELAN ROOM

Cinematic premium minimalist room.

Morning light atmosphere.

Large bright windows with nature outside.

One comfortable armchair, one mirror, one notebook on a side table.

Very minimalist — empty space dominates.

Pale linen, sand, soft gold accents.

Quiet luxury aesthetic.

No people. No user interface. No buttons. No text. No labels.

The image must feel clear, spacious, observant, light, timeless.

Color palette:
Pale Linen
Soft Sand
Morning Gold
Mirror Silver

Ultra realistic.
Premium web application hero background.
16:9 composition.
High detail.
```

---

## SARA_ROOM — The Family Table (founder spec, to be applied later)
**Output file:** `sara-table.png`

```
THE FAMILY TABLE — SARA ROOM

Cinematic warm domestic interior.

Late afternoon light.

A simple wooden family table set for tea — two cups, a small vase with garden flowers, a stack of books for children, a soft lamp.

Bread board, gentle clutter that feels lived-in, not staged.

Wooden chairs around the table.

Window with gentle garden outside.

Warm cream, soft moss, terracotta, oak tones.

No people. No user interface. No buttons. No text. No labels.

The image must feel safe, present, gentle, family-warm, timeless.

Color palette:
Warm Cream
Soft Moss
Terracotta
Oak

Ultra realistic.
Premium web application hero background.
16:9 composition.
High detail.
```

---

## Implementation (next PR)
1. Call `integration_playbook_expert_v2` with query: "Nano Banana image generation via Emergent LLM key"
2. Receive Python integration code.
3. Generate 4 images using prompts above (one at a time).
4. Save outputs to `/app/frontend/public/assets/rooms/` with the filenames listed.
5. Update `roomConfigs.js` to point each room's `heroImage` at the new file.
6. Verify smoke-test renders fine on each room.

No code changes are needed in `RoomShell.jsx` — the `heroImage` field already drives the rendering.
