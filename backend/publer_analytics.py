"""
publer_analytics.py — Monday-morning quiet analytics digest
=============================================================

§PUBLER-ANALYTICS 2026-06-01 — founder approval of option (a):
"build the Monday morning email analytics summary using Publer's
native GET /posts before week 2 hits."

What this is:
    A small native analytics layer over Publer's REST API. It does not
    talk to LinkedIn, Bluesky, TikTok, etc. directly — Publer already
    syncs engagement metrics from each platform, and we just read its
    `published_posted` posts and aggregate them.

What it is NOT:
    - A real-time dashboard. (Aurin Hub is anti-dashboard.)
    - A "growth report" with charts. (Wellness-industry coded.)
    - A push notification or alert system.

Brand voice:
    The Monday email lands quietly in the inbox. No subject like
    "Your weekly performance!!" No emojis in the subject line. No
    "you crushed it this week!" The tone matches the rest of the
    Aurin Hub product: a tired friend with a notebook, telling you
    what they saw.

Endpoints exposed (mounted under /api/marketing/analytics):
    GET /weekly-summary       → JSON of last 7 days' posts + engagement
    POST /weekly-summary/send → Calls /weekly-summary then formats it
                                as a plain email via Resend, sends to
                                ANALYTICS_DIGEST_EMAIL (defaults to
                                RESEND_FROM_SUPPORT inbox).

Schedule:
    Wire a daily 07:00 UTC cron that hits /weekly-summary/send only
    when datetime.utcnow().weekday() == 0 (Monday). See server.py
    cron block for the exact line.
"""
from __future__ import annotations

import os
import logging
from collections import defaultdict
from datetime import datetime, timezone, timedelta
from typing import Optional

import httpx
from fastapi import APIRouter, HTTPException, Header

from publer_dispatcher import PublerClient

logger = logging.getLogger(__name__)


def _fmt_human_engagement(post: dict) -> str:
    """Render one line per post for the email body."""
    likes = post.get("likes") or post.get("favorites") or 0
    replies = post.get("replies") or post.get("comments") or 0
    reposts = post.get("reposts") or post.get("retweets") or post.get("shares") or 0
    network = post.get("network") or "?"
    when = (post.get("published_at") or post.get("scheduled_at") or "")[:10]
    head = (post.get("text") or "").split("\n")[0][:80]
    return f"  · {when}  {network:10s}  ♡ {likes:>3}  ↩ {replies:>2}  ↻ {reposts:>2}  — {head}"


async def fetch_weekly_summary(client: PublerClient) -> dict:
    """Returns the last 7 days of published posts grouped by channel
    with simple engagement totals."""
    if not client.configured:
        raise RuntimeError("PUBLER_API_KEY not set")
    if not client.workspace_id:
        raise RuntimeError("PUBLER_WORKSPACE_ID not set")

    now = datetime.now(timezone.utc)
    week_ago = now - timedelta(days=7)

    params = {
        "state": "published",
        "from": week_ago.date().isoformat(),
        "to": now.date().isoformat(),
        "page": 0,
    }
    async with httpx.AsyncClient(timeout=30) as h:
        r = await h.get(
            f"{client.base}/posts",
            headers=client._headers(),
            params=params,
        )
    if r.status_code >= 400:
        raise RuntimeError(f"Publer /posts HTTP {r.status_code}: {r.text[:200]}")
    data = r.json()
    posts = data.get("posts") or []

    by_channel: dict = defaultdict(list)
    totals = {"posts": 0, "likes": 0, "replies": 0, "reposts": 0}
    for p in posts:
        ch = p.get("network") or "unknown"
        by_channel[ch].append(p)
        totals["posts"] += 1
        totals["likes"] += int(p.get("likes") or p.get("favorites") or 0)
        totals["replies"] += int(p.get("replies") or p.get("comments") or 0)
        totals["reposts"] += int(p.get("reposts") or p.get("retweets") or p.get("shares") or 0)

    # Find the "best" post — highest sum of likes+replies+reposts.
    def _score(p):
        return (
            int(p.get("likes") or p.get("favorites") or 0)
            + int(p.get("replies") or p.get("comments") or 0)
            + int(p.get("reposts") or p.get("retweets") or p.get("shares") or 0)
        )
    best = max(posts, key=_score, default=None)

    return {
        "from": week_ago.date().isoformat(),
        "to": now.date().isoformat(),
        "totals": totals,
        "by_channel": {ch: [_fmt_human_engagement(p) for p in items] for ch, items in by_channel.items()},
        "best_post": {
            "network": (best or {}).get("network"),
            "text": ((best or {}).get("text") or "")[:1200],
            "score": _score(best) if best else 0,
            "url": (best or {}).get("post_link"),
        } if best else None,
        "post_count": len(posts),
    }


