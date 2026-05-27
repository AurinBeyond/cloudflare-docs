/**
 * AdultRooms.jsx — §ADULT-V3-PHASE-1-2 2026-02-27
 *
 * The map page for the Adult v3.0 mentor sanctuary.
 * Four characters; Kaelan ships first (Phase 2). Grace / Sara /
 * Alistair appear as "Coming soon" tiles until Phase 4.
 *
 * Plan reference: /app/memory/ADULT_V3_VISION.md
 *
 * 100% English UI.
 */

import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import KaelanRoom from "@/pages/adult/KaelanRoom";

const SERIF = '"Cormorant Garamond", "Playfair Display", Georgia, serif';

const ROOMS = {
  grace: {
    slug: "grace",
    name: "Grace",
    subtitle: "The Art of Self-Belonging",
    accent: "#d4a85a",
    accentGlow: "rgba(212,168,90,0.42)",
    bgFrom: "#110e0b",
    bgTo: "#1c1611",
    portrait: "/avatars/grace.png",
    available: false,
    description: "An amber room. You stop treating yourself as a repair project.",
  },
  kaelan: {
    slug: "kaelan",
    name: "Kaelan",
    subtitle: "The Unshakable Center",
    accent: "#8b8478",
    accentGlow: "rgba(139,132,120,0.38)",
    bgFrom: "#0b0b0a",
    bgTo: "#141412",
    portrait: "/avatars/kaelan.png",
    available: true,
    description: "A granite room. You stop arguing with the storm.",
  },
  sara: {
    slug: "sara",
    name: "Sara",
    subtitle: "The Freedom of Boundaries",
    accent: "#d68fa3",
    accentGlow: "rgba(214,143,163,0.38)",
    bgFrom: "#1c1116",
    bgTo: "#27181f",
    portrait: "/avatars/sara.png",
    available: false,
    description: "A rose room. You see others clearly; you keep the sanctuary clean.",
  },
  alistair: {
    slug: "alistair",
    name: "Alistair",
    subtitle: "The Grand Architecture",
    accent: "#6a8fbe",
    accentGlow: "rgba(106,143,190,0.38)",
    bgFrom: "#08101f",
    bgTo: "#0d1830",
    portrait: "/avatars/alistair.png",
    available: false,
    description: "A navy room. You strip the label and see the structure.",
  },
};

function RoomCard({ room, active, onClick }) {
  return (
    <button
      type="button"
      data-testid={`adult-room-card-${room.slug}`}
      onClick={onClick}
      disabled={!room.available}
      className="relative text-left p-7 rounded-[1.5rem] transition-all duration-500 group disabled:cursor-not-allowed"
      style={{
        background: `linear-gradient(160deg, ${room.bgFrom} 0%, ${room.bgTo} 100%)`,
        border: `1px solid ${active ? room.accent : "rgba(232,225,213,0.08)"}`,
        boxShadow: room.available
          ? `0 12px 40px rgba(0,0,0,0.55), 0 0 32px ${room.accentGlow}`
          : "0 12px 40px rgba(0,0,0,0.55)",
        opacity: room.available ? 1 : 0.78,
        minHeight: "260px",
      }}
    >
      {room.portrait && (
        <div className="flex items-start gap-5 mb-5">
          <div
            className="shrink-0 rounded-full overflow-hidden"
            style={{
              width: 72,
              height: 72,
              border: `1px solid ${room.accent}`,
              boxShadow: room.available
                ? `0 0 22px ${room.accentGlow}`
                : "0 6px 18px rgba(0,0,0,0.4)",
              filter: room.available ? "none" : "grayscale(30%)",
            }}
          >
            <img
              src={room.portrait}
              alt={`${room.name} portrait`}
              data-testid={`adult-room-portrait-${room.slug}`}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
          <div className="flex-1 pt-1">
            <p
              className="text-[10.5px] tracking-[0.36em] uppercase mb-2"
              style={{ color: room.accent, fontFamily: SERIF }}
            >
              ✦ {room.subtitle}
            </p>
            <h3
              className="text-[34px] leading-[1.05] font-light italic"
              style={{ color: "#e8e1d5", fontFamily: SERIF }}
            >
              {room.name}
            </h3>
          </div>
        </div>
      )}

      <p
        className="text-[14px] leading-[1.75] font-light italic"
        style={{ color: "#a59f93", fontFamily: SERIF }}
      >
        {room.description}
      </p>

      {room.available ? (
        <span
          className="absolute bottom-6 right-7 text-[10.5px] tracking-[0.28em] uppercase"
          style={{ color: room.accent, fontFamily: SERIF }}
        >
          Enter the room →
        </span>
      ) : (
        <span
          className="absolute bottom-6 right-7 text-[10.5px] tracking-[0.28em] uppercase"
          style={{ color: "#5a554c", fontFamily: SERIF }}
        >
          Opening soon
        </span>
      )}
    </button>
  );
}

