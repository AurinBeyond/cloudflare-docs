/**
 * GraceIntro.jsx — Host introduction page for the Grace room.
 *
 * §HOST-INTRO 2026-02 (founder + GPT, validated 2026-06-24 morning)
 *   "Külaline ei satu lihtsalt ruumi. Teda võetakse vastu."
 *
 * v3 LAYOUT (founder feedback 2026-06-24):
 *   - NO frame, NO drop shadow box on the painting
 *   - Painting much larger (fills hero band)
 *   - Soft fade-to-paper edges (no hard rectangle)
 *   - Text breathes BELOW the image, not beside it
 *   - The painting and the words feel like one scene, not two cards
 *
 * VISUAL ROLES (intentional split)
 *   - SanctuaryPreview hero  → mask + dust = mystery, "what is this?"
 *   - Grace intro hero       → painting + atmosphere = welcome, "come in"
 *
 * VOICE LOCK
 *   - First person ("Hello. My name is Grace.")
 *   - Anti-wellness, anti-judgment, anti-sell
 *   - Soft sentences, present tense, generous spacing
 *
 * BUDGET NOTE 2026-02-24
 *   When the Grace portrait lands (grace_portrait_v2_with_chair.png),
 *   she will be SEATED in the sage armchair — one integrated scene,
 *   not portrait + room composite. Until then, the room painting
 *   holds the page alone.
 */
import React from "react";
import { Link } from "react-router-dom";

const ROOM_ATMOSPHERE_SRC = "/style_samples/room_grace_sample_v2.png";
const PORTRAIT_WITH_CHAIR_SRC = "/style_samples/grace_in_chair_v1.png";

// Until the seated-Grace painting lands, the empty-chair scene holds
// the page. Both files have identical aspect — swap by changing SRC.
const HERO_IMG = ROOM_ATMOSPHERE_SRC;
const GRACE_IS_IN_THE_CHAIR = false; // flip when seated-portrait exists

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

export default function GraceIntro() {
  return (
    <div
      data-testid="grace-intro-page"
      style={{ backgroundColor: PAPER, color: INK, minHeight: "100vh" }}
    >
      {/* HERO BAND — full-bleed atmosphere */}
      <section
        className="relative w-full"
        data-testid="grace-intro-hero"
        style={{ paddingTop: "2.5rem" }}
      >
        {/* Painting — large, no frame, soft fade into paper */}
        <div
          className="relative mx-auto"
          style={{ maxWidth: "1400px" }}
          data-testid="grace-intro-painting-wrapper"
        >
          <img
            src={HERO_IMG}
            alt={
              GRACE_IS_IN_THE_CHAIR
                ? "A watercolour painting of Grace seated in a deep sage-green velvet armchair beside a wooden window, evening rain on the glass, a warm brass lantern and a steaming teacup on a small wooden side table, embers glowing softly in a fireplace behind her, a cream wool blanket draped across her lap."
                : "A watercolour painting of an evening room — a deep sage-green velvet armchair beside a wooden window with rain on the glass, a soft cream blanket draped over the arm, a small wooden side table with a warm brass lantern and a teacup with thin steam rising, a fireplace with embers glowing softly."
            }
            className="block w-full h-auto select-none"
            draggable={false}
            loading="eager"
            data-testid="grace-intro-painting"
            style={{
              // Soft fade-to-paper edges (mask) so the painting
              // dissolves into the cream rather than sitting in a box.
              WebkitMaskImage:
                "radial-gradient(ellipse 90% 92% at 50% 50%, #000 60%, transparent 100%)",
              maskImage:
                "radial-gradient(ellipse 90% 92% at 50% 50%, #000 60%, transparent 100%)",
            }}
          />
        </div>

        {/* Eyebrow + Name floats over the painting bottom-left
            (large screens) — feels like a hand-written caption, not
            a separate card. */}
        <div
          className="absolute left-0 right-0 bottom-6 sm:bottom-10 px-6 sm:px-16
                     text-left pointer-events-none"
          data-testid="grace-intro-caption-overlay"
        >
          <div className="mx-auto max-w-[1400px]">
            <div
              className="text-[0.7rem] uppercase tracking-[0.3em] mb-2"
              style={{ color: SAGE }}
              data-testid="grace-intro-eyebrow"
            >
              Keeper of the evening room
            </div>
            <h1
              className="aurin-serif tracking-tight"
              style={{
                color: INK_DEEP,
                fontSize: "clamp(3rem, 8vw, 6rem)",
                lineHeight: 1,
              }}
              data-testid="grace-intro-name"
            >
              Grace
            </h1>
          </div>
        </div>
      </section>

      {/* GREETING — flows beneath the painting like a letter */}
      <section
        className="mx-auto max-w-2xl px-6 sm:px-10 pt-20 pb-12 text-center"
        data-testid="grace-intro-greeting-section"
      >
        <p
          className="aurin-serif-italic"
          style={{
            color: INK_SOFT,
            fontSize: "clamp(1.4rem, 3vw, 2rem)",
            lineHeight: 1.4,
            marginBottom: "2.5rem",
          }}
          data-testid="grace-intro-greeting"
        >
          &ldquo;Hello. My name is Grace.&rdquo;
        </p>

        <div
          className="space-y-6 leading-relaxed"
          style={{
            color: INK,
            fontSize: "clamp(1rem, 1.2vw, 1.15rem)",
            lineHeight: 1.75,
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
      </section>

      {/* HERE YOU MAY — soft list */}
      <section
        className="mx-auto max-w-2xl px-6 sm:px-10 pb-16 text-center"
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
            fontSize: "clamp(1rem, 1.3vw, 1.25rem)",
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
        className="mx-auto max-w-2xl px-6 sm:px-10 pb-32 text-center"
        data-testid="grace-intro-closing"
      >
        <p
          className="aurin-serif-italic mb-14"
          style={{
            color: INK_SOFT,
            fontSize: "clamp(1.25rem, 2.2vw, 1.6rem)",
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
          className="mt-12 text-[0.7rem] uppercase tracking-[0.3em]"
          style={{ color: INK_MUTE }}
          data-testid="grace-intro-signature"
        >
          — Grace
        </p>
      </section>
    </div>
  );
}
