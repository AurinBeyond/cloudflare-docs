/**
 * WorldOneHeartHoldsTheHouse.jsx — § WIDER CIRCLE WORLD 2 · WHEN ONE HEART HOLDS THE HOUSE 2026-06-21
 *
 * Second painted world of the Secondary Hub "The Circle We Create".
 * Founder brief (locked):
 *   "The sea remembers what every family eventually learns: one
 *    heart cannot carry everything forever."
 *
 * STRUCTURE LOCK (founder direction 2026-06-21)
 *   - Painted asset: sea + lighthouse at sunset, an empty armchair
 *     wrapped in a blue blanket facing the open water, a small
 *     wooden table with a steaming mug and a lantern beside it,
 *     a woven basket of folded blankets, scattered shells and
 *     starfish on the worn pier. The lighthouse on the right
 *     stands alone — a quiet reminder of who has been carrying
 *     the light for everyone else.
 *   - Six rope-bordered ring-nests arranged in two vertical columns
 *     of three, flanking the central sea scene. Each ring contains
 *     a parchment that completes the founder-locked Core Pattern
 *     sentence "I am using ___ instead of being here." with a
 *     subtle painted symbol tucked into the ring's weave.
 *
 *         LEFT column (top → bottom):
 *           · TIME       — "I am using speed instead of being here."     (⏱  pocket watch)
 *           · LISTENING  — "I am using advice instead of being here."    (🐚 conch shell)
 *           · ATTENTION  — "I am using checking instead of being here."  (🔭 spyglass)
 *
 *         RIGHT column (top → bottom):
 *           · PRESENCE   — "I am using being nearby instead of being here." (🚨 small lighthouse)
 *           · TRUST      — "I am using control instead of being here."     (⛵ ship's wheel)
 *           · CONNECTION — "I am using fixing instead of being here."      (🪔 lit lantern)
 *
 *   - Title "When One Heart Holds the House" and subtitle baked
 *     into the painting at the top.
 *   - Long bottom parchment carries the same heart-line as World 1
 *     to bind the worlds together:
 *       "Life is full of good intentions. Yet the things that matter
 *        most cannot be swapped, rushed, or outsourced. They can only
 *        be given in one way: I am here. With you."
 *   - Beneath the parchment, the wooden "This world is being painted.
 *     Return when the colour has settled." plaque signals nest
 *     interiors are forthcoming.
 *   - Top-left painted wooden sign reads "Back to The Circle We Create"
 *     and routes back to /parents-room/wider-circle.
 *   - URL: /parents-room/wider-circle/when-one-heart-holds-the-house
 *   - Each nest routes to that path's <slug>, landing on
 *     SaraCategoryStub until founder visuals arrive.
 *   - Append ?debug=1 to visualise hotspots (founder calibration).
 *
 * §WIDER-CIRCLE-TONE — Anti-wellness, anti-guilt. This world does
 *   NOT shame the parent who carries the house. It notices — gently —
 *   that no wave carries the ocean alone. Forbidden directions:
 *     · "share the load" instructions / lecturing tone
 *     · self-improvement / wellness coaching
 *     · partner-shaming / family-shaming
 *     · "be the lighthouse for yourself" narratives
 *   Permitted tones: noticing, returning, choosing again.
 *
 * §WIDER-CIRCLE-CORE-PATTERN — Every nest in this world completes
 *   the same sentence: "I am using ___ instead of being here."
 *   The six completions are founder-locked (see NEST_THEMES).
 *
 * §SARA-ASPECT-NOTE — Founder asset is 3:2 (1536×1024). Use
 *   object-contain to honour the painted edges and the wooden
 *   "Back" sign in the top-left.
 */
import { Link, useSearchParams } from "react-router-dom";

/* §WHEN-ONE-HEART-HOLDS-THE-HOUSE-LOCK 2026-06-21 — Founder-approved
 * asset (js2g8gnk_image.png, 3.0 MB, 3:2 1536×1024). Title, subtitle,
 * bottom parchment, "This world is being painted." plaque and the
 * top-left "Back to The Circle We Create" sign are all baked into
 * the painting. DO NOT change the asset without founder approval. */
