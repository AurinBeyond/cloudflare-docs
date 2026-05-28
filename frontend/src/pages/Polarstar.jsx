/**
 * Polarstar v9 — PSP-SAFE PREVIEW WORLD.
 *
 * §POLARSTAR v9 2026-02-13 — Founder lock-in (iter 85):
 *   - The painted reference image IS the interface (preserved from v8)
 *   - Header overlay: "POLARSTAR KIDS" + "One World. Three Paths. One Family."
 *   - "PREVIEW WORLD · The First Lanterns Are Lit" badge
 *   - Tomorrow's Adventure, Story Stars, Memory Trail visibly marked
 *     "Coming Soon" — clicking them opens the Explorer List modal
 *   - "Join the Explorer List" CTA (no purchase / no checkout)
 *   - 12 click-zones audited and grouped: 3 ACTIVE age paths,
 *     9 PREVIEW zones that route to the waitlist intent
 *   - Mode-aware zones (day painting and night painting differ slightly
 *     in panel placement; coordinates are tuned per atmosphere)
 *
 * Preview-only sandbox. No billing. No production-side CTAs.
 */
import { useCallback, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles, Mail } from "lucide-react";
import PolarstarAtmosphere from "@/components/PolarstarAtmosphere";
import PolarstarWaitlistModal from "@/components/PolarstarWaitlistModal";
import "@/styles/polarstar.css";

const SERIF = '"Cormorant Garamond", "EB Garamond", Georgia, serif';

/* ─── Mode-aware click zone maps ───────────────────────────────────
   Day and Night paintings share the same 3-age-path top row and a
   central 7-day exploration path, but the side panels sit slightly
   higher in the day painting. We keep two coordinate sets and pick
   the right one based on `mode`. */

const ZONES_DAY = [
  /* ACTIVE — 3 age paths (always primary) */
  { id: "discovery",   label: "Discovery Path · 4–6 yrs",  route: "/kids-universe/polarstar/discovery",   top: 18, left: 4,  w: 40, h: 19, active: true,  variant: "primary" },
  { id: "exploration", label: "Exploration · 7–10 yrs",    route: "/kids-universe/polarstar/exploration", top: 18, left: 41, w: 33, h: 19, active: true,  variant: "primary" },
  { id: "creation",    label: "Creation Path · 11–13 yrs", route: "/kids-universe/polarstar/creation",    top: 18, left: 74, w: 24, h: 19, active: true,  variant: "primary" },

  /* PREVIEW — secondary panels (Coming Soon) */
  { id: "library",     label: "Our Family Library",   route: null, top: 45, left: 6,  w: 38, h: 14, active: false, variant: "library" },
  { id: "tomorrow",    label: "Morning Boost",        route: null, top: 67, left: 5,  w: 17, h: 10, active: false, variant: "soon", soonLabel: "Coming Soon" },
  { id: "stars",       label: "Discovery Stars",      route: null, top: 38, left: 47, w: 14, h: 6,  active: false, variant: "soon", soonLabel: "Coming Soon" },
  { id: "story-space", label: "My Space",             route: null, top: 67, left: 23, w: 25, h: 13, active: false, variant: "soon", soonLabel: "Coming Soon" },
  { id: "family",      label: "Family Connection",    route: null, top: 67, left: 48, w: 17, h: 13, active: false, variant: "soon", soonLabel: "Coming Soon" },
  { id: "evening",     label: "Daily Challenges",     route: null, top: 45, left: 65, w: 22, h: 16, active: false, variant: "library" },
  { id: "never-alone", label: "Affirmations",         route: null, top: 56, left: 89, w: 11, h: 6,  active: false, variant: "library" },
  { id: "keepsakes",   label: "Today I Feel",         route: null, top: 67, left: 67, w: 22, h: 11, active: false, variant: "soon", soonLabel: "Coming Soon" },
];

