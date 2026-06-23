# LIBRARY · BOOKSTORE · CATALOGUE — Kliendi-pinna audit
**Kuupäev:** 2026-02 · **Stiil:** GPT 3-küsimuse raamistik (mitte 20 lehte)

---

## ❶ MITU SISSEPÄÄSU PRAEGU?

| URL | Komponent | Mida tegelikult teeb |
|---|---|---|
| `/library` | LibraryHub | "Lugemissaal" — kolm sektsiooni (Grown-ups / Reflections / Kids Universe), suunab edasi `/library/adults`, `/library/kids` |
| `/library/adults` | Library | Täiskasvanute artiklid + audiod + raamatud + meditatsioonid, filter `audience` |
| `/library/kids` | LibraryKids | "Lasteruum" — kaks ust: Stories (`/library/kids/read`), Draw (`/library/kids/draw`) |
| `/library/kids/read` | LibraryKidsRead | Tasuta lastelood |
| `/library/kids/draw` | KidsColoringStudio | Värvimisstuudio |
| `/library/:slug` | LibraryEntry | Üksiku raamatu/artikli vaade |
| `/bookstore` | Bookstore | LemonSqueezy-poed (raamatud ostuks), USD hindadega |
| `/bookstore/:slug` | BookDetail | Üksiku raamatu ostulehel |
| `/catalogue` | Catalogue | "Kõik tooted kataloogis" — raamatud + kursused + clarity passes (kaasab MembershipTiers!) |
| `/grace/library` | GraceLibrary | Grace ruumi enda artiklid (5 tükki) |
| `/grace/library/:slug` | GraceLibraryArticle | Üks Grace artikkel |
| `/alistair/library` | AlistairLibrary | Alistair laboratooriumi tekstid |
| `/alistair/library/:slug` | AlistairLibraryArticle | Üks Alistair artikkel |
| `/course-room/library` | AlistairLibrary (sama) | Duplikaat alistair'iga |
| `/course-room/lab/:labSlug/library/:slug` | AlistairLabArticle | Labi-spetsiifiline artikkel |

**KOKKU:** **15 erinevat library/bookstore/catalogue route'i.**
- 3 top-level sissepääsu (`/library`, `/bookstore`, `/catalogue`)
- 6 alamteed (`/library/adults`, `/library/kids`, `/library/kids/read`, `/library/kids/draw`, `/bookstore/:slug`, `/library/:slug`)
- 2 ruumi-spetsiifilist library'it (Grace + Alistair)
- 2 duplikaati (`/alistair/library` = `/course-room/library`)
- 2 lab-spetsiifilist alamteed

---

## ❷ MIDA NÄEB UUS KÜLALINE?

Stsenaarium: Anna jälgija avab Substack lingi → Aurin landing → kerib jalusesse → näeb:

> **Bookstore** · **Library** · **Catalogue**

**Ta küsib endalt:**
- Kas Bookstore = poed ja Library = tasuta? Ei, *Library'is on ka maksvad asjad*.
- Kas Catalogue = kõigi asjade nimekiri? Jah, aga see ka *kordab kõik Bookstore + Library + Membership*.
- Kas Grace'il on oma Library? Jah, aga miks see eraldi `/library`-st pole välja toodud?
- Kas Alistair'il on oma Library? Jah, ja seal isegi 2 erinevat URL-i ühe sama asja jaoks.

**TULEMUS:** 3 nime, 3 sissepääsu, 3 erinevat mentaalmudelit, **0 selgust.**

See **on** Tony Robbins'i selguse-printsiibi rikkumine. Klient lahkub, sest tal pole aimugi, kuhu klõpsata.

---

## ❸ MIS JÄÄB / SULANDUB / KUSTUTATAKSE?

### 🟢 JÄÄB (ühte ja selge rolliga)

| Mis jääb | Põhjus |
|---|---|
| `/library` (LibraryHub) | **AINUS lugemissaal kasutaja silmis.** Sissepääs kogu kirjalikku/audio sisusse. |
| `/library/adults` | LibraryHub'i sekundaarne uks "Grown-ups". OK. |
| `/library/kids` + `/library/kids/read` + `/library/kids/draw` | Polarstar Kids'i loomulik laste-sissepääs. Säilita. |
| `/library/:slug` | Üksiku artikli vaade — vajalik infrastruktuur. |
| `/grace/library` + `/alistair/library` | **Tuba-spetsiifilised libraries jäävad** sees tubades. Mitte landing'is. Need EI ole eraldi tooted. |

### 🟡 SULANDUB

| Mis sulandub | Kuhu | Põhjus |
|---|---|---|
| **`/bookstore` + `/bookstore/:slug`** | `/library` (Books shelf) | Library'is on juba `audience=books` filter. Bookstore on duplikaat erineva nime all. |
| **`/catalogue`** | `/library` (kõik filtreeritav nimekiri) | Catalogue on **kolmas** sissepääs samasse infosse. Kaose tekitaja. |
| **`/course-room/library`** | `/alistair/library` | Täielik duplikaat. Üks neist redirektib teise peale. |

### 🔴 KUSTUTATAKSE (kasutaja sissepääsust)

| Mis kustutatakse | Kuidas |
|---|---|
| **Footer link "Bookstore"** | Eemalda — sulandub Library'sse |
| **Footer link "Catalogue"** | Eemalda — sulandub Library'sse |
| **Navigation link "Bookstore"** | Eemalda — sulandub Library'sse |
| `/bookstore` route | Redirect → `/library?type=book` (säilita SEO + olemasolevad lingid) |
| `/catalogue` route | Redirect → `/library` (säilita SEO) |
| `/course-room/library` | Redirect → `/alistair/library` |

---

## ❹ KASUTAJA UUS MENTAALMUDEL (puhastus järel)

```
┌─────────────────────────────────────────────────────┐
│ AURIN                                               │
├─────────────────────────────────────────────────────┤
│                                                     │
│  5 TUBA (Grace · Sara · Kaelen · Alistair ·         │
│           Polarstar)                                │
│   └─ Iga tuba: oma library sees toas                │
│                                                     │
│  1 LIBRARY (kogu avalik lugemis/kuulamis-sisu)      │
│   └─ Filtreeri: täiskasvanutele / lastele / kõik    │
│   └─ Filtreeri: tasuta / ostetavad raamatud         │
│                                                     │
│  1 PRICING (Faas 3-s)                               │
│   └─ Kõik ostetavad asjad selles kohas              │
│                                                     │
└─────────────────────────────────────────────────────┘
```

**3 sissepääsu →→→ 1 sissepääs.** See **on** Tony Robbins'i selgus.

---

## ❺ MIDA SEE AUDIT EI MUUDA

- `/library` + tuba-spetsiifilised library'd (Grace, Alistair) jäävad **PUUTUMATA** sisu poolest
- 0 raamatut ega artiklit kustutatakse
- 0 LemonSqueezy SKU-d katkestatakse (Bookstore'i raamatud lähevad lihtsalt `/library` filtri taha)
- Kõik vanad lingid (SEO) jäävad redirektidega elus

---

## ⏱️ EXECUTION AEG

Kui Anna nõustub plaaniga:
- Navigation.jsx: 1 link maas (Bookstore)
- Footer.jsx: 2 linki maas (Bookstore, Catalogue)
- App.js: 2 route'i muutub redirektideks
- Library.jsx: lisa "type=book" filter URL parameetrist
- **~15 minutit kogu töö.**

---

## OOTAN: FOUNDER KINNITUS

🟢 → Tee see puhastus
🟡 → Tee, aga muuda mingit reaalsust
🔴 → Mitte praegu — räägime veel
