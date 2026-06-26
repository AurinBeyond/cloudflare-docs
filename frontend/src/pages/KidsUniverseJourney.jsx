/**
 * KidsUniverseJourney.jsx — Phase 1 Static Skeleton
 *
 * §KIDS-UNIVERSE-PHASE-1 2026-02-27
 *
 * Plan reference: /app/memory/KIDS_UNIVERSE_PLAN.md
 *
 * Two-mode view architecture:
 *   Mode A (this Phase): MAP VIEW with curving path of 4 stones per zone.
 *   Mode B (Phase 2):   ROOM VIEW — state-swap, NOT a route change.
 *
 * Phase 1 scope:
 *   ✓ Public route, no auth required
 *   ✓ 3 zone tabs (Discovery / Exploration / Creation) with color theming
 *   ✓ 4 stones per zone laid on a curved alternating path
 *   ✓ Stone 1 = Open Demo, Stones 2-4 = Locked with 🔒
 *   ✓ Curved SVG line connecting stones
 *   ✓ Hover tooltip with room title
 *   ✓ Aurin Inner Guide portrait floating header
 *   ✓ "Open the Full Journey ✦" CTA → /pricing
 *   ✓ Parent Sign In top-right
 *
 * Out of scope (later phases): voice, real auth gating, room interiors,
 * file upload, star commitments. All button clicks on locked stones
 * open the "Unlock" modal; the open demo stone routes to a placeholder.
 *
 * 100% English UI per Anna's directive.
 */

import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Lock, X, ArrowLeft } from "lucide-react";
import { useAuth } from "@/contexts/AuthProvider";
import { api } from "@/lib/api";
import {
  StorytellingSanctumRoom,
  ReflectionSpaceRoom,
  StarChamberRoom,
  SecretAlbumRoom,
  FamilyAlbumFAB,
} from "@/pages/kids/KidsRooms";

const SERIF = '"Cormorant Garamond", "Playfair Display", Georgia, serif';

const AURIN_PORTRAIT = "/avatars/aurin-inner-guide.png";

// §ZONE-DEFINITIONS — locked palette and copy per age group.
// Phase 5 (2026-02-27) — per-age content tuning per Anna:
//   3-6  · Jungle Wonder         (sensory wonder, simplest words)
//   7-10 · Crystal Exploration   (mid-stage strategic intuition)
//   11-13 · Canopy Creation      (peak agency, building & creating)
const ZONES = {
  discovery: {
    slug: "discovery",
    ageLabel: "3-6 Years",
    titleLabel: "Jungle Wonder",
    subtitle: "The forest of wonder.",
    bgFrom: "#061d15",
    bgTo: "#0b291e",
    accent: "#10b981", // emerald
    accentSoft: "rgba(16,185,129,0.28)",
    accentGlow: "rgba(16,185,129,0.45)",
    pathStroke: "#10b981",
    description:
      "A gentle green jungle of sound and warm feeling. Small wonders, soft words, eyes closed if you wish.",
  },
  exploration: {
    slug: "exploration",
    ageLabel: "7-10 Years",
    titleLabel: "Crystal Exploration",
    subtitle: "The crystal cave of mystery.",
    bgFrom: "#07162c",
    bgTo: "#0d223f",
    accent: "#3b82f6", // blue
    accentSoft: "rgba(59,130,246,0.28)",
    accentGlow: "rgba(59,130,246,0.45)",
    pathStroke: "#3b82f6",
    description:
      "A deep blue crystal cave. Solving quiet riddles, growing strategic intuition through the power of hearing.",
  },
  creation: {
    slug: "creation",
    ageLabel: "11-13 Years",
    titleLabel: "Canopy Creation",
    subtitle: "The cosmic canopy of becoming.",
    bgFrom: "#1a0b2e",
    bgTo: "#25123e",
    accent: "#a855f7", // purple
    accentSoft: "rgba(168,85,247,0.28)",
    accentGlow: "rgba(168,85,247,0.45)",
    pathStroke: "#a855f7",
    description:
      "A cosmic violet canopy. Designing inner blueprints, finding your own voice in a noisy world.",
  },
};

