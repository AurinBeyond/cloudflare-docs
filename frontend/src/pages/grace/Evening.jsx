/**
 * grace/Evening.jsx — § GRACE / EVENING REFLECTION 2026-02
 *
 * Founder note: "this could be Grace's strongest surface."
 * Two layers: "Close The Day Gently" (5 questions) and the
 * "Evening Ritual" (5-step three-minute guide: Arrive / Breathe /
 * Notice / Release / Rest).
 */
import GraceSubPage, {
  GraceCard,
  GraceSection,
} from "@/components/grace/GraceSubPage";
import { Moon } from "lucide-react";

const QUESTIONS = [
  "What went well today?",
  "What felt difficult?",
  "What can you let go of?",
  "What deserves gratitude?",
  "What do you want to carry forward?",
];

const RITUAL = [
  { id: "arrive",  label: "Arrive",  text: "Sit. Let the day stop chasing you." },
  { id: "breathe", label: "Breathe", text: "Three slow breaths. Nothing more is asked." },
  { id: "notice",  label: "Notice",  text: "What is still in your body? Name it gently." },
  { id: "release", label: "Release", text: "What can be left at the door tonight?" },
  { id: "rest",    label: "Rest",    text: "You do not need to finish anything before sleep." },
];

export default function Evening() {
  const openReflection = (seed) => {
    window.location.href = `/grace/room?evening=${encodeURIComponent(seed)}`;
  };

  return (
    <GraceSubPage
      testid="page-grace-evening"
      bgImage="/assets/grace/evening-bg.png"
      eyebrow="Close The Day Gently"
      title="A soft ending, not a verdict."
      intro={
        "The day does not need to be summarised, judged, or solved. It needs to be set down. Pick one question, or walk the five-step ritual. Either is enough."
      }
      quote="The day asks nothing more of you. You are allowed to put it down now."
    >
      <GraceSection label="Five Questions">
        {QUESTIONS.map((q, i) => (
          <GraceCard
            key={i}
            testid={`grace-evening-q-${i}`}
            title={q}
            onClick={() => openReflection(q)}
          />
        ))}
      </GraceSection>

      <GraceSection label="Evening Ritual · three minutes">
        {RITUAL.map((r, i) => (
          <GraceCard
            key={r.id}
            testid={`grace-evening-step-${r.id}`}
            title={`${i + 1}. ${r.label}`}
            lines={[r.text]}
          />
        ))}
      </GraceSection>

      <div className="mt-10 flex justify-center">
        <button
          type="button"
          onClick={() => openReflection("ritual")}
          data-testid="grace-evening-start-cta"
          className="inline-flex items-center gap-3 px-8 py-4 rounded-full text-[15px] transition-all hover:scale-[1.03] hover:shadow-xl"
          style={{
            background: "#c89a5a",
            color: "#fdf8ef",
            fontFamily: '"Cormorant Garamond", Georgia, serif',
            fontWeight: 500,
            letterSpacing: "0.02em",
            boxShadow: "0 10px 32px -10px rgba(200, 154, 90, 0.7)",
          }}
        >
          Begin the ritual
          <Moon size={16} strokeWidth={1.8} />
        </button>
      </div>
    </GraceSubPage>
  );
}
