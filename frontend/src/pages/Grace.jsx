/**
 * Grace.jsx — § GRACE LIGHT-HOMEPAGE 2026-02
 *
 * Public Grace Room landing page (the warm, daylight, welcoming version).
 * Replaces "Clarity Release" as the user-facing Grace homepage.
 *
 * Design brief (founder, Estonian session 2026-02):
 *   - warm, safe, elegant, calm, human, hopeful
 *   - NOT dark, NOT heavy, NOT therapy-like
 *   - light Nano Banana background (cream + wood + plants + fireplace)
 *   - 3-column layout: left sidebar / centre hero / right "How Grace Works"
 *   - bottom: Recent Notes (3 cards) + Grace profile card
 *
 * The actual Grace chat / Wanderer-gated rooms still live at
 * /clarity-release (legacy, kept as 301 source). This page is the new
 * front door, public, no gate, no chat — just an entry point with a
 * single primary CTA that routes to the existing voice/chat surface.
 */
import { Link } from "react-router-dom";
import { useState } from "react";
import {
  Home,
  Mic,
  Pen,
  Moon,
  MessageSquare,
  Heart,
  ArrowRight,
  Quote,
  Sparkles,
  BookOpen,
} from "lucide-react";

const BG_IMAGE = "/assets/grace/grace-light-bg.png";

/* Sidebar items — match founder mockup verbatim. Each sidebar entry
   carries a tooltip line so a first-time visitor understands what is
   behind each icon (founder spec, Estonian session). */
const SIDEBAR = [
  {
    id: "home",
    label: "Home",
    icon: Home,
    active: true,
    href: "/grace",
    tooltip: "Back to the Grace Room front page. This is where the journey begins.",
  },
  {
    id: "speak",
    label: "Speak",
    icon: Mic,
    href: "/grace/speak",
    tooltip: "Talk with Grace using your voice. A safe place to speak out loud.",
  },
  {
    id: "write",
    label: "Write",
    icon: Pen,
    href: "/grace/write",
    tooltip: "Write down your thoughts, feelings, or short journal notes.",
  },
  {
    id: "evening",
    label: "Evening reflection",
    icon: Moon,
    href: "/grace/evening",
    tooltip: "An evening pause — a quiet review of the day and a gentle self-check.",
  },
  {
    id: "messages",
    label: "My messages",
    icon: MessageSquare,
    href: "/grace/messages",
    tooltip: "Past conversations, notes, and saved thoughts. Pick up where you left off.",
  },
  {
    id: "library",
    label: "Library",
    icon: BookOpen,
    href: "/grace/library",
    tooltip: "A quiet reading room beside the fireplace. Short pieces written in the same tone as Grace.",
  },
];

/* Right panel — "How Grace Works". Five steps, founder copy. */
const HOW_STEPS = [
  {
    n: 1,
    label: "BE PRESENT",
    icon: Heart,
    text: "Pause for a moment. This is your room. You don't have to prove or solve anything.",
  },
  {
    n: 2,
    label: "SPEAK",
    icon: Mic,
    text: "If you want to talk, choose Speak. Grace listens without judgment and without interrupting.",
  },
  {
    n: 3,
    label: "WRITE",
    icon: Pen,
    text: "If words are easier on paper than out loud, choose Write. Every thought is allowed.",
  },
  {
    n: 4,
    label: "EVENING REFLECTION",
    icon: Moon,
    text: "At the end of the day, look back gently: what went well, what stayed with you, what you wish to release.",
  },
  {
    n: 5,
    label: "MY MESSAGES",
    icon: MessageSquare,
    text: "Find your earlier conversations, notes, and thoughts here. You can always continue where you left off.",
  },
];

/* Recent Notes (placeholder until real data is wired in). */
const RECENT_NOTES = [
  {
    id: 1,
    icon: "○",
    text: "Today I let myself rest. And that was enough.",
    date: "May 18, 2024",
  },
  {
    id: 2,
    icon: "☀",
    text: "I'm proud of the small steps I took today.",
    date: "May 15, 2024",
  },
  {
    id: 3,
    icon: "♥",
    text: "I am allowed to take my time. Progress is still progress.",
    date: "May 12, 2024",
  },
];

