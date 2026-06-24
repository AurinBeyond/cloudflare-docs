/**
 * GraceIntro.jsx — Host introduction page (v5 — founder mockup match).
 *
 * §HOST-INTRO 2026-02 (founder mockup 2026-06-24 09:00)
 *
 * Founder shipped a precise visual reference: vertical painting on
 * the left, decorative serif text panel on the right with botanical
 * dividers, icon-led offering list, sage pill-shaped CTA, and a
 * handwritten "Grace" signature at the bottom.
 *
 * This component reproduces that mockup faithfully using only code
 * (no new AI image cost). The painting is the existing empty-chair
 * watercolour, cropped to portrait aspect. When the Grace-in-chair
 * portrait lands, swap PAINTING_SRC — geometry is preserved.
 *
 * COMPOSITION
 *   ┌─────────────┬───────────────────────────┐
 *   │  PAINTING   │  KEEPER OF THE EVENING…   │
 *   │  (vertical) │       Grace               │
 *   │             │   ~ flourish ~            │
 *   │             │  Hello. My name is Grace. │
 *   │             │  intro lines              │
 *   │             │   HERE, YOU MAY           │
 *   │             │  🌿 Sit in stillness      │
 *   │             │  📖 Read or learn         │
 *   │             │  🎧 Listen                │
 *   │             │  ✏️ Write                 │
 *   │             │  🌙 Be                    │
 *   │             │   ~ flourish ~            │
 *   │             │  Take what you need…      │
 *   │             │  [ ENTER GRACE'S ROOM ]   │
 *   │             │  — Grace —                │
 *   └─────────────┴───────────────────────────┘
 *
 * VOICE LOCK (refined per mockup)
 *   - Each offering: short verb-phrase title + one supporting line
 *   - Anti-wellness, anti-judgment, anti-sell
 */
import React from "react";
import { Link } from "react-router-dom";
import { Leaf, BookOpen, Headphones, PenLine, Moon } from "lucide-react";

/* ------------ Source images ------------ */
const ROOM_ATMOSPHERE_SRC = "/style_samples/room_grace_sample_v2.png";
const GRACE_IN_CHAIR_SRC = "/style_samples/grace_gpt_reference.png";

// When the seated-Grace painting lands, change PAINTING_SRC to
// GRACE_IN_CHAIR_SRC. The layout already anticipates a vertical
// composition with Grace centred.
const PAINTING_SRC = GRACE_IN_CHAIR_SRC;
const GRACE_IS_IN_THE_CHAIR = true;

/* ------------ Palette ------------ */
const PAPER = "#F2E9D2";
const INK = "#3D2E1F";
const INK_DEEP = "#241809";
const INK_SOFT = "#5A4530";
const INK_MUTE = "#8A7560";
const SAGE = "#7A8B6F";
const SAGE_DEEP = "#5A6E48";
const RULE = "#C9B999";

/* ------------ Painting soft-edge mask ------------ */
const SOFT_MASK =
  "radial-gradient(ellipse 88% 92% at 50% 50%, rgba(0,0,0,1) 58%, rgba(0,0,0,0) 100%)";

/* ------------ Offerings (founder mockup copy) ------------ */
const OFFERINGS = [
  {
    icon: Leaf,
    title: "Sit in stillness",
    line: "Let the day settle and your breath deepen.",
  },
  {
    icon: BookOpen,
    title: "Read or learn",
    line: "Find wisdom in words that quiet the mind.",
  },
  {
    icon: Headphones,
    title: "Listen",
    line: "To stories, guidance and gentle presence.",
  },
  {
    icon: PenLine,
    title: "Write",
    line: "Pour your thoughts out onto the page.",
  },
  {
    icon: Moon,
    title: "Be",
    line: "Exactly as you are, for as long as you need.",
  },
];

/* ------------ Reusable inline flourish (botanical rule) ------------ */
function Flourish({ color = RULE }) {
  return (
    <div
      className="flex items-center justify-center gap-3 my-4"
      aria-hidden="true"
    >
      <span style={{ height: 1, width: 60, background: color, opacity: 0.55 }} />
      <Leaf size={14} style={{ color, opacity: 0.7 }} />
      <span style={{ height: 1, width: 60, background: color, opacity: 0.55 }} />
    </div>
  );
}

