/**
 * CuratorIntroCard.jsx — §CURATOR-INTROS 2026-05-28
 *
 * Unified 15-second curator introduction card used at the top of
 * each of the four adult rooms (Kaelan / Grace / Sara / Alistair).
 *
 * Plays a pre-rendered MP3 from /public/audio/{slug}-intro.mp3.
 * Zero backend round-trip, zero token cost, zero latency. The card
 * is the same shape and beat across all four rooms so the platform
 * feels ritualistic and consistent.
 *
 * Per-room only the slug, palette, blurb, and portrait change.
 *
 * 100% English UI.
 */

import { useRef, useState } from "react";
import { Play, Pause } from "lucide-react";

const SERIF = '"Cormorant Garamond", Georgia, serif';

export default function CuratorIntroCard({
  slug,           // "kaelan" | "grace" | "sara" | "alistair"
  name,           // "Kaelan"
  eyebrow,        // "✦ Meet your curator"
  blurb,          // 1-sentence room-specific tease
  accent,         // hex (palette colour for the room)
  accentGlow,     // rgba shadow for the portrait halo
  background,     // CSS gradient string
  border,         // CSS border colour
}) {
  const audioRef = useRef(null);
  const [state, setState] = useState("idle"); // idle | playing | ended

  const onToggle = () => {
    const a = audioRef.current;
    if (!a) return;
    if (state === "playing") {
      a.pause();
      a.currentTime = 0;
      setState("idle");
      return;
    }
    a.currentTime = 0;
    a.play().then(() => setState("playing")).catch(() => setState("idle"));
  };

  return (
    <div
      data-testid={`${slug}-intro-card`}
      className="rounded-[1.5rem] p-7 md:p-8 flex items-center gap-5 md:gap-7"
      style={{
        background,
        border,
        boxShadow: `0 12px 40px rgba(0,0,0,0.45), 0 0 28px ${accentGlow}`,
      }}
    >
      <div
        className="shrink-0 rounded-full overflow-hidden"
        style={{
          width: 84,
          height: 84,
          border: `1px solid ${accent}`,
          boxShadow: `0 0 26px ${accentGlow}`,
        }}
      >
        <img
          src={`/avatars/${slug}.png`}
          alt={`${name}, curator of this room`}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      </div>
      <div className="flex-1 min-w-0">
        <p
          className="text-[10.5px] tracking-[0.36em] uppercase mb-1.5"
          style={{ color: "#a59f93", fontFamily: SERIF }}
          data-testid={`${slug}-intro-eyebrow`}
        >
          {eyebrow}
        </p>
        <p
          className="text-[24px] md:text-[28px] leading-[1.15] font-light italic mb-1.5"
          style={{ color: "#e8e1d5", fontFamily: SERIF }}
          data-testid={`${slug}-intro-name`}
        >
          {name}
        </p>
        <p
          className="text-[13px] md:text-[13.5px] leading-[1.7] italic"
          style={{ color: "#bcb4a3", fontFamily: SERIF }}
        >
          {blurb}
        </p>
      </div>
      <button
        type="button"
        onClick={onToggle}
        data-testid={`${slug}-intro-play`}
        aria-label={state === "playing" ? "Stop introduction" : `Play ${name} introduction`}
        className="shrink-0 inline-flex items-center justify-center rounded-full transition-all"
        style={{
          width: 56,
          height: 56,
          background: accent,
          color: "#0b0a08",
          boxShadow: `0 0 22px ${accentGlow}`,
        }}
      >
        {state === "playing" ? <Pause size={22} /> : <Play size={22} className="ml-0.5" />}
      </button>
      <audio
        ref={audioRef}
        src={`/audio/${slug}-intro.mp3`}
        preload="auto"
        onEnded={() => setState("ended")}
        onError={() => setState("idle")}
        data-testid={`${slug}-intro-audio`}
      />
    </div>
  );
}

// Palette presets shared across the four rooms.
export const CURATOR_PALETTES = {
  kaelan: {
    name: "Kaelan",
    accent: "#8b8478",
    accentGlow: "rgba(139,132,120,0.32)",
    background: "linear-gradient(160deg, #131210 0%, #1c1a16 100%)",
    border: "1px solid rgba(139,132,120,0.22)",
    blurb: "A quiet listener of the body. Press play for a short hello — about fifteen seconds.",
  },
  grace: {
    name: "Grace",
    accent: "#d4a85a",
    accentGlow: "rgba(212,168,90,0.32)",
    background: "linear-gradient(160deg, #14110d 0%, #1d1812 100%)",
    border: "1px solid rgba(212,168,90,0.22)",
    blurb: "An empathic mirror, never a judge. Press play for a short hello — about fifteen seconds.",
  },
  sara: {
    name: "Sara",
    accent: "#d68fa3",
    accentGlow: "rgba(214,143,163,0.30)",
    background: "linear-gradient(160deg, #14101a 0%, #1c1620 100%)",
    border: "1px solid rgba(214,143,163,0.22)",
    blurb: "A warm elder for parents. Press play for a short hello — about fifteen seconds.",
  },
  alistair: {
    name: "Alistair",
    accent: "#6a8fbe",
    accentGlow: "rgba(106,143,190,0.30)",
    background: "linear-gradient(160deg, #0d1320 0%, #131a2c 100%)",
    border: "1px solid rgba(106,143,190,0.22)",
    blurb: "A precise strategist for high-performers. Press play for a short hello — about fifteen seconds.",
  },
};
