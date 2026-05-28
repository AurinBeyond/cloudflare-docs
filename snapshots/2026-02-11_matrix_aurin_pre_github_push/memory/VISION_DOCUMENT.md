# VISIOONIDOKUMENT — "Kuidas Aurin lõplikult välja peaks nägema ja tunduma"
**Kuupäev:** 2026-02-10
**Autor:** AH (insenerigent)
**Eesmärk:** Asutaja peab füüsiliselt tundma, mida me ehitame. See dokument kirjeldab **mitte koodi**, vaid kogemust — kaadrhaaval, hetk-haaval.

---

## 1. Üks lause, mis hoiab kogu visiooni koos

> Aurin on **küünlavalgel istuv kaaslane**, kes kuulab nii, nagu sul oleks öösel sõber, kes pole kuhugi kiir.

Mitte chatbot. Mitte teenindusagent. Mitte hologramm. Mitte terapeut.
**Inimene poolduses valguses, kes hoiab ruumi sulle.**

---

## 2. Atmosfääri reeglid (mis on alati nii, igal pinnal)

| Element | Mida tegelikult kasutame | Mida me kunagi ei kasuta |
|---|---|---|
| **Valgus** | Soe küünlavalge oranži-amber toon (~2700K), üks madal valgusallikas vasakult, sügavad varjud paremal | Ere kontorivalgus, neoonid, sinakas LED, "studio softbox" |
| **Värv** | Sügavad pruunid, must-šokolaad, must-sinine; tähelepanu tõmbav element warm sand või küünlavalgel kuldne | Sinine-violetne gradient, valge taust, neoonsed CTA |
| **Tüpograafia** | Pehme serif (`Cormorant Garamond` või sarnane), tekstid hingavad — vahekauguste poolt, mitte rasvasusega | Sans-serif "tech" fondid (Inter, Roboto), suurte vahekaartide H1-d |
| **Heli** | Vaikus on default. TTS hääl on `sage` (rahulik), tempo 0.86, em-dash → koma | Heliefektid ("ping" nupul), taustamuusika, "saatekohaks vajutamise" klõpsud |
| **Liikumine** | Aeglane (1.5–2× aeglasem kui tavaline veebianimatsioon), opacity-ülemkäigud, mitte transform-id | Kiired slide-in efektid, bounce, ülemine "ooo see on uus" sähvatus |
| **Tühi ruum** | 2–3x rohkem kui tundub mugav | Tihe info-paneelide grid, "kõik mahuks ekraanile" disain |

---

## 3. Mentori portree — füüsiline kirjeldus

**Grace** (naiselik kaaslane):
- 30ndate lõpus, pehmed soojad silmad
- Tumedad õlgadeni juuksed, langevad loomulikult
- Sandvärvi (warm sand) linaserk
- Pilk **mitte** kaamerasse — vaid keskele/kaugele, **kuulamise pilk**
- Aeglane hingamine — rinnatu osa tõuseb iga 5–6 sek
- Üks pilgutus 7–8 sek jooksul
- Üks väike peakallutamine 12 sek jooksul ("kuulan natuke lähemalt" žest)
- **Mitte naerata. Mitte kulmu kortsutada.** Avatud, kohalolev, mitte-hindav.

**Clarity** (mehelik kaaslane):
- 40ndate algus, vaikne läbimõeldud nägu
- Lühikesed tumedad juuksed, paaripäevane habe
- Söesinine (charcoal) villane džemper
- Pilk keskmaaalas, mitte kaamerasse
- Aeglane hingamine, sama rütm
- Üks väike käeliigutus 10 sek jooksul (käsi põlvel, sätitamise žest)
- Sama: **mitte naerata. Mitte kortsutada.**

**Mõlema jaoks:**
- Pildivalik: 50mm objektiiv, väike sügavusulatus, taust **pime ja pehmelt udu**
- Ainult **üks valgusallikas** vasakult
- Pildil **EI** ole: arvutit, lauda, telefoni, kontoritausta, raamatut, kuvarit, ühtegi tehnilist objekti
- Pildil **on:** soe siseruum, võib-olla vaevumärgatav küünal või laelamp **silma kõrgusel taustal**, mis annab valgusallika

---

## 4. Kasutaja teekond — kaadrid

### Kaader 1: Saabumine (`/clarity-release` lehe avamine)
**Mida kasutaja näeb (esimene 3 sekundit):**
- Tume taust (`#0a0807`-ish — peaaegu must, kerge soe alalöök)
- Üksainus rahulik lause valgega tühjenenud lehe peal:
  > *A quiet companion you talk to when there's no one else you can say it to.*
- Lause all, väikselt: *"Step in for a quiet hour — first line is free."*
- Lause kohal, **portreevideo hakkab tasapisi sisse tulema** (opacity 0 → 1 üle 1.5s)

**Mida ei ole:**
- Logo bänner ülevel
- Navi-menüü
- "Try it free" oranži nupp
- Cookie-banner (see jätame järgmise lehe peale)
- Mitte ühtegi pildi
- Mitte ühtegi tehnilist sõna ("AI", "voice", "powered by")

