/**
 * Alistair.jsx — § ALISTAIR LIGHT-HOMEPAGE 2026-02
 *
 * Founder spec (Anna, Estonian session): Alistair Room is the
 * intellectual sibling of Grace. Same architecture, different soul.
 *   - sunlit study (not fireplace)
 *   - bright daylight (not warm evening)
 *   - curiosity (not reflection)
 *   - questions worth more than answers
 *
 * No Grace/Kids/Polarstar cross-references. The room is its own
 * world.
 */
import { Link } from "react-router-dom";
import {
  Home,
  Compass,
  BookOpen,
  FlaskConical,
  StickyNote,
  Library as LibraryIcon,
  Heart,
  ArrowRight,
  Quote,
  Sparkles,
  Microscope,
} from "lucide-react";

const BG_IMAGE = "/assets/alistair/alistair-light-bg.png";

const SIDEBAR = [
  { id: "home",        label: "Home",        icon: Home,         active: true, href: "/course-room",
    tooltip: "Back to the Laboratory front page. Where every exploration starts." },
  { id: "explore",     label: "Explore",     icon: Compass,      href: "/course-room/explore",
    tooltip: "Pick a collection and start tracing patterns across your own life." },
  { id: "read",        label: "Read",        icon: BookOpen,     href: "/course-room/read",
    tooltip: "Long-form reflections — slower reading, deeper thinking." },
  { id: "experiments", label: "Experiments", icon: FlaskConical, href: "/course-room/experiments",
    tooltip: "Small life experiments. Try one. Notice what happens. Learn." },
  { id: "notes",       label: "Notes",       icon: StickyNote,   href: "/course-room/notes",
    tooltip: "Your private observations, questions, patterns, insights." },
  { id: "library",     label: "Library",     icon: LibraryIcon,  href: "/course-room/library",
    tooltip: "A quiet shelf of thoughtful papers — five short pieces to read slowly." },
];

const HOW_STEPS = [
  { n: 1, label: "NOTICE",     icon: Sparkles,    text: "Begin by looking. Most patterns hide in plain sight until you slow down enough to see them." },
  { n: 2, label: "QUESTION",   icon: Compass,     text: "Ask the question underneath the question. The first one is usually a decoy." },
  { n: 3, label: "EXPLORE",    icon: BookOpen,    text: "Read what others have already noticed. You are rarely alone with a pattern." },
  { n: 4, label: "EXPERIMENT", icon: FlaskConical,text: "Test something small. A single day. A single conversation. Information beats opinion." },
  { n: 5, label: "RECORD",     icon: StickyNote,  text: "Write what you learned. The note you take today is the friend you'll meet next year." },
];

const RECENT_DISCOVERIES = [
  { id: 1, icon: "◇", text: "A pattern I noticed today", date: "Add your first observation" },
  { id: 2, icon: "◯", text: "A question I want to return to", date: "Save a question worth keeping" },
  { id: 3, icon: "✦", text: "A small experiment worth repeating", date: "Mark what worked" },
];

const THOUGHTS = [
  "A question held gently can change the way you see the day.",
  "Not every pattern needs to be broken. Some first need to be understood.",
  "The smallest observation can become the beginning of a new life.",
  "Before you react, notice what is asking to be seen.",
  "Sometimes clarity arrives after you stop forcing it.",
  "What you repeat may be trying to teach you something.",
  "A quiet experiment is often wiser than a loud decision.",
];

const WORDS = [
  { id: 1, text: "Notice before naming." },
  { id: 2, text: "Ask before assuming." },
  { id: 3, text: "Try something small." },
  { id: 4, text: "Let the pattern speak." },
];

