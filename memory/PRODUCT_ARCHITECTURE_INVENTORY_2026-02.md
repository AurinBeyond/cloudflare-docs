# TOOTE ARHITEKTUUR & INVENTUUR — Pre-Beta Lukk
**Kuupäev:** 2026-02 · **Vorm:** Norra ENK / freelancer
**Eesmärk:** Lukustada toode ENNE hinda. Igal asjal üks uks, üks nimi, üks roll.

---

## 1. NELI KASTI (lukustatud arhitektuur)

```
        EXPLORE              JOURNEY              COMPANION              PRIVATE
        (tasuta)            (€ üks kord)          (€ kuus)              (€€€ kõrge puute)
        ──────              ──────────            ──────────            ──────────────
        Sissepääs            Üks teekond           Kõik teekonnad        1-1 saateaeg
        Hingatav             Lõpetatav             Hooldatav             Põhjalik
        Anonüümne            Konkreetne            Pikaajaline           Personaalne
```

**Filosoofiline loogika** (sinu sõnastus):
- **Unikaalsus** — iga kast pakub erinevat sügavust, mitte sama asja eri hindadega
- **Läbipaistvus** — kasutaja teab täpselt, mida ta saab JA mis maksab täiendavalt (hääl!)
- **Selge arusaamine** — uksed ei kattu; "kuhu ma kuulun" on alati ilmne
- **Väärtuste jagamine** — Library ja jagamise rituaalid jäävad tasuta kõigile

---

## 2. PRAEGUSE KOODIBAASI INVENTUUR

### 🟢 EXPLORE — Tasuta sissepääs (säilitatakse, kaitstakse krediidikuludest)

| Toode | Praegune URL | Olemus | Otsus |
|---|---|---|---|
| **Sanctuary Landing** | `/` (SanctuaryPreview) | 5 toa kataloog + Wanderer Gate | ✅ JÄÄB — peamine sissepääs |
| **Library Hub** | `/library` | Lugemissaal (3 sektsiooni) | ✅ JÄÄB |
| **Library — Adults** | `/library/adults` | Tasuta artiklid | ✅ JÄÄB |
| **Library — Kids** | `/library/kids` | Tasuta lastelood | ✅ JÄÄB |
| **Library — Kids · Draw** | `/library/kids/draw` | Värvimisstuudio | ✅ JÄÄB |
| **Grace Light Pages** | `/grace`, `/grace/speak`, `/grace/write`, `/grace/evening`, `/grace/messages` | Soft-door info | ✅ JÄÄB (ei ole chat) |
| **Grace Library** | `/grace/library`, `/grace/library/:slug` | 5 artiklit | ✅ JÄÄB |
| **Alistair Light** | `/alistair`, `/alistair/explore`, `/alistair/read`, `/alistair/library`, `/alistair/laboratories` | Avalik laboratooriumi maandumine | ✅ JÄÄB |
| **Polarstar Kids — public** | `/kids-universe/polarstar/*` | Lapse maandumine | ✅ JÄÄB |
| **Listen / Hearth audios (5)** | `/listen/hearth/*`, `/listen/little-star` | Eelvaate audiod | ✅ JÄÄB (marketing meelitus) |
| **About / Philosophy / Blog / Legal / FAQ / What-This-Is** | mitmed URLid | Lugu, juriidika | ✅ JÄÄB |
| **Seven Quiet Nights** | `/seven-quiet-nights` | Tasuta perekond väljakutse | ✅ JÄÄB (lead magnet) |
| **Presence** | `/presence` | Avalik Grace-demo | ✅ JÄÄB (panga/demo link) |
| **Start Here** | `/start-here` | 3-tee jaotaja | ✅ JÄÄB |
| **Catalogue** | `/catalogue` | Kõik tooted nimekirjas | 🟡 ÜMBERSÕNASTADA pärast inventuuri |
| **Reach Out / Referral / Portal** | mitmed URLid | Sotsiaalsed | ✅ JÄÄB |
| **Wanderers Agreement** | `/wanderers-agreement` | Sissepääsu rituaal | ✅ JÄÄB |
| **Beta Test Group** | `/test-group` | Beeta värbamine | ✅ JÄÄB (aja-piiratud) |

