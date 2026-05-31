/**
 * AlistairBundle.jsx — `/alistair-bundle`
 *
 * §SPRINT-4 2026-05-31 — Course Room (W · 270° · Alistair) bundle launch.
 * Three pre-approved transmission sequences offered together at €39
 * (down from €75 individually — a 48% discount, quietly stated, never shouted).
 *
 * Audience: adults inside Matrix Aurin (World 2 / Course Room).
 * NOT a parent-with-child surface. NOT therapy. NOT a course shelf.
 *
 * Visual lineage: same Cormorant Garamond + deep blue + lantern amber
 * palette as /the-hearth and /listen/hearth/the-sock-on-the-stairs.
 * Anti-marketing: no urgency, no countdown, no "Limited Time", no
 * pop-ups. One CTA pointing to a Gumroad checkout placeholder that
 * the founder fills in once the SKU is created in the Gumroad UI.
 */
import { Link } from "react-router-dom";
import { ArrowLeft, ArrowRight, BookOpen, Mail, Headphones } from "lucide-react";

const SERIF = '"Cormorant Garamond", "EB Garamond", Georgia, serif';

const COLORS = {
  bg: "#0f1418",
  bgSoft: "#141a20",
  cream: "#f4ead0",
  text: "#e8dcc0",
  amber: "#d6a560",
  amberSoft: "rgba(214, 165, 96, 0.78)",
  mute: "#9c8a64",
  muteDeep: "#7c6e54",
  border: "rgba(214, 165, 96, 0.22)",
};

// §SPRINT-4-GUMROAD 2026-05-31 — placeholder; founder updates after
// creating the bundle SKU in Gumroad UI. Reading from window or
// fallback to a "soon" page so the link never 404s during pre-launch.
const GUMROAD_BUNDLE_URL =
  "https://aurinbeyond.gumroad.com/l/alistair-bundle";

const COURSES = [
  {
    slug: "letting-the-old-stories-rest",
    icon: BookOpen,
    title: "Letting the old stories rest",
    duration: "7 letters · 24-hour cadence-lock",
    blurb:
      "Seven slow letters about the patterns we did not choose, and the quiet permission to put them down. The first transmission asks one precise question: what is on your shelf because you placed it there, and what is on your shelf because someone else did?",
    audio: "Audio companion · Borrowed beliefs",
  },
  {
    slug: "the-language-you-forgot",
    icon: Mail,
    title: "The language you forgot",
    duration: "7 letters · 24-hour cadence-lock",
    blurb:
      "A return to the soft inner voice — the one that always whispered before the world taught us to shout. Each letter restores a small piece of the vocabulary that high-bandwidth life slowly erases: nuance, pause, refusal, ease.",
    audio: "Audio companion · As yourself",
  },
  {
    slug: "the-body-knows-first",
    icon: Headphones,
    title: "The body knows first",
    duration: "7 letters · 24-hour cadence-lock",
    blurb:
      "A companion sequence to the Body Room — slow daily attention to where emotions live in the hardware, and how they leave. Structural nervous-system hygiene for the operator who has been thinking too hard for too long.",
    audio: "Audio companion · The architecture of breath",
  },
];

const Eyebrow = ({ children, testid }) => (
  <div
    className="text-xs tracking-[0.32em] uppercase"
    style={{ color: COLORS.amber, letterSpacing: "0.32em" }}
    data-testid={testid}
  >
    {children}
  </div>
);

