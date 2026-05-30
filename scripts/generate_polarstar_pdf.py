"""
Polarstar Kids — Bedtime Stories PDF Bundle Generator
=====================================================

Generates a single PDF containing 5 calm bedtime stories
with parent reading guides and quiet activities.

Output: /app/frontend/public/assets/pdfs/polarstar-bedtime-stories.pdf

Re-run anytime to regenerate. Story content is the source of truth
(/app/frontend/src/data/aurinStories.js — content mirrored below
since this is a one-off generator, not a build-pipeline tool).
"""

from fpdf import FPDF
from pathlib import Path

# ── Brand palette ────────────────────────────────────────────
CREAM = (255, 251, 241)
BROWN = (58, 42, 24)
BROWN_SOFT = (91, 74, 50)
ACCENT_AMBER = (185, 122, 58)       # Discovery
ACCENT_SAGE = (93, 138, 79)          # Exploration
ACCENT_INDIGO = (91, 108, 178)       # Dreamweavers
GOLD = (212, 182, 125)
LINE_GREY = (200, 188, 165)

# ── Story content (sync with aurinStories.js) ────────────────
STORIES = [
    {
        "slug": "little-star",
        "title": "Little Star",
        "ageBand": "Little Dreamers · Ages 3–5",
        "accent": ACCENT_AMBER,
        "minutes": 3,
        "intro": "A tiny star learns that being small is not the same as being unseen.",
        "body": [
            "High in the quiet sky lived a very little star. The other stars sparkled and laughed, but Little Star was so small she thought no one could see her.",
            "One night, a child looked out of the window. The night was cold and the room felt dark. The child whispered, \u201cI wish I had one tiny light, just for me.\u201d",
            "Little Star heard the whisper. She held her breath and shone as softly as she could. Not bright. Not loud. Just a small, warm light, like a candle far away.",
            "The child smiled. \u201cThere you are,\u201d they said. \u201cI see you.\u201d",
            "Little Star learned something that night: a small light, given gently, is enough. You do not have to be the biggest to be loved. You only have to be here.",
            "And every night after, when the room felt too dark, the child would look up and find her \u2014 small, calm, and exactly enough.",
        ],
        "together": [
            "Did you ever feel small today? Did anyone notice you?",
            "Who do you 'see' even when they are quiet?",
            "What does it feel like when someone says, \u201cThere you are\u201d?",
        ],
        "activity_title": "Your Own Little Star",
        "activity": (
            "Draw a star on a piece of paper. Make it as small as you like. "
            "Choose one colour for it. Give it a name. Place it somewhere "
            "near your bed \u2014 so when the room feels too dark, you remember: "
            "even a small light is enough."
        ),
    },
    {
        "slug": "moon-boat",
        "title": "The Moon Boat",
        "ageBand": "Little Dreamers · Ages 3–5",
        "accent": ACCENT_AMBER,
        "minutes": 3,
        "intro": "A sleepy boat made of moonlight carries quiet dreams across the night sea.",
        "body": [
            "When the sky turns dark and the world begins to slow, a little boat appears on the sea. It is made of moonlight \u2014 silver and soft and very, very quiet.",
            "The Moon Boat has no engine and no sail. It moves only when a child closes their eyes and breathes out, slow and warm.",
            "Tonight, a small dream climbs aboard. It is the dream of a warm hand, a soft blanket, and someone gentle in the next room.",
            "The Moon Boat rocks, just a little. The waves whisper, \u201cHush.\u201d The stars lean down to look.",
            "And while the child sleeps, the Moon Boat carries the dream across the calm, dark water \u2014 all the way to morning.",
        ],
        "together": [
            "If you could place one dream on the Moon Boat tonight, what would it be?",
            "What does your dream need to feel safe on the journey?",
            "What sound does the sea make when it whispers, \u201chush\u201d?",
        ],
        "activity_title": "Three Slow Breaths",
        "activity": (
            "Lie down. Close your eyes. Imagine the Moon Boat rocking on calm water. "
            "Breathe in slowly \u2014 1, 2, 3. Breathe out slowly \u2014 1, 2, 3. "
            "Do this three times. With every breath out, the boat moves a little "
            "closer to morning."
        ),
    },
    {
        "slug": "night-forest",
        "title": "The Night Forest",
        "ageBand": "Explorers · Ages 6–8",
        "accent": ACCENT_SAGE,
        "minutes": 4,
        "intro": "A small explorer discovers that the forest at night is not scary \u2014 it is listening.",
        "body": [
            "Mira had always loved the forest in the daytime. The leaves were green, the path was clear, and the birds sang loud songs. But at night, the forest looked different \u2014 taller, darker, full of shadows.",
            "One evening, Mira's grandmother said, \u201cCome. I want to show you something only the night forest knows.\u201d",
            "They walked together, slowly. A small lantern swung between them. The trees were quiet, but they were not empty.",
            "\u201cListen,\u201d Grandmother said. \u201cThe forest is not louder at night. It is just listening more carefully.\u201d",
            "Mira stopped walking. She closed her eyes. She heard a leaf turn. A tiny breeze. The far, soft hoot of an owl who knew her name.",
            "\u201cThe dark is not against you,\u201d Grandmother whispered. \u201cThe dark is paying attention.\u201d",
            "Mira opened her eyes. The forest was still tall. The shadows were still long. But now they felt like company.",
            "She walked home holding the lantern a little higher, no longer afraid.",
        ],
        "together": [
            "What sound do you hear when you stop talking?",
            "Is the dark scary \u2014 or is it just quieter than the day?",
            "If the dark could speak softly, what do you think it would say?",
        ],
        "activity_title": "One Minute of Listening",
        "activity": (
            "Before bed, sit somewhere comfortable. Close your eyes. Set a timer "
            "for one full minute. Do not talk. Do not move. Just listen. "
            "When the minute ends, name three sounds you noticed. "
            "(One of them might be your own breathing \u2014 that is allowed.)"
        ),
    },
    {
        "slug": "quiet-dragon",
        "title": "The Quiet Dragon",
        "ageBand": "Explorers · Ages 6–8",
        "accent": ACCENT_SAGE,
        "minutes": 4,
        "intro": "Most dragons roar. This one chose to listen \u2014 and changed a whole village.",
        "body": [
            "In a village at the edge of a soft mountain lived a dragon who did not roar. He was tall and silver and a little bit shy. The villagers called him the Quiet Dragon.",
            "Other dragons stomped through the valleys and shouted at the sky. But the Quiet Dragon liked to sit on his rock and listen.",
            "He listened to the river. He listened to the wind. And, most of all, he listened to the children \u2014 because children, he said, often know what grown-ups have forgotten.",
            "One day, a small boy came to the rock. The boy was angry. His hands were tight and his face was hot.",
            "The Quiet Dragon did not ask anything. He just sat. And waited. And listened.",
            "After a while, the boy began to talk. Then he began to cry. Then he became quiet too.",
            "When the boy left, he was lighter. The Quiet Dragon had not said one word \u2014 but he had heard every single one.",
            "That is how the village learned: sometimes the bravest thing a dragon can do is simply pay attention.",
        ],
        "together": [
            "When you felt upset today, who listened to you?",
            "Was there someone who needed YOU to listen?",
            "What does it feel like when someone really, fully, hears you?",
        ],
        "activity_title": "The One-Minute Listener",
        "activity": (
            "Tomorrow, choose one person \u2014 a parent, a sibling, a friend. "
            "When they speak, try to listen for one whole minute without interrupting. "
            "Do not plan your reply. Do not jump in. Just listen, like the Quiet Dragon. "
            "At the end, you do not have to say anything wise. \u201cI hear you\u201d is enough."
        ),
    },
    {
        "slug": "aurin-and-the-lantern",
        "title": "Aurin and the Lantern",
        "ageBand": "Dreamweavers · Ages 9–12",
        "accent": ACCENT_INDIGO,
        "minutes": 5,
        "intro": "Aurin learns the difference between a light that shows the way and a light that pretends.",
        "body": [
            "Aurin had walked for a long time. The path was older than the trees, and the trees were older than the village. In Aurin's hand, a small lantern glowed \u2014 not bright, but steady.",
            "At a fork in the road, Aurin met a traveller. The traveller carried a beautiful lamp, much larger and louder than Aurin's. Coloured light spilled from it in every direction.",
            "\u201cYours is so small,\u201d the traveller said. \u201cHow can you see anything at all?\u201d",
            "Aurin smiled. \u201cI do not need to see everything,\u201d Aurin said. \u201cI only need to see the next step.\u201d",
            "They walked together for a while. The traveller's lamp was magnificent. It lit up trees, rocks, and distant hills. But it also threw long shadows that confused the path.",
            "Aurin's lantern lit only a small circle. But inside that circle, the ground was honest.",
            "After many hours, the traveller's lamp grew tired and went out. The traveller sat down, suddenly afraid.",
            "Aurin sat beside them, lifted the lantern, and said, \u201cYou do not need a bigger light. You need a closer one. Stay near me. We will go slowly. One step is enough.\u201d",
            "And so they walked \u2014 not fast, not far, but together \u2014 and the small steady light was, in the end, more than enough.",
        ],
        "together": [
            "When have you wanted a bigger light \u2014 a clearer answer, a longer view?",
            "What does \u201cthe next step\u201d look like for you tonight?",
            "Is there a difference between a light that shows the way and a light that pretends?",
        ],
        "activity_title": "One Honest Step",
        "activity": (
            "Stand up. Take three slow steps across the room. Notice each one \u2014 "
            "the heel touching down, the toes lifting, the balance shifting. "
            "Most days we walk a thousand steps without noticing one of them. "
            "Tonight: notice just three. Sometimes one honest step is the whole journey."
        ),
    },
]


