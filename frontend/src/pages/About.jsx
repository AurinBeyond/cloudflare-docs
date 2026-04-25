import { useEffect, useState } from "react";
import PageHeader from "@/components/layout/PageHeader";
import { fetchEntries } from "@/lib/api";

/**
 * About — pulls from GitHub /brand surface. Uses the first entry as the
 * "About the Creator" content, or shows a structured placeholder if the
 * brand surface is empty.
 */
export default function About() {
  const [entry, setEntry] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const list = await fetchEntries({ surface: "brand" });
        if (alive) setEntry(list?.[0] || null);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  return (
    <div data-testid="page-about">
      <PageHeader
        tone="default"
        eyebrow="About · prulesoul.site"
        title="A space for"
        italicWord="opening inner clarity."
        description="Matrix Aurin is the structured digital home of prulesoul.site. The work is published from a single source of truth on GitHub and presented here in a calm, slow form."
      />

      <section className="aurin-section-sm">
        <div className="aurin-container max-w-[760px]">
          {loading ? (
            <div className="text-[hsl(var(--aurin-text-muted))]" data-testid="about-loading">
              Loading…
            </div>
          ) : entry ? (
            <article data-testid="about-entry">
              <h2 className="aurin-display text-3xl md:text-4xl mb-6">{entry.title}</h2>
              {entry.description && (
                <p className="text-[15.5px] leading-[1.75] text-[hsl(var(--aurin-text-muted))] mb-8">
                  {entry.description}
                </p>
              )}
              <div className="aurin-prose" dangerouslySetInnerHTML={{ __html: entry.html || "" }} />
            </article>
          ) : (
            <div data-testid="about-placeholder" className="aurin-card p-8 space-y-4">
              <div className="aurin-eyebrow">Awaiting GitHub content</div>
              <h2 className="aurin-display text-3xl">About the Creator</h2>
              <p className="text-[14.5px] leading-relaxed text-[hsl(var(--aurin-text-muted))]">
                The About page is wired to read from the <code>/brand</code> folder of
                the connected GitHub repository. When that repository is configured
                (set the <code>GITHUB_REPO</code> environment variable and run a
                sync), this page will render the file <code>/brand/about.md</code>{" "}
                automatically — preserving its hierarchy, tone, and structure.
              </p>
              <p className="text-[14.5px] leading-relaxed text-[hsl(var(--aurin-text-muted))]">
                Until then, this placeholder is intentionally minimal. No content
                will be generated here. The system stays honest about what is
                ready and what is awaiting input.
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
