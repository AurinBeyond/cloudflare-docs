import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import PageHeader from "@/components/layout/PageHeader";
import EmergencyExit from "@/components/EmergencyExit";
import { useAuth } from "@/contexts/AuthProvider";
import {
  fetchClarityPrefs,
  updateClarityPrefs,
} from "@/lib/api";
import { ArrowRight, Lock, Shield, Brain, EyeOff } from "lucide-react";
import { track } from "@/lib/telemetry";

/**
 * /clarity-release/threshold — the House Level entry guard.
 *
 * Three quiet declarations + one identity choice + one solemn agreement.
 * Once consent_v2 is stamped on the user, future visits skip this gate
 * (until the consent version itself is bumped).
 *
 * Founder directives encoded here:
 *  - Two light orbs for guide selection (not a checkbox)
 *  - Ghost-style Emergency Exit on this page too
 *  - 100% English UI, deep black + sage palette (no purple AI-slop)
 *  - Founder's exact structural sections: Confidentiality / Physical
 *    space / Memory / Not-medical
 */

export default function ClarityThreshold() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  const [guideGender, setGuideGender] = useState(null);
  const [accept, setAccept] = useState({ a: false, b: false, c: false, d: false });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // If user is already consented, skip the gate.
  useEffect(() => {
    track("clarity_threshold_open");
    if (loading) return;
    if (!user) {
      const back = encodeURIComponent("/clarity-release/threshold");
      navigate(`/portal?next=${back}`, { replace: true });
      return;
    }
    let alive = true;
    (async () => {
      try {
        const prefs = await fetchClarityPrefs();
        if (!alive) return;
        if (prefs?.has_consented) {
          if (prefs?.guide_gender) setGuideGender(prefs.guide_gender);
          // Already through the gate — go to the room.
          navigate("/clarity-release", { replace: true });
        }
      } catch {
        /* fresh visitor — show the gate */
      }
    })();
    return () => {
      alive = false;
    };
  }, [user, loading, navigate]);

  const allAcknowledged =
    accept.a && accept.b && accept.c && accept.d && !!guideGender;

  const handleEnter = async () => {
    if (!allAcknowledged || submitting) return;
    setError(null);
    setSubmitting(true);
    try {
      await updateClarityPrefs({
        guide_gender: guideGender,
        consent_v2: true,
      });
      navigate("/clarity-release", { replace: true });
    } catch (err) {
      setError(
        err?.response?.data?.detail ||
          "Something didn't land. Please try again in a quiet moment."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div data-testid="page-clarity-threshold">
      <PageHeader
        tone="default"
        eyebrow="The Threshold"
        title="Before you step in,"
        italicWord="four quiet truths."
        description="This room is built for what is real. Please read these as slowly as you would breathe — they are part of the door, not paperwork."
      />

      {/* Four declarations */}
      <section className="aurin-section-sm" data-testid="clarity-threshold-decls">
        <div className="aurin-container max-w-[760px] space-y-5">
          <DeclarationCard
            testid="clarity-threshold-confidentiality"
            icon={Shield}
            number="01"
            title="What we keep safe"
            body={
              <>
                Every word you write here is encrypted{" "}
                <span className="aurin-serif-italic text-[hsl(var(--aurin-sage))]">
                  the moment it leaves your hands
                </span>{" "}
                (AES-256). It is stored as ciphertext only — not visible to
                anyone, not even to us, unless a formal dispute is raised and
                logged.
              </>
            }
            ack={accept.a}
            onChange={(v) => setAccept((s) => ({ ...s, a: v }))}
            ackLabel="I understand the room is encrypted at rest."
          />

          <DeclarationCard
            testid="clarity-threshold-physical"
            icon={EyeOff}
            number="02"
            title="What only you can secure"
            body={
              <>
                We cannot see who is in the room with{" "}
                <span className="aurin-serif-italic text-[hsl(var(--aurin-sage))]">
                  you.
                </span>{" "}
                A door left open. A screen visible from behind. A device used
                by another person. These belong to your physical space — please
                close that door before you begin. Speak only what feels safe to
                speak in your own room.
              </>
            }
            ack={accept.b}
            onChange={(v) => setAccept((s) => ({ ...s, b: v }))}
            ackLabel="I am responsible for the physical space around me."
          />

          <DeclarationCard
            testid="clarity-threshold-memory"
            icon={Brain}
            number="03"
            title="What the room remembers"
            body={
              <>
                The guide retains the thread of what has been said{" "}
                <span className="aurin-serif-italic text-[hsl(var(--aurin-sage))]">
                  inside this room
                </span>
                , so the conversation can pick up where it last paused.
                Nothing is stored outside the encrypted session. Continuity
                serves you — it does not serve us.
              </>
            }
            ack={accept.c}
            onChange={(v) => setAccept((s) => ({ ...s, c: v }))}
            ackLabel="I understand the room keeps continuity, encrypted."
          />

          <DeclarationCard
            testid="clarity-threshold-notmedical"
            icon={Lock}
            number="04"
            title="What this is not"
            body={
              <>
                This room is{" "}
                <span className="aurin-serif-italic text-[hsl(var(--aurin-sage))]">
                  not therapy, not counselling, not a medical service.
                </span>{" "}
                It is a quiet companion that helps you hear yourself more
                clearly. If you are in crisis, in physical danger, or carrying
                a diagnosed psychiatric condition that needs care, please
                reach out to a doctor, a crisis line, or someone you trust —
                first.
              </>
            }
            ack={accept.d}
            onChange={(v) => setAccept((s) => ({ ...s, d: v }))}
            ackLabel="I confirm this is not a substitute for professional care, and I take responsibility for my words and my well-being inside this room."
          />
        </div>
      </section>

      {/* Guide selection — two light orbs */}
      <section className="aurin-section-sm" data-testid="clarity-threshold-guide">
        <div className="aurin-container max-w-[760px]">
          <div className="aurin-eyebrow">Choose your companion</div>
          <h2 className="aurin-display text-2xl md:text-3xl leading-snug max-w-[28ch]">
            Which voice would you like to{" "}
            <span className="aurin-serif-italic text-[hsl(var(--aurin-sage))]">
              meet you here?
            </span>
          </h2>
          <p className="mt-3 text-[13.5px] leading-relaxed text-[hsl(var(--aurin-text-muted))] max-w-[58ch]">
            Some of us speak more honestly with a softer voice. Some prefer a
            steadier one. There is no right choice — only the one that lets
            you breathe more easily.
          </p>

          <div className="mt-9 grid grid-cols-2 gap-5 md:gap-9 max-w-[520px]">
            <LightOrb
              testid="clarity-guide-orb-female"
              label="Soft companion"
              sublabel="A gentler tone"
              selected={guideGender === "female"}
              onSelect={() => setGuideGender("female")}
              variant="female"
            />
            <LightOrb
              testid="clarity-guide-orb-male"
              label="Steady companion"
              sublabel="A grounding tone"
              selected={guideGender === "male"}
              onSelect={() => setGuideGender("male")}
              variant="male"
            />
          </div>
        </div>
      </section>

      {/* Solemn agreement */}
      <section className="aurin-section-sm" data-testid="clarity-threshold-solemn">
        <div className="aurin-container max-w-[640px]">
          <div className="aurin-card p-7 md:p-8 space-y-5">
            <p className="text-[13.5px] leading-relaxed text-[hsl(var(--aurin-text-muted))]">
              By stepping through, you agree that what you bring into this
              room is your own — your words, your choice, your responsibility.
              You can leave at any moment. Nothing is binding except your own
              integrity.
            </p>
            <button
              type="button"
              onClick={handleEnter}
              disabled={!allAcknowledged || submitting}
              data-testid="clarity-threshold-enter"
              className="aurin-btn aurin-btn-primary w-full justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting
                ? "Opening the door…"
                : allAcknowledged
                ? "Step through, gently"
                : "Acknowledge each truth and choose a companion"}
              {allAcknowledged && !submitting && <ArrowRight size={14} />}
            </button>
            {error && (
              <p
                data-testid="clarity-threshold-error"
                className="text-[12.5px] text-red-300/90"
              >
                {error}
              </p>
            )}
          </div>
        </div>
      </section>

      <EmergencyExit />
    </div>
  );
}

