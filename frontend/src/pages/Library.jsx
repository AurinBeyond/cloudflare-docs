import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import PageHeader from "@/components/layout/PageHeader";
import {
  Search,
  BookOpen,
  FileText,
  Headphones,
  Film,
  Lock,
  CheckCircle2,
  FileIcon,
  Sparkles,
} from "lucide-react";
import { fetchEntries } from "@/lib/api";

const kindMeta = {
  book: { icon: BookOpen, label: "Book" },
  protocol: { icon: FileText, label: "Protocol" },
  audio: { icon: Headphones, label: "Audio" },
  video: { icon: Film, label: "Video" },
  article: { icon: FileIcon, label: "Article" },
  story: { icon: Sparkles, label: "Story" },
};

const AUDIENCES = [
  { key: "all", label: "All" },
  { key: "grown-ups", label: "Grown-ups" },
  { key: "kids-universe", label: "Kids Universe" },
  { key: "reflections", label: "Reflections" },
];

export default function Library() {
  const [entries, setEntries] = useState([]);
  const [audience, setAudience] = useState("all");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        const ents = await fetchEntries({ surface: "library" });
        if (!alive) return;
        setEntries(ents);
      } catch {
        if (alive) setError("Could not load the library. Please try again.");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const filtered = useMemo(() => {
    return entries
      .filter((e) =>
        audience === "all" ? true : (e.audience || "grown-ups") === audience
      )
      .filter((e) =>
        query.trim() === ""
          ? true
          : `${e.title} ${e.description || ""}`
              .toLowerCase()
              .includes(query.toLowerCase())
      );
  }, [entries, audience, query]);

  return (
    <div data-testid="page-library">
      <PageHeader
        tone="library"
        eyebrow="Library · Free Knowledge Hub"
        title="A central hub for"
        italicWord="structured knowledge."
        description="Free reading material, protocols, and reflections — organised by audience. Books for purchase live in the Bookstore."
      />

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

          <div className="flex items-center gap-2 flex-wrap" data-testid="library-filter-tabs">
            {AUDIENCES.map((a) => (
              <FilterTab
                key={a.key}
                active={audience === a.key}
                onClick={() => setAudience(a.key)}
                testid={`library-filter-${a.key}`}
              >
                {a.label}
              </FilterTab>
            ))}
          </div>
        </div>
      </section>

      <section className="aurin-section-sm">
        <div className="aurin-container">
          {loading && (
            <div data-testid="library-loading" className="py-20 text-center text-[hsl(var(--aurin-text-muted))]">
              Loading the library…
            </div>
          )}

          {error && !loading && (
            <div data-testid="library-error" className="py-20 text-center text-[hsl(var(--aurin-text-muted))]">
              {error}
            </div>
          )}

          {!loading && !error && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5" data-testid="library-grid">
              {filtered.map((item) => {
                const meta = kindMeta[item.kind] || kindMeta.article;
                const Icon = meta.icon;
                const isFree = item.access === "free";
                return (
                  <Link
                    to={`/library/${item.slug}`}
                    key={item.id}
                    data-testid={`library-item-${item.slug}`}
                    className="aurin-card p-7 flex flex-col h-full group"
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
                        data-testid={`library-item-${item.slug}-access`}
                      >
                        {isFree ? <CheckCircle2 size={12} /> : <Lock size={11} />}
                        {isFree ? "Free" : "Member"}
                      </span>
                    </div>

                    <h3 className="aurin-display text-2xl mt-7 leading-[1.15] group-hover:text-[hsl(var(--aurin-sage))] transition-colors">
                      {item.title}
                    </h3>
                    {item.description && (
                      <p className="mt-3 text-[14px] leading-relaxed text-[hsl(var(--aurin-text-muted))]">
                        {item.description}
                      </p>
                    )}

                    <div className="mt-7 pt-5 border-t border-[hsl(var(--aurin-border-soft))] flex items-center justify-between text-[12.5px] text-[hsl(var(--aurin-text-muted))]">
                      <span>{(item.audience || "grown-ups").replace("-", " ")}</span>
                      <span>{item.sections?.length || 0} sections</span>
                    </div>

                    <div className="mt-5 text-[13px] text-[hsl(var(--aurin-text))] group-hover:text-[hsl(var(--aurin-sage))] transition-colors">
                      Open →
                    </div>
                  </Link>
                );
              })}
            </div>
          )}

          {!loading && !error && filtered.length === 0 && (
            <div data-testid="library-empty" className="text-center py-20 text-[hsl(var(--aurin-text-muted))]">
              Nothing matches this view yet. Try another audience.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function FilterTab({ active, onClick, testid, children }) {
  return (
    <button
      data-testid={testid}
      onClick={onClick}
      className={`text-[13px] rounded-full px-4 py-2 border transition-colors ${
        active
          ? "bg-[hsl(var(--aurin-text))] text-[hsl(var(--aurin-bg))] border-[hsl(var(--aurin-text))]"
          : "border-[hsl(var(--aurin-border))] text-[hsl(var(--aurin-text))/0.85] hover:border-[hsl(var(--aurin-sage))] hover:text-[hsl(var(--aurin-sage))]"
      }`}
    >
      {children}
    </button>
  );
}
