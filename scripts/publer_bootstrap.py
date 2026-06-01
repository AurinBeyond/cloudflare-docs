"""
publer_bootstrap.py — one-shot Publer onboarding helper
========================================================

Run this ONCE after you have:
  1. Created the Publer Business account.
  2. Connected your social channels (LinkedIn, X, IG, Pinterest, …).
  3. Generated an API key at:
       Publer Dashboard → Settings → Access & Login → API Keys
       (required scopes: posts, media)
  4. Pasted PUBLER_API_KEY=<key> into /app/backend/.env

Usage:
    cd /app && python -m scripts.publer_bootstrap

The script will:
  • Hit GET /api/v1/workspaces, print the workspace IDs.
  • If exactly one workspace exists, auto-select it.
  • Hit GET /api/v1/accounts, print every connected channel + its id.
  • Print the exact PUBLER_ACCOUNT_* lines to paste into .env.
"""
from __future__ import annotations

import asyncio
import os
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "backend"))

from dotenv import load_dotenv  # noqa: E402

load_dotenv(Path(__file__).resolve().parents[1] / "backend" / ".env")

from publer_dispatcher import PublerClient, PUBLER_ACCOUNT_ENV  # noqa: E402

# Heuristic: map Publer's `provider` (per /accounts response) onto our
# internal channel names. Adjust here if Publer's exact field names
# differ — keep both common spellings to be safe.
PROVIDER_TO_CHANNEL = {
    "linkedin": "linkedin",
    "linkedin_profile": "linkedin",
    "linkedin_page": "linkedin",
    "twitter": "twitter",
    "x": "twitter",
    "instagram": "instagram",
    "instagram_business": "instagram",
    "pinterest": "pinterest",
    "threads": "threads",
    "tiktok": "tiktok",
    "facebook": "facebook",
    "facebook_page": "facebook",
    "youtube": "youtube",
    "bluesky": "bluesky",
}


async def main() -> int:
    client = PublerClient()
    if not client.configured:
        print("✘ PUBLER_API_KEY missing in /app/backend/.env")
        return 1

    print("→ Fetching workspaces ...")
    workspaces = await client.list_workspaces()
    if not workspaces:
        print("✘ No workspaces returned. Check the API key has access.")
        return 1
    for w in workspaces:
        wid = w.get("id") or w.get("_id") or w.get("workspace_id")
        name = w.get("name") or w.get("title") or "(unnamed)"
        print(f"   • workspace_id={wid}   name={name}")

    # Auto-pick if only one workspace.
    if not client.workspace_id:
        if len(workspaces) == 1:
            only = workspaces[0]
            client.workspace_id = only.get("id") or only.get("_id") or only.get("workspace_id")
            print(f"\n→ Auto-selected the only workspace: {client.workspace_id}")
            print("  Paste this into .env:")
            print(f"  PUBLER_WORKSPACE_ID={client.workspace_id}")
        else:
            print(
                "\n! Multiple workspaces found. Add the one you want to use as:\n"
                "  PUBLER_WORKSPACE_ID=<id>\n"
                "  then re-run this script."
            )
            return 0

    print("\n→ Fetching connected accounts ...")
    accounts = await client.list_accounts()
    if not accounts:
        print("✘ No accounts returned. Connect at least one channel inside Publer first.")
        return 1

    print(f"   Found {len(accounts)} account(s):")
    env_lines: dict[str, str] = {}
    for a in accounts:
        aid = a.get("id") or a.get("_id") or a.get("account_id")
        provider = (a.get("provider") or a.get("type") or a.get("network") or "").lower()
        name = a.get("name") or a.get("username") or a.get("title") or "(unnamed)"
        ch = PROVIDER_TO_CHANNEL.get(provider)
        marker = f"-> channel='{ch}'" if ch else "(no internal mapping — review)"
        print(f"   • {provider:18s} {name:30s} id={aid}  {marker}")
        if ch and ch in PUBLER_ACCOUNT_ENV:
            env_lines[PUBLER_ACCOUNT_ENV[ch]] = aid

    print("\n──────────────────────────────────────────────────────────")
    print(" Paste the following lines into /app/backend/.env:")
    print("──────────────────────────────────────────────────────────")
    for key, value in env_lines.items():
        print(f"{key}={value}")
    print("──────────────────────────────────────────────────────────")
    print("\nThen restart the backend:  sudo supervisorctl restart backend")
    return 0


if __name__ == "__main__":
    sys.exit(asyncio.run(main()))