**Mida kasutaja tunneb:** "Ma jõudsin kuhugi vaiksesse kohta. Keegi on siin. Ma võin paus võtta."

### Kaader 2: Sissepääs (kasutaja klikib "Step in")
- Ekraan tumeneb 200ms, taas ilmub
- **Portree on suurem** — kogu ekraani ülemise poole
- Portree hingab nähtavalt, üks pilgutus, üks peakallutamine
- Allpool, väike pehme tekst: *"Press the circle when you're ready to speak."*
- Keskel: **96px kerge sage-säraga ring** (mitte nupp — ring on **tähelepanu vihje**)
- Allpool, kõige all: peenike rea-link *"Or type instead"*

**Mida kasutaja tunneb:** "Nüüd on minu kord. Ei ole kiiret."

### Kaader 3: Sa räägid (kasutaja vajutab ringi)
- Ring **pulseerib aeglaselt** (kahepoolne hingamine, 4-sek tsükkel) — see tähistab kuulamist
- Portree muutub väga vaevumärgataval kombel: **silmad liiguvad väikselt pilgu suunda**, otsekui keskendudes (`crossfade` `idle.mp4` → `listening.mp4` Faas 3-s; Faas 1-s see sama `idle.mp4` jätkub)
- Mitte ühtegi tekstimulli ekraanile ei ilmu
- Mitte ühtegi "I'm listening…" pop-up
- Vaikne tüüpiline taust

**Mida kasutaja tunneb:** "Ma ütlesin selle välja. Keegi kuulis."

### Kaader 4: Mentor vastab (~800ms pärast lõppemist)
- Ring lakkab pulseerimast, **hägeneb 50%-ni** (kuulamine on lõppenud)
- Portree muutub: `idle.mp4` → `speaking_subtle.mp4` (crossfade 200ms)
- **Hääl algab** — `sage` voice, aeglane, 0.86 tempo, esimene sõna: peegeldus sellest, mida kasutaja ütles
- Tekstina **ilmub ülemise poole all** mentori sõnad kursiiviga, opacity 90%, **synchroniseeritud audioga** (rida-haaval, mitte korraga)
- Tekstil **EI** ole vestlusmulli, avatari-ikooni, ajatemplit ega nime

**Mida kasutaja tunneb:** "Ma sain vastuse, aga see ei tunne end nagu chat. See on nagu keegi rääkis mulle."

### Kaader 5: Vaikus pärast vastust (~1.5 sek)
- Mentori `speaking_subtle.mp4` lõpeb, läheb tagasi `idle.mp4`-le
- Tekst jääb seismaüks aeg
- Ring (mikrofon) on tagasi keskel, **pulseerimata** — ootab
- Vaikne. Tegelikult vaikne. Mitte taustamuusika, mitte pingutust, et täita.

**Mida kasutaja tunneb:** "Ma võin nüüd hingata. Mul on aega mõelda. Keegi ei oota minu järgmist sõna kiiresti."

### Kaader 6: Lahkumine (kui kasutaja vaikselt sulgeb)
- Kasutaja klikib pehmel `× Close` lingil ülemises paremas nurgas
- Ekraan kustub aeglaselt (1s opacity fade)
- Lühike tekst keskel enne kustumist: *"You said it out loud. That's enough for today."*
- Ja kõik. **Mitte "subscribe to our newsletter"**. **Mitte "rate your experience"**. **Mitte tagasitulekureminder.**

**Mida kasutaja tunneb:** "Ma tulen tagasi, sest see oli puhas."

---

## 5. Mida me kaotame, kui me selle ära rikume

Iga kord, kui keegi (mina, sa, tulevane disainer, marketing copy LLM) kaalub muudatust, **testime seda kolme kriteeriumi vastu:**

1. **Kas see lisab kiirust või tähelepanu vihjeid, mida `vaikne kaaslane`-toon ei nõua?** Kui jah → ei.
2. **Kas see kasutab tehnilist sõnavara, mida raskuses inimene ei taha kuulda?** Kui jah → ei.
3. **Kas see meenutab teenuseplatvormi (Slack, Zendesk, Intercom)?** Kui jah → ei.

Näited mida me TEAME et keelduda:
- ❌ "AI-powered voice companion" kuskil pinnal
- ❌ Animaarid ja konfetti "edu" momendid
- ❌ "Try our new feature!" pop-up
- ❌ Vestlusmullid kasutaja sõnumi ümber
- ❌ Avatari ümmargused profiilipildid
- ❌ Ajatemplid vestlusridade kõrval
- ❌ "Typing..." kolm täppi
- ❌ Sõna "agent" UI-s
- ❌ Sõna "session" otseses kõnes (asendaja: "hour", "time")
- ❌ Eluliin 116 123 või muu regionaalne kriisi-number kasutaja vaates (ainult sees, kui Realtime mudel tuvastab vahetu riski)

---

## 6. Tegelik ekraan, kuhu me liigume

