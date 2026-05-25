"""
kids_curriculum.py — Clarity Curriculum catalog for Kids Universe.

§KIDS-CURRICULUM 2026-02-09 — Founder directive: organise four
thematic modules of activities, age-graded, free-vs-premium tagged,
each rewarding Angel Stars on completion.

Modules:
    reflect   — Aurin's Daily Reflection (emotional intelligence)
    kitchen   — Aurin's Kitchen Lab (no-bake life skills)
    quest     — The Growth Quest (kindness, friendship, confidence)
    create    — Creative Corner (coloring beyond, 3D crafts, mazes)

Each ACTIVITY shape:
    slug            unique
    module          one of {reflect, kitchen, quest, create}
    age_slugs       list of {little-dreamers, explorers, dreamweavers}
    title           short headline (English)
    body            soft 1-2 sentence pitch the child reads
    instructions    list of small steps
    duration_min    rough estimate (used by parent surfaces)
    with_parent     hint: "yes" / "either" / "alone"
    is_premium      False = free starter (3 per module), True = €60h
                    package only (gated; preview shows lock)
    reward_stars    Angel Stars awarded when parent approves
    mood_tags       which moods Aurin recommends this for
                    (sad / worried / okay / good / sparkly)

The free split (founder-approved):
    3 free starter activities per module = 12 total free
    The remaining ~20 are gated as "premium / inside the 60h package"
    Daily Reflection check-in itself is ALWAYS free (separate route).
"""

from typing import List, Dict, Any

# ── Module 1: Aurin's Daily Reflection ─────────────────────────────
# (Daily check-in itself is a free, separate flow. These are deeper
# reflective activities that surface from the check-in or the hub.)
REFLECT_ACTIVITIES: List[Dict[str, Any]] = [
    # FREE
    {"slug": "feelings_jar",         "module": "reflect", "age_slugs": ["little-dreamers", "explorers"], "title": "A jar for today's feeling", "body": "Draw the feeling living in your tummy right now — give it a colour, a face, a name.", "instructions": ["Find a quiet spot.", "Draw a jar shape.", "Inside the jar, draw what your feeling looks like today.", "Whisper to it: 'I see you.'"], "duration_min": 8, "with_parent": "either", "is_premium": False, "reward_stars": 1, "mood_tags": ["sad", "worried", "okay"]},
    {"slug": "three_breaths",        "module": "reflect", "age_slugs": ["little-dreamers", "explorers", "dreamweavers"], "title": "Three slow breaths with Aurin", "body": "A tiny pause — three soft breaths that turn the day a little softer.", "instructions": ["Sit comfortably.", "Breathe in slowly — count one.", "Breathe out slowly — count one.", "Repeat three times. Notice your shoulders soften."], "duration_min": 3, "with_parent": "either", "is_premium": False, "reward_stars": 1, "mood_tags": ["worried", "okay", "good"]},
    {"slug": "today_color",          "module": "reflect", "age_slugs": ["explorers", "dreamweavers"], "title": "What colour was today?", "body": "If today were a colour, what would it be? Write a few lines about why.", "instructions": ["Pick the colour that fits your day.", "Write 2-4 sentences: why this colour?", "Read them aloud, slowly."], "duration_min": 6, "with_parent": "alone", "is_premium": False, "reward_stars": 1, "mood_tags": ["okay", "good", "sparkly"]},
    # PREMIUM
    {"slug": "feelings_journal_week","module": "reflect", "age_slugs": ["explorers", "dreamweavers"], "title": "Feelings Journal — a quiet week", "body": "Seven small pages to write or draw what each day felt like inside.", "instructions": ["Open a fresh page each evening.", "Write three words for the day.", "Draw one small thing that mattered."], "duration_min": 10, "with_parent": "alone", "is_premium": True, "reward_stars": 3, "mood_tags": ["okay", "good"]},
    {"slug": "adhd_mindful_minute", "module": "reflect", "age_slugs": ["explorers", "dreamweavers"], "title": "A mindful minute for a busy mind", "body": "When the inside feels too fast — a 60-second anchor.", "instructions": ["Press both feet into the floor.", "Name five things you see.", "Name four things you hear.", "Name one slow breath."], "duration_min": 2, "with_parent": "either", "is_premium": True, "reward_stars": 2, "mood_tags": ["worried", "sparkly"]},
]

