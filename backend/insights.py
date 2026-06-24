"""
insights.py — Visitor analytics + first-question intake
========================================================

Built 2026-06-25 for the Substack soft-launch test window. The brand
rejects third-party trackers (no Google Analytics, no Meta pixel —
luxury silence). All visitor signal is captured server-side and lives
in our own MongoDB.

Two surfaces:

1. POST /api/insights/event       — generic pageview / interaction beacon
2. POST /api/insights/intake      — answer to "What brought you here today?"
3. GET  /api/insights/summary     — admin-only aggregation view (ADMIN_TOKEN required)

Schema is deliberately tiny: session_id (anonymous, client-rotated),
timestamp, path, event_type, optional metadata. No IP, no fingerprint,
no user-agent parsing beyond a coarse mobile/desktop hint.
"""

import os
from datetime import datetime, timezone
from typing import Optional, List, Dict, Any

from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel, Field

ALLOWED_EVENT_TYPES = {
    "pageview",
    "cta_click",
    "intro_complete",
    "intake_shown",
}

# Six fixed options for the first-question intake. The wording mirrors
# the real-life sentences Anna hears from her people — kept literal so
# the data is comparable across two weeks of soft-launch traffic.
INTAKE_OPTIONS = [
    "i_need_a_quieter_evening",
    "family_life_feels_complicated",
    "i_need_clarity_about_something",
    "i_feel_disconnected_from_myself",
    "looking_for_something_for_my_child",
    "just_curious",
]


class EventIn(BaseModel):
    session_id: str = Field(..., min_length=6, max_length=120)
    event_type: str = Field(..., min_length=2, max_length=40)
    path: str = Field(..., min_length=1, max_length=200)
    device: Optional[str] = Field(default=None, max_length=20)
    referrer: Optional[str] = Field(default=None, max_length=300)
    meta: Optional[Dict[str, Any]] = None


class IntakeIn(BaseModel):
    session_id: str = Field(..., min_length=6, max_length=120)
    answer: str = Field(..., min_length=2, max_length=80)
    path: Optional[str] = Field(default=None, max_length=200)
    note: Optional[str] = Field(default=None, max_length=400)


def build_router(db):
    """Mount the insights surface against the active Mongo db handle."""
    router = APIRouter(prefix="/insights", tags=["insights"])

    @router.post("/event", status_code=204)
    async def record_event(body: EventIn):
        if body.event_type not in ALLOWED_EVENT_TYPES:
            raise HTTPException(status_code=400, detail="unknown event_type")
        doc = {
            "session_id": body.session_id,
            "event_type": body.event_type,
            "path": body.path,
            "device": body.device,
            "referrer": (body.referrer or "")[:300],
            "meta": body.meta or {},
            "created_at": datetime.now(timezone.utc).isoformat(),
        }
        await db.insights_events.insert_one(doc)
        return None

    @router.post("/intake", status_code=204)
    async def record_intake(body: IntakeIn):
        if body.answer not in INTAKE_OPTIONS:
            raise HTTPException(status_code=400, detail="unknown answer option")
        doc = {
            "session_id": body.session_id,
            "answer": body.answer,
            "path": body.path,
            "note": (body.note or "").strip()[:400] or None,
            "created_at": datetime.now(timezone.utc).isoformat(),
        }
        await db.insights_intake.insert_one(doc)
        return None

    @router.get("/summary")
    async def summary(request: Request) -> Dict[str, Any]:
        """
        Aggregate view for the admin dashboard. Returns:
          - total unique sessions
          - top viewed paths
          - per-host-intro completion count
          - intake answers distribution
          - last 50 raw intake notes (for qualitative reading)

        Authentication: ADMIN_TOKEN required via `X-Admin-Token`
        header or `?token=` query parameter. Same convention as the
        rest of /api/admin/* routes — keeps the dashboard private.
        """
        admin_token = os.environ.get("ADMIN_TOKEN")
        sent = (
            request.headers.get("X-Admin-Token")
            or request.headers.get("x-admin-token")
            or request.query_params.get("token")
            or ""
        ).strip()
        if not admin_token or sent != admin_token:
            raise HTTPException(status_code=401, detail="Admin token required.")
        events = db.insights_events
        intake = db.insights_intake

        unique_sessions = len(await events.distinct("session_id"))

        # Top 15 paths by event count
        path_pipeline = [
            {"$match": {"event_type": "pageview"}},
            {"$group": {"_id": "$path", "count": {"$sum": 1}}},
            {"$sort": {"count": -1}},
            {"$limit": 15},
        ]
        top_paths = [
            {"path": row["_id"], "count": row["count"]}
            async for row in events.aggregate(path_pipeline)
        ]

        intro_paths = [
            "/grace/intro", "/sara/intro", "/kaelen/intro",
            "/alistair/intro", "/polarstar/intro",
        ]
        intro_counts: List[Dict[str, Any]] = []
        for p in intro_paths:
            total = await events.count_documents({"event_type": "pageview", "path": p})
            completes = await events.count_documents({"event_type": "intro_complete", "path": p})
            intro_counts.append({"path": p, "views": total, "completes": completes})

        intake_pipeline = [
            {"$group": {"_id": "$answer", "count": {"$sum": 1}}},
            {"$sort": {"count": -1}},
        ]
        intake_dist = [
            {"answer": row["_id"], "count": row["count"]}
            async for row in intake.aggregate(intake_pipeline)
        ]

        last_notes_cur = intake.find(
            {"note": {"$ne": None}},
            {"_id": 0, "answer": 1, "note": 1, "path": 1, "created_at": 1},
        ).sort("created_at", -1).limit(50)
        last_notes = [doc async for doc in last_notes_cur]

        total_intake = await intake.count_documents({})

        return {
            "generated_at": datetime.now(timezone.utc).isoformat(),
            "unique_sessions": unique_sessions,
            "total_intake_responses": total_intake,
            "top_paths": top_paths,
            "intro_engagement": intro_counts,
            "intake_distribution": intake_dist,
            "recent_intake_notes": last_notes,
            "allowed_intake_answers": INTAKE_OPTIONS,
        }

    return router
