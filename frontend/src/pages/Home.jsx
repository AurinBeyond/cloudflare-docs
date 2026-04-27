import { Link } from "react-router-dom";
import { ArrowUpRight, BookOpen, Sparkles, Feather, UserRound } from "lucide-react";

/**
 * Home — refreshed copy ("Leave the noise. Find the Architect within.")
 *
 * Translated from the Estonian master text. The voice is intentionally
 * uneven — short sentences, line breaks where a person would breathe.
 * Nothing here is marketing copy.
 */

const LAYERS = [
  {
    to: "/library",
    label: "The Genesis Volumes",
    testid: "home-layer-library",
    title: "These are not just books.",
    blurb:
      "Quiet places where you start to see what is actually moving you. The first crack opens — inside the automatic.",
    icon: BookOpen,
  },
  {
    to: "/kids-universe",
    label: "Kids Universe",
    testid: "home-layer-kids",
    title: "A child does not need to be fixed to be whole.",
    blurb:
      "They need space where they are not interrupted. We don't teach them to be \"correct\" — we let them stay real.",
    icon: Sparkles,
  },
  {
    to: "/meditation-corner",
    label: "Meditation Corner",
    testid: "home-layer-meditation",
    title: "Silence is not an escape.",
    blurb:
      "It is the place where the noise stops working. And where you finally hear what you have always known.",
    icon: Feather,
  },
  {
    to: "/portal",
    label: "User Portal",
    testid: "home-layer-portal",
    title: "This is not just an account.",
    blurb:
      "It is the place you come back to when something starts to change. And where you don't have to begin from zero again.",
    icon: UserRound,
  },
];

const PRINCIPLES = [
  {
    n: "01",
    title: "Clarity over noise",
    body:
      "If something needs too much explaining, it isn't clear. We keep only what actually works.",
  },
  {
    n: "02",
    title: "Soul before pattern",
    body:
      "Inherited patterns are not the enemy. They are simply not the guide. Here you learn to feel that difference.",
  },
  {
    n: "03",
    title: "The body is the map",
    body:
      "The body does not get lost. It reacts before you understand. When you learn to listen, you no longer need to search.",
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
            prulesoul · Matrix Aurin
          </div>

          <h1
            className="aurin-display mt-7 text-5xl sm:text-6xl lg:text-[88px] max-w-[16ch] aurin-fade-up aurin-delay-1"
            data-testid="home-hero-title"
          >
            Leave the noise.{" "}
            <span className="aurin-serif-italic text-[hsl(var(--aurin-sage))]">
              Find the Architect
            </span>{" "}
            within.
          </h1>

          <p
            className="mt-8 max-w-[56ch] text-[15.5px] md:text-base leading-[1.75] text-[hsl(var(--aurin-text-muted))] aurin-fade-up aurin-delay-2"
            data-testid="home-hero-description"
          >
            Something inside you knows this is not the whole truth.
            <br />
            Not everything you live is your choice.
            <br />
            <br />
            This is the place where you begin to notice it — and from there,
            choose.
          </p>

          <div className="mt-10 flex flex-wrap items-center gap-4 aurin-fade-up aurin-delay-3">
            <Link
              to="/the-beginning"
              className="aurin-btn aurin-btn-primary"
              data-testid="home-cta-explore-library"
            >
              Begin gently
              <ArrowUpRight size={16} />
            </Link>
            <Link
              to="/aurin-philosophy"
              className="aurin-btn aurin-btn-ghost"
              data-testid="home-cta-meditation"
            >
              The philosophy
            </Link>
          </div>

          {/* Mini system map */}
          <div className="mt-20 md:mt-28 grid grid-cols-2 md:grid-cols-4 gap-px bg-[hsl(var(--aurin-border-soft))] border border-[hsl(var(--aurin-border-soft))] rounded-xl overflow-hidden aurin-fade-up aurin-delay-4">
            {[
              { k: "Doors", v: "Four" },
              { k: "Tone", v: "Calm" },
              { k: "Pace", v: "Slow" },
              { k: "Privacy", v: "Yours alone" },
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
              <div className="aurin-eyebrow mb-5">The doors</div>
              <h2
                className="aurin-display text-4xl md:text-5xl max-w-[20ch]"
                data-testid="home-system-title"
              >
                Four entries.{" "}
                <span className="aurin-serif-italic text-[hsl(var(--aurin-sand))]">
                  One quiet place.
                </span>
              </h2>
            </div>
            <p className="max-w-sm text-[15px] leading-relaxed text-[hsl(var(--aurin-text-muted))]">
              Each one has its own tone. None of them rush you. Walk through
              the one that calls.
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
                    <span>Enter</span>
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
            How this place{" "}
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
                <div className="aurin-eyebrow mb-5">A future layer</div>
                <h3 className="aurin-display text-3xl md:text-[40px] max-w-[26ch]">
                  Your digital mirror{" "}
                  <span className="aurin-serif-italic text-[hsl(var(--aurin-sage))]">
                    won't answer
                  </span>{" "}
                  — it will show.
                </h3>
                <p className="mt-5 text-[14.5px] leading-relaxed text-[hsl(var(--aurin-text-muted))] max-w-[58ch]">
                  It will not give you answers.
                  <br />
                  It will help you see what you already know — but have not yet
                  fully accepted.
                  <br />
                  <br />
                  Quiet. Precise. Yours alone.
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

      {/* FINAL CTA / CLOSING NOTE */}
      <section
        className="aurin-section-sm border-t border-[hsl(var(--aurin-border-soft))]"
        data-testid="home-final-note"
      >
        <div className="aurin-container max-w-[640px] text-center space-y-5">
          <p className="aurin-display text-2xl md:text-3xl leading-snug text-[hsl(var(--aurin-text))/0.94]">
            If you felt something —
            <br />
            <span className="aurin-serif-italic text-[hsl(var(--aurin-sage))]">
              you already know what to do.
            </span>
          </p>
          <p className="text-[14.5px] leading-relaxed text-[hsl(var(--aurin-text-muted))]">
            If not — don't force it.
            <br />
            You'll find your way back when the moment is right.
          </p>
        </div>
      </section>
    </div>
  );
}
