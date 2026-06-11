/**
 * LabDashboard.jsx — § ALISTAIR LAB DASHBOARD v5 2026-02-10
 *
 * Generic Polarstar-pattern dashboard for ALL 11 Alistair laboratories.
 *
 * Each laboratory's supplied painted mockup IS the design. The image
 * contains everything painted in — sidebar (where applicable), panels,
 * cards, conceptual labels. This component:
 *
 *   1. Renders the supplied image edge-to-edge based on the URL slug.
 *   2. Layers invisible click-zones over the painted nav (when the
 *      mockup contains a painted sidebar — `hideSharedSidebar: true`
 *      opts out for labs whose paintings do not include one).
 *   3. Layers per-lab topic hotspots over every painted conceptual
 *      area inside the lab image. Each routes to
 *      /course-room/lab/{labSlug}/topic/{topicId} (TopicDetail page).
 *
 * Coordinates are percentage-based so the page scales with viewport.
 * Append ?debug=1 to the URL to visualise every hotspot outline with
 * its zone id — used by the founder to calibrate coordinates.
 */
import { useParams, Link, useNavigate, useSearchParams } from "react-router-dom";
import { useEffect } from "react";
import { LABS } from "@/data/alistairLabs";

/* §SIDEBAR-NAV-ZONES 2026-02-08 — Reused only by labs whose painted
 * mockup includes an Alistair sidebar. Labs whose mockups do NOT have
 * a sidebar painted in must set `hideSharedSidebar: true`. */
const SHARED_SIDEBAR_ZONES = [
  { id: "back-to-labs",          label: "Back to Laboratories", route: "/course-room/laboratories",
    top: 3,  left: 80, w: 15, h: 4 },
  { id: "sidebar-home",          label: "Home",          route: "/course-room",
    top: 21, left: 1,  w: 14, h: 5 },
  { id: "sidebar-conversations", label: "Conversations", route: "/course-room/room",
    top: 27, left: 1,  w: 14, h: 5 },
  { id: "sidebar-laboratories",  label: "Laboratories",  route: "/course-room/laboratories",
    top: 33, left: 1,  w: 14, h: 5 },
  { id: "sidebar-journal",       label: "Journal",       route: "/course-room/notes",
    top: 39, left: 1,  w: 14, h: 5 },
  { id: "sidebar-insights",      label: "Insights",      route: "/course-room/experiments",
    top: 45, left: 1,  w: 14, h: 5 },
  { id: "sidebar-library",       label: "Library",       route: "/course-room/library",
    top: 51, left: 1,  w: 14, h: 5 },
];

/* §TOPIC-ZONE 2026-02-10 — helper to build per-topic hotspots that
 * resolve to /course-room/lab/{labSlug}/topic/{topicId}. The same
 * topicId may have multiple hotspots inside the same image (e.g.
 * "fear" is painted in both NEGLECTED BRANCHES and CORE BELIEFS). */
const topicZone = (labSlug, topicId, top, left, w, h, hotspotId) => ({
  id: hotspotId || `topic-${topicId}`,
  label: topicId,
  route: `/course-room/lab/${labSlug}/topic/${topicId}`,
  top, left, w, h,
});

/* §MONEY-TREE-TOPIC-ZONES 2026-02-10 — every painted conceptual area
 * on /assets/alistair/labs/money-tree.png that founder defined as a
 * clickable topic. Coordinates calibrated visually against the
 * painted mockup. Topic IDs are lowercase kebab-case and STABLE.
 *
 * Painted groups present in this image:
 *   - GARDENER ACTIONS (left panel): prune, water, plant
 *   - NOURISHED BRANCHES (left tree column): 5 topics
 *   - TRUNK / INTERNAL BELIEFS (centre column): 5 topics
 *   - NEGLECTED BRANCHES (right tree column): 5 topics
 *   - DEEPER ROOTS (bottom row 1): 5 topics
 *   - OLD STORIES — CODED BELIEFS quotes (bottom row 2): 5 quotes
 *   - CORE BELIEFS (bottom row 3 — INTERNAL PROGRAMS): 6 topics
 *   - FRUITS / LIFE RESULTS (right column): 6 topics */
