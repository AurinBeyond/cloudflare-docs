"""
Aurin Kids — Coloring Page Pipeline.

Generates daily black-and-white coloring book line-art using Gemini
"Nano Banana" (gemini-3.1-flash-image-preview) via the Emergent
universal LLM key. Three pages per day — one per age group:

    3-5   simple, large shapes, 4-6 elements
    6-8   medium detail, gentle storytelling
    9-12  richer composition, geometry / nature / inner-world themes

Pages are written to /app/backend/storage/coloring/{slug}.png and
metadata is written to MongoDB collection ``coloring_pages``.

Design constraints (forced into every prompt):
  - PURE black & white line art (NO grey shading, NO fill colour)
  - White background, crisp 2-3 px black outlines
  - Print-friendly (8.5x11 portrait, large readable shapes)
  - NO text, NO words, NO letters anywhere on the page
  - Aurin Kids feeling: calm, gentle, magical realism
"""

from __future__ import annotations

import asyncio
import base64
import logging
import os
import random
import uuid
from datetime import datetime, timezone
from pathlib import Path
from typing import Optional

from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Storage
# ---------------------------------------------------------------------------
COLORING_STORAGE_DIR = Path(
    os.environ.get("COLORING_STORAGE_DIR", "/app/backend/storage/coloring")
)
COLORING_STORAGE_DIR.mkdir(parents=True, exist_ok=True)

# Public asset folder served by the React dev/prod build — drop a copy here
# too so the frontend can show the image without needing the backend route.
COLORING_PUBLIC_DIR = Path("/app/frontend/public/assets/kids/coloring")
COLORING_PUBLIC_DIR.mkdir(parents=True, exist_ok=True)


# ---------------------------------------------------------------------------
# Theme bank — rotated per age group every day. Kept short and concrete so
# Nano Banana doesn't drift. Each entry returns a (title, scene) pair.
# ---------------------------------------------------------------------------
THEMES_3_5 = [
    ("The sleepy moon", "a smiling round moon resting on a soft cloud, two tiny stars beside it"),
    ("My friend the fox", "a small friendly fox sitting next to a flower as big as its head"),
    ("The kind whale", "a gentle whale with closed eyes floating on calm wavy lines, one star above"),
    ("Garden of suns", "three round smiling suns on stems, like sunflowers, with two butterflies"),
    ("The owl on the branch", "a round happy owl on a single thick branch with three big leaves"),
    ("Hello, little bee", "one cheerful bee in front of a single big daisy with rounded petals"),
    ("My own cloud", "a fluffy cloud with a smiling face and three soft raindrops shaped like hearts"),
    ("A rainbow tree", "a small simple tree with seven round fruits hanging like a rainbow"),
    ("The friendly turtle", "a smiling turtle with a shell decorated by simple circles and stars"),
    ("Night-light star", "a single big star with a calm face and a tiny crescent moon resting on it"),
]

THEMES_6_8 = [
    ("Brave little astronaut", "a child astronaut floating between three planets and a comet trail"),
    ("The forest meeting", "a child sitting on a stump while a deer, a rabbit and an owl listen"),
    ("Underwater song", "a girl with long flowing hair surrounded by friendly fish and a curious octopus"),
    ("Dragon of kindness", "a small round dragon with butterfly wings sharing a flower with a child"),
    ("My inner garden", "a child watering a flower that grows inside a big heart shape"),
    ("The lighthouse friend", "a tall lighthouse on a small island, a child waving from a sailboat below"),
    ("Library of stars", "a child reading a book on a giant crescent moon while stars circle them"),
    ("The mountain path", "a hiking child with a small bird on the shoulder, a winding path up to a sun"),
    ("The kite that learned to fly", "a child holding a long string, the kite shaped like a friendly fish"),
    ("Whispers of the river", "a child kneeling at a stream, hands cupped, fish and lily pads around"),
]