const ZONES_NIGHT = [
  /* ACTIVE — 3 age paths */
  { id: "discovery",   label: "Discovery Path · 4–6 yrs",  route: "/kids-universe/polarstar/discovery",   top: 22, left: 10, w: 24, h: 13, active: true,  variant: "primary" },
  { id: "exploration", label: "Exploration · 7–10 yrs",    route: "/kids-universe/polarstar/exploration", top: 22, left: 36, w: 30, h: 13, active: true,  variant: "primary" },
  { id: "creation",    label: "Creation Path · 11–13 yrs", route: "/kids-universe/polarstar/creation",    top: 22, left: 68, w: 22, h: 13, active: true,  variant: "primary" },

  /* PREVIEW — secondary panels (Coming Soon) */
  { id: "library",     label: "Our Family Library",   route: null, top: 41, left: 4,   w: 11, h: 12, active: false, variant: "library" },
  { id: "adventure",   label: "Adventure Hub",        route: null, top: 56, left: 13,  w: 28, h: 9,  active: false, variant: "library" },
  { id: "tomorrow",    label: "Tomorrow's Adventure", route: null, top: 71, left: 12,  w: 16, h: 9,  active: false, variant: "soon", soonLabel: "Coming Soon" },
  { id: "stars",       label: "Story Stars",          route: null, top: 39, left: 44,  w: 10, h: 6,  active: false, variant: "soon", soonLabel: "Coming Soon" },
  { id: "story-space", label: "My Story Space",       route: null, top: 69, left: 33,  w: 22, h: 9,  active: false, variant: "soon", soonLabel: "Coming Soon" },
  { id: "family",      label: "Family Connection",    route: null, top: 74, left: 55,  w: 16, h: 9,  active: false, variant: "soon", soonLabel: "Coming Soon" },
  { id: "evening",     label: "Evening Room",         route: null, top: 47, left: 66,  w: 17, h: 11, active: false, variant: "library" },
  { id: "never-alone", label: "You are never alone",  route: null, top: 54, left: 89,  w: 9,  h: 8,  active: false, variant: "library" },
  { id: "keepsakes",   label: "Memory Trail",         route: null, top: 70, left: 76,  w: 17, h: 10, active: false, variant: "soon", soonLabel: "Coming Soon" },
];

/* Day painting has 7-day tiles at top 25%, left ~41–89%. */
const EXPLORATION_DAYS_DAY = [
  { id: "d1", left: 41.5 },
  { id: "d2", left: 49.5 },
  { id: "d3", left: 57.5 },
  { id: "d4", left: 65.5 },
  { id: "d5", left: 73.5 },
  { id: "d6", left: 81.5 },
  { id: "d7", left: 89.5 },
];
const EXPLORATION_DAYS_NIGHT = [
  { id: "d1", left: 38.5 },
  { id: "d2", left: 42.5 },
  { id: "d3", left: 46.5 },
  { id: "d4", left: 50.5 },
  { id: "d5", left: 54.5 },
  { id: "d6", left: 58.5 },
  { id: "d7", left: 62.5 },
];

export default function Polarstar() {
  const navigate = useNavigate();
  const [waitlistOpen, setWaitlistOpen] = useState(false);
  const [waitlistContext, setWaitlistContext] = useState(null);

  const openWaitlist = useCallback((context) => {
    setWaitlistContext(context || null);
    setWaitlistOpen(true);
  }, []);

  return (
    <PolarstarAtmosphere testid="polarstar-root">
      {(mode) => {
        const isDay = mode === "day" || mode === "morning";
        const zones = isDay ? ZONES_DAY : ZONES_NIGHT;
        const days = isDay ? EXPLORATION_DAYS_DAY : EXPLORATION_DAYS_NIGHT;
        const dayTop = isDay ? "25%" : "28%";
        const dayHeight = isDay ? "11%" : "5%";

        return (
          <PolarstarStage
            mode={mode}
            isDay={isDay}
            zones={zones}
            days={days}
            dayTop={dayTop}
            dayHeight={dayHeight}
            navigate={navigate}
            openWaitlist={openWaitlist}
            onWaitlistClose={() => setWaitlistOpen(false)}
            waitlistOpen={waitlistOpen}
            waitlistContext={waitlistContext}
          />
        );
      }}
    </PolarstarAtmosphere>
  );
}

