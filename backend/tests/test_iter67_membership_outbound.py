"""
Iter 67 regression — Membership tiers, Waitlist, Unsubscribe, Outbound.

These cover the new $0 stabilization endpoints:
- GET  /api/membership/tiers
- GET  /api/membership/me
- POST /api/waitlist/join
- GET  /api/waitlist/health
- GET  /api/email/unsubscribe
- POST /api/admin/outbound/draft
- GET  /api/admin/outbound/list
- POST /api/admin/outbound/{id}/send-email?dry_run=true
- DELETE /api/admin/outbound/{id}
- GET  /api/catalogue/availability
"""
import os
import pytest
from fastapi.testclient import TestClient

os.environ.setdefault("DB_NAME", "matrix_aurin_test")

from server import app, MEMBERSHIP_TIERS, OUTBOUND_CHANNELS  # noqa: E402


@pytest.fixture(scope="module")
def client():
    """Module-scoped TestClient so Motor's event loop survives between tests."""
    with TestClient(app) as c:
        yield c


def _admin_headers():
    return {"X-Admin-Token": os.environ.get("ADMIN_TOKEN", "")}


def test_membership_tiers_shape(client):
    r = client.get("/api/membership/tiers")
    assert r.status_code == 200
    data = r.json()
    keys = [t["key"] for t in data["tiers"]]
    assert keys == ["transient", "voyager", "eternal"]
    # Memory windows: 0 / 7 / -1 (unlimited)
    by = {t["key"]: t for t in data["tiers"]}
    assert by["transient"]["memory_window_days"] == 0
    assert by["voyager"]["memory_window_days"] == 7
    assert by["eternal"]["memory_window_days"] == -1
    # Three soft supports (ko-fi, six-nights, free-pdf)
    kinds = {s["kind"] for s in data["supplemental_supports"]}
    assert {"ko-fi", "newsletter", "free-pdf"}.issubset(kinds)
    # Pricing labels are USD-flavored, English-only
    for t in data["tiers"]:
        assert all(ord(c) < 128 or c in "≈$" for c in t["price_label"])


def test_membership_me_anonymous_defaults_to_transient(client):
    r = client.get("/api/membership/me")
    assert r.status_code == 200
    j = r.json()
    assert j["tier"] == "transient"
    assert j["authenticated"] is False


def test_catalogue_availability_returns_overlay(client):
    r = client.get("/api/catalogue/availability")
    assert r.status_code == 200
    j = r.json()
    assert "coming_soon" in j
    assert "voyager" in j["tiers_in_waitlist"]
    assert "eternal" in j["tiers_in_waitlist"]


def test_waitlist_join_validates_consent_and_email(client):
    # consent=False rejected
    r = client.post(
        "/api/waitlist/join",
        json={"email": "x@y.z", "product_slug": "voyager", "consent": False},
    )
    assert r.status_code == 400
    # bad email rejected
    r2 = client.post(
        "/api/waitlist/join",
        json={"email": "nope", "product_slug": "voyager", "consent": True},
    )
    assert r2.status_code == 400


def test_waitlist_join_then_health(client, monkeypatch):
    # Disable Resend for this test so we don't actually send.
    import email_service
    monkeypatch.setattr(email_service, "is_configured", lambda: False)
    r = client.post(
        "/api/waitlist/join",
        json={
            "email": "iter67-pytest@example.com",
            "product_slug": "voyager",
            "consent": True,
        },
    )
    assert r.status_code == 200
    j = r.json()
    assert j["status"] in ("joined", "already_on_list")
    # Idempotent
    r2 = client.post(
        "/api/waitlist/join",
        json={
            "email": "iter67-pytest@example.com",
            "product_slug": "voyager",
            "consent": True,
        },
    )
    assert r2.status_code == 200
    assert r2.json()["status"] == "already_on_list"
    # Health endpoint
    h = client.get("/api/waitlist/health")
    assert h.status_code == 200
    hj = h.json()
    assert hj["total"] >= 1
    assert "voyager" in hj["by_slug"]


def test_email_unsubscribe_returns_html(client):
    r = client.get("/api/email/unsubscribe?email=iter67-pytest@example.com")
    assert r.status_code == 200
    assert "text/html" in r.headers.get("content-type", "")
    assert "Matrix Aurin" in r.text
    assert "Unsubscribed" in r.text


def test_email_unsubscribe_rejects_bad_email(client):
    r = client.get("/api/email/unsubscribe?email=not-an-email")
    assert r.status_code == 400