# ── PDF generator ────────────────────────────────────────────
class PolarstarPDF(FPDF):
    def __init__(self):
        super().__init__(format="A5", orientation="P", unit="mm")
        self.set_margins(15, 18, 15)
        self.set_auto_page_break(auto=True, margin=18)
        self.alias_nb_pages()
        # Register Unicode-capable serif (Liberation = metric-compatible Times)
        font_dir = "/usr/share/fonts/truetype/liberation"
        self.add_font("Serif", "",   f"{font_dir}/LiberationSerif-Regular.ttf")
        self.add_font("Serif", "B",  f"{font_dir}/LiberationSerif-Bold.ttf")
        self.add_font("Serif", "I",  f"{font_dir}/LiberationSerif-Italic.ttf")
        self.add_font("Serif", "BI", f"{font_dir}/LiberationSerif-BoldItalic.ttf")

    def footer(self):
        # Page number + brand mark
        self.set_y(-15)
        self.set_font("Serif", "I", 8)
        self.set_text_color(*BROWN_SOFT)
        self.cell(
            0, 6,
            f"Polarstar Kids  \u00b7  Bedtime Stories  \u00b7  {self.page_no()} / {{nb}}",
            align="C",
        )

    # ── helpers ──
    def brand_line(self, y=None, color=GOLD):
        """Thin gold accent line across centre."""
        if y is None:
            y = self.get_y()
        self.set_draw_color(*color)
        self.set_line_width(0.4)
        self.line(40, y, self.w - 40, y)
        self.ln(4)

    def eyebrow(self, text, color=BROWN_SOFT):
        self.set_font("Serif", "I", 9)
        self.set_text_color(*color)
        # letter-spaced uppercase via space-out
        spaced = " ".join(list(text.upper()))
        self.cell(0, 5, spaced, align="C")
        self.ln(8)

    def title_xl(self, text, color=BROWN):
        self.set_font("Serif", "B", 28)
        self.set_text_color(*color)
        self.multi_cell(0, 12, text, align="C")
        self.ln(2)

    def title_l(self, text, color=BROWN):
        self.set_font("Serif", "B", 18)
        self.set_text_color(*color)
        self.multi_cell(0, 9, text, align="C")
        self.ln(2)

    def body_text(self, paragraphs, size=11, lh=6, color=BROWN):
        self.set_font("Serif", "", size)
        self.set_text_color(*color)
        for p in paragraphs:
            self.multi_cell(0, lh, p)
            self.ln(3)

    def italic_body(self, text, size=11, lh=6, color=BROWN_SOFT):
        self.set_font("Serif", "I", size)
        self.set_text_color(*color)
        self.multi_cell(0, lh, text, align="C")

    # ── pages ──
    def page_brand_cover(self):
        self.add_page()
        self.ln(50)
        self.eyebrow("Polarstar Kids", color=GOLD)
        self.ln(4)
        self.brand_line()
        self.ln(16)
        self.title_xl("Bedtime\nStories")
        self.ln(2)
        self.set_font("Serif", "I", 13)
        self.set_text_color(*BROWN_SOFT)
        self.cell(0, 7, "Five quiet stories for the end of the day.", align="C")
        self.ln(28)
        self.brand_line()
        self.ln(4)
        self.set_font("Serif", "", 10)
        self.set_text_color(*BROWN_SOFT)
        self.cell(0, 5, "A collection for families with children ages 3 to 12.", align="C")

    def page_intro_letter(self):
        self.add_page()
        self.eyebrow("A note before you read", color=ACCENT_AMBER)
        self.brand_line()
        self.ln(6)
        self.set_font("Serif", "", 11)
        self.set_text_color(*BROWN)
        intro_lines = [
            "These five stories were written for the slow part of the evening \u2014 "
            "the half-hour before sleep, when the world has finally gone quiet.",
            "Each story is short. Read out loud, most take three to five minutes. "
            "They do not teach lessons. They do not solve problems. They simply "
            "give the child (and you) somewhere soft to land at the end of the day.",
            "After every story you will find a page called \u201cTogether After the Story.\u201d "
            "It holds three gentle questions \u2014 not a quiz, not homework. You can ask "
            "one, all three, or none. The silence after the question is part of the gift.",
            "After that, a single \u201cQuiet Activity\u201d \u2014 a small invitation to do or "
            "notice one thing together before lights-out. Most take less than a minute.",
            "There is no order. Read whichever story matches the mood tonight. "
            "Tomorrow, read another. Or read the same one twice. Children love "
            "what is familiar.",
        ]
        for line in intro_lines:
            self.multi_cell(0, 6, line)
            self.ln(3)
        self.ln(6)
        self.set_font("Serif", "I", 11)
        self.set_text_color(*BROWN_SOFT)
        self.cell(0, 6, "With warmth,", align="L")
        self.ln(7)
        self.set_font("Serif", "BI", 13)
        self.set_text_color(*ACCENT_AMBER)
        self.cell(0, 6, "\u2014 Polarstar Kids", align="L")

    def page_story_cover(self, story):
        self.add_page()
        self.ln(40)
        self.set_font("Serif", "I", 9)
        self.set_text_color(*story["accent"])
        self.cell(0, 5, " ".join(list(story["ageBand"].upper())), align="C")
        self.ln(10)
        self.brand_line(color=story["accent"])
        self.ln(12)
        self.title_xl(story["title"])
        self.ln(6)
        self.set_font("Serif", "I", 12)
        self.set_text_color(*BROWN_SOFT)
        self.multi_cell(0, 7, story["intro"], align="C")
        self.ln(18)
        self.brand_line(color=story["accent"])
        self.ln(2)
        self.set_font("Serif", "", 9)
        self.set_text_color(*BROWN_SOFT)
        mins = story["minutes"]
        self.cell(0, 5, f"About {mins} minutes \u00b7 read aloud, slowly.", align="C")

    def page_story_body(self, story):
        self.add_page()
        self.set_font("Serif", "I", 9)
        self.set_text_color(*story["accent"])
        self.cell(0, 5, story["title"].upper(), align="C")
        self.ln(8)
        self.brand_line(color=story["accent"])
        self.ln(4)
        self.body_text(story["body"], size=11.5, lh=7.2)

    def page_together(self, story):
        self.add_page()
        self.ln(8)
        self.eyebrow("Together after the story", color=story["accent"])
        self.brand_line(color=story["accent"])
        self.ln(10)
        self.set_font("Serif", "I", 12)
        self.set_text_color(*BROWN_SOFT)
        self.multi_cell(
            0, 7,
            "Three small questions. You can ask one, or all, or none. "
            "The silence after the question is part of the gift.",
            align="C",
        )
        self.ln(10)
        for i, q in enumerate(story["together"], 1):
            self.set_font("Serif", "B", 22)
            self.set_text_color(*story["accent"])
            self.cell(15, 9, f"{i}", align="L")
            self.set_font("Serif", "", 12)
            self.set_text_color(*BROWN)
            x_before = self.get_x()
            self.multi_cell(0, 6.5, q)
            self.ln(8)
        self.ln(6)
        self.set_font("Serif", "I", 9)
        self.set_text_color(*BROWN_SOFT)
        self.multi_cell(
            0, 5,
            "Listen more than you respond. \u201cI hear you\u201d is always an answer.",
            align="C",
        )

    def page_activity(self, story):
        self.add_page()
        self.ln(8)
        self.eyebrow("A quiet activity", color=story["accent"])
        self.brand_line(color=story["accent"])
        self.ln(12)
        self.set_font("Serif", "B", 18)
        self.set_text_color(*BROWN)
        self.multi_cell(0, 9, story["activity_title"], align="C")
        self.ln(10)
        self.set_font("Serif", "", 12)
        self.set_text_color(*BROWN)
        self.multi_cell(0, 7, story["activity"], align="L")
        self.ln(12)
        self.brand_line(color=story["accent"])
        self.ln(2)
        self.set_font("Serif", "I", 9.5)
        self.set_text_color(*BROWN_SOFT)
        self.multi_cell(
            0, 5,
            "There is no right way to do this. Doing it slowly is enough.",
            align="C",
        )

    def page_closing(self):
        self.add_page()
        self.ln(40)
        self.eyebrow("Thank you for reading slowly", color=GOLD)
        self.brand_line()
        self.ln(12)
        self.set_font("Serif", "I", 13)
        self.set_text_color(*BROWN)
        self.multi_cell(
            0, 8,
            "There are more stories on the way \u2014\nand a quiet world being built for them.",
            align="C",
        )
        self.ln(14)
        self.set_font("Serif", "", 11)
        self.set_text_color(*BROWN_SOFT)
        self.multi_cell(
            0, 6.5,
            "Polarstar Kids is a painted home for bedtime stories, "
            "gentle activities and small family rituals \u2014 designed "
            "to be screen-down and ears-open.",
            align="C",
        )
        self.ln(12)
        self.set_font("Serif", "B", 11)
        self.set_text_color(*ACCENT_AMBER)
        self.cell(0, 6, "prulesoul.site / kids-universe / polarstar", align="C")
        self.ln(20)
        self.brand_line()
        self.ln(2)
        self.set_font("Serif", "I", 9)
        self.set_text_color(*BROWN_SOFT)
        self.cell(0, 5, "With warmth, from one quiet family to yours.", align="C")


# ── Build ────────────────────────────────────────────────────
def build():
    pdf = PolarstarPDF()
    pdf.set_title("Polarstar Kids — Bedtime Stories")
    pdf.set_author("Polarstar Kids")
    pdf.set_subject("Five calm bedtime stories for ages 3-12")
    pdf.set_creator("Polarstar Kids")

    pdf.page_brand_cover()
    pdf.page_intro_letter()
    for story in STORIES:
        pdf.page_story_cover(story)
        pdf.page_story_body(story)
        pdf.page_together(story)
        pdf.page_activity(story)
    pdf.page_closing()

    out_dir = Path("/app/frontend/public/assets/pdfs")
    out_dir.mkdir(parents=True, exist_ok=True)
    out_path = out_dir / "polarstar-bedtime-stories.pdf"
    pdf.output(str(out_path))
    return out_path


if __name__ == "__main__":
    path = build()
    print(f"PDF generated: {path}")
    print(f"Size: {path.stat().st_size / 1024:.1f} KB")
