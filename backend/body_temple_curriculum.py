"""
body_temple_curriculum.py — Body Temple 28: a 4-week adult course
that lives inside the Kaelan (Body) room.

§BODY-TEMPLE 2026-02-09 — Founder directive (Anna): the YouTube
discovery "Эти ЗНАНИЯ о теле исчезли из БИБЛИИ" outlines four
ancient keys to body wisdom (breathing, touch, rest, presence).
Translate that into a structured 28-day adult curriculum that
matches Kaelan's tone — never clinical, never medical, only soft
guidance and Socratic prompts.

Each DAY shape:
    day             1..28
    week_key        one of {breathing, touch, rest, presence}
    week_number     1..4
    title           short headline (English)
    body            soft 1–3 sentence framing the user reads
    practice        list of small steps for today
    duration_min    rough estimate
    reflection      a single Socratic question to close the day
    is_premium      day 1 (intro) is free preview; rest premium

Pricing model: $39 one-time unlock of all 28 days (per founder).
Day 1 is freely visible so the room can demonstrate tone and
texture before the wanderer commits.
"""

from typing import List, Dict, Any


# ── Week 1 — Breathing (as prayer) ─────────────────────────────────
WEEK_1_BREATHING = [
    {"day": 1,  "week_key": "breathing", "week_number": 1, "title": "Meeting your own breath",
     "body": "Before we begin, just notice. Your breath has been with you longer than any word in your head. Today we only listen.",
     "practice": ["Sit comfortably. Hands resting.",
                  "Watch one full inhale. Then one full exhale.",
                  "Don't change anything. Just be the witness.",
                  "Do this for two minutes."],
     "duration_min": 5, "reflection": "What did my breath feel like — soft, rushed, shallow, deep?", "is_premium": False},
    {"day": 2,  "week_key": "breathing", "week_number": 1, "title": "The long exhale",
     "body": "An exhale longer than the inhale is the body's oldest signal that it is safe.",
     "practice": ["Breathe in for four counts.",
                  "Breathe out for six counts.",
                  "Repeat for ten cycles.",
                  "Place a hand on your chest after."],
     "duration_min": 6, "reflection": "Where in my body did the softening begin first?", "is_premium": True},
    {"day": 3,  "week_key": "breathing", "week_number": 1, "title": "Breath as a shield",
     "body": "When someone's words sting, the long exhale becomes invisible armour — it returns you to yourself.",
     "practice": ["Recall one moment today that pinched.",
                  "As you remember it, exhale slowly for eight counts.",
                  "Do this three times.",
                  "Notice if the sting moved."],
     "duration_min": 5, "reflection": "Did the memory shrink, soften, or stay the same?", "is_premium": True},
    {"day": 4,  "week_key": "breathing", "week_number": 1, "title": "Belly, ribs, chest",
     "body": "Three places the breath can land. Most adults only know one.",
     "practice": ["Lying down, place one hand on belly, one on chest.",
                  "Inhale so the belly rises first.",
                  "Then the ribs. Then the chest.",
                  "Reverse on the exhale."],
     "duration_min": 7, "reflection": "Which of the three felt most foreign?", "is_premium": True},
    {"day": 5,  "week_key": "breathing", "week_number": 1, "title": "The pause between",
     "body": "Between inhale and exhale lives a small stillness. Most people never visit it.",
     "practice": ["Inhale slowly.",
                  "Hold for two soft counts at the top.",
                  "Exhale slowly.",
                  "Hold for two soft counts at the bottom.",
                  "Repeat seven times."],
     "duration_min": 6, "reflection": "What lives inside the pause?", "is_premium": True},
    {"day": 6,  "week_key": "breathing", "week_number": 1, "title": "Breath before words",
     "body": "One breath before speaking changes which version of you arrives.",
     "practice": ["Choose one conversation today.",
                  "Before answering, take one slow breath.",
                  "Notice what you almost said.",
                  "Notice what you chose to say instead."],
     "duration_min": 3, "reflection": "What did the breath let me leave unsaid?", "is_premium": True},
    {"day": 7,  "week_key": "breathing", "week_number": 1, "title": "Closing the breathing week",
     "body": "Seven days of listening to one quiet companion. Today we thank it.",
     "practice": ["Sit with closed eyes.",
                  "Inhale: 'I receive.'",
                  "Exhale: 'I release.'",
                  "Do this for five minutes.",
                  "Open eyes slowly."],
     "duration_min": 8, "reflection": "What has this week taught me about my own pacing?", "is_premium": True},
]

