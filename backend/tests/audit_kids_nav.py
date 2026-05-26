"""§KIDS-NAV-AUDIT 2026-02-10 — End-to-end audit: load Kids Universe
entry pages, harvest every <a>/Link target, follow them, and flag
anything that 404s, errors, or renders a near-empty body."""

import asyncio
from playwright.async_api import async_playwright

BASE = "https://aurin-hub.preview.emergentagent.com"
ENTRY_POINTS = [
    "/kids-universe",
    "/kids-universe/little-dreamers/hub",
    "/kids-universe/explorers/hub",
    "/kids-universe/dreamweavers/hub",
    "/kids-universe/explorers/daily",
    "/kids-universe/explorers/activities",
    "/kids-universe/explorers/stars",
    "/aurins-room/stories",
]


async def main():
    visited = set()
    seen_links = set()
    report = []

    async with async_playwright() as pw:
        b = await pw.chromium.launch(headless=True)
        ctx = await b.new_context(viewport={"width": 1400, "height": 900})
        page = await ctx.new_page()
        errors = []
        page.on("pageerror", lambda e: errors.append(str(e)))

        # Harvest links from every entry point
        for ep in ENTRY_POINTS:
            try:
                await page.goto(BASE + ep, wait_until="networkidle", timeout=25000)
                await page.wait_for_timeout(1500)
                hrefs = await page.evaluate("""() => {
                    return Array.from(document.querySelectorAll('a[href]'))
                        .map(a => a.getAttribute('href'))
                        .filter(h => h && (h.startsWith('/kids') || h.startsWith('/aurins')
                                          || h.startsWith('/library/kids') || h.startsWith('/body-temple')));
                }""")
                for h in hrefs:
                    seen_links.add(h)
            except Exception as e:
                report.append(("entry-error", ep, str(e)[:60]))

        print(f"Discovered {len(seen_links)} unique kid-related links")

        # Visit each unique link
        for h in sorted(seen_links):
            if h in visited:
                continue
            visited.add(h)
            errors.clear()
            url = BASE + h
            try:
                resp = await page.goto(url, wait_until="domcontentloaded", timeout=20000)
                await page.wait_for_timeout(1800)
                status = resp.status if resp else 0
                txt = await page.evaluate("() => document.body.innerText.trim()")
                tlen = len(txt)
                has_runtime_overlay = await page.evaluate("""() => {
                    return !!(document.querySelector('iframe#webpack-dev-server-client-overlay')
                          || /Uncaught runtime errors/.test(document.body.innerText));
                }""")
                low = tlen < 600
                bad = status != 200 or has_runtime_overlay or low or len(errors) > 0
                tag = "BAD" if bad else "OK"
                report.append((tag, h, f"http={status} len={tlen} overlay={has_runtime_overlay} errors={len(errors)}"))
                if bad:
                    print(f"  ✗ {h}  status={status}  len={tlen}  overlay={has_runtime_overlay}  errs={errors[:1]}")
            except Exception as e:
                report.append(("EXC", h, str(e)[:80]))

        print("\n=== SUMMARY ===")
        bad_only = [r for r in report if r[0] != "OK"]
        if not bad_only:
            print("  ✓ All kids-navigation routes render cleanly.")
        else:
            for tag, h, info in bad_only:
                print(f"  {tag}: {h:<55} {info}")

        await b.close()


asyncio.run(main())
