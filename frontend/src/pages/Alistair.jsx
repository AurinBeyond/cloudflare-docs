/**
 * Alistair.jsx — /course-room
 *
 * § COURSE-ROOM v3 2026-02-08 — Polarstar pattern, no CSS panels.
 *
 * Same construction as LabDashboard.jsx: the founder-supplied painted
 * mockup IS the design — sidebar, panels, lab cards, Alistair bio,
 * bottom quote are all painted into the image. This component only:
 *
 *   1. Renders the painted hub image edge-to-edge.
 *   2. Layers invisible Link-hotspots over the painted nav areas.
 *
 * The supplied hub file `course-room-hub.png` is not yet uploaded to
 * the Emergent asset system. Until it arrives the page falls back to
 * the existing `alistair-light-bg.png`. When the real hub image is
 * dropped into `/app/frontend/public/assets/alistair/labs/` the page
 * picks it up with zero code changes.
 *
 * Coordinates are percentage-based. Founder calibrates by editing
 * the ZONES array below.
 */
import { Link } from "react-router-dom";

const HUB_IMAGE = "/assets/alistair/labs/course-room-hub.png";
const HUB_FALLBACK = "/assets/alistair/alistair-light-bg.png";

/* §HUB-ZONES 2026-02-08 — Approximate hotspots over the painted hub.
 * Sidebar nav on the left + 11 lab cards along the bottom of the
 * composition + Enter Portal CTA in the top-right.
 *
 * The 11 lab hotspots are stacked into two rows (4 top, 4 middle,
 * 3 bottom) so they cover the painted card grid in the founder's
 * composition. Founder: adjust top/left/w/h values to match the real
 * painted grid once `course-room-hub.png` is in place. */
const ZONES = [
  /* Sidebar nav (left column on the painted hub) */
  { id: "sidebar-home",          label: "Home",          route: "/course-room",                 top: 16, left: 1, w: 12, h: 5 },
  { id: "sidebar-explore",       label: "Explore",       route: "/course-room/laboratories",    top: 22, left: 1, w: 12, h: 5 },
  { id: "sidebar-read",          label: "Read",          route: "/course-room/read",            top: 28, left: 1, w: 12, h: 5 },
  { id: "sidebar-experiments",   label: "Experiments",   route: "/course-room/experiments",     top: 34, left: 1, w: 12, h: 5 },
  { id: "sidebar-notes",         label: "Notes",         route: "/course-room/notes",           top: 40, left: 1, w: 12, h: 5 },
  { id: "sidebar-library",       label: "Library",       route: "/course-room/library",         top: 46, left: 1, w: 12, h: 5 },

  /* The 11 laboratories — bottom card grid */
  { id: "lab-money-tree",        label: "The Money Tree Within", route: "/course-room/lab/money-tree",        top: 72, left: 15, w: 11, h: 22 },
  { id: "lab-old-stories",       label: "Old Stories",            route: "/course-room/lab/old-stories",       top: 72, left: 27, w: 11, h: 22 },
  { id: "lab-body-knows-first",  label: "The Body Knows First",   route: "/course-room/lab/body-knows-first",  top: 72, left: 39, w: 11, h: 22 },
  { id: "lab-compass",           label: "Compass of Meaning",     route: "/course-room/lab/compass",           top: 72, left: 51, w: 11, h: 22 },
  { id: "lab-self-sabotage",     label: "Self-Sabotage",          route: "/course-room/lab/self-sabotage",     top: 72, left: 63, w: 11, h: 22 },
  { id: "lab-the-code",          label: "The Code",               route: "/course-room/lab/the-code",          top: 72, left: 75, w: 11, h: 22 },
  { id: "lab-invisible-strings", label: "Invisible Strings",      route: "/course-room/lab/invisible-strings", top: 72, left: 87, w: 11, h: 22 },
  { id: "lab-masks",             label: "The Masks We Wear",      route: "/course-room/lab/masks",             top: 50, left: 75, w: 11, h: 18 },
  { id: "lab-body-language",     label: "Body Language",          route: "/course-room/lab/body-language",     top: 50, left: 87, w: 11, h: 18 },
  { id: "lab-child-parent",      label: "Child & Parent",         route: "/course-room/lab/child-parent",      top: 28, left: 87, w: 11, h: 18 },
  { id: "lab-body-language-v2",  label: "Body Language Advanced", route: "/course-room/lab/body-language-v2",  top: 50, left: 63, w: 11, h: 18 },
];

export default function Alistair() {
  return (
    <div
      data-testid="page-alistair"
      className="relative w-full"
      style={{ backgroundColor: "#0a0d15", minHeight: "100vh" }}
    >
      <div
        className="relative w-full"
        style={{ aspectRatio: "1536 / 1024", maxWidth: "100vw" }}
      >
        <img
          src={HUB_IMAGE}
          alt="Alistair · Laboratory of Life"
          className="absolute inset-0 w-full h-full object-cover select-none"
          draggable={false}
          loading="eager"
          data-testid="alistair-hub-image"
          onError={(e) => { e.currentTarget.src = HUB_FALLBACK; }}
        />
        {ZONES.map((z) => (
          <Link
            key={z.id}
            to={z.route}
            data-testid={`alistair-zone-${z.id}`}
            aria-label={z.label}
            title={z.label}
            className="absolute block"
            style={{
              top: `${z.top}%`,
              left: `${z.left}%`,
              width: `${z.w}%`,
              height: `${z.h}%`,
              cursor: "pointer",
            }}
          />
        ))}
      </div>
    </div>
  );
}
