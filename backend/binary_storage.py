"""
Persistent Binary Asset Storage (MongoDB-backed).

PROBLEM:
  Files written to /app/backend/storage/ live on the pod's local
  filesystem. On every deploy/restart in production, that filesystem
  is reset — meaning every Body Room hotspot image, every coloring
  page, and every freshly-extracted book cover disappears the moment
  the founder clicks "Deploy".

SOLUTION (this module):
  Store the same bytes inside MongoDB collection ``binary_assets``.
  MongoDB persists across deploys, so the data survives. Each asset
  has a unique key:  {kind, slug}  →  bytes.

  Document shape (kept under the 16 MB BSON limit; our PNGs are
  ~0.3–1.1 MB):
      {
          "_id":  Mongo ObjectId,
          "kind": "body_room" | "coloring" | "book_pdf" | "book_cover",
          "slug": "throat-unspoken",
          "content_type": "image/png",
          "data": Binary(...),
          "bytes": 364987,
          "created_at": "2026-05-05T22:10:00+00:00",
          "meta": { ... }   # optional caller payload
      }

  Reads are O(1) by ({kind, slug}) thanks to the unique index.

Public API (this module is auth-agnostic — guards live in server.py):
    await put_binary(db, kind, slug, data, content_type, meta=None)
    await get_binary(db, kind, slug) -> Optional[dict]
    await list_binary(db, kind) -> list[dict]   # without bytes
    await delete_binary(db, kind, slug)
"""

from __future__ import annotations

from datetime import datetime, timezone
from typing import Optional

from bson.binary import Binary

# Public collection name — kept separate so it's easy to back up.
COLLECTION_NAME = "binary_assets"


async def ensure_indexes(db) -> None:
    """Create the (kind, slug) unique index. Safe to call repeatedly."""
    await db[COLLECTION_NAME].create_index(
        [("kind", 1), ("slug", 1)],
        unique=True,
        name="uniq_kind_slug",
    )


async def put_binary(
    db,
    *,
    kind: str,
    slug: str,
    data: bytes,
    content_type: str = "application/octet-stream",
    meta: Optional[dict] = None,
) -> dict:
    """Upsert a binary asset. Returns the stored doc (without bytes).

    Files up to ~15 MB are stored inline in a single BSON document.
    Files larger than that are placed in GridFS (collection
    ``binary_assets_fs.{files,chunks}``) and only a pointer is kept in
    the regular collection. Both shapes are read transparently by
    ``get_binary``.
    """
    if not data:
        raise ValueError("Refusing to store empty binary asset.")
    now = datetime.now(timezone.utc).isoformat()

    if len(data) <= 15 * 1024 * 1024:
        payload = {
            "kind": kind,
            "slug": slug,
            "content_type": content_type,
            "data": Binary(data),
            "bytes": len(data),
            "storage": "inline",
            "updated_at": now,
            "meta": meta or {},
        }
        await db[COLLECTION_NAME].update_one(
            {"kind": kind, "slug": slug},
            {"$set": payload, "$setOnInsert": {"created_at": now}},
            upsert=True,
        )
    else:
        # Use GridFS for >15 MB.
        from motor.motor_asyncio import AsyncIOMotorGridFSBucket
        bucket = AsyncIOMotorGridFSBucket(db, bucket_name="binary_assets_fs")

        # Drop any old GridFS object for this {kind,slug} so we don't leak.
        existing = await db[COLLECTION_NAME].find_one(
            {"kind": kind, "slug": slug}, {"_id": 0, "gridfs_id": 1}
        )
        if existing and existing.get("gridfs_id"):
            try:
                await bucket.delete(existing["gridfs_id"])
            except Exception:
                pass

        gid = await bucket.upload_from_stream(
            f"{kind}/{slug}",
            data,
            metadata={"kind": kind, "slug": slug, "content_type": content_type},
        )
        payload = {
            "kind": kind,
            "slug": slug,
            "content_type": content_type,
            "gridfs_id": gid,
            "bytes": len(data),
            "storage": "gridfs",
            "updated_at": now,
            "meta": meta or {},
        }
        # Remove inline data field if it existed.
        await db[COLLECTION_NAME].update_one(
            {"kind": kind, "slug": slug},
            {
                "$set": payload,
                "$unset": {"data": ""},
                "$setOnInsert": {"created_at": now},
            },
            upsert=True,
        )

    return {
        "kind": kind,
        "slug": slug,
        "content_type": content_type,
        "bytes": len(data),
        "updated_at": now,
        "meta": meta or {},
    }


async def get_binary(db, *, kind: str, slug: str) -> Optional[dict]:
    """Fetch a binary asset, including its raw bytes.

    Transparently reads inline-BSON documents AND GridFS-backed ones.
    Returns ``None`` if not found. The returned dict's ``data`` field
    is bytes (not Binary).
    """
    doc = await db[COLLECTION_NAME].find_one(
        {"kind": kind, "slug": slug}, {"_id": 0}
    )
    if not doc:
        return None

    storage = doc.get("storage") or ("gridfs" if doc.get("gridfs_id") else "inline")
    if storage == "gridfs":
        from motor.motor_asyncio import AsyncIOMotorGridFSBucket
        bucket = AsyncIOMotorGridFSBucket(db, bucket_name="binary_assets_fs")
        gid = doc.get("gridfs_id")
        if gid is None:
            return None
        stream = await bucket.open_download_stream(gid)
        raw = await stream.read()
        doc["data"] = raw
    else:
        raw = doc.get("data")
        if isinstance(raw, Binary):
            raw = bytes(raw)
        elif raw is not None and not isinstance(raw, (bytes, bytearray)):
            raw = bytes(raw)
        doc["data"] = raw
    return doc


async def list_binary(db, *, kind: Optional[str] = None) -> list[dict]:
    """List metadata of all assets (no bytes returned)."""
    q: dict = {} if kind is None else {"kind": kind}
    cur = db[COLLECTION_NAME].find(
        q,
        {"_id": 0, "data": 0},  # explicitly exclude data
    ).sort([("kind", 1), ("slug", 1)])
    return [doc async for doc in cur]


async def delete_binary(db, *, kind: str, slug: str) -> bool:
    """Remove an asset. Returns True if a row was deleted."""
    res = await db[COLLECTION_NAME].delete_one({"kind": kind, "slug": slug})
    return res.deleted_count > 0
