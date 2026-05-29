/**
 * PolarstarThemePage.jsx — §POLARSTAR-CONTENT iter 86 2026-02-29
 *
 * Reusable themed page shell for every content surface BELOW the
 * Polarstar Main World. Reuses the same painted background image
 * (day-world-v2.png), softened with a per-room hue tint and a
 * cream parchment overlay so the content cards stay legible.
 *
 * Visual rules (anchored in the founder-approved Theme Page Design
 * mockup, 2026-02-29):
 *   - Same painted world style as the main page.
 *   - Top-left: pill-shaped "← Back to Polarstar World" button.
 *   - Centre-top: cloud title badge with H1 + age label.
 *   - Body: children render as floating cards on the painted floor.
 *   - Bottom: optional "Tip for parents" parchment card.
 *   - No grey dashboard chrome. Ever.
 */

import { Link } from "react-router-dom";
import { ArrowLeft, Lightbulb } from "lucide-react";

const SERIF = '"Cormorant Garamond", "EB Garamond", Georgia, serif';
const CAVEAT = '"Caveat", "Comic Sans MS", cursive';

const BG_IMG = "url('/polarstar/day-world-v2.png')";

export default function PolarstarThemePage({
  roomTitle,
  ageLabel,
  subtitle,
  palette = { tint: "rgba(252,230,200,0.18)", accent: "#b97a3a" },
  parentTip,
  backTo = "/kids-universe/polarstar",
  backLabel = "Back to Polarstar World",
  children,
  testid = "polarstar-theme-page",
}) {
  return (
    <div
      data-testid={testid}
      style={{
        position: "relative",
        minHeight: "calc(100vh - 72px)",
        width: "100%",
        backgroundImage: BG_IMG,
        backgroundSize: "cover",
        backgroundPosition: "center",
        overflow: "hidden",
        fontFamily: SERIF,
      }}
    >
      {/* Cream parchment overlay — softens the painting so content is
       *  legible without losing the painted-world feel. iter 86c:
       *  density bumped to 0.92 / 0.78 so the Main-World painted UI
       *  panels behind no longer compete for attention with the sub-
       *  page cards. */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          background: `linear-gradient(180deg, rgba(255,251,241,0.92) 0%, rgba(255,251,241,0.78) 45%, rgba(255,251,241,0.93) 100%), ${palette.tint}`,
          pointerEvents: "none",
        }}
      />

      {/* ─── Back button (top-left) ─── */}
      <Link
        to={backTo}
        data-testid="polarstar-theme-back"
        style={{
          position: "absolute",
          top: 22,
          left: 22,
          zIndex: 9,
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          padding: "10px 18px 10px 12px",
          borderRadius: 999,
          textDecoration: "none",
          background: "rgba(255,251,241,0.92)",
          border: `1.5px solid ${palette.accent}55`,
          color: "#3a2a18",
          fontSize: 14,
          fontWeight: 500,
          boxShadow: "0 6px 18px rgba(58,42,24,0.18)",
          backdropFilter: "blur(12px)",
        }}
      >
        <ArrowLeft size={16} aria-hidden="true" />
        <span>{backLabel}</span>
      </Link>

      {/* ─── Title cloud (top-centre) ─── */}
      <header
        style={{
          position: "absolute",
          top: 24,
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 8,
          padding: "16px 36px 14px",
          borderRadius: 28,
          textAlign: "center",
          background: "rgba(255,251,241,0.94)",
          border: `1.5px solid ${palette.accent}55`,
          boxShadow: "0 14px 32px rgba(58,42,24,0.22)",
          minWidth: 320,
          maxWidth: "min(640px, 70vw)",
        }}
      >
        <h1
          data-testid="polarstar-theme-title"
          style={{
            margin: 0,
            fontFamily: CAVEAT,
            fontSize: 38,
            lineHeight: 1.05,
            color: "#3a2a18",
            letterSpacing: "0.01em",
          }}
        >
          {roomTitle}
        </h1>
        {(ageLabel || subtitle) && (
          <p
            style={{
              margin: "4px 0 0",
              fontSize: 13,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: palette.accent,
            }}
          >
            {ageLabel}
            {ageLabel && subtitle ? " · " : ""}
            {subtitle && <span style={{ textTransform: "none", letterSpacing: 0, fontStyle: "italic", fontFamily: SERIF }}>{subtitle}</span>}
          </p>
        )}
      </header>

      {/* ─── Content body (scrollable beneath title strip) ─── */}
      <main
        style={{
          position: "relative",
          zIndex: 4,
          padding: "150px 32px 200px",
          maxWidth: 1280,
          margin: "0 auto",
        }}
      >
        {children}
      </main>

      {/* ─── Parent tip (bottom) ─── */}
      {parentTip && (
        <aside
          data-testid="polarstar-theme-parent-tip"
          style={{
            position: "absolute",
            left: 32,
            bottom: 28,
            zIndex: 6,
            maxWidth: 420,
            padding: "14px 18px",
            borderRadius: 18,
            background: "rgba(255,247,228,0.94)",
            border: `1.5px solid ${palette.accent}55`,
            boxShadow: "0 10px 26px rgba(58,42,24,0.18)",
            display: "flex",
            gap: 12,
            alignItems: "flex-start",
          }}
        >
          <span
            aria-hidden="true"
            style={{
              flex: "0 0 auto",
              width: 32,
              height: 32,
              borderRadius: "50%",
              background: `${palette.accent}22`,
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              color: palette.accent,
            }}
          >
            <Lightbulb size={16} />
          </span>
          <div>
            <div
              style={{
                fontSize: 11,
                letterSpacing: "0.22em",
                textTransform: "uppercase",
                color: palette.accent,
                marginBottom: 2,
                fontWeight: 600,
              }}
            >
              Tip for parents
            </div>
            <div
              style={{
                fontSize: 14.5,
                lineHeight: 1.5,
                color: "#3a2a18",
                fontStyle: "italic",
              }}
            >
              {parentTip}
            </div>
          </div>
        </aside>
      )}
    </div>
  );
}
