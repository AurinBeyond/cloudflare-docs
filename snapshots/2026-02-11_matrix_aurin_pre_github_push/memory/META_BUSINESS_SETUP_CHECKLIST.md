# Meta Business Manager — Setup Check-list (puresoul.life / Matrix Aurin)

**Created:** 2026-02-08
**For:** Anna, founder
**Goal:** Lukustada vundament enne reklaami käivitamist, et hilisemaid "andmekaod" ei tekiks. Iga punkt on KOHUSTUSLIK enne esimest reklaami.

---

## ⏱️ Eeldatav aeg kokku: 3–5 tundi (jaotatud 2–3 päeva peale, sest DNS propageerib ise 24–72h)

---

## ✅ FAAS 1 — Business Manager põhi (45 min)

- [ ] **1.1** Mine `business.facebook.com` → Create Business
- [ ] **1.2** Ettevõtte nimi: kasuta täpset juriidilist nime (nt OÜ Pure Soul Life)
- [ ] **1.3** Lisa Eesti VAT-kood (kui on; muidu jäta tühjaks — saab hiljem lisada)
- [ ] **1.4** Lisa **2-faktoriline autentimine (2FA)** *kõigile* admin'idele.
  - ⚠️ Krüptilise turbe-kaotuse #1 põhjus: keegi sai ligi sinu Business Manager'ile. Kindlasti TOTP app (Authy / 1Password), MITTE SMS.
- [ ] **1.5** Lisa **endale** "System Admin" roll (mitte ainult "Employee")
- [ ] **1.6** Lisa makseviis: Business credit card või SEPA debit. **EI** isikliku kaardiga (segaduse vältimiseks raamatupidamises)

---

## ✅ FAAS 2 — Domain Verification (1 päev, sest DNS propagatsioon)

⚠️ **See on KRIITILINE.** Ilma verifitseeritud domeenita ei saa post-iOS-14.5 maailmas eventeid prioritiseerida. **EI MINGIT REKLAAMI ENNE SEDA.**

