/**
 * KaelenIntro.jsx — Host introduction page for the Sara Forest room.
 *
 * §HOST-INTRO 2026-02 — second host intro (founder request 2026-06-24)
 *
 * Sara's symbol system (GPT 2026-06-23): oak · harbour · boat ·
 * nest · stone path. Feeling: home, generations, relationships.
 *
 * Uses the existing wider_circle_world_sample_v1.png painting
 * (generated 2026-02 night) — the oak tree, harbour, boat scene
 * with the four corner symbols. Until a Sara seated-portrait is
 * generated, this atmosphere image holds the page.
 *
 * Sara's room route is /parents-room (Sara Forest = 14 worlds of
 * parenting wisdom).
 */
import React from "react";
import { Link } from "react-router-dom";
import { Waves, Droplets, Mountain, Wind, Heart, Leaf } from "lucide-react";
import IntakeQuestion from "../components/IntakeQuestion";

const PAINTING_SRC = "/style_samples/kaelen_at_river_v1.png";
const HOST_PORTRAIT_SRC = "/style_samples/kaelen_at_river_v1.png";
const PAINTING_USED = HOST_PORTRAIT_SRC;
const HOST_IS_IN_THE_PAINTING = true;

const PAPER = "#F2E9D2";
const INK = "#3D2E1F";
const INK_DEEP = "#241809";
const INK_SOFT = "#5A4530";
const INK_MUTE = "#8A7560";
const SAGE_DEEP = "#5A6E48";
const RULE = "#C9B999";

const SOFT_MASK =
  "radial-gradient(ellipse 88% 92% at 50% 50%, rgba(0,0,0,1) 58%, rgba(0,0,0,0) 100%)";

const OFFERINGS = [
  {
    icon: Waves,
    title: "Return to the body",
    line: "Notice it before naming it.",
  },
  {
    icon: Droplets,
    title: "Breathe",
    line: "Slowly. With nothing to prove.",
  },
  {
    icon: Mountain,
    title: "Feel what is held",
    line: "Tension is information, not weakness.",
  },
  {
    icon: Wind,
    title: "Move gently",
    line: "The body wants small kindness, not heroics.",
  },
  {
    icon: Heart,
    title: "Be at home in yourself",
    line: "You are not a project to optimise.",
  },
];

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

export default function KaelenIntro() {
  return (
    <div
      data-testid="kaelen-intro-page"
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
        <div className="relative" data-testid="kaelen-intro-painting-wrapper">
          <div
            className="relative overflow-hidden mx-auto"
            style={{ aspectRatio: "3 / 4", maxWidth: 560, width: "100%" }}
          >
            <img
              src={PAINTING_USED}
              alt={
                HOST_IS_IN_THE_PAINTING
                  ? "Watercolour painting of Sara — a woman seated beneath a great oak tree near a small wooden harbour, a moored rowboat resting at the jetty, with calm sea reaching to a golden-sunset horizon. The painting carries the spirit of generations and quiet welcome."
                  : "Watercolour painting of Sara's world — a great oak tree on warm earth, a small wooden harbour with a moored rowboat, a calm sea reaching to a golden-sunset horizon. Four small symbols rest in the corners: a nest in branches, a stone path, soft grasses, and a lantern on the harbour post."
              }
              draggable={false}
              loading="eager"
              data-testid="kaelen-intro-painting"
              className="absolute inset-0 w-full h-full select-none"
              style={{
                objectFit: "cover",
                objectPosition: "center 45%",
                WebkitMaskImage: SOFT_MASK,
                maskImage: SOFT_MASK,
                WebkitMaskRepeat: "no-repeat",
                maskRepeat: "no-repeat",
              }}
            />
          </div>
        </div>

        {/* ============== RIGHT — TEXT PANEL ============== */}
        <div
          className="relative flex flex-col"
          style={{ paddingTop: "1.5rem" }}
          data-testid="kaelen-intro-panel"
        >
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
            <div
              className="text-center text-[0.7rem] tracking-[0.3em] uppercase mb-4"
              style={{ color: INK_MUTE }}
              data-testid="kaelen-intro-eyebrow"
            >
              Keeper of the body
            </div>

            <h1
              className="aurin-serif text-center tracking-tight"
              style={{
                color: INK_DEEP,
                fontSize: "clamp(3rem, 6vw, 5rem)",
                lineHeight: 1,
                margin: 0,
              }}
              data-testid="kaelen-intro-name"
            >
              Sara
            </h1>

            <Flourish />

            <p
              className="aurin-serif-italic text-center"
              style={{
                color: INK_SOFT,
                fontSize: "clamp(1.2rem, 1.7vw, 1.5rem)",
                lineHeight: 1.4,
                marginTop: "0.75rem",
              }}
              data-testid="kaelen-intro-greeting"
            >
              Hello. My name is Kaelen.
            </p>

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
              data-testid="kaelen-intro-body"
            >
              I live where the body remembers what the mind forgot — by the river, the roots, the stones. I do not fix you. I help you listen to what your body has been quietly trying to say.
            </p>

            <div
              className="flex items-center justify-center gap-3 mt-10 mb-6"
              aria-hidden="false"
            >
              <span style={{ height: 1, width: 36, background: RULE, opacity: 0.6 }} />
              <span
                className="text-[0.72rem] tracking-[0.3em] uppercase"
                style={{ color: SAGE_DEEP }}
                data-testid="kaelen-intro-offerings-heading"
              >
                Here, you may
              </span>
              <span style={{ height: 1, width: 36, background: RULE, opacity: 0.6 }} />
            </div>

            <ul
              className="space-y-5 max-w-md mx-auto"
              data-testid="kaelen-intro-offerings"
            >
              {OFFERINGS.map(({ icon: Icon, title, line }, i) => (
                <li
                  key={title}
                  className="flex items-start gap-4"
                  data-testid={`kaelen-intro-offering-${i + 1}`}
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

            <p
              className="aurin-serif-italic text-center mt-2"
              style={{
                color: INK_SOFT,
                fontSize: "clamp(1.05rem, 1.4vw, 1.25rem)",
                lineHeight: 1.55,
              }}
              data-testid="kaelen-intro-closing-line"
            >
              Take what you need. Leave what does not fit.
              <br />
              The river will be here when you return.
            </p>

            <div className="flex justify-center mt-8">
              <Link
                to="/body-world"
                data-testid="kaelen-intro-enter-button"
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
                Enter Kaelen&rsquo;s world
              </Link>
            </div>

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
                data-testid="kaelen-intro-signature"
              >
                Kaelen
              </span>
              <span style={{ height: 1, width: 70, background: RULE, opacity: 0.5 }} />
            </div>
          </div>
        </div>
      </div>
      <IntakeQuestion path="/kaelen/intro" />
    </div>
  );
}
