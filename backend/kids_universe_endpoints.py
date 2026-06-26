"""
kids_universe_endpoints.py — §KIDS-UNIVERSE-PHASE-2-3-4 2026-02-27

Routes:
  POST   /api/kids-journey/progress              — list unlocked stones (auth, premium)
  POST   /api/kids-journey/unlock-stone          — mark stone unlocked (24h gate)
  POST   /api/kids-journey/star/commit           — save parent's promise (auth, premium)
  GET    /api/kids-journey/star/commitments      — list active + fulfilled (auth)
  POST   /api/kids-journey/star/fulfill          — parent marks promise complete
  POST   /api/kids-journey/album/upload          — upload one photo per stone
  GET    /api/kids-journey/album/list            — list parent's photo memories
  POST   /api/kids-journey/album/delete          — remove a photo
  POST   /api/kids-journey/emotion-checkin       — log Reflection Space emotion
  POST   /api/kids-journey/cron/star-reminders   — admin-token; sends due 48h emails

Auth: all parent-facing endpoints use the same `_resolve_current_user` from
server.py; premium-only endpoints require `presence_seconds_left > 0` OR
an active body_temple_unlock / clarity pass.

100% English copy.
"""
from __future__ import annotations

import base64
import logging
import os
import uuid
from datetime import datetime, timedelta, timezone
from typing import List, Literal, Optional

from fastapi import APIRouter, HTTPException, Request, Depends
from pydantic import BaseModel, Field

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/kids-journey", tags=["kids-journey"])


# §INJECTED DEPENDENCIES (wired in server.py: kids_universe_endpoints.init(...))
_db = None
_user_has_premium = None
_resolve_current_user = None
_require_user = None
_send_email = None


def init(*, db, user_has_premium_fn, resolve_current_user_fn,
         require_user_fn, send_email_fn):
    global _db, _user_has_premium, _resolve_current_user, _require_user, _send_email
    _db = db
    _user_has_premium = user_has_premium_fn
    _resolve_current_user = resolve_current_user_fn
    _require_user = require_user_fn
    _send_email = send_email_fn


# ─── Models ──────────────────────────────────────────────────────────

VALID_ZONES = {"discovery", "exploration", "creation"}
VALID_STONES = {"node-1", "node-2", "node-3", "node-4"}
VALID_PROMISES = {
    "hike", "fishing", "cabin", "book", "foraging", "painting",
}
_PROMISE_LABELS = {
    "hike": "Go on a hike together",
    "fishing": "Go fishing with mom or dad",
    "cabin": "Build a forest cabin",
    "book": "Read a book aloud at bedtime",
    "foraging": "Pick mushrooms or berries",
    "painting": "Paint outdoors together",
}


class StoneRef(BaseModel):
    zone: Literal["discovery", "exploration", "creation"]
    node_id: Literal["node-1", "node-2", "node-3", "node-4"]


class StarCommitInput(StoneRef):
    promise: Literal["hike", "fishing", "cabin", "book", "foraging", "painting"]


class StarFulfillInput(BaseModel):
    commitment_id: str


class AlbumUploadInput(StoneRef):
    photo_base64: str = Field(..., min_length=10)
    caption: str = Field("", max_length=200)
    parental_affirmation: bool = Field(...,
        description="Parent confirms they took the photo and consent to "
                    "store it in the family vault.")


class AlbumDeleteInput(BaseModel):
    photo_id: str


class EmotionCheckinInput(StoneRef):
    emotion_word: str = Field(..., min_length=1, max_length=64)


# ─── Helpers ─────────────────────────────────────────────────────────

async def _ensure_premium(user) -> None:
    """Raises 402 if user is not premium."""
    is_prem = await _user_has_premium(user.user_id)
    if not is_prem:
        raise HTTPException(
            status_code=402,
            detail="This stone is held in quiet until the House opens.",
        )


def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


# ─── Progress ────────────────────────────────────────────────────────

