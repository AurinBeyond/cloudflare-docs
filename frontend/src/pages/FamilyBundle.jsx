/**
 * FamilyBundle.jsx — `/family-bundle`
 *
 * §FAMILY-BUNDLE 2026-06-01 — Family-tier product launch page.
 * Two worlds, one household — Polarstar (the child, at bedtime) +
 * Hearth (the parent, after).
 *
 * Per Anna's 2026-06-01 strategy lock:
 *   - Tagline platform-wide: "Less Noise. More Meaning."
 *   - This bundle is its OWN product (not a discount of two others) —
 *     the buyer persona is the household, not the individual.
 *   - €25 vs €28 separate. Mild courtesy, not the lead message.
 *   - No memberships, no Family Circle, no Listening Room mentions
 *     until those tiers actually exist with real content.
 *
 * Visual palette: blends Polarstar children's warmth (slight cream)
 * with Hearth adult lantern (amber + deep blue). Family palette =
 * warmer cream + softer amber than Hearth-alone.
 */
import { Link } from "react-router-dom";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { LAUNCH_PAUSE } from "@/lib/launchPause";
import LaunchPauseButton from "@/components/LaunchPauseButton";

const SERIF = '"Cormorant Garamond", "EB Garamond", Georgia, serif';

// Family palette — warmer than Hearth, gentler than Polarstar gouache.
const COLORS = {
  bg: "#0f1418",
  bgSoft: "#161c22",
  cream: "#f4ebd4",
  amber: "#d6a560",
  amberSoft: "rgba(214, 165, 96, 0.78)",
  mute: "#857a62",
  border: "rgba(214, 165, 96, 0.18)",
};

// Gumroad short URL — Family Bundle lives on aurinbeyond account.
// Slug `vjurjm` was the redirect URI shown when Anna created the SKU.
// If the public short URL changes, edit ONLY this constant.
const GUMROAD_URL = "https://aurinbeyond.gumroad.com/l/vjurjm";

const INCLUDED = [
  {
    title: "Polarstar Bedtime Stories",
    sub: "PDF · 32 pages · 1 finished audio story (Little Star, ~8 min)",
    body:
      "A small shelf of bedtime stories for the parent who is reading aloud at the edge of a bed. No screens. No follow-up. Just a story, a voice, and the slow exhale of a small body falling asleep.",
  },
  {
    title: "The Hearth · 5 evening stories",
    sub: "PDF · 5 audio MP3s · ~7 min each · 1.0 second of silence padded both ends",
    body:
      "Five seven-minute evening stories for the parent who is now sitting in the kitchen at 11pm with the dishwasher running. Read in one unhurried take. No music. No bells. Close your eyes if you'd like.",
  },
];

const FOR_WHOM = [
  "the household where one shelf is read aloud at bedtime, and the other is heard in the kitchen at 11pm",
  "the parent who would like the same lantern in two rooms",
  "anyone who has been quietly buying both Polarstar and Hearth separately and would like to consolidate",
  "anyone giving a small gift to a friend who has just become a parent",
];

const NOT_FOR = [
  "the adult without children — The Hearth alone is the right shelf",
  "the household whose kids are already adults — The Hearth alone is enough",
  "anyone looking for a subscription, a streak, or a course — neither shelf has any of those",
];

