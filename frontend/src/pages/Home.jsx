import { Link } from "react-router-dom";
import { ArrowUpRight, BookOpen, Sparkles, Feather, UserRound } from "lucide-react";

const LAYERS = [
  {
    to: "/library",
    label: "Library",
    testid: "home-layer-library",
    title: "The Genesis Protocols",
    blurb:
      "Structured digital books, interactive protocols, and audio-visual material for self-mastery.",
    icon: BookOpen,
  },
  {
    to: "/kids-universe",
    label: "Kids Universe",
    testid: "home-layer-kids",
    title: "A safe, guided world",
    blurb:
      "A softer, warmer layer — built for curiosity, emotional grounding, and gentle learning.",
    icon: Sparkles,
  },
  {
    to: "/meditation-corner",
    label: "Meditation Corner",
    testid: "home-layer-meditation",
    title: "Quiet, by design",
    blurb:
      "A spacious room to slow down. Focus on breath, presence, and a clearer mind.",
    icon: Feather,
  },
  {
    to: "/portal",
    label: "User Portal",
    testid: "home-layer-portal",
    title: "Your personal access",
    blurb:
      "Your own area — content, progress, and account. A structured place that stays yours.",
    icon: UserRound,
  },
];

const PRINCIPLES = [
  {
    n: "01",
    title: "Clarity over decoration",
    body: "Every element earns its place. Nothing is here to impress — only to guide.",
  },
  {
    n: "02",
    title: "Structured, not random",
    body: "Each page has a clear role. The system moves you forward on purpose.",
  },
  {
    n: "03",
    title: "Calm as a method",
    body: "Slower rhythm. Deeper thinking. A quieter interface for harder questions.",
  },
];

