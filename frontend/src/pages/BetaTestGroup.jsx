import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import PageHeader from "@/components/layout/PageHeader";
import NewsletterSignup from "@/components/NewsletterSignup";
import { useAuth } from "@/contexts/AuthProvider";
import {
  fetchBetaStatus,
  fetchBetaMe,
  enrollBeta,
} from "@/lib/api";
import {
  ArrowRight,
  Lock,
  Shield,
  BookOpen,
  Wind,
  Sparkles,
  Check,
  Hourglass,
} from "lucide-react";

/**
 * /test-group — Beta test group landing.
 *
 * Soft, house-toned recruitment page. Goals:
 *   - Establish exclusivity (10 doors, that is all).
 *   - No card required. 14 quiet days of full access.
 *   - Convert via attention, not urgency.
 *
 * Contract:
 *   GET  /api/beta/status   → public counter
 *   GET  /api/beta/me       → auth, current user enrollment state
 *   POST /api/beta/enroll   → auth, idempotent grant
 */

export default function BetaTestGroup() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  const [status, setStatus] = useState(null);
  const [me, setMe] = useState(null);
  const [enrolling, setEnrolling] = useState(false);
  const [error, setError] = useState(null);

  // Public counter (always)
  useEffect(() => {
    let alive = true;
    const tick = async () => {
      try {
        const s = await fetchBetaStatus();
        if (alive) setStatus(s);
      } catch {
        /* counter is decorative — silent fail */
      }
    };
    tick();
    const id = setInterval(tick, 20000);
    return () => {
      alive = false;
      clearInterval(id);
    };
  }, []);

  // User enrollment state
  useEffect(() => {
    if (!user) return;
    let alive = true;
    (async () => {
      try {
        const r = await fetchBetaMe();
        if (alive) setMe(r);
      } catch {
        /* not enrolled or signed-out edge case */
      }
    })();
    return () => {
      alive = false;
    };
  }, [user]);

  const handleApply = async () => {
    setError(null);
    if (!user) {
      const back = encodeURIComponent("/test-group");
      navigate(`/portal?next=${back}`);
      return;
    }
    setEnrolling(true);
    try {
      const r = await enrollBeta();
      if (r.is_full) {
        // Refresh status so the counter UI flips to FULL.
        const s = await fetchBetaStatus();
        setStatus(s);
        setError(
          "All ten doors are taken for this round. You can leave a quiet note below — we'll send word when the next round opens."
        );
        return;
      }
      // Success or already_enrolled — refetch state.
      const [s, mine] = await Promise.all([fetchBetaStatus(), fetchBetaMe()]);
      setStatus(s);
      setMe(mine);
    } catch (err) {
      setError(
        err?.response?.data?.detail ||
          "Something didn't land. Try again in a moment."
      );
    } finally {
      setEnrolling(false);
    }
  };

  const slotsLeft = status?.slots_left ?? null;
  const slotsTotal = status?.slots_total ?? 10;
  const isFull = status?.is_open === false;
  const enrolled = me?.enrolled === true && me?.is_active === true;

  return (
    <div data-testid="page-test-group">
      <PageHeader
        tone="default"
        eyebrow="Test Group"
        title="We are looking for"
        italicWord="ten quiet wanderers."
        description="Be one of the first to walk through the Aurin rooms. Fourteen quiet days. No card. We only ask that you tell us, gently, what shifted."
      />

      {/* Counter + CTA card */}
      <section className="aurin-section-sm" data-testid="beta-hero">
        <div className="aurin-container max-w-[640px]">
          <div className="aurin-card p-8 md:p-10 space-y-7" data-testid="beta-counter-card">
            <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.32em] text-[hsl(var(--aurin-text-muted))]">
              <span>Open doors</span>
              <span data-testid="beta-counter-text" className="text-[hsl(var(--aurin-sage))]">
                {slotsLeft === null
                  ? "—"
                  : `${slotsLeft} / ${slotsTotal}`}
              </span>
            </div>
            <ProgressBar slotsLeft={slotsLeft} slotsTotal={slotsTotal} />

            <CTABlock
              loading={loading}
              user={user}
              enrolled={enrolled}
              isFull={isFull}
              enrolling={enrolling}
              error={error}
              onApply={handleApply}
              meExpiresAt={me?.expires_at}
              meSecondsRemaining={me?.seconds_remaining}
            />

            <p className="text-[11.5px] leading-relaxed text-[hsl(var(--aurin-text-muted))]">
              Fourteen quiet days of full access. No card required. You can
              leave at any moment.
            </p>
          </div>
        </div>
      </section>

      {/* What you'll be testing */}
      <section className="aurin-section-sm" data-testid="beta-what">
        <div className="aurin-container max-w-[860px]">
          <div className="aurin-eyebrow">What this is</div>
          <h2 className="aurin-display text-3xl md:text-4xl leading-tight max-w-[24ch]">
            A small set of quiet rooms,{" "}
            <span className="aurin-serif-italic text-[hsl(var(--aurin-sage))]">
              opened to you for a moment.
            </span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-10">
            <BenefitCard
              n="01"
              icon={Shield}
              title="Grace"
              body="Encrypted private room (AES-256). A non-judgemental Light-side guide. No advice — only space."
              testid="beta-benefit-clarity"
            />
            <BenefitCard
              n="02"
              icon={BookOpen}
              title="The full library"
              body="All eight slow-written books, kids and adults, opened for the duration. Reading is private."
              testid="beta-benefit-library"
            />
            <BenefitCard
              n="03"
              icon={Wind}
              title="The Beginning"
              body="The seven-step gated experience. What you write stays yours. No one reads it without you."
              testid="beta-benefit-beginning"
            />
          </div>
        </div>
      </section>

      {/* Coming soon row */}
      <section className="aurin-section-sm" data-testid="beta-coming">
        <div className="aurin-container max-w-[860px]">
          <div className="aurin-eyebrow">Soon, also</div>
          <p className="text-[14.5px] leading-relaxed text-[hsl(var(--aurin-text-muted))] max-w-[60ch] mb-8">
            These rooms are still being shaped. They are not part of the test
            group — they will arrive in their own time.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <ComingSoonCard
              title="The Parents' Room"
              body="A quiet shelf for the people who carry the weight of small ones."
              testid="beta-soon-parents"
            />
            <ComingSoonCard
              title="The Body Room"
              body="Where the body speaks first — and the mind learns to listen."
              testid="beta-soon-body"
            />
            <ComingSoonCard
              title="Coloring credits"
              body="Single-page calm work for children, made one page at a time."
              testid="beta-soon-coloring"
            />
            <ComingSoonCard
              title="Audio sessions"
              body="A human voice, recorded slowly. Not yet — but soon."
              testid="beta-soon-audio"
            />
          </div>
        </div>
      </section>

      {/* Waitlist (newsletter) — gentle fallback */}
      <section className="aurin-section-sm" data-testid="beta-waitlist">
        <div className="aurin-container max-w-[640px]">
          <div className="aurin-card p-7 md:p-8 space-y-4">
            <div className="aurin-eyebrow !mb-1">If the doors are closed</div>
            <p className="aurin-display text-2xl leading-snug">
              Leave a quiet note,{" "}
              <span className="aurin-serif-italic text-[hsl(var(--aurin-sage))]">
                and we'll let you know.
              </span>
            </p>
            <p className="text-[13.5px] leading-relaxed text-[hsl(var(--aurin-text-muted))]">
              When the next round opens, you'll be the first to hear. No
              marketing. One soft note when there is something real to share.
            </p>
            <NewsletterSignup source="test-group:waitlist" />
          </div>
        </div>
      </section>

      {/* Trust + footer line */}
      <section className="aurin-section-sm" data-testid="beta-trust">
        <div className="aurin-container max-w-[640px] text-center">
          <p className="text-[12px] leading-relaxed text-[hsl(var(--aurin-text-muted))]/80 aurin-serif-italic">
            Limited to ten early wanderers · No card required · Two quiet weeks
          </p>
        </div>
      </section>
    </div>
  );
}