// §STONE-DEFINITIONS — 4 stones per zone (Day 1-4 of the rotating cycle).
// Day 1 = Storytelling Sanctum (open demo); rest are premium-only.
// Phase 5: per-zone day labels stay neutral; tonal tuning happens
// inside the room copy (see KidsRooms.jsx).
const STONES = [
  {
    id: "node-1",
    dayLabel: "Day 1",
    title: "The Beginning",
    icon: "✨",
    roomType: "fairytale_room",
    roomLabel: "Storytelling Sanctum",
    freeDemo: true,
  },
  {
    id: "node-2",
    dayLabel: "Day 2",
    title: "My Day",
    icon: "🧩",
    roomType: "puzzle_room",
    roomLabel: "Reflection Space",
    freeDemo: false,
  },
  {
    id: "node-3",
    dayLabel: "Day 3",
    title: "Aurin's Star",
    icon: "⭐",
    roomType: "star_reward_room",
    roomLabel: "Aurin's Star Chamber",
    freeDemo: false,
  },
  {
    id: "node-4",
    dayLabel: "Day 4",
    title: "Secret Album",
    icon: "📸",
    roomType: "private_album_room",
    roomLabel: "The Secret Album",
    freeDemo: false,
  },
];

function ZoneTab({ zone, active, onClick }) {
  return (
    <button
      type="button"
      data-testid={`kids-journey-zone-tab-${zone.slug}`}
      onClick={onClick}
      className="px-5 py-2.5 rounded-full transition-all duration-500 text-[12px] tracking-[0.28em] uppercase font-medium"
      style={{
        fontFamily: SERIF,
        background: active ? "#e8e1d5" : "rgba(232,225,213,0.04)",
        color: active ? "#0b0a08" : "#bcb4a3",
        border: `1px solid ${active ? zone.accentSoft : "rgba(232,225,213,0.08)"}`,
        boxShadow: active ? `0 0 26px ${zone.accentGlow}` : "none",
      }}
    >
      {zone.ageLabel} · {zone.titleLabel}
    </button>
  );
}

function Stone({ stone, index, zone, onSelect }) {
  const offsetX = index % 2 === 0 ? "translateX(-6rem)" : "translateX(6rem)";
  const locked = !stone.freeDemo;
  return (
    <div
      className="relative"
      style={{ transform: offsetX }}
    >
      <button
        type="button"
        data-testid={`kids-journey-stone-${stone.id}`}
        onClick={() => onSelect(stone)}
        className="group relative w-[7.5rem] h-[7.5rem] rounded-[2.2rem] flex flex-col items-center justify-center transition-all duration-500 hover:scale-[1.06]"
        style={{
          background: `linear-gradient(135deg, ${zone.accent} 0%, rgba(232,225,213,0.18) 100%)`,
          border: `1px solid ${zone.accentSoft}`,
          boxShadow: locked
            ? "0 12px 36px rgba(0,0,0,0.55), inset 0 0 24px rgba(0,0,0,0.32)"
            : `0 12px 36px rgba(0,0,0,0.55), 0 0 30px ${zone.accentGlow}`,
        }}
      >
        {/* Lock overlay — soft frosted blur for locked stones */}
        {locked && (
          <div
            className="absolute inset-0 rounded-[2.2rem] flex items-center justify-center"
            style={{
              background: "rgba(11,10,8,0.55)",
              backdropFilter: "blur(2.5px)",
              WebkitBackdropFilter: "blur(2.5px)",
            }}
          >
            <Lock
              size={20}
              color="#c4a46b"
              strokeWidth={1.5}
              data-testid={`kids-journey-stone-${stone.id}-lock`}
            />
          </div>
        )}
        <span
          className="text-[28px] mb-1 select-none transition-transform duration-500 group-hover:scale-110"
          style={{ filter: locked ? "grayscale(0.45) opacity(0.65)" : "none" }}
        >
          {stone.icon}
        </span>
        <span
          className="text-[10px] font-semibold tracking-[0.16em] uppercase px-2 py-0.5 rounded-full"
          style={{
            color: "#0b0a08",
            background: "rgba(255,253,249,0.88)",
            opacity: locked ? 0.6 : 1,
          }}
        >
          {stone.dayLabel}
        </span>
      </button>

      {/* Tooltip on hover */}
      <div
        className="pointer-events-none absolute left-1/2 -translate-x-1/2 top-full mt-3 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-30"
        data-testid={`kids-journey-stone-${stone.id}-tooltip`}
      >
        <div
          className="px-4 py-2 rounded-xl shadow-2xl"
          style={{
            fontFamily: SERIF,
            background: "#0b0a08",
            border: "1px solid rgba(196,164,107,0.28)",
            color: "#e8e1d5",
            fontSize: "12px",
            letterSpacing: "0.08em",
          }}
        >
          <span style={{ color: "#c4a46b" }}>{stone.title}</span>
          <span style={{ color: "rgba(232,225,213,0.55)", marginLeft: "8px" }}>
            · {stone.roomLabel}
          </span>
        </div>
      </div>
    </div>
  );
}

