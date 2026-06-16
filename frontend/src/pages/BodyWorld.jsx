/**
 * BodyWorld.jsx — § BODY WORLD V1 · HUB 2026-02-13 (LOCKED)
 *
 * Painted Map Pattern hub page (background image + invisible
 * hotspots — a generic technical principle). The painted founder
 * mockup (traveller with backpack at the lake, 14 stones, sidebar,
 * chat/voice cards, right column) IS the literal UI. Invisible
 * click-zones layer over every painted UI element.
 *
 * STRUCTURE LOCK
 *   - Traveller by the lake = the visitor.  Kaelen = guide (sidebar,
 *     chat, voice — never the man by the lake).
 *   - 14 stones total. Stones 1-13 use stone iconography. Stone 14
 *     (Living or Surviving) uses bubbles — visual language shifts.
 *   - URL: /body-world (canonical). /body-room redirects here.
 *   - Append ?debug=1 to visualise hotspots (founder calibration).
 */
import { Link, useSearchParams } from "react-router-dom";
import { BODY_WORLD_STONES } from "@/data/bodyWorldStones";

const HUB_IMAGE =
  "https://customer-assets.emergentagent.com/job_aurin-hub/artifacts/9ndllntz_ChatGPT%20Image%2011.%20juni%202026%2C%2021_05_25.png";

const SIDEBAR_ZONES = [
  { id: "sidebar-home",         label: "Home",                 route: "/body-world",                top: 18.0, left: 1, w: 13, h: 4 },
  { id: "sidebar-map",          label: "Map of Body World",    route: "/body-world",                top: 22.5, left: 1, w: 13, h: 4 },
  { id: "sidebar-chat-kaelen",  label: "Chat with Kaelen",     route: "/body-world/v1#kaelan",      top: 27.0, left: 1, w: 13, h: 4 },
  { id: "sidebar-talk-kaelen",  label: "Talk to Kaelen",       route: "/body-world/v1#kaelan",      top: 31.5, left: 1, w: 13, h: 4 },
  { id: "sidebar-journey",      label: "My Journey",           route: "/body-world/journey",        top: 36.0, left: 1, w: 13, h: 4 },
  { id: "sidebar-tools",        label: "Tools & Practices",    route: "/body-world/tools",          top: 40.5, left: 1, w: 13, h: 4 },
  { id: "sidebar-insights",     label: "Insights",             route: "/body-world/insights",       top: 45.0, left: 1, w: 13, h: 4 },
  { id: "sidebar-favourites",   label: "Favourites",           route: "/body-world/favourites",     top: 49.5, left: 1, w: 13, h: 4 },
  { id: "sidebar-journals",     label: "Journals",             route: "/body-world/journals",       top: 54.0, left: 1, w: 13, h: 4 },
  { id: "sidebar-assessments",  label: "Assessments",          route: "/body-world/v1#body-room-questionnaire", top: 58.5, left: 1, w: 13, h: 4 },
  { id: "sidebar-settings",     label: "Settings",             route: "/portal",                    top: 63.0, left: 1, w: 13, h: 4 },
  { id: "sidebar-help",         label: "Help Center",          route: "/faq",                       top: 67.5, left: 1, w: 13, h: 4 },
];

const CHAT_CARD_ZONES = [
  { id: "card-chat-kaelen", label: "Chat with Kaelen", route: "/body-world/v1#kaelan", top: 24, left: 18, w: 27, h: 13 },
  { id: "card-talk-kaelen", label: "Talk to Kaelen",   route: "/body-world/v1#kaelan", top: 24, left: 46, w: 27, h: 13 },
];

/* §STONE-ZONES — 14 hotspots calibrated to painted stone positions on
 * current hub image (1536x1024). Coordinates measured via AI vision
 * pass + visual verification. Each n:N covers the painted "N" stone.
 * Refine via ?debug=1. Stone slugs map 1:1 to BODY_WORLD_STONES. */
const STONE_ZONES = [
  { n: 1,  top: 55, left: 17, w: 12, h: 16 },
  { n: 2,  top: 55, left: 28, w: 12, h: 16 },
  { n: 3,  top: 56, left: 43, w: 12, h: 16 },
  { n: 4,  top: 55, left: 58, w: 12, h: 16 },
  { n: 5,  top: 55, left: 74, w: 12, h: 16 },
  { n: 6,  top: 66, left: 83, w: 12, h: 16 },
  { n: 7,  top: 78, left: 74, w: 12, h: 16 },
  { n: 8,  top: 78, left: 58, w: 12, h: 16 },
  { n: 9,  top: 78, left: 43, w: 12, h: 16 },
  { n: 10, top: 78, left: 28, w: 12, h: 16 },
  { n: 11, top: 78, left: 17, w: 12, h: 16 },
  { n: 12, top: 67, left: 17, w: 12, h: 16 },
  { n: 13, top: 91, left: 28, w: 12, h: 8  },
  { n: 14, top: 91, left: 58, w: 12, h: 8  },
];

