/**
 * KidsJourneyPath.jsx — §KIDS-JOURNEY 2026-02-10
 *
 * Anna's directive: "iga leht laste keskkonnas peab vastama selle sisu teemale"
 * + the four reference images show a stepping-stones journey path as the
 * centerpiece of Kids Universe.
 *
 * Per age group:
 *   • 4-6 Discovery   → soft cream pebbles in a sage-blue meadow
 *   • 7-10 Exploration → purple crystal-tipped stones on a violet path
 *   • 11-13 Creation  → teal/cyan hex-stones on a deep emerald path
 *
 * Each stone represents one day in the 28-day Daily Journey.
 * Locked / unlocked / today / completed states.
 * Click → navigates to that day's activity.
 *
 * No external libraries. Pure SVG + CSS. Performant. Sanctuary-toned.
 */

import { Link } from "react-router-dom";
import { Lock, Star } from "lucide-react";

const THEMES = {
  "3-5": {
    label: "Discovery",
    pathColor: "#dfe9d6",
    stoneShape: "pebble",
    stoneFill: "#fbf6ec",
    stoneStroke: "#c8b89c",
    unlockedFill: "#fff8e8",
    todayGlow: "#f5d586",
    completedFill: "#a8c09a",
    starColor: "#e3b48c",
    bg: "linear-gradient(160deg, #e8e9d9 0%, #d4d8b8 100%)",
    title: "Tomorrow's pebble waits for you",
  },
  "6-8": {
    label: "Exploration",
    pathColor: "#c9b7d8",
    stoneShape: "crystal",
    stoneFill: "#f3eafa",
    stoneStroke: "#9a86b8",
    unlockedFill: "#e7d8f5",
    todayGlow: "#c896f0",
    completedFill: "#8a6cb2",
    starColor: "#a878d0",
    bg: "linear-gradient(160deg, #d8c9e8 0%, #b89cd0 100%)",
    title: "Tomorrow's crystal waits to be found",
  },
  "9-12": {
    label: "Creation",
    pathColor: "#a8d8c8",
    stoneShape: "hex",
    stoneFill: "#e0f0e8",
    stoneStroke: "#6c9888",
    unlockedFill: "#c8e8d8",
    todayGlow: "#7ec8a8",
    completedFill: "#4a8878",
    starColor: "#5cb89a",
    bg: "linear-gradient(160deg, #c0d8c8 0%, #88b0a0 100%)",
    title: "Tomorrow's path reveals itself",
  },
};

