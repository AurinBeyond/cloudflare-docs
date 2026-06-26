#!/usr/bin/env python3
"""
The Hearth Protocol — PDF Generator
====================================

Anna's 12-page A5 manuscript, laid out in the adult house
palette (deep blue + warm cream + lantern amber).

Outputs:
    /app/frontend/public/assets/pdfs/the-hearth-protocol.pdf       (full guide)
    /app/frontend/public/assets/pdfs/inheritance-inventory.pdf      (worksheet)

Re-run after manuscript edits:
    python3 /app/scripts/generate_hearth_pdf.py
"""
import os
from pathlib import Path
from fpdf import FPDF

OUT_DIR = Path("/app/frontend/public/assets/pdfs")
OUT_DIR.mkdir(parents=True, exist_ok=True)

# Adult house palette (deep blue + cream + amber).
INK_BG      = (15, 20, 24)       # deep navy
INK_CREAM   = (240, 232, 214)
INK_AMBER   = (214, 165, 96)
INK_MUTE    = (122, 131, 144)


def _set_text(pdf, color):
    pdf.set_text_color(*color)


def _fill_page(pdf):
    pdf.set_fill_color(*INK_BG)
    pdf.rect(0, 0, pdf.w, pdf.h, "F")


def _eyebrow(pdf, text, y=18):
    pdf.set_font("HearthSans", "B", 7)
    _set_text(pdf, INK_AMBER)
    pdf.set_xy(0, y)
    # tracking-wide upper-case feel via spaced letters
    spaced = "  ".join(text.upper())
    pdf.cell(pdf.w, 4, spaced, align="C")


def _heading(pdf, text, y, size=22):
    pdf.set_font("HearthSerif", "B", size)
    _set_text(pdf, INK_CREAM)
    pdf.set_xy(0, y)
    pdf.cell(pdf.w, size * 0.4 + 4, text, align="C")


def _italic_sub(pdf, text, y, size=11):
    pdf.set_font("HearthSerif", "I", size)
    _set_text(pdf, INK_AMBER)
    pdf.set_xy(0, y)
    pdf.cell(pdf.w, 6, text, align="C")


def _body_line(pdf, line, size=11, italic=False, color=None, indent_left=24, indent_right=24):
    """Render one line of body text — Anna's line-form style.
    Each line gets its own row; blank input yields a small vertical gap."""
    style = "I" if italic else ""
    pdf.set_font("HearthSerif", style, size)
    _set_text(pdf, color or INK_CREAM)
    if line == "":
        pdf.ln(3.5)
        return
    avail = pdf.w - indent_left - indent_right
    pdf.set_x(indent_left)
    # use multi_cell to wrap if line is too long (rare; mostly short)
    pdf.multi_cell(avail, 6.2, line, align="L")


def _signature(pdf, name="— Anna", brand="prulesoul", y=None, color=None):
    pdf.set_font("HearthSerif", "", 10.5)
    _set_text(pdf, color or INK_AMBER)
    if y is not None:
        pdf.set_y(y)
    pdf.ln(6)
    pdf.set_x(24)
    pdf.cell(0, 5, name)
    pdf.ln(5)
    pdf.set_x(24)
    pdf.set_font("HearthSerif", "I", 9.5)
    _set_text(pdf, INK_MUTE)
    pdf.cell(0, 5, brand)


def _candle(pdf, x_center, y_center, lit=True):
    """A tiny serif candle glyph rendered with primitives.
    Not a real illustration; just a quiet marker."""
    # candle body
    pdf.set_fill_color(*INK_CREAM)
    pdf.rect(x_center - 1.5, y_center - 2, 3, 10, "F")
    # base
    pdf.set_fill_color(*INK_AMBER)
    pdf.rect(x_center - 3, y_center + 7.5, 6, 1.5, "F")
    # flame (only when lit)
    if lit:
        pdf.set_fill_color(*INK_AMBER)
        # very small flame (oval-ish via a rect)
        pdf.ellipse(x_center - 1.2, y_center - 5.8, 2.4, 4, "F")
    # wick
    pdf.set_fill_color(*INK_MUTE)
    pdf.rect(x_center - 0.2, y_center - 2.4, 0.4, 1.2, "F")


