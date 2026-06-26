"""
hearth_funnel.py — Lead magnet + 3-letter sequence for The Hearth
==================================================================

§HEARTH-FUNNEL 2026-05-31 — built on founder approval of option (a)
in the distribution strategy: "native email funnel, no third-party
SaaS connector, Resend-only."

Flow:
    1. Visitor on /listen/hearth (or other Hearth pages) sees a soft
       opt-in: "If you'd like the second story sent quietly tomorrow."
    2. They enter email → POST /api/hearth-funnel/subscribe.
    3. Immediate response email: "Story 1 link, plus tomorrow's story
       at the same time. Reply to me if you want to talk to a human."
    4. After 24h, automated cron-style call dispatches Letter 2.
    5. After 96h (4 days), Letter 3 with the soft Gumroad CTA.

Anti-marketing rules baked in:
    - NO countdowns
    - NO "exclusive offer expires"
    - NO upsells, NO cross-sells in letters 1-2 (only Letter 3 has a
      single discreet line about the full collection)
    - NO tracking pixels
    - One-click unsubscribe in every email (via /api/hearth-funnel/unsubscribe)

Data:
    Collection `hearth_funnel_subscribers`. Documents:
        {
          email, subscribed_at, last_sent_letter, last_sent_at,
          unsubscribed, source (page slug), id (uuid)
        }
"""
from __future__ import annotations

import os
import uuid
import logging
from datetime import datetime, timezone, timedelta
from typing import Optional

from fastapi import APIRouter, HTTPException, Query, Header
from pydantic import BaseModel, EmailStr, Field
from motor.motor_asyncio import AsyncIOMotorDatabase

import email_service  # existing wrapper

logger = logging.getLogger(__name__)


# ---------- Anna's locked-tone letter content ----------

SITE_BASE = "https://prulesoul.site"


def _letter_subject(n: int) -> str:
    return {
        1: "the first story",
        2: "the second story is open",
        3: "the rest of the shelf",
    }[n]


def _letter_html(n: int, unsubscribe_url: str) -> str:
    """Render a quiet, plain-text-style HTML email. No images, no
    fancy CSS, no logo header. Single column. House brand voice."""

    common_footer = f"""
        <p style="margin-top:36px;font-family:Georgia,serif;font-size:13px;color:#8a7a5a;line-height:1.7;font-style:italic;">
            You are receiving this because you opened the door on prulesoul.site.<br>
            If the door was the wrong shape — <a href="{unsubscribe_url}" style="color:#8a7a5a;">close it here</a> in one click. No follow-up.
        </p>
    """

    if n == 1:
        body = f"""
            <p>Thank you for opening the door.</p>
            <p>The first story is here, the way it lives on the site:<br>
            <a href="{SITE_BASE}/listen/hearth/the-sock-on-the-stairs" style="color:#d6a560;">prulesoul.site/listen/hearth/the-sock-on-the-stairs</a></p>
            <p>It is about 6 minutes. Read by me, in one take. There is no app and no login. Press play, or close your eyes if you'd like.</p>
            <p>I'll send the second story tomorrow at roughly this same time, if you want it. If you do not, the link at the bottom of this email closes the door in one click.</p>
            <p>That is the whole arrangement.</p>
            <p>— Anna</p>
        """
    elif n == 2:
        body = f"""
            <p>The second story is open.</p>
            <p><a href="{SITE_BASE}/listen/hearth/the-light-in-the-hallway" style="color:#d6a560;">prulesoul.site/listen/hearth/the-light-in-the-hallway</a></p>
            <p>It is called "The Light in the Hallway." If "The Sock on the Stairs" was about the kind of work that has no finish line, this one is about being the small steady proof instead of the floodlight.</p>
            <p>Roughly 6 minutes. Listen tonight, or save it for the next quiet hour.</p>
            <p>I'll write once more in a few days. Not to sell you anything urgent — just to point at the rest of the shelf if it is your frequency.</p>
            <p>— Anna</p>
        """
    else:  # n == 3
        body = f"""
            <p>One more note, then I'll stop writing unless you ask me to.</p>
            <p>The Hearth is five evening stories together — the two you have heard, plus three more: "The Coat on the Chair", "The Window Left Open", and "The Garden in November." They are about the parts of being a tired adult that the wellness industry cannot package. The body, the inheritance, the season that looks dead but is just resting.</p>
            <p>Together: a 30-minute audio collection plus the PDF for the nights you'd rather read. One-time payment, no subscription, no streak, no app.</p>
            <p>If it is your frequency: <a href="{SITE_BASE}/the-hearth" style="color:#d6a560;">prulesoul.site/the-hearth</a></p>
            <p>If it is not: the two free stories stay open at <a href="{SITE_BASE}/listen/hearth" style="color:#d6a560;">prulesoul.site/listen/hearth</a>. No follow-up from me beyond this letter.</p>
            <p>Thank you for the quiet attention.</p>
            <p>— Anna</p>
        """

    return f"""
    <html><body style="background:#0f1418;margin:0;padding:32px 0;">
        <div style="max-width:560px;margin:0 auto;padding:32px;background:#141a20;border:1px solid rgba(214,165,96,0.22);border-radius:14px;font-family:Georgia,serif;color:#e8dcc0;font-size:16px;line-height:1.75;">
            {body}
            {common_footer}
        </div>
    </body></html>
    """


