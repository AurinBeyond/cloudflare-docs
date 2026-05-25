/**
 * KidsStarsView.jsx — Child-facing "My Angel Stars" page.
 *
 * §KIDS-HUBS 2026-02-09 — Themed per age (cream + age palette).
 * Shows current balance, a celebratory message from Aurin, the list
 * of 5 age-appropriate actions the child can "tap to earn" (status
 * goes to "pending" until a parent approves), and the 4 mystery
 * reward tiers.
 *
 * Parent-approval flow:
 *   child taps "I did this" → POST /angel-stars/request → status pending
 *   parent opens /parent-portal/stars → approves/rejects → balance updates
 *
 * Reward tiers are revealed (name + description) once the balance
 * crosses the threshold; before that the tier sits as a mystery hint
 * ("a small wish waits at 25 stars").
 */

import { Link, useParams } from "react-router-dom";
import { useCallback, useEffect, useState } from "react";
import { ArrowLeft, Sparkles, CheckCircle2, Clock, Gift, Lock } from "lucide-react";
import AurinSparkle from "@/components/AurinSparkle";
import { resolveHubTheme } from "@/lib/kidsHubThemes";
import { api } from "@/lib/api";

export default function KidsStarsView() {
  const { ageGroup } = useParams();
  const theme = resolveHubTheme(ageGroup);
  const { palette } = theme;

  const [catalog, setCatalog] = useState({ actions: [], tiers: [] });
  const [mine, setMine] = useState({ balance: 0, total_earned: 0, recent: [] });
  const [pendingSlug, setPendingSlug] = useState(null);
  const [celebrationFor, setCelebrationFor] = useState(null);
  const [authError, setAuthError] = useState(false);

  const refresh = useCallback(async () => {
    try {
      const r = await api.get(`/angel-stars/me?child_slug=${theme.slug}`);
      setMine(r.data);
      setAuthError(false);
    } catch (e) {
      if (e?.response?.status === 401) setAuthError(true);
    }
  }, [theme.slug]);

  useEffect(() => {
    let alive = true;
    api.get(`/angel-stars/catalog?age_slug=${theme.slug}`)
      .then((r) => {
        if (alive) setCatalog(r.data);
      })
      .catch(() => {});
    refresh();
    return () => {
      alive = false;
    };
  }, [theme.slug, refresh]);

  const requestStar = async (action) => {
    setPendingSlug(action.slug);
    try {
      await api.post(`/angel-stars/request`, {
        child_slug: theme.slug,
        action_slug: action.slug,
      });
      setCelebrationFor(action);
      await refresh();
      setTimeout(() => setCelebrationFor(null), 3200);
    } catch (e) {
      if (e?.response?.status === 401) setAuthError(true);
    } finally {
      setPendingSlug(null);
    }
  };

  const redeemTier = async (tier) => {
    try {
      await api.post(`/angel-stars/redeem`, {
        child_slug: theme.slug,
        tier_index: tier.tier_index,
      });
      await refresh();
    } catch {}
  };

  if (authError) {
    return (
      <div
        className="min-h-screen flex items-center justify-center px-6"
        style={{ background: palette.bgGradient, color: palette.text }}
      >
        <div className="text-center max-w-md">
          <h2 className="font-serif text-2xl mb-3">Your stars wait for you.</h2>
          <p className="text-[15px] mb-6" style={{ color: palette.textMuted }}>
            Ask a grown-up to open the door (sign in), and the stars come back.
          </p>
          <Link
            to="/portal"
            data-testid="kids-stars-signin"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl text-[14px]"
            style={{ background: palette.accent, color: "#fff" }}
          >
            Sign in
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div
      data-testid={`kids-stars-${theme.slug}`}
      className="min-h-screen relative"
      style={{ background: palette.bgGradient, color: palette.text }}
    >
      {/* Floating celebration overlay */}
      {celebrationFor && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none"
          data-testid="kids-stars-celebration"
        >
          <div className="flex flex-col items-center">
            <AurinSparkle variant="celebrate" size={220} />
            <p
              className="mt-3 font-serif text-[22px] text-center max-w-[28ch]"
              style={{ color: palette.text }}
            >
              Aurin saw that. ✨ A grown-up will keep your star safe.
            </p>
          </div>
        </div>
      )}

      <div className="mx-auto max-w-4xl px-5 sm:px-8 py-10 sm:py-14">
        <Link
          to={`/kids-universe/${theme.slug}/hub`}
          data-testid="kids-stars-back"
          className="inline-flex items-center gap-1.5 text-[13px] tracking-wide mb-7"
          style={{ color: palette.textMuted }}
        >
          <ArrowLeft size={13} /> Back to {theme.title}
        </Link>

        {/* Balance header */}
        <section
          className="rounded-2xl p-7 sm:p-9 flex flex-col sm:flex-row sm:items-center gap-6"
          style={{
            background: palette.cardBg,
            border: `1.5px solid ${palette.cardBorder}`,
            boxShadow: `0 14px 30px -18px ${palette.accent}88`,
          }}
        >
          <div className="flex items-center gap-5">
            <AurinSparkle variant="ambient" size={84} />
            <div>
              <p
                className="text-[11px] uppercase tracking-[0.28em]"
                style={{ color: palette.textMuted }}
              >
                My Angel Stars
              </p>
              <p
                className="font-serif text-[44px] leading-none mt-1.5"
                style={{ color: palette.accent }}
                data-testid="kids-stars-balance"
              >
                {mine.balance} <span className="text-[24px]">★</span>
              </p>
              <p className="text-[13px] mt-1" style={{ color: palette.textMuted }}>
                {mine.total_earned} earned in total
              </p>
            </div>
          </div>
          <div className="sm:ml-auto max-w-[30ch]">
            <p className="text-[14px] italic leading-relaxed" style={{ color: palette.text, opacity: 0.85 }}>
              "Every kind, brave, helpful little thing is a star.
              I'm proud of you." — Aurin
            </p>
          </div>
        </section>

        {/* Actions */}
        <section className="mt-10">
          <h2
            className="font-serif text-[22px] mb-1.5"
            style={{ color: palette.text }}
          >
            Things that earn a star
          </h2>
          <p
            className="text-[14px] mb-6"
            style={{ color: palette.textMuted }}
          >
            Tap one when you do it. A grown-up will see it and keep your star safe.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5" data-testid="kids-stars-actions">
            {catalog.actions.map((a) => (
              <button
                key={a.slug}
                type="button"
                disabled={pendingSlug === a.slug}
                onClick={() => requestStar(a)}
                data-testid={`kids-stars-action-${a.slug}`}
                className="group text-left rounded-xl p-5 transition disabled:opacity-60"
                style={{
                  background: palette.cardBg,
                  border: `1px solid ${palette.cardBorder}`,
                  color: palette.text,
                }}
              >
                <div className="flex items-start justify-between gap-3">
                  <span
                    className="text-[15px] leading-snug flex-1"
                  >
                    {a.label}
                  </span>
                  <span
                    className="text-[12px] font-medium px-2 py-0.5 rounded-full shrink-0"
                    style={{
                      background: `${palette.accent}1A`,
                      color: palette.accent,
                    }}
                  >
                    +{a.stars} ★
                  </span>
                </div>
                <span
                  className="mt-3 inline-flex items-center gap-1 text-[12.5px] tracking-wide"
                  style={{ color: palette.accent }}
                >
                  I did this
                  <Sparkles size={11} className="transition-transform group-hover:rotate-12" />
                </span>
              </button>
            ))}
          </div>
        </section>

        {/* Pending requests */}
        {mine.recent && mine.recent.length > 0 && (
          <section className="mt-10">
            <h2
              className="font-serif text-[20px] mb-4"
              style={{ color: palette.text }}
            >
              Waiting for a grown-up
            </h2>
            <ul className="space-y-2" data-testid="kids-stars-recent">
              {mine.recent.map((r) => (
                <li
                  key={r.id}
                  className="flex items-center gap-3 rounded-xl px-4 py-3"
                  style={{
                    background: palette.cardBg,
                    border: `1px solid ${palette.cardBorder}`,
                  }}
                  data-testid={`kids-stars-recent-${r.id}`}
                >
                  {r.status === "approved" ? (
                    <CheckCircle2 size={16} style={{ color: palette.accent }} />
                  ) : r.status === "rejected" ? (
                    <Lock size={16} style={{ color: palette.textMuted }} />
                  ) : (
                    <Clock size={16} style={{ color: palette.textMuted }} />
                  )}
                  <span className="text-[14px] flex-1" style={{ color: palette.text }}>
                    {r.action_label}
                  </span>
                  <span
                    className="text-[12px]"
                    style={{
                      color:
                        r.status === "approved"
                          ? palette.accent
                          : palette.textMuted,
                    }}
                  >
                    {r.status === "approved" ? `+${r.stars} ★` : r.status}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Reward tiers */}
        <section className="mt-12">
          <h2
            className="font-serif text-[22px] mb-1.5"
            style={{ color: palette.text }}
          >
            Mystery wishes
          </h2>
          <p
            className="text-[14px] mb-6"
            style={{ color: palette.textMuted }}
          >
            Each row is a small gift waiting at a number. Reach the
            number, open the wish.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4" data-testid="kids-stars-tiers">
            {catalog.tiers.map((t) => {
              const unlocked = mine.balance >= t.threshold;
              const claimed = (mine.redeemed_tiers || []).includes(t.tier_index);
              return (
                <div
                  key={t.tier_index}
                  data-testid={`kids-stars-tier-${t.tier_index}`}
                  className="rounded-xl p-5 relative overflow-hidden"
                  style={{
                    background: unlocked ? `${palette.accent}12` : palette.cardBg,
                    border: `1px solid ${unlocked ? palette.accent : palette.cardBorder}`,
                  }}
                >
                  <div className="flex items-start gap-3">
                    <span
                      className="inline-flex items-center justify-center rounded-full shrink-0"
                      style={{
                        width: 38,
                        height: 38,
                        background: unlocked ? palette.accent : palette.bg,
                        border: unlocked ? "none" : `1px solid ${palette.cardBorder}`,
                        color: unlocked ? "#fff" : palette.textMuted,
                      }}
                    >
                      {unlocked ? <Gift size={16} /> : <Lock size={15} />}
                    </span>
                    <div className="flex-1">
                      <p
                        className="text-[11px] uppercase tracking-[0.22em]"
                        style={{ color: palette.textMuted }}
                      >
                        {t.threshold} ★ {unlocked ? "unlocked" : "needed"}
                      </p>
                      <h3
                        className="font-serif text-[18px] mt-1"
                        style={{ color: palette.text }}
                      >
                        {unlocked ? t.title : t.mystery_hint}
                      </h3>
                      {unlocked && (
                        <p
                          className="text-[13px] mt-2 leading-relaxed"
                          style={{ color: palette.textMuted }}
                        >
                          {t.description}
                        </p>
                      )}
                    </div>
                  </div>
                  {unlocked && !claimed && (
                    <button
                      type="button"
                      onClick={() => redeemTier(t)}
                      data-testid={`kids-stars-tier-${t.tier_index}-redeem`}
                      className="mt-4 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-[13px] font-medium"
                      style={{
                        background: palette.accent,
                        color: "#fff",
                      }}
                    >
                      Open the wish
                      <Sparkles size={12} />
                    </button>
                  )}
                  {claimed && (
                    <p
                      className="mt-4 text-[12px] italic"
                      style={{ color: palette.accent }}
                    >
                      Opened ♡
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}
