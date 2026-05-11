import { useEffect, useState } from "react";
import { Mail, Check, Sparkles } from "lucide-react";
import { sendFirstLetter, fetchCourses } from "@/lib/api";

/**
 * FirstLetterWidget — the "digital incense" lead magnet.
 *
 * A visitor drops their email, optionally picks which letter-series
 * resonates, and Resend delivers Letter 1 of that course to their
 * inbox within seconds. No account required.
 *
 * Behaviour rules (founder-approved):
 *   • Default is "let us choose" → we send from the flagship course
 *     "Letting the old stories rest" so no decision is required.
 *   • Rate-limited on the backend to 1 send per (email, course) / 24h.
 *   • After a successful submit we show a warm confirmation, NEVER
 *     a hard redirect — the visitor must choose to continue.
 *
 * Props
 *   • source          – analytics string stored with the send
 *   • compact         – tighter layout (true on landing page hero row)
 *   • defaultCourse   – pre-select a specific slug
 */
const FLAGSHIP_SLUG = "letting-the-old-stories-rest";

export default function FirstLetterWidget({
  compact = false,
  defaultCourse = FLAGSHIP_SLUG,
  testidPrefix = "first-letter",
}) {
  const [email, setEmail] = useState("");
  const [slug, setSlug] = useState(defaultCourse);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [done, setDone] = useState(false);
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    let alive = true;
    fetchCourses()
      .then((d) => {
        if (alive) setCourses(d.courses || []);
      })
      .catch(() => {
        if (alive) setCourses([]);
      });
    return () => {
      alive = false;
    };
  }, []);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    if (!email.includes("@") || !email.includes(".")) {
      setError("Please enter a valid email.");
      return;
    }
    setBusy(true);
    try {
      await sendFirstLetter(email.trim().toLowerCase(), slug);
      setDone(true);
    } catch (err) {
      setError(
        err?.response?.data?.detail ||
          "Something did not land. Please try again in a moment.",
      );
    } finally {
      setBusy(false);
    }
  };

  if (done) {
    return (
      <div
        className="aurin-card p-6 md:p-7 flex items-start gap-3"
        data-testid={`${testidPrefix}-thanks`}
      >
        <div className="mt-1 text-[hsl(var(--aurin-sage))]">
          <Check size={18} strokeWidth={1.4} />
        </div>
        <div>
          <p className="aurin-display text-[18px] leading-[1.3]">
            Your letter is on its way.
          </p>
          <p className="mt-2 text-[13.5px] text-[hsl(var(--aurin-text-muted))] aurin-serif-italic">
            If you do not see it, look in the "Promotions" or spam folder —
            then mark it as "Not spam" so future letters arrive quietly.
          </p>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      data-testid={`${testidPrefix}-form`}
      className={`aurin-card ${compact ? "p-5 md:p-6" : "p-6 md:p-8"} space-y-5`}
    >
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-full border border-[hsl(var(--aurin-sage))]/40 flex items-center justify-center text-[hsl(var(--aurin-sage))] shrink-0">
          <Sparkles size={16} strokeWidth={1.4} />
        </div>
        <div>
          <div className="aurin-eyebrow !mb-1">A quiet gift</div>
          <h3 className="aurin-display text-[20px] md:text-[22px] leading-tight">
            One free letter, delivered to your evening.
          </h3>
          <p className="mt-2 text-[13.5px] text-[hsl(var(--aurin-text-muted))] leading-[1.8]">
            Leave your address. We send the first letter from a quiet
            letter-series. One page. One small question. No urgency. No list
            you cannot leave.
          </p>
        </div>
      </div>

      {courses.length > 0 && (
        <div className="space-y-2" data-testid={`${testidPrefix}-course-pick`}>
          <label className="aurin-eyebrow block !text-[10.5px]">
            Which letter feels closest tonight?
          </label>
          <select
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            data-testid={`${testidPrefix}-course-select`}
            className="w-full bg-[hsl(var(--aurin-bg))] border border-[hsl(var(--aurin-border-soft))] rounded-xl px-4 py-3 text-[14px] focus:border-[hsl(var(--aurin-sage))] outline-none transition-colors"
          >
            {courses.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.title}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          data-testid={`${testidPrefix}-email`}
          className="flex-1 bg-[hsl(var(--aurin-bg))] border border-[hsl(var(--aurin-border-soft))] rounded-xl px-4 py-3 text-[14.5px] focus:border-[hsl(var(--aurin-sage))] outline-none transition-colors"
        />
        <button
          type="submit"
          disabled={busy}
          data-testid={`${testidPrefix}-submit`}
          className="aurin-btn aurin-btn-primary disabled:opacity-60 inline-flex items-center gap-2"
        >
          <Mail size={14} strokeWidth={1.4} />
          {busy ? "Sending…" : "Send me the letter"}
        </button>
      </div>

      {error && (
        <div
          data-testid={`${testidPrefix}-error`}
          className="text-[13px] text-red-300/90"
        >
          {error}
        </div>
      )}

      <p className="text-[11.5px] text-[hsl(var(--aurin-text-muted))] leading-[1.7]">
        By sending you agree we may write back. You can stop any time by
        replying "stop" — your address is held securely and never shared.
      </p>
    </form>
  );
}
