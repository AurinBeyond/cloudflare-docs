# Matrix Aurin — Roadmap (Deferred, 3-Week Hold)

**Saved**: 2026-02-09
**Resume date**: 2026-03-02 (≈ 3 nädalat hiljem, vastavalt Anna direktiivile)

---

## 🟢 P0 — Commerce launch (2026-02, in progress)

**Waiting on Anna** (external actions, not agent work):
- Register Creem.io account
- Send pre-application support letter (draft in `AURIN_TEXT_DRAFTS_FOR_REVIEW.md`)
- ElevenLabs API key `convai_write` scope enable (3-minute fix at elevenlabs.io)

**Ready for agent** (when Creem replies "yes"):
- Write `payment_providers/creem.py` (~150 lines against existing ABC)
- Route `services/checkout.py` through `get_provider()` factory (atomic with Creem adapter)
- Apply Faas 1 copy hygiene from `AURIN_TEXT_DRAFTS_FOR_REVIEW.md`:
  - Home hero (Variant 2: "A reading library with quiet company")
  - Category Statement 1A verbatim in meta description, About, ToS, MoR application
  - 4 disclaimer wordings (footer, pre-conversation modal, ToS additions, refund page)
- Anna executes `LAUNCH_READINESS_AUDIT_TEMPLATE.md` Section E (€1 test purchase + refund) before `LAUNCH_PAUSE=false`

**Deferred but not forgotten (before real customer volume):**
- Scheduled dunning-email dispatch job (reads `commerce_dunning` collection)
- Rename `polar_sku_map.json` → `provider_sku_map.json` with per-provider sub-keys
- 6 legacy test files that were pre-existing broken (not this session's fault): `test_angel_stars_iter75.py`, `test_hardlock.py`, `test_iter3_auth_sync_reach.py`, `test_iteration36.py`, `test_iteration37.py`, `test_iteration7.py`



Anna otsus 2026-02-09: pärast Faas 1 lõpetamist (Body Temple 28 + Grace
Boundaries Mode + visual unification) **peatame uue funktsionaalsuse
arendamise** ja keskendume 3 nädalat **müügile ja juba olemasolevate
toodete kasutusele**. Allolev nimekiri on pelgalt **meeldetuletus** —
neid teemasid EI alustata enne 2026-03-02.

---

## 🟡 Faas 2 — Grace adulti laiendused (P1 peale 3 nädalat)

- **High-Performers / Burnout persona** (Alistair ruumi laiendus)
  - Otsustada peale Body Temple konversioonimäära nägemist (>5% =
    minna High-Performersile, <5% = jätkata Body Templega ja parandada
    selle turundust).
  - Aurin'i roll: "Strateegiline mõttepartner" — neutraalne kuulaja
    pööraste ideede valideerimiseks, prioriteetide seadmiseks,
    läbipõlemise ennetamiseks.

## 🔵 Faas 3 — Voice transcript mood detection (P2)

- Aurin'i ConvAI transkriptidest tegeliku tundetooni (sentiment +
  emotion) tuvastamine, mis täiendab praegust kasutaja käsitsi
  igapäevast mood check-in'i.
- Tehniline: ElevenLabs ConvAI tagastab transkripti — analüüsime
  sõnavalikut ja luuletame OpenAI/Anthropic kaudu lihtsa mood scoringi.
- Privaatsus: KUNAGI ei salvesta tervet transkripti, ainult mood vector.

## ⚪ Faas 4 — Edasised Adult Clarity personad (P3, ainult kui Q2 mõõdikud
toetavad)

- Singles / Young Professionals — "Elukaaslane-mentor"
- Pensionärid — "Põlvkondadevaheline tarkuse-hoidja"
- Tudengid — "Õpingukaaslane"
- Career switchers / kolijad — "Ankur"

## 🎨 Faas 5 — Täielik visuaalne ühtlustamine (P3)

Praegu (Faas 1) rakendatakse uus house aesthetic (puidust paneelid,
Caveat font, kuldne aura) ainult **Body Temple lehel + Body Room
sissepääsu kaardil** kui PoC. Hiljem laiendada:

- Kõik Kids Hub'i sissepääsu kaardid
- Kindness Quest, Quiet Corner, Creative Spark, Daily Reflection
  moodulid (matching the founder's mockup with wooden tabs)
- Mindful Eating, Calm Focus jt uued kategooriad
- Aurin avataris kuldne aura kõikidel laste lehtedel
- Animeeritud sujuv üleminek mooduli vahel

## 📈 Müügifookus (Faas 1 lõpetamise järel — käesolev tegevus)

- LemonSqueezy konversioonimäära jälgimine: $39 First Step, $89 Eternal,
  $39 Body Temple unlock, $12 Universal Minute Bank
- $5 Referral programmi turundamine olemasolevatele lapsevanematele
- Anna's Weekly Letter automaatne saatmine (cron)
- FastSpring rakenduse järelvalve (LemonSqueezy backup)

---

**NB!** See fail kustutatakse või uuendatakse 2026-03-02. Kuni selle
ajani ei alustata ühtegi siin nimetatud teemat.
