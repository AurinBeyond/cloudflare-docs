/**
 * HighPerformers.jsx — /high-performers
 *
 * §HIGH-PERFORMERS 2026-02-10 — LinkedIn-targeted landing page for
 * the Marketing Agent's B2B / executive pivot.
 *
 * STRATEGIC DESIGN:
 *   • Uses Linguistic Guardrails–approved B2B copy ("decision-recovery",
 *     "professional OS", "the calendar that ate my sleep" — NEVER
 *     "trauma", "anxiety", "mental health", "therapy", "burnout cure").
 *   • Shares the SAME Body Temple 28 checkout flow as /body-temple.
 *   • Sanctuary tone preserved (Caveat handwriting, sage warmth,
 *     no infographics, no "10× your output", no FOMO).
 *   • UTM auto-fires on mount → ?utm_source=high_performers logged
 *     to referral_hits so we measure LinkedIn conversion.
 *
 * The page mirrors Body Temple's funnel but speaks to a different
 * felt-experience: the leader who carries teams home with them.
 */

import { useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Sparkles, Quote } from "lucide-react";
import { api } from "@/lib/api";

const PILLARS = [
    {
        eyebrow: "Week 1 · Breath",
        title: "The pause you don't take",
        body: "Seven daily readings of two minutes each. Read at 06:40 before the inbox, or at 22:50 before the room goes quiet. No app to open. No streak to keep.",
    },
    {
        eyebrow: "Week 2 · Touch",
        title: "The body you stopped consulting",
        body: "Small somatic notes — where the shoulders are, what the jaw is doing, where the chest sits. Not a practice. A noticing.",
    },
    {
        eyebrow: "Week 3 · Rest",
        title: "Rest that isn't more screens",
        body: "Seven different shapes of rest — none of them are an app. The Sunday evening reading is the one most readers screenshot.",
    },
    {
        eyebrow: "Week 4 · Presence",
        title: "Returning to the room you're in",
        body: "Seven readings that ask one question: where are you when you are answering this email? No technique. A re-meeting.",
    },
];

const FELT_LINES = [
    "the calendar that ate my sleep",
    "the question I stopped asking",
    "the cost of one missed dinner",
    "what a quiet ten minutes does for a hard week",
];

