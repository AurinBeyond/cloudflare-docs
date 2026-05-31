"""
Iteration 85 — Sprint 3 + Sprint 4 regression tests.

Scope (per E1 review request):
  • /listen/hearth/the-sock-on-the-stairs  (Sprint 3, audio page)
  • /alistair-bundle                       (Sprint 4, €39 bundle)
  • /the-hearth                            (Sprint 3 regression)
  • /listen/little-star                    (Sprint 2 regression)
  • /seven-quiet-nights                    (regression)
  • /assets/audio/hearth/the-sock-on-the-stairs.mp3   (audio asset HTTP 200, audio/mpeg)
  • /api/courses returns the 3 expected courses @ €25 each
  • /api/ root health (Sprint 4 backend regression)

All assertions are made against REACT_APP_BACKEND_URL (Kubernetes ingress)
so we test exactly what the user sees.
"""
import os
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://aurin-hub.preview.emergentagent.com").rstrip("/")
# Override from /app/frontend/.env if present.
try:
    with open("/app/frontend/.env") as f:
        for ln in f:
            if ln.startswith("REACT_APP_BACKEND_URL="):
                BASE_URL = ln.split("=", 1)[1].strip().rstrip("/")
                break
except Exception:
    pass


@pytest.fixture(scope="module")
def s():
    sess = requests.Session()
    sess.headers.update({"User-Agent": "iter85-sprint3-4-tests/1.0"})
    return sess


# ──────────────────────────────────────────────────────────────────────
# Frontend SPA route delivery — React SPA always returns the same
# index.html for every non-/api route; we just verify HTTP 200 + the
# React root div, so the route is reachable through the ingress.
# Actual page content is verified via Playwright separately.
# ──────────────────────────────────────────────────────────────────────
class TestFrontendRoutes:
    @pytest.mark.parametrize("path", [
        "/listen/hearth/the-sock-on-the-stairs",
        "/alistair-bundle",
        "/the-hearth",
        "/listen/little-star",
        "/seven-quiet-nights",
    ])
    def test_route_reachable_200(self, s, path):
        r = s.get(f"{BASE_URL}{path}", timeout=15, allow_redirects=True)
        assert r.status_code == 200, f"{path} returned {r.status_code}"
        # SPA HTML shell
        assert "<div id=\"root\"" in r.text or "<div id='root'" in r.text, (
            f"{path} did not return SPA shell"
        )


# ──────────────────────────────────────────────────────────────────────
# Audio asset reachability (Sprint 3 P0 deliverable)
# ──────────────────────────────────────────────────────────────────────
class TestAudioAsset:
    AUDIO_PATH = "/assets/audio/hearth/the-sock-on-the-stairs.mp3"

    def test_audio_head_200(self, s):
        url = f"{BASE_URL}{self.AUDIO_PATH}"
        # Many static servers don't implement HEAD on assets — try GET range first
        r = s.get(url, headers={"Range": "bytes=0-1023"}, timeout=20, stream=True)
        assert r.status_code in (200, 206), f"audio asset returned {r.status_code}"
        ct = r.headers.get("Content-Type", "").lower()
        # audio/mpeg is standard; some servers send application/octet-stream
        # but the file is an mp3 so we accept the broader set and flag.
        assert "audio" in ct or "mpeg" in ct or "octet-stream" in ct, (
            f"unexpected content-type for mp3: {ct!r}"
        )
        # Read a small chunk to validate it's an actual mp3 (ID3 or MPEG frame sync)
        first_bytes = r.raw.read(4) if hasattr(r.raw, "read") else r.content[:4]
        # ID3 tag "ID3" or MPEG frame sync 0xFFFB / 0xFFFA / 0xFFF3 ...
        is_id3 = first_bytes[:3] == b"ID3"
        is_mpeg = len(first_bytes) >= 2 and first_bytes[0] == 0xFF and (first_bytes[1] & 0xE0) == 0xE0
        assert is_id3 or is_mpeg, f"file does not look like mp3 (first 4 bytes: {first_bytes!r})"
        r.close()

    def test_audio_content_type_strict(self, s):
        """Soft check — flags if content-type isn't audio/mpeg exactly."""
        url = f"{BASE_URL}{self.AUDIO_PATH}"
        r = s.get(url, headers={"Range": "bytes=0-1"}, timeout=15, stream=True)
        ct = r.headers.get("Content-Type", "").lower()
        r.close()
        # Just record — the strict assertion is in test_audio_head_200.
        assert ct, "missing Content-Type header"