function PolarstarStage({
  mode, isDay, zones, days, dayTop, dayHeight,
  navigate, openWaitlist, onWaitlistClose,
  waitlistOpen, waitlistContext,
}) {
  const headerTone = useMemo(() => (isDay ? "ps9-header--light" : "ps9-header--dark"), [isDay]);

  return (
    <>
      {/* ── HEADER OVERLAY ─────────────────────────────────────── */}
      <header
        className={`ps9-header ${headerTone}`}
        data-testid="polarstar-header"
      >
        <div className="ps9-badge" data-testid="polarstar-preview-badge">
          <span className="ps9-badge-dot" aria-hidden="true" />
          <span>PREVIEW WORLD · The First Lanterns Are Lit</span>
        </div>
        <h1
          className="ps9-title"
          data-testid="polarstar-title"
          style={{ fontFamily: SERIF }}
        >
          POLARSTAR <span className="ps9-title-em">KIDS</span>
        </h1>
        <p
          className="ps9-subtitle"
          data-testid="polarstar-subtitle"
          style={{ fontFamily: SERIF }}
        >
          One World. <span className="ps9-italic">Three Paths.</span> One Family.
        </p>
      </header>

      {/* ── CLICK-MAP STAGE ────────────────────────────────────── */}
      <div className="pw8-stage" data-testid="pw8-stage">
        {zones.map((zone) => {
          const { id, label, route, top, left, w, h, active, variant, soonLabel } = zone;
          const handleClick = () => {
            if (active && route) {
              navigate(route);
            } else {
              openWaitlist({ zone: id, label });
            }
          };
          return (
            <button
              key={id}
              type="button"
              className={`pw8-zone pw8-zone--${variant} ${active ? "pw8-zone--active" : "pw8-zone--preview"}`}
              data-testid={`pw8-zone-${id}`}
              aria-label={label}
              onClick={handleClick}
              style={{
                top: `${top}%`,
                left: `${left}%`,
                width: `${w}%`,
                height: `${h}%`,
              }}
            >
              <span className="pw8-zone-label" style={{ fontFamily: SERIF }}>
                {label}
              </span>
              {soonLabel && (
                <span className="pw8-soon-tag" data-testid={`pw8-soon-${id}`}>
                  {soonLabel}
                </span>
              )}
            </button>
          );
        })}

        {/* Exploration day chips */}
        {days.map(({ id, left }) => (
          <button
            key={id}
            type="button"
            className="pw8-day"
            data-testid={`pw8-day-${id}`}
            aria-label={`Exploration ${id}`}
            onClick={() => navigate("/kids-universe/polarstar/exploration")}
            style={{ top: dayTop, left: `${left}%`, height: dayHeight }}
          />
        ))}
      </div>

      {/* ── FLOATING "JOIN THE EXPLORER LIST" CTA ──────────────── */}
      <button
        type="button"
        className={`ps9-cta ${isDay ? "ps9-cta--light" : "ps9-cta--dark"}`}
        data-testid="polarstar-explorer-list-cta"
        onClick={() => openWaitlist({ zone: "global_cta", label: "Explorer List" })}
        style={{ fontFamily: SERIF }}
      >
        <Sparkles size={16} aria-hidden="true" />
        <span>Join the Explorer List</span>
      </button>

      {/* ── WAITLIST MODAL ─────────────────────────────────────── */}
      {waitlistOpen && (
        <PolarstarWaitlistModal
          isOpen={waitlistOpen}
          onClose={onWaitlistClose}
          context={waitlistContext}
          mode={mode}
        />
      )}

      {/* ── SMALL FOOTER (preview-mode notice) ─────────────────── */}
      <footer
        className={`ps9-footer ${isDay ? "ps9-footer--light" : "ps9-footer--dark"}`}
        data-testid="polarstar-footer"
      >
        <p style={{ fontFamily: SERIF }}>
          <Mail size={13} aria-hidden="true" style={{ verticalAlign: "middle", marginRight: 6 }} />
          A quiet preview of Polarstar Kids.
          {" "}
          <button
            type="button"
            className="ps9-footer-link"
            onClick={() => openWaitlist({ zone: "footer_link", label: "Explorer List" })}
            data-testid="polarstar-footer-link"
          >
            Be told when it opens.
          </button>
        </p>
      </footer>
    </>
  );
}
