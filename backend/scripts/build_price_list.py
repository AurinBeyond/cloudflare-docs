"""
build_price_list.py — Generate Anna's PDF + Markdown price list
of every product/service currently live on prulesoul.site.

Run: python3 /app/backend/scripts/build_price_list.py
Outputs:
  /app/memory/PRICE_LIST_2026-02-09.md
  /app/memory/PRICE_LIST_2026-02-09.pdf

The price list reads the same source-of-truth values the backend
uses (env vars where possible, hard-coded fallbacks where the
founder has set Mike's locked pricing).
"""

import os
from datetime import datetime
from pathlib import Path

from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import cm
from reportlab.lib.colors import HexColor
from reportlab.lib.enums import TA_LEFT, TA_CENTER
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak,
)

PEACH_GOLD = HexColor("#A65A2F")
SAGE = HexColor("#7BA888")
CREAM_BG = HexColor("#FBF6EC")
TEXT_DARK = HexColor("#3D2A1E")
TEXT_MUTED = HexColor("#7A5E4A")
DIVIDER = HexColor("#E0C9A8")

OUT_DIR = Path("/app/memory")
OUT_DIR.mkdir(exist_ok=True)
MD_PATH = OUT_DIR / "PRICE_LIST_2026-02-09.md"
PDF_PATH = OUT_DIR / "PRICE_LIST_2026-02-09.pdf"


# ───────────────────────────────────────────────────────────────
#  PRODUCT CATALOG  (single source of truth for the price sheet)
# ───────────────────────────────────────────────────────────────