/* Today's Reflection — a single short sentence shown on the homepage.
   Rotated daily by day-of-year so every visit can feel different,
   never random in the same session. Founder examples used as seed. */
const REFLECTIONS = [
  "Some days are not meant for solving. Some days are meant for noticing.",
  "What you carry today does not have to be carried alone.",
  "Rest is not the reward for finishing. It is the ground that lets you finish.",
  "The next breath is enough.",
  "Slow is also a direction.",
  "You are allowed to start the day in the middle of it.",
  "Being here at all is already an answer to something.",
];

/* Words For You — short cards the visitor can take or leave. */
const WORDS_FOR_YOU = [
  { id: 1, text: "Rest is productive too." },
  { id: 2, text: "Small steps still count." },
  { id: 3, text: "You do not have to carry everything today." },
  { id: 4, text: "The next breath is enough." },
];


export default function Grace() {
  /* §FIRST-VISIT 2026-02-13 — Detect whether this is the visitor's first
     time landing on Grace; the hero greeting must respect that ("Welcome"
     for new arrivals, "Welcome back" only for returning visitors).
     Lazy initialiser reads localStorage synchronously on the first
     render to avoid the Emergent react-hooks/set-state-in-effect rule. */
  const [isReturning] = useState(() => {
    try {
      const visited = localStorage.getItem("grace_visited_v1");
      if (visited) return true;
      localStorage.setItem("grace_visited_v1", new Date().toISOString());
      return false;
    } catch {
      return false;
    }
  });

  const startConversation = () => {
    // Real Grace room — Wanderer's Gate, ConvAI voice, text chat,
    // reflections, passes. Preserved untouched at /grace/room.
    window.location.href = "/grace/room";
  };

  return (
    <div
      data-testid="page-grace"
      className="relative min-h-screen w-full overflow-hidden"
      style={{
        backgroundColor: "#f6efe4",
      }}
    >
      {/* Decorative Nano-Banana background */}
      <div
        aria-hidden="true"
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: `url("${BG_IMAGE}")`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          filter: "blur(2px) brightness(0.94) saturate(0.96)",
        }}
      />
      {/* Soft cream wash so the UI sits cleanly on top of the photo */}
      <div
        aria-hidden="true"
        className="absolute inset-0 z-0"
        style={{
          background:
            "linear-gradient(180deg, rgba(248,240,225,0.72) 0%, rgba(248,240,225,0.55) 35%, rgba(248,240,225,0.78) 100%)",
        }}
      />
      {/* Vignette */}
      <div
        aria-hidden="true"
        className="absolute inset-0 z-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 110% 90% at 50% 45%, transparent 35%, rgba(120, 85, 50, 0.18) 100%)",
        }}
      />

      <div className="relative z-[2] max-w-[1440px] mx-auto px-5 md:px-8 py-10 md:py-14">
        {/* Three-column desktop, stacked mobile */}
        <div className="grid gap-6 lg:gap-8 grid-cols-1 lg:[grid-template-columns:minmax(220px,260px)_1fr_minmax(300px,360px)]">
          {/* ───── LEFT COLUMN ───── */}
          <aside className="space-y-6">
            <BrandCard />
            <SidebarNav />
            <PrincipleCard />
          </aside>

          {/* ───── CENTRE HERO ───── */}
          <section
            className="flex flex-col items-center justify-center min-h-[640px] py-10 text-center"
            data-testid="grace-hero"
          >
            <Sparkles
              size={28}
              strokeWidth={1.4}
              className="mb-6"
              style={{ color: "#c89a5a" }}
            />
            <h1
              className="leading-[1.02] mb-6"
              style={{
                color: "#2a1f12",
                fontFamily: '"Cormorant Garamond", Georgia, serif',
                fontWeight: 400,
                fontSize: "clamp(3rem, 6.5vw, 5.4rem)",
                letterSpacing: "-0.01em",
              }}
              data-testid="grace-hero-title"
            >
              Welcome{isReturning ? " back" : ""}<span style={{ color: "#c89a5a" }}>.</span>
            </h1>
            <div
              aria-hidden="true"
              className="mx-auto mb-7"
              style={{
                width: "120px",
                height: "1px",
                background: "linear-gradient(90deg, transparent, #c89a5a, transparent)",
              }}
            />
            <p
              className="max-w-[420px] leading-[1.75] mb-9"
              style={{
                color: "#3d2f1f",
                fontSize: "18px",
                fontFamily: '"Cormorant Garamond", Georgia, serif',
              }}
              data-testid="grace-hero-subtitle"
            >
              This is your safe space.
              <br />
              Speak, write, or simply be.
              <br />
              I&apos;m here.
            </p>
            <button
              type="button"
              onClick={startConversation}
              data-testid="grace-primary-cta"
              className="inline-flex items-center gap-3 px-8 py-4 rounded-full text-[15px] transition-all hover:scale-[1.03] hover:shadow-xl"
              style={{
                background: "#c89a5a",
                color: "#fdf8ef",
                fontFamily: '"Cormorant Garamond", Georgia, serif',
                fontWeight: 500,
                letterSpacing: "0.02em",
                boxShadow: "0 10px 32px -10px rgba(200, 154, 90, 0.7)",
              }}
            >
              Start a conversation
              <MessageSquare size={16} strokeWidth={1.8} />
            </button>
          </section>

          {/* ───── RIGHT COLUMN ───── */}
          <aside className="space-y-6">
            <HowGraceWorks />
            <GraceProfileCard />
          </aside>
        </div>

        {/* ───── RECENT NOTES (full width below) ───── */}
        <TodaysReflection />
        <WordsForYou />
        <RecentNotes />
      </div>

      {/* Ambience layer — extremely subtle */}
      <style>{`
        @keyframes grace-glow {
          0%, 100% { opacity: 0.55; transform: scale(1); }
          50%      { opacity: 0.78; transform: scale(1.04); }
        }
        @keyframes grace-fade-in {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        [data-testid="page-grace"] [data-testid="grace-hero"] > * {
          animation: grace-fade-in 800ms ease-out both;
        }
        [data-testid="page-grace"] [data-testid="grace-hero"] > *:nth-child(2) { animation-delay: 120ms; }
        [data-testid="page-grace"] [data-testid="grace-hero"] > *:nth-child(3) { animation-delay: 220ms; }
        [data-testid="page-grace"] [data-testid="grace-hero"] > *:nth-child(4) { animation-delay: 320ms; }
        [data-testid="page-grace"] [data-testid="grace-hero"] > *:nth-child(5) { animation-delay: 460ms; }
      `}</style>
    </div>
  );
}

