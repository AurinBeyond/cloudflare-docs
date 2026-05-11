"""Iteration 32 — LemonSqueezy variant IDs activated + Body Room
chakra-aligned redesign (founder pivot from TCM organ model).

Coverage:
  1. /api/books — all 8 SEED books carry numeric LemonSqueezy variant IDs
     (matches the founder's 16-product LS storefront).
  2. /api/clarity/passes — 3 passes (30min, 60min, season_30days) all
     report checkout_ready=True and expose `lemonsqueezy_variant_id`.
  3. /api/courses — 4 courses all carry variant_ids and checkout_ready.
  4. /api/courses/{slug} — single course detail also exposes variant_id.
  5. /api/body-room/hotspots — exactly the 8 chakra-aligned regions in
     the founder's vertical map order:
       crown · throat · heart · solar_plexus · belly · hips · hands · feet
  6. Each hotspot carries the full uniform schema (region, label,
     emotion, symptom, what_it_carries, release, why_it_speaks_to_you,
     image_slug). Old TCM regions (jaws/liver/lungs/kidneys/shoulders)
     are NOT present.
"""
import os
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "").rstrip("/")
if not BASE_URL:
    with open("/app/frontend/.env") as f:
        for line in f:
            if line.startswith("REACT_APP_BACKEND_URL="):
                BASE_URL = line.split("=", 1)[1].strip().rstrip("/")
                break


# ---------- LemonSqueezy variant IDs ----------

EXPECTED_BOOK_VARIANTS = {
    "beyond-the-matrix-i": "1606071",
    "beyond-the-matrix-ii": "1606223",
    "the-language-of-angels": "1606213",
    "you-dont-have-to-dance-to-anothers-tune": "1606185",
    "angels-tales": "1606234",
    "angels-story": "1606247",
    "engels-friends-2": "1606260",
    "the-night-angels-embrace": "1606266",
}
EXPECTED_PASS_VARIANTS = {
    "30min": "1606274",
    "60min": "1606349",
    "season_30days": "1606394",
}
EXPECTED_COURSE_VARIANTS = {
    "letting-the-old-stories-rest": "1606407",
    "the-language-you-forgot": "1606433",
    "seven-quiet-evenings-with-children": "1606445",
    "the-body-knows-first": "1606453",
}


def test_books_carry_variant_ids():
    r = requests.get(f"{BASE_URL}/api/books", timeout=10)
    assert r.status_code == 200
    by_slug = {b["slug"]: b for b in r.json()}
    for slug, expected_vid in EXPECTED_BOOK_VARIANTS.items():
        assert slug in by_slug, f"{slug} missing from /api/books"
        assert by_slug[slug].get("lemonsqueezy_variant_id") == expected_vid, (
            f"{slug} variant_id mismatch: {by_slug[slug].get('lemonsqueezy_variant_id')!r}"
        )


def test_passes_all_checkout_ready():
    r = requests.get(f"{BASE_URL}/api/clarity/passes", timeout=10)
    assert r.status_code == 200
    by_tier = {p["tier"]: p for p in r.json()["passes"]}
    for tier, expected_vid in EXPECTED_PASS_VARIANTS.items():
        assert tier in by_tier
        assert by_tier[tier]["checkout_ready"] is True
        assert by_tier[tier].get("lemonsqueezy_variant_id") == expected_vid


def test_courses_all_carry_variant_ids():
    r = requests.get(f"{BASE_URL}/api/courses", timeout=10)
    assert r.status_code == 200
    by_slug = {c["slug"]: c for c in r.json()["courses"]}
    for slug, expected_vid in EXPECTED_COURSE_VARIANTS.items():
        assert slug in by_slug
        assert by_slug[slug]["checkout_ready"] is True
        assert by_slug[slug].get("lemonsqueezy_variant_id") == expected_vid


def test_course_detail_exposes_variant_id():
    r = requests.get(f"{BASE_URL}/api/courses/the-body-knows-first", timeout=10)
    assert r.status_code == 200
    course = r.json()["course"]
    assert course.get("lemonsqueezy_variant_id") == "1606453"
    assert course.get("checkout_ready") is True


# ---------- Body Room redesign (chakra map) ----------

EXPECTED_REGION_ORDER = [
    "crown", "throat", "heart", "solar_plexus",
    "belly", "hips", "hands", "feet",
]
DEPRECATED_REGIONS = {"jaws", "liver", "lungs", "kidneys", "shoulders"}
REQUIRED_FIELDS = (
    "region", "label", "emotion", "symptom",
    "what_it_carries", "release", "why_it_speaks_to_you", "image_slug",
)


def test_body_room_returns_eight_chakra_regions_in_order():
    r = requests.get(f"{BASE_URL}/api/body-room/hotspots", timeout=10)
    assert r.status_code == 200
    hotspots = r.json()["hotspots"]
    assert len(hotspots) == 8
    actual = [h["region"] for h in hotspots]
    assert actual == EXPECTED_REGION_ORDER, f"order mismatch: {actual}"


def test_old_tcm_regions_are_gone():
    r = requests.get(f"{BASE_URL}/api/body-room/hotspots", timeout=10)
    regions = {h["region"] for h in r.json()["hotspots"]}
    for old in DEPRECATED_REGIONS:
        assert old not in regions, f"old TCM region '{old}' still present"