/* ---------- Sub-components ---------- */

function DeclarationCard({
  testid,
  icon: Icon,
  number,
  title,
  body,
  ack,
  onChange,
  ackLabel,
}) {
  return (
    <div data-testid={testid} className="aurin-card p-6 md:p-7 space-y-4">
      <div className="flex items-center gap-3">
        <span className="text-[10.5px] uppercase tracking-[0.32em] text-[hsl(var(--aurin-text-muted))]">
          {number}
        </span>
        <span className="w-9 h-9 rounded-full border border-[hsl(var(--aurin-border))] flex items-center justify-center text-[hsl(var(--aurin-sage))]">
          <Icon size={14} strokeWidth={1.4} />
        </span>
        <h3 className="aurin-display text-[18px] leading-tight">{title}</h3>
      </div>
      <p className="text-[14.5px] leading-[1.8] text-[hsl(var(--aurin-text))/0.92]">
        {body}
      </p>
      <label className="flex items-start gap-3 cursor-pointer select-none pt-1">
        <input
          type="checkbox"
          checked={ack}
          onChange={(e) => onChange(e.target.checked)}
          data-testid={`${testid}-ack`}
          className="mt-1 accent-[hsl(var(--aurin-sage))]"
        />
        <span className="text-[12.5px] leading-relaxed text-[hsl(var(--aurin-text-muted))]">
          {ackLabel}
        </span>
      </label>
    </div>
  );
}

