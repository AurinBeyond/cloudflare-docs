"""Matrix Aurin Phase 2 backend tests — content API, stubs, health."""
import os, uuid, requests, pytest

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://aurin-hub.preview.emergentagent.com").rstrip("/")
API = f"{BASE_URL}/api"


@pytest.fixture(scope="module")
def s():
    return requests.Session()


# ---- health ----
def test_health(s):
    r = s.get(f"{API}/")
    assert r.status_code == 200
    d = r.json()
    assert d["status"] == "ok"
    assert d["service"] == "matrix-aurin"


# ---- categories ----
def test_categories_seeded(s):
    r = s.get(f"{API}/content/categories")
    assert r.status_code == 200
    data = r.json()
    slugs = {c["slug"] for c in data}
    for expected in ["protocols", "books", "materials", "foundations", "practice"]:
        assert expected in slugs, f"missing {expected}"
    assert len(data) >= 5


# ---- entries seed ----
def test_library_entries(s):
    r = s.get(f"{API}/content/entries", params={"surface": "library"})
    assert r.status_code == 200
    data = r.json()
    assert len(data) >= 6
    for e in data:
        assert e.get("slug")
        assert e.get("category_slug")
        assert e.get("access") in ("free", "member")
        assert isinstance(e.get("sections"), list)
    # at least some entries have non-empty sections
    assert any(len(e["sections"]) > 0 for e in data)


def test_learning_entries(s):
    r = s.get(f"{API}/content/entries", params={"surface": "learning"})
    assert r.status_code == 200
    data = r.json()
    slugs = {e["slug"] for e in data}
    assert "foundations-intro" in slugs
    assert "practice-small-commitments" in slugs


# ---- entry detail ----
def test_entry_detail(s):
    r = s.get(f"{API}/content/entries/morning-orientation-protocol")
    assert r.status_code == 200
    d = r.json()
    assert d["title"] == "Morning Orientation Protocol"
    assert d["html"] and len(d["html"]) > 50
    assert any(sec["title"] == "Purpose" for sec in d["sections"])
    assert any(sec["title"] == "The Seven Steps" for sec in d["sections"])
    # H3 preserved
    assert any(sec["level"] == 3 for sec in d["sections"])


def test_entry_not_found(s):
    r = s.get(f"{API}/content/entries/does-not-exist-xyz")
    assert r.status_code == 404


# ---- filtering ----
def test_filter_category(s):
    r = s.get(f"{API}/content/entries", params={"category": "protocols"})
    assert r.status_code == 200
    data = r.json()
    assert len(data) >= 1
    assert all(e["category_slug"] == "protocols" for e in data)


def test_filter_access_free(s):
    r = s.get(f"{API}/content/entries", params={"access": "free"})
    assert r.status_code == 200
    data = r.json()
    assert all(e["access"] == "free" for e in data)


def test_search_q(s):
    r = s.get(f"{API}/content/entries", params={"q": "attention"})
    assert r.status_code == 200
    assert len(r.json()) >= 1


# ---- create category ----
def test_create_category_and_duplicate(s):
    slug = f"test-cat-{uuid.uuid4().hex[:8]}"
    r = s.post(f"{API}/content/categories",
               json={"slug": slug, "name": "Test Cat", "surface": "library", "order": 99})
    assert r.status_code in (200, 201), r.text
    assert r.json()["slug"] == slug
    # duplicate
    r2 = s.post(f"{API}/content/categories",
                json={"slug": slug, "name": "Dup", "surface": "library"})
    assert r2.status_code == 409


# ---- create entry parses markdown ----
def test_create_entry_parses_markdown(s):
    slug = f"test-entry-{uuid.uuid4().hex[:8]}"
    md = "## Intro\n\nHello.\n\n### Sub\n\nMore text.\n\n## Outro\n\nBye."
    r = s.post(f"{API}/content/entries", json={
        "slug": slug, "title": "Test Entry",
        "category_slug": "protocols", "surface": "library",
        "kind": "article", "access": "free", "markdown": md,
    })
    assert r.status_code in (200, 201), r.text
    d = r.json()
    assert d["html"]
    titles = [s["title"] for s in d["sections"]]
    assert "Intro" in titles and "Outro" in titles
    assert any(s["level"] == 3 and s["title"] == "Sub" for s in d["sections"])
    # verify persistence
    r2 = s.get(f"{API}/content/entries/{slug}")
    assert r2.status_code == 200
    assert r2.json()["title"] == "Test Entry"


# ---- GitHub sync stub ----
def test_github_sync_stub(s):
    r = s.post(f"{API}/content/sync/github",
               json={"repo": "owner/repo", "branch": "main", "path": "content"})
    assert r.status_code == 200
    d = r.json()
    assert d["status"] == "not_connected"
    assert "expected_conventions" in d


# ---- AI stubs ----
def test_ai_context(s):
    r = s.get(f"{API}/ai/context/morning-orientation-protocol")
    assert r.status_code == 200
    d = r.json()
    assert d["tone_reference"]
    assert isinstance(d["sections"], list) and len(d["sections"]) > 0


def test_ai_chat_stub(s):
    r = s.post(f"{API}/ai/chat", json={"message": "hi", "entry_slug": None})
    assert r.status_code == 200
    d = r.json()
    assert d["status"] == "not_active"
    assert "reply" in d and len(d["reply"]) > 10
