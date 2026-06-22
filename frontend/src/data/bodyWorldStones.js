/**
 * bodyWorldStones.js — § BODY WORLD V1 · FINAL WIRING 2026-02-13
 *
 * STONE NAMES LOCK (founder · IMPLEMENTATION LOCK · final):
 *   1  Know Your Body              · 6 sub-stones (hex)
 *   2  Emotional Body              · 6 sub-stones (hex)
 *   3  Body Memory & Inheritance   · 7 sub-stones (hex+1)
 *   4  Body Identity               · 6 sub-stones (hex)
 *   5  Body Protection Mechanisms  · 7 sub-stones (hex+1)   ⚠ painted sild "of 15" — awaiting re-render
 *   6  Body as a Partner           · 8 sub-stones (octagon)
 *   7  Body Engineering            · 8 sub-stones (octagon)
 *   8  Body & Relationships        · 8 sub-stones (octagon)
 *   9  Body & Environment          · 8 sub-stones (octagon)
 *  10  Body & Time                 · 8 sub-stones (octagon)
 *  11  Stress & Nervous System     · 7 sub-stones (hex+1)   (LOCK realigned 2026-02-13 to painted asset)
 *  12  Body as Language            · 8 sub-stones (octagon)
 *  13  Growth & Transformation     · 8 sub-stones (octagon)
 *  14  Living or Surviving         · 9 sub-bubbles (cluster) 🫧 BUBBLE world (LOCK realigned 2026-02-13 to painted asset)
 *
 * GEOMETRY HELPERS:
 *   HEX_SLOTS         · 6 stones at clock 12/2/4/6/8/10
 *   OCT_SLOTS         · 8 stones at clock 12/1.5/3/4.5/6/7.5/9/10.5
 *   STONE_3_SLOTS     · 7 sub-stones, vision-calibrated to painted asset 997a5r7f_…
 *   STONE_5_SLOTS     · 7 sub-stones, vision-calibrated to painted asset c4qmrbde_…
 *   STONE_11_SLOTS    · 7 sub-stones, vision-calibrated to painted asset bw1xcf7q_…
 *   STONE_14_SLOTS    · 9 bubbles, vision-calibrated to painted asset 79cg7fh3_…
 *
 * URL-MAPPING NOTE (2026-02-13):
 *   URLs marked TBD-FOUNDER-PASTE are awaiting founder verification.
 *   When founder pastes an URL into a TBD slot, the painted map view
 *   auto-activates for that stone. Until then the stone shows the
 *   Field Study skeleton — link graph stays intact.
 *
 * ARCHIVED (do not wire):
 *   - "Connection & Relationships" painting (Stone 8 used dedicated painting)
 *   - "Living Your Purpose" painting (Stone 14 stays "Living or Surviving")
 *   - "Mind & Thoughts" painting (Stone 11 stays "Stress & NS")
 *   - "Purpose & Meaning" Stone 10 painting (Stone 10 = Body & Time; concept folded into Stone 14 sub-bubble)
 *   - Earlier Stone 14 (lilac, 9 bubbles, no figure) — reserved for future
 *     Body World "Completion / Crossing the Threshold" screen.
 */

// §HEX-SLOTS — six surrounding stones at clock 12 / 2 / 4 / 6 / 8 / 10
const HEX_SLOTS = [
  { slot: 1, top: 24, left: 40, w: 20, h: 18 }, // 12 o'clock
  { slot: 2, top: 38, left: 57, w: 20, h: 17 }, // 2
  { slot: 3, top: 58, left: 57, w: 20, h: 17 }, // 4
  { slot: 4, top: 70, left: 40, w: 20, h: 18 }, // 6
  { slot: 5, top: 58, left: 23, w: 20, h: 17 }, // 8
  { slot: 6, top: 38, left: 23, w: 20, h: 17 }, // 10
];

// §OCT-SLOTS — eight surrounding stones at clock 12/1.5/3/4.5/6/7.5/9/10.5
const OCT_SLOTS = [
  { slot: 1, top: 14, left: 42, w: 17, h: 16 }, // 12 o'clock
  { slot: 2, top: 27, left: 60, w: 17, h: 16 }, // 1.5
  { slot: 3, top: 46, left: 64, w: 17, h: 16 }, // 3
  { slot: 4, top: 65, left: 60, w: 17, h: 16 }, // 4.5
  { slot: 5, top: 78, left: 42, w: 17, h: 16 }, // 6
  { slot: 6, top: 65, left: 23, w: 17, h: 16 }, // 7.5
  { slot: 7, top: 46, left: 19, w: 17, h: 16 }, // 9
  { slot: 8, top: 27, left: 23, w: 17, h: 16 }, // 10.5
];