const MONEY_TREE_ZONES = (() => {
  const slug = "money-tree";
  const z = (id, t, l, w, h, hid) => topicZone(slug, id, t, l, w, h, hid);

  return [
    /* GARDENER ACTIONS (left panel) */
    z("prune", 49,   3, 23, 5.5),
    z("water", 56,   3, 23, 5.5),
    z("plant", 63,   3, 23, 5.5),

    /* NOURISHED BRANCHES — left tree column (5) */
    z("opportunity",   29.1, 13.5, 11, 3.2),
    z("relationships", 32.5, 13.5, 11, 3.2),
    z("work-impact",   35.9, 13.5, 11, 3.2),
    z("creativity",    39.3, 13.5, 11, 3.2),
    z("leadership",    42.6, 13.5, 11, 3.2),

    /* TRUNK / INTERNAL BELIEFS — centre vertical column (5) */
    z("worth",     25.9, 38, 9, 3.2, "topic-worth-trunk"),
    z("trust",     29.8, 38, 9, 3.2, "topic-trust-trunk"),
    z("identity",  33.7, 38, 9, 3.2),
    z("value",     37.6, 38, 9, 3.2),
    z("receiving", 41.5, 38, 9, 3.2, "topic-receiving-trunk"),

    /* NEGLECTED BRANCHES — right tree column (5) */
    z("fear",      29.2, 56, 11, 3.2, "topic-fear-branch"),
    z("guilt",     32.1, 56, 11, 3.2),
    z("scarcity",  35.0, 56, 11, 3.2),
    z("overworking", 37.9, 56, 11, 3.2),
    z("self-sabotage", 40.9, 56, 11, 3.2),

    /* DEEPER ROOTS (5 horizontal items, bottom row 1) */
    z("family",    67.5, 24,   7, 4),
    z("childhood", 67.5, 31,   7, 4),
    z("safety",    67.5, 38,   7, 4),
    z("belonging", 67.5, 44.5, 8, 4),
    z("love",      67.5, 52.5, 7, 4),

    /* OLD STORIES — coded-belief quotes (bottom row 2) */
    z("money-doesnt-grow",   74, 20.5, 8, 5, "topic-old-money-grow"),
    z("be-realistic",        74, 29.5, 7, 4, "topic-old-be-realistic"),
    z("dont-disappoint",     74, 37.5, 8, 5, "topic-old-dont-disappoint"),
    z("work-harder",         74, 46,   7, 4, "topic-old-work-harder"),
    z("who-do-you-think",    74, 53.5, 9, 5, "topic-old-who-you-are"),

    /* CORE BELIEFS / INTERNAL PROGRAMS (bottom row 3) */
    z("worth",     82, 19,    7, 4, "topic-worth-belief"),
    z("fear",      82, 26,    7, 4, "topic-fear-belief"),
    z("approval",  82, 33,    7, 4),
    z("control",   82, 41,    7, 4),
    z("trust",     82, 49,    7, 4, "topic-trust-belief"),
    z("receiving", 82, 56.5,  7, 4, "topic-receiving-belief"),

    /* FRUITS / LIFE RESULTS — right column (6) */
    z("abundance",      66.5, 67, 13, 3.5),
    z("freedom",        70.5, 67, 13, 3.5),
    z("contribution",   74.5, 67, 13, 3.5),
    z("financial-flow", 78.7, 67, 13, 3.5),
    z("inner-peace",    83,   67, 13, 3.5),
    z("meaning",        87.5, 67, 13, 3.5),
  ];
})();

/* §OLD-STORIES-TOPIC-ZONES 2026-02-10
 * Painted groups in old-stories.png:
 *   - 5 STORY SCRAPS (right side, near book): I'm not enough,
 *     I always fail, I don't belong, I have to prove myself,
 *     It's not safe.
 *   - 5 SUB-CARDS (IN THIS LABORATORY WE EXPLORE, bottom row):
 *     Recognize, Question, Release, Rewrite, Remember.
 *   - 4 REFLECTION QUESTIONS (right column panel). */
const OLD_STORIES_ZONES = (() => {
  const slug = "old-stories";
  const z = (id, t, l, w, h, hid) => topicZone(slug, id, t, l, w, h, hid);
  return [
    // story scraps (5)
    z("im-not-enough",        7,  50, 13, 5, "topic-scrap-not-enough"),
    z("i-always-fail",        13, 43, 13, 5, "topic-scrap-always-fail"),
    z("i-dont-belong",        12, 63, 13, 5, "topic-scrap-dont-belong"),
    z("must-prove-myself",    20, 41, 13, 6, "topic-scrap-prove-myself"),
    z("not-safe",             19, 73, 13, 5, "topic-scrap-not-safe"),
    // sub-cards (5)
    z("recognize", 56, 14.5, 9, 26),
    z("question",  56, 24.5, 9, 26),
    z("release",   56, 34.5, 9, 26),
    z("rewrite",   56, 44.5, 9, 26),
    z("remember",  56, 54.5, 9, 26),
    // reflection questions (4)
    z("reflect-learned-long-ago", 58, 69, 16, 6, "topic-reflect-learned-ago"),
    z("reflect-from-whom",        65, 69, 16, 5, "topic-reflect-from-whom"),
    z("reflect-100-true",         70, 69, 16, 5, "topic-reflect-100-true"),
    z("reflect-help-limit",       75, 69, 16, 7, "topic-reflect-help-limit"),
  ];
})();

/* §BODY-KNOWS-FIRST-TOPIC-ZONES 2026-02-10
 * Painted groups in body-knows-first.png:
 *   - 5 right side panel items: Feel, Breathe, Listen, Trust, Integrate
 *   - Tab bar (6): Overview, Body Signals, Nervous System, Practices,
 *     Insights, Journal
 *   - 5 sub-cards: Sensations, Triggers, Patterns, Regulation, Integration
 *   - Body Check-in 7 states + Check-in CTA
 *   - 4 reflection questions */