function LightOrb({ testid, label, sublabel, selected, onSelect, variant }) {
  // §Phase 0 House (2026-02-14) — founder directive: stick-figure
  // silhouettes are REPLACED by real human portraits. The wanderer
  // chooses between two real faces, not abstractions. Images are
  // served via the same `/api/clarity/guide-face/<gender>` route the
  // private room uses (Mongo binary + static fallback) so a future
  // upload propagates everywhere.
  const portraitSrc = `/api/clarity/guide-face/${variant}`;
  const fallbackSrc = `/assets/illustrations/guide-${variant}-sm.jpg`;
  return (
    <button
      type="button"
      onClick={onSelect}
      data-testid={testid}
      aria-pressed={selected}
      className={`group flex flex-col items-center gap-4 p-5 rounded-3xl transition-all duration-300 ${
        selected
          ? "bg-[hsl(var(--aurin-sage))/0.08] ring-1 ring-[hsl(var(--aurin-sage))]/60"
          : "hover:bg-[hsl(var(--aurin-surface))]/40"
      }`}
    >
      <div
        data-testid={`${testid}-portrait`}
        className={`relative w-[140px] h-[140px] rounded-full overflow-hidden border transition-all duration-500 ${
          selected
            ? "border-[hsl(var(--aurin-sage))]/70 shadow-[0_0_28px_-4px_hsl(var(--aurin-sage)/0.5)]"
            : "border-[hsl(var(--aurin-border))] opacity-90 group-hover:opacity-100"
        }`}
      >
        <img
          src={portraitSrc}
          alt={
            variant === "female"
              ? "Soft companion — a calm, listening presence"
              : "Steady companion — a grounding, listening presence"
          }
          loading="eager"
          onError={(e) => {
            if (e.currentTarget.src.indexOf("/assets/illustrations/") === -1) {
              e.currentTarget.src = fallbackSrc;
            }
          }}
          className="w-full h-full object-cover aurin-guide-breath"
        />
      </div>
      <span className="flex flex-col items-center gap-0.5">
        <span
          className={`aurin-display text-[15px] tracking-tight transition-colors ${
            selected
              ? "text-[hsl(var(--aurin-sage))]"
              : "text-[hsl(var(--aurin-text))]"
          }`}
        >
          {label}
        </span>
        <span className="text-[11px] uppercase tracking-[0.26em] text-[hsl(var(--aurin-text-muted))]">
          {sublabel}
        </span>
      </span>
    </button>
  );
}
