"""Iteration 6 backend tests: 6 real books, eBookMaker links, sample PDF, cover image, donation, kids assets."""
import os
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://aurin-hub.preview.emergentagent.com").rstrip("/")

EXPECTED_SLUGS = {
    "you-dont-have-to-dance-to-anothers-tune",
    "the-language-of-angels",
    "beyond-the-matrix-ii",
    "angels-tales",
    "engels-friends-2",
    "the-night-angels-embrace",
}
ADULT_SLUGS = {"you-dont-have-to-dance-to-anothers-tune", "the-language-of-angels", "beyond-the-matrix-ii"}
KIDS_SLUGS = {"angels-tales", "engels-friends-2", "the-night-angels-embrace"}


@pytest.fixture(scope="module")
def books():
    r = requests.get(f"{BASE_URL}/api/books", timeout=20)
    assert r.status_code == 200, r.text
    return r.json()


# ---------- Books inventory ----------

class TestBooksInventory:
    def test_returns_six_expected_books(self, books):
        assert len(books) == 6
        assert {b["slug"] for b in books} == EXPECTED_SLUGS

    def test_audience_and_pricing(self, books):
        for b in books:
            if b["slug"] in ADULT_SLUGS:
                assert b["audience"] == "adult", b["slug"]
                assert float(b["price"]) == 35.0, b["slug"]
            elif b["slug"] in KIDS_SLUGS:
                assert b["audience"] == "kids", b["slug"]
                assert float(b["price"]) == 25.0, b["slug"]
            assert b.get("currency", "USD").upper() == "USD"

    def test_external_url_tax_and_lemonsqueezy(self, books):
        for b in books:
            assert b.get("external_read_url", "").startswith("https://ebookmaker.ai/"), b["slug"]
            assert b.get("tax_category") == "book_zero_rate_ready", b["slug"]
            assert (b.get("lemonsqueezy_product_id") or "").startswith("PLACEHOLDER_"), b["slug"]

    def test_specific_pdf_and_cover(self, books):
        by = {b["slug"]: b for b in books}
        assert by["angels-tales"]["pdf_url"] == "/assets/books/angels-tales.pdf"
        assert by["the-night-angels-embrace"]["cover_image_url"] == "/assets/kids/visualisations/bedtime-angel.png"


# ---------- Filtered queries ----------

class TestBookFilters:
    def test_audience_adult(self):
        r = requests.get(f"{BASE_URL}/api/books?audience=adult", timeout=20)
        assert r.status_code == 200
        d = r.json()
        assert len(d) == 3
        assert {b["slug"] for b in d} == ADULT_SLUGS

    def test_audience_kids(self):
        r = requests.get(f"{BASE_URL}/api/books?audience=kids", timeout=20)
        assert r.status_code == 200
        d = r.json()
        assert len(d) == 3
        assert {b["slug"] for b in d} == KIDS_SLUGS

    def test_get_angels_tales(self):
        r = requests.get(f"{BASE_URL}/api/books/angels-tales", timeout=20)
        assert r.status_code == 200
        d = r.json()
        assert d["slug"] == "angels-tales"
        assert d["pdf_url"] == "/assets/books/angels-tales.pdf"

    def test_get_night_angels(self):
        r = requests.get(f"{BASE_URL}/api/books/the-night-angels-embrace", timeout=20)
        assert r.status_code == 200
        d = r.json()
        assert d["slug"] == "the-night-angels-embrace"
        assert d["cover_image_url"] == "/assets/kids/visualisations/bedtime-angel.png"


# ---------- Static assets ----------

class TestStaticAssets:
    @pytest.mark.parametrize("path,ctype", [
        ("/assets/books/angels-tales.pdf", "application/pdf"),
        ("/assets/kids/visualisations/bedtime-angel.png", "image/png"),
        ("/assets/kids/visualisations/book.mp4", "video/mp4"),
        ("/assets/brand/pure-soul-life-card.png", "image/png"),
    ])
    def test_static(self, path, ctype):
        r = requests.get(f"{BASE_URL}{path}", timeout=30, stream=True)
        assert r.status_code == 200, f"{path} -> {r.status_code}"
        assert ctype in r.headers.get("content-type", ""), r.headers.get("content-type")


# ---------- Smoke ----------

class TestSmoke:
    def test_auth_me_unauthenticated(self):
        r = requests.get(f"{BASE_URL}/api/auth/me", timeout=10)
        assert r.status_code == 401
