/**
 * TruthSequenceModal — "Walk through truth first" interactive gate.
 *
 * §TRUTH-SEQUENCE 2026-02-13 — Founder directive (P1).
 *
 * Before granting the wanderer access to the four cardinal rooms, a
 * short, slow, deliberately anti-dopamine sequence is offered. Five
 * quiet questions, each on its own breath. The visitor is never
 * scored, never tagged, never categorised — the *act* of pausing IS
 * the filter. HNW operators will sit; the rest will close the tab.
 *
 * Mechanics:
 *   - Each step holds for at least 4 seconds before the continue
 *     affordance fades in. There is no "skip".
 *   - Yes/No answers are stored only in localStorage so the same
 *     visitor is not asked twice in one session.
 *   - The final step is a one-line breath ("You may walk through.")
 *     and a single, slow CTA to /portal.
 *   - Heritage testid: data-testid="truth-sequence-modal".
 */
import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";

const SERIF = '"Cormorant Garamond", "EB Garamond", Georgia, serif';
const BRASS = "#c4a46b";
const BRASS_BRIGHT = "#d4b67d";
const CREAM = "#f0eadd";
const SOFT = "#bcb4a3";

// Minimum hold (ms) before the continue button is revealed on each
// step. Deliberately uncomfortably slow — the silence is the product.
const STEP_HOLD_MS = 4200;

const STEPS = [
  {
    key: "stillness",
    eyebrow: "I",
    headline: "Can you sit for a moment?",
    body: "Not a productive moment. Not a useful one. Just a small one, with your breath and your shoulders.",
    primary: "I can sit",
    secondary: "Not tonight",
  },
  {
    key: "noise",
    eyebrow: "II",
    headline: "What is loudest in you right now?",
    body: "A worry. A list. A name. A weight in the chest. You do not have to answer — only notice that you know.",
    primary: "I noticed",
    secondary: "Still scanning",
  },
  {
    key: "honesty",
    eyebrow: "III",
    headline: "Are you here to perform, or to be?",
    body: "There is no shame in either. But the room only opens for the second one. The mask cannot come in.",
    primary: "To be",
    secondary: "Not yet",
  },
  {
    key: "pace",
    eyebrow: "IV",
    headline: "Slow is not weakness.",
    body: "Nothing here will be hurried for you. The next door does not open faster if you push it. That is the design.",
    primary: "I understand",
    secondary: "I need a moment",
  },
  {
    key: "threshold",
    eyebrow: "V",
    headline: "You may walk through.",
    body: "Bring only what is true. Leave the rest at the threshold. The first room is closer than you think.",
    primary: "Step inside",
    secondary: null,
    isFinal: true,
  },
];

const STORAGE_KEY = "matrix_aurin.truth_sequence.walked_at";

function hasWalkedRecently() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return false;
    const walkedAt = parseInt(raw, 10);
    if (!walkedAt || Number.isNaN(walkedAt)) return false;
    // Re-prompt after 30 days — long enough that returning founders
    // are not nagged, short enough that quarterly re-grounding lands.
    return Date.now() - walkedAt < 30 * 24 * 60 * 60 * 1000;
  } catch {
    return false;
  }
}

function markWalked() {
  try {
    localStorage.setItem(STORAGE_KEY, String(Date.now()));
  } catch {
    /* noop */
  }
}

