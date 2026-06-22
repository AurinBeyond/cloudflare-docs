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
import AurinsPromise from "@/components/sanctuary/AurinsPromise";
import HeroCompass from "@/components/sanctuary/HeroCompass";
import TruthSequenceModal from "@/components/TruthSequenceModal";

const HERO = "/sanctuary/hero-mask.webp";
const HERO_FALLBACK = "/sanctuary/hero-mask.jpg";
const ATMOSPHERE = "/sanctuary/atmosphere.png";
const GROUNDED = "/sanctuary/grounded-presence.png";
const WINGS = "/sanctuary/sanctuary-wings.png";
const WARMTH = "/sanctuary/warmth-trust.png";
// §AURIN 2026-05-22 — fifth room hero image. Re-uses the existing
// AurinBeyond brand hero so we do not introduce a parallel art style.
const AURIN_HERO = "/assets/brand/aurinbeyond-hero.png";
// §FOUNDER 2026-05-22 — message-style room imagery. Founder request:
// rooms should carry an emotional message-image (humans in scene),
// not abstract atmosphere alone. Parents' Room uses the new asset
// below. The Grace mirror asset upload had a URL/content mismatch in
// the artifact store (URL served door72_grace instead of the mirror
// the founder wanted) — kept on hold pending a fresh upload.
//   parents-message.png    — parent and child looking up at sunset
const PARENTS_MESSAGE = "/assets/sanctuary/parents-message.png";

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

// §POLISH 2026-05-18 PM — Hide the platform's "Made with Emergent"
// badge on this preview route only. Restored automatically when the
// founder navigates away. Does NOT affect production deployment
// (prulesoul.site already strips the badge during native deploy).
function useHidePlatformBadge() {
  useEffect(() => {
    const style = document.createElement("style");
    style.setAttribute("data-sanctuary-clean", "true");
    style.textContent = `
      /* Common Emergent preview badge patterns */
      [class*="emergent" i][class*="badge" i],
      a[href*="emergent.sh" i],
      a[href*="emergentagent.com" i][target="_blank"],
      div:has(> a[href*="emergent" i]) {
        display: none !important;
        visibility: hidden !important;
        opacity: 0 !important;
        pointer-events: none !important;
      }
    `;
    document.head.appendChild(style);
    return () => {
      style.remove();
    };
  }, []);
}