# ── Module 2: Aurin's Kitchen Lab ──────────────────────────────────
# No fire, no oven, no knives sharper than a butter knife.
KITCHEN_ACTIVITIES: List[Dict[str, Any]] = [
    # FREE
    {"slug": "yogurt_smoothie",      "module": "kitchen", "age_slugs": ["little-dreamers", "explorers"], "title": "A pink yogurt smoothie", "body": "Yogurt, a soft banana, a small spoon of jam — shake, shake, shake.", "instructions": ["Put yogurt in a cup with a lid.", "Add half a banana, mashed.", "Add a small spoon of jam.", "Close the lid. Shake until pink."], "duration_min": 5, "with_parent": "either", "is_premium": False, "reward_stars": 2, "mood_tags": ["okay", "good"]},
    {"slug": "happy_sandwich",       "module": "kitchen", "age_slugs": ["little-dreamers", "explorers"], "title": "A sandwich that smiles", "body": "Two slices of bread + butter + a face made of cucumber, cheese, and tomato.", "instructions": ["Butter one slice.", "Make two cucumber eyes.", "Add a cheese smile.", "Place the second slice on top — like a hat."], "duration_min": 6, "with_parent": "either", "is_premium": False, "reward_stars": 2, "mood_tags": ["sad", "okay", "good"]},
    {"slug": "fruit_kebab",          "module": "kitchen", "age_slugs": ["explorers", "dreamweavers"], "title": "A rainbow fruit kebab", "body": "Strawberry, banana, kiwi, grape — six colours threaded on one stick.", "instructions": ["Wash the fruit.", "Cut soft fruit into chunks (ask a grown-up for help).", "Thread them onto a wooden stick in rainbow order.", "Eat slowly — notice each colour."], "duration_min": 10, "with_parent": "yes", "is_premium": False, "reward_stars": 3, "mood_tags": ["good", "sparkly"]},
    # PREMIUM
    {"slug": "energy_balls",         "module": "kitchen", "age_slugs": ["explorers", "dreamweavers"], "title": "Oat & honey energy balls", "body": "Oats, honey, peanut butter, a sprinkle of seeds — roll, roll, roll.", "instructions": ["Mix 1 cup oats + 2 spoons honey + 2 spoons peanut butter.", "Add a handful of seeds.", "Roll into small balls with your hands.", "Chill for 20 minutes."], "duration_min": 18, "with_parent": "either", "is_premium": True, "reward_stars": 3, "mood_tags": ["good"]},
    {"slug": "tea_for_someone",      "module": "kitchen", "age_slugs": ["dreamweavers"], "title": "A pot of tea for someone you love", "body": "Boil water with a grown-up, choose the leaves, set the table, sit quietly together.", "instructions": ["Pick someone you'd like to make tea for.", "Boil water with a grown-up.", "Steep the tea for 3 minutes.", "Set two cups. Sit. Be quiet together for a moment."], "duration_min": 15, "with_parent": "yes", "is_premium": True, "reward_stars": 4, "mood_tags": ["okay", "good"]},
    {"slug": "no_bake_cookies",      "module": "kitchen", "age_slugs": ["explorers", "dreamweavers"], "title": "No-bake cocoa cookies", "body": "Crushed biscuits + cocoa + condensed milk — shape, chill, eat.", "instructions": ["Crush biscuits in a bowl (use a rolling pin).", "Add cocoa and condensed milk.", "Shape into small cookies.", "Chill 30 min."], "duration_min": 20, "with_parent": "either", "is_premium": True, "reward_stars": 3, "mood_tags": ["good", "sparkly"]},
]

