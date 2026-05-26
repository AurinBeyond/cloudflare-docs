"""
§KIDS-JOURNEY 2026-02-10 — 28-day stepping-stone journey for the Kids
Universe (Anna's directive: rada peab olema tegelik, mitte abstraktne).

Each age band has 28 short one-line "invitations" (Aurin's voice).
Day index for a user = days since user.created_at, clamped to 1..28.
Completed days = unique day indices where a kids_mood_checkin exists.
"""

from __future__ import annotations

JOURNEY_TOTAL_DAYS = 28


JOURNEY_MESSAGES: dict[str, list[str]] = {
    "parents-room": [
        # Week 1 — slow open
        "Day 1 — start where you are.",
        "Notice one small thing about your child you've never named before.",
        "What did your own parents teach you about feeling?",
        "A breath, longer than usual.",
        "Where in your day is the most rushing?",
        "Name one quality you keep trying to give your child.",
        "Rest is not a reward. It is a foundation.",
        # Week 2 — listening
        "What does your child do when they feel unsafe?",
        "What do you do when YOU feel unsafe?",
        "Ask less today. Listen more.",
        "Notice the moment before you react.",
        "What part of your child reminds you of you?",
        "A small kindness, given without reason.",
        "Sit beside them in silence today.",
        # Week 3 — recovery
        "Forgive yourself for one thing today.",
        "What's a story you tell yourself about being a parent?",
        "Is that story still true?",
        "Where did you learn to be hard on yourself?",
        "What would softness feel like, today?",
        "A walk, with no destination.",
        "Notice what your body has been carrying.",
        # Week 4 — integration
        "What's one boundary you keep meaning to set?",
        "Today, set it gently.",
        "Tell your child something you love about them — out loud.",
        "What would you tell your younger self today?",
        "Your child is watching how you treat yourself.",
        "Rest before tomorrow asks for you.",
        "Day 28 — one step closer to understanding yourself and your child.",
    ],
    "little-dreamers": [
        # Week 1 — gentle hello
        "A soft hello. Today, just be little.",
        "What did the morning sound like?",
        "A quiet hand-squeeze counts as brave.",
        "Notice one warm thing in the room.",
        "Tell Aurin one small wish.",
        "Was anything funny today?",
        "A rest is a kind of magic.",
        # Week 2 — small wonders
        "Find one colour you love.",
        "Whisper a thank-you to your pillow.",
        "What does happy feel like inside?",
        "A picture made from feelings.",
        "Hug someone slow today.",
        "A song with no words, just humming.",
        "A small kindness — for anyone.",
        # Week 3 — playful courage
        "What did your hands make today?",
        "Tell Aurin a tiny worry.",
        "Find one stone, one leaf, one cloud.",
        "Who made you feel safe today?",
        "A jump, a spin, a stretch.",
        "What if your toys had names?",
        "A quiet seat by a window.",
        # Week 4 — kept-safe
        "What did you learn this week?",
        "A small wave to the moon.",
        "Tell Aurin your favourite memory.",
        "A bedtime word for yourself.",
        "What kept you company today?",
        "A breath, in and out, like a star.",
        "Day 28 — you walked the whole soft path.",
    ],
    "explorers": [
        "Day 1 — open the door. I'm here.",
        "What was the first thing you noticed today?",
        "Tell me about a small adventure.",
        "Who did you help — even a little?",
        "A path you've never walked before.",
        "Did anything feel brave today?",
        "Quiet courage — name one.",
        "Build something with your hands.",
        "What sound did the wind make?",
        "Find three small treasures.",
        "Tell Aurin a wish you keep secret.",
        "A friend you'd like to know better.",
        "What questions live in your head?",
        "Make a tiny map of your day.",
        "What's a feeling you don't have a word for?",
        "Who was patient with you today?",
        "A small no, said gently.",
        "Pretend the trees are listening.",
        "What did your shoes see today?",
        "A door you'd open if you could.",
        "Tell me one big idea.",
        "Notice a kind face today.",
        "A puzzle you'd like to solve.",
        "What's worth keeping forever?",
        "A small dream — say it out loud.",
        "Make one quiet thing today.",
        "Look up. What's there?",
        "Day 28 — the explorer walked the whole path.",
    ],
    "dreamweavers": [
        "Day 1 — slow. There's no rush here.",
        "What's a thought you've been carrying?",
        "Name a feeling you don't usually name.",
        "Who would you like to understand more?",
        "Write three lines — anything.",
        "What's the quietest place you know?",
        "A small kindness — done without telling.",
        "Notice a beauty no one else sees.",
        "What's a question you can't answer yet?",
        "A choice you're proud of.",
        "Whisper a worry to the ceiling.",
        "What's an idea you're saving?",
        "A breath that takes longer than usual.",
        "What's loud in your week?",
        "What's soft in your week?",
        "Tell Aurin a dream you remember.",
        "A word in another language you love.",
        "Who feels far away today?",
        "Name three small good things.",
        "Make something only you would make.",
        "What's a story you'd like to keep?",
        "A small permission — to rest.",
        "Look at your hands. They've done a lot.",
        "Tell me a hope, even a small one.",
        "What's quietly growing in you?",
        "An old picture you'd like to draw again.",
        "A walking thought, no destination.",
        "Day 28 — the dreamweaver finished the soft path.",
    ],
}


def message_for_day(age_slug: str, day_index: int) -> str:
    """Return Aurin's one-line invitation for the given (age, day).

    `age_slug` accepts canonical kids slugs. Falls back to "explorers".
    `day_index` is 1-based; clamps to 1..28.
    """
    bank = JOURNEY_MESSAGES.get(age_slug) or JOURNEY_MESSAGES["explorers"]
    idx = max(1, min(int(day_index or 1), JOURNEY_TOTAL_DAYS))
    return bank[idx - 1]


def all_messages(age_slug: str) -> list[str]:
    return list(JOURNEY_MESSAGES.get(age_slug) or JOURNEY_MESSAGES["explorers"])
