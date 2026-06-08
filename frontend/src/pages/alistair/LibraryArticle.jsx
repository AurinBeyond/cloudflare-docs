/**
 * alistair/LibraryArticle.jsx — § ALISTAIR LIBRARY ARTICLE 2026-02
 *
 * Same 7-block shape as Grace Library article, same browser-native
 * PDF export. Only the data source, the accent colour (honey-brown
 * instead of cream-gold), and the CTAs (Explore / Try It) differ.
 */
import { useParams, Link, Navigate } from "react-router-dom";
import { ArrowLeft, Compass, FlaskConical, Printer, Heart, Quote } from "lucide-react";
import { LIBRARY_ARTICLES } from "@/data/alistairLibrary";

export default function LibraryArticle() {
  const { slug } = useParams();
  const a = LIBRARY_ARTICLES[slug];
  if (!a) return <Navigate to="/course-room/library" replace />;

  const exploreThis = () => {
    window.location.href = `/course-room/room?topic=${encodeURIComponent(a.slug)}`;
  };
  const tryThis = () => {
    window.location.href = `/course-room/room?experiment=${encodeURIComponent(a.slug)}`;
  };
  const downloadAsPdf = () => window.print();

  return (
    <div data-testid="page-alistair-library-article"
      className="relative min-h-screen w-full overflow-hidden"
      style={{ backgroundColor: "#f3ead9" }}>
      <div aria-hidden="true" className="absolute inset-0 z-0"
        style={{ backgroundImage: 'url("/assets/alistair/alistair-light-bg.png")',
          backgroundSize: "cover", backgroundPosition: "center",
          filter: "blur(3px) brightness(0.94) saturate(0.96)" }} />
      <div aria-hidden="true" className="absolute inset-0 z-0"
        style={{ background:
          "linear-gradient(180deg, rgba(245,235,215,0.92) 0%, rgba(245,235,215,0.86) 50%, rgba(245,235,215,0.95) 100%)" }} />

      <article className="relative z-[2] max-w-[760px] mx-auto px-5 md:px-8 py-10 md:py-16 print-article">
        <div className="flex items-center justify-between mb-10 no-print">
          <Link to="/course-room/library" data-testid="alistair-library-article-back"
            className="inline-flex items-center gap-2 text-[13px] no-underline transition-colors hover:opacity-80"
            style={{ color: "#b07a3f", fontFamily: '"Cormorant Garamond", Georgia, serif',
              fontStyle: "italic", textDecoration: "none" }}>
            <ArrowLeft size={14} /> Back to the Library
          </Link>
          <button type="button" onClick={downloadAsPdf}
            data-testid="alistair-library-article-pdf"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-[12.5px] transition-all hover:scale-[1.03]"
            style={{ background: "rgba(176, 122, 63, 0.14)",
              border: "1px solid rgba(176, 122, 63, 0.4)", color: "#7a5a26",
              fontFamily: '"Cormorant Garamond", Georgia, serif', letterSpacing: "0.04em" }}>
            <Printer size={13} strokeWidth={1.6} /> Save as PDF
          </button>
        </div>

        <p className="text-[10.5px] tracking-[0.28em] uppercase mb-4" style={{ color: "#b07a3f" }}>
          Alistair Library · {a.readingTime}
        </p>
        <h1 className="leading-[1.05] mb-4"
          style={{ color: "#2b1f0f", fontFamily: '"Cormorant Garamond", Georgia, serif',
            fontWeight: 400, fontSize: "clamp(2.4rem, 4.4vw, 3.6rem)", letterSpacing: "-0.01em" }}
          data-testid="alistair-library-article-title">
          {a.title}
        </h1>
        <p className="text-[18px] leading-[1.5] italic mb-8"
          style={{ color: "#5b4226", fontFamily: '"Cormorant Garamond", Georgia, serif' }}>
          {a.subtitle}
        </p>
        <div aria-hidden="true" className="mb-10"
          style={{ width: "100px", height: "1px",
            background: "linear-gradient(90deg, #b07a3f 0%, transparent 100%)" }} />

        <Block label="1 · OPENING REFLECTION"><p style={proseStyle}>{a.opening}</p></Block>
        <Block label="2 · UNDERSTANDING THE PATTERN">
          {a.pattern.map((p, i) => <p key={i} style={proseStyle}>{p}</p>)}
        </Block>
        <Block label="3 · A DIFFERENT PERSPECTIVE">
          <div className="rounded-2xl p-6 md:p-7"
            style={{ background: "rgba(252, 246, 232, 0.92)",
              border: "1px solid rgba(176, 122, 63, 0.25)",
              boxShadow: "0 6px 22px -12px rgba(105, 72, 38, 0.18)" }}>
            <Quote size={16} strokeWidth={1.5} style={{ color: "#b07a3f" }} className="mb-3" />
            <p className="italic"
              style={{ ...proseStyle, fontSize: "18px", color: "#2b1f0f", margin: 0 }}>
              {a.perspective}
            </p>
          </div>
        </Block>
        <Block label="4 · QUESTIONS TO SIT WITH">
          <ul className="space-y-3 list-none p-0 m-0">
            {a.questions.map((q, i) => (
              <li key={i} data-testid={`alistair-library-question-${i}`}
                className="flex gap-3 items-start" style={proseStyle}>
                <span className="flex-shrink-0 mt-[6px]" style={{ color: "#b07a3f" }} aria-hidden="true">◦</span>
                <span>{q}</span>
              </li>
            ))}
          </ul>
        </Block>
        <Block label="5 · SMALL NEXT STEP">
          <div className="rounded-2xl p-6 md:p-7"
            style={{ background: "rgba(176, 122, 63, 0.08)",
              border: "1px solid rgba(176, 122, 63, 0.3)" }}>
            <p style={{ ...proseStyle, margin: 0 }}>{a.nextStep}</p>
          </div>
        </Block>

        <div className="mt-12 no-print grid grid-cols-1 sm:grid-cols-2 gap-4"
          data-testid="alistair-library-article-ctas">
          <button type="button" onClick={exploreThis}
            data-testid="alistair-library-cta-explore"
            className="inline-flex items-center justify-center gap-2 px-6 py-4 rounded-full transition-all hover:scale-[1.02] hover:shadow-lg"
            style={{ background: "#b07a3f", color: "#fdf6e6",
              fontFamily: '"Cormorant Garamond", Georgia, serif',
              fontSize: "14.5px", letterSpacing: "0.02em",
              boxShadow: "0 10px 32px -10px rgba(176, 122, 63, 0.7)" }}>
            <Compass size={15} strokeWidth={1.8} /> Explore this with Alistair
          </button>
          <button type="button" onClick={tryThis}
            data-testid="alistair-library-cta-try"
            className="inline-flex items-center justify-center gap-2 px-6 py-4 rounded-full transition-all hover:scale-[1.02] hover:shadow-lg"
            style={{ background: "rgba(250, 242, 224, 0.88)",
              border: "1px solid rgba(176, 122, 63, 0.45)", color: "#3d2c14",
              fontFamily: '"Cormorant Garamond", Georgia, serif',
              fontSize: "14.5px", letterSpacing: "0.02em" }}>
            <FlaskConical size={15} strokeWidth={1.8} /> Try this as an experiment
          </button>
        </div>

        <p className="mt-12 text-center text-[12.5px] italic no-print"
          style={{ color: "#7a5a26", fontFamily: '"Cormorant Garamond", Georgia, serif' }}>
          <Heart size={11} className="inline-block mr-1" />
          Take what you need. Argue with the rest.
        </p>
      </article>

      <style>{`
        @media print {
          [data-testid="site-header"], .no-print { display: none !important; }
          body, .print-article { background: #fdf6e6 !important; color: #2b1f0f !important; box-shadow: none !important; }
          .print-article { max-width: 100% !important; padding: 0 !important; }
          .print-article > * { background: transparent !important; }
        }
      `}</style>
    </div>
  );
}

const proseStyle = {
  color: "#3d2c14", fontSize: "16.5px", lineHeight: 1.8,
  fontFamily: '"Cormorant Garamond", Georgia, serif', margin: "0 0 14px 0",
};

function Block({ label, children }) {
  return (
    <section className="mb-10">
      <p className="text-[10.5px] tracking-[0.24em] uppercase mb-4" style={{ color: "#b07a3f" }}>
        {label}
      </p>
      {children}
    </section>
  );
}
