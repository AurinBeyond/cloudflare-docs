"""
§AURIN-DEEP-AUDIT 2026-02-11 — full system integrity checker.

Anna's directive: a no-assumption, checksum-grade audit of every
catalogue, code path, webhook hook, and email infrastructure before
launch. Red / Yellow / Green per finding. Produces a Markdown report
to /app/memory/AUDIT_REPORT_<date>.md.

USAGE:
    cd /app/backend && python tests/aurin_deep_audit.py

OUTPUT:
    /app/memory/AUDIT_REPORT_2026-02-11.md
    Plus stdout summary with red/yellow/green counts.

NON-DESTRUCTIVE: read-only. Suggests patches but never mutates.
"""
from __future__ import annotations

import asyncio
import importlib.util
import json
import os
import re
import sys
from dataclasses import dataclass, field
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

import httpx

BACKEND = Path(__file__).resolve().parents[1]
REPO = BACKEND.parent
sys.path.insert(0, str(BACKEND))

# ─────────────────────────────────────────────────────────────────────────────
# Finding type
# ─────────────────────────────────────────────────────────────────────────────
@dataclass
class Finding:
    severity: str           # "red" | "yellow" | "green"
    area: str
    message: str
    patch: str = ""         # suggested non-destructive fix (text only)
    evidence: str = ""

FINDINGS: list[Finding] = []

def red(area: str, msg: str, patch: str = "", evidence: str = ""):
    FINDINGS.append(Finding("red", area, msg, patch, evidence))

def yellow(area: str, msg: str, patch: str = "", evidence: str = ""):
    FINDINGS.append(Finding("yellow", area, msg, patch, evidence))

def green(area: str, msg: str, evidence: str = ""):
    FINDINGS.append(Finding("green", area, msg, evidence=evidence))


# ─────────────────────────────────────────────────────────────────────────────
# Phase 1A — catalogue cross-consistency
# ─────────────────────────────────────────────────────────────────────────────
def load_bulk_catalogue() -> list[dict]:
    spec = importlib.util.spec_from_file_location(
        "fs_bulk", BACKEND / "tools" / "fastspring_bulk_import.py"
    )
    mod = importlib.util.module_from_spec(spec)
    # The module imports dotenv; suppress its side-effects.
    os.environ.setdefault("FASTSPRING_API_USERNAME", "audit")
    os.environ.setdefault("FASTSPRING_API_PASSWORD", "audit")
    spec.loader.exec_module(mod)
    return mod.CATALOGUE


def parse_final_md() -> dict[str, dict]:
    """Parse SKU + price rows out of FASTSPRING_FINAL_2026-02-11.md."""
    p = REPO / "memory" / "FASTSPRING_FINAL_2026-02-11.md"
    if not p.exists():
        red("catalogue", f"Missing source-of-truth file: {p}")
        return {}
    text = p.read_text()
    rows: dict[str, dict] = {}
    # Match SKU lines like:  | SKU | `body-temple-28` |
    # Match Price lines like: | Price | **$39.00 USD** |
    sku_re = re.compile(r"\|\s*SKU\s*\|\s*`([a-z0-9-]+)`\s*\|", re.I)
    name_re = re.compile(r"\|\s*Name\s*\|\s*`([^`]+)`\s*\|", re.I)
    price_re = re.compile(r"\|\s*Price\s*\|\s*\*?\*?([€$£])([0-9,.]+)", re.I)
    # Walk the file by H3 sections to keep SKU + Price together.
    sections = re.split(r"\n###\s+", text)
    for sec in sections:
        sku_m = sku_re.search(sec)
        if not sku_m:
            continue
        sku = sku_m.group(1)
        price_m = price_re.search(sec)
        name_m = name_re.search(sec)
        price_val = None
        currency = None
        if price_m:
            currency = price_m.group(1)
            try:
                price_val = float(price_m.group(2).replace(",", "."))
            except Exception:
                pass
        rows[sku] = {
            "name": name_m.group(1) if name_m else None,
            "price_value": price_val,
            "price_currency": currency,
            "snippet": sec[:200],
        }
    # ALSO parse the SKU table rows (Section 2 books, Section 3 courses,
    # Section 4 voice top-ups, Section 10 clarity passes). They look like:
    #   | Beyond the Matrix I | `book-beyond-matrix-1` | **$13** | E-book |
    #   | `voice-topup-30`    | 30 | **€20** | 47% ✅ |
    # We accept any row with a backticked SKU + a currency-prefixed number.
    for line in text.splitlines():
        # find first backticked SKU in the line
        sku_m_inline = re.search(r"`([a-z0-9-]+)`", line)
        if not sku_m_inline:
            continue
        sku = sku_m_inline.group(1)
        if sku in rows:
            continue
        # find first currency price in the same line
        price_inline = re.search(r"([€$£])\s*\*?\*?([0-9][0-9,.]*)", line)
        if not price_inline:
            continue
        currency = price_inline.group(1)
        try:
            price_val = float(price_inline.group(2).replace(",", "."))
        except Exception:
            continue
        rows[sku] = {
            "name": None,
            "price_value": price_val,
            "price_currency": currency,
            "snippet": line.strip()[:200],
        }
    return rows