const RIGHT_COLUMN_ZONES = [
  { id: "start-have-problem", label: "I have a problem",     route: "/body-world/world/emotional-body",    top: 18, left: 85, w: 14, h: 5 },
  { id: "start-understand",   label: "I want to understand", route: "/body-world/world/know-your-body",    top: 24, left: 85, w: 14, h: 5 },
  { id: "start-improve",      label: "I want to improve",    route: "/body-world/world/body-engineering",  top: 30, left: 85, w: 14, h: 5 },
  { id: "start-dont-know",    label: "I don't know",         route: "/body-world/v1#kaelan",               top: 36, left: 85, w: 14, h: 5 },
  { id: "body-check-in",      label: "Body Check-In",        route: "/body-world/v1#body-room-questionnaire", top: 46, left: 85, w: 14, h: 12 },
  { id: "your-journey",       label: "Your Journey",         route: "/body-world/journey",                 top: 63, left: 85, w: 14, h: 18 },
];

export default function BodyWorld() {
  const [params] = useSearchParams();
  const debug = params.get("debug") === "1";

  const stoneZones = STONE_ZONES.map((s) => {
    const stone = BODY_WORLD_STONES[s.n - 1];
    return {
      id: `stone-${stone.slug}`,
      label: `${stone.n}. ${stone.title}`,
      route: `/body-world/world/${stone.slug}`,
      top: s.top,
      left: s.left,
      w: s.w,
      h: s.h,
    };
  });

  const allZones = [
    ...SIDEBAR_ZONES,
    ...CHAT_CARD_ZONES,
    ...stoneZones,
    ...RIGHT_COLUMN_ZONES,
  ];

  return (
    <div
      data-testid="body-world-hub"
      className="relative w-full"
      style={{ backgroundColor: "#0a0d15", minHeight: "100vh" }}
    >
      <div
        className="relative w-full"
        style={{ aspectRatio: "1536 / 1024", maxWidth: "100vw" }}
      >
        <img
          src={HUB_IMAGE}
          alt="Body World — a traveler by the lake, fourteen stones, Kaelen as guide."
          className="absolute inset-0 w-full h-full object-cover select-none"
          draggable={false}
          loading="eager"
          data-testid="body-world-hub-image"
        />
        {allZones.map((z) => (
          <Link
            key={z.id}
            to={z.route}
            data-testid={`body-world-zone-${z.id}`}
            aria-label={z.label}
            title={z.label}
            className="absolute block group"
            style={{
              top: `${z.top}%`,
              left: `${z.left}%`,
              width: `${z.w}%`,
              height: `${z.h}%`,
              cursor: "pointer",
              background: debug ? "rgba(255, 200, 80, 0.25)" : "transparent",
              border: debug ? "1px dashed rgba(255, 200, 80, 0.9)" : "none",
            }}
          >
            {/* §HUB-LOCK-LABEL 2026-02-13 — Visible LOCK-name overlay on
                every painted stone (only on the 14 LOCK stones, not on
                sidebar / chat-card / right-column zones). The underlying
                painting still carries its legacy 15-stone labels; this
                overlay makes the correct 14-stone LOCK names the
                user-facing navigation truth. */}
            {z.id.startsWith("stone-") && (
              <span
                data-testid={`body-world-zone-label-${z.id}`}
                className="absolute inset-0 flex items-center justify-center text-center px-1 pointer-events-none"
                style={{
                  fontFamily: '"Cormorant Garamond", Georgia, serif',
                  fontSize: "clamp(10px, 0.85vw, 14px)",
                  lineHeight: 1.15,
                  fontWeight: 500,
                  letterSpacing: "0.02em",
                  color: "#fdf6e6",
                  textShadow:
                    "0 1px 6px rgba(0,0,0,0.95), 0 0 14px rgba(0,0,0,0.85)",
                  background:
                    "radial-gradient(ellipse at center, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.25) 60%, transparent 100%)",
                  borderRadius: "8px",
                }}
              >
                {z.label}
              </span>
            )}
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