# ── Week 2 — Touch (contact with yourself) ─────────────────────────
WEEK_2_TOUCH = [
    {"day": 8,  "week_key": "touch", "week_number": 2, "title": "Hand on heart",
     "body": "The first touch is the one you give yourself — and most adults skip it for years.",
     "practice": ["Place your right palm on your heart.",
                  "Feel the warmth of skin meeting skin.",
                  "Stay there for two minutes.",
                  "Say silently: 'I am here.'"],
     "duration_min": 4, "reflection": "What did my own hand feel like — strange, comforting, distant?", "is_premium": True},
    {"day": 9,  "week_key": "touch", "week_number": 2, "title": "Naming what aches",
     "body": "Your body has been carrying small aches you stopped registering. Today we name three.",
     "practice": ["Close your eyes.",
                  "Scan from head to feet, slowly.",
                  "Find three places that whisper.",
                  "Place a hand on each, one by one. Say: 'I see you.'"],
     "duration_min": 7, "reflection": "Which ache was the loudest, once I listened?", "is_premium": True},
    {"day": 10, "week_key": "touch", "week_number": 2, "title": "The thank-you scan",
     "body": "Your feet carried you. Your hands held things. Today we thank, instead of judge.",
     "practice": ["Touch your feet. Whisper: 'Thank you.'",
                  "Touch your hands. Whisper: 'Thank you.'",
                  "Touch your belly. Whisper: 'Thank you.'",
                  "Touch your throat. Whisper: 'Thank you.'"],
     "duration_min": 5, "reflection": "Which part of me did I find hardest to thank?", "is_premium": True},
    {"day": 11, "week_key": "touch", "week_number": 2, "title": "Slow water",
     "body": "Washing your hands is a chance, twice a day, to feel held by your own care.",
     "practice": ["At your next wash, slow down.",
                  "Feel the temperature of water on each finger.",
                  "Take twice as long as usual.",
                  "Look at your hands afterwards."],
     "duration_min": 3, "reflection": "What did my hands look like when I really looked?", "is_premium": True},
    {"day": 12, "week_key": "touch", "week_number": 2, "title": "Shoulders, jaw, hands",
     "body": "Three places adults clench without noticing. We release each, gently.",
     "practice": ["Roll shoulders backwards five times.",
                  "Open and close your jaw slowly three times.",
                  "Open your fists wide, then soften.",
                  "Notice the space that opened."],
     "duration_min": 4, "reflection": "Which of the three was holding the most?", "is_premium": True},
    {"day": 13, "week_key": "touch", "week_number": 2, "title": "Skin as a boundary",
     "body": "Your skin is the first boundary you ever had. Today we feel it as a kind border, not a wall.",
     "practice": ["Run your fingertips along your forearm.",
                  "Slowly. Pay attention to the texture.",
                  "Notice: this is where you end and the world begins.",
                  "Breathe into that knowledge."],
     "duration_min": 5, "reflection": "Where do I let others past my skin too quickly?", "is_premium": True},
    {"day": 14, "week_key": "touch", "week_number": 2, "title": "Closing the touch week",
     "body": "Two weeks in. Today we hold our own face — the way someone who loves us might.",
     "practice": ["Cup your face with both palms.",
                  "Stay for one full minute.",
                  "Breathe slowly.",
                  "Say silently: 'I belong to me.'"],
     "duration_min": 4, "reflection": "What was easier this week — and what was hard?", "is_premium": True},
]

