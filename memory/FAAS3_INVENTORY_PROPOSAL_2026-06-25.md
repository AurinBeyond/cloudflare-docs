# FAAS 3 / SAMM 1 — TOODETE INVENTUUR (homse päeva avalöök)

**Eesmärk:** ÜKS tabel, mis näitab kõiki Aurin'i praegu eksisteerivaid müüdavaid tooteid + staatuse otsuse iga jaoks.
**Eeldus:** mitte ühtki koodi-muudatust enne, kui Anna kinnitab tabeli rida-realt.
**Aeg:** ~30-45 min skanneerimine + tabel valmis Annale.

---

## ETTEPANEK — täpne metoodika

### Samm 1.1 — Skanneerimise ulatus (kõik failid, mis võivad hindu sisaldada)

**Frontend lehed:**
- `BundleDisclosure.jsx` (membership tieri)
- `SanctuaryPreview.jsx` (Mike's "Ways", Voice top-up)
- `Bookstore.jsx` + `BookDetail.jsx` (LemonSqueezy raamatud)
- `Catalogue.jsx` (kuigi route redirektitud, fail sisaldab veel hindu)
- `MembershipTiers.jsx` (frontend komponent, joonistab tabelilt)
- `Grace.jsx`, `BodyTemple.jsx`, `BodyRoom.jsx`, `HighPerformers.jsx` (juba kustutatud)
- `ClarityRelease.jsx` (legacy paywall)
- `Polarstar*.jsx` (ostuviited)
- `Hearth*.jsx` (€19 Gumroad LIVE)
- `FamilyBundle.jsx`, `AlistairBundle.jsx`, `SevenQuietNights.jsx`

**Backend API endpoint'id, mis hinda tagastavad:**
- `/api/membership/tiers` (joonistab MembershipTiers'le)
- `/api/products/*` (kui eksisteerib)
- `/api/clarity/*` (legacy)
- Gumroad/LemonSqueezy webhook'id

**Hard-codes hindu otsida:**
- `grep -rE "€[0-9]+|\$[0-9]+" /app/frontend/src/ --include="*.jsx" --include="*.js"`
- `grep -rE "€[0-9]+|\$[0-9]+" /app/backend/ --include="*.py"`

### Samm 1.2 — Iga leidude juurde 4 küsimust

Iga reaga vastan järgmistele küsimustele:

| # | Küsimus | Eesmärk |
|---|---|---|
| 1 | **Mis toote nimi?** | Quiet Entry · Inner Compass · ... |
| 2 | **Mis hind?** | €89 / €229 / €25-49-89 etc. |
| 3 | **Kus näeb klient?** | Mis lehel/route'il + kas avalik või gateway taga |
| 4 | **Milleks see toode olemas oli?** | Mis probleemi see lahendab |

### Samm 1.3 — Tabel Anna jaoks (markdown, mitte kood)

Saadan järgmises sessioonis ühe markdown-tabeli, **nimetatud `/app/memory/PRODUCT_INVENTORY_TABLE_2026-06-25.md`**, kättesaadav avalikul lingil:

```
https://aurin-hub.preview.emergentagent.com/api/founder-docs/product-inventory
```

Tabel formaadis (GPT raamistik):

| Toode | Hind | Kus asub | Milleks (originaal eesmärk) | Anna otsus |
|---|---|---|---|---|
| Quiet Entry | €89/kuu | BundleDisclosure | Sissepääsu-tier | ☐ KEEP ☐ MERGE ☐ RENAME ☐ DELETE |
| Inner Compass | €229/kuu | BundleDisclosure | Sügav membership | ☐ KEEP ☐ MERGE ☐ RENAME ☐ DELETE |
| Sanctuary Compass | €329/kuu | BundleDisclosure | Tipp-membership | ☐ KEEP ☐ MERGE ☐ RENAME ☐ DELETE |
| Sanctuary Annual | €3290/aasta | BundleDisclosure | Aasta-pakk | ✅ DELETE (Anna otsustanud) |
| Day Pass · Light | €25 | ? | Päeva-ligipääs | ☐ ☐ ☐ ☐ |
| Day Pass · Plus | €49 | ? | ? | ☐ ☐ ☐ ☐ |
| Day Pass · Deep | €89 | ? | ? | ☐ ☐ ☐ ☐ |
| Voice · Small | €25 | SanctuaryPreview | Häälekrediit | ☐ ☐ ☐ ☐ |
| Voice · Medium | €39 | SanctuaryPreview | ? | ☐ ☐ ☐ ☐ |
| Voice · Large | €99 | SanctuaryPreview | ? | ☐ ☐ ☐ ☐ |
| Mike Ways · A | €45 | SanctuaryPreview | "Ways to be here" | ☐ ☐ ☐ ☐ |
| Mike Ways · B | €120 | SanctuaryPreview | ? | ☐ ☐ ☐ ☐ |
| Mike Ways · C | €380 | SanctuaryPreview | ? | ☐ ☐ ☐ ☐ |
| Hearth Protocol | €19 | Gumroad LIVE | Õhtujutud vanematele | ✅ KEEP (live tulu allikas) |
| Family Bundle | €25 | Gumroad LIVE | Hearth + Polarstar | ✅ KEEP |
| Alistair Bundle | €39 | Gumroad | 3 raha-laboriumi | ✅ KEEP |
| Polarstar PDF | €9 | Gumroad | Lastelood | ✅ KEEP |
| Body Temple | (TBD) | code: BodyTemple.jsx | 28-päeva keha-kursus | ☐ ☐ ☐ ☐ |
| --- | --- | --- | --- | --- |
| **UUS MAAILM:** Journey | TBD | uus | Üks teekond, üks ost | ✅ KEEP |
| **UUS MAAILM:** Companion | TBD | uus | Kõik teekonnad, kuumakse | ✅ KEEP |
| **UUS MAAILM:** Private | TBD | uus | 1-1 ligipääs | ✅ KEEP |
| **UUS MAAILM:** Voice Access | TBD | uus | Häälekrediit (top-up) | ✅ KEEP |

### Samm 1.4 — Anna täidab tabeli

Anna märgib iga `☐ ☐ ☐ ☐` juurde KEEP/MERGE/RENAME/DELETE.
- Kui MERGE → uue maailma kuhu (Journey? Companion? Voice?)
- Kui RENAME → mis uus nimi
- Kui DELETE → kustutatakse koodist, säilib git ajaloo

### Samm 1.5 — Koodi muudatused (alles pärast Anna kinnitust)
- DELETE-d eemaldatakse failidest
- MERGE-d kontsolideeritakse uue mudeli sisse
- RENAME-d uuendatakse
- KEEP-id jäävad samad

---

## ✅ MIS SEE ETTEPANEK SISALDAB
- ✅ Selge metoodika (1.1 → 1.5)
- ✅ Failide nimekiri
- ✅ Tabeli formaat (GPT raamistik + Anna €3290 otsus + Gumroad LIVE märkused)
- ✅ Kontrollnimekiri uue maailma toodetest
- ✅ Avalik link tabelile sessioonide vahel jagamiseks

## ❌ MIS SEE ETTEPANEK MITTE EI SISALDA
- ❌ Hindade lukku-otsuseid
- ❌ Koodi muudatusi
- ❌ Uut /pricing lehte
- ❌ Kustutamisi enne Anna read-by-read kinnitust

## ⏱️ HOMNE AVA LÕUNAEN
Anna magab pärast pikka päeva. Esimene homne ülesanne (uue konteksti agendile):

1. Loe `SESSION_2026-06-24_HOST_INTROS_COMPLETE.md`
2. Loe `FAAS3_INVENTORY_PROPOSAL_2026-06-25.md` (see fail)
3. Tegutse Samm 1.1 → 1.3 (skanneerimine + tabel)
4. Saada avalik link Annale
5. OOTA tema rea-realt kinnitusi enne mistahes koodi muudatust

**See on plaan. Anna kinnitab → homne agent käivitab.**
