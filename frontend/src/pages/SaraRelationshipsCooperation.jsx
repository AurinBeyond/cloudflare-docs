/**
 * SaraRelationshipsCooperation.jsx — § SARA WORLD 6 · RELATIONSHIPS & COOPERATION 2026-06-18
 *
 * Painted Map Pattern interior page for Sara category #6
 * "Relationships & Cooperation". We grow through connection,
 * understanding, and learning to walk beside one another.
 *
 * STRUCTURE LOCK (founder direction 2026-06-18)
 *   - Sara visual language continues: ancient tree, soft golden
 *     light, hand-painted texture, woodland atmosphere, nest motif.
 *   - At the centre — an extended family gathered around a small
 *     wooden table with an open book and tea. A boy with backpack
 *     walks the path with a dog. A small wooden bridge crosses the
 *     stream beyond. A village glows on the right. Nobody leads —
 *     everyone participates.
 *   - Six painted nests arranged in two vertical columns of three:
 *         LEFT column  (top → bottom):
 *           · Communication        (mother + son reading together)
 *           · Cooperation          (grandfather + girl crafting)
 *           · Friendship           (three children of different cultures playing with blocks)
 *         RIGHT column (top → bottom):
 *           · Understanding Differences (teacher + diverse children at a table)
 *           · Empathy & Kindness        (multigenerational family embrace)
 *           · Solving Conflicts Together (family by campfire, wooden signpost with heart and home)
 *   - Title "RELATIONSHIPS & COOPERATION" and subtitle "We grow
 *     through connection, understanding, and learning to walk beside
 *     one another." are baked into the painting — no React-rendered
 *     text overlays.
 *   - URL: /parents-room/category/relationships-cooperation
 *   - Each nest routes to /parents-room/category/relationships-cooperation/<sub>,
 *     landing on SaraCategoryStub until founder visuals arrive.
 *   - Append ?debug=1 to visualise hotspots (founder calibration).
 */
import { Link, useSearchParams } from "react-router-dom";

/* §RELATIONSHIPS-LOCK 2026-06-18 — Founder-approved asset
 * (b4uvi3j7_image.png, 3.4 MB). Title + subtitle baked into
 * the painting. DO NOT change the asset without founder
 * approval. */
const WORLD_IMAGE =
  "https://customer-assets.emergentagent.com/job_aurin-hub/artifacts/b4uvi3j7_image.png";

/* §RELATIONSHIPS-NESTS — Six painted nest hotspots arranged in two
 * vertical columns flanking the central family scene. Slugs are
 * kebab-case, stable for routing. Labels are agent-side identifiers
 * (the painted asset uses purely symbolic content, no plaques). */
const NEST_THEMES = [
  { slug: "communication",             label: "Communication" },
  { slug: "cooperation",               label: "Cooperation" },
  { slug: "friendship",                label: "Friendship" },
  { slug: "understanding-differences", label: "Understanding Differences" },
  { slug: "empathy-kindness",          label: "Empathy & Kindness" },
  { slug: "solving-conflicts-together", label: "Solving Conflicts Together" },
];

/* §NEST-ZONES — Painted nest hotspots. Coordinates measured against
 * the founder asset (native 1536×1024). Two vertical columns of three.
 * Refine via ?debug=1. */
const NEST_ZONES = [
  { slug: "communication",              top: 13, left:  4, w: 22, h: 24 },  /* top-left     · mother + son reading        */
  { slug: "understanding-differences",  top: 13, left: 74, w: 22, h: 24 },  /* top-right    · teacher + diverse children  */
  { slug: "cooperation",                top: 40, left:  4, w: 22, h: 24 },  /* mid-left     · grandfather + girl crafting */
  { slug: "empathy-kindness",           top: 40, left: 74, w: 22, h: 24 },  /* mid-right    · multigenerational embrace   */
  { slug: "friendship",                 top: 68, left:  4, w: 22, h: 24 },  /* bottom-left  · diverse children at play    */
  { slug: "solving-conflicts-together", top: 68, left: 74, w: 22, h: 24 },  /* bottom-right · campfire + signpost         */
];

export default function SaraRelationshipsCooperation() {
  const [params] = useSearchParams();
  const debug = params.get("debug") === "1";

  const zones = NEST_ZONES.map((z) => {
    const theme = NEST_THEMES.find((t) => t.slug === z.slug);
    return {
      id: `nest-${theme.slug}`,
      label: theme.label,
      route: `/parents-room/category/relationships-cooperation/${theme.slug}`,
      top: z.top,
      left: z.left,
      w: z.w,
      h: z.h,
    };
  });

  return (
    <div
      data-testid="sara-relationships-cooperation"
      className="relative w-full"
      style={{ backgroundColor: "#0a0d15", minHeight: "100vh" }}
    >
      <div
        className="relative w-full mx-auto"
        style={{ aspectRatio: "1536 / 1024", maxWidth: "1400px" }}
      >
        <img
          src={WORLD_IMAGE}
          alt="Relationships & Cooperation — We grow through connection, understanding, and learning to walk beside one another. An extended family gathers around a wooden table with an open book under an ancient tree, with a small bridge crossing the stream and a village beyond, surrounded by six woven nests of human connection: Communication, Cooperation, Friendship, Understanding Differences, Empathy & Kindness and Solving Conflicts Together."
          className="absolute inset-0 w-full h-full object-cover select-none"
          draggable={false}
          loading="eager"
          data-testid="sara-relationships-cooperation-image"
        />
        {zones.map((z) => (
          <Link
            key={z.id}
            to={z.route}
            data-testid={`sara-relationships-cooperation-zone-${z.id}`}
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
