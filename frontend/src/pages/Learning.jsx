import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import PageHeader from "@/components/layout/PageHeader";
import { ArrowUpRight, Layers } from "lucide-react";
import { fetchCategories, fetchEntries } from "@/lib/api";

export default function Learning() {
  const [categories, setCategories] = useState([]);
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const [cats, ents] = await Promise.all([
          fetchCategories("learning"),
          fetchEntries({ surface: "learning" }),
        ]);
        if (!alive) return;
        setCategories(cats);
        setEntries(ents);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  return (
    <div data-testid="page-learning">
      <PageHeader
        tone="default"
        eyebrow="Learning · Quiet readings"
        title="Step forward,"
        italicWord="one piece at a time."
        description="A small shelf of slow readings. Take what speaks. Skip what does not. Nothing here is in a hurry."
      />

      <section className="aurin-section-sm">
        <div className="aurin-container">
          {loading ? (
            <div data-testid="learning-loading" className="py-20 text-center text-[hsl(var(--aurin-text-muted))]">
              A small breath…
            </div>
          ) : (
            <div className="space-y-16" data-testid="learning-groups">
              {categories.map((cat) => {
                const inCat = entries.filter((e) => e.category_slug === cat.slug);
                return (
                  <div key={cat.slug} data-testid={`learning-group-${cat.slug}`}>
                    <div className="flex items-end justify-between gap-6 mb-8">
                      <div>
                        <div className="aurin-eyebrow mb-3 flex items-center gap-2">
                          <Layers size={12} /> Track
                        </div>
                        <h2 className="aurin-display text-3xl md:text-4xl">
                          {cat.name}
                        </h2>
                        {cat.description && (
                          <p className="mt-3 text-[14.5px] text-[hsl(var(--aurin-text-muted))] max-w-[56ch]">
                            {cat.description}
                          </p>
                        )}
                      </div>
                      <span className="text-xs uppercase tracking-[0.22em] text-[hsl(var(--aurin-text-muted))]">
                        {inCat.length} {inCat.length === 1 ? "reading" : "readings"}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      {inCat.map((e, idx) => (
                        <Link
                          key={e.id}
                          to={`/library/${e.slug}`}
                          data-testid={`learning-module-${e.slug}`}
                          className="aurin-card p-7 flex flex-col group"
                        >
                          <div className="flex items-start justify-between">
                            <div className="text-[11px] uppercase tracking-[0.22em] text-[hsl(var(--aurin-text-muted))]">
                              Reading · 0{idx + 1}
                            </div>
                            <ArrowUpRight
                              size={15}
                              className="text-[hsl(var(--aurin-text-muted))] group-hover:text-[hsl(var(--aurin-sage))] transition-colors"
                            />
                          </div>
                          <h3 className="aurin-display text-2xl mt-6 group-hover:text-[hsl(var(--aurin-sage))] transition-colors">
                            {e.title}
                          </h3>
                          {e.description && (
                            <p className="mt-3 text-[14px] leading-relaxed text-[hsl(var(--aurin-text-muted))]">
                              {e.description}
                            </p>
                          )}
                          <div className="mt-6 pt-4 border-t border-[hsl(var(--aurin-border-soft))] text-[12.5px] text-[hsl(var(--aurin-text-muted))]">
                            {e.sections?.length || 0} sections · {e.access}
                          </div>
                        </Link>
                      ))}
                      {inCat.length === 0 && (
                        <div className="aurin-card p-7 text-[13.5px] text-[hsl(var(--aurin-text-muted))]">
                          Nothing here yet. Soon.
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
