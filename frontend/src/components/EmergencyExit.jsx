import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";
import { clarityEmergencyExit } from "@/lib/api";

/**
 * EmergencyExit — a "ghost button" anchored bottom-right of any room
 * surface. Subtle by design: barely visible, but always there. One
 * click closes the active encrypted session, purges local chat state,
 * and returns the visitor to the home page in a single fade-to-black.
 *
 * Critical contract: this MUST never throw a confirmation dialog. The
 * whole point is "someone walked in, close it now." Speed > polish.
 */
export default function EmergencyExit({ onBeforeExit }) {
  const navigate = useNavigate();
  const [exiting, setExiting] = useState(false);

  const handleExit = async () => {
    if (exiting) return;
    setExiting(true);
    try {
      await clarityEmergencyExit().catch(() => null);
    } finally {
      try {
        if (typeof onBeforeExit === "function") onBeforeExit();
      } catch {
        /* swallow — never block the exit */
      }
      // Brief fade then redirect.
      setTimeout(() => navigate("/", { replace: true }), 120);
    }
  };

  return (
    <>
      {exiting && (
        <div
          data-testid="clarity-exit-veil"
          className="fixed inset-0 bg-[hsl(var(--aurin-bg))] z-[100] transition-opacity duration-200"
          style={{ opacity: 1 }}
          aria-hidden="true"
        />
      )}
      <button
        type="button"
        onClick={handleExit}
        disabled={exiting}
        data-testid="clarity-emergency-exit"
        title="Close this room immediately"
        aria-label="Emergency exit — close this room"
        className="fixed bottom-5 right-5 z-50 inline-flex items-center gap-2 px-3.5 py-2 rounded-full text-[11px] uppercase tracking-[0.22em] text-[hsl(var(--aurin-text-muted))]/70 hover:text-[hsl(var(--aurin-sage))] border border-[hsl(var(--aurin-border-soft))]/50 hover:border-[hsl(var(--aurin-sage))]/60 bg-[hsl(var(--aurin-bg))]/70 backdrop-blur-sm transition-colors"
      >
        <LogOut size={11} strokeWidth={1.4} />
        <span>Exit</span>
      </button>
    </>
  );
}
