# Evening resume checklist — 2026-06-01

Two parallel tracks are ready to ship tonight:

  **Track A — Publer migration** (drop Buffer, gain 8 channels)
  **Track B — Hearth shelf completion** (stories #4 + #5)

All code is staged. These are runtime steps only.

═══════════════════════════════════════════════════════════════════

## TRACK A · Publer migration

### A1. Finish creating the Publer Business account
- Plan: **Business** (Pro / Free do NOT have API access).
- Cheapest path: **yearly billing** (~$8/mo equivalent ≈ $96/year),
  saves ~60% vs monthly.

### A2. Connect the social channels inside Publer
Connect at minimum the 3 you already serve, ideally more:
- LinkedIn (page or profile)
- X / Twitter
- Pinterest
- Instagram (Business account)
- (optional) Threads, TikTok, Facebook Page, YouTube Shorts

### A3. Generate the API key
**Publer Dashboard → Settings → Access & Login → API Keys → Create**
Required scopes: `posts`, `media`. Copy the token.

### A4. Paste into `/app/backend/.env`
Only ONE line is required to flip the provider:

```
PUBLER_API_KEY=<paste the Bearer-API token here>
```

`PUBLER_WORKSPACE_ID` and `PUBLER_ACCOUNT_*` are auto-discovered
by the bootstrap script in step A5.

### A5. Run the one-shot bootstrap

```bash
cd /app && python3 scripts/publer_bootstrap.py
```

The script will:
- Hit `GET /api/v1/workspaces`, list every workspace.
- Auto-pick the only workspace (or ask which one if there are multiple).
- Hit `GET /api/v1/accounts`, list every connected channel + its id.
- Print the exact `PUBLER_ACCOUNT_*` lines to paste back into `.env`.

Paste the printed block into `.env`, replacing the empty
`PUBLER_WORKSPACE_ID=` and `PUBLER_ACCOUNT_*=` lines.

### A6. Restart + verify

```bash
sudo supervisorctl restart backend

curl -s "$REACT_APP_BACKEND_URL/api/marketing/status" \
     -H "Authorization: Bearer $ADMIN_TOKEN" | python3 -m json.tool
```

Expected output:
```json
{
  "active_provider": "publer",
  "publer_configured": true,
  "publer_workspace_set": true,
  "auto_channels": { "linkedin": true, "twitter": true, ... },
  ...
}
```

### A7. Dispatch the existing queue

```bash
curl -X POST "$REACT_APP_BACKEND_URL/api/marketing/dispatch?all=true" \
     -H "Authorization: Bearer $ADMIN_TOKEN" | python3 -m json.tool
```

If anything fails, check `/api/marketing/queue?status=failed` for the
exact error message Publer returned.

### Rollback (only if Publer breaks)

```bash
sed -i 's/^PUBLER_API_KEY=.*/PUBLER_API_KEY=/' /app/backend/.env
sudo supervisorctl restart backend
```

`marketing_queue.py` falls back to Buffer **automatically** if
`PUBLER_API_KEY` is empty. Buffer credentials stay in `.env`.

═══════════════════════════════════════════════════════════════════

## TRACK B · Hearth shelf completion (stories #4 + #5)

Manuscripts are written and saved at:
- `/app/memory/hearth_story_04_the_window_left_open.md`
- `/app/memory/hearth_story_05_the_garden_in_november.md`

Frontend listen pages are pre-built (NOT yet routed):
- `/app/frontend/src/pages/ListenWindowLeftOpen.jsx`
- `/app/frontend/src/pages/ListenGardenInNovember.jsx`

### B1. Generate the two audio files

```bash
python3 /app/scripts/text_to_voice.py the-window-left-open \
        --world hearth --voice anna-adult

python3 /app/scripts/text_to_voice.py the-garden-in-november \
        --world hearth --voice anna-adult
```

Each will land at:
- `/app/frontend/public/assets/audio/hearth/the-window-left-open.mp3`
- `/app/frontend/public/assets/audio/hearth/the-garden-in-november.mp3`

Padded with 1.0s silence at both ends (Anna's locked spec).

### B2. Wire the routes in `/app/frontend/src/App.js`

Add two imports near the existing Listen* imports (~line 89-92):

```jsx
import ListenWindowLeftOpen from "@/pages/ListenWindowLeftOpen";
import ListenGardenInNovember from "@/pages/ListenGardenInNovember";
```

Add two routes near the existing /listen/hearth/* routes (~line 144-148):

```jsx
<Route path="/listen/hearth/the-window-left-open"  element={<ListenWindowLeftOpen />} />
<Route path="/listen/hearth/the-garden-in-november" element={<ListenGardenInNovember />} />
```

### B3. Update the gateway redirect

Edit `/app/frontend/src/pages/ListenHearthIndex.jsx` — prepend the
two new stories to `HEARTH_STORIES` so `/listen/hearth/` jumps to
the newest story:

```jsx
export const HEARTH_STORIES = [
  { slug: "the-garden-in-november", title: "The Garden in November", publishedAt: "2026-06-01" },
  { slug: "the-window-left-open",   title: "The Window Left Open",   publishedAt: "2026-06-01" },
  { slug: "the-coat-on-the-chair",  title: "The Coat on the Chair",  publishedAt: "2026-05-31" },
  { slug: "the-light-in-the-hallway", title: "The Light in the Hallway", publishedAt: "2026-05-31" },
  { slug: "the-sock-on-the-stairs", title: "The Sock on the Stairs", publishedAt: "2026-05-31" },
];
```

### B4. (optional) Update the previous-story breadcrumb on
`/app/frontend/src/pages/ListenCoatOnChair.jsx`

It currently points back to Story #2. Once Story #4 ships, you may
also want a forward link, but the existing chain still reads
correctly newest-first, so this is optional.

### B5. Smoke-test the new pages

```bash
curl -sI "https://prulesoul.site/listen/hearth/the-window-left-open" | head -1
curl -sI "https://prulesoul.site/listen/hearth/the-garden-in-november" | head -1
```

Both should return `200 OK`. Then open in a browser and click play
on each.

═══════════════════════════════════════════════════════════════════

## Files touched today (for the morning audit)

| File | Status | Why |
|---|---|---|
| `/app/backend/publer_dispatcher.py` | NEW | Publer REST client |
| `/app/backend/marketing_queue.py` | EDIT | Provider auto-selection (Publer ▸ Buffer) |
| `/app/backend/.env` | EDIT | Added `PUBLER_*` placeholder block |
| `/app/scripts/publer_bootstrap.py` | NEW | One-shot workspace+account discovery |
| `/app/memory/hearth_story_04_the_window_left_open.md` | NEW | Hearth #4 manuscript |
| `/app/memory/hearth_story_05_the_garden_in_november.md` | NEW | Hearth #5 manuscript |
| `/app/frontend/src/pages/ListenWindowLeftOpen.jsx` | NEW | Hearth #4 listen page (not yet routed) |
| `/app/frontend/src/pages/ListenGardenInNovember.jsx` | NEW | Hearth #5 listen page (not yet routed) |
| `/app/memory/PUBLER_EVENING_CHECKLIST.md` | NEW | THIS FILE |
