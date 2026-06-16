# BODY WORLD — SOURCE OF TRUTH AUDIT
**Locked: 2026-02-13**
**Method:** vision verification of every painted asset against LOCK config in
`/app/frontend/src/data/bodyWorldStones.js` + route config in
`/app/frontend/src/pages/BodyWorld.jsx` & `BodyWorldStone.jsx`.

For every stone we check 5 layers:
```
Painted IMAGE (what user sees)
    ↓
STONE slug + LOCK title (in code)
    ↓
ROUTE (URL)
    ↓
WORLD PAGE (background image rendered)
    ↓
CONTENT (sub-stone titles + topic pages)
```

A row passes audit only if ALL 5 layers carry the SAME concept.

---

## 1. HUB · `/body-world`

| Field | Value |
|---|---|
| Painted image | `9ndllntz_…21_05_25.png` |
| Painted reads | "Body World Hub" + 15 stones |
| Code expects | 14 stones |
| Status | ❌ **VISUAL DEBT — painted 15 stones, 4 stones mislabelled** |

### Hub label mismatches (painted vs LOCK):

| Hub painted | LOCK title (route slug) | Severity |
|---|---|---|
| 1 KNOW YOUR BODY | Know Your Body (`know-your-body`) | ✅ match |
| 2 EMOTIONAL BODY | Emotional Body (`emotional-body`) | ✅ match |
| 3 BODY MEMORY & INHERITANCE | Body Memory & Inheritance (`body-memory`) | ✅ match |
| 4 BODY IDENTITY | Body Identity (`body-identity`) | ✅ match |
| 5 BODY PROTECTION MECHANISMS | Body Protection Mechanisms (`body-protection`) | ✅ match |
| 6 BODY AS A PARTNER | Body as a Partner (`body-as-partner`) | ✅ match |
| 7 BODY ENGINEERING | Body Engineering (`body-engineering`) | ✅ match |
| 8 BODY & RELATIONSHIPS | Body & Relationships (`body-relationships`) | ✅ match |
| 9 BODY & ENVIRONMENT | Body & Environment (`body-environment`) | ✅ match |
| 10 BODY & TIME | Body & Time (`body-time`) | ✅ match |
| **11 BODY & JOY** | Stress & Nervous System (`stress-nervous-system`) | ❌ wrong topic |
| **12 BODY AS VERBAL LANGUAGE** | Body as Language (`body-language`) | ⚠ near-match |
| **13 LIVING OR SURVIVING** | Growth & Transformation (`growth-transformation`) | ❌ wrong topic |
| **14 CONSEQUENCES** | Living or Surviving (`living-or-surviving`) | ❌ wrong topic |
| **15 BODY ATTENTION** | *(no stone — extra)* | ❌ orphan |

**Resolution required:** Regenerate Hub painting with 14 correct stones, OR live with visual debt at Hub level until next render pass.

---

## 2. PER-STONE WORLD PAGES · `/body-world/world/:slug`

For each stone we verify:
- **A** = Painted "STONE N OF 14" label
- **B** = Painted world title vs LOCK title
- **C** = Painted sub-stone names vs LOCK sub-stone names
- **D** = Route resolves to correct world

### STONE 1 · Know Your Body
| Layer | Value | Status |
|---|---|---|
| Painted | STONE 1 OF 14 · KNOW YOUR BODY · 6 sub-stones | — |
| LOCK    | n=1 · `know-your-body` · 6 sub-stones | — |
| Route   | `/body-world/world/know-your-body` | ✅ |
| Sub-stones | RECOGNIZE / LISTEN / UNDERSTAND SIGNALS / BODY PATTERNS / ENERGY MAP / BODY AWARENESS | ✅ all 6 match LOCK |
| **Verdict** | ✅ **FULL MATCH** | |

### STONE 2 · Emotional Body
| Layer | Value | Status |
|---|---|---|
| Painted | STONE 2 OF 14 · EMOTIONAL BODY · 6 sub-stones | — |
| LOCK    | n=2 · `emotional-body` · 6 sub-stones | — |
| Route   | `/body-world/world/emotional-body` | ✅ |
| Sub-stones | RECOGNIZE / UNDERSTAND / THE WEIGHT WE CARRY / RELEASE / FREEDOM / INTEGRATION | ✅ all 6 match LOCK |
| **Verdict** | ✅ **FULL MATCH** | |