@router.get("/progress/{zone}")
async def get_progress(zone: str, request: Request):
    """Return list of unlocked node_ids for this user in this zone.
    Public-callable: anonymous users see only `["node-1"]` (the demo)."""
    if zone not in VALID_ZONES:
        raise HTTPException(status_code=400, detail="invalid zone")
    user = await _resolve_current_user(request)
    if not user:
        return {"zone": zone, "unlocked_nodes": ["node-1"], "premium": False}
    is_prem = await _user_has_premium(user.user_id)
    if not is_prem:
        return {"zone": zone, "unlocked_nodes": ["node-1"], "premium": False}
    doc = await _db.kids_progress.find_one(
        {"user_id": user.user_id, "zone": zone},
        {"_id": 0, "unlocked_nodes": 1, "last_unlock_at": 1},
    )
    if not doc:
        return {
            "zone": zone,
            "unlocked_nodes": ["node-1"],
            "premium": True,
            "next_unlock_at": None,
        }
    last_iso = doc.get("last_unlock_at")
    next_unlock = None
    if last_iso:
        try:
            last_dt = datetime.fromisoformat(last_iso)
            next_unlock = (last_dt + timedelta(hours=24)).isoformat()
        except Exception:
            next_unlock = None
    return {
        "zone": zone,
        "unlocked_nodes": doc.get("unlocked_nodes") or ["node-1"],
        "premium": True,
        "next_unlock_at": next_unlock,
    }


@router.post("/unlock-stone")
async def unlock_stone(inp: StoneRef, request: Request):
    """Mark a stone unlocked. Enforces 24h cap between unlocks."""
    user = await _require_user(request)
    await _ensure_premium(user)

    existing = await _db.kids_progress.find_one(
        {"user_id": user.user_id, "zone": inp.zone},
        {"_id": 0, "unlocked_nodes": 1, "last_unlock_at": 1},
    )
    unlocked: List[str] = list((existing or {}).get("unlocked_nodes") or ["node-1"])
    if inp.node_id in unlocked:
        return {"ok": True, "already_unlocked": True, "unlocked_nodes": unlocked}

    last_iso = (existing or {}).get("last_unlock_at")
    if last_iso:
        try:
            last_dt = datetime.fromisoformat(last_iso)
            if last_dt + timedelta(hours=24) > datetime.now(timezone.utc):
                next_at = (last_dt + timedelta(hours=24)).isoformat()
                raise HTTPException(
                    status_code=429,
                    detail={
                        "message": "Tomorrow's path reveals itself.",
                        "next_unlock_at": next_at,
                    },
                )
        except HTTPException:
            raise
        except Exception:
            pass

    unlocked.append(inp.node_id)
    now_iso = _now_iso()
    await _db.kids_progress.update_one(
        {"user_id": user.user_id, "zone": inp.zone},
        {"$set": {
            "user_id": user.user_id,
            "zone": inp.zone,
            "unlocked_nodes": unlocked,
            "last_unlock_at": now_iso,
        }},
        upsert=True,
    )
    return {"ok": True, "unlocked_nodes": unlocked, "last_unlock_at": now_iso}


# ─── Star Chamber (commit / fulfill / list) ──────────────────────────

@router.post("/star/commit")
async def star_commit(inp: StarCommitInput, request: Request):
    """Save the parent's screen-free real-world promise. Idempotent
    per (user, zone, node)."""
    user = await _require_user(request)
    await _ensure_premium(user)

    existing = await _db.star_commitments.find_one(
        {"user_id": user.user_id, "zone": inp.zone, "node_id": inp.node_id,
         "fulfilled_at": None},
        {"_id": 0},
    )
    if existing:
        return {"ok": True, "already_committed": True, **existing}

    now = datetime.now(timezone.utc)
    reminder_at = (now + timedelta(hours=48)).isoformat()
    commit_id = f"sc_{uuid.uuid4().hex[:12]}"
    doc = {
        "id": commit_id,
        "user_id": user.user_id,
        "zone": inp.zone,
        "node_id": inp.node_id,
        "promise": inp.promise,
        "promise_label": _PROMISE_LABELS.get(inp.promise, inp.promise),
        "promised_at": now.isoformat(),
        "reminder_at": reminder_at,
        "reminder_sent_at": None,
        "fulfilled_at": None,
    }
    await _db.star_commitments.insert_one(doc)
    doc.pop("_id", None)
    return {"ok": True, **doc}


