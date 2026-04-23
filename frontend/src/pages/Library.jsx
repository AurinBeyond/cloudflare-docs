import { useState, useMemo } from "react";
import PageHeader from "@/components/layout/PageHeader";
import { Search, BookOpen, FileText, Headphones, Film, Lock, CheckCircle2 } from "lucide-react";

const CATEGORIES = [
  { key: "all", label: "All" },
  { key: "book", label: "Books & PDFs" },
  { key: "protocol", label: "Interactive Protocols" },
  { key: "audio", label: "Audio" },
  { key: "video", label: "Video" },
];

const ITEMS = [
  {
    id: "gp-01",
    type: "book",
    title: "The Genesis Protocols — Volume I",
    subtitle: "Foundations of Self-Mastery",
    format: "Digital Book · PDF",
    access: "free",
    pages: 142,
  },
  {
    id: "gp-02",
    type: "protocol",
    title: "Morning Orientation Protocol",
    subtitle: "A 7-step text-based guide",
    format: "Interactive · Markdown",
    access: "free",
    pages: 7,
  },
  {
    id: "gp-03",
    type: "audio",
    title: "Silent Return — Meditation Series 01",
    subtitle: "Guided meditation, 22 minutes",
    format: "Audio · 22m",
    access: "paid",
    pages: null,
  },
  {
    id: "gp-04",
    type: "video",
    title: "Systems Ethics — Introductory Lecture",
    subtitle: "Educational video snippet",
    format: "Video · 14m",
    access: "paid",
    pages: null,
  },
  {
    id: "gp-05",
    type: "book",
    title: "The Genesis Protocols — Volume II",
    subtitle: "Patterns, Practice, Presence",
    format: "Digital Book · PDF",
    access: "paid",
    pages: 198,
  },
  {
    id: "gp-06",
    type: "protocol",
    title: "Evening Reflection Protocol",
    subtitle: "Slow structured review",
    format: "Interactive · Markdown",
    access: "free",
    pages: 5,
  },
  {
    id: "gp-07",
    type: "audio",
    title: "Deep Focus Soundscape",
    subtitle: "Ambient, 45 minutes",
    format: "Audio · 45m",
    access: "paid",
    pages: null,
  },
  {
    id: "gp-08",
    type: "video",
    title: "On Attention — Short Lecture",
    subtitle: "Educational video snippet",
    format: "Video · 9m",
    access: "free",
    pages: null,
  },
];

const typeMeta = {
  book: { icon: BookOpen, label: "Book" },
  protocol: { icon: FileText, label: "Protocol" },
  audio: { icon: Headphones, label: "Audio" },
  video: { icon: Film, label: "Video" },
};

export default function Library() {
  const [cat, setCat] = useState("all");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    return ITEMS.filter((i) => (cat === "all" ? true : i.type === cat)).filter(
      (i) =>
        query.trim() === ""
          ? true
          : `${i.title} ${i.subtitle}`.toLowerCase().includes(query.toLowerCase())
    );
  }, [cat, query]);

  return (
    <div data-testid="page-library">
      <PageHeader
        tone="library"
        eyebrow="Library · The Genesis Protocols"
        title="A central hub for"
        italicWord="structured knowledge."
        description="Digital books, interactive protocols, audio and visual materials. Browse by format, look up by title, and open what feels right for this moment. Free material lives next to member-only content — the system is transparent about what you can access."
      />

      {/* CONTROLS */}
      <section className="border-b border-[hsl(var(--aurin-border-soft))]">
        <div className="aurin-container py-7 flex flex-col md:flex-row md:items-center gap-5 md:gap-8">
          <div
            className="flex items-center gap-2 w-full md:max-w-sm rounded-full border border-[hsl(var(--aurin-border))] px-4 py-2.5"
            data-testid="library-search-wrap"
          >
            <Search size={15} className="text-[hsl(var(--aurin-text-muted))]" />
            <input
              data-testid="library-search-input"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search the library…"
              className="bg-transparent outline-none text-sm placeholder:text-[hsl(var(--aurin-text-muted))] w-full"
            />
          </div>

          <div
            className="flex items-center gap-2 flex-wrap"
            data-testid="library-filter-tabs"
          >
            {CATEGORIES.map((c) => {
              const active = cat === c.key;
              return (
                <button
                  key={c.key}
                  data-testid={`library-filter-${c.key}`}
                  onClick={() => setCat(c.key)}
                  className={`text-[13px] rounded-full px-4 py-2 border transition-colors ${
                    active
                      ? "bg-[hsl(var(--aurin-text))] text-[hsl(var(--aurin-bg))] border-[hsl(var(--aurin-text))]"
                      : "border-[hsl(var(--aurin-border))] text-[hsl(var(--aurin-text))/0.85] hover:border-[hsl(var(--aurin-sage))] hover:text-[hsl(var(--aurin-sage))]"
                  }`}
                >
                  {c.label}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* GRID */}
      <section className="aurin-section-sm">
        <div className="aurin-container">
          <div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
            data-testid="library-grid"
          >
            {filtered.map((item) => {
              const meta = typeMeta[item.type];
              const Icon = meta.icon;
              const isFree = item.access === "free";
              return (
                <article
                  key={item.id}
                  data-testid={`library-item-${item.id}`}
                  className="aurin-card p-7 flex flex-col h-full"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-[hsl(var(--aurin-text-muted))]">
                      <Icon size={15} strokeWidth={1.5} />
                      <span className="text-[11px] uppercase tracking-[0.2em]">
                        {meta.label}
                      </span>
                    </div>
                    <span
                      className={`inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.18em] px-2.5 py-1 rounded-full border ${
                        isFree
                          ? "border-[hsl(var(--aurin-sage))/0.4] text-[hsl(var(--aurin-sage))]"
                          : "border-[hsl(var(--aurin-sand))/0.4] text-[hsl(var(--aurin-sand))]"
                      }`}
                      data-testid={`library-item-${item.id}-access`}
                    >
                      {isFree ? <CheckCircle2 size={12} /> : <Lock size={11} />}
                      {isFree ? "Free" : "Member"}
                    </span>
                  </div>

                  <h3 className="aurin-display text-2xl mt-7 leading-[1.15]">
                    {item.title}
                  </h3>
                  <p className="mt-3 text-[14px] leading-relaxed text-[hsl(var(--aurin-text-muted))]">
                    {item.subtitle}
                  </p>

                  <div className="mt-7 pt-5 border-t border-[hsl(var(--aurin-border-soft))] flex items-center justify-between text-[12.5px] text-[hsl(var(--aurin-text-muted))]">
                    <span>{item.format}</span>
                    {item.pages ? <span>{item.pages} pages</span> : <span>—</span>}
                  </div>

                  <button
                    data-testid={`library-item-${item.id}-open`}
                    className="mt-6 text-[13px] text-[hsl(var(--aurin-text))] hover:text-[hsl(var(--aurin-sage))] transition-colors text-left"
                  >
                    {isFree ? "Open →" : "View access →"}
                  </button>
                </article>
              );
            })}
          </div>

          {filtered.length === 0 && (
            <div
              data-testid="library-empty"
              className="text-center py-20 text-[hsl(var(--aurin-text-muted))]"
            >
              Nothing matches this view yet. Try another category.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
