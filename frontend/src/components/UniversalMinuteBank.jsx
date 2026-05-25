/**
 * UniversalMinuteBank.jsx — Featured €12 / 20-min starter pack.
 *
 * §UNIVERSAL-BANK 2026-02-09 — Sits above the tier ladder on the
 * Clarity Release Hub as a soft, no-commitment entry-point for
 * visitors who aren't yet ready for the 60h package. Pulls from
 * /api/minute-bank/starter so the price stays config-driven.
 */

import { useEffect, useState } from "react";
import { Coins, Sparkles, ArrowRight } from "lucide-react";
import { api } from "@/lib/api";

export default function UniversalMinuteBank({ className = "" }) {
  const [data, setData] = useState(null);

  useEffect(() => {
    api.get("/minute-bank/starter")
      .then((r) => setData(r.data))
      .catch(() => {});
  }, []);

  if (!data) return null;

  return (
    <div className={`aurin-card p-7 ${className}`} data-testid="universal-minute-bank">
      <div className="flex items-start gap-4">
        <span className="inline-flex items-center justify-center rounded-2xl shrink-0"
              style={{ width: 56, height: 56,
                       background: "hsl(var(--aurin-amber) / 0.18)",
                       color: "hsl(var(--aurin-amber))" }}>
          <Coins size={26} strokeWidth={1.5} />
        </span>
        <div className="flex-1">
          <p className="aurin-eyebrow mb-1.5">Universal Minute Bank · starter</p>
          <h3 className="aurin-display text-xl leading-tight mb-2"
              data-testid="universal-minute-bank-title">
            €{data.price_eur.toFixed(2)} for {data.minutes} quiet minutes.
          </h3>
          <p className="text-[14px] text-[hsl(var(--aurin-text-muted))] leading-relaxed mb-4">
            {data.blurb}
          </p>
          {data.purchasable && data.checkout_url ? (
            <a href={data.checkout_url} target="_blank" rel="noreferrer"
               data-testid="universal-minute-bank-cta"
               className="aurin-btn aurin-btn-primary inline-flex items-center gap-2">
              Get the starter pack <Sparkles size={13} />
            </a>
          ) : (
            <p className="text-[12.5px] italic text-[hsl(var(--aurin-text-muted))]"
               data-testid="universal-minute-bank-not-ready">
              Arrives once the founder seeds the 20-minute LemonSqueezy variant.
              The 30-/60-/180-minute packs below are open today.
              <ArrowRight size={11} className="inline-block ml-1" />
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
