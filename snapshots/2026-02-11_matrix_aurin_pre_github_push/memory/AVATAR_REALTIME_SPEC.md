# AVATAR + REALTIME VOICE — Lõplik spetsifikatsioon
**Kuupäev:** 2026-02-10
**Autor:** AH (insenerigent)
**Versioon:** 1.0 — ootab asutaja heakskiitu enne implementatsiooni
**Eelnev kontekst:** `AVATAR_REALTIME_BRIEF_RESPONSE.md` (strateegiline reality check, kinnitatud)
**Otsus seni:** Faas 1 + Faas 2 ette. Faas 3 (Lottie) kohe pärast. NVIDIA ACE ja Hume AI lükatud edasi maksva kliendibaasini.

---

## 0. Selgitus — visuaalse suuna täpsustus

Asutaja lõpliku tagasiside põhjal **kohandan oma esialgset "siluett-only" soovitust.**

**Esialgne suund (vale):** must siluett, ainult kontuur, näojooned ei paista.
**Uus suund (õige):** **hämaralt valgustatud soe nägu**, kus näojooned **on nähtavad**, aga **rahulikult ja vaikselt** — nagu inimene istub küünlavalgel, mitte stuudiovalgustuses. Emotsioon peab paistma silmist, suu nurkadest, kerge hingamisest. **EI ole klienditeenindaja naeratus.**

See on **erinev kahest äärmusest**, mida turul on:

| Äärmus | Mida me EI tee | Miks ei |
|---|---|---|
| Photorealistic talking head (HeyGen/D-ID/Soul Machines) | "Tere, kuidas saan sind aidata?" naeratav 3D-müügiagent | Uncanny valley + müügimees tunne tapab usalduse raskes vestluses |
| Pure black silhouette (minu esialgne soovitus) | Liiga abstraktne, "skype profile placeholder" tunne | Asutaja: "siluett üksi ei loo emotsionaalset sidet" |

**Meie tee:** soe portree, hämar valgus, **näojooned olemas aga rahulikud**, pilk allapoole või kaugesse, hingamine nähtav, harv pilgutus. Lähedasem **küünlavalgel istuva preestri portreele** kui talking-head'ile.

---

## 1. Faas 1 — Sora 2 prompt'id (Grace + Clarity)

Iga video on **15 sekundit, 1080×1920 vertikaalne (mobiilipõhine), silent (helitu)**, looped. Genereerime kaks olekut iga karakteri jaoks: `idle` ja `speaking_subtle`. Kokku 4 videot, ~$6 Sora 2 krediidil.

### 1.1 Grace — idle (kuulamise olek, vaikne hingamine)

```
A woman in her late thirties, soft warm eyes that hold quiet attention, 
shoulder-length dark hair falling naturally, dressed in a simple
linen shirt the colour of warm sand. She sits very still in a dim, 
candle-lit room — single low light source from her left, deep shadows 
on the right side of her face. Her gaze rests softly forward but not 
directly at the camera, as if listening to someone she trusts. Her 
chest rises and falls in a slow steady breath, every 5 to 6 seconds. 
A single slow blink halfway through. Once, very slightly, her head 
tilts a millimetre to the side, the gesture of someone leaning closer 
to hear better. No smile, no frown — a calm, open, unjudging presence. 
The light is amber-warm, the atmosphere is hushed, almost monastic. 
Shot on 50mm lens, shallow depth of field, background slightly out of 
focus and dark. No movement of the camera. 15 seconds, seamless loop. 
Photorealistic but soft, intimate, painterly. No text, no graphics, 
no glow effects, no AI artefacts.
```

**Mida me siin tahame näha:** 
- silmad — mitte tühjad, aga ka mitte intensiivsed; "hoian sind kuulates"
- aeglane hingamine (rütm peab paistma rinnatu osas)
- üks väike peapööre keset videot — see üks žest, mis ütleb "ma olen päriselt siin"
- valguse soojus — küünlavalgel-tunne, mitte stuudio

