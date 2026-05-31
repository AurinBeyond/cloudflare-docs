#!/usr/bin/env python3
"""
queue_30_day_sprint.py — load a full 30-day content sprint into the
Aurin-Hub marketing queue. After dispatch loop is on, Buffer publishes
to LinkedIn / X / IG / Pinterest at the scheduled times.

Idempotent: each post carries a unique `tag` so re-running this script
just creates a new fresh batch (it does NOT overwrite previously
queued posts — to clear the queue manually, drop the
`marketing_queue` collection).

USAGE:
    # Dry run — print the payload, do NOT call API
    python3 scripts/queue_30_day_sprint.py --dry-run

    # Push to the live queue
    python3 scripts/queue_30_day_sprint.py

Configuration via env:
    AURIN_API_URL    — defaults to REACT_APP_BACKEND_URL from .env
    AURIN_ADMIN_TOKEN — required, from backend/.env ADMIN_TOKEN
"""
from __future__ import annotations

import json
import os
import sys
import argparse
from datetime import datetime, timezone, timedelta
from pathlib import Path

import httpx


# ---------- Schedule helpers ----------

def at(day_offset: int, hour: int, minute: int = 0) -> str:
    """Return ISO timestamp at day+offset, HH:MM UTC. Day 0 = tomorrow."""
    base = (datetime.now(timezone.utc) + timedelta(days=day_offset + 1)).replace(
        hour=hour, minute=minute, second=0, microsecond=0
    )
    return base.isoformat()


# ---------- 30-day sprint payload ----------
#
# Mix from omnichannel_pack_essay_2.md (Wellness Was Never Going to Save You)
# and follow-ups. Spread across 4 weeks so each week has:
#   - 3 LinkedIn posts (Tue, Thu, Sun)
#   - 4-5 X/Twitter shots (Mon, Wed, Fri, Sat)
#   - 1-2 Pinterest pins (Wed, Sun)
#   - 1 Instagram post (Sat)
#   - 1-2 Reddit drafts (manual_pending — Sun, Wed)
#
# Each post is a real, ready-to-publish piece in the locked sharp tone.

