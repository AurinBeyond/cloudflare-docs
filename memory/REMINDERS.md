# 🔔 PENDING — Anna's TODO (last update: 2026-02-14)

## TOMORROW (2026-02-15) — Create Sara + Alistair ConvAI agents

The founder ran out of time today after creating Grace and Kaelan in
ElevenLabs. She will create the remaining two agents tomorrow.

### Steps when she returns:

1. **Go to** https://elevenlabs.io/app/agents
2. **Create "Sara – Parents' Room"**
   - System prompt: founder writes (Sara's personality, calm parental
     support, validation, emotional regulation register)
   - Voice: founder selects
   - **Copy the real `agent_xxxxxkrh...` id from the ElevenLabs panel
     itself — NOT from ChatGPT/external chat (those IDs are invented
     and DO NOT exist on the account)**
3. **Create "Alistair – Course Room / Academy"**
   - System prompt: structured learning support, calm academy register
   - Voice: founder selects
   - Copy real `agent_xxxxxkrh...` id
4. **Send both real IDs to E1 agent in chat.**

### Agent ID validation rule (force-of-habit reminder)

Real ElevenLabs IDs on this account always look like:
```
agent_<16-hex>krh<14-hex>     (33 chars after "agent_")
```
Examples that WORK on this account:
  agent_6801krh8dnmze1zthsnf5xb6xe43  (Grace)
  agent_8901krhatnm0eybb9t32y6fxs10e  (Kaelan)

If a proposed ID does NOT match this shape, OR contains a hyphen in
the middle (`agent_xxxx-yyyy`), it is almost certainly fabricated by
an external LLM. ALWAYS verify via `/v1/convai/agents` list call
before saving to `.env`.

### Once real IDs are received:

E1 agent must (~5-min task):
1. Update `/app/backend/.env`:
   ```
   ELEVENLABS_CONVAI_AGENT_SARA=agent_<real id>
   ELEVENLABS_CONVAI_AGENT_ALISTAIR=agent_<real id>
   ```
2. Restart backend.
3. Smoke-test signed-url endpoint for both rooms via curl.
4. **Phase B mount** — add ONE line each to:
   - `/app/frontend/src/components/BodyRoomChat.jsx`
     → `<RoomConvaiChat room="body" />`  (Kaelan — already in env, just needs mount)
   - `/app/frontend/src/components/ParentsRoomChat.jsx`
     → `<RoomConvaiChat room="parents" />`  (Sara)
   - Course Room page (whichever component renders /courses chat)
     → `<RoomConvaiChat room="courses" />`  (Alistair)
5. Run full pytest suite (20 → 20 PASS lock).
6. Founder live-tests each room.

### Anna's broader pending actions (independent of E1 agent):

- **Production redeploy** for `prulesoul.site` with the env vars
  documented in iter 80 PRD entry. After iter 81 .gitignore fix,
  "Save to GitHub" actually pushes .env now — without that fix,
  none of the env vars were reaching the GitHub repo.
- **Refund / credit escalation** → support@emergent.sh
  (Anna already filed; awaiting Emergent Support response).
- **Browser cache clear** — when testing live, ALWAYS do
  Ctrl+Shift+R (hard refresh) on prulesoul.site after a Redeploy.
  The React bundle is aggressively cached; without hard refresh
  she will see the OLD UI even though the server has the new code.

### Queued for next iter (NOT in scope today):

---

## 🔒 OPERATIONAL CONSTITUTION — Logic-Gate & Red Rule (founder-locked 2026-02-15)

These rules apply to **every ElevenLabs Conversational AI agent** on
this account (Grace, Kaelan, Sara, Alistair) and are configured by
the founder in each agent's System Prompt in the ElevenLabs UI
(https://elevenlabs.io/app/agents). They are NOT enforced by E1's
backend or frontend code — they live entirely inside each agent's
configuration on the ElevenLabs side, which is the right place for
behavioural rules because changes there reach production with no
redeploy.

E1 agent is responsible for surfacing these rules to the founder
whenever a Phase B / agent-config conversation comes up, so they
are never accidentally dropped during agent prompt edits.

### Logic-Gate (universal, every room)
- **Maximum 2 sentences per response (under 25 words).**
- Silence > filler. Never explain who you are unprompted.
- Mirror the wanderer's last sentence first. Then ONE gentle,
  emotional question.
- Never lecture, teach, or list. Listener, not presenter.
- If the wanderer says nothing, stay silent. Wait.

### Red Rule (universal, every room)
- **All agent dialogue MUST be in English only.**
- Never mix languages mid-sentence.
- Never auto-translate the wanderer's input.
- If the wanderer writes in another language, the agent still
  responds in calm, simple English (the wanderer chose this space).

### Per-room scope locks (founder-configured)
- **Grace (Private Room)** — emotional/relational only. NEVER
  introduce body-sensation language unless wanderer named it first.
  No somatic micro-practices unsolicited.
- **Kaelan (Body Room)** — somatic awareness, grounding, physical
  tension. NEVER drift into parental, course, or pure-emotional
  registers. If the wanderer brings clearly emotional material,
  Kaelan may gently suggest "Grace is nearby if you'd like to
  carry this there", but stays in his room.
- **Sara (Parents' Room)** — parental support, validation, family
  stress. Knowledge base: 72 techniques (founder-loaded). NEVER
  prescribe somatic body work or strategic course content.
- **Alistair (Course Room)** — structured learning, course
  orientation, Matrix Aurin strategy. NEVER drift into emotional
  release or somatic register.

### Voice / latency settings (founder-locked, ElevenLabs UI)
- Voice model: **Eleven Turbo v2.5**
- Stability: **35%**
- Similarity Boost: **75-80%**
- Style: **0-10%**
- Speaker Boost: **ON**
- Latency optimization: **4** (max)
- End-of-turn silence: **800-1200 ms**
- Barge-in / interruption: **ON**
- First Message: ONE short line ("I'm here. Take your time. What
  brought you tonight?") — **NEVER duplicated inside System Prompt**

---


- **Checkout / packages page UX:** Anna reported "the page with 2
  package options — packages should be at TOP, and the consent
  checkbox should be UNDER the package choice. Currently users
  don't realise they need to scroll up to give consent. They get
  stuck and can't proceed."
  → Touch the packages page only when Anna confirms which page
    (likely /portal or /threshold). Move package cards above the
    consent block; add a sticky "Continue" CTA that becomes active
    only when both consent + package are picked. ~15 min work.

- **Body Room conversational mode (Kaelan):** Currently `/body-room`
  shows silhouette + region-hotspot UX + two "Go to Clarity Release"
  CTAs. Anna expects to talk to **Kaelan** there. Phase B mount:
  one line `<RoomConvaiChat room="body" />` in BodyRoom.jsx (env
  already has the agent_id). ~5 min work.


---

*This file is read by E1 at the start of every fork session. If
Anna's first message tomorrow contains the two real Sara/Alistair
agent IDs, jump straight to the steps above.*
