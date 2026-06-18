/**
 * SaraMyChild.jsx — § SARA WORLD 1 · MY CHILD 2026-06-17
 *
 * Painted Map Pattern interior page for Sara category #1 "My Child".
 * Same technical principle as SaraHub.jsx and BodyWorld.jsx: a
 * founder-painted background image plus invisible click-zones that
 * sit over each painted UI element.
 *
 * STRUCTURE LOCK (founder direction 2026-06-17)
 *   - Same Sara visual language: ancient tree, soft morning light,
 *     hand-painted texture, woodland atmosphere, nest motif.
 *   - One curious child in the centre exploring the path.
 *   - Six painted nests around the child, each labelled on a small
 *     wooden plaque:
 *         · Temperament         (birds)
 *         · Strengths & Gifts   (golden stars)
 *         · Needs               (pillow / teddy / bottle)
 *         · Feelings            (emotion-leaves)
 *         · Learning Style      (winding path with symbols)
 *         · Development Stages  (tree rings + seasonal symbols)
 *   - The painted asset already contains the title "MY CHILD" and
 *     the subtitle "Seeing the child before trying to change the
 *     child" — no React-rendered text overlays.
 *   - URL: /parents-room/category/my-child
 *   - Each nest routes to /parents-room/category/my-child/<sub>,
 *     which currently lands on the SaraCategoryStub interior until
 *     founder visuals arrive for each sub-theme.
 *   - Append ?debug=1 to visualise hotspots (founder calibration).
 */
import { Link, useSearchParams } from "react-router-dom";

/* §MY-CHILD-LOCK 2026-06-17 — Founder-approved asset
 * (rijfgst3_image.png, 3.1 MB). Title + subtitle baked into the
 * painting. DO NOT change the asset without founder approval. */
const WORLD_IMAGE =
  "https://customer-assets.emergentagent.com/job_aurin-hub/artifacts/rijfgst3_image.png";

/* §MY-CHILD-NESTS — Six painted nest hotspots arranged around the
 * curious child at the centre. Slugs are kebab-case, stable for
 * routing. Labels copied verbatim from the wooden plaques painted
 * on the asset. */
const NEST_THEMES = [
  { slug: "temperament",         label: "Temperament" },
  { slug: "strengths-gifts",     label: "Strengths & Gifts" },
  { slug: "needs",               label: "Needs" },
  { slug: "feelings",            label: "Feelings" },
  { slug: "learning-style",      label: "Learning Style" },
  { slug: "development-stages",  label: "Development Stages" },
];

/* §NEST-ZONES — Painted nest hotspots. Coordinates measured against
 * the founder asset (roughly square aspect). Each zone is sized to
 * cover the woven nest basket, not just the wooden label. Refine
 * via ?debug=1. */
const NEST_ZONES = [
  { slug: "temperament",         top: 13, left: 10, w: 22, h: 22 },  /* top-left    · birds          */
  { slug: "strengths-gifts",     top: 40, left: 10, w: 22, h: 22 },  /* mid-left    · golden stars   */
  { slug: "needs",               top: 68, left: 10, w: 22, h: 22 },  /* bottom-left · soft objects   */
  { slug: "feelings",            top: 13, left: 68, w: 22, h: 22 },  /* top-right   · emotion-leaves */
  { slug: "learning-style",      top: 40, left: 68, w: 22, h: 22 },  /* mid-right   · winding path   */
  { slug: "development-stages",  top: 68, left: 68, w: 22, h: 22 },  /* bottom-right· tree rings     */
];

export default function SaraMyChild() {
  const [params] = useSearchParams();
  const debug = params.get("debug") === "1";

  const zones = NEST_ZONES.map((z) => {
    const theme = NEST_THEMES.find((t) => t.slug === z.slug);
    return {
      id: `nest-${theme.slug}`,
      label: theme.label,
      route: `/parents-room/category/my-child/${theme.slug}`,
      top: z.top,
      left: z.left,
      w: z.w,
      h: z.h,
    };
  });

  return (
    <div
      data-testid="sara-my-child"
      className="relative w-full"
      style={{ backgroundColor: "#0a0d15", minHeight: "100vh" }}
    >
      <div
        className="relative w-full mx-auto"
        style={{ aspectRatio: "1536 / 1024", maxWidth: "1400px" }}
      >
        <img
          src={WORLD_IMAGE}
          alt="My Child — Seeing the child before trying to change the child. A curious child in a sunlit forest, surrounded by six woven nests for Temperament, Strengths & Gifts, Needs, Feelings, Learning Style and Development Stages."
          className="absolute inset-0 w-full h-full object-cover select-none"
          draggable={false}
          loading="eager"
          data-testid="sara-my-child-image"
        />
        {zones.map((z) => (
          <Link
            key={z.id}
            to={z.route}
            data-testid={`sara-my-child-zone-${z.id}`}
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
