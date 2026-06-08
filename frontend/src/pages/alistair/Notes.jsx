/**
 * alistair/Notes.jsx — § ALISTAIR / NOTES 2026-02
 * Founder spec: the personal observation log — equivalent of Grace's
 * "My Messages" but framed for intellectual capture (questions,
 * patterns, insights) rather than emotional conversation history.
 */
import AlistairSubPage, { AlistairCard, AlistairSection } from "@/components/alistair/AlistairSubPage";
import { StickyNote } from "lucide-react";

const SECTIONS = [
  { id: "observations", title: "Personal Observations",
    lines: ["What you have noticed about yourself this week."] },
  { id: "questions",    title: "Open Questions",
    lines: ["Questions still alive in you. Not solved — useful."] },
  { id: "patterns",     title: "Patterns Noticed",
    lines: ["Repetitions worth a second look."] },
  { id: "insights",     title: "Insights Worth Keeping",
    lines: ["The lines that landed. Quiet but lasting."] },
];

const FIELD_KIT = [
  "Pocket notebook for observations.",
  "Single question of the week.",
  "Weekly walk + 10-minute write-up.",
  "Date everything. Future-you reads it.",
];

export default function Notes() {
  const open = (section) => {
    window.location.href = `/course-room/room?view=${encodeURIComponent(section)}`;
  };
  return (
    <AlistairSubPage
      testid="page-alistair-notes"
      bgImage="/assets/alistair/alistair-light-bg.png"
      eyebrow="Field Notes"
      title="The note you take today is the friend you will meet next year."
      intro="Nothing here is shared, sold, or shown to anyone else. Your observations, questions, and small insights live here, quietly, for you to come back to and to be slowly surprised by."
      quote="You become more honest the moment you start writing things down."
    >
      <AlistairSection label="Your Field Notes">
        {SECTIONS.map((s) => (
          <AlistairCard key={s.id} testid={`alistair-notes-${s.id}`}
            title={s.title} lines={s.lines} onClick={() => open(s.id)} />
        ))}
      </AlistairSection>
      <AlistairSection label="Field Kit">
        <AlistairCard testid="alistair-notes-kit" title="What you'll find useful" lines={FIELD_KIT} />
      </AlistairSection>
      <div className="mt-10 flex justify-center">
        <button type="button" onClick={() => open("all")}
          data-testid="alistair-notes-open-cta"
          className="inline-flex items-center gap-3 px-8 py-4 rounded-full text-[15px] transition-all hover:scale-[1.03] hover:shadow-xl"
          style={{ background: "#b07a3f", color: "#fdf6e6",
            fontFamily: '"Cormorant Garamond", Georgia, serif',
            fontWeight: 500, letterSpacing: "0.02em",
            boxShadow: "0 10px 32px -10px rgba(176, 122, 63, 0.7)" }}>
          Open everything I&apos;ve noticed
          <StickyNote size={16} strokeWidth={1.8} />
        </button>
      </div>
    </AlistairSubPage>
  );
}