const BODY_KNOWS_FIRST_ZONES = (() => {
  const slug = "body-knows-first";
  const z = (id, t, l, w, h, hid) => topicZone(slug, id, t, l, w, h, hid);
  return [
    // right side panel (5)
    z("feel",      11, 84, 14, 6, "topic-side-feel"),
    z("breathe",   18, 84, 14, 6, "topic-side-breathe"),
    z("listen",    25, 84, 14, 6, "topic-side-listen"),
    z("trust",     32, 84, 14, 6, "topic-side-trust"),
    z("integrate", 39, 84, 14, 6, "topic-side-integrate"),
    // tab bar (6)
    z("overview",       42, 14, 10, 4, "topic-tab-overview"),
    z("body-signals",   42, 25, 12, 4, "topic-tab-body-signals"),
    z("nervous-system", 42, 38, 13, 4, "topic-tab-nervous-system"),
    z("practices",      42, 52, 11, 4, "topic-tab-practices"),
    z("insights",       42, 64, 10, 4, "topic-tab-insights"),
    z("journal",        42, 74, 10, 4, "topic-tab-journal"),
    // sub-cards (5)
    z("sensations",  53, 14, 10, 27),
    z("triggers",    53, 24.5, 10, 27),
    z("patterns",    53, 35, 10, 27),
    z("regulation",  53, 45.5, 10, 27),
    z("integration", 53, 56, 10, 27),
    // body check-in 7 states (compact column)
    z("state-tense",    59, 67, 8, 3, "topic-state-tense"),
    z("state-tired",    62.5, 67, 8, 3, "topic-state-tired"),
    z("state-restless", 66, 67, 8, 3, "topic-state-restless"),
    z("state-calm",     69.5, 67, 8, 3, "topic-state-calm"),
    z("state-open",     73, 67, 8, 3, "topic-state-open"),
    z("state-energized", 76.5, 67, 8, 3, "topic-state-energized"),
    z("state-other",    80, 67, 8, 3, "topic-state-other"),
    // reflection questions (4)
    z("reflect-trying-to-tell", 58, 78, 15, 6, "topic-reflect-body-trying"),
    z("reflect-tension",        65, 78, 15, 5, "topic-reflect-tension"),
    z("reflect-need-more",      71, 78, 15, 6, "topic-reflect-need-more"),
    z("reflect-next-small-step", 78, 78, 15, 5, "topic-reflect-next-step"),
  ];
})();

/* §COMPASS-TOPIC-ZONES 2026-02-10
 * Painted groups in compass.png (no Alistair sidebar):
 *   - 6 compass topics around the soul compass: PURPOSE, TRUTH,
 *     CALLING, GROWTH, JOY, GIFTS.
 *   - 4 paths bottom row: OLD PATH, HEALING PATH, EXPANSION PATH, SOUL PATH.
 *   - SIGNS YOU'RE OFF PATH panel (left bottom): 6 items.
 *   - COMPASS CHECK-IN panel (right top): 4 items.
 *   - YOUR NEXT RIGHT STEP, REMEMBER panels (right). */
const COMPASS_ZONES = (() => {
  const slug = "compass";
  const z = (id, t, l, w, h, hid) => topicZone(slug, id, t, l, w, h, hid);
  return [
    // 6 compass topics
    z("purpose", 10, 31, 12, 11),
    z("truth",   10, 60, 12, 11),
    z("gifts",   28, 30, 12, 11),
    z("calling", 28, 60, 12, 11),
    z("joy",     45, 32, 12, 11),
    z("growth",  45, 60, 12, 11),
    // 4 paths
    z("old-path",       77, 14, 13, 13, "topic-path-old"),
    z("healing-path",   77, 28, 13, 13, "topic-path-healing"),
    z("expansion-path", 77, 47, 13, 13, "topic-path-expansion"),
    z("soul-path",      77, 63, 13, 13, "topic-path-soul"),
    // SIGNS OFF PATH (left bottom) — 6 items
    z("sign-drained",        45, 1, 14, 5, "topic-sign-drained"),
    z("sign-weekends",       51, 1, 14, 5, "topic-sign-weekends"),
    z("sign-ignore-nudges",  57, 1, 14, 5, "topic-sign-ignore"),
    z("sign-people-please",  62, 1, 14, 5, "topic-sign-people-please"),
    z("sign-stuck",          68, 1, 14, 5, "topic-sign-stuck"),
    z("sign-doubt-self",     73, 1, 14, 5, "topic-sign-doubt"),
    // COMPASS CHECK-IN (right top) — 4 items
    z("checkin-alignment",  7,  83, 16, 5, "topic-checkin-alignment"),
    z("checkin-expand",     12, 83, 16, 5, "topic-checkin-expand"),
    z("checkin-closer",     18, 83, 16, 5, "topic-checkin-closer"),
    z("checkin-future-self", 24, 83, 16, 5, "topic-checkin-future-self"),
    // YOUR NEXT RIGHT STEP, REMEMBER
    z("next-right-step", 41, 83, 16, 16, "topic-next-step"),
    z("remember",        76, 83, 16, 12, "topic-remember-panel"),
  ];
})();

/* §SELF-SABOTAGE-TOPIC-ZONES 2026-02-10
 * Painted groups in self-sabotage.png (with Alistair sidebar):
 *   - HOW WE EXPLORE (right column): NOTICE, INQUIRE, EXPERIMENT, INTEGRATE
 *   - 5 sub-cards: HIDDEN PATTERNS, ROOT BELIEFS, EMOTIONAL TRIGGERS,
 *     NEW CHOICES, SELF-TRUST */
const SELF_SABOTAGE_ZONES = (() => {
  const slug = "self-sabotage";
  const z = (id, t, l, w, h, hid) => topicZone(slug, id, t, l, w, h, hid);
  return [
    // HOW WE EXPLORE (right column)
    z("notice",     6,  77, 21, 12, "topic-step-notice"),
    z("inquire",    19, 77, 21, 12, "topic-step-inquire"),
    z("experiment", 32, 77, 21, 12, "topic-step-experiment"),
    z("integrate",  46, 77, 21, 12, "topic-step-integrate"),
    // 5 sub-cards
    z("hidden-patterns",   62, 17, 10, 30),
    z("root-beliefs",      62, 28, 10, 30),
    z("emotional-triggers", 62, 38, 10, 30),
    z("new-choices",       62, 49, 10, 30),
    z("self-trust",        62, 59, 10, 30),
  ];
})();

