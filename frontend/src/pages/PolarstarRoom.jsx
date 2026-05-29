/**
 * PolarstarRoom.jsx — /kids-universe/polarstar/:ageId
 *
 * §POLARSTAR 2026-02-13 — Per-age room inside Polarstar. Same world,
 * same atmosphere; only the activities change.
 *
 * §POLARSTAR v9 iter 85 — PSP-safe preview polish:
 *   - PREVIEW badge in hero so wanderers know this is not yet open
 *   - Day-cards carry a small "Coming Soon" pill (no checkout)
 *   - Hero + cards switched to opaque wooden panels so they stay
 *     legible against the painted forest background (was invisible
 *     on the morning/day painting in iter 84).
 *   - "Join the Explorer List" CTA at bottom of every room page so
 *     the wanderer can opt-in without scrolling back home.
 */
import { useState } from "react";
import { Link, useParams, Navigate } from "react-router-dom";
import { ArrowLeft, Compass, Star, Moon, Mail, Sparkles, Lock } from "lucide-react";
import PolarstarAtmosphere from "@/components/PolarstarAtmosphere";
import PolarstarWaitlistModal from "@/components/PolarstarWaitlistModal";
import { findAgeGroup } from "@/data/polarstarAgeGroups";
import "@/styles/polarstar.css";

const SERIF = '"Cormorant Garamond", "EB Garamond", Georgia, serif';

/* §POLARSTAR v9 iter 85 — inline style guarantees panels stay legible
 * over any painted atmosphere, regardless of CSS cascade order. The
 * CSS file's `.ps-room-*` rules were silently being lost in the
 * webpack-injected style cascade (Tailwind's reset re-applies after).
 * Using inline styles for the critical layout/contrast pieces means
 * the room can NEVER fall back to "just a pretty picture". */
const HERO_INLINE = {
  position: "relative",
  zIndex: 5,
  maxWidth: 940,
  margin: "0 auto 32px",
  textAlign: "center",
  padding: "30px 36px 32px",
  borderRadius: 28,
  background: "linear-gradient(180deg, rgba(14,23,48,0.90) 0%, rgba(14,23,48,0.96) 100%)",
  border: "1px solid rgba(196,164,107,0.55)",
  boxShadow: "0 22px 54px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.06)",
  color: "#f6edda",
  backdropFilter: "blur(18px)",
  WebkitBackdropFilter: "blur(18px)",
  fontFamily: SERIF,
};
const HERO_INLINE_LIGHT = {
  ...HERO_INLINE,
  background: "linear-gradient(180deg, rgba(255,252,245,0.96) 0%, rgba(248,238,212,0.96) 100%)",
  color: "#1f2a44",
  border: "1px solid rgba(196,164,107,0.65)",
  boxShadow: "0 18px 42px rgba(31,42,68,0.20), inset 0 1px 0 rgba(255,255,255,0.6)",
};
const SHELL_INLINE = {
  position: "relative",
  zIndex: 4,
  display: "grid",
  gridTemplateColumns: "1fr 320px",
  gap: 24,
  maxWidth: 1320,
  margin: "0 auto",
};
const MAP_INLINE = {
  padding: 28,
  borderRadius: 26,
  background: "rgba(14,23,48,0.86)",
  border: "1px solid rgba(196,164,107,0.55)",
  backdropFilter: "blur(22px)",
  WebkitBackdropFilter: "blur(22px)",
  color: "#f6edda",
  boxShadow: "0 22px 54px rgba(0,0,0,0.45)",
};
const MAP_INLINE_LIGHT = {
  ...MAP_INLINE,
  background: "rgba(255,251,241,0.94)",
  color: "#1f2a44",
  boxShadow: "0 18px 44px rgba(31,42,68,0.18)",
};
const CARD_INLINE = {
  position: "relative",
  display: "flex",
  flexDirection: "column",
  alignItems: "flex-start",
  gap: 6,
  padding: "16px 14px",
  borderRadius: 18,
  border: "1px solid rgba(196,164,107,0.55)",
  background: "linear-gradient(180deg, rgba(20,30,56,0.86) 0%, rgba(20,30,56,0.96) 100%)",
  color: "#f6edda",
  cursor: "pointer",
  minHeight: 160,
  textAlign: "left",
  boxShadow: "0 12px 26px rgba(0,0,0,0.38), inset 0 1px 0 rgba(255,255,255,0.06)",
  fontFamily: SERIF,
  transition: "transform 220ms ease, box-shadow 220ms ease, border-color 220ms ease",
};
const CARD_INLINE_LIGHT = {
  ...CARD_INLINE,
  background: "linear-gradient(180deg, rgba(255,253,247,0.96) 0%, rgba(248,238,212,0.96) 100%)",
  color: "#1f2a44",
  border: "1px solid rgba(196,164,107,0.55)",
  boxShadow: "0 12px 26px rgba(31,42,68,0.18), inset 0 1px 0 rgba(255,255,255,0.6)",
};
const CTA_INLINE = {
  position: "relative",
  zIndex: 4,
  maxWidth: 880,
  margin: "32px auto 0",
  padding: "24px 28px",
  borderRadius: 22,
  textAlign: "center",
  background: "linear-gradient(180deg, rgba(14,23,48,0.80) 0%, rgba(14,23,48,0.94) 100%)",
  border: "1px solid rgba(196,164,107,0.55)",
  color: "#f6edda",
  boxShadow: "0 20px 44px rgba(0,0,0,0.35)",
};
const CTA_INLINE_LIGHT = {
  ...CTA_INLINE,
  background: "linear-gradient(180deg, rgba(255,252,245,0.96) 0%, rgba(248,238,212,0.96) 100%)",
  color: "#1f2a44",
  boxShadow: "0 16px 34px rgba(31,42,68,0.20)",
};
const SIDE_CARD_INLINE = {
  padding: 18,
  borderRadius: 20,
  border: "1px solid rgba(196,164,107,0.55)",
  background: "rgba(14,23,48,0.86)",
  color: "#f6edda",
  backdropFilter: "blur(18px)",
  WebkitBackdropFilter: "blur(18px)",
  boxShadow: "0 16px 32px rgba(0,0,0,0.34)",
};
const SIDE_CARD_INLINE_LIGHT = {
  ...SIDE_CARD_INLINE,
  background: "rgba(255,251,241,0.95)",
  color: "#1f2a44",
  boxShadow: "0 14px 28px rgba(31,42,68,0.16)",
};

