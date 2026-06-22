"""Iteration 86 — Wider Circle / Hidden lenses backend tests.

Verifies:
  - /api/parents-room/lenses returns ONLY the 4 visible lenses
    (intuitive, shitsuke, montessori, positive_coding).
  - 4 hidden lenses (scandinavian, french_cadre, reggio_emilia, waldorf)
    are NOT in the visible API list, but exist in the registry and
    are resolvable internally via parents_lenses.get_lens().
"""
import os
import sys
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "").rstrip("/")
if not BASE_URL:
    # fallback for local pytest exec — use frontend/.env
    with open("/app/frontend/.env") as fh:
        for ln in fh:
            if ln.startswith("REACT_APP_BACKEND_URL="):
                BASE_URL = ln.split("=", 1)[1].strip().rstrip("/")

VISIBLE = {"intuitive", "shitsuke", "montessori", "positive_coding"}
HIDDEN = {"scandinavian", "french_cadre", "reggio_emilia", "waldorf"}


# ------------- API: /api/parents-room/lenses returns only visible -------------
class TestParentsRoomLensesVisibility:
    def test_lenses_endpoint_200_and_only_visible(self):
        r = requests.get(f"{BASE_URL}/api/parents-room/lenses", timeout=15)
        assert r.status_code == 200, f"got {r.status_code}: {r.text[:200]}"
        data = r.json()
        # response shape — accept either list directly or {"lenses": [...]}
        items = data if isinstance(data, list) else data.get("lenses", data)
        assert isinstance(items, list), f"unexpected shape: {type(items)}"
        ids = {x.get("id") for x in items if isinstance(x, dict)}
        # all 4 visible present
        missing = VISIBLE - ids
        assert not missing, f"missing visible lenses: {missing}"
        # none of the hidden lenses leak into the API
        leaked = HIDDEN & ids
        assert not leaked, f"hidden lenses leaked: {leaked}"

    def test_visible_lens_situations_present(self):
        r = requests.get(f"{BASE_URL}/api/parents-room/lenses", timeout=15)
        items = r.json()
        items = items if isinstance(items, list) else items.get("lenses", items)
        by_id = {x["id"]: x for x in items}
        # shitsuke must carry 8 situations
        sh = by_id.get("shitsuke")
        assert sh, "shitsuke missing"
        sits = sh.get("situations", {})
        assert len(sits) == 8, f"shitsuke situations={len(sits)}"


# ------------- Registry: hidden lenses still resolvable internally -------------
class TestHiddenLensesInternal:
    def test_hidden_lenses_exist_in_registry(self):
        sys.path.insert(0, "/app/backend")
        import parents_lenses
        for hid in HIDDEN:
            lens = parents_lenses.get_lens(hid)
            assert lens is not None, f"{hid} not resolvable"
            assert lens.get("visible") is False, f"{hid} not marked hidden"
            assert len(lens.get("situations", {})) == 8, (
                f"{hid} missing 8 situations: {len(lens.get('situations', {}))}"
            )

    def test_list_lenses_filters_hidden(self):
        sys.path.insert(0, "/app/backend")
        import parents_lenses
        ids = {l["id"] for l in parents_lenses.list_lenses()}
        assert HIDDEN.isdisjoint(ids), f"hidden leaked from list_lenses: {HIDDEN & ids}"
        assert VISIBLE.issubset(ids), f"visible missing from list_lenses: {VISIBLE - ids}"


# ------------- Chat endpoint smoke (hidden lens id accepted internally) -------
class TestHiddenLensChatSmoke:
    def test_chat_accepts_hidden_lens_id(self):
        """POST /api/parents-room/chat with lens_id='waldorf' should not 404
        on the lens itself (it may require auth — accept any non-422-lens-error
        status). Mainly checks the endpoint does not reject the hidden id
        with 'unknown lens'."""
        payload = {
            "message": "bedtime is hard tonight",
            "lens_id": "waldorf",
            "session_id": "test_iter86_smoke",
        }
        try:
            r = requests.post(
                f"{BASE_URL}/api/parents-room/chat",
                json=payload,
                timeout=20,
                headers={"Authorization": "Bearer test_token_6489e6cf1440"},
            )
        except requests.RequestException as e:
            import pytest
            pytest.skip(f"chat endpoint unreachable: {e}")
            return
        # endpoint must not reject by complaining about unknown lens
        body = r.text.lower()
        assert "unknown lens" not in body and "invalid lens" not in body, (
            f"hidden lens rejected: status={r.status_code} body={body[:300]}"
        )
