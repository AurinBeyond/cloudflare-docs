#!/usr/bin/env python3
"""
Gumroad one-time setup — run this once with your access token to:

  1. Fetch your seller_id from /user
  2. List all your products and their short permalinks
  3. Update /app/backend/.env with GUMROAD_SELLER_ID and
     GUMROAD_PRODUCT_PERMALINKS (anti-spoof + whitelist)
  4. Print the exact Gumroad Ping URL to paste into Gumroad settings

Usage:
    python3 /app/scripts/gumroad_setup.py <ACCESS_TOKEN>

Get your access token at:
    https://gumroad.com → Settings → Advanced → Applications
    → Create application (or use existing) → Generate access token

The token is NEVER stored in .env. Only the resulting seller_id and
permalinks are written. The token stays on your machine / clipboard.
"""
import asyncio
import os
import re
import sys
from pathlib import Path

# Allow importing the backend module
sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "backend"))

ENV_PATH = Path("/app/backend/.env")


def _print(msg: str, indent: int = 0):
    print(("  " * indent) + msg, flush=True)


async def run(token: str) -> int:
    os.environ["GUMROAD_ACCESS_TOKEN"] = token
    # Late import — needs token in env first
    import gumroad_service as gs

    _print("──────────────────────────────────────────────────────────")
    _print("Polarstar · Gumroad setup")
    _print("──────────────────────────────────────────────────────────")

    # 1. Seller
    _print("")
    _print("1/3  Fetching seller info…")
    try:
        user = await gs.fetch_user()
    except Exception as e:  # noqa: BLE001
        _print(f"FAIL — could not reach Gumroad API: {e}", 1)
        _print(f"        Check your access token and try again.", 1)
        return 2

    seller_id = (user.get("id") or "").strip()
    if not seller_id:
        _print(f"FAIL — Gumroad returned no user.id. Full response:", 1)
        _print(f"        {user}", 1)
        return 2

    seller_email = user.get("email", "")
    seller_name = user.get("name") or user.get("display_name") or ""
    _print(f"OK   seller_id    = {seller_id}", 1)
    _print(f"     account      = {seller_name or '(no display name)'} <{seller_email}>", 1)

    # 2. Products
    _print("")
    _print("2/3  Listing products…")
    try:
        products = await gs.fetch_products()
    except Exception as e:  # noqa: BLE001
        _print(f"FAIL — could not list products: {e}", 1)
        return 3

    if not products:
        _print("WARN — no products found on this Gumroad account.", 1)
        _print("       Create your 'Polarstar Bedtime Stories' product first,", 1)
        _print("       then re-run this script.", 1)
        permalinks: list[str] = []
    else:
        permalinks = []
        for p in products:
            slug = (p.get("permalink") or p.get("custom_permalink") or "").strip().lower()
            name = p.get("name", "(no name)")
            price = p.get("formatted_price") or p.get("price") or ""
            short_url = p.get("short_url") or ""
            if slug:
                permalinks.append(slug)
                _print(f"OK   {slug:<24} {name}  {price}", 1)
                _print(f"     short_url: {short_url}", 1)
            else:
                _print(f"SKIP {name} — no permalink set", 1)

    # 3. Update .env
    _print("")
    _print("3/3  Updating /app/backend/.env…")

    if not ENV_PATH.exists():
        _print(f"FAIL — {ENV_PATH} not found", 1)
        return 4

    text = ENV_PATH.read_text()
    permalinks_csv = ",".join(permalinks)

    def replace_or_add(content: str, key: str, value: str) -> str:
        pattern = re.compile(rf"^{re.escape(key)}=.*$", re.MULTILINE)
        if pattern.search(content):
            return pattern.sub(f"{key}={value}", content)
        return content.rstrip() + f"\n{key}={value}\n"

    text = replace_or_add(text, "GUMROAD_SELLER_ID", seller_id)
    text = replace_or_add(text, "GUMROAD_PRODUCT_PERMALINKS", permalinks_csv)
    ENV_PATH.write_text(text)

    _print(f"OK   wrote GUMROAD_SELLER_ID = {seller_id}", 1)
    _print(f"OK   wrote GUMROAD_PRODUCT_PERMALINKS = {permalinks_csv or '(empty)'}", 1)
    _print("")
    _print("──────────────────────────────────────────────────────────")
    _print("Next steps")
    _print("──────────────────────────────────────────────────────────")
    _print("")
    _print("A. Restart backend so the new env values load:")
    _print("   sudo supervisorctl restart backend")
    _print("")
    _print("B. Paste this URL into Gumroad → Settings → Advanced → Ping:")
    _print("   https://prulesoul.site/api/webhooks/gumroad")
    _print("")
    _print("   (NB: prulesoul.site is the PRODUCTION URL. Make sure the")
    _print("    latest backend code has been deployed there before you save")
    _print("    the Ping URL in Gumroad. Run a redeploy from Emergent if")
    _print("    you haven't yet.)")
    _print("")
    _print("C. Verify the setup with:")
    _print("   curl https://prulesoul.site/api/webhooks/gumroad/health")
    _print("   → seller_id_set should now be true")
    _print("   → permalinks_set should now be true")
    _print("")
    return 0


def main():
    if len(sys.argv) < 2 or not sys.argv[1].strip():
        print(__doc__)
        sys.exit(1)
    token = sys.argv[1].strip()
    rc = asyncio.run(run(token))
    sys.exit(rc)


if __name__ == "__main__":
    main()
