/**
 * SaraCategoryStub.jsx — § SARA CATEGORY STUB 2026-06-17
 *
 * Placeholder destination for the 15 painted stone-leaves on the
 * Sara hub (/parents-room). Each leaf route lands here until the
 * dedicated category interiors are designed (visuals coming from
 * the founder).
 *
 * Visual: the same warm sunset-garden palette as the hub. A single
 * line names the category, a soft note acknowledges the work in
 * progress, and one cream CTA returns the visitor to the painted
 * hub. No lens menu, no situation grid — Sara's identity stays
 * intact: lenses behind, heart in front.
 *
 * §IDENTITY-LOCK 2026-06-17 — anti-wellness tone. The line uses
 * "a quiet corner of Sara's garden" — not "feature", not "module",
 * not "coming soon".
 */
import { Link, useParams } from "react-router-dom";

const CATEGORY_LABELS = {
  "my-child":                  "My Child",
  "our-family":                "Our Family",
  "emotions-safety":           "Emotions & Safety",
  "boundaries-responsibility": "Boundaries & Responsibility",
  "growth-development":        "Growth & Development",
  "relationships-cooperation": "Relationships & Cooperation",
  "challenging-situations":    "Challenging Situations",
  "wisdom-garden":             "Wisdom Garden",
  "weekly-digest":             "Weekly Digest",
  "stories-real-life":         "Stories from Real Life",
  "tools-exercises":           "Tools & Exercises",
  "parenting-journey":         "Parenting Journey",
  "generations-heritage":      "Generations & Heritage",
  "home-memories-roots":       "Home, Memories & Roots",
};

/* §SUB-THEME-LABELS — Sub-theme labels for painted nest hotspots
 * inside category interiors (e.g. /parents-room/category/my-child/
 * temperament). Each painted Sara world adds its own sub-keys here
 * as new founder assets arrive. */
const SUB_THEME_LABELS = {
  /* §MY-CHILD nests */
  "temperament":           "Temperament",
  "strengths-gifts":       "Strengths & Gifts",
  "needs":                 "Needs",
  "feelings":              "Feelings",
  "learning-style":        "Learning Style",
  "development-stages":    "Development Stages",
  /* §EMOTIONS-SAFETY nests */
  "safety-trust":          "Safety & Trust",
  "fear":                  "Fear",
  "anger":                 "Anger",
  "sadness":               "Sadness",
  "regulation-recovery":   "Regulation & Recovery",
  /* §OUR-FAMILY nests */
  "connection":            "Connection",
  "communication":         "Communication",
  "family-traditions":     "Family Traditions",
  "daily-life":            "Daily Life",
  "conflict-repair":       "Conflict & Repair",
  "belonging":             "Belonging",
};

const SERIF = '"Cormorant Garamond", "EB Garamond", Georgia, serif';

export default function SaraCategoryStub() {
  const { slug, sub } = useParams();
  const categoryLabel = CATEGORY_LABELS[slug] || "A corner of Sara's garden";
  const subLabel = sub ? SUB_THEME_LABELS[sub] : null;
  const title = subLabel || categoryLabel;
  /* Show the parent category as kicker when a sub-theme is open. */
  const kicker = subLabel
    ? `${categoryLabel} · a corner of Sara's garden`
    : "A quiet corner of Sara's garden";
  /* Back-link points to the parent painted world when in a sub-stub,
   * otherwise back to the Sara hub. */
  const backRoute = sub ? `/parents-room/category/${slug}` : "/parents-room";
  const backLabel = sub ? `Back to ${categoryLabel}` : "Back to the garden";

  return (
    <div
      data-testid="sara-category-stub"
      className="relative min-h-screen w-full flex items-center justify-center px-6"
      style={{
        background:
          "radial-gradient(ellipse at center, #2a2118 0%, #1a1410 60%, #0d0a07 100%)",
        color: "#f0eadd",
        fontFamily: SERIF,
      }}
    >
      <div className="max-w-xl text-center space-y-8">
        <p
          className="uppercase tracking-[0.4em] text-[11px]"
          style={{ color: "#c4a46b" }}
          data-testid="sara-category-stub-kicker"
        >
          {kicker}
        </p>

        <h1
          className="text-4xl md:text-5xl leading-tight"
          style={{ color: "#f0eadd", letterSpacing: "0.01em" }}
          data-testid="sara-category-stub-title"
        >
          {title}
        </h1>

        <p
          className="text-base md:text-lg leading-relaxed"
          style={{ color: "#cdc4b3" }}
          data-testid="sara-category-stub-body"
        >
          This part of the garden is being tended. The seeds are in,
          the soil is warm — the stories, the wisdom and the small
          rituals that belong here are on the way.
        </p>

        <p
          className="text-sm md:text-base italic"
          style={{ color: "#a09584" }}
        >
          In the meantime, the centre of the room is open. Sara is
          there.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
          <Link
            to="/parents-room/v1"
            data-testid="sara-category-stub-chat-cta"
            className="inline-flex items-center justify-center px-6 py-3 rounded-full text-sm tracking-wider transition-all duration-300"
            style={{
              background: "#c4a46b",
              color: "#1a1305",
              fontFamily: SERIF,
              letterSpacing: "0.08em",
            }}
          >
            Chat with Sara
          </Link>
          <Link
            to={backRoute}
            data-testid="sara-category-stub-back-cta"
            className="inline-flex items-center justify-center px-6 py-3 rounded-full text-sm tracking-wider transition-all duration-300 border"
            style={{
              borderColor: "rgba(196, 164, 107, 0.5)",
              color: "#f0eadd",
              fontFamily: SERIF,
              letterSpacing: "0.08em",
            }}
          >
            {backLabel}
          </Link>
        </div>
      </div>
    </div>
  );
}
