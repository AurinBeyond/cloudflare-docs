#!/usr/bin/env python3
"""
queue_publer_sprint.py — Aurin-Hub 30-day omnichannel content sprint
optimised for Publer Free (LinkedIn + Bluesky, 5 bulks/day limit).

Channels in this sprint:
    linkedin — long-form, 3/week (Tue, Thu, Sun)
    bluesky  — short (≤300 chars), almost-daily

Total: 34 posts (12 LinkedIn, 22 Bluesky).

Dispatch strategy:
    /api/marketing/dispatch?all=true packs every queued post into ONE
    Publer bulk call, so the entire 30-day sprint consumes ONE bulk
    from the 5/day Free quota.

Voice rules (locked, see /app/memory/CONTENT_MASTER_LIBRARY.md):
    • "you" not "she/he" — reader is the protagonist
    • One concrete object per piece — a sock, a window, a cold tea
    • No wellness vocabulary — no "nervous system", "regulate",
      "grounded", "presence", "intentional"
    • Open with the reader's body, not the room
    • End with an image, never a conclusion
    • Bluesky: ≤300 chars hard limit; LinkedIn: 250-500 words

Idempotent: each post carries a unique `tag` so re-running creates
a NEW batch (it does NOT overwrite previously queued posts — drop
the marketing_queue collection to start fresh).

USAGE:
    # Dry run — print the payload, no API call
    python3 scripts/queue_publer_sprint.py --dry-run

    # Push to the live queue (then call /api/marketing/dispatch?all=true)
    python3 scripts/queue_publer_sprint.py

Environment:
    AURIN_API_URL    — defaults to REACT_APP_BACKEND_URL from frontend/.env
    AURIN_ADMIN_TOKEN — required, from backend/.env ADMIN_TOKEN
"""
from __future__ import annotations

import argparse
import json
import os
import sys
from datetime import datetime, timezone, timedelta
from pathlib import Path

import httpx
from dotenv import load_dotenv

load_dotenv("/app/backend/.env")


# ---------- Schedule helpers ----------

def at(day_offset: int, hour: int, minute: int = 0) -> str:
    """ISO timestamp at (tomorrow + day_offset), HH:MM UTC. Day 0 = tomorrow."""
    base = (datetime.now(timezone.utc) + timedelta(days=day_offset + 1)).replace(
        hour=hour, minute=minute, second=0, microsecond=0
    )
    return base.isoformat()


# ---------- 30-day Publer sprint ----------

# Cadence:
#   LinkedIn: Tue/Thu/Sun · 09:00 UTC          (12 posts over 30 days)
#   Bluesky:  daily-ish    · 08:00 or 18:00 UTC (22 posts)
#
# Themes rotate weekly:
#   Wk1 — Anti-wellness foundation
#   Wk2 — The 11pm parent (Hearth shelf)
#   Wk3 — The voice that isn't yours (Course Room / Alistair)
#   Wk4 — The garden in November + shelf-complete + family bundle

