/**
 * AlistairSubPage.jsx — § ALISTAIR SUB-SURFACE WRAPPER 2026-02
 *
 * Identical chrome to GraceSubPage — only the sidebar items, the room
 * accent (slightly cooler honey-ink vs Grace's warm cream) and the
 * "back to home" link differ. Keeping it as a parallel component
 * (rather than refactoring GraceSubPage) means Grace stays untouched
 * while Alistair grows in its own file.
 *
 * Founder rule: same architecture as Grace, different soul.
 *   Grace    = emotional reflection (fireplace, evening warmth).
 *   Alistair = intellectual exploration (sunlit study, books).
 */
import { Link, useLocation } from "react-router-dom";
import {
  Home,
  Compass,
  BookOpen,
  FlaskConical,
  StickyNote,
  Library as LibraryIcon,
  Quote,
  ArrowLeft,
} from "lucide-react";

const SIDEBAR = [
  { id: "home",        label: "Home",        icon: Home,          href: "/course-room" },
  { id: "explore",     label: "Explore",     icon: Compass,       href: "/course-room/explore" },
  { id: "read",        label: "Read",        icon: BookOpen,      href: "/course-room/read" },
  { id: "experiments", label: "Experiments", icon: FlaskConical,  href: "/course-room/experiments" },
  { id: "notes",       label: "Notes",       icon: StickyNote,    href: "/course-room/notes" },
  { id: "library",     label: "Library",     icon: LibraryIcon,   href: "/course-room/library" },
];

