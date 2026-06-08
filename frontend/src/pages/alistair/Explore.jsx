/**
 * alistair/Explore.jsx — § ALISTAIR / EXPLORE 2026-02
 * Founder spec: five collections — same shape as Grace Speak's
 * "Conversation Paths" but framed as inquiries, not feelings.
 */
import AlistairSubPage, { AlistairCard, AlistairSection } from "@/components/alistair/AlistairSubPage";
import { Compass } from "lucide-react";

const COLLECTIONS = [
  { id: "old-stories", title: "Old Stories We Carry",
    lines: ["The narratives we inherited without noticing.", "The roles we play without choosing.", "What changes when the story does."] },
  { id: "language-we-forgot", title: "The Language We Forgot",
    lines: ["Words for things we feel but cannot name.", "How vocabulary shapes what we can see.", "Recovering the missing words."] },
  { id: "body-knows-first", title: "Why The Body Knows First",
    lines: ["The signals that arrive before the thought.", "Tension as information, not weakness.", "Reading what is already being told."] },
  { id: "search-for-meaning", title: "The Search For Meaning",
    lines: ["Meaning vs. purpose vs. usefulness.", "What stays when motivation leaves.", "Quiet sources of significance."] },
  { id: "learning-to-notice", title: "Learning To Notice",
    lines: ["Attention as a practice.", "Why the world rewards slow looking.", "The discipline of being interested."] },
];

export default function Explore() {
  const enterInquiry = (topic) => {
    window.location.href = `/course-room/room?topic=${encodeURIComponent(topic)}`;
  };
  return (
    <AlistairSubPage
      testid="page-alistair-explore"
      bgImage="/assets/alistair/alistair-light-bg.png"
      eyebrow="Explore With Alistair"
      title="A question, sat with long enough, often becomes its own answer."
      intro="Each collection is an inquiry, not a topic. Pick one that pulls on a thread inside you. There is no right one, and no wrong one. Curiosity will pick the right next page."
      quote="I don't give you answers. I help you notice the pattern."
    >
      <AlistairSection label="Collections">
        {COLLECTIONS.map((c) => (
          <AlistairCard key={c.id} testid={`alistair-explore-${c.id}`}
            title={c.title} lines={c.lines} onClick={() => enterInquiry(c.id)} />
        ))}
      </AlistairSection>
      <div className="mt-10 flex justify-center">
        <button type="button" onClick={() => enterInquiry("open")}
          data-testid="alistair-explore-start-cta"
          className="inline-flex items-center gap-3 px-8 py-4 rounded-full text-[15px] transition-all hover:scale-[1.03] hover:shadow-xl"
          style={{ background: "#b07a3f", color: "#fdf6e6",
            fontFamily: '"Cormorant Garamond", Georgia, serif',
            fontWeight: 500, letterSpacing: "0.02em",
            boxShadow: "0 10px 32px -10px rgba(176, 122, 63, 0.7)" }}>
          Start an open inquiry
          <Compass size={16} strokeWidth={1.8} />
        </button>
      </div>
    </AlistairSubPage>
  );
}
