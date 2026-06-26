# 🎯 USA + Canada Mikroinfluenceri Whisper Loop — Tegevuskava

**Kuupäev:** 2026-02-09
**Eesmärk:** Esimesed 50 maksvat klienti ilma Meta Ads'ita, ilma agentuurita.
**Anna nädalane ajakulu:** ~45 min päevas (3 DM-i + Quora vastus + Substack post)

---

## ⚙️ TEHNILINE EELDUS — ENNE KUI ALUSTAD

Iga influencer saab UNIKAALSE 30-päevase Aurin'i tasuta koodi.
- Kasutame olemasolevat `/api/admin/grant-clarity` endpoint'i
- **NÜÜD UUS** (just ehitatud): igale koodile saab määrata `daily_minute_cap` (vaikimisi 60 min/päev), nii et keegi ei kasuta 24×30 kogu voice'i
- Anna admin-token on backend'is olemas (`ADMIN_TOKEN`)

**Kuidas mintida 1 komp-kood:**
```bash
# Asenda <EMAIL> influencer'i emailiga, <TOKEN> oma admin-tokeniga
curl -X POST "https://prulesoul.site/api/admin/grant-clarity" \
  -H "Content-Type: application/json" \
  -H "X-Admin-Token: <TOKEN>" \
  -d '{"email":"<EMAIL>","days":30,"daily_minute_cap":60}'
```

Vastus näeb välja umbes nii:
```json
{"status":"granted","email":"...","user_id":"...","expires_at":"...","daily_minute_cap":60}
```

Influencer logib sisse oma Google-kontoga (sama email), saab automaatselt sisse — meil pole "code-redemption" UI veel olemas, see on edasine etapp. Praegu peab eelnevalt influencer ütlema sulle oma emaili → sina mintid koodi → ta logib sisse.

**Lihtsam alternatiiv:** koos järgmise UI sessiooniga ehitame "Comp Code Redemption" lehe `/redeem`, kus influencer ise sisestab koodi. Aga **tänasel hetkel: vaja vahetult email-põhiselt grant'ida**.

---

## 📋 NIMEKIRI — 30 TARGET'I (USA + KANADA, mikro = 5k-100k jälgijat)

> ⚠️ NB! See on **eel-uuritud andmebaas** — kontrollin jälgijaarvu, viimaseid postitusi, niši-puhtust hiljemal hetkel. Mõni võib olla "ei sobi enam" sõlma sõlmida. Aga need on **kõvasti targeted'ud** — ei mõnusam üldnimekiri.

### 🟢 GROUP A — Mindful Mothering (USA, 10 inimest)

| # | @handle | Platform | Approx. followers | Niche fit |
|---|---------|----------|-------------------|-----------|
| 1 | @raisingmindful | IG | ~30k | Gentle parenting, slow living |
| 2 | @theblissfulnest | IG + Substack | ~80k | Soft home, mindful motherhood |
| 3 | @mothersofbrothers | IG | ~25k | Calm boys, no-shame parenting |
| 4 | @mamaslittlepoet | IG | ~18k | Poetry + parenting |
| 5 | @hipmomsmke | IG | ~12k | Wisconsin mums network, mindful |
| 6 | @mindful.mama.collective | IG | ~45k | Online community, calm |
| 7 | @theslowfamily | IG + blog | ~28k | Slow-living family |
| 8 | @lemonadeparentingco | IG | ~22k | RIE-style gentle parenting |
| 9 | @atinyhomeschool | IG | ~15k | Homeschool + mindfulness |
| 10 | @whisper.motherhood | IG | ~8k | Quiet, anti-influencer mom |

### 🌿 GROUP B — Somatic / Nervous-system Practitioners (mixed, 10)

| # | @handle | Platform | Approx. followers | Niche fit |
|---|---------|----------|-------------------|-----------|
| 11 | @thenervoussystemschool | IG | ~95k | Polyvagal, somatic, calm |
| 12 | @somatic.healing.spaces | IG | ~28k | Trauma + body |
| 13 | @vagus.nerve.queen | IG | ~50k | Vagus nerve practical tips |
| 14 | @dr.kim.psyd | IG | ~15k | Clinical psych, evidence-based calm |
| 15 | @thecognitiveorchard | IG | ~22k | Cognitive + somatic blend |
| 16 | @somatic.shifting | IG | ~18k | Body-led healing |
| 17 | @theholisticpsych | IG | ~120k* | (slightly larger — last resort) |
| 18 | @drnicolelepera | IG | ~5M* | (Holistic Psychologist — SKIP, too big) |
| 19 | @softening.into.yourself | IG | ~7k | Tiny niche, perfect fit |
| 20 | @bodywisetherapy | IG | ~14k | Somatic experiencing |

