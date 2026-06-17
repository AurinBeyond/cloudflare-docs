/**
 * SaraHub.jsx — § SARA HUB v1 · THE QUIET HEART OF THE FAMILY 2026-06-17
 *
 * Painted Map Pattern hub page (background image + invisible
 * hotspots — a generic technical principle, identical to
 * BodyWorld.jsx). The painted founder mockup (lighthouse + cottage
 * + central nest + 15 stone-leaves + Sara avatar card + garden
 * card) IS the literal UI. Invisible click-zones layer over every
 * painted UI element.
 *
 * STRUCTURE LOCK (founder direction 2026-06-17)
 *   - Sara is "The Quiet Heart of the Family" — Amae-style safe
 *     centre. The hero is NOT a lens menu. Lenses (Ikuji,
 *     Montessori, Scandinavian, French Cadre, Reggio, Waldorf,
 *     Positive Coding) live in the backend only.
 *   - 15 stone-leaves arranged around the central nest. Each is
 *     a real-life parenting concern (My Child, Our Family,
 *     Emotions & Safety, ...).
 *   - Central nest holds the room's compass question:
 *     "What's going on between us?" with the chat entry.
 *   - URL: /parents-room (canonical). Legacy chat / 8-situation
 *     interior preserved at /parents-room/v1.
 *   - Append ?debug=1 to visualise hotspots (founder calibration).
 */
import { Link, useSearchParams } from "react-router-dom";

/* §SARA-HUB-LOCK 2026-06-17 — Founder-approved hub asset (newest
 * upload: qted5bys_image.png, 3.0 MB). Title "Sara", subtitle
 * "Your guide for every parenting moment", poem fragment, central
 * compass question "What's going on between us?", Sara avatar
 * card, garden card and 15 numbered stone-leaves all baked into
 * the painting. DO NOT CHANGE the asset without founder approval. */
const HUB_IMAGE =
  "https://customer-assets.emergentagent.com/job_aurin-hub/artifacts/qted5bys_image.png";

/* §SARA-CATEGORIES — 15 real-life parenting concerns painted on the
 * hub. Slugs are kebab-case, stable for routing. Position numbers
 * match the gilded numerals painted on each stone-leaf. */
const SARA_CATEGORIES = [
  { n: 1,  slug: "my-child",                   label: "My Child" },
  { n: 2,  slug: "our-family",                 label: "Our Family" },
  { n: 3,  slug: "emotions-safety",            label: "Emotions & Safety" },
  { n: 4,  slug: "boundaries-responsibility",  label: "Boundaries & Responsibility" },
  { n: 5,  slug: "growth-development",         label: "Growth & Development" },
  { n: 6,  slug: "relationships-cooperation",  label: "Relationships & Cooperation" },
  { n: 7,  slug: "challenging-situations",     label: "Challenging Situations" },
  { n: 8,  slug: "wisdom-garden",              label: "Wisdom Garden" },
  { n: 9,  slug: "weekly-digest",              label: "Weekly Digest" },
  { n: 10, slug: "stories-real-life",          label: "Stories from Real Life" },
  { n: 12, slug: "school-friends-world",       label: "School, Friends & the World" },
  { n: 13, slug: "parenting-journey",          label: "Parenting Journey" },
  { n: 14, slug: "generations-roots",          label: "Generations & Roots" },
  { n: 15, slug: "home-memories-roots",        label: "Home, Memories & Roots" },
];

/* §STONE-ZONES — 14 painted stone-leaf hotspots. Coordinates measured
 * against the founder hub asset (native 1536×1024, served at the
 * container's 1.5:1 aspect ratio). Each zone is sized to cover the
 * full leaf shape, not just the numeral. Refine via ?debug=1. */
const STONE_ZONES = [
  { n: 1,  top: 23, left:  4, w: 14, h: 14 },  /* My Child                    */
  { n: 2,  top: 31, left: 25, w: 14, h: 14 },  /* Our Family                  */
  { n: 3,  top: 41, left: 11, w: 14, h: 14 },  /* Emotions & Safety           */
  { n: 4,  top: 57, left:  4, w: 14, h: 14 },  /* Boundaries & Responsibility */
  { n: 5,  top: 60, left: 20, w: 14, h: 14 },  /* Growth & Development        */
  { n: 6,  top: 77, left: 15, w: 14, h: 14 },  /* Relationships & Cooperation */
  { n: 7,  top: 77, left: 34, w: 14, h: 14 },  /* Challenging Situations      */
  { n: 8,  top: 77, left: 53, w: 14, h: 14 },  /* Wisdom Garden               */
  { n: 9,  top: 64, left: 64, w: 14, h: 14 },  /* Weekly Digest               */
  { n: 10, top: 53, left: 83, w: 14, h: 14 },  /* Stories from Real Life      */
  { n: 12, top: 47, left: 67, w: 14, h: 14 },  /* School, Friends & the World */
  { n: 13, top: 28, left: 60, w: 14, h: 14 },  /* Parenting Journey           */
  { n: 14, top: 35, left: 74, w: 14, h: 14 },  /* Generations & Roots         */
  { n: 15, top: 22, left: 83, w: 14, h: 14 },  /* Home, Memories & Roots      */
];

/* §CHAT-ZONES — Central nest (compass question + "Chat with Sara")
 * + top-right Sara avatar card + bottom-right garden card. All route
 * to the existing /parents-room/v1 interior (chat + 8 situations
 * + ConvAI Sara). */
const CHAT_ZONES = [
  /* Inner cream oval of the central nest — question + chat button. */
  { id: "chat-center-nest", label: "Chat with Sara", route: "/parents-room/v1", top: 45, left: 39, w: 23, h: 28 },
  /* Top-right floating Sara avatar + "Chat with Sara" card.        */
  { id: "chat-avatar-card", label: "Chat with Sara", route: "/parents-room/v1", top:  2, left: 78, w: 20, h: 15 },
  /* Bottom-right "Sara's garden grows together with you." card.    */
  { id: "garden-companion", label: "Sara's garden",  route: "/parents-room/v1", top: 87, left: 75, w: 23, h: 11 },
];

export default function SaraHub() {
  const [params] = useSearchParams();
  const debug = params.get("debug") === "1";

  const stoneZones = STONE_ZONES.map((s) => {
    const cat = SARA_CATEGORIES.find((c) => c.n === s.n);
    return {
      id: `stone-${cat.slug}`,
      label: `${cat.n}. ${cat.label}`,
      route: `/parents-room/category/${cat.slug}`,
      top: s.top,
      left: s.left,
      w: s.w,
      h: s.h,
    };
  });

  const allZones = [...stoneZones, ...CHAT_ZONES];

  return (
    <div
      data-testid="sara-hub"
      className="relative w-full"
      style={{ backgroundColor: "#0a0d15", minHeight: "100vh" }}
    >
      <div
        className="relative w-full mx-auto"
        style={{ aspectRatio: "1536 / 1024", maxWidth: "1400px" }}
      >
        <img
          src={HUB_IMAGE}
          alt="Sara — The Quiet Heart of the Family. A lighthouse, a cottage, a nest at the centre, and fifteen stone-leaves of family life."
          className="absolute inset-0 w-full h-full object-cover select-none"
          draggable={false}
          loading="eager"
          data-testid="sara-hub-image"
        />
        {allZones.map((z) => (
          <Link
            key={z.id}
            to={z.route}
            data-testid={`sara-hub-zone-${z.id}`}
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
