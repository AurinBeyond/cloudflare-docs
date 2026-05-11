# VISUAL_BLUEPRINTS.md
*Locked 2026-02-06 by founder. Architecture references for all current and future agents.*

> These three images are NOT user-facing assets. They are **internal
> architecture references** that every agent (hub-side and landing-page-side)
> must consult before designing any UI surface, hologram state, or
> cross-app data flow.
>
> Text inside the images is descriptive ("how the system is meant to look
> and feel"), not literal copy to render in the UI. Aurin's UI text is
> always written in English, calm, founder voice.

## Image 1 — Technical Blueprint (system logic)
- **Public URL:** `https://customer-assets.emergentagent.com/job_aurin-hub/artifacts/7r89axz3_Gemini_Generated_Image_41b22o41b22o41b2%20%281%29.png`
- **Use:** the canonical "bible" for backend symbiosis logic. Confirms: Private Room must carry long-term memory + emotional mirroring, Body Room is therapeutic stream, Courses Room has progress tracking, the Aurin-Hub ↔ Landing Page bridge MUST be duplex (warranty work).
- **Where it influences code:** `clarity_ai.py` system prompt (memory + mirroring), `server.py` body-room + courses endpoints, `MASTER_PROTOCOL.md` §8 backlog.

## Image 2 — Full Body Hologram (character design)
- **Public URL:** `https://customer-assets.emergentagent.com/job_aurin-hub/artifacts/da04ywki_Gemini_Generated_Image_b1v5otb1v5otb1v5.png`
- **Use:** visual style guide for the Clarity guides. Glowing line-art (Matrix-style), professional yet warm, gentle facial micro-expressions for compassion / support / thought-pause.
- **Where it influences code:** `ClarityRelease.jsx` `GuideHologram` component (line 1017). The female + male portraits the founder will upload via `POST /api/admin/clarity/guide-face/{gender}` should match this stylistic direction (do NOT replace with photo-realistic faces).

## Image 3 — Holographic Attendant Desk (UI layout)
- **Public URL:** `https://customer-assets.emergentagent.com/job_aurin-hub/artifacts/30jgubsp_Gemini_Generated_Image_y7x0u0y7x0u0y7x0.png`
- **Use:** how the hologram "sits" on the user's screen — semi-transparent floating panels, glass desk, no physical clutter, calm atmosphere.
- **Where it influences code:** Cabinet pages (`Cabinet.jsx`, `ClarityRelease.jsx`, `CourseDetail.jsx`). Avoid sharp UI elements, dense buttons, loud gradients. Use sage-on-black with soft shadows and 12-24px backdrop blur for floating panels.

## Image 4 — Holographic Booking Interface (UI reference for §10)
- **Public URL:** `https://customer-assets.emergentagent.com/job_aurin-hub/artifacts/q2hzpuno_Gemini_Generated_Image_8fnbtc8fnbtc8fnb.png` (split-mentor schedule with Time Zone selector + capacity bar)
- **Earlier variants:**
  - `https://customer-assets.emergentagent.com/job_aurin-hub/artifacts/3gzmmb6n_Gemini_Generated_Image_jwsb2mjwsb2mjwsb.png` (Today's Slots panel)
  - `https://customer-assets.emergentagent.com/job_aurin-hub/artifacts/vz9ncco8_Gemini_Generated_Image_kw2bl5kw2bl5kw2b.png` (Available Slots overview)
  - `https://customer-assets.emergentagent.com/job_aurin-hub/artifacts/4vlrupxf_Gemini_Generated_Image_704gld704gld704g.png` (Clarity + Grace at attendant desk)
- **Use:** the canonical visual brief for `HolographicCalendar.jsx` (per MASTER_PROTOCOL §10). Glass desk between Clarity (left) and Grace (right). Today's slots glow turquoise (free) or fade grey (booked/past). Booking summary panel on the right. Counter widget bottom-right (10/08/02). Time-zone selector top-centre.
- **Where it influences code:** future `Cabinet.jsx` and `HolographicCalendar.jsx` components; backend `bookings` collection + 5 endpoints in §10.3.

## Image 5 — Clarity (M) & Grace (F) Final Portraits (visual mandate)
- **Public URL:** `https://customer-assets.emergentagent.com/job_aurin-hub/artifacts/q2hzpuno_Gemini_Generated_Image_8fnbtc8fnbtc8fnb.png` *(double check — founder will provide final two-portrait reference shortly)*
- **Latest two-portrait reference:** Clarity (M) in dark sage Nehru-collar coat holding a tablet; Grace (F) in flowing sage robe with braided hair — both on a soft sage gradient. Caption "MATRIX AURIN GUIDES — PROFESSIONAL ATTIRE MANDATE — $0 WARRANTY FIX".
- **Use:** these are the **final canonical likenesses** for the two named guides per MASTER_PROTOCOL §13. When the founder uploads them via `POST /api/admin/clarity/guide-face/{male|female}` they become live everywhere.
- **Mandatory prompt suffix for any future regeneration:** `"professional attire, fully clothed, calm presence, soft sage palette, glowing line-art style"` (per §13.4).

## Per-room atmosphere (founder's directive, locked)
| Room | Palette | Light | Mentor stance |
|------|---------|-------|---------------|
| Private Room (Pihi-tuba) | Deep midnight blue + soft violet | Diffuse, twilight | Silent listener, soft mirroring, 432 Hz hum |
| Body Room | Aquamarine + turquoise + emerald | Pulses with the breath | Energetic guide, aligned presence, vital flow |
| Courses Room | Charcoal + electric blue + neon white | Sharp, focused (panels are the light source) | Authoritative architect, structured infinity |

**Golden thread (cross-room):** subtle "holographic glitch" particle effect; calm, never garish; balanced; no shouty colours; smooth fade-in/fade-out transitions.

## Application rule for agents
1. Before designing any new page, read this file + the three images.
2. Match the atmosphere per route (Private vs Body vs Courses).
3. Never add neon-loud colours, sharp edges, or aggressive sales language.
4. Hologram = the brand face. Never replace with photo-realistic stock images.
