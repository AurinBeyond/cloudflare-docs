"""Iteration 5 — backend smoke tests for brand/books/legal surfaces."""
import os
import requests
import pytest

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://aurin-hub.preview.emergentagent.com").rstrip("/")


@pytest.fixture(scope="module")
def s():
    return requests.Session()


def test_auth_me_unauth(s):
    r = s.get(f"{BASE_URL}/api/auth/me")
    assert r.status_code == 401


def test_brand_surface_has_about_the_author(s):
    r = s.get(f"{BASE_URL}/api/content/entries", params={"surface": "brand"})
    assert r.status_code == 200
    data = r.json()
    assert isinstance(data, list)
    assert len(data) == 1, f"expected exactly 1 brand entry, got {len(data)}"
    e = data[0]
    assert e["slug"] == "about-the-author"
    assert e["title"] == "A blank page, and the programs we carry"
    assert "This book is part of my life story." in (e.get("html") or "")


def test_books_at_least_three(s):
    r = s.get(f"{BASE_URL}/api/books")
    assert r.status_code == 200
    books = r.json()
    assert isinstance(books, list)
    assert len(books) >= 3
    slugs = [b["slug"] for b in books]
    # the requested simple slugs should match by prefix in actual slugs
    assert any(sl.startswith("meditation-pack") for sl in slugs)
    assert any(sl.startswith("star-whispers") for sl in slugs)
    assert any(sl.startswith("genesis-protocol") for sl in slugs)


def test_legal_surface_has_refund_policy(s):
    r = s.get(f"{BASE_URL}/api/content/entries", params={"surface": "legal"})
    assert r.status_code == 200
    data = r.json()
    assert len(data) >= 4
    slugs = [e.get("slug") for e in data]
    assert "refund-policy" in slugs


def test_static_assets_load(s):
    for path in ["/assets/brand/prulesoul-logo.png", "/assets/kids/coloring/aurin-kids-cover.png"]:
        r = s.get(f"{BASE_URL}{path}")
        assert r.status_code == 200, f"asset {path} returned {r.status_code}"
        assert r.headers.get("content-type", "").startswith("image/")


def test_pages_no_5xx(s):
    # Frontend SPA pages — should return HTML, not 5xx
    for path in ["/", "/about", "/kids-universe/coloring", "/bookstore"]:
        r = s.get(f"{BASE_URL}{path}", allow_redirects=True)
        assert r.status_code < 500, f"{path} returned {r.status_code}"
