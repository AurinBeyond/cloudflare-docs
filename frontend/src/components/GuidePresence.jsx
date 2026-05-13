/**
 * GuidePresence.jsx — §Phase 1 "Digital Presence" (2026-02-14).
 *
 * Founder Variant C lock: calm digital companion presence built ONLY
 * from a still portrait + layered CSS overlays + Web-Audio-driven
 * amplitude. No Sora videos, no Live2D, no GPU, no spectacle.
 *
 * Layered architecture (front-to-back):
 *   1. Base portrait <img> (Gemini-generated guide-{male|female}.jpg).
 *   2. Mouth shadow overlay — opacity + Y-scale follow CSS variable
 *      `--mouth-open` (0..1), written 60 Hz by useVoiceIO's TTS
 *      AnalyserNode. Soft, capped, never fish-flaps.
 *   3. Eye-blink sweep — JS-randomized 3-8 s intervals so the
 *      wanderer's brain cannot pattern-match a metronome blink.
 *   4. Gaze layer — when runtimeState=thinking, a CSS transform
 *      micro-shifts the portrait down-left ("looking at the notebook")
 *      so the wanderer reads "she is considering", not "system delay".
 *   5. Speaking halo (existing) — warm sage glow during TTS playback.
 *   6. State ripple (existing) — outer ambient pulse.
 *
 * Motion budget — founder mandate "minimal, soft":
 *   - breath scale: 1.012 max (was 1.022)
 *   - sway:        ±0.35% (was ±0.6%)
 *   - listening nod fires only when data-runtime-state="listening"
 *   - mouth opacity capped at 0.55, Y-scale 0.55..1.30
 *
 * Honors prefers-reduced-motion via index.css.
 */
import React, { useEffect, useRef, useState } from "react";

const VALID_TONES = ["compassion", "support", "reflection", "neutral"];

const RING_BY_STATE = {
  idle:
    "ring-1 ring-[hsl(var(--aurin-sage))/0.18] shadow-[0_0_18px_-6px_hsl(var(--aurin-sage)/0.30)]",
  listening:
    "ring-1 ring-[hsl(var(--aurin-sage))/0.45] shadow-[0_0_22px_-5px_hsl(var(--aurin-sage)/0.42)]",
  thinking:
    "ring-2 ring-[hsl(var(--aurin-sage))/0.7] shadow-[0_0_24px_-2px_hsl(var(--aurin-sage)/0.45)]",
  speaking:
    "ring-2 ring-[hsl(var(--aurin-sage))/0.85] shadow-[0_0_30px_-2px_hsl(var(--aurin-sage)/0.6)]",
};

// State labels removed in iter 69 (founder: feel, do not read).
const STATE_LINE = {
  idle: null,
  listening: null,
  thinking: null,
  speaking: null,
};

