/**
 * SaraStoriesRealLife.jsx — § SARA WORLD 10 · STORIES FROM REAL LIFE 2026-06-18
 *
 * Painted Map Pattern interior page for Sara category #10
 * "Stories from Real Life". Sometimes the most powerful
 * lessons come from ordinary lives. The bridge between
 * Wisdom Garden and lived experience.
 *
 * STRUCTURE LOCK (founder direction 2026-06-18)
 *   - Sara visual language continues: ancient tree, soft golden
 *     light, hand-painted texture, woodland atmosphere, nest motif.
 *   - At the centre — a large open book beneath a great tree. Scenes
 *     from real family life rise from its pages like golden light:
 *     parents with a newborn, a father and son fishing by water,
 *     a mother at the window with coffee, a couple walking the path
 *     toward sunset. Not fairy-tales. Not invented heroes. Real moments.
 *   - Six painted rope-bordered nests arranged in two vertical columns
 *     of three, each carrying a symbolic vignette:
 *         LEFT column  (top → bottom):
 *           · Family Stories          (👨‍👩‍👧 family of four resting on a porch)
 *           · Turning Points          (🪧 signpost on a forest path, lone backpacker)
 *           · Lessons Learned         (📓 mother writing in her journal by candlelight)
 *         RIGHT column (top → bottom):
 *           · Voices Across Generations (👵 grandmother + parents + children sharing a book)
 *           · Courage & Hope           (🌈 a couple embracing under a rainbow, village beyond)
 *           · Small Moments, Big Meaning (🦋 a hand reaching toward a daisy with a butterfly)
 *   - Title "STORIES FROM REAL LIFE" and subtitle "Sometimes the most
 *     powerful lessons come from ordinary lives." are baked into the
 *     painting — no React-rendered text overlays.
 *   - URL: /parents-room/category/stories-real-life
 *   - Each nest routes to /parents-room/category/stories-real-life/<sub>,
 *     landing on SaraCategoryStub until founder visuals arrive.
 *   - Append ?debug=1 to visualise hotspots (founder calibration).
 *
 * §SARA-CAST-VARIETY 2026-06-18 — Cast variation rule (founder):
 *   Across the Sara worlds, alternate the central figures to mirror
 *   real family life: mother+child, father+child, both parents,
 *   grandparent+child, siblings, step-parents, single parent,
 *   multi-generational household. This world is multi-cast — every
 *   nest carries a different family configuration, so the painting
 *   itself becomes the proof that "real life" is not one shape.
 */
import { Link, useSearchParams } from "react-router-dom";

/* §STORIES-LOCK 2026-06-18 — Founder-approved asset
 * (uzdnty7e_image.png, 3.4 MB). Title + subtitle baked into
 * the painting. DO NOT change the asset without founder
 * approval. */
const WORLD_IMAGE =
  "https://customer-assets.emergentagent.com/job_aurin-hub/artifacts/uzdnty7e_image.png";

/* §STORIES-NESTS — Six painted nest hotspots arranged in two
 * vertical columns flanking the central "book unfolds into life"
 * scene. Slugs are kebab-case, stable for routing. Labels are
 * agent-side identifiers (the painted asset carries symbolic
 * vignettes, not text plaques). */
const NEST_THEMES = [
  { slug: "family-stories",            label: "Family Stories" },
  { slug: "turning-points",            label: "Turning Points" },
  { slug: "lessons-learned",           label: "Lessons Learned" },
  { slug: "voices-across-generations", label: "Voices Across Generations" },
  { slug: "courage-hope",              label: "Courage & Hope" },
  { slug: "small-moments-big-meaning", label: "Small Moments, Big Meaning" },
];

/* §NEST-ZONES — Painted nest hotspots. Coordinates measured against
 * the founder asset (native 1536×1024). Two vertical columns of three.
 * Refine via ?debug=1. */
const NEST_ZONES = [
  { slug: "family-stories",            top: 13, left:  4, w: 22, h: 24 },  /* top-left     · family of four on porch       */
  { slug: "voices-across-generations", top: 13, left: 74, w: 22, h: 24 },  /* top-right    · grandmother + family book     */
  { slug: "turning-points",            top: 40, left:  4, w: 22, h: 24 },  /* mid-left     · signpost + backpacker         */
  { slug: "courage-hope",              top: 40, left: 74, w: 22, h: 24 },  /* mid-right    · couple under rainbow          */
  { slug: "lessons-learned",           top: 68, left:  4, w: 22, h: 24 },  /* bottom-left  · mother writing by candlelight */
  { slug: "small-moments-big-meaning", top: 68, left: 74, w: 22, h: 24 },  /* bottom-right · daisy + butterfly             */
];

export default function SaraStoriesRealLife() {
  const [params] = useSearchParams();
  const debug = params.get("debug") === "1";

  const zones = NEST_ZONES.map((z) => {
    const theme = NEST_THEMES.find((t) => t.slug === z.slug);
    return {
      id: `nest-${theme.slug}`,
      label: theme.label,
      route: `/parents-room/category/stories-real-life/${theme.slug}`,
      top: z.top,
      left: z.left,
      w: z.w,
      h: z.h,
    };
  });

  return (
    <div
      data-testid="sara-stories-real-life"
      className="relative w-full"
      style={{ backgroundColor: "#0a0d15", minHeight: "100vh" }}
    >
      <div
        className="relative w-full mx-auto"
        style={{ aspectRatio: "1536 / 1024", maxWidth: "1400px" }}
      >
        <img
          src={WORLD_IMAGE}
          alt="Stories from Real Life — Sometimes the most powerful lessons come from ordinary lives. A great open book beneath an ancient tree releases scenes from real family life: parents with a newborn, a father and son fishing, a mother at the window, a couple walking toward sunset, surrounded by six woven nests of lived experience: Family Stories, Turning Points, Lessons Learned, Voices Across Generations, Courage & Hope, and Small Moments, Big Meaning."
          className="absolute inset-0 w-full h-full object-cover select-none"
          draggable={false}
          loading="eager"
          data-testid="sara-stories-real-life-image"
        />
        {zones.map((z) => (
          <Link
            key={z.id}
            to={z.route}
            data-testid={`sara-stories-real-life-zone-${z.id}`}
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