function StoneShape({ shape, state, theme, day, todayIndex }) {
  const isCompleted = state === "completed";
  const isToday = state === "today";
  const isUnlocked = state === "unlocked";

  const fill = isCompleted ? theme.completedFill
             : isToday ? theme.todayGlow
             : isUnlocked ? theme.unlockedFill
             : theme.stoneFill;
  const opacity = state === "locked" ? 0.5 : 1;

  if (shape === "crystal") {
    return (
      <g opacity={opacity}>
        <polygon
          points="20,2 32,12 28,32 12,32 8,12"
          fill={fill}
          stroke={theme.stoneStroke}
          strokeWidth="1.2"
          style={{
            filter: isToday ? `drop-shadow(0 0 12px ${theme.todayGlow})` : "none",
          }}
        />
        <polygon points="20,2 28,12 20,18 12,12" fill="white" opacity="0.35" />
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
          strokeWidth="1.2"
          style={{
            filter: isToday ? `drop-shadow(0 0 12px ${theme.todayGlow})` : "none",
          }}
        />
        <polygon points="20,3 33,11 20,18 7,11" fill="white" opacity="0.3" />
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
        strokeWidth="1.2"
        style={{
          filter: isToday ? `drop-shadow(0 0 12px ${theme.todayGlow})` : "none",
        }}
      />
      <ellipse cx="17" cy="13" rx="7" ry="3.5" fill="white" opacity="0.45" />
    </g>
  );
}

export default function KidsJourneyPath({
  ageSlug = "6-8",
  childSlug = "explorers",
  todayIndex = 1,
  completedDays = [],
  totalDays = 28,
  onStoneClick = null,
}) {
  const theme = THEMES[ageSlug] || THEMES["6-8"];
  const completedSet = new Set(completedDays);

  // Layout: a meandering serpentine path. Rows of 7 stones, alternating direction.
  const ROW_LEN = 7;
  const rows = Math.ceil(totalDays / ROW_LEN);
  const STONE_W = 56;
  const STONE_GAP = 18;
  const ROW_GAP = 38;
  const PAD = 24;
  const svgW = PAD * 2 + ROW_LEN * (STONE_W + STONE_GAP) - STONE_GAP;
  const svgH = PAD * 2 + rows * (STONE_W + ROW_GAP) - ROW_GAP;

  const stonePositions = [];
  for (let i = 0; i < totalDays; i++) {
    const row = Math.floor(i / ROW_LEN);
    const colInRow = i % ROW_LEN;
    const isReversed = row % 2 === 1;
    const col = isReversed ? (ROW_LEN - 1 - colInRow) : colInRow;
    const x = PAD + col * (STONE_W + STONE_GAP);
    const y = PAD + row * (STONE_W + ROW_GAP);
    stonePositions.push({ x, y, day: i + 1 });
  }

  // Build the connecting path (smooth curves between stone centers)
  const pathD = stonePositions.reduce((acc, p, i) => {
    const cx = p.x + STONE_W / 2;
    const cy = p.y + STONE_W / 2 - 8;
    if (i === 0) return `M ${cx} ${cy}`;
    const prev = stonePositions[i - 1];
    const pcx = prev.x + STONE_W / 2;
    const pcy = prev.y + STONE_W / 2 - 8;
    const midY = (pcy + cy) / 2;
    return `${acc} C ${pcx} ${midY}, ${cx} ${midY}, ${cx} ${cy}`;
  }, "");

  return (
    <section
      data-testid={`kids-journey-${ageSlug}`}
      className="relative rounded-3xl overflow-hidden"
      style={{ background: theme.bg, padding: "24px 16px 28px" }}
    >
      <div className="text-center mb-3">
        <p className="text-[10.5px] uppercase tracking-[0.28em] opacity-80"
           style={{ color: "#3d2a14" }}>
          {theme.label} Path · {totalDays} days
        </p>
        <p className="text-[26px] sm:text-[30px] leading-tight mt-1"
           style={{ fontFamily: "Caveat, cursive", color: "#2c2418", fontWeight: 600 }}>
          {theme.title}
        </p>
      </div>

      <svg
        viewBox={`0 0 ${svgW} ${svgH}`}
        className="w-full h-auto"
        style={{ maxWidth: 720, margin: "0 auto", display: "block" }}
        data-testid="kids-journey-svg"
      >
        {/* Glowing connector path under the stones */}
        <path
          d={pathD}
          fill="none"
          stroke={theme.pathColor}
          strokeWidth="6"
          strokeLinecap="round"
          opacity="0.55"
        />
        <path
          d={pathD}
          fill="none"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          opacity="0.4"
          strokeDasharray="2 6"
        />

        {/* Stones */}
        {stonePositions.map(({ x, y, day }) => {
          const state = completedSet.has(day) ? "completed"
                      : day === todayIndex ? "today"
                      : day < todayIndex ? "unlocked"
                      : "locked";
          return (
            <g
              key={day}
              transform={`translate(${x}, ${y})`}
              style={{ cursor: state === "locked" ? "default" : "pointer" }}
              onClick={() => {
                if (state === "locked") return;
                if (onStoneClick) onStoneClick(day);
              }}
              data-testid={`kids-journey-stone-${day}`}
            >
              <StoneShape
                shape={theme.stoneShape}
                state={state}
                theme={theme}
                day={day}
                todayIndex={todayIndex}
              />
              {state === "locked" ? (
                <g transform="translate(13, 10)" opacity="0.6">
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
                  x="20" y="22"
                  textAnchor="middle"
                  fontSize="11"
                  fontWeight="600"
                  fill="#3d2a14"
                  style={{ fontFamily: "Caveat, cursive", fontSize: 14 }}
                >
                  {day}
                </text>
              )}
            </g>
          );
        })}
      </svg>

      <div className="text-center mt-4">
        <Link
          to={`/kids-universe/${childSlug}/daily`}
          data-testid="kids-journey-cta"
          className="inline-flex items-center gap-1.5 text-[12.5px] tracking-[0.18em] uppercase"
          style={{ color: "#3d2a14", borderBottom: `1px dotted ${theme.stoneStroke}` }}
        >
          <Star size={11} style={{ color: theme.starColor }} />
          Today is Day {todayIndex}
        </Link>
      </div>
    </section>
  );
}
