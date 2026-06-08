/**
 * grace/Speak.jsx — § GRACE / SPEAK 2026-02
 *
 * Founder spec (Anna, Estonian session): "Before We Begin" prompts,
 * four Conversation Paths (Feeling Overwhelmed / Relationship
 * Reflection / Self Reflection / Just Talk). Each path is a soft door
 * — clicking it sends the visitor into the actual voice/chat surface
 * at /grace/room with a topic hint, never to a children/Kids surface.
 */
import GraceSubPage, {
  GraceCard,
  GraceSection,
} from "@/components/grace/GraceSubPage";
import { Mic } from "lucide-react";

const PATHS = [
  {
    id: "overwhelmed",
    title: "Feeling Overwhelmed",
    lines: [
      "Too many responsibilities",
      "Emotional exhaustion",
      "Decision fatigue",
    ],
  },
  {
    id: "relationships",
    title: "Relationship Reflection",
    lines: ["Conflict", "Communication", "Boundaries"],
  },
  {
    id: "self",
    title: "Self Reflection",
    lines: ["Identity", "Purpose", "Personal growth"],
  },
  {
    id: "just-talk",
    title: "Just Talk",
    lines: ["No topic required", "Free conversation"],
  },
];

export default function Speak() {
  const enterChat = (topic) => {
    // Real Grace chat lives at /grace/room behind Wanderer's Gate.
    window.location.href = `/grace/room?topic=${encodeURIComponent(topic)}`;
  };

  return (
    <GraceSubPage
      testid="page-grace-speak"
      bgImage="/assets/grace/speak-bg.png"
      eyebrow="Speak With Grace"
      title="When words help more than silence."
      intro={
        "Some days, the inside is loud. Speaking it out — even to one quiet listener — is how it begins to settle. Grace listens. No advice unless you ask. No fixing. No hurry."
      }
      quote="You don't have to find the right words. You just have to start somewhere."
    >
      <GraceSection label="Before We Begin">
        <GraceCard
          testid="grace-speak-before-1"
          title="What feels most present today?"
        />
        <GraceCard
          testid="grace-speak-before-2"
          title="What brought you here?"
        />
      </GraceSection>

      <GraceSection label="Conversation Paths">
        {PATHS.map((p) => (
          <GraceCard
            key={p.id}
            testid={`grace-speak-path-${p.id}`}
            title={p.title}
            lines={p.lines}
            onClick={() => enterChat(p.id)}
          />
        ))}
      </GraceSection>

      <div className="mt-10 flex justify-center">
        <button
          type="button"
          onClick={() => enterChat("open")}
          data-testid="grace-speak-start-cta"
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
          Start speaking with Grace
          <Mic size={16} strokeWidth={1.8} />
        </button>
      </div>
    </GraceSubPage>
  );
}
