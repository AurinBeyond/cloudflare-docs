"""
swap_alistair_letters.py — replace SEED_COURSES letters for course
`letting-the-old-stories-rest` with the v2 sharp-tone rewrites.

Idempotent. Safe to run multiple times. Only touches the one course.

Strategy:
    1. Read /app/backend/server.py
    2. Locate the slug entry "letting-the-old-stories-rest" inside SEED_COURSES.
    3. Replace the value of "letters" with NEW_LETTERS below.
    4. Write back. Backend hot-reloads on save.
"""
import re
from pathlib import Path

SERVER = Path("/app/backend/server.py")

NEW_LETTERS = [
    {
        "day": 1,
        "title": "The line you didn't write",
        "body": (
            "You're 38. You're on a Zoom call. Your boss says something that lands in your chest in a way that's much heavier than the actual sentence deserved.\n\n"
            "Half a second later, before you can stop it, you hear yourself reply in a voice that isn't quite yours. Slightly too apologetic. Slightly too quick to agree. Slightly too small.\n\n"
            "That voice came from somewhere. You didn't write it.\n\n"
            "Most of what you call your personality was loaded at boot by people who were tired, or scared, or grieving inside a body that had to keep moving. They handed you a script. You memorised it before you knew you had a choice.\n\n"
            "This week is about naming one of those lines. Not changing it yet. Just seeing that it exists.\n\n"
            "**Today's input:**\n"
            "Write down one sentence you find yourself saying, or thinking, that you suspect isn't actually yours. The kind of line that comes out too fast to be examined.\n\n"
            "Don't analyse it. Don't try to \"release\" anything. Just see it on the page in your own handwriting.\n\n"
            "That single act — writing the line down so it's no longer running in the background — is the entire job today.\n\n"
            "The next letter arrives in 24 hours."
        ),
        "prompt": "What line do I find myself saying that doesn't sound like me?",
    },
    {
        "day": 2,
        "title": "The hands that gave it to you",
        "body": (
            "You wrote the line down yesterday.\n\n"
            "Now look at it. Read it slowly. Where did you learn that exact sentence?\n\n"
            "For most of us, it's not abstract. It's a specific person, in a specific room, who said something — or repeated something, or silently expected something — and you absorbed it before you had language to push back.\n\n"
            "Today is not about blaming that person. Most of the people who handed you these lines were carrying scripts of their own that they had also not written.\n\n"
            "What today is about: shrinking the line from mythic to human-sized.\n\n"
            "A line that comes from \"the universe\" or \"just how I am\" stays in charge of you. A line that comes from one specific tired person in one specific room is the size of one tired person in one specific room. It can be put down.\n\n"
            "**Today's input:**\n"
            "Beside yesterday's line, write one more sentence:\n\n"
            "*This line was handed to me by ___, who at the time was carrying ___.*\n\n"
            "That's it. Two sentences total on the page. You're not forgiving anyone. You're just downsizing the line so it stops being a god.\n\n"
            "24 hours."
        ),
        "prompt": "Who handed me this line, and what were they carrying at the time?",
    },
    {
        "day": 3,
        "title": "What it has cost you to keep carrying",
        "body": (
            "Every inherited line has a bill.\n\n"
            "Sometimes the bill is paid in a relationship that bent because you couldn't say a thing. Sometimes it's paid in a job you took because the line told you the better one was \"not for people like you.\" Sometimes it's paid in the body — the shoulder that locks up before a difficult email, the breath you stop taking when your phone buzzes.\n\n"
            "You've been paying this bill for years without anyone ever showing you the receipt.\n\n"
            "This isn't about getting angry. Anger is fine if it shows up, but that's not the task. The task is to look at the cost honestly and let yourself know it.\n\n"
            "The reason this matters: as long as the cost is invisible, the line feels free to carry. The moment the cost is visible, the body starts asking a different question — *do I still want to pay this?*\n\n"
            "**Today's input:**\n"
            "One line. Where in your life has this script cost you the most?\n\n"
            "Career? Body? Specific relationship? The version of yourself you haven't allowed?\n\n"
            "Pick one. Write it down. Don't fix it. Just see the receipt.\n\n"
            "24 hours."
        ),
        "prompt": "Where in my life has this line cost me the most?",
    },
    {
        "day": 4,
        "title": "The ending you weren't shown",
        "body": (
            "The line you've been carrying came with an ending attached.\n\n"
            "The ending is usually a wall. *People like me don't get this.* *This kind of love eventually leaves.* *If I'm too much, they'll go.* *I'll always be the one who has to manage.*\n\n"
            "The wall feels like a fact. It isn't. It's a sentence someone said in a room when you were small, repeated until your body started budgeting around it.\n\n"
            "For tonight only: imagine the wall is a curtain.\n\n"
            "Behind the curtain, the same story, the same you, but the line at the end bends a little kinder. Not magical. Not denial. Just a softer landing.\n\n"
            "What does that look like? Even faintly?\n\n"
            "**Today's input:**\n"
            "Write the old ending in one sentence.\n\n"
            "Beside it, write three alternative endings. Not \"good\" ones. Just *different* ones. The exercise is to prove to your nervous system that the old ending isn't the only ending physics will allow.\n\n"
            "Choose one of the three. Keep company with it this week. You don't have to commit to it. Just don't reject it.\n\n"
            "24 hours."
        ),
        "prompt": "What is one alternative ending I am willing to keep company with?",
    },
    {
        "day": 5,
        "title": "Release without rejection",
        "body": (
            "You don't have to hate the line to put it down.\n\n"
            "That's a trap a lot of people fall into around now. They start to see the script and the natural reflex is *I should have known better, I was an idiot, this whole part of my life is wasted.*\n\n"
            "That reflex is itself an inherited line. Watch it. Don't follow it.\n\n"
            "The story you've been carrying did a job once. The 7-year-old version of you picked it up because the room they were in required them to. That kid wasn't stupid. They were surviving.\n\n"
            "What you're doing now is different. You're an adult. The room is different. The job the script did then is no longer the job that needs doing now. You can thank it and walk on.\n\n"
            "**Today's input:**\n"
            "Write a one-line \"thank you\" to the script.\n\n"
            "*Thank you, [story], for keeping me [what it protected].*\n\n"
            "Then a second line:\n\n"
            "*I'm ready to walk on because [what's true now that wasn't then].*\n\n"
            "That's the whole letter today. Two lines on a page. Not a vow. Not a manifesto. A receipt.\n\n"
            "24 hours."
        ),
        "prompt": "What would I thank this line for, before walking on?",
    },
    {
        "day": 6,
        "title": "The space that opens",
        "body": (
            "When you set down a story you've been carrying for 20 years, the first thing you'll feel is not relief.\n\n"
            "You'll feel weird. Unmoored. Strangely bored. Slightly anxious in a way you can't name. Some people describe it as walking around a house that's been remodelled while they slept.\n\n"
            "Don't fix it.\n\n"
            "The instinct will be to immediately fill the space with another project, another story, another self-improvement loop. *Now that I've put this down, I should start [new thing] right away.* Resist that, gently.\n\n"
            "The space is the medicine. The discomfort is the body learning a new shape. If you fill it too fast, you've just swapped one borrowed line for another.\n\n"
            "What to do instead: notice. For the next 24 hours, when the urge to fill the space arrives, name it (\"the filling urge is here right now\"), and let it pass without acting on it.\n\n"
            "**Today's input:**\n"
            "Sit somewhere quiet for 5 minutes today and do nothing.\n\n"
            "Not meditate. Not breathe deliberately. Not \"be present.\" Just sit in the new shape and let the body get used to it.\n\n"
            "If 5 minutes feels too long, do 90 seconds. The duration is not the point. The honest emptiness is.\n\n"
            "24 hours."
        ),
        "prompt": "What did I notice when I sat in the space without filling it?",
    },
    {
        "day": 7,
        "title": "What you take with you",
        "body": (
            "You started this week with a single line you didn't write.\n\n"
            "You've now:\n"
            "- Named it\n"
            "- Sized it down to one human's room\n"
            "- Counted what it cost\n"
            "- Imagined a softer ending\n"
            "- Thanked it and put it down\n"
            "- Sat in the empty space without filling it\n\n"
            "That's the entire architecture of letting an old story rest.\n\n"
            "You'll need to run it again. Not because this one didn't work, but because the human mind has more than one inherited line. Most of us have a dozen. This is the protocol for releasing them, one at a time, on whatever cadence the body can hold.\n\n"
            "The other two sequences in this room handle adjacent vectors:\n\n"
            "→ **\"The language you forgot\"** — restoring the soft inner voice that the day-noise has been overwriting. Letter 1 free preview.\n\n"
            "→ **\"The body knows first\"** — the same work, run through the hardware instead of the cognitive layer. Letter 1 free preview.\n\n"
            "The bundle of all three is €39 (saves €36 vs. individual). Or stay with this one a while. There's no urgency.\n\n"
            "**Today's input:**\n"
            "Write one sentence: *The line I put down this week was ___.*\n\n"
            "Pin it somewhere you'll see it next month. Not because you'll need reminding. Because future-you should know what past-you released, and on what date.\n\n"
            "That's the whole work.\n\n"
            "Until the next room.\n\n"
            "— Alistair"
        ),
        "prompt": "The line I put down this week was…",
    },
]


