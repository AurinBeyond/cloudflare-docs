/**
 * Referral.jsx — /portal/referral
 *
 * §REFERRAL 2026-02-09 — Parent-facing "share Aurin" surface.
 * Each signed-in user gets a stable AURIN code. Both parties earn
 * 500 seconds (€5 worth, ~8 voice minutes) once the referee's first
 * paid pass OR first daily check-in fires.
 */

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import PageHeader from "@/components/layout/PageHeader";
import { Copy, Check, Sparkles, ArrowRight, Mail, MessageCircle, Twitter } from "lucide-react";
import { api } from "@/lib/api";

export default function Referral() {
  const [data, setData] = useState(null);
  const [copied, setCopied] = useState(false);
  const [authError, setAuthError] = useState(false);

  useEffect(() => {
    api.get("/referral/me")
      .then((r) => setData(r.data))
      .catch((e) => { if (e?.response?.status === 401) setAuthError(true); });
  }, []);

  const copyLink = async () => {
    if (!data?.share_url) return;
    try {
      await navigator.clipboard.writeText(data.share_url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch {}
  };

  const shareSubject = encodeURIComponent("A quiet corner of the internet for you");
  const shareBody = (url) => encodeURIComponent(
    `I've been using a small AI sanctuary called Aurin — calm voice rooms, ` +
    `a kids universe, no ads. Open with my link and we both get a few extra ` +
    `voice minutes when you start: ${url}`
  );

  if (authError) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6 text-[hsl(var(--aurin-text))]">
        <div className="text-center max-w-md">
          <h2 className="aurin-display text-2xl mb-3">Sign in to share Aurin.</h2>
          <Link to="/portal" data-testid="referral-signin"
                className="aurin-btn aurin-btn-primary inline-flex items-center gap-2">
            Sign in <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    );
  }

  const minutes = data ? Math.round((data.total_seconds_earned || 0) / 60) : 0;

  return (
    <div data-testid="referral-page">
      <PageHeader tone="kids"
        eyebrow="Refer a friend · Both win"
        title="A small gift for the people"
        italicWord="you would tell anyway."
        description="Pass on Aurin to a friend. When their first quiet day lands — a daily check-in or a paid pass — we drop €5 of voice time into both of your accounts. No campaign, no countdown, no urgency."
      />

      <section className="aurin-section-sm">
        <div className="aurin-container max-w-3xl">
          {/* Share card */}
          <div className="aurin-card p-8 mb-10" data-testid="referral-share-card">
            <p className="aurin-eyebrow mb-3">Your link</p>
            <div className="flex flex-col sm:flex-row gap-3 mb-5">
              <div className="flex-1 rounded-xl px-4 py-3 bg-[hsl(var(--aurin-bg-soft))] border border-[hsl(var(--aurin-border-soft))]"
                   data-testid="referral-share-url">
                <p className="text-[11px] uppercase tracking-[0.18em] text-[hsl(var(--aurin-text-muted))] mb-1">Share URL</p>
                <code className="text-[13.5px] text-[hsl(var(--aurin-text))] break-all">
                  {data?.share_url || "loading…"}
                </code>
              </div>
              <button type="button" onClick={copyLink}
                      data-testid="referral-copy-btn"
                      disabled={!data?.share_url}
                      className="aurin-btn aurin-btn-primary inline-flex items-center gap-2 self-stretch sm:self-auto">
                {copied ? <><Check size={14} /> Copied</> : <><Copy size={14} /> Copy link</>}
              </button>
            </div>

            <p className="aurin-eyebrow mb-2">Code</p>
            <p className="font-serif text-[28px] tracking-wider mb-5 text-[hsl(var(--aurin-amber))]"
               data-testid="referral-code">{data?.code || "—"}</p>

            {/* Quick share buttons */}
            {data?.share_url && (
              <div className="flex flex-wrap gap-2" data-testid="referral-quickshare">
                <a href={`mailto:?subject=${shareSubject}&body=${shareBody(data.share_url)}`}
                   data-testid="referral-share-email"
                   className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-[12.5px] uppercase tracking-[0.16em] border border-[hsl(var(--aurin-border-soft))] text-[hsl(var(--aurin-text-muted))] hover:text-[hsl(var(--aurin-amber))] hover:border-[hsl(var(--aurin-amber))] transition">
                  <Mail size={12} /> Email
                </a>
                <a href={`sms:?&body=${shareBody(data.share_url)}`}
                   data-testid="referral-share-sms"
                   className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-[12.5px] uppercase tracking-[0.16em] border border-[hsl(var(--aurin-border-soft))] text-[hsl(var(--aurin-text-muted))] hover:text-[hsl(var(--aurin-amber))] hover:border-[hsl(var(--aurin-amber))] transition">
                  <MessageCircle size={12} /> SMS
                </a>
                <a href={`https://twitter.com/intent/tweet?text=${shareBody(data.share_url)}`}
                   target="_blank" rel="noreferrer"
                   data-testid="referral-share-twitter"
                   className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-[12.5px] uppercase tracking-[0.16em] border border-[hsl(var(--aurin-border-soft))] text-[hsl(var(--aurin-text-muted))] hover:text-[hsl(var(--aurin-amber))] hover:border-[hsl(var(--aurin-amber))] transition">
                  <Twitter size={12} /> Post
                </a>
              </div>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-10" data-testid="referral-stats">
            <Stat label="Friends invited" value={data?.total_invited ?? 0} />
            <Stat label="Rewards landed" value={data?.total_rewarded ?? 0} accent />
            <Stat label="Minutes earned" value={minutes} accent />
          </div>

          {/* How it works */}
          <div className="aurin-card p-7">
            <p className="aurin-eyebrow mb-3">How it works</p>
            <ol className="space-y-3.5">
              <li className="flex items-start gap-3">
                <span className="aurin-step-num">1</span>
                <span className="text-[14.5px] leading-relaxed text-[hsl(var(--aurin-text))]">
                  Share your link with a friend. There is no list, no tracker, no spam.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="aurin-step-num">2</span>
                <span className="text-[14.5px] leading-relaxed text-[hsl(var(--aurin-text))]">
                  They open Aurin, sign in, and take a soft first step —
                  a daily check-in with their child, or a first voice pass.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="aurin-step-num">3</span>
                <span className="text-[14.5px] leading-relaxed text-[hsl(var(--aurin-text))]">
                  Both of you find +8 voice minutes (€5 worth) waiting in
                  your account, quietly. No notification spam, just real
                  credit. <Sparkles size={12} className="inline-block ml-1 text-[hsl(var(--aurin-amber))]" />
                </span>
              </li>
            </ol>
            <p className="mt-6 text-[12.5px] italic text-[hsl(var(--aurin-text-muted))] leading-relaxed">
              Only real, qualifying first actions trigger the reward — we don't pay
              for cold sign-ups. Self-referral does not work. One reward per friend.
            </p>
          </div>

          {/* Recent claims */}
          {data?.claims && data.claims.length > 0 && (
            <div className="mt-10" data-testid="referral-recent">
              <p className="aurin-eyebrow mb-3">Recent friends</p>
              <ul className="space-y-2">
                {data.claims.map((c) => (
                  <li key={c.id}
                      className="flex items-center gap-3 px-4 py-3 rounded-xl border border-[hsl(var(--aurin-border-soft))] bg-[hsl(var(--aurin-bg-soft))]"
                      data-testid={`referral-claim-${c.id}`}>
                    <span className={`text-[11.5px] uppercase tracking-[0.16em] px-2 py-0.5 rounded-full ${
                      c.status === "rewarded"
                        ? "bg-[hsl(var(--aurin-amber)/0.18)] text-[hsl(var(--aurin-amber))]"
                        : "bg-[hsl(var(--aurin-bg))] text-[hsl(var(--aurin-text-muted))]"
                    }`}>
                      {c.status}
                    </span>
                    <span className="text-[13px] text-[hsl(var(--aurin-text-muted))] flex-1">
                      {new Date(c.claimed_at).toLocaleDateString()}
                    </span>
                    {c.status === "rewarded" && (
                      <span className="text-[12.5px] text-[hsl(var(--aurin-amber))]">
                        +{Math.round((c.reward_seconds || 0) / 60)} min
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function Stat({ label, value, accent }) {
  return (
    <div className="aurin-card p-5 text-center"
         data-testid={`referral-stat-${label.toLowerCase().replace(/\s+/g, "-")}`}>
      <p className={`font-serif text-[28px] leading-none ${accent ? "text-[hsl(var(--aurin-amber))]" : "text-[hsl(var(--aurin-text))]"}`}>
        {value}
      </p>
      <p className="text-[11.5px] uppercase tracking-[0.18em] mt-2 text-[hsl(var(--aurin-text-muted))]">
        {label}
      </p>
    </div>
  );
}
