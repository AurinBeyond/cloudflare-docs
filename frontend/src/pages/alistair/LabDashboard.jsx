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
  "masks":              { topics: [] },
  "body-language":      { topics: [] },
  "child-parent":       { topics: [] },
  "body-language-v2":   { topics: [] },
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