// §BUBBLE_SLOTS removed 2026-02-13 — replaced by per-stone STONE_14_SLOTS.

// §STONE-11-SLOTS — 7 stones, vision-calibrated 2026-02-13 to painted asset
// (bw1xcf7q_ChatGPT Image 16. juni 2026, 09_33_00.png). Two stones at top,
// two in middle row, three across bottom row.
const STONE_11_SLOTS = [
  { slot: 1, top: 21, left: 14, w: 16, h: 20 }, // 1. STRESS RESPONSE (top-left)
  { slot: 2, top: 22, left: 70, w: 16, h: 20 }, // 2. NERVOUS SYSTEM BASICS (top-right)
  { slot: 3, top: 55, left: 14, w: 16, h: 20 }, // 3. THE BODY KEEPS THE SCORE (mid-left)
  { slot: 4, top: 55, left: 70, w: 16, h: 20 }, // 4. REGULATION TOOLS (mid-right)
  { slot: 5, top: 78, left: 28, w: 16, h: 20 }, // 5. VAGUS NERVE & SAFETY (bottom-left)
  { slot: 6, top: 78, left: 56, w: 16, h: 20 }, // 6. FROM SURVIVAL TO THRIVING (bottom-mid)
  { slot: 7, top: 78, left: 80, w: 16, h: 20 }, // 7. INTEGRATION (bottom-right)
];

// §STONE-3-SLOTS — 7 sub-stones, vision-calibrated 2026-02-13 to painted asset
// (997a5r7f_ChatGPT Image 12. juni 2026, 11_09_36.png). Heptagonal arrangement
// around the central blue stone. Centre data from vision model (w≈18%, h≈10%).
const STONE_3_SLOTS = [
  { slot: 1, top: 26, left: 44, w: 18, h: 12 }, // 1. ANCESTRAL STORIES (top-right)
  { slot: 2, top: 41, left: 60, w: 18, h: 12 }, // 2. INHERITED PATTERNS (right-upper)
  { slot: 3, top: 59, left: 54, w: 18, h: 12 }, // 3. PROTECTIVE LEGACIES (right-lower)
  { slot: 4, top: 69, left: 38, w: 18, h: 12 }, // 4. UNRESOLVED TRAUMA (bottom)
  { slot: 5, top: 67, left: 20, w: 18, h: 12 }, // 5. HEALING THE LINEAGE (left-lower)
  { slot: 6, top: 55, left: 5,  w: 18, h: 12 }, // 6. CHOOSING MY LEGACY (left-upper)
  { slot: 7, top: 33, left: 10, w: 18, h: 12 }, // 7. GENERATIONAL CONNECTION (top-left)
];

// §STONE-5-SLOTS — 7 sub-stones, vision-calibrated 2026-02-13 to painted asset
// (c4qmrbde_ChatGPT Image 12. juni 2026, 10_57_06.png). Diamond-plus-top
// arrangement: 1 at top, 2-6 in middle ring, 7 at very top above. Width 15%, height 17%.
const STONE_5_SLOTS = [
  { slot: 1, top: 28, left: 43, w: 15, h: 17 }, // 1. FIGHT RESPONSE (upper-centre)
  { slot: 2, top: 42, left: 62, w: 15, h: 17 }, // 2. FLIGHT RESPONSE (right)
  { slot: 3, top: 56, left: 43, w: 15, h: 17 }, // 3. FREEZE RESPONSE (lower-centre)
  { slot: 4, top: 56, left: 23, w: 15, h: 17 }, // 4. PEOPLE-PLEASING (lower-left)
  { slot: 5, top: 42, left: 4,  w: 15, h: 17 }, // 5. CONTROL RESPONSE (left)
  { slot: 6, top: 28, left: 23, w: 15, h: 17 }, // 6. HEALTHY BOUNDARIES (upper-left)
  { slot: 7, top: 13, left: 43, w: 15, h: 17 }, // 7. SAFETY IN THE BODY (very top)
];

