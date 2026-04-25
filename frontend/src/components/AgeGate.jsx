import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ShieldAlert, Lock, ArrowLeft } from "lucide-react";

const STORAGE_KEY = "aurin_age_confirmed_v1";
const GATED_PATHS = ["/learning", "/meditation-corner"];

/**
 * AgeGate — client-side modal that enforces an 18+ confirmation before
 * /learning and /meditation-corner. Persists in localStorage until the
 * user resets it from the User Portal. Kids Universe is NEVER gated.
 */
export default function AgeGate() {
  const location = useLocation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [confirmed, setConfirmed] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.localStorage.getItem(STORAGE_KEY) === "true";
  });

  useEffect(() => {
    const isGated = GATED_PATHS.some((p) => location.pathname.startsWith(p));
    if (isGated && !confirmed) {
      setOpen(true);
    } else {
      setOpen(false);
    }
  }, [location.pathname, confirmed]);

  const handleConfirm = () => {
    window.localStorage.setItem(STORAGE_KEY, "true");
    setConfirmed(true);
    setOpen(false);
  };

  const handleLeave = () => {
    setOpen(false);
    navigate("/", { replace: true });
  };

  if (!open) return null;

  return (
    <div
      data-testid="age-gate-modal"
      className="fixed inset-0 z-[80] flex items-end md:items-center justify-center"
      role="dialog"
      aria-modal="true"
    >
      <div
        className="absolute inset-0"
        style={{ backgroundColor: "hsla(140, 12%, 4%, 0.78)", backdropFilter: "blur(10px)" }}
        onClick={handleLeave}
      />
      <div
        className="relative w-full md:max-w-md mx-4 mb-4 md:mb-0 aurin-card p-8"
        style={{ backgroundColor: "hsl(var(--aurin-surface))" }}
      >
        <div className="flex items-center gap-2.5 mb-5">
          <div className="w-9 h-9 rounded-full border border-[hsl(var(--aurin-border))] flex items-center justify-center text-[hsl(var(--aurin-sand))]">
            <ShieldAlert size={16} strokeWidth={1.5} />
          </div>
          <div className="aurin-eyebrow !mb-0">Adults only · 18+</div>
        </div>
        <h2 className="aurin-display text-2xl md:text-3xl leading-snug">
          Confirm you are{" "}
          <span className="aurin-serif-italic text-[hsl(var(--aurin-sage))]">
            18 or older
          </span>{" "}
          to access this content.
        </h2>
        <p className="mt-4 text-[14px] leading-relaxed text-[hsl(var(--aurin-text-muted))]">
          The Learning and Meditation sections of Matrix Aurin are written for
          adults. For children's content, please visit the Kids Universe — it
          stays open and separate, with no gate.
        </p>
        <div className="mt-7 flex flex-wrap gap-3">
          <button
            data-testid="age-gate-confirm"
            onClick={handleConfirm}
            className="aurin-btn aurin-btn-primary"
          >
            <Lock size={13} /> I am 18 or older
          </button>
          <button
            data-testid="age-gate-kids"
            onClick={() => {
              setOpen(false);
              navigate("/kids-universe", { replace: true });
            }}
            className="aurin-btn aurin-btn-ghost"
          >
            Visit Kids Universe
          </button>
          <button
            data-testid="age-gate-leave"
            onClick={handleLeave}
            className="aurin-btn aurin-btn-ghost"
          >
            <ArrowLeft size={13} /> Take me home
          </button>
        </div>
        <p className="mt-6 text-[11px] uppercase tracking-[0.2em] text-[hsl(var(--aurin-text-muted))]">
          Confirmation is stored on this device.
        </p>
      </div>
    </div>
  );
}

export function resetAgeConfirmation() {
  if (typeof window !== "undefined") {
    window.localStorage.removeItem(STORAGE_KEY);
  }
}
