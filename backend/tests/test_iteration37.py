"""Iteration 37 — Safety layer + Wanderer's Agreement + Admin reminders.

Covers:
  1. /api/support/crisis — public hotline list
  2. /api/admin/reminders — auth + parsing of FOUNDER_REMINDERS.md
  3. Clarity AI prompt carries the safety (Panic Button) clause
  4. Cabinet opening greeting references the Wanderer's Agreement
"""
import os
import pathlib
import requests

from backend import clarity_ai

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "").rstrip("/")
if not BASE_URL:
    with open("/app/frontend/.env") as f:
        for line in f:
            if line.startswith("REACT_APP_BACKEND_URL="):
                BASE_URL = line.split("=", 1)[1].strip().rstrip("/")
                break

SYS = clarity_ai.CLARITY_SYSTEM_PROMPT


# ---------- Crisis-support endpoint ----------

def test_crisis_support_public_and_complete():
    r = requests.get(f"{BASE_URL}/api/support/crisis", timeout=10)
    assert r.status_code == 200
    body = r.json()
    assert body.get("preamble")
    assert body.get("reminder")
    hotlines = body.get("hotlines") or []
    # Estonia + EU + emergency + international at minimum
    names = " ".join(h.get("name", "").lower() for h in hotlines)
    assert "eluliin" in names
    assert any("112" in (h.get("phone") or "") for h in hotlines)
    assert any("findahelpline" in (h.get("web") or "") for h in hotlines)
    # Each hotline has the expected structure
    for h in hotlines:
        assert h.get("name")
        assert h.get("region")
        assert h.get("note")


# ---------- Safety clause in Clarity AI system prompt ----------

def test_safety_clause_present_in_prompt():
    # Section heading
    assert "Safety — the one rule that overrides everything else" in SYS
    # Key safety ingredients
    assert "116 123" in SYS           # Estonian hotline
    assert "112" in SYS               # emergency number
    assert "findahelpline.com" in SYS # global directory
    # Absolute override language
    lower = SYS.lower()
    assert "absolute" in lower
    assert "safety first" in lower or "safety — the one rule" in lower
    # The rule says "do not continue the inner-work conversation after this"
    assert "Do not" in SYS and "continue" in SYS.lower()


# ---------- Opening greeting mentions the agreement ----------

def test_opening_greeting_points_to_agreement():
    # Read the greeting constant from server.py source (not runtime,
    # because /api/clarity/start requires auth + DB state).
    src = pathlib.Path("/app/backend/server.py").read_text()
    # Must contain the agreement link + the safety line
    assert "/wanderers-agreement" in src
    assert "Eluliin 116 123" in src
    # The words may be broken across string-literal line continuations,
    # so check for the key anchors separately.
    assert "Wanderer" in src and "Agreement" in src


# ---------- Admin reminders: auth gating ----------

def _h(t):
    return {"Authorization": f"Bearer {t}"}


def test_admin_reminders_requires_auth():
    r = requests.get(f"{BASE_URL}/api/admin/reminders", timeout=10)
    assert r.status_code in (401, 403)


def test_admin_reminders_rejects_non_admin_member(member):
    token, _ = member
    r = requests.get(f"{BASE_URL}/api/admin/reminders", headers=_h(token), timeout=10)
    assert r.status_code == 403


def test_admin_reminders_parses_founder_file(admin):
    token, _ = admin
    r = requests.get(f"{BASE_URL}/api/admin/reminders", headers=_h(token), timeout=10)
    assert r.status_code == 200
    body = r.json()
    # Expect today field + at least the R-01 psychologist reminder parsed
    assert "today" in body
    ids = [x["id"] for x in body.get("reminders", [])]
    assert "R-01" in ids, f"R-01 not parsed; got {ids}"
    # Each reminder has required structure
    for r_entry in body["reminders"]:
        assert "id" in r_entry
        assert "title" in r_entry
        assert "trigger_date" in r_entry
        assert r_entry["status"] in ("DORMANT", "TRIGGERED")
        assert "summary" in r_entry
    # triggered_count matches the filtered list
    assert body["triggered_count"] == sum(
        1 for x in body["reminders"] if x["status"] == "TRIGGERED"
    )


# ---------- Founder reminders file sanity ----------

def test_founder_reminders_file_valid():
    path = pathlib.Path("/app/memory/FOUNDER_REMINDERS.md")
    assert path.exists()
    text = path.read_text()
    # Header + at least one active reminder + rules for future agents
    assert "FOUNDER_REMINDERS" in text or "Founder Reminders" in text
    assert "ACTIVE REMINDERS" in text
    assert "R-01" in text
    assert "trigger_date" in text.lower() or "trigger date" in text.lower()