/* §THE-CODE-TOPIC-ZONES 2026-02-10
 * Painted groups in the-code.png (no Alistair sidebar):
 *   - 5 external influencer figures top: PARENTS, SOCIETY, CULTURE,
 *     PARTNER, SYSTEMS
 *   - 6 "code thoughts" around middle figure: I SHOULD MAKE THEM
 *     PROUD, I NEED TO KEEP THE PEACE, I DON'T WANT TO DISAPPOINT,
 *     I NEED TO BE LOVED, I'LL DO IT SOMEDAY, I CAN'T ROCK THE BOAT
 *   - INTERNAL INFLUENCERS panel (left mid): 6 items
 *   - EXTERNAL INFLUENCERS panel (right top): 6 items
 *   - 5 life-area panels (right): AT WORK, IN RELATIONSHIPS, ONLINE,
 *     IN SOCIETY, AS A CONSUMER
 *   - THE CODE chain bottom: CONDITIONING > REPETITION > IDENTITY >
 *     LOYALTY > FEAR > SHAME
 *   - YOUR NEXT RIGHT STEP, YOUR FREEDOM panels */
const THE_CODE_ZONES = (() => {
  const slug = "the-code";
  const z = (id, t, l, w, h, hid) => topicZone(slug, id, t, l, w, h, hid);
  return [
    // 5 external influencer figures
    z("ext-parents",  4, 22, 13, 18, "topic-ext-parents"),
    z("ext-society",  4, 36, 13, 18, "topic-ext-society"),
    z("ext-culture",  4, 50, 13, 18, "topic-ext-culture"),
    z("ext-partner",  4, 63, 13, 18, "topic-ext-partner"),
    z("ext-systems",  4, 76, 13, 18, "topic-ext-systems"),
    // 6 code thoughts around figure
    z("thought-make-proud",   30, 27, 12, 6, "topic-thought-proud"),
    z("thought-keep-peace",   30, 58, 12, 6, "topic-thought-peace"),
    z("thought-disappoint",   42, 28, 13, 5, "topic-thought-disappoint"),
    z("thought-be-loved",     42, 58, 13, 5, "topic-thought-loved"),
    z("thought-someday",      57, 27, 12, 5, "topic-thought-someday"),
    z("thought-rock-boat",    57, 58, 12, 5, "topic-thought-rock-boat"),
    // INTERNAL INFLUENCERS panel (left)
    z("int-fear-not-enough",  43, 2, 13, 5, "topic-int-fear-enough"),
    z("int-need-approval",    50, 2, 13, 5, "topic-int-approval"),
    z("int-old-stories",      56, 2, 13, 5, "topic-int-old-stories"),
    z("int-self-doubt",       62, 2, 13, 5, "topic-int-self-doubt"),
    z("int-comfort-addiction", 68, 2, 13, 5, "topic-int-comfort"),
    z("int-avoiding-pain",    74, 2, 13, 5, "topic-int-avoiding-pain"),
    // EXTERNAL INFLUENCERS panel (right)
    z("ext-judgment",       18, 84, 13, 4, "topic-ext-judgment"),
    z("ext-comparison",     24, 84, 13, 4, "topic-ext-comparison"),
    z("ext-social-media",   30, 84, 13, 4, "topic-ext-social-media"),
    z("ext-money-status",   36, 84, 13, 4, "topic-ext-money-status"),
    z("ext-rules-authority", 42, 84, 13, 4, "topic-ext-rules"),
    z("ext-masks-roles",    48, 84, 13, 4, "topic-ext-masks"),
    // 5 life-area panels (far right)
    z("life-at-work",          11, 91, 9, 7, "topic-life-at-work"),
    z("life-relationships",    24, 91, 9, 7, "topic-life-relationships"),
    z("life-online",           38, 91, 9, 7, "topic-life-online"),
    z("life-society",          54, 91, 9, 7, "topic-life-society"),
    z("life-consumer",         68, 91, 9, 7, "topic-life-consumer"),
    // THE CODE chain (bottom)
    z("code-conditioning", 85, 28, 9, 8, "topic-code-conditioning"),
    z("code-repetition",   85, 36, 9, 8, "topic-code-repetition"),
    z("code-identity",     85, 44, 9, 8, "topic-code-identity"),
    z("code-loyalty",      85, 51, 9, 8, "topic-code-loyalty"),
    z("code-fear",         85, 58, 9, 8, "topic-code-fear-shame"),
    z("code-shame",        85, 65, 9, 8, "topic-code-shame"),
    // panels
    z("next-right-step", 56, 80, 17, 18, "topic-next-step"),
    z("your-freedom",    88, 80, 17, 10, "topic-your-freedom"),
  ];
})();

