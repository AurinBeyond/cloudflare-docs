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

- **Production redeploy** for `prulesoul.site` with the 6 env vars
  documented in iter 80 PRD entry. Without this, none of the
  ConvAI work reaches paying users.
- **Refund / credit escalation** → support@emergent.sh
  (Anna already filed; awaiting Emergent Support response).

---

*This file is read by E1 at the start of every fork session. If
Anna's first message tomorrow contains the two real Sara/Alistair
agent IDs, jump straight to the steps above.*