/* ------------ Page ------------ */
export default function GraceIntro() {
  return (
    <div
      data-testid="grace-intro-page"
      style={{
        backgroundColor: PAPER,
        color: INK,
        minHeight: "100vh",
        backgroundImage:
          "radial-gradient(ellipse at center, rgba(255,255,255,0.25) 0%, rgba(0,0,0,0) 70%)",
      }}
    >
      <div
        className="mx-auto grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-8 lg:gap-16
                   px-6 sm:px-10 lg:px-16 py-10 lg:py-16"
        style={{ maxWidth: 1400 }}
      >
        {/* ============== LEFT — VERTICAL PAINTING ============== */}
        <div
          className="relative"
          data-testid="grace-intro-painting-wrapper"
        >
          <div
            className="relative overflow-hidden mx-auto"
            style={{
              aspectRatio: "3 / 4",
              maxWidth: 560,
              width: "100%",
            }}
          >
            <img
              src={PAINTING_SRC}
              alt={
                GRACE_IS_IN_THE_CHAIR
                  ? "Watercolour painting of Grace — a woman seated in a deep sage-green velvet armchair beside a wooden window, holding a steaming teacup. Evening rain falls against the glass. A warm brass lantern, a glass teapot of amber tea, and a wool blanket draped across her lap. A fireplace glows behind her. Books and worn slippers rest on the wooden floor."
                  : "Watercolour painting of Grace's evening room — a deep sage-green velvet armchair beside a wooden window with rain on the glass, a warm brass lantern on a small wooden side table, a teacup with thin steam, a fireplace glowing softly, books and worn slippers on the floor."
              }
              draggable={false}
              loading="eager"
              data-testid="grace-intro-painting"
              className="absolute inset-0 w-full h-full select-none"
              style={{
                objectFit: "cover",
                objectPosition: "center 35%",
              }}
            />
          </div>
        </div>

        {/* ============== RIGHT — TEXT PANEL ============== */}
        <div
          className="relative flex flex-col"
          style={{ paddingTop: "1.5rem" }}
          data-testid="grace-intro-panel"
        >
          {/* botanical side rails — small decorative accents */}
          <div
            aria-hidden="true"
            className="hidden lg:block absolute left-0 top-8 bottom-8"
            style={{ width: 1, background: RULE, opacity: 0.35 }}
          />
          <div
            aria-hidden="true"
            className="hidden lg:block absolute right-0 top-8 bottom-8"
            style={{ width: 1, background: RULE, opacity: 0.35 }}
          />

          <div className="lg:px-8">
            {/* Eyebrow */}
            <div
              className="text-center text-[0.7rem] tracking-[0.3em] uppercase mb-4"
              style={{ color: INK_MUTE }}
              data-testid="grace-intro-eyebrow"
            >
              Keeper of the evening room
            </div>

            {/* Name */}
            <h1
              className="aurin-serif text-center tracking-tight"
              style={{
                color: INK_DEEP,
                fontSize: "clamp(3rem, 6vw, 5rem)",
                lineHeight: 1,
                margin: 0,
              }}
              data-testid="grace-intro-name"
            >
              Grace
            </h1>

            <Flourish />

            {/* Greeting */}
            <p
              className="aurin-serif-italic text-center"
              style={{
                color: INK_SOFT,
                fontSize: "clamp(1.2rem, 1.7vw, 1.5rem)",
                lineHeight: 1.4,
                marginTop: "0.75rem",
              }}
              data-testid="grace-intro-greeting"
            >
              Hello. My name is Grace.
            </p>

            {/* Intro */}
            <p
              className="text-center mt-4"
              style={{
                color: INK,
                fontSize: "clamp(0.98rem, 1.1vw, 1.1rem)",
                lineHeight: 1.7,
                maxWidth: 480,
                marginLeft: "auto",
                marginRight: "auto",
              }}
              data-testid="grace-intro-body"
            >
              I live in this calm room, where evening light and quiet
              presence help you slow down and breathe.
            </p>

            {/* HERE, YOU MAY heading */}
            <div
              className="flex items-center justify-center gap-3 mt-10 mb-6"
              aria-hidden="false"
            >
              <span style={{ height: 1, width: 36, background: RULE, opacity: 0.6 }} />
              <span
                className="text-[0.72rem] tracking-[0.3em] uppercase"
                style={{ color: SAGE_DEEP }}
                data-testid="grace-intro-offerings-heading"
              >
                Here, you may
              </span>
              <span style={{ height: 1, width: 36, background: RULE, opacity: 0.6 }} />
            </div>

            {/* Offerings list */}
            <ul
              className="space-y-5 max-w-md mx-auto"
              data-testid="grace-intro-offerings"
            >
              {OFFERINGS.map(({ icon: Icon, title, line }, i) => (
                <li
                  key={title}
                  className="flex items-start gap-4"
                  data-testid={`grace-intro-offering-${i + 1}`}
                >
                  <Icon
                    size={26}
                    strokeWidth={1.5}
                    style={{ color: SAGE_DEEP, flexShrink: 0, marginTop: 2 }}
                    aria-hidden="true"
                  />
                  <div>
                    <div
                      className="aurin-serif"
                      style={{
                        color: INK_DEEP,
                        fontSize: "1.15rem",
                        lineHeight: 1.2,
                        marginBottom: 2,
                      }}
                    >
                      {title}
                    </div>
                    <div
                      style={{
                        color: INK_SOFT,
                        fontSize: "0.92rem",
                        lineHeight: 1.5,
                      }}
                    >
                      {line}
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            <Flourish />

            {/* Closing */}
            <p
              className="aurin-serif-italic text-center mt-2"
              style={{
                color: INK_SOFT,
                fontSize: "clamp(1.05rem, 1.4vw, 1.25rem)",
                lineHeight: 1.55,
              }}
              data-testid="grace-intro-closing-line"
            >
              Take what you need. Leave what does not fit.
              <br />
              You are welcome to stay awhile.
            </p>

            {/* CTA — sage pill */}
            <div className="flex justify-center mt-8">
              <Link
                to="/grace/room"
                data-testid="grace-intro-enter-button"
                className="inline-block transition-colors duration-300"
                style={{
                  backgroundColor: SAGE_DEEP,
                  color: PAPER,
                  borderRadius: 9999,
                  padding: "0.95rem 2.4rem",
                  fontSize: "0.78rem",
                  letterSpacing: "0.3em",
                  textTransform: "uppercase",
                  boxShadow: "0 6px 16px -8px rgba(0,0,0,0.35)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = INK_DEEP;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = SAGE_DEEP;
                }}
              >
                Enter Grace&rsquo;s room
              </Link>
            </div>

            {/* Signature */}
            <div
              className="flex items-center justify-center gap-3 mt-10"
              aria-hidden="false"
            >
              <span style={{ height: 1, width: 70, background: RULE, opacity: 0.5 }} />
              <span
                className="aurin-serif-italic"
                style={{
                  color: INK_SOFT,
                  fontSize: "1.4rem",
                  letterSpacing: "0.02em",
                }}
                data-testid="grace-intro-signature"
              >
                Grace
              </span>
              <span style={{ height: 1, width: 70, background: RULE, opacity: 0.5 }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