/* ───────────────────── LEFT COLUMN PIECES ───────────────────── */

function BrandCard() {
  return (
    <div
      className="rounded-2xl p-5 backdrop-blur-md"
      style={{
        background: "rgba(253, 246, 232, 0.72)",
        border: "1px solid rgba(200, 154, 90, 0.25)",
        boxShadow: "0 8px 28px -12px rgba(120, 85, 50, 0.18)",
      }}
      data-testid="grace-brand-card"
    >
      <div className="flex items-start gap-3">
        <div
          className="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center"
          style={{
            border: "1.5px solid #c89a5a",
            background:
              "radial-gradient(circle at 35% 30%, rgba(255,243,217,1), rgba(232,200,148,1))",
            color: "#7a5a26",
            fontFamily: '"Cormorant Garamond", Georgia, serif',
            fontSize: "20px",
            fontWeight: 500,
          }}
          aria-hidden="true"
        >
          A
        </div>
        <div>
          <p
            className="text-[22px] leading-tight mb-1"
            style={{
              color: "#2a1f12",
              fontFamily: '"Cormorant Garamond", Georgia, serif',
              fontWeight: 500,
            }}
          >
            Grace
          </p>
          <p
            className="text-[10.5px] tracking-[0.28em] uppercase"
            style={{ color: "#c89a5a" }}
          >
            G R A C E   R O O M
          </p>
        </div>
      </div>
      <p
        className="mt-4 text-[13px] leading-[1.7]"
        style={{
          color: "#5a4a30",
          fontFamily: '"Cormorant Garamond", Georgia, serif',
          fontStyle: "italic",
        }}
      >
        A place where you are welcome exactly as you are. A place where
        you can be.
      </p>
    </div>
  );
}

