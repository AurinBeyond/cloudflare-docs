# Course Room — Proposal

**Status:** NOT BUILT YET. Awaiting founder go-ahead per iteration.
**Founder constraint:** No video courses. 30-second mp3 audio clips OK.
**Founder preference:** Brand-aligned AI-generated courses are acceptable
if quality is house-grade.

---

## Recommended structure (lowest-cost, highest-impact)

### Format: "Quiet Letters"
Each course is a series of **7 short letters** delivered over 7 days.

- **Letter form:** A 250-word written reflection in Aurin house tone.
- **Optional micro-audio:** A 30-60 second mp3 voiced softly (the founder
  could record these on a phone) at the START of each letter.
- **End of each letter:** One single, hand-written prompt — never AI.
- **End of the course:** One closing letter from the founder.

This is closer to a slow newsletter than a "course" in the marketplace
sense. It is what the brand actually IS.

---

## Initial 3 courses (proposed topics)

| Slug | Title | Audience | Price | Built from |
|---|---|---|---|---|
| `letting-the-old-stories-rest` | Letting the old stories rest | Adult | $25 | Beyond the Matrix I extracts |
| `the-language-you-forgot` | The language you forgot | Adult | $25 | Language of Angels extracts |
| `seven-quiet-evenings-with-children` | Seven quiet evenings with children | Parents | $20 | Original founder writing |

Each course = 7 letters × 250 words = ~1,750 words. Founder writes once,
sells indefinitely.

---

## Backend additions needed (~1 day work)

```python
class Course(BaseModel):
    slug: str
    title: str
    audience: Literal["adult", "kids", "parents"]
    price: float
    letters: List[CourseLetter]  # 7 entries
    lemonsqueezy_variant_id: Optional[str]

class CourseLetter(BaseModel):
    day: int  # 1..7
    title: str
    body_md: str
    audio_url: Optional[str]  # 30-60s mp3 in /storage/courses/
    prompt: str

# Endpoints
GET  /api/courses                    # public catalogue
GET  /api/courses/{slug}             # public preview (letter 1 only)
GET  /api/courses/{slug}/letter/{n}  # auth + purchase required
POST /api/courses/{slug}/progress    # mark letter as read
```

Frontend: `/learning/{slug}` page that shows the day-N letter once the
purchase exists. Uses the same gate pattern as the gated PDF download.

---

## Why this beats video courses

1. Reading is private. Watching a video is not (others may see).
2. 30-second audio clips are easy to record, easy to ship.
3. No video editing means the founder ships in days, not months.
4. House tone is preserved — video tends to break it.
5. Lower bandwidth, works on any device, no autoplay traps.

---

## NOT recommended

- ❌ AI-generated audio narration (loses founder voice and the brand).
- ❌ Video lectures (breaks the house tone, expensive to produce).
- ❌ Quizzes / progress badges (gamification breaks the slow-evening feel).
- ❌ Buying entire course library at once before seeing if 1 sells.
