/**
 * SaraHomeMemoriesRoots.jsx — § SARA WORLD 15 · HOME, MEMORIES & ROOTS 2026-06-19
 *
 * Painted Map Pattern interior page for Sara category #15
 * "Home, Memories & Roots". Home is not only a place. It is
 * the feeling of being known, remembered and welcomed.
 *
 * §SARA-CLOSING-RING 2026-06-19 — This is the final world that
 * closes the Sara forest ring. If World 1 begins with one child,
 * and World 14 reaches back through generations, World 15 asks:
 * "What is the place we return to inside?"
 *
 * STRUCTURE LOCK (founder direction 2026-06-19)
 *   - Sara visual language continues: ancient tree, soft golden
 *     light, hand-painted texture, woodland atmosphere, rope-bordered
 *     nest motif.
 *   - At the centre — a cobblestone path leading toward a warm,
 *     ivy-covered cottage at sunset. On the path: father with a
 *     guitar, daughter listening, son drawing in a notebook on the
 *     ground, mother holding a heart-mug, grandmother with grandson
 *     looking at an open photo album, golden retriever resting,
 *     lantern + mug + apples + flowers along the stones. A small
 *     wooden "Home" sign anchors the scene. A village valley with
 *     bunting recedes toward the sun.
 *   - The scene evokes belonging, memory, comfort and return —
 *     NOT architecture, real-estate or the "ideal home" narrative.
 *   - Six painted rope-bordered nests arranged in two vertical
 *     columns of three, each carrying a symbolic vignette:
 *         LEFT column  (top → bottom):
 *           · Places We Remember  (🌅 wooden pier extending into a mountain lake at sunrise)
 *           · Family Memories     (📷 old photo frames + teddy + candle + memory chest)
 *           · Traditions of Home  (🍞 bread + jug of wildflowers + lantern + small lake)
 *         RIGHT column (top → bottom):
 *           · Returning Home      (🕯️ a hand lighting a candle beside cups and jars of berries)
 *           · Belonging           (🪑 rocking chair + boots + plant beside a lit doorway)
 *           · Creating Home       (📜 open chest with handwritten note "New memories, new roots")
 *   - Title "HOME, MEMORIES & ROOTS" and subtitle "Home is not
 *     only a place. It is the feeling of being known, remembered
 *     and welcomed." are baked into the painting.
 *   - URL: /parents-room/category/home-memories-roots
 *   - Each nest routes to /parents-room/category/home-memories-roots/<sub>,
 *     landing on SaraCategoryStub until founder visuals arrive.
 *   - Append ?debug=1 to visualise hotspots (founder calibration).
 *
 * §SARA-CAST-VARIETY 2026-06-19 — Cast variation rule (founder):
 *   This world centres a **full multi-generation evening gathering
 *   on the doorstep of home** — father, mother, grandmother, three
 *   children and the family dog returning to the same hearth. The
 *   painting itself is the proof of "home is the feeling of being
 *   known, remembered and welcomed."
 *
 * §SARA-TONE-NOTE 2026-06-19 — Warm, open, human (founder):
 *   This world MUST stay welcoming, even for visitors whose
 *   own home story is difficult. Forbidden directions:
 *     · interior decoration / real estate
 *     · "ideal home" or "perfect family" narratives
 *     · luxury imagery
 *     · prescriptive "right way to make a home" teaching
 *   Permitted tones: belonging, memory, the quiet act of return,
 *   the small choice to create home today even if the past wasn't.
 *
 * §WORLD-14-VS-15 (founder distinction):
 *   World 14 = where we come from
 *   World 15 = where we belong
 *
 * §SARA-ASPECT-NOTE — Founder asset is square (1:1). Honour native
 *   dimensions; do not force into 3:2.
 */
import { Link, useSearchParams } from "react-router-dom";

/* §HOME-LOCK 2026-06-19 — Founder-approved asset
 * (nypj62t3_image.png, 3.3 MB, square 1:1). Title + subtitle
 * baked into the painting. DO NOT change the asset without
 * founder approval. */
const WORLD_IMAGE =
  "https://customer-assets.emergentagent.com/job_aurin-hub/artifacts/nypj62t3_image.png";

/* §HOME-NESTS — Six painted nest hotspots arranged in two
 * vertical columns flanking the central cobblestone path & cottage. */
const NEST_THEMES = [
  { slug: "places-we-remember", label: "Places We Remember" },
  { slug: "family-memories",    label: "Family Memories" },
  { slug: "traditions-of-home", label: "Traditions of Home" },
  { slug: "returning-home",     label: "Returning Home" },
  { slug: "belonging",          label: "Belonging" },
  { slug: "creating-home",      label: "Creating Home" },
];

/* §NEST-ZONES — Painted nest hotspots. Coordinates measured against
 * the founder asset (native 1024×1024 square). Two vertical columns
 * of three. Refine via ?debug=1. */
const NEST_ZONES = [
  { slug: "places-we-remember", top:  9, left:  4, w: 24, h: 24 },  /* top-left     · mountain lake pier at sunrise   */
  { slug: "returning-home",     top:  9, left: 72, w: 24, h: 24 },  /* top-right    · hand lighting a candle          */
  { slug: "family-memories",    top: 38, left:  4, w: 24, h: 24 },  /* mid-left     · photo frames + teddy + chest    */
  { slug: "belonging",          top: 38, left: 72, w: 24, h: 24 },  /* mid-right    · rocking chair + lit doorway     */
  { slug: "traditions-of-home", top: 67, left:  4, w: 24, h: 24 },  /* bottom-left  · bread + flowers + lantern + lake */
  { slug: "creating-home",      top: 67, left: 72, w: 24, h: 24 },  /* bottom-right · chest "new memories, new roots"  */
];

export default function SaraHomeMemoriesRoots() {
  const [params] = useSearchParams();
  const debug = params.get("debug") === "1";

  const zones = NEST_ZONES.map((z) => {
    const theme = NEST_THEMES.find((t) => t.slug === z.slug);
    return {
      id: `nest-${theme.slug}`,
      label: theme.label,
      route: `/parents-room/category/home-memories-roots/${theme.slug}`,
      top: z.top,
      left: z.left,
      w: z.w,
      h: z.h,
    };
  });

  return (
    <div
      data-testid="sara-home-memories-roots"
      className="relative w-full"
      style={{ backgroundColor: "#0a0d15", minHeight: "100vh" }}
    >
      <div
        className="relative w-full mx-auto"
        style={{ aspectRatio: "1 / 1", maxWidth: "1100px" }}
      >
        <img
          src={WORLD_IMAGE}
          alt="Home, Memories & Roots — Home is not only a place. It is the feeling of being known, remembered and welcomed. A warm ivy-covered cottage at sunset, with father, mother, grandmother and three children gathered on a cobblestone path beneath an ancient tree — guitar, photo album, mug, lantern and the family dog at rest. Six woven nests carry the threads of home: Places We Remember, Family Memories, Traditions of Home, Returning Home, Belonging, and Creating Home."
          className="absolute inset-0 w-full h-full object-cover select-none"
          draggable={false}
          loading="eager"
          data-testid="sara-home-memories-roots-image"
        />
        {zones.map((z) => (
          <Link
            key={z.id}
            to={z.route}
            data-testid={`sara-home-memories-roots-zone-${z.id}`}
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
