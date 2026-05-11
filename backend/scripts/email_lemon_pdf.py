"""Iter 64c — Email the LemonSqueezy product list to the founder as PDF.

Usage:  python /app/backend/scripts/email_lemon_pdf.py [recipient@email]

Reads:
  /app/memory/LEMONSQUEEZY_PRODUCT_LIST.md
Generates:
  /tmp/aurin_lemonsqueezy_product_list.pdf
Emails:
  via Resend, with PDF attachment (base64).

If no recipient argument, falls back to env FOUNDER_EMAIL.
"""
from __future__ import annotations

import asyncio
import base64
import os
import sys
from pathlib import Path

from dotenv import load_dotenv
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import cm
from reportlab.lib.enums import TA_LEFT
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, PageBreak, Table, TableStyle,
)
from reportlab.lib import colors

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / "backend"))
load_dotenv(ROOT / "backend" / ".env")

from email_service import send_email, is_configured  # noqa: E402

MD_FILE = ROOT / "memory" / "LEMONSQUEEZY_PRODUCT_LIST.md"
PDF_FILE = Path("/tmp/aurin_lemonsqueezy_product_list.pdf")


def build_pdf(out: Path) -> None:
    """Render the markdown file into a clean A4 PDF.

    We do not use a heavy markdown→pdf engine. We parse only the bits
    of markdown we actually use (## headings, ``` code blocks, |tables|,
    plain paragraphs) and lay them out with reportlab Platypus. Calm
    typography, no marketing flourish.
    """
    text = MD_FILE.read_text(encoding="utf-8")
    styles = getSampleStyleSheet()

    h1 = ParagraphStyle(
        "h1", parent=styles["Heading1"], fontName="Helvetica-Bold",
        fontSize=18, leading=22, spaceAfter=12, textColor=colors.HexColor("#0f1a14"),
    )
    h2 = ParagraphStyle(
        "h2", parent=styles["Heading2"], fontName="Helvetica-Bold",
        fontSize=13, leading=17, spaceBefore=14, spaceAfter=8,
        textColor=colors.HexColor("#1f3328"),
    )
    body = ParagraphStyle(
        "body", parent=styles["BodyText"], fontName="Helvetica",
        fontSize=9.5, leading=13, alignment=TA_LEFT,
        textColor=colors.HexColor("#222"),
    )
    code = ParagraphStyle(
        "code", parent=body, fontName="Courier",
        fontSize=8.5, leading=12, leftIndent=8, spaceBefore=4, spaceAfter=4,
        textColor=colors.HexColor("#0a3d2c"), backColor=colors.HexColor("#f4faf6"),
    )
    meta = ParagraphStyle(
        "meta", parent=body, fontSize=8.5, textColor=colors.HexColor("#777"),
    )

    story: list = []
    story.append(Paragraph("LemonSqueezy — Toodete nimekiri", h1))
    story.append(Paragraph(
        "prulesoul.site · Matrix Aurin · valmis paneeli sisestamiseks", meta,
    ))
    story.append(Spacer(1, 8))

    in_code = False
    code_buf: list[str] = []
    in_table = False
    table_rows: list[list[str]] = []

    def flush_code():
        nonlocal code_buf
        if not code_buf:
            return
        joined = "<br/>".join(
            line.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
                .replace(" ", "&nbsp;")
            for line in code_buf
        )
        story.append(Paragraph(joined, code))
        story.append(Spacer(1, 6))
        code_buf = []

    def flush_table():
        nonlocal table_rows
        if not table_rows:
            return
        if len(table_rows) >= 2 and all(set(c) <= set("-: ") for c in table_rows[1]):
            table_rows = [table_rows[0]] + table_rows[2:]
        try:
            tbl = Table(table_rows, hAlign="LEFT", repeatRows=1)
            tbl.setStyle(TableStyle([
                ("FONT", (0, 0), (-1, 0), "Helvetica-Bold", 8.5),
                ("FONT", (0, 1), (-1, -1), "Helvetica", 8.5),
                ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#e9f1ec")),
                ("TEXTCOLOR", (0, 0), (-1, -1), colors.HexColor("#222")),
                ("BOX", (0, 0), (-1, -1), 0.4, colors.HexColor("#bbb")),
                ("INNERGRID", (0, 0), (-1, -1), 0.25, colors.HexColor("#ddd")),
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("LEFTPADDING", (0, 0), (-1, -1), 4),
                ("RIGHTPADDING", (0, 0), (-1, -1), 4),
                ("TOPPADDING", (0, 0), (-1, -1), 3),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 3),
            ]))
            story.append(tbl)
            story.append(Spacer(1, 8))
        except Exception:
            for row in table_rows:
                story.append(Paragraph(" · ".join(row), body))
        table_rows = []

    for raw in text.splitlines():
        line = raw.rstrip()

        if line.strip().startswith("```"):
            if in_code:
                in_code = False
                flush_code()
            else:
                flush_table()
                in_code = True
            continue
        if in_code:
            code_buf.append(raw)
            continue

        if line.startswith("|") and line.endswith("|"):
            cells = [c.strip() for c in line.strip("|").split("|")]
            if not in_table:
                in_table = True
            table_rows.append(cells)
            continue
        elif in_table:
            in_table = False
            flush_table()

        if not line.strip():
            story.append(Spacer(1, 4))
            continue
        if line.startswith("# "):
            story.append(Paragraph(line[2:].strip(), h1))
        elif line.startswith("## "):
            story.append(Paragraph(line[3:].strip(), h2))
        elif line.startswith("### "):
            story.append(Paragraph(line[4:].strip(), h2))
        elif line.startswith("- ") or line.startswith("* "):
            story.append(Paragraph("• " + line[2:].strip(), body))
        elif line.startswith("> "):
            story.append(Paragraph(
                f'<i>{line[2:].strip()}</i>', meta,
            ))
        elif line.startswith("---"):
            story.append(Spacer(1, 6))
        else:
            safe = (line.replace("&", "&amp;").replace("<", "&lt;")
                        .replace(">", "&gt;"))
            safe = safe.replace("**", "")
            story.append(Paragraph(safe, body))

    flush_code()
    flush_table()

    doc = SimpleDocTemplate(
        str(out), pagesize=A4,
        leftMargin=2 * cm, rightMargin=2 * cm,
        topMargin=2 * cm, bottomMargin=2 * cm,
        title="LemonSqueezy Product List · Matrix Aurin",
    )
    doc.build(story)


