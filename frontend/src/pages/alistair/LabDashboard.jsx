/**
 * LabDashboard.jsx — § ALISTAIR LAB DASHBOARD v3 2026-02-08
 *
 * Generic Polarstar-pattern dashboard for ALL 11 Alistair laboratories.
 *
 * Each laboratory's supplied painted mockup IS the design. The image
 * contains the sidebar, the panels, the cards, the Alistair portrait,
 * the Quick Actions bar — all painted in. This component:
 *
 *   1. Renders the supplied image edge-to-edge based on the URL slug.
 *   2. Layers invisible click-zones over the painted navigation areas.
 *
 * Coordinates are percentage-based so the page scales with viewport.
 * Founder can refine per-laboratory coordinates by editing the
 * LAB_ZONES table below.
 */
import { useParams, Link, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { LABS } from "@/data/alistairLabs";

/* §SIDEBAR-NAV-ZONES 2026-02-08 — All 11 painted mockups share the
 * same Alistair sidebar layout in roughly the same coordinates. This
 * shared base is reused for every laboratory; per-lab overrides can
 * be added in LAB_ZONES below if a particular mockup uses a slightly
 * different sidebar position. */
const SHARED_SIDEBAR_ZONES = [
  { id: "back-to-labs",          label: "Back to Laboratories", route: "/course-room/laboratories",
    top: 3,  left: 80, w: 15, h: 4 },
  { id: "sidebar-home",          label: "Home",          route: "/course-room",
    top: 21, left: 1,  w: 14, h: 5 },
  { id: "sidebar-conversations", label: "Conversations", route: "/course-room/room",
    top: 27, left: 1,  w: 14, h: 5 },
  { id: "sidebar-laboratories",  label: "Laboratories",  route: "/course-room/laboratories",
    top: 33, left: 1,  w: 14, h: 5 },
  { id: "sidebar-journal",       label: "Journal",       route: "/course-room/notes",
    top: 39, left: 1,  w: 14, h: 5 },
  { id: "sidebar-insights",      label: "Insights",      route: "/course-room/experiments",
    top: 45, left: 1,  w: 14, h: 5 },
  { id: "sidebar-library",       label: "Library",       route: "/course-room/library",
    top: 51, left: 1,  w: 14, h: 5 },
];

/* §LAB-ZONES 2026-02-08 — Per-laboratory hotspots. Each entry inherits
 * the shared sidebar zones above. Add per-lab content hotspots here as
 * sub-routes are authored (sub-cards, Quick Actions bar, etc.). */
const LAB_ZONES = {
  "money-tree":         { extra: [] },
  "old-stories":        { extra: [] },
  "body-knows-first":   { extra: [] },
  "compass":            { extra: [] },
  "self-sabotage":      { extra: [] },
  "the-code":           { extra: [] },
  "invisible-strings":  { extra: [] },
  "masks":              { extra: [] },
  "body-language":      { extra: [] },
  "child-parent":       { extra: [] },
  "body-language-v2":   { extra: [] },
};

export default function LabDashboard() {
  const { labSlug } = useParams();
  const navigate = useNavigate();
  const lab = LABS[labSlug];

  /* §RENDER-GUARD 2026-02-08 — Navigate must be deferred to useEffect,
   * never called during render (React warning + null page). */
  useEffect(() => {
    if (!lab) {
      navigate("/course-room/laboratories", { replace: true });
    }
  }, [lab, navigate]);

  if (!lab) return null;

  const heroImage = lab.thumbnail || `/assets/alistair/labs/${labSlug}.png`;
  const labZones = LAB_ZONES[labSlug] || { extra: [] };
  const zones = [...SHARED_SIDEBAR_ZONES, ...labZones.extra];

  return (
    <div
      data-testid={`lab-dashboard-${labSlug}`}
      className="relative w-full"
      style={{ backgroundColor: "#0a0d15", minHeight: "100vh" }}
    >
      <div
        className="relative w-full"
        style={{ aspectRatio: "1536 / 1024", maxWidth: "100vw" }}
      >
        <img
          src={heroImage}
          alt={`${lab.name} · ${lab.subtitle}`}
          className="absolute inset-0 w-full h-full object-cover select-none"
          draggable={false}
          loading="eager"
          data-testid="lab-dashboard-image"
        />
        {zones.map((z) => (
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
            }}
          />
        ))}
      </div>
    </div>
  );
}
