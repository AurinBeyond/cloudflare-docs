/**
 * WiderCircleHub.jsx — § THE CIRCLE WE CREATE (placeholder) 2026-06-19
 *
 * Placeholder landing page for the secondary hub "The Circle We
 * Create". Reached from Sara Hub via the sea-ripple overlay near
 * the lighthouse. Will be replaced with the full painted hub
 * (4 wider worlds arranged as ripples on a pond) in Etapp 2.
 *
 * §CIRCLE-LOCK 2026-06-19 — Secondary hub of the Sara universe.
 * Forest = tree (rooted). Circle = water (moving). Same ecosystem.
 *
 * URL: /parents-room/wider-circle
 */
import { Link } from "react-router-dom";

export default function WiderCircleHub() {
  return (
    <div
      data-testid="wider-circle-hub"
      className="relative w-full min-h-screen flex flex-col items-center justify-center px-6 py-16"
      style={{
        background:
          "radial-gradient(ellipse at center, #1a1f2e 0%, #0a0d15 70%)",
        color: "#e8d9b8",
      }}
    >
      <div className="max-w-2xl text-center space-y-8">
        <div
          className="text-xs uppercase tracking-[0.3em] opacity-70"
          style={{ fontFamily: "serif" }}
          data-testid="wider-circle-eyebrow"
        >
          A wider circle of questions
        </div>

        <h1
          className="text-4xl sm:text-5xl lg:text-6xl"
          style={{
            fontFamily: "Georgia, 'Times New Roman', serif",
            fontWeight: 400,
            letterSpacing: "0.04em",
          }}
          data-testid="wider-circle-title"
        >
          The Circle We Create
        </h1>

        <p
          className="text-base sm:text-lg italic opacity-80"
          style={{ fontFamily: "Georgia, serif" }}
          data-testid="wider-circle-subtitle"
        >
          Every choice reaches further than we think.
        </p>

        <div
          className="mx-auto w-32 h-px opacity-30"
          style={{ background: "#e8d9b8" }}
        />

        <p
          className="text-sm sm:text-base opacity-70 leading-relaxed"
          data-testid="wider-circle-blurb"
        >
          Four wider worlds about presence, responsibility, influence
          and what we pass forward — each a ripple moving outward
          from the same quiet pond beside Sara's tree.
        </p>

        <p
          className="text-xs uppercase tracking-[0.3em] opacity-50 pt-8"
          data-testid="wider-circle-coming-soon"
        >
          Coming soon
        </p>

        <Link
          to="/parents-room"
          data-testid="wider-circle-back-to-forest"
          className="inline-block mt-8 px-6 py-2 border border-current rounded-full text-sm tracking-wide hover:bg-white/5 transition-colors"
        >
          ← Return to Sara's Forest
        </Link>
      </div>
    </div>
  );
}
