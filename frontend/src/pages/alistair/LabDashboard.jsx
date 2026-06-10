/**
 * LabDashboard.jsx — § ALISTAIR LAB DASHBOARD v1 2026-02-08
 *
 * Tier-2 dashboard layout for Alistair laboratory pages. Built side-by-side
 * with the existing Lab.jsx (which stays as the Tier-1 entrance template).
 *
 * This component is applied to ONE test route only: /course-room/lab/self-sabotage
 * After founder approval, the same layout can be applied to the other 10
 * laboratories without redesigning.
 *
 * Layout matches founder-supplied Self-Sabotage mockup 1:1:
 *
 *   ┌────────────────────────────────────────────────────────────────────┐
 *   │ DARK SIDEBAR   │   HERO (full supplied painted image as bg)        │
 *   │ ⭐ Alistair    │   "SELF-SABOTAGE" + "A LABORATORY OF AWARENESS"   │ HOW WE EXPLORE
 *   │  Lab of Life   │   3-line intro on a dark/blurred text panel       │   1. NOTICE
 *   │ EXPLORE        │                                                   │   2. INQUIRE
 *   │  • Home        │                                                   │   3. EXPERIMENT
 *   │  • Conv.       │                                                   │   4. INTEGRATE
 *   │  • Labs ✓      │ ───────────────────────────────────────────       │
 *   │  • Journal     │   WHAT WE EXPLORE HERE                            │   ABOUT ALISTAIR
 *   │  • Insights    │   [HIDDEN] [ROOT] [TRIG] [NEW] [TRUST]            │   portrait + bio
 *   │  • Library     │   (5–6 painted cards)                             │
 *   │ ✦ quote        │                                                   │
 *   │ portrait       │                                                   │
 *   └────────────────────────────────────────────────────────────────────┘
 *   QUICK ACTIONS bar (bottom, full-width)
 *   ✦ "Life is not something to be solved, but a mystery to be lived." ✦
 */
import { Link } from "react-router-dom";
import {
  Home as HomeIcon,
  MessageCircle,
  FlaskConical,
  StickyNote,
  TrendingUp,
  Library as LibraryIcon,
  Eye,
  HelpCircle,
  RefreshCw,
  ArrowRight,
  ArrowLeft,
  ChevronRight,
  Bookmark,
  Sparkles,
  Heart,
  PenLine,
  MessageSquare,
  Search,
} from "lucide-react";
import { LABS } from "@/data/alistairLabs";

const SERIF = '"Cormorant Garamond", "EB Garamond", Georgia, serif';
const SIDEBAR_BG = "#0a0d15";
const SIDEBAR_BG_SOFT = "#141927";
const PANEL_BG = "rgba(20, 25, 39, 0.72)";
const BRASS = "#c4a46b";
const BRASS_BRIGHT = "#d4b67d";
const CREAM = "#f0eadd";
const MUTED = "#8b8576";

const SIDEBAR_ITEMS = [
  { id: "home",        label: "Home",          icon: HomeIcon,     href: "/course-room" },
  { id: "conversations", label: "Conversations", icon: MessageCircle, href: "/course-room/room" },
  { id: "laboratories", label: "Laboratories", icon: FlaskConical, href: "/course-room/laboratories", active: true },
  { id: "journal",     label: "Journal",       icon: StickyNote,   href: "/course-room/notes" },
  { id: "insights",    label: "Insights",      icon: TrendingUp,   href: "/course-room/experiments" },
  { id: "library",     label: "Library",       icon: LibraryIcon,  href: "/course-room/library" },
];

const HOW_STEPS = [
  { n: 1, label: "NOTICE",     icon: Eye,          text: "We notice the moments of self-sabotage with honesty and kindness." },
  { n: 2, label: "INQUIRE",    icon: HelpCircle,   text: "We explore the beliefs, fears and stories behind the pattern." },
  { n: 3, label: "EXPERIMENT", icon: FlaskConical, text: "We try new responses and small acts of courage in real life." },
  { n: 4, label: "INTEGRATE",  icon: RefreshCw,    text: "We integrate new insights so they become part of who we are." },
];

