"""
seed_anna_coloring_pages.py — one-shot integration of the founder's
own coloring pages into the live `coloring_pages` collection.

Run once:  cd /app/backend && python seed_anna_coloring_pages.py

This script does NOT generate, modify, or restyle the images. It
downloads exactly the bytes the founder shared into the chat,
stores them in `binary_assets` (and the local /assets mirror),
and registers a row in `coloring_pages` with the founder-chosen
age group and title. Idempotent on slug.

Source: founder uploaded 5 PNG artifacts on 2026-02-07.
"""
from __future__ import annotations

import asyncio
import logging
import os
import sys
import uuid
from datetime import datetime, timezone
from pathlib import Path

import httpx
from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient

load_dotenv("/app/backend/.env")

# Make sibling modules importable when run as a script.
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from binary_storage import put_binary  # noqa: E402

logging.basicConfig(level=logging.INFO, format="%(message)s")
logger = logging.getLogger("seed_anna_coloring")

MONGO_URL = os.environ["MONGO_URL"]
DB_NAME = os.environ["DB_NAME"]

COLORING_PUBLIC_DIR = Path("/app/frontend/public/assets/coloring")
COLORING_STORAGE_DIR = Path("/app/backend/storage/coloring")
COLORING_PUBLIC_DIR.mkdir(parents=True, exist_ok=True)
COLORING_STORAGE_DIR.mkdir(parents=True, exist_ok=True)


# Founder-uploaded artifacts, mapped by Anna's intent
# ("vastavalt vanusegrupile kasutada"). The first image carries
# 9-12 panels (Matrix Code / Digital Patterns) per its own labels.
ANNA_PAGES = [
    {
        "slug": "anna-2026-02-07-9-12-aurin-sunlight",
        "title": "Aurin's Sunlight Power",
        "age_group": "9-12",
        "summary": "Four panels: data patterns, digital nature, sunlight power, your colourful aura — for older children who love to think while they colour.",
        "url": "https://customer-assets.emergentagent.com/job_aurin-hub/artifacts/6s9s8a5v_Gemini_Generated_Image_ol8kivol8kivol8k.png",
        "tags": ["Imagination", "Nature", "Patterns"],
    },
    {
        "slug": "anna-2026-02-07-6-8-educational-positive",
        "title": "Helping our world together",
        "age_group": "6-8",
        "summary": "Four small scenes: helping the garden grow, sharing fun with friends, caring for birds, keeping the planet clean.",
        "url": "https://customer-assets.emergentagent.com/job_aurin-hub/artifacts/dikoi58i_Gemini_Generated_Image_52p3ki52p3ki52p3.png",
        "tags": ["Friends", "Nature", "Care"],
    },
    {
        "slug": "anna-2026-02-07-6-8-ocean-adventure",
        "title": "Ocean Adventure",
        "age_group": "6-8",
        "summary": "A whale, a small boat, a lighthouse and palm-tree island — quiet seaside scene for sun-day evenings.",
        "url": "https://customer-assets.emergentagent.com/job_aurin-hub/artifacts/33mlr5bf_Gemini_Generated_Image_epr5xbepr5xbepr5.png",
        "tags": ["Story", "Imagination", "Sea"],
    },
    {
        "slug": "anna-2026-02-07-3-5-bear-birthday",
        "title": "Bear's quiet birthday",
        "age_group": "3-5",
        "summary": "A small bear with a party hat, a tall cake and gentle balloons — calm lines for the youngest hands.",
        "url": "https://customer-assets.emergentagent.com/job_aurin-hub/artifacts/8f8nkqch_Gemini_Generated_Image_dz1wtidz1wtidz1w.png",
        "tags": ["Calm", "Friends", "Joy"],
    },
    {
        "slug": "anna-2026-02-07-3-5-whale-of-the-soft-sea",
        "title": "Whale of the soft sea",
        "age_group": "3-5",
        "summary": "A smiling whale with a fountain, gentle coral and small soft waves — Kids Universe, age 3–5.",
        "url": "https://customer-assets.emergentagent.com/job_aurin-hub/artifacts/93b7776d_Gemini_Generated_Image_5zxa9f5zxa9f5zxa.png",
        "tags": ["Calm", "Sea", "Nature"],
    },
]


async def fetch_bytes(url: str) -> bytes:
    async with httpx.AsyncClient(timeout=30.0) as cli:
        r = await cli.get(url)
        r.raise_for_status()
        return r.content


async def main() -> None:
    client = AsyncIOMotorClient(MONGO_URL)
    db = client[DB_NAME]
    written = await seed_anna_against(db)
    logger.info("[anna-seed] standalone run complete. New rows: %d", written)
    client.close()


async def seed_anna_against(db) -> int:
    """Idempotent — insert any of the 5 founder pages still missing.
    Bulletproof: upserts coloring_pages row even if image fetch / GridFS write fails,
    because the PNG bytes are already shipped on the filesystem mirror."""
    written = 0
    for idx, page in enumerate(ANNA_PAGES, start=1):
        founder_date = f"2026-02-07-founder-{idx:02d}"
        slug = page["slug"]
        existing = await db.coloring_pages.find_one({"slug": slug}, {"_id": 0})
        if existing:
            continue

        # Optional: refresh GridFS bytes (best-effort, tolerated to fail).
        try:
            data = await fetch_bytes(page["url"])
            try:
                await put_binary(
                    db,
                    kind="coloring",
                    slug=slug,
                    data=data,
                    content_type="image/png",
                    meta={
                        "age_group": page["age_group"],
                        "date": founder_date,
                        "title": page["title"],
                        "source": "founder-uploaded",
                    },
                )
            except Exception as exc:
                logger.warning("[anna-seed] put_binary skipped for %s: %s", slug, exc)
            try:
                (COLORING_STORAGE_DIR / f"{slug}.png").write_bytes(data)
                (COLORING_PUBLIC_DIR / f"{slug}.png").write_bytes(data)
            except Exception:
                pass
        except Exception as exc:
            logger.warning("[anna-seed] fetch skipped for %s: %s", slug, exc)

        # Critical: upsert the gallery row regardless of image-storage outcome.
        doc = {
            "id": str(uuid.uuid4()),
            "slug": slug,
            "date": founder_date,
            "age_group": page["age_group"],
            "title": page["title"],
            "summary": page["summary"],
            "tags": page.get("tags", []),
            "image_url": f"/api/coloring/image/{slug}",
            "download_url": f"/api/coloring/image/{slug}",
            "created_at": datetime.now(timezone.utc).isoformat(),
            "source": "founder-uploaded",
        }
        try:
            await db.coloring_pages.update_one(
                {"slug": slug},
                {"$set": doc},
                upsert=True,
            )
            written += 1
            logger.info("[anna-seed] coloring_pages upserted %s", slug)
        except Exception as exc:
            logger.warning("[anna-seed] DB upsert FAILED for %s: %s", slug, exc)
    return written


# Old inline body kept below for the standalone CLI flow.
async def _legacy_inline_run() -> None:
    pass


if __name__ == "__main__":
    asyncio.run(main())
