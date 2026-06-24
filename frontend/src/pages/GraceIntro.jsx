/**
 * GraceIntro.jsx — Host introduction page (v4).
 *
 * §HOST-INTRO 2026-02 — founder feedback (2026-06-24 morning):
 *   - v1: framed image + text beside it → "too sterile"
 *   - v2: same, contrast fixed
 *   - v3: full-bleed painting, text scrolled below → "lost the text"
 *   - v4 (this one): painting + text TOGETHER on first screen,
 *     painting large but without a hard frame, text breathing right
 *     next to it. Magazine spread feel, not a scroll-to-discover page.
 *
 * COMPOSITION
 *   Hero:    [ painting ~60% ]  [ welcome text ~40% ]
 *            both visible above the fold
 *   Below:   "Here you may" list · closing · CTA · signature
 *
 * WHEN GRACE-IN-CHAIR PORTRAIT LANDS
 *   The painting becomes one integrated scene (Grace seated in the
 *   sage armchair with rain on the window). Same layout, richer
 *   meaning. Budget pending.
 */
import React from "react";
import { Link } from "react-router-dom";

const ROOM_ATMOSPHERE_SRC = "/style_samples/room_grace_sample_v2.png";
const GRACE_IN_CHAIR_SRC = "/style_samples/grace_in_chair_v1.png";

// Until the seated-Grace painting lands, the empty-chair scene holds
// the layout. Both files share an identical aspect ratio so the swap
// is one-line when the new file appears.
const HERO_IMG = ROOM_ATMOSPHERE_SRC;
const GRACE_IS_IN_THE_CHAIR = false;

const PAPER = "#F4ECD8";
const INK = "#3D2E1F";
const INK_DEEP = "#2A1F12";
const INK_SOFT = "#5A4530";
const INK_MUTE = "#8A7560";
const SAGE = "#7A8B6F";

const ROOM_OFFERINGS = [
  "Sit with what felt too heavy to name",
  "Read short pieces written for tired evenings",
  "Listen to small audios when reading is too much",
  "Write to me when the inside of you needs witnessing",
  "Or simply be — without doing anything at all",
];

const SOFT_MASK =
  "radial-gradient(ellipse 92% 94% at 50% 50%, rgba(0,0,0,1) 62%, rgba(0,0,0,0) 100%)";

export default function GraceIntro() {
  return (
    <div
      data-testid="grace-intro-page"
      style={{ backgroundColor: PAPER, color: INK, minHeight: "100vh" }}
    >
      {/* HERO — painting + welcoming text together, side by side */}
      <section
        className="mx-auto max-w-7xl px-6 sm:px-10 pt-10 sm:pt-14 pb-12
                   grid grid-cols-1 lg:grid-cols-[1.25fr_1fr] gap-8 lg:gap-12
                   items-center"
        data-testid="grace-intro-hero"
      >
        {/* LEFT — painting, large, no frame, soft fade edges */}
        <div className="relative" data-testid="grace-intro-painting-wrapper">
          <img
            src={HERO_IMG}
            alt={
              GRACE_IS_IN_THE_CHAIR
                ? "A watercolour painting of Grace seated in a deep sage-green velvet armchair beside a wooden window, evening rain on the glass, a warm brass lantern and a steaming teacup on a small wooden side table, embers glowing softly in a fireplace behind her, a cream wool blanket draped across her lap."
                : "A watercolour painting of Grace's evening room — a deep sage-green velvet armchair beside a wooden window with rain on the glass, a soft cream blanket draped over the arm, a small wooden side table with a warm brass lantern and a teacup with thin steam rising, a fireplace with embers glowing softly."
            }
            className="block w-full h-auto select-none"
            draggable={false}
            loading="eager"
            data-testid="grace-intro-painting"
            style={{
              WebkitMaskImage: SOFT_MASK,
              maskImage: SOFT_MASK,
              WebkitMaskRepeat: "no-repeat",
              maskRepeat: "no-repeat",
            }}
          />
        </div>

        {/* RIGHT — welcome voice, sits next to the painting */}
        <div className="space-y-6 lg:pl-2">
          <div>
            <div
              className="text-[0.7rem] uppercase tracking-[0.3em] mb-3"
              style={{ color: SAGE }}
              data-testid="grace-intro-eyebrow"
            >
              Keeper of the evening room
            </div>
            <h1
              className="aurin-serif tracking-tight"
              style={{
                color: INK_DEEP,
                fontSize: "clamp(2.75rem, 5.5vw, 4.5rem)",
                lineHeight: 1.02,
              }}
              data-testid="grace-intro-name"
            >
              Grace
            </h1>
          </div>

          <p
            className="aurin-serif-italic"
            style={{
              color: INK_SOFT,
              fontSize: "clamp(1.25rem, 1.8vw, 1.6rem)",
              lineHeight: 1.4,
            }}
            data-testid="grace-intro-greeting"
          >
            &ldquo;Hello. My name is Grace.&rdquo;
          </p>

          <div
            className="space-y-4"
            style={{
              color: INK,
              fontSize: "clamp(0.95rem, 1.05vw, 1.0625rem)",
              lineHeight: 1.7,
            }}
          >
            <p>
              I live here, in this calm room where evening light settles
              and the world quiets enough for you to hear yourself again.
            </p>
            <p>
              I am not here to fix you. I am not here to teach you.
              I am here to keep you company while you find your own breath.
            </p>
          </div>
        </div>
      </section>

      {/* HERE YOU MAY — soft list (below the fold) */}
      <section
        className="mx-auto max-w-2xl px-6 sm:px-10 pb-14 text-center"
        data-testid="grace-intro-offerings"
      >
        <div
          className="text-[0.7rem] uppercase tracking-[0.3em] mb-8"
          style={{ color: SAGE }}
        >
          Here, you may
        </div>
        <ul
          className="space-y-3"
          style={{
            color: INK,
            fontSize: "clamp(1rem, 1.2vw, 1.2rem)",
            lineHeight: 1.6,
          }}
        >
          {ROOM_OFFERINGS.map((line, i) => (
            <li key={i} data-testid={`grace-intro-offering-${i + 1}`}>
              {line}
            </li>
          ))}
        </ul>
      </section>

      {/* CLOSING + CTA */}
      <section
        className="mx-auto max-w-2xl px-6 sm:px-10 pb-28 text-center"
        data-testid="grace-intro-closing"
      >
        <p
          className="aurin-serif-italic mb-12"
          style={{
            color: INK_SOFT,
            fontSize: "clamp(1.2rem, 1.8vw, 1.5rem)",
            lineHeight: 1.5,
          }}
          data-testid="grace-intro-closing-line"
        >
          &ldquo;Take what you need. Leave what does not fit.
          <br />
          You are welcome to stay awhile.&rdquo;
        </p>

        <Link
          to="/grace/room"
          data-testid="grace-intro-enter-button"
          className="inline-block px-10 py-4 text-[0.75rem] uppercase tracking-[0.3em]
                     transition-colors duration-300"
          style={{
            border: `1px solid ${INK}`,
            color: INK,
            backgroundColor: "transparent",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = INK;
            e.currentTarget.style.color = PAPER;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "transparent";
            e.currentTarget.style.color = INK;
          }}
        >
          Enter Grace&rsquo;s room
        </Link>

        <p
          className="mt-10 text-[0.7rem] uppercase tracking-[0.3em]"
          style={{ color: INK_MUTE }}
          data-testid="grace-intro-signature"
        >
          — Grace
        </p>
      </section>
    </div>
  );
}
