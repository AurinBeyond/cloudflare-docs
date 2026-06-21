/**
 * WorldWhatCannotBeReplaced.jsx — § WIDER CIRCLE WORLD 1 · WHAT CANNOT BE REPLACED 2026-06-21
 *
 * First painted world of the Secondary Hub "The Circle We Create".
 * Founder brief (locked):
 *   "Some things only presence can give."
 *
 * STRUCTURE LOCK (founder direction 2026-06-21)
 *   - Painted asset honours the Sara visual language: hand-painted
 *     watercolour, soft ivory parchment, rope-bordered nests, warm
 *     ambient light.
 *   - At the centre — a worn armchair beside a small wooden side
 *     table holding a steaming mug, an open book, a lit lantern,
 *     a teddy bear at rest, a child's drawing pinned to the wall.
 *     The seat is empty. Presence is what would fill it.
 *   - The title "What Cannot Be Replaced" and the subtitle
 *     "Some things only presence can give." are baked into the
 *     painting above the armchair under a soft heart-and-leaf crest.
 *   - Six rope-bordered nests arranged in two vertical columns of
 *     three, flanking the central armchair scene. Each nest carries
 *     a single symbol and a small wooden plaque underneath naming
 *     what cannot be replaced and why.
 *
 *         LEFT column (top → bottom):
 *           · Time      cannot be rushed     (⏳ hourglass)
 *           · Listening cannot be delegated  (👂 painted ear)
 *           · Attention cannot be shared     (🫶 heart held in hands)
 *
 *         RIGHT column (top → bottom):
 *           · Presence  cannot be faked      (👤 parent + child silhouette
 *                                              by a single warm lamp)
 *           · Trust     cannot be forced     (🌱 sprout breaking soil)
 *           · Connection cannot be replaced  (🪔 lit lantern)
 *
 *   - A long bottom parchment carries the heart of the world:
 *       "Life is full of good intentions. Yet the things that matter
 *        most cannot be swapped, rushed, or outsourced. They can only
 *        be given in one way: I am here. With you."
 *   - Beneath the parchment a small wooden "This world is being
 *     painted. Return when the colour has settled." plaque signals
 *     that nest interiors are forthcoming.
 *   - At the top-left a wooden sign reads "← Back to The Circle We
 *     Create" and routes back to /parents-room/wider-circle.
 *   - URL: /parents-room/wider-circle/what-cannot-be-replaced
 *   - Each nest routes to /parents-room/wider-circle/what-cannot-be-replaced/<sub>,
 *     landing on SaraCategoryStub until founder visuals arrive.
 *   - Append ?debug=1 to visualise hotspots (founder calibration).
 *
 * §WIDER-CIRCLE-TONE — Anti-wellness, anti-guilt. This world does
 *   NOT shame busy parents. It notices, gently, what can only be
 *   given one way. Forbidden directions:
 *     · "be more present" instructions / lecturing tone
 *     · self-improvement / wellness coaching
 *     · screen-shaming
 *     · "perfect parent" narratives
 *   Permitted tones: noticing, returning, choosing again.
 *
 * §WIDER-CIRCLE-CORE-PATTERN — Every nest in this world must complete
 *   the same sentence: "I am using ___ instead of being here."
 *   That sentence is the founder-approved completion test that keeps
 *   the world coherent.
 *
 * §SARA-ASPECT-NOTE — Founder asset is 3:2 (1536×1024). Use
 *   object-contain to honour the painted edges and the wooden
 *   "Back" sign in the top-left.
 */
import { Link, useSearchParams } from "react-router-dom";

/* §WHAT-CANNOT-BE-REPLACED-LOCK 2026-06-21 — Founder-approved asset
 * (mghwh6or_image.png, 3.0 MB, 3:2 1536×1024). Title + subtitle +
 * bottom parchment + "This world is being painted." plaque + Back
 * sign are all baked into the painting. DO NOT change the asset
 * without founder approval. */
const WORLD_IMAGE =
  "https://customer-assets.emergentagent.com/job_aurin-hub/artifacts/mghwh6or_image.png";

/* §NEST-THEMES — Six painted nests, each a symbol of something
 * that cannot be replaced. Ordered top-down, left then right. */
const NEST_THEMES = [
  { slug: "time",       label: "Time — cannot be rushed" },
  { slug: "listening",  label: "Listening — cannot be delegated" },
  { slug: "attention",  label: "Attention — cannot be shared" },
  { slug: "presence",   label: "Presence — cannot be faked" },
  { slug: "trust",      label: "Trust — cannot be forced" },
  { slug: "connection", label: "Connection — cannot be replaced" },
];

