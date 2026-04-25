import { useEffect, useRef, useState } from "react";
import { Play, Pause, RotateCcw, Sparkles } from "lucide-react";

/**
 * Aurin First Light — a guided meditation lead magnet.
 *
 * No real audio yet (recording is in production). The "player" plays
 * the script line-by-line at a calm cadence (~5.5 s per line), with a
 * Play / Pause / Restart row, a quiet progress bar, and the live line
 * gently pulsing into view.
 *
 * Visuals follow the brand: soft sage glow around the card.
 */

const SCRIPT = [
  "Close your eyes.",
  "Breathe in structure…",
  "and breathe out space.",
  "You are not limited to what has been written before.",
  "Imagine a quiet light in your chest.",
  "Not something new — something that has always been there.",
  "With each breath, what no longer fits can loosen.",
  "And in that space…",
  "something clearer begins to take shape.",
  "There is nothing you need to force.",
  "Just don't turn away from it.",
];

const SECONDS_PER_LINE = 5.5;
const TOTAL_SECONDS = SCRIPT.length * SECONDS_PER_LINE;

export default function MeditationPlayer() {
  const [playing, setPlaying] = useState(false);
  const [elapsed, setElapsed] = useState(0); // seconds
  const tickRef = useRef(null);

  useEffect(() => {
    if (!playing) return;
    tickRef.current = setInterval(() => {
      setElapsed((s) => {
        const next = s + 0.1;
        if (next >= TOTAL_SECONDS) {
          clearInterval(tickRef.current);
          setPlaying(false);
          return TOTAL_SECONDS;
        }
        return next;
      });
    }, 100);
    return () => clearInterval(tickRef.current);
  }, [playing]);

  const lineIndex = Math.min(
    SCRIPT.length - 1,
    Math.floor(elapsed / SECONDS_PER_LINE)
  );
  const progress = Math.min(100, (elapsed / TOTAL_SECONDS) * 100);

  const formatTime = (s) => {
    const mm = Math.floor(s / 60);
    const ss = Math.floor(s % 60);
    return `${mm}:${ss.toString().padStart(2, "0")}`;
  };

  const handlePlayPause = () => setPlaying((p) => !p);
  const handleRestart = () => {
    setElapsed(0);
    setPlaying(true);
  };

  return (
    <div
      data-testid="meditation-player"
      className="aurin-card p-7 md:p-9 relative overflow-hidden"
      style={{
        boxShadow:
          "0 0 0 1px hsl(var(--aurin-border-soft)), 0 30px 80px -40px hsl(var(--aurin-sage) / 0.35)",
      }}
    >
      {/* Soft sage glow */}
      <div
        aria-hidden
        className="absolute -top-24 -left-24 w-[360px] h-[360px] rounded-full opacity-40 blur-3xl pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, hsl(var(--aurin-sage) / 0.45), transparent 65%)",
        }}
      />

      <div className="relative">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-11 h-11 rounded-full border border-[hsl(var(--aurin-sage))/0.5] flex items-center justify-center text-[hsl(var(--aurin-sage))]">
            <Sparkles size={16} strokeWidth={1.4} />
          </div>
          <div>
            <div className="aurin-eyebrow !mb-0.5">Guided Meditation · Free Gift</div>
            <h3 className="aurin-display text-2xl md:text-3xl leading-tight">
              First Light{" "}
              <span className="aurin-serif-italic text-[hsl(var(--aurin-sage))]">
                · a quiet beginning.
              </span>
            </h3>
          </div>
        </div>

        {/* Script line — pulses softly when active */}
        <div
          data-testid="meditation-line"
          className="min-h-[120px] py-6 px-2 sm:px-4 flex items-center justify-center text-center"
        >
          <p
            key={lineIndex}
            className={`aurin-serif-italic text-[hsl(var(--aurin-text))/0.94] text-xl md:text-2xl leading-[1.55] max-w-[40ch] transition-opacity duration-700 ${
              playing ? "opacity-100" : "opacity-80"
            }`}
            style={{ animation: playing ? "aurin-fade-in 0.9s ease-out" : "none" }}
          >
            {SCRIPT[lineIndex]}
          </p>
        </div>

        {/* Progress bar */}
        <div
          data-testid="meditation-progress"
          className="h-[3px] w-full bg-[hsl(var(--aurin-border-soft))] rounded-full overflow-hidden mt-2"
        >
          <div
            className="h-full bg-[hsl(var(--aurin-sage))] transition-[width] duration-150"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="mt-3 flex items-center justify-between text-[11.5px] text-[hsl(var(--aurin-text-muted))]">
          <span data-testid="meditation-time">{formatTime(elapsed)}</span>
          <span>{formatTime(TOTAL_SECONDS)}</span>
        </div>

        {/* Controls */}
        <div className="mt-6 flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={handleRestart}
            data-testid="meditation-restart"
            aria-label="Restart"
            className="w-10 h-10 rounded-full border border-[hsl(var(--aurin-border))] flex items-center justify-center text-[hsl(var(--aurin-text))/0.85] hover:text-[hsl(var(--aurin-sage))] hover:border-[hsl(var(--aurin-sage))] transition-colors"
          >
            <RotateCcw size={14} strokeWidth={1.5} />
          </button>
          <button
            type="button"
            onClick={handlePlayPause}
            data-testid="meditation-play"
            aria-label={playing ? "Pause" : "Play"}
            className="w-14 h-14 rounded-full bg-[hsl(var(--aurin-sage))] text-[hsl(var(--aurin-bg))] flex items-center justify-center shadow-lg hover:scale-105 transition-transform"
          >
            {playing ? (
              <Pause size={20} strokeWidth={1.6} />
            ) : (
              <Play size={20} strokeWidth={1.6} className="ml-0.5" />
            )}
          </button>
          <div className="w-10 h-10" aria-hidden />
        </div>

        <p className="mt-6 text-center text-[12.5px] text-[hsl(var(--aurin-text-muted))]">
          Read at a calm pace. Audio recording arriving soon.
        </p>
      </div>
    </div>
  );
}