/* ---------- Sub-components ---------- */

function ProgressBar({ slotsLeft, slotsTotal }) {
  const filled =
    slotsLeft === null
      ? 100
      : Math.max(0, Math.min(100, (slotsLeft / slotsTotal) * 100));
  return (
    <div className="w-full h-1.5 rounded-full bg-[hsl(var(--aurin-border))/0.4] overflow-hidden">
      <div
        data-testid="beta-progress-fill"
        className="h-full bg-[hsl(var(--aurin-sage))] transition-all duration-700 ease-out"
        style={{ width: `${filled}%` }}
      />
    </div>
  );
}

function CTABlock({
  loading,
  user,
  enrolled,
  isFull,
  enrolling,
  error,
  onApply,
  meExpiresAt,
  meSecondsRemaining,
}) {
  if (loading) {
    return (
      <div
        data-testid="beta-cta-loading"
        className="text-[13px] text-[hsl(var(--aurin-text-muted))] aurin-serif-italic"
      >
        A small breath…
      </div>
    );
  }

  if (enrolled) {
    const days = meSecondsRemaining
      ? Math.max(0, Math.round(meSecondsRemaining / 86400))
      : null;
    return (
      <div className="space-y-4" data-testid="beta-cta-enrolled">
        <div className="flex items-center gap-3 text-[14px] text-[hsl(var(--aurin-sage))]">
          <Check size={16} strokeWidth={1.6} />
          <span className="aurin-serif-italic">
            You are in. {days !== null ? `${days} quiet days remain.` : ""}
          </span>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link
            to="/clarity-release"
            data-testid="beta-go-clarity"
            className="aurin-btn aurin-btn-primary"
          >
            Step into Clarity Release <ArrowRight size={13} />
          </Link>
          <Link
            to="/library"
            data-testid="beta-go-library"
            className="aurin-btn aurin-btn-ghost"
          >
            Open the library
          </Link>
        </div>
      </div>
    );
  }

  if (isFull) {
    return (
      <div className="space-y-3" data-testid="beta-cta-full">
        <div className="flex items-center gap-3 text-[14px] text-[hsl(var(--aurin-text))/0.92]">
          <Hourglass size={16} strokeWidth={1.6} />
          <span className="aurin-serif-italic">
            All ten doors are taken for this round.
          </span>
        </div>
        <p className="text-[12.5px] text-[hsl(var(--aurin-text-muted))]">
          Leave a quiet note below — when the next round opens, you'll be the
          first to hear.
        </p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="space-y-3" data-testid="beta-cta-signedout">
        <button
          onClick={onApply}
          disabled={enrolling}
          data-testid="beta-apply-signin"
          className="aurin-btn aurin-btn-primary w-full justify-center"
        >
          <Lock size={14} strokeWidth={1.6} /> Apply quietly · Sign in
        </button>
        <p className="text-[12px] text-[hsl(var(--aurin-text-muted))]">
          One quiet step. No card. The space is private from the first second.
        </p>
        {error && (
          <p data-testid="beta-error" className="text-[12.5px] text-red-300/90">
            {error}
          </p>
        )}
      </div>
    );
  }

  // Signed-in, not enrolled, doors open.
  return (
    <div className="space-y-3" data-testid="beta-cta-ready">
      <button
        onClick={onApply}
        disabled={enrolling}
        data-testid="beta-apply"
        className="aurin-btn aurin-btn-primary w-full justify-center disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {enrolling ? (
          <>
            <Sparkles size={14} className="animate-pulse" /> Opening the door…
          </>
        ) : (
          <>
            Step into the test group <ArrowRight size={14} />
          </>
        )}
      </button>
      {error && (
        <p data-testid="beta-error" className="text-[12.5px] text-red-300/90">
          {error}
        </p>
      )}
    </div>
  );
}