# ── Module 3: The Growth Quest ─────────────────────────────────────
QUEST_ACTIVITIES: List[Dict[str, Any]] = [
    # FREE
    {"slug": "compliment_today",     "module": "quest", "age_slugs": ["little-dreamers", "explorers", "dreamweavers"], "title": "Give one real compliment today", "body": "Notice something good about someone, then tell them.", "instructions": ["Watch for one thing someone does kindly.", "Tell them what you saw.", "Use their name."], "duration_min": 3, "with_parent": "alone", "is_premium": False, "reward_stars": 2, "mood_tags": ["sad", "okay", "good"]},
    {"slug": "three_good_things",    "module": "quest", "age_slugs": ["explorers", "dreamweavers"], "title": "Three good things before bed", "body": "Three small things that went right today — say them out loud to yourself.", "instructions": ["Sit on your bed.", "Whisper three good things — even tiny ones.", "Breathe out slowly."], "duration_min": 3, "with_parent": "alone", "is_premium": False, "reward_stars": 1, "mood_tags": ["sad", "worried", "okay"]},
    {"slug": "helped_unasked",       "module": "quest", "age_slugs": ["explorers", "dreamweavers"], "title": "Help with something nobody asked you to", "body": "Spot a small thing that needs doing — and do it quietly.", "instructions": ["Look for one undone thing at home.", "Do it without saying anything.", "Notice how it feels afterwards."], "duration_min": 8, "with_parent": "alone", "is_premium": False, "reward_stars": 3, "mood_tags": ["okay", "good"]},
    # PREMIUM
    {"slug": "friendship_workbook",  "module": "quest", "age_slugs": ["explorers"], "title": "Friendship Skills — a quiet workbook", "body": "Five gentle pages on how to be a soft friend.", "instructions": ["Open page 1 — 'What makes a friend feel safe?'", "Answer in a few words.", "Try one of the page-2 promises this week."], "duration_min": 12, "with_parent": "either", "is_premium": True, "reward_stars": 3, "mood_tags": ["okay", "good"]},
    {"slug": "confidence_pages",     "module": "quest", "age_slugs": ["explorers", "dreamweavers"], "title": "Confidence pages — small braveries", "body": "A booklet of tiny brave acts. Pick one a day.", "instructions": ["Choose one act you've been avoiding.", "Do it small.", "Write one sentence after: how it felt."], "duration_min": 10, "with_parent": "alone", "is_premium": True, "reward_stars": 4, "mood_tags": ["worried", "okay"]},
    {"slug": "affirmation_bookmark", "module": "quest", "age_slugs": ["little-dreamers", "explorers"], "title": "A bookmark that whispers good things", "body": "Print a bookmark with five kind sentences about you. Carry it.", "instructions": ["Print the bookmark.", "Colour it with a grown-up.", "Tuck it in your favourite book.", "Read one line each morning."], "duration_min": 14, "with_parent": "yes", "is_premium": True, "reward_stars": 2, "mood_tags": ["sad", "worried"]},
    {"slug": "gratitude_journal",    "module": "quest", "age_slugs": ["explorers", "dreamweavers"], "title": "Gratitude Journal — a slow week", "body": "Seven small pages to notice what's already gentle in your life.", "instructions": ["Open one page each evening.", "Write three things you are grateful for.", "One must be very small."], "duration_min": 8, "with_parent": "alone", "is_premium": True, "reward_stars": 3, "mood_tags": ["okay", "good"]},
    # §KIDS-CURRICULUM-V1.1 2026-02-09 — Founder gap-fill from PDF
    # audit: standalone Kindness Lessons workbook + tiny daily
    # planner so 6–12 readers learn light self-organisation.
    {"slug": "kindness_lessons",     "module": "quest", "age_slugs": ["explorers", "dreamweavers"], "title": "Kindness Lessons — five small chapters", "body": "Five pages on what kindness costs, what it gives, and why nobody usually sees it.", "instructions": ["Open chapter 1 — 'kindness without an audience'.", "Pick one act of kindness no one will see.", "Do it this week.", "Come back and tick the chapter."], "duration_min": 14, "with_parent": "either", "is_premium": True, "reward_stars": 3, "mood_tags": ["sad", "okay", "good"]},
    {"slug": "daily_planner",        "module": "quest", "age_slugs": ["explorers", "dreamweavers"], "title": "A tiny three for today", "body": "Three small things you want to do today. No more, no less.", "instructions": ["Write three small things.", "One must be kind.", "One must be quiet.", "Tick them as you go."], "duration_min": 6, "with_parent": "alone", "is_premium": True, "reward_stars": 2, "mood_tags": ["okay", "good", "sparkly"]},
]

