/**
 * GraceSubPage.jsx — § GRACE SUB-SURFACE WRAPPER 2026-02
 *
 * Shared chrome for every Grace inner surface (Speak / Write / Evening
 * Reflection / My Messages). Same warm cream + sidebar feel as the
 * Grace homepage, only with a section-specific Nano Banana background
 * and one focused content column.
 *
 * Founder rule: NO Kids / Aurin / Polarstar references. NO mixed
 * languages. NO global room nav (filtered by Navigation.jsx).
 */
import { Link, useLocation } from "react-router-dom";
import {
  Home,
  Mic,
  Pen,
  Moon,
  MessageSquare,
  BookOpen,
  Quote,
  ArrowLeft,
} from "lucide-react";

const SIDEBAR = [
  { id: "home",     label: "Home",               icon: Home,           href: "/grace" },
  { id: "speak",    label: "Speak",              icon: Mic,            href: "/grace/speak" },
  { id: "write",    label: "Write",              icon: Pen,            href: "/grace/write" },
  { id: "evening",  label: "Evening reflection", icon: Moon,           href: "/grace/evening" },
  { id: "messages", label: "My messages",        icon: MessageSquare,  href: "/grace/messages" },
  { id: "library",  label: "Library",            icon: BookOpen,       href: "/grace/library" },
];

export default function GraceSubPage({
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
      style={{ backgroundColor: "#f6efe4" }}
    >
      {/* Decorative Nano-Banana background */}
      <div
        aria-hidden="true"
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: `url("${bgImage}")`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          filter: "blur(2px) brightness(0.94) saturate(0.96)",
        }}
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 z-0"
        style={{
          background:
            "linear-gradient(180deg, rgba(248,240,225,0.78) 0%, rgba(248,240,225,0.62) 35%, rgba(248,240,225,0.82) 100%)",
        }}
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 z-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 110% 90% at 50% 45%, transparent 35%, rgba(120, 85, 50, 0.18) 100%)",
        }}
      />

      <div className="relative z-[2] max-w-[1280px] mx-auto px-5 md:px-8 py-10 md:py-14">
        <div className="grid gap-6 lg:gap-8 grid-cols-1 lg:[grid-template-columns:minmax(220px,260px)_1fr]">
          {/* ───── LEFT SIDEBAR ───── */}
          <aside className="space-y-6">
            <Link
              to="/grace"
              data-testid="grace-sub-back-home"
              className="inline-flex items-center gap-2 text-[13px] no-underline transition-colors hover:opacity-80"
              style={{
                color: "#c89a5a",
                fontFamily: '"Cormorant Garamond", Georgia, serif',
                fontStyle: "italic",
              }}
            >
              <ArrowLeft size={14} /> Back to Grace Room
            </Link>

            <nav
              className="rounded-2xl p-3 backdrop-blur-md"
              style={{
                background: "rgba(253, 246, 232, 0.78)",
                border: "1px solid rgba(200, 154, 90, 0.22)",
                boxShadow: "0 8px 28px -12px rgba(120, 85, 50, 0.18)",
              }}
              data-testid="grace-sub-sidebar"
            >
              <ul className="space-y-1.5">
                {SIDEBAR.map((it) => {
                  const Icon = it.icon;
                  const active = location.pathname === it.href;
                  return (
                    <li key={it.id}>
                      <Link
                        to={it.href}
                        data-testid={`grace-sub-sidebar-${it.id}`}
                        className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-[14px] transition-all text-left no-underline"
                        style={{
                          color: active ? "#2a1f12" : "#5a4a30",
                          background: active
                            ? "rgba(200, 154, 90, 0.18)"
                            : "transparent",
                          border: active
                            ? "1px solid rgba(200, 154, 90, 0.4)"
                            : "1px solid transparent",
                          fontFamily:
                            '"Cormorant Garamond", Georgia, serif',
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
                  background: "rgba(253, 246, 232, 0.7)",
                  border: "1px solid rgba(200, 154, 90, 0.22)",
                  boxShadow: "0 8px 28px -12px rgba(120, 85, 50, 0.18)",
                }}
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
                    fontFamily:
                      '"Cormorant Garamond", Georgia, serif',
                  }}
                >
                  {quote}
                </p>
                <p
                  className="mt-3 text-[11.5px] tracking-[0.18em] uppercase"
                  style={{ color: "#c89a5a" }}
                >
                  — Grace
                </p>
              </div>
            )}
          </aside>

          {/* ───── MAIN CONTENT ───── */}
          <section className="max-w-[760px]">
            <p
              className="text-[10.5px] tracking-[0.28em] uppercase mb-4"
              style={{ color: "#c89a5a" }}
              data-testid="grace-sub-eyebrow"
            >
              {eyebrow}
            </p>
            <h1
              className="leading-[1.05] mb-5"
              style={{
                color: "#2a1f12",
                fontFamily: '"Cormorant Garamond", Georgia, serif',
                fontWeight: 400,
                fontSize: "clamp(2.4rem, 4.2vw, 3.6rem)",
                letterSpacing: "-0.01em",
              }}
              data-testid="grace-sub-title"
            >
              {title}
            </h1>
            <div
              aria-hidden="true"
              className="mb-7"
              style={{
                width: "100px",
                height: "1px",
                background:
                  "linear-gradient(90deg, #c89a5a 0%, transparent 100%)",
              }}
            />
            {intro && (
              <p
                className="max-w-[620px] leading-[1.8] mb-10"
                style={{
                  color: "#3d2f1f",
                  fontSize: "17px",
                  fontFamily: '"Cormorant Garamond", Georgia, serif',
                }}
                data-testid="grace-sub-intro"
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

/* Reusable card primitives for sub-pages */
export function GraceCard({ title, lines = [], testid, onClick, children }) {
  const Cmp = onClick ? "button" : "div";
  return (
    <Cmp
      type={onClick ? "button" : undefined}
      onClick={onClick}
      data-testid={testid}
      className="block w-full text-left rounded-2xl p-6 transition-all hover:scale-[1.015] hover:shadow-lg"
      style={{
        background: "rgba(255, 250, 240, 0.88)",
        border: "1px solid rgba(200, 154, 90, 0.25)",
        boxShadow: "0 6px 22px -12px rgba(120, 85, 50, 0.2)",
        cursor: onClick ? "pointer" : "default",
      }}
    >
      {title && (
        <p
          className="text-[18px] leading-tight mb-3"
          style={{
            color: "#2a1f12",
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
              style={{
                color: "#5a4a30",
                fontFamily:
                  '"Cormorant Garamond", Georgia, serif',
              }}
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

/* Section header used between groups of cards */
export function GraceSection({ label, children }) {
  return (
    <div className="mb-10">
      <p
        className="text-[10.5px] tracking-[0.24em] uppercase mb-5"
        style={{ color: "#c89a5a" }}
      >
        {label}
      </p>
      <div className="space-y-4">{children}</div>
    </div>
  );
}