**Krediidikaitse:** Kõik Explore-pinnad on **STAATILINE / CACHED**. Ei mingit LLM-i ega hääle kõnet ilma autentimiseta. ConvAI mikrofon ainult Companion+ tasemel.

---

### 🟡 JOURNEY — Üks teekond, üks ostuhetk (€XX, ühekordne)

**Definitsioon:** Lõpetatav reis, mille kasutaja viib lõpule oma tempos. Hääl on **LISA top-up**, mitte sisaldub.

| Praegune toode | Praegune hind | URL | Otsus | Põhjus |
|---|---|---|---|---|
| **The Hearth Protocol** | €19 (LIVE Gumroad) | `/the-hearth` | ✅ EVENING JOURNEY baas | Õhtujutud, vanematele |
| **Polarstar Bedtime Stories PDF** | €9 (Gumroad) | viidatud `/seven-quiet-nights`, `/family-bundle` | ✅ WONDER JOURNEY baas | Laps + perekond |
| **Family Bundle** (Polarstar + Hearth) | €25 (Gumroad) | `/family-bundle` | ✅ JÄÄB — perekonna bundle | Hea väärtus, säilita |
| **Alistair Bundle** (3 sekventsi) | €39 (Gumroad placeholder) | `/alistair-bundle` | ✅ MONEY JOURNEY baas | Raha/karjäär laboratorium |
| **Body Temple 28** | $39 USD (eksisteerib `BodyTemple.jsx`) | `/body-temple` | 🔴 LEGACY (rahaks teisendada) | $→€ ja kontseptsioon ümber kasti |
| **High Performers** | $39 USD (sama Body Temple link) | `/high-performers` | 🔴 KUSTUTA / SUUNATA ÜMBER | "Coach"-toon, vastuolus filosoofia |
| **Six Nights** | tasuta? | `/six-nights` | 🟡 KONTROLLI — kas Journey või Explore? | Founder otsustab |
| **The Beginning** | tasuta? | `/the-beginning` | 🟡 KONTROLLI — kas Explore? | Founder otsustab |

#### **UUS JOURNEY ARHITEKTUUR (5 võrdset teekonda)**

GPT soovitus: ärge tehke "Family" ainsaks sissepääsuks. Olen nõus. Viis võrdset:

| Teekond | Pakitud sisu | Baashind (ettepanek, lukustamata) |
|---|---|---|
| **🌳 Family Journey** | Sara Forest (14 maailma) põhitänavad + 1 Wider Circle nest | €29 |
| **💰 Money Journey** | Alistair Money Tree laboratorium + 3 sekvenssi | €29 (asendab €39 Alistair Bundle?) |
| **🫀 Body Journey** | Kaelen / Body World 14 kivi + audio shelf | €29 (asendab Body Temple 28) |
| **🌙 Evening Journey** | The Hearth Protocol + 5 õhtujuttu + öörituaal | €29 (üles €19-lt) |
| **⭐ Wonder Journey** | Polarstar 7 öökajaki + perekonnaõhtud + värvimisstuudio | €29 (üles €9-lt) |

**Igas Journey'is sisaldub:**
- Täielik tekstipõhine vestlus (LLM, kuluefektiivne)
- Kogu kirjalik sisu (PDF + veebileht)
- Audio eelvaated (juba toodetud, staatilised MP3-d)
- 14-päevane raha tagasi
- **Hääle krediidid sisalduvad: 0 minutit** (see on top-up, vt allpool)

---

### 🔵 COMPANION — Kõik teekonnad, jätkuv hooldus (€XX / kuu)

**Definitsioon:** Mitu teekonda paralleelselt, sügavam ligipääs, sagedasem kohtumine. Ei mingit eluaegset lukku.

#### **PRAEGUNE COMPANION-MAASTIK (segane)**

