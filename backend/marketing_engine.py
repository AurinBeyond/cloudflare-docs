"""
marketing_engine.py — Content library and scheduler for the
Prulesoul sales push.

§MARKETING-ENGINE 2026-02-09 — Founder directive (Anna): build the
"glue" that pushes content to the real world. Phase 1 ships the
minimum viable engine that requires ZERO new API keys and works
today via the existing Resend integration:

    1. A library of 28 pre-written posts (4 weeks × 7 days) that
       spans every saleable product in the Prulesoul catalog.
    2. A daily-digest script that emails the founder the day's
       three posts (X / LinkedIn / Instagram) at 08:00 UTC.
    3. A simple status registry (which posts have been sent /
       which products have been featured this week) so we never
       repeat ourselves or starve a product.

Phase 2 (when Anna provides X / LinkedIn / Instagram API keys)
will swap the email-helper for direct posting via the playbook
already returned by integration_playbook_expert_v2.

Tone: house. Never urgent. Never FOMO. Each post mirrors a
real product moment, lets the reader pause, and offers one quiet
link to read more.
"""

from datetime import datetime, timezone, timedelta
from typing import Dict, List, Any, Optional


# ── Brand voice constants ────────────────────────────────────────
BRAND_HASHTAGS = "#House #QuietMornings #Aurin"
BRAND_BASE = "https://prulesoul.site"


def _post(x: str, linkedin: str, instagram: str, *,
          product: str, link_path: str = "") -> Dict[str, str]:
    """Triple-platform post bundle. The X copy is the lowest common
    denominator (≤240 chars). LinkedIn can breathe longer. Instagram
    has no clickable links — we surface the URL as plain text and
    rely on link-in-bio for traffic."""
    link = f"{BRAND_BASE}{link_path}" if link_path else BRAND_BASE
    return {
        "product": product,
        "link": link,
        "x": f"{x.strip()}\n\n{link}".strip(),
        "linkedin": f"{linkedin.strip()}\n\n{link}".strip(),
        "instagram": f"{instagram.strip()}\n\n— prulesoul.site (link in bio)".strip(),
    }