### STONE 3 · Body Memory & Inheritance
| Layer | Value | Status |
|---|---|---|
| Painted | STONE 3 OF 14 · BODY MEMORY & INHERITANCE · 7 sub-stones | — |
| LOCK    | n=3 · `body-memory` · 7 sub-stones | — |
| Route   | `/body-world/world/body-memory` | ✅ |
| Sub-stones | ANCESTRAL STORIES / INHERITED PATTERNS / PROTECTIVE LEGACIES / UNRESOLVED TRAUMA / HEALING THE LINEAGE / CHOOSING MY LEGACY / GENERATIONAL CONNECTION | ✅ all 7 match LOCK |
| **Verdict** | ✅ **FULL MATCH** | |

### STONE 4 · Body Identity
| Layer | Value | Status |
|---|---|---|
| Painted | "4 OF 14" · BODY IDENTITY · 6 sub-stones | ⚠ painted reads "4 OF 14" not "STONE 4 OF 14" (style nit) |
| LOCK    | n=4 · `body-identity` · 6 sub-stones | — |
| Route   | `/body-world/world/body-identity` | ✅ |
| Sub-stones | SELF-WORTH / BODY IMAGE / AGING / COMPARISON / SELF-ACCEPTANCE / BECOMING YOURSELF | ✅ all 6 match LOCK |
| **Verdict** | ✅ **FULL MATCH** (style nit on header) | |

### STONE 5 · Body Protection Mechanisms ⚠
| Layer | Value | Status |
|---|---|---|
| Painted | **STONE 5 OF 15** · BODY PROTECTION MECHANISMS · 7 sub-stones | ❌ number says "OF 15" — old version |
| LOCK    | n=5 · `body-protection` · 7 sub-stones | — |
| Route   | `/body-world/world/body-protection` | ✅ |
| Sub-stones | FIGHT RESPONSE / FLIGHT RESPONSE / FREEZE RESPONSE / PLEASING RESPONSE / CONTROL RESPONSE / HEALTHY BOUNDARIES / SAFETY IN THE BODY | ✅ all 7 match LOCK |
| **Verdict** | ⚠ **CONTENT MATCH, PAINTED NUMBER MISMATCH** ("OF 15" needs re-render to "OF 14") | |

### STONE 6 · Body as a Partner ⚠
| Layer | Value | Status |
|---|---|---|
| Painted | "6" · BODY AS A PARTNER · 8 sub-stones | — |
| LOCK    | n=6 · `body-as-partner` · 8 sub-stones | — |
| Route   | `/body-world/world/body-as-partner` | ✅ |
| Sub-stones | LISTENING TO MY BODY / TRUSTING MY SIGNALS / DAILY DIALOGUE / RESPECTING LIMITS / **BODY WISOM** / COOPERATION INSTEAD OF CONTROL / REPAIRING THE RELATIONSHIP / LIVING AS PARTNERS | ⚠ painted typo: "WISOM" (should be "WISDOM") |
| **Verdict** | ⚠ **CONTENT MATCH, painted typo on sub-stone 5** | |

### STONE 7 · Body Engineering
| Layer | Value | Status |
|---|---|---|
| Painted | "7 OF 14" · BODY ENGINEERING · 8 sub-stones | — |
| LOCK    | n=7 · `body-engineering` · 8 sub-stones | — |
| Route   | `/body-world/world/body-engineering` | ✅ |
| Sub-stones | MOVEMENT FOUNDATIONS / NUTRITION INTELLIGENCE / REST & RECOVERY SYSTEMS / DAILY RITUALS & ROUTINES / ALIGNMENT & POSTURE / BODY CARE & MAINTENANCE / PERFORMANCE & OPTIMISATION / TRACK & REFINE | ✅ all 8 match LOCK |
| **Verdict** | ✅ **FULL MATCH** | |

### STONE 8 · Body & Relationships
| Layer | Value | Status |
|---|---|---|
| Painted | STONE 8 OF 14 · BODY & RELATIONSHIPS · 8 sub-stones | — |
| LOCK    | n=8 · `body-relationships` · 8 sub-stones | — |
| Route   | `/body-world/world/body-relationships` | ✅ |
| Sub-stones | SAFE CONNECTIONS / EMOTIONAL CONTAGION / BOUNDARIES IN RELATIONSHIPS / NERVOUS SYSTEM CO-REGULATION / CONFLICT AND THE BODY / TRUST AND OPENNESS / RELATIONSHIP PATTERNS / HEALTHY SUPPORT SYSTEMS | ✅ all 8 match LOCK |
| **Verdict** | ✅ **FULL MATCH** | |

### STONE 9 · Body & Environment
| Layer | Value | Status |
|---|---|---|
| Painted | "9 OF 14" · BODY & ENVIRONMENT · 8 sub-stones | — |
| LOCK    | n=9 · `body-environment` · 8 sub-stones | — |
| Route   | `/body-world/world/body-environment` | ✅ |
| Sub-stones | LIGHT & DARK / AIR & BREATH / NOISE & SILENCE / NATURE & NATURAL RHYTHMS / SPACE & SURROUNDINGS / WATER & HYDRATION / FOOD ENVIRONMENT / CHEMICAL & TOXIC LOAD | ✅ all 8 match LOCK |
| **Verdict** | ✅ **FULL MATCH** | |

