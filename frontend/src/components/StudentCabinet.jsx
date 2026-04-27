import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Compass, BookOpen, Heart, Sparkles, ArrowRight } from "lucide-react";
import { fetchBeginningStatus, fetchCabinet, fetchBooks } from "@/lib/api";

/**
 * StudentCabinet — the signed-in dashboard.
 *
 * Quiet, calm, and built around three real surfaces the visitor
 * can already touch on this site:
 *   - The Beginning (7-day journey, progress visible)
 *   - The Quiet Room (last visit, optional thread key)
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
    })();
    return () => {
      alive = false;
    };
  }, []);

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
      to: "/private-room",
      label: "The Quiet Room",
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

        {/* Quiet Room */}
        <Link
          to="/private-room"
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
          <h3 className="aurin-display text-xl mt-6">The Quiet Room</h3>
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
    </div>
  );
}