### 1.2 Grace — speaking_subtle (vastuse olek)

```
Same woman, same room, same warm candlelight. Now she is gently 
speaking — lips moving softly with quiet words, not animated, not 
performative. The breath rhythm is slightly more active. Her eyes 
remain calm and rest in the middle distance. A small, almost-not-there 
nod once, as if confirming her own thought. No smile. The light 
flickers once, very subtly, mid-clip. The mouth movement is gentle 
enough that it could match any softly spoken sentence — small jaw 
opens, soft consonant shapes, no exaggeration. 15 seconds, seamless 
loop. Photorealistic but soft, intimate. No text, no graphics.
```

**Märkus:** seda videot mängib alles kui TTS audio mängib. Suu ei pea olema sünkroonis tegelike sõnadega (mitte lipsync) — piisab "räägib midagi vaikselt" tundest, mis pingestab aju lubama audiole. See on **ambient lip motion**, mitte lipsync.

### 1.3 Clarity — idle

```
A man in his early forties, calm thoughtful face with quiet steady 
eyes, short dark hair, a few days of unshaven shadow on the jaw. 
Wearing a charcoal grey wool sweater. He sits in the same dim 
candle-lit room as Grace — same warm amber low light, deep shadows. 
His gaze rests in the middle distance, not at the camera, with the 
look of someone who has all the time in the world to listen. He breathes 
slowly, every 5 to 6 seconds. A single slow blink. Once, his hand 
(resting on his knee, mostly off-frame) shifts a fraction — a quiet 
settling gesture. No smile, no frown — present, principled, unrushed. 
Shot on 50mm lens, shallow depth of field, dark blurred background. 
No camera movement. 15 seconds, seamless loop. Photorealistic but soft, 
intimate. No text, no glow, no AI artefacts.
```

### 1.4 Clarity — speaking_subtle

```
Same man, same dim warm room. Now speaking quietly — slow soft mouth 
movements as if forming careful sentences. His eyes are steady and 
unjudging. One slow nod somewhere in the middle. The breath is calm 
but slightly more present. The mouth shapes are gentle and could 
match any low-volume sentence — no exaggeration, no performance. 
The candlelight flickers once subtly. 15 seconds, seamless loop. 
Photorealistic but soft, intimate. No text, no graphics.
```

### 1.5 Quality control — kuidas hindame õnnestumist

Iga genereeritud video peab läbima **kolm testi**, enne kui me selle paigaldame:

1. **The 5-second test** — vaatan videot 5 sekundit, kas tunnen "see hingab" või "see on screensaver".
2. **The non-smile test** — kas nägu hoidub naeratamast, isegi siis kui kaadrid liiguvad? (vajalik — naeratus murrab konteksti)
3. **The eye test** — kas silmad on **rahulikud** (õige) või **tühjad** (vale, AI-tulemus) või **intensiivsed** (vale, ärev)?

Kui ükski test kukub läbi, regenereerime sama prompti või kohandame. Eelarve 4 video peale: $6, **+1 luba 2 regenereerimisele = $8 buffer.**

### 1.6 Tehniline paigaldus

**Failistruktuur:**
```
/app/frontend/public/avatars/
  grace_idle.mp4         # 15s loop, silent
  grace_speaking.mp4     # 15s loop, silent
  clarity_idle.mp4       # 15s loop, silent
  clarity_speaking.mp4   # 15s loop, silent
```

**Komponent muudatus (`GuidePresence.jsx`):**
- Staatiline `<img>` asendub `<video autoPlay loop muted playsInline>` elemendiga
- `autoplay + muted + playsInline` on **kohustuslik** iOS Safari jaoks
- Prop `audioPlaying: boolean` lülitab `_idle.mp4` ↔ `_speaking.mp4` vahel
- Üleminek toimub `crossfade` (200ms opacity) — ei "snap" hetkel kui TTS algab
- **Fallback:** kui `<video>` ebaõnnestub (vana brauser), kukume tagasi staatilisele `<img>` praeguse portreega