def audit_catalogue_alignment():
    """Phase 1A — every SKU in the bulk script must appear in the FINAL
    markdown with matching price; vice versa for atomics."""
    bulk = load_bulk_catalogue()
    bulk_index = {p["product"]: p for p in bulk}
    md = parse_final_md()

    # Each bulk SKU must be in MD
    for sku, p in bulk_index.items():
        if sku not in md:
            red(
                "catalogue:sku-not-in-md",
                f"Bulk script SKU `{sku}` not found in FASTSPRING_FINAL_2026-02-11.md",
                patch=f"Add a section to FINAL md for `{sku}`. Bulk-script display name: {p.get('display',{}).get('en')}",
            )
            continue
        md_row = md[sku]
        bulk_price_usd = p["pricing"]["price"].get("USD")
        bulk_price_eur = p["pricing"]["price"].get("EUR")
        md_price = md_row["price_value"]
        md_cur = md_row["price_currency"]
        if md_price is None:
            yellow(
                "catalogue:md-price-missing",
                f"`{sku}` listed in FINAL md but price could not be parsed.",
                patch="Add explicit Price row in the FINAL md section for this SKU.",
            )
            continue
        # Pick the side to compare
        expected = bulk_price_usd if md_cur == "$" else bulk_price_eur
        if expected is None:
            yellow(
                "catalogue:currency-mismatch",
                f"`{sku}` — FINAL md uses {md_cur} but bulk-script only has {list(p['pricing']['price'].keys())}",
            )
            continue
        if abs(expected - md_price) > 0.005:
            red(
                "catalogue:price-mismatch",
                f"`{sku}` — bulk={expected} {md_cur}, FINAL md={md_price} {md_cur}",
                patch=f"Decide on canonical price. Update the side that's wrong.",
            )
    # Each MD SKU not in bulk must be in the manual-bundles list
    BUNDLES = {
        "bundle-lonely-heart", "bundle-business-clarity", "bundle-igapaevane",
        "bundle-perekond-hybrid", "bundle-family-magic", "bundle-perekond-premium",
        "bundle-perekond-full-el", "bundle-vip-unlimited",
        "bundle-sanctuary-season", "bundle-couples-sanctuary",
        "lux-annual", "lux-lifetime",
        # Existing live subscription products that live in dashboard already.
        "sub-clarity-season", "clarity-season-30d",
    }
    for sku in md.keys():
        if sku in bulk_index:
            continue
        if sku in BUNDLES:
            green("catalogue:bundle-deferred",
                  f"`{sku}` correctly deferred to FastSpring dashboard (bundle).")
            continue
        # SKU is in MD but not in bulk and not flagged as bundle — drift.
        yellow(
            "catalogue:md-sku-orphan",
            f"`{sku}` is in FINAL md but neither in bulk script nor in manual-bundles list.",
            patch=f"Add `{sku}` to bulk-script CATALOGUE or to the BUNDLES_FOR_MANUAL_ENTRY list."
        )
    # Count summary
    green(
        "catalogue:counts",
        f"Bulk script: {len(bulk_index)} atomics. FINAL md: {len(md)} SKUs total."
    )


