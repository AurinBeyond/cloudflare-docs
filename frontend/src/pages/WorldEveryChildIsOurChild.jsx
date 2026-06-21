/**
 * WorldEveryChildIsOurChild.jsx — § WIDER CIRCLE WORLD 3 · EVERY CHILD IS OUR CHILD 2026-06-21
 *
 * Third painted world of the Secondary Hub "The Circle We Create".
 * Founder brief (locked):
 *   "It takes a whole shore to raise a steady boat."
 *
 * STRUCTURE LOCK (founder direction 2026-06-21)
 *   - Painted asset: a worn dock at sunset, a lighthouse on the
 *     far shore, sailboats returning home, candles and wooden
 *     painted figurines holding hands around a small map. Six
 *     worn rowboat-shaped nests carry parchments around the
 *     central sea-portal: SEEING, SPEAKING, BELONGING (left),
 *     INCLUDING, TRUSTING, GUIDING (right). A child's painted
 *     "we belong together" card is pinned to the right frame.
 *   - This world widens the Core Pattern from the family inward
 *     (Worlds 1 & 2) to the community outward. The completion
 *     sentence stays the same shape but the replacements name
 *     the quiet ways adults can close the circle around a child:
 *
 *         LEFT column (top → bottom):
 *           · SEEING    — "I am using judgement instead of curiosity."
 *           · SPEAKING  — "I am using criticism instead of encouragement."
 *           · BELONGING — "I am using comparison instead of acceptance."
 *
 *         RIGHT column (top → bottom):
 *           · INCLUDING — "I am using exclusion instead of welcome."
 *           · TRUSTING  — "I am using suspicion instead of belief."
 *           · GUIDING   — "I am using control instead of partnership."
 *
 *   - Title "Every Child Is Our Child" and subtitle baked into
 *     the painting at the top.
 *   - Long bottom parchment carries the world's heart-line:
 *       "Children do not need perfect people. They need many safe
 *        ones. When many hearts take small steps, a child can grow
 *        with roots and wings. We do not raise them alone. We raise
 *        them together."
 *   - Beneath, the wooden "This world is being painted. Return when
 *     the colour has settled." plaque.
 *   - Top-left painted wooden sign reads "Back to The Circle We
 *     Create" and routes back to /parents-room/wider-circle.
 *   - URL: /parents-room/wider-circle/every-child-is-our-child
 *   - Each nest routes to that path's <slug>, landing on
 *     SaraCategoryStub until founder visuals arrive.
 *   - Append ?debug=1 to visualise hotspots (founder calibration).
 *
 * §WIDER-CIRCLE-WORLD-3-ANCHOR — Founder also provided a second,
 *   portrait (2:3) "emotional anchor" canvas with the same title
 *   and a long-form invitation. Routed at:
 *     /parents-room/wider-circle/every-child-is-our-child/invitation
 *   Reachable from this hub via a small painted "the invitation"
 *   click-zone near the central parchment, so the long-form read
 *   lives one quiet step away from the painted hub.
 *
 * §WIDER-CIRCLE-TONE — Anti-blame community-noticing. This world
 *   does NOT shame neighbours, teachers, or distant family. It
 *   notices, gently, that a shore is made of many small kindnesses.
 *   Forbidden directions:
 *     · activist / lecturing tone
 *     · "it takes a village" cliché framing
 *     · child-protective-services framing
 *     · guilt about "not doing enough"
 *   Permitted tones: noticing, returning, choosing again.
 *
 * §SARA-ASPECT-NOTE — Founder hub asset is 3:2 (1536×1024). Use
 *   object-contain to honour the painted wooden frame edges and
 *   the top-left "Back" sign.
 */
import { Link, useSearchParams } from "react-router-dom";

/* §EVERY-CHILD-IS-OUR-CHILD-LOCK 2026-06-21 — Founder-approved
 * hub asset (f7l2y33z_image.png, 2.8 MB, 3:2 1536×1024). Title,
 * subtitle, bottom parchment, plaque and top-left "Back to The
 * Circle We Create" sign are all baked into the painting. */