function isLightMode(mode) {
  return mode === "day" || mode === "morning";
}

function RoomHero({ group, mode }) {
  const { Icon, title } = group;
  const enterLabel = title.replace(" Path", "");
  const light = isLightMode(mode);
  const heroStyle = light ? HERO_INLINE_LIGHT : HERO_INLINE;
  const titleColor = light ? "#1f2a44" : "#f6edda";
  const accentColor = light ? "#8a6a37" : "#d4b67d";
  const mutedColor = light ? "rgba(31,42,68,0.78)" : "rgba(246,237,218,0.78)";

  return (
    <section className="ps-room-hero" data-testid="polarstar-room-hero" style={heroStyle}>
      <Link
        to="/kids-universe/polarstar"
        data-testid="polarstar-room-back"
        style={{
          fontFamily: SERIF,
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          fontSize: 11.5,
          letterSpacing: "0.28em",
          textTransform: "uppercase",
          textDecoration: "none",
          padding: "8px 14px",
          borderRadius: 999,
          border: `1px solid ${light ? "rgba(196,164,107,0.55)" : "rgba(196,164,107,0.45)"}`,
          background: light ? "rgba(255,252,245,0.92)" : "rgba(14,23,48,0.62)",
          color: mutedColor,
          marginBottom: 18,
        }}
      >
        <ArrowLeft size={14} aria-hidden="true" />
        <span>Back to Polarstar</span>
      </Link>

      <div
        data-testid="polarstar-room-preview-badge"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          margin: "0 0 16px",
          padding: "5px 14px 5px 11px",
          borderRadius: 999,
          fontSize: 10.5,
          letterSpacing: "0.28em",
          textTransform: "uppercase",
          background: light ? "rgba(255,252,245,0.92)" : "rgba(14,23,48,0.78)",
          border: `1px solid ${light ? "rgba(196,164,107,0.65)" : "rgba(212,182,125,0.55)"}`,
          color: accentColor,
          fontFamily: SERIF,
        }}
      >
        <span
          aria-hidden="true"
          style={{
            width: 7, height: 7, borderRadius: "50%",
            background: "#d4b67d",
            boxShadow: "0 0 0 2px rgba(212,182,125,0.28), 0 0 10px rgba(212,182,125,0.7)",
          }}
        />
        <span>PREVIEW WORLD · The First Lanterns Are Lit</span>
      </div>

      <div
        aria-hidden="true"
        style={{
          display: "inline-grid",
          placeItems: "center",
          width: 62, height: 62,
          borderRadius: 22,
          background: light ? "rgba(196,164,107,0.28)" : "rgba(196,164,107,0.18)",
          color: accentColor,
          margin: "0 auto 14px",
          border: `1px solid ${light ? "rgba(196,164,107,0.55)" : "rgba(196,164,107,0.32)"}`,
        }}
      >
        <Icon size={30} />
      </div>

      <p
        data-testid={`polarstar-room-age-${group.id}`}
        style={{
          fontFamily: SERIF,
          margin: "0 0 6px",
          fontSize: 10.5,
          letterSpacing: "0.32em",
          textTransform: "uppercase",
          color: mutedColor,
        }}
      >
        {group.age}
      </p>
      <h1
        data-testid={`polarstar-room-title-${group.id}`}
        style={{
          fontFamily: SERIF,
          margin: "4px 0 10px",
          fontWeight: 300,
          fontSize: "clamp(36px, 5vw, 56px)",
          lineHeight: 1.05,
          color: titleColor,
        }}
      >
        {enterLabel} <span style={{ fontStyle: "italic", color: accentColor }}>Journey</span>
      </h1>
      <p
        data-testid={`polarstar-room-sub-${group.id}`}
        style={{
          fontFamily: SERIF,
          margin: "0 0 10px",
          fontSize: 16,
          fontStyle: "italic",
          color: accentColor,
        }}
      >
        {group.subtitle}
      </p>
      <p
        style={{
          fontFamily: SERIF,
          margin: "0 auto",
          maxWidth: 580,
          fontSize: 14,
          lineHeight: 1.65,
          fontStyle: "italic",
          color: mutedColor,
        }}
      >
        {group.description}
      </p>
    </section>
  );
}

