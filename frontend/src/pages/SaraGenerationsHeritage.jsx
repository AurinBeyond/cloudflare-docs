/**
 * SaraGenerationsHeritage.jsx — § SARA WORLD 14 · GENERATIONS & HERITAGE 2026-06-19
 *
 * Painted Map Pattern interior page for Sara category #14
 * "Generations & Heritage". Every family carries stories,
 * wisdom and gifts across generations.
 *
 * STRUCTURE LOCK (founder direction 2026-06-19)
 *   - Sara visual language continues: ancient tree, soft golden
 *     light, hand-painted texture, woodland atmosphere, rope-bordered
 *     nest motif.
 *   - At the centre — a three-generation family (grandparents,
 *     parents and three children) gathered on a quilted blanket
 *     beneath a great rooted tree at sunset. They share an old
 *     photo album, an open memory chest spilling vintage portraits,
 *     wildflowers, a lantern, a basket of apples and a golden
 *     retriever resting at their feet. Sunset village across the
 *     valley, paper bunting strung between the trees.
 *   - The scene shows curiosity, not genealogy. People are *together*,
 *     not posed. The roots of the tree are visible, symbolising
 *     continuity across generations.
 *   - Six painted rope-bordered nests arranged in two vertical
 *     columns of three, each carrying a symbolic vignette:
 *         LEFT column  (top → bottom):
 *           · Family Stories          (📖 open memory book with photos + candle + birdhouse)
 *           · Traditions & Rituals    (🕯️ lantern + candle + bread + wreath of flowers)
 *           · Wisdom Passed On        (👴 grandfather + grandson building a small birdhouse)
 *         RIGHT column (top → bottom):
 *           · What We Choose to Carry Forward (🌱 two pairs of hands planting a young tree)
 *           · Patterns Across Generations (🧸 child's drawing + teddy + heart pillow + treasure chest)
 *           · Roots & Belonging       (🏡 lit doorway with heart-shaped window + lantern + apple basket)
 *   - Title "GENERATIONS & HERITAGE" and subtitle "Every family
 *     carries stories, wisdom and gifts across generations." are
 *     baked into the painting.
 *   - URL: /parents-room/category/generations-heritage
 *   - Each nest routes to /parents-room/category/generations-heritage/<sub>,
 *     landing on SaraCategoryStub until founder visuals arrive.
 *   - Append ?debug=1 to visualise hotspots (founder calibration).
 *
 * §SARA-CAST-VARIETY 2026-06-19 — Cast variation rule (founder):
 *   This world centres a **full three-generation household**:
 *   grandparents + parents + multiple children sharing the same
 *   blanket. The painting itself is the proof of "every family
 *   carries stories, wisdom and gifts across generations."
 *
 * §SARA-TONE-NOTE 2026-06-19 — Curiosity, not judgement (founder):
 *   This world MUST stay curious about heritage, not judgemental.
 *   Forbidden directions:
 *     · genealogical tree-building
 *     · ethnic / national identity politics
 *     · "broken generations" narratives
 *     · blaming parents or grandparents
 *   Permitted tones: stories, values, skills, memories, the quiet
 *   choice of what to carry forward and what to release.
 *
 * §SARA-ASPECT-NOTE — Founder asset is square (1:1). Honour native
 *   dimensions; do not force into 3:2.
 */
import { Link, useSearchParams } from "react-router-dom";

/* §HERITAGE-LOCK 2026-06-19 — Founder-approved asset
 * (ihmnen44_image.png, 3.3 MB, square 1:1). Title + subtitle
 * baked into the painting. DO NOT change the asset without
 * founder approval. */
const WORLD_IMAGE =
  "https://customer-assets.emergentagent.com/job_aurin-hub/artifacts/ihmnen44_image.png";

/* §HERITAGE-NESTS — Six painted nest hotspots arranged in two
 * vertical columns flanking the central three-generation gathering. */
const NEST_THEMES = [
  { slug: "family-stories",                label: "Family Stories" },
  { slug: "traditions-rituals",            label: "Traditions & Rituals" },
  { slug: "wisdom-passed-on",              label: "Wisdom Passed On" },
  { slug: "what-we-choose-to-carry-forward", label: "What We Choose to Carry Forward" },
  { slug: "patterns-across-generations",   label: "Patterns Across Generations" },
  { slug: "roots-belonging",               label: "Roots & Belonging" },
];

/* §NEST-ZONES — Painted nest hotspots. Coordinates measured against
 * the founder asset (native 1024×1024 square). Two vertical columns
 * of three. Refine via ?debug=1. */
const NEST_ZONES = [
  { slug: "family-stories",                  top:  9, left:  4, w: 24, h: 24 },  /* top-left     · memory book + candle + birdhouse */
  { slug: "what-we-choose-to-carry-forward", top:  9, left: 72, w: 24, h: 24 },  /* top-right    · hands planting a young tree     */
  { slug: "traditions-rituals",              top: 38, left:  4, w: 24, h: 24 },  /* mid-left     · lantern + candle + bread + flowers */
  { slug: "patterns-across-generations",     top: 38, left: 72, w: 24, h: 24 },  /* mid-right    · drawing + teddy + heart + chest */
  { slug: "wisdom-passed-on",                top: 67, left:  4, w: 24, h: 24 },  /* bottom-left  · grandfather + grandchild building */
  { slug: "roots-belonging",                 top: 67, left: 72, w: 24, h: 24 },  /* bottom-right · lit doorway with heart-window   */
];

export default function SaraGenerationsHeritage() {
  const [params] = useSearchParams();
  const debug = params.get("debug") === "1";

  const zones = NEST_ZONES.map((z) => {
    const theme = NEST_THEMES.find((t) => t.slug === z.slug);
    return {
      id: `nest-${theme.slug}`,
      label: theme.label,
      route: `/parents-room/category/generations-heritage/${theme.slug}`,
      top: z.top,
      left: z.left,
      w: z.w,
      h: z.h,
    };
  });

  return (
    <div
      data-testid="sara-generations-heritage"
      className="relative w-full"
      style={{ backgroundColor: "#0a0d15", minHeight: "100vh" }}
    >
      <div
        className="relative w-full mx-auto"
        style={{ aspectRatio: "1 / 1", maxWidth: "1100px" }}
      >
        <img
          src={WORLD_IMAGE}
          alt="Generations & Heritage — Every family carries stories, wisdom and gifts across generations. A three-generation family — grandparents, parents and three children — gathers on a quilted blanket beneath an ancient rooted tree at sunset, sharing an old photo album and a chest of memories, with their golden retriever resting nearby. Around them six woven nests hold the threads of heritage: Family Stories, Traditions & Rituals, Wisdom Passed On, What We Choose to Carry Forward, Patterns Across Generations, and Roots & Belonging."
          className="absolute inset-0 w-full h-full object-cover select-none"
          draggable={false}
          loading="eager"
          data-testid="sara-generations-heritage-image"
        />
        {zones.map((z) => (
          <Link
            key={z.id}
            to={z.route}
            data-testid={`sara-generations-heritage-zone-${z.id}`}
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
