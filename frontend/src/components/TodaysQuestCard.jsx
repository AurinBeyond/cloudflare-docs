/**
 * TodaysQuestCard.jsx — Aurin's mood-based curriculum suggestion.
 *
 * §TODAYS-QUEST 2026-02-09 — Reads /api/aurin/today-quest which
 * picks 1-3 curriculum activities based on the user's most recent
 * daily mood check-in. Falls back to a gentle default for users
 * who haven't done a check-in yet (or visitors not signed in).
 */

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Compass, ArrowRight, Sparkles } from "lucide-react";
import { api } from "@/lib/api";

export default function TodaysQuestCard({ className = "", limit = 2 }) {
  const [data, setData] = useState(null);

  useEffect(() => {
    api.get("/aurin/today-quest")
      .then((r) => setData(r.data))
      .catch(() => {});
  }, []);

  if (!data || !data.activities || data.activities.length === 0) return null;

  const activities = data.activities.slice(0, limit);

  return (
    <div className={`aurin-card p-7 ${className}`} data-testid="todays-quest-card">
      <div className="flex items-start gap-4">
        <span className="inline-flex items-center justify-center rounded-2xl shrink-0"
              style={{ width: 48, height: 48,
                       background: "hsl(var(--aurin-sage) / 0.18)",
                       color: "hsl(var(--aurin-sage))" }}>
          <Compass size={22} strokeWidth={1.5} />
        </span>
        <div className="flex-1 min-w-0">
          <p className="aurin-eyebrow mb-1.5">Aurin's quest · today</p>
          <h3 className="aurin-display text-lg leading-tight mb-2"
              data-testid="todays-quest-headline">{data.headline}</h3>
          <p className="text-[14px] text-[hsl(var(--aurin-text-muted))] italic leading-relaxed mb-4"
             data-testid="todays-quest-aurin-line">
            "{data.aurin_line}"
          </p>
          <ul className="space-y-2 mb-1" data-testid="todays-quest-activities">
            {activities.map((a) => {
              const targetSlug = data.child_slug || "explorers";
              return (
                <li key={a.slug}>
                  <Link to={`/kids-universe/${targetSlug}/activities/${a.slug}`}
                        data-testid={`todays-quest-activity-${a.slug}`}
                        className="group flex items-start gap-3 rounded-xl px-3.5 py-2.5 -mx-1 hover:bg-[hsl(var(--aurin-bg-soft))] transition">
                    <Sparkles size={12} className="text-[hsl(var(--aurin-amber))] mt-1 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-[14px] font-medium text-[hsl(var(--aurin-text))] leading-snug truncate">
                        {a.title}
                      </p>
                      <p className="text-[12.5px] text-[hsl(var(--aurin-text-muted))] mt-0.5 leading-relaxed">
                        {a.duration_min} min · {a.module}
                        {a.locked && " · locked"}
                      </p>
                    </div>
                    <ArrowRight size={12} className="text-[hsl(var(--aurin-text-muted))] mt-1.5 shrink-0 transition group-hover:translate-x-0.5 group-hover:text-[hsl(var(--aurin-amber))]" />
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
}
