import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import PageHeader from "@/components/layout/PageHeader";
import { ArrowRight, ArrowLeft, Sparkles, RotateCcw } from "lucide-react";
import { useAuth } from "@/contexts/AuthProvider";
import {
  fetchBeginningStatus,
  submitBeginningReflection,
  resetBeginning,
  startBeginning,
} from "@/lib/api";
import NewsletterSignup from "@/components/NewsletterSignup";

/**
 * The Beginning — Step view.
 *
 * Shows ONE step at a time, with a quiet reflection prompt.
 * Submitting the reflection unlocks the next step on the backend.
 * After submit we hold the user in a soft "transition" state for a few
 * seconds (psychological pacing) before the next step appears.
 *
 * No "Module 3 / 7" indicators — orientation is human:
 *   "This is the next part."
 */
export default function TheBeginningStep() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [status, setStatus] = useState(null);
  const [text, setText] = useState("");
  const [presence, setPresence] = useState(null); // 1..5
  const [submitting, setSubmitting] = useState(false);
  const [phase, setPhase] = useState("read"); // read · pause · ready · done
  const [pauseLeft, setPauseLeft] = useState(0);
  const [error, setError] = useState(null);
  const pauseTimer = useRef(null);

  // Boot: load progress; redirect if not signed in
  useEffect(() => {
    if (loading) return;
    if (!user) {
      navigate("/portal?next=/the-beginning/step");
      return;
    }
    let alive = true;
    (async () => {
      try {
        let s = await fetchBeginningStatus();
        if (!s?.started) {
          await startBeginning();
          s = await fetchBeginningStatus();
        }
        if (!alive) return;
        setStatus(s);
        if (s.is_done) {
          setPhase("done");
        } else if (s.pause_remaining > 0) {
          setPhase("pause");
          setPauseLeft(s.pause_remaining);
        } else {
          setPhase("read");
        }
      } catch (e) {
        if (alive) setError("Could not open this part. Please try again.");
      }
    })();
    return () => {
      alive = false;
      if (pauseTimer.current) clearInterval(pauseTimer.current);
    };
  }, [user, loading, navigate]);

  // Pause countdown — runs only when phase === "pause".
  useEffect(() => {
    if (phase !== "pause") return;
    if (pauseTimer.current) clearInterval(pauseTimer.current);
    pauseTimer.current = setInterval(() => {
      setPauseLeft((s) => {
        if (s <= 1) {
          clearInterval(pauseTimer.current);
          // Pull fresh status (reveals new step)
          (async () => {
            try {
              const next = await fetchBeginningStatus();
              setStatus(next);
              setText("");
              setPresence(null);
              setPhase(next.is_done ? "done" : "read");
            } catch {
              setPhase("read");
            }
          })();
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(pauseTimer.current);
  }, [phase]);

  const handleSubmit = async (e) => {
    e?.preventDefault?.();
    setError(null);
    if (text.trim().length < 6) {
      setError(
        "Just a few words is enough — but please write something so the next part can open."
      );
      return;
    }
    setSubmitting(true);
    try {
      const res = await submitBeginningReflection(text.trim(), presence);
      if (res.is_done) {
        const next = await fetchBeginningStatus();
        setStatus(next);
        setPhase("done");
      } else {
        setPauseLeft(res.pause_seconds || 8);
        setPhase("pause");
      }
    } catch (err) {
      setError(
        err?.response?.data?.detail ||
          "Something didn't land. Try again in a moment."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = async () => {
    if (!window.confirm("Begin again from the first part? This clears your notes.")) return;
    await resetBeginning();
    await startBeginning();
    const s = await fetchBeginningStatus();
    setStatus(s);
    setText("");
    setPresence(null);
    setPhase("read");
  };

  if (loading || !status) {
    return (
      <div data-testid="page-the-beginning-step" className="aurin-section-sm">
        <div className="aurin-container">
          <div className="text-[hsl(var(--aurin-text-muted))]">A small breath…</div>
        </div>
      </div>
    );
  }

  const step = status.step; // current step content (or null when done)

  return (
    <div data-testid="page-the-beginning-step">
      <PageHeader
        tone="default"
        eyebrow="The Beginning"
        title={phase === "done" ? "That's it." : "This is the"}
        italicWord={phase === "done" ? "Or maybe not." : "next part."}
        description={
          phase === "done"
            ? "You'll probably notice things differently now. Even if it's subtle. Don't try to hold it. Just don't ignore it either."
            : "Continue when you feel ready. There is no rush."
        }
      >
        <Link to="/the-beginning" className="aurin-btn aurin-btn-ghost" data-testid="tb-step-back">
          <ArrowLeft size={13} /> Back
        </Link>
      </PageHeader>

      <section className="aurin-section-sm">
        <div className="aurin-container max-w-[720px]">
          {phase === "pause" && (
            <PausePanel left={pauseLeft} />
          )}

          {phase === "read" && step && (
            <ReadPanel
              step={step}
              text={text}
              setText={setText}
              presence={presence}
              setPresence={setPresence}
              submitting={submitting}
              error={error}
              onSubmit={handleSubmit}
            />
          )}

          {phase === "done" && (
            <DonePanel reflections={status.reflections} onReset={handleReset} />
          )}
        </div>
      </section>
    </div>
  );
}

function ReadPanel({ step, text, setText, presence, setPresence, submitting, error, onSubmit }) {
  return (
    <form onSubmit={onSubmit} className="space-y-9" data-testid="tb-step-form">
      <div className="space-y-5" data-testid="tb-step-content">
        <p className="aurin-display text-2xl md:text-3xl leading-[1.25] aurin-serif-italic text-[hsl(var(--aurin-sage))/0.95] whitespace-pre-line">
          {step.intro}
        </p>
        <div className="text-[16px] leading-[1.9] text-[hsl(var(--aurin-text))/0.94] whitespace-pre-line">
          {step.guidance}
        </div>
      </div>

      <div className="aurin-hairline" />

      <div className="space-y-4">
        <p className="text-[15px] leading-[1.8] text-[hsl(var(--aurin-text-muted))] whitespace-pre-line">
          {step.prompt}
        </p>
        <textarea
          rows={6}
          value={text}
          onChange={(e) => setText(e.target.value)}
          data-testid="tb-step-reflection"
          placeholder="Even a few words is enough."
          className="w-full bg-[hsl(var(--aurin-bg))] border border-[hsl(var(--aurin-border-soft))] rounded-xl px-4 py-3 text-[15px] leading-relaxed focus:border-[hsl(var(--aurin-sage))] outline-none transition-colors"
        />

        <PresencePicker presence={presence} setPresence={setPresence} />

        {error && (
          <div data-testid="tb-step-error" className="text-[13px] text-red-300/90">
            {error}
          </div>
        )}

        <div className="pt-2 flex flex-wrap items-center gap-4">
          <button
            type="submit"
            disabled={submitting}
            data-testid="tb-step-submit"
            className="aurin-btn aurin-btn-primary disabled:opacity-60"
          >
            {submitting ? "A moment…" : "Continue when ready"} <ArrowRight size={14} />
          </button>
          <span className="text-[12px] text-[hsl(var(--aurin-text-muted))]">
            Your notes stay yours. They are not shared.
          </span>
        </div>
      </div>
    </form>
  );
}

function PresencePicker({ presence, setPresence }) {
  return (
    <div data-testid="tb-step-presence">
      <div className="text-[12px] text-[hsl(var(--aurin-text-muted))] mb-2">
        How present were you today? <span className="opacity-70">(just choose what feels closest — optional)</span>
      </div>
      <div className="flex items-center gap-2 flex-wrap">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            type="button"
            key={n}
            onClick={() => setPresence(presence === n ? null : n)}
            data-testid={`tb-step-presence-${n}`}
            className={`w-9 h-9 rounded-full border text-[12.5px] transition-colors ${
              presence === n
                ? "bg-[hsl(var(--aurin-sage))] text-[hsl(var(--aurin-bg))] border-[hsl(var(--aurin-sage))]"
                : "border-[hsl(var(--aurin-border))] text-[hsl(var(--aurin-text))/0.85] hover:border-[hsl(var(--aurin-sage))]"
            }`}
          >
            {n}
          </button>
        ))}
      </div>
    </div>
  );
}

function PausePanel({ left }) {
  return (
    <div
      data-testid="tb-step-pause"
      className="aurin-card p-10 text-center space-y-5"
    >
      <div className="aurin-eyebrow">A small pause</div>
      <p className="aurin-display text-2xl aurin-serif-italic text-[hsl(var(--aurin-sage))]">
        No need to rush.
      </p>
      <p className="text-[14.5px] leading-relaxed text-[hsl(var(--aurin-text-muted))] max-w-[42ch] mx-auto">
        Let what you wrote settle.
        <br />
        The next part will appear on its own.
      </p>
      <div className="text-[12px] text-[hsl(var(--aurin-text-muted))]" aria-live="polite">
        Continuing in {left}…
      </div>
    </div>
  );
}

function DonePanel({ reflections = [], onReset }) {
  const [shared, setShared] = useState(false);
  const shareUrl =
    typeof window !== "undefined" ? window.location.origin + "/the-beginning" : "/the-beginning";
  const handleShareCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setShared(true);
      setTimeout(() => setShared(false), 2000);
    } catch {
      /* clipboard blocked — link is also visible */
    }
  };

  return (
    <div className="space-y-10" data-testid="tb-step-done">
      <p className="text-[16px] leading-[1.85] text-[hsl(var(--aurin-text))/0.94]">
        What you see cannot be unseen. What you do next is yours.
      </p>

      <p
        data-testid="tb-soft-consequence"
        className="aurin-serif-italic text-[15.5px] leading-[1.85] text-[hsl(var(--aurin-text))/0.9] max-w-[52ch]"
      >
        If this touched something in you,
        <br />
        you are not quite in the same place anymore.
        <br />
        And from here, sometimes,
        <br />
        the next step is taken quietly.
      </p>

      <div className="aurin-card p-6 flex items-start gap-4" data-testid="tb-soft-continuation">
        <Sparkles size={16} className="text-[hsl(var(--aurin-sage))] mt-0.5 shrink-0" />
        <div className="space-y-2">
          <div className="aurin-eyebrow !mb-0">Quiet continuation</div>
          <p className="text-[14px] leading-relaxed text-[hsl(var(--aurin-text-muted))]">
            There are more pieces coming. Not more information — just a different
            depth of the same direction. You'll see when it's there.
          </p>
        </div>
      </div>

      {/* Word-of-mouth — calm, single sentence, not a marketing CTA */}
      <div
        data-testid="tb-share-coordinates"
        className="aurin-card p-6 md:p-7 flex flex-col md:flex-row md:items-center gap-5 hover:border-[hsl(var(--aurin-sage))] transition-colors"
      >
        <div className="flex-1 space-y-1.5">
          <div className="aurin-eyebrow !mb-0">A small invitation</div>
          <p className="text-[14.5px] leading-relaxed text-[hsl(var(--aurin-text))/0.94]">
            If this shift was real for you, share the coordinates with one
            person you trust.
          </p>
          <p className="text-[12px] text-[hsl(var(--aurin-text-muted))] break-all">
            {shareUrl}
          </p>
        </div>
        <button
          type="button"
          onClick={handleShareCopy}
          data-testid="tb-share-coordinates-copy"
          className="aurin-btn aurin-btn-ghost shrink-0"
        >
          {shared ? "Coordinates copied" : "Copy the coordinates"}
        </button>
      </div>

      {reflections.length > 0 && (
        <div data-testid="tb-step-reflections" className="space-y-5">
          <div className="aurin-eyebrow">What you wrote</div>
          <div className="space-y-4">
            {reflections.map((r, i) => (
              <div
                key={`${r.n}-${i}`}
                data-testid={`tb-reflection-${r.n}`}
                className="aurin-card p-5"
              >
                <div className="text-[11px] uppercase tracking-[0.22em] text-[hsl(var(--aurin-text-muted))]">
                  Step {r.n}
                </div>
                <p className="mt-2 text-[14.5px] leading-relaxed text-[hsl(var(--aurin-text))/0.92] whitespace-pre-line">
                  {r.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="pt-2 flex flex-wrap items-center gap-3">
        <Link to="/library" data-testid="tb-step-to-library" className="aurin-btn aurin-btn-ghost">
          Back to the Library
        </Link>
        <button
          type="button"
          onClick={onReset}
          data-testid="tb-step-reset"
          className="aurin-btn aurin-btn-ghost"
        >
          <RotateCcw size={13} /> Begin again
        </button>
      </div>

      {/* Soft email capture — only shown at the end. No popup, no pressure. */}
      <div data-testid="tb-step-newsletter" className="pt-4">
        <NewsletterSignup
          source="beginning:end"
          eyebrow="If you'd like a soft note"
          title="Stay close, gently."
          testidPrefix="tb-newsletter"
        />
      </div>
    </div>
  );
}
