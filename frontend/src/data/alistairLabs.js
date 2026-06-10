/**
 * alistairLabs.js — § ALISTAIR LABORATORIES OF LIFE 2026-02
 *
 * Founder spec (Anna, Estonian session): five core laboratories. Each
 * lab is a self-contained inquiry world inside Alistair. This first
 * iteration ships Money Tree as the full prototype; the other four
 * are present in the catalogue as previews ("coming later") so the
 * lab-selection page already shows the full constellation.
 *
 * Each lab carries the same shape so the renderer is universal:
 *   - hero { emoji, title, subtitle, coreQuestion }
 *   - explore   [{ title, blurb, seed }]   ← seeds /course-room/room
 *   - read      [{ title }]
 *   - experiments [{ title, question, seed }]
 *   - notes     { questions[] }
 *   - library   [{ slug, title, ...article }]  (full article objects)
 */

export const LABS = {
  "money-tree": {
    slug: "money-tree",
    emoji: "🌳",
    name: "The Money Tree Within",
    subtitle: "Exploring value, receiving, abundance and scarcity.",
    coreQuestion: "What is my relationship with value?",
    accent: "#3f8a5a",
    accentSoft: "rgba(63, 138, 90, 0.12)",
    status: "open",
    thumbnail: "/assets/alistair/labs/money-tree.png",
    short: "Explore your inner relationship with money, value and abundance.",
    explore: [
      {
        id: "scarcity-stories",
        title: "Scarcity Stories",
        blurb:
          "The sentences we inherited about not having enough — money, time, love, opportunity. Scarcity is more than money. It is a posture.",
      },
      {
        id: "receiving",
        title: "Receiving",
        blurb:
          "Why receiving so often feels harder than giving. The quiet beliefs about being worthy of compliments, help, gifts, rest.",
      },
      {
        id: "value-before-income",
        title: "Value Before Income",
        blurb:
          "What you actually offer the world, separately from what you currently charge for it. The thing that comes before money is value.",
      },
    ],
    read: [
      { id: "stories-we-learned",  title: "The Stories We Learned About Money" },
      { id: "receiving-feels-hard", title: "Why Receiving Feels Difficult" },
      { id: "scarcity-more-than-money", title: "Scarcity Is More Than Money" },
      { id: "value-before-income", title: "Value Before Income" },
      { id: "psychology-of-enough", title: "The Psychology of Enough" },
    ],
    experiments: [
      {
        id: "notice-money-story",
        title: "Notice Your Money Story",
        question: "What sentence about money do I repeat most often?",
        instruction:
          "For three days, write down every thought you notice about money. Do not edit them. By Sunday, look at the list — your money story is in there.",
      },
      {
        id: "receiving-experiment",
        title: "The Receiving Experiment",
        question: "What changes when I let one thing be received fully?",
        instruction:
          "For one week, when someone offers you something — a compliment, help, food, time — accept it without deflecting. No 'oh, you didn't have to'. Just 'thank you'. Notice what surfaces in you.",
      },
      {
        id: "value-exchange-journal",
        title: "Value Exchange Journal",
        question: "What did I genuinely add to a life today — including my own?",
        instruction:
          "Each evening for one week, write three lines: who I gave value to today, who gave value to me, what felt fair, what didn't. Read it on Sunday.",
      },
    ],
    notesQuestions: [
      "What did my family teach me about money — directly and indirectly?",
      "What feels uncomfortable about receiving?",
      "What does abundance mean to me when I do not borrow the word?",
      "Where am I undercharging — or under-asking?",
    ],
    libraryArticle: {
      slug: "the-money-tree-within",
      title: "The Money Tree Within",
      subtitle: "Why your relationship with money is rarely about money.",
      readingTime: "11 min read",
      opening:
        "Money sits at the intersection of the most invisible parts of a life — early family scenes, inherited fears, beliefs about being safe and being worthy, the question of what we deserve. So the conversation about money is almost never really about money. It is about value, receiving, scarcity, and the quiet sentences we have not yet read out loud.",
      pattern: [
        "Most people inherit a money story before they own a wallet. A parent's tightness around bills. A grandparent's wartime habits. A childhood overheard sentence — \"we cannot afford it\" — that became a way of seeing the world long before it was true.",
        "Scarcity is not only about money. The same posture shows up around time, love, attention, opportunity. The mind that learned not-enough in one area teaches itself the same in others.",
        "Receiving is often the hardest practice. Many people who are generous with others struggle to accept even a simple compliment. They deflect — \"oh it was nothing\" — and the gift slides off them, unmet.",
        "Worth and price are not the same thing. We confuse them constantly. The market sets a price. Worth is something quieter — and noticing the difference changes everything about how we negotiate, ask, and offer.",
      ],
      missed:
        "The thing most people miss is that money behaviour is rarely the root. It is a surface where deeper beliefs become visible. If you only change the behaviour, the belief reasserts itself in a year, often louder. The real work is to read the sentence underneath, in your own voice, without flinching.",
      differentQuestion:
        "Instead of \"how can I have more money?\" — try \"what is my honest relationship with value, and what would change if it were one step healthier?\" The first question is a number. The second is a life.",
      questions: [
        "What is the loudest sentence I repeat to myself about money?",
        "Who first taught me that sentence?",
        "When did receiving last feel uncomfortable, and what was happening?",
        "If I separated worth from price, which of mine would I revise — up, or down?",
      ],
      smallExperiment:
        "For one week, write down every transaction — given or received, money or otherwise. At the end, look only for the pattern of receiving. Not the spreadsheet. The posture. The honest answer is usually waiting in there.",
    },
  },

  /* Four other labs — preview only in this iteration. */
  "self-sabotage": {
    slug: "self-sabotage", emoji: "🥚",
    name: "Self-Sabotage",
    subtitle: "The patterns that quietly stand in our own way.",
    coreQuestion: "Why do I stop myself when I want something important?",
    accent: "#9a6c3a", accentSoft: "rgba(154, 108, 58, 0.12)",
    status: "coming-soon",
    thumbnail: "/assets/alistair/labs/self-sabotage.png",
    short: "Self-sabotage is not your enemy. It is a protective pattern that once helped you survive — explored here with curiosity, compassion and courage.",
  },
  /* §ALISTAIR-v2 2026-02 — Old Stories: founder-renamed inheritance/
   * narrative lab. Preserves Child & Parent themes but reframes the
   * inquiry around the inherited stories themselves rather than the
   * roles. Kept in the catalogue alongside Child & Parent until the
   * founder decides which final shape to ship. */
  "old-stories": {
    slug: "old-stories", emoji: "📖",
    name: "Old Stories",
    subtitle: "The stories you carry and how they shape your reality.",
    coreQuestion: "Which inherited story am I still living inside?",
    accent: "#8a5a36", accentSoft: "rgba(138, 90, 54, 0.12)",
    status: "coming-soon",
    thumbnail: "/assets/alistair/labs/old-stories.png",
    short: "Discover the stories you carry and how they shape your reality.",
  },
  "child-parent": {
    slug: "child-parent", emoji: "👶",
    name: "The Child and the Parent",
    subtitle: "The two voices that often speak through us.",
    coreQuestion: "Who is speaking right now?",
    accent: "#7a5fa7", accentSoft: "rgba(122, 95, 167, 0.12)",
    status: "coming-soon",
    thumbnail: "/assets/alistair/labs/child-vs-parent.png",
    short: "Inner child, inner parent, critic vs caretaker, the need beneath the reaction.",
  },
  /* §ALISTAIR-v2 2026-02 — Body Knows First: founder-introduced lab
   * pairing somatic inquiry with the existing mind-led labs. Carries
   * a sub-theme "The Body Language" which will be its own nested page
   * in the next sprint. */
  "body-knows-first": {
    slug: "body-knows-first", emoji: "🫀",
    name: "The Body Knows First",
    subtitle: "Listen to your body's wisdom and the subtle inner signals.",
    coreQuestion: "What does my body already know?",
    accent: "#b6582c", accentSoft: "rgba(182, 88, 44, 0.12)",
    status: "coming-soon",
    thumbnail: "/assets/alistair/labs/body-knows-first.png",
    short: "Learn to listen to your body's wisdom and subtle inner signals.",
  },
  "masks": {
    slug: "masks", emoji: "🎭",
    name: "The Masks We Wear",
    subtitle: "Roles, identity and belonging.",
    coreQuestion: "Who am I when no role is required?",
    accent: "#b65a4f", accentSoft: "rgba(182, 90, 79, 0.12)",
    status: "coming-soon",
    thumbnail: "/assets/alistair/labs/masks-we-wear.png",
    short: "Social roles, expectations, authenticity, belonging without pretending.",
  },
  "compass": {
    slug: "compass", emoji: "🧭",
    name: "The Compass of Meaning",
    subtitle: "Direction, values and purpose.",
    coreQuestion: "What truly matters?",
    accent: "#4a7ba6", accentSoft: "rgba(74, 123, 166, 0.12)",
    status: "coming-soon",
    thumbnail: "/assets/alistair/labs/compass.png",
    short: "Align your choices with what truly matters to you.",
  },
};

/* §ALISTAIR-v2 2026-02 — Two ordering arrays so we can show the FULL
 * catalogue on /course-room/laboratories (all 7) while the home page
 * `/course-room` features only the founder-approved 4-card path of
 * exploration. No labs are removed; nothing breaks; visibility on the
 * home grid is the only thing this affects. */
export const LAB_ORDER = [
  "money-tree",
  "old-stories",
  "self-sabotage",
  "body-knows-first",
  "child-parent",
  "masks",
  "compass",
];

export const HOME_PATH_OF_EXPLORATION = [
  "money-tree",
  "old-stories",
  "body-knows-first",
  "compass",
];
