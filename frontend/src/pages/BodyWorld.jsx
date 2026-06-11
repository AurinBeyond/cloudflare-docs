/**
 * BodyWorld.jsx — § BODY WORLD V2 · HUB 2026-02-13
 *
 * Polarstar-pattern hub page for the Body Room (re-launched as
 * "Body World"). Per /app/memory/BODY_WORLD_V2_BRIEF.md the visitor
 * enters a landscape, not a course: a traveller by a lake, carrying
 * burdens (a backpack), facing 15 stones — each stone a question.
 *
 * The supplied painted mockup IS the design. This component:
 *   1. Renders the painted hub image edge-to-edge.
 *   2. Layers invisible click-zones over every painted UI element
 *      (sidebar nav, chat / voice cards, the 15 stones, right
 *      column entry points).
 *   3. Routes every stone to /body-room/world/:slug (placeholder
 *      until founder authors per-stone content — same skeleton
 *      pattern as Alistair labs).
 *
 * Coordinates are percentage-based so the layout scales with the
 * viewport. Append ?debug=1 to the URL to visualise every hotspot
 * with its id (founder calibration mode).
 *
 * IMPORTANT: legacy /body-room content (BodyRoom.jsx — silhouette,
 * Honesty Quiz, Body Architecture audio shelf, Body Temple entry,
 * BodyRoomChat, BodyLensSelector) is preserved untouched and still
 * reachable via /body-room/v1. Per-stone authored content arrives
 * later via the BodyWorldStone.jsx renderer.
 */
import { Link, useSearchParams } from "react-router-dom";
import { BODY_WORLD_STONES } from "@/data/bodyWorldStones";

const HUB_IMAGE =
  "https://customer-assets.emergentagent.com/job_aurin-hub/artifacts/9ndllntz_ChatGPT%20Image%2011.%20juni%202026%2C%2021_05_25.png";

/* §SIDEBAR-ZONES — left dark sidebar, painted into the hub image. */
const SIDEBAR_ZONES = [
  { id: "sidebar-home",         label: "Home",                 route: "/body-room",                 top: 18, left: 1,  w: 13, h: 4 },
  { id: "sidebar-map",          label: "Map of Body World",    route: "/body-room",                 top: 22.5, left: 1,  w: 13, h: 4 },
  { id: "sidebar-chat-kaelen",  label: "Chat with Kaelen",     route: "/body-room/v1#kaelan",       top: 27, left: 1,  w: 13, h: 4 },
  { id: "sidebar-talk-kaelen",  label: "Talk to Kaelen",       route: "/body-room/v1#kaelan",       top: 31.5, left: 1,  w: 13, h: 4 },
  { id: "sidebar-journey",      label: "My Journey",           route: "/body-room/journey",         top: 36, left: 1,  w: 13, h: 4 },
  { id: "sidebar-tools",        label: "Tools & Practices",    route: "/body-room/tools",           top: 40.5, left: 1,  w: 13, h: 4 },
  { id: "sidebar-insights",     label: "Insights",             route: "/body-room/insights",        top: 45, left: 1,  w: 13, h: 4 },
  { id: "sidebar-favourites",   label: "Favourites",           route: "/body-room/favourites",      top: 49.5, left: 1,  w: 13, h: 4 },
  { id: "sidebar-journals",     label: "Journals",             route: "/body-room/journals",        top: 54, left: 1,  w: 13, h: 4 },
  { id: "sidebar-assessments",  label: "Assessments",          route: "/body-room/v1#body-room-questionnaire", top: 58.5, left: 1,  w: 13, h: 4 },
  { id: "sidebar-settings",     label: "Settings",             route: "/portal",                    top: 63, left: 1,  w: 13, h: 4 },
  { id: "sidebar-help",         label: "Help Center",          route: "/faq",                       top: 67.5, left: 1,  w: 13, h: 4 },
];

/* §CHAT-CARDS — two large painted cards in the centre-top:
 * "CHAT WITH KAELEN" (text) and "TALK TO KAELEN" (voice).
 * Both currently route to the existing /body-room/v1 surface where
 * BodyRoomChat (voice + text I/O) lives untouched. */
const CHAT_CARD_ZONES = [
  { id: "card-chat-kaelen",  label: "Chat with Kaelen",  route: "/body-room/v1#kaelan", top: 24, left: 18, w: 27, h: 13 },
  { id: "card-talk-kaelen",  label: "Talk to Kaelen",    route: "/body-room/v1#kaelan", top: 24, left: 46, w: 27, h: 13 },
];

/* §STONE-ZONES — 15 stones painted on the lake-shore map. Coordinates
 * are visual best-fit from the founder mockup; refine via ?debug=1.
 * Stones map 1:1 to BODY_WORLD_STONES in /data/bodyWorldStones.js. */
const STONE_ZONES = [
  { n: 1,  top: 51, left: 16, w: 9, h: 8 },
  { n: 2,  top: 51, left: 27, w: 9, h: 8 },
  { n: 3,  top: 51, left: 39, w: 9, h: 8 },
  { n: 4,  top: 51, left: 50, w: 9, h: 8 },
  { n: 5,  top: 51, left: 62, w: 9, h: 8 },
  { n: 6,  top: 67, left: 73, w: 9, h: 8 },
  { n: 7,  top: 67, left: 62, w: 9, h: 8 },
  { n: 8,  top: 67, left: 50, w: 9, h: 8 },
  { n: 9,  top: 67, left: 39, w: 9, h: 8 },
  { n: 10, top: 67, left: 27, w: 9, h: 8 },
  { n: 11, top: 67, left: 16, w: 9, h: 8 },
  { n: 12, top: 83, left: 16, w: 9, h: 8 },
  { n: 13, top: 83, left: 30, w: 9, h: 8 },
  { n: 14, top: 83, left: 45, w: 9, h: 8 },
  { n: 15, top: 83, left: 60, w: 9, h: 8 },
];

/* §RIGHT-COLUMN-ZONES — Start Here (4 entry questions), Body Check-In,
 * Your Journey (resume) — painted into the right dark column. */
const RIGHT_COLUMN_ZONES = [
  { id: "start-have-problem",   label: "I have a problem",     route: "/body-room/world/emotional-body",     top: 18, left: 85, w: 14, h: 5 },
  { id: "start-understand",     label: "I want to understand", route: "/body-room/world/know-your-body",     top: 24, left: 85, w: 14, h: 5 },
  { id: "start-improve",        label: "I want to improve",    route: "/body-room/world/body-engineering",   top: 30, left: 85, w: 14, h: 5 },
  { id: "start-dont-know",      label: "I don't know",         route: "/body-room/v1#kaelan",                top: 36, left: 85, w: 14, h: 5 },
  { id: "body-check-in",        label: "Body Check-In",        route: "/body-room/v1#body-room-questionnaire", top: 46, left: 85, w: 14, h: 12 },
  { id: "your-journey",         label: "Your Journey",         route: "/body-room/journey",                  top: 63, left: 85, w: 14, h: 18 },
];

export default function BodyWorld() {
  const [params] = useSearchParams();
  const debug = params.get("debug") === "1";

  const stoneZones = STONE_ZONES.map((s) => {
    const stone = BODY_WORLD_STONES[s.n - 1];
    return {
      id: `stone-${stone.slug}`,
      label: `${stone.n}. ${stone.title}`,
      route: `/body-room/world/${stone.slug}`,
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
          alt="Body World — a traveler by the lake, fifteen stones, Kaelen as guide."
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
            className="absolute block"
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