function SidebarNav() {
  return (
    <nav
      className="rounded-2xl p-3 backdrop-blur-md"
      style={{
        background: "rgba(253, 246, 232, 0.78)",
        border: "1px solid rgba(200, 154, 90, 0.22)",
        boxShadow: "0 8px 28px -12px rgba(120, 85, 50, 0.18)",
      }}
      data-testid="grace-sidebar"
    >
      <ul className="space-y-1.5">
        {SIDEBAR.map((it) => {
          const Icon = it.icon;
          const handleClick = (e) => {
            // Home is no-op (we're already on /grace).
            if (it.id === "home") return;
            e.preventDefault();
            window.location.href = it.href;
          };
          return (
            <li key={it.id}>
              <a
                href={it.href}
                title={it.tooltip}
                aria-label={`${it.label} — ${it.tooltip}`}
                data-testid={`grace-sidebar-${it.id}`}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-[14px] transition-all text-left no-underline ${
                  it.active ? "" : "hover:bg-[rgba(200,154,90,0.12)]"
                }`}
                style={{
                  color: it.active ? "#2a1f12" : "#5a4a30",
                  background: it.active
                    ? "rgba(200, 154, 90, 0.18)"
                    : "transparent",
                  border: it.active
                    ? "1px solid rgba(200, 154, 90, 0.4)"
                    : "1px solid transparent",
                  fontFamily: '"Cormorant Garamond", Georgia, serif',
                  fontWeight: it.active ? 500 : 400,
                  letterSpacing: "0.01em",
                  textDecoration: "none",
                }}
                onClick={handleClick}
              >
                <Icon size={16} strokeWidth={1.5} />
                <span>{it.label}</span>
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

function PrincipleCard() {
  return (
    <div
      className="rounded-2xl p-5 backdrop-blur-md"
      style={{
        background: "rgba(253, 246, 232, 0.7)",
        border: "1px solid rgba(200, 154, 90, 0.22)",
        boxShadow: "0 8px 28px -12px rgba(120, 85, 50, 0.18)",
      }}
      data-testid="grace-principle"
    >
      <Quote
        size={16}
        strokeWidth={1.5}
        style={{ color: "#c89a5a" }}
        className="mb-3"
      />
      <p
        className="text-[14px] leading-[1.75] italic"
        style={{
          color: "#3d2f1f",
          fontFamily: '"Cormorant Garamond", Georgia, serif',
        }}
      >
        You don&apos;t have to be perfect right now. You just have to be here.
      </p>
      <p
        className="mt-3 text-[11.5px] tracking-[0.18em] uppercase"
        style={{ color: "#c89a5a" }}
      >
        — Grace
      </p>
    </div>
  );
}

/* ───────────────────── RIGHT COLUMN PIECES ───────────────────── */

function HowGraceWorks() {
  return (
    <aside
      className="rounded-2xl p-6 backdrop-blur-md"
      style={{
        background: "rgba(253, 246, 232, 0.82)",
        border: "1px solid rgba(200, 154, 90, 0.25)",
        boxShadow: "0 8px 28px -12px rgba(120, 85, 50, 0.2)",
      }}
      data-testid="grace-how-it-works"
    >
      <p
        className="text-[10.5px] tracking-[0.24em] uppercase mb-5"
        style={{ color: "#c89a5a" }}
      >
        Today: How Grace Works
      </p>
      <ol className="space-y-5">
        {HOW_STEPS.map((s) => {
          const Icon = s.icon;
          return (
            <li
              key={s.n}
              className="flex gap-3.5"
              data-testid={`grace-step-${s.n}`}
            >
              <div
                className="flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center"
                style={{
                  background: "rgba(200, 154, 90, 0.16)",
                  border: "1px solid rgba(200, 154, 90, 0.45)",
                  color: "#c89a5a",
                }}
              >
                <Icon size={15} strokeWidth={1.7} />
              </div>
              <div>
                <p
                  className="text-[11px] tracking-[0.16em] uppercase font-medium mb-1.5"
                  style={{ color: "#2a1f12" }}
                >
                  {s.n}. {s.label}
                </p>
                <p
                  className="text-[13px] leading-[1.7]"
                  style={{
                    color: "#5a4a30",
                    fontFamily: '"Cormorant Garamond", Georgia, serif',
                  }}
                >
                  {s.text}
                </p>
              </div>
            </li>
          );
        })}
      </ol>
      <div
        className="mt-6 pt-5 flex gap-3"
        style={{ borderTop: "1px solid rgba(200, 154, 90, 0.22)" }}
      >
        <Sparkles
          size={14}
          strokeWidth={1.5}
          style={{ color: "#c89a5a" }}
          className="mt-1 flex-shrink-0"
        />
        <div>
          <p
            className="text-[10.5px] tracking-[0.22em] uppercase mb-1.5"
            style={{ color: "#c89a5a" }}
          >
            Remember
          </p>
          <p
            className="text-[13px] leading-[1.65] italic"
            style={{
              color: "#3d2f1f",
              fontFamily: '"Cormorant Garamond", Georgia, serif',
            }}
          >
            You are enough. You are doing your best, and that is enough.
          </p>
        </div>
      </div>
    </aside>
  );
}

function GraceProfileCard() {
  return (
    <Link
      to="/grace/room"
      data-testid="grace-profile-card"
      className="block rounded-2xl p-5 backdrop-blur-md transition-all hover:scale-[1.02] hover:shadow-lg"
      style={{
        background: "rgba(253, 246, 232, 0.78)",
        border: "1px solid rgba(200, 154, 90, 0.25)",
        boxShadow: "0 8px 28px -12px rgba(120, 85, 50, 0.2)",
        textDecoration: "none",
      }}
    >
      <div className="flex items-start gap-4">
        <div
          className="flex-shrink-0 w-14 h-14 rounded-full overflow-hidden"
          style={{
            border: "1.5px solid #c89a5a",
            boxShadow: "0 4px 14px -4px rgba(200, 154, 90, 0.6)",
          }}
          aria-hidden="true"
        >
          <img
            src="/avatars/grace.png"
            alt=""
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
        </div>
        <div className="flex-1">
          <p
            className="text-[20px] leading-tight mb-1"
            style={{
              color: "#2a1f12",
              fontFamily: '"Cormorant Garamond", Georgia, serif',
              fontWeight: 500,
            }}
          >
            Grace
          </p>
          <p
            className="text-[14px] leading-tight mb-2"
            style={{
              color: "#2a1f12",
              fontFamily: '"Cormorant Garamond", Georgia, serif',
              fontWeight: 500,
              fontStyle: "italic",
            }}
          >
            I am here to listen.
          </p>
          <ul
            className="text-[12.5px] leading-[1.7] mb-2 list-none space-y-0.5"
            style={{
              color: "#5a4a30",
              fontFamily: '"Cormorant Garamond", Georgia, serif',
            }}
          >
            <li>Speak when you need a voice.</li>
            <li>Write when you need space.</li>
            <li>Return whenever you wish.</li>
          </ul>
          <p
            className="text-[12px] leading-[1.65] italic"
            style={{
              color: "#7a5a26",
              fontFamily: '"Cormorant Garamond", Georgia, serif',
            }}
          >
            No pressure. No judgment. Just presence.
          </p>
        </div>
      </div>
    </Link>
  );
}

/* ───────────────────── RECENT NOTES (FULL-WIDTH) ───────────────────── */

function TodaysReflection() {
  // Deterministic day-of-year index so the line is stable within a day.
  const today = new Date();
  const start = new Date(today.getFullYear(), 0, 0);
  const diff = today - start;
  const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));
  const line = REFLECTIONS[dayOfYear % REFLECTIONS.length];

  return (
    <section
      data-testid="grace-todays-reflection"
      className="mt-10 rounded-2xl p-8 md:p-10 text-center backdrop-blur-md"
      style={{
        background: "rgba(253, 246, 232, 0.82)",
        border: "1px solid rgba(200, 154, 90, 0.25)",
        boxShadow: "0 12px 36px -16px rgba(120, 85, 50, 0.22)",
      }}
    >
      <p
        className="text-[11px] tracking-[0.28em] uppercase mb-5"
        style={{ color: "#c89a5a" }}
      >
        Today&apos;s Reflection
      </p>
      <p
        className="mx-auto max-w-[680px] leading-[1.5] italic"
        style={{
          color: "#2a1f12",
          fontFamily: '"Cormorant Garamond", Georgia, serif',
          fontSize: "clamp(1.4rem, 2.4vw, 1.9rem)",
        }}
      >
        “{line}”
      </p>
    </section>
  );
}

function WordsForYou() {
  return (
    <section
      data-testid="grace-words-for-you"
      className="mt-6 rounded-2xl p-6 md:p-8 backdrop-blur-md"
      style={{
        background: "rgba(253, 246, 232, 0.82)",
        border: "1px solid rgba(200, 154, 90, 0.25)",
        boxShadow: "0 12px 36px -16px rgba(120, 85, 50, 0.22)",
      }}
    >
      <div className="flex items-center gap-2 mb-6">
        <Sparkles size={14} strokeWidth={1.5} style={{ color: "#c89a5a" }} />
        <p
          className="text-[11px] tracking-[0.24em] uppercase"
          style={{ color: "#c89a5a" }}
        >
          Words For You
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {WORDS_FOR_YOU.map((w) => (
          <article
            key={w.id}
            data-testid={`grace-word-${w.id}`}
            className="rounded-xl p-5 text-center"
            style={{
              background: "rgba(255, 250, 240, 0.92)",
              border: "1px solid rgba(200, 154, 90, 0.2)",
              boxShadow: "0 6px 18px -10px rgba(120, 85, 50, 0.18)",
            }}
          >
            <p
              className="text-[15px] leading-[1.55] italic"
              style={{
                color: "#3d2f1f",
                fontFamily: '"Cormorant Garamond", Georgia, serif',
              }}
            >
              {w.text}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}

function RecentNotes() {
  return (
    <section
      className="mt-10 rounded-2xl p-6 md:p-8 backdrop-blur-md"
      style={{
        background: "rgba(253, 246, 232, 0.82)",
        border: "1px solid rgba(200, 154, 90, 0.25)",
        boxShadow: "0 12px 36px -16px rgba(120, 85, 50, 0.22)",
      }}
      data-testid="grace-recent-notes"
    >
      <div className="flex items-center gap-2 mb-6">
        <Sparkles size={14} strokeWidth={1.5} style={{ color: "#c89a5a" }} />
        <p
          className="text-[11px] tracking-[0.24em] uppercase"
          style={{ color: "#c89a5a" }}
        >
          Recent Notes
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {RECENT_NOTES.map((n) => (
          <article
            key={n.id}
            data-testid={`grace-note-${n.id}`}
            className="rounded-xl p-5 transition-all hover:scale-[1.02] cursor-pointer"
            style={{
              background: "rgba(255, 250, 240, 0.92)",
              border: "1px solid rgba(200, 154, 90, 0.2)",
              boxShadow: "0 6px 18px -10px rgba(120, 85, 50, 0.18)",
            }}
          >
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center mb-4 text-[16px]"
              style={{
                background: "rgba(200, 154, 90, 0.15)",
                color: "#c89a5a",
              }}
            >
              {n.icon}
            </div>
            <p
              className="text-[14px] leading-[1.7] mb-3"
              style={{
                color: "#3d2f1f",
                fontFamily: '"Cormorant Garamond", Georgia, serif',
              }}
            >
              {n.text}
            </p>
            <p
              className="text-[11px] tracking-[0.12em]"
              style={{ color: "#c89a5a" }}
            >
              {n.date}
            </p>
          </article>
        ))}
      </div>
      <div className="mt-6 text-center">
        <Link
          to="/grace/room#messages"
          data-testid="grace-view-all-notes"
          className="inline-flex items-center gap-2 text-[13px]"
          style={{
            color: "#c89a5a",
            fontFamily: '"Cormorant Garamond", Georgia, serif',
            fontStyle: "italic",
            textDecoration: "none",
          }}
        >
          View all notes <ArrowRight size={13} />
        </Link>
      </div>
    </section>
  );
}
