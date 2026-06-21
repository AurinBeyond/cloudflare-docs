/**
 * WorldEveryChildIsOurChildInvitation.jsx — § WIDER CIRCLE WORLD 3 ·
 *   EMOTIONAL ANCHOR (LONG-FORM INVITATION) 2026-06-21
 *
 * Founder uploaded a portrait (2:3, 1024×1536) watercolour canvas
 * carrying the long-form invitation for "Every Child Is Our Child".
 * The painting itself includes the full body text, the subtitle,
 * the heart-line, the "This world is being painted." plaque, and
 * the wooden "The Circle We Create" sign in the top-left corner.
 *
 * Routed at /parents-room/wider-circle/every-child-is-our-child/invitation
 * and reachable from the main hub via a small painted parchment
 * click-zone. This is intentionally a one-image "deep read" page —
 * the body text lives inside the painting, not as React text.
 *
 * Single calibrated click-zone returns the wanderer to the hub.
 */
import { Link, useSearchParams } from "react-router-dom";

const ANCHOR_IMAGE =
  "https://customer-assets.emergentagent.com/job_aurin-hub/artifacts/g82x79km_image.png";

const BACK_ZONE = {
  id: "back-to-world",
  label: "Back to Every Child Is Our Child",
  route: "/parents-room/wider-circle/every-child-is-our-child",
  top: 2, left: 4, w: 22, h: 9,
};

export default function WorldEveryChildIsOurChildInvitation() {
  const [params] = useSearchParams();
  const debug = params.get("debug") === "1";

  return (
    <div
      data-testid="world-every-child-is-our-child-invitation"
      className="relative w-full"
      style={{ backgroundColor: "#0a0d15", minHeight: "100vh" }}
    >
      <div
        className="relative mx-auto"
        style={{ aspectRatio: "2 / 3", maxWidth: "768px" }}
      >
        <img
          src={ANCHOR_IMAGE}
          alt="Every Child Is Our Child — Long-form invitation. A watercolour shore with a small lighthouse, a steady cottage, a wooden dock, a moored rowboat. The painting carries the full invitation: No single person can be everything to a child. Communities were never meant to be optional. Every child thrives when they belong to more than one caring adult. When a child feels held by many, they become braver, kinder, more resilient. Parenting is not a solo expedition. We do not need perfect people. We need many safe ones. A pinned note reads: You do not have to be the whole shore. Just be one steady rock where a child can catch their breath and keep going."
          className="absolute inset-0 w-full h-full object-contain select-none"
          draggable={false}
          loading="eager"
          data-testid="world-every-child-is-our-child-invitation-image"
        />

        {/* Top-left wooden "The Circle We Create" sign — calibrated
            back-link to the world's main painted hub. */}
        <Link
          to={BACK_ZONE.route}
          data-testid={`world-every-child-is-our-child-invitation-zone-${BACK_ZONE.id}`}
          aria-label={BACK_ZONE.label}
          title={BACK_ZONE.label}
          className="absolute block"
          style={{
            top: `${BACK_ZONE.top}%`, left: `${BACK_ZONE.left}%`,
            width: `${BACK_ZONE.w}%`, height: `${BACK_ZONE.h}%`,
            cursor: "pointer",
            background: debug ? "rgba(255, 200, 80, 0.25)" : "transparent",
            border: debug ? "1px dashed rgba(255, 200, 80, 0.9)" : "none",
            borderRadius: "12px",
            transition: "background 200ms ease-out",
          }}
          onMouseEnter={(e) => { if (!debug) e.currentTarget.style.background = "rgba(232, 217, 184, 0.08)"; }}
          onMouseLeave={(e) => { if (!debug) e.currentTarget.style.background = "transparent"; }}
        >
          {debug && (
            <span className="absolute top-0 left-0 px-1 text-[10px] font-mono"
              style={{ background: "rgba(255,200,80,0.95)", color: "#1a1305", pointerEvents: "none", whiteSpace: "nowrap" }}
            >{BACK_ZONE.id}</span>
          )}
        </Link>
      </div>
    </div>
  );
}