export default function TruthSequenceModal({ open, onClose, onComplete }) {
  const [stepIdx, setStepIdx] = useState(0);
  const [revealCta, setRevealCta] = useState(false);
  const holdTimer = useRef(null);
  const step = STEPS[stepIdx];
  const isFinal = !!step?.isFinal;

  // Lock background scroll while modal is open.
  useEffect(() => {
    if (!open) return undefined;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  // Reset to step 0 each time the modal opens.
  useEffect(() => {
    if (open) {
      setStepIdx(0);
      setRevealCta(false);
    }
  }, [open]);

  // Per-step minimum hold before the affordance becomes pressable.
  useEffect(() => {
    if (!open) return undefined;
    setRevealCta(false);
    if (holdTimer.current) clearTimeout(holdTimer.current);
    holdTimer.current = setTimeout(() => setRevealCta(true), STEP_HOLD_MS);
    return () => {
      if (holdTimer.current) clearTimeout(holdTimer.current);
    };
  }, [open, stepIdx]);

  // Allow ESC to close (only on non-final steps — final has its own
  // explicit CTA into the house).
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key === "Escape" && !isFinal) onClose?.();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, isFinal, onClose]);

  const progress = useMemo(
    () => ((stepIdx + 1) / STEPS.length) * 100,
    [stepIdx],
  );

  if (!open) return null;

  const handlePrimary = () => {
    if (!revealCta) return;
    if (isFinal) {
      markWalked();
      onComplete?.();
      return;
    }
    setStepIdx((i) => Math.min(STEPS.length - 1, i + 1));
  };

  const handleSecondary = () => {
    onClose?.();
  };

  return (
    <div
      data-testid="truth-sequence-modal"
      className="fixed inset-0 z-[100] flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="truth-sequence-headline"
    >
      {/* Veil — heavy, brass-keyed, blurred. Tapping it does NOT close;
          the wanderer must consciously walk through or step back. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 backdrop-blur-[24px]"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% 50%, rgba(20,17,13,0.92) 0%, rgba(11,10,8,0.98) 70%, #0b0a08 100%)",
        }}
      />

      {/* Stage */}
      <div
        className="relative z-10 w-full max-w-[680px] px-8 sm:px-12 py-14 mx-6 border border-[rgba(196,164,107,0.18)]"
        style={{
          background:
            "linear-gradient(180deg, rgba(20,17,13,0.85) 0%, rgba(15,13,10,0.92) 100%)",
        }}
        data-testid="truth-sequence-stage"
      >
        {/* Progress veins */}
        <div
          aria-hidden="true"
          className="absolute top-0 left-0 right-0 h-px"
          style={{ background: "rgba(196,164,107,0.12)" }}
        />
        <div
          aria-hidden="true"
          className="absolute top-0 left-0 h-px transition-all duration-[1800ms] ease-out"
          style={{
            width: `${progress}%`,
            background: `linear-gradient(90deg, transparent 0%, ${BRASS} 60%, ${BRASS_BRIGHT} 100%)`,
          }}
          data-testid="truth-sequence-progress"
        />

        {/* Step transition wrapper */}
        <div
          key={step.key}
          className="opacity-0 animate-truth-fade"
          style={{
            animation: "truthFadeIn 1600ms ease-out forwards",
          }}
        >
          <p
            data-testid={`truth-step-eyebrow-${step.key}`}
            className="text-[10px] tracking-[0.44em] uppercase font-light"
            style={{ color: BRASS, fontFamily: SERIF }}
          >
            {step.eyebrow} · Truth Sequence
          </p>

          <h2
            id="truth-sequence-headline"
            data-testid={`truth-step-headline-${step.key}`}
            className="mt-8 font-light text-[28px] sm:text-[36px] leading-[1.18]"
            style={{
              color: CREAM,
              fontFamily: SERIF,
              letterSpacing: "-0.005em",
            }}
          >
            {step.headline}
          </h2>

          <p
            data-testid={`truth-step-body-${step.key}`}
            className="mt-7 text-[15px] sm:text-[16px] leading-[1.75] italic font-light"
            style={{ color: SOFT, fontFamily: SERIF }}
          >
            {step.body}
          </p>

          {/* Actions — fade in only after the minimum hold so the
              wanderer cannot tap-spam through the sequence. */}
          <div
            className="mt-12 flex flex-col sm:flex-row gap-5 sm:gap-7 sm:items-center transition-opacity duration-[1400ms] ease-out"
            style={{
              opacity: revealCta ? 1 : 0,
              pointerEvents: revealCta ? "auto" : "none",
            }}
            aria-hidden={!revealCta}
          >
            {isFinal ? (
              <Link
                to="/portal"
                onClick={handlePrimary}
                data-testid="truth-sequence-enter"
                className="inline-flex items-center justify-center gap-3 text-[12px] tracking-[0.36em] uppercase border px-11 py-4 transition-colors duration-700"
                style={{
                  color: BRASS,
                  borderColor: "rgba(196,164,107,0.55)",
                  fontFamily: SERIF,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = BRASS;
                  e.currentTarget.style.color = "#0b0a08";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "transparent";
                  e.currentTarget.style.color = BRASS;
                }}
              >
                {step.primary}
              </Link>
            ) : (
              <button
                type="button"
                onClick={handlePrimary}
                data-testid={`truth-step-primary-${step.key}`}
                className="inline-flex items-center justify-center gap-3 text-[12px] tracking-[0.36em] uppercase border px-11 py-4 transition-colors duration-700"
                style={{
                  color: BRASS,
                  borderColor: "rgba(196,164,107,0.55)",
                  fontFamily: SERIF,
                  background: "transparent",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = BRASS;
                  e.currentTarget.style.color = "#0b0a08";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "transparent";
                  e.currentTarget.style.color = BRASS;
                }}
              >
                {step.primary}
              </button>
            )}

            {step.secondary && (
              <button
                type="button"
                onClick={handleSecondary}
                data-testid={`truth-step-secondary-${step.key}`}
                className="text-[11px] tracking-[0.28em] uppercase underline-offset-[8px] hover:underline transition-colors duration-500"
                style={{ color: "#a59f93", fontFamily: SERIF }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = "#e8e1d5";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = "#a59f93";
                }}
              >
                {step.secondary}
              </button>
            )}
          </div>

          {/* Anti-dopamine note */}
          {!revealCta && (
            <p
              data-testid="truth-step-holding"
              className="mt-12 text-[10.5px] tracking-[0.32em] uppercase font-light"
              style={{ color: "rgba(165,159,147,0.55)", fontFamily: SERIF }}
            >
              · sit with this for a breath ·
            </p>
          )}
        </div>

        {/* Step counter */}
        <p
          data-testid="truth-step-counter"
          className="mt-14 text-[10px] tracking-[0.32em] uppercase font-light"
          style={{ color: "rgba(165,159,147,0.45)", fontFamily: SERIF }}
        >
          {String(stepIdx + 1).padStart(2, "0")} · {String(STEPS.length).padStart(2, "0")}
        </p>
      </div>

      {/* Keyframes injected inline so this component is self-contained. */}
      <style>{`
        @keyframes truthFadeIn {
          0%   { opacity: 0; transform: translateY(8px); }
          100% { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

export { hasWalkedRecently, markWalked };