export default function AlistairSubPage({
  testid,
  bgImage,
  eyebrow,
  title,
  intro,
  quote,
  children,
}) {
  const location = useLocation();
  return (
    <div
      data-testid={testid}
      className="relative min-h-screen w-full overflow-hidden"
      style={{ backgroundColor: "#f3ead9" }}
    >
      <div
        aria-hidden="true"
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: `url("${bgImage}")`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          filter: "blur(2px) brightness(0.96) saturate(0.98)",
        }}
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 z-0"
        style={{
          background:
            "linear-gradient(180deg, rgba(245,235,215,0.76) 0%, rgba(245,235,215,0.6) 35%, rgba(245,235,215,0.82) 100%)",
        }}
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 z-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 110% 90% at 50% 45%, transparent 35%, rgba(105, 72, 38, 0.18) 100%)",
        }}
      />

      <div className="relative z-[2] max-w-[1280px] mx-auto px-5 md:px-8 py-10 md:py-14">
        <div className="grid gap-6 lg:gap-8 grid-cols-1 lg:[grid-template-columns:minmax(220px,260px)_1fr]">
          <aside className="space-y-6">
            <Link
              to="/course-room"
              data-testid="alistair-sub-back-home"
              className="inline-flex items-center gap-2 text-[13px] no-underline transition-colors hover:opacity-80"
              style={{
                color: "#b07a3f",
                fontFamily: '"Cormorant Garamond", Georgia, serif',
                fontStyle: "italic",
              }}
            >
              <ArrowLeft size={14} /> Back to the Laboratory
            </Link>
            <nav
              className="rounded-2xl p-3 backdrop-blur-md"
              style={{
                background: "rgba(250, 242, 224, 0.78)",
                border: "1px solid rgba(176, 122, 63, 0.22)",
                boxShadow: "0 8px 28px -12px rgba(105, 72, 38, 0.2)",
              }}
              data-testid="alistair-sub-sidebar"
            >
              <ul className="space-y-1.5">
                {SIDEBAR.map((it) => {
                  const Icon = it.icon;
                  const active = location.pathname === it.href;
                  return (
                    <li key={it.id}>
                      <Link
                        to={it.href}
                        data-testid={`alistair-sub-sidebar-${it.id}`}
                        className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-[14px] transition-all text-left no-underline"
                        style={{
                          color: active ? "#2b1f0f" : "#5b4226",
                          background: active ? "rgba(176, 122, 63, 0.18)" : "transparent",
                          border: active ? "1px solid rgba(176, 122, 63, 0.42)" : "1px solid transparent",
                          fontFamily: '"Cormorant Garamond", Georgia, serif',
                          fontWeight: active ? 500 : 400,
                          textDecoration: "none",
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
            {quote && (
              <div
                className="rounded-2xl p-5 backdrop-blur-md"
                style={{
                  background: "rgba(250, 242, 224, 0.7)",
                  border: "1px solid rgba(176, 122, 63, 0.22)",
                  boxShadow: "0 8px 28px -12px rgba(105, 72, 38, 0.18)",
                }}
              >
                <Quote size={16} strokeWidth={1.5} style={{ color: "#b07a3f" }} className="mb-3" />
                <p
                  className="text-[14px] leading-[1.75] italic"
                  style={{ color: "#3d2c14", fontFamily: '"Cormorant Garamond", Georgia, serif' }}
                >
                  {quote}
                </p>
                <p className="mt-3 text-[11.5px] tracking-[0.18em] uppercase" style={{ color: "#b07a3f" }}>
                  — Alistair
                </p>
              </div>
            )}
          </aside>

          <section className="max-w-[760px]">
            <p
              className="text-[10.5px] tracking-[0.28em] uppercase mb-4"
              style={{ color: "#b07a3f" }}
              data-testid="alistair-sub-eyebrow"
            >
              {eyebrow}
            </p>
            <h1
              className="leading-[1.05] mb-5"
              style={{
                color: "#2b1f0f",
                fontFamily: '"Cormorant Garamond", Georgia, serif',
                fontWeight: 400,
                fontSize: "clamp(2.4rem, 4.2vw, 3.6rem)",
                letterSpacing: "-0.01em",
              }}
              data-testid="alistair-sub-title"
            >
              {title}
            </h1>
            <div
              aria-hidden="true"
              className="mb-7"
              style={{
                width: "100px",
                height: "1px",
                background: "linear-gradient(90deg, #b07a3f 0%, transparent 100%)",
              }}
            />
            {intro && (
              <p
                className="max-w-[620px] leading-[1.8] mb-10"
                style={{
                  color: "#3d2c14",
                  fontSize: "17px",
                  fontFamily: '"Cormorant Garamond", Georgia, serif',
                }}
                data-testid="alistair-sub-intro"
              >
                {intro}
              </p>
            )}
            {children}
          </section>
        </div>
      </div>
    </div>
  );
}

export function AlistairCard({ title, lines = [], testid, onClick, children }) {
  const Cmp = onClick ? "button" : "div";
  return (
    <Cmp
      type={onClick ? "button" : undefined}
      onClick={onClick}
      data-testid={testid}
      className="block w-full text-left rounded-2xl p-6 transition-all hover:scale-[1.015] hover:shadow-lg"
      style={{
        background: "rgba(252, 246, 232, 0.88)",
        border: "1px solid rgba(176, 122, 63, 0.25)",
        boxShadow: "0 6px 22px -12px rgba(105, 72, 38, 0.2)",
        cursor: onClick ? "pointer" : "default",
      }}
    >
      {title && (
        <p
          className="text-[18px] leading-tight mb-3"
          style={{
            color: "#2b1f0f",
            fontFamily: '"Cormorant Garamond", Georgia, serif',
            fontWeight: 500,
          }}
        >
          {title}
        </p>
      )}
      {lines.length > 0 && (
        <ul className="space-y-1.5">
          {lines.map((l, i) => (
            <li
              key={i}
              className="text-[14px] leading-[1.65]"
              style={{ color: "#5b4226", fontFamily: '"Cormorant Garamond", Georgia, serif' }}
            >
              {l}
            </li>
          ))}
        </ul>
      )}
      {children}
    </Cmp>
  );
}

export function AlistairSection({ label, children }) {
  return (
    <div className="mb-10">
      <p className="text-[10.5px] tracking-[0.24em] uppercase mb-5" style={{ color: "#b07a3f" }}>
        {label}
      </p>
      <div className="space-y-4">{children}</div>
    </div>
  );
}