function DayPath({ group, mode, onJoinWaitlist }) {
  const light = isLightMode(mode);
  const mapStyle = light ? MAP_INLINE_LIGHT : MAP_INLINE;
  const cardBase = light ? CARD_INLINE_LIGHT : CARD_INLINE;
  const accent = light ? "#8a6a37" : "#d4b67d";
  const muted = light ? "rgba(31,42,68,0.72)" : "rgba(246,237,218,0.72)";
  const titleColor = light ? "#1f2a44" : "#f6edda";
  // Choose grid columns based on number of activities (7 → 4-col)
  const cols = group.activities.length === 7 ? 4 : 3;
  return (
    <section
      data-testid={`polarstar-room-map-${group.id}`}
      style={mapStyle}
    >
      <div style={{ marginBottom: 20 }}>
        <p style={{
          fontFamily: SERIF, margin: 0, fontSize: 10.5,
          letterSpacing: "0.32em", textTransform: "uppercase", color: muted,
        }}>
          Today&apos;s Journey · Preview
        </p>
        <h2 style={{
          fontFamily: SERIF, margin: "4px 0 0",
          fontWeight: 300, fontSize: "clamp(22px, 2.4vw, 28px)",
          color: titleColor, lineHeight: 1.15,
        }}>
          Walk it gently. <span style={{ fontStyle: "italic", color: accent }}>One step at a time.</span>
        </h2>
        <p style={{
          fontFamily: SERIF, margin: "8px 0 0", maxWidth: 640,
          fontSize: 13, lineHeight: 1.55, fontStyle: "italic", color: muted,
        }}>
          These are the steps that will live in this path when the world opens.
          The full journey unlocks once Polarstar is live.
        </p>
      </div>

      <div
        data-testid={`polarstar-day-grid-${group.id}`}
        style={{
          display: "grid",
          gap: 12,
          gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
        }}
      >
        {group.activities.map((a, i) => {
          const ActivityIcon = a.Icon;
          const isToday = i === 0;
          const cardStyle = isToday
            ? {
                ...cardBase,
                background: light
                  ? "linear-gradient(180deg, #fffbe8 0%, #f3df9c 100%)"
                  : "linear-gradient(180deg, rgba(196,164,107,0.32) 0%, rgba(196,164,107,0.16) 100%)",
                border: `1px solid ${accent}`,
                boxShadow: light
                  ? "0 12px 26px rgba(140,100,30,0.30), 0 0 24px rgba(196,164,107,0.45)"
                  : "0 14px 30px rgba(0,0,0,0.42), 0 0 28px rgba(196,164,107,0.45)",
              }
            : cardBase;
          return (
            <button
              type="button"
              key={a.id}
              data-testid={`polarstar-day-${group.id}-${a.id}`}
              onClick={() => onJoinWaitlist({ zone: `${group.id}_${a.id}`, label: `${group.title}: ${a.label}` })}
              style={cardStyle}
            >
              <span style={{
                fontSize: 10, letterSpacing: "0.32em",
                textTransform: "uppercase", color: muted,
              }}>
                Day {i + 1}
              </span>
              <span aria-hidden="true" style={{
                display: "grid", placeItems: "center", width: 34, height: 34,
                borderRadius: 11,
                background: light ? "rgba(196,164,107,0.32)" : "rgba(196,164,107,0.22)",
                color: accent, margin: "6px 0",
              }}>
                <ActivityIcon size={20} />
              </span>
              <strong style={{
                fontSize: 15.5, fontWeight: 400, fontStyle: "italic", lineHeight: 1.2,
                color: titleColor,
              }}>
                {a.label}
              </strong>
              <small style={{
                fontSize: 12.5, lineHeight: 1.5, color: muted,
              }}>
                {a.blurb}
              </small>
              {isToday ? (
                <span aria-hidden="true" style={{
                  position: "absolute", top: 10, right: 10,
                  display: "inline-flex", alignItems: "center", gap: 4,
                  fontSize: 9, letterSpacing: "0.24em", textTransform: "uppercase",
                  padding: "3px 8px", borderRadius: 999,
                  background: accent, color: "#0e1730", fontFamily: SERIF,
                }}>
                  <Star size={11} />
                  <em style={{ fontStyle: "normal" }}>first step</em>
                </span>
              ) : (
                <span aria-hidden="true" style={{
                  position: "absolute", top: 10, right: 10,
                  display: "inline-flex", alignItems: "center", gap: 4,
                  fontSize: 9, letterSpacing: "0.22em", textTransform: "uppercase",
                  padding: "3px 8px", borderRadius: 999,
                  background: light ? "rgba(255,251,241,0.92)" : "rgba(14,23,48,0.78)",
                  color: muted,
                  border: `1px solid ${light ? "rgba(196,164,107,0.45)" : "rgba(196,164,107,0.32)"}`,
                  fontFamily: SERIF,
                }}>
                  <Lock size={10} />
                  <em style={{ fontStyle: "normal" }}>soon</em>
                </span>
              )}
            </button>
          );
        })}
      </div>
    </section>
  );
}

