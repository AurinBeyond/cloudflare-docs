/**
 * SevenQuietNights.jsx — /seven-quiet-nights
 *
 * §POLARSTAR-CHALLENGE 2026-05-31 — Idea A: "7 Quiet Nights".
 * A free, screen-down family challenge. One story per night for 7
 * nights. No app, no streak punishment, no notifications. Just a
 * lantern lit for the evening.
 *
 * Brand discipline:
 *  - No urgency. No "limited time."
 *  - No tracking pixels. No popups.
 *  - One CTA at the end: a quiet invitation to the PDF.
 *  - All text in English. All Polarstar visual lineage.
 */
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { LAUNCH_PAUSE } from "@/lib/launchPause";
import LaunchPauseButton from "@/components/LaunchPauseButton";

const SERIF = '"Cormorant Garamond", "EB Garamond", Georgia, serif';

const NIGHTS = [
  {
    n: 1,
    title: "Little Star",
    note: "A tiny light learns it is not the same as being unseen.",
    href: "/listen/little-star",
    live: true,
  },
  {
    n: 2,
    title: "The Moon Boat",
    note: "A sleepy boat carries dreams across a calm night sea.",
    href: null,
    live: false,
  },
  {
    n: 3,
    title: "The Night Forest",
    note: "The forest at night is not louder than the day. It listens.",
    href: null,
    live: false,
  },
  {
    n: 4,
    title: "The Quiet Dragon",
    note: "Most dragons roar. This one listened, and changed a village.",
    href: null,
    live: false,
  },
  {
    n: 5,
    title: "Aurin and the Lantern",
    note: "A small steady light, an honest step, one quiet companion.",
    href: null,
    live: false,
  },
  {
    n: 6,
    title: "A story you tell",
    note: "Tonight, no book. Tell a small memory from your own childhood.",
    href: null,
    live: true,
    selfMade: true,
  },
  {
    n: 7,
    title: "Silence",
    note: "Lie down beside your child. No story. Listen to the room.",
    href: null,
    live: true,
    selfMade: true,
  },
];