// §STONE-14-SLOTS — 9 bubbles, vision-calibrated 2026-02-13 to painted asset
// (79cg7fh3_ChatGPT Image 13. juni 2026, 16_56_29.png). Bubbles flow clockwise
// from top-centre around the traveller silhouette.
const STONE_14_SLOTS = [
  { slot: 1, top: 9,  left: 41, w: 16, h: 16 }, // 1. CHOOSING LIFE (top)
  { slot: 2, top: 19, left: 59, w: 16, h: 16 }, // 2. LETTING GO OF SURVIVAL PATTERNS
  { slot: 3, top: 33, left: 64, w: 16, h: 16 }, // 3. TRUSTING THE FLOW
  { slot: 4, top: 48, left: 63, w: 16, h: 16 }, // 4. EXPANSION & POSSIBILITY
  { slot: 5, top: 62, left: 53, w: 16, h: 16 }, // 5. JOY & ALIVENESS
  { slot: 6, top: 66, left: 36, w: 16, h: 16 }, // 6. PURPOSE & MEANING
  { slot: 7, top: 61, left: 19, w: 16, h: 16 }, // 7. COURAGE TO BE MYSELF
  { slot: 8, top: 46, left: 10, w: 16, h: 16 }, // 8. FREEDOM IN THE BODY
  { slot: 9, top: 31, left: 14, w: 16, h: 16 }, // 9. LIVING IN PRESENCE
];