@pytest.mark.skipif(
    not os.environ.get("ADMIN_TOKEN"),
    reason="ADMIN_TOKEN not set",
)
def test_outbound_admin_flow_dry_run(client, monkeypatch):
    # Disable Resend for true dry-run.
    import email_service
    monkeypatch.setattr(email_service, "is_configured", lambda: False)
    # Unauth: 401
    r401 = client.post(
        "/api/admin/outbound/draft",
        json={"title": "x", "body": "y", "channels": ["email"]},
    )
    assert r401.status_code == 401
    # Auth: create draft
    r = client.post(
        "/api/admin/outbound/draft",
        headers=_admin_headers(),
        json={
            "title": "Iter 67 pytest draft",
            "body": "Quiet hello.\n\nPytest only.",
            "channels": ["email", "telegram"],
            "audience_segment": "newsletter",
        },
    )
    assert r.status_code == 200
    cid = r.json()["id"]
    # List shows it
    rl = client.get("/api/admin/outbound/list", headers=_admin_headers())
    assert rl.status_code == 200
    assert any(c["id"] == cid for c in rl.json()["campaigns"])
    # Dry-run send
    rd = client.post(
        f"/api/admin/outbound/{cid}/send-email?dry_run=true",
        headers=_admin_headers(),
    )
    assert rd.status_code == 200
    assert rd.json()["dry_run"] is True
    # Delete draft
    rdel = client.delete(
        f"/api/admin/outbound/{cid}", headers=_admin_headers()
    )
    assert rdel.status_code == 200
    assert rdel.json()["deleted"] is True


def test_outbound_channels_constant_complete(client):
    expected = {"email", "telegram", "x", "facebook", "instagram",
                "linkedin", "discord", "blog"}
    assert expected == set(OUTBOUND_CHANNELS)


@pytest.mark.skipif(
    not os.environ.get("ADMIN_TOKEN"),
    reason="ADMIN_TOKEN not set",
)
def test_outbound_rate_limit_429_within_24h(client, monkeypatch):
    """A second non-dry-run send within 24h must return 429."""
    import email_service
    from datetime import datetime, timezone
    monkeypatch.setattr(email_service, "is_configured", lambda: False)
    # Seed via SYNC pymongo to avoid motor event-loop conflicts with TestClient.
    import os as _os, uuid
    from pymongo import MongoClient
    sync = MongoClient(_os.environ["MONGO_URL"])[_os.environ.get("DB_NAME", "matrix_aurin_test")]
    other_id = f"TEST_recent_{uuid.uuid4().hex[:8]}"
    sent_at = datetime.now(timezone.utc).isoformat()
    sync.outbound_campaigns.insert_one({
        "id": other_id, "title": "TEST_recent", "body": "x",
        "channels": ["email"], "audience_segment": "newsletter",
        "status": "sent", "sent_at": sent_at,
        "created_at": sent_at, "updated_at": sent_at,
    })
    try:
        # Create a fresh draft we will attempt to send.
        rd = client.post(
            "/api/admin/outbound/draft",
            headers=_admin_headers(),
            json={"title": "TEST_rl_target", "body": "y",
                  "channels": ["email"], "audience_segment": "newsletter"},
        )
        assert rd.status_code == 200
        cid = rd.json()["id"]
        # dry_run still works (rate-limit only applies to real sends)
        rdry = client.post(
            f"/api/admin/outbound/{cid}/send-email?dry_run=true",
            headers=_admin_headers(),
        )
        assert rdry.status_code == 200
        # Real send must 429 because of the seeded recent campaign.
        rreal = client.post(
            f"/api/admin/outbound/{cid}/send-email?dry_run=false",
            headers=_admin_headers(),
        )
        assert rreal.status_code == 429, rreal.text
        # Cleanup our draft (it was never sent so DELETE works)
        client.delete(f"/api/admin/outbound/{cid}", headers=_admin_headers())
    finally:
        # Cleanup via sync pymongo (avoids motor event-loop conflict)
        sync.outbound_campaigns.delete_one({"id": other_id})


def test_membership_tiers_no_estonian_leak(client):
    """Public payload must not contain Estonian-only words."""
    r = client.get("/api/membership/tiers")
    body = r.text.lower()
    forbidden = ["päeva", "vaikne", "kursus", "ööingli", "raha ja teadvus"]
    for word in forbidden:
        assert word not in body, f"Estonian leak: {word!r}"
