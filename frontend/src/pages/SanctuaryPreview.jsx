/**
 * SanctuaryPreview — Founder review route (2026-05-18)
 *
 * Full-bleed polished landing experience.
 *
 * Scope (Founder lock, 2026-05-18):
 *   - ENGLISH ONLY
 *   - V6 baseline preserved + Atoms audit applied (85%, not 100%)
 *   - Mike's clean visual language: deep night palette, single warm
 *     brass accent only on CTA, distinctive serif headings
 *   - TWO-WORLDS architecture: Emotional (sanctuary, journeys) +
 *     Practical (rooms, learning paths) harmonized as ONE ecosystem
 *   - "FREE DURING LAUNCH" → "The doors are open this season"
 *   - "Real-time voice intelligence" → removed
 *   - Pricing locked: Free Open World · Quick Clarity $19 / Deep
 *     Release $49 / Full Breakthrough $89 · Voyager $39 · Eternal
 *     $89→$99 (180 min) · Divine $179→$199 (300 min, NOT 600)
 *   - Top-ups: +30min $25 · +60min $39 · +180min $99
 *
 * Untouched (sealed core):
 *   - audio pipeline (RoomConvaiChat.jsx)
 *   - ElevenLabs integration
 *   - backend session_cap / presence runtime
 *   - auth, WandererGate, route guards
 *   - production / Home.jsx
 *
 * This route lives OUTSIDE the Layout wrapper (no global nav/footer).
 * It owns its own minimal nav + footer so the wanderer experiences
 * a single, intentional world.
 */
import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";

const HERO = "/sanctuary/hero-mask.png";
const ATMOSPHERE = "/sanctuary/atmosphere.png";
const GROUNDED = "/sanctuary/grounded-presence.png";
const WINGS = "/sanctuary/sanctuary-wings.png";
const WARMTH = "/sanctuary/warmth-trust.png";

// §Reveal-on-scroll observer — used by every section so content
// breathes in as the wanderer descends.
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
      className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-[rgba(10,9,8,0.55)] border-b border-[rgba(196,164,107,0.08)]"
    >
      <div className="max-w-[1280px] mx-auto px-6 sm:px-10 h-[68px] flex items-center justify-between">
        <Link
          to="/sanctuary-preview"
          data-testid="sanctuary-logo"
          className="text-[12.5px] tracking-[0.32em] uppercase text-[#e8e1d5] font-light"
        >
          Pure&nbsp;Soul · Matrix Aurin
        </Link>
        <div className="hidden md:flex items-center gap-9 text-[12px] tracking-[0.22em] uppercase text-[#a59f93]">
          <a href="#origin" className="hover:text-[#e8e1d5] transition-colors duration-500">Origin</a>
          <a href="#worlds" className="hover:text-[#e8e1d5] transition-colors duration-500">Worlds</a>
          <a href="#thresholds" className="hover:text-[#e8e1d5] transition-colors duration-500">Thresholds</a>
          <a href="#philosophy" className="hover:text-[#e8e1d5] transition-colors duration-500">Philosophy</a>
        </div>
        <Link
          to="/portal"
          data-testid="sanctuary-portal-btn"
          className="text-[11.5px] tracking-[0.28em] uppercase text-[#0b0a08] bg-[#c4a46b] px-5 py-2.5 rounded-full hover:bg-[#d4b67d] transition-colors duration-500"
        >
          Enter Portal
        </Link>
      </div>
    </nav>
  );
}