@router.get("/star/commitments")
async def star_commitments_list(request: Request,
                                only_active: bool = False):
    """List the parent's star commitments. `only_active=true` filters
    out fulfilled ones."""
    user = await _require_user(request)
    q = {"user_id": user.user_id}
    if only_active:
        q["fulfilled_at"] = None
    cursor = _db.star_commitments.find(q, {"_id": 0}).sort("promised_at", -1)
    items = [c async for c in cursor]
    return {"commitments": items, "count": len(items)}


@router.post("/star/fulfill")
async def star_fulfill(inp: StarFulfillInput, request: Request):
    """Parent marks a promise as fulfilled. Returns the next-star
    unlock signal so the frontend can grant the child a fresh star."""
    user = await _require_user(request)
    doc = await _db.star_commitments.find_one(
        {"id": inp.commitment_id, "user_id": user.user_id},
        {"_id": 0},
    )
    if not doc:
        raise HTTPException(status_code=404, detail="commitment not found")
    if doc.get("fulfilled_at"):
        return {"ok": True, "already_fulfilled": True, **doc}
    now_iso = _now_iso()
    await _db.star_commitments.update_one(
        {"id": inp.commitment_id, "user_id": user.user_id},
        {"$set": {"fulfilled_at": now_iso}},
    )
    return {"ok": True, "fulfilled_at": now_iso,
            "next_star_unlocked": True}


# ─── Secret Album (upload / list / delete) ───────────────────────────

_MAX_PHOTO_BYTES = 6 * 1024 * 1024  # 6 MB after base64 decode

@router.post("/album/upload")
async def album_upload(inp: AlbumUploadInput, request: Request):
    """Upload ONE photo per (user, zone, node). Overwrite on reupload.
    Parental affirmation toggle MUST be true (GDPR-K consent).
    Stored as base64 in Mongo for V1 — Anna can migrate to KMS-encrypted
    object store post-launch."""
    user = await _require_user(request)
    await _ensure_premium(user)

    if not inp.parental_affirmation:
        raise HTTPException(
            status_code=400,
            detail="Parental affirmation required to save private memories.",
        )

    raw = inp.photo_base64
    if "," in raw and raw.startswith("data:"):
        # Strip "data:image/png;base64,"
        raw = raw.split(",", 1)[1]
    try:
        raw_bytes = base64.b64decode(raw, validate=True)
    except Exception:
        raise HTTPException(status_code=400, detail="invalid base64 photo")
    if len(raw_bytes) > _MAX_PHOTO_BYTES:
        raise HTTPException(status_code=413, detail="photo too large (max 6 MB)")

    now_iso = _now_iso()
    photo_id = f"ka_{user.user_id[:8]}_{inp.zone}_{inp.node_id}"
    await _db.kids_album_photos.update_one(
        {"id": photo_id},
        {"$set": {
            "id": photo_id,
            "user_id": user.user_id,
            "zone": inp.zone,
            "node_id": inp.node_id,
            "photo_base64": raw,  # store without data: prefix
            "caption": (inp.caption or "").strip(),
            "uploaded_at": now_iso,
            "byte_size": len(raw_bytes),
        }},
        upsert=True,
    )
    return {"ok": True, "id": photo_id, "uploaded_at": now_iso,
            "byte_size": len(raw_bytes)}


@router.get("/album/list")
async def album_list(request: Request, zone: Optional[str] = None):
    """Return all photos for this parent. Photo payload INCLUDED so the
    frontend can show the gallery in one round-trip."""
    user = await _require_user(request)
    q = {"user_id": user.user_id}
    if zone:
        if zone not in VALID_ZONES:
            raise HTTPException(status_code=400, detail="invalid zone")
        q["zone"] = zone
    cursor = _db.kids_album_photos.find(
        q, {"_id": 0}
    ).sort("uploaded_at", -1)
    items = [p async for p in cursor]
    return {"photos": items, "count": len(items)}