export default function HighPerformers() {
    // §SYNERGY-ANALYTICS 2026-02-10 — fire-and-forget UTM hit for any
    // LinkedIn/X/email-sourced visitor. Same pattern as BodyTemple.
    // §LS-AFFILIATE 2026-02-10 — also capture ?aff= and persist it
    // through the BT checkout link (last-click attribution).
    useEffect(() => {
        try {
            const params = new URLSearchParams(window.location.search);
            const utmSource = (params.get("utm_source") || "high_performers").trim();
            const utmMedium = (params.get("utm_medium") || "").trim();
            const utmCampaign = (params.get("utm_campaign") || "linkedin_b2b").trim();
            const refParam = (params.get("ref") || "").trim().toUpperCase();
            const affParam = (params.get("aff") || params.get("affiliate_id") || "").trim();
            if (affParam) {
                try { sessionStorage.setItem("ls_aff", affParam); } catch { /* noop */ }
            }
            api.post("/marketing/ref-hit", {
                code: refParam,
                path: window.location.pathname,
                referer: document.referrer || null,
                utm_source: utmSource,
                utm_medium: utmMedium || null,
                utm_campaign: utmCampaign,
                affiliate_id: affParam || null,
            }).catch(() => {});
        } catch { /* noop */ }
    }, []);

    return (
        <div
            data-testid="high-performers-page"
            className="min-h-screen"
            style={{
                background: "linear-gradient(180deg, #fbf6ec 0%, #ede1c8 100%)",
                color: "#2c2418",
            }}
        >
            {/* ─── Hero ─── */}
            <section className="px-6 pt-16 md:pt-24 pb-16 max-w-[960px] mx-auto">
                <p
                    className="text-[11px] uppercase tracking-[0.32em] mb-5"
                    style={{ color: "#8a6428" }}
                    data-testid="hp-eyebrow"
                >
                    For leaders carrying more than the brief
                </p>

                <h1
                    className="text-[44px] sm:text-[60px] md:text-[72px] leading-[0.95] mb-8 max-w-[18ch]"
                    style={{
                        fontFamily: "Fraunces, Georgia, serif",
                        fontWeight: 500,
                        color: "#2c2418",
                        letterSpacing: "-0.02em",
                    }}
                    data-testid="hp-headline"
                >
                    A 28-day decision-recovery practice for people who carry teams home with them.
                </h1>

                <p
                    className="text-[18px] md:text-[20px] leading-[1.55] max-w-[58ch] mb-10"
                    style={{ color: "#4a3f2e" }}
                >
                    Not a course. Not a retreat. Not a chatbot.
                    Twenty-eight readings of two minutes each, walked one day at a time.
                    For the executive whose calendar has eaten their sleep — and who can't
                    book another retreat to fix it.
                </p>

                <div className="flex flex-wrap items-center gap-4">
                    <Link
                        to="/body-temple?utm_source=high_performers&utm_campaign=hero_cta"
                        data-testid="hp-hero-cta"
                        className="inline-flex items-center gap-2 px-7 py-4 rounded-full text-[15px] font-medium transition hover:-translate-y-0.5"
                        style={{
                            background: "#a65a2f",
                            color: "#fff",
                            boxShadow: "0 16px 32px -16px rgba(166,90,47,0.7)",
                        }}
                    >
                        Read Day 1 · free
                        <ArrowRight size={14} />
                    </Link>
                    <p
                        className="text-[13px] italic"
                        style={{ color: "#7a5e2e" }}
                    >
                        $39 for the full twenty-eight days. One-time. Walk at your own pace.
                    </p>
                </div>
            </section>

            {/* ─── The felt thing (anti-AI human line) ─── */}
            <section className="px-6 py-10 max-w-[960px] mx-auto" data-testid="hp-felt-lines">
                <p
                    className="text-[11px] uppercase tracking-[0.28em] mb-4"
                    style={{ color: "#8a6428" }}
                >
                    Things this practice is for
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-[680px]">
                    {FELT_LINES.map((line, i) => (
                        <p
                            key={i}
                            className="text-[26px] sm:text-[30px] leading-tight"
                            style={{
                                fontFamily: "Caveat, cursive",
                                color: "#3d2a14",
                                fontWeight: 500,
                            }}
                        >
                            — {line}
                        </p>
                    ))}
                </div>
            </section>

            {/* ─── Four pillars ─── */}
            <section
                className="px-6 py-16 max-w-[1020px] mx-auto"
                data-testid="hp-pillars"
            >
                <h2
                    className="text-[34px] sm:text-[40px] leading-tight max-w-[24ch] mb-3"
                    style={{
                        fontFamily: "Fraunces, Georgia, serif",
                        fontWeight: 500,
                        color: "#2c2418",
                    }}
                >
                    Four weeks. Four keys for your body.
                </h2>
                <p
                    className="text-[15px] leading-relaxed max-w-[60ch] mb-10"
                    style={{ color: "#4a3f2e" }}
                >
                    No technique. No tracker. No streak. Just twenty-eight short
                    readings, in sequence, that ask the body to come back into the room.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {PILLARS.map((p, i) => (
                        <div
                            key={i}
                            data-testid={`hp-pillar-${i + 1}`}
                            className="rounded-2xl p-7 relative overflow-hidden transition hover:-translate-y-0.5"
                            style={{
                                background: "linear-gradient(160deg, #fffaf0 0%, #f3e3c5 100%)",
                                border: "1.5px solid #e8d2a8",
                                boxShadow:
                                    "0 12px 26px -16px rgba(166,90,47,0.4), inset 0 1px 0 rgba(255,255,255,0.7)",
                            }}
                        >
                            <span
                                aria-hidden="true"
                                className="pointer-events-none absolute top-0 left-0 right-0 rounded-t-2xl"
                                style={{
                                    height: "32%",
                                    background:
                                        "linear-gradient(180deg, rgba(255,255,255,0.55) 0%, rgba(255,255,255,0) 100%)",
                                }}
                            />
                            <p
                                className="relative text-[11px] uppercase tracking-[0.22em] mb-2"
                                style={{ color: "#a65a2f" }}
                            >
                                {p.eyebrow}
                            </p>
                            <h3
                                className="relative text-[24px] leading-snug mb-3"
                                style={{
                                    fontFamily: "Caveat, cursive",
                                    color: "#2c2418",
                                    fontWeight: 500,
                                }}
                            >
                                {p.title}
                            </h3>
                            <p
                                className="relative text-[14.5px] leading-relaxed"
                                style={{ color: "#4a3f2e" }}
                            >
                                {p.body}
                            </p>
                        </div>
                    ))}
                </div>
            </section>

            {/* ─── Founder voice (the human line, not corporate) ─── */}
            <section
                className="px-6 py-16 max-w-[820px] mx-auto"
                data-testid="hp-founder-note"
            >
                <Quote size={28} style={{ color: "#a65a2f", opacity: 0.7 }} className="mb-3" />
                <p
                    className="text-[22px] sm:text-[25px] leading-[1.55] mb-5"
                    style={{
                        fontFamily: "Fraunces, Georgia, serif",
                        fontWeight: 400,
                        color: "#2c2418",
                        fontStyle: "italic",
                    }}
                >
                    I built this for the version of myself who, at 41, woke up at 03:14
                    every Monday already tired. Not because I didn't sleep — but because
                    the team's worry had moved into my body, and I had no quiet place to
                    put it down. Twenty-eight days is what it took to put it down once.
                    The readings are what I would have wanted handed to me then.
                </p>
                <p
                    className="text-[15px]"
                    style={{
                        color: "#7a5e2e",
                        fontFamily: "Caveat, cursive",
                        fontSize: 24,
                    }}
                >
                    — Anna, founder
                </p>
            </section>

            {/* ─── What it isn't (legal-safe disclaimers in human voice) ─── */}
            <section
                className="px-6 py-12 max-w-[820px] mx-auto"
                data-testid="hp-what-it-isnt"
            >
                <p
                    className="text-[11px] uppercase tracking-[0.28em] mb-4"
                    style={{ color: "#8a6428" }}
                >
                    What this is, and what it isn't
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                        <p className="text-[14px] mb-2" style={{ color: "#4a3f2e" }}>
                            <strong>This is</strong>
                        </p>
                        <ul className="space-y-1.5 text-[14px]" style={{ color: "#4a3f2e" }}>
                            <li>· A reading practice for adults</li>
                            <li>· A quiet companion you walk with</li>
                            <li>· A daily ritual you can keep or set down</li>
                            <li>· $39, one-time, walked at your own pace</li>
                        </ul>
                    </div>
                    <div>
                        <p className="text-[14px] mb-2" style={{ color: "#4a3f2e" }}>
                            <strong>This isn't</strong>
                        </p>
                        <ul className="space-y-1.5 text-[14px]" style={{ color: "#4a3f2e" }}>
                            <li>· Therapy or counselling</li>
                            <li>· Medical or psychological advice</li>
                            <li>· A productivity hack or biohack</li>
                            <li>· A substitute for a licensed practitioner</li>
                        </ul>
                    </div>
                </div>
            </section>

            {/* ─── Final CTA ─── */}
            <section className="px-6 pt-8 pb-24 max-w-[820px] mx-auto text-center">
                <h2
                    className="text-[36px] sm:text-[48px] leading-tight mb-6 max-w-[20ch] mx-auto"
                    style={{
                        fontFamily: "Caveat, cursive",
                        color: "#2c2418",
                        fontWeight: 500,
                    }}
                >
                    Day 1 is open. Read it before you decide.
                </h2>
                <Link
                    to="/body-temple?utm_source=high_performers&utm_campaign=footer_cta"
                    data-testid="hp-footer-cta"
                    className="inline-flex items-center gap-2 px-7 py-4 rounded-full text-[15px] font-medium transition hover:-translate-y-0.5"
                    style={{
                        background: "#a65a2f",
                        color: "#fff",
                        boxShadow: "0 16px 32px -16px rgba(166,90,47,0.7)",
                    }}
                >
                    Open Day 1 <Sparkles size={14} />
                </Link>
                <p
                    className="text-[12.5px] italic mt-6"
                    style={{ color: "#7a5e2e" }}
                >
                    No account required for Day 1. Twenty-eight days is $39, one-time,
                    refundable for any reason within fourteen days.
                </p>
            </section>
        </div>
    );
}