/* §INVISIBLE-STRINGS-TOPIC-ZONES 2026-02-10
 * Painted groups in invisible-strings.png (no Alistair sidebar):
 *   - 5 corner panels: CAREER & WORK, FINANCES, SOCIAL IMAGE,
 *     HABITS & ADDICTIONS, SELF IMAGE
 *   - 7 painted "string thoughts" around figure: I NEED APPROVAL,
 *     I CAN'T DISAPPOINT, I MUST BE BUSY, I NEED MORE TO BE ENOUGH,
 *     I'LL BE HAPPY WHEN, I CAN'T SAY NO, I DON'T WANT CONFLICT
 *   - 4-step bottom nav: THE TRUTH, AWARENESS, FREEDOM, YOUR TURN */
const INVISIBLE_STRINGS_ZONES = (() => {
  const slug = "invisible-strings";
  const z = (id, t, l, w, h, hid) => topicZone(slug, id, t, l, w, h, hid);
  return [
    // 5 corner panels
    z("panel-career-work",     33, 2,  13, 17, "topic-panel-career"),
    z("panel-finances",        66, 2,  13, 13, "topic-panel-finances"),
    z("panel-social-image",    13, 84, 14, 17, "topic-panel-social"),
    z("panel-habits-addictions", 38, 84, 14, 14, "topic-panel-habits"),
    z("panel-self-image",      67, 84, 14, 14, "topic-panel-self-image"),
    // 7 painted string thoughts
    z("string-need-approval",   32, 33, 14, 5, "topic-string-approval"),
    z("string-cant-disappoint", 32, 53, 14, 5, "topic-string-disappoint"),
    z("string-must-be-busy",    44, 31, 12, 5, "topic-string-busy"),
    z("string-need-more",       44, 56, 14, 5, "topic-string-need-more"),
    z("string-happy-when",      62, 34, 12, 5, "topic-string-happy"),
    z("string-cant-say-no",     62, 56, 11, 5, "topic-string-cant-say-no"),
    z("string-no-conflict",     80, 39, 14, 5, "topic-string-no-conflict"),
    // 4-step bottom nav
    z("step-truth",     93, 8,  18, 6, "topic-step-truth"),
    z("step-awareness", 93, 28, 18, 6, "topic-step-awareness"),
    z("step-freedom",   93, 50, 18, 6, "topic-step-freedom"),
    z("step-your-turn", 93, 72, 18, 6, "topic-step-your-turn"),
  ];
})();

/* §MASKS-TOPIC-ZONES 2026-02-10
 * Painted groups in masks-we-wear.png (Alistair sidebar present):
 *   - 6 floating masks (right): Achiever, Strong One, Good One,
 *     Provider, Pleaser, Helper
 *   - Tab bar (8): Overview, Masks, Why We Wear Them, Costs, Discovery,
 *     Integration, Insights, Journal
 *   - 6 sub-cards: Recognize, Understand, Release, Remember, Integrate, Express
 *   - REFLECT panel (5 questions)
 *   - MASKS EXAMPLES list (9 archetypes) */
const MASKS_ZONES = (() => {
  const slug = "masks";
  const z = (id, t, l, w, h, hid) => topicZone(slug, id, t, l, w, h, hid);
  return [
    // 6 floating masks (right portrait)
    z("achiever", 8,  50, 12, 6, "topic-mask-achiever"),
    z("provider", 8,  77, 11, 6, "topic-mask-provider"),
    z("strong-one", 28, 47, 13, 6, "topic-mask-strong-one"),
    z("pleaser", 24, 80, 11, 6, "topic-mask-pleaser"),
    z("good-one", 36, 42, 11, 6, "topic-mask-good-one"),
    z("helper",  37, 75, 11, 6, "topic-mask-helper"),
    // tabs (8)
    z("overview",    47, 16, 10, 4, "topic-tab-overview"),
    z("masks-tab",   47, 24, 10, 4, "topic-tab-masks"),
    z("why-we-wear", 47, 32, 13, 4, "topic-tab-why-wear"),
    z("costs",       47, 44, 8,  4, "topic-tab-costs"),
    z("discovery",   47, 51, 11, 4, "topic-tab-discovery"),
    z("integration", 47, 61, 11, 4, "topic-tab-integration"),
    z("insights",    47, 72, 9,  4, "topic-tab-insights"),
    z("journal",     47, 80, 9,  4, "topic-tab-journal"),
    // 6 sub-cards
    z("recognize",  60, 14, 9, 27, "topic-mcard-recognize"),
    z("understand", 60, 24, 9, 27),
    z("release",    60, 34, 9, 27, "topic-mcard-release"),
    z("remember",   60, 44, 9, 27, "topic-mcard-remember"),
    z("integrate",  60, 54, 9, 27, "topic-mcard-integrate"),
    z("express",    60, 64, 9, 27),
    // REFLECT panel (5 questions)
    z("reflect-masks-most-often",  60, 72, 16, 5, "topic-mreflect-most-often"),
    z("reflect-where-learn",       66, 72, 16, 5, "topic-mreflect-where-learn"),
    z("reflect-afraid-took-off",   70, 72, 16, 6, "topic-mreflect-afraid-off"),
    z("reflect-who-without",       76, 72, 16, 6, "topic-mreflect-without"),
    z("reflect-authenticity-change", 82, 72, 16, 6, "topic-mreflect-authenticity"),
    // MASKS EXAMPLES (9 archetypes, far right)
    z("ex-achiever",         60, 88, 11, 3.5, "topic-ex-achiever"),
    z("ex-pleaser",          64, 88, 11, 3.5, "topic-ex-pleaser"),
    z("ex-strong-one",       68, 88, 11, 3.5, "topic-ex-strong-one"),
    z("ex-provider",         71, 88, 11, 3.5, "topic-ex-provider"),
    z("ex-helper",           74, 88, 11, 3.5, "topic-ex-helper"),
    z("ex-good-one",         78, 88, 11, 3.5, "topic-ex-good-one"),
    z("ex-control-freak",    82, 88, 11, 3.5, "topic-ex-control-freak"),
    z("ex-independent-one",  85, 88, 11, 3.5, "topic-ex-independent-one"),
    z("ex-caregiver",        89, 88, 11, 3.5, "topic-ex-caregiver"),
  ];
})();