function RoomRail({ group, mode }) {
  const light = isLightMode(mode);
  const cardBase = light ? SIDE_CARD_INLINE_LIGHT : SIDE_CARD_INLINE;
  const accent = light ? "#8a6a37" : "#d4b67d";
  const muted = light ? "rgba(31,42,68,0.72)" : "rgba(246,237,218,0.72)";
  const titleColor = light ? "#1f2a44" : "#f6edda";
  const tomorrowStyle = {
    ...cardBase,
    background: light
      ? "linear-gradient(180deg, #fffbe8 0%, #f5e2a8 100%)"
      : "linear-gradient(180deg, rgba(196,164,107,0.30) 0%, rgba(196,164,107,0.14) 100%)",
    border: `1px solid ${accent}`,
  };
  const railItem = (Icon, eyebrow, title, subtitle, style) => (
    <div style={style}>
      <span aria-hidden="true" style={{
        display: "inline-grid", placeItems: "center", width: 34, height: 34,
        borderRadius: 11, background: light ? "rgba(196,164,107,0.32)" : "rgba(196,164,107,0.22)",
        color: accent, marginBottom: 10,
      }}>
        <Icon size={20} />
      </span>
      <p style={{
        fontFamily: SERIF, margin: "0 0 4px",
        fontSize: 10.5, letterSpacing: "0.32em", textTransform: "uppercase", color: muted,
      }}>{eyebrow}</p>
      <h3 style={{
        fontFamily: SERIF, margin: "4px 0 4px",
        fontWeight: 300, fontSize: 16, lineHeight: 1.28, color: titleColor,
      }}>{title}</h3>
      {subtitle && (
        <p style={{
          fontFamily: SERIF, margin: "4px 0 0",
          fontSize: 12.5, lineHeight: 1.55, color: muted,
        }}>{subtitle}</p>
      )}
    </div>
  );
  return (
    <aside
      data-testid={`polarstar-room-rail-${group.id}`}
      style={{ display: "flex", flexDirection: "column", gap: 14 }}
    >
      {railItem(Compass, "Tomorrow's Adventure",
        <>A new story <span style={{ fontStyle: "italic", color: accent }}>awakens softly.</span></>,
        null, tomorrowStyle)}
      {railItem(Sparkles, "Family Moment",
        "Share one small memory from today.", null, cardBase)}
      {railItem(Moon, "Evening Room",
        <>Read together. <span style={{ fontStyle: "italic", color: accent }}>Rest together.</span></>,
        "Close the day gently.", cardBase)}
      {railItem(Mail, "Memory Box",
        <>A keepsake for <span style={{ fontStyle: "italic", color: accent }}>tomorrow&apos;s self.</span></>,
        null, cardBase)}
    </aside>
  );
}

