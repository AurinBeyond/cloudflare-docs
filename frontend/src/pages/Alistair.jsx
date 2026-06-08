/**
 * Alistair.jsx — § ALISTAIR HOMEPAGE v2 2026-02
 *
 * Founder spec (Anna, English mockup approved 2026-02-08): Alistair's
 * /course-room home page is rebuilt around a SOLID DARK left sidebar
 * (matching the Sanctuary brass-on-dark system) with the painted study
 * scene living in the centre. Same principle as Polarstar and Grace:
 * every room is a "business card" — within ten seconds the visitor
 * sees where they are, who guides them, and what to expect.
 *
 * Layout (desktop):
 *   ┌──────────────────────────────────────────────────────────────┐
 *   │ DARK SIDEBAR    │   CENTRE (painted study)    │  HOW WE      │
 *   │ • Star          │   "Alistair                 │   EXPLORE    │
 *   │ • ALISTAIR      │    Laboratory of Life"      │  4 steps     │
 *   │   Lab of Life   │   A place for deep inquiry  │   N · I ·    │
 *   │ EXPLORE         │                             │   E · I      │
 *   │ • Home (active) │                             │              │
 *   │ • Explore       │   YOUR PATH OF EXPLORATION  │  ALISTAIR    │
 *   │ • Read          │   [Money] [Old] [Body] [..] │  bio + CTA   │
 *   │ • Experiments   │                             │              │
 *   │ • Notes         │                             │              │
 *   │ • Library       │                             │              │
 *   │ ✦ Alistair quote│                             │              │
 *   └──────────────────────────────────────────────────────────────┘
 *
 * No new images are generated in this sprint. Lab thumbnail slots use
 * a CSS-painted gradient + glyph keyed to each lab's accent colour.
 * Founder will deliver custom thumbnails in the next sprint and they
 * will drop into the same slot shape unchanged.
 */
import { Link } from "react-router-dom";
import {
  Home as HomeIcon,
  Compass,
  BookOpen,
  FlaskConical,
  StickyNote,
  Library as LibraryIcon,
  Eye,
  HelpCircle,
  RefreshCw,
  ArrowRight,
} from "lucide-react";
import { LABS, HOME_PATH_OF_EXPLORATION } from "@/data/alistairLabs";

const BG_IMAGE = "/assets/alistair/alistair-light-bg.png";
const SERIF = '"Cormorant Garamond", "EB Garamond", Georgia, serif';

const SIDEBAR_BG = "#0c0f17";
const SIDEBAR_BG_SOFT = "#141927";
const BRASS = "#c4a46b";
const BRASS_BRIGHT = "#d4b67d";
const CREAM = "#f0eadd";
const MUTED = "#8b8576";

const SIDEBAR = [
  { id: "home",        label: "Home",        icon: HomeIcon,     href: "/course-room",             active: true },
  { id: "explore",     label: "Explore",     icon: Compass,      href: "/course-room/explore" },
  { id: "read",        label: "Read",        icon: BookOpen,     href: "/course-room/read" },
  { id: "experiments", label: "Experiments", icon: FlaskConical, href: "/course-room/experiments" },
  { id: "notes",       label: "Notes",       icon: StickyNote,   href: "/course-room/notes" },
  { id: "library",     label: "Library",     icon: LibraryIcon,  href: "/course-room/library" },
];

const HOW_STEPS = [
  { n: 1, label: "NOTICE",     icon: Eye,         text: "We bring attention to what is true right now. Without judgment. This is where clarity begins." },
  { n: 2, label: "INQUIRE",    icon: HelpCircle,  text: "We ask better questions. Not to find quick answers, but to open deeper understanding." },
  { n: 3, label: "EXPERIMENT", icon: FlaskConical,text: "We try, we observe, we learn in real life. Small experiments, real insights." },
  { n: 4, label: "INTEGRATE",  icon: RefreshCw,   text: "We embody what we learn and let it reshape our lives with meaning and purpose." },
];

export default function Alistair() {
  return (
    <div
      data-testid="page-alistair"
      className="relative min-h-screen w-full overflow-hidden"
      style={{ backgroundColor: SIDEBAR_BG, color: CREAM, fontFamily: SERIF }}
    >
      <div className="relative z-[2] grid min-h-screen grid-cols-1 lg:[grid-template-columns:240px_1fr_320px]">
        <Sidebar />
        <CentreColumn />
        <RightColumn />
      </div>

      <BottomQuote />
    </div>
  );
}

