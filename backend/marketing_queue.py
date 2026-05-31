"""
marketing_queue.py — Aurin-Hub omnichannel publishing queue
============================================================

§MARKETING 2026-05-31 — built after founder directive:
  "kui ma igale poole hakkan ise käsitsi postitusi tegema siis liida
   need 5 min kokku ja jälle on mul terve päev arvuti taga möödas"

Architecture:
    1. MongoDB collection `marketing_queue` stores scheduled posts.
    2. Single endpoint POST /api/marketing/queue accepts a batch of
       posts and stores them with status="scheduled".
    3. Worker (callable manually via /api/marketing/dispatch) loops
       through due posts and pushes them to the relevant channel API
       (Buffer for LinkedIn/X/IG/Pinterest; direct for Substack if
       supported; manual flag for Reddit).
    4. Each post is updated with status="posted" / "failed" + the
       channel's post URL.

ENV requirements (added incrementally, never break if missing):
    BUFFER_ACCESS_TOKEN          — single token covers LinkedIn + X + IG + Pinterest
    BUFFER_PROFILE_LINKEDIN      — Buffer "profile id" for the LinkedIn channel
    BUFFER_PROFILE_TWITTER       — Buffer profile id for X
    BUFFER_PROFILE_INSTAGRAM     — Buffer profile id for IG
    BUFFER_PROFILE_PINTEREST     — Buffer profile id for Pinterest
    (Founder gets these from buffer.com → Settings → Apps & Extras)

Channels supported:
    linkedin  — Buffer
    twitter   — Buffer (X)
    instagram — Buffer
    pinterest — Buffer
    reddit    — MANUAL ONLY (Reddit shadow-bans bots)
    substack  — MANUAL ONLY (no public publish API)

The queue ACCEPTS reddit/substack posts but flags them `manual=true`
so the founder gets a daily digest of what to paste by hand.
"""
from __future__ import annotations

import os
import uuid
import logging
from datetime import datetime, timezone
from typing import List, Optional, Literal

import httpx
from fastapi import APIRouter, HTTPException, Header
from pydantic import BaseModel, Field, ConfigDict
from motor.motor_asyncio import AsyncIOMotorDatabase

logger = logging.getLogger(__name__)

BUFFER_API = "https://api.bufferapp.com/1"

Channel = Literal[
    "linkedin", "twitter", "instagram", "pinterest", "reddit", "substack"
]
Status = Literal["scheduled", "posted", "failed", "manual_pending"]

AUTO_CHANNELS = {"linkedin", "twitter", "instagram", "pinterest"}
MANUAL_CHANNELS = {"reddit", "substack"}


# ---------- Pydantic models ----------

