/**
 * alistair/LabArticle.jsx — § LAB LIBRARY ARTICLE 2026-02
 *
 * Renders the library PDF for one laboratory in the 8-block founder
 * shape:
 *   1. Opening Observation
 *   2. The Pattern
 *   3. What We Usually Miss
 *   4. A Different Question
 *   5. Questions To Sit With
 *   6. Small Experiment
 *   7. Explore with Alistair CTA
 *   8. Try This Experiment CTA
 *
 * Browser-native PDF export via window.print + a print stylesheet,
 * same approach as Grace Library.
 */
import { useParams, Link, Navigate } from "react-router-dom";
import { ArrowLeft, Compass, FlaskConical, Printer, Quote, Heart } from "lucide-react";
import { LABS } from "@/data/alistairLabs";

export default function LabArticle() {
  const { labSlug, slug } = useParams();
  const lab = LABS[labSlug];
  if (!lab || lab.status !== "open" || !lab.libraryArticle || lab.libraryArticle.slug !== slug) {
    return <Navigate to="/course-room/laboratories" replace />;
  }
  const a = lab.libraryArticle;
  const exploreThis = () => {
    window.location.href = `/course-room/room?lab=${lab.slug}&topic=${a.slug}`;
  };
  const tryThis = () => {
    window.location.href = `/course-room/room?lab=${lab.slug}&experiment=${a.slug}`;
  };
  const downloadAsPdf = () => window.print();

  return (
    <div
      data-testid="page-lab-article"
      className="relative min-h-screen w-full overflow-hidden"
      style={{ backgroundColor: "#f3ead9" }}
    >
      <div
        aria-hidden="true"
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: 'url("/assets/alistair/alistair-light-bg.png")',
          backgroundSize: "cover",
          backgroundPosition: "center",
          filter: "blur(3px) brightness(0.94) saturate(0.96)",
        }}
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 z-0"
        style={{
          background:
            "linear-gradient(180deg, rgba(245,235,215,0.94) 0%, rgba(245,235,215,0.88) 50%, rgba(245,235,215,0.95) 100%)",
        }}
      />

      <article className="relative z-[2] max-w-[760px] mx-auto px-5 md:px-8 py-10 md:py-16 print-article">
        <div className="flex items-center justify-between mb-10 no-print">
          <Link
            to={`/course-room/lab/${lab.slug}`}
            data-testid="lab-article-back"
            className="inline-flex items-center gap-2 text-[13px] no-underline transition-colors hover:opacity-80"
            style={{
              color: lab.accent,
              fontFamily: '"Cormorant Garamond", Georgia, serif',
              fontStyle: "italic",
              textDecoration: "none",
            }}
          >
            <ArrowLeft size={14} /> Back to the laboratory
          </Link>
          <button
            type="button"
            onClick={downloadAsPdf}
            data-testid="lab-article-pdf"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-[12.5px] transition-all hover:scale-[1.03]"
            style={{
              background: lab.accentSoft,
              border: `1px solid ${lab.accent}55`,
              color: "#7a5a26",
              fontFamily: '"Cormorant Garamond", Georgia, serif',
              letterSpacing: "0.04em",
            }}
          >
            <Printer size={13} strokeWidth={1.6} /> Save as PDF
          </button>
        </div>

        <p className="text-[10.5px] tracking-[0.28em] uppercase mb-4" style={{ color: lab.accent }}>
          {lab.emoji} {lab.name} · {a.readingTime}
        </p>
        <h1
          className="leading-[1.05] mb-4"
          style={{
            color: "#2b1f0f",
            fontFamily: '"Cormorant Garamond", Georgia, serif',
            fontWeight: 400,
            fontSize: "clamp(2.4rem, 4.4vw, 3.6rem)",
            letterSpacing: "-0.01em",
          }}
          data-testid="lab-article-title"
        >
          {a.title}
        </h1>
        <p
          className="text-[18px] leading-[1.5] italic mb-8"
          style={{ color: "#5b4226", fontFamily: '"Cormorant Garamond", Georgia, serif' }}
        >
          {a.subtitle}
        </p>
        <div
          aria-hidden="true"
          className="mb-10"
          style={{
            width: "100px",
            height: "1px",
            background: `linear-gradient(90deg, ${lab.accent} 0%, transparent 100%)`,
          }}
        />

        <Block label="1 · OPENING OBSERVATION" accent={lab.accent}>
          <p style={prose}>{a.opening}</p>
        </Block>

        <Block label="2 · THE PATTERN" accent={lab.accent}>
          {a.pattern.map((p, i) => (
            <p key={i} style={prose}>{p}</p>
          ))}
        </Block>

        <Block label="3 · WHAT WE USUALLY MISS" accent={lab.accent}>
          <div
            className="rounded-2xl p-6 md:p-7"
            style={{
              background: "rgba(252, 246, 232, 0.92)",
              border: `1px solid ${lab.accent}55`,
              boxShadow: "0 6px 22px -12px rgba(105, 72, 38, 0.18)",
            }}
          >
            <Quote size={16} strokeWidth={1.5} style={{ color: lab.accent }} className="mb-3" />
            <p
              className="italic"
              style={{ ...prose, fontSize: "17px", color: "#2b1f0f", margin: 0 }}
            >
              {a.missed}
            </p>
          </div>
        </Block>

        <Block label="4 · A DIFFERENT QUESTION" accent={lab.accent}>
          <p style={{ ...prose, fontSize: "17px", color: "#2b1f0f" }} className="italic">
            {a.differentQuestion}
          </p>
        </Block>

        <Block label="5 · QUESTIONS TO SIT WITH" accent={lab.accent}>
          <ul className="space-y-3 list-none p-0 m-0">
            {a.questions.map((q, i) => (
              <li
                key={i}
                data-testid={`lab-article-q-${i}`}
                className="flex gap-3 items-start"
                style={prose}
              >
                <span className="flex-shrink-0 mt-[6px]" style={{ color: lab.accent }} aria-hidden="true">◦</span>
                <span>{q}</span>
              </li>
            ))}
          </ul>
        </Block>

        <Block label="6 · SMALL EXPERIMENT" accent={lab.accent}>
          <div
            className="rounded-2xl p-6 md:p-7"
            style={{
              background: lab.accentSoft,
              border: `1px solid ${lab.accent}66`,
            }}
          >
            <p style={{ ...prose, margin: 0 }}>{a.smallExperiment}</p>
          </div>
        </Block>

        <div
          className="mt-12 no-print grid grid-cols-1 sm:grid-cols-2 gap-4"
          data-testid="lab-article-ctas"
        >
          <button
            type="button"
            onClick={exploreThis}
            data-testid="lab-article-cta-explore"
            className="inline-flex items-center justify-center gap-2 px-6 py-4 rounded-full transition-all hover:scale-[1.02] hover:shadow-lg"
            style={{
              background: lab.accent,
              color: "#fdf6e6",
              fontFamily: '"Cormorant Garamond", Georgia, serif',
              fontSize: "14.5px",
              letterSpacing: "0.02em",
              boxShadow: `0 10px 32px -10px ${lab.accent}b3`,
            }}
          >
            <Compass size={15} strokeWidth={1.8} /> Explore this with Alistair
          </button>
          <button
            type="button"
            onClick={tryThis}
            data-testid="lab-article-cta-try"
            className="inline-flex items-center justify-center gap-2 px-6 py-4 rounded-full transition-all hover:scale-[1.02] hover:shadow-lg"
            style={{
              background: "rgba(250, 242, 224, 0.88)",
              border: `1px solid ${lab.accent}73`,
              color: "#3d2c14",
              fontFamily: '"Cormorant Garamond", Georgia, serif',
              fontSize: "14.5px",
              letterSpacing: "0.02em",
            }}
          >
            <FlaskConical size={15} strokeWidth={1.8} /> Try this as an experiment
          </button>
        </div>

        <p
          className="mt-12 text-center text-[12.5px] italic no-print"
          style={{ color: "#7a5a26", fontFamily: '"Cormorant Garamond", Georgia, serif' }}
        >
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

const prose = {
  color: "#3d2c14",
  fontSize: "16.5px",
  lineHeight: 1.8,
  fontFamily: '"Cormorant Garamond", Georgia, serif',
  margin: "0 0 14px 0",
};

function Block({ label, accent, children }) {
  return (
    <section className="mb-10">
      <p className="text-[10.5px] tracking-[0.24em] uppercase mb-4" style={{ color: accent }}>
        {label}
      </p>
      {children}
    </section>
  );
}
