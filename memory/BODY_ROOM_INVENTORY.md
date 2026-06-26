# Body Room · Sisu kaardistus enne refactor'i

Generated: 2026-02-10 · pärast deploy'd · enne mistahes ümbertegemist

Eesmärk: kaardistada **kogu olemasolev Body Room ökosüsteem**, et uue Polarstar-stiilis pealehe puhul ei kaoks ühtegi olemasolevat teemat.

---

## Top-level marsruudid (Body domeen)

| URL | Komponent | Roll |
|---|---|---|
| `/body-room` | `pages/BodyRoom.jsx` | Praegune Body hub-leht — pikk üks-leht aksessuaar |
| `/body-temple` | `pages/BodyTemple.jsx` | 28-päevane premium "Body Temple" rajareis |

Backend-id (juba olemas):
- `letter_of_admission.py` — Body Temple unlock email (ühekordne)
- `marketing_engine.py` — "body-temple" toode, link `/body-temple`

---

## 1 · BodyRoom.jsx — `/body-room` praegune struktuur

### Sektsioonid järjekorras (12 painted section'it)

| # | data-testid | Roll | Sisu praegu |
|---|---|---|---|
| 1 | `body-room-intro` | Sissejuhatus | Pealkiri "Learning to speak" + sissejuhatava lõik kehast |
| 2 | `body-room-kaelan-intro` | Kaelan'i eyebrow | "Your guide is Kaelan" tüüpi sild |
| 3 | `body-room-kaelan` | **Kaelan'i intro audio kaart** | `kaelan-intro-card`, `kaelan-intro-audio`, `kaelan-intro-play` — kuula Kaelan'it |
| 4 | `body-room-temple-entry` | Body Temple CTA | Suunab `/body-temple`-isse (house-wood-title stiil) |
| 5 | `body-room-silhouette` | **Kehasilhuett 8 klikitava regiooniga** | crown · throat · heart · solar_plexus · belly · hips · hands · feet |
| 6 | `body-room-mood-reflect` | Tuju-peegel | Kontemplatiivne reflectsiooni-kast |
| 7 | `body-room-bridge` | Sild järgmise sektsiooni juurde | Üleminek |
| 8 | `body-room-children` | **5 laste-mustri kaarti** | `children-pattern-*` — laste kehaga seotud mustrid |
| 9 | `body-room-patterns` | **Üldiste mustrite ploki kaardid** | `pattern-*` — täiskasvanu kehakeele mustrid |
| 10 | `body-room-questionnaire` | **Auste-test (Honesty Quiz)** | `quiz-honesty-gate` → `quiz-q-*` → `quiz-submit` → `quiz-result-region-*` + `quiz-result-pattern-*` |
| 11 | `body-room-disclaimer` | Meditsiiniline märkus | `children-medical-note`, `patterns-honesty-note` |
| 12 | `body-room-waitlist` | Waitlist-vorm | Email-ootenimekiri |

### Klikitavad kehaosa-modaalid (silhuett)

Kõik 8 regiooni avavad `body-modal` (`body-modal-close`, `body-modal-illustration`, `body-modal-noted`):

- **crown** — pea ülaosa
- **throat** — kõri
- **heart** — süda
- **solar_plexus** — päikesepõimik
- **belly** — kõht
- **hips** — puusad
- **hands** — käed (twin: paar)
- **feet** — jalad

### Quiz'i tulemus-piirkonnad

`quiz-result-region-*` toodab `quiz-result-pattern-*` soovitusi. Seos: küsimustik → keha-piirkond → mustri-soovitus.

---

## 2 · BodyTemple.jsx — `/body-temple` 28 päeva premium

### Sektsioonid

| data-testid | Roll |
|---|---|
| `body-temple-page` | Lehe konteiner (cream theme) |
| `body-temple-back-to-room` | Tagasi `/body-room`-isse |
| `body-temple-what-you-get` | Mida 28 päeva sisaldavad |
| `body-temple-unlock-cta` | Premium unlock nupp (Stripe) |
| `body-temple-unlocked-badge` | "Avatud — X / 28 days" |
| `body-temple-preview-day1` | Tasuta esimese päeva eelvaade |
| `body-temple-anna-note` | Anna isiklik märkus |
| `body-temple-journey` | 28 päeva visuaalne marsruut (4 nädalat) |
| `body-temple-week-*` | Iga nädala kaart |
| `body-temple-day-modal` | Päeva modaal (kui kasutaja klõpsab päeva) |
| `body-temple-modal-close` | Modaali sulgemine |
| `body-temple-modal-unlock` | Unlock CTA modaalis |
| `body-temple-day-complete-btn` | Märgi päev lõpetatuks |

### 28 päeva struktuur

- 4 nädalat × 7 päeva = **28 ancient keys**
- Iga päev: 3–15 minutit
- Lähtekeel video: "Эти ЗНАНИЯ о теле"

---

## 3 · BodyArchitectureAudioShelf.jsx — 4 audio-võtit

Komponent: täielik audio-shelf, igal nädalal oma värv-aktsent ja Lucide ikoon.