@router.post("/album/delete")
async def album_delete(inp: AlbumDeleteInput, request: Request):
    user = await _require_user(request)
    res = await _db.kids_album_photos.delete_one(
        {"id": inp.photo_id, "user_id": user.user_id}
    )
    return {"ok": res.deleted_count > 0, "deleted": res.deleted_count}


# ─── Reflection Space (emotion check-in) ─────────────────────────────

@router.post("/emotion-checkin")
async def emotion_checkin(inp: EmotionCheckinInput, request: Request):
    """Anonymous emotion log. NEVER trains any model. Parent dashboard
    surfaces weekly aggregates only."""
    user = await _require_user(request)
    await _ensure_premium(user)
    word = inp.emotion_word.strip().lower()[:64]
    if not word:
        raise HTTPException(status_code=400, detail="emotion required")
    await _db.emotion_checkins.insert_one({
        "id": f"ec_{uuid.uuid4().hex[:12]}",
        "user_id": user.user_id,
        "zone": inp.zone,
        "node_id": inp.node_id,
        "emotion": word,
        "created_at": _now_iso(),
    })
    return {"ok": True, "logged_emotion": word}


# ─── Cron for 48h star reminders ─────────────────────────────────────

@router.post("/cron/star-reminders")
@router.get("/cron/star-reminders")
async def cron_star_reminders(request: Request):
    """Process due 48h reminder emails. Two auth paths so UptimeRobot
    free plan (no custom headers) can still trigger this safely:

    1. Header `X-Admin-Token: <ADMIN_TOKEN>` — for internal/admin tools.
    2. Query param `?secret=<CRON_SECRET>` — for external uptime monitors
       that cannot send custom headers (UptimeRobot free, etc).

    GET and POST both accepted so UptimeRobot's default monitor type works.
    Idempotent: a commitment's `reminder_sent_at` blocks duplicate sends.
    """
    token_header = request.headers.get("X-Admin-Token") or request.headers.get("x-admin-token")
    secret_param = request.query_params.get("secret")
    admin_token = os.environ.get("ADMIN_TOKEN")
    cron_secret = os.environ.get("CRON_SECRET")

    authorised = False
    if token_header and admin_token and token_header == admin_token:
        authorised = True
    elif secret_param and cron_secret and secret_param == cron_secret:
        authorised = True
    if not authorised:
        raise HTTPException(status_code=403, detail="forbidden")

    now_iso = _now_iso()
    cursor = _db.star_commitments.find(
        {
            "fulfilled_at": None,
            "reminder_sent_at": None,
            "reminder_at": {"$lte": now_iso},
        },
        {"_id": 0},
    )
    sent: list = []
    skipped: list = []
    async for doc in cursor:
        u = await _db.users.find_one(
            {"user_id": doc["user_id"]},
            {"_id": 0, "email": 1, "display_name": 1},
        )
        if not u or not u.get("email"):
            skipped.append({"id": doc["id"], "reason": "no_email"})
            await _db.star_commitments.update_one(
                {"id": doc["id"]},
                {"$set": {"reminder_sent_at": now_iso, "reminder_skipped": "no_email"}},
            )
            continue
        try:
            html = _build_reminder_html(doc, u.get("display_name"))
            text = _build_reminder_text(doc, u.get("display_name"))
            resp = await _send_email(
                to=u["email"],
                subject="A gentle reminder · Aurin's Star is waiting",
                html=html,
                text=text,
                sender="agent",
                tags=[
                    {"name": "kind", "value": "star_reminder"},
                    {"name": "promise", "value": doc.get("promise") or ""},
                ],
                db=_db,
            )
            await _db.star_commitments.update_one(
                {"id": doc["id"]},
                {"$set": {
                    "reminder_sent_at": now_iso,
                    "reminder_resend_id": (resp or {}).get("id"),
                }},
            )
            sent.append({"id": doc["id"], "user_id": doc["user_id"]})
        except Exception as e:  # noqa: BLE001
            logger.warning("star_reminder send failed for %s: %s", doc.get("id"), e)
            skipped.append({"id": doc["id"], "reason": str(e)})
    return {"ok": True, "sent": sent, "skipped": skipped,
            "count_sent": len(sent), "count_skipped": len(skipped)}