| Toode | Hind | Allikas | Otsus |
|---|---|---|---|
| **Quiet Entry** | €89/kuu, €239/kvartal, €890/aasta | BundleDisclosure | 🔴 LEGACY |
| **Aurin Storyteller** | €79/kuu, €209/kvartal, €790/aasta | BundleDisclosure | 🔴 LEGACY |
| **Inner Compass** | €229/kuu, €619/kvartal, €2,290/aasta | BundleDisclosure | 🔴 LEGACY |
| **Sanctuary Compass** | €329/kuu, €889/kvartal, €3,290/aasta | BundleDisclosure | 🔴 LEGACY |
| **Sanctuary Preview "Ways"** | €45 / €120 / €380 (Mike's prose) | SanctuaryPreview | 🔴 LEGACY |
| **Day Passes** | €25 / €49 / €89 | BundleDisclosure | 🔴 LEGACY |

**Kõik need 4 + 3 + 3 tasandit on uue arhitektuuri all KUSTUTATAVAD.** Asendatakse ÜHE Companion-membershipiga.

#### **UUS COMPANION (üks selge taseme)**

| Tase | Mis sisaldub | Hind (ettepanek, post-beta) |
|---|---|---|
| **Companion** | Kõik 5 Journey'i + uuendused + kogukonna tasand | €19–€29 / kuu (lukustamata kuni kulutabel valmis) |
| **Companion Annual** | Sama, -2 kuud | €190–€290 / aasta |

**Hääle krediidid sisalduvad: 0 minutit** (eraldi, läbipaistev).

---

### 🟣 PRIVATE — 1-1 ja kõrge puute (€€€)

**Definitsioon:** Üksikud sessioonid, otsene saatmine. Üliharv. Kõrge hind.

| Praegune toode | Hind | URL | Otsus |
|---|---|---|---|
| **Cabinet / Booking** | by application | `/cabinet/booking` | ✅ JÄÄB — Private |
| **Sanctuary "Your Own Room"** | €380 (Mike) | SanctuaryPreview | 🔴 LEGACY (sõnastus ja hind muudetakse) |
| **"By application. €1,890 quarterly"** | €1,890/kv | BundleDisclosure | 🔴 LEGACY (kontseptsioon säilib, hind võib muutuda) |

**Uus Private (ettepanek, post-beta):**
- **Quiet Session** — 60 min 1-1, €X
- **Quarterly Companionship** — 3 kuu kaaslane, €€€

Hinnad jäävad **lukku KUNI** Companion-mudel on toiminud 3+ kuud.

---

## 3. LEGACY — KÕIK MIDA TULEB KUSTUTADA / SUUNATA ÜMBER

### 🔴 Tooted, mille kood eemaldatakse (või suunatakse ümber)

| Fail / URL | Tegevus | Põhjus |
|---|---|---|
| `/app/frontend/src/pages/HighPerformers.jsx` | **KUSTUTA** | "Coach", "performance" toon — vastuolus anti-wellness filosoofiaga |
| `/app/frontend/src/pages/_BodyTempleLegacy.jsx` | **KUSTUTA** | Juba `_`-prefiksiga legacy |
| `/app/frontend/src/pages/BundleDisclosure.jsx` | **REWRITE** | Sisaldab 4 vana Sanctuary tieri (€89–€3,290), Day Passes, Top-up'id — pole uue arhitektuuriga kooskõlas |
| `/app/frontend/src/pages/LuxurySanctuaryLanding.jsx` | **KUSTUTA** (kontrolli kasutust) | Juba route'iga `/luxury → /` suunatud, fail jääb |
| `BodyTemple.jsx` $39 USD viited | **TEISENDA** €-ks ja sulanda Body Journey'sse | USD/EUR segadus |
| `SanctuaryPreview.jsx` "Ways" sektsioon (€45/€120/€380) | **REWRITE** | Asenda 5 Journey + Companion struktuuriga |
| `SanctuaryPreview.jsx` "Voice top-up" sektsioon (€25/€39/€99 presence) | **REWRITE** | Selge ElevenLabs hääle krediit, mitte "presence minutes" segadus |
| Route `/pricing → /grace/room` | **EHITA UUS LEHT** | Tegelik `/pricing` leht peab eksisteerima |
| Route `/membership` (BundleDisclosure) | **REWRITE** | Sama leht uue struktuuriga |

### 🟡 Tooted, mis vajavad ümbernimetamist

| Praegune nimi | Uus nimi | Põhjus |
|---|---|---|
| "Quiet Entry" | (eemaldatud) | Tieri ei ole enam |
| "Aurin Storyteller" | osa **Wonder Journey**'st | Polarstar = Wonder |
| "Inner Compass" | osa **Companion**'ist | Sulanda |
| "Sanctuary Compass" | osa **Companion**'ist | Sulanda |
| "Body Temple 28" | **Body Journey** | Sama sisu, uus pakend |
| "The Hearth Protocol" (€19) | **Evening Journey** baas | Hind võib tõusta €29-le |
| "Alistair Bundle" (€39) | **Money Journey** | Hind võib langeda €29-le |
| "Day Passes" | (eemaldatud) | Tieri ei ole |
| "Top-up minutes" → "Voice credits" | Ainult ElevenLabs hääle jaoks | Läbipaistev |

---

## 4. KASUTAJATEEKOND (uus, lukustatud)

```
1. EXPLORE
   ↓ (kasutaja loeb ühte Library artiklit, kuulab ühte audiot, küsib midagi)

2. WANDERER GATE
   ↓ (kerge intro: kes see ruum on, 3 äratundmisküsimust)

3. CHOOSE A JOURNEY  (€29 üks kord)
   ↓ (Family / Money / Body / Evening / Wonder — 5 võrdset ust)

4. AFTER JOURNEY → COMPANION OFFER
   ↓ (kui meeldis: kuumakse, kõik teekonnad + uuendused)

5. COMPANION → AFTER 3+ MONTHS → PRIVATE
   ↓ (kvartalipõhine 1-1 sügavus)
```

**Iga sammu vahel: VABATAHTLIKKUS.** Kasutaja võib jääda Exploresse igavesti. Kasutaja võib teha ainult ühe Journey. Companion on lihtsalt "kõik koos + uuendused".

---

## 5. KONTROLLINIMEKIRI ENNE KOODIMUUDATUSI

Enne kui kirjutame ühegi rea koodi:

- [ ] Founder kinnitab 4 kasti loogika (Explore / Journey / Companion / Private)
- [ ] Founder kinnitab 5 võrdset Journey'i (Family / Money / Body / Evening / Wonder)
- [ ] Founder loeb kulutabeli (`COST_BREAKDOWN_2026-02.md`)
- [ ] Founder otsustab Journey baashinna (€19 / €29 / €39?)
- [ ] Founder otsustab Companion kuumakse (€19 / €29 / €49?)
- [ ] Founder otsustab hääle krediidi mudeli (top-up A / B / C — vt cost dok)
- [ ] Founder valib esimese Journey'i, mille me ehitame täielikult valmis (MVP)
- [ ] Founder otsustab, kas hoiame Body Temple 28 ja Alistair Bundle olemasolevad Gumroad SKU-d eluga, või uued SKU-d

**KUNI siin pole linnukest, KOODI EI MUUDETA.**

---

## 6. KOODI MUUTMISE JÄRJEKORD (kui arhitektuur on lukus)

1. **Faas 1 — Legacy puhastus** (1 päev): Kustuta HighPerformers, _BodyTempleLegacy, eemalda Sanctuary Preview vanad "Ways" + "Voice top-up" sektsioonid, eemalda BundleDisclosure 4-tier struktuur.
2. **Faas 2 — Uus `/pricing` leht** (1 päev): Ehita lihtne pricing leht uue 4-kasti loogikaga, ilma reaalsete maksenuppudeta veel.
3. **Faas 3 — Üks Journey full-build** (3–5 päeva): Vali 1 (soovituslikult Evening, sest Hearth juba töötab) ja ehita see täielikult valmis maandumislehe + Gumroad/Stripe checkoutiga.
4. **Faas 4 — Companion ehitus** (5–7 päeva): Backend membership-ledger, Stripe subscription, ligipääsu kontroll, hääle krediidi top-up'id eraldi.
5. **Faas 5 — Ülejäänud 4 Journey'it paralleelselt** (1–2 nädalat).

---

**LÕPETUS:** See dokument on **arhitektuuri lukk**. Kui founder kinnitab, siis kõik järgnev kood ehitatakse selle alusel. Mitte enne.
