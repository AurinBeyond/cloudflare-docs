/**
 * BundleDisclosure.jsx — /membership
 *
 * Post-gate price reveal. Surfaces the full membership architecture
 * v2.3.1 to a visitor who has passed the qualification gate. Reads
 * from a static map (mirrored from MEMBERSHIP_ARCHITECTURE_v2.3.md)
 * and offers one-click Polar checkout for each surface.
 *
 * Public access intentionally — the bundle disclosure surface must be
 * reachable post-gate. The room qualification (the diagnostic) lives
 * upstream on the visitkaart pages.
 */
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const PALETTE = {
  bg:    "hsl(36, 12%, 6%)",
  ink:   "hsl(36, 22%, 90%)",
  muted: "hsla(36, 18%, 72%, 0.8)",
  edge:  "hsla(36, 18%, 60%, 0.18)",
};

const BUNDLES = [
  {
    tier: "I",
    name: "Quiet Entry",
    role: "The reading sanctuary",
    body: "All four cardinal rooms in read mode. The 24-hour cadence stream. The Broken Clockwork library. A small taste of voice.",
    prices: [
      { sku: "quiet.entry.month",   label: "Monthly",   amount: "€89"  },
      { sku: "quiet.entry.quarter", label: "Quarterly", amount: "€239" },
      { sku: "quiet.entry.year",    label: "Annual",    amount: "€890" },
    ],
  },
  {
    tier: "II",
    name: "Aurin Storyteller",
    role: "A standalone bedtime architecture for children",
    body: "Kids Universe across three zones. The Aurin storyteller voice. Emotion check-ins. One child profile. No adult layer.",
    prices: [
      { sku: "aurin.storyteller.month",   label: "Monthly",   amount: "€79"  },
      { sku: "aurin.storyteller.quarter", label: "Quarterly", amount: "€209" },
      { sku: "aurin.storyteller.year",    label: "Annual",    amount: "€790" },
    ],
  },
  {
    tier: "III",
    name: "Inner Compass",
    badge: "The heart",
    role: "Live curator dialogue",
    body: "Everything in Quiet Entry, plus live ConvAI dialogue with the four curators, memory continuity, and the full archive.",
    prices: [
      { sku: "inner.compass.month",   label: "Monthly",   amount: "€229"   },
      { sku: "inner.compass.quarter", label: "Quarterly", amount: "€619"   },
      { sku: "inner.compass.year",    label: "Annual",    amount: "€2,290" },
    ],
  },
  {
    tier: "IV",
    name: "Sanctuary Compass",
    badge: "Family",
    role: "One operating system for the family",
    body: "Inner Compass plus the full Kids Universe. Up to three child profiles. Adult and child voice held in two firewalled vaults.",
    prices: [
      { sku: "sanctuary.compass.month",   label: "Monthly",   amount: "€329"   },
      { sku: "sanctuary.compass.quarter", label: "Quarterly", amount: "€889"   },
      { sku: "sanctuary.compass.year",    label: "Annual",    amount: "€3,290" },
    ],
  },
];

const DAY_PASSES = [
  { sku: "access.day.kids",  name: "Kids Day Pass",  amount: "€25", note: "1 fairytale · 1 check-in · 24 h"   },
  { sku: "access.day.quiet", name: "Quiet Day Pass", amount: "€49", note: "30 min curator voice · 24 h"        },
  { sku: "access.day.deep",  name: "Deep Day Pass",  amount: "€89", note: "60 min full Compass voice · 24 h"   },
];

const TOPUPS_ADULT = [
  { sku: "topup.compass.30",  name: "Adult Voice · 30 min",  amount: "€49",  note: "valid 30 days" },
  { sku: "topup.compass.120", name: "Adult Voice · 120 min", amount: "€159", note: "valid 60 days" },
  { sku: "topup.compass.300", name: "Adult Voice · 300 min", amount: "€399", note: "valid 90 days" },
];

const TOPUPS_KIDS = [
  { sku: "topup.aurin.20",  name: "Aurin Voice · 20 min",  amount: "€29",  note: "valid 30 days" },
  { sku: "topup.aurin.60",  name: "Aurin Voice · 60 min",  amount: "€79",  note: "valid 60 days" },
  { sku: "topup.aurin.150", name: "Aurin Voice · 150 min", amount: "€169", note: "valid 90 days" },
];