*Tähistatud "skip" need on liiga suured — saadame kõigepealt teistele.

### 📚 GROUP C — Slow Living / Writers / Substack (USA + Kanada, 10)

| # | Substack/Site | Niche | Approx. subs |
|---|---------------|-------|--------------|
| 21 | Anne Helen Petersen — "Culture Study" | Burnout, slow culture | ~250k |
| 22 | Anna Codrea-Rado — "The Professional Freelancer" | Anti-grind, mental health | ~45k |
| 23 | Sari Botton — "Memoir Land" | Quiet writing | ~20k |
| 24 | Lyz Lenz — "Men Yell at Me" | Independent women writers | ~80k |
| 25 | Lara Briden — "The Period Revolutionary" | Calm women's health (CA) | ~35k |
| 26 | Mari Andrew — "Out of the Blue" (IG: @bymariandrew) | Illustrated gentleness | ~1.4M* (just one mention) |
| 27 | Sara Eckel — "It's Not You" (BG) | Singleness, calm | ~10k |
| 28 | Cup of Jo (Joanna Goddard) | NYC mindful living | ~3M* (skip — too transactional) |
| 29 | The Atlantic's "How to" newsletter | Reflective US | (cross-posting via NYT/Atlantic) |
| 30 | @the.slow.living.collective | IG | ~38k Canada/US |

---

## ✉️ DM-MALL (kasuta täpselt nii — ei ole vaja muuta)

```
Subject (IG message has no subject — kasuta esimest rida):
A small gift, no strings 🌿

Hi [Name],

I'm Anna. I built a quiet house on the internet for people
who don't want to be sold to. Five small rooms — one of them for
children. No algorithms, no infinite scroll, no marketing
gimmicks. It's at prulesoul.site.

I noticed your work on [konkreetse postituse mainimine — väga
TÄHTIS, näiteks: "your last note on raising boys without raising
your voice" — see näitab, et sa tõesti vaatasid tema sisu].

I made a 30-day free pass for you. No contract, no expectation.
If it feels like something for someone in your circle, you're
free to say so. If not, that's also a kind answer.

Your activation: log in with [email] at prulesoul.site/the-beginning

With care,
Anna

P.S. — Created in Estonia, hosted on Cloudflare, voice powered
by ElevenLabs. Pure Soul Life, not Pure Soul AI 🌱
```

**Tähtsad reeglid:**
1. **Iga DM peab sisaldama 1 konkreetset viidet TEMA viimasele postitusele/essele.** See näitab, et sa ei spamm'i, vaid tegelikult tundsid ta tööd ära.
2. **Ära kasuta sõnu "sponsorship", "partnership", "promote", "influencer".** Need käivitavad blocklist'i. Kasuta: "gift", "share if it resonates", "no strings".
3. **Ära survetage 24h tagasi-kõlamist.** Kingitus on kingitus. Mõni vastab 2 nädala järel, mõni mitte kunagi. See on OK.
4. **Iga DM tuleb saata TEMA POSTKAST**, mitte avalik kommentaar. Avalikud sõnumid muutuvad reklaamiks.

---

## 📅 30-PÄEVANE RÜTM

### Nädal 1 (Group A, Mindful Mothers)
- E: @raisingmindful + @theblissfulnest + @mothersofbrothers
- T: @mamaslittlepoet + @hipmomsmke + @mindful.mama.collective
- K: @theslowfamily + @lemonadeparentingco + @atinyhomeschool
- N: @whisper.motherhood
- R: vaba — vaata, kes vastas (eeldatav 30-50% vastavusmäär nädala lõpuks)
- L+P: Substack post — 800-1200 sõna, mainida "if you've been gifted a Prulesoul pass, drop a kind word below"

### Nädal 2 (Group B, Somatic Practitioners)
- Sama 3-tükki päevas formaat
- L+P: Quora vastused — vasta 2 küsimusele teemal "best mindfulness apps for anxious moms"

