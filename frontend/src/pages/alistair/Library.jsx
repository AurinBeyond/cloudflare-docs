/**
 * alistair/Library.jsx — § ALISTAIR / LIBRARY LANDING 2026-02
 * Identical shape to Grace Library landing; only the data source and
 * accent colour differ.
 */
import { Link } from "react-router-dom";
import { BookOpen, ArrowRight } from "lucide-react";
import AlistairSubPage from "@/components/alistair/AlistairSubPage";
import { LIBRARY_SECTIONS, LIBRARY_ARTICLES } from "@/data/alistairLibrary";

export default function Library() {
  return (
    <AlistairSubPage
      testid="page-alistair-library"
      bgImage="/assets/alistair/alistair-light-bg.png"
      eyebrow="Alistair Library"
      title="Short papers from a quiet researcher."
      intro="These are not articles. They are reading objects. Five short pieces, written slowly, meant to be read slowly. Pick one. Argue with it. Come back to it next week."
      quote="The right page at the right week is worth more than a thousand pages at the wrong one."
    >
      {LIBRARY_SECTIONS.map((section) => (
        <section key={section.id} className="mb-10" data-testid={`alistair-library-section-${section.id}`}>
          <p className="text-[10.5px] tracking-[0.24em] uppercase mb-5" style={{ color: "#b07a3f" }}>
            {section.title}
          </p>
          <div className="space-y-4">
            {section.slugs.map((slug) => {
              const a = LIBRARY_ARTICLES[slug];
              return (
                <Link key={slug} to={`/course-room/library/${slug}`}
                  data-testid={`alistair-library-card-${slug}`}
                  className="block rounded-2xl p-6 transition-all hover:scale-[1.015] hover:shadow-lg no-underline"
                  style={{ background: "rgba(252, 246, 232, 0.92)",
                    border: "1px solid rgba(176, 122, 63, 0.25)",
                    boxShadow: "0 6px 22px -12px rgba(105, 72, 38, 0.2)",
                    textDecoration: "none" }}>
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center"
                      style={{ background: "rgba(176, 122, 63, 0.15)",
                        border: "1px solid rgba(176, 122, 63, 0.4)", color: "#b07a3f" }}
                      aria-hidden="true">
                      <BookOpen size={16} strokeWidth={1.6} />
                    </div>
                    <div className="flex-1">
                      <p className="text-[19px] leading-tight mb-1.5"
                        style={{ color: "#2b1f0f", fontFamily: '"Cormorant Garamond", Georgia, serif',
                          fontWeight: 500 }}>{a.title}</p>
                      <p className="text-[14px] leading-[1.6] italic mb-3"
                        style={{ color: "#5b4226", fontFamily: '"Cormorant Garamond", Georgia, serif' }}>
                        {a.subtitle}
                      </p>
                      <div className="flex items-center justify-between">
                        <p className="text-[11.5px] tracking-[0.18em] uppercase" style={{ color: "#b07a3f" }}>
                          {a.readingTime}
                        </p>
                        <span className="inline-flex items-center gap-1.5 text-[13px]"
                          style={{ color: "#b07a3f", fontFamily: '"Cormorant Garamond", Georgia, serif',
                            fontStyle: "italic" }}>
                          Open <ArrowRight size={13} />
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      ))}
      <p className="mt-12 text-center text-[13px] italic"
        style={{ color: "#7a5a26", fontFamily: '"Cormorant Garamond", Georgia, serif' }}
        data-testid="alistair-library-footer-note">
        More papers will arrive when they are ready. This shelf grows by hand.
      </p>
    </AlistairSubPage>
  );
}
