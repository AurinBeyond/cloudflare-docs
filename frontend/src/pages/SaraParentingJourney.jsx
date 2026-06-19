/**
 * SaraParentingJourney.jsx — § SARA WORLD 13 · PARENTING JOURNEY 2026-06-19
 *
 * Painted Map Pattern interior page for Sara category #13
 * "Parenting Journey". As children grow, parents grow too.
 * This world centres the parent's own inner road rather than
 * the child's — a quiet acknowledgement that no one walks
 * this path without being changed by it.
 *
 * STRUCTURE LOCK (founder direction 2026-06-19)
 *   - Sara visual language continues: ancient tree archway, soft
 *     golden light, hand-painted texture, woodland atmosphere,
 *     rope-bordered nest motif.
 *   - At the centre — a winding cobblestone path through woodland
 *     under a great tree. Different stages of parenthood walk the
 *     same road at once: young parents pushing a stroller in the
 *     foreground, a couple with a toddler, a mother with a child
 *     holding hands at the wooden signpost ("Learning · Loving ·
 *     Growing"), a family of three walking toward the sunset
 *     valley, and grandparents resting on a bench. The path is
 *     not a destination — it is the journey itself.
 *   - Six painted rope-bordered nests arranged in two vertical
 *     columns of three, each carrying a symbolic vignette:
 *         LEFT column  (top → bottom):
 *           · Becoming a Parent     (🍼 baby booties + teddy + heart journal)
 *           · Growing Through Challenges (🏮 lantern on a woodland path)
 *           · Learning About Yourself (🪞 mirror + plant + journal & pen)
 *         RIGHT column (top → bottom):
 *           · Letting Go of Perfection (☕ candle + mug + note "It's okay to be enough")
 *           · Balancing Family and Self (⚖️ scales — house on one side, plant on the other)
 *           · Looking Back, Looking Forward (📖 open photo album + compass + child drawings)
 *   - Title "PARENTING JOURNEY" and subtitle "As children grow,
 *     parents grow too." are baked into the painting.
 *   - URL: /parents-room/category/parenting-journey
 *   - Each nest routes to /parents-room/category/parenting-journey/<sub>,
 *     landing on SaraCategoryStub until founder visuals arrive.
 *   - Append ?debug=1 to visualise hotspots (founder calibration).
 *
 * §SARA-CAST-VARIETY 2026-06-19 — Cast variation rule (founder):
 *   This world is **multi-stage cast** — the same scene holds new
 *   parents, mid-life parents, and grandparents simultaneously,
 *   embodying "as children grow, parents grow too."
 *
 * §SARA-ASPECT-NOTE — Founder asset is square (1:1). Honour native
 *   dimensions; do not force into 3:2.
 */
import { Link, useSearchParams } from "react-router-dom";

/* §JOURNEY-LOCK 2026-06-19 — Founder-approved asset
 * (8shbu47m_image.png, 3.4 MB, square 1:1). Title + subtitle
 * baked into the painting. DO NOT change the asset without
 * founder approval. */
const WORLD_IMAGE =
  "https://customer-assets.emergentagent.com/job_aurin-hub/artifacts/8shbu47m_image.png";

/* §JOURNEY-NESTS — Six painted nest hotspots arranged in two
 * vertical columns flanking the central woodland-path scene. */
const NEST_THEMES = [
  { slug: "becoming-a-parent",          label: "Becoming a Parent" },
  { slug: "growing-through-challenges", label: "Growing Through Challenges" },
  { slug: "learning-about-yourself",    label: "Learning About Yourself" },
  { slug: "letting-go-of-perfection",   label: "Letting Go of Perfection" },
  { slug: "balancing-family-and-self",  label: "Balancing Family and Self" },
  { slug: "looking-back-looking-forward", label: "Looking Back, Looking Forward" },
];

/* §NEST-ZONES — Painted nest hotspots. Coordinates measured against
 * the founder asset (native 1024×1024 square). Two vertical columns
 * of three. Refine via ?debug=1. */
const NEST_ZONES = [
  { slug: "becoming-a-parent",            top:  9, left:  4, w: 24, h: 24 },  /* top-left     · booties + teddy + journal     */
  { slug: "letting-go-of-perfection",     top:  9, left: 72, w: 24, h: 24 },  /* top-right    · candle + mug + "enough" note  */
  { slug: "growing-through-challenges",   top: 38, left:  4, w: 24, h: 24 },  /* mid-left     · lantern on woodland path      */
  { slug: "balancing-family-and-self",    top: 38, left: 72, w: 24, h: 24 },  /* mid-right    · scales — house vs plant       */
  { slug: "learning-about-yourself",      top: 67, left:  4, w: 24, h: 24 },  /* bottom-left  · mirror + plant + journal      */
  { slug: "looking-back-looking-forward", top: 67, left: 72, w: 24, h: 24 },  /* bottom-right · photo album + compass         */
];

export default function SaraParentingJourney() {
  const [params] = useSearchParams();
  const debug = params.get("debug") === "1";

  const zones = NEST_ZONES.map((z) => {
    const theme = NEST_THEMES.find((t) => t.slug === z.slug);
    return {
      id: `nest-${theme.slug}`,
      label: theme.label,
      route: `/parents-room/category/parenting-journey/${theme.slug}`,
      top: z.top,
      left: z.left,
      w: z.w,
      h: z.h,
    };
  });

  return (
    <div
      data-testid="sara-parenting-journey"
      className="relative w-full"
      style={{ backgroundColor: "#0a0d15", minHeight: "100vh" }}
    >
      <div
        className="relative w-full mx-auto"
        style={{ aspectRatio: "1 / 1", maxWidth: "1100px" }}
      >
        <img
          src={WORLD_IMAGE}
          alt="Parenting Journey — As children grow, parents grow too. A winding cobblestone path through golden woodland holds different stages of parenthood at once: new parents with a stroller, a couple with a toddler, a mother and child at the wooden signpost reading Learning · Loving · Growing, a family walking toward sunset, and grandparents resting on a bench. Six rope-bordered nests carry the inner work of the road: Becoming a Parent, Growing Through Challenges, Learning About Yourself, Letting Go of Perfection, Balancing Family and Self, and Looking Back Looking Forward."
          className="absolute inset-0 w-full h-full object-cover select-none"
          draggable={false}
          loading="eager"
          data-testid="sara-parenting-journey-image"
        />
        {zones.map((z) => (
          <Link
            key={z.id}
            to={z.route}
            data-testid={`sara-parenting-journey-zone-${z.id}`}
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
