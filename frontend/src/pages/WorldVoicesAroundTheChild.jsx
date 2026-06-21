/**
 * WorldVoicesAroundTheChild.jsx — § WIDER CIRCLE WORLD 4 ·
 *   VOICES AROUND THE CHILD 2026-06-21
 *
 * Fourth and final painted world of "The Circle We Create".
 * Founder brief (locked):
 *   "Not every voice deserves to become a compass."
 *
 * STRUCTURE LOCK
 *   - Painted asset: a desk-lit study at night, a young sailor
 *     facing a giant ocean map, a brass compass, a telescope, a
 *     mug of cocoa, lanterns and rolled charts. Floating around
 *     are 4 corked bottles with painted voice-quotes (The Wind /
 *     The Lighthouse / The Harbour / The Other Ships) and 4
 *     small voice-category parchments (PRESSURE / FEAR /
 *     BELONGING / COMPARISON). Two open notebooks at the bottom
 *     carry tools: "Good voices" and "Ask yourself". A small
 *     oval-framed compass-card sits in the bottom-left.
 *   - This world widens the Core Pattern further: from family
 *     (W1) → one carrying heart (W2) → community shore (W3) →
 *     **the whole noise of the world** (W4). The completion
 *     sentence shape pivots — instead of "I am using ___ instead
 *     of ___", each clickable nest names a kind of voice and a
 *     quiet recognition of its effect.
 *
 *         OUTER voice-categories (around the central map):
 *           · PRESSURE   — pushes hard, leaves little room to breathe
 *           · FEAR       — wants to protect, can also keep you stuck
 *           · BELONGING  — welcomes you exactly as you are, lights the way home
 *           · COMPARISON — looks outward, steals the joy of your own path
 *
 *         BOTTOM notebooks (tools, not voices):
 *           · GOOD-VOICES   — checklist of what a steady voice looks like
 *           · ASK-YOURSELF  — daily questions to recognise the inner crew
 *
 *   - Title "Voices Around the Child" and subtitle baked in.
 *   - Top opening parchment, central scroll, bottom closing question
 *     ("When the sea becomes loud, which voice remains? And is
 *     that voice helping the child find their way home?") and
 *     the "This world is being painted." plaque are all painted
 *     into the asset.
 *   - Top-left wooden sign reads "Back to The Circle We Create".
 *   - URL: /parents-room/wider-circle/voices-around-the-child
 *   - Each nest routes to that path's <slug>, landing on
 *     SaraCategoryStub until founder visuals arrive.
 *   - Append ?debug=1 to visualise hotspots (founder calibration).
 *
 * §WIDER-CIRCLE-TONE — Anti-shame, anti-cynical. This world does
 *   NOT demonise screens, advertisers, or "the world out there".
 *   It names a thousand voices and asks, simply, which ones the
 *   child is learning to trust. Forbidden directions:
 *     · media-bashing / screen-shaming
 *     · "kids these days" laments
 *     · parental-paranoia tone
 *     · spiritual-bypass ("just shield them")
 *   Permitted tones: noticing, naming, choosing again.
 *
 * §SARA-ASPECT-NOTE — Founder asset is 3:2 (1536×1024). Use
 *   object-contain.
 */
import { Link, useSearchParams } from "react-router-dom";

/* §VOICES-AROUND-THE-CHILD-LOCK 2026-06-21 — Founder-approved
 * hub asset (agtsx58u_image.png, 3.0 MB, 3:2 1536×1024). Title,
 * subtitle, all body parchments, closing question and the wooden
 * "Back to The Circle We Create" sign are baked into the painting. */
const WORLD_IMAGE =
  "https://customer-assets.emergentagent.com/job_aurin-hub/artifacts/agtsx58u_image.png";

/* §NEST-THEMES — Four voice-categories + two notebook tools. */
const NEST_THEMES = [
  { slug: "pressure",   label: "Pressure — pushes hard, leaves little room to breathe." },
  { slug: "fear",       label: "Fear — wants to protect, can also keep you stuck." },
  { slug: "belonging",  label: "Belonging — welcomes you exactly as you are, lights the way home." },
  { slug: "comparison", label: "Comparison — looks outward, steals the joy of your own path." },
  { slug: "good-voices",  label: "Good voices — what steady voices look like." },
  { slug: "ask-yourself", label: "Ask yourself — daily questions to recognise the inner crew." },
];

/* §NEST-ZONES — Hotspots over the painted parchment-cards. */
const NEST_ZONES = [
  /* Upper-mid voice-cards flanking the bottle row */
  { slug: "pressure",   top: 25, left: 17, w: 14, h: 15 },
  { slug: "fear",       top: 25, left: 69, w: 14, h: 15 },
  /* Lower-mid voice-cards near the bottles' bases */
  { slug: "belonging",  top: 50, left: 4,  w: 14, h: 18 },
  { slug: "comparison", top: 50, left: 82, w: 14, h: 18 },
  /* Bottom notebook-tools */
  { slug: "good-voices",  top: 72, left: 22, w: 18, h: 24 },
  { slug: "ask-yourself", top: 72, left: 73, w: 18, h: 24 },
];

const BACK_ZONE = {
  id: "back-to-wider-circle",
  label: "Back to The Circle We Create",
  route: "/parents-room/wider-circle",
  top: 2, left: 2, w: 10, h: 11,
};

export default function WorldVoicesAroundTheChild() {
  const [params] = useSearchParams();
  const debug = params.get("debug") === "1";

  const zones = NEST_ZONES.map((z) => {
    const theme = NEST_THEMES.find((t) => t.slug === z.slug);
    return {
      id: `nest-${theme.slug}`,
      label: theme.label,
      route: `/parents-room/wider-circle/voices-around-the-child/${theme.slug}`,
      top: z.top, left: z.left, w: z.w, h: z.h,
    };
  });

  return (
    <div
      data-testid="world-voices-around-the-child"
      className="relative w-full"
      style={{ backgroundColor: "#0a0d15", minHeight: "100vh" }}
    >
      <div
        className="relative w-full mx-auto"
        style={{ aspectRatio: "3 / 2", maxWidth: "1536px" }}
      >
        <img
          src={WORLD_IMAGE}
          alt="Voices Around the Child — Not every voice deserves to become a compass. A young sailor faces a giant ocean map at a desk lit by lanterns; four corked bottles drift around the scene with voice-quotes from the Wind, the Lighthouse, the Harbour and the Other Ships. Four small parchments name the voice-categories: Pressure, Fear, Belonging, Comparison. Two open notebooks hold a Good-voices checklist and an Ask-yourself prompt. A scroll reads: Children need steady voices. Voices that don't disappear when mistakes happen. Voices that don't demand perfection. Voices that tell the truth without taking away hope. The closing line asks: When the sea becomes loud, which voice remains? And is that voice helping the child find their way home?"
          className="absolute inset-0 w-full h-full object-contain select-none"
          draggable={false}
          loading="eager"
          data-testid="world-voices-around-the-child-image"
        />

        {/* Back to The Circle We Create — wooden sign top-left. */}
        <Link
          to={BACK_ZONE.route}
          data-testid={`world-voices-around-the-child-zone-${BACK_ZONE.id}`}
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

        {/* Six painted hotspots. */}
        {zones.map((z) => (
          <Link
            key={z.id}
            to={z.route}
            data-testid={`world-voices-around-the-child-zone-${z.id}`}
            aria-label={z.label}
            title={z.label}
            className="absolute block"
            style={{
              top: `${z.top}%`, left: `${z.left}%`,
              width: `${z.w}%`, height: `${z.h}%`,
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
              >{z.id}</span>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}