def render_email_body(summary: dict) -> tuple[str, str]:
    """Return (subject, plain_text_body) in the locked Aurin tone.

    The email reads like a friend who keeps a notebook reporting what
    they saw — no exclamations, no emojis, no growth language.
    """
    t = summary["totals"]
    subject = f"Quiet weekly note — {summary['from']} to {summary['to']}"

    if t["posts"] == 0:
        body = (
            f"Hello,\n\n"
            f"Between {summary['from']} and {summary['to']} the queue did "
            f"not publish anything. Either it was a quiet week by design, "
            f"or something stopped the dispatch.\n\n"
            f"Worth a glance at /api/marketing/status if you want to check.\n\n"
            f"Quietly,\n"
            f"The Aurin Hub notebook"
        )
        return subject, body

    lines = [
        "Hello,",
        "",
        f"Between {summary['from']} and {summary['to']} the queue published "
        f"{t['posts']} post{'s' if t['posts'] != 1 else ''}.",
        "",
        f"Total engagement: {t['likes']} likes, {t['replies']} replies, "
        f"{t['reposts']} reposts.",
        "",
        "By channel:",
    ]
    for ch, items in (summary.get("by_channel") or {}).items():
        lines.append("")
        lines.append(f"  {ch} — {len(items)} post{'s' if len(items) != 1 else ''}")
        for line in items[:8]:  # cap at 8 per channel to keep the email short
            lines.append(line)
        if len(items) > 8:
            lines.append(f"  · ... and {len(items) - 8} more")

    best = summary.get("best_post")
    if best and best.get("score"):
        lines.extend([
            "",
            f"The post that landed best ({best['network']}, score {best['score']}):",
            "",
            best["text"],
        ])
        if best.get("url"):
            lines.append(f"  → {best['url']}")

    lines.extend([
        "",
        "Nothing else to report. The shelf is open.",
        "",
        "Quietly,",
        "The Aurin Hub notebook",
    ])
    return subject, "\n".join(lines)


async def send_via_resend(subject: str, body: str, to_email: str) -> dict:
    """Plain-text email through Resend. No HTML, no tracking pixel."""
    api_key = os.environ.get("RESEND_API_KEY")
    if not api_key:
        raise RuntimeError("RESEND_API_KEY not set")
    from_addr = os.environ.get("RESEND_FROM_INFO") or os.environ.get(
        "RESEND_FROM_SUPPORT"
    ) or "info@prulesoul.site"
    async with httpx.AsyncClient(timeout=30) as h:
        r = await h.post(
            "https://api.resend.com/emails",
            headers={
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json",
            },
            json={
                "from": from_addr,
                "to": [to_email],
                "subject": subject,
                "text": body,
            },
        )
    if r.status_code >= 400:
        raise RuntimeError(f"Resend HTTP {r.status_code}: {r.text[:200]}")
    return r.json()


def build_router() -> APIRouter:
    router = APIRouter(prefix="/marketing/analytics", tags=["marketing-analytics"])
    ADMIN_TOKEN = os.environ.get("ADMIN_TOKEN") or ""
    DEFAULT_RECIPIENT = (
        os.environ.get("ANALYTICS_DIGEST_EMAIL")
        or os.environ.get("REACH_OUT_EMAIL")
        or "info@prulesoul.site"
    )

    def _check_admin(auth: Optional[str]):
        if not ADMIN_TOKEN:
            raise HTTPException(503, "ADMIN_TOKEN not configured")
        if not auth or not auth.startswith("Bearer "):
            raise HTTPException(401, "Missing bearer token")
        if auth.split(" ", 1)[1].strip() != ADMIN_TOKEN:
            raise HTTPException(403, "Forbidden")

    @router.get("/weekly-summary")
    async def weekly_summary(authorization: Optional[str] = Header(None)):
        _check_admin(authorization)
        client = PublerClient()
        return await fetch_weekly_summary(client)

    @router.post("/weekly-summary/send")
    async def weekly_summary_send(
        to: Optional[str] = None,
        force: bool = False,
        authorization: Optional[str] = Header(None),
    ):
        """Send the weekly digest as a plain-text email.

        Idempotent on Mondays. If today is not Monday and `force` is
        false, the call is a no-op so the cron can hit this endpoint
        daily without spamming the inbox.
        """
        _check_admin(authorization)
        now = datetime.now(timezone.utc)
        if now.weekday() != 0 and not force:
            return {
                "skipped": True,
                "reason": "today is not Monday; pass ?force=true to override",
                "weekday": now.strftime("%A"),
            }
        client = PublerClient()
        summary = await fetch_weekly_summary(client)
        subject, body = render_email_body(summary)
        recipient = to or DEFAULT_RECIPIENT
        resend_resp = await send_via_resend(subject, body, recipient)
        return {
            "sent": True,
            "to": recipient,
            "subject": subject,
            "post_count": summary.get("post_count"),
            "resend_id": resend_resp.get("id"),
        }

    return router
