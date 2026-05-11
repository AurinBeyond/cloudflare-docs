"""
six_nights_seed.py — canonical Aurin-voice content for the Six Nights
reflection journey. Seeded into MongoDB once (idempotent on `night_number`).

Each night follows the same shape:
  - night_number      : 1..6
  - title             : short, evocative, never advice-shaped
  - intro             : one quiet sentence
  - body_markdown     : 1100-1500 chars, prose, no headings
  - question          : single question, layered
  - closing_note      : one or two short permission-giving lines
  - signature         : "Aurin"
  - published         : True
  - created_at        : ISO timestamp at seed time

Tone anchor: Brené Brown undefended + Mary Oliver in prose +
Tara Westover naming what could not be named. Never coaching, never
advice-shaped, never bestseller-corporate. The wanderer must feel
the words could appear in a book they would underline.
"""
from __future__ import annotations
from datetime import datetime, timezone
import logging

logger = logging.getLogger(__name__)


SIX_NIGHTS_CONTENT = [
    # ------------------------------------------------------------------
    # NIGHT 1 — already canonical, kept here as the tuning fork.
    # ------------------------------------------------------------------
    {
        "night_number": 1,
        "title": "Whose tune did you dance to today?",
        "intro": "A quiet way to find what's been pulling at your sleeve.",
        "body_markdown": (
            "You did not start out wanting to please anyone.\n\n"
            "When you were small, your body knew. When the food was enough, your mouth closed. "
            "When a hug was unwanted, you stiffened. When a voice frightened you, you cried. "
            "None of it was rude. None of it was wrong. It was the language your body was given to keep you safe.\n\n"
            "Then someone said *eat one more spoon*. Someone said *kiss your aunt, don't be silly*. "
            "Someone said *don't make a scene*. And slowly, line by line, a different language was "
            "written over the top of yours. A polite one. A useful one. One that kept the room calm.\n\n"
            "By the time you were grown, you had two languages running at once — the body's old quiet *no*, "
            "and the learned cheerful *yes*. Most days the cheerful one wins. The body files its complaints "
            "in headaches, in tight shoulders, in the third coffee, in the silence on the drive home.\n\n"
            "This is not a moral failure. This is what a careful child becomes when no one teaches her "
            "that her *no* is sacred too."
        ),
        "question": "Whose tune did you dance to today — and what did your body say about it?",
        "closing_note": (
            "You don't have to do anything with the answer tonight. Just notice. Tomorrow there will be "
            "one more question, and after the sixth, you'll have a small map of where your *yes* and "
            "your *no* actually live."
        ),
        "signature": "Aurin",
        "published": True,
    },
    # ------------------------------------------------------------------
    # NIGHT 2 — the switch.
    # ------------------------------------------------------------------
    {
        "night_number": 2,
        "title": "The switch you didn't know you had",
        "intro": "Forgiveness is not a verdict. It is a switch.",
        "body_markdown": (
            "You are not asked to forgive what was done to you.\n\n"
            "You are not asked to forgive the parent who fed you against your body's quiet *no*. "
            "The voice that called you ungrateful for crying. The hand that took what wasn't given. "
            "The boss who treated your time like his. The household that taught you money was either "
            "dirty or never enough. The lover who shaped you into a softer, smaller version of yourself "
            "and said *that's just how love works*.\n\n"
            "None of that was right. None of it deserves a polished apology dressed up as your peace.\n\n"
            "Forgiveness is not a verdict. It is a **switch**.\n\n"
            "It is the small private moment, usually late, usually alone, when you decide that the "
            "energy you have been spending on staying loyal to the wound is energy you would rather "
            "spend on the rest of your life. Not because the wound stopped mattering. Because you "
            "started mattering more.\n\n"
            "The body, when this switch is flipped, does something noticeable. The shoulders come down "
            "a half-inch. The breath finds the bottom of the lungs again. Some people cry. Most people "
            "just feel quieter, the way a room feels after a hum has stopped — you didn't know it was "
            "there until it left.\n\n"
            "You don't have to make a list. You don't have to confront anyone. You don't even have to "
            "mean it perfectly. You just have to stop pretending that the only way to honour what "
            "happened is to keep carrying it."
        ),
        "question": (
            "What is one piece of the past you are tired of carrying — and would you let yourself put "
            "it down for one single night, just to see what your body does without it?"
        ),
        "closing_note": (
            "Not forever. Not as a promise. Just for tonight. If the body says *yes* — even quietly — "
            "that is the switch."
        ),
        "signature": "Aurin",
        "published": True,
    },
    # ------------------------------------------------------------------
    # NIGHT 3 — the loneliness no one names.
    # ------------------------------------------------------------------
    {
        "night_number": 3,
        "title": "The loneliness no one names",
        "intro": "Some nights it is not sadness. It is just no one in the room with you, even when there is.",
        "body_markdown": (
            "There is a loneliness everyone talks about — the empty apartment, the unanswered "
            "message, the table set for one. That kind has a shape. You can name it.\n\n"
            "The other kind is harder. It is the loneliness that visits you at a full table. In a "
            "long marriage. In a room of people who love you. You laugh, you pass the salt, you ask "
            "about the children. And underneath it all, a small still voice says *no one in this "
            "room knows me anymore*. Sometimes it whispers *no one in this room ever did*.\n\n"
            "This is not a complaint about other people. It is the quiet bill that comes due when "
            "you have spent years translating yourself for everyone — softening the edges, swallowing "
            "the sentence that would have cost too much, laughing at the joke you did not find funny. "
            "Each small translation is a coin. After enough years, you have paid out the whole purse, "
            "and what is left inside is a person no one in your life has actually met.\n\n"
            "The body knows long before the mind admits it. It is the heaviness when the door closes "
            "behind the last guest. The relief, almost embarrassing, of being alone in the car. The "
            "strange grief that arrives at family dinners, where everything looks right.\n\n"
            "You are not broken for feeling this. You are simply telling yourself the truth a beat "
            "before everyone else does. Most people in your life are also lonely in this way. They "
            "just haven't sat with it long enough to recognise it."
        ),
        "question": (
            "Where, in your life, are you most lonely in a room full of people — and what part of "
            "you stopped speaking, somewhere along the way, to make that room calm?"
        ),
        "closing_note": (
            "You don't have to fix the room tonight. Just let yourself notice that you are the one "
            "who knows. That noticing is not the wound. That noticing is the way home."
        ),
        "signature": "Aurin",
        "published": True,
    },
    # ------------------------------------------------------------------
    # NIGHT 4 — the inheritance you did not sign for (money).
    # ------------------------------------------------------------------
    {
        "night_number": 4,
        "title": "The inheritance you did not sign for",
        "intro": "Most of what you believe about money was written into you before you could read.",
        "body_markdown": (
            "The first sentences you learned about money were not yours. They were said over your head "
            "while you played on the kitchen floor. *We can't afford it.* *Money doesn't grow on trees.* "
            "*Rich people are dishonest.* *A woman shouldn't ask for more.* They were said with worry "
            "in the voice, or with bitterness, or with the kind of flat finality that closes a door "
            "in a child's chest.\n\n"
            "You did not agree to any of it. You also did not have a choice. You were small, and the "
            "voices were the weather, and you learned to dress for the weather.\n\n"
            "Years later, the weather is still inside you. Money arrives, and a part of you flinches. "
            "An invoice goes unsent. A price gets quoted lower than it should. A windfall lands and "
            "you spend it back to zero before the week ends — not because you are foolish, but because "
            "a child somewhere inside you cannot relax around a number that big. The body does not "
            "trust what the mother could not trust.\n\n"
            "This is not a moral problem. It is an inherited contract you signed in invisible ink. "
            "And inherited contracts can be set down. The switch is the same one as the night before — "
            "small, private, late. *I am no longer the bookkeeper for someone else's fear.* You do "
            "not have to renounce your family. You only have to stop paying interest on a debt that "
            "was never yours.\n\n"
            "Abundance, when it begins, is rarely loud. It is the first quote you send at the right "
            "price without apology. The first invoice you let yourself open the day it arrives. The "
            "first time the body does not flinch when good news lands."
        ),
        "question": (
            "What was the loudest sentence about money in the house you grew up in — and which of "
            "your own habits today is still loyal to it?"
        ),
        "closing_note": (
            "You don't have to fix your finances tonight. Just notice the inherited sentence, and let "
            "yourself say, quietly: *I am allowed to write a different one.*"
        ),
        "signature": "Aurin",
        "published": True,
    },
    # ------------------------------------------------------------------
    # NIGHT 5 — the child inside, the child beside.
    # ------------------------------------------------------------------
    {
        "night_number": 5,
        "title": "The child inside, the child beside",
        "intro": "Some of the work done quietly tonight is for a child who is already grown — and one who is not.",
        "body_markdown": (
            "There are two children in the room with you tonight, even if you live alone.\n\n"
            "The first is the one you used to be. She is not a memory. She is closer to a tenant "
            "who never moved out. She still flinches when the voice in your head sounds like the "
            "voice that frightened her at six. She still works hard for love because she learned "
            "early that love came with conditions. Most of what looks like adult panic in your week "
            "is her, asking the only way she knows how, *am I safe here?*\n\n"
            "The second is the child beside you — the one you are raising, or the one you are aunt "
            "to, or the one you teach, or the one whose small face passed you in the corridor today "
            "and softened your jaw without permission. Children read faces faster than they read "
            "words. Whatever you have not yet softened in yourself, they pick up from your shoulders "
            "in the morning. Whatever you have softened, they pick up too. They are honest little "
            "instruments. They do not lie about what they feel in a room.\n\n"
            "The astonishing thing is that the two children are connected. The day you speak to your "
            "own younger self with more gentleness, the child in the next room sleeps better that "
            "night. The hand you place on your own chest in the dark is also, somehow, on theirs. "
            "The boundary you finally hold for yourself becomes the boundary they learn is allowed "
            "to exist.\n\n"
            "You are not raising children. You are raising the quiet voice they will speak to "
            "themselves with for the rest of their lives. And that voice, before it was theirs, "
            "was yours."
        ),
        "question": (
            "What did the small version of you most need to hear, that no one said — and could you, "
            "tonight, say it once, aloud or silently, to her, and then to the child nearest to you?"
        ),
        "closing_note": (
            "You don't have to be a different parent tomorrow. Just let one true sentence travel "
            "from you to her, and from her to them. That is the whole inheritance."
        ),
        "signature": "Aurin",
        "published": True,
    },
    # ------------------------------------------------------------------
    # NIGHT 6 — coming home to yourself (closing).
    # ------------------------------------------------------------------
    {
        "night_number": 6,
        "title": "The room where you arrive",
        "intro": "There is a small room inside you that has been waiting, quietly, for you to walk in.",
        "body_markdown": (
            "You have spent five nights noticing things.\n\n"
            "You noticed whose tune you have been dancing to. You noticed the switch that does not "
            "require anyone's permission. You noticed the loneliness that visits you at full tables. "
            "You noticed the inherited sentences about money you never signed for. You noticed the "
            "child who never moved out, and the child who reads your shoulders before breakfast. "
            "None of it has been undone. That is not how this works.\n\n"
            "What has been undone is your willingness to keep pretending you didn't know.\n\n"
            "Tonight there is no question that requires a brave answer. There is only a small room "
            "inside you that has been waiting, quietly, for you to walk in. It has always been there. "
            "You used to find it as a child, on the floor of your bedroom, on a long walk home, in a "
            "moment when no one was watching. Then life got loud and you forgot the door was unlocked.\n\n"
            "The door has always been unlocked.\n\n"
            "Inside the room, nothing is asked of you. Your work is not on the shelf there. Your "
            "history is not pinned to the wall. There is a chair, and the chair is for you. There is "
            "light, and the light does not flicker. There is a stillness, and the stillness was not "
            "earned — it was waiting.\n\n"
            "If you can sit in this room for one breath, it is enough. If you can sit for five "
            "breaths, the rest of your life will be slightly different by morning. Not because "
            "anything outside has changed. Because the person walking back into the day will be the "
            "one who finally remembered where she lived."
        ),
        "question": (
            "If you let yourself sit in the small room inside you for one full breath tonight, "
            "what is the first thing the room would say back to you, without words?"
        ),
        "closing_note": (
            "This is the end of the six nights, and the beginning of something quieter. You are not "
            "different tonight. You are simply harder to lie to. Welcome home."
        ),
        "signature": "Aurin",
        "published": True,
    },
]


async def seed_six_nights(db) -> int:
    """Idempotent upsert of all 6 nights into db.six_nights.

    Existing rows are updated with the latest canonical text (so iterating
    on the prose only requires editing this file). Returns count of rows
    written or updated.
    """
    written = 0
    for night in SIX_NIGHTS_CONTENT:
        doc = dict(night)
        doc["created_at"] = datetime.now(timezone.utc).isoformat()
        await db.six_nights.update_one(
            {"night_number": doc["night_number"]},
            {"$set": doc},
            upsert=True,
        )
        written += 1
    # Remove any duplicate legacy rows (older docs without night_number).
    purged = await db.six_nights.delete_many({"night_number": {"$exists": False}})
    if purged.deleted_count:
        logger.info("Purged %d legacy six_nights rows", purged.deleted_count)
    logger.info("Six Nights seed complete: %d nights present.", written)
    return written
