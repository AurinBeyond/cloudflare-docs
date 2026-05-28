"""
update_polar_descriptions.py — PATCH descriptions on already-created
products to remove PSP-flagged classifiers ("AI companion for kids",
"AI friend", "children chat with AI", "emotional AI for children",
etc.) and rephrase toward parent-guided activities + storytelling
+ calm audio + creative family experiences.

Run after `create_polar_products.py` if the catalogue is already
live and Polar underwriting flagged the description language.

  cd /app/backend && python -m scripts.update_polar_descriptions
"""
from __future__ import annotations

import json
import sys
import time
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from dotenv import load_dotenv  # noqa: E402

load_dotenv(ROOT / ".env")

from services.polar_client import PolarClient  # noqa: E402
from scripts.create_polar_products import CATALOGUE, _build_description  # noqa: E402


def main() -> int:
    sku_map_path = ROOT / "polar_sku_map.json"
    if not sku_map_path.exists():
        print(f"ERROR: {sku_map_path} not found. Run create_polar_products first.")
        return 1
    sku_map = json.loads(sku_map_path.read_text())["skus"]

    client = PolarClient()
    updated, failed = 0, 0

    for row in CATALOGUE:
        sku = row["sku"]
        product_id = sku_map.get(sku)
        if not product_id:
            print(f"  ⏭  {sku:40s} not in sku_map; skipping")
            continue
        new_description = _build_description(row)
        try:
            resp = client._client.patch(
                f"/products/{product_id}",
                json={"description": new_description},
            )
            if resp.status_code >= 400:
                raise RuntimeError(f"{resp.status_code} {resp.text}")
            print(f"  ✓  {sku:40s} description updated")
            updated += 1
        except Exception as exc:
            print(f"  ✗  {sku:40s} FAILED: {exc}", file=sys.stderr)
            failed += 1
        time.sleep(0.7)

    print(f"\nSummary: updated={updated} · failed={failed}")
    client.close()
    return 0 if failed == 0 else 2


if __name__ == "__main__":
    sys.exit(main())
