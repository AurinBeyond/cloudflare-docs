/**
 * BodyWorldStone.jsx — § BODY WORLD V1 · WORLD PAGE 2026-02-13 (LOCKED)
 *
 * Polarstar-pattern world detail page (one per stone).
 *
 * BEHAVIOUR
 *   - If the stone in BODY_WORLD_STONES carries an `image` URL, the
 *     painted world mockup is rendered edge-to-edge and invisible
 *     hotspots are layered over the centre stone, the 6 surrounding
 *     sub-stones, the back-to-map button, the sidebar nav, the right-
 *     column cards, and (when present) the three "Chat with Kaelen /
 *     Talk to Kaelen / Body Check-In" cards.
 *   - If no image yet, the Field Study placeholder skeleton is shown
 *     (same skeleton as Alistair lab placeholders).
 *
 * SUB-STONE ROUTES
 *   /body-world/world/:stoneSlug/topic/:topicSlug
 *   For now this resolves to a Field Study topic placeholder. When
 *   founder authors content, swap in an authored renderer (same
 *   pattern as MONEY_TREE_CONTENT in the Alistair lab system).
 */
import { Link, useParams, useSearchParams, Navigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import {
  BODY_WORLD_STONE_BY_SLUG,
  BODY_WORLD_STONES,
} from "@/data/bodyWorldStones";

const SERIF = '"Cormorant Garamond", "EB Garamond", Georgia, serif';

/* §WORLD-PAGE-SIDEBAR-ZONES — left dark sidebar shared by every world
 * page (painted into each mockup). Co-ordinates are visual best-fit. */
const SIDEBAR_ZONES = [
  { id: "sidebar-home",        label: "Home",              route: "/",                          top: 18.0, left: 1, w: 12, h: 3 },
  { id: "sidebar-map",         label: "Stone Map",         route: "/body-world",                top: 22.5, left: 1, w: 12, h: 3 },
  { id: "sidebar-chat-kaelen", label: "Chat with Kaelen",  route: "/body-world/v1#kaelan",      top: 27.0, left: 1, w: 12, h: 3 },
  { id: "sidebar-talk-kaelen", label: "Talk to Kaelen",    route: "/body-world/v1#kaelan",      top: 31.5, left: 1, w: 12, h: 3 },
  { id: "sidebar-journey",     label: "My Journey",        route: "/body-world/journey",        top: 36.0, left: 1, w: 12, h: 3 },
  { id: "sidebar-checkin",     label: "Body Check-In",     route: "/body-world/v1#body-room-questionnaire", top: 40.5, left: 1, w: 12, h: 3 },
  { id: "sidebar-tools",       label: "Tools & Practices", route: "/body-world/tools",          top: 45.0, left: 1, w: 12, h: 3 },
  { id: "sidebar-insights",    label: "Insights",          route: "/body-world/insights",       top: 49.5, left: 1, w: 12, h: 3 },
  { id: "sidebar-favourites",  label: "Favourites",        route: "/body-world/favourites",     top: 54.0, left: 1, w: 12, h: 3 },
  { id: "sidebar-journals",    label: "Journals",          route: "/body-world/journals",       top: 58.5, left: 1, w: 12, h: 3 },
  { id: "sidebar-assessments", label: "Assessments",       route: "/body-world/v1#body-room-questionnaire", top: 63.0, left: 1, w: 12, h: 3 },
  { id: "sidebar-settings",    label: "Settings",          route: "/portal",                    top: 67.5, left: 1, w: 12, h: 3 },
  { id: "sidebar-help",        label: "Help Center",       route: "/faq",                       top: 72.0, left: 1, w: 12, h: 3 },
];

/* §SUB-STONE-ZONES — hexagon arrangement around the centre stone.
 * 6 surrounding stones at clock positions 12 / 2 / 4 / 6 / 8 / 10.
 * Centre stone (slot 0) is the world itself (no nav). */
const SUB_STONE_SLOTS = [
  { slot: 1, top: 41, left: 47, w: 14, h: 14 }, // 12 o'clock (top)
  { slot: 2, top: 50, left: 64, w: 14, h: 14 }, // 2 o'clock
  { slot: 3, top: 71, left: 64, w: 14, h: 14 }, // 4 o'clock
  { slot: 4, top: 82, left: 47, w: 14, h: 14 }, // 6 o'clock (bottom)
  { slot: 5, top: 71, left: 30, w: 14, h: 14 }, // 8 o'clock
  { slot: 6, top: 50, left: 30, w: 14, h: 14 }, // 10 o'clock
];

/* §STONE-1-CHAT-CARDS — Stone 1 (Know Your Body) has three additional
 * cards painted above the sub-stones: Chat / Talk / Body Check-In. */
const STONE1_CHAT_CARDS = [
  { id: "world-chat-kaelen", label: "Chat with Kaelen", route: "/body-world/v1#kaelan",                  top: 31, left: 16, w: 16, h: 8 },
  { id: "world-talk-kaelen", label: "Talk to Kaelen",   route: "/body-world/v1#kaelan",                  top: 31, left: 33, w: 16, h: 8 },
  { id: "world-body-checkin",label: "Body Check-In",    route: "/body-world/v1#body-room-questionnaire", top: 31, left: 50, w: 16, h: 8 },
];

/* §RIGHT-COLUMN-ZONES — About This World, Hero Topics, All Topics,
 * Your Journey cards painted in the right column of each world page. */
const RIGHT_COLUMN_ZONES = [
  { id: "world-about",        label: "About This World", route: null,                  top: 11, left: 84, w: 15, h: 18 },
  { id: "world-hero-topics",  label: "Hero Topics",      route: null,                  top: 33, left: 84, w: 15, h: 24 },
  { id: "world-all-topics",   label: "All Topics",       route: null,                  top: 60, left: 84, w: 15, h: 8 },
  { id: "world-journey",      label: "Your Journey",     route: "/body-world/journey", top: 72, left: 84, w: 15, h: 12 },
];

function PaintedWorldView({ stone, debug }) {
  const subStoneZones = (stone.subStones || []).map((sub, idx) => {
    const slot = SUB_STONE_SLOTS[idx];
    if (!slot) return null;
    return {
      id: `substone-${sub.slug}`,
      label: `${sub.n}. ${sub.title}`,
      route: `/body-world/world/${stone.slug}/topic/${sub.slug}`,
      top: slot.top,
      left: slot.left,
      w: slot.w,
      h: slot.h,
    };
  }).filter(Boolean);

  // §BACK-BUTTON-ZONE — painted "← Back to Stone Map" pill, top centre.
  const backZone = {
    id: "back-to-stone-map",
    label: "Back to Stone Map",
    route: "/body-world",
    top: 3, left: 15, w: 14, h: 5,
  };

  const chatCards = stone.slug === "know-your-body" ? STONE1_CHAT_CARDS : [];

  const allZones = [
    backZone,
    ...SIDEBAR_ZONES,
    ...chatCards,
    ...subStoneZones,
    ...RIGHT_COLUMN_ZONES.filter((z) => z.route),
  ];

  return (
    <div
      data-testid={`body-world-painted-${stone.slug}`}
      className="relative w-full"
      style={{ backgroundColor: "#0a0d15", minHeight: "100vh" }}
    >
      <div
        className="relative w-full"
        style={{ aspectRatio: "1024 / 1024", maxWidth: "100vw" }}
      >
        <img
          src={stone.image}
          alt={`${stone.title} — Stone ${stone.n} of 14, Body World.`}
          className="absolute inset-0 w-full h-full object-cover select-none"
          draggable={false}
          loading="eager"
          data-testid={`body-world-painted-image-${stone.slug}`}
        />
        {allZones.map((z) => (
          <Link
            key={z.id}
            to={z.route}
            data-testid={`body-world-painted-zone-${z.id}`}
            aria-label={z.label}
            title={z.label}
            className="absolute block"
            style={{
              top: `${z.top}%`,
              left: `${z.left}%`,
              width: `${z.w}%`,
              height: `${z.h}%`,
              cursor: "pointer",
              background: debug ? "rgba(120, 220, 255, 0.25)" : "transparent",
              border: debug ? "1px dashed rgba(120, 220, 255, 0.9)" : "none",
            }}
          >
            {debug && (
              <span
                className="absolute top-0 left-0 px-1 text-[10px] font-mono"
                style={{
                  background: "rgba(120,220,255,0.95)",
                  color: "#04222b",
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

function FieldStudySkeleton({ stone }) {
  const idx = BODY_WORLD_STONES.findIndex((s) => s.slug === stone.slug);
  const prev = idx > 0 ? BODY_WORLD_STONES[idx - 1] : null;
  const next = idx < BODY_WORLD_STONES.length - 1 ? BODY_WORLD_STONES[idx + 1] : null;

  return (
    <div
      data-testid={`body-world-stone-${stone.slug}`}
      className="min-h-screen w-full"
      style={{
        backgroundColor: "#0a0d15",
        color: "#e8dfc9",
        fontFamily: SERIF,
      }}
    >
      <div className="max-w-3xl mx-auto px-6 py-16">
        <Link
          to="/body-world"
          data-testid="body-world-stone-back"
          className="inline-flex items-center gap-2 text-sm tracking-wide opacity-70 hover:opacity-100 transition-opacity"
          style={{ color: "#d4c98f" }}
        >
          <ArrowLeft size={16} /> Back to Stone Map
        </Link>

        <p
          className="mt-12 text-xs tracking-[0.3em] uppercase opacity-60"
          style={{ color: "#a89968" }}
        >
          Stone {stone.n} of 14
        </p>

        <h1
          className="mt-3 text-4xl sm:text-5xl lg:text-6xl leading-tight"
          style={{ color: "#f3e9cc" }}
          data-testid="body-world-stone-title"
        >
          {stone.title}
        </h1>

        <p
          className="mt-6 text-xl sm:text-2xl italic opacity-80"
          style={{ color: "#cdbf8a" }}
          data-testid="body-world-stone-question"
        >
          “{stone.question}”
        </p>

        <div
          className="mt-16 p-8 rounded-sm border"
          style={{
            borderColor: "rgba(212, 201, 143, 0.25)",
            background: "rgba(255,255,255,0.02)",
          }}
        >
          <p
            className="text-xs tracking-[0.3em] uppercase opacity-60"
            style={{ color: "#a89968" }}
          >
            Field Study · In Progress
          </p>
          <p className="mt-4 text-base sm:text-lg leading-relaxed opacity-90">
            This stone is being shaped. The traveler will be invited
            here when the path is ready — Kaelen is still listening
            for the questions only this world can answer.
          </p>
          <p className="mt-4 text-sm leading-relaxed opacity-70">
            Until then, sit with the question above. Notice where it
            lands in your body. That noticing is already the work.
          </p>
        </div>

        <div className="mt-12 flex flex-wrap items-center justify-between gap-4 text-sm">
          {prev ? (
            <Link
              to={`/body-world/world/${prev.slug}`}
              data-testid="body-world-stone-prev"
              className="opacity-70 hover:opacity-100 transition-opacity"
              style={{ color: "#d4c98f" }}
            >
              ← {prev.n}. {prev.title}
            </Link>
          ) : (
            <span />
          )}
          {next ? (
            <Link
              to={`/body-world/world/${next.slug}`}
              data-testid="body-world-stone-next"
              className="opacity-70 hover:opacity-100 transition-opacity"
              style={{ color: "#d4c98f" }}
            >
              {next.n}. {next.title} →
            </Link>
          ) : (
            <span />
          )}
        </div>
      </div>
    </div>
  );
}

export default function BodyWorldStone() {
  const { stoneSlug } = useParams();
  const [params] = useSearchParams();
  const debug = params.get("debug") === "1";

  const stone = BODY_WORLD_STONE_BY_SLUG[stoneSlug];
  if (!stone) {
    return <Navigate to="/body-world" replace />;
  }

  if (stone.image) {
    return <PaintedWorldView stone={stone} debug={debug} />;
  }
  return <FieldStudySkeleton stone={stone} />;
}