/* ───────────────────────── SIDEBAR (dark) ───────────────────────── */

function Sidebar() {
  return (
    <aside
      data-testid="alistair-sidebar"
      className="relative flex flex-col px-6 py-9 border-r"
      style={{
        background: SIDEBAR_BG,
        borderColor: "rgba(196,164,107,0.12)",
        minHeight: "100vh",
      }}
    >
      <StarMonogram />

      <div className="mt-6 mb-7" aria-hidden="true"
        style={{ height: 1, background: "linear-gradient(90deg, transparent, rgba(196,164,107,0.28), transparent)" }} />

      <p className="text-[10.5px] tracking-[0.32em] uppercase mb-4" style={{ color: BRASS }}>
        Explore
      </p>

      <nav className="space-y-1.5">
        {SIDEBAR.map((it) => {
          const Icon = it.icon;
          return (
            <Link
              key={it.id}
              to={it.href}
              data-testid={`alistair-sidebar-${it.id}`}
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-md text-[14px] transition-colors no-underline"
              style={{
                color: it.active ? CREAM : MUTED,
                background: it.active ? "rgba(196,164,107,0.12)" : "transparent",
                border: it.active ? "1px solid rgba(196,164,107,0.32)" : "1px solid transparent",
                textDecoration: "none",
                fontFamily: SERIF,
              }}
            >
              <Icon size={15} strokeWidth={1.5} />
              <span>{it.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto pt-10">
        <div className="px-1 py-4 border-t" style={{ borderColor: "rgba(196,164,107,0.16)" }}>
          <span aria-hidden="true" style={{ color: BRASS, fontSize: 16, fontFamily: SERIF }}>“</span>
          <p className="mt-1 text-[12.5px] italic leading-[1.7]" style={{ color: "#a89e8b", fontFamily: SERIF }}>
            We do not come here<br />to be taught.<br />
            We come to remember<br />what we already know.
          </p>
          <p className="mt-3 text-[10.5px] tracking-[0.22em] uppercase" style={{ color: BRASS }}>
            — Alistair
          </p>
        </div>
      </div>
    </aside>
  );
}

function StarMonogram() {
  return (
    <Link to="/course-room" data-testid="alistair-monogram" className="block no-underline" style={{ textDecoration: "none" }}>
      <div className="flex flex-col items-start gap-3">
        <div className="relative w-[58px] h-[58px] flex items-center justify-center"
          style={{
            background: "radial-gradient(circle at 50% 50%, rgba(196,164,107,0.18), rgba(12,15,23,0))",
          }}
          aria-hidden="true"
        >
          <svg viewBox="0 0 100 100" width="58" height="58" fill="none">
            <g stroke={BRASS} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M50 6 L54 46 L94 50 L54 54 L50 94 L46 54 L6 50 L46 46 Z" />
              <path d="M22 22 L48 48 M78 22 L52 48 M78 78 L52 52 M22 78 L48 52" opacity="0.55" />
              <circle cx="50" cy="50" r="36" opacity="0.18" />
            </g>
            <text x="50" y="58" textAnchor="middle"
              style={{ fill: BRASS_BRIGHT, fontFamily: SERIF, fontSize: "28px", fontWeight: 400 }}>
              A
            </text>
          </svg>
        </div>
        <div>
          <p className="text-[20px] leading-tight" style={{ color: CREAM, fontFamily: SERIF, letterSpacing: "0.08em" }}>
            ALISTAIR
          </p>
          <p className="mt-1 text-[9.5px] tracking-[0.32em] uppercase" style={{ color: BRASS }}>
            Laboratory of Life
          </p>
        </div>
      </div>
    </Link>
  );
}

/* ───────────────────────── CENTRE COLUMN ───────────────────────── */

function CentreColumn() {
  return (
    <section data-testid="alistair-centre" className="relative">
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{
          backgroundImage: `url("${BG_IMAGE}")`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 85% 85% at 50% 45%, transparent 35%, rgba(12,15,23,0.55) 100%)",
        }}
      />
      <div
        aria-hidden="true"
        className="absolute inset-y-0 left-0 w-[60px] pointer-events-none"
        style={{ background: "linear-gradient(90deg, rgba(12,15,23,0.85), transparent)" }}
      />
      <div
        aria-hidden="true"
        className="absolute inset-y-0 right-0 w-[60px] pointer-events-none"
        style={{ background: "linear-gradient(270deg, rgba(12,15,23,0.85), transparent)" }}
      />

      <div className="relative z-[2] px-8 lg:px-12 pt-12 lg:pt-14 pb-14">
        <HeroTitle />
        <PathOfExploration />
      </div>
    </section>
  );
}

function HeroTitle() {
  return (
    <header data-testid="alistair-hero" className="max-w-[600px]">
      <p
        className="text-[26px] leading-none mb-2"
        style={{ color: CREAM, fontFamily: SERIF, letterSpacing: "0.005em" }}
      >
        Alistair
      </p>
      <h1
        data-testid="alistair-hero-title"
        className="font-light leading-[1.04] mb-5"
        style={{
          color: CREAM,
          fontFamily: SERIF,
          fontSize: "clamp(2.6rem, 5.2vw, 4.6rem)",
          letterSpacing: "-0.005em",
        }}
      >
        Laboratory of Life
      </h1>
      <p
        data-testid="alistair-hero-subtitle"
        className="text-[16.5px] leading-[1.7] italic max-w-[440px]"
        style={{ color: "#cfc7b3", fontFamily: SERIF }}
      >
        A place for deep inquiry, living experiments<br />
        and meaningful transformation.
      </p>
    </header>
  );
}

/* ─────────────── YOUR PATH OF EXPLORATION (4 cards) ─────────────── */

function PathOfExploration() {
  const labs = HOME_PATH_OF_EXPLORATION.map((slug) => LABS[slug]).filter(Boolean);
  return (
    <section data-testid="alistair-path-of-exploration" className="mt-12 lg:mt-16">
      <p className="text-[11px] tracking-[0.34em] uppercase mb-6" style={{ color: BRASS }}>
        Your Path of Exploration
      </p>
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {labs.map((lab) => (
          <LabCard key={lab.slug} lab={lab} />
        ))}
      </div>
    </section>
  );
}

function LabCard({ lab }) {
  const isOpen = lab.status === "open";
  const href = isOpen
    ? `/course-room/lab/${lab.slug}`
    : "/course-room/laboratories";
  return (
    <Link
      to={href}
      data-testid={`alistair-path-card-${lab.slug}`}
      className="group relative flex flex-col overflow-hidden rounded-md transition-transform hover:-translate-y-px no-underline"
      style={{
        background: SIDEBAR_BG_SOFT,
        border: "1px solid rgba(196,164,107,0.22)",
        textDecoration: "none",
      }}
    >
      <div
        className="relative h-[150px] flex items-center justify-center"
        style={{
          background: `radial-gradient(ellipse 80% 70% at 50% 45%, ${lab.accent}55, ${SIDEBAR_BG} 75%)`,
        }}
      >
        <span aria-hidden="true" className="text-[42px]" style={{ filter: `drop-shadow(0 4px 14px ${lab.accent}aa)` }}>
          {lab.emoji}
        </span>
        {!isOpen && (
          <span
            className="absolute top-2 right-2 text-[9px] tracking-[0.28em] uppercase px-2 py-1"
            style={{
              background: "rgba(12,15,23,0.72)",
              border: "1px solid rgba(196,164,107,0.32)",
              color: BRASS,
            }}
          >
            Soon
          </span>
        )}
      </div>

      <div className="p-5 flex flex-col grow">
        <p
          className="text-[12.5px] tracking-[0.26em] uppercase mb-2"
          style={{ color: BRASS_BRIGHT, fontFamily: SERIF }}
        >
          {lab.name}
        </p>
        <p
          className="text-[13.5px] leading-[1.6] mb-4 grow"
          style={{ color: "#bcb4a3", fontFamily: SERIF }}
        >
          {lab.short}
        </p>
        <span
          className="inline-flex items-center gap-2 text-[11px] tracking-[0.22em] uppercase mt-auto pt-3 border-t"
          style={{ color: BRASS, borderColor: "rgba(196,164,107,0.18)" }}
        >
          Continue exploring <ArrowRight size={12} />
        </span>
      </div>
    </Link>
  );
}

/* ───────────────────────── RIGHT COLUMN ───────────────────────── */

function RightColumn() {
  return (
    <aside data-testid="alistair-right" className="relative px-6 py-9 lg:py-12 lg:pr-9"
      style={{ background: SIDEBAR_BG, borderLeft: "1px solid rgba(196,164,107,0.12)" }}>
      <HowWeExplore />
      <AlistairBio />
    </aside>
  );
}

function HowWeExplore() {
  return (
    <div data-testid="alistair-how-we-explore" className="rounded-lg p-5"
      style={{ background: SIDEBAR_BG_SOFT, border: "1px solid rgba(196,164,107,0.18)" }}>
      <p className="text-[10.5px] tracking-[0.32em] uppercase mb-5" style={{ color: BRASS }}>
        How We Explore
      </p>
      <ol className="space-y-5">
        {HOW_STEPS.map((s) => {
          const Icon = s.icon;
          return (
            <li key={s.n} data-testid={`alistair-step-${s.n}`} className="flex gap-3">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 rounded-full flex items-center justify-center"
                  style={{
                    background: "rgba(196,164,107,0.10)",
                    border: "1px solid rgba(196,164,107,0.42)",
                    color: BRASS_BRIGHT,
                  }}>
                  <Icon size={14} strokeWidth={1.6} />
                </div>
                <p className="text-[10px] tracking-[0.22em] uppercase text-center mt-1.5"
                   style={{ color: BRASS }}>{s.n}</p>
              </div>
              <div>
                <p className="text-[11.5px] tracking-[0.22em] uppercase font-medium mb-1.5"
                   style={{ color: CREAM, fontFamily: SERIF }}>
                  {s.label}
                </p>
                <p className="text-[12.5px] leading-[1.65]" style={{ color: "#a89e8b", fontFamily: SERIF }}>
                  {s.text}
                </p>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

function AlistairBio() {
  return (
    <div data-testid="alistair-bio" className="mt-7 rounded-lg p-5"
      style={{ background: SIDEBAR_BG_SOFT, border: "1px solid rgba(196,164,107,0.18)" }}>
      <div className="flex items-start gap-3.5">
        <div className="flex-shrink-0 w-14 h-14 rounded-full overflow-hidden"
          style={{
            border: `1.5px solid ${BRASS}`,
            background: SIDEBAR_BG,
          }}
          aria-hidden="true">
          <img src="/avatars/alistair.png" alt="" className="w-full h-full object-cover"
            onError={(e) => { e.currentTarget.style.display = "none"; }} />
        </div>
        <div>
          <p className="text-[20px] leading-tight" style={{ color: CREAM, fontFamily: SERIF }}>
            Alistair
          </p>
          <p className="text-[11.5px] tracking-[0.22em] uppercase mt-1" style={{ color: BRASS }}>
            Guide. Explorer. Questioner.
          </p>
        </div>
      </div>
      <p className="mt-4 text-[13px] leading-[1.7]" style={{ color: "#bcb4a3", fontFamily: SERIF }}>
        I walk beside you as you rediscover what matters and create a life aligned with your deepest truth.
      </p>
      <Link
        to="/course-room/room"
        data-testid="alistair-meet-cta"
        className="mt-5 inline-flex items-center gap-2 text-[11px] tracking-[0.28em] uppercase no-underline transition-colors"
        style={{ color: BRASS_BRIGHT, textDecoration: "none" }}
      >
        Let&apos;s explore together <ArrowRight size={12} />
      </Link>
    </div>
  );
}

/* ───────────────────────── BOTTOM QUOTE ───────────────────────── */

function BottomQuote() {
  return (
    <div
      data-testid="alistair-bottom-quote"
      className="relative z-[3] py-7 px-6 text-center border-t"
      style={{
        background: SIDEBAR_BG,
        borderColor: "rgba(196,164,107,0.12)",
      }}
    >
      <p
        className="text-[15px] sm:text-[17px] italic"
        style={{ color: "#cfc7b3", fontFamily: SERIF, letterSpacing: "0.005em" }}
      >
        <span aria-hidden="true" style={{ color: BRASS, marginRight: 12 }}>✦</span>
        &ldquo;Life is not something to be solved, but a mystery to be lived.&rdquo;
        <span aria-hidden="true" style={{ color: BRASS, marginLeft: 12 }}>✦</span>
      </p>
    </div>
  );
}
