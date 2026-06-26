# Matrix Aurin — Mis on veel katki / puudu
## Status snapshot pärast prompt-taastamist · 2026-05-19 15:08 UTC
### Read-only audit, dokumentaalne, prioriteet järjekorras

---

## 🟢 MIS ON KORDA TEHTUD JA TÖÖTAB (kinnitatud)

| Subsüsteem | Olek | Tõend |
|---|---|---|
| Grace prompt | RESTORED 1103c | API GET 2026-05-19 15:08 UTC |
| Kaelan prompt | RESTORED 1094c | API GET 2026-05-19 15:08 UTC |
| Alistair prompt | RESTORED 3433c | API GET 2026-05-19 15:08 UTC |
| Sara prompt | INTACT 5980c | API GET 2026-05-19 15:08 UTC |
| Kõigi 4 agendi voice_id | INTACT | post-patch GET |
| Kõigi 4 agendi TTS model | INTACT | post-patch GET |
| ASR (scribe_realtime) | INTACT | post-patch GET |
| Backend ENV (LemonSqueezy 9 variant ID, agendid, fin-split) | KOMPLEKTNE | `.env` inspection |
| Backend `[FIN-SPLIT]` finantsmootor v2 | LIVE | dry-run kõik 4 toodet rohelised |
| Admin financial preview endpoint | LIVE | `/api/admin/financial/preview` testitud |
| V6 house hero design (cinematic mask) | LIVE (preview) | `HousePreview.jsx` |
| Hero näo paljastus (yellow-curve fix) | LIVE (preview) | photo zone 44%, feather 22% |
| `/test-mic` 6-link diagnostika | LIVE (preview) | `TestMic.jsx` |
| Local backup discipline | NÜÜD PAIGAS | `/app/memory/agent_backups/` |

---

## 🔴 PUNASED — KATKI VÕI KRIITILINE

### 1. Voice-to-voice deafness — JUURPÕHJUS POLE TUVASTATUD
**Sümptom**: text↔text töötab, text→voice töötab, voice→voice ei tööta — agent ei kuule kasutaja häält
**Tõenäolised katki lülid** (3 jäänud):
- A. SDK voiceIsolation / noiseSuppression / autoGainControl klient-poolne stream-vaigistus
- B. WebSocket egress audio_chunk teekonna katkestus
- C. Server-poolne audio-formaat / signed-url scope / agent config tagasilükkamine

**Diagnostika tee**: `/test-mic` 6-link audit → "Copy snapshot" → JSON paste → tuvastab täpse lüli
**Vajab Sinult**: Incognito + fresh magic link + `/test-mic` testi käivitamine + snapshot
**Status**: BLOKEERIB demo videot (kuni voice-to-voice korras)
**Risk level**: HIGH

