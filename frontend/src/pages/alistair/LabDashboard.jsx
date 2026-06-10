/**
 * LabDashboard.jsx — § ALISTAIR LAB DASHBOARD v2 2026-02-08
 *
 * Polarstar-pattern implementation. The supplied painted mockup is THE
 * design — it contains the sidebar, the panels, the cards, the Alistair
 * portrait, the Quick Actions bar, all painted in. This component does
 * NOT recreate any of that in code. It only:
 *
 *   1. Renders the supplied image edge-to-edge.
 *   2. Layers invisible click-zones over the painted navigation areas.
 *
 * Coordinates are percentage-based so the page scales with viewport.
 * Founder can refine the coordinates by editing the ZONES array below.
 */
import { Link } from "react-router-dom";

const HERO_IMAGE = "/assets/alistair/labs/self-sabotage.png";

/* Click-zones positioned over the painted UI in the mockup.
 * Format: { id, label, route, top, left, w, h } — all percentages.
 *
 * Founder: adjust these numbers to align with the painted buttons.
 * They are approximations on first pass. */
const ZONES = [
  /* Top-right: "BACK TO LABORATORIES" pill button */
  { id: "back-to-labs", label: "Back to Laboratories", route: "/course-room/laboratories",
    top: 3, left: 80, w: 15, h: 4 },

  /* Left sidebar — 6 painted nav items, top-to-bottom */
  { id: "sidebar-home",          label: "Home",          route: "/course-room",
    top: 21, left: 1, w: 14, h: 5 },
  { id: "sidebar-conversations", label: "Conversations", route: "/course-room/room",
    top: 27, left: 1, w: 14, h: 5 },
  { id: "sidebar-laboratories",  label: "Laboratories",  route: "/course-room/laboratories",
    top: 33, left: 1, w: 14, h: 5 },
  { id: "sidebar-journal",       label: "Journal",       route: "/course-room/notes",
    top: 39, left: 1, w: 14, h: 5 },
  { id: "sidebar-insights",      label: "Insights",      route: "/course-room/experiments",
    top: 45, left: 1, w: 14, h: 5 },
  { id: "sidebar-library",       label: "Library",       route: "/course-room/library",
    top: 51, left: 1, w: 14, h: 5 },
];

export default function LabDashboard() {
  return (
    <div
      data-testid="lab-dashboard-self-sabotage"
      className="relative w-full"
      style={{
        backgroundColor: "#0a0d15",
        minHeight: "100vh",
      }}
    >
      <div
        className="relative w-full"
        style={{
          aspectRatio: "1536 / 1024",
          maxWidth: "100vw",
        }}
      >
        <img
          src={HERO_IMAGE}
          alt="Self-Sabotage · A Laboratory of Awareness"
          className="absolute inset-0 w-full h-full object-cover select-none"
          draggable={false}
          loading="eager"
          data-testid="lab-dashboard-image"
        />
        {ZONES.map((z) => (
          <Link
            key={z.id}
            to={z.route}
            data-testid={`lab-zone-${z.id}`}
            aria-label={z.label}
            title={z.label}
            className="absolute block"
            style={{
              top: `${z.top}%`,
              left: `${z.left}%`,
              width: `${z.w}%`,
              height: `${z.h}%`,
              cursor: "pointer",
              /* Invisible by default. Founder can flip this to a faint
                 outline during coordinate-tuning by uncommenting. */
              // outline: "1px dashed rgba(212,182,125,0.6)",
            }}
          />
        ))}
      </div>
    </div>
  );
}
