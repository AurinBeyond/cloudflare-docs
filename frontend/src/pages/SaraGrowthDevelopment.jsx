/**
 * SaraGrowthDevelopment.jsx — § SARA WORLD 5 · GROWTH & DEVELOPMENT 2026-06-18
 *
 * Painted Map Pattern interior page for Sara category #5
 * "Growth & Development". Growth is not a race — it is a journey
 * of becoming.
 *
 * STRUCTURE LOCK (founder direction 2026-06-18)
 *   - Sara visual language continues: ancient tree, soft golden
 *     light, hand-painted texture, woodland atmosphere, nest motif.
 *   - At the centre — a child kneels with a magnifying glass over a
 *     small sapling growing from a circle of stones. A second child
 *     walks down the forest path in the background, lantern in
 *     hand. Becoming, not racing.
 *   - Six painted nests arranged in two vertical columns of three —
 *     left side and right side of the painting:
 *         LEFT column  (top → bottom):
 *           · Development Stages          (tree rings · seasons)
 *           · Learning Through Experience (small wanderer on forest path)
 *           · Confidence & Resilience     (dandelion blooming through rocks)
 *         RIGHT column (top → bottom):
 *           · Curiosity & Discovery       (boy with magnifying glass + butterfly)
 *           · Mistakes & Growth           (cracked clay pot, new sprout rising)
 *           · Becoming Yourself           (full-bloom solitary tree)
 *   - Title "GROWTH & DEVELOPMENT" and subtitle "Growth is not a race.
 *     It is a journey of becoming." are baked into the painting — no
 *     React-rendered text overlays.
 *   - URL: /parents-room/category/growth-development
 *   - Each nest routes to /parents-room/category/growth-development/<sub>,
 *     landing on SaraCategoryStub until founder visuals arrive.
 *   - Append ?debug=1 to visualise hotspots (founder calibration).
 */
import { Link, useSearchParams } from "react-router-dom";

/* §GROWTH-LOCK 2026-06-18 — Founder-approved asset
 * (fub9m0yw_image.png, 3.4 MB). Title + subtitle baked into
 * the painting. DO NOT change the asset without founder
 * approval. */
const WORLD_IMAGE =
  "https://customer-assets.emergentagent.com/job_aurin-hub/artifacts/fub9m0yw_image.png";

/* §GROWTH-NESTS — Six painted nest hotspots arranged in two vertical
 * columns flanking the central sapling scene. Slugs are kebab-case,
 * stable for routing. Labels are agent-side identifiers (this asset
 * does not carry wooden plaques inside the nests — the symbolism is
 * the navigation). */
const NEST_THEMES = [
  { slug: "development-stages",         label: "Development Stages" },
  { slug: "learning-through-experience", label: "Learning Through Experience" },
  { slug: "confidence-resilience",      label: "Confidence & Resilience" },
  { slug: "curiosity-discovery",        label: "Curiosity & Discovery" },
  { slug: "mistakes-growth",            label: "Mistakes & Growth" },
  { slug: "becoming-yourself",          label: "Becoming Yourself" },
];

/* §NEST-ZONES — Painted nest hotspots. Coordinates measured against
 * the founder asset (native 1536×1024). Two vertical columns of three.
 * Refine via ?debug=1. */
const NEST_ZONES = [
  { slug: "development-stages",          top: 13, left:  4, w: 22, h: 24 },  /* top-left     · tree rings           */
  { slug: "curiosity-discovery",         top: 13, left: 74, w: 22, h: 24 },  /* top-right    · magnifying glass     */
  { slug: "learning-through-experience", top: 40, left:  4, w: 22, h: 24 },  /* mid-left     · forest path          */
  { slug: "mistakes-growth",             top: 40, left: 74, w: 22, h: 24 },  /* mid-right    · cracked pot          */
  { slug: "confidence-resilience",       top: 68, left:  4, w: 22, h: 24 },  /* bottom-left  · dandelion + rocks    */
  { slug: "becoming-yourself",           top: 68, left: 74, w: 22, h: 24 },  /* bottom-right · blooming tree        */
];

export default function SaraGrowthDevelopment() {
  const [params] = useSearchParams();
  const debug = params.get("debug") === "1";

  const zones = NEST_ZONES.map((z) => {
    const theme = NEST_THEMES.find((t) => t.slug === z.slug);
    return {
      id: `nest-${theme.slug}`,
      label: theme.label,
      route: `/parents-room/category/growth-development/${theme.slug}`,
      top: z.top,
      left: z.left,
      w: z.w,
      h: z.h,
    };
  });

  return (
    <div
      data-testid="sara-growth-development"
      className="relative w-full"
      style={{ backgroundColor: "#0a0d15", minHeight: "100vh" }}
    >
      <div
        className="relative w-full mx-auto"
        style={{ aspectRatio: "1536 / 1024", maxWidth: "1400px" }}
      >
        <img
          src={WORLD_IMAGE}
          alt="Growth & Development — Growth is not a race. It is a journey of becoming. A child kneels with a magnifying glass studying a small sapling growing from a ring of stones, surrounded by six woven nests of becoming: Development Stages, Learning Through Experience, Confidence & Resilience, Curiosity & Discovery, Mistakes & Growth and Becoming Yourself."
          className="absolute inset-0 w-full h-full object-cover select-none"
          draggable={false}
          loading="eager"
          data-testid="sara-growth-development-image"
        />
        {zones.map((z) => (
          <Link
            key={z.id}
            to={z.route}
            data-testid={`sara-growth-development-zone-${z.id}`}
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