export default function Alistair() {
  const beginExploring = () => {
    window.location.href = "/course-room/room";
  };

  return (
    <div
      data-testid="page-alistair"
      className="relative min-h-screen w-full overflow-hidden"
      style={{ backgroundColor: "#f3ead9" }}
    >
      <div aria-hidden="true" className="absolute inset-0 z-0"
        style={{ backgroundImage: `url("${BG_IMAGE}")`, backgroundSize: "cover", backgroundPosition: "center",
          filter: "blur(2px) brightness(0.96) saturate(0.98)" }} />
      <div aria-hidden="true" className="absolute inset-0 z-0"
        style={{ background:
          "linear-gradient(180deg, rgba(245,235,215,0.72) 0%, rgba(245,235,215,0.55) 35%, rgba(245,235,215,0.78) 100%)" }} />
      <div aria-hidden="true" className="absolute inset-0 z-0 pointer-events-none"
        style={{ background:
          "radial-gradient(ellipse 110% 90% at 50% 45%, transparent 35%, rgba(105, 72, 38, 0.18) 100%)" }} />

      <div className="relative z-[2] max-w-[1440px] mx-auto px-5 md:px-8 py-10 md:py-14">
        <div className="grid gap-6 lg:gap-8 grid-cols-1 lg:[grid-template-columns:minmax(220px,260px)_1fr_minmax(300px,360px)]">
          <aside className="space-y-6">
            <BrandCard />
            <SidebarNav />
            <PrincipleCard />
          </aside>

          <section data-testid="alistair-hero" className="flex flex-col items-center justify-center min-h-[640px] py-10 text-center">
            <Microscope size={28} strokeWidth={1.4} className="mb-6" style={{ color: "#b07a3f" }} />
            <h1 className="leading-[1.02] mb-6"
              style={{ color: "#2b1f0f", fontFamily: '"Cormorant Garamond", Georgia, serif',
                fontWeight: 400, fontSize: "clamp(3rem, 6.5vw, 5.4rem)", letterSpacing: "-0.01em" }}
              data-testid="alistair-hero-title"
            >
              Welcome to the<br />Laboratory of Life<span style={{ color: "#b07a3f" }}>.</span>
            </h1>
            <div aria-hidden="true" className="mx-auto mb-7"
              style={{ width: "120px", height: "1px",
                background: "linear-gradient(90deg, transparent, #b07a3f, transparent)" }} />
            <p className="max-w-[440px] leading-[1.75] mb-9"
              style={{ color: "#3d2c14", fontSize: "18px", fontFamily: '"Cormorant Garamond", Georgia, serif' }}
              data-testid="alistair-hero-subtitle"
            >
              Not everything needs an answer.<br />
              Some things need exploration.
            </p>
            <button type="button" onClick={beginExploring}
              data-testid="alistair-primary-cta"
              className="inline-flex items-center gap-3 px-8 py-4 rounded-full text-[15px] transition-all hover:scale-[1.03] hover:shadow-xl"
              style={{
                background: "#b07a3f", color: "#fdf6e6",
                fontFamily: '"Cormorant Garamond", Georgia, serif',
                fontWeight: 500, letterSpacing: "0.02em",
                boxShadow: "0 10px 32px -10px rgba(176, 122, 63, 0.7)",
              }}
            >
              Begin Exploring
              <Compass size={16} strokeWidth={1.8} />
            </button>
          </section>

          <aside className="space-y-6">
            <HowExplorationWorks />
            <AlistairProfileCard />
          </aside>
        </div>

        <TodaysThought />
        <WordsToConsider />
        <RecentDiscoveries />
      </div>
    </div>
  );
}

