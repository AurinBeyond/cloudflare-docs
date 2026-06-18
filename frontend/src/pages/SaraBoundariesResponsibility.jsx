/**
 * SaraBoundariesResponsibility.jsx — § SARA WORLD 4 · BOUNDARIES & RESPONSIBILITY 2026-06-18
 *
 * Painted Map Pattern interior page for Sara category #4
 * "Boundaries & Responsibility". A boundary is not a wall —
 * it is a path that helps us walk together.
 *
 * STRUCTURE LOCK (founder direction 2026-06-18)
 *   - Sara visual language continues: ancient tree, soft golden
 *     light, hand-painted texture, woodland atmosphere, nest motif.
 *   - At the centre — a mother and child stand together looking at
 *     a wooden signpost (Respect / Trust / Love / Guidance). Guidance,
 *     not control.
 *   - Six painted nests arranged in two vertical columns of three —
 *     left side and right side of the painting:
 *         LEFT column  (top → bottom):
 *           · Boundaries              (stone-marked path)
 *           · Responsibility          (small garden cared for)
 *           · Choices & Consequences  (path-fork with arrows)
 *         RIGHT column (top → bottom):
 *           · Respect                 (two birds on the same branch)
 *           · Consistency             (lanterns lining a path)
 *           · Freedom Within Structure (open gate inside a clear fence)
 *   - Title "BOUNDARIES & RESPONSIBILITY" and subtitle "A boundary is
 *     not a wall. It is a path that helps us walk together." are baked
 *     into the painting — no React-rendered text overlays.
 *   - URL: /parents-room/category/boundaries-responsibility
 *   - Each nest routes to /parents-room/category/boundaries-responsibility/<sub>,
 *     landing on SaraCategoryStub until founder visuals arrive.
 *   - Append ?debug=1 to visualise hotspots (founder calibration).
 */
import { Link, useSearchParams } from "react-router-dom";

/* §BOUNDARIES-LOCK 2026-06-18 — Founder-approved asset
 * (iis5gc3n_image.png, 3.3 MB). Title + subtitle baked into
 * the painting. DO NOT change the asset without founder
 * approval. */
const WORLD_IMAGE =
  "https://customer-assets.emergentagent.com/job_aurin-hub/artifacts/iis5gc3n_image.png";

/* §BOUNDARIES-NESTS — Six painted nest hotspots arranged in two
 * vertical columns flanking the central signpost scene. Slugs are
 * kebab-case, stable for routing. Labels copied verbatim from the
 * wooden plaques painted on the asset. */
const NEST_THEMES = [
  { slug: "boundaries",                label: "Boundaries" },
  { slug: "responsibility",            label: "Responsibility" },
  { slug: "choices-consequences",      label: "Choices & Consequences" },
  { slug: "respect",                   label: "Respect" },
  { slug: "consistency",               label: "Consistency" },
  { slug: "freedom-within-structure",  label: "Freedom Within Structure" },
];

/* §NEST-ZONES — Painted nest hotspots. Coordinates measured against
 * the founder asset (native 1536×1024). Two vertical columns of three.
 * Refine via ?debug=1. */
const NEST_ZONES = [
  { slug: "boundaries",                top: 13, left:  4, w: 22, h: 24 },  /* top-left     · stone-marked path */
  { slug: "respect",                   top: 13, left: 74, w: 22, h: 24 },  /* top-right    · two birds          */
  { slug: "responsibility",            top: 40, left:  4, w: 22, h: 24 },  /* mid-left     · tended garden      */
  { slug: "consistency",               top: 40, left: 74, w: 22, h: 24 },  /* mid-right    · row of lanterns    */
  { slug: "choices-consequences",      top: 68, left:  4, w: 22, h: 24 },  /* bottom-left  · path-fork arrows   */
  { slug: "freedom-within-structure",  top: 68, left: 74, w: 22, h: 24 },  /* bottom-right · open gate          */
];

export default function SaraBoundariesResponsibility() {
  const [params] = useSearchParams();
  const debug = params.get("debug") === "1";

  const zones = NEST_ZONES.map((z) => {
    const theme = NEST_THEMES.find((t) => t.slug === z.slug);
    return {
      id: `nest-${theme.slug}`,
      label: theme.label,
      route: `/parents-room/category/boundaries-responsibility/${theme.slug}`,
      top: z.top,
      left: z.left,
      w: z.w,
      h: z.h,
    };
  });

  return (
    <div
      data-testid="sara-boundaries-responsibility"
      className="relative w-full"
      style={{ backgroundColor: "#0a0d15", minHeight: "100vh" }}
    >
      <div
        className="relative w-full mx-auto"
        style={{ aspectRatio: "1536 / 1024", maxWidth: "1400px" }}
      >
        <img
          src={WORLD_IMAGE}
          alt="Boundaries & Responsibility — A boundary is not a wall. It is a path that helps us walk together. A mother and child stand together looking at a wooden signpost marked Respect, Trust, Love and Guidance, surrounded by six woven nests: Boundaries, Responsibility, Choices & Consequences, Respect, Consistency and Freedom Within Structure."
          className="absolute inset-0 w-full h-full object-cover select-none"
          draggable={false}
          loading="eager"
          data-testid="sara-boundaries-responsibility-image"
        />
        {zones.map((z) => (
          <Link
            key={z.id}
            to={z.route}
            data-testid={`sara-boundaries-responsibility-zone-${z.id}`}
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
