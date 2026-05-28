# Avatar + Realtime Voice — Vastus asutaja "Digital Human Psychology" brief'ile
**Kuupäev:** 2026-02-10
**Autor:** AH (insenerigent)
**Staatus:** STRATEEGILINE ANALÜÜS — koodi ei muudetud. Ootab asutaja otsust enne mistahes implementatsiooni.

---

## 0. Üks lause, mis loeb

Asutaja brief kirjeldab kahte asja, mis 2026. aastal üksteisele matemaatiliselt vastu töötavad:
- **Soul Machines'i tasemel fotorealistlik 3D-mentor**
- **Fikseeritud kuukulu 100 000 kasutaja juures**

Üks neist peab andma järele. **Soovitus: loobu esimesest**, sest see on samuti **brändiga vastuolus** (asutaja enda fraseering: *"vaikne kuulaja, mitte rõõmus teenindaja, mitte hologramm-fantaasia"*).

---

## I osa — Tehniline analüüs (tegelikud 2026. aasta numbrid)

### 1. NVIDIA ACE / Audio2Face oma serveris

**Reaalsus:**
- ACE Microservices (Audio2Face + Riva ASR/TTS + Omniverse render) vajab NVIDIA A10 / A100 / L40S GPU-d.
- Üks A10 (24GB) teenindab ~5–10 samaaegset Audio2Face voogu — **mitte 100 000.**
- A10 cloud rent: ~$0.90–1.40 / tund = ~$650–1000 kuus, alati sees, 1 instants.
- A100 80GB: ~$2200–3600 kuus.
- Fikseeritud kulu **ainult juhul** kui hoiad GPU 24/7 üleval — ka öösel, kui keegi ei räägi.

**Realistlik latentsus:**
- Audio2Face ise: ~50–120ms
- ASR + LLM + TTS + render kokku: 800–1400ms parimal juhul (sama GPU regioon)
- Browser WebRTC: +100–300ms
- **Realistlik kogu vastuse latentsus: 1.0–1.8 sekundit.** Soul Machines väidab 0.4s — turundus; reaalsuses 0.8–1.2s.

**Skaleerimismatemaatika:**
| Samaaegseid kasutajaid | GPU pargi suurus | Kuukulu |
|---|---|---|
| 5–10 | 1× A10 | ~$800 |
| 50 | 5–8× A10 | ~$4000–6000 |
| 500 (100K MAU peak) | ~50× A10 või 10× A100 | **$30 000 – 60 000 kuus** |
| 5000 samaaegset (= 100K igapäevast) | ~500× A10 | **$300 000+ kuus** |

**Järeldus:** "oma serveris NVIDIA ACE" ei ole odav lahendus massiturule. Soul Machines / UneeQ minutitasu mudel pole rumalus — see on füüsika.

### 2. Hume AI emotsionaalne analüüs

- ~$0.07–0.12 per minut sisendaudio (Octave EVI 2, 2026 hinnastamine)
- WebSocket streaming lisab 150–400ms latentsust kui blokeeriv
- Saab joosta paralleelselt STT-ga, kasutada järgmise vooru juhtimiseks
- **Per-minute kulu**, ei lahenda skaleerimisprobleemi

**Aus arvamus:** Hume AI on parim hääletoonide tonaalse analüüsi tööriist 2026, **AGA brändile (vaikne kuulaja) liigne.** Claude Sonnet 4.5 + olemasolev `_split_signals` + AGOP §A teevad 80% sama tööd ilma lisalatentsuse ja -kuluta.

**Soovitus:** EI Hume AI-le enne kui 500+ päevast maksvat kasutajat.

### 3. Hääle süntees: ElevenLabs vs OpenAI Realtime vs StyleTTS2

| Pakkuja | Esimese baidi latentsus | Hind | Brändisobivus |
|---|---|---|---|
| **OpenAI Realtime API** | ~400–700ms (audio-to-audio) | ~$0.06/min sisend, $0.24/min väljund | ⭐⭐⭐⭐⭐ |
| ElevenLabs Turbo v2.5 streaming | ~75–150ms TTS (vajab LLM-i ees) | ~$0.30/1000 tähemärki + $22/kuu baas | ⭐⭐⭐⭐ |
| StyleTTS2 self-hosted | ~80–200ms | "tasuta" mudel + ~$400–800/kuu GPU | ⭐⭐⭐ |

**Järeldus:** OpenAI Realtime API on parim valik:
1. Kustutab kogu vahepealse latentsuse korraga (3–7s → 600–900ms)
2. Sama Emergent LLM key
3. Hääle kvaliteet eristamatu ElevenLabs Turbo'st rahuliku-mentori kontekstis
4. Latentsuse võit > häälekvaliteedi võit

---

## II osa — Ärilised tõed

### Skaleeritavus 100K-le

- 100K igapäevast aktiivset ≠ 100K samaaegset
- Realistlik samaaegne huvitipp: 2000–5000 inimest
- Iga istung 5–12 min
- Iga minut hääl-vestlust maksab **vähemalt $0.05–0.15**, sõltumata pakkujast (GPU+LLM töötab sekundipõhiselt)
- **Päevane kulu 100K DAU juures: $5000–15 000 päevas = $150 000–450 000 kuus**