# ── Module 4: Creative Corner ──────────────────────────────────────
CREATE_ACTIVITIES: List[Dict[str, Any]] = [
    # FREE
    {"slug": "coloring_today",       "module": "create", "age_slugs": ["little-dreamers", "explorers", "dreamweavers"], "title": "Today's coloring page", "body": "Open the studio — a quiet, screen-free hour with the colours of your choice.", "instructions": ["Open the Coloring Studio.", "Pick a page that feels right.", "Print it or trace it.", "Colour without rushing."], "duration_min": 25, "with_parent": "either", "is_premium": False, "reward_stars": 2, "mood_tags": ["sad", "worried", "okay", "good"]},
    {"slug": "tiny_maze",            "module": "create", "age_slugs": ["explorers"], "title": "A tiny maze", "body": "Draw your own small maze. Trade with a grown-up.", "instructions": ["Draw a square on paper.", "Make a path with one start and one end.", "Add three dead ends.", "Hand it to someone and time them."], "duration_min": 10, "with_parent": "either", "is_premium": False, "reward_stars": 2, "mood_tags": ["good", "sparkly"]},
    {"slug": "pencil_lines",         "module": "create", "age_slugs": ["little-dreamers"], "title": "Pencil lines for steady hands", "body": "Trace the soft dotted lines — turn them into curls, waves, spirals.", "instructions": ["Hold the pencil softly.", "Follow the dotted lines.", "Add your own swirls."], "duration_min": 8, "with_parent": "either", "is_premium": False, "reward_stars": 1, "mood_tags": ["worried", "okay"]},
    # PREMIUM
    {"slug": "paper_house_3d",       "module": "create", "age_slugs": ["explorers", "dreamweavers"], "title": "A 3D paper house", "body": "Print, fold, glue — a small house you can hold in your hands.", "instructions": ["Print the template.", "Cut along solid lines.", "Fold along dotted lines.", "Glue tabs in the order numbered."], "duration_min": 35, "with_parent": "either", "is_premium": True, "reward_stars": 4, "mood_tags": ["good", "sparkly"]},
    {"slug": "color_by_number",      "module": "create", "age_slugs": ["explorers", "dreamweavers"], "title": "Color by number — a sleeping fox", "body": "Each tiny shape has a number. Each number has a colour. Slowly, a fox appears.", "instructions": ["Print the page.", "Follow the colour key.", "Take your time — this one is a long quiet hour."], "duration_min": 40, "with_parent": "alone", "is_premium": True, "reward_stars": 4, "mood_tags": ["okay", "good"]},
    {"slug": "abc_pages_starter",    "module": "create", "age_slugs": ["little-dreamers"], "title": "ABC pages — a letter a day", "body": "Twenty-six soft pages. Colour one letter each morning.", "instructions": ["Pick one letter today.", "Colour it your favourite way.", "Say a word that starts with it."], "duration_min": 12, "with_parent": "yes", "is_premium": True, "reward_stars": 2, "mood_tags": ["okay", "good"]},
    {"slug": "summer_activity_book", "module": "create", "age_slugs": ["explorers"], "title": "Summer Activity Book", "body": "Forty pages: mazes, dot-to-dots, hidden pictures, gentle puzzles.", "instructions": ["Open at any page.", "Try one puzzle.", "Tick it when done."], "duration_min": 20, "with_parent": "either", "is_premium": True, "reward_stars": 3, "mood_tags": ["good", "sparkly"]},
    {"slug": "creative_writing",     "module": "create", "age_slugs": ["dreamweavers"], "title": "A creative writing journal", "body": "Twelve quiet prompts to start a story you didn't know you had.", "instructions": ["Open the prompt of the day.", "Write for ten minutes without stopping.", "Read it back. Don't edit."], "duration_min": 15, "with_parent": "alone", "is_premium": True, "reward_stars": 3, "mood_tags": ["okay", "good"]},
    # §KIDS-CURRICULUM-V1.1 2026-02-09 — Founder's gap-fill: a paper
    # pet for 3–8 readers + a Montessori-style focus pack for 3–5.
    {"slug": "pet_paper_toy",        "module": "create", "age_slugs": ["little-dreamers", "explorers"], "title": "A paper pet to feed and keep", "body": "Cut, fold, glue — a small paper pet you can feed with paper carrots and tuck into a box at night.", "instructions": ["Print the paper-pet template.", "Cut along the solid lines.", "Fold along the dotted lines.", "Glue the tabs.", "Cut three paper carrots to feed it.", "Give your pet a name."], "duration_min": 25, "with_parent": "either", "is_premium": True, "reward_stars": 3, "mood_tags": ["okay", "good", "sparkly"]},
    {"slug": "montessori_focus",     "module": "create", "age_slugs": ["little-dreamers"], "title": "Montessori focus pages", "body": "Soft sort-and-match pages — quiet hands, calm mind, no rush.", "instructions": ["Open the first page.", "Match each picture to its pair.", "Take your time — no race.", "When you finish, sit quietly for one breath."], "duration_min": 15, "with_parent": "either", "is_premium": True, "reward_stars": 2, "mood_tags": ["worried", "okay"]},
]

