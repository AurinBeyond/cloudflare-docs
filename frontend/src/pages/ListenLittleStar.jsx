/**
 * ListenLittleStar.jsx — /listen/little-star
 *
 * §POLARSTAR-AUDIO iter 86h 2026-02-29 (scaffold)
 *
 * Free public preview page for the Polarstar Bedtime Stories audio
 * companion. ONE story (Little Star). No email gate. No autoplay.
 * No analytics besides whatever GA4 already does globally.
 *
 * STATUS: scaffold-ready. Route NOT yet wired in App.js. Wire when
 * audio file lands at /assets/audio/polarstar/little-star.mp3.
 *
 * Visual lineage: Polarstar cream + soft amber accent, matching the
 * existing PolarstarStoryRead.jsx surface. No PSP-flagged language.
 * No "AI", no "wellness", no "therapy".
 */

import { Link } from "react-router-dom";
import { useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Play, Pause } from "lucide-react";

const SERIF = '"Cormorant Garamond", "EB Garamond", Georgia, serif';
const AUDIO_SRC = "/assets/audio/polarstar/little-star.mp3";

export default function ListenLittleStar() {
  const audioRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);

  const toggle = () => {
    const a = audioRef.current;
    if (!a) return;
    if (a.paused) {
      a.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
    } else {
      a.pause();
      setPlaying(false);
    }
  };

  const onTime = () => {
    const a = audioRef.current;
    if (!a) return;
    setProgress(a.currentTime);
    if (!duration && a.duration) setDuration(a.duration);
  };

  const onEnded = () => setPlaying(false);

  const fmt = (s) => {
    if (!Number.isFinite(s)) return "0:00";
    const m = Math.floor(s / 60);
    const r = Math.floor(s % 60);
    return `${m}:${r.toString().padStart(2, "0")}`;
  };

  return (
    <div
      data-testid="listen-little-star-page"
      className="min-h-screen w-full"
      style={{
        background:
          "radial-gradient(ellipse at top, rgba(255,243,217,1) 0%, rgba(255,251,241,1) 60%)",
        fontFamily: SERIF,
        color: "#3a2a18",
      }}
    >
      <div className="max-w-2xl mx-auto px-6 py-16">
        {/* Eyebrow */}
        <div
          className="text-xs tracking-[0.32em] uppercase mb-3 text-center"
          style={{ color: "#b97a3a", letterSpacing: "0.32em" }}
          data-testid="listen-eyebrow"
        >
          Polarstar Kids · Free preview
        </div>

        {/* Title */}
        <h1
          className="text-5xl md:text-6xl text-center mb-4"
          style={{ fontWeight: 600, letterSpacing: "-0.01em" }}
          data-testid="listen-title"
        >
          Little Star
        </h1>

        {/* Intro */}
        <p
          className="text-center italic text-lg mb-12 px-4"
          style={{ color: "#5b4a32" }}
          data-testid="listen-intro"
        >
          A tiny star learns that being small is not the same as being unseen.
          <br />
          <span className="text-sm not-italic tracking-widest uppercase" style={{ color: "#b97a3a" }}>
            About 3 minutes · read slowly, by the person who wrote it.
          </span>
        </p>

        {/* Player card */}
        <div
          className="rounded-2xl px-8 py-10 mb-12"
          style={{
            background: "rgba(255,255,255,0.6)",
            border: "1px solid rgba(185,122,58,0.25)",
            backdropFilter: "blur(8px)",
          }}
          data-testid="listen-player-card"
        >
          <audio
            ref={audioRef}
            src={AUDIO_SRC}
            preload="metadata"
            onTimeUpdate={onTime}
            onLoadedMetadata={onTime}
            onEnded={onEnded}
            data-testid="listen-audio-element"
          />

          <div className="flex items-center gap-6">
            <button
              type="button"
              onClick={toggle}
              className="flex items-center justify-center rounded-full transition-all"
              style={{
                width: 72,
                height: 72,
                background: "#b97a3a",
                color: "#fffbf1",
                boxShadow: "0 4px 24px rgba(185,122,58,0.35)",
              }}
              data-testid="listen-play-toggle"
              aria-label={playing ? "Pause" : "Play"}
            >
              {playing ? <Pause size={28} /> : <Play size={28} style={{ marginLeft: 3 }} />}
            </button>

            <div className="flex-1">
              <div
                className="h-1 rounded-full overflow-hidden"
                style={{ background: "rgba(185,122,58,0.18)" }}
                data-testid="listen-progress-track"
              >
                <div
                  className="h-full"
                  style={{
                    width: `${duration ? (progress / duration) * 100 : 0}%`,
                    background: "#b97a3a",
                    transition: "width 200ms linear",
                  }}
                  data-testid="listen-progress-bar"
                />
              </div>
              <div
                className="flex justify-between text-sm mt-2"
                style={{ color: "#5b4a32" }}
              >
                <span data-testid="listen-current-time">{fmt(progress)}</span>
                <span data-testid="listen-duration">{fmt(duration)}</span>
              </div>
            </div>
          </div>

          <p
            className="text-xs italic text-center mt-6"
            style={{ color: "#8a7a5a" }}
            data-testid="listen-rights-note"
          >
            One story. Read aloud, by the person who wrote it. For
            private listening with your child.
          </p>
        </div>

        {/* Back-to-PDF link */}
        <div className="text-center" data-testid="listen-pdf-link">
          <p className="text-base mb-3" style={{ color: "#5b4a32" }}>
            If this story finds a quiet place in your evenings, the
            full collection holds four more.
          </p>
          <a
            href="https://prulesoul.site/polarstar"
            className="inline-flex items-center gap-2 text-base"
            style={{
              color: "#b97a3a",
              fontWeight: 600,
              textDecoration: "underline",
              textUnderlineOffset: "4px",
            }}
            data-testid="listen-pdf-cta"
          >
            See the full PDF collection
            <ArrowRight size={16} />
          </a>
        </div>

        {/* Lantern line — quiet anti-marketing micro-conversion */}
        <p
          className="text-center italic text-sm mt-16 leading-relaxed"
          style={{ color: "#8a7a5a", maxWidth: 460, marginLeft: "auto", marginRight: "auto" }}
          data-testid="listen-lantern-line"
        >
          If this story helped someone fall asleep tonight,
          <br />
          leave the lantern lit for the next quiet evening.
        </p>

        {/* Footer breadcrumb back */}
        <div className="mt-12 text-center">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm tracking-widest uppercase"
            style={{ color: "#5b4a32", opacity: 0.7 }}
            data-testid="listen-home-link"
          >
            <ArrowLeft size={14} />
            Polarstar Kids
          </Link>
        </div>
      </div>
    </div>
  );
}
