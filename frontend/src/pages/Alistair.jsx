/**
 * Alistair.jsx — § ALISTAIR HUB v4 (11 LABORATORIES) 2026-02-10
 *
 * Founder mockup approved 2026-02-10: the Alistair hub MUST surface
 * all 11 laboratories directly on /course-room, not 4. The painted
 * single-image hub asset only shows 4 cards, so this hub composes
 * three layers:
 *
 *   1. Dark left sidebar (CSS) — ALISTAIR mark + 6 nav items + quote
 *   2. Centre column — scenic hero painted backdrop + heading + the
 *      11 lab cards (LAB_ORDER) painted-thumbnail + cream body
 *   3. Dark right column — HOW WE EXPLORE 4 steps + Alistair bio +
 *      "Let's explore together" CTA → /course-room/room
 *
 * Each of the 11 cards routes to /course-room/lab/{slug} where the
 * existing Painted Map Pattern LabDashboard renders the lab's own
 * painted image with its own internal hotspots.
 *
 * Source of truth: LAB_ORDER from data/alistairLabs.js (NOT
 * HOME_PATH_OF_EXPLORATION which is only 4).
 */
import { Link } from "react-router-dom";
import {
  Home as HomeIcon,
  Compass as CompassIcon,
  BookOpen,
  FlaskConical,
  StickyNote,
  Library as LibraryIcon,
  Eye,
  HelpCircle,
  RefreshCw,
  ArrowRight,
} from "lucide-react";
import { LABS, LAB_ORDER } from "@/data/alistairLabs";

/* §ALISTAIR-HERO-LOCK 2026-02-16 — Founder-approved clean hero asset
 * (uploaded by founder, description: "nii on see ilma instrutsioonita"
 * — clean version without instruction strip baked into the mockup).
 * DO NOT CHANGE without founder approval. */
const SCENIC_BG = "https://customer-assets.emergentagent.com/job_aurin-hub/artifacts/7cqdspok_image.png";
const SERIF = '"Cormorant Garamond", "EB Garamond", Georgia, serif';

const SIDEBAR_BG = "#0c0f17";
const SIDEBAR_BG_SOFT = "#141927";
const BRASS = "#c4a46b";
const BRASS_BRIGHT = "#d4b67d";
const CREAM = "#f0eadd";
const MUTED = "#8b8576";

