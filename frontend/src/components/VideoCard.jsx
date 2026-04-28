import { useRef, useState } from "react";
import { Play, Pause } from "lucide-react";

/**
 * VideoCard — small, calm, click-to-play video block.
 *
 * Founder rules (binding):
 *   - NOT a full-page background.
 *   - NOT autoplayed with sound.
 *   - User must click Play to start. Until then, only the poster shows.
 *   - Minimal controls (Play/Pause overlay). Native controls hidden.
 *   - Lazy-loaded (preload="none") so the file isn't fetched on page load.
 *   - If the file fails to load, the card hides itself silently.
 *
 * Props:
 *   src         (required) URL to the .mp4 (local or remote)
 *   poster      Optional poster image (a still frame). Falls back to a
 *               soft gradient if not provided.
 *   eyebrow     Small label above the title.
 *   title       Short calm title shown beside the play button.
 *   description Optional one-line caption.
 *   maxWidthCls Tailwind class controlling card width (default: max-w-md).
 *   testId      data-testid prefix (default: "video-card").
 */
export default function VideoCard({
  src,
  poster,
  eyebrow = "A small look",
  title = "Quiet visual",
  description,
  maxWidthCls = "max-w-md",
  testId = "video-card",
}) {
  const videoRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [started, setStarted] = useState(false);
  const [failed, setFailed] = useState(false);

  if (!src || failed) return null;

  const onToggle = () => {
    const v = videoRef.current;
    if (!v) return;
    if (playing) {
      v.pause();
      setPlaying(false);
    } else {
      v.play()
        .then(() => {
          setStarted(true);
          setPlaying(true);
        })
        .catch(() => {
          /* user gesture missed or codec error — hide card silently */
          setFailed(true);
        });
    }
  };

  return (
    <div
      data-testid={testId}
      className={`${maxWidthCls} aurin-card overflow-hidden border border-[hsl(var(--aurin-border-soft))]`}
      style={{
        boxShadow:
          "0 0 0 1px hsl(var(--aurin-border-soft)), 0 24px 60px -36px hsl(var(--aurin-sage) / 0.30)",
      }}
    >
      {/* Aspect ratio container — 16/9 */}
      <div
        data-testid={`${testId}-frame`}
        className="relative w-full bg-black/60"
        style={{ paddingTop: "56.25%" }}
      >
        <video
          ref={videoRef}
          data-testid={`${testId}-video`}
          src={src}
          poster={poster || undefined}
          preload="none"
          playsInline
          muted={false}
          onEnded={() => setPlaying(false)}
          onError={() => setFailed(true)}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${
            started ? "opacity-100" : "opacity-90"
          }`}
        />

        {/* Soft dark overlay that fades on first play */}
        <div
          aria-hidden
          className={`absolute inset-0 transition-opacity duration-500 pointer-events-none ${
            started ? "opacity-0" : "opacity-100"
          }`}
          style={{
            background:
              "linear-gradient(180deg, hsl(var(--aurin-bg) / 0.25) 0%, hsl(var(--aurin-bg) / 0.55) 100%)",
          }}
        />

        {/* Center play/pause */}
        <button
          type="button"
          onClick={onToggle}
          data-testid={`${testId}-toggle`}
          aria-label={playing ? "Pause" : "Play"}
          className="absolute inset-0 flex items-center justify-center group"
        >
          <span
            className={`w-14 h-14 rounded-full flex items-center justify-center bg-[hsl(var(--aurin-bg))/0.85] border border-[hsl(var(--aurin-sage))/0.45] backdrop-blur-sm transition-all duration-300 ${
              playing ? "opacity-0 group-hover:opacity-100" : "opacity-100"
            } group-hover:scale-105`}
          >
            {playing ? (
              <Pause size={20} strokeWidth={1.5} />
            ) : (
              <Play size={20} strokeWidth={1.5} className="ml-0.5" />
            )}
          </span>
        </button>
      </div>

      {/* Caption — outside the frame */}
      {(eyebrow || title || description) && (
        <div className="p-5">
          {eyebrow && (
            <div
              data-testid={`${testId}-eyebrow`}
              className="text-[10.5px] uppercase tracking-[0.22em] text-[hsl(var(--aurin-text-muted))] mb-1.5"
            >
              {eyebrow}
            </div>
          )}
          {title && (
            <div
              data-testid={`${testId}-title`}
              className="aurin-display text-lg leading-tight"
            >
              {title}
            </div>
          )}
          {description && (
            <p
              data-testid={`${testId}-description`}
              className="mt-2 text-[13px] leading-relaxed text-[hsl(var(--aurin-text-muted))]"
            >
              {description}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
