/**
 * SaraChallengingSituations.jsx — § SARA WORLD 7 · CHALLENGING SITUATIONS 2026-06-18
 *
 * Painted Map Pattern interior page for Sara category #7
 * "Challenging Situations". Even in difficult seasons, relationships
 * can find a way forward.
 *
 * STRUCTURE LOCK (founder direction 2026-06-18)
 *   - Sara visual language continues: ancient tree, soft golden
 *     light, hand-painted texture, woodland atmosphere, nest motif.
 *   - At the centre — a mother and child shelter beneath the great
 *     tree after rainfall. A small lantern burns beside them. Sun
 *     breaks through the clouds and a rainbow arcs across the sky.
 *     Light after rain, not storm at midnight.
 *   - Six painted nests arranged in two vertical columns of three,
 *     each carrying a small wooden plaque with a symbolic icon:
 *         LEFT column  (top → bottom):
 *           · Change & Transitions   (🏠 house — moving wagon with belongings)
 *           · Loss & Grief           (💔 broken heart — teddy bear by lake at sunset)
 *           · Conflict & Crisis      (⚡ storm — two children turned away from each other)
 *         RIGHT column (top → bottom):
 *           · Fear & Uncertainty     (❓ question — foggy forest path with signpost and lantern)
 *           · Resilience & Recovery  (🌱 sprout — new green growth rising from stones)
 *           · Finding Hope           (☀️ sun — light rays breaking onto a forest path)
 *   - Title "CHALLENGING SITUATIONS" and subtitle "Even in difficult
 *     seasons, relationships can find a way forward." are baked into
 *     the painting — no React-rendered text overlays.
 *   - URL: /parents-room/category/challenging-situations
 *   - Each nest routes to /parents-room/category/challenging-situations/<sub>,
 *     landing on SaraCategoryStub until founder visuals arrive.
 *   - Append ?debug=1 to visualise hotspots (founder calibration).
 */
import { Link, useSearchParams } from "react-router-dom";

/* §CHALLENGING-LOCK 2026-06-18 — Founder-approved asset
 * (qw6okgoh_image.png, 3.3 MB). Title + subtitle baked into
 * the painting. DO NOT change the asset without founder
 * approval. */
const WORLD_IMAGE =
  "https://customer-assets.emergentagent.com/job_aurin-hub/artifacts/qw6okgoh_image.png";

/* §CHALLENGING-NESTS — Six painted nest hotspots arranged in two
 * vertical columns flanking the central shelter scene. Slugs are
 * kebab-case, stable for routing. Labels are agent-side identifiers
 * (the painted asset carries small icon plaques, not text plaques). */
const NEST_THEMES = [
  { slug: "change-transitions",    label: "Change & Transitions" },
  { slug: "loss-grief",            label: "Loss & Grief" },
  { slug: "conflict-crisis",       label: "Conflict & Crisis" },
  { slug: "fear-uncertainty",      label: "Fear & Uncertainty" },
  { slug: "resilience-recovery",   label: "Resilience & Recovery" },
  { slug: "finding-hope",          label: "Finding Hope" },
];

/* §NEST-ZONES — Painted nest hotspots. Coordinates measured against
 * the founder asset (native 1536×1024). Two vertical columns of three.
 * Refine via ?debug=1. */
const NEST_ZONES = [
  { slug: "change-transitions",  top: 13, left:  4, w: 22, h: 24 },  /* top-left     · moving wagon            */
  { slug: "fear-uncertainty",    top: 13, left: 74, w: 22, h: 24 },  /* top-right    · foggy signpost path     */
  { slug: "loss-grief",          top: 40, left:  4, w: 22, h: 24 },  /* mid-left     · teddy bear by lake      */
  { slug: "resilience-recovery", top: 40, left: 74, w: 22, h: 24 },  /* mid-right    · sprout from stones      */
  { slug: "conflict-crisis",     top: 68, left:  4, w: 22, h: 24 },  /* bottom-left  · two children turned away*/
  { slug: "finding-hope",        top: 68, left: 74, w: 22, h: 24 },  /* bottom-right · light rays on path      */
];

export default function SaraChallengingSituations() {
  const [params] = useSearchParams();
  const debug = params.get("debug") === "1";

  const zones = NEST_ZONES.map((z) => {
    const theme = NEST_THEMES.find((t) => t.slug === z.slug);
    return {
      id: `nest-${theme.slug}`,
      label: theme.label,
      route: `/parents-room/category/challenging-situations/${theme.slug}`,
      top: z.top,
      left: z.left,
      w: z.w,
      h: z.h,
    };
  });

  return (
    <div
      data-testid="sara-challenging-situations"
      className="relative w-full"
      style={{ backgroundColor: "#0a0d15", minHeight: "100vh" }}
    >
      <div
        className="relative w-full mx-auto"
        style={{ aspectRatio: "1536 / 1024", maxWidth: "1400px" }}
      >
        <img
          src={WORLD_IMAGE}
          alt="Challenging Situations — Even in difficult seasons, relationships can find a way forward. A mother and child shelter beneath an ancient tree after rainfall with a small lantern, while sun breaks through the clouds and a rainbow arcs across the sky, surrounded by six woven nests of difficult seasons: Change & Transitions, Loss & Grief, Conflict & Crisis, Fear & Uncertainty, Resilience & Recovery and Finding Hope."
          className="absolute inset-0 w-full h-full object-cover select-none"
          draggable={false}
          loading="eager"
          data-testid="sara-challenging-situations-image"
        />
        {zones.map((z) => (
          <Link
            key={z.id}
            to={z.route}
            data-testid={`sara-challenging-situations-zone-${z.id}`}
            aria-label={z.label}
            title={z.label}
            className="absolute block group"
            style={{
              top: `${z.top}%`,
              left: `${z.left}%`,
              width: `${z.w}%`,
              height: `${z.h}%`,
              cursor: "pointer",
              background: debug ? "rgba(255, 200, 80, 0.25)" : "transparent",
              border: debug ? "1px dashed rgba(255, 200, 80, 0.9)" : "none",
              borderRadius: "12px",
            }}
          >
            {debug && (
              <span
                className="absolute top-0 left-0 px-1 text-[10px] font-mono"
                style={{
                  background: "rgba(255,200,80,0.95)",
                  color: "#1a1305",
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