POSTS = [
    # ============== WEEK 1 ==============
    # Day 1 — Tuesday
    {
        "channel": "linkedin",
        "tag": "w1_d1_linkedin_hook",
        "scheduled_at": at(0, 9, 0),
        "body": (
            "The wellness industry made $4.5 trillion last year.\n\n"
            "If wellness worked, this would be the calmest, most rested generation in history.\n\n"
            "It is not.\n\n"
            "Anxiety is up. Sleep is down. The number of adults who report feeling burned out by 11am on a Tuesday has roughly doubled in a decade.\n\n"
            "The industry knows this. It is the engine that keeps it running.\n\n"
            "A category that solves its own problem does not get to $4.5 trillion. A category that perpetuates its problem — gently, slowly, with beautiful packaging — does.\n\n"
            "The meditation app does not teach you to sit quietly. It teaches you to sit quietly with the app. The journal does not give you a private place to think. It gives you a streak counter that punishes you for missing a Tuesday. The sleep tracker does not give you sleep. It gives you a number you can now ruin by checking it at 3am.\n\n"
            "What is the most useful thing you have done for your own attention this year that did not require buying anything?\n\n"
            "(I am genuinely asking. Real answers welcome.)"
        ),
    },
    # Day 2 — Wednesday
    {
        "channel": "twitter",
        "tag": "w1_d2_twitter_shot1",
        "scheduled_at": at(1, 10, 0),
        "body": (
            "Wellness is a category that sells you the absence of the thing it promised to give you.\n\n"
            "That is the whole industry. Distilled."
        ),
    },
    {
        "channel": "pinterest",
        "tag": "w1_d2_pinterest_pin1",
        "scheduled_at": at(1, 14, 0),
        "body": (
            "The 11pm thought that changed how I parent: I had been trying to be the floodlight. I only needed to be the light in the hallway. Small. Steady. Enough.\n\n"
            "A free evening audio at prulesoul.site/listen/hearth"
        ),
    },
    # Day 3 — Thursday
    {
        "channel": "linkedin",
        "tag": "w1_d3_linkedin_architecture",
        "scheduled_at": at(2, 9, 30),
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
            "→ Short audio stories, read in my own voice (one take, no edits)\n"
            "→ A course library on a 24-hour cadence-lock (you cannot binge it)\n"
            "→ A dark interface that does not flicker\n"
            "→ Total infra cost: ≈ €0/month\n\n"
            "This is not a launch announcement. There is no waitlist. There is no \"sign up to be the first to know.\"\n\n"
            "It is just at prulesoul.site if anyone has been looking for the opposite of the wellness industry.\n\n"
            "Curious what your version of \"the opposite of an app\" looks like."
        ),
    },
    # Day 5 — Saturday
    {
        "channel": "twitter",
        "tag": "w1_d5_twitter_shot2",
        "scheduled_at": at(4, 11, 0),
        "body": (
            "You do not need a $15/month app to write down what is on your mind.\n\n"
            "You need a notebook.\n\n"
            "You needed a notebook the entire time."
        ),
    },
    {
        "channel": "instagram",
        "tag": "w1_d5_instagram_short",
        "scheduled_at": at(4, 17, 0),
        "body": (
            "Wellness is a category that sells you the absence of the thing it promised to give you.\n\n"
            "That is the whole industry. Distilled.\n\n"
            "The quiet alternative is at prulesoul.site (link in bio).\n\n"
            "#digitalminimalism #slowliving #antiwellness"
        ),
    },
    # Day 6 — Sunday
    {
        "channel": "linkedin",
        "tag": "w1_d6_linkedin_confession",
        "scheduled_at": at(5, 15, 0),
        "body": (
            "At 2am last Tuesday I caught myself opening a meditation app.\n\n"
            "The app asked me how I was feeling on a scale of one to five.\n\n"
            "I lay there in the dark for a long time, trying to figure out the honest answer, and slowly realised that the question itself was the thing wrong with my night.\n\n"
            "I did not need a slider. I did not need a guided breath. I did not need a chime telling me my \"session\" was complete.\n\n"
            "I needed nothing.\n\n"
            "The kind of nothing that the wellness industry cannot sell, because it cannot package the absence of itself.\n\n"
            "I put the phone in another room. I slept.\n\n"
            "The honest cost of my \"evening routine\" for the last year had been about €240 in subscriptions, four different apps competing for my attention, and one specific kind of low-grade shame about whether I was doing wellness \"right.\"\n\n"
            "The cost of an empty room and a phone in a drawer: nothing.\n\n"
            "I think there is a quiet generation of us who already know this and are looking for permission to stop.\n\n"
            "If you are one of them — the door is open."
        ),
    },
    {
        "channel": "reddit",
        "tag": "w1_d6_reddit_insomnia",
        "scheduled_at": at(5, 20, 0),
        "body": (
            "title: has anyone else just... given up on the apps?\n"
            "subreddit: r/insomnia\n\n"
            "i have been an on-and-off insomniac for about six years.\n\n"
            "in that time i have paid for: calm, headspace, waking up, an oura ring, a meditation cushion that promised 'neural feedback', an ad-supported sleep stories app that turned out to be 70% ads, a subscription journal app, one supplement stack that included three things i couldn't pronounce.\n\n"
            "total damage: somewhere around €1,200 across six years.\n\n"
            "current sleep quality: marginally worse than when i started, because now i also have the additional anxiety of 'but i bought all this stuff and it still isn't working, so what is wrong with me.'\n\n"
            "last month i cancelled everything. put the phone in the kitchen at 10pm. bought a paper notebook. lying in the dark, when a thought wanted to be noted, i wrote it down. when i wanted silence, the silence was actually there because no app was sending me a 'time to wind down' notification at 9:47pm.\n\n"
            "it is the first time in years that my evening has actually been mine.\n\n"
            "i'm not saying the apps are evil. i'm saying that for me, specifically, the whole apparatus had become the noise it was supposed to fix.\n\n"
            "has anyone else been through this loop? what did you keep, what did you throw out?"
        ),
    },

    # ============== WEEK 2 ==============
    # Day 8 — Tuesday
    {
        "channel": "linkedin",
        "tag": "w2_d8_linkedin_zoom_call",
        "scheduled_at": at(7, 9, 0),
        "body": (
            "You're 38. You're on a Zoom call. Your boss says something that lands in your chest in a way that's much heavier than the actual sentence deserved.\n\n"
            "Half a second later, before you can stop it, you hear yourself reply in a voice that isn't quite yours. Slightly too apologetic. Slightly too quick to agree. Slightly too small.\n\n"
            "That voice came from somewhere. You didn't write it.\n\n"
            "Most of what you call your personality was loaded at boot by people who were tired, or scared, or grieving inside a body that had to keep moving. They handed you a script. You memorised it before you knew you had a choice.\n\n"
            "The good news: a line that comes from one specific tired person in one specific room is the size of one specific tired person in one specific room. It can be put down.\n\n"
            "(Working through this is what I have been writing about lately at prulesoul.site/alistair-bundle for anyone in this loop too.)"
        ),
    },
    # Day 9 — Wednesday
    {
        "channel": "twitter",
        "tag": "w2_d9_twitter_zoom",
        "scheduled_at": at(8, 10, 0),
        "body": (
            "The voice you reply with in difficult meetings is a fork of the version of you that was 14.\n\n"
            "Walk it back."
        ),
    },
    {
        "channel": "pinterest",
        "tag": "w2_d9_pinterest_pin2",
        "scheduled_at": at(8, 14, 0),
        "body": (
            "The $4.5T industry that doesn't work. Wellness made $4.5 trillion last year. If it worked, we would be the calmest generation in history. We are not.\n\n"
            "A quiet alternative at prulesoul.site"
        ),
    },
    # Day 10 — Thursday
    {
        "channel": "linkedin",
        "tag": "w2_d10_linkedin_sock",
        "scheduled_at": at(9, 9, 30),
        "body": (
            "Yesterday I sat down in the kitchen at 10:45pm.\n\n"
            "The house had finally gone quiet. There was a cold cup of tea on the counter from morning. A washing machine still running somewhere. And on the third step of the stairs, my kid had left one sock.\n\n"
            "Just one. The other one is probably under a bed.\n\n"
            "I looked at it for a long time. Then I sat down without picking it up.\n\n"
            "For years I have been measuring myself as a parent against some invisible finish line. Lunches made? Tomorrow there will be more. Washing folded? Tomorrow there will be more. Worries answered? Tomorrow there will be more.\n\n"
            "No wonder I have been tired. I have been trying to finish a thing that was never designed to end.\n\n"
            "Maybe being a good parent has less to do with staying one step ahead of life. And more to do with staying present inside it.\n\n"
            "I left the sock where it was. Went to bed. The sock was still there in the morning. Somehow life continued anyway."
        ),
    },
    # Day 12 — Saturday
    {
        "channel": "twitter",
        "tag": "w2_d12_twitter_finishline",
        "scheduled_at": at(11, 11, 0),
        "body": (
            "I've been tired because I've been trying to finish a thing that was never designed to end.\n\n"
            "Parenting isn't a project with a finish line. It's a season you stay inside."
        ),
    },
    {
        "channel": "instagram",
        "tag": "w2_d12_instagram_carousel",
        "scheduled_at": at(11, 17, 0),
        "body": (
            "The wellness industry made $4.5 trillion last year.\n\n"
            "If wellness worked, this would be the calmest, most rested generation in history. It is not.\n\n"
            "The meditation app does not teach you to sit quietly — it teaches you to sit quietly WITH the app. Cancel the subscription and the quiet leaves with it.\n\n"
            "A quiet alternative is at prulesoul.site (link in bio).\n\n"
            "#wellness #digitalminimalism #slowliving #burnout #antiapp"
        ),
    },
    # Day 13 — Sunday
    {
        "channel": "linkedin",
        "tag": "w2_d13_linkedin_coat",
        "scheduled_at": at(12, 15, 0),
        "body": (
            "Your 14-year-old hasn't worn that coat in two weeks. It's the one you bought him last winter. He chose it.\n\n"
            "You sit at the kitchen table and look at it on the chair, and you suddenly realise something:\n\n"
            "He is becoming someone who is going to be cold without telling you about it.\n\n"
            "Not on purpose. Not because he doesn't love you. Just because that is the shape of becoming a person.\n\n"
            "The role of being needed is ending. The role of being there is just beginning.\n\n"
            "Those are different jobs. The first one is loud and visible. You can count what you did at the end of the day. The second one is mostly invisible. You don't get to count. You get to be available.\n\n"
            "It took me twenty-two years to understand what my own mother had been doing in our kitchen at 11pm.\n\n"
            "Wrote a longer version of this thought tonight at prulesoul.site/listen/hearth — for anyone else in this stage."
        ),
    },
    {
        "channel": "reddit",
        "tag": "w2_d13_reddit_parenting",
        "scheduled_at": at(12, 20, 0),
        "body": (
            "title: the coat on the chair (or: how i realised i was being promoted, not retired)\n"
            "subreddit: r/Parenting\n\n"
            "had a moment tonight. my 14yo's coat on the kitchen chair. he hasn't worn it in two weeks. the same coat he was so excited about last winter.\n\n"
            "sat there for a while just looking at it. realised something hit different than usual.\n\n"
            "for years i've been the early-warning system for his small body. cold? extra layer in the bag. tired? snack. sad? hug. you could see it before he did.\n\n"
            "that job is ending. not in a single day. across months you barely noticed. and the wild part is you have been promoted, not retired — but nobody hands you the new job description. you have to figure out the new role from inside the change.\n\n"
            "the new role i think is just being there. quiet. familiar. not solving the problems they didn't ask you to solve.\n\n"
            "anyone else gone through this? what was your version of the coat on the chair?"
        ),
    },

    # ============== WEEK 3 ==============
    # Day 15 — Tuesday
    {
        "channel": "linkedin",
        "tag": "w3_d15_linkedin_hallway",
        "scheduled_at": at(14, 9, 0),
        "body": (
            "There is a light in our hallway that has been on every night for as long as I can remember.\n\n"
            "A small one. Just enough to see by. Not bright enough to wake anyone.\n\n"
            "I used to think I was leaving it on for them. In case they needed to find their way back.\n\n"
            "Tonight I wondered if perhaps it had also been on for me. A small steady proof, set into the wall. That somebody was still here. That somebody still remembered.\n\n"
            "For years I believed that being a good parent meant being the floodlight. Awake at every hour. Available for every question. Within reach.\n\n"
            "I was often tired. I often felt I was failing.\n\n"
            "Tonight, in the hallway with one small bulb between me and the dark, I started to wonder if I had been measuring my parenting against the wrong instrument.\n\n"
            "Perhaps the floodlight was not the standard. Perhaps it was the hallway light.\n\n"
            "Small. Easy. Enough."
        ),
    },
    {
        "channel": "twitter",
        "tag": "w3_d15_twitter_hallway",
        "scheduled_at": at(14, 14, 0),
        "body": (
            "You don't have to be the floodlight.\n\n"
            "You only have to be the light in the hallway.\n\n"
            "Small. Steady. Enough."
        ),
    },
    # Day 16 — Wednesday
    {
        "channel": "pinterest",
        "tag": "w3_d16_pinterest_pin3",
        "scheduled_at": at(15, 14, 0),
        "body": (
            "You spent the whole day winning. So why does it feel like you lost?\n\n"
            "Five short evening stories for the parent who finally sat down. prulesoul.site/listen/hearth"
        ),
    },
    # Day 17 — Thursday
    {
        "channel": "linkedin",
        "tag": "w3_d17_linkedin_apps",
        "scheduled_at": at(16, 9, 30),
        "body": (
            "Stack of subscriptions I cancelled last month:\n\n"
            "— meditation app (€11.99/mo)\n"
            "— journal app with a streak counter (€8.99/mo)\n"
            "— sleep tracker (€4.99/mo)\n"
            "— habit tracker (€5.99/mo)\n"
            "— wellness app whose name I cannot remember (€6.99/mo)\n\n"
            "Total: €38.95/mo. €467/year.\n\n"
            "What replaced them:\n\n"
            "— a paper notebook on the kitchen counter (€4.50, one time)\n"
            "— a phone in the drawer at 10pm (free)\n"
            "— a slow audio story when my brain won't quiet down (also free, the door is open at prulesoul.site/listen/hearth)\n\n"
            "Months I've slept better since: 2.\n\n"
            "Years I had been telling myself the apps were the solution: 6.\n\n"
            "There is a specific kind of relief that comes from realising the cure was always free, and that the cost was the apparatus."
        ),
    },
    # Day 19 — Saturday
    {
        "channel": "twitter",
        "tag": "w3_d19_twitter_freedom",
        "scheduled_at": at(18, 11, 0),
        "body": (
            "The cure was always free.\n\nThe cost was the apparatus."
        ),
    },
    {
        "channel": "instagram",
        "tag": "w3_d19_instagram_coat",
        "scheduled_at": at(18, 17, 0),
        "body": (
            "Your 14-year-old hasn't worn that coat in two weeks.\n\n"
            "He is becoming someone who is going to be cold without telling you about it.\n\n"
            "Not on purpose. Just because that is the shape of becoming a person.\n\n"
            "The role of being needed is ending. The role of being there is just beginning.\n\n"
            "Full story in audio at prulesoul.site/listen/hearth (link in bio).\n\n"
            "#parenting #teens #parentinglife #motherhood #fatherhood"
        ),
    },
    # Day 20 — Sunday
    {
        "channel": "linkedin",
        "tag": "w3_d20_linkedin_alistair_close",
        "scheduled_at": at(19, 15, 0),
        "body": (
            "Three things I had to stop doing to start sleeping again:\n\n"
            "1. Solving tomorrow's problems while in bed tonight.\n"
            "2. Treating the noise in my head as urgent the moment it arrived.\n"
            "3. Believing that the line in my head was mine just because it was in my head.\n\n"
            "The first two are habits. The third is structural.\n\n"
            "Most of what runs in my head at 2am was handed to me by people who were tired in rooms I don't live in any more. The line still runs because nobody told me I was allowed to put it down.\n\n"
            "I wrote a 7-letter sequence about exactly this. It is at prulesoul.site/alistair-bundle if you are in this loop too. Lifetime access, €39, no subscription, no streak.\n\n"
            "The line you are carrying belongs to one specific tired person in one specific room. It can be the right size again."
        ),
    },

    # ============== WEEK 4 ==============
    # Day 22 — Tuesday
    {
        "channel": "linkedin",
        "tag": "w4_d22_linkedin_garden",
        "scheduled_at": at(21, 9, 0),
        "body": (
            "I went outside this morning to bring in the recycling. My eye caught the garden.\n\n"
            "Nothing is happening. It looks dead.\n\n"
            "I stood in the cold for a moment longer than I needed to, because I remembered that this is what my inner life has looked like for about six months.\n\n"
            "And then I caught myself, because we have a whole culture that would call this a problem. A 'dry season'. A 'plateau'. Something to optimise out of.\n\n"
            "But standing there in the cold, I started wondering if November is the work, not the failure. The garden in November isn't dead. It's resting. Dormancy is a season, not a malfunction. Without it nothing else grows in March.\n\n"
            "Maybe my last six months weren't lost. Maybe they were doing the job nobody told me about — the slow underground work, the rest that prepares the next thing.\n\n"
            "We are very bad at this in the West. We treat every quiet season as evidence that we are broken.\n\n"
            "Has anyone else allowed a slow year to just be a slow year? Curious how that landed for you."
        ),
    },
    {
        "channel": "twitter",
        "tag": "w4_d22_twitter_dormancy",
        "scheduled_at": at(21, 14, 0),
        "body": (
            "The garden in November isn't dead. It's resting.\n\n"
            "Dormancy is a season, not a malfunction. Without it nothing else grows in March.\n\n"
            "Same with your inner life."
        ),
    },
    # Day 23 — Wednesday
    {
        "channel": "pinterest",
        "tag": "w4_d23_pinterest_pin4",
        "scheduled_at": at(22, 14, 0),
        "body": (
            "The 11pm thoughts. The cold tea on the counter. The sock on the third step.\n\n"
            "Five short evening stories at prulesoul.site/listen/hearth"
        ),
    },
    {
        "channel": "reddit",
        "tag": "w4_d23_reddit_minimalism",
        "scheduled_at": at(22, 20, 0),
        "body": (
            "title: deleted every wellness app last month. here's the receipt.\n"
            "subreddit: r/digitalminimalism\n\n"
            "i finally did it. cancelled:\n\n"
            "- meditation app (€12/mo)\n"
            "- journal app with streak counter (€9/mo)\n"
            "- sleep tracker premium (€5/mo)\n"
            "- habit tracker (€6/mo)\n"
            "- one wellness app whose name i genuinely cannot remember (€7/mo)\n\n"
            "total: €39/mo. €467/year. 6 years of this. €2,800ish into the wellness machine.\n\n"
            "replaced with: a paper notebook (€4.50, one time), phone in a drawer at 10pm, lying in the dark when i can't sleep instead of fixing it.\n\n"
            "the first 3 weeks my hand kept reaching for the phone. muscle memory. didn't even know what i wanted to look at. just the reach.\n\n"
            "took about 6 weeks for the reach to stop. honest verdict: my sleep is better. my mornings are better. my evening is no longer something i have to 'optimise.'\n\n"
            "i'm not saying the apps are evil. but for me, the whole stack had become the noise it was supposed to fix. anyone else gone through this and what stayed worth keeping?"
        ),
    },
    # Day 24 — Thursday
    {
        "channel": "linkedin",
        "tag": "w4_d24_linkedin_window",
        "scheduled_at": at(23, 9, 30),
        "body": (
            "You walk into the kitchen at midnight and the window is open. You don't remember opening it.\n\n"
            "The air is colder than the room. You stand there in your socks for a long time, deciding whether to close it or not.\n\n"
            "Most of what we call 'managing the household' is actually deciding what to release. What to keep in, what to let out. What the day needed to be sealed against. What the night needs to drain off.\n\n"
            "Closing the window is not the only option.\n\n"
            "Sometimes the day needed to leave."
        ),
    },
    # Day 26 — Saturday
    {
        "channel": "twitter",
        "tag": "w4_d26_twitter_window",
        "scheduled_at": at(25, 11, 0),
        "body": (
            "Sometimes the day needed to leave.\n\n"
            "Don't always close the window."
        ),
    },
    {
        "channel": "instagram",
        "tag": "w4_d26_instagram_quiet",
        "scheduled_at": at(25, 17, 0),
        "body": (
            "Things that have quietly worked for me lately:\n\n"
            "→ phone in a drawer after 10pm\n"
            "→ a paper notebook on the kitchen counter\n"
            "→ one slow audio story when the head won't quiet\n"
            "→ leaving the dishes\n"
            "→ closing the laptop without sending the email\n\n"
            "Things that haven't:\n\n"
            "→ everything I paid €39/month for\n\n"
            "Quiet alternative in bio.\n\n"
            "#slowliving #digitalminimalism #burnoutrecovery"
        ),
    },
    # Day 27 — Sunday
    {
        "channel": "linkedin",
        "tag": "w4_d27_linkedin_close",
        "scheduled_at": at(26, 15, 0),
        "body": (
            "Four weeks ago I published a quiet website.\n\n"
            "No launch event. No waitlist. No newsletter funnel. No 'be the first to know.'\n\n"
            "Just one URL, three rooms open, two more being prepared.\n\n"
            "What I have learned in 30 days:\n\n"
            "→ The right people find you slowly, not quickly. A few visitors a day for a long time matters more than 5,000 visitors on launch day.\n"
            "→ Anti-marketing is not 'no marketing'. It is 'no extractive marketing'. The difference is everything.\n"
            "→ A single honest sentence in a forum at 11pm is worth more than a polished ad budget.\n"
            "→ The people who write back are exactly the people I built this for.\n\n"
            "If you have been carrying too much for too long and you are tired of being sold the absence of what you needed — there is a small quiet door at prulesoul.site.\n\n"
            "It will still be there next week. There is no urgency."
        ),
    },
]


