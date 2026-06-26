/**
 * HeroCompass — The interactive SVG navigation Compass on the
 * House homepage (production `/`).
 *
 * §COMPASS 2026-02-11 — Founder directive (Variant A):
 *   Replace the traditional "four cards in a row" room menu with a
 *   single, cohesive SVG compass that maps the four Adult-side
 *   rooms to cardinal headings. Each cardinal arm is a clickable
 *   navigation target that, while the platform is in "Pre-heat /
 *   Coming Soon" mode, opens the existing `WaitlistInline` form
 *   (POST /waitlist/join) instead of routing into the live room.
 *
 *   Cardinal mapping (founder lock):
 *     N (360°) — Kaelan      — Body Architecture
 *     E ( 90°) — Sara        — Parents' Room
 *     S (180°) — Grace       — Clarity Release
 *     W (270°) — Alistair    — Course Room
 *
 *   Visual lineage:
 *     - Brass / bronze line work on the existing graniidist
 *       (#0b0a08) house canvas.
 *     - Cardinal degree numbers (360, 90, 180, 270) preserved as
 *       navigational "codes" per founder directive.
 *     - No therapy / wellness language. Strictly Body Architecture
 *       / Curator terminology.
 */
import { useEffect, useRef, useState } from "react";
import { WaitlistInline } from "@/components/MembershipTiers";
import SovereignCounter from "@/components/house/SovereignCounter";
import { trackEvent } from "@/lib/analytics";
const SERIF = '"Cormorant Garamond", "EB Garamond", Georgia, serif';
const BRASS = "#c4a46b";
const BRASS_BRIGHT = "#d4b67d";
const CREAM = "#f0eadd";
const MUTED = "#7a7468";

const CARDINALS = [
  {
    key: "north",
    degrees: 360,
    label: "N",
    angle: 270, // SVG: 0° points right, so North = 270°
    curator: "Kaelan",
    room: "Body Architecture",
    whisper: "The architecture remembers what the mind forgets.",
    slug: "compass-body-architecture",
    testid: "compass-arm-north",
  },
  {
    key: "east",
    degrees: 90,
    label: "E",
    angle: 0,
    curator: "Sara",
    room: "Parents' Room",
    whisper: "What was inherited. What is now yours.",
    slug: "compass-parents-room",
    testid: "compass-arm-east",
    // §BROKEN-CLOCKWORK 2026-02-11 — East carries a custom UX signal:
    // when hovered, the dial accelerates and the sonic layer morphs
    // into a 1-second mechanical metronome. The waitlist modal swaps
    // to the "Broken Clockwork" frame.
    modalHeadline: "[ TRANSMISSION GATE: PARENTS' ROOM ]",
    modalBody: (
      "You promised them time. The business demanded otherwise. " +
      "The countdown hit zero, and the trust short-circuited. " +
      "Parents' Room is not another counselling layer. " +
      "It is the Anchor OS your home was never given. " +
      "Leave your access key below and step out of the transactional " +
      "loop — the clock is ticking."
    ),
  },
  {
    key: "south",
    degrees: 180,
    label: "S",
    angle: 90,
    curator: "Grace",
    room: "Grace",
    whisper: "Release the structure that no longer holds.",
    slug: "compass-clarity-release",
    testid: "compass-arm-south",
  },
  {
    key: "west",
    degrees: 270,
    label: "W",
    angle: 180,
    curator: "Alistair",
    room: "Course Room",
    whisper: "Sovereign study. Unhurried mastery.",
    slug: "compass-course-room",
    testid: "compass-arm-west",
  },
];

const CX = 300;
const CY = 300;
const R_OUTER = 270;
const R_INNER = 200;
const R_TICK_OUTER = 268;
const R_TICK_INNER = 256;
const R_LABEL = 170;
const R_DEGREE = 230;

function polar(r, angleDeg) {
  const rad = (angleDeg * Math.PI) / 180;
  return { x: CX + r * Math.cos(rad), y: CY + r * Math.sin(rad) };
}