# ── content (cleaned & de-duplicated from Anna's PDF) ──────

# Each page is a list of "lines" (Anna's line-form rhythm).
# Empty string = small vertical pause.
PAGES = [
    # PAGE 1 — Cover
    {
        "eyebrow": "PARENTS' ROOM · MATRIX AURIN · 2026",
        "title": "The Hearth",
        "subtitle": "A Quiet Evening Return To Yourself",
        "is_cover": True,
        "intro": [
            "20 minutes after the house has gone quiet.",
            "",
            "A practical evening companion for stepping out",
            "of today's role before sleep.",
            "",
            "For the parent who has carried more than their own thoughts today.",
            "For the evenings when the house is finally still, but the mind is not.",
            "For the moments between responsibility and rest.",
            "",
            "Read.",
            "Listen.",
            "Write.",
            "Or simply sit with the pages.",
            "",
            "Nothing here needs to be completed perfectly.",
            "Only honestly.",
            "",
            "A companion for quiet evenings.",
        ],
        "candle": True,
        "signature": True,
    },
    # PAGE 2 — A Letter To The Parent
    {
        "eyebrow": "PAGE 2",
        "title": "A Letter To The Parent",
        "lines": [
            "The house has finally gone quiet.",
            "The last light upstairs is off.",
            "",
            "A cup still stands beside the sink.",
            "The messages have stopped arriving.",
            "",
            "For a few minutes, nobody needs anything from you.",
            "",
            "Not an answer.",
            "Not a decision.",
            "Not a ride somewhere.",
            "Not a reminder.",
            "Not a solution.",
            "",
            "For most of the day, you have been carrying",
            "more than your own thoughts.",
            "",
            "You have carried schedules.",
            "Conversations.",
            "Requests.",
            "Corrections.",
            "Emotions.",
            "Small emergencies.",
            "Invisible responsibilities that rarely appear on any list.",
            "",
            "Many parents discover something strange when the day ends.",
            "The body is tired.",
            "The house is quiet.",
            "Yet the mind continues working.",
            "It replays conversations.",
            "Revisits decisions.",
            "Builds tomorrow before today has finished.",
            "",
            "This protocol was created for that moment.",
            "Not to improve you.",
            "Not to optimize you.",
            "Not to make you into a different person.",
            "",
            "Its purpose is simpler.",
            "To help you step out of today's role before sleep.",
            "To place down what can be placed down.",
            "To recognize what belongs to you and what does not.",
            "To leave the day where it happened.",
            "And to return, for a short while, to yourself.",
            "",
            "Nothing more is required tonight.",
            "Only twenty minutes.",
            "The rest can wait until morning.",
        ],
    },
    # PAGE 3 — How To Use This Protocol
    {
        "eyebrow": "PAGE 3",
        "title": "How To Use This Protocol",
        "lines": [
            "Read it slowly.",
            "There is no benefit to rushing.",
            "",
            "This is not a course.",
            "It is not a challenge.",
            "It is not a system to master.",
            "",
            "It is twenty minutes.",
            "That is all.",
            "",
            "You may read it in one sitting.",
            "Or one page at a time.",
            "",
            "You may write answers.",
            "Or simply think about them.",
            "",
            "Some evenings will feel clear.",
            "Some will not.",
            "Both are normal.",
            "",
            "If a question does not fit tonight, leave it.",
            "If a page feels important, stay with it longer.",
            "There are no points for finishing quickly.",
            "",
            "Keep this protocol somewhere easy to reach.",
            "A bedside table.",
            "A drawer.",
            "A shelf near the kitchen.",
            "Anywhere that belongs to real life.",
            "",
            "The audio companion exists for evenings when reading feels like work.",
            "Use whichever requires less effort.",
            "",
            "The purpose is not to perform the protocol perfectly.",
            "The purpose is to leave less unfinished business inside your own head.",
            "",
            "That is enough.",
            "Tonight is enough.",
        ],
    },
    # PAGE 4 — The Closure Signal
    {
        "eyebrow": "PAGE 4 · MINUTES 1–3",
        "title": "The Closure Signal",
        "lines": [
            "Light one small light.",
            "",
            "Not the overhead lamp.",
            "Not the television.",
            "Not the phone.",
            "",
            "A candle.",
            "A salt lamp.",
            "A single soft bulb.",
            "Something whose only purpose is to mark this moment.",
            "",
            "This light is your closure signal.",
            "Your nervous system has been reading signals all day.",
            "",
            "A child's footsteps.",
            "A change in someone's voice.",
            "The sound of a door closing.",
            "The silence that means something is wrong.",
            "The silence that means everything is fine.",
            "",
            "It notices more than you think.",
            "It remembers more than you realise.",
            "",
            "Give it one signal that always means the same thing.",
            "This one.",
            "",
            "Sit where you can see the light.",
            "Do not reach for anything.",
            "Do not organise tomorrow.",
            "Do not solve a problem.",
            "",
            "For ninety seconds, do nothing.",
            "Only look at the light.",
            "",
            "Notice that it is small.",
            "Notice that it asks nothing from you.",
            "Notice that nobody is waiting for an answer.",
            "",
            "For these few minutes, there is nowhere else you need to be.",
            "You are no longer carrying the day.",
            "You are setting it down.",
            "",
            "The protocol begins now.",
        ],
    },
    # PAGE 5 — The Inheritance Inventory
    {
        "eyebrow": "PAGE 5 · MINUTES 4–8",
        "title": "The Inheritance Inventory",
        "lines": [
            "Every family passes things forward.",
            "Some intentionally.",
            "Some without noticing.",
            "",
            "Patterns.",
            "Words.",
            "Expectations.",
            "Ways of solving problems.",
            "Ways of avoiding them.",
            "",
            "Tonight is not about blame.",
            "It is about observation.",
            "",
            "Take a page.",
            "Write slowly.",
            "Answer only what feels true.",
            "",
        ],
        "questions": [
            "What did my parents give me today, without saying a word?",
            "What did I give my children today, without meaning to?",
            "What did I ask someone else to carry that I would rather have carried myself?",
            "What did I carry myself that could have been shared?",
            "What remains unfinished between me and one specific person?",
            "What no longer needs to be carried by this family?",
        ],
        "lines_after": [
            "",
            "Do not search for perfect answers.",
            "Use the first honest answer.",
            "The quiet one.",
            "The one that arrives before explanation.",
            "",
            "Write it down.",
            "Leave space around the words.",
            "",
            "You are not collecting evidence.",
            "You are creating clarity.",
            "",
            "Sometimes a single sentence is enough.",
            "Sometimes a single sentence changes the shape of an entire evening.",
        ],
    },
    # PAGE 6 — One Loop On Paper
    {
        "eyebrow": "PAGE 6 · MINUTES 9–12",
        "title": "One Loop On Paper",
        "lines": [
            "The mind has a habit.",
            "It keeps returning to what feels unfinished.",
            "",
            "Not because it enjoys repetition.",
            "Because it is trying not to lose something important.",
            "",
            "The problem is that unfinished thoughts",
            "rarely become clearer by being repeated.",
            "They become louder.",
            "",
            "Choose one answer from the previous page.",
            "Only one.",
            "Not the biggest.",
            "Not the most dramatic.",
            "Just one.",
            "",
            "Write a single sentence about it.",
            "One sentence.",
            "No essay.",
            "No analysis.",
            "No attempt to solve everything tonight.",
            "",
            "A sentence is enough.",
            "",
            "The purpose is not completion.",
            "The purpose is recognition.",
            "",
            "Your mind no longer has to hold this loop alone.",
            "It exists somewhere else now.",
            "",
            "On paper.",
            "Visible.",
            "Named.",
            "Real.",
            "",
            "Fold the paper.",
            "Or close the notebook.",
            "Leave it where it is.",
            "",
            "You may return to it tomorrow.",
            "You do not need to carry it into sleep.",
        ],
    },
    # PAGE 7 — One Body Sweep
    {
        "eyebrow": "PAGE 7 · MINUTES 13–16",
        "title": "One Body Sweep",
        "lines": [
            "The day does not live only in thoughts.",
            "It also lives in the body.",
            "",
            "In the shoulders.",
            "In the jaw.",
            "In the stomach.",
            "In the chest.",
            "Sometimes in places we stop noticing.",
            "",
            "Take a moment.",
            "Do not try to relax completely.",
            "That is too large a task.",
            "",
            "Instead, look for one place still carrying part of today.",
            "One place.",
            "Nothing more.",
            "",
            "Perhaps it feels tight.",
            "Heavy.",
            "Restless.",
            "Warm.",
            "Cold.",
            "Or difficult to describe.",
            "",
            "Simply notice it.",
            "",
            "Now ask a smaller question.",
            "Can this place soften by one percent?",
            "Not completely.",
            "Not permanently.",
            "Just a little.",
            "The smallest amount you can imagine.",
            "",
            "Stay there for a few breaths.",
            "Notice whatever changes.",
            "Or notice that nothing changes.",
            "",
            "Both are information.",
            "Both are acceptable.",
            "",
            "You are not repairing the body tonight.",
            "You are listening to it.",
            "",
            "And sometimes being listened to is enough.",
        ],
    },
    # PAGE 8 — The One Quiet Thing
    {
        "eyebrow": "PAGE 8 · MINUTES 17–19",
        "title": "The One Quiet Thing",
        "lines": [
            "For most of the day, your attention belongs somewhere else.",
            "",
            "To schedules.",
            "To tasks.",
            "To conversations.",
            "To responsibilities.",
            "To people you care about.",
            "",
            "This next moment belongs only to you.",
            "",
            "Choose one quiet thing.",
            "Something small.",
            "Something ordinary.",
            "",
            "A book you have meant to open.",
            "A window you have not looked through.",
            "A chair you rarely sit in.",
            "A favourite cup.",
            "A blanket.",
            "A piece of music.",
            "A few minutes beneath the night sky.",
            "",
            "The thing itself does not matter.",
            "What matters is that it asks nothing from you.",
            "",
            "No productivity.",
            "No improvement.",
            "No outcome.",
            "",
            "Only presence.",
            "",
            "Spend a few minutes there.",
            "Not because you have earned it.",
            "Not because everything else is finished.",
            "",
            "Because you are a person.",
            "Not only a role.",
            "Not only a responsibility.",
            "A person.",
            "",
            "And people need small moments that belong to nobody else.",
        ],
    },
    # PAGE 9 — The Hearth Is Yours
    {
        "eyebrow": "PAGE 9 · MINUTE 20",
        "title": "The Hearth Is Yours",
        "lines": [
            "Look once more at the light you lit at the beginning.",
            "",
            "It has been here the entire time.",
            "Quietly.",
            "Without asking anything from you.",
            "",
            "Like a hearth.",
            "Like a place that remains.",
            "Even when the day has moved on.",
            "",
            "Take one final look around.",
            "",
            "Nothing needs to be solved tonight.",
            "Nothing needs to be perfected tonight.",
            "Nothing needs to be carried any further tonight.",
            "",
            "You have done enough.",
            "You have carried enough.",
            "You have given enough.",
            "",
            "For this day.",
            "For this evening.",
            "For this moment.",
            "",
            "When you are ready, extinguish the light.",
            "Watch the room change.",
            "",
            "Notice that the darkness is not empty.",
            "It is simply rest.",
            "",
            "The protocol is complete.",
            "The night belongs to itself now.",
            "",
            "And for a little while —",
            "so do you.",
        ],
        "candle_extinguished": True,
    },
    # PAGE 10 — When The Protocol Does Not Work
    {
        "eyebrow": "PAGE 10",
        "title": "When The Protocol Does Not Work",
        "lines": [
            "Some evenings, this protocol will feel helpful.",
            "Some evenings, it will not.",
            "",
            "That is normal.",
            "",
            "There will be nights when the mind remains busy.",
            "When a conversation continues replaying.",
            "When tomorrow arrives before today has ended.",
            "When the body is tired but sleep refuses to come.",
            "",
            "This protocol does not promise sleep.",
            "It does not promise calm.",
            "It does not promise that every unfinished thing will feel finished.",
            "",
            "Some loops require more than twenty minutes.",
            "Some seasons require more than one evening.",
            "",
            "The purpose of this protocol is smaller.",
            "And perhaps more realistic.",
            "",
            "To create twenty minutes that belong to you.",
            "Twenty minutes that are not owned by work.",
            "Or parenting.",
            "Or responsibility.",
            "Or expectation.",
            "",
            "Twenty minutes in which nothing new is added.",
            "",
            "Even if nothing changes tonight,",
            "something has still happened.",
            "",
            "You paused.",
            "You noticed.",
            "You listened.",
            "You made room.",
            "",
            "That is not failure.",
            "That is practice.",
            "",
            "Return tomorrow if you need to.",
            "The light will still be here.",
        ],
    },
    # PAGE 11 — Inheritance Inventory Worksheet Preview
    {
        "eyebrow": "PAGE 11 · WORKSHEET PREVIEW",
        "title": "The Inheritance Inventory",
        "lines": [
            "(A re-runnable worksheet ships separately as",
            "inheritance-inventory.pdf — print it once,",
            "use it as often as the evening asks.)",
            "",
        ],
        "questions": [
            "What did my parents give me today, without saying a word?",
            "What did I give my children today, without meaning to?",
            "What did I ask someone else to carry that I would rather have carried myself?",
            "What did I carry myself that could have been shared?",
            "What remains unfinished between me and one specific person?",
            "What no longer needs to be carried by this family?",
        ],
        "lines_after": [
            "",
            "Take only what is useful.",
            "Leave the rest.",
        ],
    },
    # PAGE 12 — Closing
    {
        "eyebrow": "PAGE 12 · CLOSING",
        "title": "The Room Remembers",
        "lines": [
            "The house will not always be this version of itself.",
            "",
            "Children grow.",
            "Rooms change.",
            "Schedules change.",
            "People change.",
            "Even the worries change.",
            "",
            "One day, many of the things that felt urgent today",
            "will be difficult to remember.",
            "",
            "That is the nature of family life.",
            "Not permanence.",
            "Movement.",
            "",
            "This protocol is not a record of perfect parenting.",
            "It is a record of presence.",
            "",
            "A small reminder that while caring for others,",
            "you were also allowed to remain human.",
            "",
            "If you return to these pages often,",
            "you may notice something.",
            "",
            "Not a transformation.",
            "Not a breakthrough.",
            "Something quieter.",
            "",
            "A little more space between the day and the night.",
            "A little more room to breathe.",
            "A little less carried forward than before.",
            "",
            "For now, close the pages.",
            "Turn off the light.",
            "",
            "Let the room keep what belongs to the room.",
            "Let the night keep what belongs to the night.",
            "",
            "And let yourself rest.",
            "",
            "The room remembers.",
        ],
        "signature": True,
    },
]