class QueuedPost(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    channel: Channel
    body: str
    media_url: Optional[str] = None
    scheduled_at: datetime
    status: Status = "scheduled"
    posted_url: Optional[str] = None
    posted_at: Optional[datetime] = None
    error: Optional[str] = None
    source_essay: Optional[str] = None
    tag: Optional[str] = None
    manual: bool = False
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class QueueRequest(BaseModel):
    posts: List[QueuedPost]


# ---------- Buffer wrapper ----------

class BufferClient:
    """Thin async wrapper. Buffer's public REST API uses Bearer tokens
    obtained from buffer.com → Settings → Apps & Extras → Access Tokens.
    See https://buffer.com/developers/api for the full surface."""

    def __init__(self):
        self.token = os.environ.get("BUFFER_ACCESS_TOKEN") or ""
        self.profiles = {
            "linkedin": os.environ.get("BUFFER_PROFILE_LINKEDIN") or "",
            "twitter": os.environ.get("BUFFER_PROFILE_TWITTER") or "",
            "instagram": os.environ.get("BUFFER_PROFILE_INSTAGRAM") or "",
            "pinterest": os.environ.get("BUFFER_PROFILE_PINTEREST") or "",
        }

    @property
    def configured(self) -> bool:
        return bool(self.token)

    def has_channel(self, channel: str) -> bool:
        return bool(self.profiles.get(channel))

    async def create_update(
        self,
        channel: str,
        text: str,
        scheduled_at: datetime,
        media_url: Optional[str] = None,
    ) -> dict:
        if not self.configured:
            raise RuntimeError("BUFFER_ACCESS_TOKEN not set")
        profile_id = self.profiles.get(channel)
        if not profile_id:
            raise RuntimeError(f"No Buffer profile id for channel {channel}")
        scheduled_unix = int(scheduled_at.timestamp())
        payload = {
            "profile_ids[]": profile_id,
            "text": text,
            "scheduled_at": scheduled_unix,
            "shorten": "false",
            "access_token": self.token,
        }
        if media_url:
            payload["media[link]"] = media_url
            payload["media[photo]"] = media_url
        async with httpx.AsyncClient(timeout=30) as c:
            r = await c.post(f"{BUFFER_API}/updates/create.json", data=payload)
        if r.status_code >= 300:
            raise RuntimeError(f"Buffer HTTP {r.status_code}: {r.text[:300]}")
        data = r.json()
        if not data.get("success", True):
            raise RuntimeError(f"Buffer error: {data}")
        # Buffer returns "updates" list with each update id
        updates = data.get("updates") or []
        return {
            "buffer_id": updates[0].get("id") if updates else None,
            "raw": data,
        }


# ---------- Router factory ----------

def build_router(db: AsyncIOMotorDatabase) -> APIRouter:
    """Returns the FastAPI router pre-wired to the Mongo db.
    Mount in server.py with:
        from marketing_queue import build_router as marketing_router
        api_router.include_router(marketing_router(db))
    """
    router = APIRouter(prefix="/marketing", tags=["marketing"])
    buffer_client = BufferClient()
    ADMIN_TOKEN = os.environ.get("ADMIN_TOKEN") or ""

    def _check_admin(auth: Optional[str]):
        if not ADMIN_TOKEN:
            raise HTTPException(503, "ADMIN_TOKEN not configured on server")
        if not auth or not auth.startswith("Bearer "):
            raise HTTPException(401, "Missing bearer token")
        if auth.split(" ", 1)[1].strip() != ADMIN_TOKEN:
            raise HTTPException(403, "Forbidden")

    @router.get("/status")
    async def status():
        """Lightweight health + readiness check."""
        return {
            "queue_collection": "marketing_queue",
            "buffer_configured": buffer_client.configured,
            "buffer_channels": {
                ch: buffer_client.has_channel(ch) for ch in AUTO_CHANNELS
            },
            "manual_channels": sorted(MANUAL_CHANNELS),
            "now": datetime.now(timezone.utc).isoformat(),
        }

    @router.post("/queue")
    async def enqueue(req: QueueRequest, authorization: Optional[str] = Header(None)):
        """Append a batch of posts to the queue. Manual channels are
        flagged automatically; auto channels stay 'scheduled' for the
        dispatcher to pick up."""
        _check_admin(authorization)
        if not req.posts:
            raise HTTPException(400, "posts list is empty")
        docs = []
        for p in req.posts:
            if p.channel in MANUAL_CHANNELS:
                p.manual = True
                p.status = "manual_pending"
            docs.append(p.model_dump())
        await db.marketing_queue.insert_many(docs)
        return {
            "ok": True,
            "accepted": len(docs),
            "auto": sum(1 for d in docs if not d["manual"]),
            "manual": sum(1 for d in docs if d["manual"]),
        }

    @router.get("/queue")
    async def list_queue(
        status: Optional[Status] = None,
        channel: Optional[Channel] = None,
        authorization: Optional[str] = Header(None),
    ):
        """Read the queue with optional filters. Always returns
        newest-first, no _id field (per MongoDB adherence rule)."""
        _check_admin(authorization)
        q: dict = {}
        if status:
            q["status"] = status
        if channel:
            q["channel"] = channel
        cursor = db.marketing_queue.find(q, {"_id": 0}).sort("scheduled_at", -1).limit(200)
        items = await cursor.to_list(length=200)
        return {"count": len(items), "items": items}

    @router.post("/dispatch")
    async def dispatch(authorization: Optional[str] = Header(None)):
        """Push all due 'scheduled' auto-channel posts to Buffer.
        Idempotent — only acts on posts whose scheduled_at <= now AND
        status == scheduled."""
        _check_admin(authorization)
        if not buffer_client.configured:
            raise HTTPException(
                503,
                "Buffer is not configured. Set BUFFER_ACCESS_TOKEN and "
                "BUFFER_PROFILE_* env vars first.",
            )
        now = datetime.now(timezone.utc)
        cursor = db.marketing_queue.find(
            {
                "status": "scheduled",
                "manual": False,
                "scheduled_at": {"$lte": now},
            },
            {"_id": 0},
        )
        due = await cursor.to_list(length=100)
        results = {"posted": 0, "failed": 0, "skipped": 0, "details": []}
        for post in due:
            ch = post["channel"]
            if not buffer_client.has_channel(ch):
                results["skipped"] += 1
                results["details"].append(
                    {"id": post["id"], "channel": ch, "skip_reason": "no profile id"}
                )
                continue
            try:
                resp = await buffer_client.create_update(
                    channel=ch,
                    text=post["body"],
                    scheduled_at=post["scheduled_at"]
                    if isinstance(post["scheduled_at"], datetime)
                    else datetime.fromisoformat(str(post["scheduled_at"]).replace("Z", "+00:00")),
                    media_url=post.get("media_url"),
                )
                await db.marketing_queue.update_one(
                    {"id": post["id"]},
                    {
                        "$set": {
                            "status": "posted",
                            "posted_at": datetime.now(timezone.utc),
                            "posted_url": f"buffer://{resp.get('buffer_id')}",
                        }
                    },
                )
                results["posted"] += 1
                results["details"].append(
                    {"id": post["id"], "channel": ch, "buffer_id": resp.get("buffer_id")}
                )
            except Exception as e:
                logger.exception("marketing dispatch failed")
                await db.marketing_queue.update_one(
                    {"id": post["id"]},
                    {"$set": {"status": "failed", "error": str(e)[:500]}},
                )
                results["failed"] += 1
                results["details"].append(
                    {"id": post["id"], "channel": ch, "error": str(e)[:200]}
                )
        results["now"] = now.isoformat()
        return results

    @router.get("/manual-digest")
    async def manual_digest(authorization: Optional[str] = Header(None)):
        """Returns all manual_pending posts grouped by channel. Founder
        uses this each morning to copy-paste into Reddit / Substack
        manually. After posting, founder marks each as 'posted' via
        POST /manual-mark-posted."""
        _check_admin(authorization)
        cursor = db.marketing_queue.find(
            {"status": "manual_pending"},
            {"_id": 0},
        ).sort("scheduled_at", 1)
        items = await cursor.to_list(length=500)
        by_channel: dict = {}
        for it in items:
            by_channel.setdefault(it["channel"], []).append(it)
        return {
            "now": datetime.now(timezone.utc).isoformat(),
            "manual_pending_count": len(items),
            "by_channel": by_channel,
        }

    @router.post("/manual-mark-posted")
    async def mark_posted(
        id: str,
        posted_url: Optional[str] = None,
        authorization: Optional[str] = Header(None),
    ):
        _check_admin(authorization)
        res = await db.marketing_queue.update_one(
            {"id": id, "status": "manual_pending"},
            {
                "$set": {
                    "status": "posted",
                    "posted_at": datetime.now(timezone.utc),
                    "posted_url": posted_url,
                }
            },
        )
        if res.matched_count == 0:
            raise HTTPException(404, "post not found or not manual_pending")
        return {"ok": True, "id": id}

    return router
