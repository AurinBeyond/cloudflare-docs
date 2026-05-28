/**
 * ParentDigest.jsx — /parent-portal/digest
 *
 * §KIDS-CURRICULUM 2026-02-09 · renamed 2026-02-12 (was ParentWellness)
 * Parent-facing 7-day mood dashboard. Per-child summary, simple bar
 * chart of mood counts, and the last 3 notes (with redaction respected
 * — only if the child chose to write one).
 *
 * URL was previously /parent-portal/wellness; renamed to remove the
 * "wellness" classifier from Google's index. App.js retains a
 * client-side Navigate redirect from the old path.
 */

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import PageHeader from "@/components/layout/PageHeader";
import { ArrowRight, Sparkles, MessageSquareQuote, Mail } from "lucide-react";
import { api } from "@/lib/api";

const MOOD_COLORS = {
  sad:     "#7C9DB0",
  worried: "#B69F7E",
  okay:    "#A8B0A0",
  good:    "#7BA888",
  sparkly: "#E3B48C",
};
const MOOD_LABEL = {
  sad: "Sad", worried: "Worried", okay: "Okay", good: "Good", sparkly: "Sparkly",
};
const MOOD_EMOJI = {
  sad: "😔", worried: "😟", okay: "🙂", good: "😊", sparkly: "✨",
};

