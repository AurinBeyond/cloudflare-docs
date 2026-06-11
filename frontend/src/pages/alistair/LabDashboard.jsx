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

/* §LAB-ZONES 2026-02-10 — Per-laboratory hotspots configuration.
 * Money Tree is the calibration prototype; other labs receive their
 * topic zones in LAB_ORDER. */
const LAB_ZONES = {
  "money-tree":         { topics: MONEY_TREE_ZONES, hideSharedSidebar: true },
  "old-stories":        { topics: [] },
  "body-knows-first":   { topics: [] },
  "compass":            { topics: [] },
  "self-sabotage":      { topics: [] },
  "the-code":           { topics: [] },
  "invisible-strings":  { topics: [] },
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
