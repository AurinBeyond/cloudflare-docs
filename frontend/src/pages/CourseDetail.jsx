import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import PageHeader from "@/components/layout/PageHeader";
import { useAuth } from "@/contexts/AuthProvider";
import { fetchCourse, enrollCourse, fetchClarityPrefs } from "@/lib/api";
import { buildLemonCheckoutUrl } from "@/lib/lemonsqueezy";
import { LAUNCH_PAUSE } from "@/lib/launchPause";
import LaunchPauseButton from "@/components/LaunchPauseButton";
import useFreeAccess from "@/hooks/useFreeAccess";
import FreeAccessBadge from "@/components/FreeAccessBadge";
import {
  ArrowLeft,
  Lock,
  Mail,
  Play,
  Pause,
  RotateCcw,
  Headphones,
  ShoppingBag,
  Volume2,
  VolumeX,
} from "lucide-react";
// §AUDIT-P2 2026-05-20 — Use centralised token storage instead of
// inlining the localStorage key.
import { getSessionToken } from "@/lib/auth";
import { BACKEND_URL as __BACKEND_URL__ } from "@/lib/backendUrl";

const BACKEND_URL = __BACKEND_URL__;

/**
 * /course-room/:slug — single course detail.
 *
 * Each course shows:
 *   - hero (title + blurb + duration)
 *   - audio companion player (loops by default — founder rule)
 *   - 7 letter cards (letter 1 = always unlocked preview)
 *   - "Begin gently" enrollment button (beta users get instant access)
 *   - "Buy" button gracefully disabled until LemonSqueezy variant ID lands
 */
