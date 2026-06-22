/**
 * WiderCircleNest.jsx — § WIDER CIRCLE · NEST INTERIOR 2026-06-21
 *
 * Single reusable page that renders any of the 24 painted nest
 * interiors of the Wider Circle. Reads briefs from
 * /app/frontend/src/data/widerCircleNests.js (single source of truth).
 *
 * STRUCTURE LOCK (honours §SARA-VISUAL-SYSTEM-LOCK + §SARA-NO-SOLUTION-LOCK):
 *   - Warm parchment background. Cormorant Garamond serif body.
 *     Soft amber/cream accents. No neon, no tech-blue.
 *   - Wooden Back-sign at top-left → returns to the world hub.
 *   - Painted nest image (1:1 founder asset) sits in a soft cream
 *     frame at the top of the reading column.
 *   - Title + completion + core-truth row directly below the image.
 *   - Sara-voice intro paragraphs in a quiet reading column.
 *   - Reflection prompts in a parchment scroll panel.
 *   - Symbol line + "this nest is being painted" closing plaque.
 *   - Quiet permission line: "Or speak with Sara while you wait."
 *     (§SARA-ROOM-PHILOSOPHY-LOCK — never a button, just permission.)
 *
 * §SARA-NO-SOLUTION-LOCK: no nest ends with a fix. The reader carries
 *   the question out, not the answer.
 *
 * Route shape:
 *   /parents-room/wider-circle/<world-slug>/<nest-slug>
 */
import { Link, useParams } from "react-router-dom";
import { getNest } from "@/data/widerCircleNests";

const SERIF = '"Cormorant Garamond", "EB Garamond", Georgia, serif';

const PARCHMENT_BG =
  "radial-gradient(ellipse at top, #1f1a13 0%, #16110b 55%, #0b0805 100%)";

function NotFound({ worldRoute, worldLabel }) {
  return (
    <div
      data-testid="wider-circle-nest-missing"
      className="relative min-h-screen w-full flex items-center justify-center px-6"
      style={{ background: PARCHMENT_BG, color: "#f0eadd", fontFamily: SERIF }}
    >
      <div className="max-w-md text-center space-y-6">
        <p
          className="uppercase tracking-[0.4em] text-[11px]"
          style={{ color: "#c4a46b" }}
        >
          A corner of Sara&apos;s harbour
        </p>
        <h1 className="text-3xl md:text-4xl leading-tight" style={{ color: "#f0eadd" }}>
          This nest is still being painted.
        </h1>
        <p className="text-base italic" style={{ color: "#a09584" }}>
          The colour has not settled yet. Sara is in the harbour, waiting quietly.
        </p>
        <Link
          to={worldRoute || "/parents-room/wider-circle"}
          data-testid="wider-circle-nest-missing-back"
          className="inline-flex items-center justify-center px-6 py-3 rounded-full text-sm tracking-wider transition-all duration-300 border"
          style={{
            borderColor: "rgba(196, 164, 107, 0.5)",
            color: "#f0eadd",
            fontFamily: SERIF,
            letterSpacing: "0.08em",
          }}
        >
          Back to {worldLabel || "The Circle"}
        </Link>
      </div>
    </div>
  );
}