export default function SevenQuietNights() {
  return (
    <div
      data-testid="seven-quiet-nights-page"
      className="min-h-screen w-full"
      style={{
        background:
          "radial-gradient(ellipse at top, rgba(255,243,217,1) 0%, rgba(255,251,241,1) 60%)",
        fontFamily: SERIF,
        color: "#3a2a18",
      }}
    >
      <div className="max-w-2xl mx-auto px-6 py-16">
        <div
          className="text-xs tracking-[0.32em] uppercase mb-3 text-center"
          style={{ color: "#b97a3a" }}
          data-testid="sqn-eyebrow"
        >
          Polarstar Kids · A free family challenge
        </div>

        <h1
          className="text-5xl md:text-6xl text-center mb-6"
          style={{ fontWeight: 600, letterSpacing: "-0.01em" }}
          data-testid="sqn-title"
        >
          Seven Quiet Nights
        </h1>

        <p
          className="text-center text-lg italic mb-3"
          style={{ color: "#5b4a32" }}
          data-testid="sqn-subtitle"
        >
          One quiet story before bed. Seven evenings in a row.
        </p>

        <p
          className="text-center text-base mb-12 leading-relaxed"
          style={{ color: "#5b4a32", maxWidth: 540, marginLeft: "auto", marginRight: "auto" }}
          data-testid="sqn-intro"
        >
          No app to download. No streak to break. No notifications waiting
          for you. Just one lantern lit for seven evenings — and a child
          who has someone reading to them, in the slow part of the day.
        </p>

        {/* The 7 nights */}
        <ol
          className="mb-16"
          data-testid="sqn-nights-list"
          style={{ listStyle: "none", padding: 0 }}
        >
          {NIGHTS.map((night) => (
            <li
              key={night.n}
              data-testid={`sqn-night-${night.n}`}
              className="mb-5 rounded-2xl px-6 py-5"
              style={{
                background: "rgba(255,255,255,0.55)",
                border: "1px solid rgba(185,122,58,0.22)",
                backdropFilter: "blur(6px)",
                opacity: night.live ? 1 : 0.66,
              }}
            >
              <div className="flex items-start gap-5">
                <div
                  className="rounded-full flex items-center justify-center shrink-0"
                  style={{
                    width: 48,
                    height: 48,
                    background: night.live ? "#b97a3a" : "rgba(185,122,58,0.25)",
                    color: night.live ? "#fffbf1" : "#8a7a5a",
                    fontFamily: SERIF,
                    fontSize: "1.4rem",
                    fontWeight: 600,
                  }}
                  aria-hidden="true"
                >
                  {night.n}
                </div>
                <div className="flex-1">
                  <h2
                    className="text-xl mb-1"
                    style={{ fontFamily: SERIF, fontWeight: 600 }}
                  >
                    {night.title}
                  </h2>
                  <p
                    className="text-base italic mb-2"
                    style={{ color: "#5b4a32" }}
                  >
                    {night.note}
                  </p>
                  {night.href && (
                    <a
                      href={night.href}
                      data-testid={`sqn-night-${night.n}-cta`}
                      className="inline-block text-sm tracking-widest uppercase"
                      style={{
                        color: "#b97a3a",
                        textDecoration: "underline",
                        textUnderlineOffset: "3px",
                        fontWeight: 600,
                      }}
                    >
                      Listen tonight →
                    </a>
                  )}
                  {!night.href && !night.selfMade && (
                    <span
                      className="text-xs tracking-widest uppercase italic"
                      style={{ color: "#8a7a5a" }}
                    >
                      Recording in the slow making
                    </span>
                  )}
                  {night.selfMade && (
                    <span
                      className="text-xs tracking-widest uppercase italic"
                      style={{ color: "#8a7a5a" }}
                    >
                      No book required
                    </span>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ol>

        {/* The quiet ask */}
        <div
          className="text-center mb-16 rounded-2xl px-8 py-10"
          style={{
            background: "rgba(255,255,255,0.6)",
            border: "1px solid rgba(185,122,58,0.25)",
          }}
          data-testid="sqn-pdf-cta"
        >
          <p className="text-base mb-3" style={{ color: "#5b4a32" }}>
            If even one of these nights goes well, the full PDF holds
            the five stories — printed, read-aloud-ready, no app required.
          </p>
          {LAUNCH_PAUSE ? (
            <LaunchPauseButton
              testid="sqn-gumroad-cta"
              label="Coming soon · €9 PDF"
            />
          ) : (
            <>
              <a
                href="https://prulesoul.gumroad.com/l/fwqmha"
                target="_blank"
                rel="noopener noreferrer"
                data-testid="sqn-gumroad-cta"
                className="inline-flex items-center gap-2 text-base"
                style={{
                  color: "#b97a3a",
                  fontWeight: 600,
                  textDecoration: "underline",
                  textUnderlineOffset: "4px",
                }}
              >
                See the full Polarstar collection (€9 PDF)
              </a>
              <p
                className="text-xs italic mt-5"
                style={{ color: "#8a7a5a" }}
              >
                14-day no-questions refund. One-time purchase. No subscription.
              </p>
            </>
          )}
        </div>

        {/* Why this exists */}
        <div className="mb-16" data-testid="sqn-why">
          <h3 className="text-2xl mb-3" style={{ fontFamily: SERIF, fontWeight: 600 }}>
            Why this exists
          </h3>
          <p className="text-base italic leading-relaxed" style={{ color: "#5b4a32" }}>
            I wrote these stories because the apps got loud and the
            evenings got fast. A child does not need a streak to fall
            asleep. A child needs a person — and a small, steady light.
          </p>
          <p className="text-sm mt-3" style={{ color: "#8a7a5a" }}>
            — Anna, prulesoul
          </p>
        </div>

        {/* Footer breadcrumb */}
        <div className="text-center">
          <Link
            to="/kids-universe/polarstar"
            className="inline-flex items-center gap-2 text-sm tracking-widest uppercase"
            style={{ color: "#5b4a32", opacity: 0.7 }}
            data-testid="sqn-back-link"
          >
            <ArrowLeft size={14} />
            Polarstar Kids
          </Link>
        </div>
      </div>
    </div>
  );
}