export default function CourseDetail() {
  const freeAccess = useFreeAccess();
  const { slug } = useParams();
  const { user } = useAuth();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [enrolling, setEnrolling] = useState(false);
  const [openLetter, setOpenLetter] = useState(null);
  const [guideGender, setGuideGender] = useState("female");

  // Pull the wanderer's preferred guide voice (Clarity = male, Grace =
  // female). Falls back gracefully to the female (Grace) voice if the
  // pref endpoint is unauthenticated or empty — matches the rest of the
  // ecosystem default.
  useEffect(() => {
    if (!user) return;
    let alive = true;
    fetchClarityPrefs()
      .then((prefs) => {
        if (alive && prefs?.guide_gender) setGuideGender(prefs.guide_gender);
      })
      .catch(() => {
        /* unauthenticated → keep default */
      });
    return () => {
      alive = false;
    };
  }, [user]);

  const refresh = async () => {
    try {
      const res = await fetchCourse(slug);
      setData(res);
      setError(null);
    } catch (e) {
      setError(e?.response?.data?.detail || "Could not load this course.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  const onEnroll = async () => {
    if (!user) return;
    setEnrolling(true);
    try {
      await enrollCourse(slug);
      await refresh();
    } catch {
      /* refresh anyway */
      await refresh();
    } finally {
      setEnrolling(false);
    }
  };

  if (loading) {
    return (
      <div className="aurin-section">
        <p
          className="aurin-container aurin-serif-italic text-[14px] text-[hsl(var(--aurin-text-muted))]"
          data-testid="course-detail-loading"
        >
          A small breath…
        </p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="aurin-section">
        <div
          className="aurin-container max-w-[640px]"
          data-testid="course-detail-error"
        >
          <p className="text-[14px] text-[hsl(var(--aurin-text-muted))]">
            {error || "Course not found."}
          </p>
          <Link to="/course-room" className="aurin-link mt-4 inline-flex items-center gap-1 text-[13px]">
            <ArrowLeft size={14} /> Back to the shelf
          </Link>
        </div>
      </div>
    );
  }

  const { course, enrolled, letters } = data;

  return (
    <div data-testid={`course-detail-${slug}`}>
      <PageHeader
        eyebrow={`Quiet Letters · ${course.duration_days} days`}
        title={course.title}
        description={course.blurb}
        testid="course-detail-header"
      >
        <p
          className="text-[12.5px] leading-[1.7] text-[hsl(var(--aurin-text-muted))/0.8] aurin-serif-italic mb-3"
          data-testid="course-detail-format"
        >
          {`${course.duration_days} letters · ${course.duration_days} quiet evenings of inward listening · A solo walk, with audio whispers as company.`}
        </p>
        <div className="flex flex-wrap items-center gap-3 text-[13px]">
          <Link
            to="/course-room"
            data-testid="course-detail-back"
            className="aurin-link inline-flex items-center gap-1"
          >
            <ArrowLeft size={14} /> All courses
          </Link>
          {!enrolled && user && (
            <button
              onClick={onEnroll}
              disabled={enrolling}
              data-testid="course-detail-enroll"
              className="aurin-btn aurin-btn-primary !py-2 !px-4 disabled:opacity-50"
            >
              {enrolling ? "Opening…" : "Begin gently"}
            </button>
          )}
          {!user && (
            <Link
              to={`/portal?next=/course-room/${slug}`}
              data-testid="course-detail-signin"
              className="aurin-btn aurin-btn-ghost !py-2 !px-4"
            >
              Sign in to begin
            </Link>
          )}
          {enrolled && (
            <span
              data-testid="course-detail-enrolled"
              className="text-[hsl(var(--aurin-sage))] inline-flex items-center gap-1"
            >
              <Mail size={14} strokeWidth={1.4} /> A letter arrives each evening.
            </span>
          )}
          {(() => {
            if (freeAccess.active) {
              // Free-access window — hide the LemonSqueezy CTA entirely
              // and surface a calm "free during launch" line instead.
              return <FreeAccessBadge variant="compact" testidSuffix={`course-${slug}`} />;
            }
            const checkoutUrl = buildLemonCheckoutUrl(course.lemonsqueezy_variant_id);
            if (!checkoutUrl || !course.price) return null;
            if (LAUNCH_PAUSE) {
              return (
                <LaunchPauseButton
                  testid="course-detail-buy"
                  label="Notify me when this opens"
                  hideSubtext
                  size="sm"
                />
              );
            }
            return (
              <a
                href={checkoutUrl}
                target="_blank"
                rel="noopener noreferrer"
                data-testid="course-detail-buy"
                className="aurin-btn aurin-btn-ghost !py-2 !px-4 inline-flex items-center gap-1.5"
              >
                <ShoppingBag size={13} strokeWidth={1.4} />
                Continue · ${course.price.toFixed(0)}
              </a>
            );
          })()}
        </div>
      </PageHeader>

      {course.audio_companion && (
        <section
          className="aurin-section-sm"
          data-testid="course-audio-section"
        >
          <div className="aurin-container max-w-[760px]">
            <AudioCompanion
              src={course.audio_companion}
              title={course.audio_title}
            />
          </div>
        </section>
      )}

      <section className="aurin-section-sm" data-testid="course-letters-section">
        <div className="aurin-container max-w-[760px] space-y-4">
          {letters.map((l) => (
            <LetterCard
              key={l.day}
              letter={l}
              open={openLetter === l.day}
              onToggle={() =>
                setOpenLetter((d) => (d === l.day ? null : l.day))
              }
              guideGender={guideGender}
              courseSlug={slug}
            />
          ))}
        </div>
      </section>

      <section className="aurin-section-sm" data-testid="course-footer-bridge">
        <div className="aurin-container max-w-[680px]">
          <div className="aurin-card p-6 text-center">
            <p className="aurin-serif-italic text-[14.5px]">
              "If something here keeps moving in you, you can come back. Nothing here will run out."
            </p>
            <p className="mt-3 text-[13px] text-[hsl(var(--aurin-text-muted))]">
              <Link className="aurin-link" to="/clarity-release">
                Step into Clarity Release →
              </Link>
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

function AudioCompanion({ src, title }) {
  const audioRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    const onTime = () => setTime(a.currentTime || 0);
    const onMeta = () => setDuration(a.duration || 0);
    const onEnd = () => setPlaying(false);
    a.addEventListener("timeupdate", onTime);
    a.addEventListener("loadedmetadata", onMeta);
    a.addEventListener("ended", onEnd);
    return () => {
      a.removeEventListener("timeupdate", onTime);
      a.removeEventListener("loadedmetadata", onMeta);
      a.removeEventListener("ended", onEnd);
    };
  }, []);

  const toggle = () => {
    const a = audioRef.current;
    if (!a) return;
    if (playing) {
      a.pause();
      setPlaying(false);
    } else {
      a.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
    }
  };

  const restart = () => {
    const a = audioRef.current;
    if (!a) return;
    a.currentTime = 0;
    setTime(0);
    if (!playing) a.play().then(() => setPlaying(true)).catch(() => {});
  };

  const pct = duration ? Math.min(100, (time / duration) * 100) : 0;
  const fmt = (s) => {
    const m = Math.floor((s || 0) / 60);
    const sec = Math.floor((s || 0) % 60);
    return `${m}:${String(sec).padStart(2, "0")}`;
  };

  return (
    <div
      data-testid="course-audio-player"
      className="aurin-card p-5 md:p-6"
    >
      <div className="flex items-center gap-3">
        <Headphones
          size={16}
          strokeWidth={1.4}
          className="text-[hsl(var(--aurin-sage))]"
        />
        <div>
          <div className="aurin-eyebrow text-[11px]">Audio companion</div>
          <div className="aurin-display text-[18px] leading-[1.2]">{title}</div>
        </div>
      </div>
      <p className="mt-3 text-[12.5px] text-[hsl(var(--aurin-text-muted))] aurin-serif-italic">
        Plays on quiet loop. Many readers let it cycle five to seven times while they read or write — the repetition becomes part of the practice.
      </p>
      <div className="mt-4 flex items-center gap-3">
        <button
          type="button"
          onClick={toggle}
          data-testid="course-audio-play"
          aria-label={playing ? "Pause" : "Play"}
          className="aurin-btn aurin-btn-primary !p-3"
        >
          {playing ? <Pause size={16} /> : <Play size={16} />}
        </button>
        <button
          type="button"
          onClick={restart}
          data-testid="course-audio-restart"
          aria-label="Restart"
          className="aurin-btn aurin-btn-ghost !p-3"
        >
          <RotateCcw size={16} />
        </button>
        <div className="flex-1">
          <div className="h-1 rounded-full bg-[hsl(var(--aurin-border-soft))] overflow-hidden">
            <div
              className="h-full bg-[hsl(var(--aurin-sage))] transition-all"
              style={{ width: `${pct}%` }}
            />
          </div>
          <div className="mt-1 flex justify-between text-[11px] text-[hsl(var(--aurin-text-muted))]">
            <span>{fmt(time)}</span>
            <span>{fmt(duration)}</span>
          </div>
        </div>
      </div>
      <audio ref={audioRef} src={src} loop preload="metadata" />
    </div>
  );
}

function LetterTtsButton({ letterId, text, gender }) {
  const [state, setState] = useState("idle"); // idle | loading | playing | paused | error
  const audioRef = useRef(null);
  const urlRef = useRef(null);

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        try {
          audioRef.current.pause();
        } catch {
          /* noop */
        }
        audioRef.current = null;
      }
      if (urlRef.current) {
        try {
          URL.revokeObjectURL(urlRef.current);
        } catch {
          /* noop */
        }
        urlRef.current = null;
      }
    };
  }, [letterId]);

  const handleClick = async () => {
    // Toggle pause/resume if already loaded.
    if (audioRef.current && (state === "playing" || state === "paused")) {
      if (state === "playing") {
        audioRef.current.pause();
        setState("paused");
      } else {
        audioRef.current.play().catch(() => setState("error"));
        setState("playing");
      }
      return;
    }
    // Fetch fresh audio.
    const token = getSessionToken();
    if (!token || !BACKEND_URL) {
      setState("error");
      return;
    }
    setState("loading");
    try {
      const res = await fetch(`${BACKEND_URL}/api/clarity/tts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ text, gender: gender || "female" }),
      });
      if (!res.ok) {
        setState("error");
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      urlRef.current = url;
      const audio = new Audio(url);
      audio.preload = "auto";
      audio.onended = () => setState("idle");
      audio.onerror = () => setState("error");
      audioRef.current = audio;
      await audio.play().catch(() => setState("error"));
      setState("playing");
    } catch {
      setState("error");
    }
  };

  const label =
    state === "loading"
      ? "Loading…"
      : state === "playing"
      ? "Pause"
      : state === "paused"
      ? "Resume"
      : state === "error"
      ? "Voice unavailable"
      : "Listen to this letter";

  const Icon =
    state === "playing" ? VolumeX : state === "loading" ? Headphones : Volume2;

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={state === "loading"}
      data-testid={`course-letter-tts-${letterId}`}
      className="inline-flex items-center gap-1.5 text-[12px] text-[hsl(var(--aurin-text-muted))] hover:text-[hsl(var(--aurin-sage))] disabled:opacity-50 transition-colors"
      title={label}
      aria-label={label}
    >
      <Icon size={14} strokeWidth={1.4} />
      <span>{label}</span>
    </button>
  );
}

function LetterCard({ letter, open, onToggle, guideGender, courseSlug }) {
  const locked = !letter.unlocked;
  return (
    <article
      data-testid={`course-letter-${letter.day}`}
      className={`aurin-card p-5 md:p-6 transition-opacity ${
        locked ? "opacity-70" : ""
      }`}
    >
      <div className="flex items-start gap-3">
        <div className="mt-1">
          {locked ? (
            <Lock
              size={14}
              strokeWidth={1.4}
              className="text-[hsl(var(--aurin-text-muted))]"
            />
          ) : (
            <Mail
              size={14}
              strokeWidth={1.4}
              className="text-[hsl(var(--aurin-sage))]"
            />
          )}
        </div>
        <div className="flex-1">
          <div className="aurin-eyebrow text-[11px]">
            Letter {letter.day}{" "}
            {letter.is_preview && (
              <span className="ml-2 text-[hsl(var(--aurin-sage))]">· Free preview</span>
            )}
          </div>
          <h3 className="aurin-display mt-1 text-[19px] leading-[1.3]">
            {letter.title}
          </h3>
          {locked ? (
            <p
              className="mt-3 text-[13px] text-[hsl(var(--aurin-text-muted))] aurin-serif-italic"
              data-testid={`course-letter-locked-${letter.day}`}
            >
              {letter.unlock_at
                ? `Opens on day ${letter.day} of your walk.`
                : "Begin the course to receive this letter."}
            </p>
          ) : (
            <>
              <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2">
                <button
                  type="button"
                  onClick={onToggle}
                  data-testid={`course-letter-toggle-${letter.day}`}
                  className="aurin-link text-[12.5px]"
                >
                  {open ? "Close letter" : "Read letter"}
                </button>
                <LetterTtsButton
                  letterId={`${courseSlug || "course"}-${letter.day}`}
                  text={letter.body}
                  gender={guideGender}
                />
              </div>
              {open && (
                <div className="mt-4 space-y-4">
                  <div className="space-y-3">
                    {(letter.body || "")
                      .split(/\n\s*\n/)
                      .map((para, idx) => {
                        // Render lightweight markdown bold (**text**) so
                        // the headings inside the body — "Day practice",
                        // "Quiet line" — visually stand out without us
                        // pulling in a full markdown renderer.
                        const segments = para.split(/(\*\*[^*]+\*\*)/g);
                        return (
                          <p
                            key={idx}
                            className="text-[14.5px] leading-[1.85] whitespace-pre-line"
                          >
                            {segments.map((seg, i) =>
                              seg.startsWith("**") && seg.endsWith("**") ? (
                                <strong
                                  key={i}
                                  className="font-medium text-[hsl(var(--aurin-sage))]"
                                >
                                  {seg.slice(2, -2)}
                                </strong>
                              ) : (
                                <span key={i}>{seg}</span>
                              )
                            )}
                          </p>
                        );
                      })}
                  </div>
                  <div className="border-l-2 border-[hsl(var(--aurin-sage))]/50 pl-4">
                    <p className="text-[11px] uppercase tracking-[0.18em] text-[hsl(var(--aurin-text-muted))]">
                      A small question for the evening
                    </p>
                    <p className="mt-1 aurin-serif-italic text-[14.5px]">
                      {letter.prompt}
                    </p>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </article>
  );
}