function BrandCard() {
  return (
    <div className="rounded-2xl p-5 backdrop-blur-md"
      style={{ background: "rgba(250, 242, 224, 0.72)", border: "1px solid rgba(176, 122, 63, 0.25)",
        boxShadow: "0 8px 28px -12px rgba(105, 72, 38, 0.18)" }}
      data-testid="alistair-brand-card">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center"
          style={{ border: "1.5px solid #b07a3f",
            background: "radial-gradient(circle at 35% 30%, rgba(255,236,200,1), rgba(216,178,128,1))",
            color: "#5b4226", fontFamily: '"Cormorant Garamond", Georgia, serif',
            fontSize: "20px", fontWeight: 500 }} aria-hidden="true">A</div>
        <div>
          <p className="text-[22px] leading-tight mb-1"
            style={{ color: "#2b1f0f", fontFamily: '"Cormorant Garamond", Georgia, serif', fontWeight: 500 }}>
            Alistair
          </p>
          <p className="text-[10.5px] tracking-[0.28em] uppercase" style={{ color: "#b07a3f" }}>
            L A B O R A T O R Y &nbsp; O F &nbsp; L I F E
          </p>
        </div>
      </div>
      <p className="mt-4 text-[13px] leading-[1.7]"
        style={{ color: "#5b4226", fontFamily: '"Cormorant Garamond", Georgia, serif', fontStyle: "italic" }}>
        A place to study your own life — gently, curiously, honestly.
      </p>
    </div>
  );
}