### 2. Production deploy gap
**Sümptom**: preview keskkonnas on viimased uuendused, production (prulesoul.site) on vanal versioonil
**Mis on ainult preview's**:
- Voice-to-voice deafness AudioContext hot-fix (`RoomConvaiChat.jsx`)
- Hero face opening parandus
- V6 house disain `/` route'il
- `/test-mic` diagnostika
- 4-tier financial engine + admin preview endpoint
- Audio Path Verified dev pill (`?dev=1`)
**Status**: BLOKEERIB live testing kasutajatega — Sa pead "Save to GitHub" + Emergent deploy nupuga lülitama
**Risk level**: MEDIUM (preview's saab demo teha, kuid live ostud ei tööta)

---

## 🟡 KOLLASED — POOLI VAJAB / VAJAB OTSUST

### 3. LemonSqueezy live billing — passive (waiting on switch)
**Status**: 9 Variant ID + Webhook Secret on `.env`-is. `SESSION_CAP_ENABLED` on määratud, kuid pole "true"-le lülitatud
**Mis vajab**: pärast deploy'd → flip `SESSION_CAP_ENABLED=true` + tee 1 päris-ost (€45 First Step) → kontrolli `[FIN-SPLIT] ctx=live` log
**Risk level**: MEDIUM

### 4. Silence Room (uus karakter, agent veel olematu)
**Mis vajab**: Sa lood ElevenLabs Dashboardis uue agendi, annad mulle `agent_id`, siis ma lisan backend ENV-i, route, frontendi
**Status**: prompt + spec valmis `/app/memory/SilenceRoom_Character_Prompt.md`
**Risk level**: LOW (uus feature, mitte regressioon — võib ka hiljem)

### 5. WandererGate consent persistence
**Sümptom**: autenditud kasutajatele tulevad consent checkboxid uuesti igal sessioonil
**Põhjus**: `/api/agreement/status` kontrollib AINULT `visitor_id` (localStorage), ignoreerib autenditud `user_id`
**Fix**: backend tunnista `user_id` autenditud kasutajatele, frontend `WandererGate.jsx` kasutab user-context
**Status**: NOT STARTED
**Risk level**: LOW

### 6. Welcome email / gift delivery audit
**Status**: NOT STARTED — Sa mainisid varem, et tellimuste järgsed email-flow'd vajavad ülevaatust
**Risk level**: LOW

### 7. Dynamic Course Curator
**Status**: NOT STARTED — backlogis
**Risk level**: LOW (uus feature)

---

## ⚪ INFORMATIONAL — PUUDUVAD AGA EI OLE KATKI

### 8. Google Analytics 4 / Microsoft Clarity
**Status**: paigaldamata (zero GA/Clarity script frontend bundle's)
**Risk level**: INFO — analytics on **uus paigaldus**, mitte regressioon. Sa otsustad millal soovid

### 9. Aurin Pet House (high-end animal psychosomatics)
**Status**: kontseptsioon `/app/memory/backlog_pet_house.md`, meeldetuletus 2026-06-19
**Risk level**: INFO

---

## 📊 PRIORITEETIDE TABEL — mis demo video tee?

| # | Tee samm | Kes | Aeg | Blokib demot? |
|---|---|---|---|---|
| 1 | **Testi Grace + Kaelan + Sara + Alistair** preview's `/clarity-release`, `/body-room`, `/parents-room`, `/course-room` | Sina | 5min × 4 = 20min | YES |
| 2 | **Voice-to-voice deafness diagnostika** (incognito + magic link + `/test-mic` snapshot) | Sina (running), mina (analyzing) | 5min + 2min analyses | YES |
| 3 | Voice-to-voice fix (sõltub p.2 tulemusest) | Mina (Sinu loaga) | 10-30min sõltuvalt katki lülitusest | YES |
| 4 | Production deploy ("Save to GitHub" + Emergent deploy) | Sina | 5min | YES kui müügile |
| 5 | LemonSqueezy live ost test | Sina + mina | 10min | YES kui live billing |
| 6 | Demo video filmimine | Sina | 30-60min | — |

**Realistlik aja arvutus** (kui kõik p.1-5 sujub veatult): **~2-3h kvaliteetset tööd kuni demo video on filmitav** — sõltub voice-to-voice'i päris katki lüli leidmisest.

---

## 🛑 MINU PIIRID (jätkuvalt freeze, va. Sinu sõnaselge luba)

- ❌ Ei tee ühtegi muud PATCH-i ElevenLabs agentidele
- ❌ Ei deploy ilma Sinu otsese signaalita
- ❌ Ei lisa frontend featurit (nt Silence Room route) ilma loata
- ❌ Ei muuda prompte / hääli / pacingu
- ✅ Read-only audit / diagnostika
- ✅ `/test-mic` snapshot analüüs Sinu paste'i põhjal
- ✅ Sinu poolt sõnaselgelt lubatud PATCH-id (samasuguse pre/post-snapshot distsipliiniga nagu just tehtud)

---

## Failid loodud selles taastamise käigus

```
/app/memory/agent_backups/Grace_NEW_PROMPT.txt              (source: founder paste)
/app/memory/agent_backups/Kaelan_NEW_PROMPT.txt             (source: founder paste)
/app/memory/agent_backups/Alistair_NEW_PROMPT.txt           (source: founder paste)
/app/memory/agent_backups/Grace_PRE_PATCH_20260519T150817Z.json
/app/memory/agent_backups/Grace_POST_PATCH_20260519T150817Z.json
/app/memory/agent_backups/Kaelan_PRE_PATCH_20260519T150817Z.json
/app/memory/agent_backups/Kaelan_POST_PATCH_20260519T150817Z.json
/app/memory/agent_backups/Alistair_PRE_PATCH_20260519T150817Z.json
/app/memory/agent_backups/Alistair_POST_PATCH_20260519T150817Z.json
/app/memory/GUARANTEE_RECOVERY_AUDIT_2026-05-19.md           (read-only audit)
/app/memory/SUPPORT_ESCALATION_2026-05-20.md                 (Emergent support email content)
/app/memory/Grace_Character_Prompt.md                        (earlier minimalist version, archive)
/app/memory/Kaelan_Character_Prompt.md                       (earlier minimalist version, archive)
/app/memory/Alistair_Character_Reference.md                  (earlier partial reference, archive)
/app/memory/SilenceRoom_Character_Prompt.md                  (new agent spec, not yet deployed)
/app/memory/Sara_Character_Prompt.md                         (existing, untouched)
```

---

End of broken-and-missing list · generated 2026-05-19 15:08 UTC
