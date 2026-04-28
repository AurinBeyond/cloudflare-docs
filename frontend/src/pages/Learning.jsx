import PageHeader from "@/components/layout/PageHeader";
import { Link } from "react-router-dom";

/**
 * Learning — quiet stub.
 *
 * Per founder directive (2026-04-28): the two seeded "Foundations /
 * Practice" entries were generic placeholders. They have been hidden
 * from the public surface until the founder writes the real readings.
 * The route stays valid so existing links don't 404.
 */
export default function Learning() {
  return (
    <div data-testid="page-learning">
      <PageHeader
        tone="default"
        eyebrow="Learning"
        title="This part is"
        italicWord="still being written."
        description="Some things take longer to form."
      />

      <section className="aurin-section-sm">
        <div className="aurin-container max-w-[640px]">
          <div
            data-testid="learning-stub"
            className="aurin-card p-8 md:p-10 text-center space-y-5"
          >
            <p className="aurin-serif-italic text-lg md:text-xl leading-[1.7] text-[hsl(var(--aurin-text))/0.94]">
              The longer readings are not ready yet.
              <br />
              We won't show you something just to fill the page.
            </p>
            <p className="text-[14px] leading-relaxed text-[hsl(var(--aurin-text-muted))]">
              In the meantime, the seven small steps are open. So is the small
              shelf of books.
            </p>
            <div className="pt-3 flex flex-wrap items-center justify-center gap-3">
              <Link
                to="/the-beginning"
                data-testid="learning-stub-to-beginning"
                className="aurin-btn aurin-btn-primary !text-[13px]"
              >
                Begin gently →
              </Link>
              <Link
                to="/library"
                data-testid="learning-stub-to-library"
                className="aurin-btn aurin-btn-ghost !text-[13px]"
              >
                Open the library
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
