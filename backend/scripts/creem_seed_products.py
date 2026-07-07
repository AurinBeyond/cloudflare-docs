"""
§CREEM-SEED 2026-02 — one-shot script to create Aurin products in Creem via API.

Runs in two modes:
    --dry-run   Prints exact API payloads, does NOT call Creem.
    --one SKU   Creates only ONE product (safe test with LIVE key).
    --all       Creates ALL 15 products (8 catalogue + 7 paid books).

Usage:
    cd /app/backend && python -m scripts.creem_seed_products --dry-run
    cd /app/backend && python -m scripts.creem_seed_products --one voice.return.30
    cd /app/backend && python -m scripts.creem_seed_products --all

After each real creation:
    - Creem product_id is printed
    - Written to backend/commerce/creem_product_ids.json
    - Ready for later checkout.py wiring

This script never modifies frontend, never creates a checkout URL,
never touches Gumroad. It is safe to run without exposing sales.
"""
from __future__ import annotations

import argparse
import asyncio
import json
import os
import sys
from pathlib import Path
from typing import Any, Dict, List, Optional

import requests
from dotenv import load_dotenv

# Bootstrap paths so we can import commerce.*
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
load_dotenv(Path(__file__).resolve().parent.parent / ".env")

from commerce import product_catalogue  # noqa: E402


CREEM_API_URL = "https://api.creem.io/v1/products"
CREEM_KEY = os.environ.get("CREEM_API_KEY", "")
ID_MAP_PATH = (
    Path(__file__).resolve().parent.parent / "commerce" / "creem_product_ids.json"
)

# ─── Payload builders ─────────────────────────────────────────────

def _catalogue_payload(sku: str) -> Dict[str, Any]:
    """Build Creem API payload from a canonical catalogue SKU."""
    spec = product_catalogue.get(sku)
    if spec is None:
        raise KeyError(sku)

    # Anna's launch prices override the regular prices during soft launch.
    active_price = spec.launch_price_eur if spec.launch_price_eur is not None else spec.price_eur
    price_cents = int(round(active_price * 100))

    is_recurring = spec.product_type == product_catalogue.RECURRING
    payload: Dict[str, Any] = {
        "name": spec.display_name,
        "description": spec.notes or f"Aurin — {spec.display_name}",
        "price": price_cents,
        "currency": "EUR",
        "billing_type": "recurring" if is_recurring else "onetime",
        "tax_mode": "inclusive",       # displayed price IS the total
        "tax_category": "saas",        # access + voice = software service
    }
    if is_recurring:
        payload["billing_period"] = "every-month"
    return payload


def _book_payload(book: Dict[str, Any]) -> Dict[str, Any]:
    """Build Creem API payload for a Bookstore book."""
    price_eur = float(book.get("price") or 0)
    if price_eur <= 0:
        raise ValueError(f"book {book.get('slug')} has zero/negative price — skip")
    price_cents = int(round(price_eur * 100))
    title = book.get("title") or book.get("slug") or "Untitled"
    subtitle = book.get("subtitle") or ""
    description = subtitle or (book.get("description") or "")[:280] or title

    # §CREEM-SEED 2026-02 — Creem requires absolute image URLs.
    # Relative /api/books/cover/... paths are rewritten to production
    # domain. Anna can also upload the cover directly in Creem dashboard
    # after creation, in which case this initial URL is a fallback.
    cover = book.get("cover_image_url") or ""
    if cover and cover.startswith("/"):
        prod_base = os.environ.get("PROD_PUBLIC_URL", "https://prulesoul.site").rstrip("/")
        cover = f"{prod_base}{cover}"

    payload = {
        "name": title,
        "description": description,
        "price": price_cents,
        "currency": "EUR",
        "billing_type": "onetime",
        "tax_mode": "inclusive",
        "tax_category": "ebooks",      # reduced VAT rate in many EU countries
    }
    if cover:
        payload["image_url"] = cover
    return payload


# ─── ID map (persisted) ───────────────────────────────────────────

def _load_id_map() -> Dict[str, Any]:
    if not ID_MAP_PATH.exists():
        return {"catalogue": {}, "books": {}}
    try:
        return json.loads(ID_MAP_PATH.read_text())
    except Exception:
        return {"catalogue": {}, "books": {}}


def _save_id_map(m: Dict[str, Any]) -> None:
    ID_MAP_PATH.parent.mkdir(parents=True, exist_ok=True)
    ID_MAP_PATH.write_text(json.dumps(m, indent=2, ensure_ascii=False))


# ─── API caller ───────────────────────────────────────────────────

def _post_product(payload: Dict[str, Any]) -> Dict[str, Any]:
    if not CREEM_KEY:
        raise SystemExit("CREEM_API_KEY missing from environment")
    resp = requests.post(
        CREEM_API_URL,
        headers={
            "x-api-key": CREEM_KEY,
            "Content-Type": "application/json",
        },
        json=payload,
        timeout=15,
    )
    if resp.status_code >= 300:
        raise RuntimeError(f"HTTP {resp.status_code}: {resp.text}")
    return resp.json()