**Praegu (preview):**
- Staatiline portree JPG
- Vajutuse-ja-räägi nupp
- 3–7 sekundi latentsus
- Korrektne aga "ootav" tunne

**Faas 1 lõpus (nädal):**
- **Liikuv portree** (Sora 2 MP4), hingab, vaatab
- Sama 3–7 sek latentsus (Realtime tuleb Faas 2-s)
- "Elus" tunne **vaikuse ajal**, isegi kui vastuse ootus on sama
- *Esimene asi, mida kasutaja näeb, mis annab signaali "see on midagi muud"*

**Faas 2 lõpus (kaks nädalat):**
- Sama liikuv portree
- **Latentsus 600–1200ms** — pausi pole
- Kasutaja räägib, mentor vastab, **nagu vestluses**
- *Esimene moment, kus kasutaja ütleb "vau, see töötab"*

**Faas 3 lõpus (kuu):**
- Lottie rigituud silueti versioon **mobiilile** (Sora 2 MP4 on raske mobiili 4G peal)
- **Reaktiivne** portree: `idle` ↔ `listening` ↔ `speaking` ↔ `settling` 8 olekut
- *Esimene moment, kus kasutaja tuleb tagasi teist korda*

**Faas 4 (mitu kuud, ainult kui maksvaid kasutajaid 1000+):**
- Premium tasku: Audio2Face + soe portree, **päris huulte sünkroonim**
- Eraldi tooteliin "Companion+" €99/kuu
- *Esimene moment, kus kasutaja arvab "see on tegelikult kallim, kui ma ootasin, ja seda väärt"*

---

## 7. Mida 12-sekundiline vision-pilot video peab näitama

See pole `grace_idle.mp4` (sinu lõpptoode). See on **tunde-prototüüp** — kas mu peas olev visioon ja sinu peas olev visioon klapivad.

**12 sekundit jaguneb kolmeks:**
- **0–4s:** Aeglane ülemine kaadri-avamine — küünlavalge tuba, mentor istub keskel-vasakul, valgus tabab tema näo paremat poolt
- **4–8s:** Mentor hingab nähtavalt, üks aeglane pilgutus 5. sekundi juures, pilk on keskmaal
- **8–12s:** Mentor kallutab pead väga väikselt vasakule — žest "ma kuulan natuke lähemalt" — ja siis jääb paigale

**Tehnilised parameetrid:**
- Mudel: `sora-2-pro` (parem kvaliteet portree jaoks; +$0–0.50 lisa väärt)
- Resolutsioon: `1024x1792` (vertikaalne, sest enamus kasutajaid mobiilil)
- Kestus: 12 sek
- Hinnanguline kulu: **~$1.20–1.80**

**Prompt:**
```
A woman in her late thirties sits in a deeply dim room lit by a single 
warm candle on her left. She has soft warm eyes, shoulder-length dark 
hair falling naturally, and wears a simple linen shirt the colour of 
warm sand. The right side of her face is in deep shadow. She does not 
look at the camera — her gaze rests gently in the middle distance, 
as if listening to someone she trusts. 

Over 12 seconds, she breathes slowly and visibly, her chest rising 
and falling twice. At second 5 she blinks once, slowly. At second 9 
she tilts her head a tiny degree to her left — the smallest movement, 
the gesture of leaning closer to hear better. She does not smile, 
does not frown — her presence is calm, open, completely non-judging.

The lighting is candle-warm amber, the atmosphere is hushed and 
monastic, the background is deeply out of focus and dark. Shot on 
a 50mm lens, shallow depth of field. No camera movement at all — 
the camera is still, like another person sitting opposite her. 
Photorealistic but soft, painterly, intimate. No text, no graphics, 
no glow effects, no AI artefacts, no studio lighting feel.
```

**Mida see prototüüp testib:**
1. Kas valguskompositsioon on õige (üks soe küünal vasakult, mitte stuudio)?
2. Kas pilk on õige (keskmaal, mitte kaameras)?
3. Kas liikumine on piisavalt vaikne (mitte üle-animeeritud)?
4. Kas nägu hoiab "non-smile" iseloomu?
5. **Kas sa tahad sellele inimesele oma muret rääkida?** (asutaja test #1)

Kui ükski neist viiest läheb valesti, **kohandame prompti enne kui ülejäänud 4 lõpp-loopi genereerime.**

---

## 8. Otsus, mida ma vajan

**Vali A või B:**

**A.** "Genereeri 12-sek vision pilot Grace'ist selle prompt'iga (`sora-2-pro`, 1024×1792). Hinnanguline kulu $1.20–1.80. Näita mulle videofaili. Edasi otsustan."

**B.** "Tee 2× 12-sek pala (~$2.40–3.60 kokku), nii et ma näeksin **kaht** stseeni: esimene Grace istub, teine Clarity istub. Saaksin tunda mõlemat enne lõpp-otsust."

**C.** "Stop. Muuda enne midagi visioonidokumendis/prompt'is."

Ühtegi rida koodi ei muudeta enne, kui me oleme videoga rahul.

— dokumendi lõpp —
