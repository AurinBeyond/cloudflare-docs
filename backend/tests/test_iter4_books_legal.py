"""Iteration 4 — Bookstore USD migration + Legal seed + regression."""
import os
import requests
import pytest

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://aurin-hub.preview.emergentagent.com").rstrip("/")
API = f"{BASE_URL}/api"


# ----- Bookstore -----
class TestBooks:
    def test_books_returns_4(self):
        r = requests.get(f"{API}/books", timeout=15)
        assert r.status_code == 200
        data = r.json()
        slugs = {b["slug"] for b in data}
        expected = {
            "genesis-protocols-volume-i-book",
            "genesis-protocols-volume-ii-book",
            "meditation-pack-volume-i",
            "star-whispers-childrens-book",
        }
        assert expected.issubset(slugs), f"Missing: {expected - slugs}, all: {slugs}"
        # Filter to only the 4 expected books for further assertions
        target = [b for b in data if b["slug"] in expected]
        assert len(target) == 4

    def test_pricing_and_placeholders(self):
        r = requests.get(f"{API}/books", timeout=15)
        data = {b["slug"]: b for b in r.json()}
        adult = ["genesis-protocols-volume-i-book", "genesis-protocols-volume-ii-book", "meditation-pack-volume-i"]
        for s in adult:
            b = data.get(s)
            assert b is not None, f"missing {s}"
            assert b["price"] == 35.0, f"{s} price={b['price']}"
            assert b["currency"] == "USD"
            assert b["audience"] == "adult"
            assert b["tax_category"] == "book_zero_rate_ready"
            assert b["lemonsqueezy_product_id"] and b["lemonsqueezy_product_id"].startswith("PLACEHOLDER_")

        kid = data["star-whispers-childrens-book"]
        assert kid["price"] == 25.0
        assert kid["currency"] == "USD"
        assert kid["audience"] == "kids"
        assert kid["tax_category"] == "book_zero_rate_ready"
        assert kid["lemonsqueezy_product_id"].startswith("PLACEHOLDER_")

    def test_audience_kids_filter(self):
        r = requests.get(f"{API}/books", params={"audience": "kids"}, timeout=15)
        assert r.status_code == 200
        data = r.json()
        assert len(data) == 1
        assert data[0]["slug"] == "star-whispers-childrens-book"

    def test_audience_adult_filter(self):
        r = requests.get(f"{API}/books", params={"audience": "adult"}, timeout=15)
        assert r.status_code == 200
        data = r.json()
        slugs = {b["slug"] for b in data}
        assert slugs == {
            "genesis-protocols-volume-i-book",
            "genesis-protocols-volume-ii-book",
            "meditation-pack-volume-i",
        }, f"adult slugs: {slugs}"


# ----- Legal -----
class TestLegal:
    def test_legal_entries_4(self):
        r = requests.get(f"{API}/content/entries", params={"surface": "legal"}, timeout=15)
        assert r.status_code == 200, r.text
        data = r.json()
        slugs = {e["slug"] for e in data}
        assert slugs == {
            "terms-of-service",
            "user-responsibility",
            "refund-policy",
            "acceptable-use-and-community",
        }, f"slugs: {slugs}"
        for e in data:
            assert e["html"], f"{e['slug']} missing html"
            assert isinstance(e.get("sections"), list)
            assert isinstance(e.get("validation_warnings"), list)

    def test_terms_h2_sections(self):
        r = requests.get(f"{API}/content/entries/terms-of-service", timeout=15)
        assert r.status_code == 200
        data = r.json()
        h2_titles = [s["title"] for s in data["sections"] if s["level"] == 2]
        # markdown headings start with "1. Who we are" etc.
        joined = " | ".join(h2_titles).lower()
        for needle in [
            "who we are",
            "your account",
            "content and intellectual property",
            "purchases",
            "acceptable use",
            "disclaimer",
            "changes",
            "contact",
        ]:
            assert needle in joined, f"missing H2 '{needle}' in: {joined}"


# ----- Regression -----
class TestRegression:
    def test_health(self):
        r = requests.get(f"{API}/", timeout=10)
        assert r.status_code == 200
        assert r.json()["status"] == "ok"

    def test_auth_me_unauth(self):
        r = requests.get(f"{API}/auth/me", timeout=10)
        assert r.status_code == 401

    def test_github_sync_not_configured(self):
        r = requests.post(f"{API}/content/sync/github", json={"repo": "owner/repo"}, timeout=15)
        assert r.status_code == 200
        assert r.json()["status"] == "not_configured"

    def test_reach_out(self):
        payload = {"name": "TEST_iter4", "email": "test_iter4@example.com", "topic": "general", "message": "iter4 test"}
        r = requests.post(f"{API}/reach-out", json=payload, timeout=15)
        assert r.status_code == 200
        assert r.json()["status"] == "received"

    def test_admin_validate(self):
        r = requests.post(f"{API}/content/validate", json={"markdown": "## Hello\n\ntext"}, timeout=10)
        assert r.status_code == 200
        assert r.json()["ok"] is True

    def test_library_audience_filter(self):
        r = requests.get(f"{API}/content/entries", params={"surface": "library", "audience": "grown-ups"}, timeout=15)
        assert r.status_code == 200
        assert len(r.json()) >= 1