// Per-cardinal text placement. For N/S the curator + room stack
// vertically on the axis. For E/W the labels sit inside the inner
// disc on the horizontal arm but are nudged vertically so they do
// not collide with the arm line itself.
function textBlockFor(key) {
  switch (key) {
    case "north":
      return { curator: { x: CX, y: CY - 118 }, room: { x: CX, y: CY - 100 } };
    case "south":
      return { curator: { x: CX, y: CY + 112 }, room: { x: CX, y: CY + 130 } };
    case "east":
      return { curator: { x: CX + 122, y: CY - 12 }, room: { x: CX + 122, y: CY + 8 } };
    case "west":
      return { curator: { x: CX - 122, y: CY - 12 }, room: { x: CX - 122, y: CY + 8 } };
    default:
      return { curator: { x: CX, y: CY }, room: { x: CX, y: CY } };
  }
}

// 24 minor ticks around the dial (every 15°), brass thin lines.
const TICKS = Array.from({ length: 24 }, (_, i) => i * 15);

export default function HeroCompass() {
  const [active, setActive] = useState(null); // hovered cardinal key
  const [openSlug, setOpenSlug] = useState(null); // which waitlist is open
  const [audioOn, setAudioOn] = useState(false); // user-toggled audio ambient
  const containerRef = useRef(null);
  const [revealed, setRevealed] = useState(false);

  // §AMBIENT 2026-02-11 — Founder directive: a subtle "Screen-Down,
  // Ears-Open" sonic layer on the Compass. Synth-driven (Web Audio
  // API), no asset file. Two-layer drone: a low cosmic-wind pad
  // (oscillator pair detuned with lowpass) and a faint mechanical
  // tick at the dial cadence. Master gain is very low; intensifies
  // ~3× when a cardinal is hovered.
  const audioCtxRef = useRef(null);
  const audioNodesRef = useRef(null);
  const startAmbient = () => {
    if (audioCtxRef.current) return;
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      const ctx = new AC();
      const master = ctx.createGain();
      master.gain.value = 0.0;
      master.connect(ctx.destination);

      // Low cosmic wind — two detuned sine oscillators through a lowpass
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      osc1.type = "sine";
      osc2.type = "sine";
      osc1.frequency.value = 82.4; // E2
      osc2.frequency.value = 110;  // A2 — open fifth feel
      const lp = ctx.createBiquadFilter();
      lp.type = "lowpass";
      lp.frequency.value = 420;
      lp.Q.value = 0.6;
      const droneGain = ctx.createGain();
      droneGain.gain.value = 0.18;
      osc1.connect(lp);
      osc2.connect(lp);
      lp.connect(droneGain);
      droneGain.connect(master);
      osc1.start();
      osc2.start();

      // Slow LFO on the lowpass — gives a breathing quality
      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();
      lfo.frequency.value = 0.07; // ~14s cycle
      lfoGain.gain.value = 160;
      lfo.connect(lfoGain);
      lfoGain.connect(lp.frequency);
      lfo.start();

      // Mechanical tick — short pulse every ~3.5s. When the user
      // hovers over Sara's wedge (East / Parents' Room), the
      // metronome morphs into a sharp 1-second clockwork tick at a
      // higher pitch — the t.A.T.u. "30 minut" Broken Clockwork
      // signature. See active-cardinal effect below.
      let tickTimer = null;
      const tick = (sharp = false) => {
        const now = ctx.currentTime;
        const tickOsc = ctx.createOscillator();
        const tickGain = ctx.createGain();
        tickOsc.type = "triangle";
        tickOsc.frequency.value = sharp ? 2400 : 1800;
        const peak = sharp ? 0.085 : 0.05;
        const tail = sharp ? 0.07 : 0.12;
        tickGain.gain.setValueAtTime(0.0, now);
        tickGain.gain.linearRampToValueAtTime(peak, now + 0.005);
        tickGain.gain.exponentialRampToValueAtTime(0.0001, now + tail);
        tickOsc.connect(tickGain);
        tickGain.connect(master);
        tickOsc.start(now);
        tickOsc.stop(now + tail + 0.02);
      };
      tickTimer = setInterval(tick, 3400);

      audioCtxRef.current = ctx;
      audioNodesRef.current = { master, tickTimer, tick, osc1, osc2, lfo };
      // Soft fade-in to 0.18 master
      const t0 = ctx.currentTime;
      master.gain.setValueAtTime(0, t0);
      master.gain.linearRampToValueAtTime(0.18, t0 + 1.4);
    } catch (e) {
      // Silently fail — ambient is a nice-to-have, never blocks UX
    }
  };
  const stopAmbient = () => {
    const ctx = audioCtxRef.current;
    const nodes = audioNodesRef.current;
    if (!ctx || !nodes) return;
    try {
      const t = ctx.currentTime;
      nodes.master.gain.cancelScheduledValues(t);
      nodes.master.gain.setValueAtTime(nodes.master.gain.value, t);
      nodes.master.gain.linearRampToValueAtTime(0.0, t + 0.6);
      clearInterval(nodes.tickTimer);
      setTimeout(() => {
        try {
          nodes.osc1.stop();
          nodes.osc2.stop();
          nodes.lfo.stop();
          ctx.close();
        } catch (e) {
          /* ignore */
        }
        audioCtxRef.current = null;
        audioNodesRef.current = null;
      }, 700);
    } catch (e) {
      /* ignore */
    }
  };
  useEffect(() => {
    return () => stopAmbient();
  }, []);
  useEffect(() => {
    if (audioOn) startAmbient();
    else stopAmbient();
  }, [audioOn]);

  // Intensify master gain when a cardinal is hovered.
  // §BROKEN-CLOCKWORK 2026-02-11 — when hovering East (Sara), morph
  // the mechanical tick from ~3.4s breath to a 1-second clockwork
  // metronome. This is the audible counterpart to the accelerated
  // tick-ring rotation below.
  useEffect(() => {
    const ctx = audioCtxRef.current;
    const nodes = audioNodesRef.current;
    if (!ctx || !nodes) return;
    const t = ctx.currentTime;
    const target = active ? 0.34 : 0.18;
    nodes.master.gain.cancelScheduledValues(t);
    nodes.master.gain.setValueAtTime(nodes.master.gain.value, t);
    nodes.master.gain.linearRampToValueAtTime(target, t + 0.8);

    // Re-wire the metronome cadence for East
    clearInterval(nodes.tickTimer);
    if (active === "east") {
      nodes.tickTimer = setInterval(() => nodes.tick(true), 1000);
    } else {
      nodes.tickTimer = setInterval(() => nodes.tick(false), 3400);
    }
  }, [active, audioOn]);

  // Soft reveal on first viewport entry.
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return undefined;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setRevealed(true);
          io.disconnect();
        }
      },
      { threshold: 0.18 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Slow continuous rotation of the outer tick ring — a subtle
  // "the compass is alive" signal. Pauses while hovered, EXCEPT
  // when East (Sara's wedge) is hovered — then it accelerates ~10×
  // and reverses direction, simulating the t.A.T.u. "30 minut"
  // Broken Clockwork countdown.
  const tickRingRef = useRef(null);
  useEffect(() => {
    const el = tickRingRef.current;
    if (!el) return undefined;
    let raf = 0;
    let last = performance.now();
    let deg = 0;
    const tick = (now) => {
      const dt = now - last;
      last = now;
      if (active === "east") {
        // accelerated reverse — clockwork countdown feel
        deg = (deg - dt * 0.036) % 360; // ~36°/s, anti-clockwise
      } else if (!active) {
        deg = (deg + dt * 0.003) % 360; // ~3°/s breathing rotation
      }
      el.setAttribute("transform", `rotate(${deg} ${CX} ${CY})`);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [active]);

  const activeCardinal = CARDINALS.find((c) => c.key === active) || null;

  return (
    <section
      id="hero-compass"
      data-testid="house-hero-compass"
      ref={containerRef}
      className="relative w-full bg-[#0b0a08] py-28 sm:py-36 overflow-hidden"
    >
      {/* Warm low-opacity glow behind the compass to anchor it on
          the graniit canvas without competing with the dial. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-[18%] h-[520px] opacity-[0.22]"
        style={{
          background:
            "radial-gradient(ellipse 48% 60% at 50% 50%, rgba(196,164,107,0.32) 0%, rgba(196,164,107,0.08) 45%, transparent 75%)",
        }}
      />

      <div className="relative z-10 max-w-[1120px] mx-auto px-6 sm:px-10">
        <div
          className={`text-center mb-14 sm:mb-20 transition-all duration-[1400ms] ease-out ${
            revealed ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          <p
            data-testid="compass-eyebrow"
            className="text-[11px] tracking-[0.42em] uppercase mb-6"
            style={{ color: BRASS, fontFamily: SERIF }}
          >
            — The Compass
          </p>
          <h2
            data-testid="compass-headline"
            className="text-[32px] sm:text-[44px] lg:text-[52px] leading-[1.12] text-[#f0eadd] font-light max-w-[820px] mx-auto tracking-[-0.012em]"
            style={{ fontFamily: SERIF }}
          >
            Four cardinal points.<br />
            <span className="italic text-[#d4b67d]">One way out.</span>
          </h2>
          <p
            data-testid="compass-subhead"
            className="mt-7 text-[14.5px] sm:text-[15.5px] italic text-[#a59f93] max-w-[560px] mx-auto leading-[1.85] font-light"
            style={{ fontFamily: SERIF }}
          >
            Each heading is a curator. Each curator holds a room.
            Choose the direction the moment is asking of you.
          </p>

          {/* §SOVEREIGN-CODE 2026-02-11 — The three-law manifest, sourced
              from the Russian carceral survival mantra and rebuilt for
              Matrix Aurin's architectural register. Each line ties to
              one cardinal direction and intensifies when the matching
              wedge is hovered. This is the ideological spine of the
              platform — placed before the Compass so the visitor
              passes through the laws before reaching the doors. */}
          <SovereignCode active={active} />

          {/* §SOVEREIGN-COUNTER 2026-02-11 — Anonymous live telemetry
              strip beneath the manifest. Removes the isolation of the
              waitlist without exposing any individual identity. */}
          <SovereignCounter />
        </div>

        <div
          className={`relative mx-auto max-w-[640px] aspect-square transition-all duration-[2200ms] ease-out ${
            revealed ? "opacity-100 scale-100" : "opacity-0 scale-[0.96]"
          }`}
          data-testid="compass-dial-wrap"
        >
          <svg
            viewBox="0 0 600 600"
            className="w-full h-full"
            role="img"
            aria-label="Aurin navigation compass"
            data-testid="compass-svg"
          >
            <defs>
              <radialGradient id="compass-disc" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#1a1612" stopOpacity="0.92" />
                <stop offset="65%" stopColor="#0e0c0a" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#0b0a08" stopOpacity="0.95" />
              </radialGradient>
              <linearGradient id="brass-line" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#8a6f3a" />
                <stop offset="50%" stopColor="#d4b67d" />
                <stop offset="100%" stopColor="#8a6f3a" />
              </linearGradient>
              <filter id="brass-glow" x="-30%" y="-30%" width="160%" height="160%">
                <feGaussianBlur stdDeviation="4" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Inner disc */}
            <circle cx={CX} cy={CY} r={R_OUTER} fill="url(#compass-disc)" />
            {/* Outer ring */}
            <circle
              cx={CX}
              cy={CY}
              r={R_OUTER}
              fill="none"
              stroke="url(#brass-line)"
              strokeWidth="1.2"
              opacity="0.9"
            />
            {/* Inner ring */}
            <circle
              cx={CX}
              cy={CY}
              r={R_INNER}
              fill="none"
              stroke={BRASS}
              strokeOpacity="0.35"
              strokeWidth="0.6"
            />
            {/* Hairline middle ring (subtle navigation guide) */}
            <circle
              cx={CX}
              cy={CY}
              r={140}
              fill="none"
              stroke={BRASS}
              strokeOpacity="0.18"
              strokeWidth="0.5"
              strokeDasharray="2 4"
            />

            {/* Rotating tick ring — animated subtly */}
            <g ref={tickRingRef}>
              {TICKS.map((deg) => {
                const isMajor = deg % 90 === 0;
                const inner = polar(isMajor ? R_TICK_INNER - 8 : R_TICK_INNER, deg);
                const outer = polar(R_TICK_OUTER, deg);
                return (
                  <line
                    key={deg}
                    x1={inner.x}
                    y1={inner.y}
                    x2={outer.x}
                    y2={outer.y}
                    stroke={BRASS}
                    strokeOpacity={isMajor ? 0.9 : 0.45}
                    strokeWidth={isMajor ? 1.4 : 0.6}
                  />
                );
              })}
            </g>

            {/* Cross arms (the four cardinal lines) */}
            {CARDINALS.map((c) => {
              const isActive = active === c.key;
              const outer = polar(R_OUTER - 6, c.angle);
              const inner = polar(60, c.angle);
              return (
                <line
                  key={`arm-${c.key}`}
                  x1={inner.x}
                  y1={inner.y}
                  x2={outer.x}
                  y2={outer.y}
                  stroke={isActive ? BRASS_BRIGHT : BRASS}
                  strokeOpacity={isActive ? 1 : 0.55}
                  strokeWidth={isActive ? 1.6 : 1}
                  filter={isActive ? "url(#brass-glow)" : undefined}
                  style={{ transition: "all 600ms ease" }}
                />
              );
            })}

            {/* Central emblem */}
            <g data-testid="compass-emblem">
              <circle cx={CX} cy={CY} r={42} fill="#0b0a08" stroke={BRASS} strokeOpacity="0.7" strokeWidth="1" />
              <circle cx={CX} cy={CY} r={36} fill="none" stroke={BRASS} strokeOpacity="0.35" strokeWidth="0.5" />
              <text
                x={CX}
                y={CY - 2}
                textAnchor="middle"
                fill={CREAM}
                fontFamily={SERIF}
                fontSize="11"
                letterSpacing="3"
                fontStyle="italic"
              >
                MATRIX
              </text>
              <text
                x={CX}
                y={CY + 12}
                textAnchor="middle"
                fill={BRASS_BRIGHT}
                fontFamily={SERIF}
                fontSize="9"
                letterSpacing="2.5"
              >
                AURIN
              </text>
            </g>

            {/* Compass needle pointer (decorative, fixed at North) */}
            <g opacity="0.85">
              <polygon
                points={`${CX},${CY - 72} ${CX - 6},${CY} ${CX + 6},${CY}`}
                fill={BRASS_BRIGHT}
                opacity="0.85"
              />
              <polygon
                points={`${CX},${CY + 72} ${CX - 4},${CY} ${CX + 4},${CY}`}
                fill={BRASS}
                opacity="0.45"
              />
            </g>

            {/* Cardinal labels + curator + room + degree codes */}
            {CARDINALS.map((c) => {
              const labelPt = polar(R_LABEL, c.angle);
              const degreePt = polar(R_DEGREE, c.angle);
              const block = textBlockFor(c.key);
              const curatorPt = block.curator;
              const roomPt = block.room;
              const isActive = active === c.key;

              // Hit zone — a generous wedge so the arm + labels are clickable
              const wedgeOuter = R_OUTER - 4;
              const wedgeInner = 56;
              const halfAngle = 22; // ±22° hit zone per cardinal
              const a1 = (c.angle - halfAngle) * (Math.PI / 180);
              const a2 = (c.angle + halfAngle) * (Math.PI / 180);
              const p1 = { x: CX + wedgeInner * Math.cos(a1), y: CY + wedgeInner * Math.sin(a1) };
              const p2 = { x: CX + wedgeOuter * Math.cos(a1), y: CY + wedgeOuter * Math.sin(a1) };
              const p3 = { x: CX + wedgeOuter * Math.cos(a2), y: CY + wedgeOuter * Math.sin(a2) };
              const p4 = { x: CX + wedgeInner * Math.cos(a2), y: CY + wedgeInner * Math.sin(a2) };
              const hitPath = `M ${p1.x} ${p1.y} L ${p2.x} ${p2.y} A ${wedgeOuter} ${wedgeOuter} 0 0 1 ${p3.x} ${p3.y} L ${p4.x} ${p4.y} A ${wedgeInner} ${wedgeInner} 0 0 0 ${p1.x} ${p1.y} Z`;

              return (
                <g
                  key={c.key}
                  data-testid={c.testid}
                  onMouseEnter={() => setActive(c.key)}
                  onMouseLeave={() => setActive(null)}
                  onFocus={() => setActive(c.key)}
                  onBlur={() => setActive(null)}
                  onClick={() => {
                    // §GA4 — emit a named event so the founder can see
                    // which heading cold visitors actually click.
                    trackEvent("compass_arm_click", {
                      cardinal: c.key,
                      degrees: c.degrees,
                      curator: c.curator,
                      slug: c.slug,
                    });
                    setOpenSlug(c.slug);
                  }}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      trackEvent("compass_arm_click", {
                        cardinal: c.key,
                        degrees: c.degrees,
                        curator: c.curator,
                        slug: c.slug,
                        via: "keyboard",
                      });
                      setOpenSlug(c.slug);
                    }
                  }}
                  style={{ cursor: "pointer", outline: "none" }}
                >
                  {/* Hit wedge (invisible but generous) */}
                  <path
                    d={hitPath}
                    fill="rgba(0,0,0,0.001)"
                    style={{ pointerEvents: "all" }}
                  />

                  {/* Cardinal letter — large */}
                  <text
                    x={labelPt.x}
                    y={labelPt.y + 6}
                    textAnchor="middle"
                    fill={isActive ? CREAM : BRASS}
                    fontFamily={SERIF}
                    fontSize={isActive ? 28 : 26}
                    fontStyle="italic"
                    style={{ transition: "all 500ms ease" }}
                  >
                    {c.label}
                  </text>

                  {/* Curator name — italic, just above center */}
                  <text
                    x={curatorPt.x}
                    y={curatorPt.y + 4}
                    textAnchor="middle"
                    fill={isActive ? BRASS_BRIGHT : "#a59f93"}
                    fontFamily={SERIF}
                    fontSize="13"
                    fontStyle="italic"
                    style={{ transition: "all 500ms ease" }}
                  >
                    {c.curator}
                  </text>

                  {/* Room name — small caps, beneath curator */}
                  <text
                    x={roomPt.x}
                    y={roomPt.y + 4}
                    textAnchor="middle"
                    fill={isActive ? CREAM : "#7a7468"}
                    fontFamily={SERIF}
                    fontSize="8.5"
                    letterSpacing="2.4"
                    style={{ transition: "all 500ms ease" }}
                  >
                    {c.room.toUpperCase()}
                  </text>

                  {/* Degree code on the outer rim — a small filled
                      plate so the number sits cleanly on the dial
                      regardless of the rotating tick ring beneath. */}
                  <rect
                    x={degreePt.x - 28}
                    y={degreePt.y - 12}
                    width="56"
                    height="24"
                    fill="#0b0a08"
                    stroke={BRASS}
                    strokeOpacity={isActive ? 0.85 : 0.5}
                    strokeWidth="0.7"
                    style={{ transition: "all 500ms ease" }}
                  />
                  <text
                    x={degreePt.x}
                    y={degreePt.y + 5}
                    textAnchor="middle"
                    fill={isActive ? BRASS_BRIGHT : CREAM}
                    fontFamily={SERIF}
                    fontSize="15"
                    fontWeight="500"
                    fontStyle="italic"
                    style={{ transition: "all 500ms ease", opacity: isActive ? 1 : 0.95 }}
                  >
                    {c.degrees}°
                  </text>
                </g>
              );
            })}
          </svg>

          {/* Whisper line — changes with hover */}
          <p
            data-testid="compass-whisper"
            className="mt-10 sm:mt-12 text-center italic text-[#bcb4a3] font-light text-[15px] sm:text-[16px] min-h-[1.8em] transition-opacity duration-500"
            style={{ fontFamily: SERIF }}
          >
            {activeCardinal
              ? activeCardinal.whisper
              : "Hover a heading. The Compass listens."}
          </p>

          <p
            className="mt-3 text-center text-[10.5px] tracking-[0.36em] uppercase text-[#7a7468]"
            data-testid="compass-instructions"
          >
            Click a heading to reserve your place
          </p>

          {/* §AMBIENT 2026-02-11 — Sovereign audio toggle. Off by
              default; one calm tap activates the "Screen-Down,
              Ears-Open" sonic layer. */}
          <div className="mt-8 flex items-center justify-center">
            <button
              type="button"
              onClick={() => setAudioOn((v) => !v)}
              data-testid="compass-audio-toggle"
              aria-pressed={audioOn}
              className="inline-flex items-center gap-3 px-5 py-2.5 border border-[rgba(196,164,107,0.4)] text-[10.5px] tracking-[0.36em] uppercase text-[#c4a46b] hover:bg-[rgba(196,164,107,0.08)] hover:border-[rgba(196,164,107,0.7)] transition-colors duration-500"
            >
              <span
                aria-hidden="true"
                className={`inline-block w-1.5 h-1.5 rounded-full transition-colors duration-500 ${
                  audioOn ? "bg-[#d4b67d]" : "bg-[#7a7468]"
                }`}
              />
              {audioOn ? "Sonic layer · on" : "Sonic layer · off"}
            </button>
          </div>
        </div>
      </div>

      {/* Waitlist dialog — opens when a cardinal is clicked.
          Reuses the existing `WaitlistInline` (POST /waitlist/join). */}
      {openSlug ? (
        <CompassWaitlistDialog
          openSlug={openSlug}
          onClose={() => setOpenSlug(null)}
        />
      ) : null}
    </section>
  );
}

