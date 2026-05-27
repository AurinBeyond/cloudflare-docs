# Kids Universe Journey — Master Architecture Plan
*Locked plan — DO NOT start coding until Anna gives explicit GO. Built so we do not have to debug after.*

Created: 2026-02-27 (after Anna's vision + GPT structural proposal)
Status: 🟡 PLAN APPROVED → AWAITING BUILD-GREENLIGHT

---

## 0. Vision in one paragraph

A curved, looking path of glowing "Kivid" (stones / portal nodes) where each click does **NOT** route to another page — instead it **swaps the view state** to a fully themed "Tuba" (room). Three age zones (Discovery 4-6, Exploration 7-10, Creation 11-13), each with its own color path. Static, luxury portrait of Aurin on the left of every room, Cormorant Garamond serif typography, screen-down philosophy. Stars earned in app → parent commits to a **real-world screen-free reward** (hike, fishing, forest cabin) → child uploads ONE photo of that moment to the Private Album. The product is the parent-child memory, not the digital experience.

---

## 1. Two-mode view architecture (state, NOT routes)

The entire `/kids-universe/{age_zone}` experience lives in **one React component** with two render modes:

```
Mode A: MAP VIEW
  ├─ Curved SVG path (sinka-vonka)
  ├─ Stones (buttons) alternating left/right
  ├─ Locked / Unlocked / Active state per stone
  └─ Hover tooltip with room title

Mode B: ROOM VIEW (when activeRoom !== null)
  ├─ Aurin portrait on LEFT (static PNG, luxury frame)
  ├─ Room-specific functionality on RIGHT
  ├─ "← Tagasi Kaardile" button returns to Mode A
  └─ NEVER changes URL — pure state swap
```

State variables in `KidsUniverseJourney.jsx`:
- `currentZone: 'discovery' | 'exploration' | 'creation'`
- `activeRoom: NodeData | null`
- `unlockedNodes: string[]` (from backend)
- `uploadedPhotos: { nodeId: photoUrl }` (from backend)

---

## 2. Age zones × color palettes

| Zone | Age | Theme | Path gradient | Atmosphere |
|---|---|---|---|---|
| Discovery | 3-6 | Forest jungle | `from-emerald-600 via-teal-500 to-emerald-800` | gentle green, soft glows, wonder |
| Exploration | 7-10 | Crystal cave | `from-blue-500 via-indigo-400 to-blue-700` | deep blue, crystal pillars, mystery |
| Creation | 11-13 | Cosmic studio | `from-purple-500 via-fuchsia-400 to-purple-700` | violet space, blueprints, building |

All zones share the same warm background `#0b0a08` and luxury `#c4a46b` Honey-Gold accent for consistency with the adult `/what-this-is` and Sanctuary palette.

---

## 3. Aurin avatar strategy (decided 2026-02-27)

**Phase 1 (LAUNCH):** Use the **single existing Jutuvestja Aurin** portrait in ALL zones and ALL rooms. Same character, same warmth, brand consistency.

**Phase 2 (v1.1, post-launch):** Add 3 outfit variants of the SAME Aurin face (same model — Gemini Nano Banana with "same character, different outfit" prompt):
- Discovery: woodland scarf, soft flowers
- Exploration: explorer goggles, wrench accessory
- Creation: cyber-circuit headgear, blueprint pen

Cost: 3 image generations vs 3 full character designs (10× cheaper).

---

## 4. Four room types (the heart of the system)

Each stone on the path maps to ONE of these 4 room types. The pattern repeats per zone (Day 1 → fairytale, Day 2 → puzzle, Day 3 → star, Day 4 → album, then Day 5 starts over).

### 4.1 `fairytale_room` — Muinasjutu Vestja Tuba
- **Function:** Aurin speaks a calming, unique fairytale based on child's "today's emotion" input.
- **UI:** Large play button (gold glow), audio waveform, optional text transcript below.
- **Backend:** Calls existing ElevenLabs ConvAI agent with child-context system prompt.
- **Premium-gated:** YES (voice = paid).
- **Free demo state:** Shows the page + Aurin greeting message in TEXT only ("Tap to unlock the voice").

### 4.2 `puzzle_room` — Emotsioonide Puzzle Tuba
- **Function:** Screen-down audio puzzle. Aurin asks "How do you feel today?", child speaks → Aurin reflects back the emotion in a gentle way and offers a 30-second mindfulness piece.
- **UI:** Single microphone button, soft pulsing animation, NO text input.
- **Backend:** Reuses existing voice session pipeline. Logged as an `emotion_checkin` ledger entry for the parent's weekly digest.
- **Premium-gated:** YES.

### 4.3 `star_reward_room` — Aurin Tähekese Tuba
- **Function:** Child receives a star. Parent picks ONE screen-free real-world activity to "earn the star back together":
  - ⛺ Camping / hike trip
  - 🎣 Fishing with parent
  - 🪵 Building a forest cabin / hut
  - 📖 Reading a book aloud at bedtime
  - 🌲 Mushroom or berry picking
  - 🎨 Painting outdoors together
- **UI:** Star with soft Honey-Gold glow → 6 large activity cards (parent picks one) → confirmation: "Sa lubasid lapsele tähekese — lähme metsa matkale enne nädalavahetust."
- **Backend:** Creates a `star_commitment` row: `{ user_id, child_id, activity, promised_at, fulfilled_at? }`. Sends parent gentle email reminder via Resend 48h later if not fulfilled.
- **Premium-gated:** YES.

### 4.4 `private_album_room` — Privaatne Fotoalbum
- **Function:** Parent uploads ONE photo per stone — the real-world moment from the star promise.
- **UI:** Single file-input button, after upload shows the photo with a "kuldne sära" Honey-Gold border + caption optional.
- **Backend:** Stores ONE photo per `node_id` per `user_id` (overwrite if reuploaded). KMS-encrypted at rest. NEVER trains public models. NEVER appears in any analytics.
- **Premium-gated:** YES.
- **CRITICAL legal:** Before first upload, parent re-confirms password (GDPR-K / COPPA child-data sensitive action gate).

---

## 5. Access control (hybrid model — Anna asked for "best solution")

```
┌─────────────────────────────────────────────────────────┐
│ PUBLIC (no login)                                       │
├─────────────────────────────────────────────────────────┤
│ /kids-universe                                          │
│   → 3 age zone landing visuals, tabs to switch          │
│   → Static Aurin portrait, atmosphere preview           │
│                                                         │
│ /kids-universe/{zone}                                   │
│   → MAP VIEW with all stones visible but only Day 1     │
│     is unlocked as DEMO (gentle text-only Aurin greet)  │
│   → All other stones show 🔒 with "Unlock the full      │
│     journey" CTA → /pricing                             │
└─────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────┐
│ PARENT-LOGGED-IN + PREMIUM                              │
├─────────────────────────────────────────────────────────┤
│ All 4 room types fully functional                       │
│ Voice (ElevenLabs) unlocked                             │
│ Star-Reward commitments saved                           │
│ Private Album upload (with password reconfirm)          │
└─────────────────────────────────────────────────────────┘
```

**SEO & marketing benefit:** the demo Day 1 in each zone is **public** — Google indexes the rich visual page, parents can preview before paying.

**Legal protection:** all child-PII (voice recordings, photos, emotion log) is gated behind parent auth + premium + (for album) password reconfirm.

---

## 6. Backend additions needed (Phase 2)

```python
# New collections
star_commitments: {
  _id, user_id, child_id, zone, node_id,
  activity: str,                # "camping" | "fishing" | ...
  promised_at: datetime,
  fulfilled_at: datetime | None,
  reminder_sent_at: datetime | None,
}

kids_album_photos: {
  _id, user_id, child_id, zone, node_id,
  storage_key: str,             # KMS-encrypted blob ID
  caption: str,                 # optional, max 200 chars
  uploaded_at: datetime,
}

kids_progress: {
  _id, user_id, child_id, zone,
  unlocked_nodes: list[str],    # ["node-1", "node-2", ...]
  last_active_at: datetime,
}

emotion_checkins: {
  _id, user_id, child_id, zone, node_id,
  emotion: str,                 # transcribed from voice (no audio stored)
  created_at: datetime,
}
```

```python
# New endpoints
GET  /api/kids/progress/{zone}                    # public: returns demo state; premium: full state
POST /api/kids/star-commit                        # premium: creates star_commitment
GET  /api/kids/star-commitments                   # premium: list for parent dashboard
POST /api/kids/album/upload                       # premium + password reconfirm: upload photo
GET  /api/kids/album/{zone}                       # premium: list photos
POST /api/kids/emotion-checkin                    # premium: log emotion
POST /api/kids/fairytale-session                  # premium: protected by governance layer
```

All voice-related endpoints **MUST** go through `runtime_governance.py` checkpoint. No bypass.

---

## 7. Build phases (so we ship without bugs)

### Phase 1 — Static Skeleton (~2h)
- New route `/kids-universe` + 3 sub-routes
- `KidsUniverseJourney.jsx` with Mode A (Map View) ONLY
- All stones visible, all locked, no interaction except hover tooltip
- 3 age tabs functional (color theme swap)
- Public, no auth
- **Test:** smoke screenshot, all 3 zones render correctly

### Phase 2 — One Demo Room (~2h)
- Mode B (Room View) for `fairytale_room` only, Day 1 of Discovery zone
- Text-only Aurin greeting (no voice yet)
- "← Tagasi Kaardile" works
- Public access works
- **Test:** click Day 1 → enter room → click back → return to map

### Phase 3 — Premium Gating + Star Room (~2h)
- Add auth check, lock all stones except Day 1 demo
- Build `star_reward_room` with 6 activity cards
- Backend: `star_commit` endpoint + collection
- Resend reminder email scheduler (48h delay)
- **Test:** logged-in parent commits to "fishing" → DB has row → email sent in 48h test mode

### Phase 4 — Album + Puzzle + Polish (~3h)
- `private_album_room` with password reconfirm + KMS-encrypted upload
- `puzzle_room` with voice (governance-protected)
- `fairytale_room` with voice (ElevenLabs ConvAI)
- Curved SVG path drawn between stones (not just flex column)
- Hover glow + smooth state transitions
- **Test:** full end-to-end: parent logs in → clicks Day 1 (story) → Day 2 (puzzle) → Day 3 (star + commits "hike") → Day 4 (upload photo with password reconfirm)

### Phase 5 — Apply to all 3 zones + Anna review (~1h)
- Repeat content for Exploration + Creation zones
- Adjust per-zone language for age (younger = simpler words; older = more agency)
- Live preview with Anna → final tweaks

**TOTAL ESTIMATE: ~10h focused work, broken into 5 sessions so we can test each phase independently.**

---

## 8. Reused infrastructure (we are NOT building from zero)

✅ Auth + premium gating: already exists (`/api/auth/*`, `presence_seconds_left`)
✅ Voice session pipeline: ElevenLabs ConvAI agents already configured
✅ Runtime governance: hard caps on voice cost — must wrap new endpoints
✅ Angel Stars lifecycle: `/api/angel-stars/*` — repurpose or alias for kids
✅ Resend email: `governance_alerts.py` patterns — copy for parent reminders
✅ Body Temple progress tracking: similar `body_temple_progress` schema → reuse pattern for `kids_progress`
✅ Sanctuary palette + Cormorant Garamond typography: already in `tailwind.config.js`

---

## 9. Open questions (must resolve before Phase 1 starts)

| # | Question | Owner | Default if unanswered |
|---|---|---|---|
| Q1 | Aurin storyteller portrait — current file path? | Anna | `/app/frontend/public/avatars/aurin-storyteller.png` |
| Q2 | Star-commitment activity list — keep these 6 or expand? | Anna | use the 6 listed in §4.3 |
| Q3 | Album photo retention — keep forever or delete after 2y? | Anna | keep forever, parent can delete |
| Q4 | Daily cap — how many stones per day a child can unlock? | Anna | 1 stone / 24h (forces real-world memory between digital sessions) |
| Q5 | Multiple children per parent account? | Anna | NO for v1; ONE child profile per account |
| Q6 | Age verification — strict birthdate or "I confirm my child is X years" toggle? | Anna | parental affirmation toggle (luxury UX, no friction) |

---

## 10. Adult pages v3.0 vision (separate, but Anna asked for it)

This is a separate plan document and BLOCKED on Polar approval per Anna's earlier decision. When unblocked, will create `/app/memory/ADULT_V3_VISION.md` with:
- 4 character rooms (Grace / Kaelan / Sara / Alistair) using `SanctuaryChatRoom.jsx` mudel
- Luxury static portrait LEFT + voice waveform RIGHT
- Subtle Honey-Gold glow on microphone, glassmorphic chat bubbles
- Cormorant Garamond throughout
- Each room gets its own ambient gradient (Grace = warm amber, Kaelan = stone gray, Sara = soft rose, Alistair = deep navy)

NOT building this until Anna says GO.

---

## DECISIONS LOCKED ON 2026-02-27

1. ✅ LemonSqueezy: NO price changes ever. Cutover to Polar = clean switch day, both happen simultaneously.
2. ✅ Aurin avatar strategy: single storyteller now, outfit variants in v1.1.
3. ✅ Access model: public map + Day 1 demo / premium for all other stones.
4. ✅ Build incrementally in 5 phases — test each phase before next.
5. ✅ Build only after Anna gives "alustame Phase 1" greenlight.
