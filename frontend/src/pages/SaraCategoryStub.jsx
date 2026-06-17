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

const SERIF = '"Cormorant Garamond", "EB Garamond", Georgia, serif';

export default function SaraCategoryStub() {
  const { slug } = useParams();
  const label = CATEGORY_LABELS[slug] || "A corner of Sara's garden";

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
          A quiet corner of Sara&rsquo;s garden
        </p>

        <h1
          className="text-4xl md:text-5xl leading-tight"
          style={{ color: "#f0eadd", letterSpacing: "0.01em" }}
          data-testid="sara-category-stub-title"
        >
          {label}
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
            to="/parents-room"
            data-testid="sara-category-stub-back-cta"
            className="inline-flex items-center justify-center px-6 py-3 rounded-full text-sm tracking-wider transition-all duration-300 border"
            style={{
              borderColor: "rgba(196, 164, 107, 0.5)",
              color: "#f0eadd",
              fontFamily: SERIF,
              letterSpacing: "0.08em",
            }}
          >
            Back to the garden
          </Link>
        </div>
      </div>
    </div>
  );
}