// §CURVED-SVG-PATH — gentle S-curve connecting the 4 stones.
function CurvedPath({ zone }) {
  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none"
      viewBox="0 0 400 700"
      preserveAspectRatio="none"
      data-testid="kids-journey-curved-path"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={`path-grad-${zone.slug}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={zone.pathStroke} stopOpacity="0" />
          <stop offset="20%" stopColor={zone.pathStroke} stopOpacity="0.55" />
          <stop offset="80%" stopColor={zone.pathStroke} stopOpacity="0.55" />
          <stop offset="100%" stopColor={zone.pathStroke} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path
        d="M 130 60 Q 280 200, 130 340 Q -20 480, 130 620"
        fill="none"
        stroke={`url(#path-grad-${zone.slug})`}
        strokeWidth="3"
        strokeLinecap="round"
        style={{ filter: `drop-shadow(0 0 12px ${zone.pathStroke})` }}
      />
      <path
        d="M 130 60 Q 280 200, 130 340 Q -20 480, 130 620"
        fill="none"
        stroke={zone.pathStroke}
        strokeWidth="1"
        strokeLinecap="round"
        strokeDasharray="2 8"
        strokeOpacity="0.45"
      />
    </svg>
  );
}

function UnlockModal({ open, onClose }) {
  const navigate = useNavigate();
  if (!open) return null;
  return (
    <div
      role="dialog"
      aria-modal="true"
      data-testid="kids-journey-unlock-modal"
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{
        background: "rgba(11,10,8,0.78)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
      }}
    >
      <div
        className="relative max-w-[480px] w-full rounded-[1.5rem] p-10"
        style={{
          background: "rgba(18,16,13,0.94)",
          border: "1px solid rgba(196,164,107,0.28)",
          fontFamily: SERIF,
          boxShadow: "0 30px 80px rgba(0,0,0,0.68)",
        }}
      >
        <button
          type="button"
          data-testid="kids-journey-unlock-close"
          onClick={onClose}
          aria-label="Close"
          className="absolute top-5 right-5 text-[#7a7468] hover:text-[#e8e1d5] transition-colors"
        >
          <X size={18} />
        </button>
        <p
          className="text-[11px] tracking-[0.42em] uppercase text-[#c4a46b] mb-6 text-center"
          style={{ fontFamily: SERIF }}
        >
          ✦ The path waits
        </p>
        <h3
          className="text-[28px] leading-[1.25] font-light italic text-[#e8e1d5] mb-6 text-center"
          style={{ fontFamily: SERIF }}
        >
          This stone is held in quiet
          <br />
          until the doors open.
        </h3>
        <p className="text-[15px] leading-[1.85] text-[#bcb4a3] font-light text-center mb-8">
          Each stone holds a small ritual — a tale, a reflection, a star, a
          memory. They reveal one a day, only inside the full journey.
        </p>
        <div className="flex flex-col gap-3">
          <button
            type="button"
            data-testid="kids-journey-unlock-discover"
            onClick={() => {
              onClose();
              navigate("/pricing");
            }}
            className="w-full py-3.5 rounded-full text-[12px] tracking-[0.22em] uppercase font-medium transition-all"
            style={{
              background: "#c4a46b",
              color: "#0b0a08",
              fontFamily: SERIF,
              boxShadow: "0 0 28px rgba(196,164,107,0.4)",
            }}
          >
            Discover the Parents’ Room →
          </button>
          <Link
            to="/portal"
            data-testid="kids-journey-unlock-signin"
            className="w-full py-3 text-center text-[12px] tracking-[0.22em] uppercase text-[#bcb4a3] hover:text-[#e8e1d5] transition-colors"
            style={{ fontFamily: SERIF }}
          >
            I already have an account — Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function KidsUniverseJourney() {
  const { zone: zoneParam } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const currentZoneKey =
    zoneParam && ZONES[zoneParam] ? zoneParam : "discovery";
  const zone = ZONES[currentZoneKey];

  const [unlockOpen, setUnlockOpen] = useState(false);
  const [activeRoom, setActiveRoom] = useState(null);
  const [progress, setProgress] = useState({
    unlocked_nodes: ["node-1"],
    premium: false,
    next_unlock_at: null,
  });

  const isPremium = !!progress.premium;
  const isSignedIn = !!user;

  // Load progress whenever zone or auth state changes
  useEffect(() => {
    let alive = true;
    api
      .get(`/kids-journey/progress/${zone.slug}`)
      .then((r) => {
        if (alive) setProgress(r.data || progress);
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [zone.slug, user?.user_id]);

  const onSelectStone = (stone) => {
    const unlocked = progress.unlocked_nodes || ["node-1"];
    const stoneUnlocked = unlocked.includes(stone.id);
    if (stone.id === "node-1" || stoneUnlocked) {
      setActiveRoom(stone);
      return;
    }
    // Locked stone — if user is premium they CAN unlock the next one
    // (we still open the room; backend enforces 24h cap). If not premium
    // or not signed in, show unlock modal.
    if (isPremium) {
      setActiveRoom(stone);
    } else {
      setUnlockOpen(true);
    }
  };

  const handleStoneUnlocked = (nodeId) => {
    setProgress((p) => {
      const cur = p.unlocked_nodes || [];
      if (cur.includes(nodeId)) return p;
      return { ...p, unlocked_nodes: [...cur, nodeId] };
    });
  };

  const changeZone = (slug) => {
    setActiveRoom(null);
    navigate(`/kids-universe/journey/${slug}`);
  };

  const bgStyle = useMemo(
    () => ({
      background: `linear-gradient(180deg, ${zone.bgFrom} 0%, ${zone.bgTo} 100%)`,
    }),
    [zone]
  );

  // §MODE-B — render the active room as a state-swap (NOT a route change).
  if (activeRoom) {
    const back = () => setActiveRoom(null);
    if (activeRoom.roomType === "fairytale_room") {
      const goToAlbum = () => {
        const albumStone = STONES.find((s) => s.roomType === "private_album_room");
        if (albumStone) setActiveRoom(albumStone);
      };
      return (
        <StorytellingSanctumRoom
          zone={zone}
          isPremium={isPremium}
          onBack={back}
          onStoneUnlocked={handleStoneUnlocked}
          onOpenAlbum={goToAlbum}
        />
      );
    }
    if (activeRoom.roomType === "puzzle_room") {
      return (
        <ReflectionSpaceRoom
          zone={zone}
          onBack={back}
          onStoneUnlocked={handleStoneUnlocked}
        />
      );
    }
    if (activeRoom.roomType === "star_reward_room") {
      return (
        <StarChamberRoom
          zone={zone}
          onBack={back}
          onStoneUnlocked={handleStoneUnlocked}
        />
      );
    }
    if (activeRoom.roomType === "private_album_room") {
      return (
        <SecretAlbumRoom
          zone={zone}
          onBack={back}
          onStoneUnlocked={handleStoneUnlocked}
        />
      );
    }
  }

  // Decorate each stone with its current lock state from progress.
  const unlockedSet = new Set(progress.unlocked_nodes || ["node-1"]);
  const stonesWithState = STONES.map((s) => ({
    ...s,
    freeDemo: s.id === "node-1" || unlockedSet.has(s.id),
  }));

  return (
    <div
      data-testid="kids-universe-journey-root"
      className="min-h-screen w-full text-[#e8e1d5] relative overflow-hidden"
      style={{ ...bgStyle, fontFamily: SERIF }}
    >
      {/* Top bar */}
      <header className="w-full border-b border-[rgba(196,164,107,0.08)] py-5 relative z-10">
        <div className="max-w-[1180px] mx-auto px-6 sm:px-10 flex items-center justify-between">
          <Link
            to="/"
            data-testid="kids-journey-back-home"
            className="text-[11px] tracking-[0.32em] uppercase text-[#a59f93] hover:text-[#e8e1d5] transition-colors"
          >
            ← Back to Matrix Aurin
          </Link>
          <Link
            to="/portal"
            data-testid="kids-journey-parent-signin"
            className="text-[11px] tracking-[0.32em] uppercase text-[#c4a46b] hover:text-[#e8e1d5] transition-colors"
          >
            Parent Sign In →
          </Link>
        </div>
      </header>

      {/* Hero with portrait + tabs */}
      <section className="max-w-[1180px] mx-auto px-6 sm:px-10 pt-20 pb-12 relative z-10 text-center">
        <p
          className="text-[12px] tracking-[0.42em] uppercase mb-7"
          style={{ color: zone.accent, fontFamily: SERIF }}
          data-testid="kids-journey-eyebrow"
        >
          ✦ Kids Universe Journey
        </p>
        <h1
          className="text-[40px] sm:text-[58px] leading-[1.08] font-light italic text-[#e8e1d5] mb-6"
          style={{ fontFamily: SERIF }}
          data-testid="kids-journey-title"
        >
          {zone.subtitle}
        </h1>
        <p className="text-[16px] sm:text-[17px] leading-[1.85] text-[#bcb4a3] font-light max-w-[58ch] mx-auto mb-12">
          {zone.description}
        </p>

        {/* Zone tabs */}
        <div className="flex flex-wrap items-center justify-center gap-2">
          {Object.values(ZONES).map((z) => (
            <ZoneTab
              key={z.slug}
              zone={z}
              active={z.slug === zone.slug}
              onClick={() => changeZone(z.slug)}
            />
          ))}
        </div>
      </section>

      {/* The Glowing Pathway — curved path with 4 stones */}
      <section className="relative z-10 max-w-[640px] mx-auto px-6 pb-24">
        <div className="relative" style={{ height: "740px" }}>
          <CurvedPath zone={zone} />
          <div
            className="absolute inset-0 flex flex-col items-center justify-around"
            style={{ paddingTop: "1rem", paddingBottom: "1rem" }}
            data-testid="kids-journey-stones-list"
          >
            {stonesWithState.map((s, i) => (
              <Stone
                key={s.id}
                stone={s}
                index={i}
                zone={zone}
                onSelect={onSelectStone}
              />
            ))}
          </div>
        </div>

        <p
          className="text-center text-[12.5px] italic text-[#7a7468] mt-6 leading-[1.85] font-light"
          style={{ fontFamily: SERIF }}
        >
          One stone at a time. Tomorrow's path reveals itself.
        </p>
      </section>

      {/* Footer CTA */}
      <footer className="w-full border-t border-[rgba(196,164,107,0.08)] py-12 relative z-10">
        <div className="max-w-[820px] mx-auto px-6 sm:px-10 text-center">
          <Link
            to="/pricing"
            data-testid="kids-journey-cta-pricing"
            className="inline-flex items-center justify-center px-9 py-3.5 rounded-full text-[12px] tracking-[0.28em] uppercase font-medium transition-all"
            style={{
              background: "#c4a46b",
              color: "#0b0a08",
              fontFamily: SERIF,
              boxShadow: `0 0 30px ${zone.accentGlow}`,
            }}
          >
            Open the Full Journey ✦
          </Link>
        </div>
      </footer>

      <UnlockModal open={unlockOpen} onClose={() => setUnlockOpen(false)} />
      <FamilyAlbumFAB isPremium={isPremium} />
    </div>
  );
}