def build_letters_python_block(letters: list) -> str:
    """Render the letters list as the exact Python source that should
    appear inside SEED_COURSES['letters'] = [...]."""
    out = []
    for L in letters:
        # body lines split across multiple "..." string literals concatenated
        body = L["body"]
        body_quoted = repr(body)  # safe string with escaping
        block = (
            "            {\n"
            f"                \"day\": {L['day']},\n"
            f"                \"title\": {L['title']!r},\n"
            f"                \"body\": (\n"
            f"                    {body_quoted}\n"
            f"                ),\n"
            f"                \"prompt\": {L['prompt']!r},\n"
            "            },"
        )
        out.append(block)
    return "\n".join(out)


def main():
    src = SERVER.read_text()
    # Find the course block by slug and replace its `letters` list.
    # Anchor on the slug line, then the `"letters": [` opening, then
    # match through to the matching closing `],` at the correct depth.
    slug_marker = '"slug": "letting-the-old-stories-rest"'
    if slug_marker not in src:
        raise SystemExit("Could not find slug marker in server.py")
    # Use a non-greedy regex that captures from `"letters": [` up to
    # the next dedented `],` (4 leading spaces, then `],`).
    pat = re.compile(
        r'("slug":\s*"letting-the-old-stories-rest".*?"letters":\s*\[\s*\n)'
        r'(.*?)'
        r'(\n        \],\n)',
        re.DOTALL,
    )
    m = pat.search(src)
    if not m:
        raise SystemExit("Regex did not match letter list block")
    head, _old, tail = m.group(1), m.group(2), m.group(3)
    new_block = build_letters_python_block(NEW_LETTERS)
    new_src = src[: m.start()] + head + new_block + tail + src[m.end() :]
    SERVER.write_text(new_src)
    print(f"OK — replaced letters for letting-the-old-stories-rest")
    print(f"     old block lines : {_old.count(chr(10))}")
    print(f"     new block lines : {new_block.count(chr(10))}")


if __name__ == "__main__":
    main()
