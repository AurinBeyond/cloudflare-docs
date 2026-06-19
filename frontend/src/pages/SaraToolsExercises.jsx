/**
 * SaraToolsExercises.jsx — § SARA WORLD 11 · TOOLS & EXERCISES 2026-06-18
 *
 * Painted Map Pattern interior page for Sara category #11
 * "Tools & Exercises". Small practices can open big conversations.
 * Anti-wellness, anti-classroom — things we can try together, not
 * exercises we must complete.
 *
 * STRUCTURE LOCK (founder direction 2026-06-18)
 *   - Sara visual language continues: ancient tree, soft golden
 *     light, hand-painted texture, woodland atmosphere, nest motif.
 *   - At the centre — a grandmother and two grandchildren (boy and
 *     girl) gathered around a round wooden table beneath a great
 *     tree. On the table: a spread of conversation cards each held
 *     up by the children, wooden peg figures, a clay mug, drawings,
 *     wildflowers. Sunset village visible in the distance.
 *   - The atmosphere is inviting, practical, relational — NOT
 *     educational. No textbooks, no worksheets, no classroom.
 *   - Six painted rope-bordered nests arranged in two vertical
 *     columns of three, each carrying a symbolic vignette:
 *         LEFT column  (top → bottom):
 *           · Conversation Cards  (🃏 stack of cards with heart, lavender sprig)
 *           · Family Activities   (🧩 wooden peg figures + small board game)
 *           · Reflection Prompts  (📓 open journal "What made you smile today?...")
 *         RIGHT column (top → bottom):
 *           · Weekly Practices    (📅 wall calendar with heart marks + candle)
 *           · Play & Discovery    (🧱 wooden blocks + teddy + crayon drawings)
 *           · Relationship Tools  (🪧 signpost "Listen · Understand · Agree · Solve together")
 *   - Title "TOOLS & EXERCISES" and subtitle "Small practices can
 *     open big conversations." are baked into the painting.
 *   - URL: /parents-room/category/tools-exercises
 *   - Each nest routes to /parents-room/category/tools-exercises/<sub>,
 *     landing on SaraCategoryStub until founder visuals arrive.
 *   - Append ?debug=1 to visualise hotspots (founder calibration).
 *
 * §SARA-CAST-VARIETY 2026-06-18 — Cast variation rule (founder):
 *   This world centres **grandmother + two grandchildren** —
 *   intergenerational warmth that naturally bridges to Worlds 14
 *   (Generations & Heritage) and 15 (Home, Memories & Roots).
 *
 * §SARA-ASPECT-NOTE 2026-06-18 — Founder asset is square (1:1)
 *   rather than the platform standard 3:2 landscape. We honour the
 *   actual image dimensions (1024×1024) so the painting renders
 *   undistorted; the existing 3:2 worlds remain 3:2.
 */
import { Link, useSearchParams } from "react-router-dom";

/* §TOOLS-LOCK 2026-06-18 — Founder-approved asset
 * (f5xlh6so_image.png, 3.3 MB, square 1:1). Title + subtitle
 * baked into the painting. DO NOT change the asset without
 * founder approval. */
const WORLD_IMAGE =
  "https://customer-assets.emergentagent.com/job_aurin-hub/artifacts/f5xlh6so_image.png";

/* §TOOLS-NESTS — Six painted nest hotspots arranged in two
 * vertical columns flanking the central grandmother-and-grandchildren
 * scene. Slugs are kebab-case, stable for routing. Labels are
 * agent-side identifiers (the painted asset carries symbolic
 * vignettes, not text plaques). */
const NEST_THEMES = [
  { slug: "conversation-cards", label: "Conversation Cards" },
  { slug: "family-activities",  label: "Family Activities" },
  { slug: "reflection-prompts", label: "Reflection Prompts" },
  { slug: "weekly-practices",   label: "Weekly Practices" },
  { slug: "play-discovery",     label: "Play & Discovery" },
  { slug: "relationship-tools", label: "Relationship Tools" },
];

/* §NEST-ZONES — Painted nest hotspots. Coordinates measured against
 * the founder asset (native 1024×1024 square). Two vertical columns
 * of three. Refine via ?debug=1. */
const NEST_ZONES = [
  { slug: "conversation-cards", top:  9, left:  4, w: 24, h: 24 },  /* top-left     · card stack with heart           */
  { slug: "weekly-practices",   top:  9, left: 72, w: 24, h: 24 },  /* top-right    · calendar with hearts + candle   */
  { slug: "family-activities",  top: 38, left:  4, w: 24, h: 24 },  /* mid-left     · wooden peg figures + board game */
  { slug: "play-discovery",     top: 38, left: 72, w: 24, h: 24 },  /* mid-right    · wooden blocks + teddy + drawings */
  { slug: "reflection-prompts", top: 67, left:  4, w: 24, h: 24 },  /* bottom-left  · open journal with prompts       */
  { slug: "relationship-tools", top: 67, left: 72, w: 24, h: 24 },  /* bottom-right · signpost "Listen Understand..." */
];

export default function SaraToolsExercises() {
  const [params] = useSearchParams();
  const debug = params.get("debug") === "1";

  const zones = NEST_ZONES.map((z) => {
    const theme = NEST_THEMES.find((t) => t.slug === z.slug);
    return {
      id: `nest-${theme.slug}`,
      label: theme.label,
      route: `/parents-room/category/tools-exercises/${theme.slug}`,
      top: z.top,
      left: z.left,
      w: z.w,
      h: z.h,
    };
  });

  return (
    <div
      data-testid="sara-tools-exercises"
      className="relative w-full"
      style={{ backgroundColor: "#0a0d15", minHeight: "100vh" }}
    >
      <div
        className="relative w-full mx-auto"
        style={{ aspectRatio: "1 / 1", maxWidth: "1100px" }}
      >
        <img
          src={WORLD_IMAGE}
          alt="Tools & Exercises — Small practices can open big conversations. A grandmother and two grandchildren gathered around a wooden table beneath an ancient tree at sunset, holding conversation cards. Six woven nests of practical family practices surround them: Conversation Cards, Family Activities, Reflection Prompts, Weekly Practices, Play & Discovery, and Relationship Tools."
          className="absolute inset-0 w-full h-full object-cover select-none"
          draggable={false}
          loading="eager"
          data-testid="sara-tools-exercises-image"
        />
        {zones.map((z) => (
          <Link
            key={z.id}
            to={z.route}
            data-testid={`sara-tools-exercises-zone-${z.id}`}
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