def _letter_text(n: int, unsubscribe_url: str) -> str:
    """Plain-text fallback for clients that don't render HTML."""
    if n == 1:
        return (
            "Thank you for opening the door.\n\n"
            f"The first story is here: {SITE_BASE}/listen/hearth/the-sock-on-the-stairs\n\n"
            "About 6 minutes. Read by me, one take. No app, no login.\n\n"
            "I'll send the second story tomorrow if you want it. If not, "
            f"close the door in one click: {unsubscribe_url}\n\n"
            "— Anna"
        )
    if n == 2:
        return (
            "The second story is open.\n\n"
            f"{SITE_BASE}/listen/hearth/the-light-in-the-hallway\n\n"
            "About 6 minutes. \"The Light in the Hallway.\" About being the "
            "small steady proof instead of the floodlight.\n\n"
            "One more letter in a few days. Then I stop unless you ask.\n\n"
            "— Anna\n\n"
            f"Close the door: {unsubscribe_url}"
        )
    return (
        "One more letter, then I stop writing unless you ask.\n\n"
        "The Hearth is five evening stories together — the two you've heard "
        "plus three more. 30 minutes of audio + PDF. One-time payment, no "
        "subscription, no streak, no app.\n\n"
        f"If it is your frequency: {SITE_BASE}/the-hearth\n\n"
        "If it is not, the two free stories stay open. No follow-up beyond "
        "this letter.\n\n"
        "Thank you for the quiet attention.\n— Anna\n\n"
        f"Close the door: {unsubscribe_url}"
    )


# ---------- Pydantic ----------

class SubscribeRequest(BaseModel):
    email: EmailStr
    source: Optional[str] = "listen/hearth"


# ---------- Router ----------

