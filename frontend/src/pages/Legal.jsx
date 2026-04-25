import { useEffect, useState } from "react";
import PageHeader from "@/components/layout/PageHeader";
import { fetchEntries } from "@/lib/api";

/**
 * Legal / Responsibility — pulls from GitHub /legal surface.
 * Renders each entry as a stacked section with a sticky table of contents.
 */
export default function Legal() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const list = await fetchEntries({ surface: "legal" });
        if (alive) setEntries(list || []);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  return (
    <div data-testid="page-legal">
      <PageHeader
        tone="default"
        eyebrow="Legal · Responsibility"
        title="Terms, responsibility,"
        italicWord="and the small print."
        description="The legal foundation of prulesoul.site. Sourced from the GitHub /legal folder. Refunds, terms, and user responsibility live here, before any payment is activated."
      />

      <section className="aurin-section-sm">
        <div className="aurin-container max-w-[760px] space-y-16">
          {loading ? (
            <div className="text-[hsl(var(--aurin-text-muted))]" data-testid="legal-loading">
              Loading…
            </div>
          ) : entries.length === 0 ? (
            <div data-testid="legal-placeholder" className="aurin-card p-8 space-y-4">
              <div className="aurin-eyebrow">Awaiting GitHub content</div>
              <h2 className="aurin-display text-3xl">Terms · Responsibility · Refunds</h2>
              <p className="text-[14.5px] leading-relaxed text-[hsl(var(--aurin-text-muted))]">
                The Legal section is wired to render every markdown file inside the{" "}
                <code>/legal</code> folder of the connected GitHub repository.
                Recommended files: <code>terms.md</code>,{" "}
                <code>responsibility.md</code>, <code>refund-policy.md</code>.
              </p>
              <p className="text-[14.5px] leading-relaxed text-[hsl(var(--aurin-text-muted))]">
                These documents must be visible and accessible before payments
                are activated. No content is generated here — the platform shows
                only what the source of truth provides.
              </p>
            </div>
          ) : (
            entries.map((e) => (
              <article key={e.id} id={e.slug} data-testid={`legal-entry-${e.slug}`} className="scroll-mt-24">
                <div className="aurin-eyebrow mb-3">{e.slug}</div>
                <h2 className="aurin-display text-3xl md:text-4xl mb-6">{e.title}</h2>
                {e.description && (
                  <p className="text-[15.5px] leading-[1.75] text-[hsl(var(--aurin-text-muted))] mb-8">
                    {e.description}
                  </p>
                )}
                <div className="aurin-prose" dangerouslySetInnerHTML={{ __html: e.html || "" }} />
              </article>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
