/**
 * KidsActivities.jsx — /kids-universe/:ageGroup/activities
 *                      /kids-universe/:ageGroup/activities/:slug
 *
 * §KIDS-CURRICULUM 2026-02-09 — Module browser + detail view.
 * One component handles both routes (slug optional). On the
 * browser view a parent / child can filter by module (Reflect /
 * Kitchen / Quest / Create) and see free + locked-premium cards.
 * Premium activities show a soft "inside the 60h package" lock
 * with a CTA to open Clarity Release.
 */

import { Link, useParams, useNavigate, useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  ArrowLeft, ArrowRight, Sparkles, Lock, Clock, Users,
  Compass, Utensils, Sprout, Palette, CheckCircle2,
} from "lucide-react";
import AurinSparkle from "@/components/AurinSparkle";
import KidsJourneyPath from "@/components/KidsJourneyPath";
import { resolveHubTheme } from "@/lib/kidsHubThemes";
import { api } from "@/lib/api";

const MODULE_ICONS = { reflect: Compass, kitchen: Utensils, quest: Sprout, create: Palette };

export default function KidsActivities() {
  const { ageGroup, slug } = useParams();
  const theme = resolveHubTheme(ageGroup);
  const { palette } = theme;
  const [searchParams, setSearchParams] = useSearchParams();
  const moduleFilter = searchParams.get("module") || "";
  const navigate = useNavigate();

  const [modules, setModules] = useState([]);
  const [activities, setActivities] = useState([]);
  const [isPremiumUser, setIsPremiumUser] = useState(false);
  const [detail, setDetail] = useState(null);
  const [completing, setCompleting] = useState(false);
  const [completed, setCompleted] = useState(false);

  // Load modules once
  useEffect(() => {
    api.get("/kids-curriculum/modules").then((r) => setModules(r.data.modules || []));
  }, []);

  // Load list when browsing
  useEffect(() => {
    if (slug) return;
    const url = `/kids-curriculum/activities?age_slug=${theme.slug}${moduleFilter ? `&module=${moduleFilter}` : ""}`;
    api.get(url).then((r) => {
      setActivities(r.data.activities || []);
      setIsPremiumUser(!!r.data.is_premium_user);
    });
  }, [slug, theme.slug, moduleFilter]);

  const [notFound, setNotFound] = useState(false);

  // Load detail when slug present
  useEffect(() => {
    if (!slug) {
      setDetail(null);
      setCompleted(false);
      setNotFound(false);
      return;
    }
    setNotFound(false);
    api.get(`/kids-curriculum/activities/${slug}`)
      .then((r) => setDetail(r.data))
      .catch((err) => {
        // §KIDS-NAV-AUDIT 2026-02-10 — graceful 404 fallback so a
        // mistyped/stale slug shows a soft empty state, not the
        // raw axios error overlay. Anna's redline: no dead pages.
        if (err?.response?.status === 404) setNotFound(true);
      });
  }, [slug]);

  const completeActivity = async () => {
    if (!detail || completing || detail.locked) return;
    setCompleting(true);
    try {
      await api.post("/kids-curriculum/complete", {
        child_slug: theme.slug,
        activity_slug: detail.slug,
      });
      setCompleted(true);
      setTimeout(() => navigate(`/kids-universe/${theme.slug}/activities`), 2600);
    } catch (e) {
      // ignore — surfaced via UI state
    } finally {
      setCompleting(false);
    }
  };

  // ─── DETAIL VIEW ───
  if (slug) {
    if (notFound) {
      return (
        <div data-testid="kids-activity-notfound"
             className="min-h-screen flex flex-col items-center justify-center px-6"
             style={{ background: palette.bgGradient, color: palette.text }}>
          <p className="text-[12px] uppercase tracking-[0.32em] mb-3"
             style={{ color: palette.textMuted }}>
            A quiet detour
          </p>
          <h1 className="text-[36px] leading-tight mb-4 text-center"
              style={{ fontFamily: "Caveat, cursive", color: palette.accent, fontWeight: 600 }}>
            That doorway hasn't been built yet.
          </h1>
          <p className="max-w-[34ch] text-center text-[14px] mb-6"
             style={{ color: palette.textMuted }}>
            The page you came from has moved or this activity isn't ready yet.
            Let's go back to the room.
          </p>
          <Link to={`/kids-universe/${theme.slug}/activities`}
                data-testid="kids-activity-notfound-back"
                className="inline-flex items-center gap-1.5 px-5 py-3 rounded-xl text-[13px] font-medium"
                style={{
                  background: palette.accent,
                  color: "#fff",
                  boxShadow: `0 6px 14px -6px ${palette.accent}`,
                }}>
            Back to activities
          </Link>
        </div>
      );
    }
    if (!detail) {
      return (
        <div className="min-h-screen flex items-center justify-center"
             style={{ background: palette.bgGradient, color: palette.textMuted }}>
          <p className="italic">Opening…</p>
        </div>
      );
    }
    const ModuleIcon = MODULE_ICONS[detail.module] || Sparkles;
    return (
      <div data-testid={`kids-activity-${detail.slug}`} className="min-h-screen relative"
           style={{ background: palette.bgGradient, color: palette.text }}>
        {completed && (
          <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
            <div className="flex flex-col items-center">
              <AurinSparkle variant="celebrate" size={220} />
              <p className="mt-3 font-serif text-[22px] text-center max-w-[28ch]"
                 style={{ color: palette.text }}>
                Aurin saw that. A grown-up will keep the star safe.
              </p>
            </div>
          </div>
        )}
        <div className="mx-auto max-w-2xl px-5 sm:px-8 py-10 sm:py-14">
          <Link to={`/kids-universe/${theme.slug}/activities`}
                data-testid="kids-activity-back"
                className="inline-flex items-center gap-1.5 text-[13px] tracking-wide mb-7"
                style={{ color: palette.textMuted }}>
            <ArrowLeft size={13} /> Back to activities
          </Link>

          <div className="flex items-center gap-3 mb-5">
            <span className="inline-flex items-center justify-center rounded-full"
                  style={{
                    width: 44, height: 44,
                    background: palette.accent, color: "#fff",
                  }}>
              <ModuleIcon size={20} strokeWidth={1.6} />
            </span>
            <div>
              <p className="text-[11px] uppercase tracking-[0.24em]"
                 style={{ color: palette.textMuted }}>
                {detail.module} · {detail.duration_min} min · {detail.with_parent}
              </p>
              {detail.is_premium && (
                <p className="text-[11px] uppercase tracking-[0.24em]"
                   style={{ color: detail.locked ? "#B89B6E" : palette.accent }}>
                  60h Sanctuary package
                </p>
              )}
            </div>
          </div>

          <h1 className="text-[40px] sm:text-[48px] leading-[1.05] mb-4"
              style={{ fontFamily: "Caveat, Fraunces, serif", fontWeight: 600, color: palette.accent }}
              data-testid="kids-activity-title">
            {detail.title}
          </h1>
          <p className="mb-7 text-[16px] leading-relaxed"
             style={{ color: palette.text, opacity: 0.86 }}>
            {detail.body}
          </p>

          {detail.locked ? (
            <div className="rounded-2xl p-6 sm:p-7" data-testid="kids-activity-locked"
                 style={{
                   background: palette.cardBg,
                   border: `1.5px dashed ${palette.cardBorder}`,
                 }}>
              <div className="flex items-start gap-3">
                <Lock size={20} style={{ color: palette.accent }} className="mt-0.5" />
                <div>
                  <h3 className="font-serif text-[18px] mb-1.5"
                      style={{ color: palette.text }}>
                    Inside the 60-hour Sanctuary package
                  </h3>
                  <p className="text-[14px] leading-relaxed mb-4"
                     style={{ color: palette.textMuted }}>
                    Quiet workbooks, full recipe collections, and premium craft
                    bundles live inside the package — alongside unlimited
                    voice time with Aurin.
                  </p>
                  <Link to="/clarity-release"
                        data-testid="kids-activity-unlock-cta"
                        className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-[14px] font-medium"
                        style={{ background: palette.accent, color: "#fff" }}>
                    See the package <ArrowRight size={13} />
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            <>
              <h3 className="text-[26px] mb-3.5"
                  style={{ color: palette.accent, fontFamily: "Caveat, Fraunces, serif", fontWeight: 600 }}>How to do it</h3>
              <ol className="space-y-2.5 mb-9" data-testid="kids-activity-instructions">
                {(detail.instructions || []).map((step, i) => (
                  <li key={i}
                      className="rounded-xl px-4 py-3 flex items-start gap-3 relative overflow-hidden"
                      style={{
                        background: `linear-gradient(160deg, #ffffff 0%, ${palette.accent}10 100%)`,
                        border: `1px solid ${palette.cardBorder}`,
                        boxShadow: `0 4px 14px -10px ${palette.accent}66, inset 0 1px 0 rgba(255,255,255,0.7)`,
                      }}>
                    <span aria-hidden="true"
                          className="pointer-events-none absolute top-0 left-0 right-0 rounded-t-xl"
                          style={{
                            height: "40%",
                            background: "linear-gradient(180deg, rgba(255,255,255,0.45) 0%, rgba(255,255,255,0) 100%)",
                          }} />
                    <span className="relative inline-flex items-center justify-center rounded-full shrink-0 mt-0.5"
                          style={{
                            width: 24, height: 24,
                            background: `${palette.accent}25`,
                            color: palette.accent,
                            fontSize: 12, fontWeight: 600,
                          }}>{i + 1}</span>
                    <span className="relative text-[14.5px] leading-relaxed"
                          style={{ color: palette.text }}>{step}</span>
                  </li>
                ))}
              </ol>

              <button type="button" onClick={completeActivity}
                      disabled={completing || completed}
                      data-testid="kids-activity-complete"
                      className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-[15px] font-medium transition disabled:opacity-50"
                      style={{
                        background: palette.accent, color: "#fff",
                        boxShadow: `0 10px 22px -12px ${palette.accent}`,
                      }}>
                {completed ? <><CheckCircle2 size={14} /> Sent to your grown-up</> :
                  completing ? "Saving…" : <>I did this — +{detail.reward_stars} ★ <Sparkles size={14} /></>}
              </button>
              <p className="mt-4 text-[12.5px] italic"
                 style={{ color: palette.textMuted }}>
                Your grown-up will see this and keep the star safe for you.
              </p>
            </>
          )}
        </div>
      </div>
    );
  }

  // ─── LIST / BROWSER VIEW ───
  return (
    <div data-testid={`kids-activities-${theme.slug}`} className="min-h-screen"
         style={{ background: palette.bgGradient, color: palette.text }}>
      <div className="mx-auto max-w-5xl px-5 sm:px-8 py-10 sm:py-14">
        <Link to={`/kids-universe/${theme.slug}/hub`} data-testid="kids-activities-back"
              className="inline-flex items-center gap-1.5 text-[13px] tracking-wide mb-7"
              style={{ color: palette.textMuted }}>
          <ArrowLeft size={13} /> Back to {theme.title}
        </Link>

        <header className="mb-9 max-w-[44ch]">
          <p className="text-[11px] uppercase tracking-[0.28em] mb-2"
             style={{ color: palette.textMuted }}>A clarity curriculum</p>
          <h1 className="text-[40px] sm:text-[48px] leading-[1]"
              data-testid="kids-activities-title"
              style={{ fontFamily: "Caveat, Fraunces, serif", fontWeight: 600, color: palette.accent }}>
            Quiet things to do today.
          </h1>
          <p className="mt-3 text-[15px] leading-relaxed"
             style={{ color: palette.textMuted }}>
            Four small rooms. Pick the one that feels right — feelings,
            kitchen, kindness, or creative hands.
          </p>
        </header>

        {/* §KIDS-JOURNEY 2026-02-10 — Same stepping-stone path on the
            activities browser so the child can hop between days (and
            see their progress at a glance). Compact variant keeps
            the activities below as the main content. */}
        <div className="mb-9" data-testid="kids-activities-journey-strip">
          <KidsJourneyPath
            ageSlug={theme.slug}
            childSlug={theme.slug}
            compact
            testIdSuffix="-activities"
          />
        </div>

        {/* Module tabs */}
        <div className="flex flex-wrap gap-2 mb-8" data-testid="kids-activities-tabs">
          <button onClick={() => setSearchParams({})}
                  data-testid="kids-activities-tab-all"
                  className="text-[12.5px] uppercase tracking-[0.18em] px-4 py-2 rounded-full transition"
                  style={{
                    background: !moduleFilter ? palette.accent : "transparent",
                    color: !moduleFilter ? "#fff" : palette.text,
                    border: `1px solid ${!moduleFilter ? palette.accent : palette.cardBorder}`,
                  }}>All</button>
          {modules.map((m) => {
            const Icon = MODULE_ICONS[m.slug] || Sparkles;
            const active = moduleFilter === m.slug;
            return (
              <button key={m.slug} onClick={() => setSearchParams({ module: m.slug })}
                      data-testid={`kids-activities-tab-${m.slug}`}
                      className="inline-flex items-center gap-1.5 text-[12.5px] uppercase tracking-[0.18em] px-4 py-2 rounded-full transition"
                      style={{
                        background: active ? palette.accent : "transparent",
                        color: active ? "#fff" : palette.text,
                        border: `1px solid ${active ? palette.accent : palette.cardBorder}`,
                      }}>
                <Icon size={12} strokeWidth={1.6} />
                {m.title.replace("Aurin's ", "").replace("The ", "")}
              </button>
            );
          })}
        </div>

        {/* Premium banner if applicable */}
        {!isPremiumUser && (
          <div data-testid="kids-activities-premium-banner"
               className="rounded-xl p-4 mb-7 flex items-start gap-3"
               style={{
                 background: palette.cardBg,
                 border: `1px dashed ${palette.cardBorder}`,
               }}>
            <Lock size={16} style={{ color: palette.textMuted }} className="mt-0.5" />
            <div className="text-[13px] leading-relaxed flex-1"
                 style={{ color: palette.textMuted }}>
              Free starter activities are open to everyone. The full Clarity
              Curriculum (workbooks, recipe collections, craft bundles) lives
              inside the 60-hour Sanctuary package.
            </div>
            <Link to="/clarity-release"
                  data-testid="kids-activities-banner-cta"
                  className="text-[12.5px] uppercase tracking-[0.16em] shrink-0"
                  style={{ color: palette.accent }}>Open ›</Link>
          </div>
        )}

        {/* Activity grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
             data-testid="kids-activities-grid">
          {activities.map((a) => {
            const ModuleIcon = MODULE_ICONS[a.module] || Sparkles;
            return (
              <Link key={a.slug}
                    to={`/kids-universe/${theme.slug}/activities/${a.slug}`}
                    data-testid={`kids-activity-card-${a.slug}`}
                    className="kids-activity-card group block rounded-2xl p-5 transition hover:-translate-y-1 relative overflow-hidden"
                    style={{
                      background: `linear-gradient(160deg, #ffffff 0%, ${palette.accent}12 60%, ${palette.accent}22 100%)`,
                      border: `1.5px solid ${palette.cardBorder}`,
                      boxShadow: `0 10px 22px -14px ${palette.accent}88, 0 0 0 1px ${palette.accent}33, inset 0 1px 0 rgba(255,255,255,0.85)`,
                      opacity: a.locked ? 0.85 : 1,
                    }}>
                <span aria-hidden="true"
                      className="pointer-events-none absolute top-0 left-0 right-0 rounded-t-2xl"
                      style={{
                        height: "38%",
                        background: "linear-gradient(180deg, rgba(255,255,255,0.55) 0%, rgba(255,255,255,0) 100%)",
                      }} />
                <div className="relative flex items-start justify-between mb-3">
                  <span className="inline-flex items-center justify-center rounded-full transition-transform duration-300 group-hover:scale-110"
                        style={{
                          width: 38, height: 38,
                          background: `linear-gradient(180deg, #ffffff 0%, ${palette.accent}22 100%)`,
                          color: palette.accent,
                          border: `1px solid ${palette.cardBorder}`,
                          boxShadow: `0 3px 8px -3px ${palette.accent}55, inset 0 1px 0 rgba(255,255,255,0.7)`,
                        }}>
                    <ModuleIcon size={16} strokeWidth={1.6} />
                  </span>
                  {a.locked && (
                    <Lock size={14} style={{ color: palette.textMuted }} />
                  )}
                </div>
                <h3 className="relative text-[20px] leading-snug mb-2"
                    style={{ color: palette.text, fontFamily: "Caveat, Fraunces, serif", fontWeight: 600 }}>{a.title}</h3>
                <p className="relative text-[13px] leading-relaxed mb-4"
                   style={{ color: palette.textMuted }}>{a.body}</p>
                <div className="relative flex items-center gap-3 text-[11.5px]"
                     style={{ color: palette.textMuted }}>
                  <span className="inline-flex items-center gap-1">
                    <Clock size={11} /> {a.duration_min} min
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Users size={11} /> {a.with_parent}
                  </span>
                  <span className="ml-auto inline-flex items-center gap-1"
                        style={{ color: palette.accent, fontWeight: 600 }}>
                    <Sparkles size={11} /> +{a.reward_stars} ★
                  </span>
                </div>
              </Link>
            );
          })}
          {activities.length === 0 && (
            <p className="col-span-full italic text-[14px]"
               style={{ color: palette.textMuted }}>
              The shelf is being arranged. Return in a breath.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