function SidebarNav() {
  return (
    <nav className="rounded-2xl p-3 backdrop-blur-md"
      style={{ background: "rgba(250, 242, 224, 0.78)", border: "1px solid rgba(176, 122, 63, 0.22)",
        boxShadow: "0 8px 28px -12px rgba(105, 72, 38, 0.18)" }}
      data-testid="alistair-sidebar">
      <ul className="space-y-1.5">
        {SIDEBAR.map((it) => {
          const Icon = it.icon;
          return (
            <li key={it.id}>
              <Link to={it.href} title={it.tooltip} aria-label={`${it.label} — ${it.tooltip}`}
                data-testid={`alistair-sidebar-${it.id}`}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-[14px] transition-all text-left no-underline ${
                  it.active ? "" : "hover:bg-[rgba(176,122,63,0.12)]"
                }`}
                style={{
                  color: it.active ? "#2b1f0f" : "#5b4226",
                  background: it.active ? "rgba(176, 122, 63, 0.18)" : "transparent",
                  border: it.active ? "1px solid rgba(176, 122, 63, 0.42)" : "1px solid transparent",
                  fontFamily: '"Cormorant Garamond", Georgia, serif',
                  fontWeight: it.active ? 500 : 400, letterSpacing: "0.01em", textDecoration: "none",
                }}
              >
                <Icon size={16} strokeWidth={1.5} />
                <span>{it.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

function PrincipleCard() {
  return (
    <div className="rounded-2xl p-5 backdrop-blur-md"
      style={{ background: "rgba(250, 242, 224, 0.7)", border: "1px solid rgba(176, 122, 63, 0.22)",
        boxShadow: "0 8px 28px -12px rgba(105, 72, 38, 0.18)" }}
      data-testid="alistair-principle">
      <Quote size={16} strokeWidth={1.5} style={{ color: "#b07a3f" }} className="mb-3" />
      <p className="text-[14px] leading-[1.75] italic"
        style={{ color: "#3d2c14", fontFamily: '"Cormorant Garamond", Georgia, serif' }}>
        Questions are often more valuable than answers.
      </p>
      <p className="mt-3 text-[11.5px] tracking-[0.18em] uppercase" style={{ color: "#b07a3f" }}>
        — Alistair
      </p>
    </div>
  );
}

function HowExplorationWorks() {
  return (
    <aside className="rounded-2xl p-6 backdrop-blur-md"
      style={{ background: "rgba(250, 242, 224, 0.82)", border: "1px solid rgba(176, 122, 63, 0.25)",
        boxShadow: "0 8px 28px -12px rgba(105, 72, 38, 0.2)" }}
      data-testid="alistair-how-it-works">
      <p className="text-[10.5px] tracking-[0.24em] uppercase mb-5" style={{ color: "#b07a3f" }}>
        Today: How Exploration Works
      </p>
      <ol className="space-y-5">
        {HOW_STEPS.map((s) => {
          const Icon = s.icon;
          return (
            <li key={s.n} className="flex gap-3.5" data-testid={`alistair-step-${s.n}`}>
              <div className="flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center"
                style={{ background: "rgba(176, 122, 63, 0.16)", border: "1px solid rgba(176, 122, 63, 0.45)",
                  color: "#b07a3f" }}>
                <Icon size={15} strokeWidth={1.7} />
              </div>
              <div>
                <p className="text-[11px] tracking-[0.16em] uppercase font-medium mb-1.5"
                  style={{ color: "#2b1f0f" }}>{s.n}. {s.label}</p>
                <p className="text-[13px] leading-[1.7]"
                  style={{ color: "#5b4226", fontFamily: '"Cormorant Garamond", Georgia, serif' }}>{s.text}</p>
              </div>
            </li>
          );
        })}
      </ol>
      <div className="mt-6 pt-5 flex gap-3" style={{ borderTop: "1px solid rgba(176, 122, 63, 0.22)" }}>
        <Heart size={14} strokeWidth={1.5} style={{ color: "#b07a3f" }} className="mt-1 flex-shrink-0" />
        <div>
          <p className="text-[10.5px] tracking-[0.22em] uppercase mb-1.5" style={{ color: "#b07a3f" }}>
            Remember
          </p>
          <p className="text-[13px] leading-[1.65] italic"
            style={{ color: "#3d2c14", fontFamily: '"Cormorant Garamond", Georgia, serif' }}>
            You are not behind. You are simply paying attention now.
          </p>
        </div>
      </div>
    </aside>
  );
}

function AlistairProfileCard() {
  return (
    <Link to="/course-room/room" data-testid="alistair-profile-card"
      className="block rounded-2xl p-5 backdrop-blur-md transition-all hover:scale-[1.02] hover:shadow-lg"
      style={{ background: "rgba(250, 242, 224, 0.78)", border: "1px solid rgba(176, 122, 63, 0.25)",
        boxShadow: "0 8px 28px -12px rgba(105, 72, 38, 0.2)", textDecoration: "none" }}>
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 w-14 h-14 rounded-full overflow-hidden"
          style={{ border: "1.5px solid #b07a3f",
            boxShadow: "0 4px 14px -4px rgba(176, 122, 63, 0.6)" }} aria-hidden="true">
          <img src="/avatars/alistair.png" alt="" className="w-full h-full object-cover"
            onError={(e) => { e.currentTarget.style.display = "none"; }} />
        </div>
        <div className="flex-1">
          <p className="text-[20px] leading-tight mb-1"
            style={{ color: "#2b1f0f", fontFamily: '"Cormorant Garamond", Georgia, serif', fontWeight: 500 }}>
            Alistair
          </p>
          <p className="text-[14px] leading-tight mb-2"
            style={{ color: "#2b1f0f", fontFamily: '"Cormorant Garamond", Georgia, serif',
              fontWeight: 500, fontStyle: "italic" }}>
            I explore patterns.
          </p>
          <ul className="text-[12.5px] leading-[1.7] mb-2 list-none space-y-0.5"
            style={{ color: "#5b4226", fontFamily: '"Cormorant Garamond", Georgia, serif' }}>
            <li>I notice connections.</li>
            <li>I help people think more clearly.</li>
          </ul>
          <p className="text-[12px] leading-[1.65] italic"
            style={{ color: "#7a5a26", fontFamily: '"Cormorant Garamond", Georgia, serif' }}>
            Meet Alistair when you are ready.
          </p>
        </div>
      </div>
    </Link>
  );
}

function TodaysThought() {
  const today = new Date();
  const start = new Date(today.getFullYear(), 0, 0);
  const dayOfYear = Math.floor((today - start) / 86400000);
  const line = THOUGHTS[dayOfYear % THOUGHTS.length];

  return (
    <section data-testid="alistair-todays-thought"
      className="mt-10 rounded-2xl p-8 md:p-10 text-center backdrop-blur-md"
      style={{ background: "rgba(250, 242, 224, 0.82)", border: "1px solid rgba(176, 122, 63, 0.25)",
        boxShadow: "0 12px 36px -16px rgba(105, 72, 38, 0.22)" }}>
      <p className="text-[11px] tracking-[0.28em] uppercase mb-5" style={{ color: "#b07a3f" }}>
        Today&apos;s Thought
      </p>
      <p className="mx-auto max-w-[680px] leading-[1.5] italic"
        style={{ color: "#2b1f0f", fontFamily: '"Cormorant Garamond", Georgia, serif',
          fontSize: "clamp(1.4rem, 2.4vw, 1.9rem)" }}>
        “{line}”
      </p>
    </section>
  );
}

function WordsToConsider() {
  return (
    <section data-testid="alistair-words-to-consider"
      className="mt-6 rounded-2xl p-6 md:p-8 backdrop-blur-md"
      style={{ background: "rgba(250, 242, 224, 0.82)", border: "1px solid rgba(176, 122, 63, 0.25)",
        boxShadow: "0 12px 36px -16px rgba(105, 72, 38, 0.22)" }}>
      <div className="flex items-center gap-2 mb-6">
        <Sparkles size={14} strokeWidth={1.5} style={{ color: "#b07a3f" }} />
        <p className="text-[11px] tracking-[0.24em] uppercase" style={{ color: "#b07a3f" }}>
          Words To Consider
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {WORDS.map((w) => (
          <article key={w.id} data-testid={`alistair-word-${w.id}`}
            className="rounded-xl p-5 text-center"
            style={{ background: "rgba(252, 246, 232, 0.92)", border: "1px solid rgba(176, 122, 63, 0.2)",
              boxShadow: "0 6px 18px -10px rgba(105, 72, 38, 0.18)" }}>
            <p className="text-[15px] leading-[1.55] italic"
              style={{ color: "#3d2c14", fontFamily: '"Cormorant Garamond", Georgia, serif' }}>
              {w.text}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}

function RecentDiscoveries() {
  return (
    <section data-testid="alistair-recent-discoveries"
      className="mt-6 rounded-2xl p-6 md:p-8 backdrop-blur-md"
      style={{ background: "rgba(250, 242, 224, 0.82)", border: "1px solid rgba(176, 122, 63, 0.25)",
        boxShadow: "0 12px 36px -16px rgba(105, 72, 38, 0.22)" }}>
      <div className="flex items-center gap-2 mb-6">
        <Compass size={14} strokeWidth={1.5} style={{ color: "#b07a3f" }} />
        <p className="text-[11px] tracking-[0.24em] uppercase" style={{ color: "#b07a3f" }}>
          Recent Discoveries
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {RECENT_DISCOVERIES.map((n) => (
          <article key={n.id} data-testid={`alistair-discovery-${n.id}`}
            className="rounded-xl p-5 transition-all hover:scale-[1.02] cursor-pointer"
            style={{ background: "rgba(252, 246, 232, 0.92)", border: "1px solid rgba(176, 122, 63, 0.2)",
              boxShadow: "0 6px 18px -10px rgba(105, 72, 38, 0.18)" }}>
            <div className="w-9 h-9 rounded-full flex items-center justify-center mb-4 text-[16px]"
              style={{ background: "rgba(176, 122, 63, 0.15)", color: "#b07a3f" }}>{n.icon}</div>
            <p className="text-[14px] leading-[1.7] mb-3"
              style={{ color: "#3d2c14", fontFamily: '"Cormorant Garamond", Georgia, serif' }}>{n.text}</p>
            <p className="text-[11px] tracking-[0.12em]" style={{ color: "#b07a3f" }}>{n.date}</p>
          </article>
        ))}
      </div>
      <div className="mt-6 text-center">
        <Link to="/course-room/notes" data-testid="alistair-view-all-notes"
          className="inline-flex items-center gap-2 text-[13px]"
          style={{ color: "#b07a3f", fontFamily: '"Cormorant Garamond", Georgia, serif',
            fontStyle: "italic", textDecoration: "none" }}>
          View all discoveries <ArrowRight size={13} />
        </Link>
      </div>
    </section>
  );
}
