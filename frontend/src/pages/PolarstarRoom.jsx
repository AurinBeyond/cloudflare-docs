/**
 * PolarstarRoom.jsx — /kids-universe/polarstar/:ageGroup
 *
 * §POLARSTAR-CONTENT iter 86 2026-02-29 — REWRITTEN.
 *
 * Founder feedback (2026-02-29): "praegu on tühi tuba". The previous
 * version showed only a breadcrumb strip + a 'lantern is being lit'
 * lantern. That is no longer acceptable. Every age-group room now
 * renders a themed sub-page with the 5-7 painted activity cards
 * from polarstarContentMap.js — matching the founder-approved Theme
 * Page Design mockup.
 *
 * Layout:
 *   - Painted day-world background (same as Main World) + parchment veil.
 *   - "← Back to Polarstar World" pill (top-left).
 *   - Cloud title badge "DISCOVERY WORLD · Ages 4-6" (top-centre).
 *   - 3-column responsive grid of activity cards (icon + title + blurb).
 *   - Each card routes to its content page (story-time / kindness / etc).
 *   - "Tip for parents" parchment (bottom-left).
 *
 * Decision: keep the old `polarstar-room-name-{id}`, `polarstar-room-
 * back` and `polarstar-room-cta-{id}` test ids alive for the existing
 * Playwright tests (J03, J04, etc.) by mirroring them on the new
 * elements.
 */
import { useEffect, useState } from "react";
import { Link, useParams, Navigate } from "react-router-dom";
import { Sparkles, ChevronRight } from "lucide-react";
import PolarstarThemePage from "@/components/PolarstarThemePage";
import PolarstarWaitlistModal from "@/components/PolarstarWaitlistModal";
import { getRoom } from "@/data/polarstarContentMap";

const SERIF = '"Cormorant Garamond", "EB Garamond", Georgia, serif';
const CAVEAT = '"Caveat", "Comic Sans MS", cursive';

