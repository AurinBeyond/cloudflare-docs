# Wave 5 — 2026-05-22 (founder directive correction)

## ✅ COMPLETED — Side-by-side layout restored per founder directive

### Layout correction
Founder's directive made clear: portrait card on LEFT, chat on RIGHT — NOT face filling the whole screen. Wave 3/4 misread the intent.

**Reverted RoomConvaiChat layout to flex row (Wave 2 pattern + Wave 4 background-image cropping):**
- LEFT: `<aside>` portrait card, sticky md+, 340-380px wide
  - Background-image crop showing only LEFT 55% of composite source
  - Built-in name (serif 24-28px) + "Guide · Keeper" subtitle (uppercase spaced) + italic tagline
  - CSS-only breathing animation (existing `.aurin-breathe` class, 9s scale 1→1.012)
- RIGHT: `<ConvaiPanel>` (unchanged, voice engine bit-for-bit preserved)

### New Grace portrait
Replaced grace.png with founder's "I've finally found the right Grace" image — woman with reddish-brown hair, white cardigan, lily flowers, sunset window. Backup at grace.png.backup-v3-2026-05-22.

### Clarity Release Grace card
Updated to match — max-w-[420px] portrait card centered above ChatPanel. ChatPanel internals BIT-FOR-BIT unchanged.

## Verified in preview
- /body-room: Kaelan card LEFT, chat panel RIGHT ✅
- /parents-room: Sara card LEFT, chat panel RIGHT ✅
- /course-room: Alistair card LEFT, chat panel RIGHT ✅
- /clarity-release: Grace card visible in CHAT phase ✅
- Lint clean
- No JS errors

## Honored founder's stabilization directive
- ❌ NOT touched: signed-url flow, presence/start, startSession, endSession, websocket, room mapping, agent IDs, ConvAI session logic, mic permission
- ✅ ONLY touched: visual shell (AgentPortraitPanel render, Grace portrait card JSX, new png asset, CSS breathing class already existed)
- ✅ Hot reload — no full restart needed
- ✅ Portrait layer is purely sibling to ConvaiPanel — no shared state, no React remount triggers

## Pending after Wave 5

### 🟡 Founder request: Aurin on Kids Universe entry page
Founder wants Aurin character visible on Kids Universe landing for free text-to-text chat. Asked for marketing-psychology recommendations.

**My 5 recommendations (founder will pick):**
1. **Parent-first reveal:** "Aurin is for your child" frame with a 1-sentence promise to the PARENT visible before any child interaction button. Builds parental trust = parental approval = repeat visits.
2. **Privacy badge:** "Aurin doesn't remember your child" / "No account · No tracking · No 18+ gate" — combat the #1 parental fear of AI for kids.
3. **No-friction try:** Free text-to-text WITHOUT signup, single click, child can experience Aurin instantly. Removes the conversion-killing "create an account" barrier.
4. **Imagination-honoring frame:** "Aurin knows about tooth fairies, angels, and your invisible friends." Wins child's heart, signals to parents this isn't a clinical AI.
5. **Light-being identity:** Aurin = no gender, no human face, just symbolic. Universal, safe, no demographic bias. Already aligned with founder's directive.

### 🟢 Backlog
- Variant B (portrait-as-background, semi-transparent chat overlay) — awaiting founder go after she sees Wave 5
- Aurin's Room — `aurin-companion.png` downloaded but not wired in
- Angel Stars DB, Audio-story RAG, real LemonSqueezy variant IDs