HTML_BODY = """\
<div style="font-family:Helvetica,Arial,sans-serif;color:#1f2a24;
            line-height:1.55;font-size:14.5px;max-width:560px">
  <p>Tere,</p>
  <p>Saadan sulle ettevalmistatud LemonSqueezy toodete nimekirja PDF-na,
     et saaksid selle paneeli sisestada ilma vajaduseta meie sisemise
     repositooriumi avada.</p>

  <p><strong>Sisaldab:</strong></p>
  <ul style="padding-left:18px">
    <li>14 makstud SKU-d (raamatud · kursused · Clarity Release passid)</li>
    <li>1 tasuta lead-magnet</li>
    <li>iga toote nimi · slug · audience · price · Variant ID</li>
    <li>6-punktiline kontrollnimekiri enne live-mode sisselülitamist</li>
  </ul>

  <p><strong>Pärast sisestamist palun kontrolli:</strong></p>
  <ol style="padding-left:18px">
    <li>Kõik 14 SKU-d on <em>Active / Published</em></li>
    <li>Pood on <em>Live</em> mode (mitte Test)</li>
    <li>Webhook URL → <code>https://prulesoul.site/api/lemonsqueezy/webhook</code></li>
    <li>Tee 1× $1 testost päris kaardiga</li>
  </ol>

  <p>Kui midagi PDF-is ei tundu õige või muutsid hindu/variandi-ID-d
     LemonSqueezy paneelis, palun anna teada — peame need muutused ka
     koodis sünkroniseerima (<code>SEED_BOOKS</code>, <code>SEED_COURSES</code>,
     <code>CLARITY_TIERS</code> failis <code>backend/server.py</code>).</p>

  <p style="color:#586b62;font-style:italic;margin-top:24px">
    — Matrix Aurin (E1 stabilization fork)
  </p>
</div>
"""


async def main():
    if not is_configured():
        print("ERROR: RESEND_API_KEY not set. Cannot send.")
        sys.exit(1)

    recipient = (sys.argv[1] if len(sys.argv) > 1 else "").strip() or \
        os.environ.get("FOUNDER_EMAIL", "").strip() or \
        os.environ.get("ADMIN_EMAIL", "").strip()
    if not recipient:
        print("ERROR: no recipient. Pass as argv[1] or set FOUNDER_EMAIL in .env.")
        sys.exit(1)

    print(f"Building PDF from {MD_FILE} ...")
    build_pdf(PDF_FILE)
    pdf_bytes = PDF_FILE.read_bytes()
    pdf_b64 = base64.b64encode(pdf_bytes).decode("ascii")
    print(f"  PDF: {len(pdf_bytes)} bytes")

    print(f"Sending to {recipient} ...")
    result = await send_email(
        to=recipient,
        subject="Matrix Aurin · LemonSqueezy toodete nimekiri (PDF)",
        html=HTML_BODY,
        text=(
            "Matrix Aurin\n\n"
            "Manuses on PDF-iga LemonSqueezy toodete nimekiri (14 SKU-d).\n"
            "Pärast paneelis sisestamist palun kontrolli Active staatust ja"
            " tee üks $1 testost.\n\n— E1"
        ),
        sender="info",
        attachments=[{
            "filename": "aurin_lemonsqueezy_product_list.pdf",
            "content": pdf_b64,
            "content_type": "application/pdf",
        }],
    )
    print(f"OK · resend id = {result.get('id')}")


if __name__ == "__main__":
    asyncio.run(main())
