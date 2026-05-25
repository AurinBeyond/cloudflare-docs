"""
angel_stars.py — Catalog + helpers for the Angel Stars MVP.

§KIDS-HUBS 2026-02-09 — Founder directive: a gentle, gamified
retention engine for the Kids Universe. The catalog (15 actions +
4 mystery tiers) is held statically in this module because:
  (a) the founder controls the catalog editorially, not via an
      admin UI; changing it is a code change so it always goes
      through review,
  (b) keeping it static keeps reads dirt-cheap (no DB hit for the
      child's hub which is loaded many times per session).

Persistent state (per-user balance, per-request rows, redeemed
tiers) lives in MongoDB in three collections:
    angel_stars            — one summary doc per (user_id, child_slug)
    angel_stars_actions    — one row per child-requested star
    angel_stars_rewards    — one row per redeemed tier

This module exposes only the static catalog; FastAPI routes wire
the persistence in server.py.
"""

from typing import List, Dict, Any

# 15 actions, 5 per age band. `stars` value scales with the
# difficulty / weight of the act from the child's perspective.
# `age_slugs` lets a single action belong to multiple bands (used
# for universal acts like "honesty").
ANGEL_STARS_ACTIONS: List[Dict[str, Any]] = [
    # ── Little Dreamers (3–5) ────────────────────────────────
    {"slug": "tidied_toys",      "label": "I helped put my toys away",                       "stars": 1, "age_slugs": ["little-dreamers"]},
    {"slug": "shared_hug",       "label": "I gave someone a real big hug",                   "stars": 1, "age_slugs": ["little-dreamers"]},
    {"slug": "made_a_picture",   "label": "I drew a picture for someone I love",             "stars": 2, "age_slugs": ["little-dreamers"]},
    {"slug": "kind_words",       "label": "I used kind words when I felt grumpy",            "stars": 2, "age_slugs": ["little-dreamers"]},
    {"slug": "calm_meal",        "label": "I sat calmly through a whole meal",               "stars": 1, "age_slugs": ["little-dreamers"]},

    # ── Explorers (6–8) ──────────────────────────────────────
    {"slug": "helped_at_home",   "label": "I helped at home without being asked",            "stars": 2, "age_slugs": ["explorers"]},
    {"slug": "tried_new_thing",  "label": "I tried something new even though it was scary",  "stars": 3, "age_slugs": ["explorers"]},
    {"slug": "patience",         "label": "I was patient when I really wanted to hurry",     "stars": 2, "age_slugs": ["explorers"]},
    {"slug": "told_truth",       "label": "I told the truth when it was hard",               "stars": 3, "age_slugs": ["explorers", "dreamweavers"]},
    {"slug": "included_friend",  "label": "I made sure no one was left out at play",         "stars": 2, "age_slugs": ["explorers"]},

    # ── Dreamweavers (9–12) ──────────────────────────────────
    {"slug": "hard_honesty",     "label": "I was honest about something I'd rather hide",    "stars": 4, "age_slugs": ["dreamweavers"]},
    {"slug": "learned_a_skill",  "label": "I practised a skill across seven days",           "stars": 4, "age_slugs": ["dreamweavers"]},
    {"slug": "anon_kindness",    "label": "I did a kind thing nobody saw",                   "stars": 3, "age_slugs": ["dreamweavers", "explorers"]},
    {"slug": "listened_first",   "label": "I listened all the way before I answered",        "stars": 3, "age_slugs": ["dreamweavers"]},
    {"slug": "stood_up_for",     "label": "I stood up for someone who couldn't",             "stars": 4, "age_slugs": ["dreamweavers"]},
]

# 4 mystery reward tiers. The `mystery_hint` is shown BEFORE the
# child reaches the threshold; `title` + `description` are revealed
# once unlocked. `payload` is an editorial pointer (story slug,
# audio file, certificate text) used by the redeem endpoint.
ANGEL_STARS_TIERS: List[Dict[str, Any]] = [
    {
        "tier_index": 1,
        "threshold": 10,
        "mystery_hint": "A glowing whisper waits at 10 stars",
        "title": "A glowing whisper from Aurin",
        "description": "A short voice note from Aurin, just for you — a quiet 'well done' and a small wish for the week ahead.",
        "payload": {"kind": "message", "text": "I see you. Every gentle thing you do makes the world a softer place to live in. — Aurin"},
    },
    {
        "tier_index": 2,
        "threshold": 25,
        "mystery_hint": "A small wish waits at 25 stars",
        "title": "A small wish — your own bedtime story",
        "description": "Aurin opens a quiet, unreleased bedtime story for you to listen to before sleep.",
        "payload": {"kind": "story_unlock", "story_slug": "ooingel"},
    },
    {
        "tier_index": 3,
        "threshold": 50,
        "mystery_hint": "Something beautiful waits at 50 stars",
        "title": "A Star Certificate",
        "description": "A keepsake your grown-up can print and put on the wall — a real record of the kind things you've done.",
        "payload": {"kind": "certificate"},
    },
    {
        "tier_index": 4,
        "threshold": 100,
        "mystery_hint": "An angel's secret waits at 100 stars",
        "title": "An angel's lullaby",
        "description": "A gentle lullaby Aurin keeps for only the rarest stars — yours to listen to whenever the night feels long.",
        "payload": {"kind": "lullaby", "audio_slug": "rahu-ingel-lullaby"},
    },
]


def get_action(slug: str) -> Dict[str, Any] | None:
    for a in ANGEL_STARS_ACTIONS:
        if a["slug"] == slug:
            return a
    return None


def actions_for_age(age_slug: str) -> List[Dict[str, Any]]:
    """Return the catalog of actions valid for a given age slug, in
    a stable order (the order they appear in ANGEL_STARS_ACTIONS).
    """
    return [a for a in ANGEL_STARS_ACTIONS if age_slug in a.get("age_slugs", [])]


# Validated age slugs (mirrors the frontend `kidsHubThemes.js`).
ANGEL_STARS_VALID_AGE_SLUGS = ("little-dreamers", "explorers", "dreamweavers")

CHILD_TITLES = {
    "little-dreamers": ("Little Dreamers", "Ages 3–5"),
    "explorers": ("Explorers", "Ages 6–8"),
    "dreamweavers": ("Dreamweavers", "Ages 9–12"),
}


def normalise_age_slug(slug: str | None) -> str:
    """Accept both modern slugs and legacy 3-5/6-8/9-12 numerics."""
    if not slug:
        return "explorers"
    aliases = {"3-5": "little-dreamers", "6-8": "explorers", "9-12": "dreamweavers"}
    canonical = aliases.get(slug, slug)
    if canonical not in ANGEL_STARS_VALID_AGE_SLUGS:
        return "explorers"
    return canonical