def test_every_hotspot_has_uniform_schema():
    r = requests.get(f"{BASE_URL}/api/body-room/hotspots", timeout=10)
    for h in r.json()["hotspots"]:
        for field in REQUIRED_FIELDS:
            assert h.get(field), f"missing {field!r} on {h.get('region')!r}"
        # Sanity: all texts substantive (>30 chars)
        assert len(h["what_it_carries"]) > 60
        assert len(h["release"]) > 30
        assert len(h["why_it_speaks_to_you"]) > 40


# ---------- Deep layer (Viilma-influenced psychosomatic dialogue) ----------

DEEP_FIELDS = ("toxin_name", "how_it_forms", "forgiveness_path", "release_signs", "medical_note")


def test_every_hotspot_has_deep_layer():
    r = requests.get(f"{BASE_URL}/api/body-room/hotspots", timeout=10)
    for h in r.json()["hotspots"]:
        deep = h.get("deep_layer")
        assert deep, f"region {h['region']} missing deep_layer"
        for f in DEEP_FIELDS:
            assert deep.get(f), f"region {h['region']} missing deep_layer.{f}"
        assert len(deep["how_it_forms"]) > 100
        assert len(deep["forgiveness_path"]) > 80


# ---------- Inherited loads: children patterns ----------

def test_children_patterns_endpoint():
    r = requests.get(f"{BASE_URL}/api/body-room/children-patterns", timeout=10)
    assert r.status_code == 200
    body = r.json()
    assert len(body["patterns"]) == 5
    ids = {p["id"] for p in body["patterns"]}
    assert ids == {
        "child-throat", "child-belly", "child-skin",
        "child-ears", "child-sleep",
    }
    for p in body["patterns"]:
        for f in ("child_symptom", "in_the_child", "parent_mirror", "release_path"):
            assert p.get(f), f"{p['id']} missing {f}"
    # Framing: preamble + medical note both present
    assert body.get("preamble")
    assert "medical" in body.get("medical_note", "").lower()


# ---------- New Rhythm (tunnel exit) ----------

def test_every_hotspot_has_new_rhythm():
    """Iter34: each deep_layer must offer a `new_rhythm` — the light
    at the end of the tunnel. We never leave a wanderer in 'the toxin'."""
    r = requests.get(f"{BASE_URL}/api/body-room/hotspots", timeout=10)
    for h in r.json()["hotspots"]:
        nr = h.get("deep_layer", {}).get("new_rhythm")
        assert nr, f"region {h['region']} missing new_rhythm"
        assert len(nr) > 60


# ---------- Unwinding patterns library ----------

EXPECTED_PATTERN_IDS = {
    "pattern-pull", "pattern-food", "pattern-anger",
    "pattern-jealousy", "pattern-screen",
    "pattern-borrowed-key", "pattern-postponed",
}
PATTERN_FIELDS = ("title", "surface", "beneath", "soft_exit", "new_rhythm")


def test_patterns_endpoint_shape():
    r = requests.get(f"{BASE_URL}/api/body-room/patterns", timeout=10)
    assert r.status_code == 200
    body = r.json()
    ids = {p["id"] for p in body["patterns"]}
    assert ids == EXPECTED_PATTERN_IDS
    assert body.get("preamble")
    assert body.get("honesty_note")
    for p in body["patterns"]:
        for f in PATTERN_FIELDS:
            assert p.get(f), f"{p['id']} missing {f}"
        assert len(p["new_rhythm"]) > 60


# ---------- Journey questionnaire ----------

def test_questionnaire_shape():
    r = requests.get(f"{BASE_URL}/api/body-room/questionnaire", timeout=10)
    assert r.status_code == 200
    body = r.json()
    assert len(body["questions"]) == 5
    assert body.get("preamble")
    assert body.get("honesty_prompt")
    # Each question has 3-6 options with stable fields
    for q in body["questions"]:
        assert q.get("id")
        assert q.get("prompt")
        opts = q.get("options") or []
        assert 3 <= len(opts) <= 6
        for opt in opts:
            assert opt.get("value")
            assert opt.get("label")


# ---------- Public-facing attribution hygiene ----------

def test_further_reading_returns_empty_publicly():
    """Per founder directive — no public attribution of source thinkers."""
    r = requests.get(f"{BASE_URL}/api/body-room/further-reading", timeout=10)
    assert r.status_code == 200
    body = r.json()
    assert body.get("items") == []


def test_no_external_author_attribution_in_hotspots():
    """No public Viilma / Lipton / Mate reference in the hotspot payload."""
    r = requests.get(f"{BASE_URL}/api/body-room/hotspots", timeout=10)
    import json as _json
    raw = _json.dumps(r.json()).lower()
    for forbidden in ("viilma", "lipton", "gabor mat", "goodreads"):
        assert forbidden not in raw, f"public payload contains forbidden attribution: {forbidden}"


def test_no_attribution_in_patterns_or_children():
    import json as _json
    for path in ("/api/body-room/patterns", "/api/body-room/children-patterns"):
        r = requests.get(f"{BASE_URL}{path}", timeout=10)
        raw = _json.dumps(r.json()).lower()
        for forbidden in ("viilma", "lipton", "gabor mat", "goodreads"):
            assert forbidden not in raw, f"{path} contains forbidden attribution: {forbidden}"