function BenefitCard({ n, icon: Icon, title, body, testid }) {
  return (
    <div data-testid={testid} className="aurin-card p-7 space-y-4 flex flex-col">
      <div className="flex items-center gap-3">
        <span className="text-[10.5px] uppercase tracking-[0.32em] text-[hsl(var(--aurin-text-muted))]">
          {n}
        </span>
        <span className="w-8 h-8 rounded-full border border-[hsl(var(--aurin-border))] flex items-center justify-center text-[hsl(var(--aurin-sage))]">
          <Icon size={14} strokeWidth={1.5} />
        </span>
      </div>
      <h3 className="aurin-display text-[19px] leading-tight">{title}</h3>
      <p className="text-[13.5px] leading-relaxed text-[hsl(var(--aurin-text-muted))]">
        {body}
      </p>
    </div>
  );
}

function ComingSoonCard({ title, body, testid }) {
  return (
    <div
      data-testid={testid}
      className="aurin-card p-5 space-y-3 opacity-80 hover:opacity-100 transition-opacity"
    >
      <span className="text-[10.5px] uppercase tracking-[0.28em] text-[hsl(var(--aurin-text-muted))]">
        Soon
      </span>
      <h3 className="aurin-display text-[16.5px] leading-tight">{title}</h3>
      <p className="text-[12.5px] leading-relaxed text-[hsl(var(--aurin-text-muted))]">
        {body}
      </p>
    </div>
  );
}
