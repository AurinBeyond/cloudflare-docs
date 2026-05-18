/**
 * SanctuaryPreview — Founder review route (2026-05-18 v2)
 *
 * Full-bleed polished landing experience.
 *
 * v2 changes (Founder + Mike + GPT + AH synthesis, 2026-05-18 PM):
 *   - HERO replaced with Mike's reference: "Welcome back to yourself."
 *     centered serif, "You do not have to perform here." subtitle,
 *     bordered "STEP INSIDE" CTA, "MATRIX AURIN" wordmark left,
 *     "ENTER" bordered nav button right. The mask image breathes
 *     through with a softer vignette so the face is visible.
 *   - NEW: The Open World section — Library, Bookstore, Reflections,
 *     Kids Universe surfaced as the free layer, addressing GPT/AH
 *     audit "practical product clarity is too soft".
 *   - NEW: Ways to be here — Mike's EXACT prose-pricing copy in EUR
 *     (€45 First Step · €120 Steady Presence · €380 Your Own Room).
 *   - NEW: The Voice Meter — Tesla / fuel symbolism: platform
 *     membership is the car, voice minutes are the separate fuel.
 *     Top-ups visible but quiet.
 *   - Stronger CTA hierarchy across the page (bordered for primary,
 *     ghost underline for secondary).
 *
 * Untouched (sealed core, scope lock V2 honored):
 *   - audio pipeline (RoomConvaiChat.jsx)
 *   - ElevenLabs integration / WebSocket / signed-url flow
 *   - backend session_cap / presence runtime
 *   - auth, WandererGate, route guards
 *   - production / Home.jsx
 */
import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";

const HERO = "/sanctuary/hero-mask.png";
const ATMOSPHERE = "/sanctuary/atmosphere.png";
const GROUNDED = "/sanctuary/grounded-presence.png";
const WINGS = "/sanctuary/sanctuary-wings.png";
const WARMTH = "/sanctuary/warmth-trust.png";

const SERIF = '"Cormorant Garamond", "EB Garamond", Georgia, serif';
const BRASS = "#c4a46b";
const BRASS_BRIGHT = "#d4b67d";
const CREAM = "#f0eadd";
const SOFT = "#bcb4a3";
const MUTED = "#a59f93";
const GREY = "#7a7468";

function useReveal() {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          io.disconnect();
        }
      },
      { rootMargin: "-80px 0px -80px 0px", threshold: 0.12 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return { ref, visible };
}

function RevealBlock({ children, delay = 0, className = "" }) {
  const { ref, visible } = useReveal();
  return (
    <div
      ref={ref}
      className={`transition-all duration-[1400ms] ease-out ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
      } ${className}`}
      style={{ transitionDelay: visible ? `${delay}ms` : "0ms" }}
    >
      {children}
    </div>
  );
}

function SanctuaryNav() {
  return (
    <nav
      data-testid="sanctuary-nav"
      className="fixed top-[28px] left-0 right-0 z-50 backdrop-blur-md bg-[rgba(10,9,8,0.42)] border-b border-[rgba(196,164,107,0.08)]"
    >
      <div className="max-w-[1320px] mx-auto px-6 sm:px-10 h-[72px] flex items-center justify-between">
        <Link
          to="/sanctuary-preview"
          data-testid="sanctuary-logo"
          className="text-[13px] tracking-[0.42em] uppercase text-[#e8e1d5] font-light"
          style={{ fontFamily: SERIF, letterSpacing: "0.42em" }}
        >
          Matrix&nbsp;Aurin
        </Link>
        <div className="hidden md:flex items-center gap-9 text-[11.5px] tracking-[0.24em] uppercase text-[#a59f93]">
          <a href="#worlds" className="hover:text-[#e8e1d5] transition-colors duration-500">Worlds</a>
          <a href="#rooms" className="hover:text-[#e8e1d5] transition-colors duration-500">Rooms</a>
          <a href="#open-world" className="hover:text-[#e8e1d5] transition-colors duration-500">Open World</a>
          <a href="#ways" className="hover:text-[#e8e1d5] transition-colors duration-500">Ways to be here</a>
          <a href="#philosophy" className="hover:text-[#e8e1d5] transition-colors duration-500">Philosophy</a>
        </div>
        <Link
          to="/portal"
          data-testid="sanctuary-portal-btn"
          className="text-[11px] tracking-[0.32em] uppercase text-[#c4a46b] border border-[rgba(196,164,107,0.55)] px-7 py-2.5 hover:text-[#0b0a08] hover:bg-[#c4a46b] transition-colors duration-500"
        >
          Enter
        </Link>
      </div>
    </nav>
  );
}

