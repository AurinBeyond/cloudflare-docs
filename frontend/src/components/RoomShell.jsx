/**
 * RoomShell.jsx — § ROOM SHELL 2026-02
 *
 * Mockup-driven layout for Grace & Alistair rooms. Three-column grid:
 *   [ left sidebar 220px ]  [ centre hero ]  [ right panel 340px ]
 * + curator card bottom-right, principle panel bottom-left.
 *
 * Background atmosphere is CSS-only for now (rich radial gradient +
 * grain + glow). Replace with Nano-Banana-generated cinematic image
 * later — only this component's `<RoomHeroBackdrop />` needs to change.
 *
 * Founder mockup spec: 2026-02 (Estonian session).
 */
import { Link } from "react-router-dom";
import {
  Home, Mic, Pen, Moon, MessageSquare,
  TreePine, BookOpen, User, Grid3x3,
  Lightbulb, Eye, FlaskConical, Compass,
  ArrowRight, Quote,
} from "lucide-react";

const ICONS = {
  home: Home, mic: Mic, pen: Pen, moon: Moon, messages: MessageSquare,
  tree: TreePine, book: BookOpen, user: User, grid: Grid3x3,
  bulb: Lightbulb, eye: Eye, flask: FlaskConical, compass: Compass,
};

function IconFor({ name, size = 16, ...rest }) {
  const Cmp = ICONS[name] || Home;
  return <Cmp size={size} strokeWidth={1.5} {...rest} />;
}

/* ----------------------------- BACKDROP ----------------------------- */
function RoomHeroBackdrop({ mood }) {
  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 overflow-hidden pointer-events-none"
      style={{
        background: mood.bg,
        backgroundImage: mood.bgGradient,
      }}
    >
      {/* Atmosphere: warm glow */}
      <div
        className="absolute"
        style={{
          right: "18%", top: "35%",
          width: "520px", height: "520px",
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(214, 165, 96, 0.22) 0%, transparent 65%)",
          filter: "blur(40px)",
        }}
      />
      {/* Grain layer */}
      <div
        className="absolute inset-0 opacity-30 mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)' opacity='0.42'/></svg>\")",
        }}
      />
    </div>
  );
}

