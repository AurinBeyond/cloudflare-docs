import { Link } from "react-router-dom";
import PageHeader from "@/components/layout/PageHeader";
import { Sprout, Heart, BookHeart, ShieldCheck, Wand2 } from "lucide-react";

const AGE_GROUPS = [
  {
    slug: "3-5",
    title: "Little Explorers",
    age: "Ages 3–5",
    description: "Short, gentle stories and sound journeys. Curiosity, kindness, and noticing the world.",
    icon: Sprout,
  },
  {
    slug: "6-8",
    title: "Quiet Seekers",
    age: "Ages 6–8",
    description: "Guided reflections, slow stories, and simple practices that build patience and attention.",
    icon: BookHeart,
  },
  {
    slug: "9-12",
    title: "Growing Minds",
    age: "Ages 9–12",
    description: "Deeper themes — emotions, values, thinking clearly. Structured but still calm and safe.",
    icon: Heart,
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
        description="The calmest corner of Matrix Aurin — designed to feel warm for children and trustworthy for parents. No noise, no chaos. Stories, gentle practices, and a small creative studio for quiet drawing."
      >
        <div className="flex flex-wrap items-center gap-3">
          <span className="aurin-chip" data-testid="kids-safe-chip">
            <ShieldCheck size={12} /> No ads · No tracking · No 18+ gate
          </span>
          <span className="aurin-chip" data-testid="kids-parent-chip">
            Built with parents in mind
          </span>
        </div>
      </PageHeader>

      {/* Age groups */}
      <section className="aurin-section-sm">
        <div className="aurin-container">
          <div className="aurin-eyebrow mb-5">Age groups</div>
          <h2 className="aurin-display text-3xl md:text-4xl max-w-[24ch] mb-14">
            A world for every{" "}
            <span className="aurin-serif-italic" style={{ color: "#E3B48C" }}>
              stage of wonder.
            </span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {AGE_GROUPS.map((g, i) => {
              const Icon = g.icon;
              return (
                <div
                  key={g.slug}
                  data-testid={`kids-age-${g.slug}`}
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
                      {g.age}
                    </div>
                    <h3 className="aurin-display text-2xl mt-2">{g.title}</h3>
                    <p className="mt-4 text-[14px] leading-relaxed text-[hsl(var(--aurin-text-muted))]">
                      {g.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* AI Creative Studio (placeholder) */}
      <section className="aurin-section-sm border-t border-[hsl(var(--aurin-border-soft))]">
        <div className="aurin-container grid grid-cols-1 md:grid-cols-12 gap-10 items-center">
          <div className="md:col-span-7">
            <div className="aurin-eyebrow mb-4 flex items-center gap-2">
              <Wand2 size={12} /> Coloring Studio · Coming soon
            </div>
            <h2 className="aurin-display text-3xl md:text-4xl max-w-[22ch]">
              Read a story.{" "}
              <span className="aurin-serif-italic text-[hsl(var(--aurin-sage))]">
                Make it a coloring page.
              </span>
            </h2>
            <p className="mt-5 text-[14.5px] leading-relaxed text-[hsl(var(--aurin-text-muted))] max-w-[58ch]">
              Children will be able to type a small idea — a fox, a quiet room, a
              kite — and the studio will prepare a calm line drawing to colour.
              For now the studio is a structured placeholder that demonstrates
              the experience without generating real images.
            </p>
            <Link
              to="/kids-universe/coloring"
              data-testid="kids-coloring-cta"
              className="aurin-btn aurin-btn-primary mt-6"
            >
              Open the Coloring Studio
            </Link>
          </div>
          <div className="md:col-span-5">
            <div
              className="aurin-card aspect-[4/3] flex items-center justify-center"
              style={{
                background:
                  "radial-gradient(circle at 30% 30%, hsl(var(--aurin-sage) / 0.18), transparent 60%), hsl(var(--aurin-surface))",
              }}
            >
              <div className="aurin-display text-[hsl(var(--aurin-text))/0.85] text-2xl text-center px-8">
                A quiet, placeholder<br />
                <span className="aurin-serif-italic text-[hsl(var(--aurin-sage))]">drawing room.</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