# ── Renderers ──────────────────────────────────────────────

def render_cover(pdf, page):
    _fill_page(pdf)
    _eyebrow(pdf, page["eyebrow"], y=22)
    _heading(pdf, page["title"], y=52, size=26)
    _italic_sub(pdf, page["subtitle"], y=86, size=12.5)
    # candle below
    if page.get("candle"):
        _candle(pdf, pdf.w / 2, 108, lit=True)
    # intro text below
    pdf.set_y(128)
    for line in page["intro"]:
        _body_line(pdf, line, size=10.5, color=INK_CREAM)
    if page.get("signature"):
        _signature(pdf, y=pdf.h - 28)


def render_content_page(pdf, page):
    _fill_page(pdf)
    _eyebrow(pdf, page["eyebrow"], y=14)
    _heading(pdf, page["title"], y=24, size=17)
    pdf.set_y(48)

    # body lines (before optional questions)
    for line in page.get("lines", []):
        is_italic = line.endswith("?") and " " in line   # questions in italic
        _body_line(pdf, line, size=10.5, italic=False)

    # six inheritance questions (italic, indented, amber)
    if "questions" in page:
        pdf.ln(2)
        for i, q in enumerate(page["questions"], 1):
            pdf.set_x(28)
            pdf.set_font("HearthSerif", "I", 10.5)
            _set_text(pdf, INK_AMBER)
            pdf.multi_cell(pdf.w - 56, 6.4, f"{i}.  {q}")
            pdf.ln(1.2)
        pdf.ln(1)

    # lines after questions
    for line in page.get("lines_after", []):
        _body_line(pdf, line, size=10.5)

    if page.get("candle_extinguished"):
        # tiny extinguished candle at bottom
        _candle(pdf, pdf.w / 2, pdf.h - 24, lit=False)

    if page.get("signature"):
        # signature only on Page 12 closing
        _signature(pdf, y=pdf.h - 28)


