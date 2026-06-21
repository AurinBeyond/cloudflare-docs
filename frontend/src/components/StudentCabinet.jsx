import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Compass, BookOpen, Heart, Sparkles, ArrowRight, Eye } from "lucide-react";
import {
  fetchBeginningStatus,
  fetchCabinet,
  fetchBooks,
  fetchCabinetLibrary,
  fetchBeginningStep,
} from "@/lib/api";

/**
 * StudentCabinet — the signed-in dashboard.
 *
 * Quiet, calm, and built around three real surfaces the visitor
 * can already touch on this site:
 *   - The Beginning (7-day journey, progress visible)
 *   - The Quiet Room (last visit, optional thread key) — now Clarity Release
 *   - The Library (calm shelf they can open)
 *
 * Plus a placeholder slot for the deeper readings that open later.
 *
 * No "% completed". No "achievements". The tone is "you are already
 * here" — never "keep going".
 */
export default function StudentCabinet({ user }) {
  const [beginning, setBeginning] = useState(null);
  const [cabinet, setCabinet] = useState(null);
  const [bookCount, setBookCount] = useState(null);
  const [purchased, setPurchased] = useState([]);
  const [openStep, setOpenStep] = useState(null); // { n, step, reflection }
  const [openLoading, setOpenLoading] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      // Run independently so a single failure doesn't blank the dashboard.
      fetchBeginningStatus()
        .then((s) => alive && setBeginning(s))
        .catch(() => {});
      fetchCabinet()
        .then((c) => alive && setCabinet(c))
        .catch(() => {});
      fetchBooks()
        .then((b) => alive && setBookCount(Array.isArray(b) ? b.length : 0))
        .catch(() => {});
      fetchCabinetLibrary()
        .then((p) => alive && setPurchased(Array.isArray(p) ? p : []))
        .catch(() => {});
    })();
    return () => {
      alive = false;
    };
  }, []);

  const openPastStep = async (n) => {
    setOpenLoading(true);
    try {
      const data = await fetchBeginningStep(n);
      setOpenStep(data);
    } catch {
      setOpenStep(null);
    } finally {
      setOpenLoading(false);
    }
  };
  const closePastStep = () => setOpenStep(null);

  // ---- Resolve the "Continue" state — most personal step first.
  let resume = null;
  if (beginning?.started && !beginning?.is_done) {
    resume = {
      to: "/the-beginning/step",
      label: "The Beginning",
      title: "Continue where you left off",
      hint: `Step ${beginning.current_step} of ${beginning.total_steps}`,
      testid: "cabinet-resume-beginning",
    };
  } else if (cabinet?.session && !cabinet.session.closed) {
    resume = {
      to: "/clarity-release",
      label: "Grace",
      title: "Your room is still open",
      hint: "Step back in when you feel ready",
      testid: "cabinet-resume-room",
    };
  } else if (beginning?.is_done) {
    resume = {
      to: "/the-beginning",
      label: "The Beginning",
      title: "You walked through the seven steps",
      hint: "Read what you wrote",
      testid: "cabinet-resume-beginning-done",
    };
  } else {
    resume = {
      to: "/the-beginning",
      label: "A small start",
      title: "When you're ready, the room is here",
      hint: "Begin gently",
      testid: "cabinet-resume-default",
    };
  }

  const beginningDone = beginning?.completed_steps?.length || 0;
  const beginningTotal = beginning?.total_steps || 7;

  return (
    <div className="space-y-12" data-testid="student-cabinet">
      {/* RESUME — the only "do this next" cue */}
      <div className="space-y-4">
        <Link
          to={resume.to}
          data-testid={resume.testid}
          className="block aurin-card p-7 md:p-9 group hover:border-[hsl(var(--aurin-sage))] transition-colors"
        >
          <div className="flex flex-col md:flex-row md:items-center gap-5">
            <div className="w-12 h-12 rounded-full border border-[hsl(var(--aurin-sage))/0.5] flex items-center justify-center text-[hsl(var(--aurin-sage))] shrink-0">
              <Compass size={18} strokeWidth={1.4} />
            </div>
            <div className="flex-1">
              <div className="aurin-eyebrow !mb-1">{resume.label}</div>
              <h3 className="aurin-display text-2xl md:text-3xl leading-tight">
                {resume.title}
              </h3>
              <p className="mt-2 text-[13.5px] text-[hsl(var(--aurin-text-muted))]">
                {resume.hint}
              </p>
            </div>
            <ArrowRight
              size={16}
              className="text-[hsl(var(--aurin-sage))] opacity-60 group-hover:opacity-100 transition-opacity shrink-0"
            />
          </div>
        </Link>
        <p
          data-testid="cabinet-resume-consequence"
          className="text-[12.5px] leading-relaxed text-[hsl(var(--aurin-text-muted))]/85 aurin-serif-italic max-w-[52ch] pl-1"
        >
          If something stayed with you, you can step in from here.
        </p>
      </div>

      {/* THREE SURFACES — gentle, factual, no progress bars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* The Beginning */}
        <Link
          to="/the-beginning"
          data-testid="cabinet-card-beginning"
          className="aurin-card p-7 group hover:border-[hsl(var(--aurin-sage))] transition-colors flex flex-col"
        >
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-full border border-[hsl(var(--aurin-border))] flex items-center justify-center text-[hsl(var(--aurin-sage))]">
              <Sparkles size={14} strokeWidth={1.4} />
            </div>
            <span
              data-testid="cabinet-beginning-state"
              className="text-[10.5px] uppercase tracking-[0.22em] text-[hsl(var(--aurin-text-muted))]"
            >
              {beginning?.is_done
                ? "Walked through"
                : beginning?.started
                ? "In motion"
                : "Open"}
            </span>
          </div>
          <h3 className="aurin-display text-xl mt-6">The Beginning</h3>
          <p className="mt-2 text-[13.5px] leading-relaxed text-[hsl(var(--aurin-text-muted))] flex-1">
            Seven small steps. Free for now. What you write stays yours alone.
          </p>
          {beginning?.started && (
            <p
              data-testid="cabinet-beginning-progress"
              className="mt-4 text-[12px] text-[hsl(var(--aurin-sage))/0.9]"
            >
              {beginningDone} of {beginningTotal} done
            </p>
          )}
        </Link>

        {/* Clarity Release */}
        <Link
          to="/clarity-release"
          data-testid="cabinet-card-room"
          className="aurin-card p-7 group hover:border-[hsl(var(--aurin-sage))] transition-colors flex flex-col"
        >
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-full border border-[hsl(var(--aurin-border))] flex items-center justify-center text-[hsl(var(--aurin-sage))]">
              <Heart size={14} strokeWidth={1.4} />
            </div>
            <span
              data-testid="cabinet-room-state"
              className="text-[10.5px] uppercase tracking-[0.22em] text-[hsl(var(--aurin-text-muted))]"
            >
              {cabinet?.session && !cabinet.session.closed ? "Open" : "Quiet"}
            </span>
          </div>
          <h3 className="aurin-display text-xl mt-6">Grace</h3>
          <p className="mt-2 text-[13.5px] leading-relaxed text-[hsl(var(--aurin-text-muted))] flex-1">
            A private space that listens. Step in when you feel like writing
            the way it actually is.
          </p>
          {cabinet?.session?.thread_key && (
            <p
              data-testid="cabinet-room-thread"
              className="mt-4 text-[11.5px] text-[hsl(var(--aurin-text-muted))] font-mono break-all"
            >
              key · {cabinet.session.thread_key}
            </p>
          )}
        </Link>

        {/* Library */}
        <Link
          to="/library"
          data-testid="cabinet-card-library"
          className="aurin-card p-7 group hover:border-[hsl(var(--aurin-sage))] transition-colors flex flex-col"
        >
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-full border border-[hsl(var(--aurin-border))] flex items-center justify-center text-[hsl(var(--aurin-sage))]">
              <BookOpen size={14} strokeWidth={1.4} />
            </div>
            <span
              data-testid="cabinet-library-state"
              className="text-[10.5px] uppercase tracking-[0.22em] text-[hsl(var(--aurin-text-muted))]"
            >
              {bookCount == null ? "—" : `${bookCount} on the shelf`}
            </span>
          </div>
          <h3 className="aurin-display text-xl mt-6">The Library</h3>
          <p className="mt-2 text-[13.5px] leading-relaxed text-[hsl(var(--aurin-text-muted))] flex-1">
            A small shelf for adults and children. Take what speaks. Leave the
            rest.
          </p>
        </Link>
      </div>

      {/* DEEPER READINGS — empty state today, real later */}
      <div
        data-testid="cabinet-deeper-shelf"
        className="aurin-card p-7 md:p-9"
      >
        <div className="flex items-start gap-4">
          <div className="w-11 h-11 rounded-full border border-[hsl(var(--aurin-border))] flex items-center justify-center text-[hsl(var(--aurin-sand))] shrink-0">
            <BookOpen size={16} strokeWidth={1.4} />
          </div>
          <div className="flex-1">
            <div className="aurin-eyebrow !mb-1">Deeper readings</div>
            <h3 className="aurin-display text-2xl leading-tight">
              The longer ones{" "}
              <span className="aurin-serif-italic text-[hsl(var(--aurin-sand))]">
                are being written.
              </span>
            </h3>
            <p className="mt-3 text-[14px] leading-relaxed text-[hsl(var(--aurin-text-muted))] max-w-[58ch]">
              When the deeper books and quiet courses open, they'll appear
              here — yours, from then on. Nothing is missing today. Just take
              what is already on the shelf.
            </p>
          </div>
        </div>
      </div>

      {/* YOUR MATERIALS — past Beginning reflections + purchased books */}
      <div
        data-testid="cabinet-your-materials"
        className="aurin-card p-7 md:p-9 border-[hsl(var(--aurin-sage))/0.35]"
      >
        <div className="aurin-eyebrow !mb-2">Your Materials</div>
        <h3 className="aurin-display text-2xl md:text-3xl leading-tight mb-6">
          What is{" "}
          <span className="aurin-serif-italic text-[hsl(var(--aurin-sage))]">
            yours alone.
          </span>
        </h3>

        {/* Past reflections */}
        {beginning?.completed_steps?.length > 0 && (
          <div data-testid="cabinet-past-reflections" className="mb-7">
            <div className="text-[12px] uppercase tracking-[0.22em] text-[hsl(var(--aurin-text-muted))] mb-3">
              Steps you have walked
            </div>
            <p className="text-[13.5px] aurin-serif-italic text-[hsl(var(--aurin-text))/0.85] mb-4">
              You have already been here. Read what you wrote.
            </p>
            <div className="flex flex-wrap gap-2">
              {beginning.completed_steps.map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => openPastStep(n)}
                  data-testid={`cabinet-past-step-${n}`}
                  className="aurin-chip hover:border-[hsl(var(--aurin-sage))] transition-colors text-[12.5px] flex items-center gap-1.5"
                >
                  <Eye size={11} strokeWidth={1.6} />
                  Step {n}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Purchased / unlocked content */}
        <div data-testid="cabinet-purchased">
          <div className="text-[12px] uppercase tracking-[0.22em] text-[hsl(var(--aurin-text-muted))] mb-3">
            Books and readings you have unlocked
          </div>
          {purchased.length === 0 ? (
            <p
              data-testid="cabinet-purchased-empty"
              className="text-[13.5px] aurin-serif-italic text-[hsl(var(--aurin-text-muted))] max-w-[55ch]"
            >
              Nothing here yet. The longer books open soon — when they do,
              they'll wait for you here, in your hand.
            </p>
          ) : (
            <ul className="space-y-3">
              {purchased.map((p) => (
                <li
                  key={p.book_slug}
                  data-testid={`cabinet-purchased-${p.book_slug}`}
                  className="flex items-center justify-between gap-3 py-2 border-b border-[hsl(var(--aurin-border-soft))] last:border-b-0"
                >
                  <div className="min-w-0">
                    <div className="text-[14px] font-medium truncate">
                      {p.title || p.book_slug}
                    </div>
                    {p.granted_at && (
                      <div className="text-[11px] text-[hsl(var(--aurin-text-muted))]">
                        opened · {p.granted_at.slice(0, 10)}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {p.external_read_url && (
                      <a
                        href={p.external_read_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        data-testid={`cabinet-purchased-${p.book_slug}-open`}
                        className="text-[12.5px] underline decoration-dotted text-[hsl(var(--aurin-sage))]"
                      >
                        Open
                      </a>
                    )}
                    {p.pdf_url && (
                      <a
                        href={p.pdf_url}
                        download
                        data-testid={`cabinet-purchased-${p.book_slug}-download`}
                        className="text-[12.5px] underline decoration-dotted text-[hsl(var(--aurin-text))/0.85]"
                      >
                        Take it
                      </a>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* PAST-STEP READER (modal-lite, in-flow panel) */}
      {(openStep || openLoading) && (
        <div
          data-testid="cabinet-past-reader"
          className="aurin-card p-7 md:p-9 border-[hsl(var(--aurin-sage))/0.45]"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="aurin-eyebrow !mb-1">Already here</div>
              <h4 className="aurin-display text-xl">
                {openLoading
                  ? "Opening…"
                  : `Step ${openStep?.n} · ${openStep?.step?.eyebrow || ""}`}
              </h4>
            </div>
            <button
              type="button"
              onClick={closePastStep}
              data-testid="cabinet-past-reader-close"
              className="text-[12px] text-[hsl(var(--aurin-text-muted))] underline decoration-dotted"
            >
              Close
            </button>
          </div>
          {!openLoading && openStep?.step && (
            <div className="mt-5 space-y-4">
              <p className="aurin-serif-italic text-[15.5px] leading-[1.85] text-[hsl(var(--aurin-text))/0.94] max-w-[58ch]">
                {openStep.step.title}
              </p>
              {openStep.step.body && (
                <p className="text-[14px] leading-relaxed text-[hsl(var(--aurin-text-muted))] max-w-[58ch] whitespace-pre-line">
                  {openStep.step.body}
                </p>
              )}
              {openStep.step.prompt && (
                <p className="text-[13.5px] uppercase tracking-[0.22em] text-[hsl(var(--aurin-text-muted))]">
                  {openStep.step.prompt}
                </p>
              )}
              {openStep.reflection?.text ? (
                <div
                  data-testid="cabinet-past-reflection-text"
                  className="aurin-card p-5 mt-3 bg-[hsl(var(--aurin-sand))/0.05]"
                >
                  <div className="text-[11px] uppercase tracking-[0.22em] text-[hsl(var(--aurin-text-muted))] mb-2">
                    What you wrote
                  </div>
                  <p className="text-[14.5px] leading-[1.8] text-[hsl(var(--aurin-text))/0.95] whitespace-pre-wrap">
                    {openStep.reflection.text}
                  </p>
                </div>
              ) : (
                <p className="text-[13px] text-[hsl(var(--aurin-text-muted))] aurin-serif-italic">
                  No reflection saved for this step.
                </p>
              )}
              <p className="text-[12px] text-[hsl(var(--aurin-text-muted))] aurin-serif-italic mt-2">
                What is written stays. It cannot be overwritten.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