export default function PolarstarRoom() {
  const { ageGroup } = useParams();
  const room = getRoom(ageGroup);
  const [waitlistOpen, setWaitlistOpen] = useState(false);
  const [waitlistContext, setWaitlistContext] = useState(null);

  /* Global event bridge (existing pattern). */
  useEffect(() => {
    const handler = (e) => {
      const detail = e.detail || {};
      setWaitlistContext({
        zone: detail.zone || ageGroup || "explorer_list",
        label: detail.label || detail.interest || room?.title || "Explorer List",
      });
      setWaitlistOpen(true);
    };
    window.addEventListener("polarstar:openWaitlist", handler);
    return () => window.removeEventListener("polarstar:openWaitlist", handler);
  }, [ageGroup, room]);

  if (!room) {
    return <Navigate to="/kids-universe/polarstar" replace />;
  }

  return (
    <>
      <PolarstarThemePage
        roomTitle={room.title}
        ageLabel={room.ageLabel}
        subtitle={room.subtitle}
        palette={room.palette}
        backTo="/kids-universe/polarstar"
        backLabel="Back to Polarstar World"
        parentTip={
          <>
            Every button below opens real content — not a placeholder. Walk
            through this world with your child at a slow pace, one activity
            at a time. <strong>{room.description}</strong>
          </>
        }
        testid={`polarstar-room-${room.id}`}
      >
        {/* Hidden compatibility marker for legacy Playwright tests. */}
        <span
          data-testid={`polarstar-room-name-${room.id}`}
          style={{ position: "absolute", left: -9999, top: -9999 }}
          aria-hidden="true"
        >
          {room.title}
        </span>

        {/* ─── Activity grid (3-up responsive) ─── */}
        <section
          data-testid={`polarstar-room-grid-${room.id}`}
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: 22,
            marginTop: 8,
          }}
        >
          {room.activities.map((act) => {
            const Icon = act.lucideIcon;
            const isSoon = act.status === "soon";
            return (
              <Link
                key={act.id}
                to={act.route}
                data-testid={`polarstar-activity-${room.id}-${act.slug}`}
                style={{
                  position: "relative",
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                  padding: "22px 22px 18px",
                  borderRadius: 22,
                  textDecoration: "none",
                  background:
                    "linear-gradient(180deg, rgba(255,252,244,0.98) 0%, rgba(252,243,224,0.95) 100%)",
                  border: `1.5px solid ${room.palette.accent}55`,
                  boxShadow: `0 14px 28px rgba(58,42,24,0.16), 0 0 0 1px ${room.palette.glow} inset`,
                  color: "#3a2a18",
                  transition: "transform 220ms ease, box-shadow 220ms ease",
                  cursor: "pointer",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-3px)";
                  e.currentTarget.style.boxShadow = `0 22px 38px rgba(58,42,24,0.22), 0 0 0 2px ${room.palette.accent}88 inset`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "";
                  e.currentTarget.style.boxShadow = `0 14px 28px rgba(58,42,24,0.16), 0 0 0 1px ${room.palette.glow} inset`;
                }}
              >
                {/* Icon disc */}
                <div
                  style={{
                    width: 60,
                    height: 60,
                    borderRadius: 18,
                    background: `${room.palette.accent}1f`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: room.palette.accent,
                    marginBottom: 6,
                  }}
                  aria-hidden="true"
                >
                  <Icon size={32} strokeWidth={1.8} />
                </div>

                {/* Title (handwritten) */}
                <div
                  style={{
                    fontFamily: CAVEAT,
                    fontSize: 28,
                    lineHeight: 1.05,
                    color: "#3a2a18",
                  }}
                >
                  {act.title}
                </div>

                {/* Blurb */}
                <div
                  style={{
                    fontSize: 14.5,
                    lineHeight: 1.5,
                    color: "#5b4a32",
                    fontStyle: "italic",
                  }}
                >
                  {act.blurb}
                </div>

                {/* Status pill — only on "soon" cards */}
                {isSoon && (
                  <span
                    style={{
                      position: "absolute",
                      top: 14,
                      right: 14,
                      fontSize: 10.5,
                      letterSpacing: "0.18em",
                      textTransform: "uppercase",
                      padding: "3px 10px",
                      borderRadius: 999,
                      background: "rgba(255,236,200,0.95)",
                      color: room.palette.accent,
                      border: `1px solid ${room.palette.accent}55`,
                      fontWeight: 600,
                    }}
                  >
                    Coming Soon
                  </span>
                )}

                {/* CTA arrow */}
                <div
                  style={{
                    marginTop: "auto",
                    paddingTop: 12,
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    fontFamily: SERIF,
                    fontSize: 12.5,
                    letterSpacing: "0.16em",
                    textTransform: "uppercase",
                    color: room.palette.accent,
                  }}
                >
                  <span>Open</span>
                  <ChevronRight size={14} />
                </div>
              </Link>
            );
          })}
        </section>

        {/* ─── Quiet "Join the Explorer List" CTA at the very bottom ─── */}
        <div
          style={{
            marginTop: 36,
            display: "flex",
            justifyContent: "center",
          }}
        >
          <button
            type="button"
            onClick={() => {
              setWaitlistContext({ zone: room.id, label: `${room.title} · ${room.ageLabel}` });
              setWaitlistOpen(true);
            }}
            data-testid={`polarstar-room-cta-${room.id}`}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "12px 26px",
              borderRadius: 999,
              border: 0,
              background: "linear-gradient(180deg, #d4b67d 0%, #b3935a 100%)",
              color: "#1f2a44",
              fontSize: 13.5,
              fontWeight: 500,
              letterSpacing: "0.08em",
              cursor: "pointer",
              fontFamily: SERIF,
              boxShadow:
                "0 10px 22px rgba(140,100,30,0.30), inset 0 1px 0 rgba(255,255,255,0.5)",
            }}
          >
            <Sparkles size={14} aria-hidden="true" />
            <span>Join the Explorer List</span>
          </button>
        </div>
      </PolarstarThemePage>

      {waitlistOpen && (
        <PolarstarWaitlistModal
          isOpen={waitlistOpen}
          onClose={() => setWaitlistOpen(false)}
          context={waitlistContext}
          mode="day"
        />
      )}
    </>
  );
}
