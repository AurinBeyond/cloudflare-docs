/**
 * Week1PreviewPlayer.jsx — §BODY-ARCH-WEEK1 2026-05-28
 *
 * A small, restrained audio player that lets every visitor (signed-in
 * or not) preview the very first master-class of The Body Architecture:
 * "The First Key — The Breath" (~5 minutes, Daniel voice).
 *
 * Founder PoC directive: ship one luxury masterclass before generating
 * the other three weeks. Founder must audition on live preview and
 * approve cadence/tone before batch generation.
 *
 * Static MP3, zero token cost, no auth gate.
 *
 * 100% English UI.
 */

import { useRef, useState } from "react";
import { Play, Pause, Wind } from "lucide-react";

const SERIF = '"Cormorant Garamond", Georgia, serif';
const AUDIO_SRC = "/audio/body-architecture-week1-breath.mp3";

export default function Week1PreviewPlayer() {
  const audioRef = useRef(null);
  const [state, setState] = useState("idle"); // idle | playing | paused
  const [pos, setPos] = useState(0);          // 0..1

  const onToggle = () => {
    const a = audioRef.current;
    if (!a) return;
    if (state === "playing") {
      a.pause();
      setState("paused");
      return;
    }
    a.play().then(() => setState("playing")).catch(() => setState("idle"));
  };

  const onTime = () => {
    const a = audioRef.current;
    if (!a || !a.duration || isNaN(a.duration)) return;
    setPos(a.currentTime / a.duration);
  };

  return (
    <div
      data-testid="body-arch-week1-preview"
      className="rounded-[1.25rem] p-6 md:p-7"
      style={{
        background: "linear-gradient(160deg, #131210 0%, #1c1a16 100%)",
        border: "1px solid rgba(182,159,126,0.22)",
        boxShadow: "0 12px 40px rgba(0,0,0,0.45), 0 0 24px rgba(182,159,126,0.16)",
        fontFamily: SERIF,
      }}
    >
      <div className="flex items-center gap-4 mb-4">
        <div
          className="shrink-0 flex items-center justify-center rounded-full"
          style={{
            width: 44,
            height: 44,
            background: "rgba(182,159,126,0.14)",
            border: "1px solid rgba(182,159,126,0.32)",
          }}
        >
          <Wind size={20} color="#b69f7e" strokeWidth={1.5} />
        </div>
        <div className="flex-1 min-w-0">
          <p
            className="text-[10.5px] tracking-[0.36em] uppercase"
            style={{ color: "#a59f93" }}
          >
            ✦ Listen — a first taste
          </p>
          <p
            className="text-[20px] md:text-[24px] leading-[1.15] font-light italic"
            style={{ color: "#e8e1d5" }}
          >
            The First Key — The Breath
          </p>
        </div>
      </div>

      <p
        className="text-[13px] md:text-[13.5px] italic leading-[1.7] mb-5"
        style={{ color: "#bcb4a3" }}
      >
        A five-minute master-class in Kaelan's voice, from Week One of
        The Body Architecture. No measurement, no count. Only the long
        exhale, three times a day, for seven days.
      </p>

      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={onToggle}
          data-testid="body-arch-week1-toggle"
          aria-label={state === "playing" ? "Pause the master-class" : "Play the master-class"}
          className="shrink-0 inline-flex items-center justify-center rounded-full transition-all"
          style={{
            width: 52,
            height: 52,
            background: "#b69f7e",
            color: "#0b0a08",
            boxShadow: "0 0 22px rgba(182,159,126,0.36)",
          }}
        >
          {state === "playing" ? <Pause size={20} /> : <Play size={20} className="ml-0.5" />}
        </button>
        <div className="flex-1">
          <div
            className="h-[3px] rounded-full overflow-hidden"
            style={{ background: "rgba(232,225,213,0.10)" }}
            data-testid="body-arch-week1-progress"
          >
            <div
              style={{
                width: `${Math.round(pos * 100)}%`,
                height: "100%",
                background: "#b69f7e",
                transition: "width 250ms linear",
              }}
            />
          </div>
          <p
            className="mt-2 text-[10.5px] tracking-[0.32em] uppercase"
            style={{ color: "#7a7468" }}
          >
            ~ 5 min · Daniel voice · headphones recommended
          </p>
        </div>
      </div>
      <audio
        ref={audioRef}
        src={AUDIO_SRC}
        preload="auto"
        onTimeUpdate={onTime}
        onEnded={() => { setState("idle"); setPos(0); }}
        onError={() => setState("idle")}
        data-testid="body-arch-week1-audio"
      />
    </div>
  );
}