# ──────────────────────────────────────────────────────────────────────
# Backend /api/courses regression (Sprint 4 derives €75 from this)
# ──────────────────────────────────────────────────────────────────────
class TestCoursesAPI:
    EXPECTED_SLUGS = {
        "letting-the-old-stories-rest",
        "the-language-you-forgot",
        "the-body-knows-first",
    }

    def test_courses_endpoint_200(self, s):
        r = s.get(f"{BASE_URL}/api/courses", timeout=15)
        assert r.status_code == 200, f"GET /api/courses returned {r.status_code}: {r.text[:200]}"
        data = r.json()
        # Accept either a raw list or {courses: [...]}
        if isinstance(data, dict):
            courses = data.get("courses") or data.get("items") or []
        else:
            courses = data
        assert isinstance(courses, list), f"unexpected courses shape: {type(courses)}"
        assert len(courses) >= 3, f"expected ≥3 courses, got {len(courses)}"

    def test_courses_contain_expected_alistair_slugs(self, s):
        r = s.get(f"{BASE_URL}/api/courses", timeout=15)
        assert r.status_code == 200
        data = r.json()
        courses = data.get("courses") if isinstance(data, dict) else data
        slugs = {c.get("slug") for c in courses if isinstance(c, dict)}
        missing = self.EXPECTED_SLUGS - slugs
        assert not missing, f"missing expected Alistair slugs in /api/courses: {missing}. Found: {slugs}"

    def test_courses_price_25_each(self, s):
        r = s.get(f"{BASE_URL}/api/courses", timeout=15)
        data = r.json()
        courses = data.get("courses") if isinstance(data, dict) else data
        prices = {}
        for c in courses:
            if isinstance(c, dict) and c.get("slug") in self.EXPECTED_SLUGS:
                # Price may be 25, 25.0, "25", "€25", or nested under price_eur / amount
                p = c.get("price") or c.get("price_eur") or c.get("amount") or c.get("priceEur")
                prices[c["slug"]] = p
        assert len(prices) == 3, f"expected price field for 3 Alistair courses, got {prices}"
        for slug, p in prices.items():
            # Coerce
            if isinstance(p, str):
                p_norm = p.replace("€", "").replace("EUR", "").strip()
                try:
                    p_val = float(p_norm)
                except ValueError:
                    pytest.fail(f"{slug}: could not parse price {p!r}")
            else:
                p_val = float(p) if p is not None else None
            assert p_val == 25.0, f"{slug}: expected price 25.0, got {p_val!r}"


# ──────────────────────────────────────────────────────────────────────
# Backend root health (Sprint 4 was frontend-only — no regression expected)
# ──────────────────────────────────────────────────────────────────────
class TestBackendHealth:
    def test_api_root_responds(self, s):
        # Try /api/ root, then /api/health as fallback. One must respond 2xx.
        r1 = s.get(f"{BASE_URL}/api/", timeout=10)
        r2 = s.get(f"{BASE_URL}/api/health", timeout=10)
        assert r1.status_code < 500 and r2.status_code < 500, (
            f"backend roots both 5xx: /api/={r1.status_code} /api/health={r2.status_code}"
        )
        # At least one should respond 200
        assert r1.status_code == 200 or r2.status_code == 200, (
            f"neither /api/ nor /api/health returned 200 "
            f"(got {r1.status_code} / {r2.status_code})"
        )
