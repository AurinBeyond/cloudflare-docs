/**
 * §AUDIT-W4 2026-05-20 — Root-level React Error Boundary.
 *
 * Without this, a single thrown render in any child unmounts the
 * entire tree → "BLANK BLACK PAGE" (the symptom reported by founder
 * on prod /clarity-release). This boundary catches the throw, logs
 * it to the console (so devtools shows the stack), and renders a
 * calm "something tripped" card with a hard-refresh affordance.
 *
 * Brand-aligned: dark stage, brass accent, serif title, no AI hint,
 * no "Error" tone — the wanderer is gently invited to start fresh.
 */
import { Component } from "react";

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, errorMessage: "" };
  }

  static getDerivedStateFromError(error) {
    return {
      hasError: true,
      errorMessage: error?.message || "an unexpected ripple",
    };
  }

  componentDidCatch(error, info) {
    // Surface to DevTools so the founder can paste a screenshot if it
    // ever recurs. Production sourcemaps are not shipped, so the stack
    // will be minified — still useful for correlating Sentry-style.
    console.error(
      "[Aurin] Root error boundary caught:",
      error,
      info?.componentStack,
    );
  }

  handleHardRefresh = () => {
    try {
      if (typeof window !== "undefined") {
        window.location.reload();
      }
    } catch {
      /* noop */
    }
  };

  render() {
    if (!this.state.hasError) return this.props.children;
    return (
      <div
        data-testid="root-error-boundary"
        className="min-h-screen flex items-center justify-center bg-[#0b0a08] px-6 py-20"
      >
        <div className="max-w-md w-full text-center">
          <p className="text-[11px] tracking-[0.42em] uppercase text-[#c4a46b] mb-7">
            — A quiet ripple
          </p>
          <h2
            className="text-[28px] sm:text-[34px] leading-[1.18] text-[#f0eadd] font-light mb-6"
            style={{ fontFamily: "var(--aurin-serif), serif" }}
          >
            Something paused for a breath.
          </h2>
          <p
            className="text-[14px] leading-[1.85] italic text-[#a59f93] mb-10 font-light"
            style={{ fontFamily: "var(--aurin-serif), serif" }}
          >
            The room is still here. A gentle refresh will return you to
            where you were.
          </p>
          <button
            type="button"
            onClick={this.handleHardRefresh}
            data-testid="root-error-refresh"
            className="inline-flex items-center gap-3 px-7 py-3 border border-[rgba(196,164,107,0.45)] text-[#f0eadd] text-[11px] tracking-[0.42em] uppercase hover:bg-[rgba(196,164,107,0.08)] hover:border-[rgba(196,164,107,0.7)] transition-colors duration-500"
          >
            <span>Refresh quietly</span>
            <span className="text-[#c4a46b]" aria-hidden="true">↻</span>
          </button>
        </div>
      </div>
    );
  }
}

export default ErrorBoundary;
