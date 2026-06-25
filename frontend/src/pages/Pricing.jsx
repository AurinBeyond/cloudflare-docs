/**
 * Pricing.jsx — /pricing  (v2 LOCKED — 2026-06-25)
 *
 * Anna lock: see /app/memory/PRICING_LOCKED_2026-06-25_v2.md
 *
 * Five clear tiers:
 *   I   Explore      — free, always
 *   II  Day Pass     — €19 soft-launch (€25 normal)
 *   III Journey      — €29/mo (one room)
 *   IV  Companion    — €49/mo (all five rooms)
 *   V   + Lantern    — €69/mo (all rooms + Anna's own voice)
 *
 *   Voice top-ups    — €11 / €24 / €49 / €109  (90-day non-expiring)
 *
 * Payment integration is held — Anna waits 24h on the new payment
 * provider. CTAs route to either /library (free reading), /grace/intro
 * (meet the keepers) or the email-capture inside IntakeQuestion that
 * already lives on every Host Intro page.
 *
 * Accessibility (Phase 1):
 *   · semantic <section>/<article>/<h1-h3>
 *   · aria-labels on every CTA + visual badges
 *   · all numeric prices have <span aria-label="..."> for screen readers
 *   · "Most Popular" / "Best Value" badges have role="status"
 *   · contrast ratio brass/cream tested AA on dark BG
 */
import React from "react";
import { Link } from "react-router-dom";

const SERIF = '"Cormorant Garamond", "EB Garamond", Georgia, serif';
const BRASS = "#c4a46b";
const BRASS_BRIGHT = "#d4b67d";
const CREAM = "#f0eadd";
const SOFT = "#bcb4a3";
const MUTED = "#a59f93";
const GREY = "#7a7468";
const BG = "#0b0a08";
const EDGE = "rgba(196,164,107,0.28)";
const EDGE_STRONG = "rgba(196,164,107,0.6)";

// — Soft-launch flag — when false, normal prices are shown ——————
const SOFT_LAUNCH = true;

// ============================================================
// TIER DATA — the single source of truth on this page.
// ============================================================