export default function Home() {
  return (
    <div data-testid="page-home">
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 aurin-grid-bg opacity-[0.22]" />
        <div className="absolute inset-0 aurin-glow" />
        <div className="aurin-container relative pt-24 md:pt-36 pb-24 md:pb-32">
          <div className="aurin-eyebrow aurin-fade-up" data-testid="home-eyebrow">
            Matrix Aurin · A Guided Environment
          </div>

          <h1
            className="aurin-display mt-7 text-5xl sm:text-6xl lg:text-[88px] max-w-[16ch] aurin-fade-up aurin-delay-1"
            data-testid="home-hero-title"
          >
            A quiet place to{" "}
            <span className="aurin-serif-italic text-[hsl(var(--aurin-sage))]">
              remember
            </span>{" "}
            who you are.
          </h1>

          <p
            className="mt-8 max-w-[56ch] text-[15.5px] md:text-base leading-[1.75] text-[hsl(var(--aurin-text-muted))] aurin-fade-up aurin-delay-2"
            data-testid="home-hero-description"
          >
            Matrix Aurin is a structured digital environment for self-mastery,
            guided learning, and reflection. Not a feed. Not a blog. A
            layered, calm space where every section has a purpose — and every
            step forward is intentional.
          </p>

          <div className="mt-10 flex flex-wrap items-center gap-4 aurin-fade-up aurin-delay-3">
            <Link
              to="/library"
              className="aurin-btn aurin-btn-primary"
              data-testid="home-cta-explore-library"
            >
              Enter the Library
              <ArrowUpRight size={16} />
            </Link>
            <Link
              to="/meditation-corner"
              className="aurin-btn aurin-btn-ghost"
              data-testid="home-cta-meditation"
            >
              Step into Meditation
            </Link>
          </div>

          {/* Mini system map */}
          <div className="mt-20 md:mt-28 grid grid-cols-2 md:grid-cols-4 gap-px bg-[hsl(var(--aurin-border-soft))] border border-[hsl(var(--aurin-border-soft))] rounded-xl overflow-hidden aurin-fade-up aurin-delay-4">
            {[
              { k: "Layers", v: "4" },
              { k: "Philosophy", v: "Calm" },
              { k: "Pace", v: "Slow" },
              { k: "Future", v: "Guided by AI" },
            ].map((s) => (
              <div
                key={s.k}
                className="bg-[hsl(var(--aurin-bg))] px-6 py-7"
                data-testid={`home-stat-${s.k.toLowerCase()}`}
              >
                <div className="text-[11px] uppercase tracking-[0.22em] text-[hsl(var(--aurin-text-muted))]">
                  {s.k}
                </div>
                <div className="mt-2 aurin-display text-2xl md:text-3xl">
                  {s.v}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* LAYERS / SYSTEM MAP */}
      <section className="aurin-section border-t border-[hsl(var(--aurin-border-soft))]">
        <div className="aurin-container">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-16">
            <div>
              <div className="aurin-eyebrow mb-5">The System</div>
              <h2
                className="aurin-display text-4xl md:text-5xl max-w-[20ch]"
                data-testid="home-system-title"
              >
                Four layers.{" "}
                <span className="aurin-serif-italic text-[hsl(var(--aurin-sand))]">
                  One calm system.
                </span>
              </h2>
            </div>
            <p className="max-w-sm text-[15px] leading-relaxed text-[hsl(var(--aurin-text-muted))]">
              Each layer is distinct in tone — but part of the same, unified
              environment. Move slowly. Return often.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {LAYERS.map((layer, i) => {
              const Icon = layer.icon;
              return (
                <Link
                  key={layer.to}
                  to={layer.to}
                  data-testid={layer.testid}
                  className="aurin-card p-8 md:p-10 group relative"
                >
                  <div className="flex items-start justify-between gap-6">
                    <div>
                      <div className="aurin-eyebrow mb-4">0{i + 1} · {layer.label}</div>
                      <h3 className="aurin-display text-[26px] md:text-3xl max-w-[20ch]">
                        {layer.title}
                      </h3>
                      <p className="mt-4 text-[14.5px] leading-relaxed text-[hsl(var(--aurin-text-muted))] max-w-[44ch]">
                        {layer.blurb}
                      </p>
                    </div>
                    <div className="w-11 h-11 shrink-0 rounded-full border border-[hsl(var(--aurin-border))] flex items-center justify-center text-[hsl(var(--aurin-text-muted))] group-hover:border-[hsl(var(--aurin-sage))] group-hover:text-[hsl(var(--aurin-sage))] transition-colors">
                      <Icon size={18} strokeWidth={1.4} />
                    </div>
                  </div>
                  <div className="mt-10 flex items-center gap-2 text-[13px] text-[hsl(var(--aurin-text))/0.85] group-hover:text-[hsl(var(--aurin-sage))] transition-colors">
                    <span>Enter {layer.label.toLowerCase()}</span>
                    <ArrowUpRight size={14} />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* PRINCIPLES */}
      <section className="aurin-section-sm border-t border-[hsl(var(--aurin-border-soft))]">
        <div className="aurin-container">
          <div className="aurin-eyebrow mb-6">Principles</div>
          <h2 className="aurin-display text-3xl md:text-4xl max-w-[24ch] mb-16">
            How the environment{" "}
            <span className="aurin-serif-italic text-[hsl(var(--aurin-sage))]">
              behaves.
            </span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-16">
            {PRINCIPLES.map((p) => (
              <div
                key={p.n}
                data-testid={`home-principle-${p.n}`}
                className="border-t border-[hsl(var(--aurin-border-soft))] pt-6"
              >
                <div className="text-[12px] tracking-[0.2em] text-[hsl(var(--aurin-text-muted))]">
                  — {p.n}
                </div>
                <h3 className="aurin-display text-2xl mt-3">{p.title}</h3>
                <p className="mt-4 text-[14.5px] leading-relaxed text-[hsl(var(--aurin-text-muted))]">
                  {p.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FUTURE AI FOOTNOTE */}
      <section className="aurin-section-sm border-t border-[hsl(var(--aurin-border-soft))]">
        <div className="aurin-container">
          <div className="aurin-card p-10 md:p-14 relative overflow-hidden">
            <div className="absolute -right-24 -top-24 w-72 h-72 rounded-full bg-[hsl(var(--aurin-sage))/0.07] blur-3xl" />
            <div className="relative grid grid-cols-1 md:grid-cols-12 gap-8 items-end">
              <div className="md:col-span-8">
                <div className="aurin-eyebrow mb-5">Future Layer</div>
                <h3 className="aurin-display text-3xl md:text-[40px] max-w-[26ch]">
                  A guided{" "}
                  <span className="aurin-serif-italic text-[hsl(var(--aurin-sage))]">
                    AI companion
                  </span>{" "}
                  will live here — quiet, helpful, and patient.
                </h3>
                <p className="mt-5 text-[14.5px] leading-relaxed text-[hsl(var(--aurin-text-muted))] max-w-[58ch]">
                  Not yet built. The structure is ready for it. When the time
                  is right, the assistant will help you navigate the layers,
                  understand the content, and choose the next step — without
                  ever getting in the way.
                </p>
              </div>
              <div className="md:col-span-4 md:text-right">
                <span className="aurin-chip" data-testid="home-ai-status">
                  · Prepared · Not yet active
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
