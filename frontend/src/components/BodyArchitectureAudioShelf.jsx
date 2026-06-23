/**
 * BodyArchitectureAudioShelf.jsx — §BODY-ARCH-AUDIO-SHELF 2026-05-28
 *
 * Replaces the single Week 1 PoC player with a four-week shelf.
 * Each week is its own pre-rendered Daniel-voice masterclass MP3
 * (~5 min). Founder-locked content: The Breath, Listening to the
 * Armor, The Radical Pause, Coming Home to the Body.
 *
 * Static MP3 playback, zero per-listen cost, zero token burn.
 * No auth gate — Week 1 is the founder's "first taste" for the
 * world. Future iteration may gate Weeks 2-4 behind a paid unlock
 * (price TBD after Faas 3 pricing decision).
 *
 * 100% English UI.
 */

import { useRef, useState } from "react";
import { Play, Pause, Wind, Hand, Moon, Compass } from "lucide-react";

const SERIF = '"Cormorant Garamond", Georgia, serif';

const WEEKS = [
  {
    id: "week1",
    src: "/audio/body-architecture-week1-breath.mp3",
    eyebrow: "Week 1 · The First Key",
    title: "The Breath",
    blurb: "The body's oldest companion. Three long exhales, three times a day, for seven days.",
    icon: Wind,
    accent: "#b69f7e",
  },
  {
    id: "week2",
    src: "/audio/body-architecture-week2-armor.mp3",
    eyebrow: "Week 2 · The Second Key",
    title: "Listening to the Armor",
    blurb: "The long letter the body wrote when the world was loud. We read it slowly, three times this week.",
    icon: Hand,
    accent: "#c9866b",
  },
  {
    id: "week3",
    src: "/audio/body-architecture-week3-pause.mp3",
    eyebrow: "Week 3 · The Third Key",
    title: "The Radical Pause",
    blurb: "Fifteen minutes a day of doing nothing. One small obligation, removed. Seven days.",
    icon: Moon,
    accent: "#7ba888",
  },
  {
    id: "week4",
    src: "/audio/body-architecture-week4-home.mp3",
    eyebrow: "Week 4 · The Fourth Key",
    title: "Coming Home to the Body",
    blurb: "No protocol. Only one question, asked kindly: where are you, today?",
    icon: Compass,
    accent: "#9b7ba8",
  },
];

function WeekCard({ week, active, onPlay }) {
  const Icon = week.icon;
  return (
    <button
      type="button"
      onClick={onPlay}
      data-testid={`body-arch-${week.id}-card`}
      className="text-left rounded-[1.1rem] p-5 transition-all duration-300"
      style={{
        background: active
          ? `linear-gradient(160deg, #1a1814 0%, #221d16 100%)`
          : "linear-gradient(160deg, #131210 0%, #1c1a16 100%)",
        border: active
          ? `1px solid ${week.accent}66`
          : "1px solid rgba(232,225,213,0.08)",
        boxShadow: active
          ? `0 0 28px ${week.accent}33, 0 12px 32px rgba(0,0,0,0.45)`
          : "0 8px 22px rgba(0,0,0,0.35)",
        fontFamily: SERIF,
      }}
    >
      <div className="flex items-start gap-3 mb-3">
        <div
          className="shrink-0 rounded-full flex items-center justify-center"
          style={{
            width: 38,
            height: 38,
            background: `${week.accent}1f`,
            border: `1px solid ${week.accent}66`,
          }}
        >
          <Icon size={17} color={week.accent} strokeWidth={1.5} />
        </div>
        <div className="flex-1 min-w-0">
          <p
            className="text-[10px] tracking-[0.30em] uppercase mb-1"
            style={{ color: "#a59f93" }}
          >
            {week.eyebrow}
          </p>
          <p
            className="text-[19px] leading-[1.15] font-light italic"
            style={{ color: "#e8e1d5" }}
          >
            {week.title}
          </p>
        </div>
      </div>
      <p
        className="text-[12.5px] leading-[1.7] italic"
        style={{ color: "#a59f93" }}
      >
        {week.blurb}
      </p>
    </button>
  );
}

export default function BodyArchitectureAudioShelf() {
  const audioRef = useRef(null);
  const [activeId, setActiveId] = useState(WEEKS[0].id);
  const [state, setState] = useState("idle"); // idle | playing | paused
  const [pos, setPos] = useState(0);

  const active = WEEKS.find((w) => w.id === activeId);

  const play = (week) => {
    const a = audioRef.current;
    if (!a) return;
    if (week.id === activeId && state === "playing") {
      a.pause();
      setState("paused");
      return;
    }
    if (week.id !== activeId) {
      setActiveId(week.id);
      a.src = week.src;
      setPos(0);
    }
    a.play().then(() => setState("playing")).catch(() => setState("idle"));
  };

  const onTime = () => {
    const a = audioRef.current;
    if (!a || !a.duration || isNaN(a.duration)) return;
    setPos(a.currentTime / a.duration);
  };

  return (
    <div data-testid="body-arch-audio-shelf">
      <div
        className="rounded-[1.5rem] p-6 md:p-7 mb-5"
        style={{
          background: "linear-gradient(160deg, #131210 0%, #1c1a16 100%)",
          border: `1px solid ${active.accent}40`,
          boxShadow: `0 12px 40px rgba(0,0,0,0.45), 0 0 28px ${active.accent}28`,
          fontFamily: SERIF,
        }}
      >
        <div className="flex items-center gap-4 mb-4">
          <p
            className="text-[10.5px] tracking-[0.36em] uppercase flex-1"
            style={{ color: "#a59f93" }}
          >
            ✦ Now playing · {active.eyebrow}
          </p>
          <span
            className="text-[10px] tracking-[0.30em] uppercase"
            style={{ color: "#7a7468" }}
          >
            ~ 5 min · Daniel voice · headphones recommended
          </span>
        </div>

        <p
          className="text-[24px] md:text-[28px] leading-[1.15] font-light italic mb-5"
          style={{ color: "#e8e1d5" }}
          data-testid="body-arch-active-title"
        >
          {active.title}
        </p>

        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => play(active)}
            data-testid="body-arch-active-toggle"
            aria-label={state === "playing" ? "Pause" : "Play"}
            className="shrink-0 inline-flex items-center justify-center rounded-full transition-all"
            style={{
              width: 52,
              height: 52,
              background: active.accent,
              color: "#0b0a08",
              boxShadow: `0 0 22px ${active.accent}55`,
            }}
          >
            {state === "playing" ? <Pause size={20} /> : <Play size={20} className="ml-0.5" />}
          </button>
          <div className="flex-1">
            <div
              className="h-[3px] rounded-full overflow-hidden"
              style={{ background: "rgba(232,225,213,0.10)" }}
              data-testid="body-arch-active-progress"
            >
              <div
                style={{
                  width: `${Math.round(pos * 100)}%`,
                  height: "100%",
                  background: active.accent,
                  transition: "width 250ms linear",
                }}
              />
            </div>
          </div>
        </div>
        <audio
          ref={audioRef}
          src={active.src}
          preload="auto"
          onTimeUpdate={onTime}
          onEnded={() => { setState("idle"); setPos(0); }}
          onError={() => setState("idle")}
          data-testid="body-arch-audio-el"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {WEEKS.map((w) => (
          <WeekCard
            key={w.id}
            week={w}
            active={w.id === activeId}
            onPlay={() => play(w)}
          />
        ))}
      </div>
    </div>
  );
}