/* §BODY-LANGUAGE-TOPIC-ZONES 2026-02-10
 * Painted groups in body-language-v1.png (Alistair sidebar present):
 *   - 6 body part labels on figure: Shoulders, Jaw, Back, Heart, Stomach, Hips
 *   - 7 right side "THE BODY SPEAKS THROUGH": Posture, Breath, Tension,
 *     Movement, Gesture, Micro-expressions, Energy
 *   - 6 sub-cards (body signals): Tight Shoulders, Tight Jaw, Shallow Breath,
 *     Crossed Arms, Tight Stomach, Fidgeting Hands
 *   - PRACTICE IN THIS LAB list (7): Body Scan, Posture Check-In,
 *     Breath Awareness, Tension Release, Mirror Practice, Movement
 *     Awareness, Emotion Mapping
 *   - REFLECTION QUESTIONS (4) */
const BODY_LANGUAGE_ZONES = (() => {
  const slug = "body-language";
  const z = (id, t, l, w, h, hid) => topicZone(slug, id, t, l, w, h, hid);
  return [
    // 6 body part labels on the figure
    z("body-shoulders", 13, 40, 8, 5, "topic-bp-shoulders"),
    z("body-jaw",       13, 60, 8, 5, "topic-bp-jaw"),
    z("body-back",      31, 39, 8, 5, "topic-bp-back"),
    z("body-heart",     31, 60, 8, 5, "topic-bp-heart"),
    z("body-stomach",   48, 39, 8, 5, "topic-bp-stomach"),
    z("body-hips",      48, 61, 8, 5, "topic-bp-hips"),
    // 7 right panel "THE BODY SPEAKS THROUGH"
    z("posture",          13, 81, 16, 6, "topic-speaks-posture"),
    z("breath",           20, 81, 16, 6, "topic-speaks-breath"),
    z("tension",          27, 81, 16, 6, "topic-speaks-tension"),
    z("movement",         34, 81, 16, 6, "topic-speaks-movement"),
    z("gesture",          41, 81, 16, 6, "topic-speaks-gesture"),
    z("micro-expressions", 48, 81, 16, 6, "topic-speaks-micro"),
    z("energy",           55, 81, 16, 6, "topic-speaks-energy"),
    // 6 sub-cards (body signals)
    z("tight-shoulders", 60, 14, 9, 27, "topic-sig-tight-shoulders"),
    z("tight-jaw",       60, 24, 9, 27, "topic-sig-tight-jaw"),
    z("shallow-breath",  60, 34, 9, 27, "topic-sig-shallow-breath"),
    z("crossed-arms",    60, 44, 9, 27, "topic-sig-crossed-arms"),
    z("tight-stomach",   60, 54, 9, 27, "topic-sig-tight-stomach"),
    z("fidgeting-hands", 60, 64, 9, 27, "topic-sig-fidgeting-hands"),
    // PRACTICE IN THIS LAB (7)
    z("practice-body-scan",         62, 71, 14, 4, "topic-prac-body-scan"),
    z("practice-posture-checkin",   66, 71, 14, 4, "topic-prac-posture-checkin"),
    z("practice-breath-awareness",  70, 71, 14, 4, "topic-prac-breath-awareness"),
    z("practice-tension-release",   74, 71, 14, 4, "topic-prac-tension-release"),
    z("practice-mirror",            78, 71, 14, 4, "topic-prac-mirror"),
    z("practice-movement-awareness", 82, 71, 14, 4, "topic-prac-movement"),
    z("practice-emotion-mapping",   86, 71, 14, 4, "topic-prac-emotion-mapping"),
    // REFLECTION QUESTIONS (4)
    z("reflect-body-tell-me",       62, 86, 14, 6, "topic-blreflect-tell-me"),
    z("reflect-tension-most-often", 70, 86, 14, 6, "topic-blreflect-tension-often"),
    z("reflect-emotion-behind",     78, 86, 14, 6, "topic-blreflect-emotion-behind"),
    z("reflect-last-listened",      86, 86, 14, 6, "topic-blreflect-last-listened"),
  ];
})();

/* §CHILD-PARENT-TOPIC-ZONES 2026-02-10
 * Painted groups in child-vs-parent.png (no Alistair sidebar):
 *   - 4 wooden signposts (left CHILD WORLD): Imagine, Play, Discover, Wonder
 *   - 4 right panels (PARENT WORLD): Awareness, Choice, Growth, Transformation
 *   - 10 centre comparison categories: Focus, Energy, Learning, Language,
 *     Questions, Time, World, Guides, Strength, Themes
 *   - Child traits (9 visible): Explores, Plays, Imagines, Feels, Asks "What if?",
 *     Lives in the moment, Adventures, Characters, Expresses freely
 *   - Parent traits (9): Reflects, Guides, Understands, Communicates, Asks "Why?",
 *     Learns from time, Navigates life, Mentors, Responsibility */
