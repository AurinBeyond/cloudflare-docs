/**
 * KidsDaily.jsx — /kids-universe/:ageGroup/daily
 *
 * §KIDS-CURRICULUM 2026-02-09 — The daily heartbeat of Aurin's
 * Room. One question, five moods, Aurin's reply, three quiet
 * recommendations. Auto-awards 1 ★ once per day per child slug.
 *
 * Caveat handwriting font is used for Aurin's reply and the prompt
 * to keep the page feeling like a journal entry, not a form.
 */

import { Link, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, Sparkles, CheckCircle2 } from "lucide-react";
import AurinSparkle from "@/components/AurinSparkle";
import KidsJourneyPath from "@/components/KidsJourneyPath";
import { resolveHubTheme } from "@/lib/kidsHubThemes";
import { api } from "@/lib/api";

const MOODS = [
  { slug: "sad",     emoji: "😔", label: "Sad",     copy: "today felt heavy" },
  { slug: "worried", emoji: "😟", label: "Worried", copy: "something is on my mind" },
  { slug: "okay",    emoji: "🙂", label: "Okay",    copy: "soft, in-between" },
  { slug: "good",    emoji: "😊", label: "Good",    copy: "today was kind" },
  { slug: "sparkly", emoji: "✨", label: "Sparkly", copy: "everything glows" },
];