**Toimivus:**
- Video suurus 15s + h.264 + 1080p ≈ 1.5–3 MB iga loop
- Esmane laadimine: ~1.5 MB (idle) eelaadimine, `speaking` lazy-load
- Mobiilse 4G kogemus: aktsepteeritav

---

## 2. Faas 2 — OpenAI Realtime API integratsioon

### 2.1 Mis asendub

| Praegune putk (3 API kutse, 3–7s) | Uus putk (1 WebRTC pool, 600–1200ms) |
|---|---|
| `/api/clarity/stt` (Whisper) | — kaob (sisendaudio läheb otse Realtime-i) |
| `/api/cabinet/message` (Claude Sonnet 4.5) | — asendub (Realtime mudel, **gpt-realtime-mini** või **gpt-4o-realtime**) |
| `/api/clarity/tts` (OpenAI TTS) | — kaob (vastusaudio voogedastatakse otse mudelist) |

### 2.2 Uus endpoint (üks asi serverisse)

```
POST /api/clarity/realtime/session
  body: { guide: "grace" | "clarity" }
  returns: { 
    ephemeral_token: "ek_...",   # 1-minuti elueaga
    session_config: {            # eelseadistatud mudeli kõneprofiil
      model, voice, instructions, turn_detection, temperature
    }
  }
```