function CompassWaitlistDialog({ openSlug, onClose }) {
  const cardinal = CARDINALS.find((c) => c.slug === openSlug) || null;
  const dialogRef = useRef(null);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    // Lock body scroll while open
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  if (!cardinal) return null;

  return (
    <div
      data-testid="compass-waitlist-dialog"
      className="fixed inset-0 z-[70] flex items-center justify-center px-4"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-[rgba(8,7,6,0.82)] backdrop-blur-sm" />
      <div
        ref={dialogRef}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-[520px] bg-[#0e0c0a] border border-[rgba(196,164,107,0.4)] p-10 sm:p-12"
        data-testid={`compass-waitlist-${cardinal.key}`}
      >
        <button
          onClick={onClose}
          aria-label="Close"
          data-testid="compass-waitlist-close"
          className="absolute top-4 right-4 text-[#7a7468] hover:text-[#e8e1d5] text-[11px] tracking-[0.32em] uppercase transition-colors"
        >
          Close
        </button>
        <p
          className="text-[10.5px] tracking-[0.42em] uppercase mb-5"
          style={{ color: BRASS, fontFamily: SERIF }}
        >
          {cardinal.degrees}° · {cardinal.label} · {cardinal.curator}
        </p>
        {/* §BROKEN-CLOCKWORK 2026-02-11 — East/Sara carries a custom
            high-status headline that frames the transactional-promise
            trauma directly. Other cardinals show the standard room
            name as the headline. */}
        {cardinal.modalHeadline ? (
          <p
            className="text-[12px] tracking-[0.28em] uppercase text-[#d4b67d] mb-3"
            style={{ fontFamily: SERIF }}
            data-testid={`compass-modal-headline-${cardinal.key}`}
          >
            {cardinal.modalHeadline}
          </p>
        ) : null}
        <h3
          className="text-[26px] sm:text-[30px] leading-[1.16] text-[#f0eadd] font-light mb-4"
          style={{ fontFamily: SERIF }}
        >
          {cardinal.room}
        </h3>
        <p
          className="text-[14px] sm:text-[15px] italic text-[#bcb4a3] leading-[1.8] font-light mb-7"
          style={{ fontFamily: SERIF }}
        >
          {cardinal.whisper}
        </p>
        <p
          className="text-[13px] leading-[1.85] text-[#a59f93] font-light mb-2"
          data-testid={`compass-modal-body-${cardinal.key}`}
        >
          {cardinal.modalBody || (
            "The doors of this heading open this season. Leave your " +
            "address and we will send a single quiet note when it is " +
            "your time."
          )}
        </p>
        <WaitlistInline slug={cardinal.slug} tierLabel={cardinal.room} />
        <p
          className="mt-7 text-[10.5px] tracking-[0.28em] uppercase text-[#7a7468]"
        >
          No tracking. No follow-ups. One note, when the door opens.
        </p>
      </div>
    </div>
  );
}


/**
 * SovereignCode — the three-law manifest displayed above the Compass.
 *
 * §SOVEREIGN-CODE 2026-02-11 — Founder directive.
 *   The mantra "Не верь. Не бойся. Не проси." is a public-domain
 *   survival koan from Russian carceral culture, used by writers
 *   from Shalamov to Solzhenitsyn. Matrix Aurin re-grounds it for
 *   high-net-worth founder-parents as the three architectural laws
 *   of sovereign presence at home.
 *
 *   Visual contract:
 *     - Three short laws in our biomechanical register.
 *     - Each line maps to one cardinal direction:
 *         · "Do not trust empty words"     ↔  W · Alistair · Course
 *         · "Do not fear emotional chaos"  ↔  N · Kaelan   · Body
 *         · "Do not force them to beg"     ↔  E · Sara     · Parents
 *     - When the user hovers the matching wedge on the SVG dial,
 *       the corresponding line lifts: brass underline appears, the
 *       text colour shifts from cream-dim to bright brass, and a
 *       faint glitch shimmer plays for ~600ms. Other lines dim
 *       slightly so the eye lands on the active law.
 *     - Hover on South (Grace / Clarity) does NOT highlight a law;
 *       it dims all three equally — Grace is the room where the
 *       laws no longer apply, the room where the mask drops.
 */
function SovereignCode({ active }) {
  const laws = [
    {
      key: "west",
      en: "Do not trust empty words.",
      sub: "The system updates on delivered signal, not declared intent.",
      ru: "Не верь",
      cardinal: "W · 270°",
    },
    {
      key: "north",
      en: "Do not fear the chaos.",
      sub: "Your nervous system is the firewall the room is waiting for.",
      ru: "Не бойся",
      cardinal: "N · 360°",
    },
    {
      key: "east",
      en: "Do not force them to beg.",
      sub: "Bandwidth and attention are infrastructure, never currency.",
      ru: "Не проси",
      cardinal: "E · 90°",
    },
  ];

  const isSouth = active === "south";
  return (
    <div
      data-testid="sovereign-code-manifest"
      className="mt-12 sm:mt-14 mx-auto max-w-[760px] border border-[rgba(196,164,107,0.22)] bg-[rgba(15,12,10,0.6)] backdrop-blur-[2px] px-6 sm:px-10 py-8"
    >
      <p
        className="text-[10px] tracking-[0.42em] uppercase text-[#c4a46b] mb-5"
        style={{ fontFamily: SERIF }}
        data-testid="sovereign-code-eyebrow"
      >
        [ Protocol · The Sovereign Code ]
      </p>
      <ul className="space-y-4">
        {laws.map((law) => {
          const isActive = active === law.key;
          const dimmed = !!active && !isActive;
          return (
            <li
              key={law.key}
              data-testid={`sovereign-law-${law.key}`}
              className="grid grid-cols-[auto_1fr] gap-x-5 sm:gap-x-7 items-baseline"
              style={{
                transition: "opacity 600ms ease, transform 600ms ease",
                opacity: dimmed && !isSouth ? 0.32 : isSouth ? 0.55 : 1,
                transform: isActive ? "translateX(4px)" : "none",
              }}
            >
              <span
                className="text-[10px] tracking-[0.32em] uppercase whitespace-nowrap"
                style={{
                  color: isActive ? "#d4b67d" : "#7a7468",
                  fontFamily: SERIF,
                  transition: "color 500ms ease",
                }}
              >
                {law.cardinal}
              </span>
              <div>
                <p
                  className="text-[19px] sm:text-[22px] leading-[1.32] font-light"
                  style={{
                    color: isActive ? "#f0eadd" : "#bcb4a3",
                    fontFamily: SERIF,
                    transition: "color 500ms ease",
                    textShadow: isActive
                      ? "0 0 18px rgba(196,164,107,0.25)"
                      : "none",
                  }}
                >
                  {law.en}
                  <span
                    className="ml-3 text-[12px] tracking-[0.22em] uppercase"
                    style={{
                      color: isActive ? "#d4b67d" : "#7a7468",
                      transition: "color 500ms ease",
                    }}
                  >
                    · {law.ru}
                  </span>
                </p>
                <p
                  className="mt-1.5 text-[13px] sm:text-[13.5px] italic font-light leading-[1.7]"
                  style={{
                    color: isActive ? "#a59f93" : "#7a7468",
                    fontFamily: SERIF,
                    transition: "color 500ms ease",
                  }}
                >
                  {law.sub}
                </p>
                {/* Brass underline that appears only on the active law. */}
                <div
                  aria-hidden="true"
                  className="mt-3 h-[1px] bg-[#c4a46b]"
                  style={{
                    transformOrigin: "left",
                    transform: isActive ? "scaleX(1)" : "scaleX(0)",
                    transition: "transform 700ms cubic-bezier(0.4,0,0.2,1)",
                    opacity: isActive ? 0.8 : 0,
                  }}
                />
              </div>
            </li>
          );
        })}
      </ul>
      <p
        className="mt-6 pt-5 border-t border-[rgba(196,164,107,0.12)] text-[11px] tracking-[0.28em] uppercase text-[#7a7468]"
        data-testid="sovereign-code-coda"
      >
        — Three laws. Four headings. One way home.
      </p>
    </div>
  );
}
