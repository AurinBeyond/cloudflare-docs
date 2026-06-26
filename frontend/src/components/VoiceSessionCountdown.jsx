/**
 * VoiceSessionCountdown — calm, read-only banner above the ConvAI
 * voice surface that surfaces the wanderer's voice-pass state.
 *
 * §STABILIZATION 2026-05-16 — Founder directive: a THIN, ISOLATED
 * UI component. It is purely visual. It does NOT call the SDK, does
 * NOT touch `<RoomConvaiChat>`'s state, does NOT interfere with the
 * audio context. It only reads from `useVoiceSessionCap` and
 * renders the right one of four states:
 *
 *   1. capEnabled === false       → renders nothing (invisible layer)
 *   2. unlimited / free_access     → renders nothing (no countdown UX)
 *   3. allowed && secondsRemaining → renders countdown banner
 *   4. !allowed                    → renders calm closure card with
 *                                     refill CTA (link to /portal)
 *
 * The component never blocks the underlying voice surface — that is
 * the backend's job (signed-url returns 402 when allowed=false).
 * The banner only mirrors the truth for the wanderer.
 */
import { Link } from "react-router-dom";
import { useVoiceSessionCap } from "../hooks/useVoiceSessionCap";

function formatRemaining(secs) {
  if (secs <= 0) return "0:00";
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

const TIER_LABEL = {
  "30min": "30-min Guided Presence",
  "60min": "60-min Extended Session",
  "season_30days": "The long return",
  presence: "Guided Presence",
  free_access: "Free access",
  unlimited: "Unlimited",
  pending: "Ready to begin",
};

export function VoiceSessionCountdown({ enabled = true, mode = "voice" }) {
  const cap = useVoiceSessionCap({ enabled });

  // §TEXT-FREE 2026-05-19 — Writing is free for every wanderer.
  // When the wanderer has flipped to text mode in RoomConvaiChat we
  // hide the entire countdown UX so the experience does not feel
  // metered. The cap layer itself is bypassed at the backend for
  // text mode (see /api/clarity/convai/signed-url).
  if (mode === "text") return null;

  // States 1 & 2 — invisible.
  if (cap.loading) return null;
  if (!cap.capEnabled) return null;
  if (cap.tier === "unlimited" || cap.tier === "free_access") return null;

  // State 4 — graceful closure card.
  if (!cap.allowed) {
    return (
      <div
        data-testid="voice-cap-closed"
        className="mb-4 rounded-2xl border border-[hsl(var(--aurin-border-soft))] bg-[hsl(var(--aurin-bg-elev))/0.6] p-5 backdrop-blur"
      >
        <p
          className="aurin-serif text-[16px] text-[hsl(var(--aurin-text))/0.92] mb-2"
          data-testid="voice-cap-closed-title"
        >
          Your Presence Time has gently closed.
        </p>
        <p className="text-[13px] text-[hsl(var(--aurin-text))/0.65] leading-relaxed mb-4">
          You can keep writing here, or refill your Presence Time when
          you're ready to talk again.
        </p>
        <div className="flex flex-wrap gap-2.5">
          <Link
            to="/clarity-release#passes"
            data-testid="voice-cap-refill-link"
            className="aurin-btn-primary text-[12.5px]"
          >
            Refill Presence Time
          </Link>
        </div>
      </div>
    );
  }

  // State 3 — active countdown banner.
  const secs = cap.secondsRemaining;
  const tierLabel = TIER_LABEL[cap.tier] || "Session";
  const isExpiring = cap.expiringSoon;
  // Pending pass — no countdown yet, just calm "ready" hint.
  if (cap.tier === "pending" || secs <= 0) {
    return (
      <div
        data-testid="voice-cap-ready"
        className="mb-4 flex items-center gap-3 text-[12px] text-[hsl(var(--aurin-text))/0.55]"
      >
        <span className="aurin-mono uppercase tracking-[0.2em]">{tierLabel}</span>
        <span>—</span>
        <span>Your time begins when you speak.</span>
      </div>
    );
  }

  return (
    <div
      data-testid="voice-cap-countdown"
      className={`mb-4 flex items-center gap-3 text-[12px] ${
        isExpiring
          ? "text-[hsl(var(--aurin-sage))/0.95]"
          : "text-[hsl(var(--aurin-text))/0.55]"
      }`}
    >
      <span className="aurin-mono uppercase tracking-[0.2em]">
        {formatRemaining(secs)} remaining
      </span>
      <span>·</span>
      <span className="aurin-serif-italic">
        {isExpiring
          ? "Your time with Grace is nearly complete."
          : tierLabel}
      </span>
    </div>
  );
}

export default VoiceSessionCountdown;
