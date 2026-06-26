/**
 * TheHearthProtocol.jsx — `/the-hearth-protocol`
 *
 * §SPRINT-3 2026-05-31 — Parents' Room product launch page.
 * THIS LANDING PAGE IS FOR THE PARENT ALONE — NOT FOR THE PARENT-AND-
 * CHILD AUDIENCE. The visual palette is intentionally NOT children's
 * gouache. It is the adult house palette: deep blue, warm cream,
 * lantern amber. Quiet, late evening.
 *
 * Status:
 *   - Layout: live (preview)
 *   - Manuscript (12 pages): awaits Anna's writing
 *   - Audio (15 min companion + 30 min ambient): awaits Anna's recording
 *   - Gumroad product: created when manuscript + audio are uploaded
 *     (see /app/scripts/create_hearth_product.py — TBD)
 *
 * Per Four Worlds Rule: this page lives in World 2 (Matrix Aurin adult /
 * Parents-alone audience), NOT World 1 (Polarstar parent-and-child).
 */
import { Link } from "react-router-dom";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { LAUNCH_PAUSE } from "@/lib/launchPause";
import LaunchPauseButton from "@/components/LaunchPauseButton";

const SERIF = '"Cormorant Garamond", "EB Garamond", Georgia, serif';

// Adult house palette (deep blue + cream + amber). NOT children's gouache.
const COLORS = {
  bg: "#0f1418",         // near-black blue
  bgSoft: "#141a20",
  cream: "#f0e8d6",
  amber: "#d6a560",
  amberSoft: "rgba(214, 165, 96, 0.78)",
  mute: "#7a8390",
  border: "rgba(214, 165, 96, 0.18)",
};

const INCLUDED = [
  {
    title: "The Hearth — written guide",
    sub: "PDF · A5 · 12 pages · designed to be read in one sitting (≈ 20 min)",
    body:
      "A short, unhurried evening companion for the parent who has carried more than their own thoughts today. Not advice. Not pedagogy. A return — once a night, once a week, or whenever the house has gone quiet — to yourself.",
  },
  {
    title: "The Inheritance Inventory — worksheet",
    sub: "PDF · 1 page · re-runnable",
    body:
      "Six prompts that name what was handed to you, what you've passed on, and what you can quietly retire from the household's operating system. Use it once or use it monthly.",
  },
  {
    title: "Hearth Audio — read aloud by the author",
    sub: "MP3 · ≈ 15 min · same voice as the Polarstar audios",
    body:
      "If reading by lamplight at 11pm is already too much, listen instead. The protocol becomes a voice you can let the room hold.",
  },
  {
    title: "One quiet evening — ambient soundscape",
    sub: "MP3 · ≈ 30 min · looping",
    body:
      "A long, slow ambient bed. Optional underlay for the protocol — or just for the half hour between the last child asleep and your own.",
  },
];

const FOR_WHOM = [
  "the parent who is fine until 9pm and unrecognisable to themselves by 11",
  "the one who is Anchor OS for everyone else, with no anchor of their own",
  "the parent decoding what was inherited and what is now being handed forward",
  "anyone whose body is tired but whose mind is still listening for footsteps",
];

const NOT_FOR = [
  "children — this is for the parent alone, after the children are asleep",
  "anyone looking for parenting advice — there is none here",
  "anyone wanting a streak, a course schedule, or a coach",
  "anyone who would like an app to install — there is no app, only a PDF and four audios",
];