# ─────────────────────────────────────────────────────────────────────────────
# Phase 1B — backend wiring
# ─────────────────────────────────────────────────────────────────────────────
def audit_backend_wiring():
    server_py = (BACKEND / "server.py").read_text()
    # Webhook endpoints — api_router has prefix "/api" so look for the
    # route definition (without /api) inside @api_router.get/post.
    # Path-params are matched permissively.
    for full_path, route_path in (
        ("/api/webhooks/resend", "/webhooks/resend"),
        ("/api/admin/email-health", "/admin/email-health"),
        ("/api/admin/email-suppression/remove", "/admin/email-suppression/remove"),
        ("/api/kids-journey/progress", "/kids-journey/progress"),
        ("/api/kids-journey/day/{day_index}", "/kids-journey/day/{day_index}"),
    ):
        if f'"{route_path}"' in server_py or f"'{route_path}'" in server_py:
            green("backend:endpoint", f"{full_path} is mounted in server.py")
        else:
            red("backend:endpoint-missing", f"{full_path} is NOT mounted in server.py",
                patch=f"Restore the route definition for {full_path}.")

    # Rate-limit bypass for /api/webhooks/resend — search the explicit
    # bypass tuple (defined near top of server.py before line ~150).
    bypass_block = server_py[:8000]
    if '"/api/webhooks/resend"' in bypass_block:
        green("backend:rate-limit-bypass",
              "/api/webhooks/resend is in the rate-limit bypass tuple.")
    else:
        yellow("backend:rate-limit-bypass",
               "/api/webhooks/resend may not be in the rate-limit bypass list.",
               patch="Add the path to the bypass tuple near line ~115.")

    # email_suppression module integration
    es_py = BACKEND / "email_suppression.py"
    if es_py.exists():
        green("backend:email-suppression", "email_suppression.py module present.")
    else:
        red("backend:email-suppression",
            "email_suppression.py module missing — bounces will not be tracked.",
            patch="Restore /app/backend/email_suppression.py.")

    email_service_py = (BACKEND / "email_service.py").read_text()
    if "is_suppressed" in email_service_py and "bypass_suppression" in email_service_py:
        green("backend:suppression-gate",
              "send_email() honours the suppression list before sending.")
    else:
        red("backend:suppression-gate",
            "send_email() does NOT consult the suppression list — bounced/spam addresses will be re-sent.",
            patch="Re-apply the suppression gate in send_email() from iteration 82d.")


# ─────────────────────────────────────────────────────────────────────────────
# Phase 1C — env variables
# ─────────────────────────────────────────────────────────────────────────────
def audit_env():
    env_path = BACKEND / ".env"
    env_text = env_path.read_text() if env_path.exists() else ""
    required_keys = {
        "MONGO_URL": "red",
        "DB_NAME": "red",
        "RESEND_API_KEY": "red",
        "EMERGENT_LLM_KEY": "red",
        "ELEVENLABS_API_KEY": "red",
        "FASTSPRING_API_USERNAME": "yellow",
        "FASTSPRING_API_PASSWORD": "yellow",
        "FASTSPRING_STOREFRONT": "yellow",
        "RESEND_WEBHOOK_SECRET": "yellow",
        "RESEND_FROM_INFO": "yellow",
    }
    for k, sev in required_keys.items():
        line = next((ln for ln in env_text.splitlines() if ln.startswith(f"{k}=")), None)
        if not line:
            (red if sev == "red" else yellow)(
                "env:missing",
                f"`{k}` is missing from /app/backend/.env",
                patch=f"Add `{k}=…` to .env (sev={sev})."
            )
            continue
        val = line.split("=", 1)[1].strip()
        if not val:
            (red if sev == "red" else yellow)(
                "env:empty",
                f"`{k}` exists but is empty.",
                patch=f"Fill `{k}` with the value from the relevant provider dashboard."
            )
        else:
            green("env:present", f"`{k}` is set (masked).")


# ─────────────────────────────────────────────────────────────────────────────
# Phase 1D — every product description includes the disclaimer
# ─────────────────────────────────────────────────────────────────────────────
def audit_disclaimer():
    bulk = load_bulk_catalogue()
    missing: list[str] = []
    for p in bulk:
        desc = (p.get("description", {}).get("summary", {}).get("en") or "").lower()
        if "not therapy" not in desc and "not medical" not in desc:
            missing.append(p["product"])
    if missing:
        yellow(
            "disclaimer:missing",
            f"{len(missing)} bulk-script products lack the 'Not therapy. Not medical advice.' line in description.",
            patch="Append the disclaimer phrase to each affected product description. SKUs: "
                  + ", ".join(missing[:6]) + (f" (+{len(missing)-6} more)" if len(missing) > 6 else ""),
            evidence=json.dumps(missing[:10]),
        )
    else:
        green("disclaimer:all", "All bulk-script products carry the brand disclaimer.")