### STONE 10 · Body & Time
| Layer | Value | Status |
|---|---|---|
| Painted | STONE 10 OF 14 · BODY & TIME · 8 sub-stones | — |
| LOCK    | n=10 · `body-time` · 8 sub-stones | — |
| Route   | `/body-world/world/body-time` | ✅ |
| Sub-stones | CIRCADIAN RHYTHM / ULTRADIAN RHYTHMS / MENSTRUAL & HORMONAL CYCLES / SEASONS OF LIFE / PATIENCE & TIMING / RITUALS & RHYTHMIC LIVING / TIME MANAGEMENT FOR WELL-BEING / HONOURING NATURAL TIME | ✅ all 8 match LOCK |
| **Verdict** | ✅ **FULL MATCH** | |

### STONE 11 · Stress & Nervous System ✅ (LOCK realigned 2026-02-13)
| Layer | Value | Status |
|---|---|---|
| Painted | STONE 11 OF 14 · STRESS & NERVOUS SYSTEM · 7 sub-stones | — |
| LOCK    | n=11 · `stress-nervous-system` · 7 sub-stones | — |
| Route   | `/body-world/world/stress-nervous-system` | ✅ |
| Sub-stones | Stress Response / Nervous System Basics / The Body Keeps the Score / Regulation Tools / Vagus Nerve & Safety / From Survival to Thriving / Integration | ✅ all 7 match LOCK |
| Legacy content | `legacyAudio` (Radical Pause) + `legacyQuiz` (Honesty Quiz) now on sub-stone 4 "Regulation Tools" | ✅ |
| **Verdict** | ✅ **FULL MATCH** — LOCK realigned to painted asset. 7th hotspot ("Integration") needs `?debug=1` slot calibration (HEX_SLOTS only ships 6 positions; same Field Study calibration debt as Stones 3 and 5). |

### STONE 12 · Body as Language
| Layer | Value | Status |
|---|---|---|
| Painted | "12 OF 14" · BODY AS LANGUAGE · 8 sub-stones | — |
| LOCK    | n=12 · `body-language` · 8 sub-stones | — |
| Route   | `/body-world/world/body-language` | ✅ |
| Sub-stones | POSTURE & PRESENCE / FACIAL EXPRESSIONS / GESTURES & MOVEMENT / VOICE & TONE OF THE BODY / NON-VERBAL AWARENESS / IMPACT & IMPRESSION / AUTHENTIC EXPRESSION / CONNECTION THROUGH BODY | ✅ all 8 match LOCK |
| **Verdict** | ✅ **FULL MATCH** | |

### STONE 13 · Growth & Transformation
| Layer | Value | Status |
|---|---|---|
| Painted | STONE 13 OF 14 · GROWTH & TRANSFORMATION · 8 sub-stones | — |
| LOCK    | n=13 · `growth-transformation` · 8 sub-stones | — |
| Route   | `/body-world/world/growth-transformation` | ✅ |
| Sub-stones | EMBRACING CHANGE / LEARNING & GROWING / STEPPING OUT OF COMFORT / HEALING & RENEWAL / ALIGNING WITH MY PURPOSE / BUILDING NEW HABITS / OVERCOMING FEAR / CELEBRATING PROGRESS | ✅ all 8 match LOCK |
| **Verdict** | ✅ **FULL MATCH** | |

### STONE 14 · Living or Surviving ✅ (LOCK realigned 2026-02-13)
| Layer | Value | Status |
|---|---|---|
| Painted | STONE 14 OF 14 · LIVING OR SURVIVING · 9 sub-bubbles | — |
| LOCK    | n=14 · `living-or-surviving` · 9 sub-bubbles | — |
| Route   | `/body-world/world/living-or-surviving` | ✅ |
| Sub-bubbles | Choosing Life / Letting Go of Survival Patterns / Trusting the Flow / Expansion & Possibility / Joy & Aliveness / Purpose & Meaning / Courage to Be Myself / Freedom in the Body / Living in Presence | ✅ all 9 match LOCK |
| Legacy content | `legacyAdultPattern: pattern-postponed` now on bubble 2 "Letting Go of Survival Patterns"; `legacyMoodReflect: kaelan` now on bubble 9 "Living in Presence" | ✅ |
| **Verdict** | ✅ **FULL MATCH** — LOCK realigned to painted asset. Bubble hotspot positions need `?debug=1` calibration to match new bubble cluster geometry. |

---

## 3. AUDIT SUMMARY (post-realignment 2026-02-13)

