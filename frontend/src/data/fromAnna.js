/**
 * fromAnna.js — Canonical content for /from-anna (The Upstairs Light)
 *
 * ┌─────────────────────────────────────────────────────────────────┐
 * │ §AURIN BRAND LOCKS — read before editing anything in this file. │
 * │                                                                 │
 * │ 1. FOUNDATION LOCK                                              │
 * │    The three canonical texts and the book display text below   │
 * │    are CANONICAL. They must never be paraphrased, shortened,   │
 * │    rewritten, simplified, or "improved" by any agent or editor.│
 * │    Render them exactly as written. New material may be added   │
 * │    over time — existing material is locked.                    │
 * │                                                                 │
 * │ 2. FOUNDER VOICE LOCK                                           │
 * │    Any audio attached here must sound unmistakably human,      │
 * │    intimate, and natural — never commercial, never polished    │
 * │    into smoothness. There is no scheduled cadence promised:    │
 * │    "from time to time" is the only honest contract.            │
 * │                                                                 │
 * │ 3. KEEPER INDEPENDENCE LOCK                                     │
 * │    Anna is not a keeper. Grace, Sara, Kaelen, Alistair and     │
 * │    Polarstar are independent. They are never merged into Anna  │
 * │    or written as her alter-egos. This page is the only place   │
 * │    where the founder's own voice appears.                      │
 * │                                                                 │
 * │ 4. PRESENCE AUTHENTICITY LOCK                                   │
 * │    Every element on this page must increase trust — never      │
 * │    draw attention to the technology behind the house. No       │
 * │    "AI", "model", "generated", "powered by" language anywhere. │
 * │                                                                 │
 * │ 5. HOUSE DESIGN PRINCIPLE                                       │
 * │    Every new feature should make the house feel more lived in  │
 * │    — not more complicated. If a section has no content yet,    │
 * │    it does not render. We never display "Coming soon" or       │
 * │    placeholders on this page.                                  │
 * └─────────────────────────────────────────────────────────────────┘
 *
 * Section render rule:
 *   The page iterates `SECTIONS`. A section is rendered ONLY when its
 *   required content fields are present and non-empty. Empty fields
 *   mean the section stays hidden until real content exists.
 *
 *   • kind: "text"   — needs `paragraphs` (array of non-empty strings)
 *   • kind: "image"  — needs `src`
 *   • kind: "voice"  — needs `src`
 *   • kind: "book"   — needs `title`, `author` and `body`
 */

// ─────────────────────────────────────────────────────────────────────
// THE THREE CANONICAL TEXTS — DO NOT PARAPHRASE (Foundation Lock)
// ─────────────────────────────────────────────────────────────────────

const TEXT_WHY_THIS_HOUSE_EXISTS = {
  id: "why-this-house-exists",
  kind: "text",
  kicker: "I",
  title: "Why this house exists",
  paragraphs: [
    "Aurin was never meant to become another place that promised quick answers or lasting transformation.",
    "It began with a quieter observation.",
    "Many of the questions that shape our lives do not disappear because someone explains them well. They remain because they ask something of us in return: time, honesty, attention, and sometimes the courage to stay with uncertainty a little longer.",
    "This house was built for those moments.",
    "Not to replace your own judgement, your relationships, or the wisdom you already carry, but to offer a space where questions can breathe without being rushed toward conclusions.",
    "Some visitors arrive carrying questions about family. Others about work, health, grief, purpose, children, love, or simply the feeling that something inside no longer fits the life around them.",
    "No single room can hold every question.",
    "So this house grew room by room, each created with its own voice, atmosphere, and way of listening.",
    "You are free to stay for a few minutes or return many times over the years.",
    "Nothing here asks you to become someone else.",
    "Only to meet yourself—and the life around you—with a little more clarity than yesterday.",
  ],
};

const TEXT_WHY_ONE_VOICE_WAS_NEVER_ENOUGH = {
  id: "why-one-voice-was-never-enough",
  kind: "text",
  kicker: "II",
  title: "Why one voice was never enough",
  paragraphs: [
    "When I first imagined Aurin, I assumed it would have one voice.",
    "It didn't take long to realise that one perspective, no matter how thoughtful, could never honour the complexity of human life.",
    "The questions we carry are rarely all of the same kind.",
    "The question of a parent is not the same as the question of a child.",
    "The question of the body asks for something different than the question of work.",
    "Grief speaks differently from curiosity.",
    "Silence asks for something different than hope.",
    "Trying to answer all of them with one personality would eventually make every conversation sound the same.",
    "That is why the keepers were born.",
    "Grace does not replace Sara.",
    "Sara does not think like Alistair.",
    "Kaelen notices what words often miss.",
    "Polarstar reminds us that wonder deserves its own language.",
    "They are not separate people competing with one another.",
    "They are different ways of paying attention.",
    "Together they create enough space for different questions to be welcomed without forcing them into the same conversation.",
    "Behind them all, there is only one intention.",
    "To build a house where people can slow down long enough to hear themselves again.",
    "Not every visitor will need every room.",
    "Not every question belongs everywhere.",
    "Sometimes the kindest thing we can offer is not another opinion, but a quieter place in which the next step becomes visible.",
  ],
};

