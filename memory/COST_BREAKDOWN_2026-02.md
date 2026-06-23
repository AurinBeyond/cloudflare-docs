# KULUDE & KASUMI REAALSUSKONTROLL — Norra ENK
**Kuupäev:** 2026-02 · **Juriidiline vorm:** Enkeltpersonforetak (ENK) Norras
**Eesmärk:** Šveitsi kella täpsus. Ükski euro ei tohi olla varjatud.

---

## ⚠️ KÕIGE OLULISEM HOIATUS — ENNE TABELEID

Kõik allolevad arvud on **TURVALISED VAHEMIKUD**, mitte täpsed lubadused. Kolm muutujat sõltuvad reaalsest kasutusest, mida me **veel ei tea**:

1. **ElevenLabs hääle minutid kasutaja kohta** — võib varieeruda 100x (5 min vs 500 min/kuu)
2. **Emergent krediidi kasutus** — sõltub LLM-kõnede arvust, prompti pikkusest, mudeli valikust
3. **Külastajate hulk** — 100 vs 10 000 muudab kõik kulud astmeliselt

**Iga tabel allpool sisaldab kolme stsenaariumi: 🟢 KONSERVATIIVNE / 🟡 REALISTLIK / 🔴 PINGELINE.**

---

## 1. FIKSEERITUD KULUD (igakuised, sõltumata kasutajatest)

| Kululiik | Allikas | Konservatiivne | Realistlik | Pingeline |
|---|---|---:|---:|---:|
| **Emergent hosting (baas)** | Emergent platvorm | €30/kuu | €30/kuu | €30/kuu |
| **Domeen** (prulesoul.site) | aastane jaotatud | €1/kuu | €1/kuu | €1/kuu |
| **MongoDB Atlas** (free tier piires) | praegu free | €0 | €0–€15 | €25 |
| **Email saatmine** (Resend / SES) | väike kogus | €0 | €5 | €15 |
| **Analytics (GA4)** | tasuta | €0 | €0 | €0 |
| **Backup / monitoring** | võimalik tulevikus | €0 | €5 | €15 |
| **KOKKU FIKSEERITUD** | | **€31** | **€41–€56** | **€86** |

**Aasta kohta:** €372 / €492–€672 / €1 032

---

## 2. EMERGENT KREDIIDI RISK (kriitiline!)

Emergent kasutab krediidi-süsteemi. **Kui sa lähed üle krediidi limiidi, koduleht VÕIB lakata töötamast** kuni täidad rahakoti uuesti. See on **eksistentsiaalne risk**, kui 10 000 inimest tuleb korraga.

### Krediidi tarbimise allikad:
- **LLM-kõned** (Claude/Gemini/OpenAI Emergent Key kaudu)
  - Iga sõnum vestluses = ~$0.003–$0.02 (sõltub mudelist)
  - 100 sõnumit/päev = ~$0.50–$2.00/päev
- **Nano Banana pildigeneratsioon** = ~$0.04/pilt
- **Hosting + bandwidth**
- **OpenAI Whisper / TTS** (kui kasutame)

### **KAITSESTRATEEGIA — KRITLIK!**

**A. Rate limiting kõigil LLM-pinnaдel:**
```
Anonüümne (Explore): 0 LLM-kõnesid (kõik staatiline)
Tasuta beta-konto:    5 LLM-sõnumit / päev kokku
Journey ostja:        50 LLM-sõnumit / kuu
Companion:           500 LLM-sõnumit / kuu (~16/päev)
```

**B. Soft paywall:**
Kui kasutaja kvoot täis → "Reflektsiooni hetk: 24 tundi vaikust enne järgmist sõnumit." (mitte "OSTA NÜÜD!")

**C. Krediidi monitor:**
- Admin panel näitab päeva, nädala, kuu LLM-kulu
- Automaatne email kui krediit < 20% järelejäänud
- Kõva alarm kui krediit < 5%

