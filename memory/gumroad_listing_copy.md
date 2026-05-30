# Polarstar Bedtime Stories — Gumroad listing copy

**Paste this into your Gumroad product when you next have 30 seconds.**
All text is PSP-safe, brand-aligned, and matches the in-app copy.

---

## Product name (the headline buyers see)

```
Polarstar Kids — Five Bedtime Stories
```

**Alt option** (if Gumroad truncates):
```
Polarstar · 5 Bedtime Stories (PDF)
```

---

## Price

```
€9
```

Currency: EUR. One-time. No subscription.

---

## Tagline (short summary, one sentence)

```
Five calm bedtime stories for families — PDF, 24 pages, ages 3 to 12.
```

---

## Description (the main "About this product" block)

```
Five quiet stories for the slow part of the evening.

A 24-page PDF with five short bedtime stories — written to be read
aloud in three to five minutes. After every story, one page of three
gentle questions ("Together After the Story") and one small invitation
to a Quiet Activity before lights out.

Inside the bundle:

  • Little Star — a tiny star learns that being small is not the same
    as being unseen. (Ages 3–5, ~3 min)

  • The Moon Boat — a sleepy boat carries dreams across a calm night
    sea. (Ages 3–5, ~3 min)

  • The Night Forest — the forest at night is not louder than the
    day. It is listening. (Ages 6–8, ~4 min)

  • The Quiet Dragon — most dragons roar. This one listened, and
    changed a village. (Ages 6–8, ~4 min)

  • Aurin and the Lantern — a small steady light, an honest step,
    one quiet companion on the road. (Ages 9–12, ~5 min)

For parents:
  • Read aloud — no app to open, no streak, no screen.
  • Each story includes a one-minute reading guide for the adult.
  • Use any order. Skip what doesn't fit tonight.
  • A short letter at the start explains how to use the book.

Format: PDF, A5, 24 pages, 85 KB, fully bookmarked.
Delivery: instant download after checkout.
Refund: 14-day no-questions refund (EU consumer law).

Part of Polarstar Kids — a calm, parent-managed media collection
for families. More worlds, more stories, and screen-free family
rituals are in the slow making. Buyers are added quietly to the
Explorer List so they hear first when the next world opens.

Not therapy. Not medical care. Just a calm half-hour at the end of
the day.
```

---

## Suggested tags / categories

```
bedtime stories, children stories, family reading, parenting,
calm bedtime, screen free, read aloud, ages 3-12, pdf storybook,
gentle stories
```

(Gumroad lets you set a "category" — pick: **Reading & Writing**, or
**Education** if Reading isn't available.)

---

## Cover image (Gumroad lets you upload one)

Use any of the painted-world stills from `/app/frontend/public/polarstar/`
that match a "warm bedroom / soft light / book" feel. If none feels
right, the PDF cover page itself (first page of the bundle) makes a
perfectly acceptable thumbnail — export page 1 of the PDF as a PNG.

---

## After-purchase email subject (Gumroad's built-in)

```
Your Polarstar Bedtime Stories are here
```

Body (kept short — our own Resend email handles the warm version):

```
Thank you. Your PDF is attached / available above.

We've also added you to the quiet Explorer List, so when the next
Polarstar world opens (drawing, music, family rituals) you'll be
among the first to hear.

With warmth,
— Polarstar Kids
```

---

## Refund policy (paste into Gumroad's Refund Policy field)

```
14-day no-questions refund. Email support@prulesoul.site with your
order number and we'll process the refund within 3 business days.
```

---

## Handling duplicates

If two identical products exist in Gumroad:

1. **Pick the "winner"** — the one with the better URL slug (shorter,
   cleaner). Note its permalink.
2. **Unpublish the other one** — Gumroad → Products → click duplicate
   → Settings → toggle "Unpublished". This hides it from purchase.
3. After unpublishing, the duplicate stops accepting orders. It does
   not actually delete (Gumroad never deletes products that have any
   sales history), but it becomes invisible to buyers.
4. After our `gumroad_setup.py` runs and writes only the kept
   product's permalink into `.env`, even if someone bookmarked the
   duplicate, our webhook will silently ignore its pings (permalink
   whitelist).
