/**
 * Polarstar.jsx — /kids-universe/polarstar (main world)
 *
 * §POLARSTAR v10 2026-02-13 — Mode-aware container:
 *   - Day / morning  → PolarstarDayWorld (overlay panels on painted
 *                      day map, founder's exact spec)
 *   - Night / evening → existing v8 click-zone map (invisible
 *                      buttons over the painted night world)
 *
 * Both modes mount the same Explorer-List modal. Any descendant can
 * open the modal by dispatching `polarstar:openWaitlist`.
 */
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles } from "lucide-react";
import PolarstarAtmosphere from "@/components/PolarstarAtmosphere";
import PolarstarDayWorld from "@/components/PolarstarDayWorld";
import PolarstarWaitlistModal from "@/components/PolarstarWaitlistModal";
import "@/styles/polarstar.css";

const SERIF = '"Cormorant Garamond", "EB Garamond", Georgia, serif';

/* Night-painting click-zones (unchanged from v8). Coordinates were
 * tuned to the painted night-world-v2.png by the founder herself. */
const NIGHT_ZONES = [
  { id: "discovery",   label: "Discovery Path · 4–6 yrs",  route: "/kids-universe/polarstar/discovery",   top: 22, left: 10, w: 24, h: 13, active: true,  variant: "primary" },
  { id: "exploration", label: "Exploration · 7–10 yrs",    route: "/kids-universe/polarstar/exploration", top: 22, left: 36, w: 30, h: 13, active: true,  variant: "primary" },
  { id: "creation",    label: "Creation Path · 11–13 yrs", route: "/kids-universe/polarstar/creation",    top: 22, left: 68, w: 22, h: 13, active: true,  variant: "primary" },
  { id: "library",     label: "Our Family Library",        route: null, top: 41, left: 4,  w: 11, h: 12, active: false, variant: "library" },
  { id: "adventure",   label: "Adventure Hub",             route: null, top: 56, left: 13, w: 28, h: 9,  active: false, variant: "library" },
  { id: "tomorrow",    label: "Tomorrow's Adventure",      route: null, top: 71, left: 12, w: 16, h: 9,  active: false, variant: "soon", soonLabel: "Coming Soon" },
  { id: "stars",       label: "Story Stars",               route: null, top: 39, left: 44, w: 10, h: 6,  active: false, variant: "soon", soonLabel: "Coming Soon" },
  { id: "story-space", label: "My Story Space",            route: null, top: 69, left: 33, w: 22, h: 9,  active: false, variant: "soon", soonLabel: "Coming Soon" },
  { id: "family",      label: "Family Connection",         route: null, top: 74, left: 55, w: 16, h: 9,  active: false, variant: "soon", soonLabel: "Coming Soon" },
  { id: "evening",     label: "Evening Room",              route: null, top: 47, left: 66, w: 17, h: 11, active: false, variant: "library" },
  { id: "never-alone", label: "You are never alone",       route: null, top: 54, left: 89, w: 9,  h: 8,  active: false, variant: "library" },
  { id: "keepsakes",   label: "Memory Trail",              route: null, top: 70, left: 76, w: 17, h: 10, active: false, variant: "soon", soonLabel: "Coming Soon" },
];
/* §POLARSTAR NAV-REPAIR iter 86k 2026-02-29 — A3 fix.
 *
 * NIGHT_DAYS removed entirely: previously 7 invisible buttons over
 * the painted "Day 1 … Day 7" lanterns ALL navigated to the same
 * /exploration overview, creating the false promise of 7 distinct
 * daily journeys. The painted lanterns remain in the image as
 * decoration only; the single Exploration zone (#27 in NIGHT_ZONES)
 * carries the actual navigation.
 * If/when 7 distinct day-content pages are authored, restore the
 * NIGHT_DAYS array with per-day routes (not 7 dumps to the same
 * overview). */

export default function Polarstar() {
  const navigate = useNavigate();
  const [waitlistOpen, setWaitlistOpen] = useState(false);
  const [waitlistContext, setWaitlistContext] = useState(null);

  /* Global event bridge: any descendant (DayWorld panels, night
   * zones, footer link, etc.) can open the modal by dispatching
   * `polarstar:openWaitlist`. Keeps the modal a singleton. */
  useEffect(() => {
    const handler = (e) => {
      const detail = e.detail || {};
      setWaitlistContext({
        zone: detail.zone || detail.interest || "explorer_list",
        label: detail.label || detail.interest || "Explorer List",
      });
      setWaitlistOpen(true);
    };
    window.addEventListener("polarstar:openWaitlist", handler);
    return () => window.removeEventListener("polarstar:openWaitlist", handler);
  }, []);

  const openWaitlist = useCallback((ctx) => {
    setWaitlistContext(ctx || null);
    setWaitlistOpen(true);
  }, []);

  return (
    <PolarstarAtmosphere testid="polarstar-root">
      {(mode) => {
        const isDay = mode === "day" || mode === "morning";
        return (
          <>
            {isDay ? (
              <PolarstarDayWorld navigate={navigate} />
            ) : (
              <NightClickMap
                navigate={navigate}
                openWaitlist={openWaitlist}
                mode={mode}
              />
            )}

            {waitlistOpen && (
              <PolarstarWaitlistModal
                isOpen={waitlistOpen}
                onClose={() => setWaitlistOpen(false)}
                context={waitlistContext}
                mode={mode}
              />
            )}
          </>
        );
      }}
    </PolarstarAtmosphere>
  );
}