export default function WiderCircleNest({ world: worldProp }) {
  const params = useParams();
  /* Allow worldSlug to be passed as a prop from App.js route config
   * (since the route uses a literal world segment + ":sub"). Fall back
   * to the URL param if not provided. */
  const worldSlug = worldProp || params.world;
  const nestSlug = params.sub;
  const data = getNest(worldSlug, nestSlug);

  if (!data) {
    return <NotFound worldRoute={`/parents-room/wider-circle/${worldSlug}`} worldLabel="this world" />;
  }

  const { world, nest } = data;

  return (
    <div
      data-testid={`wider-circle-nest-${worldSlug}-${nestSlug}`}
      className="relative w-full min-h-screen"
      style={{
        background: PARCHMENT_BG,
        color: "#f0eadd",
        fontFamily: SERIF,
      }}
    >
      {/* Wooden Back-sign — top-left. Anchored to the world hub. */}
      <Link
        to={world.worldRoute}
        data-testid="wider-circle-nest-back"
        aria-label={`Back to ${world.worldLabel}`}
        className="absolute z-20 inline-flex items-center px-4 py-2 text-xs tracking-[0.25em] uppercase transition-all duration-300"
        style={{
          top: "1.75rem",
          left: "1.75rem",
          background: "rgba(56, 39, 22, 0.85)",
          color: "#e8d9b8",
          border: "1px solid rgba(196, 164, 107, 0.45)",
          borderRadius: "6px",
          fontFamily: SERIF,
          letterSpacing: "0.22em",
          boxShadow: "0 2px 10px rgba(0,0,0,0.4)",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "rgba(78, 54, 30, 0.95)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "rgba(56, 39, 22, 0.85)";
        }}
      >
        ← Back to {world.worldLabel}
      </Link>

      <div className="max-w-3xl mx-auto px-6 pt-24 pb-20">
        {/* Painted nest image — soft cream frame, painted edges honoured. */}
        <div
          className="relative w-full mx-auto mb-12 overflow-hidden"
          style={{
            maxWidth: "560px",
            aspectRatio: "1 / 1",
            borderRadius: "12px",
            border: "1px solid rgba(196, 164, 107, 0.28)",
            boxShadow:
              "0 20px 60px rgba(0,0,0,0.55), inset 0 0 0 6px rgba(232,217,184,0.06)",
            background: "#1a140e",
          }}
        >
          <img
            src={nest.image}
            alt={`${nest.title} — ${nest.coreTruth}. ${world.worldLabel}, Sara's Wider Circle.`}
            data-testid="wider-circle-nest-image"
            className="absolute inset-0 w-full h-full object-cover select-none"
            draggable={false}
            loading="eager"
          />
        </div>

        {/* Kicker — which world we are inside. */}
        <p
          className="text-center uppercase tracking-[0.4em] text-[10px] mb-4"
          style={{ color: "#c4a46b" }}
          data-testid="wider-circle-nest-kicker"
        >
          {world.worldLabel}
        </p>

        {/* Title. */}
        <h1
          className="text-center text-5xl md:text-6xl leading-tight mb-4"
          style={{ color: "#f0eadd", letterSpacing: "0.01em" }}
          data-testid="wider-circle-nest-title"
        >
          {nest.title}
        </h1>

        {/* Completion → Core truth row. The substitution sentence is
            shown as a small parchment caption beneath the title. */}
        <p
          className="text-center text-sm md:text-base italic mb-12"
          style={{ color: "#a09584", letterSpacing: "0.04em" }}
          data-testid="wider-circle-nest-completion"
        >
          <span style={{ color: "#8a7c66" }}>using</span>
          <span style={{ color: "#d6b97e", padding: "0 0.5rem" }}>
            {nest.completion}
          </span>
          <span style={{ color: "#8a7c66" }}>·</span>
          <span style={{ color: "#8a7c66", padding: "0 0.5rem" }}>finding</span>
          <span style={{ color: "#e8d9b8" }}>{nest.coreTruth}</span>
        </p>

        {/* Sara-voice intro paragraphs. */}
        <div
          className="space-y-5 text-lg md:text-xl leading-relaxed mb-14"
          style={{ color: "#e0d6c2" }}
          data-testid="wider-circle-nest-body"
        >
          {nest.intro.map((p, idx) => (
            <p key={idx}>{p}</p>
          ))}
        </div>

        {/* Reflection prompts — parchment panel. */}
        <div
          className="px-6 py-8 md:px-10 md:py-10 mb-12"
          data-testid="wider-circle-nest-prompts"
          style={{
            background:
              "linear-gradient(180deg, rgba(232,217,184,0.06) 0%, rgba(232,217,184,0.02) 100%)",
            border: "1px solid rgba(196, 164, 107, 0.22)",
            borderRadius: "10px",
          }}
        >
          <p
            className="uppercase tracking-[0.35em] text-[10px] mb-6 text-center"
            style={{ color: "#c4a46b" }}
          >
            Three quiet questions
          </p>
          <ul className="space-y-5">
            {nest.prompts.map((q, idx) => (
              <li
                key={idx}
                className="text-base md:text-lg leading-relaxed italic text-center"
                style={{ color: "#d8cbb1" }}
                data-testid={`wider-circle-nest-prompt-${idx + 1}`}
              >
                {q}
              </li>
            ))}
          </ul>
        </div>

        {/* Symbol line — quiet, single line. */}
        <p
          className="text-center text-sm italic mb-4"
          style={{ color: "#a09584" }}
          data-testid="wider-circle-nest-symbol"
        >
          {nest.symbol}
        </p>

        {/* Closing plaque — "this nest is being painted" + Sara permission. */}
        <p
          className="text-center text-xs uppercase tracking-[0.3em] mt-12 mb-2"
          style={{ color: "#7a6f5e" }}
        >
          This nest is being painted.
        </p>
        <p
          className="text-center text-sm italic"
          style={{ color: "#8a7c66" }}
          data-testid="wider-circle-nest-sara-permission"
        >
          Or speak with Sara while you wait.{" "}
          <Link
            to="/parents-room/v1"
            className="underline decoration-dotted underline-offset-4 transition-colors"
            style={{ color: "#c4a46b" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#e8d9b8")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#c4a46b")}
            data-testid="wider-circle-nest-sara-link"
          >
            She is in the harbour.
          </Link>
        </p>
      </div>
    </div>
  );
}