# ─────────────────────────────────────────────────────────────────────────────
# Phase 1E — margin sanity (recompute against current FastSpring rate)
# ─────────────────────────────────────────────────────────────────────────────
FS_PCT = 0.059
FS_FIXED_EUR = 0.85
# Voice ElevenLabs cost: ~€0.30/min full-stack; OpenAI TTS cost ~€0.06/min
VOICE_COST_PER_MIN = 0.30  # conservative high
EUR_PER_USD = 0.92

def margin_of(currency: str, price: float, content_cost: float) -> float:
    price_eur = price * EUR_PER_USD if currency == "USD" else price
    cost_eur = content_cost
    net = price_eur * (1 - FS_PCT) - FS_FIXED_EUR
    return (net - cost_eur) / net if net > 0 else -1.0


VOICE_MIN_BY_SKU = {
    "voice-topup-30": 30, "voice-topup-60": 60, "voice-topup-180": 180,
    "voice-topup-premium-30": 30, "voice-topup-premium-60": 60, "voice-topup-premium-180": 180,
    "first-step": 60,
    "clarity-30min": 30, "clarity-60min": 60,
    "bundle-family": 60,
    "sub-text-voice-15": 15, "sub-text-premium": 30,
    "sub-steady-monthly": 60, "sub-own-room-monthly": 240,
}

def audit_margins():
    bulk = load_bulk_catalogue()
    for p in bulk:
        sku = p["product"]
        price_dict = p["pricing"]["price"]
        currency = "USD" if "USD" in price_dict else "EUR"
        price = float(price_dict[currency])
        mins = VOICE_MIN_BY_SKU.get(sku, 0)
        content_cost = mins * VOICE_COST_PER_MIN
        m = margin_of(currency, price, content_cost)
        if m < 0.30:
            red("margin:critical",
                f"`{sku}` — margin {m*100:.1f}% after FS fees & voice cost is BELOW 30%.",
                patch=f"Raise price or reduce voice minutes for `{sku}`.")
        elif m < 0.45:
            yellow("margin:thin",
                   f"`{sku}` — margin {m*100:.1f}% (acceptable but thin).",
                   patch=f"Consider raising `{sku}` by 5-10% for safety.")
        else:
            green("margin:healthy", f"`{sku}` — margin {m*100:.1f}%.")


# ─────────────────────────────────────────────────────────────────────────────
# Phase 2 — kids/parents navigation (delegate to existing audit)
# ─────────────────────────────────────────────────────────────────────────────
async def audit_routes():
    BASE = "https://aurin-hub.preview.emergentagent.com"
    routes = [
        "/", "/kids-universe", "/body-temple", "/parents-room", "/for-leaders",
        "/aurins-room/stories", "/aurins-room/explorers", "/aurins-room/little-dreamers",
        "/aurins-room/dreamweavers", "/library/kids/read", "/library/kids/draw",
        "/admin/email-health",
    ]
    async with httpx.AsyncClient(timeout=15) as client:
        for r in routes:
            try:
                resp = await client.get(BASE + r, follow_redirects=True)
                if 200 <= resp.status_code < 400:
                    green("route", f"{r} reachable (HTTP {resp.status_code})")
                else:
                    red("route", f"{r} returned HTTP {resp.status_code}")
            except Exception as e:
                red("route", f"{r} failed: {e}")