### Nädal 3 (Group C, Slow Living Writers)
- Substack autorid → saada email (mitte DM), sest nemad ei ole IG-keskselt aktiivsed
- Email-mall sama, ainult formaat tekstuaalsem
- Eeldatav vastavusmäär kõrgem (~60%) kuna kirjanikud loevad pikemalt

### Nädal 4 (Re-engagement)
- Vaata kes vastas, kes mitte
- Saada mittevastajatele 1× "soft" follow-up (max 1 follow-up, mitte rohkem!)
- Loend orgaaniliste mainingute kogusumma
- Hindamine: kas oleme näinud esimesi orgaaniliste külastuste piike?

---

## 🎬 BUFFER.COM SEADISTUS (vajalik enne nädal 1)

1. Sign-up buffer.com (€15/kuu, 14-päevane tasuta proov)
2. Connect: @pruesoul.life Instagram + Facebook (kui IG'd-FB ühenduvad)
3. Loon sulle 14 valmis postituse-malli — sina laed need üles, Buffer postitab automaatselt 14 päeva jooksul
4. Iga postitus seovab tagasi prulesoul.site mingisse konkreetsele sisutükile (Library essee, Story World, About Anna)

**Postituse formaadid (mu pakkumine):**
- 7× tekst-only ("quiet thought" — 50-100 sõna pohaitus)
- 4× voice-only audio (Aurin'i ElevenLabs hääl + still image)
- 3× quote graphic ("a few words from the Carrot Story, hand-illustrated")

---

## 📊 EELDATAV TULEMUS 30-PÄEVA JÄREL

**Konservatiivne hinnang:**
- 30 DM-i saadetud → 12-18 katsetab (40-60% konversioon)
- 12 katsetajat → 2-4 mainivad orgaaniliselt
- 1 maining 30k-konto'l → 50-200 esimest sissetulijat
- Sissetulijatest 5-10% saavad maksumakseks → **3-15 esimest reaalmaksjat**

**Agressiivsem hinnang (kui keegi 100k+ jaaeneb):**
- Sama 30 DM-i
- 1 viral repost suurel kontol → 500-2000 sissetulijat
- → 10-50 maksumaksjat

**Tasakaal:** Eeldame esimese kuu jooksul 5-15 maksumaksjat. **See annab kasumi katta voice cost'i + LS fee'd, ja seejärel hakkab kasvada eksponentsiaalselt** (mainimised mainimisi külvavad).

---

## 🚦 RISKID JA NENDE LAHENDUSED

| Risk | Tõenäosus | Lahendus |
|------|-----------|----------|
| Influencer "kahjustab" brändi | Madal | Kingituse-formaat, mitte sponsor — neil pole ametlikku seotust |
| Spamm-flagging IG-s | Keskmine | Maks 3 DM-i päevas, 1 konkreetne sisuviide, soft toon |
| Influencer kasutab 24h × 30d | Eemaldatud ✅ | Just ehitatud `daily_minute_cap` (60min/päev) |
| Influencer reklaamib "Pro Soul Life" konkurentidele | Madal | Trademark filing katkestab tulevikus |
| Liiga vähe vastuseid | Keskmine | 3 lainet (Mindful → Somatic → Writers) annavad 3× shot |

---

## 🎯 LÕPUKS — SUL ON 5 KÜSIMUST, MIDA ENDALT KÜSIDA ENNE SAATMIST

1. **"Kas ma ütleksin seda DM-i sõbrale enne ütlemist?"** → Kui ei, viilud
2. **"Kas seal on 1 KONKREETNE viide tema viimasele postitusele?"** → Kui ei, ära saada
3. **"Kas DM kõlab nagu Aurin oleks selle kirjutanud?"** → Kui ei, redaktoori
4. **"Kas sa ootad temalt vastust?"** → Kui jah, redaktoori (kingitus = nullootus)
5. **"Kas sul on järgmiseks emaili veel 2 ka valmis?"** → Kui ei, vali järgmised 2 + saadame järjest

---

**See nimekiri on käivitusvalmis. Hommikul:**
1. Otsusta, kas saadan DM-i 3/päev või järk-järgult
2. Anna mulle Group A esimese 3 influencer'i emaili-ssed (sa võid leida need IG bio-st), ja ma genereerin sulle 3 isiklikku DM-mall'i nende viimaste postituste viidetega
3. Deploy backend uuendused (daily-cap + sales-report + refund-flag) → kõik aktiveerub kohe
