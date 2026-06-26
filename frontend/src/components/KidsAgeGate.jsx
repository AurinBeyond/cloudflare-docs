/**
 * KidsAgeGate.jsx — §K4 BUILDER-CONTEST COMPLIANCE 2026-02-29
 *
 * Lightweight age-gate modal shown once per browser on the first
 * visit to /kids-universe and /kids-universe/polarstar.
 *
 * Two outcomes, both honest:
 *   · "Yes — I'm a parent or guardian"  → confirmation stored, modal
 *                                          dismissed for the session.
 *   · "I'm under 18"                    → quietly redirects out of
 *                                          the kids surface to the
 *                                          generic /library page, no
 *                                          shame, no scolding.
 *
 * Storage: localStorage key `aurin:kids:adult-confirmed:v1` = "true".
 * Cleared automatically on the next major build (key versioned).
 *
 * Design lock: paper/ink palette (matches /from-anna and Polarstar).
 * No emoji, no aggressive copy. Quiet, two buttons, one line of
 * explanation, dismissable by route change.
 */
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const STORAGE_KEY = "aurin:kids:adult-confirmed:v1";

const SERIF = '"Cormorant Garamond", "EB Garamond", Georgia, serif';

export default function KidsAgeGate() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    try {
      const confirmed = window.localStorage.getItem(STORAGE_KEY);
      if (!confirmed) setOpen(true);
    } catch {
      // localStorage may be blocked in private mode — show the gate.
      setOpen(true);
    }
  }, []);

  const confirmAdult = () => {
    try {
      window.localStorage.setItem(STORAGE_KEY, "true");
    } catch {
      /* noop */
    }
    setOpen(false);
  };

  const declineMinor = () => {
    try {
      window.localStorage.setItem(STORAGE_KEY, "minor");
    } catch {
      /* noop */
    }
    setOpen(false);
    navigate("/library", { replace: true });
  };

  if (!open) return null;

  return (
    <div
      data-testid="kids-age-gate-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="kids-age-gate-title"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        background: "rgba(8, 10, 16, 0.78)",
        backdropFilter: "blur(14px)",
        WebkitBackdropFilter: "blur(14px)",
      }}
    >
      <div
        data-testid="kids-age-gate-card"
        style={{
          maxWidth: 460,
          width: "100%",
          padding: "44px 36px 36px",
          background: "rgba(247, 240, 224, 0.97)",
          border: "1px solid rgba(72, 56, 36, 0.22)",
          boxShadow: "0 24px 60px -20px rgba(0,0,0,0.6)",
          color: "#2a2118",
          fontFamily: SERIF,
        }}
      >
        <p
          style={{
            fontSize: 10.5,
            letterSpacing: "0.42em",
            textTransform: "uppercase",
            color: "#7a5a2a",
            marginBottom: 18,
          }}
        >
          — A quiet question first
        </p>

        <h2
          id="kids-age-gate-title"
          data-testid="kids-age-gate-title"
          style={{
            fontFamily: SERIF,
            fontSize: 26,
            lineHeight: 1.22,
            fontWeight: 400,
            marginBottom: 18,
            color: "#2a2118",
          }}
        >
          Are you a parent or guardian?
        </h2>

        <p
          style={{
            fontSize: 14.5,
            lineHeight: 1.7,
            color: "#4a3a26",
            marginBottom: 28,
            fontFamily: SERIF,
            fontStyle: "italic",
          }}
        >
          Polarstar Kids is held by an adult for the child. We ask once
          so the door is opened by the right hand.
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <button
            type="button"
            data-testid="kids-age-gate-confirm"
            onClick={confirmAdult}
            style={{
              padding: "14px 20px",
              background: "#2a2118",
              color: "#f0eadd",
              border: "1px solid #2a2118",
              fontFamily: SERIF,
              fontSize: 13,
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              cursor: "pointer",
              transition: "background 250ms ease",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#3a2f22")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "#2a2118")}
          >
            Yes — I am the adult here
          </button>

          <button
            type="button"
            data-testid="kids-age-gate-minor"
            onClick={declineMinor}
            style={{
              padding: "14px 20px",
              background: "transparent",
              color: "#5a4838",
              border: "1px solid rgba(72, 56, 36, 0.4)",
              fontFamily: SERIF,
              fontSize: 12.5,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              cursor: "pointer",
              transition: "background 250ms ease",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.background = "rgba(72, 56, 36, 0.08)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.background = "transparent")
            }
          >
            I am under 18
          </button>
        </div>

        <p
          data-testid="kids-age-gate-footnote"
          style={{
            marginTop: 24,
            fontSize: 11.5,
            lineHeight: 1.65,
            color: "#7a6a55",
            fontFamily: SERIF,
            fontStyle: "italic",
          }}
        >
          This is asked once. If you are under 18, we&apos;ll quietly walk
          you to the Library — there is plenty there for you, too.
        </p>
      </div>
    </div>
  );
}
