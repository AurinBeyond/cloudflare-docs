/**
 * VoiceRecoveryCard — calm UX containment when the ConvAI session
 * disconnects unexpectedly.
 *
 * §STABILIZATION 2026-05-16 PM — Founder directive (UX Failsafe):
 * if the WebSocket / audio transport / ElevenLabs session ends in a
 * non-user-initiated way, the platform must NEVER look crashed. This
 * card surfaces three calm choices:
 *   - Continue in text (close voice, keep typing)
 *   - Retry voice (reopen the ConvAI session)
 *   - Switch to hybrid (write — guide speaks back)
 *
 * Conversation history is preserved by NOT unmounting RoomConvaiChat
 * underneath; the card renders as an overlay banner.
 *
 * The card is purely declarative. It does NOT touch the SDK,
 * WebSocket, or audio context — those belong to RoomConvaiChat and
 * remain sealed. Mode switching happens via DOM-level click on the
 * existing `[data-testid="convai-mode-*"]` buttons inside
 * RoomConvaiChat, which already handle their own teardown safely.
 */
import { useCallback } from "react";

export function VoiceRecoveryCard({ visible, errorMsg, onDismiss }) {
  // Mode-switch helper — clicks the existing mode-toggle button.
  // Safe because RoomConvaiChat already handles mode change via its
  // own useEffect (which calls endSession + 220ms gap).
  const switchMode = useCallback((mode) => {
    const btn = document.querySelector(`[data-testid="convai-mode-${mode}"]`);
    if (btn && typeof btn.click === "function") {
      btn.click();
    }
    if (typeof onDismiss === "function") onDismiss();
  }, [onDismiss]);

  // Retry voice — same as clicking the start button which RoomConvaiChat
  // already exposes. We let RoomConvaiChat handle the actual SDK call.
  const retryVoice = useCallback(() => {
    const startBtn = document.querySelector('[data-testid="convai-start-btn"]');
    if (startBtn && typeof startBtn.click === "function") {
      startBtn.click();
    }
    if (typeof onDismiss === "function") onDismiss();
  }, [onDismiss]);

  if (!visible) return null;

  return (
    <div
      data-testid="voice-recovery-card"
      className="mb-4 rounded-2xl border border-[hsl(var(--aurin-border-soft))] bg-[hsl(var(--aurin-bg-elev))/0.65] p-5 backdrop-blur"
    >
      <p
        className="aurin-serif text-[15.5px] text-[hsl(var(--aurin-text))/0.92] mb-2"
        data-testid="voice-recovery-title"
      >
        A small connection issue interrupted the voice session.
      </p>
      <p className="text-[12.5px] text-[hsl(var(--aurin-text))/0.65] leading-relaxed mb-4">
        Your conversation is still here. You can continue writing,
        try voice again, or switch to hybrid mode while the connection
        stabilizes.
        {errorMsg ? (
          <span className="block mt-2 text-[11.5px] text-[hsl(var(--aurin-text))/0.45]">
            {errorMsg}
          </span>
        ) : null}
      </p>
      <div className="flex flex-wrap gap-2.5">
        <button
          type="button"
          data-testid="voice-recovery-continue-text"
          onClick={() => switchMode("text")}
          className="aurin-btn-primary text-[12.5px]"
        >
          Continue in text
        </button>
        <button
          type="button"
          data-testid="voice-recovery-retry-voice"
          onClick={retryVoice}
          className="aurin-btn-ghost text-[12.5px]"
        >
          Retry voice
        </button>
        <button
          type="button"
          data-testid="voice-recovery-switch-hybrid"
          onClick={() => switchMode("hybrid")}
          className="aurin-btn-ghost text-[12.5px]"
        >
          Switch to hybrid
        </button>
      </div>
    </div>
  );
}

export default VoiceRecoveryCard;