**D. Eelarve cap:**
Igapäevane LLM-eelarve **€10/päev = €300/kuu max**. Üle selle: kõik LLM-pinnad lähevad "vaiksesse režiimi" automaatselt.

### Eeldatav Emergent krediidi kulu / kuu:

| Stsenaarium | Kasutajaid | Eeldatav LLM-kulu/kuu |
|---|---|---:|
| 🟢 Beta käivitus | 20 aktiivset | €15–€30 |
| 🟡 100 tasuta + 10 ostjat | 110 | €60–€150 |
| 🔴 10 000 viral hetk | 10 000 (rate-limited) | €200–€500 (CAP!) |

**Top-up:** Emergent universaalse võtme krediiti saab juurde "Profile → Universal Key → Add Balance" kaudu. Auto top-up on võimalik.

---

## 3. ELEVENLABS HÄÄLE KULUD (kõrgeim risk!)

ElevenLabs ConvAI ja TTS hinnad (~2026 hinnatasemed, kontrolli pre-launch):

| Plaan | Sisaldab | Hind |
|---|---|---:|
| Starter ($5) | 30 000 tähemärki TTS/kuu, ~20 min ConvAI | €5/kuu |
| Creator ($22) | 100 000 tähemärki, ~100 min | €22/kuu |
| Pro ($99) | 500 000 tähemärki, ~500 min | €99/kuu |
| Scale ($330) | 2M tähemärki, ~2000 min | €330/kuu |
| Business ($1320) | 11M tähemärki, ~10 000 min | €1 320/kuu |

**Marginaalne hind kasutaja kohta:**
- ConvAI vestlus: **~€0.08–€0.15 / minut** (sõltuvalt plaanist)
- TTS jutustamine: **~€0.05 / 1000 tähemärki** (~1 min)

### **STSENAARIUM A — Hääl 100% top-up (GPT + sina nõustusite)**

**Companion baasis: 0 hääle minutit.**
Hääl on **ainult kreditipõhine top-up**, ostetakse eraldi.

**Hääle krediidi pakid (ettepanek):**

| Pakk | Minutid | Sinu kulu (ElevenLabs Pro plaanis) | Müügihind | Marginaal | Marginaal % |
|---|---:|---:|---:|---:|---:|
| Small | 15 min | €1.50 | €5.90 | €4.40 | ~75% |
| Medium | 60 min | €6.00 | €19.00 | €13.00 | ~68% |
| Large | 180 min | €18.00 | €49.00 | €31.00 | ~63% |

**MIKS see töötab:**
- ✅ **0 üllatust**: kasutaja teab täpselt, et hääl on extra
- ✅ **0 riski sinule**: kui keegi ei osta hääle krediiti, sa ei kaota raha
- ✅ **Marginaal katab kõik kaasnevad kulud** (Stripe fee, maks)
- ❌ **Friction**: kasutaja peab tegema lisaotsuse (ost eraldi)

**KUI PALJU SA TEENID HÄÄLEST (kui 10 inimest ostavad 60 min paki):**
- Tulu: 10 × €19 = €190
- ElevenLabs kulu: 10 × €6 = €60
- Stripe fee: 10 × (€0.30 + 2.9%) = €8.50
- Bruto kasum (enne maksu): €121.50

---

### **STSENAARIUM B — "Tasuta minutid Companion-is" (RISK!)**

Kui Companion sisaldab näiteks 30 min/kuu tasuta häält:

**10 000 tasuta beta-kasutajat × 30 min × €0.10 = €30 000/kuu kulu.**

**See tapab äri kohe.** Selleks oleks vaja:
- Karmi rate limit (maksimaalne 1 min korraga, 5 min/päev)
- Selge "kui sa ületad limiidi, top-up käivitub automaatselt"

**Ma EI SOOVITA seda stsenaariumi enne kui Companion on 100+ maksvat kasutajat.**

---

### **STSENAARIUM C — Hübriid (post-beta võimalus)**

