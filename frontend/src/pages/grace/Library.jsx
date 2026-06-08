/**
 * grace/Library.jsx — § GRACE / LIBRARY LANDING 2026-02
 *
 * Founder spec: "Grace Library is not a blog. It is a quiet reading
 * room beside the fireplace." Three sections, five articles, cards
 * with title / subtitle / reading time / Open button.
 */
import { Link } from "react-router-dom";
import { BookOpen, ArrowRight } from "lucide-react";
import GraceSubPage from "@/components/grace/GraceSubPage";
import {
  LIBRARY_SECTIONS,
  LIBRARY_ARTICLES,
} from "@/data/graceLibrary";

export default function Library() {
  return (
    <GraceSubPage
      testid="page-grace-library"
      bgImage="/assets/grace/messages-bg.png"
      eyebrow="Grace Library"
      title="Understanding yourself, one quiet page at a time."
      intro={
        "You do not need to solve everything today. Sometimes understanding is enough. These are short pieces written in the same tone as the rest of this room — warm, calm, and on your side."
      }
      quote="A shelf of thoughtful pages beside the fireplace. Take one when you are ready."
    >
      {LIBRARY_SECTIONS.map((section) => (
        <section
          key={section.id}
          className="mb-10"
          data-testid={`library-section-${section.id}`}
        >
          <p
            className="text-[10.5px] tracking-[0.24em] uppercase mb-5"
            style={{ color: "#c89a5a" }}
          >
            {section.title}
          </p>
          <div className="space-y-4">
            {section.slugs.map((slug) => {
              const a = LIBRARY_ARTICLES[slug];
              return (
                <Link
                  key={slug}
                  to={`/grace/library/${slug}`}
                  data-testid={`library-card-${slug}`}
                  className="block rounded-2xl p-6 transition-all hover:scale-[1.015] hover:shadow-lg no-underline"
                  style={{
                    background: "rgba(255, 250, 240, 0.92)",
                    border: "1px solid rgba(200, 154, 90, 0.25)",
                    boxShadow:
                      "0 6px 22px -12px rgba(120, 85, 50, 0.2)",
                    textDecoration: "none",
                  }}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center"
                      style={{
                        background: "rgba(200, 154, 90, 0.15)",
                        border:
                          "1px solid rgba(200, 154, 90, 0.4)",
                        color: "#c89a5a",
                      }}
                      aria-hidden="true"
                    >
                      <BookOpen size={16} strokeWidth={1.6} />
                    </div>
                    <div className="flex-1">
                      <p
                        className="text-[19px] leading-tight mb-1.5"
                        style={{
                          color: "#2a1f12",
                          fontFamily:
                            '"Cormorant Garamond", Georgia, serif',
                          fontWeight: 500,
                        }}
                      >
                        {a.title}
                      </p>
                      <p
                        className="text-[14px] leading-[1.6] italic mb-3"
                        style={{
                          color: "#5a4a30",
                          fontFamily:
                            '"Cormorant Garamond", Georgia, serif',
                        }}
                      >
                        {a.subtitle}
                      </p>
                      <div className="flex items-center justify-between">
                        <p
                          className="text-[11.5px] tracking-[0.18em] uppercase"
                          style={{ color: "#c89a5a" }}
                        >
                          {a.readingTime}
                        </p>
                        <span
                          className="inline-flex items-center gap-1.5 text-[13px]"
                          style={{
                            color: "#c89a5a",
                            fontFamily:
                              '"Cormorant Garamond", Georgia, serif',
                            fontStyle: "italic",
                          }}
                        >
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

      <p
        className="mt-12 text-center text-[13px] italic"
        style={{
          color: "#7a5a26",
          fontFamily: '"Cormorant Garamond", Georgia, serif',
        }}
        data-testid="library-footer-note"
      >
        More pieces are being written, slowly. This room grows by hand.
      </p>
    </GraceSubPage>
  );
}
