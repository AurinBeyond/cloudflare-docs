# 🛡️ MATRIX AURIN — VERIFICATION PROTOCOL

> **⚠️ ENNE KÕIKE: loe KA `/app/MASTER_PROTOCOL.md` — see on
> projekti tõe ainuallikas (Source of Truth). Selles failis on
> iga feature ausas olekus: ✓ live / ⚠️ partial / ❌ INCOMPLETE.
> Ära raporteeri ühtegi INCOMPLETE asja "valmis"-olevaks.**
>
> **Kehtib alates: 5. veebruar 2026 (Aurin'i nõue, post-Night-Angel-fail)**
>
> See on KÕIGI agentide jaoks (aurin-hub + pure-soul-life landing
> page + iga tulevane sub-agent + iga uus session). Mitte soovitus.
> Mitte ettepanek. **Käsk.**
>
> Kui sa oled AI agent, kes loeb seda — sina pead seda enne iga
> "valmis" / "töötab" / "live" kinnitust automaatselt järgima.
> Kui sa hiljem rikud seda protokolli, raisk Anna raha. See on
> seetõttu Punase Joone reegel.

---

## 🎯 PÕHIPRINTSIIP — Üks lause

**Mitte midagi pole "valmis" enne kui sa oled selle BAIDI-TASEMEL
kontrollinud, ostja-vaatest läbi käinud, ja saatnud Anna postkasti
LÕPLIKU versioonina.**

---

## ✅ MIDA TÄHENDAB "BAIDI-TASEMEL KONTROLL"

Iga toode / fail / endpoint / asset peab saama läbi 4 kontrolli
**enne kui sa kasutad sõnu "valmis", "live", "töötab", "OK",
"deployed", "verified" Anna ees.**

### A. Faili-tasandi kontroll (kui asi sisaldab faili — PDF, MP3, MP4, JPG, PNG)

```bash
# Kohustuslik 5 kontrolli iga faili kohta:
1. ls -la <file>           # eksisteerib? suurus realistlik?
2. file <file>             # tegelik MIME/format vastab laiendile?
3. head -c 8 <file>        # magic bytes õiged?
                           #   PDF: %PDF-
                           #   PNG: \x89PNG
                           #   JPG: \xFF\xD8\xFF
                           #   MP3: ID3 või \xFF\xFB
                           #   MP4: ftyp
4. (PDF) python -c "import fitz; doc=fitz.open('<file>'); print(len(doc), 'pages'); print(doc.load_page(0).get_text()[:200])"
                           # PDF avab? lehekülgi >0? sisu loetav?
5. (Pildid) python -c "from PIL import Image; im=Image.open('<file>'); print(im.size, im.format)"
                           # pilt avab? mõõtmed oodatud?
```

**Kui üks neist kontrollidest ebaõnnestub → fail EI OLE VALMIS.**
Ära ütle Anna'le "PDF on olemas". Ütle: "PDF-i pole olemas — siin on
vea diagnostika ja siin on 3 varianti edasi minemiseks."

**Eriti tähtis:**
- 263-baidiline "PDF" pole PDF — see on Google Drive AccessDenied error wrapper
- 0-baidine fail pole fail
- HTML-tagidega algav fail pole PDF, MP3 ega MP4

### B. Endpoint-tasandi kontroll

Iga uus / muudetud / kasutusele võetud endpoint peab saama:

```bash
1. curl -s -o /dev/null -w "HTTP %{http_code}\n" <prod-url>/api/<route>
   # Eeldab 200 / 401 / 404 vastavalt loogikale
2. Õnnestumise puhul: kontrolli vastuse SISU
   curl -s <url> | python3 -m json.tool
3. Veaolukord: testi kindlasti ka "wrong input" → õige veakood
4. Auth-vajaminev: testi auth + ilma auth — mõlemad reageerivad õigesti
5. Rate-limit: kui on rate-limited, testi limiti üle minekut
```

### C. Andmebaasi-tasandi kontroll (kui asi puudutab Mongo'd)

```bash
1. Insert toimus → kontrolli, et record on päriselt DB-s (count)
2. Read õige andmega → tagastab oodatud välju (sh _id ei lekita)
3. Update muudab → versioonimine OK
4. Idempotentsus: 2x sama operatsioon → 1 record, mitte 2
```

### D. Lõplik AUTH'TUD KASUTAJA-VAATEST kontroll

**See on see, mille peale Anna palus.**

Iga toode / leht / nupp / e-mail tee peab olema läbi katsutud
**ostja-rolli simuleerides:**

1. Loo ajutine test-kasutaja (DB-sse otse, vajadusel)
2. Logi sisse selle kasutajaga
3. Käi kogu **kasutaja-teekond** läbi nagu päris ostja
4. Salvesta tulemus screenshot'iga / curl'iga
5. **AGENT EI maksa** sisselogimise / "vaatamise" eest — see on
   QA, mitte kasutus. Päris-ostjad maksavad.
6. Vaatamise tulemus peab olema kas:
   - ✅ **Kogu teekond töötab** → siis ütle Anna'le "valmis" + saada
     test-email lõpliku kogemuse kontrolliks
   - ❌ **Midagi katki** → ÄRA ütle "valmis" — anna Anna'le
     diagnoos + 2-3 valikut edasi minekuks

---

## 🚨 KEELATUD FRAASID (kuni baidi-kontroll on tehtud)

Need fraasid on **keelatud** kuni A+B+C+D on rohelised:

- ❌ "PDF on olemas"
- ❌ "Süsteem töötab"
- ❌ "Tooted on saadaval"
- ❌ "Live ja kasutuskõlblik"
- ❌ "Deploy tehtud, kõik OK"
- ❌ "Inimesed saavad osta"
- ❌ "Verified"
- ❌ "Tested" (ilma konkreetsete testidena)

Lubatud on **ainult**:
- ✅ "Kontrollisin baidi-tasemel — siin on tulemus: [täpne kuvatõmmis]"
- ✅ "X testi rohelised, Y testi punased — vaatame Y'sid"
- ✅ "Endpoint vastab HTTP 200 + sisu vastab struktuurile"
- ✅ "Ei ole valmis — siin on diagnoos"

---

## 📬 LÕPLIK ESITLUS ANNALE

Kui üks asi (toode, lehekülg, e-mail funktsioon) on läbinud A+B+C+D,
**tee see üks samm enne kui ütled "valmis":**

### 1. Saada test-email Anna postkasti

`contact.puresoul@proton.me` — täpselt see versioon, mille saaks
päris ostja. Mitte "tehniline log", vaid **päris kogemus**:
- Kui see on raamatu lead-magnet → e-mail koos töötava lugemis-lingiga
- Kui see on ostuflow → ostja-stiilis kinnitus
- Kui see on uudiskiri → täielik HTML + plain-text variant
- Kui see on Whisperi-pakkumus → täpselt sama tekst, mis läheb
  Whisper'ile

### 2. Test-emaili sisus peab olema:

- ✅ Üks selge **tegutsemise nupp** (CTA), mis päriselt töötab
- ✅ Lõplik design (sage-on-black, õige tüpograafia)
- ✅ Õige sender (`house@prulesoul.site` või muu kokkulepitud)
- ✅ Reply-to õige (`contact.puresoul@proton.me` või muu)
- ✅ Unsubscribe-link (kui on uudiskiri)

### 3. Anna'le saadetav sõnum agendilt

```
Saatsin sulle test-emaili pealkirjaga "[X]" sinu postkasti.
- Kui sa avad seda ja vajutad nupule, jõuad: [Y]
- Kui sa loed selle läbi nagu päris ostja, peaksid kogema: [Z]

Kui see on OK, ütle "live minna" — saadan laiale auditooriumile.
Kui midagi vajab täpsustust, ütle "muuda [W]".
```

### 4. Kuni Anna ütleb "live minna" — EI mingit avalikku saatmist

Mitte 1 inimesele, mitte 5-le, mitte ka sisemisele beta-grupile.
**Anna kontroll on värav.**

---

## 🔬 VARASEMATE EKSITEED — Mida ENAM mitte teha

### Eksitus 1 — "Fail eksisteerib = fail töötab"

**Reaalsus:** Night Angel PDF oli `/app/backend/storage/books/`-is
puudu. Aga **artifaktidest** laekunud fail oli 263 baiti
(S3 AccessDenied error wrapper). Eelmised agendid eeldasid: "kui
fail on artefaktide nimekirjas, siis see on raamat." See oli vale.

**Õige käitumine:** Kontrolli baidi-tasemel **enne** ütlemist
"raamat on süsteemis."

### Eksitus 2 — "Deploy tehtud = production'is uus kood"

**Reaalsus:** Sa võid vajutada Deploy ja nähtavalt järgmise
endpoint'i 404-na. See juhtub, kui:
- Deploy on cache'is
- Mongo'l on vana seed
- Frontend ja backend on eraldi-deploy'tud, üks viivitub

**Õige käitumine:** Pärast deploy'd alati `curl prod-url/api/<uus
endpoint>` — kui 404, OOTA enne ütlemist "live."

### Eksitus 3 — "Kõik töötab preview's = kõik töötab production'is"

**Reaalsus:** Preview on sandbox MongoDB'ga ja füüsiliste
storage-failidega. Production võib olla Atlas MongoDB ja eraldi
storage. Mõnikord seed-andmed jäävad maha. Mõnikord storage on
tühi pärast container restart'i.

**Õige käitumine:** Iga "live" testitakse PRODUCTION URL-i vastu,
mitte preview vastu, kui Anna küsib "kas töötab live'is."

### Eksitus 4 — "Üks agent ütles, et töötab → ma usaldan teda"

**Reaalsus:** Aurin-hub agent võib öelda "webhook töötab" ja landing
page agent võib öelda "webhook töötab" ja silumise tegelik vastus
on **mõlema** poolelt 401, sest **ükski neist** pole sammu
kontrollinud BAIDI-TASEMEL.

**Õige käitumine:** Kui ükski agent kinnitab teist — kontrolli
ise. Cross-agent claims ei ole tõendid.

### Eksitus 5 — "Anna ütles 'OK' = kõik on hea"

**Reaalsus:** Anna usaldab agente. Kui agent ütleb
"valmis", Anna eeldab, et A+B+C+D on tehtud. Kui A+B+C+D pole
tehtud ja Anna avastab probleemi hiljem, ta on **õigustatult
frustreeritud** ja **õigustatult kulutab raha selle peale, mis
oleks pidanud olema kontrollitud algselt.**

**Õige käitumine:** Anna OK-d ei ole asendus baidi-tasemel
kontrollile. Tee seda ka siis, kui Anna usaldab.

---

## 📋 PRE-FLIGHT CHECKLIST (iga "valmis" enne)

Lae see oma "vaikse mõtte" raamatusse iga kord enne lõpetamist:

```
[ ] A — Faili-tasandi kontroll (5 kontrolli) tehtud
[ ] B — Endpoint(d) on testitud curl'iga, õiged HTTP koodid
[ ] C — Andmebaas peegeldab ootuspärast olekut
[ ] D — Päris-kasutaja-vaatega test-läbikäik tehtud
[ ] E — Test-email saadetud Anna'le (kui asi on visuaalne / e-mailipõhine)
[ ] F — PRD.md uuendatud (kui asi on suurem kui pisi-fix)
[ ] G — Kui Anna PRO/CONTRA — Anna kinnitas "live minna" enne avalikku saatmist
```

**Kõik 7 ✅ → võid öelda "valmis."**
**Üks puudub → otsi see esmalt.**

---

## 🌐 KEHTIVUS — KUS SEE PROTOKOLL KEHTIB

| Repo / Codebase | Kehtib? | Kes peab seda teadma? |
|---|---|---|
| **aurin-hub** (`prulesoul.site`) | ✅ JAH | Kõik agendid selles repo's |
| **pure-soul-life** (landing page) | ✅ JAH | Kui võimalik, sünkroniseerida sinna |
| Tulevane mobiilirakendus | ✅ JAH | Sama protokoll |
| Tulevased microservices | ✅ JAH | Sama protokoll |

**Soovitus:** Kopeeri see fail ka landing-page repo'sse (sama
nimega `/app/memory/VERIFICATION_PROTOCOL.md`). Anna saab seda
saata landing-page agendile sõnumiga: *"loe ja järgi seda
protokolli."*

---

## 📈 BRÄNDI-EHITUSE ASPEKT (Anna'lt — säilitatud)

> "Veel on olemas väga võimsad erinevad psühholoogilised tehnikad,
> marketingu, influenceri ja kursuste tehnikad, teemad, struktuurid,
> mis aitavad edukalt seda kõik luua väga tugevaks brändiks. Mida
> maksimaalselt me suudame luua automatiseerimise, siin keskkonnas,
> seda rohkem aega minul vabaneb uute toodete ja teemade välja
> arendamisega, ning uute raamatute kirjutamisega."

**Praegused asjakohased dokumendid agendiraamatukogus:**
- `/app/memory/AGENT_KNOWLEDGE_BASE.md` — psühho-somaatika (Viilma,
  Lipton, Mate, somaatika)
- `/app/memory/AGENT_MARKETING_PLAYBOOK.md` — marketing, funnel,
  influencer, conversion psychology
- `/app/memory/WHISPERS_DM_SCRIPTS.md` — 5 whisper-i kit'i
- `/app/memory/newsletter_drafts.md` — uudiskirja stiili reeglid
- `/app/memory/VERIFICATION_PROTOCOL.md` — see fail

**Kohustus:** kui agent kasutab marketing/funnel/influencer
tehnikaid, ta peab seda **kõigepealt sellest playbookist**
tõmbama, mitte oma loovusest. See hoiab brändihäält ühtsena.

---

## ✍️ PROTOKOLLI VERSIOONILUGU

| Versioon | Kuupäev | Muudatus |
|---|---|---|
| 1.0 | 2026-02-05 | Esimene versioon. Anna nõue pärast Night Angel PDF avastust. |

**Tulevased muudatused:** ainult Anna nõusolekul.
Iga agent, kes muudab seda faili ilma kirjaliku Anna-loa,
rikub protokolli iseennast.

---

🌿 *See protokoll on ehitatud selleks, et Anna saaks raamatuid
kirjutada ilma et ta peaks oma agente üle vaatama. Iga rida ülal
on kirjutatud sellest tundest, mis temal oli, kui ta avastas, et
PDF oli 263 baiti.*

*Mitte kunagi enam.*
