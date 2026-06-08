/**
 * grace/LibraryArticle.jsx — § GRACE / LIBRARY ARTICLE 2026-02
 *
 * Renders one library article in the 7-block founder shape:
 *   1. Opening Reflection
 *   2. Understanding The Pattern
 *   3. A Different Perspective
 *   4. Questions To Sit With
 *   5. Small Next Step
 *   6. Speak With Grace CTA
 *   7. Write About This CTA
 *
 * "Download as PDF" uses the browser's native print → save-as-PDF
 * dialogue (works on every desktop OS) so no extra dependency is
 * introduced. A dedicated print stylesheet (in <style> below) hides
 * the chrome and prints only the article body, in cream + serif, so
 * the saved PDF still feels like Grace.
 */
import { useParams, Link, Navigate } from "react-router-dom";
import { ArrowLeft, Mic, Pen, Printer, Heart, Quote } from "lucide-react";
import { LIBRARY_ARTICLES } from "@/data/graceLibrary";

export default function LibraryArticle() {
  const { slug } = useParams();
  const a = LIBRARY_ARTICLES[slug];

  if (!a) {
    return <Navigate to="/grace/library" replace />;
  }

  const speakWithGrace = () => {
    window.location.href = `/grace/room?topic=${encodeURIComponent(a.slug)}`;
  };
  const writeAboutThis = () => {
    window.location.href = `/grace/room?write=${encodeURIComponent(a.slug)}`;
  };
  const downloadAsPdf = () => {
    window.print();
  };

  return (
    <div
      data-testid="page-grace-library-article"
      className="relative min-h-screen w-full overflow-hidden"
      style={{ backgroundColor: "#f6efe4" }}
    >
      {/* Soft cream wash + subtle background */}
      <div
        aria-hidden="true"
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: "url(\"/assets/grace/messages-bg.png\")",
          backgroundSize: "cover",
          backgroundPosition: "center",
          filter: "blur(3px) brightness(0.92) saturate(0.94)",
        }}
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 z-0"
        style={{
          background:
            "linear-gradient(180deg, rgba(248,240,225,0.92) 0%, rgba(248,240,225,0.86) 50%, rgba(248,240,225,0.95) 100%)",
        }}
      />

      <article
        className="relative z-[2] max-w-[760px] mx-auto px-5 md:px-8 py-10 md:py-16 print-article"
      >
        <div className="flex items-center justify-between mb-10 no-print">
          <Link
            to="/grace/library"
            data-testid="library-article-back"
            className="inline-flex items-center gap-2 text-[13px] no-underline transition-colors hover:opacity-80"
            style={{
              color: "#c89a5a",
              fontFamily: '"Cormorant Garamond", Georgia, serif',
              fontStyle: "italic",
              textDecoration: "none",
            }}
          >
            <ArrowLeft size={14} /> Back to the Library
          </Link>
          <button
            type="button"
            onClick={downloadAsPdf}
            data-testid="library-article-pdf"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-[12.5px] transition-all hover:scale-[1.03]"
            style={{
              background: "rgba(200, 154, 90, 0.14)",
              border: "1px solid rgba(200, 154, 90, 0.4)",
              color: "#7a5a26",
              fontFamily: '"Cormorant Garamond", Georgia, serif',
              letterSpacing: "0.04em",
            }}
          >
            <Printer size={13} strokeWidth={1.6} /> Save as PDF
          </button>
        </div>

        {/* Title */}
        <p
          className="text-[10.5px] tracking-[0.28em] uppercase mb-4"
          style={{ color: "#c89a5a" }}
        >
          Grace Library · {a.readingTime}
        </p>
        <h1
          className="leading-[1.05] mb-4"
          style={{
            color: "#2a1f12",
            fontFamily: '"Cormorant Garamond", Georgia, serif',
            fontWeight: 400,
            fontSize: "clamp(2.4rem, 4.4vw, 3.6rem)",
            letterSpacing: "-0.01em",
          }}
          data-testid="library-article-title"
        >
          {a.title}
        </h1>
        <p
          className="text-[18px] leading-[1.5] italic mb-8"
          style={{
            color: "#5a4a30",
            fontFamily: '"Cormorant Garamond", Georgia, serif',
          }}
        >
          {a.subtitle}
        </p>
        <div
          aria-hidden="true"
          className="mb-10"
          style={{
            width: "100px",
            height: "1px",
            background:
              "linear-gradient(90deg, #c89a5a 0%, transparent 100%)",
          }}
        />

        {/* 1. Opening Reflection */}
        <Block label="1 · Opening Reflection">
          <p style={proseStyle}>{a.opening}</p>
        </Block>

        {/* 2. Understanding The Pattern */}
        <Block label="2 · Understanding The Pattern">
          {a.pattern.map((p, i) => (
            <p key={i} style={proseStyle}>
              {p}
            </p>
          ))}
        </Block>

        {/* 3. A Different Perspective */}
        <Block label="3 · A Different Perspective">
          <div
            className="rounded-2xl p-6 md:p-7"
            style={{
              background: "rgba(255, 250, 240, 0.92)",
              border: "1px solid rgba(200, 154, 90, 0.25)",
              boxShadow: "0 6px 22px -12px rgba(120, 85, 50, 0.18)",
            }}
          >
            <Quote
              size={16}
              strokeWidth={1.5}
              style={{ color: "#c89a5a" }}
              className="mb-3"
            />
            <p
              className="italic"
              style={{
                ...proseStyle,
                fontSize: "18px",
                color: "#2a1f12",
                margin: 0,
              }}
            >
              {a.perspective}
            </p>
          </div>
        </Block>

        {/* 4. Questions To Sit With */}
        <Block label="4 · Questions To Sit With">
          <ul className="space-y-3 list-none p-0 m-0">
            {a.questions.map((q, i) => (
              <li
                key={i}
                data-testid={`library-question-${i}`}
                className="flex gap-3 items-start"
                style={proseStyle}
              >
                <span
                  className="flex-shrink-0 mt-[6px]"
                  style={{ color: "#c89a5a" }}
                  aria-hidden="true"
                >
                  ◦
                </span>
                <span>{q}</span>
              </li>
            ))}
          </ul>
        </Block>

        {/* 5. Small Next Step */}
        <Block label="5 · Small Next Step">
          <div
            className="rounded-2xl p-6 md:p-7"
            style={{
              background: "rgba(200, 154, 90, 0.08)",
              border: "1px solid rgba(200, 154, 90, 0.3)",
            }}
          >
            <p style={{ ...proseStyle, margin: 0 }}>{a.nextStep}</p>
          </div>
        </Block>

        {/* 6 + 7. CTAs */}
        <div
          className="mt-12 no-print grid grid-cols-1 sm:grid-cols-2 gap-4"
          data-testid="library-article-ctas"
        >
          <button
            type="button"
            onClick={speakWithGrace}
            data-testid="library-cta-speak"
            className="inline-flex items-center justify-center gap-2 px-6 py-4 rounded-full transition-all hover:scale-[1.02] hover:shadow-lg"
            style={{
              background: "#c89a5a",
              color: "#fdf8ef",
              fontFamily: '"Cormorant Garamond", Georgia, serif',
              fontSize: "14.5px",
              letterSpacing: "0.02em",
              boxShadow: "0 10px 32px -10px rgba(200, 154, 90, 0.7)",
            }}
          >
            <Mic size={15} strokeWidth={1.8} /> Speak with Grace about this
          </button>
          <button
            type="button"
            onClick={writeAboutThis}
            data-testid="library-cta-write"
            className="inline-flex items-center justify-center gap-2 px-6 py-4 rounded-full transition-all hover:scale-[1.02] hover:shadow-lg"
            style={{
              background: "rgba(253, 246, 232, 0.88)",
              border: "1px solid rgba(200, 154, 90, 0.45)",
              color: "#3d2f1f",
              fontFamily: '"Cormorant Garamond", Georgia, serif',
              fontSize: "14.5px",
              letterSpacing: "0.02em",
            }}
          >
            <Pen size={15} strokeWidth={1.8} /> Write about this
          </button>
        </div>

        <p
          className="mt-12 text-center text-[12.5px] italic no-print"
          style={{
            color: "#7a5a26",
            fontFamily: '"Cormorant Garamond", Georgia, serif',
          }}
        >
          <Heart size={11} className="inline-block mr-1" />
          Take what you need. Leave what you don&apos;t.
        </p>
      </article>

      {/* Print stylesheet — keeps the saved PDF clean and serif */}
      <style>{`
        @media print {
          [data-testid="site-header"],
          .no-print {
            display: none !important;
          }
          body, .print-article {
            background: #fdf8ef !important;
            color: #2a1f12 !important;
            box-shadow: none !important;
          }
          .print-article {
            max-width: 100% !important;
            padding: 0 !important;
          }
          /* Hide all the decorative background layers */
          .print-article > * { background: transparent !important; }
        }
      `}</style>
    </div>
  );
}

const proseStyle = {
  color: "#3d2f1f",
  fontSize: "16.5px",
  lineHeight: 1.8,
  fontFamily: '"Cormorant Garamond", Georgia, serif',
  margin: "0 0 14px 0",
};

function Block({ label, children }) {
  return (
    <section className="mb-10">
      <p
        className="text-[10.5px] tracking-[0.24em] uppercase mb-4"
        style={{ color: "#c89a5a" }}
      >
        {label}
      </p>
      {children}
    </section>
  );
}