// §HERO — Mike's reference: centered serif title, italic accent, bordered CTA.
function HeroSection() {
  const { ref, visible } = useReveal();
  return (
    <section
      ref={ref}
      data-testid="sanctuary-hero"
      className="relative min-h-screen w-full overflow-hidden flex items-center justify-center"
    >
      <div className="absolute inset-0">
        <img
          src={HERO}
          alt=""
          aria-hidden="true"
          data-testid="hero-mask-image"
          className={`w-full h-full object-cover transition-all duration-[2400ms] ease-out ${
            visible ? "opacity-100 scale-100" : "opacity-0 scale-[1.04]"
          }`}
        />
        {/* Softer cinematic vignette — face must remain visible (Mike ref) */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(10,9,8,0.45)_0%,_rgba(10,9,8,0.78)_100%)]" />
        <div className="absolute inset-x-0 top-0 h-[160px] bg-gradient-to-b from-[rgba(10,9,8,0.85)] to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-[200px] bg-gradient-to-t from-[rgba(10,9,8,0.95)] to-transparent" />
      </div>

      <div className="relative z-10 max-w-[1100px] mx-auto px-6 sm:px-10 pt-[180px] pb-32 text-center">
        <div
          className={`transition-all duration-[1800ms] ease-out ${
            visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <h1
            data-testid="hero-title"
            className="font-light text-[44px] sm:text-[68px] lg:text-[88px] leading-[1.06] text-[#f0eadd] tracking-[-0.012em]"
            style={{ fontFamily: SERIF }}
          >
            Welcome back<br />
            <span className="italic text-[#d4b67d]">to yourself.</span>
          </h1>
          <p
            data-testid="hero-subtitle"
            className="mt-12 text-[15.5px] sm:text-[17px] tracking-[0.06em] text-[#bcb4a3] italic font-light"
            style={{ fontFamily: SERIF }}
          >
            You do not have to perform here.
          </p>
          <div className="mt-14 flex flex-col sm:flex-row items-center justify-center gap-6">
            <Link
              to="/portal"
              data-testid="hero-cta-step-inside"
              className="inline-flex items-center gap-3 text-[12px] tracking-[0.36em] uppercase text-[#c4a46b] border border-[rgba(196,164,107,0.55)] px-12 py-4 hover:text-[#0b0a08] hover:bg-[#c4a46b] transition-colors duration-700"
            >
              Step Inside
            </Link>
            <a
              href="#worlds"
              data-testid="hero-cta-walk"
              className="text-[11px] tracking-[0.28em] uppercase text-[#a59f93] hover:text-[#e8e1d5] transition-colors duration-500 underline-offset-[8px] hover:underline"
            >
              Walk through first
            </a>
          </div>
          <p
            data-testid="hero-season"
            className="mt-20 text-[12.5px] tracking-[0.18em] italic text-[#7a7468] font-light"
            style={{ fontFamily: SERIF }}
          >
            The doors are open this season.
          </p>
        </div>
      </div>

      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10 text-[10px] tracking-[0.4em] uppercase text-[#7a7468] animate-pulse">
        ↓ &nbsp; descend
      </div>
    </section>
  );
}

function TwoWorldsSection() {
  return (
    <section
      id="worlds"
      data-testid="sanctuary-worlds"
      className="relative w-full bg-[#0b0a08] py-32 sm:py-44"
    >
      <div className="max-w-[1180px] mx-auto px-6 sm:px-10">
        <RevealBlock>
          <p className="text-[11px] tracking-[0.42em] uppercase text-[#c4a46b] mb-7 text-center">
            — Two Worlds, One Sanctuary
          </p>
          <h2
            className="text-center font-light text-[32px] sm:text-[44px] lg:text-[52px] leading-[1.12] text-[#f0eadd] max-w-[840px] mx-auto tracking-[-0.012em]"
            style={{ fontFamily: SERIF }}
          >
            The inner world and the structured world,<br />
            <span className="italic text-[#d4b67d]">in the same breath.</span>
          </h2>
        </RevealBlock>

        <div className="mt-24 grid md:grid-cols-2 gap-16 lg:gap-20">
          <RevealBlock delay={120}>
            <div
              data-testid="world-emotional"
              className="relative border border-[rgba(196,164,107,0.18)] bg-[rgba(20,18,15,0.45)] p-10 sm:p-12 h-full"
            >
              <p className="text-[10.5px] tracking-[0.44em] uppercase text-[#c4a46b] mb-6">I · Inner</p>
              <h3
                className="text-[26px] sm:text-[30px] leading-[1.2] text-[#f0eadd] font-light mb-6"
                style={{ fontFamily: SERIF }}
              >
                The Sanctuary <span className="italic text-[#bcb4a3]">— reflection &amp; emotional clarity</span>
              </h3>
              <p className="text-[15.5px] leading-[1.85] text-[#bcb4a3] font-light">
                A quiet inner space for the moments when life asks too much.
                Slow journeys. Honest reflection. A guide who listens without
                hurry, without scoring, without storage of who you have been.
              </p>
              <div className="mt-10 pt-7 border-t border-[rgba(196,164,107,0.12)] text-[11.5px] tracking-[0.2em] uppercase text-[#7a7468]">
                Journeys · Reflection · Sanctuary atmosphere
              </div>
            </div>
          </RevealBlock>

          <RevealBlock delay={220}>
            <div
              data-testid="world-practical"
              className="relative border border-[rgba(196,164,107,0.18)] bg-[rgba(20,18,15,0.45)] p-10 sm:p-12 h-full"
            >
              <p className="text-[10.5px] tracking-[0.44em] uppercase text-[#c4a46b] mb-6">II · Rooms</p>
              <h3
                className="text-[26px] sm:text-[30px] leading-[1.2] text-[#f0eadd] font-light mb-6"
                style={{ fontFamily: SERIF }}
              >
                The Rooms <span className="italic text-[#bcb4a3]">— guided structure &amp; practice</span>
              </h3>
              <p className="text-[15.5px] leading-[1.85] text-[#bcb4a3] font-light">
                Four distinct rooms, each with its own atmosphere and its own
                guide. Move through what the moment asks of you — clarity,
                the body, parenthood, or a quiet course of study.
              </p>
              <div className="mt-10 pt-7 border-t border-[rgba(196,164,107,0.12)] text-[11.5px] tracking-[0.2em] uppercase text-[#7a7468]">
                Rooms · Learning paths · Guided progression
              </div>
            </div>
          </RevealBlock>
        </div>
      </div>
    </section>
  );
}

function RoomsSection() {
  const rooms = useMemo(
    () => [
      {
        n: "I",
        name: "Clarity Release",
        sub: "The Private Room",
        body: "A confidential space for what cannot be said aloud yet. The room keeps no score.",
        img: GROUNDED,
      },
      {
        n: "II",
        name: "Body Room",
        sub: "The Listening Room",
        body: "Where the body is asked first. Slow attention to what carries underneath the words.",
        img: WINGS,
      },
      {
        n: "III",
        name: "Parents' Room",
        sub: "The Hearth Room",
        body: "For the ones holding others. A quiet hour for the part of you that rarely rests.",
        img: WARMTH,
      },
      {
        n: "IV",
        name: "Course Room",
        sub: "The Study Room",
        body: "Structured study and gentle progression. Books, practices, and a measured rhythm.",
        img: ATMOSPHERE,
      },
    ],
    [],
  );

  return (
    <section
      id="rooms"
      data-testid="sanctuary-rooms"
      className="relative w-full bg-[#0b0a08] py-32"
    >
      <div className="max-w-[1180px] mx-auto px-6 sm:px-10">
        <RevealBlock>
          <p className="text-[11px] tracking-[0.42em] uppercase text-[#c4a46b] mb-7">
            — Four Doors
          </p>
          <h2
            className="text-[32px] sm:text-[42px] lg:text-[48px] leading-[1.14] text-[#f0eadd] font-light max-w-[760px] tracking-[-0.012em]"
            style={{ fontFamily: SERIF }}
          >
            Each room holds its own atmosphere.<br />
            <span className="italic text-[#bcb4a3]">You choose which to open.</span>
          </h2>
        </RevealBlock>

        <div className="mt-24 space-y-24">
          {rooms.map((r, i) => (
            <RevealBlock key={r.n} delay={i * 80}>
              <div
                data-testid={`room-${r.n.toLowerCase()}`}
                className={`grid md:grid-cols-12 gap-10 lg:gap-16 items-center ${
                  i % 2 === 1 ? "md:[&>*:first-child]:order-2" : ""
                }`}
              >
                <div className="md:col-span-5 relative aspect-[4/5] overflow-hidden border border-[rgba(196,164,107,0.14)]">
                  <img
                    src={r.img}
                    alt=""
                    aria-hidden="true"
                    className="w-full h-full object-cover transition-transform duration-[2400ms] ease-out hover:scale-[1.03]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[rgba(10,9,8,0.6)] to-transparent" />
                </div>
                <div className="md:col-span-7">
                  <p className="text-[10.5px] tracking-[0.44em] uppercase text-[#c4a46b] mb-5">
                    {r.n} · {r.sub}
                  </p>
                  <h3
                    className="text-[34px] sm:text-[42px] leading-[1.08] text-[#f0eadd] font-light mb-7"
                    style={{ fontFamily: SERIF }}
                  >
                    {r.name}
                  </h3>
                  <p className="text-[16px] leading-[1.85] text-[#bcb4a3] max-w-[480px] font-light">
                    {r.body}
                  </p>
                </div>
              </div>
            </RevealBlock>
          ))}
        </div>

        {/* Kids Universe — soft mention (separate ecosystem, surfaced quietly) */}
        <RevealBlock delay={400}>
          <div className="mt-32 text-center border-t border-[rgba(196,164,107,0.12)] pt-14 max-w-[680px] mx-auto">
            <p className="text-[10.5px] tracking-[0.44em] uppercase text-[#c4a46b] mb-5">
              ✦ &nbsp; A quieter wing for younger hearts
            </p>
            <p
              className="text-[18px] sm:text-[22px] leading-[1.6] text-[#bcb4a3] italic font-light"
              style={{ fontFamily: SERIF }}
            >
              Kids Universe — angel stories, gentle coloring, and the
              softest version of the sanctuary, held for the little ones.
            </p>
          </div>
        </RevealBlock>
      </div>
    </section>
  );
}

// §OPEN WORLD — addresses GPT/AH audit: practical product clarity was too soft.
// Surfaces the FREE layer (Library, Bookstore, Reflections, Kids stories)
// so visitors understand what they can explore before paying.
function OpenWorldSection() {
  const layers = [
    {
      title: "The Library",
      body: "Reflections, journal entries, slow reads — open to anyone who wanders in.",
      tag: "Free to read",
    },
    {
      title: "The Bookstore",
      body: "A small collection of original books and angel stories. Each title is its own quiet object.",
      tag: "From €9 · once",
    },
    {
      title: "The Courses",
      body: "Self-paced studies — The Body Knows First, Beyond the Matrix, and others — read at your own rhythm.",
      tag: "From €19 · once",
    },
    {
      title: "Kids Universe",
      body: "Angel stories, coloring pages, and the gentlest version of the sanctuary for the youngest visitors.",
      tag: "Free entry",
    },
  ];

  return (
    <section
      id="open-world"
      data-testid="sanctuary-openworld"
      className="relative w-full bg-[#0b0a08] py-32 overflow-hidden"
    >
      <div className="absolute inset-0 opacity-[0.10]">
        <img src={ATMOSPHERE} alt="" aria-hidden="true" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-[rgba(10,9,8,0.85)] via-[rgba(10,9,8,0.95)] to-[rgba(10,9,8,1)]" />
      </div>

      <div className="relative z-10 max-w-[1180px] mx-auto px-6 sm:px-10">
        <RevealBlock>
          <p className="text-[11px] tracking-[0.42em] uppercase text-[#c4a46b] mb-7 text-center">
            — The Open World
          </p>
          <h2
            className="text-center text-[32px] sm:text-[44px] lg:text-[52px] leading-[1.14] text-[#f0eadd] font-light max-w-[820px] mx-auto tracking-[-0.012em]"
            style={{ fontFamily: SERIF }}
          >
            What stays open<br />
            <span className="italic text-[#d4b67d]">without asking anything in return.</span>
          </h2>
          <p className="mt-9 text-center text-[15.5px] leading-[1.85] text-[#a59f93] max-w-[600px] mx-auto font-light">
            Before any threshold, there is a long, quiet exploration layer.
            Read what is written. Read what has been thought through. Bring
            your children. No invitation, no payment, no name required.
          </p>
        </RevealBlock>

        <div className="mt-20 grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {layers.map((l, i) => (
            <RevealBlock key={l.title} delay={i * 90}>
              <div
                data-testid={`openworld-${l.title.toLowerCase().replace(/\s+/g, "-")}`}
                className="h-full border border-[rgba(196,164,107,0.14)] bg-[rgba(20,18,15,0.45)] p-8 hover:border-[rgba(196,164,107,0.32)] transition-colors duration-700"
              >
                <h3
                  className="text-[22px] leading-[1.2] text-[#f0eadd] font-light mb-4"
                  style={{ fontFamily: SERIF }}
                >
                  {l.title}
                </h3>
                <p className="text-[14px] leading-[1.8] text-[#bcb4a3] font-light mb-7">
                  {l.body}
                </p>
                <p
                  className="text-[11px] tracking-[0.22em] uppercase text-[#c4a46b] pt-5 border-t border-[rgba(196,164,107,0.12)]"
                >
                  {l.tag}
                </p>
              </div>
            </RevealBlock>
          ))}
        </div>
      </div>
    </section>
  );
}

// §WAYS TO BE HERE — Mike's exact prose-pricing copy (EUR).
// Architectural distinction: Platform Access (rooms, reading, text-to-text)
// is SEPARATE from Live Voice Sessions (high-cost ElevenLabs runtime).
// Each tier includes a BASELINE voice allotment; further voice = fuel (next section).
function WaysToBeHereSection() {
  const tiers = [
    {
      key: "first-step",
      name: "A First Step",
      tagline: "One session. One quiet hour. No commitment.",
      lede: "Enter one room, stay as long as you need, leave when you're ready. This is simply a beginning.",
      includes: [
        "Access to one room of your choosing for this session",
        "A guided live AI voice session at your pace",
        "No subscription, no follow-up pressure",
      ],
      price: "€45",
      cadence: "one session",
      cta: "Begin quietly",
    },
    {
      key: "steady-presence",
      name: "A Steady Presence",
      tagline: "All rooms. Monthly companionship. Return as often as you need.",
      lede: "Move freely between all rooms, with a monthly voice session to ground your journey. You are welcome here, always.",
      includes: [
        "Unlimited access to all four rooms — reading, reflection, text-to-text chat",
        "One private live AI voice session per month",
        "Priority access to new spaces",
        "The quiet community thread",
      ],
      price: "€120",
      cadence: "per month",
      cta: "Step in",
      featured: true,
    },
    {
      key: "your-own-room",
      name: "Your Own Room",
      tagline: "A space held only for you.",
      lede: "For those ready for sustained, intimate work. Weekly voice sessions, full sanctuary access, and a private channel — your own corner of this sanctuary.",
      includes: [
        "Full access to all rooms — reading, reflection, text-to-text chat",
        "Weekly private live AI voice sessions — four sessions per month",
        "Priority presence and response",
        "Early access to future sanctuaries",
        "Direct channel for quiet requests",
      ],
      price: "€380",
      cadence: "per month",
      cta: "Enter gently",
    },
  ];

  return (
    <section
      id="ways"
      data-testid="sanctuary-ways"
      className="relative w-full bg-[#0b0a08] py-32 sm:py-40"
    >
      <div className="max-w-[1220px] mx-auto px-6 sm:px-10">
        <RevealBlock>
          <p className="text-[11px] tracking-[0.42em] uppercase text-[#c4a46b] mb-7 text-center">
            — Ways to be here
          </p>
          <h2
            className="text-center text-[34px] sm:text-[48px] lg:text-[56px] leading-[1.1] text-[#f0eadd] font-light max-w-[820px] mx-auto tracking-[-0.012em]"
            style={{ fontFamily: SERIF }}
          >
            There is no wrong way<br />
            <span className="italic text-[#d4b67d]">to arrive.</span>
          </h2>
          <p
            className="mt-9 text-center text-[16px] leading-[1.85] text-[#a59f93] max-w-[640px] mx-auto italic font-light"
            style={{ fontFamily: SERIF }}
          >
            Each path holds space for you differently. Begin wherever feels true.
          </p>
        </RevealBlock>

        <div className="mt-24 grid md:grid-cols-3 gap-7 lg:gap-9 items-stretch">
          {tiers.map((t, i) => (
            <RevealBlock key={t.key} delay={i * 120}>
              <div
                data-testid={`ways-${t.key}`}
                className={`relative h-full flex flex-col p-10 sm:p-12 border ${
                  t.featured
                    ? "border-[rgba(196,164,107,0.45)] bg-[rgba(28,24,18,0.55)]"
                    : "border-[rgba(196,164,107,0.14)] bg-[rgba(20,18,15,0.45)]"
                }`}
              >
                {t.featured ? (
                  <span
                    className="absolute -top-3 left-1/2 -translate-x-1/2 text-[10px] tracking-[0.36em] uppercase text-[#0b0a08] bg-[#c4a46b] px-4 py-1"
                  >
                    Most chosen
                  </span>
                ) : null}

                <h3
                  className="text-[30px] sm:text-[34px] leading-[1.14] text-[#f0eadd] font-light mb-4"
                  style={{ fontFamily: SERIF }}
                >
                  {t.name}
                </h3>
                <p
                  className="text-[14.5px] italic text-[#a59f93] leading-[1.7] mb-6"
                  style={{ fontFamily: SERIF }}
                >
                  {t.tagline}
                </p>
                <p className="text-[14.5px] leading-[1.82] text-[#bcb4a3] font-light mb-8">
                  {t.lede}
                </p>

                <ul className="space-y-3.5 mb-10">
                  {t.includes.map((line, j) => (
                    <li
                      key={j}
                      className="flex items-start gap-3 text-[13.5px] leading-[1.7] text-[#bcb4a3] font-light"
                    >
                      <span className="text-[#c4a46b] mt-[6px] text-[8px]">◆</span>
                      <span>{line}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-auto pt-7 border-t border-[rgba(196,164,107,0.14)]">
                  <div className="flex items-baseline gap-2 mb-7">
                    <span
                      className="text-[44px] leading-none text-[#f0eadd] font-light"
                      style={{ fontFamily: SERIF }}
                    >
                      {t.price}
                    </span>
                    <span className="text-[12px] tracking-[0.16em] italic text-[#7a7468]" style={{ fontFamily: SERIF }}>
                      / {t.cadence}
                    </span>
                  </div>
                  <Link
                    to="/portal"
                    data-testid={`ways-cta-${t.key}`}
                    className={`block text-center text-[11.5px] tracking-[0.32em] uppercase py-4 border transition-colors duration-700 ${
                      t.featured
                        ? "text-[#0b0a08] bg-[#c4a46b] border-[#c4a46b] hover:bg-[#d4b67d] hover:border-[#d4b67d]"
                        : "text-[#c4a46b] border-[rgba(196,164,107,0.55)] hover:text-[#0b0a08] hover:bg-[#c4a46b]"
                    }`}
                  >
                    {t.cta}
                  </Link>
                </div>
              </div>
            </RevealBlock>
          ))}
        </div>
      </div>
    </section>
  );
}

// §THE VOICE METER — Tesla/fuel symbolism (Founder directive).
// Platform membership = the car. Voice minutes = separate, governed fuel.
// Surfaces top-up structure quietly so visitors understand the runtime model
// without it dominating the page.
function VoiceMeterSection() {
  const topups = [
    { mins: "30 minutes", price: "€25", note: "a short return" },
    { mins: "60 minutes", price: "€39", note: "a full hour, when you need more" },
    { mins: "180 minutes", price: "€99", note: "a season's worth of presence" },
  ];

  return (
    <section
      id="voice-meter"
      data-testid="sanctuary-voice-meter"
      className="relative w-full bg-[#0b0a08] py-32"
    >
      <div className="max-w-[1080px] mx-auto px-6 sm:px-10">
        <RevealBlock>
          <p className="text-[11px] tracking-[0.42em] uppercase text-[#c4a46b] mb-7 text-center">
            — The Voice Meter
          </p>
          <h2
            className="text-center text-[32px] sm:text-[42px] lg:text-[48px] leading-[1.14] text-[#f0eadd] font-light max-w-[760px] mx-auto tracking-[-0.012em]"
            style={{ fontFamily: SERIF }}
          >
            Your sanctuary stays open.<br />
            <span className="italic text-[#d4b67d]">Voice runs on its own quiet meter.</span>
          </h2>
          <p className="mt-9 text-center text-[15.5px] leading-[1.85] text-[#a59f93] max-w-[660px] mx-auto font-light">
            Each path above includes a baseline of live voice presence.
            When you need more, voice is added gently — measured by the
            minute, never auto-renewed, never running quietly in the
            background. Premium presence is always governed.
          </p>
        </RevealBlock>

        <div className="mt-20 grid sm:grid-cols-3 gap-5">
          {topups.map((t, i) => (
            <RevealBlock key={t.mins} delay={i * 100}>
              <div
                data-testid={`voice-topup-${t.price.replace("€", "")}`}
                className="border border-[rgba(196,164,107,0.14)] bg-[rgba(20,18,15,0.45)] p-8 text-center hover:border-[rgba(196,164,107,0.32)] transition-colors duration-700"
              >
                <p
                  className="text-[28px] leading-none text-[#f0eadd] font-light mb-3"
                  style={{ fontFamily: SERIF }}
                >
                  {t.price}
                </p>
                <p className="text-[11px] tracking-[0.28em] uppercase text-[#c4a46b] mb-5">
                  + {t.mins}
                </p>
                <p
                  className="text-[13px] italic text-[#a59f93] font-light"
                  style={{ fontFamily: SERIF }}
                >
                  {t.note}
                </p>
              </div>
            </RevealBlock>
          ))}
        </div>

        <RevealBlock delay={420}>
          <p
            className="mt-16 text-center text-[14px] italic text-[#7a7468] max-w-[560px] mx-auto leading-[1.85] font-light"
            style={{ fontFamily: SERIF }}
          >
            We hold the sanctuary. You hold the meter. Nothing is ever
            on by accident.
          </p>
        </RevealBlock>
      </div>
    </section>
  );
}

function PhilosophySection() {
  return (
    <section
      id="philosophy"
      data-testid="sanctuary-philosophy"
      className="relative w-full bg-[#0b0a08] py-32 sm:py-44 overflow-hidden"
    >
      <div className="absolute inset-0 opacity-[0.22]">
        <img src={ATMOSPHERE} alt="" aria-hidden="true" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-[rgba(10,9,8,0.55)] via-[rgba(10,9,8,0.85)] to-[rgba(10,9,8,1)]" />
      </div>

      <div className="relative z-10 max-w-[820px] mx-auto px-6 sm:px-10 text-center">
        <RevealBlock>
          <p className="text-[11px] tracking-[0.42em] uppercase text-[#c4a46b] mb-8">
            — Philosophy
          </p>
          <p
            className="text-[24px] sm:text-[32px] lg:text-[38px] leading-[1.44] text-[#f0eadd] font-light italic"
            style={{ fontFamily: SERIF }}
          >
            “None of this is urgent.<br />
            The rooms do not keep score.<br />
            You arrive as you are,<br />
            and you leave when quiet has returned.”
          </p>
          <p className="mt-12 text-[11px] tracking-[0.32em] uppercase text-[#7a7468]">
            — From the inner pages
          </p>
        </RevealBlock>
      </div>
    </section>
  );
}

function ClosingSection() {
  return (
    <section
      id="origin"
      data-testid="sanctuary-closing"
      className="relative w-full bg-[#0b0a08] py-32"
    >
      <div className="max-w-[860px] mx-auto px-6 sm:px-10 text-center">
        <RevealBlock>
          <h2
            className="text-[34px] sm:text-[48px] lg:text-[56px] leading-[1.12] text-[#f0eadd] font-light tracking-[-0.012em]"
            style={{ fontFamily: SERIF }}
          >
            When you are ready,<br />
            <span className="italic text-[#d4b67d]">a door is already open.</span>
          </h2>
          <p className="mt-9 text-[15.5px] leading-[1.85] text-[#bcb4a3] max-w-[540px] mx-auto font-light">
            No urgency. No invitation required this season. The sanctuary
            keeps its own quiet hours, and the inner pages remember nothing
            of who has visited.
          </p>
          <div className="mt-14">
            <Link
              to="/portal"
              data-testid="closing-cta"
              className="inline-flex items-center gap-3 text-[12px] tracking-[0.36em] uppercase text-[#c4a46b] border border-[rgba(196,164,107,0.55)] px-12 py-4 hover:text-[#0b0a08] hover:bg-[#c4a46b] transition-colors duration-700"
            >
              Step Inside
            </Link>
          </div>
        </RevealBlock>
      </div>
    </section>
  );
}

function SanctuaryFooter() {
  return (
    <footer
      data-testid="sanctuary-footer"
      className="relative w-full bg-[#0b0a08] border-t border-[rgba(196,164,107,0.08)] py-16"
    >
      <div className="max-w-[1220px] mx-auto px-6 sm:px-10 flex flex-col md:flex-row md:items-center md:justify-between gap-8">
        <p
          className="text-[13px] tracking-[0.32em] uppercase text-[#a59f93] font-light italic"
          style={{ fontFamily: SERIF }}
        >
          Pure Soul Life — Matrix Aurin
        </p>
        <div className="flex flex-wrap items-center gap-8 text-[11px] tracking-[0.24em] uppercase text-[#7a7468]">
          <Link to="/about" className="hover:text-[#bcb4a3] transition-colors duration-500">About</Link>
          <Link to="/aurin-philosophy" className="hover:text-[#bcb4a3] transition-colors duration-500">Philosophy</Link>
          <Link to="/legal" className="hover:text-[#bcb4a3] transition-colors duration-500">Privacy</Link>
        </div>
        <p className="text-[10.5px] tracking-[0.22em] uppercase text-[#5a554c] italic">
          No social-media pixels. No tracking cookies.
        </p>
      </div>
    </footer>
  );
}

export default function SanctuaryPreview() {
  return (
    <div
      data-testid="sanctuary-preview-root"
      className="min-h-screen w-full bg-[#0b0a08] text-[#e8e1d5] antialiased"
      style={{ fontFamily: 'system-ui, -apple-system, "Helvetica Neue", Arial, sans-serif' }}
    >
      <div
        data-testid="sanctuary-preview-ribbon"
        className="fixed top-0 left-0 right-0 z-[60] bg-[#c4a46b] text-[#0b0a08] text-[10px] tracking-[0.32em] uppercase text-center py-1.5"
      >
        Preview · /sanctuary-preview · production unchanged
      </div>
      <div className="pt-[28px]">
        <SanctuaryNav />
        <main>
          <HeroSection />
          <TwoWorldsSection />
          <RoomsSection />
          <OpenWorldSection />
          <WaysToBeHereSection />
          <VoiceMeterSection />
          <PhilosophySection />
          <ClosingSection />
        </main>
        <SanctuaryFooter />
      </div>
    </div>
  );
}