export default function GuidePresence({
  gender,
  sending = false,
  toneTag,
  runtimeState,
  variant = "full",
  labelOverride,
  testidPrefix = "guide",
  // §Phase 1 — real-time mouth amplitude from useVoiceIO. When provided,
  // the mouth overlay tracks the TTS audio amplitude. Optional: if
  // omitted, the mouth overlay simply stays at rest (presence still
  // breathes & blinks — never breaks).
  mouthOpenRef = null,
}) {
  const portraitSrc = `/api/clarity/guide-face/${gender}`;
  const fallbackSrc =
    gender === "male"
      ? "/assets/illustrations/guide-male.jpg"
      : "/assets/illustrations/guide-female.jpg";

  const state = sending ? "thinking" : runtimeState || "idle";
  const tone = VALID_TONES.includes(toneTag) ? toneTag : "neutral";
  const ringClass = RING_BY_STATE[state] || RING_BY_STATE.idle;

  const label =
    labelOverride ||
    (gender === "male"
      ? "Guide Presence · Clarity"
      : gender === "female"
      ? "Guide Presence · Grace"
      : "Guide Presence · your companion");

  const isCompact = variant === "compact";
  const isCall = variant === "call";
  const portraitSize = isCompact
    ? "w-[80px] h-[80px]"
    : isCall
    ? "w-[260px] h-[260px] md:w-[340px] md:h-[340px]"
    : "w-[150px] h-[150px]";
  const wrapperClasses = isCompact
    ? "flex flex-row gap-3 items-center"
    : isCall
    ? "flex flex-col items-center gap-3 pt-2"
    : "mt-8 aurin-card p-6 md:p-7 flex flex-col md:flex-row gap-5 items-center";

  const showSpeakingHalo = state === "speaking";

  // ---- §Phase 1: amplitude → CSS variable (60 Hz, decoupled) ----
  const portraitWrapperRef = useRef(null);
  useEffect(() => {
    if (!mouthOpenRef || !portraitWrapperRef.current) return undefined;
    let raf = 0;
    let cancelled = false;
    let lastWritten = -1;
    const el = portraitWrapperRef.current;
    const tick = () => {
      if (cancelled) return;
      const v = Math.max(0, Math.min(1, mouthOpenRef.current || 0));
      // Skip DOM writes for sub-perceptual deltas (saves style-recalc
      // on quiet frames). 0.005 is below visual threshold for the
      // capped opacity (0.55 * 0.005 ≈ 0.003 alpha).
      if (Math.abs(v - lastWritten) > 0.005) {
        el.style.setProperty("--mouth-open", v.toFixed(3));
        lastWritten = v;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      el.style.setProperty("--mouth-open", "0");
    };
  }, [mouthOpenRef]);

  // ---- §Phase 1: randomized rare blinks (3-8 s; founder: chaos factor) ----
  const [blinkTick, setBlinkTick] = useState(0);
  useEffect(() => {
    let cancelled = false;
    let timeoutId = 0;
    const schedule = () => {
      const delay = 3200 + Math.random() * 4800; // 3.2-8.0 s
      timeoutId = window.setTimeout(() => {
        if (cancelled) return;
        setBlinkTick((t) => t + 1);
        schedule();
      }, delay);
    };
    schedule();
    return () => {
      cancelled = true;
      window.clearTimeout(timeoutId);
    };
  }, []);

  return (
    <div
      data-testid={`${testidPrefix}-presence`}
      data-gender={gender || "default"}
      data-sending={sending ? "true" : "false"}
      data-runtime-state={state}
      data-tone-tag={tone}
      className={`${wrapperClasses} aurin-guide-tone-${tone} aurin-guide-state-${state}`}
    >
      <div
        ref={portraitWrapperRef}
        className={`shrink-0 ${portraitSize} rounded-full overflow-hidden border border-[hsl(var(--aurin-border))] transition-all duration-700 ${ringClass} aurin-guide-presence relative`}
        data-testid={`${testidPrefix}-portrait`}
        style={{ "--mouth-open": 0 }}
      >
        <div className="aurin-guide-gaze w-full h-full">
          <img
            src={portraitSrc}
            alt={
              gender === "male"
                ? "Guide portrait — Clarity"
                : gender === "female"
                ? "Guide portrait — Grace"
                : "Guide portrait"
            }
            className="w-full h-full object-cover aurin-guide-breath aurin-guide-sway"
            loading="eager"
            onError={(e) => {
              if (e.currentTarget.src.indexOf("/assets/illustrations/") === -1) {
                e.currentTarget.src = fallbackSrc;
              }
            }}
          />
          {/* §Phase 1 mouth shadow overlay — tracks `--mouth-open`. */}
          <span
            aria-hidden
            data-testid={`${testidPrefix}-mouth`}
            className="aurin-guide-mouth"
          />
        </div>
        {/* §Phase 1 randomized blink — remounted via `key` so the
            single-shot animation retriggers each tick. */}
        <span
          key={`blink-${blinkTick}`}
          aria-hidden
          data-testid={`${testidPrefix}-blink`}
          className="aurin-guide-blink-once pointer-events-none absolute inset-x-0 top-[34%] h-[6px]"
        />
        <span
          aria-hidden
          className="aurin-guide-state-ripple pointer-events-none absolute inset-0 rounded-full"
        />
        {showSpeakingHalo && (
          <span
            aria-hidden
            data-testid={`${testidPrefix}-speaking-halo`}
            className="aurin-guide-speaking-halo pointer-events-none absolute inset-[-8px] rounded-full"
          />
        )}
      </div>
      <div className={isCompact ? "min-w-0" : isCall ? "text-center" : ""}>
        {!isCall && (
          <div className={`aurin-eyebrow ${isCompact ? "!mb-0 text-[10px]" : "!mb-1"}`}>
            {label}
          </div>
        )}
        {isCall ? (
          <p
            className="text-[12.5px] text-[hsl(var(--aurin-text-muted))] aurin-serif-italic"
            data-testid={`${testidPrefix}-state-line`}
          >
            {STATE_LINE[state] || "Quietly here."}
          </p>
        ) : isCompact ? (
          <p
            className="text-[11.5px] text-[hsl(var(--aurin-text-muted))] aurin-serif-italic"
            data-testid={`${testidPrefix}-state-line`}
          >
            {STATE_LINE[state] || "Quietly here."}
          </p>
        ) : (
          <p
            className="text-[13.5px] leading-relaxed text-[hsl(var(--aurin-text-muted))] max-w-[52ch]"
            data-testid={`${testidPrefix}-state-line`}
          >
            {STATE_LINE[state] ? (
              <span className="aurin-serif-italic">{STATE_LINE[state]}</span>
            ) : (
              <>
                A quiet companion — someone to speak with when there's no
                one else you can say it to. The room listens, slowly. No
                rush, no advice, no judgment. You'll notice a soft breath,
                a calm posture. That's all.
              </>
            )}
          </p>
        )}
      </div>
    </div>
  );
}
