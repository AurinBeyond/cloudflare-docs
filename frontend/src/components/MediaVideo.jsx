import { useMemo } from "react";

/**
 * MediaVideo — minimal, privacy-respecting external video container.
 *
 * Accepts a URL (YouTube, Vimeo, or direct mp4/webm). If no URL is
 * provided, renders nothing — by design.
 *
 * Defaults:
 *   - lazy-loaded iframes
 *   - youtube-nocookie / vimeo dnt=1
 *   - related videos & external suggestions hidden
 *   - muted, no autoplay-with-sound
 *
 * Props (all optional except `url`):
 *   url        — string (or null/undefined → component renders null)
 *   title      — string for the iframe / video accessible name
 *   muted      — boolean, default true
 *   loop       — boolean, default false
 *   ratio      — "16/9" (default) | "1/1" | "4/5"
 *   testId     — string for test hooks
 */

function detect(url) {
  if (!url) return null;
  // YouTube
  const yt =
    url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([\w-]{11})/);
  if (yt) return { kind: "youtube", id: yt[1] };
  // Vimeo
  const vm = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (vm) return { kind: "vimeo", id: vm[1] };
  // Direct file
  if (/\.(mp4|webm|mov|m4v)(\?|$)/i.test(url)) return { kind: "file", src: url };
  return null;
}

const RATIO_MAP = { "16/9": "56.25%", "1/1": "100%", "4/5": "125%" };

export default function MediaVideo({
  url,
  title = "Quiet visual",
  muted = true,
  loop = false,
  ratio = "16/9",
  testId = "media-video",
}) {
  const provider = useMemo(() => detect(url), [url]);
  if (!provider) return null;

  const paddingTop = RATIO_MAP[ratio] || RATIO_MAP["16/9"];

  let inner = null;
  if (provider.kind === "youtube") {
    const params = new URLSearchParams({
      rel: "0",
      modestbranding: "1",
      playsinline: "1",
      controls: "1",
      iv_load_policy: "3",
      ...(muted ? { mute: "1" } : {}),
      ...(loop ? { loop: "1", playlist: provider.id } : {}),
    }).toString();
    inner = (
      <iframe
        src={`https://www.youtube-nocookie.com/embed/${provider.id}?${params}`}
        title={title}
        loading="lazy"
        allow="accelerometer; clipboard-write; encrypted-media; picture-in-picture"
        allowFullScreen
        className="absolute inset-0 w-full h-full"
        style={{ border: 0 }}
        data-testid={`${testId}-yt`}
      />
    );
  } else if (provider.kind === "vimeo") {
    const params = new URLSearchParams({
      dnt: "1",
      title: "0",
      byline: "0",
      portrait: "0",
      ...(muted ? { muted: "1" } : {}),
      ...(loop ? { loop: "1" } : {}),
    }).toString();
    inner = (
      <iframe
        src={`https://player.vimeo.com/video/${provider.id}?${params}`}
        title={title}
        loading="lazy"
        allow="autoplay; fullscreen; picture-in-picture"
        allowFullScreen
        className="absolute inset-0 w-full h-full"
        style={{ border: 0 }}
        data-testid={`${testId}-vimeo`}
      />
    );
  } else {
    inner = (
      <video
        src={provider.src}
        title={title}
        muted={muted}
        loop={loop}
        playsInline
        controls
        preload="metadata"
        className="absolute inset-0 w-full h-full object-cover bg-black"
        data-testid={`${testId}-file`}
      />
    );
  }

  return (
    <div
      data-testid={testId}
      className="aurin-card overflow-hidden"
      style={{ position: "relative" }}
    >
      <div style={{ position: "relative", width: "100%", paddingTop }}>
        {inner}
      </div>
    </div>
  );
}
