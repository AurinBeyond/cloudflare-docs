/**
 * KidsJourneyPath.jsx — §KIDS-JOURNEY 2026-02-10
 *
 * Anna's directive: the Kids Universe must FEEL like a real journey,
 * not a list of abstract cards. 28 stones, three age-themed shapes,
 * one stone per day. Click any stone → small popup with Aurin's
 * tiny message + buttons "Open today's invitation" / "See activities".
 *
 * Themes per age band:
 *   • little-dreamers → soft cream PEBBLES on sage-blue meadow
 *   • explorers       → purple CRYSTAL stones on a violet path
 *   • dreamweavers    → teal HEXAGON stones on a deep emerald path
 *   • body-temple     → amber WOODEN stones (adult/warm) — same
 *                       "stein på stein" language, grown-up tone
 *
 * Data: fetches /api/kids-journey/progress on mount (or accepts
 * preloaded props for SSR-friendly use). Anonymous wanderers still
 * see Day 1 pulsing.
 *
 * Pure SVG + CSS. No external libs.
 */

import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Lock, Star, X, ArrowRight, Sparkles } from "lucide-react";
import { api } from "@/lib/api";

const THEMES = {
  "little-dreamers": {
    label: "Soft pebble path",
    pathColor: "#b8c8a8",
    stoneShape: "pebble",
    stoneFill: "#fbf6ec",
    stoneStroke: "#c8b89c",
    unlockedFill: "#fff8e8",
    todayGlow: "#f5d586",
    completedFill: "#a8c09a",
    starColor: "#e3b48c",
    bg: "linear-gradient(160deg, #e8e9d9 0%, #d4d8b8 60%, #b8c8a8 100%)",
    title: "Today's pebble is warm",
    accent: "#8a6a3e",
  },
  "explorers": {
    label: "Crystal explorer path",
    pathColor: "#a08abb",
    stoneShape: "crystal",
    stoneFill: "#f3eafa",
    stoneStroke: "#7a5e9c",
    unlockedFill: "#e7d8f5",
    todayGlow: "#b478e0",
    completedFill: "#6a4e8c",
    starColor: "#a878d0",
    bg: "linear-gradient(160deg, #d8c9e8 0%, #b89cd0 60%, #8a6cb2 100%)",
    title: "A crystal waits to be found",
    accent: "#4a2a6a",
  },
  "dreamweavers": {
    label: "Dreamweaver hex path",
    pathColor: "#6a9888",
    stoneShape: "hex",
    stoneFill: "#e0f0e8",
    stoneStroke: "#4a7868",
    unlockedFill: "#c8e8d8",
    todayGlow: "#5cb89a",
    completedFill: "#346856",
    starColor: "#5cb89a",
    bg: "linear-gradient(160deg, #c0d8c8 0%, #88b0a0 60%, #5a8878 100%)",
    title: "The path reveals itself",
    accent: "#1f3a2c",
  },
  "body-temple": {
    label: "Body Temple path",
    pathColor: "#c9a560",
    stoneShape: "wood",
    stoneFill: "#fbf3df",
    stoneStroke: "#8a5e26",
    unlockedFill: "#f4dfac",
    todayGlow: "#e5b248",
    completedFill: "#7a9472",
    starColor: "#d49a3a",
    bg: "linear-gradient(160deg, #f8eecf 0%, #e8d49a 60%, #c9a560 100%)",
    title: "Today's keystone is warm",
    accent: "#4a3a1c",
  },
};

