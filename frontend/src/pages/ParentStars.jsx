/**
 * ParentStars.jsx — /parent-portal/stars
 *
 * §KIDS-HUBS 2026-02-09 — Adult-facing companion to KidsStarsView.
 * Lives in the Aurin sanctuary (dark/sage) palette — NOT the bright
 * cream of the child hubs. The parent gets a calm, quiet list of
 * pending star requests across all their child profiles, approves
 * or rejects them, and sees a small summary per child.
 */

import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import PageHeader from "@/components/layout/PageHeader";
import { CheckCircle2, XCircle, ArrowRight, Sparkles, Clock } from "lucide-react";
import { api } from "@/lib/api";

export default function ParentStars() {
  const [data, setData] = useState({ children: [], pending: [], history: [] });
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(null);
  const [authError, setAuthError] = useState(false);

  const refresh = useCallback(async () => {
    try {
      const r = await api.get("/angel-stars/parent-portal");
      setData(r.data);
      setAuthError(false);
    } catch (e) {
      if (e?.response?.status === 401) setAuthError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const decide = async (req, approve) => {
    setBusy(req.id);
    try {
      await api.post(
        approve ? "/angel-stars/approve" : "/angel-stars/reject",
        { request_id: req.id },
      );
      await refresh();
    } catch {}
    setBusy(null);
  };

  if (authError) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6 text-[hsl(var(--aurin-text))]">
        <div className="text-center max-w-md">
          <h2 className="aurin-display text-2xl mb-3">A quiet sign-in first.</h2>
          <p className="text-[14.5px] text-[hsl(var(--aurin-text-muted))] mb-6">
            The Angel Stars portal is reserved for parents who have signed in.
            Sign in with your Google account and we'll bring you back here.
          </p>
          <Link
            to="/portal"
            data-testid="parent-stars-signin"
            className="aurin-btn aurin-btn-primary inline-flex items-center gap-2"
          >
            Sign in <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div data-testid="parent-portal-stars">
      <PageHeader
        tone="kids"
        eyebrow="Angel Stars · Parent Portal"
        title="The small things your child"
        italicWord="quietly does well."
        description="A calm record of the kind, brave, helpful moments your child has tapped into Aurin's Room. Approve what's true, gently ignore what isn't. There is no pressure — just attention."
      />

      <section className="aurin-section-sm">
        <div className="aurin-container">
          {/* Per-child summary */}
          {data.children && data.children.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10" data-testid="parent-stars-children">
              {data.children.map((c) => (
                <Link
                  to={`/kids-universe/${c.child_slug}/stars`}
                  key={c.child_slug}
                  data-testid={`parent-stars-child-${c.child_slug}`}
                  className="aurin-card p-5 block hover:border-[hsl(var(--aurin-sage))/0.5]"
                >
                  <p className="aurin-eyebrow mb-2">{c.age_range}</p>
                  <h3 className="aurin-display text-lg leading-snug">{c.title}</h3>
                  <div className="mt-3 flex items-baseline gap-2">
                    <span
                      className="text-[28px] font-serif text-[hsl(var(--aurin-amber))]"
                      data-testid={`parent-stars-child-${c.child_slug}-balance`}
                    >
                      {c.balance}
                    </span>
                    <span className="text-[14px] text-[hsl(var(--aurin-text-muted))]">★ stars</span>
                  </div>
                  <p className="mt-1 text-[12.5px] text-[hsl(var(--aurin-text-muted))]">
                    {c.total_earned} earned · {c.pending_count} waiting
                  </p>
                </Link>
              ))}
            </div>
          )}

          {/* Pending queue */}
          <div className="aurin-eyebrow mb-3 flex items-center gap-2">
            <Clock size={11} /> Pending · {data.pending?.length || 0}
          </div>
          <h2 className="aurin-display text-2xl md:text-3xl max-w-[26ch] mb-7">
            What your child says they did.
          </h2>
          {loading ? (
            <p className="text-[14px] aurin-serif-italic text-[hsl(var(--aurin-text-muted))]">
              One quiet breath…
            </p>
          ) : data.pending && data.pending.length > 0 ? (
            <ul className="space-y-3" data-testid="parent-stars-pending">
              {data.pending.map((req) => (
                <li
                  key={req.id}
                  data-testid={`parent-stars-pending-${req.id}`}
                  className="aurin-card p-5 flex flex-col sm:flex-row sm:items-center gap-4"
                >
                  <div className="flex-1">
                    <p className="aurin-eyebrow mb-1.5">
                      {req.child_title || req.child_slug} · {new Date(req.created_at).toLocaleDateString()}
                    </p>
                    <p className="text-[15px] leading-snug text-[hsl(var(--aurin-text))]">
                      {req.action_label}
                    </p>
                    <p className="text-[12.5px] text-[hsl(var(--aurin-sage))] mt-1.5 flex items-center gap-1">
                      <Sparkles size={11} /> +{req.stars} ★ if approved
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => decide(req, false)}
                      disabled={busy === req.id}
                      data-testid={`parent-stars-reject-${req.id}`}
                      className="aurin-btn aurin-btn-ghost text-[13px] inline-flex items-center gap-1.5"
                    >
                      <XCircle size={13} /> Not yet
                    </button>
                    <button
                      type="button"
                      onClick={() => decide(req, true)}
                      disabled={busy === req.id}
                      data-testid={`parent-stars-approve-${req.id}`}
                      className="aurin-btn aurin-btn-primary text-[13px] inline-flex items-center gap-1.5"
                    >
                      <CheckCircle2 size={13} /> Approve
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p
              className="text-[14px] aurin-serif-italic text-[hsl(var(--aurin-text-muted))]"
              data-testid="parent-stars-empty"
            >
              Nothing waiting just now. Your child will tap a star when one feels true.
            </p>
          )}

          {/* Recent history */}
          {data.history && data.history.length > 0 && (
            <div className="mt-12">
              <div className="aurin-eyebrow mb-3">Recently approved</div>
              <ul className="space-y-2" data-testid="parent-stars-history">
                {data.history.slice(0, 12).map((h) => (
                  <li
                    key={h.id}
                    className="flex items-center gap-3 text-[13.5px] text-[hsl(var(--aurin-text-muted))] border-b border-[hsl(var(--aurin-border-soft))] pb-2"
                  >
                    <CheckCircle2 size={13} className="text-[hsl(var(--aurin-sage))]" />
                    <span className="flex-1">
                      {h.child_title || h.child_slug} · {h.action_label}
                    </span>
                    <span className="text-[hsl(var(--aurin-amber))]">+{h.stars} ★</span>
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