function useCheckoutStarter() {
  const navigate = useNavigate();
  const [busySku, setBusySku] = useState("");
  const [error, setError] = useState("");

  const start = async (sku_code) => {
    setError("");
    setBusySku(sku_code);
    try {
      const apiBase = process.env.REACT_APP_BACKEND_URL;
      const resp = await fetch(`${apiBase}/api/billing/checkout/session`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ sku_code }),
      });
      if (resp.status === 401) {
        navigate(`/sign-in?next=${encodeURIComponent(window.location.pathname)}`);
        return;
      }
      const data = await resp.json();
      if (!resp.ok || !data?.url) throw new Error(data?.detail || "Checkout failed");
      window.location.assign(data.url);
    } catch (e) {
      setError(String(e?.message || e));
      setBusySku("");
    }
  };
  return { start, busySku, error };
}

export default function BundleDisclosure() {
  const { start, busySku, error } = useCheckoutStarter();
  const [cohortSeats, setCohortSeats] = useState(null);

  useEffect(() => {
    const apiBase = process.env.REACT_APP_BACKEND_URL;
    fetch(`${apiBase}/api/billing/cohort-seats`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        const std = (d?.sovereign_cohorts || []).find(
          (s) => s.sku === "sovereign.standard.quarter",
        );
        if (std) setCohortSeats(std.seats_remaining);
      })
      .catch(() => {});
  }, []);

  return (
    <div
      data-testid="bundle-disclosure-page"
      className="min-h-screen px-5 py-16"
      style={{ background: PALETTE.bg, color: PALETTE.ink }}
    >
      <div className="max-w-5xl mx-auto">
        <header className="text-center mb-14">
          <p
            className="text-[12px] uppercase tracking-[0.28em] mb-3"
            style={{ color: PALETTE.muted }}
          >
            The Compass Ladder
          </p>
          <h1 className="aurin-display text-4xl sm:text-5xl italic">
            Four rooms. One quiet architecture.
          </h1>
          <p
            className="mt-5 text-[14px] tracking-wide max-w-xl mx-auto"
            style={{ color: PALETTE.muted, lineHeight: 1.85 }}
          >
            Members buy access to architecture, continuity, atmosphere,
            and private space — never AI minutes. Minutes exist only to
            create the felt presence of the curators, and they remain
            metered so the platform survives.
          </p>
        </header>

        {/* The four recurring bundles */}
        <section data-testid="bundles-recurring" className="space-y-8 mb-20">
          {BUNDLES.map((b) => (
            <article
              key={b.name}
              data-testid={`bundle-${b.tier.toLowerCase()}`}
              className="border-t pt-7"
              style={{ borderColor: PALETTE.edge }}
            >
              <div className="flex items-baseline justify-between flex-wrap gap-3 mb-2">
                <div>
                  <span
                    className="text-[11px] tracking-[0.28em] uppercase mr-3"
                    style={{ color: PALETTE.muted }}
                  >
                    Tier {b.tier}
                  </span>
                  <span className="aurin-display text-2xl italic">{b.name}</span>
                </div>
                {b.badge && (
                  <span
                    className="text-[10.5px] uppercase tracking-[0.28em] px-2 py-0.5 border"
                    style={{ borderColor: PALETTE.edge, color: PALETTE.ink }}
                  >
                    {b.badge}
                  </span>
                )}
              </div>
              <p className="text-[13px] tracking-wide mb-3" style={{ color: PALETTE.muted }}>
                {b.role}
              </p>
              <p
                className="text-[14px] mb-5 max-w-2xl"
                style={{ color: PALETTE.ink, lineHeight: 1.75 }}
              >
                {b.body}
              </p>
              <div className="flex flex-wrap gap-3">
                {b.prices.map((p) => (
                  <button
                    key={p.sku}
                    onClick={() => start(p.sku)}
                    disabled={!!busySku}
                    data-testid={`buy-${p.sku.replaceAll(".", "-")}`}
                    className="px-5 py-3 text-[12.5px] tracking-[0.18em] uppercase border transition-all duration-500 disabled:opacity-40"
                    style={{
                      borderColor: PALETTE.edge,
                      color: PALETTE.ink,
                      background: "hsla(36, 10%, 12%, 0.55)",
                    }}
                  >
                    {busySku === p.sku ? "Opening…" : `${p.label} · ${p.amount}`}
                  </button>
                ))}
              </div>
            </article>
          ))}
        </section>

        {/* Sovereign anchor */}
        <section
          data-testid="bundles-sovereign"
          className="border-t pt-9 mb-20 text-center"
          style={{ borderColor: PALETTE.edge }}
        >
          <p
            className="text-[11px] tracking-[0.28em] uppercase mb-3"
            style={{ color: PALETTE.muted }}
          >
            Tier V · Sovereign Circle
          </p>
          <h2 className="aurin-display italic text-2xl mb-4">
            By application. Quarterly engagement from <span className="not-italic">€1,890</span>.
          </h2>
          {typeof cohortSeats === "number" && cohortSeats > 0 && (
            <p
              className="text-[12px] tracking-[0.18em] uppercase mb-5"
              style={{ color: PALETTE.muted }}
            >
              Founding Cohort · the first ten lock in the founder rate for life
            </p>
          )}
          <a
            href="/sovereign-circle/apply"
            data-testid="sovereign-apply-cta"
            className="inline-block px-6 py-3 text-[12.5px] tracking-[0.22em] uppercase border transition-all duration-500"
            style={{ borderColor: PALETTE.edge, color: PALETTE.ink }}
          >
            Apply for an interview
          </a>
        </section>

        {/* Day passes */}
        <section data-testid="bundles-daypasses" className="border-t pt-9 mb-16" style={{ borderColor: PALETTE.edge }}>
          <h3 className="aurin-display italic text-xl mb-2">A day inside, with no subscription.</h3>
          <p className="text-[13px] mb-7" style={{ color: PALETTE.muted }}>
            One charge. Twenty-four hours. If you return as a member within seven days, the pass converts in full.
          </p>
          <div className="grid sm:grid-cols-3 gap-4">
            {DAY_PASSES.map((d) => (
              <button
                key={d.sku}
                onClick={() => start(d.sku)}
                disabled={!!busySku}
                data-testid={`buy-${d.sku.replaceAll(".", "-")}`}
                className="p-5 border text-left transition-all duration-500 disabled:opacity-40"
                style={{ borderColor: PALETTE.edge, background: "hsla(36, 10%, 12%, 0.5)" }}
              >
                <div className="aurin-display italic text-lg mb-1">{d.name}</div>
                <div className="text-[11.5px] tracking-wide mb-3" style={{ color: PALETTE.muted }}>
                  {d.note}
                </div>
                <div className="text-[15px] tracking-wide">{busySku === d.sku ? "Opening…" : d.amount}</div>
              </button>
            ))}
          </div>
        </section>

        {/* Top-ups */}
        <section data-testid="bundles-topups" className="border-t pt-9" style={{ borderColor: PALETTE.edge }}>
          <h3 className="aurin-display italic text-xl mb-2">Prepaid voice packages.</h3>
          <p className="text-[13px] mb-7" style={{ color: PALETTE.muted }}>
            Extend your current cycle. Adult and child voice live in separate wallets and never cross-spend.
          </p>
          <div className="grid sm:grid-cols-2 gap-8">
            <div data-testid="topups-adult">
              <p className="text-[11px] tracking-[0.28em] uppercase mb-3" style={{ color: PALETTE.muted }}>
                Curator dialogue (Compass)
              </p>
              <div className="space-y-2">
                {TOPUPS_ADULT.map((t) => (
                  <button
                    key={t.sku}
                    onClick={() => start(t.sku)}
                    disabled={!!busySku}
                    data-testid={`buy-${t.sku.replaceAll(".", "-")}`}
                    className="w-full flex items-center justify-between px-4 py-3 border text-left transition-all duration-500 disabled:opacity-40"
                    style={{ borderColor: PALETTE.edge }}
                  >
                    <span>
                      <span className="block">{t.name}</span>
                      <span className="text-[11.5px]" style={{ color: PALETTE.muted }}>
                        {t.note}
                      </span>
                    </span>
                    <span className="tracking-wide">{busySku === t.sku ? "…" : t.amount}</span>
                  </button>
                ))}
              </div>
            </div>
            <div data-testid="topups-kids">
              <p className="text-[11px] tracking-[0.28em] uppercase mb-3" style={{ color: PALETTE.muted }}>
                Aurin storyteller (bedtime)
              </p>
              <div className="space-y-2">
                {TOPUPS_KIDS.map((t) => (
                  <button
                    key={t.sku}
                    onClick={() => start(t.sku)}
                    disabled={!!busySku}
                    data-testid={`buy-${t.sku.replaceAll(".", "-")}`}
                    className="w-full flex items-center justify-between px-4 py-3 border text-left transition-all duration-500 disabled:opacity-40"
                    style={{ borderColor: PALETTE.edge }}
                  >
                    <span>
                      <span className="block">{t.name}</span>
                      <span className="text-[11.5px]" style={{ color: PALETTE.muted }}>
                        {t.note}
                      </span>
                    </span>
                    <span className="tracking-wide">{busySku === t.sku ? "…" : t.amount}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {error && (
          <p
            data-testid="bundle-disclosure-error"
            className="mt-10 text-center text-[12px]"
            style={{ color: "hsl(8, 60%, 70%)" }}
          >
            {error}
          </p>
        )}

        <footer className="mt-20 text-center">
          <p className="text-[11px] tracking-[0.22em] uppercase" style={{ color: PALETTE.muted }}>
            Bandwidth is metered · Cadence is fixed · Pricing is honest
          </p>
        </footer>
      </div>
    </div>
  );
}