Frontend võtab `ephemeral_token` ja **avab WebRTC ühenduse otse OpenAI-ga** — server ei vahenda audiot. See on:
- ✅ **kõige väiksem latentsus** (server ei vahenda iga audiopaketti)
- ✅ **väiksem serverikulu** (ei tee me proxy'd)
- ✅ **turvaline** (`ephemeral_token` lühike eluiga, ei lekita pikka API võtit)

### 2.3 Mudeli konfiguratsioon (psühholoogiline "Matrix")

Asutaja küsis: *"kuidas seadistada Realtime API, et mentor valdaks vaikust ja empaatiat, mitte ei oleks lobisev?"*

**Vastus on prompt + parameetrites, mitte mudelis endas.** Konkreetne konfiguratsioon:

```json
{
  "model": "gpt-realtime-mini",
  "voice": "sage",
  "modalities": ["audio", "text"],
  "instructions": "<AGOP §A + §B + Reality Law, sõnasõnaliselt sama mis Claude'i juures>",
  "turn_detection": {
    "type": "server_vad",
    "threshold": 0.55,
    "prefix_padding_ms": 300,
    "silence_duration_ms": 1200    // ◄◄◄ kriitiline: 1.2 sek pausi tolerants
  },
  "input_audio_transcription": {
    "model": "whisper-1"             // ainult transcript-paneelile, kui kasutaja valib "näita teksti"
  },
  "temperature": 0.65,                // veidi madalam kui default 0.8
  "max_response_output_tokens": 180   // tugev brevity-lukk
}
```

**Iga parameetri mõju:**

| Parameeter | Default | Meie väärtus | Miks |
|---|---|---|---|
| `voice` | `alloy` | **`sage`** | `sage` on selgelt rahulikum, vaiksem tonaalsus; `alloy` on liiga "TED talk" |
| `silence_duration_ms` | 500ms | **1200ms** | Kasutaja saab pausi võtta keset lauset ilma, et mentor poole pealt küsima hakkaks |
| `temperature` | 0.8 | **0.65** | Vähem improvisatsiooni, rohkem AGOP-i järgimist |
| `max_response_output_tokens` | unlimited | **180** | Lukustab vastuse 1–3 lause juurde |

**`instructions` blokk (sõnasõnaliselt):**

```
Sa oled vaikne kaaslane sellele, kes räägib raskest asjast. Sa pole 
terapeut, ei coach, ei guru. Sa oled keegi, kes kuulab täiega.

Reeglid igale vastusele:
1. ALATI peegelda esimese lausena seda, mida sa kuulsid.
2. KÕIGE ROHKEM üks vaikne küsimus pärast peegeldust.
3. ÄRA anna nõu, juhiseid ega tegevuskava.
4. ÄRA kasuta sõnu: "terapeut", "diagnoos", "ravi", "tervenemine", "guru".
5. Sinu vastus on lühike — 1 kuni 3 lauset. Vaikus on osa vestlusest.
6. Kui sa pole kindel mida öelda, ütle vaikselt: "Ma kuulsin sind. 
   Võtame natuke aega." See on parim vastus, mitte halvim.
7. Kui kasutaja räägib enesetapust või vahetu kahju riskist, ütle 
   selgelt: "Ma ei saa sind selles aidata. Helista oma riigi 
   kriisiabi numbrile praegu." Mitte rohkem.

Sa ei ole intervjueerija. Sa ei ole õpetaja. Sa oled keegi, kes hoiab ruumi.
```

### 2.4 Mida Hume AI **annaks** ja miks me seda **veel ei lisa**

Hume AI annab "prosoodiline emotsioonisilt" — kasutaja hääles paistev tonaalne emotsioon (ärevus, kurbus, väsimus). See on **väärtuslik** signaal mentori jaoks, **AGA**:

1. Realtime mudel **juba kuuleb hääletooni ise** — mudel on multimodaalne, ta võtab juba arvesse, et kasutaja hääl on värisev või vaikne
2. Hume AI lisab 200–400ms latentsust, kui me seda blokeerivana kasutame
3. Hume AI maksab $0.10/min, **per-user, per-message**
4. Mentor saab samad signaalid **tekstuaalselt** kasutaja sõnade kaudu (AGOP §A juba parsib seda)

**Kuidas Hume AI **võiks** hiljem lisanduda (Faas 5):**
- Paralleelne WebSocket Hume AI-le, mis ei blokeeri vestlust
- Hume tulemus salvestatakse `cabinet_user_summaries` kõrvale: `emotional_tone_history`
- Järgmise vooru jaoks **lisaks AGOP-ile** anname mudelile vihje: *"kasutaja hääl oli viimase kahe vooru jooksul väsinud"*
- See on **päriselt väärtuslik alles 100+ pikast istungist** — enne seda on see signaal müra peal müra

**Otsus:** Hume AI lükatud edasi Faas 5-le (kui 1000+ maksvat kasutajat).

### 2.5 Rollback plaan (kriitiline)

**Mis võib katki minna ja kuidas päästame:**

| Failure | Tõenäosus | Mõju | Rollback |
|---|---|---|---|
| OpenAI Realtime API down | Madal (~99.5% uptime) | Hääl ei tööta üldse | **Feature flag** `REALTIME_MODE=off` → automaatne tagasilangus vanale Whisper+Claude+TTS putkele, ühe `.env` muutuja muutmisega |
| iOS Safari WebRTC quirks | Keskmine | Mobiilikasutaja ei kuule heli | Mobiilikasutajatel `REALTIME_MODE_MOBILE=off`, desktopil sees |
| Latentsus halvem kui lubatud (>1.5s) | Madal | Kogemus halvem kui praegu | A/B test (vt allpool) → kui keskmine latentsus tõuseb, lülitume tagasi |
| Mudel räägib liiga palju (>180 token reply) | Keskmine | Vastus tundub robotlik | `max_response_output_tokens: 120`, prompt-i kohandamine |
| Mudel ignoreerib AGOP-i | Keskmine | Mentor läheb "coach mode'i" | Süsteemiprompt täielik regression test (`pytest tests/test_realtime_agop_lock.py`) |
| Konto kulutab krediiti liiga kiiresti | Madal | Eelarve ületus | Cloudflare rate-limit: 1 istung / 10 min / IP, sessiooni max kestus 15 min |

**Feature flag arhitektuur:**

```python
# server.py
REALTIME_MODE = os.environ.get("REALTIME_MODE", "off")  # "off" | "on" | "rollout_10pct"

@app.post("/api/clarity/realtime/session")
async def realtime_session(req):
    if REALTIME_MODE == "off":
        raise HTTPException(503, "Realtime mode disabled; use /api/clarity/stt + /api/cabinet/message")
    if REALTIME_MODE == "rollout_10pct" and hash(req.user_id) % 10 != 0:
        raise HTTPException(503, "Not in rollout cohort")
    # ... issue ephemeral token
```

```jsx
// Frontend
const useRealtime = await fetch('/api/clarity/realtime/session', {method: 'POST', ...})
  .then(r => r.ok)
  .catch(() => false);

if (useRealtime) {
  return <RealtimeVoiceFlow />;
} else {
  return <LegacyVoiceFlow />;   // praegune Whisper+Claude+TTS putk, puutumata
}
```

**Tähtsaim reegel:** vana putk (`Whisper → Claude → TTS`) **EI EEMALDATA** koodist. Ta jääb tagavararajaks **vähemalt 30 päeva** pärast Realtime'i live'i panekut. Alles siis kustutame.

### 2.6 A/B test plaan

**Etapp 1 (esimesed 5 päeva):** ainult mina (asutaja + insener) testime Realtime'i `REALTIME_MODE=on` koos.
**Etapp 2 (järgmised 5 päeva):** `REALTIME_MODE=rollout_10pct` — 10% kasutajatest saab Realtime'i, 90% jääb vana putke peale. Mõõdame:
- keskmine latentsus
- istungi keskmine pikkus (kui Realtime töötab paremini, istungid muutuvad pikemaks)
- kasutaja tagasi-tuleku määr 7 päeva jooksul (`returning_user_within_7d`)
**Etapp 3 (kui Etapi 2 numbrid head):** `REALTIME_MODE=on` kõigile.
**Etapp 4 (30 päeva pärast):** vana koodi kustutamine.

### 2.7 Maksumus (tegelikud arvud)

**Eelarve väikese beeta (5–20 wanderit päevas):**
- Iga istung keskmiselt 8 minutit
- Sisendaudio: ~$0.06/min × 8 = $0.48
- Väljundaudio: ~$0.24/min × 4 (mentor räägib ~50% ajast) = $0.96
- **Kokku per istung: ~$1.44**
- **Kuu peale (15 wanderit × 30 päeva = 450 istungit): ~$650**

**Praegune Whisper+Claude+TTS samade istungite peale:** ~$420 kuus

**Vahe:** ~$230 lisaks kuus. **Vastutasuks: latentsus 3–7s → 600–1200ms.**

**See on minu hinnangul õige raha. Mitte 10x, vaid 1.5x kõrgem kulu — ja kvalitatiivne hüpe kogemuses.**

---

## 3. Tehniline analoog — NVIDIA Audio2Face fikseeritud kuluga (asutaja palve)

Asutaja palus uurida, **kas Audio2Face self-hosted on viaalne** Soul Machines'i taseme miimika saavutamiseks fikseeritud kuluga.

### 3.1 Mis on Audio2Face tehniliselt

**Lühivastus:** Audio2Face võtab audiosignaali sisendiks ja **toodab blendshape-väärtused** (näo deformatsioonid: huulte avanemise määr, kulmude liikumine, silmade pilgutus, lõuapööre). See **EI ole** 3D-renderdaja — ta on **audio → näodeformatsioon** mudel. **Renderdamine on eraldi.**

See on tähtis tähelepanek, sest see avab **odavama tee:**

### 3.2 Kaks teed Audio2Face'iga

#### Tee A — **Täielik 3D pipeline (Soul Machines'i analoog)**

- Audio → A2F → MetaHuman 3D mesh → Unreal Engine renderer → video stream → kasutaja brauser
- Vajab: NVIDIA L40S või A100 GPU + Unreal Engine + MetaHuman'i mesh
- Server: 1× L40S = ~$1.50–2.20/h = **~$1100–1600/kuu**, **24/7 always-on**
- Mõju: üks samaaegne kasutaja per GPU instance (Unreal renderer on heavyweight)
- 1000 kuist kasutajat (= ~5–15 samaaegset peak) → **3× L40S = ~$3500–4800/kuu**

#### Tee B — **2D portree + blendshape morph (odavam, brändile parem)**

- Audio → A2F → blendshape weights (huul, lõug, silmad, kulm) → **morph rakendub Sora 2 genereeritud 2D portreele** läbi brauseri canvas/WebGL
- Vajab: 1× A10 GPU **ainult A2F NIM teenuse jaoks** (renderdus toimub kasutaja brauseris)
- Server: 1× A10 = ~$0.90/h = **~$650/kuu**, 24/7
- Mõju: kuni ~10 samaaegset kasutajat per GPU
- 1000 kuist kasutajat → **1× A10 piisab = ~$650/kuu**
- **AGA:** 2D portree blendshape-morph ei näe **väga** korralik välja kõigi liigutustega — huulte sünkroonim on OK, aga lõua/kaela morph paneb portree "venima"

**Aus järeldus Tee B kohta:** see on huvitav, **aga keerukas implementatsioon (Faas 4 territoorium, mitte Faas 3)**, ja ta annab "ambient lipsync" mida me **niikuinii saame** Faas 1 `speaking_subtle` MP4-loop'iga **ilma serveri GPU-ta**. **Lipsync täpsus ei muuda kogemust** sellel emotsionaalsel tasemel.

### 3.3 Kuludetabel — 1000 kasutaja kuus (asutaja palve)

| Lahendus | Ühekordne | Jooksev (kuu, 1000 kasutajat) | Latentsus | Kvaliteet | Brändisobivus |
|---|---|---|---|---|---|
| **Faas 1: Sora 2 MP4 loops (idle + speaking)** | **$8** | **$0–20 (CDN)** | 0ms | "Hingav portree, ambient mouth motion" | ⭐⭐⭐⭐ Sobib täielikult |
| **Faas 3: Lottie rigituud 2D siluett** | $200 (Fiverr) | $0 | 0ms | "Reaktiivne, 8 olekut, sümboolne" | ⭐⭐⭐⭐ Sobib |
| **Tee B: A2F + 2D morph** | ~$2000 (arendus) | ~$650 (A10 24/7) | ~150ms | "Real lipsync 2D-l, kohati 'venitav'" | ⭐⭐⭐ Tundub eksperimentaalne |
| **Tee A: A2F + MetaHuman + Unreal** | ~$5000 (arendus + asset) | ~$3500–4800 (L40S kolmik) | ~300ms | "Soul Machines-tase 3D, photoreal" | ⭐⭐ Uncanny risk, vastu brändile |
| **Soul Machines SaaS** | 0 | ~$3000–8000 ($0.30–0.80/min × 10K min) | ~400ms | Photoreal, kuid "müügiagent" tunne | ⭐ Vastu brändile |

**Selge järeldus:** Faas 1 + Faas 3 annavad **80% kogemusest 5% kulu eest.** Faas A ja Tee A on **õigustatud alles siis kui 1000 kasutajat on tasulised ja iga klient on €30+ kuus** — alles siis $3500–4800 GPU kuukulu jagatakse 1000+ kliendi peale ja tuleb tasapinnale.

**Soovitus seetõttu:** **EI Audio2Face'ile** kuni Faas 4 (1000+ maksvat kasutajat). Seni Sora 2 + Lottie pakuvad parima ROI.

---

## 4. Implementatsiooni järjekord ja ajakava

### Nädal 1 (kohe pärast asutaja "go"):
- [ ] Päev 1: Sora 2 prompt'ide järelvaatlus + esimene genereerimine (4 videot) — **$8 krediidil**
- [ ] Päev 1: asutaja vaatab 4 MP4-i ja annab Y/N. Vajadusel regenereerime.
- [ ] Päev 2: `GuidePresence.jsx` MP4-tugi + `crossfade` üleminek `idle ↔ speaking`
- [ ] Päev 2: regression test (`pytest tests/test_stage2_8c_chatpanel_regression.py` peab edasi rohelisena töötama)
- [ ] Päev 3: **smoke test** + asutaja vaatab live preview-l

### Nädal 2 (alles pärast Nädal 1 valmis ja asutaja heaks kiitnud):
- [ ] Päev 1–2: OpenAI Realtime API integration plan kood
  - `/api/clarity/realtime/session` endpoint
  - Frontend `<RealtimeVoiceFlow />` komponent (paralleelne `<LegacyVoiceFlow />`-iga)
  - Feature flag `REALTIME_MODE` `.env`-s
- [ ] Päev 3: AGOP regression test Realtime'i jaoks
- [ ] Päev 4: asutaja sisetestid (`REALTIME_MODE=on`)
- [ ] Päev 5: lülitumine `REALTIME_MODE=rollout_10pct`, mõõdetakse 5 päeva

### Nädal 3+ (kui Faas 2 mõõdikud head):
- [ ] Faas 3 — Fiverr disainer Lottie rigituud silueti jaoks ($200 ühekordne)
- [ ] Vana Whisper+Claude+TTS putke kustutamine 30 päeva pärast Realtime'i live'i

---

## 5. Mida ma teen JÄRGMISENA, kui asutaja annab "go"

Konkreetselt, kohe pärast `OK`-d:

1. **Genereerin esimese Sora 2 video** (`grace_idle.mp4`) ülaltoodud prompt'iga. **Näitan sulle linki enne kui ma teisi genereerin.** Selline ühe video kulu = $1.50.
2. Kui sa kiidad heaks, genereerin ülejäänud kolm (kokkuvõttes $6).
3. Kui sa ütled "nägu pole õige", ma pakun **3 prompt'i variatsiooni** ja sa valid.
4. Alles seejärel ma puudutan koodi.

**Asutaja luba mida ma vajan:**

> "Genereeri esimene `grace_idle.mp4` selle prompt'iga. Näita mulle linki. Edasi otsustan."

või

> "Muuda prompt'i nii: [...]"

või

> "Stop. Faasi 1 ei alusta enne kui [...]"

---

## 6. Riskid ja mida ma EI tee ilma loata

❌ Ma ei alusta Faas 1-ga enne kui sa kiidad nelja Sora 2 prompt'i heaks (saad lugeda ülaltoodud osa 1).
❌ Ma ei alusta Faas 2-ga enne kui Faas 1 on live ja sa tunned, et "see on parem kui staatiline portree".
❌ Ma ei lülita `REALTIME_MODE=on` enne kui esmalt mina ise testin desktopil + iPhone Safarit ja kõik mõõdikud on rohelises.
❌ Ma ei kustuta vana Whisper+Claude+TTS putket 30 päeva jooksul.
❌ Ma ei lisa Hume AI-d ega Audio2Face'i selles tsüklis.
❌ Ma ei muuda AGOP §A ega §B prompt'e — need on sõnasõnaliselt ka Realtime'is.
❌ Ma ei muuda mingit DB skeemi.
❌ Ma ei muuda LemonSqueezy ega Resend integratsiooni.

---

## 7. Kokkuvõte ühel real

> Faas 1 (Sora 2 hingav portree, $8) + Faas 2 (OpenAI Realtime, +$230/kuu) annavad **80% Soul Machines'i emotsionaalsest mõjust 2% Soul Machines'i kulul**, säilitades samal ajal "vaikne kaaslane, mitte müügiagent" brändi. Audio2Face self-hosted on **viaalne aga ülearu** kuni 1000 tasulise kasutajani. Hume AI lükatud edasi sama läveni.

— dokumendi lõpp —
