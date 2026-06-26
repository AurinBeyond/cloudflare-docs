/**
 * StartHere.jsx — `/start-here`
 *
 * §SPRINT-1+2 2026-02 — "Less Noise. More Meaning." Sprint 0 placed a
 * primary `Start Here` CTA in the homepage hero. This page is where that
 * CTA lands. One quiet door, three paths, three 3-minute first steps,
 * then a single secondary CTA into the matching room.
 *
 * Locked rules (mockup at /app/memory/START_HERE_v2.md):
 *  - 100% English UI.
 *  - No "platform", "tools", "users", "digital", "wellness", "course".
 *  - Anti-SaaS. Quiet library, not a B2B onboarding flow.
 *  - Each 3-min step is an actual audio that exists in this site today.
 *  - Each "next room" is an actual route that exists today.
 *  - No pricing, no email capture, no third paid path.
 */
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const SERIF = '"Cormorant Garamond", "EB Garamond", Georgia, serif';

const COLORS = {
  bg: "#0b0a08",
  ivory: "#f0eadd",
  ivoryMute: "#d9d3c5",
  muted: "#bcb4a3",
  brass: "#c4a46b",
  brassBright: "#d4b67d",
  border: "rgba(196, 164, 107, 0.32)",
  borderSoft: "rgba(196, 164, 107, 0.14)",
};

const PATHS = [
  {
    id: "for-yourself",
    numeral: "I",
    label: "For Yourself",
    cameWith: "too many thoughts.",
    needs: "one thought clearer.",
    why:
      "When the day has been loud, and you just need a quiet corner to put something down before you go to sleep.",
    listenTitle: "The Coat on the Chair",
    listenLine:
      "A short evening story about the small things that wait quietly for you to come back to yourself.",
    listenRoute: "/listen/hearth/the-coat-on-the-chair",
    listenLabel: "Listen now · 6 min",
    roomLabel: "Enter Grace's room",
    roomRoute: "/clarity-release",
    roomLine:
      "Slow reflection. Reading. Clarity work. The room most people come back to when life asks too much.",
  },
  {
    id: "as-a-parent",
    numeral: "II",
    label: "As a Parent",
    cameWith: "a hard conversation at home.",
    needs: "one new way to begin it.",
    why:
      "For the parent who wants the evening to be quieter — without becoming the one who has to perform calm for everyone else.",
    listenTitle: "The Sock on the Stairs",
    listenLine:
      "A short Hearth story about the moment you walk past the small thing on the stairs — and what happens if you stop and pick it up.",
    listenRoute: "/listen/hearth/the-sock-on-the-stairs",
    listenLabel: "Listen now · 6 min",
    roomLabel: "Enter The Hearth",
    roomRoute: "/the-hearth",
    roomLine:
      "The full Hearth Protocol — five quiet evening stories built for households who want a softer landing into the night.",
  },
  {
    id: "together",
    numeral: "III",
    label: "For Your Family",
    cameWith: "an evening that disappeared.",
    needs: "one shared moment back.",
    why:
      "For the household that wants one quiet minute together before sleep — without screens, without performance.",
    listenTitle: "Little Star",
    listenLine:
      "A gentle bedtime listen for the youngest one in the room — and for whoever is sitting beside them.",
    listenRoute: "/listen/little-star",
    listenLabel: "Listen as a family · 2 min",
    roomLabel: "Enter Polarstar",
    roomRoute: "/kids-universe/polarstar",
    roomLine:
      "Polarstar Kids — bedtime stories, quiet activities, and a parent-managed evening rhythm.",
  },
];

