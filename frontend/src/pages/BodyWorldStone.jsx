/**
 * BodyWorldStone.jsx — § BODY WORLD V1 · WORLD PAGE 2026-02-13 (CALIBRATED)
 *
 * Painted Map Pattern world detail page (one per stone).
 * (Painted Map Pattern = background image + invisible hotspots — a
 * generic technical principle.)
 *
 * BEHAVIOUR
 *   - If the stone in BODY_WORLD_STONES carries an `image` URL, the
 *     painted world mockup is rendered edge-to-edge and invisible
 *     hotspots are layered over:
 *       • the back-to-map pill (top-left)
 *       • the 13-item sidebar nav
 *       • the centre stone's sub-stones (per-world coordinates
 *         from `stone.subStoneSlots`)
 *       • the stone's painted chat/voice cards if any
 *         (per-world from `stone.chatCardSlots`)
 *       • the right-column card stack (About / Hero / All Topics
 *         / Your Journey)
 *   - If no image yet, a Field Study placeholder skeleton is shown
 *     (same skeleton as Alistair lab placeholders).
 *
 * SUB-STONE ROUTES
 *   /body-world/world/:stoneSlug/topic/:topicSlug
 *   Resolves to a Field Study topic placeholder until founder
 *   authors content (same contract as Alistair lab topics).
 */
import { Link, useParams, useSearchParams, Navigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import {
  BODY_WORLD_STONE_BY_SLUG,
  BODY_WORLD_STONES,
} from "@/data/bodyWorldStones";

const SERIF = '"Cormorant Garamond", "EB Garamond", Georgia, serif';

/* §SHARED-CHROME-ZONES — coordinates extracted from the founder's
 * mockups (Gemini vision pass, 2026-02-13). Every painted world page
 * uses the same sidebar, back-button and right-column geometry. */

const BACK_BUTTON_ZONE = {
  id: "back-to-stone-map",
  label: "Back to Stone Map",
  route: "/body-world",
  top: 3.0, left: 2.0, w: 14, h: 4.5,
};

const SIDEBAR_ZONES = [
  { id: "sidebar-home",        label: "Home",              route: "/",                                       top: 22.2, left: 4.0, w: 10, h: 3.4 },
  { id: "sidebar-map",         label: "Stone Map",         route: "/body-world",                             top: 26.4, left: 4.0, w: 10, h: 3.4 },
  { id: "sidebar-chat-kaelen", label: "Chat with Kaelen",  route: "/body-world/v1#kaelan",                   top: 30.6, left: 4.0, w: 10, h: 3.4 },
  { id: "sidebar-talk-kaelen", label: "Talk to Kaelen",    route: "/body-world/v1#kaelan",                   top: 34.8, left: 4.0, w: 10, h: 3.4 },
  { id: "sidebar-journey",     label: "My Journey",        route: "/body-world/journey",                     top: 39.0, left: 4.0, w: 10, h: 3.4 },
  { id: "sidebar-checkin",     label: "Body Check-In",     route: "/body-world/v1#body-room-questionnaire",  top: 43.2, left: 4.0, w: 10, h: 3.4 },
  { id: "sidebar-tools",       label: "Tools & Practices", route: "/body-world/tools",                       top: 47.4, left: 4.0, w: 10, h: 3.4 },
  { id: "sidebar-insights",    label: "Insights",          route: "/body-world/insights",                    top: 51.6, left: 4.0, w: 10, h: 3.4 },
  { id: "sidebar-favourites",  label: "Favourites",        route: "/body-world/favourites",                  top: 55.8, left: 4.0, w: 10, h: 3.4 },
  { id: "sidebar-journals",    label: "Journals",          route: "/body-world/journals",                    top: 60.0, left: 4.0, w: 10, h: 3.4 },
  { id: "sidebar-assessments", label: "Assessments",       route: "/body-world/v1#body-room-questionnaire",  top: 64.2, left: 4.0, w: 10, h: 3.4 },
  { id: "sidebar-settings",    label: "Settings",          route: "/portal",                                 top: 68.4, left: 4.0, w: 10, h: 3.4 },
  { id: "sidebar-help",        label: "Help Center",       route: "/faq",                                    top: 72.6, left: 4.0, w: 10, h: 3.4 },
];

const RIGHT_COLUMN_ZONES = [
  { id: "world-about",       label: "About This World", route: null,                  top: 10.0, left: 84.0, w: 14.5, h: 17 },
  { id: "world-hero-topics", label: "Hero Topics",      route: null,                  top: 33.0, left: 84.0, w: 14.5, h: 30 },
  { id: "world-all-topics",  label: "All Topics",       route: null,                  top: 64.0, left: 84.0, w: 14.5, h: 8  },
  { id: "world-journey",     label: "Your Journey",     route: "/body-world/journey", top: 73.0, left: 84.0, w: 14.5, h: 13 },
];

function PaintedWorldView({ stone, debug }) {
  const stoneAspect = stone.aspectRatio || "1536 / 1024";

  // §INVARIANT — every painted sub-stone MUST have a clickable hotspot.
  // If counts diverge, log loudly so the mismatch is caught instead of
  // silently dropping a navigation target.
  if (
    process.env.NODE_ENV !== "production" &&
    Array.isArray(stone.subStones) &&
    Array.isArray(stone.subStoneSlots) &&
    stone.subStones.length !== stone.subStoneSlots.length
  ) {
    // eslint-disable-next-line no-console
    console.error(
      `[BodyWorld] Hotspot/sub-stone count mismatch on stone "${stone.slug}": ` +
      `${stone.subStones.length} sub-stones declared, ${stone.subStoneSlots.length} slots provided. ` +
      `Add a dedicated per-stone slot config in bodyWorldStones.js so every painted sub-stone has a clickable hotspot.`
    );
  }

  const subStoneZones = (stone.subStones || []).map((sub, idx) => {
    const slot = (stone.subStoneSlots || [])[idx];
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

  const chatCardZones = (stone.chatCardSlots || []).map((c) => ({
    id: c.id,
    label: c.label,
    route: c.route,
    top: c.top,
    left: c.left,
    w: c.w,
    h: c.h,
  }));

  const allZones = [
    BACK_BUTTON_ZONE,
    ...SIDEBAR_ZONES,
    ...chatCardZones,
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
        style={{ aspectRatio: stoneAspect, maxWidth: "100vw" }}
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
            Field Study · This World Is Growing
          </p>
          <p className="mt-4 text-base sm:text-lg leading-relaxed opacity-90">
            New reflections, practices and insights will be added to
            this world over time. Kaelen is still listening for the
            questions only this stone can answer.
          </p>
          <p className="mt-4 text-sm leading-relaxed opacity-70">
            Until the next layer arrives, sit with the question above.
            Notice where it lands in your body. That noticing is
            already the work.
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
