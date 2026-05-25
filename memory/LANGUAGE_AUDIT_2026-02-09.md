# Language Audit — Aurin Hub / Prulesoul

**Date**: 2026-02-09 LATE
**Iter**: 82 (post artist-agent polish)
**Per Anna's request**: "kontrolli et köik tekstid vastavad 100% inglise keelele"

---

## Verdict: 🟢 UI is 100% English. Two intentional Estonian assets noted.

### ✅ Frontend (user-facing UI strings)

Scanned all `/app/frontend/src/pages/*.jsx` and `/app/frontend/src/components/*.jsx`.

- Searched for Estonian-specific characters: õ, ä, ö, ü, š, ž
- Searched for common Estonian words: sa, see, et, kus, sinu, minu, vanem, laps, jah, palun, vaata, jms.

**Found in user-visible strings**: 0 (zero) instances. ✅

**Found only in code comments** (founder notes for the next agent — NOT shown to users):
- `pages/KidsHub.jsx:79` — `"ruumilisus ja mänguline taju"` (comment about Anna's brief)
- `pages/SanctuaryPreview.jsx:226, 250-251` — founder mood-board cues in comments

**Conclusion**: every label, button, paragraph, headline, modal text, toast, alert, and meta tag that a user sees is in English.

### ✅ Backend (user-visible API responses)

Scanned `/app/backend/server.py` and supporting modules for Estonian text in API response payloads.

**Found**: 1 deliberate Estonian course in `server.py` lines 9785–9876:
- `slug: "raha-ja-teadvus-moodul-1"`
- `title: "Raha ja Teadvus — Moodul 1: Vaikne algus"`
- Full 7-day Estonian course content ("Raha võib olla rahu. Raha võib olla surve. ...")
- Audience: `adult`
- Price: `0.0` (free)

**Assessment**: This is a **deliberate Estonian-language product** for Anna's Estonian audience. Removing it would be destructive. It is NOT a UI text leak.

**Recommendation**: Leave as-is. If/when Anna wants to fully internationalise, this course would need an English translation as a sibling entry, not a replacement.

### ✅ Launch email (`body_temple_launch_email.py`)

**Intentionally Estonian** — per Anna's last directive, this is the soft launch email to her existing Estonian-speaking parent base. Subject: *"Sinu hetk Aurini kõrval · Neli võtit sinu keha jaoks."*

**Assessment**: Correctly Estonian. Anna's existing audience converted via Estonian-language onboarding and a sudden English email would feel cold.

---

## Summary table

| Surface | Language | Status |
|---|---|---|
| Frontend UI (all pages, components, modals, toasts) | English | ✅ |
| Frontend code comments (founder notes) | Mixed EN/ET | ✅ (internal, not user-visible) |
| Backend API responses (Body Temple, Grace, Alistair, voice-mood, etc.) | English | ✅ |
| `body_temple_launch_email.py` (marketing to Estonian parents) | Estonian | ✅ INTENTIONAL |
| `server.py` `raha-ja-teadvus-moodul-1` course | Estonian | ✅ INTENTIONAL (separate product) |

---

## Final note

There is **no UI bilingualism leakage**. The product appears single-language (English) to every user who isn't specifically enrolled in the Estonian Money/Consciousness course or who isn't receiving the Estonian launch email.

If Anna wants both Estonian and English UI surfaces in the future, that is a **separate i18n project** (frontend t() wrapping + content duplication) and not a polish item.
