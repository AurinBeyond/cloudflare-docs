/**
 * grace/Write.jsx — § GRACE / WRITE 2026-02
 *
 * Founder spec: Guided Prompts (5) + Journal sections (4). The journal
 * itself is light: clicking a prompt or a journal section sends the
 * visitor into /grace/room with a seed so the real writing surface
 * (encrypted, persisted) can pick it up. No client-side persistence
 * on this marketing surface.
 */
import GraceSubPage, {
  GraceCard,
  GraceSection,
} from "@/components/grace/GraceSubPage";
import { Pen } from "lucide-react";

const PROMPTS = [
  "What's taking up space in your mind?",
  "What are you carrying that isn't yours?",
  "What would you say if nobody judged you?",
  "What do you need more of?",
  "What can wait until tomorrow?",
];

const JOURNAL = [
  { id: "noticed",  label: "Today I Noticed" },
  { id: "felt",     label: "Today I Felt" },
  { id: "learned",  label: "Today I Learned" },
  { id: "tomorrow", label: "Tomorrow I Want" },
];

export default function Write() {
  const openWriting = (seed) => {
    window.location.href = `/grace/room?write=${encodeURIComponent(seed)}`;
  };

  return (
    <GraceSubPage
      testid="page-grace-write"
      bgImage="/assets/grace/write-bg.png"
      eyebrow="Private Writing Space"
      title="A page only you will read."
      intro={
        "There is no audience here. No grammar to fix, no opinion to defend. Choose a prompt, or write what's underneath everything. It stays yours."
      }
      quote="If words are easier on paper than out loud, this is the page for that."
    >
      <GraceSection label="Guided Prompts">
        {PROMPTS.map((p, i) => (
          <GraceCard
            key={i}
            testid={`grace-write-prompt-${i}`}
            title={p}
            onClick={() => openWriting(p)}
          />
        ))}
      </GraceSection>

      <GraceSection label="Journal">
        {JOURNAL.map((j) => (
          <GraceCard
            key={j.id}
            testid={`grace-write-journal-${j.id}`}
            title={j.label}
            onClick={() => openWriting(j.label)}
          />
        ))}
      </GraceSection>

      <div className="mt-10 flex justify-center">
        <button
          type="button"
          onClick={() => openWriting("blank")}
          data-testid="grace-write-start-cta"
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
          Open a blank page
          <Pen size={16} strokeWidth={1.8} />
        </button>
      </div>
    </GraceSubPage>
  );
}