const WORLD_IMAGE =
  "https://customer-assets.emergentagent.com/job_aurin-hub/artifacts/f7l2y33z_image.png";

/* §NEST-THEMES — Six painted rowboat-nests, each carrying the
 * Core Pattern sentence with a community-facing replacement word. */
const NEST_THEMES = [
  { slug: "seeing",    label: "Seeing — I am using judgement instead of curiosity." },
  { slug: "speaking",  label: "Speaking — I am using criticism instead of encouragement." },
  { slug: "belonging", label: "Belonging — I am using comparison instead of acceptance." },
  { slug: "including", label: "Including — I am using exclusion instead of welcome." },
  { slug: "trusting",  label: "Trusting — I am using suspicion instead of belief." },
  { slug: "guiding",   label: "Guiding — I am using control instead of partnership." },
];

/* §NEST-ZONES — Painted rowboat-nest hotspots. Coordinates
 * measured against the founder asset (native 3:2 1536×1024).
 * Refine via ?debug=1. */
const NEST_ZONES = [
  /* LEFT column (top → bottom) */
  { slug: "seeing",    top: 13, left: 7,  w: 21, h: 26 },
  { slug: "speaking",  top: 38, left: 7,  w: 21, h: 26 },
  { slug: "belonging", top: 63, left: 7,  w: 21, h: 26 },
  /* RIGHT column (top → bottom) */
  { slug: "including", top: 13, left: 72, w: 21, h: 26 },
  { slug: "trusting",  top: 38, left: 72, w: 21, h: 26 },
  { slug: "guiding",   top: 63, left: 72, w: 21, h: 26 },
];

const BACK_ZONE = {
  id: "back-to-wider-circle",
  label: "Back to The Circle We Create",
  route: "/parents-room/wider-circle",
  top: 1, left: 2, w: 12, h: 14,
};

/* §INVITATION-ZONE — Small painted area near the central parchment
 * that opens the long-form portrait "emotional anchor" canvas.
 * Footnote-style: present but quiet. */
const INVITATION_ZONE = {
  id: "the-invitation",
  label: "The invitation — read the long form",
  route: "/parents-room/wider-circle/every-child-is-our-child/invitation",
  top: 60, left: 36, w: 28, h: 26,
};

