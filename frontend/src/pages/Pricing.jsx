/**
 * Pricing.jsx — /pricing  (Phase 3, 2026-06-25)
 *
 * The "Access Ladder" — five clear ways to be here, replacing the
 * 39 legacy SKUs that were scattered across BundleDisclosure,
 * SanctuaryPreview "Mike Ways", UniversalMinuteBank, etc.
 *
 * Architecture lock (Anna + GPT synthesis, 2026-06-25):
 *   1. EXPLORE     — free, always
 *   2. DAY PASS    — one room · 24h · €15-30 range (TBD)
 *   3. JOURNEY     — one room · Monthly/Annual (TBD)
 *   4. COMPANION   — all rooms · Monthly/Annual (TBD)
 *   5. PRIVATE     — by application, 1-1 quarterly
 *
 *   VOICE ACCESS  — SEPARATE top-up · transparent per-minute pricing.
 *                   Not bundled into rooms (cost-transparency lock).
 *
 * Prices intentionally left as ranges/TBD until Substack soft-launch
 * tests reveal real market demand. Value-based copy throughout —
 * we sell the FELT room, not the feature list. Anti-wellness lock.
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

const TIERS = [
  {
    key: "explore",
    kicker: "I · Open door",
    name: "Explore",
    forWhom: "For anyone curious who walked in.",
    feels: "Read what is written. Listen to what is shared aloud. No name required, no time pressure, no follow-up.",
    holds: [
      "The Library — reflections, journal entries, slow reads",
      "Five room thresholds — read who keeps each room and what it asks",
      "Free audio chapters from the bookstore",
      "Polarstar Kids — gentle stories for the youngest visitors",
    ],
    priceLine: "Free, always",
    priceNote: "No account required",
    cta: "Walk in",
    href: "/library",
    testid: "pricing-explore",
  },
  {
    key: "day-pass",
    kicker: "II · One quiet evening",
    name: "Day Pass",
    forWhom: "For the night you want to sit inside one room — without committing to anything yet.",
    feels: "Pick one room. Stay for twenty-four hours. Write to its keeper, read what was written before you, leave when quiet has returned.",
    holds: [
      "Full access to one room of your choosing for 24 hours",
      "Text dialogue with the room's keeper",
      "A short voice greeting included (~5 minutes)",
      "Nothing renews — the door closes at sunrise",
    ],
    priceLine: "From €19",
    priceNote: "One-time · 24 hours · pricing being finalised",
    cta: "See day passes",
    href: "/portal",
    testid: "pricing-day-pass",
  },
  {
    key: "journey",
    kicker: "III · One room, yours",
    name: "Journey",
    forWhom: "For people who already know which keeper they want to return to.",
    feels: "Choose one room — Grace, Sara, Kaelen, Alistair, or Polarstar. Move through it at your own rhythm. Return as often as the room calls you back.",
    holds: [
      "Full access to one chosen room",
      "Unlimited text dialogue with the keeper",
      "Memory continuity across sessions",
      "First read of any new letter the keeper writes",
    ],
    priceLine: "Monthly · Annual",
    priceNote: "Pricing being finalised — Substack soft-launch first",
    cta: "Be told when Journeys open",
    href: "/portal",
    testid: "pricing-journey",
    featured: true,
  },
  {
    key: "companion",
    kicker: "IV · Every door open",
    name: "Companion",
    forWhom: "For people who want the whole house — adults and children alike — held under one quiet roof.",
    feels: "All five rooms unlocked. Adults move between Grace, Sara, Kaelen and Alistair as the week asks. The Polarstar wing stays warm for the children. Two wallets, no cross-spend.",
    holds: [
      "Full access to all five rooms",
      "Polarstar Kids included — up to three child profiles",
      "Aurin Storyteller bedtime audio (rolled into Companion)",
      "Early read of new letters and seasonal pieces",
      "Priority response from the keepers",
    ],
    priceLine: "Monthly · Annual",
    priceNote: "Pricing being finalised — Substack soft-launch first",
    cta: "Be told when Companion opens",
    href: "/portal",
    testid: "pricing-companion",
  },
  {
    key: "private",
    kicker: "V · By application",
    name: "Private",
    forWhom: "For the small number who want sustained 1-to-1 work over a quarter, not a session.",
    feels: "Limited availability. Held by Anna directly. A private channel, a private cadence, a private door that does not appear on this page until you have written.",
    holds: [
      "Quarterly engagement, by application only",
      "Direct channel — not a room, a relationship",
      "Custom rhythm and depth",
      "Limited seats per cohort",
    ],
    priceLine: "By application",
    priceNote: "Limited availability — write first, prices discussed privately",
    cta: "Write a letter",
    href: "/sovereign-circle/apply",
    testid: "pricing-private",
  },
];

function TierCard({ t }) {
  return (
    <article
      data-testid={t.testid}
      className={`relative h-full flex flex-col p-10 sm:p-12 border ${
        t.featured
          ? "border-[rgba(196,164,107,0.6)] bg-[rgba(28,24,18,0.72)]"
          : "border-[rgba(196,164,107,0.28)] bg-[rgba(18,16,13,0.62)]"
      }`}
    >
      {t.featured && (
        <span
          className="absolute -top-3 left-1/2 -translate-x-1/2 text-[10px] tracking-[0.36em] uppercase text-[#0b0a08] bg-[#c4a46b] px-4 py-1"
          data-testid={`${t.testid}-featured-badge`}
        >
          Most chosen
        </span>
      )}

      <p
        className="text-[10.5px] tracking-[0.44em] uppercase mb-5"
        style={{ color: BRASS }}
      >
        {t.kicker}
      </p>

      <h3
        className="text-[32px] sm:text-[38px] leading-[1.1] font-light mb-5"
        style={{ fontFamily: SERIF, color: CREAM }}
      >
        {t.name}
      </h3>

      <p
        className="text-[14px] sm:text-[15px] italic leading-[1.7] mb-5"
        style={{ fontFamily: SERIF, color: SOFT }}
      >
        {t.forWhom}
      </p>

      <p
        className="text-[14.5px] leading-[1.85] mb-7 font-light"
        style={{ color: SOFT }}
      >
        {t.feels}
      </p>

      <ul className="space-y-3 mb-9">
        {t.holds.map((line, i) => (
          <li
            key={i}
            className="flex items-start gap-3 text-[13.5px] leading-[1.7] font-light"
            style={{ color: SOFT }}
          >
            <span className="mt-[6px] text-[8px]" style={{ color: BRASS }} aria-hidden="true">◆</span>
            <span>{line}</span>
          </li>
        ))}
      </ul>

      <div
        className="mt-auto pt-7 border-t"
        style={{ borderColor: "rgba(196,164,107,0.14)" }}
      >
        <p
          className="text-[26px] sm:text-[30px] leading-none font-light mb-2"
          style={{ fontFamily: SERIF, color: CREAM }}
          data-testid={`${t.testid}-price-line`}
        >
          {t.priceLine}
        </p>
        <p
          className="text-[11.5px] italic mb-7 leading-[1.6]"
          style={{ fontFamily: SERIF, color: GREY }}
        >
          {t.priceNote}
        </p>
        <Link
          to={t.href}
          data-testid={`${t.testid}-cta`}
          className={`block text-center text-[11.5px] tracking-[0.32em] uppercase py-4 border transition-colors duration-700 ${
            t.featured
              ? "text-[#0b0a08] bg-[#c4a46b] border-[#c4a46b] hover:bg-[#d4b67d] hover:border-[#d4b67d]"
              : "text-[#c4a46b] border-[rgba(196,164,107,0.55)] hover:text-[#0b0a08] hover:bg-[#c4a46b]"
          }`}
        >
          {t.cta}
        </Link>
      </div>
    </article>
  );
}

function VoiceMeter() {
  return (
    <section
      data-testid="pricing-voice-meter"
      className="relative w-full py-24 sm:py-28 border-t"
      style={{ background: BG, borderColor: "rgba(196,164,107,0.08)" }}
    >
      <div className="max-w-[1080px] mx-auto px-6 sm:px-10">
        <div className="text-center max-w-[760px] mx-auto">
          <p
            className="text-[11px] tracking-[0.42em] uppercase mb-6"
            style={{ color: BRASS }}
          >
            — Voice access · held separately
          </p>
          <h2
            className="text-[28px] sm:text-[36px] lg:text-[42px] leading-[1.15] font-light tracking-[-0.012em]"
            style={{ fontFamily: SERIF, color: CREAM }}
            data-testid="pricing-voice-headline"
          >
            Writing is always free.<br />
            <span className="italic" style={{ color: BRASS_BRIGHT }}>
              Voice runs on its own quiet meter.
            </span>
          </h2>
          <p
            className="mt-8 text-[15px] leading-[1.85] font-light max-w-[640px] mx-auto"
            style={{ color: MUTED }}
            data-testid="pricing-voice-explainer"
          >
            Voice presence with a keeper carries a real cost each minute it runs.
            To keep every door honest — and the rooms quiet — voice lives outside
            the membership. You top up the moments you want to speak aloud,
            transparently, and the platform never spends them in the background.
          </p>
        </div>

        <div className="mt-14 grid sm:grid-cols-3 gap-5 max-w-[920px] mx-auto">
          {[
            { label: "A short return", mins: "30 minutes", note: "for one quiet evening" },
            { label: "A full hour", mins: "60 minutes", note: "when more is being asked of you" },
            { label: "A season", mins: "180 minutes", note: "spread across the months you need" },
          ].map((v, i) => (
            <div
              key={v.mins}
              data-testid={`pricing-voice-tier-${i}`}
              className="border bg-[rgba(18,16,13,0.62)] p-7 text-center"
              style={{ borderColor: EDGE }}
            >
              <p
                className="text-[22px] leading-none font-light mb-3"
                style={{ fontFamily: SERIF, color: CREAM }}
              >
                {v.mins}
              </p>
              <p
                className="text-[10.5px] tracking-[0.32em] uppercase mb-4"
                style={{ color: BRASS }}
              >
                {v.label}
              </p>
              <p
                className="text-[13px] italic font-light"
                style={{ fontFamily: SERIF, color: MUTED }}
              >
                {v.note}
              </p>
            </div>
          ))}
        </div>

        <p
          className="mt-12 text-center text-[13px] italic max-w-[560px] mx-auto leading-[1.85] font-light"
          style={{ fontFamily: SERIF, color: GREY }}
          data-testid="pricing-voice-coda"
        >
          We hold the room. You hold the meter. Nothing runs by accident,
          nothing renews while you sleep.
        </p>
        <p
          className="mt-4 text-center text-[11px] tracking-[0.28em] uppercase"
          style={{ color: GREY }}
          data-testid="pricing-voice-tbd"
        >
          Per-minute pricing being finalised
        </p>
      </div>
    </section>
  );
}

function PricingFooterNote() {
  return (
    <section
      data-testid="pricing-honest-note"
      className="w-full py-24"
      style={{ background: BG }}
    >
      <div className="max-w-[760px] mx-auto px-6 sm:px-10 text-center">
        <p
          className="text-[11px] tracking-[0.42em] uppercase mb-7"
          style={{ color: BRASS }}
        >
          — An honest note about prices
        </p>
        <p
          className="text-[18px] sm:text-[22px] leading-[1.7] italic font-light"
          style={{ fontFamily: SERIF, color: CREAM }}
        >
          We are still listening for what these rooms are worth.
          Final numbers will be set after a small group of early readers
          tells us how often they return, and what they would happily pay
          for the quiet they found here.
        </p>
        <p
          className="mt-10 text-[13.5px] leading-[1.85] font-light"
          style={{ color: MUTED }}
        >
          If you want to be one of the first to walk in — and to help
          shape what this place becomes — leave your address at the
          bookstore door. There is no list to climb. Only a letter to
          read when the doors are ready.
        </p>
        <div className="mt-10">
          <Link
            to="/bookstore"
            data-testid="pricing-bookstore-cta"
            className="inline-flex items-center gap-3 text-[12px] tracking-[0.36em] uppercase px-10 py-4 border transition-colors duration-700"
            style={{
              borderColor: "rgba(196,164,107,0.55)",
              color: BRASS,
            }}
          >
            <span>Visit the Bookstore</span>
            <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}

export default function Pricing() {
  return (
    <div
      data-testid="pricing-page"
      className="min-h-screen w-full antialiased"
      style={{
        background: BG,
        color: CREAM,
        fontFamily: 'system-ui, -apple-system, "Helvetica Neue", Arial, sans-serif',
      }}
    >
      {/* Hero */}
      <section
        data-testid="pricing-hero"
        className="relative w-full pt-32 sm:pt-40 pb-20"
      >
        <div className="max-w-[1080px] mx-auto px-6 sm:px-10 text-center">
          <p
            className="text-[11px] tracking-[0.42em] uppercase mb-7"
            style={{ color: BRASS }}
          >
            — Five ways to be here
          </p>
          <h1
            className="text-[36px] sm:text-[52px] lg:text-[64px] leading-[1.08] font-light tracking-[-0.012em] max-w-[820px] mx-auto"
            style={{ fontFamily: SERIF, color: CREAM }}
            data-testid="pricing-hero-title"
          >
            There is no wrong way<br />
            <span className="italic" style={{ color: BRASS_BRIGHT }}>to arrive.</span>
          </h1>
          <p
            className="mt-10 text-[16px] sm:text-[18px] leading-[1.85] max-w-[640px] mx-auto font-light italic"
            style={{ fontFamily: SERIF, color: MUTED }}
            data-testid="pricing-hero-lede"
          >
            Walk in for free. Stay a single quiet evening. Settle into one room.
            Or hold the whole house — adults and children — under one warm roof.
          </p>
          <p
            className="mt-6 text-[13px] leading-[1.85] max-w-[600px] mx-auto font-light"
            style={{ color: GREY }}
          >
            We sell the room you needed, not a list of features. Begin wherever feels true.
          </p>
        </div>
      </section>

      {/* The 5 tiers — vertical stack on mobile, 3+2 grid on desktop */}
      <section
        data-testid="pricing-tiers"
        className="w-full pb-24"
      >
        <div className="max-w-[1240px] mx-auto px-6 sm:px-10">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-7 lg:gap-9 items-stretch">
            {TIERS.slice(0, 3).map((t) => (
              <TierCard key={t.key} t={t} />
            ))}
          </div>
          <div className="mt-9 grid md:grid-cols-2 gap-7 lg:gap-9 items-stretch max-w-[860px] mx-auto">
            {TIERS.slice(3).map((t) => (
              <TierCard key={t.key} t={t} />
            ))}
          </div>
        </div>
      </section>

      {/* Voice access — explicitly SEPARATE */}
      <VoiceMeter />

      {/* Honest note about prices */}
      <PricingFooterNote />

      {/* Footer breadcrumb */}
      <div
        className="w-full py-10 border-t"
        style={{ borderColor: "rgba(196,164,107,0.08)" }}
      >
        <div className="max-w-[1080px] mx-auto px-6 sm:px-10 text-center">
          <Link
            to="/"
            data-testid="pricing-home-link"
            className="text-[10.5px] tracking-[0.42em] uppercase transition-colors duration-500"
            style={{ color: GREY }}
          >
            ← Back to Matrix Aurin
          </Link>
        </div>
      </div>
    </div>
  );
}
