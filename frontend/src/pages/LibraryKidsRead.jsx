import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import PageHeader from "@/components/layout/PageHeader";
import { ArrowLeft, BookOpen, Download } from "lucide-react";
import { fetchEntries, api } from "@/lib/api";

/**
 * Library · Children · Read.
 *
 * Pulls free entries (audience=kids) from the markdown content layer.
 * Also surfaces any kids' books that have a free PDF sample, so a
 * parent doesn't have to bounce between Library and Bookstore.
 */
export default function LibraryKidsRead() {
  const [entries, setEntries] = useState([]);
  const [freeBooks, setFreeBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const [eList, bRes] = await Promise.all([
          fetchEntries({ surface: "library", audience: "kids" }),
          api.get("/books?audience=kids"),
        ]);
        if (!alive) return;
        setEntries(eList || []);
        setFreeBooks((bRes.data || []).filter((b) => b.pdf_url));
      } catch {
        /* show empty state */
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  return (
    <div data-testid="page-library-kids-read">
      <PageHeader
        tone="kids"
        eyebrow="Library · Children · Stories"
        title="Stories that open the world"
        italicWord="quietly."
        description="Without forcing. Without teaching. Take it, if it feels meant for you."
      >
        <Link to="/library/kids" className="aurin-btn aurin-btn-ghost" data-testid="kids-read-back">
          <ArrowLeft size={13} /> Back
        </Link>
      </PageHeader>

      <section className="aurin-section-sm">
        <div className="aurin-container">
          {loading && (
            <div data-testid="kids-read-loading" className="text-[hsl(var(--aurin-text-muted))]">
              A small breath…
            </div>
          )}

          {/* Free PDF samples from the bookstore */}
          {freeBooks.length > 0 && (
            <div data-testid="kids-read-free-samples" className="mb-12">
              <div className="aurin-eyebrow mb-5">Free to read</div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {freeBooks.map((b) => (
                  <article
                    key={b.slug}
                    data-testid={`kids-read-sample-${b.slug}`}
                    className="aurin-card p-6 md:p-7 flex flex-col gap-4"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full border border-[hsl(var(--aurin-border))] flex items-center justify-center text-[hsl(var(--aurin-sage))] shrink-0">
                        <BookOpen size={16} strokeWidth={1.4} />
                      </div>
                      <div>
                        <h3 className="aurin-display text-xl md:text-2xl leading-tight">
                          {b.title}
                        </h3>
                        {b.subtitle && (
                          <p className="mt-1 aurin-serif-italic text-[hsl(var(--aurin-sage))/0.95] text-sm">
                            {b.subtitle}
                          </p>
                        )}
                      </div>
                    </div>
                    {b.description && (
                      <p className="text-[13.5px] leading-relaxed text-[hsl(var(--aurin-text-muted))]">
                        {b.description}
                      </p>
                    )}
                    <div className="mt-auto pt-3 border-t border-[hsl(var(--aurin-border-soft))] flex items-center justify-between">
                      <a
                        href={b.pdf_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        data-testid={`kids-read-sample-${b.slug}-open`}
                        className="text-[13px] text-[hsl(var(--aurin-text))] hover:text-[hsl(var(--aurin-sage))] transition-colors"
                      >
                        Open the story →
                      </a>
                      <a
                        href={b.pdf_url}
                        download
                        data-testid={`kids-read-sample-${b.slug}-download`}
                        className="aurin-btn aurin-btn-ghost !py-2 !px-3.5 !text-[12px]"
                      >
                        <Download size={12} /> Take it
                      </a>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          )}

          {/* Library entries (free articles tagged kids) */}
          {entries.length > 0 && (
            <div className="mb-12" data-testid="kids-read-entries">
              <div className="aurin-eyebrow mb-5">Short readings</div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {entries.map((e) => (
                  <Link
                    key={e.slug}
                    to={`/library/${e.slug}`}
                    data-testid={`kids-read-entry-${e.slug}`}
                    className="aurin-card p-6 group hover:border-[hsl(var(--aurin-sage))] transition-colors"
                  >
                    <h3 className="aurin-display text-lg leading-tight">{e.title}</h3>
                    {e.description && (
                      <p className="mt-2 text-[13.5px] leading-relaxed text-[hsl(var(--aurin-text-muted))]">
                        {e.description}
                      </p>
                    )}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {!loading && entries.length === 0 && freeBooks.length === 0 && (
            <p data-testid="kids-read-empty" className="text-[hsl(var(--aurin-text-muted))]">
              Stories arrive slowly. The first ones are on their way.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