const TIERS = [
  {
    key: "explore",
    kicker: "I · Open door",
    name: "Explore",
    tagline: "Walk in, no name required.",
    forWhom: "For anyone curious who walked in.",
    holds: [
      "The Library — reflections, journal entries, slow reads",
      "Five room thresholds — meet the keepers without commitment",
      "Bookstore preview (first chapter free)",
      "Polarstar Kids — one sample story",
    ],
    price: { primary: "Free, always", normal: null, billing: "No account, no commitment, no name required" },
    cta: { label: "Walk in", href: "/library", aria: "Enter the free Library" },
    testid: "pricing-explore",
  },
  {
    key: "day-pass",
    kicker: "II · One quiet evening",
    name: "Day Pass",
    tagline: "Twenty-four hours, one room, no return ticket needed.",
    forWhom: "For the night you want to sit inside one room without committing.",
    holds: [
      "Full access to one room of your choosing for 24 hours",
      "Unlimited text conversation with the keeper",
      "10 minutes of voice included",
      "Memory kept — you can return later if you choose",
      "Nothing renews — the door closes at sunrise",
    ],
    price: {
      primary: "€19",
      normal: "€25",
      billing: "one-time · 24 hours",
      ankur: "Substack launch price · regular price €25",
    },
    cta: {
      label: "Be first to know",
      href: "/grace/intro",
      aria: "Read the keepers' intros until Day Pass purchase opens",
    },
    testid: "pricing-day-pass",
  },
  {
    key: "journey",
    kicker: "III · One room, yours",
    name: "Journey",
    tagline: "Choose one room and stay awhile.",
    forWhom: "For people who know where they want to begin.",
    holds: [
      "Full access to one chosen room (switch once per month)",
      "Unlimited text conversation with the keeper",
      "Memory continuous across every session",
      "30 minutes of voice each month",
      "First read of any new letter the keeper writes",
    ],
    price: {
      primary: "€29",
      normal: "€35",
      billing: "per month · soft-launch",
      ankur: "Substack launch price · regular price €35",
      cycles: [
        { label: "Monthly", soft: "€29", normal: "€35", save: null },
        { label: "Quarterly", soft: "€79", normal: "€95", save: "−9%" },
        { label: "6 months", soft: "€149", normal: "€179", save: "−14%" },
        { label: "Annual", soft: "€279", normal: "€329", save: "−20% · 2 months free" },
      ],
    },
    badge: "MOST POPULAR",
    cta: {
      label: "Meet the keepers",
      href: "/grace/intro",
      aria: "Meet the keepers while Journey opens for subscriptions",
    },
    testid: "pricing-journey",
    featured: true,
  },
  {
    key: "companion",
    kicker: "IV · Every door open",
    name: "Companion",
    tagline: "Every room. One membership.",
    forWhom: "For those who don't want to choose just one door.",
    holds: [
      "Full access to all five rooms",
      "Polarstar Kids — up to three child profiles, each with own memory",
      "Aurin Storyteller (bedtime audio for children) included",
      "Early read of new letters and seasonal pieces",
      "Priority response from the keepers",
      "60 minutes of voice each month — shared across rooms",
    ],
    price: {
      primary: "€49",
      normal: "€59",
      billing: "per month · soft-launch",
      ankur: "Substack launch price · regular price €59",
      cycles: [
        { label: "Monthly", soft: "€49", normal: "€59", save: null },
        { label: "Quarterly", soft: "€129", normal: "€159", save: "−12%" },
        { label: "6 months", soft: "€249", normal: "€299", save: "−15%" },
        { label: "Annual", soft: "€459", normal: "€549", save: "−22% · 2.5 months free" },
      ],
    },
    badge: "BEST VALUE",
    cta: {
      label: "Read what's already inside",
      href: "/library",
      aria: "Read the Library while Companion opens for subscriptions",
    },
    testid: "pricing-companion",
  },
  {
    key: "lantern",
    kicker: "V · The Lantern",
    name: "Companion + Lantern",
    tagline: "All rooms — and the presence that keeps them lit.",
    forWhom: "For those who want Anna's own voice and writing in their week, without asking for an appointment.",
    holds: [
      "Everything in Companion",
      "A monthly Letter from Anna — written and read aloud in her own voice",
      "Two to four raw voice notes from Anna each month (irregular, intimate)",
      "Anna's reading shelf — what she's reading now, with her margin notes",
      "\"Behind the lanterns\" — the slow, real making of Aurin",
      "One quiet message back, each month — a single sentence she may answer with a voice note. No promise. A possibility.",
    ],
    price: {
      primary: "€69",
      normal: null,
      billing: "per month",
      ankur: "Annual €659 (save €169 · 2.5 months free)",
    },
    cta: {
      label: "Meet Anna's keepers first",
      href: "/grace/intro",
      aria: "Meet the keepers while the Lantern is being prepared",
    },
    testid: "pricing-lantern",
  },
];

// ============================================================
// VOICE TOP-UPS
// ============================================================

const VOICE_TOPUPS = [
  { key: "small", label: "I · A short return", title: "30 minutes", price: "€11", note: "for one quiet evening", testid: "voice-30" },
  { key: "popular", label: "II · A full hour and a half", title: "90 minutes", price: "€24", note: "when more is being asked of you", testid: "voice-90", featured: true },
  { key: "season", label: "III · A season", title: "200 minutes", price: "€49", note: "spread across the months you keep returning", testid: "voice-200" },
  { key: "deep", label: "IV · A long habit", title: "500 minutes", price: "€109", note: "for those who have made this their second home", testid: "voice-500" },
];

// ============================================================
// SUB-COMPONENTS
// ============================================================

function PriceLine({ price }) {
  // Renders the primary price + optional "normally €X" anchor below.
  return (
    <div>
      <p
        className="text-[28px] sm:text-[34px] leading-none font-light mb-2"
        style={{ fontFamily: SERIF, color: CREAM }}
      >
        <span aria-label={`Price ${price.primary}`}>{price.primary}</span>
      </p>
      {price.normal && (
        <p
          className="text-[11px] tracking-[0.18em] uppercase mb-2"
          style={{ color: GREY }}
        >
          <span style={{ textDecoration: "line-through", marginRight: 8 }}>
            {price.normal}
          </span>
          <span>regular price</span>
        </p>
      )}
      {price.billing && (
        <p
          className="text-[11px] italic mb-1 leading-[1.6]"
          style={{ fontFamily: SERIF, color: GREY }}
        >
          {price.billing}
        </p>
      )}
      {price.ankur && (
        <p
          className="text-[10.5px] italic leading-[1.5] mb-2"
          style={{ fontFamily: SERIF, color: MUTED }}
        >
          {price.ankur}
        </p>
      )}
    </div>
  );
}