- Companion sisaldab **5 min/kuu eelvaade** (sissejuhatus, mitte vestlus)
- Üle selle: top-up paketid

Riskhinnang: **TURVALINE,** sest 5 min × 1000 kasutajat = 5000 min = ~€500/kuu max kulu, hõlpsasti kaetud Companion-tulust.

---

## 4. MAKSEVÄRAVATE FEED

| Värav | Fee struktuur | Eelistus |
|---|---|---|
| **Stripe** | 1.4% + €0.25 (EU kaart), 2.9% + €0.25 (non-EU) | ✅ Companion subscription'iks |
| **Gumroad** | 10% + €0.30 (kuni $1k) → 5% + €0.30 hiljem | ✅ One-time Journey ostudeks (juba töötab Hearth-ile) |
| **LemonSqueezy** | 5% + €0.50 | 🟡 Alternatiiv Stripe-le, MoR (Merchant of Record) — käsitleb VAT-i automaatselt |
| **Polar.sh** | 4% + €0.40 | 🟡 Olemasolev kood, MoR — VAT käsitletakse |

**Soovitus:** **LemonSqueezy** kõige jaoks (üks integratsioon, MoR käsitleb VAT-i). Või Stripe + ettevõtte VAT-registreerimine, kui käive ületab Norra MVA piiri (50 000 NOK = ~€4 200/aasta).

---

## 5. NORRA ENK MAKSUD (kriitiline!)

### Norra Enkeltpersonforetak (ENK) maksuparameetrid:

| Maks | Määr | Selgitus |
|---|---:|---|
| **Personlig inntektsskatt** (tulumaks) | ~22–47% astmeline | Madal sissetulek = ~22%, kõrge sissetulek = kuni 47.4% |
| **Trygdeavgift** (sotsiaalmaks) | **11.4%** | ENK-le, näpunäide: kõrgem kui palgatöötaja 7.9% |
| **MVA (käibemaks)** | **25%** | Kui käive > **50 000 NOK** (~€4 200) aastas, registreerimine kohustuslik |
| **Trygdeavgift miinimumi piir** | 69 650 NOK | Kui tulu alla selle, ei maksta trygdeavgifti |

### **Reaalne maksuosa erinevatel käivetel:**

| Aastakäive (NOK) | Aastakäive (€) | Eeldatav maks % (kokku) | Netokäibest järelejäänu |
|---:|---:|---:|---|
| 100 000 NOK | ~€8 400 | ~22% + 11.4% = **33.4%** | €5 590 |
| 300 000 NOK | ~€25 200 | ~28% + 11.4% = **39.4%** | €15 270 |
| 600 000 NOK | ~€50 400 | ~38% + 11.4% = **49.4%** | €25 500 |
| 1 000 000 NOK | ~€84 000 | ~45% + 11.4% = **56.4%** | €36 620 |

⚠️ **Need on ligikaudsed.** Norra maksukalkulaator: skatteetaten.no/skattekalkulator

### **MVA praktiline mõju:**

Kui sinu **klientide enamus on EL-st** (Eestist, Norrast, USA-st), siis:
- **Norra kliendid:** sa pead lisama 25% MVA hinnale, kui oled MVA-registreeritud
- **EL kliendid (ettevõtjad):** B2B reverse-charge, 0% MVA
- **EL kliendid (eraisik):** OSS / EU VAT MOSS reeglid — keeruline
- **USA kliendid:** ei MVA-d

**Soovitus:** Kasuta **LemonSqueezy või Polar.sh** kui Merchant of Record. Nemad käsitlevad kogu rahvusvahelist VAT-i automaatselt. Sa saad puhast netot ja sul on Norras vaid ENK tulumaks.

---

## 6. BREAK-EVEN ARVUTUSED (3 mudelit)

### **Mudel 1: Madal hind, mass-müük**
- Companion: **€19/kuu**
- Journey: **€19** (üks kord)
- Eeldame: 50% Stripe MoR-iga, 50% Gumroad-iga

