# BODY WORLD — OFFICIAL ASSET REGISTRY
**Locked: 2026-06-16**
**Source of truth for every painted asset wired into Body World V1.**

This file exists so the question "is this image present in the system?"
NEVER needs to be asked again. Anyone re-checking must consult this
file before any new audit.

---

## 1. HUB

| Slot | Painted file | URL fail-suffix | Status |
|------|-------------|-----------------|--------|
| Hub  | ChatGPT Image 11. juni 2026, 21:05:25.png | `9ndllntz_…21_05_25.png` | ✅ wired (legacy 15-stone version — visual debt awaiting new 14-stone render) |

**Alt versions in customer-assets** (same timestamp duplicates):
- `3rbgb6a4_…21_05_25.png`
- `zzzljimy_…21_05_25.png`
- `hhvqxo4o_…21_05_25.png`
- `3yqf4pcc_…21_09_45.png` (no-backpack variant)
- `6zpqvlb3_…21_09_45.png`
- `rj0js0m2_…21_09_45.png`

**Founder narrative decision** (16.06.2026): keep backpack version. The
backpack is the protagonist of Body World — stones (1–14) = burdens
carried in the backpack. Stone 14 (mullid) = release.

---

## 2. 14 STONE PAINTINGS

| #  | LOCK name                          | Slug                       | Painted file timestamp | URL fail-suffix          | Status |
|----|-----------------------------------|----------------------------|------------------------|--------------------------|--------|
| 1  | Know Your Body                     | `know-your-body`           | 11.06 21:26:24         | `ool14lh5_…`             | ✅ wired |
| 2  | Emotional Body                     | `emotional-body`           | 11.06 21:45:45         | `4hh50ve0_…`             | ✅ wired |
| 3  | Body Memory & Inheritance          | `body-memory`              | 12.06 11:09:36         | `997a5r7f_…` (Stone 3 OF 14) | ✅ wired |
| 4  | Body Identity                      | `body-identity`            | 11.06 21:55:26         | `m6z80wpi_…`             | ✅ wired |
| 5  | Body Protection Mechanisms         | `body-protection`          | 12.06 10:57:06         | `c4qmrbde_…` (sild "of 15", LOCK match) | ✅ wired |
| 6  | Body as a Partner                  | `body-as-partner`          | 12.06 11:50:58         | `vg1lkp5u_…`             | ✅ wired |
| 7  | Body Engineering                   | `body-engineering`         | 12.06 23:50:05         | `j9502ba4_…` (Stone 7 OF 14) | ✅ wired |
| 8  | Body & Relationships               | `body-relationships`       | 13.06 16:41:15         | `g3bn25wk_…`             | ✅ wired |
| 9  | Body & Environment                 | `body-environment`         | 13.06 16:42:51         | `r37tmlnt_…`             | ✅ wired |
| 10 | Body & Time                        | `body-time`                | 13.06 16:46:23         | `ceflczmw_…`             | ✅ wired |
| 11 | Stress & Nervous System            | `stress-nervous-system`    | **16.06 09:33:00**     | `bw1xcf7q_…` (newest, LOCK-aligned) | ✅ wired |
| 12 | Body as Language                   | `body-language`            | 13.06 16:49:23         | `wkuhq886_…`             | ✅ wired |
| 13 | Growth & Transformation            | `growth-transformation`    | 11.06 22:20:19         | `toeyztpw_…`             | ✅ wired |
| 14 | Living or Surviving (bubble cluster) | `living-or-surviving`    | 13.06 16:56:29         | `79cg7fh3_…`             | ✅ wired |

**TOTAL: 14 / 14 stones wired + Hub = 15 / 15 assets present in code.**

---

## 3. UNUSED / SUPERSEDED PAINTINGS (preserved in customer-assets)

These were uploaded by founder but are NOT wired. Kept for reference
only. Do NOT delete from customer-assets; do NOT re-wire without
explicit founder decision.

| Timestamp | Painted title (visible on image) | Why unused |
|-----------|----------------------------------|------------|
| 11.06 21:09:45 | Hub no-backpack variant | Backpack version chosen by founder |
| 11.06 21:30:53 | Emotional Body alt | Newer 21:45:45 chosen |
| 11.06 21:34:15 | Emotional Body alt | Newer 21:45:45 chosen |
| 11.06 22:01:03 | "RELATIONSHIPS" (Stone 7 of 14 painted) | Slot numbering mismatch; superseded by 13.06 16:41:15 |
| 11.06 22:08:13 | "PURPOSE & MEANING" | Not in LOCK |
| 11.06 22:18:31 | "CONNECTION & RELATIONSHIPS" (Stone 12 of 14 painted) | Superseded |
| 11.06 22:23:34 | "LIVING YOUR PURPOSE" | Not in LOCK |
| 12.06 10:38:15 | Stone 3 Body Memory (Stone 3 OF 15 sild) | Superseded by 12.06 11:09:36 (Stone 3 OF 14) |
| 13.06 16:58:59 | Living or Surviving alt | 16:56:29 chosen as primary |

---

## 4. WHAT TO DO IF QUESTION ARISES AGAIN

**Q: "Is image X present in the system?"**
A: Open this file. If the timestamp + URL fail-suffix is here, YES.
Otherwise, run `get_assets_tool` and verify. Do NOT spend credits on
re-audit.

**Q: "Why is stone Y showing a Field Study skeleton, not painted view?"**
A: Two possible reasons:
1. The `image:` field in `bodyWorldStones.js` for that stone is empty.
   Check this file's table first — if a URL is listed here, restore it.
2. The painted URL is broken (404). Re-run a vision check on the asset.

**Q: "Hub painted labels are wrong — should I regenerate?"**
A: Wait for founder's explicit decision. Current hub is legacy 15-stone
version with 4 outdated labels. Code routing is LOCK-correct. Click
routing works; only visual labels mismatch.

---

## 5. NEXT ASSET WORK (after this file is locked)

1. New 14-stone Hub painting (founder to generate) — replaces
   `9ndllntz_…21_05_25.png` reference in `BodyWorld.jsx` line 22.
2. Hotspot re-calibration against new Hub (single-iteration vision pass).
3. V1 LOCK 🔒.

**Then** the bigger work begins: distributing existing legacy Body Room
V1 text content into the 14-stone + 96-sub-stone topic pages. See
`BODY_WORLD_LEGACY_MIGRATION_MAP.md` for the mapping plan.