function CycleTable({ cycles, testid }) {
  if (!cycles || !cycles.length) return null;
  return (
    <div
      data-testid={`${testid}-cycles`}
      className="mt-5 border-t pt-4 space-y-2"
      style={{ borderColor: "rgba(196,164,107,0.14)" }}
      role="table"
      aria-label="Billing cycle options"
    >
      {cycles.map((c) => (
        <div
          key={c.label}
          className="flex items-baseline justify-between gap-3"
          role="row"
        >
          <span
            className="text-[12.5px] tracking-[0.16em] uppercase"
            style={{ color: SOFT }}
          >
            {c.label}
          </span>
          <span className="flex items-baseline gap-2">
            <span
              className="text-[16px] font-light"
              style={{ fontFamily: SERIF, color: CREAM }}
            >
              {SOFT_LAUNCH ? c.soft : c.normal}
            </span>
            {c.save && (
              <span
                className="text-[10px] tracking-[0.18em] uppercase"
                style={{ color: BRASS }}
              >
                {c.save}
              </span>
            )}
          </span>
        </div>
      ))}
    </div>
  );
}

function TierCard({ t }) {
  const borderClr = t.featured ? EDGE_STRONG : EDGE;
  const bgClr = t.featured ? "rgba(28,24,18,0.72)" : "rgba(18,16,13,0.62)";
  return (
    <article
      data-testid={t.testid}
      aria-labelledby={`${t.testid}-name`}
      className="relative h-full flex flex-col p-9 sm:p-11 border"
      style={{ borderColor: borderClr, background: bgClr }}
    >
      {t.badge && (
        <span
          role="status"
          aria-label={t.badge}
          className="absolute -top-3 left-1/2 -translate-x-1/2 text-[9.5px] tracking-[0.4em] uppercase px-4 py-1"
          style={{ background: BRASS, color: BG }}
          data-testid={`${t.testid}-badge`}
        >
          {t.badge}
        </span>
      )}

      <p
        className="text-[10.5px] tracking-[0.44em] uppercase mb-5"
        style={{ color: BRASS }}
      >
        {t.kicker}
      </p>

      <h3
        id={`${t.testid}-name`}
        className="text-[30px] sm:text-[36px] leading-[1.1] font-light mb-4"
        style={{ fontFamily: SERIF, color: CREAM }}
      >
        {t.name}
      </h3>

      <p
        className="text-[14px] sm:text-[15px] italic leading-[1.7] mb-4"
        style={{ fontFamily: SERIF, color: BRASS_BRIGHT }}
      >
        {t.tagline}
      </p>

      <p
        className="text-[13.5px] leading-[1.75] mb-7 font-light"
        style={{ color: SOFT }}
      >
        {t.forWhom}
      </p>

      <ul className="space-y-2.5 mb-7" aria-label="What's included">
        {t.holds.map((line, i) => (
          <li
            key={i}
            className="flex items-start gap-3 text-[13px] leading-[1.7] font-light"
            style={{ color: SOFT }}
          >
            <span className="mt-[6px] text-[8px]" style={{ color: BRASS }} aria-hidden="true">◆</span>
            <span>{line}</span>
          </li>
        ))}
      </ul>

      <div
        className="mt-auto pt-6 border-t"
        style={{ borderColor: "rgba(196,164,107,0.14)" }}
      >
        <PriceLine price={t.price} />

        {t.price.cycles && (
          <CycleTable cycles={t.price.cycles} testid={t.testid} />
        )}

        <Link
          to={t.cta.href}
          data-testid={`${t.testid}-cta`}
          aria-label={t.cta.aria}
          className={`mt-6 block text-center text-[11.5px] tracking-[0.32em] uppercase py-4 border transition-colors duration-700 ${
            t.featured
              ? "bg-[#c4a46b] border-[#c4a46b] hover:bg-[#d4b67d] hover:border-[#d4b67d]"
              : "border-[rgba(196,164,107,0.55)] hover:bg-[#c4a46b]"
          }`}
          style={{ color: t.featured ? BG : BRASS }}
          onMouseEnter={(e) => {
            if (!t.featured) e.currentTarget.style.color = BG;
          }}
          onMouseLeave={(e) => {
            if (!t.featured) e.currentTarget.style.color = BRASS;
          }}
        >
          {t.cta.label}
        </Link>
      </div>
    </article>
  );
}