def build_router(db: AsyncIOMotorDatabase) -> APIRouter:
    router = APIRouter(prefix="/hearth-funnel", tags=["hearth-funnel"])
    ADMIN_TOKEN = os.environ.get("ADMIN_TOKEN") or ""
    PUBLIC_BASE = os.environ.get("PUBLIC_BACKEND_URL") or SITE_BASE

    def _check_admin(auth: Optional[str]):
        if not ADMIN_TOKEN:
            raise HTTPException(503, "ADMIN_TOKEN not configured")
        if not auth or not auth.startswith("Bearer "):
            raise HTTPException(401, "Missing bearer token")
        if auth.split(" ", 1)[1].strip() != ADMIN_TOKEN:
            raise HTTPException(403, "Forbidden")

    async def _send_letter(sub: dict, n: int) -> bool:
        unsub_url = f"{PUBLIC_BASE}/api/hearth-funnel/unsubscribe?token={sub['id']}"
        html = _letter_html(n, unsub_url)
        text = _letter_text(n, unsub_url)
        subject = _letter_subject(n)
        try:
            await email_service.send_email(
                to=sub["email"],
                subject=subject,
                html=html,
                text=text,
                sender_kind="info" if email_service.is_configured() else "support",
            )
            await db.hearth_funnel_subscribers.update_one(
                {"id": sub["id"]},
                {"$set": {
                    "last_sent_letter": n,
                    "last_sent_at": datetime.now(timezone.utc),
                }},
            )
            return True
        except Exception as e:
            logger.exception("hearth funnel letter send failed: %s", e)
            return False

    @router.post("/subscribe")
    async def subscribe(req: SubscribeRequest):
        """Public: anyone can sign up. Idempotent — re-subscribing
        with the same email refreshes the subscription rather than
        creating a duplicate. Immediately sends Letter 1."""
        email = req.email.lower().strip()
        existing = await db.hearth_funnel_subscribers.find_one(
            {"email": email}, {"_id": 0}
        )
        if existing and not existing.get("unsubscribed"):
            # Already subscribed — be quiet, do not spam.
            return {"ok": True, "status": "already_subscribed"}
        doc = {
            "id": existing["id"] if existing else str(uuid.uuid4()),
            "email": email,
            "subscribed_at": datetime.now(timezone.utc),
            "last_sent_letter": 0,
            "last_sent_at": None,
            "unsubscribed": False,
            "source": req.source,
        }
        await db.hearth_funnel_subscribers.update_one(
            {"email": email}, {"$set": doc}, upsert=True
        )
        sent = await _send_letter(doc, 1)
        return {"ok": True, "status": "subscribed", "letter_1_sent": sent}

    @router.get("/unsubscribe")
    async def unsubscribe(token: str = Query(...)):
        """Public one-click unsubscribe (per RFC + brand promise)."""
        res = await db.hearth_funnel_subscribers.update_one(
            {"id": token}, {"$set": {"unsubscribed": True, "unsubscribed_at": datetime.now(timezone.utc)}}
        )
        if res.matched_count == 0:
            return {"ok": False, "message": "Door was already closed."}
        # Return a tiny human-readable HTML page rather than JSON
        from fastapi.responses import HTMLResponse
        body = """
        <html><body style="background:#0f1418;color:#e8dcc0;font-family:Georgia,serif;text-align:center;padding:80px 24px;">
            <h2 style="color:#d6a560;font-weight:400;letter-spacing:0.02em;">The door is closed.</h2>
            <p style="font-style:italic;color:#9c8a64;max-width:420px;margin:24px auto;line-height:1.8;">
                Thank you for the time you spent here. No further letters will arrive. The site stays open if you ever change your mind.
            </p>
            <p style="margin-top:48px;"><a href="https://prulesoul.site" style="color:#d6a560;">prulesoul.site</a></p>
        </body></html>
        """
        return HTMLResponse(body)

    @router.post("/dispatch-followups")
    async def dispatch_followups(authorization: Optional[str] = Header(None)):
        """Cron-style worker. Sends Letter 2 to subscribers whose
        Letter 1 was sent ~24h ago, and Letter 3 to those who got
        Letter 2 ~3 days ago. Idempotent — only acts on each
        subscriber once per stage."""
        _check_admin(authorization)
        now = datetime.now(timezone.utc)
        out = {"letter_2_sent": 0, "letter_3_sent": 0, "errors": []}
        # Letter 2: last_sent_letter==1 and last_sent_at <= now - 22h
        for sub in await db.hearth_funnel_subscribers.find(
            {
                "unsubscribed": False,
                "last_sent_letter": 1,
                "last_sent_at": {"$lte": now - timedelta(hours=22)},
            },
            {"_id": 0},
        ).to_list(length=1000):
            ok = await _send_letter(sub, 2)
            if ok:
                out["letter_2_sent"] += 1
            else:
                out["errors"].append({"email": sub["email"], "stage": 2})
        # Letter 3: last_sent_letter==2 and last_sent_at <= now - 3d
        for sub in await db.hearth_funnel_subscribers.find(
            {
                "unsubscribed": False,
                "last_sent_letter": 2,
                "last_sent_at": {"$lte": now - timedelta(days=3)},
            },
            {"_id": 0},
        ).to_list(length=1000):
            ok = await _send_letter(sub, 3)
            if ok:
                out["letter_3_sent"] += 1
            else:
                out["errors"].append({"email": sub["email"], "stage": 3})
        out["now"] = now.isoformat()
        return out

    @router.get("/stats")
    async def stats(authorization: Optional[str] = Header(None)):
        """Admin: funnel health snapshot."""
        _check_admin(authorization)
        total = await db.hearth_funnel_subscribers.count_documents({})
        active = await db.hearth_funnel_subscribers.count_documents({"unsubscribed": False})
        unsubs = await db.hearth_funnel_subscribers.count_documents({"unsubscribed": True})
        by_letter = {}
        for n in (0, 1, 2, 3):
            by_letter[n] = await db.hearth_funnel_subscribers.count_documents(
                {"last_sent_letter": n, "unsubscribed": False}
            )
        return {
            "total": total,
            "active": active,
            "unsubscribed": unsubs,
            "by_last_letter": by_letter,
            "now": datetime.now(timezone.utc).isoformat(),
        }

    return router
