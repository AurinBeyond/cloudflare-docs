"""
adult_universe_endpoints.py — §ADULT-V3-PHASE-1-2 2026-02-27

Routes (mirrors kids_universe_endpoints.py pattern):
  GET    /api/adult-rooms/progress/{room}     — list unlocked stones
  POST   /api/adult-rooms/unlock-stone        — mark stone unlocked (24h gate)
  POST   /api/adult-rooms/vault/save-note     — save private reflection
  GET    /api/adult-rooms/vault/list          — list parent's reflections
  POST   /api/adult-rooms/vault/delete        — remove a reflection
  POST   /api/adult-rooms/sparks/commit       — save a Sovereignty Spark promise
  POST   /api/adult-rooms/cron/spark-reminders — admin/secret-gated; 48h follow-up

Premium gating: `body_temple_unlock` OR `presence_seconds_left > 0` OR clarity pass —
same logic as kids universe (reuse `_user_has_premium`).

100% English UI everywhere.
"""
from __future__ import annotations

import logging
import os
import uuid
from datetime import datetime, timedelta, timezone
from typing import List, Literal, Optional

from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel, Field

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/adult-rooms", tags=["adult-rooms"])

# Injected from server.py
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


# Currently only Kaelan is fully built (Phase 2). Grace/Sara/Alistair are
# wired up in the data layer so the same endpoints serve them when those
# rooms ship (Phase 4). The model accepts all four to avoid churn later.
VALID_ROOMS = {"kaelan", "grace", "sara", "alistair"}
VALID_STONES = {"node-1", "node-2", "node-3", "node-4"}


class RoomStoneRef(BaseModel):
    room: Literal["kaelan", "grace", "sara", "alistair"]
    node_id: Literal["node-1", "node-2", "node-3", "node-4"]


class VaultNoteInput(RoomStoneRef):
    note_text: str = Field(..., min_length=1, max_length=2000)
    title: str = Field("", max_length=160)


class VaultDeleteInput(BaseModel):
    note_id: str


class SparkCommitInput(RoomStoneRef):
    practice_id: str = Field(..., min_length=1, max_length=40)
    practice_label: str = Field(..., min_length=1, max_length=200)


def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


async def _ensure_premium(user) -> None:
    if not await _user_has_premium(user.user_id):
        raise HTTPException(
            status_code=402,
            detail="This stone opens when the sanctuary opens.",
        )


# ─── Progress ────────────────────────────────────────────────────────

@router.get("/progress/{room}")
async def get_progress(room: str, request: Request):
    if room not in VALID_ROOMS:
        raise HTTPException(status_code=400, detail="invalid room")
    user = await _resolve_current_user(request)
    if not user or not await _user_has_premium(user.user_id):
        return {"room": room, "unlocked_nodes": ["node-1"], "premium": False,
                "next_unlock_at": None}
    doc = await _db.adult_room_progress.find_one(
        {"user_id": user.user_id, "room": room},
        {"_id": 0, "unlocked_nodes": 1, "last_unlock_at": 1},
    )
    if not doc:
        return {"room": room, "unlocked_nodes": ["node-1"], "premium": True,
                "next_unlock_at": None}
    last_iso = doc.get("last_unlock_at")
    next_unlock = None
    if last_iso:
        try:
            last_dt = datetime.fromisoformat(last_iso)
            next_unlock = (last_dt + timedelta(hours=24)).isoformat()
        except Exception:
            pass
    return {
        "room": room,
        "unlocked_nodes": doc.get("unlocked_nodes") or ["node-1"],
        "premium": True,
        "next_unlock_at": next_unlock,
    }


@router.post("/unlock-stone")
async def unlock_stone(inp: RoomStoneRef, request: Request):
    user = await _require_user(request)
    await _ensure_premium(user)

    existing = await _db.adult_room_progress.find_one(
        {"user_id": user.user_id, "room": inp.room},
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
                        "message": "Tomorrow's stone reveals itself.",
                        "next_unlock_at": next_at,
                    },
                )
        except HTTPException:
            raise
        except Exception:
            pass

    unlocked.append(inp.node_id)
    now_iso = _now_iso()
    await _db.adult_room_progress.update_one(
        {"user_id": user.user_id, "room": inp.room},
        {"$set": {
            "user_id": user.user_id,
            "room": inp.room,
            "unlocked_nodes": unlocked,
            "last_unlock_at": now_iso,
        }},
        upsert=True,
    )
    return {"ok": True, "unlocked_nodes": unlocked, "last_unlock_at": now_iso}