CATALOG = {
    "voice_passes": [
        {
            "name": "First Step",
            "price": "€45",
            "billing": "one-time",
            "voice_time": "60 min (3,600 s)",
            "description": (
                "A first, no-commitment visit into Aurin's voice rooms. "
                "Includes 60 minutes of voice time usable across any room "
                "(Aurin's Room, Grace, Body Room, Six Nights, Echo Soul). "
                "The voice time is yours for as long as you don't spend it."
            ),
        },
        {
            "name": "Steady Monthly",
            "price": "€120 / month",
            "billing": "monthly subscription",
            "voice_time": "60 min / month (3,600 s)",
            "description": (
                "Monthly rhythm — 60 fresh voice minutes each month, "
                "auto-renewing. Includes all clarity-room access and the "
                "full Clarity Curriculum for the parent's family."
            ),
        },
        {
            "name": "Own Room Monthly",
            "price": "€380 / month",
            "billing": "monthly subscription",
            "voice_time": "240 min / month (14,400 s)",
            "description": (
                "Deeper monthly commitment — 240 voice minutes (~4 h) every "
                "month. Best for people building a sustained practice with "
                "Aurin. Includes everything in Steady Monthly plus priority "
                "access to upcoming material."
            ),
        },
        {
            "name": "House 60h Package",
            "price": "€500",
            "billing": "one-time",
            "voice_time": "60 hours (3,600 min) total",
            "description": (
                "Flagship package. 60 hours of voice time + UNLOCKED FULL "
                "Clarity Curriculum (all premium activities, workbooks, "
                "recipe collections, craft bundles). Includes everything "
                "in the Kids Universe + Adult Clarity rooms."
            ),
        },
    ],

    "voice_topups": [
        {
            "name": "Universal Minute Bank · starter",
            "price": "€12",
            "billing": "one-time top-up",
            "voice_time": "20 min",
            "description": (
                "Lowest entry point. Twenty quiet minutes you can spend in "
                "any voice room. No subscription, no commitment. Marketed "
                "as the 'first taste' of Aurin."
            ),
            "status": "live once LEMONSQUEEZY_VARIANT_TOPUP_20MIN is seeded",
        },
        {
            "name": "30-min Top-up",
            "price": "€18",
            "billing": "one-time top-up",
            "voice_time": "30 min",
            "description": "Quick refill at €0.60/min.",
        },
        {
            "name": "60-min Top-up",
            "price": "€36",
            "billing": "one-time top-up",
            "voice_time": "60 min",
            "description": "Mid-range refill at €0.60/min.",
        },
        {
            "name": "180-min Top-up",
            "price": "€108",
            "billing": "one-time top-up",
            "voice_time": "180 min",
            "description": "Larger refill for sustained use at €0.60/min.",
        },
        {
            "name": "Custom Top-up (slider)",
            "price": "€0.60 / min",
            "billing": "one-time, any whole number of minutes between 10 and 300",
            "voice_time": "10 – 300 min",
            "description": (
                "Slider on Clarity Release page. Visitor picks any amount "
                "10-300 min, system snaps to the nearest pre-configured "
                "LemonSqueezy variant (10/15/20/30/45/60/90/120/180/300). "
                "Founder seeds variants as desired."
            ),
        },
    ],

    "books_pdf": [
        {
            "name": "Genesis Volumes — Volume I",
            "price": "Free",
            "format": "Markdown / PDF",
            "description": (
                "Foundations of self-mastery. Slow, long-form reading on "
                "attention, structure, and the discipline of returning to "
                "one thing at a time. Open to everyone."
            ),
        },
        {
            "name": "Genesis Volumes — Volume II",
            "price": "Member-only (included in Steady Monthly / Own Room / House 60h)",
            "format": "Markdown / PDF",
            "description": (
                "Patterns, practice, presence. Continues from Volume I. "
                "Reserved for signed-in members who hold an active pass."
            ),
        },
    ],

    "kids_universe": [
        {
            "name": "Kids Universe — Daily Reflection Ritual",
            "price": "Free (all ages)",
            "description": (
                "Daily mood check-in with Aurin's emoji picker (sad / "
                "worried / okay / good / sparkly). Auto-awards 1 ★ per day. "
                "Includes Aurin's mood-tuned soft reply + 3 personalised "
                "activity recommendations."
            ),
        },
        {
            "name": "Clarity Curriculum — Free Starter Activities",
            "price": "Free",
            "description": (
                "Twelve hand-curated starter activities (3 per module): "
                "Reflect (e.g. 'A jar for today's feeling', 'Three slow "
                "breaths'), Kitchen (no-bake recipes), Quest (kindness "
                "micro-acts), Create (coloring, tiny maze, pencil lines)."
            ),
        },
        {
            "name": "Clarity Curriculum — Premium Pack",
            "price": "Inside €500 House 60h Package",
            "description": (
                "Fifteen+ premium activities: Feelings Journal week, "
                "Friendship Skills workbook, Confidence pages, Affirmation "
                "bookmark, Gratitude Journal, full Kitchen Lab recipes, "
                "3D Paper House, Color-by-number, ABC pages, Summer "
                "Activity Book, Creative Writing Journal, Kindness Lessons, "
                "Daily Planner, Paper Pet, Montessori Focus pages."
            ),
        },
        {
            "name": "Coloring Studio (68 pages)",
            "price": "Free",
            "description": (
                "68 house-branded coloring pages, age-graded across "
                "Little Dreamers (3-5), Explorers (6-8), Dreamweavers "
                "(9-12). Downloadable as A4 PDFs."
            ),
        },
        {
            "name": "Angel Stars System",
            "price": "Free (all ages)",
            "description": (
                "Fifteen tap-to-earn star actions for kindness, courage, "
                "honesty. Parent-approval flow. Four mystery reward tiers "
                "(10 ★ / 25 ★ / 50 ★ / 100 ★) unlock voice messages, "
                "bedtime story unlocks, printable certificates, and an "
                "angel's lullaby. Plus reciprocal stars (child → parent)."
            ),
        },
        {
            "name": "Parent Portal — Wellness + Stars + Album",
            "price": "Free for any parent with a signed-in child profile",
            "description": (
                "7-day mood trend per child, Angel Stars approval queue, "
                "five-stamp parent recognition collection (Listener / "
                "Patient / Playful / Present / Champion), and a private "
                "memory album where parents can attach photos to approved "
                "stars."
            ),
        },
    ],

    "shared_goods": [
        {
            "name": "Referral Reward",
            "price": "Free both sides",
            "voice_time": "+8 voice minutes (~€5 value) each",
            "description": (
                "Each user gets a stable AURIN code. When a friend opens "
                "Aurin with the code and takes their first quiet step "
                "(daily check-in or paid pass), both accounts receive 500 "
                "voice seconds. Idempotent, one reward per referee."
            ),
        },
        {
            "name": "Anna's Weekly Letter",
            "price": "Free for any parent with a mood check-in history",
            "description": (
                "Friday digest email with the child's mood trend, Angel "
                "Stars earned, and a personalised Aurin sentence keyed to "
                "the week's dominant feeling. Founder-curated, Resend-sent."
            ),
        },
        {
            "name": "Reach Out (Customer Support)",
            "price": "Free",
            "description": (
                "Eight-option support dropdown + Resend-integrated email "
                "auto-reply. Real human (Anna) responds within 24h."
            ),
        },
    ],
}

PROCESSOR = "LemonSqueezy (currently pending review) + FastSpring (application opening)"


def md_value(catalog):
    lines = [
        "# Matrix Aurin — Price List",
        f"*Generated {datetime.now().strftime('%Y-%m-%d')} · For Anna · "
        f"Payment processor on file: {PROCESSOR}*",
        "",
        "All prices are **EUR** unless otherwise noted. Voice time is "
        "fungible across all rooms via the user's `presence_seconds_left` "
        "balance. The 60h House Package additionally unlocks the full "
        "Clarity Curriculum for the parent's family.",
        "",
        "---",
        "",
    ]
    section_titles = {
        "voice_passes":  "## Voice Passes & Subscriptions",
        "voice_topups":  "## Voice Top-ups",
        "books_pdf":     "## Books & PDFs",
        "kids_universe": "## Kids Universe & Curriculum",
        "shared_goods":  "## Built-in Bonuses & Support",
    }
    for key, title in section_titles.items():
        lines.append(title)
        lines.append("")
        for item in catalog[key]:
            lines.append(f"### {item['name']} — **{item['price']}**")
            if item.get("billing"):
                lines.append(f"*Billing: {item['billing']}*  ")
            if item.get("voice_time"):
                lines.append(f"*Voice time: {item['voice_time']}*  ")
            if item.get("format"):
                lines.append(f"*Format: {item['format']}*  ")
            if item.get("status"):
                lines.append(f"*Status: {item['status']}*  ")
            lines.append("")
            lines.append(item["description"])
            lines.append("")
        lines.append("---")
        lines.append("")
    lines.append("*— End of price list. Source of truth: this file. Update "
                 "when a new product ships.*")
    return "\n".join(lines)


