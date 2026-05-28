/**
 * KidsDayPassRow.jsx — the single numeric price shown on public
 * room-intro (visitkaart) pages during the Coming-Soon phase.
 *
 * Strategy v2.3.1 §6: this is the SOLE pre-gate price disclosure.
 * Adult day-passes, recurring bundles, Sovereign tiers all stay
 * behind the qualification gate.
 *
 * Behaviour: clicking the CTA calls /api/billing/checkout/session
 * with sku_code "access.day.kids" and redirects the user to Polar's
 * hosted checkout. Anonymous visitors are routed through
 * /portal?next=... first (magic-link email sign-in lives there)
 * because the checkout API requires a user.
 */
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function KidsDayPassRow() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const start = async () => {
    setError("");
    setLoading(true);
    try {
      const apiBase = process.env.REACT_APP_BACKEND_URL;
      const resp = await fetch(`${apiBase}/api/billing/checkout/session`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ sku_code: "access.day.kids" }),
      });
      if (resp.status === 401) {
        navigate(`/portal?next=${encodeURIComponent(window.location.pathname)}`);
        return;
      }
      const data = await resp.json();
      if (!resp.ok || !data?.url) {
        throw new Error(data?.detail || "Could not open checkout");
      }
      window.location.assign(data.url);
    } catch (e) {
      setError(String(e?.message || e));
      setLoading(false);
    }
  };

  return (
    <div
      data-testid="kids-day-pass-row"
      className="my-10 mx-auto max-w-2xl border-t border-b border-[hsla(36,18%,72%,0.18)] py-7 text-center"
    >
      <p
        className="text-[12.5px] uppercase tracking-[0.28em] mb-2"
        style={{ color: "hsla(36, 22%, 70%, 0.85)" }}
      >
        A quiet bedtime passage for children
      </p>
      <p
        className="aurin-display text-2xl italic mb-5"
        style={{ color: "hsl(36, 20%, 86%)" }}
      >
        from <span className="not-italic">€25</span>
      </p>
      <button
        type="button"
        onClick={start}
        disabled={loading}
        data-testid="kids-day-pass-start-button"
        className="inline-flex items-center justify-center px-6 py-3 text-[12.5px] uppercase tracking-[0.22em] transition-all duration-500 border border-[hsla(36,18%,72%,0.4)] hover:border-[hsla(36,28%,80%,0.85)] disabled:opacity-50"
        style={{
          color: "hsl(36, 20%, 90%)",
          background: "hsla(36, 10%, 12%, 0.4)",
          letterSpacing: "0.22em",
        }}
      >
        {loading ? "Opening passage…" : "Step inside · 24 h"}
      </button>
      {error && (
        <p
          data-testid="kids-day-pass-error"
          className="mt-3 text-[12px] tracking-wide"
          style={{ color: "hsl(8, 60%, 70%)" }}
        >
          {error}
        </p>
      )}
      <p
        className="mt-5 text-[11px] tracking-[0.16em]"
        style={{ color: "hsla(36, 14%, 64%, 0.7)" }}
      >
        One calm audio story · one parent-guided check-in · no subscription
      </p>
    </div>
  );
}