/* §LAB-DATA 2026-02-08 — Self-Sabotage dashboard content, pulled from
   founder mockup (cracked golden egg). Five cards under WHAT WE EXPLORE
   HERE. Painted card thumbnails are placeholder cream slots — founder
   will deliver the 5 small icons (mask / chained heart / sprout / key
   / butterfly) in the next iteration. */
const SUB_CARDS = [
  { id: "hidden-patterns",   title: "HIDDEN PATTERNS",   blurb: "Recognise the recurring behaviours that keep you stuck." },
  { id: "root-beliefs",      title: "ROOT BELIEFS",       blurb: "Discover the core beliefs that fuel self-sabotage." },
  { id: "emotional-triggers",title: "EMOTIONAL TRIGGERS", blurb: "Understand what triggers the pattern and why." },
  { id: "new-choices",       title: "NEW CHOICES",        blurb: "Explore alternative ways of responding to yourself and life." },
  { id: "self-trust",        title: "SELF-TRUST",         blurb: "Build trust, compassion and a new relationship with yourself." },
];

const QUICK_ACTIONS = [
  { id: "pattern-scan",     label: "Pattern Scan",       icon: Search },
  { id: "trigger-map",      label: "Trigger Map",        icon: Heart },
  { id: "self-compassion",  label: "Self-Compassion",    icon: Sparkles },
  { id: "journal-prompt",   label: "Journal Prompt",     icon: PenLine },
  { id: "grace-chat",       label: "Grace Chat",         icon: MessageSquare },
];

export default function LabDashboard() {
  /* §LAB-DASHBOARD-FIX 2026-02-08 — This is a static route (Self-Sabotage
     test). useParams returned undefined because the route path has no
     :labSlug placeholder; the navigate-during-render guard then silently
     returned null and the page rendered blank. Hard-coding the slug
     resolves it cleanly until the dashboard is generalised to other
     labs in the next iteration. */
  const lab = LABS["self-sabotage"];
  const hero = lab.thumbnail || "/assets/alistair/labs/self-sabotage.png";

  return (
    <div
      data-testid={`lab-dashboard-${lab.slug}`}
      className="relative min-h-screen w-full"
      style={{ backgroundColor: SIDEBAR_BG, color: CREAM, fontFamily: SERIF }}
    >
      <div className="grid min-h-screen grid-cols-1 lg:[grid-template-columns:220px_1fr_300px]">
        <Sidebar />
        <CentreColumn lab={lab} hero={hero} />
        <RightColumn />
      </div>
      <QuickActionsBar />
      <BottomQuote />
    </div>
  );
}

/* ─────────────────────────── SIDEBAR ─────────────────────────── */

