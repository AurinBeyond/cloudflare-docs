/**
 * KidsHub.jsx — the warm room a child enters AFTER picking an age
 * group from /kids-universe. Single component, themed per age via
 * the ThemeManager (kidsHubThemes.js).
 *
 * §KIDS-HUBS 2026-02-09 — Founder directive: replace the "dark void"
 * the child used to step into with a bright, calm room that already
 * has Aurin in it. Four large action cards (Talk, Story, Color, My
 * Stars), one ambient Lottie sparkle, plenty of breathing room. No
 * navbar pollution from the adult layout — this page paints its own
 * cream background and floats the layout's existing chrome on top.
 */

import { Link, useParams } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { MessageCircleHeart, BookHeart, Palette, Sparkles, ArrowRight, Heart, Sun, Compass } from "lucide-react";
import AurinSparkle from "@/components/AurinSparkle";
import KidsJourneyPath from "@/components/KidsJourneyPath";
import { resolveHubTheme } from "@/lib/kidsHubThemes";
import { api } from "@/lib/api";

const STORY_HREF = {
  "little-dreamers": "/aurins-room/stories",
  "explorers": "/aurins-room/stories",
  "dreamweavers": "/aurins-room/stories",
};

export default function KidsHub() {
  const { ageGroup } = useParams();
  const theme = resolveHubTheme(ageGroup);
  const { palette } = theme;
  const [stars, setStars] = useState(null);
  // Gratitude micro-prompt — only on Little Dreamers.
  const [gratitude, setGratitude] = useState("");
  const [gratitudeSaved, setGratitudeSaved] = useState(false);
  const cardsRef = useRef(null);

  useEffect(() => {
    let alive = true;
    api.get(`/angel-stars/me?child_slug=${theme.slug}`)
      .then((r) => {
        if (alive) setStars(r.data);
      })
      .catch(() => {
        // Soft-fail: not logged in or no profile yet — show 0.
        if (alive) setStars({ balance: 0, total_earned: 0 });
      });
    return () => {
      alive = false;
    };
  }, [theme.slug]);

  const saveGratitude = () => {
    if (!gratitude.trim()) return;
    try {
      const key = `aurin_gratitude_${theme.slug}`;
      const prev = JSON.parse(localStorage.getItem(key) || "[]");
      prev.unshift({ text: gratitude.trim(), at: new Date().toISOString() });
      localStorage.setItem(key, JSON.stringify(prev.slice(0, 50)));
    } catch {}
    setGratitudeSaved(true);
    setTimeout(() => {
      setGratitudeSaved(false);
      setGratitude("");
    }, 2400);
  };

  const balance = stars?.balance ?? 0;

  return (
    <div
      data-testid={`kids-hub-${theme.slug}`}
      className="min-h-screen relative overflow-hidden"
      style={{
        background: palette.bgGradient,
        color: palette.text,
      }}
    >
      {/* §KIDS-SPATIAL 2026-02-09 — Founder ask: "ruumilisus ja
          mänguline taju". Static-only decorative layers that
          create depth without a single animation frame:
            • soft sun-rays from upper-left
            • a warm floor-glow at bottom
            • two blurred orbs that suggest a room's lights
          All purely CSS — zero impact on functionality.

          §KIDS-SPATIAL-v2 2026-02-09 LATE — Artist agent additions
          (approved ideas 1 + 2 from /app/design_guidelines.json):
            • House Vignette — inset shadow + bottom radial
              floor to transform the viewport from a webpage into
              a "room"
          Idea 2 (Guiding Thread) is rendered as a separate SVG
          below the cards grid (see the .kids-hub-cards-grid block). */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div
          className="absolute"
          style={{
            top: "-10%",
            left: "-15%",
            width: "70%",
            height: "60%",
            background: `radial-gradient(ellipse at center, ${palette.accent}1A 0%, transparent 65%)`,
            filter: "blur(40px)",
          }}
        />
        <div
          className="absolute"
          style={{
            top: "20%",
            right: "-20%",
            width: "60%",
            height: "55%",
            background: `radial-gradient(ellipse at center, ${palette.accent2 || palette.accent}1A 0%, transparent 65%)`,
            filter: "blur(50px)",
          }}
        />
        <div
          className="absolute inset-x-0 bottom-0"
          style={{
            height: "30%",
            background: `linear-gradient(180deg, transparent 0%, ${palette.accent}10 100%)`,
          }}
        />
        {/* Sun-ray streaks — three thin diagonals like window light */}
        <svg viewBox="0 0 800 600" preserveAspectRatio="none"
             className="absolute inset-0 w-full h-full opacity-[0.18]">
          <defs>
            <linearGradient id={`ray-${theme.slug}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={palette.accent} stopOpacity="0.4"/>
              <stop offset="100%" stopColor={palette.accent} stopOpacity="0"/>
            </linearGradient>
          </defs>
          <polygon points="0,0 320,0 80,600 0,600" fill={`url(#ray-${theme.slug})`}/>
          <polygon points="120,0 240,0 60,600 0,600" fill={`url(#ray-${theme.slug})`} opacity="0.55"/>
          <polygon points="220,0 320,0 140,600 60,600" fill={`url(#ray-${theme.slug})`} opacity="0.4"/>
        </svg>
      </div>

      {/* §SANCTUARY-VIGNETTE 2026-02-09 — Artist agent idea 1.
          Inset edge-darkening + bottom radial "floor" turns the
          viewport into a room. Fixed so the framing persists
          when the user scrolls. Pointer-events-none keeps
          everything clickable. Per-age tint via palette.accent. */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-[1]"
        style={{
          boxShadow: `inset 0 0 140px ${palette.accent}24, inset 0 -80px 120px -40px ${palette.accent}1f`,
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-x-0 bottom-0 z-[1]"
        style={{
          height: "32vh",
          background: `radial-gradient(120% 80% at 50% 100%, ${palette.accent}1f 0%, ${palette.accent}10 30%, transparent 65%)`,
        }}
      />

      <div className="relative mx-auto max-w-5xl px-5 sm:px-8 py-12 sm:py-16">
        {/* ─── Hero ─── */}
        <header className="flex flex-col items-center text-center mb-12 sm:mb-16">
          <div className="relative inline-flex items-center justify-center mb-5">
            <div
              className="house-aura rounded-full overflow-hidden flex items-center justify-center"
              style={{
                width: 172,
                height: 172,
                background: palette.cardBg,
                border: `3px solid ${palette.cardBorder}`,
                boxShadow: `0 24px 50px -22px ${palette.accent}aa, inset 0 2px 0 rgba(255,255,255,0.6), 0 0 0 6px ${palette.accent}1a`,
              }}
              data-testid="kids-hub-aurin-portrait"
            >
              <img
                src={theme.aurinHero}
                alt="Aurin"
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                  if (e.currentTarget.nextElementSibling) {
                    e.currentTarget.nextElementSibling.style.display = "flex";
                  }
                }}
              />
              {/* §KIDS-HUBS 2026-02-09 — SVG initial fallback when
                  the Aurin portrait 404s (preview env or first
                  paint). Keeps the frame from looking empty. */}
              <span
                aria-hidden="true"
                style={{
                  display: "none",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "100%",
                  height: "100%",
                  background: `linear-gradient(135deg, ${palette.accent} 0%, ${palette.accent2} 100%)`,
                  color: "#FFFFFF",
                  fontFamily: "Caveat, cursive",
                  fontSize: 64,
                  lineHeight: 1,
                }}
              >
                A
              </span>
            </div>
            <span
              className="absolute -top-2 -right-2"
              data-testid="kids-hub-ambient-sparkle"
            >
              <AurinSparkle variant="ambient" size={60} />
            </span>
          </div>
          <p
            className="text-[11px] uppercase tracking-[0.32em] mb-3"
            style={{ color: palette.textMuted }}
          >
            Aurin's room · {theme.ageRange}
          </p>
          <h1
            className="font-serif text-[34px] sm:text-[44px] leading-[1.05] max-w-[20ch]"
            style={{ color: palette.text }}
            data-testid="kids-hub-title"
          >
            {theme.title}
          </h1>
          <p
            className="mt-4 text-[16px] italic max-w-[34ch]"
            style={{ color: palette.textMuted }}
            data-testid="kids-hub-tagline"
          >
            {theme.tagline}
          </p>
          <p
            className="mt-6 text-[15.5px] leading-relaxed max-w-[44ch]"
            style={{ color: palette.text, opacity: 0.86 }}
            data-testid="kids-hub-aurin-hello"
          >
            "{theme.aurinFirstHello}"
          </p>
        </header>

        {/* ─── Today's invitation (Daily Check-in hero) ─── */}
        <section
          className="rounded-2xl p-6 sm:p-7 mb-7 flex flex-col sm:flex-row sm:items-center gap-5"
          style={{
            background: palette.accent,
            color: "#FFFFFF",
            boxShadow: `0 18px 36px -18px ${palette.accent}`,
          }}
          data-testid="kids-hub-today"
        >
          <div className="flex items-center gap-3 shrink-0">
            <span className="inline-flex items-center justify-center rounded-full"
                  style={{ width: 48, height: 48, background: "rgba(255,255,255,0.22)" }}>
              <Sun size={22} strokeWidth={1.6} />
            </span>
            <div>
              <p className="text-[11px] uppercase tracking-[0.28em] opacity-80">A small daily ritual</p>
              <p className="font-serif text-[22px] sm:text-[24px] leading-snug">
                How are you, really, today?
              </p>
            </div>
          </div>
          <Link to={`/kids-universe/${theme.slug}/daily`}
                data-testid="kids-hub-today-cta"
                className="ml-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-[14px] font-medium transition shrink-0"
                style={{
                  background: "rgba(255,255,255,0.94)",
                  color: palette.accent,
                  boxShadow: "0 6px 14px -6px rgba(0,0,0,0.15)",
                }}>
            Open daily check-in <ArrowRight size={14} />
          </Link>
        </section>

        {/* §KIDS-JOURNEY 2026-02-10 — Anna's directive: stein-på-stein,
            astmekivid läbi kogu lastemaailma. Themed stones per age
            (pebbles / crystals / hexagons), 28 days, click → popup
            with Aurin's tiny message + buttons to daily / activities. */}
        <section className="mb-10" data-testid="kids-hub-journey-section">
          <KidsJourneyPath ageSlug={theme.slug} childSlug={theme.slug} />
        </section>

        {/* ─── Action cards (staggered for spatial feel) ─── */}
        <section
          ref={cardsRef}
          className="kids-hub-cards-grid relative grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-7"
          data-testid="kids-hub-cards"
        >
          {/* §GUIDING-THREAD 2026-02-09 — Artist idea 2 (top pick).
              Curving SVG path behind the staggered cards that
              connects them as a small "journey", echoing Anna's
              stein-på-stein wish without adding new components.
              Pointer-events-none + z-0 keeps it strictly decorative. */}
          <svg
            aria-hidden="true"
            viewBox="0 0 400 700"
            preserveAspectRatio="none"
            className="hidden sm:block pointer-events-none absolute inset-0 w-full h-full z-0"
            style={{ opacity: 0.32 }}
          >
            <defs>
              <linearGradient id={`thread-${theme.slug}`} x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor={palette.accent} stopOpacity="0.55"/>
                <stop offset="100%" stopColor={palette.accent2 || palette.accent} stopOpacity="0.35"/>
              </linearGradient>
            </defs>
            <path
              d="M 90 60 Q 180 120 300 130 T 110 280 Q 60 360 320 410 T 130 600"
              fill="none"
              stroke={`url(#thread-${theme.slug})`}
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeDasharray="2 9"
            />
            {/* Tiny waypoint dots at the natural rest points along
                the curve — like quiet stones in a garden path. */}
            <circle cx="90"  cy="60"  r="3.5" fill={palette.accent} opacity="0.55"/>
            <circle cx="300" cy="130" r="3.5" fill={palette.accent} opacity="0.55"/>
            <circle cx="110" cy="280" r="3.5" fill={palette.accent} opacity="0.55"/>
            <circle cx="320" cy="410" r="3.5" fill={palette.accent} opacity="0.55"/>
            <circle cx="130" cy="600" r="3.5" fill={palette.accent} opacity="0.55"/>
          </svg>
          <HubCard
            theme={theme}
            to={`/aurins-room/${theme.slug}`}
            icon={MessageCircleHeart}
            title={theme.cards.talk.title}
            body={theme.cards.talk.body}
            testid="kids-hub-card-talk"
            primary
          />
          <HubCard
            theme={theme}
            to={STORY_HREF[theme.slug]}
            icon={BookHeart}
            title={theme.cards.story.title}
            body={theme.cards.story.body}
            testid="kids-hub-card-story"
          />
          <HubCard
            theme={theme}
            to={`/kids-universe/${theme.slug}/activities`}
            icon={Compass}
            title="Quiet activities"
            body="Reflect, cook, kindness quests, creative hands — pick what feels right."
            testid="kids-hub-card-activities"
          />
          <HubCard
            theme={theme}
            to="/kids-universe/coloring"
            icon={Palette}
            title={theme.cards.color.title}
            body={theme.cards.color.body}
            testid="kids-hub-card-color"
          />
          <HubCard
            theme={theme}
            to={`/kids-universe/${theme.slug}/stars`}
            icon={Sparkles}
            title={theme.cards.stars.title}
            body={theme.cards.stars.body}
            testid="kids-hub-card-stars"
            badge={balance > 0 ? `${balance} ★` : null}
          />
        </section>

        {/* ─── Gratitude micro-prompt — Little Dreamers only ─── */}
        {theme.gratitudePrompt && (
          <section
            className="mt-12 rounded-2xl p-7 sm:p-8 relative"
            style={{
              background: palette.cardBg,
              border: `1.5px solid ${palette.cardBorder}`,
              boxShadow: `0 12px 28px -16px ${palette.accent}55`,
            }}
            data-testid="kids-hub-gratitude"
          >
            <p
              className="text-[12px] uppercase tracking-[0.24em] mb-2"
              style={{ color: palette.textMuted }}
            >
              A tiny moment
            </p>
            <p
              className="text-[19px] sm:text-[21px] leading-snug max-w-[28ch]"
              style={{
                fontFamily: "'Caveat', cursive",
                color: palette.handwritten,
              }}
            >
              {theme.gratitudePrompt}
            </p>
            <div className="mt-5 flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={gratitude}
                onChange={(e) => setGratitude(e.target.value)}
                placeholder="say it in a few words…"
                data-testid="kids-hub-gratitude-input"
                className="flex-1 px-4 py-3 rounded-xl text-[15px] outline-none transition"
                style={{
                  background: palette.bg,
                  border: `1px solid ${palette.cardBorder}`,
                  color: palette.text,
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") saveGratitude();
                }}
              />
              <button
                type="button"
                onClick={saveGratitude}
                disabled={!gratitude.trim() || gratitudeSaved}
                data-testid="kids-hub-gratitude-save"
                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-[14px] font-medium transition disabled:opacity-60"
                style={{
                  background: palette.accent,
                  color: "#fff",
                  border: `1px solid ${palette.accent}`,
                  boxShadow: `0 6px 16px -8px ${palette.accent}`,
                }}
              >
                {gratitudeSaved ? "Kept safe ♡" : "Keep this"}
                {!gratitudeSaved && <Heart size={14} />}
              </button>
            </div>
            <p
              className="mt-3 text-[12px] italic"
              style={{ color: palette.textMuted }}
            >
              Saved quietly on this device. Only you and a grown-up can see it.
            </p>
          </section>
        )}

        {/* ─── Footer breadcrumb / safety ─── */}
        <footer className="mt-14 flex flex-col sm:flex-row items-center justify-between gap-3">
          <Link
            to="/kids-universe"
            data-testid="kids-hub-back"
            className="inline-flex items-center gap-1.5 text-[13px] tracking-wide"
            style={{ color: palette.textMuted }}
          >
            ← Back to the Kids Universe doorway
          </Link>
          <p
            className="text-[11.5px] italic max-w-[42ch] text-center sm:text-right"
            style={{ color: palette.textMuted }}
          >
            Aurin is a quiet friend, not a parent or doctor. If something
            feels heavy, please tell a grown-up you trust.
          </p>
        </footer>

        {/* §SYNERGY-4 2026-02-10 — Cross-sell whisper for grown-ups.
            A small, quiet doorway to the Parents' Room placed AFTER
            the child's footer so it never competes with the child's
            warm room. Adult tone, sage-muted, single line. */}
        <aside
          className="mt-8 mb-4 pt-6 border-t"
          style={{ borderColor: `${palette.cardBorder}66` }}
          data-testid="kids-hub-parent-cross-sell"
        >
          <Link
            to="/body-temple?utm_source=kids_hub"
            data-testid="kids-hub-parent-house-link"
            className="group block"
            style={{ color: palette.textMuted }}
          >
            <p
              className="text-[10.5px] uppercase tracking-[0.24em] mb-1"
              style={{ color: palette.textMuted, opacity: 0.85 }}
            >
              For the grown-up reading this
            </p>
            <p
              className="text-[15.5px] leading-snug max-w-[52ch]"
              style={{
                fontFamily: "'Caveat', cursive",
                color: palette.handwritten || palette.text,
              }}
            >
              You held space all week. There is a quiet room for you too —{" "}
              <span
                className="border-b border-dotted transition-opacity group-hover:opacity-80"
                style={{ borderColor: palette.accent, color: palette.accent }}
              >
                Body Temple 28 →
              </span>
            </p>
          </Link>
        </aside>
      </div>
    </div>
  );
}

function HubCard({ theme, to, icon: Icon, title, body, testid, primary, badge }) {
  const { palette } = theme;
  // §KIDS-HUB-VISUAL 2026-02-09 — Founder directive (Anna):
  // "klar, vöi semi klar, mitte matt" — brighter cards with a
  // top sheen overlay + golden inner highlight, preserving the
  // age-group palette (palette.accent/cardBg drive the colour).
  return (
    <Link
      to={to}
      data-testid={testid}
      className="hub-card-shine group relative block rounded-2xl p-6 sm:p-7 transition duration-300 hover:-translate-y-1 overflow-hidden z-[1]"
      style={{
        background: primary
          ? `linear-gradient(160deg, ${palette.accent2 || palette.accent} 0%, ${palette.accent} 100%)`
          : `linear-gradient(160deg, #ffffff 0%, ${palette.accent}12 60%, ${palette.accent}22 100%)`,
        border: `1.5px solid ${primary ? palette.accent : palette.cardBorder}`,
        color: primary ? "#FFFFFF" : palette.text,
        boxShadow: primary
          ? `0 16px 36px -14px ${palette.accent}cc, 0 0 0 1px ${palette.accent}44, inset 0 1px 0 rgba(255,255,255,0.4)`
          : `0 10px 24px -14px ${palette.accent}88, 0 0 0 1px ${palette.accent}33, inset 0 1px 0 rgba(255,255,255,0.85)`,
        minHeight: 168,
      }}
    >
      {/* Top sheen — "klar/säravam" effect */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute top-0 left-0 right-0 rounded-t-2xl"
        style={{
          height: "42%",
          background: primary
            ? "linear-gradient(180deg, rgba(255,255,255,0.28) 0%, rgba(255,255,255,0) 100%)"
            : "linear-gradient(180deg, rgba(255,255,255,0.6) 0%, rgba(255,255,255,0) 100%)",
        }}
      />
      {/* Subtle hover-only glow */}
      <span
        aria-hidden="true"
        className="hub-card-glow pointer-events-none absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{
          background: `radial-gradient(circle at 30% 0%, ${palette.accent}33 0%, transparent 60%)`,
        }}
      />
      <div className="relative flex items-start justify-between">
        <span
          className="inline-flex items-center justify-center rounded-full transition-transform duration-300 group-hover:scale-110"
          style={{
            width: 48,
            height: 48,
            background: primary ? "rgba(255,255,255,0.22)" : `linear-gradient(180deg, #ffffff 0%, ${palette.bg} 100%)`,
            border: primary ? "1px solid rgba(255,255,255,0.55)" : `1px solid ${palette.cardBorder}`,
            color: primary ? "#FFFFFF" : palette.accent,
            boxShadow: primary
              ? "0 4px 10px -4px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.4)"
              : `0 4px 10px -4px ${palette.accent}55, inset 0 1px 0 rgba(255,255,255,0.7)`,
          }}
        >
          <Icon size={22} strokeWidth={1.6} />
        </span>
        {badge && (
          <span
            className="text-[12px] font-medium px-2.5 py-1 rounded-full relative"
            style={{
              background: primary ? "rgba(255,255,255,0.25)" : palette.bg,
              color: primary ? "#FFFFFF" : palette.accent,
              border: primary ? "1px solid rgba(255,255,255,0.45)" : `1px solid ${palette.cardBorder}`,
            }}
            data-testid={`${testid}-badge`}
          >
            {badge}
          </span>
        )}
      </div>
      <h3
        className="relative mt-6 text-[22px] sm:text-[24px] leading-snug"
        style={{
          color: primary ? "#FFFFFF" : palette.text,
          fontFamily: "Caveat, Fraunces, serif",
          fontWeight: 600,
          letterSpacing: "0.005em",
        }}
      >
        {title}
      </h3>
      <p
        className="relative mt-2 text-[14px] leading-relaxed"
        style={{
          color: primary ? "rgba(255,255,255,0.94)" : palette.textMuted,
        }}
      >
        {body}
      </p>
      <div
        className="relative mt-5 inline-flex items-center gap-1 text-[13px] font-medium"
        style={{
          color: primary ? "#FFFFFF" : palette.accent,
        }}
      >
        Open
        <ArrowRight
          size={13}
          className="transition-transform duration-300 group-hover:translate-x-1"
        />
      </div>
    </Link>
  );
}