export default function AlistairBundle() {
  return (
    <div
      data-testid="alistair-bundle-page"
      className="min-h-screen w-full"
      style={{
        background: `radial-gradient(ellipse at top, ${COLORS.bgSoft} 0%, ${COLORS.bg} 60%, #0a0d10 100%)`,
        fontFamily: SERIF,
        color: COLORS.text,
      }}
    >
      <div className="max-w-3xl mx-auto px-6 py-20">
        {/* Hero illustration — Matrix Aurin × Alistair Course Room */}
        <div className="mb-12" data-testid="alistair-bundle-hero">
          <img
            src="/assets/alistair/alistair-bundle-hero.webp"
            alt="The Alistair Bundle — three foundational curricula breaking through the borrowed-belief matrix"
            className="w-full rounded-2xl"
            style={{
              border: `1px solid ${COLORS.border}`,
              boxShadow: "0 12px 60px rgba(0,0,0,0.45)",
            }}
            loading="eager"
            data-testid="alistair-bundle-hero-image"
          />
        </div>

        {/* Header */}
        <div className="text-center mb-3">
          <Eyebrow testid="alistair-bundle-eyebrow">
            W · 270° · Alistair · Course Room
          </Eyebrow>
        </div>
        <h1
          className="text-5xl md:text-6xl text-center mb-5"
          style={{ fontWeight: 500, letterSpacing: "-0.01em", color: COLORS.cream }}
          data-testid="alistair-bundle-title"
        >
          The Alistair Bundle
        </h1>
        <p
          className="text-center italic text-lg mb-14 px-4 leading-relaxed"
          style={{ color: COLORS.mute }}
          data-testid="alistair-bundle-subtitle"
        >
          Three transmission sequences. Twenty-one letters. One quiet shelf.
          <br />
          <span className="text-sm not-italic tracking-widest uppercase mt-3 inline-block" style={{ color: COLORS.amber }}>
            For the operator who has been thinking too hard for too long.
          </span>
        </p>

        {/* Long-form anti-marketing intro */}
        <section
          className="rounded-2xl px-8 py-10 mb-14"
          style={{
            background: "rgba(20, 26, 32, 0.55)",
            border: `1px solid ${COLORS.border}`,
            backdropFilter: "blur(12px)",
          }}
          data-testid="alistair-bundle-intro"
        >
          <p className="text-[15px] leading-[1.95] mb-5" style={{ color: COLORS.text }}>
            This is not a course shelf. It is a protocol library. Each
            sequence is twenty-one days of small, precise inputs — released
            one short letter at a time, on a 24-hour cadence-lock. You do
            not binge a re-architecture. You do not finish your inner life
            on a Saturday.
          </p>
          <p
            className="text-[14.5px] leading-[1.9] italic"
            style={{ color: COLORS.mute }}
          >
            Read one. Sit with it. Execute one line if the body permits.
            The next letter will not arrive before its hour. This is how
            high-bandwidth people quietly retrain their own operating
            system — without retreats, without breathwork, without a
            single screen left open longer than it should be.
          </p>
        </section>

        {/* The three sequences */}
        <Eyebrow testid="alistair-bundle-shelf-eyebrow">
          What sits on the shelf
        </Eyebrow>
        <div className="mt-5 space-y-5 mb-14" data-testid="alistair-bundle-courses">
          {COURSES.map((c) => {
            const Icon = c.icon;
            return (
              <article
                key={c.slug}
                className="rounded-2xl px-7 py-7 transition-colors"
                style={{
                  background: "rgba(20, 26, 32, 0.55)",
                  border: `1px solid ${COLORS.border}`,
                }}
                data-testid={`alistair-bundle-course-${c.slug}`}
              >
                <div className="flex items-start gap-4">
                  <div
                    className="mt-1 p-2 rounded-full"
                    style={{ border: `1px solid ${COLORS.border}` }}
                  >
                    <Icon size={18} strokeWidth={1.3} color={COLORS.amber} />
                  </div>
                  <div className="flex-1">
                    <div
                      className="text-[11px] tracking-[0.28em] uppercase mb-2"
                      style={{ color: COLORS.muteDeep }}
                    >
                      {c.duration}
                    </div>
                    <h3
                      className="text-3xl mb-3"
                      style={{ color: COLORS.cream, fontWeight: 500 }}
                      data-testid={`alistair-bundle-course-title-${c.slug}`}
                    >
                      {c.title}
                    </h3>
                    <p
                      className="text-[14.5px] leading-[1.85] mb-3"
                      style={{ color: COLORS.text }}
                    >
                      {c.blurb}
                    </p>
                    <div
                      className="inline-flex items-center gap-2 text-[12px] italic"
                      style={{ color: COLORS.mute }}
                    >
                      <Headphones size={12} strokeWidth={1.3} color={COLORS.amber} />
                      {c.audio}
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        {/* Pricing — quiet, never shouted */}
        <section
          className="rounded-2xl px-8 py-10 text-center mb-12"
          style={{
            background: "rgba(214, 165, 96, 0.06)",
            border: `1px solid ${COLORS.border}`,
          }}
          data-testid="alistair-bundle-pricing"
        >
          <Eyebrow testid="alistair-bundle-pricing-eyebrow">
            The whole shelf
          </Eyebrow>
          <div className="mt-4 flex items-baseline justify-center gap-4">
            <span
              className="text-5xl"
              style={{ color: COLORS.cream, fontWeight: 500 }}
              data-testid="alistair-bundle-price"
            >
              €39
            </span>
            <span
              className="text-base line-through"
              style={{ color: COLORS.muteDeep }}
              data-testid="alistair-bundle-price-original"
            >
              €75 individually
            </span>
          </div>
          <p
            className="mt-4 text-sm italic"
            style={{ color: COLORS.mute, maxWidth: 460, marginLeft: "auto", marginRight: "auto" }}
          >
            One payment. Lifetime access to all three sequences.
            21 transmissions delivered on the cadence-lock — yours to keep,
            re-read, and return to whenever the noise rises again.
          </p>

          <a
            href={GUMROAD_BUNDLE_URL}
            className="inline-flex items-center gap-3 mt-8 px-9 py-4 rounded-full transition-all hover:scale-[1.02]"
            style={{
              background: COLORS.amber,
              color: COLORS.bg,
              fontWeight: 600,
              letterSpacing: "0.02em",
              boxShadow: "0 4px 28px rgba(214, 165, 96, 0.32)",
            }}
            data-testid="alistair-bundle-cta"
            target="_blank"
            rel="noopener noreferrer"
          >
            Take the shelf
            <ArrowRight size={18} strokeWidth={2} />
          </a>

          <p
            className="mt-6 text-xs italic"
            style={{ color: COLORS.muteDeep }}
            data-testid="alistair-bundle-refund"
          >
            14-day no-questions refund · Instant delivery via Gumroad
          </p>
        </section>

        {/* Quiet bridge to the rest of the compass */}
        <section
          className="rounded-2xl px-8 py-8 text-center mb-12"
          style={{
            background: "rgba(20, 26, 32, 0.4)",
            border: `1px solid ${COLORS.border}`,
          }}
          data-testid="alistair-bundle-bridge"
        >
          <p
            className="italic text-[15px] mb-3"
            style={{ color: COLORS.text }}
          >
            Architecture is not always cognitive.
          </p>
          <p className="text-[13.5px] leading-[1.8]" style={{ color: COLORS.mute }}>
            If a sequence triggers something structural in the hardware,
            the adjacent compass headings handle it directly —{" "}
            <Link
              to="/body-room"
              style={{ color: COLORS.amber, borderBottom: `1px solid ${COLORS.border}` }}
              data-testid="alistair-bundle-link-body"
            >
              N · Body Architecture
            </Link>{" "}
            for somatic-load discharge, or{" "}
            <Link
              to="/clarity-release"
              style={{ color: COLORS.amber, borderBottom: `1px solid ${COLORS.border}` }}
              data-testid="alistair-bundle-link-clarity"
            >
              S · Clarity Release
            </Link>{" "}
            for cognitive-load extraction. Same compass. Different vector.
          </p>
        </section>

        {/* Lantern line — anti-marketing close */}
        <p
          className="text-center italic text-sm mt-16 leading-relaxed"
          style={{
            color: COLORS.mute,
            maxWidth: 480,
            marginLeft: "auto",
            marginRight: "auto",
          }}
          data-testid="alistair-bundle-lantern-line"
        >
          The first letter of every sequence is open before the threshold —
          <br />
          <Link
            to="/course-room"
            style={{
              color: COLORS.amber,
              textDecoration: "none",
              borderBottom: `1px solid ${COLORS.border}`,
              paddingBottom: "2px",
            }}
            data-testid="alistair-bundle-courseroom-link"
          >
            walk the shelf first
          </Link>
          .
        </p>

        {/* Footer breadcrumb */}
        <div className="mt-16 text-center">
          <Link
            to="/course-room"
            className="inline-flex items-center gap-2 text-sm tracking-widest uppercase"
            style={{ color: COLORS.muteDeep, opacity: 0.85 }}
            data-testid="alistair-bundle-back-link"
          >
            <ArrowLeft size={14} />
            Course Room
          </Link>
        </div>
      </div>
    </div>
  );
}