def build_pdf(catalog, path):
    doc = SimpleDocTemplate(
        str(path), pagesize=A4,
        leftMargin=2.2 * cm, rightMargin=2.2 * cm,
        topMargin=2.0 * cm, bottomMargin=2.0 * cm,
        title="Matrix Aurin — Price List",
        author="Aurin's keeper",
    )
    styles = getSampleStyleSheet()
    h1 = ParagraphStyle("H1", parent=styles["Heading1"],
                        fontName="Helvetica", fontSize=24, leading=28,
                        textColor=TEXT_DARK, spaceAfter=4)
    eyebrow = ParagraphStyle("Eyebrow", parent=styles["Normal"],
                             fontName="Helvetica", fontSize=8, leading=11,
                             textColor=PEACH_GOLD, spaceAfter=14,
                             alignment=TA_LEFT)
    h2 = ParagraphStyle("H2", parent=styles["Heading2"],
                        fontName="Helvetica-Bold", fontSize=15, leading=19,
                        textColor=PEACH_GOLD, spaceBefore=18, spaceAfter=8)
    h3 = ParagraphStyle("H3", parent=styles["Heading3"],
                        fontName="Helvetica-Bold", fontSize=11.5, leading=15,
                        textColor=TEXT_DARK, spaceBefore=10, spaceAfter=2)
    meta = ParagraphStyle("Meta", parent=styles["Normal"],
                          fontName="Helvetica-Oblique", fontSize=9, leading=12,
                          textColor=TEXT_MUTED, spaceAfter=4)
    body = ParagraphStyle("Body", parent=styles["Normal"],
                          fontName="Helvetica", fontSize=10, leading=14,
                          textColor=TEXT_DARK, spaceAfter=10)
    intro = ParagraphStyle("Intro", parent=body, fontSize=10.5, leading=15,
                           textColor=TEXT_DARK, spaceAfter=18)
    closing = ParagraphStyle("Closing", parent=meta, alignment=TA_CENTER,
                             spaceBefore=24)

    story = []
    story.append(Paragraph("MATRIX AURIN · PRICE LIST", eyebrow))
    story.append(Paragraph("Everything we currently sell.", h1))
    story.append(Paragraph(
        f"Generated {datetime.now().strftime('%Y-%m-%d')} · "
        f"Payment processor on file: {PROCESSOR}",
        meta,
    ))
    story.append(Spacer(1, 0.4 * cm))
    story.append(Paragraph(
        "All prices in <b>EUR</b>. Voice time is fungible across every "
        "room via your account's <i>presence balance</i>. The €500 "
        "House 60h Package additionally unlocks the full Clarity "
        "Curriculum for the parent's family.",
        intro,
    ))

    sections = [
        ("voice_passes",  "Voice Passes & Subscriptions"),
        ("voice_topups",  "Voice Top-ups"),
        ("books_pdf",     "Books & PDFs"),
        ("kids_universe", "Kids Universe & Curriculum"),
        ("shared_goods",  "Built-in Bonuses & Support"),
    ]
    for key, title in sections:
        story.append(Paragraph(title.upper(), h2))
        for item in catalog[key]:
            story.append(Paragraph(
                f"{item['name']} — <b>{item['price']}</b>", h3,
            ))
            meta_parts = []
            for k_label in ("billing", "voice_time", "format", "status"):
                if item.get(k_label):
                    label_map = {
                        "billing": "Billing",
                        "voice_time": "Voice time",
                        "format": "Format",
                        "status": "Status",
                    }
                    meta_parts.append(f"<b>{label_map[k_label]}:</b> {item[k_label]}")
            if meta_parts:
                story.append(Paragraph(" · ".join(meta_parts), meta))
            story.append(Paragraph(item["description"], body))

    story.append(Paragraph(
        "— End of price list. Source of truth: this PDF + its sibling "
        "PRICE_LIST_2026-02-09.md. Update when a new product ships.",
        closing,
    ))

    doc.build(story)


if __name__ == "__main__":
    MD_PATH.write_text(md_value(CATALOG), encoding="utf-8")
    print(f"wrote {MD_PATH}")
    build_pdf(CATALOG, PDF_PATH)
    print(f"wrote {PDF_PATH}")
