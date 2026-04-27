import { useEffect, useRef, useState } from "react";
import { Play, Pause, Sparkles } from "lucide-react";
import { mediaConfig } from "@/lib/mediaConfig";

/**
 * First Light — minimal audio container.
 *
 * Reads an external audio URL from mediaConfig.firstLightAudioUrl
 * (or via the `audioUrl` prop). When a URL is present, renders a
 * single Play/Pause button bound to a hidden <audio> element.
 *
 * If no URL is set, shows a quiet placeholder line. By design.
 *
 * No autoplay. No tracking. No "stream / embed / upload" wording.
 */

export default function MeditationPlayer({ audioUrl }) {
  const url = audioUrl || mediaConfig.firstLightAudioUrl || null;
  const audioRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    const onTime = () => setElapsed(a.currentTime || 0);
    const onMeta = () => setDuration(a.duration || 0);
    const onEnd = () => setPlaying(false);
    a.addEventListener("timeupdate", onTime);
    a.addEventListener("loadedmetadata", onMeta);
    a.addEventListener("ended", onEnd);
    return () => {
      a.removeEventListener("timeupdate", onTime);
      a.removeEventListener("loadedmetadata", onMeta);
      a.removeEventListener("ended", onEnd);
    };
  }, [url]);

  const fmt = (s) => {
    if (!s || !isFinite(s)) return "0:00";
    const mm = Math.floor(s / 60);
    const ss = Math.floor(s % 60);
    return `${mm}:${ss.toString().padStart(2, "0")}`;
  };

  const handleToggle = () => {
    const a = audioRef.current;
    if (!a) return;
    if (playing) {
      a.pause();
      setPlaying(false);
    } else {
      a.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
    }
  };

  const progress = duration ? Math.min(100, (elapsed / duration) * 100) : 0;

  return (
    <div
      data-testid="meditation-player"
      className="aurin-card p-7 md:p-9 relative overflow-hidden"
      style={{
        boxShadow:
          "0 0 0 1px hsl(var(--aurin-border-soft)), 0 30px 80px -40px hsl(var(--aurin-sage) / 0.35)",
      }}
    >
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
            <div className="aurin-eyebrow !mb-0.5">A small gift</div>
            <h3 className="aurin-display text-2xl md:text-3xl leading-tight">
              First Light{" "}
              <span className="aurin-serif-italic text-[hsl(var(--aurin-sage))]">
                · a quiet beginning.
              </span>
            </h3>
          </div>
        </div>

        {/* Quiet body */}
        <div
          data-testid="meditation-body"
          className="min-h-[120px] py-6 px-2 sm:px-4 flex items-center justify-center text-center"
        >
          {url ? (
            <p className="aurin-serif-italic text-[hsl(var(--aurin-text))/0.94] text-lg md:text-xl leading-[1.6] max-w-[40ch]">
              Listen, when you feel like it.
            </p>
          ) : (
            <p
              data-testid="meditation-placeholder"
              className="aurin-serif-italic text-[hsl(var(--aurin-text-muted))] text-lg md:text-xl leading-[1.6] max-w-[40ch]"
            >
              This sound will open soon.
              <br />
              <span className="not-italic text-[13.5px] text-[hsl(var(--aurin-text-muted))]/80">
                Human voice is being recorded.
              </span>
            </p>
          )}
        </div>

        {url && (
          <>
            <audio
              ref={audioRef}
              src={url}
              preload="metadata"
              data-testid="meditation-audio-el"
            />

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
              <span data-testid="meditation-time">{fmt(elapsed)}</span>
              <span>{fmt(duration)}</span>
            </div>
          </>
        )}

        {/* Single Play/Pause */}
        <div className="mt-6 flex items-center justify-center">
          <button
            type="button"
            onClick={handleToggle}
            disabled={!url}
            data-testid="meditation-play"
            aria-label={playing ? "Pause" : "Play"}
            className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all ${
              url
                ? "bg-[hsl(var(--aurin-sage))] text-[hsl(var(--aurin-bg))] hover:scale-105"
                : "bg-[hsl(var(--aurin-border-soft))] text-[hsl(var(--aurin-text-muted))] cursor-not-allowed opacity-70"
            }`}
          >
            {playing ? (
              <Pause size={20} strokeWidth={1.6} />
            ) : (
              <Play size={20} strokeWidth={1.6} className="ml-0.5" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
