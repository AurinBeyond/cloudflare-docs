# LEMONSQUEEZY — TOODETE NIMEKIRI (copy-paste valmis)

**Loodud:** Iter 64 · Feb 2026 · sissestus prulesoul.site LemonSqueezy paneeli.
**Allikas:** elavad `/api/books`, `/api/courses`, `/api/clarity/passes` vastused.
**Vorm:** rida-rea-kaupa, lihtne kopeerimine välja paneeli.

> ⚠️ Variant ID-d alljärgnevalt on need, mis on praegu koodis hoiul. Kui muudad LemonSqueezy paneelis variandi ID-d, **uuenda need samad ID-d ka koodis** (asukohad `/app/backend/server.py` SEED_BOOKS, SEED_COURSES, CLARITY_TIERS).

---

## 1 · KÕIK MAKSTAVAD TOOTED (14 SKU-d)

```
# ——————————————————————————————————————————————
# RAAMATUD · ADULT (5)
# ——————————————————————————————————————————————

Name:        You Don't Have to Dance to Another's Tune
Slug:        you-dont-have-to-dance-to-anothers-tune
Audience:    Adult
Type:        Digital download (PDF)
Price:       $7.00 USD
Variant ID:  1606185

Name:        The Language of Angels
Slug:        the-language-of-angels
Audience:    Adult
Type:        Digital download (PDF)
Price:       $10.00 USD
Variant ID:  1606213

Name:        Beyond the Matrix I
Slug:        beyond-the-matrix-i
Audience:    Adult
Type:        Digital download (PDF)
Price:       $13.00 USD
Variant ID:  1606071

Name:        Beyond the Matrix II — Codes of Consciousness
Slug:        beyond-the-matrix-ii
Audience:    Adult
Type:        Digital download (PDF)
Price:       $13.00 USD
Variant ID:  1606223

# ——————————————————————————————————————————————
# RAAMATUD · KIDS (3 makstavat)
# ——————————————————————————————————————————————

Name:        Angels' Story
Slug:        angels-story
Audience:    Kids
Type:        Digital download (PDF)
Price:       $5.00 USD
Variant ID:  1606247

Name:        Angels' Tales
Slug:        angels-tales
Audience:    Kids
Type:        Digital download (PDF)
Price:       $5.00 USD
Variant ID:  1606234

Name:        Angels' Friends 2
Slug:        engels-friends-2
Audience:    Kids
Type:        Digital download (PDF)
Price:       $5.00 USD
Variant ID:  1606260

# ——————————————————————————————————————————————
# KURSUSED (4 inglise keelset)
# ——————————————————————————————————————————————

Name:        Letting the old stories rest
Slug:        letting-the-old-stories-rest
Audience:    Adult
Type:        7-day course (drip-fed letters + audio companion)
Price:       $25.00 USD
Variant ID:  1606407

Name:        The language you forgot
Slug:        the-language-you-forgot
Audience:    Adult
Type:        7-day course (drip-fed letters + audio companion)
Price:       $25.00 USD
Variant ID:  1606433

Name:        Seven quiet evenings with children
Slug:        seven-quiet-evenings-with-children
Audience:    Parents
Type:        7-day course (drip-fed letters + audio companion)
Price:       $20.00 USD
Variant ID:  1606445

Name:        The body knows first
Slug:        the-body-knows-first
Audience:    Adult
Type:        7-day course (drip-fed letters + audio companion)
Price:       $25.00 USD
Variant ID:  1606453

# ——————————————————————————————————————————————
# CLARITY RELEASE PASSID (3)
# ——————————————————————————————————————————————

Name:        Clarity Release · 30-Minute Release
Tier:        30min
Type:        Single session pass
Duration:    30 minutes
Price:       $15.00 USD
Variant ID:  1606274

Name:        Clarity Release · 60-Minute Release
Tier:        60min
Type:        Single session pass
Duration:    60 minutes
Price:       $30.00 USD
Variant ID:  1606349

Name:        Clarity Release · Season Pass — 30 days
Tier:        season_30days
Type:        Subscription · 30 days open access
Duration:    30 days (43 200 minutes)
Price:       $70.00 USD
Variant ID:  1606394
```

---

## 2 · TASUTA TOOTED (lead-magnet)

```
Name:        The Night Angels' Embrace
Slug:        the-night-angels-embrace
Audience:    Kids
Type:        FREE PDF download (lead magnet)
Price:       $0.00
Variant ID:  1606266   # vajalik aktiivseks LemonSqueezys, et nupud töötaksid
```

---

## 3 · PINNAD ILMA SKU-DEta (mitte LemonSqueezys)

Need eksisteerivad rakenduses, kuid **ei vaja LemonSqueezy variante:**

- **Body Room** (8 hotspot'i + somaatiline AI vestlus) — alati tasuta, 12 sõnumit/päevas
- **Six Nights** — 6 e-postiletti, vabatahtlik tellimus, Resend kaudu
- **Kids Universe / Coloring** — igapäevane staatiline genereerija
- **The Beginning · Aurin Philosophy · Library hub-leht** — staatiline sisu
- **Magic-link sisselogimine** — autentimine, tasuta
- **Memory · Transient Echo** (browser localStorage) — tasuta vaikimisi
- **Memory · Eternal Thread** (server-side note) — toggle, **praegu ei ole eraldi makstud SKU**
- **Booking / Quiet hours** — broneerimine on tasuta; sessioon ise vajab Clarity passi (üks 3 ülaltoodust)

---

## 4 · KIIRE KOOSTÖÖ KONTROLLNIMEKIRI ENNE LIVE'I AVAMIST

- [ ] Ülaltoodud 14 makstud SKU-d kõik **`Active` / `Published`** olekus LemonSqueezy paneelis
- [ ] `The Night Angels' Embrace` on **`Active` $0** variant (mitte `Draft`)
- [ ] Pood on **Live mode** (mitte Test mode)
- [ ] Webhook URL: `https://prulesoul.site/api/lemonsqueezy/webhook`
- [ ] Webhook secret langeb kokku `LEMONSQUEEZY_WEBHOOK_SECRET` env'iga
- [ ] Tee 1× **$1 testost päris kaardiga** ja kontrolli:
  - [ ] Checkout avaneb
  - [ ] Webhook fire (`/api/lemonsqueezy/health` näitab `events_received` kasvu)
  - [ ] `purchases` rida MongoDB-s loodud
  - [ ] Raamatu/kursuse allalaadimine töötab
- [ ] (Vabatahtlik) Refund test sama tellimusega, kontrolli `purchases.status = "refunded"`

---

## 5 · MILLE OTSUSTAD ENNE LIVE'I (founder action)

| Otsus | Variant A | Variant B |
|---|---|---|
| Eternal Thread monetiseering | Jätta tasuta toggle (praegune) | Luua uus LemonSqueezy variant nt **$5/kuu** ja gate'ida |
| Beta-allahindlus Clarity passidele | Lülitada välja (`beta: false` `/api/clarity/passes` vastuses) | Hoida sees veel 30-60 päeva ja jälgida konversiooni |
| Estonian course (`raha-ja-teadvus-moodul-1`) | Hoida varjatud (praegune) | Avaldada eraldi ET-localized lehel + lisada SKU |

---

**Kõik makstud SKU-d on rakenduse-poolelt valmis. Allesjäänud takistus = LemonSqueezy paneeli live-mode aktiveerimine + 1× testost.**
