import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import PageHeader from "@/components/layout/PageHeader";
import { ArrowRight, Sparkles, Compass } from "lucide-react";
import { useAuth } from "@/contexts/AuthProvider";
import { fetchBeginningStatus, startBeginning } from "@/lib/api";

/**
 * The Beginning — Silent Landing Page
 *
 * A "recognition-based entry": the visitor reads, and at some point feels
 * "this is for me". We never call it a course, never use the word module.
 * The only commitment we ask for is to begin.
 */
export default function TheBeginning() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [status, setStatus] = useState(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!user) return;
    let alive = true;
    (async () => {
      try {
        const s = await fetchBeginningStatus();
        if (alive) setStatus(s);
      } catch {
        /* not signed in or first visit — keep null */
      }
    })();
    return () => {
      alive = false;
    };
  }, [user]);

  const handleBegin = async () => {
    if (!user) {
      // route through the portal — Google sign-in lives there.
      const back = encodeURIComponent("/the-beginning/step");
      navigate(`/portal?next=${back}`);
      return;
    }
    setBusy(true);
    try {
      if (!status?.started) {
        await startBeginning();
      }
      navigate("/the-beginning/step");
    } finally {
      setBusy(false);
    }
  };

  const ctaLabel = !user
    ? "Begin · Sign in to continue"
    : status?.is_done
    ? "Read what you wrote"
    : status?.started
    ? "Continue where you left off"
    : "Start when you feel ready";

  return (
    <div data-testid="page-the-beginning">
      <PageHeader
        tone="default"
        eyebrow="The Beginning"
        title="A quiet shift starts when you"
        italicWord="see clearly."
        description="You may not be starting something new. You may be seeing something that was always there."
      />

      <section className="aurin-section-sm">
        <div className="aurin-container max-w-[760px] space-y-12">
          <Block eyebrow="Recognition" data-testid="tb-recognition">
            <p>Something repeats.</p>
            <p>Reactions. Situations. Choices.</p>
            <p>Not always visible. But familiar.</p>
          </Block>

          <Block eyebrow="The shift" data-testid="tb-shift">
            <p>Not everything you do is a conscious decision.</p>
            <p>Some things were learned. Some repeated. Some never questioned.</p>
            <p>
              Over time, they become automatic. And what feels like{" "}
              <em>you</em> is sometimes just… continuation.
            </p>
          </Block>

          <Block eyebrow="What this is" data-testid="tb-what">
            <p>This is a small, quiet sequence.</p>
            <p>
              Seven small steps. Not to fix anything. Not to teach you anything.
            </p>
            <p>Just to see.</p>
          </Block>

          <Block eyebrow="Balance" data-testid="tb-balance">
            <p>You don't need to reject your life.</p>
            <p>You don't need to break rules.</p>
            <p>You can respect structure — and still expand within it.</p>
            <p>There is more space than it seems.</p>
          </Block>

          <Block eyebrow="What you may notice" data-testid="tb-notice">
            <p>Within a short time, you may begin to notice:</p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>small pauses before reacting</li>
              <li>clearer thoughts in situations that used to feel automatic</li>
              <li>a quiet sense that something is shifting</li>
            </ul>
            <p>Nothing dramatic is required. Small changes are enough.</p>
          </Block>

          <Block eyebrow="Honest note" data-testid="tb-honest">
            <p>
              Within 7 days, you may begin to notice small but real changes.
              But this is only the beginning.
            </p>
            <p>
              The old system is deeply rooted and may try to pull you back into
              what is familiar. Real change requires continued awareness and
              conscious direction.
            </p>
            <p>What matters is not perfection. Just not going back unconsciously.</p>
          </Block>

          <div className="pt-6 flex flex-col items-start gap-4" data-testid="tb-cta-wrap">
            <button
              type="button"
              onClick={handleBegin}
              disabled={busy || loading}
              data-testid="tb-cta-begin"
              className="aurin-btn aurin-btn-primary disabled:opacity-60"
            >
              <Sparkles size={14} /> {ctaLabel} <ArrowRight size={14} />
            </button>
            <p className="text-[12.5px] text-[hsl(var(--aurin-text-muted))]">
              {user
                ? "Free for now. Quiet by design."
                : "Sign-in keeps your reflections private to you."}
            </p>
          </div>

          <div
            className="aurin-card p-6 mt-10 flex items-start gap-4"
            data-testid="tb-coming-soon"
          >
            <Compass size={16} className="text-[hsl(var(--aurin-sage))] mt-0.5 shrink-0" />
            <div className="space-y-2">
              <div className="aurin-eyebrow !mb-0">Quiet continuation</div>
              <p className="text-[14px] leading-relaxed text-[hsl(var(--aurin-text-muted))]">
                Deeper materials are being prepared. Not as more information —
                just a different depth of the same direction. You'll see when
                they're there.
              </p>
            </div>
          </div>

          <div className="text-center pt-4">
            <Link
              to="/library"
              className="text-[13px] text-[hsl(var(--aurin-text-muted))] hover:text-[hsl(var(--aurin-sage))] transition-colors"
              data-testid="tb-back-library"
            >
              ← Back to the Library
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

function Block({ eyebrow, children, ...rest }) {
  return (
    <div {...rest}>
      <div className="aurin-eyebrow mb-4">{eyebrow}</div>
      <div className="text-[16px] leading-[1.85] text-[hsl(var(--aurin-text))/0.92] space-y-4">
        {children}
      </div>
    </div>
  );
}