export default function TheHearthProtocol() {
  return (
    <div
      data-testid="hearth-page"
      className="min-h-screen w-full"
      style={{
        background: `linear-gradient(180deg, ${COLORS.bg} 0%, ${COLORS.bgSoft} 100%)`,
        color: COLORS.cream,
        fontFamily: SERIF,
      }}
    >
      <div className="max-w-3xl mx-auto px-6 py-20">

        {/* §HEARTH-LIVE 2026-05-31 — Founder-supplied hero image:
            Anna at the fireplace, kids' drawings, "The Hearth" book on the mantle */}
        <div className="mb-12" data-testid="hearth-hero">
          <img
            src="/assets/hearth/the-hearth-hero.webp"
            alt="A parent sitting by the fire, kids' drawings on the wall, The Hearth book on the mantle"
            className="w-full rounded-2xl"
            style={{
              border: `1px solid ${COLORS.border}`,
              boxShadow: "0 12px 60px rgba(0,0,0,0.45)",
            }}
            loading="eager"
            data-testid="hearth-hero-image"
          />
        </div>

        {/* Eyebrow */}
        <div
          className="text-xs tracking-[0.42em] uppercase mb-6 text-center"
          style={{ color: COLORS.amber }}
          data-testid="hearth-eyebrow"
        >
          Parents' Room · For the parent alone
        </div>

        {/* Title */}
        <h1
          className="text-5xl md:text-6xl text-center mb-4"
          style={{ fontWeight: 500, letterSpacing: "-0.012em", lineHeight: 1.05 }}
          data-testid="hearth-title"
        >
          The Hearth
        </h1>

        {/* Subtitle */}
        <p
          className="text-center text-xl md:text-2xl italic mb-12 leading-relaxed"
          style={{ color: COLORS.amberSoft, maxWidth: 580, marginLeft: "auto", marginRight: "auto", fontWeight: 400 }}
          data-testid="hearth-subtitle"
        >
          A Quiet Evening Return To Yourself
        </p>

        {/* Hero card */}
        <div
          className="rounded-2xl px-8 py-10 mb-16 text-center"
          style={{
            background: "rgba(214, 165, 96, 0.06)",
            border: `1px solid ${COLORS.border}`,
          }}
          data-testid="hearth-hero-card"
        >
          <p className="text-base md:text-lg leading-relaxed mb-4" style={{ color: COLORS.cream }}>
            You spent the day decoding what your parents handed you,
            and what your children hand you. The 20 minutes after they
            fall asleep are not free time — they are the only window in
            which you are not on call. This is a quiet return to yourself,
            once a night.
          </p>
          <p className="text-sm italic" style={{ color: COLORS.mute }}>
            One PDF · one worksheet · two audios · no app, no login, no streak.
          </p>
        </div>

        {/* What's inside */}
        <section className="mb-16" data-testid="hearth-included">
          <h2
            className="text-2xl mb-7"
            style={{ color: COLORS.amber, fontWeight: 500, letterSpacing: "0.01em" }}
          >
            What is included
          </h2>
          <ol style={{ listStyle: "none", padding: 0 }}>
            {INCLUDED.map((item, i) => (
              <li
                key={i}
                data-testid={`hearth-included-${i + 1}`}
                className="mb-6 rounded-xl px-6 py-5"
                style={{
                  background: "rgba(240, 232, 214, 0.025)",
                  border: `1px solid ${COLORS.border}`,
                }}
              >
                <div className="flex items-start gap-4">
                  <div
                    className="rounded-full shrink-0 flex items-center justify-center"
                    style={{
                      width: 38,
                      height: 38,
                      border: `1px solid ${COLORS.amber}`,
                      color: COLORS.amber,
                      fontFamily: SERIF,
                      fontSize: "1.05rem",
                    }}
                  >
                    {i + 1}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg mb-1" style={{ color: COLORS.cream, fontWeight: 500 }}>
                      {item.title}
                    </h3>
                    <p className="text-xs italic mb-2" style={{ color: COLORS.mute, letterSpacing: "0.06em" }}>
                      {item.sub}
                    </p>
                    <p className="text-base leading-relaxed" style={{ color: COLORS.cream, opacity: 0.86 }}>
                      {item.body}
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </section>

        {/* For whom */}
        <section className="mb-16" data-testid="hearth-for-whom">
          <h2
            className="text-2xl mb-5"
            style={{ color: COLORS.amber, fontWeight: 500 }}
          >
            For whom
          </h2>
          <ul style={{ listStyle: "none", padding: 0 }}>
            {FOR_WHOM.map((line, i) => (
              <li
                key={i}
                className="mb-3 pl-6 relative text-base leading-relaxed"
                style={{ color: COLORS.cream, opacity: 0.88 }}
              >
                <span
                  className="absolute left-0 top-3"
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: 999,
                    background: COLORS.amber,
                    display: "inline-block",
                  }}
                />
                {line}
              </li>
            ))}
          </ul>

          <h3
            className="text-lg mt-10 mb-3"
            style={{ color: COLORS.amber, fontWeight: 500, opacity: 0.85 }}
          >
            Not for
          </h3>
          <ul style={{ listStyle: "none", padding: 0 }}>
            {NOT_FOR.map((line, i) => (
              <li
                key={i}
                className="mb-2 pl-6 relative text-sm italic leading-relaxed"
                style={{ color: COLORS.mute }}
              >
                <span
                  className="absolute left-0 top-2.5"
                  style={{
                    width: 5,
                    height: 5,
                    borderRadius: 999,
                    background: COLORS.mute,
                    opacity: 0.6,
                    display: "inline-block",
                  }}
                />
                {line}
              </li>
            ))}
          </ul>
        </section>

        {/* Price + CTA */}
        <section
          className="rounded-2xl px-8 py-12 mb-16 text-center"
          style={{
            background: "rgba(214, 165, 96, 0.10)",
            border: `1px solid ${COLORS.border}`,
          }}
          data-testid="hearth-cta"
        >
          <p className="text-xs tracking-[0.4em] uppercase mb-3" style={{ color: COLORS.amber }}>
            One-time · not a subscription
          </p>
          <div
            className="text-6xl mb-2"
            style={{ fontWeight: 400, color: COLORS.cream }}
            data-testid="hearth-price"
          >
            €19
          </div>
          <p className="text-sm italic mb-8" style={{ color: COLORS.mute }}>
            instant download · 14-day no-questions refund · no app required
          </p>

          {/* §HEARTH-LIVE 2026-05-31 — Gumroad SKU is now LIVE.
              CTA now points to the real Gumroad product. */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center mb-5">
            {LAUNCH_PAUSE ? (
              <LaunchPauseButton
                testid="hearth-buy-cta"
                label="Coming soon · €19"
              />
            ) : (
              <a
                href="https://aurinbeyond.gumroad.com/l/the-hearth"
                target="_blank"
                rel="noopener noreferrer"
                data-testid="hearth-buy-cta"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full text-sm"
                style={{
                  background: COLORS.amber,
                  color: COLORS.bg,
                  textDecoration: "none",
                  letterSpacing: "0.04em",
                  fontWeight: 600,
                  boxShadow: "0 4px 28px rgba(214, 165, 96, 0.3)",
                }}
              >
                Step inside · €19
                <ArrowRight size={15} />
              </a>
            )}
            <a
              href="/listen/hearth"
              data-testid="hearth-preview-audio"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-full text-sm"
              style={{
                border: `1px solid ${COLORS.amber}`,
                color: COLORS.amber,
                textDecoration: "none",
                letterSpacing: "0.04em",
              }}
            >
              Listen to a free story first
            </a>
          </div>

          <a
            href="https://prulesoullife.substack.com"
            target="_blank"
            rel="noopener noreferrer"
            data-testid="hearth-notify-cta"
            className="inline-flex items-center gap-2 text-sm italic"
            style={{
              color: COLORS.mute,
              textDecoration: "underline",
              textUnderlineOffset: "3px",
            }}
          >
            Or subscribe to be notified when the audio companion is ready
            <ArrowRight size={16} />
          </a>
          <p className="text-xs italic mt-6" style={{ color: COLORS.mute }}>
            The Hearth Protocol is being written and recorded now. Subscribers
            to <span style={{ color: COLORS.amber }}>prulesoullife.substack.com</span> will
            receive a quiet note the evening it opens.
          </p>
        </section>

        {/* Family bundle pre-announcement */}
        <section
          className="mb-16 px-2"
          data-testid="hearth-family-bundle"
        >
          <h2
            className="text-xl mb-3"
            style={{ color: COLORS.amber, fontWeight: 500 }}
          >
            A note on the family bundle
          </h2>
          <p className="text-base leading-relaxed" style={{ color: COLORS.cream, opacity: 0.86 }}>
            When The Hearth Protocol opens, a quiet combined bundle will
            also exist — Polarstar (for the child, at bedtime) and Hearth
            (for the parent, after) — sold together for less than the two
            separately. No urgency, no countdown. Just a small kindness
            for the household that needs both ends of the same evening.
          </p>
        </section>

        {/* Founder note */}
        <section className="mb-12 px-2 text-center" data-testid="hearth-founder-note">
          <p className="text-base italic leading-relaxed" style={{ color: COLORS.cream, opacity: 0.82, maxWidth: 540, marginLeft: "auto", marginRight: "auto" }}>
            I wrote this for myself first. There are no podcast clips, no
            morning-routine influencers, no breath counts. It is the
            protocol I run after the house has gone quiet. If it helps you
            too, the door is open.
          </p>
          <p className="text-sm mt-3" style={{ color: COLORS.mute }}>
            — Anna, prulesoul
          </p>
        </section>

        {/* Back link */}
        <div className="text-center">
          <Link
            to="/parents-room"
            className="inline-flex items-center gap-2 text-sm tracking-widest uppercase"
            style={{ color: COLORS.mute, opacity: 0.7 }}
            data-testid="hearth-back-link"
          >
            <ArrowLeft size={14} />
            Parents' Room
          </Link>
        </div>
      </div>
    </div>
  );
}