# ─── Book fetcher ─────────────────────────────────────────────────

async def _fetch_books() -> List[Dict[str, Any]]:
    from motor.motor_asyncio import AsyncIOMotorClient
    client = AsyncIOMotorClient(os.environ["MONGO_URL"])
    db = client[os.environ["DB_NAME"]]
    books = await db.books.find(
        {"price": {"$gt": 0}}, {"_id": 0}
    ).to_list(50)
    return books


# ─── Main runners ─────────────────────────────────────────────────

def _print_payload(label: str, payload: Dict[str, Any]) -> None:
    print(f"\n─── {label} ───")
    for k, v in payload.items():
        if isinstance(v, str) and len(v) > 60:
            v = v[:60] + "…"
        print(f"  {k:<15} = {v}")


def dry_run(books: List[Dict[str, Any]]) -> None:
    print("\n╔═══════════════════════════════════════════════════╗")
    print("║  DRY RUN — no API calls made                       ║")
    print("╚═══════════════════════════════════════════════════╝")

    print("\n▶ CATALOGUE (8 products)")
    for sku in product_catalogue.all_skus():
        _print_payload(f"[{sku}]", _catalogue_payload(sku))

    print(f"\n\n▶ BOOKS ({len(books)} paid, USD→EUR 1:1 parity)")
    for b in books:
        try:
            _print_payload(f"[book/{b.get('slug')}]", _book_payload(b))
        except ValueError as e:
            print(f"  SKIP {b.get('slug')} — {e}")

    print("\n\nDRY RUN COMPLETE. No products were created.")
    print("Run with --one <sku>  to create ONE product as a test.")
    print("Run with --all         to create ALL products.")


def create_one(sku: str) -> None:
    print(f"\n▶ Creating single product: {sku}")
    if not product_catalogue.is_known(sku):
        raise SystemExit(f"Unknown SKU: {sku}")
    payload = _catalogue_payload(sku)
    _print_payload(f"payload for {sku}", payload)
    print("\n  Calling Creem API …")
    result = _post_product(payload)
    print(f"\n  ✅ Created:")
    print(f"       id           = {result.get('id')}")
    print(f"       product_url  = {result.get('product_url')}")
    print(f"       mode         = {result.get('mode')}")
    print(f"       status       = {result.get('status')}")

    m = _load_id_map()
    m["catalogue"][sku] = {
        "creem_id": result.get("id"),
        "product_url": result.get("product_url"),
        "mode": result.get("mode"),
    }
    _save_id_map(m)
    print(f"\n  Saved to {ID_MAP_PATH.name}")


def create_all(books: List[Dict[str, Any]]) -> None:
    m = _load_id_map()

    print("\n▶ CATALOGUE")
    for sku in product_catalogue.all_skus():
        if sku in m["catalogue"]:
            print(f"  ~ {sku} already in id_map (skip)")
            continue
        payload = _catalogue_payload(sku)
        try:
            result = _post_product(payload)
            m["catalogue"][sku] = {
                "creem_id": result.get("id"),
                "product_url": result.get("product_url"),
                "mode": result.get("mode"),
            }
            _save_id_map(m)  # save after each — resumable if crash
            print(f"  ✅ {sku:<24} → {result.get('id')}")
        except Exception as e:
            print(f"  ✗ {sku:<24} FAILED: {e}")

    print("\n▶ BOOKS")
    for b in books:
        slug = b.get("slug")
        if slug in m["books"]:
            print(f"  ~ book/{slug} already in id_map (skip)")
            continue
        try:
            payload = _book_payload(b)
        except ValueError as e:
            print(f"  SKIP book/{slug} — {e}")
            continue
        try:
            result = _post_product(payload)
            m["books"][slug] = {
                "creem_id": result.get("id"),
                "product_url": result.get("product_url"),
                "mode": result.get("mode"),
            }
            _save_id_map(m)
            print(f"  ✅ book/{slug:<45} → {result.get('id')}")
        except Exception as e:
            print(f"  ✗ book/{slug:<45} FAILED: {e}")


def main() -> None:
    p = argparse.ArgumentParser()
    p.add_argument("--dry-run", action="store_true")
    p.add_argument("--one", metavar="SKU", help="Create only one catalogue SKU")
    p.add_argument("--all", action="store_true", help="Create all products")
    args = p.parse_args()

    if not any([args.dry_run, args.one, args.all]):
        p.error("Pick one of: --dry-run | --one SKU | --all")

    books = asyncio.run(_fetch_books())

    if args.dry_run:
        dry_run(books)
    elif args.one:
        create_one(args.one)
    elif args.all:
        create_all(books)


if __name__ == "__main__":
    main()
