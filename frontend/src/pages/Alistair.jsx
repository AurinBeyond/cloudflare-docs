/**
 * Alistair.jsx — § ALISTAIR HOMEPAGE v3 (POLARSTAR PATTERN) 2026-02
 *
 * Founder directive (Anna, 2026-02): the Alistair hub MUST follow the
 * exact same technique as the 11 individual lab dashboards — the
 * painted mockup IS the design. No CSS recreation, no recoloured
 * cards, no AI-substituted visuals. We render the supplied painted
 * image edge-to-edge and overlay invisible click-zones above the
 * painted UI elements (sidebar items, the four Path of Exploration
 * cards, the right-column CTA).
 *
 * Image: /assets/alistair/labs/course-room-hub.png
 * Pattern: image (1536×1024) + percentage-based hotspots
 *
 * Calibration: append ?debug=1 to the URL to visualise every hotspot
 * outline so coordinates can be refined without code changes during
 * founder review.
 */
import { Link, useSearchParams } from "react-router-dom";
import { LABS, HOME_PATH_OF_EXPLORATION } from "@/data/alistairLabs";

/* §HUB-IMAGE 2026-02 — the painted hub mockup is the single source of
 * truth for the visual layout. The four lab cards visible in this
 * image correspond exactly to HOME_PATH_OF_EXPLORATION. The remaining
 * 7 labs are reached via the "Explore" sidebar item → /laboratories. */
const HUB_IMAGE = "/assets/alistair/labs/course-room-hub.png";

/* §HUB-ZONES 2026-02 — percentage coordinates measured against the
 * supplied 1536×1024 painted mockup. Each zone is an invisible click
 * area placed exactly over a painted UI element.
 *
 *   top/left/w/h are percentages of the image's bounding box.
 *
 * Refine these via ?debug=1 visual calibration mode if any hotspot
 * drifts from its painted target after founder review. */
const SIDEBAR_ZONES = [
  { id: "logo-home",     label: "Alistair home",        route: "/course-room",
    top: 2,  left: 1, w: 13, h: 17 },
  { id: "nav-home",      label: "Home",                 route: "/course-room",
    top: 21, left: 0, w: 14, h: 5 },
  { id: "nav-explore",   label: "Explore",              route: "/course-room/laboratories",
    top: 31, left: 0, w: 14, h: 5 },
  { id: "nav-read",      label: "Read",                 route: "/course-room/read",
    top: 37, left: 0, w: 14, h: 4.5 },
  { id: "nav-experiments", label: "Experiments",        route: "/course-room/experiments",
    top: 42, left: 0, w: 14, h: 4.5 },
  { id: "nav-notes",     label: "Notes",                route: "/course-room/notes",
    top: 48, left: 0, w: 14, h: 4.5 },
  { id: "nav-library",   label: "Library",              route: "/course-room/library",
    top: 53, left: 0, w: 14, h: 4.5 },
];

/* §HUB-LAB-CARDS 2026-02 — the four painted lab cards along the bottom
 * of the hub image, in left-to-right order. Slug order is locked to
 * HOME_PATH_OF_EXPLORATION from data/alistairLabs.js — never invent
 * new labs, never reorder, never substitute. */
const CARD_TOP = 68.5;
const CARD_HEIGHT = 27;
const CARD_WIDTH = 15.5;
const CARD_LEFTS = [14.5, 31.0, 47.5, 64.0];

const LAB_CARD_ZONES = HOME_PATH_OF_EXPLORATION.map((slug, i) => ({
  id: `lab-card-${slug}`,
  label: LABS[slug]?.name || slug,
  route: `/course-room/lab/${slug}`,
  top: CARD_TOP,
  left: CARD_LEFTS[i],
  w: CARD_WIDTH,
  h: CARD_HEIGHT,
}));

/* §HUB-RIGHT-CTA 2026-02 — the painted "Let's explore together" CTA
 * that lives at the bottom of the right-hand Alistair bio column. */
const RIGHT_CTA_ZONE = {
  id: "right-cta-explore",
  label: "Let's explore together",
  route: "/course-room/room",
  top: 90, left: 78, w: 21, h: 5,
};

const ZONES = [...SIDEBAR_ZONES, ...LAB_CARD_ZONES, RIGHT_CTA_ZONE];

export default function Alistair() {
  const [params] = useSearchParams();
  const debug = params.get("debug") === "1";

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
          alt="Alistair — Laboratory of Life. The hub of inquiry."
          className="absolute inset-0 w-full h-full object-cover select-none"
          draggable={false}
          loading="eager"
          data-testid="alistair-hub-image"
        />
        {ZONES.map((z) => (
          <Link
            key={z.id}
            to={z.route}
            data-testid={`alistair-hub-zone-${z.id}`}
            aria-label={z.label}
            title={z.label}
            className="absolute block"
            style={{
              top: `${z.top}%`,
              left: `${z.left}%`,
              width: `${z.w}%`,
              height: `${z.h}%`,
              cursor: "pointer",
              background: debug ? "rgba(255, 80, 80, 0.22)" : "transparent",
              border: debug ? "1px dashed rgba(255, 80, 80, 0.9)" : "none",
            }}
          >
            {debug && (
              <span
                className="absolute top-0 left-0 px-1 text-[10px] font-mono"
                style={{
                  background: "rgba(255,80,80,0.9)",
                  color: "#fff",
                  pointerEvents: "none",
                }}
              >
                {z.id}
              </span>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}