const CHILD_PARENT_ZONES = (() => {
  const slug = "child-parent";
  const z = (id, t, l, w, h, hid) => topicZone(slug, id, t, l, w, h, hid);
  return [
    // Child world signposts (left)
    z("imagine",  22, 3, 11, 5, "topic-sign-imagine"),
    z("play",     28, 3, 11, 5, "topic-sign-play"),
    z("discover", 34, 3, 11, 5, "topic-sign-discover"),
    z("wonder",   40, 3, 11, 5, "topic-sign-wonder"),
    // Parent world panels (right)
    z("awareness",     11, 91, 9, 5, "topic-pp-awareness"),
    z("choice",        18, 91, 9, 5, "topic-pp-choice"),
    z("growth",        25, 91, 9, 5, "topic-pp-growth"),
    z("transformation", 32, 91, 12, 5, "topic-pp-transformation"),
    // Centre comparison categories (10)
    z("focus",      53, 41, 13, 4, "topic-cmp-focus"),
    z("energy",     59, 41, 13, 4, "topic-cmp-energy"),
    z("learning",   65, 41, 13, 4, "topic-cmp-learning"),
    z("language",   71, 41, 13, 4, "topic-cmp-language"),
    z("questions",  77, 41, 13, 4, "topic-cmp-questions"),
    z("time",       83, 41, 13, 4, "topic-cmp-time"),
    z("world",      89, 41, 13, 4, "topic-cmp-world"),
    z("guides",     94, 41, 13, 4, "topic-cmp-guides"),
    z("strength",   97, 41, 13, 3, "topic-cmp-strength"),
    // child traits left (9)
    z("child-explores",  58, 6,  20, 4, "topic-c-explores"),
    z("child-plays",     63, 6,  20, 4, "topic-c-plays"),
    z("child-imagines",  68, 6,  20, 4, "topic-c-imagines"),
    z("child-feels",     72, 6,  20, 4, "topic-c-feels"),
    z("child-asks-what-if", 77, 6, 20, 4, "topic-c-what-if"),
    z("child-lives-moment", 81, 6, 20, 4, "topic-c-lives-moment"),
    z("child-adventures",   86, 6, 20, 4, "topic-c-adventures"),
    z("child-characters",   90, 6, 20, 4, "topic-c-characters"),
    z("child-expresses",    94, 6, 20, 4, "topic-c-expresses"),
    // parent traits right (9)
    z("parent-reflects",     58, 74, 20, 4, "topic-p-reflects"),
    z("parent-guides",       63, 74, 20, 4, "topic-p-guides"),
    z("parent-understands",  68, 74, 20, 4, "topic-p-understands"),
    z("parent-communicates", 72, 74, 20, 4, "topic-p-communicates"),
    z("parent-asks-why",     77, 74, 20, 4, "topic-p-why"),
    z("parent-learns-time",  81, 74, 20, 4, "topic-p-learns-time"),
    z("parent-navigates",    86, 74, 20, 4, "topic-p-navigates"),
    z("parent-mentors",      90, 74, 20, 4, "topic-p-mentors"),
    z("parent-responsibility", 94, 74, 20, 4, "topic-p-responsibility"),
  ];
})();

/* §BODY-LANGUAGE-V2-TOPIC-ZONES 2026-02-10
 * Painted groups in body-language-v2.png (Alistair sidebar present):
 *   - 6 right panel body areas: Jaw (Holding back), Shoulders (Carrying weight),
 *     Heart (Connection), Breath (Safety & flow), Belly (Intuition),
 *     Hands (Expression)
 *   - Tab bar (8): Overview, Expressions, Posture, Gestures, Emotions,
 *     Awareness, Insights, Journal
 *   - 6 sub-cards: Awareness, Interpret, Align, Release, Express, Embody
 *   - BODY LANGUAGE MAP (7 areas): Head & Mind, Face & Expression,
 *     Shoulders & Chest, Heart & Breath, Belly & Gut, Hands & Arms, Legs & Feet
 *   - REFLECTION QUESTIONS (5) */