**Tulu/Companion liige peale fee'd:** €19 × (1 - 0.05) = **€18.05/kuu**
**Tulu/Journey ost peale fee'd:** €19 × (1 - 0.07) = **€17.67**

| Fikseeritud kulu/kuu | Vajaminev Companion-liikmete arv (et break-even fikseeritud kulule) |
|---:|---:|
| €56 (realistlik) | **4 Companion-liiget** |

✅ **Väga ohutu** — kuid madal hind tähendab tunneb "odav".

---

### **Mudel 2: Keskmine hind**
- Companion: **€29/kuu**
- Journey: **€29** (üks kord)

**Tulu/Companion peale fee'd:** **€27.55/kuu**

| Fikseeritud kulu/kuu | Vajaminev Companion-liikmete arv |
|---:|---:|
| €56 | **3 Companion-liiget** |

✅ **Ohutu + premium-tunne.** Iga Journey ost lisaks katab Emergent LLM kulud terveks kuuks.

---

### **Mudel 3: Premium**
- Companion: **€49/kuu**
- Journey: **€39** (üks kord)

**Tulu/Companion peale fee'd:** **€46.55/kuu**

| Fikseeritud kulu/kuu | Vajaminev Companion-liikmete arv |
|---:|---:|
| €56 | **2 Companion-liiget** |

⚠️ Risk: hind võib tunduda **liiga kõrge** võrreldes Headspace/Calm (€7-12/kuu). Vajab tugevat positsioneerimist ("see ei ole äpp, see on sanctuary").

---

## 7. KUI 10 000 INIMEST TULEB KORRAGA — STSENAARIUM

**Sa küsisid: "mis juhtub kui 10 000 kasutajat tuleb tasuta pakkumisega?"**

### Aritmeetika ilma kaitsteta:
- 10 000 × 10 LLM-sõnumit/päev × €0.01 = **€1 000/päev = €30 000/kuu** 💀

### Aritmeetika **õige kaitsega** (mida me ehitame):

**Layer 1 — Anonüümne Explore:**
- 0 LLM-kõnesid, 0 hääle kõnesid
- Ainult staatilised lehed, juba toodetud audiod
- **Kulu: €0** (lihtsalt hosting bandwidth)

**Layer 2 — Tasuta beta-konto (rate limited):**
- 5 LLM-sõnumit/päev, 0 hääle minutit
- 1000 sellisest = 5000 sõnumit × €0.01 = **€50/päev = €1500/kuu**
- ⚠️ Kui see hakkab juhtuma: **automaatne kontode külmutamine uutele** kuni krediit täidetud

**Layer 3 — Journey ostja (€29 üks kord):**
- 50 LLM-sõnumit/kuu
- Sa teenisid €29, kulu €0.50, **€28.50 katab kõik muu**
- ✅ Iga Journey ost subsideerib **57 sõnumit tasuta beta-kasutaja jaoks**

**Layer 4 — Companion (€29/kuu):**
- 500 LLM-sõnumit/kuu
- Tulu €27.55, kulu ~€5 LLM-le, **€22.55 katab kõik muu**

### **Magic number:**
**Iga 1 Companion-liige = subsideerib 4–5 tasuta beta-kasutajat.**

**Kui sul on:**
- 100 tasuta + 20 Companion + 10 Journey/kuu = **€690 + €290 = €980 tulu**
- Kulu: ~€56 + LLM €120 + ElevenLabs €99 plaan = **€275**
- **Brutokasum: €705** enne Norra makse (~40%) = **€423 puhasse rahakotti**

✅ **See on jätkusuutlik.**

---

## 8. TURVALINE LANSEERIMISKÄSI

1. **Faas 1 (kuni 50 maksvat klienti):**
   - ElevenLabs **Creator plaan ($22)** — 100 min/kuu
   - Hääl on **100% top-up** (Stsenaarium A)
   - Emergent krediidi cap: €100/kuu
   - **Risk: €0**

