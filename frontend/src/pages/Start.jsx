import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

/**
 * /start — quiet single-purpose entry page.
 *
 * Used as a clean URL for traffic campaigns / shared links.
 * No marketing. No funnel. One soft door.
 *
 * After 2.5s, gently redirects to /the-beginning if the user
 * doesn't move first. Pressing any visible link cancels the timer.
 */
export default function Start() {
  const navigate = useNavigate();

  useEffect(() => {
    const t = setTimeout(() => navigate("/the-beginning"), 2500);
    return () => clearTimeout(t);
  }, [navigate]);

  return (
    <div
      data-testid="page-start"
      className="min-h-[70vh] flex items-center justify-center px-6"
    >
      <div className="max-w-[560px] text-center space-y-7">
        <div className="aurin-eyebrow">A small door</div>
        <h1 className="aurin-display text-4xl md:text-5xl leading-tight">
          Welcome.{" "}
          <span className="aurin-serif-italic text-[hsl(var(--aurin-sage))]">
            Take a breath.
          </span>
        </h1>
        <p className="text-[14.5px] leading-[1.85] text-[hsl(var(--aurin-text-muted))] max-w-[42ch] mx-auto">
          You don't have to understand everything at once.
          <br />
          Sometimes one step is enough.
        </p>
        <div className="pt-3 flex flex-wrap items-center justify-center gap-3">
          <Link
            to="/the-beginning"
            data-testid="start-cta-begin"
            className="aurin-btn aurin-btn-primary !text-[13px]"
          >
            Begin gently →
          </Link>
          <Link
            to="/library"
            data-testid="start-cta-library"
            className="aurin-btn aurin-btn-ghost !text-[13px]"
          >
            See the library
          </Link>
        </div>
      </div>
    </div>
  );
}
