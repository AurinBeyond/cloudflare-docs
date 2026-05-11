/**
 * HumanSilhouette — PERMANENT RULE (founder directive):
 *
 *   The guide in the Clarity Release / Threshold surfaces MUST always
 *   appear as a HUMAN SILHOUETTE (male or female). Abstract light
 *   orbs break trust — people instinctively trust a human shape.
 *
 *   This component is the single source of truth. Do NOT replace with
 *   orbs/shapes/particles in future iterations.
 *
 * Sage-on-black, hand-drawn SVG. Breathes slowly via CSS. Pulses
 * faster when `active` is true (message being composed/sent).
 */
import "./HumanSilhouette.css";

export default function HumanSilhouette({
  gender = "female",
  active = false,
  size = 160,
  testid = "human-silhouette",
}) {
  const isMale = gender === "male";
  return (
    <div
      data-testid={testid}
      data-gender={gender}
      data-active={active ? "true" : "false"}
      className="human-silhouette"
      style={{ width: size, height: size * 1.35 }}
    >
      <svg
        viewBox="0 0 120 160"
        width="100%"
        height="100%"
        preserveAspectRatio="xMidYMid meet"
        aria-hidden="true"
      >
        <defs>
          <radialGradient id="aura" cx="50%" cy="45%" r="60%">
            <stop offset="0%" stopColor="hsl(var(--aurin-sage))" stopOpacity="0.38" />
            <stop offset="55%" stopColor="hsl(var(--aurin-sage))" stopOpacity="0.12" />
            <stop offset="100%" stopColor="hsl(var(--aurin-sage))" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* soft aura behind the figure */}
        <ellipse cx="60" cy="72" rx="52" ry="72" fill="url(#aura)" className="silhouette-aura" />

        {/* the human — sage outline, no fill */}
        <g
          fill="none"
          stroke="hsl(var(--aurin-sage))"
          strokeWidth="1.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.85"
          className="silhouette-body"
        >
          {/* head */}
          <circle cx="60" cy="28" r="11" />
          {isMale ? (
            <>
              {/* shoulders (male — broader, angular) */}
              <path d="M35 54 L60 50 L85 54" />
              {/* torso (straighter sides) */}
              <path d="M38 54 L40 100 L44 136" />
              <path d="M82 54 L80 100 L76 136" />
              {/* arms */}
              <path d="M38 58 L30 92 L32 120" />
              <path d="M82 58 L90 92 L88 120" />
              {/* legs */}
              <path d="M50 136 L46 154" />
              <path d="M70 136 L74 154" />
              {/* hips line */}
              <path d="M42 116 L78 116" opacity="0.4" />
            </>
          ) : (
            <>
              {/* shoulders (female — softer) */}
              <path d="M38 55 Q60 48 82 55" />
              {/* torso (curved waist) */}
              <path d="M40 55 Q36 80 42 100 Q44 120 46 138" />
              <path d="M80 55 Q84 80 78 100 Q76 120 74 138" />
              {/* arms */}
              <path d="M40 58 Q32 82 34 110 L36 122" />
              <path d="M80 58 Q88 82 86 110 L84 122" />
              {/* long skirt line (implied) */}
              <path d="M46 138 Q60 152 74 138" opacity="0.6" />
              {/* hips soft curve */}
              <path d="M42 116 Q60 122 78 116" opacity="0.4" />
            </>
          )}
          {/* heart point (tiny anchor dot) */}
          <circle cx="56" cy="72" r="1.2" fill="hsl(var(--aurin-sage))" opacity="0.6" />
        </g>
      </svg>
    </div>
  );
}
