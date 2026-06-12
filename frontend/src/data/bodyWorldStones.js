/**
 * bodyWorldStones.js — § BODY WORLD V1 · LOCKED REGISTRY 2026-02-13
 *
 * The 14 worlds (stones) of Body World, per the founder's
 * "BODY WORLD V1 — IMPLEMENTATION LOCK" directive.
 *
 * STRUCTURE
 *   /body-world                       → Hub (traveler + lake + 14 stones)
 *   /body-world/world/:stoneSlug      → World page (centre stone + 6 sub-stones)
 *   /body-world/world/:s/topic/:t     → Topic placeholder (arrives later)
 *
 * Each painted stone carries:
 *   - `image`         : the founder's painted world mockup (full-bleed)
 *   - `subStoneSlots` : per-world hotspot coordinates for the 6 sub-stones
 *                       (top/left/width/height as % of the image)
 *
 * Coordinates were extracted from the painted mockups via Gemini
 * vision pass on 2026-02-13. They reflect each world's exact layout
 * — for example "Know Your Body" sits lower because three chat cards
 * are painted above the stones; "Body Identity" sits higher because
 * its title is shorter.
 */

// §LAYOUT-NOTE-2026-02-13 — The painted mockups all share an identical
// sidebar, back-to-map pill, right-column cards and bottom-quote bar.
// The arrangement of the 6 surrounding stones, however, drifts per
// world based on the painted typography. We therefore store sub-stone
// slots PER world (not as a shared constant).

