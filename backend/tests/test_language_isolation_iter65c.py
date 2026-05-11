"""§Iter 65c — language isolation regression.

Verifies that no Estonian/Cyrillic characters leak into the public
API payloads served to anonymous (non-EN) localized requests. This
is the test that catches recurrence of the W-2 / iter 65c bug:
- shelf labels reverting to Estonian
- course letter bodies containing Estonian markers
- ET courses surfacing in /api/courses

Run:  python /app/backend/tests/test_language_isolation_iter65c.py
"""
from __future__ import annotations

import json
import os
import re
import sys
from pathlib import Path

import httpx
from dotenv import load_dotenv

load_dotenv(Path(__file__).resolve().parents[1] / ".env")
API_BASE = os.environ.get("API_BASE", "http://localhost:8001")

NON_ASCII_ET = re.compile(r"[ÕÄÖÜõäöü]")
CYRILLIC = re.compile(r"[А-Яа-я]")


def _scan(label: str, payload, allow_in: list[str] | None = None) -> int:
    """Return the count of Estonian/Cyrillic chars found anywhere in
    the JSON-encoded payload, EXCEPT inside any of the keys whose
    *value paths* are listed in `allow_in` (used for safe slugs)."""
    blob = json.dumps(payload, ensure_ascii=False)
    et_hits = NON_ASCII_ET.findall(blob)
    cyr_hits = CYRILLIC.findall(blob)
    n = len(et_hits) + len(cyr_hits)
    if n:
        # Keep slug-only theme refs ("raha-ja-teadvus", etc) — these are
        # ASCII identifiers and won't trip the regex anyway. Anything
        # else that hits is a real leak.
        print(f"  LEAK · {label}: ET={len(et_hits)} CYR={len(cyr_hits)}")
    else:
        print(f"  OK   · {label}: clean")
    return n


def main():
    total_leaks = 0
    with httpx.Client(base_url=API_BASE, timeout=15) as h:
        # 1. Courses payload — only EN courses must surface.
        r = h.get("/api/courses")
        assert r.status_code == 200
        d = r.json()
        slugs = [c["slug"] for c in d["courses"]]
        assert "raha-ja-teadvus-moodul-1" not in slugs, \
            "Estonian course must not appear in public /api/courses"
        total_leaks += _scan("/api/courses", d)

        # 2. Each course detail must be ET-free.
        for slug in slugs:
            rr = h.get(f"/api/courses/{slug}")
            if rr.status_code != 200:
                continue
            cd = rr.json()
            total_leaks += _scan(f"/api/courses/{slug}", cd)

        # 3. Library shelves — labels must be English.
        r = h.get("/api/library/shelves")
        assert r.status_code == 200
        d = r.json()
        for s in d.get("shelves", []):
            assert NON_ASCII_ET.search(s.get("label", "") or "") is None, \
                f"shelf label still Estonian: {s.get('label')!r}"
            assert NON_ASCII_ET.search(s.get("intro", "") or "") is None, \
                f"shelf intro still Estonian: {s.get('intro')!r}"
        total_leaks += _scan("/api/library/shelves", d)

        # 4. Books index.
        r = h.get("/api/books")
        assert r.status_code == 200
        total_leaks += _scan("/api/books", r.json())

        # 5. Clarity passes.
        r = h.get("/api/clarity/passes")
        assert r.status_code == 200
        total_leaks += _scan("/api/clarity/passes", r.json())

    print()
    if total_leaks > 0:
        print(f"FAIL — {total_leaks} non-English characters in public payloads.")
        sys.exit(1)
    print("=== ALL LANGUAGE-ISOLATION TESTS PASSED ===")


if __name__ == "__main__":
    main()
