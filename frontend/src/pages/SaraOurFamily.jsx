/**
 * SaraOurFamily.jsx — § SARA WORLD 3 · OUR FAMILY 2026-06-18
 *
 * Painted Map Pattern interior page for Sara category #2 "Our
 * Family". This is the structural HEART of Sara — the room's
 * compass question ("What's going on between us?") finds its
 * deepest mirror here.
 *
 * STRUCTURE LOCK (founder direction 2026-06-18)
 *   - Sara visual language continues: ancient tree, soft golden
 *     light, hand-painted texture, woodland atmosphere, nest motif.
 *   - At the centre — mother + father + two children reading
 *     together in a large central nest. A real family, not a
 *     stock-photo family.
 *   - Six painted nests around the central embrace, each labelled
 *     on a small wooden plaque:
 *         · Connection         (family hug)
 *         · Communication      (mother + child with candlelight)
 *         · Family Traditions  (festive table with banners)
 *         · Daily Life         (parents + child cooking)
 *         · Conflict & Repair  (father + son on a small bridge)
 *         · Belonging          (a warm cottage at sundown)
 *   - Below the centre — a small wooden sign carved with
 *     "TOGETHER WE GROW. TOGETHER WE STAY." next to a lantern.
 *   - Title "OUR FAMILY" and subtitle "A family is not built from
 *     perfection. It is built from connection." are baked into the
 *     painting — no React-rendered text overlays.
 *   - URL: /parents-room/category/our-family
 *   - Each nest routes to /parents-room/category/our-family/<sub>,
 *     landing on SaraCategoryStub until founder visuals arrive.
 *   - Append ?debug=1 to visualise hotspots (founder calibration).
 */
import { Link, useSearchParams } from "react-router-dom";

/* §OUR-FAMILY-LOCK 2026-06-18 — Founder-approved asset
 * (pzbbdk2p_image.png, 3.3 MB). Title + subtitle baked into
 * the painting. DO NOT change the asset without founder
 * approval. */
const WORLD_IMAGE =
  "https://customer-assets.emergentagent.com/job_aurin-hub/artifacts/g1ag88vy_image.png";

/* §OUR-FAMILY-NESTS — Six painted nest hotspots arranged around
 * the central family-reading embrace. Slugs are kebab-case,
 * stable for routing. Labels copied verbatim from the wooden
 * plaques painted on the asset. */
const NEST_THEMES = [
  { slug: "connection",          label: "Connection" },
  { slug: "daily-life",          label: "Daily Life" },
  { slug: "communication",       label: "Communication" },
  { slug: "conflict-repair",     label: "Conflict & Repair" },
  { slug: "family-traditions",   label: "Family Traditions" },
  { slug: "belonging",           label: "Belonging" },
];

/* §NEST-ZONES — Painted nest hotspots. Coordinates measured against
 * the founder asset. Same 3-left / 3-right layout as the rest of
 * the Sara worlds. Refine via ?debug=1. */
const NEST_ZONES = [
  { slug: "connection",          top: 13, left: 10, w: 22, h: 22 },  /* top-left     · family hug      */
  { slug: "daily-life",          top: 13, left: 68, w: 22, h: 22 },  /* top-right    · cooking         */
  { slug: "communication",       top: 40, left: 10, w: 22, h: 22 },  /* mid-left     · candle talk     */
  { slug: "conflict-repair",     top: 40, left: 68, w: 22, h: 22 },  /* mid-right    · bridge talk     */
  { slug: "family-traditions",   top: 68, left: 10, w: 22, h: 22 },  /* bottom-left  · festive table   */
  { slug: "belonging",           top: 68, left: 68, w: 22, h: 22 },  /* bottom-right · warm cottage    */
];

export default function SaraOurFamily() {
  const [params] = useSearchParams();
  const debug = params.get("debug") === "1";

  const zones = NEST_ZONES.map((z) => {
    const theme = NEST_THEMES.find((t) => t.slug === z.slug);
    return {
      id: `nest-${theme.slug}`,
      label: theme.label,
      route: `/parents-room/category/our-family/${theme.slug}`,
      top: z.top,
      left: z.left,
      w: z.w,
      h: z.h,
    };
  });

  return (
    <div
      data-testid="sara-our-family"
      className="relative w-full"
      style={{ backgroundColor: "#0a0d15", minHeight: "100vh" }}
    >
      <div
        className="relative w-full mx-auto"
        style={{ aspectRatio: "1536 / 1024", maxWidth: "1400px" }}
      >
        <img
          src={WORLD_IMAGE}
          alt="Our Family — A family is not built from perfection. It is built from connection. A mother, father and two children read together in a great woven nest, surrounded by six smaller nests for Connection, Communication, Family Traditions, Daily Life, Conflict & Repair and Belonging."
          className="absolute inset-0 w-full h-full object-cover select-none"
          draggable={false}
          loading="eager"
          data-testid="sara-our-family-image"
        />
        {zones.map((z) => (
          <Link
            key={z.id}
            to={z.route}
            data-testid={`sara-our-family-zone-${z.id}`}
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