export const BODY_WORLD_STONES = [
  {
    n: 1,
    slug: "know-your-body",
    title: "Know Your Body",
    question: "What is my body trying to tell me?",
    // §URL-FIX 2026-02-13 — Previously this slug pointed at the
    // m6z80wpi asset (which is actually the Body Identity painting).
    // Swapped after a Gemini-pass mis-mapping audit.
    image:
      "https://customer-assets.emergentagent.com/job_aurin-hub/artifacts/ool14lh5_ChatGPT%20Image%2011.%20juni%202026%2C%2021_26_24.png",
    aboutThisWorld:
      "Before we can change anything, we must learn to notice. This world helps you understand your body's signals, needs and patterns so you can make choices that support your well-being.",
    kaelenQuote: "Your body is wise. It speaks to you in many ways.",
    subStones: [
      { n: 1, slug: "recognize",          title: "Recognize",          hint: "Learn to notice" },
      { n: 2, slug: "listen",             title: "Listen",             hint: "Learn to listen" },
      { n: 3, slug: "understand-signals", title: "Understand Signals", hint: "Learn to read the dashboard" },
      { n: 4, slug: "body-patterns",      title: "Body Patterns",      hint: "Learn to spot patterns" },
      { n: 5, slug: "energy-map",         title: "Energy Map",         hint: "Learn where your energy goes" },
      { n: 6, slug: "body-awareness",     title: "Body Awareness",     hint: "Learn to live in your body" },
    ],
    // Coordinates verified against the painted mockup (Gemini pass).
    // Stone 1 is special: 3 chat cards painted ABOVE the sub-stones,
    // so the hexagon sits lower in the canvas than the other worlds.
    subStoneSlots: [
      { slot: 1, top: 44.8, left: 39.5, w: 17.9, h: 14.8 }, // 12 o'clock
      { slot: 2, top: 54.0, left: 53.2, w: 19.0, h: 14.5 }, // 2 o'clock
      { slot: 3, top: 70.1, left: 62.2, w: 18.8, h: 14.5 }, // 4 o'clock
      { slot: 4, top: 79.4, left: 49.2, w: 18.7, h: 14.9 }, // 6 o'clock
      { slot: 5, top: 69.6, left: 36.9, w: 19.2, h: 14.2 }, // 8 o'clock
      { slot: 6, top: 54.4, left: 29.1, w: 19.0, h: 14.5 }, // 10 o'clock
    ],
    // §STONE-1-CHAT-CARDS — three painted cards above the stones:
    // Chat with Kaelen · Talk to Kaelen · Body Check-In.
    chatCardSlots: [
      { id: "world-chat-kaelen", label: "Chat with Kaelen", route: "/body-world/v1#kaelan",                  top: 24, left: 22, w: 18, h: 11 },
      { id: "world-talk-kaelen", label: "Talk to Kaelen",   route: "/body-world/v1#kaelan",                  top: 24, left: 41, w: 18, h: 11 },
      { id: "world-body-checkin",label: "Body Check-In",    route: "/body-world/v1#body-room-questionnaire", top: 24, left: 60, w: 18, h: 11 },
    ],
  },
  {
    n: 2,
    slug: "emotional-body",
    title: "Emotional Body",
    question: "What am I still carrying?",
    image:
      "https://customer-assets.emergentagent.com/job_aurin-hub/artifacts/4hh50ve0_ChatGPT%20Image%2011.%20juni%202026%2C%2021_45_45.png",
    aboutThisWorld:
      "Some emotions pass through us. Some stay and become heavy. This world helps you understand what you carry, why it stays, the cost of holding on, and how to release it — so you can live lighter and freer.",
    kaelenQuote: "You don't have to carry what was never yours to hold.",
    subStones: [
      { n: 1, slug: "recognize",       title: "Recognize",            hint: "Learn to see what you carry" },
      { n: 2, slug: "understand",      title: "Understand",           hint: "Learn why it stays" },
      { n: 3, slug: "weight-we-carry", title: "The Weight We Carry",  hint: "Learn the cost of holding on" },
      { n: 4, slug: "release",         title: "Release",              hint: "Learn to put down the stone" },
      { n: 5, slug: "freedom",         title: "Freedom",              hint: "Life beyond the burden" },
      { n: 6, slug: "integration",     title: "Integration",          hint: "Turning pain into wisdom" },
    ],
    subStoneSlots: [
      { slot: 1, top: 17.0, left: 40.0, w: 20.0, h: 21.0 }, // 12 o'clock — RECOGNIZE
      { slot: 2, top: 30.0, left: 58.0, w: 20.0, h: 21.0 }, // 2 o'clock  — UNDERSTAND
      { slot: 3, top: 51.0, left: 58.0, w: 20.0, h: 21.0 }, // 4 o'clock  — THE WEIGHT
      { slot: 4, top: 63.0, left: 40.0, w: 20.0, h: 21.0 }, // 6 o'clock  — RELEASE
      { slot: 5, top: 51.0, left: 22.0, w: 20.0, h: 21.0 }, // 8 o'clock  — FREEDOM
      { slot: 6, top: 30.0, left: 22.0, w: 20.0, h: 21.0 }, // 10 o'clock — INTEGRATION
    ],
  },
  {
    n: 3,
    slug: "body-memory",
    title: "Body Memory & Inheritance",
    question: "Where do the roots begin?",
  },
  {
    n: 4,
    slug: "body-identity",
    title: "Body Identity",
    question: "Who do I believe I am?",
    // §URL-FIX 2026-02-13 — Was previously pointing at the ool14lh5
    // asset (which is the Know Your Body painting). Swapped.
    image:
      "https://customer-assets.emergentagent.com/job_aurin-hub/artifacts/m6z80wpi_ChatGPT%20Image%2011.%20juni%202026%2C%2021_55_26.png",
    aboutThisWorld:
      "Identity is more than appearance or achievements. This world helps you explore the beliefs, labels, and stories you've carried — and choose who you want to become.",
    kaelenQuote: "You don't have to become someone else. You get to remember who you truly are.",
    subStones: [
      { n: 1, slug: "self-worth",        title: "Self-Worth",        hint: "What do I believe about my worth?" },
      { n: 2, slug: "body-image",        title: "Body Image",        hint: "How do I see and judge my body?" },
      { n: 3, slug: "aging",             title: "Aging",             hint: "My relationship with time and change" },
      { n: 4, slug: "comparison",        title: "Comparison",        hint: "The thief of contentment" },
      { n: 5, slug: "self-acceptance",   title: "Self-Acceptance",   hint: "Learning to be at peace with who I am" },
      { n: 6, slug: "becoming-yourself", title: "Becoming Yourself", hint: "Living in alignment with your true self" },
    ],
    subStoneSlots: [
      { slot: 1, top: 23.9, left: 39.7, w: 21.4, h: 18.2 }, // 12 o'clock
      { slot: 2, top: 36.5, left: 57.3, w: 20.0, h: 17.1 }, // 2 o'clock
      { slot: 3, top: 57.1, left: 57.2, w: 19.4, h: 17.0 }, // 4 o'clock
      { slot: 4, top: 68.8, left: 39.5, w: 21.1, h: 18.3 }, // 6 o'clock
      { slot: 5, top: 57.1, left: 22.0, w: 19.7, h: 16.9 }, // 8 o'clock
      { slot: 6, top: 36.5, left: 21.9, w: 20.3, h: 17.5 }, // 10 o'clock
    ],
  },
  {
    n: 5,
    slug: "body-protection",
    title: "Body Protection Mechanisms",
    question: "What is this protecting me from?",
  },
  {
    n: 6,
    slug: "body-as-partner",
    title: "Body as a Partner",
    question: "Who is leading?",
  },
  {
    n: 7,
    slug: "body-engineering",
    title: "Body Engineering",
    question: "How do I work WITH my body?",
  },
  {
    n: 8,
    slug: "body-relationships",
    title: "Body & Relationships",
    question: "How do people affect my body?",
  },
  {
    n: 9,
    slug: "body-environment",
    title: "Body & Environment",
    question: "What surrounds me?",
  },
  {
    n: 10,
    slug: "body-time",
    title: "Body & Time",
    question: "Am I living according to body rhythm?",
  },
  {
    n: 11,
    slug: "stress-nervous-system",
    title: "Stress & Nervous System",
    question: "Is my nervous system at war, or at rest?",
  },
  {
    n: 12,
    slug: "body-language",
    title: "Body as Language",
    question: "How does my body speak?",
  },
  {
    n: 13,
    slug: "consequences",
    title: "Consequences",
    question: "What future am I creating?",
  },
  {
    n: 14,
    slug: "living-or-surviving",
    title: "Living or Surviving",
    question: "Am I living or coping?",
    visualLanguage: "bubbles",
  },
];

export const BODY_WORLD_STONE_BY_SLUG = BODY_WORLD_STONES.reduce((acc, s) => {
  acc[s.slug] = s;
  return acc;
}, {});

export const BODY_WORLD_CENTRE = {
  slug: "all-connected",
  title: "All Connected",
  question: "Everything is connected. No topic exists independently.",
};
