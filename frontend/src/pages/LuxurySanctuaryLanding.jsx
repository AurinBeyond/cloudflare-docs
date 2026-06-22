/**
 * LuxurySanctuaryLanding — React port of Atoms IMPLEMENTATION-PACKAGE.md
 * Current revision: V6 — "WORLD COHESION REFINEMENT" + SANCTUARY EXPANSION
 * (2026-05-17, MIKE + Alex / Atoms).
 *
 * Route: /luxury — preserved alongside `/` as an evolving Sanctuary
 * Product Ecosystem foundation. Founder lock: do NOT remove or rebuild.
 * Allow MIKE + Alex (Atoms) to continue refining on top of this base.
 *
 * V6 evolution (over V1):
 *   - Nav simplified — removed "Offerings", renamed "Rooms" → "Doors"
 *   - Hero breathing space — added .hero-breath spacer, 110vh feel
 *   - Removed visible ::before line dividers throughout
 *   - Offerings headline: "Choose how you wish to arrive."
 *       → "There is no wrong way to arrive."
 *   - Threshold and CTAs softened (opacity-only hover, no shadows)
 *   - NEW section: <section class="sanctuary-wings"> — a whisper of
 *     the four future rooms (Library, Kids Universe, Quiet Store,
 *     Voice Sanctuary). Sanctuary Expansion Mode in action.
 *   - Footer simplified — room links removed; brand + trust + meta only
 *   - Page veil duration 2s → 2.5s
 *
 * HYBRID PRICING (founder Q4=c, still in force):
 *   - Visual €45 / €120 / €380 preserved verbatim from spec
 *   - CTA links route to /clarity-release#passes (existing MLV runtime)
 *   - No backend / Lemon / presence_seconds_left changes
 */
import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import "../styles/luxury-sanctuary.css";

const DOORS = [
  {
    number: "01",
    title: "The Beginning",
    subtitle: "Where you slow down and listen inward",
    hint: "Find your own rhythm.",
    href: "/the-beginning",
  },
  {
    number: "02",
    title: "Body Room",
    subtitle: "Where the body remembers what the mind forgot",
    hint: "Let the body speak.",
    href: "/body-room",
  },
  {
    number: "03",
    title: "Parents' Room",
    subtitle: "Where inherited patterns become visible",
    hint: "What was inherited. What is yours.",
    href: "/parents-room",
  },
  {
    number: "04",
    title: "Course Room",
    subtitle: "Where growth happens without pressure",
    hint: "Mastery without performance.",
    href: "/course-room",
  },
];

// HYBRID per founder Q4=c — visual prices preserved; all CTAs route
// to the existing /clarity-release#passes surface where the locked
// MLV runtime (LemonSqueezy + presence_seconds_left) takes over.
const HYBRID_CTA_HREF = "/clarity-release#passes";