// §POLISH 2026-05-18 PM — Subtle hero parallax. Mask backdrop drifts
// 0 → -6% on first viewport scroll, no library, GPU-only transform.
// Stops calculating once hero is off-screen so it costs nothing on
// the rest of the page.
function useHeroParallax(elRef) {
  useEffect(() => {
    const el = elRef.current;
    if (!el) return undefined;
    let raf = 0;
    let lastY = -1;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const y = window.scrollY;
        if (y === lastY) return;
        lastY = y;
        if (y > window.innerHeight) return; // off-screen, skip
        const k = Math.min(1, y / window.innerHeight);
        el.style.transform = `translate3d(0, ${k * -6}%, 0) scale(${1 + k * 0.02})`;
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [elRef]);
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

function SanctuaryNav({ production = false }) {
  return (
    <nav
      data-testid="sanctuary-nav"
      className={`fixed ${production ? "top-0" : "top-[28px]"} left-0 right-0 z-50 backdrop-blur-md bg-[rgba(10,9,8,0.42)] border-b border-[rgba(196,164,107,0.08)]`}
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
          <a href="#hero-compass" className="hover:text-[#e8e1d5] transition-colors duration-500">Compass</a>
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

// §HERO — Quiet composition (2026-05-19 Founder refinement):
// The masked figure was previously dominating the entire screen,
// creating an unintended "dark luxury chamber" pressure. Per Founder:
// the mask now lives as a calm 1/3 atmospheric accent on the right
// while the wordmark + opening line breathe on the left. Elegance
// through restraint, not visual force.
function HeroSection({ onWalkTruthFirst }) {
  const { ref, visible } = useReveal();
  const imgRef = useRef(null);
  useHeroParallax(imgRef);
  return (
    <section
      ref={ref}
      data-testid="sanctuary-hero"
      className="relative w-full overflow-hidden bg-[#0b0a08] min-h-screen flex items-center"
    >
      {/* §QUIET HERO — Mask is now anchored to the right ~38% on
          desktop, top-band on mobile. The text block carries the
          page; the figure becomes an atmospheric companion rather
          than the protagonist. */}
      <div className="absolute inset-0 will-change-transform" ref={imgRef}>
        {/* Mobile: small top band so the layout breathes vertically.
            Desktop: image pulled LEFT toward the text block. Founder
            2026-05-19 night refinement:
              • face contour emerges MORE from the dark — image
                brightness/contrast nudged so the unmasked side
                breathes through the dark canvas
              • mask fragments dissolve faster into the distance —
                strengthened right-edge fade so the broken shards
                become a silhouette rather than a hard edge
              • sunrise glow REDUCED so it complements the new
                contour rather than competing with it */}
        {/* §HERO WIDTH 2026-05-20 — Founder explicit (yellow-curve
            screenshot 2026-05-20): the unmasked face was being clipped
            on the right by the previous right-edge feather. Widened
            the photo zone (32% → 44%) and reduced the right feather
            (42% → 22%) so the full face contour — eye, cheek, smile,
            jawline — breathes through without a hard right cut. */}
        <div className="absolute inset-x-0 top-[88px] h-[32vh] md:inset-y-0 md:right-auto md:top-0 md:h-full md:left-[44%] md:w-[44%]">
          {/* Quiet sunrise glow — reduced intensity per Founder cue
              "ei tohi jääda häirivaks". Brass-keyed, blurred. */}
          <div
            aria-hidden="true"
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "radial-gradient(ellipse 70% 45% at 36% 92%, rgba(212,182,125,0.18) 0%, rgba(196,164,107,0.08) 35%, rgba(11,10,8,0) 72%)",
              filter: "blur(3px)",
            }}
          />
          <picture className="block absolute inset-0 w-full h-full">
            <source srcSet={HERO} type="image/webp" />
            <img
              src={HERO_FALLBACK}
              alt=""
              aria-hidden="true"
              fetchPriority="high"
              loading="eager"
              decoding="async"
              data-testid="hero-mask-image"
              className={`relative w-full h-full object-cover transition-all duration-[2400ms] ease-out ${
                visible ? "opacity-100 scale-100" : "opacity-0 scale-[1.04]"
              }`}
              style={{
                filter: "contrast(1.14) saturate(1.10) brightness(1.10)",
              }}
            />
          </picture>
          {/* Face contour spotlight — anchored on the RIGHT-CENTER of
              the figure (the unmasked face: eye + cheek + smile).
              Founder cue 2026-05-19 late: "ava see näo osa mis on
              vaba maskist, et silm ja naeratus oleks näha". The
              spotlight is now positioned at ~70% horizontally so the
              warm soft-light lands precisely on the unmasked half. */}
          <div
            aria-hidden="true"
            className="absolute inset-0 pointer-events-none mix-blend-soft-light"
            style={{
              background:
                "radial-gradient(ellipse 42% 65% at 72% 55%, rgba(252,242,220,0.85) 0%, rgba(248,236,210,0.45) 35%, rgba(212,182,125,0.18) 60%, transparent 82%)",
            }}
          />
          {/* Secondary screen-blend bloom — only on the eye/smile
              zone (top-right of unmasked side). Keeps the brass
              palette but lifts the highlights so the smile reads. */}
          <div
            aria-hidden="true"
            className="absolute inset-0 pointer-events-none mix-blend-screen"
            style={{
              background:
                "radial-gradient(ellipse 28% 40% at 75% 55%, rgba(255,238,205,0.18) 0%, rgba(212,182,125,0.06) 50%, transparent 75%)",
            }}
          />
          {/* Vignette — softer than before (0.50 → 0.32) so the eyes
              and cheekbones of the unmasked face are no longer
              swallowed by the central darkening. */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_80%_at_45%_50%,_transparent_0%,_rgba(11,10,8,0.32)_80%,_#0b0a08_100%)]" />
          {/* Left edge feathering — connects mask region to body
              copy without a visible seam. */}
          <div className="absolute inset-y-0 left-0 w-[22%] bg-gradient-to-r from-[#0b0a08] via-[rgba(11,10,8,0.65)] to-transparent" />
          {/* Right edge feathering — REDUCED (was 42% / now 22%) per
              Founder 2026-05-20 yellow-curve directive. Previous
              feather was eating into the unmasked face zone. Now the
              fragments still dissolve into distance but the smile +
              jawline remain fully visible before the fade begins. */}
          <div className="hidden md:block absolute inset-y-0 right-0 w-[22%] bg-gradient-to-l from-[#0b0a08] via-[rgba(11,10,8,0.70)] to-transparent" />
          <div className="md:hidden absolute inset-x-0 bottom-0 h-[60px] bg-gradient-to-t from-[#0b0a08] to-transparent" />
        </div>
      </div>

      <div className="relative z-10 w-full max-w-[1240px] mx-auto px-6 sm:px-10 pt-[260px] md:pt-[180px] pb-32 md:pb-40">
        <div
          className={`max-w-[640px] transition-all duration-[1800ms] ease-out ${
            visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          {/* §SPRINT-0 2026-02 — "Less Noise. More Meaning." 4-layer hero.
              Layer 1 is the brand statement (what this is + who it's for).
              Layers 2, 3, 4 live just below the hero in <SprintZeroLayersSection />.
              Previous "Welcome back to yourself" archived to /app/memory/archive/hero_2026_06.md */}
          {/* §HERO 2026-02 Founder fix: the italic gold line previously
              sat as the third line of the h1 and, at desktop widths,
              ran into the painted face on the right. Moved BELOW the
              compass line into its own paragraph anchored against the
              dark left column so the gold typography reads clearly on
              the deep canvas instead of being lost on the portrait. */}
          <h1
            data-testid="hero-title"
            className="font-light text-[28px] sm:text-[42px] lg:text-[54px] leading-[1.15] text-[#f0eadd] tracking-[-0.012em] max-w-[560px]"
            style={{ fontFamily: SERIF }}
          >
            A living place<br />
            to read, listen, and reflect.
          </h1>
          <p
            data-testid="hero-compass-line"
            className="mt-9 text-[15.5px] sm:text-[17.5px] tracking-[0.02em] text-[#bcb4a3] font-light italic max-w-[520px] leading-[1.7]"
            style={{ fontFamily: SERIF }}
          >
            Five rooms for people, parents, and families.<br />
            A space for conversation, reflection, and discovery.
          </p>
          <p
            data-testid="hero-reconnect-line"
            className="mt-8 italic text-[22px] sm:text-[28px] lg:text-[32px] leading-[1.3] text-[#d4b67d] max-w-[520px] tracking-[-0.005em]"
            style={{ fontFamily: SERIF }}
          >
            And reconnect with what matters most.
          </p>
        </div>
      </div>
    </section>
  );
}


// §FIVE-ROOMS-RECOGNITION 2026-06-22 — Positive-recognition row that
// sits between the hero and the deeper RoomsSection. Each line names
// the experience, not the feature, so a fresh visitor scans the five
// doors in under three seconds and chooses where to walk. Anti-wellness
// lock, eventyr lock (Polarstar carries the Norwegian word italics).
// §VOICE-LIVING-PLACE-LOCK · §RECOGNITION-NOT-PITCH-LOCK.
function FiveRoomsRecognitionSection() {
  const rooms = [
    { to: "/parents-room",  glyph: "⛵", name: "Sara",      line: "for the spaces between people you love",                    testid: "five-rooms-sara" },
    { to: "/grace",         glyph: "🔥", name: "Grace",     line: "for the room with no one watching",                          testid: "five-rooms-grace" },
    { to: "/body-world",    glyph: "🌿", name: "Kaelen",    line: "for what the body has been quietly saying",                  testid: "five-rooms-kaelen" },
    { to: "/alistair",      glyph: "🧭", name: "Alistair",  line: "for the questions that keep returning",                      testid: "five-rooms-alistair" },
    { to: "/kids-universe", glyph: "⭐", name: "Polarstar",  line: "wonder, childhood, adventures we live together",             testid: "five-rooms-polarstar", italicWord: "eventyr" },
  ];
  return (
    <section
      id="five-rooms-recognition"
      data-testid="five-rooms-recognition"
      className="relative w-full bg-[#0b0a08] py-24 sm:py-32"
    >
      <div className="max-w-[780px] mx-auto px-6 sm:px-10" style={{ fontFamily: SERIF }}>
        <p className="text-[11px] tracking-[0.42em] uppercase text-[#c4a46b] text-center mb-12">
          Five rooms · choose a door
        </p>
        <ul className="list-none p-0 m-0">
          {rooms.map((r) => (
            <li key={r.testid} className="border-t border-[rgba(196,164,107,0.15)] last:border-b">
              <a
                href={r.to}
                data-testid={r.testid}
                className="block py-6 px-2 transition-all duration-300 hover:bg-[rgba(196,164,107,0.04)] hover:pl-6"
                style={{ color: "#f0eadd", textDecoration: "none" }}
              >
                <div className="flex items-baseline gap-4">
                  <span className="text-[1.5rem] leading-none opacity-80" aria-hidden="true">
                    {r.glyph}
                  </span>
                  <div>
                    <p
                      className="m-0 text-[1.55rem] sm:text-[1.7rem] tracking-[0.005em] text-[#f0eadd] leading-tight"
                      style={{ fontFamily: SERIF }}
                    >
                      {r.name}
                    </p>
                    <p
                      className="m-0 mt-1 text-[0.95rem] sm:text-[1.05rem] italic text-[rgba(220,210,190,0.85)] leading-relaxed"
                      style={{ fontFamily: SERIF }}
                    >
                      {r.italicWord ? (
                        <>
                          <em style={{ fontStyle: "italic", color: "#d4b67d" }}>{r.italicWord}</em>
                          {" — "}
                          {r.line}
                        </>
                      ) : (
                        r.line
                      )}
                    </p>
                  </div>
                </div>
              </a>
            </li>
          ))}
        </ul>
        <p
          data-testid="five-rooms-coda"
          className="text-[0.95rem] italic text-center text-[rgba(220,210,190,0.78)] mt-14 leading-[1.7]"
          style={{ fontFamily: SERIF }}
        >
          This is not a course. It is not a programme to complete.
          <br />
          It is a place to return to.
        </p>
        <p
          className="text-[0.78rem] tracking-[0.05em] text-center text-[rgba(196,164,107,0.62)] mt-4 italic"
          style={{ fontFamily: SERIF }}
        >
          Two rooms (Sara and Kaelen) ask you to read a short threshold before entering.
        </p>
      </div>
    </section>
  );
}

// §SPRINT-0 2026-02 — "Less Noise. More Meaning." 4-layer hero (Layers 2, 3, 4).
// Sits directly under HeroSection. Layer 1 (brand statement) lives in HeroSection.
// Locked after a 5-day brainstorm (Anna + GPT + Norwegian AI + agent).
// Strict rules: no SaaS words, no "digital", no "reflective tools", no "wellness".
// "Start Here" is the primary CTA. "See the Five Rooms" + "Browse Books" are secondary.
function SprintZeroLayersSection() {
  const transformationRows = [
    { from: "too many thoughts", to: "one thought clearer" },
    { from: "tension your body has carried", to: "one quieter breath" },
    { from: "a hard conversation at home", to: "one new way to begin it" },
    { from: "an evening that disappeared", to: "one shared moment back" },
  ];
  const audience = [
    "For people who want a little more clarity.",
    "For parents who want a little more patience.",
    "For families who want a little more time together.",
  ];
  return (
    <section
      data-testid="sprint-zero-layers"
      className="relative w-full bg-[#0b0a08]"
    >
      {/* Quiet vertical hairline above the transformation table */}
      <div
        aria-hidden="true"
        className="mx-auto h-16 w-px bg-gradient-to-b from-transparent to-[rgba(196,164,107,0.28)]"
      />

      {/* ── Layer 2 — Transformation table ─────────────────────────── */}
      <RevealBlock>
        <div
          data-testid="hero-transformation"
          className="max-w-[880px] mx-auto px-6 sm:px-10 pt-20 sm:pt-28 pb-16 sm:pb-24"
        >
          <div className="hidden sm:grid grid-cols-[1fr_auto_1fr] items-center gap-6 pb-6 mb-12 border-b border-[rgba(196,164,107,0.14)]">
            <span
              className="text-right text-[11px] tracking-[0.42em] uppercase text-[#c4a46b] font-light"
              style={{ fontFamily: SERIF }}
            >
              If you came here with…
            </span>
            <span aria-hidden="true" className="block w-px h-4 bg-[rgba(196,164,107,0.35)]" />
            <span
              className="text-left text-[11px] tracking-[0.42em] uppercase text-[#c4a46b] font-light"
              style={{ fontFamily: SERIF }}
            >
              you may leave with…
            </span>
          </div>

          <ul className="flex flex-col gap-9 sm:gap-10 list-none p-0 m-0">
            {transformationRows.map((row, i) => (
              <li
                key={i}
                data-testid={`hero-transformation-row-${i}`}
                className="grid grid-cols-1 sm:grid-cols-[1fr_auto_1fr] items-center gap-2 sm:gap-6 text-center sm:text-left"
              >
                <span
                  className="text-[18px] sm:text-[22px] lg:text-[24px] italic text-[#8e887d] leading-[1.4] sm:text-right"
                  style={{ fontFamily: SERIF }}
                >
                  {row.from}
                </span>
                <span
                  aria-hidden="true"
                  className="text-[#c4a46b] opacity-60 text-[16px] sm:text-[14px] inline-block sm:inline rotate-90 sm:rotate-0"
                >
                  →
                </span>
                <span
                  className="text-[19px] sm:text-[23px] lg:text-[26px] text-[#f0eadd] leading-[1.4] sm:text-left tracking-[0.005em]"
                  style={{ fontFamily: SERIF }}
                >
                  {row.to}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </RevealBlock>

      {/* ── Layer 3 — Audience trio (self-recognition) ──────────────── */}
      <RevealBlock delay={120}>
        <div
          data-testid="hero-audience"
          className="max-w-[720px] mx-auto px-6 sm:px-10 py-16 sm:py-24 text-center"
        >
          <div className="flex flex-col gap-4 sm:gap-5">
            {audience.map((line, i) => (
              <p
                key={i}
                data-testid={`hero-audience-line-${i}`}
                className="text-[17px] sm:text-[20px] lg:text-[22px] text-[#d9d3c5] font-light leading-[1.55] tracking-[0.005em]"
                style={{ fontFamily: SERIF }}
              >
                {line}
              </p>
            ))}
          </div>
        </div>
      </RevealBlock>

      {/* ── Layer 4 — Three CTAs (Start Here = primary) ─────────────── */}
      <RevealBlock delay={200}>
        <div
          data-testid="hero-ctas"
          className="max-w-[980px] mx-auto px-6 sm:px-10 pt-4 pb-28 sm:pb-36"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-center gap-4 sm:gap-6">
            <Link
              to="/start-here"
              data-testid="hero-cta-start-here"
              className="inline-flex items-center justify-center text-[12px] tracking-[0.36em] uppercase text-[#0b0a08] bg-[#c4a46b] hover:bg-[#d4b67d] border border-[#c4a46b] hover:border-[#d4b67d] px-12 sm:px-14 py-5 font-medium transition-all duration-500 hover:-translate-y-px"
            >
              Start Here
            </Link>
            <a
              href="#worlds"
              data-testid="hero-cta-see-rooms"
              className="inline-flex items-center justify-center text-[11.5px] tracking-[0.32em] uppercase text-[#c4a46b] border border-[rgba(196,164,107,0.45)] hover:border-[#c4a46b] hover:text-[#d4b67d] px-10 sm:px-12 py-5 transition-colors duration-500"
            >
              See the Five Rooms
            </a>
            <Link
              to="/bookstore"
              data-testid="hero-cta-browse-books"
              className="inline-flex items-center justify-center text-[11.5px] tracking-[0.32em] uppercase text-[#c4a46b] border border-[rgba(196,164,107,0.45)] hover:border-[#c4a46b] hover:text-[#d4b67d] px-10 sm:px-12 py-5 transition-colors duration-500"
            >
              Browse Books
            </Link>
          </div>
        </div>
      </RevealBlock>
    </section>
  );
}


// §BRAND-CLARITY 2026-02-11 — A Quiet Note. Sits between the hero
// and the deeper worlds. Tells a first-time visitor in 8 seconds:
// what this is, what it is not, and who holds it. Brand voice,
// no marketing punch, no new visual system.
function QuietNoteSection() {
  return (
    <section
      data-testid="sanctuary-quiet-note"
      className="relative w-full bg-[#0b0a08] py-24 sm:py-32"
    >
      <div className="max-w-[760px] mx-auto px-6 sm:px-10 text-center">
        <p
          className="text-[11px] tracking-[0.42em] uppercase mb-8"
          style={{ color: BRASS, fontFamily: SERIF }}
        >
          ✦ A quiet note
        </p>
        <p
          className="text-[20px] sm:text-[24px] leading-[1.7] font-light italic"
          style={{ color: "#e8e1d5", fontFamily: SERIF, letterSpacing: "0.005em" }}
          data-testid="sanctuary-quiet-note-text"
        >
          This is not therapy. Not a chatbot. Not another place that
          wants more of you. It is a room where presence is the product,
          and you do not have to perform.
        </p>
        <p
          className="mt-10 text-[28px]"
          style={{ color: "#d9c79b", fontFamily: '"Caveat", cursive' }}
        >
          — Anna &amp; Aurin
        </p>
        <p className="mt-10 text-[10.5px] tracking-[0.32em] uppercase text-[#7a7468]">
          <Link
            to="/what-this-is"
            className="hover:text-[#bcb4a3] transition-colors duration-500 underline decoration-dotted underline-offset-[6px]"
            data-testid="sanctuary-quiet-note-link"
          >
            What this is, in plain language →
          </Link>
        </p>
      </div>
    </section>
  );
}

function TwoWorldsSection() {
  return (
    <section
      id="worlds"
      data-testid="sanctuary-worlds"
      className="relative w-full bg-[#0b0a08] py-32 sm:py-44 overflow-hidden"
    >
      {/* §POLISH 2026-05-19 — Soft warm radial behind the heading.
          Prevents the section from feeling like a cold "dark cult
          chamber". No color shift to the palette — just a very low-
          opacity warm glow that breathes through the brass system. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-[18%] h-[420px] opacity-[0.22]"
        style={{
          background:
            "radial-gradient(ellipse 60% 80% at 50% 30%, rgba(196,164,107,0.22) 0%, rgba(196,164,107,0.06) 40%, transparent 70%)",
        }}
      />
      <div className="relative z-10 max-w-[1180px] mx-auto px-6 sm:px-10">
        <RevealBlock>
          <p className="text-[11px] tracking-[0.42em] uppercase text-[#c4a46b] mb-7 text-center">
            — Two Worlds, One Place
          </p>
          <h2
            className="text-center font-light text-[32px] sm:text-[44px] lg:text-[52px] leading-[1.12] text-[#f0eadd] max-w-[860px] mx-auto tracking-[-0.012em]"
            style={{ fontFamily: SERIF }}
          >
            A space where reflection and structure<br />
            <span className="italic text-[#d4b67d]">quietly bring you back to what matters most.</span>
          </h2>
        </RevealBlock>

        <div className="mt-24 grid md:grid-cols-2 gap-16 lg:gap-20">
          <RevealBlock delay={120}>
            <div
              data-testid="world-emotional"
              className="relative border border-[rgba(196,164,107,0.32)] bg-[rgba(18,16,13,0.62)] p-10 sm:p-12 h-full"
            >
              {/* §POLISH — sharp brass corner accent for visual certainty */}
              <span aria-hidden="true" className="absolute top-0 left-0 w-12 h-px bg-[#c4a46b]" />
              <span aria-hidden="true" className="absolute top-0 left-0 w-px h-12 bg-[#c4a46b]" />
              <p className="text-[10.5px] tracking-[0.44em] uppercase text-[#c4a46b] mb-6">I · Inner</p>
              <h3
                className="text-[26px] sm:text-[30px] leading-[1.2] text-[#f0eadd] font-light mb-6"
                style={{ fontFamily: SERIF }}
              >
                The Room <span className="italic text-[#bcb4a3]">— reflection &amp; emotional clarity</span>
              </h3>
              <p className="text-[15.5px] leading-[1.85] text-[#bcb4a3] font-light">
                A quiet inner space for the moments when life asks too much.
                Slow journeys. Honest reflection. A guide who listens without
                hurry, without scoring, without storage of who you have been.
              </p>
              <div className="mt-10 pt-7 border-t border-[rgba(196,164,107,0.12)] text-[11.5px] tracking-[0.2em] uppercase text-[#7a7468]">
                Journeys · Reflection · Honest atmosphere
              </div>
            </div>
          </RevealBlock>

          <RevealBlock delay={220}>
            <div
              data-testid="world-practical"
              className="relative border border-[rgba(196,164,107,0.32)] bg-[rgba(18,16,13,0.62)] p-10 sm:p-12 h-full"
            >
              <span aria-hidden="true" className="absolute top-0 right-0 w-12 h-px bg-[#c4a46b]" />
              <span aria-hidden="true" className="absolute top-0 right-0 w-px h-12 bg-[#c4a46b]" />
              <p className="text-[10.5px] tracking-[0.44em] uppercase text-[#c4a46b] mb-6">II · Rooms</p>
              <h3
                className="text-[26px] sm:text-[30px] leading-[1.2] text-[#f0eadd] font-light mb-6"
                style={{ fontFamily: SERIF }}
              >
                The Rooms <span className="italic text-[#bcb4a3]">— guided structure &amp; practice</span>
              </h3>
              <p className="text-[15.5px] leading-[1.85] text-[#bcb4a3] font-light">
                Five distinct rooms, each with its own atmosphere and its own
                guide. Move through what the moment asks of you — clarity,
                the body, parenthood, a quiet course of study, or a gentle
                room for the children.
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
        name: "Grace",
        sub: "S · 180° · Grace · The Private Room",
        body: "A confidential channel for the cognitive load you cannot yet say aloud. Read by Grace, never by the room.",
        intro: "S · 180°. Grace curates the southern cardinal — the room where the thought consuming your bandwidth is brought, named, and released. She does not advise, she extracts. Three channels are open: writing, voice, and a live dialogue. If the voice line falters, write — Grace will answer aloud. Bring what is still circulating in your head at 2am; you can leave it here.",
        creditNote: "Writing is free. Voice opens with 5 credits or more.",
        img: GROUNDED,
        href: "/clarity-release",
        testid: "room-enter-clarity",
      },
      {
        n: "II",
        name: "Body World",
        sub: "N · 360° · Kaelan · The Listening Room",
        body: "Where the body is read first. The architecture remembers what the mind has rehearsed away.",
        intro: "N · 360°. Kaelan curates the northern cardinal — the room that asks the body before it asks the mind. Slow attention to the structural load you have been carrying without naming. Three channels are open: writing, voice, and a live dialogue. If the line breaks, write — Kaelan will answer aloud. This is hardware-level work, not commentary.",
        creditNote: "Writing is free. Voice opens with 5 credits or more.",
        img: WINGS,
        href: "/body-room",
        testid: "room-enter-body",
      },
      {
        n: "III",
        name: "Parents' Room",
        sub: "E · 90° · Sara · The Hearth Room",
        body: "For the ones holding the operating system of a home. Architectural read, never pedagogical advice.",
        intro: "E · 90°. Sara curates the eastern cardinal — the room for the parent who is decoding what was inherited, what was outsourced, and what the home now requires of them as Anchor OS. Three channels are open: writing, voice, and a live dialogue. If the line breaks, write — Sara will answer aloud. A sub-cluster opens inside on The Subsystem (the adolescent neurological window). No therapy. No pedagogy.",
        creditNote: "Writing is free. Voice opens with 5 credits or more.",
        img: PARENTS_MESSAGE,
        href: "/parents-room",
        testid: "room-enter-parents",
      },
      {
        n: "IV",
        name: "Course Room",
        sub: "W · 270° · Alistair · The Study Room",
        body: "A protocol library, not a course shelf. Transmissions land on a 24-hour cadence-lock.",
        intro: "W · 270°. Alistair curates the western cardinal — the room where the sovereign operator re-architects their own runtime through short, precise transmissions on an unbendable cadence-lock. One per 24 hours. No binge. Three channels are open: writing, voice, and a live dialogue. If the line breaks, write — Alistair will answer aloud. The Broken Clockwork (28-day Sara protocol) lives here.",
        creditNote: "Writing is free. Voice opens with 5 credits or more.",
        img: ATMOSPHERE,
        href: "/course-room",
        testid: "room-enter-courses",
      },
      {
        // §AURIN 2026-05-22 — Fifth room. Aurin is the children's
        // companion. Surfaced at the same level as the other four
        // rooms (founder directive: "if the heading says Rooms, all
        // five must be there"). Kept last so adult visitors meet the
        // primary four rooms first, then discover Aurin as a softer
        // extension for younger hearts.
        n: "V",
        name: "Aurin's Room",
        sub: "A Room for Children",
        body: "A gentle companion who listens, plays, and remembers that childhood deserves to feel safe. Three age tracks — chosen by the parent or the child.",
        intro: "A warm presence for the little ones. Aurin is here to listen, imagine, and dream alongside the child. Three small rooms wait inside — for Little Dreamers (3–5), Explorers (6–8), and Dreamweavers (9–12) — so the words always fit the age. Aurin is a companion, never a teacher or a parent. If a heavier feeling arises, Aurin will gently invite the child to share it with a trusted grown-up.",
        creditNote: "Writing is free. Voice opens with 5 credits or more.",
        img: AURIN_HERO,
        href: "/aurins-room",
        testid: "room-enter-aurin",
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
            — Five Doors
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
                <div className="md:col-span-5 relative aspect-[4/5] overflow-hidden border border-[rgba(196,164,107,0.28)]">
                  <img
                    src={r.img}
                    alt=""
                    aria-hidden="true"
                    className="w-full h-full object-cover transition-transform duration-[2400ms] ease-out hover:scale-[1.03]"
                    style={{ filter: "contrast(1.08) saturate(1.05) brightness(0.97)" }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[rgba(8,7,6,0.7)] via-[rgba(10,9,8,0.18)] to-transparent" />
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
                  {/* §INTRO 2026-05-19 — Founder directive: a soft,
                      non-technical introduction that names the room's
                      keeper and the three ways to converse. Stays
                      brand-aligned (no "AI", "bot", "model"). */}
                  <p
                    className="mt-6 text-[14px] leading-[1.8] italic font-light text-[#bcb4a3] max-w-[520px]"
                    style={{ fontFamily: SERIF }}
                    data-testid={`room-intro-${r.n.toLowerCase()}`}
                  >
                    {r.intro}
                  </p>
                  {/* §CREDIT-HINT 2026-05-19 — discrete, brass-accent
                      line so the wanderer knows text is free and
                      voice begins at the credit threshold. */}
                  <p
                    className="mt-4 text-[11px] tracking-[0.28em] uppercase text-[#c4a46b]/80"
                    data-testid={`room-credit-${r.n.toLowerCase()}`}
                  >
                    {r.creditNote}
                  </p>
                  {/* §ENTER 2026-05-19 — Founder directive: every room
                      description gets a single, calm ENTER affordance
                      that takes the wanderer directly to the room's
                      session entry (WandererGate-protected). No doors,
                      no extra ceremony — one click, one room. */}
                  <Link
                    to={r.href}
                    data-testid={r.testid}
                    className="inline-flex items-center gap-3 mt-9 px-7 py-3 border border-[rgba(196,164,107,0.45)] text-[#f0eadd] text-[11px] tracking-[0.42em] uppercase hover:bg-[rgba(196,164,107,0.08)] hover:border-[rgba(196,164,107,0.7)] transition-colors duration-500"
                  >
                    <span>Enter</span>
                    <span className="text-[#c4a46b]" aria-hidden="true">→</span>
                  </Link>
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
              softest version of this place, held for the little ones.
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
// §POLISH 2026-05-18 PM — Each card now carries a high-contrast badge
// at the TOP-LEFT (not bottom muted-tracking text) so the visitor
// instantly maps: green-brass = enter freely, ivory = paid threshold.
function OpenWorldSection() {
  const layers = [
    {
      title: "The Library",
      body: "Reflections, journal entries, slow reads — open to anyone who wanders in.",
      badge: "Free to enter",
      tone: "free",
      href: "/library",
      testid: "openworld-enter-library",
    },
    {
      title: "The Bookstore",
      body: "A small collection of original books and angel stories. Each title is its own quiet object.",
      badge: "From €9 · once",
      tone: "paid",
      href: "/bookstore",
      testid: "openworld-enter-bookstore",
    },
    {
      title: "The Courses",
      body: "Self-paced studies — The Body Knows First, Beyond the Matrix, and others — read at your own rhythm.",
      badge: "From €19 · once",
      tone: "paid",
      href: "/course-room",
      testid: "openworld-enter-courses",
    },
    {
      title: "Kids Universe",
      body: "Angel stories, coloring pages, and the gentlest version of this place for the youngest visitors.",
      badge: "Free to enter",
      tone: "free",
      href: "/kids-universe",
      testid: "openworld-enter-kids",
    },
  ];

  return (
    <section
      id="open-world"
      data-testid="sanctuary-openworld"
      className="relative w-full bg-[#0b0a08] py-32 overflow-hidden"
    >
      <div className="absolute inset-0 opacity-[0.10]">
        <img src={ATMOSPHERE} alt="" aria-hidden="true" className="w-full h-full object-cover" style={{ filter: "contrast(1.06) saturate(1.04)" }} />
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
          <p className="mt-9 text-center text-[15.5px] leading-[1.85] text-[#a59f93] max-w-[640px] mx-auto font-light">
            Before any threshold, there is a long, quiet exploration layer.
            Read what is written. Read what has been thought through. Bring
            your children. No invitation, no payment, no name required.
          </p>
          {/* §POLISH 2026-05-18 PM — Visitor orientation: free now vs.
              voice-token later. Spelled out gently but clearly. */}
          <p
            data-testid="openworld-orientation"
            className="mt-6 text-center text-[13.5px] italic text-[#7a7468] max-w-[600px] mx-auto leading-[1.85] font-light"
            style={{ fontFamily: SERIF }}
          >
            Live voice presence with the guides is held separately —
            a small token of time, for the moments you wish to speak aloud.
          </p>
        </RevealBlock>

        <div className="mt-20 grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {layers.map((l, i) => (
            <RevealBlock key={l.title} delay={i * 90}>
              <div
                data-testid={`openworld-${l.title.toLowerCase().replace(/\s+/g, "-")}`}
                className="relative h-full border border-[rgba(196,164,107,0.28)] bg-[rgba(18,16,13,0.62)] p-8 pt-12 hover:border-[rgba(196,164,107,0.5)] transition-colors duration-700"
              >
                {/* §POLISH — High-contrast badge anchored at TOP for instant
                    scan: free items get a brass-filled chip, paid items get
                    a bordered ivory chip. */}
                <span
                  data-testid={`openworld-badge-${l.tone}`}
                  className={
                    l.tone === "free"
                      ? "absolute -top-3 left-7 text-[10px] tracking-[0.32em] uppercase text-[#0b0a08] bg-[#c4a46b] px-3.5 py-1.5"
                      : "absolute -top-3 left-7 text-[10px] tracking-[0.28em] uppercase text-[#e8e1d5] bg-[#0b0a08] border border-[rgba(232,225,213,0.55)] px-3.5 py-1.5"
                  }
                >
                  {l.badge}
                </span>
                <h3
                  className="text-[22px] leading-[1.2] text-[#f0eadd] font-light mb-4"
                  style={{ fontFamily: SERIF }}
                >
                  {l.title}
                </h3>
                <p className="text-[14px] leading-[1.82] text-[#bcb4a3] font-light">
                  {l.body}
                </p>
                {/* §FOUNDER 2026-05-22 — Each OpenWorld card carries a
                    discreet brass-accent Enter link. Routes go directly
                    to the FREE / preview surface (no auth gate, no
                    /pricing redirect). Visual: small inline text link,
                    not a heavy button — preserves sanctuary tone. */}
                <Link
                  to={l.href}
                  data-testid={l.testid}
                  className="mt-7 inline-flex items-center gap-2 text-[11px] tracking-[0.38em] uppercase text-[#c4a46b] hover:text-[#e0c585] transition-colors duration-500"
                >
                  <span>Enter</span>
                  <span aria-hidden="true">→</span>
                </Link>
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
        "A guided live voice session at your pace",
        "No subscription, no follow-up pressure",
      ],
      price: "€45",
      cadence: "one session",
      cta: "Join the quiet list",
    },
    {
      key: "steady-presence",
      name: "A Steady Presence",
      tagline: "All rooms. Monthly companionship. Return as often as you need.",
      lede: "Move freely between all rooms, with a monthly voice session included. You are welcome here, always.",
      includes: [
        "Access to all four rooms — reading, reflection, text-to-text chat",
        "One private live voice session per month",
        "Priority access to new spaces",
        "The quiet community thread",
      ],
      price: "€120",
      cadence: "per month",
      cta: "Join the quiet list",
      featured: true,
    },
    {
      key: "your-own-room",
      name: "Your Own Room",
      tagline: "A space held only for you.",
      lede: "For those ready for sustained, intimate work. Weekly voice sessions, full access to everything, and a private channel — your own corner of this work.",
      includes: [
        "Full access to all rooms — reading, reflection, text-to-text chat",
        "Weekly private live voice sessions — four sessions per month",
        "Priority presence and response",
        "Early access to future sanctuaries",
        "Direct channel for quiet requests",
      ],
      price: "€380",
      cadence: "per month",
      cta: "Join the quiet list",
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
                    ? "border-[rgba(196,164,107,0.6)] bg-[rgba(28,24,18,0.72)]"
                    : "border-[rgba(196,164,107,0.28)] bg-[rgba(18,16,13,0.62)]"
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
    { mins: "30 minutes of presence", price: "€25", note: "a short return" },
    { mins: "60 minutes of presence", price: "€39", note: "a full hour, when you need more" },
    { mins: "180 minutes of presence", price: "€99", note: "a season's worth of presence" },
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
            This place stays open.<br />
            <span className="italic text-[#d4b67d]">Voice runs on its own quiet meter.</span>
          </h2>
          <p className="mt-9 text-center text-[15.5px] leading-[1.85] text-[#a59f93] max-w-[660px] mx-auto font-light">
            Each path above includes a baseline of live voice presence.
            When you choose to extend, time is added gently — never
            auto-renewed, never running quietly in the background.
            Premium presence is always governed.
          </p>
        </RevealBlock>

        <div className="mt-20 grid sm:grid-cols-3 gap-5">
          {topups.map((t, i) => (
            <RevealBlock key={t.mins} delay={i * 100}>
              <div
                data-testid={`voice-topup-${t.price.replace("€", "")}`}
                className="border border-[rgba(196,164,107,0.28)] bg-[rgba(18,16,13,0.62)] p-8 text-center hover:border-[rgba(196,164,107,0.5)] transition-colors duration-700"
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
            We hold the room. You hold the meter. Nothing is ever
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
      <div className="absolute inset-0 opacity-[0.28]">
        <img src={ATMOSPHERE} alt="" aria-hidden="true" className="w-full h-full object-cover" style={{ filter: "contrast(1.10) saturate(1.05)" }} />
        <div className="absolute inset-0 bg-gradient-to-b from-[rgba(8,7,6,0.55)] via-[rgba(10,9,8,0.88)] to-[#0b0a08]" />
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
      className="relative w-full bg-[#0b0a08] py-32 overflow-hidden"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-[24%] h-[440px] opacity-[0.20]"
        style={{
          background:
            "radial-gradient(ellipse 50% 70% at 50% 40%, rgba(196,164,107,0.24) 0%, rgba(196,164,107,0.05) 45%, transparent 75%)",
        }}
      />
      <div className="relative z-10 max-w-[860px] mx-auto px-6 sm:px-10 text-center">
        <RevealBlock>
          <p
            data-testid="closing-thematic"
            className="text-[11px] tracking-[0.42em] uppercase text-[#c4a46b] mb-10"
          >
            — Out of the Matrix · Into Aurin
          </p>
          <h2
            className="text-[32px] sm:text-[46px] lg:text-[56px] leading-[1.12] text-[#f0eadd] font-light tracking-[-0.012em]"
            style={{ fontFamily: SERIF }}
          >
            When you are ready,<br />
            <span className="italic text-[#d4b67d]">a door is already open.</span>
          </h2>
          <p className="mt-9 text-[15px] sm:text-[15.5px] leading-[1.85] text-[#bcb4a3] max-w-[560px] mx-auto font-light">
            No urgency. No invitation required this season. The room
            keeps its own quiet hours, and the inner pages remember nothing
            of who has visited.
          </p>
          <p
            className="mt-7 text-[14.5px] italic text-[#a59f93] max-w-[520px] mx-auto leading-[1.85] font-light"
            style={{ fontFamily: SERIF }}
          >
            You are not here to be fixed. You are here to be met — as
            you already are, in love and quiet respect for yourself,
            for others, and for the world.
          </p>
          <div className="mt-14">
            <Link
              to="/portal"
              data-testid="closing-cta"
              className="inline-flex items-center gap-3 text-[12px] tracking-[0.36em] uppercase text-[#c4a46b] border border-[rgba(196,164,107,0.55)] px-10 sm:px-12 py-4 hover:text-[#0b0a08] hover:bg-[#c4a46b] transition-colors duration-700"
            >
              Continue Reading
            </Link>
          </div>
        </RevealBlock>
      </div>
    </section>
  );
}

// §TWO PATHS 2026-05-19 — Founder directive: a calm conceptual gate
// between the rooms and the actual pricing cards below. Frames the
// two doors (free writing vs. credit-/subscription-based voice)
// WITHOUT repeating the prices — those live in WaysToBeHereSection
// just below. Premium-minimalist: no duplication.
function TwoPathsSection() {
  const paths = [
    {
      key: "credits",
      kicker: "Path I",
      name: "The Wanderer's Credits",
      tagline: "Pay only for what you use. No subscription.",
      detail: "A single hour to begin, with flexible additions of presence when you wish to return. Credits never expire.",
    },
    {
      key: "subscription",
      kicker: "Path II",
      name: "The Aurin Subscription",
      tagline: "Monthly companionship. Move freely between all rooms.",
      detail: "A steady presence each month, or your own dedicated room held in quiet for you.",
      featured: true,
    },
  ];
  return (
    <section
      id="two-paths"
      data-testid="sanctuary-two-paths"
      className="relative w-full bg-[#0b0a08] py-28 border-t border-[rgba(196,164,107,0.08)]"
    >
      <div className="max-w-[1180px] mx-auto px-6 sm:px-10">
        <RevealBlock>
          <p className="text-[11px] tracking-[0.42em] uppercase text-[#c4a46b] mb-6 text-center">
            — Two Paths
          </p>
          <h2
            className="text-center text-[28px] sm:text-[36px] lg:text-[42px] leading-[1.18] text-[#f0eadd] font-light max-w-[760px] mx-auto"
            style={{ fontFamily: SERIF }}
          >
            Writing is always free.<br />
            <span className="italic text-[#bcb4a3]">Voice opens through one of two doors.</span>
          </h2>
          <p
            className="mt-7 text-center text-[14px] leading-[1.85] italic text-[#a59f93] max-w-[560px] mx-auto font-light"
            style={{ fontFamily: SERIF }}
          >
            Choose the rhythm that fits your life — a single hour, or a quiet monthly presence.
          </p>
        </RevealBlock>
        <div className="mt-20 grid md:grid-cols-2 gap-7 lg:gap-12">
          {paths.map((p, i) => (
            <RevealBlock key={p.key} delay={i * 120}>
              <div
                data-testid={`two-paths-${p.key}`}
                className={`h-full p-10 sm:p-12 border ${
                  p.featured
                    ? "border-[rgba(196,164,107,0.55)] bg-[rgba(28,24,18,0.6)]"
                    : "border-[rgba(196,164,107,0.22)] bg-[rgba(18,16,13,0.55)]"
                }`}
              >
                <p className="text-[10px] tracking-[0.42em] uppercase text-[#c4a46b] mb-5">
                  {p.kicker}
                </p>
                <h3
                  className="text-[26px] sm:text-[30px] leading-[1.16] text-[#f0eadd] font-light mb-3"
                  style={{ fontFamily: SERIF }}
                >
                  {p.name}
                </h3>
                <p
                  className="text-[13.5px] italic leading-[1.7] text-[#a59f93] mb-5 font-light"
                  style={{ fontFamily: SERIF }}
                >
                  {p.tagline}
                </p>
                <p
                  className="text-[14px] leading-[1.85] text-[#bcb4a3] font-light"
                  style={{ fontFamily: SERIF }}
                >
                  {p.detail}
                </p>
              </div>
            </RevealBlock>
          ))}
        </div>
        <RevealBlock delay={240}>
          <div className="mt-16 flex flex-col items-center gap-4">
            <a
              href="#ways"
              data-testid="two-paths-view-packages"
              className="inline-flex items-center gap-3 px-7 py-3 border border-[rgba(196,164,107,0.45)] text-[#f0eadd] text-[11px] tracking-[0.42em] uppercase hover:bg-[rgba(196,164,107,0.08)] hover:border-[rgba(196,164,107,0.7)] transition-colors duration-500"
            >
              <span>View Packages</span>
              <span className="text-[#c4a46b]" aria-hidden="true">↓</span>
            </a>
            <p className="text-[11px] tracking-[0.28em] uppercase text-[#7a7468]">
              Reading, reflection, and text conversation remain free.
            </p>
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
          <Link to="/what-this-is" className="hover:text-[#bcb4a3] transition-colors duration-500" data-testid="sanctuary-footer-what-this-is">What this is</Link>
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

export default function SanctuaryPreview({ production = false } = {}) {
  useHidePlatformBadge();
  const [truthOpen, setTruthOpen] = useState(false);
  const openTruth = () => setTruthOpen(true);
  const closeTruth = () => setTruthOpen(false);
  // After completing the sequence, the modal CTA itself routes to /portal.
  const completeTruth = () => setTruthOpen(false);
  return (
    <div
      data-testid={production ? "sanctuary-home-root" : "sanctuary-preview-root"}
      className="min-h-screen w-full bg-[#0b0a08] text-[#e8e1d5] antialiased"
      style={{ fontFamily: 'system-ui, -apple-system, "Helvetica Neue", Arial, sans-serif' }}
    >
      {production ? null : (
        <div
          data-testid="sanctuary-preview-ribbon"
          className="fixed top-0 left-0 right-0 z-[60] bg-[#c4a46b] text-[#0b0a08] text-[10px] tracking-[0.32em] uppercase text-center py-1.5"
        >
          Preview · /sanctuary-preview · production unchanged
        </div>
      )}
      <div className={production ? "" : "pt-[28px]"}>
        <SanctuaryNav production={production} />
        <main>
          <HeroSection onWalkTruthFirst={openTruth} />
          <FiveRoomsRecognitionSection />
          <SprintZeroLayersSection />
          <HeroCompass />
          <QuietNoteSection />
          <TwoWorldsSection />
          <RoomsSection />
          <TwoPathsSection />
          <OpenWorldSection />
          <WaysToBeHereSection />
          <VoiceMeterSection />
          <PhilosophySection />
          <ClosingSection />
          <AurinsPromise tone="dark" showEarlyAccess={true} />
        </main>
        <SanctuaryFooter />
      </div>
      <TruthSequenceModal
        open={truthOpen}
        onClose={closeTruth}
        onComplete={completeTruth}
      />
    </div>
  );
}
