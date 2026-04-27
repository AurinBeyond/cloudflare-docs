import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import PageHeader from "@/components/layout/PageHeader";
import { ArrowLeft, Download, Printer, Sparkles } from "lucide-react";

/**
 * Kids Coloring Studio — live gallery of "Aurin Kids" coloring pages.
 *
 * Each page is described in COLORING_PAGES below. The metadata mirrors the
 * markdown frontmatter the user requested:
 *
 *   ---
 *   type: coloring_page
 *   title: "Name of the Illustration"
 *   age_group: "3-5" | "6-8" | "9-12"
 *   tags: ["Nature", "Geometry", "Discovery"]
 *   download_url: "/assets/kids/..."
 *   ---
 *
 * Once `/kids/coloring/*.md` lands in the connected GitHub repository, the
 * gallery can switch to fetching from the API instead of this static seed.
 *
 * UI rules (per author):
 * - Pure-white card behind every illustration (ink-efficient print)
 * - "Download to Print" available on each card
 * - Calm, non-distracting layout, safe for very young children
 */

const COLORING_PAGES = [
  {
    slug: "aurin-kids-cover",
    title: "Aurin Kids — Let Your Creativity Shine",
    age_group: "3-5",
    tags: ["Geometry", "Friendship", "Nature"],
    summary:
      "Two friends meeting inside a quiet crystal of light, surrounded by gentle clouds, an owl, and a fox.",
    image: "/assets/kids/coloring/aurin-kids-cover.png",
    download_url: "/assets/kids/coloring/aurin-kids-cover.png",
  },
];

const AGE_FILTERS = [
  { key: "all", label: "All ages" },
  { key: "3-5", label: "3 – 5" },
  { key: "6-8", label: "6 – 8" },
  { key: "9-12", label: "9 – 12" },
];

export default function KidsColoringStudio() {
  const [age, setAge] = useState("all");

  const visible = useMemo(
    () =>
      age === "all"
        ? COLORING_PAGES
        : COLORING_PAGES.filter((p) => p.age_group === age),
    [age]
  );

  return (
    <div data-testid="page-kids-coloring">
      <PageHeader
        tone="kids"
        eyebrow="Aurin Kids · Coloring"
        title="Quiet pages,"
        italicWord="ready to colour."
        description="Hand-tuned line drawings, made for paper. Pick one, print it, let creativity breathe."
      >
        <Link
          to="/kids-universe"
          className="aurin-btn aurin-btn-ghost"
          data-testid="kids-coloring-back"
        >
          <ArrowLeft size={13} /> Back to Kids Universe
        </Link>
      </PageHeader>

      <section className="border-b border-[hsl(var(--aurin-border-soft))]">
        <div className="aurin-container py-7 flex flex-col md:flex-row md:items-center gap-5 md:gap-8">
          <div className="text-[11px] uppercase tracking-[0.22em] text-[hsl(var(--aurin-text-muted))]">
            Filter by age group
          </div>
          <div
            className="flex items-center gap-2 flex-wrap"
            data-testid="kids-coloring-age-tabs"
          >
            {AGE_FILTERS.map((a) => (
              <button
                key={a.key}
                onClick={() => setAge(a.key)}
                data-testid={`kids-coloring-age-${a.key}`}
                className={`text-[12.5px] px-3 py-1.5 rounded-full border transition-colors ${
                  age === a.key
                    ? "bg-[hsl(var(--aurin-text))] text-[hsl(var(--aurin-bg))] border-[hsl(var(--aurin-text))]"
                    : "border-[hsl(var(--aurin-border))] text-[hsl(var(--aurin-text))/0.85]"
                }`}
              >
                {a.label}
              </button>
            ))}
          </div>
          <div className="text-[12.5px] text-[hsl(var(--aurin-text-muted))] md:ml-auto">
            {visible.length} {visible.length === 1 ? "page" : "pages"}
          </div>
        </div>
      </section>

      <section className="aurin-section-sm">
        <div className="aurin-container">
          {visible.length === 0 ? (
            <div
              data-testid="kids-coloring-empty"
              className="text-center py-20 text-[hsl(var(--aurin-text-muted))]"
            >
              No pages for this age yet. New illustrations arrive slowly.
            </div>
          ) : (
            <div
              className="grid grid-cols-1 md:grid-cols-2 gap-7"
              data-testid="kids-coloring-grid"
            >
              {visible.map((page) => (
                <ColoringCard key={page.slug} page={page} />
              ))}
            </div>
          )}

          <div
            className="aurin-card p-6 mt-12 flex items-start gap-4"
            data-testid="kids-coloring-note"
          >
            <Sparkles
              size={16}
              className="text-[hsl(var(--aurin-sage))] mt-0.5 shrink-0"
            />
            <p className="text-[13.5px] leading-relaxed text-[hsl(var(--aurin-text-muted))]">
              New pages are added gently. If you want to suggest a theme — a
              brave fox, a star learning to shine, a child meeting the
              forest — write through{" "}
              <Link
                to="/reach-out"
                className="text-[hsl(var(--aurin-sage))] hover:underline"
              >
                Reach Out
              </Link>
              . Aurin Kids is a calm space, made slowly.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

function ColoringCard({ page }) {
  const handlePrint = () => {
    const w = window.open(page.image, "_blank", "noopener,noreferrer");
    if (w) {
      w.addEventListener("load", () => {
        try {
          w.focus();
          w.print();
        } catch {
          /* user can still print manually */
        }
      });
    }
  };

  return (
    <article
      className="aurin-card overflow-hidden flex flex-col"
      data-testid={`kids-coloring-card-${page.slug}`}
    >
      {/* Pure white frame for ink-efficient printing */}
      <div className="bg-white p-5 sm:p-7 flex items-center justify-center">
        <img
          src={page.image}
          alt={page.title}
          data-testid={`kids-coloring-card-${page.slug}-image`}
          className="w-full h-auto object-contain max-h-[460px]"
          loading="lazy"
        />
      </div>

      <div className="p-6 flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className="aurin-chip"
            data-testid={`kids-coloring-card-${page.slug}-age`}
          >
            Age {page.age_group}
          </span>
          {page.tags?.map((t) => (
            <span
              key={t}
              className="text-[11px] uppercase tracking-[0.2em] text-[hsl(var(--aurin-text-muted))] px-2.5 py-1 rounded-full border border-[hsl(var(--aurin-border-soft))]"
            >
              {t}
            </span>
          ))}
        </div>

        <h3 className="aurin-display text-2xl leading-[1.18]">{page.title}</h3>
        {page.summary && (
          <p className="text-[14px] leading-relaxed text-[hsl(var(--aurin-text-muted))]">
            {page.summary}
          </p>
        )}

        <div className="mt-2 pt-5 border-t border-[hsl(var(--aurin-border-soft))] flex flex-wrap items-center gap-3">
          <a
            href={page.download_url}
            download
            data-testid={`kids-coloring-card-${page.slug}-download`}
            className="aurin-btn aurin-btn-primary !py-2 !px-4 !text-[12.5px]"
          >
            <Download size={13} /> Download to Print
          </a>
          <button
            type="button"
            onClick={handlePrint}
            data-testid={`kids-coloring-card-${page.slug}-print`}
            className="aurin-btn aurin-btn-ghost !py-2 !px-4 !text-[12.5px]"
          >
            <Printer size={13} /> Print now
          </button>
        </div>
      </div>
    </article>
  );
}
