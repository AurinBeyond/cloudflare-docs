/**
 * PolarstarRoom.jsx — /kids-universe/polarstar/:ageId
 *
 * §POLARSTAR v10 2026-02-13 — STRIPPED of all dashboard elements.
 *
 * Founder feedback (iter 85): "Exploration Room = sama maailm, sama
 * rada, lihtsalt 7–10 tegevused selle maailma sees." — same painted
 * world, no cream-paper hero cards, no 7-day course grid, no Body-
 * Temple-style rail. The age room is just the world with a small
 * breadcrumb-style identity strip and a single Explorer-List CTA.
 *
 * The activity catalogue still lives in polarstarAgeGroups.js for
 * Phase 2 (when we wire real progress + chrono-lock), but it is
 * intentionally NOT rendered here yet. Activity nodes will be placed
 * AS PLACES on the world painting once the founder approves the
 * Phase 2 visual direction.
 */
import { useEffect, useState } from "react";
import { Link, useParams, Navigate } from "react-router-dom";
import { ArrowLeft, Sparkles } from "lucide-react";
import PolarstarAtmosphere from "@/components/PolarstarAtmosphere";
import PolarstarWaitlistModal from "@/components/PolarstarWaitlistModal";
import { findAgeGroup } from "@/data/polarstarAgeGroups";
import "@/styles/polarstar.css";

const SERIF = '"Cormorant Garamond", "EB Garamond", Georgia, serif';

export default function PolarstarRoom() {
  const { ageGroup } = useParams();
  const group = findAgeGroup(ageGroup);
  const [waitlistOpen, setWaitlistOpen] = useState(false);
  const [waitlistContext, setWaitlistContext] = useState(null);

  /* Same global event bridge as the main world. */
  useEffect(() => {
    const handler = (e) => {
      const detail = e.detail || {};
      setWaitlistContext({
        zone: detail.zone || ageGroup || "explorer_list",
        label: detail.label || detail.interest || group?.title || "Explorer List",
      });
      setWaitlistOpen(true);
    };
    window.addEventListener("polarstar:openWaitlist", handler);
    return () => window.removeEventListener("polarstar:openWaitlist", handler);
  }, [ageGroup, group]);

  if (!group) {
    return <Navigate to="/kids-universe/polarstar" replace />;
  }

  const openWaitlist = (ctx) => {
    setWaitlistContext(ctx || { zone: group.id, label: group.title });
    setWaitlistOpen(true);
  };

  return (
    <PolarstarAtmosphere testid={`polarstar-room-${group.id}`}>
      {(mode) => {
        const isDay = mode === "day" || mode === "morning";
        return (
          <>
            {/* §POLARSTAR v10 — Minimal in-world identity strip.
             * Positioned absolutely so the painted world stays the
             * focus. No cards, no grids, just a breadcrumb and a
             * single quiet CTA. */}
            <header
              data-testid="polarstar-room-strip"
              style={{
                position: "absolute",
                top: 22,
                left: "50%",
                transform: "translateX(-50%)",
                zIndex: 6,
                display: "inline-flex",
                alignItems: "center",
                gap: 14,
                padding: "8px 18px 8px 12px",
                borderRadius: 999,
                background: isDay ? "rgba(255,251,241,0.78)" : "rgba(14,23,48,0.66)",
                border: `1px solid ${isDay ? "rgba(196,164,107,0.55)" : "rgba(212,182,125,0.42)"}`,
                color: isDay ? "#1f2a44" : "#f6edda",
                backdropFilter: "blur(14px)",
                WebkitBackdropFilter: "blur(14px)",
                fontFamily: SERIF,
                fontSize: 12.5,
                letterSpacing: "0.16em",
                textTransform: "uppercase",
                boxShadow: isDay
                  ? "0 12px 28px rgba(31,42,68,0.16)"
                  : "0 14px 30px rgba(0,0,0,0.42)",
              }}
            >
              <Link
                to="/kids-universe/polarstar"
                data-testid="polarstar-room-back"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  textDecoration: "none",
                  color: "inherit",
                  opacity: 0.78,
                }}
              >
                <ArrowLeft size={13} aria-hidden="true" />
                <span>Polarstar</span>
              </Link>

              <span aria-hidden="true" style={{ opacity: 0.45 }}>·</span>

              <span data-testid={`polarstar-room-name-${group.id}`} style={{ fontStyle: "italic" }}>
                {group.title.replace(" Path", "")}
              </span>

              <span aria-hidden="true" style={{ opacity: 0.45 }}>·</span>

              <span style={{ color: isDay ? "#8a6a37" : "#d4b67d" }}>
                {group.age}
              </span>
            </header>

            {/* §POLARSTAR v10 — Floating "Coming Soon" lantern. The
             * room is preview-only; this lantern invites parents to
             * leave a quiet note for when it opens. NOT a button row
             * or course grid. Just one calm light. */}
            <section
              data-testid={`polarstar-room-lantern-${group.id}`}
              style={{
                position: "absolute",
                bottom: 56,
                left: "50%",
                transform: "translateX(-50%)",
                zIndex: 6,
                maxWidth: 440,
                width: "calc(100% - 48px)",
                padding: "20px 26px",
                borderRadius: 28,
                textAlign: "center",
                background: isDay ? "rgba(255,251,241,0.86)" : "rgba(14,23,48,0.82)",
                border: `1px solid ${isDay ? "rgba(196,164,107,0.55)" : "rgba(212,182,125,0.42)"}`,
                color: isDay ? "#1f2a44" : "#f6edda",
                backdropFilter: "blur(16px)",
                WebkitBackdropFilter: "blur(16px)",
                boxShadow: isDay
                  ? "0 18px 42px rgba(31,42,68,0.20)"
                  : "0 22px 50px rgba(0,0,0,0.48)",
                fontFamily: SERIF,
              }}
            >
              <p
                style={{
                  margin: "0 0 4px",
                  fontSize: 10.5,
                  letterSpacing: "0.28em",
                  textTransform: "uppercase",
                  color: isDay ? "#8a6a37" : "#d4b67d",
                }}
              >
                The lantern is being lit
              </p>
              <p
                style={{
                  margin: "0 0 14px",
                  fontSize: 17,
                  lineHeight: 1.45,
                  fontStyle: "italic",
                  color: isDay ? "#1f2a44" : "#f6edda",
                }}
              >
                {group.subtitle}
              </p>
              <button
                type="button"
                onClick={() => openWaitlist({ zone: group.id, label: group.title })}
                data-testid={`polarstar-room-cta-${group.id}`}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "10px 22px",
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
            </section>

            {waitlistOpen && (
              <PolarstarWaitlistModal
                isOpen={waitlistOpen}
                onClose={() => setWaitlistOpen(false)}
                context={waitlistContext}
                mode={mode}
              />
            )}
          </>
        );
      }}
    </PolarstarAtmosphere>
  );
}
