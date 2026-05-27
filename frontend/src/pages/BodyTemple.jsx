/**
 * BodyTemple.jsx — /body-temple
 *
 * §BODY-TEMPLE 2026-02-09 — Founder directive: a 4-week ($39
 * one-time unlock) adult course inside the Body Room, born from
 * the "Эти ЗНАНИЯ о теле" video. Four ancient keys, 28 quiet days.
 *
 * Visual language: cream sanctuary background, wooden module
 * cards (matching the founder's mood-board), Caveat handwriting
 * for titles, Aurin avatar with golden aura.
 *
 * Day 1 is freely viewable as a tone-preview. Days 2-28 surface
 * the title + "locked" state for non-premium users; clicking
 * routes them to the existing Clarity/topup checkout pathway.
 */

import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "@/lib/api";
import {
    ArrowLeft, ArrowRight, Wind, Hand, Moon, Compass,
    Lock, Check, Sparkles,
} from "lucide-react";
import StonePath from "@/components/StonePath";
import KidsJourneyPath from "@/components/KidsJourneyPath";
import AurinsPromise from "@/components/sanctuary/AurinsPromise";

const WEEK_ICONS = {
    breathing: Wind,
    touch: Hand,
    rest: Moon,
    presence: Compass,
};

export default function BodyTemple() {
    const [overview, setOverview] = useState(null);
    const [activeDay, setActiveDay] = useState(null);
    const [activeDayPayload, setActiveDayPayload] = useState(null);
    const [loadingDay, setLoadingDay] = useState(false);
    const [completing, setCompleting] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        api.get("/body-temple/overview")
            .then((r) => setOverview(r.data))
            .catch(() => setOverview({ error: true }));
    }, []);

    // §SYNERGY-ANALYTICS 2026-02-10 — Fire one quiet ref-hit so every
    // arrival from /portal (annas_letter, mentor_hook, kids_hub) lands
    // in the marketing analytics table. Fire-and-forget; no UI impact.
    // §LS-AFFILIATE 2026-02-10 — Also capture ?aff= for the
    // LemonSqueezy Affiliate Hub (Anna's pro-partner channel).
    useEffect(() => {
        try {
            const params = new URLSearchParams(window.location.search);
            const utmSource = (params.get("utm_source") || "").trim();
            const utmMedium = (params.get("utm_medium") || "").trim();
            const utmCampaign = (params.get("utm_campaign") || "").trim();
            const refParam = (params.get("ref") || "").trim().toUpperCase();
            const affParam = (params.get("aff") || params.get("affiliate_id") || "").trim();
            // Persist the affiliate id so the checkout button can append it
            // when LS opens its hosted checkout (last-click attribution).
            if (affParam) {
                try { sessionStorage.setItem("ls_aff", affParam); } catch { /* noop */ }
            }
            if (refParam || utmSource || utmCampaign || affParam) {
                api.post("/marketing/ref-hit", {
                    code: refParam,
                    path: window.location.pathname,
                    referer: document.referrer || null,
                    utm_source: utmSource || null,
                    utm_medium: utmMedium || null,
                    utm_campaign: utmCampaign || null,
                    affiliate_id: affParam || null,
                }).catch(() => {});
            }
        } catch { /* noop */ }
    }, []);

    useEffect(() => {
        if (activeDay == null) {
            setActiveDayPayload(null);
            return;
        }
        setLoadingDay(true);
        api.get(`/body-temple/day/${activeDay}`)
            .then((r) => setActiveDayPayload(r.data))
            .catch(() => setActiveDayPayload(null))
            .finally(() => setLoadingDay(false));
    }, [activeDay]);

    const daysByWeek = useMemo(() => {
        const out = { breathing: [], touch: [], rest: [], presence: [] };
        if (!overview?.days_preview) return out;
        for (const d of overview.days_preview) {
            out[d.week_key]?.push(d);
        }
        return out;
    }, [overview]);

    const completedSet = useMemo(
        () => new Set(overview?.completed_days || []),
        [overview],
    );

    // §BODY-TEMPLE 2026-02-09 — Today's "pulsing stone". First
    // unlocked day that hasn't been walked yet; falls back to Day 1
    // for guests / non-premium users so the path always has a
    // bright anchor.
    const currentDay = useMemo(() => {
        if (!overview?.days_preview) return 1;
        for (const d of overview.days_preview) {
            if (completedSet.has(d.day)) continue;
            if (d.is_premium && !overview.unlocked) continue;
            return d.day;
        }
        return 1;
    }, [overview, completedSet]);

    const handleComplete = async () => {
        if (!activeDay || completing) return;
        setCompleting(true);
        try {
            await api.post("/body-temple/complete", { day: activeDay });
            // Refresh overview to update progress.
            const ov = await api.get("/body-temple/overview");
            setOverview(ov.data);
        } catch (e) {
            if (e?.response?.status === 401) {
                navigate("/portal");
            }
        } finally {
            setCompleting(false);
        }
    };

    if (!overview) {
        return (
            <div className="sanctuary-cream flex items-center justify-center" style={{minHeight: "60vh"}}>
                <p className="sanctuary-muted">Opening the temple…</p>
            </div>
        );
    }

    if (overview.error) {
        return (
            <div className="sanctuary-cream flex items-center justify-center px-6" style={{minHeight: "60vh"}}>
                <p className="sanctuary-muted">The temple is resting. Try again in a moment.</p>
            </div>
        );
    }

    return (
        <div className="sanctuary-cream" data-testid="body-temple-page">
            {/* Hero */}
            <section className="px-6 pt-12 md:pt-16 pb-10 max-w-[920px] mx-auto">
                <Link to="/body-room"
                      data-testid="body-temple-back-to-room"
                      className="inline-flex items-center gap-2 text-[13px] sanctuary-muted hover:text-[#3d2e15] transition mb-6">
                    <ArrowLeft size={14} /> Back to the Body Room
                </Link>

                <div className="grid md:grid-cols-[1fr_220px] gap-8 items-center">
                    <div>
                        <p className="sanctuary-hand text-[34px] md:text-[42px] leading-[0.95] mb-1"
                           style={{color: "#6a4b1f"}}>
                            Body Temple 28
                        </p>
                        <h1 className="text-2xl md:text-3xl font-light mb-4" style={{fontFamily: "Fraunces, serif"}}>
                            {overview.subtitle}
                        </h1>
                        <p className="text-[15px] leading-relaxed sanctuary-muted max-w-[55ch]">
                            {overview.blurb}
                        </p>

                        {/* §BRAND-CLARITY 2026-02-11 — "What waits for you"
                            structured promise immediately before the CTA.
                            Customers ask "what exactly do I get for $39?"
                            — this answers it without breaking the poetic
                            tone above. No image, no new colour. */}
                        {!overview.unlocked && (
                            <div
                                className="mt-6 max-w-[55ch] rounded-2xl px-5 py-4"
                                style={{
                                    background: "rgba(255, 247, 227, 0.55)",
                                    border: "1px solid rgba(196, 164, 107, 0.25)",
                                }}
                                data-testid="body-temple-what-you-get"
                            >
                                <p
                                    className="text-[10.5px] tracking-[0.32em] uppercase mb-3"
                                    style={{ color: "#8a6a1a" }}
                                >
                                    What waits for you after unlock
                                </p>
                                <ul
                                    className="text-[14px] leading-[1.85] font-light space-y-1.5"
                                    style={{ color: "#3d2e15" }}
                                >
                                    <li>· 28 days · one ancient key per day</li>
                                    <li>· Breath · Touch · Rest · Presence</li>
                                    <li>· Text, guided sound, and a small journal</li>
                                    <li>· Yours forever, with one quiet payment</li>
                                    <li>· No deadlines, no streaks, no pressure</li>
                                </ul>
                            </div>
                        )}

                        <div className="mt-7 flex flex-wrap items-center gap-3">
                            {!overview.unlocked ? (
                                <Link to="/clarity-release"
                                      data-testid="body-temple-unlock-cta"
                                      className="inline-flex items-center gap-2 px-5 py-3 rounded-full font-medium transition"
                                      style={{
                                          background: "#4a3a1c",
                                          color: "#f8efde",
                                          boxShadow: "0 8px 20px -10px rgba(74,58,28,0.6)",
                                      }}>
                                    <Sparkles size={14} />
                                    Unlock all 28 days — ${overview.price_usd}
                                    <ArrowRight size={14} />
                                </Link>
                            ) : (
                                <div className="inline-flex items-center gap-2 px-5 py-3 rounded-full"
                                     data-testid="body-temple-unlocked-badge"
                                     style={{ background: "rgba(123, 168, 136, 0.25)", color: "#3d2e15" }}>
                                    <Check size={14} /> Unlocked — {overview.completed_count} / {overview.total_days} days
                                </div>
                            )}
                            <button type="button"
                                    onClick={() => setActiveDay(1)}
                                    data-testid="body-temple-preview-day1"
                                    className="text-[13.5px] underline decoration-dotted underline-offset-4 sanctuary-muted hover:text-[#3d2e15]">
                                Read Day 1 first (free)
                            </button>
                        </div>
                    </div>

                    {/* Aurin avatar with golden aura — matches mood-board */}
                    <div className="hidden md:flex items-center justify-center">
                        <div className="sanctuary-aura w-[180px] h-[180px] rounded-full overflow-hidden"
                             style={{
                                 background: "linear-gradient(180deg, #fff7e3, #f0d8a4)",
                                 border: "2px solid rgba(196, 156, 80, 0.4)",
                             }}>
                            <img src="/sanctuary-visuals/body-temple-4keys.png"
                                 alt="Aurin guides the four keys of body wisdom"
                                 className="w-full h-full object-cover object-left scale-[1.6] -translate-x-3"
                                 loading="eager" />
                        </div>
                    </div>
                </div>
            </section>

            {/* §FOUNDER-SIGNATURE 2026-02-09 — A short, intimate note
                from Anna that sits between the hero and the four weeks.
                Gives the product a human voice no feature can replace.
                Anna's brand asks for this. */}
            <section className="px-6 pb-10 max-w-[760px] mx-auto" data-testid="body-temple-anna-note">
                <div className="sanctuary-wood p-6 md:p-7">
                    <div className="relative z-[1]">
                        <p className="text-[11px] uppercase tracking-[0.22em] mb-2"
                           style={{ color: "#7a5a26" }}>
                            A note from Anna
                        </p>
                        <p className="text-[15.5px] md:text-[16px] leading-relaxed"
                           style={{ color: "#3d2e15" }}>
                            I have spent the last year quietly carrying these
                            twenty-eight days for you. Not as a programme to
                            finish — but as a small <em>sanctuary</em> to walk
                            through, one day at a time. There is no rush. No
                            measurement. Just four old keys, and you,
                            remembering that your body has been waiting.
                        </p>
                        <p className="sanctuary-hand text-[34px] mt-4 leading-none"
                           style={{ color: "#6a4b1f" }}>
                            Anna &amp; Aurin
                        </p>
                    </div>
                </div>
            </section>

            {/* §KIDS-JOURNEY 2026-02-10 — Anna's directive: laste raja
                visuaalne keel laienes ka Body Temple peale. One unified
                28-stone amber path so the wanderer sees the WHOLE
                arc before drilling into the four weekly keys below. */}
            <section className="px-6 pb-10 max-w-[920px] mx-auto" data-testid="body-temple-journey">
                <KidsJourneyPath
                    ageSlug="body-temple"
                    childSlug="body-temple"
                    todayIndex={currentDay}
                    completedDays={Array.from(completedSet)}
                    totalDays={overview?.total_days || 28}
                    onStoneClick={(day) => {
                        const d = (overview?.days_preview || []).find((x) => x.day === day);
                        if (d?.is_premium && !overview?.unlocked) {
                            navigate("/clarity-release");
                            return;
                        }
                        setActiveDay(day);
                    }}
                    showFooter={false}
                />
            </section>

            {/* Four weeks grid */}
            <section className="px-6 pb-16 max-w-[920px] mx-auto">
                <p className="sanctuary-hand text-[26px] mb-2" style={{color: "#6a4b1f"}}>
                    Four ancient keys.
                </p>
                <p className="text-[13.5px] sanctuary-muted mb-7 max-w-[55ch]">
                    Each week is one key. Walk in order, or wander — but the keys
                    work best when held one after the other.
                </p>

                <div className="grid sm:grid-cols-2 gap-5">
                    {overview.weeks.map((w) => {
                        const Icon = WEEK_ICONS[w.key] || Sparkles;
                        const days = daysByWeek[w.key] || [];
                        const doneInWeek = days.filter((d) => completedSet.has(d.day)).length;
                        return (
                            <div key={w.key}
                                 data-testid={`body-temple-week-${w.key}`}
                                 className="sanctuary-wood p-5 md:p-6">
                                <div className="flex items-start gap-3 mb-3 relative z-[1]">
                                    <Icon size={26} className="sanctuary-wood-icon" />
                                    <div className="flex-1">
                                        <p className="text-[11px] uppercase tracking-[0.18em]" style={{color: "#7a5a26"}}>
                                            Week {w.number}
                                        </p>
                                        <p className="sanctuary-wood-title text-[26px] md:text-[30px]">
                                            {w.title}
                                        </p>
                                    </div>
                                </div>
                                <p className="text-[13px] leading-relaxed mb-4 relative z-[1]" style={{color: "#5a4a26"}}>
                                    {w.blurb}
                                </p>
                                <div className="relative z-[1]">
                                    <StonePath
                                        days={days.map((d) => ({
                                            day: d.day,
                                            locked: d.is_premium && !overview.unlocked,
                                            completed: completedSet.has(d.day),
                                        }))}
                                        currentDay={currentDay}
                                        onPick={(n) => setActiveDay(n)}
                                        testIdPrefix="body-temple-day"
                                    />
                                </div>
                                {overview.unlocked && (
                                    <p className="text-[11.5px] mt-3 relative z-[1]" style={{color: "#7a5a26"}}>
                                        {doneInWeek} / {days.length} walked
                                    </p>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* What's included strip */}
                <div className="mt-10 sanctuary-wood p-6 md:p-7">
                    <p className="sanctuary-wood-title text-[28px] mb-3 relative z-[1]">
                        What lives inside
                    </p>
                    <ul className="space-y-2 text-[13.5px] relative z-[1]" style={{color: "#3d2e15"}}>
                        <li>· 28 quiet days, each 3–15 minutes — never longer than your patience.</li>
                        <li>· One Socratic question per day, to close it gently.</li>
                        <li>· Aurin's voice in tone, never clinical, never measuring.</li>
                        <li>· Yours forever after one unlock. No subscription.</li>
                    </ul>
                </div>
            </section>

            {/* Day modal */}
            {activeDay != null && (
                <div role="dialog"
                     data-testid="body-temple-day-modal"
                     className="fixed inset-0 z-[60] flex items-end md:items-center justify-center p-4 md:p-8"
                     style={{ background: "rgba(40, 28, 10, 0.55)", backdropFilter: "blur(6px)" }}
                     onClick={() => setActiveDay(null)}>
                    <div className="max-w-[640px] w-full max-h-[92vh] overflow-auto rounded-2xl p-6 md:p-8"
                         onClick={(e) => e.stopPropagation()}
                         style={{
                             background: "linear-gradient(180deg, #fbf3df 0%, #f3e6cb 100%)",
                             border: "1px solid rgba(120, 80, 30, 0.3)",
                             boxShadow: "0 30px 60px -20px rgba(40, 28, 10, 0.5)",
                         }}>
                        {loadingDay && <p className="sanctuary-muted text-center py-8">Opening…</p>}
                        {!loadingDay && activeDayPayload && (
                            <>
                                <div className="flex items-center justify-between mb-3">
                                    <p className="text-[11px] uppercase tracking-[0.2em]" style={{color: "#7a5a26"}}>
                                        Day {activeDayPayload.day.day} · Week {activeDayPayload.week?.number} · {activeDayPayload.week?.title}
                                    </p>
                                    <button onClick={() => setActiveDay(null)}
                                            data-testid="body-temple-modal-close"
                                            className="text-[18px] sanctuary-muted hover:text-[#3d2e15]">×</button>
                                </div>
                                <h2 className="sanctuary-hand text-[36px] leading-tight mb-3" style={{color: "#3d2e15"}}>
                                    {activeDayPayload.day.title}
                                </h2>

                                {activeDayPayload.day.locked ? (
                                    <div className="space-y-4">
                                        <p className="text-[14.5px] leading-relaxed sanctuary-muted">
                                            {activeDayPayload.day.body}
                                        </p>
                                        <div className="mt-2">
                                            <Link to="/clarity-release"
                                                  data-testid="body-temple-modal-unlock"
                                                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full font-medium"
                                                  style={{ background: "#4a3a1c", color: "#f8efde" }}>
                                                <Lock size={13} />
                                                Unlock Body Temple 28 — ${overview.price_usd}
                                            </Link>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-5">
                                        <p className="text-[15px] leading-relaxed" style={{color: "#3d2e15"}}>
                                            {activeDayPayload.day.body}
                                        </p>
                                        <div>
                                            <p className="sanctuary-hand text-[22px] mb-2" style={{color: "#6a4b1f"}}>
                                                The practice
                                            </p>
                                            <ol className="space-y-1.5 list-decimal pl-5 text-[14px]" style={{color: "#3d2e15"}}>
                                                {activeDayPayload.day.practice.map((step, i) => (
                                                    <li key={i}>{step}</li>
                                                ))}
                                            </ol>
                                            <p className="text-[12.5px] mt-2" style={{color: "#7a5a26"}}>
                                                ~{activeDayPayload.day.duration_min} min
                                            </p>
                                        </div>
                                        {activeDayPayload.day.reflection && (
                                            <div className="sanctuary-wood p-4 mt-2">
                                                <p className="text-[11px] uppercase tracking-[0.18em] mb-1 relative z-[1]"
                                                   style={{color: "#7a5a26"}}>
                                                    Aurin asks
                                                </p>
                                                <p className="sanctuary-hand text-[22px] leading-snug relative z-[1]"
                                                   style={{color: "#3d2e15"}}>
                                                    {activeDayPayload.day.reflection}
                                                </p>
                                            </div>
                                        )}
                                        {overview.unlocked && (
                                            <button onClick={handleComplete}
                                                    disabled={completing || activeDayPayload.completed}
                                                    data-testid="body-temple-day-complete-btn"
                                                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full font-medium transition disabled:opacity-60"
                                                    style={{
                                                        background: activeDayPayload.completed ? "rgba(123, 168, 136, 0.4)" : "#4a3a1c",
                                                        color: activeDayPayload.completed ? "#3d2e15" : "#f8efde",
                                                    }}>
                                                <Check size={13} />
                                                {activeDayPayload.completed
                                                    ? "Walked"
                                                    : completing ? "Marking…" : "Mark this day walked"}
                                            </button>
                                        )}
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            )}
            {/* §BRAND-CLARITY 2026-02-11 — Trust anchor at the close
                of the page. Cream tone to match the surface. Shown
                only once overview has loaded so it never flashes
                during the loading state. */}
            {overview && (
                <div className="sanctuary-cream">
                    <AurinsPromise tone="cream" showEarlyAccess={true} />
                </div>
            )}
        </div>
    );
}
