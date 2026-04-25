"""Iteration 9 — Blog, Newsletter, and regression tests."""
import os
import uuid
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://aurin-hub.preview.emergentagent.com").rstrip("/")
API = f"{BASE_URL}/api"


@pytest.fixture
def s():
    return requests.Session()


# ---------------- Blog ----------------
class TestBlog:
    def test_list_blog(self, s):
        r = s.get(f"{API}/blog", timeout=15)
        assert r.status_code == 200
        data = r.json()
        assert isinstance(data, list)
        assert len(data) >= 1
        slugs = [p["slug"] for p in data]
        assert "mirror-of-our-souls" in slugs
        post = next(p for p in data if p["slug"] == "mirror-of-our-souls")
        assert post["title"] == "The Mirror of Our Souls"
        assert post["cover_image_url"] == "/assets/blog/mirror-of-our-souls.png"
        assert len(post["html"]) > 1000

    def test_get_blog_slug(self, s):
        r = s.get(f"{API}/blog/mirror-of-our-souls", timeout=15)
        assert r.status_code == 200
        post = r.json()
        assert post["slug"] == "mirror-of-our-souls"
        assert len(post["html"]) > 0

    def test_blog_404(self, s):
        r = s.get(f"{API}/blog/does-not-exist", timeout=15)
        assert r.status_code == 404


# ---------------- Newsletter ----------------
class TestNewsletter:
    def test_newsletter_no_consent(self, s):
        r = s.post(f"{API}/newsletter",
                   json={"email": f"test-it9-{uuid.uuid4().hex[:8]}@example.com",
                         "consent": False}, timeout=15)
        assert r.status_code == 400

    def test_newsletter_invalid_email(self, s):
        r = s.post(f"{API}/newsletter",
                   json={"email": "notanemail", "consent": True}, timeout=15)
        assert r.status_code == 400

    def test_newsletter_valid_and_idempotent(self, s):
        email = f"test-it9-{uuid.uuid4().hex[:8]}@example.com"
        r1 = s.post(f"{API}/newsletter",
                    json={"email": email, "consent": True,
                          "source": "test:iter9"}, timeout=15)
        assert r1.status_code == 200
        body = r1.json()
        assert body["status"] == "subscribed"
        assert body["email"] == email
        # Second call: idempotent
        r2 = s.post(f"{API}/newsletter",
                    json={"email": email, "consent": True}, timeout=15)
        assert r2.status_code == 200
        assert r2.json()["status"] == "subscribed"


# ---------------- Regression ----------------
class TestRegression:
    def test_books_six(self, s):
        r = s.get(f"{API}/books", timeout=15)
        assert r.status_code == 200
        data = r.json()
        assert len(data) == 6

    def test_brand_entry(self, s):
        r = s.get(f"{API}/content/entries", params={"surface": "brand"}, timeout=15)
        assert r.status_code == 200
        data = r.json()
        slugs = [e["slug"] for e in data]
        assert "about-the-author" in slugs

    def test_experience_unauth(self, s):
        r = s.get(f"{API}/experience/the-beginning/me", timeout=15)
        assert r.status_code == 401