const TEXT_WHO_I_AM_IN_THIS_HOUSE = {
  id: "who-i-am-in-this-house",
  kind: "text",
  kicker: "III",
  title: "Who I am in this house",
  paragraphs: [
    "I am Anna.",
    "I am not one of the keepers.",
    "I built the house they live in.",
    "My role is quieter than it may appear. I listen, I write, I read, I notice patterns, and I continue shaping this place little by little.",
    "From time to time, I leave a letter, a voice note, or a reflection from the upstairs study.",
    "Not because my voice is more important than the others, but because every house should remind its visitors that someone is still tending the light.",
  ],
};

// ─────────────────────────────────────────────────────────────────────
// THE STUDY-ROOM IMAGE — hidden until an approved image arrives.
// To enable: set `src` to the approved asset path. Do not generate
// or substitute a different image (House Design Principle).
// ─────────────────────────────────────────────────────────────────────

const IMAGE_UPSTAIRS_STUDY = {
  id: "upstairs-study-image",
  kind: "image",
  src: null,            // hidden until approved image is added
  alt: "The upstairs study where Anna writes.",
  caption: null,
};

// ─────────────────────────────────────────────────────────────────────
// THE FOUNDER VOICE CLIP — hidden until audio is provided (Founder
// Voice Lock). Do not auto-generate. When real audio exists, set
// `src` to the file path; the section will appear without further
// code changes.
// ─────────────────────────────────────────────────────────────────────

const VOICE_FOUNDER_NOTE = {
  id: "founder-voice-note",
  kind: "voice",
  src: null,            // hidden until real audio is provided
  label: "A short voice note from upstairs",
  durationLabel: null,
};

// ─────────────────────────────────────────────────────────────────────
// THE BOOK CURRENTLY ON ANNA'S TABLE
// ─────────────────────────────────────────────────────────────────────

const BOOK_CURRENTLY_ON_TABLE = {
  id: "book-on-table",
  kind: "book",
  kicker: "Currently on my table",
  title: "The Courage to Be Disliked",
  author: "Ichiro Kishimi & Fumitake Koga",
  body: "Some books don't change you in a single evening. They quietly stay beside you, asking better questions each time you return. This is one of those books for me.",
};

// ─────────────────────────────────────────────────────────────────────
// PAGE ORDER (the six-step structure agreed upstairs):
//   1. Why This House Exists
//   2. Why One Voice Was Never Enough
//   3. Image of the study  (hidden until approved image arrives)
//   4. Who I Am In This House
//   5. Voice clip          (hidden until audio is provided later)
//   6. Book on the table
// ─────────────────────────────────────────────────────────────────────

export const FROM_ANNA_SECTIONS = [
  TEXT_WHY_THIS_HOUSE_EXISTS,
  TEXT_WHY_ONE_VOICE_WAS_NEVER_ENOUGH,
  IMAGE_UPSTAIRS_STUDY,
  TEXT_WHO_I_AM_IN_THIS_HOUSE,
  VOICE_FOUNDER_NOTE,
  BOOK_CURRENTLY_ON_TABLE,
];

export const FROM_ANNA_META = {
  pageEyebrow: "A letter from upstairs",
  pageTitle: "From Anna",
  pageSubtitle: "A few quiet pages from the study above the rooms.",
  signature: "— Anna",
};

// Helper used by the page to decide whether a section should render.
export function sectionHasContent(section) {
  if (!section) return false;
  switch (section.kind) {
    case "text":
      return Array.isArray(section.paragraphs) && section.paragraphs.filter(Boolean).length > 0;
    case "image":
      return typeof section.src === "string" && section.src.trim().length > 0;
    case "voice":
      return typeof section.src === "string" && section.src.trim().length > 0;
    case "book":
      return Boolean(section.title && section.author && section.body);
    default:
      return false;
  }
}