export default function WorldEveryChildIsOurChild() {
  const [params] = useSearchParams();
  const debug = params.get("debug") === "1";

  const zones = NEST_ZONES.map((z) => {
    const theme = NEST_THEMES.find((t) => t.slug === z.slug);
    return {
      id: `nest-${theme.slug}`,
      label: theme.label,
      route: `/parents-room/wider-circle/every-child-is-our-child/${theme.slug}`,
      top: z.top, left: z.left, w: z.w, h: z.h,
    };
  });

  return (
    <div
      data-testid="world-every-child-is-our-child"
      className="relative w-full"
      style={{ backgroundColor: "#0a0d15", minHeight: "100vh" }}
    >
      <div
        className="relative w-full mx-auto"
        style={{ aspectRatio: "3 / 2", maxWidth: "1536px" }}
      >
        <img
          src={WORLD_IMAGE}
          alt="Every Child Is Our Child — It takes a whole shore to raise a steady boat. A worn dock at sunset, a lighthouse on the far shore, six woven rowboat-nests around a small painted map: Seeing, Speaking, Belonging, Including, Trusting, Guiding. A long parchment reads: Children do not need perfect people. They need many safe ones. When many hearts take small steps, a child can grow with roots and wings. We do not raise them alone. We raise them together."
          className="absolute inset-0 w-full h-full object-contain select-none"
          draggable={false}
          loading="eager"
          data-testid="world-every-child-is-our-child-image"
        />

        {/* Back to The Circle We Create — wooden sign top-left. */}
        <Link
          to={BACK_ZONE.route}
          data-testid={`world-every-child-is-our-child-zone-${BACK_ZONE.id}`}
          aria-label={BACK_ZONE.label}
          title={BACK_ZONE.label}
          className="absolute block"
          style={{
            top: `${BACK_ZONE.top}%`, left: `${BACK_ZONE.left}%`,
            width: `${BACK_ZONE.w}%`, height: `${BACK_ZONE.h}%`,
            cursor: "pointer",
            background: debug ? "rgba(255, 200, 80, 0.25)" : "transparent",
            border: debug ? "1px dashed rgba(255, 200, 80, 0.9)" : "none",
            borderRadius: "12px",
            transition: "background 200ms ease-out",
          }}
          onMouseEnter={(e) => { if (!debug) e.currentTarget.style.background = "rgba(232, 217, 184, 0.08)"; }}
          onMouseLeave={(e) => { if (!debug) e.currentTarget.style.background = "transparent"; }}
        >
          {debug && (
            <span className="absolute top-0 left-0 px-1 text-[10px] font-mono"
              style={{ background: "rgba(255,200,80,0.95)", color: "#1a1305", pointerEvents: "none", whiteSpace: "nowrap" }}
            >{BACK_ZONE.id}</span>
          )}
        </Link>

        {/* Six painted rowboat-nest hotspots. */}
        {zones.map((z) => (
          <Link
            key={z.id}
            to={z.route}
            data-testid={`world-every-child-is-our-child-zone-${z.id}`}
            aria-label={z.label}
            title={z.label}
            className="absolute block"
            style={{
              top: `${z.top}%`, left: `${z.left}%`,
              width: `${z.w}%`, height: `${z.h}%`,
              cursor: "pointer",
              background: debug ? "rgba(255, 200, 80, 0.25)" : "transparent",
              border: debug ? "1px dashed rgba(255, 200, 80, 0.9)" : "none",
              borderRadius: "12px",
              transition: "background 200ms ease-out",
            }}
            onMouseEnter={(e) => { if (!debug) e.currentTarget.style.background = "rgba(232, 217, 184, 0.08)"; }}
            onMouseLeave={(e) => { if (!debug) e.currentTarget.style.background = "transparent"; }}
          >
            {debug && (
              <span className="absolute top-0 left-0 px-1 text-[10px] font-mono"
                style={{ background: "rgba(255,200,80,0.95)", color: "#1a1305", pointerEvents: "none", whiteSpace: "nowrap" }}
              >{z.id}</span>
            )}
          </Link>
        ))}

        {/* Central parchment / invitation — opens the long-form
            portrait "emotional anchor" canvas. */}
        <Link
          to={INVITATION_ZONE.route}
          data-testid={`world-every-child-is-our-child-zone-${INVITATION_ZONE.id}`}
          aria-label={INVITATION_ZONE.label}
          title={INVITATION_ZONE.label}
          className="absolute block"
          style={{
            top: `${INVITATION_ZONE.top}%`, left: `${INVITATION_ZONE.left}%`,
            width: `${INVITATION_ZONE.w}%`, height: `${INVITATION_ZONE.h}%`,
            cursor: "pointer",
            background: debug ? "rgba(180, 220, 255, 0.22)" : "transparent",
            border: debug ? "1px dashed rgba(180, 220, 255, 0.9)" : "none",
            borderRadius: "12px",
            transition: "background 200ms ease-out",
          }}
          onMouseEnter={(e) => { if (!debug) e.currentTarget.style.background = "rgba(232, 217, 184, 0.06)"; }}
          onMouseLeave={(e) => { if (!debug) e.currentTarget.style.background = "transparent"; }}
        >
          {debug && (
            <span className="absolute top-0 left-0 px-1 text-[10px] font-mono"
              style={{ background: "rgba(180,220,255,0.95)", color: "#0a0d15", pointerEvents: "none", whiteSpace: "nowrap" }}
            >{INVITATION_ZONE.id}</span>
          )}
        </Link>
      </div>
    </div>
  );
}
