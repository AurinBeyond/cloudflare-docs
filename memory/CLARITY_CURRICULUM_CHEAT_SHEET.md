# Clarity Curriculum — 1-page Cheat Sheet
*Reference for Anna · launch turundus + parent communication*
*Created 2026-02-09 (iter 76) — keep beside the influencer DM playbook*

---

## What it is, in one sentence
A four-module curriculum inside Aurin's Room that helps children **feel
their feelings, learn small life skills, practise kindness, and use
their hands creatively** — with parent visibility, gentle gamification
via Angel Stars, and a clean free → premium runway.

---

## The four modules

| Module | What it teaches | Free starters | Premium depth |
|---|---|---|---|
| 🧭 **Aurin's Daily Reflection** | Emotional intelligence — naming feelings, three-breath pauses, today-as-a-colour | A jar for today's feeling · Three slow breaths · What colour was today? | Feelings Journal (7-day) · ADHD mindful minute |
| 🍳 **Aurin's Kitchen Lab** | Practical life skills — no-fire, no-knife, "safe chef" recipes | Pink yogurt smoothie · Smile sandwich · Rainbow fruit kebab | Oat & honey energy balls · Tea for someone you love · No-bake cocoa cookies |
| 🌱 **The Growth Quest** | Friendship · kindness · confidence · gratitude — micro-quests in the real world | Give one real compliment · Three good things before bed · Help unasked | Friendship Skills workbook · Confidence pages · Affirmation bookmark · Gratitude Journal |
| 🎨 **Creative Corner** | Focus · fine motor · imagination — coloring, mazes, paper crafts, color-by-number | Today's coloring page · A tiny maze · Pencil lines | 3D paper house · Color by number · ABC pages · Summer Activity Book · Creative Writing Journal |

**Total: 23 activities · 12 free starters · 11 premium**

---

## Where it lives in the app

```
/kids-universe                       (gateway — public)
 └ /kids-universe/{age}/hub          (warm room — 5 cards + Today hero)
   ├ /daily                          (mood check-in → Aurin reply + 3 recs)
   ├ /activities                     (filterable browser, 4 module tabs)
   │  └ /activities/{slug}           (instructions + "I did this" star)
   ├ /stars                          (child's Angel Stars view)
   └ /aurins-room/{age}              (existing voice room)

/parent-portal
 ├ /stars                            (approve pending stars)
 └ /wellness                         (7-day mood trend per child)
```

`{age}` = `little-dreamers` (3-5) · `explorers` (6-8) · `dreamweavers` (9-12)
Legacy slugs `3-5`/`6-8`/`9-12` still alias to canonical.

---

## The free vs premium split (€500 / 60h House package)

**FREE (open to everyone — marketing fuel):**
- ✅ Full Daily Reflection ritual (mood check-in + auto 1★/day)
- ✅ All 68 coloring pages (existing Coloring Studio)
- ✅ 3 starter activities per module = 12 total
- ✅ Aurin's basic voice chat (existing voice budget rules)
- ✅ Full Angel Stars system (15 actions + 4 mystery tiers + parent portal)

**PREMIUM (inside 60h package):**
- 🔒 Full Kitchen Lab recipe collection (~6 + future expansions)
- 🔒 Workbooks: Friendship, Confidence, Gratitude, Affirmation bookmark
- 🔒 Premium crafts: 3D paper house, Color-by-number, ABC pages, Summer book, Creative Writing
- 🔒 Unlimited Aurin voice time
- 🔒 Premium reward tiers (Angel's Lullaby + Bedtime Story Unlock at higher tiers)

Server enforces premium gating via `_user_has_premium()` = `presence_seconds_left > 0` OR `unlimited_voice` OR an active non-admin clarity_pass.

---

## Aurin's mood → recommendation logic

| Mood | Aurin's reply (first words) | First-pick modules |
|---|---|---|
| 😔 Sad | "Thank you for telling me. Even sad days are allowed…" | Quest → Reflect |
| 😟 Worried | "I hear you. Worries shrink when we breathe with them…" | Reflect → Create |
| 🙂 Okay | "Okay is a soft place to rest. Pick something gentle…" | Create → Reflect |
| 😊 Good | "I'm so glad. Let's make today brighter for someone else…" | Kitchen → Quest |
| ✨ Sparkly | "Sparkly days are precious. Let's catch some of it…" | Create → Kitchen |

After mood pick, child sees 3 quiet recommendations — never more, never overwhelming.

---

## Influencer DM copy-paste (mass-market launch)

> **Soft version (parent-leaning):**
> "Hey, I built a quiet little corner of the internet for children — no
> ads, no algorithms, just stories, a calm friend called Aurin, a
> coloring studio, and a tiny daily ritual where the child says how
> they feel and earns a small star. The grown-up sees the week. Free
> to peek at: [link]. If you have a moment, would love your honest
> reaction — I'm a small founder and feedback matters more than likes."

> **Confident version (educator-leaning):**
> "Built a 4-module Clarity Curriculum for kids 3–12: emotional
> intelligence, life skills, kindness quests, creative focus. Each
> action earns a star a parent has to approve. Parent gets a 7-day
> mood dashboard. Free starters live here: [link]. Built solo, would
> love a quick gut-check from someone who teaches."

> **One-liner (Threads / X):**
> "A quiet corner for kids — Aurin asks 'how are you, really?', they
> pick a feeling, and one small kind thing to do today. Parents see
> the week. No ads. [link]"

---

## Why parents stay

1. **Daily ritual** — Aurin's "how are you, really?" becomes a recognised
   pre-bedtime moment within ~5 days. Switching cost = the child notices
   if they don't open it.
2. **Parent portal visibility** — week-on-week mood + stars dashboard.
   First objective signal a parent gets that something invisible is
   shifting.
3. **No noise** — no ads, no notifications, no infinite scroll, no
   "earn more, more, more". Quietness IS the differentiation.
4. **Premium pull-through** — once the child finishes the 12 free
   starters (~2-3 weeks), parent is offered the 60h package. By then
   the daily ritual has become a habit.

---

## Anna's 7-day post-launch checklist (suggested)

- Day 1: Share to your existing list with the soft DM above.
- Day 3: Open `/parent-portal/wellness` for any visible test family — see if mood data is flowing.
- Day 5: Pick the 3 most-completed free activities → write a 1-page blog post.
- Day 7: Pick the activity NO ONE completed → ask a parent friend why.
- Day 14: Tally premium conversion. Adjust gating if free pool is too generous OR too sparse.

---

*This sheet is a single source of truth. When the curriculum grows, update `kids_curriculum.py` and re-export the table at top.*