def _build_reminder_html(commit: dict, name: Optional[str]) -> str:
    greet = "Hello" if not name else f"Hello, {name}"
    promise = commit.get("promise_label") or commit.get("promise", "")
    return f"""<!DOCTYPE html><html><body style="margin:0;padding:48px 16px;background:#0b0a08;color:#e8e1d5;font-family:'Cormorant Garamond',Georgia,serif;">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0"><tr><td align="center">
<table role="presentation" width="540" style="max-width:540px;background:rgba(18,16,13,0.6);border:1px solid rgba(196,164,107,0.18);border-radius:18px;padding:48px 36px;">
<tr><td align="center" style="padding-bottom:24px;"><p style="margin:0;font-size:11px;letter-spacing:0.42em;text-transform:uppercase;color:#c4a46b;font-family:Georgia,serif;">✦ A gentle reminder</p></td></tr>
<tr><td style="font-size:28px;line-height:1.25;font-style:italic;color:#e8e1d5;text-align:center;padding-bottom:24px;">
{greet}.<br/>A star is waiting.
</td></tr>
<tr><td style="font-size:16px;line-height:1.85;color:#bcb4a3;padding-bottom:20px;">
Two days ago, your child made a quiet promise in Aurin's Star Chamber. The promise was simple:
</td></tr>
<tr><td align="center" style="padding-bottom:24px;">
<span style="display:inline-block;padding:14px 28px;border:1px solid rgba(196,164,107,0.32);border-radius:999px;color:#c4a46b;font-size:14px;letter-spacing:0.16em;text-transform:uppercase;">
{promise}
</span>
</td></tr>
<tr><td style="font-size:16px;line-height:1.85;color:#bcb4a3;padding-bottom:32px;">
There is no rush. The star waits as long as it needs to. When the day comes — a small hike, a quiet hour by the river, an evening of reading aloud — return to the chamber together and mark it done. A new star will appear.
</td></tr>
<tr><td align="center" style="padding-bottom:32px;">
<a href="https://prulesoul.site/parent-portal/stars" style="display:inline-block;padding:14px 32px;background:#c4a46b;color:#0b0a08;text-decoration:none;border-radius:999px;font-size:14px;letter-spacing:0.18em;text-transform:uppercase;">
Open the Star Chamber →
</a>
</td></tr>
<tr><td style="border-top:1px solid rgba(196,164,107,0.1);padding-top:20px;text-align:center;"><p style="margin:0;font-size:10.5px;letter-spacing:0.32em;text-transform:uppercase;color:#5a554c;font-family:Georgia,serif;">Matrix Aurin · A house, not a service.</p></td></tr>
</table></td></tr></table></body></html>"""


def _build_reminder_text(commit: dict, name: Optional[str]) -> str:
    greet = "Hello" if not name else f"Hello, {name}"
    promise = commit.get("promise_label") or commit.get("promise", "")
    return (
        f"{greet}. A star is waiting.\n\n"
        "Two days ago, your child made a quiet promise in Aurin's Star "
        "Chamber. The promise was simple:\n\n"
        f"  ✦ {promise}\n\n"
        "There is no rush. The star waits as long as it needs to. When the "
        "day comes — a small hike, a quiet hour by the river, an evening of "
        "reading aloud — return to the chamber together and mark it done. "
        "A new star will appear.\n\n"
        "Open the Star Chamber: https://prulesoul.site/parent-portal/stars\n\n"
        "Matrix Aurin · A house, not a service."
    )
