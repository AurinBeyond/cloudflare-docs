import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import PageHeader from "@/components/layout/PageHeader";
import { ArrowLeft, Download, Printer, Sparkles } from "lucide-react";
import { api } from "@/lib/api";

/**
 * Kids Coloring Studio — live gallery of "Aurin Kids" coloring pages.
 *
 * Pages are fetched from /api/coloring/pages. The backend generates one
 * fresh black-and-white line-art page per age group per day using the
 * Gemini Nano Banana model, and falls back to the curated seed below
 * (so the gallery is never empty during the first hour of a fresh boot).
 *
 * UI rules (per author):
 *   - Pure-white card behind every illustration (ink-efficient print)
 *   - "Download to Print" available on each card
 *   - Calm, non-distracting layout, safe for very young children
 */

const SEED_PAGES = [];

const AGE_FILTERS = [
  { key: "all", label: "All ages" },
  { key: "3-5", label: "3 – 5" },
  { key: "6-8", label: "6 – 8" },
  { key: "9-12", label: "9 – 12" },
];

export default function KidsColoringStudio() {
  const [age, setAge] = useState("all");
  const [pages, setPages] = useState(SEED_PAGES);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await api.get("/coloring/pages");
        const live = (res.data && res.data.pages) || [];
        if (alive) {
          // Show live pages first, then the curated seed cover.
          const merged = [...live, ...SEED_PAGES];
          setPages(merged);
        }
      } catch {
        // Silent fall-back to the seed.
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const visible = useMemo(
    () => (age === "all" ? pages : pages.filter((p) => p.age_group === age)),
    [age, pages]
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

          {/* Light Guide — a soft guide for parents, never clinical,
              never diagnostic. The drawing ritual ends in light. */}
          <section className="mt-12" data-testid="kids-coloring-light-guide">
            <div className="aurin-card p-7 md:p-9 space-y-6 bg-[hsl(var(--aurin-bg))]/40">
              <div>
                <div className="aurin-eyebrow !mb-1">For the parent beside them</div>
                <h3 className="aurin-display text-2xl md:text-[28px] leading-snug max-w-[26ch]">
                  A quiet guide, for the evening you sit down{" "}
                  <span className="aurin-serif-italic text-[hsl(var(--aurin-sage))]">
                    to colour together.
                  </span>
                </h3>
              </div>
              <p className="text-[14px] leading-[1.85] text-[hsl(var(--aurin-text))/0.9]">
                Drawing is how children speak when words are too small. Your
                job here is not to interpret, correct, or worry. It is to be
                beside them — steady, warm, unhurried — while something that
                had no place goes, gently, onto the paper.
              </p>

              <ol className="space-y-5">
                <li>
                  <div className="aurin-eyebrow !mb-1 text-[10px]">1 · The room</div>
                  <p className="text-[13.5px] leading-relaxed text-[hsl(var(--aurin-text))/0.9]">
                    Keep the room quiet and the colours free. Let the child
                    choose the page, the pencils, and the pace. Your presence
                    is the container — nothing more is asked of you.
                  </p>
                </li>
                <li>
                  <div className="aurin-eyebrow !mb-1 text-[10px]">2 · The heavy colours</div>
                  <p className="text-[13.5px] leading-relaxed text-[hsl(var(--aurin-text))/0.9]">
                    If dark colours arrive, or the pencil presses hard, do not
                    ask why. Something is leaving the body through the hand.
                    Stay beside, breathe slowly, let it pass through.
                  </p>
                </li>
                <li>
                  <div className="aurin-eyebrow !mb-1 text-[10px] text-[hsl(var(--aurin-sage))]">3 · The turn toward light</div>
                  <p className="text-[13.5px] leading-relaxed text-[hsl(var(--aurin-text))/0.9]">
                    When the page feels almost done, a soft invitation is
                    enough: <em className="aurin-serif-italic">"Where does the sun come in, in this picture?
                    Which colour would bring a small joy here?"</em> Every drawing
                    can end in a little light — a sun, a flower, a gold spark,
                    a smile. The body remembers the way home through this gesture.
                  </p>
                </li>
                <li>
                  <div className="aurin-eyebrow !mb-1 text-[10px]">4 · The body's small sounds</div>
                  <p className="text-[13.5px] leading-relaxed text-[hsl(var(--aurin-text))/0.9]">
                    If the child yawns, coughs, hums, fidgets, or makes odd
                    small sounds — this is release. You might say softly:
                    <em className="aurin-serif-italic"> "Your body is letting something old go. That's a
                    good thing. You can let it come."</em> No interpretation needed.
                  </p>
                </li>
                <li>
                  <div className="aurin-eyebrow !mb-1 text-[10px] text-[hsl(var(--aurin-sage))]">5 · The closing breath</div>
                  <p className="text-[13.5px] leading-relaxed text-[hsl(var(--aurin-text))/0.9]">
                    When the drawing is finished, look at the bright parts
                    together. A simple closing works: <em className="aurin-serif-italic">"It's on the paper
                    now. We're both a little lighter."</em> Then put the pencils
                    away without hurry. The practice is complete.
                  </p>
                </li>
              </ol>

              <p className="text-[12.5px] leading-relaxed text-[hsl(var(--aurin-text-muted))]/90 aurin-serif-italic pt-3 border-t border-[hsl(var(--aurin-border-soft))]">
                A gentle note. This is a companion practice, never a
                replacement for medical or psychological care when that is
                needed. Holding a positive posture — for the child and for
                yourself — keeps fear and hopelessness a little further
                from the door, so that professional help, when it is used,
                can land more easily.
              </p>
            </div>
          </section>
        </div>
      </section>
    </div>
  );
}

function ColoringCard({ page }) {
  const imgSrc = page.image_url || page.image;
  const dlHref = page.download_url || imgSrc;
  const handlePrint = () => {
    const w = window.open(imgSrc, "_blank", "noopener,noreferrer");
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
          src={imgSrc}
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
            href={dlHref}
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