# ── Week 3 — Rest (fasting from noise) ─────────────────────────────
WEEK_3_REST = [
    {"day": 15, "week_key": "rest", "week_number": 3, "title": "Five minutes of nothing",
     "body": "Not meditation. Not phone. Not sleep. Just five minutes of doing nothing — the rarest currency.",
     "practice": ["Set a timer for five minutes.",
                  "Sit. No phone. No music.",
                  "When thoughts come, let them pass.",
                  "When the timer rings, notice how you feel."],
     "duration_min": 5, "reflection": "What did boredom feel like — and where did my hands want to go?", "is_premium": True},
    {"day": 16, "week_key": "rest", "week_number": 3, "title": "The screen pause",
     "body": "Today, one full hour with no screens before bed. The body has been waiting.",
     "practice": ["Pick a one-hour window before sleep.",
                  "Phone, laptop, TV — all off.",
                  "Do something analog: tea, walk, journal.",
                  "Notice how sleep arrived."],
     "duration_min": 60, "reflection": "How did my body feel different the next morning?", "is_premium": True},
    {"day": 17, "week_key": "rest", "week_number": 3, "title": "The morning silence",
     "body": "Most adults reach for the phone before water. Today the first thing we meet is silence.",
     "practice": ["On waking, do not pick up the phone.",
                  "Drink a glass of water slowly.",
                  "Sit for three minutes in silence.",
                  "Then begin your day."],
     "duration_min": 5, "reflection": "What did my first thought become, when I let it come slowly?", "is_premium": True},
    {"day": 18, "week_key": "rest", "week_number": 3, "title": "One meal alone",
     "body": "Eat one meal today without phone, without TV, without distraction. Just food and you.",
     "practice": ["Pick one meal — any meal.",
                  "No screens. No reading. No conversation.",
                  "Chew slowly. Taste each bite.",
                  "Notice when you are full."],
     "duration_min": 20, "reflection": "When did fullness arrive — earlier or later than usual?", "is_premium": True},
    {"day": 19, "week_key": "rest", "week_number": 3, "title": "A small fast",
     "body": "Skip one thing today — sugar, caffeine, news, social media. Notice the gap.",
     "practice": ["Choose one habit to skip for the day.",
                  "When the urge comes, breathe through it.",
                  "Write down what the urge feels like.",
                  "Read your note in the evening."],
     "duration_min": 10, "reflection": "What did the absence reveal?", "is_premium": True},
    {"day": 20, "week_key": "rest", "week_number": 3, "title": "An afternoon nap, on purpose",
     "body": "Twenty minutes of intentional rest. Not because you crashed — because you chose to.",
     "practice": ["Find a quiet space.",
                  "Set a 20-minute timer.",
                  "Lie down. Cover your eyes.",
                  "Rest, even if sleep doesn't come."],
     "duration_min": 25, "reflection": "What did chosen rest feel like — different from forced rest?", "is_premium": True},
    {"day": 21, "week_key": "rest", "week_number": 3, "title": "Closing the rest week",
     "body": "Three weeks in. Today, an hour of slowness — a long walk, a long bath, a long nothing.",
     "practice": ["Pick one slow activity for an hour.",
                  "No agenda. No goal. No measurement.",
                  "Notice how your shoulders shift over the hour.",
                  "Thank yourself when it ends."],
     "duration_min": 60, "reflection": "What did my body remember when nothing was urgent?", "is_premium": True},
]