export default function FamilyBundle() {
  return (
    <div
      data-testid="family-bundle-page"
      className="min-h-screen w-full"
      style={{
        background: `linear-gradient(180deg, ${COLORS.bg} 0%, ${COLORS.bgSoft} 100%)`,
        color: COLORS.cream,
        fontFamily: SERIF,
      }}
    >
      <div className="max-w-3xl mx-auto px-6 py-20">

        {/* Eyebrow */}
        <div
          className="text-xs tracking-[0.42em] uppercase mb-6 text-center"
          style={{ color: COLORS.amber }}
          data-testid="family-bundle-eyebrow"
        >
          Two worlds · One household
        </div>

        {/* Title */}
        <h1
          className="text-5xl md:text-6xl text-center mb-4"
          style={{ fontWeight: 500, letterSpacing: "-0.012em", lineHeight: 1.05 }}
          data-testid="family-bundle-title"
        >
          The Family Bundle
        </h1>

        {/* Subtitle — the brand tagline lives here */}
        <p
          className="text-center text-xl md:text-2xl italic mb-12 leading-relaxed"
          style={{ color: COLORS.amberSoft, maxWidth: 620, marginLeft: "auto", marginRight: "auto", fontWeight: 400 }}
          data-testid="family-bundle-subtitle"
        >
          One bedtime for the child.
          <br />
          One quiet hour for the parent.
        </p>

        {/* Hero card */}
        <div
          className="rounded-2xl px-8 py-10 mb-16 text-center"
          style={{
            background: "rgba(214, 165, 96, 0.06)",
            border: `1px solid ${COLORS.border}`,
          }}
          data-testid="family-bundle-hero-card"
        >
          <p className="text-base md:text-lg leading-relaxed mb-4" style={{ color: COLORS.cream }}>
            Two of the quietest things on Matrix Aurin, packaged for the
            same household. The kids get bedtime stories that do not ask
            them to swipe, like, or follow up. You get evening stories
            that do not ask you to journal, optimise, or fix yourself.
          </p>
          <p className="text-base md:text-lg leading-relaxed" style={{ color: COLORS.cream }}>
            Same house. Same lantern. Two rooms.
          </p>
          <p className="text-sm italic mt-5" style={{ color: COLORS.mute }}>
            2 PDFs · 6 audios · no app, no login, no streak.
          </p>
        </div>

        {/* What's inside */}
        <section className="mb-16" data-testid="family-bundle-included">
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
                data-testid={`family-bundle-included-${i + 1}`}
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
        <section className="mb-16" data-testid="family-bundle-for-whom">
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
                  style={{ width: 10, height: 1, background: COLORS.amber }}
                />
                {line}
              </li>
            ))}
          </ul>
        </section>

        {/* Not for */}
        <section className="mb-16" data-testid="family-bundle-not-for">
          <h2
            className="text-2xl mb-5"
            style={{ color: COLORS.amber, fontWeight: 500 }}
          >
            Not for
          </h2>
          <ul style={{ listStyle: "none", padding: 0 }}>
            {NOT_FOR.map((line, i) => (
              <li
                key={i}
                className="mb-3 pl-6 relative text-base leading-relaxed italic"
                style={{ color: COLORS.cream, opacity: 0.7 }}
              >
                <span
                  className="absolute left-0 top-3"
                  style={{ width: 10, height: 1, background: COLORS.mute }}
                />
                {line}
              </li>
            ))}
          </ul>
        </section>

        {/* Price + CTA */}
        <section
          className="text-center mb-16 px-2"
          data-testid="family-bundle-cta-section"
        >
          <div
            className="text-7xl mb-3"
            style={{ color: COLORS.amber, fontWeight: 500, letterSpacing: "-0.02em" }}
            data-testid="family-bundle-price"
          >
            €25
          </div>
          <p className="text-sm italic mb-2" style={{ color: COLORS.mute }}>
            individually €9 + €19 = €28 · small kindness for the household
          </p>
          <p className="text-sm italic mb-8" style={{ color: COLORS.mute }}>
            instant download · 14-day no-questions refund · no app required
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center mb-5">
            {LAUNCH_PAUSE ? (
              <LaunchPauseButton
                testid="family-bundle-buy-cta"
                label="Coming soon · €25"
              />
            ) : (
              <a
                href={GUMROAD_URL}
                target="_blank"
                rel="noopener noreferrer"
                data-testid="family-bundle-buy-cta"
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
                Take both shelves · €25
                <ArrowRight size={15} />
              </a>
            )}
            <a
              href="/listen/hearth"
              data-testid="family-bundle-preview-audio"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-full text-sm"
              style={{
                border: `1px solid ${COLORS.amber}`,
                color: COLORS.amber,
                textDecoration: "none",
                letterSpacing: "0.04em",
              }}
            >
              Listen to a free Hearth story first
            </a>
          </div>
        </section>

        {/* Note on the two shelves separately */}
        <section
          className="mb-16 px-2"
          data-testid="family-bundle-separate-shelves"
        >
          <h2
            className="text-xl mb-3"
            style={{ color: COLORS.amber, fontWeight: 500 }}
          >
            Already have one of the two shelves?
          </h2>
          <p className="text-base leading-relaxed mb-3" style={{ color: COLORS.cream, opacity: 0.86 }}>
            If your household only needs one of the two — that is also a
            sensible thing. Each shelf is sold separately, with the same
            slow voice, the same no-app, no-streak architecture.
          </p>
          <p className="text-base leading-relaxed" style={{ color: COLORS.cream, opacity: 0.86 }}>
            →{" "}
            <Link to="/kids-universe/polarstar" style={{ color: COLORS.amber, borderBottom: `1px solid ${COLORS.amber}` }}>
              Polarstar Bedtime Stories
            </Link>
            {" "} (children, €9){" "}
            ·{" "}
            <Link to="/the-hearth" style={{ color: COLORS.amber, borderBottom: `1px solid ${COLORS.amber}` }}>
              The Hearth
            </Link>
            {" "} (parents, €19)
          </p>
        </section>

        {/* Founder note */}
        <section className="mb-12 px-2 text-center" data-testid="family-bundle-founder-note">
          <p className="text-base italic leading-relaxed" style={{ color: COLORS.cream, opacity: 0.82, maxWidth: 560, marginLeft: "auto", marginRight: "auto" }}>
            I built both of these for the same evening — the one where
            you read to your child at 7pm and then sit at your own
            kitchen at 11pm and realise you have not been alone with
            your own thoughts in three days. If that is your house,
            the door is open.
          </p>
          <p className="text-sm mt-3" style={{ color: COLORS.mute }}>
            — Anna, prulesoul
          </p>
        </section>

        {/* Tagline footer */}
        <div className="text-center mb-12">
          <p
            className="text-xs tracking-[0.42em] uppercase"
            style={{ color: COLORS.amber, opacity: 0.7 }}
            data-testid="family-bundle-tagline"
          >
            Matrix Aurin · Less Noise. More Meaning.
          </p>
        </div>

        {/* Back link */}
        <div className="text-center">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm tracking-widest uppercase"
            style={{ color: COLORS.mute, opacity: 0.7 }}
            data-testid="family-bundle-back-link"
          >
            <ArrowLeft size={14} />
            Home
          </Link>
        </div>
      </div>
    </div>
  );
}