| ID | Nädal | Pealkiri | Lühikirjeldus |
|---|---|---|---|
| `week1` | The First Key | **The Breath** | Keha vanim kaaslane. Kolm pikka väljahingamist, kolm korda päevas, seitse päeva. |
| `week2` | The Second Key | **Listening to the Armor** | Pikk kiri, mille keha kirjutas, kui maailm oli vali. Loeme aeglaselt, kolm korda nädalas. |
| `week3` | The Third Key | **The Radical Pause** | 15 minutit päevas mitte midagi tegemist. Üks väike kohustus eemaldatud. Seitse päeva. |
| `week4` | The Fourth Key | **Coming Home to the Body** | Ei mingit protokolli. Ainult üks küsimus, küsitud lahkelt: kus sa täna oled? |

Audio failid: `/audio/body-architecture-week{1-4}-{breath|armor|pause|home}.mp3`

---

## 4 · BodyRoomChat.jsx — vestlus Kaelan'iga

Faili roll: kompaktne vestluspaneel Body Room'is. Riistvarad:

- **localStorage võti**: `aurin_body_chat_v1` (külalise ajalugu säilib brauseris)
- **Voice I/O**: `useVoiceIO` hook
  - `voice.supportedOut` — kas browser saab text-to-speech
  - `voice.muted` — vaigistuslüliti
  - `voice.speak(text)` — viimase Kaelan'i sõnumi automaatne ettelugemine
- **Kriisi-režiim** (`non-crisis` flag) — ei loeta automaatselt ette, kui sõnum on kriitiline
- Stateless serverile (kogu pais on kohaliku)

⚠ See on **olemas ja töötab**. Uus Body Room hub PEAB selle alles jätma.

---

## 5 · BodyLensSelector.jsx — vaate-läätsed

Komponent emiteerib `LENS_EVENT` (CustomEvent `aurin:lens-change` tüüpi) — võimaldab lülitada Body Room'i vaateid (nt "soft" / "clinical" / "child" jne). Praegu kasutusel, ei tohi katki.

---

## 6 · BodyTemple ökosüsteem (laiem)

| Fail | Roll |
|---|---|
| `backend/letter_of_admission.py` | "Letter of Admission" email kasutajale unlock'i järel (ühekordne) |
| `backend/marketing_engine.py` | Marketing nudge'd `body-temple` toote suunas (`/body-temple`) |
| Stripe / payment | Premium unlock (28-day cabinet) |

---

## Mida UUS Body Room HUB peab säilitama

Kohustuslikud (mitte hävitada):

1. **`/body-room` ja `/body-temple` marsruudid** — vältida URL break.
2. **8 klikitavat kehasilhuett-regiooni** (crown / throat / heart / solar_plexus / belly / hips / hands / feet) — väärtuslik interaktsioonimuster.
3. **Kaelan kui giid** — Kaelan'i audio-intro kaart + chat-vestlus.
4. **Honesty Quiz** — keha-piirkonna → mustri-soovitus loogika.
5. **4 Body Architecture audio-võtit** (Breath / Armor / Radical Pause / Coming Home).
6. **Children patterns vs Adult patterns** kaks eraldi sektsiooni.
7. **Body Temple sissepääs CTA-na** — 28-päevase rajareisi mõõdupuu.
8. **BodyRoomChat** voice + text — Kaelan'iga rääkimine.
9. **BodyLensSelector** — vaate-läätsede süsteem.
10. **Body Temple 28 päeva struktuur** — `/body-temple` täies hiilguses.

---

## Mida UUEKS võib teha

Vabad valikud (kõik säilitades):

1. **Polarstar-pattern Body Room hub** — uus painted hero pilt + invisible hotspot-id olemasolevate sektsioonide juurde (silhuett, audio shelf, quiz, temple-entry).
2. **Topic kaartide süsteem** Alistari mustri järgi — Body Room jaoks oma `BODY_TOPIC_ZONES` koos kategoriseerimisega:
   - **Sissejuhatus** (Kaelan, Learning to speak)
   - **Kehasilhuett** (8 regiooni)
   - **Mustrid** (laste vs täiskasvanu)
   - **Audio-võtmed** (4 nädalat)
   - **Honesty Quiz** (test)
   - **Body Temple** (premium 28 päeva)
   - **Vestlus** (Kaelan voice + text)
3. **Field Study cards** — kui ehitad rohkem painted topic-icone, kui sisu on, samasugune muster nagu Alistaris.

---

## Otsuste-vooluskeem järgmiseks sammuks

```
Kas sul on uus painted Body Room hub pilt?
│
├── JAH → Polarstar-muster nagu Alistairil:
│         1. saada painted pilt
│         2. mina ehitan BODY_TOPIC_ZONES + topic detail
│         3. säilitan kõik 10 olemasolevat sektsiooni
│
└── EI → Käesolev BodyRoom.jsx jääb, ainult
         täiendame teemakaarte (Alistairi `/course-room` stiilis)
         pealehel ilma painted pildita.
```

Mida sa nüüd valid?
