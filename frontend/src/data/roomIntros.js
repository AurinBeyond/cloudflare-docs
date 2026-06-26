/**
 * roomIntros.js — § ROOM INTRO 2026-02
 *
 * Inbound-style "selguse kaart" for every room. NOT a sales page,
 * NOT a checkout. Five plain questions answered before any product
 * is mentioned:
 *
 *   1. forWhom         — who walks in here, and why
 *   2. whatItIs        — 2-3 sentences, plain
 *   3. whatYoullFind   — concrete list (real, not abstract)
 *   4. whatItIsNot     — set expectations, prevent disappointment
 *   5. freeThing       — one free, real thing to try right now
 *
 * Plus:
 *   - reflectionPrompt — a single question (italics) to help the
 *     visitor reach their own next step
 *   - furtherReading   — 3 free reading paths
 *
 * Vocabulary rule (founder, 2026-02): the words "house, holy,
 * sacred, pühadus" are not used in this card. We say "quiet, small,
 * room, library, evening, presence" instead.
 */

export const ROOM_INTROS = {
  /* §GRACE */
  grace: {
    eyebrow: "About this room",
    headline: "What you can actually use this room for.",
    forWhom: [
      "You have nobody you can talk to without it costing them something.",
      "Your head is full of noise and you can't find the edge of any thought.",
      "You don't want to burden family or friends with this one.",
      "You want a calm partner who listens without judging.",
      "You want to put your own thoughts in order, not be given a diagnosis.",
    ],
    whatItIs:
      "A quiet room for thinking out loud. A conversation partner who listens, mirrors, and helps you put your own thoughts in order — at your own pace, in your own words.",
    whatYoullFind: [
      "Text-to-text chat with a calm guide",
      "Short written reflections you can read tonight",
      "Quiet questions to sit with, one at a time",
      "Voice sessions when the doors are open",
    ],
    whatItIsNot: [
      "Not a therapist or psychologist",
      "Not a doctor or medical service",
      "Not a crisis line — if you are in danger, please call your local emergency number",
      "Not a diagnosis service",
    ],
    freeThing: {
      label: "Read one quiet reflection — free",
      href: "/start-here",
      testid: "grace-intro-free-thing",
    },
    reflectionPrompt:
      "When was the last time you let yourself say something out loud — without having to be ready for the answer?",
    furtherReading: [
      { label: "Start Here — three quiet paths", href: "/start-here" },
      { label: "Listen: the Little Star audio (free)", href: "/listen/little-star" },
      { label: "Read the Legal · Privacy · Refund", href: "/legal" },
    ],
  },

  /* §KAELAN */
  kaelan: {
    eyebrow: "About this room",
    headline: "What you can actually use this room for.",
    forWhom: [
      "You spend most of your day inside your head and have lost the thread of your body.",
      "You feel tension in your shoulders, jaw, or breath, and you don't know where to begin.",
      "You don't want a workout app or a yoga class right now.",
      "You want one slow, plain thing to try tonight — not a 12-week program.",
    ],
    whatItIs:
      "A quiet room for paying attention to the body — breath, posture, rest, presence. Slow, plain, no rush, no measurement.",
    whatYoullFind: [
      "One-to-two-minute body checks",
      "The four old keys: breath, touch, rest, presence",
      "Day 1 of Body Temple 28 free to read",
      "Short journal prompts to write next to a body practice",
    ],
    whatItIsNot: [
      "Not a workout or fitness program",
      "Not a yoga class",
      "Not medical advice or physiotherapy",
      "Not a measurement, streak, or scoring system",
    ],
    freeThing: {
      label: "Read Day 1 of Body Temple 28 — free",
      href: "/body-temple",
      testid: "kaelan-intro-free-thing",
    },
    reflectionPrompt:
      "What part of your body have you been trying not to listen to lately?",
    furtherReading: [
      { label: "Start Here — three quiet paths", href: "/start-here" },
      { label: "Listen: the Little Star audio (free)", href: "/listen/little-star" },
      { label: "Read the Legal · Privacy · Refund", href: "/legal" },
    ],
  },

  /* §SARA */
  sara: {
    eyebrow: "About this room",
    headline: "What you can actually use this room for.",
    forWhom: [
      "You want to be patient by evening, but the day uses you up first.",
      "You don't want to pour your stress onto your child.",
      "You are tired of parenting articles that promise ten hacks.",
      "You are looking for small sentences and small rituals for hard moments — not another course.",
    ],
    whatItIs:
      "A small room of sentences and rituals for parents. Drawn from Japanese rhythm, Montessori work, and positive-language practice — written to fit into the last hour before bedtime.",
    whatYoullFind: [
      "A three-minute first action you can do tonight",
      "Small sentences for hard moments (refusals, meltdowns, the long evening)",
      "Two or three quiet rituals you can keep weekly",
      "Honest evening prompts — no perfect-parent script",
    ],
    whatItIsNot: [
      "Not a parenting course",
      "Not expert advice or a parenting diagnosis",
      "Not a list of ten hacks",
      "Not pressure to be a perfect parent",
    ],
    freeThing: {
      label: "Try the three-minute first action below",
      href: "#first-action",
      testid: "sara-intro-free-thing",
    },
    reflectionPrompt:
      "Which sentence do you say most often in the last hour before bedtime — and how does it land in your child's body?",
    furtherReading: [
      { label: "Start Here — three quiet paths", href: "/start-here" },
      { label: "Listen: the Hearth Protocol stories (free preview)", href: "/listen/hearth" },
      { label: "Read the Legal · Privacy · Refund", href: "/legal" },
    ],
  },

  /* §ALISTAIR */
  alistair: {
    eyebrow: "About this room",
    headline: "What you can actually use this room for.",
    forWhom: [
      "You have already read and listened. Now you want a slow, structured walk.",
      "You prefer one letter at a time over a binge-watch course.",
      "You want a course that is paced for you, not against you.",
      "You like to sit with one idea for a day before the next arrives.",
    ],
    whatItIs:
      "A library of slow courses. One short letter, then 24 hours of silence, then the next. No streaks, no badges. You read, you sit with it, the next arrives when its hour comes.",
    whatYoullFind: [
      "Courses on memory, language, body, and evenings",
      "One letter per day — five to seven minutes of reading",
      "A 24-hour cadence-lock between letters",
      "Notes you can keep privately, written next to each letter",
    ],
    whatItIsNot: [
      "Not a self-help bootcamp",
      "Not a webinar series or live Q&A",
      "Not a productivity or hustle program",
      "Not a streak-and-badge app",
    ],
    freeThing: {
      label: "Read one full sample letter — free",
      href: "/library",
      testid: "alistair-intro-free-thing",
    },
    reflectionPrompt:
      "When did you last finish a course because it was paced for you — not against you?",
    furtherReading: [
      { label: "Start Here — three quiet paths", href: "/start-here" },
      { label: "Browse the Library", href: "/library" },
      { label: "Read the Legal · Privacy · Refund", href: "/legal" },
    ],
  },

  /* §AURIN */
  aurin: {
    eyebrow: "About this room",
    headline: "What you can actually use this room for.",
    forWhom: [
      "You want bedtime to feel calmer for your child — without another screen.",
      "You are tired of apps that sell ads and dopamine to small humans.",
      "Your child likes stories and gentle companions more than games.",
      "You want one place that respects your child's evening.",
    ],
    whatItIs:
      "A small painted world where your child can listen to quiet stories, find their Little Star, and meet Aurin — a gentle companion. Screens down, ears open.",
    whatYoullFind: [
      "Bedtime stories you can play instead of a screen",
      "The Little Star audio companion (free)",
      "Three painted rooms: Discovery, Exploration, Creation",
      "Kindness missions a child can carry through the day",
    ],
    whatItIsNot: [
      "Not a gaming app",
      "Not a YouTube channel",
      "Not advertising-driven content",
      "Not a screen-time replacement that lives on a screen",
    ],
    freeThing: {
      label: "Listen to the Little Star — free",
      href: "/listen/little-star",
      testid: "aurin-intro-free-thing",
    },
    reflectionPrompt:
      "What sound does your child hear most in the last hour before sleep right now?",
    furtherReading: [
      { label: "Polarstar Kids — the painted world", href: "/kids-universe/polarstar" },
      { label: "Listen: the Hearth Protocol stories", href: "/listen/hearth" },
      { label: "Read the Legal · Privacy · Refund", href: "/legal" },
    ],
  },
};

export function getRoomIntro(roomId) {
  return ROOM_INTROS[roomId] || null;
}
