/**
 * NotFound.jsx — Soft 404 catch-all.
 *
 * §AUDIT-77 2026-02-09 — Production deploy audit found that bare URLs
 * like /origin (typo'd internal link) silently returned a blank page
 * because App.js had no catch-all <Route>. This component is the
 * gentle fallback.
 *
 * §GRACE-CLEANUP 2026-02 — Founder directive: the adult Grace surface
 * must never link to children/Kids Universe content. The 404 page is
 * a global surface (a wrong URL anywhere on the site can land here),
 * so we drop Kids Universe from the suggestion list and keep three
 * neutral adult doors: Home, Grace, Reach Out.
 */

import { Link, useLocation } from "react-router-dom";
import { ArrowRight, Home, Sparkles, Mail } from "lucide-react";

export default function NotFound() {
  const location = useLocation();
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-6 py-16"
         data-testid="not-found-page">
      <div className="max-w-xl text-center">
        <p className="aurin-eyebrow mb-3">A quiet wrong turn</p>
        <h1 className="aurin-display text-3xl md:text-4xl mb-4 leading-tight">
          This page doesn't live here.
        </h1>
        <p className="text-[15px] text-[hsl(var(--aurin-text-muted))] leading-relaxed mb-2">
          The path <code className="text-[hsl(var(--aurin-amber))] text-[13.5px]">{location.pathname}</code> isn't one of our rooms.
        </p>
        <p className="text-[15px] text-[hsl(var(--aurin-text-muted))] leading-relaxed mb-8">
          No harm done. Pick a soft door below.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Link to="/" data-testid="not-found-home"
                className="aurin-card p-5 text-left hover:-translate-y-0.5 transition">
            <Home size={16} className="text-[hsl(var(--aurin-amber))] mb-2" />
            <p className="text-[14px] font-medium text-[hsl(var(--aurin-text))]">Home</p>
            <p className="text-[12px] text-[hsl(var(--aurin-text-muted))] mt-1">Start again, softly.</p>
          </Link>
          <Link to="/grace" data-testid="not-found-grace"
                className="aurin-card p-5 text-left hover:-translate-y-0.5 transition">
            <Sparkles size={16} className="text-[hsl(var(--aurin-amber))] mb-2" />
            <p className="text-[14px] font-medium text-[hsl(var(--aurin-text))]">Grace</p>
            <p className="text-[12px] text-[hsl(var(--aurin-text-muted))] mt-1">A quiet adult room.</p>
          </Link>
          <Link to="/reach-out" data-testid="not-found-reach-out"
                className="aurin-card p-5 text-left hover:-translate-y-0.5 transition">
            <Mail size={16} className="text-[hsl(var(--aurin-amber))] mb-2" />
            <p className="text-[14px] font-medium text-[hsl(var(--aurin-text))]">Reach Out</p>
            <p className="text-[12px] text-[hsl(var(--aurin-text-muted))] mt-1">Tell us where the link broke.</p>
          </Link>
        </div>
        <p className="mt-8 text-[12.5px] italic text-[hsl(var(--aurin-text-muted))]">
          If a link sent you here from somewhere on the site,
          <Link to="/reach-out" className="aurin-link mx-1">tell me where</Link>
          and I'll mend it. <ArrowRight size={12} className="inline-block" />
        </p>
      </div>
    </div>
  );
}