const BODY_LANGUAGE_V2_ZONES = (() => {
  const slug = "body-language-v2";
  const z = (id, t, l, w, h, hid) => topicZone(slug, id, t, l, w, h, hid);
  return [
    // 6 right panel body areas
    z("jaw-holding-back",       9,  81, 17, 6, "topic-area-jaw"),
    z("shoulders-carrying",     15, 81, 17, 6, "topic-area-shoulders"),
    z("heart-connection",       22, 81, 17, 6, "topic-area-heart"),
    z("breath-safety-flow",     28, 81, 17, 6, "topic-area-breath"),
    z("belly-intuition",        34, 81, 17, 6, "topic-area-belly"),
    z("hands-expression",       40, 81, 17, 6, "topic-area-hands"),
    // tab bar (8)
    z("overview",    47, 16, 10, 4, "topic-tab-overview"),
    z("expressions", 47, 26, 12, 4, "topic-tab-expressions"),
    z("posture",     47, 37, 9,  4, "topic-tab-posture"),
    z("gestures",    47, 45, 10, 4, "topic-tab-gestures"),
    z("emotions",    47, 53, 10, 4, "topic-tab-emotions"),
    z("awareness",   47, 62, 11, 4, "topic-tab-awareness"),
    z("insights",    47, 72, 9,  4, "topic-tab-insights"),
    z("journal",     47, 80, 9,  4, "topic-tab-journal"),
    // 6 sub-cards
    z("awareness-card", 60, 14, 8, 27, "topic-blv2-awareness"),
    z("interpret",      60, 23, 8, 27, "topic-blv2-interpret"),
    z("align",          60, 32, 8, 27, "topic-blv2-align"),
    z("release",        60, 41, 8, 27, "topic-blv2-release"),
    z("express",        60, 50, 8, 27, "topic-blv2-express"),
    z("embody",         60, 59, 8, 27, "topic-blv2-embody"),
    // BODY LANGUAGE MAP (7 areas)
    z("map-head-mind",          60, 67, 14, 4, "topic-map-head-mind"),
    z("map-face-expression",    65, 67, 14, 4, "topic-map-face"),
    z("map-shoulders-chest",    70, 67, 14, 4, "topic-map-shoulders-chest"),
    z("map-heart-breath",       75, 67, 14, 4, "topic-map-heart-breath"),
    z("map-belly-gut",          80, 67, 14, 4, "topic-map-belly-gut"),
    z("map-hands-arms",         85, 67, 14, 4, "topic-map-hands-arms"),
    z("map-legs-feet",          90, 67, 14, 4, "topic-map-legs-feet"),
    // REFLECTION QUESTIONS (5)
    z("reflect-body-most-often", 60, 84, 16, 5, "topic-blv2-reflect-most-often"),
    z("reflect-hold-tension",    66, 84, 16, 5, "topic-blv2-reflect-tension"),
    z("reflect-posture-feel",    71, 84, 16, 5, "topic-blv2-reflect-posture"),
    z("reflect-when-safe",       76, 84, 16, 5, "topic-blv2-reflect-when-safe"),
    z("reflect-love-to-express", 82, 84, 16, 6, "topic-blv2-reflect-love-express"),
  ];
})();

/* §LAB-ZONES 2026-02-10 — Per-laboratory hotspots configuration.
 * Money Tree is the calibration prototype; other labs receive their
 * topic zones in LAB_ORDER. */
const LAB_ZONES = {
  "money-tree":         { topics: MONEY_TREE_ZONES, hideSharedSidebar: true },
  "old-stories":        { topics: OLD_STORIES_ZONES },
  "body-knows-first":   { topics: BODY_KNOWS_FIRST_ZONES },
  "compass":            { topics: COMPASS_ZONES, hideSharedSidebar: true },
  "self-sabotage":      { topics: SELF_SABOTAGE_ZONES },
  "the-code":           { topics: THE_CODE_ZONES, hideSharedSidebar: true },
  "invisible-strings":  { topics: INVISIBLE_STRINGS_ZONES, hideSharedSidebar: true },
  "masks":              { topics: MASKS_ZONES },
  "body-language":      { topics: BODY_LANGUAGE_ZONES },
  "child-parent":       { topics: CHILD_PARENT_ZONES, hideSharedSidebar: true },
  "body-language-v2":   { topics: BODY_LANGUAGE_V2_ZONES },
};

export default function LabDashboard() {
  const { labSlug } = useParams();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const debug = params.get("debug") === "1";
  const lab = LABS[labSlug];

  /* §RENDER-GUARD 2026-02-08 — Navigate must be deferred to useEffect. */
  useEffect(() => {
    if (!lab) {
      navigate("/course-room/laboratories", { replace: true });
    }
  }, [lab, navigate]);

  if (!lab) return null;

  const heroImage = lab.thumbnail || `/assets/alistair/labs/${labSlug}.png`;
  const labZones = LAB_ZONES[labSlug] || { topics: [], hideSharedSidebar: false };
  const sidebar = labZones.hideSharedSidebar ? [] : SHARED_SIDEBAR_ZONES;
  const zones = [...sidebar, ...labZones.topics];

  return (
    <div
      data-testid={`lab-dashboard-${labSlug}`}
      className="relative w-full"
      style={{ backgroundColor: "#0a0d15", minHeight: "100vh" }}
    >
      <div
        className="relative w-full"
        style={{ aspectRatio: "1536 / 1024", maxWidth: "100vw" }}
      >
        <img
          src={heroImage}
          alt={`${lab.name} · ${lab.subtitle}`}
          className="absolute inset-0 w-full h-full object-cover select-none"
          draggable={false}
          loading="eager"
          data-testid="lab-dashboard-image"
        />
        {zones.map((z) => (
          <Link
            key={z.id}
            to={z.route}
            data-testid={`lab-zone-${z.id}`}
            aria-label={z.label}
            title={z.label}
            className="absolute block"
            style={{
              top: `${z.top}%`,
              left: `${z.left}%`,
              width: `${z.w}%`,
              height: `${z.h}%`,
              cursor: "pointer",
              background: debug ? "rgba(255, 80, 80, 0.22)" : "transparent",
              border: debug ? "1px dashed rgba(255, 80, 80, 0.9)" : "none",
            }}
          >
            {debug && (
              <span
                className="absolute top-0 left-0 px-1 text-[10px] font-mono"
                style={{
                  background: "rgba(255,80,80,0.9)",
                  color: "#fff",
                  pointerEvents: "none",
                  whiteSpace: "nowrap",
                }}
              >
                {z.id}
              </span>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}