KIDS_ACTIVITIES: List[Dict[str, Any]] = (
    REFLECT_ACTIVITIES + KITCHEN_ACTIVITIES + QUEST_ACTIVITIES + CREATE_ACTIVITIES
)

KIDS_MODULES = {
    "reflect": {
        "slug": "reflect",
        "title": "Aurin's Daily Reflection",
        "subtitle": "Quiet moments to notice how you feel.",
        "icon": "Compass",
        "color": "#E8A87C",
    },
    "kitchen": {
        "slug": "kitchen",
        "title": "Aurin's Kitchen Lab",
        "subtitle": "No fire, no oven — just gentle things to make and eat.",
        "icon": "Utensils",
        "color": "#7BA888",
    },
    "quest": {
        "slug": "quest",
        "title": "The Growth Quest",
        "subtitle": "Tiny brave acts. Real kindness. Quiet courage.",
        "icon": "Sprout",
        "color": "#B89B6E",
    },
    "create": {
        "slug": "create",
        "title": "Creative Corner",
        "subtitle": "Slow hands, quiet hours, things to fold and colour.",
        "icon": "Palette",
        "color": "#A66A9B",
    },
}

# Mood → recommended module mapping. Aurin uses this to suggest a
# "Today's Quest" after the daily check-in.
MOOD_TO_MODULES = {
    "sad":     ["quest", "reflect"],
    "worried": ["reflect", "create"],
    "okay":    ["create", "reflect"],
    "good":    ["kitchen", "quest"],
    "sparkly": ["create", "kitchen"],
}

MOOD_AURIN_REPLY = {
    "sad":     "Thank you for telling me. Even sad days are allowed. Want to do one small kind thing together?",
    "worried": "I hear you. Worries shrink a little when we breathe with them. Shall we try?",
    "okay":    "Okay is a soft place to rest. Pick something gentle today — no big climb.",
    "good":    "I'm so glad. Let's make today a little brighter for someone else too.",
    "sparkly": "Sparkly days are precious. Let's catch some of it in a thing you make.",
}

VALID_MOODS = tuple(MOOD_TO_MODULES.keys())
VALID_MODULES = tuple(KIDS_MODULES.keys())


def activities_filtered(age_slug: str, module: str | None = None, free_only: bool = False) -> List[Dict[str, Any]]:
    out = []
    for a in KIDS_ACTIVITIES:
        if age_slug not in a["age_slugs"]:
            continue
        if module and a["module"] != module:
            continue
        if free_only and a.get("is_premium"):
            continue
        out.append(a)
    return out


def get_activity(slug: str) -> Dict[str, Any] | None:
    for a in KIDS_ACTIVITIES:
        if a["slug"] == slug:
            return a
    return None


def recommend_for_mood(age_slug: str, mood: str) -> List[Dict[str, Any]]:
    """Return up to 3 activities that fit the mood for this age."""
    modules_for_mood = MOOD_TO_MODULES.get(mood, list(KIDS_MODULES.keys()))
    picks: List[Dict[str, Any]] = []
    seen = set()
    for m in modules_for_mood:
        for a in activities_filtered(age_slug, module=m):
            if mood in a.get("mood_tags", []) and a["slug"] not in seen:
                picks.append(a)
                seen.add(a["slug"])
                if len(picks) >= 3:
                    return picks
    # Top up with any age-appropriate activity if mood-tag was sparse.
    if len(picks) < 3:
        for a in activities_filtered(age_slug):
            if a["slug"] not in seen:
                picks.append(a)
                seen.add(a["slug"])
                if len(picks) >= 3:
                    break
    return picks