| Audit category | Count | Stones |
|---|---|---|
| ✅ **FULL MATCH** (all 5 layers aligned) | **12 / 14** | 1, 2, 3, 4, 7, 8, 9, 10, **11**, 12, 13, **14** |
| ⚠ **COSMETIC** (content match, painted typo/old number) | **2 / 14** | 5 ("of 15"), 6 ("WISOM" typo) |
| ❌ **STRUCTURAL** mismatch | **0 / 14** | — (resolved by LOCK realignment) |
| ❌ **HUB** (15 stones, 4 wrong labels + 1 orphan) | **1 / 1** | Hub (awaiting new painting) |

**Routes (`/body-world/world/:slug` → world page → topic page) are 100% correct in code.**
Remaining mismatches are at the **painted-text** layer only (Hub + 2 cosmetic).

---

## 4. RESOLUTION OPTIONS

Each mismatch has 3 ways to resolve. Founder must pick one per stone.

### For HUB:
- **A)** Re-render the Hub painting with the 14 correct LOCK names (replaces `9ndllntz_…`)
- **B)** Keep current painting → live with the 4 wrong labels until next major release
- **C)** Re-render Hub at later milestone, mark current Hub as "v1 cover art"

### For Stone 5 ("OF 15"):
- **A)** Re-render Stone 5 painting with "STONE 5 OF 14" label
- **B)** Keep — only the "OF 15" number is off, content is correct
- **C)** Defer to next render pass

### For Stone 6 ("WISOM" typo):
- **A)** Re-render Stone 6 painting with "BODY WISDOM" correct spelling
- **B)** Keep — typo is on painted image only, code uses "Body Wisdom"
- **C)** Defer to next render pass

### For Stone 11 (sub-stone names mismatch) ❌ CRITICAL:
This is the real UX problem. The user sees one name on the painting and lands on a topic page with a different name.

- **A)** **Update LOCK to match painting**
  Rename sub-stones in `bodyWorldStones.js`:
    1 Stress Response, 2 Nervous System Basics, 3 The Body Keeps the Score, 4 Regulation Tools, 5 Vagus Nerve & Safety, 6 From Survival to Thriving, 7 Integration
  Also remove 8th sub-stone (LOCK has 8, painting has 7).
  → Topic pages would need re-authoring. Legacy content mappings re-checked.

- **B)** **Re-render painting to match LOCK**
  Generate new Stone 11 painting with: Understanding Stress / Nervous System Basics / Triggers / Response Patterns / Regulation Tools / Safety Within / Resilience / Living in Flow (8 stones).
  → Image asset replaced, LOCK preserved.

- **C)** **Hybrid**: keep painted names as VISIBLE labels, keep LOCK slugs/routes intact. Topic page hero rewritten to match painted name. Behind-the-scenes content stays mapped.
  → Smallest blast radius but requires title-override field in LOCK.

### For Stone 14 (sub-bubble names mismatch) ❌ CRITICAL:
Same 3 options as Stone 11.

- **A)** Update LOCK to match painting (9 bubbles)
- **B)** Re-render painting to match LOCK (10 bubbles)
- **C)** Hybrid

---

## 5. WHAT IS LOCKED, NO MATTER WHAT

These are confirmed-correct and need no work:

| Element | Status |
|---|---|
| Routes (Hub → `/body-world/world/:slug` → `/topic/:topicSlug`) | ✅ All correct |
| Hub click-zones routing to right slugs | ✅ All correct |
| Stones 1, 2, 3, 4, 7, 8, 9, 10, 12, 13 paintings | ✅ Fully aligned |
| Legacy content (27 artifacts) migration to sub-stones | ✅ Wired |
| World page renderer (`BodyWorldStone.jsx`) | ✅ Correct |
| Topic page renderer (`BodyWorldTopic.jsx`) | ✅ Correct |

---

## 6. RECOMMENDED PRIORITISATION

**P0 (must-fix for V1 LOCK):**
- Stone 11 sub-stone alignment (decision A/B/C required)
- Stone 14 sub-bubble alignment (decision A/B/C required)

**P1 (visual debt):**
- Hub painting re-render (4 wrong labels + 1 orphan)

**P2 (cosmetic only):**
- Stone 5 "OF 15" → "OF 14" re-render
- Stone 6 "WISOM" → "WISDOM" re-render

**Not blocking V1 LOCK** — but recommended before public release.

---

*This document is the single source of truth for Body World V1 audit
state on 2026-02-13. Update it whenever a painting is re-rendered or
LOCK is amended. Other audit docs (BODY_WORLD_ASSET_REGISTRY.md,
LEGACY_MIGRATION_STATUS.md) remain valid for asset/content tracking.*
