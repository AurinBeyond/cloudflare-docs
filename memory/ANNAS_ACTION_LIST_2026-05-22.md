# Anna's Action List — Step by Step

> Written 2026-05-22 while Anna went to the store. She asked: "kui midagi mis jäi mingil pöhjusle tegemata anna teada ja koosta list mis mina pean tegema ning kuidas punkt haaval."

Some critical fixes can ONLY be done by Anna in external dashboards. The Agent cannot access these from inside the codebase.

---

## 🔴 STEP 1 — ElevenLabs Dashboard — Remove Finnish residual (CRITICAL)

**Why:** The "ghost female voice" Anna heard in Body / Parents / Course rooms is an **agent first_message** playing automatically when the session starts. Each agent was previously configured with Finnish language + Estonian first_message (an unauthorised Agent workaround). Anna confirmed: product is 100% English.

**What to do:**

1. Open https://elevenlabs.io/app/conversational-ai → My Agents
2. For EACH of these four agents:
   - **Kaelan** (Body Room) — agent ID `agent_4901k47w35z2fpd86k1xtdf91kjk`
   - **Sara** (Parents Room) — agent ID `agent_3901k47y5fbqe5b8ka1d5pcwbqms`
   - **Alistair** (Course Room) — agent ID `agent_0301k4grp6dbe45t3vamatxdwswj`
   - **Aurin** (Kids Room) — agent ID `agent_2701ks4kr44fe47txg77y5f8z76x`

3. Inside each agent's editor:
   - **Agent → Language**: change to `English (en)` if it shows `Finnish (fi)`
   - **Agent → First message**: **CLEAR IT** (leave empty). This stops the ghost intro.
   - **Voice → Voice**: confirm correct English-speaking voice is selected (Grace = Rachel `21m00Tcm4TlvDq8ikWAM`, others should be English voices)
   - **Voice → Model**: keep `eleven_flash_v2_5` or `eleven_turbo_v2_5` (both English-capable)
   - **System Prompt → Bottom**: ADD this paragraph:

     ```
     Language: English only. Never speak Finnish, Estonian, or any other language.
     Speak slowly. Pause often. Use few words.
     Never sell, motivate, or push. Match the user's emotional pace.
     If unsure, say less.
     ```

4. **Security tab** (each agent):
   - Find "**Allow client-side overrides**" or similar
   - Toggle ON: `first_message`, `language`
   - This is so the code (RoomConvaiChat.jsx) can defensively force English + empty intro even if the Dashboard ever drifts. We've added the override code today.

5. Click **Save** on each agent.

**Test after:** Refresh prulesoul.site → enter any room → no voice should speak first. You should be greeted by silence until you speak. The ghost is gone.

---

## 🔴 STEP 2 — OPENAI_API_KEY check (CRITICAL — STT 500 bug)

**Why:** `/api/clarity/stt` returns 500 in production. This is why your computer mic didn't transcribe but your phone (using native ConvAI WebRTC) worked. STT uses OpenAI Whisper.

**What to do:**

1. Open Emergent panel → your deployment → **Environment Variables**
2. Find `OPENAI_API_KEY`
3. Verify:
   - It starts with `sk-`
   - It is the same key that works on preview
   - It has not been revoked at https://platform.openai.com/api-keys
4. If unsure, regenerate at OpenAI, paste new value into Emergent env var
5. **Restart deployment**

**Test after:** On prod, enter Grace's room (Clarity Release) → click mic → speak → text appears. If text appears, STT works.

If still 500: contact Emergent Support and share this exact text: *"`/api/clarity/stt` returns 500 in production. Need backend logs to see the actual exception. The endpoint is in server.py line 5624–5692."*

---

## 🟡 STEP 3 — FREE_VOICE_BETA verification

**Why:** You said you flipped this to true on prod. We need to confirm it took effect.

**What to do:**

1. Emergent panel → Environment Variables → find `FREE_VOICE_BETA`
2. Confirm value is exactly `true` (lowercase, no quotes)
3. If missing or `false`, set to `true`
4. **Restart deployment**
5. After test: set back to `false` for launch

**Test after:** Body Room → click Voice → mic icon → speak. Should connect WITHOUT credit deduction.

---

## 🔴 STEP 4 — Push Anna's latest code fixes to production

**Why:** Agent fixed three things in code today that need to land on prod:

1. **Body Room guide-face 404** — code now defaults gender to "male" (Kaelan) instead of leaving it undefined
2. **Parents Room same bug** — defaults to "female" (Sara)
3. **Defensive language override in RoomConvaiChat** — forces `agent.language: "en"` and `agent.firstMessage: ""` on every session start (kicks in once Step 1 above enables client overrides on the agents)
4. **Removed "Made with Emergent" badge**
5. **Updated meta title** from "the room that reads you" to "a quiet reading room" (per external AI review feedback)

**What to do:**

1. Emergent panel → **Deploy** (or hit the deploy button on the chat input bar)
2. Wait ~3 min for build
3. Hard refresh prulesoul.site (Ctrl+Shift+R) to clear browser cache
4. Verify in DevTools console: no more `guide-face/undefined` 404s

---

## After all 4 steps — re-test voice in every room

| Room | Expected Behavior |
|---|---|
| Grace · Clarity Release | Click mic → silence → speak → Grace replies in English. No intro voice. |
| Kaelan · Body Room | Same. |
| Sara · Parents Room | Same. |
| Alistair · Course Room | Same. |
| Aurin · Kids 3–5 | Same. No kickback. |
| Aurin · Kids 6–8 | Same. |
| Aurin · Kids 9–12 | Same. |

If any of those fails, capture **DevTools → Console** screenshot + **Network tab → failing request → Response** and send to me. I'll diagnose from there.