THEMES_9_12 = [
    ("Sacred geometry forest", "a teen standing under a tree whose canopy is a mandala of leaves and stars"),
    ("Inner compass", "a teen holding a compass; from the compass, four paths extend into mountains, sea, forest, sky"),
    ("Map of the heart", "a stylised heart drawn as a continent on a vintage explorer map with rivers"),
    ("The boundary garden", "a teen drawing a calm circle around themselves with flowers blooming on the line"),
    ("Phoenix of small fires", "a phoenix made of flame-shaped feathers rising from a quiet candle"),
    ("Mandala wolf", "a noble wolf head whose mane is a complex circular mandala"),
    ("Constellation of choices", "a teen reaching for stars connected by lines forming the shape of a key"),
    ("The quiet warrior", "a teen seated in lotus, a lotus mandala behind them, two koi fish circling"),
    ("The library inside me", "a cross-section of a head where the brain is a library shelf of books and a lantern"),
    ("Tree of feelings", "a tree whose roots are labelled-shape leaves: each leaf a small symbol — heart, eye, wave, moon"),
]


def _theme_for(age_group: str, day_index: int) -> tuple[str, str]:
    bank = {
        "3-5": THEMES_3_5,
        "6-8": THEMES_6_8,
        "9-12": THEMES_9_12,
    }[age_group]
    return bank[day_index % len(bank)]


def _slug_for(age_group: str, title: str, day_iso: str) -> str:
    safe = "".join(c if c.isalnum() else "-" for c in title.lower()).strip("-")
    while "--" in safe:
        safe = safe.replace("--", "-")
    return f"{day_iso}-{age_group}-{safe}"[:90]


def _build_prompt(age_group: str, title: str, scene: str) -> str:
    age_brief = {
        "3-5": "VERY simple — only 4-6 large shapes, very thick rounded outlines (3-4 px), huge clear forms a toddler can colour without confusion. NO tiny details.",
        "6-8": "moderate detail — clear storytelling, 8-12 distinct shapes, friendly faces, varied line weights but always thick and clean.",
        "9-12": "richer composition — fine but not crowded, mandala / sacred-geometry accents allowed, multiple textures, still printable on A4.",
    }[age_group]
    return (
        "Create a single black-and-white COLORING BOOK PAGE for children, ages "
        f"{age_group}.\n"
        f"Title (do not draw the words): \"{title}\".\n"
        f"Scene to draw: {scene}.\n\n"
        f"Style requirements:\n"
        "- BLACK INK LINE ART ONLY on a fully WHITE background.\n"
        "- ABSOLUTELY no grey shading, no fills, no colour, no gradients.\n"
        "- Crisp clean outlines, large enclosed regions ready to be filled with crayons.\n"
        f"- Composition: {age_brief}\n"
        "- Portrait 8.5x11 print orientation.\n"
        "- No text, no letters, no numbers, no signatures, no watermarks anywhere.\n"
        "- Calm, gentle 'Aurin Kids' feeling — magical realism, soft eyes on creatures.\n"
        "Return ONLY the image. Do not respond with explanation."
    )


# ---------------------------------------------------------------------------
# Generation
# ---------------------------------------------------------------------------
async def _generate_one(age_group: str, title: str, scene: str, slug: str) -> Optional[bytes]:
    """Call Nano Banana once and return PNG bytes (or None on failure)."""
    api_key = os.getenv("EMERGENT_LLM_KEY")
    if not api_key:
        logger.warning("EMERGENT_LLM_KEY missing; skipping coloring generation.")
        return None
    try:
        from emergentintegrations.llm.chat import LlmChat, UserMessage  # type: ignore
    except Exception as e:  # pragma: no cover
        logger.warning("emergentintegrations not available: %s", e)
        return None

    chat = LlmChat(
        api_key=api_key,
        session_id=f"coloring-{slug}-{uuid.uuid4().hex[:8]}",
        system_message=(
            "You are a children's coloring-book line-artist. You always return "
            "a single black-and-white line drawing on a white background, with "
            "thick clean outlines and no shading."
        ),
    )
    chat.with_model("gemini", "gemini-3.1-flash-image-preview").with_params(
        modalities=["image", "text"]
    )

    msg = UserMessage(text=_build_prompt(age_group, title, scene))
    try:
        _text, images = await chat.send_message_multimodal_response(msg)
    except Exception as e:
        logger.warning("Nano Banana call failed for %s: %s", slug, e)
        return None

    if not images:
        logger.warning("Nano Banana returned no image for %s", slug)
        return None

    try:
        return base64.b64decode(images[0]["data"])
    except Exception as e:
        logger.warning("Failed to decode image for %s: %s", slug, e)
        return None


