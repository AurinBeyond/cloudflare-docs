# 💰 $5 Referral Loop + ⭐ Angel Stars MVP — Tehniline Detailplaan
**Kuupäev:** 2026-02-09 (öö)
**Põhjus:** Mõlemad on suuremad ehitused (4-8h igaüks). Et mitte ehitada poolikult ja rikuda kvaliteeti, koostan **täpselt täiskasvanu valmiduse plaan**, mida saame ehitada järgmisel sessioonil ühe sirge järjekorraga.

---

## 💰 OSA 1 — $5 REFERRAL VIRAL LOOP

### 1.1 Eesmärk
Iga maksumaksja saab unikaalse referral-link'i. Kui keegi tema link kaudu ostab esimese tasulise paketi, **vana kasutaja saab $5 voucher** + **uus kasutaja saab $5 off**.

### 1.2 DB schema (uus collection: `referrals`)
```python
{
    "id": str(uuid.uuid4()),           # ref kood (ka URL'is)
    "referrer_user_id": str,           # kes tegi
    "referrer_email": str,
    "created_at": iso8601,
    "uses": int,                       # mitu inimest seda lingi kaudu sisse tulid
    "conversions": int,                # mitu neist tegelikult ostis
    "credits_earned_usd": float,       # kogu teenitud voucher summa
    "active": bool,                    # saab keelata pettuse korral
}
```

Uus collection: `referral_redemptions`
```python
{
    "id": str(uuid.uuid4()),
    "referral_id": str,                # millise lingi kaudu
    "new_user_id": str,                # kes ostis
    "new_user_email": str,
    "ip_hash": str,                    # sama IP blokk
    "stripe_fingerprint": str,         # sama kaart blokk
    "order_id": str,                   # LS order
    "amount_usd": float,
    "discount_applied_usd": float,     # tavaliselt $5
    "credit_to_referrer_usd": float,   # tavaliselt $5
    "credit_paid_out": bool,           # kas voucher juba kasutatud
    "created_at": iso8601,
    "cooling_period_ends": iso8601,    # 7 päeva enne kui voucher aktiveerub (anti-fraud)
}
```

Olemasolev `users` collection saab uue välja:
```python
"voucher_balance_usd": float (default 0.0)
```

### 1.3 Endpoint'id (8 uut)
| Endpoint | Otstarve |
|----------|----------|
| `POST /api/referral/create` | Loo enda link, tagasta URL |
| `GET /api/referral/me` | Anna kasutaja link + stats (uses, conversions, vouchers) |
| `GET /api/referral/{ref_id}` | Public — tähistab lingi klikki + cookie set |
| `POST /api/referral/track-visit` | Frontend kõneleb külastuste-tracking |
| `POST /api/lemonsqueezy_webhook` (uuendus) | Webhook handler: kui ost on referral'iga, anna voucher + discount |
| `GET /api/voucher/balance` | Kasutaja näeb oma voucher balance'it |
| `POST /api/voucher/apply` (checkout time) | Kasutab voucher'it järgmise ostu peale |
| `POST /api/admin/referral/disable/{ref_id}` | Anna saab keelata kahtlast linki |

### 1.4 Frontend töö
- Uus leht `/my-rooms/referral` — kasutaja näeb oma linki, statistikat
- Checkout flow — `?ref=<ref_id>` cookie set'isub, viiakse läbi LS metadata'sse, webhook saab selle kätte
- Profile dropdown — väike "Voucher: $X.00" badge
- Post-purchase email (Resend) — "Sa lõid just voucher'i, anna seda kingituseks oma sõbrale!"

### 1.5 Anti-fraud reeglid (krittikalt tähtsad)
1. **7-päevane cooling-period**: voucher aktiveerub alles 7 päeva pärast ostu. Kui uus kasutaja teeb refund'i, voucher ei aktiveeru.
2. **Sama IP-hash blokk**: kui referral_redemption IP == referrer IP, blokeeritakse
3. **Sama Stripe fingerprint blokk**: kui LS kaart-fingerprint sama kasutajal mõlemal, blokeeritakse
4. **Self-referral block**: kui new_user_email == referrer_email, blokeeritakse
5. **Cap per referrer**: max 10 voucher'it kuus ($50/kuu), siis manuaalne approval

### 1.6 Email automatika (Resend)
1. Iga uus voucher → email kasutajale: "Sõna sõbrale kingiti $5 — kasuta järgmise ostu peale"
2. Voucher aegumine: 1 aasta peale loomist → email "Sa voucher on aegumas"
3. Igapäeva e-mail Anna'le, kui voucher aktiveerus: triage + audit

### 1.7 Aja-hinnang
- DB schema + endpoint'id: 2-3h
- Frontend profile leht + cookie-tracking: 1-1.5h
- Webhook integration: 0.5h
- Anti-fraud kihi rikkumiste test: 0.5h
- Email automatika: 0.5h
- **KOKKU: 5-6h fokuseeritud sessioonil**

