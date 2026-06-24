/**
 * GraceIntro.jsx — Host introduction page for the Grace room.
 *
 * §HOST-INTRO 2026-02 (founder + GPT, validated 2026-06-24 morning)
 *   "Külaline ei satu lihtsalt ruumi. Teda võetakse vastu."
 *   GPT framing: landing = mansion gate (mask, mystery).
 *                host-intro = the keeper opens the door (face, trust).
 *
 * VISUAL ROLES (intentional split)
 *   - SanctuaryPreview hero  → mask + dust = mystery, "what is this?"
 *   - Grace intro hero       → portrait + room atmosphere = welcome, "ah, someone lives here"
 *
 * STRUCTURE
 *   1. Hero: 60/40 split — Grace portrait (left) · greeting text (right)
 *   2. "Here you may..." quiet list of room offerings
 *   3. One primary CTA: ENTER GRACE'S ROOM → /grace/room
 *
 * VOICE LOCK
 *   - First person ("Hello. My name is Grace.")
 *   - Anti-wellness, anti-judgment, anti-sell (matches §IDENTITY-LOCK)
 *   - No "transform your life", "heal", "thrive", "wellness"
 *   - Soft sentences, present tense, generous spacing
 *
 * BUDGET NOTE 2026-02-24
 *   The Grace portrait (grace_portrait_v1.png) was queued for
 *   generation when Emergent LLM Key hit budget cap. Until the
 *   portrait is in /style_samples/, this page falls back to the
 *   room atmosphere image (room_grace_sample_v2.png) so the
 *   layout reads correctly. Swap PORTRAIT_SRC the moment the
 *   portrait file lands.
 */
import React from "react";
import { Link } from "react-router-dom";

const PORTRAIT_SRC = "/style_samples/grace_portrait_v1.png";
const ROOM_ATMOSPHERE_SRC = "/style_samples/room_grace_sample_v2.png";

// Until portrait lands, use atmosphere image as visual anchor.
// The page still tells the right story — Grace's room is shown
// instead of Grace's face. We mark this in the alt text.
const HERO_IMG = ROOM_ATMOSPHERE_SRC;
const HERO_IS_PORTRAIT = false; // flip to true when grace_portrait_v1.png exists

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
      style={{
        backgroundColor: "#F4ECD8",
        color: "#3D2E1F",
        minHeight: "100vh",
      }}
    >
      {/* HERO — split portrait + greeting */}
      <section
        className="mx-auto max-w-7xl px-6 sm:px-10 pt-16 sm:pt-24 pb-20
                   grid grid-cols-1 lg:grid-cols-[1.1fr_1fr] gap-12 lg:gap-16
                   items-center"
        data-testid="grace-intro-hero"
      >
        {/* LEFT: Grace painting */}
        <div className="relative">
          <img
            src={HERO_IMG}
            alt={
              HERO_IS_PORTRAIT
                ? "A watercolour portrait of Grace — a woman in her late 40s with kind hazel eyes, shoulder-length warm brown hair, wearing a cream linen blouse and dusty sage cardigan, looking quietly at the viewer with a small welcoming smile."
                : "A watercolour painting of Grace's evening room — a deep sage-green velvet armchair beside a wooden window with rain on the glass, a soft cream blanket draped over one arm, a small wooden side table with a warm brass lantern and a teacup with thin steam rising, a fireplace with embers glowing softly in the background."
            }
            className="w-full h-auto rounded-sm shadow-[0_30px_60px_-30px_rgba(60,40,20,0.35)]
                       select-none"
            draggable={false}
            loading="eager"
            data-testid="grace-intro-portrait"
          />
        </div>

        {/* RIGHT: greeting voice */}
        <div className="space-y-7">
          <div>
            <div
              className="text-[0.7rem] uppercase tracking-[0.3em] mb-3"
              style={{ color: "#7A8B6F" }}
              data-testid="grace-intro-eyebrow"
            >
              Keeper of the evening room
            </div>
            <h1
              className="aurin-serif text-5xl sm:text-6xl leading-[1.05] tracking-tight"
              style={{ color: "#2A1F12" }}
              data-testid="grace-intro-name"
            >
              Grace
            </h1>
          </div>

          <p
            className="aurin-serif-italic text-xl sm:text-2xl leading-relaxed"
            style={{ color: "#5A4530" }}
            data-testid="grace-intro-greeting"
          >
            &ldquo;Hello. My name is Grace.&rdquo;
          </p>

          <div
            className="space-y-5 text-base sm:text-[1.0625rem] leading-relaxed"
            style={{ color: "#4A3826" }}
          >
            <p>
              I live here, in this calm room where evening light settles
              and the world quiets enough for you to hear yourself again.
            </p>
            <p>
              I am not here to fix you. I am not here to teach you. I am
              here to keep you company while you find your own breath.
            </p>
          </div>
        </div>
      </section>

      {/* ROOM OFFERINGS — "here you may" list */}
      <section
        className="mx-auto max-w-3xl px-6 sm:px-10 pb-20 text-center"
        data-testid="grace-intro-offerings"
      >
        <div
          className="text-[0.7rem] uppercase tracking-[0.3em] mb-8"
          style={{ color: "#7A8B6F" }}
        >
          Here, you may
        </div>
        <ul
          className="space-y-4 text-lg sm:text-xl leading-relaxed"
          style={{ color: "#3D2E1F" }}
        >
          {ROOM_OFFERINGS.map((line, i) => (
            <li
              key={i}
              data-testid={`grace-intro-offering-${i + 1}`}
            >
              {line}
            </li>
          ))}
        </ul>
      </section>

      {/* CLOSING + CTA */}
      <section
        className="mx-auto max-w-3xl px-6 sm:px-10 pb-28 text-center"
        data-testid="grace-intro-closing"
      >
        <p
          className="aurin-serif-italic text-xl sm:text-2xl leading-relaxed mb-12"
          style={{ color: "#5A4530" }}
          data-testid="grace-intro-closing-line"
        >
          &ldquo;Take what you need. Leave what does not fit.<br />
          You are welcome to stay awhile.&rdquo;
        </p>

        <Link
          to="/grace/room"
          data-testid="grace-intro-enter-button"
          className="inline-block px-10 py-4 text-[0.75rem] uppercase tracking-[0.3em]
                     transition-colors duration-300"
          style={{
            border: "1px solid #3D2E1F",
            color: "#3D2E1F",
            backgroundColor: "transparent",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "#3D2E1F";
            e.currentTarget.style.color = "#F4ECD8";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "transparent";
            e.currentTarget.style.color = "#3D2E1F";
          }}
        >
          Enter Grace&rsquo;s room
        </Link>

        <p
          className="mt-10 text-[0.7rem] uppercase tracking-[0.3em]"
          style={{ color: "#8A7560" }}
          data-testid="grace-intro-signature"
        >
          — Grace
        </p>
      </section>
    </div>
  );
}