# ─── Sovereignty Vault (private reflections) ─────────────────────────

@router.post("/vault/save-note")
async def vault_save_note(inp: VaultNoteInput, request: Request):
    user = await _require_user(request)
    await _ensure_premium(user)
    note_id = f"sv_{uuid.uuid4().hex[:12]}"
    doc = {
        "id": note_id,
        "user_id": user.user_id,
        "room": inp.room,
        "node_id": inp.node_id,
        "title": (inp.title or "").strip()[:160],
        "note_text": inp.note_text.strip()[:2000],
        "created_at": _now_iso(),
    }
    await _db.adult_sovereignty_vault.insert_one(doc)
    doc.pop("_id", None)
    return {"ok": True, **doc}


@router.get("/vault/list")
async def vault_list(request: Request, room: Optional[str] = None):
    user = await _require_user(request)
    q = {"user_id": user.user_id}
    if room:
        if room not in VALID_ROOMS:
            raise HTTPException(status_code=400, detail="invalid room")
        q["room"] = room
    cursor = _db.adult_sovereignty_vault.find(q, {"_id": 0}).sort("created_at", -1)
    items = [d async for d in cursor]
    return {"notes": items, "count": len(items)}


@router.post("/vault/delete")
async def vault_delete(inp: VaultDeleteInput, request: Request):
    user = await _require_user(request)
    res = await _db.adult_sovereignty_vault.delete_one(
        {"id": inp.note_id, "user_id": user.user_id}
    )
    return {"ok": res.deleted_count > 0, "deleted": res.deleted_count}


# ─── Sovereignty Sparks (commit + 48h reminder) ──────────────────────

@router.post("/sparks/commit")
async def sparks_commit(inp: SparkCommitInput, request: Request):
    user = await _require_user(request)
    await _ensure_premium(user)
    existing = await _db.adult_sovereignty_sparks.find_one(
        {"user_id": user.user_id, "room": inp.room, "node_id": inp.node_id,
         "fulfilled_at": None},
        {"_id": 0},
    )
    if existing:
        return {"ok": True, "already_committed": True, **existing}
    now = datetime.now(timezone.utc)
    spark_id = f"sp_{uuid.uuid4().hex[:12]}"
    doc = {
        "id": spark_id,
        "user_id": user.user_id,
        "room": inp.room,
        "node_id": inp.node_id,
        "practice_id": inp.practice_id,
        "practice_label": inp.practice_label,
        "committed_at": now.isoformat(),
        "reminder_at": (now + timedelta(hours=48)).isoformat(),
        "reminder_sent_at": None,
        "fulfilled_at": None,
    }
    await _db.adult_sovereignty_sparks.insert_one(doc)
    doc.pop("_id", None)
    return {"ok": True, **doc}


# ─── Cron for 48h Sparks reminders ────────────────────────────────────

@router.post("/cron/spark-reminders")
@router.get("/cron/spark-reminders")
async def cron_spark_reminders(request: Request):
    """48h follow-up reminders for adult Sparks commitments. Same dual-
    auth pattern as kids cron: X-Admin-Token header OR ?secret= query."""
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
    cursor = _db.adult_sovereignty_sparks.find(
        {
            "fulfilled_at": None,
            "reminder_sent_at": None,
            "reminder_at": {"$lte": now_iso},
        },
        {"_id": 0},
    )
    sent, skipped = [], []
    async for doc in cursor:
        u = await _db.users.find_one(
            {"user_id": doc["user_id"]},
            {"_id": 0, "email": 1, "display_name": 1},
        )
        if not u or not u.get("email"):
            skipped.append({"id": doc["id"], "reason": "no_email"})
            await _db.adult_sovereignty_sparks.update_one(
                {"id": doc["id"]},
                {"$set": {"reminder_sent_at": now_iso, "reminder_skipped": "no_email"}},
            )
            continue
        try:
            html = _build_reminder_html(doc, u.get("display_name"))
            text = _build_reminder_text(doc, u.get("display_name"))
            resp = await _send_email(
                to=u["email"],
                subject="A quiet follow-up · Your Sovereignty practice",
                html=html, text=text,
                sender="agent",
                tags=[
                    {"name": "kind", "value": "adult_spark_reminder"},
                    {"name": "room", "value": doc.get("room") or ""},
                ],
                db=_db,
            )
            await _db.adult_sovereignty_sparks.update_one(
                {"id": doc["id"]},
                {"$set": {
                    "reminder_sent_at": now_iso,
                    "reminder_resend_id": (resp or {}).get("id"),
                }},
            )
            sent.append({"id": doc["id"], "user_id": doc["user_id"]})
        except Exception as e:  # noqa: BLE001
            logger.warning("adult spark reminder failed for %s: %s", doc.get("id"), e)
            skipped.append({"id": doc["id"], "reason": str(e)})
    return {"ok": True, "sent": sent, "skipped": skipped,
            "count_sent": len(sent), "count_skipped": len(skipped)}


