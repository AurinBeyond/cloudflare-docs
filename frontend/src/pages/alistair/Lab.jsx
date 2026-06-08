/**
 * alistair/Lab.jsx — § ONE LABORATORY (universal renderer) 2026-02
 *
 * One dynamic page renders any open lab. Single-scroll layout with
 * five sections (Explore / Read / Experiments / Notes / Library)
 * stacked on the same page — fewer clicks, full picture of the lab.
 *
 * If the lab is "coming-soon" we send the visitor back to the lab
 * catalogue.
 */
import { useParams, Link, Navigate } from "react-router-dom";
import {
  Compass,
  BookOpen,
  FlaskConical,
  StickyNote,
  BookOpen as LibraryIcon,
  ArrowRight,
  ArrowLeft,
  Mic,
} from "lucide-react";
import { LABS } from "@/data/alistairLabs";

export default function Lab() {
  const { labSlug } = useParams();
  const lab = LABS[labSlug];

  if (!lab || lab.status !== "open") {
    return <Navigate to="/course-room/laboratories" replace />;
  }

  const startConversation = () => {
    window.location.assign(`/course-room/room?lab=${lab.slug}`);
  };
  const exploreTopic = (topicId) => {
    window.location.assign(`/course-room/room?lab=${lab.slug}&topic=${topicId}`);
  };
  const tryExperiment = (expId) => {
    window.location.assign(`/course-room/room?lab=${lab.slug}&experiment=${expId}`);
  };

  return (
    <div
      data-testid={`page-lab-${lab.slug}`}
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
            "linear-gradient(180deg, rgba(245,235,215,0.86) 0%, rgba(245,235,215,0.78) 50%, rgba(245,235,215,0.92) 100%)",
        }}
      />

      <div className="relative z-[2] max-w-[860px] mx-auto px-5 md:px-8 py-10 md:py-14">
        <Link
          to="/course-room/laboratories"
          data-testid="lab-back"
          className="inline-flex items-center gap-2 text-[13px] no-underline transition-colors hover:opacity-80 mb-8"
          style={{
            color: lab.accent,
            fontFamily: '"Cormorant Garamond", Georgia, serif',
            fontStyle: "italic",
            textDecoration: "none",
          }}
        >
          <ArrowLeft size={14} /> Back to all laboratories
        </Link>

        {/* HERO */}
        <section className="text-center mb-12" data-testid="lab-hero">
          <div
            className="mx-auto w-20 h-20 rounded-full flex items-center justify-center text-[40px] mb-5"
            style={{
              background: lab.accentSoft,
              border: `1.5px solid ${lab.accent}`,
            }}
            aria-hidden="true"
          >
            {lab.emoji}
          </div>
          <p
            className="text-[10.5px] tracking-[0.28em] uppercase mb-3"
            style={{ color: lab.accent }}
          >
            Laboratory of Life
          </p>
          <h1
            className="leading-[1.05] mb-4"
            style={{
              color: "#2b1f0f",
              fontFamily: '"Cormorant Garamond", Georgia, serif',
              fontWeight: 400,
              fontSize: "clamp(2.4rem, 5vw, 3.8rem)",
              letterSpacing: "-0.01em",
            }}
            data-testid="lab-title"
          >
            {lab.name}
          </h1>
          <p
            className="text-[18px] leading-[1.5] italic mb-6 max-w-[560px] mx-auto"
            style={{ color: "#5b4226", fontFamily: '"Cormorant Garamond", Georgia, serif' }}
          >
            {lab.subtitle}
          </p>
          <div
            className="inline-block px-5 py-3 rounded-full"
            style={{
              background: lab.accentSoft,
              border: `1px solid ${lab.accent}55`,
            }}
          >
            <p
              className="text-[10.5px] tracking-[0.22em] uppercase mb-1"
              style={{ color: lab.accent }}
            >
              Core Question
            </p>
            <p
              className="text-[16px] italic"
              style={{ color: "#2b1f0f", fontFamily: '"Cormorant Garamond", Georgia, serif' }}
            >
              {lab.coreQuestion}
            </p>
          </div>
          <div className="mt-8">
            <button
              type="button"
              onClick={startConversation}
              data-testid="lab-primary-cta"
              className="inline-flex items-center gap-3 px-8 py-4 rounded-full text-[15px] transition-all hover:scale-[1.03] hover:shadow-xl"
              style={{
                background: lab.accent,
                color: "#fdf6e6",
                fontFamily: '"Cormorant Garamond", Georgia, serif',
                fontWeight: 500,
                letterSpacing: "0.02em",
                boxShadow: `0 10px 32px -10px ${lab.accent}b3`,
              }}
            >
              Start this laboratory with Alistair
              <Mic size={16} strokeWidth={1.8} />
            </button>
          </div>
        </section>

        {/* EXPLORE */}
        <Section icon={Compass} label="Explore" accent={lab.accent}>
          <div className="space-y-4">
            {lab.explore.map((e) => (
              <Card
                key={e.id}
                testid={`lab-explore-${e.id}`}
                title={e.title}
                blurb={e.blurb}
                cta="Explore this pattern"
                accent={lab.accent}
                onClick={() => exploreTopic(e.id)}
              />
            ))}
          </div>
        </Section>

        {/* READ */}
        <Section icon={BookOpen} label="Read" accent={lab.accent}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {lab.read.map((r) => (
              <div
                key={r.id}
                data-testid={`lab-read-${r.id}`}
                className="rounded-xl p-4"
                style={{
                  background: "rgba(252, 246, 232, 0.85)",
                  border: "1px solid rgba(176, 122, 63, 0.22)",
                }}
              >
                <p
                  className="text-[15px] leading-[1.45]"
                  style={{ color: "#2b1f0f", fontFamily: '"Cormorant Garamond", Georgia, serif' }}
                >
                  {r.title}
                </p>
              </div>
            ))}
          </div>
        </Section>

        {/* EXPERIMENTS */}
        <Section icon={FlaskConical} label="Experiments" accent={lab.accent}>
          <div className="space-y-4">
            {lab.experiments.map((x) => (
              <Card
                key={x.id}
                testid={`lab-experiment-${x.id}`}
                title={x.title}
                blurb={x.instruction}
                question={x.question}
                cta="Try this experiment"
                accent={lab.accent}
                onClick={() => tryExperiment(x.id)}
              />
            ))}
          </div>
        </Section>

        {/* NOTES */}
        <Section icon={StickyNote} label="Notes · questions to sit with" accent={lab.accent}>
          <div
            className="rounded-2xl p-6"
            style={{
              background: "rgba(252, 246, 232, 0.92)",
              border: "1px solid rgba(176, 122, 63, 0.25)",
            }}
          >
            <ul className="space-y-3 list-none p-0 m-0">
              {lab.notesQuestions.map((q, i) => (
                <li
                  key={i}
                  data-testid={`lab-note-q-${i}`}
                  className="flex gap-3 items-start"
                  style={{
                    color: "#3d2c14",
                    fontSize: "15px",
                    lineHeight: 1.7,
                    fontFamily: '"Cormorant Garamond", Georgia, serif',
                  }}
                >
                  <span style={{ color: lab.accent }} aria-hidden="true" className="mt-[6px]">◦</span>
                  <span>{q}</span>
                </li>
              ))}
            </ul>
          </div>
        </Section>

        {/* LIBRARY */}
        <Section icon={LibraryIcon} label="Library" accent={lab.accent}>
          <Link
            to={`/course-room/lab/${lab.slug}/library/${lab.libraryArticle.slug}`}
            data-testid="lab-library-card"
            className="block rounded-2xl p-6 transition-all hover:scale-[1.015] hover:shadow-lg no-underline"
            style={{
              background: "rgba(252, 246, 232, 0.92)",
              border: `1px solid ${lab.accent}`,
              boxShadow: "0 6px 22px -12px rgba(105, 72, 38, 0.2)",
              textDecoration: "none",
            }}
          >
            <p className="text-[10.5px] tracking-[0.22em] uppercase mb-1" style={{ color: lab.accent }}>
              {lab.libraryArticle.readingTime}
            </p>
            <p
              className="text-[20px] leading-tight mb-2"
              style={{
                color: "#2b1f0f",
                fontFamily: '"Cormorant Garamond", Georgia, serif',
                fontWeight: 500,
              }}
            >
              {lab.libraryArticle.title}
            </p>
            <p
              className="text-[14px] leading-[1.55] italic mb-3"
              style={{ color: "#5b4226", fontFamily: '"Cormorant Garamond", Georgia, serif' }}
            >
              {lab.libraryArticle.subtitle}
            </p>
            <span
              className="inline-flex items-center gap-1.5 text-[13px]"
              style={{
                color: lab.accent,
                fontFamily: '"Cormorant Garamond", Georgia, serif',
                fontStyle: "italic",
              }}
            >
              Open the paper <ArrowRight size={13} />
            </span>
          </Link>
        </Section>
      </div>
    </div>
  );
}

