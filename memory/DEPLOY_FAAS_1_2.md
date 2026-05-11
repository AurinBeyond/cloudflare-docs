# Aurin — Faas 1+2 Deploy juhend

**Versioon:** 2026-02-10
**Olek:** Preview'l valideeritud. Production'i jaoks valmis.

---

## Mis sai valmis

### Faas 1 — Visuaalne ankur (Grace v1 video)
- **Mis:** Staatiline portree asendati `grace_vision_pilot.mp4` videoga komponendis `GuidePresence.jsx`.
- **Kus:** Kõik kohad, kus `<GuidePresence gender="female" />` on kasutusel — Clarity Release, hiljem ka Body Room sama komponendi kaudu.
- **Fallback:** Kui video laadimine ebaõnnestub, kuvatakse vana JPG portree.
- **Faili asukoht:** `/app/frontend/public/avatars/grace_vision_pilot.mp4` (~7.3 MB).
- **Clarity (M) jaoks:** kasutab praegu vana JPG-d. Sora 2 video genereeritakse kui video pool taastub või kasutame eraldi `OPENAI_API_KEY`.

### Faas 2 — Sujuv vestlus (no button + VAD)
- **Mis:** Eemaldatud push-to-talk nupp Clarity Release vestlusest. Mikrofon kuulab pidevalt; Web Audio API VAD tuvastab kõne lõpu (1.5s vaikust → auto-saada Whisper'ile).
- **Barge-in:** kui kasutaja räägib samal ajal kui TTS audio mängib, audio peatub kohe.
- **Tagasilangus:** kui brauser ei toeta MediaRecorder + AudioContext, vana push-to-talk loogika jääb saadavaks (`useVoiceIO` `autoVoice=false` mode).
- **Pärast vastust:** mikrofon käivitub automaatselt uuesti — vestlus voolab.

### Faas 2 ettevalmistus — OpenAI Realtime API scaffold
- **Endpoint:** `POST /api/clarity/realtime/session`
- **Olek:** **OFF** vaikimisi (`REALTIME_MODE=off` env muutujast).
- **Aktiveerimiseks:**
  1. Hangu OpenAI projekti API key (api.openai.com → Settings → API keys → Create project key with Realtime/Voice access)
  2. Lisa kaks muutujat `backend/.env`-i:
     ```
     OPENAI_API_KEY=sk-proj-...
     REALTIME_MODE=on
     ```
  3. `sudo supervisorctl restart backend`
  4. Frontend hakkab seda kasutama, kui frontend-poolne `<RealtimeCompanion />` komponent on hilisemas iteratsioonis ehitatud.

### AGOP §C — "vaikuse tarkus"
- **Kus:** `/app/backend/clarity_ai.py` reas ~204.
- **Mida lisas:** Reeglid kuidas mentor ei tohi katkestada, peab valdama vaikust, ei lobiseb, ei haara väikest "mhm" õppetundi tegema.

---

## Production deploy sammud

1. **Save to GitHub** Emergent UI-st.
2. **Manual deploy** sinu hostingu kaudu (Vercel / Emergent / kus iganes `prulesoul.site` jookseb).
3. **Production `.env`** peab sisaldama:
   ```
   MONGO_URL=...                  (production MongoDB)
   DB_NAME=...                    (production DB)
   EMERGENT_LLM_KEY=...           (säilita olemasolev)
   RESEND_API_KEY=...             (säilita)
   LEMONSQUEEZY_*=...             (säilita)
   REALTIME_MODE=off              (kuni Faas 2 lõpetatud)
   ```
4. **`/avatars/grace_vision_pilot.mp4`** peab olema frontend `public/` kaustas — see liigub deploy'iga automaatselt.
5. **Smoke test pärast deploy'i:**
   - `curl https://prulesoul.site/api/health` → 200
   - `curl https://prulesoul.site/api/clarity/realtime/health` → `{"enabled":false,"has_openai_key":false}`
   - Sirvi `/clarity-release` → näe Grace videot mängimas
   - Klõpsa Grace → consent → vestlus → mikrofon küsib luba → räägi → mentor vastab

---

## Rollback plaan

| Probleem | Lahendus |
|---|---|
| Auto-VAD ei tööta mõne kasutaja brauseris | `useVoiceIO` langeb automaatselt tagasi vanale loogikale (push-to-talk on koodis säilinud) |
| Video ei lae mõnel seadmel | Komponent kukub fallback JPG-le |
| Realtime API maksab liiga palju | `REALTIME_MODE=off` `.env`-s + restart → tagasi Whisper+Claude+TTS putkele |
| Backend crash pärast `REALTIME_MODE=on` | Kontrolli `OPENAI_API_KEY` olemasolu ja kehtivust; endpoint annab 503 selge sõnumiga |

---

## Mida JÄRGMINE samm (kui sina otsustad)

1. **Sora 2 video pool taastamine** → genereerime `grace_vision_pilot_v2.mp4` (taimega, soojem ilme) + `clarity_vision_pilot.mp4` (eraldi mees)
2. **Body Room** sama no-button + VAD upgrade (praegu jätsime push-to-talk peale)
3. **`<RealtimeCompanion />`** frontend komponent — WebRTC peer connection OpenAI'ga (vajab sinu OPENAI_API_KEY)
4. **PDF Knowledge Bridge** — RAG-süsteem mentori metoodikatele
5. **LemonSqueezy live mode** + reaalne PDF ostuvoo test

---

## Tähtsad failid

- `/app/frontend/src/components/GuidePresence.jsx` — video + halo
- `/app/frontend/src/hooks/useVoiceIO.js` — VAD + barge-in + auto-restart
- `/app/frontend/src/pages/ClarityRelease.jsx` — vaikne staatusrida, ei nuppu
- `/app/frontend/src/index.css` — `.aurin-guide-speaking-halo` animatsioon
- `/app/backend/clarity_realtime.py` — Realtime API scaffold (gated)
- `/app/backend/clarity_ai.py` — AGOP §C lisatud
- `/app/backend/server.py` — Realtime router include
- `/app/frontend/public/avatars/grace_vision_pilot.mp4` — staatiline mediafail

— dokumendi lõpp —