function StoneShape({ shape, state, theme }) {
  const isCompleted = state === "completed";
  const isToday = state === "today";
  const isUnlocked = state === "unlocked";

  const fill = isCompleted ? theme.completedFill
             : isToday ? theme.todayGlow
             : isUnlocked ? theme.unlockedFill
             : theme.stoneFill;
  const opacity = state === "locked" ? 0.55 : 1;
  const glow = isToday ? `drop-shadow(0 0 14px ${theme.todayGlow})` : "none";

  if (shape === "crystal") {
    return (
      <g opacity={opacity}>
        <polygon
          points="20,2 32,12 28,32 12,32 8,12"
          fill={fill}
          stroke={theme.stoneStroke}
          strokeWidth="1.4"
          style={{ filter: glow }}
        />
        <polygon points="20,2 28,12 20,18 12,12" fill="white" opacity="0.4" />
        <polygon points="12,32 20,18 28,32" fill="black" opacity="0.06" />
      </g>
    );
  }
  if (shape === "hex") {
    return (
      <g opacity={opacity}>
        <polygon
          points="20,3 33,11 33,25 20,33 7,25 7,11"
          fill={fill}
          stroke={theme.stoneStroke}
          strokeWidth="1.4"
          style={{ filter: glow }}
        />
        <polygon points="20,3 33,11 20,18 7,11" fill="white" opacity="0.32" />
      </g>
    );
  }
  if (shape === "wood") {
    return (
      <g opacity={opacity}>
        <ellipse
          cx="20" cy="18" rx="16" ry="13"
          fill={fill}
          stroke={theme.stoneStroke}
          strokeWidth="1.5"
          style={{ filter: glow }}
        />
        {/* Wood grain ring */}
        <ellipse cx="20" cy="18" rx="10" ry="7"
          fill="none" stroke={theme.stoneStroke} strokeWidth="0.6" opacity="0.45" />
        <ellipse cx="20" cy="18" rx="5" ry="3"
          fill="none" stroke={theme.stoneStroke} strokeWidth="0.5" opacity="0.5" />
        <ellipse cx="16" cy="13" rx="5" ry="2.5" fill="white" opacity="0.45" />
      </g>
    );
  }
  // pebble (default)
  return (
    <g opacity={opacity}>
      <ellipse
        cx="20" cy="18" rx="15" ry="12"
        fill={fill}
        stroke={theme.stoneStroke}
        strokeWidth="1.4"
        style={{ filter: glow }}
      />
      <ellipse cx="17" cy="13" rx="7" ry="3.5" fill="white" opacity="0.5" />
      <ellipse cx="22" cy="23" rx="4" ry="1.5" fill="black" opacity="0.08" />
    </g>
  );
}

function DecorativeLeaf({ x, y, color, rotate = 0 }) {
  return (
    <g transform={`translate(${x}, ${y}) rotate(${rotate})`} opacity="0.35">
      <path
        d="M 0 0 Q 5 -8 12 -4 Q 8 4 0 0 Z"
        fill={color}
      />
      <path d="M 0 0 Q 6 -2 12 -4" stroke={color} strokeWidth="0.6" fill="none" opacity="0.7" />
    </g>
  );
}

function DecorativeCloud({ x, y, scale = 1 }) {
  return (
    <g transform={`translate(${x}, ${y}) scale(${scale})`} opacity="0.5">
      <ellipse cx="0" cy="0" rx="9" ry="5" fill="white" />
      <ellipse cx="-6" cy="1" rx="6" ry="4" fill="white" />
      <ellipse cx="6" cy="1" rx="6" ry="4" fill="white" />
    </g>
  );
}