# ---------- CLI ----------

def load_env():
    env = {}
    for path in ("/app/frontend/.env", "/app/backend/.env"):
        try:
            for line in Path(path).read_text().splitlines():
                if "=" in line and not line.strip().startswith("#"):
                    k, v = line.split("=", 1)
                    env[k.strip()] = v.strip()
        except FileNotFoundError:
            pass
    return env


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()

    env = load_env()
    api_url = os.environ.get("AURIN_API_URL") or env.get("REACT_APP_BACKEND_URL")
    admin = os.environ.get("AURIN_ADMIN_TOKEN") or env.get("ADMIN_TOKEN")

    if args.dry_run:
        print(f"DRY-RUN — {len(POSTS)} posts would be queued.")
        by_ch = {}
        for p in POSTS:
            by_ch[p["channel"]] = by_ch.get(p["channel"], 0) + 1
        for ch, n in sorted(by_ch.items()):
            print(f"  {ch:10}  {n}")
        print()
        print("First 3 posts:")
        for p in POSTS[:3]:
            print(f"  [{p['channel']}] {p['scheduled_at']}  tag={p['tag']}")
            print(f"      body head: {p['body'][:100]}...")
            print()
        return

    if not api_url or not admin:
        sys.exit("FATAL: AURIN_API_URL or AURIN_ADMIN_TOKEN missing")

    print(f"→ POSTing {len(POSTS)} posts to {api_url}/api/marketing/queue ...")
    with httpx.Client(timeout=30) as c:
        r = c.post(
            f"{api_url}/api/marketing/queue",
            json={"posts": POSTS},
            headers={"Authorization": f"Bearer {admin}"},
        )
    print("HTTP", r.status_code)
    try:
        print(json.dumps(r.json(), indent=2))
    except Exception:
        print(r.text[:600])


if __name__ == "__main__":
    main()