def _build_reminder_html(spark: dict, name: Optional[str]) -> str:
    greet = "Hello" if not name else f"Hello, {name}"
    practice = spark.get("practice_label") or "your practice"
    return f"""<!DOCTYPE html><html><body style="margin:0;padding:48px 16px;background:#0b0a08;color:#e8e1d5;font-family:'Cormorant Garamond',Georgia,serif;">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0"><tr><td align="center">
<table role="presentation" width="540" style="max-width:540px;background:rgba(18,16,13,0.6);border:1px solid rgba(196,164,107,0.18);border-radius:18px;padding:48px 36px;">
<tr><td align="center" style="padding-bottom:24px;"><p style="margin:0;font-size:11px;letter-spacing:0.42em;text-transform:uppercase;color:#c4a46b;font-family:Georgia,serif;">✦ A quiet follow-up</p></td></tr>
<tr><td style="font-size:28px;line-height:1.25;font-style:italic;color:#e8e1d5;text-align:center;padding-bottom:24px;">
{greet}.<br/>The practice is still waiting.
</td></tr>
<tr><td style="font-size:16px;line-height:1.85;color:#bcb4a3;padding-bottom:20px;">
Two days ago you chose a quiet practice. The room kept its memory:
</td></tr>
<tr><td align="center" style="padding-bottom:24px;">
<span style="display:inline-block;padding:14px 28px;border:1px solid rgba(196,164,107,0.32);border-radius:999px;color:#c4a46b;font-size:14px;letter-spacing:0.16em;text-transform:uppercase;">
{practice}
</span>
</td></tr>
<tr><td style="font-size:16px;line-height:1.85;color:#bcb4a3;padding-bottom:32px;">
There is no urgency. When the day allows — a walk without your phone, a strategy written by hand on paper, an hour without input — return to the room and mark it done. The next stone is waiting.
</td></tr>
<tr><td align="center" style="padding-bottom:32px;">
<a href="https://prulesoul.site/adult-rooms/kaelan" style="display:inline-block;padding:14px 32px;background:#c4a46b;color:#0b0a08;text-decoration:none;border-radius:999px;font-size:14px;letter-spacing:0.18em;text-transform:uppercase;">
Return to the Room →
</a>
</td></tr>
<tr><td style="border-top:1px solid rgba(196,164,107,0.1);padding-top:20px;text-align:center;"><p style="margin:0;font-size:10.5px;letter-spacing:0.32em;text-transform:uppercase;color:#5a554c;font-family:Georgia,serif;">Matrix Aurin · A sanctuary, not a service.</p></td></tr>
</table></td></tr></table></body></html>"""


def _build_reminder_text(spark: dict, name: Optional[str]) -> str:
    greet = "Hello" if not name else f"Hello, {name}"
    practice = spark.get("practice_label") or "your practice"
    return (
        f"{greet}. The practice is still waiting.\n\n"
        f"Two days ago you chose a quiet practice:\n\n  ✦ {practice}\n\n"
        "There is no urgency. When the day allows — a walk without your "
        "phone, a strategy written by hand on paper, an hour without input "
        "— return to the room and mark it done. The next stone is waiting.\n\n"
        "Return: https://prulesoul.site/adult-rooms/kaelan\n\n"
        "Matrix Aurin · A sanctuary, not a service."
    )
