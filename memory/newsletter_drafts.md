# 📬 Newsletter Drafts — first letter to wanderers (2026-02-04)

> Voice rule: lowercase subjects when possible, scene before CTA,
> 200–400 words, one specific small offer, end with a question.
> Sender: `Anna (Aurin) <house@prulesoul.site>`.
> Reply-to: `contact.puresoul@proton.me`.

---

## VARIANT A — "the doors are open" (recommended for first send)

**Subject:** the doors are open, quietly.

**Preview text:** A small note from Matrix Aurin — what's free this
week, and why we're not announcing it loudly.

---

Hi {first_name},

Something has been built quietly, and it's open now.

prulesoul.site is a platform I made for the kind of inner work
that doesn't fit on social media — slow reading, body listening,
private reflection. There are books, a small Body Room with eight
soft places, four email courses, and a Clarity Release cabinet
where you can speak honestly into a calm room.

I'm not here to convince you of anything. I'd just like you to
know it exists.

For this first week, **everything except the books is free**.
You can activate a 30-minute Clarity Release session, enroll in any
of the courses, walk through the Body Room — without paying, until
**Friday evening**.

The books stay priced normally — they're how this work continues to
exist — but one of them, *The Night Angels' Embrace*, is also free
forever, for any parent reading their child to sleep.

If something here speaks to you, the door is here:
**https://prulesoul.site**

If it doesn't, no follow-up. Take what you need.

A small question, if you have a moment to think about it:
*what part of yourself have you been postponing?*

Sometimes the answer is the whole map.

Warmly,
Anna *(creative name: Aurin)*
prulesoul.site

---

*You're receiving this because you reached out, signed up, or
because someone shared this letter with you. If it doesn't fit,
[unsubscribe]({unsubscribe_url}) — no hard feelings.*

---

## VARIANT B — "the body knows first" (for cold list / public sub)

**Subject:** the body knows first.

**Preview text:** A quieter way to read your own life.

---

Hi {first_name},

There is a kind of knowing that doesn't go through words.

You feel it before a difficult phone call, in the moment before
you say something you'll regret, in the soft tightening of the
throat when someone asks how you really are.

Most of us have learned to walk past those signals. We treat the
body like a delivery truck for the head.

I made a small place where that order is reversed.

prulesoul.site has a *Body Room* — eight soft regions you can pause
on, listen to, and write down what you notice. Nothing clinical.
Nothing solved. Just a calm map for what's already there.

This week, the Body Room and the Clarity Release sessions are open
without charge. The first reading book of the year — *Beyond the
Matrix, Volume I* — is also up for $13 if a longer read fits your
rhythm.

The door:
**https://prulesoul.site/body-room**

A question, just for you:
*if your body could send you one short letter today, what would
it say?*

Read slowly,
Anna
prulesoul.site

---

*You're receiving this because you opted into Matrix Aurin's quiet
list. [Unsubscribe]({unsubscribe_url}) anytime, gently.*

---

## VARIANT C — "a small gift, until Friday" (warmer / shorter)

**Subject:** a small gift, until friday.

---

Hi {first_name},

Just a short note.

This week, every Clarity Release session and every email course on
prulesoul.site is free — until Friday evening. After that, the
prices return.

I'm not running a sale. The platform is in its first week of
public life, and I'd rather have a quiet group of real readers
walking through it than a louder launch.

If something in your life is asking to be looked at —
softly, with no pressure to fix it — the door is here:
**https://prulesoul.site**

That's all.

Anna
*founder, Matrix Aurin*

---

## NOTES FOR FOUNDER BEFORE SENDING

1. **Pick one variant** (recommended: A for warm list, B for cold
   /first-letter sub list, C if list is small / very curated)
2. **Replace `{first_name}`** with Resend's own merge syntax
   (`{{firstName}}` if using Resend audiences) or remove and rewrite
   the opening
3. **`{unsubscribe_url}`** — Resend injects automatically when you
   send via "Audiences" feature
4. **Sender** must be `house@prulesoul.site` (already in env)
5. **Schedule** for early morning (08:00–09:30 user local) or
   Sunday evening — when slow content is most read
6. **Test send first** to your own address; check the unfurl
   preview, the unsubscribe link, and the reply-to actually
   reaches `contact.puresoul@proton.me`
7. **Don't** send to anyone who hasn't opted in. The First Letter
   funnel signups already consented; older contacts may not have.
   When in doubt, don't.

---

## SENDING — the actual API call (for agent / founder reference)

```bash
curl -X POST https://api.resend.com/emails \
  -H "Authorization: Bearer $RESEND_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "from": "Anna (Aurin) <house@prulesoul.site>",
    "to": ["recipient@example.com"],
    "reply_to": "contact.puresoul@proton.me",
    "subject": "the doors are open, quietly.",
    "html": "<p>Full HTML version here…</p>",
    "text": "Plain-text version here…"
  }'
```

For batch sends, use Resend Audiences (cleaner unsubscribe handling).

---

*Drafted: 2026-02-04. Voice review: passes brand voice rules
(slow, honest, no urgency manipulation, small specific offer,
ends with a question, ≤ 400 words).*
