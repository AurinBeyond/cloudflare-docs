import PageHeader from "@/components/layout/PageHeader";
import { Sprout, Heart, ShieldCheck, BookHeart } from "lucide-react";

const WORLDS = [
  {
    title: "Little Explorers",
    age: "Ages 4–6",
    description:
      "Short, gentle stories and sound journeys. Focused on curiosity, kindness, and noticing the world.",
    icon: Sprout,
  },
  {
    title: "Quiet Seekers",
    age: "Ages 7–9",
    description:
      "Guided reflections, slow stories, and simple practices that build patience and attention.",
    icon: BookHeart,
  },
  {
    title: "Growing Minds",
    age: "Ages 10–12",
    description:
      "Deeper themes — emotions, values, and thinking clearly. Structured but still calm and safe.",
    icon: Heart,
  },
];

const PARENT_NOTES = [
  {
    title: "Safe by design",
    body: "No advertising, no tracking of children, no open feeds. Just curated material.",
  },
  {
    title: "Calm pace",
    body: "Short sessions. No hooks, no streaks. Nothing is designed to keep a child scrolling.",
  },
  {
    title: "With you, not around you",
    body: "Parents are guides. Each world offers companion notes to open small conversations.",
  },
];

export default function KidsUniverse() {
  return (
    <div data-testid="page-kids">
      <PageHeader
        tone="kids"
        eyebrow="Kids Universe · A Softer Layer"
        title="A safe, gentle place for"
        italicWord="young minds."
        description="Kids Universe is the calmest corner of Matrix Aurin — designed to feel warm for children and trustworthy for parents. No noise, no chaos. Just short stories, quiet practices, and thoughtful worlds to grow into."
      >
        <div className="flex flex-wrap items-center gap-3">
          <span className="aurin-chip" data-testid="kids-safe-chip">
            <ShieldCheck size={12} /> No ads · No tracking
          </span>
          <span className="aurin-chip" data-testid="kids-parent-chip">
            Built with parents in mind
          </span>
        </div>
      </PageHeader>

      {/* WORLDS */}
      <section className="aurin-section-sm">
        <div className="aurin-container">
          <div className="aurin-eyebrow mb-5">Three Worlds</div>
          <h2 className="aurin-display text-3xl md:text-4xl max-w-[24ch] mb-14">
            A world for every{" "}
            <span className="aurin-serif-italic" style={{ color: "#E3B48C" }}>
              stage of wonder.
            </span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {WORLDS.map((w, i) => {
              const Icon = w.icon;
              return (
                <div
                  key={w.title}
                  data-testid={`kids-world-${i}`}
                  className="aurin-card p-8 relative overflow-hidden"
                >
                  <div
                    className="absolute -top-10 -right-10 w-40 h-40 rounded-full opacity-25 blur-2xl"
                    style={{ background: i % 2 === 0 ? "#A8C09A" : "#E3B48C" }}
                  />
                  <div className="relative">
                    <div className="w-11 h-11 rounded-full border border-[hsl(var(--aurin-border))] flex items-center justify-center text-[hsl(var(--aurin-sage))]">
                      <Icon size={18} strokeWidth={1.4} />
                    </div>
                    <div className="mt-7 text-[11px] uppercase tracking-[0.22em] text-[hsl(var(--aurin-text-muted))]">
                      {w.age}
                    </div>
                    <h3 className="aurin-display text-2xl mt-2">{w.title}</h3>
                    <p className="mt-4 text-[14px] leading-relaxed text-[hsl(var(--aurin-text-muted))]">
                      {w.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* FOR PARENTS */}
      <section className="aurin-section-sm border-t border-[hsl(var(--aurin-border-soft))]">
        <div className="aurin-container grid grid-cols-1 md:grid-cols-12 gap-12">
          <div className="md:col-span-5">
            <div className="aurin-eyebrow mb-5">For Parents</div>
            <h2 className="aurin-display text-3xl md:text-4xl max-w-[18ch]">
              Trust is built in the{" "}
              <span
                className="aurin-serif-italic"
                style={{ color: "hsl(var(--aurin-sage))" }}
              >
                details.
              </span>
            </h2>
            <p className="mt-6 text-[15px] leading-relaxed text-[hsl(var(--aurin-text-muted))] max-w-sm">
              Kids Universe follows the same structured logic as the rest of
              Matrix Aurin — a little warmer, a little softer, but never
              chaotic.
            </p>
          </div>
          <div className="md:col-span-7 grid grid-cols-1 gap-px bg-[hsl(var(--aurin-border-soft))] border border-[hsl(var(--aurin-border-soft))] rounded-xl overflow-hidden">
            {PARENT_NOTES.map((n, i) => (
              <div
                key={n.title}
                data-testid={`kids-parent-note-${i}`}
                className="bg-[hsl(var(--aurin-bg))] p-7"
              >
                <h3 className="aurin-display text-xl">{n.title}</h3>
                <p className="mt-3 text-[14px] leading-relaxed text-[hsl(var(--aurin-text-muted))]">
                  {n.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