export default function KidsDaily() {
  const { ageGroup } = useParams();
  const theme = resolveHubTheme(ageGroup);
  const { palette } = theme;
  const [step, setStep] = useState("ask"); // ask | reflecting | done
  const [mood, setMood] = useState(null);
  const [note, setNote] = useState("");
  const [aurinReply, setAurinReply] = useState("");
  const [starAwarded, setStarAwarded] = useState(false);
  const [recs, setRecs] = useState([]);
  const [authError, setAuthError] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    if (!mood || submitting) return;
    setSubmitting(true);
    try {
      const r = await api.post("/kids-mood/checkin", {
        child_slug: theme.slug,
        mood,
        note: note.trim() || null,
      });
      setAurinReply(r.data.aurin_reply);
      setStarAwarded(r.data.star_awarded);
      setRecs(r.data.recommendations || []);
      setStep("done");
    } catch (e) {
      if (e?.response?.status === 401) setAuthError(true);
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    if (mood && step === "ask") setStep("reflecting");
  }, [mood, step]);

  if (authError) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6"
           style={{ background: palette.bgGradient, color: palette.text }}>
        <div className="text-center max-w-md">
          <h2 className="font-serif text-2xl mb-3">A small sign-in first.</h2>
          <p className="text-[15px] mb-6" style={{ color: palette.textMuted }}>
            Ask a grown-up to open the door, and your daily check-in waits for you.
          </p>
          <Link to="/portal" data-testid="kids-daily-signin"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl text-[14px]"
            style={{ background: palette.accent, color: "#fff" }}>Sign in</Link>
        </div>
      </div>
    );
  }

  return (
    <div data-testid={`kids-daily-${theme.slug}`} className="min-h-screen"
         style={{ background: palette.bgGradient, color: palette.text }}>
      <div className="mx-auto max-w-3xl px-5 sm:px-8 py-10 sm:py-14">
        <Link to={`/kids-universe/${theme.slug}/hub`} data-testid="kids-daily-back"
              className="inline-flex items-center gap-1.5 text-[13px] tracking-wide mb-7"
              style={{ color: palette.textMuted }}>
          <ArrowLeft size={13} /> Back to {theme.title}
        </Link>

        {/* §KIDS-JOURNEY 2026-02-10 — Stepping-stone path at top of Daily.
            Lets the child see where today sits on the 28-day journey
            before they answer the mood check-in. */}
        <div className="mb-8" data-testid="kids-daily-journey-strip">
          <KidsJourneyPath
            ageSlug={theme.slug}
            childSlug={theme.slug}
            compact
            testIdSuffix="-daily"
          />
        </div>

        {step !== "done" && (
          <>
            <header className="flex flex-col items-center text-center mb-10">
              <AurinSparkle variant="ambient" size={92} data-testid="kids-daily-sparkle" />
              <p className="text-[11px] uppercase tracking-[0.28em] mt-3 mb-3"
                 style={{ color: palette.textMuted }}>A quiet daily check-in</p>
              <h1 className="text-[40px] sm:text-[52px] leading-[1.05] max-w-[20ch]"
                  style={{ fontFamily: "Caveat, Fraunces, serif", fontWeight: 600, color: palette.accent }}>
                How are you, really?
              </h1>
              <p className="mt-4 text-[16px] leading-relaxed max-w-[42ch]"
                 style={{ fontFamily: "'Caveat', cursive", color: palette.handwritten, fontSize: 20 }}>
                pick the one that feels closest
              </p>
            </header>

            <div className="grid grid-cols-5 gap-2 sm:gap-3 mb-8" data-testid="kids-daily-moods">
              {MOODS.map((m) => {
                const selected = mood === m.slug;
                return (
                  <button key={m.slug} type="button" onClick={() => setMood(m.slug)}
                    data-testid={`kids-daily-mood-${m.slug}`}
                    className="kids-mood-card group relative rounded-2xl p-3 sm:p-4 text-center transition overflow-hidden"
                    style={{
                      background: selected
                        ? `linear-gradient(160deg, ${palette.accent} 0%, ${palette.accent}dd 100%)`
                        : `linear-gradient(160deg, #ffffff 0%, ${palette.accent}12 60%, ${palette.accent}22 100%)`,
                      border: `1.5px solid ${selected ? palette.accent : palette.cardBorder}`,
                      color: selected ? "#fff" : palette.text,
                      transform: selected ? "translateY(-2px)" : "none",
                      boxShadow: selected
                        ? `0 12px 26px -12px ${palette.accent}, inset 0 1px 0 rgba(255,255,255,0.45)`
                        : `0 6px 16px -10px ${palette.accent}66, inset 0 1px 0 rgba(255,255,255,0.85)`,
                    }}>
                    <span aria-hidden="true"
                          className="pointer-events-none absolute top-0 left-0 right-0 rounded-t-2xl"
                          style={{
                            height: "38%",
                            background: selected
                              ? "linear-gradient(180deg, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0) 100%)"
                              : "linear-gradient(180deg, rgba(255,255,255,0.55) 0%, rgba(255,255,255,0) 100%)",
                          }} />
                    <div className="relative text-[28px] sm:text-[32px] leading-none mb-1.5">{m.emoji}</div>
                    <div className="relative text-[11px] uppercase tracking-[0.18em]">{m.label}</div>
                  </button>
                );
              })}
            </div>

            {mood && (
              <div data-testid="kids-daily-note-block" className="mb-7">
                <p className="text-[15px] mb-2.5 italic"
                   style={{ color: palette.textMuted }}>
                  {MOODS.find((m) => m.slug === mood)?.copy}. Want to whisper why? (optional)
                </p>
                <textarea rows={3} value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="a few words, only if you want…"
                  data-testid="kids-daily-note"
                  className="w-full rounded-xl px-4 py-3 text-[15px] outline-none resize-none"
                  style={{
                    background: palette.cardBg,
                    border: `1px solid ${palette.cardBorder}`,
                    color: palette.text,
                    fontFamily: "'Caveat', cursive",
                    fontSize: 19,
                    lineHeight: 1.4,
                  }} />
              </div>
            )}

            <button type="button" onClick={submit} disabled={!mood || submitting}
              data-testid="kids-daily-submit"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-[15px] font-medium transition disabled:opacity-50"
              style={{
                background: palette.accent, color: "#fff",
                boxShadow: `0 10px 22px -12px ${palette.accent}`,
              }}>
              {submitting ? "Aurin is listening…" : "Send to Aurin"}
              <Sparkles size={14} />
            </button>
          </>
        )}

        {step === "done" && (
          <div data-testid="kids-daily-result">
            <div className="flex justify-center mb-4">
              <AurinSparkle variant={starAwarded ? "celebrate" : "ambient"} size={160} />
            </div>
            <p className="text-[11px] uppercase tracking-[0.28em] text-center mb-3"
               style={{ color: palette.textMuted }}>Aurin says</p>
            <p className="text-center mx-auto max-w-[34ch] mb-2"
               style={{
                 fontFamily: "'Caveat', cursive",
                 fontSize: 28, lineHeight: 1.3,
                 color: palette.handwritten,
               }}
               data-testid="kids-daily-aurin-reply">
              {aurinReply}
            </p>
            {starAwarded && (
              <p className="text-center text-[13.5px] mb-7 flex items-center justify-center gap-1.5"
                 style={{ color: palette.accent }}
                 data-testid="kids-daily-star-awarded">
                <CheckCircle2 size={14} /> A daily star landed in your jar.
              </p>
            )}

            <h2 className="font-serif text-[22px] mt-10 mb-2 text-center">
              Three quiet things for today
            </h2>
            <p className="text-[13px] text-center mb-7"
               style={{ color: palette.textMuted }}>
              Pick one that feels right. Or none — that's a real answer too.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5"
                 data-testid="kids-daily-recommendations">
              {recs.map((r) => (
                <Link key={r.slug}
                      to={`/kids-universe/${theme.slug}/activities/${r.slug}`}
                      data-testid={`kids-daily-rec-${r.slug}`}
                      className="block rounded-xl p-5 transition hover:-translate-y-0.5"
                      style={{
                        background: palette.cardBg,
                        border: `1px solid ${palette.cardBorder}`,
                      }}>
                  <p className="text-[10.5px] uppercase tracking-[0.22em] mb-1.5"
                     style={{ color: palette.textMuted }}>
                    {r.module} · {r.duration_min} min{r.locked ? " · locked" : ""}
                  </p>
                  <h3 className="font-serif text-[16.5px] leading-snug mb-2"
                      style={{ color: palette.text }}>{r.title}</h3>
                  <p className="text-[13px] leading-relaxed mb-3"
                     style={{ color: palette.textMuted }}>{r.body}</p>
                  <span className="inline-flex items-center gap-1 text-[12px]"
                        style={{ color: palette.accent }}>
                    Open <ArrowRight size={11} />
                  </span>
                </Link>
              ))}
            </div>
            <div className="mt-10 text-center">
              <Link to={`/kids-universe/${theme.slug}/activities`}
                    data-testid="kids-daily-all-activities"
                    className="inline-flex items-center gap-1.5 text-[13.5px]"
                    style={{ color: palette.accent }}>
                See all activities <ArrowRight size={13} />
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