export default function PolarstarRoom() {
  const { ageGroup } = useParams();
  const group = findAgeGroup(ageGroup);
  const [waitlistOpen, setWaitlistOpen] = useState(false);
  const [waitlistContext, setWaitlistContext] = useState(null);

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
        const light = isLightMode(mode);
        const ctaStyle = light ? CTA_INLINE_LIGHT : CTA_INLINE;
        const accent = light ? "#8a6a37" : "#d4b67d";
        const muted = light ? "rgba(31,42,68,0.78)" : "rgba(246,237,218,0.78)";
        return (
          <>
            <RoomHero group={group} mode={mode} />
            <div
              data-testid={`polarstar-room-shell-${group.id}`}
              style={SHELL_INLINE}
            >
              <DayPath group={group} mode={mode} onJoinWaitlist={openWaitlist} />
              <RoomRail group={group} mode={mode} />
            </div>

            <section
              data-testid={`polarstar-room-cta-${group.id}`}
              style={ctaStyle}
            >
              <p style={{
                fontFamily: SERIF,
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                margin: "0 0 14px",
                fontSize: 14.5,
                lineHeight: 1.55,
                fontStyle: "italic",
                color: muted,
                maxWidth: 640,
              }}>
                <Sparkles size={14} aria-hidden="true" style={{ color: accent, flexShrink: 0 }} />
                <span>
                  Polarstar Kids opens soon. Leave your name on the Explorer List
                  and we&apos;ll send you one quiet note the day it does.
                </span>
              </p>
              <div>
                <button
                  type="button"
                  onClick={() => openWaitlist({ zone: group.id, label: group.title })}
                  data-testid={`polarstar-room-cta-btn-${group.id}`}
                  style={{
                    fontFamily: SERIF,
                    padding: "12px 28px",
                    borderRadius: 12,
                    border: 0,
                    background: "linear-gradient(180deg, #d4b67d 0%, #b3935a 100%)",
                    color: "#1f2a44",
                    fontSize: 14.5,
                    fontWeight: 500,
                    letterSpacing: "0.06em",
                    cursor: "pointer",
                    boxShadow: "0 10px 22px rgba(140,100,30,0.30), inset 0 1px 0 rgba(255,255,255,0.5)",
                  }}
                >
                  Join the Explorer List
                </button>
              </div>
            </section>

            <footer
              data-testid="polarstar-room-footer"
              style={{
                position: "relative",
                zIndex: 4,
                margin: "32px auto 16px",
                maxWidth: 900,
                textAlign: "center",
                fontSize: 13,
                letterSpacing: "0.08em",
                color: muted,
                fontFamily: SERIF,
              }}
            >
              <p style={{ margin: 0 }}>
                Small moments. <span style={{ fontStyle: "italic", color: accent }}>Big memories.</span> Forever.
              </p>
            </footer>

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
