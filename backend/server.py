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
    currency: str = "NOK"
    tax_category: TaxCategory = "book_zero_rate_ready"
    delivery_options: List[DeliveryOption] = Field(default_factory=lambda: ["read_online", "download_pdf"])
    pages: Optional[int] = None
    tags: List[str] = Field(default_factory=list)
    lemonsqueezy_product_id: Optional[str] = None  # placeholder — wired later
    pdf_url: Optional[str] = None  # placeholder — object storage later
    markdown: str = ""
    html: str = ""
    sections: List[ContentSection] = Field(default_factory=list)
    validation_warnings: List[str] = Field(default_factory=list)
    source: Literal["manual", "github"] = "manual"
    source_path: Optional[str] = None  # e.g. "bookstore/genesis-volume-1.md"
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
    currency: str = "NOK"
    tax_category: TaxCategory = "book_zero_rate_ready"
    delivery_options: List[DeliveryOption] = Field(default_factory=lambda: ["read_online", "download_pdf"])
    pages: Optional[int] = None
    tags: List[str] = Field(default_factory=list)
    lemonsqueezy_product_id: Optional[str] = None
    markdown: str = ""


@api_router.get("/books", response_model=List[Book])
async def list_books(
    q: Optional[str] = Query(None, description="Search in title/description"),
    published_only: bool = True,
):
    query: dict = {}
    if published_only:
        query["published"] = True
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
        "slug": "genesis-protocols-volume-i-book",
        "title": "The Genesis Protocols",
        "subtitle": "Volume I — Foundations of Self-Mastery",
        "description": "A structured, durable book on attention, structure, and presence. The first volume of the Genesis Protocols.",
        "author": "Matrix Aurin",
        "price": 149.0,
        "currency": "NOK",
        "tax_category": "book_zero_rate_ready",
        "delivery_options": ["read_online", "download_pdf"],
        "pages": 142,
        "tags": ["foundations", "self-mastery"],
        "source_path": "bookstore/genesis-volume-1.md",
        "markdown": """## Preface\n\nThis volume is a beginning. Nothing here is advanced. Everything here is durable.\n\n## On Attention\n\nAttention is the only renewable currency. Spend it deliberately.\n\n## On Structure\n\nStructure is the silence inside which choice becomes possible.\n""",
    },
    {
        "slug": "genesis-protocols-volume-ii-book",
        "title": "The Genesis Protocols",
        "subtitle": "Volume II — Patterns, Practice, Presence",
        "description": "The second volume. Continues the work, assumes Volume I is familiar.",
        "author": "Matrix Aurin",
        "price": 179.0,
        "currency": "NOK",
        "tax_category": "book_zero_rate_ready",
        "delivery_options": ["read_online", "download_pdf"],
        "pages": 198,
        "tags": ["patterns", "practice"],
        "source_path": "bookstore/genesis-volume-2.md",
        "markdown": """## Preface\n\nThis volume continues the work and assumes Volume I is familiar.\n\n## On Patterns\n\nYour problems are rarely new. Learn to see the shape of them.\n\n## On Presence\n\nPresence is not an experience. It is a discipline.\n""",
    },
    {
        "slug": "kids-quiet-stories-volume-i",
        "title": "Quiet Stories — Volume I",
        "subtitle": "Gentle stories for young minds",
        "description": "A first collection of slow, soft stories from the Kids Universe.",
        "author": "Matrix Aurin",
        "price": 99.0,
        "currency": "NOK",
        "tax_category": "book_zero_rate_ready",
        "delivery_options": ["read_online", "download_pdf"],
        "pages": 64,
        "tags": ["kids", "stories"],
        "source_path": "bookstore/kids-quiet-stories-1.md",
        "markdown": """## About\n\nA small book of quiet stories — meant to be read slowly, ideally aloud, ideally just before sleep.\n\n## How To Use\n\nOne story per night. No more. No less.\n""",
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

    # 4. Books — seed once.
    book_count = await db.books.count_documents({})
    if book_count == 0:
        for b in SEED_BOOKS:
            parsed = parse_markdown(b.get("markdown", ""))
            obj = Book(
                **b,
                html=parsed["html"],
                sections=[ContentSection(**s) for s in parsed["sections"]],
                validation_warnings=parsed.get("warnings", []),
            )
            await db.books.insert_one(_serialize(obj.model_dump()))
        logger.info("Seeded %d books.", len(SEED_BOOKS))


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
