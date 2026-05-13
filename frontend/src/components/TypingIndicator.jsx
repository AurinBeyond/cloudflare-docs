/**
 * TypingIndicator.jsx — §Phase 1 follow-up (2026-02-14).
 *
 * Founder feedback: the 1.1-1.5s thoughtful pause + 2-4s LLM
 * generation window felt like dead air. The wanderer can't tell if
 * the system is composing a reply or if it froze. We add a tiny,
 * tasteful "three dot" indicator that fades in only during that
 * window — minimal motion, calm, non-distracting.
 *
 * Constraints (founder Variant C lock):
 *   - Three small dots, NOT spinning circles or text labels.
 *   - Fade in over 200ms, fade out over 200ms.
 *   - Each dot pulses softly (0.4 → 1.0 opacity) on a 1.4s stagger.
 *   - prefers-reduced-motion → static three dots, no pulse.
 *
 * Renders nothing when `visible` is false.
 */
import React from "react";

export default function TypingIndicator({
  visible = false,
  testid = "typing-indicator",
}) {
  if (!visible) return null;
  return (
    <div
      data-testid={testid}
      role="status"
      aria-label="The mentor is composing a reply"
      className="aurin-typing-indicator inline-flex items-center gap-1.5 px-2 py-1 opacity-0 animate-[aurin-typing-fade-in_220ms_ease-out_forwards]"
    >
      <span className="aurin-typing-dot" style={{ animationDelay: "0ms" }} />
      <span className="aurin-typing-dot" style={{ animationDelay: "240ms" }} />
      <span className="aurin-typing-dot" style={{ animationDelay: "480ms" }} />
    </div>
  );
}