export default function AdultRooms() {
  const { room: roomParam } = useParams();
  const navigate = useNavigate();
  const [activeRoom, setActiveRoom] = useState(
    roomParam && ROOMS[roomParam] && ROOMS[roomParam].available ? roomParam : null
  );

  const openRoom = (slug) => {
    const r = ROOMS[slug];
    if (!r || !r.available) return;
    setActiveRoom(slug);
    navigate(`/adult-rooms/${slug}`);
  };

  const backToMap = () => {
    setActiveRoom(null);
    navigate("/adult-rooms");
  };

  // §MODE-B — render the active room as a state-swap.
  if (activeRoom === "kaelan") {
    return <KaelanRoom room={ROOMS.kaelan} onBack={backToMap} />;
  }

  return (
    <div
      data-testid="adult-rooms-root"
      className="min-h-screen w-full text-[#e8e1d5] relative overflow-hidden"
      style={{
        background: "linear-gradient(180deg, #0b0a08 0%, #141210 100%)",
        fontFamily: SERIF,
      }}
    >
      <header className="w-full border-b border-[rgba(196,164,107,0.08)] py-5">
        <div className="max-w-[1180px] mx-auto px-6 sm:px-10 flex items-center justify-between">
          <Link
            to="/"
            data-testid="adult-rooms-back-home"
            className="text-[11px] tracking-[0.32em] uppercase text-[#a59f93] hover:text-[#e8e1d5] transition-colors"
          >
            ← Back to Matrix Aurin
          </Link>
          <Link
            to="/portal"
            data-testid="adult-rooms-signin"
            className="text-[11px] tracking-[0.32em] uppercase text-[#c4a46b] hover:text-[#e8e1d5] transition-colors"
          >
            Sign In →
          </Link>
        </div>
      </header>

      <section className="max-w-[1180px] mx-auto px-6 sm:px-10 pt-20 pb-12 text-center">
        <p
          className="text-[12px] tracking-[0.42em] uppercase mb-7 text-[#c4a46b]"
          data-testid="adult-rooms-eyebrow"
        >
          ✦ The Architecture of Sovereignty
        </p>
        <h1
          className="text-[40px] sm:text-[58px] leading-[1.08] font-light italic text-[#e8e1d5] mb-6"
          data-testid="adult-rooms-title"
        >
          Four quiet rooms.<br />
          One unshakable center.
        </h1>
        <p className="text-[16px] sm:text-[17px] leading-[1.85] text-[#bcb4a3] font-light max-w-[64ch] mx-auto mb-4">
          A private mentor sanctuary for people who carry weight — founders,
          parents, builders, leaders. Not a meditation app. Not a therapy
          platform. A small, deliberate place where the world goes quiet so
          you can hear yourself again.
        </p>
        <p className="text-[14px] italic text-[#7a7468] max-w-[58ch] mx-auto">
          Murdub olukord, mitte minu meel. — The situation breaks; the mind does not.
        </p>
      </section>

      <section className="max-w-[1080px] mx-auto px-6 sm:px-10 pb-24 grid grid-cols-1 sm:grid-cols-2 gap-6">
        {Object.values(ROOMS).map((r) => (
          <RoomCard
            key={r.slug}
            room={r}
            active={activeRoom === r.slug}
            onClick={() => openRoom(r.slug)}
          />
        ))}
      </section>

      <footer className="w-full border-t border-[rgba(196,164,107,0.08)] py-10">
        <div className="max-w-[820px] mx-auto px-6 sm:px-10 text-center">
          <p className="text-[11px] tracking-[0.32em] uppercase text-[#7a7468]">
            Matrix Aurin · A sanctuary, not a service.
          </p>
        </div>
      </footer>
    </div>
  );
}