const SIDEBAR_NAV = [
  { id: "home",        label: "Home",        icon: HomeIcon,     href: "/course-room", active: true },
  { id: "explore",     label: "Explore",     icon: CompassIcon,  href: "/course-room/laboratories" },
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
        {SIDEBAR_NAV.map((it) => {
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
    <Link to="/alistair" data-testid="alistair-monogram" className="block no-underline" style={{ textDecoration: "none" }}>
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
            {/* §ALISTAIR-LOGO 2026-02-13 — Removed inner "A" glyph per
                founder's approved reference (clean four-point star, no
                centred letter). */}
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
      <Hero />
      <PathOfExploration />
    </section>
  );
}

function Hero() {
  return (
    <header data-testid="alistair-hero" className="relative" style={{ minHeight: "560px" }}>
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{
          backgroundImage: `url("${SCENIC_BG}")`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />
      {/* §HERO-CARD-LEFT-MASK 2026-06-16 — Painted SCENIC_BG includes a
          legacy left-side hero block ("A place for deep inquiry, living
          experiments and meaningful transformation."). Founder approved
          a "Variant 3 hero card": a strong dark panel that covers the
          entire painted left hero region and carries the new, sharper
          copy. Saves a re-render of the painted asset and strengthens
          the 3-second clarity hook simultaneously. */}
      <div
        aria-hidden="true"
        className="absolute inset-y-0 left-0 pointer-events-none"
        style={{
          width: "min(560px, 48%)",
          background:
            "linear-gradient(90deg, rgba(8,11,18,0.98) 0%, rgba(8,11,18,0.96) 60%, rgba(8,11,18,0.88) 82%, rgba(8,11,18,0) 100%)",
        }}
      />
      <div
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 h-[40%] pointer-events-none"
        style={{
          background:
            "linear-gradient(180deg, transparent 0%, rgba(12,15,23,0.55) 55%, rgba(12,15,23,0.92) 100%)",
        }}
      />

      <div className="relative z-[2] px-8 lg:px-12 pt-6 lg:pt-8 pb-12 max-w-[520px]">
        <div
          data-testid="alistair-hero-card"
          className="relative p-7 lg:p-9"
          style={{
            background: "rgba(8,11,18,0.94)",
            border: "1px solid rgba(196,164,107,0.28)",
            borderLeft: "3px solid #c4a46b",
            backdropFilter: "blur(8px)",
            boxShadow: "0 30px 80px -20px rgba(0,0,0,0.7)",
          }}
        >
          <p
            className="text-[10px] tracking-[0.42em] uppercase mb-4"
            style={{ color: BRASS }}
          >
            — Alistair · Guide
          </p>
          <h1
            data-testid="alistair-hero-title"
            className="font-light leading-[1.04] mb-5"
            style={{
              color: CREAM,
              fontFamily: SERIF,
              fontSize: "clamp(2.4rem, 3.8vw, 3.6rem)",
              letterSpacing: "-0.005em",
            }}
          >
            Laboratory of Life
          </h1>
          <div
            aria-hidden="true"
            className="mb-5"
            style={{
              width: "64px",
              height: "1px",
              background: "linear-gradient(90deg, #c4a46b, transparent)",
            }}
          />
          <p
            data-testid="alistair-hero-subtitle"
            className="text-[15.5px] leading-[1.72] mb-6"
            style={{ color: "#d9d1be", fontFamily: SERIF }}
          >
            <span style={{ color: CREAM, fontWeight: 500 }}>Not a course. Not a coach.</span>
            <br />
            Eleven open questions about your own life —
            <br />
            and the patience to actually sit with them.
          </p>
          <p
            className="text-[12px] tracking-[0.18em] uppercase"
            style={{ color: BRASS, opacity: 0.85 }}
          >
            Explore the 11 laboratories below ↓
          </p>
        </div>
      </div>
    </header>
  );
}

/* ─────────────── YOUR PATH OF EXPLORATION — 11 LABS ─────────────── */

function PathOfExploration() {
  const labs = LAB_ORDER.map((slug) => LABS[slug]).filter(Boolean);
  return (
    <section
      data-testid="alistair-path-of-exploration"
      className="px-8 lg:px-12 pt-10 lg:pt-12 pb-14"
      style={{ background: SIDEBAR_BG }}
    >
      <p className="text-[11px] tracking-[0.34em] uppercase mb-7" style={{ color: BRASS }}>
        Your Path of Exploration — 11 Laboratories
      </p>
      {/* §ALISTAIR-GRID 2026-02-13 — Reference image shows 6+5 cards
          across two rows. Locked to 6 columns from lg upward so the
          11-card laboratory grid matches the founder's reference exactly. */}
      <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 xl:grid-cols-6">
        {labs.map((lab, i) => (
          <LabCard key={lab.slug} lab={lab} number={i + 1} />
        ))}
      </div>
    </section>
  );
}

function LabCard({ lab, number }) {
  /* §ALISTAIR-CANONICAL-ROUTE 2026-02-13 — Card click routes to the
   * canonical /alistair/lab/{slug} (legacy /course-room/lab/{slug} still
   * resolves via duplicate route in App.js for old bookmarks). */
  const href = `/alistair/lab/${lab.slug}`;
  const isOpen = lab.status === "open";
  return (
    <Link
      to={href}
      data-testid={`alistair-lab-card-${lab.slug}`}
      className="group relative flex flex-col overflow-hidden rounded-md transition-transform hover:-translate-y-px no-underline"
      style={{
        background: "rgba(245, 235, 215, 0.96)",
        border: "1px solid rgba(196,164,107,0.42)",
        textDecoration: "none",
        boxShadow: "0 12px 32px -18px rgba(0,0,0,0.65)",
      }}
    >
      <div
        className="relative h-[170px] overflow-hidden"
        style={{ background: SIDEBAR_BG }}
      >
        {lab.thumbnail && (
          <img
            src={lab.thumbnail}
            alt=""
            className="w-full h-full object-cover"
            loading="lazy"
          />
        )}
        {/* Numbered badge (1–11) painted-style. */}
        <span
          aria-hidden="true"
          className="absolute top-3 left-3 w-8 h-8 rounded-full flex items-center justify-center text-[14px] font-medium"
          style={{
            background: SIDEBAR_BG,
            color: BRASS_BRIGHT,
            border: `1px solid ${BRASS}`,
            fontFamily: SERIF,
          }}
        >
          {number}
        </span>
        {/* §HUB-STATUS-INDICATOR 2026-06-16 — Founder lock: hub badges
           communicate completeness ONLY. OPEN NOW = the lab is fully
           authored (Money Tree). PREVIEW = the lab is still being
           expanded but already has hero studies inside. The word
           "Coming Soon" is reserved for the inside-lab gating on
           individual unwritten topics; it is not used here. */}
        {isOpen ? (
          <span
            data-testid={`alistair-lab-card-status-${lab.slug}`}
            className="absolute top-3 right-3 text-[9px] tracking-[0.28em] uppercase px-2 py-1"
            style={{
              background: "rgba(76, 122, 70, 0.92)",
              border: "1px solid rgba(168, 214, 140, 0.55)",
              color: "#f4f7e8",
            }}
          >
            Open Now
          </span>
        ) : (
          <span
            data-testid={`alistair-lab-card-status-${lab.slug}`}
            className="absolute top-3 right-3 text-[9px] tracking-[0.28em] uppercase px-2 py-1"
            style={{
              background: "rgba(12,15,23,0.78)",
              border: "1px solid rgba(196,164,107,0.32)",
              color: BRASS,
            }}
          >
            Preview
          </span>
        )}
      </div>

      <div className="p-5 flex flex-col grow">
        <p
          className="text-[12.5px] tracking-[0.26em] uppercase mb-2.5"
          style={{ color: "#2b1f0f", fontFamily: SERIF, fontWeight: 500 }}
        >
          {lab.name}
        </p>
        <p
          className="text-[13.5px] leading-[1.6] grow"
          style={{ color: "#5b4226", fontFamily: SERIF }}
        >
          {lab.short}
        </p>
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
