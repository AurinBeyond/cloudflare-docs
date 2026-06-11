/**
 * bodyWorldStones.js — § BODY WORLD V2 · STONE REGISTRY 2026-02-13
 *
 * The 15 worlds (stones) that live on the Body World hub page,
 * per /app/memory/BODY_WORLD_V2_BRIEF.md.
 *
 * Each stone carries a metaphorical question — NOT a clinical label.
 * Stones become invisible hotspots over the painted hub image in
 * BodyWorld.jsx and route to /body-room/world/:slug for the per-stone
 * placeholder (BodyWorldStone.jsx). Content per stone will be authored
 * later — this file only owns IDs, titles, and the founder question.
 */

export const BODY_WORLD_STONES = [
  {
    n: 1,
    slug: "know-your-body",
    title: "Know Your Body",
    question: "What is my body trying to tell me?",
  },
  {
    n: 2,
    slug: "emotional-body",
    title: "Emotional Body",
    question: "What am I carrying?",
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
    question: "How do I see myself?",
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
    slug: "body-joy",
    title: "Body & Joy",
    question: "What makes my body feel alive?",
  },
  {
    n: 12,
    slug: "body-language",
    title: "Body as Verbal Language",
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
  },
  {
    n: 15,
    slug: "body-attention",
    title: "Body Attention",
    question: "Where attention goes, energy flows.",
  },
];

export const BODY_WORLD_STONE_BY_SLUG = BODY_WORLD_STONES.reduce((acc, s) => {
  acc[s.slug] = s;
  return acc;
}, {});

/**
 * The central "ALL CONNECTED" hub stone — not a separate world,
 * but a reflective threshold the visitor returns to.
 */
export const BODY_WORLD_CENTRE = {
  slug: "all-connected",
  title: "All Connected",
  question: "Everything is connected. No topic exists independently.",
};