See pole sinu süsteemi probleem — see on **kõikide hääl-AI ettevõtete reaalsus 2026**.

**Ainus tee 100K-le fikseeritud kuluga:** local-first render brauseris. 2D-silueti Lottie animatsioon töötab sellega täielikult. Fotorealistlik 3D mitte (WebGPU + telefon pole 2026 valmis).

### Psühholoogiline disain — juba lahendatud

- AGOP §A: lühikesed laused, üks peegeldus, üks küsimus max
- AGOP §B: keeld nõuda, diagnoosida, raviplaane teha
- Reality Law: keeld sõltuvuse-keelele ("ma olen siin alati")
- `_split_signals`: toonisignaalid eemaldatakse nähtavast tekstist

**Pole vaja Hume AI-d.** Vaja on **säilitada praegune Claude Sonnet 4.5 + AGOP arhitektuur**, asendada audiokanal OpenAI Realtime API-ga.

---

## III osa — Kriitiline hinnang

### Kas "oma 3D-mootor" on konkurentsivõimeline Soul Machines'iga 2026?

**Ei, ja see on hea.** Kolm põhjust:

1. **Sinu klient ei taha Soul Machines'i.** Soul Machines on müügiagentide jaoks (pank, kindlustus). Sinu klient kannab raskust, ei taha vaadata naeratavat 3D-nägu.
2. **Fotorealistlik nägu lisab umbusku, mitte usaldust** raske teema kontekstis. Uncanny valley.
3. **Soul Machines'i levinud kriitika:** "uncanny + müügimees tunne." Sinu bränd on vastu sellele.

**Tegelik konkurentsieelis:** õige emotsionaalne valik, mitte parem 3D.

### Suurim tehniline risk

**Top 3:**

1. **Latentsus, mitte realism.** 3s vaikus tapab kogemuse alati. **#1 prioriteet. OpenAI Realtime API parandab selle.**
2. **iOS Safari autoplay + MediaRecorder.** 60% kasutajaid tuleb mobiililt. **P0, testimata.**
3. **TTS mehaaniline serv pikkade lausete lõpus.** Lahendus: lühem reply (AGOP §A) + Realtime API.

**Mida riskina EI ole:** 3D-näo puudumine.

### Samm-sammuline prototüüpimine

**Faas 1 — see nädal (~$6, ühekordne):**
- 2 Sora 2 silueti MP4 loop'i (Grace + Clarity, kumbki 15s)
- Hingamine + keha-kõikumine + üks käeviipe
- Asenda staatiline portree
- Test: kas tunned "see hingab"

**Faas 2 — järgmine nädal (~2 päeva tööd, sama OpenAI kulurea):**
- OpenAI Realtime API integratsioon Clarity Release + Body Room
- Vastuse latentsus 3–7s → 600–900ms
- Test: kas pausi enam pole

**Faas 3 — Faas 1+2 töötavad ja tahad rohkem (~$200, ühekordne):**
- Fiverr Lottie-rigituud siluett, 8 olekut (idle / listening / speaking / nodding / wave / settling / breath-in / breath-out)
- Reaktiivne, brauseris, 0€ jooksvat kulu
- Test: kasutaja istub 10 min ja unustab, et see pole inimene

**Faas 4 — kui 1000+ maksvat kasutajat:**
- NVIDIA ACE või Soul Machines SaaS API üks premium-tasku (€99/kuu "Companion+")
- Ainult selle taseme kasutajatele
- Eraldi tooteliin

**Faas 5 — kunagi tulevikus, kui Faas 4 maksab end ära:**
- Oma GPU park
- Mõistlik alles 5000+ samaaegse kasutaja juures (~$500K+ MRR)

### Mida EI soovita

| Ettepanek brief'is | Soovitus | Põhjus |
|---|---|---|
| NVIDIA ACE oma serveris | **Ära** (2026) | $30K–60K/kuu fikseeritud GPU enne kliente |
| Hume AI | **Lükata edasi** | Latentsus + kulu, mida kasutaja ei eralda Claude'ist |
| ElevenLabs Turbo | **Lükata edasi** | OpenAI Realtime annab parema kogemuse ühe putkega |
| Local-first 3D | **Mitte 2026** | WebGPU + telefonid pole valmis |
| Fotorealistlik nägu | **Mitte selle brändi all** | Vastuolus "vaikne kuulaja" identiteediga |

---

## Mida ma asutajalt vajan

**Üks rida:**
> "Faas 1 + Faas 2 ette. Faas 3 alles kui 1+2 töötavad. NVIDIA ACE ja Hume AI lükkame edasi."

Niipea kui see tuleb:
1. Sora 2 prompt'id silueti MP4-de jaoks → näitan **enne** genereerimist (krediidikontroll)
2. OpenAI Realtime API integratsiooniplaan praegusesse `/api/clarity/stt` + `/api/clarity/tts` putkesse → mis võib katki minna + rollback-plaan
3. Peatun ja ootan jälle.

— dokumendi lõpp —