function Section({ icon: Icon, label, accent, children }) {
  return (
    <section className="mb-12">
      <div className="flex items-center gap-2 mb-5">
        <Icon size={15} strokeWidth={1.6} style={{ color: accent }} />
        <p
          className="text-[10.5px] tracking-[0.24em] uppercase"
          style={{ color: accent }}
        >
          {label}
        </p>
      </div>
      {children}
    </section>
  );
}

function Card({ testid, title, blurb, question, cta, accent, onClick }) {
  return (
    <button
      type="button"
      data-testid={testid}
      onClick={onClick}
      className="block w-full text-left rounded-2xl p-6 transition-all hover:scale-[1.015] hover:shadow-lg"
      style={{
        background: "rgba(252, 246, 232, 0.92)",
        border: "1px solid rgba(176, 122, 63, 0.25)",
        boxShadow: "0 6px 22px -12px rgba(105, 72, 38, 0.2)",
        cursor: "pointer",
      }}
    >
      <p
        className="text-[18px] leading-tight mb-2.5"
        style={{
          color: "#2b1f0f",
          fontFamily: '"Cormorant Garamond", Georgia, serif',
          fontWeight: 500,
        }}
      >
        {title}
      </p>
      {question && (
        <p
          className="text-[13.5px] italic mb-2.5"
          style={{ color: accent, fontFamily: '"Cormorant Garamond", Georgia, serif' }}
        >
          {question}
        </p>
      )}
      <p
        className="text-[14px] leading-[1.65] mb-3"
        style={{ color: "#5b4226", fontFamily: '"Cormorant Garamond", Georgia, serif' }}
      >
        {blurb}
      </p>
      <span
        className="inline-flex items-center gap-1.5 text-[13px]"
        style={{
          color: accent,
          fontFamily: '"Cormorant Garamond", Georgia, serif',
          fontStyle: "italic",
        }}
      >
        {cta} <ArrowRight size={13} />
      </span>
    </button>
  );
}