/* §NEST-ZONES — Painted nest hotspots. Coordinates measured against
 * the founder asset (native 3:2 1536×1024). Refine via ?debug=1. */
const NEST_ZONES = [
  /* LEFT column (top → bottom) */
  { slug: "time",       top: 19, left: 17, w: 14, h: 22 },  /* hourglass            */
  { slug: "listening",  top: 43, left: 17, w: 14, h: 22 },  /* painted ear           */
  { slug: "attention",  top: 67, left: 17, w: 14, h: 22 },  /* heart held in hands   */
  /* RIGHT column (top → bottom) */
  { slug: "presence",   top: 19, left: 69, w: 14, h: 22 },  /* parent + child by lamp */
  { slug: "trust",      top: 43, left: 69, w: 14, h: 22 },  /* sprout                 */
  { slug: "connection", top: 67, left: 69, w: 14, h: 22 },  /* lit lantern            */
];

const BACK_ZONE = {
  id: "back-to-wider-circle",
  label: "Back to The Circle We Create",
  route: "/parents-room/wider-circle",
  top: 3, left: 3, w: 14, h: 12,
};

export default function WorldWhatCannotBeReplaced() {
  const [params] = useSearchParams();
  const debug = params.get("debug") === "1";

  const zones = NEST_ZONES.map((z) => {
    const theme = NEST_THEMES.find((t) => t.slug === z.slug);
    return {
      id: `nest-${theme.slug}`,
      label: theme.label,
      route: `/parents-room/wider-circle/what-cannot-be-replaced/${theme.slug}`,
      top: z.top,
      left: z.left,
      w: z.w,
      h: z.h,
    };
  });

  return (
    <div
      data-testid="world-what-cannot-be-replaced"
      className="relative w-full"
      style={{ backgroundColor: "#0a0d15", minHeight: "100vh" }}
    >
      <div
        className="relative w-full mx-auto"
        style={{ aspectRatio: "3 / 2", maxWidth: "1536px" }}
      >
        <img
          src={WORLD_IMAGE}
          alt="What Cannot Be Replaced — Some things only presence can give. A worn armchair beside a lantern and a steaming mug, with six woven nests arranged around it: Time, Listening, Attention, Presence, Trust, and Connection. A bottom parchment reads: Life is full of good intentions. Yet the things that matter most cannot be swapped, rushed, or outsourced. They can only be given in one way: I am here. With you."
          className="absolute inset-0 w-full h-full object-contain select-none"
          draggable={false}
          loading="eager"
          data-testid="world-what-cannot-be-replaced-image"
        />

        {/* Back to The Circle We Create — painted wooden sign top-left. */}
        <Link
          to={BACK_ZONE.route}
          data-testid={`world-what-cannot-be-replaced-zone-${BACK_ZONE.id}`}
          aria-label={BACK_ZONE.label}
          title={BACK_ZONE.label}
          className="absolute block"
          style={{
            top: `${BACK_ZONE.top}%`,
            left: `${BACK_ZONE.left}%`,
            width: `${BACK_ZONE.w}%`,
            height: `${BACK_ZONE.h}%`,
            cursor: "pointer",
            background: debug ? "rgba(255, 200, 80, 0.25)" : "transparent",
            border: debug ? "1px dashed rgba(255, 200, 80, 0.9)" : "none",
            borderRadius: "12px",
            transition: "background 200ms ease-out",
          }}
          onMouseEnter={(e) => {
            if (!debug) e.currentTarget.style.background = "rgba(232, 217, 184, 0.08)";
          }}
          onMouseLeave={(e) => {
            if (!debug) e.currentTarget.style.background = "transparent";
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
              {BACK_ZONE.id}
            </span>
          )}
        </Link>

        {/* Six painted nest hotspots. */}
        {zones.map((z) => (
          <Link
            key={z.id}
            to={z.route}
            data-testid={`world-what-cannot-be-replaced-zone-${z.id}`}
            aria-label={z.label}
            title={z.label}
            className="absolute block"
            style={{
              top: `${z.top}%`,
              left: `${z.left}%`,
              width: `${z.w}%`,
              height: `${z.h}%`,
              cursor: "pointer",
              background: debug ? "rgba(255, 200, 80, 0.25)" : "transparent",
              border: debug ? "1px dashed rgba(255, 200, 80, 0.9)" : "none",
              borderRadius: "12px",
              transition: "background 200ms ease-out",
            }}
            onMouseEnter={(e) => {
              if (!debug) e.currentTarget.style.background = "rgba(232, 217, 184, 0.08)";
            }}
            onMouseLeave={(e) => {
              if (!debug) e.currentTarget.style.background = "transparent";
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