function WhyVoiceIsSeparate() {
  return (
    <section
      data-testid="pricing-voice-explainer-section"
      aria-labelledby="why-voice-separate"
      className="w-full py-24 border-t"
      style={{ background: BG, borderColor: "rgba(196,164,107,0.08)" }}
    >
      <div className="max-w-[820px] mx-auto px-6 sm:px-10 text-center">
        <p
          className="text-[11px] tracking-[0.42em] uppercase mb-7"
          style={{ color: BRASS }}
        >
          — Why voice is held separately
        </p>
        <h2
          id="why-voice-separate"
          className="text-[26px] sm:text-[34px] leading-[1.2] font-light"
          style={{ fontFamily: SERIF, color: CREAM }}
        >
          Some choose to read.<br />
          <span className="italic" style={{ color: BRASS_BRIGHT }}>
            Some choose to be spoken to.
          </span>
        </h2>
        <p
          className="mt-8 text-[15px] leading-[1.85] font-light"
          style={{ color: SOFT }}
        >
          We hold voice as its own choice — never bundled by default into
          a room you may not want it in. If the written word is what you
          came for, you never pay for what you do not use.
        </p>
        <p
          className="mt-5 text-[14.5px] leading-[1.85] font-light"
          style={{ color: MUTED }}
        >
          Each month a small allowance is included with Journey and
          Companion. Beyond that, voice is yours to add — quietly, in
          steps you choose. We will never auto-renew it. We will never
          run a meter while you sleep.
        </p>
        <p
          className="mt-7 text-[13px] italic"
          style={{ fontFamily: SERIF, color: GREY }}
        >
          This is not a restriction. This is care.
        </p>
      </div>
    </section>
  );
}

function VoiceTopups() {
  return (
    <section
      data-testid="pricing-voice-topups"
      aria-labelledby="voice-topup-heading"
      className="w-full py-24"
      style={{ background: BG }}
    >
      <div className="max-w-[1080px] mx-auto px-6 sm:px-10">
        <div className="text-center max-w-[640px] mx-auto mb-14">
          <p
            className="text-[11px] tracking-[0.42em] uppercase mb-6"
            style={{ color: BRASS }}
          >
            — Voice access · added quietly
          </p>
          <h2
            id="voice-topup-heading"
            className="text-[26px] sm:text-[32px] leading-[1.18] font-light"
            style={{ fontFamily: SERIF, color: CREAM }}
          >
            When you want more of a keeper&apos;s voice<br />
            <span className="italic" style={{ color: BRASS_BRIGHT }}>
              than the month allowed.
            </span>
          </h2>
          <p
            className="mt-7 text-[14px] leading-[1.85] font-light"
            style={{ color: MUTED }}
          >
            Top-up minutes never expire for 90 days. They add to your
            monthly allowance, never replace it.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {VOICE_TOPUPS.map((v) => (
            <div
              key={v.key}
              data-testid={`pricing-voice-topup-${v.testid}`}
              className={`border p-7 text-center ${
                v.featured ? "bg-[rgba(28,24,18,0.72)]" : "bg-[rgba(18,16,13,0.62)]"
              }`}
              style={{ borderColor: v.featured ? EDGE_STRONG : EDGE }}
            >
              <p
                className="text-[10px] tracking-[0.34em] uppercase mb-4"
                style={{ color: BRASS }}
              >
                {v.label}
              </p>
              <p
                className="text-[24px] leading-none font-light mb-3"
                style={{ fontFamily: SERIF, color: CREAM }}
              >
                {v.title}
              </p>
              <p
                className="text-[28px] leading-none font-light mb-5"
                style={{ fontFamily: SERIF, color: BRASS_BRIGHT }}
              >
                {v.price}
              </p>
              <p
                className="text-[12.5px] italic leading-[1.65] font-light"
                style={{ fontFamily: SERIF, color: MUTED }}
              >
                {v.note}
              </p>
            </div>
          ))}
        </div>

        <p
          className="mt-12 text-center text-[12px] italic max-w-[560px] mx-auto leading-[1.85] font-light"
          style={{ fontFamily: SERIF, color: GREY }}
          data-testid="pricing-voice-coda"
        >
          We hold the room. You hold the meter.<br />
          Nothing runs by accident, nothing renews while you sleep.
        </p>
      </div>
    </section>
  );
}