export default function KidsJourneyPath({
  ageSlug = "explorers",          // legacy 3-5 / 6-8 / 9-12 also accepted
  childSlug,                      // for routing; defaults to ageSlug
  // §BODY-TEMPLE — when used by Body Temple, pass overrides instead of fetching.
  todayIndex: todayIndexProp,
  completedDays: completedDaysProp,
  totalDays: totalDaysProp,
  onStoneClick = null,           // custom click handler (Body Temple uses this)
  showHeader = true,
  showFooter = true,
  compact = false,
  testIdSuffix = "",
}) {
  // Normalise legacy slugs to canonical THEMES key.
  const themeKey = ({
    "3-5": "little-dreamers",
    "6-8": "explorers",
    "9-12": "dreamweavers",
  })[ageSlug] || ageSlug;
  const theme = THEMES[themeKey] || THEMES["explorers"];
  const slug = childSlug || themeKey;
  const isBodyTemple = themeKey === "body-temple";

  const [todayIndex, setTodayIndex] = useState(todayIndexProp ?? 1);
  const [completedDays, setCompletedDays] = useState(completedDaysProp ?? []);
  const [totalDays, setTotalDays] = useState(totalDaysProp ?? 28);
  const [messages, setMessages] = useState([]);
  const [openDay, setOpenDay] = useState(null);

  // Fetch live progress for Kids age groups (not Body Temple — that
  // owns its own state via props).
  useEffect(() => {
    if (isBodyTemple || todayIndexProp != null) return;
    let alive = true;
    api.get(`/kids-journey/progress?child_slug=${slug}`)
      .then((r) => {
        if (!alive) return;
        setTodayIndex(r.data.today_index || 1);
        setCompletedDays(r.data.completed_days || []);
        setTotalDays(r.data.total_days || 28);
        setMessages(r.data.messages || []);
      })
      .catch(() => {});
    return () => { alive = false; };
  }, [slug, isBodyTemple, todayIndexProp]);

  const completedSet = useMemo(() => new Set(completedDays), [completedDays]);

  // Serpentine layout, 7 stones per row.
  const ROW_LEN = 7;
  const rows = Math.ceil(totalDays / ROW_LEN);
  const STONE_W = compact ? 44 : 56;
  const STONE_GAP = compact ? 14 : 18;
  const ROW_GAP = compact ? 30 : 38;
  const PAD = 30;
  const svgW = PAD * 2 + ROW_LEN * (STONE_W + STONE_GAP) - STONE_GAP;
  const svgH = PAD * 2 + rows * (STONE_W + ROW_GAP) - ROW_GAP;

  const stonePositions = useMemo(() => {
    const out = [];
    for (let i = 0; i < totalDays; i++) {
      const row = Math.floor(i / ROW_LEN);
      const colInRow = i % ROW_LEN;
      const isReversed = row % 2 === 1;
      const col = isReversed ? (ROW_LEN - 1 - colInRow) : colInRow;
      const x = PAD + col * (STONE_W + STONE_GAP);
      const y = PAD + row * (STONE_W + ROW_GAP);
      out.push({ x, y, day: i + 1 });
    }
    return out;
  }, [totalDays, STONE_W, STONE_GAP, ROW_GAP]);

  const pathD = useMemo(() => {
    return stonePositions.reduce((acc, p, i) => {
      const cx = p.x + STONE_W / 2;
      const cy = p.y + STONE_W / 2 - 4;
      if (i === 0) return `M ${cx} ${cy}`;
      const prev = stonePositions[i - 1];
      const pcx = prev.x + STONE_W / 2;
      const pcy = prev.y + STONE_W / 2 - 4;
      const midY = (pcy + cy) / 2;
      return `${acc} C ${pcx} ${midY}, ${cx} ${midY}, ${cx} ${cy}`;
    }, "");
  }, [stonePositions, STONE_W]);

  // Decorative scatters per theme — leaves for explorers, clouds for
  // little-dreamers, soft hex sparkles for dreamweavers, no scatters
  // for body-temple (its own visual language).
  const scatters = useMemo(() => {
    if (themeKey === "little-dreamers") {
      return Array.from({ length: 5 }, (_, i) => ({
        kind: "cloud",
        x: 60 + (i * 130) % svgW,
        y: 20 + (i * 47) % (svgH - 30),
        scale: 0.8 + (i % 3) * 0.3,
      }));
    }
    if (themeKey === "explorers") {
      return Array.from({ length: 8 }, (_, i) => ({
        kind: "leaf",
        x: 30 + (i * 87) % svgW,
        y: 25 + (i * 73) % (svgH - 40),
        color: i % 2 ? "#8a6cb2" : "#b89cd0",
        rotate: (i * 47) % 360,
      }));
    }
    if (themeKey === "dreamweavers") {
      return Array.from({ length: 6 }, (_, i) => ({
        kind: "leaf",
        x: 40 + (i * 112) % svgW,
        y: 30 + (i * 91) % (svgH - 40),
        color: i % 2 ? "#5cb89a" : "#88b0a0",
        rotate: (i * 67) % 360,
      }));
    }
    return [];
  }, [themeKey, svgW, svgH]);

  const handleStonePick = (day) => {
    if (onStoneClick) {
      onStoneClick(day);
      return;
    }
    setOpenDay(day);
  };

  const openMessage = openDay
    ? (messages[openDay - 1] || `Day ${openDay} — a quiet step on the path.`)
    : "";

  const stateForDay = (day) => {
    if (completedSet.has(day)) return "completed";
    if (day === todayIndex) return "today";
    if (day < todayIndex) return "unlocked";
    return "locked";
  };

  return (
    <section
      data-testid={`kids-journey-${themeKey}${testIdSuffix}`}
      className="relative rounded-3xl overflow-hidden"
      style={{
        background: theme.bg,
        padding: compact ? "18px 14px 22px" : "26px 18px 30px",
      }}
    >
      {showHeader && (
        <div className="text-center mb-3">
          <p className="text-[10.5px] uppercase tracking-[0.28em] opacity-85"
             style={{ color: theme.accent }}>
            {theme.label} · Day {todayIndex} of {totalDays}
          </p>
          <p
            className="text-[28px] sm:text-[32px] leading-tight mt-1"
            style={{
              fontFamily: "Caveat, cursive",
              color: theme.accent,
              fontWeight: 600,
            }}
            data-testid="kids-journey-title"
          >
            {theme.title}
          </p>
        </div>
      )}

      <svg
        viewBox={`0 0 ${svgW} ${svgH}`}
        className="w-full h-auto"
        style={{ maxWidth: 760, margin: "0 auto", display: "block" }}
        data-testid="kids-journey-svg"
      >
        {/* Decorative scatter (leaves / clouds) behind everything */}
        {scatters.map((s, i) => (
          s.kind === "cloud"
            ? <DecorativeCloud key={i} x={s.x} y={s.y} scale={s.scale} />
            : <DecorativeLeaf key={i} x={s.x} y={s.y} color={s.color} rotate={s.rotate} />
        ))}

        {/* Glowing connector path under the stones */}
        <path
          d={pathD}
          fill="none"
          stroke={theme.pathColor}
          strokeWidth="7"
          strokeLinecap="round"
          opacity="0.55"
        />
        <path
          d={pathD}
          fill="none"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          opacity="0.55"
          strokeDasharray="2 7"
        />

        {/* Stones */}
        {stonePositions.map(({ x, y, day }) => {
          const state = stateForDay(day);
          return (
            <g
              key={day}
              transform={`translate(${x}, ${y})`}
              style={{ cursor: state === "locked" ? "not-allowed" : "pointer" }}
              onClick={() => state !== "locked" && handleStonePick(day)}
              data-testid={`kids-journey-stone-${day}`}
              aria-label={`Day ${day} — ${state}`}
            >
              <StoneShape shape={theme.stoneShape} state={state} theme={theme} />
              {state === "locked" ? (
                <g transform="translate(13, 10)" opacity="0.7">
                  <rect x="0" y="4" width="14" height="10" rx="2" fill="#2c2418" />
                  <path d="M3 4 Q3 -1 7 -1 Q11 -1 11 4" fill="none" stroke="#2c2418" strokeWidth="1.5" />
                </g>
              ) : state === "completed" ? (
                <g transform="translate(14, 11)">
                  <polygon
                    points="6,0 7.4,4.4 12,4.4 8.3,7.2 9.7,11.6 6,8.8 2.3,11.6 3.7,7.2 0,4.4 4.6,4.4"
                    fill={theme.starColor}
                  />
                </g>
              ) : (
                <text
                  x="20" y="23"
                  textAnchor="middle"
                  fontWeight="600"
                  fill={theme.accent}
                  style={{ fontFamily: "Caveat, cursive", fontSize: 16 }}
                >
                  {day}
                </text>
              )}
              {state === "today" && (
                <circle
                  cx="20" cy="18" r="22"
                  fill="none"
                  stroke={theme.todayGlow}
                  strokeWidth="1.5"
                  opacity="0.6"
                  style={{ filter: `drop-shadow(0 0 8px ${theme.todayGlow})` }}
                >
                  <animate attributeName="r" values="20;26;20" dur="2.4s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.6;0.15;0.6" dur="2.4s" repeatCount="indefinite" />
                </circle>
              )}
            </g>
          );
        })}
      </svg>

      {showFooter && (
        <div className="text-center mt-4 flex items-center justify-center gap-5 text-[12px]"
             style={{ color: theme.accent }}>
          <span className="inline-flex items-center gap-1.5 opacity-85">
            <Star size={11} style={{ color: theme.starColor }} />
            {completedDays.length} of {totalDays} walked
          </span>
          {!isBodyTemple && (
            <Link
              to={`/kids-universe/${slug}/daily`}
              data-testid="kids-journey-cta"
              className="inline-flex items-center gap-1 tracking-[0.16em] uppercase"
              style={{ borderBottom: `1px dotted ${theme.stoneStroke}` }}
            >
              Open today's check-in
              <ArrowRight size={11} />
            </Link>
          )}
        </div>
      )}

      {/* Click-popup: only for Kids hubs (Body Temple opens its own modal via onStoneClick) */}
      {openDay != null && !onStoneClick && (
        <div
          role="dialog"
          data-testid="kids-journey-popup"
          className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center p-4 sm:p-8"
          style={{ background: "rgba(28, 22, 14, 0.5)", backdropFilter: "blur(6px)" }}
          onClick={() => setOpenDay(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-[460px] rounded-2xl p-6 sm:p-7 relative"
            style={{
              background: "linear-gradient(180deg, #fffdf6 0%, #faf2e0 100%)",
              border: `1.5px solid ${theme.stoneStroke}`,
              boxShadow: `0 30px 60px -20px ${theme.accent}aa, 0 0 0 1px ${theme.todayGlow}33`,
            }}
          >
            <button
              type="button"
              onClick={() => setOpenDay(null)}
              data-testid="kids-journey-popup-close"
              aria-label="Close"
              className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition hover:bg-black/5"
              style={{ color: theme.accent }}
            >
              <X size={16} />
            </button>
            <p
              className="text-[11px] uppercase tracking-[0.28em] mb-1.5"
              style={{ color: theme.accent, opacity: 0.78 }}
            >
              {theme.label} · Day {openDay}
            </p>
            <p
              className="text-[28px] sm:text-[32px] leading-tight mb-5"
              style={{
                fontFamily: "Caveat, cursive",
                color: theme.accent,
                fontWeight: 600,
              }}
              data-testid="kids-journey-popup-message"
            >
              {openMessage}
            </p>
            {completedSet.has(openDay) && (
              <p className="text-[12.5px] flex items-center gap-1.5 mb-4"
                 style={{ color: theme.completedFill }}>
                <Sparkles size={12} /> You've already walked this one.
              </p>
            )}
            <div className="flex flex-col sm:flex-row gap-2.5">
              <Link
                to={`/kids-universe/${slug}/daily`}
                onClick={() => setOpenDay(null)}
                data-testid="kids-journey-popup-daily"
                className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-[13px] font-medium transition"
                style={{
                  background: theme.accent,
                  color: "#fff",
                  boxShadow: `0 6px 14px -6px ${theme.accent}`,
                }}
              >
                Open today's check-in
                <ArrowRight size={12} />
              </Link>
              <Link
                to={`/kids-universe/${slug}/activities`}
                onClick={() => setOpenDay(null)}
                data-testid="kids-journey-popup-activities"
                className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-[13px] font-medium transition"
                style={{
                  border: `1.5px solid ${theme.stoneStroke}`,
                  color: theme.accent,
                  background: "#fff",
                }}
              >
                See activities
                <ArrowRight size={12} />
              </Link>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
