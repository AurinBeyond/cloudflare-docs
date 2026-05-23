# Deploy Checklist — Tomorrow Morning 2026-05-23 ~09:00 EE

**Goal:** Voice test in production → fix anything that needs fixing → then lock to paid-only.

---

## ☀️ 09:00 EE — Wake-up sequence

### Step 0 — Reopen FREE_VOICE_BETA for the morning test (preview)

Anna asks the agent (in chat):
> *"Open FREE_VOICE_BETA back on for the test."*

Agent will:
- Change `/app/backend/.env` → `FREE_VOICE_BETA=true`
- `sudo supervisorctl restart backend`
- Confirm with `grep FREE_VOICE_BETA /app/backend/.env`

**Time:** 30 seconds.

---

### Step 1 — Test in PREVIEW first (before deploy)

URL: `https://aurin-hub.preview.emergentagent.com`

Test each room:
- [ ] `/clarity-release` — Grace voice starts ONLY after pressing the start button
- [ ] `/body-room` — Kaelan voice starts ONLY after pressing the start button
- [ ] `/parents-room` — Sara voice starts ONLY after pressing the start button + NO ghost voices + NO triple female voice
- [ ] `/course-room/[any]` — Alistair voice starts ONLY after pressing the start button
- [ ] `/aurins-room/little-dreamers` — Aurin voice starts ONLY after pressing the start button
- [ ] `/aurins-room/explorers` — same
- [ ] `/aurins-room/dreamweavers` — same

⚠️ **CRITICAL test for the ghost voice:**
- Open `/parents-room`
- Listen for 30 seconds WITHOUT clicking anything
- If you hear ANY voice → ghost still present → tell agent to fix
- If silence until you click start → ✓ ghost is gone

---

### Step 2 — Decision tree

| What happens in preview | What to do |
|---|---|
| Everything works, no ghost | Skip to Step 3 (deploy) |
| Ghost still present on Parents Room | Tell agent: *"Yes, do the surgical fix on ParentsRoom.jsx now"* → re-test → Step 3 |
| Other unexpected behavior | Send screenshot to agent before deploying anything |

---

### Step 3 — Deploy to production (only if preview is clean)

1. Open Emergent dashboard
2. Click **"Save to GitHub"** (commits all changes)
3. Click **"Redeploy"**
4. Wait 2–5 minutes for production to update
5. Open `prulesoul.site` in a clean browser tab (or incognito) to bypass cache
6. Repeat Step 1 tests, this time on `prulesoul.site` instead of preview URL

---

### Step 4 — In Emergent Production env (after deploy works)

⚠️ Production env vars are MANAGED IN EMERGENT PANEL, not the code. Anna must:

1. Open Emergent dashboard → app settings → Environment Variables
2. Confirm `FREE_VOICE_BETA=false` is set (for production)
3. Confirm `OPENAI_API_KEY` is set + valid (this is the long-standing P0 STT issue)
4. Save → wait for production restart

After this: production is **paid-only**. Free voice beta only exists in preview from this point on.

---

### Step 5 — Last sanity check before declaring "ready for LemonSqueezy"

- [ ] All 5 rooms work, voice starts only on button press
- [ ] No ghost voices on any room
- [ ] Microphone works in Chrome desktop (after clicking the 🔒 lock icon → Microphone → Allow)
- [ ] Microphone works on phone
- [ ] Production STT no longer returns 500 (test by trying to talk in a room)
- [ ] Atomic billing decrements credits when voice is used

---

## 🛡️ Rollback recipe (if something breaks)

If preview becomes broken before deploy:
```bash
cd /app
git reset --hard pre-deploy-2026-05-22-evening
cp /app/backend/.env.backup-2026-05-22-evening /app/backend/.env
cp /app/frontend/.env.backup-2026-05-22-evening /app/frontend/.env
sudo supervisorctl restart backend
sudo supervisorctl restart frontend
```

If production becomes broken after deploy:
- Emergent dashboard → Deployments → choose previous successful deploy → "Rollback"
- This is a free, instant action — no penalty for rolling back

---

## 🎙️ Known open issue: Ghost voice on `/parents-room`

**Root cause** (already diagnosed, NOT yet fixed):
- `ParentsRoom.jsx` mounts TWO chat systems simultaneously:
  1. `ConvaiPresenceTracker room="parents"` (line 153) → real Sara via ElevenLabs ConvAI
  2. `<ParentsRoomChat>` (line 416) → OLD system using browser TTS via `useVoiceIO`
- The old chat auto-speaks any previous "guide" message from localStorage on page load → that's the female voice that talks before you click anything.
- Plus the browser TTS picks a random female voice → that's why it sounds different each time.

**Surgical fix (30 seconds when Anna approves):**
- Remove line 416-420 (the `<ParentsRoomChat>` mount) from `/app/frontend/src/pages/ParentsRoom.jsx`
- Remove line 34 (the import) from same file
- That's it. Sara ConvAI stays. Old chat is dead-code preserved in repo for safety.

**Anna's call tomorrow:** test first, then approve fix if needed.

---

## 🚫 What we explicitly DO NOT change tonight

- ❌ No code changes
- ❌ No new features
- ❌ No dependency installs
- ❌ No ElevenLabs / LemonSqueezy / ConvAI settings

Only safety operations: backups + FREE_VOICE_BETA toggle + memory notes.