export default function LuxurySanctuaryLanding() {
  const veilRef = useRef(null);
  const heroRef = useRef(null);
  const navRef = useRef(null);

  // Entrance — veil lifts, hero arrives. V6: slowed to 2.5s veil.
  useEffect(() => {
    const raf = requestAnimationFrame(() => {
      if (veilRef.current) veilRef.current.classList.add("lifted");
      if (heroRef.current) heroRef.current.classList.add("hero-arrived");
    });
    const veilTimer = setTimeout(() => {
      if (veilRef.current && veilRef.current.parentNode) {
        veilRef.current.parentNode.removeChild(veilRef.current);
      }
    }, 2700);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(veilTimer);
    };
  }, []);

  // Nav compact state on scroll.
  useEffect(() => {
    const onScroll = () => {
      if (!navRef.current) return;
      if (window.scrollY > 50) navRef.current.classList.add("scrolled");
      else navRef.current.classList.remove("scrolled");
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Scroll-reveal — V6 gentled: 12px translateY, 1.2s duration.
  // §STABILIZATION 2026-05-18 — Safe-reveal fallback: ensure every
  // `.reveal` element becomes `.visible` even if the IntersectionObserver
  // misses (mid-page mount, prefers-reduced-motion, deep-link to anchor,
  // older browser). After 1500ms any still-hidden element is force-
  // revealed so the wanderer never sees an empty principles/doors/
  // offerings grid.
  useEffect(() => {
    const els = document.querySelectorAll(
      ".luxury-sanctuary .principle, .luxury-sanctuary .door, " +
        ".luxury-sanctuary .offering-card, .luxury-sanctuary .threshold-text",
    );
    els.forEach((el) => el.classList.add("reveal"));

    // Honour reduced motion — instant-reveal everything, no observer.
    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) {
      els.forEach((el) => el.classList.add("visible"));
      return undefined;
    }

    let obs;
    if (typeof IntersectionObserver !== "undefined") {
      obs = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("visible");
              obs.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.01, rootMargin: "0px 0px -5% 0px" },
      );
      els.forEach((el) => obs.observe(el));
    } else {
      // No observer support → reveal all immediately.
      els.forEach((el) => el.classList.add("visible"));
    }

    // Hard safety net: anything still not `.visible` after 1.5s gets
    // revealed regardless. Costs nothing if everything already fired.
    const fallback = setTimeout(() => {
      els.forEach((el) => {
        if (!el.classList.contains("visible")) {
          el.classList.add("visible");
        }
      });
    }, 1500);

    return () => {
      clearTimeout(fallback);
      if (obs) obs.disconnect();
    };
  }, []);

  return (
    <div className="luxury-sanctuary" data-testid="luxury-sanctuary">
      <div className="page-veil" ref={veilRef} />

      <nav className="nav" ref={navRef}>
        <div className="nav-brand">
          <a href="#hero" className="nav-brand-text">Matrix Aurin</a>
        </div>
        <div className="nav-links">
          <a href="#sanctuary" className="nav-link">Sanctuary</a>
          <a href="#doors" className="nav-link">Doors</a>
          <a href="#threshold" className="nav-cta">Enter</a>
        </div>
      </nav>

      {/*
        SPRINT 0 — "Less Noise. More Meaning." (2026-02)
        4-layer hero, locked after 5-day brainstorm.
        Previous V6 hero archived → /app/memory/archive/hero_2026_06.md
      */}
      <section className="hero" id="hero" ref={heroRef}>
        <div className="hero-visual">
          <img
            src="/luxury-hero.png"
            alt="A person gently removing a digital mask, revealing their authentic self"
            className="hero-image"
          />
          <div className="hero-image-overlay" />
        </div>
        <div className="hero-content" data-testid="luxury-hero-content">
          {/* Layer 1 — What this is */}
          <h1 className="hero-headline hero-headline--statement" data-testid="luxury-hero-headline">
            A living place<br />
            to read, listen, and reflect.
          </h1>
          <p className="hero-subtext hero-subtext--frame" data-testid="luxury-hero-subtext">
            Five rooms for people, parents, and families.<br />
            A space for conversation, reflection, and discovery.
          </p>
        </div>
      </section>

      {/* §FIVE-ROOM-DIRECTORY 2026-06-22 — Positive-recognition row
          for each of the five inhabited rooms. Each line names the
          experience, not the feature. Visitor scans in under three
          seconds and chooses where to walk. Anti-wellness lock,
          eventyr lock (Polarstar carries the Norwegian word italics).
          §VOICE-LIVING-PLACE-LOCK · §RECOGNITION-NOT-PITCH-LOCK. */}
      <section
        className="five-rooms"
        id="five-rooms"
        data-testid="luxury-five-rooms"
        style={{
          padding: "5rem 1.5rem 6rem",
          background: "linear-gradient(180deg, transparent 0%, rgba(28, 22, 14, 0.35) 100%)",
        }}
      >
        <div
          style={{
            maxWidth: "780px",
            margin: "0 auto",
            fontFamily: '"Cormorant Garamond", "EB Garamond", Georgia, serif',
          }}
        >
          <p
            style={{
              textTransform: "uppercase",
              letterSpacing: "0.35em",
              fontSize: "0.7rem",
              color: "hsl(140, 18%, 65%)",
              textAlign: "center",
              marginBottom: "2.5rem",
            }}
          >
            Five rooms · choose a door
          </p>
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {[
              { to: "/parents-room",  glyph: "⛵", name: "Sara",     line: "for the spaces between people you love",                       testid: "five-rooms-sara"      },
              { to: "/grace",         glyph: "🔥", name: "Grace",    line: "for the room with no one watching",                            testid: "five-rooms-grace"     },
              { to: "/body-world",    glyph: "🌿", name: "Kaelen",   line: "for what the body has been quietly saying",                    testid: "five-rooms-kaelen"    },
              { to: "/alistair",      glyph: "🧭", name: "Alistair", line: "for the questions that keep returning",                        testid: "five-rooms-alistair"  },
              { to: "/kids-universe", glyph: "⭐", name: "Polarstar", line: "eventyr — wonder, childhood, adventures we live together",     testid: "five-rooms-polarstar", italicWord: "eventyr" },
            ].map((r) => (
              <li
                key={r.testid}
                style={{
                  borderTop: "1px solid hsla(40, 22%, 70%, 0.15)",
                }}
              >
                <Link
                  to={r.to}
                  data-testid={r.testid}
                  style={{
                    display: "block",
                    padding: "1.5rem 0.5rem",
                    textDecoration: "none",
                    color: "hsl(40, 18%, 90%)",
                    transition: "background 0.3s ease, padding-left 0.3s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "hsla(40, 22%, 70%, 0.04)";
                    e.currentTarget.style.paddingLeft = "1.25rem";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "transparent";
                    e.currentTarget.style.paddingLeft = "0.5rem";
                  }}
                >
                  <div style={{ display: "flex", alignItems: "baseline", gap: "1rem" }}>
                    <span style={{ fontSize: "1.5rem", lineHeight: 1, opacity: 0.85 }} aria-hidden="true">
                      {r.glyph}
                    </span>
                    <div>
                      <p
                        style={{
                          fontSize: "1.6rem",
                          margin: 0,
                          letterSpacing: "0.01em",
                          color: "hsl(40, 25%, 95%)",
                        }}
                      >
                        {r.name}
                      </p>
                      <p
                        style={{
                          fontSize: "1rem",
                          fontStyle: "italic",
                          margin: "0.25rem 0 0",
                          color: "hsla(40, 20%, 78%, 0.85)",
                          lineHeight: 1.5,
                        }}
                      >
                        {r.italicWord ? (
                          <>
                            <em style={{ fontStyle: "italic", color: "hsl(35, 35%, 80%)" }}>{r.italicWord}</em>
                            {" — "}
                            {r.line.replace(r.italicWord + " — ", "")}
                          </>
                        ) : (
                          r.line
                        )}
                      </p>
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>

          <p
            style={{
              fontSize: "0.95rem",
              fontStyle: "italic",
              textAlign: "center",
              color: "hsla(40, 18%, 68%, 0.85)",
              marginTop: "3rem",
              lineHeight: 1.7,
            }}
            data-testid="luxury-five-rooms-coda"
          >
            This is not a course. It is not a programme to complete.
            <br />
            It is a place to return to.
            <br />
            <span style={{ display: "inline-block", marginTop: "0.5rem", fontSize: "0.85rem", color: "hsla(40, 18%, 58%, 0.7)" }}>
              Two rooms (Sara and Kaelen) ask you to read a short threshold before entering.
            </span>
          </p>
        </div>
      </section>

      {/* Layer 2 — Concrete transformation (came with → leave with) */}
      <section className="transformation" id="transformation" data-testid="luxury-transformation">
        <div className="transformation-inner">
          <div className="transformation-head">
            <span className="transformation-col-label">If you came here with…</span>
            <span className="transformation-col-divider" aria-hidden="true" />
            <span className="transformation-col-label">you may leave with…</span>
          </div>
          <ul className="transformation-rows">
            <li className="transformation-row">
              <span className="transformation-from">too many thoughts</span>
              <span className="transformation-arrow" aria-hidden="true">→</span>
              <span className="transformation-to">one thought clearer</span>
            </li>
            <li className="transformation-row">
              <span className="transformation-from">tension your body has carried</span>
              <span className="transformation-arrow" aria-hidden="true">→</span>
              <span className="transformation-to">one quieter breath</span>
            </li>
            <li className="transformation-row">
              <span className="transformation-from">a hard conversation at home</span>
              <span className="transformation-arrow" aria-hidden="true">→</span>
              <span className="transformation-to">one new way to begin it</span>
            </li>
            <li className="transformation-row">
              <span className="transformation-from">an evening that disappeared</span>
              <span className="transformation-arrow" aria-hidden="true">→</span>
              <span className="transformation-to">one shared moment back</span>
            </li>
          </ul>
        </div>
      </section>

      {/* Layer 3 — Self-recognition trio */}
      <section className="audience" id="audience" data-testid="luxury-audience">
        <div className="audience-inner">
          <p className="audience-line">For people who want a little more clarity.</p>
          <p className="audience-line">For parents who want a little more patience.</p>
          <p className="audience-line">For families who want a little more time together.</p>
        </div>
      </section>

      {/* Layer 4 — Three CTAs with clear hierarchy */}
      <section className="hero-ctas" id="hero-ctas" data-testid="luxury-hero-ctas">
        <div className="hero-ctas-inner">
          <a
            href="/start-here"
            className="hero-cta-primary"
            data-testid="luxury-cta-start-here"
          >
            Start Here
          </a>
          <a
            href="#doors"
            className="hero-cta-secondary"
            data-testid="luxury-cta-see-rooms"
          >
            See the Five Rooms
          </a>
          <a
            href="/bookstore"
            className="hero-cta-secondary"
            data-testid="luxury-cta-browse-books"
          >
            Browse Books
          </a>
        </div>
      </section>

      <section className="principles" id="sanctuary">
        <div className="principles-inner">
          <p className="section-whisper">What this place holds</p>
          <div className="principles-grid">
            <div className="principle">
              <span className="principle-number">I</span>
              <h3 className="principle-title">Privacy</h3>
              <p className="principle-text">No pixels watch you here. No data leaves this room. What unfolds here stays yours — that is part of the design.</p>
            </div>
            <div className="principle">
              <span className="principle-number">II</span>
              <h3 className="principle-title">Presence</h3>
              <p className="principle-text">A room that listens more than it speaks. What you bring here is met with calm attention, not performance.</p>
            </div>
            <div className="principle">
              <span className="principle-number">III</span>
              <h3 className="principle-title">Silence</h3>
              <p className="principle-text">The noise stops working here. In the quiet, you begin to hear what you have always known.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="doors" id="doors">
        <div className="doors-inner">
          <p className="section-whisper">The doors</p>
          <h2 className="doors-headline">Four entries.<br />One quiet place.</h2>
          <p className="doors-subtext">
            Each one has its own tone. None of them rush you.<br />
            Walk through the one that calls.
          </p>
          <div className="doors-grid">
            {DOORS.map((d) => (
              <a key={d.number} href={d.href} className="door" data-testid={`luxury-door-${d.number}`}>
                <span className="door-number">{d.number}</span>
                <h3 className="door-title">{d.title}</h3>
                <p className="door-subtitle">{d.subtitle}</p>
                <p className="door-hint">{d.hint}</p>
              </a>
            ))}
          </div>
        </div>
      </section>

      <section className="offerings" id="offerings">
        <div className="offerings-inner">
          <p className="section-whisper">Ways to be here</p>
          <h2 className="offerings-headline">There is no wrong way to arrive.</h2>
          <p className="offerings-subtext">
            Each path holds space for you differently. Begin wherever feels true.
          </p>

          <div className="offerings-grid">
            <div className="offering-card" data-testid="luxury-tier-first-step">
              <div className="offering-header">
                <span className="offering-label">A First Step</span>
                <h3 className="offering-title">One session.<br />One quiet hour.</h3>
              </div>
              <div className="offering-body">
                <p className="offering-description">No commitment. Just curiosity. Enter one room, stay as long as you need, leave when you&apos;re ready. This is simply a beginning.</p>
                <ul className="offering-includes">
                  <li>Access to one room of your choosing</li>
                  <li>A guided session at your pace</li>
                  <li>No subscription, no follow-up pressure</li>
                </ul>
              </div>
              <div className="offering-footer">
                <span className="offering-price">€45</span>
                <span className="offering-period">one session</span>
                <a href={HYBRID_CTA_HREF} className="offering-cta">Begin quietly</a>
              </div>
            </div>

            <div className="offering-card offering-card--featured" data-testid="luxury-tier-steady">
              <div className="offering-header">
                <span className="offering-label">A Steady Presence</span>
                <h3 className="offering-title">All rooms.<br />Monthly companionship.</h3>
              </div>
              <div className="offering-body">
                <p className="offering-description">Return as often as you need. Move freely between all rooms, with a monthly voice session included. You are welcome here, always.</p>
                <ul className="offering-includes">
                  <li>Access to all four rooms</li>
                  <li>One private voice session per month</li>
                  <li>Priority access to new spaces</li>
                  <li>The quiet community thread</li>
                </ul>
              </div>
              <div className="offering-footer">
                <span className="offering-price">€120</span>
                <span className="offering-period">per month</span>
                <a href={HYBRID_CTA_HREF} className="offering-cta">Step in</a>
              </div>
            </div>

            <div className="offering-card" data-testid="luxury-tier-own-room">
              <div className="offering-header">
                <span className="offering-label">Your Own Room</span>
                <h3 className="offering-title">A space held<br />only for you.</h3>
              </div>
              <div className="offering-body">
                <p className="offering-description">For those ready for sustained, intimate work. Weekly voice sessions, full room access, and a private channel — your own corner of this sanctuary.</p>
                <ul className="offering-includes">
                  <li>Full access to all rooms</li>
                  <li>Weekly private live voice sessions</li>
                  <li>Priority presence and response</li>
                  <li>Early access to future sanctuaries</li>
                  <li>Direct channel for quiet requests</li>
                </ul>
              </div>
              <div className="offering-footer">
                <span className="offering-price">€380</span>
                <span className="offering-period">per month</span>
                <a href={HYBRID_CTA_HREF} className="offering-cta">Enter gently</a>
              </div>
            </div>
          </div>

          <p className="offerings-note">
            All paths include complete privacy. No data shared. No tracking. Cancel with a single word.
          </p>
        </div>
      </section>

      <section className="threshold" id="threshold">
        <div className="threshold-inner">
          <p className="section-whisper">A quiet invitation</p>
          <h2 className="threshold-headline">You are welcome here.</h2>
          <p className="threshold-text">
            I want you to know — this is not a place you have to earn.<br />
            It is a place you recognize. A place that has been waiting.
          </p>
          <p className="threshold-text threshold-text-secondary">
            Something inside you already knows.<br />
            Not everything you carry was chosen by you.<br /><br />
            This is where you begin to see that clearly —<br />
            gently, without rush — and from there, choose what stays.
          </p>
          <a href="/the-beginning" className="threshold-cta">Begin gently</a>
        </div>
      </section>

      {/* V6 NEW — Sanctuary Wings (whisper of what is growing) */}
      <section className="sanctuary-wings" data-testid="luxury-wings">
        <div className="sanctuary-wings-inner">
          <p className="wings-whisper">More rooms are being prepared.</p>
          <p className="wings-text">
            An Open Library for the curious mind.<br />
            A Kids Universe for the ones still close to wonder.<br />
            A Quiet Store for objects that hold meaning.<br />
            A Voice Room for what needs to be spoken aloud.
          </p>
          <p className="wings-closing">In time. Without rush.</p>
        </div>
      </section>

      <footer className="footer">
        <div className="footer-inner">
          <div className="footer-brand">Matrix Aurin</div>
          <p className="footer-trust">
            No social-media pixels. No tracking cookies. No public feed.<br />
            What unfolds here stays yours — that is part of the design.
          </p>
          <p className="footer-warmth">Built with care. Held with silence.</p>
          <div className="footer-meta">
            <span>Est. 2026</span>
            <span className="footer-dot" />
            <span>Quiet by design</span>
            <span className="footer-dot" />
            <a href="/legal" className="footer-meta-link">Privacy</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
