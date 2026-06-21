/**
 * WiderCircleHub.jsx — § THE CIRCLE WE CREATE (painted hub) 2026-06-20
 *
 * Secondary hub of the Sara universe. Reached from the Sara Forest
 * hub via the sea-ripple entrance. Holds 4 painted "wider worlds"
 * arranged as parchment cards. Each card click leads (placeholder)
 * to its own painted world (Etapp 3).
 *
 * §CIRCLE-HUB-LOCK 2026-06-20 — Founder-approved painted asset
 * `tzl013rr_image.png`. Cards + title + subtitle + "Back to
 * Sara's World" wooden sign all baked into the painting.
 * Append ?debug=1 to visualise click-zones.
 */
import { Link, useSearchParams } from "react-router-dom";

const HUB_IMAGE =
  "https://customer-assets.emergentagent.com/job_aurin-hub/artifacts/tzl013rr_image.png";

const ZONES = [
  { id: "back-to-forest", label: "Back to Sara's World", route: "/parents-room",
    top: 4, left: 3, w: 14, h: 14 },
  { id: "world-what-cannot-be-replaced", label: "What Cannot Be Replaced",
    route: "/parents-room/wider-circle/what-cannot-be-replaced",
    top: 39, left: 11, w: 18, h: 56 },
  { id: "world-one-heart-holds-the-house", label: "When One Heart Holds the House",
    route: "/parents-room/wider-circle/when-one-heart-holds-the-house",
    top: 39, left: 30, w: 18, h: 56 },
  { id: "world-every-child-is-our-child", label: "Every Child Is Our Child",
    route: "/parents-room/wider-circle/every-child-is-our-child",
    top: 39, left: 49, w: 18, h: 56 },
  { id: "world-voices-around-the-child", label: "The Voices Around the Child",
    route: "/parents-room/wider-circle/voices-around-the-child",
    top: 39, left: 68, w: 18, h: 56 },
];

export default function WiderCircleHub() {
  const [params] = useSearchParams();
  const debug = params.get("debug") === "1";

  return (
    <div
      data-testid="wider-circle-hub"
      className="relative w-full"
      style={{ backgroundColor: "#0a0d15", minHeight: "100vh" }}
    >
      <div
        className="relative w-full mx-auto"
        style={{ aspectRatio: "1 / 1", maxWidth: "1400px" }}
      >
        <img
          src={HUB_IMAGE}
          alt="The Circle We Create — Every choice reaches further than we think. A painted hub showing 4 wider worlds: What Cannot Be Replaced, When One Heart Holds the House, Every Child Is Our Child, and The Voices Around the Child."
          className="absolute inset-0 w-full h-full object-cover select-none"
          draggable={false}
          loading="eager"
          data-testid="wider-circle-hub-image"
        />
        {ZONES.map((z) => (
          <Link
            key={z.id}
            to={z.route}
            data-testid={`wider-circle-zone-${z.id}`}
            aria-label={z.label}
            title={z.label}
            className="absolute block"
            style={{
              top: `${z.top}%`,
              left: `${z.left}%`,
              width: `${z.w}%`,
              height: `${z.h}%`,
              cursor: "pointer",
              background: debug ? "rgba(255, 200, 80, 0.25)" : "transparent",
              border: debug ? "1px dashed rgba(255, 200, 80, 0.9)" : "none",
              borderRadius: "12px",
              transition: "background 200ms ease-out",
            }}
            onMouseEnter={(e) => {
              if (!debug) e.currentTarget.style.background = "rgba(232, 217, 184, 0.08)";
            }}
            onMouseLeave={(e) => {
              if (!debug) e.currentTarget.style.background = "transparent";
            }}
          >
            {debug && (
              <span
                className="absolute top-0 left-0 px-1 text-[10px] font-mono"
                style={{
                  background: "rgba(255,200,80,0.95)",
                  color: "#1a1305",
                  pointerEvents: "none",
                  whiteSpace: "nowrap",
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