# ── 28-day content calendar ──────────────────────────────────────
# Designed to rotate evenly across products so no single offering
# gets repeated too soon. Each day lands on a single product.
CONTENT_CALENDAR: List[Dict[str, Any]] = [
    # ── WEEK 1 — Open the door ─────────────────────────────────
    {
        "day": 1, "theme": "Body Temple 28 — Day 1 free",
        **_post(
            x="Day 1 of Body Temple 28 is free. Four old keys. Twenty-eight quiet days. Begin with breath — no measuring, no rush.",
            linkedin="Most adults skip the first touch they could give themselves. Body Temple 28 is a four-week house built around four ancient keys — breathing, touch, rest, presence. Day 1 is free. No measuring. No rush.",
            instagram="Day 1 is free.\n\nBefore you fix anything, just listen to the first breath of the morning. That is the entire practice.",
            product="body-temple",
            link_path="/body-temple",
        ),
    },
    {
        "day": 2, "theme": "Kids Universe — return to the room",
        **_post(
            x="A child does not need to be optimised. They need a room that says 'come back any time.' That is Aurin's Universe.",
            linkedin="In a world where children are tracked, scored, and gently prodded toward 'better', we built one room that asks nothing back. Aurin's Universe is built for three age groups — and the only metric is quietness.",
            instagram="Some rooms ask nothing back.\n\nA short story for your child, a feeling jar, three slow breaths. Aurin's Universe holds it all.",
            product="kids-universe",
            link_path="/kids-universe",
        ),
    },
    {
        "day": 3, "theme": "Money & Consciousness — free 7-day course",
        **_post(
            x="A new free seven-day course: Money & Consciousness. Not budgeting. Just noticing what money touches in you.",
            linkedin="Money is not only money. It is mirror, pressure, guilt, freedom, fear, dignity. Our newest free course walks gently across seven days — naming what scarcity sounds like, where self-worth lives, and what an inner agreement with money could be.",
            instagram="Seven quiet days with the topic most people avoid.\n\nNot budgeting. Not hustling. Just listening to what money has been touching in you.",
            product="money-and-consciousness-module-1",
            link_path="/courses/money-and-consciousness-module-1",
        ),
    },
    {
        "day": 4, "theme": "Anna's Weekly Letter",
        **_post(
            x="Friday letters from Anna. No tips. No 7-step plans. Just one quiet observation a week, for the parents who already do too much.",
            linkedin="I send one letter every Friday. No frameworks. No 'three things to optimise this weekend.' Just one quiet observation for parents who are already doing more than enough.",
            instagram="One letter on Fridays.\n\nFor the parents who don't need another tip — just a place where someone has already understood.",
            product="annas-letter",
            link_path="/parent-portal/digest",
        ),
    },
    {
        "day": 5, "theme": "Grace voice room — Boundaries",
        **_post(
            x="Grace listens for the place where your yes cost more than it should have. Then she helps you find one kinder sentence.",
            linkedin="The hardest sentence to say isn't 'no.' It's 'no' without shrinking afterward. Grace — one of the voice rooms inside Clarity — is built for that specific moment.",
            instagram="One kinder sentence is sometimes the whole work.\n\nGrace listens for where your yes cost more than it should.",
            product="grace",
            link_path="/clarity-release",
        ),
    },
    {
        "day": 6, "theme": "Universal Minute Bank ($12 starter)",
        **_post(
            x="$12 = 20 minutes of voice time. The starter kit for anyone wondering whether a voice room is for them. No subscription.",
            linkedin="If you've never tried a voice room — twenty minutes is a fair test. The Universal Minute Bank is twelve dollars, no subscription, no auto-renewal. Use it across any of the four rooms.",
            instagram="Twelve dollars. Twenty minutes. Any of the four voice rooms.\n\nNo subscription. No measurement. Just an honest test.",
            product="universal-minute-bank",
            link_path="/topup",
        ),
    },
    {
        "day": 7, "theme": "Sunday rest — no offer",
        **_post(
            x="Sundays we don't sell. We just hope you are somewhere quiet enough to hear what the week has been asking.",
            linkedin="Sunday is not for offers. Just a small reminder: the questions that have been pulling at you all week aren't going anywhere. They'll be there Monday. So is the rest.",
            instagram="Sundays we don't sell.\n\nWe just hope you are somewhere quiet enough to hear what the week has been asking.",
            product="brand",
            link_path="",
        ),
    },

    # ── WEEK 2 — Deepen ────────────────────────────────────────
    {
        "day": 8, "theme": "Body Temple 28 — Touch week",
        **_post(
            x="Week 2 of Body Temple 28 is about touch. Not from anyone else. The kind of touch you give yourself when no one is watching.",
            linkedin="Week 2 of Body Temple 28: touch. The first touch a person could give themselves — hand on heart, on jaw, on aching shoulders. Most adults skip it for years. Body Temple makes it the work.",
            instagram="Hand on heart.\n\nMost adults skip this for years. Week 2 of Body Temple is built around it.",
            product="body-temple",
            link_path="/body-temple",
        ),
    },
    {
        "day": 9, "theme": "Angel Stars — reciprocal kindness",
        **_post(
            x="Kids earn stars by being kind. Parents earn stamps by being seen. Inside our system, gratitude flows both ways.",
            linkedin="In most reward systems, kindness flows in one direction — adult to child. Inside Aurin's Universe we built it both ways. Children give stars to their parents. Parents stamp their children's quiet moments. Gratitude becomes a household current.",
            instagram="Gratitude flowing both ways.\n\nKids give stars to parents. Parents stamp the small kindnesses back. A family economy made of soft noticing.",
            product="kids-universe",
            link_path="/kids-universe",
        ),
    },
    {
        "day": 10, "theme": "$5 Referral — parents to parents",
        **_post(
            x="Tell another parent about us. They get $5 of voice time. You get $5 of voice time. Quiet referrals between people who already understand.",
            linkedin="Most referral programs feel like marketing. Ours is softer: when one parent hands the link to another, both get five dollars of voice time. No tier. No funnel. Just one trusted hand to the next.",
            instagram="One parent telling another.\n\nFive dollars of voice time for both of you. The quietest kind of growth there is.",
            product="referral",
            link_path="/referral",
        ),
    },
    {
        "day": 11, "theme": "Kaelan voice room — the body's wisdom",
        **_post(
            x="Kaelan listens to your shoulders, your jaw, the place that's been tight for a week. He won't fix it. He'll help you ask it what it's holding.",
            linkedin="Kaelan is the body's voice inside Clarity. He doesn't diagnose, prescribe, or measure. He listens to where the tightness lives and helps you ask it what it has been carrying. Quiet, never clinical.",
            instagram="A voice for the body.\n\nKaelan listens to the shoulder that's been tight for a week. Not to fix it. Just to hear what it has been holding.",
            product="kaelan",
            link_path="/body-room",
        ),
    },
    {
        "day": 12, "theme": "Money course — Day 2 voice of scarcity",
        **_post(
            x="The voice that whispers 'don't ask for more, don't risk, don't allow.' Day 2 of Money & Consciousness — naming the oldest protector.",
            linkedin="Inside many of us lives a voice that says 'it isn't enough.' It's not malice — it's an old guard, protecting us from disappointment. Day 2 of Money & Consciousness is about hearing it without obeying it.",
            instagram="\"It isn't enough.\"\n\nThat voice protected you once. Day 2 of Money & Consciousness helps you hear it without obeying it.",
            product="money-and-consciousness-module-1",
            link_path="/courses/money-and-consciousness-module-1",
        ),
    },
    {
        "day": 13, "theme": "Parents Room — Sara listens",
        **_post(
            x="Parenting asks for a lot. Sara is the room built for what parents don't say out loud anywhere else.",
            linkedin="Parents rarely have a room of their own. Sara is built specifically for what parents can't say in front of their child, their partner, or the school chat. Quiet. Confidential. Theirs.",
            instagram="A room parents never had.\n\nSara listens to what doesn't get said out loud anywhere else.",
            product="sara",
            link_path="/parents-room",
        ),
    },
    {
        "day": 14, "theme": "Closing the week — what stayed",
        **_post(
            x="Two weeks of small mornings. Body Temple. Aurin. Anna's letters. What stayed with you most?",
            linkedin="Two weeks of small mornings inside the house. Body Temple's four keys, Aurin's quiet rooms, Anna's Friday letters. If just one thing stayed with you, that's enough.",
            instagram="Two weeks. One thing stayed.\n\nWhich one?",
            product="brand",
            link_path="",
        ),
    },

    # ── WEEK 3 — Show the depth ────────────────────────────────
    {
        "day": 15, "theme": "Body Temple 28 — Rest week",
        **_post(
            x="Week 3 of Body Temple is rest. Not sleep. Chosen rest — the kind you give yourself before you crash.",
            linkedin="Week 3 of Body Temple 28: rest. Not the rest you collapse into. The rest you choose, on purpose, before you've collapsed. Twenty minutes a day for seven days.",
            instagram="Rest you choose, not rest you collapse into.\n\nWeek 3 of Body Temple is built around that distinction.",
            product="body-temple",
            link_path="/body-temple",
        ),
    },
    {
        "day": 16, "theme": "Alistair voice room — One Honest Hour",
        **_post(
            x="If only one task got done today, which one would let you sleep tonight? Alistair starts there. The rest can wait.",
            linkedin="Alistair, the course room voice, has a question he opens with: if only one thing got done before sundown, which one would let you sleep? Most strategy starts there. Most calendars don't.",
            instagram="One honest hour.\n\nOne task. One question. Alistair helps you find it.",
            product="alistair",
            link_path="/course-room",
        ),
    },
    {
        "day": 17, "theme": "Library — read instead of scroll",
        **_post(
            x="The Library: short books and quiet courses for the moments you'd otherwise spend on your phone. Same time. Different exit.",
            linkedin="We built a small library — Letting the old stories rest, The language you forgot, Seven quiet evenings with children, The body knows first. Short reads for the moments you'd otherwise spend scrolling.",
            instagram="Same time you'd spend scrolling.\n\nA different exit.",
            product="library",
            link_path="/library",
        ),
    },
    {
        "day": 18, "theme": "Grey Rocking — surviving toxic rooms",
        **_post(
            x="When you can't leave the room yet, Grace helps you stay small, stay still, and keep your inner house intact.",
            linkedin="Sometimes you can't yet leave the room — a family dinner, a workplace meeting, an inherited situation. Grace's Grey Rocking mode helps you remain yourself inside it without giving anything away.",
            instagram="When leaving isn't an option yet.\n\nGrey Rocking is a way to stay small, stay still, and keep your inner room intact.",
            product="grace",
            link_path="/clarity-release",
        ),
    },
    {
        "day": 19, "theme": "Today's Quest — mood-led recommendations",
        **_post(
            x="Mark your mood. Aurin offers three activities that fit. No prescription. Just a quiet match.",
            linkedin="Today's Quest is a small daily ritual inside Aurin's Universe: a single mood check-in, three softly matched activities. No score. No streak. Just a quiet match between what's true today and what's possible.",
            instagram="One mood. Three quiet matches.\n\nNo score. No streak. Just a soft today.",
            product="todays-quest",
            link_path="/kids-universe",
        ),
    },
    {
        "day": 20, "theme": "Anna's Letter — Friday signal",
        **_post(
            x="Anna's Letter goes out tomorrow. One quiet observation for parents who already do too much. Optional in, optional out.",
            linkedin="Tomorrow's letter is about the small permissions parents forget to give themselves. Optional in. Optional out. No tracker, no nudge.",
            instagram="Anna's letter is tomorrow.\n\nFor the parents who don't need another tip — just a place where someone has already understood.",
            product="annas-letter",
            link_path="/parent-portal/digest",
        ),
    },
    {
        "day": 21, "theme": "Sunday rest — no offer",
        **_post(
            x="Three weeks of small mornings. Today we don't sell. Today we just hope your shoulders softened a little.",
            linkedin="Three weeks of small mornings. Today is the rest day. We hope your shoulders have softened, even a fraction, since you opened this door.",
            instagram="No offer today.\n\nJust the hope that your shoulders softened a little this week.",
            product="brand",
            link_path="",
        ),
    },

    # ── WEEK 4 — Close strong, then rest ───────────────────────
    {
        "day": 22, "theme": "Body Temple 28 — Presence week",
        **_post(
            x="Final week of Body Temple is presence. Five senses, one breath, a body that has been waiting to be noticed.",
            linkedin="Week 4 of Body Temple 28: presence. Five senses as anchors, one breath as the return ticket, a body that's been quietly waiting to be noticed.",
            instagram="Five senses, one breath.\n\nFinal week of Body Temple — coming home to the body that has been waiting.",
            product="body-temple",
            link_path="/body-temple",
        ),
    },
    {
        "day": 23, "theme": "Eternal subscription — long quiet",
        **_post(
            x="If you've found this useful, the Eternal subscription is $89/month for as much voice time as a real practice asks for.",
            linkedin="For the people who have made the rooms a real practice — Eternal is our subscription, $89/month, designed to hold a long-term rhythm without you ever having to count minutes.",
            instagram="A real practice deserves a real container.\n\nEternal: $89/month, never counting minutes.",
            product="eternal",
            link_path="/clarity-release",
        ),
    },
    {
        "day": 24, "theme": "First Step — try the door",
        **_post(
            x="If you haven't crossed the threshold yet — First Step is $39, opens a private room with Grace, no subscription.",
            linkedin="The first step into Clarity Release is thirty-nine dollars. No subscription. Just an open door, a voice room, a quiet hour with Grace. It's how most people meet the work.",
            instagram="Thirty-nine dollars.\n\nOne private hour with Grace, no subscription. The threshold most people walk first.",
            product="first-step",
            link_path="/clarity-release",
        ),
    },
    {
        "day": 25, "theme": "Money course — Day 5 family sentences",
        **_post(
            x="Every family has its money language. Day 5 of Money & Consciousness names the sentences you inherited without knowing.",
            linkedin="Every family has invisible money-sentences. 'Money comes from hard work.' 'Don't stand out.' 'People like us don't have that life.' Day 5 of Money & Consciousness helps you find which ones you're still repeating.",
            instagram="The sentences you inherited about money.\n\nMost of them never asked you.",
            product="money-and-consciousness-module-1",
            link_path="/courses/money-and-consciousness-module-1",
        ),
    },
    {
        "day": 26, "theme": "Six Quiet Nights — bedtime ritual",
        **_post(
            x="Six bedtime stories shaped like rituals, not entertainment. For the families who don't want one more loud thing before sleep.",
            linkedin="The bedtime story has become loud. Six Quiet Nights is the opposite — six stories shaped like small rituals, designed to soften the last hour of a child's day rather than excite it.",
            instagram="Six bedtime stories shaped like rituals.\n\nFor the last quiet hour of a child's day.",
            product="six-quiet-nights",
            link_path="/library",
        ),
    },
    {
        "day": 27, "theme": "The architect's note — Anna speaks",
        **_post(
            x="From Anna: 'I built this slowly because anything I'd want for my own family had to be built slowly. Thank you for trusting the pace.'",
            linkedin="A short note from Anna: I built Prulesoul slowly because anything I'd want for my own family had to be built slowly. To everyone who has walked the four weeks of these posts — thank you for trusting the pace.",
            instagram="A note from Anna:\n\n\"I built this slowly because anything I'd want for my own family had to be built slowly. Thank you for trusting the pace.\"",
            product="brand",
            link_path="",
        ),
    },
    {
        "day": 28, "theme": "Close the month — gentle invitation",
        **_post(
            x="Four weeks of small mornings. If one room called you, that's the door to open. We'll be here, quietly, on the other side.",
            linkedin="Four weeks of small mornings. If even one room or course quietly called you, that's the door to open. We'll be here — slowly, quietly — on the other side of it.",
            instagram="Four weeks. One door called you.\n\nWalk through it gently. We're on the other side, quietly.",
            product="brand",
            link_path="",
        ),
    },
]


def get_day(day_of_cycle: int) -> Optional[Dict[str, Any]]:
    """Returns the post bundle for day N of the 28-day rotation."""
    if not (1 <= day_of_cycle <= 28):
        return None
    return CONTENT_CALENDAR[day_of_cycle - 1]


def get_today_for_cycle(start_date: datetime, today: Optional[datetime] = None) -> Dict[str, Any]:
    """Given a campaign start_date (UTC midnight), returns the post
    that should go out today. Loops back to day 1 after day 28 so
    the engine continues indefinitely until Anna swaps in new copy."""
    today = today or datetime.now(timezone.utc)
    delta_days = (today.date() - start_date.date()).days
    cycle_day = (delta_days % 28) + 1
    return get_day(cycle_day) or CONTENT_CALENDAR[0]


def list_posts_by_product() -> Dict[str, List[int]]:
    """Diagnostic: which products are covered how many times across
    the 28-day cycle. Anna can verify nothing is over- or under-
    weighted."""
    out: Dict[str, List[int]] = {}
    for entry in CONTENT_CALENDAR:
        out.setdefault(entry["product"], []).append(entry["day"])
    return out
