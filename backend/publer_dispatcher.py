"""
publer_dispatcher.py — Publer.com social-media scheduler client
================================================================

§PUBLER 2026-06-01 — built after founder rejected Buffer (€18/mo for
3 channels too expensive) and Make.com (wrong tool for social media).
Publer Business plan gives API access + 10+ channels for $8/mo (yearly).

API reference
-------------
* Docs:          https://publer.com/docs/api-reference/introduction
* Base URL:      https://app.publer.com/api/v1
* Auth header:   Authorization: Bearer-API <API_KEY>     (note the
                 unusual "Bearer-API" scheme — NOT plain "Bearer")
* Workspace:     Publer-Workspace-Id: <WORKSPACE_ID>     (required
                 on every workspace-scoped call)
* Scheduling:    POST /posts/schedule   — asynchronous, returns
                 {"job_id": "..."} → poll GET /job_status/<job_id>
                 until {"status": "complete"}
* Workspaces:    GET /workspaces
* Accounts:      GET /accounts   (lists every connected social
                 account in the active workspace)

ENV variables consumed (added incrementally; missing == not configured):
    PUBLER_API_KEY          — Bearer-API token. Publer Dashboard →
                              Settings → Access & Login → API Keys.
                              Required scopes: posts, media.
    PUBLER_WORKSPACE_ID     — Auto-fetched on first call if unset.
    PUBLER_ACCOUNT_LINKEDIN — Publer account id for the LinkedIn channel
    PUBLER_ACCOUNT_TWITTER  — X / Twitter
    PUBLER_ACCOUNT_INSTAGRAM
    PUBLER_ACCOUNT_PINTEREST
    PUBLER_ACCOUNT_THREADS  — optional
    PUBLER_ACCOUNT_TIKTOK   — optional
    PUBLER_ACCOUNT_FACEBOOK — optional
    PUBLER_ACCOUNT_YOUTUBE  — optional (YouTube Shorts)
    PUBLER_API_BASE         — override base URL (default:
                              https://app.publer.com/api/v1)

The dispatcher is provider-agnostic at the marketing_queue layer:
if PUBLER_API_KEY is set, Publer wins; otherwise we fall through to
the legacy Buffer client (kept in marketing_queue.py for safety).
"""
from __future__ import annotations

import os
import asyncio
import logging
from datetime import datetime, timezone, timedelta
from typing import Optional

import httpx

logger = logging.getLogger(__name__)

DEFAULT_BASE = "https://app.publer.com/api/v1"

# Map internal channel name → env var that holds the Publer account id.
PUBLER_ACCOUNT_ENV = {
    "linkedin": "PUBLER_ACCOUNT_LINKEDIN",
    "twitter": "PUBLER_ACCOUNT_TWITTER",
    "instagram": "PUBLER_ACCOUNT_INSTAGRAM",
    "pinterest": "PUBLER_ACCOUNT_PINTEREST",
    "threads": "PUBLER_ACCOUNT_THREADS",
    "tiktok": "PUBLER_ACCOUNT_TIKTOK",
    "facebook": "PUBLER_ACCOUNT_FACEBOOK",
    "youtube": "PUBLER_ACCOUNT_YOUTUBE",
    "bluesky": "PUBLER_ACCOUNT_BLUESKY",
}


