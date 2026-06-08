/**
 * alistair/Read.jsx — § ALISTAIR / READ 2026-02
 * Founder spec: same shape as Grace Write — but here the activity is
 * receiving (reading) rather than producing (writing). Long-form
 * reflections, organised by reading mood.
 */
import AlistairSubPage, { AlistairCard, AlistairSection } from "@/components/alistair/AlistairSubPage";
import { BookOpen } from "lucide-react";

const SHORT = [
  "Why the obvious question is rarely the useful one.",
  "What you stop noticing first when life accelerates.",
  "Three signs you are answering the wrong question.",
  "The cost of being right.",
  "What changes when you replace 'should' with 'might'.",
];

const LONG = [
  { id: "patterns-we-miss", label: "Patterns We Miss" },
  { id: "rooms-we-build",   label: "Rooms We Build Around Ourselves" },
  { id: "honest-data",      label: "What Honest Data Looks Like" },
  { id: "method-of-slow",   label: "The Method of Slow" },
];

export default function Read() {
  const openReading = (seed) => {
    window.location.href = `/course-room/room?read=${encodeURIComponent(seed)}`;
  };
  return (
    <AlistairSubPage
      testid="page-alistair-read"
      bgImage="/assets/alistair/alistair-light-bg.png"
      eyebrow="Reading Room"
      title="Slow reading is its own kind of thinking."
      intro="A reading practice is closer to a walking practice than to a study habit. Pick something. Take your time. Underline. Argue back. Return to it next week."
      quote="What you read once is information. What you return to is education."
    >
      <AlistairSection label="Short Pieces">
        {SHORT.map((p, i) => (
          <AlistairCard key={i} testid={`alistair-read-short-${i}`} title={p} onClick={() => openReading(p)} />
        ))}
      </AlistairSection>
      <AlistairSection label="Long-form Reflections">
        {LONG.map((j) => (
          <AlistairCard key={j.id} testid={`alistair-read-long-${j.id}`}
            title={j.label} onClick={() => openReading(j.label)} />
        ))}
      </AlistairSection>
      <div className="mt-10 flex justify-center">
        <button type="button" onClick={() => openReading("any")}
          data-testid="alistair-read-start-cta"
          className="inline-flex items-center gap-3 px-8 py-4 rounded-full text-[15px] transition-all hover:scale-[1.03] hover:shadow-xl"
          style={{ background: "#b07a3f", color: "#fdf6e6",
            fontFamily: '"Cormorant Garamond", Georgia, serif',
            fontWeight: 500, letterSpacing: "0.02em",
            boxShadow: "0 10px 32px -10px rgba(176, 122, 63, 0.7)" }}>
          Pick something to read
          <BookOpen size={16} strokeWidth={1.8} />
        </button>
      </div>
    </AlistairSubPage>
  );
}