/* ─── Night Click-Map (preserved from v8/v9) ─────────────────── */
function NightClickMap({ navigate, openWaitlist, mode }) {
  return (
    <>
      <header className="ps9-header ps9-header--dark" data-testid="polarstar-header">
        <div className="ps9-badge" data-testid="polarstar-preview-badge">
          <span className="ps9-badge-dot" aria-hidden="true" />
          <span>PREVIEW WORLD · The First Lanterns Are Lit</span>
        </div>
        <h1 className="ps9-title" data-testid="polarstar-title" style={{ fontFamily: SERIF }}>
          POLARSTAR <span className="ps9-title-em">KIDS</span>
        </h1>
        <p className="ps9-subtitle" data-testid="polarstar-subtitle" style={{ fontFamily: SERIF }}>
          Polarstar protects wonder. <span className="ps9-italic">Adventures that matter — lived together</span>. Screen-down, ears-open.
        </p>
        <p
          data-testid="polarstar-audio-companion-banner"
          style={{
            fontFamily: SERIF,
            fontStyle: "italic",
            fontSize: "0.95rem",
            color: "rgba(255, 243, 217, 0.78)",
            marginTop: "1.25rem",
            maxWidth: 540,
            marginLeft: "auto",
            marginRight: "auto",
            lineHeight: 1.55,
            textAlign: "center",
          }}
        >
          Free audio companion:{" "}
          <a
            href="/listen/little-star"
            style={{ color: "#f5c97a", textDecoration: "underline", textUnderlineOffset: "3px" }}
            data-testid="polarstar-audio-companion-link"
          >
            Little Star
          </a>{" "}
          is live now. More stories follow as I record them with care.
        </p>
      </header>

      <div className="pw8-stage" data-testid="pw8-stage">
        {NIGHT_ZONES.map(({ id, label, route, top, left, w, h, active, variant, soonLabel }) => (
          <button
            key={id}
            type="button"
            className={`pw8-zone pw8-zone--${variant} ${active ? "pw8-zone--active" : "pw8-zone--preview"}`}
            data-testid={`pw8-zone-${id}`}
            aria-label={label}
            onClick={() => (active && route ? navigate(route) : openWaitlist({ zone: id, label }))}
            style={{ top: `${top}%`, left: `${left}%`, width: `${w}%`, height: `${h}%` }}
          >
            <span className="pw8-zone-label" style={{ fontFamily: SERIF }}>{label}</span>
            {soonLabel && <span className="pw8-soon-tag">{soonLabel}</span>}
          </button>
        ))}
        {/* §POLARSTAR NAV-REPAIR iter 86k — 7 night day-pillars removed.
         * Painted lanterns in the night image now decorative-only. */}
      </div>

      <button
        type="button"
        className="ps9-cta ps9-cta--dark"
        data-testid="polarstar-explorer-list-cta"
        onClick={() => openWaitlist({ zone: "global_cta", label: "Explorer List" })}
        style={{ fontFamily: SERIF }}
      >
        <Sparkles size={16} aria-hidden="true" />
        <span>Join the Explorer List</span>
      </button>

      {/* §POLARSTAR v10 iter 85g — Day-mode toggle from inside night
       * surface. Sits top-right so it never competes with the
       * Explorer List CTA at bottom-right. */}
      <button
        type="button"
        data-testid="polarstar-night-mode-day"
        onClick={() => window.dispatchEvent(new CustomEvent("polarstar:setMode", { detail: { mode: "day" } }))}
        aria-label="Switch to day mode"
        style={{
          position: "fixed",
          top: 28,
          right: 28,
          zIndex: 9,
          display: "inline-flex",
          alignItems: "center",
          gap: 7,
          padding: "8px 16px 8px 12px",
          borderRadius: 999,
          border: "1px solid rgba(212, 182, 125, 0.55)",
          background: "rgba(14, 23, 48, 0.72)",
          color: "#f6edda",
          fontFamily: SERIF,
          fontSize: 12,
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          cursor: "pointer",
          backdropFilter: "blur(14px)",
          WebkitBackdropFilter: "blur(14px)",
        }}
      >
        <span aria-hidden="true" style={{ color: "#d4b67d" }}>☀</span>
        <span>Day</span>
      </button>
    </>
  );
}
