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
 * RULES (FROM LOCK)
 *   1. Traveller by the lake = the visitor.  Kaelen = guide
 *      (sidebar / chat / voice — never the man by the lake).
 *   2. Worlds 1-13 use stones. World 14 (Living or Surviving)
 *      uses bubbles — the visual language intentionally changes.
 *   3. Stone 12 is "Body as Language" — NOT "Connection &
 *      Relationships". World 8 already owns relationships.
 *   4. Content allowed: Hero Topics + Field Study / In Progress.
 *      Same philosophy as Alistair Laboratory.
 *   5. DO NOT redesign, invent new worlds, merge worlds, or
 *      replace approved visuals.
 */

export const BODY_WORLD_STONES = [
  {
    n: 1,
    slug: "know-your-body",
    title: "Know Your Body",
    question: "What is my body trying to tell me?",
    // §WORLD-IMAGE — full painted world view, used by BodyWorldStone.jsx
    // as a Polarstar background. Sub-stone hotspots are layered over it.
    image:
      "https://customer-assets.emergentagent.com/job_aurin-hub/artifacts/m6z80wpi_ChatGPT%20Image%2011.%20juni%202026%2C%2021_55_26.png",
    aboutThisWorld:
      "Before we can change anything, we must learn to notice. This world helps you understand your body's signals, needs and patterns so you can make choices that support your well-being.",
    kaelenQuote: "Your body is wise. It speaks to you in many ways.",
    subStones: [
      { n: 1, slug: "recognize",         title: "Recognize",         hint: "Learn to notice" },
      { n: 2, slug: "listen",            title: "Listen",            hint: "Learn to listen" },
      { n: 3, slug: "understand-signals",title: "Understand Signals",hint: "Learn to read the dashboard" },
      { n: 4, slug: "body-patterns",     title: "Body Patterns",     hint: "Learn to spot patterns" },
      { n: 5, slug: "energy-map",        title: "Energy Map",        hint: "Learn where your energy goes" },
      { n: 6, slug: "body-awareness",    title: "Body Awareness",    hint: "Learn to live in your body" },
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
      { n: 1, slug: "recognize",       title: "Recognize",         hint: "Learn to see what you carry" },
      { n: 2, slug: "understand",      title: "Understand",        hint: "Learn why it stays" },
      { n: 3, slug: "weight-we-carry", title: "The Weight We Carry", hint: "Learn the cost of holding on" },
      { n: 4, slug: "release",         title: "Release",           hint: "Learn to put down the stone" },
      { n: 5, slug: "freedom",         title: "Freedom",           hint: "Life beyond the burden" },
      { n: 6, slug: "integration",     title: "Integration",       hint: "Turning pain into wisdom" },
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
    image:
      "https://customer-assets.emergentagent.com/job_aurin-hub/artifacts/ool14lh5_ChatGPT%20Image%2011.%20juni%202026%2C%2021_26_24.png",
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
    // §STONE-11-RENAME 2026-02-13 — Founder lock: "Body & Joy" was
    // replaced with "Stress & Nervous System". Reason: joy is a state
    // that arises naturally from regulated nervous system; the world
    // teaches the *substrate*, not the symptom.
    n: 11,
    slug: "stress-nervous-system",
    title: "Stress & Nervous System",
    question: "Is my nervous system at war, or at rest?",
  },
  {
    // §STONE-12-LOCK 2026-02-13 — DO NOT replace with "Connection &
    // Relationships". World 8 already owns relationships. This stone
    // is about the body as a *verbal* expressive instrument.
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
    // §STONE-14-BUBBLE 2026-02-13 — This world's visual language
    // intentionally departs from stones: it uses BUBBLES to convey
    // freedom, possibility, future choices, lightness.
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

/**
 * The central reflective threshold — not a separate world, but the
 * still point the traveller returns to between stones.
 */
export const BODY_WORLD_CENTRE = {
  slug: "all-connected",
  title: "All Connected",
  question: "Everything is connected. No topic exists independently.",
};