// One card — uses the same anatomy for all three paths so the eye learns
// the rhythm: eyebrow → from/to → why → 3-minute audio → room.
function PathCard({ path }) {
  return (
    <article
      data-testid={`start-here-card-${path.id}`}
      className="relative h-full flex flex-col p-9 sm:p-11"
      style={{
        background: "rgba(18, 16, 13, 0.62)",
        border: `1px solid ${COLORS.border}`,
      }}
    >
      {/* Brass corner accent — matches the Inner/Outer cards on `/` */}
      <span
        aria-hidden="true"
        className="absolute top-0 left-0 w-12 h-px"
        style={{ background: COLORS.brass }}
      />
      <span
        aria-hidden="true"
        className="absolute top-0 left-0 w-px h-12"
        style={{ background: COLORS.brass }}
      />

      <p
        className="text-[10.5px] tracking-[0.44em] uppercase mb-7"
        style={{ color: COLORS.brass, fontFamily: SERIF }}
      >
        {path.numeral} · {path.label}
      </p>

      <h2
        className="text-[24px] sm:text-[26px] leading-[1.25] font-light mb-8"
        style={{ color: COLORS.ivory, fontFamily: SERIF }}
      >
        <span style={{ color: COLORS.muted }} className="italic">
          {path.cameWith}
        </span>
        <br />
        <span style={{ color: COLORS.brassBright }}>{path.needs}</span>
      </h2>

      <p
        className="text-[15px] sm:text-[15.5px] leading-[1.75] font-light mb-9"
        style={{ color: COLORS.muted }}
      >
        {path.why}
      </p>

      {/* Divider */}
      <div
        aria-hidden="true"
        className="w-full h-px mb-7"
        style={{ background: COLORS.borderSoft }}
      />

      <p
        className="text-[10.5px] tracking-[0.32em] uppercase mb-3"
        style={{ color: COLORS.brass }}
      >
        A short evening first step
      </p>
      <p
        className="text-[19px] sm:text-[20px] leading-[1.4] mb-3 italic"
        style={{ color: COLORS.ivory, fontFamily: SERIF }}
      >
        {path.listenTitle}
      </p>
      <p
        className="text-[14.5px] leading-[1.7] font-light mb-7"
        style={{ color: COLORS.muted }}
      >
        {path.listenLine}
      </p>

      <Link
        to={path.listenRoute}
        data-testid={`start-here-listen-${path.id}`}
        className="inline-flex items-center justify-center text-[12px] tracking-[0.32em] uppercase px-8 py-4 mb-8 font-medium transition-all duration-500 hover:-translate-y-px"
        style={{
          background: COLORS.brass,
          color: "#0b0a08",
          border: `1px solid ${COLORS.brass}`,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = COLORS.brassBright;
          e.currentTarget.style.borderColor = COLORS.brassBright;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = COLORS.brass;
          e.currentTarget.style.borderColor = COLORS.brass;
        }}
      >
        {path.listenLabel}
      </Link>

      {/* Pushes the room section to the bottom so all 3 cards align */}
      <div className="flex-grow" />

      <div
        aria-hidden="true"
        className="w-full h-px mb-7"
        style={{ background: COLORS.borderSoft }}
      />

      <p
        className="text-[10.5px] tracking-[0.32em] uppercase mb-3"
        style={{ color: COLORS.brass }}
      >
        When you are ready
      </p>
      <p
        className="text-[14.5px] leading-[1.7] font-light mb-5"
        style={{ color: COLORS.muted }}
      >
        {path.roomLine}
      </p>
      <Link
        to={path.roomRoute}
        data-testid={`start-here-room-${path.id}`}
        className="inline-flex items-center justify-center text-[11px] tracking-[0.32em] uppercase px-6 py-3.5 transition-colors duration-500"
        style={{
          color: COLORS.brass,
          border: `1px solid ${COLORS.border}`,
          background: "transparent",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.color = COLORS.brassBright;
          e.currentTarget.style.borderColor = COLORS.brass;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.color = COLORS.brass;
          e.currentTarget.style.borderColor = COLORS.border;
        }}
      >
        {path.roomLabel}
      </Link>
    </article>
  );
}