export default function ParentDigest() {
  const [data, setData] = useState({ children: [], days: 7 });
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(false);
  const [letterPref, setLetterPref] = useState(null);

  useEffect(() => {
    api.get("/kids-mood/parent-portal?days=7")
      .then((r) => setData(r.data))
      .catch((e) => { if (e?.response?.status === 401) setAuthError(true); })
      .finally(() => setLoading(false));
    api.get("/annas-letter/preferences")
      .then((r) => setLetterPref(r.data))
      .catch(() => {});
  }, []);

  const toggleLetter = async () => {
    if (!letterPref) return;
    const next = !letterPref.opt_out;
    setLetterPref({ ...letterPref, opt_out: next });
    try {
      await api.post("/annas-letter/preferences", { opt_out: next });
    } catch {
      setLetterPref({ ...letterPref, opt_out: !next });
    }
  };

  if (authError) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6 text-[hsl(var(--aurin-text))]">
        <div className="text-center max-w-md">
          <h2 className="aurin-display text-2xl mb-3">Sign in to see the week.</h2>
          <p className="text-[14.5px] text-[hsl(var(--aurin-text-muted))] mb-6">
            The Weekly Digest is reserved for parents who have signed in.
          </p>
          <Link to="/portal" data-testid="parent-digest-signin"
                className="aurin-btn aurin-btn-primary inline-flex items-center gap-2">
            Sign in <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div data-testid="parent-portal-digest">
      <PageHeader tone="kids"
        eyebrow="Weekly Digest · Parent Portal"
        title="A quiet week with"
        italicWord="your child."
        description="Seven days of small daily check-ins. Aurin asks one question, your child picks how today felt. Here's the pattern — without intrusion."
      />

      <section className="aurin-section-sm">
        <div className="aurin-container">
          {loading ? (
            <p className="text-[14px] aurin-serif-italic text-[hsl(var(--aurin-text-muted))]">
              One quiet breath…
            </p>
          ) : data.children.length === 0 ? (
            <div className="aurin-card p-8" data-testid="parent-digest-empty">
              <p className="text-[15px] text-[hsl(var(--aurin-text-muted))] leading-relaxed">
                No daily check-ins yet. When your child opens
                <Link to="/kids-universe" className="aurin-link mx-1.5">the Kids Universe</Link>
                and taps "Daily check-in", their first mood lands here.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" data-testid="parent-digest-children">
              {data.children.map((c) => {
                const total = c.total || 1;
                return (
                  <div key={c.child_slug}
                       data-testid={`parent-digest-child-${c.child_slug}`}
                       className="aurin-card p-7">
                    <div className="flex items-start justify-between mb-5">
                      <div>
                        <p className="aurin-eyebrow mb-1.5">{c.age_range}</p>
                        <h3 className="aurin-display text-2xl">{c.title}</h3>
                      </div>
                      <span className="text-[13px] text-[hsl(var(--aurin-text-muted))]">
                        {c.total} check-in{c.total === 1 ? "" : "s"} · 7 days
                      </span>
                    </div>

                    {/* Bar chart */}
                    <div className="space-y-2.5 mb-6" data-testid={`parent-digest-${c.child_slug}-bars`}>
                      {Object.entries(c.counts).map(([mood, count]) => {
                        const pct = Math.round((count / total) * 100);
                        return (
                          <div key={mood} className="flex items-center gap-3">
                            <span className="w-7 text-[16px] leading-none">{MOOD_EMOJI[mood]}</span>
                            <span className="w-[68px] text-[12px] uppercase tracking-[0.16em] text-[hsl(var(--aurin-text-muted))]">
                              {MOOD_LABEL[mood]}
                            </span>
                            <div className="flex-1 h-2.5 rounded-full bg-[hsl(var(--aurin-border-soft))] overflow-hidden">
                              <div className="h-full rounded-full transition-all"
                                   style={{ width: `${pct}%`, background: MOOD_COLORS[mood] }} />
                            </div>
                            <span className="w-8 text-right text-[12px] text-[hsl(var(--aurin-text))]">
                              {count}
                            </span>
                          </div>
                        );
                      })}
                    </div>

                    {/* Recent notes */}
                    {c.recent_notes && c.recent_notes.length > 0 && (
                      <div className="border-t border-[hsl(var(--aurin-border-soft))] pt-5"
                           data-testid={`parent-digest-${c.child_slug}-notes`}>
                        <div className="aurin-eyebrow mb-3 flex items-center gap-1.5">
                          <MessageSquareQuote size={11} /> What your child whispered
                        </div>
                        <ul className="space-y-2.5">
                          {c.recent_notes.map((n, i) => (
                            <li key={i} className="text-[14px] leading-relaxed">
                              <span className="text-[hsl(var(--aurin-text-muted))]">
                                {n.day} · {MOOD_EMOJI[n.mood]} —{" "}
                              </span>
                              <span className="italic text-[hsl(var(--aurin-text))]">
                                "{n.note}"
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div className="mt-6 flex items-center gap-4 text-[12.5px]">
                      <Link to={`/parent-portal/stars`}
                            className="aurin-link inline-flex items-center gap-1">
                        See Angel Stars <Sparkles size={11} />
                      </Link>
                      <Link to={`/kids-universe/${c.child_slug}/hub`}
                            className="aurin-link inline-flex items-center gap-1">
                        Their room <ArrowRight size={11} />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* §REFERRAL 2026-02-09 — Discreet entry to /portal/referral.
              Sits at the bottom of the digest portal because the
              parent who reads this far already values the platform. */}
          <div className="mt-12 aurin-card p-6 flex flex-col sm:flex-row sm:items-center gap-4"
               data-testid="parent-digest-referral-cta">
            <div className="flex-1">
              <p className="aurin-eyebrow mb-1.5">Share Aurin · €5 each</p>
              <p className="text-[14px] text-[hsl(var(--aurin-text-muted))] leading-relaxed">
                Pass the link to one friend you'd tell anyway. When their first
                quiet day lands, we drop +8 voice minutes into both of your accounts.
              </p>
            </div>
            <Link to="/portal/referral"
                  data-testid="parent-digest-referral-link"
                  className="aurin-btn aurin-btn-primary inline-flex items-center gap-2">
              Open the referral page <ArrowRight size={14} />
            </Link>
          </div>

          {/* §ANNAS-LETTER-P3 — Letter opt-out toggle */}
          {letterPref && (
            <div className="mt-5 aurin-card p-5 flex items-center gap-4"
                 data-testid="parent-digest-letter-pref">
              <Mail size={18} className="text-[hsl(var(--aurin-amber))] shrink-0" />
              <div className="flex-1">
                <p className="text-[13.5px] text-[hsl(var(--aurin-text))]">
                  Anna's Friday letter
                </p>
                <p className="text-[12px] text-[hsl(var(--aurin-text-muted))] mt-0.5">
                  {letterPref.opt_out
                    ? "Paused. Flip back on whenever you'd like the weekly digest."
                    : "Active. Lands on Friday with your child's week."}
                </p>
              </div>
              <button type="button"
                      onClick={toggleLetter}
                      data-testid="parent-digest-letter-toggle"
                      aria-pressed={!letterPref.opt_out}
                      className="text-[12.5px] uppercase tracking-[0.16em] px-3.5 py-2 rounded-full border transition"
                      style={{
                        background: letterPref.opt_out ? "transparent" : "hsl(var(--aurin-amber) / 0.15)",
                        borderColor: letterPref.opt_out ? "hsl(var(--aurin-border-soft))" : "hsl(var(--aurin-amber))",
                        color: letterPref.opt_out ? "hsl(var(--aurin-text-muted))" : "hsl(var(--aurin-amber))",
                      }}>
                {letterPref.opt_out ? "Paused · resume" : "Active · pause"}
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
