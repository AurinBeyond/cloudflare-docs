/**
 * VoiceTopupSlider.jsx — Flexible voice-minute top-up.
 *
 * §CUSTOM-TOPUP 2026-02-09 — Visitor picks any minute count
 * between 10 and 300 (€0.60/min). The slider snaps to the nearest
 * pre-priced LemonSqueezy variant on submit. If no variants are
 * yet configured in the LS dashboard, the UI shows a soft
 * "coming soon" state instead of breaking.
 */

import { useEffect, useState } from "react";
import { Sparkles, Clock, Plus, Minus } from "lucide-react";
import { api } from "@/lib/api";

export default function VoiceTopupSlider({ className = "" }) {
  const [ladder, setLadder] = useState(null);
  const [minutes, setMinutes] = useState(30);
  const [nearest, setNearest] = useState(null);

  useEffect(() => {
    api.get("/topup/ladder").then((r) => {
      setLadder(r.data);
      const mid = Math.round((r.data.min_minutes + r.data.max_minutes) / 6);
      setMinutes(Math.max(r.data.min_minutes, Math.min(mid, 60)));
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (!ladder) return;
    let alive = true;
    api.get(`/topup/nearest?minutes=${minutes}`).then((r) => {
      if (alive) setNearest(r.data);
    });
    return () => { alive = false; };
  }, [minutes, ladder]);

  if (!ladder) {
    return (
      <div className={`aurin-card p-7 ${className}`} data-testid="voice-topup-loading">
        <p className="text-[14px] italic text-[hsl(var(--aurin-text-muted))]">Opening…</p>
      </div>
    );
  }

  const price = (minutes * ladder.price_per_min_eur).toFixed(2);
  const nudgeBy = (delta) => {
    setMinutes((m) => Math.max(ladder.min_minutes, Math.min(ladder.max_minutes, m + delta)));
  };

  return (
    <div className={`aurin-card p-7 ${className}`} data-testid="voice-topup-slider">
      <div className="flex items-baseline justify-between mb-5">
        <div>
          <p className="aurin-eyebrow mb-1.5">Voice top-up</p>
          <p className="text-[14px] text-[hsl(var(--aurin-text-muted))] leading-relaxed">
            Choose any number of minutes. Pay <strong className="text-[hsl(var(--aurin-text))]">€{ladder.price_per_min_eur.toFixed(2)}</strong> a minute, never more.
          </p>
        </div>
      </div>

      {/* Number display + nudge */}
      <div className="flex items-center justify-center gap-5 mb-5">
        <button type="button" onClick={() => nudgeBy(-5)}
                data-testid="voice-topup-minus"
                aria-label="Less minutes"
                className="w-9 h-9 rounded-full border border-[hsl(var(--aurin-border-soft))] flex items-center justify-center text-[hsl(var(--aurin-text-muted))] hover:text-[hsl(var(--aurin-amber))] hover:border-[hsl(var(--aurin-amber))] transition">
          <Minus size={14} />
        </button>
        <div className="text-center">
          <p className="font-serif text-[56px] leading-none text-[hsl(var(--aurin-amber))]"
             data-testid="voice-topup-minutes">{minutes}</p>
          <p className="text-[12px] uppercase tracking-[0.18em] text-[hsl(var(--aurin-text-muted))] mt-1">minutes</p>
        </div>
        <button type="button" onClick={() => nudgeBy(5)}
                data-testid="voice-topup-plus"
                aria-label="More minutes"
                className="w-9 h-9 rounded-full border border-[hsl(var(--aurin-border-soft))] flex items-center justify-center text-[hsl(var(--aurin-text-muted))] hover:text-[hsl(var(--aurin-amber))] hover:border-[hsl(var(--aurin-amber))] transition">
          <Plus size={14} />
        </button>
      </div>

      {/* Slider */}
      <input type="range"
             min={ladder.min_minutes}
             max={ladder.max_minutes}
             step={5}
             value={minutes}
             onChange={(e) => setMinutes(parseInt(e.target.value, 10))}
             data-testid="voice-topup-range"
             className="w-full mb-4 accent-[hsl(var(--aurin-amber))]"
             aria-label="Minute selector" />
      <div className="flex justify-between text-[11px] uppercase tracking-[0.16em] text-[hsl(var(--aurin-text-muted))] mb-6">
        <span>{ladder.min_minutes} min</span>
        <span>{ladder.max_minutes} min</span>
      </div>

      {/* Price preview */}
      <div className="flex items-baseline justify-between mb-5 px-4 py-3 rounded-xl bg-[hsl(var(--aurin-bg-soft))] border border-[hsl(var(--aurin-border-soft))]">
        <span className="text-[13px] text-[hsl(var(--aurin-text-muted))] flex items-center gap-1.5">
          <Clock size={12} /> {minutes} minutes
        </span>
        <span className="font-serif text-[22px] text-[hsl(var(--aurin-text))]"
              data-testid="voice-topup-price">€{price}</span>
      </div>

      {/* Snap-to-rung notice */}
      {nearest && nearest.purchasable && nearest.nearest && (
        <p className="text-[12.5px] italic text-[hsl(var(--aurin-text-muted))] mb-5 leading-relaxed"
           data-testid="voice-topup-snap-notice">
          {nearest.nearest.minutes === minutes
            ? "This exact amount is available — checkout opens in LemonSqueezy."
            : `Closest pack to ${minutes} min is ${nearest.nearest.minutes} min for €${nearest.nearest.price_eur.toFixed(2)} — checkout opens in LemonSqueezy.`}
        </p>
      )}

      {/* CTA */}
      {nearest && nearest.purchasable && nearest.nearest?.checkout_url ? (
        <a href={nearest.nearest.checkout_url}
           target="_blank" rel="noreferrer"
           data-testid="voice-topup-checkout"
           className="aurin-btn aurin-btn-primary inline-flex items-center justify-center gap-2 w-full">
          Continue · €{nearest.nearest.price_eur.toFixed(2)} for {nearest.nearest.minutes} min
          <Sparkles size={14} />
        </a>
      ) : (
        <div className="rounded-xl p-4 bg-[hsl(var(--aurin-bg-soft))] border border-dashed border-[hsl(var(--aurin-border-soft))] text-center"
             data-testid="voice-topup-not-ready">
          <p className="text-[13px] text-[hsl(var(--aurin-text-muted))] italic leading-relaxed">
            Top-ups are being prepared — checkout will open in the next
            few days. If you'd like first-access notice, write to{" "}
            <a href="mailto:info@prulesoul.site"
               className="underline decoration-dotted underline-offset-2 hover:text-[hsl(var(--aurin-sage))]">
              info@prulesoul.site
            </a>{" "}
            and we'll send you the link when the doors open.
          </p>
        </div>
      )}
    </div>
  );
}
