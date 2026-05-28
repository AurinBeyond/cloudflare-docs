# The Broken Clockwork — 28-Day Sara Protocol (DRAFT BLUEPRINT)

**Status:** DRAFT · awaiting founder approval before SEED_COURSES integration
**Curator:** Sara (Parents' Compass · East · 90°)
**Type:** Protocol-Library course · 28 transmissions · 24-hour cadence-lock
**Target audience:** High-net-worth parents whose teens have begun signalling
trust-collapse — broken-promise trauma, transactional parenting fallout,
emotional withdrawal, voluntary system crashes.

This is the **founder's content blueprint**, not yet code. When approved,
the entry below will be inserted into `SEED_COURSES` in `server.py` with
`language: "en"` (or kept as `language: "draft"` for staged release).

---

## Course-level metadata (proposed)

```python
{
    "slug": "the-broken-clockwork",
    "title": "The Broken Clockwork",
    "audience": "adult",
    "duration_days": 28,
    "blurb": (
        "A 28-day Sara protocol for the parent whose business-clock "
        "and home-clock have stopped agreeing. One transmission per "
        "24 hours. No binge. No catch-up. The cadence is the lesson."
    ),
    "price": 89.0,
    "lemonsqueezy_variant_id": None,    # fill on Polar switchover
    "audio_companion": "/assets/audio/courses/broken-clockwork.mp3",
    "audio_title": "The clock you cannot bend",
    "language": "draft",                # promote to "en" when ready
    "letters": [ ... 28 entries below ... ]
}
```

---

## Arc structure (4 acts × 7 days)

| Days | Act | Diagnostic frame |
|---|---|---|
| 1–7 | **Read the System** | Name the Transactional Parenting pattern in your own household. No fixing yet. |
| 8–14 | **Find the Anchor** | Discover where you, the parent, lost direct emotional bandwidth — and why. |
| 15–21 | **Install the OS** | Install the Anchor OS protocols: presence-without-promise, repair-without-purchase. |
| 22–28 | **Hold the Clock** | Live the new cadence under load. Architect the home's clock so it never breaks again. |

---

## 28 letter titles (founder to author the body text)

### Act I · Read the System
1. **The currency of attention** — what you pay your child in
2. **The promise that died on a Tuesday** — Value Flip anatomy
3. **The carousel that spins for no one** — Privilege Isolation
4. **What the teen heard when the call came** — the silent contract
5. **Three broken cycles equals firmware** — Anticipated Crash
6. **You did not raise a stranger. You raised a survivor.** — reframing
7. **The cost of compensating with objects** — the cold inheritance

### Act II · Find the Anchor
8. **Where your own clock was set** — your inherited cadence
9. **The founder's loneliness** — high-bandwidth solitude
10. **What you outsourced and what you kept** — the asset audit
11. **The pre-emptive armor your teen built** — sensors offline
12. **What a thirty-second presence weighs** — micro-anchor proof
13. **The first promise you will keep small** — calibrated honesty
14. **End of Act II — a quiet pause day** — no new instruction

### Act III · Install the OS
15. **Presence without promise** — protocol α
16. **Repair without purchase** — protocol β
17. **The non-reactive Anchor** — protocol γ
18. **How to be the stable hardware** — protocol δ
19. **The clock you do not bend, and the one you do** — boundary geometry
20. **When the teen tests the new OS** — load-handling
21. **End of Act III — one sentence the teen can quote you on** — landing

### Act IV · Hold the Clock
22. **Day one of the new cadence** — the test begins
23. **What the business says when it loses fifteen minutes** — load-balancing
24. **The friend who is not the parent** — boundary lock
25. **The Sunday hour you do not move** — architectural fixed point
26. **When the old pattern returns (because it will)** — recovery protocol
27. **What you now hear in the silence** — the new signal
28. **The Clock Is Yours** — closing transmission

---

## Authorial register lock (Matrix Aurin overlay)

Every letter MUST:
- Open with one sharp diagnostic frame (no "Hello, parents").
- Hold the biomechanical register — "Anchor OS", "cadence-gate",
  "value flip", "system reboot", "firmware".
- Carry **one** small evening protocol (a single line of action),
  never a multi-step worksheet.
- Close with a quiet sentence the parent can hold for 24 hours
  before the next gate opens.
- Reference the three Sara blueprints (White Fence Syndrome,
  Golden Carousel, Broken Clockwork) only by mechanism — never by
  name.

Each letter ~ 400–550 words. Same calibration as Alistair's existing
courses. No t.A.T.u. citations in the prose itself.

---

## Next action for founder

When you are ready:
1. Author the 28 letter bodies (or 7 to start, drip the rest).
2. Reply: *"Promote The Broken Clockwork to SEED_COURSES (`language: en`)."*
3. Agent will insert the dict into `server.py` with the canonical Python
   structure, run lint, regenerate the Polar SKU mapping, and ship.

Until then, this file is the single source of truth for the course. No
code wiring, no commitments, no leaks into the public API.