/* ----------------------------- SIDEBAR ------------------------------ */
function Sidebar({ items, mood, testidRoot }) {
  return (
    <nav
      className="rounded-2xl p-3 self-start"
      style={{
        background: mood.sidebarBg,
        border: `1px solid ${mood.panelBorder}`,
        backdropFilter: "blur(8px)",
      }}
      data-testid={`${testidRoot}-sidebar`}
    >
      <ul className="space-y-1">
        {items.map((it, i) => {
          const isFirst = i === 0;
          return (
            <li key={it.id}>
              <a
                href={it.href}
                data-testid={`${testidRoot}-sidebar-${it.id}`}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13.5px] transition-all`}
                style={{
                  color: isFirst ? mood.text : mood.textMute,
                  background: isFirst
                    ? "rgba(214, 165, 96, 0.1)"
                    : "transparent",
                  border: isFirst
                    ? `1px solid ${mood.panelBorder}`
                    : "1px solid transparent",
                  letterSpacing: "0.01em",
                }}
              >
                <IconFor name={it.icon} size={15} />
                <span>{it.label}</span>
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

/* --------------------------- RIGHT PANEL ---------------------------- */
function RightPanel({ panel, mood, testidRoot }) {
  return (
    <aside
      className="rounded-2xl p-6 self-start"
      style={{
        background: mood.panelBg,
        border: `1px solid ${mood.panelBorder}`,
        backdropFilter: "blur(10px)",
      }}
      data-testid={`${testidRoot}-right-panel`}
    >
      <p
        className="text-[10.5px] tracking-[0.22em] uppercase mb-6"
        style={{ color: mood.panelTextMute }}
      >
        {panel.title}
      </p>
      <ol className="space-y-5">
        {panel.steps.map((s) => (
          <li key={s.n} className="flex gap-3.5">
            <div
              className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-semibold"
              style={{
                background: "rgba(214, 165, 96, 0.18)",
                color: mood.accent,
                border: `1px solid ${mood.panelBorder}`,
              }}
            >
              {s.n}
            </div>
            <div>
              <div
                className="flex items-center gap-2 mb-1.5"
                style={{ color: mood.panelText }}
              >
                <IconFor name={s.icon} size={14} />
                <span className="text-[12px] tracking-[0.16em] uppercase font-medium">
                  {s.label}
                </span>
              </div>
              <p
                className="text-[13.5px] leading-[1.65]"
                style={{ color: mood.panelTextMute }}
              >
                {s.text}
              </p>
            </div>
          </li>
        ))}
      </ol>

      {panel.footnote && (
        <div
          className="mt-6 pt-5 border-t flex gap-3"
          style={{ borderColor: mood.panelBorder }}
        >
          <Compass size={14} strokeWidth={1.5} style={{ color: mood.accent }} className="mt-1 flex-shrink-0" />
          <div>
            <p
              className="text-[10.5px] tracking-[0.22em] uppercase mb-1.5"
              style={{ color: mood.panelTextMute }}
            >
              {panel.footnote.title}
            </p>
            <p
              className="text-[13px] leading-[1.65]"
              style={{ color: mood.panelText, fontStyle: "italic" }}
            >
              {panel.footnote.body}
            </p>
          </div>
        </div>
      )}
    </aside>
  );
}

/* --------------------------- CURATOR CARD --------------------------- */
function CuratorCard({ card, mood, testidRoot }) {
  return (
    <div
      className="flex items-start gap-4 rounded-2xl p-5"
      style={{
        background: mood.panelBg,
        border: `1px solid ${mood.panelBorder}`,
        backdropFilter: "blur(10px)",
        maxWidth: "360px",
      }}
      data-testid={`${testidRoot}-curator`}
    >
      {/* Monogram avatar — to be replaced with real portrait later */}
      <div
        className="flex-shrink-0 w-14 h-14 rounded-full flex items-center justify-center text-2xl"
        style={{
          background:
            "radial-gradient(circle at 35% 30%, rgba(214, 165, 96, 0.5), rgba(123, 78, 28, 0.85))",
          border: `1.5px solid ${mood.accent}`,
          color: "#1c1208",
          fontFamily: '"Cormorant Garamond", Georgia, serif',
          fontWeight: 500,
          letterSpacing: "0.02em",
        }}
        aria-hidden="true"
      >
        {card.initial}
      </div>
      <div className="flex-1">
        <p
          className="text-[18px] mb-0.5"
          style={{
            color: mood.panelText,
            fontFamily: '"Cormorant Garamond", Georgia, serif',
            fontWeight: 500,
          }}
        >
          {card.name}
        </p>
        <p
          className="text-[11px] tracking-[0.12em] uppercase mb-3"
          style={{ color: mood.panelTextMute }}
        >
          {card.role}
        </p>
        <p
          className="text-[13px] italic leading-relaxed"
          style={{ color: mood.panelText }}
        >
          {card.line}
        </p>
      </div>
    </div>
  );
}

/* ------------------------- PRINCIPLE PANEL -------------------------- */
function PrinciplePanel({ principle, mood, testidRoot }) {
  return (
    <div
      className="rounded-2xl p-5"
      style={{
        background: mood.sidebarBg,
        border: `1px solid ${mood.panelBorder}`,
        backdropFilter: "blur(10px)",
        maxWidth: "300px",
      }}
      data-testid={`${testidRoot}-principle`}
    >
      <Quote size={14} strokeWidth={1.5} style={{ color: mood.accent }} className="mb-3" />
      <p
        className="text-[11px] tracking-[0.22em] uppercase mb-2.5"
        style={{ color: mood.textMute }}
      >
        {principle.title}
      </p>
      <p
        className="text-[14px] leading-[1.7] italic"
        style={{
          color: mood.text,
          fontFamily: '"Cormorant Garamond", Georgia, serif',
        }}
      >
        {principle.body}
      </p>
    </div>
  );
}

/* ----------------------------- ROOM SHELL --------------------------- */
export default function RoomShell({ room, children }) {
  const m = room.mood;
  const testidRoot = `room-shell-${room.id}`;

  return (
    <div className="relative w-full" data-testid={testidRoot}>
      {/* Hero band — mockup layout */}
      <section
        className="relative overflow-hidden"
        style={{ minHeight: "780px" }}
      >
        <RoomHeroBackdrop mood={m} />

        {/* Three-column grid */}
        <div
          className="relative grid gap-6 px-5 md:px-8 py-10 md:py-14 max-w-[1480px] mx-auto"
          style={{
            gridTemplateColumns: "minmax(220px, 240px) 1fr minmax(320px, 380px)",
          }}
        >
          {/* LEFT — sidebar + principle */}
          <div className="space-y-6">
            <Sidebar items={room.sidebar} mood={m} testidRoot={testidRoot} />
            <PrinciplePanel principle={room.principle} mood={m} testidRoot={testidRoot} />
          </div>

          {/* CENTRE — title + subtitle + primary CTA + quote */}
          <div className="flex flex-col justify-between min-h-[640px] px-2 md:px-6">
            <div>
              <p
                className="text-[11px] tracking-[0.28em] uppercase mb-5"
                style={{ color: m.accent, letterSpacing: "0.28em" }}
                data-testid={`${testidRoot}-eyebrow`}
              >
                {room.curator} · {room.roomName}
              </p>

              {/* If a hero photograph is provided in roomConfig, paint
                  it full-bleed with a deep gradient overlay; the title
                  and subtitle then sit OVER the photo. Else fall back to
                  the plain title/subtitle layout below. */}
              {room.heroImage ? (
                <div
                  className="relative rounded-2xl overflow-hidden mb-8"
                  style={{
                    boxShadow: `0 20px 60px -20px ${m.accent}22`,
                  }}
                  data-testid={`${testidRoot}-hero-image`}
                >
                  <img
                    src={room.heroImage}
                    alt={room.heroImageAlt || ""}
                    className="w-full h-[320px] md:h-[440px] object-cover"
                  />
                  <div
                    className="absolute inset-0"
                    style={{
                      background:
                        `linear-gradient(to top, ${m.bg} 0%, ${m.bg}66 45%, transparent 85%)`,
                    }}
                  />
                  <div className="absolute bottom-0 left-0 right-0 p-7 md:p-10">
                    <h1
                      className="leading-[1.05] mb-3"
                      style={{
                        color: m.text,
                        fontFamily: '"Cormorant Garamond", Georgia, serif',
                        fontWeight: 400,
                        fontSize: "clamp(2.2rem, 4.2vw, 3.4rem)",
                      }}
                      data-testid={`${testidRoot}-title`}
                    >
                      {room.hero.title}
                    </h1>
                    <p
                      className="text-[15px] md:text-[17px] leading-[1.7] max-w-[520px]"
                      style={{ color: m.textMute }}
                      data-testid={`${testidRoot}-subtitle`}
                    >
                      {room.hero.subtitle}
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  <h1
                    className="leading-[1.04] mb-7"
                    style={{
                      color: m.text,
                      fontFamily: '"Cormorant Garamond", Georgia, serif',
                      fontWeight: 400,
                      fontSize: "clamp(2.6rem, 5vw, 4.2rem)",
                    }}
                    data-testid={`${testidRoot}-title`}
                  >
                    {room.hero.title}
                  </h1>
                  <p
                    className="text-[17px] md:text-[18px] leading-[1.75] max-w-[560px] mb-9"
                    style={{ color: m.textMute }}
                    data-testid={`${testidRoot}-subtitle`}
                  >
                    {room.hero.subtitle}
                  </p>
                </>
              )}

              {room.hero.primary && (
                <a
                  href={room.hero.primary.href}
                  data-testid={`${testidRoot}-primary-cta`}
                  className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-full text-[14px] transition-all hover:scale-[1.02]"
                  style={{
                    background: m.accent,
                    color: "#1c1208",
                    fontWeight: 500,
                    letterSpacing: "0.04em",
                    boxShadow: `0 8px 28px -10px ${m.accent}80`,
                  }}
                >
                  {room.hero.primary.label}
                  <ArrowRight size={14} strokeWidth={1.7} />
                </a>
              )}
            </div>

            {/* Curator quote in the centre column lower area */}
            {room.hero.quote && (
              <div
                className="mt-12 max-w-[480px]"
                data-testid={`${testidRoot}-hero-quote`}
              >
                <p
                  className="text-[19px] leading-[1.55] italic mb-2"
                  style={{
                    color: m.text,
                    fontFamily: '"Cormorant Garamond", Georgia, serif',
                  }}
                >
                  "{room.hero.quote}"
                </p>
                <p className="text-[12px]" style={{ color: m.textMute }}>
                  — {room.hero.quoteBy}
                </p>
              </div>
            )}
          </div>

          {/* RIGHT — panel + curator */}
          <div className="space-y-6">
            <RightPanel panel={room.rightPanel} mood={m} testidRoot={testidRoot} />
            <CuratorCard card={room.curatorCard} mood={m} testidRoot={testidRoot} />
          </div>
        </div>

        {/* Notes Left By The Fire — Atomsi reflection cards. Rendered
            inside the hero band (still on dark backdrop) when the
            roomConfig provides a `notes` block. */}
        {room.notes && (
          <div className="relative max-w-[1480px] mx-auto px-5 md:px-8 pb-14">
            <h3
              className="text-[18px] md:text-[20px] mb-6"
              style={{
                color: m.accent2 || m.accent,
                fontFamily: '"Cormorant Garamond", Georgia, serif',
                fontWeight: 500,
              }}
              data-testid={`${testidRoot}-notes-title`}
            >
              {room.notes.title}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {room.notes.cards.map((note) => (
                <div
                  key={note.id}
                  data-testid={`${testidRoot}-note-${note.id}`}
                  className="p-5 rounded-xl transition-all duration-500"
                  style={{
                    background: m.panelBg,
                    border: `1px solid ${m.panelBorder}`,
                    backdropFilter: "blur(8px)",
                  }}
                >
                  <p
                    className="text-[14px] italic leading-relaxed mb-3"
                    style={{
                      color: m.text,
                      fontFamily: '"Cormorant Garamond", Georgia, serif',
                    }}
                  >
                    "{note.text}"
                  </p>
                  <p
                    className="text-[11px] tracking-[0.14em] uppercase"
                    style={{ color: m.textMute, opacity: 0.7 }}
                  >
                    {note.meta}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* CHILDREN — the existing room body (RoomIntroCard, FirstActionBlock,
          chat, courses, etc.) renders below the hero shell, untouched. */}
      <div className="relative">{children}</div>
    </div>
  );
}
