/**
 * SaraWeeklyDigest.jsx — § SARA WORLD 9 · WEEKLY DIGEST 2026-06-18
 *
 * Painted Map Pattern interior page for Sara category #9
 * "Weekly Digest". Sometimes the smallest moments tell us
 * the most about where we are going.
 *
 * STRUCTURE LOCK (founder direction 2026-06-18)
 *   - Sara visual language continues: ancient tree, soft golden
 *     light, hand-painted texture, woodland atmosphere, nest motif.
 *   - At the centre — a father and daughter look through a journal
 *     beneath the great tree at sunset. A small lantern burns on the
 *     table beside drawings, letters and memories from the week.
 *     A path winds toward a distant village.
 *   - Six painted nests arranged in two vertical columns of three,
 *     each carrying a symbolic vignette:
 *         LEFT column  (top → bottom):
 *           · This Week's Reflection   (📖 open book with notes & a pencil)
 *           · Small Moments That Matter (📷 photos pegged on a string)
 *           · Family Conversations     (👨‍👦 father & son talking quietly)
 *         RIGHT column (top → bottom):
 *           · Challenges & Lessons     (🪧 chalkboard with weather marks, teddy, "what can we learn?")
 *           · Gratitude & Joy          (🕯️ jar of wildflowers, candle, "thankful for…")
 *           · Looking Ahead            (🧭 signpost, lantern, open notebook on a forest path)
 *   - Title "WEEKLY DIGEST" and subtitle "Sometimes the smallest
 *     moments tell us the most about where we are going." are baked
 *     into the painting — no React-rendered text overlays.
 *   - URL: /parents-room/category/weekly-digest
 *   - Each nest routes to /parents-room/category/weekly-digest/<sub>,
 *     landing on SaraCategoryStub until founder visuals arrive.
 *   - Append ?debug=1 to visualise hotspots (founder calibration).
 *
 * §SARA-CAST-VARIETY 2026-06-18 — Cast variation rule (founder):
 *   Across the Sara worlds, alternate the central figures to mirror
 *   real family life: mother+child, father+child, both parents,
 *   grandparent+child, siblings, step-parents, single parent,
 *   multi-generational household. This world centres father+daughter.
 */
import { Link, useSearchParams } from "react-router-dom";

/* §WEEKLY-LOCK 2026-06-18 — Founder-approved asset
 * (xj4ylrpo_image.png, 3.3 MB). Title + subtitle baked into
 * the painting. DO NOT change the asset without founder
 * approval. */
const WORLD_IMAGE =
  "https://customer-assets.emergentagent.com/job_aurin-hub/artifacts/xj4ylrpo_image.png";

/* §WEEKLY-NESTS — Six painted nest hotspots arranged in two
 * vertical columns flanking the central father-and-daughter scene.
 * Slugs are kebab-case, stable for routing. Labels are agent-side
 * identifiers (the painted asset carries symbolic vignettes, not
 * text plaques). */
const NEST_THEMES = [
  { slug: "this-weeks-reflection",     label: "This Week's Reflection" },
  { slug: "small-moments-that-matter", label: "Small Moments That Matter" },
  { slug: "family-conversations",      label: "Family Conversations" },
  { slug: "challenges-lessons",        label: "Challenges & Lessons" },
  { slug: "gratitude-joy",             label: "Gratitude & Joy" },
  { slug: "looking-ahead",             label: "Looking Ahead" },
];

/* §NEST-ZONES — Painted nest hotspots. Coordinates measured against
 * the founder asset (native 1536×1024). Two vertical columns of three.
 * Refine via ?debug=1. */
const NEST_ZONES = [
  { slug: "this-weeks-reflection",     top: 13, left:  4, w: 22, h: 24 },  /* top-left     · open book with notes        */
  { slug: "challenges-lessons",        top: 13, left: 74, w: 22, h: 24 },  /* top-right    · chalkboard "what can we learn?" */
  { slug: "small-moments-that-matter", top: 40, left:  4, w: 22, h: 24 },  /* mid-left     · photos on a string          */
  { slug: "gratitude-joy",             top: 40, left: 74, w: 22, h: 24 },  /* mid-right    · jar of flowers + candle     */
  { slug: "family-conversations",      top: 68, left:  4, w: 22, h: 24 },  /* bottom-left  · father & son talking        */
  { slug: "looking-ahead",             top: 68, left: 74, w: 22, h: 24 },  /* bottom-right · signpost + lantern + notebook */
];

export default function SaraWeeklyDigest() {
  const [params] = useSearchParams();
  const debug = params.get("debug") === "1";

  const zones = NEST_ZONES.map((z) => {
    const theme = NEST_THEMES.find((t) => t.slug === z.slug);
    return {
      id: `nest-${theme.slug}`,
      label: theme.label,
      route: `/parents-room/category/weekly-digest/${theme.slug}`,
      top: z.top,
      left: z.left,
      w: z.w,
      h: z.h,
    };
  });

  return (
    <div
      data-testid="sara-weekly-digest"
      className="relative w-full"
      style={{ backgroundColor: "#0a0d15", minHeight: "100vh" }}
    >
      <div
        className="relative w-full mx-auto"
        style={{ aspectRatio: "1536 / 1024", maxWidth: "1400px" }}
      >
        <img
          src={WORLD_IMAGE}
          alt="Weekly Digest — Sometimes the smallest moments tell us the most about where we are going. A father and daughter look through a journal beneath an ancient tree at sunset, surrounded by six woven nests holding the week's quiet memories: This Week's Reflection, Small Moments That Matter, Family Conversations, Challenges & Lessons, Gratitude & Joy and Looking Ahead."
          className="absolute inset-0 w-full h-full object-cover select-none"
          draggable={false}
          loading="eager"
          data-testid="sara-weekly-digest-image"
        />
        {zones.map((z) => (
          <Link
            key={z.id}
            to={z.route}
            data-testid={`sara-weekly-digest-zone-${z.id}`}
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