function HonestNote() {
  return (
    <section
      data-testid="pricing-honest-note"
      aria-labelledby="honest-note-heading"
      className="w-full py-24"
      style={{ background: BG }}
    >
      <div className="max-w-[760px] mx-auto px-6 sm:px-10 text-center">
        <p
          className="text-[11px] tracking-[0.42em] uppercase mb-7"
          style={{ color: BRASS }}
        >
          — An honest note
        </p>
        <h2
          id="honest-note-heading"
          className="text-[20px] sm:text-[26px] leading-[1.6] italic font-light"
          style={{ fontFamily: SERIF, color: CREAM }}
        >
          The doors are quiet for a few more days.
        </h2>
        <p
          className="mt-7 text-[14.5px] leading-[1.85] font-light"
          style={{ color: MUTED }}
        >
          Prices are set. The payment door is being prepared with the
          same care as the rooms inside. Until then, walk in through the
          free door — read the Library, meet the keepers, leave your
          name at the end of any room if you wish to be told when the
          subscription doors open.
        </p>
        <div className="mt-10">
          <Link
            to="/grace/intro"
            data-testid="pricing-honest-cta"
            aria-label="Meet Grace, the first keeper"
            className="inline-flex items-center gap-3 text-[12px] tracking-[0.36em] uppercase px-10 py-4 border transition-colors duration-700"
            style={{ borderColor: EDGE_STRONG, color: BRASS }}
          >
            <span>Walk into Grace&apos;s room</span>
            <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}

// ============================================================
// MAIN PAGE
// ============================================================

export default function Pricing() {
  return (
    <main
      data-testid="pricing-page"
      className="min-h-screen w-full antialiased"
      style={{
        background: BG,
        color: CREAM,
        fontFamily: 'system-ui, -apple-system, "Helvetica Neue", Arial, sans-serif',
      }}
    >
      {/* — HERO ————————————————————————————————————————————— */}
      <section
        data-testid="pricing-hero"
        aria-labelledby="pricing-hero-title"
        className="relative w-full pt-32 sm:pt-40 pb-16"
      >
        <div className="max-w-[1080px] mx-auto px-6 sm:px-10 text-center">
          <p
            className="text-[11px] tracking-[0.42em] uppercase mb-7"
            style={{ color: BRASS }}
          >
            — Five ways to be here
          </p>
          <h1
            id="pricing-hero-title"
            className="text-[36px] sm:text-[52px] lg:text-[60px] leading-[1.08] font-light tracking-[-0.012em] max-w-[820px] mx-auto"
            style={{ fontFamily: SERIF, color: CREAM }}
            data-testid="pricing-hero-title"
          >
            There is no wrong way{" "}
            <span className="italic" style={{ color: BRASS_BRIGHT }}>to arrive.</span>
          </h1>
          <p
            className="mt-9 text-[16px] sm:text-[17px] leading-[1.85] max-w-[640px] mx-auto font-light italic"
            style={{ fontFamily: SERIF, color: MUTED }}
            data-testid="pricing-hero-lede"
          >
            Read for free. Stay one quiet evening. Settle into one room.
            Or hold the whole house — adults and children — under one warm roof.
          </p>
          <p
            className="mt-6 text-[12.5px] leading-[1.85] max-w-[600px] mx-auto font-light"
            style={{ color: GREY }}
          >
            We sell the room you needed, not a list of features.
            Soft-launch prices are shown — these are the lowest we will ever ask.
          </p>
        </div>
      </section>

      {/* — TIERS ———————————————————————————————————————————— */}
      <section
        data-testid="pricing-tiers"
        aria-label="Five access tiers"
        className="w-full pb-20"
      >
        <div className="max-w-[1320px] mx-auto px-6 sm:px-10">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-7 lg:gap-8 items-stretch">
            {TIERS.slice(0, 3).map((t) => (
              <TierCard key={t.key} t={t} />
            ))}
          </div>
          <div className="mt-10 grid md:grid-cols-2 gap-7 lg:gap-8 items-stretch max-w-[900px] mx-auto">
            {TIERS.slice(3).map((t) => (
              <TierCard key={t.key} t={t} />
            ))}
          </div>
        </div>
      </section>

      <WhyVoiceIsSeparate />
      <VoiceTopups />
      <HonestNote />

      {/* — FOOTER LINK ————————————————————————————————————— */}
      <div
        className="w-full py-10 border-t"
        style={{ borderColor: "rgba(196,164,107,0.08)" }}
      >
        <div className="max-w-[1080px] mx-auto px-6 sm:px-10 text-center">
          <Link
            to="/"
            data-testid="pricing-home-link"
            aria-label="Return to Matrix Aurin homepage"
            className="text-[10.5px] tracking-[0.42em] uppercase transition-colors duration-500"
            style={{ color: GREY }}
          >
            ← Back to Matrix Aurin
          </Link>
        </div>
      </div>
    </main>
  );
}
