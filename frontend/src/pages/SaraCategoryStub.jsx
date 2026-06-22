/**
 * SaraCategoryStub.jsx — § SARA CATEGORY STUB 2026-06-17
 *                       § SARA TEASER 2026-06-21 (refined)
 *
 * Placeholder destination for the 15 painted stone-leaves on the
 * Sara hub (/parents-room) AND for sub-nest routes inside each
 * painted world. Now reads from `saraForestTeasers.js` so the
 * visitor lands on a Sara-voice teaser instead of a generic "soft
 * 404". When no teaser exists for the slug, the original quiet
 * 404 fallback is shown — softened in tone (§SARA-NEST-READY-LOCK).
 *
 * Visual: warm sunset-garden palette. A single line names the
 * category, a Sara-voice teaser paragraph sets the mood, and one
 * cream CTA returns the visitor to the painted hub. No lens menu,
 * no situation grid — Sara's identity stays intact.
 *
 * §IDENTITY-LOCK 2026-06-17 — anti-wellness tone.
 * §SARA-ROOM-PHILOSOPHY-LOCK — "Sara waits quietly in the harbour."
 */
import { Link, useParams } from "react-router-dom";
import { getForestTeaser } from "@/data/saraForestTeasers";

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

const SERIF = '"Cormorant Garamond", "EB Garamond", Georgia, serif';

export default function SaraCategoryStub() {
  const { slug, sub } = useParams();
  const categoryLabel = CATEGORY_LABELS[slug] || "A corner of Sara's garden";

  /* Resolve a Sara-voice teaser if one exists for this world+sub. */
  const teaser = sub ? getForestTeaser(slug, sub) : null;

  const title = teaser?.title || categoryLabel;
  const kicker = teaser
    ? `${categoryLabel} · a corner of Sara's garden`
    : sub
      ? `${categoryLabel} · a corner of Sara's garden`
      : "A quiet corner of Sara's garden";

  /* Back-link points to the parent painted world when in a sub-stub,
   * otherwise back to the Sara hub. */
  const backRoute = sub ? `/parents-room/category/${slug}` : "/parents-room";
  const backLabel = sub ? `Back to ${categoryLabel}` : "Back to the garden";

  return (
    <div
      data-testid="sara-category-stub"
      className="relative min-h-screen w-full flex items-center justify-center px-6 py-16"
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

        {teaser ? (
          <p
            className="text-lg md:text-xl leading-relaxed"
            style={{ color: "#e0d6c2" }}
            data-testid="sara-category-stub-teaser"
          >
            {teaser.line}
          </p>
        ) : (
          <p
            className="text-base md:text-lg leading-relaxed"
            style={{ color: "#cdc4b3" }}
            data-testid="sara-category-stub-body"
          >
            This part of the garden has not been painted yet. The seeds are
            in the soil, the light is warm — when the colour has settled,
            Sara will be here.
          </p>
        )}

        <p
          className="text-sm md:text-base italic"
          style={{ color: "#a09584" }}
          data-testid="sara-category-stub-permission"
        >
          In the meantime, Sara waits quietly in the harbour. You are welcome
          to walk in.
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
            Speak with Sara
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