# ─────────────────────────────────────────────────────────────────────────────
# Phase 3 — FastSpring live (will be skipped due to 401)
# ─────────────────────────────────────────────────────────────────────────────
async def audit_fastspring_live():
    u = os.environ.get("FASTSPRING_API_USERNAME")
    p = os.environ.get("FASTSPRING_API_PASSWORD")
    if not (u and p) or u == "audit":
        yellow("fastspring:no-creds",
               "FastSpring API credentials not configured — live audit skipped.",
               patch="Once merchant agreement activates, this audit will run automatically.")
        return
    async with httpx.AsyncClient(timeout=15, auth=(u, p)) as client:
        try:
            resp = await client.get("https://api.fastspring.com/products",
                                    headers={"Accept": "application/json"})
        except Exception as e:
            red("fastspring:network", f"Could not reach FastSpring API: {e}")
            return
        if resp.status_code == 401:
            yellow("fastspring:401",
                   "FastSpring API returns 401 — merchant agreement not yet active.",
                   patch="Anna: complete merchant agreement signing in FastSpring App. Re-run this audit afterwards.")
            return
        if resp.status_code != 200:
            red("fastspring:status",
                f"FastSpring API returned HTTP {resp.status_code}: {resp.text[:200]}")
            return
        # If we got here, API is live — actually cross-reference.
        try:
            live = resp.json()
        except Exception:
            red("fastspring:json", "FastSpring response not JSON.")
            return
        live_skus = {p.get("product") for p in (live.get("products") or [])}
        bulk = load_bulk_catalogue()
        for p in bulk:
            sku = p["product"]
            if sku in live_skus:
                green("fastspring:live", f"`{sku}` is live in FastSpring.")
            else:
                yellow("fastspring:missing",
                       f"`{sku}` not yet in FastSpring catalogue.",
                       patch="Run /app/backend/tools/fastspring_bulk_import.py after activation.")


# ─────────────────────────────────────────────────────────────────────────────
# Report
# ─────────────────────────────────────────────────────────────────────────────
def render_report() -> str:
    now = datetime.now(timezone.utc).isoformat()
    reds = [f for f in FINDINGS if f.severity == "red"]
    yellows = [f for f in FINDINGS if f.severity == "yellow"]
    greens = [f for f in FINDINGS if f.severity == "green"]
    lines = [
        f"# 🛡️ Aurin Deep Audit — {now}",
        "",
        "Non-destructive integrity check. Read-only. No changes applied.",
        "",
        "## 📊 Summary",
        "",
        f"- 🔴 **Critical (red): {len(reds)}**",
        f"- 🟡 **Warning (yellow): {len(yellows)}**",
        f"- 🟢 **Secure (green): {len(greens)}**",
        "",
        "---",
        "",
        "## 🔴 RED — Critical findings (fix before launch)",
        "",
    ]
    if not reds:
        lines.append("_None._")
    for f in reds:
        lines.append(f"### [{f.area}] {f.message}")
        if f.patch:
            lines.append(f"- **Patch:** {f.patch}")
        if f.evidence:
            lines.append(f"- **Evidence:** `{f.evidence[:200]}`")
        lines.append("")

    lines += ["", "---", "", "## 🟡 YELLOW — Warnings (fix when safe)", ""]
    if not yellows:
        lines.append("_None._")
    for f in yellows:
        lines.append(f"### [{f.area}] {f.message}")
        if f.patch:
            lines.append(f"- **Patch:** {f.patch}")
        if f.evidence:
            lines.append(f"- **Evidence:** `{f.evidence[:200]}`")
        lines.append("")

    lines += ["", "---", "", "## 🟢 GREEN — Verified clean", ""]
    for f in greens:
        lines.append(f"- [{f.area}] {f.message}")
    lines.append("")

    return "\n".join(lines)


async def main():
    print("🛡️ Aurin Deep Audit starting…\n")
    audit_catalogue_alignment()
    audit_backend_wiring()
    audit_env()
    audit_disclaimer()
    audit_margins()
    await audit_routes()
    await audit_fastspring_live()

    report = render_report()
    out_path = REPO / "memory" / f"AUDIT_REPORT_{datetime.now(timezone.utc).strftime('%Y-%m-%d')}.md"
    out_path.write_text(report)

    reds = sum(1 for f in FINDINGS if f.severity == "red")
    yellows = sum(1 for f in FINDINGS if f.severity == "yellow")
    greens = sum(1 for f in FINDINGS if f.severity == "green")
    print(f"\n🔴 RED: {reds}   🟡 YELLOW: {yellows}   🟢 GREEN: {greens}")
    print(f"\n📄 Full report: {out_path}\n")

    return 1 if reds else 0


if __name__ == "__main__":
    sys.exit(asyncio.run(main()))