function HeroSection() {
  const { ref, visible } = useReveal();
  return (
    <section
      ref={ref}
      data-testid="sanctuary-hero"
      className="relative min-h-screen w-full overflow-hidden"
    >
      {/* Atmospheric backdrop — full-bleed mask portrait */}
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
        {/* Cinematic vignette to anchor copy in the lower-left */}
        <div className="absolute inset-0 bg-gradient-to-r from-[rgba(10,9,8,0.92)] via-[rgba(10,9,8,0.55)] to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[rgba(10,9,8,0.95)]" />
      </div>

      <div className="relative z-10 max-w-[1280px] mx-auto px-6 sm:px-10 pt-[180px] sm:pt-[220px] pb-32">
        <div
          className={`max-w-[640px] transition-all duration-[1800ms] ease-out ${
            visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <p
            data-testid="hero-eyebrow"
            className="text-[11px] tracking-[0.42em] uppercase text-[#c4a46b] mb-7"
          >
            — Matrix Aurin · Pure Soul Life
          </p>
          <h1
            data-testid="hero-title"
            className="font-serif text-[44px] sm:text-[64px] lg:text-[76px] leading-[1.04] text-[#f0eadd] tracking-[-0.012em] font-light"
            style={{ fontFamily: '"Cormorant Garamond", "EB Garamond", Georgia, serif' }}
          >
            A sanctuary for the part of you<br />
            <span className="italic text-[#d4b67d]">that never speaks aloud.</span>
          </h1>
          <p
            data-testid="hero-subtitle"
            className="mt-9 text-[16.5px] sm:text-[17.5px] leading-[1.78] text-[#bcb4a3] max-w-[520px] font-light"
          >
            Two layers, one intentional world. An emotional inner sanctuary
            for reflection and clarity — and structured rooms for guided
            practice. You arrive whenever you need quiet.
          </p>
          <div className="mt-12 flex flex-wrap items-center gap-6">
            <Link
              to="/portal"
              data-testid="hero-cta-portal"
              className="inline-flex items-center gap-3 text-[12.5px] tracking-[0.26em] uppercase text-[#0b0a08] bg-[#c4a46b] px-8 py-4 rounded-full hover:bg-[#d4b67d] transition-all duration-500 hover:gap-5"
            >
              Enter the Sanctuary
              <span aria-hidden="true">→</span>
            </Link>
            <a
              href="#worlds"
              data-testid="hero-cta-explore"
              className="text-[12px] tracking-[0.26em] uppercase text-[#a59f93] hover:text-[#e8e1d5] transition-colors duration-500 underline-offset-[6px] hover:underline"
            >
              Walk through first
            </a>
          </div>
          <p
            data-testid="hero-season"
            className="mt-14 text-[11.5px] tracking-[0.24em] uppercase text-[#7a7468] font-light italic"
            style={{ fontFamily: '"Cormorant Garamond", Georgia, serif', fontStyle: "italic" }}
          >
            The doors are open this season.
          </p>
        </div>
      </div>

      {/* Subtle scroll cue */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10 text-[10px] tracking-[0.4em] uppercase text-[#7a7468] animate-pulse">
        ↓ &nbsp; descend
      </div>
    </section>
  );
}

// §TWO-WORLDS — the central architectural concept (Founder lock).
// Emotional + Practical presented as ONE harmonized ecosystem,
// never as separate websites.
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
            className="text-center font-light text-[34px] sm:text-[48px] lg:text-[56px] leading-[1.1] text-[#f0eadd] max-w-[820px] mx-auto tracking-[-0.012em]"
            style={{ fontFamily: '"Cormorant Garamond", "EB Garamond", Georgia, serif' }}
          >
            The inner world and the structured world,<br />
            <span className="italic text-[#d4b67d]">in the same breath.</span>
          </h2>
        </RevealBlock>

        <div className="mt-24 grid md:grid-cols-2 gap-16 lg:gap-20">
          {/* World I — Emotional */}
          <RevealBlock delay={120}>
            <div
              data-testid="world-emotional"
              className="relative rounded-[2px] border border-[rgba(196,164,107,0.18)] bg-[rgba(20,18,15,0.45)] p-10 sm:p-12 h-full"
            >
              <p className="text-[10.5px] tracking-[0.44em] uppercase text-[#c4a46b] mb-6">I · Inner</p>
              <h3
                className="text-[28px] sm:text-[32px] leading-[1.18] text-[#f0eadd] font-light mb-6"
                style={{ fontFamily: '"Cormorant Garamond", Georgia, serif' }}
              >
                The Sanctuary <span className="italic text-[#bcb4a3]">— reflection &amp; emotional clarity</span>
              </h3>
              <p className="text-[15.5px] leading-[1.85] text-[#bcb4a3] font-light">
                A quiet inner space for the moments when life asks too much.
                Slow journeys. Honest reflection. A guide who listens without
                hurry, without scoring, without storage of who you have been.
                You return as often as quiet is needed.
              </p>
              <div className="mt-10 pt-7 border-t border-[rgba(196,164,107,0.12)] text-[12px] tracking-[0.18em] uppercase text-[#7a7468]">
                Journeys · Sanctuary atmosphere · Reflection
              </div>
            </div>
          </RevealBlock>

          {/* World II — Practical */}
          <RevealBlock delay={220}>
            <div
              data-testid="world-practical"
              className="relative rounded-[2px] border border-[rgba(196,164,107,0.18)] bg-[rgba(20,18,15,0.45)] p-10 sm:p-12 h-full"
            >
              <p className="text-[10.5px] tracking-[0.44em] uppercase text-[#c4a46b] mb-6">II · Rooms</p>
              <h3
                className="text-[28px] sm:text-[32px] leading-[1.18] text-[#f0eadd] font-light mb-6"
                style={{ fontFamily: '"Cormorant Garamond", Georgia, serif' }}
              >
                The Rooms <span className="italic text-[#bcb4a3]">— guided structure &amp; practice</span>
              </h3>
              <p className="text-[15.5px] leading-[1.85] text-[#bcb4a3] font-light">
                Four distinct rooms, each with its own atmosphere and its own
                guide. Move through what the moment asks of you — clarity,
                the body, parenthood, or a quiet course of study. The
                structure holds you so the practice can land.
              </p>
              <div className="mt-10 pt-7 border-t border-[rgba(196,164,107,0.12)] text-[12px] tracking-[0.18em] uppercase text-[#7a7468]">
                Rooms · Learning paths · Guided progression
              </div>
            </div>
          </RevealBlock>
        </div>

        <RevealBlock delay={340}>
          <p className="mt-20 text-center text-[14.5px] leading-[1.85] italic text-[#a59f93] max-w-[640px] mx-auto font-light"
             style={{ fontFamily: '"Cormorant Garamond", Georgia, serif' }}>
            Neither layer asks anything of the other. Together they form
            a single, quiet ecosystem — one you can enter from whichever
            door is closest tonight.
          </p>
        </RevealBlock>
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
            className="text-[34px] sm:text-[44px] lg:text-[52px] leading-[1.12] text-[#f0eadd] font-light max-w-[760px] tracking-[-0.012em]"
            style={{ fontFamily: '"Cormorant Garamond", Georgia, serif' }}
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
                <div className="md:col-span-5 relative aspect-[4/5] overflow-hidden rounded-[2px] border border-[rgba(196,164,107,0.14)]">
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
                    className="text-[36px] sm:text-[44px] leading-[1.08] text-[#f0eadd] font-light mb-7"
                    style={{ fontFamily: '"Cormorant Garamond", Georgia, serif' }}
                  >
                    {r.name}
                  </h3>
                  <p className="text-[16.5px] leading-[1.85] text-[#bcb4a3] max-w-[480px] font-light">
                    {r.body}
                  </p>
                </div>
              </div>
            </RevealBlock>
          ))}
        </div>
      </div>
    </section>
  );
}

// §THRESHOLDS — pricing presented as atmospheric thresholds, not a
// SaaS comparison grid. Homepage gives only HINTS — Portal shows
// the full ledger (Founder Q4=c).
function ThresholdsSection() {
  return (
    <section
      id="thresholds"
      data-testid="sanctuary-thresholds"
      className="relative w-full bg-[#0b0a08] py-32"
    >
      <div className="max-w-[1080px] mx-auto px-6 sm:px-10">
        <RevealBlock>
          <p className="text-[11px] tracking-[0.42em] uppercase text-[#c4a46b] mb-7 text-center">
            — Thresholds of Time
          </p>
          <h2
            className="text-center text-[34px] sm:text-[44px] lg:text-[52px] leading-[1.1] text-[#f0eadd] font-light max-w-[760px] mx-auto tracking-[-0.012em]"
            style={{ fontFamily: '"Cormorant Garamond", Georgia, serif' }}
          >
            Three doorways into voice,<br />
            <span className="italic text-[#d4b67d]">three rhythms of presence.</span>
          </h2>
          <p className="mt-9 text-center text-[15px] leading-[1.85] text-[#a59f93] max-w-[560px] mx-auto font-light">
            The Open World is always free. Voice time is held quietly,
            measured by the minute. Full thresholds are revealed once
            inside the portal.
          </p>
        </RevealBlock>

        {/* Three atmospheric tier hints — no checkmark list, no SaaS
            comparison grid. Prose-led. Membership full details live
            inside the portal (Founder Q4=c). */}
        <div className="mt-24 grid md:grid-cols-3 gap-7 lg:gap-9">
          {[
            {
              key: "voyager",
              eyebrow: "I · Voyager",
              price: "$39",
              cadence: "monthly",
              line: "Ongoing text guidance and the library.",
              tone: "For those who arrive quietly, in writing.",
            },
            {
              key: "eternal",
              eyebrow: "II · Eternal",
              price: "$89",
              regular: "$99",
              cadence: "monthly",
              line: "180 minutes of voice each season, plus every course.",
              tone: "The most chosen threshold.",
              featured: true,
            },
            {
              key: "divine",
              eyebrow: "III · Divine",
              price: "$179",
              regular: "$199",
              cadence: "monthly",
              line: "300 minutes of voice, and early access to what arrives next.",
              tone: "For those who walk this path with depth.",
            },
          ].map((t, i) => (
            <RevealBlock key={t.key} delay={i * 100}>
              <div
                data-testid={`threshold-${t.key}`}
                className={`relative h-full p-9 sm:p-10 rounded-[2px] border ${
                  t.featured
                    ? "border-[rgba(196,164,107,0.45)] bg-[rgba(28,24,18,0.55)]"
                    : "border-[rgba(196,164,107,0.14)] bg-[rgba(20,18,15,0.45)]"
                }`}
              >
                <p className="text-[10.5px] tracking-[0.44em] uppercase text-[#c4a46b] mb-6">
                  {t.eyebrow}
                </p>
                <div className="flex items-baseline gap-2 mb-1">
                  <span
                    className="text-[42px] leading-none text-[#f0eadd] font-light"
                    style={{ fontFamily: '"Cormorant Garamond", Georgia, serif' }}
                  >
                    {t.price}
                  </span>
                  <span className="text-[12px] tracking-[0.18em] uppercase text-[#7a7468]">
                    /{t.cadence}
                  </span>
                </div>
                {t.regular ? (
                  <p className="text-[11.5px] tracking-[0.16em] text-[#7a7468] italic mb-7">
                    season opening · {t.regular} thereafter
                  </p>
                ) : (
                  <p className="text-[11.5px] tracking-[0.16em] text-[#7a7468] italic mb-7">
                    season opening
                  </p>
                )}
                <p className="text-[15px] leading-[1.85] text-[#bcb4a3] font-light mb-5">
                  {t.line}
                </p>
                <p
                  className="text-[14px] leading-[1.8] italic text-[#a59f93] font-light"
                  style={{ fontFamily: '"Cormorant Garamond", Georgia, serif' }}
                >
                  {t.tone}
                </p>
              </div>
            </RevealBlock>
          ))}
        </div>

        {/* Quiet hint at one-off passes — no urgency, no upsell. */}
        <RevealBlock delay={360}>
          <div className="mt-20 max-w-[680px] mx-auto text-center">
            <p
              className="text-[14.5px] italic text-[#a59f93] leading-[1.85] font-light"
              style={{ fontFamily: '"Cormorant Garamond", Georgia, serif' }}
            >
              For a single visit — Quick Clarity, Deep Release, or a Full
              Breakthrough are available within the portal, each with its
              own measured threshold of time.
            </p>
            <Link
              to="/portal"
              data-testid="thresholds-portal-link"
              className="mt-9 inline-flex items-center gap-3 text-[12px] tracking-[0.26em] uppercase text-[#c4a46b] hover:text-[#d4b67d] transition-colors duration-500 underline-offset-[6px] hover:underline"
            >
              Cross the threshold to see all
              <span aria-hidden="true">→</span>
            </Link>
          </div>
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
      {/* Soft atmospheric backdrop */}
      <div className="absolute inset-0 opacity-[0.22]">
        <img
          src={ATMOSPHERE}
          alt=""
          aria-hidden="true"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[rgba(10,9,8,0.55)] via-[rgba(10,9,8,0.85)] to-[rgba(10,9,8,1)]" />
      </div>

      <div className="relative z-10 max-w-[820px] mx-auto px-6 sm:px-10 text-center">
        <RevealBlock>
          <p className="text-[11px] tracking-[0.42em] uppercase text-[#c4a46b] mb-8">
            — Philosophy
          </p>
          <p
            className="text-[26px] sm:text-[34px] lg:text-[40px] leading-[1.42] text-[#f0eadd] font-light italic"
            style={{ fontFamily: '"Cormorant Garamond", Georgia, serif' }}
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
            className="text-[36px] sm:text-[52px] lg:text-[64px] leading-[1.1] text-[#f0eadd] font-light tracking-[-0.012em]"
            style={{ fontFamily: '"Cormorant Garamond", Georgia, serif' }}
          >
            When you are ready,<br />
            <span className="italic text-[#d4b67d]">a door is already open.</span>
          </h2>
          <p className="mt-9 text-[16px] leading-[1.85] text-[#bcb4a3] max-w-[540px] mx-auto font-light">
            No urgency. No invitation required this season. The sanctuary
            keeps its own quiet hours, and the inner pages remember nothing
            of who has visited.
          </p>
          <div className="mt-14">
            <Link
              to="/portal"
              data-testid="closing-cta"
              className="inline-flex items-center gap-3 text-[12.5px] tracking-[0.26em] uppercase text-[#0b0a08] bg-[#c4a46b] px-10 py-4 rounded-full hover:bg-[#d4b67d] transition-all duration-500 hover:gap-5"
            >
              Enter the Sanctuary
              <span aria-hidden="true">→</span>
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
      <div className="max-w-[1180px] mx-auto px-6 sm:px-10 flex flex-col md:flex-row md:items-center md:justify-between gap-8">
        <p
          className="text-[12.5px] tracking-[0.28em] uppercase text-[#a59f93] font-light"
          style={{ fontFamily: '"Cormorant Garamond", Georgia, serif', fontStyle: "italic" }}
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
  // Preview ribbon — visible only on this isolated route so the
  // founder always knows production is untouched.
  return (
    <div
      data-testid="sanctuary-preview-root"
      className="min-h-screen w-full bg-[#0b0a08] text-[#e8e1d5] antialiased"
      style={{ fontFamily: 'system-ui, -apple-system, "Helvetica Neue", Arial, sans-serif' }}
    >
      {/* Preview-only ribbon */}
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
          <ThresholdsSection />
          <PhilosophySection />
          <ClosingSection />
        </main>
        <SanctuaryFooter />
      </div>
    </div>
  );
}