POSTS = [
    # ─────────────────────────── WEEK 1 ───────────────────────────
    # Theme: anti-wellness foundation. The category that sells you the
    # absence of the thing it promised to give you.

    # Day 1 (Tue) — LinkedIn opener
    {
        "channel": "linkedin",
        "tag": "publer_w1_d1_li_opener",
        "scheduled_at": at(0, 9, 0),
        "body": (
            "There is a quiet generation of people who have already cancelled "
            "the meditation app.\n\n"
            "They did not announce it. They did not write a post about it. "
            "They just stopped opening it one Tuesday in February and slowly "
            "realised, around April, that they had not missed the streak.\n\n"
            "What they are doing instead is older than wellness. Older than "
            "wellness by about three thousand years.\n\n"
            "They are sitting in a kitchen at 11pm with the kettle on. They "
            "are reading a paper book in a chair that does not have a USB "
            "port. They are walking from the office to the train without "
            "putting in the headphones.\n\n"
            "They are noticing — without buying anything, without "
            "subscribing to anything, without earning a badge for it — that "
            "their own evening has been here the whole time.\n\n"
            "I have been quietly building a website for these people. "
            "No login. No streak. No notifications. One short audio story "
            "per shelf, read in a single take.\n\n"
            "It is at prulesoul.site if anyone has been looking for "
            "the opposite of an app.\n\n"
            "Curious — what was the last subscription you cancelled and "
            "did not miss?"
        ),
    },
    # Day 1 (Tue) — Bluesky soft echo (evening)
    {
        "channel": "bluesky",
        "tag": "publer_w1_d1_bs_echo",
        "scheduled_at": at(0, 18, 0),
        "body": (
            "The most useful thing you have done for your own attention "
            "this year almost certainly did not require buying anything.\n\n"
            "Try to remember what it was."
        ),
    },

    # Day 2 (Wed) — Bluesky only
    {
        "channel": "bluesky",
        "tag": "publer_w1_d2_bs_kettle",
        "scheduled_at": at(1, 8, 0),
        "body": (
            "The kettle is older than the meditation app by about 3,000 "
            "years and has a higher completion rate.\n\n"
            "Put it on."
        ),
    },

    # Day 3 (Thu) — LinkedIn medium piece
    {
        "channel": "linkedin",
        "tag": "publer_w1_d3_li_streaks",
        "scheduled_at": at(2, 9, 0),
        "body": (
            "The streak counter is not a feature.\n\n"
            "It is the product.\n\n"
            "You paid €15 a month for an app whose job was to make you sit "
            "quietly for 10 minutes. Some weeks you did. Most weeks you did "
            "not, and the small red number in the corner became the loudest "
            "thing in your evening.\n\n"
            "Sit quietly. Get punished for missing Tuesday. Sit quietly. "
            "Try to make up for Tuesday by sitting twice as long Wednesday. "
            "Realise you cannot make up for Tuesday. Open the app on "
            "Saturday and discover the number has reset.\n\n"
            "This is not a calm relationship with your own attention. This "
            "is a slot machine wearing the costume of self-care.\n\n"
            "The notebook does not have a streak counter. The notebook does "
            "not know if you missed Tuesday. The notebook does not care.\n\n"
            "The notebook has been doing this job, quietly, since the "
            "Romans."
        ),
    },
    # Day 3 (Thu) — Bluesky pair
    {
        "channel": "bluesky",
        "tag": "publer_w1_d3_bs_notebook",
        "scheduled_at": at(2, 18, 30),
        "body": (
            "The notebook does not know it is Tuesday. The notebook does "
            "not care that you missed yesterday. The notebook has been "
            "available, quietly, since the Romans."
        ),
    },

    # Day 4 (Fri) — Bluesky only
    {
        "channel": "bluesky",
        "tag": "publer_w1_d4_bs_subscriptions",
        "scheduled_at": at(3, 8, 0),
        "body": (
            "Cancel one €15/month subscription this week and put the €15 "
            "in a glass jar on the kitchen counter.\n\n"
            "By December the jar will hold roughly the cost of a long "
            "weekend away with no notifications."
        ),
    },

    # Day 6 (Sun) — LinkedIn weekend confession
    {
        "channel": "linkedin",
        "tag": "publer_w1_d6_li_confession",
        "scheduled_at": at(5, 10, 0),
        "body": (
            "Yesterday I deleted four wellness apps off my phone.\n\n"
            "It was an unceremonious afternoon. I did not light a candle. I "
            "did not declare an intention. I held the phone in the kitchen "
            "while the dishwasher was running and tapped 'remove' four "
            "times in a row.\n\n"
            "What I noticed afterwards, sitting on the kitchen step in "
            "thin afternoon light:\n\n"
            "→ The phone became lighter, but only in the way furniture "
            "becomes lighter when you take down three pictures.\n\n"
            "→ The afternoon expanded by about twenty minutes that I had "
            "previously spent re-reading the same 'mindful moment' "
            "notification.\n\n"
            "→ Nobody noticed. The world did not call to check. The apps "
            "did not email asking if I was alright.\n\n"
            "I had been measuring my own peace by the streaks of "
            "products that sell me peace. I had been letting four "
            "small companies decide whether I was doing my own evening "
            "correctly.\n\n"
            "It is interesting to discover, in your forties, that you can "
            "just stop.\n\n"
            "(If anyone else is on the verge of doing this — the door "
            "is open at prulesoul.site. No subscription. No notifications. "
            "No streak counter. A single audio story, read in one take.)"
        ),
    },
    # Day 6 (Sun) — Bluesky echo
    {
        "channel": "bluesky",
        "tag": "publer_w1_d6_bs_delete",
        "scheduled_at": at(5, 19, 0),
        "body": (
            "Deleted four wellness apps this afternoon. Nothing dramatic "
            "happened. The kettle still works. The cat still wants dinner. "
            "The phone is somehow lighter."
        ),
    },

    # ─────────────────────────── WEEK 2 ───────────────────────────
    # Theme: the 11pm parent. The Hearth shelf is now five-stories-complete.

    # Day 8 (Tue) — LinkedIn — Hearth shelf complete announcement (soft)
    {
        "channel": "linkedin",
        "tag": "publer_w2_d8_li_hearth_complete",
        "scheduled_at": at(7, 9, 0),
        "body": (
            "It is 11pm. Your kid is finally asleep. You sit down in the "
            "kitchen. You realise you haven't eaten lunch.\n\n"
            "This was the opening line that became a five-story shelf.\n\n"
            "Over the last three weeks I quietly recorded five short "
            "evening stories for the parent who is sitting in their own "
            "kitchen at 11pm. One sock on the stairs. One light in the "
            "hallway. One coat on a chair. One window left open. One "
            "garden in November.\n\n"
            "There is no music. There are no bells. No 'session "
            "complete' chime. The voice is mine, read in one unhurried "
            "take, with one full second of silence padded at each end so "
            "you can find the volume before the story starts and you can "
            "still hear nothing after it finishes.\n\n"
            "Each one is about seven minutes. The shape of an evening "
            "exhale.\n\n"
            "The first story is free at prulesoul.site/listen/hearth — "
            "the others live behind a single €19 door (lifetime, no "
            "subscription, no follow-up).\n\n"
            "If you have a teenager who is starting to be cold without "
            "telling you about it, the third one might find you."
        ),
    },
    # Day 8 (Tue) — Bluesky
    {
        "channel": "bluesky",
        "tag": "publer_w2_d8_bs_eleven",
        "scheduled_at": at(7, 18, 30),
        "body": (
            "It is 11pm. Your kid is finally asleep. You sit down in the "
            "kitchen. You realise you haven't eaten lunch.\n\n"
            "Five quiet stories for that exact hour at "
            "prulesoul.site/listen/hearth"
        ),
    },

    # Day 9 (Wed) — Bluesky only
    {
        "channel": "bluesky",
        "tag": "publer_w2_d9_bs_sock",
        "scheduled_at": at(8, 8, 0),
        "body": (
            "Parenting isn't a project with a finish line. It's a season "
            "you stay inside.\n\n"
            "The sock on the stairs will still be there tomorrow. Sit down."
        ),
    },

    # Day 10 (Thu) — LinkedIn — the coat story
    {
        "channel": "linkedin",
        "tag": "publer_w2_d10_li_coat",
        "scheduled_at": at(9, 9, 0),
        "body": (
            "Your 14-year-old has not worn that coat in two weeks.\n\n"
            "You sit at the kitchen table and look at it on the chair, "
            "and you suddenly realise something that hits in a specific "
            "place under your ribs:\n\n"
            "He is becoming someone who is going to be cold without "
            "telling you about it.\n\n"
            "Not on purpose. Not because he doesn't love you. Just "
            "because that is the shape of becoming a person.\n\n"
            "You used to know when he was cold before he did. You'd see "
            "him from across a playground and your hand would already be "
            "reaching for an extra layer in the bag. You were the "
            "early-warning system for his small body. You were the layer "
            "between him and the weather.\n\n"
            "That job is ending. Not in one day. Slowly. The coat on the "
            "chair is just the part you can see tonight.\n\n"
            "The role of being needed is ending. The role of being there "
            "is just beginning. Those are different jobs. The first one "
            "comes with proof. The second one does not.\n\n"
            "Full seven-minute story at prulesoul.site/listen/hearth/"
            "the-coat-on-the-chair if you would like it read to you."
        ),
    },
    # Day 10 (Thu) — Bluesky echo
    {
        "channel": "bluesky",
        "tag": "publer_w2_d10_bs_coat",
        "scheduled_at": at(9, 19, 0),
        "body": (
            "The role of being needed is ending. The role of being there "
            "is just beginning.\n\n"
            "Those are different jobs."
        ),
    },

    # Day 11 (Fri) — Bluesky
    {
        "channel": "bluesky",
        "tag": "publer_w2_d11_bs_tea",
        "scheduled_at": at(10, 8, 0),
        "body": (
            "Three cups of cold tea on the counter, in different rooms.\n\n"
            "Each one is a sentence you started writing about your own "
            "afternoon and never finished. Drink the freshest one. Leave "
            "the others where they are."
        ),
    },

    # Day 13 (Sun) — LinkedIn — window story
    {
        "channel": "linkedin",
        "tag": "publer_w2_d13_li_window",
        "scheduled_at": at(12, 10, 0),
        "body": (
            "Your 13-year-old left her bedroom window open.\n\n"
            "Your first thought is to close it. Of course your first "
            "thought is to close it. You are her parent. The room is "
            "cold. That is a problem you can solve in three seconds and "
            "it would not even count as work.\n\n"
            "You put your hand on the latch. And then you don't close it.\n\n"
            "She opened that window for a reason. Maybe she wanted the "
            "room to smell different. Maybe she was hot. Maybe a friend "
            "texted something that made her feel trapped and she walked "
            "across the room and pushed the window open the way you used "
            "to roll the car window down on the motorway when you were "
            "sixteen and needed to remember you had a body.\n\n"
            "You will not find out. She will not tell you. She will not "
            "even know there was anything to tell.\n\n"
            "This is the part of parenting nobody briefed you on.\n\n"
            "For thirteen years you had access to almost everything. Now "
            "there is a window in her room that she opened for a reason "
            "that belongs to her, and your job — your actual job, the "
            "new one — is to not close it.\n\n"
            "Full story (story #4 of 5 in the Hearth shelf) at "
            "prulesoul.site/listen/hearth/the-window-left-open"
        ),
    },
    # Day 13 (Sun) — Bluesky
    {
        "channel": "bluesky",
        "tag": "publer_w2_d13_bs_window",
        "scheduled_at": at(12, 19, 30),
        "body": (
            "Your teenager opened the window for a reason that belongs "
            "to her.\n\n"
            "Your new job is to not close it."
        ),
    },

    # ─────────────────────────── WEEK 3 ───────────────────────────
    # Theme: the voice that isn't yours. Course Room / Alistair.

    # Day 15 (Tue) — LinkedIn — the Zoom voice
    {
        "channel": "linkedin",
        "tag": "publer_w3_d15_li_zoom",
        "scheduled_at": at(14, 9, 0),
        "body": (
            "You're 38. You're on a Zoom call. Your boss says something "
            "that lands in your chest in a way that's much heavier than "
            "the actual sentence deserved.\n\n"
            "Half a second later, before you can stop it, you hear "
            "yourself reply in a voice that isn't quite yours. Slightly "
            "too apologetic. Slightly too quick to agree. Slightly too "
            "small.\n\n"
            "That voice came from somewhere. You didn't write it.\n\n"
            "Most of what you call your personality was loaded at boot "
            "by people who were tired, or scared, or grieving inside a "
            "body that had to keep moving. They handed you a script. "
            "You memorised it before you knew you had a choice.\n\n"
            "Most of what makes you flinch in adult rooms is a line that "
            "was written by a 41-year-old you have not seen in twenty "
            "years.\n\n"
            "A line that came from one specific tired person in one "
            "specific room is the size of one specific tired person in "
            "one specific room. It can be put down.\n\n"
            "Quietly walking through this in 21 short letters at "
            "prulesoul.site/alistair-bundle for anyone in this loop."
        ),
    },
    # Day 15 (Tue) — Bluesky
    {
        "channel": "bluesky",
        "tag": "publer_w3_d15_bs_fork",
        "scheduled_at": at(14, 18, 30),
        "body": (
            "The voice you reply with in difficult meetings is a fork "
            "of the version of you that was 14.\n\n"
            "Walk it back."
        ),
    },

    # Day 16 (Wed) — Bluesky
    {
        "channel": "bluesky",
        "tag": "publer_w3_d16_bs_boot",
        "scheduled_at": at(15, 8, 0),
        "body": (
            "Most of what you call your personality was loaded at boot "
            "by people who were tired, or scared, or grieving inside a "
            "body that had to keep moving.\n\n"
            "Some of it can be unloaded."
        ),
    },

    # Day 17 (Thu) — LinkedIn — slow learning
    {
        "channel": "linkedin",
        "tag": "publer_w3_d17_li_24h",
        "scheduled_at": at(16, 9, 0),
        "body": (
            "I built a course shelf that you cannot binge.\n\n"
            "Each letter is gated behind a 24-hour pause. You can read "
            "Letter 1 today. Letter 2 is not available until tomorrow. "
            "Not because of artificial scarcity. Because cognitive "
            "integration is slower than dopamine, and pretending "
            "otherwise is the actual problem.\n\n"
            "Every other course on the internet is designed to be "
            "binge-completable: 47 modules, 312 lessons, lifetime "
            "access, downloadable worksheets, a Slack community. By the "
            "time you finish module 3 you have already forgotten module 1, "
            "and by the time you forget module 1 you have already paid "
            "for the upsell.\n\n"
            "This shelf does the opposite.\n\n"
            "→ 21 letters total (3 sequences × 7)\n"
            "→ One letter per day\n"
            "→ No app\n"
            "→ No streak\n"
            "→ No completion certificate\n"
            "→ No 'next module' button bait\n\n"
            "Letter arrives by email. You read it when the day allows. "
            "Tomorrow's letter waits.\n\n"
            "At prulesoul.site/alistair-bundle. €39 for the whole shelf. "
            "Re-enroll any sequence any time the noise rises again."
        ),
    },
    # Day 17 (Thu) — Bluesky
    {
        "channel": "bluesky",
        "tag": "publer_w3_d17_bs_binge",
        "scheduled_at": at(16, 19, 0),
        "body": (
            "Cognitive integration is slower than dopamine.\n\n"
            "A course you can binge in a weekend is a movie you forgot "
            "to enjoy."
        ),
    },

    # Day 18 (Fri) — Bluesky
    {
        "channel": "bluesky",
        "tag": "publer_w3_d18_bs_inbox",
        "scheduled_at": at(17, 8, 0),
        "body": (
            "Inbox at 7am: 14 unread, 11 of which want you to optimise "
            "something.\n\n"
            "The only one worth opening is the one from a person who "
            "knows your name."
        ),
    },

    # Day 20 (Sun) — LinkedIn — house architecture
    {
        "channel": "linkedin",
        "tag": "publer_w3_d20_li_architecture",
        "scheduled_at": at(19, 10, 0),
        "body": (
            "I have been quietly building a small website on the side.\n\n"
            "It does the opposite of everything the modern app does.\n\n"
            "→ No login\n"
            "→ No account\n"
            "→ No streak counter\n"
            "→ No notifications\n"
            "→ No data sold to a third party\n"
            "→ No \"premium reflection layer\"\n"
            "→ No AI-generated content sneaking in through the back door\n\n"
            "What it has instead:\n\n"
            "→ Short audio stories, read in one take, no edits\n"
            "→ A course shelf on a 24-hour cadence-lock (you cannot "
            "binge it)\n"
            "→ A dark interface that does not flicker\n"
            "→ One €9 product. One €19 product. One €39 product. No "
            "subscriptions.\n\n"
            "This is not a launch announcement. There is no waitlist. "
            "There is no \"sign up to be the first to know.\"\n\n"
            "It is just at prulesoul.site if anyone has been looking "
            "for the opposite of the wellness industry.\n\n"
            "Curious — what would the opposite of an app look like in "
            "your field?"
        ),
    },
    # Day 20 (Sun) — Bluesky
    {
        "channel": "bluesky",
        "tag": "publer_w3_d20_bs_opposite",
        "scheduled_at": at(19, 19, 30),
        "body": (
            "What does the opposite of an app look like in your field?\n\n"
            "(Genuine question. The good answers do not start with "
            "'just a simpler app'.)"
        ),
    },

    # ─────────────────────────── WEEK 4 ───────────────────────────
    # Theme: the garden in November + the family bundle + shelf is complete.

    # Day 22 (Tue) — LinkedIn — garden in November
    {
        "channel": "linkedin",
        "tag": "publer_w4_d22_li_garden",
        "scheduled_at": at(21, 9, 0),
        "body": (
            "You step outside at quarter past ten to put the recycling "
            "out, and you forget for a second to come back in.\n\n"
            "It is November. The garden is in the state that gardens "
            "get in when nobody has been paying attention. The "
            "hydrangeas have gone brown. The lavender looks exhausted. "
            "There are bulbs you meant to plant in October still in "
            "their paper bag on the bench.\n\n"
            "You stand on the back step in your slippers. You can see "
            "your own breath.\n\n"
            "Your fifteen-year-old is upstairs. She closed her bedroom "
            "door an hour ago. You haven't checked.\n\n"
            "And you understand, sitting there in your own back garden "
            "at quarter past ten, that the garden is in November and "
            "that this is just what gardens do. They go quiet. Not dead. "
            "Not failing. Not broken. Busy with a kind of work that "
            "happens below the surface, that you do not get to see.\n\n"
            "Your daughter is also in her November. Doing the "
            "underground work of becoming someone slightly new.\n\n"
            "Your job is not to dig her up to check on her.\n\n"
            "Your job is to be the warm house behind the garden. The "
            "window with the light on. The smell of cooking that drifts "
            "out into the cold when she opens the back door in March.\n\n"
            "Story #5, the final piece of the Hearth shelf, is at "
            "prulesoul.site/listen/hearth/the-garden-in-november."
        ),
    },
    # Day 22 (Tue) — Bluesky
    {
        "channel": "bluesky",
        "tag": "publer_w4_d22_bs_underground",
        "scheduled_at": at(21, 18, 0),
        "body": (
            "Your teenager is in her November.\n\n"
            "Your job is not to dig her up to check on her. Your job is "
            "to be the warm house behind the garden."
        ),
    },

    # Day 23 (Wed) — Bluesky
    {
        "channel": "bluesky",
        "tag": "publer_w4_d23_bs_kitchen_light",
        "scheduled_at": at(22, 8, 0),
        "body": (
            "The kitchen light is on. The back door is closed but "
            "unlocked.\n\n"
            "This is the most important work of your parenting year, "
            "and it looks, from the outside, like absolutely nothing."
        ),
    },

    # Day 24 (Thu) — LinkedIn — family bundle reveal
    {
        "channel": "linkedin",
        "tag": "publer_w4_d24_li_family",
        "scheduled_at": at(23, 9, 0),
        "body": (
            "One shelf for the children. One shelf for the parent who "
            "put them to bed.\n\n"
            "Today I am quietly bundling two of the quietest things on "
            "the website for the same household.\n\n"
            "→ Polarstar Bedtime Stories — the children's PDF and one "
            "audio story, ages 5-9, for the bedtime hour.\n\n"
            "→ The Hearth — five evening stories for the parent who is "
            "now sitting in the kitchen at 11pm with the dishwasher "
            "running.\n\n"
            "Same house. Same lantern. Two rooms.\n\n"
            "Individually the two shelves are €9 and €19. As a Family "
            "Bundle, €25.\n\n"
            "There is no streak. No subscription. No app to install. "
            "No follow-up email asking if you 'completed' the bundle.\n\n"
            "Just two PDFs and six MP3s sitting quietly in a folder on "
            "your laptop, waiting for the next evening that needs them.\n\n"
            "At prulesoul.site (Family Bundle on the shelf page). "
            "Reply or DM if you would rather just have the children's "
            "shelf or the parents' shelf alone — both are listed "
            "separately."
        ),
    },
    # Day 24 (Thu) — Bluesky echo
    {
        "channel": "bluesky",
        "tag": "publer_w4_d24_bs_family",
        "scheduled_at": at(23, 18, 30),
        "body": (
            "One shelf for the children. One shelf for the parent who "
            "put them to bed.\n\n"
            "Same house. Same lantern. Two rooms.\n\n"
            "→ prulesoul.site"
        ),
    },

    # Day 25 (Fri) — Bluesky
    {
        "channel": "bluesky",
        "tag": "publer_w4_d25_bs_dishwasher",
        "scheduled_at": at(24, 8, 0),
        "body": (
            "The dishwasher is the soundtrack of the second half of "
            "your evening.\n\n"
            "Nobody warned you about this part. Nobody had to. You "
            "just stand at the counter and let it hum."
        ),
    },

    # Day 26 (Sat) — Bluesky
    {
        "channel": "bluesky",
        "tag": "publer_w4_d26_bs_weekend",
        "scheduled_at": at(25, 10, 0),
        "body": (
            "Saturday morning, two coffees deep, no agenda, nobody "
            "asking anything of you for forty-five entire minutes.\n\n"
            "This is the dose. Take it before the day arrives."
        ),
    },

    # Day 27 (Sun) — LinkedIn — closing reflection
    {
        "channel": "linkedin",
        "tag": "publer_w4_d27_li_closing",
        "scheduled_at": at(26, 10, 0),
        "body": (
            "Four weeks ago I wrote that there is a quiet generation of "
            "people who have already cancelled the meditation app.\n\n"
            "Since then, several of them have written to me. A few "
            "things they said, anonymised and lightly edited:\n\n"
            "'I have been listening to one of the Hearth stories on the "
            "school run instead of a podcast. It is the first time in "
            "years I have arrived at the office without feeling already "
            "behind.'\n\n"
            "'I deleted two apps. I have spent the saved €20/month on "
            "tulip bulbs. There is no metric for this. The tulips do "
            "not care if I miss a Tuesday.'\n\n"
            "'My 14-year-old came downstairs while I was in the kitchen "
            "listening to The Coat on the Chair. She did not say "
            "anything. She just sat at the other end of the sofa for "
            "a while. We did not talk. It was the best evening we have "
            "had in two months.'\n\n"
            "None of these are testimonials I asked for. None of these "
            "are 'use cases'. None of these are screenshots I will turn "
            "into a 'social proof' carousel.\n\n"
            "They are just small Tuesday evenings becoming slightly "
            "more available to themselves.\n\n"
            "Which is, quietly, the whole project.\n\n"
            "At prulesoul.site if you would like to find your own."
        ),
    },
    # Day 27 (Sun) — Bluesky
    {
        "channel": "bluesky",
        "tag": "publer_w4_d27_bs_tulips",
        "scheduled_at": at(26, 19, 0),
        "body": (
            "Cancelled the apps, spent the saved €20/month on tulip "
            "bulbs.\n\n"
            "The tulips do not care if I miss a Tuesday."
        ),
    },

    # Day 28 (Mon) — Bluesky soft closer
    {
        "channel": "bluesky",
        "tag": "publer_w4_d28_bs_door_open",
        "scheduled_at": at(27, 8, 0),
        "body": (
            "If you have been quietly looking for the opposite of the "
            "wellness industry — same kitchen, no app, one short story, "
            "one cup of tea — the door is at prulesoul.site.\n\n"
            "No subscription. No streak. Just a shelf."
        ),
    },

    # Day 29 (Tue) — Bluesky
    {
        "channel": "bluesky",
        "tag": "publer_w4_d29_bs_lantern",
        "scheduled_at": at(28, 19, 0),
        "body": (
            "The Hearth shelf is now five stories complete.\n\n"
            "Bedtime for the kids. Kitchen at 11pm for you. Same house. "
            "Same lantern."
        ),
    },

    # Day 30 (Wed) — Bluesky farewell
    {
        "channel": "bluesky",
        "tag": "publer_w4_d30_bs_close",
        "scheduled_at": at(29, 8, 0),
        "body": (
            "Closing thought, four weeks in:\n\n"
            "The quietest thing on the internet is not silence. It is a "
            "page that does not want anything from you. Build one. Send "
            "one. Read one."
        ),
    },
]