def build_main_pdf():
    pdf = FPDF(orientation="P", unit="mm", format="A5")
    pdf.set_auto_page_break(auto=False)
    # Unicode-capable serif (Liberation Serif = Times-compatible metrics)
    pdf.add_font("HearthSerif", "", "/usr/share/fonts/truetype/liberation/LiberationSerif-Regular.ttf", uni=True)
    pdf.add_font("HearthSerif", "B", "/usr/share/fonts/truetype/liberation/LiberationSerif-Bold.ttf", uni=True)
    pdf.add_font("HearthSerif", "I", "/usr/share/fonts/truetype/liberation/LiberationSerif-Italic.ttf", uni=True)
    pdf.add_font("HearthSans", "B", "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf", uni=True)
    for page in PAGES:
        pdf.add_page()
        if page.get("is_cover"):
            render_cover(pdf, page)
        else:
            render_content_page(pdf, page)
    out = OUT_DIR / "the-hearth.pdf"
    pdf.output(str(out))
    print(f"OK  main PDF → {out}  ({out.stat().st_size // 1024} KB)")
    return out


def build_worksheet_pdf():
    """1-page A5 standalone worksheet — re-runnable by parent."""
    pdf = FPDF(orientation="P", unit="mm", format="A5")
    pdf.set_auto_page_break(auto=False)
    pdf.add_font("HearthSerif", "", "/usr/share/fonts/truetype/liberation/LiberationSerif-Regular.ttf", uni=True)
    pdf.add_font("HearthSerif", "B", "/usr/share/fonts/truetype/liberation/LiberationSerif-Bold.ttf", uni=True)
    pdf.add_font("HearthSerif", "I", "/usr/share/fonts/truetype/liberation/LiberationSerif-Italic.ttf", uni=True)
    pdf.add_font("HearthSans", "B", "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf", uni=True)
    pdf.add_page()
    _fill_page(pdf)
    _eyebrow(pdf, "WORKSHEET · MINUTES 4–8", y=14)
    _heading(pdf, "The Inheritance Inventory", y=24, size=17)

    pdf.set_y(48)
    pdf.set_x(20)
    pdf.set_font("HearthSerif", "I", 10)
    _set_text(pdf, INK_MUTE)
    pdf.multi_cell(pdf.w - 40, 5.5,
                   "Six questions. Use the first honest answer. The quiet one.")
    pdf.ln(4)

    questions = [
        "What did my parents give me today, without saying a word?",
        "What did I give my children today, without meaning to?",
        "What did I ask someone else to carry that I would rather have carried myself?",
        "What did I carry myself that could have been shared?",
        "What remains unfinished between me and one specific person?",
        "What no longer needs to be carried by this family?",
    ]

    for i, q in enumerate(questions, 1):
        pdf.set_x(20)
        pdf.set_font("HearthSerif", "I", 10.5)
        _set_text(pdf, INK_AMBER)
        pdf.multi_cell(pdf.w - 40, 6, f"{i}.  {q}")
        pdf.ln(1)
        # writing line(s)
        pdf.set_draw_color(*INK_MUTE)
        for _ in range(2):
            pdf.set_x(28)
            y = pdf.get_y() + 3
            pdf.line(28, y, pdf.w - 20, y)
            pdf.ln(7)

    # footer
    _set_text(pdf, INK_MUTE)
    pdf.set_font("HearthSerif", "I", 9)
    pdf.set_xy(20, pdf.h - 18)
    pdf.cell(0, 5, "Take only what is useful. Leave the rest. — Anna · prulesoul")

    out = OUT_DIR / "inheritance-inventory.pdf"
    pdf.output(str(out))
    print(f"OK  worksheet PDF → {out}  ({out.stat().st_size // 1024} KB)")
    return out


if __name__ == "__main__":
    build_main_pdf()
    build_worksheet_pdf()
