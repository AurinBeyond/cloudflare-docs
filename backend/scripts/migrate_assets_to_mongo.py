"""
One-shot migration: copy every binary asset from the local
``/app/backend/storage/`` filesystem into MongoDB ``binary_assets``.

Why:
    The pod's local filesystem is wiped on every production deploy.
    MongoDB is not. After this migration, every PDF / cover / body-room
    PNG / coloring PNG survives a redeploy.

Idempotent:
    If an asset already exists in MongoDB with the same {kind, slug}
    AND the same byte length, it is left alone.

Run from /app/backend:
    python3 scripts/migrate_assets_to_mongo.py
"""

from __future__ import annotations

import asyncio
import os
import sys
from pathlib import Path

from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
load_dotenv(Path(__file__).resolve().parents[1] / ".env")

from binary_storage import ensure_indexes, get_binary, put_binary  # noqa: E402

ROOT = Path("/app/backend/storage")

# (kind, subdir, content_type, file_extension)
PLAN = [
    ("book_pdf", "books", "application/pdf", ".pdf"),
    ("book_cover", "covers", "image/jpeg", ".jpg"),
    ("body_room", "body_room", "image/png", ".png"),
    ("coloring", "coloring", "image/png", ".png"),
]


async def run() -> None:
    client = AsyncIOMotorClient(os.environ["MONGO_URL"])
    db = client[os.environ["DB_NAME"]]
    await ensure_indexes(db)

    totals = {"checked": 0, "uploaded": 0, "skipped": 0, "failed": 0}

    for kind, subdir, content_type, ext in PLAN:
        d = ROOT / subdir
        if not d.exists():
            print(f"[skip-dir] {d} does not exist")
            continue
        for f in sorted(d.iterdir()):
            if not f.is_file() or not f.name.endswith(ext):
                continue
            slug = f.stem
            data = f.read_bytes()
            totals["checked"] += 1

            existing = await get_binary(db, kind=kind, slug=slug)
            if existing and existing.get("bytes") == len(data):
                totals["skipped"] += 1
                print(f"[skip] {kind}:{slug} already in Mongo ({len(data)} bytes)")
                continue

            try:
                await put_binary(
                    db,
                    kind=kind,
                    slug=slug,
                    data=data,
                    content_type=content_type,
                )
                totals["uploaded"] += 1
                print(f"[ok]   {kind}:{slug} → Mongo ({len(data)} bytes)")
            except Exception as exc:
                totals["failed"] += 1
                print(f"[FAIL] {kind}:{slug}: {exc!r}")

    # Also rewrite existing coloring_pages.image_url to the API path so
    # already-stored docs keep working in production after the deploy.
    res = await db.coloring_pages.update_many(
        {"image_url": {"$regex": "^/assets/"}},
        [{"$set": {
            "image_url": {"$concat": ["/api/coloring/image/", "$slug"]},
            "download_url": {"$concat": ["/api/coloring/image/", "$slug"]},
        }}],
    )
    print(
        f"[coloring_pages] rewrote {res.modified_count} docs to use /api/coloring/image/<slug>"
    )

    print("\nDONE", totals)
    client.close()


if __name__ == "__main__":
    asyncio.run(run())
