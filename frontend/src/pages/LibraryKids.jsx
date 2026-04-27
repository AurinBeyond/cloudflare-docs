import { Link } from "react-router-dom";
import PageHeader from "@/components/layout/PageHeader";
import { BookOpen, Pencil, ArrowLeft } from "lucide-react";

/**
 * Children's room — gentle landing inside the Library, with two doors:
 *   Read  → /library/kids/read
 *   Draw  → /library/kids/draw  (existing Kids Coloring Studio)
 */
export default function LibraryKids() {
  return (
    <div data-testid="page-library-kids">
      <PageHeader
        tone="kids"
        eyebrow="Library · For children"
        title="A quiet room"
        italicWord="for young hearts."
        description="No noise. No rush. Stories and drawings, side by side."
      >
        <Link to="/library" className="aurin-btn aurin-btn-ghost" data-testid="library-kids-back">
          <ArrowLeft size={13} /> Back to Library
        </Link>
      </PageHeader>

      <section className="aurin-section-sm">
        <div className="aurin-container">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5" data-testid="library-kids-grid">
            <Link
              to="/library/kids/read"
              data-testid="library-kids-read"
              className="aurin-card p-8 md:p-10 group hover:border-[hsl(var(--aurin-sage))] transition-colors"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full border border-[hsl(var(--aurin-border))] flex items-center justify-center text-[hsl(var(--aurin-sage))] shrink-0">
                  <BookOpen size={18} strokeWidth={1.4} />
                </div>
                <div>
                  <div className="aurin-eyebrow !mb-1">Stories</div>
                  <h3 className="aurin-display text-2xl md:text-3xl leading-tight">
                    Stories that open the world{" "}
                    <span className="aurin-serif-italic text-[hsl(var(--aurin-sage))]">
                      quietly.
                    </span>
                  </h3>
                  <p className="mt-3 text-[14px] leading-relaxed text-[hsl(var(--aurin-text-muted))]">
                    Without forcing. Without teaching.
                  </p>
                  <div className="mt-5 text-[12.5px] text-[hsl(var(--aurin-sage))] group-hover:underline">
                    Open the stories →
                  </div>
                </div>
              </div>
            </Link>

            <Link
              to="/library/kids/draw"
              data-testid="library-kids-draw"
              className="aurin-card p-8 md:p-10 group hover:border-[hsl(var(--aurin-sage))] transition-colors"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full border border-[hsl(var(--aurin-border))] flex items-center justify-center text-[hsl(var(--aurin-sage))] shrink-0">
                  <Pencil size={18} strokeWidth={1.4} />
                </div>
                <div>
                  <div className="aurin-eyebrow !mb-1">Drawing</div>
                  <h3 className="aurin-display text-2xl md:text-3xl leading-tight">
                    Sometimes a drawing says{" "}
                    <span className="aurin-serif-italic text-[hsl(var(--aurin-sage))]">
                      more than words.
                    </span>
                  </h3>
                  <p className="mt-3 text-[14px] leading-relaxed text-[hsl(var(--aurin-text-muted))]">
                    Let the hand move. Print one. Colour at your own pace.
                  </p>
                  <div className="mt-5 text-[12.5px] text-[hsl(var(--aurin-sage))] group-hover:underline">
                    Open the drawing room →
                  </div>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
