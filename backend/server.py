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

from fastapi import FastAPI, APIRouter, HTTPException, Query
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import re
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional, Literal
import uuid
from datetime import datetime, timezone

import markdown as md_lib
import bleach
import frontmatter

from content_normalizer import parse_markdown_safe

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

mongo_url = os.environ["MONGO_URL"]
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ["DB_NAME"]]

app = FastAPI(title="Matrix Aurin API", version="0.2.0")
api_router = APIRouter(prefix="/api")

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
    {"slug": "foundations", "name": "Foundations", "description": "Introductory modules.", "surface": "learning", "order": 1, "source_path": "learning/foundations"},
    {"slug": "practice", "name": "Practice", "description": "Applied lessons and exercises.", "surface": "learning", "order": 2, "source_path": "learning/practice"},
]

SEED_ENTRIES: List[dict] = [
    {
        "slug": "morning-orientation-protocol",
        "title": "Morning Orientation Protocol",
        "description": "A 7-step structured text-based guide to begin the day with clarity.",
        "category_slug": "protocols",
        "surface": "library",
        "kind": "protocol",
        "access": "free",
        "tags": ["daily", "orientation"],
        "source_path": "library/protocols/morning-orientation.md",
        "markdown": """---
title: Morning Orientation Protocol
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

This protocol is intentionally short. Keep it under four minutes.
""",
    },
    {
        "slug": "evening-reflection-protocol",
        "title": "Evening Reflection Protocol",
        "description": "A slow, structured review for the close of the day.",
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
        "title": "The Genesis Protocols — Volume I",
        "description": "Foundations of self-mastery. Structured long-form material.",
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
        "title": "The Genesis Protocols — Volume II",
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
        "description": "The opening module. Start here.",
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
        "description": "Applied module. How to begin with something that fits.",
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
    # ---------- ADULT (3 × $35) ----------
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
        "price": 35.0,
        "currency": "USD",
        "audience": "adult",
        "tax_category": "book_zero_rate_ready",
        "delivery_options": ["read_online", "download_pdf"],
        "pages": None,
        "tags": ["self-growth", "boundaries", "courage"],
        "lemonsqueezy_product_id": "PLACEHOLDER_DANCE_TUNE",
        "external_read_url": "https://ebookmaker.ai/you-dont-have-to-dance-to-anothers-tunen-ag5xc",
        "source_path": "bookstore/you-dont-have-to-dance.md",
        "markdown": """## A short preface\n\nThis is a small book on a large subject — choosing your own life.\n\n## You are allowed to stop\n\nThe first sentence is simple: you do not have to dance to a tune that was never yours.\n\n## What this book is\n\nA quiet companion. Read slowly. Underline freely.\n""",
    },
    {
        "slug": "the-language-of-angels",
        "title": "The Language of Angels",
        "subtitle": "Embracing Boundaries and Inner Worth",
        "description": (
            "A spiritual book for adults — gentle, structured, and warm. Written for "
            "readers who want to hear the quieter voice inside themselves and learn "
            "to speak back to it with care."
        ),
        "author": "prulesoul",
        "price": 35.0,
        "currency": "USD",
        "audience": "adult",
        "tax_category": "book_zero_rate_ready",
        "delivery_options": ["read_online", "download_pdf"],
        "pages": None,
        "tags": ["spiritual", "boundaries", "self-worth"],
        "lemonsqueezy_product_id": "PLACEHOLDER_LANGUAGE_OF_ANGELS",
        "external_read_url": "https://ebookmaker.ai/--the-language-of-angels-embracing-boundaries-and-inner-worth-osvhn",
        "source_path": "bookstore/language-of-angels.md",
        "markdown": """## On listening\n\nMost of us were taught to speak before we were taught to listen — to ourselves, most of all.\n\n## A language of light\n\nThis book offers a small vocabulary for the quieter voice inside.\n""",
    },
    {
        "slug": "beyond-the-matrix-ii",
        "title": "Beyond the Matrix II",
        "subtitle": "Codes of Consciousness",
        "description": (
            "The second volume in the Beyond the Matrix series. Goes deeper into the "
            "patterns and protocols that shape inner life — the invisible programs we "
            "inherit, and the calm work of becoming free of them."
        ),
        "author": "prulesoul",
        "price": 35.0,
        "currency": "USD",
        "audience": "adult",
        "tax_category": "book_zero_rate_ready",
        "delivery_options": ["read_online", "download_pdf"],
        "pages": None,
        "tags": ["protocols", "consciousness", "deep-work"],
        "lemonsqueezy_product_id": "PLACEHOLDER_BEYOND_MATRIX_II",
        "external_read_url": "https://ebookmaker.ai/beyond-the-matrix-ii--codes-of-consciousness-w5x3tf",
        "source_path": "bookstore/beyond-the-matrix-ii.md",
        "markdown": """## Why a Volume II\n\nThe first book opens the door. The second one walks slowly through it.\n\n## On invisible codes\n\nMany of the patterns that shape our lives were written into us before we could read.\n""",
    },
    # ---------- KIDS (3 × $25) ----------
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
        "price": 25.0,
        "currency": "USD",
        "audience": "kids",
        "tax_category": "book_zero_rate_ready",
        "delivery_options": ["read_online", "download_pdf"],
        "pages": None,
        "tags": ["kids", "stories", "friendship", "ages-6-12"],
        "lemonsqueezy_product_id": "PLACEHOLDER_ANGELS_TALES",
        "external_read_url": "https://ebookmaker.ai/angels-tales--adventures-of-light-and-friendship",
        "pdf_url": "/assets/books/angels-tales.pdf",
        "source_path": "bookstore/kids/angels-tales.md",
        "markdown": """## About\n\nA gentle storybook for ages 6–12. Light, friendship, and a little courage.\n\n## How to read\n\nSlowly. Aloud, if you can. With time for the pictures to settle.\n""",
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
        "price": 25.0,
        "currency": "USD",
        "audience": "kids",
        "tax_category": "book_zero_rate_ready",
        "delivery_options": ["read_online", "download_pdf"],
        "pages": None,
        "tags": ["kids", "stories", "kindness", "ages-3-8"],
        "lemonsqueezy_product_id": "PLACEHOLDER_ENGELS_FRIENDS_2",
        "external_read_url": "https://ebookmaker.ai/engels-friends-2-ugo0pf",
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
        "price": 25.0,
        "currency": "USD",
        "audience": "kids",
        "tax_category": "book_zero_rate_ready",
        "delivery_options": ["read_online", "download_pdf"],
        "pages": None,
        "tags": ["kids", "bedtime", "calm"],
        "lemonsqueezy_product_id": "PLACEHOLDER_NIGHT_ANGELS",
        "external_read_url": "https://ebookmaker.ai/the-night-angels-embrace",
        "cover_image_url": "/assets/kids/visualisations/bedtime-angel.png",
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
LEGAL_DRAFT_NOTICE = (
    "_This is a starter draft. Replace with attorney-reviewed text before "
    "activating payments or accepting personal data._\n\n"
)

SEED_LEGAL: List[dict] = [
    {
        "slug": "terms-of-service",
        "title": "Terms of Service",
        "description": "How you may use prulesoul.site and the Matrix Aurin platform.",
        "category_slug": "legal",
        "surface": "legal",
        "kind": "article",
        "access": "free",
        "tags": ["terms", "draft"],
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
        "tags": ["responsibility", "draft"],
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
        "tags": ["refund", "draft"],
        "source_path": "legal/refund-policy.md",
        "markdown": LEGAL_DRAFT_NOTICE + """## Digital goods are final\n\nBecause our products are digital and are delivered immediately on purchase, all sales are final by default. By completing checkout you waive your statutory right of withdrawal where local law permits this waiver for delivered digital content.\n\n## Exceptions\n\nWe will issue a full refund within 14 days of purchase if:\n\n### 1. The file is broken\nThe PDF or audio file fails to download or is corrupted, and we are unable to deliver a working copy within 7 days of you reporting the issue.\n\n### 2. Duplicate purchase\nYou accidentally purchased the same item twice within a short window.\n\n### 3. Wrong item delivered\nYou received a product that materially does not match its public description.\n\n## How to request a refund\n\nUse the Reach Out form, choose topic \"Bookstore / order\", and include your order ID and email used at checkout. We respond within two working days.\n\n## Where requests are processed\n\nRefunds are processed by LemonSqueezy and may take 3–10 business days to appear on your card or PayPal balance.\n""",
    },
    {
        "slug": "acceptable-use-and-community",
        "title": "Acceptable Use & Community",
        "description": "What is welcome and what is not — short, clear, human.",
        "category_slug": "legal",
        "surface": "legal",
        "kind": "article",
        "access": "free",
        "tags": ["community", "draft"],
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
    user_doc = await db.users.find_one({"user_id": user_id}, {"_id": 0})
    return {"user": user_doc, "session_token": session_token}


@api_router.get("/auth/me")
async def auth_me(request: Request):
    user = await _resolve_current_user(request)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    return user.model_dump()


@api_router.post("/auth/logout")
async def auth_logout(request: Request, response: Response):
    token = await _get_session_token(request)
    if token:
        await db.user_sessions.delete_one({"session_token": token})
    response.delete_cookie("session_token", path="/")
    return {"status": "ok"}


# =============================================================
# Reach Out — accepts the contact form (delivery is placeholder).
# =============================================================
class ReachOutMessage(BaseModel):
    name: str
    email: str
    topic: Optional[str] = "general"
    message: str


@api_router.post("/reach-out")
async def reach_out(inp: ReachOutMessage):
    """Persist the message. Email delivery wires up later when REACH_OUT_EMAIL
    is configured + a transactional provider is connected."""
    doc = {
        "id": str(uuid.uuid4()),
        "name": inp.name.strip()[:200],
        "email": inp.email.strip().lower()[:200],
        "topic": (inp.topic or "general").strip()[:50],
        "message": inp.message.strip()[:5000],
        "destination": os.environ.get("REACH_OUT_EMAIL", ""),
        "delivered": False,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.reach_out_messages.insert_one(doc)
    return {
        "status": "received",
        "destination_configured": bool(os.environ.get("REACH_OUT_EMAIL")),
        "id": doc["id"],
    }


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


# =============================================================
# App wiring
# =============================================================
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origin_regex=".*",
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)


@app.on_event("startup")
async def on_startup():
    await seed_initial_content()


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
