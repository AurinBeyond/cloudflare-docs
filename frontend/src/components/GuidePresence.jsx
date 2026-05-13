/**
 * GuidePresence.jsx — §Stage 2.7 cross-room presence component.
 *
 * Single shared, lightweight CSS-only presence layer for any private
 * room. Originally extracted from `pages/ClarityRelease.jsx` so the
 * Body Room (and later Cabinet) can share the exact same runtime
 * states + tone classes without duplicating CSS or JS.
 *
 * Props:
 *   gender          "male" | "female" | undefined  (Clarity / Grace / neutral)
 *   sending         boolean — collapses to runtimeState="thinking"
 *   toneTag         "compassion" | "support" | "reflection" | "neutral"
 *   runtimeState    "idle" | "listening" | "thinking" | "speaking"
 *   variant         "full"  → big card with copy line (Clarity Release)
 *                   "compact" → tighter row, no descriptive copy (Body Room)
 *   labelOverride   optional eyebrow string (else uses Clarity / Grace / your companion)
 *
 * No animation libraries. No canvas. No WebGL. Honest still-portrait +
 * pure-CSS reactivity. Reduced-motion is respected via existing
 * keyframes in index.css.
 */
import React from "react";

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

const STATE_LINE = {
  idle: null,
  // §Phase 0 Sanctuary (2026-02-14) — the wanderer must FEEL these
  // states, never read them. Technical state labels removed.
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
}) {
  const portraitSrc = `/api/clarity/guide-face/${gender}`;
  const fallbackSrc =
    gender === "male"
      ? "/assets/illustrations/guide-male.jpg"
      : "/assets/illustrations/guide-female.jpg";

  // Video presence — Grace has a Sora 2 vision pilot loop; Clarity falls
  // back to static portrait until a male video is generated. The video
  // plays muted+loop+playsInline so iOS Safari autoplay is permitted.
  const videoSrc = gender === "female" ? "/avatars/grace_vision_pilot.mp4" : null;
  const [videoFailed, setVideoFailed] = React.useState(false);

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

  // Speaking-state halo overlay (warm sage glow, slow pulse).
  const showSpeakingHalo = state === "speaking";

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
        className={`shrink-0 ${portraitSize} rounded-full overflow-hidden border border-[hsl(var(--aurin-border))] transition-all duration-700 ${ringClass} aurin-guide-presence relative`}
        data-testid={`${testidPrefix}-portrait`}
      >
        {videoSrc && !videoFailed ? (
          <video
            src={videoSrc}
            className="w-full h-full object-cover aurin-guide-breath aurin-guide-sway"
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            onError={() => setVideoFailed(true)}
            data-testid={`${testidPrefix}-portrait-video`}
            aria-label={
              gender === "female"
                ? "Guide presence — Grace, breathing quietly"
                : "Guide presence"
            }
          />
        ) : (
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
        )}
        <span
          aria-hidden
          className="aurin-guide-blink pointer-events-none absolute inset-x-0 top-[34%] h-[6px]"
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
