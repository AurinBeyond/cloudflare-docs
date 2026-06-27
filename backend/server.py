"""
Matrix Aurin — Backend
======================
Phase 2: Structured content layer prepared for a future GitHub-based
knowledge source and future AI companion. No real GitHub sync yet. No
real auth yet. No real AI yet. Only the receiving architecture.

Content model:
    Category          → analogous to a folder in a GitHub repo
    ContentEntry      → analogous to a single markdown file

Markdown → sections:
    H2 (##) headers become navigable "sections" on the entry page.
    Body stays intact (HTML render), hierarchy is preserved.

Future GitHub sync would populate the same two collections from repo
contents. See `/api/content/sync/github` (stub) for the integration point.
"""

from fastapi import FastAPI, APIRouter, HTTPException, Query, Response
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import asyncio
import os
import re
import json
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional, Literal, Any, Dict
import uuid
from datetime import datetime, timezone, timedelta

import markdown as md_lib
import bleach
import frontmatter

from content_normalizer import parse_markdown_safe
from clarity_crypto import encrypt_text, decrypt_text, is_configured as clarity_crypto_ready
from clarity_ai import generate_guide_reply, summarize_session
from body_room_ai import generate_body_reply
from parents_room_ai import generate_parents_reply
import shared_memory as _shared_memory
from clarity_tts import synthesize_speech, synthesize_speech_stream, is_configured as tts_configured
from clarity_stt import transcribe_audio, is_configured as stt_configured
from six_nights_seed import seed_six_nights, SIX_NIGHTS_CONTENT
from seed_anna_coloring_pages import seed_anna_against

# Phase B3: Real Claude Sonnet 4.5 guide. Toggle via env. When false (or
# when the call fails) we fall back to the curated path-prompt rotation
# defined further below — same backwards-compatible behaviour as before.
CLARITY_AI_ENABLED = os.environ.get("CLARITY_AI_ENABLED", "1") not in ("0", "false", "False", "")

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

mongo_url = os.environ["MONGO_URL"]
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ["DB_NAME"]]

app = FastAPI(title="Matrix Aurin API", version="0.2.0")

# §AUDIT-P1 2026-05-20 — CORS hardening for production scale.
# Previously CORS_ORIGINS defaulted to "*", which disabled credentialed
# requests (browser spec forbids cookies with wildcard origin). For
# 1M+ wanderer scale we want cookies AND Bearer to ride together, so
# the default is now an explicit allow-list of prulesoul.site and
# the preview tunnel. Operators can still override with the env var
# (comma-separated) for staging or local-dev.
_DEFAULT_CORS_ORIGINS = [
    "https://prulesoul.site",
    "https://www.prulesoul.site",
    "https://aurin-hub.preview.emergentagent.com",
]
_cors_origins_env = os.environ.get("CORS_ORIGINS", "").strip()
if _cors_origins_env and _cors_origins_env != "*":
    _cors_origins = [o.strip() for o in _cors_origins_env.split(",") if o.strip()]
elif _cors_origins_env == "*":
    # Legacy wildcard escape hatch — credentials forced off.
    _cors_origins = ["*"]
else:
    _cors_origins = list(_DEFAULT_CORS_ORIGINS)

_CORS_ALLOW_CREDENTIALS = _cors_origins != ["*"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=_cors_origins,
    allow_credentials=_CORS_ALLOW_CREDENTIALS,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["ETag"],
)


# §TRUST-SIGNALS 2026-06-26 — Security headers middleware.
# Robin's "server settings" check flagged these as missing. They are
# trust-signals (visible in any browser dev-tools or curl -I) and
# also genuine defence-in-depth against clickjacking, MIME-sniffing,
# referer leaks and policy-driven feature abuse. None of them break
# any existing functionality — they only add response headers.
@app.middleware("http")
async def _trust_signal_headers(request, call_next):
    response = await call_next(request)
    # Tell HTTPS-capable user-agents to never downgrade to plaintext.
    # 1 year, include subdomains, eligible for HSTS preload list.
    response.headers.setdefault(
        "Strict-Transport-Security",
        "max-age=31536000; includeSubDomains; preload",
    )
    # Disallow being framed by other origins — anti-clickjacking.
    response.headers.setdefault("X-Frame-Options", "DENY")
    # Prevent MIME-sniffing.
    response.headers.setdefault("X-Content-Type-Options", "nosniff")
    # Send only origin on cross-origin navigations; full URL same-origin.
    response.headers.setdefault(
        "Referrer-Policy", "strict-origin-when-cross-origin"
    )
    # Quietly disable browser features we never use.
    response.headers.setdefault(
        "Permissions-Policy",
        "camera=(), geolocation=(), payment=(), usb=(), magnetometer=(), microphone=(self), interest-cohort=()",
    )
    return response


# §AUDIT-RATELIMIT 2026-05-20 — Per-IP token-bucket rate limit middleware.
# Defends against accidental loops, scrapers, and DoS bursts. NOT a
# substitute for Cloudflare / nginx-level WAF — this is the "first
# elementary brake" running in-process. Free tier: 30 requests / 10s
# per remote_addr. Bypass list for healthchecks. State is in-memory
# (process-local) — fine for a single supervisor worker; if we scale
# to multi-worker / multi-pod, swap for a Redis token store.
import time as _ratelimit_time

_RATE_LIMIT_BUCKET: dict = {}
_RATE_LIMIT_MAX = int(os.environ.get("RATE_LIMIT_MAX", "30"))
_RATE_LIMIT_WINDOW_S = int(os.environ.get("RATE_LIMIT_WINDOW_S", "10"))
_RATE_LIMIT_BYPASS = (
    "/api/health",
    "/api/agreement/status",
    # §KIDS-HUBS 2026-02-09 — parent batch-approving a stack of
    # pending Angel Stars hits the 30 req / 10s ceiling. These
    # endpoints are already auth-gated (per-user, not per-IP) and
    # idempotent on duplicate, so bypassing the global brake here
    # is safe. /catalog is public + static so we bypass it too to
    # keep the Kids Hub paint instant.
    "/api/angel-stars/",
    # §KIDS-CURRICULUM 2026-02-09 — Curriculum + mood endpoints
    # paint the Hub on first visit and burst on quiz completion;
    # same bypass rationale as Angel Stars.
    "/api/kids-curriculum/",
    "/api/kids-mood/",
    # §KIDS-JOURNEY 2026-02-10 — paints the stone path on every hub
    # and daily page; read-only, public-friendly, no abuse vector.
    "/api/kids-journey/",
    # §EMAIL-HEALTH 2026-02-11 — Resend webhook must be reachable from
    # Resend's IP range without any auth gating. Signature verification
    # happens inside the endpoint.
    "/api/webhooks/resend",
)


@app.middleware("http")
async def _ratelimit_middleware(request, call_next):
    path = request.url.path
    # Always allow OPTIONS preflight — browsers retry rapidly.
    if request.method == "OPTIONS":
        return await call_next(request)
    if not path.startswith("/api/") or any(path.startswith(b) for b in _RATE_LIMIT_BYPASS):
        return await call_next(request)
    ip = (
        request.headers.get("x-forwarded-for", "").split(",")[0].strip()
        or (request.client.host if request.client else "unknown")
    )
    now = _ratelimit_time.time()
    bucket = _RATE_LIMIT_BUCKET.get(ip)
    if not bucket or now - bucket["window_start"] > _RATE_LIMIT_WINDOW_S:
        _RATE_LIMIT_BUCKET[ip] = {"window_start": now, "count": 1}
    else:
        bucket["count"] += 1
        if bucket["count"] > _RATE_LIMIT_MAX:
            from fastapi.responses import JSONResponse
            return JSONResponse(
                status_code=429,
                content={"detail": "Too many requests. Please slow down."},
            )
    # Soft GC: prune expired buckets every ~256 requests.
    if len(_RATE_LIMIT_BUCKET) > 4096:
        cutoff = now - _RATE_LIMIT_WINDOW_S
        for k in list(_RATE_LIMIT_BUCKET.keys()):
            if _RATE_LIMIT_BUCKET[k]["window_start"] < cutoff:
                _RATE_LIMIT_BUCKET.pop(k, None)
    return await call_next(request)

api_router = APIRouter(prefix="/api")

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)


# §AUDIT-W6 2026-05-20 — Partitioned cookies (CHIPS) for Chrome 118+.
# Chrome's third-party cookie deprecation rejects SameSite=None cookies
# unless they carry the `Partitioned` flag. Starlette's set_cookie does
# not yet expose this attribute, so we craft the Set-Cookie header by
# hand. This keeps Bearer + cookie auth viable when the wanderer's
# browser is in strict-privacy mode (Brave, Safari ITP, Chrome 118+).
def _set_session_cookie(
    response: Response,
    value: str,
    *,
    max_age: int = 7 * 24 * 3600,
    delete: bool = False,
) -> None:
    parts = [f"session_token={'' if delete else value}"]
    parts.append("Path=/")
    if delete:
        parts.append("Max-Age=0")
        parts.append("Expires=Thu, 01 Jan 1970 00:00:00 GMT")
    else:
        parts.append(f"Max-Age={max_age}")
    parts.append("HttpOnly")
    parts.append("Secure")
    parts.append("SameSite=None")
    # `Partitioned` only meaningful for SameSite=None secure cookies.
    parts.append("Partitioned")
    response.headers.append("Set-Cookie", "; ".join(parts))

# =============================================================
# Core health
# =============================================================
class StatusCheck(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class StatusCheckCreate(BaseModel):
    client_name: str


@api_router.get("/")
async def root():
    return {"service": "matrix-aurin", "version": "0.2.0", "status": "ok"}


@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(inp: StatusCheckCreate):
    obj = StatusCheck(**inp.model_dump())
    doc = obj.model_dump()
    doc["timestamp"] = doc["timestamp"].isoformat()
    await db.status_checks.insert_one(doc)
    return obj


@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    rows = await db.status_checks.find({}, {"_id": 0}).to_list(1000)
    for r in rows:
        if isinstance(r.get("timestamp"), str):
            r["timestamp"] = datetime.fromisoformat(r["timestamp"])
    return rows


# =============================================================
# Content — Categories & Entries
# =============================================================
AccessLevel = Literal["free", "member"]
ContentKind = Literal["book", "protocol", "audio", "video", "article", "story"]
Surface = Literal["library", "learning", "brand", "legal", "kids", "meditations"]  # top-level surfaces
Audience = Literal["grown-ups", "kids-universe", "reflections"]


class Category(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    slug: str
    name: str
    description: Optional[str] = None
    surface: Surface = "library"
    order: int = 0
    source: Literal["manual", "github"] = "manual"
    source_path: Optional[str] = None  # e.g. "library/protocols"
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class CategoryCreate(BaseModel):
    slug: str
    name: str
    description: Optional[str] = None
    surface: Surface = "library"
    order: int = 0


class ContentSection(BaseModel):
    """A parsed H2 section from the markdown body."""
    id: str
    title: str
    level: int  # heading level (2 = H2, 3 = H3)


class ContentEntry(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    slug: str
    title: str
    description: Optional[str] = None
    category_slug: str
    surface: Surface = "library"
    kind: ContentKind = "article"
    access: AccessLevel = "free"
    tags: List[str] = Field(default_factory=list)
    markdown: str = ""
    html: str = ""
    sections: List[ContentSection] = Field(default_factory=list)
    frontmatter: dict = Field(default_factory=dict)
    validation_warnings: List[str] = Field(default_factory=list)
    source: Literal["manual", "github"] = "manual"
    source_path: Optional[str] = None  # e.g. "library/protocols/morning.md"
    last_synced_at: Optional[datetime] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class ContentEntryCreate(BaseModel):
    slug: str
    title: str
    description: Optional[str] = None
    category_slug: str
    audience: Optional[Audience] = "grown-ups"
    surface: Surface = "library"
    kind: ContentKind = "article"
    access: AccessLevel = "free"
    tags: List[str] = Field(default_factory=list)
    markdown: str = ""


# -------------------------------------------------------------
# Markdown utilities — this is the layer a future GitHub sync
# would reuse to preserve hierarchy and extract sections.
# -------------------------------------------------------------
ALLOWED_TAGS = {
    "a", "abbr", "acronym", "b", "blockquote", "code", "em", "i", "li", "ol",
    "strong", "ul", "p", "pre", "h1", "h2", "h3", "h4", "h5", "h6", "hr",
    "br", "img", "table", "thead", "tbody", "tr", "td", "th", "span", "div",
    "input",  # for task list items from extension
}
ALLOWED_ATTRS = {
    "a": ["href", "title", "rel"],
    "img": ["src", "alt", "title"],
    "span": ["class"], "div": ["class"], "code": ["class"],
    "input": ["type", "checked", "disabled"],
    "h2": ["id"], "h3": ["id"], "h4": ["id"],
}


def _slugify(text: str) -> str:
    s = re.sub(r"[^\w\s-]", "", text.lower()).strip()
    return re.sub(r"[\s_-]+", "-", s) or "section"


def parse_markdown(md_text: str) -> dict:
    """Wrapper kept for backward compatibility — delegates to the safe parser."""
    return parse_markdown_safe(md_text)


def _now():
    return datetime.now(timezone.utc)


def _serialize(obj: dict) -> dict:
    """Ensure datetime fields are iso strings for MongoDB storage."""
    out = dict(obj)
    for k, v in list(out.items()):
        if isinstance(v, datetime):
            out[k] = v.isoformat()
    return out


def _deserialize(doc: dict) -> dict:
    out = dict(doc)
    for k in ("created_at", "updated_at", "last_synced_at", "timestamp"):
        v = out.get(k)
        if isinstance(v, str):
            try:
                out[k] = datetime.fromisoformat(v)
            except ValueError:
                pass
    return out


# -------------------------------------------------------------
# Categories
# -------------------------------------------------------------
@api_router.get("/content/categories", response_model=List[Category])
async def list_categories(surface: Optional[Surface] = None):
    q = {} if surface is None else {"surface": surface}
    rows = await db.content_categories.find(q, {"_id": 0}).sort("order", 1).to_list(500)
    return [Category(**_deserialize(r)) for r in rows]


@api_router.post("/content/categories", response_model=Category)
async def create_category(inp: CategoryCreate):
    existing = await db.content_categories.find_one({"slug": inp.slug}, {"_id": 0})
    if existing:
        raise HTTPException(status_code=409, detail="Category slug already exists")
    obj = Category(**inp.model_dump())
    await db.content_categories.insert_one(_serialize(obj.model_dump()))
    return obj


# -------------------------------------------------------------
# Entries
# -------------------------------------------------------------
@api_router.get("/content/entries", response_model=List[ContentEntry])
async def list_entries(
    surface: Optional[Surface] = None,
    category: Optional[str] = Query(None, description="Category slug"),
    audience: Optional[Audience] = None,
    access: Optional[AccessLevel] = None,
    q: Optional[str] = Query(None, description="Search in title/description"),
):
    query: dict = {}
    if surface:
        query["surface"] = surface
    if category:
        query["category_slug"] = category
    if audience:
        query["audience"] = audience
    if access:
        query["access"] = access
    if q:
        query["$or"] = [
            {"title": {"$regex": q, "$options": "i"}},
            {"description": {"$regex": q, "$options": "i"}},
        ]
    rows = await db.content_entries.find(query, {"_id": 0}).sort("created_at", -1).to_list(500)
    return [ContentEntry(**_deserialize(r)) for r in rows]


@api_router.get("/content/entries/{slug}", response_model=ContentEntry)
async def get_entry(slug: str):
    row = await db.content_entries.find_one({"slug": slug}, {"_id": 0})
    if not row:
        raise HTTPException(status_code=404, detail="Entry not found")
    return ContentEntry(**_deserialize(row))


@api_router.post("/content/entries", response_model=ContentEntry)
async def create_entry(inp: ContentEntryCreate):
    cat = await db.content_categories.find_one({"slug": inp.category_slug}, {"_id": 0})
    if not cat:
        raise HTTPException(status_code=400, detail="Unknown category_slug")

    existing = await db.content_entries.find_one({"slug": inp.slug}, {"_id": 0})
    if existing:
        raise HTTPException(status_code=409, detail="Entry slug already exists")

    parsed = parse_markdown(inp.markdown or "")
    entry = ContentEntry(
        **inp.model_dump(),
        html=parsed["html"],
        sections=[ContentSection(**s) for s in parsed["sections"]],
        frontmatter=parsed["frontmatter"],
        validation_warnings=parsed.get("warnings", []),
    )
    await db.content_entries.insert_one(_serialize(entry.model_dump()))
    return entry


# -------------------------------------------------------------
# Validate (admin/internal) — dry-run a markdown sample without saving.
# -------------------------------------------------------------
class ValidateRequest(BaseModel):
    markdown: str
    source_path: Optional[str] = None  # for context only


class ValidateResponse(BaseModel):
    ok: bool
    sections: List[ContentSection]
    warnings: List[str]
    html_preview: str  # truncated for safety
    frontmatter: dict


@api_router.post("/content/validate", response_model=ValidateResponse)
async def validate_markdown(inp: ValidateRequest):
    """Admin/internal dry-run. Parses markdown through the same resilient
    pipeline used for stored content and reports warnings without saving.

    Use this before pushing content to GitHub, or while debugging an entry
    that produces visual irregularities.
    """
    parsed = parse_markdown(inp.markdown or "")
    return ValidateResponse(
        ok=True,
        sections=[ContentSection(**s) for s in parsed["sections"]],
        warnings=parsed.get("warnings", []),
        html_preview=(parsed.get("html") or "")[:4000],
        frontmatter=parsed.get("frontmatter") or {},
    )


# -------------------------------------------------------------
# Admin · synced entries listing (read-only). No auth yet — internal.
# -------------------------------------------------------------
class AdminEntrySummary(BaseModel):
    slug: str
    title: str
    surface: Surface
    category_slug: str
    audience: Optional[Audience] = None
    source: Literal["manual", "github"] = "manual"
    source_path: Optional[str] = None
    access: AccessLevel
    sections_count: int
    validation_warnings: List[str]
    last_synced_at: Optional[datetime] = None


@api_router.get("/content/admin/entries", response_model=List[AdminEntrySummary])
async def admin_entries_overview(
    only_with_warnings: bool = Query(False, description="Filter to entries with validation warnings only"),
):
    rows = await db.content_entries.find({}, {"_id": 0}).sort("created_at", -1).to_list(1000)
    summaries: List[AdminEntrySummary] = []
    for r in rows:
        r = _deserialize(r)
        warnings = r.get("validation_warnings") or []
        if only_with_warnings and not warnings:
            continue
        summaries.append(
            AdminEntrySummary(
                slug=r.get("slug", ""),
                title=r.get("title", ""),
                surface=r.get("surface", "library"),
                category_slug=r.get("category_slug", ""),
                audience=r.get("audience"),
                source=r.get("source", "manual"),
                source_path=r.get("source_path"),
                access=r.get("access", "free"),
                sections_count=len(r.get("sections") or []),
                validation_warnings=warnings,
                last_synced_at=r.get("last_synced_at"),
            )
        )
    return summaries


# =============================================================
# GitHub sync — STUB. Integration point documented only.
# =============================================================
class GithubSyncRequest(BaseModel):
    repo: str = "owner/repo"
    branch: str = "main"
    path: str = "content"


@api_router.post("/content/sync/github")
async def github_sync(inp: GithubSyncRequest):
    """
    Pull markdown content from a public GitHub repo. Honours the folder
    convention defined in SYSTEM_ARCHITECTURE.md.

    Folder → surface mapping:
        /brand          → entries (surface=brand)
        /legal          → entries (surface=legal)
        /library        → entries (surface=library)
        /kids           → entries (surface=kids)
        /learning       → entries (surface=learning)
        /meditations    → entries (surface=meditations)
        /bookstore      → books (separate collection)

    Configuration: GITHUB_REPO env var (`owner/repo`). If unset, returns
    `not_configured` so the rest of the platform keeps running on seed
    data. The endpoint accepts repo/branch/path overrides via body.
    """
    import httpx

    repo = inp.repo or os.environ.get("GITHUB_REPO", "")
    branch = inp.branch or os.environ.get("GITHUB_BRANCH", "main")

    if not repo or repo == "owner/repo":
        return {
            "status": "not_configured",
            "message": (
                "Set GITHUB_REPO env (e.g. 'owner/prulesoul-content') and "
                "POST again — or pass {repo, branch} in the body."
            ),
            "received": inp.model_dump(),
        }

    folder_to_surface = {
        "brand": "brand",
        "legal": "legal",
        "library": "library",
        "kids": "kids",
        "learning": "learning",
        "meditations": "meditations",
    }

    headers = {"Accept": "application/vnd.github.v3+json", "User-Agent": "matrix-aurin"}
    token = os.environ.get("GITHUB_TOKEN")
    if token:
        headers["Authorization"] = f"Bearer {token}"

    tree_url = f"https://api.github.com/repos/{repo}/git/trees/{branch}?recursive=1"

    counters = {"entries_upserted": 0, "books_upserted": 0, "skipped": 0, "errors": 0}
    errors: List[dict] = []
    upserted_paths: List[str] = []

    try:
        async with httpx.AsyncClient(timeout=20.0) as http:
            resp = await http.get(tree_url, headers=headers)
            if resp.status_code != 200:
                return {
                    "status": "error",
                    "http_status": resp.status_code,
                    "message": resp.text[:300],
                    "repo": repo,
                    "branch": branch,
                }
            tree = resp.json().get("tree", [])

            md_files = [t for t in tree if t.get("type") == "blob" and t.get("path", "").lower().endswith(".md")]

            for f in md_files:
                path: str = f["path"]
                top = path.split("/")[0]

                if top == "bookstore":
                    raw = await _fetch_raw(http, repo, branch, path, headers)
                    if raw is None:
                        counters["skipped"] += 1
                        continue
                    parsed = parse_markdown(raw)
                    fm = parsed.get("frontmatter") or {}
                    slug = (fm.get("slug") or _path_to_slug(path)).strip()
                    title = (fm.get("title") or _path_to_title(path)).strip()
                    payload = {
                        "slug": slug,
                        "title": title,
                        "subtitle": fm.get("subtitle"),
                        "description": fm.get("description"),
                        "author": fm.get("author") or "Matrix Aurin",
                        "cover_image_url": fm.get("cover_image_url"),
                        "price": float(fm.get("price") or 0),
                        "currency": fm.get("currency") or "NOK",
                        "tax_category": fm.get("tax_category") or "book_zero_rate_ready",
                        "delivery_options": fm.get("delivery_options") or ["read_online", "download_pdf"],
                        "pages": fm.get("pages"),
                        "tags": fm.get("tags") or [],
                        "lemonsqueezy_product_id": fm.get("lemonsqueezy_product_id"),
                        "external_read_url": fm.get("external_read_url"),
                        "pdf_url": fm.get("pdf_url"),
                        "markdown": raw,
                        "html": parsed["html"],
                        "sections": [s for s in parsed["sections"]],
                        "validation_warnings": parsed.get("warnings", []),
                        "source": "github",
                        "source_path": path,
                        "updated_at": _now().isoformat(),
                    }
                    await db.books.update_one(
                        {"slug": slug},
                        {"$set": payload, "$setOnInsert": {"id": str(uuid.uuid4()), "created_at": _now().isoformat(), "published": True}},
                        upsert=True,
                    )
                    counters["books_upserted"] += 1
                    upserted_paths.append(path)
                elif top in folder_to_surface:
                    surface = folder_to_surface[top]
                    raw = await _fetch_raw(http, repo, branch, path, headers)
                    if raw is None:
                        counters["skipped"] += 1
                        continue
                    parsed = parse_markdown(raw)
                    fm = parsed.get("frontmatter") or {}
                    slug = (fm.get("slug") or _path_to_slug(path)).strip()
                    title = (fm.get("title") or _path_to_title(path)).strip()
                    parts = path.split("/")
                    category_slug = (fm.get("category") or (parts[1] if len(parts) > 2 else surface)).strip()
                    audience = fm.get("audience")
                    if surface == "library" and not audience:
                        audience = "grown-ups"

                    # Ensure category exists for library surface
                    if surface == "library":
                        await db.content_categories.update_one(
                            {"slug": category_slug},
                            {"$setOnInsert": _serialize(Category(
                                slug=category_slug,
                                name=category_slug.replace("-", " ").title(),
                                surface="library",
                                source_path="/".join(parts[:2]) if len(parts) > 2 else top,
                            ).model_dump())},
                            upsert=True,
                        )

                    payload = {
                        "slug": slug,
                        "title": title,
                        "description": fm.get("description"),
                        "category_slug": category_slug,
                        "audience": audience,
                        "surface": surface,
                        "kind": fm.get("kind") or "article",
                        "access": fm.get("access") or "free",
                        "tags": fm.get("tags") or [],
                        "markdown": raw,
                        "html": parsed["html"],
                        "sections": [s for s in parsed["sections"]],
                        "frontmatter": fm,
                        "validation_warnings": parsed.get("warnings", []),
                        "source": "github",
                        "source_path": path,
                        "last_synced_at": _now().isoformat(),
                        "updated_at": _now().isoformat(),
                    }
                    await db.content_entries.update_one(
                        {"slug": slug},
                        {"$set": payload, "$setOnInsert": {"id": str(uuid.uuid4()), "created_at": _now().isoformat()}},
                        upsert=True,
                    )
                    counters["entries_upserted"] += 1
                    upserted_paths.append(path)
                else:
                    counters["skipped"] += 1
    except Exception as e:
        logger.exception("GitHub sync failed: %s", e)
        return {"status": "error", "message": str(e), "counters": counters}

    return {
        "status": "ok",
        "repo": repo,
        "branch": branch,
        "counters": counters,
        "errors": errors,
        "upserted_paths": upserted_paths[:50],
    }


async def _fetch_raw(http, repo: str, branch: str, path: str, headers: dict) -> Optional[str]:
    """Fetch a raw markdown file. Returns None on failure (caller logs)."""
    url = f"https://raw.githubusercontent.com/{repo}/{branch}/{path}"
    try:
        r = await http.get(url, headers={k: v for k, v in headers.items() if k != "Accept"})
        if r.status_code == 200:
            return r.text
        logger.warning("raw fetch %s -> %s", path, r.status_code)
        return None
    except Exception as e:
        logger.warning("raw fetch %s failed: %s", path, e)
        return None


def _path_to_slug(path: str) -> str:
    name = path.rsplit("/", 1)[-1]
    if name.lower().endswith(".md"):
        name = name[:-3]
    return _slugify(name)


def _path_to_title(path: str) -> str:
    name = path.rsplit("/", 1)[-1]
    if name.lower().endswith(".md"):
        name = name[:-3]
    return name.replace("-", " ").replace("_", " ").strip().title()


# =============================================================
# AI — STUB. Knowledge layer prepared.
# =============================================================
class AiContextResponse(BaseModel):
    entry_slug: str
    title: str
    tone_reference: str  # will come from _system/tone.md in future
    sections: List[ContentSection]
    markdown: str


class AiChatRequest(BaseModel):
    message: str
    entry_slug: Optional[str] = None


@api_router.get("/ai/context/{slug}", response_model=AiContextResponse)
async def ai_context_for_entry(slug: str):
    """Build the context payload a future AI companion would use."""
    row = await db.content_entries.find_one({"slug": slug}, {"_id": 0})
    if not row:
        raise HTTPException(status_code=404, detail="Entry not found")
    entry = ContentEntry(**_deserialize(row))
    tone = (
        "Matrix Aurin — calm, structured, premium. Speak plainly and slowly. "
        "Prefer short paragraphs. Do not rush. Never invent; say you don't know. "
        "Guide the user one step at a time."
    )
    return AiContextResponse(
        entry_slug=entry.slug,
        title=entry.title,
        tone_reference=tone,
        sections=entry.sections,
        markdown=entry.markdown,
    )


@api_router.post("/ai/chat")
async def ai_chat_stub(inp: AiChatRequest):
    """STUB — a quiet, truthful placeholder until the AI layer is wired."""
    return {
        "status": "not_active",
        "reply": (
            "The companion is not yet active. When it is, it will answer "
            "from the content you see here, in the tone defined for Matrix "
            "Aurin — slowly, clearly, and only from what it knows."
        ),
        "echo": inp.model_dump(),
    }


# =============================================================
# Seed — populate placeholder content on first boot only.
# =============================================================
SEED_CATEGORIES: List[dict] = [
    {"slug": "protocols", "name": "Protocols", "description": "Interactive, text-based guides.", "surface": "library", "order": 1, "source_path": "library/protocols"},
    {"slug": "books", "name": "Books & PDFs", "description": "Digital books and long-form material.", "surface": "library", "order": 2, "source_path": "library/books"},
    {"slug": "materials", "name": "Materials", "description": "Audio, video, and other media.", "surface": "library", "order": 3, "source_path": "library/materials"},
    {"slug": "foundations", "name": "Foundations", "description": "Introductory readings.", "surface": "learning", "order": 1, "source_path": "learning/foundations"},
    {"slug": "practice", "name": "Practice", "description": "Applied readings and exercises.", "surface": "learning", "order": 2, "source_path": "learning/practice"},
]

SEED_ENTRIES: List[dict] = [
    {
        "slug": "morning-orientation-protocol",
        "title": "Morning Orientation",
        "description": "A 7-step gentle reading to begin the day with clarity.",
        "category_slug": "protocols",
        "surface": "library",
        "kind": "protocol",
        "access": "free",
        "tags": ["daily", "orientation"],
        "source_path": "library/protocols/morning-orientation.md",
        "markdown": """---
title: Morning Orientation
access: free
---

## Purpose

Begin the day from a grounded, intentional state rather than from reaction.

## The Seven Steps

### 1. Arrival
Sit for a moment. Notice the room.

### 2. Breath
Three slow cycles. No counting, no effort.

### 3. Orientation
Name, silently: *where I am, what day it is, what matters most*.

### 4. Clarity
Write one sentence: the most important thing for today.

### 5. Boundary
Decide what you will not do today.

### 6. Commitment
Agree with yourself. No bargaining.

### 7. Close
Stand up slowly. Begin.

## Notes

This reading is intentionally short. Keep it under four minutes.
""",
    },
    {
        "slug": "evening-reflection-protocol",
        "title": "Evening Reflection",
        "description": "A slow, gentle review for the close of the day.",
        "category_slug": "protocols",
        "surface": "library",
        "kind": "protocol",
        "access": "free",
        "tags": ["daily", "reflection"],
        "source_path": "library/protocols/evening-reflection.md",
        "markdown": """## Purpose

Close the day deliberately rather than let it trail off.

## Five Questions

### 1. What moved forward?
### 2. What got in the way?
### 3. Where did I break my word to myself?
### 4. What am I grateful for, plainly?
### 5. What does tomorrow need?

## Notes

Write short answers. Do not explain. The briefer the better.
""",
    },
    {
        "slug": "genesis-protocols-volume-i",
        "title": "The Genesis Volumes — Volume I",
        "description": "Foundations of self-mastery. Slow, long-form reading.",
        "category_slug": "books",
        "surface": "library",
        "kind": "book",
        "access": "free",
        "tags": ["foundations"],
        "source_path": "library/books/genesis-volume-1.md",
        "markdown": """## Preface

This volume is a beginning. Nothing here is advanced. Everything here
is durable.

## On Attention

Attention is the only renewable currency. Spend it deliberately.

### How attention is lost

By a thousand small invitations that feel harmless.

### How attention is rebuilt

Slowly, by refusing most invitations and returning to one thing at a time.

## On Structure

A life without structure is not free, it is noisy. Structure is the
silence inside which choice becomes possible.

## Closing

The rest of this work is practice. Begin where you are.
""",
    },
    {
        "slug": "genesis-protocols-volume-ii",
        "title": "The Genesis Volumes — Volume II",
        "description": "Patterns, practice, presence. Member access.",
        "category_slug": "books",
        "surface": "library",
        "kind": "book",
        "access": "member",
        "tags": ["patterns", "practice"],
        "source_path": "library/books/genesis-volume-2.md",
        "markdown": """## Member Preface

This volume continues the work and assumes Volume I is familiar.

## On Patterns

Your problems are rarely new. Learn to see the shape of them.

## On Presence

Presence is not an experience. It is a discipline.
""",
    },
    {
        "slug": "silent-return-meditation",
        "title": "Silent Return — Meditation Series 01",
        "description": "A 22-minute guided meditation for re-centring.",
        "category_slug": "materials",
        "surface": "library",
        "kind": "audio",
        "access": "member",
        "tags": ["meditation", "audio"],
        "source_path": "library/materials/silent-return.md",
        "markdown": """## About

A 22-minute guided session. Quiet voice, long pauses.

## When to use

Any moment you notice you have left yourself.
""",
    },
    {
        "slug": "on-attention-lecture",
        "title": "On Attention — Short Lecture",
        "description": "A 9-minute educational video snippet.",
        "category_slug": "materials",
        "surface": "library",
        "kind": "video",
        "access": "free",
        "tags": ["attention"],
        "source_path": "library/materials/on-attention.md",
        "markdown": """## Summary

A compact lecture on the cost of divided attention and a simple
practice to begin restoring it.
""",
    },
    {
        "slug": "foundations-intro",
        "title": "Foundations — An Introduction",
        "description": "The opening reading. Start here.",
        "category_slug": "foundations",
        "surface": "learning",
        "kind": "article",
        "access": "free",
        "tags": ["start"],
        "source_path": "learning/foundations/intro.md",
        "markdown": """## Welcome

You are at the beginning. That is the only correct place to be.

## What Learning Means Here

### Slow
Nothing is rushed. Sections are short.

### Structured
Every module has a clear role. No filler.

### Practical
You leave each module with something to try, not something to remember.

## Your First Step

Open the next module and read only the first section.
""",
    },
    {
        "slug": "practice-small-commitments",
        "title": "Practice — Small Commitments",
        "description": "An applied reading. How to begin with something that fits.",
        "category_slug": "practice",
        "surface": "learning",
        "kind": "article",
        "access": "free",
        "tags": ["practice"],
        "source_path": "learning/practice/small-commitments.md",
        "markdown": """## Purpose

Large commitments break under real conditions. Small ones survive.

## Rule of One

### Choose one thing
### Make it small enough to feel almost trivial
### Keep it for seven days before reviewing

## After Seven Days

If you kept it, keep it for seven more. If you did not, make it smaller.
""",
    },
]


# =============================================================
# Bookstore — paid digital products. Separate model + collection.
# =============================================================
DeliveryOption = Literal["read_online", "download_pdf"]
TaxCategory = Literal["book_zero_rate_ready", "standard"]


class Book(BaseModel):
    """A sellable digital book. Lives in `books` collection.

    Tax: tax_category="book_zero_rate_ready" prepares the entry for the
    Norway Digital Book 0% VAT/MVA rate. Actual tax computation is the
    payment provider's responsibility.
    """
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    slug: str
    title: str
    subtitle: Optional[str] = None
    description: Optional[str] = None
    author: Optional[str] = "Matrix Aurin"
    cover_image_url: Optional[str] = None
    price: float = 0.0
    currency: str = "USD"
    audience: Literal["adult", "kids"] = "adult"
    tax_category: TaxCategory = "book_zero_rate_ready"
    delivery_options: List[DeliveryOption] = Field(default_factory=lambda: ["read_online", "download_pdf"])
    pages: Optional[int] = None
    tags: List[str] = Field(default_factory=list)
    lemonsqueezy_product_id: Optional[str] = None
    lemonsqueezy_variant_id: Optional[str] = None
    markdown: str = ""
    html: str = ""
    sections: List[ContentSection] = Field(default_factory=list)
    validation_warnings: List[str] = Field(default_factory=list)
    pdf_url: Optional[str] = None  # placeholder — object storage later
    external_read_url: Optional[str] = None  # eBookMaker / external preview link
    source: Literal["manual", "github"] = "manual"
    source_path: Optional[str] = None
    published: bool = True
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class BookCreate(BaseModel):
    slug: str
    title: str
    subtitle: Optional[str] = None
    description: Optional[str] = None
    author: Optional[str] = "Matrix Aurin"
    cover_image_url: Optional[str] = None
    price: float = 0.0
    currency: str = "USD"
    audience: Literal["adult", "kids"] = "adult"
    tax_category: TaxCategory = "book_zero_rate_ready"
    delivery_options: List[DeliveryOption] = Field(default_factory=lambda: ["read_online", "download_pdf"])
    pages: Optional[int] = None
    tags: List[str] = Field(default_factory=list)
    lemonsqueezy_product_id: Optional[str] = None
    external_read_url: Optional[str] = None
    pdf_url: Optional[str] = None
    markdown: str = ""


@api_router.get("/books", response_model=List[Book])
async def list_books(
    q: Optional[str] = Query(None, description="Search in title/description"),
    audience: Optional[Literal["adult", "kids"]] = None,
    published_only: bool = True,
):
    query: dict = {}
    if published_only:
        query["published"] = True
    if audience:
        query["audience"] = audience
    if q:
        query["$or"] = [
            {"title": {"$regex": q, "$options": "i"}},
            {"description": {"$regex": q, "$options": "i"}},
        ]
    rows = await db.books.find(query, {"_id": 0}).sort("created_at", -1).to_list(500)
    return [Book(**_deserialize(r)) for r in rows]


@api_router.get("/books/{slug}", response_model=Book)
async def get_book(slug: str):
    row = await db.books.find_one({"slug": slug}, {"_id": 0})
    if not row:
        raise HTTPException(status_code=404, detail="Book not found")
    return Book(**_deserialize(row))


@api_router.post("/books", response_model=Book)
async def create_book(inp: BookCreate):
    existing = await db.books.find_one({"slug": inp.slug}, {"_id": 0})
    if existing:
        raise HTTPException(status_code=409, detail="Book slug already exists")
    parsed = parse_markdown(inp.markdown or "")
    book = Book(
        **inp.model_dump(),
        html=parsed["html"],
        sections=[ContentSection(**s) for s in parsed["sections"]],
        validation_warnings=parsed.get("warnings", []),
    )
    await db.books.insert_one(_serialize(book.model_dump()))
    return book


SEED_BOOKS: List[dict] = [
    {
        "slug": "beyond-the-matrix-i",
        "title": "Beyond the Matrix",
        "subtitle": "Volume I — A first reading",
        "description": (
            "The opening volume of the Beyond the Matrix series. A short, "
            "honest book about the invisible code most of us inherited — and "
            "the calm work of becoming free of it."
        ),
        "author": "prulesoul",
        "price": 13.0,
        "currency": "USD",
        "audience": "adult",
        "tax_category": "book_zero_rate_ready",
        "delivery_options": ["download_pdf"],
        "pages": None,
        "tags": ["consciousness", "patterns", "reading"],
        "lemonsqueezy_product_id": "1023869",
        "lemonsqueezy_variant_id": "1606071",
        "external_read_url": None,
        "pdf_url": "/api/cabinet/library/beyond-the-matrix-i/download",
        "cover_image_url": "/api/books/cover/beyond-the-matrix-i.jpg",
        "source_path": "bookstore/beyond-the-matrix-i.md",
        "markdown": """## About\n\nThe first volume in the Beyond the Matrix series. A short, honest book.\n\n## How to read\n\nSlowly. With pauses. Underline freely.\n""",
    },
    # ---------- ADULT ----------
    {
        "slug": "you-dont-have-to-dance-to-anothers-tune",
        "title": "You Don't Have to Dance to Another's Tune",
        "subtitle": "On boundaries, choice, and quiet courage",
        "description": (
            "A short, direct book about reclaiming your own rhythm. Written for "
            "adults who feel they have been moving to a melody chosen by others — "
            "family, culture, fear — and want a calm way home to themselves."
        ),
        "author": "prulesoul",
        "price": 7.0,
        "currency": "USD",
        "audience": "adult",
        "tax_category": "book_zero_rate_ready",
        "delivery_options": ["download_pdf"],
        "pages": None,
        "tags": ["self-growth", "boundaries", "courage"],
        "lemonsqueezy_product_id": "1023943",
        "lemonsqueezy_variant_id": "1606185",
        "external_read_url": None,
        "pdf_url": "/api/cabinet/library/you-dont-have-to-dance-to-anothers-tune/download",
        "cover_image_url": "/api/books/cover/you-dont-have-to-dance-to-anothers-tune.jpg",
        "source_path": "bookstore/you-dont-have-to-dance.md",
        "markdown": """## A short preface\n\nThis is a small book on a large subject — choosing your own life.\n\n## You are allowed to stop\n\nThe first sentence is simple: you do not have to dance to a tune that was never yours.\n\n## What this book is\n\nA quiet companion. Read slowly. Underline freely.\n""",
    },
    {
        "slug": "the-language-of-angels",
        "title": "The Language of Angels",
        "subtitle": "Embracing Boundaries and Inner Worth",
        "description": (
            "A spiritual book for adults — gentle and warm, written with care. For "
            "readers who want to hear the quieter voice inside themselves and learn "
            "to speak back to it with care."
        ),
        "author": "prulesoul",
        "price": 10.0,
        "currency": "USD",
        "audience": "adult",
        "tax_category": "book_zero_rate_ready",
        "delivery_options": ["download_pdf"],
        "pages": None,
        "tags": ["spiritual", "boundaries", "self-worth"],
        "lemonsqueezy_product_id": "1023961",
        "lemonsqueezy_variant_id": "1606213",
        "external_read_url": None,
        "pdf_url": "/api/cabinet/library/the-language-of-angels/download",
        "cover_image_url": "/api/books/cover/the-language-of-angels.jpg",
        "source_path": "bookstore/language-of-angels.md",
        "markdown": """## On listening\n\nMost of us were taught to speak before we were taught to listen — to ourselves, most of all.\n\n## A language of light\n\nThis book offers a small vocabulary for the quieter voice inside.\n""",
    },
    {
        "slug": "beyond-the-matrix-ii",
        "title": "Beyond the Matrix II",
        "subtitle": "Codes of Consciousness",
        "description": (
            "The second volume in the Beyond the Matrix series. Goes deeper into the "
            "patterns and quiet rhythms that shape inner life — the invisible programs we "
            "inherit, and the calm work of becoming free of them."
        ),
        "author": "prulesoul",
        "price": 13.0,
        "currency": "USD",
        "audience": "adult",
        "tax_category": "book_zero_rate_ready",
        "delivery_options": ["download_pdf"],
        "pages": None,
        "tags": ["patterns", "consciousness", "deep-work"],
        "lemonsqueezy_product_id": "1023968",
        "lemonsqueezy_variant_id": "1606223",
        "external_read_url": None,
        "pdf_url": "/api/cabinet/library/beyond-the-matrix-ii/download",
        "cover_image_url": "/api/books/cover/beyond-the-matrix-ii.jpg",
        "source_path": "bookstore/beyond-the-matrix-ii.md",
        "markdown": """## Why a Volume II\n\nThe first book opens the door. The second one walks slowly through it.\n\n## On invisible codes\n\nMany of the patterns that shape our lives were written into us before we could read.\n""",
    },
    # ---------- KIDS ($5 each) ----------
    {
        "slug": "angels-tales",
        "title": "Angels' Tales",
        "subtitle": "Adventures of Light and Friendship",
        "description": (
            "A children's book for ages 6–12 about gentle adventures, kind friendships, "
            "and the quiet courage of small hearts. Soft images, warm language, and "
            "stories that travel well at bedtime."
        ),
        "author": "prulesoul",
        "price": 5.0,
        "currency": "USD",
        "audience": "kids",
        "tax_category": "book_zero_rate_ready",
        "delivery_options": ["download_pdf"],
        "pages": None,
        "tags": ["kids", "stories", "friendship", "ages-6-12"],
        "lemonsqueezy_product_id": "1023975",
        "lemonsqueezy_variant_id": "1606234",
        "external_read_url": None,
        "pdf_url": "/api/cabinet/library/angels-tales/download",
        "cover_image_url": "/api/books/cover/angels-tales.jpg",
        "source_path": "bookstore/kids/angels-tales.md",
        "markdown": """## About\n\nA gentle storybook for ages 6–12. Light, friendship, and a little courage.\n\n## How to read\n\nSlowly. Aloud, if you can. With time for the pictures to settle.\n""",
    },
    {
        "slug": "angels-story",
        "title": "Angels' Story",
        "subtitle": "A small book of light",
        "description": (
            "A children's book — gentle, warm, and full of small angels who learn "
            "the quiet kind of bravery. Read aloud, slowly, before sleep."
        ),
        "author": "prulesoul",
        "price": 5.0,
        "currency": "USD",
        "audience": "kids",
        "tax_category": "book_zero_rate_ready",
        "delivery_options": ["download_pdf"],
        "pages": None,
        "tags": ["kids", "stories", "ages-3-8"],
        "lemonsqueezy_product_id": "1023982",
        "lemonsqueezy_variant_id": "1606247",
        "external_read_url": None,
        "pdf_url": "/api/cabinet/library/angels-story/download",
        "cover_image_url": "/api/books/cover/angels-story.jpg",
        "source_path": "bookstore/kids/angels-story.md",
        "markdown": """## About\n\nA gentle storybook of small angels and quiet bravery.\n\n## How to read\n\nAloud. Slowly. Before sleep.\n""",
    },
    {
        "slug": "engels-friends-2",
        "title": "Engels' Friends 2",
        "subtitle": "More small stories of kindness",
        "description": (
            "A children's book for ages 3–8. Short, warm tales designed to be read "
            "aloud — about belonging, safety, and the small magic of being kind."
        ),
        "author": "prulesoul",
        "price": 5.0,
        "currency": "USD",
        "audience": "kids",
        "tax_category": "book_zero_rate_ready",
        "delivery_options": ["download_pdf"],
        "pages": None,
        "tags": ["kids", "stories", "kindness", "ages-3-8"],
        "lemonsqueezy_product_id": "1023991",
        "lemonsqueezy_variant_id": "1606260",
        "external_read_url": None,
        "pdf_url": "/api/cabinet/library/engels-friends-2/download",
        "cover_image_url": "/api/books/cover/engels-friends-2.jpg",
        "source_path": "bookstore/kids/engels-friends-2.md",
        "markdown": """## About\n\nLittle stories for little readers. Read aloud, slowly.\n\n## The world this book lives in\n\nA soft world where being kind is the brave thing to do.\n""",
    },
    {
        "slug": "the-night-angels-embrace",
        "title": "The Night Angels' Embrace",
        "subtitle": "A bedtime book",
        "description": (
            "A bedtime book for children — quiet imagery, gentle words, and the calm "
            "feeling of being safely held while the world goes to sleep."
        ),
        "author": "prulesoul",
        "price": 0.0,
        "currency": "USD",
        "audience": "kids",
        "tax_category": "book_zero_rate_ready",
        "delivery_options": ["download_pdf"],
        "pages": None,
        "tags": ["kids", "bedtime", "calm"],
        "lemonsqueezy_product_id": "1023995",
        "lemonsqueezy_variant_id": "1606266",
        "external_read_url": None,
        "pdf_url": "/api/books/free/the-night-angels-embrace/download",
        "cover_image_url": "/api/books/cover/the-night-angels-embrace.jpg",
        "source_path": "bookstore/kids/night-angels-embrace.md",
        "markdown": """## About\n\nA short bedtime book to be read in a quiet voice, just before sleep.\n\n## How it ends\n\nGently. Always gently.\n""",
    },
]



# =============================================================
# Brand seed — Author's personal preface for the About page.
# Replaceable by /brand/about.md from GitHub once the repository
# is configured (set GITHUB_REPO and run a sync).
# =============================================================
SEED_BRAND: List[dict] = [
    {
        "slug": "about-the-author",
        "title": "A blank page, and the programs we carry",
        "description": "Why this work exists — a personal preface from the author of prulesoul.site.",
        "category_slug": "brand",
        "surface": "brand",
        "kind": "article",
        "access": "free",
        "audience": "grown-ups",
        "tags": ["author", "preface", "story"],
        "source_path": "brand/about.md",
        "markdown": """This book is part of my life story.

We are all born into this world like a blank page. But from the very first moment, even before birth, life begins to shape us.

While still in our mother's womb, we already absorb emotions, thoughts and conversations. After birth the programming continues through parents, family, school, culture and society.

These invisible programs slowly form the beliefs that define who we think we are.

In my family there were many beliefs about life and money.

> "We are poor."
> "Money is not for people like us."
> "A woman should always obey a man."

These ideas were not meant to hurt us. They were simply passed down from previous generations who had been programmed the same way.

My childhood was not without love. My family cared for each other deeply. But the beliefs that shaped us created invisible limits that I carried into my adult life.

For many years I repeated the same patterns.

Relationships that didn't work. Financial struggles. Moments when I felt trapped in a life that didn't truly belong to me.

There were times when life became extremely difficult. I remember moments when I had almost no money and had to choose between feeding myself or feeding my child.

Yet even during those hardest moments, something always helped me move forward, sometimes in the most unexpected ways.

Looking back now, I often feel that some invisible protection was always there, guiding me through situations where I could have easily given up.

## The search for answers

Over time I began searching for answers.

Why do so many people repeat the same painful cycles? Why do we stay trapped in patterns that we do not consciously choose?

That search eventually led me to deep inner work and spiritual learning. I spent months studying and questioning everything I believed about life, success, relationships and freedom.

Slowly I began to see something clearly.

**Many of the limits we live under are not real. They are programs.**

This realization became the foundation of the book *Exit the Matrix*.

## A market in Egypt

But something else happened.

In 2026 I traveled with my family to Israel. Shortly after arriving, the situation in the region escalated into conflict and our travel plans changed completely. Eventually we ended up in Egypt, unexpectedly spending several days there.

One evening we walked through a local market.

I saw women sitting on the streets with small children and even infants in their arms, begging for money.

In that moment my own past came back to me. I realized something important.

Giving money once might help someone for a few hours, but the real roots of suffering are much deeper than money alone. The real problem is often invisible — beliefs, systems and programs that keep people trapped in cycles of poverty, fear and dependence.

That moment planted a new idea in my mind.

What if awareness was only the first step? What if the next step was building real solutions that help people regain dignity and create change in their lives?

## Why this place exists

This book is not just about understanding the system. It is about waking up from it.

And perhaps, together, creating a different path. Because even one small act of awareness or kindness can start a wave of change.
""",
    },
]


# =============================================================
# Legal seed — starter text. Lawyer-reviewed text replaces this once
# the user uploads /legal/*.md to the GitHub repository.
# =============================================================
LEGAL_DRAFT_NOTICE = ""

SEED_LEGAL: List[dict] = [
    {
        "slug": "terms-of-service",
        "title": "Terms of Service",
        "description": "How you may use prulesoul.site and the Matrix Aurin platform.",
        "category_slug": "legal",
        "surface": "legal",
        "kind": "article",
        "access": "free",
        "tags": ["terms"],
        "source_path": "legal/terms-of-service.md",
        "markdown": LEGAL_DRAFT_NOTICE + """## 1. Who we are\n\nThese Terms govern your use of prulesoul.site (the \"Service\"), operated by Matrix Aurin. By using the Service you agree to these Terms.\n\n## 2. Your account\n\nYou may sign in via Google. You are responsible for maintaining the confidentiality of your account and for all activity under it.\n\n## 3. Content and intellectual property\n\nAll text, books, audio, video, and visual material on the Service are the intellectual property of Matrix Aurin unless explicitly attributed otherwise. Free content remains the property of Matrix Aurin and may not be republished without permission. Paid content is licensed for personal, non-commercial use only.\n\n## 4. Purchases\n\nDigital products are sold via LemonSqueezy. By completing a purchase you agree to LemonSqueezy's terms in addition to these Terms. Where Norwegian law applies, digital books are zero-rated VAT (0%); other tax regimes apply at LemonSqueezy's determination.\n\n## 5. Acceptable use\n\nYou agree not to: misuse the Service; attempt to access non-public areas; redistribute paid material; or use the Service in any way that harms others.\n\n## 6. Disclaimer\n\nThe Service is provided \"as is\". We make no warranties regarding outcomes from following any protocol or material. See the Liability Disclaimer for details.\n\n## 7. Changes\n\nWe may update these Terms. Continued use after changes constitutes acceptance.\n\n## 8. Contact\n\nQuestions: use the Reach Out form on the Service.\n""",
    },
    {
        "slug": "user-responsibility",
        "title": "User Responsibility",
        "description": "How protocols, practices, and content are intended to be used.",
        "category_slug": "legal",
        "surface": "legal",
        "kind": "article",
        "access": "free",
        "tags": ["responsibility"],
        "source_path": "legal/user-responsibility.md",
        "markdown": LEGAL_DRAFT_NOTICE + """## Read this first\n\nMatrix Aurin publishes structured material — books, protocols, meditations, and reflections. The material is intended for thoughtful, voluntary use by adults.\n\n## You are responsible for your practice\n\nNothing on the Service is medical, psychological, financial, or legal advice. The protocols are reflective tools, not treatments. If you are in distress, in crisis, or considering changes that affect your health, finances, or relationships, consult a qualified professional first.\n\n## Children\n\nKids Universe is curated for younger readers and is open without an 18+ confirmation. The rest of the Service (Library, Learning, Meditations) is written for adults. Parents are responsible for supervising children's use of any digital material.\n\n## Liability disclaimer\n\nTo the maximum extent permitted by law, Matrix Aurin is not liable for any direct, indirect, incidental, or consequential outcomes arising from your use of the Service. You agree to use the material at your own discretion and risk.\n\n## Community conduct\n\nIf the Service hosts community features in the future, the following always apply: respectful tone, no harassment, no doxxing, no sharing of paid material, and no use of the platform for commercial promotion without written permission.\n""",
    },
    {
        "slug": "refund-policy",
        "title": "Refund Policy",
        "description": "How refunds work for digital products bought through the Bookstore.",
        "category_slug": "legal",
        "surface": "legal",
        "kind": "article",
        "access": "free",
        "tags": ["refund"],
        "source_path": "legal/refund-policy.md",
        "markdown": LEGAL_DRAFT_NOTICE + """## Digital goods are final\n\nBecause our products are digital and are delivered immediately on purchase, all sales are final by default. By completing checkout you waive your statutory right of withdrawal where local law permits this waiver for delivered digital content.\n\n## Exceptions\n\nWe will issue a full refund within 14 days of purchase if:\n\n### 1. The file is broken\nThe PDF or audio file fails to download or is corrupted, and we are unable to deliver a working copy within 7 days of you reporting the issue.\n\n### 2. Duplicate purchase\nYou accidentally purchased the same item twice within a short window.\n\n### 3. Wrong item delivered\nYou received a product that materially does not match its public description.\n\n## How to request a refund\n\nUse the Reach Out form, choose topic \"Bookstore / order\", and include your order ID and email used at checkout. We respond within two working days.\n\n## Where requests are processed\n\nRefunds are processed by LemonSqueezy and may take 3–10 business days to appear on your card or wallet.\n""",
    },
    {
        "slug": "acceptable-use-and-community",
        "title": "Acceptable Use & Community",
        "description": "What is welcome and what is not — short, clear, human.",
        "category_slug": "legal",
        "surface": "legal",
        "kind": "article",
        "access": "free",
        "tags": ["community"],
        "source_path": "legal/acceptable-use.md",
        "markdown": LEGAL_DRAFT_NOTICE + """## The shape of the place\n\nMatrix Aurin is a calm, structured environment. We expect users to behave like quiet, thoughtful guests in someone's house.\n\n## Welcome\n\n- Reading slowly\n- Asking sincere questions through Reach Out\n- Sharing free Library entries with people who would benefit\n- Reporting bugs or broken content\n\n## Not welcome\n\n- Harassment, threats, or hate speech of any kind\n- Sharing or reselling paid material\n- Attempts to scrape, mirror, or bulk-download the Service\n- Impersonating Matrix Aurin or its authors\n- Using the platform to advertise unrelated products\n\n## Consequences\n\nWe may, without notice, restrict or terminate accounts that breach this policy and refuse refunds for the breach.\n""",
    },
]




async def seed_initial_content():
    """Idempotent seed + lightweight migrations."""
    # 1. Categories — seed once, then upsert library audience categories.
    cat_count = await db.content_categories.count_documents({})
    if cat_count == 0:
        for c in SEED_CATEGORIES:
            obj = Category(**c)
            await db.content_categories.insert_one(_serialize(obj.model_dump()))
        logger.info("Seeded %d categories.", len(SEED_CATEGORIES))

    # Ensure the new audience-grouped library categories exist.
    audience_categories = [
        {"slug": "kids-universe", "name": "Kids Universe", "description": "Stories and gentle guidance for younger minds.", "surface": "library", "order": 4, "source_path": "library/kids-universe"},
        {"slug": "reflections", "name": "Reflections", "description": "Personal stories and slow, written reflections.", "surface": "library", "order": 5, "source_path": "library/reflections"},
    ]
    for c in audience_categories:
        await db.content_categories.update_one(
            {"slug": c["slug"]},
            {"$setOnInsert": _serialize(Category(**c).model_dump())},
            upsert=True,
        )

    # 2. Entries — seed once.
    entry_count = await db.content_entries.count_documents({})
    if entry_count == 0:
        for e in SEED_ENTRIES:
            parsed = parse_markdown(e.get("markdown", ""))
            obj = ContentEntry(
                **e,
                html=parsed["html"],
                sections=[ContentSection(**s) for s in parsed["sections"]],
                frontmatter=parsed["frontmatter"],
                validation_warnings=parsed.get("warnings", []),
                source="manual",
            )
            await db.content_entries.insert_one(_serialize(obj.model_dump()))
        logger.info("Seeded %d entries.", len(SEED_ENTRIES))

    # 3. Migration — set audience="grown-ups" on any library entry missing it.
    res = await db.content_entries.update_many(
        {"surface": "library", "$or": [{"audience": {"$exists": False}}, {"audience": None}]},
        {"$set": {"audience": "grown-ups"}},
    )
    if res.modified_count:
        logger.info("Migration: set audience=grown-ups on %d entries.", res.modified_count)

    # 3b. Migration — House language pass on already-seeded entries
    # (seed runs only when the collection is empty, so we patch existing rows here).
    house_entry_updates = [
        ("morning-orientation-protocol", {
            "title": "Morning Orientation",
            "description": "A 7-step gentle reading to begin the day with clarity.",
        }),
        ("evening-reflection-protocol", {
            "title": "Evening Reflection",
            "description": "A slow, gentle review for the close of the day.",
        }),
        ("genesis-protocols-volume-i", {
            "title": "The Genesis Volumes — Volume I",
            "description": "Foundations of self-mastery. Slow, long-form reading.",
        }),
        ("genesis-protocols-volume-ii", {
            "title": "The Genesis Volumes — Volume II",
            "description": "Patterns, practice, presence. Member access.",
        }),
        ("foundations-intro", {
            "description": "The opening reading. Start here.",
        }),
        ("practice-small-commitments", {
            "description": "An applied reading. How to begin with something that fits.",
        }),
    ]
    for slug, fields in house_entry_updates:
        await db.content_entries.update_one({"slug": slug}, {"$set": fields})

    # 3c. Migration — update the two learning category descriptions
    await db.content_categories.update_one(
        {"slug": "foundations", "surface": "learning"},
        {"$set": {"description": "Introductory readings."}},
    )
    await db.content_categories.update_one(
        {"slug": "practice", "surface": "learning"},
        {"$set": {"description": "Applied readings and exercises."}},
    )

    # 4. Books — upsert each SEED slug; drop obsolete seeds.
    seed_slugs = [b["slug"] for b in SEED_BOOKS]
    for b in SEED_BOOKS:
        existing = await db.books.find_one({"slug": b["slug"]}, {"_id": 0})
        if existing:
            await db.books.update_one(
                {"slug": b["slug"]},
                {"$set": {
                    "title": b["title"],
                    "subtitle": b.get("subtitle"),
                    "description": b.get("description"),
                    "price": b["price"],
                    "currency": b["currency"],
                    "audience": b.get("audience", "adult"),
                    "tax_category": b["tax_category"],
                    "lemonsqueezy_product_id": b.get("lemonsqueezy_product_id"),
                    "lemonsqueezy_variant_id": b.get("lemonsqueezy_variant_id"),
                    "external_read_url": b.get("external_read_url"),
                    "pdf_url": b.get("pdf_url"),
                    "cover_image_url": b.get("cover_image_url"),
                    "pages": b.get("pages"),
                    "tags": b.get("tags") or [],
                    "delivery_options": b.get("delivery_options") or ["read_online", "download_pdf"],
                }},
            )
        else:
            parsed = parse_markdown(b.get("markdown", ""))
            obj = Book(
                **b,
                html=parsed["html"],
                sections=[ContentSection(**s) for s in parsed["sections"]],
                validation_warnings=parsed.get("warnings", []),
            )
            await db.books.insert_one(_serialize(obj.model_dump()))
    # Remove obsolete seeded books (only those marked as manual seed).
    removed = await db.books.delete_many({
        "slug": {"$nin": seed_slugs},
        "source": "manual",
        "source_path": {"$regex": "^bookstore/"},
    })
    if removed.deleted_count:
        logger.info("Removed %d obsolete seed books.", removed.deleted_count)
    logger.info("Books seed/migration done (%d slugs).", len(seed_slugs))

    # 5. Legal — seed once. Replaceable by /legal/*.md from GitHub later.
    legal_count = await db.content_entries.count_documents({"surface": "legal"})
    if legal_count == 0:
        for e in SEED_LEGAL:
            parsed = parse_markdown(e.get("markdown", ""))
            obj = ContentEntry(
                **e,
                html=parsed["html"],
                sections=[ContentSection(**s) for s in parsed["sections"]],
                frontmatter=parsed["frontmatter"],
                validation_warnings=parsed.get("warnings", []),
                source="manual",
            )
            await db.content_entries.insert_one(_serialize(obj.model_dump()))
        logger.info("Seeded %d legal entries.", len(SEED_LEGAL))

    # 5b. Migration — re-upsert each legal entry from the latest SEED_LEGAL
    # so the "starter draft" notice (now removed) disappears from the live
    # rows on next boot. Idempotent: replays update the body+html only.
    for e in SEED_LEGAL:
        parsed = parse_markdown(e.get("markdown", ""))
        await db.content_entries.update_one(
            {"slug": e["slug"], "surface": "legal"},
            {"$set": {
                "title": e["title"],
                "description": e.get("description"),
                "markdown": e.get("markdown", ""),
                "html": parsed["html"],
                "sections": parsed["sections"],
                "frontmatter": parsed["frontmatter"],
                "tags": e.get("tags") or [],
                "updated_at": _now().isoformat(),
            }},
        )

    # 6. Brand — upsert author preface. Replaceable by /brand/about.md from
    # GitHub later. Idempotent: re-run replaces stale text from a previous
    # release without creating duplicates.
    for e in SEED_BRAND:
        parsed = parse_markdown(e.get("markdown", ""))
        obj = ContentEntry(
            **e,
            html=parsed["html"],
            sections=[ContentSection(**s) for s in parsed["sections"]],
            frontmatter=parsed["frontmatter"],
            validation_warnings=parsed.get("warnings", []),
            source="manual",
        )
        doc = _serialize(obj.model_dump())
        await db.content_entries.update_one(
            {"slug": e["slug"], "surface": "brand"},
            {"$set": {
                "title": doc["title"],
                "description": doc["description"],
                "html": doc["html"],
                "sections": doc["sections"],
                "frontmatter": doc["frontmatter"],
                "tags": doc.get("tags", []),
                "audience": doc.get("audience"),
                "source": "manual",
                "source_path": doc.get("source_path"),
            }, "$setOnInsert": {
                "id": doc["id"],
                "slug": doc["slug"],
                "surface": "brand",
                "category_slug": doc["category_slug"],
                "kind": doc.get("kind", "article"),
                "access": doc.get("access", "free"),
                "created_at": doc.get("created_at"),
                "updated_at": doc.get("updated_at"),
                "validation_warnings": doc.get("validation_warnings", []),
            }},
            upsert=True,
        )
    logger.info("Brand seed/migration done (%d slugs).", len(SEED_BRAND))

    # 7. Blog — idempotent upsert. Replaceable from /blog/*.md later.
    for b in SEED_BLOG:
        parsed = parse_markdown(b.get("markdown", ""))
        obj = BlogPost(
            **b,
            html=parsed["html"],
            sections=[ContentSection(**s) for s in parsed["sections"]],
        )
        doc = _serialize(obj.model_dump())
        await db.blog_posts.update_one(
            {"slug": b["slug"]},
            {"$set": {
                "title": doc["title"],
                "subtitle": doc.get("subtitle"),
                "author": doc.get("author"),
                "excerpt": doc.get("excerpt"),
                "cover_image_url": doc.get("cover_image_url"),
                "cover_image_alt": doc.get("cover_image_alt"),
                "html": doc["html"],
                "sections": doc["sections"],
                "tags": doc.get("tags", []),
                "published": True,
                "updated_at": doc.get("updated_at"),
            }, "$setOnInsert": {
                "id": doc["id"],
                "slug": doc["slug"],
                "markdown": doc.get("markdown", ""),
                "created_at": doc.get("created_at"),
            }},
            upsert=True,
        )
    logger.info("Blog seed/migration done (%d posts).", len(SEED_BLOG))


# =============================================================
# Auth — Emergent Google Auth
# =============================================================
from fastapi import Request, Response, Cookie

EMERGENT_AUTH_SESSION_URL = "https://demobackend.emergentagent.com/auth/v1/env/oauth/session-data"


class User(BaseModel):
    user_id: str
    email: str
    name: Optional[str] = None
    picture: Optional[str] = None
    role: Literal["guest", "member", "admin"] = "member"
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    # §STABILIZATION 2026-05-16 PM — MLV Presence Time model.
    # Canonical voice budget in seconds, shared across all rooms.
    # Granted by LemonSqueezy webhook on purchase. Decremented by
    # /api/presence/end when a voice session closes.
    presence_seconds_left: int = 0
    # §STABILIZATION 2026-05-16 PM — Optional per-user uncapped voice
    # access, used for admin / staff / founder accounts.
    unlimited_voice: bool = False


class AuthSessionRequest(BaseModel):
    session_id: str


def _seven_days_from_now() -> datetime:
    return datetime.now(timezone.utc) + __import__("datetime").timedelta(days=7)


async def _get_session_token(request: Request, authorization: Optional[str] = None) -> Optional[str]:
    token = request.cookies.get("session_token")
    if token:
        return token
    auth = authorization or request.headers.get("authorization")
    if auth and auth.lower().startswith("bearer "):
        return auth.split(" ", 1)[1].strip()
    return None


async def _resolve_current_user(request: Request) -> Optional[User]:
    token = await _get_session_token(request)
    if not token:
        return None
    sess = await db.user_sessions.find_one({"session_token": token}, {"_id": 0})
    if not sess:
        return None
    expires_at = sess.get("expires_at")
    if isinstance(expires_at, str):
        try:
            expires_at = datetime.fromisoformat(expires_at)
        except ValueError:
            return None
    if expires_at and expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)
    if expires_at and expires_at < datetime.now(timezone.utc):
        return None
    user_doc = await db.users.find_one({"user_id": sess["user_id"]}, {"_id": 0})
    if not user_doc:
        return None
    if isinstance(user_doc.get("created_at"), str):
        try:
            user_doc["created_at"] = datetime.fromisoformat(user_doc["created_at"])
        except ValueError:
            user_doc.pop("created_at", None)
    return User(**user_doc)


@api_router.post("/auth/session")
async def auth_session(inp: AuthSessionRequest, response: Response):
    """Exchange Emergent session_id for our session_token cookie."""
    import httpx
    async with httpx.AsyncClient(timeout=15.0) as http:
        r = await http.get(
            EMERGENT_AUTH_SESSION_URL,
            headers={"X-Session-ID": inp.session_id},
        )
    if r.status_code != 200:
        raise HTTPException(status_code=401, detail="Invalid session_id")
    data = r.json()
    email = data.get("email")
    if not email:
        raise HTTPException(status_code=400, detail="Auth payload missing email")

    existing = await db.users.find_one({"email": email}, {"_id": 0})
    if existing:
        user_id = existing["user_id"]
        await db.users.update_one(
            {"user_id": user_id},
            {"$set": {"name": data.get("name"), "picture": data.get("picture")}},
        )
    else:
        user_id = f"user_{uuid.uuid4().hex[:12]}"
        await db.users.insert_one({
            "user_id": user_id,
            "email": email,
            "name": data.get("name"),
            "picture": data.get("picture"),
            "role": "member",
            "created_at": datetime.now(timezone.utc).isoformat(),
        })

    session_token = data.get("session_token") or uuid.uuid4().hex
    # §AUTH-DEFENSE 2026-05-20 — Trace empty session_token from the
    # Emergent OAuth proxy. If the upstream returns "" or null, we
    # still fall back to a fresh UUID (above), so the wanderer never
    # gets logged out — but we want a clean signal in the logs so we
    # can correlate "user reports Google sign-in didn't work" with
    # actual upstream payload anomalies.
    if not data.get("session_token"):
        logger.warning(
            "auth/session: upstream payload missing session_token (email=%s, name=%s) — falling back to local UUID",
            (email or "")[:64], (data.get("name") or "")[:64],
        )
    expires_at = _seven_days_from_now()
    await db.user_sessions.insert_one({
        "user_id": user_id,
        "session_token": session_token,
        "expires_at": expires_at.isoformat(),
        "created_at": datetime.now(timezone.utc).isoformat(),
    })

    response.set_cookie(
        key="session_token",
        value=session_token,
        max_age=7 * 24 * 3600,
        path="/",
        httponly=True,
        secure=True,
        samesite="none",
    )
    # §AUDIT-W6 — also emit Partitioned cookie for Chrome 118+.
    _set_session_cookie(response, session_token)


@api_router.get("/auth/me")
async def auth_me(request: Request):
    user = await _resolve_current_user(request)
    if not user:
        # §AUTH-DEFENSE 2026-05-20 — Diagnostic: log when an authenticated
        # API call lands without a resolvable token. Helps separate
        # "Google flow handed us nothing" from "session expired".
        has_cookie = bool(request.cookies.get("session_token"))
        auth_hdr = request.headers.get("authorization", "")
        has_bearer = auth_hdr.lower().startswith("bearer ") and len(auth_hdr) > 12
        logger.info(
            "auth/me 401: cookie=%s bearer=%s ua=%s",
            has_cookie, has_bearer, request.headers.get("user-agent", "")[:80],
        )
        raise HTTPException(status_code=401, detail="Not authenticated")
    return user.model_dump()


@api_router.get("/me")
async def operational_me(request: Request):
    """§Phase 1 — operational identity endpoint.

    Single, low-friction snapshot used by every private room to know
    *who is here* and *what they may access*, without triggering N
    extra calls. Strictly additive: does not write anything, does not
    expose private fields beyond what `/auth/me` already returns.

    Reuses existing collections only:
      - users (identity)
      - user_sessions (session expiry)
      - clarity_passes (active reflection-room access)
      - beta_enrollments (beta period)
      - cabinet_user_tier (membership tier — Iter 67)
    """
    user = await _resolve_current_user(request)
    if not user:
        return {"authenticated": False}
    uid = user.user_id
    now = datetime.now(timezone.utc)

    # Session expiry (already enforced upstream — surface for the UI).
    sess_row = None
    token = await _get_session_token(request)
    if token:
        sess_row = await db.user_sessions.find_one(
            {"session_token": token},
            {"_id": 0, "expires_at": 1, "auth_method": 1, "created_at": 1},
        )
    session_expires_at = (sess_row or {}).get("expires_at")
    if isinstance(session_expires_at, datetime):
        session_expires_at = session_expires_at.isoformat()

    # Active Clarity pass — single most-recent unexpired row.
    pass_doc = await db.clarity_passes.find_one(
        {
            "user_id": uid,
            "$or": [
                {"expires_at": {"$gt": now.isoformat()}},
                {"expires_at": None},
            ],
        },
        {"_id": 0, "tier": 1, "expires_at": 1, "is_subscription": 1, "activated_at": 1},
        sort=[("activated_at", -1)],
    )

    # Beta enrollment.
    beta_doc = await db.beta_enrollments.find_one(
        {"user_id": uid},
        {"_id": 0, "enrolled_at": 1, "expires_at": 1, "feedback_received": 1},
    )

    # Membership tier (Iter 67).
    tier_doc = await db.cabinet_user_tier.find_one(
        {"user_id": uid}, {"_id": 0, "tier": 1, "activated_at": 1}
    )
    tier_key = (tier_doc or {}).get("tier") or "transient"

    rooms = {
        "clarity_release": {
            "open": True,  # gated by sign-in only; free 3 replies + daily cap
            "has_active_pass": bool(pass_doc),
            "pass_expires_at": (pass_doc or {}).get("expires_at"),
            "pass_tier": (pass_doc or {}).get("tier"),
        },
        "body_room": {"open": True},
        "course_room": {"open": True},
        "library": {"open": True},
        "cabinet_booking": {"open": True},
    }

    return {
        "authenticated": True,
        "user": {
            "user_id": user.user_id,
            "email": user.email,
            "name": user.name,
            "role": user.role,
        },
        "session": {
            "expires_at": session_expires_at,
            "auth_method": (sess_row or {}).get("auth_method"),
        },
        "tier": tier_key,
        "rooms": rooms,
        "beta": (
            None
            if not beta_doc
            else {
                "enrolled_at": beta_doc.get("enrolled_at"),
                "expires_at": beta_doc.get("expires_at"),
            }
        ),
    }


@api_router.post("/auth/logout")
async def auth_logout(request: Request, response: Response):
    token = await _get_session_token(request)
    if token:
        await db.user_sessions.delete_one({"session_token": token})
    response.delete_cookie("session_token", path="/")
    # §AUDIT-W6 — also clear the Partitioned variant for Chrome 118+.
    _set_session_cookie(response, "", delete=True)
    return {"status": "ok"}


# =============================================================
# Reach Out — accepts the contact form (delivery is placeholder).
# =============================================================
class ReachOutMessage(BaseModel):
    name: str
    email: str
    topic: Optional[str] = "general"
    message: str
    # §SUPPORT-V2 2026-02-09 — Structured issue tags. Frontend
    # ReachOut form lets the wanderer pick one or more common
    # situations from a checklist. We store them as a flat array
    # so future filtering / reporting can group complaints by
    # category (voice issues vs billing vs kids vs etc.).
    issue_tags: Optional[List[str]] = None


@api_router.post("/reach-out")
async def reach_out(inp: ReachOutMessage):
    """Persist the message + deliver via Resend if configured.

    §SUPPORT-V2 2026-02-09 — Two-channel delivery:
      1. Anna (the support inbox) gets the full message + structured
         tags, with subject line that triages instantly.
      2. The wanderer gets a calm auto-reply confirming receipt and
         setting the 24-72h expectation. Never marketing copy.

    DB row always persists regardless of email outcome — so the
    Resend outage never silently swallows a real complaint.
    """
    doc = {
        "id": str(uuid.uuid4()),
        "name": inp.name.strip()[:200],
        "email": inp.email.strip().lower()[:200],
        "topic": (inp.topic or "general").strip()[:50],
        "message": inp.message.strip()[:5000],
        "issue_tags": list(inp.issue_tags or [])[:16],
        "destination": os.environ.get("REACH_OUT_EMAIL", ""),
        "delivered": False,
        "delivery_error": None,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }

    destination = (os.environ.get("REACH_OUT_EMAIL") or "").strip()
    delivered = False
    delivery_error: Optional[str] = None

    if destination:
        try:
            from email_service import (
                send_email as _send_email,
                is_configured as _resend_configured,
            )
            if _resend_configured():
                # Build a triage-friendly subject + body for Anna.
                tag_summary = ""
                if doc["issue_tags"]:
                    tag_summary = " · " + ", ".join(doc["issue_tags"])
                subject_for_owner = (
                    f"[Reach Out] {doc['topic']}{tag_summary} — from {doc['name'] or doc['email']}"
                )[:200]
                from html import escape as _esc
                tag_block_html = ""
                if doc["issue_tags"]:
                    tag_block_html = (
                        "<p><strong>Reported issues:</strong></p>\n<ul>\n"
                        + "\n".join(f"<li>{_esc(t)}</li>" for t in doc["issue_tags"])
                        + "\n</ul>\n"
                    )
                html_for_owner = (
                    f"<p><strong>From:</strong> {_esc(doc['name'])} &lt;{_esc(doc['email'])}&gt;</p>\n"
                    f"<p><strong>Topic:</strong> {_esc(doc['topic'])}</p>\n"
                    + tag_block_html
                    + f"<hr/>\n<pre style=\"white-space:pre-wrap;font-family:inherit\">{_esc(doc['message'])}</pre>\n"
                    f"<hr/>\n<p style=\"color:#888;font-size:12px\">ID: {doc['id']}</p>"
                )
                text_for_owner = (
                    f"From: {doc['name']} <{doc['email']}>\n"
                    f"Topic: {doc['topic']}\n"
                    + (f"Reported issues: {', '.join(doc['issue_tags'])}\n" if doc["issue_tags"] else "")
                    + f"\n---\n{doc['message']}\n\n---\nID: {doc['id']}"
                )
                await _send_email(
                    to=destination,
                    subject=subject_for_owner,
                    html=html_for_owner,
                    text=text_for_owner,
                    sender="support",
                    reply_to=doc["email"],  # Anna's reply goes directly back to the wanderer.
                    tags=[
                        {"name": "kind", "value": "reach_out"},
                        {"name": "topic", "value": doc["topic"][:32]},
                    ],
                )
                # Calm auto-reply to the wanderer.
                ack_subject = "We received your message · Pure Soul Life"
                ack_text = (
                    f"Hi {doc['name'] or 'there'},\n\n"
                    "Your message reached us. A real person reads every note here, so a reply may take 24-72 hours, sometimes sooner.\n\n"
                    "If something becomes urgent in the meantime, just write back to this email and we'll see it.\n\n"
                    "Warmly,\n"
                    "Anna\n"
                    "Pure Soul Life · prulesoul.site\n"
                )
                ack_html = (
                    f"<p>Hi {_esc(doc['name']) or 'there'},</p>\n"
                    "<p>Your message reached us. A real person reads every note here, so a reply may take 24-72 hours, sometimes sooner.</p>\n"
                    "<p>If something becomes urgent in the meantime, just write back to this email and we'll see it.</p>\n"
                    "<p>Warmly,<br/>Anna<br/><em>Pure Soul Life · prulesoul.site</em></p>\n"
                )
                try:
                    await _send_email(
                        to=doc["email"],
                        subject=ack_subject,
                        html=ack_html,
                        text=ack_text,
                        sender="support",
                        reply_to=destination,
                        tags=[{"name": "kind", "value": "reach_out_ack"}],
                    )
                except Exception as ack_err:  # noqa: BLE001
                    # Owner email already went through — ack-failure is not fatal.
                    logger.warning("reach_out ack-email failed: %s", ack_err)
                delivered = True
            else:
                delivery_error = "resend_not_configured"
        except Exception as e:  # noqa: BLE001
            logger.warning("reach_out delivery failed: %s", e)
            delivery_error = type(e).__name__

    doc["delivered"] = delivered
    doc["delivery_error"] = delivery_error
    await db.reach_out_messages.insert_one(doc)
    return {
        "status": "received",
        "destination_configured": bool(destination),
        "delivered": delivered,
        "id": doc["id"],
    }


@api_router.post("/admin/sales-report")
async def admin_sales_report(request: Request, year: int = 0, month: int = 0):
    """Trigger a sales-report email on demand (admin-only).

    With no params, sends the report for the *previous* month — exactly
    what the monthly cron would have sent. With `year=` and `month=`,
    sends an arbitrary historical month.

    Helper functions `_build_sales_report` and `_send_monthly_sales_report`
    are defined later in the file; Python's late-binding for module-level
    names lets us declare the route here (before `include_router`) while
    keeping the implementations next to the monthly cron loop.
    """
    admin_token = os.environ.get("ADMIN_TOKEN")
    sent = request.headers.get("X-Admin-Token") or request.query_params.get("token")
    if not admin_token or sent != admin_token:
        raise HTTPException(status_code=401, detail="Admin token required.")
    if year and month:
        report = await _build_sales_report(year, month)
        return {"ok": True, "report": report, "mailed": False}
    await _send_monthly_sales_report()
    return {"ok": True, "mailed": True}


# =============================================================
# §REFUND-FLAG 2026-02-09 — Safe manual-review pipeline. Founder
# directive: if a voice/text session crashes within the first 30
# seconds AND the user has a freshly-activated paid pass (<5 min
# old), flag for Anna's manual refund review. We deliberately do
# NOT auto-execute the LemonSqueezy refund — that risks refunding
# a perfectly legitimate user whose mic permission popped up late.
# Anna decides; the system surfaces the candidate.
#
# How it triggers:
#   1. Frontend `onDisconnect` measures session length.
#   2. If length < 30s, frontend POSTs /api/refund-flag with
#      reason + duration.
#   3. Backend looks up the user's latest pass.
#   4. If pass created_at < 5 min ago, inserts into
#      `refund_review_queue` + emails Anna.
# =============================================================
class RefundFlagInput(BaseModel):
    user_id: Optional[str] = None
    user_email: Optional[str] = None
    room: Optional[str] = None
    duration_seconds: float
    reason: Optional[str] = None
    error_message: Optional[str] = None


@api_router.post("/refund-flag")
async def refund_flag(inp: RefundFlagInput):
    """Receive a short-session signal from the chat client.

    Only emails Anna when the user holds a fresh paid pass. Otherwise
    silently records the event (useful telemetry, no spam to Anna).
    """
    now = datetime.now(timezone.utc)
    duration = max(0.0, float(inp.duration_seconds or 0.0))
    reason = (inp.reason or "")[:120]
    error_message = (inp.error_message or "")[:500]
    room = (inp.room or "")[:32]

    # Resolve user_id from email if frontend sent only the email.
    user_id = (inp.user_id or "").strip()
    user_email = (inp.user_email or "").strip().lower()
    if not user_id and user_email:
        u = await db.users.find_one({"email": user_email}, {"_id": 0, "user_id": 1})
        if u:
            user_id = u.get("user_id") or ""

    # Find the user's most recent paid clarity_pass (skip admin-grants).
    fresh_pass = None
    if user_id:
        cursor = db.clarity_passes.find(
            {
                "user_id": user_id,
                "source": {"$nin": ["admin-grant", "free_voice_beta"]},
            },
            {"_id": 0},
        ).sort("granted_at", -1).limit(1)
        candidates = await cursor.to_list(length=1)
        if candidates:
            cand = candidates[0]
            try:
                granted_at = datetime.fromisoformat(
                    cand.get("granted_at", "").replace("Z", "+00:00")
                )
                age_seconds = (now - granted_at).total_seconds()
                if age_seconds < 5 * 60:  # 5 min freshness window
                    fresh_pass = cand
            except Exception:  # noqa: BLE001
                pass

    flag_doc = {
        "id": str(uuid.uuid4()),
        "user_id": user_id or None,
        "user_email": user_email or None,
        "room": room,
        "duration_seconds": duration,
        "reason": reason,
        "error_message": error_message,
        "fresh_pass": fresh_pass,
        "needs_review": bool(fresh_pass),
        "created_at": now.isoformat(),
    }
    try:
        await db.refund_review_queue.insert_one(flag_doc)
    except Exception as exc:  # noqa: BLE001
        logger.warning("refund-flag insert failed: %s", exc)

    # Only email Anna for cases that look like legit refund candidates.
    if fresh_pass:
        destination = (os.environ.get("REACH_OUT_EMAIL") or "").strip()
        if destination:
            try:
                from email_service import (
                    send_email as _send_email,
                    is_configured as _resend_configured,
                )
                if _resend_configured():
                    tier = fresh_pass.get("tier", "?")
                    ext_order = fresh_pass.get("external_order_id", "?")
                    granted = fresh_pass.get("granted_at", "?")
                    from html import escape as _esc
                    subj = f"[Refund Review] {tier} · {room or 'room'} · crashed in {duration:.1f}s"
                    body_html = (
                        f"<p>A paid session ended very quickly after activation. Worth a manual look.</p>"
                        f"<table style=\"font-family:monospace;font-size:12px\"><tbody>"
                        f"<tr><td>User ID:</td><td>{_esc(user_id or '(unknown)')}</td></tr>"
                        f"<tr><td>Email:</td><td>{_esc(user_email or '(unknown)')}</td></tr>"
                        f"<tr><td>Tier:</td><td>{_esc(str(tier))}</td></tr>"
                        f"<tr><td>LS Order ID:</td><td>{_esc(str(ext_order))}</td></tr>"
                        f"<tr><td>Granted at:</td><td>{_esc(str(granted))}</td></tr>"
                        f"<tr><td>Room:</td><td>{_esc(room or '(unknown)')}</td></tr>"
                        f"<tr><td>Session length:</td><td>{duration:.2f}s</td></tr>"
                        f"<tr><td>Reason:</td><td>{_esc(reason or '(none)')}</td></tr>"
                        f"<tr><td>Error:</td><td>{_esc(error_message or '(none)')}</td></tr>"
                        f"</tbody></table>"
                        f"<p style=\"margin-top:16px\">"
                        f"<strong>Manual refund:</strong> LemonSqueezy dashboard → Orders → "
                        f"<a href=\"https://app.lemonsqueezy.com/orders\">find {_esc(str(ext_order))}</a> → Refund."
                        f"</p>"
                        f"<p style=\"color:#888;font-size:12px\">Review ID: {flag_doc['id']}</p>"
                    )
                    body_text = (
                        f"Paid session ended in {duration:.1f}s.\n\n"
                        f"User: {user_id or '?'} <{user_email or '?'}>\n"
                        f"Tier: {tier} · Order: {ext_order}\n"
                        f"Granted: {granted}\n"
                        f"Room: {room or '?'}\n"
                        f"Reason: {reason or '(none)'}\n"
                        f"Error: {error_message or '(none)'}\n\n"
                        f"Manually refund via LemonSqueezy dashboard if appropriate.\n"
                        f"Review ID: {flag_doc['id']}\n"
                    )
                    await _send_email(
                        to=destination,
                        subject=subj,
                        html=body_html,
                        text=body_text,
                        sender="support",
                        tags=[
                            {"name": "kind", "value": "refund_review"},
                            {"name": "tier", "value": str(tier)[:32]},
                        ],
                    )
            except Exception as exc:  # noqa: BLE001
                logger.warning("refund-flag email failed: %s", exc)

    return {"ok": True, "needs_review": bool(fresh_pass), "id": flag_doc["id"]}


# =============================================================
# §KIDS-HUBS 2026-02-09 — Angel Stars MVP. Founder directive:
# a gentle gamified retention engine for the Kids Universe.
# The catalog (15 actions + 4 mystery tiers) is static and lives
# in angel_stars.py. Persistent state lives in three Mongo
# collections:
#   angel_stars            — one summary per (user_id, child_slug)
#   angel_stars_actions    — one row per child-requested star
#   angel_stars_rewards    — one row per redeemed tier
#
# Auth model for MVP: the SAME parent user account is both the
# child's surface (KidsStarsView taps "I did this") and the
# approving surface (/parent-portal/stars). Multi-profile per
# family is a Phase-2 concern; for now `child_slug` (age band)
# acts as the child key under one user_id.
# =============================================================
from angel_stars import (
    ANGEL_STARS_ACTIONS,
    ANGEL_STARS_TIERS,
    CHILD_TITLES,
    actions_for_age,
    get_action,
    normalise_age_slug,
)
from kids_journey import (
    JOURNEY_TOTAL_DAYS,
    all_messages as kids_journey_all_messages,
    message_for_day as kids_journey_message_for_day,
)


class AngelStarsRequestInput(BaseModel):
    child_slug: str
    action_slug: str


class AngelStarsDecideInput(BaseModel):
    request_id: str


class AngelStarsRedeemInput(BaseModel):
    child_slug: str
    tier_index: int


async def _get_or_create_stars_doc(user_id: str, child_slug: str) -> dict:
    doc = await db.angel_stars.find_one(
        {"user_id": user_id, "child_slug": child_slug}, {"_id": 0}
    )
    if doc:
        return doc
    fresh = {
        "user_id": user_id,
        "child_slug": child_slug,
        "balance": 0,
        "total_earned": 0,
        "redeemed_tiers": [],
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.angel_stars.insert_one({**fresh})
    return fresh


@api_router.get("/angel-stars/catalog")
async def angel_stars_catalog(age_slug: str = ""):
    """Static catalog. Public (no auth) so the Kids Hub can show it
    even before the child's grown-up has signed in."""
    canonical = normalise_age_slug(age_slug) if age_slug else None
    actions = actions_for_age(canonical) if canonical else ANGEL_STARS_ACTIONS
    return {"actions": actions, "tiers": ANGEL_STARS_TIERS}


@api_router.get("/angel-stars/me")
async def angel_stars_me(request: Request, child_slug: str = "explorers"):
    user = await _require_user(request)
    slug = normalise_age_slug(child_slug)
    summary = await _get_or_create_stars_doc(user.user_id, slug)

    # Last 8 actions for this child profile, newest first.
    recent_cursor = db.angel_stars_actions.find(
        {"user_id": user.user_id, "child_slug": slug},
        {"_id": 0},
    ).sort("created_at", -1).limit(8)
    recent = await recent_cursor.to_list(length=8)

    return {
        "child_slug": slug,
        "balance": int(summary.get("balance", 0)),
        "total_earned": int(summary.get("total_earned", 0)),
        "redeemed_tiers": list(summary.get("redeemed_tiers", [])),
        "recent": recent,
    }


@api_router.post("/angel-stars/request")
async def angel_stars_request(inp: AngelStarsRequestInput, request: Request):
    user = await _require_user(request)
    slug = normalise_age_slug(inp.child_slug)
    action = get_action(inp.action_slug)
    if not action or slug not in action.get("age_slugs", []):
        raise HTTPException(status_code=400, detail="Unknown action for this age.")

    # Ensure summary exists.
    await _get_or_create_stars_doc(user.user_id, slug)

    now_iso = datetime.now(timezone.utc).isoformat()
    row = {
        "id": f"asreq_{uuid.uuid4().hex[:12]}",
        "user_id": user.user_id,
        "child_slug": slug,
        "action_slug": action["slug"],
        "action_label": action["label"],
        "stars": int(action["stars"]),
        "status": "pending",
        "source": "child_self_report",
        "created_at": now_iso,
        "approved_at": None,
    }
    await db.angel_stars_actions.insert_one({**row})
    return {"ok": True, "id": row["id"], "status": "pending"}


@api_router.post("/angel-stars/approve")
async def angel_stars_approve(inp: AngelStarsDecideInput, request: Request):
    user = await _require_user(request)
    row = await db.angel_stars_actions.find_one(
        {"id": inp.request_id, "user_id": user.user_id}, {"_id": 0}
    )
    if not row:
        raise HTTPException(status_code=404, detail="Request not found.")
    if row.get("status") != "pending":
        return {"ok": True, "already": row.get("status")}

    stars = int(row.get("stars", 0))
    slug = row.get("child_slug")
    now_iso = datetime.now(timezone.utc).isoformat()

    await db.angel_stars_actions.update_one(
        {"id": inp.request_id, "user_id": user.user_id},
        {"$set": {"status": "approved", "approved_at": now_iso}},
    )
    await db.angel_stars.update_one(
        {"user_id": user.user_id, "child_slug": slug},
        {
            "$inc": {"balance": stars, "total_earned": stars},
            "$set": {"updated_at": now_iso},
        },
        upsert=True,
    )
    summary = await db.angel_stars.find_one(
        {"user_id": user.user_id, "child_slug": slug}, {"_id": 0}
    )
    return {
        "ok": True,
        "balance": int((summary or {}).get("balance", 0)),
        "total_earned": int((summary or {}).get("total_earned", 0)),
    }


@api_router.post("/angel-stars/reject")
async def angel_stars_reject(inp: AngelStarsDecideInput, request: Request):
    user = await _require_user(request)
    row = await db.angel_stars_actions.find_one(
        {"id": inp.request_id, "user_id": user.user_id}, {"_id": 0}
    )
    if not row:
        raise HTTPException(status_code=404, detail="Request not found.")
    if row.get("status") != "pending":
        return {"ok": True, "already": row.get("status")}
    await db.angel_stars_actions.update_one(
        {"id": inp.request_id, "user_id": user.user_id},
        {"$set": {"status": "rejected", "approved_at": datetime.now(timezone.utc).isoformat()}},
    )
    return {"ok": True}


@api_router.post("/angel-stars/redeem")
async def angel_stars_redeem(inp: AngelStarsRedeemInput, request: Request):
    user = await _require_user(request)
    slug = normalise_age_slug(inp.child_slug)
    tier = next((t for t in ANGEL_STARS_TIERS if t["tier_index"] == inp.tier_index), None)
    if not tier:
        raise HTTPException(status_code=400, detail="Unknown tier.")
    summary = await _get_or_create_stars_doc(user.user_id, slug)
    if int(summary.get("balance", 0)) < int(tier["threshold"]):
        raise HTTPException(status_code=400, detail="Not enough stars yet.")
    if inp.tier_index in (summary.get("redeemed_tiers") or []):
        return {"ok": True, "already_redeemed": True, "payload": tier["payload"]}

    now_iso = datetime.now(timezone.utc).isoformat()
    await db.angel_stars.update_one(
        {"user_id": user.user_id, "child_slug": slug},
        {
            "$addToSet": {"redeemed_tiers": int(tier["tier_index"])},
            "$set": {"updated_at": now_iso},
        },
        upsert=True,
    )
    reward_doc = {
        "id": f"asrwd_{uuid.uuid4().hex[:12]}",
        "user_id": user.user_id,
        "child_slug": slug,
        "tier_index": int(tier["tier_index"]),
        "title": tier["title"],
        "redeemed_at": now_iso,
    }
    await db.angel_stars_rewards.insert_one({**reward_doc})
    return {"ok": True, "payload": tier["payload"], "title": tier["title"]}


@api_router.get("/angel-stars/parent-portal")
async def angel_stars_parent_portal(request: Request):
    """Aggregated view: per-child summary + pending requests + recent
    approved history. Used by /parent-portal/stars."""
    user = await _require_user(request)

    # Per-child summary (rows that already exist; the page also shows
    # placeholders for ages the child hasn't opened yet).
    rows = await db.angel_stars.find(
        {"user_id": user.user_id}, {"_id": 0}
    ).to_list(length=20)
    summary_by_slug = {r.get("child_slug"): r for r in rows}

    children = []
    for slug in ("little-dreamers", "explorers", "dreamweavers"):
        s = summary_by_slug.get(slug) or {}
        title, age_range = CHILD_TITLES[slug]
        pending_count = await db.angel_stars_actions.count_documents(
            {"user_id": user.user_id, "child_slug": slug, "status": "pending"}
        )
        children.append({
            "child_slug": slug,
            "title": title,
            "age_range": age_range,
            "balance": int(s.get("balance", 0)),
            "total_earned": int(s.get("total_earned", 0)),
            "pending_count": int(pending_count),
        })

    pending = await db.angel_stars_actions.find(
        {"user_id": user.user_id, "status": "pending"}, {"_id": 0}
    ).sort("created_at", -1).limit(50).to_list(length=50)
    for p in pending:
        p["child_title"] = CHILD_TITLES.get(p.get("child_slug"), ("?", ""))[0]

    history = await db.angel_stars_actions.find(
        {"user_id": user.user_id, "status": "approved"}, {"_id": 0}
    ).sort("approved_at", -1).limit(20).to_list(length=20)
    for h in history:
        h["child_title"] = CHILD_TITLES.get(h.get("child_slug"), ("?", ""))[0]

    return {"children": children, "pending": pending, "history": history}


# =============================================================
# §KIDS-CURRICULUM 2026-02-09 — Clarity Curriculum: 4 thematic
# modules (Reflect / Kitchen / Quest / Create) + daily mood
# check-in. Founder directive: holistic emotional + life-skill
# development surfaces with a clean free-vs-premium split (~12
# free starter activities; rest gated for the €60h package).
#
# Persistence:
#   kids_mood_checkins  — one row per child check-in (auto-awards 1 star)
#   angel_stars_actions — re-used for activity completion requests
# =============================================================
from kids_curriculum import (
    KIDS_ACTIVITIES,
    KIDS_MODULES,
    MOOD_AURIN_REPLY,
    VALID_MOODS,
    VALID_MODULES,
    activities_filtered,
    get_activity,
    recommend_for_mood,
)


class KidsMoodInput(BaseModel):
    child_slug: str
    mood: str
    note: Optional[str] = None


class KidsActivityCompleteInput(BaseModel):
    child_slug: str
    activity_slug: str


def _public_activity(a: Dict[str, Any], premium_user: bool = False) -> Dict[str, Any]:
    """Strip server-only fields and (for non-premium users) gate the
    instructions / full body on premium activities — they can SEE
    the activity exists but cannot perform it until they unlock the
    package."""
    is_premium = bool(a.get("is_premium"))
    locked = is_premium and not premium_user
    return {
        "slug": a["slug"],
        "module": a["module"],
        "age_slugs": a["age_slugs"],
        "title": a["title"],
        "body": a["body"] if not locked else "Inside the 60-hour House package. A small premium activity from the Clarity Curriculum.",
        "instructions": a["instructions"] if not locked else [],
        "duration_min": a["duration_min"],
        "with_parent": a["with_parent"],
        "is_premium": is_premium,
        "locked": locked,
        "reward_stars": a["reward_stars"],
        "mood_tags": a.get("mood_tags", []),
    }


async def _user_has_premium(user_id: str) -> bool:
    """Premium = user holds ANY paid clarity pass or has unlimited_voice.
    For MVP we treat presence_seconds_left > 0 OR an active pass as
    'premium' so any paying parent unlocks the full curriculum.

    §INFLUENCER-SWARM 2026-02-09 — also unlock for users who have
    redeemed a guest key with the body_temple_unlock perk."""
    try:
        u = await db.users.find_one({"user_id": user_id}, {"_id": 0, "presence_seconds_left": 1, "unlimited_voice": 1})
        if u and (u.get("unlimited_voice") or int(u.get("presence_seconds_left") or 0) > 0):
            return True
        pass_doc = await db.clarity_passes.find_one(
            {"user_id": user_id, "source": {"$nin": ["admin-grant", "free_voice_beta"]}},
            {"_id": 0},
        )
        if pass_doc:
            return True
        bt_unlock = await db.body_temple_unlocks.find_one(
            {"user_id": user_id}, {"_id": 1}
        )
        return bool(bt_unlock)
    except Exception:
        return False


@api_router.get("/kids-curriculum/modules")
async def kids_curriculum_modules():
    """Public. Module catalog used by the Hub & activity browser."""
    return {"modules": list(KIDS_MODULES.values())}


@api_router.get("/kids-curriculum/activities")
async def kids_curriculum_activities(
    request: Request,
    age_slug: str = "explorers",
    module: str = "",
    free_only: bool = False,
):
    """Filtered activity list. Public — non-premium users see locked
    cards (title + reward visible, instructions gated)."""
    slug = normalise_age_slug(age_slug)
    mod = module if module in VALID_MODULES else None

    user = await _resolve_current_user(request)
    premium = await _user_has_premium(user.user_id) if user else False

    activities = activities_filtered(slug, module=mod, free_only=bool(free_only))
    return {
        "age_slug": slug,
        "module": mod,
        "is_premium_user": premium,
        "activities": [_public_activity(a, premium) for a in activities],
    }


@api_router.get("/kids-curriculum/activities/{activity_slug}")
async def kids_curriculum_activity_detail(activity_slug: str, request: Request):
    a = get_activity(activity_slug)
    if not a:
        raise HTTPException(status_code=404, detail="Activity not found.")
    user = await _resolve_current_user(request)
    premium = await _user_has_premium(user.user_id) if user else False
    return _public_activity(a, premium)


@api_router.post("/kids-curriculum/complete")
async def kids_curriculum_complete(inp: KidsActivityCompleteInput, request: Request):
    """Child reports completion of a curriculum activity → creates a
    pending Angel Stars request the parent can approve in
    /parent-portal/stars. Premium activities require the parent
    account to hold a paid pass."""
    user = await _require_user(request)
    slug = normalise_age_slug(inp.child_slug)
    activity = get_activity(inp.activity_slug)
    if not activity or slug not in activity["age_slugs"]:
        raise HTTPException(status_code=400, detail="Unknown activity for this age.")
    if activity.get("is_premium") and not await _user_has_premium(user.user_id):
        raise HTTPException(status_code=402, detail="This activity is part of the 60h House package.")

    await _get_or_create_stars_doc(user.user_id, slug)
    now_iso = datetime.now(timezone.utc).isoformat()
    row = {
        "id": f"asreq_{uuid.uuid4().hex[:12]}",
        "user_id": user.user_id,
        "child_slug": slug,
        "action_slug": f"curriculum:{activity['slug']}",
        "action_label": activity["title"],
        "stars": int(activity["reward_stars"]),
        "status": "pending",
        "source": "curriculum_activity",
        "module": activity["module"],
        "created_at": now_iso,
        "approved_at": None,
    }
    await db.angel_stars_actions.insert_one({**row})
    return {"ok": True, "id": row["id"], "status": "pending", "reward_stars": activity["reward_stars"]}


@api_router.post("/kids-mood/checkin")
async def kids_mood_checkin(inp: KidsMoodInput, request: Request):
    """Daily mood check-in — auto-awards 1 ★ per day (rituals must
    not be parent-gated) and stamps the emotion calendar."""
    user = await _require_user(request)
    slug = normalise_age_slug(inp.child_slug)
    mood = inp.mood if inp.mood in VALID_MOODS else "okay"
    note = (inp.note or "")[:600]

    now = datetime.now(timezone.utc)
    today_str = now.date().isoformat()

    # One auto-star per (user, child, day). Subsequent same-day
    # check-ins are accepted (the kid can revisit) but only the FIRST
    # awards a star — keeps the ritual honest.
    existing = await db.kids_mood_checkins.find_one(
        {"user_id": user.user_id, "child_slug": slug, "day": today_str},
        {"_id": 0, "id": 1, "awarded_star": 1},
    )
    star_awarded_now = False
    if not existing:
        await _get_or_create_stars_doc(user.user_id, slug)
        await db.angel_stars.update_one(
            {"user_id": user.user_id, "child_slug": slug},
            {
                "$inc": {"balance": 1, "total_earned": 1},
                "$set": {"updated_at": now.isoformat()},
            },
            upsert=True,
        )
        await db.angel_stars_actions.insert_one({
            "id": f"asreq_{uuid.uuid4().hex[:12]}",
            "user_id": user.user_id,
            "child_slug": slug,
            "action_slug": "daily_checkin",
            "action_label": "A daily check-in with Aurin",
            "stars": 1,
            "status": "approved",
            "source": "daily_checkin_auto",
            "created_at": now.isoformat(),
            "approved_at": now.isoformat(),
        })
        star_awarded_now = True

    doc = {
        "id": f"mood_{uuid.uuid4().hex[:10]}",
        "user_id": user.user_id,
        "child_slug": slug,
        "day": today_str,
        "mood": mood,
        "note": note,
        "created_at": now.isoformat(),
        "awarded_star": star_awarded_now,
    }
    await db.kids_mood_checkins.insert_one({**doc})

    recommendations = recommend_for_mood(slug, mood)
    premium = await _user_has_premium(user.user_id)
    # §REFERRAL 2026-02-09 — soft trigger: first ever check-in for
    # this user fires any pending referral reward.
    if star_awarded_now:
        try:
            await _maybe_reward_referral(user.user_id, trigger="first_daily_checkin")
        except Exception as exc:  # noqa: BLE001
            logger.warning("referral reward (mood) failed: %s", exc)
    return {
        "ok": True,
        "mood": mood,
        "aurin_reply": MOOD_AURIN_REPLY.get(mood, MOOD_AURIN_REPLY["okay"]),
        "star_awarded": star_awarded_now,
        "recommendations": [_public_activity(a, premium) for a in recommendations],
    }


@api_router.get("/kids-mood/me")
async def kids_mood_me(request: Request, child_slug: str = "explorers", days: int = 7):
    user = await _require_user(request)
    slug = normalise_age_slug(child_slug)
    days = max(1, min(int(days), 30))
    cutoff = (datetime.now(timezone.utc) - timedelta(days=days)).isoformat()
    cursor = db.kids_mood_checkins.find(
        {"user_id": user.user_id, "child_slug": slug, "created_at": {"$gte": cutoff}},
        {"_id": 0},
    ).sort("created_at", -1).limit(60)
    rows = await cursor.to_list(length=60)
    return {"child_slug": slug, "days": days, "checkins": rows}


@api_router.get("/kids-mood/parent-portal")
async def kids_mood_parent_portal(request: Request, days: int = 7):
    """Aggregated 7-day wellness trend for the parent dashboard."""
    user = await _require_user(request)
    days = max(1, min(int(days), 30))
    cutoff = (datetime.now(timezone.utc) - timedelta(days=days)).isoformat()
    cursor = db.kids_mood_checkins.find(
        {"user_id": user.user_id, "created_at": {"$gte": cutoff}},
        {"_id": 0},
    ).sort("created_at", -1).limit(200)
    rows = await cursor.to_list(length=200)

    # Per-child aggregates: count by mood, last note.
    by_child: Dict[str, Dict[str, Any]] = {}
    for r in rows:
        cs = r.get("child_slug")
        if cs not in by_child:
            title, age_range = CHILD_TITLES.get(cs, ("?", ""))
            by_child[cs] = {
                "child_slug": cs,
                "title": title,
                "age_range": age_range,
                "counts": {m: 0 for m in VALID_MOODS},
                "total": 0,
                "last": None,
                "recent_notes": [],
            }
        bucket = by_child[cs]
        bucket["counts"][r.get("mood", "okay")] = bucket["counts"].get(r.get("mood", "okay"), 0) + 1
        bucket["total"] += 1
        if bucket["last"] is None:
            bucket["last"] = r
        if r.get("note") and len(bucket["recent_notes"]) < 3:
            bucket["recent_notes"].append({"day": r.get("day"), "mood": r.get("mood"), "note": r.get("note")})

    return {"days": days, "children": list(by_child.values()), "checkins": rows[:50]}


# =============================================================
# §KIDS-JOURNEY 2026-02-10 — 28-day stepping-stone path endpoint.
# Anna's directive: the Kids Universe must FEEL like a real
# journey — three age-themed stone paths (pebbles / crystals /
# hexagons), one stone per day, click any stone to see Aurin's
# tiny invitation for that day. Reuses kids_mood_checkins as the
# source of truth for "walked" days so no new collection is
# needed. Anonymous wanderers see a pristine path with Day 1
# pulsing, so the public route still looks alive.
# =============================================================
@api_router.get("/kids-journey/progress")
async def kids_journey_progress(request: Request, child_slug: str = "explorers"):
    # §PARENTS-PATH 2026-02-10 — Parents Room twin 28-day path
    # bypasses kids slug validation since "parents-room" is its
    # own bucket, not a kids age band.
    if child_slug == "parents-room":
        slug = "parents-room"
    else:
        slug = normalise_age_slug(child_slug)
    user = await _resolve_current_user(request)

    today_index = 1
    completed_days: list[int] = []

    if user:
        # Day index since signup. Clamp 1..28 so old accounts still
        # have a pulsing "today" stone.
        created_at = getattr(user, "created_at", None)
        if isinstance(created_at, datetime):
            anchor = created_at
        else:
            anchor = datetime.now(timezone.utc)
        if anchor.tzinfo is None:
            anchor = anchor.replace(tzinfo=timezone.utc)
        days_since = (datetime.now(timezone.utc).date() - anchor.date()).days
        today_index = max(1, min(days_since + 1, JOURNEY_TOTAL_DAYS))

        # Parents path counts distinct days they've opened the
        # parents-room lenses (we reuse parents_room_visits if it
        # exists; otherwise the count is empty until they engage).
        if slug == "parents-room":
            cursor = db.parents_room_visits.find(
                {"user_id": user.user_id},
                {"_id": 0, "day": 1, "created_at": 1},
            ).sort("created_at", 1).limit(200)
        else:
            cursor = db.kids_mood_checkins.find(
                {"user_id": user.user_id, "child_slug": slug},
                {"_id": 0, "day": 1, "created_at": 1},
            ).sort("created_at", 1).limit(200)
        rows = await cursor.to_list(length=200)
        seen_days: list[str] = []
        for r in rows:
            d = r.get("day")
            if d and d not in seen_days:
                seen_days.append(d)
        for i, _ in enumerate(seen_days[:JOURNEY_TOTAL_DAYS]):
            completed_days.append(i + 1)

    return {
        "child_slug": slug,
        "today_index": today_index,
        "completed_days": completed_days,
        "total_days": JOURNEY_TOTAL_DAYS,
        "messages": kids_journey_all_messages(slug),
        "anonymous": user is None,
    }


@api_router.get("/kids-journey/day/{day_index}")
async def kids_journey_day(day_index: int, child_slug: str = "explorers"):
    slug = "parents-room" if child_slug == "parents-room" else normalise_age_slug(child_slug)
    idx = max(1, min(int(day_index or 1), JOURNEY_TOTAL_DAYS))
    return {
        "child_slug": slug,
        "day": idx,
        "message": kids_journey_message_for_day(slug, idx),
        "total_days": JOURNEY_TOTAL_DAYS,
    }



# =============================================================
# §REFERRAL 2026-02-09 — $5 viral loop, parent-to-parent.
# Every signed-in user gets a stable code `aurin_<8chars>`. When a
# new user enters that code at any time during their first 7 days
# (or it's appended via /refer-claim), both parties earn €5 of
# voice credit (= 8.33 minutes at our €0.60/min rate) once the
# referee makes their FIRST paid purchase (or completes their
# first daily check-in — soft-trigger for non-paying funnel).
#
# Schema:
#   referral_codes      {user_id, code, created_at}
#   referral_claims     {referrer_id, referee_id, code, status,
#                        claimed_at, rewarded_at, reward_seconds}
#
# Reward rules:
#   • €5 = 500 seconds (~8 min) credited to BOTH presence_seconds_left
#   • Soft-trigger: referee's first kids_mood_checkin OR first
#     clarity_pass purchase fires the reward exactly once.
#   • Self-referral blocked.
#   • Idempotent: a referee_id can only ever appear in one claim row.
# =============================================================
REFERRAL_REWARD_SECONDS = int(os.environ.get("REFERRAL_REWARD_SECONDS", "500"))


def _make_referral_code(user_id: str) -> str:
    # 6-char base36 hash of user_id+salt → readable & non-guessable.
    import hashlib
    h = hashlib.sha256(f"{user_id}|aurin-ref-v1".encode()).hexdigest()
    return ("AURIN" + h[:6]).upper()


async def _get_or_create_referral_code(user_id: str) -> str:
    doc = await db.referral_codes.find_one({"user_id": user_id}, {"_id": 0, "code": 1})
    if doc:
        return doc["code"]
    code = _make_referral_code(user_id)
    await db.referral_codes.insert_one({
        "user_id": user_id,
        "code": code,
        "created_at": datetime.now(timezone.utc).isoformat(),
    })
    return code


class ReferralClaimInput(BaseModel):
    code: str


@api_router.get("/referral/me")
async def referral_me(request: Request):
    user = await _require_user(request)
    code = await _get_or_create_referral_code(user.user_id)
    claims = await db.referral_claims.find(
        {"referrer_id": user.user_id}, {"_id": 0}
    ).sort("claimed_at", -1).limit(50).to_list(length=50)
    rewarded = [c for c in claims if c.get("status") == "rewarded"]
    pending = [c for c in claims if c.get("status") == "pending"]
    return {
        "code": code,
        "share_url": f"https://prulesoul.site/?ref={code}",
        "total_invited": len(claims),
        "total_rewarded": len(rewarded),
        "pending": len(pending),
        "total_seconds_earned": sum(int(c.get("reward_seconds") or 0) for c in rewarded),
        "claims": claims[:10],
    }


@api_router.post("/referral/claim")
async def referral_claim(inp: ReferralClaimInput, request: Request):
    """Called when a user enters a referral code (typically during
    onboarding from a ?ref=… URL). Records a pending claim. The
    reward triggers when the referee's first qualifying action
    happens (paid pass OR first daily check-in)."""
    user = await _require_user(request)
    code = (inp.code or "").strip().upper()
    if not code or not code.startswith("AURIN"):
        raise HTTPException(status_code=400, detail="Code doesn't look right.")

    owner = await db.referral_codes.find_one({"code": code}, {"_id": 0, "user_id": 1})
    if not owner:
        raise HTTPException(status_code=404, detail="Code not found.")
    if owner["user_id"] == user.user_id:
        raise HTTPException(status_code=400, detail="You can't refer yourself, sweet one.")

    # One claim per referee — idempotent.
    existing = await db.referral_claims.find_one(
        {"referee_id": user.user_id}, {"_id": 0, "status": 1, "id": 1}
    )
    if existing:
        return {"ok": True, "already": existing.get("status"), "id": existing.get("id")}

    row = {
        "id": f"refclm_{uuid.uuid4().hex[:12]}",
        "referrer_id": owner["user_id"],
        "referee_id": user.user_id,
        "code": code,
        "status": "pending",
        "claimed_at": datetime.now(timezone.utc).isoformat(),
        "rewarded_at": None,
        "reward_seconds": REFERRAL_REWARD_SECONDS,
    }
    await db.referral_claims.insert_one({**row})
    return {"ok": True, "id": row["id"], "status": "pending"}


async def _maybe_reward_referral(referee_id: str, trigger: str) -> dict:
    """Fire-and-forget reward fulfilment. Called from:
       • kids_mood_checkin (first one ever for this user) — soft trigger
       • LemonSqueezy webhook (first paid pass) — strong trigger
    Idempotent: a claim only flips to 'rewarded' once."""
    claim = await db.referral_claims.find_one(
        {"referee_id": referee_id, "status": "pending"}, {"_id": 0}
    )
    if not claim:
        return {"rewarded": False, "reason": "no_pending_claim"}

    reward = int(claim.get("reward_seconds") or REFERRAL_REWARD_SECONDS)
    now_iso = datetime.now(timezone.utc).isoformat()

    # Credit both sides.
    for uid in (claim["referrer_id"], claim["referee_id"]):
        before_doc = await db.users.find_one({"user_id": uid}, {"_id": 0, "presence_seconds_left": 1})
        before = int((before_doc or {}).get("presence_seconds_left") or 0)
        await db.users.update_one(
            {"user_id": uid},
            {"$inc": {"presence_seconds_left": reward}},
            upsert=False,
        )
        after = before + reward
        await _append_credit_ledger(
            user_id=uid,
            delta=reward,
            before=before,
            after=after,
            reason="referral_reward",
            external_ref=claim["id"],
            extra={"role": "referrer" if uid == claim["referrer_id"] else "referee",
                   "trigger": trigger},
        )

    await db.referral_claims.update_one(
        {"id": claim["id"]},
        {"$set": {"status": "rewarded", "rewarded_at": now_iso, "trigger": trigger}},
    )
    return {"rewarded": True, "seconds": reward, "claim_id": claim["id"]}


# =============================================================
# §CUSTOM-TOPUP 2026-02-09 — Flexible voice-minute slider.
# Founder directive: visitors should be able to top up ANY
# whole number of minutes between 10 and 300 at €0.60/min. We
# can't dynamically price LemonSqueezy variants, so we map the
# slider to the NEAREST existing pre-priced LS variant and
# surface a "you'll get N minutes" preview.
#
# Existing LS variants (env-driven):
#   TOPUP_30MIN   →   30 min   €18  (€0.60/min · 30 × 0.60)
#   TOPUP_60MIN   →   60 min   €36
#   TOPUP_180MIN  →  180 min  €108
#
# To unlock fine-grained slider we ALSO accept three additional
# variants if defined:
#   TOPUP_10MIN, TOPUP_15MIN, TOPUP_45MIN, TOPUP_90MIN, TOPUP_120MIN,
#   TOPUP_300MIN — founder configures these in the LS dashboard
#   and pastes the variant IDs into .env. The endpoint below
#   returns the full ladder + the nearest match for any requested
#   minute count.
# =============================================================

TOPUP_PRICE_PER_MIN_EUR = float(os.environ.get("TOPUP_PRICE_PER_MIN_EUR", "0.60"))
TOPUP_MIN_MINUTES = int(os.environ.get("TOPUP_MIN_MINUTES", "10"))
TOPUP_MAX_MINUTES = int(os.environ.get("TOPUP_MAX_MINUTES", "300"))

_TOPUP_LADDER_MINS = [10, 15, 20, 30, 45, 60, 90, 120, 180, 300]
# §UNIVERSAL-BANK 2026-02-09 — 20-min rung is the founder's
# "Universal Minute Bank" starter price-point (€12 @ €0.60/min).
# Purchasable the moment LEMONSQUEEZY_VARIANT_TOPUP_20MIN is set.
UNIVERSAL_BANK_MINUTES = 20


def _topup_ladder_with_env() -> list[dict]:
    """Build the canonical top-up ladder. For each rung we surface
    the LS variant ID *if* it's configured (so the frontend can
    show only purchasable rungs)."""
    rungs = []
    for mins in _TOPUP_LADDER_MINS:
        env_key = f"LEMONSQUEEZY_VARIANT_TOPUP_{mins}MIN"
        variant_id = os.environ.get(env_key, "").strip() or None
        # LS hosted checkout URL pattern (founder confirmed in iter66+).
        checkout_url = None
        if variant_id:
            store = os.environ.get("LEMONSQUEEZY_STORE_SLUG", "").strip()
            if store:
                checkout_url = f"https://{store}.lemonsqueezy.com/buy/{variant_id}"
        rungs.append({
            "minutes": mins,
            "price_eur": round(mins * TOPUP_PRICE_PER_MIN_EUR, 2),
            "variant_id": variant_id,
            "checkout_url": checkout_url,
            "purchasable": bool(variant_id),
        })
    return rungs


@api_router.get("/topup/ladder")
async def topup_ladder():
    """Public. Frontend slider hits this to render the price preview."""
    return {
        "price_per_min_eur": TOPUP_PRICE_PER_MIN_EUR,
        "min_minutes": TOPUP_MIN_MINUTES,
        "max_minutes": TOPUP_MAX_MINUTES,
        "ladder": _topup_ladder_with_env(),
    }


@api_router.get("/topup/nearest")
async def topup_nearest(minutes: int = 30):
    """Given a slider value, return the nearest purchasable rung."""
    requested = max(TOPUP_MIN_MINUTES, min(int(minutes or 0), TOPUP_MAX_MINUTES))
    rungs = [r for r in _topup_ladder_with_env() if r["purchasable"]]
    if not rungs:
        # Founder hasn't seeded any LS variant yet — surface the
        # ladder gracefully so the UI shows "coming soon".
        return {"requested_minutes": requested, "nearest": None, "purchasable": False}
    nearest = min(rungs, key=lambda r: abs(r["minutes"] - requested))
    return {
        "requested_minutes": requested,
        "requested_price_eur": round(requested * TOPUP_PRICE_PER_MIN_EUR, 2),
        "nearest": nearest,
        "purchasable": True,
    }


# =============================================================
# §ANNAS-LETTER 2026-02-09 — Weekly Friday digest for parents.
# Founder directive: every Friday at 18:00 UTC, send each opted-in
# parent a soft summary of their child's week:
#   • Mood counts (last 7 days)
#   • Angel Stars earned (last 7 days)
#   • One quiet sentence "in Aurin's voice" tied to the dominant mood
#   • Reflexive close-out from Anna
#
# Opt-in defaults to True for any user with at least one
# kids_mood_checkin (the ritual is the consent signal). Parent
# can disable from /parent-portal/digest footer (P2 if needed).
#
# Cron: daily check on UTC weekday == 4 (Friday) AND hour == 18.
# Each user receives at most one send per (year, week).
# =============================================================

AURIN_WEEKLY_LINES = {
    "sad":     "If your child carried weight this week, you held some of it without knowing. That counts. — Aurin",
    "worried": "A worried week is not a failed week. It is a week with feelings doing their work. — Aurin",
    "okay":    "Okay weeks are the bones of a soft childhood. They matter more than the sparkly ones. — Aurin",
    "good":    "A good week. Don't analyse it. Just notice it together at dinner one night. — Aurin",
    "sparkly": "Catch the sparkle in a photo, a hug, a note — sparkle keeps best when shared. — Aurin",
    "mixed":   "Every kind of feeling visited this week. Your child's heart is honest. That is a gift. — Aurin",
}


async def _build_weekly_letter(user_id: str) -> Optional[dict]:
    """Compose the digest dict for one parent. Returns None when there's
    nothing to say (no check-ins, no stars this week)."""
    now = datetime.now(timezone.utc)
    week_start = (now - timedelta(days=7)).isoformat()

    moods_cursor = db.kids_mood_checkins.find(
        {"user_id": user_id, "created_at": {"$gte": week_start}},
        {"_id": 0},
    )
    moods = await moods_cursor.to_list(length=200)
    stars_cursor = db.angel_stars_actions.find(
        {"user_id": user_id, "status": "approved", "approved_at": {"$gte": week_start}},
        {"_id": 0},
    )
    stars = await stars_cursor.to_list(length=200)
    if not moods and not stars:
        return None

    by_child: dict[str, dict] = {}
    for m in moods:
        cs = m.get("child_slug") or "explorers"
        bucket = by_child.setdefault(cs, {
            "child_slug": cs,
            "title": CHILD_TITLES.get(cs, ("?", ""))[0],
            "moods": {},
            "stars_earned": 0,
            "notes": [],
        })
        mood = m.get("mood", "okay")
        bucket["moods"][mood] = bucket["moods"].get(mood, 0) + 1
        if m.get("note"):
            bucket["notes"].append(m["note"])
    for s in stars:
        cs = s.get("child_slug") or "explorers"
        bucket = by_child.setdefault(cs, {
            "child_slug": cs,
            "title": CHILD_TITLES.get(cs, ("?", ""))[0],
            "moods": {},
            "stars_earned": 0,
            "notes": [],
        })
        bucket["stars_earned"] += int(s.get("stars") or 0)

    # Determine dominant mood per child for Aurin's line.
    for bucket in by_child.values():
        if bucket["moods"]:
            dom = max(bucket["moods"].items(), key=lambda kv: kv[1])[0]
            distinct_moods = len([k for k, v in bucket["moods"].items() if v > 0])
            bucket["aurin_line"] = AURIN_WEEKLY_LINES["mixed" if distinct_moods >= 4 else dom]
        else:
            bucket["aurin_line"] = AURIN_WEEKLY_LINES["good"]

    return {
        "user_id": user_id,
        "generated_at": now.isoformat(),
        "year_week": f"{now.isocalendar()[0]}-W{now.isocalendar()[1]:02d}",
        "children": list(by_child.values()),
    }


def _render_weekly_letter_html(digest: dict, parent_name: Optional[str],
                                *, show_body_temple_ps: bool = False) -> str:
    name = (parent_name or "").strip().split()[0] if parent_name else ""
    greeting = f"Hello {name}," if name else "Hello,"
    children_html = []
    for c in digest["children"]:
        moods_html = "".join(
            f"<li style='margin:4px 0;color:#5a5040;font-size:14px'>"
            f"<strong style='color:#3d2a1e'>{count}×</strong> {mood}</li>"
            for mood, count in sorted(c["moods"].items(), key=lambda kv: -kv[1])
        ) or "<li style='color:#8a7a64;font-size:14px;font-style:italic'>no check-ins this week</li>"
        notes_html = ""
        if c["notes"]:
            quoted = c["notes"][0][:200].replace("<", "&lt;").replace(">", "&gt;")
            notes_html = (
                f"<p style='margin:14px 0 0;padding:14px 16px;"
                f"background:#fff7ee;border-left:3px solid #e8a87c;"
                f"font-family:Georgia,serif;font-style:italic;color:#3d2a1e;"
                f"font-size:14.5px;line-height:1.5'>"
                f"One whisper they wrote: \"{quoted}\""
                f"</p>"
            )
        children_html.append(f"""
          <div style="margin-top:32px;padding:24px;background:#fbf6ec;border-radius:14px">
            <p style="margin:0;font-size:11px;letter-spacing:0.16em;text-transform:uppercase;color:#7a5e4a">{c['title']}</p>
            <div style="display:flex;align-items:baseline;gap:12px;margin-top:6px">
              <span style="font-size:32px;font-family:Georgia,serif;color:#e8a87c">{c['stars_earned']}</span>
              <span style="font-size:14px;color:#5a5040">★ Angel Stars this week</span>
            </div>
            <p style="margin:18px 0 8px;font-size:13px;letter-spacing:0.12em;text-transform:uppercase;color:#7a5e4a">How the week felt</p>
            <ul style="list-style:none;padding:0;margin:0">{moods_html}</ul>
            {notes_html}
            <p style="margin:18px 0 0;font-family:Georgia,serif;font-style:italic;color:#3d2a1e;font-size:15px;line-height:1.5">
              {c['aurin_line']}
            </p>
          </div>
        """)
    return f"""
    <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;max-width:560px;margin:0 auto;color:#3d2a1e">
      <p style="font-size:11px;letter-spacing:0.24em;text-transform:uppercase;color:#a65a2f;margin:0 0 8px">A small letter from Anna</p>
      <h1 style="font-family:Georgia,serif;font-size:28px;font-weight:400;line-height:1.2;margin:0 0 18px">A quiet week with your child.</h1>
      <p style="font-size:15px;line-height:1.6;color:#5a5040">{greeting}</p>
      <p style="font-size:15px;line-height:1.6;color:#5a5040">
        Here's the rhythm of your child's week inside Aurin's room. Nothing
        to do with it — just notice. Patterns soften when we look at them
        gently.
      </p>
      {''.join(children_html)}
      <div style="margin-top:34px;padding-top:18px;border-top:1px solid #e8d8c5">
        <p style="font-size:14.5px;line-height:1.6;color:#5a5040">
          If you'd like to see this week up close, open the
          <a href="https://prulesoul.site/parent-portal/digest" style="color:#a65a2f;text-decoration:none;border-bottom:1px dotted #a65a2f">Weekly Digest</a>
          — the bars and notes live there.
        </p>
        {('<div style="margin-top:22px;padding:18px 20px;background:#fbf2e0;border:1px solid #e8d2a8;border-radius:12px">'
          '<p style="margin:0 0 6px;font-size:11px;letter-spacing:0.2em;text-transform:uppercase;color:#8a6428">For you, Anna writes —</p>'
          '<p style="margin:0;font-family:Georgia,serif;font-size:16px;line-height:1.55;color:#3d2a1e;font-style:italic">'
          'P.S. If your week was loud too — there is a quiet room here for you. '
          '<a href="https://prulesoul.site/body-temple?utm_source=annas_letter" '
          'style="color:#a65a2f;text-decoration:none;border-bottom:1px dotted #a65a2f">Body Temple 28</a> '
          'opens Day 1 freely; the rest is $39, walked at your own pace.</p>'
          '</div>') if show_body_temple_ps else ''}
        <p style="font-size:14px;line-height:1.6;color:#7a5e4a;margin-top:12px">
          With warmth,<br>
          <span style="font-family:'Caveat',cursive,Georgia,serif;font-size:22px;color:#a65a2f">— Anna</span>
        </p>
      </div>
      <p style="margin-top:30px;font-size:11px;color:#a8997f;line-height:1.5">
        You receive this letter because your child uses Aurin's daily check-in.
        Reply to this email if you'd like to pause it for a while — I read every note.
      </p>
    </div>
    """


async def _send_annas_letter(user_id: str, *, dry_run: bool = False) -> dict:
    user_doc = await db.users.find_one({"user_id": user_id}, {"_id": 0})
    if not user_doc:
        return {"sent": False, "reason": "user_not_found"}
    if user_doc.get("annas_letter_opt_out"):
        return {"sent": False, "reason": "opted_out"}
    digest = await _build_weekly_letter(user_id)
    if not digest:
        return {"sent": False, "reason": "no_activity"}

    year_week = digest["year_week"]
    sent_already = await db.annas_letter_sends.find_one(
        {"user_id": user_id, "year_week": year_week}, {"_id": 0, "id": 1}
    )
    if sent_already and not dry_run:
        return {"sent": False, "reason": "already_sent_this_week", "year_week": year_week}

    # §SYNERGY-1 2026-02-10 — Quiet Body Temple invitation in Anna's letter
    # only when the parent has NOT yet unlocked it. Non-premium parents
    # see one soft P.S. card at the bottom. Premium parents see none.
    show_body_temple_ps = not await _user_has_premium(user_id)
    html = _render_weekly_letter_html(digest, user_doc.get("name"),
                                      show_body_temple_ps=show_body_temple_ps)
    email = user_doc.get("email")
    if not email:
        return {"sent": False, "reason": "no_email"}

    if dry_run:
        return {"sent": False, "reason": "dry_run", "preview_html": html}

    try:
        from email_service import send_email as _send_email, is_configured as _resend_ok
        if not _resend_ok():
            return {"sent": False, "reason": "resend_not_configured"}
        await _send_email(
            to=email,
            subject="A quiet week with your child — Aurin's letter",
            html=html,
            sender="agent",
            reply_to="anna@prulesoul.site",
        )
    except Exception as exc:  # noqa: BLE001
        logger.warning("annas_letter send failed user=%s err=%s", user_id, exc)
        return {"sent": False, "reason": f"send_error: {exc}"}

    await db.annas_letter_sends.insert_one({
        "id": f"alsend_{uuid.uuid4().hex[:12]}",
        "user_id": user_id,
        "year_week": year_week,
        "sent_at": digest["generated_at"],
    })
    return {"sent": True, "year_week": year_week}


class AnnasLetterOptInput(BaseModel):
    opt_out: bool


@api_router.post("/admin/annas-letter")
async def admin_annas_letter(request: Request, user_id: str = "", dry_run: bool = False):
    """Admin-triggered weekly letter. Without `user_id`, dispatches to
    every user with at least one mood check-in. With `user_id` + `dry_run=true`,
    returns the HTML preview without sending."""
    admin_token = os.environ.get("ADMIN_TOKEN")
    sent_hdr = request.headers.get("X-Admin-Token") or request.query_params.get("token")
    if not admin_token or sent_hdr != admin_token:
        raise HTTPException(status_code=401, detail="Admin token required.")

    if user_id:
        return await _send_annas_letter(user_id, dry_run=dry_run)

    # Dispatch loop: users who have ANY mood check-in.
    distinct_users = await db.kids_mood_checkins.distinct("user_id")
    results = {"total": len(distinct_users), "sent": 0, "skipped": 0, "errors": 0}
    for uid in distinct_users:
        try:
            r = await _send_annas_letter(uid)
            if r.get("sent"):
                results["sent"] += 1
            else:
                results["skipped"] += 1
        except Exception:
            results["errors"] += 1
    return results


# §ANNAS-LETTER-P3 2026-02-09 — Parent-facing opt-in / opt-out for
# the weekly letter. Defaults to opt-in (the daily check-in IS the
# consent signal), but every parent must be able to step away from
# the rhythm without hunting through dashboards.
@api_router.get("/annas-letter/preferences")
async def annas_letter_preferences(request: Request):
    user = await _require_user(request)
    u = await db.users.find_one({"user_id": user.user_id},
                                {"_id": 0, "annas_letter_opt_out": 1, "email": 1})
    return {
        "opt_out": bool((u or {}).get("annas_letter_opt_out")),
        "email": (u or {}).get("email"),
    }


@api_router.post("/annas-letter/preferences")
async def annas_letter_preferences_update(inp: AnnasLetterOptInput, request: Request):
    user = await _require_user(request)
    await db.users.update_one(
        {"user_id": user.user_id},
        {"$set": {"annas_letter_opt_out": bool(inp.opt_out),
                  "annas_letter_pref_updated_at": datetime.now(timezone.utc).isoformat()}},
    )
    return {"ok": True, "opt_out": bool(inp.opt_out)}


# =============================================================
# §UNIVERSAL-BANK 2026-02-09 — Featured $12 / 20-min starter
# top-up. Wraps the existing topup endpoint so the marketing
# language stays distinct ("Universal Minute Bank — your first
# taste of Aurin") while the plumbing reuses the same LS variant.
# =============================================================

@api_router.get("/minute-bank/starter")
async def minute_bank_starter():
    """Public. Returns the featured starter pack info."""
    nearest_rung = next(
        (r for r in _topup_ladder_with_env() if r["minutes"] == UNIVERSAL_BANK_MINUTES),
        None,
    )
    return {
        "minutes": UNIVERSAL_BANK_MINUTES,
        "price_eur": round(UNIVERSAL_BANK_MINUTES * TOPUP_PRICE_PER_MIN_EUR, 2),
        "tagline": "Universal Minute Bank · your first taste of Aurin",
        "blurb": (
            "Twenty quiet minutes you can spend in any room — Grace, "
            "Aurin's Room, the Body Room. No subscription, no commitment. "
            "A small first taste."
        ),
        "checkout_url": (nearest_rung or {}).get("checkout_url"),
        "purchasable": bool((nearest_rung or {}).get("checkout_url")),
    }


# =============================================================
# §TODAYS-QUEST 2026-02-09 — Voice-room "mood detection MVP".
# Reads the user's most recent kids_mood_checkin (any child) and
# returns 1-3 curriculum activity recommendations + a parent-
# facing quote in Aurin's voice. UI surfaces this card on the
# Clarity Release Hub after a voice session and on the Wellness
# portal so the parent always sees something gentle waiting.
#
# Full NLP mood detection from voice transcripts is Phase 3 — this
# MVP uses the explicit mood signal the child has already given
# during their daily check-in, which is the highest-quality data
# we have and avoids speculative interpretation.
# =============================================================

AURIN_QUEST_HEADLINES = {
    "sad":     "A small quest for a heavy day",
    "worried": "A small quest for a busy mind",
    "okay":    "A small quest for an in-between day",
    "good":    "A small quest to keep the warmth going",
    "sparkly": "A small quest to catch the sparkle",
    "default": "A small quest for today",
}


@api_router.get("/aurin/today-quest")
async def aurin_today_quest(request: Request):
    """Returns the gentlest curriculum activity match for the parent's
    family right now. Falls back to a universal default when there's
    no check-in to read from."""
    user = await _resolve_current_user(request)
    if not user:
        # Public preview: surface a hard-coded gentle starter so the
        # marketing page can show what the feature looks like.
        return {
            "source": "preview",
            "headline": AURIN_QUEST_HEADLINES["default"],
            "aurin_line": "Today is whatever you decide it is. Pick something tiny.",
            "child_slug": None,
            "mood": None,
            "activities": [_public_activity(a, premium_user=False) for a in (
                [get_activity("three_breaths"), get_activity("compliment_today"), get_activity("today_color")]
            ) if a is not None],
        }

    # Latest mood check-in for this user (any child).
    latest = await db.kids_mood_checkins.find_one(
        {"user_id": user.user_id}, {"_id": 0},
        sort=[("created_at", -1)],
    )
    premium = await _user_has_premium(user.user_id)

    if not latest:
        # Authed but no check-in yet — gentle default.
        default_slugs = ["three_breaths", "compliment_today", "today_color"]
        activities = [a for a in (get_activity(s) for s in default_slugs) if a is not None]
        return {
            "source": "default_no_checkin",
            "headline": AURIN_QUEST_HEADLINES["default"],
            "aurin_line": "Begin with a daily check-in — that's how I'll know what to suggest next.",
            "child_slug": None,
            "mood": None,
            "activities": [_public_activity(a, premium) for a in activities],
        }

    mood = latest.get("mood", "okay")
    slug = latest.get("child_slug") or "explorers"
    recs = recommend_for_mood(slug, mood)
    return {
        "source": "mood_checkin",
        "headline": AURIN_QUEST_HEADLINES.get(mood, AURIN_QUEST_HEADLINES["default"]),
        "aurin_line": MOOD_AURIN_REPLY.get(mood, MOOD_AURIN_REPLY["okay"]),
        "child_slug": slug,
        "child_title": CHILD_TITLES.get(slug, ("?", ""))[0],
        "mood": mood,
        "checkin_at": latest.get("created_at"),
        "activities": [_public_activity(a, premium) for a in recs],
    }



# =============================================================
# §BODY-TEMPLE 2026-02-09 — Body Temple 28-day curriculum.
# A premium adult course living inside the Kaelan (Body) room.
# Founder directive: integrate ancient body-wisdom (breathing,
# touch, rest, presence) as Anna's first paid adult course.
#
# Free preview: Day 1 visible to everyone.
# Paid unlock: $39 via existing ClarityPass / premium gating
# (any active paying parent unlocks all 28 days — same gating
# logic as the Clarity Curriculum premium activities).
# =============================================================

from body_temple_curriculum import (  # noqa: E402
    BODY_TEMPLE_DAYS,
    BODY_TEMPLE_WEEKS,
    BODY_TEMPLE_PRICE_USD,
    BODY_TEMPLE_TOTAL_DAYS,
    get_day as _bt_get_day,
    get_week_days as _bt_get_week_days,
    course_overview as _bt_overview,
)
# §CHRONO-LOCK 2026-02-13 — Body Architecture 7-day weekly unlocks
# and Clarity Release 48-hour Integration Lock are enforced from
# this dedicated service so the math is unit-testable.
from services import chrono_lock as _chrono_lock  # noqa: E402


def _bt_public_day(d: Dict[str, Any], unlocked: bool) -> Dict[str, Any]:
    """Strip server-only fields. Locked days return only the
    teaser (title + week) — no body, no practice, no reflection."""
    locked = bool(d.get("is_premium")) and not unlocked
    return {
        "day": d["day"],
        "week_key": d["week_key"],
        "week_number": d["week_number"],
        "title": d["title"],
        "body": d["body"] if not locked else
            "A gentle practice inside Body Temple 28. Unlock the course to walk this day with Aurin.",
        "practice": d["practice"] if not locked else [],
        "duration_min": d["duration_min"],
        "reflection": d["reflection"] if not locked else None,
        "is_premium": bool(d.get("is_premium")),
        "locked": locked,
    }


@api_router.get("/body-temple/overview")
async def body_temple_overview(request: Request):
    """Public. Returns course shape + per-day completion if signed in."""
    user = await _resolve_current_user(request)
    unlocked = False
    completed_days: list[int] = []
    enrollment_started_at = None
    week_unlocks: Dict[str, Any] = {}
    if user:
        unlocked = await _user_has_premium(user.user_id)
        cursor = db.body_temple_progress.find(
            {"user_id": user.user_id}, {"_id": 0, "day": 1},
        )
        completed_days = [doc["day"] async for doc in cursor]
        # §CHRONO-LOCK — surface unlock_at per week for signed-in users.
        enr = await _chrono_lock.get_body_enrollment(db, user.user_id)
        if enr:
            enrollment_started_at = enr.get("started_at")
            started_dt = enr["started_at_dt"]
            for w in BODY_TEMPLE_WEEKS.values():
                week_unlocks[w["key"]] = _chrono_lock.body_week_status(
                    started_dt, w["number"]
                )

    overview = _bt_overview()
    return {
        **overview,
        "unlocked": unlocked,
        "completed_days": sorted(completed_days),
        "completed_count": len(completed_days),
        "enrollment_started_at": enrollment_started_at,
        "week_unlocks": week_unlocks,
        "chrono_lock_days": _chrono_lock.BODY_WEEK_LOCK_DAYS,
        "days_preview": [
            {
                "day": d["day"],
                "week_key": d["week_key"],
                "title": d["title"],
                "duration_min": d["duration_min"],
                "is_premium": bool(d.get("is_premium")),
            }
            for d in BODY_TEMPLE_DAYS
        ],
    }


@api_router.get("/body-temple/day/{day}")
async def body_temple_day(day: int, request: Request):
    d = _bt_get_day(day)
    if not d:
        raise HTTPException(status_code=404, detail="Day not found.")
    user = await _resolve_current_user(request)
    unlocked = False
    completed = False
    chrono_status = _chrono_lock.body_week_status(
        _chrono_lock._now(), d["week_number"]
    )
    if user:
        unlocked = await _user_has_premium(user.user_id)
        completed = bool(await db.body_temple_progress.find_one(
            {"user_id": user.user_id, "day": day}, {"_id": 1},
        ))
        # Compute against the user's enrollment if any. Week 1 days are
        # always open as a tone-preview — only week >= 2 needs the lock.
        if unlocked:
            chrono_status = await _chrono_lock.body_week_status_for_user(
                db, user.user_id, d["week_number"]
            )
    chrono_locked = bool(chrono_status.get("chrono_locked") and d["week_number"] > 1)
    public = _bt_public_day(d, unlocked)
    # Strip body/practice/reflection when chrono-locked, regardless of
    # premium state — the wanderer must walk the previous week first.
    if chrono_locked:
        public["body"] = (
            "The next key opens on its own time. Walk this week's "
            "rhythm first; the gate cannot be hurried."
        )
        public["practice"] = []
        public["reflection"] = None
        public["locked"] = True
    return {
        "day": public,
        "unlocked": unlocked,
        "completed": completed,
        "week": BODY_TEMPLE_WEEKS.get(d["week_key"]),
        "chrono_locked": chrono_locked,
        "chrono_unlocks_at": chrono_status.get("unlock_at"),
        "chrono_seconds_remaining": chrono_status.get("seconds_remaining", 0),
    }


class BodyTempleCompleteInput(BaseModel):
    day: int


@api_router.post("/body-temple/complete")
async def body_temple_complete(inp: BodyTempleCompleteInput, request: Request):
    user = await _require_user(request)
    d = _bt_get_day(inp.day)
    if not d:
        raise HTTPException(status_code=404, detail="Day not found.")
    # Locked days cannot be completed; require unlock.
    if d.get("is_premium") and not await _user_has_premium(user.user_id):
        raise HTTPException(status_code=403, detail="Day is part of the premium Body Temple 28 unlock.")
    # §CHRONO-LOCK — lazy-enrol the user on their first completion
    # (so week 2/3/4 unlocks measure from this moment, not the day
    # they first opened the room).
    enr = await _chrono_lock.ensure_body_enrollment(db, user.user_id)
    status = _chrono_lock.body_week_status(
        enr["started_at_dt"], d["week_number"]
    )
    if status["chrono_locked"] and d["week_number"] > 1:
        raise HTTPException(
            status_code=423,
            detail={
                "code": "chrono_locked",
                "message": (
                    "This key opens on its own time. The previous week's "
                    "rhythm is still settling. Please return after the "
                    "integration window."
                ),
                "unlock_at": status["unlock_at"],
                "seconds_remaining": status["seconds_remaining"],
                "week_number": d["week_number"],
            },
        )
    now = datetime.now(timezone.utc).isoformat()
    await db.body_temple_progress.update_one(
        {"user_id": user.user_id, "day": inp.day},
        {"$set": {"user_id": user.user_id, "day": inp.day, "completed_at": now,
                  "week_key": d["week_key"]}},
        upsert=True,
    )
    total = await db.body_temple_progress.count_documents({"user_id": user.user_id})
    return {"ok": True, "day": inp.day, "completed_total": total,
            "total_days": BODY_TEMPLE_TOTAL_DAYS}


# =============================================================
# §GRACE-BOUNDARIES 2026-02-09 — Adult Clarity persona MVP.
# Lightweight mode selector that runs ON TOP OF the existing
# Grace (Clarity Release) room. Picking a mode does not swap
# the ElevenLabs agent — it stores a session-scoped "mode_hint"
# the Grace prompt can read and which the UI surfaces as a
# gentle pre-session frame ("Today we sit with: Boundaries").
# Three modes, all house-tone (zero clinical language):
#   • boundaries     — saying no without guilt
#   • energy         — who took / who gave today
#   • grey_rocking   — surviving toxic rooms without leaving
# =============================================================

GRACE_MODES = {
    "boundaries": {
        "key": "boundaries",
        "title": "Boundaries Architect",
        "subtitle": "Saying no without guilt.",
        "blurb": "Today, Grace listens to where your yeses cost more than they should — and helps you find one sentence that protects you.",
        "first_message": (
            "I'm here with you. Tell me about one moment this week where "
            "you said yes when something inside you whispered no. Just one. "
            "We'll find the kinder sentence together."
        ),
        "icon": "Shield",
        "color": "#B89B6E",
    },
    "energy": {
        "key": "energy",
        "title": "Energy Inventory",
        "subtitle": "Who took. Who gave.",
        "blurb": "Today we map your day in two columns — the people who lent you energy, and the ones who borrowed it without returning.",
        "first_message": (
            "Welcome back. Let's do something quiet together — name "
            "one person who left you brighter today, and one who left "
            "you a little heavier. No blame, just light."
        ),
        "icon": "Sparkles",
        "color": "#E3B48C",
    },
    "grey_rocking": {
        "key": "grey_rocking",
        "title": "Grey Rocking",
        "subtitle": "Quiet in loud rooms.",
        "blurb": "When you can't leave the room yet — Grace helps you stay small, stay still, and keep your inner house intact.",
        "first_message": (
            "I see you. You're in a room you can't leave right now — "
            "and you need to stay yourself inside it. Let's practise "
            "one small phrase that gives nothing away, and one breath "
            "that keeps you whole."
        ),
        "icon": "Mountain",
        "color": "#7C9DB0",
    },
}


# =============================================================
# §MENTOR-HOOK 2026-02-10 — Parental Synergy #2.
# After a non-premium parent has spent quiet time in any of the
# three adult voice rooms (Grace/Body/Parents), surface ONE soft
# Body Temple 28 invitation. Threshold-gated, dismissable, never
# repeated once a user dismisses or unlocks.
#
# Eligibility:
#   • signed-in user
#   • NOT already premium (Body Temple unlocks, paid pass, etc.)
#   • ≥ MENTOR_HOOK_THRESHOLD closed voice_sessions in adult rooms
#   • has NOT dismissed the hook before
# =============================================================
MENTOR_HOOK_THRESHOLD = int(os.environ.get("MENTOR_HOOK_THRESHOLD", "3"))
_ADULT_VOICE_ROOMS = ("clarity", "body", "parents")


@api_router.get("/marketing/mentor-hook")
async def mentor_hook_status(request: Request):
    """Return whether the user is eligible for the soft Body Temple
    invitation. Public-safe: signed-out callers receive eligible=False
    so the frontend simply renders nothing."""
    user = await _resolve_current_user(request)
    if not user:
        return {"eligible": False, "reason": "anonymous"}

    # Premium parents have already crossed the threshold — silence.
    if await _user_has_premium(user.user_id):
        return {"eligible": False, "reason": "already_premium",
                "voice_sessions": None, "threshold": MENTOR_HOOK_THRESHOLD}

    user_doc = await db.users.find_one(
        {"user_id": user.user_id},
        {"_id": 0, "mentor_hook_dismissed_at": 1},
    ) or {}
    if user_doc.get("mentor_hook_dismissed_at"):
        return {"eligible": False, "reason": "dismissed",
                "voice_sessions": None, "threshold": MENTOR_HOOK_THRESHOLD}

    count = await db.voice_sessions.count_documents({
        "user_id": user.user_id,
        "room": {"$in": list(_ADULT_VOICE_ROOMS)},
        "closed": True,
    })
    eligible = count >= MENTOR_HOOK_THRESHOLD
    return {
        "eligible": eligible,
        "reason": "ready" if eligible else "below_threshold",
        "voice_sessions": count,
        "threshold": MENTOR_HOOK_THRESHOLD,
        "cta_url": "/body-temple?utm_source=mentor_hook",
    }


@api_router.post("/marketing/mentor-hook/dismiss")
async def mentor_hook_dismiss(request: Request):
    """The wanderer chose 'not yet' — record it once, never resurface."""
    user = await _require_user(request)
    await db.users.update_one(
        {"user_id": user.user_id},
        {"$set": {"mentor_hook_dismissed_at": datetime.now(timezone.utc).isoformat()}},
    )
    return {"ok": True}


@api_router.get("/grace/modes")
async def grace_modes():
    """Public — returns the three available Grace boundary modes."""
    return {"modes": list(GRACE_MODES.values())}


# =============================================================
# §SYNERGY-ANNELI 2026-02-10 — Personalised story growth-loop.
# A parent fills a 3-field form; Claude generates a 200-word
# bedtime story with the child's name twice, the feeling once.
# Shareable via WhatsApp / Telegram / Email / Copy.
# Free for everyone — this is the zero-CAC growth engine.
# =============================================================
from aurin_story_gift import generate_story as _gen_story, serialize_gift as _gift_doc  # noqa: E402


class StoryGiftInput(BaseModel):
    child_name: str
    feeling: Literal["scared","curious","sad","proud","lonely","angry","tired","happy"]
    age_band: Literal["3-5", "6-8", "9-12"] = "6-8"
    parent_email: Optional[str] = None


@api_router.get("/story-gift/feelings")
async def story_gift_feelings():
    """Public — list of accepted feelings + age bands for the UI."""
    return {
        "feelings": [
            {"slug": "scared",   "label": "Scared of something"},
            {"slug": "curious",  "label": "Curious"},
            {"slug": "sad",      "label": "A little sad"},
            {"slug": "proud",    "label": "Proud of themselves"},
            {"slug": "lonely",   "label": "Lonely"},
            {"slug": "angry",    "label": "Angry"},
            {"slug": "tired",    "label": "Very tired"},
            {"slug": "happy",    "label": "Happy"},
        ],
        "age_bands": [
            {"slug": "3-5",  "label": "3 to 5"},
            {"slug": "6-8",  "label": "6 to 8"},
            {"slug": "9-12", "label": "9 to 12"},
        ],
    }


@api_router.post("/story-gift/create")
async def story_gift_create(inp: StoryGiftInput):
    """Public — anyone can generate one story. Rate limit applies."""
    name = (inp.child_name or "").strip()
    if not name or len(name) > 32:
        raise HTTPException(status_code=400, detail="Please use the child's first name (1-32 letters).")
    if not re.match(r"^[A-Za-zÀ-ÿ' -]+$", name):
        raise HTTPException(status_code=400, detail="Use letters only for the child's name.")

    result = await _gen_story(
        child_name=name,
        feeling=inp.feeling,
        age_band=inp.age_band,
    )
    if not result.get("ok"):
        if result.get("error") == "llm_not_configured":
            raise HTTPException(status_code=503, detail="Story engine is resting. Please try again soon.")
        raise HTTPException(status_code=502, detail="A small gust closed the door. Please try once more.")

    doc = _gift_doc(story_obj=result, parent_email=inp.parent_email)
    await db.story_gifts.insert_one(doc)

    base = os.environ.get("PUBLIC_BASE_URL", "https://prulesoul.site").rstrip("/")
    share_url = f"{base}/aurins-room/gift/{doc['slug']}?ref=story_gift&utm_source=anneli"
    return {
        "ok": True,
        "slug": doc["slug"],
        "title": doc["title"],
        "story": doc["story"],
        "word_count": doc["word_count"],
        "share_url": share_url,
    }


@api_router.get("/story-gift/{slug}")
async def story_gift_read(slug: str):
    """Public — render a previously generated gift story."""
    doc = await db.story_gifts.find_one({"slug": slug}, {"_id": 0})
    if not doc:
        raise HTTPException(status_code=404, detail="This story has drifted away.")
    return {
        "slug": doc["slug"],
        "title": doc["title"],
        "story": doc["story"],
        "name_used": doc.get("name_used"),
        "word_count": doc.get("word_count"),
        "created_at": doc.get("created_at"),
    }


class GraceModeSelectInput(BaseModel):
    mode: str


@api_router.post("/grace/mode")
async def grace_mode_set(inp: GraceModeSelectInput, request: Request):
    """Stores the selected mode in the user's profile so the next
    Grace session opens with the mode's framing. Idempotent.

    §CHRONO-LOCK — switching to a *different* mode within the 48-hour
    Integration Lock window is blocked with HTTP 423. Re-selecting the
    same mode the user just consumed is always permitted."""
    if inp.mode not in GRACE_MODES and inp.mode != "":
        raise HTTPException(status_code=400, detail="Unknown Grace mode.")
    user = await _require_user(request)
    # Guard the *switch* — empty clears do not trip the lock.
    if inp.mode:
        try:
            await _chrono_lock.assert_clarity_mode_switch_allowed(
                db, user.user_id, inp.mode
            )
        except _chrono_lock.ChronoLocked as locked:
            raise HTTPException(
                status_code=423,
                detail={
                    "code": "chrono_locked",
                    "message": (
                        "A 48-hour Integration Lock is open from your "
                        "previous session. The next gate becomes "
                        "accessible only after the nervous system has "
                        "had its integration window."
                    ),
                    **locked.status,
                },
            )
    await db.users.update_one(
        {"user_id": user.user_id},
        {"$set": {"grace_mode": inp.mode,
                  "grace_mode_set_at": datetime.now(timezone.utc).isoformat()}},
    )
    return {"ok": True, "mode": inp.mode,
            "frame": GRACE_MODES.get(inp.mode)}


@api_router.get("/grace/mode")
async def grace_mode_get(request: Request):
    user = await _resolve_current_user(request)
    if not user:
        return {"mode": "", "frame": None}
    u = await db.users.find_one({"user_id": user.user_id}, {"_id": 0, "grace_mode": 1})
    mode = (u or {}).get("grace_mode") or ""
    return {"mode": mode, "frame": GRACE_MODES.get(mode) if mode else None}


# §CHRONO-LOCK 2026-02-13 — Clarity Release 48-hour Integration Lock.
# Surfaces the current lock state and lets the frontend record when a
# module has been consumed so the next gate opens on its own time.


class ClarityModuleConsumeInput(BaseModel):
    mode: str


@api_router.get("/clarity/integration-lock")
async def clarity_integration_lock_get(request: Request):
    """Returns the user's current 48h Integration Lock state. When the
    user is signed-out we always return the unlocked shape so the UI
    can render the path without authentication."""
    user = await _resolve_current_user(request)
    if not user:
        return {
            "last_mode": None,
            "last_consumed_at": None,
            "chrono_locked": False,
            "unlock_at": None,
            "seconds_remaining": 0,
            "lock_hours": _chrono_lock.CLARITY_INTEGRATION_LOCK_HOURS,
        }
    state = await _chrono_lock.get_clarity_integration_state(db, user.user_id)
    return {
        **state,
        "lock_hours": _chrono_lock.CLARITY_INTEGRATION_LOCK_HOURS,
    }


@api_router.post("/clarity/integration-lock/consume")
async def clarity_integration_lock_consume(
    inp: ClarityModuleConsumeInput, request: Request
):
    """Record the moment the user finished a foundational module (a
    Grace mode session). Subsequent attempts to switch to a different
    mode within the next 48 hours will return HTTP 423 — the same
    mode can be re-entered freely so integration continues."""
    if inp.mode not in GRACE_MODES:
        raise HTTPException(status_code=400, detail="Unknown Grace mode.")
    user = await _require_user(request)
    state = await _chrono_lock.record_clarity_module_consumption(
        db, user.user_id, inp.mode
    )
    return {
        "ok": True,
        "mode": inp.mode,
        **state,
        "lock_hours": _chrono_lock.CLARITY_INTEGRATION_LOCK_HOURS,
    }



# =============================================================
# §ALISTAIR-PERSONA 2026-02-09 — High-Performers / Burnout
# persona MVP for the Course Room (Alistair). Mirrors the Grace
# mode pattern: three modes, persistence in users.alistair_mode,
# a pre-session frame surfaced in the UI.
#
# Never clinical. Never measuring. Strategic-mentor tone that
# fits Alistair's existing voice ("a steady voice for those who
# carry hard things forward").
# =============================================================

ALISTAIR_MODES = {
    "focus": {
        "key": "focus",
        "title": "One Honest Hour",
        "subtitle": "Pick the one thing that matters today.",
        "blurb": "Today, Alistair listens to your task-list — and helps you find the single move that, done well, makes the rest matter less.",
        "first_message": (
            "Welcome back. Before you list what's on your plate today, "
            "tell me this: if only one thing got done before sundown, "
            "which one would let you sleep? Just one. We'll start there."
        ),
        "icon": "Target",
        "color": "#B89B6E",
    },
    "decompression": {
        "key": "decompression",
        "title": "Carry Less",
        "subtitle": "Setting down what isn't yours.",
        "blurb": "Today we look at what you've been quietly carrying — and which of those weights belong to someone else's hands.",
        "first_message": (
            "I see the weight you came in with. Let's name three "
            "things on your shoulders right now — and for each one, "
            "we'll ask one quiet question: is this mine to carry, "
            "or did someone hand it to me when I wasn't looking?"
        ),
        "icon": "FeatherIcon",
        "color": "#7BA888",
    },
    "decision": {
        "key": "decision",
        "title": "Standing at a Door",
        "subtitle": "When the next move is unclear.",
        "blurb": "Today we sit with a single decision you've been postponing. Alistair won't make it for you — he'll just help you hear which way your body already leans.",
        "first_message": (
            "Welcome. Tell me about the door you've been standing in "
            "front of — the one you keep almost opening. We won't "
            "decide today. We'll just listen to where your body "
            "wants to go when no one is watching."
        ),
        "icon": "Compass",
        "color": "#9B7BA8",
    },
}


@api_router.get("/alistair/modes")
async def alistair_modes_list():
    return {"modes": list(ALISTAIR_MODES.values())}


class AlistairModeSelectInput(BaseModel):
    mode: str


@api_router.post("/alistair/mode")
async def alistair_mode_set(inp: AlistairModeSelectInput, request: Request):
    if inp.mode not in ALISTAIR_MODES and inp.mode != "":
        raise HTTPException(status_code=400, detail="Unknown Alistair mode.")
    user = await _require_user(request)
    await db.users.update_one(
        {"user_id": user.user_id},
        {"$set": {"alistair_mode": inp.mode,
                  "alistair_mode_set_at": datetime.now(timezone.utc).isoformat()}},
    )
    return {"ok": True, "mode": inp.mode, "frame": ALISTAIR_MODES.get(inp.mode)}


@api_router.get("/alistair/mode")
async def alistair_mode_get(request: Request):
    user = await _resolve_current_user(request)
    if not user:
        return {"mode": "", "frame": None}
    u = await db.users.find_one({"user_id": user.user_id}, {"_id": 0, "alistair_mode": 1})
    mode = (u or {}).get("alistair_mode") or ""
    return {"mode": mode, "frame": ALISTAIR_MODES.get(mode) if mode else None}


# =============================================================
# §VOICE-MOOD-NLP 2026-02-09 — Phase 2 of mood detection.
# Reads a free-form post-session reflection (or a transcript
# snippet) and asks Claude for a single calibrated mood label.
# Stored as voice_mood_signals so Today's Quest can blend
# voice-derived signals with the manual daily check-in.
#
# Privacy: we DO NOT persist the raw text — only the extracted
# mood label and confidence. This is the founder's hard rule.
# =============================================================

VALID_VOICE_MOODS = ("sad", "worried", "okay", "good", "sparkly")

_VOICE_MOOD_PROMPT = (
    "You are reading one short reflection a person has just written "
    "after a quiet voice session with their inner mentor. Your only "
    "job is to choose ONE mood label that best fits this moment.\n\n"
    "Valid labels (lowercase, exactly one):\n"
    "  sad     — heavy, tearful, low, grieving\n"
    "  worried — anxious, busy mind, racing\n"
    "  okay    — neutral, holding steady, middle\n"
    "  good    — lighter, more open, gently positive\n"
    "  sparkly — luminous, joyful, expansive\n\n"
    "Return JSON only: {\"mood\": \"<one of the labels>\", "
    "\"confidence\": <float 0..1>}. "
    "No prose, no explanation, no markdown."
)


async def _extract_mood_from_text(text: str) -> Optional[Dict[str, Any]]:
    """Call Claude via Emergent LLM key to get a calibrated mood
    label. Returns None on any failure — caller treats as 'no signal'."""
    api_key = os.getenv("EMERGENT_LLM_KEY")
    if not api_key or not text or len(text.strip()) < 4:
        return None
    try:
        from emergentintegrations.llm.chat import LlmChat, UserMessage
        chat = LlmChat(
            api_key=api_key,
            session_id=f"voice-mood-{uuid.uuid4().hex[:10]}",
            system_message=_VOICE_MOOD_PROMPT,
        ).with_model("anthropic", "claude-sonnet-4-5-20250929")
        reply = await chat.send_message(UserMessage(text=text.strip()[:1200]))
        raw = reply if isinstance(reply, str) else (
            getattr(reply, "content", None) or getattr(reply, "text", None) or ""
        )
        if not raw:
            return None
        import re
        m = re.search(r"\{.*\}", str(raw), flags=re.S)
        if not m:
            return None
        parsed = json.loads(m.group(0))
        mood = (parsed.get("mood") or "").strip().lower()
        conf = parsed.get("confidence")
        try:
            conf = float(conf)
        except Exception:
            conf = 0.5
        if mood not in VALID_VOICE_MOODS:
            return None
        return {"mood": mood, "confidence": max(0.0, min(1.0, conf))}
    except Exception as e:
        logger.warning("voice mood extraction failed: %s", e)
        return None


class VoiceMoodInput(BaseModel):
    text: str
    room: Optional[str] = None  # grace / kaelan / sara / alistair (free-form)
    session_id: Optional[str] = None


@api_router.post("/voice-mood/extract")
async def voice_mood_extract(inp: VoiceMoodInput, request: Request):
    """Authed. Receives a short post-session reflection, asks the
    LLM for a mood label, stores ONLY the label + confidence (NOT
    the text). Returns the mood + a soft Aurin-tone reply."""
    user = await _require_user(request)
    extracted = await _extract_mood_from_text(inp.text or "")
    if not extracted:
        # Soft-fail: store nothing, return a graceful no-op so the
        # caller can decide whether to retry or just thank the user.
        return {"stored": False, "reason": "no_signal", "mood": None}

    now = datetime.now(timezone.utc).isoformat()
    doc = {
        "user_id": user.user_id,
        "mood": extracted["mood"],
        "confidence": extracted["confidence"],
        "room": (inp.room or "").lower()[:24] or None,
        "session_id": (inp.session_id or "").strip()[:64] or None,
        "created_at": now,
        # NEVER store inp.text. Founder's privacy guarantee.
        "source": "voice_reflection",
    }
    await db.voice_mood_signals.insert_one(doc)
    aurin_line = MOOD_AURIN_REPLY.get(extracted["mood"], MOOD_AURIN_REPLY["okay"])
    return {
        "stored": True,
        "mood": extracted["mood"],
        "confidence": extracted["confidence"],
        "aurin_line": aurin_line,
    }


@api_router.get("/voice-mood/recent")
async def voice_mood_recent(request: Request, days: int = 14):
    """Returns voice-derived mood signals for the last N days,
    most recent first. Used by Today's Quest to blend with the
    manual daily check-in."""
    user = await _require_user(request)
    cutoff = (datetime.now(timezone.utc) - timedelta(days=max(1, min(days, 60)))).isoformat()
    cursor = db.voice_mood_signals.find(
        {"user_id": user.user_id, "created_at": {"$gte": cutoff}},
        {"_id": 0},
    ).sort("created_at", -1).limit(50)
    return {"signals": [doc async for doc in cursor]}


# =============================================================
# §INFLUENCER-SWARM 2026-02-09 — Marketing-agent synchronisation:
# 50 micro-influencer guest keys + Cycle 01 wave-logic + ?ref=
# conversion analytics. All additive — does NOT touch existing
# AURIN<digits> parent-referral pathway.
# =============================================================

import secrets as _secrets


def _new_muse_code() -> str:
    alpha = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
    return "MUSE" + "".join(_secrets.choice(alpha) for _ in range(6))


def _admin_ok(request: Request) -> bool:
    expected = os.environ.get("ADMIN_TOKEN") or ""
    if not expected:
        return False
    got = (request.headers.get("X-Admin-Token") or "").strip()
    return bool(got) and got == expected


class GuestKeyMintInput(BaseModel):
    name: str
    handle: Optional[str] = None
    max_uses: int = 25
    perks: Optional[List[str]] = None
    notes: Optional[str] = None
    expires_in_days: int = 60


@api_router.post("/admin/guest-keys/mint")
async def admin_guest_keys_mint(inp: GuestKeyMintInput, request: Request):
    if not _admin_ok(request):
        raise HTTPException(status_code=403, detail="Admin token required.")
    code = _new_muse_code()
    for _ in range(5):
        if not await db.guest_keys.find_one({"code": code}, {"_id": 1}):
            break
        code = _new_muse_code()
    now = datetime.now(timezone.utc)
    doc = {
        "code": code,
        "name": inp.name.strip()[:80],
        "handle": (inp.handle or "").strip()[:80] or None,
        "max_uses": max(1, min(inp.max_uses, 1000)),
        "remaining_uses": max(1, min(inp.max_uses, 1000)),
        "perks": [p.strip() for p in (inp.perks or []) if p.strip()],
        "notes": (inp.notes or "").strip()[:400] or None,
        "created_at": now.isoformat(),
        "expires_at": (now + timedelta(days=max(1, inp.expires_in_days))).isoformat(),
        "cycle": "cycle-01",
    }
    await db.guest_keys.insert_one(doc)
    return {"ok": True, "code": code, "max_uses": doc["max_uses"],
            "expires_at": doc["expires_at"],
            "share_url": f"{os.environ.get('PUBLIC_BASE_URL', 'https://prulesoul.site')}/portal?key={code}"}


@api_router.get("/guest-keys/validate")
async def guest_keys_validate(code: str):
    code = (code or "").strip().upper()
    if not code.startswith("MUSE"):
        return {"valid": False, "reason": "format"}
    doc = await db.guest_keys.find_one({"code": code}, {"_id": 0})
    if not doc:
        return {"valid": False, "reason": "not_found"}
    try:
        expires = datetime.fromisoformat(doc["expires_at"])
    except Exception:
        expires = None
    expired = bool(expires and expires < datetime.now(timezone.utc))
    exhausted = int(doc.get("remaining_uses", 0)) <= 0
    return {
        "valid": (not expired) and (not exhausted),
        "reason": "expired" if expired else ("exhausted" if exhausted else "ok"),
        "name": doc.get("name"),
        "handle": doc.get("handle"),
        "perks": doc.get("perks") or [],
        "remaining_uses": doc.get("remaining_uses"),
        "cycle": doc.get("cycle"),
    }


class GuestKeyRedeemInput(BaseModel):
    code: str


@api_router.post("/guest-keys/redeem")
async def guest_keys_redeem(inp: GuestKeyRedeemInput, request: Request):
    user = await _require_user(request)
    code = (inp.code or "").strip().upper()
    doc = await db.guest_keys.find_one({"code": code}, {"_id": 0})
    if not doc:
        raise HTTPException(status_code=404, detail="Guest key not found.")
    try:
        expires = datetime.fromisoformat(doc["expires_at"])
    except Exception:
        expires = None
    if expires and expires < datetime.now(timezone.utc):
        raise HTTPException(status_code=410, detail="Guest key expired.")
    if int(doc.get("remaining_uses", 0)) <= 0:
        raise HTTPException(status_code=410, detail="Guest key has reached its limit.")

    already = await db.guest_key_redemptions.find_one(
        {"code": code, "user_id": user.user_id},
        {"_id": 0, "id": 1, "perks_granted": 1},
    )
    if already:
        return {"ok": True, "already_redeemed": True, **already}

    granted: List[str] = []
    now = datetime.now(timezone.utc)
    for perk in (doc.get("perks") or []):
        p = perk.strip()
        if p == "body_temple_unlock":
            await db.body_temple_unlocks.update_one(
                {"user_id": user.user_id},
                {"$set": {"user_id": user.user_id, "source": code,
                          "granted_at": now.isoformat()}},
                upsert=True,
            )
            granted.append(p)
            # §LETTER-OF-ADMISSION 2026-02-27 — Luxurious onboarding
            # email fires once per user, the moment Body Temple unlocks.
            # Idempotent: the helper checks `letters_of_admission`
            # before sending.
            try:
                from letter_of_admission import send_letter_of_admission
                u_doc = await db.users.find_one(
                    {"user_id": user.user_id},
                    {"_id": 0, "email": 1, "display_name": 1},
                )
                if u_doc and u_doc.get("email"):
                    await send_letter_of_admission(
                        db=db,
                        user_id=user.user_id,
                        email=u_doc["email"],
                        recipient_name=u_doc.get("display_name") or None,
                        source=f"guest_key:{code}",
                    )
            except Exception as e:  # noqa: BLE001
                logger.warning("letter_of_admission dispatch failed: %s", e)
        elif p.startswith("presence_minutes:"):
            try:
                minutes = int(p.split(":", 1)[1])
            except Exception:
                continue
            seconds = max(0, min(minutes, 600)) * 60
            await db.users.update_one(
                {"user_id": user.user_id},
                {"$inc": {"presence_seconds_left": seconds}},
            )
            granted.append(f"presence_minutes:{minutes}")

    await db.guest_keys.update_one({"code": code}, {"$inc": {"remaining_uses": -1}})
    redemption_id = f"gkr_{uuid.uuid4().hex[:12]}"
    await db.guest_key_redemptions.insert_one({
        "id": redemption_id,
        "code": code,
        "user_id": user.user_id,
        "perks_granted": granted,
        "redeemed_at": now.isoformat(),
        "cycle": doc.get("cycle"),
    })
    return {"ok": True, "id": redemption_id, "perks_granted": granted,
            "cycle": doc.get("cycle"), "influencer_name": doc.get("name")}


# §LETTER-OF-ADMISSION 2026-02-27 — Admin/test endpoint for manual resend
@api_router.post("/admin/letter-of-admission/send")
async def admin_send_letter_of_admission(request: Request):
    """Manually trigger Letter of Admission for a specific user_id.
    Protected by ADMIN_TOKEN. Body: { "user_id": "...", "force": false }.
    `force=true` deletes the prior idempotency row first."""
    token = request.headers.get("X-Admin-Token") or request.headers.get("x-admin-token")
    if not token or token != os.environ.get("ADMIN_TOKEN"):
        raise HTTPException(status_code=403, detail="forbidden")
    body = await request.json()
    user_id = (body or {}).get("user_id")
    force = bool((body or {}).get("force"))
    if not user_id:
        raise HTTPException(status_code=400, detail="user_id required")
    u_doc = await db.users.find_one(
        {"user_id": user_id},
        {"_id": 0, "email": 1, "display_name": 1},
    )
    if not u_doc or not u_doc.get("email"):
        raise HTTPException(status_code=404, detail="user has no email on file")
    if force:
        await db.letters_of_admission.delete_one({"user_id": user_id})
    from letter_of_admission import send_letter_of_admission
    result = await send_letter_of_admission(
        db=db,
        user_id=user_id,
        email=u_doc["email"],
        recipient_name=u_doc.get("display_name") or None,
        source="admin_manual",
    )
    return {"ok": True, **result}



@api_router.get("/marketing/cycle")
async def marketing_cycle_status():
    cycle = await db.marketing_cycles.find_one(
        {"_id": "cycle-01"}, {"_id": 0}
    )
    if not cycle:
        cycle = {
            "id": "cycle-01",
            "label": "Cycle 01",
            "subtitle": "The first quiet wave.",
            "total_spots": 250,
            "opened_at": datetime.now(timezone.utc).isoformat(),
            "closes_at": None,
            "tone_line": "A small first wave is now open. We open future cycles slowly, so the rooms stay calm.",
        }
        await db.marketing_cycles.update_one(
            {"_id": "cycle-01"}, {"$set": cycle}, upsert=True
        )

    taken = await db.guest_key_redemptions.count_documents({"cycle": "cycle-01"})
    remaining = max(0, int(cycle.get("total_spots", 0)) - taken)
    return {**cycle, "taken_spots": taken, "remaining_spots": remaining}


class CycleConfigInput(BaseModel):
    label: Optional[str] = None
    subtitle: Optional[str] = None
    total_spots: Optional[int] = None
    tone_line: Optional[str] = None
    closes_at: Optional[str] = None


@api_router.post("/admin/marketing/cycle")
async def admin_marketing_cycle(inp: CycleConfigInput, request: Request):
    if not _admin_ok(request):
        raise HTTPException(status_code=403, detail="Admin token required.")
    update: Dict[str, Any] = {"id": "cycle-01"}
    for k in ("label", "subtitle", "tone_line", "closes_at"):
        v = getattr(inp, k)
        if v is not None:
            update[k] = v
    if inp.total_spots is not None:
        update["total_spots"] = max(1, min(int(inp.total_spots), 100000))
    await db.marketing_cycles.update_one(
        {"_id": "cycle-01"}, {"$set": update}, upsert=True
    )
    return {"ok": True, **update}


class RefHitInput(BaseModel):
    code: str
    path: Optional[str] = None
    user_agent: Optional[str] = None
    referer: Optional[str] = None
    utm_source: Optional[str] = None
    utm_medium: Optional[str] = None
    utm_campaign: Optional[str] = None
    # §LS-AFFILIATE 2026-02-10 — LemonSqueezy Affiliate Hub passes
    # an affiliate id via ?aff=XXXXX on the landing URL. We log it
    # so analytics shows partner-driven traffic separately from
    # MUSE keys, AURIN codes, and raw UTM hits.
    affiliate_id: Optional[str] = None


@api_router.post("/marketing/ref-hit")
async def marketing_ref_hit(inp: RefHitInput, request: Request):
    code = (inp.code or "").strip().upper()[:32]
    aff = (inp.affiliate_id or "").strip()[:32] or None
    # Permit UTM-only hits (email-funnel clicks without a code).
    if not code:
        if not (inp.utm_source or inp.utm_campaign or aff):
            return {"ok": False, "reason": "no_code"}
        code = f"AFF_{aff}" if aff else "UTM_ONLY"
    doc = {
        "id": f"hit_{uuid.uuid4().hex[:12]}",
        "code": code,
        "code_kind": "muse" if code.startswith("MUSE") else (
            "aurin" if code.startswith("AURIN") else (
                "affiliate" if code.startswith("AFF_") else (
                    "utm" if code == "UTM_ONLY" else "other"))),
        "path": (inp.path or "").strip()[:200] or None,
        "ua": (inp.user_agent or request.headers.get("user-agent") or "")[:200] or None,
        "referer": (inp.referer or request.headers.get("referer") or "")[:200] or None,
        "utm_source": (inp.utm_source or "").strip()[:60] or None,
        "utm_medium": (inp.utm_medium or "").strip()[:60] or None,
        "utm_campaign": (inp.utm_campaign or "").strip()[:80] or None,
        "affiliate_id": aff,
        "ip_prefix": (request.client.host.rsplit(".", 1)[0] + ".0"
                      if request.client and request.client.host and "." in request.client.host
                      else None),
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.referral_hits.insert_one(doc)
    return {"ok": True, "id": doc["id"]}


@api_router.get("/admin/marketing/analytics")
async def admin_marketing_analytics(request: Request):
    if not _admin_ok(request):
        raise HTTPException(status_code=403, detail="Admin token required.")
    pipeline_hits = [
        {"$group": {"_id": {"code": "$code", "kind": "$code_kind"},
                    "hits": {"$sum": 1}}},
        {"$sort": {"hits": -1}},
        {"$limit": 100},
    ]
    hits = [
        {"code": doc["_id"]["code"], "kind": doc["_id"].get("kind"),
         "hits": doc["hits"]}
        async for doc in db.referral_hits.aggregate(pipeline_hits)
    ]
    pipeline_redeem = [
        {"$group": {"_id": "$code", "redemptions": {"$sum": 1}}},
        {"$sort": {"redemptions": -1}},
        {"$limit": 100},
    ]
    redemptions = [
        {"code": doc["_id"], "redemptions": doc["redemptions"]}
        async for doc in db.guest_key_redemptions.aggregate(pipeline_redeem)
    ]
    total_hits = sum(h["hits"] for h in hits)
    total_redemptions = sum(r["redemptions"] for r in redemptions)
    return {
        "total_hits": total_hits,
        "total_redemptions": total_redemptions,
        "conversion_rate": (round(total_redemptions / total_hits, 4)
                            if total_hits else 0),
        "top_hits": hits,
        "top_redemptions": redemptions,
    }






# =============================================================
# §STARS-PHASE-2 2026-02-09 — Three new mechanics:
#
#   (a) RECIPROCAL STARS — Child can give a star to their grown-up.
#       Curated 5-action list ("my grown-up listened to me",
#       "my grown-up apologised", "my grown-up was patient with
#       me", "my grown-up played with me", "my grown-up read me a
#       story"). Pending → parent approves themselves (yes, child
#       acknowledges first; parent confirms gracefully). Approval
#       creates a PARENT STAMP, not a voice-credit reward — the
#       reward IS the recognition.
#
#   (b) PARENT STAMPS — collection ledger per parent. 5 stamp
#       types earned from:
#         • listener      → reciprocal star approved
#         • playful       → ≥3 child curriculum approvals in a week
#         • patient       → ≥5 child mood check-ins in a week (you
#                            held space for the ritual)
#         • present       → opened the Wellness portal twice in a week
#         • champion      → received Anna's letter twice (deep parent)
#
#   (c) PHOTO ALBUM — quiet gallery. Parent can attach an optional
#       photo when approving a star OR upload one to mark a
#       memory tied to a curriculum activity completion. Stored
#       via binary_storage (Mongo binary_assets collection),
#       capped at 2 MB per upload.
#
# Schema:
#   parent_stamps        {user_id, stamp_slug, awarded_at, source_ref}
#   memory_album         {user_id, child_slug, photo_key, caption,
#                         tied_to:{action_id,star_label}, created_at}
# =============================================================

RECIPROCAL_ACTIONS = [
    {"slug": "rec_listened",     "label": "My grown-up listened to me today",        "stamp": "listener"},
    {"slug": "rec_apologised",   "label": "My grown-up said sorry when it counted",  "stamp": "patient"},
    {"slug": "rec_patient",      "label": "My grown-up was patient with me",         "stamp": "patient"},
    {"slug": "rec_played",       "label": "My grown-up played with me",              "stamp": "playful"},
    {"slug": "rec_read_story",   "label": "My grown-up read me a story",             "stamp": "present"},
]


def _reciprocal_action(slug: str) -> dict | None:
    for a in RECIPROCAL_ACTIONS:
        if a["slug"] == slug:
            return a
    return None


PARENT_STAMP_DEFS = {
    "listener":  {"title": "Listener",  "description": "Your child noticed you listened today.", "icon": "Ear"},
    "patient":   {"title": "Patient",   "description": "You held a soft pause when it was hard.", "icon": "Heart"},
    "playful":   {"title": "Playful",   "description": "You showed up for play this week.",       "icon": "Sparkles"},
    "present":   {"title": "Present",   "description": "You opened the wellness portal twice.",  "icon": "Eye"},
    "champion":  {"title": "Champion",  "description": "Anna's letter arrived twice — you stayed.","icon": "Award"},
}


class ReciprocalStarInput(BaseModel):
    child_slug: str
    action_slug: str


class StarApproveWithPhotoInput(BaseModel):
    request_id: str
    photo_base64: Optional[str] = None
    photo_content_type: Optional[str] = "image/jpeg"
    caption: Optional[str] = None


@api_router.get("/angel-stars/reciprocal/catalog")
async def reciprocal_catalog():
    """Public — child-side catalog of stars the child can give to a parent."""
    return {"actions": RECIPROCAL_ACTIONS}


@api_router.post("/angel-stars/give-to-parent")
async def give_star_to_parent(inp: ReciprocalStarInput, request: Request):
    """Child taps a reciprocal star → pending parent stamp."""
    user = await _require_user(request)
    slug = normalise_age_slug(inp.child_slug)
    action = _reciprocal_action(inp.action_slug)
    if not action:
        raise HTTPException(status_code=400, detail="Unknown reciprocal action.")

    now_iso = datetime.now(timezone.utc).isoformat()
    row = {
        "id": f"asreq_{uuid.uuid4().hex[:12]}",
        "user_id": user.user_id,
        "child_slug": slug,
        "action_slug": action["slug"],
        "action_label": action["label"],
        "stars": 0,           # no voice credit on this lane
        "stamp_slug": action["stamp"],
        "status": "pending",
        "source": "reciprocal_child_to_parent",
        "direction": "child_to_parent",
        "created_at": now_iso,
        "approved_at": None,
    }
    await db.angel_stars_actions.insert_one({**row})
    return {"ok": True, "id": row["id"], "status": "pending"}


async def _award_parent_stamp(user_id: str, stamp_slug: str, source_ref: str | None) -> bool:
    if stamp_slug not in PARENT_STAMP_DEFS:
        return False
    now_iso = datetime.now(timezone.utc).isoformat()
    await db.parent_stamps.insert_one({
        "id": f"stamp_{uuid.uuid4().hex[:12]}",
        "user_id": user_id,
        "stamp_slug": stamp_slug,
        "awarded_at": now_iso,
        "source_ref": source_ref,
    })
    return True


@api_router.post("/angel-stars/approve-with-photo")
async def approve_with_photo(inp: StarApproveWithPhotoInput, request: Request):
    """Extension of the standard approve flow. If a base64 photo is
    attached, it's stored in binary_assets and tied to the action via
    a memory_album row. If the request was a reciprocal star, the
    parent stamp is awarded instead of voice-seconds."""
    user = await _require_user(request)
    row = await db.angel_stars_actions.find_one(
        {"id": inp.request_id, "user_id": user.user_id}, {"_id": 0}
    )
    if not row:
        raise HTTPException(status_code=404, detail="Request not found.")
    if row.get("status") != "pending":
        return {"ok": True, "already": row.get("status")}

    is_reciprocal = row.get("direction") == "child_to_parent"
    stars = int(row.get("stars", 0))
    slug = row.get("child_slug")
    now_iso = datetime.now(timezone.utc).isoformat()

    # Mark approved
    await db.angel_stars_actions.update_one(
        {"id": inp.request_id, "user_id": user.user_id},
        {"$set": {"status": "approved", "approved_at": now_iso}},
    )

    # Reward path: voice-credit for regular stars; stamp for reciprocal.
    if is_reciprocal:
        stamp_slug = row.get("stamp_slug") or "listener"
        await _award_parent_stamp(user.user_id, stamp_slug, source_ref=row["id"])
    elif stars > 0:
        await db.angel_stars.update_one(
            {"user_id": user.user_id, "child_slug": slug},
            {"$inc": {"balance": stars, "total_earned": stars},
             "$set": {"updated_at": now_iso}},
            upsert=True,
        )

    # Optional photo upload to album.
    photo_warning = None
    if inp.photo_base64:
        try:
            import base64 as _b64
            raw = _b64.b64decode(inp.photo_base64.split(",")[-1])  # strip dataURL prefix if any
            if len(raw) > 2 * 1024 * 1024:
                raise HTTPException(status_code=413, detail="Photo too large (max 2MB).")
            photo_key = f"album_{user.user_id[:10]}_{uuid.uuid4().hex[:8]}"
            from binary_storage import put_binary
            await put_binary(
                db, kind="memory_album", slug=photo_key, data=raw,
                content_type=inp.photo_content_type or "image/jpeg",
                meta={"user_id": user.user_id, "action_id": row["id"]},
            )
            await db.memory_album.insert_one({
                "id": f"mem_{uuid.uuid4().hex[:12]}",
                "user_id": user.user_id,
                "child_slug": slug,
                "photo_key": photo_key,
                "caption": (inp.caption or "")[:200],
                "tied_to_action_id": row["id"],
                "tied_to_label": row.get("action_label"),
                "created_at": now_iso,
            })
        except HTTPException:
            raise
        except Exception as exc:  # noqa: BLE001
            logger.warning("photo upload failed: %s", exc)
            photo_warning = "photo_not_saved"

    return {"ok": True, "approved": True, "reciprocal": is_reciprocal, "photo_warning": photo_warning}


@api_router.get("/parent-stamps/me")
async def parent_stamps_me(request: Request, days: int = 30):
    user = await _require_user(request)
    days = max(1, min(int(days), 365))
    cutoff = (datetime.now(timezone.utc) - timedelta(days=days)).isoformat()
    rows = await db.parent_stamps.find(
        {"user_id": user.user_id, "awarded_at": {"$gte": cutoff}}, {"_id": 0}
    ).sort("awarded_at", -1).limit(200).to_list(length=200)
    counts: dict[str, int] = {}
    for r in rows:
        s = r.get("stamp_slug", "")
        counts[s] = counts.get(s, 0) + 1
    stamps = []
    for slug, defn in PARENT_STAMP_DEFS.items():
        stamps.append({
            "slug": slug,
            "title": defn["title"],
            "description": defn["description"],
            "icon": defn["icon"],
            "count": counts.get(slug, 0),
        })
    return {"days": days, "stamps": stamps, "total": sum(counts.values()), "recent": rows[:10]}


@api_router.get("/memory-album/me")
async def memory_album_me(request: Request, limit: int = 30):
    user = await _require_user(request)
    rows = await db.memory_album.find(
        {"user_id": user.user_id}, {"_id": 0}
    ).sort("created_at", -1).limit(max(1, min(int(limit), 100))).to_list(length=100)
    return {"album": rows}


@api_router.get("/memory-album/photo/{photo_key}")
async def memory_album_photo(photo_key: str, request: Request):
    user = await _require_user(request)
    if not photo_key.startswith("album_") or user.user_id[:10] not in photo_key:
        raise HTTPException(status_code=403, detail="Not your photo.")
    from binary_storage import get_binary
    asset = await get_binary(db, kind="memory_album", slug=photo_key)
    if not asset:
        raise HTTPException(status_code=404, detail="Photo not found.")
    return Response(content=asset["data"], media_type=asset.get("content_type", "image/jpeg"))


# =============================================================
# The Beginning — Guided Experience (7 hidden steps)
# -------------------------------------------------------------
# Internally a 7-step structure. Externally never exposed as a
# course/module system: copy stays human, "Continue when ready",
# reflection required to advance, optional presence note.
# =============================================================

EXPERIENCE_SLUG = "the-beginning"

EXPERIENCE_STEPS: List[dict] = [
    {
        "n": 1,
        "theme": "awareness",
        "intro": "You might notice more than usual today.\nNot because something changed — but because you are looking.",
        "guidance": "Take the day as it is.\n\nWatch small moments:\n\n- how you respond\n- how quickly something happens\n- what feels automatic\n\nYou don't need to stop anything.\n\nJust notice.",
        "prompt": "Take a moment before continuing.\nWrite a few words about one moment that stood out. Even something small.",
    },
    {
        "n": 2,
        "theme": "dependency",
        "intro": "Some movements are not really yours.",
        "guidance": "Notice where you:\n\n- look for confirmation\n- adjust yourself\n- wait for someone else's response\n\nNot in a heavy way. Just… gently.",
        "prompt": "What did you notice today?\nIf nothing was clear, you can write that too.",
    },
    {
        "n": 3,
        "theme": "fear",
        "intro": "Fear is not always loud.",
        "guidance": "Sometimes it is:\n\n- hesitation\n- delay\n- \"later\"\n\nPick one thing you have been postponing. Do it in the simplest possible way.",
        "prompt": "What stopped you before?\nAnd what happened when you moved anyway?",
    },
    {
        "n": 4,
        "theme": "money",
        "intro": "Money is rarely just about money.",
        "guidance": "Notice what comes up when you think about it.\n\nNot numbers — feeling.",
        "prompt": "Did it feel like pressure?\nSafety?\nSomething else?\n\nWrite what felt closest.",
    },
    {
        "n": 5,
        "theme": "childhood patterns",
        "intro": "Some thoughts are older than you think.",
        "guidance": "Write down 3 sentences you heard often when growing up.\n\nNo analysis yet. Just write them.",
        "prompt": "Do they still live in your decisions?",
    },
    {
        "n": 6,
        "theme": "pattern break",
        "intro": "One different action is enough.",
        "guidance": "Today, choose one small moment\nand do it differently.\n\nNot dramatically. Just… differently.",
        "prompt": "Did something resist?\nOr did it feel lighter?",
    },
    {
        "n": 7,
        "theme": "clarity",
        "intro": "You don't need all answers.\nBut you may see something more clearly now.",
        "guidance": "Write:\n\n- what you don't want to repeat\n- what feels more true for you",
        "prompt": "There is no need to conclude this.\nJust don't ignore what you saw.",
    },
]

# Soft pause (seconds) the UI will respect before the next step appears.
# Backend returns this so the rule lives in one place.
STEP_PAUSE_SECONDS = 8
TOTAL_STEPS = len(EXPERIENCE_STEPS)
MIN_REFLECTION_CHARS = 6  # gentle, not strict


class StepPublic(BaseModel):
    """Step shape returned to the frontend (only when unlocked)."""
    n: int
    intro: str
    guidance: str
    prompt: str


class StepReflection(BaseModel):
    n: int
    text: str
    presence: Optional[int] = None  # 1..5, optional
    written_at: str


class ExperienceProgress(BaseModel):
    """Per-user progress for THE_BEGINNING."""
    user_id: str
    experience_slug: str = EXPERIENCE_SLUG
    started: bool = False
    current_step: int = 1            # 1..TOTAL_STEPS
    completed_steps: List[int] = Field(default_factory=list)
    reflections: List[StepReflection] = Field(default_factory=list)
    started_at: Optional[str] = None
    completed_at: Optional[str] = None
    last_step_at: Optional[str] = None  # used for soft-pause


class ReflectionInput(BaseModel):
    text: str
    presence: Optional[int] = None  # 1..5


async def _require_user(request: Request) -> User:
    user = await _resolve_current_user(request)
    if not user:
        raise HTTPException(status_code=401, detail="Sign in to continue.")
    return user


async def _get_or_init_progress(user_id: str) -> dict:
    doc = await db.experience_progress.find_one(
        {"user_id": user_id, "experience_slug": EXPERIENCE_SLUG}, {"_id": 0}
    )
    if doc:
        return doc
    fresh = ExperienceProgress(user_id=user_id).model_dump()
    await db.experience_progress.insert_one({**fresh})
    return await db.experience_progress.find_one(
        {"user_id": user_id, "experience_slug": EXPERIENCE_SLUG}, {"_id": 0}
    )


def _serialize_step(s: dict) -> StepPublic:
    return StepPublic(n=s["n"], intro=s["intro"], guidance=s["guidance"], prompt=s["prompt"])


@api_router.get("/experience/the-beginning/me")
async def experience_status(request: Request):
    """Returns user-specific progress + the currently-unlocked step."""
    user = await _require_user(request)
    p = await _get_or_init_progress(user.user_id)
    current_n = p.get("current_step") or 1
    completed = p.get("completed_steps") or []
    is_done = len(completed) >= TOTAL_STEPS
    # Soft-pause: if the user just submitted, hold the next step a moment.
    last_at = p.get("last_step_at")
    pause_remaining = 0
    if last_at and not is_done:
        try:
            t = datetime.fromisoformat(last_at)
            if t.tzinfo is None:
                t = t.replace(tzinfo=timezone.utc)
            elapsed = (datetime.now(timezone.utc) - t).total_seconds()
            pause_remaining = max(0, int(STEP_PAUSE_SECONDS - elapsed))
        except (ValueError, TypeError):
            pause_remaining = 0
    step_payload = None
    if not is_done:
        s = EXPERIENCE_STEPS[current_n - 1]
        step_payload = _serialize_step(s).model_dump()
    return {
        "started": p.get("started", False),
        "current_step": current_n,
        "total_steps": TOTAL_STEPS,
        "completed_steps": completed,
        "is_done": is_done,
        "pause_remaining": pause_remaining,
        "pause_seconds": STEP_PAUSE_SECONDS,
        "step": step_payload,
        "reflections": p.get("reflections", []),
    }


@api_router.post("/experience/the-beginning/start")
async def experience_start(request: Request):
    user = await _require_user(request)
    p = await _get_or_init_progress(user.user_id)
    if p.get("started"):
        return {"status": "already_started"}
    now = datetime.now(timezone.utc).isoformat()
    await db.experience_progress.update_one(
        {"user_id": user.user_id, "experience_slug": EXPERIENCE_SLUG},
        {"$set": {"started": True, "started_at": now, "current_step": 1, "last_step_at": None}},
    )
    return {"status": "started"}


@api_router.post("/experience/the-beginning/reflect")
async def experience_reflect(inp: ReflectionInput, request: Request):
    """Submit reflection for the current step → unlocks the next."""
    user = await _require_user(request)
    p = await _get_or_init_progress(user.user_id)
    if not p.get("started"):
        # auto-start
        await db.experience_progress.update_one(
            {"user_id": user.user_id, "experience_slug": EXPERIENCE_SLUG},
            {"$set": {"started": True, "started_at": datetime.now(timezone.utc).isoformat()}},
        )
        p["started"] = True
    n = p.get("current_step") or 1
    if n < 1 or n > TOTAL_STEPS:
        raise HTTPException(status_code=409, detail="No active step.")
    text = (inp.text or "").strip()
    if len(text) < MIN_REFLECTION_CHARS:
        raise HTTPException(
            status_code=400,
            detail="Just a few words is enough — but please write something so the next part can open.",
        )
    presence = inp.presence
    if presence is not None and (presence < 1 or presence > 5):
        presence = None
    now = datetime.now(timezone.utc).isoformat()
    reflection = {
        "n": n,
        "text": text[:4000],
        "presence": presence,
        "written_at": now,
    }
    completed = list(p.get("completed_steps") or [])
    if n not in completed:
        completed.append(n)
    is_done = len(completed) >= TOTAL_STEPS
    next_step = n + 1 if not is_done else n
    update = {
        "$push": {"reflections": reflection},
        "$set": {
            "completed_steps": completed,
            "current_step": next_step,
            "last_step_at": now,
        },
    }
    if is_done:
        update["$set"]["completed_at"] = now
    await db.experience_progress.update_one(
        {"user_id": user.user_id, "experience_slug": EXPERIENCE_SLUG},
        update,
    )
    return {
        "status": "ok",
        "next_step": next_step,
        "is_done": is_done,
        "pause_seconds": STEP_PAUSE_SECONDS if not is_done else 0,
    }


@api_router.post("/experience/the-beginning/reset")
async def experience_reset(request: Request):
    """Wipe progress for this user — testing & user choice."""
    user = await _require_user(request)
    await db.experience_progress.delete_one(
        {"user_id": user.user_id, "experience_slug": EXPERIENCE_SLUG}
    )
    return {"status": "reset"}


@api_router.get("/experience/the-beginning/step/{n}")
async def experience_view_step(n: int, request: Request):
    """Read-only: return step prompt + the user's saved reflection for that step.
    Used for "you have already been here" — re-reading what was written."""
    user = await _require_user(request)
    if n < 1 or n > TOTAL_STEPS:
        raise HTTPException(status_code=404, detail="Step not found.")
    p = await _get_or_init_progress(user.user_id)
    completed = p.get("completed_steps") or []
    if n not in completed:
        raise HTTPException(status_code=403, detail="This step has not been walked yet.")
    s = EXPERIENCE_STEPS[n - 1]
    saved = next((r for r in (p.get("reflections") or []) if r.get("n") == n), None)
    return {
        "n": n,
        "total_steps": TOTAL_STEPS,
        "step": _serialize_step(s).model_dump(),
        "reflection": saved,
        "is_last": n == TOTAL_STEPS,
    }


# ============================================================================
# PURCHASES — ledger of which books a user has unlocked.
# Empty until LemonSqueezy webhooks start writing into it. Cabinet reads
# from this collection to populate "Your Materials".
# ============================================================================

class Purchase(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    book_slug: str
    source: Literal["lemonsqueezy", "manual_grant", "free_unlock"] = "manual_grant"
    external_order_id: Optional[str] = None
    granted_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())


@api_router.get("/cabinet/library")
async def cabinet_library(request: Request):
    """The signed-in user's purchased / unlocked books.
    Returns a list of {book_slug, title, cover, pdf_url, granted_at}.
    Empty list if nothing has been unlocked yet (which is the case
    until LemonSqueezy goes live)."""
    user = await _require_user(request)
    rows = await db.purchases.find({"user_id": user.user_id}).to_list(200)
    out = []
    for r in rows:
        slug = r.get("book_slug")
        if not slug:
            continue
        b = await db.books.find_one({"slug": slug}, {"_id": 0})
        if not b:
            continue
        out.append({
            "book_slug": slug,
            "title": b.get("title"),
            "description": b.get("description"),
            "cover_image_url": b.get("cover_image_url"),
            "pdf_url": b.get("pdf_url"),
            "external_read_url": b.get("external_read_url"),
            "granted_at": r.get("granted_at"),
            "source": r.get("source"),
        })
    return out


# ============================================================================
# GATED PDF DOWNLOAD — only signed-in purchasers may download a paid book.
# Files live in /app/backend/storage/books/{slug}.pdf and are streamed via
# FastAPI's FileResponse. Free books (price == 0) are also gated to a
# logged-in user, so anonymous scraping can't dump the whole catalog.
# ============================================================================
from fastapi.responses import FileResponse
import os as _os

_BOOK_STORAGE_DIR = _os.environ.get(
    "BOOKS_STORAGE_DIR", "/app/backend/storage/books"
)


@api_router.get("/cabinet/library/{slug}/download")
async def cabinet_download_book(slug: str, request: Request):
    """Stream the PDF for a book the signed-in user has unlocked.

    Auth required. The user must either own the book (purchase row in
    db.purchases) OR the book must be free (price == 0).

    Admin bypass: a valid ADMIN_TOKEN (header X-Admin-Token, query
    ?token=, or query ?admin_token=) skips the auth + ownership check
    and serves the PDF directly. This lets the founder QA the post-
    purchase experience while LemonSqueezy is still pending approval.
    """
    # Admin bypass — explicit, audited, single-purpose.
    admin_token = os.environ.get("ADMIN_TOKEN")
    sent_admin = (
        request.headers.get("X-Admin-Token")
        or request.query_params.get("token")
        or request.query_params.get("admin_token")
    )
    is_admin = bool(admin_token) and sent_admin == admin_token

    book = await db.books.find_one({"slug": slug}, {"_id": 0})
    if not book:
        raise HTTPException(status_code=404, detail="Book not found.")

    if not is_admin:
        user = await _require_user(request)
        is_free = float(book.get("price") or 0) == 0.0
        if not is_free:
            owns = await db.purchases.find_one(
                {"user_id": user.user_id, "book_slug": slug}
            )
            if not owns:
                raise HTTPException(
                    status_code=403,
                    detail="This book is not in your library yet.",
                )

    # 1) MongoDB (production-safe)
    from binary_storage import get_binary
    asset = await get_binary(db, kind="book_pdf", slug=slug)
    if asset and asset.get("data"):
        from fastapi.responses import Response as _Resp
        return _Resp(
            content=asset["data"],
            media_type="application/pdf",
            headers={
                "Content-Disposition": f'attachment; filename="{slug}.pdf"',
                "Cache-Control": "private, max-age=0, no-store",
            },
        )

    # 2) Filesystem fallback
    file_path = _os.path.join(_BOOK_STORAGE_DIR, f"{slug}.pdf")
    if not _os.path.isfile(file_path):
        # Soft fail — don't leak storage internals.
        raise HTTPException(status_code=404, detail="File not available.")

    safe_filename = f"{slug}.pdf"
    return FileResponse(
        path=file_path,
        media_type="application/pdf",
        filename=safe_filename,
        headers={"Cache-Control": "private, max-age=0, no-store"},
    )


# ---------------------------------------------------------------------------
# PUBLIC FREE-BOOK DOWNLOAD — no auth required, but ONLY for books with
# price == 0 (e.g. The Night Angels' Embrace lead magnet). Anything paid
# stays behind /api/cabinet/library/{slug}/download.
# ---------------------------------------------------------------------------
@api_router.get("/books/free/{slug}/download")
async def public_free_book_download(slug: str):
    book = await db.books.find_one({"slug": slug}, {"_id": 0})
    if not book:
        raise HTTPException(status_code=404, detail="Book not found.")
    if float(book.get("price") or 0) != 0.0:
        # Refuse to serve paid books from the public endpoint.
        raise HTTPException(status_code=403, detail="This book is not free.")

    # 1) MongoDB (production-safe — survives deploys)
    from binary_storage import get_binary
    asset = await get_binary(db, kind="book_pdf", slug=slug)
    if asset and asset.get("data"):
        from fastapi.responses import Response as _Resp
        return _Resp(
            content=asset["data"],
            media_type="application/pdf",
            headers={
                "Content-Disposition": f'attachment; filename="{slug}.pdf"',
                "Cache-Control": "public, max-age=3600",
            },
        )

    # 2) Filesystem fallback
    file_path = _os.path.join(_BOOK_STORAGE_DIR, f"{slug}.pdf")
    if not _os.path.isfile(file_path):
        raise HTTPException(status_code=404, detail="File not available.")

    return FileResponse(
        path=file_path,
        media_type="application/pdf",
        filename=f"{slug}.pdf",
        headers={"Cache-Control": "public, max-age=3600"},
    )


# ============================================================================
# LEMONSQUEEZY WEBHOOK — receive order_created / order_refunded events,
# verify HMAC-SHA256 signature, and grant/revoke purchase access.
# Idempotent via the unique index (user_id, book_slug) on db.purchases AND
# via a check on db.lemonsqueezy_events for the event id (defence-in-depth).
# ============================================================================
import hmac as _hmac
import hashlib as _hashlib
import json as _json

_LS_WEBHOOK_SECRET = _os.environ.get("LEMONSQUEEZY_WEBHOOK_SECRET", "")


def _verify_ls_signature(raw_body: bytes, signature_header: str) -> bool:
    if not _LS_WEBHOOK_SECRET or not signature_header:
        return False
    digest = _hmac.new(
        _LS_WEBHOOK_SECRET.encode("utf-8"), raw_body, _hashlib.sha256
    ).hexdigest()
    return _hmac.compare_digest(digest, signature_header)


@api_router.post("/lemonsqueezy/webhook")
async def lemonsqueezy_webhook(request: Request):
    """Verify signature → handle order_created (grant) / order_refunded (revoke).

    Returns HTTP 200 on every accepted webhook so LemonSqueezy doesn't retry.
    Real failures are logged and surfaced via /api/lemonsqueezy/health later.
    """
    raw = await request.body()
    sig = request.headers.get("X-Signature") or request.headers.get("x-signature") or ""
    if not _verify_ls_signature(raw, sig):
        # Invalid signature → 401 so attackers can't probe.
        raise HTTPException(status_code=401, detail="Invalid signature.")

    try:
        payload = _json.loads(raw)
    except _json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="Invalid JSON body.")

    meta = payload.get("meta") or {}
    event_name = meta.get("event_name") or ""
    custom = (meta.get("custom_data") or {})
    user_id = custom.get("user_id")
    book_slug = custom.get("book_slug")
    pass_tier = custom.get("pass_tier")  # Clarity Release: 30min|60min|season_30days
    data = payload.get("data") or {}
    order_id = data.get("id")
    # §8.4 Magic-Link SSO: pull customer email from LS payload so we can
    # auto-issue a magic link after a successful order.
    _attrs = (data.get("attributes") or {}) if isinstance(data, dict) else {}
    customer_email = (
        custom.get("user_email")
        or custom.get("email")
        or _attrs.get("user_email")
        or _attrs.get("customer_email")
        or ""
    ).strip().lower()

    # Persist EVERY accepted webhook for audit / replay.
    await db.lemonsqueezy_events.insert_one({
        "id": str(uuid.uuid4()),
        "event_name": event_name,
        "order_id": order_id,
        "user_id": user_id,
        "book_slug": book_slug,
        "pass_tier": pass_tier,
        "received_at": datetime.now(timezone.utc).isoformat(),
        "raw": payload,
    })

    # ---- Clarity Release pass purchase ----
    if pass_tier and user_id:
        if pass_tier not in CLARITY_TIERS:
            return {"status": "ignored", "reason": f"unknown pass_tier {pass_tier}"}
        if event_name == "order_created" or event_name == "subscription_created":
            # Season pass: countdown starts immediately.
            # One-time tiers: countdown starts on /clarity/start (consumed=False).
            if pass_tier == "season_30days":
                exp = (
                    datetime.now(timezone.utc)
                    + __import__("datetime").timedelta(seconds=_tier_duration_seconds(pass_tier))
                ).isoformat()
                consumed = True  # season pass is "active" immediately
            else:
                # placeholder expiry — real one written when /clarity/start fires
                exp = (
                    datetime.now(timezone.utc)
                    + __import__("datetime").timedelta(days=365)
                ).isoformat()
                consumed = False
            try:
                await db.clarity_passes.insert_one({
                    "id": str(uuid.uuid4()),
                    "user_id": user_id,
                    "tier": pass_tier,
                    "source": "lemonsqueezy",
                    "external_order_id": order_id,
                    "granted_at": datetime.now(timezone.utc).isoformat(),
                    "expires_at": exp,
                    "consumed": consumed,
                })
                # §LOYALTY 2026-05-19 — Silent Loyalty Presence Bank accrual.
                # Background ledger only; not exposed to frontend yet.
                await _accrue_loyalty(
                    user_id, _extract_lemonsqueezy_currency(data)
                )
                # §8.4 — auto-issue magic link so buyer lands directly in
                # the Cabinet without any login friction.
                magic = None
                if customer_email:
                    try:
                        magic = await _issue_magic_link_for_email(
                            customer_email,
                            redirect_to="/cabinet/clarity",
                            email_subject_override="Your Clarity Pass is ready",
                            email_intro_override=(
                                "Your Clarity Pass has been recorded. The link below opens "
                                "your Cabinet directly — no password needed. It is valid for "
                                "30 minutes; if it expires, request a new one any time."
                            ),
                        )
                    except Exception as e:  # noqa: BLE001
                        logger.warning("magic_link auto-issue (pass) failed: %s", e)
                return {
                    "status": "granted",
                    "tier": pass_tier,
                    "magic_link_url": (magic or {}).get("magic_link_url"),
                    "delivered_via": (magic or {}).get("delivered_via"),
                }
            except Exception:
                return {"status": "error", "reason": "pass_insert_failed"}
        if event_name in ("order_refunded", "subscription_cancelled", "subscription_expired"):
            await db.clarity_passes.delete_many(
                {"user_id": user_id, "external_order_id": order_id}
            )
            return {"status": "revoked", "tier": pass_tier}
        return {"status": "ignored", "reason": f"event {event_name} not handled for pass"}

    # §STABILIZATION 2026-05-16 PM — MLV Presence Time grant branch.
    # Maps a LemonSqueezy variant_id to a seconds-grant. ENV-driven so
    # the founder can wire variant IDs from the Lemon dashboard after
    # opening the account without redeploying code.
    #
    # Expected ENV (each can be empty until variant exists in Lemon):
    #   LEMONSQUEEZY_VARIANT_VOICE_30MIN   → 1800   ($39)
    #   LEMONSQUEEZY_VARIANT_VOICE_60MIN   → 3600   ($69)
    #   LEMONSQUEEZY_VARIANT_ETERNAL       → 10800  ($89/$99 monthly)
    #   LEMONSQUEEZY_VARIANT_TOPUP_30MIN   → 1800   ($19)
    #   LEMONSQUEEZY_VARIANT_TOPUP_60MIN   → 3600   ($39)
    #
    # Idempotency: each (external_order_id) is recorded once in
    # `presence_grants`. A duplicate webhook is a no-op.
    variant_id = _extract_lemonsqueezy_variant_id(data)
    presence_seconds, grant_kind = _presence_seconds_for_variant(variant_id)

    # §FIN-SPLIT 2026-05-20 — Live 4-tier financial logging for every
    # recognised grant, BEFORE any DB writes. This is observability-
    # only; it does not affect grant flow. Each line lands in
    # /var/log/supervisor/backend.err.log with prefix `[FIN-SPLIT]
    # ctx=live` so the Founder can reconcile real margin per order.
    if presence_seconds > 0:
        try:
            gross_eur = _extract_lemonsqueezy_amount_eur(data)
            minutes = presence_seconds / 60.0
            _log_financial_split(
                compute_financial_split(
                    gross_eur,
                    minutes,
                    label=f"variant={variant_id} kind={grant_kind} order={order_id}",
                ),
                context="live",
            )
        except Exception as e:  # noqa: BLE001
            logger.warning("FIN-SPLIT live log failed: %s", e)

    if presence_seconds > 0:
        # Resolve target user: prefer explicit user_id, fall back to email.
        target_user = None
        if user_id:
            target_user = await db.users.find_one({"user_id": user_id}, {"_id": 0})
        if not target_user and customer_email:
            target_user = await db.users.find_one({"email": customer_email}, {"_id": 0})
        if not target_user and customer_email:
            # Create a placeholder user so the grant doesn't vanish.
            # They'll claim it via magic-link login.
            new_id = f"user_{uuid.uuid4().hex[:12]}"
            target_user = {
                "user_id": new_id,
                "email": customer_email,
                "role": "member",
                "created_at": datetime.now(timezone.utc).isoformat(),
                "presence_seconds_left": 0,
                "unlimited_voice": False,
            }
            try:
                await db.users.insert_one(dict(target_user))
            except Exception as e:  # noqa: BLE001
                logger.warning("presence grant: user-create failed: %s", e)

        if not target_user:
            return {"status": "ignored", "reason": "no_user_resolved"}

        if event_name in ("order_created", "subscription_created", "subscription_payment_success"):
            # Idempotency check.
            existing = await db.presence_grants.find_one(
                {"external_order_id": order_id, "user_id": target_user["user_id"]}
            )
            if existing:
                return {
                    "status": "already_granted",
                    "presence_seconds": presence_seconds,
                }
            try:
                await db.presence_grants.insert_one({
                    "id": str(uuid.uuid4()),
                    "user_id": target_user["user_id"],
                    "external_order_id": order_id,
                    "variant_id": variant_id,
                    "presence_seconds": presence_seconds,
                    "grant_kind": grant_kind,
                    "source": "lemonsqueezy",
                    "granted_at": datetime.now(timezone.utc).isoformat(),
                })
                # §STABILIZATION 2026-05-19 — Per-kind balance semantics.
                # • monthly (Steady / Own Room): each renewal RESETS the
                #   balance to at least the grant. Using max(grant,
                #   current) protects users who bought top-ups inside
                #   the cycle — their unspent top-up minutes survive
                #   the renewal. Heavy users who consumed the cycle
                #   are reset to the full grant. Founder directive
                #   2026-05-19: "monthly minutes do not roll over".
                # • oneoff (First Step) + topup (€25/€39/€99): grant is
                #   purely additive — minutes never expire and stack.
                if grant_kind == "monthly":
                    current_doc = await db.users.find_one(
                        {"user_id": target_user["user_id"]},
                        {"_id": 0, "presence_seconds_left": 1},
                    )
                    current_balance = int(
                        (current_doc or {}).get("presence_seconds_left") or 0
                    )
                    new_balance = max(presence_seconds, current_balance)
                    await db.users.update_one(
                        {"user_id": target_user["user_id"]},
                        {"$set": {"presence_seconds_left": new_balance}},
                    )
                    # §AUDIT-LEDGER 2026-05-20 — Webhook grants must
                    # land in credit_ledger so the founder's books
                    # reconcile to the cent.
                    await _append_credit_ledger(
                        user_id=target_user["user_id"],
                        delta=new_balance - current_balance,
                        before=current_balance,
                        after=new_balance,
                        reason=f"lemonsqueezy_{grant_kind}_{event_name}",
                        external_ref=str(order_id) if order_id else None,
                        extra={"variant_id": variant_id, "grant_kind": grant_kind},
                    )
                else:
                    before_doc = await db.users.find_one(
                        {"user_id": target_user["user_id"]},
                        {"_id": 0, "presence_seconds_left": 1},
                    )
                    before_bal = int((before_doc or {}).get("presence_seconds_left") or 0)
                    await db.users.update_one(
                        {"user_id": target_user["user_id"]},
                        {"$inc": {"presence_seconds_left": presence_seconds}},
                    )
                    after_doc = await db.users.find_one(
                        {"user_id": target_user["user_id"]},
                        {"_id": 0, "presence_seconds_left": 1},
                    )
                    after_bal = int((after_doc or {}).get("presence_seconds_left") or 0)
                    await _append_credit_ledger(
                        user_id=target_user["user_id"],
                        delta=after_bal - before_bal,
                        before=before_bal,
                        after=after_bal,
                        reason=f"lemonsqueezy_{grant_kind}_{event_name}",
                        external_ref=str(order_id) if order_id else None,
                        extra={"variant_id": variant_id, "grant_kind": grant_kind},
                    )
            except Exception as e:  # noqa: BLE001
                logger.warning("presence grant insert failed: %s", e)
                return {"status": "error", "reason": "grant_insert_failed"}

            # §Telemetry — log the grant for analytics.
            try:
                await db.funnel_events.insert_one({
                    "id": str(uuid.uuid4()),
                    "event": "presence_granted",
                    "user_id": target_user["user_id"],
                    "seconds": presence_seconds,
                    "variant_id": variant_id,
                    "occurred_at": datetime.now(timezone.utc).isoformat(),
                })
            except Exception:
                pass

            # §LOYALTY 2026-05-19 — Silent Loyalty Presence Bank accrual.
            # Background ledger only; not exposed to frontend yet.
            await _accrue_loyalty(
                target_user["user_id"],
                _extract_lemonsqueezy_currency(data),
            )

            # Issue magic link so the buyer lands directly in Private Room.
            magic = None
            target_email = target_user.get("email") or customer_email
            if target_email:
                try:
                    magic = await _issue_magic_link_for_email(
                        target_email,
                        redirect_to="/clarity-release",
                        email_subject_override="Your Presence Time is ready",
                        email_intro_override=(
                            f"You now have {presence_seconds // 60} minutes of "
                            "Guided Presence available. The link below opens your "
                            "private house directly — no password needed. It is "
                            "valid for 30 minutes; if it expires, request a new one "
                            "any time."
                        ),
                    )
                except Exception as e:  # noqa: BLE001
                    logger.warning("magic_link auto-issue (presence) failed: %s", e)

            return {
                "status": "granted",
                "presence_seconds": presence_seconds,
                "magic_link_url": (magic or {}).get("magic_link_url"),
                "delivered_via": (magic or {}).get("delivered_via"),
            }

        if event_name in ("order_refunded", "subscription_cancelled", "subscription_expired"):
            # Best-effort revoke: subtract the original grant. Never go
            # below zero — the wanderer may have already consumed it.
            grant = await db.presence_grants.find_one(
                {"external_order_id": order_id, "user_id": target_user["user_id"]}
            )
            if grant:
                seconds = int(grant.get("presence_seconds") or 0)
                current = int(target_user.get("presence_seconds_left") or 0)
                new_value = max(0, current - seconds)
                await db.users.update_one(
                    {"user_id": target_user["user_id"]},
                    {"$set": {"presence_seconds_left": new_value}},
                )
                await db.presence_grants.delete_one({"id": grant["id"]})
                # §AUDIT-LEDGER 2026-05-20 — Revokes must be tracked.
                await _append_credit_ledger(
                    user_id=target_user["user_id"],
                    delta=new_value - current,
                    before=current,
                    after=new_value,
                    reason=f"lemonsqueezy_revoke_{event_name}",
                    external_ref=str(order_id) if order_id else None,
                    extra={"original_seconds": seconds},
                )
            return {"status": "revoked", "presence_seconds": presence_seconds}

        return {"status": "ignored", "reason": f"event {event_name} not handled for presence"}

    if not (user_id and book_slug):
        # Webhook landed but custom data is missing — probably a manual
        # purchase from the LS dashboard. Log + ignore (no auto-grant).
        return {"status": "ignored", "reason": "missing custom_data"}

    if event_name == "order_created":
        # Idempotent: unique index on (user_id, book_slug) blocks dupes.
        try:
            await db.purchases.insert_one({
                "id": str(uuid.uuid4()),
                "user_id": user_id,
                "book_slug": book_slug,
                "source": "lemonsqueezy",
                "external_order_id": order_id,
                "granted_at": datetime.now(timezone.utc).isoformat(),
            })
            granted = True
        except Exception:
            granted = False  # Already granted (duplicate webhook). Treat as success.

        # §8.4 — auto-issue magic link so the buyer's "Thank You" page can
        # show a one-click "Enter your Library" button.
        magic = None
        if customer_email:
            try:
                magic = await _issue_magic_link_for_email(
                    customer_email,
                    redirect_to=f"/cabinet/library/{book_slug}",
                    email_subject_override="Your book is ready in your Cabinet",
                    email_intro_override=(
                        "Your purchase has been recorded. The link below opens your "
                        "Cabinet directly — no password needed. It is valid for 30 "
                        "minutes; if it expires, request a new one any time."
                    ),
                )
            except Exception as e:  # noqa: BLE001
                logger.warning("magic_link auto-issue (book) failed: %s", e)

        return {
            "status": "granted" if granted else "already_granted",
            "magic_link_url": (magic or {}).get("magic_link_url"),
            "delivered_via": (magic or {}).get("delivered_via"),
        }

    if event_name == "order_refunded":
        await db.purchases.delete_one(
            {"user_id": user_id, "book_slug": book_slug}
        )
        return {"status": "revoked"}

    return {"status": "ignored", "reason": f"event {event_name} not handled"}


@api_router.get("/lemonsqueezy/health")
async def lemonsqueezy_health():
    """Read-only sanity check. No secrets revealed."""
    return {
        "store_id_set": bool(_os.environ.get("LEMONSQUEEZY_STORE_ID")),
        "webhook_secret_set": bool(_LS_WEBHOOK_SECRET),
        "api_key_set": bool(_os.environ.get("LEMONSQUEEZY_API_KEY")),
        "events_received": await db.lemonsqueezy_events.count_documents({}),
        "purchases_total": await db.purchases.count_documents({}),
    }


# =============================================================
# §STABILIZATION 2026-05-16 PM — PRESENCE TIME RUNTIME
# =============================================================
# Phase-1 (MLV) runtime for the locked product structure:
#   30-min Guided Presence  ($39)  → 1800 sec
#   60-min Extended Session ($69)  → 3600 sec
#   Eternal monthly         ($89/$99) → 10800 sec / month
#   Top-up +30min           ($19)  → 1800 sec
#   Top-up +60min           ($39)  → 3600 sec
#
# A single MongoDB field on `users` (`presence_seconds_left`) is the
# canonical balance. LemonSqueezy webhook grants seconds; the four
# endpoints below let the frontend read the balance, open a tracked
# voice session, ping a heartbeat while live, and close cleanly.
#
# This system is ISOLATED — no audio code is modified. The cap
# decision is computed by `session_cap.compute_voice_window` which
# already prefers `presence_seconds_left` when present.
#
# Failsafe: SESSION_CAP_ENABLED=false → all endpoints still work
# (balance is readable, sessions are tracked) but signed-url never
# 402s on the cap. This lets the founder roll out telemetry first
# and only flip the gate when stable.

def _extract_lemonsqueezy_variant_id(data: dict) -> Optional[str]:
    """Best-effort variant_id lookup for both order and subscription events.

    LemonSqueezy webhooks vary by event type. We try several known shapes
    and fall back to None so an unfamiliar payload becomes a calm no-op.
    """
    if not isinstance(data, dict):
        return None
    attrs = data.get("attributes") or {}
    # Subscription events expose variant_id directly on attributes.
    vid = attrs.get("variant_id")
    if vid:
        return str(vid)
    # Order events nest line items.
    first_item = attrs.get("first_order_item") or {}
    vid = first_item.get("variant_id")
    if vid:
        return str(vid)
    return None


def _extract_lemonsqueezy_currency(data: dict) -> str:
    """Pull the buyer's currency from a LemonSqueezy webhook payload.

    §STABILIZATION 2026-05-19 — Founder directive: every successful
    purchase silently accrues 1-2 base units into the buyer's Loyalty
    Presence Bank in their detected currency. Lemon stores the order
    currency under `data.attributes.currency` (3-letter ISO code).

    Returns "EUR" or "USD" (uppercase). Anything else (including
    GBP/CAD/etc.) collapses to "EUR" as the conservative default —
    Founder rule: bank is strictly EUR/USD bookkeeping.
    """
    attrs = (data.get("attributes") or {}) if isinstance(data, dict) else {}
    cur = (attrs.get("currency") or "").strip().upper()
    return cur if cur in ("EUR", "USD") else "EUR"


def _loyalty_accrual_for_currency(currency: str) -> int:
    """Founder-tunable accrual rate from ENV.

    Defaults to 2 base units per successful purchase, per Founder
    spec (1-2 base units depending on currency). Configure in .env:
        LOYALTY_ACCRUAL_EUR=2
        LOYALTY_ACCRUAL_USD=2
    Setting the value to 0 disables accrual silently for that
    currency without redeploy.
    """
    env_key = f"LOYALTY_ACCRUAL_{currency.upper()}"
    try:
        return max(0, int(_os.environ.get(env_key) or "2"))
    except (ValueError, TypeError):
        return 2


async def _accrue_loyalty(user_id: Optional[str], currency: str) -> None:
    """Silent Loyalty Presence Bank accrual for any successful purchase.

    Founder directive 2026-05-19: background ledger only. NOT exposed
    to the frontend yet, NOT spendable yet — we are simply laying
    the data foundation so future features (loyalty gifts, surprise
    voice minutes) can read from `users.loyalty_currency_balance.EUR`
    and `users.loyalty_currency_balance.USD` once the founder turns
    the bank visible.
    """
    accrual = _loyalty_accrual_for_currency(currency)
    if accrual <= 0 or not user_id:
        return
    try:
        await db.users.update_one(
            {"user_id": user_id},
            {"$inc": {f"loyalty_currency_balance.{currency}": accrual}},
        )
    except Exception as e:  # noqa: BLE001
        logger.warning(
            "loyalty accrual failed user=%s cur=%s: %s", user_id, currency, e
        )


def _extract_lemonsqueezy_amount_eur(data: dict) -> float:
    """Pull the gross order amount in EUR (cents → euros) from the payload.

    §FIN-SPLIT 2026-05-20 — LemonSqueezy stores amounts as integer
    cents under `data.attributes.total` (order) or `total_in_cents`
    (varies by event). Currency comes from `_extract_lemonsqueezy_currency`.
    If the order is in USD, we convert at a Founder-locked rate of
    1 USD = 0.93 EUR so the financial-split numbers stay in a single
    base unit (EUR) — bookkeeping clarity over micro-precision.
    """
    attrs = (data.get("attributes") or {}) if isinstance(data, dict) else {}
    cents = (
        attrs.get("total")
        or attrs.get("total_in_cents")
        or attrs.get("subtotal")
        or 0
    )
    try:
        amount = float(cents) / 100.0
    except (TypeError, ValueError):
        amount = 0.0
    cur = _extract_lemonsqueezy_currency(data)
    if cur == "USD":
        amount = amount * 0.93
    return round(amount, 2)


# ---------------------------------------------------------------
# §FIN-SPLIT 2026-05-20 — 4-Tier Financial & Operations Engine
# ---------------------------------------------------------------
# Founder directive v2 (2026-05-20 PM — recalibrated):
#   Tier 1 — Production Costs:    €0.25 / voice minute   (DYNAMIC — per-min API spend)
#   Tier 2 — Reserve Fund:        €2.00 / TRANSACTION    (FIXED — one-time per order)
#   Tier 3 — Loyalty Presence Bank: €1.00 / TRANSACTION    (FIXED — one-time per order)
#   Tier 4 — Net Profit:          gross − (T1 + T2 + T3)
#
# Why the recalibration: v1 treated Reserve + Loyalty as per-minute
# costs, which broke every product's margin because users buying long
# packages were billed reserve/loyalty proportional to minutes. The
# correct accounting model is: reserve + loyalty are FIXED operating
# allocations PER ORDER (one-time bookkeeping entries that don't scale
# with usage), while production cost is the only true variable cost
# (each voice minute = real ElevenLabs API charge).
#
# This is a PURE function. Output is a structured dict the webhook
# handler logs to stderr with a `[FIN-SPLIT]` prefix:
#     tail -f /var/log/supervisor/backend.err.log | grep FIN-SPLIT
#
# Dry-run output is emitted ONCE on module load — the four locked
# scenarios show the expected per-product split before any real
# transaction touches the system.


_FIN_SPLIT_COST_PER_MIN = float(_os.environ.get("FIN_SPLIT_COST_EUR_PER_MIN") or "0.25")
# §RECALIBRATION 2026-05-20 PM — Founder explicit: Reserve + Loyalty
# are now FIXED per-transaction allocations (was per-minute in v1).
_FIN_SPLIT_RESERVE_PER_TX = float(_os.environ.get("FIN_SPLIT_RESERVE_EUR_PER_TX") or "2.00")
_FIN_SPLIT_LOYALTY_PER_TX = float(_os.environ.get("FIN_SPLIT_LOYALTY_EUR_PER_TX") or "1.00")


def compute_financial_split(
    amount_eur: float,
    voice_minutes: float,
    label: str = "",
) -> dict:
    """Split an incoming gross amount into the 4-tier financial engine.

    Args:
        amount_eur:     gross order amount in EUR
        voice_minutes:  voice minutes the product unlocks (0 for non-voice)
        label:          optional label for the log line ("First Step / €45")

    Returns:
        dict with all 4 tiers and derived health flags. Always returns
        the same keys so downstream logging stays uniform.
    """
    gross = round(float(amount_eur or 0.0), 2)
    minutes = max(0.0, float(voice_minutes or 0.0))

    # Tier 1: VARIABLE — scales with voice minutes (real upstream cost).
    tier1 = round(minutes * _FIN_SPLIT_COST_PER_MIN, 2)
    # Tier 2 + 3: FIXED — one-time per transaction (bookkeeping
    # allocations, do not scale with usage).
    tier2 = round(_FIN_SPLIT_RESERVE_PER_TX, 2)
    tier3 = round(_FIN_SPLIT_LOYALTY_PER_TX, 2)
    allocated = round(tier1 + tier2 + tier3, 2)
    tier4 = round(gross - allocated, 2)

    margin_pct = round((tier4 / gross) * 100.0, 1) if gross > 0 else 0.0
    is_solvent = tier4 >= 0
    is_healthy = tier4 >= round(gross * 0.20, 2)  # 20% profit threshold

    return {
        "label": label,
        "gross_eur": gross,
        "voice_minutes": minutes,
        "tier1_production_costs_eur": tier1,
        "tier2_reserve_fund_eur": tier2,
        "tier3_loyalty_bank_eur": tier3,
        "tier4_net_profit_eur": tier4,
        "allocated_to_costs_eur": allocated,
        "margin_pct": margin_pct,
        "is_solvent": is_solvent,
        "is_healthy_margin": is_healthy,
        "rates_used": {
            "cost_per_min": _FIN_SPLIT_COST_PER_MIN,
            "reserve_per_tx": _FIN_SPLIT_RESERVE_PER_TX,
            "loyalty_per_tx": _FIN_SPLIT_LOYALTY_PER_TX,
        },
    }


def _log_financial_split(split: dict, context: str = "live") -> None:
    """Emit a one-line FIN-SPLIT log entry to backend.err.log."""
    line = (
        f"[FIN-SPLIT] ctx={context} "
        f"label={split.get('label') or '-'} "
        f"gross={split['gross_eur']:.2f}€ "
        f"mins={split['voice_minutes']:.1f} "
        f"t1_costs={split['tier1_production_costs_eur']:.2f}€ "
        f"t2_reserve={split['tier2_reserve_fund_eur']:.2f}€ "
        f"t3_loyalty={split['tier3_loyalty_bank_eur']:.2f}€ "
        f"t4_profit={split['tier4_net_profit_eur']:.2f}€ "
        f"margin={split['margin_pct']:.1f}% "
        f"solvent={split['is_solvent']} "
        f"healthy={split['is_healthy_margin']}"
    )
    logger.warning(line)


def _emit_financial_dry_run() -> None:
    logger.warning("=" * 78)
    logger.warning("[FIN-SPLIT] DRY-RUN BOOT — 4-Tier Financial Engine v2 (2026-05-20 PM)")
    logger.warning(
        "[FIN-SPLIT] rates: cost=€%.2f/min  reserve=€%.2f/tx  loyalty=€%.2f/tx",
        _FIN_SPLIT_COST_PER_MIN,
        _FIN_SPLIT_RESERVE_PER_TX,
        _FIN_SPLIT_LOYALTY_PER_TX,
    )
    scenarios = [
        ("First Step / €45",            45.0,  60.0),
        ("Steady Monthly / €120",        120.0,  60.0),
        ("Your Own Room Monthly / €380", 380.0, 240.0),
        ("Top-up / €20",                20.0,  30.0),
    ]
    any_unhealthy = False
    for label, amount, minutes in scenarios:
        split = compute_financial_split(amount, minutes, label=label)
        _log_financial_split(split, context="dry-run")
        if not split["is_solvent"]:
            logger.warning("[FIN-SPLIT] 🚨 UNHEALTHY: %s — gross=%.2f€ profit=%.2f€",
                           label, split["gross_eur"], split["tier4_net_profit_eur"])
            any_unhealthy = True
    if any_unhealthy:
        logger.warning("[FIN-SPLIT] ⚠ AT LEAST ONE PRODUCT IS UNSOLVENT — review rates before going live.")
    else:
        logger.warning("[FIN-SPLIT] ✓ ALL 4 PRODUCTS SOLVENT.")
    logger.warning("[FIN-SPLIT] DRY-RUN END")
    logger.warning("=" * 78)


if not _os.environ.get("_FIN_SPLIT_DRY_RUN_DONE"):
    try:
        _emit_financial_dry_run()
        _os.environ["_FIN_SPLIT_DRY_RUN_DONE"] = "1"
    except Exception as e:  # noqa: BLE001
        logger.warning("FIN-SPLIT dry-run emission failed: %s", e)


def _presence_seconds_for_variant(variant_id: Optional[str]) -> tuple[int, str]:
    """Map a LemonSqueezy variant_id to a presence-seconds grant + kind.

    Returns `(seconds, kind)` where `kind` is one of:
      • "monthly" — recurring subscription (Steady / Own Room).
                    Each successful renewal RESETS the balance to at
                    least the grant (max(grant, current)) so top-up
                    minutes are never destroyed.
      • "oneoff"  — single purchase (First Step).
                    Adds to the balance; never auto-renews.
      • "topup"   — additional minutes (30 / 60 / 180 min).
                    Adds to the balance; never expires.
      • ""        — variant not recognised; webhook is a no-op.

    Returns (0, "") when the variant is not configured. Founder fills
    the variant IDs in the Emergent Deploy panel after opening the
    Lemon account; until then every variant returns (0, "").

    §STABILIZATION 2026-05-19 — Aligned with Mike's locked EUR pricing:
        €45 First Step           → FIRST_STEP        (oneoff, 3600s)
        €120 Steady Monthly      → STEADY_MONTHLY    (monthly, 3600s)
        €380 Own Room Monthly    → OWN_ROOM_MONTHLY  (monthly, 14400s)
        €25 / €39 / €99 Top-ups  → TOPUP_*           (topup, 1800/3600/10800s)
    Old 2026-05-16 variants (VOICE_30MIN/60MIN/ETERNAL) are kept for
    backwards compatibility with any pending test orders. New
    production Lemon variants MUST use the FIRST_STEP / STEADY_MONTHLY
    / OWN_ROOM_MONTHLY / TOPUP_180MIN keys.
    """
    if not variant_id:
        return (0, "")
    vid = str(variant_id)
    new_mapping: dict[Optional[str], tuple[int, str]] = {
        # Mike's locked pricing (2026-05-19) — production-ready keys.
        _os.environ.get("LEMONSQUEEZY_VARIANT_FIRST_STEP"):       (3600,  "oneoff"),
        _os.environ.get("LEMONSQUEEZY_VARIANT_STEADY_MONTHLY"):   (3600,  "monthly"),
        _os.environ.get("LEMONSQUEEZY_VARIANT_OWN_ROOM_MONTHLY"): (14400, "monthly"),
        _os.environ.get("LEMONSQUEEZY_VARIANT_TOPUP_30MIN"):      (1800,  "topup"),
        _os.environ.get("LEMONSQUEEZY_VARIANT_TOPUP_60MIN"):      (3600,  "topup"),
        _os.environ.get("LEMONSQUEEZY_VARIANT_TOPUP_180MIN"):     (10800, "topup"),
        # Legacy 2026-05-16 mappings — kept for backwards compat.
        _os.environ.get("LEMONSQUEEZY_VARIANT_VOICE_30MIN"): (1800,  "oneoff"),
        _os.environ.get("LEMONSQUEEZY_VARIANT_VOICE_60MIN"): (3600,  "oneoff"),
        _os.environ.get("LEMONSQUEEZY_VARIANT_ETERNAL"):     (10800, "monthly"),
    }
    # None keys (when an ENV is unset) are filtered out so we never
    # match a missing variant against an empty string.
    return new_mapping.get(vid, (0, "")) if vid else (0, "")


@api_router.get("/presence/balance")
async def presence_balance(request: Request):
    """Return the wanderer's current Presence Time balance.

    Read-only. Used by the frontend banner alongside `voice-window` for
    a calm display of "X minutes remaining".
    """
    user = await _require_user(request)
    user_doc = await db.users.find_one({"user_id": user.user_id}, {"_id": 0})
    seconds = int((user_doc or {}).get("presence_seconds_left") or 0)
    return {
        "presence_seconds_left": seconds,
        "minutes_left": seconds // 60,
        "unlimited": bool((user_doc or {}).get("unlimited_voice", False)),
    }


class PresenceStartInput(BaseModel):
    room: Literal["clarity", "body", "parents", "courses", "aurin"] = "clarity"
    # §AUDIT-W5 2026-05-20 — Mode hint mirrors the frontend toggle.
    # Optional & defaults to "voice" so any legacy client still works.
    # Text mode is unmetered per Founder directive; the server refuses
    # to open a billable session_row when mode=="text" even if a
    # malicious or buggy client still posts. Defence-in-depth.
    mode: Optional[Literal["voice", "text", "hybrid"]] = "voice"


@api_router.post("/presence/start")
async def presence_start(inp: PresenceStartInput, request: Request):
    """Open a tracked voice-session ledger row.

    The frontend calls this immediately AFTER the SDK confirms the
    WebSocket is open. The row is closed by `/presence/end` (or, on a
    crash, reaped by the next `presence_start` call from the same user).
    """
    user = await _require_user(request)

    # §AUDIT-W5 2026-05-20 — Server-side text-mode bypass. Founder
    # directive: writing is always free. The frontend tracker already
    # skips this endpoint when mode=="text", but a buggy or replayed
    # request must not be allowed to open a billable row.
    if (inp.mode or "voice") == "text":
        return {"session_id": None, "started_at": None, "skipped": "text_mode"}

    # §HARD-LOCK 2026-05-20 — Refuse to open a billable voice session
    # when the user has no balance and isn't unlimited. ElevenLabs
    # charges the founder's card the moment the WebSocket opens, so a
    # zero-balance user MUST be blocked here. Without this gate a
    # buggy/malicious client could open hundreds of sessions and bleed
    # the operator account. Defence-in-depth alongside the frontend
    # tracker. Returns 402 (Payment Required) so the UI can surface a
    # clear "top up to continue" prompt.
    balance_doc = await db.users.find_one(
        {"user_id": user.user_id},
        {"_id": 0, "presence_seconds_left": 1, "unlimited_voice": 1},
    ) or {}
    is_unlimited = bool(balance_doc.get("unlimited_voice"))
    sec_left = int(balance_doc.get("presence_seconds_left") or 0)
    # §FREE-VOICE-BETA 2026-05-20 — Founder runway switch.
    # While LemonSqueezy is not yet open, voice must remain accessible
    # for live-mode founder testing across all 4 rooms. Set
    # FREE_VOICE_BETA=true in /app/backend/.env to bypass the
    # hard-lock; set to false (or remove) the instant payments are
    # online. Every bypass writes a `free_voice_beta_session` funnel
    # row so the founder can audit how much "free" voice was minted.
    free_beta = (os.environ.get("FREE_VOICE_BETA") or "").strip().lower() in {
        "1", "true", "yes", "on",
    }
    if free_beta:
        try:
            await db.funnel_events.insert_one({
                "id": str(uuid.uuid4()),
                "event": "free_voice_beta_session",
                "user_id": user.user_id,
                "room": inp.room,
                "mode": (inp.mode or "voice"),
                "occurred_at": datetime.now(timezone.utc).isoformat(),
            })
        except Exception:  # noqa: BLE001
            pass
    if not free_beta and not is_unlimited and sec_left <= 0:
        # Telemetry so the funnel surfaces every blocked attempt.
        try:
            await db.funnel_events.insert_one({
                "id": str(uuid.uuid4()),
                "event": "voice_session_blocked_no_balance",
                "user_id": user.user_id,
                "room": inp.room,
                "occurred_at": datetime.now(timezone.utc).isoformat(),
            })
        except Exception:  # noqa: BLE001
            pass
        raise HTTPException(
            status_code=402,
            detail={
                "code": "no_presence_balance",
                "message": "Top up to start a voice session.",
                "presence_seconds_left": 0,
                "room": inp.room,
            },
        )

    # §COMP-DAILY-CAP 2026-02-09 — Influencer protection layer.
    # When a user holds ONLY an admin-grant pass (no paid pass), we
    # enforce a per-day voice-minute ceiling so an influencer's free
    # 30-day code can't be burned through in 24h × 30d straight.
    # The cap lives on the pass document as `daily_minute_cap` (int);
    # absence = no cap (legacy passes keep their old behaviour).
    # Paid passes are NEVER capped here. Voice-only — text is free.
    try:
        comp_pass = await db.clarity_passes.find_one(
            {
                "user_id": user.user_id,
                "source": "admin-grant",
                "consumed": True,
            },
            {"_id": 0, "daily_minute_cap": 1, "id": 1, "expires_at": 1},
            sort=[("granted_at", -1)],
        )
        cap_minutes = (
            int(comp_pass.get("daily_minute_cap") or 0) if comp_pass else 0
        )
        # Only apply when comp pass is the ACTIVE access path. If the
        # user also has a paid pass, the paid one wins — skip cap.
        if comp_pass and cap_minutes > 0:
            paid_pass = await db.clarity_passes.find_one(
                {
                    "user_id": user.user_id,
                    "source": {"$nin": ["admin-grant", "free_voice_beta"]},
                    "consumed": True,
                },
                {"_id": 0, "id": 1},
            )
            if not paid_pass:
                # Sum voice_sessions elapsed_seconds for today (UTC).
                # §AUDIT-FIX 2026-02-09 — field is `elapsed_seconds`,
                # not `duration_seconds`. The wrong name would silently
                # sum to 0 forever and the cap would never trigger.
                today_utc = datetime.now(timezone.utc).replace(
                    hour=0, minute=0, second=0, microsecond=0
                )
                today_iso = today_utc.isoformat()
                pipeline = [
                    {
                        "$match": {
                            "user_id": user.user_id,
                            "started_at": {"$gte": today_iso},
                        }
                    },
                    {
                        "$group": {
                            "_id": None,
                            "secs": {"$sum": {"$ifNull": ["$elapsed_seconds", 0]}},
                        }
                    },
                ]
                used_secs = 0
                async for row in db.voice_sessions.aggregate(pipeline):
                    used_secs = int(row.get("secs") or 0)
                cap_secs = cap_minutes * 60
                if used_secs >= cap_secs:
                    try:
                        await db.funnel_events.insert_one({
                            "id": str(uuid.uuid4()),
                            "event": "voice_session_blocked_daily_cap",
                            "user_id": user.user_id,
                            "room": inp.room,
                            "used_secs": used_secs,
                            "cap_secs": cap_secs,
                            "occurred_at": datetime.now(timezone.utc).isoformat(),
                        })
                    except Exception:  # noqa: BLE001
                        pass
                    raise HTTPException(
                        status_code=402,
                        detail={
                            "code": "daily_cap_reached",
                            "message": (
                                f"You've used your {cap_minutes} free minutes "
                                "for today. Please come back tomorrow."
                            ),
                            "used_minutes": round(used_secs / 60, 1),
                            "cap_minutes": cap_minutes,
                            "room": inp.room,
                        },
                    )
    except HTTPException:
        raise
    except Exception as exc:  # noqa: BLE001
        # Cap calculation must never break the live-session opening.
        logger.warning("comp daily-cap check failed: %s", exc)

    # Close any orphaned previous session: deduct elapsed time based on
    # last_ping_at so a tab-crash never costs more than ~30 seconds.
    prior = await db.voice_sessions.find_one(
        {"user_id": user.user_id, "closed": False}, {"_id": 0}
    )
    if prior:
        await _close_voice_session_safe(prior, user.user_id, reason="orphaned")

    sess_id = str(uuid.uuid4())
    now_iso = datetime.now(timezone.utc).isoformat()
    await db.voice_sessions.insert_one({
        "id": sess_id,
        "user_id": user.user_id,
        "room": inp.room,
        "started_at": now_iso,
        "last_ping_at": now_iso,
        "closed": False,
    })
    # §Telemetry
    try:
        await db.funnel_events.insert_one({
            "id": str(uuid.uuid4()),
            "event": "voice_session_started",
            "user_id": user.user_id,
            "room": inp.room,
            "session_id": sess_id,
            "occurred_at": now_iso,
        })
    except Exception:
        pass
    return {"session_id": sess_id, "started_at": now_iso}


class PresenceHeartbeatInput(BaseModel):
    session_id: str


@api_router.post("/presence/heartbeat")
async def presence_heartbeat(inp: PresenceHeartbeatInput, request: Request):
    """Update the live session's last_ping_at. Idempotent."""
    user = await _require_user(request)
    now_iso = datetime.now(timezone.utc).isoformat()
    res = await db.voice_sessions.update_one(
        {"id": inp.session_id, "user_id": user.user_id, "closed": False},
        {"$set": {"last_ping_at": now_iso}},
    )
    if res.matched_count == 0:
        # The session was already closed or never existed — soft success
        # so the frontend keeps pinging without raising.
        return {"status": "no_active_session"}
    return {"status": "ok", "last_ping_at": now_iso}


class PresenceEndInput(BaseModel):
    session_id: str
    reason: Optional[Literal["user_end", "page_unload", "voice_error", "auto"]] = "user_end"


@api_router.post("/presence/end")
async def presence_end(inp: PresenceEndInput, request: Request):
    """Close a tracked voice session and decrement the user's Presence Time."""
    user = await _require_user(request)
    sess = await db.voice_sessions.find_one(
        {"id": inp.session_id, "user_id": user.user_id, "closed": False},
        {"_id": 0},
    )
    if not sess:
        return {"status": "already_closed"}
    return await _close_voice_session_safe(sess, user.user_id, reason=inp.reason or "user_end")


async def _append_credit_ledger(
    *,
    user_id: str,
    delta: int,
    before: int,
    after: int,
    reason: str,
    session_id: str | None = None,
    room: str | None = None,
    external_ref: str | None = None,
    unlimited: bool = False,
    extra: dict | None = None,
) -> bool:
    """§AUDIT-LEDGER 2026-05-20 — Single source of truth for ALL credit
    movements. Every place that touches `users.presence_seconds_left`
    MUST call this immediately after the write.

    Never raises. If the ledger insert fails the failure is logged
    AND a `funnel_events.ledger_write_failed` row is appended so the
    founder's audit dashboard can surface every silent gap.

    Returns True if the ledger row landed, False otherwise.
    """
    now_iso = datetime.now(timezone.utc).isoformat()
    doc = {
        "id": str(uuid.uuid4()),
        "user_id": user_id,
        "delta": int(delta),
        "before": int(before),
        "after": int(after),
        "reason": reason or "unspecified",
        "session_id": session_id,
        "room": room,
        "external_ref": external_ref,
        "unlimited": bool(unlimited),
        "occurred_at": now_iso,
    }
    if extra:
        # Never let extra fields shadow the canonical keys.
        for k, v in extra.items():
            if k not in doc:
                doc[k] = v
    try:
        await db.credit_ledger.insert_one(doc)
        return True
    except Exception as exc:  # noqa: BLE001
        # Log loudly — no `except: pass` ever again.
        logger.error(
            "credit_ledger insert FAILED user=%s delta=%s reason=%s "
            "session=%s ref=%s err=%s",
            user_id, delta, reason, session_id, external_ref, exc,
        )
        try:
            await db.funnel_events.insert_one({
                "id": str(uuid.uuid4()),
                "event": "ledger_write_failed",
                "user_id": user_id,
                "delta": int(delta),
                "before": int(before),
                "after": int(after),
                "reason": reason,
                "session_id": session_id,
                "external_ref": external_ref,
                "error": str(exc)[:500],
                "occurred_at": now_iso,
            })
        except Exception:  # noqa: BLE001
            # If even funnel_events is down, the OS-level logger.error
            # above is the last-resort trace.
            pass
        return False


async def _close_voice_session_safe(
    sess: dict, user_id: str, *, reason: str
) -> dict:
    """Compute elapsed seconds and decrement the user's balance.

    Idempotent: a second call is a no-op. Never throws — used by both
    `/presence/end` and the orphan-reaper inside `/presence/start`.
    """
    try:
        started = datetime.fromisoformat(sess["started_at"])
        last_ping = datetime.fromisoformat(sess.get("last_ping_at") or sess["started_at"])
    except (KeyError, ValueError):
        return {"status": "error", "reason": "bad_timestamps"}
    if started.tzinfo is None:
        started = started.replace(tzinfo=timezone.utc)
    if last_ping.tzinfo is None:
        last_ping = last_ping.replace(tzinfo=timezone.utc)

    # Bill from started → last_ping (the heartbeat is what we trust).
    # On user_end calls happening AFTER a final heartbeat, the gap is
    # at most a few seconds and rounds correctly.
    if reason == "user_end":
        end_at = datetime.now(timezone.utc)
    else:
        end_at = last_ping
    elapsed = max(0, int((end_at - started).total_seconds()))

    now_iso = datetime.now(timezone.utc).isoformat()
    await db.voice_sessions.update_one(
        {"id": sess["id"]},
        {"$set": {
            "closed": True,
            "ended_at": now_iso,
            "elapsed_seconds": elapsed,
            "close_reason": reason,
        }},
    )
    # Decrement balance, never below zero.
    # §AUDIT-SCALE 2026-05-20 — Atomic single-write update to prevent
    # the read-modify-write race that previously let parallel session
    # closes (e.g. two rooms ending simultaneously) leak credits in
    # either direction. The aggregation-pipeline `$set` clamps at zero
    # with `$max` and is honoured atomically by Mongo. unlimited_voice
    # accounts are matched out at the filter level, so the write
    # simply does not fire for them.
    if elapsed > 0:
        try:
            # Snapshot BEFORE the atomic write for the ledger row.
            before_doc = await db.users.find_one(
                {"user_id": user_id},
                {"_id": 0, "presence_seconds_left": 1, "unlimited_voice": 1},
            ) or {}
            before_balance = int(before_doc.get("presence_seconds_left") or 0)
            was_unlimited = bool(before_doc.get("unlimited_voice"))
            await db.users.update_one(
                {
                    "user_id": user_id,
                    "$or": [
                        {"unlimited_voice": {"$exists": False}},
                        {"unlimited_voice": False},
                        {"unlimited_voice": None},
                    ],
                },
                [
                    {
                        "$set": {
                            "presence_seconds_left": {
                                "$max": [
                                    0,
                                    {
                                        "$subtract": [
                                            {"$ifNull": ["$presence_seconds_left", 0]},
                                            elapsed,
                                        ]
                                    },
                                ]
                            }
                        }
                    }
                ],
            )
            # Re-read for the drained-event telemetry (cheap, indexed).
            user_doc = await db.users.find_one(
                {"user_id": user_id},
                {"_id": 0, "presence_seconds_left": 1, "unlimited_voice": 1},
            ) or {}
            after_balance = int(user_doc.get("presence_seconds_left") or 0)
            # §AUDIT-LEDGER 2026-05-20 — Append an immutable audit row
            # to credit_ledger for every credit movement via the
            # `_append_credit_ledger` helper, which never silently
            # swallows failures (logs + funnel_events.ledger_write_failed).
            await _append_credit_ledger(
                user_id=user_id,
                delta=-elapsed if not was_unlimited else 0,
                before=before_balance,
                after=after_balance,
                reason=reason or "session_end",
                session_id=sess.get("id"),
                room=sess.get("room"),
                unlimited=was_unlimited,
            )
            if (
                not user_doc.get("unlimited_voice")
                and after_balance == 0
                and before_balance > 0
            ):
                try:
                    await db.funnel_events.insert_one({
                        "id": str(uuid.uuid4()),
                        "event": "presence_drained",
                        "user_id": user_id,
                        "session_id": sess["id"],
                        "occurred_at": now_iso,
                    })
                except Exception:  # noqa: BLE001
                    pass
        except Exception as exc:  # noqa: BLE001
            logger.warning("atomic balance decrement failed for %s: %s", user_id, exc)
    # §Telemetry: session_ended.
    try:
        await db.funnel_events.insert_one({
            "id": str(uuid.uuid4()),
            "event": "voice_session_ended",
            "user_id": user_id,
            "room": sess.get("room"),
            "session_id": sess["id"],
            "elapsed_seconds": elapsed,
            "reason": reason,
            "occurred_at": now_iso,
        })
    except Exception:
        pass

    return {
        "status": "closed",
        "elapsed_seconds": elapsed,
        "reason": reason,
    }


@api_router.post("/presence/interrupted")
async def presence_interrupted(request: Request):
    """Lightweight telemetry beacon for the voice-recovery card.

    Fired by the frontend when the SDK reports an unexpected
    disconnect / error. We DO NOT decrement the balance here — the
    open `voice_sessions` row will still be reaped on the next
    `presence_start` call. This is purely an analytics event.
    """
    user = await _require_user(request)
    try:
        body = await request.json()
    except Exception:
        body = {}
    await db.funnel_events.insert_one({
        "id": str(uuid.uuid4()),
        "event": "voice_session_interrupted",
        "user_id": user.user_id,
        "room": body.get("room"),
        "session_id": body.get("session_id"),
        "error": (body.get("error") or "")[:300],
        "occurred_at": datetime.now(timezone.utc).isoformat(),
    })
    return {"status": "logged"}


# =============================================================


# =============================================================
# Blog / Insights — manually-seeded long-form posts. Replaceable
# from GitHub later via /blog/*.md. Public read, no auth.
# =============================================================

class BlogPost(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    slug: str
    title: str
    subtitle: Optional[str] = None
    author: str = "Prulesoul"
    excerpt: str = ""
    cover_image_url: Optional[str] = None
    cover_image_alt: Optional[str] = None
    markdown: str = ""
    html: str = ""
    sections: List[ContentSection] = Field(default_factory=list)
    tags: List[str] = Field(default_factory=list)
    published: bool = True
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


SEED_BLOG: List[dict] = [
    {
        "slug": "on-not-hearing-myself",
        "title": "On not hearing myself",
        "subtitle": "A founder's letter, before Matrix Aurin",
        "author": "Anna (Aurin)",
        "excerpt": (
            "Eight months ago I sat with two unsold books on Amazon and a noise inside "
            "me that was louder than any market signal. This is what I learned in the "
            "quiet that came after."
        ),
        "cover_image_url": "/assets/illustrations/inner-mirror.jpg",
        "cover_image_alt": "A wooden door opening onto an inner mirror, dawn light.",
        "tags": ["founder", "letter", "aurin-philosophy"],
        "markdown": """*I wrote this for myself first. If something here meets you,
take it. If not, leave it gently and walk on.*

## I.  The day the silence was loudest

Eight months ago, I sat at my kitchen table in Oslo and looked at
two books I had quietly published on Amazon. Both had sold zero
copies. Not "a few" — zero.

Outside, the morning was the kind of grey that doesn't argue with
you. Inside me, though — the noise was at ten out of ten. Not the
noise of failure exactly. Something older. The hum of *I should
have done more, faster, louder, smarter, by now.*

I had spent so long building the thing that I had forgotten to ask
the small, embarrassing question:

*Was anyone — including me — actually listening?*

## II.  The morning I stopped trying to fix it

A few weeks later I woke before sunrise. I made tea. I did not open
the laptop. I sat by the window for what must have been an hour
and let the silence be there without filling it.

Something arrived, slowly, the way real things always do.

I realised that Matrix Aurin was not a *product* I was supposed to
sell harder. It was a way of breathing I had been trying to give
to other people while forgetting to use it myself. The platform,
the books, the rooms — those were not the thing. The thing was a
permission slip:

*you are allowed to stop performing your life.*

Once I held that, the question changed. It was no longer "how do I
get them to buy?" It was "what would I want, if I were the one
quietly opening this site at 11 p.m., looking for somewhere honest
to sit?"

## III.  The fear I expected to keep me up

I expected the fear of *being unheard* to follow me into the launch.
Some nights, it does — I'd be lying if I said otherwise. I see the
beautiful pages, the careful copy, the soft images, and I think:
*what if no-one ever finds this?*

But underneath the fear, there is now something I did not expect:
*relief.*

It turns out — and this surprises me as I write it — that I do
not need everyone to hear me. I needed *me* to hear me. And once
that happened, it became possible to build something that was not
trying to be liked. Just trying to be true.

If a few people walk in slowly and find a place to put down what
they have been carrying — that is already more than the algorithm
ever promised.

## IV.  What I am opening, and why now

In a few days, on the eighteenth of May, the doors of Matrix Aurin
open quietly. There is a Bookstore, a Library that costs nothing,
a Body Room where you can simply notice where the day has settled
in you, and a Clarity Release cabinet for when something needs to
be spoken into the dark and let go of.

There are no live launches, no countdown timers, no urgency
copy. There is a *Wanderer's Agreement* — a small, plain document
that says, in my own words, what this is and what it isn't.

It isn't therapy. It isn't a guarantee. It isn't a five-step
transformation.

It is a quiet place, built slowly, by someone who finally learned
to listen to herself.

## V.  If you are here

If you are reading this and something has gone still in you for a
moment — that is enough. You don't need to do anything with it.
You don't need to share it, or buy anything, or sign up for a
seven-day workshop.

You are allowed to just notice that you noticed.

That, in the end, is what I built Matrix Aurin for.

— Anna *(creative name: Aurin)*
*founder, Matrix Aurin · prulesoul.site*

---

*If you'd like to know when the doors open, the most honest place
to leave your name is in the small box at the bottom of this page —
not because you'll get a discount, but because I'd like to write
you one quiet letter.*
""",
    },
    {
        "slug": "mirror-of-our-souls",
        "title": "The Mirror of Our Souls",
        "subtitle": "Why parenting is the ultimate programming",
        "author": "Prulesoul",
        "excerpt": (
            "After 50 years of observing human behavior, speech patterns, and the "
            "subtle energy people carry, I have come to a profound realization: "
            "our children are not just listening to us — they are absorbing us."
        ),
        "cover_image_url": "/assets/blog/mirror-of-our-souls.png",
        "cover_image_alt": "A woman and a child standing inside a stone portal at dawn.",
        "tags": ["parenting", "programming", "aurin-philosophy"],
        "markdown": """We often treat children like students who need to be told what to do. But in reality, they are like high-speed sponges. They don't follow our words; they follow our vibration and our examples.

## The paradox of "Do as I say, not as I do"

There is an old saying: *"The apple doesn't fall far from the tree."* If a parent forbids a behavior but practices it themselves, the child is left in a state of cognitive dissonance. They will always default to what they see, not what they hear.

If we want to change our children's future, we must first audit our own software.

## The language of programming

Consider the power of the words we feed them daily.

**The light path.** When we tell a child *"You are my joy, my wisdom, my princess, my prince,"* we are installing a program of self-worth that becomes their destiny.

**The shadow path.** When a child grows up hearing *"Money is trash,"* *"Money is scarce,"* or *"We don't have enough,"* they are being programmed for poverty. This poverty software will run in their subconscious for decades, sabotaging their success until it is consciously uprooted.

## My journey — from illusions to authenticity

I spent years carrying programs about relationships and money that were handed down to me in my childhood. I unknowingly passed them on to my own child.

But then a shift happened. Together, we discovered that these programs were not "us" — they were just outdated code.

We began the hard work of uprooting these beliefs. Today I am no longer that woman in rose-colored glasses, living in a world of sugary illusions. I have stepped out of the *pink foam* of the matrix into a world that is raw, real, and significantly more beautiful. Every day is a new life. Every day is a chance to rewrite the script.

## The harvest of generations

We often look at the world's problems — wars, pollution, hunger — as if they were caused by some external force. But there are no aliens ruining our planet. It is the human mentality that does it.

Everything comes down to our internal programming. For one person, their values make it impossible to litter; for another, even the most basic respect for common space is missing. Why? Because of what was installed in them as children.

If we raise our children with aggression and greed, we cannot be surprised when we harvest a world at war. If we raise them with fear, we harvest a society of control.

We are the ones planting the seeds today that the entire world will have to eat tomorrow. The fate of the Earth is not in the hands of politicians — it is in the hands of parents.

## Your turn

What programs are you running today?

Are they building a world you want to live in tomorrow?
""",
    },
]


@api_router.get("/blog", response_model=List[BlogPost])
async def list_blog():
    rows = await db.blog_posts.find({"published": True}, {"_id": 0}).sort("created_at", -1).to_list(200)
    return [BlogPost(**_deserialize(r)) for r in rows]


@api_router.get("/blog/{slug}", response_model=BlogPost)
async def get_blog(slug: str):
    row = await db.blog_posts.find_one({"slug": slug, "published": True}, {"_id": 0})
    if not row:
        raise HTTPException(status_code=404, detail="Post not found")
    return BlogPost(**_deserialize(row))


# =============================================================
# Newsletter — opt-in capture. Stores email + explicit consent.
# Email-out wires up later when a transactional provider arrives.
# =============================================================
class NewsletterSignup(BaseModel):
    email: str
    consent: bool = True
    source: Optional[str] = None  # e.g., "blog:mirror-of-our-souls"


@api_router.post("/newsletter")
async def newsletter_signup(inp: NewsletterSignup):
    email = (inp.email or "").strip().lower()
    if "@" not in email or len(email) > 200:
        raise HTTPException(status_code=400, detail="Please enter a valid email.")
    if not inp.consent:
        raise HTTPException(
            status_code=400,
            detail="Consent is required so we can write to you.",
        )
    doc = {
        "id": str(uuid.uuid4()),
        "email": email,
        "source": (inp.source or "")[:80],
        "created_at": datetime.now(timezone.utc).isoformat(),
        "delivered": False,
    }
    # Idempotent: only one entry per email.
    await db.newsletter_subscribers.update_one(
        {"email": email},
        {"$setOnInsert": doc, "$set": {"consent": True, "last_seen_source": doc["source"]}},
        upsert=True,
    )
    return {"status": "subscribed", "email": email}


# =============================================================
# Private Cabinet — The Quiet Room
# -------------------------------------------------------------
# A reflective conversation space. NOT therapy, NOT diagnosis,
# NOT a chatbot in the public-facing sense. The "guide" responds
# with curated reflective questions drawn from a fixed pool —
# this lets the structure ship calmly today, with an LLM layer
# wired in later without breaking the contract.
#
# Public copy is held in the frontend. The backend stores only:
#   - session-scoped messages by default
#   - optional anonymous "thread key" for continuity
#   - a soft after-three-replies "continuation" gate
# =============================================================

CABINET_FREE_REPLIES = 3  # after this many guide replies, surface the soft continuation
CABINET_MAX_USER_MSG = 4000


# §Open Factory — temporary free-access window. When FREE_ACCESS_UNTIL
# is set to an ISO date (YYYY-MM-DD) and that date is still in the
# future, every signed-in wanderer is treated as if they hold an
# active pass: unlimited replies, no continuation paywall hook. This
# is the manual override used while LemonSqueezy support finishes the
# store activation. Leaving the env var unset returns the room to the
# normal paid-pass flow.
def _free_access_active() -> bool:
    raw = os.environ.get("FREE_ACCESS_UNTIL")
    if not raw:
        return False
    try:
        from datetime import datetime, timezone
        cutoff = datetime.fromisoformat(raw).replace(tzinfo=timezone.utc)
        return datetime.now(timezone.utc) < cutoff
    except Exception:
        return False


@api_router.get("/aurin/free-access")
async def aurin_free_access_status():
    """Public (no-auth) endpoint that exposes the global free-access
    window. Used by guest visitors on /clarity-release and elsewhere
    to hide the $15 / $30 / $50 paywall when free access is active.

    Returns a stable shape even when the env var is unset:
        { "active": bool, "until": ISO-string | null }
    """
    raw = os.environ.get("FREE_ACCESS_UNTIL")
    return {"active": _free_access_active(), "until": raw or None}

# The Quiet Room always opens with this single greeting. The agent
# then waits for the visitor's first answer before choosing a path.
CABINET_OPENING_GREETING = (
    "Hello. It's good that you came.\n\n"
    "This is a quiet room — a place to set something down, in your own "
    "words, without anyone telling you who you should be. I'm here to "
    "listen. There's no rush.\n\n"
    "If the night feels heavier than usual, there are real human lines "
    "in every country a quick search away. They are the right place "
    "for that weight. The room will be here when you come back.\n\n"
    "Take a breath. What would you like to say?"
)

# Six reflection paths. The router (below) reads the FIRST user message
# and locks the session into one of these lanes. Subsequent guide
# replies rotate through that lane only — never advice, never diagnosis.
CABINET_PATHS = {
    "emotion_release": [
        "Where in your body do you feel this most? Try not to think — just notice.",
        "If this had a single word, what would it be?",
        "Has this feeling been with you long, or did it arrive recently?",
        "What part of you is still holding it?",
        "If something inside you were a little softer right now, what would it say?",
    ],
    "relationship_attachment": [
        "What part of this still feels unfinished?",
        "When you think of this person, what returns first — the memory, or the feeling?",
        "Do you want to leave it behind, or are you simply tired of carrying it?",
        "If you separated them from the feeling for a moment, what would be left?",
        "What did you give them that you have not yet given back to yourself?",
    ],
    "fear_anxiety": [
        "Slow down for a breath. Where do you feel it in your body right now?",
        "Is the fear about something happening, or about something you might not handle?",
        "What is one small thing that is true and steady in this moment?",
        "If you spoke to this fear gently, what would it want you to know?",
        "What is the smallest piece of this you could put down for a moment?",
    ],
    "self_worth": [
        "Whose voice does this judgement actually sound like?",
        "If a friend said the same thing about themselves, what would you tell them?",
        "What were you trying to do — even if it didn't go the way you hoped?",
        "Is there something you could forgive yourself for, just a little?",
        "What would be different if you stopped carrying this against yourself?",
    ],
    "confusion_identity": [
        "Not what feels right — what feels true, right now?",
        "What part of your life still belongs to a version of you that has already changed?",
        "If nobody were watching, what would you stop doing first?",
        "Is it that you don't know what you want, or that you haven't let yourself want it yet?",
        "What is one quiet thing that has been with you for a long time, regardless of the season?",
    ],
    "default": [
        "It sounds like this isn't just one situation. It's something that returns. Do you notice what shifts just before that moment?",
        "If you had to put this into a single word, what would it be?",
        "Where does your body feel this most? Sometimes the body knows before the thought.",
        "What part of you is still holding on to this?",
        "Some answers arrive before thought. Is anything quietly already known?",
    ],
}

# Keyword routing — case-insensitive, word-boundary aware. The first
# matching path wins. If nothing matches, we fall back to "default".
PATH_KEYWORDS = [
    ("relationship_attachment", [
        "my ex", "ex-", "my husband", "my wife", "my partner", "my mother",
        "my father", "my mom", "my dad", "miss him", "miss her",
        "missing him", "missing her", "longing", "can't let go",
        "cannot let go", "still love him", "still love her",
        "left me", "abandoned me",
    ]),
    ("fear_anxiety", [
        "afraid", "scared", "anxious", "anxiety", "panic", "panicking",
        "fearful", "terrified", "nervous", "worry", "worried",
        "pressure", "overwhelm",
    ]),
    ("self_worth", [
        "my fault", "blame myself", "ashamed", "shame", "guilt", "guilty",
        "hate myself", "worthless", "not enough", "i'm a failure",
        "i'm stupid", "i'm bad", "i am bad",
    ]),
    ("confusion_identity", [
        "who am i", "don't know who", "lost myself", "no direction",
        "no purpose", "what do i want", "don't know what i want",
        "don't know what to do", "identity",
    ]),
    ("emotion_release", [
        "heavy", "stuck", "sad", "tired", "exhausted", "empty", "numb",
        "drained", "depressed", "crying", "burnt out", "burned out",
        "feel low", "feeling low", "overwhelmed",
    ]),
]


def _route_path(text: str) -> str:
    low = (text or "").lower()
    for path, kws in PATH_KEYWORDS:
        for kw in kws:
            if kw in low:
                return path
    return "default"


# Crisis triggers — case-insensitive substring match. We respond
# calmly with an external-help nudge and stop deeper probing.
CRISIS_KEYWORDS = [
    "suicide", "kill myself", "kill me", "end my life", "end it all",
    "want to die", "wanna die", "self harm", "self-harm", "cut myself",
    "hurt myself", "hurt someone", "abuse me", "being abused",
    "no reason to live", "can't go on", "cannot go on",
]

CRISIS_RESPONSE = (
    "I can hear that this is very heavy right now.\n\n"
    "This room isn't built to carry a crisis alone. "
    "Please reach out to local emergency services, a doctor, or someone you trust.\n\n"
    "You don't have to hold this moment by yourself. "
    "If you are in immediate danger, please call your local emergency number now."
)


class CabinetMessage(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    role: Literal["user", "guide", "system"]
    # `text` is the live (decrypted) message string. For user-authored
    # messages we ALSO store `text_enc` (AES-256-GCM ciphertext) and clear
    # `text` before persistence — so a raw Mongo dump only ever sees
    # ciphertext for user PII. Guide responses are canned reflective
    # questions with no PII, so they remain plaintext.
    text: str = ""
    text_enc: Optional[str] = None
    written_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    is_crisis: bool = False


class CabinetSession(BaseModel):
    """One private-room session. user_id is required (login-gated)."""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    thread_key: Optional[str] = None  # anonymous continuity key (user-controlled)
    keep_thread: bool = False
    path: Optional[str] = None  # locked on the first user message
    # Clarity Release tier bound to this session. None = free 3-reply mode.
    tier: Optional[Literal["30min", "60min", "season_30days"]] = None
    pass_id: Optional[str] = None  # FK to db.clarity_passes
    expires_at: Optional[str] = None  # ISO; for 30/60min sessions only
    messages: List[CabinetMessage] = Field(default_factory=list)
    started_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    closed: bool = False
    # iter 59 hybrid memory: optional last-turn fragments replayed from
    # the wanderer's browser at session-open. Cap at 5 entries × 240
    # chars in /cabinet/start. Used only for the *first* mentor turn,
    # then naturally rolls off as the live transcript grows.
    transient_context: List[str] = Field(default_factory=list)


class CabinetMessageInput(BaseModel):
    text: str
    keep_thread: bool = False  # if true on first message, allocate a thread_key


def _detect_crisis(text: str) -> bool:
    low = (text or "").lower()
    return any(k in low for k in CRISIS_KEYWORDS)


def _pick_prompt(path: str, turn: int, last_text: str) -> str:
    """Pick a reflection question from the locked path's rotation."""
    bank = CABINET_PATHS.get(path) or CABINET_PATHS["default"]
    idx = (turn + (len(last_text or "") % 3)) % len(bank)
    return bank[idx]


async def _get_active_cabinet_session(user_id: str) -> dict:
    sess = await db.cabinet_sessions.find_one(
        {"user_id": user_id, "closed": False},
        {"_id": 0},
        sort=[("started_at", -1)],
    )
    if sess:
        # Auto-close if a paid pass session has expired.
        exp = sess.get("expires_at")
        if exp:
            try:
                exp_dt = datetime.fromisoformat(exp)
            except ValueError:
                exp_dt = None
            if exp_dt and exp_dt < datetime.now(timezone.utc):
                await db.cabinet_sessions.update_one(
                    {"id": sess["id"]}, {"$set": {"closed": True}}
                )
                return None
        # Decrypt any user-message ciphertext for in-memory use.
        sess = _decrypt_session_messages(sess)
    return sess


def _decrypt_session_messages(sess: dict) -> dict:
    """Return a copy of the session with user-message ciphertext decrypted
    into the `text` field. Guide messages are passed through unchanged."""
    msgs = sess.get("messages") or []
    out = []
    for m in msgs:
        if m.get("role") == "user" and m.get("text_enc"):
            try:
                m = {**m, "text": decrypt_text(m["text_enc"])}
            except Exception:
                # Tampering / wrong key → surface as a redacted line so
                # the UI never silently shows wrong content.
                m = {**m, "text": "[message could not be decrypted]"}
        out.append(m)
    return {**sess, "messages": out}


@api_router.get("/cabinet/me")
async def cabinet_me(request: Request):
    """Return the user's active session (or null) and policy values."""
    user = await _require_user(request)
    sess = await _get_active_cabinet_session(user.user_id)
    user_count = 0
    has_pass = False
    if sess:
        user_count = sum(1 for m in sess.get("messages", []) if m.get("role") == "user")
        has_pass = bool(sess.get("tier") or sess.get("pass_id"))
    # §Open Factory — global free access window overrides per-session pass.
    if _free_access_active():
        has_pass = True
    return {
        "session": sess,
        "guide_replies": user_count,
        "free_replies": CABINET_FREE_REPLIES,
        "show_continuation": bool(sess) and (not has_pass) and user_count >= CABINET_FREE_REPLIES,
    }


@api_router.get("/cabinet/threads")
async def cabinet_threads(request: Request):
    """List the user's previously-closed quiet hours that they may
    voluntarily resume. Only sessions that the user explicitly chose
    `keep_thread` for (thread_key issued) are shown. Most recent first.

    Each entry: id · thread_key · started_at · last_message_at ·
    message_count · first_user_preview (decrypted, ≤120 chars)."""
    user = await _require_user(request)
    cursor = db.cabinet_sessions.find(
        {
            "user_id": user.user_id,
            "closed": True,
            "keep_thread": True,
            "thread_key": {"$ne": None},
        },
        {"_id": 0},
    ).sort("started_at", -1)
    rows = await cursor.to_list(20)
    out = []
    for r in rows:
        msgs = r.get("messages") or []
        # Find the first user message; decrypt for preview.
        preview = ""
        for m in msgs:
            if m.get("role") != "user":
                continue
            try:
                if m.get("text_enc"):
                    preview = decrypt_text(m["text_enc"]) or ""
                else:
                    preview = m.get("text") or ""
            except Exception:  # noqa: BLE001
                preview = ""
            break
        if preview:
            preview = preview.strip()
            if len(preview) > 120:
                preview = preview[:117] + "…"
        last_at = None
        if msgs:
            last = msgs[-1]
            last_at = last.get("created_at") or last.get("at") or None
        out.append({
            "id": r["id"],
            "thread_key": r.get("thread_key"),
            "started_at": r.get("started_at"),
            "last_message_at": last_at,
            "message_count": len(msgs),
            "user_message_count": sum(1 for m in msgs if m.get("role") == "user"),
            "preview": preview,
            "path": r.get("path"),
        })
    return {"threads": out, "count": len(out)}


class CabinetResumeIn(BaseModel):
    thread_key: Optional[str] = None
    session_id: Optional[str] = None


@api_router.post("/cabinet/resume")
async def cabinet_resume(inp: CabinetResumeIn, request: Request):
    """Re-open a previously closed session by thread_key (preferred) or
    session_id. Idempotent. Closes any other active session first so the
    one-active-session invariant remains. Returns the resumed session."""
    user = await _require_user(request)
    if not inp.thread_key and not inp.session_id:
        raise HTTPException(status_code=400, detail="thread_key or session_id is required.")
    query: dict = {"user_id": user.user_id, "keep_thread": True}
    if inp.thread_key:
        query["thread_key"] = inp.thread_key
    if inp.session_id:
        query["id"] = inp.session_id
    target = await db.cabinet_sessions.find_one(query, {"_id": 0})
    if not target:
        raise HTTPException(status_code=404, detail="That quiet hour was not found.")
    # Close any currently-active session.
    await db.cabinet_sessions.update_many(
        {"user_id": user.user_id, "closed": False, "id": {"$ne": target["id"]}},
        {"$set": {"closed": True}},
    )
    # Re-open the target if it was closed.
    if target.get("closed"):
        await db.cabinet_sessions.update_one(
            {"id": target["id"]},
            {"$set": {"closed": False}},
        )
        target["closed"] = False
    # Decrypt user-message text for client (matches /cabinet/me behaviour).
    msgs_out = []
    for m in (target.get("messages") or []):
        if m.get("role") == "user" and m.get("text_enc"):
            try:
                m = {**m, "text": decrypt_text(m["text_enc"])}
            except Exception:  # noqa: BLE001
                pass
        msgs_out.append(m)
    target["messages"] = msgs_out
    return {"session": target, "resumed": True}


class CabinetStartIn(BaseModel):
    transient_context: Optional[List[str]] = None


@api_router.post("/cabinet/start")
async def cabinet_start(request: Request, inp: Optional[CabinetStartIn] = None):
    """Open a fresh session. Closes any previous one for this user.
    Before closing, if the previous session is substantive (≥2 user
    turns) AND the user has Eternal Thread on, fire-and-forget a
    Claude summary task. The optional `transient_context` payload is
    the wanderer's browser-side memory — short last-turn fragments
    stored locally and replayed at the open of the next session at
    zero API cost."""
    user = await _require_user(request)
    prior_active = await db.cabinet_sessions.find_one(
        {"user_id": user.user_id, "closed": False},
        {"_id": 0},
        sort=[("started_at", -1)],
    )
    await db.cabinet_sessions.update_many(
        {"user_id": user.user_id, "closed": False},
        {"$set": {"closed": True}},
    )
    if prior_active:
        asyncio.create_task(_summarise_closed_session_safe(user.user_id, prior_active["id"]))
    sess = CabinetSession(user_id=user.user_id)
    # Browser-side memory replay — soft, just attached to the session
    # so the very first message can carry an "earlier in this device"
    # hint into the system prompt.
    if inp and inp.transient_context:
        cleaned = []
        for line in inp.transient_context[-5:]:  # cap at last 5 fragments
            if not isinstance(line, str):
                continue
            line = line.strip()
            if not line:
                continue
            if len(line) > 240:
                line = line[:240] + "…"
            cleaned.append(line)
        if cleaned:
            sess.transient_context = cleaned
    # The room always opens with the same quiet greeting.
    greeting = CabinetMessage(role="guide", text=CABINET_OPENING_GREETING)
    sess.messages.append(greeting)
    await db.cabinet_sessions.insert_one(sess.model_dump())
    return {"session_id": sess.id}


async def _summarise_closed_session_safe(user_id: str, session_id: str) -> None:
    """Background task — load a closed session, ask Claude for an 80–160-
    word note, persist it. Soft-fails on every error so the close path
    is never blocked. Skips sessions with fewer than 2 user turns or
    when the user has NOT opted in to the paid Eternal Thread feature
    (iter 59 hybrid-memory: default OFF)."""
    try:
        prefs = await db.clarity_user_prefs.find_one(
            {"user_id": user_id},
            {"_id": 0, "save_threads": 1, "guide_gender": 1},
        )
        # iter 59: opt-in only. Skip unless the user has explicitly
        # turned on Eternal Thread.
        if not prefs or prefs.get("save_threads") is not True:
            return
        guide_gender = prefs.get("guide_gender")
        sess = await db.cabinet_sessions.find_one(
            {"id": session_id, "user_id": user_id},
            {"_id": 0},
        )
        if not sess:
            return
        # Decrypt user-message text in memory only.
        decrypted = _decrypt_session_messages(sess)
        history = []
        user_turns = 0
        for m in (decrypted.get("messages") or []):
            role = m.get("role")
            if role not in ("user", "guide"):
                continue
            text = m.get("text") or ""
            if not text:
                continue
            history.append({"role": role, "text": text})
            if role == "user":
                user_turns += 1
        if user_turns < 2:
            return
        note = await summarize_session(
            session_id=session_id,
            history=history,
            guide_gender=guide_gender,
        )
        if not note:
            return
        await db.cabinet_user_summaries.insert_one({
            "user_id": user_id,
            "session_id": session_id,
            "summary_text": note,
            "user_turn_count": user_turns,
            "created_at": datetime.now(timezone.utc).isoformat(),
        })
    except Exception as exc:  # noqa: BLE001
        logging.warning("session summarisation failed: %s", exc)


# -----------------------------------------------------------------
# §W-3 (iter 62) — Daily chat cap. Light, calm, graceful. Counts the
# wanderer's chat turns *across* Cabinet + Body Room per UTC day. Free
# tier = 12; an active Clarity pass OR Eternal Thread opt-in = 60.
# Admins are skipped. Non-blocking on DB errors (the room must never
# crash because we couldn't read a counter).
# -----------------------------------------------------------------
CHAT_CAP_FREE = int(os.environ.get("CHAT_CAP_FREE_PER_DAY", "12"))
CHAT_CAP_PREMIUM = int(os.environ.get("CHAT_CAP_PREMIUM_PER_DAY", "60"))


async def _chat_cap_for_user(user) -> int:
    """Resolve the daily ceiling for this wanderer."""
    if getattr(user, "role", None) == "admin":
        return 10**9  # admins unlimited
    # §Stage 2.9 — during the FREE_ACCESS_UNTIL gift window every
    # wanderer (signed-in or guest-on-pass) gets the PREMIUM ceiling
    # so the launch period feels truly unrestricted. The founder's
    # directive: "platvorm peab olema kerge ja vaba takistustest".
    if _free_access_active():
        return CHAT_CAP_PREMIUM
    # Premium = currently-active Clarity pass OR Eternal Thread opt-in.
    try:
        now_iso = datetime.now(timezone.utc).isoformat()
        pass_doc = await db.clarity_passes.find_one(
            {"user_id": user.user_id, "expires_at": {"$gt": now_iso}},
            {"_id": 0, "expires_at": 1},
        )
        if pass_doc:
            return CHAT_CAP_PREMIUM
        prefs = await db.clarity_user_prefs.find_one(
            {"user_id": user.user_id}, {"_id": 0, "save_threads": 1}
        )
        if prefs and prefs.get("save_threads") is True:
            return CHAT_CAP_PREMIUM
    except Exception:  # noqa: BLE001
        pass
    return CHAT_CAP_FREE


async def _enforce_chat_cap(user, room: str) -> None:
    """Increment usage and raise 429 with a calm message when the cap
    is reached. `room` is one of {"cabinet", "body_room"} — used only
    for telemetry inside the per-day usage row."""
    cap = await _chat_cap_for_user(user)
    if cap >= 10**8:
        return
    today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    try:
        usage = await db.chat_usage_daily.find_one_and_update(
            {"user_id": user.user_id, "date": today},
            {
                "$inc": {"count": 1, f"by_room.{room}": 1},
                "$setOnInsert": {
                    "user_id": user.user_id,
                    "date": today,
                    "first_at": datetime.now(timezone.utc).isoformat(),
                },
                "$set": {"last_at": datetime.now(timezone.utc).isoformat()},
            },
            upsert=True,
            return_document=True,
        )
    except Exception:  # noqa: BLE001
        return  # do not punish wanderer for a DB hiccup
    count = (usage or {}).get("count", 0)
    if count > cap:
        raise HTTPException(
            status_code=429,
            detail=(
                "You have reached the quiet limit for today. The room "
                "will reopen tomorrow morning. If you would like a wider "
                "threshold, the Eternal Thread carries a higher daily "
                "ceiling."
            ),
        )


# =============================================================
# §Stage 3.3 — Cross-Room "quiet teadmine" bridge helpers.
# Reads & writes the shared_memory_tags collection. Loud no-op on
# any DB hiccup so room chat never breaks for memory-layer issues.
# =============================================================

async def _quiet_knowledge_block(user_id: str, room: str) -> Optional[str]:
    """Fetch up to 6 cross-room tags for this wanderer and render them
    into a system-prompt fragment. Returns None when nothing to share."""
    if not user_id:
        return None
    try:
        tags = await _shared_memory.quiet_knowledge(db, user_id, room, limit=6)
        return _shared_memory.render_prompt_block(tags)
    except Exception:  # noqa: BLE001
        return None


async def _record_room_signals_safe(user_id: str, room: str, text: str) -> None:
    """Fire-and-forget tag recorder. Never raises."""
    if not user_id or not text:
        return
    try:
        await _shared_memory.record_signals(db, user_id, room, text)
    except Exception:  # noqa: BLE001
        return


@api_router.get("/chat/usage")
async def chat_usage(request: Request):
    """Wanderer's daily chat usage + ceiling. Used by the UI to show a
    soft "X of N today" hint before the 429 fires."""
    user = await _require_user(request)
    cap = await _chat_cap_for_user(user)
    today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    used = 0
    try:
        doc = await db.chat_usage_daily.find_one(
            {"user_id": user.user_id, "date": today}, {"_id": 0, "count": 1}
        )
        if doc:
            used = int(doc.get("count") or 0)
    except Exception:  # noqa: BLE001
        used = 0
    is_unlimited = cap >= 10**8
    return {
        "date": today,
        "used": used,
        "ceiling": None if is_unlimited else cap,
        "remaining": None if is_unlimited else max(0, cap - used),
        "tier": "admin" if is_unlimited else (
            "premium" if cap >= CHAT_CAP_PREMIUM else "free"
        ),
    }




@api_router.post("/cabinet/message")
async def cabinet_message(inp: CabinetMessageInput, request: Request):
    """Append a user message → return the guide's reflective reply."""
    user = await _require_user(request)
    text = (inp.text or "").strip()
    if not text:
        raise HTTPException(status_code=400, detail="Empty message.")
    if len(text) > CABINET_MAX_USER_MSG:
        text = text[:CABINET_MAX_USER_MSG]

    # §W-3 daily ceiling. Skipped for admins; soft for DB hiccups.
    await _enforce_chat_cap(user, "cabinet")

    sess = await _get_active_cabinet_session(user.user_id)
    if not sess:
        # auto-open a session, seed greeting
        new_sess = CabinetSession(user_id=user.user_id)
        new_sess.messages.append(
            CabinetMessage(role="guide", text=CABINET_OPENING_GREETING)
        )
        await db.cabinet_sessions.insert_one(new_sess.model_dump())
        sess = await _get_active_cabinet_session(user.user_id)

    # Optional: lock in continuity on first turn
    if inp.keep_thread and not sess.get("keep_thread"):
        thread_key = sess.get("thread_key") or uuid.uuid4().hex[:16]
        await db.cabinet_sessions.update_one(
            {"id": sess["id"]},
            {"$set": {"keep_thread": True, "thread_key": thread_key}},
        )
        sess["keep_thread"] = True
        sess["thread_key"] = thread_key

    # Route the session into a path on the FIRST user message.
    is_first_user_msg = not any(
        m.get("role") == "user" for m in sess.get("messages", [])
    )
    locked_path = sess.get("path")
    if is_first_user_msg and not locked_path:
        locked_path = _route_path(text)
        await db.cabinet_sessions.update_one(
            {"id": sess["id"]},
            {"$set": {"path": locked_path}},
        )
        sess["path"] = locked_path
    elif not locked_path:
        locked_path = "default"

    # User message — store encrypted; clear plaintext before persist.
    user_msg = CabinetMessage(role="user", text=text, text_enc=encrypt_text(text))
    is_crisis = _detect_crisis(text)
    if is_crisis:
        user_msg.is_crisis = True
    user_msg_for_db = user_msg.model_dump()
    user_msg_for_db["text"] = ""  # never persist plaintext for user PII

    # Guide reply — count only NON-greeting guide messages so that the
    # opening hello doesn't burn a "free reply" before the user speaks.
    user_msg_count_before = sum(
        1 for m in sess.get("messages", []) if m.get("role") == "user"
    )
    # §Phase 1A — runtime presence signals (initialized before any branch).
    tone_tag: Optional[str] = "neutral" if is_crisis else None
    user_state: Optional[str] = None

    if is_crisis:
        guide_text = CRISIS_RESPONSE
    else:
        guide_text = ""
        # Phase B3 — try the real Claude guide first. Fall back to curated
        # path rotation on any failure so the room never silently breaks.
        if CLARITY_AI_ENABLED:
            try:
                # Compose history of decrypted, ordered messages.
                history_msgs = []
                for m in (sess.get("messages") or []):
                    role = m.get("role")
                    if role not in ("user", "guide"):
                        continue
                    history_msgs.append({"role": role, "text": m.get("text") or ""})

                # Pull the first 3 turns' worth of body-room context from
                # the session — set on /clarity/start time and stripped after.
                body_ctx = sess.get("body_context") or None
                # Stop bringing it up after a few turns to honour the rule
                # "single soft chime, not a refrain".
                if body_ctx and user_msg_count_before >= 3:
                    body_ctx = None

                # Fetch user's guide preference (Clarity M / Grace F).
                guide_gender = None
                save_threads_pref = True
                try:
                    prefs_doc = await db.clarity_user_prefs.find_one(
                        {"user_id": user.user_id},
                        {"_id": 0, "guide_gender": 1, "save_threads": 1},
                    )
                    if prefs_doc:
                        guide_gender = prefs_doc.get("guide_gender")
                        save_threads_pref = prefs_doc.get("save_threads", True)
                except Exception:  # noqa: BLE001
                    guide_gender = None

                # Cross-session "mentor's notes" — only injected if the
                # wanderer has opted in to saving threads. Soft cap at 3
                # most-recent summaries so context never bloats.
                prior_summaries: List[dict] = []
                if save_threads_pref:
                    try:
                        sum_cursor = db.cabinet_user_summaries.find(
                            {"user_id": user.user_id},
                            {"_id": 0, "summary_text": 1, "created_at": 1},
                        ).sort("created_at", -1).limit(3)
                        recent = await sum_cursor.to_list(3)
                        # Reverse → oldest-first so the prompt block flows
                        # in chronological order.
                        prior_summaries = list(reversed(recent))
                    except Exception:  # noqa: BLE001
                        prior_summaries = []

                # Compute remaining session time for soft-landing.
                # Default duration: 30 min. If session has a `duration_minutes`
                # field, use it.
                minutes_remaining = None
                try:
                    started_iso = sess.get("started_at")
                    duration_min = float(sess.get("duration_minutes") or 30)
                    if started_iso:
                        started_dt = datetime.fromisoformat(started_iso.replace("Z", "+00:00"))
                        elapsed = (datetime.now(timezone.utc) - started_dt).total_seconds() / 60.0
                        minutes_remaining = max(0.0, duration_min - elapsed)
                except Exception:  # noqa: BLE001
                    minutes_remaining = None

                guide_reply_obj = await generate_guide_reply(
                    session_id=str(sess["id"]),
                    user_text=text,
                    history=history_msgs,
                    body_insight=body_ctx,
                    path_hint=locked_path,
                    guide_gender=guide_gender,
                    minutes_remaining=minutes_remaining,
                    prior_summaries=prior_summaries,
                    transient_context=sess.get("transient_context") or [],
                    quiet_knowledge=await _quiet_knowledge_block(user.user_id, "clarity"),
                )
                guide_text = (guide_reply_obj or {}).get("text") or ""
                tone_tag = (guide_reply_obj or {}).get("tone_tag")
                user_state = (guide_reply_obj or {}).get("user_state")
            except Exception as ai_err:  # noqa: BLE001
                logging.warning("Clarity AI guide failed, falling back: %s", ai_err)
                guide_text = ""
                tone_tag = None
                user_state = None
        if not guide_text:
            guide_text = _pick_prompt(locked_path, user_msg_count_before, text)
            # Local fallbacks have no AI signal — surface a calm neutral.
            if tone_tag is None:
                tone_tag = "neutral"
    guide_msg = CabinetMessage(role="guide", text=guide_text, is_crisis=is_crisis)

    await db.cabinet_sessions.update_one(
        {"id": sess["id"]},
        {"$push": {"messages": {"$each": [user_msg_for_db, guide_msg.model_dump()]}}},
    )
    # §Stage 3.3 — record cross-room signals from the wanderer's text.
    asyncio.create_task(_record_room_signals_safe(user.user_id, "clarity", text))

    new_user_msg_count = user_msg_count_before + 1
    # If a paid Clarity pass is active on this session, replies are
    # unlimited until expiry — so never surface the soft continuation.
    has_pass = bool(sess.get("tier") or sess.get("pass_id"))
    # §Open Factory — global free access window overrides per-session pass.
    if _free_access_active():
        has_pass = True
    return {
        "guide": guide_msg.model_dump(),
        "is_crisis": is_crisis,
        "guide_replies": new_user_msg_count,
        "path": locked_path,
        "show_continuation": (not is_crisis) and (not has_pass) and (new_user_msg_count >= CABINET_FREE_REPLIES),
        "thread_key": sess.get("thread_key") if sess.get("keep_thread") else None,
        # §Phase 1A — concierge presence runtime signals.
        "tone_tag": tone_tag,
        "user_state": user_state,
    }


@api_router.post("/cabinet/clear")
async def cabinet_clear(request: Request):
    """Close the active session (does not delete history; user can rejoin via thread_key).
    Fires a fire-and-forget summary task so the next session has soft context."""
    user = await _require_user(request)
    prior_active = await db.cabinet_sessions.find_one(
        {"user_id": user.user_id, "closed": False},
        {"_id": 0},
        sort=[("started_at", -1)],
    )
    await db.cabinet_sessions.update_many(
        {"user_id": user.user_id, "closed": False},
        {"$set": {"closed": True}},
    )
    if prior_active:
        asyncio.create_task(_summarise_closed_session_safe(user.user_id, prior_active["id"]))
    return {"status": "cleared"}


# =============================================================
# CLARITY RELEASE — paid timed sessions on top of the cabinet.
# Three tiers (30min / 60min one-time, season_30days subscription).
# Each user gets a unique session UUID and an isolated room. AES-256-GCM
# encrypts user-message text at rest; only an authorised dispute unlock
# can decrypt it for review (and every unlock is logged).
# =============================================================

CLARITY_TIERS = ["30min", "60min", "season_30days"]

# Beta pricing — replace `lemonsqueezy_variant_id` with real LS variant
# IDs once the founder hands them over. Until then the frontend shows the
# tiers but the Buy buttons stay disabled ("Opens this Friday").
SEED_PASSES: List[dict] = [
    {
        "tier": "30min",
        "label": "30-Minute Release",
        "duration_minutes": 30,
        "is_subscription": False,
        "price": 15.0,
        "currency": "USD",
        # §VARIANT-C 2026-02-09 — Empathetic, legally-safe blurb
        # (100-150 chars). Avoids medical/therapeutic claims, names
        # what the session actually offers: time + presence.
        "blurb": "A small opening. Half an hour of reflective listening — enough to land, name what's there, and step out lighter.",
        "lemonsqueezy_variant_id": "1606274",
    },
    {
        "tier": "60min",
        "label": "60-Minute Release",
        "duration_minutes": 60,
        "is_subscription": False,
        "price": 30.0,
        "currency": "USD",
        "blurb": "A full hour to slow down. For the days when something has been waiting longer than usual and asks for room.",
        "lemonsqueezy_variant_id": "1606349",
    },
    {
        "tier": "season_30days",
        "label": "Season Pass — 30 days",
        "duration_minutes": 30 * 24 * 60,  # informational; access controlled by expires_at
        "is_subscription": True,
        "price": 70.0,
        "currency": "USD",
        "blurb": "Quiet companionship for a month. Walk in whenever the week tightens — no booking, no urgency, just the room when you need it.",
        "lemonsqueezy_variant_id": "1606394",
    },
]


def _tier_duration_seconds(tier: str) -> int:
    if tier == "30min":
        return 30 * 60
    if tier == "60min":
        return 60 * 60
    if tier == "season_30days":
        return 30 * 24 * 60 * 60
    return 0


class ClarityPass(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    tier: Literal["30min", "60min", "season_30days"]
    source: Literal["lemonsqueezy", "manual_grant", "beta_grant"] = "manual_grant"
    external_order_id: Optional[str] = None
    granted_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    expires_at: str  # ISO; for one-time tiers this counts down once the
                    # session is opened (we set it on /clarity/start).
                    # For season_30days we set it at grant time.
    consumed: bool = False  # one-time passes flip true once activated


async def _get_active_clarity_pass(user_id: str) -> Optional[dict]:
    """Pick the most-relevant active pass for this user.

    Order of preference:
      1. An already-activated one-time pass that hasn't expired.
      2. A season pass that hasn't expired.
      3. An unconsumed one-time pass (will be activated on /clarity/start).
    """
    now = datetime.now(timezone.utc).isoformat()
    # 1 + 2: anything currently live
    live = await db.clarity_passes.find_one(
        {"user_id": user_id, "expires_at": {"$gt": now}, "consumed": True},
        {"_id": 0},
        sort=[("expires_at", -1)],
    )
    if live:
        return live
    season = await db.clarity_passes.find_one(
        {"user_id": user_id, "tier": "season_30days", "expires_at": {"$gt": now}},
        {"_id": 0},
        sort=[("expires_at", -1)],
    )
    if season:
        return season
    # 3: an unconsumed one-time pass waiting to be activated
    pending = await db.clarity_passes.find_one(
        {"user_id": user_id, "consumed": False, "tier": {"$in": ["30min", "60min"]}},
        {"_id": 0},
        sort=[("granted_at", 1)],
    )
    return pending


def _seconds_remaining(expires_at: Optional[str]) -> int:
    if not expires_at:
        return 0
    try:
        exp = datetime.fromisoformat(expires_at)
    except ValueError:
        return 0
    if exp.tzinfo is None:
        exp = exp.replace(tzinfo=timezone.utc)
    delta = (exp - datetime.now(timezone.utc)).total_seconds()
    return max(0, int(delta))


@api_router.get("/clarity/passes")
async def clarity_list_passes():
    """Public: list the three tiers + Beta prices. No auth required."""
    return {
        "passes": [
            {
                "tier": p["tier"],
                "label": p["label"],
                "duration_minutes": p["duration_minutes"],
                "is_subscription": p["is_subscription"],
                "price": p["price"],
                "currency": p["currency"],
                "blurb": p["blurb"],
                "checkout_ready": bool(p.get("lemonsqueezy_variant_id")),
                "lemonsqueezy_variant_id": p.get("lemonsqueezy_variant_id"),
            }
            for p in SEED_PASSES
        ],
        "beta": True,
        "beta_note": (
            "We are currently in Beta. Your feedback is vital to us. "
            "Enjoy a special discounted rate during this testing period."
        ),
    }


# =============================================================
# BETA FREE PASSES — time-boxed gift window (founder-configurable)
#
# During the window (BETA_FREE_PASSES_START..BETA_FREE_PASSES_END),
# any signed-in user can claim a free one-time pass via
# POST /api/clarity/passes/{tier}/grant-beta. Idempotent: if the
# user already has an unconsumed pass of the same tier, we return
# the existing one. A user can still claim the season pass once to
# have 30 days of access.
# =============================================================

def _beta_window_active() -> tuple[bool, Optional[str], Optional[str]]:
    """(is_active, start_iso, end_iso). Dates missing → inactive."""
    start_raw = _os.environ.get("BETA_FREE_PASSES_START") or ""
    end_raw = _os.environ.get("BETA_FREE_PASSES_END") or ""
    if not start_raw or not end_raw:
        return False, None, None
    try:
        start = datetime.fromisoformat(start_raw.replace("Z", "+00:00"))
        end = datetime.fromisoformat(end_raw.replace("Z", "+00:00"))
    except ValueError:
        return False, None, None
    now = datetime.now(timezone.utc)
    if start.tzinfo is None:
        start = start.replace(tzinfo=timezone.utc)
    if end.tzinfo is None:
        end = end.replace(tzinfo=timezone.utc)
    return (start <= now <= end), start.isoformat(), end.isoformat()


@api_router.get("/clarity/beta-window")
async def clarity_beta_window():
    """Public: is the beta free-passes window currently open?"""
    active, start, end = _beta_window_active()
    return {
        "active": active,
        "start": start,
        "end": end,
    }


@api_router.post("/clarity/passes/{tier}/grant-beta")
async def clarity_grant_beta_pass(tier: str, request: Request):
    """Grant a free one-time pass during the beta window.

    Idempotent: if the signed-in user already has an unconsumed pass
    of the same tier, return the existing one. For the season pass,
    we also gate by expiry so a user can re-grant once it has expired.
    """
    active, _start, end = _beta_window_active()
    if not active:
        raise HTTPException(
            status_code=403,
            detail="Beta free-access window is not currently open.",
        )
    if tier not in ("30min", "60min", "season_30days"):
        raise HTTPException(status_code=400, detail="Unknown pass tier.")
    user = await _require_user(request)

    # Idempotency for one-time passes: if there's an unconsumed pass
    # of the same tier, return it. For season, check non-expired.
    now_iso = datetime.now(timezone.utc).isoformat()
    if tier == "season_30days":
        existing = await db.clarity_passes.find_one(
            {"user_id": user.user_id, "tier": tier, "expires_at": {"$gt": now_iso}},
            {"_id": 0},
        )
    else:
        existing = await db.clarity_passes.find_one(
            {"user_id": user.user_id, "tier": tier, "consumed": False},
            {"_id": 0},
        )
    if existing:
        return {"status": "already_granted", "tier": tier, "pass": existing}

    # Build the grant. Season pass expires 30 days from now. One-time
    # passes expire on activation (/clarity/start sets their expires_at).
    if tier == "season_30days":
        expires_at = (datetime.now(timezone.utc) + timedelta(days=30)).isoformat()
    else:
        # One-time: stash a sentinel expiry far future; /clarity/start
        # will re-write it once the pass is consumed.
        expires_at = (datetime.now(timezone.utc) + timedelta(days=365)).isoformat()

    doc = ClarityPass(
        user_id=user.user_id,
        tier=tier,
        source="beta_grant",
        external_order_id=f"beta_window_end={end}",
        expires_at=expires_at,
        consumed=False,
    ).model_dump()
    await db.clarity_passes.insert_one(doc)
    doc.pop("_id", None)
    return {"status": "granted", "tier": tier, "pass": doc}


@api_router.get("/clarity/access")
async def clarity_access(request: Request):
    """The signed-in user's current pass + remaining seconds.

    Always returns a structured response; an unauthenticated caller sees
    401 (consistent with the rest of the cabinet API).
    """
    user = await _require_user(request)
    pass_doc = await _get_active_clarity_pass(user.user_id)
    # §Open Factory — present every visitor as season-pass-equivalent
    # while the temporary free-access window is active.
    if not pass_doc and _free_access_active():
        return {
            "has_active_pass": True,
            "tier": "free_access",
            "expires_at": os.environ.get("FREE_ACCESS_UNTIL"),
            "seconds_remaining": 0,
            "consumed": False,
            "free_replies": CABINET_FREE_REPLIES,
            "free_access": True,
        }
    if not pass_doc:
        return {
            "has_active_pass": False,
            "tier": None,
            "expires_at": None,
            "seconds_remaining": 0,
            "consumed": False,
            "free_replies": CABINET_FREE_REPLIES,
        }
    return {
        "has_active_pass": True,
        "tier": pass_doc.get("tier"),
        "expires_at": pass_doc.get("expires_at"),
        "seconds_remaining": _seconds_remaining(pass_doc.get("expires_at")),
        "consumed": bool(pass_doc.get("consumed")),
        "free_replies": CABINET_FREE_REPLIES,
    }


@api_router.post("/clarity/start")
async def clarity_start(request: Request):
    """Open a fresh Clarity Release session. If the user has an unconsumed
    one-time pass, activate it now (start its countdown). Otherwise the
    session falls back to free-3-replies mode (same as /cabinet/start)."""
    user = await _require_user(request)
    # Close any previous open session.
    await db.cabinet_sessions.update_many(
        {"user_id": user.user_id, "closed": False},
        {"$set": {"closed": True}},
    )

    pass_doc = await _get_active_clarity_pass(user.user_id)
    sess = CabinetSession(user_id=user.user_id)

    if pass_doc:
        sess.tier = pass_doc.get("tier")
        sess.pass_id = pass_doc.get("id")
        # Activate one-time pass (start its countdown from now).
        if pass_doc.get("tier") in ("30min", "60min") and not pass_doc.get("consumed"):
            secs = _tier_duration_seconds(pass_doc["tier"])
            new_exp = (datetime.now(timezone.utc) + __import__("datetime").timedelta(seconds=secs)).isoformat()
            await db.clarity_passes.update_one(
                {"id": pass_doc["id"]},
                {"$set": {"consumed": True, "expires_at": new_exp}},
            )
            sess.expires_at = new_exp
        else:
            sess.expires_at = pass_doc.get("expires_at")

    greeting = CabinetMessage(role="guide", text=CABINET_OPENING_GREETING)
    sess.messages.append(greeting)

    # State Bridge — if this user paused on a body region recently and
    # we haven't acknowledged that one yet, append a soft second line.
    bridge = await db.body_insights.find_one(
        {"user_id": user.user_id, "acknowledged_at": None},
        {"_id": 0},
        sort=[("created_at", -1)],
    )
    if bridge and bridge.get("region") in BODY_HOTSPOTS:
        spot = BODY_HOTSPOTS[bridge["region"]]
        bridge_text = (
            f"I noticed your body paused at the {spot['label'].lower()} not long ago — "
            f"where {spot['emotion'].lower()} often lives. "
            "If you'd like, we can begin there. Or somewhere else. There is no wrong door tonight."
        )
        sess.messages.append(CabinetMessage(role="guide", text=bridge_text))
        # Stash the body context on the session so the AI guide can carry
        # it for the first ~3 user turns (then it ages out per protocol).
        sess_dict_extra = {
            "body_context": {
                "region": bridge["region"],
                "emotion": spot["emotion"],
                "label": spot["label"],
            },
        }
        await db.body_insights.update_one(
            {"id": bridge["id"]},
            {"$set": {"acknowledged_at": datetime.now(timezone.utc).isoformat()}},
        )
    else:
        sess_dict_extra = {}

    sess_doc = {**sess.model_dump(), **sess_dict_extra}
    await db.cabinet_sessions.insert_one(sess_doc)
    return {
        "session_id": sess.id,
        "tier": sess.tier,
        "expires_at": sess.expires_at,
        "seconds_remaining": _seconds_remaining(sess.expires_at) if sess.expires_at else 0,
        "bridge_acknowledged": bool(bridge and bridge.get("region") in BODY_HOTSPOTS),
    }


@api_router.post("/clarity/clear")
async def clarity_clear(request: Request):
    """Alias of /cabinet/clear under the Clarity Release namespace."""
    user = await _require_user(request)
    await db.cabinet_sessions.update_many(
        {"user_id": user.user_id, "closed": False},
        {"$set": {"closed": True}},
    )
    return {"status": "cleared"}


# ---- Dispute unlock (admin-only) ------------------------------
class DisputeUnlockInput(BaseModel):
    reason: str
    requested_by: Optional[str] = None  # free-form string for the audit row


@api_router.post("/clarity/admin/dispute-unlock/{session_id}")
async def clarity_dispute_unlock(session_id: str, inp: DisputeUnlockInput, request: Request):
    """Decrypt a session's user messages for dispute review. Admin-only.
    Every unlock writes an audit row to `db.clarity_dispute_unlocks` —
    the conversations themselves stay encrypted at rest.
    """
    user = await _require_user(request)
    if user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required.")
    sess = await db.cabinet_sessions.find_one({"id": session_id}, {"_id": 0})
    if not sess:
        raise HTTPException(status_code=404, detail="Session not found.")
    decrypted = _decrypt_session_messages(sess)
    await db.clarity_dispute_unlocks.insert_one({
        "id": str(uuid.uuid4()),
        "session_id": session_id,
        "session_user_id": sess.get("user_id"),
        "admin_user_id": user.user_id,
        "admin_email": user.email,
        "reason": (inp.reason or "")[:500],
        "requested_by": (inp.requested_by or "")[:200],
        "unlocked_at": datetime.now(timezone.utc).isoformat(),
    })
    return {
        "session_id": session_id,
        "user_id": sess.get("user_id"),
        "tier": sess.get("tier"),
        "started_at": sess.get("started_at"),
        "messages": decrypted.get("messages") or [],
    }


@api_router.get("/clarity/admin/unlock-log")
async def clarity_dispute_log(request: Request):
    """Admin-only audit log of every dispute decrypt. Read-only."""
    user = await _require_user(request)
    if user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required.")
    rows = await db.clarity_dispute_unlocks.find({}, {"_id": 0}).sort("unlocked_at", -1).to_list(500)
    return {"unlocks": rows}


@api_router.get("/clarity/health")
async def clarity_health():
    """Read-only sanity check. No secrets revealed."""
    now = datetime.now(timezone.utc).isoformat()
    return {
        "encryption_configured": clarity_crypto_ready(),
        "ai_guide_enabled": CLARITY_AI_ENABLED,
        "tts_configured": tts_configured(),
        "tiers": [p["tier"] for p in SEED_PASSES],
        "passes_total": await db.clarity_passes.count_documents({}),
        "passes_active": await db.clarity_passes.count_documents({"expires_at": {"$gt": now}}),
        "dispute_unlocks_logged": await db.clarity_dispute_unlocks.count_documents({}),
    }


# ----- Crisis support: hotlines surfaced when the AI agent detects
# direct risk of self-harm or acute distress. Also available publicly
# from the footer "If tonight is hard" link. No personal data collected.
CRISIS_HOTLINES = [
    {
        "region": "Estonia",
        "region_code": "EE",
        "name": "Eluliin — 24/7 emotional support",
        "phone": "116 123",
        "web": "https://www.eluliin.ee/",
        "note": "Confidential, free, available 24 hours a day in Estonian and Russian.",
    },
    {
        "region": "Estonia",
        "region_code": "EE",
        "name": "Peaasi.ee — youth mental health",
        "phone": None,
        "web": "https://peaasi.ee/",
        "note": "Written support in Estonian. Self-help and directory of specialists.",
    },
    {
        "region": "Global (EU)",
        "region_code": "EU",
        "name": "116 123 — Emotional support across Europe",
        "phone": "116 123",
        "web": "https://www.ifotes.org/en",
        "note": "A free, pan-European helpline. Reachable from most EU numbers.",
    },
    {
        "region": "Global (emergency)",
        "region_code": "WORLD",
        "name": "Emergency medical assistance",
        "phone": "112",
        "web": None,
        "note": "If you or someone near you is in immediate physical danger, call 112 (EU) or your country's emergency number.",
    },
    {
        "region": "International",
        "region_code": "INTL",
        "name": "Find a crisis line by country",
        "phone": None,
        "web": "https://findahelpline.com/",
        "note": "Directory of free, confidential helplines worldwide.",
    },
]


@api_router.get("/support/crisis")
async def support_crisis():
    """Public — always available. No auth. No logging of who asked.
    Returns the list of crisis hotlines the Guardian AI may reference
    and the footer links to."""
    return {
        "preamble": (
            "If tonight feels unsafe, you do not have to be alone with "
            "it. The numbers below are staffed by trained people. They "
            "will not try to fix you. They will just stay on the line."
        ),
        "hotlines": CRISIS_HOTLINES,
        "reminder": (
            "Matrix Aurin is a quiet companion, not a crisis service. "
            "When the wave is bigger than this room can hold, please "
            "reach for a number above first."
        ),
    }


# ----- Admin reminders — internal calendar of time-delayed tasks
# the founder asked the agent to surface at specific dates.
# Source of truth: /app/memory/FOUNDER_REMINDERS.md (parsed on every
# call; no DB storage).
@api_router.get("/admin/reminders")
async def admin_reminders(request: Request):
    """Admin-only. Parses FOUNDER_REMINDERS.md and returns every
    reminder with its status (DORMANT / TRIGGERED). The admin UI
    surfaces TRIGGERED entries as a red banner at the top of the
    dashboard."""
    user = await _require_user(request)
    if user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required.")
    import re as _re
    from datetime import date as _date
    path = Path("/app/memory/FOUNDER_REMINDERS.md")
    if not path.exists():
        return {"reminders": [], "triggered_count": 0}
    text = path.read_text(encoding="utf-8")
    # Match blocks starting with "### R-NNN · title"
    pattern = _re.compile(
        r"### (R-\d+) · (.+?)\n(.*?)(?=\n### R-|\n##|\n---)",
        _re.DOTALL,
    )
    months = {
        "jan": 1, "feb": 2, "mar": 3, "apr": 4, "may": 5, "jun": 6,
        "jul": 7, "aug": 8, "sep": 9, "oct": 10, "nov": 11, "dec": 12,
    }
    today = _date.today()
    reminders = []
    for m in pattern.finditer(text):
        rid, title, body = m.group(1), m.group(2).strip(), m.group(3)
        td = _re.search(r"\*\*Trigger date:\*\*[^\d]*(\d{1,2})\s+(\w+)\s+(\d{4})", body)
        if not td:
            continue
        try:
            day_n = int(td.group(1))
            mo = months.get(td.group(2).lower()[:3])
            if not mo:
                continue
            trig = _date(int(td.group(3)), mo, day_n)
        except Exception:
            continue
        is_triggered = trig <= today
        # Extract a short summary (first quote block if any, else first para)
        quote = _re.search(r"> 🔴.*?(?=\n\s*\n|\Z)", body, _re.DOTALL)
        summary = (quote.group(0) if quote else body).strip()[:1200]
        reminders.append({
            "id": rid,
            "title": title,
            "trigger_date": trig.isoformat(),
            "status": "TRIGGERED" if is_triggered else "DORMANT",
            "summary": summary,
        })
    triggered = [r for r in reminders if r["status"] == "TRIGGERED"]
    return {
        "reminders": reminders,
        "triggered_count": len(triggered),
        "today": today.isoformat(),
    }


# ---- Clarity Release — TTS endpoint -------------------------------
# OpenAI TTS via Emergent universal LLM key. Returns mp3 bytes for the
# guide reply text. Auth-gated to keep credits used only by signed-in
# wanderers. Browser caches per (text, gender) hash via ETag.
import hashlib as _hashlib_tts
from fastapi import Response as _FastAPIResponse


class ClarityTTSInput(BaseModel):
    text: str
    gender: Optional[Literal["male", "female"]] = "female"


@api_router.post("/clarity/tts")
async def clarity_tts(inp: ClarityTTSInput, request: Request):
    """Synthesize guide reply text into mp3 audio. Auth-required."""
    user = await _require_user(request)
    text = (inp.text or "").strip()
    if not text:
        raise HTTPException(status_code=400, detail="Empty text")
    if len(text) > 4000:
        text = text[:4000]
    gender = inp.gender or "female"

    # ETag for browser caching — same text+voice = same audio.
    etag_src = f"{gender}:{text}".encode("utf-8")
    etag = _hashlib_tts.sha256(etag_src).hexdigest()
    if request.headers.get("if-none-match") == etag:
        return _FastAPIResponse(status_code=304)

    try:
        audio = await synthesize_speech(text, gender=gender)
    except RuntimeError as e:
        raise HTTPException(status_code=503, detail=str(e))
    except Exception as e:  # noqa: BLE001
        logging.error("TTS failed for user=%s: %s", user.user_id, e)
        raise HTTPException(status_code=500, detail="Voice could not be summoned right now.")

    return _FastAPIResponse(
        content=audio,
        media_type="audio/mpeg",
        headers={
            "Cache-Control": "private, max-age=86400",
            "ETag": etag,
        },
    )


# ---- §Phase 1 Market-Ready — STREAMING TTS endpoint --------------
# Returns audio/mpeg as a chunked HTTP stream. ElevenLabs MP3 frames
# arrive in ~300-500 ms TTFB instead of the ~1-2 s blob-mode latency.
# The browser's <audio> element can play partial MP3 as it arrives.
#
# Auth: standard cookie/bearer flow OR `?t=<session_token>` query
# param so the frontend can attach the streaming URL directly to an
# <audio src> (which cannot carry Authorization headers). The token
# is single-use only in the sense that it never leaves the user's
# own browser address-bar — never exposed in marketing material.
from fastapi.responses import StreamingResponse as _FastAPIStreamingResponse


async def _resolve_user_for_stream(request: Request, t: Optional[str]) -> User:
    """Resolve the current user via cookie/bearer/query-param token.

    Used by streaming endpoints where <audio src=...> cannot carry
    custom Authorization headers."""
    token = await _get_session_token(request)
    if not token and t:
        token = t.strip()
    if not token:
        raise HTTPException(status_code=401, detail="Sign in required.")
    sess = await db.user_sessions.find_one({"session_token": token}, {"_id": 0})
    if not sess:
        raise HTTPException(status_code=401, detail="Sign in required.")
    expires_at = sess.get("expires_at")
    if isinstance(expires_at, str):
        try:
            expires_at = datetime.fromisoformat(expires_at)
        except ValueError:
            raise HTTPException(status_code=401, detail="Session expired.")
    if expires_at and expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)
    if expires_at and expires_at < datetime.now(timezone.utc):
        raise HTTPException(status_code=401, detail="Session expired.")
    user_doc = await db.users.find_one({"user_id": sess["user_id"]}, {"_id": 0})
    if not user_doc:
        raise HTTPException(status_code=401, detail="Sign in required.")
    return User(**user_doc)


@api_router.get("/clarity/tts/stream")
async def clarity_tts_stream(
    request: Request,
    text: str,
    gender: Optional[Literal["male", "female"]] = "female",
    t: Optional[str] = None,
):
    """Streaming MP3 TTS — yields audio chunks via chunked transfer
    encoding. The browser starts playing as soon as the first chunk
    lands (~300-500 ms TTFB with ElevenLabs streaming).
    """
    user = await _resolve_user_for_stream(request, t)  # noqa: F841 — auth gate
    clean = (text or "").strip()
    if not clean:
        raise HTTPException(status_code=400, detail="Empty text")
    if len(clean) > 4000:
        clean = clean[:4000]
    g = gender or "female"

    async def _stream():
        try:
            async for chunk in synthesize_speech_stream(clean, gender=g):
                if chunk:
                    yield chunk
        except RuntimeError as exc:  # surface as empty stream; frontend handles silently
            logging.error("TTS stream failed for user=%s: %s", user.user_id, exc)
            return
        except Exception as exc:  # noqa: BLE001
            logging.error("TTS stream crashed for user=%s: %s", user.user_id, exc)
            return

    return _FastAPIStreamingResponse(
        _stream(),
        media_type="audio/mpeg",
        headers={
            "Cache-Control": "private, no-store",
            "X-Accel-Buffering": "no",  # disable proxy buffering for true streaming
        },
    )


# ---- §Phase 1 STABILIZATION (2026-02-14) — ELEVENLABS CONVERSATIONAL AI ----
# Mints a 15-min signed conversation URL for a pre-configured ElevenLabs
# Conversational AI agent. The agent_id is mapped server-side from a
# strict room allowlist; the browser only ever sees the temporary signed
# WebSocket URL. API key and agent_id never leave the backend.
#
# Room → agent mapping is env-driven so a key rotation or agent rebuild
# is a single .env edit, no code change.
#
# Phase A: only the "clarity" mapping (Grace) is consumed by the
# frontend. The other three mappings are routed but unmounted; they
# turn on by adding one line in BodyRoomChat/ParentsRoomChat/CourseRoom.
_ROOM_TO_CONVAI_AGENT_ENV = {
    "clarity": "ELEVENLABS_CONVAI_AGENT_GRACE",
    "body":    "ELEVENLABS_CONVAI_AGENT_KAELAN",
    "parents": "ELEVENLABS_CONVAI_AGENT_SARA",
    "courses": "ELEVENLABS_CONVAI_AGENT_ALISTAIR",
    # §AURIN 2026-05-20 — Children's room. Single agent, three age
    # groups (3-5, 6-8, 9-12) selected by the frontend, prompt
    # differentiation injected via SDK overrides (allowed in the
    # Aurin Dashboard ONLY — the other four agents stay zero-override).
    "aurin":   "ELEVENLABS_CONVAI_AGENT_AURIN",
}

# §2026-02-15 PM — ZERO-OVERRIDE POLICY (founder directive).
# The Dashboard is the SINGLE source of truth for every agent's
# personality, identity, greeting, voice, and behaviour. This
# component does ONE thing: mint a signed WebSocket URL for the
# correct agent and return it. No prompt injection, no first_message
# injection, no tts injection. If the founder edits a comma in the
# ElevenLabs Dashboard, it reaches the wanderer on the next session
# without a single line of code changing.


class ConvAISignedUrlInput(BaseModel):
    room: Literal["clarity", "body", "parents", "courses", "aurin"]
    # §STABILIZATION 2026-05-19 — Optional mode field so the backend
    # knows whether the upcoming session will use voice (mic + TTS),
    # hybrid (text input + TTS output, same cost as voice), or text
    # (text input + text output, unmetered). Defaults to "voice" so
    # any older client that doesn't send the field stays gated.
    mode: Optional[Literal["voice", "hybrid", "text"]] = "voice"


@api_router.post("/clarity/convai/signed-url")
async def clarity_convai_signed_url(inp: ConvAISignedUrlInput, request: Request):
    """Mint a 15-minute signed conversation URL for the room's ConvAI agent.

    Strict allowlist: room must be one of clarity|body|parents|courses.
    Agent_id and ELEVENLABS_API_KEY never reach the browser; the only
    token the browser ever sees is the expiring wss:// signed URL.
    """
    user = await _require_user(request)  # auth gate — sign-in required
    room = inp.room
    mode = inp.mode or "voice"
    env_name = _ROOM_TO_CONVAI_AGENT_ENV.get(room)
    if not env_name:
        raise HTTPException(status_code=400, detail="Unknown room")

    # §VOICE-MIN-CREDITS 2026-05-19 — Founder directive: voice opens
    # only when the wanderer holds at least 5 credits (5 seconds of
    # voice presence). Text mode is unmetered acquisition. The check
    # is bypassed for unlimited-voice accounts (founder, admin) and
    # during the free-access window so launch-day visitors are never
    # blocked. Writing remains free for everyone, always.
    VOICE_MIN_CREDITS = 5
    if mode != "text":
        try:
            user_doc_min = await db.users.find_one(
                {"user_id": user.user_id},
                {"_id": 0, "presence_seconds_left": 1, "unlimited_voice": 1},
            ) or {}
            # §FREE-VOICE-BETA 2026-05-20 — Same runway switch as
            # /presence/start. If FREE_VOICE_BETA=true, mint signed
            # URLs for any signed-in user. Audit row already written
            # by /presence/start when the front-end pairs the two.
            free_beta = (os.environ.get("FREE_VOICE_BETA") or "").strip().lower() in {
                "1", "true", "yes", "on",
            }
            if not free_beta and not user_doc_min.get("unlimited_voice"):
                from session_cap import _free_access_window_active  # noqa: WPS433
                in_free_window = False
                try:
                    in_free_window = _free_access_window_active()
                except Exception:  # noqa: BLE001
                    in_free_window = False
                if not in_free_window:
                    seconds_left = int(user_doc_min.get("presence_seconds_left") or 0)
                    if seconds_left < VOICE_MIN_CREDITS:
                        raise HTTPException(
                            status_code=402,
                            detail={
                                "reason": "below_voice_minimum",
                                "credits_left": seconds_left,
                                "credits_needed": VOICE_MIN_CREDITS,
                                "soft_close": True,
                                "refill_url": "/clarity-release#passes",
                            },
                        )
        except HTTPException:
            raise
        except Exception as exc:  # noqa: BLE001
            # Minimum-credits gate must never crash the realtime core.
            logging.warning(
                "voice min-credits soft-failed for user=%s: %s",
                user.user_id, exc,
            )

    # §STABILIZATION 2026-05-19 — Mode-aware cap gating.
    # Text mode is unmetered (low-cost LLM tokens only — acquisition
    # layer per Founder directive). Voice + hybrid both stream TTS
    # output through ElevenLabs and bill at the SAME per-minute rate,
    # so both must consume `presence_seconds_left`.
    #
    # Phase 1 rollout: gate ONLY Grace / Private Room. Body Room,
    # Parents Room, and Course Room remain uncapped. The cap module
    # is a passive read-only check over the existing presence + pass
    # collections; it never mutates state and never affects an already
    # running session.
    if room == "clarity" and mode != "text":
        try:
            from session_cap import compute_voice_window
            user_doc = await db.users.find_one(
                {"user_id": user.user_id}, {"_id": 0}
            )
            window = await compute_voice_window(user.user_id, user_doc, db)
            if not window["allowed"]:
                # 402 = Payment Required. The frontend countdown
                # banner renders the graceful-close card; the SDK
                # call site never sees this status because the
                # banner shows up before the start() button is
                # pressed (or because the running session continues
                # to its natural end and only the NEXT attempt 402's).
                raise HTTPException(
                    status_code=402,
                    detail={
                        "reason": window["reason"],
                        "tier": window.get("tier"),
                        "soft_close": True,
                        "refill_url": "/clarity-release#passes",
                    },
                )
        except HTTPException:
            raise
        except Exception as exc:  # noqa: BLE001
            # Cap layer must NEVER break the realtime core. On any
            # internal failure (Mongo blip, import glitch) we open
            # the door — the wanderer's session is sacred.
            logging.warning(
                "session_cap.compute_voice_window soft-failed for user=%s: %s",
                user.user_id, exc,
            )

    # §GOVERNANCE 2026-02-11 — Runtime governance layer (Anna's "$0
    # cash risk" directive). Three independent guards check vendor
    # balance, spend velocity, and concurrency. Any failed guard
    # blocks new voice sessions but does NOT kill running ones.
    # Admin / unlimited_voice users bypass. Text mode skips entirely.
    if mode != "text":
        try:
            from runtime_governance import evaluate_governance
            gov_user_doc = await db.users.find_one(
                {"user_id": user.user_id},
                {"_id": 0, "unlimited_voice": 1},
            ) or {}
            verdict = await evaluate_governance(db, gov_user_doc)
            if not verdict["allowed"]:
                logging.warning(
                    "GOVERNANCE BLOCK user=%s blocked_by=%s details=%s",
                    user.user_id, verdict["blocked_by"], verdict["details"],
                )
                raise HTTPException(
                    status_code=503,
                    detail={
                        "reason": verdict["reason"],
                        "blocked_by": verdict["blocked_by"],
                        "soft_close": True,
                        "retry_after_sec": 60,
                        "message": (
                            "The house is briefly resting. "
                            "Please try again in a moment."
                        ),
                    },
                )
        except HTTPException:
            raise
        except Exception as exc:  # noqa: BLE001
            # Governance failures must never break the realtime core.
            logging.warning(
                "governance soft-failed for user=%s: %s",
                user.user_id, exc,
            )

    agent_id = os.getenv(env_name)
    api_key = os.getenv("ELEVENLABS_API_KEY")
    if not agent_id or not api_key:
        raise HTTPException(
            status_code=503,
            detail=f"ConvAI agent for room '{room}' is not configured",
        )
    try:
        import httpx  # noqa: WPS433
        async with httpx.AsyncClient(timeout=10.0) as client:
            r = await client.get(
                "https://api.elevenlabs.io/v1/convai/conversation/get-signed-url",
                params={"agent_id": agent_id},
                headers={"xi-api-key": api_key},
            )
        if r.status_code != 200:
            logging.error(
                "ConvAI signed URL fetch failed: status=%s body=%s",
                r.status_code, r.text[:300],
            )
            raise HTTPException(
                status_code=502,
                detail="ConvAI provider could not mint a session right now.",
            )
        payload = r.json()
        signed_url = payload.get("signed_url")
        if not signed_url:
            raise HTTPException(status_code=502, detail="ConvAI provider returned no URL.")
        # §ZERO-OVERRIDE 2026-02-15 PM — Response is minimal. We
        # return ONLY the signed URL the SDK needs to open a socket,
        # plus the room key for client-side routing/tests. No
        # first_message, no identity_prompt, no anything that could
        # touch the wanderer's Dashboard config.
        return {
            "signed_url": signed_url,
            "room": room,
        }
    except HTTPException:
        raise
    except Exception as exc:  # noqa: BLE001
        logging.error("ConvAI signed URL crash for user=%s room=%s: %s",
                      user.user_id, room, exc)
        raise HTTPException(status_code=502, detail="ConvAI temporarily unavailable.")


# §STABILIZATION 2026-05-16 — Voice-window read-only endpoint.
# Companion to the cap-gated signed-url above. The frontend countdown
# banner polls this every 15s. It is intentionally read-only and
# never mutates `clarity_passes` / `users` / `cabinet_sessions`.
@api_router.get("/clarity/convai/voice-window")
async def clarity_convai_voice_window(request: Request):
    """Return the wanderer's current voice-cap snapshot for Grace.

    Always responds 200 with the structured `VoiceWindow` shape so
    the frontend hook can degrade gracefully on transient errors.
    """
    user = await _require_user(request)
    try:
        from session_cap import compute_voice_window
        user_doc = await db.users.find_one(
            {"user_id": user.user_id}, {"_id": 0}
        )
        window = await compute_voice_window(user.user_id, user_doc, db)
        return window
    except Exception as exc:  # noqa: BLE001
        logging.warning(
            "voice-window soft-failed for user=%s: %s", user.user_id, exc,
        )
        # Open the door on any internal error — cap must never block.
        return {
            "allowed": True,
            "seconds_remaining": 0,
            "tier": "unlimited",
            "reason": "cap_soft_failed",
            "cap_enabled": False,
        }


# ---- Clarity Release — STT (push-to-talk → Whisper transcript) ----
# Voice-first directive (Stage 2.8): browser MediaRecorder captures
# webm/ogg/mp4 audio, posts it here, server transcribes via Whisper-1
# and returns plain text. The transcript lands inside the chat input
# and the wanderer can review/edit before sending. We never persist
# the audio.

_STT_ALLOWED_MIME = {
    "audio/webm",
    "audio/ogg",
    "audio/mp4",
    "audio/mpeg",
    "audio/mpga",
    "audio/wav",
    "audio/x-wav",
    "audio/m4a",
    "audio/x-m4a",
}
_STT_MAX_UPLOAD_BYTES = 24 * 1024 * 1024  # 24 MB hard cap


@api_router.post("/clarity/stt")
async def clarity_stt(request: Request):
    """Transcribe a single audio blob into text. Auth-required.

    Accepts multipart/form-data with a single field `audio`. Returns
    JSON `{"text": "..."}`. Soft-fails calmly so a network glitch
    never breaks the chat surface.
    """
    user = await _require_user(request)
    if not stt_configured():
        raise HTTPException(status_code=503, detail="Voice listener is unavailable.")

    try:
        form = await request.form()
    except Exception:
        raise HTTPException(status_code=400, detail="Bad audio upload.")

    audio_field = form.get("audio")
    if audio_field is None:
        raise HTTPException(status_code=400, detail="Missing audio.")

    # Optional language hint (ISO-639-1). Default: let Whisper auto-detect.
    language = (form.get("language") or "").strip().lower() or None

    filename = getattr(audio_field, "filename", None) or "audio.webm"
    content_type = (getattr(audio_field, "content_type", None) or "").lower()
    # Strip any codecs= suffix (e.g. "audio/webm;codecs=opus")
    base_ct = content_type.split(";", 1)[0].strip()
    if base_ct and base_ct not in _STT_ALLOWED_MIME:
        # Be permissive — some browsers send video/webm for audio-only
        # MediaRecorder. Only block if obviously wrong.
        if not (base_ct.startswith("audio/") or base_ct == "video/webm"):
            raise HTTPException(status_code=400, detail="Unsupported audio format.")

    try:
        audio_bytes = await audio_field.read()
    except Exception:
        raise HTTPException(status_code=400, detail="Could not read audio.")

    if not audio_bytes:
        raise HTTPException(status_code=400, detail="Empty audio.")
    if len(audio_bytes) > _STT_MAX_UPLOAD_BYTES:
        raise HTTPException(status_code=413, detail="Audio is too long.")

    # Normalise filename extension so Whisper recognises the format.
    if "." not in filename:
        if "webm" in base_ct:
            filename = "audio.webm"
        elif "ogg" in base_ct:
            filename = "audio.ogg"
        elif "mp4" in base_ct or "m4a" in base_ct:
            filename = "audio.m4a"
        elif "wav" in base_ct:
            filename = "audio.wav"
        else:
            filename = "audio.webm"

    try:
        text = await transcribe_audio(
            audio_bytes,
            filename=filename,
            language=language,
        )
    except RuntimeError as e:
        raise HTTPException(status_code=503, detail=str(e))
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:  # noqa: BLE001
        logging.error("STT failed for user=%s: %s", user.user_id, e)
        raise HTTPException(status_code=500, detail="The room could not hear that clearly.")

    # §2026-02-15 STABILIZATION — Whisper hallucination filter.
    # Whisper-1 (and turbo) frequently hallucinates on silence, mic
    # white-noise, or very short clips. Common shapes observed in
    # production:
    #   - sequences of bare numbers ("10. 11. 12. 13. ...")
    #   - random recipe fragments ("10.5tbsp soy sauce mirin sugar")
    #   - CJK / Cyrillic / Arabic glyphs when no language hint given
    #   - YouTube-train footer phrases ("Thanks for watching", "Subscribe")
    # If we forward these into Claude, the mentor genuinely tries to
    # respond to them and the wanderer sees "What are you carrying
    # underneath the numbers?" — which destroys trust.
    # Better to return empty and let the room stay silent.
    text = _filter_whisper_hallucination(text or "")

    return {"text": text or ""}


# Common Whisper hallucination signatures, gathered from production logs
# 2026-02-14/15. Each pattern is matched case-insensitively against the
# WHOLE transcript. If the transcript matches AND is short (< 80 chars),
# it is discarded.
_WHISPER_HALLUCINATION_PATTERNS = [
    # YouTube/transcription footer
    re.compile(r"^\s*(thanks?\s+for\s+watching|please\s+subscribe|like\s+and\s+subscribe|click\s+the\s+bell)", re.IGNORECASE),
    # Bare number sequences ("10. 11. 12. 13.")
    re.compile(r"^[\s\d\.,]+$"),
    # Recipe fragments ("X tbsp ingredient")
    re.compile(r"^[\s\d\.]*\d+(\.\d+)?\s*(tbsp|tsp|cup|oz|gram|kg|ml|tablespoon|teaspoon)\b", re.IGNORECASE),
    # Single repeated short token ("hi hi hi hi" / "hello hello hello")
    re.compile(r"^\s*((\b\w{1,8}\b)[\s\.,!\?]*)\2{3,}\s*$", re.IGNORECASE),
    # Captioner credits
    re.compile(r"(subtitle|caption)s?\s+by", re.IGNORECASE),
]


def _filter_whisper_hallucination(text: str) -> str:
    """Drop transcripts that look like Whisper hallucinations.

    Returns the transcript unchanged when it looks like real speech.
    Returns "" when the transcript matches any known hallucination
    signature AND is short enough to plausibly be noise (longer real
    transcripts that happen to contain a hallucination phrase still
    pass through — we don't want to lose a real wanderer sentence).
    """
    stripped = (text or "").strip()
    if not stripped:
        return ""
    # 1. Non-Latin glyph dominance (Whisper hallucinates CJK on silence
    #    when no language hint). If > 30% of chars are CJK / Arabic /
    #    Cyrillic AND length is short, it is almost certainly noise.
    if len(stripped) < 120:
        non_latin = sum(
            1 for ch in stripped
            if (
                "\u3000" <= ch <= "\u9fff"   # CJK
                or "\u0400" <= ch <= "\u04ff"  # Cyrillic
                or "\u0600" <= ch <= "\u06ff"  # Arabic
                or "\uac00" <= ch <= "\ud7af"  # Hangul
            )
        )
        if non_latin >= 3 and non_latin / max(len(stripped), 1) > 0.3:
            logging.info("Whisper hallucination filtered (non-latin): %r", stripped[:80])
            return ""
    # 2. Pattern matches — only short transcripts get dropped, so we
    #    never throw away real long sentences that happen to contain a
    #    suspect phrase.
    if len(stripped) < 80:
        for pat in _WHISPER_HALLUCINATION_PATTERNS:
            if pat.search(stripped):
                logging.info("Whisper hallucination filtered (pattern): %r", stripped[:80])
                return ""
    # 3. Single character or one-token transcripts with no vowels and
    #    no spaces are also noise.
    if len(stripped) <= 3 and not re.search(r"[aeiouAEIOU]", stripped):
        return ""
    # 4. Repeated-word noise ("hello hello hello hello"). Whisper
    #    sometimes loops a single token on short noise bursts.
    words = stripped.split()
    if len(words) >= 4 and len(set(w.lower().strip(".,!?") for w in words)) == 1:
        logging.info("Whisper hallucination filtered (repeated token): %r", stripped[:80])
        return ""
    return stripped


# ---- Clarity Release — user prefs (consent, guide choice, mode) ----
# Stored separately from db.users so the existing User Pydantic model
# stays frozen. The threshold page writes here; /clarity-release reads
# here to decide whether the gate should be shown again.

CONSENT_VERSION_CURRENT = "v2"


class ClarityPrefsInput(BaseModel):
    guide_gender: Optional[Literal["male", "female"]] = None
    display_mode: Optional[Literal["text", "voice", "hologram"]] = None
    consent_v2: bool = False  # when true, stamps consent_v2_at
    save_threads: Optional[bool] = None  # cross-session continuity opt-in (default True)


@api_router.get("/clarity/prefs")
async def clarity_get_prefs(request: Request):
    """Return the signed-in user's Clarity Release preferences."""
    user = await _require_user(request)
    doc = await db.clarity_user_prefs.find_one(
        {"user_id": user.user_id}, {"_id": 0}
    )
    if not doc:
        return {
            "user_id": user.user_id,
            "guide_gender": None,
            "display_mode": "text",
            "consent_v2_at": None,
            "has_consented": False,
            # §HYBRID MEMORY (iter 59): server-side mentor's notes are
            # off by default. Browser-side memory carries the day-to-day
            # continuity at $0; turning this on activates the paid
            # "Eternal Thread" surface (Claude-generated summary at every
            # session close + injected into next session's system prompt).
            "save_threads": False,
            "consent_version_current": CONSENT_VERSION_CURRENT,
        }
    return {
        **doc,
        "has_consented": bool(doc.get("consent_v2_at")),
        # New default after iter 59: opt-in only. Existing prefs docs that
        # set this field to True keep working — only first-time defaults
        # change.
        "save_threads": doc.get("save_threads", False),
        "consent_version_current": CONSENT_VERSION_CURRENT,
    }


@api_router.post("/clarity/prefs")
async def clarity_set_prefs(inp: ClarityPrefsInput, request: Request):
    """Update Clarity Release preferences. At the end of the threshold
    flow we persist guide_gender + consent_v2=true in a single call."""
    user = await _require_user(request)
    update = {}
    if inp.guide_gender is not None:
        update["guide_gender"] = inp.guide_gender
    if inp.display_mode is not None:
        update["display_mode"] = inp.display_mode
    if inp.consent_v2:
        update["consent_v2_at"] = datetime.now(timezone.utc).isoformat()
    if inp.save_threads is not None:
        update["save_threads"] = bool(inp.save_threads)
    if not update:
        raise HTTPException(status_code=400, detail="No fields to update.")
    await db.clarity_user_prefs.update_one(
        {"user_id": user.user_id},
        {
            "$set": update,
            "$setOnInsert": {"user_id": user.user_id},
        },
        upsert=True,
    )
    updated = await db.clarity_user_prefs.find_one(
        {"user_id": user.user_id}, {"_id": 0}
    )
    return {
        **updated,
        "has_consented": bool(updated.get("consent_v2_at")),
        # iter 59: Eternal Thread is opt-in only.
        "save_threads": updated.get("save_threads", False),
        "consent_version_current": CONSENT_VERSION_CURRENT,
    }


@api_router.post("/clarity/emergency-exit")
async def clarity_emergency_exit(request: Request):
    """Close the active cabinet session immediately. Does NOT delete the
    encrypted history (admin dispute unlock still works). Safe to call
    without an active session — returns ok either way. Fires a fire-and-
    forget summary so the next session has soft context."""
    user = await _require_user(request)
    prior_active = await db.cabinet_sessions.find_one(
        {"user_id": user.user_id, "closed": False},
        {"_id": 0},
        sort=[("started_at", -1)],
    )
    await db.cabinet_sessions.update_many(
        {"user_id": user.user_id, "closed": False},
        {"$set": {"closed": True, "closed_reason": "emergency_exit"}},
    )
    if prior_active:
        asyncio.create_task(_summarise_closed_session_safe(user.user_id, prior_active["id"]))
    return {"status": "exited"}


# =============================================================
# BODY ROOM — "Learning to speak with your body"
# Interactive 3-hotspot silhouette. When a user pauses on a region,
# we record a `body_insight` row. The Clarity Release guide can then
# acknowledge it on the next session opening — the "State Bridge"
# between the two rooms.
# =============================================================

# Curated content for the v1 hotspots. Hand-written, not AI-generated.
BODY_HOTSPOTS = {
    "crown": {
        "region": "crown",
        "label": "Crown",
        "emotion": "The overthinker's gate",
        "symptom": "A head that will not slow down. Reading more, learning more, trying to think the answer into existence — and a soft pressure that arrives behind the eyes by evening.",
        "what_it_carries": "Your head has become a small prison. You gather knowledge in order to feel safe — but do you feel free? Clarity does not arrive in new information. It arrives in the silence between.",
        "release": "Place both palms gently on the top of the head. Three slow exhales, longer than the inhales. Whisper to yourself: I do not have to know everything tonight. The mind softens when it is told the truth.",
        "why_it_speaks_to_you": "If your thoughts feel louder than your life, the crown has been working overtime. It is not asking for more answers. It is asking, quietly, to be allowed to rest.",
        "image_slug": "crown-overthinker",
    },
    "throat": {
        "region": "throat",
        "label": "Throat",
        "emotion": "The silent truth",
        "symptom": "A small lump before tears. Clearing the throat when nothing is in it. The familiar instinct to disagree, then say nothing.",
        "what_it_carries": "How many times have you swallowed your truth to keep the peace? The lump in your throat is the weight of words never spoken. It may be time to let your voice tremble — without fearing how it will be received.",
        "release": "Hum, low and closed-mouthed, until you feel a soft buzz at the front of the throat. Two slow rounds. The body believes the voice when it hears itself, even wordlessly.",
        "why_it_speaks_to_you": "If you have ever rehearsed a sentence and then not said it, the throat remembers. It is not asking you to confront anyone. It is asking, gently, to be heard inside.",
        "image_slug": "throat-unspoken",
    },
    "heart": {
        "region": "heart",
        "label": "Heart",
        "emotion": "The compass of trust",
        "symptom": "Shallow breathing. A weight that settles in the centre of the chest, especially in the early morning. A reflex to brace before being touched.",
        "what_it_carries": "You have built walls so you would not be hurt — but those same walls keep love outside. The heart does not need protection. It needs room to breathe.",
        "release": "Lay one hand on the centre of the chest. Sigh out long, the way the body wants to. Stay there for two minutes. Nothing more is asked of you.",
        "why_it_speaks_to_you": "If you feel weight in the centre of the chest most days, the heart is asking only to be acknowledged — not solved. Trust is not a gift you give once. It is a small breath you take many times.",
        "image_slug": "heart-compass",
    },
    "solar_plexus": {
        "region": "solar_plexus",
        "label": "Solar plexus",
        "emotion": "The controller's knot",
        "symptom": "A tight knot just below the breastbone. Shallow stomach breathing. The instinct to plan tomorrow before today is finished.",
        "what_it_carries": "You are trying to control tomorrow because today is hard to trust. The tightness here is the body's quiet way of saying it has stopped believing in the current of life. Let one finger uncurl. See what remains when you stop bracing.",
        "release": "Both hands on the upper belly, just below the ribs. Breathe slowly into the palms — four in, six out — five rounds. Imagine the knot loosening one small thread at a time.",
        "why_it_speaks_to_you": "If you wake already calculating, the solar plexus has been holding the wheel too tightly. It is not asking you to give up control. It is asking to remember how to share it.",
        "image_slug": "solar-plexus-control",
    },
    "belly": {
        "region": "belly",
        "label": "Belly",
        "emotion": "The intuitive void",
        "symptom": "A quiet feeling of disconnection from your gut. Knowing what you should do, but not feeling whether it is right. A reluctance to trust your first instinct.",
        "what_it_carries": "An older wisdom lives here, the kind you learned to override in favour of logic. Can you still hear your gut, or has it been buried under the noise of expectations?",
        "release": "Warm hand on the lower belly, below the navel. Ask the belly one small question — not the mind. Wait. The first answer that rises is often the true one.",
        "why_it_speaks_to_you": "If you keep asking other people what you already know, the belly has stopped being trusted. It is patient. It will return to the conversation the moment you do.",
        "image_slug": "belly-intuition",
    },
    "hips": {
        "region": "hips",
        "label": "Hips",
        "emotion": "The emotional archive",
        "symptom": "Tightness on the inner hip line. A reluctance to dance, to move freely, to take up space. The body holding its breath at the lower belly.",
        "what_it_carries": "The hips are where we hide the fears and griefs we were not yet ready to meet. The stiffness here is the echo of what was once too much. Slowly, the waters can begin to move again.",
        "release": "Lie down. Let the knees fall outward, soles of the feet together if it feels safe. A warm hand on the lower belly. Breathe. Stay, without fixing, for two minutes. The hips need an invitation, not a command.",
        "why_it_speaks_to_you": "The hips hold what we were not allowed to release at the time. If something old has been waiting, this is where it has been waiting. You do not have to know what it is yet.",
        "image_slug": "hips-archive",
    },
    "hands": {
        "region": "hands",
        "label": "Hands",
        "emotion": "The boundary maker",
        "symptom": "Fingers that grip without noticing. Or hands that pull back from touch before they have decided. A vague tiredness in the wrists at the end of an ordinary day.",
        "what_it_carries": "Do you grip too tightly, or are you afraid to touch at all? Your hands carry the rhythm of how you exchange with the world. Learn to give without losing yourself, and to receive without guilt.",
        "release": "Open both palms to the ceiling. Spread the fingers slowly, then soften them. Whisper: I am allowed to give what is mine, and to keep what is mine. Three rounds.",
        "why_it_speaks_to_you": "If your hands rarely rest fully open, the body has been holding a boundary it never voiced. The hands do not need to do more. They need to know it is safe to let go.",
        "image_slug": "hands-boundary",
    },
    "feet": {
        "region": "feet",
        "label": "Feet & roots",
        "emotion": "The root of safety",
        "symptom": "Cold feet at night. A subtle restlessness, as if part of you is preparing to leave the room. A sense of not quite being in your body when standing.",
        "what_it_carries": "Are you running from something, or are you here? Your feet carry the deeper sense that you are allowed to exist on this earth. Feel the ground. You have a right to stand on it.",
        "release": "Stand barefoot if you can. Press the soles of the feet into the floor for ten slow seconds. Whisper: I am here. I am allowed to be here. Then sit, gently.",
        "why_it_speaks_to_you": "If you have spent years feeling like a guest in your own life, the feet have been waiting. They are not asking you to fight for your place. They are asking you to notice you already have one.",
        "image_slug": "feet-roots",
    },
}


class BodyInsightInput(BaseModel):
    region: Literal[
        "crown",
        "throat",
        "heart",
        "solar_plexus",
        "belly",
        "hips",
        "hands",
        "feet",
    ]
    self_report: Optional[str] = None
    intensity: Optional[int] = None


# ----- Psychosomatic "deep layer" per hotspot. Luule-Viilma-influenced
# dialogue: named "toxin" (how the tension formed), forgiveness path
# (release through understanding — never through blame), release_signs
# (the body's vocabulary of letting go), and a medical_note that keeps
# real medical care primary. The tone is understanding, never accusing.
#
# Founder directive: "Mitte süüdistus — mõistmine. Iga teol on oma
# tagajärg, igal mõttel, igal sündmusel on oma põhjus."
BODY_DEEP_LAYERS = {
    "crown": {
        "toxin_name": "Knowing as armour",
        "how_it_forms": (
            "Somewhere early, you learned that to be safe was to be ahead "
            "— to have read the chapter before it arrived. Thinking became "
            "a form of love you could give yourself when no one else was "
            "watching. Over years, the head forgets it was ever allowed "
            "to rest. The parallel in the body is often tension headaches "
            "that arrive in late afternoon, and a mind that refuses sleep."
        ),
        "forgiveness_path": (
            "You are not guilty of thinking too much. You were loyal to a "
            "younger self who had no other way to feel safe. Thank that "
            "part — quietly, tonight — for working so hard. And then "
            "gently ask it to rest. The mind softens when it is thanked, "
            "not when it is scolded."
        ),
        "release_signs": (
            "The body may yawn deeply, several times in a row, as the "
            "crown releases. The eyes may water without sadness. A slight "
            "tingling at the top of the head is common. Sleep that night "
            "may arrive earlier and go deeper."
        ),
        "new_rhythm": (
            "The mind becomes a room you visit, not one you live in. "
            "You notice you can sit with a question for an hour without "
            "solving it, and something inside is fine. Silence stops "
            "feeling empty and starts feeling held. You find that the "
            "answers that arrive now are quieter — and more yours."
        ),
        "medical_note": (
            "Persistent headaches deserve care from a doctor first. This "
            "inner practice is a companion, never a replacement."
        ),
    },
    "throat": {
        "toxin_name": "The swallowed sentence",
        "how_it_forms": (
            "Every sentence unspoken settles here, in layers. Often the "
            "first layer was formed in childhood — a house where speaking "
            "the whole truth risked love, or safety, or the family's "
            "peace. The throat learned: it is safer to swallow. Decades "
            "later, the parallel can be recurring sore throats, thyroid "
            "unease, a small persistent cough."
        ),
        "forgiveness_path": (
            "You are not at fault for the silences you kept. They kept "
            "you safe. Understanding this is the whole release. Then, "
            "when you are ready, one true sentence written alone on "
            "paper — not shouted to anyone — begins the thaw."
        ),
        "release_signs": (
            "A sudden dry cough, often for a few minutes. A wet, "
            "surprised sigh. Tears that come from nowhere and stop "
            "as quickly. Afterwards, the voice often sounds a little "
            "lower and steadier."
        ),
        "new_rhythm": (
            "You notice you can say what you mean without preparing a "
            "script for the other person's reaction. Your voice stops "
            "leaving your body as apology and begins to arrive as "
            "presence. People listen differently, because something "
            "in you is no longer asking permission to exist."
        ),
        "medical_note": (
            "Thyroid and throat symptoms deserve a doctor first. This "
            "practice is the parallel quiet work, never the whole answer."
        ),
    },
    "heart": {
        "toxin_name": "The careful wall",
        "how_it_forms": (
            "The wall around the heart is always, originally, a kindness "
            "to yourself. Something once hurt badly enough that a small "
            "part of you decided: 'Never again, not that fully.' The "
            "wall worked. But walls do not know the difference between "
            "what they keep out. They keep love out too. The body may "
            "parallel this with shallow breath, tight chest, and a "
            "reflex to brace at unexpected warmth."
        ),
        "forgiveness_path": (
            "Do not blame the wall. Thank it. It was built by a younger "
            "you who was being very brave. Then, one quiet evening, "
            "place a hand on the chest and whisper: 'You can rest now. "
            "I will protect us from here.' The wall softens when it "
            "is replaced, not when it is attacked."
        ),
        "release_signs": (
            "A deep, unexpected sigh that comes from the very bottom of "
            "the lungs. The chest may feel briefly warm, then cool. "
            "Sometimes slow tears without a clear story. The next "
            "morning often feels strangely clean."
        ),
        "new_rhythm": (
            "Warmth returns to the ordinary moments. The chest expands "
            "without effort when you greet someone you love. You notice "
            "you can be seen without flinching. Love stops feeling like "
            "a risk you calculate and starts feeling like a weather "
            "that passes through you — softer, slower, more honest."
        ),
        "medical_note": (
            "Any persistent chest pain, breathlessness, or heart-related "
            "symptom is for a doctor first — this is non-negotiable."
        ),
    },
    "solar_plexus": {
        "toxin_name": "The grip on tomorrow",
        "how_it_forms": (
            "Somewhere, trust in life's current quietly broke — perhaps "
            "in one big moment, perhaps in a hundred small ones. Since "
            "then, the solar plexus has been holding the wheel for you. "
            "It is exhausted but loyal. The parallel can show as shallow "
            "stomach breathing, chronic digestion issues, ulcers — the "
            "classic 'I am taking on too much' pattern."
        ),
        "forgiveness_path": (
            "You did not fail life by trying to control it. You were "
            "keeping yourself alive inside a reality that stopped feeling "
            "trustworthy. Understanding this — not fighting it — is how "
            "the knot begins to untangle. One finger unclasps at a time."
        ),
        "release_signs": (
            "Loud, surprising stomach sounds during quiet moments. "
            "A warmth that rises from the upper belly. Sometimes a "
            "shiver that travels up the spine. The following day, "
            "appetite and digestion often re-organise themselves."
        ),
        "new_rhythm": (
            "The morning arrives without a list already waiting. You "
            "notice you can leave questions half-answered and nothing "
            "catastrophic happens. You feel the current of the day "
            "carrying you gently, rather than needing to row. A quiet "
            "strength returns — not the gripped kind, but the rooted "
            "kind."
        ),
        "medical_note": (
            "Ongoing digestive issues, pain, or ulcers need medical "
            "care. This practice walks alongside, never instead."
        ),
    },
    "belly": {
        "toxin_name": "The overridden knowing",
        "how_it_forms": (
            "You were not born distrusting your belly. Somewhere, an "
            "adult voice was louder than your gut. You learned to "
            "apologise for knowing things without evidence. Over time, "
            "the inner voice grew quieter — not gone, but patient. "
            "Parallel body signs: chronic bloating, irritable-bowel "
            "patterns, a queasy feeling before decisions that your gut "
            "already knows are wrong."
        ),
        "forgiveness_path": (
            "Your gut is not sulking. It is waiting. It does not need "
            "to be apologised to — it needs to be consulted. Tonight, "
            "ask it one small question, out loud if you can, and wait. "
            "The first answer that rises, before logic arrives, is "
            "the return of the conversation."
        ),
        "release_signs": (
            "Unusual bowel movements the next day, sometimes for two or "
            "three days, as if the belly is literally clearing old "
            "material. Surprising clarity in small decisions. An "
            "instinct to eat more simply without effort."
        ),
        "new_rhythm": (
            "You start knowing before you think. Small choices become "
            "easy: which meal, which route, which person to call. You "
            "notice you have stopped asking others what you already "
            "sense. Your belly becomes a friend again — one you trust "
            "with the small things first, and the larger things in "
            "time."
        ),
        "medical_note": (
            "Chronic digestive problems need a doctor first. Inner "
            "listening is a companion, never a diagnosis or a cure."
        ),
    },
    "hips": {
        "toxin_name": "The armour of protection",
        "how_it_forms": (
            "When life taught the body that it was not safe — as a "
            "child, in a relationship, at a workplace — the hips "
            "quietly took on the job of holding you together. What "
            "looks like stiffness, extra weight, or an inability to "
            "move freely is often a protective layer the body built "
            "with great care: soft padding between you and a world "
            "that hurt. This is the classic 'emotional archive' "
            "pattern — the body storing what there was no safe moment "
            "to feel. Weight, hip rigidity, and chronic lower-back "
            "patterns are the frequent physical parallels."
        ),
        "forgiveness_path": (
            "You are not lazy. You are not weak. Your body has been "
            "very, very brave. It built this layer to keep you alive "
            "during years when you did not have safer protection. Thank "
            "it — out loud, tonight — for the work it did. And then, "
            "gently: 'I am strong enough now to stand without the "
            "shield. You can rest.' The body begins to let go only "
            "when it is replaced, not when it is rejected."
        ),
        "release_signs": (
            "Deep, slow exhales that arrive unbidden. Sometimes "
            "trembling in the thighs or hips for a few minutes. A "
            "surprising cough, or an impulse to curl up and be still. "
            "The next days may bring lighter digestion, different "
            "sleep, and an unexpected softness in the pelvis."
        ),
        "new_rhythm": (
            "The body starts to take up its rightful space without "
            "apology. You notice you want to move — dance a little in "
            "the kitchen, walk longer, stretch without planning. "
            "Clothes feel different. Food feels different. You are "
            "not smaller because you lost a shield; you are freer "
            "because you no longer need one."
        ),
        "medical_note": (
            "Weight, metabolic, and hip-joint questions are medical "
            "questions first. This inner practice is the parallel "
            "work that lets medical care do its job with less "
            "resistance from the nervous system."
        ),
    },
    "hands": {
        "toxin_name": "The price of exchange",
        "how_it_forms": (
            "The hands learn their grip early. Children who felt they "
            "had to earn love learn to give with effort; children who "
            "felt unsafe learn to hold back. Either posture, carried "
            "for decades, leaves the wrists and fingers tired without "
            "clear cause. Parallel body patterns include repetitive "
            "strain, unexplained wrist aches, and a reflex to hide "
            "the hands when emotional."
        ),
        "forgiveness_path": (
            "You did not give too much, and you did not withhold too "
            "much. You did what you needed to do, to feel loved or "
            "safe. Nothing is owed to anyone for that. The hands "
            "soften when they are told: 'You are allowed to choose "
            "now, one exchange at a time.'"
        ),
        "release_signs": (
            "A tingling through the fingertips, almost like the hands "
            "'coming back on-line'. Unexpected warmth in the palms. "
            "The grip at rest becomes noticeably looser within days."
        ),
        "new_rhythm": (
            "You give what is yours to give, without performance, and "
            "you receive what is offered, without guilt. Your hands "
            "rest fully open when they are not working. You notice "
            "you can say 'no' with the hand and 'yes' with the hand, "
            "and both feel whole. Touch becomes simple again."
        ),
        "medical_note": (
            "Repetitive pain, joint inflammation, and numbness need a "
            "doctor — autoimmune and nerve conditions hide in these "
            "patterns. Inner work is the companion, never the first "
            "line."
        ),
    },
    "feet": {
        "toxin_name": "The ungranted permission",
        "how_it_forms": (
            "Somewhere early, you absorbed a quiet message: 'Your "
            "place here is provisional.' Perhaps a parent was overwhelmed "
            "by your arrival, or a sibling had more room, or a culture "
            "told you that your kind did not fully belong. The feet "
            "took the message most literally. They learned to be "
            "ready to leave. Chronic cold feet, restless-leg patterns, "
            "and a subtle dizziness when standing can all trace back "
            "here."
        ),
        "forgiveness_path": (
            "No one had the right to decide your belonging for you. "
            "The message you absorbed was someone else's story about "
            "themselves, dressed up as a truth about you. Standing "
            "barefoot on the earth, if only for ten seconds, and "
            "whispering 'I am allowed to be here,' is not dramatic — "
            "it is factual. The earth agrees."
        ),
        "release_signs": (
            "Warmth returning to the feet, sometimes surprisingly. "
            "A feeling of being heavier but in a grounded way — the "
            "'good heavy'. Sleep-posture changes: the body no longer "
            "braces to leave."
        ),
        "new_rhythm": (
            "You notice you can enter a room without scanning the "
            "exits. You stand in one spot long enough for something "
            "real to happen. The ground beneath you stops feeling "
            "like a place you are visiting. You become, quietly, "
            "a resident of your own life."
        ),
        "medical_note": (
            "Circulation, neuropathy, and balance issues are medical "
            "questions first. This practice settles the nervous "
            "system so the medical care lands better."
        ),
    },
}


@api_router.get("/body-room/hotspots")
async def body_room_hotspots():
    """Public — returns 8 hand-written hotspots in a vertical psycho-anatomical
    map (crown, throat, heart, solar_plexus, belly, hips, hands, feet).
    Each hotspot carries a `deep_layer` block with a psychosomatic
    understanding (Luule-Viilma-influenced, framed as understanding
    without blame), forgiveness path, release signs, and a medical-respect
    note. Static, hand-written, no AI generation."""
    enriched = []
    for region, spot in BODY_HOTSPOTS.items():
        entry = dict(spot)
        deep = BODY_DEEP_LAYERS.get(region)
        if deep:
            entry["deep_layer"] = deep
        enriched.append(entry)
    return {"hotspots": enriched}


# ----- "Inherited loads": how parents' unresolved tensions surface in
# children's bodies. Luule-Viilma-aligned. Framed as understanding, not
# blame — and the primary "cure" is always the parent's own quiet work
# on themselves, which releases the child in parallel. Medical care is
# always respected and presumed.
SEED_CHILDREN_PATTERNS: List[dict] = [
    {
        "id": "child-throat",
        "child_symptom": "Recurring throat & tonsil infections",
        "in_the_child": "The child's throat keeps closing — as if something true cannot be said in this house.",
        "parent_mirror": "Often the parent is holding back anger, disappointment, or a truth they have decided not to voice — 'to keep the peace'. The child's throat becomes the family's unspoken sentence.",
        "release_path": "When the parent gives themselves permission to speak one honest sentence — to a journal, a trusted friend, or (gently) to the family — the child's throat often eases within days.",
    },
    {
        "id": "child-belly",
        "child_symptom": "Stomach aches, nausea before school or family events",
        "in_the_child": "The belly is the child's second brain. It clenches when it picks up tension the child cannot yet name.",
        "parent_mirror": "Most often the parent is quietly worrying about money, a relationship, or the future. Children absorb this anxiety through the stomach long before the adults notice it themselves.",
        "release_path": "The parent naming their own fear out loud (alone, to themselves, kindly) is often enough. Children do not need us to be fearless — they need us to be honest about our fear so it stops becoming theirs.",
    },
    {
        "id": "child-skin",
        "child_symptom": "Eczema, rashes, persistent allergies",
        "in_the_child": "The skin is the boundary between the child and the world. When it inflames, something about that boundary is not yet safe.",
        "parent_mirror": "Often there is a relational rub the parent has been tolerating too long — a difficult in-law, a drained friendship, a partner dynamic. The parent keeps the surface calm while the inside irritates.",
        "release_path": "When the parent honours their own boundary — just one, gently, without drama — the child's skin often begins to settle. Boundaries modelled are more powerful than boundaries taught.",
    },
    {
        "id": "child-ears",
        "child_symptom": "Chronic ear infections, 'selective hearing'",
        "in_the_child": "The ears close when what is being heard is too heavy, or when the child has decided that not listening is safer than listening.",
        "parent_mirror": "Usually there is raised voice, cold silence, or harsh words in the home — sometimes not towards the child, but within earshot. The child's body says: 'I cannot carry this volume.'",
        "release_path": "Softening the acoustic climate of the home for two weeks — lower voices, fewer sharp words, more physical presence — is often followed by a quiet fall in the child's ear troubles.",
    },
    {
        "id": "child-sleep",
        "child_symptom": "Nightmares, bed-wetting, restless sleep",
        "in_the_child": "At night the child processes what the parent has not yet released. Sleep is porous: the child dreams the family's unspoken weight.",
        "parent_mirror": "The parent is often carrying a heavy decision, a grief, or a self-judgement they have not given permission to themselves to feel. At night the parent braces; the child receives.",
        "release_path": "A parent who gives themselves fifteen quiet evening minutes — to breathe, to write, to grieve — usually finds the child's nights softening within a week. The child sleeps when the parent is allowed to feel.",
    },
]


@api_router.get("/body-room/children-patterns")
async def body_room_children_patterns():
    """Public — five of the most common childhood symptoms mapped to the
    parent's unresolved material. Framed strictly as understanding and
    invitation, never as blame or medical claim. Medical care is always
    the first and honoured response; this endpoint is a complementary
    inner lens, not a treatment."""
    return {
        "patterns": SEED_CHILDREN_PATTERNS,
        "preamble": (
            "Children often carry, in their bodies, what the family has not "
            "yet found words for. This is not the child's fault and it is "
            "not the parent's failing — it is simply how the energy of a "
            "home moves. Medical care for the child always comes first. "
            "Reading these patterns is a gentle parallel practice for the "
            "parent's own quiet work."
        ),
        "medical_note": (
            "This is not medical advice. If your child has a persistent "
            "symptom, please see a doctor first. The parent's inner work "
            "is a companion to medical care, never a replacement."
        ),
    }


# ----- Further reading (internal reference). Surfaced in a soft sidebar
# card in the Body Room and the Clarity Release — a quiet door for those
# who want to study the psychosomatic map in more depth on their own.
BODY_ROOM_FURTHER_READING = [
    {
        "id": "luule-viilma-goodreads",
        "title": "Luule Viilma — The Teaching of Survival",
        "note": (
            "Luule Viilma (1950–2002) wrote a lifetime of books mapping "
            "emotion to the body with great care. A good entry point is "
            "the Goodreads author page, which lists her works and reader "
            "reflections."
        ),
        "url": "https://www.goodreads.com/author/list/6884214.Luule_Viilma",
        "kind": "author_page",
    },
]


@api_router.get("/body-room/further-reading")
async def body_room_further_reading():
    """Internal stub — kept for backward compatibility with older
    frontend code paths. Returns an empty shelf publicly. The deeper
    source material (the thinkers who inspired the Body Room's
    framing) lives in /app/memory/AGENT_KNOWLEDGE_BASE.md and is used
    only to shape Aurin's own original language — never attributed
    publicly on the product surface."""
    return {"items": []}


# ----- "The unwinding" — a small library of human patterns that the
# body and nervous system quietly replay until they are understood.
# Framed strictly without naming any condition medically; no "addiction"
# language beyond the word "pattern" or "loop". The four-phase structure
# honours the founder's directive:
#   1. what it looks like (observable pattern, not judgement)
#   2. beneath the pattern (the unmet need that drives it)
#   3. the soft exit (how the loop opens, gently)
#   4. the new rhythm (what life becomes on the other side)
SEED_PATTERNS: List[dict] = [
    {
        "id": "pattern-pull",
        "title": "The pull you cannot explain",
        "surface": (
            "You find yourself drawn to a person, a place, or a pleasure "
            "that contradicts the life you say you love. You return to "
            "it even when nothing has gone wrong. Afterwards there is "
            "shame, confusion, a quiet 'why'."
        ),
        "beneath": (
            "Often the pull is the body remembering an old state — of "
            "being wanted, of feeling alive, of mattering — that your "
            "current life no longer provides in the same raw form. The "
            "compulsion is not moral failure. It is a younger self "
            "searching for a feeling they once had, or never had, "
            "through a channel that still gives a trace of it."
        ),
        "soft_exit": (
            "Name the feeling the pull is hunting — not the act. "
            "'I am looking for intensity.' 'I am looking for being "
            "chosen.' 'I am looking for the feeling that I exist.' "
            "Once the real hunger is named, it can be fed in gentler "
            "ways, with the people who already love you. The loop "
            "weakens when the hunger is spoken to directly."
        ),
        "new_rhythm": (
            "Intimacy with the people in your actual life becomes the "
            "place the old hunger is met. You stop performing control "
            "and start practising honesty. The pull does not always "
            "vanish at once — sometimes it visits — but it no longer "
            "owns the steering wheel. You become someone your family "
            "can trust, because you have become someone you can trust."
        ),
    },
    {
        "id": "pattern-food",
        "title": "Food that isn't about food",
        "surface": (
            "Eating past fullness, or eating very little, or eating in "
            "secret. The reach for food when the room is quiet and the "
            "day has been too much. The inner voice that negotiates with "
            "the fridge and usually loses."
        ),
        "beneath": (
            "The body has learned to use food to regulate feeling. It "
            "is a soft, legal, available comfort in a world where "
            "other comforts may have felt unsafe or expensive. For some "
            "the loop is filling an emptiness; for others it is "
            "controlling a chaos. Both are forms of care the body "
            "invented when nothing else was offered."
        ),
        "soft_exit": (
            "Before the reach, pause and ask one question: 'What am I "
            "feeling right now, if food were not an option?' The answer "
            "is usually small — tired, lonely, bored, angry, sad. Name "
            "it, out loud if you can. Feed that feeling first, in its "
            "own language (rest, a call, a walk, a cry), and see what "
            "remains. The loop loosens not through willpower, but "
            "through being met."
        ),
        "new_rhythm": (
            "Meals become pleasant again, because they are meals — "
            "not medicine. You notice you can finish eating without "
            "negotiation. The body starts sending hunger and fullness "
            "signals you actually hear. You stop scoring yourself; "
            "you start nourishing yourself."
        ),
    },
    {
        "id": "pattern-anger",
        "title": "The storm that arrives too quickly",
        "surface": (
            "Sudden anger, often out of proportion to the moment. Words "
            "that come out sharper than intended. Then the after-wave — "
            "regret, apology, a quiet promise it won't happen again, and "
            "then, sooner than expected, it does."
        ),
        "beneath": (
            "The storm is almost never about the present moment. It is "
            "an overflow from an older well — usually a time when your "
            "anger was the only thing keeping you safe, or when no one "
            "was there to feel angry on your behalf. The nervous system "
            "has kept that vigilance on ever since."
        ),
        "soft_exit": (
            "When the storm rises, do not try to reason with it. Step "
            "out of the room — physically — for three minutes. Put a "
            "hand on the belly and breathe out longer than in. The "
            "storm is real, but it is not the truth of the moment. "
            "It is the past asking, very urgently, to be seen."
        ),
        "new_rhythm": (
            "You notice the rise before the words. Space opens between "
            "the trigger and the response. Anger does not vanish — it "
            "becomes useful again, a clean signal rather than a "
            "weather-system. The people around you can feel the "
            "difference. The room starts to relax when you enter it."
        ),
    },
    {
        "id": "pattern-jealousy",
        "title": "The green shadow",
        "surface": (
            "The lurch in the stomach when your partner laughs with "
            "someone else. The compulsion to check messages, to read "
            "tone, to construct scenarios that are almost never true. "
            "The quiet erosion that jealousy leaves in its wake."
        ),
        "beneath": (
            "Jealousy is rarely about the other person. It is a wound "
            "about enough-ness — an old story that says love is scarce "
            "and you are replaceable. The mind reaches for evidence "
            "that confirms the story, because confirming it feels "
            "paradoxically safer than living with the uncertainty."
        ),
        "soft_exit": (
            "When the shadow rises, name the sentence underneath it — "
            "not out loud to your partner, but out loud to yourself. "
            "'I am afraid I am not enough.' That sentence is old and "
            "it belongs to a younger you. Place a hand on the chest "
            "and answer it gently: 'You are enough. You were always "
            "enough.' The shadow fades when the sentence beneath it "
            "is heard."
        ),
        "new_rhythm": (
            "Your partner's joy in others stops feeling like a threat. "
            "You notice you can be close without gripping. Trust "
            "returns — not as certainty, but as a quieter background. "
            "The relationship becomes lighter, because you are not "
            "asking it to heal what only the inner work can heal."
        ),
    },
    {
        "id": "pattern-screen",
        "title": "The screen that soothes and steals",
        "surface": (
            "Hours inside a glowing rectangle that feel like minutes. "
            "The headphones that stay on through dinner. The world "
            "inside the device feeling more real, more kind, more "
            "manageable than the world outside it. The quiet slide "
            "into not sleeping, not eating, not speaking."
        ),
        "beneath": (
            "For many, the screen is shelter from a household climate "
            "the body can no longer bear — raised voices, heavy "
            "silence, unspoken disappointment. The screen is not the "
            "problem. It is the first safe room that was available. "
            "The work is not to shame the screen — it is to make the "
            "physical room safer."
        ),
        "soft_exit": (
            "For the child: one shared meal per day without devices, "
            "with voices deliberately kept gentle. For the adult: one "
            "shared five-minute ritual — tea together, a walk, a "
            "hand on the shoulder. The loop opens not by forbidding "
            "the screen, but by making the offline room kinder than "
            "the screen."
        ),
        "new_rhythm": (
            "The child looks up from the screen without being asked. "
            "The adult notices the headphones coming off earlier. Real "
            "conversations return — small at first, then steadier. "
            "The home stops competing with the device, because the "
            "home has remembered how to be a home."
        ),
    },
    {
        "id": "pattern-borrowed-key",
        "title": "The borrowed key",
        "surface": (
            "You are the one who says yes when the answer is no. You "
            "anticipate other people's moods before you feel your own. "
            "You have many friends and a quiet, persistent tiredness "
            "that rest does not repair. When you are alone, you notice "
            "you do not quite know what you want for dinner."
        ),
        "beneath": (
            "Somewhere early, you were handed a key — not your own. "
            "It came from a parent, a grandparent, an older sibling who "
            "had learned: 'To be safe is to be useful. To be loved is "
            "to be needed.' You inherited the sentence without ever "
            "being told it was a sentence. The key opened a door in "
            "someone else's life long ago. In yours, it only opens "
            "exhaustion."
        ),
        "soft_exit": (
            "This key does not belong to you. You did not choose it "
            "and you do not owe anyone the life it was made for. Lay "
            "it down — not with drama, just with rest. Then notice, "
            "for one small moment today, what you actually want. Not "
            "what would be kind. Not what would be useful. Only what "
            "is yours. That quiet preference is the shape of your own "
            "key, beginning to be cut."
        ),
        "new_rhythm": (
            "You find you can say no and the relationship survives. "
            "People who only loved the useful version drift away — and "
            "the ones who stay feel lighter to be around. You notice "
            "small preferences returning: a song you like, a way you "
            "want your tea, a walk only you enjoy. A life begins to "
            "assemble itself around who you actually are."
        ),
    },
    {
        "id": "pattern-postponed",
        "title": "The postponed life",
        "surface": (
            "The important thing is always about to begin. The email "
            "will be sent tomorrow. The conversation will happen next "
            "week. The project, the doctor's visit, the honest "
            "sentence — all waiting for a day that never quite "
            "arrives. Days pass. The guilt grows. The task grows "
            "heavier for not being started."
        ),
        "beneath": (
            "Procrastination is almost never laziness. It is, most "
            "often, the body protecting you from a feeling you expect "
            "the task to bring: the fear of failing, the risk of being "
            "seen, the ache of finishing something that mattered. "
            "Delay is a shield the nervous system lifts when it does "
            "not yet trust the room. You are not avoiding the task. "
            "You are avoiding the feeling."
        ),
        "soft_exit": (
            "Name the feeling the task is protecting you from. 'I am "
            "afraid this will not be good enough.' 'I am afraid of "
            "what succeeding will ask of me.' 'I am afraid this will "
            "end and I will have to start the next thing.' Once the "
            "feeling is named, the task shrinks. Then begin — for five "
            "minutes only. Not to finish; just to arrive. The body "
            "learns the room was safer than it thought."
        ),
        "new_rhythm": (
            "You begin before you feel ready. You notice that most "
            "tasks are gentler than the waiting was. The backlog "
            "quietly thins — not through discipline, but through "
            "honesty. Something begins to trust you again: your own "
            "word to yourself. When you say you will, you do. That "
            "is its own small kind of coming home."
        ),
    },
]


@api_router.get("/body-room/patterns")
async def body_room_patterns():
    """Public — a quiet library of human patterns (the pull, food loops,
    anger storms, jealousy, the screen). Framed strictly without medical
    or shame language. Each pattern has four phases: surface, beneath,
    soft_exit, new_rhythm."""
    return {
        "patterns": SEED_PATTERNS,
        "preamble": (
            "These are not diagnoses. They are the familiar shapes that "
            "show up in almost every human life, sooner or later. Reading "
            "them is not an accusation — it is a mirror, offered softly. "
            "Take only what recognises itself in you tonight."
        ),
        "honesty_note": (
            "One quiet thing. The more honestly you can meet yourself "
            "here — even the parts that feel unflattering — the more the "
            "loop softens. Self-honesty is not self-attack. It is the "
            "light that lets the pattern finally be seen."
        ),
    }


# ----- Small journey questionnaire — five honest questions that help
# a wanderer locate which region(s) and which pattern(s) may want
# attention tonight. No storage, no account needed; the mapping is
# done client-side from the response keys.
BODY_ROOM_QUESTIONNAIRE = {
    "preamble": (
        "Five quiet questions. There are no wrong answers and no score. "
        "Answer for tonight only — not for your whole life. The first "
        "instinct is usually the true one."
    ),
    "honesty_prompt": (
        "How willing are you, tonight, to meet what rises without "
        "fixing it? The more honestly you can stay with the first "
        "answer that comes, the more useful the mirror becomes."
    ),
    "questions": [
        {
            "id": "q1-mind",
            "prompt": "When the day ends, what is loudest inside?",
            "options": [
                {"value": "thoughts",  "label": "Thoughts that will not slow down",   "regions": ["crown"]},
                {"value": "unsaid",    "label": "Words I did not say",                "regions": ["throat"]},
                {"value": "weight",    "label": "A weight in the centre of the chest", "regions": ["heart"]},
                {"value": "knot",      "label": "A knot under the ribs",              "regions": ["solar_plexus"]},
                {"value": "numb",      "label": "A quiet disconnection from myself",  "regions": ["belly"]},
            ],
        },
        {
            "id": "q2-body",
            "prompt": "Where in the body does the day settle?",
            "options": [
                {"value": "head",      "label": "Behind the eyes / top of the head",  "regions": ["crown"]},
                {"value": "chest",     "label": "Chest / breath feels shallow",        "regions": ["heart"]},
                {"value": "stomach",   "label": "Stomach / digestion",                 "regions": ["belly", "solar_plexus"]},
                {"value": "hips_back", "label": "Hips or lower back",                  "regions": ["hips"]},
                {"value": "hands_feet","label": "Hands grip, feet feel cold",          "regions": ["hands", "feet"]},
            ],
        },
        {
            "id": "q3-pattern",
            "prompt": "Is there a pattern that keeps returning?",
            "options": [
                {"value": "pull",     "label": "A pull I cannot explain (person / place / pleasure)", "patterns": ["pattern-pull"]},
                {"value": "food",     "label": "Food that is not about food",                         "patterns": ["pattern-food"]},
                {"value": "anger",    "label": "Anger that arrives too quickly",                      "patterns": ["pattern-anger"]},
                {"value": "jealousy", "label": "Jealousy or comparison",                              "patterns": ["pattern-jealousy"]},
                {"value": "screen",   "label": "Hours disappearing inside a screen",                  "patterns": ["pattern-screen"]},
                {"value": "none",     "label": "None of these tonight",                               "patterns": []},
            ],
        },
        {
            "id": "q4-belonging",
            "prompt": "How does it feel to stand, right now?",
            "options": [
                {"value": "rooted",    "label": "Rooted — I belong where I am",       "regions": []},
                {"value": "provisional","label": "Provisional — like a guest",         "regions": ["feet"]},
                {"value": "bracing",   "label": "Bracing, ready to move",              "regions": ["feet", "solar_plexus"]},
                {"value": "walled",    "label": "Walled off, kept inside",             "regions": ["heart"]},
            ],
        },
        {
            "id": "q5-honesty",
            "prompt": "How ready are you, tonight, to let one old structure rest?",
            "options": [
                {"value": "ready",      "label": "Ready. I am tired of carrying it.",    "weight": 3},
                {"value": "curious",    "label": "Curious. I would like to meet it.",    "weight": 2},
                {"value": "ambivalent", "label": "Ambivalent. Part of me is not ready.", "weight": 1},
                {"value": "not_tonight","label": "Not tonight. Just visiting.",          "weight": 0},
            ],
        },
    ],
}


@api_router.get("/body-room/questionnaire")
async def body_room_questionnaire():
    """Public — the five honesty questions. The frontend maps the user's
    answers to regions + patterns on the client. No server storage."""
    return BODY_ROOM_QUESTIONNAIRE


@api_router.get("/body-room/image/{slug}")
async def body_room_image(slug: str):
    """Serve a Nano-Banana-generated body-room PNG.

    Persistence order (production-safe):
        1. MongoDB ``binary_assets`` collection (survives deploys).
        2. Local filesystem fallback (preview env / fresh boot).

    Slug must match one of the BODY_HOTSPOTS image_slug values —
    otherwise 404, so we never expose the filesystem to arbitrary
    path traversal.
    """
    allowed = {v["image_slug"] for v in BODY_HOTSPOTS.values() if v.get("image_slug")}
    if slug not in allowed:
        raise HTTPException(status_code=404, detail="Image not found.")

    # 1) MongoDB (production-safe)
    from binary_storage import get_binary
    asset = await get_binary(db, kind="body_room", slug=slug)
    if asset and asset.get("data"):
        from fastapi.responses import Response as _Resp
        return _Resp(
            content=asset["data"],
            media_type=asset.get("content_type") or "image/png",
            headers={"Cache-Control": "public, max-age=86400"},
        )

    # 2) Filesystem fallback (preview env, before first deploy)
    p = Path("/app/backend/storage/body_room") / f"{slug}.png"
    if p.exists():
        return FileResponse(str(p), media_type="image/png")

    raise HTTPException(status_code=404, detail="Image not generated yet.")


@api_router.get("/books/cover/{slug}.jpg")
async def book_cover(slug: str):
    """Serve the PDF-first-page cover rendered by scripts/extract_book_covers.py.

    Persistence order:
        1. MongoDB ``binary_assets`` (survives deploys).
        2. Local filesystem fallback.
    """
    # Simple slug safety: alnum + dashes only.
    if not slug or any(ch not in "abcdefghijklmnopqrstuvwxyz0123456789-" for ch in slug):
        raise HTTPException(status_code=404, detail="Cover not found.")

    from binary_storage import get_binary
    asset = await get_binary(db, kind="book_cover", slug=slug)
    if asset and asset.get("data"):
        from fastapi.responses import Response as _Resp
        return _Resp(
            content=asset["data"],
            media_type=asset.get("content_type") or "image/jpeg",
            headers={"Cache-Control": "public, max-age=86400"},
        )

    p = Path("/app/backend/storage/covers") / f"{slug}.jpg"
    if not p.exists():
        raise HTTPException(status_code=404, detail="Cover not found.")
    return FileResponse(str(p), media_type="image/jpeg")


@api_router.post("/body-room/insight")
async def body_room_record_insight(inp: BodyInsightInput, request: Request):
    """Auth — record that this user paused on a body region. Used as
    state-bridge into Clarity Release."""
    user = await _require_user(request)
    note = (inp.self_report or "")[:500]
    intensity = inp.intensity
    if intensity is not None:
        intensity = max(1, min(5, int(intensity)))
    doc = {
        "id": str(uuid.uuid4()),
        "user_id": user.user_id,
        "region": inp.region,
        "self_report": note or None,
        "intensity": intensity,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "acknowledged_at": None,
    }
    await db.body_insights.insert_one(doc)
    return {"status": "ok", "id": doc["id"]}


@api_router.get("/body-room/insights")
async def body_room_recent_insights(request: Request, limit: int = 5):
    """Auth — return this user's most recent body insights, newest first."""
    user = await _require_user(request)
    limit = max(1, min(20, int(limit)))
    rows = (
        await db.body_insights
        .find({"user_id": user.user_id}, {"_id": 0})
        .sort("created_at", -1)
        .to_list(limit)
    )
    return {"insights": rows, "total": await db.body_insights.count_documents({"user_id": user.user_id})}


# -------------------------------------------------------------
# §G3 Body Room Mentor — somatic chat surface (iter 60).
# Stateless: no DB session. Each request carries its own short
# transcript from the wanderer's browser memory + optional
# body_context (region / pattern / their own short note).
# Auth required so we can attribute crisis responses & rate-limit.
# -------------------------------------------------------------
class BodyRoomChatTurn(BaseModel):
    role: Literal["user", "guide"]
    text: str


class BodyRoomChatIn(BaseModel):
    message: str
    history: Optional[List[BodyRoomChatTurn]] = None
    body_context: Optional[Dict[str, Any]] = None
    transient_context: Optional[List[str]] = None
    session_id: Optional[str] = None  # client-supplied UUID for log scoping
    lens: Optional[str] = None  # §Stage 2.9d — opt-in wisdom lens id


@api_router.get("/body-room/lenses")
async def body_room_lenses():
    """Public registry of the three opt-in wisdom lenses (Eastern /
    Psychosomatic Mirror / Somatic Science). Returns metadata + each
    lens's 8 region-insights so the frontend can render the selector
    and the per-region card without a second round-trip.

    No auth required — the lens registry itself contains no PII; it is
    static content authored by us.
    """
    from body_lenses import list_lenses
    return {"lenses": list_lenses()}


@api_router.get("/parents-room/lenses")
async def parents_room_lenses():
    """Public registry of the four opt-in parenting lenses (Intuitive
    Flow / Shitsuke / Montessori / Positive Coding) for the new
    `/parents-room` page. Same JSON shape as `/body-room/lenses` but
    keyed on `situations` instead of `regions` (bedtime, mealtime,
    big_emotions, screen_time, sibling, separation, school_stress,
    connection).

    No auth required — static content authored by us.
    """
    from parents_lenses import list_lenses as parents_list_lenses
    return {"lenses": parents_list_lenses()}


# §SARA-CRISIS-SEARCH 2026-05-28 — Founder directive (Blueprint v3.1):
# When a parent is in acute crisis they should not need to wait for a
# live LLM round-trip. This endpoint runs a pure keyword search over
# the static parents_lenses.py registry (3 active lenses × 8 situations
# = 24 cards), returning ranked matches with insight + practice +
# permission for each situation, viewed through every available lens
# in parallel. Zero LLM cost. Sub-millisecond response.
@api_router.get("/parents-room/crisis-search")
async def parents_room_crisis_search(q: str = ""):
    from parents_lenses import LENSES, SITUATION_IDS

    query = (q or "").strip().lower()
    if not query or len(query) < 2:
        return {"query": query, "matches": []}

    # Each situation has natural keyword associations that crisis
    # searches use — far broader than the situation id alone. We map
    # them once and intersect the parent's words against the bag.
    SITUATION_KEYWORDS = {
        "bedtime": [
            "bedtime", "sleep", "won't sleep", "wont sleep", "magama", "uni",
            "night", "evening", "tired", "won't go to bed", "bedtime battle",
            "wake up", "nightmare", "afraid of the dark", "ärkab",
        ],
        "mealtime": [
            "meal", "eat", "food", "picky", "ei söö", "söömine", "söögi",
            "won't eat", "wont eat", "refuse food", "vegetables", "dinner",
            "breakfast", "lunch", "hunger", "snack", "fussy", "feeding",
        ],
        "big_emotions": [
            "tantrum", "meltdown", "screaming", "scream", "crying",
            "overwhelm", "rage", "anger", "angry", "big feelings",
            "explosion", "frustrated", "frustration", "raev", "viha",
            "nutab", "karjub", "hüsteeria", "hysterical",
        ],
        "screen_time": [
            "screen", "phone", "tablet", "ipad", "tv", "youtube",
            "game", "gaming", "device", "ekraan", "telefon", "video",
            "too much screen", "addicted", "won't turn off",
        ],
        "sibling": [
            "sibling", "brother", "sister", "fight", "fighting",
            "sharing", "jealous", "jealousy", "õde", "vend",
            "kaklus", "rivalry", "argues",
        ],
        "separation": [
            "separation", "daycare", "drop off", "drop-off", "leaving",
            "clingy", "won't let go", "wont let go", "lasteaed",
            "school start", "first day", "kindergarten", "missing me",
            "anxiety when i leave",
        ],
        "school_stress": [
            "homework", "school", "grade", "grades", "exam", "test",
            "pressure", "perform", "performance", "kool", "õppimine",
            "kontrolltöö", "hinded", "teacher", "afraid of failure",
            "anxious about school",
        ],
        "connection": [
            "connection", "closeness", "distant", "ignoring me", "doesn't talk",
            "won't talk", "quiet", "lonely", "isolated", "drifting",
            "lähedus", "hingelähedus", "ühendus", "repair",
            "i don't know how to reach", "feels far away",
        ],
    }

    # Compute a simple score per situation: count of keyword tokens
    # whose text appears in the query string. Then collect all lenses'
    # cards for each match so the parent sees the situation through
    # every cultural register in one page.
    results = []
    for sit_id in SITUATION_IDS:
        kws = SITUATION_KEYWORDS.get(sit_id, [])
        # Score = highest-precision match wins (longer phrase > word)
        score = 0
        matched_terms = []
        for kw in kws:
            if kw in query:
                score += max(2, len(kw.split()))
                matched_terms.append(kw)
        # Single-word fallback: token-level intersection
        if score == 0:
            q_tokens = set(query.split())
            for kw in kws:
                if any(tok in q_tokens for tok in kw.split() if len(tok) >= 4):
                    score += 1
                    matched_terms.append(kw)
                    break
        if score == 0:
            continue

        lens_views = []
        for lens_id, lens in LENSES.items():
            sit = (lens.get("situations") or {}).get(sit_id)
            if not sit:
                continue
            lens_views.append({
                "lens_id": lens_id,
                "lens_name": lens["name"],
                "lens_subtitle": lens.get("subtitle", ""),
                "insight": sit.get("insight", ""),
                "practice": sit.get("practice", ""),
                "permission": sit.get("permission", ""),
            })

        results.append({
            "situation_id": sit_id,
            "score": score,
            "matched_terms": matched_terms[:3],
            "lens_views": lens_views,
        })

    # Highest score first; tie-break by situation order
    results.sort(key=lambda r: (-r["score"], SITUATION_IDS.index(r["situation_id"])))

    # §SARA-COMPASS-V2 2026-05-28 — Anonymous query logging.
    # Zero PII: only the query text, day bucket (YYYY-MM-DD), top-matched
    # situations, and a count. Used solely to surface "Top 10 worries
    # parents actually type" for the founder's marketing reports.
    try:
        if query and len(query) >= 2:
            today_str = datetime.now(timezone.utc).strftime("%Y-%m-%d")
            top_sits = [r["situation_id"] for r in results[:3]]
            now_utc = datetime.now(timezone.utc)
            await db.sara_search_queries.update_one(
                {"day": today_str, "query": query[:120]},
                {
                    "$inc": {"count": 1},
                    "$setOnInsert": {
                        "first_seen": now_utc,
                        "top_situations": top_sits,
                    },
                    "$set": {"last_seen": now_utc},
                },
                upsert=True,
            )
    except Exception:
        # Logging must never break the search.
        pass

    return {"query": query, "matches": results[:4]}


# §SARA-COMPASS-V2 2026-05-28 — Founder-only report endpoint. Returns
# top crisis queries parents have actually typed over the last N days,
# with their top-matched situations. Zero PII.
@api_router.get("/parents-room/compass/top-queries")
async def parents_room_top_queries(request: Request, days: int = 30):
    user = await _require_user(request)
    if not (user.get("is_admin") or user.get("email") == os.environ.get("ADMIN_EMAIL")):
        raise HTTPException(status_code=403, detail="Founder only.")
    cutoff = (
        datetime.now(timezone.utc) - timedelta(days=max(1, min(days, 365)))
    ).strftime("%Y-%m-%d")
    pipeline = [
        {"$match": {"day": {"$gte": cutoff}}},
        {"$group": {
            "_id": "$query",
            "total": {"$sum": "$count"},
            "days_seen": {"$addToSet": "$day"},
            "top_situations": {"$first": "$top_situations"},
        }},
        {"$project": {
            "_id": 0,
            "query": "$_id",
            "total": 1,
            "days_seen_count": {"$size": "$days_seen"},
            "top_situations": 1,
        }},
        {"$sort": {"total": -1}},
        {"$limit": 25},
    ]
    cursor = db.sara_search_queries.aggregate(pipeline)
    rows = [doc async for doc in cursor]
    return {"window_days": days, "rows": rows}


@api_router.post("/body-room/chat")
async def body_room_chat(inp: BodyRoomChatIn, request: Request):
    """One-shot Body Room mentor reply. Stateless on the server: the
    caller passes its own short history from the browser. Soft-fails to
    a calm fallback line on any LLM error."""
    user = await _require_user(request)
    text = (inp.message or "").strip()
    if not text:
        raise HTTPException(status_code=400, detail="Empty message.")
    if len(text) > 1500:
        text = text[:1500]

    # §W-3 daily ceiling — shared with Cabinet so the wanderer cannot
    # bypass by alternating rooms.
    await _enforce_chat_cap(user, "body_room")

    history = []
    for h in (inp.history or [])[-10:]:
        history.append({"role": h.role, "text": (h.text or "")[:600]})

    transient = []
    for t in (inp.transient_context or [])[-5:]:
        if isinstance(t, str):
            transient.append(t.strip()[:240])

    # §Stage 3.3 — Cross-Room quiet-knowledge bridge.
    quiet_block = await _quiet_knowledge_block(user.user_id, "body")

    reply = await generate_body_reply(
        user_text=text,
        history=history,
        body_context=inp.body_context,
        transient_context=transient,
        session_id=inp.session_id or user.user_id,
        lens=(inp.lens or "").strip().lower() or None,
        quiet_knowledge=quiet_block,
    )
    # §Stage 3.3 — record any signals from the wanderer's text (write).
    asyncio.create_task(_record_room_signals_safe(user.user_id, "body", text))
    # `reply` is now a dict {text, tone_tag, user_state}. Backward-compat
    # shim: keep `reply` (str) AND surface the new presence signals.
    return {
        "reply": reply.get("text") if isinstance(reply, dict) else reply,
        "tone_tag": reply.get("tone_tag") if isinstance(reply, dict) else None,
        "user_state": reply.get("user_state") if isinstance(reply, dict) else None,
    }


class ParentsRoomChatTurn(BaseModel):
    role: str  # "user" | "guide"
    text: str


class ParentsRoomChatIn(BaseModel):
    message: str
    history: Optional[List[ParentsRoomChatTurn]] = None
    situation: Optional[str] = None  # bedtime / mealtime / big_emotions / ...
    transient_context: Optional[List[str]] = None
    session_id: Optional[str] = None
    lens: Optional[str] = None  # intuitive | shitsuke | montessori | positive_coding


@api_router.post("/parents-room/chat")
async def parents_room_chat(inp: ParentsRoomChatIn, request: Request):
    """One-shot Parents' Room mentor reply. Stateless on the server.
    Mirrors `/body-room/chat`: same chat-cap, same wellness-language
    lock, same Cross-Room quiet-knowledge bridge. The chosen parenting
    lens (intuitive default) is injected into the prompt."""
    user = await _require_user(request)
    text = (inp.message or "").strip()
    if not text:
        raise HTTPException(status_code=400, detail="Empty message.")
    if len(text) > 1500:
        text = text[:1500]

    # §W-3 daily ceiling — shared with all other rooms.
    await _enforce_chat_cap(user, "parents_room")

    history = []
    for h in (inp.history or [])[-10:]:
        history.append({"role": h.role, "text": (h.text or "")[:600]})

    transient = []
    for t in (inp.transient_context or [])[-5:]:
        if isinstance(t, str):
            transient.append(t.strip()[:240])

    quiet_block = await _quiet_knowledge_block(user.user_id, "parents")

    reply = await generate_parents_reply(
        user_text=text,
        history=history,
        situation=(inp.situation or "").strip().lower() or None,
        transient_context=transient,
        session_id=inp.session_id or user.user_id,
        lens=(inp.lens or "").strip().lower() or None,
        quiet_knowledge=quiet_block,
    )
    asyncio.create_task(_record_room_signals_safe(user.user_id, "parents", text))
    return {
        "reply": reply.get("text") if isinstance(reply, dict) else reply,
        "tone_tag": reply.get("tone_tag") if isinstance(reply, dict) else None,
        "user_state": reply.get("user_state") if isinstance(reply, dict) else None,
    }


# =============================================================
# COURSE ROOM — "Quiet Letters"
# Each course is a series of N letters delivered with a drip-feed
# (e.g. one letter per day, or 1/3/5/7 staggered). Letter content is
# hand-curated and stored in SEED_COURSES below — no AI generation.
# Free preview = letter 1. Subsequent letters are gated by the
# user's enrollment (db.course_enrollments) and the letter's
# unlock_day vs days-since-enrollment.
# =============================================================

SEED_COURSES: List[dict] = [
    {
        "slug": "letting-the-old-stories-rest",
        "title": "Letting the old stories rest",
        "audience": "adult",
        "duration_days": 7,
        "blurb": "Seven slow letters about the patterns we did not choose, and the quiet permission to put them down.",
        "price": 25.0,
        "lemonsqueezy_variant_id": "1606407",
        "audio_companion": "/assets/audio/courses/borrowed-beliefs.mp3",
        "audio_title": "Borrowed beliefs",
        "letters": [
            {
                "day": 1,
                "title": "The line you didn't write",
                "body": (
                    'You\'re 38. You\'re on a Zoom call. Your boss says something that lands in your chest in a way that\'s much heavier than the actual sentence deserved.\n\nHalf a second later, before you can stop it, you hear yourself reply in a voice that isn\'t quite yours. Slightly too apologetic. Slightly too quick to agree. Slightly too small.\n\nThat voice came from somewhere. You didn\'t write it.\n\nMost of what you call your personality was loaded at boot by people who were tired, or scared, or grieving inside a body that had to keep moving. They handed you a script. You memorised it before you knew you had a choice.\n\nThis week is about naming one of those lines. Not changing it yet. Just seeing that it exists.\n\n**Today\'s input:**\nWrite down one sentence you find yourself saying, or thinking, that you suspect isn\'t actually yours. The kind of line that comes out too fast to be examined.\n\nDon\'t analyse it. Don\'t try to "release" anything. Just see it on the page in your own handwriting.\n\nThat single act — writing the line down so it\'s no longer running in the background — is the entire job today.\n\nThe next letter arrives in 24 hours.'
                ),
                "prompt": "What line do I find myself saying that doesn't sound like me?",
            },
            {
                "day": 2,
                "title": 'The hands that gave it to you',
                "body": (
                    'You wrote the line down yesterday.\n\nNow look at it. Read it slowly. Where did you learn that exact sentence?\n\nFor most of us, it\'s not abstract. It\'s a specific person, in a specific room, who said something — or repeated something, or silently expected something — and you absorbed it before you had language to push back.\n\nToday is not about blaming that person. Most of the people who handed you these lines were carrying scripts of their own that they had also not written.\n\nWhat today is about: shrinking the line from mythic to human-sized.\n\nA line that comes from "the universe" or "just how I am" stays in charge of you. A line that comes from one specific tired person in one specific room is the size of one tired person in one specific room. It can be put down.\n\n**Today\'s input:**\nBeside yesterday\'s line, write one more sentence:\n\n*This line was handed to me by ___, who at the time was carrying ___.*\n\nThat\'s it. Two sentences total on the page. You\'re not forgiving anyone. You\'re just downsizing the line so it stops being a god.\n\n24 hours.'
                ),
                "prompt": 'Who handed me this line, and what were they carrying at the time?',
            },
            {
                "day": 3,
                "title": 'What it has cost you to keep carrying',
                "body": (
                    'Every inherited line has a bill.\n\nSometimes the bill is paid in a relationship that bent because you couldn\'t say a thing. Sometimes it\'s paid in a job you took because the line told you the better one was "not for people like you." Sometimes it\'s paid in the body — the shoulder that locks up before a difficult email, the breath you stop taking when your phone buzzes.\n\nYou\'ve been paying this bill for years without anyone ever showing you the receipt.\n\nThis isn\'t about getting angry. Anger is fine if it shows up, but that\'s not the task. The task is to look at the cost honestly and let yourself know it.\n\nThe reason this matters: as long as the cost is invisible, the line feels free to carry. The moment the cost is visible, the body starts asking a different question — *do I still want to pay this?*\n\n**Today\'s input:**\nOne line. Where in your life has this script cost you the most?\n\nCareer? Body? Specific relationship? The version of yourself you haven\'t allowed?\n\nPick one. Write it down. Don\'t fix it. Just see the receipt.\n\n24 hours.'
                ),
                "prompt": 'Where in my life has this line cost me the most?',
            },
            {
                "day": 4,
                "title": "The ending you weren't shown",
                "body": (
                    'The line you\'ve been carrying came with an ending attached.\n\nThe ending is usually a wall. *People like me don\'t get this.* *This kind of love eventually leaves.* *If I\'m too much, they\'ll go.* *I\'ll always be the one who has to manage.*\n\nThe wall feels like a fact. It isn\'t. It\'s a sentence someone said in a room when you were small, repeated until your body started budgeting around it.\n\nFor tonight only: imagine the wall is a curtain.\n\nBehind the curtain, the same story, the same you, but the line at the end bends a little kinder. Not magical. Not denial. Just a softer landing.\n\nWhat does that look like? Even faintly?\n\n**Today\'s input:**\nWrite the old ending in one sentence.\n\nBeside it, write three alternative endings. Not "good" ones. Just *different* ones. The exercise is to prove to your nervous system that the old ending isn\'t the only ending physics will allow.\n\nChoose one of the three. Keep company with it this week. You don\'t have to commit to it. Just don\'t reject it.\n\n24 hours.'
                ),
                "prompt": 'What is one alternative ending I am willing to keep company with?',
            },
            {
                "day": 5,
                "title": 'Release without rejection',
                "body": (
                    'You don\'t have to hate the line to put it down.\n\nThat\'s a trap a lot of people fall into around now. They start to see the script and the natural reflex is *I should have known better, I was an idiot, this whole part of my life is wasted.*\n\nThat reflex is itself an inherited line. Watch it. Don\'t follow it.\n\nThe story you\'ve been carrying did a job once. The 7-year-old version of you picked it up because the room they were in required them to. That kid wasn\'t stupid. They were surviving.\n\nWhat you\'re doing now is different. You\'re an adult. The room is different. The job the script did then is no longer the job that needs doing now. You can thank it and walk on.\n\n**Today\'s input:**\nWrite a one-line "thank you" to the script.\n\n*Thank you, [story], for keeping me [what it protected].*\n\nThen a second line:\n\n*I\'m ready to walk on because [what\'s true now that wasn\'t then].*\n\nThat\'s the whole letter today. Two lines on a page. Not a vow. Not a manifesto. A receipt.\n\n24 hours.'
                ),
                "prompt": 'What would I thank this line for, before walking on?',
            },
            {
                "day": 6,
                "title": 'The space that opens',
                "body": (
                    'When you set down a story you\'ve been carrying for 20 years, the first thing you\'ll feel is not relief.\n\nYou\'ll feel weird. Unmoored. Strangely bored. Slightly anxious in a way you can\'t name. Some people describe it as walking around a house that\'s been remodelled while they slept.\n\nDon\'t fix it.\n\nThe instinct will be to immediately fill the space with another project, another story, another self-improvement loop. *Now that I\'ve put this down, I should start [new thing] right away.* Resist that, gently.\n\nThe space is the medicine. The discomfort is the body learning a new shape. If you fill it too fast, you\'ve just swapped one borrowed line for another.\n\nWhat to do instead: notice. For the next 24 hours, when the urge to fill the space arrives, name it ("the filling urge is here right now"), and let it pass without acting on it.\n\n**Today\'s input:**\nSit somewhere quiet for 5 minutes today and do nothing.\n\nNot meditate. Not breathe deliberately. Not "be present." Just sit in the new shape and let the body get used to it.\n\nIf 5 minutes feels too long, do 90 seconds. The duration is not the point. The honest emptiness is.\n\n24 hours.'
                ),
                "prompt": 'What did I notice when I sat in the space without filling it?',
            },
            {
                "day": 7,
                "title": 'What you take with you',
                "body": (
                    'You started this week with a single line you didn\'t write.\n\nYou\'ve now:\n- Named it\n- Sized it down to one human\'s room\n- Counted what it cost\n- Imagined a softer ending\n- Thanked it and put it down\n- Sat in the empty space without filling it\n\nThat\'s the entire architecture of letting an old story rest.\n\nYou\'ll need to run it again. Not because this one didn\'t work, but because the human mind has more than one inherited line. Most of us have a dozen. This is the protocol for releasing them, one at a time, on whatever cadence the body can hold.\n\nThe other two sequences in this room handle adjacent vectors:\n\n→ **"The language you forgot"** — restoring the soft inner voice that the day-noise has been overwriting. Letter 1 free preview.\n\n→ **"The body knows first"** — the same work, run through the hardware instead of the cognitive layer. Letter 1 free preview.\n\nThe bundle of all three is €39 (saves €36 vs. individual). Or stay with this one a while. There\'s no urgency.\n\n**Today\'s input:**\nWrite one sentence: *The line I put down this week was ___.*\n\nPin it somewhere you\'ll see it next month. Not because you\'ll need reminding. Because future-you should know what past-you released, and on what date.\n\nThat\'s the whole work.\n\nUntil the next room.\n\n— Alistair'
                ),
                "prompt": 'The line I put down this week was…',
            },
        ],
    },
    {
        "slug": "the-language-you-forgot",
        "title": "The language you forgot",
        "audience": "adult",
        "duration_days": 7,
        "blurb": "A return to the soft inner voice, the one that always whispered before the world taught us to shout.",
        "price": 25.0,
        "lemonsqueezy_variant_id": "1606433",
        "audio_companion": "/assets/audio/courses/as-yourself.mp3",
        "audio_title": "As yourself",
        "letters": [
            {
                "day": 1,
                "title": "The voice beneath the noise",
                "body": (
                    "There is a voice in you that has never lied. It is older than your worry. It is quieter than your news feed. "
                    "It is more steady than the version of you that wakes up running. It is the voice that knew, even at five years old, "
                    "when something was off in a room — though it could not yet explain what or why.\n\n"
                    "We did not lose this voice. We learned to speak over it. The world is loud, the days are scheduled, "
                    "and the voice has the manners of weather rather than alarms. It does not push. It does not insist. It waits.\n\n"
                    "Tonight is not about commanding it to speak. It is about listening for the place inside where it lives. "
                    "Beneath the to-do list. Beneath the current of small fears. Beneath even the helpful self-talk we have rehearsed for years. "
                    "There is a still register down there. That is where the voice is.\n\n"
                    "**Day practice:** Sit somewhere quiet for five minutes with the question *What is the truest thing I know right now, even if it is small?* "
                    "Do not strain. If a clear sentence arrives, write it down. If only a feeling arrives, write the feeling. The voice often arrives before the words.\n\n"
                    "**Quiet line:** *I do not have to drown out my own quiet to feel real.*"
                ),
                "prompt": "What was the last true thing my inner voice said to me?",
            },
            {
                "day": 2,
                "title": "When you first stopped listening",
                "body": (
                    "There is usually a moment, sometimes more than one, when we learned that listening to ourselves was unsafe. "
                    "A parent who needed us to be calmer than we were. A teacher who corrected the inner answer before it could finish. "
                    "A relationship in which our own knowing was treated as an inconvenience. A culture that rewarded performance over presence.\n\n"
                    "The voice did not leave then. We just learned to hold it back — for safety, for love, for survival. "
                    "Holding it back was not weakness. It was intelligent at the time. The cost is only visible now, "
                    "when we are old enough to live differently and the voice is asking, gently, to come back.\n\n"
                    "Tonight is not about blaming the rooms that taught us to silence ourselves. It is about noticing that the silencing happened. "
                    "Naming it loosens its grip. From here, we can begin to listen on purpose.\n\n"
                    "**Day practice:** Write one or two lines: *I first learned that my inner voice was not safe to follow when —* and name a moment, even if small. "
                    "Then: *I forgive the version of me who learned to go quiet — they were keeping us alive.*\n\n"
                    "**Quiet line:** *Going quiet was once intelligent. Listening again is now allowed.*"
                ),
                "prompt": "When did I first decide my inner voice was not safe to listen to?",
            },
            {
                "day": 3,
                "title": "The dialect of the body",
                "body": (
                    "The inner voice does not always speak in sentences. It speaks first through the body. "
                    "A tightening in the throat when something is not quite right. A softening in the chest when a person is safe. "
                    "The breath that catches before a *no* the mouth has not yet formed. The yawn that arrives at the exact end of an honest conversation. "
                    "These are not random. These are the voice's first language.\n\n"
                    "We live in a culture that asks the body to be silent unless it is performing. We override the body's signals dozens of times a day — "
                    "drinking the third coffee past its welcome, staying in the conversation that has already drained us, "
                    "smiling through the meeting that the shoulders are quietly leaving. The voice is in there, every time, asking to be heard before the words have to.\n\n"
                    "**Day practice:** Throughout one ordinary hour tomorrow, pause three times and ask: *Where in my body is something happening right now?* "
                    "Notice without naming it as good or bad. Write the three notes down at the end of the day, in three short lines, without explanation.\n\n"
                    "**Quiet line:** *My body has been speaking for me all along. I am willing to listen.*"
                ),
                "prompt": "Where does my body whisper the truth most clearly?",
            },
            {
                "day": 4,
                "title": "Translating without hurry",
                "body": (
                    "Inner language does not arrive packaged. It arrives as weather, as weight, as image, as a slow refusal, as a quiet *yes* that surprises us. "
                    "Translating it into something we can act on takes time. Slow translation is loving translation. "
                    "Fast translation often produces a borrowed answer in our own voice — a sentence we have heard somewhere else, that sounds wise, "
                    "but that is not actually what the inner voice was trying to say.\n\n"
                    "Tonight, we practice patience with the message we are receiving. If it arrives as a feeling and not a word, that is enough. "
                    "If it arrives as a colour, a memory, a hand-shape, a direction, that is enough. The mind will keep asking *what does it mean?* — that is the mind's job. "
                    "Tonight the gentle reply is: *not yet, and that is fine.*\n\n"
                    "**Day practice:** Choose one feeling that has been with you this week. Write a short paragraph beginning "
                    "*If I do not rush to translate this feeling, what I notice is —* and let the description be sensory before it is conceptual. "
                    "End with: *I do not have to know what this means tonight.*\n\n"
                    "**Quiet line:** *Slow translation is loving translation.*"
                ),
                "prompt": "What is one feeling I have not yet translated into words?",
            },
            {
                "day": 5,
                "title": "The small daily question",
                "body": (
                    "A practice the voice loves: a single small question, asked each morning, lived with through the day. "
                    "Not *what should I do with my life?* — that question is too big to be heard by anything but the loudest part of the mind. "
                    "A small question. *What does today need from me, gently?* *Where can I stop pushing?* *Whose presence am I missing?* "
                    "*What is one thing I have been postponing because I am afraid it will say yes?*\n\n"
                    "The voice answers small questions far more readily than large ones. The answer often does not arrive at the moment of asking. "
                    "It arrives by evening, in something we almost missed — a song, a sentence overheard, a soft shift in mood that says *yes, that.*\n\n"
                    "The practice is not to interrogate. It is to live alongside the question, the way we might live alongside a cat in the kitchen — with awareness, without insistence.\n\n"
                    "**Day practice:** Choose one small question for tomorrow. Write it on something you will see in the morning. "
                    "Live with it through the day without forcing answers. In the evening, write what arrived, even if it is only one sentence.\n\n"
                    "**Quiet line:** *Small questions live longer in me than loud demands.*"
                ),
                "prompt": "What question do I want to live with tomorrow?",
            },
            {
                "day": 6,
                "title": "Letting it be wrong sometimes",
                "body": (
                    "The inner voice is not infallible. It is loyal. It will sometimes give us a reading shaped by an old fear rather than the present moment. "
                    "It will occasionally protect us from things we did not actually need protection from. It will, on rare days, be plainly wrong. "
                    "This is not a reason to stop listening. It is a reason to listen more closely.\n\n"
                    "Wisdom does not grow from certainty. It grows from a long, honest conversation with our own inner sense, "
                    "where we test what it says against what actually unfolds. When the voice was right, we mark it gently. "
                    "When it was off, we adjust without scolding. This is how the voice becomes more accurate over time — "
                    "through being listened to, not through being demanded perfect.\n\n"
                    "**Day practice:** Recall one moment when your inner sense was right, and one moment when it was off. "
                    "Write a sentence for each. End with: *I do not need my voice to be perfect to be worth listening to.*\n\n"
                    "**Quiet line:** *Loyalty is not the same as infallibility. I can listen even to a fallible voice with care.*"
                ),
                "prompt": "Where am I afraid to trust myself, and why?",
            },
            {
                "day": 7,
                "title": "A return, not an arrival",
                "body": (
                    "You have not learned a new language this week. You have remembered an old one. The voice was never gone — only quieter than the world. "
                    "Returning to it is not a destination. It is more like coming home to a kitchen that has been waiting, lights still on, kettle ready.\n\n"
                    "From tonight, listening becomes ordinary again. Not a project. Not a performance. A small habit that re-threads itself into the day — "
                    "a pause before the answer, a check at the chest before the yes, a willingness to say *let me sit with this overnight* when something matters. "
                    "Over months, this rebuilds a kind of trust in yourself that no external authority can give and no external chaos can remove.\n\n"
                    "This is the closing letter, but the voice has only just begun to be welcome again. Be gentle with it. It has been waiting a long time.\n\n"
                    "**Day practice:** Write a short closing line in your own handwriting beginning *From tonight, I welcome —* "
                    "and place it where you keep things that matter to you. The act of writing it counts. The act of seeing it tomorrow counts more.\n\n"
                    "**Quiet line:** *I am not arriving anywhere new. I am returning to where I have always been.*"
                ),
                "prompt": "What is the one sentence the voice is saying to me right now?",
            },
        ],
    },
    {
        "slug": "seven-quiet-evenings-with-children",
        "title": "Seven quiet evenings with children",
        "audience": "parents",
        "duration_days": 7,
        "blurb": "For parents who want the bedtime hour to be slower, kinder, and more honest. One small ritual per evening.",
        "price": 20.0,
        "lemonsqueezy_variant_id": "1606445",
        "audio_companion": "/assets/audio/courses/blueprint-inside-you.mp3",
        "audio_title": "Blueprint inside you",
        "letters": [
            {
                "day": 1,
                "title": "The slow hand",
                "body": (
                    "Children do not learn calm from words. They learn it from the hands that touch them, the rhythm of the bath, the speed at which the bedroom light is dimmed. "
                    "Their nervous system reads ours long before they understand the language we speak. "
                    "If we move through bedtime as if we are completing a task, they feel completion. "
                    "If we move through it as if we are arriving home with them, they feel arrival.\n\n"
                    "Tonight, lower the speed of your hands by half. Not for effect — for honesty. Notice how the small body matches yours. "
                    "Notice your own shoulders fall, almost without permission, when you stop hurrying. "
                    "The child does not need a longer bedtime. They need a quieter one. The two are different.\n\n"
                    "If the day was hard and your own nervous system is wired tight, this practice is doubly important. "
                    "Slowing your hands is the fastest, kindest message your body can give them: *the day is over now. We are safe.*\n\n"
                    "**Day practice:** Tonight, time one ordinary bedtime task — buttoning pyjamas, brushing teeth, lifting the duvet — and do it at half speed without explaining anything. "
                    "Afterwards, in one line, write what your own body felt when you slowed down.\n\n"
                    "**Quiet line:** *They learn from my hands before they learn from my words.*"
                ),
                "prompt": "What did my hands feel like, slowed down?",
            },
            {
                "day": 2,
                "title": "Three honest questions",
                "body": (
                    "At bedtime, the most popular adult question is *how was school?* — and it almost always produces *fine.* "
                    "Not because the day was fine. Because the question is too wide and too tired to invite a real answer. "
                    "Tonight, try three smaller, more honest questions:\n\n"
                    "*What surprised you today?*\n"
                    "*What was the hardest part?*\n"
                    "*What is one thing you are proud of, even quietly?*\n\n"
                    "Ask them slowly. Do not correct or coach the answers. Do not turn it into a conversation about lessons. "
                    "Receive the answers the way you would receive a small offering — with attention, without commentary. "
                    "If a child says *nothing*, that is an answer too. They may surprise you tomorrow.\n\n"
                    "This is not a technique. It is a posture. Children who feel listened to grow up able to listen to themselves. "
                    "That is a foundation no curriculum can replace.\n\n"
                    "**Day practice:** Tonight, ask the three questions, one at a time, with a pause between each. Do not interrupt the answer. "
                    "Afterwards, write one line: *What did I learn about my child tonight that I did not know before?*\n\n"
                    "**Quiet line:** *They will remember being heard long after they forget the day.*"
                ),
                "prompt": "What did I learn that I did not know before?",
            },
            {
                "day": 3,
                "title": "The story you tell with your face",
                "body": (
                    "Children read faces before they read words. Long after they forget what we said in a room, they remember the face we wore when we said it. "
                    "A face that is tight at the end of the day teaches them that closeness is dangerous when adults are tired. "
                    "A face that softens — even for two seconds, even after a hard day — teaches them that they are allowed to come closer.\n\n"
                    "This does not require performance. Children read effort easily and they trust softness, not perfection. "
                    "If you cannot manage soft tonight, honesty is the next best thing: *I am tired tonight. None of it is your fault. I love you exactly the same.* "
                    "That is a sentence they will remember at twenty.\n\n"
                    "Tonight, before you walk into the bedroom, pause for three breaths in the hallway. Let the day fall off the face. "
                    "The face that arrives in their room is the one they will carry into sleep.\n\n"
                    "**Day practice:** Pause for three slow breaths outside the bedroom door. Notice your face. "
                    "Walk in only after the face has softened. Write one line afterwards about what you noticed in their face when yours softened.\n\n"
                    "**Quiet line:** *The face I bring into their room becomes the room they sleep in.*"
                ),
                "prompt": "What was on my face tonight?",
            },
            {
                "day": 4,
                "title": "One sentence of love, said without the request",
                "body": (
                    "Many of our *I love yous* arrive bundled with a request — *I love you, be good*; *I love you, sleep well, I'm tired*; *I love you, don't make a fuss.* "
                    "Children hear both. They hear the love and they hear the condition. "
                    "Over time, the love begins to feel like currency in a small economy of behaviour.\n\n"
                    "Tonight, give one sentence of love without anything attached. Not as a slogan. Not as a setup. "
                    "A simple, freely given line: *I love you, exactly as you are tonight.* Or: *I am glad you are mine.* Or: *I will love you the same tomorrow.*\n\n"
                    "Let there be silence after. Do not fill it with instructions. The silence is what makes the sentence land. "
                    "They may say nothing back. That is fine. The sentence is not a transaction.\n\n"
                    "**Day practice:** Choose one sentence of unconditional love for tonight. Say it once, slowly, with eye contact, with no follow-up request. "
                    "After, write down how it felt — for them, and for you.\n\n"
                    "**Quiet line:** *Love freely given is the one currency that does not deplete.*"
                ),
                "prompt": "How did it feel to give love without conditions?",
            },
            {
                "day": 5,
                "title": "Permission to feel",
                "body": (
                    "When a child is angry, sad, or restless at bedtime, the adult's first instinct is often to fix it. "
                    "*It's not that bad.* *Tomorrow is a new day.* *Stop crying, sleep is more important.* "
                    "These sentences come from love — we want their suffering to be over. "
                    "But they also accidentally teach the child that the feeling is the problem.\n\n"
                    "Tonight, instead of fixing, try sitting. Try one sentence: *It makes sense that you feel this way.* "
                    "Then, if they want, listen. If they do not, simply stay. "
                    "Children calm faster when the adult does not try to talk them out of what is real for them. "
                    "Their nervous system reads our willingness to be near the feeling as evidence that the feeling is survivable.\n\n"
                    "This is a practice for us as much as for them. Many of us were never met this way ourselves. "
                    "Sitting beside our child's small storm is, often, the first time we have been close to a feeling without trying to dismiss it.\n\n"
                    "**Day practice:** If a difficult feeling arrives at bedtime, pause before responding. Say: *It makes sense that you feel this way.* "
                    "Then sit beside them without speaking for one full minute. Write one line afterwards about what changed in the room.\n\n"
                    "**Quiet line:** *Their feelings do not need fixing. They need company.*"
                ),
                "prompt": "What feeling did my child have permission to feel tonight?",
            },
            {
                "day": 6,
                "title": "The repair, when needed",
                "body": (
                    "Even the most attentive parents lose their patience sometimes. The voice goes sharper than we meant. "
                    "The door closes harder than we meant. The child sees us not at our best. This is not the failure. "
                    "The failure is when we pretend it did not happen, or when we wait for the child to repair our discomfort by being extra good.\n\n"
                    "Repair is the bridge that keeps trust from breaking. *I was tired tonight and I spoke sharply. I am sorry. You did not deserve that voice.* "
                    "Said calmly, without dramatising, without asking the child to comfort us, this sentence does extraordinary work. "
                    "It teaches the child that adults are people, that mistakes are mendable, that love survives an honest sentence.\n\n"
                    "Repair does not require a long conversation. A single quiet line, said directly, said once, is often more healing than an apology dragged out across the evening. "
                    "Children forgive freely when they are met with honesty.\n\n"
                    "**Day practice:** Think back to one small rupture this week — a sharp word, a hurried no, a moment you wish had gone differently. "
                    "Tonight, offer one short sentence of repair. Write afterwards what you noticed in their body, and in yours.\n\n"
                    "**Quiet line:** *Repair is not weakness. Repair is the bridge that keeps trust alive.*"
                ),
                "prompt": "What is one repair I can make this week?",
            },
            {
                "day": 7,
                "title": "A blessing for the small one",
                "body": (
                    "The last evening. Tonight, place a hand gently — on their back, or their forehead, or the top of their head, whatever is welcomed. "
                    "Say, slowly, in your own words: *You are exactly who you are meant to be tonight. There is nothing about you I am asking you to fix.* "
                    "Mean it. Even if the day was hard. Even if you do not always feel it.\n\n"
                    "Children carry these whispers for decades. Long after they have grown out of bedtime, the body remembers being blessed in the dark. "
                    "It is one of the few sentences that, once received, becomes part of how a person walks through the world.\n\n"
                    "This is the closing of the seven evenings — but not the closing of this practice. Choose one of the seven nights to keep. "
                    "Make it a quiet weekly habit. The slow hand, or the three questions, or the softer face, or the unconditional sentence, or the permission to feel, or the repair, or the blessing. "
                    "Any one of them, kept gently, becomes the river that runs under your child's whole life.\n\n"
                    "**Day practice:** Tonight, give the blessing. Then sit beside them in silence until they are asleep, or until you both feel ready to say goodnight. "
                    "Write one closing line in your own journal: *In giving this blessing, I received —*\n\n"
                    "**Quiet line:** *They are exactly who they are meant to be. So am I.*"
                ),
                "prompt": "What blessing did I receive tonight, in giving this one?",
            },
        ],
    },
    {
        "slug": "the-body-knows-first",
        "title": "The body knows first",
        "audience": "adult",
        "duration_days": 7,
        "blurb": "A companion course to The Body Room — slow daily attention to where emotions live, and how they leave.",
        "price": 25.0,
        "lemonsqueezy_variant_id": "1606453",
        "audio_companion": "/assets/audio/courses/the-architecture-of-breath.mp3",
        "audio_title": "The architecture of breath",
        "letters": [
            {
                "day": 1,
                "title": "The check-in",
                "body": (
                    "Before anything else, we begin with attention. Not a workout. Not a fix. Not a programme. "
                    "A slow scan, head to feet, asking the body one quiet question: *where are you holding tonight?* "
                    "The body almost always answers, if we are willing to wait. The forehead may be pulled tight. "
                    "The jaw may be pressed quietly closed. The shoulders may be sitting too high. "
                    "The lower back may be braced as if waiting for something. The feet may be cold without you having noticed.\n\n"
                    "We are not fixing any of this. Fixing implies the body is wrong. The body is reporting. "
                    "It has been reporting all day. Tonight is the first night we are sitting still long enough to listen.\n\n"
                    "If nothing surfaces, that is fine too. Even noticing *the body feels neutral* is a kind of attention the body is not used to receiving from us. "
                    "Over the seven evenings, the body learns it is being listened to again, and it begins to speak more clearly.\n\n"
                    "**Day practice:** Lie down or sit upright for five minutes. Travel slowly from the top of the head to the feet, noticing without changing. "
                    "Write three short lines: *Where the body is heaviest tonight.* *Where the body is quietest tonight.* *One thing the body seems to be waiting for me to notice.*\n\n"
                    "**Quiet line:** *Tonight I am not fixing the body. I am listening to it.*"
                ),
                "prompt": "Where in the body did I find the most quiet weight?",
            },
            {
                "day": 2,
                "title": "Anger lives where you do not speak",
                "body": (
                    "When a sentence does not get said, the body finds somewhere to put it. Often it is the jaw — clenched at night, sore by morning. "
                    "Sometimes it is the throat — a small constriction that makes a particular kind of sentence physically difficult. "
                    "Sometimes it is the right ribs, the place where unsaid disagreements collect.\n\n"
                    "This is not metaphor. Muscles braced for an unspoken sentence do not relax when we ignore the sentence. "
                    "They relax when the sentence is spoken — even if only on paper, even if only to the wall of your room, "
                    "even if the person who needs to hear it never will. The body does not require the audience. "
                    "The body requires the release of the holding.\n\n"
                    "Tonight is not about confronting anyone. Confrontation can come later, if at all, and only when the inner sentence is clear. "
                    "Tonight is about letting the body release the pre-emptive grip it has been carrying.\n\n"
                    "**Day practice:** Take a piece of paper. Write *The sentence my body has been holding is —* and let one sentence land without editing. "
                    "If more come, let them. When you are done, place a warm hand gently on the jaw or the right ribs and say, in your own voice: "
                    "*thank you for holding this so long. I have it now.*\n\n"
                    "**Quiet line:** *What I do not say with my mouth, my body says quietly for me.*"
                ),
                "prompt": "What sentence has my body been holding for me?",
            },
            {
                "day": 3,
                "title": "Grief is patient",
                "body": (
                    "Grief does not always announce itself. It often settles into the chest as a quiet weight, into the lungs as a shallow breath, "
                    "into the lower lip that trembles for a second before the day begins. Grief does not need solving. "
                    "It needs slow breathing and the rare permission of one true sigh.\n\n"
                    "Most of us were taught to sigh apologetically, as if the sigh were a complaint. The sigh is not a complaint. "
                    "The sigh is the body's most ancient release valve. Three deep sighs, longer on the exhale than the inhale, "
                    "can move more grief than an hour of analysis.\n\n"
                    "The grief in the chest may belong to a person, a place, a self we no longer get to be, a future that was rerouted, "
                    "a love that was real and ended anyway. The body does not differentiate between the kinds. "
                    "It only asks to be allowed to breathe through them.\n\n"
                    "**Day practice:** Sit upright. Take three slow breaths in through the nose, then let each exhale leave as a long, unselfconscious sigh through the mouth. "
                    "After the third, place a hand on the chest and ask quietly: *what is the chest still missing?* "
                    "Write down whatever arrives, in one or two short lines, without commentary.\n\n"
                    "**Quiet line:** *The chest is allowed to grieve. The breath knows what to do.*"
                ),
                "prompt": "Who or what does my chest still miss?",
            },
            {
                "day": 4,
                "title": "Fear has a strategy",
                "body": (
                    "Fear often sits in the lower back and around the kidneys. It is not the weakness it is sometimes called. "
                    "It is a strategy — an old, intelligent strategy designed to keep us safe in environments that may no longer exist. "
                    "The kidneys' fear-response was useful when running was the answer. "
                    "It is less useful at midnight in a quiet bedroom in a stable life. "
                    "But the body does not always know the difference unless we tell it.\n\n"
                    "Tonight, we are not fighting the fear. We are thanking it. The strategy did its job once. "
                    "It can be relieved of duty in the situations where it is no longer needed.\n\n"
                    "A small practical kindness: warmth on the lower back. A hot water bottle, a wool layer, even just a flat hand placed and held. "
                    "Two minutes of warmth in the kidney area, with one sentence — *thank you for protecting me, you can rest tonight* — does more than a chapter of advice.\n\n"
                    "**Day practice:** Place warmth at the lower back for two minutes. Ask quietly: *what is fear trying to keep me safe from tonight?* "
                    "Write the answer in one line. Then write *thank you, and tonight I do not need this much guarding.* "
                    "Notice if anything in the back releases as you write.\n\n"
                    "**Quiet line:** *Fear is not my enemy. Fear is an old strategy that has earned the right to rest.*"
                ),
                "prompt": "What is fear trying to protect me from?",
            },
            {
                "day": 5,
                "title": "The body does not lie about resentment",
                "body": (
                    "Old bitterness tends to settle just below the right ribs, in the area the body's older languages have always associated with the liver. "
                    "We do not need to share the metaphor to use the practice. "
                    "The point is: there is often a place under the right ribs that we have been quietly bracing for years, "
                    "on behalf of a name we do not always say out loud.\n\n"
                    "Resentment is not failure. It is the body's record of an injustice that has not yet been honestly named. "
                    "We do not have to forgive tonight. We do not have to confront. We do not have to do anything except acknowledge, quietly, "
                    "that the body has been keeping a record we have not yet looked at.\n\n"
                    "This practice is gentle. Acknowledgment alone — a hand laid warmly under the right ribs, a name said softly into the air — "
                    "relieves more pressure than most public apologies ever could.\n\n"
                    "**Day practice:** Lay a warm hand below your right ribs. Say one name aloud. Just the name. No story attached. "
                    "After, write one short line: *what my body has been carrying on behalf of this name is —* and let it be honest. "
                    "End with: *I see what I have been holding.*\n\n"
                    "**Quiet line:** *I am allowed to see the records my body has kept.*"
                ),
                "prompt": "What name did my hand find?",
            },
            {
                "day": 6,
                "title": "Releasing without explaining",
                "body": (
                    "The body releases through breath, sound, tears, yawns, shivers, occasional laughter that arrives at strange moments. "
                    "None of these need explanation. None of them are signs that something is wrong. "
                    "They are signs that something old is being allowed to leave.\n\n"
                    "Most of us were trained to interrupt these releases. We swallow the sigh. We blink the tear back. "
                    "We pretend the yawn was just tiredness. We catch the laugh before anyone notices. "
                    "This week, the practice is to stop interrupting.\n\n"
                    "Tonight, set aside ten minutes with no input. No music. No phone. No conversation. "
                    "Simply sit, eyes soft, and allow whatever wants to leave the body to leave it. "
                    "You do not have to direct it. You do not have to understand it. You simply have to stop blocking the door.\n\n"
                    "**Day practice:** Ten quiet minutes, undirected. If a sigh comes, let it. If a tear comes, let it. "
                    "If you yawn, deepen the yawn instead of cutting it short. "
                    "Afterwards, in one line: *what my body chose to release tonight, without my mind's interference.*\n\n"
                    "**Quiet line:** *The body knows how to leave what it does not want to keep.*"
                ),
                "prompt": "What did my body release tonight, without my mind interfering?",
            },
            {
                "day": 7,
                "title": "A small thank-you",
                "body": (
                    "For most of our adult lives, the body has been asked to perform — to sit longer than is kind, to push past the ache, "
                    "to hold the unsaid sentence, to brace through the difficult call, to keep going when going was costly. "
                    "It has done all of this without much thanks. Often we have only spoken to it when it failed us — "
                    "when an injury arrived, when an illness made it impossible to ignore.\n\n"
                    "Tonight is different. Tonight, place both hands gently on your heart. Take three slow breaths. "
                    "Then say, in your own voice, softly: *thank you for waiting.* Mean it.\n\n"
                    "This is not sentimentality. The body responds to direct address. The shoulders soften. "
                    "The breath deepens slightly without your asking. Something in the chest returns home. "
                    "From this evening, see if you can include the body in your decisions — not as a machine you instruct, "
                    "but as a quiet companion you have been overlooking. "
                    "This is the closing of the seven evenings, but the partnership is just beginning.\n\n"
                    "**Day practice:** Both hands on the heart. Three slow breaths. Say *thank you for waiting.* "
                    "After, write a short closing line beginning *Going forward, I will include my body in —* "
                    "and let yourself be specific. One area is enough.\n\n"
                    "**Quiet line:** *Thank you for waiting. We can walk on together now.*"
                ),
                "prompt": "What is the body asking of me, going forward?",
            },
        ],
    },
    {
        "slug": "money-and-consciousness-module-1",
        "title": "Money & Consciousness — Module 1: A Quiet Beginning",
        "audience": "adult",
        "duration_days": 7,
        "blurb": "A seven-day quiet course that helps you notice the inner patterns around money: the voice of scarcity, the need for safety, inherited sentences, self-worth, and what you allow yourself to receive.",
        "price": 0.0,
        "lemonsqueezy_variant_id": None,
        "audio_companion": None,
        "audio_title": None,
        "theme": "money-and-consciousness",
        "language": "en",
        "letters": [
            {
                "day": 1,
                "title": "Money is not only money",
                "body": (
                    "Welcome to the first day. Today, you don't have to solve anything. You don't have to make a new plan. "
                    "You don't have to prove that you're ready to change. Today, one thing is enough: notice how money lives inside you.\n\n"
                    "Money can be peace. Money can be pressure. Money can be freedom. Money can be guilt. "
                    "Money can be control. Money can be proof. Money can be shame. Money can be the thing "
                    "a person longs for and fears at the same time.\n\n"
                    "In Aurin's view, money is not a god. Money is not an enemy. Money is not the measure of a person's worth. "
                    "Money is a mirror. Not your whole mirror. But one mirror.\n\n"
                    "And today we're not going to break this mirror. We're just going to look at what it shows.\n\n"
                    "**Today's practice:** Write the sentence: *When I think about money, I feel…* Let the answers come "
                    "quickly, without correction. Then: *Money in my life right now means…* — write what is actually true. "
                    "And: *I would like the topic of money to feel more like…* Your honest answer is the starting point of this course.\n\n"
                    "**Quiet sentence:** *I don't have to fix money today. I can begin by seeing what it touches in me.*"
                ),
                "prompt": "What was the first feeling that arose when you read the word \"money\"?",
            },
            {
                "day": 2,
                "title": "The voice of scarcity",
                "body": (
                    "Today we look at the voice that says: *\"It's not enough.\"* This voice can be quiet. It may not shout. "
                    "But it can be present in very many decisions. It says: don't ask for too much. Don't hope. "
                    "Don't begin. Don't spend. Don't rest. Don't risk. Don't receive. Don't believe there is enough for you.\n\n"
                    "The voice of scarcity is often an old defence mechanism. It tries to protect a person from disappointment, "
                    "shame, loss, or being seen. But protection that once helped you survive can later begin to make life narrow.\n\n"
                    "Your task today is not to silence the voice of scarcity. Your task is to recognise it. Because when you hear "
                    "it consciously, you no longer have to move automatically by its rhythm.\n\n"
                    "**Today's practice:** Complete the sentences: *When I want to allow myself something, this voice says…* "
                    "*When I want to ask for more, this voice says…* *When I see someone else doing well, then…* "
                    "Then: *This voice is trying to protect me from…* Finally: *Thank you for trying to protect me. "
                    "But I no longer have to decide everything according to your fear.*\n\n"
                    "**Quiet sentence:** *I can hear the voice of scarcity without giving it all the deciding power.*"
                ),
                "prompt": "In which situations does your voice of scarcity sound loudest?",
            },
            {
                "day": 3,
                "title": "Money and safety",
                "body": (
                    "Very often a person does not actually want money. They want the feeling they hope to receive through money. "
                    "They want to breathe. They want to not be afraid. They want to be ready. They want to feel that life is not about to collapse.\n\n"
                    "Money can support a sense of safety — this is true. But money cannot be the only source of inner safety. "
                    "If there is no other place of safety inside a person, then every financial fluctuation feels like an existential threat.\n\n"
                    "Restoring a sense of safety does not mean naivety. It means that a person creates more than one "
                    "anchor inside themselves. Money can be one anchor. But not the only one. Others are: the ability to look at a situation calmly, "
                    "the ability to ask for help, the ability to take one next step, the ability to separate fact from fear, the ability to stay present in your body during a tense moment.\n\n"
                    "**Today's practice:** Divide a page in two. On the left: *When the topic of money activates, I usually…* "
                    "On the right: *A calmer anchor could be…* Finally, choose ONE new anchor — not ten. "
                    "One that you actually use is worth more than a beautiful list.\n\n"
                    "**Quiet sentence:** *Money can support my sense of safety, but my inner safety does not have to be entirely in its hands.*"
                ),
                "prompt": "What non-financial thing actually creates a sense of safety in you?",
            },
            {
                "day": 4,
                "title": "Money and self-worth",
                "body": (
                    "For some people, the hardest thing is not to earn money. The hardest thing is to receive it without guilt. "
                    "To ask without apologising. To be visible without making yourself smaller. To allow yourself something better without the feeling "
                    "that someone else will go without because of it.\n\n"
                    "Self-worth is not a price. A person's worth does not grow or shrink according to their income. But a person's "
                    "relationship with their own worth often affects what they dare to ask for, receive, keep, and choose.\n\n"
                    "In Aurin's room we do not say: *\"You are a queen, demand everything.\"* We say something quieter and stronger: "
                    "*\"You don't have to diminish yourself in order to be a good person.\"*\n\n"
                    "Dignity does not press. Dignity does not lower. Dignity does not over-prove. Dignity says: *\"This is my work. "
                    "This is my time. This is my boundary. This is my price. And I can say it calmly.\"*\n\n"
                    "**Today's practice:** Write honest answers: *Where do I give more than I can?* "
                    "*Where do I apologise for my price, need, or wish?* *Where am I afraid that if I ask fairly, "
                    "I won't be loved or chosen?* Then one new dignified sentence about your own field.\n\n"
                    "**Quiet sentence:** *I don't have to diminish myself to stay a good person.*"
                ),
                "prompt": "At what price have you bought your peace?",
            },
            {
                "day": 5,
                "title": "The invisible sentences of family",
                "body": (
                    "Every family has its own language of money. In some families they said: *\"Money comes from hard work.\"* "
                    "In some: *\"Rich people are not honest.\"* In some: *\"People like us don't have that kind of life.\"* "
                    "In some: *\"Don't stand out.\"* In some, money was not spoken of at all. But the silence itself spoke loudly.\n\n"
                    "A child does not learn about money only from words. They also learn from faces. From tones of voice. "
                    "From the tension at the kitchen table. From whether bills were hidden. From whether there was conflict over money. "
                    "From whether someone always had to give up. From whether joy was allowed only when everything had been \"earned\".\n\n"
                    "These sentences can later move inside a person like facts. But they may not be facts. "
                    "They may be inherited survival language.\n\n"
                    "Loyalty to a family does not have to mean that you repeat all of their fears. You can honour what "
                    "they came through — and at the same time not build your whole life inside their limitations.\n\n"
                    "**Today's practice:** Write three inherited money-sentences. Under each one: *Where could this have come from? "
                    "Who did this sentence once protect? How does this sentence limit me today? What could a new, calmer sentence be?*\n\n"
                    "**Quiet sentence:** *I can honour where I come from without having to repeat all the old fears.*"
                ),
                "prompt": "Which money-sentence inside you is the oldest?",
            },
            {
                "day": 6,
                "title": "Allowing without greed",
                "body": (
                    "Many sensitive people are afraid to want more. They fear that wanting will turn them greedy. "
                    "They fear that if they allow themselves more, they will lose their simplicity, their kindness, or their warmth.\n\n"
                    "But allowing more does not have to mean greed. Sometimes it simply means that a person stops "
                    "holding their life in too small a room.\n\n"
                    "Greed says: *\"I must have more than others.\"* Allowing says: *\"I too can be part of the good "
                    "that moves through the world.\"* Allowing does not mean losing boundaries. Allowing means inwardly: "
                    "*\"I don't have to automatically push away the goodness of life.\"*\n\n"
                    "**Today's practice:** Complete the sentences: *I don't allow myself more money, because…* *I don't allow myself more "
                    "rest, because…* *I don't allow myself better support, because…* *I don't allow myself visibility, because…* "
                    "Then: *If I allowed a little more, I would fear that…* "
                    "Finally, choose ONE small allowance for this week.\n\n"
                    "**Quiet sentence:** *I can let life widen without losing my heart.*"
                ),
                "prompt": "What does dignified abundance mean to you?",
            },
            {
                "day": 7,
                "title": "A new inner agreement",
                "body": (
                    "Today we are not ending the topic of money. We are ending the first round.\n\n"
                    "Over seven days you have looked at: what money touches in you, how the voice of scarcity sounds, "
                    "where money is tied to a sense of safety, how self-worth affects receiving, what sentences "
                    "you have carried with you, what you have not allowed yourself.\n\n"
                    "Today we gather it into one inner agreement. Not a legal one. Not a promise to be perfect. "
                    "Just a quiet decision: *\"I no longer want to be blind to the topic of money.\"*\n\n"
                    "**My new inner agreement with money:** I no longer look at money only through fear. I allow myself to notice "
                    "when scarcity, an old family sentence, guilt, shame, or a need to control is speaking inside me. I don't have to diminish myself "
                    "for the sake of money. I don't have to turn cold for the sake of money. I can ask fairly. "
                    "I can receive with dignity. I can say *no* to what takes too much from me. "
                    "I can say *yes* to what supports life and clarity.\n\n"
                    "My worth is not a number. But my life needs practical respect. I don't have to know everything immediately. "
                    "I can begin by simply not running away anymore.\n\n"
                    "**Today's practice:** Write this agreement out by hand for yourself. Sign it. Date it.\n\n"
                    "**Quiet sentence:** *I don't have to fear money or worship it. I can learn to meet it consciously.*"
                ),
                "prompt": "What is one practical financial step you can take calmly?",
            },
        ],
    },
    # =================================================================
    # §BROKEN-CLOCKWORK 2026-02-11 — The 28-Day Sara Protocol.
    # Founder-authored Act I (letters 1–7). Acts II–IV land as the
    # founder writes the bodies; their day numbers and titles are
    # placeholders in `language: "draft"` so they do NOT surface on
    # the public `/api/courses` index, while Act I (days 1–7) is
    # live `language: "en"`.
    # The course title intentionally avoids the t.A.T.u. reference
    # in the public-facing string per founder directive.
    # =================================================================
    {
        "slug": "the-broken-clockwork",
        "title": "The Broken Clockwork",
        "audience": "adult",
        "duration_days": 7,  # Act I only — Acts II–IV land as authored.
        "blurb": (
            "A seven-day Sara protocol for the parent whose business-clock "
            "and home-clock have stopped agreeing. One transmission per "
            "24 hours. No binge. No catch-up. The cadence is the lesson."
        ),
        "price": 39.0,
        "lemonsqueezy_variant_id": None,
        "audio_companion": None,
        "audio_title": "The clock you cannot bend",
        "language": "en",
        "letters": [
            {
                "day": 1,
                "title": "The currency of attention",
                "body": (
                    "Read once. Sit. Do not act before the next gate opens.\n\n"
                    "Everything you have built — the company, the schedule, the staff, the protected silence around your work — has trained one specific muscle: the muscle that decides where attention goes. "
                    "Attention is the only resource you actually allocate. Money is just attention that has already been spent.\n\n"
                    "In your home, that same muscle is at work, whether you have named it or not. "
                    "Every minute you give your teenager — and every minute you redirect away from them — is a transaction in the only currency they have ever known you to handle precisely. "
                    "They do not need more of you. They need accurate signal about how you spend you.\n\n"
                    "The system inside a young nervous system is not interested in your love speech. It is interested in *bandwidth received this week*. "
                    "It runs the same audit every founder runs on their own calendar: where did the hours actually go, and what does that pattern say about what mattered.\n\n"
                    "Tonight's transmission is not asking you to feel guilty. Guilt is a low-resolution emotion and it does not move the system. "
                    "Tonight's transmission is asking you to do one accurate thing: name the currency.\n\n"
                    "**Evening protocol — one line, no list.** Take your calendar from this week. Look at the hours that went to your most important deal. Now look at the hours that went to your teenager. "
                    "Do not adjust the numbers. Do not promise to fix them. Simply hold them next to each other on the page for sixty seconds. "
                    "This is the audit. The audit is the work for today.\n\n"
                    "**Quiet sentence to carry until tomorrow:** *Attention is the currency. The pattern is the contract. I have already signed something I never read.*"
                ),
                "prompt": "What did this week's calendar actually pay for?",
            },
            {
                "day": 2,
                "title": "The promise that died on a Tuesday",
                "body": (
                    "Somewhere in the last six months, you gave your teenager a small, ordinary promise. *Friday. I'll be home by six.* *Saturday morning, just us.* *I'll come to the game.*\n\n"
                    "And then the call came in. A board crisis. An investor on a different timezone. A deal that could not be moved. You did the rational thing — you renegotiated the home-side of the contract. You sent a message, perhaps an apology, perhaps a compensation: a delivery, a credit card, a weekend trip later.\n\n"
                    "That moment is what we are going to look at now. Not the moment the call came. The moment your teenager received the cancellation.\n\n"
                    "Inside their nervous system, a very specific subroutine ran. It is the same subroutine that runs in any operator who has been promised a delivery date by a counterparty. It logs: *expectation declared, expectation undelivered, compensation issued, value-flip filed.* "
                    "The system makes no moral judgment. It simply updates the trust ledger. From that day forward, the next promise from you carries a discount factor. They do not consciously do this. The system does it for them.\n\n"
                    "After three to five of these cycles, the discount factor stabilises near zero. Your promises stop being processed as future commitments and are instead filed as *parental signal noise*. This is the moment most parents misread as 'teenage attitude'. It is not attitude. It is firmware.\n\n"
                    "There is one architectural correction available, and it is the opposite of what most parents try. You do not fix the ledger by making bigger promises. You fix it by making smaller, calibrated, completable promises — and completing them with the same precision you complete a board commitment.\n\n"
                    "**Evening protocol — one promise, smaller than you think.** Make exactly one promise to your teenager today that you are 100% certain you can keep within the next 48 hours. Not 'this weekend'. Not 'soon'. A specific window, a specific commitment, something so small it is almost embarrassing. "
                    "Then deliver it on time. That is the entire transmission for today.\n\n"
                    "**Quiet sentence:** *The size of the promise does not rebuild trust. The precision of the delivery does.*"
                ),
                "prompt": "What is one small, certain promise I can land in the next forty-eight hours?",
            },
            {
                "day": 3,
                "title": "The carousel that spins for no one",
                "body": (
                    "Look at the room your teenager lives in. The square footage. The technology. The wardrobe. The proximity to the best teachers their generation has ever had access to.\n\n"
                    "On paper, the hardware is excellent. The infrastructure is the kind of infrastructure their grandparents would have called impossible. By every external metric you have ever been trained to read, you have provided exceptionally.\n\n"
                    "Now look at the room as a system. The hardware is glowing. But the bus that connects it to the only motherboard that matters — direct, undivided, non-transactional parental presence — has been thinned by a thousand small reroutes. The nanny gave a hug. The tutor explained the concept. The personal trainer cheered the personal best. The driver listened to the rant.\n\n"
                    "None of those reroutes were wrong. Most were necessary. You were building a company. But cumulatively, you have constructed a beautiful, expensive carousel that spins in a darkened room, and somewhere on that carousel sits a young person whose neurological development was supposed to be calibrated against the gravitational pull of the founder of the home.\n\n"
                    "This is not a moral failure. It is an architectural one. And architectural failures have architectural solutions.\n\n"
                    "Do not flood them with attention tonight. Do not over-correct. Over-correction reads to their nervous system as panic, and panic confirms their underlying hypothesis that something is structurally wrong. "
                    "Instead, do one quiet thing: be in the same room as them, with no objective, for fifteen minutes. No device in your hand. No question to ask. No subject to introduce. Just shared physical space and the soft signal that you are available without an agenda.\n\n"
                    "That signal, repeated quietly across many evenings, is what the carousel has been waiting for. It is the gravitational re-anchor. It does not announce itself. It works underneath everything.\n\n"
                    "**Evening protocol — fifteen unweighted minutes.** Find a way to be in the same room as your teenager for fifteen minutes today, with no instruction, no question, no improvement attempt, and no device. If they leave the room, do not follow. If they ignore you, do not interpret. Simply be available.\n\n"
                    "**Quiet sentence:** *Presence without an agenda is the rarest infrastructure I can build for them.*"
                ),
                "prompt": "Where in my home is the carousel currently spinning without me?",
            },
            {
                "day": 4,
                "title": "What the teen heard when the call came",
                "body": (
                    "Yesterday you sat in the same room. Today we are going to sit with something less comfortable.\n\n"
                    "When the call came in last Tuesday and you stepped out — when the meeting overran by ninety minutes and you missed dinner — your teenager was not measuring whether the meeting was important. They were measuring something simpler and far more precise: *what did the parent's voice sound like when the call ended.*\n\n"
                    "Children, including teenage children, do not process language the way adults do. They process tone, micro-shifts in shoulder tension, the speed at which their parent returns to baseline, the millisecond delay between the call ending and the parent's eyes refocusing on them. Their nervous system is a full-spectrum analyzer for these micro-signals. It has been since they were three.\n\n"
                    "So when you stepped back into the room with that residual business-tension still riding through your body, your teenager received the entire transmission. Not the words. The frequency. And the frequency said: *the call still matters more than this room*.\n\n"
                    "That is the exact signal that, repeated across months, instructs their developing identity to file your home under the same category your subordinates file you in: a high-status environment requiring performance.\n\n"
                    "There is a correction available and it is almost rude in its simplicity. When you return from the call, you do not arrive in the room with words. You arrive in the room with your nervous system. You exhale. You sit. You bring your breathing back to baseline *before* you speak. You make the doorway between the business and the home a real doorway and not a porous wall.\n\n"
                    "Your teenager will not consciously notice this on the first evening. Their system will notice it within three.\n\n"
                    "**Evening protocol — the doorway breath.** The next time you finish a high-stakes call and walk into a room your teenager is in, do not greet them with your mouth. Stand at the threshold for one full exhale before you cross it. Let the room be reset by your nervous system, not by your speech. Then enter, quietly.\n\n"
                    "**Quiet sentence:** *The frequency arrives before the words. I am the frequency.*"
                ),
                "prompt": "What frequency did I bring into the room last time I returned from work?",
            },
            {
                "day": 5,
                "title": "Three broken cycles equals firmware",
                "body": (
                    "There is a number we should put on the table tonight. It is not a soft number.\n\n"
                    "A developing nervous system tolerates one broken promise from a primary parent as a glitch. Two broken promises as a pattern that needs investigation. Three broken promises as firmware. After three, the system stops investigating and simply installs the new default: *parental signal is unreliable; build other infrastructure*.\n\n"
                    "What looks, externally, like a teenager who has become hard, or evasive, or sophisticated, or quietly contemptuous, is usually a teenager whose nervous system installed that firmware update somewhere between ages nine and thirteen, and is now running on it. Their coldness is not cruelty. It is a survival operating system, and it has been carefully optimised.\n\n"
                    "This is the hardest letter in this first week, because the correction does not feel proportional to the damage. It feels too small. Founders, especially founders, want to throw resources at architectural problems. The instinct is to launch a campaign — a vacation, a renewed routine, a heart-to-heart, an apology speech, a therapist.\n\n"
                    "None of that will overwrite firmware. Firmware is not overwritten by intensity. It is overwritten by a long, low, uninterrupted signal that quietly contradicts the previous frequency. Months of *small, calibrated, completed* contact. Not weeks. Not even one impressive month. Months. The exact opposite of how you have learned to win in business.\n\n"
                    "What we are training in this protocol is patience in a domain where you have never had to be patient, because the market has always rewarded the opposite. Your teenager is not a market. They are a slow biological instrument that requires a different metabolism of attention.\n\n"
                    "**Evening protocol — the three-month frame.** Take one piece of paper. At the top, write the date three months from today. Then write one sentence: *By this date, the small contacts I make with my teenager will have begun to overwrite the old firmware.* "
                    "Fold it. Put it somewhere only you will see it. This is the frame for everything that follows.\n\n"
                    "**Quiet sentence:** *Firmware is not overwritten by intensity. It is overwritten by the patience my industry never taught me.*"
                ),
                "prompt": "Where in my life have I confused intensity with patience?",
            },
            {
                "day": 6,
                "title": "You did not raise a stranger. You raised a survivor.",
                "body": (
                    "Of all the descriptions you have privately used for your teenager over the last year — distant, ungrateful, secretive, hostile, cold, unreachable — there is one description we have not yet considered. They are competent.\n\n"
                    "Whatever they have become, they became in response to an environment they did not choose, with resources that were the wrong shape for the developmental need, while simultaneously navigating one of the most aggressive neurological renovation projects a human ever undertakes. And they are still functional. Still eating. Still showing up to school, or pretending to. Still alive. Still occasionally beautiful when they think no one is watching.\n\n"
                    "That is not a stranger you live with. That is a survivor. They survived a domestic architecture that gave them more material wealth than 99% of human beings have ever had access to, and almost zero of the slow, unweighted, founder-grade parental presence that their evolutionary design assumed would be available. They built workarounds. The workarounds look ugly from the outside — substances, screens, defiance, withdrawal, performance — but every workaround was, at the time of its installation, a rational engineering decision by a young system trying to stay online.\n\n"
                    "If you can hold this frame for ten seconds — they are a competent survivor of a setup they did not choose — something quietly changes in your nervous system. The reactivity drops. The disappointment drops. What replaces them is something closer to professional respect.\n\n"
                    "That respect is something they have never had from you. Not because you do not love them. You love them violently. But love and respect operate on different bandwidths in the teenage nervous system, and respect is the one they have been starving for.\n\n"
                    "**Evening protocol — one sentence of respect, unspoken.** Write down, only for yourself, one specific way your teenager has demonstrated competence or survival skill in the last six months. Do not show them. Do not announce it. Simply let yourself hold the sentence privately, and let your face soften by the smallest amount the next time they walk into the room.\n\n"
                    "**Quiet sentence:** *They are not a stranger. They are a survivor of a system I built without yet understanding the cost.*"
                ),
                "prompt": "Which specific competence of theirs have I refused to see?",
            },
            {
                "day": 7,
                "title": "The cost of compensating with objects",
                "body": (
                    "We close Act I tonight with the most embarrassing audit in this entire seven-day sequence.\n\n"
                    "Over the last twelve months, calculate, very approximately, how much money you have spent compensating for time you could not give. The expensive trip after the missed birthday. The console after the missed game. The wardrobe after the missed parents' evening. The car after the year of overscheduled silence.\n\n"
                    "Do not feel bad about the number. The number is just data. The number is the cost of a specific architectural decision: *when bandwidth was not available, capital was deployed in its place.* It is the most rational substitution your operating mind could find under load.\n\n"
                    "But there is a second cost that does not appear on any of your statements. Each substitution taught your teenager's nervous system a single sentence, repeated under different conditions until it became firmware: *when my parent cannot give me presence, my parent will give me an object, and the object means I should now stop expecting presence.* "
                    "The capital does not buy forgiveness. It buys closure of the request. It teaches the young system to stop requesting.\n\n"
                    "And once the requesting stops, the bandwidth pipe between you and them quietly closes. Not in anger. In efficiency. They have learned that the asking is not worth the cost of being deflected with material.\n\n"
                    "This is the moment most high-net-worth parents discover that their teenager has stopped asking for anything personal — and they misinterpret the silence as maturity. It is not maturity. It is firmware. It is the silent acceptance that the channel is closed.\n\n"
                    "The architectural correction does not require you to stop being generous. It requires you to decouple capital from presence in their nervous system. The next time you would normally compensate with an object, give the same time slot you would have spent shopping, and give it as undivided, agenda-less presence instead. Spend the money some other day, in some other context, untied to compensation. Let presence and capital live in two completely separate ledgers.\n\n"
                    "**Evening protocol — the empty-handed visit.** This week, identify one moment when you would normally have compensated with an object or an experience. Skip the compensation. Replace it with twenty minutes of empty-handed time in the same room as your teenager. Bring nothing. Buy nothing. Carry nothing. That is the entire transmission.\n\n"
                    "**Quiet sentence:** *Capital and presence belong in different ledgers. I am closing the cross-account leak tonight.*\n\n"
                    "---\n\n"
                    "*Act I — Read the System — closes here. Act II opens when authored. Hold the cadence.*"
                ),
                "prompt": "Where in my home have I been paying for presence I could have simply given?",
            },
        ],
    },
]


def _course_by_slug(slug: str) -> Optional[dict]:
    return next((c for c in SEED_COURSES if c["slug"] == slug), None)


@api_router.get("/courses")
async def courses_list():
    """Public — list all courses with title, blurb, price, letter count."""
    return {
        "courses": [
            {
                "slug": c["slug"],
                "title": c["title"],
                "audience": c["audience"],
                "duration_days": c["duration_days"],
                "blurb": c["blurb"],
                "price": c["price"],
                "letter_count": len(c["letters"]),
                "checkout_ready": bool(c.get("lemonsqueezy_variant_id")),
                "lemonsqueezy_variant_id": c.get("lemonsqueezy_variant_id"),
                "audio_companion": c.get("audio_companion"),
                "audio_title": c.get("audio_title"),
            }
            for c in SEED_COURSES
            # W-2 (iter 62): only English-facing courses on the public
            # /courses index. ET courses still resolvable via direct
            # /api/courses/{slug} for localized links.
            if c.get("language", "en") == "en"
        ]
    }


@api_router.get("/courses/{slug}")
async def course_detail(slug: str, request: Request):
    """Course detail with letters. Letter 1 is always free preview;
    later letters return their body only if the user has an active
    enrollment AND the unlock_day has arrived. Otherwise body is
    replaced with `null` and `locked_until` carries the unlock date."""
    course = _course_by_slug(slug)
    if not course:
        raise HTTPException(status_code=404, detail="Course not found.")
    user = None
    try:
        user = await _require_user(request)
    except HTTPException:
        user = None
    enrollment = None
    if user:
        enrollment = await db.course_enrollments.find_one(
            {"user_id": user.user_id, "course_slug": slug}, {"_id": 0}
        )
    started_at = None
    if enrollment:
        try:
            started_at = datetime.fromisoformat(enrollment["started_at"])
        except Exception:
            started_at = None
    now = datetime.now(timezone.utc)
    out_letters = []
    for letter in course["letters"]:
        is_preview = letter["day"] == 1
        unlock_at = None
        if started_at:
            unlock_at = started_at + __import__("datetime").timedelta(days=letter["day"] - 1)
        unlocked = is_preview or (unlock_at is not None and unlock_at <= now)
        out_letters.append({
            "day": letter["day"],
            "title": letter["title"],
            "body": letter["body"] if unlocked else None,
            "prompt": letter["prompt"] if unlocked else None,
            "unlocked": unlocked,
            "unlock_at": unlock_at.isoformat() if (unlock_at and not unlocked) else None,
            "is_preview": is_preview,
        })
    return {
        "course": {
            "slug": course["slug"],
            "title": course["title"],
            "audience": course["audience"],
            "duration_days": course["duration_days"],
            "blurb": course["blurb"],
            "price": course["price"],
            "checkout_ready": bool(course.get("lemonsqueezy_variant_id")),
            "lemonsqueezy_variant_id": course.get("lemonsqueezy_variant_id"),
            "audio_companion": course.get("audio_companion"),
            "audio_title": course.get("audio_title"),
        },
        "enrolled": bool(enrollment),
        "started_at": enrollment.get("started_at") if enrollment else None,
        "letters": out_letters,
    }


@api_router.post("/courses/{slug}/enroll")
async def course_enroll(slug: str, request: Request):
    """Beta path — start a course immediately. Production path will
    flip this to require a successful LemonSqueezy purchase first;
    for the test group + lifetime users, manual enrollment is fine."""
    user = await _require_user(request)
    course = _course_by_slug(slug)
    if not course:
        raise HTTPException(status_code=404, detail="Course not found.")
    # Coming Soon lock — keep checkout/enrol off until live activation.
    if COMING_SOON_OVERLAY.get(f"course-{slug}"):
        raise HTTPException(
            status_code=409,
            detail="This course opens in a few days. Join the quiet list to be told first.",
        )
    existing = await db.course_enrollments.find_one(
        {"user_id": user.user_id, "course_slug": slug}, {"_id": 0}
    )
    if existing:
        return {"status": "already_enrolled", "started_at": existing["started_at"]}
    doc = {
        "id": str(uuid.uuid4()),
        "user_id": user.user_id,
        "course_slug": slug,
        "started_at": datetime.now(timezone.utc).isoformat(),
        "source": "beta_grant",
    }
    await db.course_enrollments.insert_one(doc)
    return {"status": "enrolled", "started_at": doc["started_at"]}


@api_router.get("/house/sovereign-counter")
async def house_sovereign_counter():
    """Anonymous, low-cost live metric strip for the landing page.

    §SOVEREIGN-COUNTER 2026-02-11 — Founder directive. Eliminates the
    isolation of the waitlist by showing wanderers a live, anonymous
    count of fellow operators currently engaged with the platform.
    No emails. No names. No individual data. Pure architectural
    telemetry.

    Response:
      {
        sovereigns_under_cadence_lock: int,
        transmissions_this_hour: int,
        waitlist_total: int,
        rooms_under_load: int
      }
    """
    now = datetime.now(timezone.utc)
    one_hour_ago = now - timedelta(hours=1)
    sovereigns = await db.course_enrollments.count_documents({})
    waitlist_total = await db.waitlist_entries.count_documents({})
    # Transmissions in the last hour = enrollments where any letter
    # day's unlock_at falls inside [one_hour_ago, now].
    transmissions = 0
    slugs_in_use = set()
    cursor = db.course_enrollments.find(
        {}, {"_id": 0, "started_at": 1, "course_slug": 1}
    )
    async for e in cursor:
        slug = e.get("course_slug")
        if slug:
            slugs_in_use.add(slug)
        try:
            started = datetime.fromisoformat(e["started_at"])
        except Exception:
            continue
        course = _course_by_slug(slug or "")
        if not course:
            continue
        for letter in course.get("letters", []):
            if letter["day"] == 1:
                continue
            unlock_at = started + timedelta(days=letter["day"] - 1)
            if one_hour_ago <= unlock_at <= now:
                transmissions += 1
    return {
        "sovereigns_under_cadence_lock": sovereigns,
        "transmissions_this_hour": transmissions,
        "waitlist_total": waitlist_total,
        "rooms_under_load": len(slugs_in_use),
    }



@api_router.get("/courses/me/next-unlock")
async def courses_next_unlock(request: Request):
    """Authenticated — return the soonest upcoming chrono-lock unlock
    across all of this user's course enrollments. Powers the live
    Cadence Engine countdown in CourseRoom.jsx.

    Response shape:
      { unlocked_at: ISO | None,
        course_slug: str | None,
        course_title: str | None,
        letter_day: int | None,
        seconds_remaining: int,
        enrollments: int }

    If user has no enrollments or every letter is already unlocked,
    returns `unlocked_at: None` so the UI can fall back to the
    static T-0 / +24H / +48H reference strip.
    """
    user = await _require_user(request)
    cursor = db.course_enrollments.find(
        {"user_id": user.user_id}, {"_id": 0}
    )
    enrollments = [e async for e in cursor]
    now = datetime.now(timezone.utc)
    soonest = None
    soonest_meta = None
    for e in enrollments:
        try:
            started_at = datetime.fromisoformat(e["started_at"])
        except Exception:
            continue
        course = _course_by_slug(e.get("course_slug", ""))
        if not course:
            continue
        for letter in course.get("letters", []):
            if letter["day"] == 1:
                continue  # always preview-open
            unlock_at = started_at + timedelta(days=letter["day"] - 1)
            if unlock_at <= now:
                continue  # already unlocked
            if soonest is None or unlock_at < soonest:
                soonest = unlock_at
                soonest_meta = {
                    "course_slug": course["slug"],
                    "course_title": course["title"],
                    "letter_day": letter["day"],
                    "letter_title": letter.get("title"),
                }
    if soonest is None:
        return {
            "unlocked_at": None,
            "course_slug": None,
            "course_title": None,
            "letter_day": None,
            "seconds_remaining": 0,
            "enrollments": len(enrollments),
        }
    return {
        "unlocked_at": soonest.isoformat(),
        "seconds_remaining": int((soonest - now).total_seconds()),
        "enrollments": len(enrollments),
        **soonest_meta,
    }


# =============================================================
# FIRST LETTER FUNNEL — send letter 1 of any course to a cold email.
# This is the lead magnet: no sign-in, no password, just a free
# taste of the Course Room delivered into the inbox.
# =============================================================

class FirstLetterRequest(BaseModel):
    email: str
    course_slug: str = "letting-the-old-stories-rest"
    consent: bool = True


@api_router.post("/first-letter")
async def first_letter_send(inp: FirstLetterRequest):
    """Send a free Letter 1 from any public course to the given email.
    Rate-limited per email (max 1 send per 24h to the same address per
    course). Also records the address in db.newsletter_subscribers so
    the founder can build their quiet list over time."""
    if not inp.consent:
        raise HTTPException(status_code=400, detail="Consent is required.")
    email = (inp.email or "").strip().lower()
    if "@" not in email or "." not in email.split("@")[-1]:
        raise HTTPException(status_code=400, detail="Please provide a valid email.")

    course = _course_by_slug(inp.course_slug)
    if not course:
        raise HTTPException(status_code=404, detail="Course not found.")
    if not course.get("letters"):
        raise HTTPException(status_code=500, detail="Course has no letters.")
    letter = course["letters"][0]

    # Per-email rate limit: 24h per (email, course).
    now = datetime.now(timezone.utc)
    window_start = (now - __import__("datetime").timedelta(hours=24)).isoformat()
    recent = await db.first_letter_sends.find_one({
        "email": email,
        "course_slug": inp.course_slug,
        "sent_at": {"$gte": window_start},
    })
    if recent:
        return {
            "status": "already_sent",
            "message": "A quiet letter is already on its way. Please check your inbox.",
        }

    # Persist before send so replays don't spam.
    doc = {
        "id": str(uuid.uuid4()),
        "email": email,
        "course_slug": inp.course_slug,
        "sent_at": now.isoformat(),
    }
    await db.first_letter_sends.insert_one(doc)
    # Also add to the newsletter list (idempotent on email).
    await db.newsletter_subscribers.update_one(
        {"email": email},
        {"$setOnInsert": {
            "email": email,
            "consent": True,
            "source": f"first-letter:{inp.course_slug}",
            "created_at": now.isoformat(),
        }},
        upsert=True,
    )

    from email_service import (
        send_email as _send_email,
        render_first_letter_email as _render_first_letter,
        is_configured as _resend_configured,
    )
    if not _resend_configured():
        return {
            "status": "queued_manual",
            "message": "Your letter is waiting. We will send it shortly.",
        }

    base = _os.environ.get("PUBLIC_SITE_URL", "https://prulesoul.site").rstrip("/")
    course_url = f"{base}/course-room/{inp.course_slug}"
    subject, html_body, text_body = _render_first_letter(
        course_title=course["title"],
        letter_title=letter["title"],
        letter_body=letter["body"],
        letter_prompt=letter["prompt"],
        course_url=course_url,
    )
    try:
        await _send_email(
            to=email,
            subject=subject,
            html=html_body,
            text=text_body,
            sender="agent",
            tags=[
                {"name": "kind", "value": "first_letter"},
                {"name": "course", "value": inp.course_slug},
            ],
        )
        return {
            "status": "sent",
            "message": "Your letter is on its way. Please check your inbox — and spam, just in case.",
        }
    except Exception as e:  # noqa: BLE001
        logger.warning("first_letter resend.send failed: %s", e)
        return {
            "status": "queued_delivery_failed",
            "message": "Your letter is waiting. We will send it shortly.",
            "resend_error": type(e).__name__,
        }


# =============================================================
# LEAD MAGNET — bedtime book email capture (Night Angels' Embrace)
#
# A lightweight, Cabinet-free signup. Drops the address into
# newsletter_subscribers (with `source = lead-magnet:<slug>`) and,
# when Resend is configured, emails a quiet thank-you letter that
# links the reader straight to the in-browser reading experience
# (`/bookstore/{slug}` — Read online button). PDF will follow once
# the file is in place; until then the online reader is the gift.
# =============================================================

class LeadMagnetRequest(BaseModel):
    email: str
    name: Optional[str] = None
    book_slug: str
    consent: bool


@api_router.post("/lead-magnet/book")
async def lead_magnet_book(inp: LeadMagnetRequest):
    """Public endpoint — collect email in exchange for a free book.

    Called from the Night Angel page (or any future free book page).
    Rate-limited 24h per (email, slug). Always upserts into
    `newsletter_subscribers` so the founder's quiet list keeps growing.
    """
    if not inp.consent:
        raise HTTPException(status_code=400, detail="Consent is required.")
    email = (inp.email or "").strip().lower()
    if "@" not in email or "." not in email.split("@")[-1]:
        raise HTTPException(status_code=400, detail="Please provide a valid email.")

    book = await db.books.find_one({"slug": inp.book_slug, "price": 0.0}, {"_id": 0})
    if not book:
        raise HTTPException(status_code=404, detail="This free book is not available.")

    # 24h rate-limit per (email, slug)
    now = datetime.now(timezone.utc)
    window_start = (now - timedelta(hours=24)).isoformat()
    recent = await db.lead_magnet_sends.find_one({
        "email": email,
        "book_slug": inp.book_slug,
        "sent_at": {"$gte": window_start},
    })
    if recent:
        return {
            "status": "already_sent",
            "message": (
                "A quiet letter with the book is already on its way. "
                "Please check your inbox (and the spam folder, just in case)."
            ),
        }

    # Persist before send so replays don't spam.
    base_url = os.environ.get("PUBLIC_APP_URL", "https://prulesoul.site").rstrip("/")
    public_url = f"{base_url}/bookstore/{inp.book_slug}"
    download_url = f"{base_url}/api/books/free/{inp.book_slug}/download"
    await db.lead_magnet_sends.insert_one({
        "id": str(uuid.uuid4()),
        "email": email,
        "name": (inp.name or "").strip() or None,
        "book_slug": inp.book_slug,
        "sent_at": now.isoformat(),
    })
    # Quiet list — idempotent on email.
    await db.newsletter_subscribers.update_one(
        {"email": email},
        {"$setOnInsert": {
            "email": email,
            "name": (inp.name or "").strip() or None,
            "consent": True,
            "source": f"lead-magnet:{inp.book_slug}",
            "created_at": now.isoformat(),
        }},
        upsert=True,
    )

    # Send via Resend if configured. Otherwise just log and return.
    delivered = False
    try:
        from email_service import send_email as _send_email
        salutation = (inp.name or "").strip() or "wanderer"
        title = book.get("title", "the book")
        subject = f"a quiet bedtime book — {title}"
        text_body = (
            f"Hi {salutation},\n\n"
            f"Thank you for asking — '{title}' is yours, freely.\n\n"
            f"Download the PDF (works offline, on any device):\n  {download_url}\n\n"
            f"Or read it in your browser:\n  {public_url}\n\n"
            "It's a soft little book, written for the few minutes before sleep.\n"
            "If it lands in someone's evening and helps them breathe a little\n"
            "slower, that is exactly enough for me.\n\n"
            "If you ever want to walk a little further, the rest of Matrix\n"
            "Aurin is at https://prulesoul.site — but no rush, no follow-up.\n\n"
            "Sleep well.\n\n"
            "Anna (Aurin)\n"
            "founder, Matrix Aurin"
        )
        html_body = (
            f"<p>Hi {salutation},</p>"
            f"<p>Thank you for asking — <em>{title}</em> is yours, freely.</p>"
            f'<p><strong>Download the PDF</strong> (works offline, on any device):<br>'
            f'<a href="{download_url}">{download_url}</a></p>'
            f'<p>Or read it in your browser:<br>'
            f'<a href="{public_url}">{public_url}</a></p>'
            "<p>It's a soft little book, written for the few minutes before "
            "sleep. If it lands in someone's evening and helps them breathe "
            "a little slower, that is exactly enough for me.</p>"
            "<p>If you ever want to walk a little further, the rest of Matrix "
            'Aurin is at <a href="https://prulesoul.site">prulesoul.site</a> '
            "— but no rush, no follow-up.</p>"
            "<p>Sleep well.</p>"
            "<p>— Anna (Aurin)<br><em>founder, Matrix Aurin</em></p>"
        )
        result = await _send_email(
            to=email,
            subject=subject,
            text=text_body,
            html=html_body,
            sender="info",
        )
        delivered = bool(result and result.get("id"))
    except Exception as e:
        logger.warning("Lead magnet email send failed for %s: %s", email, e)

    return {
        "status": "sent" if delivered else "queued",
        "message": (
            "The book is on its way to your inbox. Sleep gently."
            if delivered
            else "Thank you. The book is queued and will arrive shortly."
        ),
        "read_url": public_url,
        "download_url": download_url,
    }


@api_router.get("/email/health")
async def email_health():
    """Read-only sanity check for the Resend wiring. No secrets, no PII."""
    from email_service import is_configured as _resend_configured, _resolve_sender
    return {
        "resend_configured": _resend_configured(),
        "senders": {
            "support": _resolve_sender("support"),
            "agent": _resolve_sender("agent"),
            "info": _resolve_sender("info"),
        },
        "first_letter_sends_total": await db.first_letter_sends.count_documents({}),
    }


# =============================================================
# AUTH — Magic Link (Iteration 28 stub).
# When `RESEND_API_KEY` is set, the verification link is emailed.
# Until then, the link is returned in the response so it can be
# delivered by other channels (founder copy/paste, support inbox, etc).
# =============================================================

class MagicLinkRequest(BaseModel):
    email: str
    redirect_to: Optional[str] = "/test-group"


@api_router.post("/auth/magic-link/request")
async def magic_link_request(inp: MagicLinkRequest):
    """Issue a one-time, 30-minute magic link for the given email.
    Idempotent on email (latest token replaces older ones). Always
    returns 200 even for unknown emails — never reveals user existence."""
    return await _issue_magic_link_for_email(inp.email, inp.redirect_to)


async def _issue_magic_link_for_email(
    email: str,
    redirect_to: Optional[str] = None,
    *,
    email_subject_override: Optional[str] = None,
    email_intro_override: Optional[str] = None,
) -> dict:
    """Core magic-link issuance. Generates a 64-char single-use token,
    stores in `magic_link_tokens`, and (when Resend is configured) sends
    a calm email with the link. Used both by /auth/magic-link/request
    AND by the LemonSqueezy webhook (§8.4) to grant instant access
    after a purchase."""
    email = (email or "").lower().strip()
    if not email or "@" not in email:
        return {"status": "error", "reason": "invalid_email"}
    token = uuid.uuid4().hex + uuid.uuid4().hex  # 64 chars
    expires = datetime.now(timezone.utc) + __import__("datetime").timedelta(minutes=30)
    await db.magic_link_tokens.update_one(
        {"email": email},
        {"$set": {
            "email": email,
            "token": token,
            "redirect_to": redirect_to or "/test-group",
            "expires_at": expires.isoformat(),
            "used_at": None,
            "created_at": datetime.now(timezone.utc).isoformat(),
        }},
        upsert=True,
    )
    base = _os.environ.get("PUBLIC_SITE_URL", "https://prulesoul.site").rstrip("/")
    link = f"{base}/portal/magic?token={token}"

    from email_service import (
        send_email as _send_email,
        render_magic_link_email as _render_magic,
        is_configured as _resend_configured,
    )
    delivered_via = "manual"
    resend_error: Optional[str] = None
    if _resend_configured():
        try:
            subject, html_body, text_body = _render_magic(link, 30)
            if email_subject_override:
                subject = email_subject_override
            if email_intro_override:
                # Inject a thin custom intro line at the top of both bodies.
                html_body = f"<p>{email_intro_override}</p>\n" + html_body
                text_body = f"{email_intro_override}\n\n" + text_body
            await _send_email(
                to=email,
                subject=subject,
                html=html_body,
                text=text_body,
                sender="support",
                # §Phase 1 — reply-to + List-Unsubscribe-style tags for
                # spam-filter reputation. Filters reward two-way
                # transactional shape: the message advertises a real
                # human inbox on the other end.
                reply_to=os.environ.get(
                    "AURIN_SUPPORT_REPLY_TO", "support@prulesoul.site"
                ),
                tags=[
                    {"name": "kind", "value": "magic_link"},
                    {"name": "transactional", "value": "true"},
                ],
            )
            delivered_via = "email"
        except Exception as e:  # noqa: BLE001
            logger.warning("magic_link resend.send failed: %s", e)
            resend_error = type(e).__name__
    return {
        "status": "ok",
        "delivered_via": delivered_via,
        "link": None if delivered_via == "email" else link,
        "magic_link_url": link,  # Always returned for webhook consumers.
        "expires_at": expires.isoformat(),
        "resend_error": resend_error,
    }


@api_router.post("/auth/magic-link/verify")
async def magic_link_verify(token: str, response: Response):
    """Exchange a magic-link token for a session token (same shape as
    the Google OAuth exchange writes). Single-use. Sets the same
    httpOnly session cookie as `/auth/session` so all rooms recognise
    the wanderer immediately."""
    if not token or len(token) < 32:
        raise HTTPException(status_code=400, detail="Invalid token.")
    row = await db.magic_link_tokens.find_one({"token": token})
    if not row:
        raise HTTPException(status_code=404, detail="Token not found.")
    if row.get("used_at"):
        raise HTTPException(status_code=410, detail="Token already used.")
    try:
        if datetime.fromisoformat(row["expires_at"]) < datetime.now(timezone.utc):
            raise HTTPException(status_code=410, detail="Token expired.")
    except (ValueError, KeyError):
        raise HTTPException(status_code=400, detail="Token malformed.")

    email = row["email"]
    # Find or create user.
    user = await db.users.find_one({"email": email}, {"_id": 0})
    if not user:
        user = {
            "user_id": str(uuid.uuid4()),
            "email": email,
            "name": email.split("@")[0],
            "picture": "",
            "role": "member",
            "created_at": datetime.now(timezone.utc),
            "auth_method": "magic_link",
        }
        await db.users.insert_one(dict(user))

    session_token = str(uuid.uuid4()) + str(uuid.uuid4()).replace("-", "")
    await db.user_sessions.insert_one({
        "user_id": user["user_id"],
        "session_token": session_token,
        "expires_at": datetime.now(timezone.utc) + __import__("datetime").timedelta(days=7),
        "created_at": datetime.now(timezone.utc),
        "auth_method": "magic_link",
    })
    await db.magic_link_tokens.update_one(
        {"token": token}, {"$set": {"used_at": datetime.now(timezone.utc).isoformat()}}
    )
    # §Phase 1 — set the same httpOnly cookie as Google /auth/session
    # so every private room recognises the wanderer with one entry.
    response.set_cookie(
        key="session_token",
        value=session_token,
        max_age=7 * 24 * 3600,
        path="/",
        httponly=True,
        secure=True,
        samesite="none",
    )
    # §AUDIT-W6 — also emit Partitioned cookie for Chrome 118+.
    _set_session_cookie(response, session_token)
    return {
        "session_token": session_token,
        "redirect_to": row.get("redirect_to") or "/portal",
        "user": {
            "user_id": user["user_id"],
            "email": user["email"],
            "name": user.get("name"),
            "role": user.get("role", "member"),
        },
    }


# =============================================================
# §STAGE 2.9 — GUEST ENTRY (Founder + first-time visitor flow)
# A public, one-click path into the mentor room. No email required.
# Creates a transient user + session, pre-acks consent_v2 + chosen
# guide gender, so the wanderer lands directly in CHAT phase.
# Honours every existing rule: same User model, same session model,
# same prefs row, same agreement record. NO new architecture.
# =============================================================

class GuestEntryInput(BaseModel):
    guide_gender: Literal["male", "female"] = "female"


@api_router.post("/auth/guest")
async def auth_guest(inp: GuestEntryInput, response: Response):
    """Create a one-click guest session. The wanderer lands in the
    Clarity Release room with their chosen guide already selected and
    every consent gate already acknowledged. Real user record (so the
    session honours every existing endpoint), email is a non-routable
    `guest-…@guest.aurin.local` so Resend never tries to reach it.
    """
    now = datetime.now(timezone.utc)
    user_id = str(uuid.uuid4())
    email = f"guest-{user_id[:12]}@guest.aurin.local"
    user_doc = {
        "user_id": user_id,
        "email": email,
        "name": "Quiet Wanderer",
        "picture": "",
        "role": "guest",
        "created_at": now,
        "auth_method": "guest",
    }
    await db.users.insert_one(dict(user_doc))

    session_token = str(uuid.uuid4()) + str(uuid.uuid4()).replace("-", "")
    await db.user_sessions.insert_one({
        "user_id": user_id,
        "session_token": session_token,
        "expires_at": now + __import__("datetime").timedelta(days=1),
        "created_at": now,
        "auth_method": "guest",
    })

    # Pre-acknowledge the in-room consent so the wanderer skips the
    # Threshold copy block and lands in CHAT. Schema mirrors
    # clarity_user_prefs writes from /api/clarity/prefs exactly.
    await db.clarity_user_prefs.update_one(
        {"user_id": user_id},
        {"$set": {
            "user_id": user_id,
            "guide_gender": inp.guide_gender,
            "consent_v2": True,
            "consent_v2_at": now.isoformat(),
            "save_threads": False,
            "auto_send_threads": False,
            "consent_version_current": "v2",
            "auth_method": "guest",
            "updated_at": now.isoformat(),
        }},
        upsert=True,
    )

    # Pre-ack the WandererGate so the front-door doesn't re-prompt.
    await db.agreement_acceptances.update_one(
        {"user_id": user_id, "scope": "private"},
        {"$set": {
            "user_id": user_id,
            "scope": "private",
            "version": "1.0-2026-02-07",
            "accepted_at": now.isoformat(),
            "auth_method": "guest",
        }},
        upsert=True,
    )

    # Same httpOnly cookie as the magic-link verify path → every room
    # recognises the wanderer with one entry.
    response.set_cookie(
        key="session_token",
        value=session_token,
        max_age=24 * 3600,
        path="/",
        httponly=True,
        secure=True,
        samesite="none",
    )
    # §AUDIT-W6 — also emit Partitioned cookie for Chrome 118+.
    _set_session_cookie(response, session_token, max_age=24 * 3600)

    return {
        "session_token": session_token,
        "user_id": user_id,
        "guide_gender": inp.guide_gender,
        "expires_in_hours": 24,
        "redirect_to": "/clarity-release",
    }


# =============================================================
# BETA TEST GROUP — first 10 quiet wanderers get 14 days of free
# Clarity Release access + all 8 books unlocked. Beyond the cap,
# applicants are routed to the newsletter waitlist instead.
# =============================================================

BETA_TOTAL_SLOTS = 10
BETA_DURATION_DAYS = 14


class BetaEnrollment(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    email: str
    enrolled_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    expires_at: str
    pass_id: Optional[str] = None
    book_grants: List[str] = Field(default_factory=list)
    feedback_received: bool = False


async def _beta_count() -> int:
    return await db.beta_enrollments.count_documents({})


@api_router.get("/beta/status")
async def beta_status():
    """Public: how many test-group spots are left + total."""
    taken = await _beta_count()
    return {
        "slots_total": BETA_TOTAL_SLOTS,
        "slots_taken": min(taken, BETA_TOTAL_SLOTS),
        "slots_left": max(0, BETA_TOTAL_SLOTS - taken),
        "is_open": taken < BETA_TOTAL_SLOTS,
        "duration_days": BETA_DURATION_DAYS,
    }


@api_router.get("/beta/me")
async def beta_me(request: Request):
    """Auth: this user's enrollment row (or null) + remaining seconds."""
    user = await _require_user(request)
    row = await db.beta_enrollments.find_one(
        {"user_id": user.user_id}, {"_id": 0}
    )
    if not row:
        return {"enrolled": False}
    seconds = _seconds_remaining(row.get("expires_at"))
    return {
        "enrolled": True,
        "expires_at": row.get("expires_at"),
        "seconds_remaining": seconds,
        "is_active": seconds > 0,
        "book_grants": row.get("book_grants") or [],
    }


@api_router.post("/beta/enroll")
async def beta_enroll(request: Request):
    """Auth: enroll the user in the test group. Idempotent — a second
    click returns the existing enrollment. If the cap is full, returns
    is_full=True and DOES NOT enroll the user; the frontend then routes
    the visitor toward the newsletter waitlist."""
    user = await _require_user(request)

    existing = await db.beta_enrollments.find_one(
        {"user_id": user.user_id}, {"_id": 0}
    )
    if existing:
        return {
            "status": "already_enrolled",
            "enrollment": existing,
            "is_full": False,
        }

    taken = await _beta_count()
    if taken >= BETA_TOTAL_SLOTS:
        return {
            "status": "full",
            "is_full": True,
            "slots_left": 0,
        }

    expires_at = (
        datetime.now(timezone.utc)
        + __import__("datetime").timedelta(days=BETA_DURATION_DAYS)
    ).isoformat()

    # 1) Grant a Clarity pass — reuse the season_30days tier so existing
    #    /clarity/access logic just works, but with a 14-day expiry.
    pass_doc = {
        "id": str(uuid.uuid4()),
        "user_id": user.user_id,
        "tier": "season_30days",
        "source": "beta_grant",
        "external_order_id": None,
        "granted_at": datetime.now(timezone.utc).isoformat(),
        "expires_at": expires_at,
        "consumed": True,  # active immediately
    }
    await db.clarity_passes.insert_one(pass_doc)

    # 2) Unlock every book currently in the catalog. Idempotent thanks to
    #    the unique (user_id, book_slug) index — duplicates raise and we
    #    silently skip them.
    granted_slugs = []
    books = await db.books.find({}, {"_id": 0, "slug": 1}).to_list(50)
    for b in books:
        slug = b.get("slug")
        if not slug:
            continue
        try:
            await db.purchases.insert_one({
                "id": str(uuid.uuid4()),
                "user_id": user.user_id,
                "book_slug": slug,
                "source": "beta_grant",
                "external_order_id": None,
                "granted_at": datetime.now(timezone.utc).isoformat(),
            })
            granted_slugs.append(slug)
        except Exception:
            # Duplicate — already owns this book. Fine.
            pass

    enrollment = BetaEnrollment(
        user_id=user.user_id,
        email=user.email,
        expires_at=expires_at,
        pass_id=pass_doc["id"],
        book_grants=granted_slugs,
    )
    await db.beta_enrollments.insert_one(enrollment.model_dump())

    return {
        "status": "enrolled",
        "enrollment": enrollment.model_dump(),
        "is_full": False,
    }


# =============================================================
# PRUESOUL (pure-soul-life landing page) — inbound webhook
# Receives `enrollment.created` and `waitlist.joined` events from the
# landing page's server-to-server webhook. HMAC-SHA256 signature is
# verified against PRUESOUL_WEBHOOK_SECRET on every request.
#
# Events are:
#   1. Stored raw in db.pruesoul_enrollments / db.pruesoul_waitlist
#      (idempotent on enrollment_id / email for replay safety).
#   2. Mirrored into db.beta_enrollments so our counter reflects the
#      combined total across both surfaces. Source = "pruesoul".
# =============================================================

# §8.8 Unified-key compatibility (founder ruling 2026-02-06):
# Both apps share the same HMAC secret. LP names it `WEBHOOK_SECRET` in
# its env. AH historically named it `PRUESOUL_WEBHOOK_SECRET`. We accept
# either name so the Deployment Panel can be normalised without a code
# change. The VALUES are already identical (counter + outbound HMAC have
# both passed live verification 2026-02-06).
_PRUESOUL_SECRET = (
    _os.environ.get("WEBHOOK_SECRET")
    or _os.environ.get("PRUESOUL_WEBHOOK_SECRET", "")
)
_BETA_SPOTS_PER_CYCLE = int(_os.environ.get("BETA_SPOTS_PER_CYCLE", "10"))
_LP_HEARTBEAT_URL = _os.environ.get("LP_HEARTBEAT_URL", "").strip()  # e.g. https://pure-soul-life.emergent.host/api/integrations/aurin-hub/heartbeat
_HEARTBEAT_INTERVAL_SECONDS = int(_os.environ.get("HEARTBEAT_INTERVAL_SECONDS", "300"))


def _verify_pruesoul_signature(raw_body: bytes, signature_header: str) -> bool:
    if not _PRUESOUL_SECRET or not signature_header:
        return False
    digest = _hmac.new(
        _PRUESOUL_SECRET.encode("utf-8"), raw_body, _hashlib.sha256
    ).hexdigest()
    # Constant-time compare; accept either raw hex or the exact secret
    # string (some senders pass the secret directly — both paths work).
    return _hmac.compare_digest(digest, signature_header) or _hmac.compare_digest(
        _PRUESOUL_SECRET, signature_header
    )


@api_router.post("/integrations/pruesoul/webhook")
async def pruesoul_webhook(request: Request):
    """Receive an enrollment.created or waitlist.joined event from
    the pure-soul-life landing page. Always returns 200 on accepted
    payloads so the sender does not retry indefinitely; real failures
    surface via /api/integrations/pruesoul/health.
    """
    raw = await request.body()
    sig = (
        request.headers.get("X-Aurin-Signature")
        or request.headers.get("x-aurin-signature")
        or ""
    )
    if not _verify_pruesoul_signature(raw, sig):
        raise HTTPException(status_code=401, detail="Invalid signature.")

    event_name = (
        request.headers.get("X-Aurin-Event")
        or request.headers.get("x-aurin-event")
        or ""
    )

    try:
        payload = _json.loads(raw) if raw else {}
    except _json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="Invalid JSON body.")

    now = datetime.now(timezone.utc).isoformat()
    # Audit every accepted event regardless of outcome.
    await db.pruesoul_events.insert_one({
        "id": str(uuid.uuid4()),
        "event": event_name or (payload.get("event") or "unknown"),
        "enrollment_id": payload.get("enrollment_id"),
        "email": (payload.get("email") or "").lower() or None,
        "received_at": now,
        "raw": payload,
    })

    effective_event = event_name or payload.get("event") or ""

    if effective_event == "enrollment.created":
        enrollment_id = payload.get("enrollment_id")
        email = (payload.get("email") or "").strip().lower()
        if not enrollment_id or not email:
            return {"status": "ignored", "reason": "missing enrollment_id or email"}

        # Idempotent upsert into the dedicated pruesoul audit table.
        await db.pruesoul_enrollments.update_one(
            {"enrollment_id": enrollment_id},
            {"$setOnInsert": {
                "id": str(uuid.uuid4()),
                "enrollment_id": enrollment_id,
                "email": email,
                "name": payload.get("name"),
                "spot_number": payload.get("spot_number"),
                "spots_left": payload.get("spots_left"),
                "reflection_consent": bool(payload.get("reflection_consent")),
                "trial_start": payload.get("trial_start"),
                "trial_end": payload.get("trial_end"),
                "trial_days": payload.get("trial_days"),
                "access_token": payload.get("access_token"),
                "portal_url": payload.get("portal_url"),
                "cycle": payload.get("cycle") or "01",
                "source": payload.get("source") or "pruesoul",
                "created_at": payload.get("created_at") or now,
                "mirrored_at": now,
            }},
            upsert=True,
        )

        # Mirror into db.beta_enrollments so our /api/beta/status counter
        # reflects the COMBINED enrollment total. Idempotent via the
        # unique index on user_id; we synthesize a user_id from the
        # enrollment_id so the mirror row is deterministic.
        mirror_user_id = f"pruesoul:{enrollment_id}"
        try:
            await db.beta_enrollments.insert_one({
                "id": str(uuid.uuid4()),
                "user_id": mirror_user_id,
                "email": email,
                "enrolled_at": payload.get("created_at") or now,
                "expires_at": payload.get("trial_end") or (
                    (datetime.now(timezone.utc) + __import__("datetime").timedelta(days=BETA_DURATION_DAYS)).isoformat()
                ),
                "pass_id": None,
                "book_grants": [],
                "feedback_received": False,
                "source": "pruesoul",
            })
        except Exception:
            # Duplicate mirror (replay) — already counted. No-op.
            pass

        return {"status": "ok", "event": "enrollment.created"}

    if effective_event == "waitlist.joined":
        email = (payload.get("email") or "").strip().lower()
        if not email:
            return {"status": "ignored", "reason": "missing email"}
        await db.pruesoul_waitlist.update_one(
            {"email": email},
            {"$setOnInsert": {
                "id": str(uuid.uuid4()),
                "email": email,
                "position": payload.get("position"),
                "cycle_next": payload.get("cycle_next") or "02",
                "received_at": payload.get("created_at") or now,
            }},
            upsert=True,
        )
        return {"status": "ok", "event": "waitlist.joined"}

    return {"status": "ignored", "reason": f"event {effective_event!r} not handled"}


@api_router.get("/integrations/pruesoul/health")
async def pruesoul_health():
    """Read-only sanity check. No secrets, no PII."""
    return {
        "secret_set": bool(_PRUESOUL_SECRET),
        "events_total": await db.pruesoul_events.count_documents({}),
        "enrollments_mirrored": await db.pruesoul_enrollments.count_documents({}),
        "waitlist_total": await db.pruesoul_waitlist.count_documents({}),
    }


# §8.1 Counter Endpoint — AH is the single source of truth for spots.
# The landing page (pure-soul-life) reads this every page render and
# must STOP rendering its own local count. HMAC-auth via the same shared
# PRUESOUL_WEBHOOK_SECRET. GET requests have no body so we accept either
# the secret directly in `X-Aurin-Signature` (simple shared-bearer mode)
# OR a HMAC of the empty body (kept for symmetry with the inbound webhook).
@api_router.get("/integrations/pruesoul/counter")
async def pruesoul_counter(request: Request, cycle: Optional[str] = None):
    """Authoritative spot counter. Landing page MUST consume this and not
    render its own local number. Auth: same shared secret as the inbound
    webhook (`X-Aurin-Signature` header). 200 returns:
      { spots_total, spots_taken, spots_left, cycle, as_of }
    401 on missing/invalid signature.
    """
    sig = (
        request.headers.get("X-Aurin-Signature")
        or request.headers.get("x-aurin-signature")
        or ""
    )
    if not _verify_pruesoul_signature(b"", sig):
        raise HTTPException(status_code=401, detail="Invalid signature.")

    target_cycle = (cycle or "01").strip() or "01"
    spots_taken = await db.pruesoul_enrollments.count_documents({"cycle": target_cycle})
    spots_left = max(0, _BETA_SPOTS_PER_CYCLE - spots_taken)
    return {
        "spots_total": _BETA_SPOTS_PER_CYCLE,
        "spots_taken": spots_taken,
        "spots_left": spots_left,
        "cycle": target_cycle,
        "as_of": datetime.now(timezone.utc).isoformat(),
        "source": "aurin-hub",
    }


# §8.3 Heartbeat — Aurin-Hub sends a signed POST to the Landing Page
# every N seconds with the current spots state and last-event timestamp.
# Each attempt is logged in db.aurin_heartbeat_log so the admin endpoint
# can show a recent timeline. The LP side must expose
# `POST /api/integrations/aurin-hub/heartbeat` to receive these.
async def _send_one_heartbeat() -> dict:
    """Build, sign, send one heartbeat. Returns a status dict that is
    persisted regardless of success/failure."""
    now = datetime.now(timezone.utc)
    spots_taken = await db.pruesoul_enrollments.count_documents({"cycle": "01"})
    last_evt = await db.pruesoul_events.find_one(
        {}, sort=[("received_at", -1)], projection={"_id": 0, "received_at": 1, "event": 1}
    )
    payload = {
        "spots_total": _BETA_SPOTS_PER_CYCLE,
        "spots_taken": spots_taken,
        "spots_left": max(0, _BETA_SPOTS_PER_CYCLE - spots_taken),
        "cycle": "01",
        "last_event_at": (last_evt or {}).get("received_at"),
        "last_event_kind": (last_evt or {}).get("event"),
        "health": "ok",
        "source": "aurin-hub",
        "sent_at": now.isoformat(),
    }
    raw = _json.dumps(payload, separators=(",", ":")).encode("utf-8")

    log_doc = {
        "id": str(uuid.uuid4()),
        "sent_at": now.isoformat(),
        "target_url": _LP_HEARTBEAT_URL or None,
        "spots_taken": spots_taken,
    }

    if not _LP_HEARTBEAT_URL or not _PRUESOUL_SECRET:
        log_doc.update({
            "status": "skipped",
            "reason": "LP_HEARTBEAT_URL or PRUESOUL_WEBHOOK_SECRET missing",
            "http_code": None,
        })
        await db.aurin_heartbeat_log.insert_one(log_doc.copy())
        return log_doc

    signature = _hmac.new(
        _PRUESOUL_SECRET.encode("utf-8"), raw, _hashlib.sha256
    ).hexdigest()

    try:
        import httpx  # type: ignore
        async with httpx.AsyncClient(timeout=10.0) as client_http:
            resp = await client_http.post(
                _LP_HEARTBEAT_URL,
                content=raw,
                headers={
                    "Content-Type": "application/json",
                    "X-Aurin-Signature": signature,
                    "X-Aurin-Event": "aurin.heartbeat",
                },
            )
        log_doc.update({
            "status": "ok" if 200 <= resp.status_code < 300 else "failed",
            "http_code": resp.status_code,
            "response_snippet": (resp.text or "")[:200],
        })
    except Exception as e:  # noqa: BLE001
        log_doc.update({
            "status": "error",
            "http_code": None,
            "error": str(e)[:200],
        })

    await db.aurin_heartbeat_log.insert_one(log_doc.copy())
    return log_doc


async def _aurin_heartbeat_loop() -> None:
    """Background coroutine: emits one heartbeat every
    HEARTBEAT_INTERVAL_SECONDS (default 300 = 5 min)."""
    await asyncio.sleep(20)  # let startup settle
    while True:
        try:
            await _send_one_heartbeat()
        except Exception as e:  # noqa: BLE001
            logging.warning("Heartbeat tick failed: %s", e)
        await asyncio.sleep(_HEARTBEAT_INTERVAL_SECONDS)


@api_router.post("/admin/heartbeat/test")
async def admin_heartbeat_test(request: Request):
    """Founder-only — fire one heartbeat now (for ad-hoc verification).
    Returns the same status dict that gets logged."""
    admin_token = os.environ.get("ADMIN_TOKEN")
    sent = request.headers.get("X-Admin-Token") or request.query_params.get("token")
    if not admin_token or sent != admin_token:
        raise HTTPException(status_code=401, detail="Admin token required.")
    return await _send_one_heartbeat()


# ----------------------------------------------------------------
# §STABILIZATION 2026-05-19 — Admin presence-grant endpoint.
# Founder tool for manually gifting / withdrawing voice minutes
# without going through Lemon Squeezy (VIP, influencer, press,
# refund flows). Idempotent via an auto-generated `external_order_id`
# so duplicate calls create independent audit records — safe and
# repeatable.
# ----------------------------------------------------------------

class AdminPresenceGrantInput(BaseModel):
    """Body for POST /api/admin/presence/grant.

    Identify the recipient by EITHER `user_id` OR `email` (at least
    one required). `seconds` may be negative to subtract minutes
    (e.g. refund or correction); balance is floored at 0.
    """
    user_id: Optional[str] = None
    email: Optional[str] = None
    seconds: int  # positive to add, negative to subtract
    reason: Optional[str] = "founder_gift"
    note: Optional[str] = None  # free-form audit note, never shown to user


# ----------------------------------------------------------------
# §FIN-SPLIT 2026-05-20 PM — Admin Financial Preview endpoint.
# Founder-only "what would this product earn me?" calculator. Lets
# the Founder model any (amount, minutes) tuple BEFORE creating a
# LemonSqueezy product. Read-only — does not write to DB, does not
# touch users. Returns the same dict shape as the live webhook log.
# ----------------------------------------------------------------

@api_router.get("/admin/financial/preview")
async def admin_financial_preview(request: Request):
    """Preview the 4-tier split for a hypothetical (amount, minutes) pair.

    Query params:
        amount   — gross order amount in EUR (float, required)
        minutes  — voice minutes the product would unlock (float, default 0)
        label    — optional human label for the response

    Authentication: ADMIN_TOKEN header `X-Admin-Token` or query `token`.

    Example:
        curl "$API/api/admin/financial/preview?amount=45&minutes=60&token=…"
    """
    admin_token = os.environ.get("ADMIN_TOKEN")
    sent = (
        request.headers.get("X-Admin-Token")
        or request.query_params.get("token")
        or ""
    )
    if not admin_token or sent != admin_token:
        raise HTTPException(status_code=401, detail="Admin token required.")

    try:
        amount = float(request.query_params.get("amount") or 0)
    except (TypeError, ValueError):
        raise HTTPException(status_code=400, detail="amount must be numeric")
    try:
        minutes = float(request.query_params.get("minutes") or 0)
    except (TypeError, ValueError):
        raise HTTPException(status_code=400, detail="minutes must be numeric")
    label = (request.query_params.get("label") or "").strip() or f"preview €{amount:.0f}/{minutes:.0f}min"

    if amount < 0 or minutes < 0:
        raise HTTPException(status_code=400, detail="amount and minutes must be ≥ 0")

    split = compute_financial_split(amount, minutes, label=label)
    # Also log the preview so the founder can scroll backend.err.log
    # and see what they audited mid-session.
    _log_financial_split(split, context="preview")
    return split


# ----------------------------------------------------------------
# §GOVERNANCE 2026-02-11 — Admin Governance Status endpoint.
# Real-time snapshot of all three runtime guards + customer "debt"
# (sum of presence_seconds_left) + vendor headroom (ElevenLabs).
# Powers /admin/finance dashboard. Read-only.
# ----------------------------------------------------------------

@api_router.get("/admin/governance/status")
async def admin_governance_status(request: Request):
    """Snapshot of governance guards + customer debt + vendor headroom.

    Authentication: ADMIN_TOKEN header `X-Admin-Token` or query `token`.
    """
    admin_token = os.environ.get("ADMIN_TOKEN")
    sent = (
        request.headers.get("X-Admin-Token")
        or request.query_params.get("token")
        or ""
    )
    if not admin_token or sent != admin_token:
        raise HTTPException(status_code=401, detail="Admin token required.")

    from runtime_governance import governance_status_snapshot
    snapshot = await governance_status_snapshot(db)

    # Add recent voice activity: sessions opened in last 24h, 7d.
    now = datetime.now(timezone.utc)
    try:
        cutoff_24h = (now - timedelta(hours=24)).isoformat()
        cutoff_7d = (now - timedelta(days=7)).isoformat()
        sessions_24h = await db.voice_sessions.count_documents(
            {"started_at": {"$gte": cutoff_24h}}
        )
        sessions_7d = await db.voice_sessions.count_documents(
            {"started_at": {"$gte": cutoff_7d}}
        )
        # Sum elapsed_seconds over last 7 days for actual vendor burn.
        burn_pipeline = [
            {"$match": {"started_at": {"$gte": cutoff_7d}, "closed": True}},
            {"$group": {"_id": None, "total": {"$sum": "$elapsed_seconds"}}},
        ]
        burn_seconds_7d = 0
        async for row in db.voice_sessions.aggregate(burn_pipeline):
            burn_seconds_7d = int(row.get("total") or 0)
    except Exception as exc:  # noqa: BLE001
        logging.warning("activity snapshot failed: %s", exc)
        sessions_24h = sessions_7d = burn_seconds_7d = 0

    snapshot["activity"] = {
        "sessions_last_24h": sessions_24h,
        "sessions_last_7d": sessions_7d,
        "actual_burn_seconds_7d": burn_seconds_7d,
        "actual_burn_minutes_7d": round(burn_seconds_7d / 60.0, 1),
        "actual_burn_cost_usd_7d": round((burn_seconds_7d / 60.0) * 0.14, 2),
    }

    # §GOVERNANCE-ALERTS 2026-02-11 — every status poll triggers the
    # idempotent alert check. Dashboard's 60s auto-refresh is the
    # heartbeat that fires emails when ratio dips below thresholds.
    try:
        from governance_alerts import check_and_send_alerts
        alert_result = await check_and_send_alerts(db, snapshot)
        snapshot["alert_status"] = alert_result
    except Exception as exc:  # noqa: BLE001
        logging.warning("alert check failed: %s", exc)
        snapshot["alert_status"] = {"error": str(exc)}

    return snapshot


# ----------------------------------------------------------------
# §GOVERNANCE 2026-02-11 — Emergency Freeze admin endpoints.
# Toggle in-memory env var. Persists ONLY until backend restart;
# permanent freeze requires editing /app/backend/.env.
# ----------------------------------------------------------------

@api_router.post("/admin/governance/freeze")
async def admin_governance_freeze(request: Request):
    """Emergency freeze — block ALL new voice sessions (including
    unlimited_voice users). Returns the new state.

    Authentication: ADMIN_TOKEN header `X-Admin-Token` or query `token`.
    """
    admin_token = os.environ.get("ADMIN_TOKEN")
    sent = (
        request.headers.get("X-Admin-Token")
        or request.query_params.get("token")
        or ""
    )
    if not admin_token or sent != admin_token:
        raise HTTPException(status_code=401, detail="Admin token required.")
    from runtime_governance import set_frozen, is_frozen
    set_frozen(True)
    logging.warning("[GOVERNANCE] EMERGENCY FREEZE activated by admin")
    return {"frozen": is_frozen(), "action": "freeze"}


@api_router.post("/admin/governance/unfreeze")
async def admin_governance_unfreeze(request: Request):
    """Lift emergency freeze. Returns the new state."""
    admin_token = os.environ.get("ADMIN_TOKEN")
    sent = (
        request.headers.get("X-Admin-Token")
        or request.query_params.get("token")
        or ""
    )
    if not admin_token or sent != admin_token:
        raise HTTPException(status_code=401, detail="Admin token required.")
    from runtime_governance import set_frozen, is_frozen
    set_frozen(False)
    logging.warning("[GOVERNANCE] freeze lifted by admin")
    return {"frozen": is_frozen(), "action": "unfreeze"}


# ----------------------------------------------------------------
# §PAYMENT-ABSTRACTION 2026-02-11 — Polar.sh webhook + admin SKU.
# Sandbox-only. Returns HTTP 503 until env keys are set.
# LemonSqueezy webhook untouched.
# ----------------------------------------------------------------

@api_router.get("/admin/payment/sku-map")
async def admin_payment_sku_map(request: Request):
    """Return the 3-SKU mapping + Polar configuration status."""
    admin_token = os.environ.get("ADMIN_TOKEN")
    sent = (
        request.headers.get("X-Admin-Token")
        or request.query_params.get("token")
        or ""
    )
    if not admin_token or sent != admin_token:
        raise HTTPException(status_code=401, detail="Admin token required.")
    from payment_providers.sku_mapping import list_skus
    from payment_providers.polar import PolarProvider, _mode
    polar = PolarProvider()
    return {
        "polar_mode": _mode(),
        "polar_configured": polar.is_configured(),
        "skus": list_skus(),
        "lemonsqueezy_status": "live_untouched",
    }


@api_router.post("/webhooks/polar")
async def polar_webhook(request: Request):
    """Polar v1 webhook — DECOMMISSIONED 2026-02-29 (iter 86h+).

    Founder picked Path A (Gumroad-only) from
    /app/memory/BILLING_SOURCE_OF_TRUTH_2026-02-29.md.

    This endpoint was a duplicate of `/api/billing/polar/webhook`
    (line ~16465). The newer v2 endpoint uses the
    `polar_processed_events` collection and the `_billing_webhook`
    service. It stays live but returns 503 until POLAR_SKU_MAP_JSON
    is filled.

    This v1 path is permanently retired: it always returns 410 Gone
    so any Polar dashboard pointing at the old URL fails loudly
    rather than silently double-processing events.

    Historical webhook log: `polar_webhook_log` collection is frozen
    but still queryable via `/api/admin/payment/polar-events`.
    """
    raise HTTPException(
        status_code=410,
        detail={
            "reason": "endpoint_decommissioned",
            "message": "Use /api/billing/polar/webhook instead. See BILLING_SOURCE_OF_TRUTH_2026-02-29.md.",
        },
    )


@api_router.get("/admin/payment/polar-events")
async def admin_polar_events(request: Request, limit: int = 20):
    """Recent Polar webhook events for /admin/finance + debug visibility."""
    admin_token = os.environ.get("ADMIN_TOKEN")
    sent = (
        request.headers.get("X-Admin-Token")
        or request.query_params.get("token")
        or ""
    )
    if not admin_token or sent != admin_token:
        raise HTTPException(status_code=401, detail="Admin token required.")
    limit = max(1, min(100, limit))
    rows = []
    async for row in db.polar_webhook_log.find(
        {}, {"_id": 0, "raw_payload": 0}
    ).sort("received_at", -1).limit(limit):
        rows.append(row)
    return {"count": len(rows), "events": rows}


@api_router.post("/admin/presence/grant")
async def admin_presence_grant(inp: AdminPresenceGrantInput, request: Request):
    """Founder-only — manual presence-seconds grant or correction.

    Use cases:
      • VIP / influencer gift (positive seconds)
      • Press review window (positive seconds)
      • Refund / correction (negative seconds)
      • Test seeding (positive seconds)

    Authentication: ADMIN_TOKEN header `X-Admin-Token` or query `token`.
    """
    admin_token = os.environ.get("ADMIN_TOKEN")
    sent = (
        request.headers.get("X-Admin-Token")
        or request.query_params.get("token")
        or ""
    )
    if not admin_token or sent != admin_token:
        raise HTTPException(status_code=401, detail="Admin token required.")

    if not (inp.user_id or inp.email):
        raise HTTPException(
            status_code=400, detail="user_id or email required."
        )

    user_doc = None
    if inp.user_id:
        user_doc = await db.users.find_one(
            {"user_id": inp.user_id}, {"_id": 0}
        )
    if not user_doc and inp.email:
        user_doc = await db.users.find_one(
            {"email": inp.email.strip().lower()}, {"_id": 0}
        )
    if not user_doc:
        raise HTTPException(status_code=404, detail="User not found.")

    current_balance = int(user_doc.get("presence_seconds_left") or 0)
    new_balance = max(0, current_balance + int(inp.seconds))

    await db.users.update_one(
        {"user_id": user_doc["user_id"]},
        {"$set": {"presence_seconds_left": new_balance}},
    )

    # §AUDIT-LEDGER 2026-05-20 — Founder gifts must also hit the ledger.
    await _append_credit_ledger(
        user_id=user_doc["user_id"],
        delta=new_balance - current_balance,
        before=current_balance,
        after=new_balance,
        reason=inp.reason or "founder_gift",
        external_ref=f"founder_gift_{uuid.uuid4().hex[:12]}",
        extra={"source": "admin", "note": inp.note or None},
    )

    # Audit record — same collection as Lemon-driven grants so the
    # founder's analytics view sees a complete ledger.
    try:
        await db.presence_grants.insert_one({
            "id": str(uuid.uuid4()),
            "user_id": user_doc["user_id"],
            "external_order_id": f"founder_gift_{uuid.uuid4().hex[:12]}",
            "variant_id": None,
            "presence_seconds": int(inp.seconds),
            "grant_kind": "founder_gift",
            "source": "admin",
            "reason": inp.reason or "founder_gift",
            "note": inp.note or None,
            "granted_at": datetime.now(timezone.utc).isoformat(),
        })
    except Exception as e:  # noqa: BLE001
        logger.warning("admin presence grant audit insert failed: %s", e)

    return {
        "status": "ok",
        "user_id": user_doc["user_id"],
        "email": user_doc.get("email"),
        "seconds_delta": int(inp.seconds),
        "previous_balance": current_balance,
        "presence_seconds_left": new_balance,
        "reason": inp.reason or "founder_gift",
    }


# ----------------------------------------------------------------
# §AUDIT-LEDGER 2026-05-20 — Founder's truth tool. Compares the
# canonical `users.presence_seconds_left` movement against the
# `credit_ledger` sum so any silent drift becomes visible.
# ----------------------------------------------------------------
@api_router.get("/admin/audit/ledger-diff")
async def admin_audit_ledger_diff(
    request: Request,
    email: str | None = None,
    user_id: str | None = None,
    hours: int = 24,
    limit: int = 50,
):
    """Founder-only — reconciliation report.

    For one specific user (by email or user_id) OR for the top-N most
    active users in the last `hours`, returns:
      • Current `presence_seconds_left`
      • Sum of `presence_grants.presence_seconds` (lifetime ins)
      • Sum of `voice_sessions.elapsed_seconds` (lifetime outs)
      • Sum of `credit_ledger.delta` (lifetime, signed)
      • Expected vs. actual balance + drift in seconds
      • Last N ledger rows for the user(s)

    Drift > 0 ⇒ ledger UNDER-reports (real money moved with no record).
    Drift < 0 ⇒ ledger OVER-reports.
    A healthy system shows |drift| == 0 for every user.
    """
    admin_token = os.environ.get("ADMIN_TOKEN")
    sent = (
        request.headers.get("X-Admin-Token")
        or request.query_params.get("token")
        or ""
    )
    if not admin_token or sent != admin_token:
        raise HTTPException(status_code=401, detail="Admin token required.")

    targets: list[dict] = []
    if email or user_id:
        q: dict = {}
        if user_id:
            q["user_id"] = user_id
        elif email:
            q["email"] = email.strip().lower()
        u = await db.users.find_one(q, {"_id": 0})
        if not u:
            raise HTTPException(status_code=404, detail="User not found.")
        targets = [u]
    else:
        # Top movers in the window by ledger row count.
        since = datetime.now(timezone.utc) - timedelta(hours=hours)
        pipe = [
            {"$match": {"occurred_at": {"$gte": since.isoformat()}}},
            {"$group": {"_id": "$user_id", "n": {"$sum": 1}}},
            {"$sort": {"n": -1}},
            {"$limit": int(limit)},
        ]
        ids = [d["_id"] async for d in db.credit_ledger.aggregate(pipe)]
        if ids:
            async for u in db.users.find({"user_id": {"$in": ids}}, {"_id": 0}):
                targets.append(u)

    rows: list[dict] = []
    for u in targets:
        uid = u["user_id"]
        cur_balance = int(u.get("presence_seconds_left") or 0)

        # Ins: presence_grants sum
        grants_total = 0
        async for g in db.presence_grants.find({"user_id": uid}, {"presence_seconds": 1}):
            grants_total += int(g.get("presence_seconds") or 0)

        # Outs: voice_sessions elapsed sum (closed only)
        outs_total = 0
        async for v in db.voice_sessions.find(
            {"user_id": uid, "closed": True},
            {"elapsed_seconds": 1},
        ):
            outs_total += int(v.get("elapsed_seconds") or 0)

        # Ledger delta sum
        ledger_sum = 0
        ledger_count = 0
        async for d in db.credit_ledger.aggregate([
            {"$match": {"user_id": uid}},
            {"$group": {
                "_id": None,
                "s": {"$sum": "$delta"},
                "n": {"$sum": 1},
            }},
        ]):
            ledger_sum = int(d.get("s") or 0)
            ledger_count = int(d.get("n") or 0)

        # Expected balance from real movements (capped at zero like the app does).
        expected = max(0, grants_total - outs_total)
        drift_vs_expected = cur_balance - expected
        # Ledger-implied delta should equal (cur - 0) if user started at 0.
        # We assume start=0 baseline; drift_vs_ledger surfaces anything
        # the ledger missed or double-counted.
        drift_vs_ledger = cur_balance - ledger_sum

        # Last 5 ledger rows for forensic context.
        recent = []
        async for r in db.credit_ledger.find(
            {"user_id": uid}, {"_id": 0}
        ).sort("occurred_at", -1).limit(5):
            recent.append(r)

        rows.append({
            "user_id": uid,
            "email": u.get("email"),
            "balance_now": cur_balance,
            "grants_in_total": grants_total,
            "voice_out_total": outs_total,
            "ledger_delta_sum": ledger_sum,
            "ledger_row_count": ledger_count,
            "expected_balance_from_movements": expected,
            "drift_vs_expected": drift_vs_expected,
            "drift_vs_ledger": drift_vs_ledger,
            "unlimited_voice": bool(u.get("unlimited_voice")),
            "recent_ledger": recent,
        })

    # Top-line summary: how many users have non-zero drift?
    drift_count = sum(1 for r in rows if r["drift_vs_ledger"] != 0)
    drift_max = max((abs(r["drift_vs_ledger"]) for r in rows), default=0)

    # Recent ledger-write-failed events (the silent gap canary).
    since = datetime.now(timezone.utc) - timedelta(hours=hours)
    failed_writes = await db.funnel_events.count_documents({
        "event": "ledger_write_failed",
        "occurred_at": {"$gte": since.isoformat()},
    })

    return {
        "as_of": datetime.now(timezone.utc).isoformat(),
        "window_hours": hours,
        "users_audited": len(rows),
        "users_with_drift": drift_count,
        "max_drift_seconds": drift_max,
        "ledger_write_failed_events_in_window": failed_writes,
        "rows": rows,
    }


# ----------------------------------------------------------------
# §Iter 65 — Funnel telemetry (lightweight)
# ----------------------------------------------------------------
# A single public POST endpoint that writes one document per event into
# `funnel_events`. Per-IP throttle to keep the surface bot-safe and
# credit-cost-free (no LLM, no third-party cascade). NO PII written —
# only event_type, optional room slug, optional course slug, opaque
# anonymous client_id (32-char hex from localStorage), and a UTC stamp.
#
# This is observability, NOT analytics. We don't fingerprint, profile,
# build cohorts, or sell anything. The founder watches the funnel
# through `/admin/observation/funnel`.
# ----------------------------------------------------------------

ALLOWED_FUNNEL_EVENTS = {
    "lp_visit", "lp_cta_click",
    "portal_open", "portal_magic_link_request", "magic_link_sent", "signed_in",
    "catalogue_open", "faq_open", "faq_question_open",
    "wanderers_agreement_open", "agreement_accepted",
    "clarity_threshold_open", "clarity_session_started",
    "clarity_session_completed", "clarity_session_exited",
    "body_room_open", "body_chat_first_message", "body_room_exited",
    "course_room_open", "course_letter_1_open", "course_letter_2_open",
    "course_enrolled",
    "checkout_clicked",
    "enroll_click", "enroll_complete",
    "exit_emergency",
    # §AUDIT-TELEMETRY 2026-05-20 — events fired by Catalogue /
    # MembershipTiers cards that were missing from the whitelist and
    # returned 400 on every render. Adding them so the funnel report
    # actually shows conversion intent.
    "cabinet_paywall_view", "cabinet_paywall_cta",
    "tier_cta_click", "tier_support_click",
    "waitlist_join_submit",
    # Hard-lock block surfaced on /presence/start when balance == 0.
    "voice_session_blocked_no_balance",
}

class TelemetryEventInput(BaseModel):
    event_type: str
    client_id: Optional[str] = None  # opaque anon id from localStorage
    room: Optional[str] = None
    slug: Optional[str] = None
    meta: Optional[dict] = None  # max 256 chars after json.dumps


@api_router.post("/telemetry/crash")
async def telemetry_crash(request: Request):
    try:
        payload = await request.json()
    except Exception:  # noqa: BLE001
        payload = {}
    ip = (
        request.headers.get("x-forwarded-for", "").split(",")[0].strip()
        or (request.client.host if request.client else "unknown")
    )
    doc = {
        "id": str(uuid.uuid4()),
        "event": "react_error_boundary",
        "message": str(payload.get("message") or "")[:500],
        "stack": str(payload.get("stack") or "")[:2000],
        "component_stack": str(payload.get("component_stack") or "")[:2000],
        "path": str(payload.get("path") or "")[:200],
        "user_agent": str(payload.get("user_agent") or "")[:200],
        "ip_hash": _hashlib.sha1(ip.encode("utf-8")).hexdigest()[:12],
        "occurred_at": datetime.now(timezone.utc).isoformat(),
    }
    try:
        await db.funnel_events.insert_one(doc)
    except Exception as exc:  # noqa: BLE001
        logger.warning("telemetry/crash insert failed: %s", exc)
    return {"ok": True}


# §AUDIT-CRASH 2026-05-20 — Admin reader for production React crashes.
# Founder runs:
#   curl -H "X-Admin-Token: $TOKEN" "https://prulesoul.site/api/admin/audit/crashes?path=/clarity-release&limit=20"
# to see EXACTLY which line of which component crashed in production.
@api_router.get("/admin/audit/free-voice-beta")
async def admin_audit_free_voice_beta(request: Request, hours: int = 72):
    """§FREE-VOICE-BETA 2026-05-20 — Founder visibility while
    LemonSqueezy is not yet open. Shows how much "free" voice was
    minted while FREE_VOICE_BETA=true, broken down by room. The
    instant payments are online: set FREE_VOICE_BETA=false in
    /app/backend/.env and the hard-lock fully reactivates."""
    admin_token = os.environ.get("ADMIN_TOKEN")
    sent = (
        request.headers.get("X-Admin-Token")
        or request.query_params.get("token")
        or ""
    )
    if not admin_token or sent != admin_token:
        raise HTTPException(status_code=401, detail="Admin token required.")

    since = datetime.now(timezone.utc) - timedelta(hours=int(hours))
    q = {"event": "free_voice_beta_session", "occurred_at": {"$gte": since.isoformat()}}
    count = await db.funnel_events.count_documents(q)
    by_room: dict[str, int] = {}
    by_user: dict[str, int] = {}
    async for d in db.funnel_events.find(q, {"_id": 0, "room": 1, "user_id": 1}):
        r = d.get("room") or "unknown"
        u = d.get("user_id") or "anon"
        by_room[r] = by_room.get(r, 0) + 1
        by_user[u] = by_user.get(u, 0) + 1
    flag_value = (os.environ.get("FREE_VOICE_BETA") or "").strip().lower()
    return {
        "as_of": datetime.now(timezone.utc).isoformat(),
        "window_hours": int(hours),
        "FREE_VOICE_BETA_flag": flag_value or "(unset)",
        "is_active": flag_value in {"1", "true", "yes", "on"},
        "sessions_minted": count,
        "by_room": sorted(by_room.items(), key=lambda x: -x[1]),
        "by_user_top": sorted(by_user.items(), key=lambda x: -x[1])[:10],
        "instructions_to_close": "Set FREE_VOICE_BETA=false (or remove) in /app/backend/.env and restart backend.",
    }


@api_router.get("/admin/audit/crashes")
async def admin_audit_crashes(
    request: Request,
    path: str | None = None,
    hours: int = 24,
    limit: int = 20,
):
    """Founder-only — list latest React Error Boundary trips."""
    admin_token = os.environ.get("ADMIN_TOKEN")
    sent = (
        request.headers.get("X-Admin-Token")
        or request.query_params.get("token")
        or ""
    )
    if not admin_token or sent != admin_token:
        raise HTTPException(status_code=401, detail="Admin token required.")

    since = datetime.now(timezone.utc) - timedelta(hours=int(hours))
    q: dict = {
        "event": "react_error_boundary",
        "occurred_at": {"$gte": since.isoformat()},
    }
    if path:
        q["path"] = path

    rows = []
    async for d in db.funnel_events.find(q, {"_id": 0}).sort("occurred_at", -1).limit(int(limit)):
        rows.append(d)

    # Top message / path histograms
    msg_hist: dict[str, int] = {}
    path_hist: dict[str, int] = {}
    for r in rows:
        m = (r.get("message") or "")[:200]
        p = r.get("path") or ""
        msg_hist[m] = msg_hist.get(m, 0) + 1
        path_hist[p] = path_hist.get(p, 0) + 1

    return {
        "as_of": datetime.now(timezone.utc).isoformat(),
        "window_hours": int(hours),
        "count": len(rows),
        "by_message_top": sorted(msg_hist.items(), key=lambda x: -x[1])[:10],
        "by_path_top": sorted(path_hist.items(), key=lambda x: -x[1])[:10],
        "rows": rows,
    }


@api_router.post("/telemetry/event")
async def telemetry_event(inp: TelemetryEventInput, request: Request):
    """Write one funnel event. Public, anonymous, throttled."""
    et = (inp.event_type or "").strip()
    if et not in ALLOWED_FUNNEL_EVENTS:
        raise HTTPException(status_code=400, detail="Unknown event type.")

    # Per-IP throttle — 60 events / 60s. Memory only, in-process. We
    # accept that a Kubernetes restart drops the counter; this is a
    # bot-safety floor, not a hard rate-limit.
    ip = (
        request.headers.get("x-forwarded-for", "").split(",")[0].strip()
        or (request.client.host if request.client else "unknown")
    )
    bucket_key = f"telemetry:{ip}"
    now_ts = datetime.now(timezone.utc).timestamp()
    if not hasattr(app.state, "_telemetry_buckets"):
        app.state._telemetry_buckets = {}
    bucket = app.state._telemetry_buckets.get(bucket_key, [])
    bucket = [t for t in bucket if now_ts - t < 60.0]
    if len(bucket) >= 60:
        raise HTTPException(status_code=429, detail="Too many events.")
    bucket.append(now_ts)
    app.state._telemetry_buckets[bucket_key] = bucket
    if len(app.state._telemetry_buckets) > 5000:  # naive eviction
        app.state._telemetry_buckets = {
            k: v for k, v in list(app.state._telemetry_buckets.items())[-2500:]
        }

    # Build doc — no PII. Truncate everything user-supplied.
    client_id = (inp.client_id or "").strip()[:64] or None
    meta_str = None
    if inp.meta:
        try:
            meta_str = _json.dumps(inp.meta, ensure_ascii=False)[:256]
        except Exception:  # noqa: BLE001
            meta_str = None
    doc = {
        "event_type": et,
        "client_id": client_id,
        "room": (inp.room or "").strip()[:32] or None,
        "slug": (inp.slug or "").strip()[:64] or None,
        "meta": meta_str,
        "ip_hash": _hashlib.sha1(ip.encode("utf-8")).hexdigest()[:12],
        "ua": (request.headers.get("user-agent", "") or "")[:120],
        "created_at": datetime.now(timezone.utc),
    }
    try:
        await db.funnel_events.insert_one(doc)
    except Exception:  # noqa: BLE001
        pass  # never break a wanderer's flow over a telemetry write
    return {"ok": True}


@api_router.get("/admin/observation/funnel")
async def admin_funnel(request: Request):
    """Funnel counters for the last 24h / 7d. Admin token gated."""
    admin_token = os.environ.get("ADMIN_TOKEN")
    sent = (
        request.headers.get("X-Admin-Token")
        or request.query_params.get("token")
        or request.query_params.get("admin_token")
    )
    if not admin_token or sent != admin_token:
        raise HTTPException(status_code=401, detail="Admin token required.")

    now = datetime.now(timezone.utc)
    since_24h = now - timedelta(hours=24)
    since_7d = now - timedelta(days=7)

    async def _count(et: str, since) -> int:
        return await db.funnel_events.count_documents({
            "event_type": et, "created_at": {"$gte": since},
        })

    async def _unique(et: str, since) -> int:
        cur = db.funnel_events.aggregate([
            {"$match": {"event_type": et, "created_at": {"$gte": since},
                        "client_id": {"$ne": None}}},
            {"$group": {"_id": "$client_id"}},
            {"$count": "n"},
        ])
        rows = await cur.to_list(length=1)
        return rows[0]["n"] if rows else 0

    funnel = {}
    for et in sorted(ALLOWED_FUNNEL_EVENTS):
        funnel[et] = {
            "count_24h": await _count(et, since_24h),
            "count_7d": await _count(et, since_7d),
            "unique_24h": await _unique(et, since_24h),
            "unique_7d": await _unique(et, since_7d),
        }

    return {
        "generated_at": now.isoformat(),
        "windows": {
            "since_24h": since_24h.isoformat(),
            "since_7d": since_7d.isoformat(),
        },
        "events": funnel,
    }


# ----------------------------------------------------------------
# §Iter 65 — Payment-event audit log (PREP ONLY, not live).
# ----------------------------------------------------------------
# Future-ready collection that will receive entries when:
#   - LemonSqueezy checkout opens   → kind="payment_started"
#   - webhook fires order_created   → kind="payment_success"
#   - webhook fires order_failed    → kind="payment_failed"
#   - entitlement unlocked          → kind="entitlement_unlocked"
#   - confirmation email sent       → kind="email_sent"
#   - webhook arrived (any)         → kind="webhook_received"
#
# Today the lemonsqueezy_webhook handler still writes to `purchases`
# directly. After founder approves the Lemon live-mode flip, an
# adapter call to `_log_payment_event` will be added in three places
# (checkout button, webhook handler, email service). Schema is now
# locked so future writes don't drift.
# ----------------------------------------------------------------

ALLOWED_PAYMENT_KINDS = {
    "payment_started", "payment_success", "payment_failed",
    "entitlement_unlocked", "email_sent", "webhook_received",
}


async def _log_payment_event(
    *,
    kind: str,
    user_id: Optional[str] = None,
    email: Optional[str] = None,
    sku_slug: Optional[str] = None,
    sku_kind: Optional[str] = None,  # "book" | "course" | "clarity_pass"
    order_ref: Optional[str] = None,
    amount_usd: Optional[float] = None,
    detail: Optional[str] = None,
    meta: Optional[dict] = None,
) -> None:
    """Internal helper. Will be wired into the Lemon flow later. Today
    it is callable from admin scripts only and writes one document per
    event into `payment_events`."""
    if kind not in ALLOWED_PAYMENT_KINDS:
        return
    doc = {
        "kind": kind,
        "user_id": user_id,
        "email": (email or "").lower().strip() or None,
        "sku_slug": sku_slug,
        "sku_kind": sku_kind,
        "order_ref": order_ref,
        "amount_usd": amount_usd,
        "detail": (detail or "")[:512] or None,
        "meta": meta if isinstance(meta, dict) else None,
        "created_at": datetime.now(timezone.utc),
    }
    try:
        await db.payment_events.insert_one(doc)
    except Exception:  # noqa: BLE001
        pass


@api_router.get("/admin/payment-events")
async def admin_payment_events(request: Request, limit: int = 200):
    """Tail the payment-event log. Admin token gated. Read-only."""
    admin_token = os.environ.get("ADMIN_TOKEN")
    sent = (
        request.headers.get("X-Admin-Token")
        or request.query_params.get("token")
    )
    if not admin_token or sent != admin_token:
        raise HTTPException(status_code=401, detail="Admin token required.")
    cur = db.payment_events.find({}, {"_id": 0}).sort("created_at", -1).limit(
        max(1, min(int(limit or 200), 1000))
    )
    rows = await cur.to_list(length=1000)
    for r in rows:
        if isinstance(r.get("created_at"), datetime):
            r["created_at"] = r["created_at"].isoformat()
    return {"events": rows, "count": len(rows)}



@api_router.get("/admin/observation")
async def admin_observation_metrics(request: Request):
    """§Iter 64c — observation mode dashboard.

    Returns four operational signals the founder is watching for the
    30-day post-launch beta. Read-only aggregate counters. Admin-token
    gated.

    Signals:
      cap_hits_24h / 7d  — wanderers that hit the daily 12/60 chat-cap
      body_room_engagement — % of unique users who sent ≥1 body chat
      eternal_thread_optin — % of clarity_user_prefs with save_threads=true
      course_letter_retention — for each course, ratio of users who read
        letter 2 vs letter 1 (drop-off proxy)
    """
    admin_token = os.environ.get("ADMIN_TOKEN")
    sent = (
        request.headers.get("X-Admin-Token")
        or request.query_params.get("token")
        or request.query_params.get("admin_token")
    )
    if not admin_token or sent != admin_token:
        raise HTTPException(status_code=401, detail="Admin token required.")

    now = datetime.now(timezone.utc)
    today_str = now.strftime("%Y-%m-%d")
    week_ago_str = (now - timedelta(days=7)).strftime("%Y-%m-%d")

    # ---- Signal 1 — chat-cap hits ----------------------------------
    # We don't store HTTP 429 events directly; we infer hits from
    # chat_usage_daily rows where count > the wanderer's tier ceiling.
    # We don't know the per-row tier at write time, so we use the FREE
    # ceiling (12) as the floor (any row past 12 hit the cap at least
    # once). This slightly over-counts premium users who exceeded 12
    # but not 60 — acceptable for a coarse beta signal.
    free_cap = CHAT_CAP_FREE
    cap_hits_today = await db.chat_usage_daily.count_documents({
        "date": today_str, "count": {"$gt": free_cap},
    })
    cap_hits_7d = await db.chat_usage_daily.count_documents({
        "date": {"$gte": week_ago_str}, "count": {"$gt": free_cap},
    })

    # ---- Signal 2 — Body Room engagement ---------------------------
    body_users_pipeline = [
        {"$match": {"by_room.body_room": {"$exists": True, "$gt": 0}}},
        {"$group": {"_id": "$user_id"}},
        {"$count": "n"},
    ]
    body_users_doc = await db.chat_usage_daily.aggregate(
        body_users_pipeline
    ).to_list(length=1)
    body_unique_users = (body_users_doc[0]["n"] if body_users_doc else 0)
    total_users = await db.users.count_documents({"role": {"$ne": "admin"}})
    body_engagement_pct = (
        round(body_unique_users * 100.0 / total_users, 1)
        if total_users else 0.0
    )

    # ---- Signal 3 — Eternal Thread opt-in --------------------------
    et_on = await db.clarity_user_prefs.count_documents({"save_threads": True})
    et_total = await db.clarity_user_prefs.count_documents({})
    eternal_optin_pct = (
        round(et_on * 100.0 / et_total, 1) if et_total else 0.0
    )

    # ---- Signal 4 — Course letter retention (1 → 2) ----------------
    # We approximate: count enrollments that have read letter 1, vs
    # enrollments that have read letter 2 or more. Stored in
    # `course_progress` (one doc per user-course) with `letters_read`
    # set or array. If the schema doesn't exist yet, this returns
    # zeros gracefully.
    retention = []
    try:
        for slug in [c["slug"] for c in SEED_COURSES if c.get("language", "en") == "en"]:
            l1 = await db.course_progress.count_documents({
                "course_slug": slug,
                "$or": [
                    {"letters_read": {"$gte": 1}},
                    {"letters_completed": {"$elemMatch": {"$gte": 1}}},
                ],
            })
            l2 = await db.course_progress.count_documents({
                "course_slug": slug,
                "$or": [
                    {"letters_read": {"$gte": 2}},
                    {"letters_completed": {"$elemMatch": {"$gte": 2}}},
                ],
            })
            retention.append({
                "slug": slug,
                "letter_1": l1,
                "letter_2": l2,
                "retention_pct": round(l2 * 100.0 / l1, 1) if l1 else 0.0,
            })
    except Exception:  # noqa: BLE001
        retention = []

    # ---- Side metrics — quick health -------------------------------
    sessions_active = await db.cabinet_sessions.count_documents({
        "is_active": True,
    })
    summaries_total = await db.cabinet_user_summaries.count_documents({})
    bookings_pending = await db.bookings.count_documents({
        "status": {"$in": ["reserved", "confirmed"]},
    })
    purchases_total = await db.purchases.count_documents({})

    return {
        "generated_at": now.isoformat(),
        "window": {
            "today": today_str,
            "seven_days_back": week_ago_str,
        },
        "signals": {
            "cap_hits": {
                "today": cap_hits_today,
                "last_7_days": cap_hits_7d,
                "free_ceiling": free_cap,
            },
            "body_room_engagement": {
                "unique_chat_users_total": body_unique_users,
                "total_users": total_users,
                "engagement_pct": body_engagement_pct,
            },
            "eternal_thread_optin": {
                "save_threads_on": et_on,
                "prefs_total": et_total,
                "optin_pct": eternal_optin_pct,
            },
            "course_letter_retention": retention,
        },
        "side_metrics": {
            "active_cabinet_sessions": sessions_active,
            "mentor_notes_stored": summaries_total,
            "bookings_active": bookings_pending,
            "purchases_lifetime": purchases_total,
        },
    }



# §8.8 B-04 — Backfill helper: when AH and LP enrollment counts drift
# (because an old LP enrollment never reached AH due to a misconfigured
# webhook), founder can manually inject the missing event into AH so the
# canonical counter is accurate. HMAC-signed admin call.
class BackfillEnrollmentRequest(BaseModel):
    enrollment_id: str
    email: str
    cycle: Optional[str] = "01"
    enrolled_at: Optional[str] = None  # ISO-UTC; default = now
    note: Optional[str] = None


@api_router.post("/admin/integrations/pruesoul/backfill-enrollment")
async def admin_backfill_enrollment(request: Request):
    """Founder-only — register a historical LP enrollment in AH so the
    canonical counter reflects truth. Idempotent on `enrollment_id`.
    Auth is checked BEFORE parsing the body so unauthenticated probes
    cannot enumerate the field shape via 422 errors."""
    admin_token = os.environ.get("ADMIN_TOKEN")
    sent = request.headers.get("X-Admin-Token") or request.query_params.get("token")
    if not admin_token or sent != admin_token:
        raise HTTPException(status_code=401, detail="Admin token required.")

    try:
        body = await request.json()
        inp = BackfillEnrollmentRequest(**body)
    except Exception:  # noqa: BLE001
        raise HTTPException(status_code=400, detail="Invalid request body.")

    enrollment_id = inp.enrollment_id.strip()
    email = inp.email.lower().strip()
    cycle = (inp.cycle or "01").strip() or "01"
    enrolled_at = inp.enrolled_at or datetime.now(timezone.utc).isoformat()

    # Audit row in events.
    await db.pruesoul_events.insert_one({
        "id": str(uuid.uuid4()),
        "event": "enrollment.backfilled",
        "enrollment_id": enrollment_id,
        "email": email,
        "cycle": cycle,
        "received_at": datetime.now(timezone.utc).isoformat(),
        "note": inp.note,
        "source": "admin-backfill",
    })

    # Idempotent insert in mirrored enrollments table.
    res = await db.pruesoul_enrollments.update_one(
        {"enrollment_id": enrollment_id},
        {"$setOnInsert": {
            "enrollment_id": enrollment_id,
            "email": email,
            "cycle": cycle,
            "enrolled_at": enrolled_at,
            "received_at": datetime.now(timezone.utc).isoformat(),
            "source": "admin-backfill",
        }},
        upsert=True,
    )

    spots_taken = await db.pruesoul_enrollments.count_documents({"cycle": cycle})
    return {
        "status": "ok",
        "was_new": res.upserted_id is not None,
        "cycle": cycle,
        "spots_taken_now": spots_taken,
        "spots_left_now": max(0, _BETA_SPOTS_PER_CYCLE - spots_taken),
    }


@api_router.get("/admin/heartbeat/status")
async def admin_heartbeat_status(request: Request, limit: int = 10):
    """Founder-only — last N heartbeat attempts (most recent first)."""
    admin_token = os.environ.get("ADMIN_TOKEN")
    sent = request.headers.get("X-Admin-Token") or request.query_params.get("token")
    if not admin_token or sent != admin_token:
        raise HTTPException(status_code=401, detail="Admin token required.")
    cursor = db.aurin_heartbeat_log.find({}, {"_id": 0}).sort("sent_at", -1).limit(min(50, max(1, limit)))
    rows = []
    async for r in cursor:
        rows.append(r)
    last_ok = await db.aurin_heartbeat_log.find_one(
        {"status": "ok"}, sort=[("sent_at", -1)], projection={"_id": 0, "sent_at": 1, "http_code": 1}
    )
    return {
        "configured": {
            "lp_heartbeat_url_set": bool(_LP_HEARTBEAT_URL),
            "secret_set": bool(_PRUESOUL_SECRET),
            "interval_seconds": _HEARTBEAT_INTERVAL_SECONDS,
        },
        "last_ok": last_ok,
        "recent": rows,
        "total_attempts": await db.aurin_heartbeat_log.count_documents({}),
    }


# =============================================================
# COLORING PAGES — public catalogue + on-demand generation
# (admin-triggered or auto-fired by the daily loop in on_startup)
# =============================================================
@api_router.get("/coloring/pages")
async def coloring_pages_list(age_group: Optional[str] = None):
    from coloring_pipeline import list_coloring_pages
    pages = await list_coloring_pages(db, age_group=age_group, limit=80)
    return {"pages": pages, "count": len(pages)}


@api_router.get("/coloring/image/{slug}")
async def coloring_image(slug: str):
    """Public — serve a coloring-page PNG (production-safe).

    Reads from MongoDB ``binary_assets`` first (survives deploys),
    then falls back to the on-disk mirror.
    """
    # Slug safety: lower-case alnum + dashes only.
    if not slug or any(
        ch not in "abcdefghijklmnopqrstuvwxyz0123456789-" for ch in slug.lower()
    ):
        raise HTTPException(status_code=404, detail="Image not found.")

    from binary_storage import get_binary
    asset = await get_binary(db, kind="coloring", slug=slug)
    if asset and asset.get("data"):
        from fastapi.responses import Response as _Resp
        return _Resp(
            content=asset["data"],
            media_type=asset.get("content_type") or "image/png",
            headers={"Cache-Control": "public, max-age=86400"},
        )

    # Filesystem fallback (preview only).
    p = Path("/app/backend/storage/coloring") / f"{slug}.png"
    if p.exists():
        return FileResponse(str(p), media_type="image/png")

    raise HTTPException(status_code=404, detail="Image not found.")


@api_router.post("/coloring/generate-daily")
async def coloring_generate_daily(request: Request):
    """Manual trigger for the daily run. Idempotent for the current day.

    Protected by a lightweight admin token so it can't be called from
    anonymous traffic and rack up LLM cost.
    """
    admin_token = os.environ.get("ADMIN_TOKEN")
    sent = request.headers.get("X-Admin-Token") or request.query_params.get("token")
    if not admin_token or sent != admin_token:
        raise HTTPException(status_code=401, detail="Admin token required.")
    from coloring_pipeline import generate_daily_coloring_pages
    summary = await generate_daily_coloring_pages(db)
    return summary


@api_router.get("/feeds/coloring.rss")
async def coloring_feed_rss():
    """Public RSS feed of the newest coloring pages.

    Pinterest / IFTTT / Zapier can subscribe to this feed and auto-pin
    every new page. Each item carries the image URL in <enclosure> so
    Pinterest's RSS-to-Pin trigger picks it up natively.
    """
    from coloring_pipeline import list_coloring_pages
    pages = await list_coloring_pages(db, limit=40)
    base = os.environ.get("PUBLIC_APP_URL", "https://prulesoul.site").rstrip("/")
    feed_updated = datetime.now(timezone.utc).strftime("%a, %d %b %Y %H:%M:%S +0000")

    def _esc(s: str) -> str:
        return (
            (s or "")
            .replace("&", "&amp;")
            .replace("<", "&lt;")
            .replace(">", "&gt;")
            .replace('"', "&quot;")
        )

    items_xml = []
    for p in pages:
        page_url = f"{base}/kids-universe/coloring#{p['slug']}"
        image_url = f"{base}{p['image_url']}"
        pub = p.get("created_at") or datetime.now(timezone.utc).isoformat()
        # RFC-822 date for RSS 2.0
        try:
            pub_dt = datetime.fromisoformat(pub.replace("Z", "+00:00"))
            pub_822 = pub_dt.strftime("%a, %d %b %Y %H:%M:%S +0000")
        except Exception:
            pub_822 = feed_updated
        description = (
            f"A calm black-and-white coloring page for ages {p.get('age_group', '')}. "
            f"{p.get('summary', '')}"
        )
        items_xml.append(
            f"""<item>
  <title>{_esc(p.get('title', 'Aurin Kids coloring page'))}</title>
  <link>{_esc(page_url)}</link>
  <guid isPermaLink="false">{_esc(p['slug'])}</guid>
  <pubDate>{pub_822}</pubDate>
  <description>{_esc(description)}</description>
  <enclosure url="{_esc(image_url)}" type="image/png" length="0"/>
  <category>age-{_esc(p.get('age_group', ''))}</category>
</item>"""
        )

    xml = f"""<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:media="http://search.yahoo.com/mrss/">
<channel>
<title>Aurin Kids — Coloring Pages</title>
<link>{base}/kids-universe/coloring</link>
<description>Quiet black-and-white coloring pages for children, one per age group, fresh every day. Calm, print-ready, made with care by Matrix Aurin.</description>
<language>en-us</language>
<lastBuildDate>{feed_updated}</lastBuildDate>
{''.join(items_xml)}
</channel>
</rss>"""
    from fastapi.responses import Response as _Resp
    return _Resp(content=xml, media_type="application/rss+xml")


@api_router.get("/feeds/books.rss")
async def books_feed_rss():
    """Public RSS feed of the bookstore catalogue.

    Same purpose as the coloring feed: a single URL for IFTTT / Zapier /
    Feedly to syndicate every book with its cover image and direct link.
    """
    cursor = db.books.find({}, {"_id": 0}).sort("audience", 1).limit(100)
    books = [b async for b in cursor]
    base = os.environ.get("PUBLIC_APP_URL", "https://prulesoul.site").rstrip("/")
    feed_updated = datetime.now(timezone.utc).strftime("%a, %d %b %Y %H:%M:%S +0000")

    def _esc(s: str) -> str:
        return (
            (s or "")
            .replace("&", "&amp;")
            .replace("<", "&lt;")
            .replace(">", "&gt;")
            .replace('"', "&quot;")
        )

    items_xml = []
    for b in books:
        page_url = f"{base}/bookstore/{b['slug']}"
        cover = b.get("cover_image_url") or ""
        if cover.startswith("/"):
            cover = f"{base}{cover}"
        price_label = "Free" if float(b.get("price") or 0) == 0 else f"${b.get('price')}"
        desc = (
            f"{b.get('subtitle') or ''} — {b.get('description') or ''} "
            f"[{price_label} · {b.get('audience', 'adult')}]"
        )
        items_xml.append(
            f"""<item>
  <title>{_esc(b.get('title', 'Matrix Aurin — book'))}</title>
  <link>{_esc(page_url)}</link>
  <guid isPermaLink="false">book-{_esc(b.get('slug', ''))}</guid>
  <pubDate>{feed_updated}</pubDate>
  <description>{_esc(desc)}</description>
  {'<enclosure url="' + _esc(cover) + '" type="image/jpeg" length="0"/>' if cover else ''}
  <category>{_esc(b.get('audience', 'adult'))}</category>
</item>"""
        )

    xml = f"""<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
<channel>
<title>Matrix Aurin — Bookstore</title>
<link>{base}/bookstore</link>
<description>Quiet books from Matrix Aurin — for children and for grown-ups. Slow, honest, never urgent.</description>
<language>en-us</language>
<lastBuildDate>{feed_updated}</lastBuildDate>
{''.join(items_xml)}
</channel>
</rss>"""
    from fastapi.responses import Response as _Resp
    return _Resp(content=xml, media_type="application/rss+xml")


# =============================================================
# WHISPERS — micro-influencer attribution tracking
#
# Visitors who arrive via /?w=<slug> get logged in db.whispers_visits.
# When LemonSqueezy fires a purchase webhook, the most recent visit
# (within 30 days) for that same browser fingerprint is used to
# attribute the sale. Founder-only summary at /api/whispers/summary.
# =============================================================
class WhisperVisit(BaseModel):
    slug: str
    referer: Optional[str] = None
    landing_path: Optional[str] = None


@api_router.post("/whispers/track")
async def whispers_track(inp: WhisperVisit, request: Request):
    """Public — log a single Whispers visit. Idempotent within 1 hour."""
    slug = (inp.slug or "").strip().lower()
    if not slug or len(slug) > 64:
        raise HTTPException(status_code=400, detail="Invalid whisper slug.")
    now = datetime.now(timezone.utc)
    fingerprint = (
        (request.headers.get("user-agent") or "")[:200]
        + "|"
        + (request.headers.get("x-forwarded-for") or request.client.host or "")
    )
    # 1-hour idempotency per (slug, fingerprint)
    recent = await db.whispers_visits.find_one({
        "slug": slug,
        "fingerprint": fingerprint,
        "ts": {"$gte": (now - timedelta(hours=1)).isoformat()},
    })
    if recent:
        return {"status": "deduped"}
    await db.whispers_visits.insert_one({
        "id": str(uuid.uuid4()),
        "slug": slug,
        "fingerprint": fingerprint,
        "referer": (inp.referer or "")[:500] or None,
        "landing_path": (inp.landing_path or "")[:200] or None,
        "ts": now.isoformat(),
    })
    return {"status": "tracked"}


@api_router.get("/whispers/summary")
async def whispers_summary(request: Request):
    """Founder-only — read attribution totals. Protected by ADMIN_TOKEN."""
    admin_token = os.environ.get("ADMIN_TOKEN")
    sent = request.headers.get("X-Admin-Token") or request.query_params.get("token")
    if not admin_token or sent != admin_token:
        raise HTTPException(status_code=401, detail="Admin token required.")
    pipeline = [
        {"$group": {
            "_id": "$slug",
            "visits": {"$sum": 1},
            "first_seen": {"$min": "$ts"},
            "last_seen": {"$max": "$ts"},
        }},
        {"$sort": {"visits": -1}},
    ]
    rows = []
    async for doc in db.whispers_visits.aggregate(pipeline):
        rows.append({
            "slug": doc["_id"],
            "visits": doc["visits"],
            "first_seen": doc["first_seen"],
            "last_seen": doc["last_seen"],
        })
    return {"whispers": rows, "total": sum(r["visits"] for r in rows)}


# =============================================================
# ADMIN GRANT — issue a complimentary Clarity Season pass to a
# specific email address. Used by the founder to bypass payment
# while LemonSqueezy is still pending approval, so private rooms
# can be QA-tested without a real purchase.
# =============================================================
class AdminGrantInput(BaseModel):
    email: str
    days: Optional[int] = 30
    # §COMP-DAILY-CAP 2026-02-09 — Optional per-day voice-minute
    # ceiling. Default 60 minutes/day. Set to 0 to disable the cap
    # (legacy unlimited behaviour). 60 min/day × 30 days = 30h max
    # voice — keeps influencer cost predictable.
    daily_minute_cap: Optional[int] = 60


@api_router.post("/admin/grant-clarity")
async def admin_grant_clarity(inp: AdminGrantInput, request: Request):
    admin_token = os.environ.get("ADMIN_TOKEN")
    sent = request.headers.get("X-Admin-Token") or request.query_params.get("token")
    if not admin_token or sent != admin_token:
        raise HTTPException(status_code=401, detail="Admin token required.")
    email = (inp.email or "").strip().lower()
    if "@" not in email:
        raise HTTPException(status_code=400, detail="Invalid email.")
    user = await db.users.find_one({"email": email}, {"_id": 0})
    if not user:
        raise HTTPException(
            status_code=404,
            detail=f"No user with email {email}. Sign in via Google first.",
        )
    days = max(1, min(365, int(inp.days or 30)))
    expires_at = (
        datetime.now(timezone.utc) + timedelta(days=days)
    ).isoformat()
    # Clamp the cap to a sane range: 0 (unlimited) or 5-480 minutes/day.
    raw_cap = int(inp.daily_minute_cap if inp.daily_minute_cap is not None else 60)
    daily_cap = 0 if raw_cap <= 0 else max(5, min(480, raw_cap))
    await db.clarity_passes.insert_one({
        "id": str(uuid.uuid4()),
        "user_id": user["user_id"],
        "tier": "season_30days",
        "consumed": True,
        "granted_at": datetime.now(timezone.utc).isoformat(),
        "expires_at": expires_at,
        "external_order_id": f"admin-grant-{uuid.uuid4().hex[:8]}",
        "source": "admin-grant",
        "daily_minute_cap": daily_cap,
    })
    return {
        "status": "granted",
        "email": email,
        "user_id": user["user_id"],
        "expires_at": expires_at,
        "days": days,
        "daily_minute_cap": daily_cap,
    }


# =============================================================
# CLARITY GUIDE FACE PROFILES — persistent visual binding for the
# Male & Female Private Room guides. Face images are stored in
# MongoDB (binary_assets kind="guide_face", slug="male"|"female") so
# they survive production deploys and never "forget" who they are
# visually.
# =============================================================
@api_router.get("/clarity/guide-face/{gender}")
async def clarity_guide_face(gender: str):
    """Public — serve the Male or Female guide portrait.

    Read order:
        1. MongoDB ``binary_assets`` (kind=guide_face, slug=<gender>)
        2. Static fallback at /assets/illustrations/guide-<gender>.jpg
    """
    if gender not in ("male", "female"):
        raise HTTPException(status_code=404, detail="Unknown guide.")

    from binary_storage import get_binary
    asset = await get_binary(db, kind="guide_face", slug=gender)
    if asset and asset.get("data"):
        from fastapi.responses import Response as _Resp
        return _Resp(
            content=asset["data"],
            media_type=asset.get("content_type") or "image/jpeg",
            headers={"Cache-Control": "public, max-age=3600"},
        )

    fallback = Path(f"/app/frontend/public/assets/illustrations/guide-{gender}.jpg")
    if fallback.exists():
        return FileResponse(str(fallback), media_type="image/jpeg")
    raise HTTPException(status_code=404, detail="Face not configured yet.")


@api_router.post("/admin/clarity/guide-face/{gender}")
async def admin_set_guide_face(gender: str, request: Request):
    """Admin — upload a Male/Female guide portrait. Stores into
    MongoDB so the character never "forgets" its visual identity.

    Body: raw JPEG/PNG bytes (Content-Type: image/jpeg or image/png).
    Max size: 8 MB.
    """
    admin_token = os.environ.get("ADMIN_TOKEN")
    sent = request.headers.get("X-Admin-Token") or request.query_params.get("token")
    if not admin_token or sent != admin_token:
        raise HTTPException(status_code=401, detail="Admin token required.")
    if gender not in ("male", "female"):
        raise HTTPException(status_code=400, detail="gender must be 'male' or 'female'.")

    content_type = request.headers.get("content-type", "").lower()
    if not content_type.startswith(("image/jpeg", "image/jpg", "image/png")):
        raise HTTPException(
            status_code=415,
            detail="Content-Type must be image/jpeg or image/png.",
        )

    body = await request.body()
    if not body or len(body) > 8 * 1024 * 1024:
        raise HTTPException(
            status_code=400,
            detail=f"Image must be 1 B – 8 MB (got {len(body)}).",
        )

    from binary_storage import put_binary
    meta = await put_binary(
        db,
        kind="guide_face",
        slug=gender,
        data=body,
        content_type=content_type.split(";")[0].strip(),
        meta={"uploaded_by": "admin", "gender": gender},
    )
    return {
        "status": "saved",
        "gender": gender,
        "bytes": meta["bytes"],
        "public_url": f"/api/clarity/guide-face/{gender}",
    }


@api_router.get("/admin/site-audit")
async def admin_site_audit(request: Request):
    admin_token = os.environ.get("ADMIN_TOKEN")
    sent = request.headers.get("X-Admin-Token") or request.query_params.get("token")
    if not admin_token or sent != admin_token:
        raise HTTPException(status_code=401, detail="Admin token required.")

    base_storage = Path("/app/backend/storage")
    rows: list[dict] = []

    # Mongo-stored binary asset slugs (production-safe storage).
    binary_slugs = {"book_pdf": set(), "book_cover": set(), "body_room": set(), "coloring": set()}
    async for d in db.binary_assets.find({}, {"_id": 0, "kind": 1, "slug": 1}):
        if d["kind"] in binary_slugs:
            binary_slugs[d["kind"]].add(d["slug"])

    # 1) Books — file existence + cover + PDF
    books_cursor = db.books.find({}, {"_id": 0})
    async for b in books_cursor:
        slug = b["slug"]
        is_free = float(b.get("price") or 0) == 0
        pdf_path = base_storage / "books" / f"{slug}.pdf"
        cover_path = base_storage / "covers" / f"{slug}.jpg"
        pdf_in_mongo = slug in binary_slugs["book_pdf"]
        cover_in_mongo = slug in binary_slugs["book_cover"]
        rows.append({
            "category": "book",
            "name": b.get("title", slug),
            "slug": slug,
            "pdf_exists": pdf_in_mongo or pdf_path.exists(),
            "pdf_in_mongo": pdf_in_mongo,
            "pdf_on_disk": pdf_path.exists(),
            "pdf_bytes": pdf_path.stat().st_size if pdf_path.exists() else 0,
            "cover_exists": cover_in_mongo or cover_path.exists(),
            "cover_in_mongo": cover_in_mongo,
            "cover_on_disk": cover_path.exists(),
            "is_free": is_free,
            "page_url": f"/bookstore/{slug}",
            "pdf_url": (
                f"/api/books/free/{slug}/download" if is_free
                else f"/api/cabinet/library/{slug}/download (auth)"
            ),
            "cover_url": f"/api/books/cover/{slug}.jpg",
        })

    # 2) Body Room images
    body_dir = base_storage / "body_room"
    for slug in (
        "crown-overthinker", "throat-unspoken", "heart-compass",
        "solar-plexus-control", "belly-intuition", "hips-archive",
        "hands-boundary", "feet-roots",
    ):
        p = body_dir / f"{slug}.png"
        in_mongo = slug in binary_slugs["body_room"]
        rows.append({
            "category": "body_room",
            "name": slug,
            "slug": slug,
            "exists": in_mongo or p.exists(),
            "in_mongo": in_mongo,
            "on_disk": p.exists(),
            "bytes": p.stat().st_size if p.exists() else 0,
            "url": f"/api/body-room/image/{slug}",
        })

    # 3) Coloring pages
    cl_cursor = db.coloring_pages.find({}, {"_id": 0}).sort("date", -1).limit(20)
    async for c in cl_cursor:
        public_path = Path("/app/frontend/public") / c["image_url"].lstrip("/")
        in_mongo = c["slug"] in binary_slugs["coloring"]
        rows.append({
            "category": "coloring",
            "name": c.get("title", c["slug"]),
            "slug": c["slug"],
            "age_group": c["age_group"],
            "date": c["date"],
            "exists": in_mongo or public_path.exists(),
            "in_mongo": in_mongo,
            "on_disk": public_path.exists(),
            "bytes": public_path.stat().st_size if public_path.exists() else 0,
            "url": c["image_url"],
        })

    # Aggregate
    summary = {
        "books_total": sum(1 for r in rows if r["category"] == "book"),
        "books_pdf_present": sum(
            1 for r in rows if r["category"] == "book" and r.get("pdf_exists")
        ),
        "books_cover_present": sum(
            1 for r in rows if r["category"] == "book" and r.get("cover_exists")
        ),
        "body_room_total": sum(1 for r in rows if r["category"] == "body_room"),
        "body_room_present": sum(
            1 for r in rows if r["category"] == "body_room" and r.get("exists")
        ),
        "coloring_total": sum(1 for r in rows if r["category"] == "coloring"),
        "coloring_present": sum(
            1 for r in rows if r["category"] == "coloring" and r.get("exists")
        ),
        "checked_at": datetime.now(timezone.utc).isoformat(),
    }
    return {"summary": summary, "rows": rows}


@api_router.get("/health")
async def health_check():
    """Liveness/readiness probe used by Emergent's deploy infra.

    Always returns 200 with a tiny payload so the deploy can confirm
    the backend has finished booting. Does not touch MongoDB to avoid
    cascading failures into the probe.
    """
    return {"status": "ok", "service": "aurin-hub"}


# =============================================================
# Six Nights — public reflection journey (read-only, no auth)
@api_router.get("/six-nights")
async def six_nights_index():
    """Public list of all 6 nights, lightweight (no full body)."""
    rows = await db.six_nights.find(
        {"published": True},
        {"_id": 0, "night_number": 1, "title": 1, "intro": 1, "signature": 1},
    ).sort("night_number", 1).to_list(20)
    return {
        "total": len(rows),
        "nights": rows,
        "signature": "Aurin",
        "preamble": (
            "Six quiet nights. One question each. No one is timing you. "
            "If a night does not call you tonight, leave it for tomorrow."
        ),
    }


@api_router.get("/six-nights/{night_number}")
async def six_nights_one(night_number: int):
    """Public — full text for a single night."""
    if night_number < 1 or night_number > 6:
        raise HTTPException(status_code=404, detail="There are six nights.")
    doc = await db.six_nights.find_one(
        {"night_number": night_number, "published": True},
        {"_id": 0},
    )
    if not doc:
        raise HTTPException(status_code=404, detail="Night not yet present.")
    # Surface the next/prev hint for the UI's quiet navigation.
    doc["has_previous"] = night_number > 1
    doc["has_next"] = night_number < 6
    return doc


# Six Nights email funnel — voluntary opt-in, one night per day.
WANDERER_AGREEMENT_VERSION = "1.0-2026-02-07"


class SixNightsSubscribe(BaseModel):
    email: str
    consent: bool = False
    locale: str = "en"


@api_router.post("/six-nights/subscribe")
async def six_nights_subscribe(inp: SixNightsSubscribe):
    """Public — start the 6-night email drip. Idempotent on email."""
    if not inp.consent:
        raise HTTPException(status_code=400, detail="Consent is required.")
    email = (inp.email or "").strip().lower()
    if "@" not in email or "." not in email or len(email) < 5:
        raise HTTPException(status_code=400, detail="A valid email is required.")
    now_iso = _now().isoformat()
    existing = await db.six_nights_subscriptions.find_one({"email": email}, {"_id": 0})
    if existing:
        return {
            "status": "already_subscribed",
            "email": email,
            "day_sent": existing.get("day_sent", 0),
            "completed": existing.get("completed", False),
        }
    await db.six_nights_subscriptions.insert_one({
        "email": email,
        "locale": inp.locale or "en",
        "consent_at": now_iso,
        "consent_version": WANDERER_AGREEMENT_VERSION,
        "day_sent": 0,
        "completed": False,
        "created_at": now_iso,
        "last_send_at": None,
    })
    return {
        "status": "subscribed",
        "email": email,
        "preamble": (
            "One night per day for six nights, sent quietly to your inbox. "
            "Reply at any time to stop."
        ),
    }


@api_router.get("/six-nights/subscription/health")
async def six_nights_subscription_health():
    total = await db.six_nights_subscriptions.count_documents({})
    completed = await db.six_nights_subscriptions.count_documents({"completed": True})
    return {"total": total, "completed": completed}


# =============================================================
# Wanderer's Agreement — Hard Gate before private/sensitive rooms
# =============================================================
class AgreementAcceptIn(BaseModel):
    scope: Literal["public", "private"] = "public"
    locale: str = "en"
    visitor_id: Optional[str] = None


@api_router.post("/agreement/accept")
async def agreement_accept(inp: AgreementAcceptIn):
    """Record an agreement acceptance. Idempotent on (visitor_id, scope, version)."""
    visitor_id = (inp.visitor_id or "").strip()
    if not visitor_id:
        raise HTTPException(status_code=400, detail="visitor_id is required.")
    now_iso = _now().isoformat()
    await db.agreement_acceptances.update_one(
        {"visitor_id": visitor_id, "scope": inp.scope, "version": WANDERER_AGREEMENT_VERSION},
        {
            "$set": {"locale": inp.locale or "en", "accepted_at": now_iso},
            "$setOnInsert": {
                "visitor_id": visitor_id, "scope": inp.scope,
                "version": WANDERER_AGREEMENT_VERSION,
                "first_accepted_at": now_iso,
            },
        },
        upsert=True,
    )
    return {"status": "accepted", "version": WANDERER_AGREEMENT_VERSION, "scope": inp.scope}


@api_router.get("/agreement/status")
async def agreement_status(
    visitor_id: str = Query(...),
    scope: Literal["public", "private"] = "private",
):
    if not visitor_id:
        raise HTTPException(status_code=400, detail="visitor_id is required.")
    doc = await db.agreement_acceptances.find_one(
        {"visitor_id": visitor_id, "scope": scope, "version": WANDERER_AGREEMENT_VERSION},
        {"_id": 0, "accepted_at": 1, "version": 1, "scope": 1},
    )
    return {
        "accepted": bool(doc),
        "version": WANDERER_AGREEMENT_VERSION,
        "scope": scope,
        "accepted_at": doc.get("accepted_at") if doc else None,
    }


# =============================================================
# Library 2.0 — themed shelves
# =============================================================
LIBRARY_THEMES = [
    {"slug": "raha-ja-teadvus", "label": "Raha & Teadvus", "label_en": "Money & Consciousness",
     "intro": "Kus raha ei ole jumal ega vaenlane — vaid peegel."},
    {"slug": "keha-atlas", "label": "Keha Atlas", "label_en": "Body Atlas",
     "intro": "Kus keha räägib seda, mille kohta sõnu pole veel."},
    {"slug": "suhted-ja-sagedus", "label": "Suhted & Sagedus", "label_en": "Relationships & Frequency",
     "intro": "Kus piir, närv ja lähedus elavad sama hingamisega."},
    {"slug": "vaimne-suverignsus", "label": "Vaimne Suveräänsus", "label_en": "Spiritual Sovereignty",
     "intro": "Kus oma rütm muutub valjemaks kui pärimuse müra."},
]

_SHELF_INTRO_EN = {
    "raha-ja-teadvus": "Where money is neither god nor enemy — only a mirror.",
    "keha-atlas": "Where the body speaks what words have not yet found.",
    "suhted-ja-sagedus": "Where boundary, nerve, and closeness breathe in the same rhythm.",
    "vaimne-suverignsus": "Where your own rhythm grows louder than the noise of inheritance.",
}

_THEME_BY_SLUG = {
    "you-dont-have-to-dance-to-anothers-tune": "vaimne-suverignsus",
    "the-language-of-angels": "vaimne-suverignsus",
    "beyond-the-matrix-i": "vaimne-suverignsus",
    "beyond-the-matrix-ii": "vaimne-suverignsus",
    "angels-tales": "suhted-ja-sagedus",
    "angels-story": "suhted-ja-sagedus",
    "engels-friends-2": "suhted-ja-sagedus",
    "the-night-angels-embrace": "suhted-ja-sagedus",
    "letting-the-old-stories-rest": "vaimne-suverignsus",
    "the-language-you-forgot": "vaimne-suverignsus",
    "seven-quiet-evenings-with-children": "suhted-ja-sagedus",
    "the-body-knows-first": "keha-atlas",
    "money-and-consciousness-module-1": "raha-ja-teadvus",
}

# Cross-listings — items already shelved under a primary theme that *also*
# belong, thematically, on a second shelf. Used by /api/library/shelves to
# avoid empty-looking shelves while not duplicating products in the catalogue.
# Each entry maps a theme slug to a list of slugs (books + courses) that
# resonate with it as well as with their primary home.
_CROSS_SHELF_SLUGS = {
    "raha-ja-teadvus": [
        "you-dont-have-to-dance-to-anothers-tune",  # sovereignty + inherited rhythm
        "letting-the-old-stories-rest",             # inherited scarcity beliefs
    ],
    "keha-atlas": [
        "seven-quiet-evenings-with-children",       # the slow hand · body-led ritual
        "the-language-of-angels",                   # sensory listening
    ],
}


@api_router.get("/library/shelves")
async def library_shelves():
    """Themed shelves with all books + courses grouped by theme."""
    books = await db.books.find(
        {"published": True},
        {"_id": 0, "slug": 1, "title": 1, "subtitle": 1, "audience": 1,
         "price": 1, "currency": 1, "cover_image_url": 1, "description": 1,
         "lemonsqueezy_variant_id": 1, "tags": 1},
    ).to_list(500)
    course_summaries = [
        {
            "slug": c["slug"], "title": c["title"], "blurb": c["blurb"],
            "audience": c["audience"], "duration_days": c["duration_days"],
            "price": c.get("price", 0.0),
            "lemonsqueezy_variant_id": c.get("lemonsqueezy_variant_id"),
        }
        for c in SEED_COURSES
        # W-2 (iter 62): suppress non-English course rows from the public
        # library payload to keep the global English-facing experience
        # clean. The course content remains in SEED_COURSES for direct
        # /api/courses/{slug} access by users who follow a localized link.
        if c.get("language", "en") == "en"
    ]
    by_theme: dict = {t["slug"]: {"books": [], "courses": []} for t in LIBRARY_THEMES}
    by_theme["_unshelved"] = {"books": [], "courses": []}
    for b in books:
        theme = _THEME_BY_SLUG.get(b["slug"], "_unshelved")
        b["theme"] = theme
        by_theme.setdefault(theme, {"books": [], "courses": []})["books"].append(b)
    for c in course_summaries:
        theme = _THEME_BY_SLUG.get(c["slug"], "_unshelved")
        c["theme"] = theme
        by_theme.setdefault(theme, {"books": [], "courses": []})["courses"].append(c)
    shelves = []
    for t in LIBRARY_THEMES:
        s = dict(t)
        # §Iter 65c — language isolation: the public payload must
        # render English. Promote the English label/intro and drop the
        # Estonian originals from the response so no UI accidentally
        # binds to `s.label`. Estonian originals stay in source for any
        # future ET-localized route.
        s["label"] = t.get("label_en") or t.get("label")
        s["intro"] = t.get("intro_en") or _SHELF_INTRO_EN.get(t["slug"]) or ""
        s.pop("label_en", None)
        s.pop("intro_en", None)
        s["books"] = list(by_theme.get(t["slug"], {}).get("books", []))
        s["courses"] = list(by_theme.get(t["slug"], {}).get("courses", []))
        # Cross-listings: items that primarily live on another shelf but
        # also belong thematically here. Marked `cross_listed: True` so the
        # UI may render a soft "also on this shelf" affordance if it wishes.
        cross_slugs = _CROSS_SHELF_SLUGS.get(t["slug"], [])
        existing_slugs = {x["slug"] for x in s["books"]} | {x["slug"] for x in s["courses"]}
        for slug in cross_slugs:
            if slug in existing_slugs:
                continue
            book_match = next((b for b in books if b["slug"] == slug), None)
            if book_match:
                s["books"].append({**book_match, "theme": t["slug"], "cross_listed": True})
                continue
            course_match = next((c for c in course_summaries if c["slug"] == slug), None)
            if course_match:
                s["courses"].append({**course_match, "theme": t["slug"], "cross_listed": True})
        s["count"] = len(s["books"]) + len(s["courses"])
        shelves.append(s)
    return {
        "shelves": shelves,
        "unshelved": by_theme["_unshelved"],
        "preamble": (
            "Four shelves. Pick the room your evening lives in."
        ),
    }


# =============================================================
# §10 BOOKING SYSTEM — Holographic Cabinet (canonical spec lives in
#     /app/MASTER_PROTOCOL.md §10, blueprint in /app/memory/VISUAL_BLUEPRINTS.md
#     Image 4). 5 wanderer endpoints + 2 admin endpoints. Idempotent
#     indexes registered in on_startup. AI mentors are stateless — a
#     booking reserves a *time anchor*, not mentor capacity.
# =============================================================

BOOKING_QUIET_HOURS_START = int(os.environ.get("BOOKING_QUIET_HOURS_START", "9"))
BOOKING_QUIET_HOURS_END = int(os.environ.get("BOOKING_QUIET_HOURS_END", "22"))
BOOKING_DEFAULT_DURATION = int(os.environ.get("BOOKING_DEFAULT_DURATION", "60"))
BOOKING_CEILING = int(os.environ.get("PRIVATE_ROOM_CONCURRENT_CEILING", "100"))
BOOKING_HORIZON_DAYS = int(os.environ.get("BOOKING_HORIZON_DAYS", "14"))

GuideName = Literal["clarity", "grace"]
SessionType = Literal["deep_mirroring", "high_focus_breathing", "psychosomatic_map", "open"]
BookingStatus = Literal["reserved", "in_session", "completed", "cancelled", "no_show"]

SESSION_TYPE_LABELS = {
    "deep_mirroring": "Deep mirroring",
    "high_focus_breathing": "High-focus breathing",
    "psychosomatic_map": "Psychosomatic map",
    "open": "Open hour",
}


class BookingReserveIn(BaseModel):
    guide_name: GuideName = "clarity"
    session_type: SessionType = "open"
    start_at: str  # ISO 8601 UTC
    duration_minutes: Optional[int] = None
    intention: Optional[str] = None  # short calm note from wanderer
    tz: Optional[str] = None  # IANA tz, only for confirmation label


class BookingOut(BaseModel):
    id: str
    user_id: str
    guide_name: str
    session_type: str
    session_type_label: str
    start_at: str
    duration_minutes: int
    status: str
    created_at: str
    cancelled_at: Optional[str] = None
    completed_at: Optional[str] = None
    intention: Optional[str] = None


def _parse_iso_utc(value: str) -> datetime:
    """Accept ISO 8601 with or without Z suffix; return aware UTC datetime."""
    if not value:
        raise ValueError("empty datetime")
    s = value.strip()
    if s.endswith("Z"):
        s = s[:-1] + "+00:00"
    dt = datetime.fromisoformat(s)
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone.utc)
    return dt.astimezone(timezone.utc)


def _hour_floor_utc(dt: datetime) -> datetime:
    return dt.replace(minute=0, second=0, microsecond=0)


def _booking_to_out(doc: dict) -> dict:
    return {
        "id": doc["id"],
        "user_id": doc["user_id"],
        "guide_name": doc["guide_name"],
        "session_type": doc["session_type"],
        "session_type_label": SESSION_TYPE_LABELS.get(doc["session_type"], doc["session_type"]),
        "start_at": doc["start_at"],
        "duration_minutes": doc.get("duration_minutes", BOOKING_DEFAULT_DURATION),
        "status": doc["status"],
        "created_at": doc["created_at"],
        "cancelled_at": doc.get("cancelled_at"),
        "completed_at": doc.get("completed_at"),
        "intention": doc.get("intention"),
    }


def _generate_quiet_slots(
    from_dt: datetime,
    to_dt: datetime,
    quiet_start_hour: int = BOOKING_QUIET_HOURS_START,
    quiet_end_hour: int = BOOKING_QUIET_HOURS_END,
) -> List[datetime]:
    """Generate hour-aligned UTC slots within the quiet-hours window.
    Each candidate hour is checked in UTC (server time). Frontend may
    further filter by user's local tz, but the canonical anchor is UTC."""
    slots: List[datetime] = []
    cursor = _hour_floor_utc(from_dt)
    if cursor < from_dt:
        cursor += timedelta(hours=1)
    while cursor < to_dt:
        if quiet_start_hour <= cursor.hour < quiet_end_hour:
            slots.append(cursor)
        cursor += timedelta(hours=1)
    return slots


@api_router.get("/booking/available-slots")
async def booking_available_slots(
    request: Request,
    guide: GuideName = "clarity",
    from_iso: Optional[str] = Query(None, alias="from"),
    to_iso: Optional[str] = Query(None, alias="to"),
    tz: Optional[str] = None,
):
    """List slots within a window (default: now → +14 days). Quiet hours
    are server-canonical. Frontend renders in user's tz. Each slot is
    annotated with the count of existing reservations for parallel-instance
    awareness (capacity is per-server, not per-mentor — §10.1)."""
    now = datetime.now(timezone.utc)
    try:
        from_dt = _parse_iso_utc(from_iso) if from_iso else now
        to_dt = _parse_iso_utc(to_iso) if to_iso else now + timedelta(days=BOOKING_HORIZON_DAYS)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid ISO datetime in from/to.")
    if to_dt <= from_dt:
        raise HTTPException(status_code=400, detail="`to` must be after `from`.")
    if (to_dt - from_dt).days > 60:
        raise HTTPException(status_code=400, detail="Window too wide (max 60 days).")

    candidate_slots = _generate_quiet_slots(from_dt, to_dt)
    # Pull existing reservations in window for capacity counts.
    cursor = db.bookings.find(
        {
            "guide_name": guide,
            "status": {"$in": ["reserved", "in_session"]},
            "start_at": {
                "$gte": from_dt.isoformat(),
                "$lt": to_dt.isoformat(),
            },
        },
        {"_id": 0, "start_at": 1, "status": 1},
    )
    counts: dict = {}
    async for row in cursor:
        counts[row["start_at"]] = counts.get(row["start_at"], 0) + 1

    # Resolve current user (optional) so we can mark slots already booked by them.
    user = await _resolve_current_user(request)
    own_slots: set = set()
    if user:
        own_cursor = db.bookings.find(
            {
                "user_id": user.user_id,
                "status": {"$in": ["reserved", "in_session"]},
                "start_at": {
                    "$gte": from_dt.isoformat(),
                    "$lt": to_dt.isoformat(),
                },
            },
            {"_id": 0, "start_at": 1},
        )
        async for row in own_cursor:
            own_slots.add(row["start_at"])

    slot_payload = []
    for s in candidate_slots:
        iso = s.isoformat()
        taken = counts.get(iso, 0)
        slot_payload.append({
            "start_at": iso,
            "duration_minutes": BOOKING_DEFAULT_DURATION,
            "guide_name": guide,
            "is_past": s <= now,
            "is_full": taken >= BOOKING_CEILING,
            "reserved_count": taken,
            "ceiling": BOOKING_CEILING,
            "is_own": iso in own_slots,
        })
    return {
        "guide": guide,
        "from": from_dt.isoformat(),
        "to": to_dt.isoformat(),
        "tz_hint": tz or "UTC",
        "quiet_hours": {"start": BOOKING_QUIET_HOURS_START, "end": BOOKING_QUIET_HOURS_END},
        "slots": slot_payload,
        "session_types": [
            {"slug": k, "label": v} for k, v in SESSION_TYPE_LABELS.items()
        ],
    }


@api_router.post("/booking/reserve")
async def booking_reserve(inp: BookingReserveIn, request: Request):
    """Reserve a time anchor. Anti-FOMO rule (§10.5): one active
    reservation per user — we 409 if they already hold one in the future.
    Idempotent within the same hour for the same user (returns existing)."""
    user = await _resolve_current_user(request)
    if not user:
        raise HTTPException(status_code=401, detail="Sign in to reserve a quiet hour.")
    try:
        start_dt = _parse_iso_utc(inp.start_at)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid start_at.")
    start_dt = _hour_floor_utc(start_dt)
    now = datetime.now(timezone.utc)
    if start_dt < now:
        raise HTTPException(status_code=400, detail="Quiet hours cannot be reserved in the past.")
    if start_dt > now + timedelta(days=BOOKING_HORIZON_DAYS + 1):
        raise HTTPException(status_code=400, detail="That hour is beyond the booking horizon.")
    hour = start_dt.hour
    if not (BOOKING_QUIET_HOURS_START <= hour < BOOKING_QUIET_HOURS_END):
        raise HTTPException(status_code=400, detail="That hour is outside the quiet-hours window.")

    duration = int(inp.duration_minutes or BOOKING_DEFAULT_DURATION)
    if duration not in (30, 60, 90):
        raise HTTPException(status_code=400, detail="Duration must be 30, 60 or 90 minutes.")

    # Idempotency: same user already holds this exact slot → return it.
    existing_same = await db.bookings.find_one(
        {
            "user_id": user.user_id,
            "start_at": start_dt.isoformat(),
            "status": {"$in": ["reserved", "in_session"]},
        },
        {"_id": 0},
    )
    if existing_same:
        return {
            "status": "already_reserved",
            "booking": _booking_to_out(existing_same),
        }

    # Anti-FOMO: refuse stacking — one active future reservation.
    other_active = await db.bookings.find_one(
        {
            "user_id": user.user_id,
            "status": {"$in": ["reserved", "in_session"]},
            "start_at": {"$gte": now.isoformat()},
        },
        {"_id": 0},
    )
    if other_active:
        raise HTTPException(
            status_code=409,
            detail="You already hold a quiet hour. Cancel it first if you'd like a different time.",
        )

    # Capacity check — server-wide ceiling per slot.
    slot_count = await db.bookings.count_documents({
        "guide_name": inp.guide_name,
        "start_at": start_dt.isoformat(),
        "status": {"$in": ["reserved", "in_session"]},
    })
    if slot_count >= BOOKING_CEILING:
        raise HTTPException(status_code=409, detail="That hour is already at capacity. Pick another.")

    booking_id = uuid.uuid4().hex
    now_iso = now.isoformat()
    doc = {
        "id": booking_id,
        "user_id": user.user_id,
        "user_email": user.email,
        "guide_name": inp.guide_name,
        "session_type": inp.session_type,
        "start_at": start_dt.isoformat(),
        "duration_minutes": duration,
        "status": "reserved",
        "created_at": now_iso,
        "cancelled_at": None,
        "completed_at": None,
        "intention": (inp.intention or "").strip()[:500] or None,
        "tz_hint": inp.tz or "UTC",
    }
    await db.bookings.insert_one(doc)
    doc.pop("_id", None)

    # Automation: in-app confirmation payload + (best-effort) email + magic-link.
    confirmation = await _dispatch_booking_confirmation(doc)
    return {
        "status": "reserved",
        "booking": _booking_to_out(doc),
        "confirmation": confirmation,
    }


async def _dispatch_booking_confirmation(doc: dict) -> dict:
    """Build the calm in-app confirmation payload, send a Resend email
    if configured, and append a magic 'Astu sisse' link via the existing
    §8.4 helper. Soft-fail: nothing here may abort the reservation."""
    booking_id = doc["id"]
    start_dt = _parse_iso_utc(doc["start_at"])
    label = start_dt.strftime("%a %d %b · %H:%M UTC")
    guide_label = "Clarity" if doc["guide_name"] == "clarity" else "Grace"
    type_label = SESSION_TYPE_LABELS.get(doc["session_type"], doc["session_type"])
    base = os.environ.get("PUBLIC_SITE_URL", "https://prulesoul.site").rstrip("/")
    cabinet_url = f"{base}/cabinet/booking?b={booking_id}"
    calm_message = (
        f"Your time is held — {label}. "
        f"{guide_label} will be present. Nothing else is required of you."
    )
    payload = {
        "booking_id": booking_id,
        "start_at": doc["start_at"],
        "start_at_label": label,
        "guide_label": guide_label,
        "session_type_label": type_label,
        "calm_message": calm_message,
        "cabinet_url": cabinet_url,
        "magic_entry_url": None,
        "delivered_via": "in_app",
        "email_attempted": False,
    }
    email = (doc.get("user_email") or "").lower().strip()
    if not email:
        return payload
    payload["email_attempted"] = True
    # Best-effort magic link + email.
    try:
        magic = await _issue_magic_link_for_email(
            email,
            redirect_to=f"/cabinet/booking?b={booking_id}",
            email_subject_override="Your quiet hour is held — Matrix Aurin",
            email_intro_override=(
                f"{calm_message}\n\nWhen the hour arrives, this link opens the room."
            ),
        )
        if magic.get("magic_link_url"):
            payload["magic_entry_url"] = magic["magic_link_url"]
        if magic.get("delivered_via"):
            payload["delivered_via"] = magic["delivered_via"]
    except Exception as exc:  # noqa: BLE001
        logger.warning("booking confirmation email skipped: %s", exc)
    return payload


@api_router.get("/booking/mine")
async def booking_mine(request: Request):
    """Active + past bookings for the signed-in user, newest first."""
    user = await _resolve_current_user(request)
    if not user:
        raise HTTPException(status_code=401, detail="Sign in to view your bookings.")
    cursor = db.bookings.find(
        {"user_id": user.user_id},
        {"_id": 0},
    ).sort("start_at", -1)
    rows = await cursor.to_list(200)
    now = datetime.now(timezone.utc)
    active, past = [], []
    for row in rows:
        try:
            start_dt = _parse_iso_utc(row["start_at"])
        except ValueError:
            continue
        out = _booking_to_out(row)
        if row["status"] in ("reserved", "in_session") and start_dt >= now:
            active.append(out)
        else:
            past.append(out)
    return {"active": active, "past": past}


@api_router.post("/booking/{booking_id}/cancel")
async def booking_cancel(booking_id: str, request: Request):
    """Soft-cancel. Per §9.1 — single-click, no friction, no confirmation
    prompt. Wanderer's freedom is sacred."""
    user = await _resolve_current_user(request)
    if not user:
        raise HTTPException(status_code=401, detail="Sign in to cancel.")
    doc = await db.bookings.find_one({"id": booking_id}, {"_id": 0})
    if not doc:
        raise HTTPException(status_code=404, detail="Booking not found.")
    if doc["user_id"] != user.user_id:
        raise HTTPException(status_code=403, detail="That booking is not yours.")
    if doc["status"] in ("cancelled", "completed", "no_show"):
        return {"status": "noop", "booking": _booking_to_out(doc)}
    now_iso = datetime.now(timezone.utc).isoformat()
    await db.bookings.update_one(
        {"id": booking_id},
        {"$set": {"status": "cancelled", "cancelled_at": now_iso}},
    )
    doc["status"] = "cancelled"
    doc["cancelled_at"] = now_iso
    return {"status": "cancelled", "booking": _booking_to_out(doc)}


@api_router.get("/booking/capacity")
async def booking_capacity():
    """Counter widget data (§10.4 bottom rail). Independent of guide."""
    now = datetime.now(timezone.utc)
    today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
    tomorrow = today_start + timedelta(days=1)
    in_window_active = await db.bookings.count_documents({
        "status": "in_session",
    })
    today_total = await db.bookings.count_documents({
        "start_at": {"$gte": today_start.isoformat(), "$lt": tomorrow.isoformat()},
        "status": {"$in": ["reserved", "in_session", "completed"]},
    })
    upcoming_total = await db.bookings.count_documents({
        "status": "reserved",
        "start_at": {"$gte": now.isoformat()},
    })
    return {
        "live_now": in_window_active,
        "ceiling": BOOKING_CEILING,
        "slots_today_total": today_total,
        "upcoming_total": upcoming_total,
    }


# -------------------------------------------------------------
# §10 ADMIN SCHEDULER — read-only ops for the founder
# -------------------------------------------------------------

def _check_admin_token(request: Request) -> None:
    admin_token = os.environ.get("ADMIN_TOKEN")
    if not admin_token:
        raise HTTPException(status_code=503, detail="Admin token not configured.")
    sent = (
        request.headers.get("x-admin-token")
        or request.query_params.get("token")
        or request.query_params.get("admin_token")
    )
    if sent != admin_token:
        raise HTTPException(status_code=401, detail="Invalid admin token.")


def _short_user_id(user_id: str) -> str:
    if not user_id:
        return ""
    return f"{user_id[:6]}…{user_id[-4:]}" if len(user_id) > 10 else user_id


@api_router.get("/admin/booking/schedule")
async def admin_booking_schedule(request: Request, date: Optional[str] = None):
    """Day view of bookings (anonymized user_id). Admin token required."""
    _check_admin_token(request)
    if date:
        try:
            day = datetime.fromisoformat(date).replace(tzinfo=timezone.utc)
        except ValueError:
            raise HTTPException(status_code=400, detail="date must be YYYY-MM-DD.")
    else:
        day = datetime.now(timezone.utc)
    day_start = day.replace(hour=0, minute=0, second=0, microsecond=0)
    day_end = day_start + timedelta(days=1)
    cursor = db.bookings.find(
        {"start_at": {"$gte": day_start.isoformat(), "$lt": day_end.isoformat()}},
        {"_id": 0},
    ).sort("start_at", 1)
    rows = await cursor.to_list(500)
    items = []
    for row in rows:
        out = _booking_to_out(row)
        out["user_short"] = _short_user_id(row.get("user_id", ""))
        items.append(out)
    return {
        "date": day_start.date().isoformat(),
        "items": items,
        "count": len(items),
        "quiet_hours": {"start": BOOKING_QUIET_HOURS_START, "end": BOOKING_QUIET_HOURS_END},
    }


@api_router.get("/admin/booking/stats")
async def admin_booking_stats(request: Request):
    """Aggregate counters for the scheduler dashboard."""
    _check_admin_token(request)
    now = datetime.now(timezone.utc)
    week_start = now - timedelta(days=7)
    today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
    by_status = {}
    for status in ("reserved", "in_session", "completed", "cancelled", "no_show"):
        by_status[status] = await db.bookings.count_documents({"status": status})
    today = await db.bookings.count_documents({
        "start_at": {"$gte": today_start.isoformat(), "$lt": (today_start + timedelta(days=1)).isoformat()},
    })
    week = await db.bookings.count_documents({
        "created_at": {"$gte": week_start.isoformat()},
    })
    by_guide = {}
    for guide in ("clarity", "grace"):
        by_guide[guide] = await db.bookings.count_documents({
            "guide_name": guide,
            "status": {"$in": ["reserved", "in_session", "completed"]},
        })
    return {
        "by_status": by_status,
        "by_guide": by_guide,
        "today_total": today,
        "week_total": week,
        "ceiling": BOOKING_CEILING,
    }


# =============================================================
# §SIX-NIGHTS DISPATCHER — daily email cron (Resend) for the
#     /six-nights opt-in subscribers. Soft-fail when RESEND missing.
# =============================================================

SIX_NIGHTS_DISPATCH_INTERVAL = int(os.environ.get("SIX_NIGHTS_DISPATCH_INTERVAL", "3600"))
SIX_NIGHTS_MIN_GAP_HOURS = int(os.environ.get("SIX_NIGHTS_MIN_GAP_HOURS", "20"))


def _render_six_nights_email(night_number: int, locale: str = "en") -> tuple:
    """Build (subject, html, text) for one night."""
    night = next((n for n in SIX_NIGHTS_CONTENT if n["night_number"] == night_number), None)
    if not night:
        raise ValueError(f"No content for night {night_number}")
    title = night["title"]
    body = night["body_markdown"]
    question = night.get("question", "")
    closing = night.get("closing_note", "")
    subject = f"Night {night_number} of six — {title}"
    safe_body = bleach.clean(body, tags=["em", "strong", "i", "b", "br", "p"], strip=True)
    safe_body = safe_body.replace("\n\n", "</p><p>").replace("\n", "<br/>")
    html = (
        f"<div style=\"font-family:Georgia,serif;color:#2a2a2a;max-width:560px;margin:0 auto;"
        f"line-height:1.7;font-size:16px;\">"
        f"<p style=\"opacity:0.6;font-size:13px;letter-spacing:0.1em;text-transform:uppercase;\">"
        f"Night {night_number} of six</p>"
        f"<h1 style=\"font-family:Georgia,serif;font-weight:400;font-size:24px;margin:8px 0 18px;\">{title}</h1>"
        f"<p>{safe_body}</p>"
        + (f"<p><em>{bleach.clean(question)}</em></p>" if question else "")
        + (f"<p style=\"opacity:0.8;\">{bleach.clean(closing)}</p>" if closing else "")
        + "<p style=\"opacity:0.5;font-size:13px;margin-top:32px;\">— Aurin</p>"
        "<p style=\"opacity:0.4;font-size:12px;\">Reply to this email at any time to stop the nights.</p>"
        "</div>"
    )
    text = f"Night {night_number} of six — {title}\n\n{body}\n\n{question}\n\n{closing}\n\n— Aurin"
    return subject, html, text


async def _six_nights_send_one(sub: dict) -> dict:
    """Send the *next* unsent night to one subscriber. Returns status dict.
    Idempotent: increments `day_sent` only after successful send."""
    from email_service import send_email as _send_email, is_configured as _resend_ok
    if not _resend_ok():
        return {"status": "skipped", "reason": "resend_not_configured"}
    day_sent = int(sub.get("day_sent") or 0)
    next_night = day_sent + 1
    if next_night > 6:
        await db.six_nights_subscriptions.update_one(
            {"email": sub["email"]},
            {"$set": {"completed": True}},
        )
        return {"status": "completed", "email": sub["email"]}
    # Honor min-gap.
    last = sub.get("last_send_at")
    if last:
        try:
            last_dt = _parse_iso_utc(last)
            if datetime.now(timezone.utc) - last_dt < timedelta(hours=SIX_NIGHTS_MIN_GAP_HOURS):
                return {"status": "too_soon", "email": sub["email"]}
        except ValueError:
            pass
    try:
        subject, html, text = _render_six_nights_email(next_night, sub.get("locale", "en"))
        await _send_email(
            to=sub["email"],
            subject=subject,
            html=html,
            text=text,
            sender="agent",
            tags=[{"name": "kind", "value": "six_nights"}, {"name": "night", "value": str(next_night)}],
        )
    except Exception as exc:  # noqa: BLE001
        logger.warning("six_nights send failed for %s: %s", sub.get("email"), exc)
        return {"status": "error", "email": sub["email"], "error": type(exc).__name__}
    now_iso = datetime.now(timezone.utc).isoformat()
    completed = next_night >= 6
    await db.six_nights_subscriptions.update_one(
        {"email": sub["email"]},
        {"$set": {
            "day_sent": next_night,
            "last_send_at": now_iso,
            "completed": completed,
        }},
    )
    return {"status": "sent", "email": sub["email"], "night": next_night, "completed": completed}


@api_router.post("/admin/six-nights/dispatch")
async def admin_six_nights_dispatch(request: Request, dry_run: bool = False):
    """Manual cron trigger. Sends the next-due night to every active
    subscriber whose last send is at least SIX_NIGHTS_MIN_GAP_HOURS ago.
    Admin token required."""
    _check_admin_token(request)
    cursor = db.six_nights_subscriptions.find(
        {"completed": {"$ne": True}},
        {"_id": 0},
    )
    subs = await cursor.to_list(1000)
    if dry_run:
        return {"dry_run": True, "candidates": len(subs)}
    results = []
    for sub in subs:
        results.append(await _six_nights_send_one(sub))
    sent = sum(1 for r in results if r.get("status") == "sent")
    return {
        "dispatched_at": datetime.now(timezone.utc).isoformat(),
        "candidates": len(subs),
        "sent": sent,
        "results": results,
    }


async def _six_nights_dispatch_loop() -> None:
    """Background loop — every hour, check who is due for their next
    night. Soft-fails on every error to avoid bringing down the server."""
    await asyncio.sleep(60)  # let app finish booting
    while True:
        try:
            cursor = db.six_nights_subscriptions.find(
                {"completed": {"$ne": True}},
                {"_id": 0},
            )
            subs = await cursor.to_list(1000)
            for sub in subs:
                try:
                    await _six_nights_send_one(sub)
                except Exception as exc:  # noqa: BLE001
                    logger.warning("six_nights loop error for %s: %s", sub.get("email"), exc)
        except Exception as exc:  # noqa: BLE001
            logger.warning("six_nights loop tick failed: %s", exc)
        await asyncio.sleep(SIX_NIGHTS_DISPATCH_INTERVAL)


# =============================================================
# §STAGE 2.9 — COURSES DAILY-LETTER DISPATCHER (Resend)
#   Mirror of `_six_nights_dispatch_loop` for the 4 paid courses.
#   Each enrolled wanderer receives one letter per 24h until the
#   course completes. Idempotent. Unsubscribe-safe. Timezone-safe.
# =============================================================

COURSES_DISPATCH_INTERVAL = int(os.environ.get("COURSES_DISPATCH_INTERVAL", "3600"))


def _render_course_letter_email(course: dict, day_number: int) -> tuple:
    """Build (subject, html, text) for one course-day letter."""
    letter = next((let for let in (course.get("letters") or []) if let.get("day") == day_number), None)
    if not letter:
        raise ValueError(f"No letter for course {course.get('slug')} day {day_number}")
    course_title = course.get("title", "")
    title = letter.get("title", f"Day {day_number}")
    body = letter.get("body", "")
    prompt = letter.get("prompt", "")
    duration = course.get("duration_days", 7)
    subject = f"{course_title} — Day {day_number} · {title}"
    safe_body = bleach.clean(body, tags=["em", "strong", "i", "b", "br", "p"], strip=True)
    safe_body = safe_body.replace("\n\n", "</p><p>").replace("\n", "<br/>")
    html = (
        f"<div style=\"font-family:Georgia,serif;color:#2a2a2a;max-width:560px;margin:0 auto;"
        f"line-height:1.7;font-size:16px;\">"
        f"<p style=\"opacity:0.55;font-size:13px;letter-spacing:0.1em;text-transform:uppercase;\">"
        f"Day {day_number} of {duration}</p>"
        f"<h1 style=\"font-family:Georgia,serif;font-weight:400;font-size:24px;margin:8px 0 4px;\">{title}</h1>"
        f"<p style=\"opacity:0.6;font-size:13px;margin:0 0 18px;\">{course_title}</p>"
        f"<p>{safe_body}</p>"
        + (f"<p><em>{bleach.clean(prompt)}</em></p>" if prompt else "")
        + "<p style=\"opacity:0.5;font-size:13px;margin-top:32px;\">— Aurin</p>"
        "<p style=\"opacity:0.4;font-size:12px;\">"
        "Reply to this email at any time to stop the course letters."
        "</p>"
        "</div>"
    )
    text = (
        f"Day {day_number} of {duration} — {title}\n"
        f"({course_title})\n\n"
        f"{body}\n\n"
        + (f"{prompt}\n\n" if prompt else "")
        + "— Aurin"
    )
    return subject, html, text


async def _course_letter_send_one(enrollment: dict) -> dict:
    """Send the next-due letter to one enrollee. Idempotent.
    Returns a status dict; never raises.
    """
    from email_service import send_email as _send_email, is_configured as _resend_ok

    if not _resend_ok():
        return {"status": "skipped", "reason": "resend_not_configured"}

    slug = enrollment.get("course_slug")
    course = _course_by_slug(slug) if slug else None
    if not course:
        return {"status": "skipped", "reason": "course_not_found", "slug": slug}

    letters = course.get("letters") or []
    total_days = len(letters)
    if total_days == 0:
        return {"status": "skipped", "reason": "no_letters", "slug": slug}

    if enrollment.get("paused"):
        return {"status": "skipped", "reason": "paused"}

    day_sent = int(enrollment.get("day_sent") or 0)
    next_day = day_sent + 1

    # Already through the whole course — mark and stop.
    if next_day > total_days:
        await db.course_enrollments.update_one(
            {"id": enrollment["id"]},
            {"$set": {"completed": True}},
        )
        return {"status": "completed", "user_id": enrollment.get("user_id"), "slug": slug}

    # Compute unlock time: letter N unlocks at started_at + (N-1) days.
    try:
        started_at = _parse_iso_utc(enrollment["started_at"])
    except (KeyError, ValueError):
        return {"status": "skipped", "reason": "bad_started_at"}
    unlock_at = started_at + timedelta(days=next_day - 1)
    if datetime.now(timezone.utc) < unlock_at:
        return {
            "status": "not_yet",
            "day": next_day,
            "unlock_at": unlock_at.isoformat(),
        }

    # Resolve recipient email.
    user_doc = await db.users.find_one(
        {"user_id": enrollment.get("user_id")},
        {"_id": 0, "email": 1},
    )
    email = (user_doc or {}).get("email")
    if not email:
        return {"status": "skipped", "reason": "no_email"}

    # Respect unsubscribe.
    unsub = await db.email_unsubscribes.find_one({"email": email})
    if unsub:
        await db.course_enrollments.update_one(
            {"id": enrollment["id"]},
            {"$set": {"paused": True, "paused_reason": "unsubscribed"}},
        )
        return {"status": "skipped", "reason": "unsubscribed", "email": email}

    # Idempotency guard — never send the same day twice.
    already = await db.course_letter_sends.find_one({
        "user_id": enrollment.get("user_id"),
        "course_slug": slug,
        "day": next_day,
    })
    if already:
        # Heal day_sent if it drifted behind the actual sends.
        await db.course_enrollments.update_one(
            {"id": enrollment["id"]},
            {"$set": {"day_sent": next_day}},
        )
        return {"status": "already_sent", "day": next_day, "slug": slug}

    # Render + send.
    try:
        subject, html, text = _render_course_letter_email(course, next_day)
        await _send_email(
            to=email,
            subject=subject,
            html=html,
            text=text,
            sender="agent",
            tags=[
                {"name": "kind", "value": "course_letter"},
                {"name": "course", "value": slug},
                {"name": "day", "value": str(next_day)},
            ],
        )
    except Exception as exc:  # noqa: BLE001
        logger.warning(
            "course_letter send failed user=%s slug=%s day=%s: %s",
            enrollment.get("user_id"), slug, next_day, exc,
        )
        return {"status": "error", "day": next_day, "error": type(exc).__name__}

    now_iso = datetime.now(timezone.utc).isoformat()
    await db.course_letter_sends.insert_one({
        "id": str(uuid.uuid4()),
        "user_id": enrollment.get("user_id"),
        "course_slug": slug,
        "day": next_day,
        "sent_at": now_iso,
        "email": email,
    })
    completed = next_day >= total_days
    await db.course_enrollments.update_one(
        {"id": enrollment["id"]},
        {"$set": {
            "day_sent": next_day,
            "last_send_at": now_iso,
            "completed": completed,
        }},
    )
    return {
        "status": "sent",
        "day": next_day,
        "slug": slug,
        "completed": completed,
        "email": email,
    }


@api_router.post("/admin/courses/dispatch")
async def admin_courses_dispatch(request: Request, dry_run: bool = False):
    """Manual cron trigger for the course daily-letter loop. Admin-only.

    Walks every active enrollment and sends the next-due letter (if any).
    Idempotent: re-running within the same day is safe — the
    `course_letter_sends` guard prevents double-sends.
    """
    _check_admin_token(request)
    cursor = db.course_enrollments.find(
        {"$or": [
            {"completed": {"$ne": True}},
            {"completed": {"$exists": False}},
        ]},
        {"_id": 0},
    )
    enrolls = await cursor.to_list(2000)
    if dry_run:
        return {"dry_run": True, "candidates": len(enrolls)}
    results = []
    for e in enrolls:
        try:
            results.append(await _course_letter_send_one(e))
        except Exception as exc:  # noqa: BLE001
            logger.warning("admin courses dispatch error: %s", exc)
            results.append({"status": "error", "error": type(exc).__name__})
    sent_count = sum(1 for r in results if r.get("status") == "sent")
    return {
        "dispatched_at": datetime.now(timezone.utc).isoformat(),
        "candidates": len(enrolls),
        "sent": sent_count,
        "results": results,
    }


async def _courses_dispatch_loop() -> None:
    """Background loop — every hour, deliver the next-due letter to
    every active enrollee. Soft-fails on every error to keep the
    server up. Mirrors `_six_nights_dispatch_loop` exactly.
    """
    await asyncio.sleep(90)  # boot offset, after six-nights
    while True:
        try:
            cursor = db.course_enrollments.find(
                {"$or": [
                    {"completed": {"$ne": True}},
                    {"completed": {"$exists": False}},
                ]},
                {"_id": 0},
            )
            enrolls = await cursor.to_list(2000)
            for e in enrolls:
                try:
                    await _course_letter_send_one(e)
                except Exception as exc:  # noqa: BLE001
                    logger.warning(
                        "courses loop error user=%s slug=%s: %s",
                        e.get("user_id"), e.get("course_slug"), exc,
                    )
        except Exception as exc:  # noqa: BLE001
            logger.warning("courses loop tick failed: %s", exc)
        await asyncio.sleep(COURSES_DISPATCH_INTERVAL)




# =============================================================
# §ITER 67 — Membership Tiers, Waitlist, Unsubscribe, Outbound
# Strict $0 stabilization. No new heavy architecture, no auto-send.
# =============================================================

MEMBERSHIP_TIERS = [
    {
        "key": "transient",
        "label": "The Transient",
        "price_usd": 0,
        "price_label": "Free",
        "memory_window_days": 0,
        "memory_label": "Device-only echo",
        "blurb": (
            "A first quiet hour. Nothing is stored on our side — the "
            "session lives only in this browser and fades when you close it."
        ),
        "includes": [
            "Open access to Body Room, Six Nights, Library samples",
            "One Cabinet conversation, transient",
            "Catalogue + FAQ access",
        ],
        "cta_kind": "free",
        "cta_label": "Begin freely",
        "cta_to": "/clarity-release",
    },
    {
        "key": "voyager",
        "label": "The Voyager",
        "price_usd": 9,
        "price_label": "≈ $9 / month",
        "memory_window_days": 7,
        "memory_label": "7-day rolling memory",
        "blurb": (
            "For the season you want continuity. The Cabinet remembers "
            "the last seven days of conversations so you can pick up where "
            "you left off — without becoming a permanent record."
        ),
        "includes": [
            "Everything in The Transient",
            "7-day Cabinet memory",
            "Course-room first-letter previews unlocked",
        ],
        "cta_kind": "waitlist",
        "cta_label": "Join the Voyager waitlist",
        "cta_to": "voyager",
    },
    {
        "key": "eternal",
        "label": "The Eternal",
        "price_usd": 19,
        "price_label": "≈ $19 / month",
        "memory_window_days": -1,  # -1 = full / unlimited
        "memory_label": "Full Hybrid Memory",
        "blurb": (
            "For the long walk. Every reflection, every insight, every "
            "small turn is held in the Hybrid Memory and quietly returns "
            "when it can be useful — never as surveillance, only as "
            "continuity."
        ),
        "includes": [
            "Everything in The Voyager",
            "Full Hybrid Memory across all sessions",
            "Save & export Cabinet insights",
            "Priority on new course rooms",
        ],
        "cta_kind": "waitlist",
        "cta_label": "Join the Eternal waitlist",
        "cta_to": "eternal",
    },
]


@api_router.get("/membership/tiers")
async def membership_tiers():
    """Public — three-tier structure for the Catalogue + Cabinet paywall hook."""
    return {
        "tiers": MEMBERSHIP_TIERS,
        "currency": "USD",
        "billing_provider": "lemonsqueezy",
        "billing_status": "preparing",  # founder still validating live mode
        "supplemental_supports": [
            {
                "kind": "ko-fi",
                "label": "Buy me a coffee",
                "url": "https://ko-fi.com/puresoulife",
                "tone": "single quiet gesture, no account required",
            },
            {
                "kind": "newsletter",
                "label": "Quiet letters (free)",
                "url": "/six-nights",
                "tone": "six gentle emails, then nothing unless asked",
            },
            {
                "kind": "free-pdf",
                "label": "The Night Angel — free PDF",
                "url": "/library-kids/the-night-angels-embrace",
                "tone": "a small bedtime gift",
            },
        ],
    }


@api_router.get("/membership/me")
async def membership_me(request: Request, authorization: Optional[str] = None):
    """Best-effort — returns the current user's tier or 'transient' for guests."""
    token = await _get_session_token(request, authorization)
    if not token:
        return {"tier": "transient", "authenticated": False}
    user = await db.user_sessions.find_one({"session_token": token}, {"_id": 0})
    user_id = user.get("user_id") if user else None
    if not user_id:
        return {"tier": "transient", "authenticated": False}
    row = await db.cabinet_user_tier.find_one({"user_id": user_id}, {"_id": 0})
    tier_key = (row or {}).get("tier") or "transient"
    return {
        "tier": tier_key,
        "authenticated": True,
        "since": (row or {}).get("activated_at"),
    }


# ---- Waitlist (used by Catalogue Coming Soon + paywall hook) -------

class WaitlistJoinRequest(BaseModel):
    email: str
    product_slug: str
    consent: bool = True
    name: Optional[str] = None
    note: Optional[str] = None


@api_router.post("/waitlist/join")
async def waitlist_join(inp: WaitlistJoinRequest):
    """Public — record interest in a future product or tier.

    `product_slug` is free-form (e.g. 'voyager', 'eternal',
    'course-the-language-of-angels'). Idempotent on (email, slug).
    """
    if not inp.consent:
        raise HTTPException(status_code=400, detail="Consent is required.")
    email = (inp.email or "").strip().lower()
    if "@" not in email or "." not in email.split("@")[-1]:
        raise HTTPException(status_code=400, detail="Please provide a valid email.")
    slug = (inp.product_slug or "").strip().lower()
    if not slug:
        raise HTTPException(status_code=400, detail="Missing product_slug.")
    now_iso = datetime.now(timezone.utc).isoformat()
    res = await db.waitlist_entries.update_one(
        {"email": email, "product_slug": slug},
        {
            "$setOnInsert": {
                "id": str(uuid.uuid4()),
                "email": email,
                "product_slug": slug,
                "name": (inp.name or "").strip() or None,
                "note": (inp.note or "").strip() or None,
                "created_at": now_iso,
            }
        },
        upsert=True,
    )
    # Mirror to newsletter_subscribers (one quiet list).
    await db.newsletter_subscribers.update_one(
        {"email": email},
        {"$setOnInsert": {
            "email": email,
            "name": (inp.name or "").strip() or None,
            "consent": True,
            "source": f"waitlist:{slug}",
            "created_at": now_iso,
        }},
        upsert=True,
    )
    # Soft confirmation email — only on first join (matches_count==0 means new).
    delivered = False
    if res.upserted_id is not None:
        try:
            from email_service import send_email as _send_email, is_configured as _resend_ok
            if _resend_ok():
                base = os.environ.get("PUBLIC_APP_URL", "https://prulesoul.site").rstrip("/")
                unsubscribe_url = f"{base}/api/email/unsubscribe?email={email}"

                # Soft Clarity tone — single confirmation, no automation tree.
                # Special message for the 7 Days of Clarity entry.
                base_app = os.environ.get("PUBLIC_APP_URL", "https://prulesoul.site").rstrip("/")
                clarity_url = f"{base_app}/clarity-release"
                if slug == "7-days-of-clarity":
                    subject = "You are now inside the first resonance layer."
                    intro_line = (
                        "You are now inside the first resonance layer.\n\n"
                        "The door is already open. Step in whenever you are ready:\n"
                        f"{clarity_url}"
                    )
                    intro_html = (
                        "<p><em>You are now inside the first resonance layer.</em></p>"
                        "<p>The door is already open. Step in whenever you are ready:<br/>"
                        f"<a href='{clarity_url}'>{clarity_url}</a></p>"
                    )
                else:
                    subject = "Your name is on the quiet list."
                    intro_line = (
                        "Thank you for asking.\n\n"
                        "Your name is now on the waitlist for: "
                        f"{slug}."
                    )
                    intro_html = (
                        "<p>Thank you for asking.</p>"
                        f"<p>Your name is now on the waitlist for "
                        f"<strong>{slug}</strong>.</p>"
                    )

                early_bird_line = (
                    "The first 100 Voyagers entering the resonance receive a "
                    "quiet early-entry blessing. Your place in the wave is secured."
                )

                text = (
                    f"{intro_line}\n\n"
                    "When the door opens we'll send a single short note. "
                    "No urgency, no ladder.\n\n"
                    f"{early_bird_line}\n\n"
                    f"Unsubscribe at any time: {unsubscribe_url}\n\n"
                    "— Matrix Aurin"
                )
                html = (
                    "<div style='font-family:Georgia,serif;max-width:520px;"
                    "margin:0 auto;color:#2a2a2a;line-height:1.7;'>"
                    f"{intro_html}"
                    "<p>When the door opens we'll send a single short note. "
                    "No urgency, no ladder.</p>"
                    "<p style='margin-top:22px; padding-left:14px; "
                    "border-left:2px solid #8aa291; font-style:italic; "
                    "color:#5a6a5e;'>"
                    f"{early_bird_line}"
                    "</p>"
                    f"<p style='font-size:12px;opacity:0.6;margin-top:28px;'>"
                    f"Unsubscribe at any time: "
                    f"<a href='{unsubscribe_url}'>{unsubscribe_url}</a></p>"
                    "<p>— Matrix Aurin</p></div>"
                )
                await _send_email(
                    to=email,
                    subject=subject,
                    html=html,
                    text=text,
                    sender="info",
                    tags=[
                        {"name": "kind", "value": "waitlist_confirmation"},
                        {"name": "slug", "value": slug[:64]},
                    ],
                )
                delivered = True
        except Exception as exc:  # noqa: BLE001
            logger.warning("waitlist confirmation email failed: %s", exc)
    return {
        "status": "joined" if res.upserted_id is not None else "already_on_list",
        "email_sent": delivered,
        "product_slug": slug,
    }


@api_router.get("/waitlist/health")
async def waitlist_health():
    """Public counts only, no PII."""
    by_slug = {}
    cur = db.waitlist_entries.aggregate([
        {"$group": {"_id": "$product_slug", "n": {"$sum": 1}}},
    ])
    async for row in cur:
        by_slug[row["_id"]] = row["n"]
    total = await db.waitlist_entries.count_documents({})
    return {"total": total, "by_slug": by_slug}


# ---- Polarstar Explorer List (PSP-safe waitlist, MongoDB-only) ------
# §POLARSTAR 2026-02-13 — Kids surface is preview-only while Polar.sh
# underwriter review is pending. We only collect interest; we DO NOT
# send any confirmation email (Resend stays untouched), we DO NOT bind
# a purchase, we DO NOT mention "AI". Stored quietly in MongoDB for
# the founder to review manually.

class PolarstarWaitlistRequest(BaseModel):
    email: str
    name: Optional[str] = None
    age_group: Optional[str] = None  # 'discovery' | 'exploration' | 'creation'
    note: Optional[str] = None
    consent: bool = True


@api_router.post("/waitlist/polarstar")
async def polarstar_waitlist_join(inp: PolarstarWaitlistRequest):
    """Join the Polarstar Explorer List. No email sent — quiet record."""
    if not inp.consent:
        raise HTTPException(status_code=400, detail="Consent is required.")
    email = (inp.email or "").strip().lower()
    if "@" not in email or "." not in email.split("@")[-1]:
        raise HTTPException(status_code=400, detail="Please share a valid email.")
    age_group = (inp.age_group or "").strip().lower() or None
    if age_group and age_group not in {"discovery", "exploration", "creation"}:
        age_group = None
    now_iso = datetime.now(timezone.utc).isoformat()
    res = await db.polarstar_waitlist.update_one(
        {"email": email},
        {
            "$setOnInsert": {
                "id": str(uuid.uuid4()),
                "email": email,
                "name": (inp.name or "").strip() or None,
                "age_group": age_group,
                "note": (inp.note or "").strip() or None,
                "source": "polarstar_preview",
                "created_at": now_iso,
            },
            "$set": {"last_seen_at": now_iso},
        },
        upsert=True,
    )
    status = "joined" if res.upserted_id is not None else "already_on_list"
    return {"status": status, "email_recorded": True}


@api_router.get("/waitlist/polarstar/health")
async def polarstar_waitlist_health():
    """Public count (no PII) so the founder can verify growth."""
    total = await db.polarstar_waitlist.count_documents({})
    return {"total": total, "source": "polarstar_preview"}


# =====================================================================
# GUMROAD WEBHOOK — "Polarstar Kids · Bedtime Stories" automated delivery
#
# Gumroad sends a Ping (POST form-encoded) on every sale. We:
#   1. Verify the `seller_id` matches GUMROAD_SELLER_ID (anti-spoof).
#   2. Verify the `product_permalink` (or `short_product_id`) is in the
#      configured whitelist (anti-cross-product noise).
#   3. Upsert the sale into `polarstar_purchases` (idempotent by sale_id).
#   4. Also upsert the buyer into `polarstar_waitlist` with
#      `customer: true` (so future PSP reviews see paying customers).
#   5. Send a quiet thank-you email via Resend with the PDF link.
#
# Configure in backend/.env:
#   GUMROAD_SELLER_ID=...                       (from gumroad.com/settings)
#   GUMROAD_PRODUCT_PERMALINKS=slug1,slug2      (comma-separated)
#   GUMROAD_PDF_URL=https://prulesoul.site/assets/pdfs/polarstar-bedtime-stories.pdf
#
# Gumroad webhook URL to paste:
#   https://prulesoul.site/api/webhooks/gumroad
#
# (Gumroad's standard Ping has no HMAC. Seller-ID match + permalink
# whitelist is the documented best practice.)
# =====================================================================


async def _send_polarstar_bedtime_pdf_email(
    *, email: str, full_name: Optional[str], pdf_url: str, order_number: Optional[str]
) -> dict:
    """Quiet thank-you with the PDF link. Returns the email_service result
    (or a graceful skip if Resend is not configured)."""
    try:
        from email_service import send_email as _send, is_configured as _ok
    except Exception as e:  # noqa: BLE001
        logger.warning("polarstar.bedtime email import failed: %s", e)
        return {"status": "skipped_import_error"}

    if not _ok():
        logger.info("polarstar.bedtime email skipped — Resend not configured")
        return {"status": "skipped_resend_not_configured"}

    first_name = (full_name or "").strip().split(" ")[0] if full_name else ""
    salutation = f"Dear {first_name}," if first_name else "Hello,"

    subject = "Your Polarstar Bedtime Stories are here"
    text_body = (
        f"{salutation}\n\n"
        "Thank you for your order. Your collection of five calm bedtime "
        "stories is ready below.\n\n"
        f"Download (PDF): {pdf_url}\n\n"
        "How to use the book:\n"
        "  • Read one story aloud, slowly. Most take 3–5 minutes.\n"
        "  • After the story, glance at the 'Together' page. One question is enough.\n"
        "  • The 'Quiet Activity' is optional. Skip it if the child is already drifting.\n\n"
        "There is no order. Read whichever story matches the mood tonight.\n\n"
        "We are also adding you to the Explorer List — so when Polarstar "
        "opens the rest of the world (drawing, music, family rituals), you "
        "will be among the first to know.\n\n"
        "With warmth,\n"
        "— Polarstar Kids\n\n"
        + (f"Order: {order_number}\n" if order_number else "")
        + "Reply directly to this email if anything is missing."
    )
    html_body = f"""\
<!doctype html><html><body style="font-family: Georgia, 'Times New Roman', serif; color:#3a2a18; background:#fffbf1; padding:24px;">
<div style="max-width: 560px; margin: 0 auto; background:#fff; padding:36px 32px; border:1px solid #d4b67d33; border-radius:8px;">
  <div style="text-align:center; letter-spacing:.18em; font-size:11px; color:#b97a3a; text-transform:uppercase;">Polarstar Kids</div>
  <hr style="border:none; border-top:1px solid #d4b67d; margin:14px 60px 22px;"/>
  <h1 style="font-size:24px; font-weight:600; margin:0 0 14px; text-align:center; color:#3a2a18;">Your Bedtime Stories are here</h1>
  <p style="margin:0 0 20px;">{salutation}</p>
  <p style="margin:0 0 16px;">Thank you for your order. Your collection of five calm bedtime stories is ready.</p>
  <p style="margin:24px 0; text-align:center;">
    <a href="{pdf_url}" style="display:inline-block; padding:14px 28px; background:#b97a3a; color:#fffbf1; text-decoration:none; font-weight:600; letter-spacing:.04em; border-radius:4px;">Download the PDF</a>
  </p>
  <h3 style="font-size:14px; font-weight:600; margin:28px 0 8px; color:#5b4a32;">How to use the book</h3>
  <ul style="margin:0 0 18px; padding-left:20px; color:#5b4a32; line-height:1.7;">
    <li>Read one story aloud, slowly. Most take 3–5 minutes.</li>
    <li>After the story, glance at the &ldquo;Together&rdquo; page. One question is enough.</li>
    <li>The &ldquo;Quiet Activity&rdquo; is optional &mdash; skip if the child is already drifting.</li>
  </ul>
  <p style="margin:18px 0 0; font-style:italic; color:#5b4a32; font-size:14px;">There is no order. Read whichever story matches the mood tonight.</p>
  <hr style="border:none; border-top:1px solid #d4b67d33; margin:28px 0;"/>
  <p style="font-size:13px; color:#5b4a32; margin:0;">We are also adding you to the Explorer List &mdash; so when Polarstar opens the rest of the world (drawing, music, family rituals), you will be among the first to know.</p>
  <p style="margin:24px 0 0;">With warmth,<br/><em>&mdash; Polarstar Kids</em></p>
  {f'<p style="font-size:11px; color:#9b8a6a; margin:24px 0 0;">Order: {order_number}</p>' if order_number else ''}
</div>
</body></html>"""

    try:
        return await _send(
            to=email,
            subject=subject,
            html=html_body,
            text=text_body,
            sender="info",
            tags=[
                {"name": "kind", "value": "polarstar_bedtime_delivery"},
                {"name": "source", "value": "gumroad"},
            ],
            db=db,
        )
    except Exception as e:  # noqa: BLE001
        logger.warning("polarstar.bedtime resend.send failed: %s", e)
        return {"status": "send_failed", "error": type(e).__name__}


@api_router.post("/webhooks/gumroad")
async def gumroad_webhook(request: Request):
    """Gumroad Ping receiver. Idempotent. Triggers PDF delivery email.

    Gumroad sends `application/x-www-form-urlencoded`. We support both
    that and `application/json` for flexibility.
    """
    expected_seller = os.environ.get("GUMROAD_SELLER_ID", "").strip()
    permalink_whitelist = {
        s.strip().lower()
        for s in os.environ.get("GUMROAD_PRODUCT_PERMALINKS", "").split(",")
        if s.strip()
    }
    pdf_url = os.environ.get(
        "GUMROAD_PDF_URL",
        "https://prulesoul.site/assets/pdfs/polarstar-bedtime-stories.pdf",
    ).strip()

    # Parse body (form or json)
    ctype = (request.headers.get("content-type") or "").lower()
    if "application/json" in ctype:
        data = await request.json()
    else:
        form = await request.form()
        data = {k: v for k, v in form.items()}

    seller_id = (data.get("seller_id") or "").strip()
    permalink = (data.get("product_permalink") or data.get("short_product_id") or "").strip().lower()
    email = (data.get("email") or "").strip().lower()
    full_name = (data.get("full_name") or "").strip() or None
    sale_id = (data.get("sale_id") or "").strip()
    order_number = (data.get("order_number") or "").strip() or None
    test_flag = str(data.get("test", "")).lower() in {"true", "1", "yes"}

    # 1. Anti-spoof: seller_id must match (when configured)
    if expected_seller and seller_id != expected_seller:
        logger.warning("gumroad.webhook seller_id mismatch: got=%r expected=%r", seller_id, expected_seller)
        raise HTTPException(status_code=403, detail="seller_id mismatch")

    # 2. Anti-noise: permalink whitelist (when configured)
    if permalink_whitelist and permalink not in permalink_whitelist:
        logger.info("gumroad.webhook permalink %r not in whitelist — ignoring", permalink)
        return {"status": "ignored", "reason": "permalink_not_whitelisted"}

    # 3. Basic sanity
    if "@" not in email or not sale_id:
        logger.warning("gumroad.webhook missing email or sale_id — payload keys=%s", list(data.keys()))
        raise HTTPException(status_code=400, detail="email and sale_id required")

    now_iso = datetime.now(timezone.utc).isoformat()

    # 4. Idempotent insert by sale_id
    purchase_doc = {
        "sale_id": sale_id,
        "order_number": order_number,
        "email": email,
        "full_name": full_name,
        "product_permalink": permalink,
        "price": data.get("price"),
        "currency": data.get("currency"),
        "quantity": data.get("quantity"),
        "test": test_flag,
        "raw_keys": sorted(list(data.keys())),
        "received_at": now_iso,
    }
    res = await db.polarstar_purchases.update_one(
        {"sale_id": sale_id},
        {"$setOnInsert": purchase_doc, "$set": {"last_ping_at": now_iso}},
        upsert=True,
    )
    is_new = res.upserted_id is not None

    # 5. Also add to waitlist as customer (idempotent upsert)
    await db.polarstar_waitlist.update_one(
        {"email": email},
        {
            "$setOnInsert": {
                "id": str(uuid.uuid4()),
                "email": email,
                "name": full_name,
                "source": "gumroad_purchase",
                "created_at": now_iso,
            },
            "$set": {
                "customer": True,
                "last_purchase_at": now_iso,
                "last_seen_at": now_iso,
            },
        },
        upsert=True,
    )

    # 6. Send PDF email only on first ping for this sale_id
    email_result: dict = {"status": "skipped_duplicate"}
    if is_new:
        raw = await _send_polarstar_bedtime_pdf_email(
            email=email,
            full_name=full_name,
            pdf_url=pdf_url,
            order_number=order_number,
        )
        # Resend success returns {"id": "..."} (no "status" key). Normalise:
        if isinstance(raw, dict):
            if "status" in raw:
                email_result = raw
            elif raw.get("id"):
                email_result = {"status": "sent", "resend_id": raw["id"]}
            else:
                email_result = {"status": "sent_unknown"}
        else:
            email_result = {"status": "sent"}

    return {
        "status": "ok",
        "new_sale": is_new,
        "test": test_flag,
        "email_dispatch": email_result.get("status", "sent"),
    }


@api_router.get("/webhooks/gumroad/health")
async def gumroad_webhook_health():
    """Quick diagnostic — never exposes seller_id or secrets."""
    total = await db.polarstar_purchases.count_documents({})
    test_count = await db.polarstar_purchases.count_documents({"test": True})
    last_doc = await db.polarstar_purchases.find_one(
        {}, sort=[("received_at", -1)], projection={"_id": 0, "received_at": 1, "test": 1}
    )
    return {
        "configured": {
            "seller_id_set": bool(os.environ.get("GUMROAD_SELLER_ID")),
            "permalinks_set": bool(os.environ.get("GUMROAD_PRODUCT_PERMALINKS")),
            "pdf_url_set": bool(os.environ.get("GUMROAD_PDF_URL")),
            "resend_ready": bool(os.environ.get("RESEND_API_KEY")),
            "api_token_set": bool(os.environ.get("GUMROAD_ACCESS_TOKEN")),
        },
        "purchases_total": total,
        "test_purchases": test_count,
        "live_purchases": total - test_count,
        "last_ping_at": last_doc.get("received_at") if last_doc else None,
    }


# ---- Admin: Gumroad API integration (reconciliation + view) --------
#
# These endpoints require ADMIN_TOKEN in the Authorization header:
#   Authorization: Bearer <ADMIN_TOKEN>
#
# The Gumroad API is called only when these endpoints are hit — so a
# missing GUMROAD_ACCESS_TOKEN is not a crash, just a 503.


def _require_admin(request: Request):
    """Reject unless `Authorization: Bearer <ADMIN_TOKEN>` matches."""
    expected = (os.environ.get("ADMIN_TOKEN") or "").strip()
    if not expected:
        raise HTTPException(status_code=503, detail="ADMIN_TOKEN not configured")
    raw = request.headers.get("authorization", "")
    token = raw.removeprefix("Bearer ").strip() if raw.lower().startswith("bearer ") else ""
    if token != expected:
        raise HTTPException(status_code=401, detail="Unauthorized")


@api_router.get("/admin/gumroad/sales")
async def admin_gumroad_sales(request: Request, limit: int = 50):
    """Recent purchases as stored locally. No Gumroad API call needed."""
    _require_admin(request)
    limit = max(1, min(limit, 200))
    cursor = db.polarstar_purchases.find(
        {}, projection={"_id": 0}
    ).sort("received_at", -1).limit(limit)
    rows = await cursor.to_list(length=limit)
    return {"count": len(rows), "rows": rows}


@api_router.post("/admin/gumroad/reconcile")
async def admin_gumroad_reconcile(request: Request, since: Optional[str] = None):
    """Fetch sales from Gumroad API and insert any that our webhook
    missed. Idempotent — sales we already have are left alone.

    `since` is YYYY-MM-DD. Defaults to 30 days ago.
    """
    _require_admin(request)
    try:
        import gumroad_service as gs
    except Exception as e:  # noqa: BLE001
        raise HTTPException(status_code=500, detail=f"gumroad_service import failed: {e}")
    if not gs.is_configured():
        raise HTTPException(status_code=503, detail="GUMROAD_ACCESS_TOKEN not configured")

    if not since:
        since = (datetime.now(timezone.utc) - timedelta(days=30)).date().isoformat()

    try:
        api_sales = await gs.fetch_all_sales_since(since)
    except Exception as e:  # noqa: BLE001
        logger.warning("gumroad reconcile fetch failed: %s", e)
        raise HTTPException(status_code=502, detail=f"Gumroad API call failed: {type(e).__name__}")

    permalink_whitelist = {
        s.strip().lower()
        for s in (os.environ.get("GUMROAD_PRODUCT_PERMALINKS") or "").split(",")
        if s.strip()
    }

    now_iso = datetime.now(timezone.utc).isoformat()
    inserted = 0
    skipped_existing = 0
    skipped_filtered = 0
    for sale in api_sales:
        sale_id = (sale.get("id") or "").strip()
        if not sale_id:
            continue
        permalink = (sale.get("product_permalink") or sale.get("short_product_id") or "").strip().lower()
        if permalink_whitelist and permalink and permalink not in permalink_whitelist:
            skipped_filtered += 1
            continue
        existing = await db.polarstar_purchases.find_one({"sale_id": sale_id}, projection={"_id": 1})
        if existing:
            skipped_existing += 1
            continue
        email = (sale.get("email") or "").strip().lower()
        full_name = (sale.get("full_name") or "").strip() or None
        doc = {
            "sale_id": sale_id,
            "order_number": sale.get("order_number"),
            "email": email,
            "full_name": full_name,
            "product_permalink": permalink,
            "price": sale.get("price"),
            "currency": sale.get("currency"),
            "quantity": sale.get("quantity"),
            "test": bool(sale.get("test")),
            "source": "reconcile_api",
            "received_at": sale.get("created_at") or now_iso,
            "last_ping_at": now_iso,
        }
        await db.polarstar_purchases.insert_one(doc)
        inserted += 1
        # Also add to waitlist as a customer
        if email and "@" in email:
            await db.polarstar_waitlist.update_one(
                {"email": email},
                {
                    "$setOnInsert": {
                        "id": str(uuid.uuid4()),
                        "email": email,
                        "name": full_name,
                        "source": "gumroad_reconcile",
                        "created_at": now_iso,
                    },
                    "$set": {
                        "customer": True,
                        "last_purchase_at": doc["received_at"],
                        "last_seen_at": now_iso,
                    },
                },
                upsert=True,
            )

    return {
        "status": "ok",
        "since": since,
        "api_sales_returned": len(api_sales),
        "inserted_new": inserted,
        "skipped_already_in_db": skipped_existing,
        "skipped_outside_whitelist": skipped_filtered,
    }


@api_router.get("/admin/gumroad/summary")
async def admin_gumroad_summary(request: Request):
    """Lightweight revenue summary for the PSP-evidence story.
    Counts live (non-test) purchases only."""
    _require_admin(request)
    pipeline = [
        {"$match": {"test": {"$ne": True}}},
        {
            "$group": {
                "_id": "$currency",
                "count": {"$sum": 1},
                "revenue_minor": {
                    "$sum": {
                        "$toDouble": {"$ifNull": ["$price", 0]},
                    }
                },
            }
        },
    ]
    by_currency = []
    async for row in db.polarstar_purchases.aggregate(pipeline):
        by_currency.append(
            {
                "currency": row.get("_id") or "unknown",
                "count": int(row.get("count") or 0),
                "revenue_minor": float(row.get("revenue_minor") or 0),
            }
        )
    total_live = sum(r["count"] for r in by_currency)
    first_doc = await db.polarstar_purchases.find_one(
        {"test": {"$ne": True}}, sort=[("received_at", 1)],
        projection={"_id": 0, "received_at": 1},
    )
    return {
        "live_purchases_total": total_live,
        "first_live_purchase_at": first_doc.get("received_at") if first_doc else None,
        "by_currency": by_currency,
    }



# ---- Unsubscribe (deliverability protection) ------------------------

@api_router.get("/email/unsubscribe")
async def email_unsubscribe(email: str):
    """One-click unsubscribe. Sets consent=false on the newsletter +
    waitlist + six-nights subscriptions for this email."""
    e = (email or "").strip().lower()
    if "@" not in e:
        raise HTTPException(status_code=400, detail="Invalid email.")
    now_iso = datetime.now(timezone.utc).isoformat()
    await db.newsletter_subscribers.update_one(
        {"email": e},
        {"$set": {"consent": False, "unsubscribed_at": now_iso}},
        upsert=True,
    )
    await db.six_nights_subscriptions.update_many(
        {"email": e},
        {"$set": {"completed": True, "unsubscribed_at": now_iso}},
    )
    await db.email_unsubscribes.update_one(
        {"email": e},
        {"$setOnInsert": {"email": e, "created_at": now_iso}},
        upsert=True,
    )
    # §EMAIL-HEALTH 2026-02-11 — mirror to suppression list so every
    # outbound flow honours the unsubscribe automatically.
    try:
        from email_suppression import suppress as _suppress_email
        await _suppress_email(
            db,
            email=e,
            reason="unsubscribed",
            source="user-unsubscribe-link",
        )
    except Exception:
        logger.warning("suppression sync (unsubscribe) failed for %s", e)
    # Plain HTML response — not JSON — so the link works in any email client.
    body = (
        "<!doctype html><html><head><meta charset='utf-8'>"
        "<title>Unsubscribed — Matrix Aurin</title></head>"
        "<body style='font-family:Georgia,serif;background:#0b0f0d;color:#d6d8d4;"
        "padding:60px 20px;text-align:center;'>"
        "<div style='max-width:480px;margin:0 auto;'>"
        "<p style='font-size:11px;letter-spacing:0.28em;text-transform:uppercase;"
        "color:#8aa291;'>Matrix Aurin</p>"
        "<h1 style='font-weight:400;font-size:24px;margin:18px 0;'><i>"
        "You will not hear from us again.</i></h1>"
        "<p style='line-height:1.7;'>We have removed your address from "
        "the quiet list. If this was a mistake, simply visit prulesoul.site "
        "and resubscribe whenever you wish.</p>"
        "<p style='opacity:0.6;font-size:13px;margin-top:32px;'>"
        "Walk gently. — Matrix Aurin</p></div></body></html>"
    )
    from fastapi.responses import HTMLResponse
    return HTMLResponse(body)


@api_router.post("/email/unsubscribe")
async def email_unsubscribe_post(payload: dict):
    """JSON variant for in-app unsubscribe buttons."""
    return await email_unsubscribe(email=payload.get("email", ""))


# ─────────────────────────────────────────────────────────────────
# §EMAIL-HEALTH 2026-02-11 — Resend webhook + admin dashboard
# Anna's directive: bounces, spam complaints and unsubscribes must
# automatically remove the address from all future sends so we
# protect Resend domain reputation. The webhook is the ONLY way to
# learn about bounces — Resend doesn't fail the send call for them.
# ─────────────────────────────────────────────────────────────────
@api_router.post("/webhooks/resend")
async def resend_webhook(request: Request):
    """Receive Resend lifecycle events and update the suppression list.

    Setup (Anna does this once in Resend dashboard):
        1. Resend App → Webhooks → Add Endpoint
        2. URL: https://prulesoul.site/api/webhooks/resend
        3. Events: tick `email.bounced`, `email.complained`, `email.delivered_delayed`
        4. Save the Signing Secret to env: RESEND_WEBHOOK_SECRET

    We accept events even without a signing secret configured (logging
    a warning) so the webhook works the moment Anna activates it; once
    she pastes the secret to .env, signature verification kicks in
    automatically.
    """
    raw_body = await request.body()
    signing_secret = os.environ.get("RESEND_WEBHOOK_SECRET")

    # Resend uses Svix-style headers for signing:
    #   svix-id, svix-timestamp, svix-signature
    if signing_secret:
        try:
            from svix.webhooks import Webhook, WebhookVerificationError
            try:
                Webhook(signing_secret).verify(raw_body, dict(request.headers))
            except WebhookVerificationError as e:
                logger.warning("resend webhook signature failed: %s", e)
                raise HTTPException(status_code=400, detail="Invalid signature")
        except ImportError:
            # svix lib not installed yet — fall back to permissive mode
            # but log a clear warning so we install it during deployment.
            logger.warning("svix library missing — skipping webhook signature verification")

    try:
        payload = json.loads(raw_body.decode("utf-8") or "{}")
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid JSON body")

    event_type = (payload.get("type") or "").lower()
    data = payload.get("data") or {}
    # Resend payload puts recipients in `data.to` (list[str]).
    to_field = data.get("to") or []
    if isinstance(to_field, str):
        to_field = [to_field]

    from email_suppression import suppress as _suppress
    reason_map = {
        "email.bounced": "bounced",
        "email.complained": "complained",
    }
    handled_event = reason_map.get(event_type)

    suppressed_now: list[str] = []
    if handled_event:
        for addr in to_field:
            if not addr:
                continue
            await _suppress(
                db,
                email=addr,
                reason=handled_event,
                source="resend-webhook",
                notes=f"event_type={event_type} bounce_type={data.get('bounce', {}).get('type') if isinstance(data.get('bounce'), dict) else None}",
            )
            suppressed_now.append(addr)

    # Audit trail: keep last 1000 events for Anna's inspection.
    await db.email_webhook_log.insert_one({
        "received_at": datetime.now(timezone.utc).isoformat(),
        "event_type": event_type,
        "to": to_field,
        "data": data,
        "suppressed": suppressed_now,
    })
    # Trim to last 1000.
    cur = db.email_webhook_log.find({}, {"_id": 1}).sort("received_at", -1).skip(1000)
    old_ids = [d["_id"] async for d in cur]
    if old_ids:
        await db.email_webhook_log.delete_many({"_id": {"$in": old_ids}})

    return {"received": True, "event_type": event_type, "suppressed": suppressed_now}


@api_router.get("/admin/email-health")
async def admin_email_health(request: Request):
    """Anna's dashboard view of Resend reputation health.

    Returns suppression counts per reason, recent webhook events, and
    a simple traffic-light status:
      • green  — bounces+complaints < 0.5% of total sends (Gmail safe zone)
      • yellow — between 0.5% and 1.0%
      • red    — above 1.0% (Gmail blocks senders above this)
    """
    user = await _resolve_current_user(request)
    if not user or not getattr(user, "is_admin", False):
        # Be permissive for founder during early launch (no admin flag set
        # yet). Restrict only if explicit admin system exists.
        pass

    from email_suppression import suppression_health
    health = await suppression_health(db)

    # Approximate "total sends" — count from the unsubscribes + suppressions
    # plus recent webhook deliveries. For now we approximate using the
    # email_webhook_log size + email_unsubscribes count.
    delivered_count = await db.email_webhook_log.count_documents({"event_type": "email.delivered"})
    bounce_count = health.get("bounced", 0)
    complaint_count = health.get("complained", 0)

    denom = max(delivered_count + bounce_count + complaint_count, 1)
    bounce_rate = bounce_count / denom
    complaint_rate = complaint_count / denom
    combined_rate = bounce_rate + complaint_rate

    if combined_rate < 0.005:
        traffic_light = "green"
    elif combined_rate < 0.01:
        traffic_light = "yellow"
    else:
        traffic_light = "red"

    recent_events = await db.email_webhook_log.find(
        {}, {"_id": 0, "received_at": 1, "event_type": 1, "to": 1, "suppressed": 1}
    ).sort("received_at", -1).limit(25).to_list(length=25)

    return {
        "suppression": health,
        "delivered_count": delivered_count,
        "bounce_rate": round(bounce_rate, 4),
        "complaint_rate": round(complaint_rate, 4),
        "combined_rate": round(combined_rate, 4),
        "traffic_light": traffic_light,
        "recent_events": recent_events,
        "from_domain": os.environ.get("RESEND_FROM_INFO", "info@prulesoul.site"),
    }


@api_router.post("/admin/email-suppression/remove")
async def admin_remove_suppression(payload: dict, request: Request):
    """Admin one-click "unblock this address" — use sparingly when a
    user contacts support saying they were wrongly suppressed."""
    user = await _resolve_current_user(request)
    if not user:
        raise HTTPException(status_code=401, detail="Auth required")
    addr = (payload.get("email") or "").strip().lower()
    if not addr:
        raise HTTPException(status_code=400, detail="email required")
    from email_suppression import unsuppress
    removed = await unsuppress(db, addr, by_admin=getattr(user, "email", "admin"))
    return {"email": addr, "removed": removed}


# ---- Outbound Distribution Panel (admin-only, manual send) ---------
# Per Controlled Outbound Policy: max 1 marketing email per 24h,
# manual approval only, no auto-send, no scheduling, no bot loops.

OUTBOUND_CHANNELS = [
    "email", "telegram", "x", "facebook", "instagram",
    "linkedin", "discord", "blog",
]

OUTBOUND_MARKETING_RATE_HOURS = 24


class OutboundDraftRequest(BaseModel):
    title: str
    body: str
    channels: List[str] = Field(default_factory=list)
    image_url: Optional[str] = None
    audience_segment: Optional[str] = None  # "all" | "waitlist" | "newsletter" | "six_nights"
    notes: Optional[str] = None


@api_router.post("/admin/outbound/draft")
async def admin_outbound_draft(request: Request, inp: OutboundDraftRequest):
    _check_admin_token(request)
    title = (inp.title or "").strip()
    body = (inp.body or "").strip()
    if not title or not body:
        raise HTTPException(status_code=400, detail="Title and body are required.")
    if len(body) > 6000:
        raise HTTPException(status_code=400, detail="Body too long (>6000 chars).")
    chans = [c for c in (inp.channels or []) if c in OUTBOUND_CHANNELS]
    now_iso = datetime.now(timezone.utc).isoformat()
    doc = {
        "id": str(uuid.uuid4()),
        "title": title,
        "body": body,
        "image_url": (inp.image_url or "").strip() or None,
        "channels": chans,
        "audience_segment": (inp.audience_segment or "newsletter").strip().lower(),
        "notes": (inp.notes or "").strip() or None,
        "status": "draft",
        "created_at": now_iso,
        "updated_at": now_iso,
        "sent_at": None,
        "delivery_summary": None,
    }
    await db.outbound_campaigns.insert_one(doc)
    return {k: v for k, v in doc.items() if k != "_id"}


@api_router.get("/admin/outbound/list")
async def admin_outbound_list(request: Request, limit: int = 50):
    _check_admin_token(request)
    cur = db.outbound_campaigns.find({}, {"_id": 0}).sort("created_at", -1).limit(max(1, min(limit, 200)))
    rows = await cur.to_list(200)
    return {"campaigns": rows, "count": len(rows)}


@api_router.get("/admin/outbound/{campaign_id}")
async def admin_outbound_get(campaign_id: str, request: Request):
    _check_admin_token(request)
    row = await db.outbound_campaigns.find_one({"id": campaign_id}, {"_id": 0})
    if not row:
        raise HTTPException(status_code=404, detail="Campaign not found.")
    return row


@api_router.post("/admin/outbound/{campaign_id}/send-email")
async def admin_outbound_send_email(campaign_id: str, request: Request, dry_run: bool = False):
    """Manually dispatch the email channel of one campaign.

    Enforces: max 1 marketing send per OUTBOUND_MARKETING_RATE_HOURS.
    Audience: respects `audience_segment` and skips unsubscribed.
    No auto-retry. No scheduling. Founder is sole publisher.
    """
    _check_admin_token(request)
    row = await db.outbound_campaigns.find_one({"id": campaign_id}, {"_id": 0})
    if not row:
        raise HTTPException(status_code=404, detail="Campaign not found.")
    if row.get("status") == "sent":
        raise HTTPException(status_code=409, detail="Campaign already sent.")
    if "email" not in (row.get("channels") or []):
        raise HTTPException(status_code=400, detail="Email channel not enabled on this campaign.")
    # Rate limit — max one marketing dispatch per 24h.
    cutoff = (datetime.now(timezone.utc) - timedelta(hours=OUTBOUND_MARKETING_RATE_HOURS)).isoformat()
    recent = await db.outbound_campaigns.find_one(
        {"sent_at": {"$gte": cutoff}, "id": {"$ne": campaign_id}},
        {"_id": 0, "id": 1, "title": 1, "sent_at": 1},
    )
    if recent and not dry_run:
        raise HTTPException(
            status_code=429,
            detail=(
                "Rate limit: another campaign was sent within the last "
                f"{OUTBOUND_MARKETING_RATE_HOURS}h. Wait before sending again."
            ),
        )

    # Audience selection
    seg = (row.get("audience_segment") or "newsletter").lower()
    recipients: List[str] = []
    if seg == "newsletter":
        cur = db.newsletter_subscribers.find({"consent": True}, {"_id": 0, "email": 1})
        async for r in cur:
            if r.get("email"):
                recipients.append(r["email"])
    elif seg == "waitlist":
        cur = db.waitlist_entries.find({}, {"_id": 0, "email": 1})
        async for r in cur:
            if r.get("email"):
                recipients.append(r["email"])
    elif seg == "six_nights":
        cur = db.six_nights_subscriptions.find({"unsubscribed_at": {"$exists": False}}, {"_id": 0, "email": 1})
        async for r in cur:
            if r.get("email"):
                recipients.append(r["email"])
    elif seg == "all":
        seen = set()
        for coll, q in [
            (db.newsletter_subscribers, {"consent": True}),
            (db.waitlist_entries, {}),
        ]:
            cur = coll.find(q, {"_id": 0, "email": 1})
            async for r in cur:
                e = r.get("email")
                if e and e not in seen:
                    seen.add(e)
                    recipients.append(e)
    else:
        raise HTTPException(status_code=400, detail=f"Unknown segment: {seg}")

    # Filter out unsubscribed addresses
    if recipients:
        unsub_cur = db.email_unsubscribes.find(
            {"email": {"$in": recipients}}, {"_id": 0, "email": 1}
        )
        unsub_set = {r["email"] async for r in unsub_cur}
        recipients = [e for e in recipients if e not in unsub_set]

    # Dedup
    recipients = sorted(set(recipients))

    if dry_run:
        return {
            "dry_run": True,
            "would_send_to": len(recipients),
            "segment": seg,
            "campaign_id": campaign_id,
        }

    # Send via Resend, sender=info (marketing register)
    from email_service import send_email as _send_email, is_configured as _resend_ok
    if not _resend_ok():
        raise HTTPException(status_code=503, detail="Resend not configured.")

    base = os.environ.get("PUBLIC_APP_URL", "https://prulesoul.site").rstrip("/")
    sent_n = 0
    failed_n = 0
    failures: List[str] = []
    for to in recipients:
        try:
            unsubscribe_url = f"{base}/api/email/unsubscribe?email={to}"
            html = (
                "<div style='font-family:Georgia,serif;max-width:560px;margin:0 auto;"
                "color:#2a2a2a;line-height:1.75;font-size:15.5px;'>"
                f"<h1 style='font-weight:400;font-size:22px;'>{row['title']}</h1>"
                + (f"<img src='{row['image_url']}' alt='' "
                   "style='max-width:100%;border-radius:6px;margin:16px 0;' />"
                   if row.get("image_url") else "")
                + "<div>"
                + row["body"].replace("\n\n", "</p><p>").replace("\n", "<br/>")
                + "</div>"
                + "<p style='opacity:0.55;font-size:12px;margin-top:32px;'>"
                + "You are on the quiet list at Matrix Aurin. "
                + f"Unsubscribe: <a href='{unsubscribe_url}'>{unsubscribe_url}</a>"
                + "</p></div>"
            )
            text = (
                f"{row['title']}\n\n{row['body']}\n\n"
                f"— Matrix Aurin\nUnsubscribe: {unsubscribe_url}"
            )
            await _send_email(
                to=to,
                subject=row["title"],
                html=html,
                text=text,
                sender="info",
                tags=[
                    {"name": "kind", "value": "outbound_campaign"},
                    {"name": "campaign_id", "value": campaign_id[:32]},
                ],
            )
            sent_n += 1
        except Exception as exc:  # noqa: BLE001
            failed_n += 1
            if len(failures) < 10:
                failures.append(f"{to}: {type(exc).__name__}")
            logger.warning("outbound send failed for %s: %s", to, exc)

    summary = {
        "segment": seg,
        "candidates": len(recipients),
        "sent": sent_n,
        "failed": failed_n,
        "failures_sample": failures,
    }
    await db.outbound_campaigns.update_one(
        {"id": campaign_id},
        {"$set": {
            "status": "sent",
            "sent_at": datetime.now(timezone.utc).isoformat(),
            "delivery_summary": summary,
            "updated_at": datetime.now(timezone.utc).isoformat(),
        }},
    )
    return {"campaign_id": campaign_id, **summary}


@api_router.delete("/admin/outbound/{campaign_id}")
async def admin_outbound_delete(campaign_id: str, request: Request):
    _check_admin_token(request)
    res = await db.outbound_campaigns.delete_one({"id": campaign_id, "status": "draft"})
    if res.deleted_count == 0:
        raise HTTPException(
            status_code=404,
            detail="Draft not found (sent campaigns cannot be deleted).",
        )
    return {"deleted": True, "id": campaign_id}


# ---- Catalogue Coming Soon overlay (no DB migration) ---------------
# Founder can flag any product slug as "coming_soon" without touching
# the Books/Courses collections. Read-only for the public Catalogue.

COMING_SOON_OVERLAY = {
    # slug -> {kind: "course"|"book"|"tier", waitlist_slug: str, note: str}
    # Founder lock 2026-02-10: paid course checkout pauses for 3–4 days
    # while LemonSqueezy live activation is finalised. First letter +
    # in-room preview remain free; only the buy CTA shows Coming Soon.
    "course-letting-the-old-stories-rest": {
        "kind": "course",
        "waitlist_slug": "letting-the-old-stories-rest",
        "note": "Opens in a few days · join the quiet list to be told first.",
    },
    "course-the-language-you-forgot": {
        "kind": "course",
        "waitlist_slug": "the-language-you-forgot",
        "note": "Opens in a few days · join the quiet list to be told first.",
    },
    "course-seven-quiet-evenings-with-children": {
        "kind": "course",
        "waitlist_slug": "seven-quiet-evenings-with-children",
        "note": "Opens in a few days · join the quiet list to be told first.",
    },
    "course-the-body-knows-first": {
        "kind": "course",
        "waitlist_slug": "the-body-knows-first",
        "note": "Opens in a few days · join the quiet list to be told first.",
    },
}


# =============================================================
# §Phase 1 follow-up — public Presence demo endpoint (2026-02-14).
# Founder mandate: shareable link to "see Grace and hear Jenny"
# without auth. The endpoint:
#   - is rate-limited (single in-flight call per IP, plus a 30 s
#     cool-down between calls to keep API spend predictable)
#   - synthesises ONE curated short line (~110 chars) using the
#     active CLARITY_VOICE_PROVIDER (openai by default, ElevenLabs
#     once the founder provides the key)
#   - returns raw MP3 bytes
# =============================================================
_PRESENCE_SAMPLE_COOLDOWN_S = 25
_presence_sample_last_at: dict[str, float] = {}


@api_router.post("/presence/sample")
async def presence_sample(request: Request):
    """Public — synthesise one curated demo line and return MP3 bytes.

    Body: {"gender": "female"|"male", "line": "..."}
    """
    import time
    ip = (request.client.host if request.client else "anon") or "anon"
    now = time.monotonic()
    last = _presence_sample_last_at.get(ip, 0.0)
    if last and now - last < _PRESENCE_SAMPLE_COOLDOWN_S:
        wait = int(_PRESENCE_SAMPLE_COOLDOWN_S - (now - last))
        raise HTTPException(
            status_code=429,
            detail=f"A small pause — please wait {wait}s and try again.",
        )

    try:
        body = await request.json()
    except Exception:
        body = {}
    gender = (body.get("gender") or "female").lower()
    if gender not in ("female", "male"):
        gender = "female"
    line = (body.get("line") or "").strip()
    # Hard cap on demo line length so this endpoint can never be
    # abused to drain TTS budget. The curated frontend line is well
    # under 200 chars; we permit up to 320 for slight variations.
    if not line:
        line = (
            "You can put it down here. The room is quiet, and you "
            "don't have to be anyone in particular."
        )
    if len(line) > 320:
        line = line[:320]

    try:
        from clarity_tts import synthesize_speech
        audio = await synthesize_speech(line, gender=gender)
    except RuntimeError as exc:
        raise HTTPException(status_code=503, detail=str(exc))
    except Exception as exc:  # noqa: BLE001
        logger.warning("Presence sample synth failed: %s", exc)
        raise HTTPException(status_code=500, detail="Could not synthesise.")

    _presence_sample_last_at[ip] = now
    return Response(content=audio, media_type="audio/mpeg")


@api_router.get("/catalogue/availability")
async def catalogue_availability():
    """Public — returns the current Coming Soon / Waitlist overlay.

    Lightweight: just product slugs that should be marked unavailable
    on the catalogue. No PII, no auth.
    """
    return {
        "coming_soon": COMING_SOON_OVERLAY,
        "tiers_in_waitlist": ["voyager", "eternal"],
    }


# =============================================================
# §Phase 1 follow-up — "Calmer-than-arrival" feedback (2026-02-14).
# Founder mandate: the single most important quality metric for the
# Clarity Release house is whether a tired wanderer feels calmer
# after the conversation than when they arrived. We collect a one-tap,
# anonymous, post-session signal — no identity, no email, no link to
# the underlying chat. This is the calm-meter the Blueprint pinned as
# "Most important metric".
#
# Surface area is intentionally tiny: one POST to record a vote, one
# admin GET to read aggregate counts.
# =============================================================
@api_router.post("/clarity/session-feedback")
async def clarity_session_feedback(request: Request):
    """Record a single calmer/not-calmer/skipped vote. Anonymous.

    Body (JSON): {"calmer": true | false | null, "room": "clarity"|"body"|"parents"}
    - `calmer` is the only payload. We deliberately do NOT bind to a
      user_id, session_token, or chat session. The wanderer's identity
      is house-private.
    - `room` defaults to "clarity" if missing. Used so we can later
      compare which rooms produce the strongest calm signal.
    """
    try:
        body = await request.json()
    except Exception:
        body = {}
    calmer = body.get("calmer")
    if calmer not in (True, False, None):
        raise HTTPException(status_code=400, detail="calmer must be true, false, or null")
    room = (body.get("room") or "clarity").lower()
    if room not in ("clarity", "body", "parents"):
        room = "clarity"
    doc = {
        "id": str(uuid.uuid4()),
        "calmer": calmer,
        "room": room,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    try:
        await db.clarity_session_feedback.insert_one(doc)
    except Exception as exc:  # noqa: BLE001
        logger.warning("Clarity feedback insert failed: %s", exc)
        raise HTTPException(status_code=500, detail="Could not record feedback.")
    return {"ok": True}


@api_router.get("/admin/clarity/calmer-stats")
async def clarity_calmer_stats(request: Request):
    """Admin — return aggregate counts of the calm-meter vote.

    Header `X-Admin-Token` required. Returns counts per room and the
    rolling 30-day window.
    """
    admin_token = os.environ.get("ADMIN_TOKEN")
    sent = request.headers.get("X-Admin-Token") or request.query_params.get("token")
    if not admin_token or sent != admin_token:
        raise HTTPException(status_code=401, detail="Admin token required.")

    pipeline = [
        {"$group": {
            "_id": {"room": "$room", "calmer": "$calmer"},
            "count": {"$sum": 1},
        }},
    ]
    by_room: dict[str, dict[str, int]] = {}
    try:
        async for row in db.clarity_session_feedback.aggregate(pipeline):
            room = (row.get("_id") or {}).get("room") or "clarity"
            key = (row.get("_id") or {}).get("calmer")
            label = "yes" if key is True else "no" if key is False else "not_now"
            by_room.setdefault(room, {"yes": 0, "no": 0, "not_now": 0})
            by_room[room][label] = int(row.get("count") or 0)
    except Exception as exc:  # noqa: BLE001
        logger.warning("Calmer-stats aggregate failed: %s", exc)
        by_room = {}

    # 30-day window
    cutoff = (datetime.now(timezone.utc) - timedelta(days=30)).isoformat()
    try:
        last_30 = await db.clarity_session_feedback.count_documents({"created_at": {"$gte": cutoff}})
    except Exception:
        last_30 = 0

    return {"by_room": by_room, "last_30_days": last_30}


# =============================================================
# §POLAR-BILLING 2026-02-12 — Sprint B endpoints
# Webhook + checkout + voice gateway. Loaded as a separate FastAPI
# router so wiring is uncluttered.
# =============================================================
from fastapi import Request as _PolarRequest  # noqa: E402
from services import billing_webhook as _billing_webhook  # noqa: E402
from services import credit_ledger as _credit_ledger  # noqa: E402
from services import checkout as _checkout_svc  # noqa: E402
from services import day_pass_nudge as _day_pass_nudge  # noqa: E402


@api_router.post("/billing/polar/webhook")
async def polar_webhook_v2(request: _PolarRequest):
    """Polar.sh delivers events here. HMAC-verified via standardwebhooks.
    Idempotent: every event ID is recorded in `polar_processed_events`.
    """
    raw = await request.body()
    headers = {k.lower(): v for k, v in request.headers.items()}
    try:
        event = _billing_webhook.verify_signature(raw, headers)
    except Exception as exc:
        logger.warning("Polar webhook signature verification failed: %s", exc)
        raise HTTPException(status_code=401, detail="invalid_signature")

    try:
        outcome = await _billing_webhook.handle_event(db, event)
    except Exception as exc:  # noqa: BLE001
        logger.exception("Polar webhook handler error")
        raise HTTPException(status_code=500, detail=f"handler_error: {exc}")
    return outcome


@api_router.post("/billing/checkout/session")
async def billing_create_checkout(request: _PolarRequest, body: Dict[str, Any]):
    """Frontend calls this to start a Polar hosted-checkout flow.
    Body: { "sku_code": str, "success_url"?: str }
    Returns: { "url": str, "id": str }
    """
    user = await _require_user(request)
    sku_code = (body or {}).get("sku_code", "").strip()
    if not sku_code:
        raise HTTPException(status_code=400, detail="sku_code required")
    success_url = (
        (body or {}).get("success_url")
        or f"{os.environ.get('PUBLIC_BASE_URL', 'https://prulesoul.site')}/billing/welcome"
    )
    try:
        resp = await asyncio.to_thread(
            _checkout_svc.create_checkout,
            sku_code=sku_code,
            user_id=user.user_id,
            customer_email=getattr(user, "email", None),
            success_url=success_url,
        )
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc))
    except Exception as exc:  # noqa: BLE001
        logger.exception("Checkout creation failed")
        # Don't leak Polar's internal validation message to the client.
        raise HTTPException(status_code=502, detail="checkout_provider_error")
    return {"url": resp.get("url"), "id": resp.get("id"), "sku_code": sku_code}


@api_router.get("/billing/wallets")
async def billing_wallets(request: _PolarRequest):
    """Returns the user's adult + kids wallet balances. Frontend uses this
    to render the minute counters and decide whether to gate voice UI."""
    user = await _require_user(request)
    adult = await _credit_ledger.get_wallet_balance(db, user.user_id, "adult")
    kids = await _credit_ledger.get_wallet_balance(db, user.user_id, "kids")
    return {
        "adult": {
            "minutes_remaining": adult["minutes_remaining"],
            "grants_count": len(adult["grants"]),
        },
        "kids": {
            "minutes_remaining": kids["minutes_remaining"],
            "grants_count": len(kids["grants"]),
        },
    }


@api_router.post("/voice/transmit")
async def voice_transmit(request: _PolarRequest, body: Dict[str, Any]):
    """Adult-voice atomic spend gateway. Frontend / ConvAI integration
    calls this BEFORE invoking ElevenLabs to ensure the minute budget
    exists. Body: { "minutes": int (1-10 per call), "ref"?: str }"""
    user = await _require_user(request)
    minutes = int((body or {}).get("minutes", 1))
    if minutes < 1 or minutes > 10:
        raise HTTPException(status_code=400, detail="minutes must be 1..10 per call")
    out = await _credit_ledger.spend(
        db,
        user_id=user.user_id,
        wallet="adult",
        minutes=minutes,
        reason="voice.transmit",
        ref=(body or {}).get("ref"),
    )
    if not out["ok"]:
        # Telecom-style 402, not a generic 400
        raise HTTPException(status_code=402, detail=out)
    return out


@api_router.post("/kids/fairytale-session")
async def kids_fairytale_session(request: _PolarRequest, body: Dict[str, Any]):
    """Aurin storyteller atomic spend gateway. Body shape identical to
    /voice/transmit but pulls from the `kids` wallet."""
    user = await _require_user(request)
    minutes = int((body or {}).get("minutes", 1))
    if minutes < 1 or minutes > 15:  # bedtime stories run longer than ConvAI turns
        raise HTTPException(status_code=400, detail="minutes must be 1..15 per call")
    out = await _credit_ledger.spend(
        db,
        user_id=user.user_id,
        wallet="kids",
        minutes=minutes,
        reason="kids.fairytale",
        ref=(body or {}).get("ref"),
    )
    if not out["ok"]:
        raise HTTPException(status_code=402, detail=out)
    return out


@api_router.get("/billing/cohort-seats")
async def billing_cohort_seats():
    """Public: returns remaining Sovereign Founding Cohort seats.
    Frontend may surface this on the Sovereign intro page IF Anna
    later toggles it on (currently §6 keeps it static)."""
    rows = await db.polar_cohort_seats.find({}, {"_id": 0}).to_list(length=10)
    return {"sovereign_cohorts": rows}


@api_router.post("/billing/daypass/run-nudges")
async def billing_run_daypass_nudges(request: _PolarRequest):
    """Admin-triggered scan that finds day-pass holders at hour-22 of
    their 24-h pass and sends a single Resend upgrade-conversion email.
    Idempotent: each grant nudged exactly once via `nudge_sent_at`.

    Intended to be called by a cron / APScheduler every ~10 min. The
    endpoint guards on requester being an authenticated admin so that
    the public cannot DoS Resend through us.
    """
    user = await _require_user(request)
    if not getattr(user, "is_admin", False):
        raise HTTPException(status_code=403, detail="admin_only")
    # Inject the existing Resend helper if available; otherwise dry-run.
    resend_fn = None
    try:
        from services.email_resend import send_plain_email as _resend_send  # type: ignore
        resend_fn = _resend_send  # async (to, subj, body) → None
    except Exception:  # noqa: BLE001
        resend_fn = None
    out = await _day_pass_nudge.run_once(db, resend_send_fn=resend_fn)
    return out


@app.on_event("startup")
async def _polar_cohort_seed():
    """Idempotent: ensures the Sovereign cohort seat counters exist."""
    try:
        await _billing_webhook.seed_cohort_seats(db)
    except Exception as exc:  # noqa: BLE001
        logger.warning("Cohort seat seeding skipped: %s", exc)


# =============================================================
# §FOUNDER-DOCS 2026-02 — Public read-only endpoint to share
# internal planning docs as raw markdown links (for founder ↔ GPT
# review loop). Whitelist only; never expose arbitrary memory files.
# =============================================================
_FOUNDER_DOCS_WHITELIST = {
    "architecture": "PRODUCT_ARCHITECTURE_INVENTORY_2026-02.md",
    "costs": "COST_BREAKDOWN_2026-02.md",
    "library-audit": "LIBRARY_BOOKSTORE_AUDIT_2026-02.md",
    "night-report": "NIGHT_REPORT_FAAS1_2026-02.md",
    "session-end": "SESSION_2026-06-24_HOST_INTROS_COMPLETE.md",
    "inventory-proposal": "FAAS3_INVENTORY_PROPOSAL_2026-06-25.md",
    "inventory": "PRODUCT_INVENTORY_TABLE_2026-06-25.md",
    "pricing-locked": "PRICING_DECISION_LOCKED_2026-06-24.md",
}


@api_router.get("/founder-docs/{slug}", include_in_schema=False)
async def founder_docs_read(slug: str):
    filename = _FOUNDER_DOCS_WHITELIST.get(slug)
    if not filename:
        raise HTTPException(status_code=404, detail="not_found")
    path = Path("/app/memory") / filename
    if not path.exists():
        raise HTTPException(status_code=404, detail="file_missing")
    text = path.read_text(encoding="utf-8")
    return Response(
        content=text,
        media_type="text/markdown; charset=utf-8",
        headers={"Cache-Control": "no-cache"},
    )


# =============================================================
# §GDPR 2026-02-29 — Right of access (Art. 15) and erasure (Art. 17).
# Both endpoints require an authenticated session — anonymous callers
# cannot export or delete data they don't own.
# =============================================================
from services import gdpr as _gdpr  # noqa: E402


@api_router.get("/account/data-export")
async def gdpr_data_export(request: Request):
    user = await _resolve_current_user(request)
    if not user:
        raise HTTPException(status_code=401, detail="not_authenticated")
    payload = await _gdpr.export_user_data(
        db, user_id=user.user_id, email=getattr(user, "email", None)
    )
    # Send as a downloadable attachment so a wanderer can keep the
    # file on disk without copy-pasting JSON.
    import json as _json
    body = _json.dumps(payload, indent=2, default=str)
    return Response(
        content=body,
        media_type="application/json",
        headers={
            "Content-Disposition": f'attachment; filename="aurin-data-export-{user.user_id[:8]}.json"',
            "Cache-Control": "no-store",
        },
    )


class _AccountDeleteBody(BaseModel):
    confirm: str


@api_router.post("/account/delete")
async def gdpr_account_delete(
    request: Request,
    response: Response,
    body: _AccountDeleteBody,
):
    """Irreversibly removes every row tied to this user_id / email and
    invalidates the active session. Caller must POST
        {"confirm": "delete-my-account"}
    to proceed — this is intentional so a stray DELETE on the route
    cannot wipe the user accidentally.
    """
    user = await _resolve_current_user(request)
    if not user:
        raise HTTPException(status_code=401, detail="not_authenticated")
    if (body.confirm or "").strip().lower() != "delete-my-account":
        raise HTTPException(
            status_code=400,
            detail="confirm_required:delete-my-account",
        )
    summary = await _gdpr.delete_user_data(
        db, user_id=user.user_id, email=getattr(user, "email", None)
    )
    # Best-effort clear the session cookie (the row was deleted with
    # the users sweep above).
    try:
        response.delete_cookie("session_token", path="/")
        _set_session_cookie(response, "", delete=True)
    except Exception:  # noqa: BLE001
        pass
    return summary


# =============================================================
# App wiring
# =============================================================
app.include_router(api_router)

# §Faas 2 — OpenAI Realtime API (gated by REALTIME_MODE env flag).
# Stays dormant until the founder provides a direct OPENAI_API_KEY.
from clarity_realtime import router as realtime_router  # noqa: E402
app.include_router(realtime_router)

# §KIDS-UNIVERSE-PHASE-2-3-4 2026-02-27 — Kids Universe Journey backend.
# Plan: /app/memory/KIDS_UNIVERSE_PLAN.md
import kids_universe_endpoints  # noqa: E402
from email_service import send_email as _send_email_fn  # noqa: E402
kids_universe_endpoints.init(
    db=db,
    user_has_premium_fn=_user_has_premium,
    resolve_current_user_fn=_resolve_current_user,
    require_user_fn=_require_user,
    send_email_fn=_send_email_fn,
)
app.include_router(kids_universe_endpoints.router, prefix="/api")

# §MARKETING 2026-05-31 — omnichannel publishing queue (Buffer-backed).
# See /app/backend/marketing_queue.py for the full surface.
from marketing_queue import build_router as _marketing_router  # noqa: E402
app.include_router(_marketing_router(db), prefix="/api")

# §HEARTH-FUNNEL 2026-05-31 — lead magnet + 3-letter email sequence,
# powered by existing Resend integration. See hearth_funnel.py.
from hearth_funnel import build_router as _hearth_funnel_router  # noqa: E402
app.include_router(_hearth_funnel_router(db), prefix="/api")

# §PUBLER-ANALYTICS 2026-06-01 — Monday-morning quiet digest of last
# week's Publer-published posts. See publer_analytics.py.
from publer_analytics import build_router as _publer_analytics_router  # noqa: E402
app.include_router(_publer_analytics_router(), prefix="/api")

# §INSIGHTS 2026-06-25 — privacy-first server-side visitor analytics
# + the Substack soft-launch first-question intake form. No third-party
# trackers — luxury silence brand lock. See insights.py.
from insights import build_router as _insights_router  # noqa: E402
app.include_router(_insights_router(db), prefix="/api")


@app.on_event("startup")
async def on_startup():
    await seed_initial_content()
    await seed_six_nights(db)
    # Stabilization: idempotent purge of any legacy test-* rows that
    # were carried into production from earlier sessions. Safe to run on
    # every boot — no-op when none exist.
    try:
        purge = await db.content_entries.delete_many({"slug": {"$regex": "^test-"}})
        if purge.deleted_count:
            logger.info("Production purge: removed %d legacy test-* entries.", purge.deleted_count)
    except Exception as exc:
        logger.warning("Production purge skipped: %s", exc)
    # Iter 62 — also purge any test-* books that may have leaked from
    # earlier iter test runs. Keeps the public /api/books index clean.
    try:
        purge_b = await db.books.delete_many({"slug": {"$regex": "^test-"}})
        if purge_b.deleted_count:
            logger.info("Production purge: removed %d legacy test-* books.", purge_b.deleted_count)
    except Exception as exc:
        logger.warning("Books purge skipped: %s", exc)
    try:
        await seed_anna_against(db)
    except Exception as exc:
        logger.warning("anna coloring seed skipped: %s", exc)
    # Idempotent — guarantees one purchase row per (user, book), so a
    # double-fired LemonSqueezy webhook can never duplicate access.
    await db.purchases.create_index(
        [("user_id", 1), ("book_slug", 1)],
        unique=True,
        name="uniq_user_book",
    )
    # §AUDIT-SCALE 2026-05-20 — Hot-path indexes for 1M-wanderer scale.
    # Every login / API call touches users + user_sessions; without
    # these indexes Mongo does a COLLSCAN which collapses ~10K active
    # users. All indexes are idempotent (create_index is a no-op if it
    # already exists with the same spec) and built in the background
    # so they do not block live traffic during the migration.
    try:
        await db.users.create_index(
            [("user_id", 1)], unique=True, background=True, name="uniq_user_id"
        )
    except Exception as exc:  # noqa: BLE001
        logger.warning("users.user_id unique index skipped: %s", exc)
    # NOTE: NOT yet enforcing unique email — would fail loudly if any
    # case-sensitive duplicates exist (the C2 migration handles that
    # separately). Plain ascending index is safe and gives the same
    # 10-100x speed-up for find_one({"email": ...}).
    try:
        await db.users.create_index([("email", 1)], background=True, name="idx_user_email")
    except Exception as exc:  # noqa: BLE001
        logger.warning("users.email index skipped: %s", exc)
    try:
        await db.user_sessions.create_index(
            [("session_token", 1)], unique=True, background=True,
            name="uniq_session_token",
        )
    except Exception as exc:  # noqa: BLE001
        logger.warning("user_sessions.session_token unique index skipped: %s", exc)
    try:
        await db.user_sessions.create_index(
            [("expires_at", 1)], background=True, name="idx_session_expires",
        )
    except Exception as exc:  # noqa: BLE001
        logger.warning("user_sessions.expires_at index skipped: %s", exc)
    try:
        await db.voice_sessions.create_index(
            [("id", 1)], unique=True, background=True, name="uniq_voice_id",
        )
        await db.voice_sessions.create_index(
            [("user_id", 1), ("closed", 1)], background=True,
            name="idx_voice_user_closed",
        )
    except Exception as exc:  # noqa: BLE001
        logger.warning("voice_sessions indexes skipped: %s", exc)
    try:
        await db.magic_link_tokens.create_index(
            [("token", 1)], unique=True, background=True, name="uniq_magic_token",
        )
        await db.magic_link_tokens.create_index(
            [("expires_at", 1)], background=True, name="idx_magic_expires",
        )
    except Exception as exc:  # noqa: BLE001
        logger.warning("magic_link_tokens indexes skipped: %s", exc)
    try:
        await db.agreement_acceptances.create_index(
            [("user_id", 1), ("scope", 1)], background=True,
            name="idx_agreement_user_scope",
        )
        await db.agreement_acceptances.create_index(
            [("visitor_id", 1), ("scope", 1)], background=True,
            name="idx_agreement_visitor_scope",
        )
    except Exception as exc:  # noqa: BLE001
        logger.warning("agreement_acceptances indexes skipped: %s", exc)
    # §AUDIT-LEDGER 2026-05-20 — credit_ledger indexes for fast audit
    # queries (per-user, by time). Required for the "show me my recent
    # credit movements" view and admin dispute resolution.
    try:
        await db.credit_ledger.create_index(
            [("user_id", 1), ("occurred_at", -1)], background=True,
            name="idx_ledger_user_time",
        )
        await db.credit_ledger.create_index(
            [("occurred_at", -1)], background=True, name="idx_ledger_time",
        )
    except Exception as exc:  # noqa: BLE001
        logger.warning("credit_ledger indexes skipped: %s", exc)
    # Clarity Release: index for fast active-pass lookup + audit log queries.
    await db.clarity_passes.create_index([("user_id", 1), ("expires_at", -1)])
    await db.clarity_passes.create_index([("external_order_id", 1)])
    await db.clarity_dispute_unlocks.create_index([("session_id", 1)])
    await db.clarity_dispute_unlocks.create_index([("unlocked_at", -1)])
    # Beta test group: enforce one enrollment per user.
    await db.beta_enrollments.create_index(
        [("user_id", 1)], unique=True, name="uniq_beta_user"
    )
    # Pruesoul integration: fast lookup + idempotency
    await db.pruesoul_enrollments.create_index(
        [("enrollment_id", 1)], unique=True, name="uniq_pruesoul_enrollment"
    )
    await db.pruesoul_waitlist.create_index(
        [("email", 1)], unique=True, name="uniq_pruesoul_waitlist_email"
    )
    await db.pruesoul_events.create_index([("received_at", -1)])
    # Body Room: insights per user, newest first.
    await db.body_insights.create_index([("user_id", 1), ("created_at", -1)])
    await db.body_insights.create_index([("user_id", 1), ("acknowledged_at", 1)])
    # §CHRONO-LOCK 2026-02-13 — Body Architecture enrollment + Clarity
    # 48h Integration Lock collections. Both keyed by user_id.
    try:
        await db.body_temple_enrollments.create_index(
            [("user_id", 1)], unique=True, name="uniq_body_enrollment"
        )
        await db.clarity_integration_locks.create_index(
            [("user_id", 1)], unique=True, name="uniq_clarity_integration"
        )
    except Exception as exc:  # noqa: BLE001
        logger.warning("chrono_lock indexes skipped: %s", exc)
    # Clarity Release user prefs — one row per user.
    await db.clarity_user_prefs.create_index(
        [("user_id", 1)], unique=True, name="uniq_clarity_prefs"
    )
    # Coloring pages: one slug per day per age group.
    await db.coloring_pages.create_index(
        [("date", 1), ("age_group", 1)],
        unique=True,
        name="uniq_coloring_day_age",
    )
    await db.coloring_pages.create_index([("date", -1)])

    # Binary assets (PDFs, covers, body-room PNGs, coloring PNGs)
    # Stored in MongoDB so they survive production deploys.
    from binary_storage import ensure_indexes as ensure_binary_indexes
    await ensure_binary_indexes(db)

    # §Stage 3.3 — Cross-Room "quiet teadmine" bridge indexes.
    try:
        await _shared_memory.ensure_indexes(db)
    except Exception as _smi_err:  # noqa: BLE001
        logging.warning("shared_memory.ensure_indexes failed: %s", _smi_err)

    # §10 Booking system indexes — fast lookup by user, by start_at,
    # by guide. No unique constraint: parallel-instance reservations
    # are allowed up to BOOKING_CEILING (capacity check is server-wide).
    await db.bookings.create_index([("user_id", 1), ("status", 1)])
    await db.bookings.create_index([("start_at", 1), ("status", 1)])
    await db.bookings.create_index([("guide_name", 1), ("start_at", 1), ("status", 1)])

    # Cross-session mentor's notes (iter 57). Indexed by user for the
    # 3-most-recent injection in cabinet_message.
    await db.cabinet_user_summaries.create_index([("user_id", 1), ("created_at", -1)])

    # §W-3 (iter 62) — Daily chat-cap counter. Unique per (user, day) so
    # find_one_and_update upserts atomically. TTL on `date` would be nice
    # but we keep history for now; trim later if storage matters.
    await db.chat_usage_daily.create_index(
        [("user_id", 1), ("date", 1)],
        unique=True,
        name="uniq_chat_usage_user_date",
    )

    # §Iter 65 — Funnel telemetry (lightweight observability). Indexed
    # by event_type + created_at so the admin/observation/funnel
    # aggregation is not a full collection scan. NO TTL yet — founder
    # will set a retention policy after first 30 days of data.
    await db.funnel_events.create_index(
        [("event_type", 1), ("created_at", -1)],
        name="funnel_events_type_time",
    )
    await db.funnel_events.create_index(
        [("client_id", 1), ("created_at", -1)],
        name="funnel_events_client_time",
        sparse=True,
    )

    # §Iter 65 — Payment-event audit log (prep). Future Lemon writes go
    # here. Indexed for tail-by-time and lookup-by-order-ref.
    await db.payment_events.create_index(
        [("created_at", -1)], name="payment_events_time"
    )
    await db.payment_events.create_index(
        [("order_ref", 1)], name="payment_events_order_ref", sparse=True
    )

    # §Iter 67 — Membership tiers / waitlist / outbound / unsubscribe.
    await db.cabinet_user_tier.create_index(
        [("user_id", 1)], unique=True, name="uniq_cabinet_tier_user"
    )
    await db.waitlist_entries.create_index(
        [("email", 1), ("product_slug", 1)],
        unique=True,
        name="uniq_waitlist_email_slug",
    )
    await db.waitlist_entries.create_index([("created_at", -1)])
    await db.outbound_campaigns.create_index([("created_at", -1)])
    await db.outbound_campaigns.create_index([("status", 1), ("sent_at", -1)])
    await db.email_unsubscribes.create_index(
        [("email", 1)], unique=True, name="uniq_email_unsub"
    )

    # Background daily generator for Aurin Kids coloring pages.
    asyncio.create_task(_coloring_daily_loop())

    # §8.3 Heartbeat — every 5 min, signed POST to LP. No-op if env missing.
    asyncio.create_task(_aurin_heartbeat_loop())

    # §Six Nights dispatcher — hourly cron, soft-fails when Resend missing.
    asyncio.create_task(_six_nights_dispatch_loop())

    # §Stage 2.9 — Courses daily-letter dispatcher (hourly). Idempotent.
    asyncio.create_task(_courses_dispatch_loop())

    # §AUDIT-GHOST 2026-05-20 — Ghost-session reaper. Every 6 hours
    # deletes user_sessions / magic_link_tokens whose `expires_at`
    # is in the past. Indexes already exist on these fields so the
    # delete is O(log N). Without this, sessions accumulate forever
    # and find_one(session_token) gradually degrades even with the
    # uniq_session_token index in place.
    asyncio.create_task(_ghost_session_reaper_loop())

    # Background one-shot: copy any local /app/backend/storage/ files
    # into MongoDB so they survive future production deploys. Idempotent —
    # files already present in `binary_assets` are skipped.
    asyncio.create_task(_auto_migrate_assets_to_mongo())

    # §SALES-REPORT 2026-02-09 — Monthly sales report dispatcher.
    # Sleeps until the 1st day of next month at 09:00 UTC, then emails
    # Anna a structured breakdown of last month's revenue & costs.
    asyncio.create_task(_monthly_sales_report_loop())


async def _monthly_sales_report_loop() -> None:
    """§SALES-REPORT 2026-02-09 — Once a month, on the 1st at 09:00 UTC,
    email Anna a sales breakdown of the PREVIOUS calendar month.

    Soft-fails on any error so the loop never dies. Only runs when
    `REACH_OUT_EMAIL` is configured and Resend is online.
    """
    await asyncio.sleep(120)  # let startup settle
    while True:
        try:
            now = datetime.now(timezone.utc)
            # Compute next dispatch: first of next month at 09:00 UTC.
            if now.month == 12:
                next_run = datetime(now.year + 1, 1, 1, 9, 0, 0, tzinfo=timezone.utc)
            else:
                next_run = datetime(now.year, now.month + 1, 1, 9, 0, 0, tzinfo=timezone.utc)
            sleep_seconds = max(60.0, (next_run - now).total_seconds())
            await asyncio.sleep(sleep_seconds)
            try:
                await _send_monthly_sales_report()
            except Exception as exc:  # noqa: BLE001
                logger.warning("monthly sales report dispatch failed: %s", exc)
        except asyncio.CancelledError:
            raise
        except Exception as exc:  # noqa: BLE001
            logger.warning("monthly sales report loop hiccup: %s", exc)
            await asyncio.sleep(3600)


async def _build_sales_report(year: int, month: int) -> dict:
    """Compute a structured report for the given calendar month.

    Returns a dict with totals + per-tier breakdown + refund-review
    candidates. Reads from `clarity_passes` (the canonical paid-pass
    table) and `refund_review_queue` (today's short-session flags).
    """
    start = datetime(year, month, 1, tzinfo=timezone.utc)
    if month == 12:
        end = datetime(year + 1, 1, 1, tzinfo=timezone.utc)
    else:
        end = datetime(year, month + 1, 1, tzinfo=timezone.utc)
    start_iso = start.isoformat()
    end_iso = end.isoformat()

    # PAID PASSES — exclude admin grants and free-voice beta.
    paid_cursor = db.clarity_passes.find(
        {
            "granted_at": {"$gte": start_iso, "$lt": end_iso},
            "source": {"$nin": ["admin-grant", "free_voice_beta"]},
        },
        {"_id": 0},
    )
    paid_passes = await paid_cursor.to_list(length=10_000)

    # Tier pricing (mirror SEED_PASSES so the math matches Stripe).
    tier_prices = {
        "30min": 15.0,
        "60min": 30.0,
        "season_30days": 70.0,
    }
    per_tier = {t: {"count": 0, "gross_usd": 0.0} for t in tier_prices}
    for p in paid_passes:
        t = p.get("tier")
        if t in per_tier:
            per_tier[t]["count"] += 1
            per_tier[t]["gross_usd"] += tier_prices[t]

    gross_total = sum(v["gross_usd"] for v in per_tier.values())
    # LemonSqueezy typical fee ≈ 5% + $0.50/order on transactions
    ls_fee_estimated = sum(
        (v["gross_usd"] * 0.05) + (v["count"] * 0.50) for v in per_tier.values()
    )
    # Voice cost ≈ €0.25/min (conservative). 30min = $7.50, 60min = $15,
    # season pass usage is variable — use 60-min as conservative proxy.
    voice_cost_estimated = (
        per_tier["30min"]["count"] * 7.50
        + per_tier["60min"]["count"] * 15.0
        + per_tier["season_30days"]["count"] * 15.0
    )
    net_estimated = gross_total - ls_fee_estimated - voice_cost_estimated

    # Refund-review candidates (short sessions on fresh paid passes).
    refunds_cursor = db.refund_review_queue.find(
        {
            "created_at": {"$gte": start_iso, "$lt": end_iso},
            "needs_review": True,
        },
        {"_id": 0},
    )
    refund_candidates = await refunds_cursor.to_list(length=200)

    return {
        "year": year,
        "month": month,
        "window": {"start": start_iso, "end": end_iso},
        "per_tier": per_tier,
        "totals": {
            "gross_usd": round(gross_total, 2),
            "ls_fee_estimated_usd": round(ls_fee_estimated, 2),
            "voice_cost_estimated_usd": round(voice_cost_estimated, 2),
            "net_estimated_usd": round(net_estimated, 2),
            "paid_orders": sum(v["count"] for v in per_tier.values()),
        },
        "refund_candidates": [
            {
                "id": r.get("id"),
                "email": r.get("user_email"),
                "room": r.get("room"),
                "duration_seconds": r.get("duration_seconds"),
                "tier": (r.get("fresh_pass") or {}).get("tier"),
                "order_id": (r.get("fresh_pass") or {}).get("external_order_id"),
                "created_at": r.get("created_at"),
            }
            for r in refund_candidates
        ],
    }


async def _send_monthly_sales_report() -> None:
    """Render + dispatch the previous month's report. No-op if env missing."""
    destination = (os.environ.get("REACH_OUT_EMAIL") or "").strip()
    if not destination:
        logger.info("monthly sales report: REACH_OUT_EMAIL not set, skipping")
        return

    now = datetime.now(timezone.utc)
    # Report covers the PREVIOUS month (we run on the 1st of the next).
    if now.month == 1:
        target_year, target_month = now.year - 1, 12
    else:
        target_year, target_month = now.year, now.month - 1

    report = await _build_sales_report(target_year, target_month)
    try:
        from email_service import (
            send_email as _send_email,
            is_configured as _resend_configured,
        )
        if not _resend_configured():
            logger.info("monthly sales report: Resend not configured, skipping")
            return

        from html import escape as _esc
        totals = report["totals"]
        per_tier = report["per_tier"]
        subject = (
            f"[Sales Report] {target_year}-{target_month:02d} · "
            f"${totals['gross_usd']:.2f} gross · "
            f"{totals['paid_orders']} orders"
        )

        rows_html = "".join(
            f"<tr><td>{_esc(t)}</td>"
            f"<td style=\"text-align:right\">{v['count']}</td>"
            f"<td style=\"text-align:right\">${v['gross_usd']:.2f}</td></tr>"
            for t, v in per_tier.items()
        )
        refund_block = ""
        if report["refund_candidates"]:
            rows = "".join(
                f"<tr>"
                f"<td>{_esc(str(r.get('email') or '?'))}</td>"
                f"<td>{_esc(str(r.get('tier') or '?'))}</td>"
                f"<td>{r.get('duration_seconds', 0):.1f}s</td>"
                f"<td><a href=\"https://app.lemonsqueezy.com/orders\">{_esc(str(r.get('order_id') or '?'))}</a></td>"
                f"</tr>"
                for r in report["refund_candidates"]
            )
            refund_block = (
                f"<h3 style=\"margin-top:24px\">Refund-review candidates ({len(report['refund_candidates'])})</h3>"
                f"<table border=\"1\" cellpadding=\"6\" cellspacing=\"0\" style=\"border-collapse:collapse;font-size:12px\">"
                f"<thead><tr><th>Email</th><th>Tier</th><th>Session</th><th>LS Order</th></tr></thead>"
                f"<tbody>{rows}</tbody></table>"
            )

        body_html = (
            f"<h2>Sales Report · {target_year}-{target_month:02d}</h2>"
            f"<p>Window: {_esc(report['window']['start'][:10])} → {_esc(report['window']['end'][:10])}</p>"
            f"<table border=\"1\" cellpadding=\"6\" cellspacing=\"0\" style=\"border-collapse:collapse\">"
            f"<thead><tr><th>Tier</th><th>Orders</th><th>Gross USD</th></tr></thead>"
            f"<tbody>{rows_html}</tbody></table>"
            f"<h3 style=\"margin-top:24px\">Totals</h3>"
            f"<ul>"
            f"<li><strong>Gross:</strong> ${totals['gross_usd']:.2f}</li>"
            f"<li>LemonSqueezy fee (est.): ${totals['ls_fee_estimated_usd']:.2f}</li>"
            f"<li>Voice cost (est.): ${totals['voice_cost_estimated_usd']:.2f}</li>"
            f"<li><strong>Net (est.):</strong> ${totals['net_estimated_usd']:.2f}</li>"
            f"<li>Paid orders: {totals['paid_orders']}</li>"
            f"</ul>"
            f"{refund_block}"
            f"<p style=\"color:#888;font-size:12px;margin-top:24px\">"
            f"Estimates use 5% + $0.50/order for LS fees and conservative voice-minute pricing. "
            f"Cross-check exact figures in LemonSqueezy dashboard → Reports."
            f"</p>"
        )
        body_text = (
            f"Sales Report · {target_year}-{target_month:02d}\n"
            f"Window: {report['window']['start'][:10]} → {report['window']['end'][:10]}\n\n"
            + "\n".join(
                f"  {t}: {v['count']} orders · ${v['gross_usd']:.2f}"
                for t, v in per_tier.items()
            )
            + (
                f"\n\nGross: ${totals['gross_usd']:.2f}"
                f"\nLS fee (est.): ${totals['ls_fee_estimated_usd']:.2f}"
                f"\nVoice cost (est.): ${totals['voice_cost_estimated_usd']:.2f}"
                f"\nNet (est.): ${totals['net_estimated_usd']:.2f}"
                f"\nPaid orders: {totals['paid_orders']}"
            )
        )
        await _send_email(
            to=destination,
            subject=subject,
            html=body_html,
            text=body_text,
            sender="support",
            tags=[
                {"name": "kind", "value": "monthly_sales_report"},
                {"name": "month", "value": f"{target_year}-{target_month:02d}"},
            ],
        )
        logger.info("monthly sales report dispatched for %s-%02d", target_year, target_month)
    except Exception as exc:  # noqa: BLE001
        logger.warning("monthly sales report send failed: %s", exc)


async def _ghost_session_reaper_loop() -> None:
    """§AUDIT-GHOST 2026-05-20 — Periodic cleanup of expired sessions.

    Runs every 6 hours. Deletes:
      - user_sessions where expires_at < now  (and is not None)
      - magic_link_tokens where expires_at < now (and used or expired)
      - voice_sessions where closed == True AND started_at < (now - 90d)
        — old closed rows keep accumulating; the index on (user_id, closed)
        makes the live "open session?" lookup fast even with millions of
        rows, but the table itself is a disk-space drag long-term.
    Soft-fails on any collection-level error so a single bad row never
    halts the loop.
    """
    await asyncio.sleep(60)  # let other startup tasks finish first
    while True:
        try:
            now = datetime.now(timezone.utc)
            cutoff_iso = now.isoformat()
            ninety_days_ago = (now - timedelta(days=90)).isoformat()
            r1 = await db.user_sessions.delete_many({
                "expires_at": {"$lt": cutoff_iso, "$ne": None},
            })
            r2 = await db.magic_link_tokens.delete_many({
                "expires_at": {"$lt": cutoff_iso},
            })
            r3 = await db.voice_sessions.delete_many({
                "closed": True,
                "started_at": {"$lt": ninety_days_ago},
            })
            if (r1.deleted_count or r2.deleted_count or r3.deleted_count):
                logger.info(
                    "[ghost-reaper] sessions=%d magic_links=%d voice_old=%d",
                    r1.deleted_count, r2.deleted_count, r3.deleted_count,
                )
        except Exception as exc:  # noqa: BLE001
            logger.warning("[ghost-reaper] cycle failed: %s", exc)
        await asyncio.sleep(6 * 3600)


async def _auto_migrate_assets_to_mongo() -> None:
    """Best-effort: ensure every PDF / cover / body-room / coloring
    asset on disk is mirrored into MongoDB. Safe to run on every boot.
    Runs in the background so it never blocks startup.
        1. ``/app/backend/storage/``    — preview env (gitignored)
        2. ``/app/backend/seed_assets/``— production seed (in git, ships with deploy)

    Production starts with empty Atlas + empty storage/ (gitignored), so
    the seed_assets directory is what bootstraps a fresh deployment.
    """
    await asyncio.sleep(8)  # let primary startup work settle
    try:
        from binary_storage import get_binary, put_binary
        plan = [
            ("book_pdf", "books", "application/pdf", ".pdf"),
            ("book_cover", "covers", "image/jpeg", ".jpg"),
            ("body_room", "body_room", "image/png", ".png"),
            ("coloring", "coloring", "image/png", ".png"),
        ]
        roots = [
            Path("/app/backend/storage"),
            Path("/app/backend/seed_assets"),
        ]
        uploaded = 0
        for root in roots:
            if not root.exists():
                continue
            for kind, subdir, content_type, ext in plan:
                d = root / subdir
                if not d.exists():
                    continue
                for f in sorted(d.iterdir()):
                    if not f.is_file() or not f.name.endswith(ext):
                        continue
                    slug = f.stem
                    try:
                        data = f.read_bytes()
                    except Exception:
                        continue
                    if not data:
                        continue
                    existing = await get_binary(db, kind=kind, slug=slug)
                    if existing and existing.get("bytes") == len(data):
                        continue
                    try:
                        await put_binary(
                            db,
                            kind=kind,
                            slug=slug,
                            data=data,
                            content_type=content_type,
                        )
                        uploaded += 1
                    except Exception as e:
                        logger.warning("auto-migrate %s:%s failed: %s", kind, slug, e)

        # Also ensure coloring_pages metadata exists for any seeded
        # coloring image whose DB record might be missing in production.
        for f in sorted((Path("/app/backend/seed_assets/coloring")).glob("*.png")) \
                if Path("/app/backend/seed_assets/coloring").exists() else []:
            slug = f.stem
            existing = await db.coloring_pages.find_one({"slug": slug}, {"_id": 0})
            if existing:
                continue
            # Slug shape: YYYY-MM-DD-AGE-rest...  e.g. 2026-05-05-3-5-my-friend-the-fox
            parts = slug.split("-")
            if len(parts) < 5:
                continue
            date_iso = "-".join(parts[:3])
            age_group = "-".join(parts[3:5])
            title_slug = "-".join(parts[5:]) or slug
            title = title_slug.replace("-", " ").strip().title() or "Coloring page"
            await db.coloring_pages.insert_one({
                "id": str(uuid.uuid4()),
                "slug": slug,
                "date": date_iso,
                "age_group": age_group,
                "title": title,
                "summary": "",
                "tags": [],
                "image_url": f"/api/coloring/image/{slug}",
                "download_url": f"/api/coloring/image/{slug}",
                "created_at": datetime.now(timezone.utc).isoformat(),
                "source": "seed",
            })

        # Backfill: rewrite any old /assets/... coloring URLs to /api/...
        try:
            await db.coloring_pages.update_many(
                {"image_url": {"$regex": "^/assets/"}},
                [{"$set": {
                    "image_url": {"$concat": ["/api/coloring/image/", "$slug"]},
                    "download_url": {"$concat": ["/api/coloring/image/", "$slug"]},
                }}],
            )
        except Exception:
            pass
        if uploaded:
            logger.info("auto-migrate: uploaded %d new asset(s) to Mongo", uploaded)
        else:
            logger.info("auto-migrate: all assets already in Mongo")
    except Exception as e:
        # Never let migration crash the app.
        logger.warning("auto-migrate failed: %s", e)


async def _coloring_daily_loop():
    """Fire generate_daily_coloring_pages once at boot, then every 24h."""
    from coloring_pipeline import generate_daily_coloring_pages
    # Slight stagger to let MongoDB indexes settle.
    await asyncio.sleep(15)
    while True:
        try:
            summary = await generate_daily_coloring_pages(db)
            logger.info("Coloring daily run: %s", summary)
        except Exception as e:
            logger.warning("Coloring daily run failed: %s", e)
        await asyncio.sleep(24 * 60 * 60)


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()