const WORLD_IMAGE =
  "https://customer-assets.emergentagent.com/job_aurin-hub/artifacts/js2g8gnk_image.png";

/* §NEST-THEMES — Six painted ring-nests, each carrying the Core
 * Pattern sentence with a different replacement word. Ordered
 * top-down, left then right. */
const NEST_THEMES = [
  { slug: "time",       label: "Time — I am using speed instead of being here." },
  { slug: "listening",  label: "Listening — I am using advice instead of being here." },
  { slug: "attention",  label: "Attention — I am using checking instead of being here." },
  { slug: "presence",   label: "Presence — I am using being nearby instead of being here." },
  { slug: "trust",      label: "Trust — I am using control instead of being here." },
  { slug: "connection", label: "Connection — I am using fixing instead of being here." },
];

/* §NEST-ZONES — Painted ring-nest hotspots. Coordinates measured
 * against the founder asset (native 3:2 1536×1024). Refine via
 * ?debug=1. The right-column nests sit slightly closer to the
 * frame edge than the left column, mirroring the lighthouse side. */
const NEST_ZONES = [
  /* LEFT column (top → bottom) */
  { slug: "time",       top: 13, left: 8,  w: 18, h: 26 },  /* pocket watch */
  { slug: "listening",  top: 38, left: 8,  w: 18, h: 26 },  /* conch shell  */
  { slug: "attention",  top: 63, left: 8,  w: 18, h: 26 },  /* spyglass     */
  /* RIGHT column (top → bottom) */
  { slug: "presence",   top: 13, left: 74, w: 18, h: 26 },  /* small lighthouse */
  { slug: "trust",      top: 38, left: 74, w: 18, h: 26 },  /* ship's wheel     */
  { slug: "connection", top: 63, left: 74, w: 18, h: 26 },  /* lit lantern      */
];

const BACK_ZONE = {
  id: "back-to-wider-circle",
  label: "Back to The Circle We Create",
  route: "/parents-room/wider-circle",
  top: 1, left: 2, w: 9, h: 12,
};

export default function WorldOneHeartHoldsTheHouse() {
  const [params] = useSearchParams();
  const debug = params.get("debug") === "1";

  const zones = NEST_ZONES.map((z) => {
    const theme = NEST_THEMES.find((t) => t.slug === z.slug);
    return {
      id: `nest-${theme.slug}`,
      label: theme.label,
      route: `/parents-room/wider-circle/when-one-heart-holds-the-house/${theme.slug}`,
      top: z.top,
      left: z.left,
      w: z.w,
      h: z.h,
    };
  });

  return (
    <div
      data-testid="world-one-heart-holds-the-house"
      className="relative w-full"
      style={{ backgroundColor: "#0a0d15", minHeight: "100vh" }}
    >
      <div
        className="relative w-full mx-auto"
        style={{ aspectRatio: "3 / 2", maxWidth: "1536px" }}
      >
        <img
          src={WORLD_IMAGE}
          alt="When One Heart Holds the House — The sea remembers what every family eventually learns: one heart cannot carry everything forever. An empty armchair wrapped in a blue blanket faces the open sea at sunset; a lighthouse stands on the far shore. Six woven ring-nests carry the same quiet question: Time, Listening, Attention, Presence, Trust, and Connection. A bottom parchment reads: Life is full of good intentions. Yet the things that matter most cannot be swapped, rushed, or outsourced. They can only be given in one way: I am here. With you."
          className="absolute inset-0 w-full h-full object-contain select-none"
          draggable={false}
          loading="eager"
          data-testid="world-one-heart-holds-the-house-image"
        />

        {/* Back to The Circle We Create — small painted sign top-left. */}
        <Link
          to={BACK_ZONE.route}
          data-testid={`world-one-heart-holds-the-house-zone-${BACK_ZONE.id}`}
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

        {/* Six painted ring-nest hotspots. */}
        {zones.map((z) => (
          <Link
            key={z.id}
            to={z.route}
            data-testid={`world-one-heart-holds-the-house-zone-${z.id}`}
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
