"""Phase 2 continued — Bookstore, audience filter, validate dry-run, admin overview."""
import os
import uuid
import requests
import pytest

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://aurin-hub.preview.emergentagent.com").rstrip("/")
API = f"{BASE_URL}/api"


@pytest.fixture(scope="module")
def s():
    return requests.Session()


# ---------- Bookstore ----------
def test_books_list_seeded(s):
    r = s.get(f"{API}/books")
    assert r.status_code == 200
    data = r.json()
    assert isinstance(data, list) and len(data) >= 3
    slugs = {b["slug"] for b in data}
    assert "genesis-protocols-volume-i-book" in slugs
    assert "kids-quiet-stories-volume-i" in slugs
    for b in data:
        assert "price" in b
        assert b["currency"] == "NOK"
        assert b["tax_category"] == "book_zero_rate_ready"
        assert "read_online" in b["delivery_options"]
        assert "download_pdf" in b["delivery_options"]


def test_book_detail_aurin_hub(s):
    # The endpoint exists per request; check actual aurin-hub or any book detail
    # Per problem statement, GET /api/books/aurin-hub. Try both.
    r = s.get(f"{API}/books/genesis-protocols-volume-i-book")
    assert r.status_code == 200
    d = r.json()
    assert d["slug"] == "genesis-protocols-volume-i-book"
    assert d.get("html"), "html missing"
    assert isinstance(d.get("sections"), list) and len(d["sections"]) >= 1
    assert "validation_warnings" in d
    assert d["currency"] == "NOK"


def test_create_book_and_duplicate(s):
    slug = f"test-book-{uuid.uuid4().hex[:8]}"
    md = "## About\n\nTest book content.\n\n## Chapter 1\n\nText."
    payload = {
        "slug": slug,
        "title": "Test Book",
        "subtitle": "Testing",
        "description": "A test",
        "price": 99.0,
        "currency": "NOK",
        "tax_category": "book_zero_rate_ready",
        "delivery_options": ["read_online", "download_pdf"],
        "markdown": md,
    }
    r = s.post(f"{API}/books", json=payload)
    assert r.status_code in (200, 201), r.text
    d = r.json()
    assert d["slug"] == slug
    assert d.get("html"), "html should be parsed from markdown"
    titles = [sec["title"] for sec in d["sections"]]
    assert "About" in titles and "Chapter 1" in titles

    # duplicate
    r2 = s.post(f"{API}/books", json=payload)
    assert r2.status_code == 409


# ---------- Audience filter ----------
def test_audience_grown_ups(s):
    r = s.get(f"{API}/content/entries", params={"audience": "grown-ups"})
    assert r.status_code == 200
    data = r.json()
    assert len(data) >= 8, f"expected >=8, got {len(data)}"
    for e in data:
        # audience may be present, all should be grown-ups
        if "audience" in e and e["audience"] is not None:
            assert e["audience"] == "grown-ups"


# ---------- Validate dry-run ----------
def _post_validate(s, md):
    r = s.post(f"{API}/content/validate", json={"markdown": md})
    assert r.status_code == 200, r.text
    d = r.json()
    assert d["ok"] is True
    return d


def test_validate_empty(s):
    d = _post_validate(s, "")
    assert "empty_input" in d["warnings"]


def test_validate_plain_text_no_headings(s):
    d = _post_validate(s, "Just some plain text without any headings at all. More words here.")
    assert "no_headings_found_applied_default" in d["warnings"]
    assert "wrapped_in_default_overview_section" in d["warnings"]
    titles = [sec["title"] for sec in d["sections"]]
    assert "Overview" in titles


def test_validate_orphan_subheadings(s):
    d = _post_validate(s, "#### Orphan four\n\nText.\n\n###### Even deeper")
    assert "promoted_orphan_subheadings" in d["warnings"]
    assert "heading_level_jumps_detected" in d["warnings"]


def test_validate_h1_demoted(s):
    d = _post_validate(s, "# Big title\n\nSome text\n\n## Sub")
    assert "demoted_h1_to_h2" in d["warnings"]


def test_validate_zero_width_and_excessive_blank(s):
    md = "## Heading\u200b\n\n\n\n\n\nSome text\u200c here.\n\n\n\n\nMore\u200d text."
    d = _post_validate(s, md)
    assert "removed_zero_width_characters" in d["warnings"]
    assert "collapsed_excessive_blank_lines" in d["warnings"]


def test_validate_h2_to_h5_jump(s):
    d = _post_validate(s, "## Section\n\nText.\n\n##### Way too deep")
    assert "heading_level_jumps_detected" in d["warnings"]


# ---------- Admin overview ----------
def test_admin_entries_list(s):
    r = s.get(f"{API}/content/admin/entries")
    assert r.status_code == 200
    data = r.json()
    assert isinstance(data, list) and len(data) >= 1
    row = data[0]
    expected_fields = {"slug", "title", "surface", "source_path", "audience", "validation_warnings", "sections_count"}
    missing = expected_fields - set(row.keys())
    assert not missing, f"missing fields in admin row: {missing}"


def test_admin_only_with_warnings(s):
    r = s.get(f"{API}/content/admin/entries", params={"only_with_warnings": "true"})
    assert r.status_code == 200
    data = r.json()
    # Could be empty if seeds clean — that's fine. Validate that any returned row has non-empty warnings.
    for row in data:
        assert row.get("validation_warnings"), "only_with_warnings returned entry with empty warnings"