2. **Faas 2 (50–200 maksvat klienti):**
   - ElevenLabs **Pro plaan ($99)** — 500 min/kuu
   - Hääl on **endiselt top-up,** võimalik anda Companion-liikmetele 5 min/kuu kingitus
   - Emergent krediidi cap: €300/kuu
   - **Risk: madal**

3. **Faas 3 (200+ maksvat klienti):**
   - ElevenLabs **Scale plaan ($330)** — 2000 min/kuu
   - Saab pakkuda Companion-le 30 min/kuu inkluusiivseid minutid (Stsenaarium C)
   - Emergent: auto top-up sisse lülitatud
   - **Risk: kontrolli all**

---

## 9. MILLEKS SA KASUTAJALT KÜSID HINDA — LÄBIPAISTEV TABEL

Kui kasutaja maksab **€29 Journey**, siis:

| Mida ta tegelikult maksab? | Summa | % |
|---|---:|---:|
| Gumroad/LemonSqueezy fee | €2.00 | 6.9% |
| LLM-kulu (50 sõnumit) | €0.50 | 1.7% |
| Hosting jaotus | €1.00 | 3.4% |
| Norra tulumaks (~25%) | €5.45 | 18.8% |
| Trygdeavgift (11.4%) | €2.48 | 8.6% |
| **Sinu netokäive (peale makse)** | **€17.57** | **60.6%** |

⚠️ Iga €29 Journey ostust **sa saad puhtaks ~€17.50**. See on aus number.

Kui kasutaja maksab **€29 Companion/kuu:**

| Komponent | Summa | % |
|---|---:|---:|
| Stripe/LemonSqueezy fee | €1.45 | 5% |
| LLM-kulu (500 sõnumit) | €5.00 | 17.2% |
| Hosting jaotus | €1.00 | 3.4% |
| Norra tulumaks (~25%) | €5.39 | 18.6% |
| Trygdeavgift (11.4%) | €2.46 | 8.5% |
| **Sinu netokäive** | **€13.70** | **47.2%** |

⚠️ Companion'is on kulu **kõrgem** (rohkem LLM-kõnesid). See on miks Stripe MoR + täpne rate-limit on hädavajalik.

---

## 10. KÜSIMUSED FOUNDERILE — OTSUSTAMISEKS

Enne kui kirjutame ühegi rea koodi:

1. **Maksuvorm:** Kas oled MVA-registreeritud Norras? (Kui käive > 50k NOK/aasta — pead olema.)
2. **Companion baashind:** €19 / €29 / €49 — mis tundub õige?
3. **Journey baashind:** €19 / €29 / €39 — sama küsimus
4. **Hääle mudel:** Kinnitan Stsenaarium A (100% top-up, mitte midagi Companion-is)?
5. **Maksevärav:** LemonSqueezy (üks integratsioon, MoR) vs Stripe + Gumroad segu?
6. **Rate limits:** Kas nõustud nendega: Anonüümne 0 / Tasuta 5/päev / Journey 50/kuu / Companion 500/kuu?
7. **Eelarve cap:** Kas €10/päev LLM-le on okei "kõva pidur" enne kui Companion-tulu kasvab?

---

## 11. KÕIGE OLULISEM ARV

**Kui sa teed kõike õigesti** (rate limit + hääl-top-up + LemonSqueezy MoR):

> **Sul on vaja AINULT 5–10 Companion-liikme**, et katta KÕIK fikseeritud kulud Norra maksudega.

5 maksvat Companion'i = €100/kuu netos peale makse. See katab hostingu, MongoDB, ElevenLabs Creator plaani ja jätab veel.

**See ei ole "äri, mis võib lendu lasta." See on "tugev, kestlik praktika."**

Ja kõige tähtsam: **mitte ükski kasutaja ei tunne end petetuks,** sest hääl on alati eraldi, alati avalik, alati nähtav.