---

## ⭐ OSA 2 — ANGEL STARS MVP

### 2.1 Eesmärk
Lapsed teevad väikseid igapäevaseid tegevusi (lapsevanema kinnitatud) → teenivad tähti → vabastavad mystery-tasusid (laps ei tea ette mis). Lapsevanem saab fotograafia üles laadida + näha lapsearengut.

### 2.2 DB schema (3 uut collection'i)

**`angel_stars_actions` (catalog, seed'itud)**:
```python
[
    {"action_id":"brush_morning","age_group":"3-5","label":"Brushed teeth this morning","star_value":1,"recurring":"daily"},
    {"action_id":"brush_evening","age_group":"3-5","label":"Brushed teeth this evening","star_value":1,"recurring":"daily"},
    {"action_id":"tidy_toys","age_group":"3-5","label":"Tidied my toys","star_value":1,"recurring":"daily"},
    {"action_id":"kind_word","age_group":"3-5","label":"Said a kind word today","star_value":1,"recurring":"daily"},
    {"action_id":"hug_family","age_group":"3-5","label":"Hugged a family member","star_value":1,"recurring":"daily"},
    {"action_id":"helped_cook","age_group":"6-8","label":"Helped cook a meal","star_value":2,"recurring":"weekly"},
    {"action_id":"read_5min","age_group":"6-8","label":"Read for 5 minutes","star_value":1,"recurring":"daily"},
    {"action_id":"kind_sibling","age_group":"6-8","label":"Was kind to a sibling or friend","star_value":2,"recurring":"daily"},
    {"action_id":"tried_new_food","age_group":"6-8","label":"Tried something new","star_value":2,"recurring":"weekly"},
    {"action_id":"brush_both","age_group":"6-8","label":"Brushed teeth morning + evening","star_value":1,"recurring":"daily"},
    {"action_id":"feeling_journal","age_group":"9-12","label":"Wrote one feeling in my journal","star_value":2,"recurring":"daily"},
    {"action_id":"help_unprompted","age_group":"9-12","label":"Helped without being asked","star_value":2,"recurring":"daily"},
    {"action_id":"hard_honest","age_group":"9-12","label":"Said something hard, honestly","star_value":3,"recurring":"weekly"},
    {"action_id":"listened_before","age_group":"9-12","label":"Listened before I answered","star_value":2,"recurring":"daily"},
    {"action_id":"brush_both_9_12","age_group":"9-12","label":"Brushed teeth morning + evening","star_value":1,"recurring":"daily"},
]
# 15 tegevust, 5 per vanusegrupp
```

**`angel_stars_rewards` (catalog)**:
```python
[
    {"tier":5,"type":"story_unlock","payload":{"story_slug":"random_locked"}},
    {"tier":10,"type":"coloring_pdf","payload":{"category":"mystery"}},
    {"tier":15,"type":"voice_minutes","payload":{"minutes":15,"valid_days":7}},  # ONLY loyal pre-paid customers
    {"tier":20,"type":"day_with_parent","payload":{"description":"One special activity with parent"}},
    {"tier":30,"type":"tts_message","payload":{"voice":"aurin","text":"personalised"}},
    {"tier":50,"type":"star_keeper_certificate","payload":{"format":"pdf","name":"<child_name>"}},
    {"tier":75,"type":"extra_screen_time","payload":{"minutes":30}},
    {"tier":100,"type":"favorite_meal","payload":{"choose":"by_child"}},
]
```

**`angel_stars_progress` (per child)**:
```python
{
    "id": str(uuid.uuid4()),
    "child_id": str,                   # uue lapse-konto loomine vanema poolt
    "parent_user_id": str,
    "child_name": str,                 # parent sisestab
    "age_group": str,                  # 3-5 | 6-8 | 9-12
    "total_stars": int,
    "lifetime_stars": int,             # ei vähene, statistika jaoks
    "earned_log": [
        {"action_id":str, "stars":int, "ts":iso8601, "parent_verified":bool, "photo_id":str?}
    ],
    "unlocked_rewards": [
        {"reward_tier":int, "type":str, "payload":dict, "ts":iso8601, "used":bool}
    ],
    "created_at": iso8601,
}
```

**`angel_stars_photos` (per child, privaatne)**:
```python
{
    "id": str(uuid.uuid4()),
    "child_id": str,
    "parent_user_id": str,
    "uploaded_at": iso8601,
    "action_id": str,                  # mis tegevuse jaoks tehti
    "caption": str,                    # short positive text, parent writes
    "photo_blob_ref": str,             # binary_assets reference
    "thumbnail_ref": str,              # 256×256 thumb for grid view
}
```

### 2.3 Endpoint'id (12 uut)
| Endpoint | Otstarve |
|----------|----------|
| `POST /api/stars/child/create` | Loo lapse-profiil (parent only) |
| `GET /api/stars/children` | Lista parent'i lapsed |
| `GET /api/stars/actions?age_group=X` | Saada selle vanusegrupi tegevused |
| `POST /api/stars/award` | Parent annab lapsele tähe (1 tegevuse eest) |
| `POST /api/stars/photo/upload` | Parent laeb üles foto (multipart) |
| `GET /api/stars/photos?child_id=X` | Lista lapse fotod |
| `DELETE /api/stars/photo/{id}` | Parent kustutab |
| `GET /api/stars/progress?child_id=X` | Lapse + parent näeb |
| `POST /api/stars/reward/claim` | Vabasta mystery reward (random select) |
| `GET /api/stars/celebrate/{action_id}` | Aurin ütleb "Sa teenisid tähe!" — ElevenLabs TTS |
| `POST /api/admin/stars/seed` | Üks-kord catalog seed |
| `GET /api/admin/stars/analytics` | Anna näeb kogu süsteemi statistikat |

### 2.4 Frontend töö (uued lehed)
- `/parent-portal/stars` — peamine lapsevanema dashboard
  - Today's check-in (tegevuste nimekiri tänaseks, parent klõpsab "✓" igal)
  - Lapse statistika (graafik nädala kohta)
  - Photo upload grid
  - Reward unlock'idi nimekiri
- `/aurins-room/stars/{child_id}` — lapse vaade
  - Suur "Star Jar" visualisatsioon
  - Järgmine reward progress bar
  - Vabastatud reward'idi laad
  - "Aurin ütleb sulle midagi" nupp (TTS celebration)
- Aurin chat'i lisafunktsioon: lapse uus täht teeb chat'i sisse konfetti-animatsiooni + Aurin ütleb (TTS):
  > "I noticed your star today. Well done."

### 2.5 Animeeritud "well done" smiler — Anna mainis
- Lottie-animatsioon (tasuta, [lottiefiles.com](https://lottiefiles.com))
- 3 animeerit emoji-ikkooni: ⭐ ✨ 🌟
- Mu pakkumine: lae alla 3 valitud Lottie + integreeri React component'isse
- Heli: TTS Aurin ütleb laia, soe "well done!"

### 2.6 Foto-album turvalisus
- Iga foto on **ainult vanema kontoga seotud** — keegi väljast EI näe
- Salvestus: MongoDB `binary_assets` collection (sama mis muude piltide jaoks)
- Thumbnail genereeritakse server-side (Pillow library) → kiirem kuvamine grid view'is
- Parent saab kustutada igal hetkel
- Mitte ühtegi pilti EI looda jagamist väljapoole

### 2.7 Email automatika
1. Iga mystery reward unlock → email vanemale: "[child] sai täna [reward type], vaata koos lapsega!"
2. Iga 10 päeva järel → digest: "[child] tegi sel nädalal 8 head asja"

### 2.8 Aja-hinnang
- DB schema + 15 tegevust + 8 reward'i seed: 1h
- 12 endpoint'i: 3-4h
- Frontend parent portal: 2-3h
- Frontend lapse vaade + Aurin celebration: 2-3h
- Lottie animatsioonid + TTS integration: 1h
- Anti-fraud + privaatsus testimine: 1h
- **KOKKU: 10-12h fokuseeritud sessioonil**

See on suur — pakuksin selle ehitada 2-3 päeva järjest. **Mu soovitus**: Angel Stars MVP on **selle quartal'i kõige väärtuslikum projekt** Anna brändile, sest see on **retention engine**, mis hoiab lapsi+vanemaid kuus aja jooksul keskkonnas.

---

## 🎯 KOKKUVÕTTEKS

Mõlemad on **selged ehitused** kindlate DB-skeemide ja endpoint'idega. Anna saab valida:

**Option A — Bingo $5 referral KÕIGEPEALT** (5-6h):
Põhjus: kasvab viral'-koefitsienti enne kui Anna alustab mikroinfluencer kampaaniat. Iga tasuta-koodi saanud influencer võib oma audience'ile jagada $5 sooduskoodi → see annab Anna'le **kaks-laevalist kasvuvõimet** (orgaaniline + viral).

**Option B — Angel Stars MVP KÕIGEPEALT** (10-12h):
Põhjus: lastesegment on Anna kõige väärtuslikum kanal pikemas perspektiivis (vanemad räägivad teistele vanematele lähemini kui burnout'is täiskasvanud räägivad omavahel). Angel Stars on see, mis muudab Aurin'i "katsetusest" "iga päeva harjumuseks".

**Mu soovitus:** **Option A esimene** (kiire, kasvu-multiplier, korrumpeerib safety-net'i mitte), **Option B teine** (suur, väärt-suuruke retention).

Hommikul ütle, kumb ja ehitan.