class PublerClient:
    """Thin async wrapper around the Publer v1 REST API.

    All methods raise RuntimeError with a human-readable message on
    HTTP / API errors so callers can record `error` on the queue doc.
    """

    def __init__(self):
        self.api_key = os.environ.get("PUBLER_API_KEY") or ""
        self.workspace_id = os.environ.get("PUBLER_WORKSPACE_ID") or ""
        self.base = (os.environ.get("PUBLER_API_BASE") or DEFAULT_BASE).rstrip("/")
        self.accounts = {
            ch: os.environ.get(env_var) or ""
            for ch, env_var in PUBLER_ACCOUNT_ENV.items()
        }

    # ---------- introspection ----------

    @property
    def configured(self) -> bool:
        return bool(self.api_key)

    def has_channel(self, channel: str) -> bool:
        return bool(self.accounts.get(channel))

    def _headers(self, with_workspace: bool = True) -> dict:
        h = {
            "Authorization": f"Bearer-API {self.api_key}",
            "Content-Type": "application/json",
            "Accept": "application/json",
        }
        if with_workspace and self.workspace_id:
            h["Publer-Workspace-Id"] = self.workspace_id
        return h

    # ---------- discovery ----------

    async def list_workspaces(self) -> list[dict]:
        """GET /workspaces — used by the bootstrap script."""
        if not self.api_key:
            raise RuntimeError("PUBLER_API_KEY not set")
        async with httpx.AsyncClient(timeout=30) as c:
            r = await c.get(f"{self.base}/workspaces", headers=self._headers(with_workspace=False))
        if r.status_code >= 400:
            raise RuntimeError(f"Publer /workspaces HTTP {r.status_code}: {r.text[:300]}")
        data = r.json()
        # Publer returns either a list directly or {"workspaces": [...]}.
        if isinstance(data, list):
            return data
        return data.get("workspaces") or data.get("data") or []

    async def list_accounts(self) -> list[dict]:
        """GET /accounts — every social channel connected to the
        active workspace. The bootstrap script uses this to populate
        PUBLER_ACCOUNT_* env vars."""
        if not self.api_key:
            raise RuntimeError("PUBLER_API_KEY not set")
        if not self.workspace_id:
            raise RuntimeError("PUBLER_WORKSPACE_ID not set — run bootstrap first")
        async with httpx.AsyncClient(timeout=30) as c:
            r = await c.get(f"{self.base}/accounts", headers=self._headers())
        if r.status_code >= 400:
            raise RuntimeError(f"Publer /accounts HTTP {r.status_code}: {r.text[:300]}")
        data = r.json()
        if isinstance(data, list):
            return data
        return data.get("accounts") or data.get("data") or []

    # ---------- scheduling ----------

    async def schedule_post(
        self,
        channel: str,
        text: str,
        scheduled_at: datetime,
        media_url: Optional[str] = None,
    ) -> dict:
        """POST /posts/schedule — asynchronous. Returns:
            {"job_id": "...", "polled": {...final status...}}
        The dispatcher in marketing_queue.py persists posted_url as
        publer://<job_id> so we can audit-trail every dispatch.
        """
        if not self.configured:
            raise RuntimeError("PUBLER_API_KEY not set")
        if not self.workspace_id:
            raise RuntimeError(
                "PUBLER_WORKSPACE_ID not set — run publer_bootstrap.py"
            )
        account_id = self.accounts.get(channel)
        if not account_id:
            raise RuntimeError(f"No Publer account id for channel '{channel}'")

        # Publer requires scheduled_at strictly in the future. If our
        # queue ran late, bump by +2 min so the API accepts it and
        # Publer posts almost immediately.
        sched = scheduled_at
        if sched.tzinfo is None:
            sched = sched.replace(tzinfo=timezone.utc)
        now_utc = datetime.now(timezone.utc)
        target = sched if sched > now_utc + timedelta(seconds=30) else now_utc + timedelta(minutes=2)
        scheduled_iso = target.astimezone(timezone.utc).isoformat().replace("+00:00", "Z")

        # Payload shape per https://publer.com/docs/posting/create-posts
        # Bulk wrapper → state → posts → networks (keyed by provider) +
        # accounts (with per-account scheduled_at). Single post per call.

        network_block: dict = {"type": "status", "text": text}
        if media_url:
            # media must be pre-uploaded via Publer's media endpoint
            # to reference by id. For now, pass URL as-is; Publer will
            # reject a status-typed post with media. If we need image
            # posts later, switch type to "photo" and call /media first.
            network_block["type"] = "photo"
            network_block["media"] = [{"path": media_url, "type": "image"}]

        payload = {
            "bulk": {
                "state": "scheduled",
                "posts": [
                    {
                        "networks": {channel: network_block},
                        "accounts": [
                            {"id": account_id, "scheduled_at": scheduled_iso}
                        ],
                    }
                ],
            }
        }

        async with httpx.AsyncClient(timeout=30) as c:
            r = await c.post(
                f"{self.base}/posts/schedule",
                headers=self._headers(),
                json=payload,
            )
        if r.status_code >= 400:
            raise RuntimeError(f"Publer /posts/schedule HTTP {r.status_code}: {r.text[:500]}")
        try:
            data = r.json()
        except Exception:
            raise RuntimeError(f"Publer non-JSON response: {r.text[:300]}")
        # Successful payload: {"success": true, "data": {"job_id": "..."}}
        job_id = (
            (data.get("data") or {}).get("job_id")
            or data.get("job_id")
            or data.get("id")
        )
        if not job_id:
            raise RuntimeError(f"Publer returned no job_id: {str(data)[:300]}")

        # Best-effort poll — Publer schedules asynchronously. We poll
        # briefly so we can surface "complete" / "failed" in the queue
        # doc. If polling exceeds budget, we accept the job_id and
        # mark the queue row 'posted' (Publer owns the scheduling).
        polled = await self._poll_job(job_id, max_attempts=6, delay=0.8)
        return {"job_id": job_id, "polled": polled}

    async def _poll_job(self, job_id: str, max_attempts: int = 6, delay: float = 1.0) -> dict:
        for attempt in range(max_attempts):
            try:
                async with httpx.AsyncClient(timeout=15) as c:
                    r = await c.get(
                        f"{self.base}/job_status/{job_id}",
                        headers=self._headers(),
                    )
                if r.status_code >= 400:
                    return {"polled": False, "http": r.status_code, "body": r.text[:200]}
                payload = r.json()
                # Publer response: {"success": true, "data": {"status": "complete", "result": {...}}}
                data = payload.get("data") or payload
                status = (data.get("status") or "").lower()
                if status in ("complete", "completed", "success", "succeeded"):
                    return {"polled": True, "status": status, "data": data}
                if status in ("failed", "error"):
                    return {"polled": True, "status": status, "data": data}
            except Exception as e:  # noqa: BLE001
                logger.debug("publer poll attempt %d failed: %s", attempt, e)
            await asyncio.sleep(delay)
        return {"polled": False, "reason": "timeout"}
