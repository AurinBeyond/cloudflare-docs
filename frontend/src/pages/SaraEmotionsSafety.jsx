/**
 * SaraEmotionsSafety.jsx — § SARA WORLD 2 · EMOTIONS & SAFETY 2026-06-18
 *
 * Painted Map Pattern interior page for Sara category #3 "Emotions
 * & Safety". Same technical principle as SaraHub.jsx, BodyWorld.jsx
 * and SaraMyChild.jsx: a founder-painted background image plus
 * invisible click-zones that sit over each painted UI element.
 *
 * STRUCTURE LOCK (founder direction 2026-06-18)
 *   - Sara visual language continues: ancient tree, soft golden
 *     light, hand-painted texture, woodland atmosphere, nest motif.
 *   - At the centre — a mother holding a child in a large nest.
 *     This is the Amae moment ("I am held, I may rest"). The
 *     atmosphere is gentler and more protective than My Child.
 *   - Six painted nests arranged around the central embrace, each
 *     labelled on a small wooden plaque:
 *         · Feelings              (emotion-leaves)
 *         · Safety & Trust        (lantern light)
 *         · Fear                  (storm with distant lighthouse)
 *         · Anger                 (autumn leaves on the wind)
 *         · Sadness               (child under an umbrella)
 *         · Regulation & Recovery (rainbow over a calm stream)
 *   - Title "EMOTIONS & SAFETY" and subtitle "Every feeling is a
 *     messenger. Safety helps us listen." are baked into the
 *     painting — no React-rendered text overlays.
 *   - URL: /parents-room/category/emotions-safety
 *   - Each nest routes to /parents-room/category/emotions-safety/
 *     <sub>, currently landing on SaraCategoryStub until founder
 *     visuals arrive for each sub-theme.
 *   - Append ?debug=1 to visualise hotspots (founder calibration).
 *
 * Founder picked Asset A (single mother + child, pbiwwti2_*.png)
 * over Asset B (two parents with background figure) for keeping
 * the Amae composition clean.
 */
import { Link, useSearchParams } from "react-router-dom";

/* §EMOTIONS-SAFETY-LOCK 2026-06-18 — Founder-approved asset
 * (pbiwwti2_ChatGPT...09_36_24.png, 3.1 MB). Title + subtitle
 * baked into the painting. DO NOT change the asset without
 * founder approval. */
const WORLD_IMAGE =
  "https://customer-assets.emergentagent.com/job_aurin-hub/artifacts/pbiwwti2_ChatGPT%20Image%2018.%20juni%202026%2C%2009_36_24.png";

/* §EMOTIONS-SAFETY-NESTS — Six painted nest hotspots arranged
 * around the central mother-child embrace. Slugs are kebab-case,
 * stable for routing. Labels copied verbatim from the wooden
 * plaques painted on the asset. */
const NEST_THEMES = [
  { slug: "feelings",                label: "Feelings" },
  { slug: "safety-trust",            label: "Safety & Trust" },
  { slug: "fear",                    label: "Fear" },
  { slug: "anger",                   label: "Anger" },
  { slug: "sadness",                 label: "Sadness" },
  { slug: "regulation-recovery",     label: "Regulation & Recovery" },
];

/* §NEST-ZONES — Painted nest hotspots. Coordinates measured against
 * the founder asset (3:2 aspect, same as the rest of the Sara
 * worlds). Each zone is sized to cover the woven nest basket and
 * its wooden label. Refine via ?debug=1. */
const NEST_ZONES = [
  { slug: "feelings",              top: 13, left: 10, w: 22, h: 22 },  /* top-left     · emotion-leaves       */
  { slug: "safety-trust",          top: 13, left: 68, w: 22, h: 22 },  /* top-right    · lantern              */
  { slug: "fear",                  top: 40, left: 10, w: 22, h: 22 },  /* mid-left     · lighthouse + storm   */
  { slug: "anger",                 top: 40, left: 68, w: 22, h: 22 },  /* mid-right    · autumn leaves        */
  { slug: "sadness",               top: 68, left: 10, w: 22, h: 22 },  /* bottom-left  · child + umbrella     */
  { slug: "regulation-recovery",   top: 68, left: 68, w: 22, h: 22 },  /* bottom-right · rainbow over stream  */
];

export default function SaraEmotionsSafety() {
  const [params] = useSearchParams();
  const debug = params.get("debug") === "1";

  const zones = NEST_ZONES.map((z) => {
    const theme = NEST_THEMES.find((t) => t.slug === z.slug);
    return {
      id: `nest-${theme.slug}`,
      label: theme.label,
      route: `/parents-room/category/emotions-safety/${theme.slug}`,
      top: z.top,
      left: z.left,
      w: z.w,
      h: z.h,
    };
  });

  return (
    <div
      data-testid="sara-emotions-safety"
      className="relative w-full"
      style={{ backgroundColor: "#0a0d15", minHeight: "100vh" }}
    >
      <div
        className="relative w-full mx-auto"
        style={{ aspectRatio: "1536 / 1024", maxWidth: "1400px" }}
      >
        <img
          src={WORLD_IMAGE}
          alt="Emotions & Safety — Every feeling is a messenger. Safety helps us listen. A mother holds her child in a great woven nest, surrounded by six smaller nests for Feelings, Safety & Trust, Fear, Anger, Sadness, Regulation & Recovery."
          className="absolute inset-0 w-full h-full object-cover select-none"
          draggable={false}
          loading="eager"
          data-testid="sara-emotions-safety-image"
        />
        {zones.map((z) => (
          <Link
            key={z.id}
            to={z.route}
            data-testid={`sara-emotions-safety-zone-${z.id}`}
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