- [ ] **2.1** Otsusta, milline domeen on **primary** (live'is): `puresoul.life` või `matrixaurin.com`?
- [ ] **2.2** Mine: **Business Settings → Brand Safety → Domains → Add**
- [ ] **2.3** Sisesta domeen ilma "https://" ja ilma "www" — ainult `puresoul.life`
- [ ] **2.4** Vali verifitseerimisviis: **DNS TXT Record** (kõige stabiilsem)
- [ ] **2.5** Kopeeri Meta-poolne TXT-väärtus, lisa see oma DNS-pakkujasse (Cloudflare / Zone / nimekontor):
  ```
  Type:  TXT
  Host:  @
  Value: facebook-domain-verification=abc123xyz...
  TTL:   3600 (1 hour)
  ```
- [ ] **2.6** Klõpsa Meta'l "Verify" — kui pole veel valmis, oota 24h ja proovi uuesti
- [ ] **2.7** ⚠️ **Kui sul on ka apex-redirect (www → root)**, lisa verifitseerimine ka www'ile

---

## ✅ FAAS 3 — Pixel ja CAPI Token loomine (20 min)

- [ ] **3.1** **Events Manager → Connect Data Sources → Web → Create**
- [ ] **3.2** Nimi: `prulesoul-main` (üks Pixel KOGU saidi peale, mitte üks per leht)
- [ ] **3.3** Salvesta **Pixel ID** (15-kohaline number) — see jõuab arendajale (mulle)
- [ ] **3.4** **Pixel Settings → Conversions API → Set up manually → Generate Access Token**
- [ ] **3.5** ⚠️ **Token expiry:** vali "Never expires" (kui Meta lubab) või "60 päeva + meeldetuletus rotatsiooniks"
- [ ] **3.6** Salvesta token TURVALISELT (1Password / Bitwarden). Kunagi mitte e-mailis ega Slackis.
- [ ] **3.7** Anna mulle Pixel ID + Access Token → ma panen need `/app/backend/.env`'i (mitte koodi sees)

---

## ✅ FAAS 4 — Aggregated Event Measurement (AEM) — KÕIGE OLULISEM iOS-i jaoks (30 min)

⚠️ Post iOS 14.5: kui sa **ei** prioritiseeri 8 eventi siin, siis Apple-i kasutajatele EI tule andmeid. **See on koht, kus 99% algajatest kaotab raha.**

- [ ] **4.1** **Events Manager → Aggregated Event Measurement → Configure Web Events**
- [ ] **4.2** Vali verifitseeritud domeen
- [ ] **4.3** Lisa ja prioritisee TÄPSELT see järjekord (TOP = highest priority):
  1. `Purchase` ⭐ (kõige tähtsam — ostud)
  2. `InitiateCheckout` (LemonSqueezy nupu klikk)
  3. `Lead` (magic-link signup)
  4. `ViewContent` (Story World külastus, room-i külastus)
  5. `AddToCart` *(kui müüd raamatuid hiljem)*
  6. `CompleteRegistration` (Wanderer's Agreement nõustumine)
  7. `Custom: GiftSent` (kingitusnupp story-st)
  8. `PageView` (kõige madalama prioriteediga)
- [ ] **4.4** **SAVE** — Apple-iOS kasutajatele aktiveerub 24h pärast salvestamist
- [ ] **4.5** ⚠️ Kui sa muudad seda hiljem (lisad uue eventi), siis Apple "freezeb" kõik 72h. **Lukusta plaan kohe.**

---

## ✅ FAAS 5 — Custom Conversions (15 min)

Need lubavad Madgicxil näha iga ostutüüpi eraldi.

- [ ] **5.1** **Events Manager → Custom Conversions → Create**
- [ ] **5.2** Loo iga sinu Wanderer Pass'i taseme jaoks:
  - `Purchase — 30min Pass ($39)`
  - `Purchase — 60min Pass ($59)`
  - `Purchase — 90min Pass ($99)`
  - Vajadusel: `Purchase — Kids Story Pack`
- [ ] **5.3** Igaüks neist filtreerib `Purchase`-eventi `value`-välja järgi (täpne match)

---

## ✅ FAAS 6 — Test Events Tool (15 min — enne reklaami)

⚠️ **MITTE ÜHTEGI EUROT ENNE, KUI SEE TÖÖTAB.**

- [ ] **6.1** **Events Manager → Pixel → Test Events** → kopeeri **Test Event Code** (algab `TEST` + 5 tähemärki)
- [ ] **6.2** Anna mulle see kood — ma panen selle ajutiselt CAPI requesti, et saaksime testida
- [ ] **6.3** Tee 1€ testitehing LemonSqueezys (loo $1 variant test'i jaoks)
- [ ] **6.4** Kontrolli, et Test Events tab näitaks **MÕLEMAID**:
  - Browser event (Pixel)
  - Server event (CAPI)
  - Sama `event_id` → **deduplicated** ✓
- [ ] **6.5** **Match Quality** peab näitama "Excellent" või vähemalt "Good"
- [ ] **6.6** Kustuta Test Event Code production'ist enne avalikku käivitamist

---

## ✅ FAAS 7 — Custom Audiences ettevalmistus (10 min — kohe alguses tühjana)

- [ ] **7.1** **Audiences → Create → Custom Audience**:
  - `Website — All visitors (180 days)`
  - `Website — Story World visitors (180 days)`  *(URL contains `/aurins-room/stories`)*
  - `Website — Pricing viewers (180 days)`  *(URL contains `/clarity-release`)*
  - `Website — Purchasers (180 days)`  *(event = `Purchase`)*
- [ ] **7.2** Lookalike audience'id luuakse **HILJEM** (vaja vähemalt 100 inimest source'is)

---

## ✅ FAAS 8 — Ad Account seadistamine (15 min)

- [ ] **8.1** **Business Settings → Ad Accounts → Add → Create New Ad Account**
- [ ] **8.2** **Valuuta: EUR** ⚠️ Ei saa hiljem muuta!
- [ ] **8.3** **Time Zone: Europe/Tallinn** (Eesti) ⚠️ Ei saa hiljem muuta!
- [ ] **8.4** Account name: `puresoul-main-ads`
- [ ] **8.5** Spending limit: pane **monthly cap** turvaks (nt €500 kuus algul) — välistab "ootamatu €2000 lend Madgicx'ist"
- [ ] **8.6** Connecte Pixel sellele Ad Account'ile

---

## ✅ FAAS 9 — Privacy & GDPR seaded (20 min)

- [ ] **9.1** **Business Settings → Compliance & Privacy → Data Protection Officer**: lisa endale või juristile
- [ ] **9.2** **Limited Data Use (LDU)** — kontrolli, et `data_processing_options` reegel oleks sisse lülitatud Ad Account'i tasandil (Meta annab selle automaatselt EU-le, aga verifitseeri)
- [ ] **9.3** Privaatsuspoliitika URL: lisa Business Settings'i (peab sisaldama mainet "Meta Conversions API serverside processing")
- [ ] **9.4** ⚠️ Kohustuslik: ole valmis vastama 30 päeva jooksul kui Andmekaitse Inspektsioon küsib auditi kohta

---

## ✅ FAAS 10 — Madgicx ühendamine (10 min, KÕIGE LÕPUS)

- [ ] **10.1** Logi sisse Madgicxi (14-päevane tasuta proov)
- [ ] **10.2** **Connect Meta Ad Account** → autoriseeri Business Manager'i kaudu
- [ ] **10.3** **Connect Pixel** → vali `prulesoul-main`
- [ ] **10.4** **Connect CAPI Events** *(valikuline aga soovituslik — kinnitab et server-side töötab)*
- [ ] **10.5** **Ära** lülita kohe sisse "Auto-optimisation Surf" mode. Sea kõik reeglid esimesed 14 päeva **"Notify only"** režiimi, et näha mis ta hakkaks tegema, ENNE kui ta tegelikult midagi muudab.

---

## 🚨 ENNE ESIMEST REKLAAMI — Lõplik kontroll

- [ ] Domain verified ✓
- [ ] AEM 8 events saved + 24h möödunud ✓
- [ ] Pixel ID + CAPI token edastatud arendajale ✓
- [ ] Test Events tool näitab "Match Quality: Excellent" ✓
- [ ] Custom conversions loodud ($39, $59, $99) ✓
- [ ] Custom Audiences (Story World, Pricing, Purchasers) loodud ✓
- [ ] Ad Account EUR + Tallinn timezone (lukus!) ✓
- [ ] Spending limit set (kuu cap turvaks) ✓
- [ ] Cookie consent banner LIVE (LDU lipp töötab) ✓
- [ ] Privacy policy ajakohastatud (Meta CAPI märgitud) ✓
- [ ] Madgicx ühendatud, **kõik reeglid "Notify only" režiimis** ✓

---

## 🎯 Mida ANNA peab edastama arendajale (Aurin agent):

```
1. PIXEL_ID          (15-kohaline, nt 1234567890123456)
2. CAPI_ACCESS_TOKEN (pikk string, ~190 tähemärki)
3. TEST_EVENT_CODE   (ainult arenduse ajaks, formaat TEST12345)
4. Otsus: kas eelistad puresoul.life või matrixaurin.com primary domain'iks
5. LemonSqueezy variant ID-d:
   - $39 30min variant ID
   - $59 60min variant ID
   - $99 90min variant ID
```

---

## ❓ Sagedaseid lõkse, mida vältida

| Lõks | Tagajärg | Lahendus |
|---|---|---|
| Domain mitte-verifitseeritud | iOS users → ei mingit dataset | Tee FAAS 2 ESIMESENA |
| AEM 8 events muutmine pärast launch'i | 72h andmevoo külmutamine | Lukusta nimekiri kohe |
| Pixel ID koodis hardcoded | Krüptilise turbe risk | Alati `.env`-is |
| Token kestab "60 päeva" → unustad rotatsiooni | CAPI vaikib, sa ei märka 2 nädalat | Pane Google Calendarisse rotatsiooni-tähtaeg |
| Test Event Code jääb production'i | Reaalsed ostud lähevad "test"-statistikasse | Kontrolli enne launch'i |
| Currency = USD, ei EUR | Madgicx eelarve-arvutused valed | Lukusta EUR kohe ad account loomisel |
| 2FA ainult SMS-iga | SIM swap = täielik kaotus | TOTP app kohustuslik kõigile |

---

## 📞 Kui jääd kuhugi kinni

Anna teada, mis sammu juures probleem on (nt "FAAS 4 punkt 4.3 — ei näe `InitiateCheckout` valikut"). Saan saata sulle täpse screenshot'i või uue suuna.

Kui kõik FAASID 1–10 on tehtud, saada mulle:
1. Pixel ID
2. CAPI Access Token
3. Test Event Code

Siis ehitan tehnilise silla (Pixel + CAPI + GDPR consent banner + LDU fallback) 1–2 päevaga. Saame koos teha esimese $1 testtehingu ja kontrollida, et Match Quality on "Excellent". Pärast seda on tee Madgicx'i poole vaba.