async def generate_daily_coloring_pages(db) -> dict:
    """Generate (at most) one coloring page per age group, once per day.

    Idempotent: if a page already exists for ``today`` and a given age
    group, that age group is skipped. Returns a small summary dict.

    Persistence: bytes are stored in MongoDB ``binary_assets`` so they
    survive a production deploy. The local filesystem mirror is kept
    only as a best-effort cache.
    """
    today = datetime.now(timezone.utc).date()
    iso_day = today.isoformat()
    # Day index lets us rotate the theme bank deterministically.
    day_index = (today.toordinal()) % 1000

    summary: dict = {"date": iso_day, "generated": [], "skipped": [], "failed": []}

    for age_group in ("3-5", "6-8", "9-12"):
        existing = await db.coloring_pages.find_one(
            {"date": iso_day, "age_group": age_group}, {"_id": 0}
        )
        if existing:
            summary["skipped"].append(age_group)
            continue

        title, scene = _theme_for(age_group, day_index)
        slug = _slug_for(age_group, title, iso_day)
        png_bytes = await _generate_one(age_group, title, scene, slug)
        if not png_bytes:
            summary["failed"].append(age_group)
            continue

        # Persist to MongoDB (production-safe).
        try:
            from binary_storage import put_binary
            await put_binary(
                db,
                kind="coloring",
                slug=slug,
                data=png_bytes,
                content_type="image/png",
                meta={"age_group": age_group, "date": iso_day, "title": title},
            )
        except Exception as e:
            logger.warning("Failed to write coloring asset to Mongo (%s): %s", slug, e)

        # Best-effort local mirror (preview env only).
        try:
            backend_path = COLORING_STORAGE_DIR / f"{slug}.png"
            backend_path.write_bytes(png_bytes)
            public_path = COLORING_PUBLIC_DIR / f"{slug}.png"
            public_path.write_bytes(png_bytes)
        except Exception:
            pass

        doc = {
            "id": str(uuid.uuid4()),
            "slug": slug,
            "date": iso_day,
            "age_group": age_group,
            "title": title,
            "summary": scene,
            "tags": _tags_for(age_group),
            # In production, the served URL is the API (DB-backed).
            # The /assets/... path remains a fallback for the preview env.
            "image_url": f"/api/coloring/image/{slug}",
            "download_url": f"/api/coloring/image/{slug}",
            "created_at": datetime.now(timezone.utc).isoformat(),
            "source": "nano-banana",
        }
        await db.coloring_pages.insert_one(doc)
        summary["generated"].append({"age_group": age_group, "slug": slug, "title": title})
        logger.info("Coloring page generated: %s (%s)", slug, age_group)

        # Be polite — small spacing between calls.
        await asyncio.sleep(2)

    return summary


def _tags_for(age_group: str) -> list[str]:
    if age_group == "3-5":
        return ["Calm", "Friends", "Nature"]
    if age_group == "6-8":
        return ["Story", "Imagination", "Nature"]
    return ["Geometry", "Inner world", "Discovery"]


async def list_coloring_pages(db, age_group: Optional[str] = None, limit: int = 60) -> list[dict]:
    q: dict = {}
    if age_group and age_group != "all":
        q["age_group"] = age_group
    cur = db.coloring_pages.find(q, {"_id": 0}).sort("date", -1).limit(limit)
    return [doc async for doc in cur]