export default function StartHere() {
  return (
    <div
      data-testid="start-here-root"
      className="min-h-screen w-full"
      style={{
        background: COLORS.bg,
        color: COLORS.ivory,
        fontFamily: 'system-ui, -apple-system, "Helvetica Neue", Arial, sans-serif',
      }}
    >
      {/* Minimal local nav — brand wordmark + quiet back link.
          Intentionally simpler than HouseNav so this page stays a
          "quiet door" with no other paths to wander down. */}
      <header
        className="w-full px-6 sm:px-10 pt-8 pb-2 flex items-center justify-between"
        style={{ borderBottom: `1px solid ${COLORS.borderSoft}` }}
      >
        <Link
          to="/"
          data-testid="start-here-brand"
          className="text-[11px] tracking-[0.42em] uppercase transition-colors duration-500"
          style={{ color: COLORS.muted, fontFamily: SERIF, textDecoration: "none" }}
          onMouseEnter={(e) => (e.currentTarget.style.color = COLORS.brassBright)}
          onMouseLeave={(e) => (e.currentTarget.style.color = COLORS.muted)}
        >
          Matrix Aurin
        </Link>
        <Link
          to="/"
          data-testid="start-here-back-home"
          className="inline-flex items-center gap-2 text-[10.5px] tracking-[0.32em] uppercase transition-colors duration-500"
          style={{ color: COLORS.muted, textDecoration: "none" }}
          onMouseEnter={(e) => (e.currentTarget.style.color = COLORS.brassBright)}
          onMouseLeave={(e) => (e.currentTarget.style.color = COLORS.muted)}
        >
          <ArrowLeft size={12} strokeWidth={1.4} />
          Back
        </Link>
      </header>

      {/* Head */}
      <section className="max-w-[920px] mx-auto px-6 sm:px-10 pt-24 sm:pt-32 pb-20 sm:pb-24 text-center">
        <p
          className="text-[10.5px] tracking-[0.44em] uppercase mb-8"
          style={{ color: COLORS.brass, fontFamily: SERIF }}
        >
          — Start Here —
        </p>
        <h1
          data-testid="start-here-headline"
          className="text-[30px] sm:text-[42px] lg:text-[48px] leading-[1.2] font-light mb-7 tracking-[-0.01em]"
          style={{ color: COLORS.ivory, fontFamily: SERIF }}
        >
          There is no wrong way to arrive.<br />
          <span className="italic" style={{ color: COLORS.brassBright }}>
            Pick the door that sounds like you today.
          </span>
        </h1>
        <p
          className="max-w-[580px] mx-auto text-[15.5px] sm:text-[17px] leading-[1.75] italic font-light"
          style={{ color: COLORS.muted, fontFamily: SERIF }}
        >
          Each path begins with a short evening listen. No screen needed after that.
          When you are ready, the matching room is one quiet click away.
        </p>
      </section>

      {/* Three paths */}
      <section className="max-w-[1240px] mx-auto px-6 sm:px-10 pb-24 sm:pb-32">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-10">
          {PATHS.map((path) => (
            <PathCard key={path.id} path={path} />
          ))}
        </div>
      </section>

      {/* Quiet closing */}
      <section className="max-w-[760px] mx-auto px-6 sm:px-10 pb-32 sm:pb-40 text-center">
        <p
          className="text-[16px] sm:text-[19px] leading-[1.75] italic font-light mb-10"
          style={{ color: COLORS.ivoryMute, fontFamily: SERIF }}
        >
          Whichever door you pick, you can leave whenever you need to.
        </p>
        <Link
          to="/"
          data-testid="start-here-back-home-bottom"
          className="inline-block text-[10.5px] tracking-[0.32em] uppercase transition-colors duration-500"
          style={{
            color: COLORS.muted,
            textDecoration: "underline",
            textDecorationStyle: "dotted",
            textUnderlineOffset: "6px",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = COLORS.brassBright)}
          onMouseLeave={(e) => (e.currentTarget.style.color = COLORS.muted)}
        >
          Back to Matrix Aurin
        </Link>
      </section>
    </div>
  );
}