# ── Week 4 — Presence (being here, now) ────────────────────────────
WEEK_4_PRESENCE = [
    {"day": 22, "week_key": "presence", "week_number": 4, "title": "Five senses anchor",
     "body": "When the mind spins, the senses bring you home. Today we use all five as an anchor.",
     "practice": ["Name five things you see.",
                  "Name four things you hear.",
                  "Name three things you can touch.",
                  "Name two things you smell.",
                  "Name one thing you taste."],
     "duration_min": 4, "reflection": "Where did my mind go before the anchor pulled it back?", "is_premium": True},
    {"day": 23, "week_key": "presence", "week_number": 4, "title": "A walk with eyes",
     "body": "Today's walk is for the eyes. Not for the destination, not for the steps — for what you see.",
     "practice": ["Take a ten-minute walk.",
                  "Look for things you have never noticed.",
                  "Find five small details.",
                  "Take none of them home."],
     "duration_min": 10, "reflection": "What was the smallest thing I noticed?", "is_premium": True},
    {"day": 24, "week_key": "presence", "week_number": 4, "title": "The one-task hour",
     "body": "An hour of doing one thing. Not multitasking. Not switching. Just one thing.",
     "practice": ["Pick one task.",
                  "Close every other tab, app, or door.",
                  "Work for one hour, only on this.",
                  "Notice the quality of what you made."],
     "duration_min": 60, "reflection": "How was the result different from when I split my attention?", "is_premium": True},
    {"day": 25, "week_key": "presence", "week_number": 4, "title": "What did my body do for me today?",
     "body": "Body Neutrality begins here — not 'how do I look', but 'what did this body do for me'.",
     "practice": ["At day's end, write three lines.",
                  "Line one: my body helped me ___.",
                  "Line two: my body carried me through ___.",
                  "Line three: my body asks for ___ tomorrow."],
     "duration_min": 6, "reflection": "What did my body ask for — and will I give it?", "is_premium": True},
    {"day": 26, "week_key": "presence", "week_number": 4, "title": "The inner room",
     "body": "When the outer world is loud, the body holds an inner room. Today we visit it.",
     "practice": ["Close your eyes.",
                  "Imagine a small room inside your chest.",
                  "Walk into it. Describe it to yourself.",
                  "Stay there for five minutes."],
     "duration_min": 7, "reflection": "What does my inner room look like?", "is_premium": True},
    {"day": 27, "week_key": "presence", "week_number": 4, "title": "A letter to your body",
     "body": "Tomorrow is the last day. Tonight, write a short letter to your body — the way you'd write to a friend.",
     "practice": ["Take pen and paper.",
                  "Write: 'Dear body…'",
                  "Tell it what you've learned in 27 days.",
                  "End with: 'Thank you.'"],
     "duration_min": 15, "reflection": "What did I say that I had never said before?", "is_premium": True},
    {"day": 28, "week_key": "presence", "week_number": 4, "title": "The Temple is yours",
     "body": "Twenty-eight days. Four keys. One body. The temple was always yours — now you have the keys.",
     "practice": ["Sit comfortably. Hand on heart.",
                  "Take seven slow breaths.",
                  "Touch your face gently.",
                  "Say silently: 'I am at home in this body.'",
                  "Choose one practice from these 28 days to keep, daily, forever."],
     "duration_min": 10, "reflection": "Which practice will I keep — and why?", "is_premium": True},
]


BODY_TEMPLE_DAYS: List[Dict[str, Any]] = (
    WEEK_1_BREATHING + WEEK_2_TOUCH + WEEK_3_REST + WEEK_4_PRESENCE
)

BODY_TEMPLE_WEEKS = {
    "breathing": {
        "key": "breathing", "number": 1,
        "title": "The First Key — The Breath",
        "subtitle": "The body's oldest prayer.",
        "blurb": "Seven days of listening to the one companion you've had since birth. The long exhale teaches the body it is safe.",
        "icon": "Wind",
        "color": "#B69F7E",
    },
    "touch": {
        "key": "touch", "number": 2,
        "title": "The Second Key — Listening to the Armor",
        "subtitle": "Coming home to your own skin.",
        "blurb": "The first touch is the one you give yourself. Seven days of gentle, deliberate contact with the body that carries you.",
        "icon": "Hand",
        "color": "#C9866B",
    },
    "rest": {
        "key": "rest", "number": 3,
        "title": "The Third Key — The Radical Pause",
        "subtitle": "The fast from noise.",
        "blurb": "Not sleep — chosen rest. Seven days of skipping one small thing each day, so the body can hear itself again.",
        "icon": "Moon",
        "color": "#7BA888",
    },
    "presence": {
        "key": "presence", "number": 4,
        "title": "The Fourth Key — Coming Home to the Body",
        "subtitle": "Being here, now, in this body.",
        "blurb": "Seven days of returning home. The temple was always yours — these are the final keys.",
        "icon": "Compass",
        "color": "#9B7BA8",
    },
}

BODY_TEMPLE_PRICE_USD = 39
BODY_TEMPLE_TOTAL_DAYS = 28


def get_day(day: int) -> Dict[str, Any] | None:
    for d in BODY_TEMPLE_DAYS:
        if d["day"] == day:
            return d
    return None


def get_week_days(week_key: str) -> List[Dict[str, Any]]:
    return [d for d in BODY_TEMPLE_DAYS if d["week_key"] == week_key]


def course_overview() -> Dict[str, Any]:
    return {
        "title": "The Body Architecture",
        "subtitle": "A 28-day walk through the four ancient keys.",
        "blurb": "Four weeks. The breath, the armor, the radical pause, and coming home. Soft, never clinical. Yours forever, after one unlock.",
        "price_usd": BODY_TEMPLE_PRICE_USD,
        "total_days": BODY_TEMPLE_TOTAL_DAYS,
        "weeks": list(BODY_TEMPLE_WEEKS.values()),
    }