function Sidebar() {
  return (
    <aside
      data-testid="dashboard-sidebar"
      className="relative flex flex-col px-5 py-8 border-r"
      style={{ background: SIDEBAR_BG, borderColor: "rgba(196,164,107,0.12)" }}
    >
      <Link to="/course-room" className="block no-underline mb-6" style={{ textDecoration: "none" }}>
        <div className="w-[52px] h-[52px] flex items-center justify-center mx-auto mb-3">
          <svg viewBox="0 0 100 100" width="52" height="52" fill="none">
            <g stroke={BRASS} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M50 6 L54 46 L94 50 L54 54 L50 94 L46 54 L6 50 L46 46 Z" />
              <path d="M22 22 L48 48 M78 22 L52 48 M78 78 L52 52 M22 78 L48 52" opacity="0.55" />
              <circle cx="50" cy="50" r="36" opacity="0.18" />
            </g>
            <text x="50" y="60" textAnchor="middle"
              style={{ fill: BRASS_BRIGHT, fontFamily: SERIF, fontSize: "30px", fontWeight: 400 }}>A</text>
          </svg>
        </div>
        <p className="text-center text-[16px] tracking-[0.18em]" style={{ color: CREAM, fontFamily: SERIF }}>
          ALISTAIR
        </p>
        <p className="text-center text-[9px] tracking-[0.3em] uppercase mt-1" style={{ color: BRASS }}>
          Laboratory of Life
        </p>
      </Link>

      <div className="mt-2 mb-5" aria-hidden="true"
        style={{ height: 1, background: "linear-gradient(90deg, transparent, rgba(196,164,107,0.32), transparent)" }} />

      <p className="text-[10px] tracking-[0.32em] uppercase mb-3" style={{ color: BRASS }}>Explore</p>

      <nav className="space-y-1">
        {SIDEBAR_ITEMS.map((it) => {
          const Icon = it.icon;
          return (
            <Link
              key={it.id}
              to={it.href}
              data-testid={`dashboard-nav-${it.id}`}
              className="flex items-center gap-3 px-3 py-2 rounded-md text-[13px] no-underline transition-colors"
              style={{
                color: it.active ? CREAM : MUTED,
                background: it.active ? "rgba(196,164,107,0.10)" : "transparent",
                border: it.active ? "1px solid rgba(196,164,107,0.28)" : "1px solid transparent",
                textDecoration: "none", fontFamily: SERIF,
              }}
            >
              <Icon size={14} strokeWidth={1.5} />
              <span>{it.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto pt-8 border-t" style={{ borderColor: "rgba(196,164,107,0.16)" }}>
        <p className="mt-4 text-[12px] italic leading-[1.7]" style={{ color: "#a89e8b", fontFamily: SERIF }}>
          We do not come here<br />to be taught.<br />
          We come to remember<br />what we already know.
        </p>
      </div>
    </aside>
  );
}

/* ─────────────────────────── CENTRE ─────────────────────────── */

function CentreColumn({ lab, hero }) {
  return (
    <section data-testid="dashboard-centre" className="relative">
      <HeroBand lab={lab} hero={hero} />
      <WhatWeExploreHere lab={lab} />
    </section>
  );
}

function HeroBand({ lab, hero }) {
  return (
    <header
      data-testid="dashboard-hero"
      className="relative w-full overflow-hidden"
      style={{ minHeight: "440px" }}
    >
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{
          backgroundImage: `url("${hero}")`,
          backgroundSize: "cover",
          backgroundPosition: "center 35%",
        }}
      />
      {/* Dark veil ONLY on the left side so the painted figure on the
          right of the supplied hero stays visible and untouched. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "linear-gradient(90deg, rgba(10,13,21,0.88) 0%, rgba(10,13,21,0.62) 32%, rgba(10,13,21,0.15) 52%, transparent 70%)",
        }}
      />

      {/* Top-left breadcrumb + Back button */}
      <div className="relative z-[2] px-8 lg:px-12 pt-6 flex items-center justify-between">
        <div className="flex items-center gap-2 text-[11px] tracking-[0.26em] uppercase" style={{ color: BRASS }}>
          <FlaskConical size={12} strokeWidth={1.6} />
          <Link to="/course-room/laboratories" className="no-underline" style={{ color: BRASS, textDecoration: "none" }}>
            Laboratories
          </Link>
          <ChevronRight size={11} strokeWidth={1.6} style={{ opacity: 0.6 }} />
          <span style={{ color: CREAM }}>{lab.name}</span>
        </div>
        <Link
          to="/course-room/laboratories"
          data-testid="dashboard-back-to-labs"
          className="inline-flex items-center gap-2 px-3.5 py-2 text-[11px] tracking-[0.22em] uppercase no-underline rounded"
          style={{
            color: CREAM,
            background: "rgba(20,25,39,0.7)",
            border: "1px solid rgba(196,164,107,0.32)",
            textDecoration: "none",
          }}
        >
          <ArrowLeft size={12} /> Back to Laboratories
          <Bookmark size={12} style={{ marginLeft: 6, opacity: 0.6 }} />
        </Link>
      </div>

      {/* Hero copy block — sits on the dark left side only */}
      <div className="relative z-[2] px-8 lg:px-12 pt-10 pb-12 max-w-[640px]">
        <h1
          data-testid="dashboard-title"
          className="font-light leading-[0.95] mb-3"
          style={{
            color: CREAM,
            fontFamily: SERIF,
            fontSize: "clamp(2.6rem, 5vw, 4.2rem)",
            letterSpacing: "0.005em",
            textTransform: "uppercase",
          }}
        >
          {lab.name}
        </h1>
        <p
          className="text-[12.5px] tracking-[0.3em] uppercase mb-5"
          style={{ color: BRASS_BRIGHT, fontFamily: SERIF }}
        >
          A Laboratory of Awareness
        </p>
        <div
          className="p-4 rounded"
          style={{
            background: PANEL_BG,
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
            border: "1px solid rgba(196,164,107,0.18)",
            maxWidth: "440px",
          }}
        >
          <p className="text-[15px] leading-[1.7]" style={{ color: "#e8e1d1", fontFamily: SERIF }}>
            Self-sabotage is not your enemy.<br />
            It is a protective pattern<br />
            that once helped you survive.<br />
            Here we explore it with<br />
            curiosity, compassion and courage.
          </p>
        </div>
      </div>
    </header>
  );
}

function WhatWeExploreHere() {
  return (
    <div className="relative z-[2] px-8 lg:px-12 py-10 border-t" style={{ borderColor: "rgba(196,164,107,0.10)" }}>
      <p className="text-[11px] tracking-[0.34em] uppercase mb-6" style={{ color: BRASS }}>
        What We Explore Here
      </p>
      <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
        {SUB_CARDS.map((c) => (
          <article
            key={c.id}
            data-testid={`dashboard-sub-${c.id}`}
            className="relative rounded-md overflow-hidden p-4 flex flex-col"
            style={{
              background: SIDEBAR_BG_SOFT,
              border: "1px solid rgba(196,164,107,0.22)",
              minHeight: "200px",
            }}
          >
            <div
              aria-hidden="true"
              className="h-[80px] mb-3 rounded"
              style={{
                background:
                  "linear-gradient(135deg, rgba(196,164,107,0.18), rgba(20,25,39,0.5))",
              }}
            />
            <p className="text-[11.5px] tracking-[0.22em] uppercase mb-2" style={{ color: BRASS_BRIGHT, fontFamily: SERIF }}>
              {c.title}
            </p>
            <p className="text-[12.5px] leading-[1.55]" style={{ color: "#a89e8b", fontFamily: SERIF }}>
              {c.blurb}
            </p>
          </article>
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────────── RIGHT ─────────────────────────── */

function RightColumn() {
  return (
    <aside data-testid="dashboard-right" className="relative px-5 py-8 lg:py-10"
      style={{ background: SIDEBAR_BG, borderLeft: "1px solid rgba(196,164,107,0.10)" }}>
      <HowWeExplore />
      <AboutAlistair />
    </aside>
  );
}

function HowWeExplore() {
  return (
    <div data-testid="dashboard-how-we-explore">
      <p className="text-[11px] tracking-[0.32em] uppercase mb-5" style={{ color: BRASS }}>
        How We Explore
      </p>
      <ol className="space-y-4">
        {HOW_STEPS.map((s) => {
          const Icon = s.icon;
          return (
            <li key={s.n} className="flex items-start gap-3 py-2.5 border-b" style={{ borderColor: "rgba(196,164,107,0.10)" }}>
              <div className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center mt-0.5"
                style={{ background: "rgba(196,164,107,0.10)", border: "1px solid rgba(196,164,107,0.42)", color: BRASS_BRIGHT }}>
                <Icon size={12} strokeWidth={1.6} />
              </div>
              <div className="flex-grow min-w-0">
                <p className="text-[11px] tracking-[0.24em] uppercase mb-1" style={{ color: CREAM, fontFamily: SERIF, fontWeight: 500 }}>
                  {s.label}
                </p>
                <p className="text-[12px] leading-[1.55]" style={{ color: "#a89e8b", fontFamily: SERIF }}>
                  {s.text}
                </p>
              </div>
              <ChevronRight size={12} style={{ color: BRASS, marginTop: 6, flexShrink: 0 }} />
            </li>
          );
        })}
      </ol>
    </div>
  );
}

function AboutAlistair() {
  return (
    <div data-testid="dashboard-about-alistair" className="mt-8">
      <p className="text-[11px] tracking-[0.32em] uppercase mb-4" style={{ color: BRASS }}>About Alistair</p>
      <div className="flex items-start gap-3 mb-4">
        <div className="flex-shrink-0 w-14 h-14 rounded-full overflow-hidden"
          style={{ border: `1.5px solid ${BRASS}`, background: SIDEBAR_BG }} aria-hidden="true">
          <img src="/avatars/alistair.png" alt="" className="w-full h-full object-cover"
            onError={(e) => { e.currentTarget.style.display = "none"; }} />
        </div>
        <div>
          <p className="text-[16px] leading-tight" style={{ color: CREAM, fontFamily: SERIF }}>
            Guide.<br />Explorer.<br />Questioner.
          </p>
        </div>
      </div>
      <p className="text-[12.5px] leading-[1.7] mb-4" style={{ color: "#a89e8b", fontFamily: SERIF }}>
        I walk beside you as you explore life&apos;s patterns, question the familiar and create meaningful change.
      </p>
      <p className="text-[12.5px] italic leading-[1.6]" style={{ color: "#cfc7b3", fontFamily: SERIF }}>
        Let&apos;s explore together.
      </p>
    </div>
  );
}

/* ─────────────────────────── QUICK ACTIONS ─────────────────────────── */

function QuickActionsBar() {
  return (
    <div
      data-testid="dashboard-quick-actions"
      className="relative z-[3] px-6 lg:px-12 py-4 border-t flex items-center justify-between flex-wrap gap-3"
      style={{ background: SIDEBAR_BG_SOFT, borderColor: "rgba(196,164,107,0.16)" }}
    >
      <p className="text-[10.5px] tracking-[0.32em] uppercase" style={{ color: BRASS }}>
        Quick Actions
      </p>
      <div className="flex items-center gap-2 flex-wrap">
        {QUICK_ACTIONS.map((a) => {
          const Icon = a.icon;
          return (
            <button
              key={a.id}
              type="button"
              data-testid={`dashboard-action-${a.id}`}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded text-[11.5px] tracking-[0.16em] uppercase transition-colors hover:bg-[rgba(196,164,107,0.12)]"
              style={{
                color: CREAM, background: "transparent",
                border: "1px solid rgba(196,164,107,0.28)", fontFamily: SERIF,
              }}
            >
              <Icon size={13} strokeWidth={1.6} style={{ color: BRASS_BRIGHT }} />
              {a.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ─────────────────────────── BOTTOM QUOTE ─────────────────────────── */

function BottomQuote() {
  return (
    <div data-testid="dashboard-bottom-quote" className="relative z-[3] py-6 px-6 text-center border-t"
      style={{ background: SIDEBAR_BG, borderColor: "rgba(196,164,107,0.10)" }}>
      <p className="text-[15px] italic" style={{ color: "#cfc7b3", fontFamily: SERIF }}>
        <span aria-hidden="true" style={{ color: BRASS, marginRight: 12 }}>✦</span>
        Life is not something to be solved, but a mystery to be lived.
        <span aria-hidden="true" style={{ color: BRASS, marginLeft: 12 }}>✦</span>
      </p>
    </div>
  );
}
