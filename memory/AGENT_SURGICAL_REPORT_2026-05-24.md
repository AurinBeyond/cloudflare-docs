# Agentide kirurgiline ülevaatus + Clarity Academy Framework
**Kuupäev:** 2026-05-24
**Sooritaja:** Agent (sinu palve alusel)

## TL;DR — Kõik 5 toa agenti on nüüd kaitstud + täiendatud, mitte midagi pole kustutatud.

---

## 1. Mis täielikult muudetud sai (additive only, ei kustutamist)

### Kõikidele 4 adult agendile Dashboardi promptile **APPEND'iti**:
- `# CLARITY ACADEMY ROLE & PROTOCOL` plokk pärast `# END OF PROTOCOL`
- Sees:
  - **GREETING PROTOCOL** (igal agendil oma esmatutvustus)
  - **SPECIALIZATION** + **CORE GOAL** + **KEY THEME** (vastavalt sinu raamistikule)
  - **SYSTEM-RESET COMMAND** (silent self-check kui agent tunneb drift'i)
  - **LEGAL & HUMANITARIAN SAFEGUARD** (defer to human help)
- Vana sisu (Anna kureeritud 72-Point Somatic Matrix jne) on **säilitatud allpool** uut plokki, **mitte muudetud**.

### Aurin (`/app/frontend/src/lib/aurinPrompts.js`):
- Sama struktuur (Greeting + System Reset + Humanitarian Safeguard), kohandatud lapsele.

### Kaelan'i nime parandus:
- **Vana:** `"Kaelan – Somatic Architect (Body Room)I am now rea"` (kogemata first_message lekkis nimevälja)
- **Uus:** `"Kaelan – Somatic Architect (Body Room)"` ✓

---

## 2. Lõplik olek (verifitseeritud ElevenLabsi API'st)

| Agent    | Nimi (puhastatud) | Prompt enne | Prompt nüüd | Kõik 5 protokolli? |
|----------|-------------------|-------------|-------------|--------------------|
| Grace    | Grace – Clarity Release Mentor | 9990 ch | 12264 ch | ✅ |
| Kaelan   | Kaelan – Somatic Architect (Body Room) | 9647 ch | 12011 ch | ✅ |
| Sara     | Sara (Parents' Room) | 14462 ch | 16998 ch | ✅ |
| Alistair | Alistair – Course Room & Strategy | 12688 ch | 14967 ch | ✅ |
| Aurin    | Aurin (kood-poolne overlay) | n/a | n/a | ✅ (aurinPrompts.js) |

---

## 3. Kontoduplikaatide analüüs (need EI ole kustutatud)

Sinu kontos on **5 mittekasutuses duplikaati**. Vaatasin igaühe sisu üle ja kinnitan, et **mitte ühtegi unikaalset väärtuslikku infot pole** mida me peaks aktiivsetesse üle tooma:

| ID | Nimi | Sisu | Analüüs |
|----|------|------|---------|
| `agent_3001ks4kn5mhe0stfgq6g60mb29c` | Sara (Parents' Room) | 28 ch: *"You are a helpful assistant."* | **Tühi stub** — tehase default |
| `agent_3601krjs8qfpecsa3fpzqxphn27p` | Sara (Parents' Room) | 28 ch: *"You are a helpful assistant."* | **Tühi stub** — tehase default |
| `agent_3101krjfb4h2fk0vx4r9m5ytj2kx` | Kaelan (Body Room) → katki | 3730 ch: identifitseerib end **"Elara"** nimega, polüvagaalne teooria | **Identiteet vale** ("Elara" ≠ Kaelan). Sisu (Polyvagal Theory, Psychosomatic Mapping, Ayurvedic Wisdom) on aktiivses Kaelan'is **rikkalikumalt esindatud 72-Point Somatic Integration Matrix'i kaudu**. Mitte vaja sealt midagi tuua. |
| `agent_8901krhatnm0eybb9t32y6fxs10e` | Kaelan (Body Room) | 618 ch: "LOGIC-GATE PROTOCOL", "Max 20 words", "No greetings, no advice" | **Eksperimentaalne mini-versioon**. Selle vastandlik filosoofia ("max 20 words, no greetings") on **vastuolus uue Greeting Protocol'iga**. Selle põhimõte (avoid clichés like "I understand", "I'm sorry") on lisatud Kaelani uude **LANGUAGE DISCIPLINE** plokki. |
| `agent_2701ks4kr44fe47txg77y5f8z76x` | Aurin — see on **AKTIIVNE**! | 741 ch | Aurin'i Dashboardis on lühike prompt, sest kood (`aurinPrompts.js`) saadab täieliku overlay'i sessiooni alguses. |

**Soovitus:** Sa võid 4 mittekasutuses duplikaati (Sara × 2, Kaelan "Elara", Kaelan 618ch) ohutult kustutada Dashboardis, kui aega tekib. Aga **JÄTA AURIN ALLES** — see on aktiivne, sellele osutab `ELEVENLABS_CONVAI_AGENT_AURIN` env.

---

## 4. Backupid (kus on kõik vanad versioonid alles)

```
/app/memory/agent_prompt_backups/
├── full_2026-05-24/                          ← KÕIKIDE 9 AGENDI täielik snapshot
│   ├── agent_<id>.json                      ← full conversation_config
│   ├── agent_<id>.prompt.txt                ← prompt + first_msg + voice
├── grace__2026-05-24.txt                    ← Grace original (enne 02-09 boundary)
├── kaelan__2026-05-24.txt                   ← Kaelan original
├── sara__2026-05-24.txt                     ← Sara original
├── alistair__2026-05-24.txt                 ← Alistair original
├── grace__pre_clarity__2026-05-24.txt       ← Grace pärast boundary, ENNE Clarity
├── kaelan__pre_clarity__2026-05-24.txt      ← Kaelan pärast boundary, ENNE Clarity
├── sara__pre_clarity__2026-05-24.txt        ← Sara pärast boundary, ENNE Clarity
└── alistair__pre_clarity__2026-05-24.txt    ← Alistair pärast boundary, ENNE Clarity
```

Kui mingi muudatus läks halvasti, võime ühe käsuga vana versiooni tagasi PATCH'ida.

---

## 5. Mis kasutaja näeb (oodatav käitumine pärast deploy'd)

1. Iga toa sisenemisel **agent tutvustab ennast nimega + roomi nimega + erialaga** (Greeting Protocol).
2. Kui kasutaja ütleb "Hello Grace" Sara'le, **Sara EI võta** "Grace" oma nimena (Identity Boundary).
3. Kui kasutaja küsib teiste tubade kohta, **agent osundab et "I only know this room"** (Spatial Isolation).
4. Kui kasutaja signaliseerib kriisi, **agent suunab inimspetsialisti juurde** (Humanitarian Safeguard).
5. Kõik agendid **räägivad inglise keeles ainult** (Language Discipline).
6. Hääled jäävad stabiilseks — voice_id lock on koodis + Dashboardis (`tts.voice_id: false` override-tabel keelab koodil seda muuta).

---

## 6. Mis on järgmise korra ülesanded

- 🔴 Anna **testib live voice** preview keskkonnas, eriti kontrollib:
  - Iga agent ütleb oma õige nime esimese fraasiga
  - Sara ei lähe Grace'i rolli
  - Alistair ei lähe filosoofiasse, jääb arhitekti rolli
- 🔴 Save to GitHub → Redeploy production
- 🟡 Pricing menu Variant C
- 🟡 Meta Pixel + CAPI
- 🟢 (Optional, kui aega) — 4 mittekasutuses agenti Dashboardis kustutada
