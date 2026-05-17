/**
 * LuxurySanctuaryLanding — React port of Atoms IMPLEMENTATION-PACKAGE.md v1.0
 * (APPROVED FOR PREVIEW IMPLEMENTATION, 2026-05-17).
 *
 * Route: /luxury — sits ALONGSIDE the current `/` Home page so the
 * founder can compare both before approving any replacement.
 *
 * Implementation rules (founder-locked):
 *   - Verbatim copy from spec — no rewording.
 *   - All visual tokens, layout, animations, mobile breakpoints from
 *     the spec's style.css (loaded scoped under .luxury-sanctuary).
 *   - HYBRID pricing CTAs: visual prices €45 / €120/mo / €380/mo come
 *     directly from the spec; clicks route to `/clarity-release#passes`
 *     so the existing LemonSqueezy + presence_seconds_left runtime is
 *     never re-pointed. Pricing reconciliation is a later decision.
 *   - Four Doors: Grace / Clarity Release is intentionally NOT one of
 *     the visible primary doors. Grace remains accessible through the
 *     guided `/the-beginning` flow per founder Q3=a.
 *   - Internal anchor scroll uses native CSS scroll-behavior; no JS.
 *   - prefers-reduced-motion: the spec's CSS already disables anims.
 */
import { useEffect, useRef } from "react";
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

  // Entrance animation — lifts veil + reveals hero content.
  useEffect(() => {
    const raf = requestAnimationFrame(() => {
      if (veilRef.current) veilRef.current.classList.add("lifted");
      if (heroRef.current) heroRef.current.classList.add("hero-arrived");
    });
    const veilTimer = setTimeout(() => {
      if (veilRef.current && veilRef.current.parentNode) {
        veilRef.current.parentNode.removeChild(veilRef.current);
      }
    }, 2200);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(veilTimer);
    };
  }, []);

  // Nav style on scroll (compact + backdrop blur).
  useEffect(() => {
    const onScroll = () => {
      if (!navRef.current) return;
      if (window.scrollY > 50) navRef.current.classList.add("scrolled");
      else navRef.current.classList.remove("scrolled");
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
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
          <a href="#doors" className="nav-link">Rooms</a>
          <a href="#offerings" className="nav-link">Offerings</a>
          <a href="#threshold" className="nav-cta">Enter</a>
        </div>
      </nav>

      <section className="hero" id="hero" ref={heroRef}>
        <div className="hero-visual">
          <img
            src="/luxury-hero.png"
            alt="A person gently removing a digital mask, revealing their authentic self"
            className="hero-image"
          />
          <div className="hero-image-overlay" />
        </div>
        <div className="hero-content">
          <p className="hero-whisper">Matrix Aurin</p>
          <h1 className="hero-headline">
            Welcome back<br />to yourself.
          </h1>
          <p className="hero-subtext">You do not have to perform here.</p>
          <a href="#threshold" className="hero-cta">Step inside</a>
        </div>
      </section>

      <section className="principles" id="sanctuary">
        <div className="principles-inner">
          <p className="section-whisper">What this place holds</p>
          <div className="principles-grid">
            <div className="principle">
              <span className="principle-number">I</span>
              <h3 className="principle-title">Privacy</h3>
              <p className="principle-text">No pixels watch you here. No data leaves this room. Your journey stays yours — that is part of the design.</p>
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
          <h2 className="offerings-headline">Choose how you wish to arrive.</h2>
          <p className="offerings-subtext">
            There is no wrong door. Each path holds space for you differently.
          </p>

          <div className="offerings-grid">
            {/* Tier 1 — A First Step */}
            <div className="offering-card" data-testid="luxury-tier-first-step">
              <div className="offering-header">
                <span className="offering-label">A First Step</span>
                <h3 className="offering-title">One session.<br />One quiet hour.</h3>
              </div>
              <div className="offering-body">
                <p className="offering-description">No commitment. Just curiosity. Enter one room, stay as long as you need, leave when you're ready. This is simply a beginning.</p>
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

            {/* Tier 2 — A Steady Presence (Featured) */}
            <div className="offering-card offering-card--featured" data-testid="luxury-tier-steady">
              <div className="offering-header">
                <span className="offering-label">A Steady Presence</span>
                <h3 className="offering-title">All rooms.<br />Monthly companionship.</h3>
              </div>
              <div className="offering-body">
                <p className="offering-description">Return as often as you need. Move freely between all rooms, with a monthly voice session to ground your journey. You are welcome here, always.</p>
                <ul className="offering-includes">
                  <li>Unlimited access to all four rooms</li>
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

            {/* Tier 3 — Your Own Room */}
            <div className="offering-card" data-testid="luxury-tier-own-room">
              <div className="offering-header">
                <span className="offering-label">Your Own Room</span>
                <h3 className="offering-title">A space held<br />only for you.</h3>
              </div>
              <div className="offering-body">
                <p className="offering-description">For those ready for sustained, intimate work. Weekly voice sessions, unlimited room access, and a private channel — your own corner of this sanctuary.</p>
                <ul className="offering-includes">
                  <li>Unlimited access to all rooms</li>
                  <li>Weekly private AI voice sessions</li>
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

      <footer className="footer">
        <div className="footer-inner">
          <div className="footer-brand">Matrix Aurin</div>
          <p className="footer-trust">
            No social-media pixels. No tracking cookies. No public feed.<br />
            Your journey through this work stays yours — that is part of the design.
          </p>
          <p className="footer-warmth">Built with care. Held with silence.</p>
          <div className="footer-links">
            <a href="/the-beginning" className="footer-link">The Beginning</a>
            <a href="/body-room" className="footer-link">Body Room</a>
            <a href="/parents-room" className="footer-link">Parents' Room</a>
            <a href="/course-room" className="footer-link">Course Room</a>
          </div>
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