# ---------- Push to queue ----------

def main():
    p = argparse.ArgumentParser()
    p.add_argument("--dry-run", action="store_true", help="Print payload, do not POST")
    p.add_argument("--api-url", default=None)
    args = p.parse_args()

    api_url = (
        args.api_url
        or os.environ.get("AURIN_API_URL")
        or Path("/app/frontend/.env").read_text().split("REACT_APP_BACKEND_URL=")[1].split("\n")[0].strip()
    )
    admin_token = os.environ.get("AURIN_ADMIN_TOKEN") or os.environ.get("ADMIN_TOKEN")
    if not admin_token:
        print("FATAL: ADMIN_TOKEN missing from env.")
        sys.exit(1)

    by_channel: dict = {}
    for p_ in POSTS:
        by_channel[p_["channel"]] = by_channel.get(p_["channel"], 0) + 1
    print(f"Total posts: {len(POSTS)}")
    for ch, n in sorted(by_channel.items()):
        print(f"   · {ch:10s} {n}")
    print()
    if args.dry_run:
        first = POSTS[0]
        last = POSTS[-1]
        print(f"First scheduled: {first['scheduled_at']}")
        print(f"Last scheduled:  {last['scheduled_at']}")
        print("\n(Dry run — pass without --dry-run to push.)")
        return

    print(f"→ POST {api_url}/api/marketing/queue")
    with httpx.Client(timeout=60) as c:
        r = c.post(
            f"{api_url}/api/marketing/queue",
            json={"posts": POSTS},
            headers={"Authorization": f"Bearer {admin_token}"},
        )
    print("HTTP", r.status_code)
    try:
        print(json.dumps(r.json(), indent=2))
    except Exception:
        print(r.text[:1000])


if __name__ == "__main__":
    main()