export const BODY_WORLD_STONES = [
  {
    n: 1,
    slug: "know-your-body",
    title: "Know Your Body",
    question: "What is my body trying to tell me?",
    image: "https://customer-assets.emergentagent.com/job_aurin-hub/artifacts/ool14lh5_ChatGPT%20Image%2011.%20juni%202026%2C%2021_26_24.png",
    aboutThisWorld: "Before we can change anything, we must learn to notice. This world helps you understand your body's signals, needs and patterns so you can make choices that support your well-being.",
    kaelenQuote: "Your body is wise. It speaks to you in many ways.",
    subStones: [
      { n: 1, slug: "recognize",          title: "Recognize",          hint: "Learn to notice" },
      { n: 2, slug: "listen",             title: "Listen",             hint: "Learn to listen", legacyRegion: "belly", legacyChildPattern: "child-belly" },
      { n: 3, slug: "understand-signals", title: "Understand Signals", hint: "Learn to read the dashboard" },
      { n: 4, slug: "body-patterns",      title: "Body Patterns",      hint: "Learn to spot patterns" },
      { n: 5, slug: "energy-map",         title: "Energy Map",         hint: "Learn where your energy goes" },
      { n: 6, slug: "body-awareness",     title: "Body Awareness",     hint: "Learn to live in your body", legacyRegion: "crown" },
    ],
    subStoneSlots: [
      { slot: 1, top: 44.8, left: 39.5, w: 17.9, h: 14.8 },
      { slot: 2, top: 54.0, left: 53.2, w: 19.0, h: 14.5 },
      { slot: 3, top: 70.1, left: 62.2, w: 18.8, h: 14.5 },
      { slot: 4, top: 79.4, left: 49.2, w: 18.7, h: 14.9 },
      { slot: 5, top: 69.6, left: 36.9, w: 19.2, h: 14.2 },
      { slot: 6, top: 54.4, left: 29.1, w: 19.0, h: 14.5 },
    ],
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
    image: "https://customer-assets.emergentagent.com/job_aurin-hub/artifacts/4hh50ve0_ChatGPT%20Image%2011.%20juni%202026%2C%2021_45_45.png",
    aboutThisWorld: "Some emotions pass through us. Some stay and become heavy. This world helps you understand what you carry, why it stays, the cost of holding on, and how to release it — so you can live lighter and freer.",
    kaelenQuote: "You don't have to carry what was never yours to hold.",
    subStones: [
      { n: 1, slug: "recognize",       title: "Recognize",           hint: "Learn to see what you carry", legacyRegion: "heart" },
      { n: 2, slug: "understand",      title: "Understand",          hint: "Learn why it stays" },
      { n: 3, slug: "weight-we-carry", title: "The Weight We Carry", hint: "Learn the cost of holding on", legacyAdultPattern: "pattern-anger" },
      { n: 4, slug: "release",         title: "Release",             hint: "Learn to put down the stone", legacyAudio: { src: "/audio/body-architecture-week2-armor.mp3", title: "Listening to the Armor", credit: "Body Architecture · Week 2" } },
      { n: 5, slug: "freedom",         title: "Freedom",             hint: "Life beyond the burden" },
      { n: 6, slug: "integration",     title: "Integration",         hint: "Turning pain into wisdom" },
    ],
    subStoneSlots: [
      { slot: 1, top: 17.0, left: 40.0, w: 20.0, h: 21.0 },
      { slot: 2, top: 30.0, left: 58.0, w: 20.0, h: 21.0 },
      { slot: 3, top: 51.0, left: 58.0, w: 20.0, h: 21.0 },
      { slot: 4, top: 63.0, left: 40.0, w: 20.0, h: 21.0 },
      { slot: 5, top: 51.0, left: 22.0, w: 20.0, h: 21.0 },
      { slot: 6, top: 30.0, left: 22.0, w: 20.0, h: 21.0 },
    ],
  },
  {
    n: 3,
    slug: "body-memory",
    title: "Body Memory & Inheritance",
    question: "Where do the roots begin?",
    image: "https://customer-assets.emergentagent.com/job_aurin-hub/artifacts/997a5r7f_ChatGPT%20Image%2012.%20juni%202026%2C%2011_09_36.png", // Stone 3 Body Memory (Stone 3 OF 14)
    aboutThisWorld: "Your body remembers what your mind has forgotten. This world helps you explore inherited patterns, ancestral stories, protective legacies and the imprints of unresolved trauma — so you can choose your own legacy.",
    kaelenQuote: "You inherited the patterns. You can rewrite the story.",
    subStones: [
      { n: 1, slug: "ancestral-stories",     title: "Ancestral Stories",     hint: "The histories carried in your body", legacyRegion: "hips" },
      { n: 2, slug: "inherited-patterns",    title: "Inherited Patterns",    hint: "What was passed down without asking", legacyChildPattern: "child-throat", legacyAdultPattern: "pattern-borrowed-key" },
      { n: 3, slug: "protective-legacies",   title: "Protective Legacies",   hint: "Old armour from older times", legacyChildPattern: "child-skin" },
      { n: 4, slug: "unresolved-trauma",     title: "Unresolved Trauma",     hint: "The wound the lineage didn't close", legacyChildPattern: "child-ears" },
      { n: 5, slug: "healing-the-lineage",   title: "Healing the Lineage",   hint: "Becoming the one who repairs" },
      { n: 6, slug: "choosing-my-legacy",    title: "Choosing My Legacy",    hint: "What you pass on from here" },
      { n: 7, slug: "generational-connection", title: "Generational Connection", hint: "Honouring without inheriting" },
    ],
    subStoneSlots: STONE_3_SLOTS, // vision-calibrated 2026-02-13 to painted asset
  },
  {
    n: 4,
    slug: "body-identity",
    title: "Body Identity",
    question: "Who do I believe I am?",
    image: "https://customer-assets.emergentagent.com/job_aurin-hub/artifacts/m6z80wpi_ChatGPT%20Image%2011.%20juni%202026%2C%2021_55_26.png",
    aboutThisWorld: "Identity is more than appearance or achievements. This world helps you explore the beliefs, labels, and stories you've carried — and choose who you want to become.",
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
      { slot: 1, top: 23.9, left: 39.7, w: 21.4, h: 18.2 },
      { slot: 2, top: 36.5, left: 57.3, w: 20.0, h: 17.1 },
      { slot: 3, top: 57.1, left: 57.2, w: 19.4, h: 17.0 },
      { slot: 4, top: 68.8, left: 39.5, w: 21.1, h: 18.3 },
      { slot: 5, top: 57.1, left: 22.0, w: 19.7, h: 16.9 },
      { slot: 6, top: 36.5, left: 21.9, w: 20.3, h: 17.5 },
    ],
  },
  {
    n: 5,
    slug: "body-protection",
    title: "Body Protection Mechanisms",
    question: "What is this protecting me from?",
    // §STONE-5 — Stone 5 painted sild reads "Stone 5 of 15" (old version
    // legacy). Code overlay shows correct "STONE 5 OF 14" above painted
    // image. Topic and 7 sub-stones match LOCK perfectly.
    image: "https://customer-assets.emergentagent.com/job_aurin-hub/artifacts/c4qmrbde_ChatGPT%20Image%2012.%20juni%202026%2C%2010_57_06.png",
    aboutThisWorld: "Your body learned to protect you long before you could understand why. This world helps you see the protections — and choose which ones still serve you.",
    kaelenQuote: "The wall that once kept you safe may now keep you small.",
    subStones: [
      { n: 1, slug: "fight",             title: "Fight Response",     hint: "When your body chooses confrontation" },
      { n: 2, slug: "flight",            title: "Flight Response",    hint: "When your body chooses escape" },
      { n: 3, slug: "freeze",            title: "Freeze Response",    hint: "When your body chooses stillness" },
      { n: 4, slug: "pleasing",          title: "Pleasing Response",  hint: "When your body chooses appeasement" },
      { n: 5, slug: "control",           title: "Control Response",   hint: "When your body chooses dominance", legacyRegion: "solar_plexus" },
      { n: 6, slug: "healthy-boundaries",title: "Healthy Boundaries", hint: "Protection without imprisonment" },
      { n: 7, slug: "safety-in-the-body",title: "Safety in the Body", hint: "Coming home to yourself" },
    ],
    subStoneSlots: STONE_5_SLOTS, // vision-calibrated 2026-02-13 to painted asset
  },
  {
    n: 6,
    slug: "body-as-partner",
    title: "Body as a Partner",
    question: "How do I work with my body instead of against it?",
    image: "https://customer-assets.emergentagent.com/job_aurin-hub/artifacts/vg1lkp5u_ChatGPT%20Image%2012.%20juni%202026%2C%2011_50_58.png", // Stone 6 Body as a Partner
    aboutThisWorld: "Your body is not a machine to control. It is a partner to understand. This world helps you build a relationship based on trust, respect and cooperation.",
    kaelenQuote: "Your body is not something you have. It is someone you partner with.",
    subStones: [
      { n: 1, slug: "listening-to-my-body",     title: "Listening to My Body",      hint: "Am I truly listening?", legacyAudio: { src: "/audio/body-architecture-week4-home.mp3", title: "Coming Home to the Body", credit: "Body Architecture · Week 4" } },
      { n: 2, slug: "trusting-my-signals",      title: "Trusting My Signals",       hint: "Can I trust what I feel?" },
      { n: 3, slug: "daily-dialogue",           title: "Daily Dialogue",            hint: "How do we communicate?" },
      { n: 4, slug: "respecting-limits",        title: "Respecting Limits",         hint: "Do I honour my boundaries?" },
      { n: 5, slug: "body-wisdom",              title: "Body Wisdom",               hint: "What is my body trying to teach me?" },
      { n: 6, slug: "cooperation-not-control",  title: "Cooperation Instead of Control", hint: "Can we work together?", legacyAdultPattern: "pattern-pull" },
      { n: 7, slug: "repairing-the-relationship", title: "Repairing the Relationship", hint: "How do I heal what's been hurt?" },
      { n: 8, slug: "living-as-partners",       title: "Living as Partners",        hint: "How do we live together well?" },
    ],
    subStoneSlots: OCT_SLOTS,
  },
  {
    n: 7,
    slug: "body-engineering",
    title: "Body Engineering",
    question: "How do I work WITH my body?",
    image: "https://customer-assets.emergentagent.com/job_aurin-hub/artifacts/j9502ba4_ChatGPT%20Image%2012.%20juni%202026%2C%2023_50_05.png", // Stone 7 Body Engineering
    aboutThisWorld: "Your body is the most complex system you live inside. This world gathers the small, repeatable practices that let it move through its days a little kinder to itself.",
    kaelenQuote: "Care for the instrument and the music will follow.",
    subStones: [
      { n: 1, slug: "movement-foundations",    title: "Movement Foundations",    hint: "The body in motion" },
      { n: 2, slug: "nutrition-intelligence",  title: "Nutrition Intelligence",  hint: "What you feed yourself becomes you", legacyAdultPattern: "pattern-food" },
      { n: 3, slug: "rest-and-recovery",       title: "Rest & Recovery Systems", hint: "Recovery is part of training" },
      { n: 4, slug: "daily-rituals",           title: "Daily Rituals & Routines",hint: "Small acts repeated become identity" },
      { n: 5, slug: "alignment-and-posture",   title: "Alignment & Posture",     hint: "Structure before strength" },
      { n: 6, slug: "body-care-maintenance",   title: "Body Care & Maintenance", hint: "The maintenance you don't skip" },
      { n: 7, slug: "performance-optimisation",title: "Performance & Optimisation", hint: "Asking more of the body without breaking more of it" },
      { n: 8, slug: "track-and-refine",        title: "Track & Refine",          hint: "Notice what is true, not what should be true" },
    ],
    subStoneSlots: OCT_SLOTS,
  },
  {
    n: 8,
    slug: "body-relationships",
    title: "Body & Relationships",
    question: "How do my relationships affect my body and nervous system?",
    image: "https://customer-assets.emergentagent.com/job_aurin-hub/artifacts/g3bn25wk_ChatGPT%20Image%2013.%20juni%202026%2C%2016_41_15.png",
    aspectRatio: "1402 / 1122", // landscape painting — matches image dimensions exactly
    aboutThisWorld: "Every relationship leaves a trace in your body. This world helps you understand how connection, conflict, boundaries and support shape your nervous system — and how to build relationships that steady the body, not strain it.",
    kaelenQuote: "Your nervous system learns from every relationship. Some teach fear. Some teach safety.",
    subStones: [
      { n: 1, slug: "safe-connections",        title: "Safe Connections",        hint: "Who helps my body relax?" },
      { n: 2, slug: "emotional-contagion",     title: "Emotional Contagion",     hint: "What do I absorb from others?" },
      { n: 3, slug: "boundaries",              title: "Boundaries in Relationships", hint: "Where do I end and others begin?" },
      { n: 4, slug: "nervous-system-coregulation", title: "Nervous System Co-Regulation", hint: "Who helps me feel safe?" },
      { n: 5, slug: "conflict-and-the-body",   title: "Conflict and the Body",   hint: "How does tension live in me?" },
      { n: 6, slug: "trust-and-openness",      title: "Trust and Openness",      hint: "When do I feel safe to connect?" },
      { n: 7, slug: "relationship-patterns",   title: "Relationship Patterns",   hint: "What repeats in my life?", legacyAdultPattern: "pattern-jealousy" },
      { n: 8, slug: "healthy-support-systems", title: "Healthy Support Systems", hint: "Who belongs in my circle?" },
    ],
    subStoneSlots: OCT_SLOTS,
  },
  {
    n: 9,
    slug: "body-environment",
    title: "Body & Environment",
    question: "How does my environment affect my body, mind and energy?",
    image: "https://customer-assets.emergentagent.com/job_aurin-hub/artifacts/r37tmlnt_ChatGPT%20Image%2013.%20juni%202026%2C%2016_42_51.png",
    aspectRatio: "1402 / 1122", // landscape painting — matches image dimensions exactly
    aboutThisWorld: "Your environment is not neutral. It impacts your hormones, energy, mood, immunity and longevity. This world helps you design an environment that nourishes and protects your body.",
    kaelenQuote: "Your environment is not something separate from you. It is an extension of your body.",
    subStones: [
      { n: 1, slug: "light-and-dark",          title: "Light & Dark",            hint: "How does light influence me?", legacyAdultPattern: "pattern-screen" },
      { n: 2, slug: "air-and-breath",          title: "Air & Breath",            hint: "What am I breathing in daily?", legacyAudio: { src: "/audio/body-architecture-week1-breath.mp3", title: "The Breath", credit: "Body Architecture · Week 1" } },
      { n: 3, slug: "noise-and-silence",       title: "Noise & Silence",         hint: "How does sound impact me?" },
      { n: 4, slug: "nature-natural-rhythms",  title: "Nature & Natural Rhythms",hint: "How does nature restore me?" },
      { n: 5, slug: "space-and-surroundings",  title: "Space & Surroundings",    hint: "What kind of space supports me?", legacyRegion: "feet" },
      { n: 6, slug: "water-and-hydration",     title: "Water & Hydration",       hint: "How does water sustain me?" },
      { n: 7, slug: "food-environment",        title: "Food Environment",        hint: "What surrounds my food choices?" },
      { n: 8, slug: "chemical-toxic-load",     title: "Chemical & Toxic Load",   hint: "What am I exposed to?" },
    ],
    subStoneSlots: OCT_SLOTS,
  },
  {
    n: 10,
    slug: "body-time",
    title: "Body & Time",
    question: "How do I live in rhythm with time instead of rushing or resisting?",
    image: "https://customer-assets.emergentagent.com/job_aurin-hub/artifacts/ceflczmw_ChatGPT%20Image%2013.%20juni%202026%2C%2016_46_23.png",
    aspectRatio: "1402 / 1122", // landscape painting — matches image dimensions exactly
    aboutThisWorld: "Time is not something to control — it's something to understand and flow with. When you align with your body's rhythms and life's seasons, you create more energy, ease and meaning.",
    kaelenQuote: "Time is not your enemy. Disconnection from time is. Come back into rhythm. Your body remembers.",
    subStones: [
      { n: 1, slug: "circadian-rhythm",        title: "Circadian Rhythm",        hint: "How does my body follow the day?", legacyChildPattern: "child-sleep" },
      { n: 2, slug: "ultradian-rhythms",       title: "Ultradian Rhythms",       hint: "How do I work with my energy waves?" },
      { n: 3, slug: "menstrual-hormonal",      title: "Menstrual & Hormonal Cycles", hint: "How do my hormones influence me?" },
      { n: 4, slug: "seasons-of-life",         title: "Seasons of Life",         hint: "What season am I in?" },
      { n: 5, slug: "patience-and-timing",     title: "Patience & Timing",       hint: "How do I trust the perfect timing?" },
      { n: 6, slug: "rituals-rhythmic-living", title: "Rituals & Rhythmic Living", hint: "What routines support my body?" },
      { n: 7, slug: "time-management",         title: "Time Management for Well-Being", hint: "How do I protect my time?" },
      { n: 8, slug: "honouring-natural-time",  title: "Honouring Natural Time",  hint: "How do I slow down and listen?" },
    ],
    subStoneSlots: OCT_SLOTS,
  },
  {
    n: 11,
    slug: "stress-nervous-system",
    title: "Stress & Nervous System",
    question: "Is my nervous system at war, or at rest?",
    image: "https://customer-assets.emergentagent.com/job_aurin-hub/artifacts/bw1xcf7q_ChatGPT%20Image%2016.%20juni%202026%2C%2009_33_00.png", // Stone 11 Stress & Nervous System
    aspectRatio: "1536 / 1024", // landscape painting — matches image dimensions exactly (no cropping)
    aboutThisWorld: "Stress is not the enemy. Disconnection from your nervous system is. This world teaches the substrate so the symptoms can soften.",
    kaelenQuote: "A regulated nervous system is the foundation of every joy.",
    // §STONE-11 sub-stones — names sourced verbatim from the approved
    // painted asset (`bw1xcf7q_…`). 7 sub-stones, hex-plus-centre layout.
    // Legacy audio + quiz follow the "Regulation Tools" concept.
    subStones: [
      { n: 1, slug: "stress-response",        title: "Stress Response",          hint: "Fight, flight, freeze or fawn. Your body reacts to protect you." },
      { n: 2, slug: "nervous-system-basics",  title: "Nervous System Basics",    hint: "Sympathetic activates. Parasympathetic restores." },
      { n: 3, slug: "body-keeps-the-score",   title: "The Body Keeps the Score", hint: "Unprocessed stress lives on in the body." },
      { n: 4, slug: "regulation-tools",       title: "Regulation Tools",         hint: "Breath, movement, sound, touch, nature. Simple tools, profound shifts.", legacyAudio: { src: "/audio/body-architecture-week3-pause.mp3", title: "The Radical Pause", credit: "Body Architecture · Week 3" }, legacyQuiz: { href: "/body-world/v1#body-room-questionnaire", title: "Honesty Quiz", subtitle: "A guided body-region check-in" } },
      { n: 5, slug: "vagus-nerve-safety",     title: "Vagus Nerve & Safety",     hint: "Connection signals safety. Safety creates healing." },
      { n: 6, slug: "survival-to-thriving",   title: "From Survival to Thriving", hint: "Loosen what survival has tightened. Make room to live again." },
      { n: 7, slug: "integration",            title: "Integration",              hint: "Awareness becomes choice. Choice becomes freedom." },
    ],
    subStoneSlots: STONE_11_SLOTS, // vision-calibrated 2026-02-13 to painted asset
  },
  {
    n: 12,
    slug: "body-language",
    title: "Body as Language",
    question: "How does my body communicate before I say a word?",
    image: "https://customer-assets.emergentagent.com/job_aurin-hub/artifacts/wkuhq886_ChatGPT%20Image%2013.%20juni%202026%2C%2016_49_23.png",
    aspectRatio: "1402 / 1122", // landscape painting — matches image dimensions exactly
    aboutThisWorld: "Your body speaks constantly — through movement, posture, gesture, expression and energy. This world helps you understand the language of your body and use it consciously to express, connect and influence.",
    kaelenQuote: "Your body speaks the truth even when your mind is trying to lie.",
    subStones: [
      { n: 1, slug: "posture-and-presence",    title: "Posture & Presence",      hint: "What does my posture say about me?" },
      { n: 2, slug: "facial-expressions",      title: "Facial Expressions",      hint: "What am I showing without speaking?" },
      { n: 3, slug: "gestures-and-movement",   title: "Gestures & Movement",     hint: "How do I express through movement?", legacyRegion: "hands" },
      { n: 4, slug: "voice-tone-of-body",      title: "Voice & Tone of the Body",hint: "How does my body change my voice?", legacyRegion: "throat" },
      { n: 5, slug: "non-verbal-awareness",    title: "Non-Verbal Awareness",    hint: "How aware am I of what I communicate?" },
      { n: 6, slug: "impact-and-impression",   title: "Impact & Impression",     hint: "What message am I sending?" },
      { n: 7, slug: "authentic-expression",    title: "Authentic Expression",    hint: "Can I express my true self in my body?" },
      { n: 8, slug: "connection-through-body", title: "Connection Through Body", hint: "How does my body connect with others?" },
    ],
    subStoneSlots: OCT_SLOTS,
  },
  {
    n: 13,
    slug: "growth-transformation",
    title: "Growth & Transformation",
    question: "What future am I creating?",
    image: "https://customer-assets.emergentagent.com/job_aurin-hub/artifacts/toeyztpw_ChatGPT%20Image%2011.%20juni%202026%2C%2022_20_19.png", // Stone 13 Growth & Transformation
    aboutThisWorld: "Every choice you make plants the future. This world teaches you to see the consequences of how you live in your body — and to grow on purpose.",
    kaelenQuote: "You don't grow when nothing changes. You grow when you choose to change.",
    subStones: [
      { n: 1, slug: "embracing-change",        title: "Embracing Change",        hint: "Letting the new arrive" },
      { n: 2, slug: "learning-and-growing",    title: "Learning & Growing",      hint: "Becoming a student of yourself" },
      { n: 3, slug: "stepping-out-of-comfort", title: "Stepping Out of Comfort", hint: "The edge is where growth lives" },
      { n: 4, slug: "healing-and-renewal",     title: "Healing & Renewal",       hint: "Restoration before transformation" },
      { n: 5, slug: "aligning-with-purpose",   title: "Aligning with My Purpose",hint: "Direction sets the body in motion" },
      { n: 6, slug: "building-new-habits",     title: "Building New Habits",     hint: "Identity through repetition" },
      { n: 7, slug: "overcoming-fear",         title: "Overcoming Fear",         hint: "Fear as a compass, not a cage" },
      { n: 8, slug: "celebrating-progress",    title: "Celebrating Progress",    hint: "What is honoured grows" },
    ],
    subStoneSlots: OCT_SLOTS,
  },
  {
    n: 14,
    slug: "living-or-surviving",
    title: "Living or Surviving",
    question: "What kind of life do I choose?",
    image: "https://customer-assets.emergentagent.com/job_aurin-hub/artifacts/79cg7fh3_ChatGPT%20Image%2013.%20juni%202026%2C%2016_56_29.png",
    aspectRatio: "1402 / 1122", // landscape painting — matches image dimensions exactly
    aboutThisWorld: "This is the world of freedom, choice and creation. You are not here to just survive. You are here to live, love and leave your unique light in this world.",
    kaelenQuote: "You are not here to just survive. You are here to live, love and leave your light.",
    visualLanguage: "bubbles",
    // §STONE-14 sub-bubbles — names sourced verbatim from the approved
    // painted asset (`79cg7fh3_…`). 9 sub-bubbles in an organic cluster.
    // Legacy AdultPattern follows the "Letting Go of Survival Patterns"
    // concept; legacy MoodReflect follows "Living in Presence".
    subStones: [
      { n: 1, slug: "choosing-life",                title: "Choosing Life",                   hint: "I actively choose how I live." },
      { n: 2, slug: "letting-go-survival-patterns", title: "Letting Go of Survival Patterns", hint: "I release the patterns that keep me small.", legacyAdultPattern: "pattern-postponed" },
      { n: 3, slug: "trusting-the-flow",            title: "Trusting the Flow",               hint: "I move with life instead of against it." },
      { n: 4, slug: "expansion-possibility",        title: "Expansion & Possibility",         hint: "I open to what is possible." },
      { n: 5, slug: "joy-aliveness",                title: "Joy & Aliveness",                 hint: "I feel deeply, I live vibrantly." },
      { n: 6, slug: "purpose-meaning",              title: "Purpose & Meaning",               hint: "I live with reason and intention." },
      { n: 7, slug: "courage-to-be",                title: "Courage to Be Myself",            hint: "I choose truth over approval." },
      { n: 8, slug: "freedom-in-the-body",          title: "Freedom in the Body",             hint: "I am at home in my body, free." },
      { n: 9, slug: "living-in-presence",           title: "Living in Presence",              hint: "I am here, now.", legacyMoodReflect: "kaelan" },
    ],
    subStoneSlots: STONE_14_SLOTS, // vision-calibrated 2026-02-13 to painted asset
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
