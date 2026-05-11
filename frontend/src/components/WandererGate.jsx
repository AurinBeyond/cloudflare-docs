/**
 * WandererGate.jsx — Hard-gate modal that blocks access to private/sensitive
 * rooms (Clarity Release, Body Room) until the visitor has consciously
 * accepted the Wanderer's Agreement.
 *
 * Persists acceptance two ways:
 *   1. localStorage `wanderer_visitor_id` + `wanderer_accepted_v{X}_{scope}`
 *   2. Backend `db.agreement_acceptances` (POST /api/agreement/accept)
 *
 * On mount: checks localStorage first (fast path); if missing, calls
 * GET /api/agreement/status. While unaccepted, renders a calm full-screen
 * overlay with 4 checkboxes + a single soft button.
 *
 * Tone follows the WANDERER'S AGREEMENT PDF — never "ACCEPT NOW", never
 * "SUBMIT". The button reads: "I enter consciously".
 */
import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router-dom";

const API = process.env.REACT_APP_BACKEND_URL;
const AGREEMENT_VERSION = "1.1-2026-02-11-psych-exclusion";

function getOrCreateVisitorId() {
  try {
    let id = localStorage.getItem("wanderer_visitor_id");
    if (!id) {
      id =
        "v_" +
        Math.random().toString(36).slice(2, 11) +
        Date.now().toString(36);
      localStorage.setItem("wanderer_visitor_id", id);
    }
    return id;
  } catch {
    return "anon_" + Math.random().toString(36).slice(2, 11);
  }
}

const CLAUSES = [
  "I understand that this is an educational and reflective environment, not medical care.",
  "I understand that no specific outcomes are promised, and that this is not therapy, counselling, or a substitute for a licensed practitioner.",
  "I confirm I am not currently under psychiatric care and do not carry a psychiatric diagnosis. (If I do, I will use a licensed practitioner instead — this space is not for me.)",
  "I take full responsibility for my own decisions, choices, and wellbeing while using this space.",
  "I agree not to redistribute protected materials without permission.",
];

export default function WandererGate({ scope = "private", children }) {
  const [accepted, setAccepted] = useState(null); // null | true | false
  const [checks, setChecks] = useState(
    () => Array(CLAUSES.length).fill(false),
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const visitorId = useMemo(getOrCreateVisitorId, []);
  const localKey = `wanderer_accepted_${AGREEMENT_VERSION}_${scope}`;

  useEffect(() => {
    let alive = true;
    // Fast path: localStorage.
    try {
      const cached = localStorage.getItem(localKey);
      if (cached === "1") {
        setAccepted(true);
        return () => {};
      }
    } catch {}
    // Slow path: server.
    (async () => {
      try {
        const r = await fetch(
          `${API}/api/agreement/status?visitor_id=${encodeURIComponent(
            visitorId,
          )}&scope=${scope}`,
        );
        const d = await r.json();
        if (!alive) return;
        if (d?.accepted) {
          try {
            localStorage.setItem(localKey, "1");
          } catch {}
          setAccepted(true);
        } else {
          setAccepted(false);
        }
      } catch {
        if (alive) setAccepted(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [scope, visitorId, localKey]);

  const allChecked = checks.every(Boolean);

  async function handleAccept() {
    if (!allChecked || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const r = await fetch(`${API}/api/agreement/accept`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scope, visitor_id: visitorId, locale: "en" }),
      });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      try {
        localStorage.setItem(localKey, "1");
      } catch {}
      setAccepted(true);
    } catch (e) {
      setError(
        "We couldn't record that just now. The room is still open if you wish to enter — try again in a breath.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  // Loading: render children blank-out so the modal doesn't flash.
  if (accepted === null) {
    return (
      <div
        data-testid="wanderer-gate-loading"
        className="min-h-[40vh] flex items-center justify-center text-[hsl(var(--aurin-text-muted))]"
      >
        Quiet. Loading.
      </div>
    );
  }

  if (accepted === true) {
    return children;
  }

  return createPortal(
    <div
      data-testid="wanderer-gate"
      className="fixed inset-0 flex items-center justify-center px-4 py-10 overflow-y-auto"
      style={{
        backgroundColor: "hsl(140, 14%, 4%)",
        zIndex: 9999,
      }}
    >
      <div className="max-w-xl w-full">
        <div className="aurin-eyebrow text-[hsl(var(--aurin-sage))/0.85] mb-5">
          Before you enter
        </div>
        <h2
          data-testid="wanderer-gate-title"
          className="aurin-display text-3xl md:text-4xl leading-tight mb-6 text-[hsl(var(--aurin-text))]"
        >
          A quiet threshold, with clear edges.
        </h2>
        <p className="text-[15px] leading-relaxed text-[hsl(var(--aurin-text-muted))] mb-6">
          This space was created for reflection, learning, and slow inner work.
          It is not a replacement for medical care, psychological treatment,
          financial advice, or emergency support. Some responses may be
          generated with AI-assisted systems; please use your own judgement.
        </p>
        <p className="text-[15px] leading-relaxed text-[hsl(var(--aurin-text-muted))] mb-8">
          Please read each line. Tick what is true for you, and only continue
          if it feels right.
        </p>

        <ul className="space-y-3 mb-8" data-testid="wanderer-gate-checks">
          {CLAUSES.map((line, i) => (
            <li key={i}>
              <label className="flex items-start gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  data-testid={`wanderer-gate-check-${i}`}
                  checked={checks[i]}
                  onChange={(e) => {
                    const next = checks.slice();
                    next[i] = e.target.checked;
                    setChecks(next);
                  }}
                  className="mt-1 w-4 h-4 rounded-sm border border-[hsl(var(--aurin-sage))/0.6] accent-[hsl(var(--aurin-sage))]"
                />
                <span className="text-[14.5px] leading-relaxed text-[hsl(var(--aurin-text))/0.9] group-hover:text-[hsl(var(--aurin-text))] transition-colors">
                  {line}
                </span>
              </label>
            </li>
          ))}
        </ul>

        {error && (
          <p
            data-testid="wanderer-gate-error"
            className="text-[13px] aurin-serif-italic text-[hsl(var(--aurin-text-muted))] mb-5"
          >
            {error}
          </p>
        )}

        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <button
            type="button"
            data-testid="wanderer-gate-accept"
            onClick={handleAccept}
            disabled={!allChecked || submitting}
            className="aurin-btn aurin-btn-ghost disabled:opacity-30 disabled:cursor-not-allowed"
          >
            {submitting ? "One breath…" : "I enter consciously"}
          </button>
          <Link
            to="/wanderers-agreement"
            data-testid="wanderer-gate-read-full"
            className="aurin-link text-[13px] tracking-wide"
          >
            Read the full Wanderer's Agreement
          </Link>
        </div>

        <p className="mt-8 text-[12px] aurin-serif-italic text-[hsl(var(--aurin-sage))/0.7]">
          You are free to leave at any time. Closing this page is also a valid
          answer.
        </p>
      </div>
    </div>,
    document.body,
  );
}
