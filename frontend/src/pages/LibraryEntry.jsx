import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Lock, CheckCircle2, AlertTriangle } from "lucide-react";
import { fetchEntry } from "@/lib/api";

export default function LibraryEntry() {
  const { slug } = useParams();
  const [entry, setEntry] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        const data = await fetchEntry(slug);
        if (alive) setEntry(data);
      } catch {
        if (alive) setError("This entry could not be found.");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [slug]);

  if (loading) {
    return (
      <div className="aurin-container py-40 text-center text-[hsl(var(--aurin-text-muted))]" data-testid="library-entry-loading">
        Loading…
      </div>
    );
  }

  if (error || !entry) {
    return (
      <div className="aurin-container py-40 text-center space-y-6" data-testid="library-entry-error">
        <div className="text-[hsl(var(--aurin-text-muted))]">{error || "Not found"}</div>
        <Link to="/library" className="aurin-btn aurin-btn-ghost">
          <ArrowLeft size={14} /> Return to Library
        </Link>
      </div>
    );
  }

  const isFree = entry.access === "free";

  return (
    <div data-testid="page-library-entry">
      {/* Header */}
      <section className="relative border-b border-[hsl(var(--aurin-border-soft))]">
        <div className="absolute inset-0 aurin-grid-bg opacity-[0.18]" />
        <div className="absolute inset-0 aurin-glow" />
        <div className="aurin-container relative pt-16 md:pt-20 pb-14">
          <Link
            to="/library"
            className="inline-flex items-center gap-2 text-[13px] text-[hsl(var(--aurin-text-muted))] hover:text-[hsl(var(--aurin-sage))] transition-colors"
            data-testid="library-entry-back"
          >
            <ArrowLeft size={14} /> Back to Library
          </Link>
          <div className="flex flex-wrap items-center gap-3 mt-7">
            <span className="aurin-chip capitalize" data-testid="library-entry-category">
              {entry.category_slug}
            </span>
            <span
              className={`inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.18em] px-2.5 py-1 rounded-full border ${
                isFree
                  ? "border-[hsl(var(--aurin-sage))/0.4] text-[hsl(var(--aurin-sage))]"
                  : "border-[hsl(var(--aurin-sand))/0.4] text-[hsl(var(--aurin-sand))]"
              }`}
              data-testid="library-entry-access"
            >
              {isFree ? <CheckCircle2 size={12} /> : <Lock size={11} />}
              {isFree ? "Free" : "Member"}
            </span>
            {(entry.tags || []).map((t) => (
              <span key={t} className="aurin-chip">
                #{t}
              </span>
            ))}
          </div>
          <h1
            className="aurin-display mt-6 text-4xl sm:text-5xl lg:text-[60px] max-w-[22ch] leading-[1.05]"
            data-testid="library-entry-title"
          >
            {entry.title}
          </h1>
          {entry.description && (
            <p className="mt-5 max-w-[58ch] text-[15.5px] leading-[1.75] text-[hsl(var(--aurin-text-muted))]">
              {entry.description}
            </p>
          )}
        </div>
      </section>

      {/* Body with sections sidebar */}
      <section className="aurin-section-sm">
        <div className="aurin-container grid grid-cols-1 lg:grid-cols-12 gap-12">
          <aside className="lg:col-span-3 order-2 lg:order-1">
            <div className="lg:sticky lg:top-24">
              <div className="aurin-eyebrow mb-5">Sections</div>
              {entry.sections?.length ? (
                <ul className="space-y-2" data-testid="library-entry-sections">
                  {entry.sections.map((s) => (
                    <li key={s.id}>
                      <a
                        href={`#${s.id}`}
                        className={`block text-[13.5px] leading-snug hover:text-[hsl(var(--aurin-sage))] transition-colors ${
                          s.level === 3
                            ? "pl-4 text-[hsl(var(--aurin-text-muted))]"
                            : "text-[hsl(var(--aurin-text))/0.9]"
                        }`}
                      >
                        {s.title}
                      </a>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-[13px] text-[hsl(var(--aurin-text-muted))]">
                  This entry has no sub-sections.
                </div>
              )}
            </div>
          </aside>

          <article className="lg:col-span-9 order-1 lg:order-2">
            {entry.html ? (
              <div
                className="aurin-prose"
                data-testid="library-entry-body"
                dangerouslySetInnerHTML={{ __html: entry.html }}
              />
            ) : (
              <div
                data-testid="library-entry-empty"
                className="aurin-card p-8 text-[14.5px] text-[hsl(var(--aurin-text-muted))]"
              >
                This entry has no content yet.
              </div>
            )}

            {entry.validation_warnings?.length > 0 && (
              <div
                data-testid="library-entry-warnings"
                className="mt-10 aurin-card p-5 border-[hsl(var(--aurin-sand))/0.35]"
              >
                <div className="flex items-start gap-3">
                  <AlertTriangle
                    size={14}
                    className="mt-1 shrink-0 text-[hsl(var(--aurin-sand))]"
                  />
                  <div className="text-[12.5px] leading-relaxed">
                    <div className="uppercase tracking-[0.22em] text-[10.5px] text-[hsl(var(--aurin-text-muted))] mb-2">
                      Internal · Content notes
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {entry.validation_warnings.map((w) => (
                        <span key={w} className="aurin-chip" data-testid={`library-entry-warning-${w}`}>
                          {w.replace(/_/g, " ")}
                        </span>
                      ))}
                    </div>
                    <p className="mt-3 text-[hsl(var(--aurin-text-muted))]">
                      These notes help the editorial team improve the source
                      file. They are not shown to regular users.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {!isFree && (
              <div
                data-testid="library-entry-gate-note"
                className="mt-12 aurin-card p-6 text-[14px] text-[hsl(var(--aurin-text-muted))] leading-relaxed"
              >
                <div className="aurin-eyebrow mb-3">Member access</div>
                This entry is marked as member-only. Account access is not yet
                open — when it is, unlocking this will happen from your User
                Portal.
              </div>
            )}
          </article>
        </div>
      </section>
    </div>
  );
}
